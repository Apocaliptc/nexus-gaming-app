
import { UserStats, Game, Platform, Friend, ActivityEvent, ActivityType, JournalEntry } from '../types';

/**
 * NEXUS CLOUD ORCHESTRATOR (PRO)
 * Agora inclui suporte a Autenticação com Senha e persistência real em banco.
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

  async signup(email: string, password: string, nexusId: string): Promise<UserStats> {
    // 1. Check local storage first
    const existing = localStorage.getItem(`nexus_auth_${email}`);
    if (existing) throw new Error("Usuário já cadastrado com este e-mail.");

    const stats = this.createInitialUser(nexusId);
    
    // Save Auth Local
    localStorage.setItem(`nexus_auth_${email}`, JSON.stringify({ email, password, nexusId }));
    
    // Save Active Session
    localStorage.setItem('nexus_active_session', email);
    
    // Remote Persist (if cloud is active)
    if (DB_CONFIG.isRemote) {
        await this.saveUser(stats);
    } else {
        localStorage.setItem(`nexus_db_v6_user_${email}`, JSON.stringify(stats));
    }

    return stats;
  },

  async login(email: string, password?: string): Promise<UserStats> {
    // Attempt local auth check
    const authData = localStorage.getItem(`nexus_auth_${email}`);
    
    if (authData) {
        const auth = JSON.parse(authData);
        if (password && auth.password !== password) {
            throw new Error("Senha incorreta.");
        }
        
        localStorage.setItem('nexus_active_session', email);
        const stats = await this.getLocalData(email) || this.createInitialUser(auth.nexusId);
        return stats;
    }

    // If remote, attempt to fetch profile from cloud
    if (DB_CONFIG.isRemote) {
      try {
        const res = await fetch(`${DB_CONFIG.url}/rest/v1/profiles?email=eq.${email}`, { headers: headers() });
        const profiles = await res.json();
        
        if (profiles && profiles.length > 0) {
          // Note: In a real scenario, password check should happen on server-side (Supabase Auth)
          // Here we are simulating the relational mapping
          const p = profiles[0];
          return this.mapRemoteProfile(p);
        }
      } catch (e) {
        console.error("Remote login failed", e);
      }
    }

    throw new Error("Conta não encontrada. Cadastre-se primeiro!");
  },

  async mapRemoteProfile(p: any): Promise<UserStats> {
    const gamesRes = await fetch(`${DB_CONFIG.url}/rest/v1/library?user_id=eq.${p.nexus_id}`, { headers: headers() });
    const gamesData = await gamesRes.json();
    return {
        nexusId: p.nexus_id,
        totalHours: p.total_hours,
        totalAchievements: p.total_achievements,
        platinumCount: p.platinum_count,
        prestigePoints: p.prestige_points,
        gamesOwned: p.games_owned,
        platformsConnected: p.platforms_connected || [],
        linkedAccounts: p.linked_accounts || [],
        recentGames: gamesData.map((g: any) => ({
            id: g.id,
            title: g.title,
            platform: g.platform,
            hoursPlayed: g.hours_played,
            achievementCount: g.achievement_count,
            totalAchievements: g.total_achievements,
            coverUrl: g.cover_url,
            lastPlayed: g.last_played,
            genres: g.genres || [],
            achievements: g.achievements || []
        })),
        journalEntries: [],
        genreDistribution: p.genre_distribution || [],
        platformDistribution: p.platform_distribution || [],
        consistency: p.consistency || { currentStreak: 0, longestStreak: 0, longestSession: 0, avgSessionLength: 0, totalSessions: 0 },
        weeklyActivity: p.weekly_activity || [],
        monthlyActivity: p.monthly_activity || [],
        skills: p.skills || []
    };
  },

  async getLocalData(email: string): Promise<UserStats | null> {
    const data = localStorage.getItem(`nexus_db_v6_user_${email}`);
    return data ? JSON.parse(data) : null;
  },

  async saveUser(stats: UserStats): Promise<void> {
    const email = localStorage.getItem('nexus_active_session');
    if (email) localStorage.setItem(`nexus_db_v6_user_${email}`, JSON.stringify(stats));
    
    if (!DB_CONFIG.isRemote) return;

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
      console.error("Cloud Persist Error", e);
    }
  },

  async getActiveSession(): Promise<UserStats | null> {
    const email = localStorage.getItem('nexus_active_session');
    if (!email) return null;
    try {
        return await this.login(email);
    } catch (e) {
        return null;
    }
  },

  async getUser(nexusId: string): Promise<UserStats | null> {
    // Helper to find any user by Nexus ID globally
    if (DB_CONFIG.isRemote) {
        const res = await fetch(`${DB_CONFIG.url}/rest/v1/profiles?nexus_id=eq.${nexusId}`, { headers: headers() });
        const profiles = await res.json();
        if (profiles.length > 0) return this.mapRemoteProfile(profiles[0]);
    }
    return null;
  },

  // Added missing methods for profile discovery and social interactions
  async searchGlobalUsers(query: string): Promise<Friend[]> {
    return [
      {
        id: 'user_1',
        nexusId: '@faker',
        username: 'Lee Sang-hyeok',
        avatarUrl: 'https://i.pravatar.cc/150?u=faker',
        status: 'online',
        totalTrophies: 9999,
        platinumCount: 150,
        totalHours: 25000,
        gamesOwned: 50,
        topGenres: ['MOBA', 'Strategy'],
        compatibilityScore: 45
      }
    ].filter(u => u.username.toLowerCase().includes(query.toLowerCase()) || u.nexusId.toLowerCase().includes(query.toLowerCase()));
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
        id: 'feed_1',
        type: ActivityType.PLATINUM,
        userId: 'user_1',
        username: 'Lee Sang-hyeok',
        userAvatar: 'https://i.pravatar.cc/150?u=faker',
        timestamp: new Date().toISOString(),
        details: {
          gameTitle: 'League of Legends',
          gameCover: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg',
        },
        likes: 1240,
        comments: 45,
        hasLiked: false
      }
    ];
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
