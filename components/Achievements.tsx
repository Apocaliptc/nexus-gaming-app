
import React, { useState, useMemo } from 'react';
import { MOCK_USER_STATS } from '../services/mockData';
import { Game, Platform } from '../types';
import { Trophy, Medal, Crown, Search, Filter, SortAsc, Calendar, CheckCircle2 } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { GameDetailView } from './GameDetailView';
import { GameListItem } from './GameListItem';

type SortOption = 'recent' | 'progress' | 'name';

export const Achievements: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  
  // Calculate Nexus Level & Global Stats
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
       platinum += game.title === 'Elden Ring' ? 1 : 0; 
    });

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

    return { totalScore, nexusLevel, progress, counts: { platinum, gold, silver, bronze }, totalUnlocked };
  }, []);

  // Filter & Sort Logic for Game List
  const filteredGames = useMemo(() => {
      let games = MOCK_USER_STATS.recentGames.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (selectedPlatform !== 'all') {
          games = games.filter(g => g.platform === selectedPlatform);
      }

      return games.sort((a, b) => {
          if (sortBy === 'name') return a.title.localeCompare(b.title);
          if (sortBy === 'progress') {
              const pa = a.totalAchievements > 0 ? a.achievementCount / a.totalAchievements : 0;
              const pb = b.totalAchievements > 0 ? b.achievementCount / b.totalAchievements : 0;
              return pb - pa;
          }
          // Default recent
          return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
      });
  }, [searchTerm, selectedPlatform, sortBy]);

  if (selectedGame) {
     return <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} />;
  }

  const platforms = [Platform.STEAM, Platform.PSN, Platform.XBOX, Platform.SWITCH, Platform.BATTLENET, Platform.EPIC, Platform.GOG];

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in h-full overflow-y-auto text-gray-100 flex flex-col bg-[#050507]">
       
       <div className="flex flex-col gap-6 border-b border-nexus-700 pb-6 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Central de Conquistas</h1>
            <p className="text-gray-400">Rastreie seu legado através de todas as plataformas.</p>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-nexus-900 to-nexus-800 p-6 rounded-2xl border border-nexus-700 shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="relative z-10">
                    <div className="w-20 h-20 rounded-full border-4 border-nexus-accent bg-nexus-900 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                    <Crown size={32} className="text-nexus-accent" />
                    </div>
                    <h2 className="text-4xl font-display font-bold text-white">{stats.nexusLevel}</h2>
                    <p className="text-xs font-bold text-nexus-accent uppercase tracking-widest mb-3">Nível Nexus</p>
                    
                    <div className="w-full max-w-[200px] h-2 bg-nexus-900 rounded-full overflow-hidden border border-nexus-700">
                    <div className="h-full bg-nexus-accent" style={{ width: `${stats.progress}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-nexus-800 p-4 rounded-2xl border border-nexus-700 flex flex-col items-center justify-center gap-2">
                    <Trophy size={28} className="text-yellow-400" />
                    <span className="text-2xl font-bold text-white">{stats.counts.platinum}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Platina</span>
                </div>
                <div className="bg-nexus-800 p-4 rounded-2xl border border-nexus-700 flex flex-col items-center justify-center gap-2">
                    <Medal size={28} className="text-yellow-200" />
                    <span className="text-2xl font-bold text-white">{stats.counts.gold}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Ouro</span>
                </div>
                <div className="bg-nexus-800 p-4 rounded-2xl border border-nexus-700 flex flex-col items-center justify-center gap-2">
                    <Medal size={28} className="text-gray-400" />
                    <span className="text-2xl font-bold text-white">{stats.counts.silver}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Prata</span>
                </div>
                <div className="bg-nexus-800 p-4 rounded-2xl border border-nexus-700 flex flex-col items-center justify-center gap-2">
                    <Medal size={28} className="text-orange-700" />
                    <span className="text-2xl font-bold text-white">{stats.counts.bronze}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Bronze</span>
                </div>
            </div>
          </div>
       </div>

       {/* Toolbar */}
       <div className="flex flex-col md:flex-row gap-4 border-b border-nexus-700 pb-4 flex-shrink-0 sticky top-0 bg-[#050507] z-20 pt-2 -mt-2">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
             <input 
               type="text" 
               placeholder="Filtrar conquistas..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-nexus-900 border border-nexus-700 rounded-xl pl-10 pr-4 py-2 text-white focus:border-nexus-accent outline-none"
             />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
             {platforms.map(p => (
                <button
                    key={p}
                    onClick={() => setSelectedPlatform(selectedPlatform === p ? 'all' : p)}
                    className={`p-2 rounded-lg border transition-all ${selectedPlatform === p ? 'bg-nexus-800 border-nexus-accent text-white' : 'bg-nexus-900 border-nexus-700 text-gray-400 hover:text-white'}`}
                    title={p}
                >
                    <PlatformIcon platform={p} className="w-5 h-5" />
                </button>
             ))}
          </div>

          <div className="relative group">
             <button className="flex items-center gap-2 bg-nexus-900 border border-nexus-700 rounded-xl px-4 py-2 hover:bg-nexus-800 transition-colors h-full whitespace-nowrap">
                <Filter size={18} className="text-nexus-secondary" />
                <span className="text-sm font-bold text-gray-300">Ordenar</span>
             </button>
             <div className="absolute right-0 mt-2 w-48 bg-nexus-800 border border-nexus-700 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
                <button onClick={() => setSortBy('recent')} className={`w-full text-left px-4 py-3 text-sm hover:bg-nexus-700 flex items-center gap-2 ${sortBy === 'recent' ? 'text-nexus-accent' : 'text-gray-400'}`}><Calendar size={14}/> Recentes</button>
                <button onClick={() => setSortBy('progress')} className={`w-full text-left px-4 py-3 text-sm hover:bg-nexus-700 flex items-center gap-2 ${sortBy === 'progress' ? 'text-nexus-accent' : 'text-gray-400'}`}><CheckCircle2 size={14}/> Progresso</button>
                <button onClick={() => setSortBy('name')} className={`w-full text-left px-4 py-3 text-sm hover:bg-nexus-700 flex items-center gap-2 ${sortBy === 'name' ? 'text-nexus-accent' : 'text-gray-400'}`}><SortAsc size={14}/> Nome</button>
             </div>
          </div>
       </div>

       {/* Game List */}
       <div className="space-y-4 pb-8">
          {filteredGames.map(game => (
             <GameListItem key={game.id} game={game} onClick={() => setSelectedGame(game)} />
          ))}
          {filteredGames.length === 0 && (
             <div className="py-10 text-center text-gray-500 italic">Nenhum jogo encontrado.</div>
          )}
       </div>
    </div>
  );
};
