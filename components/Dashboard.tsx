
import React, { useEffect, useState } from 'react';
import { UserStats, AIInsight, Platform, Game, ActivityEvent, ActivityType } from '../types';
import { analyzeGamingProfile } from '../services/geminiService';
import { PlatformIcon } from './PlatformIcon';
import { useAppContext } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { Sparkles, Activity, Trophy, Clock, BrainCircuit, Plus, Loader2, Calendar, ChevronRight, Globe, History, Mail, AlertCircle, CheckCircle, ExternalLink, Database, Wifi, CloudCheck } from 'lucide-react';
import { GameDetailView } from './GameDetailView';

export const Dashboard: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { userStats, isSyncing } = useAppContext();
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting(`Jogando até tarde, ${userStats?.nexusId}?`);
    else if (hour < 12) setGreeting(`Bom dia, ${userStats?.nexusId}!`);
    else if (hour < 18) setGreeting(`Boa tarde, ${userStats?.nexusId}.`);
    else setGreeting(`Boa noite, ${userStats?.nexusId}. Hora de jogar!`);
  }, [userStats?.nexusId]);

  if (!userStats) return null;

  const handleGenerateInsight = async () => {
    setLoadingAi(true);
    try {
      const insight = await analyzeGamingProfile(userStats);
      setAiInsight(insight);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  if (selectedGame) return <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} />;

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 overflow-y-auto custom-scrollbar">
      <header className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-nexus-800">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">{greeting}</h1>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${isSyncing ? 'bg-nexus-accent/20 border-nexus-accent text-nexus-accent animate-pulse' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
              {isSyncing ? <Wifi size={10} /> : <Database size={10} />}
              {isSyncing ? 'Sincronizando Nuvem...' : 'Nexus DB Conectado'}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20 text-xs font-bold uppercase tracking-widest">
              <Sparkles size={14} /> Prestige: {userStats.prestigePoints.toLocaleString()}
            </div>
            <p className="text-[10px] text-gray-500 italic">Arquitetura de dados isolada por identificador único.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6 md:mt-0">
           <button onClick={() => onNavigate?.('feed')} className="flex items-center gap-2 px-5 py-2.5 bg-nexus-900 hover:bg-nexus-800 text-white rounded-xl border border-nexus-700 transition-all font-bold text-sm">
              <Globe size={18} /> Feed Global
           </button>
           {loadingAi ? (
             <div className="flex items-center gap-2 px-5 py-2.5 bg-nexus-800 rounded-xl text-nexus-accent border border-nexus-accent/20">
               <Loader2 className="animate-spin" size={18} /> Analisando LocalDB...
             </div>
           ) : (
             <button onClick={handleGenerateInsight} className="flex items-center gap-2 px-5 py-2.5 bg-nexus-accent hover:bg-nexus-accent/90 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-nexus-accent/20">
                <BrainCircuit size={18} /> IA de Perfil
             </button>
           )}
        </div>
      </header>

      <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
         {/* KPI Cards and rest of dashboard content */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-nexus-800 p-6 rounded-3xl border border-nexus-700 shadow-xl group hover:border-nexus-accent transition-colors">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 text-center">Horas Totais</p>
                <h3 className="text-3xl font-display font-bold text-white text-center">{userStats.totalHours}h</h3>
              </div>
              <div className="bg-nexus-800 p-6 rounded-3xl border border-nexus-700 shadow-xl group hover:border-nexus-accent transition-colors">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 text-center">Conquistas</p>
                <h3 className="text-3xl font-display font-bold text-white text-center">{userStats.totalAchievements}</h3>
              </div>
              <div className="bg-nexus-800 p-6 rounded-3xl border border-nexus-700 shadow-xl group hover:border-nexus-accent transition-colors">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 text-center">Platinas</p>
                <h3 className="text-3xl font-display font-bold text-white text-center">{userStats.platinumCount}</h3>
              </div>
              <div className="bg-nexus-800 p-6 rounded-3xl border border-nexus-700 shadow-xl group hover:border-nexus-accent transition-colors">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 text-center">Contas</p>
                <h3 className="text-3xl font-display font-bold text-white text-center">{userStats.linkedAccounts.length}</h3>
              </div>
            </div>

            <div className="lg:col-span-4">
               <div 
                 onClick={() => onNavigate?.('chronos')}
                 className="bg-gradient-to-br from-indigo-900/40 to-nexus-900 p-6 rounded-[2rem] border border-nexus-700 shadow-xl cursor-pointer group hover:border-nexus-accent transition-all relative overflow-hidden h-full"
               >
                 <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <h4 className="text-xs font-bold text-nexus-secondary uppercase tracking-widest mb-1 flex items-center gap-2">
                        <History size={14} /> Memória Local
                      </h4>
                      <h3 className="text-xl font-display font-bold text-white mb-2">Dados em Segurança.</h3>
                      <p className="text-xs text-gray-400 leading-relaxed italic">
                        Seus dados são criptografados localmente sob o ID {userStats.nexusId}.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-nexus-accent group-hover:translate-x-1 transition-transform">
                       Abrir Histórico <ChevronRight size={14} />
                    </div>
                 </div>
               </div>
            </div>
         </div>

         {/* Latest Activities or Games */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-nexus-800 p-6 rounded-[2.5rem] border border-nexus-700 shadow-xl">
               <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                 <Activity className="text-nexus-accent" size={20} /> Atividade Recente
               </h3>
               <div className="space-y-4">
                  {userStats.recentGames.slice(0, 3).map(game => (
                    <div key={game.id} onClick={() => setSelectedGame(game)} className="flex items-center gap-4 p-4 bg-nexus-900/50 rounded-2xl border border-nexus-700/50 hover:bg-nexus-900 transition-all cursor-pointer">
                       <img src={game.coverUrl} className="w-12 h-16 object-cover rounded-lg" />
                       <div className="flex-1">
                          <h4 className="font-bold text-white text-sm">{game.title}</h4>
                          <p className="text-xs text-gray-500">{game.platform} • {game.hoursPlayed}h jogadas</p>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-bold text-nexus-secondary">{Math.round((game.achievementCount/game.totalAchievements)*100)}%</p>
                          <p className="text-[10px] text-gray-600 uppercase">Progresso</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-nexus-800 p-6 rounded-[2.5rem] border border-nexus-700 shadow-xl">
               <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                 <Sparkles className="text-yellow-500" size={20} /> IA Insight
               </h3>
               {aiInsight ? (
                 <div className="space-y-4 animate-fade-in">
                    <div className="bg-nexus-accent/10 p-4 rounded-2xl border border-nexus-accent/20">
                       <h4 className="text-nexus-accent font-display font-bold text-lg mb-1">{aiInsight.personaTitle}</h4>
                       <p className="text-sm text-gray-300 leading-relaxed">{aiInsight.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-nexus-900 p-3 rounded-xl border border-nexus-700">
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Sugestões de Gênero</p>
                          <div className="flex flex-wrap gap-1.5">
                             {aiInsight.suggestedGenres.map(g => (
                               <span key={g} className="text-[10px] px-2 py-0.5 bg-nexus-800 rounded border border-nexus-700 text-gray-300">{g}</span>
                             ))}
                          </div>
                       </div>
                       <div className="bg-nexus-900 p-3 rounded-xl border border-nexus-700">
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Dica de Mestre</p>
                          <p className="text-[11px] text-gray-400 italic">{aiInsight.improvementTip}</p>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-10 opacity-50">
                    <BrainCircuit size={48} className="mb-4 text-gray-600" />
                    <p className="text-sm text-gray-500">Gere uma análise para ver sua persona.</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
