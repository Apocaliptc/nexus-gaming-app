
import React, { useState, useMemo } from 'react';
import { Game, Achievement } from '../types';
import { Trophy, ChevronLeft, Search, ArrowUpDown, Clock, Lock, Check, Info, Sparkles, BrainCircuit, X, Loader2 } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { useAppContext } from '../context/AppContext';
import { getAchievementTip } from '../services/geminiService';

type SortOption = 'date_desc' | 'date_asc' | 'rarity_desc' | 'rarity_asc';
type FilterOption = 'all' | 'unlocked' | 'locked';

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

  const handleAskOracle = async (e: React.MouseEvent, ach: Achievement) => {
    e.stopPropagation();
    setOracleAchievement(ach);
    setIsLoadingTip(true);
    setOracleTip('');
    try {
      const tip = await getAchievementTip(game.title, ach.name, ach.description);
      setOracleTip(tip);
    } catch (err) {
      setOracleTip("Erro ao conectar com o Oráculo.");
    } finally {
      setIsLoadingTip(false);
    }
  };

  return (
     <div className="h-full w-full flex flex-col bg-[#050507] animate-fade-in absolute inset-0 z-50 overflow-hidden">
        {/* Header */}
        <div className="bg-nexus-900 border-b border-nexus-700 p-6 flex flex-col md:flex-row items-center gap-6 relative">
           <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-nexus-800 hover:bg-nexus-700 rounded-full border border-nexus-600 transition-colors text-white z-10">
              <ChevronLeft size={24} />
           </button>
           
           <div className="w-20 h-28 md:w-24 md:h-36 flex-shrink-0 ml-12 md:ml-0 rounded-lg overflow-hidden border border-nexus-600 shadow-xl bg-black">
              <img src={game.coverUrl} className="w-full h-full object-cover" />
           </div>
           
           <div className="flex-1 w-full text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                 <h2 className="text-3xl font-display font-bold text-white">{game.title}</h2>
                 <div className="bg-nexus-800 p-1 rounded border border-nexus-700">
                    <PlatformIcon platform={game.platform} />
                 </div>
              </div>
              
              <div className="max-w-xl">
                 <div className="flex justify-between text-sm font-bold text-gray-400 mb-1">
                    <span>Progresso de Conquistas</span>
                    <span className={completionPercent === 100 ? 'text-nexus-accent' : 'text-white'}>{completionPercent}%</span>
                 </div>
                 <div className="h-3 bg-nexus-900 rounded-full overflow-hidden border border-nexus-800">
                    <div className={`h-full transition-all duration-500 ${completionPercent === 100 ? 'bg-gradient-to-r from-nexus-secondary to-nexus-accent' : 'bg-nexus-secondary'}`} style={{ width: `${completionPercent}%` }}></div>
                 </div>
                 <p className="text-xs text-gray-500 mt-2 flex items-center justify-center md:justify-start gap-4">
                    <span className="flex items-center gap-1"><Trophy size={12} className="text-yellow-500"/> {game.achievementCount} / {game.totalAchievements}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {game.hoursPlayed}h jogadas</span>
                 </p>
              </div>
           </div>

           {isOwner && (
              <div className="bg-nexus-accent/10 border border-nexus-accent/30 rounded-xl p-3 flex items-center gap-3 max-w-xs ml-auto">
                 <BrainCircuit className="text-nexus-accent shrink-0" size={20} />
                 <p className="text-[10px] text-nexus-accent font-bold uppercase leading-tight">
                    Oracle Insight Habilitado: Peça dicas clicando no Oráculo em troféus trancados.
                 </p>
              </div>
           )}
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-nexus-800 flex flex-col md:flex-row gap-4 bg-[#050507]">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar conquista..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-nexus-900 border border-nexus-700 rounded-xl pl-10 pr-4 py-2 text-white focus:border-nexus-accent outline-none"
              />
           </div>
           
           <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <div className="flex bg-nexus-900 rounded-xl p-1 border border-nexus-700">
                 {(['all', 'unlocked', 'locked'] as FilterOption[]).map(f => (
                    <button 
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${filter === f ? 'bg-nexus-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                       {f}
                    </button>
                 ))}
              </div>
              
              <button 
                onClick={() => setSort(sort === 'date_desc' ? 'rarity_desc' : 'date_desc')}
                className="px-4 py-2 bg-nexus-900 border border-nexus-700 rounded-xl text-sm font-bold text-gray-300 hover:text-white flex items-center gap-2"
              >
                 <ArrowUpDown size={16} /> {sort.includes('date') ? 'Data' : 'Raridade'}
              </button>
           </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3 custom-scrollbar pb-20">
           {filteredAchievements.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                 <Lock size={48} className="mx-auto mb-4 opacity-20" />
                 <p>Nenhuma conquista encontrada.</p>
              </div>
           ) : (
              filteredAchievements.map(ach => (
                 <div 
                    key={ach.id} 
                    onClick={() => handleToggle(ach.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${
                      ach.unlockedAt 
                        ? 'bg-nexus-800 border-nexus-accent shadow-lg shadow-nexus-accent/5' 
                        : 'bg-nexus-900/30 border-nexus-800 opacity-60 hover:opacity-100 hover:border-nexus-700'
                    }`}
                  >
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-lg flex-shrink-0 overflow-hidden border transition-all ${
                      ach.unlockedAt ? 'border-nexus-accent scale-105' : 'border-gray-700'
                    }`}>
                       <img src={ach.iconUrl} className={`w-full h-full object-cover ${!ach.unlockedAt && 'grayscale opacity-50'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className={`font-bold text-sm md:text-base ${ach.unlockedAt ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{ach.name}</h4>
                       <p className="text-xs md:text-sm text-gray-500 line-clamp-1">{ach.description}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                       {ach.rarity && (
                          <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                             ach.rarity === 'Ultra Rare' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' : 
                             ach.rarity === 'Gold' ? 'text-yellow-200 border-yellow-200/30' : 
                             'text-gray-400 border-gray-600/30'
                          }`}>
                             {ach.rarity}
                          </span>
                       )}
                       
                       <div className="flex items-center gap-2">
                          {!ach.unlockedAt && (
                             <button 
                               onClick={(e) => handleAskOracle(e, ach)}
                               className="p-2 bg-nexus-accent/20 hover:bg-nexus-accent text-nexus-accent hover:text-white rounded-lg transition-all border border-nexus-accent/30 shadow-lg shadow-nexus-accent/10 group/oracle"
                               title="Dicas do Oráculo"
                             >
                                <BrainCircuit size={16} className="group-hover/oracle:scale-110 transition-transform" />
                             </button>
                          )}
                          {ach.unlockedAt ? (
                             <span className="text-[10px] text-nexus-accent font-bold flex items-center gap-1 animate-fade-in">
                                <Check size={12} /> CONQUISTADO
                             </span>
                          ) : isOwner && (
                             <span className="text-[10px] text-gray-600 font-bold group-hover:text-nexus-accent transition-colors">
                               MARCAR
                             </span>
                          )}
                       </div>
                    </div>
                 </div>
              ))
           )}
        </div>

        {/* Oracle Strategy Modal Overlay */}
        {oracleAchievement && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
              <div className="bg-nexus-900 w-full max-w-lg rounded-[2.5rem] border border-nexus-accent/30 shadow-2xl overflow-hidden relative">
                 <button onClick={() => setOracleAchievement(null)} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-nexus-800 rounded-full transition-all">
                    <X size={20} />
                 </button>

                 <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-nexus-accent/20 rounded-2xl flex items-center justify-center text-nexus-accent border border-nexus-accent/30">
                          <BrainCircuit size={32} />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-nexus-accent uppercase tracking-[0.3em] mb-1">Estratégia do Oráculo</p>
                          <h3 className="text-xl font-display font-bold text-white">{oracleAchievement.name}</h3>
                          <p className="text-xs text-gray-500 font-mono italic">Jogo: {game.title}</p>
                       </div>
                    </div>

                    <div className="bg-nexus-800/50 p-6 rounded-[2rem] border border-nexus-700 min-h-[150px] relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                          <Sparkles size={100} />
                       </div>
                       
                       {isLoadingTip ? (
                          <div className="flex flex-col items-center justify-center h-full gap-4 py-10">
                             <Loader2 className="animate-spin text-nexus-accent" size={32} />
                             <p className="text-xs text-gray-500 font-mono animate-pulse uppercase tracking-widest">Consultando arquivos do Nexus...</p>
                          </div>
                       ) : (
                          <div className="text-gray-300 text-sm leading-relaxed prose prose-invert max-w-none prose-p:my-2 prose-strong:text-nexus-accent">
                             <div className="whitespace-pre-wrap">{oracleTip}</div>
                          </div>
                       )}
                    </div>

                    <button 
                      onClick={() => setOracleAchievement(null)}
                      className="w-full py-4 bg-nexus-accent hover:bg-nexus-accent/90 text-white font-bold rounded-2xl transition-all shadow-xl shadow-nexus-accent/20 flex items-center justify-center gap-2"
                    >
                       ENTENDIDO
                    </button>
                 </div>
              </div>
           </div>
        )}
     </div>
  );
};
