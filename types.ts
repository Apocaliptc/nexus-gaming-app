
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
  JOURNAL = 'journal',
  VIDEO = 'video',
  STREAM = 'stream',
  CHALLENGE = 'challenge'
}

export interface Testimonial {
  id: string;
  fromNexusId: string;
  fromName: string;
  fromAvatar: string;
  content: string;
  timestamp: string;
  vibe: 'pro' | 'mvp' | 'legend';
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
  aiFeasibilityScore: number;
  aiComment: string;
}

export interface RigSpecs {
  cpu?: string;
  gpu?: string;
  ram?: string;
  mainPlatform: Platform;
  setupImage?: string;
}

export interface BacklogAnalysis {
  unplayedGamesCount: number;
  estimatedTimeToClear: number; // hours
  monetaryValueLost: number; // simulated $
  nextTarget: string;
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
  rig?: RigSpecs;
  backlog?: BacklogAnalysis;
  testimonials?: Testimonial[];
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
  rig?: RigSpecs;
}

export interface AIInsight {
  personaTitle: string;
  description: string;
  suggestedGenres: string[];
  improvementTip: string;
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
    videoUrl?: string;
    viewers?: number;
    challengeGoal?: string;
  };
  likes: number;
  comments?: number;
  hasLiked?: boolean;
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
