
import { UserStats, Game, Platform, Friend, ActivityEvent, ActivityType, Testimonial, JournalEntry } from '../types';
import { MOCK_USER_STATS, MOCK_GLOBAL_USERS, MOCK_FRIENDS } from './mockData';

const getEnv = (key: string) => {
  return (process.env as any)[key] || 
         (process.env as any)[`VITE_${key}`] || 
         (process.env as any)[`REACT_APP_${key}`] || 
         localStorage.getItem(`nexus_cloud_${key.toLowerCase()}`);
};

// Se não houver chaves, o app operará em modo Mock/Local
let SUPABASE_URL = getEnv('SUPABASE_URL') || ''; 
let SUPABASE_KEY = getEnv('SUPABASE_ANON_KEY') || '';

const getBaseHeaders = () => ({
  'apikey': SUPABASE_KEY,
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_KEY}`
});

export const nexusCloud = {
  isCloudActive() {
    return !!SUPABASE_URL && SUPABASE_URL.startsWith('http');
  },

  updateConfig(url: string, key: string) {
    SUPABASE_URL = url;
    SUPABASE_KEY = key;
    localStorage.setItem('nexus_cloud_supabase_url', url);
    localStorage.setItem('nexus_cloud_supabase_anon_key', key);
  },

  async login(email: string, passwordRaw?: string): Promise<UserStats> {
    if (!this.isCloudActive()) {
        localStorage.setItem('nexus_active_session', email);
        return MOCK_USER_STATS;
    }
    const inputEmail = email.trim().toLowerCase();
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${inputEmail}&select=*`, {
            method: 'GET', headers: getBaseHeaders()
        });
        if (!res.ok) throw new Error("Cloud Offline");
        const profiles = await res.json();
        if (profiles.length > 0) {
            localStorage.setItem('nexus_active_session', profiles[0].email);
            return this.fetchFullStats(profiles[0].nexus_id);
        }
    } catch (e) { console.warn("Cloud login failed, using local stats."); }
    return MOCK_USER_STATS;
  },

  async signup(email: string, password: string, nexusId: string): Promise<UserStats> {
    return this.createInitialUser(nexusId);
  },

  async fetchFullStats(nexusId: string): Promise<UserStats> {
    // Busca na lista global se for um usuário conhecido
    const found = MOCK_GLOBAL_USERS.find(u => u.nexusId === nexusId);
    if (found) {
        return {
            ...this.createInitialUser(nexusId),
            totalHours: found.totalHours,
            totalAchievements: found.totalTrophies,
            platinumCount: found.platinumCount,
            gamesOwned: found.gamesOwned
        };
    }
    return MOCK_USER_STATS;
  },

  async getUser(nexusId: string): Promise<UserStats> {
    return this.fetchFullStats(nexusId);
  },

  async saveUser(stats: UserStats): Promise<void> {},

  async getUserGames(nexusId: string): Promise<Game[]> {
    return [];
  },

  async saveGame(nexusId: string, game: Game): Promise<void> {},

  async searchGlobalUsers(query: string): Promise<Friend[]> {
    if (!query) return [];
    
    // Simula atraso de rede
    await new Promise(r => setTimeout(r, 500));
    
    const lowerQuery = query.toLowerCase();
    return MOCK_GLOBAL_USERS.filter(u => 
        u.username.toLowerCase().includes(lowerQuery) || 
        u.nexusId.toLowerCase().includes(lowerQuery)
    );
  },

  async getFriends(nexusId: string): Promise<Friend[]> {
    return MOCK_FRIENDS;
  },

  async addFriend(myNexusId: string, friend: Friend): Promise<Friend[]> {
    return [...MOCK_FRIENDS, friend];
  },

  async removeFriend(myNexusId: string, friendNexusId: string): Promise<Friend[]> {
    return MOCK_FRIENDS.filter(f => f.nexusId !== friendNexusId);
  },

  async getGlobalActivities(): Promise<ActivityEvent[]> {
    return [];
  },

  async postActivity(nexusId: string, activity: any): Promise<void> {},

  async getTestimonials(nexusId: string): Promise<Testimonial[]> {
    return [];
  },

  async saveTestimonial(toNexusId: string, testimonial: Testimonial): Promise<void> {},

  async saveJournalEntry(nexusId: string, entry: JournalEntry): Promise<void> {},

  async listAllCloudUsers(): Promise<any[]> {
    return [];
  },

  mapRemoteProfile(p: any): UserStats {
     return this.createInitialUser(p.nexus_id);
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
        gamesOwned: stats.gamesOwned,
        topGenres: ['Gamer'],
        compatibilityScore: 100
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
      skills: []
    };
  },

  async getActiveSession(): Promise<UserStats | null> {
    const email = localStorage.getItem('nexus_active_session');
    if (email) return this.login(email);
    return null;
  }
};
