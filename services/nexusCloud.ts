
import { UserStats, Game, Platform, Friend, ActivityEvent, ActivityType, JournalEntry } from '../types';

/**
 * NEXUS CLOUD CORE
 * Sistema de persistência unificado. Utiliza Supabase via variáveis de ambiente.
 */

const DB_CONFIG = {
  url: (import.meta as any).env?.VITE_SUPABASE_URL || (window as any).process?.env?.VITE_SUPABASE_URL || '',
  key: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (window as any).process?.env?.VITE_SUPABASE_ANON_KEY || '',
  get isActive() { return !!this.url && !!this.key; }
};

const headers = () => ({
  'apikey': DB_CONFIG.key,
  'Authorization': `Bearer ${DB_CONFIG.key}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

export const nexusCloud = {
  isCloudActive() {
    return DB_CONFIG.isActive;
  },

  updateConfig(url: string, key: string) {
    DB_CONFIG.url = url;
    DB_CONFIG.key = key;
  },

  async signup(email: string, password: string, nexusId: string): Promise<UserStats> {
    const stats = this.createInitialUser(nexusId);
    localStorage.setItem(`nexus_auth_${email}`, JSON.stringify({ email, password, nexusId }));
    localStorage.setItem('nexus_active_session', email);
    
    if (DB_CONFIG.isActive) {
        await this.saveUser(stats);
    } else {
        localStorage.setItem(`nexus_db_user_${email}`, JSON.stringify(stats));
    }
    return stats;
  },

  async login(email: string, password?: string): Promise<UserStats> {
    const authData = localStorage.getItem(`nexus_auth_${email}`);
    
    // Se já existe localmente, apenas valida a senha e retorna
    if (authData) {
        const auth = JSON.parse(authData);
        if (password && auth.password !== password) throw new Error("Senha incorreta.");
        localStorage.setItem('nexus_active_session', email);
        const stats = await this.getLocalData(email) || this.createInitialUser(auth.nexusId);
        return stats;
    }

    // Se não existe localmente (Novo Navegador), busca na nuvem
    if (DB_CONFIG.isActive) {
      try {
        const res = await fetch(`${DB_CONFIG.url}/rest/v1/profiles?email=eq.${email}`, { headers: headers() });
        const profiles = await res.json();
        
        if (profiles && profiles.length > 0) {
            const remoteProfile = profiles[0];
            const stats = this.mapRemoteProfile(remoteProfile);
            
            // Importante: Salva as credenciais básicas e a sessão no novo navegador
            localStorage.setItem(`nexus_auth_${email}`, JSON.stringify({ email, password: password || '', nexusId: stats.nexusId }));
            localStorage.setItem('nexus_active_session', email);
            localStorage.setItem(`nexus_db_user_${email}`, JSON.stringify(stats));
            
            return stats;
        }
      } catch (e) {
        console.error("Nexus Cloud: Falha crítica na busca remota", e);
        throw new Error("Erro de conexão com a Nuvem Nexus.");
      }
    }

    throw new Error("Usuário não encontrado. Verifique suas credenciais.");
  },

  async saveUser(stats: UserStats): Promise<void> {
    const email = localStorage.getItem('nexus_active_session');
    if (email) localStorage.setItem(`nexus_db_user_${email}`, JSON.stringify(stats));
    
    if (!DB_CONFIG.isActive) return;

    try {
      await fetch(`${DB_CONFIG.url}/rest/v1/profiles`, {
        method: 'POST',
        headers: { ...headers(), 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({
          nexus_id: stats.nexusId,
          email: email,
          total_hours: stats.totalHours,
          total_achievements: stats.totalAchievements,
          platinum_count: stats.platinumCount,
          prestige_points: stats.prestigePoints,
          games_owned: stats.gamesOwned,
          linked_accounts: stats.linkedAccounts,
          platforms_connected: stats.platformsConnected,
          updated_at: new Date().toISOString()
        })
      });
    } catch (e) {
      console.warn("Nexus Cloud: Sincronização falhou.", e);
    }
  },

  async getActiveSession(): Promise<UserStats | null> {
    const email = localStorage.getItem('nexus_active_session');
    if (!email) return null;
    try {
        return await this.login(email);
    } catch {
        return null;
    }
  },

  async getUser(nexusId: string): Promise<UserStats | null> {
    if (DB_CONFIG.isActive) {
        try {
            const res = await fetch(`${DB_CONFIG.url}/rest/v1/profiles?nexus_id=eq.${nexusId}`, { headers: headers() });
            const profiles = await res.json();
            if (profiles && profiles.length > 0) return this.mapRemoteProfile(profiles[0]);
        } catch (e) { return null; }
    }
    return null;
  },

  async searchGlobalUsers(query: string): Promise<Friend[]> {
    if (DB_CONFIG.isActive) {
       try {
         const res = await fetch(`${DB_CONFIG.url}/rest/v1/profiles?nexus_id=ilike.*${query}*&limit=10`, { headers: headers() });
         const profiles = await res.json();
         return profiles.map((p: any) => ({
            id: p.nexus_id,
            nexusId: p.nexus_id,
            username: p.nexus_id.replace('@', ''),
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.nexus_id}`,
            status: 'online',
            totalTrophies: p.total_achievements,
            platinumCount: p.platinum_count,
            totalHours: p.total_hours,
            gamesOwned: p.games_owned,
            topGenres: ['Gamer'],
            compatibilityScore: 50
         }));
       } catch (e) { return []; }
    }
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

  async getGlobalFeed(): Promise<ActivityEvent[]> {
    return [
      {
        id: 'f1',
        type: ActivityType.PLATINUM,
        userId: 'u1',
        username: 'Faker',
        userAvatar: 'https://i.pravatar.cc/150?u=faker',
        timestamp: new Date().toISOString(),
        details: { gameTitle: 'League of Legends', gameCover: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg' },
        likes: 15400,
        comments: 890,
        hasLiked: false
      }
    ];
  },

  mapRemoteProfile(p: any): UserStats {
     const base = this.createInitialUser(p.nexus_id);
     return {
         ...base,
         totalHours: p.total_hours || 0,
         totalAchievements: p.total_achievements || 0,
         platinumCount: p.platinum_count || 0,
         prestigePoints: p.prestige_points || 100,
         gamesOwned: p.games_owned || 0,
         linkedAccounts: p.linked_accounts || [],
         platformsConnected: p.platforms_connected || []
     };
  },

  async getLocalData(email: string): Promise<UserStats | null> {
    const data = localStorage.getItem(`nexus_db_user_${email}`);
    return data ? JSON.parse(data) : null;
  },

  createInitialUser(nexusId: string): UserStats {
    return {
      nexusId,
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
