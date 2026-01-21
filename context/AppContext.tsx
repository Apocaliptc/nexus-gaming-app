
import { UserStats, Platform, LinkedAccount, Game, Friend, ActivityEvent, JournalEntry, ActivityType } from '../types';
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
    setFriends([]);
    localStorage.removeItem('nexus_active_session');
    localStorage.removeItem('nexus_access_token');
    setIsCloudActive(nexusCloud.isCloudActive());
  };

  const updateCloudConfig = (url: string, key: string) => {
    nexusCloud.updateConfig(url, key);
    setIsCloudActive(nexusCloud.isCloudActive());
  };

  const addManualGame = async (game: Game) => {
    if (!userStats) return;
    setIsSyncing(true);
    await nexusCloud.saveGame(userStats.nexusId, game);
    await nexusCloud.postActivity(userStats.nexusId, {
        type: ActivityType.COLLECTION_ADD,
        details: { gameTitle: game.title, gameCover: game.coverUrl, content: `Adicionou ${game.title} ao seu legado.` }
    });
    setUserStats(prev => {
      if (!prev) return null;
      return {
        ...prev,
        recentGames: [game, ...prev.recentGames],
        totalHours: prev.totalHours + game.hoursPlayed,
        totalAchievements: prev.totalAchievements + game.achievementCount,
        gamesOwned: (prev.gamesOwned || 0) + 1
      };
    });
    setIsSyncing(false);
  };

  const saveJournalMemory = async (entry: JournalEntry) => {
    if (!userStats) return;
    setIsSyncing(true);
    await nexusCloud.saveJournalEntry(userStats.nexusId, entry);
    await nexusCloud.postActivity(userStats.nexusId, {
        type: ActivityType.JOURNAL,
        details: { gameTitle: entry.gameTitle, content: entry.narrative }
    });
    setUserStats(prev => {
      if (!prev) return null;
      return {
        ...prev,
        journalEntries: [entry, ...(prev.journalEntries || [])]
      };
    });
    setIsSyncing(false);
  };

  const importNexusData = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.nexusId) {
        setUserStats(data);
        return true;
      }
      return false;
    } catch (e) { return false; }
  };

  const toggleAchievement = (gameId: string, achievementId: string) => {
    setUserStats(prev => {
      if (!prev) return null;
      const updatedGames = prev.recentGames.map(game => {
        if (game.id !== gameId) return game;
        const updatedAchievements = (game.achievements || []).map(ach => {
          if (ach.id !== achievementId) return ach;
          const isUnlocked = !!ach.unlockedAt;
          const unlockedAt = isUnlocked ? undefined : new Date().toISOString();
          
          if (!isUnlocked) {
              nexusCloud.postActivity(prev.nexusId, {
                  type: ActivityType.ACHIEVEMENT,
                  details: { gameTitle: game.title, gameCover: game.coverUrl, content: `Conquistou: ${ach.name}` }
              });
          }

          return { ...ach, unlockedAt };
        });
        const gameUpd = { ...game, achievements: updatedAchievements, achievementCount: updatedAchievements.filter(a => a.unlockedAt).length };
        nexusCloud.saveGame(prev.nexusId, gameUpd);
        return gameUpd;
      });
      return { ...prev, recentGames: updatedGames, totalAchievements: updatedGames.reduce((acc, g) => acc + g.achievementCount, 0) };
    });
  };

  const addFriend = async (friend: Friend) => {
    if (!userStats) return;
    setIsSyncing(true);
    const updated = await nexusCloud.addFriend(userStats.nexusId, friend);
    setFriends(updated);
    setIsSyncing(false);
  };

  const removeFriend = async (friendNexusId: string) => {
    if (!userStats) return;
    setIsSyncing(true);
    const updated = await nexusCloud.removeFriend(userStats.nexusId, friendNexusId);
    setFriends(updated);
    setIsSyncing(false);
  };

  const linkAccount = (platform: Platform, username: string, games: Game[], totalHours: number) => {
    if (!userStats) return;
    setUserStats(prev => {
      if (!prev) return null;
      const existingIds = new Set(prev.recentGames.map(g => g.title + g.platform));
      const newGames = games.filter(g => !existingIds.has(g.title + g.platform));
      
      newGames.forEach(g => nexusCloud.saveGame(prev.nexusId, g));

      return {
        ...prev,
        linkedAccounts: [...prev.linkedAccounts.filter(a => a.platform !== platform), { platform, username }],
        platformsConnected: [...prev.platformsConnected.filter(p => p !== platform), platform],
        recentGames: [...newGames, ...prev.recentGames],
        totalHours: (prev.totalHours || 0) + totalHours,
        gamesOwned: (prev.gamesOwned || 0) + newGames.length,
        totalAchievements: (prev.totalAchievements || 0) + newGames.reduce((acc, g) => acc + g.achievementCount, 0)
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
      updateCloudConfig, saveJournalMemory,
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
