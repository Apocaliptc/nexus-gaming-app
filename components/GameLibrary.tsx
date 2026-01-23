
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Game, Platform } from '../types';
import { Search, Filter, Trophy, Calendar, SortAsc, AlertCircle, CheckCircle2, Plus, X, Save } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { GameDetailView } from './GameDetailView';
import { GameListItem } from './GameListItem';

type SortOption = 'last_achievement' | 'name' | 'trophies_earned' | 'trophies_missing';

export const GameLibrary: React.FC = () => {
  const { userStats, addManualGame } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('last_achievement');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newGame, setNewGame] = useState({
    title: '',
    platform: Platform.STEAM,
    hoursPlayed: 0,
    achievementCount: 0,
    totalAchievements: 0,
    coverUrl: 'https://via.placeholder.com/600x900?text=Nexus+Game'
  });

  const games = userStats?.recentGames || [];

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
        case 'name': return a.title.localeCompare(b.title);
        case 'trophies_earned': return b.achievementCount - a.achievementCount;
        case 'trophies_missing': return (b.totalAchievements - b.achievementCount) - (a.totalAchievements - a.achievementCount);
        default: return (getLastAchievementDate(b) || new Date(b.lastPlayed).getTime()) - (getLastAchievementDate(a) || new Date(a.lastPlayed).getTime());
      }
    });
  }, [games, searchTerm, sortBy, selectedPlatform]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const game: Game = {
      ...newGame,
      id: `manual-${Date.now()}`,
      lastPlayed: new Date().toISOString(),
      firstPlayed: new Date().toISOString(),
      genres: ['Manual Entry'],
      achievements: Array.from({ length: newGame.totalAchievements }).map((_, i) => ({
        id: `ach-${i}`,
        name: `Conquista ${i + 1}`,
        description: 'Manual entry.',
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png',
        unlockedAt: i < newGame.achievementCount ? new Date().toISOString() : undefined
      }))
    };
    addManualGame(game);
    setShowAddModal(false);
  };

  if (selectedGame) {
    return <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} />;
  }

  const platforms = [Platform.STEAM, Platform.PSN, Platform.XBOX, Platform.SWITCH, Platform.BATTLENET, Platform.EPIC, Platform.GOG];

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 overflow-hidden animate-fade-in">
      {/* Header Compacto */}
      <div className="p-6 md:p-8 space-y-6 border-b border-nexus-800 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">Meus Jogos</h1>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Coleção Unificada Nexus</p>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-nexus-accent p-2.5 rounded-xl hover:bg-nexus-accent/80 transition-all shadow-lg"
                  title="Adicionar Manual"
                >
                  <Plus size={20} />
                </button>
                <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Pesquisar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-nexus-900 border border-nexus-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-nexus-accent outline-none"
                    />
                </div>
            </div>
        </div>

        {/* Tags de Filtro com Scroll Horizontal */}
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar scroll-smooth no-scrollbar">
            <button 
                onClick={() => setSelectedPlatform('all')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedPlatform === 'all' ? 'bg-nexus-accent text-white border-nexus-accent shadow-md' : 'bg-nexus-900 text-gray-500 border-nexus-800'}`}
            >
                Todos
            </button>
            {platforms.map(p => (
                <button
                    key={p}
                    onClick={() => setSelectedPlatform(p)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap border ${selectedPlatform === p ? 'bg-nexus-800 text-white border-nexus-accent' : 'bg-nexus-900 text-gray-500 border-nexus-800'}`}
                >
                    <PlatformIcon platform={p} className="w-3 h-3" />
                    {p}
                </button>
            ))}
        </div>
      </div>

      {/* Lista de Jogos - Rolagem Independente */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-3">
        {sortedGames.map((game) => (
            <GameListItem 
                key={game.id} 
                game={game} 
                onClick={() => setSelectedGame(game)} 
            />
        ))}

        {sortedGames.length === 0 && (
          <div className="py-20 text-center text-gray-600">
            <Trophy size={40} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm font-bold uppercase tracking-widest">Céus vazios...</p>
          </div>
        )}
      </div>

      {/* Modal Ajustado para Telas Pequenas */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-nexus-900 w-full max-w-md rounded-[2rem] border border-nexus-700 p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-display font-bold text-white">Adicionar Jogo</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
             </div>
             
             <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Título</label>
                  <input required value={newGame.title} onChange={e => setNewGame({...newGame, title: e.target.value})} type="text" className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-nexus-accent" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Plataforma</label>
                    <select value={newGame.platform} onChange={e => setNewGame({...newGame, platform: e.target.value as Platform})} className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-sm text-white outline-none">
                      {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Horas</label>
                    <input type="number" value={newGame.hoursPlayed} onChange={e => setNewGame({...newGame, hoursPlayed: Number(e.target.value)})} className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-sm text-white outline-none" />
                  </div>
                </div>

                <button type="submit" className="w-full py-4 bg-nexus-accent text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-xl transition-all">
                   Sincronizar Manualmente
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
