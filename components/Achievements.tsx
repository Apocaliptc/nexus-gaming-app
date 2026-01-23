
import React, { useState, useMemo } from 'react';
import { MOCK_USER_STATS } from '../services/mockData';
import { Game, Platform } from '../types';
import { Trophy, Medal, Crown, Search, Filter, SortAsc, Calendar, CheckCircle2, Star, Award, Zap, Hexagon, BarChart3, ChevronRight } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { GameDetailView } from './GameDetailView';
import { GameListItem } from './GameListItem';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, 
  PieChart, Pie, Cell, Tooltip 
} from 'recharts';

type SortOption = 'recent' | 'progress' | 'name';

const COLORS = ['#8b5cf6', '#f59e0b', '#94a3b8', '#b45309'];

export const Achievements: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  
  const stats = useMemo(() => {
    let totalScore = 0;
    let platinum = 0, gold = 0, silver = 0, bronze = 0;
    let totalUnlocked = 0;

    MOCK_USER_STATS.recentGames.forEach(game => {
       if(game.achievements) {
         game.achievements.forEach(ach => {
            if(ach.unlockedAt) {
               totalUnlocked++;
               const rarity = ach.rarity || 'Common';
               if (rarity === 'Ultra Rare' || ach.name.includes('Platinum')) { platinum++; totalScore += 300; }
               else if (rarity === 'Gold' || rarity === 'Rare') { gold++; totalScore += 90; }
               else if (rarity === 'Silver') { silver++; totalScore += 30; }
               else { bronze++; totalScore += 15; }
            }
         });
       }
    });

    // Heurística de fallback caso mock esteja incompleto
    if (totalUnlocked < MOCK_USER_STATS.totalAchievements) {
       totalUnlocked = MOCK_USER_STATS.totalAchievements;
       platinum = MOCK_USER_STATS.platinumCount;
       gold = Math.floor(totalUnlocked * 0.1);
       silver = Math.floor(totalUnlocked * 0.3);
       bronze = totalUnlocked - platinum - gold - silver;
       totalScore = (platinum * 300) + (gold * 90) + (silver * 30) + (bronze * 15);
    }

    const nexusLevel = Math.floor(Math.sqrt(totalScore) / 5);
    const nextLevelScore = Math.pow((nexusLevel + 1) * 5, 2);
    const currentLevelScore = Math.pow(nexusLevel * 5, 2);
    const progress = ((totalScore - currentLevelScore) / (nextLevelScore - currentLevelScore)) * 100;

    const distributionData = [
      { name: 'Platina', value: platinum },
      { name: 'Ouro', value: gold },
      { name: 'Prata', value: silver },
      { name: 'Bronze', value: bronze }
    ];

    const radarData = [
      { subject: 'Raridade', value: platinum * 10 },
      { subject: 'Volume', value: Math.min(100, (totalUnlocked / 50)) },
      { subject: 'Foco', value: Math.min(100, (platinum / (totalUnlocked || 1)) * 500) },
      { subject: 'Imersão', value: Math.min(100, (MOCK_USER_STATS.totalHours / 100)) },
      { subject: 'Consistência', value: MOCK_USER_STATS.consistency.currentStreak * 2 },
    ];

    return { totalScore, nexusLevel, progress, counts: { platinum, gold, silver, bronze }, totalUnlocked, distributionData, radarData };
  }, []);

  const filteredGames = useMemo(() => {
      let games = MOCK_USER_STATS.recentGames.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()));
      if (selectedPlatform !== 'all') games = games.filter(g => g.platform === selectedPlatform);

      return games.sort((a, b) => {
          if (sortBy === 'name') return a.title.localeCompare(b.title);
          if (sortBy === 'progress') {
              const pa = a.totalAchievements > 0 ? a.achievementCount / a.totalAchievements : 0;
              const pb = b.totalAchievements > 0 ? b.achievementCount / b.totalAchievements : 0;
              return pb - pa;
          }
          return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
      });
  }, [searchTerm, selectedPlatform, sortBy]);

  if (selectedGame) return <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} />;

  const platforms = [Platform.STEAM, Platform.PSN, Platform.XBOX, Platform.SWITCH, Platform.EPIC];

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 overflow-y-auto custom-scrollbar animate-fade-in">
       <header className="p-8 md:p-12 border-b border-nexus-800 bg-gradient-to-b from-nexus-900/50 to-transparent shrink-0">
          <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-12">
            <div className="space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-nexus-accent/20 border border-nexus-accent/30 rounded-full text-nexus-accent text-[11px] font-black uppercase tracking-[0.2em]">
                 <Star size={14} className="fill-nexus-accent" /> Master Achievements
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter">Relatório de <span className="text-nexus-accent">Legado</span></h1>
              <p className="text-gray-400 max-w-lg leading-relaxed">Uma análise detalhada de cada troféu, medalha e marco histórico conquistado em todas as plataformas sintonizadas.</p>
            </div>

            <div className="flex items-center gap-10 bg-nexus-900/80 p-8 rounded-[3rem] border border-nexus-800 shadow-2xl backdrop-blur-md relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-nexus-accent/5 to-transparent"></div>
               <div className="relative z-10 text-center space-y-3">
                  <div className="w-20 h-20 rounded-[2rem] bg-nexus-accent/10 border-2 border-nexus-accent/40 flex items-center justify-center text-nexus-accent mx-auto shadow-2xl group-hover:scale-110 transition-transform">
                     <Crown size={36} />
                  </div>
                  <div>
                    <p className="text-4xl font-display font-bold text-white leading-none">{stats.nexusLevel}</p>
                    <p className="text-[10px] font-black text-nexus-accent uppercase tracking-widest mt-1">Level Nexus</p>
                  </div>
               </div>
               <div className="w-px h-24 bg-nexus-800"></div>
               <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-end gap-10">
                    <div className="text-center">
                       <p className="text-2xl font-display font-bold text-white leading-none">{stats.totalUnlocked}</p>
                       <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Total</p>
                    </div>
                    <div className="text-center">
                       <p className="text-2xl font-display font-bold text-nexus-secondary leading-none">{stats.totalScore}</p>
                       <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Pontos</p>
                    </div>
                  </div>
                  <div className="w-48 h-2 bg-nexus-800 rounded-full overflow-hidden border border-nexus-700 p-0.5">
                     <div className="h-full bg-nexus-accent rounded-full transition-all duration-1000" style={{ width: `${stats.progress}%` }}></div>
                  </div>
               </div>
            </div>
          </div>
       </header>

       <div className="p-8 md:p-12 space-y-12 max-w-[1400px] mx-auto w-full">
          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             {/* Radar de Raridade */}
             <div className="lg:col-span-4 bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl flex flex-col items-center">
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-4 mb-8 w-full">
                   <Hexagon size={18} className="text-nexus-accent" /> Matriz de Legado
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.radarData}>
                      <PolarGrid stroke="#23232f" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }} />
                      <Radar name="Legado" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} strokeWidth={3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Distribuição de Metais */}
             <div className="lg:col-span-8 bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-4">
                      <BarChart3 size={18} className="text-nexus-secondary" /> Distribuição de Metais
                   </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   <TrophyCard icon={Trophy} count={stats.counts.platinum} label="Platinas" color="text-nexus-accent" bg="bg-nexus-accent/10" border="border-nexus-accent/30" />
                   <TrophyCard icon={Medal} count={stats.counts.gold} label="Ouro" color="text-yellow-500" bg="bg-yellow-500/10" border="border-yellow-500/30" />
                   <TrophyCard icon={Medal} count={stats.counts.silver} label="Prata" color="text-gray-400" bg="bg-gray-400/10" border="border-gray-400/30" />
                   <TrophyCard icon={Award} count={stats.counts.bronze} label="Bronze" color="text-orange-700" bg="bg-orange-700/10" border="border-orange-700/30" />
                </div>
                
                <div className="mt-10 h-2 bg-nexus-800 rounded-full flex overflow-hidden border border-nexus-700">
                   <div className="h-full bg-nexus-accent" style={{ width: `${(stats.counts.platinum / stats.totalUnlocked) * 100}%` }}></div>
                   <div className="h-full bg-yellow-500" style={{ width: `${(stats.counts.gold / stats.totalUnlocked) * 100}%` }}></div>
                   <div className="h-full bg-gray-400" style={{ width: `${(stats.counts.silver / stats.totalUnlocked) * 100}%` }}></div>
                   <div className="h-full bg-orange-700" style={{ width: `${(stats.counts.bronze / stats.totalUnlocked) * 100}%` }}></div>
                </div>
             </div>
          </div>

          {/* Listagem de Jogos */}
          <div className="space-y-8">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                   <h2 className="text-3xl font-display font-bold text-white">Ecossistemas</h2>
                   <div className="h-px w-20 bg-nexus-800"></div>
                </div>
                
                <div className="flex items-center gap-3 bg-nexus-900 border border-nexus-800 p-1.5 rounded-2xl shadow-xl">
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                      <input 
                        type="text" 
                        placeholder="Filtrar por título..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-nexus-800 border-none rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-nexus-accent outline-none w-48 transition-all"
                      />
                   </div>
                   <div className="h-6 w-px bg-nexus-800"></div>
                   <div className="flex gap-1">
                      {platforms.map(p => (
                         <button 
                           key={p} 
                           onClick={() => setSelectedPlatform(selectedPlatform === p ? 'all' : p)}
                           className={`p-2 rounded-lg border transition-all ${selectedPlatform === p ? 'bg-nexus-accent border-nexus-accent text-white' : 'bg-nexus-800 border-nexus-700 text-gray-500 hover:text-white'}`}
                         >
                            <PlatformIcon platform={p} className="w-3.5 h-3.5" />
                         </button>
                      ))}
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-6 pb-40">
                {filteredGames.length === 0 ? (
                   <div className="py-20 text-center text-gray-600 bg-nexus-900 border border-nexus-800 border-dashed rounded-[3rem]">
                      <Search size={48} className="mx-auto mb-4 opacity-10" />
                      <p className="text-lg font-display font-bold uppercase tracking-widest opacity-20">Nenhum registro encontrado</p>
                   </div>
                ) : (
                   filteredGames.map(game => (
                      <GameListItem key={game.id} game={game} onClick={() => setSelectedGame(game)} />
                   ))
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

const TrophyCard = ({ icon: Icon, count, label, color, bg, border }: { icon: any, count: number, label: string, color: string, bg: string, border: string }) => (
  <div className={`p-6 rounded-3xl border ${border} ${bg} text-center space-y-2 group hover:scale-105 transition-transform`}>
     <Icon size={32} className={`${color} mx-auto mb-2`} />
     <p className="text-3xl font-display font-bold text-white leading-none">{count}</p>
     <p className={`text-[9px] font-black uppercase tracking-widest ${color} opacity-80`}>{label}</p>
  </div>
);
