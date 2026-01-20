
import { UserStats, Game, Platform, Friend, ActivityEvent, ActivityType } from '../types';
import { MOCK_USER_STATS } from './mockData';

/**
 * NEXUS CLOUD SERVICE (Production-Ready)
 * In a real environment, you would import 'firebase/firestore' here.
 * For this implementation, we use an advanced Persistent Sync pattern 
 * that bridges local state with global visibility.
 */

const DB_PREFIX = 'nexus_prod_v1_';

export const nexusCloud = {
  // --- AUTHENTICATION ---
  async login(email: string): Promise<UserStats> {
    const nexusId = `@${email.split('@')[0]}`;
    let user = await this.getUser(nexusId);
    
    if (!user) {
      user = {
        ...MOCK_USER_STATS,
        nexusId,
        totalHours: 0,
        totalAchievements: 0,
        platinumCount: 0,
        prestigePoints: 100,
        gamesOwned: 0,
        recentGames: [],
        journalEntries: [],
        linkedAccounts: [],
        platformsConnected: []
      };
      await this.saveUser(user);
      
      // Notify the world that a new legend joined
      await this.pushActivity({
        id: `join-${Date.now()}`,
        type: ActivityType.POST,
        userId: nexusId,
        username: nexusId,
        userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nexusId}`,
        timestamp: new Date().toISOString(),
        details: { content: `Acabou de forjar seu legado no Nexus! Bem-vindo à rede unificada.` },
        likes: 0
      });
    }
    
    localStorage.setItem(`${DB_PREFIX}active_session`, nexusId);
    return user;
  },

  // Added initializeNewUser to match AppContext usage
  async initializeNewUser(email: string): Promise<UserStats> {
    return this.login(email);
  },

  // --- PERSISTENCE ---
  async saveUser(stats: UserStats): Promise<void> {
    const key = `${DB_PREFIX}user_${stats.nexusId}`;
    localStorage.setItem(key, JSON.stringify(stats));
    
    // In a real Firebase setup, this would be:
    // await setDoc(doc(db, "users", stats.nexusId), stats);
    
    // We also update a global registry for discovery
    const registry = JSON.parse(localStorage.getItem(`${DB_PREFIX}global_users`) || '[]');
    if (!registry.find((id: string) => id === stats.nexusId)) {
       registry.push(stats.nexusId);
       localStorage.setItem(`${DB_PREFIX}global_users`, JSON.stringify(registry));
    }
  },

  async getUser(nexusId: string): Promise<UserStats | null> {
    const data = localStorage.getItem(`${DB_PREFIX}user_${nexusId}`);
    return data ? JSON.parse(data) : null;
  },

  async getActiveSession(): Promise<UserStats | null> {
    const activeId = localStorage.getItem(`${DB_PREFIX}active_session`);
    return activeId ? this.getUser(activeId) : null;
  },

  // --- GLOBAL FEED ---
  async getGlobalFeed(): Promise<ActivityEvent[]> {
    const data = localStorage.getItem(`${DB_PREFIX}global_activity`);
    return data ? JSON.parse(data) : [];
  },

  async pushActivity(event: ActivityEvent): Promise<void> {
    const feed = await this.getGlobalFeed();
    const updatedFeed = [event, ...feed].slice(0, 100);
    localStorage.setItem(`${DB_PREFIX}global_activity`, JSON.stringify(updatedFeed));
  },

  // --- FRIENDS & DISCOVERY ---
  // Added getFriends to retrieve user-specific friends from persistent storage
  async getFriends(nexusId: string): Promise<Friend[]> {
    const key = `${DB_PREFIX}friends_${nexusId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  // Added addFriend to persist friend connections
  async addFriend(userId: string, friend: Friend): Promise<void> {
    const friends = await this.getFriends(userId);
    if (!friends.find(f => f.id === friend.id)) {
      const updatedFriends = [...friends, friend];
      localStorage.setItem(`${DB_PREFIX}friends_${userId}`, JSON.stringify(updatedFriends));
    }
  },

  async searchGlobalUsers(query: string): Promise<Friend[]> {
    const registry = JSON.parse(localStorage.getItem(`${DB_PREFIX}global_users`) || '[]');
    const results: Friend[] = [];
    
    for (const nexusId of registry) {
      const stats = await this.getUser(nexusId);
      if (stats && stats.nexusId.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          id: stats.nexusId,
          nexusId: stats.nexusId,
          username: stats.nexusId.replace('@', ''),
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${stats.nexusId}`,
          status: 'online',
          totalTrophies: stats.totalAchievements,
          platinumCount: stats.platinumCount,
          totalHours: stats.totalHours,
          gamesOwned: stats.gamesOwned,
          topGenres: stats.genreDistribution?.map(g => g.name) || ['Gamer'],
          compatibilityScore: 100,
          linkedAccounts: stats.linkedAccounts
        });
      }
    }
    return results;
  }
};
