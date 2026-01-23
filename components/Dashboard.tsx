
import React, { useEffect, useState } from 'react';
import { UserStats, AIInsight, Platform, Game, ActivityEvent, ActivityType } from '../types';
import { analyzeGamingProfile } from '../services/geminiService';
import { PlatformIcon } from './PlatformIcon';
import { SyncPortal } from './SyncPortal';
import { useAppContext } from '../context/AppContext';
import { nexusCloud } from '../services/nexusCloud';
import { MOCK_RAID, MOCK_COLLECTION } from '../services/mockData';
import { 
  Trophy, Clock, BrainCircuit, Loader2, Zap, 
  Star, Activity, Hexagon, Swords,
  Gavel, RefreshCw, Heart, MessageCircle, Share2, Package, History,
  DollarSign, AlertTriangle, ShoppingCart, ChevronRight, LayoutGrid, Box
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer
} from 'recharts';

export const Dashboard: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { userStats, linkAccount } = useAppContext();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Crawler Quick-Access State
  const [syncingPlatform, setSyncingPlatform] = useState<{platform: Platform, username: string} | null>(null);
  const [crawlerPlatform, setCrawlerPlatform] = useState<Platform>(Platform.STEAM);
  const [crawlerUsername, setCrawlerUsername] = useState('');

  useEffect(() => {
    if (userStats) {
      handleGenerateInsight();
      fetchFeed();
    }
  }, [userStats?.nexusId, userStats?.totalAchievements]);

  const fetchFeed = async () => {
    setLoadingFeed(true);
    try {
      const data = await nexusCloud.getGlobalActivities();
      setActivities(data);
    } catch (e) { 
      console.error("Feed Error", e); 
    } finally { 
      setLoadingFeed(false); 
    }
  };

  const handleGenerateInsight = async (force = false) => {
    if (!userStats) return;
    setLoadingAi(true);
    setAiError(false);
    try {
      const insight = await analyzeGamingProfile(userStats, force);
      if (insight) {
        setAiInsight(insight);
      } else if (!aiInsight) {
        setAiError(true);
      }
    } catch (e) { 
      setAiError(true);
    } finally { 
      setLoadingAi(false); 
    }
  };

  const handleStartCrawler = () => {
    if (!crawlerUsername.trim()) return;
    setSyncingPlatform({ platform: crawlerPlatform, username: crawlerUsername });
  };

  const handleSyncComplete = (games: Game[], hours: number) => {
    if (syncingPlatform) {
      linkAccount(syncingPlatform.platform, syncingPlatform.username, games, hours);
      setSyncingPlatform(null);
      setCrawlerUsername('');
      fetchFeed(); 
    }
  };

  if (!userStats) return null;

  const vaultValue = MOCK_COLLECTION.filter(i => i.ownerId === 'me').reduce((acc, i) => acc + i.value, 0);
  const raidProgress = Math.round((MOCK_RAID.current / MOCK_RAID.target) * 100);

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 overflow-y-auto custom-scrollbar">
      {/* Header Interativo */}
      <header className="p-8 md:p-12 border-b border-nexus-800 bg-gradient-to-b from-nexus-900/50 to-transparent shrink-0">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-8">
             <div 
               onClick={() => onNavigate?.('profile')}
               className="w-24 h-24 rounded-[2.5rem] bg-nexus-accent/10 border-2 border-nexus-accent/30 flex items-center justify-center text-nexus-accent shadow-2xl relative group cursor-pointer hover:border-nexus-accent transition-all"
             >
                <BrainCircuit size={48} className={loadingAi ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                <div className="absolute -inset-4 bg-nexus-accent/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </div>
             <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter leading-none">Painel DNA</h1>
                   <div className="h-px w-12 bg-nexus-accent/50 rounded-full"></div>
                </div>
                <div className="flex items-center gap-4">
                   <p className="text-gray-500 font-medium italic">Hall de {userStats.nexusId}</p>
                   <span className="text-[10px] font-black text-nexus-accent uppercase tracking-[0.2em] px-4 py-1 bg-nexus-accent/10 rounded-full border border-nexus-accent/20">Sovereign OS v4.1</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-6 bg-nexus-900/80 p-6 rounded-[3rem] border border-nexus-800 shadow-2xl backdrop-blur-md">
             <div 
               onClick={() => onNavigate?.('stats')}
               className="text-center px-8 border-r border-nexus-800 cursor-pointer group"
             >
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 group-hover:text-nexus-secondary transition-colors">Imersão</p>
                <p className="text-3xl font-display font-bold text-white leading-none group-hover:scale-105 transition-transform">{userStats.totalHours}h</p>
             </div>
             <div 
               onClick={() => onNavigate?.('achievements')}
               className="text-center px-8 border-r border-nexus-800 cursor-pointer group"
             >
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 group-hover:text-nexus-accent transition-colors">Conquistas</p>
                <p className="text-3xl font-display font-bold text-white leading-none group-hover:scale-105 transition-transform">{userStats.totalAchievements}</p>
             </div>
             <div 
               onClick={() => onNavigate?.('vault')}
               className="text-center px-8 cursor-pointer group"
             >
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 group-hover:text-nexus-accent transition-colors">Valor Cofre</p>
                <p className="text-3xl font-display font-bold text-nexus-accent leading-none group-hover:scale-105 transition-transform">${vaultValue}</p>
             </div>
          </div>
        </div>
      </header>

      <div className="p-8 md:p-12 space-y-16 max-w-[1400px] mx-auto w-full">
         
         {/* Nexus Crawler - Quick Sync Access */}
         <div className="bg-nexus-900 border border-nexus-800 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
               <RefreshCw size={300} />
            </div>
            <div className="relative z-10 flex flex-col xl:flex-row items-center gap-16">
               <div className="space-y-6 max-w-lg text-center xl:text-left">
                  <div className="inline-flex items-center gap-3 px-5 py-2 bg-nexus-accent/20 border border-nexus-accent/30 rounded-full text-nexus-accent text-[12px] font-black uppercase tracking-[0.3em]">
                     <Zap size={16} className="fill-nexus-accent" /> Nexus Crawler
                  </div>
                  <h2 className="text-5xl font-display font-bold text-white leading-tight">Sincronize seu <span className="text-nexus-accent">Hall Digital</span></h2>
                  <p className="text-gray-400 text-lg leading-relaxed italic">Rastreie troféus e horas de qualquer rede pública. Sem senhas, apenas o seu ID.</p>
               </div>

               <div className="flex-1 w-full max-w-3xl bg-nexus-800/40 p-10 rounded-[3rem] border border-nexus-700 flex flex-col md:flex-row gap-8 backdrop-blur-sm">
                  <div className="flex-1 space-y-3">
                     <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] px-4">Rede Alvo</label>
                     <select 
                        value={crawlerPlatform}
                        onChange={(e) => setCrawlerPlatform(e.target.value as Platform)}
                        className="w-full bg-nexus-900 border border-nexus-700 rounded-2xl px-6 py-5 text-sm text-white outline-none focus:border-nexus-accent transition-all appearance-none shadow-inner"
                     >
                        {[Platform.STEAM, Platform.PSN, Platform.XBOX, Platform.BATTLENET, Platform.EPIC].map(p => <option key={p} value={p}>{p}</option>)}
                     </select>
                  </div>
                  <div className="flex-[2] space-y-3">
                     <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] px-4">ID de Identificação</label>
                     <div className="relative">
                        <input 
                           type="text" 
                           placeholder="Ex: @TheDragon_2024" 
                           value={crawlerUsername}
                           onChange={e => setCrawlerUsername(e.target.value)}
                           className="w-full bg-nexus-900 border border-nexus-700 rounded-2xl px-6 py-5 text-sm text-white outline-none focus:border-nexus-accent transition-all shadow-inner" 
                        />
                        <button 
                           onClick={handleStartCrawler}
                           disabled={!crawlerUsername.trim()}
                           className="absolute right-2.5 top-2.5 px-8 py-3 bg-nexus-accent hover:bg-nexus-accent/80 text-white rounded-xl transition-all disabled:opacity-50 font-black text-[11px] uppercase tracking-widest shadow-2xl"
                        >
                           Sintonizar
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Grid de Comando: IA Insight + Matrix + Stream */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            <div className="lg:col-span-4 space-y-12">
               {/* IA Persona Card */}
               <div className="bg-gradient-to-br from-nexus-accent/15 to-nexus-900 border border-nexus-accent/30 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform">
                     <BrainCircuit size={220} className="text-nexus-accent" />
                  </div>
                  <div className="relative z-10 space-y-8">
                     <div className="flex items-center justify-between">
                        <p className="text-[12px] font-black text-nexus-accent uppercase tracking-[0.4em]">Análise Core IA</p>
                        <button onClick={() => handleGenerateInsight(true)} className="p-3 hover:bg-nexus-accent/20 rounded-2xl transition-all text-gray-600 hover:text-nexus-accent">
                           <RefreshCw size={18} className={loadingAi ? 'animate-spin' : ''} />
                        </button>
                     </div>

                     {loadingAi ? (
                        <div className="py-12 flex flex-col items-center gap-8">
                           <Loader2 className="animate-spin text-nexus-accent" size={48} />
                           <p className="text-[11px] text-gray-500 font-mono animate-pulse uppercase tracking-[0.5em]">Lendo DNA Gamer...</p>
                        </div>
                     ) : aiError ? (
                        <div className="space-y-8 py-8 text-center">
                           <AlertTriangle size={56} className="text-yellow-500 mx-auto" />
                           <p className="text-xs text-gray-400 leading-relaxed italic">O Oráculo está re-sintonizando frequências.</p>
                           <button onClick={() => handleGenerateInsight(true)} className="px-10 py-4 bg-nexus-accent/20 text-nexus-accent border border-nexus-accent/30 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-nexus-accent/30 transition-all">Reconectar Canal</button>
                        </div>
                     ) : aiInsight ? (
                        <div className="animate-fade-in space-y-8">
                           <h4 className="text-4xl font-display font-bold text-white tracking-tight leading-tight">{aiInsight.personaTitle}</h4>
                           <p className="text-lg text-gray-400 italic leading-relaxed border-l-4 border-nexus-accent pl-8">"{aiInsight.description}"</p>
                           <div className="flex flex-wrap gap-4 pt-4">
                              {aiInsight.potentialBadges.map(b => (
                                 <span key={b} className="px-4 py-1.5 bg-black/50 border border-white/5 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest">{b}</span>
                              ))}
                           </div>
                        </div>
                     ) : (
                        <div className="py-8 text-center">
                           <button onClick={() => handleGenerateInsight(true)} className="px-10 py-4 bg-nexus-accent text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-2xl">Gerar Perfil IA</button>
                        </div>
                     )}
                  </div>
               </div>

               {/* Matrix Radar Interativo */}
               <div 
                 onClick={() => onNavigate?.('stats')}
                 className="bg-nexus-900 border border-nexus-800 rounded-[3.5rem] p-12 shadow-2xl cursor-pointer hover:border-nexus-secondary transition-all group"
               >
                  <h3 className="text-[12px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-5 mb-10 group-hover:text-nexus-secondary">
                     <Activity size={20} className="text-nexus-secondary" /> Matriz de Perícia
                  </h3>
                  <div className="h-72">
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={userStats.skills}>
                           <PolarGrid stroke="#23232f" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 'bold' }} />
                           <Radar name="Skills" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.5} strokeWidth={4} />
                        </RadarChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            {/* Central Content: Legacy Preview */}
            <div className="lg:col-span-8 space-y-12 pb-40">
               <div className="flex items-center justify-between px-6">
                  <div className="flex items-center gap-6">
                     <h3 className="text-4xl font-display font-bold text-white flex items-center gap-5">
                        Registro Recente
                     </h3>
                     <div className="h-1 w-24 bg-gradient-to-r from-nexus-accent to-transparent rounded-full"></div>
                  </div>
                  <button onClick={() => onNavigate?.('pulse')} className="text-xs font-black uppercase tracking-widest text-nexus-accent hover:text-white transition-colors flex items-center gap-2">
                     Ver Pulse Global <ChevronRight size={16} />
                  </button>
               </div>

               {loadingFeed ? (
                  <div className="space-y-12">
                     {[1,2].map(i => (
                        <div key={i} className="h-64 bg-nexus-900/40 border border-nexus-800 rounded-[3.5rem] animate-pulse"></div>
                     ))}
                  </div>
               ) : (
                  <div className="space-y-12">
                     {activities.slice(0, 3).map(activity => (
                        <div key={activity.id} className={`bg-nexus-900/80 border rounded-[3.5rem] overflow-hidden shadow-2xl transition-all hover:border-nexus-600 relative group/card border-nexus-800`}>
                           <div className="p-12 flex items-start gap-10">
                              <div className="relative shrink-0">
                                 <img src={activity.userAvatar} className="w-20 h-20 rounded-[2rem] border-2 border-nexus-700 shadow-2xl group-hover/card:border-nexus-accent transition-all duration-700" />
                                 <div className="absolute -bottom-2 -right-2 p-2.5 bg-nexus-900 border border-nexus-700 rounded-2xl shadow-2xl">
                                    <Trophy size={14} className="text-nexus-accent" />
                                 </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-5 mb-4">
                                    <h4 className="font-bold text-white text-3xl tracking-tighter">@{activity.username}</h4>
                                    <span className="text-[11px] text-gray-600 font-mono bg-black/60 px-4 py-1.5 rounded-full border border-white/5 uppercase tracking-widest">{new Date(activity.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                 </div>
                                 
                                 <div className="space-y-8">
                                    <p className="text-gray-300 text-2xl leading-relaxed italic font-medium">"{activity.details.content}"</p>
                                    
                                    {activity.details.gameTitle && (
                                       <div 
                                          onClick={() => onNavigate?.('library')}
                                          className="flex items-center gap-6 bg-nexus-800/80 p-6 rounded-[2.5rem] border border-nexus-700 max-w-xl group/sub cursor-pointer hover:border-nexus-accent transition-all shadow-2xl"
                                       >
                                          <img src={activity.details.gameCover} className="w-16 h-24 rounded-2xl object-cover shadow-2xl group-hover/sub:scale-105 transition-transform duration-700" />
                                          <div className="flex-1 min-w-0">
                                             <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.3em] mb-2">Atividade Registrada</p>
                                             <p className="text-xl font-bold text-white truncate group-hover/sub:text-nexus-accent transition-colors">{activity.details.gameTitle}</p>
                                             <div className="flex items-center gap-3 mt-2">
                                                <PlatformIcon platform={activity.details.platform || Platform.STEAM} className="w-4 h-4" />
                                                <span className="text-[11px] text-gray-600 font-black uppercase tracking-widest">{activity.details.platform || 'Nexus'}</span>
                                             </div>
                                          </div>
                                          <ChevronRight className="text-gray-700 group-hover/sub:text-white transition-all mr-2" size={24} />
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>

      {syncingPlatform && (
        <SyncPortal 
          platform={syncingPlatform.platform} 
          username={syncingPlatform.username} 
          onComplete={handleSyncComplete}
          onCancel={() => setSyncingPlatform(null)}
        />
      )}
    </div>
  );
};
