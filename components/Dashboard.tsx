
import React, { useEffect, useState } from 'react';
import { UserStats, AIInsight, Platform, Game, ActivityEvent, ActivityType } from '../types';
import { analyzeGamingProfile, getGameRecommendations } from '../services/geminiService';
import { PlatformIcon } from './PlatformIcon';
import { useAppContext } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { Sparkles, Activity, Trophy, Clock, BrainCircuit, Plus, Loader2, Calendar, ChevronRight, Globe, History, Mail, AlertCircle, CheckCircle, ExternalLink, Database, Wifi, CloudCheck, Star, Copy, Check, Link } from 'lucide-react';
import { GameDetailView } from './GameDetailView';

export const Dashboard: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { userStats, isSyncing } = useAppContext();
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [recommendations, setRecommendations] = useState<{title: string, reason: string}[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [greeting, setGreeting] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isCloudConnected = !!localStorage.getItem('nexus_db_url');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting(`Jogando até tarde, ${userStats?.nexusId}?`);
    else if (hour < 12) setGreeting(`Bom dia, ${userStats?.nexusId}!`);
    else if (hour < 18) setGreeting(`Boa tarde, ${userStats?.nexusId}.`);
    else setGreeting(`Boa noite, ${userStats?.nexusId}. Hora de jogar!`);
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  const copyId = () => {
    if (!userStats) return;
    navigator.clipboard.writeText(userStats.nexusId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyInviteLink = () => {
    if (!userStats) return;
    const link = `${window.location.origin}${window.location.pathname}?user=${encodeURIComponent(userStats.nexusId)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!userStats) return null;
  if (selectedGame) return <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} />;

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 overflow-y-auto custom-scrollbar">
      <header className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-nexus-800">
        <div className="animate-fade-in">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">{greeting}</h1>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
              isSyncing ? 'bg-nexus-accent/20 border-nexus-accent text-nexus-accent animate-pulse' : 
              isCloudConnected ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
            }`}>
              {isSyncing ? <Wifi size={12} /> : isCloudConnected ? <CloudCheck size={12} /> : <AlertCircle size={12} />}
              {isSyncing ? 'SINCRONIZANDO...' : isCloudConnected ? 'NEXUS CLOUD ATIVA' : 'MODO LOCAL'}
            </div>
            
            <div className="flex gap-1.5">
              <button 
                onClick={copyId}
                className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-400 hover:text-white hover:border-nexus-accent transition-all"
                title="Copiar Nexus ID"
              >
                {copiedId ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                {userStats.nexusId}
              </button>
              <button 
                onClick={copyInviteLink}
                className="flex items-center gap-2 px-3 py-1 bg-nexus-accent/10 border border-nexus-accent/20 rounded-full text-[10px] font-bold text-nexus-accent hover:bg-nexus-accent/20 transition-all"
                title="Copiar Link de Convite Direto"
              >
                {copiedLink ? <Check size={12} /> : <Link size={12} />}
                {copiedLink ? 'LINK COPIADO!' : 'CONVIDAR AMIGO'}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20 text-xs font-bold uppercase tracking-widest">
              <Sparkles size={14} /> Prestige: {userStats.prestigePoints.toLocaleString()}
            </div>
            <p className="text-[10px] text-gray-500 italic">Compartilhe o link de convite para que amigos acessem seu legado.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6 md:mt-0">
           <button onClick={() => onNavigate?.('feed')} className="flex items-center gap-2 px-5 py-2.5 bg-nexus-900 hover:bg-nexus-800 text-white rounded-xl border border-nexus-700 transition-all font-bold text-sm">
              <Globe size={18} /> Feed Global
           </button>
           {loadingAi ? (
             <div className="flex items-center gap-2 px-5 py-2.5 bg-nexus-800 rounded-xl text-nexus-accent border border-nexus-accent/20">
               <Loader2 className="animate-spin" size={18} /> Orquestrando IA...
             </div>
           ) : (
             <button onClick={handleGenerateInsight} className="flex items-center gap-2 px-5 py-2.5 bg-nexus-accent hover:bg-nexus-accent/90 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-nexus-accent/20">
                <BrainCircuit size={18} /> IA de Perfil
             </button>
           )}
        </div>
      </header>

      <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
         
         {/* KPI Cards */}
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
                        <History size={14} /> Memória Ativa
                      </h4>
                      <h3 className="text-xl font-display font-bold text-white mb-2">Seus dados, seu legado.</h3>
                      <p className="text-xs text-gray-400 leading-relaxed italic">
                        Visualizando persistência cloud para {userStats.nexusId}.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-nexus-accent group-hover:translate-x-1 transition-transform">
                       Abrir Histórico <ChevronRight size={14} />
                    </div>
                 </div>
               </div>
            </div>
         </div>

         {/* IA RECOMMENDATIONS */}
         {recommendations.length > 0 && (
           <div className="animate-fade-in space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 px-2">
                 <Star className="text-yellow-500" size={20} fill="currentColor" /> Recomendado para seu Perfil
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {recommendations.map((rec, i) => (
                   <div key={i} className="bg-nexus-900/50 backdrop-blur-md border border-nexus-700 rounded-3xl p-6 hover:border-nexus-secondary transition-all group">
                      <h4 className="font-bold text-nexus-secondary mb-2 flex items-center justify-between">
                         {rec.title}
                         <Sparkles size={14} />
                      </h4>
                      <p className="text-sm text-gray-400 leading-relaxed italic">
                         "{rec.reason}"
                      </p>
                   </div>
                 ))}
              </div>
           </div>
         )}

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
                    <p className="text-sm text-gray-500">Gere uma análise para ver sua persona e recomendações.</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
