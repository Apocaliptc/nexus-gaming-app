
import { Platform, UserStats, Friend, Game, Achievement, GlobalRaid, ActivityType, CollectionItem, Testimonial, PCSetup, ActivityEvent } from '../types';

/**
 * dar creditos a Jean Paulo Lunkes (@apocaliptc)
 */

const generateAchievements = (gameTitle: string, count: number, total: number): Achievement[] => {
  return Array.from({ length: total }).map((_, i) => ({
    id: `ach-${gameTitle}-${i}`,
    name: i === 0 ? `Lenda de ${gameTitle}` : `Conquista ${i + 1}`,
    description: `Um marco de perícia alcançado em ${gameTitle}.`,
    iconUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${gameTitle}-${i}`,
    unlockedAt: i < count ? new Date(Date.now() - (i * 86400000)).toISOString() : undefined,
    rarity: i === 0 ? 'Ultra Rare' : i < 5 ? 'Gold' : 'Silver'
  }));
};

// JOGOS COMPARTILHADOS COM CONQUISTAS REAIS
const GAMES_POOL: Game[] = [
  { id: 'g1', title: 'Elden Ring', platform: Platform.STEAM, hoursPlayed: 245, lastPlayed: '2024-03-01', achievementCount: 42, totalAchievements: 42, coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg', genres: ['RPG', 'Souls'], achievements: generateAchievements('Elden Ring', 42, 42) },
  { id: 'g2', title: 'Cyberpunk 2077', platform: Platform.STEAM, hoursPlayed: 180, lastPlayed: '2024-02-20', achievementCount: 35, totalAchievements: 44, coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/library_600x900.jpg', genres: ['RPG', 'Cyberpunk'], achievements: generateAchievements('Cyberpunk 2077', 35, 44) },
  { id: 'g3', title: 'Bloodborne', platform: Platform.PSN, hoursPlayed: 120, lastPlayed: '2024-01-15', achievementCount: 40, totalAchievements: 40, coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.jpg', genres: ['Action', 'Souls'], achievements: generateAchievements('Bloodborne', 40, 40) },
  { id: 'g4', title: 'Hades II', platform: Platform.STEAM, hoursPlayed: 45, lastPlayed: '2024-03-10', achievementCount: 12, totalAchievements: 50, coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145350/library_600x900.jpg', genres: ['Roguelike', 'Indie'], achievements: generateAchievements('Hades II', 12, 50) }
];

export const MOCK_SETUP_APOCALIPTC: PCSetup = {
  cpu: 'AMD Ryzen 9 7900X',
  gpu: 'NVIDIA RTX 4080 16GB',
  ram: '32GB DDR5 6000MHz',
  motherboard: 'ASUS ROG STRIX X670E-E',
  storage: '2TB NVMe Gen5 SSD',
  monitor: 'Alienware 34" QD-OLED',
  mouse: 'Logitech G Pro X Superlight',
  keyboard: 'Wooting 60HE',
  headset: 'SteelSeries Arctis Nova Pro',
  case: 'Lian Li O11 Dynamic EVO',
  description: 'Estação de alta performance focada em fidelidade visual e latência mínima para títulos competitivos.'
};

export const MOCK_COLLECTION: CollectionItem[] = [
  { 
    id: 'c-ps5pro', ownerId: '@apocaliptc', name: 'PlayStation 5 Pro', type: 'Console', condition: 'Novo', status: 'collection', 
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1200&auto=format&fit=crop', value: 6200, dateAdded: '2025-11-22',
    manufacturer: 'Sony Interactive Entertainment', family: 'PlayStation', modelCode: 'CFI-7014A', region: 'Brasil (NTSC-U/C)',
    serialNumber: 'P5P9A3B7C4125896', manufacturingDate: '2025-09-15', manufacturingPlace: 'China',
    platform: 'PlayStation 5', year: 2025, generation: '9ª geração', architecture: 'AMD Custom SoC (Zen + RDNA)', storageCapacity: '2 TB SSD NVMe', mediaType: 'Blu-ray Ultra HD',
    functionality: 'Totalmente funcional', modifications: 'Nenhuma', firmware: '10.02',
    hasOriginalBox: true, hasManual: true, hasOriginalAccessories: true, hasReceipt: true,
    accessoriesIncluded: '1 controle DualSense, Cabo HDMI, Cabo de energia, Base vertical',
    rarity: 'Comum', acquisitionDate: '2025-11-22', acquisitionForm: 'Compra em varejo nacional', acquisitionValue: 6499,
    description: 'Modelo nacional, sem uso prolongado, mantido em ambiente controlado.',
    history: 'HISTÓRIA: Unidade nacional adquirida no lote de lançamento Pro. Conservação nível museu (Mint).',
    pedigree: [{ ownerNexusId: '@apocaliptc', ownerName: 'Apocaliptc', acquiredDate: '2025-11-22', ownerPrestigeAtTime: 18200 }]
  },
  { 
    id: 'c-switch2', ownerId: '@apocaliptc', name: 'Nintendo Switch 2', type: 'Console', condition: 'Usado (Excelente Estado)', status: 'collection', 
    imageUrl: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?q=80&w=1200&auto=format&fit=crop', value: 5100, dateAdded: '2026-06-18',
    manufacturer: 'Nintendo', family: 'Nintendo Switch', modelCode: 'HAC-201', region: 'Global',
    serialNumber: 'XSW2205BR0987345', manufacturingDate: '2026-03-03', manufacturingPlace: 'Vietnã',
    platform: 'Nintendo Switch', year: 2026, generation: '9ª geração', architecture: 'NVIDIA Custom Tegra', storageCapacity: '512 GB (flash interno)', mediaType: 'Cartucho proprietário Nintendo',
    functionality: 'Totalmente funcional', modifications: 'Nenhuma', firmware: '2.1.0',
    hasOriginalBox: true, hasManual: true, hasOriginalAccessories: true, hasReceipt: true,
    accessoriesIncluded: '2 Joy-Cons (E/D), Dock, Grip, Cabos HDMI e Energia',
    rarity: 'Incomum (Primeiro Lote)', acquisitionDate: '2026-06-18', acquisitionForm: 'Importação direta', acquisitionValue: 4800,
    description: 'Unidade do lote inicial, sem drift nos controles.',
    history: 'HISTÓRIA: Adquirido via importação direta do Japão. Lote inicial sem revisões de hardware posteriores.',
    pedigree: [{ ownerNexusId: '@apocaliptc', ownerName: 'Apocaliptc', acquiredDate: '2026-06-18', ownerPrestigeAtTime: 22500 }]
  },
  { 
    id: 'c1', ownerId: '@apocaliptc', name: 'NES (Original Toastbox)', type: 'Console', condition: 'Loose', status: 'collection', imageUrl: 'https://picsum.photos/400/400?random=nes', value: 280, dateAdded: '2023-05-10',
    manufacturer: 'Nintendo', family: 'Nintendo Entertainment System', modelCode: 'NES-001', region: 'NTSC-U',
    serialNumber: 'N10239420-USA', manufacturingDate: '1986-11', manufacturingPlace: 'Japan',
    platform: 'NES', year: 1985, generation: '3rd Gen', architecture: 'Ricoh 2A03 8-bit', storageCapacity: 'N/A', mediaType: 'Cartridge',
    functionality: 'Functional', modifications: 'Recapped, AV Modded', firmware: 'N/A',
    hasOriginalBox: false, hasManual: false, hasOriginalAccessories: true, hasReceipt: false,
    rarity: 'Uncommon', acquisitionDate: '2023-05-10', acquisitionForm: 'Purchase', acquisitionValue: 200,
    description: 'O console que salvou a indústria dos videogames em 1985.',
    history: 'HISTÓRIA: Encontrado em um sótão em New Jersey. Passou por restauração interna completa com capacitores novos de alta fidelidade e limpeza por ultrassom.',
    pedigree: [{ ownerNexusId: '@apocaliptc', ownerName: 'Apocaliptc', acquiredDate: '2023-05-10', ownerPrestigeAtTime: 18200 }]
  },
  { 
    id: 'c2', ownerId: '@apocaliptc', name: 'Mega Drive 3', type: 'Console', condition: 'Boxed', status: 'collection', imageUrl: 'https://picsum.photos/400/400?random=mega', value: 120, dateAdded: '2022-04-15',
    manufacturer: 'Sega (Tectoy)', family: 'Genesis / Mega Drive', modelCode: '010660', region: 'Brazil (PAL-M)',
    serialNumber: 'TEC-3310-BR-01', manufacturingDate: '1994-03', manufacturingPlace: 'Manaus, Brazil',
    platform: 'Mega Drive', year: 1994, generation: '4th Gen', architecture: 'Motorola 68000', storageCapacity: 'N/A', mediaType: 'Cartridge',
    functionality: 'Functional', modifications: 'None', firmware: 'N/A',
    hasOriginalBox: true, hasManual: true, hasOriginalAccessories: true, hasReceipt: false,
    rarity: 'Common (Regional)', acquisitionDate: '2022-04-15', acquisitionForm: 'Trade', acquisitionValue: 100,
    description: 'Edição brasileira icônica da Tectoy, compacta e potente.',
    history: 'HISTÓRIA: Item de legado nacional original com transformador integrado. Representa a soberania da Sega no Brasil durante os anos 90.',
    pedigree: [{ ownerNexusId: '@apocaliptc', ownerName: 'Apocaliptc', acquiredDate: '2022-04-15', ownerPrestigeAtTime: 18200 }]
  }
];

export const MOCK_USER_STATS: UserStats = {
  nexusId: '@apocaliptc',
  totalHours: 5240,
  totalAchievements: 2150,
  platinumCount: 48,
  prestigePoints: 18200,
  gamesOwned: 312,
  collection: [...MOCK_COLLECTION],
  setup: { ...MOCK_SETUP_APOCALIPTC },
  platformsConnected: [Platform.STEAM, Platform.PSN, Platform.XBOX],
  linkedAccounts: [
    { platform: Platform.STEAM, username: 'apocaliptc_dna' },
    { platform: Platform.PSN, username: 'PauloNexus' },
  ],
  recentGames: [...GAMES_POOL],
  journalEntries: [
    { id: 'j1', date: '2024-03-01', gameTitle: 'Elden Ring', rawInput: 'Venci a Malenia sem summons.', narrative: 'A lâmina carmesim finalmente repousou silenciosa. Diante das raízes da Árvore Sacra, o Tarnished provou que a força bruta não supera a persistência.', mood: 'Triumphant' }
  ],
  badges: [],
  genreDistribution: [{ name: 'RPG', value: 60 }, { name: 'Action', value: 25 }, { name: 'Souls', value: 15 }],
  platformDistribution: [{ name: 'Steam', value: 3100 }, { name: 'PlayStation', value: 1800 }, { name: 'Xbox', value: 340 }],
  consistency: { currentStreak: 15, longestStreak: 62, longestSession: 12, avgSessionLength: 3.8, totalSessions: 1450 },
  weeklyActivity: [],
  monthlyActivity: [
    { month: 'Jan', hours: 120 }, { month: 'Feb', hours: 95 }, { month: 'Mar', hours: 140 }
  ],
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

export const MOCK_FRIENDS: Friend[] = [
  { 
    id: '@neon_ghost', 
    nexusId: '@neon_ghost', 
    username: 'Neon Ghost', 
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon', 
    status: 'online', 
    totalTrophies: 3450, 
    platinumCount: 12, 
    totalHours: 4100, 
    gamesOwned: 124, 
    topGenres: ['Cyberpunk', 'FPS'], 
    compatibilityScore: 92,
    currentActivity: 'Night City Overdrive',
    setup: { 
      cpu: 'Intel i9-14900K', 
      gpu: 'RTX 4090 24GB', 
      ram: '64GB DDR5',
      monitor: 'Samsung Odyssey G9 OLED',
      case: 'Hyte Y70 Touch',
      description: 'Overkill build para Ray Tracing no talo. Se não rodar a 100fps em 4K, não é jogo.'
    }
  },
  { 
    id: '@pixel_queen', 
    nexusId: '@pixel_queen', 
    username: 'Pixel Queen', 
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel', 
    status: 'ingame', 
    totalTrophies: 5120, 
    platinumCount: 34, 
    totalHours: 6200, 
    gamesOwned: 450, 
    topGenres: ['JRPG', 'Indie'], 
    compatibilityScore: 88,
    currentActivity: 'Sea of Stars',
    setup: { 
      cpu: 'Ryzen 7 7800X3D', 
      gpu: 'RTX 4070 Ti (White)', 
      ram: '32GB DDR5',
      description: 'Estética Minimalista White Build. Perfeita para JRPGs e produtividade criativa.'
    }
  },
  { 
    id: '@retro_master', 
    nexusId: '@retro_master', 
    username: 'Retro Master', 
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=retro', 
    status: 'offline', 
    totalTrophies: 8900, 
    platinumCount: 150, 
    totalHours: 12000, 
    gamesOwned: 1200, 
    topGenres: ['Classic', 'Arcade'], 
    compatibilityScore: 62,
    setup: {
      cpu: 'i7 10700K',
      gpu: 'GTX 1660 Ti',
      ram: '16GB DDR4',
      description: 'Montado em um gabinete original da IBM de 1994. O verdadeiro lobo em pele de cordeiro.'
    }
  }
];

export const MOCK_TESTIMONIALS_DATA: Record<string, Testimonial[]> = {
  '@apocaliptc': [
    { id: 't1', fromNexusId: '@neon_ghost', fromName: 'Neon Ghost', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon', content: 'O cara é um monstro nos Souls. Me ajudou a platinar Elden Ring em tempo recorde!', vibe: 'legend', timestamp: '2024-03-01T10:00:00Z' },
    { id: 't2', fromNexusId: '@pixel_queen', fromName: 'Pixel Queen', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel', content: 'Parceiro de co-op sensacional. Estrategista nato!', vibe: 'pro', timestamp: '2024-02-25T15:30:00Z' }
  ],
  '@neon_ghost': [
    { id: 't3', fromNexusId: '@apocaliptc', fromName: 'Apocaliptc', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=apocaliptc', content: 'O setup dele brilha mais que o sol. Performance absoluta.', vibe: 'mvp', timestamp: '2024-03-05T09:00:00Z' }
  ],
  '@pixel_queen': [
    { id: 't4', fromNexusId: '@retro_master', fromName: 'Retro Master', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=retro', content: 'Ninguém entende mais de raridades de DS que ela. Respeito máximo.', vibe: 'legend', timestamp: '2024-02-28T18:00:00Z' }
  ]
};

export const MOCK_ACTIVITY_FEED: ActivityEvent[] = [
  {
    id: 'act-1',
    type: ActivityType.PLATINUM,
    userId: '@neon_ghost',
    username: 'Neon Ghost',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: {
      gameTitle: 'Dark Souls III',
      gameCover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/374320/library_600x900.jpg',
      content: 'O fogo foi finalmente domado. 100% das conquistas alcançadas! Glória à linhagem dos Lordes.',
      platform: Platform.STEAM
    },
    likes: 154
  },
  {
    id: 'act-2',
    type: ActivityType.CHALLENGE,
    userId: '@apocaliptc',
    username: 'Apocaliptc',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=apocaliptc',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    details: {
      gameTitle: 'Elden Ring',
      content: 'DESAFIO: Derrotar a Malenia em NG+7 usando apenas itens arremessáveis. Alguém sintoniza?'
    },
    likes: 89
  },
  {
    id: 'act-3',
    type: ActivityType.AUCTION_BID,
    userId: '@retro_master',
    username: 'Retro Master',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=retro',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    details: {
      itemName: 'Game Boy Micro (Famicom Edition)',
      price: 450,
      content: 'Uma nova relíquia entrou no leilão soberano. Estado de conservação impecável (Grade 9.8).'
    },
    likes: 42
  },
  {
    id: 'act-4',
    type: ActivityType.COLLECTION_ADD,
    userId: '@pixel_queen',
    username: 'Pixel Queen',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    details: {
      itemName: 'The Legend of Zelda: Skyward Sword (Gold Remote Bundle)',
      content: 'Acervo físico atualizado. A linhagem do herói continua crescendo no meu cofre.'
    },
    likes: 210
  }
];

export const MOCK_RAID: GlobalRaid = { id: 'r1', title: 'RPG Renaissance', target: 50000, current: 34200, reward: 'Badge Ethereal', deadline: '2024-12-31', type: 'hours' };
export const MOCK_GLOBAL_USERS: Friend[] = [...MOCK_FRIENDS];
export const MOCK_DISCOVER_GAMES: Game[] = [];
export const MOCK_GLOBAL_STATS: any = { 
  averageHours: 920, 
  averageAchievements: 110, 
  topGenres: [{ name: 'FPS', value: 40 }, { name: 'RPG', value: 30 }], 
  monthlyActivity: [
    { month: 'Jan', hours: 45 }, { month: 'Feb', hours: 55 }, { month: 'Mar', hours: 40 }
  ], 
  skills: [
    { subject: 'Reflexes', value: 65 }, { subject: 'Strategy', value: 70 }, { subject: 'Resilience', value: 80 }, { subject: 'Teamwork', value: 60 }, { subject: 'Completion', value: 50 }, { subject: 'Versatility', value: 75 }
  ],
  activityTrend: [
    { day: 'Seg', hours: 2 }, { day: 'Ter', hours: 3 }, { day: 'Qua', hours: 1.5 }, { day: 'Qui', hours: 4 }, { day: 'Sex', hours: 6 }, { day: 'Sab', hours: 10 }, { day: 'Dom', hours: 8 }
  ]
};
export const MOCK_CHALLENGES: any[] = [];
