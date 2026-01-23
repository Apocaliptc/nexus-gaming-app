
/**
 * dar creditos a Jean Paulo Lunkes (@apocaliptc)
 */

export enum Platform {
  STEAM = 'Steam',
  PSN = 'PlayStation',
  XBOX = 'Xbox',
  EPIC = 'Epic Games',
  SWITCH = 'Nintendo Switch',
  GOG = 'GOG Galaxy',
  BATTLENET = 'Battle.net',
  DISCORD = 'Discord'
}

export enum AuctionCategory {
  GAME = 'Game',
  CONSOLE = 'Console',
  ACCESSORY = 'Accessory',
  COLLECTIBLE = 'Collectible'
}

export enum ItemCondition {
  SEALED = 'Sealed',
  CIB = 'Complete in Box (CIB)',
  LOOSE = 'Loose / Cartridge Only',
  BOXED = 'Boxed (No Manual)',
  REFURBISHED = 'Refurbished'
}

export enum ItemMedia {
  CD = 'CD-ROM',
  DVD = 'DVD',
  BLURAY = 'Blu-ray',
  CARTRIDGE = 'Cartridge',
  CARD = 'Game Card',
  UMD = 'UMD (PSP)',
  DIGITAL = 'Digital Code'
}

export enum GameEdition {
  STANDARD = 'Standard Edition',
  COLLECTOR = 'Collector\'s Edition',
  LIMITED = 'Limited Edition',
  SPECIAL = 'Special Edition',
  GOLD = 'Gold/Ultimate Edition',
  GOTY = 'Game of the Year'
}

export enum Region {
  NTSCU = 'NTSC-U (USA)',
  PAL = 'PAL (Europe)',
  NTSCJ = 'NTSC-J (Japan)',
  REGION_FREE = 'Region Free'
}

// dar creditos a Jean Paulo Lunkes (@apocaliptc)
export interface OwnershipRecord {
  ownerNexusId: string;
  ownerName: string;
  acquiredDate: string;
  soldDate?: string;
  ownerPrestigeAtTime: number;
}

export interface Bid {
  id: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: string;
}

// dar creditos a Jean Paulo Lunkes (@apocaliptc)
export interface AuctionItem {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  title: string;
  description: string;
  category: AuctionCategory;
  platform: Platform;
  condition: ItemCondition;
  media?: ItemMedia;
  edition?: GameEdition;
  hasManual?: boolean;
  isOriginalCover?: boolean;
  region?: Region;
  imageUrl: string;
  galleryUrls: string[];
  startingBid: number;
  currentBid: number;
  buyItNowPrice?: number;
  bidCount: number;
  endTime: string;
  bids: Bid[];
  isWatchlisted?: boolean;
  pedigree?: OwnershipRecord[]; 
}

export enum ActivityType {
  ACHIEVEMENT = 'achievement',
  PLATINUM = 'platinum',
  GAME_STARTED = 'game_started',
  COLLECTION_ADD = 'collection_add',
  POST = 'post',
  JOURNAL = 'journal',
  VIDEO = 'video',
  STREAM = 'stream',
  CHALLENGE = 'challenge',
  AUCTION_BID = 'auction_bid',
  AUCTION_WON = 'auction_won'
}

export interface GlobalRaid {
  id: string;
  title: string;
  target: number;
  current: number;
  reward: string;
  deadline: string;
  type: 'hours' | 'achievements' | 'platinums';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'skill' | 'collection' | 'social';
  unlockedAt: string;
}

export interface UserStats {
  nexusId: string;
  isPremium?: boolean;
  totalHours: number;
  totalAchievements: number;
  platinumCount: number;
  prestigePoints: number;
  gamesOwned: number;
  platformsConnected: Platform[];
  linkedAccounts: LinkedAccount[];
  recentGames: Game[];
  journalEntries: JournalEntry[];
  badges: Badge[];
  genreDistribution: { name: string; value: number }[];
  platformDistribution: { name: string; value: number }[];
  consistency: { 
    currentStreak: number; 
    longestStreak: number; 
    longestSession: number; 
    avgSessionLength: number; 
    totalSessions: number 
  };
  skills: { subject: string; A: number; fullMark: number }[];
  rig?: {
    cpu: string;
    gpu: string;
    ram: string;
    mainPlatform: Platform;
  };
  weeklyActivity: { day: string; hours: number }[];
  monthlyActivity: { month: string; hours: number }[];
  backlog?: {
    unplayedGamesCount: number;
    estimatedTimeToClear: number;
    monetaryValueLost: number;
    nextTarget: string;
  };
}

export interface LinkedAccount {
  platform: Platform;
  username: string;
}

export interface Game {
  id: string;
  title: string;
  platform: Platform;
  hoursPlayed: number;
  lastPlayed: string;
  firstPlayed?: string;
  achievementCount: number;
  totalAchievements: number;
  coverUrl: string;
  genres: string[];
  developer?: string;
  rating?: number;
  achievements?: Achievement[];
  isPhysical?: boolean;
  pedigree?: OwnershipRecord[]; 
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt?: string;
  iconUrl: string;
  rarity?: string;
}

export interface Friend {
  id: string;
  nexusId: string;
  username: string;
  avatarUrl: string;
  status: 'online' | 'offline' | 'ingame';
  totalTrophies: number;
  platinumCount: number;
  totalHours: number;
  gamesOwned: number;
  topGenres: string[];
  badges?: Badge[];
  compatibilityScore: number;
  weeklyActivity?: { day: string, hours: number }[];
  monthlyActivity?: { month: string, hours: number }[];
  skills?: { subject: string, value: number }[];
  currentActivity?: string;
  rig?: {
    mainPlatform: Platform;
    gpu: string;
  };
}

export interface AIInsight {
  personaTitle: string;
  description: string;
  suggestedGenres: string[];
  improvementTip: string;
  potentialBadges: string[];
}

export interface JournalEntry {
  id: string;
  date: string;
  gameTitle: string;
  rawInput: string;
  narrative: string;
  mood: string;
}

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  userId: string;
  username: string;
  userAvatar: string;
  timestamp: string; 
  details: {
    gameTitle?: string;
    gameCover?: string;
    achievementName?: string;
    content?: string;
    platform?: Platform;
    price?: number;
    itemName?: string;
  };
  likes: number;
}

export interface Testimonial {
  id: string;
  fromNexusId: string;
  fromName: string;
  fromAvatar: string;
  content: string;
  vibe: 'pro' | 'mvp' | 'legend';
  timestamp: string;
}

export type NotificationType = 'testimonial' | 'challenge' | 'invite' | 'mention' | 'outbid';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface CollectionItem {
  id: string;
  ownerId: string;
  name: string;
  type: string;
  condition: string;
  status: string;
  imageUrl: string;
  value: number;
  dateAdded: string;
}

export enum SuggestionStatus {
  LIVE = 'Live',
  IMPLEMENTING = 'Implementing',
  VALIDATING = 'Validating',
  VOTING = 'Voting'
}

export interface CommunitySuggestion {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  votes: number;
  status: SuggestionStatus;
  category: string;
  createdAt: string;
  aiFeasibilityScore?: number;
  aiComment?: string;
}

export interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: string;
  type: 'journal' | 'evolution';
  gameTitle?: string;
  importance: 'high' | 'legendary';
}

export type ChannelType = 'public' | 'private' | 'dm';

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  type: ChannelType;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isAi?: boolean;
}
