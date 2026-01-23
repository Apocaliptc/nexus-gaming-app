
import React, { useState, useMemo } from 'react';
import { Game, Achievement, OwnershipRecord } from '../types';
import { 
  Trophy, ChevronLeft, Search, ArrowUpDown, Clock, Lock, 
  Check, Info, Sparkles, BrainCircuit, X, Loader2, 
  History, ShieldCheck, MapPin, Package
} from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { useAppContext } from '../context/AppContext';
import { getAchievementTip } from '../services/geminiService';
import { PedigreeTimeline } from './PedigreeTimeline';

type SortOption = 'date_desc' | 'date_asc' | 'rarity_desc' | 'rarity_asc';
type FilterOption = 'all' | 'unlocked' | 'locked';
type TabOption = 'achievements' | 'pedigree' | 'stats';

interface Props {
  game: Game;
  onClose: () => void;
  isOwner?: boolean;
}

export const GameDetailView: React.FC<Props> = ({ game: initialGame, onClose, isOwner = true }) => {
  const { toggleAchievement, userStats } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('date_desc');
  const [activeTab, setActiveTab] = useState<TabOption>('achievements');
  
  // Oracle Modal state
  const [oracleAchievement, setOracleAchievement] = useState<Achievement | null>(null);
  const [oracleTip, setOracleTip] = useState<string>('');
  const [isLoadingTip, setIsLoadingTip] = useState(false);

  const game = isOwner 
    ? (userStats.recentGames.find(g => g.id === initialGame.id) || initialGame)
    : initialGame;

  const filteredAchievements = useMemo(() => {
    let list = game.achievements || [];
    if (filter === 'unlocked') list = list.filter(a => a.unlockedAt);
    if (filter === 'locked') list = list.filter(a => !a.unlockedAt);
    if (searchTerm) list = list.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return list.sort((a, b) => {
       if (sort === 'date_desc') return (new Date(b.unlockedAt || 0).getTime()) - (new Date(a.unlockedAt || 0).getTime());
       if (sort === 'date_asc') return (new Date(a.unlockedAt || 0).getTime()) - (new Date(b.unlockedAt || 0).getTime());
       if (sort === 'rarity_desc') {
           const getScore = (r?: string) => r === 'Ultra Rare' ? 4 : r === 'Gold' ? 3 : r === 'Silver' ? 2 : 1;
           return getScore(b.rarity) - getScore(a.rarity);
       }
       return 0;
    });
  }, [game, filter, sort, searchTerm]);

  const completionPercent = game.totalAchievements > 0 ? Math.round((game.achievementCount / game.totalAchievements) * 100) : 0;

  const handleToggle = (achId: string) => {
    if (!isOwner) return;
    toggleAchievement(game.id, achId);
  };

  return (
     <div className="h-full w-full flex flex-col bg-[#050507] animate-fade-in absolute inset-0 z-50 overflow-hidden">
        {/* Header Premium */}
        <div className="bg-nexus-900 border-b border-nexus-700 p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none rotate-12">
              <ShieldCheck size={200} />
           </div>

           <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-nexus-800 hover:bg-nexus-700 rounded-full border border-nexus-600 transition-colors text-white z-10">
              <ChevronLeft size={24} />
           </button>
           
           <div className="w-24 h-36 md:w-32 md:h-48 flex-shrink-0 ml-12 md:ml-0 rounded-[1.5rem] overflow-hidden border-2 border-nexus-600 shadow-2xl bg-black relative group">
              <img src={game.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              {game.isPhysical && (
                <div className="absolute top-2 right-2 bg-nexus-accent text-white p-1.5 rounded-lg shadow-lg">
                   <Package size={14} />
                </div>
              )}
           </div>
           
           <div className="flex-1 w-full text-center md:text-left space-y-4">
              <div className="space-y-1">
                 <div className="flex items-center justify-center md:justify-start gap-3">
                    <h2 className="text-4xl font-display font-bold text-white tracking-tight">{game.title}</h2>
                    <div className="bg-nexus-800 p-1.5 rounded-xl border border-nexus-700 shadow-lg">
                       <PlatformIcon platform={game.platform} className="w-5 h-5" />
                    </div>
                 </div>
                 <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {game.genres.map(g => <span key={g} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-nexus-700 px-2 py-0.5 rounded-md">{g}</span>)}
                 </div>
              </div>
              
              <div className="max-w-2xl">
                 <div className="flex justify-between text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-2">
                    <span>Sincronia de Legado</span>
                    <span className={completionPercent === 100 ? 'text-nexus-accent' : 'text-white'}>{completionPercent}%</span>
                 </div>
                 <div className="h-4 bg-nexus-900 rounded-full overflow-hidden border-2 border-nexus-800 p-0.5 shadow-inner">
                    <div className={`h-full rounded-full transition-all duration-1000 ${completionPercent === 100 ? 'bg-gradient-to-r from-nexus-secondary to-nexus-accent shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-nexus-secondary'}`} style={{ width: `${completionPercent}%` }}></div>
                 </div>
                 <div className="flex items-center justify-center md:justify-start gap-6 mt-4">
                    <div className="flex items-center gap-2">
                       <Trophy size={16} className="text-yellow-500" />
                       <span className="text-sm font-bold text-white">{game.achievementCount} <span className="text-gray-600">/</span> {game.totalAchievements}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Clock size={16} className="text-nexus-secondary" />
                       <span className="text-sm font-bold text-white">{game.hoursPlayed}h <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">de imersão</span></span>
                    </div>
                 </div>
              </div>
           </div>

           {game.isPhysical && (
              <div className="bg-nexus-accent/5 border border-nexus-accent/20 rounded-[2rem] p-6 flex flex-col items-center gap-3 text-center max-w-[200px] ml-auto group hover:bg-nexus-accent/10 transition-all">
                 <div className="w-12 h-12 bg-nexus-accent/20 rounded-2xl flex items-center justify-center text-nexus-accent border border-nexus-accent/30 group-hover:scale-110 transition-transform">
                    <History size={24} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] text-nexus-accent font-black uppercase tracking-widest">Linhagem Ativa</p>
                    <p className="text-xs text-gray-400 font-medium">{game.pedigree?.length || 0} donos registrados no banco.</p>
                 </div>
              </div>
           )}
        </div>

        {/* Tab Selector */}
        <div className="bg-nexus-900 border-b border-nexus-800 px-8 flex gap-8">
           <button 
             onClick={() => setActiveTab('achievements')}
             className={`py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all flex items-center gap-2 ${activeTab === 'achievements' ? 'border-nexus-accent text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
           >
              <Trophy size={14} /> Conquistas
           </button>
           {game.isPhysical && (
             <button 
               onClick={() => setActiveTab('pedigree')}
               className={`py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all flex items-center gap-2 ${activeTab === 'pedigree' ? 'border-nexus-accent text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
             >
                <History size={14} /> Nexus Pedigree
             </button>
           )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {activeTab === 'achievements' && (
              <div className="animate-fade-in">
                 {/* Controls */}
                 <div className="p-6 border-b border-nexus-800 flex flex-col md:flex-row gap-4 bg-[#050507]/50 sticky top-0 z-20 backdrop-blur-md">
                    <div className="relative flex-1">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                       <input 
                         type="text" 
                         placeholder="Buscar feito imortal..." 
                         value={searchTerm}
                         onChange={e => setSearchTerm(e.target.value)}
                         className="w-full bg-nexus-900 border border-nexus-700 rounded-2xl pl-12 pr-4 py-3 text-white focus:border-nexus-accent outline-none transition-all"
                       />
                    </div>
                    
                    <div className="flex gap-2">
                       <div className="flex bg-nexus-900 rounded-2xl p-1 border border-nexus-700">
                          {(['all', 'unlocked', 'locked'] as FilterOption[]).map(f => (
                             <button 
                               key={f}
                               onClick={() => setFilter(f)}
                               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-nexus-800 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                             >
                                {f === 'all' ? 'Todos' : f === 'unlocked' ? 'Conquistados' : 'Bloqueados'}
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* List */}
                 <div className="p-8 grid grid-cols-1 gap-4 pb-32 max-w-5xl mx-auto">
                    {filteredAchievements.length === 0 ? (
                       <div className="text-center py-32 text-gray-600 opacity-20">
                          <Lock size={80} className="mx-auto mb-4" />
                          <p className="text-2xl font-display font-bold">Nenhum registro encontrado.</p>
                       </div>
                    ) : (
                       filteredAchievements.map(ach => (
                          <div 
                             key={ach.id} 
                             onClick={() => isOwner && toggleAchievement(game.id, ach.id)}
                             className={`flex items-center gap-6 p-6 rounded-[2.5rem] border transition-all cursor-pointer group ${
                               ach.unlockedAt 
                                 ? 'bg-nexus-800 border-nexus-accent shadow-2xl shadow-nexus-accent/5' 
                                 : 'bg-nexus-900/40 border-nexus-800 opacity-60 hover:opacity-100 hover:border-nexus-700'
                             }`}
                           >
                             <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] flex-shrink-0 overflow-hidden border-2 transition-all ${
                               ach.unlockedAt ? 'border-nexus-accent scale-105 shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'border-nexus-700'
                             }`}>
                                <img src={ach.iconUrl} className={`w-full h-full object-cover ${!ach.unlockedAt && 'grayscale opacity-30 group-hover:opacity-60'}`} />
                             </div>
                             <div className="flex-1 min-w-0">
                                <h4 className={`font-display font-bold text-lg md:text-xl ${ach.unlockedAt ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>{ach.name}</h4>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2 italic">"{ach.description}"</p>
                             </div>
                             <div className="text-right flex flex-col items-end gap-3">
                                {ach.rarity && (
                                   <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border shadow-lg ${
                                      ach.rarity === 'Ultra Rare' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' : 
                                      ach.rarity === 'Gold' ? 'text-yellow-200 border-yellow-200/30' : 
                                      'text-gray-500 border-nexus-700 bg-nexus-900'
                                   }`}>
                                      {ach.rarity}
                                   </span>
                                )}
                                {ach.unlockedAt && (
                                   <div className="bg-nexus-accent/20 p-2 rounded-xl text-nexus-accent border border-nexus-accent/30 animate-fade-in">
                                      <Check size={18} />
                                   </div>
                                )}
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </div>
           )}

           {activeTab === 'pedigree' && game.isPhysical && (
              <div className="max-w-3xl mx-auto p-8 animate-fade-in pb-32">
                 <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none rotate-12">
                       <ShieldCheck size={150} />
                    </div>
                    <PedigreeTimeline records={game.pedigree || []} />
                    
                    <div className="mt-12 p-6 bg-nexus-accent/5 border border-nexus-accent/20 rounded-2xl flex items-start gap-4">
                       <Info className="text-nexus-accent shrink-0 mt-1" size={20} />
                       <div className="space-y-2">
                          <h5 className="text-sm font-bold text-white uppercase tracking-widest">Sobre o Nexus Pedigree</h5>
                          <p className="text-xs text-gray-400 leading-relaxed">
                             Este item possui um identificador digital único vinculado ao seu histórico físico. Cada vez que ele é vendido ou trocado via leilão Nexus, o novo dono é eternizado nesta linha do tempo, agregando valor histórico e raridade ao objeto.
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
           )}
        </div>
     </div>
  );
};
