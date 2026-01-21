
import React, { useEffect, useState } from 'react';
import { UserStats, AIInsight, Platform, Game } from '../types';
import { analyzeGamingProfile, getGameRecommendations } from '../services/geminiService';
import { PlatformIcon } from './PlatformIcon';
import { useAppContext } from '../context/AppContext';
import { MOCK_RAID } from '../services/mockData';
import { Sparkles, Activity, Trophy, Clock, BrainCircuit, Plus, Loader2, Calendar, ChevronRight, Globe, History, Mail, AlertCircle, CheckCircle, ExternalLink, Database, Wifi, CloudCheck, Star, Copy, Check, Link, ShieldAlert, LayoutDashboard, Ghost, Target, Zap, Swords } from 'lucide-react';
import { GameDetailView } from './GameDetailView';

export const Dashboard: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { userStats, isSyncing } = useAppContext();
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [recommendations, setRecommendations] = useState<{title: string, reason: string}[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [greeting, setGreeting] = useState('');
  const [copiedId, setCopiedId] = useState(false);

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

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 overflow-y-auto custom-scrollbar">
      <header className="p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-nexus-800">
        <div className="animate-fade-in w-full md:w-auto">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">{greeting}</h1>
            {isSyncing && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border border-nexus-accent bg-nexus-accent/10 text-nexus-accent animate-pulse">
                <Wifi size={12} /> SINCRONIZANDO...
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-4">
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400">
                {userStats.nexusId}
              </span>
          </div>
        </div>

        <button onClick={handleGenerateInsight} className="flex items-center gap-2 px-6 py-3 bg-nexus-accent hover:bg-nexus-accent/90 text-white rounded-2xl transition-all font-bold text-sm shadow-xl shadow-nexus-accent/20">
           {loadingAi ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} />} IA de Perfil
        </button>
      </header>

      <div className="p-6 md:p-10 space-y-10 max-w-[1600px] mx-auto w-full">
         
         {/* Row 1: Nexus Raids Banner */}
         <div className="bg-gradient-to-r from-nexus-accent/20 via-nexus-900 to-nexus-secondary/20 p-8 rounded-[3rem] border border-nexus-700 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
            <Swords className="absolute -bottom-10 -right-10 text-nexus-accent opacity-5 group-hover:scale-110 transition-transform" size={300} />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="space-y-4 max-w-xl">
                  <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-full animate-pulse">RAID GLOBAL ATIVA</span>
                  <h3 className="text-3xl font-display font-bold text-white">{MOCK_RAID.title}</h3>
                  <p className="text-gray-400 text-sm">A comunidade está unida para alcançar a meta. Participe e ganhe recompensas exclusivas.</p>
                  <div className="flex items-center gap-2 text-nexus-accent text-xs font-bold uppercase tracking-widest">
                     <Target size={16} /> Objetivo: {MOCK_RAID.target} horas totais
                  </div>
               </div>
               
               <div className="w-full md:w-80 text-center md:text-right space-y-4">
                  <div className="flex justify-between items-end mb-2">
                     <span className="text-nexus-accent font-bold text-4xl">{raidProgress}%</span>
                     <span className="text-gray-500 text-xs font-bold">{MOCK_RAID.current} / {MOCK_RAID.target}</span>
                  </div>
                  <div className="h-4 bg-nexus-900 rounded-full border border-nexus-800 overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-nexus-accent to-nexus-secondary shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-1000" style={{ width: `${raidProgress}%` }}></div>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Recompensa: {MOCK_RAID.reward}</p>
               </div>
            </div>
         </div>

         {/* Row 2: Stats & Backlog Exorcist */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-nexus-800 p-8 rounded-[2rem] border border-nexus-700 shadow-2xl">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Horas</p>
                <h3 className="text-4xl font-display font-bold text-white">{userStats.totalHours}</h3>
              </div>
              <div className="bg-nexus-800 p-8 rounded-[2rem] border border-nexus-700 shadow-2xl">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Conquistas</p>
                <h3 className="text-4xl font-display font-bold text-white">{userStats.totalAchievements}</h3>
              </div>
              
              {/* Backlog Exorcist Card */}
              <div className="col-span-2 bg-gradient-to-br from-[#121218] to-black p-8 rounded-[2rem] border border-nexus-700 shadow-2xl relative overflow-hidden group">
                 <Ghost className="absolute -bottom-6 -right-6 text-white/5 group-hover:rotate-12 transition-transform" size={150} />
                 <div className="relative z-10">
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Ghost size={16} className="text-nexus-secondary" /> Backlog Exorcist
                    </h4>
                    <div className="flex justify-between items-end mb-4">
                       <div>
                          <p className="text-4xl font-display font-bold text-white">{userStats.backlog?.unplayedGamesCount}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Jogos Intocados</p>
                       </div>
                       <div className="text-right">
                          <p className="text-lg font-bold text-red-500">${userStats.backlog?.monetaryValueLost}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Dívida Gamer</p>
                       </div>
                    </div>
                    <div className="bg-nexus-900/50 p-3 rounded-xl border border-nexus-800 flex items-center gap-3">
                       <Zap size={14} className="text-yellow-500" />
                       <span className="text-xs text-gray-400">Próximo Exorcismo: <strong className="text-white">{userStats.backlog?.nextTarget}</strong></span>
                    </div>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-4 h-full">
               <div 
                 onClick={() => onNavigate?.('chronos')}
                 className="bg-nexus-900 p-8 rounded-[2.5rem] border border-nexus-700 shadow-2xl h-full cursor-pointer group hover:border-nexus-accent transition-all relative overflow-hidden"
               >
                 <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <History size={180} />
                 </div>
                 <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <h4 className="text-xs font-bold text-nexus-accent uppercase tracking-widest mb-3 flex items-center gap-2">
                        <History size={16} /> Nexus Chronos
                      </h4>
                      <h3 className="text-2xl font-display font-bold text-white mb-3">Imortalize sua jornada.</h3>
                      <p className="text-gray-400 text-sm italic">
                        Transforme suas vitórias em crônicas épicas com nossa IA de narração.
                      </p>
                    </div>
                 </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
