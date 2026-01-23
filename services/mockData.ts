
import { Platform, UserStats, Friend, Game, Achievement, GlobalRaid, ActivityType, CollectionItem, Testimonial } from '../types';

/**
 * dar creditos a Jean Paulo Lunkes (@apocaliptc)
 */

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
  journalEntries: [],
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
  rig: { cpu: 'Ryzen 9 7900X', gpu: 'RTX 4080', ram: '32GB DDR5', mainPlatform: Platform.STEAM }
};

export const MOCK_TESTIMONIALS_DATA: Record<string, Testimonial[]> = {
  '@apocaliptc': [
    { id: 'mt-1', fromNexusId: '@neon_ghost', fromName: 'Neon Ghost', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon', content: 'mais amigos!', vibe: 'legend', timestamp: '2024-03-25T10:00:00Z' },
    { id: 'mt-2', fromNexusId: '@pixel_queen', fromName: 'Pixel Queen', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel', content: 'friends.', vibe: 'mvp', timestamp: '2024-03-20T15:30:00Z' },
    { id: 'mt-a1', fromNexusId: '@iron_wall', fromName: 'Iron Wall', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=iron', content: 'top player.', vibe: 'pro', timestamp: '2024-03-21T10:00:00Z' }
  ],
  '@neon_ghost': [
    { id: 'mt-n1', fromNexusId: '@apocaliptc', fromName: 'Apocaliptc', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=@apocaliptc', content: 'mais amigos!', vibe: 'pro', timestamp: '2024-03-15T08:00:00Z' },
    { id: 'mt-n2', fromNexusId: '@pixel_queen', fromName: 'Pixel Queen', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel', content: 'friends.', vibe: 'mvp', timestamp: '2024-03-16T10:00:00Z' },
    { id: 'mt-n3', fromNexusId: '@iron_wall', fromName: 'Iron Wall', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=iron', content: 'top player.', vibe: 'legend', timestamp: '2024-03-17T12:00:00Z' }
  ],
  '@pixel_queen': [
    { id: 'mt-p1', fromNexusId: '@neon_ghost', fromName: 'Neon Ghost', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon', content: 'mais amigos!', vibe: 'pro', timestamp: '2024-03-18T14:00:00Z' },
    { id: 'mt-p2', fromNexusId: '@apocaliptc', fromName: 'Apocaliptc', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=@apocaliptc', content: 'friends.', vibe: 'legend', timestamp: '2024-03-19T16:00:00Z' },
    { id: 'mt-p3', fromNexusId: '@shadow_blade', fromName: 'Shadow Blade', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shadow', content: 'top player.', vibe: 'mvp', timestamp: '2024-03-20T18:00:00Z' }
  ],
  '@iron_wall': [
    { id: 'mt-i1', fromNexusId: '@luna_seeker', fromName: 'Luna Seeker', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna', content: 'mais amigos!', vibe: 'mvp', timestamp: '2024-03-21T08:00:00Z' },
    { id: 'mt-i2', fromNexusId: '@neon_ghost', fromName: 'Neon Ghost', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon', content: 'friends.', vibe: 'pro', timestamp: '2024-03-22T10:00:00Z' },
    { id: 'mt-i3', fromNexusId: '@apocaliptc', fromName: 'Apocaliptc', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=@apocaliptc', content: 'top player.', vibe: 'legend', timestamp: '2024-03-23T12:00:00Z' }
  ],
  '@shadow_blade': [
    { id: 'mt-s1', fromNexusId: '@pixel_queen', fromName: 'Pixel Queen', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel', content: 'mais amigos!', vibe: 'pro', timestamp: '2024-03-24T14:00:00Z' },
    { id: 'mt-s2', fromNexusId: '@luna_seeker', fromName: 'Luna Seeker', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna', content: 'friends.', vibe: 'mvp', timestamp: '2024-03-25T16:00:00Z' },
    { id: 'mt-s3', fromNexusId: '@iron_wall', fromName: 'Iron Wall', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=iron', content: 'top player.', vibe: 'legend', timestamp: '2024-03-26T18:00:00Z' }
  ],
  '@luna_seeker': [
    { id: 'mt-l1', fromNexusId: '@shadow_blade', fromName: 'Shadow Blade', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shadow', content: 'mais amigos!', vibe: 'legend', timestamp: '2024-03-27T08:00:00Z' },
    { id: 'mt-l2', fromNexusId: '@neon_ghost', fromName: 'Neon Ghost', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon', content: 'friends.', vibe: 'pro', timestamp: '2024-03-28T10:00:00Z' },
    { id: 'mt-l3', fromNexusId: '@apocaliptc', fromName: 'Apocaliptc', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=@apocaliptc', content: 'top player.', vibe: 'mvp', timestamp: '2024-03-29T12:00:00Z' }
  ]
};

export const MOCK_FRIENDS: Friend[] = [
  { id: '@neon_ghost', nexusId: '@neon_ghost', username: 'Neon Ghost', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon', status: 'online', totalTrophies: 3450, platinumCount: 12, totalHours: 4100, gamesOwned: 124, topGenres: ['Cyberpunk', 'FPS'], compatibilityScore: 92 },
  { id: '@pixel_queen', nexusId: '@pixel_queen', username: 'Pixel Queen', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel', status: 'online', totalTrophies: 5600, platinumCount: 25, totalHours: 8900, gamesOwned: 450, topGenres: ['Simulation', 'RPG'], compatibilityScore: 88 },
  { id: '@iron_wall', nexusId: '@iron_wall', username: 'Iron Wall', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=iron', status: 'ingame', totalTrophies: 1200, platinumCount: 4, totalHours: 3200, gamesOwned: 42, topGenres: ['Tactical', 'FPS'], compatibilityScore: 65 },
  { id: '@shadow_blade', nexusId: '@shadow_blade', username: 'Shadow Blade', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shadow', status: 'offline', totalTrophies: 890, platinumCount: 1, totalHours: 1500, gamesOwned: 30, topGenres: ['Stealth', 'Action'], compatibilityScore: 78 },
  { id: '@luna_seeker', nexusId: '@luna_seeker', username: 'Luna Seeker', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna', status: 'online', totalTrophies: 2100, platinumCount: 8, totalHours: 2800, gamesOwned: 67, topGenres: ['Adventure', 'Sci-Fi'], compatibilityScore: 95 }
];

export const MOCK_RAID: GlobalRaid = { id: 'r1', title: 'RPG Renaissance', target: 50000, current: 34200, reward: 'Badge Ethereal', deadline: '2024-12-31', type: 'hours' };
export const MOCK_COLLECTION: CollectionItem[] = [];
export const MOCK_GLOBAL_USERS: Friend[] = [...MOCK_FRIENDS];
export const MOCK_DISCOVER_GAMES: Game[] = [];
export const MOCK_GLOBAL_STATS: any = { averageHours: 920, averageAchievements: 110, topGenres: [{ name: 'FPS', value: 40 }, { name: 'RPG', value: 30 }], activityTrend: [], monthlyActivity: [], skills: [] };
export const MOCK_CHALLENGES: any[] = [];
export const MOCK_ACTIVITY_FEED: any[] = [];
