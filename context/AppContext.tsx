
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
    } catch (e) {
        throw e;
    } finally {
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
        setIsLoading(false);
    }
  };

  const logout = () => {
    nexusCloud.logout();
    setCurrentUser(null);
    setUserStatsState(null);
    setFriends([]);
  };

  // Fix: Implement missing addFriend function to manage friend connections
  const addFriend = async (friend: Friend) => {
    if (!userStats) return;
    await nexusCloud.addFriend(userStats.nexusId, friend);
    setFriends(prev => [...prev, friend]);
  };

  // Fix: Implement missing removeFriend function to manage friend connections
  const removeFriend = async (friendNexusId: string) => {
    if (!userStats) return;
    await nexusCloud.removeFriend(userStats.nexusId, friendNexusId);
    setFriends(prev => prev.filter(f => f.nexusId !== friendNexusId));
  };

  // Fix: Implement missing toggleAchievement function to update game progress
  const toggleAchievement = (gameId: string, achievementId: string) => {
    setUserStats(prev => {
      if (!prev) return null;
      const updatedGames = prev.recentGames.map(game => {
        if (game.id === gameId) {
          const updatedAchievements = (game.achievements || []).map(ach => {
            if (ach.id === achievementId) {
              return {
                ...ach,
                unlockedAt: ach.unlockedAt ? undefined : new Date().toISOString()
              };
            }
            return ach;
          });
          
          const unlockedCount = updatedAchievements.filter(a => a.unlockedAt).length;
          
          return {
            ...game,
            achievements: updatedAchievements,
            achievementCount: unlockedCount
          };
        }
        return game;
      });

      const totalAch = updatedGames.reduce((sum, g) => sum + g.achievementCount, 0);
      const totalPlat = updatedGames.filter(g => g.achievementCount === g.totalAchievements && g.totalAchievements > 0).length;

      return {
        ...prev,
        recentGames: updatedGames,
        totalAchievements: totalAch,
        platinumCount: totalPlat
      };
    });
  };

  // Fix: Implement missing importNexusData function for profile portability
  const importNexusData = (json: string): boolean => {
    try {
      const stats = JSON.parse(json) as UserStats;
      if (stats.nexusId) {
        setUserStats(stats);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const addManualGame = async (game: Game) => {
    if (!userStats) return;
    setIsSyncing(true);
    await nexusCloud.saveGame(userStats.nexusId, game);
    setUserStatsState(prev => {
      if (!prev) return null;
      const allGames = [game, ...prev.recentGames];
      const next = {
        ...prev,
        recentGames: allGames,
        totalHours: allGames.reduce((acc, g) => acc + (g.hoursPlayed || 0), 0),
        totalAchievements: allGames.reduce((acc, g) => acc + (g.achievementCount || 0), 0),
        gamesOwned: allGames.length
      };
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
      return {
        ...prev,
        journalEntries: [entry, ...(prev.journalEntries || [])]
      };
    });
    setTimeout(() => setIsSyncing(false), 800);
  };

  const linkAccount = (platform: Platform, username: string, games: Game[], totalHours: number) => {
    if (!userStats) return;
    setIsSyncing(true);
    
    setUserStatsState(prev => {
      if (!prev) return null;
      
      // Criar mapa para evitar duplicatas (chave: titulo + plataforma)
      const gameMap = new Map<string, Game>();
      
      // 1. Manter jogos de OUTRAS plataformas que já estavam lá
      prev.recentGames.forEach(g => {
        if (g.platform !== platform) {
          const key = `${g.title.toLowerCase()}-${g.platform}`;
          gameMap.set(key, g);
        }
      });
      
      // 2. Adicionar os NOVOS jogos encontrados pela IA para esta plataforma
      games.forEach(newGame => {
        const key = `${newGame.title.toLowerCase()}-${newGame.platform}`;
        gameMap.set(key, newGame);
      });
      
      const mergedGames = Array.from(gameMap.values());
      
      // 3. RECÁLCULO TOTAL ABSOLUTO
      const newTotalHours = mergedGames.reduce((acc, g) => acc + (g.hoursPlayed || 0), 0);
      const newTotalAchievements = mergedGames.reduce((acc, g) => acc + (g.achievementCount || 0), 0);
      const newPlatinumCount = mergedGames.filter(g => g.achievementCount === g.totalAchievements && g.totalAchievements > 0).length;

      const updatedStats: UserStats = {
        ...prev,
        linkedAccounts: [...prev