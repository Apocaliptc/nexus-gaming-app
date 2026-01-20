
import React, { useState, useMemo } from 'react';
import { MOCK_USER_STATS } from '../services/mockData';
import { Game, Platform } from '../types';
import { Search, Filter, Trophy, Calendar, SortAsc, AlertCircle, CheckCircle2, Grid, List as ListIcon } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { GameDetailView } from './GameDetailView';
import { GameListItem } from './GameListItem';

type SortOption = 'last_achievement' | 'name' | 'trophies_earned' | 'trophies_missing';

export const GameLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('last_achievement');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [games] = useState<Game[]>(MOCK_USER_STATS.recentGames);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Helper to get the timestamp of the very last achievement unlocked in a game
  const getLastAchievementDate = (game: Game): number => {
    if (!game.achievements || game.achievements.length === 0) return 0;
    const unlocked = game.achievements.filter(a => a.unlockedAt);
    if (unlocked.length === 0) return 0;
    return Math.max(...unlocked.map(a => new Date(a.unlockedAt!).getTime()));
  };

  const sortedGames = useMemo(() => {
    let filtered = games.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (selectedPlatform !== 'all') {
        filtered = filtered.filter(g => g.platform === selectedPlatform);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'trophies_earned':
          return b.achievementCount - a.achievementCount;
        case 'trophies_missing':
          const missingA = a.totalAchievements - a.achievementCount;
          const missingB = b.totalAchievements - b.achievementCount;
          return missingB - missingA;
        case 'last_achievement':
        default:
          const dateA = getLastAchievementDate(a);
          const dateB = getLastAchievementDate(b);
          const fallbackA = new Date(a.lastPlayed).getTime();
          const fallbackB = new Date(b.lastPlayed).getTime();
          return (dateB || fallbackB) - (dateA || fallbackA);
      }
    });
  }, [games, searchTerm, sortBy, selectedPlatform]);

  if (selectedGame) {
    return (
      <div className="h-full relative">
         <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} />
      </div>
    );
  }

  const platforms = [Platform.STEAM, Platform.PSN, Platform.XBOX, Platform.SWITCH, Platform.BATTLENET, Platform.EPIC, Platform.GOG];

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in text-gray-100 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-nexus-700 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
            <h1 className="text-3xl font-display font-bold text-white">Meus Jogos</h1>
            <p className="text-gray-400">Gerencie sua coleção e rastreie seu progresso.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                    type="text" 
                    placeholder="Buscar jogo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-nexus-900 border border-nexus-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-nexus-accent outline-none w-full md:w-64"
                    />
                </div>
                
                <div className="relative group">
                    <button className="flex items-center gap-2 bg-nexus-900 border border-nexus-700 rounded-xl px-4 py-2.5 hover:bg-nexus-800 transition-colors">
                        <Filter size={18} className="text-nexus-secondary" />
                        <span className="hidden sm:inline text-sm font-bold text-gray-300">
                            {sortBy === 'name' && 'Nome'}
                            {sortBy === 'last_achievement' && 'Recentes'}
                            {sortBy === 'trophies_earned' && 'Conquistas'}
                            {sortBy === 'trophies_missing' && 'Faltantes'}
                        </span>
                    </button>
                    {/* Dropdown Sort */}
                    <div className="absolute right-0 mt-2 w-48 bg-nexus-800 border border-nexus-700 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
                        <button onClick={() => setSortBy('last_achievement')} className="w-full text-left px-4 py-3 text-sm hover:bg-nexus-700 flex items-center gap-2 text-gray-300"><Calendar size={14} /> Recentes</button>
                        <button onClick={() => setSortBy('trophies_earned')} className="w-full text-left px-4 py-3 text-sm hover:bg-nexus-700 flex items-center gap-2 text-gray-300"><CheckCircle2 size={14} /> Mais Conquistas</button>
                        <button onClick={() => setSortBy('trophies_missing')} className="w-full text-left px-4 py-3 text-sm hover:bg-nexus-700 flex items-center gap-2 text-gray-300"><AlertCircle size={14} /> Faltantes</button>
                        <button onClick={() => setSortBy('name')} className="w-full text-left px-4 py-3 text-sm hover:bg-nexus-700 flex items-center gap-2 text-gray-300"><SortAsc size={14} /> Nome (A-Z)</button>
                    </div>
                </div>
            </div>
        </div>

        {/* Platform Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button 
                onClick={() => setSelectedPlatform('all')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${selectedPlatform === 'all' ? 'bg-nexus-accent text-white' : 'bg-nexus-800 text-gray-400 hover:text-white border border-nexus-700'}`}
            >
                Todos
            </button>
            {platforms.map(p => (
                <button
                    key={p}
                    onClick={() => setSelectedPlatform(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${selectedPlatform === p ? 'bg-nexus-800 text-white border-nexus-accent' : 'bg-nexus-800 text-gray-400 border-nexus-700 hover:text-white'}`}
                >
                    <PlatformIcon platform={p} className="w-4 h-4" />
                    {p}
                </button>
            ))}
        </div>
      </div>

      {/* Game List */}
      <div className="space-y-4 pb-8 overflow-y-auto custom-scrollbar flex-1">
        {sortedGames.map((game) => (
            <GameListItem 
                key={game.id} 
                game={game} 
                onClick={() => setSelectedGame(game)} 
            />
        ))}

        {sortedGames.length === 0 && (
          <div className="py-20 text-center text-gray-500">
            <Trophy size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">Nenhum jogo encontrado com este filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
};
