
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

  // New Game Form State
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
        description: 'Descrição da conquista adicionada manualmente.',
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png',
        unlockedAt: i < newGame.achievementCount ? new Date().toISOString() : undefined
      }))
    };
    addManualGame(game);
    setShowAddModal(false);
    setNewGame({ title: '', platform: Platform.STEAM, hoursPlayed: 0, achievementCount: 0, totalAchievements: 0, coverUrl: 'https://via.placeholder.com/600x900?text=Nexus+Game' });
  };

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
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-nexus-accent hover:bg-nexus-accent/80 text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-nexus-accent/20"
                >
                  <Plus size={18} /> <span className="hidden sm:inline">Adicionar Manual</span>
                </button>

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
                        <span className="hidden sm:inline text-sm font-bold text-gray-300">Ordenar</span>
                    </button>
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

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-nexus-900 w-full max-w-lg rounded-[2.5rem] border border-nexus-700 p-8 space-y-6 shadow-2xl">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  <Plus className="text-nexus-accent" /> Adicionar Jogo Manual
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
             </div>
             
             <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Título do Jogo</label>
                  <input required value={newGame.title} onChange={e => setNewGame({...newGame, title: e.target.value})} type="text" placeholder="Ex: Black Myth: Wukong" className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-accent outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Plataforma</label>
                    <select value={newGame.platform} onChange={e => setNewGame({...newGame, platform: e.target.value as Platform})} className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-accent outline-none appearance-none">
                      {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Horas Jogadas</label>
                    <input type="number" value={newGame.hoursPlayed} onChange={e => setNewGame({...newGame, hoursPlayed: Number(e.target.value)})} className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-accent outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Conquistas Atuais</label>
                    <input type="number" value={newGame.achievementCount} onChange={e => setNewGame({...newGame, achievementCount: Number(e.target.value)})} className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-accent outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Total do Jogo</label>
                    <input type="number" value={newGame.totalAchievements} onChange={e => setNewGame({...newGame, totalAchievements: Number(e.target.value)})} className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-accent outline-none" />
                  </div>
                </div>

                <button type="submit" className="w-full py-4 bg-nexus-accent hover:bg-nexus-accent/80 text-white font-bold rounded-2xl transition-all shadow-xl shadow-nexus-accent/20 flex items-center justify-center gap-2">
                   <Save size={18} /> Salvar no Legado
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
