
import { UserStats, Game, Platform, Friend, ActivityEvent, ActivityType, JournalEntry } from '../types';

/**
 * NEXUS RELATIONAL ORCHESTRATOR (V6)
 * Este serviço gerencia a complexidade de transformar o objeto UserStats em linhas de SQL.
 */

let DB_CONFIG = {
  url: localStorage.getItem('nexus_db_url') || '',
  key: localStorage.getItem('nexus_db_key') || '',
  isRemote: !!localStorage.getItem('nexus_db_url')
};

const headers = () => ({
  'apikey': DB_CONFIG.key,
  'Authorization': `Bearer ${DB_CONFIG.key}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

export const nexusCloud = {
  updateConfig(url: string, key: string) {
    localStorage.setItem('nexus_db_url', url);
    localStorage.setItem('nexus_db_key', key);
    DB_CONFIG.url = url;
    DB_CONFIG.key = key;
    DB_CONFIG.isRemote = !!url;
  },

  async login(email: string): Promise<UserStats> {
    const nexusId = `@${email.split('@')[0].toLowerCase()}`;
    localStorage.setItem('nexus_active_session', nexusId);

    if (DB_CONFIG.isRemote) {
      try {
        // 1. Busca Perfil Base
        const profileRes = await fetch(`${DB_CONFIG.url}/rest/v1/profiles?nexus_id=eq.${nexusId}`, { headers: headers() });
        const profiles = await profileRes.json();
        
        if (profiles && profiles.length > 0) {
          const p = profiles[0];
          
          // 2. Busca Jogos (Library)
          const gamesRes = await fetch(`${DB_CONFIG.url}/rest/v1/library?user_id=eq.${nexusId}`, { headers: headers() });
          const gamesData = await gamesRes.json();
          
          // 3. Busca Entradas do Chronos
          const chronosRes = await fetch(`${DB_CONFIG.url}/rest/v1/chronos_journal?user_id=eq.${nexusId}`, { headers: headers() });
          const journalData = await chronosRes.json();

          return {
            nexusId: p.nexus_id,
            totalHours: p.total_hours,
            totalAchievements: p.total_achievements,
            platinumCount: p.platinum_count,
            prestigePoints: p.prestige_points,
            gamesOwned: p.games_owned,
            platformsConnected: p.platforms_connected || [],
            linkedAccounts: p.linked_accounts || [],
            recentGames: gamesData || [],
            journalEntries: journalData || [],
            genreDistribution: p.genre_distribution || [],
            platformDistribution: p.platform_distribution || [],
            consistency: p.consistency || { currentStreak: 0, longestStreak: 0, longestSession: 0, avgSessionLength: 0, totalSessions: 0 },
            weeklyActivity: p.weekly_activity || [],
            monthlyActivity: p.monthly_activity || [],
            skills: p.skills || []
          };
        }
      } catch (e) {
        console.error("Cloud Sync Login Failed", e);
      }
    }

    return this.getLocalData(nexusId) || this.createInitialUser(nexusId);
  },

  getLocalData(nexusId: string): UserStats | null {
    const data = localStorage.getItem(`nexus_db_v6_user_${nexusId}`);
    return data ? JSON.parse(data) : null;
  },

  async saveUser(stats: UserStats): Promise<void> {
    localStorage.setItem(`nexus_db_v6_user_${stats.nexusId}`, JSON.stringify(stats));
    if (!DB_CONFIG.isRemote) return;

    try {
      // Sincronização Relacional Atômica
      // 1. Update Profile
      await fetch(`${DB_CONFIG.url}/rest/v1/profiles?nexus_id=eq.${stats.nexusId}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({
          total_hours: stats.totalHours,
          total_achievements: stats.totalAchievements,
          platinum_count: stats.platinumCount,
          prestige_points: stats.prestigePoints,
          games_owned: stats.gamesOwned,
          linked_accounts: stats.linkedAccounts,
          platforms_connected: stats.platformsConnected,
          genre_distribution: stats.genreDistribution,
          platform_distribution: stats.platformDistribution,
          consistency: stats.consistency,
          skills: stats.skills
        })
      });

      // 2. Sincronizar Biblioteca (UPSERT)
      for (const game of stats.recentGames) {
        await fetch(`${DB_CONFIG.url}/rest/v1/library`, {
          method: 'POST',
          headers: { ...headers(), 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify({ ...game, user_id: stats.nexusId })
        });
      }

      // 3. Sincronizar Diário Chronos
      for (const entry of stats.journalEntries) {
        await fetch(`${DB_CONFIG.url}/rest/v1/chronos_journal`, {
          method: 'POST',
          headers: { ...headers(), 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify({ ...entry, user_id: stats.nexusId })
        });
      }

    } catch (e) {
      console.error("Cloud Persist Error", e);
    }
  },

  async getActiveSession(): Promise<UserStats | null> {
    const nexusId = localStorage.getItem('nexus_active_session');
    if (!nexusId) return null;
    return this.login(nexusId.includes('@') ? nexusId : `${nexusId}@nexus.io`);
  },

  async getUser(nexusId: string): Promise<UserStats | null> {
    return this.login(nexusId.includes('@') ? nexusId : `${nexusId}@nexus.io`);
  },

  async searchGlobalUsers(query: string): Promise<Friend[]> {
    if (DB_CONFIG.isRemote) {
      try {
        const res = await fetch(`${DB_CONFIG.url}/rest/v1/profiles?nexus_id=ilike.*${query}*`, { headers: headers() });
        const data = await res.json();
        return data.map((u: any) => ({
           id: u.nexus_id,
           nexusId: u.nexus_id,
           username: u.nexus_id.split('@')[0],
           avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.nexus_id}`,
           status: 'online',
           totalTrophies: u.total_achievements,
           platinumCount: u.platinum_count,
           totalHours: u.total_hours,
           gamesOwned: u.games_owned,
           topGenres: ['Gamer'],
           compatibilityScore: 100
        }));
      } catch (e) { return []; }
    }
    return [];
  },

  async getGlobalFeed(): Promise<ActivityEvent[]> {
    return [
      {
        id: 'welcome',
        type: ActivityType.POST,
        userId: 'system',
        username: 'Nexus AI',
        userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=nexus',
        timestamp: new Date().toISOString(),
        details: { content: 'Bem-vindo ao Nexus. Sua jornada está sendo gravada na nuvem.' },
        likes: 999
      }
    ];
  },

  async getFriends(nexusId: string): Promise<Friend[]> {
    const data = localStorage.getItem(`nexus_friends_${nexusId}`);
    return data ? JSON.parse(data) : [];
  },

  async addFriend(nexusId: string, friend: Friend): Promise<void> {
    const friends = await this.getFriends(nexusId);
    localStorage.setItem(`nexus_friends_${nexusId}`, JSON.stringify([...friends, friend]));
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
