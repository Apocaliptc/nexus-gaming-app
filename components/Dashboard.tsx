
import React, { useEffect, useState } from 'react';
import { UserStats, AIInsight, Platform, Game } from '../types';
import { analyzeGamingProfile, getGameRecommendations } from '../services/geminiService';
import { PlatformIcon } from './PlatformIcon';
import { useAppContext } from '../context/AppContext';
import { MOCK_RAID } from '../services/mockData';
import { Sparkles, Trophy, Clock, BrainCircuit, Loader2, Target, Zap, Swords, Layers, Activity } from 'lucide-react';
import { GameDetailView } from './GameDetailView';

export const Dashboard: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { userStats, isSyncing } = useAppContext();
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [recommendations, setRecommendations] = useState<{title: string, reason: string}[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    const rawName = userStats?.nexusId || 'Gamer';
    const cleanName = rawName.split('@').filter(s => s.length > 0)[0] || rawName.replace('@', '');
    
    if (hour < 5) setGreeting(`Jogando até tarde, ${cleanName}?`);
    else if (hour < 12) setGreeting(`Bom dia, ${cleanName}!`);
    else if (hour < 18) setGreeting(`Boa tarde, ${cleanName}.`);
    else setGreeting(`Boa noite, ${cleanName}. Hora de jogar!`);
  }, [userStats?.nexusId]);

  const handleGenerateInsight = async () => {
    if (!userStats) return;
    setLoadingAi(true);
    try {
      const [insight, recs] = await Promise.all([
        analyzeGamingProfile(userStats),
        getGameRecommendations(userStats)
      ]);
      setAiInsight(insight);
      setRecommendations(recs);
    } catch (e) { console.error(e); } finally { setLoadingAi(false); }
  };

  if (!userStats) return null;
  if (selectedGame) return <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} />;

  const raidProgress = Math.round((MOCK_RAID.current / MOCK_RAID.target) * 100);
  const nexusPowerLevel = Math.floor((userStats.totalHours * 0.5) + (userStats.totalAchievements * 2));

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 overflow-y-auto custom-scrollbar">
      {/* PAINEL HEADER */}
      <header className="p-8 md:p-12 border-b border-nexus-800 bg-nexus-900/30">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="animate-fade-in space-y-4">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tighter leading-none">
              {greeting}
            </h1>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-nexus-800 rounded-xl border border-nexus-700 text-sm font-bold text-nexus-accent">
                {userStats.nexusId}
              </div>
              <div className="flex -space-x-2">
                 {userStats.platformsConnected?.map(p => (
                    <div key={p} className="w-9 h-9 rounded-xl bg-nexus-900 border-2 border-[#050507] flex items-center justify-center shadow-lg">
                       <PlatformIcon platform={p} className="w-4 h-4" />
                    </div>
                 ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerateInsight} 
            className="flex items-center gap-3 px-8 py-4 bg-nexus-accent hover:bg-nexus-accent/90 text-white rounded-[1.5rem] transition-all font-bold text-sm shadow-2xl shadow-nexus-accent/30 group"
          >
             {loadingAi ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} className="group-hover:rotate-12 transition-transform" />} 
             Analise Meu Legado Unificado
          </button>
        </div>
      </header>

      <div className="p-8 md:p-12 space-y-12 max-w-[1600px] mx-auto w-full">
         
         {/* MÉTRICAS UNIFICADAS */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-nexus-accent/15 to-transparent p-10 rounded-[3rem] border border-nexus-700 shadow-2xl flex flex-col justify-between group relative overflow-hidden">
               <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform">
                  <Layers size={180} />
               </div>
               <div className="flex justify-between items-start relative z-10">
                  <div className="p-4 bg-nexus-accent/20 rounded-2xl text-nexus-accent"><Layers size={28} /></div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Conectado</span>
               </div>
               <div className="mt-8 relative z-10">
                  <p className="text-5xl font-display font-bold text-white tracking-tighter">{nexusPowerLevel}</p>
                  <p className="text-xs text-nexus-accent font-bold uppercase tracking-widest mt-1">Nexus Power Level</p>
               </div>
               <div className="mt-6 h-2 bg-nexus-900 rounded-full overflow-hidden border border-nexus-800">
                  <div className="h-full bg-nexus-accent shadow-[0_0_15px_rgba(139,92,246,0.5)]" style={{ width: '65%' }}></div>
               </div>
            </div>

            <div className="bg-nexus-800 p-10 rounded-[3rem] border border-nexus-700 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform">
                  <Clock size={180} />
               </div>
               <div className="flex justify-between items-start relative z-10">
                  <div className="p-4 bg-nexus-secondary/20 rounded-2xl text-nexus-secondary"><Clock size={28} /></div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Tempo Total</span>
               </div>
               <div className="mt-8 relative z-10">
                  <p className="text-5xl font-display font-bold text-white tracking-tighter">{userStats.totalHours}h</p>
                  <p className="text-xs text-nexus-secondary font-bold uppercase tracking-widest mt-1">Horas de Imersão</p>
               </div>
               <div className="flex gap-1.5 mt-6">
                  {userStats.platformDistribution?.map((p, i) => (
                    <div key={i} className="h-2 bg-nexus-secondary rounded-full" style={{ width: `${(p.value / userStats.totalHours) * 100}%`, opacity: 1 - (i * 0.2) }}></div>
                  ))}
               </div>
            </div>

            <div className="bg-nexus-800 p-10 rounded-[3rem] border border-nexus-700 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform">
                  <Trophy size={180} />
               </div>
               <div className="flex justify-between items-start relative z-10">
                  <div className="p-4 bg-yellow-500/20 rounded-2xl text-yellow-500"><Trophy size={28} /></div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Coleção</span>
               </div>
               <div className="mt-8 relative z-10">
                  <p className="text-5xl font-display font-bold text-white tracking-tighter">{userStats.totalAchievements}</p>
                  <p className="text-xs text-yellow-500 font-bold uppercase tracking-widest mt-1">Conquistas Unificadas</p>
               </div>
               <div className="flex items-center gap-2 mt-6 text-[11px] font-bold text-gray-400">
                  <Sparkles size={14} className="text-nexus-accent" /> {userStats.platinumCount} Platinas de Elite
               </div>
            </div>
         </div>

         {/* RAID GLOBAL */}
         <div className="bg-nexus-900/50 p-12 rounded-[4rem] border border-nexus-700 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-nexus-accent/10 to-transparent opacity-30"></div>
            <Swords className="absolute -bottom-20 -right-20 text-nexus-accent opacity-5 group-hover:scale-110 transition-transform duration-1000" size={400} />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
               <div className="space-y-6 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse shadow-lg shadow-red-600/30">
                    <Activity size={14} /> RAID GLOBAL ATIVA
                  </div>
                  <h3 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter leading-tight">{MOCK_RAID.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Estamos unindo forças para dominar o hall da fama. Jogue títulos de RPG para contribuir com o contador global e desbloquear itens exclusivos.
                  </p>
                  <div className="flex items-center gap-3 text-nexus-accent text-sm font-bold uppercase tracking-[0.2em]">
                     <Target size={20} /> Progresso Global: {MOCK_RAID.target} Horas
                  </div>
               </div>
               
               <div className="w-full lg:w-96 text-center lg:text-right space-y-6">
                  <div className="flex justify-between items-end mb-2">
                     <span className="text-nexus-accent font-display font-bold text-6xl tracking-tighter">{raidProgress}%</span>
                     <span className="text-gray-500 text-sm font-bold tracking-widest uppercase">{MOCK_RAID.current} / {MOCK_RAID.target}</span>
                  </div>
                  <div className="h-5 bg-nexus-900 rounded-full border border-nexus-800 overflow-hidden shadow-inner p-1">
                     <div className="h-full bg-gradient-to-r from-nexus-accent to-nexus-secondary rounded-full shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-all duration-1000" style={{ width: `${raidProgress}%` }}></div>
                  </div>
                  <div className="flex items-center justify-center lg:justify-end gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">
                     <Zap size={14} className="text-yellow-500" /> Recompensa: {MOCK_RAID.reward}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
