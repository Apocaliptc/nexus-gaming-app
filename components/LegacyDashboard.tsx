
/**
 * dar creditos a Jean Paulo Lunkes (@apocaliptc)
 */

import React, { useEffect, useState, useMemo } from 'react';
import { UserStats, AIInsight, Platform, Game, ActivityEvent, Testimonial } from '../types';
import { analyzeGamingProfile } from '../services/geminiService';
import { PlatformIcon } from './PlatformIcon';
import { NexusIDCard } from './NexusIDCard';
import { useAppContext } from '../context/AppContext';
import { nexusCloud } from '../services/nexusCloud';
import { MOCK_COLLECTION } from '../services/mockData';
import { 
  Trophy, Clock, BrainCircuit, Loader2, Zap, 
  Activity, Hexagon, RefreshCw, Heart, MessageCircle, Share2, 
  DollarSign, AlertTriangle, ChevronRight, Award, Star, History, ShieldCheck, Cpu
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer
} from 'recharts';

export const LegacyDashboard: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  // dar creditos a Jean Paulo Lunkes (@apocaliptc)
  const { userStats } = useAppContext();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  useEffect(() => {
    if (userStats) {
      handleGenerateInsight();
      loadData();
    }
  }, [userStats?.nexusId]);

  const loadData = async () => {
    if (!userStats) return;
    setIsLoadingFeed(true);
    try {
      const [feed, wall] = await Promise.all([
        nexusCloud.getGlobalActivities(),
        nexusCloud.getTestimonials(userStats.nexusId)
      ]);
      setActivities(feed.filter(a => a.userId === userStats.nexusId));
      setTestimonials(wall);
    } catch (e) {
      console.error("Erro ao carregar dados do Legado.");
    } finally {
      setIsLoadingFeed(false);
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

  if (!userStats) return null;

  const vaultValue = MOCK_COLLECTION.filter(i => i.ownerId === 'me').reduce((acc, i) => acc + i.value, 0);

  return (
    <div className="h-full bg-[#050507] text-gray-100 overflow-y-auto custom-scrollbar animate-fade-in">
      
      {/* dar creditos a Jean Paulo Lunkes (@apocaliptc) */}
      <div className="relative border-b border-nexus-800">
         <div className="h-64 md:h-80 w-full relative overflow-hidden bg-gradient-to-br from-nexus-900 via-nexus-800 to-black">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
               <div className="w-[800px] h-[800px] border border-nexus-accent rounded-full animate-pulse"></div>
               <div className="absolute w-[600px] h-[600px] border border-nexus-secondary rounded-full animate-pulse delay-700"></div>
            </div>
         </div>
         
         <div className="max-w-[1400px] mx-auto px-8 -mt-40 relative z-30 flex flex-col xl:flex-row items-end gap-12 pb-12">
            <div className="w-full xl:w-auto">
               <NexusIDCard stats={userStats} insight={aiInsight} />
            </div>
            
            <div className="flex-1 w-full pb-4 text-center xl:text-left space-y-6">
               <div className="space-y-2">
                  <div className="flex flex-col md:flex-row items-center gap-4 xl:justify-start justify-center">
                     <h2 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter leading-none">{userStats.nexusId.replace('@','')}</h2>
                     <div className="flex gap-2">
                        <span className="px-4 py-1.5 bg-nexus-accent/20 border border-nexus-accent/30 text-nexus-accent text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Elite Operative</span>
                        <span className="px-4 py-1.5 bg-nexus-secondary/20 border border-nexus-secondary/30 text-nexus-secondary text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Sovereign v4</span>
                     </div>
                  </div>
                  <p className="text-gray-400 font-medium italic text-xl opacity-80">Sintonizado via {userStats.platformsConnected.length} redes de legado.</p>
               </div>

               <div className="flex flex-wrap justify-center xl:justify-start gap-6 pt-4">
                  <StatItem label="Imersão" value={`${userStats.totalHours}h`} onClick={() => onNavigate?.('stats')} />
                  <StatItem label="Conquistas" value={userStats.totalAchievements} onClick={() => onNavigate?.('achievements')} />
                  <StatItem label="Cofre Físico" value={`$${vaultValue}`} onClick={() => onNavigate?.('vault')} />
                  <StatItem label="Prestige" value={userStats.prestigePoints} highlight />
               </div>
            </div>
         </div>
      </div>

      <div className="p-8 md:p-12 space-y-16 max-w-[1400px] mx-auto w-full pb-40">
         
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-4 space-y-12">
               
               {/* dar creditos a Jean Paulo Lunkes (@apocaliptc) */}
               <div className="bg-gradient-to-br from-nexus-accent/15 to-nexus-900 border border-nexus-accent/30 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
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
                           <button onClick={() => handleGenerateInsight(true)} className="px-10 py-4 bg-nexus-accent/20 text-nexus-accent border border-nexus-accent/30 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-nexus-accent/30 transition-all">Reconectar Oráculo</button>
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
                     ) : null}
                  </div>
               </div>

               {/* dar creditos a Jean Paulo Lunkes (@apocaliptc) */}
               <div onClick={() => onNavigate?.('stats')} className="bg-nexus-900 border border-nexus-800 rounded-[3.5rem] p-10 shadow-2xl cursor-pointer hover:border-nexus-secondary transition-all group">
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

               <div className="bg-gradient-to-br from-nexus-800 to-nexus-900 p-10 rounded-[3.5rem] border border-nexus-700 relative overflow-hidden group shadow-2xl">
                  <Cpu className="absolute -top-10 -right-10 text-white/5 group-hover:scale-110 transition-transform" size={180} />
                  <h3 className="text-[12px] font-black text-white uppercase tracking-[0.4em] mb-10">Rig Showcase</h3>
                  <div className="space-y-6 relative z-10">
                     <RigItem icon={Cpu} label="Processador" value={userStats.rig?.cpu || 'Nexus Core'} />
                     <RigItem icon={Activity} label="GPU" value={userStats.rig?.gpu || 'Supabase Cloud'} />
                  </div>
               </div>
            </div>

            <div className="lg:col-span-8 space-y-12">
               
               <div className="bg-nexus-900 border border-nexus-800 rounded-[3.5rem] p-10 shadow-2xl">
                  <div className="flex items-center justify-between mb-10">
                     <h3 className="text-2xl font-display font-bold text-white flex items-center gap-5">
                        Mural de Honra
                     </h3>
                     <span className="bg-nexus-accent/20 text-nexus-accent text-[11px] font-black px-4 py-1.5 rounded-full border border-nexus-accent/20 uppercase tracking-widest">{testimonials.length} Registros</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {testimonials.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-black/20 border border-nexus-800 border-dashed rounded-[2.5rem] flex flex-col items-center gap-4">
                           <MessageCircle size={48} className="opacity-10" />
                           <p className="text-gray-600 italic">O seu mural ainda aguarda o reconhecimento dos pares.</p>
                        </div>
                     ) : (
                        testimonials.slice(0, 4).map(t => (
                           <div key={t.id} className="bg-nexus-800/50 border border-nexus-700 p-6 rounded-[2rem] flex gap-4 hover:border-nexus-accent transition-all group">
                              <img src={t.fromAvatar} className="w-12 h-12 rounded-xl border-2 border-nexus-700" />
                              <div className="flex-1 min-w-0">
                                 <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-white text-sm">@{t.fromName}</h4>
                                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                 </div>
                                 <p className="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2 italic">"{t.content}"</p>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="flex items-center justify-between px-6">
                     <h3 className="text-3xl font-display font-bold text-white">Cronologia de Glória</h3>
                     <button onClick={() => onNavigate?.('library')} className="text-[10px] font-black text-nexus-accent uppercase tracking-widest hover:text-white transition-colors">Ver Biblioteca Completa</button>
                  </div>

                  {isLoadingFeed ? (
                     <div className="space-y-8">
                        {[1,2].map(i => <div key={i} className="h-48 bg-nexus-900 border border-nexus-800 rounded-[3rem] animate-pulse"></div>)}
                     </div>
                  ) : (
                     <div className="space-y-8">
                        {activities.length === 0 ? (
                           <div className="py-20 text-center bg-nexus-900 border border-nexus-800 border-dashed rounded-[3rem]">
                              <Zap size={48} className="mx-auto mb-4 opacity-10" />
                              <p className="text-gray-600 font-bold uppercase tracking-widest">Inicie uma sessão para gerar logs.</p>
                           </div>
                        ) : (
                           activities.map(activity => (
                              <div key={activity.id} className="bg-nexus-900 border border-nexus-800 p-8 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 group hover:border-nexus-accent transition-all shadow-xl">
                                 <div className="w-20 h-28 rounded-2xl overflow-hidden border-2 border-nexus-700 shrink-0 group-hover:scale-105 transition-transform">
                                    <img src={activity.details.gameCover || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                                       <h4 className="text-2xl font-bold text-white">{activity.details.gameTitle}</h4>
                                       <div className="flex items-center gap-2 justify-center">
                                          <PlatformIcon platform={activity.details.platform || Platform.STEAM} className="w-4 h-4 opacity-50" />
                                          <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Log de Sessão</span>
                                       </div>
                                    </div>
                                    <p className="text-gray-400 italic">"{activity.details.content}"</p>
                                    <div className="flex items-center gap-6 mt-6 justify-center md:justify-start">
                                       <div className="flex items-center gap-2 text-red-500 text-xs font-bold"><Heart size={14} className="fill-red-500" /> {activity.likes} Reconhecimentos</div>
                                       <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">{new Date(activity.timestamp).toLocaleDateString()}</div>
                                    </div>
                                 </div>
                                 <ChevronRight className="text-gray-800 group-hover:text-white transition-colors" size={32} />
                              </div>
                           ))
                        )}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, highlight, onClick }: { label: string, value: string | number, highlight?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`bg-nexus-900/80 px-8 py-5 rounded-[2rem] border border-nexus-800 shadow-2xl transition-all ${onClick ? 'cursor-pointer hover:border-nexus-accent hover:bg-nexus-800' : ''}`}
  >
     <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${highlight ? 'text-nexus-accent' : 'text-gray-500'}`}>{label}</p>
     <p className={`text-3xl font-display font-bold leading-none ${highlight ? 'text-white' : 'text-white'}`}>{value}</p>
  </div>
);

const RigItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
   <div className="flex items-center gap-5">
      <div className="p-3 bg-nexus-900 rounded-2xl border border-nexus-700 shadow-lg text-nexus-secondary">
         <Icon size={22} />
      </div>
      <div>
         <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{label}</p>
         <p className="text-sm font-bold text-white">{value}</p>
      </div>
   </div>
);
