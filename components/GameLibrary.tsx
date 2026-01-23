
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Game, Platform } from '../types';
import { Search, Filter, Trophy, Calendar, Plus, X, Eye, ArrowRight, Gamepad2, LayoutGrid } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { GameDetailView } from './GameDetailView';

interface Props {
  onNavigate?: (tab: string) => void;
}

export const GameLibrary: React.FC<Props> = ({ onNavigate }) => {
  const { userStats, addManualGame } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredGames = useMemo(() => {
    let filtered = games.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedPlatform !== 'all') {
        filtered = filtered.filter(g => g.platform === selectedPlatform);
    }
    return filtered.sort((a, b) => a.title.localeCompare(b.title));
  }, [games, searchTerm, selectedPlatform]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const game: Game = {
      ...newGame,
      id: `manual-${Date.now()}`,
      lastPlayed: new Date().toISOString(),
      firstPlayed: new Date().toISOString(),
      genres: ['Manual Entry'],
      achievements: []
    };
    addManualGame(game);
    setShowAddModal(false);
  };

  if (selectedGame) {
    return <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} />;
  }

  const platforms = [Platform.STEAM, Platform.PSN, Platform.XBOX, Platform.SWITCH, Platform.EPIC];

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 overflow-hidden animate-fade-in">
      {/* Header Hub */}
      <div className="p-6 md:p-10 space-y-8 border-b border-nexus-800 shrink-0 bg-gradient-to-b from-nexus-900/50 to-transparent">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left space-y-1">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter flex items-center justify-center md:justify-start gap-4">
                <LayoutGrid className="text-nexus-accent" size={32} /> HUB DE JOGOS
              </h1>
              <p className="text-gray-500 text-xs md:text-sm font-black uppercase tracking-[0.3em]">Sua Coleção Unificada em um Só Lugar</p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="text" 
                      placeholder="Localizar título..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-nexus-900 border border-nexus-700 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:border-nexus-accent outline-none shadow-2xl transition-all"
                    />
                </div>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-nexus-accent p-4 rounded-2xl hover:bg-nexus-accent/80 transition-all shadow-xl shadow-nexus-accent/20"
                  title="Vincular Novo Jogo"
                >
                  <Plus size={24} />
                </button>
            </div>
        </div>

        {/* Filtros Visuais */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            <button 
                onClick={() => setSelectedPlatform('all')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${selectedPlatform === 'all' ? 'bg-nexus-accent text-white border-nexus-accent shadow-lg shadow-nexus-accent/20' : 'bg-nexus-900 text-gray-500 border-nexus-800 hover:text-gray-300'}`}
            >
                Todas Redes
            </button>
            {platforms.map(p => (
                <button
                    key={p}
                    onClick={() => setSelectedPlatform(p)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 whitespace-nowrap border ${selectedPlatform === p ? 'bg-nexus-800 text-white border-nexus-accent shadow-lg' : 'bg-nexus-900 text-gray-500 border-nexus-800 hover:text-gray-300'}`}
                >
                    <PlatformIcon platform={p} className="w-4 h-4" />
                    {p}
                </button>
            ))}
        </div>
      </div>

      {/* Galeria de Capas */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6 md:gap-8 pb-32">
          {filteredGames.map((game) => (
            <div 
              key={game.id}
              className="group relative flex flex-col bg-nexus-900 rounded-[2rem] border border-nexus-800 overflow-hidden shadow-2xl hover:border-nexus-accent transition-all duration-500 hover:-translate-y-2"
            >
              {/* Cover Art Container */}
              <div className="aspect-[2/3] relative overflow-hidden bg-black">
                <img 
                  src={game.coverUrl} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
                  alt={game.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-nexus-900 via-transparent to-transparent opacity-60"></div>
                
                {/* Platform Badge Flutuante */}
                <div className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl">
                   <PlatformIcon platform={game.platform} className="w-4 h-4" />
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm p-4 text-center">
                   <button 
                     onClick={() => setSelectedGame(game)}
                     className="w-full py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-nexus-accent hover:text-white transition-all shadow-xl"
                   >
                     <Eye size={14} /> Detalhes
                   </button>
                   <button 
                     onClick={() => onNavigate?.('achievements')}
                     className="w-full py-3 bg-nexus-900 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-nexus-secondary transition-all"
                   >
                     <Trophy size={14} /> Troféus
                   </button>
                </div>
              </div>

              {/* Title & Info */}
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-sm text-white truncate leading-tight group-hover:text-nexus-accent transition-colors">{game.title}</h4>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-mono">{game.hoursPlayed}H JOGADAS</span>
                </div>
              </div>
            </div>
          ))}

          {filteredGames.length === 0 && (
            <div className="col-span-full py-32 text-center text-gray-600 bg-nexus-900/30 border-2 border-dashed border-nexus-800 rounded-[3rem] flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-nexus-800 rounded-full flex items-center justify-center opacity-20">
                 <Gamepad2 size={40} />
              </div>
              <p className="text-xl font-display font-bold uppercase tracking-[0.3em] opacity-20 italic">Hub Vazio</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Adição Manual */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-nexus-900 w-full max-w-md rounded-[3rem] border border-nexus-800 shadow-2xl overflow-hidden flex flex-col animate-fade-in max-h-[90vh]">
             <div className="p-8 border-b border-nexus-800 flex justify-between items-center bg-gradient-to-r from-nexus-accent/10 to-transparent">
                <div>
                   <h3 className="text-2xl font-display font-bold text-white">Vincular Jogo</h3>
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Entrada Manual no Legado</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
             </div>
             
             <form onSubmit={handleAddSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Título do Jogo</label>
                  <input required value={newGame.title} onChange={e => setNewGame({...newGame, title: e.target.value})} type="text" className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-6 py-4 text-sm text-white focus:border-nexus-accent outline-none shadow-inner" placeholder="Ex: Elden Ring" />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Rede</label>
                    <select value={newGame.platform} onChange={e => setNewGame({...newGame, platform: e.target.value as Platform})} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-6 py-4 text-sm text-white focus:border-nexus-accent outline-none appearance-none">
                      {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Imersão (H)</label>
                    <input type="number" value={newGame.hoursPlayed} onChange={e => setNewGame({...newGame, hoursPlayed: Number(e.target.value)})} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-6 py-4 text-sm text-white focus:border-nexus-accent outline-none shadow-inner" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">URL da Capa (Opcional)</label>
                  <input value={newGame.coverUrl} onChange={e => setNewGame({...newGame, coverUrl: e.target.value})} type="text" className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-6 py-4 text-sm text-white focus:border-nexus-accent outline-none" placeholder="http://..." />
                </div>

                <button type="submit" className="w-full py-5 bg-nexus-accent text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-[1.5rem] shadow-2xl shadow-nexus-accent/20 transition-all hover:bg-nexus-accent/80 flex items-center justify-center gap-3">
                   <ArrowRight size={18} /> Sincronizar ao Hall
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
