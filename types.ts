
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

export enum ActivityType {
  ACHIEVEMENT = 'achievement',
  PLATINUM = 'platinum',
  GAME_STARTED = 'game_started',
  COLLECTION_ADD = 'collection_add',
  POST = 'post',
  JOURNAL = 'journal'
}

export interface JournalEntry {
  id: string;
  date: string;
  gameTitle: string;
  rawInput: string;
  narrative: string;
  mood: string;
}

export enum SuggestionStatus {
  VOTING = 'voting',
  VALIDATING = 'validating',
  IMPLEMENTING = 'implementing',
  LIVE = 'live',
  REJECTED = 'rejected'
}

export enum ChallengeType {
  SPEEDRUN = 'speedrun',
  COLLECTION = 'collection',
  DIFFICULTY = 'difficulty',
  SOCIAL = 'social'
}

// Added missing Challenge interface to fix compilation errors
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  points: number;
  status: 'active' | 'completed' | 'expired';
}

export interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: string;
  type: 'achievement' | 'milestone' | 'evolution' | 'journal';
  gameTitle?: string;
  importance: 'normal' | 'high' | 'legendary';
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
  genreDistribution: { name: string; value: number }[];
  platformDistribution: { name: string; value: number }[];
  consistency: { currentStreak: number; longestStreak: number; longestSession: number; avgSessionLength: number; totalSessions: number };
  weeklyActivity: { day: string; hours: number }[];
  monthlyActivity: { month: string; hours: number }[];
  skills: { subject: string; A: number; fullMark: number }[];
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
  achievements?: Achievement[];
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
  currentActivity?: string;
  totalTrophies: number;
  platinumCount: number;
  totalHours: number;
  gamesOwned: number;
  topGenres: string[];
  compatibilityScore: number;
  prestigePoints?: number;
  linkedAccounts?: LinkedAccount[];
  weeklyActivity?: { day: string; hours: number }[];
  monthlyActivity?: { month: string; hours: number }[];
  skills?: { subject: string; value: number }[];
}

export interface AIInsight {
  personaTitle: string;
  description: string;
  suggestedGenres: string[];
  improvementTip: string;
}

export interface CollectionItem {
  id: string;
  ownerId: string;
  name: string;
  type: string;
  condition: string;
  status: 'collection' | 'trade' | 'sale' | string;
  imageUrl: string;
  value: number;
  dateAdded: string;
}

export interface CommunitySuggestion {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  votes: number;
  status: SuggestionStatus;
  category: 'feature' | 'integration' | 'ui' | 'social';
  createdAt: string;
  aiFeasibilityScore?: number;
  aiComment?: string;
  hasVoted?: boolean;
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
  };
  likes: number;
  comments?: number;
  hasLiked?: boolean;
}

export interface GlobalStats {
  averageHours: number;
  averageAchievements: number;
  topGenres: { name: string; value: number }[];
  activityTrend: { day: string; hours: number }[];
  monthlyActivity: { month: string; hours: number }[];
  skills: { subject: string; value: number }[];
}

export interface Quest {
  id: string;
  title: string;
  rewardXP: number;
  progress: number;
  total: number;
}

export interface PartySuggestion {
  id: string;
  friendId?: string;
  friendName: string;
  friendAvatar: string;
  game: string;
}
