
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserStats, Platform, LinkedAccount, Game, Friend, ActivityEvent } from '../types';
import { nexusCloud } from '../services/nexusCloud';

interface AppContextType {
  currentUser: any | null;
  userStats: UserStats | null;
  setUserStats: (stats: UserStats | ((prev: UserStats | null) => UserStats | null)) => void;
  friends: Friend[];
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  toggleAchievement: (gameId: string, achievementId: string) => void;
  linkAccount: (platform: Platform, username: string, games: Game[], totalHours: number) => void;
  unlinkAccount: (platform: Platform) => void;
  addManualGame: (game: Game) => void;
  importNexusData: (json: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nexusId: string) => Promise<void>;
  logout: () => void;
  updateCloudConfig: (url: string, key: string) => void;
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
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCloudActive, setIsCloudActive] = useState(nexusCloud.isCloudActive());

  const setUserStats = (update: UserStats | ((prev: UserStats | null) => UserStats | null)) => {
    setIsSyncing(true);
    setUserStatsState(prev => {
      const next = typeof update === 'function' ? update(prev) : update;
      if (next) nexusCloud.saveUser(next);
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
        console.error("Erro durante a inicialização da sessão", e);
      } finally {
        setIsCloudActive(nexusCloud.isCloudActive());
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
    } catch (e) {
        throw e;
    } finally {
        setIsCloudActive(nexusCloud.isCloudActive());
        setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, nexusId: string) => {
    setIsLoading(true);
    try {
        const profile = await nexusCloud.signup(email, password, nexusId);
        setUserStatsState(profile);
        setCurrentUser({ email });
        setFriends([]);
    } catch (e) {
        throw e;
    } finally {
        setIsCloudActive(nexusCloud.isCloudActive());
        setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUserStatsState(null);
    localStorage.removeItem('nexus_active_session');
    setIsCloudActive(nexusCloud.isCloudActive());
  };

  const updateCloudConfig = (url: string, key: string) => {
    nexusCloud.updateConfig(url, key);
    setIsCloudActive(nexusCloud.isCloudActive());
  };

  const addManualGame = (game: Game) => {
    setUserStats(prev => {
      if (!prev) return null;
      return {
        ...prev,
        recentGames: [game, ...prev.recentGames],
        totalHours: prev.totalHours + game.hoursPlayed,
        totalAchievements: prev.totalAchievements + game.achievementCount,
        gamesOwned: prev.gamesOwned + 1
      };
    });
  };

  const importNexusData = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.nexusId) {
        setUserStats(data);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const toggleAchievement = (gameId: string, achievementId: string) => {
    setUserStats(prev => {
      if (!prev) return null;
      const updatedGames = prev.recentGames.map(game => {
        if (game.id !== gameId) return game;
        const updatedAchievements = (game.achievements || []).map(ach => {
          if (ach.id !== achievementId) return ach;
          return { ...ach, unlockedAt: ach.unlockedAt ? undefined : new Date().toISOString() };
        });
        return { ...game, achievements: updatedAchievements, achievementCount: updatedAchievements.filter(a => a.unlockedAt).length };
      });
      return { ...prev, recentGames: updatedGames, totalAchievements: updatedGames.reduce((acc, g) => acc + g.achievementCount, 0) };
    });
  };

  const addFriend = (friend: Friend) => {
    if (!userStats) return;
    nexusCloud.addFriend(userStats.nexusId, friend);
    setFriends(prev => prev.find(f => f.nexusId === friend.nexusId) ? prev : [...prev, friend]);
  };

  const removeFriend = (friendId: string) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
  };

  const linkAccount = (platform: Platform, username: string, games: Game[], totalHours: number) => {
    setUserStats(prev => {
      if (!prev) return null;
      const existingIds = new Set(prev.recentGames.map(g => g.title + g.platform));
      const newGames = games.filter(g => !existingIds.has(g.title + g.platform));
      
      return {
        ...prev,
        linkedAccounts: [...prev.linkedAccounts.filter(a => a.platform !== platform), { platform, username }],
        platformsConnected: [...prev.platformsConnected.filter(p => p !== platform), platform],
        recentGames: [...newGames, ...prev.recentGames],
        totalHours: prev.totalHours + totalHours,
        gamesOwned: prev.gamesOwned + newGames.length,
        totalAchievements: prev.totalAchievements + newGames.reduce((acc, g) => acc + g.achievementCount, 0)
      };
    });
  };

  const unlinkAccount = (platform: Platform) => {
    setUserStats(prev => {
      if (!prev) return null;
      return {
        ...prev,
        linkedAccounts: prev.linkedAccounts.filter(a => a.platform !== platform),
        platformsConnected: prev.platformsConnected.filter(p => p !== platform),
      };
    });
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, userStats, setUserStats, 
      friends, addFriend, removeFriend,
      toggleAchievement, login, signup, logout,
      updateCloudConfig,
      linkAccount, unlinkAccount, addManualGame, 
      importNexusData, isInitializing, isLoading, isSyncing, isCloudActive
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
