
import { UserStats, Game, Platform, Friend, ActivityEvent, ActivityType } from '../types';

/**
 * NEXUS CLOUD CORE - Universal Env Edition
 * Detecta chaves de ambiente de múltiplos padrões (Vercel, Vite, React App).
 */

const getEnv = (key: string) => {
  // Tenta pegar de várias formas possíveis que os bundlers injetam
  return (process.env as any)[key] || 
         (process.env as any)[`VITE_${key}`] || 
         (process.env as any)[`REACT_APP_${key}`] || 
         (process.env as any)[`PUBLIC_${key}`] ||
         localStorage.getItem(`nexus_cloud_${key.toLowerCase()}`);
};

let SUPABASE_URL = getEnv('SUPABASE_URL') || 'https://xdwzlvnzgibgebcyxusy.supabase.co'; 
let SUPABASE_KEY = getEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkd3psdm56Z2liZ2ViY3l4dXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5Mjg3NDQsImV4cCI6MjA4NDUwNDc0NH0.aQMfT_Zq5UiCMAnJc3YwH2-1Gnn0r9peSzdYb3SpChM';

const headers = () => ({
  'apikey': SUPABASE_KEY,
  'Content-Type': 'application/json'
});

const authHeaders = (token?: string) => ({
  ...headers(),
  'Authorization': `Bearer ${token || SUPABASE_KEY}`
});

export const nexusCloud = {
  isCloudActive() {
    // Retorna true se a URL não for a padrão ou se houver variáveis de ambiente setadas
    return !!SUPABASE_URL && (!SUPABASE_URL.includes('SUA_URL') || !!getEnv('SUPABASE_URL'));
  },

  updateConfig(url: string, key: string) {
    SUPABASE_URL = url;
    SUPABASE_KEY = key;
    localStorage.setItem('nexus_cloud_url', url);
    localStorage.setItem('nexus_cloud_key', key);
  },

  async ping(): Promise<boolean> {
    if (!this.isCloudActive()) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?limit=1`, {
        method: 'GET',
        headers: authHeaders()
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  async requestSignup(emailRaw: string, password: string, nexusId: string): Promise<void> {
    const email = emailRaw.toLowerCase().trim();
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        email,
        password,
        options: { data: { nexus_id: nexusId } }
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.error_description || "Erro ao iniciar cadastro.");
  },

  async signup(emailRaw: string, password: string, nexusId: string): Promise<UserStats> {
    await this.requestSignup(emailRaw, password, nexusId);
    return this.createInitialUser(nexusId);
  },

  async verifyEmailToken(email: string, token: string): Promise<any> {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, token, type: 'signup' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || "Código de verificação inválido.");
    return data;
  },

  async finalizeProfile(session: any, nexusId: string): Promise<UserStats> {
    const email = session.user.email;
    const stats = this.createInitialUser(nexusId);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        ...authHeaders(session.access_token),
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify({
        nexus_id: nexusId,
        email: email,
        total_hours: 0,
        total_achievements: 0,
        updated_at: new Date().toISOString()
      })
    });
    localStorage.setItem('nexus_active_session', email);
    localStorage.setItem(`nexus_db_user_${email.toLowerCase()}`, JSON.stringify(stats));
    localStorage.setItem(`nexus_access_token`, session.access_token);
    return stats;
  },

  async login(identifierRaw: string, password?: string): Promise<UserStats> {
    const input = identifierRaw.trim().toLowerCase();
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email: input, password })
    });
    const authData = await res.json();
    if (!res.ok) throw new Error(authData.error_description || "Credenciais inválidas.");
    const token = authData.access_token;
    localStorage.setItem('nexus_access_token', token);
    localStorage.setItem('nexus_active_session', authData.user.email);
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${authData.user.email}&select=*`, {
      headers: authHeaders(token)
    });
    if (profileRes.ok) {
      const profiles = await profileRes.json();
      if (profiles.length > 0) {
        const stats = this.mapRemoteProfile(profiles[0]);
        localStorage.setItem(`nexus_db_user_${authData.user.email.toLowerCase()}`, JSON.stringify(stats));
        return stats;
      }
    }
    return this.createInitialUser(authData.user.user_metadata.nexus_id || input);
  },

  async saveUser(stats: UserStats): Promise<void> {
    const email = localStorage.getItem('nexus_active_session')?.toLowerCase();
    const token = localStorage.getItem('nexus_access_token');
    if (!email || !token) return;
    localStorage.setItem(`nexus_db_user_${email}`, JSON.stringify(stats));
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
            method: 'POST',
            headers: { ...authHeaders(token), 'Prefer': 'resolution=merge-duplicates' },
            body: JSON.stringify({
                nexus_id: stats.nexusId,
                email: email,
                total_hours: stats.totalHours,
                total_achievements: stats.totalAchievements,
                updated_at: new Date().toISOString()
            })
        });
    } catch (e) { console.error("Cloud sync failed"); }
  },

  async getActiveSession(): Promise<UserStats | null> {
    const email = localStorage.getItem('nexus_active_session');
    const token = localStorage.getItem('nexus_access_token');
    if (!email || !token) return null;
    try {
        const local = localStorage.getItem(`nexus_db_user_${email.toLowerCase()}`);
        if (local) return JSON.parse(local);
        return null;
    } catch (e) { return null; }
  },

  async getUser(nexusId: string): Promise<UserStats | null> {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?nexus_id=ilike.${nexusId}`, { headers: authHeaders() });
        if (res.ok) {
            const profiles = await res.json();
            if (profiles && profiles.length > 0) return this.mapRemoteProfile(profiles[0]);
        }
    } catch (e) { return null; }
    return null;
  },

  async searchGlobalUsers(query: string): Promise<Friend[]> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?nexus_id=ilike.*${query}*&limit=10`, { headers: authHeaders() });
      if (res.ok) {
         const profiles = await res.json();
         return profiles.map((p: any) => ({
             id: p.nexus_id,
             nexusId: p.nexus_id,
             username: p.nexus_id.replace('@', ''),
             avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.nexus_id}`,
             status: 'online',
             totalTrophies: p.total_achievements || 0,
             totalHours: p.total_hours || 0,
             gamesOwned: p.games_owned || 0,
             topGenres: ['Gamer'],
             compatibilityScore: 50
         }));
      }
    } catch (e) { return []; }
    return [];
  },

  async getFriends(nexusId: string): Promise<Friend[]> {
    const data = localStorage.getItem(`nexus_friends_${nexusId}`);
    return data ? JSON.parse(data) : [];
  },

  async addFriend(nexusId: string, friend: Friend): Promise<void> {
    const friends = await this.getFriends(nexusId);
    if (!friends.find(f => f.nexusId === friend.nexusId)) {
      const updated = [...friends, friend];
      localStorage.setItem(`nexus_friends_${nexusId}`, JSON.stringify(updated));
    }
  },

  async getGlobalFeed(): Promise<ActivityEvent[]> { return []; },

  async listAllCloudUsers(): Promise<any[]> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=email,nexus_id,updated_at&order=updated_at.desc`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Erro de acesso.");
      return await res.json();
    } catch (e: any) { throw e; }
  },

  mapRemoteProfile(p: any): UserStats {
     const base = this.createInitialUser(p.nexus_id);
     return {
         ...base,
         totalHours: p.total_hours || 0,
         totalAchievements: p.total_achievements || 0,
         platinumCount: p.platinum_count || 0,
         gamesOwned: p.games_owned || 0,
     };
  },

  createInitialUser(nexusId: string): UserStats {
    return {
      nexusId: nexusId.startsWith('@') ? nexusId : `@${nexusId}`,
      totalHours: 0,
      totalAchievements: 0,
      platinumCount: 0,
      prestigePoints: 100,
      gamesOwned: 0,
      platformsConnected: [],
      linkedAccounts: [],
      recentGames: [],
      journalEntries: [],
      genreDistribution: [],
      platformDistribution: [],
      consistency: { currentStreak: 0, longestStreak: 0, longestSession: 0, avgSessionLength: 0, totalSessions: 0 },
      weeklyActivity: [],
      monthlyActivity: [],
      skills: [
        { subject: 'Reflexes', A: 50, fullMark: 100 },
        { subject: 'Strategy', A: 50, fullMark: 100 },
        { subject: 'Resilience', A: 50, fullMark: 100 },
        { subject: 'Teamwork', A: 50, fullMark: 100 },
        { subject: 'Completion', A: 50, fullMark: 100 },
        { subject: 'Versatility', A: 50, fullMark: 100 },
      ]
    };
  }
};
