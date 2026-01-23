
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

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 overflow-y-auto custom-scrollbar">
      {/* Header Interativo */}
      <header className="p-6 md:p-12 border-b border-nexus-800 bg-gradient-to-b from-nexus-900/50 to-transparent shrink-0">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-8 md:gap-10">
          <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
             <div 
               onClick={() => onNavigate?.('profile')}
               className="w-16 h-16 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2.5rem] bg-nexus-accent/10 border-2 border-nexus-accent/30 flex items-center justify-center text-nexus-accent shadow-2xl relative group cursor-pointer hover:border-nexus-accent transition-all"
             >
                <BrainCircuit size={32} md:size={48} className={loadingAi ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
             </div>
             <div className="space-y-1 md:space-y-2 flex-1">
                <div className="flex items-center gap-2 md:gap-3">
                   <h1 className="text-2xl md:text-5xl font-display font-bold text-white tracking-tighter leading-none">Painel DNA</h1>
                   <div className="hidden md:block h-px w-12 bg-nexus-accent/50 rounded-full"></div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                   <p className="text-gray-500 font-medium italic text-xs md:text-base">Hall de {userStats.nexusId}</p>
                </div>
             </div>
          </div>

          <div className="flex items-center justify-around md:justify-center gap-2 md:gap-6 bg-nexus-900/80 p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] border border-nexus-800 shadow-2xl backdrop-blur-md w-full md:w-auto">
             <div onClick={() => onNavigate?.('stats')} className="text-center px-2 md:px-8 md:border-r border-nexus-800 cursor-pointer group">
                <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Imersão</p>
                <p className="text-xl md:text-3xl font-display font-bold text-white leading-none">{userStats.totalHours}h</p>
             </div>
             <div onClick={() => onNavigate?.('achievements')} className="text-center px-2 md:px-8 md:border-r border-nexus-800 cursor-pointer group">
                <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Conquistas</p>
                <p className="text-xl md:text-3xl font-display font-bold text-white leading-none">{userStats.totalAchievements}</p>
             </div>
             <div onClick={() => onNavigate?.('vault')} className="text-center px-2 md:px-8 cursor-pointer group">
                <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Cofre</p>
                <p className="text-xl md:text-3xl font-display font-bold text-nexus-accent leading-none">${vaultValue}</p>
             </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-12 space-y-10 md:space-y-16 max-w-[1400px] mx-auto w-full">
         
         {/* Nexus Crawler - Quick Sync Access */}
         <div className="bg-nexus-900 border border-nexus-800 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 flex flex-col xl:flex-row items-center gap-8 md:gap-16">
               <div className="space-y-4 md:space-y-6 max-w-lg text-center xl:text-left">
                  <div className="inline-flex items-center gap-2 md:gap-3 px-4 py-1.5 bg-nexus-accent/20 border border-nexus-accent/30 rounded-full text-nexus-accent text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em]">
                     <Zap size={14} md:size={16} className="fill-nexus-accent" /> Nexus Crawler
                  </div>
                  <h2 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight">Sincronize seu <span className="text-nexus-accent">Hall</span></h2>
               </div>

               <div className="flex-1 w-full max-w-3xl bg-nexus-800/40 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-nexus-700 flex flex-col md:flex-row gap-4 md:gap-8 backdrop-blur-sm">
                  <div className="flex-1 space-y-2">
                     <select 
                        value={crawlerPlatform}
                        onChange={(e) => setCrawlerPlatform(e.target.value as Platform)}
                        className="w-full bg-nexus-900 border border-nexus-700 rounded-xl px-4 md:px-6 py-4 md:py-5 text-sm text-white outline-none focus:border-nexus-accent"
                     >
                        {[Platform.STEAM, Platform.PSN, Platform.XBOX, Platform.BATTLENET, Platform.EPIC].map(p => <option key={p} value={p}>{p}</option>)}
                     </select>
                  </div>
                  <div className="flex-[2] space-y-2 relative">
                        <input 
                           type="text" 
                           placeholder="ID Público" 
                           value={crawlerUsername}
                           onChange={e => setCrawlerUsername(e.target.value)}
                           className="w-full bg-nexus-900 border border-nexus-700 rounded-xl px-4 md:px-6 py-4 md:py-5 text-sm text-white outline-none focus:border-nexus-accent" 
                        />
                        <button 
                           onClick={handleStartCrawler}
                           disabled={!crawlerUsername.trim()}
                           className="w-full md:w-auto md:absolute right-2 top-2 mt-2 md:mt-0 px-8 py-3 bg-nexus-accent hover:bg-nexus-accent/80 text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-2xl"
                        >
                           Sintonizar
                        </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Grid de Comando: IA Insight + Matrix + Stream */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
            
            <div className="lg:col-span-4 space-y-8 md:space-y-12">
               {/* IA Persona Card */}
               <div className="bg-gradient-to-br from-nexus-accent/15 to-nexus-900 border border-nexus-accent/30 rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10 space-y-6 md:space-y-8">
                     <p className="text-[10px] md:text-[12px] font-black text-nexus-accent uppercase tracking-[0.4em]">Análise Core IA</p>
                     {loadingAi ? (
                        <div className="py-12 flex flex-col items-center gap-8">
                           <Loader2 className="animate-spin text-nexus-accent" size={48} />
                           <p className="text-[11px] text-gray-500 font-mono animate-pulse uppercase tracking-[0.5em]">Lendo DNA Gamer...</p>
                        </div>
                     ) : aiInsight ? (
                        <div className="animate-fade-in space-y-6 md:space-y-8">
                           <h4 className="text-2xl md:text-4xl font-display font-bold text-white tracking-tight leading-tight">{aiInsight.personaTitle}</h4>
                           <p className="text-sm md:text-lg text-gray-400 italic leading-relaxed border-l-4 border-nexus-accent pl-4 md:pl-8">"{aiInsight.description}"</p>
                        </div>
                     ) : (
                        <div className="py-8 text-center">
                           <button onClick={() => handleGenerateInsight(true)} className="px-10 py-4 bg-nexus-accent text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-2xl">Gerar Perfil IA</button>
                        </div>
                     )}
                  </div>
               </div>

               {/* Matrix Radar Interativo */}
               <div onClick={() => onNavigate?.('stats')} className="bg-nexus-900 border border-nexus-800 rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-12 shadow-2xl cursor-pointer hover:border-nexus-secondary transition-all group">
                  <h3 className="text-[10px] md:text-[12px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-4 mb-8">
                     <Activity size={18} md:size={20} className="text-nexus-secondary" /> Matriz de Perícia
                  </h3>
                  <div className="h-64 md:h-72">
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={userStats.skills}>
                           <PolarGrid stroke="#23232f" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }} />
                           <Radar name="Skills" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.5} strokeWidth={4} />
                        </RadarChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            {/* Central Content: Legacy Preview */}
            <div className="lg:col-span-8 space-y-8 md:space-y-12 pb-24 md:pb-40">
               <div className="flex items-center justify-between px-4 md:px-6">
                  <h3 className="text-2xl md:text-4xl font-display font-bold text-white">Registro Recente</h3>
               </div>

               {loadingFeed ? (
                  <div className="space-y-8">
                     {[1,2].map(i => (
                        <div key={i} className="h-48 md:h-64 bg-nexus-900/40 border border-nexus-800 rounded-[2rem] md:rounded-[3.5rem] animate-pulse"></div>
                     ))}
                  </div>
               ) : (
                  <div className="space-y-8 md:space-y-12">
                     {activities.slice(0, 3).map(activity => (
                        <div key={activity.id} className="bg-nexus-900/80 border rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl transition-all border-nexus-800">
                           <div className="p-6 md:p-12 flex flex-col md:flex-row items-start gap-6 md:gap-10 text-left">
                              <img src={activity.userAvatar} className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-[2rem] border-2 border-nexus-700 shadow-2xl" />
                              <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-white text-xl md:text-3xl tracking-tighter mb-2">@{activity.username}</h4>
                                 <p className="text-gray-300 text-sm md:text-2xl leading-relaxed italic mb-6">"{activity.details.content}"</p>
                                 
                                 {activity.details.gameTitle && (
                                    <div onClick={() => onNavigate?.('library')} className="flex items-center gap-4 bg-nexus-800/80 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-nexus-700 cursor-pointer hover:border-nexus-accent transition-all shadow-2xl">
                                       <img src={activity.details.gameCover} className="w-10 h-14 md:w-16 md:h-24 rounded-lg md:rounded-2xl object-cover" />
                                       <div className="flex-1 min-w-0">
                                          <p className="text-xs md:text-xl font-bold text-white truncate">{activity.details.gameTitle}</p>
                                          <p className="text-[9px] md:text-[11px] text-gray-500 uppercase tracking-widest">{activity.details.platform || 'Nexus'}</p>
                                       </div>
                                    </div>
                                 )}
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
