
import { Platform, UserStats, Friend, Game, Achievement, GlobalRaid, ActivityType, CollectionItem } from '../types';

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
  { 
    id: 'phys-1', 
    title: 'Metal Gear Solid (Physical)', 
    platform: Platform.PSN, 
    hoursPlayed: 45, 
    lastPlayed: '2024-03-10', 
    achievementCount: 22, 
    totalAchievements: 25, 
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co20u2.jpg', 
    genres: ['Stealth', 'Action'], 
    isPhysical: true,
    pedigree: [
      { ownerNexusId: 'retro-0', ownerName: 'KojimaFan99', acquiredDate: '1998-09-03', soldDate: '2010-05-15', ownerPrestigeAtTime: 5000 },
      { ownerNexusId: 'retro-1', ownerName: 'HideoCollector', acquiredDate: '2010-05-15', soldDate: '2022-01-20', ownerPrestigeAtTime: 25000 },
      { ownerNexusId: '@apocaliptc', ownerName: 'Apocaliptc', acquiredDate: '2022-01-20', ownerPrestigeAtTime: 18200 }
    ]
  },
  { 
    id: 'phys-2', 
    title: 'The Legend of Zelda: Ocarina of Time', 
    platform: Platform.SWITCH, 
    hoursPlayed: 120, 
    lastPlayed: '2024-01-05', 
    achievementCount: 100, 
    totalAchievements: 100, 
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co394v.jpg', 
    genres: ['Adventure', 'Classic'], 
    isPhysical: true,
    pedigree: [
      { ownerNexusId: 'ninty-old', ownerName: 'ShigeruDisciple', acquiredDate: '1998-11-21', soldDate: '2005-06-12', ownerPrestigeAtTime: 9999 },
      { ownerNexusId: 'ninty-vault', ownerName: 'TheVaultKeeper', acquiredDate: '2005-06-12', soldDate: '2023-11-10', ownerPrestigeAtTime: 85000 },
      { ownerNexusId: '@apocaliptc', ownerName: 'Apocaliptc', acquiredDate: '2023-11-10', ownerPrestigeAtTime: 18200 }
    ]
  },
  { id: 's2', title: 'The Witcher 3: Wild Hunt', platform: Platform.STEAM, hoursPlayed: 210, lastPlayed: '2024-02-15', achievementCount: 78, totalAchievements: 78, coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900.jpg', genres: ['RPG', 'Open World'], achievements: generateAchievements('Witcher 3', 78, 78) },
];

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
  badges: [],
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

export const MOCK_COLLECTION: CollectionItem[] = [
  {
    id: 'hw-1',
    ownerId: 'me',
    name: 'Game Boy Color Berry Edition',
    type: 'Console',
    condition: 'CIB',
    status: 'collection',
    imageUrl: 'https://images.unsplash.com/photo-1531525645387-7f14be13ba13?q=80&w=800&auto=format&fit=crop',
    value: 350,
    dateAdded: '2023-10-12'
  },
  {
    id: 'hw-2',
    ownerId: 'me',
    name: 'Nintendo 64 Pikachu Edition',
    type: 'Console',
    condition: 'Refurbished',
    status: 'collection',
    imageUrl: 'https://images.unsplash.com/photo-1605058327244-6404d7455d31?q=80&w=800&auto=format&fit=crop',
    value: 800,
    dateAdded: '2024-01-20'
  },
  {
    id: 'it-1',
    ownerId: '@geron_adv',
    name: 'Steelbook Elden Ring (Exclusive)',
    type: 'Accessory',
    condition: 'Sealed',
    status: 'sale',
    imageUrl: 'https://images.unsplash.com/photo-1627843563095-f6e94676cfe0?q=80&w=800&auto=format&fit=crop',
    value: 120,
    dateAdded: '2024-03-01'
  }
];

export const MOCK_FRIENDS: Friend[] = [
  {
    id: '@neon_ghost',
    nexusId: '@neon_ghost',
    username: 'Neon Ghost',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon',
    status: 'online',
    currentActivity: 'Explorando Night City',
    totalTrophies: 3450,
    platinumCount: 12,
    totalHours: 4100,
    gamesOwned: 124,
    topGenres: ['Cyberpunk', 'FPS'],
    compatibilityScore: 92,
    rig: { mainPlatform: Platform.STEAM, gpu: 'RTX 4090' }
  },
  {
    id: '@pixel_queen',
    nexusId: '@pixel_queen',
    username: 'Pixel Queen',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel',
    status: 'online',
    currentActivity: 'Farming in Stardew Valley',
    totalTrophies: 5600,
    platinumCount: 25,
    totalHours: 8900,
    gamesOwned: 450,
    topGenres: ['Simulation', 'RPG'],
    compatibilityScore: 88,
    rig: { mainPlatform: Platform.SWITCH, gpu: 'Custom Handheld' }
  },
  {
    id: '@iron_wall',
    nexusId: '@iron_wall',
    username: 'Iron Wall',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=iron',
    status: 'ingame',
    currentActivity: 'Playing Rainbow Six Siege',
    totalTrophies: 1200,
    platinumCount: 4,
    totalHours: 3200,
    gamesOwned: 42,
    topGenres: ['Tactical', 'FPS'],
    compatibilityScore: 65,
    rig: { mainPlatform: Platform.XBOX, gpu: 'Series X' }
  },
  {
    id: '@shadow_blade',
    nexusId: '@shadow_blade',
    username: 'Shadow Blade',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shadow',
    status: 'offline',
    totalTrophies: 890,
    platinumCount: 1,
    totalHours: 1500,
    gamesOwned: 30,
    topGenres: ['Stealth', 'Action'],
    compatibilityScore: 78
  },
  {
    id: '@luna_seeker',
    nexusId: '@luna_seeker',
    username: 'Luna Seeker',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna',
    status: 'online',
    currentActivity: 'Stargazing in No Man\'s Sky',
    totalTrophies: 2100,
    platinumCount: 8,
    totalHours: 2800,
    gamesOwned: 67,
    topGenres: ['Adventure', 'Sci-Fi'],
    compatibilityScore: 95,
    rig: { mainPlatform: Platform.PSN, gpu: 'PS5 Pro' }
  }
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

export const MOCK_GLOBAL_USERS: Friend[] = [...MOCK_FRIENDS];
export const MOCK_DISCOVER_GAMES: Game[] = [];
export const MOCK_GLOBAL_STATS: any = {
  averageHours: 920,
  averageAchievements: 110,
  topGenres: [{ name: 'FPS', value: 40 }, { name: 'RPG', value: 30 }, { name: 'Sports', value: 20 }, { name: 'Other', value: 10 }],
  activityTrend: [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 3.1 },
    { day: 'Wed', hours: 2.8 },
    { day: 'Thu', hours: 4.2 },
    { day: 'Fri', hours: 5.5 },
    { day: 'Sat', hours: 8.0 },
    { day: 'Sun', hours: 7.2 }
  ],
  monthlyActivity: [
    { month: 'Jan', hours: 120 },
    { month: 'Feb', hours: 110 },
    { month: 'Mar', hours: 145 },
    { month: 'Apr', hours: 90 },
    { month: 'May', hours: 105 },
    { month: 'Jun', hours: 130 }
  ],
  skills: [
    { subject: 'Reflexes', value: 75 },
    { subject: 'Strategy', value: 80 },
    { subject: 'Resilience', value: 70 },
    { subject: 'Teamwork', value: 65 },
    { subject: 'Completion', value: 85 },
    { subject: 'Versatility', value: 60 }
  ]
};
export const MOCK_CHALLENGES: any[] = [];
export const MOCK_ACTIVITY_FEED: any[] = [];
