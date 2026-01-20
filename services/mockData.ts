
import { Platform, UserStats, Friend, Game, Achievement, Challenge, GlobalStats, CollectionItem, ActivityEvent, ActivityType, Quest, PartySuggestion, ChallengeType } from '../types';

export const MOCK_GAMES: Game[] = [
  {
    id: '1',
    title: 'Demon\'s Souls',
    platform: Platform.PSN,
    hoursPlayed: 85,
    lastPlayed: '2023-11-25T22:00:00Z',
    firstPlayed: '2023-10-01T10:00:00Z',
    achievementCount: 37,
    totalAchievements: 37,
    coverUrl: 'https://image.api.playstation.com/vulcan/img/rnd/202011/1717/GemRaGV0L6Qk5w9e9h6k05v6.png',
    genres: ['RPG', 'Soulslike'],
    achievements: []
  },
  {
    id: '2',
    title: 'Elden Ring',
    platform: Platform.STEAM,
    hoursPlayed: 240,
    lastPlayed: '2024-02-10T21:00:00Z',
    firstPlayed: '2022-02-25T00:00:00Z',
    achievementCount: 42,
    totalAchievements: 42,
    coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg',
    genres: ['RPG', 'Open World'],
    achievements: []
  }
];

export const MOCK_USER_STATS: UserStats = {
  nexusId: '@apocaliptc',
  totalHours: 4250,
  totalAchievements: 1845,
  platinumCount: 42,
  prestigePoints: 14500,
  gamesOwned: 312,
  platformsConnected: [Platform.STEAM, Platform.PSN],
  linkedAccounts: [
    { platform: Platform.STEAM, username: '@apocaliptc' },
    { platform: Platform.PSN, username: '@apocaliptc' },
  ],
  recentGames: MOCK_GAMES,
  journalEntries: [
    {
      id: 'j1',
      date: '2024-03-20T10:00:00Z',
      gameTitle: 'Elden Ring',
      rawInput: 'Derrotei o Malenia!',
      narrative: 'Nas profundezas da Árvore Sacra, as espadas colidiram em uma dança de morte. Sob o luar pálido, a Deusa da Podridão finalmente conheceu a derrota perante minha lâmina implacável. Um legado de aço foi forjado hoje.',
      mood: 'Triumphant'
    }
  ],
  genreDistribution: [{ name: 'RPG', value: 55 }, { name: 'Action', value: 25 }, { name: 'FPS', value: 15 }, { name: 'Strategy', value: 5 }],
  platformDistribution: [{ name: 'Steam', value: 2450 }, { name: 'PlayStation', value: 1200 }],
  consistency: { currentStreak: 12, longestStreak: 45, longestSession: 9.5, avgSessionLength: 3.2, totalSessions: 1320 },
  weeklyActivity: [{ day: 'Mon', hours: 4.5 }, { day: 'Tue', hours: 3.0 }, { day: 'Wed', hours: 5.5 }, { day: 'Thu', hours: 2.0 }, { day: 'Fri', hours: 8.0 }, { day: 'Sat', hours: 12.5 }, { day: 'Sun', hours: 10.0 }],
  monthlyActivity: [{ month: 'Jan', hours: 120 }, { month: 'Feb', hours: 145 }, { month: 'Mar', hours: 160 }, { month: 'Apr', hours: 130 }, { month: 'May', hours: 150 }, { month: 'Jun', hours: 180 }],
  skills: [
    { subject: 'Reflexes', A: 85, fullMark: 100 },
    { subject: 'Strategy', A: 92, fullMark: 100 },
    { subject: 'Resilience', A: 98, fullMark: 100 },
    { subject: 'Teamwork', A: 65, fullMark: 100 },
    { subject: 'Completion', A: 95, fullMark: 100 },
    { subject: 'Versatility', A: 75, fullMark: 100 },
  ]
};

export const MOCK_GLOBAL_USERS: Friend[] = [
  {
    id: 'user_1',
    nexusId: '@faker',
    username: 'Lee Sang-hyeok',
    avatarUrl: 'https://i.pravatar.cc/150?u=faker',
    status: 'online',
    currentActivity: 'Playing League of Legends',
    totalTrophies: 9999,
    platinumCount: 150,
    totalHours: 25000,
    gamesOwned: 50,
    topGenres: ['MOBA', 'Strategy'],
    compatibilityScore: 45,
    linkedAccounts: [{ platform: Platform.STEAM, username: 'Hide on bush' }]
  }
];

export const MOCK_FRIENDS: Friend[] = [MOCK_GLOBAL_USERS[0]];
export const MOCK_DISCOVER_GAMES: Game[] = [];
export const MOCK_GLOBAL_STATS: GlobalStats = {
  averageHours: 850,
  averageAchievements: 90,
  topGenres: [{ name: 'FPS', value: 40 }, { name: 'RPG', value: 30 }, { name: 'Sports', value: 20 }, { name: 'Other', value: 10 }],
  activityTrend: [{ day: 'Mon', hours: 1.5 }, { day: 'Tue', hours: 1.5 }, { day: 'Wed', hours: 2.0 }, { day: 'Thu', hours: 2.0 }, { day: 'Fri', hours: 4.0 }, { day: 'Sat', hours: 5.5 }, { day: 'Sun', hours: 4.5 }],
  monthlyActivity: [{ month: 'Jan', hours: 30 }, { month: 'Feb', hours: 35 }, { month: 'Mar', hours: 40 }, { month: 'Apr', hours: 38 }, { month: 'May', hours: 42 }, { month: 'Jun', hours: 50 }],
  skills: [{ subject: 'Reflexes', value: 75 }, { subject: 'Strategy', value: 60 }, { subject: 'Resilience', value: 50 }, { subject: 'Teamwork', value: 70 }, { subject: 'Completion', value: 40 }, { subject: 'Versatility', value: 60 }]
};
export const MOCK_CHALLENGES: Challenge[] = [];
export const MOCK_COLLECTION: CollectionItem[] = [];
export const MOCK_ACTIVITY_FEED: ActivityEvent[] = [];
export const MOCK_QUESTS: Quest[] = [];
export const MOCK_PARTY_SUGGESTIONS: PartySuggestion[] = [];
