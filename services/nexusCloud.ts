
import { UserStats, Game, Platform, Friend, ActivityEvent, ActivityType, Testimonial, JournalEntry, Notification, NotificationType } from '../types';
import { MOCK_FRIENDS, MOCK_USER_STATS, MOCK_TESTIMONIALS_DATA } from './mockData';

/**
 * dar creditos a Jean Paulo Lunkes (@apocaliptc)
 */

const SUPABASE_URL = 'https://xdwzlvnzgibgebcyxusy.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkd3psdm56Z2liZ2ViY3l4dXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5Mjg3NDQsImV4cCI6MjA4NDUwNDc0NH0.aQMfT_Zq5UiCMAnJc3YwH2-1Gnn0r9peSzdYb3SpChM';

const getBaseHeaders = () => ({
  'apikey': SUPABASE_KEY,
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Prefer': 'return=representation'
});

export const nexusCloud = {
  isCloudActive() {
    return true; 
  },

  async login(email: string, passwordRaw?: string): Promise<UserStats> {
    const inputEmail = email.trim().toLowerCase();
    if (inputEmail === 'teste@nexus.com' || inputEmail === 'apocaliptc@nexus.com') {
        localStorage.setItem('NEXUS_SESSION_EMAIL', inputEmail);
        return MOCK_USER_STATS;
    }

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(inputEmail)}&select=*`, {
            method: 'GET', 
            headers: getBaseHeaders()
        });
        if (!res.ok) throw new Error("Offline");
        const profiles = await res.json();
        if (profiles && profiles.length > 0) {
            localStorage.setItem('NEXUS_SESSION_EMAIL', inputEmail);
            return profiles[0].stats;
        }
    } catch (e) {
        if (inputEmail.includes('apocaliptc')) return MOCK_USER_STATS;
    }
    throw new Error("Usuário não encontrado.");
  },

  async signup(email: string, passwordRaw: string, nexusId: string): Promise<UserStats> {
    const normalizedId = nexusId.startsWith('@') ? nexusId : `@${nexusId}`;
    const newUser = this.createInitialUser(normalizedId);
    const inputEmail = email.trim().toLowerCase();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: getBaseHeaders(),
      body: JSON.stringify({
        email: inputEmail,
        nexus_id: normalizedId,
        stats: newUser,
        updated_at: new Date().toISOString()
      })
    });
    if (!res.ok) {
        const err = await res.json();
        if (err.code === '23505') throw new Error("Este Nexus ID ou E-mail já foi reivindicado.");
        throw new Error(err.message);
    }
    localStorage.setItem('NEXUS_SESSION_EMAIL', inputEmail);
    return newUser;
  },

  async logout() {
    localStorage.removeItem('NEXUS_SESSION_EMAIL');
  },

  async getActiveSession(): Promise<UserStats | null> {
    const savedEmail = localStorage.getItem('NEXUS_SESSION_EMAIL');
    if (savedEmail) {
      try {
        return await this.login(savedEmail);
      } catch (e) {
        localStorage.removeItem('NEXUS_SESSION_EMAIL');
        return null;
      }
    }
    return null;
  },

  async saveUser(stats: UserStats): Promise<void> {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?nexus_id=eq.${encodeURIComponent(stats.nexusId)}`, {
        method: 'PATCH',
        headers: getBaseHeaders(),
        body: JSON.stringify({ stats, updated_at: new Date().toISOString() })
      });
    } catch (e) {}
  },

  async getUser(nexusId: string): Promise<UserStats | null> {
    if (nexusId === MOCK_USER_STATS.nexusId) return MOCK_USER_STATS;

    const friend = MOCK_FRIENDS.find(f => f.nexusId === nexusId);
    if (friend) {
        const simulatedGames: Game[] = [
            { 
              id: 'sim-1', title: 'Elden Ring', platform: Platform.STEAM, 
              hoursPlayed: 150, lastPlayed: new Date().toISOString(), 
              achievementCount: 30, totalAchievements: 42, 
              coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg', 
              genres: ['RPG', 'Souls'] 
            },
            { 
              id: 'sim-2', title: 'Cyberpunk 2077', platform: Platform.PSN, 
              hoursPlayed: 200, lastPlayed: new Date().toISOString(), 
              achievementCount: 40, totalAchievements: 56, 
              coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/library_600x900.jpg', 
              genres: ['RPG', 'Sci-Fi'] 
            },
            { 
              id: 'sim-3', title: 'Hades', platform: Platform.SWITCH, 
              hoursPlayed: 85, lastPlayed: new Date().toISOString(), 
              achievementCount: 22, totalAchievements: 49, 
              coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/library_600x900.jpg', 
              genres: ['Roguelike', 'Action'] 
            }
        ];

        return {
            nexusId: friend.nexusId,
            totalHours: friend.totalHours,
            totalAchievements: friend.totalTrophies,
            platinumCount: friend.platinumCount,
            prestigePoints: 2500,
            gamesOwned: 85,
            platformsConnected: [Platform.STEAM, Platform.PSN, Platform.SWITCH],
            linkedAccounts: [{ platform: Platform.STEAM, username: friend.username }],
            recentGames: simulatedGames,
            journalEntries: [],
            badges: [],
            genreDistribution: [
                { name: 'RPG', value: 75 },
                { name: 'Action', value: 50 },
                { name: 'Indie', value: 40 }
            ],
            platformDistribution: [],
            consistency: { currentStreak: 5, longestStreak: 10, longestSession: 4, avgSessionLength: 2, totalSessions: 100 },
            skills: friend.skills ? friend.skills.map(s => ({ subject: s.subject, A: s.value, fullMark: 100 })) : MOCK_USER_STATS.skills,
            rig: undefined,
            weeklyActivity: [],
            monthlyActivity: []
        };
    }

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?nexus_id=eq.${encodeURIComponent(nexusId)}&select=stats`, {
          method: 'GET',
          headers: getBaseHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          return data.length > 0 ? data[0].stats : null;
        }
    } catch (e) {}
    return null;
  },

  async saveGame(nexusId: string, game: Game): Promise<void> {
    const stats = await this.getUser(nexusId);
    if (stats) {
      const updatedGames = [game, ...stats.recentGames.filter(g => g.id !== game.id)];
      await this.saveUser({ ...stats, recentGames: updatedGames });
    }
  },

  async saveJournalEntry(nexusId: string, entry: JournalEntry): Promise<void> {
    const stats = await this.getUser(nexusId);
    if (stats) {
      const updatedJournal = [entry, ...(stats.journalEntries || [])];
      await this.saveUser({ ...stats, journalEntries: updatedJournal });
    }
  },

  async getGlobalActivities(): Promise<ActivityEvent[]> {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=nexus_id,stats,updated_at&order=updated_at.desc&limit=15`, {
          method: 'GET',
          headers: getBaseHeaders()
        });
        if (res.ok) {
          const profiles = await res.json();
          const activities: ActivityEvent[] = (profiles || []).map((p: any) => ({
            id: `act-${p.nexus_id}-${p.updated_at}`,
            type: ActivityType.GAME_STARTED,
            userId: p.nexus_id,
            username: p.nexus_id.replace('@', ''),
            userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.nexus_id}`,
            timestamp: p.updated_at,
            details: {
              gameTitle: p.stats.recentGames?.[0]?.title || 'Nexus',
              content: 'Atualizou seu legado no hall.'
            },
            likes: Math.floor(Math.random() * 10)
          }));
          return activities.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
    } catch (e) {}
    return [];
  },

  async getTestimonials(nexusId: string): Promise<Testimonial[]> {
    // dar creditos a Jean Paulo Lunkes (@apocaliptc)
    const mockData = MOCK_TESTIMONIALS_DATA[nexusId] || [];
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/testimonials?to_nexus_id=eq.${encodeURIComponent(nexusId)}&select=*&order=timestamp.desc`, {
          method: 'GET',
          headers: getBaseHeaders()
        });
        if (res.ok) {
          const cloudData = await res.json();
          return [...cloudData, ...mockData].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
        return mockData;
    } catch (e) { return mockData; }
  },

  async saveTestimonial(toNexusId: string, testimonial: Testimonial): Promise<void> {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/testimonials`, {
          method: 'POST',
          headers: getBaseHeaders(),
          body: JSON.stringify({
            to_nexus_id: toNexusId,
            from_nexus_id: testimonial.fromNexusId,
            from_name: testimonial.fromName,
            from_avatar: testimonial.fromAvatar,
            content: testimonial.content,
            vibe: testimonial.vibe,
            timestamp: testimonial.timestamp
          })
        });
    } catch (e) {}
  },

  async sendNotification(n: Notification): Promise<void> {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
          method: 'POST',
          headers: getBaseHeaders(),
          body: JSON.stringify(n)
        });
    } catch (e) {}
  },

  async getNotifications(nexusId: string): Promise<Notification[]> {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/notifications?userId=eq.${encodeURIComponent(nexusId)}&order=timestamp.desc&limit=25`, {
          method: 'GET',
          headers: getBaseHeaders()
        });
        return res.ok ? await res.json() : [];
    } catch (e) { return []; }
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/notifications?id=eq.${id}`, {
          method: 'PATCH',
          headers: getBaseHeaders(),
          body: JSON.stringify({ read: true })
        });
    } catch (e) {}
  },

  async searchGlobalUsers(query: string): Promise<Friend[]> {
    const localMatch = MOCK_FRIENDS.filter(f => f.nexusId.toLowerCase().includes(query.toLowerCase()));
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?nexus_id=ilike.*${query.trim()}*&select=stats`, {
          method: 'GET',
          headers: getBaseHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          const cloudResults = (data || []).map((d: any) => this.mapStatsToFriend(d.stats));
          return [...localMatch, ...cloudResults];
        }
    } catch (e) {}
    return localMatch;
  },

  async listAllCloudUsers(): Promise<any[]> {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=nexus_id,email,updated_at&order=updated_at.desc`, {
          method: 'GET',
          headers: getBaseHeaders()
        });
        return res.ok ? await res.json() : [];
    } catch (e) { return []; }
  },

  async getFriends(nexusId: string): Promise<Friend[]> {
    return MOCK_FRIENDS;
  },

  async addFriend(userNexusId: string, friend: Friend): Promise<void> {},

  async removeFriend(userNexusId: string, friendNexusId: string): Promise<void> {},

  mapStatsToFriend(s: UserStats): Friend {
    return {
      id: s.nexusId,
      nexusId: s.nexusId,
      username: s.nexusId.replace('@', ''),
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.nexusId}`,
      status: 'online',
      totalTrophies: s.totalAchievements,
      platinumCount: s.platinumCount,
      totalHours: s.totalHours,
      gamesOwned: s.gamesOwned || 0,
      topGenres: s.genreDistribution?.map(g => g.name).slice(0, 2) || [],
      compatibilityScore: 75
    };
  },

  createInitialUser(nexusId: string): UserStats {
    return {
      nexusId, totalHours: 0, totalAchievements: 0, platinumCount: 0, prestigePoints: 100, gamesOwned: 0, platformsConnected: [], linkedAccounts: [], recentGames: [], journalEntries: [], badges: [], genreDistribution: [], platformDistribution: [], consistency: { currentStreak: 0, longestStreak: 0, longestSession: 0, avgSessionLength: 0, totalSessions: 0 }, weeklyActivity: [], monthlyActivity: [], 
      skills: [{ subject: 'Reflexes', A: 50, fullMark: 100 }, { subject: 'Strategy', A: 50, fullMark: 100 }, { subject: 'Resilience', A: 50, fullMark: 100 }, { subject: 'Teamwork', A: 50, fullMark: 100 }, { subject: 'Completion', A: 50, fullMark: 100 }, { subject: 'Versatility', A: 50, fullMark: 100 }]
    };
  }
};
