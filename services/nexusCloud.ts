
import { UserStats, Game, Platform, Friend, ActivityEvent, ActivityType } from '../types';
import { MOCK_USER_STATS, MOCK_AMIGO_STATS } from './mockData';

// Helper para normalizar Nexus ID: sempre minúsculo e com @
const normalizeId = (id: string) => {
  if (!id) return "@usuario";
  // Se for um email, tenta pegar apenas a parte antes do @
  let clean = id.trim().toLowerCase();
  if (clean.includes('@') && !clean.startsWith('@')) {
    clean = clean.split('@')[0];
  }
  clean = clean.replace(/^@/, '');
  return `@${clean}`;
};

const getEnv = (key: string) => {
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
    return !!SUPABASE_URL && (!SUPABASE_URL.includes('SUA_URL') || !!getEnv('SUPABASE_URL'));
  },

  updateConfig(url: string, key: string) {
    SUPABASE_URL = url;
    SUPABASE_KEY = key;
    localStorage.setItem('nexus_cloud_url', url);
    localStorage.setItem('nexus_cloud_key', key);
  },

  async signup(emailRaw: string, password: string, nexusId: string): Promise<UserStats> {
    const email = emailRaw.toLowerCase().trim();
    const nId = normalizeId(nexusId);
    
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        email,
        password,
        options: { data: { nexus_id: nId } }
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.error_description || "Erro ao iniciar cadastro.");
    
    return this.createInitialUser(nId);
  },

  async finalizeProfile(session: any, nexusId: string): Promise<UserStats> {
    const email = session.user.email.toLowerCase();
    const nId = normalizeId(nexusId);
    const stats = this.createInitialUser(nId);
    
    // Tenta salvar o perfil no banco remoto
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          ...authHeaders(session.access_token),
          'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify({
          nexus_id: nId,
          email: email,
          total_hours: 0,
          total_achievements: 0,
          updated_at: new Date().toISOString()
        })
      });
    } catch (e) {
      console.warn("Nexus Cloud: Falha ao persistir perfil remoto, mantendo local.");
    }

    localStorage.setItem('nexus_active_session', email);
    localStorage.setItem(`nexus_db_user_${email}`, JSON.stringify(stats));
    localStorage.setItem(`nexus_access_token`, session.access_token);
    return stats;
  },

  async login(identifierRaw: string, password?: string): Promise<UserStats> {
    const input = identifierRaw.trim().toLowerCase();
    
    if (input === 'apocaliptc' || input === '@apocaliptc' || input.includes('apocaliptc')) {
       const local = localStorage.getItem(`nexus_db_user_${input}`);
       if (local) return JSON.parse(local);
       return MOCK_USER_STATS;
    }
    if (input === 'amigo_imaginário' || input === '@amigo_imaginário' || input.includes('amigo')) {
       const local = localStorage.getItem(`nexus_db_user_${input}`);
       if (local) return JSON.parse(local);
       return MOCK_AMIGO_STATS;
    }

    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email: input, password })
    });
    const authData = await res.json();
    if (!res.ok) throw new Error(authData.error_description || "Credenciais inválidas.");
    
    const token = authData.access_token;
    const email = authData.user.email.toLowerCase();
    
    localStorage.setItem('nexus_access_token', token);
    localStorage.setItem('nexus_active_session', email);

    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${email}&select=*`, {
      headers: authHeaders(token)
    });

    let stats: UserStats;
    if (profileRes.ok) {
      const profiles = await profileRes.json();
      const local = localStorage.getItem(`nexus_db_user_${email}`);
      if (profiles.length > 0) {
        stats = this.mapRemoteProfile(profiles[0]);
        if (local) {
          const localData = JSON.parse(local);
          stats = { ...localData, ...stats, nexusId: profiles[0].nexus_id || localData.nexusId };
        }
      } else {
        const localData = local ? JSON.parse(local) : null;
        stats = this.createInitialUser(normalizeId(localData?.nexusId || authData.user.user_metadata.nexus_id || email));
      }
    } else {
      const local = localStorage.getItem(`nexus_db_user_${email}`);
      if (local) {
          stats = JSON.parse(local);
      } else {
          stats = this.createInitialUser(normalizeId(email));
      }
    }

    localStorage.setItem(`nexus_db_user_${email}`, JSON.stringify(stats));
    return stats;
  },

  async saveUser(stats: UserStats): Promise<void> {
    const sessionEmail = localStorage.getItem('nexus_active_session')?.toLowerCase();
    const token = localStorage.getItem('nexus_access_token');
    const storageKey = sessionEmail || stats.nexusId.toLowerCase();
    
    localStorage.setItem(`nexus_db_user_${storageKey}`, JSON.stringify(stats));
    
    if (!token || !sessionEmail || token.startsWith('mock_')) return;

    try {
        await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
            method: 'POST',
            headers: { ...authHeaders(token), 'Prefer': 'resolution=merge-duplicates' },
            body: JSON.stringify({
                nexus_id: stats.nexusId,
                email: sessionEmail,
                total_hours: stats.totalHours,
                total_achievements: stats.totalAchievements,
                platinum_count: stats.platinumCount,
                updated_at: new Date().toISOString()
            })
        });
    } catch (e) {
        console.warn("Cloud sync deferred - saved locally.");
    }
  },

  async getActiveSession(): Promise<UserStats | null> {
    const email = localStorage.getItem('nexus_active_session')?.toLowerCase();
    if (email) {
        const local = localStorage.getItem(`nexus_db_user_${email}`);
        if (local) return JSON.parse(local);
        if (email.includes('apocaliptc')) return MOCK_USER_STATS;
        if (email.includes('amigo')) return MOCK_AMIGO_STATS;
    }
    return null;
  },

  async getUser(nexusId: string): Promise<UserStats | null> {
    const nId = normalizeId(nexusId);
    const local = localStorage.getItem(`nexus_db_user_${nId.toLowerCase()}`);
    if (local) return JSON.parse(local);

    if (nId === '@apocaliptc') return MOCK_USER_STATS;
    if (nId === '@amigo_imaginário') return MOCK_AMIGO_STATS;

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?nexus_id=ilike.${nId}`, { headers: authHeaders() });
        if (res.ok) {
            const profiles = await res.json();
            if (profiles && profiles.length > 0) return this.mapRemoteProfile(profiles[0]);
        }
    } catch (e) { return null; }
    return null;
  },

  mapRemoteProfile(p: any): UserStats {
     const base = this.createInitialUser(p.nexus_id);
     return {
         ...base,
         nexusId: p.nexus_id || base.nexusId,
         totalHours: p.total_hours || 0,
         totalAchievements: p.total_achievements || 0,
         platinumCount: p.platinum_count || 0,
         gamesOwned: p.games_owned || 0,
     };
  },

  createInitialUser(nexusId: string): UserStats {
    const nId = normalizeId(nexusId);
    return {
      nexusId: nId,
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
  },

  async requestSignup(email: string, pass: string, nId: string) {
    const emailNorm = email.toLowerCase().trim();
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        email: emailNorm,
        password: pass,
        options: { data: { nexus_id: normalizeId(nId) } }
      })
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.msg || data.error_description || "Erro no cadastro.");
    }
  },

  async verifyEmailToken(email: string, token: string) {
    // BYPASS PARA TESTES EM AMBIENTE ALPHA
    if (token === '123456') {
      return {
        user: { email: email.toLowerCase() },
        access_token: 'mock_session_' + Date.now()
      };
    }

    const res = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, token, type: 'signup' })
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error_description || "Código inválido.");
    }
    return await res.json();
  },

  async addFriend(myNexusId: string, friend: Friend): Promise<Friend[]> {
    const nId = normalizeId(myNexusId);
    const friends = await this.getFriends(nId);
    if (!friends.find(f => normalizeId(f.nexusId) === normalizeId(friend.nexusId))) {
      const updated = [...friends, friend];
      localStorage.setItem(`nexus_friends_${nId.toLowerCase()}`, JSON.stringify(updated));
      return updated;
    }
    return friends;
  },

  async getFriends(nexusId: string): Promise<Friend[]> {
    const nId = normalizeId(nexusId);
    const data = localStorage.getItem(`nexus_friends_${nId.toLowerCase()}`);
    const localFriends = data ? JSON.parse(data) : [];
    if (localFriends.length === 0) {
        if (nId === '@apocaliptc') return [this.mapStatsToFriend(MOCK_AMIGO_STATS)];
        if (nId === '@amigo_imaginário') return [this.mapStatsToFriend(MOCK_USER_STATS)];
    }
    return localFriends;
  },

  async removeFriend(myNexusId: string, friendNexusId: string): Promise<Friend[]> {
    const nId = normalizeId(myNexusId);
    const friends = await this.getFriends(nId);
    const updated = friends.filter(f => normalizeId(f.nexusId) !== normalizeId(friendNexusId));
    localStorage.setItem(`nexus_friends_${nId.toLowerCase()}`, JSON.stringify(updated));
    return updated;
  },

  mapStatsToFriend(stats: UserStats): Friend {
    return {
        id: stats.nexusId,
        nexusId: stats.nexusId,
        username: stats.nexusId.replace('@', ''),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${stats.nexusId}`,
        status: 'online',
        totalTrophies: stats.totalAchievements,
        platinumCount: stats.platinumCount,
        totalHours: stats.totalHours,
        gamesOwned: stats.recentGames.length,
        topGenres: stats.genreDistribution.map(g => g.name),
        compatibilityScore: 100
    };
  },

  async searchGlobalUsers(query: string): Promise<Friend[]> {
    const q = query.toLowerCase();
    const results: Friend[] = [];

    if (q.includes('apoc')) results.push(this.mapStatsToFriend(MOCK_USER_STATS));
    if (q.includes('amigo')) results.push(this.mapStatsToFriend(MOCK_AMIGO_STATS));

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?nexus_id=ilike.*${query}*&limit=10`, { headers: authHeaders() });
      if (res.ok) {
         const profiles = await res.json();
         profiles.forEach((p: any) => {
             const nId = normalizeId(p.nexus_id);
             if (!results.find(r => r.nexusId === nId)) {
                 results.push({
                    id: nId,
                    nexusId: nId,
                    username: nId.replace('@', ''),
                    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nId}`,
                    status: 'online',
                    totalTrophies: p.total_achievements || 0,
                    platinumCount: p.platinum_count || 0,
                    totalHours: p.total_hours || 0,
                    gamesOwned: p.games_owned || 0,
                    topGenres: ['Gamer'],
                    compatibilityScore: 50
                 });
             }
         });
      }
    } catch (e) {}
    return results;
  },

  async listAllCloudUsers(): Promise<any[]> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=email,nexus_id,updated_at&order=updated_at.desc`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Erro de acesso.");
    return await res.json();
  }
};
