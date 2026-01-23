
/**
 * dar creditos a Jean Paulo Lunkes (@apocaliptc)
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Friend, Game, UserStats, Platform, Testimonial, ActivityEvent, PCSetup, CollectionItem } from '../types';
import { nexusCloud } from '../services/nexusCloud';
import { GameDetailView } from './GameDetailView';
import { NexusIDCard } from './NexusIDCard';
import { PlatformIcon } from './PlatformIcon';
import { useAppContext } from '../context/AppContext';
import { analyzeGamingProfile } from '../services/geminiService';
import { 
  ChevronLeft, Trophy, Crown, MessageSquare, Swords, LayoutDashboard, 
  Grid, Clock, Medal, Sparkles, Loader2, Zap, Heart, Info, Send, 
  Star, Award, AlertCircle, Play, Activity, BrainCircuit, RefreshCw, Cpu, ChevronRight,
  ShieldCheck, Target, Users, Box, History, Link, BarChart3, Flame, TrendingUp, Gamepad2, Monitor, HardDrive, Keyboard, Headphones, MousePointer2,
  Database, Hexagon
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, 
  Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, Cell, PolarRadiusAxis
} from 'recharts';

interface Props {
  onNavigate?: (tab: string) => void;
  friendData?: Friend; 
  onCloseFriend?: () => void;
}

export const ProfileView: React.FC<Props> = ({ onNavigate, friendData, onCloseFriend }) => {
  const { userStats: currentUserStats } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'collection' | 'setup' | 'testimonials'>('overview');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [fullUserStats, setFullUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<any | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [newTestimonial, setNewTestimonial] = useState('');
  const [selectedVibe, setSelectedVibe] = useState<'pro' | 'mvp' | 'legend'>('pro');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetId = friendData?.nexusId || currentUserStats?.nexusId;
  const isOwnProfile = targetId === currentUserStats?.nexusId;

  useEffect(() => {
    const loadProfileData = async () => {
      if (!targetId) return;
      
      setIsLoading(true);
      try {
        const [stats, wall, feed] = await Promise.all([
          nexusCloud.getUser(targetId),
          nexusCloud.getTestimonials(targetId),
          nexusCloud.getGlobalActivities()
        ]);
        
        if (stats) {
            setFullUserStats(stats);
            setLoadingAi(true);
            const insight = await analyzeGamingProfile(stats);
            setAiInsight(insight);
            setLoadingAi(false);
        }
        
        setTestimonials(wall);
        setActivities(feed.filter(a => a.userId === targetId));
      } catch (err) {
        console.warn("Nexus Pulse: Erro ao sincronizar perfil.");
        if (isOwnProfile && currentUserStats) setFullUserStats(currentUserStats);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfileData();
  }, [targetId, currentUserStats?.nexusId]);

  const userItems = useMemo(() => {
    return fullUserStats?.collection || [];
  }, [fullUserStats]);

  const collectionValue = useMemo(() => {
    return userItems.reduce((acc, i) => acc + i.value, 0);
  }, [userItems]);

  const trophyBreakdown = useMemo(() => {
    if (!fullUserStats) return { plat: 0, gold: 0, silv: 0, bron: 0 };
    const total = fullUserStats.totalAchievements;
    const plat = fullUserStats.platinumCount || 0;
    const gold = Math.floor((total - plat) * 0.15);
    const silv = Math.floor((total - plat) * 0.35);
    const bron = Math.max(0, total - plat - gold - silv);
    return { plat, gold, silv, bron };
  }, [fullUserStats]);

  const topGames = useMemo(() => {
    if (!fullUserStats) return [];
    return [...fullUserStats.recentGames]
      .sort((a, b) => b.hoursPlayed - a.hoursPlayed)
      .slice(0, 5);
  }, [fullUserStats]);

  const synergyData = useMemo(() => {
    if (!currentUserStats || !fullUserStats || isOwnProfile) return null;
    
    const myGames = new Set(currentUserStats.recentGames.map(g => g.title.toLowerCase()));
    const theirGames = fullUserStats.recentGames;
    const shared = theirGames.filter(g => myGames.has(g.title.toLowerCase()));
    
    const mapToCats = (stats: UserStats) => {
      const d = stats.genreDistribution || [];
      const c: Record<string, number> = { RPG: 0, Action: 0, Souls: 0, FPS: 0, Indie: 0, Strategy: 0 };
      d.forEach(item => {
        if (c.hasOwnProperty(item.name)) c[item.name] = item.value;
      });
      return c;
    };

    const myCats = mapToCats(currentUserStats);
    const theirCats = mapToCats(fullUserStats);

    const radarChartData = Object.keys(myCats).map(cat => ({
      subject: cat,
      A: myCats[cat],
      B: theirCats[cat]
    }));

    let totalDiff = 0;
    Object.keys(myCats).forEach(k => totalDiff += Math.abs(myCats[k] - theirCats[k]));
    const percentage = Math.max(0, 100 - Math.floor(totalDiff / 3.5));

    return { percentage, sharedGames: shared, radarChartData };
  }, [currentUserStats, fullUserStats, isOwnProfile]);

  const handlePostTestimonial = async () => {
    if (!newTestimonial.trim() || !currentUserStats || isOwnProfile) return;
    setIsSubmitting(true);
    
    const testimonial: Testimonial = {
      id: `t-${Date.now()}`,
      fromNexusId: currentUserStats.nexusId,
      fromName: currentUserStats.nexusId.replace('@', ''),
      fromAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserStats.nexusId}`,
      content: newTestimonial,
      timestamp: new Date().toISOString(),
      vibe: selectedVibe
    };

    try {
      await nexusCloud.saveTestimonial(targetId!, testimonial);
      setTestimonials(prev => [testimonial, ...prev]);
      setNewTestimonial('');
    } catch (err) {
      console.error("Falha ao salvar depoimento");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !fullUserStats) return (
    <div className="h-full flex flex-col items-center justify-center bg-[#050507] gap-4">
      <Loader2 className="animate-spin text-nexus-accent" size={48} />
      <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">Invocando Dados Nexus...</p>
    </div>
  );
  
  if (selectedGame) return <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} isOwner={isOwnProfile} />;

  const displayStats = fullUserStats;

  return (
    <div className="h-full bg-[#050507] text-gray-100 overflow-y-auto custom-scrollbar animate-fade-in relative">
      
      <div className="relative border-b border-nexus-800">
         {onCloseFriend && (
           <button onClick={onCloseFriend} className="absolute top-4 left-4 md:top-6 md:left-6 z-50 p-2 bg-black/60 hover:bg-nexus-accent rounded-full border border-white/10 text-white transition-all shadow-2xl">
             <ChevronLeft size={20} md:size={24} />
           </button>
         )}
         
         <div className="h-48 md:h-80 w-full relative overflow-hidden bg-gradient-to-br from-nexus-900 via-nexus-800 to-black">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
         </div>
         
         <div className="max-w-[1400px] mx-auto px-4 md:px-8 -mt-24 md:-mt-40 relative z-30 flex flex-col xl:flex-row items-center xl:items-end gap-6 md:gap-12 pb-8 md:pb-12">
            <div className="w-full max-w-sm md:max-w-none xl:w-auto">
               {displayStats && <NexusIDCard stats={displayStats} insight={aiInsight} />}
            </div>
            
            <div className="flex-1 w-full pb-4 text-center xl:text-left space-y-4 md:space-y-6">
               <div className="space-y-1 md:space-y-2">
                  <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 xl:justify-start justify-center">
                     <h2 className="text-3xl md:text-7xl font-display font-bold text-white tracking-tighter leading-none">{targetId?.replace('@','')}</h2>
                     <div className="flex gap-2">
                        <span className="px-3 py-1 bg-nexus-accent/20 border border-nexus-accent/30 text-nexus-accent text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Elite Operative</span>
                        <span className="px-3 py-1 bg-nexus-secondary/20 border border-nexus-secondary/30 text-nexus-secondary text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Verificado</span>
                     </div>
                  </div>
                  <p className="text-gray-400 font-medium italic text-base md:text-xl opacity-80">
                    Sintonizado via {displayStats?.platformsConnected.length} redes ativas.
                  </p>
               </div>

               <div className="flex flex-wrap justify-center xl:justify-start gap-2 md:gap-4 pt-2">
                  <StatItem label="Imersão" value={`${displayStats?.totalHours}h`} />
                  
                  <div className="flex items-center gap-2 md:gap-3 bg-nexus-900/80 px-4 md:px-6 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2.5rem] border border-nexus-800 shadow-2xl backdrop-blur-xl">
                    <TrophyBubble label="P" value={trophyBreakdown.plat} color="text-nexus-accent" bg="bg-nexus-accent/10" icon={Crown} />
                    <TrophyBubble label="G" value={trophyBreakdown.gold} color="text-yellow-500" bg="bg-yellow-500/10" icon={Trophy} />
                    <TrophyBubble label="S" value={trophyBreakdown.silv} color="text-gray-400" bg="bg-gray-400/10" icon={Medal} />
                    <TrophyBubble label="B" value={trophyBreakdown.bron} color="text-orange-700" bg="bg-orange-700/10" icon={Award} />
                  </div>

                  <StatItem label="Setup" value={displayStats?.setup?.gpu.split(' ').pop() || 'Rig'} onClick={() => setActiveTab('setup')} highlight />
               </div>
            </div>
         </div>
      </div>

      <div className="sticky top-0 z-40 bg-[#050507]/90 backdrop-blur-xl border-b border-nexus-800 overflow-x-auto no-scrollbar">
         <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex gap-4 md:gap-8 min-w-max">
            <button onClick={() => setActiveTab('overview')} className={`py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === 'overview' ? 'border-nexus-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Visão Geral</button>
            <button onClick={() => setActiveTab('achievements')} className={`py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === 'achievements' ? 'border-nexus-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Conquistas</button>
            <button onClick={() => setActiveTab('collection')} className={`py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === 'collection' ? 'border-nexus-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Coleção</button>
            <button onClick={() => setActiveTab('setup')} className={`py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === 'setup' ? 'border-nexus-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Setup</button>
            <button onClick={() => setActiveTab('testimonials')} className={`py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all flex items-center gap-2 ${activeTab === 'testimonials' ? 'border-nexus-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
               Mural
               <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-[7px] md:text-[8px]">{testimonials.length}</span>
            </button>
         </div>
      </div>

      <div className="p-4 md:p-12 space-y-10 md:space-y-16 max-w-[1400px] mx-auto w-full pb-32 md:pb-40">
         
         {activeTab === 'overview' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
              <div className="lg:col-span-4 space-y-8 md:space-y-12">
                 
                 {/* DNA IA Card */}
                 <div className="bg-gradient-to-br from-nexus-accent/15 to-nexus-900 border border-nexus-accent/30 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform">
                       <BrainCircuit size={160} md:size={220} className="text-nexus-accent" />
                    </div>
                    <div className="relative z-10 space-y-6 md:space-y-8">
                       <p className="text-[10px] md:text-[12px] font-black text-nexus-accent uppercase tracking-[0.4em]">Análise de DNA IA</p>
                       {loadingAi ? (
                          <div className="py-8 md:py-12 flex flex-col items-center gap-6 md:gap-8">
                             <Loader2 className="animate-spin text-nexus-accent" size={32} md:size={48} />
                             <p className="text-[10px] md:text-[11px] text-gray-500 font-mono animate-pulse uppercase tracking-[0.5em]">Lendo Metadados...</p>
                          </div>
                       ) : aiInsight ? (
                          <div className="animate-fade-in space-y-6 md:space-y-8">
                             <h4 className="text-2xl md:text-4xl font-display font-bold text-white tracking-tight leading-tight">{aiInsight.personaTitle}</h4>
                             <p className="text-sm md:text-lg text-gray-400 italic leading-relaxed border-l-4 border-nexus-accent pl-4 md:pl-8">"{aiInsight.description}"</p>
                          </div>
                       ) : null}
                    </div>
                 </div>

                 {/* BattleStation Quick Preview */}
                 {displayStats?.setup && (
                   <div onClick={() => setActiveTab('setup')} className="bg-nexus-900 border border-nexus-800 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-2xl cursor-pointer hover:border-nexus-secondary transition-all group relative overflow-hidden">
                      <Monitor className="absolute -top-4 -right-4 opacity-5 group-hover:scale-110 transition-transform" size={150} />
                      <h3 className="text-[10px] md:text-[12px] font-black text-white uppercase tracking-[0.4em] mb-8 group-hover:text-nexus-secondary transition-colors">
                        <Cpu size={18} className="inline mr-2" /> Setup Preview
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Graphics Engine</p>
                          <p className="text-sm font-bold text-white">{displayStats.setup.gpu}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Logic Core</p>
                          <p className="text-sm font-bold text-white">{displayStats.setup.cpu}</p>
                        </div>
                      </div>
                   </div>
                 )}
              </div>

              <div className="lg:col-span-8 space-y-8 md:space-y-12">
                 
                 {/* SINERGIA GAMER - POSICIONADA ACIMA DO TOP 5 */}
                 {synergyData && (
                   <div className="bg-nexus-900 border border-nexus-accent/30 rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 relative overflow-hidden group shadow-[0_0_50px_rgba(139,92,246,0.1)] animate-fade-in">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                         <Target size={160} className="text-nexus-accent" />
                      </div>
                      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-10">
                         <div className="md:col-span-4 space-y-6 text-center md:text-left flex flex-col justify-center border-r border-white/5 pr-4">
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-nexus-accent uppercase tracking-[0.3em]">Protocolo de Sincronia</p>
                               <h3 className="text-2xl md:text-4xl font-display font-bold text-white flex items-center justify-center md:justify-start gap-3">
                                  <Zap size={24} className="text-nexus-accent animate-pulse" /> Sinergia
                               </h3>
                            </div>
                            
                            <div className="relative w-40 h-40 mx-auto md:mx-0">
                               <div className="absolute inset-0 rounded-full border-8 border-nexus-accent/10"></div>
                               <div 
                                 className="absolute inset-0 rounded-full border-8 border-nexus-accent transition-all duration-1000 shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                                 style={{ clipPath: `inset(0 0 0 0 round 50%)`, maskImage: `conic-gradient(black ${synergyData.percentage}%, transparent 0)` }}
                               ></div>
                               <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-4xl font-display font-black text-white">{synergyData.percentage}%</span>
                               </div>
                            </div>
                            
                            <p className="text-xs text-gray-500 italic leading-relaxed">Vocês compartilham uma linhagem de jogo similar. Sintonize para uma sessão co-op.</p>
                         </div>

                         <div className="md:col-span-8 space-y-6">
                            <div className="flex items-center justify-between">
                               <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Matriz de Intersecção por Gênero</p>
                               <div className="flex gap-4">
                                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-nexus-accent"></div><span className="text-[8px] text-gray-400 font-bold uppercase">Você</span></div>
                                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-nexus-secondary"></div><span className="text-[8px] text-gray-400 font-bold uppercase">Alvo</span></div>
                               </div>
                            </div>
                            
                            <div className="h-56 w-full">
                               <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart data={synergyData.radarChartData}>
                                     <PolarGrid stroke="#23232f" />
                                     <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }} />
                                     <Radar name="Você" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} strokeWidth={3} />
                                     <Radar name="Alvo" dataKey="B" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} strokeWidth={2} />
                                  </RadarChart>
                               </ResponsiveContainer>
                            </div>

                            {synergyData.sharedGames.length > 0 && (
                               <div className="pt-4 border-t border-white/5 flex items-center gap-6 overflow-x-auto no-scrollbar">
                                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest shrink-0">Jogos em Comum:</p>
                                  <div className="flex gap-3">
                                     {synergyData.sharedGames.slice(0, 5).map(g => (
                                        <img key={g.id} src={g.coverUrl} className="w-10 h-14 rounded-lg border border-white/10 hover:border-nexus-accent transition-all cursor-help" title={g.title} />
                                     ))}
                                     {synergyData.sharedGames.length > 5 && (
                                        <div className="w-10 h-14 bg-nexus-800 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-400 border border-nexus-700">+{synergyData.sharedGames.length - 5}</div>
                                     )}
                                  </div>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                 )}

                 {/* TOP 5 IMERSÃO */}
                 <div className="bg-nexus-900 border border-nexus-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8 px-2">
                       <h3 className="text-xl md:text-3xl font-display font-bold text-white flex items-center gap-3 md:gap-5">
                          <Trophy className="text-yellow-500" size={20} md:size={28} /> Top 5 Imersão
                       </h3>
                    </div>
                    <div className="space-y-4 md:space-y-6 relative z-10">
                       {topGames.map((game, idx) => {
                          const maxHours = topGames[0].hoursPlayed || 1;
                          const ratio = (game.hoursPlayed / maxHours) * 100;
                          return (
                             <div key={game.id} onClick={() => setSelectedGame(game)} className="flex items-center gap-4 md:gap-6 p-3 md:p-4 rounded-2xl md:rounded-3xl bg-black/20 border border-white/5 hover:border-nexus-accent hover:bg-black/40 transition-all cursor-pointer group/item">
                                <div className="relative shrink-0">
                                   <img src={game.coverUrl} className="w-10 h-14 md:w-14 md:h-20 rounded-lg md:rounded-xl object-cover shadow-2xl border border-white/10" alt="Capa" />
                                   <div className="absolute -top-2 -left-2 w-6 h-6 md:w-7 md:h-7 bg-nexus-accent rounded-lg flex items-center justify-center font-display font-black text-[10px] md:text-xs shadow-xl text-white">{idx + 1}</div>
                                </div>
                                <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
                                   <div className="flex justify-between items-center">
                                      <h4 className="font-bold text-white text-sm md:text-lg truncate group-hover/item:text-nexus-accent transition-colors">{game.title}</h4>
                                      <div className="flex items-center gap-2"><span className="font-mono text-nexus-secondary font-bold text-[10px] md:text-sm">{game.hoursPlayed}h</span></div>
                                   </div>
                                   <div className="h-1 md:h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5"><div className="h-full bg-gradient-to-r from-nexus-accent to-nexus-secondary rounded-full transition-all duration-1000" style={{ width: `${ratio}%` }}></div></div>
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 </div>
              </div>
           </div>
         )}

         {activeTab === 'setup' && displayStats?.setup && (
            <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-24">
               <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 opacity-5">
                     <Monitor size={300} />
                  </div>
                  
                  <div className="relative z-10 space-y-12">
                     <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                        <div className="p-4 bg-nexus-secondary/20 rounded-2xl text-nexus-secondary shadow-lg"><Cpu size={32} /></div>
                        <div>
                           <h3 className="text-3xl font-display font-bold text-white uppercase tracking-tight">PC BattleStation</h3>
                           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Configuração Técnica Verificada</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <RigSpec icon={Cpu} label="Processador" value={displayStats.setup.cpu} />
                        <RigSpec icon={Activity} label="Placa de Vídeo" value={displayStats.setup.gpu} />
                        <RigSpec icon={Database} label="Memória RAM" value={displayStats.setup.ram} />
                        <RigSpec icon={HardDrive} label="Armazenamento" value={displayStats.setup.storage} />
                        <RigSpec icon={Monitor} label="Display Principal" value={displayStats.setup.monitor} />
                        <RigSpec icon={MousePointer2} label="Mouse" value={displayStats.setup.mouse} />
                        <RigSpec icon={Keyboard} label="Teclado" value={displayStats.setup.keyboard} />
                        <RigSpec icon={Headphones} label="Áudio" value={displayStats.setup.headset} />
                     </div>

                     {displayStats.setup.description && (
                        <div className="p-8 bg-nexus-800/40 rounded-[2rem] border border-nexus-700 italic text-gray-400 leading-relaxed shadow-inner">
                           "{displayStats.setup.description}"
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'collection' && (
            <div className="max-w-6xl mx-auto animate-fade-in pb-24">
               <div className="flex items-center justify-between mb-12">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-4">
                        <Box className="text-nexus-accent" /> Acervo do Jogador
                     </h3>
                     <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Itens físicos e relíquias imortalizadas</p>
                  </div>
                  <div className="bg-nexus-900 px-6 py-3 rounded-2xl border border-nexus-800">
                     <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Valor Estimado</p>
                     <p className="text-2xl font-display font-black text-nexus-accent">${collectionValue}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {userItems.map(item => (
                     <div key={item.id} className="bg-nexus-900 border border-nexus-800 rounded-[2.5rem] overflow-hidden group hover:border-nexus-accent transition-all shadow-xl">
                        <div className="h-48 relative overflow-hidden bg-black">
                           <img src={item.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                           <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5 text-[9px] text-white font-bold uppercase tracking-widest">
                              {item.type}
                           </div>
                        </div>
                        <div className="p-6 space-y-4">
                           <h4 className="font-bold text-white leading-tight truncate">{item.name}</h4>
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] text-gray-500 font-black uppercase">{item.condition}</span>
                              <span className="text-lg font-display font-black text-nexus-accent">${item.value}</span>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {activeTab === 'testimonials' && (
            <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-24">
               <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <Award size={120} />
                  </div>
                  <div className="relative z-10 space-y-8">
                     <h3 className="text-3xl font-display font-bold text-white">Mural de Honra</h3>
                     {!isOwnProfile && (
                        <div className="space-y-4 bg-nexus-800/50 p-6 rounded-3xl border border-nexus-700">
                           <textarea 
                             value={newTestimonial}
                             onChange={(e) => setNewTestimonial(e.target.value)}
                             placeholder="Deixe um reconhecimento para este legado..."
                             className="w-full bg-nexus-900 border border-nexus-700 rounded-2xl p-4 text-white focus:border-nexus-accent outline-none h-24 resize-none text-sm"
                           />
                           <div className="flex items-center justify-between">
                              <div className="flex bg-nexus-900 p-1 rounded-xl border border-nexus-700">
                                 {(['pro', 'mvp', 'legend'] as const).map(v => (
                                    <button 
                                      key={v}
                                      onClick={() => setSelectedVibe(v)}
                                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${selectedVibe === v ? 'bg-nexus-accent text-white' : 'text-gray-500'}`}
                                    >
                                       {v}
                                    </button>
                                 ))}
                              </div>
                              <button onClick={handlePostTestimonial} disabled={isSubmitting || !newTestimonial.trim()} className="px-8 py-3 bg-nexus-accent text-white font-bold rounded-xl flex items-center gap-2">
                                 {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Publicar
                              </button>
                           </div>
                        </div>
                     )}

                     <div className="space-y-6">
                        {testimonials.map(t => (
                           <div key={t.id} className="bg-nexus-800 border border-nexus-700 p-6 rounded-[2rem] flex gap-6">
                              <img src={t.fromAvatar} className="w-12 h-12 rounded-2xl shrink-0" />
                              <div className="flex-1 space-y-2">
                                 <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-white">@{t.fromName}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${
                                       t.vibe === 'legend' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                       t.vibe === 'mvp' ? 'bg-nexus-secondary/10 border-nexus-secondary/20 text-nexus-secondary' :
                                       'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent'
                                    }`}>{t.vibe}</span>
                                 </div>
                                 <p className="text-gray-300 text-sm leading-relaxed italic">"{t.content}"</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

const StatItem = ({ label, value, highlight, onClick }: { label: string, value: string | number, highlight?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`bg-nexus-900/80 px-4 md:px-8 py-3 md:py-5 rounded-[1.2rem] md:rounded-[2rem] border border-nexus-800 shadow-2xl transition-all ${onClick ? 'cursor-pointer hover:border-nexus-accent hover:bg-nexus-800' : ''}`}
  >
     <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 ${highlight ? 'text-nexus-accent' : 'text-gray-500'}`}>{label}</p>
     <p className="text-xl md:text-3xl font-display font-bold leading-none text-white tracking-tighter">{value}</p>
  </div>
);

const TrophyBubble = ({ label, value, color, bg, icon: Icon }: { label: string, value: number, color: string, bg: string, icon: any }) => (
  <div className="flex flex-col items-center gap-1 group">
    <div className={`w-8 h-8 md:w-12 md:h-12 ${bg} rounded-full flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover:scale-110`}>
      <Icon size={14} md:size={20} className={color} />
    </div>
    <p className={`text-sm md:text-xl font-display font-black leading-none text-white mt-1`}>{value}</p>
    <p className={`text-[6px] md:text-[7px] font-black uppercase tracking-[0.2em] ${color} opacity-70`}>{label}</p>
  </div>
);

const RigSpec = ({ icon: Icon, label, value }: { icon: any, label: string, value?: string }) => (
   <div className="flex items-center gap-5 group">
      <div className="p-3 bg-nexus-900 rounded-2xl border border-nexus-800 group-hover:border-nexus-secondary transition-all shadow-lg text-nexus-secondary">
         <Icon size={20} />
      </div>
      <div>
         <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-0.5">{label}</p>
         <p className="text-sm font-bold text-white tracking-tight">{value || "Confidencial"}</p>
      </div>
   </div>
);
