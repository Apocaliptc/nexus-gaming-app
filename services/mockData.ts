
import { Platform, UserStats, Friend, Game, Achievement, GlobalRaid, ActivityType } from '../types';

const generateAchievements = (gameTitle: string, count: number, total: number): Achievement[] => {
  return Array.from({ length: total }).map((_, i) => ({
    id: `ach-${gameTitle}-${i}`,
    name: `Conquista ${i + 1} de ${gameTitle}`,
    description: `Um marco épico alcançado em ${gameTitle}.`,
    iconUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${gameTitle}-${i}`,
    unlockedAt: i < count ? new Date(Date.now() - (i * 86400000)).toISOString() : undefined,
    rarity: i === 0 ? 'Ultra Rare' : i < 5 ? 'Gold' : 'Silver'
  }));
};

const SHARED_GAMES_LIST: Game[] = [
  { id: 's1', title: 'Elden Ring', platform: Platform.STEAM, hoursPlayed: 145, lastPlayed: '2024-03-01', achievementCount: 42, totalAchievements: 42, coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg', genres: ['RPG', 'Souls'], achievements: generateAchievements('Elden Ring', 42, 42) },
  { id: 's2', title: 'The Witcher 3: Wild Hunt', platform: Platform.STEAM, hoursPlayed: 210, lastPlayed: '2024-02-15', achievementCount: 78, totalAchievements: 78, coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900.jpg', genres: ['RPG', 'Open World'], achievements: generateAchievements('Witcher 3', 78, 78) },
];

export const MOCK_RAID: GlobalRaid = {
  id: 'r1',
  title: 'Operação Fantasma: RPG Renaissance',
  target: 50000,
  current: 34200,
  reward: 'Badge Ethereal Chronos',
  deadline: '2024-12-31',
  type: 'hours'
};

export const MOCK_USER_STATS: UserStats = {
  nexusId: '@apocaliptc',
  totalHours: 5240,
  totalAchievements: 2150,
  platinumCount: 48,
  prestigePoints: 18200,
  gamesOwned: 312,
  platformsConnected: [Platform.STEAM, Platform.PSN, Platform.XBOX],
  linkedAccounts: [
    { platform: Platform.STEAM, username: '@apocaliptc' },
    { platform: Platform.PSN, username: '@apocaliptc' },
  ],
  recentGames: [...SHARED_GAMES_LIST],
  journalEntries: [
    { id: 'j1', date: '2024-03-20', gameTitle: 'Elden Ring', rawInput: 'Derrotei o boss!', narrative: 'As chamas da vitória queimaram intensamente.', mood: 'Triumphant' },
    { id: 'j2', date: '2024-03-15', gameTitle: 'Cyberpunk', rawInput: 'Noite chuvosa em Night City.', narrative: 'O neon refletia a melancolia da alma cibernética.', mood: 'Melancholic' }
  ],
  genreDistribution: [{ name: 'RPG', value: 60 }, { name: 'Action', value: 25 }, { name: 'Souls', value: 15 }],
  platformDistribution: [{ name: 'Steam', value: 3100 }, { name: 'PlayStation', value: 1800 }, { name: 'Xbox', value: 340 }],
  consistency: { currentStreak: 15, longestStreak: 62, longestSession: 12, avgSessionLength: 3.8, totalSessions: 1450 },
  weeklyActivity: [],
  monthlyActivity: [],
  skills: [
    { subject: 'Reflexes', A: 88, fullMark: 100 },
    { subject: 'Strategy', A: 94, fullMark: 100 },
    { subject: 'Resilience', A: 99, fullMark: 100 },
    { subject: 'Teamwork', A: 70, fullMark: 100 },
    { subject: 'Completion', A: 96, fullMark: 100 },
    { subject: 'Versatility', A: 80, fullMark: 100 },
  ],
  rig: {
    cpu: 'Ryzen 9 7900X',
    gpu: 'RTX 4080',
    ram: '32GB DDR5',
    mainPlatform: Platform.STEAM
  },
  backlog: {
    unplayedGamesCount: 45,
    estimatedTimeToClear: 1200,
    monetaryValueLost: 450,
    nextTarget: 'Hollow Knight'
  }
};

export const MOCK_AMIGO_STATS: UserStats = {
  ...MOCK_USER_STATS,
  nexusId: '@amigo_imaginário',
  rig: {
    cpu: 'Intel i7-13700K',
    gpu: 'RTX 3070',
    mainPlatform: Platform.PSN
  }
};

export const MOCK_FRIENDS: Friend[] = [
  {
    id: '@amigo_imaginário',
    nexusId: '@amigo_imaginário',
    username: 'Amigo Imaginário',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amigo',
    status: 'online',
    currentActivity: 'Playing EA Sports FC 24',
    totalTrophies: 1100,
    platinumCount: 15,
    totalHours: 7200,
    gamesOwned: 85,
    topGenres: ['Sports', 'FPS'],
    compatibilityScore: 100,
    rig: { mainPlatform: Platform.PSN, gpu: 'RTX 3070' }
  }
];

export const MOCK_GLOBAL_USERS: Friend[] = MOCK_FRIENDS;
export const MOCK_DISCOVER_GAMES: Game[] = [];
export const MOCK_GLOBAL_STATS: any = {
  averageHours: 920,
  averageAchievements: 110,
  topGenres: [{ name: 'FPS', value: 40 }, { name: 'RPG', value: 30 }, { name: 'Sports', value: 20 }, { name: 'Other', value: 10 }],
  activityTrend: [],
  monthlyActivity: [],
  skills: []
};
export const MOCK_CHALLENGES: any[] = [];
export const MOCK_COLLECTION: any[] = [];
export const MOCK_ACTIVITY_FEED: any[] = [];
