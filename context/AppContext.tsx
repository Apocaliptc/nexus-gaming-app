
import { UserStats, Platform, LinkedAccount, Game, Friend, ActivityEvent, JournalEntry, ActivityType, AuctionItem, Bid } from '../types';
import { nexusCloud } from '../services/nexusCloud';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  currentUser: any | null;
  userStats: UserStats | null;
  setUserStats: (stats: UserStats | ((prev: UserStats | null) => UserStats | null)) => void;
  friends: Friend[];
  addFriend: (friend: Friend) => Promise<void>;
  removeFriend: (friendNexusId: string) => Promise<void>;
  toggleAchievement: (gameId: string, achievementId: string) => void;
  linkAccount: (platform: Platform, username: string, games: Game[], totalHours: number) => void;
  unlinkAccount: (platform: Platform) => void;
  addManualGame: (game: Game) => void;
  saveJournalMemory: (entry: JournalEntry) => void;
  importNexusData: (json: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nexusId: string) => Promise<void>;
  logout: () => void;
  placeBid: (auctionId: string, amount: number, isAuto?: boolean) => void;
  userBids: Record<string, { current: number, max: number }>;
  isInitializing: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  isCloudActive: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userStats, setUserStatsState] = useState<UserStats | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [userBids, setUserBids] = useState<Record<string, { current: number, max: number }>>({});
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCloudActive, setIsCloudActive] = useState(true);

  const setUserStats = (update: UserStats | ((prev: UserStats | null) => UserStats | null)) => {
    setIsSyncing(true);
    setUserStatsState(prev => {
      const next = typeof update === 'function' ? update(prev) : update;
      if (next) {
        nexusCloud.saveUser(next);
      }
      setTimeout(() => setIsSyncing(false), 800);
      return next;
    });
  };

  useEffect(() => {
    const init = async () => {
      try {
        const session = await nexusCloud.getActiveSession();
        if (session) {
          setUserStatsState(session);
          setCurrentUser({ email: session.nexusId });
          const userFriends = await nexusCloud.getFriends(session.nexusId);
          setFriends(userFriends);
        }
      } catch (e) {
        console.error("Erro durante a inicialização", e);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
        const profile = await nexusCloud.login(email, password);
        setUserStatsState(profile);
        setCurrentUser({ email });
        const userFriends = await nexusCloud.getFriends(profile.nexusId);
        setFriends(userFriends);
    } catch (e) { throw e; } finally { setIsLoading(false); }
  };

  const signup = async (email: string, password: string, nexusId: string) => {
    setIsLoading(true);
    try {
        const profile = await nexusCloud.signup(email, password, nexusId);
        setUserStatsState(profile);
        setCurrentUser({ email });
        setFriends([]);
    } catch (e) { throw e; } finally { setIsLoading(false); }
  };

  const logout = () => {
    nexusCloud.logout();
    setCurrentUser(null);
    setUserStatsState(null);
    setFriends([]);
  };

  const addFriend = async (friend: Friend) => {
    if (!userStats) return;
    await nexusCloud.addFriend(userStats.nexusId, friend);
    setFriends(prev => [...prev, friend]);
  };

  const removeFriend = async (friendNexusId: string) => {
    if (!userStats) return;
    await nexusCloud.removeFriend(userStats.nexusId, friendNexusId);
    setFriends(prev => prev.filter(f => f.nexusId !== friendNexusId));
  };

  const toggleAchievement = (gameId: string, achievementId: string) => {
    setUserStats(prev => {
      if (!prev) return null;
      const updatedGames = prev.recentGames.map(game => {
        if (game.id === gameId) {
          const updatedAchievements = (game.achievements || []).map(ach => {
            if (ach.id === achievementId) {
              return { ...ach, unlockedAt: ach.unlockedAt ? undefined : new Date().toISOString() };
            }
            return ach;
          });
          const unlockedCount = updatedAchievements.filter(a => a.unlockedAt).length;
          return { ...game, achievements: updatedAchievements, achievementCount: unlockedCount };
        }
        return game;
      });
      return { ...prev, recentGames: updatedGames };
    });
  };

  const linkAccount = (platform: Platform, username: string, games: Game[], totalHours: number) => {
    if (!userStats) return;
    setIsSyncing(true);
    
    setUserStatsState(prev => {
      if (!prev) return null;
      const otherPlatformGames = prev.recentGames.filter(g => g.platform !== platform);
      const mergedGames = [...otherPlatformGames, ...games];
      const realPlatinums = mergedGames.filter(g => g.achievementCount === g.totalAchievements && g.totalAchievements > 0).length;
      const realTotalHours = mergedGames.reduce((acc, g) => acc + (g.hoursPlayed || 0), 0);
      const realTotalAchievements = mergedGames.reduce((acc, g) => acc + (g.achievementCount || 0), 0);

      const updatedStats: UserStats = {
        ...prev,
        linkedAccounts: [...prev.linkedAccounts.filter(a => a.platform !== platform), { platform, username }],
        platformsConnected: Array.from(new Set([...prev.platformsConnected, platform])),
        recentGames: mergedGames,
        totalHours: Math.max(realTotalHours, totalHours),
        gamesOwned: mergedGames.length,
        totalAchievements: realTotalAchievements,
        platinumCount: realPlatinums,
        prestigePoints: prev.prestigePoints + 500
      };

      nexusCloud.saveUser(updatedStats);
      return { ...updatedStats };
    });
    
    setTimeout(() => setIsSyncing(false), 1500);
  };

  const unlinkAccount = (platform: Platform) => {
    setUserStatsState(prev => {
      if (!prev) return null;
      const remainingGames = prev.recentGames.filter(g => g.platform !== platform);
      const updated = {
        ...prev,
        linkedAccounts: prev.linkedAccounts.filter(a => a.platform !== platform),
        platformsConnected: prev.platformsConnected.filter(p => p !== platform),
        recentGames: remainingGames,
        totalHours: remainingGames.reduce((acc, g) => acc + (g.hoursPlayed || 0), 0),
        gamesOwned: remainingGames.length
      };
      nexusCloud.saveUser(updated);
      return updated;
    });
  };

  const addManualGame = async (game: Game) => {
    if (!userStats) return;
    setIsSyncing(true);
    await nexusCloud.saveGame(userStats.nexusId, game);
    setUserStatsState(prev => {
      if (!prev) return null;
      const next = { ...prev, recentGames: [game, ...prev.recentGames] };
      nexusCloud.saveUser(next);
      return next;
    });
    setTimeout(() => setIsSyncing(false), 800);
  };

  const saveJournalMemory = async (entry: JournalEntry) => {
    if (!userStats) return;
    setIsSyncing(true);
    await nexusCloud.saveJournalEntry(userStats.nexusId, entry);
    setUserStatsState(prev => {
      if (!prev) return null;
      return { ...prev, journalEntries: [entry, ...(prev.journalEntries || [])] };
    });
    setTimeout(() => setIsSyncing(false), 800);
  };

  const placeBid = (auctionId: string, amount: number, isAuto = false) => {
    setUserBids(prev => ({
      ...prev,
      [auctionId]: {
        current: isAuto ? amount : amount,
        max: isAuto ? amount : (prev[auctionId]?.max || amount)
      }
    }));
  };

  const importNexusData = (json: string): boolean => {
    try {
      const stats = JSON.parse(json) as UserStats;
      if (stats.nexusId) { setUserStats(stats); return true; }
      return false;
    } catch (e) { return false; }
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, userStats, setUserStats, friends, addFriend, removeFriend,
      toggleAchievement, login, signup, logout, saveJournalMemory,
      linkAccount, unlinkAccount, addManualGame, importNexusData,
      placeBid, userBids,
      isInitializing, isLoading, isSyncing, isCloudActive
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext error');
  return context;
};
