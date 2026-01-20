
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
  login: (email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userStats, setUserStatsState] = useState<UserStats | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Wrapper for state updates that also persists to "Cloud"
  const setUserStats = (update: UserStats | ((prev: UserStats | null) => UserStats | null)) => {
    setUserStatsState(prev => {
      const next = typeof update === 'function' ? update(prev) : update;
      if (next) nexusCloud.saveUser(next);
      return next;
    });
  };

  useEffect(() => {
    const init = async () => {
      const session = await nexusCloud.getActiveSession();
      if (session) {
        setCurrentUser({ email: session.nexusId });
        setUserStatsState(session);
        const userFriends = await nexusCloud.getFriends(session.nexusId);
        setFriends(userFriends);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    const profile = await nexusCloud.initializeNewUser(email);
    setCurrentUser({ email });
    setUserStatsState(profile);
    const userFriends = await nexusCloud.getFriends(profile.nexusId);
    setFriends(userFriends);
    setIsLoading(false);
  };

  const logout = () => {
    setCurrentUser(null);
    setUserStatsState(null);
    localStorage.removeItem('nexus_cloud_v1_active_session');
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
    setFriends(prev => prev.find(f => f.id === friend.id) ? prev : [...prev, friend]);
  };

  const removeFriend = (friendId: string) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
    // To implement persistent removal in nexusCloud if needed
  };

  const linkAccount = (platform: Platform, username: string, games: Game[], totalHours: number) => {
    setUserStats(prev => {
      if (!prev) return null;
      return {
        ...prev,
        linkedAccounts: [...prev.linkedAccounts.filter(a => a.platform !== platform), { platform, username }],
        platformsConnected: [...prev.platformsConnected.filter(p => p !== platform), platform],
        recentGames: [...games, ...prev.recentGames],
        totalHours: prev.totalHours + totalHours,
        gamesOwned: prev.gamesOwned + games.length
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
      toggleAchievement, login, logout,
      linkAccount, unlinkAccount, isLoading 
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
