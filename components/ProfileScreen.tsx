
import React, { useState, useEffect, useMemo } from 'react';
import { Friend, Game, UserStats, Platform, Testimonial } from '../types';
import { nexusCloud } from '../services/nexusCloud';
import { GameDetailView } from './GameDetailView';
import { NexusIDCard } from './NexusIDCard';
import { ChevronLeft, Trophy, Crown, MessageSquare, Swords, LayoutDashboard, Grid, Clock, Medal, Sparkles, Loader2, Zap, Heart, Info, UserPlus, UserCheck, Target, Swords as SwordsIcon, Shield, Activity, Monitor, Cpu, Box, Send, Star, Award, ShieldAlert } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { useAppContext } from '../context/AppContext';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend 
} from 'recharts';

interface ProfileProps {
  profileData: Friend;
  isOwnProfile?: boolean;
  onClose?: () => void;
  onChallenge?: () => void;
}

export const ProfileScreen: React.FC<ProfileProps> = ({ profileData, isOwnProfile: isOwnProfileProp, onClose, onChallenge }) => {
  const { userStats: currentUserStats, friends, addFriend, removeFriend } = useAppContext();
  const [profileTab, setProfileTab] = useState<'overview' | 'games' | 'synergy' | 'testimonials'>('overview');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [fullUserStats, setFullUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [newTestimonial, setNewTestimonial] = useState('');
  const [selectedVibe, setSelectedVibe] = useState<'pro' | 'mvp' | 'legend'>('pro');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwnProfile = isOwnProfileProp || (currentUserStats?.nexusId === profileData.nexusId);
  const isAlreadyFriend = useMemo(() => friends.some(f => f.nexusId.toLowerCase() === profileData.nexusId.toLowerCase()), [friends, profileData.nexusId]);

  useEffect(() => {
    const loadFullData = async () => {
      setIsLoading(true);
      const [stats, wall] = await Promise.all([
        nexusCloud.getUser(profileData.nexusId),
        nexusCloud.getTestimonials(profileData.nexusId)
      ]);
      setFullUserStats(stats);
      setTestimonials(wall);
      setIsLoading(false);
    };
    loadFullData();
  }, [profileData.nexusId]);

  const synergyData = useMemo(() => {
    if (!currentUserStats || !fullUserStats || isOwnProfile) return null;
    const myGames = new Set(currentUserStats.recentGames.map(g => g.title.toLowerCase()));
    const theirGames = fullUserStats.recentGames;
    const shared = theirGames.filter(g => myGames.has(g.title.toLowerCase()));
    const totalUnique = new Set([
        ...currentUserStats.recentGames.map(g => g.title.toLowerCase()),
        ...theirGames.map(g => g.title.toLowerCase())
    ]).size;
    const percentage = totalUnique > 0 ? Math.round((shared.length / totalUnique) * 100) : 0;

    const mapToCategories = (stats: UserStats) => {
      const dist = stats.genreDistribution || [];
      const cats = { FPS: 0, RPG: 0, Ação: 0, Estratégia: 0, Esportes: 0, Corrida: 0, Terror: 0, Indie: 0 };
      dist.forEach(d => {
        const name = d.name.toLowerCase();
        if (name.includes('fps')) cats['FPS'] += d.value;
        else if (name.includes('rpg')) cats['RPG'] += d.value;
        else if (name.includes('action')) cats['Ação'] += d.value;
        else if (name.includes('strategy')) cats['Estratégia'] += d.value;
        else if (name.includes('sports')) cats['Esportes'] += d.value;
        else if (name.includes('racing')) cats['Corrida'] += d.value;
        else if (name.includes('horror')) cats['Terror'] += d.value;
        else cats['Indie'] += d.value;
      });
      return cats;
    };

    const myCats = mapToCategories(currentUserStats);
    const theirCats = mapToCategories(fullUserStats);

    const radarChartData = [
      { subject: 'FPS', A: myCats['FPS'], B: theirCats['FPS'] },
      { subject: 'RPG', A: myCats['RPG'], B: theirCats['RPG'] },
      { subject: 'Ação', A: myCats['Ação'], B: theirCats['Ação'] },
      { subject: 'Estratégia', A: myCats['Estratégia'], B: theirCats['Estratégia'] },
      { subject: 'Esportes', A: myCats['Esportes'], B: theirCats['Esportes'] },
      { subject: 'Corrida', A: myCats['Corrida'], B: theirCats['Corrida'] },
      { subject: 'Terror', A: myCats['Terror'], B: theirCats['Terror'] },
      { subject: 'Indie', A: myCats['Indie'], B: theirCats['Indie'] },
    ];

    return { percentage, sharedGames: shared, radarChartData, rank: percentage > 30 ? 'Strike Team Ready' : 'Companheiros' };
  }, [currentUserStats, fullUserStats, isOwnProfile]);

  const handleSendTestimonial = async () => {
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
      await nexusCloud.saveTestimonial(profileData.nexusId, testimonial);
      setTestimonials(prev => [testimonial, ...prev]);
      setNewTestimonial('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="h-full flex items-center justify-center bg-[#050507]"><Loader2 className="animate-spin text-nexus-accent" size={48} /></div>;
  if (selectedGame) return <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} isOwner={isOwnProfile} />;

  const displayStats = fullUserStats || (isOwnProfile ? currentUserStats : null);

  return (
    <div className="h-full w-full bg-[#050507] animate-fade-in relative overflow-y-auto custom-scrollbar">
      {onClose && (
        <div className="fixed top-6 left-6 z-50">
            <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-xl rounded-full text-white transition-all border border-white/10 font-bold text-sm shadow-2xl group">
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar
            </button>
        </div>
      )}

      {/* Banner & Identidade */}
      <div className="relative">
          <div className="h-64 md:h-80 w-full relative overflow-hidden bg-gradient-to-br from-nexus-900 via-nexus-800 to-black">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay z-10"></div>
          </div>
          <div className="px-6 md:px-10 -mt-24 relative z-30 flex flex-col md:flex-row items-end gap-8 pb-8">
              <div className="w-48 h-48 rounded-[2.5rem] border-4 border-[#050507] bg-nexus-800 shadow-2xl overflow-hidden">
                  <img src={profileData.avatarUrl} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 pb-2 w-full text-center md:text-left">
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">{profileData.username}</h2>
                  <p className="text-gray-400 font-medium italic">Explorador do Nexus</p>
              </div>
          </div>
      </div>

      <div className="sticky top-0 z-40 bg-[#050507]/90 backdrop-blur-xl border-y border-nexus-800">
          <div className="px-6 md:px-10 flex gap-8">
            <button onClick={() => setProfileTab('overview')} className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${profileTab === 'overview' ? 'border-nexus-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Visão Geral</button>
            <button onClick={() => setProfileTab('games')} className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${profileTab === 'games' ? 'border-nexus-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Biblioteca</button>
            {synergyData && <button onClick={() => setProfileTab('synergy')} className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${profileTab === 'synergy' ? 'border-nexus-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Sinergia</button>}
            <button onClick={() => setProfileTab('testimonials')} className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${profileTab === 'testimonials' ? 'border-nexus-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
               Depoimentos
               <span className="bg-nexus-accent/20 text-nexus-accent text-[10px] px-1.5 py-0.5 rounded-full">{testimonials.length}</span>
            </button>
          </div>
      </div>

      <div className="p-6 md:p-10 space-y-12 pb-24">
          {profileTab === 'overview' && displayStats && (
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-12">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <h3 className="text-2xl font-display font-bold text-white">Estatísticas Vitais</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-nexus-800 p-6 rounded-3xl border border-nexus-700">
                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Imersão</p>
                                <p className="text-3xl font-mono text-white font-bold">{displayStats.totalHours}h</p>
                            </div>
                            <div className="bg-nexus-800 p-6 rounded-3xl border border-nexus-700">
                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Legado</p>
                                <p className="text-3xl font-mono text-white font-bold">{displayStats.totalAchievements}</p>
                            </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                          <Monitor className="text-nexus-secondary" size={24} /> Rig Showcase
                        </h3>
                        <div className="bg-gradient-to-br from-nexus-800 to-nexus-900 p-6 rounded-3xl border border-nexus-700 relative overflow-hidden group">
                           <Cpu className="absolute -top-4 -right-4 text-white/5 group-hover:scale-110 transition-transform" size={100} />
                           <div className="space-y-4 relative z-10">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-nexus-900 rounded-xl border border-nexus-700"><Cpu size={18} className="text-nexus-accent" /></div>
                                 <div>
                                    <p className="text-[8px] text-gray-500 font-bold uppercase">CPU</p>
                                    <p className="text-xs font-bold text-white">{displayStats.rig?.cpu || 'Não revelado'}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-nexus-900 rounded-xl border border-nexus-700"><Activity size={18} className="text-nexus-secondary" /></div>
                                 <div>
                                    <p className="text-[8px] text-gray-500 font-bold uppercase">GPU</p>
                                    <p className="text-xs font-bold text-white">{displayStats.rig?.gpu || 'Não revelado'}</p>
                                 </div>
                              </div>
                              <div className="pt-4 border-t border-nexus-700 flex items-center justify-between">
                                 <span className="text-[10px] font-bold text-gray-600 uppercase">Ecosistema Principal</span>
                                 <PlatformIcon platform={displayStats.rig?.mainPlatform || Platform.STEAM} />
                              </div>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
                <div className="lg:col-span-4">
                   <NexusIDCard stats={displayStats} insight={null} />
                </div>
            </div>
          )}

          {profileTab === 'testimonials' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
               <div className="bg-nexus-900/50 p-8 rounded-[3rem] border border-nexus-700 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Award size={120} />
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                     <h3 className="text-3xl font-display font-bold text-white">Mural de Honra</h3>
                     <p className="text-gray-400">Depoimentos públicos de outros jogadores sobre este legado.</p>

                     {!isOwnProfile && (
                        <div className="space-y-4 bg-nexus-800/50 p-6 rounded-3xl border border-nexus-700 shadow-xl">
                           <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="text-nexus-accent" size={16} />
                              <span className="text-xs font-bold text-white uppercase tracking-widest">Deixar um Depoimento</span>
                           </div>
                           <textarea 
                             value={newTestimonial}
                             onChange={(e) => setNewTestimonial(e.target.value)}
                             placeholder="Conte ao mundo sobre suas jogatinas com este usuário..."
                             className="w-full bg-nexus-900 border border-nexus-700 rounded-2xl p-4 text-white focus:border-nexus-accent outline-none h-24 resize-none text-sm"
                           />
                           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                              <div className="flex bg-nexus-900 p-1 rounded-xl border border-nexus-700">
                                 {(['pro', 'mvp', 'legend'] as const).map(v => (
                                    <button 
                                      key={v}
                                      onClick={() => setSelectedVibe(v)}
                                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${selectedVibe === v ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                    >
                                       {v}
                                    </button>
                                 ))}
                              </div>
                              <button 
                                onClick={handleSendTestimonial}
                                disabled={isSubmitting || !newTestimonial.trim()}
                                className="w-full md:w-auto px-8 py-3 bg-nexus-accent hover:bg-nexus-accent/80 text-white font-bold rounded-xl transition-all shadow-xl shadow-nexus-accent/20 flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                 {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                 Publicar no Mural
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               <div className="space-y-4">
                  {testimonials.length === 0 ? (
                    <div className="text-center py-20 bg-nexus-800/10 border border-nexus-700 border-dashed rounded-[3rem]">
                       <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
                       <p className="text-gray-500 italic">O mural ainda está vazio. Seja o primeiro a eternizar este legado!</p>
                    </div>
                  ) : (
                    testimonials.map((t) => (
                      <div key={t.id} className="bg-nexus-800 border border-nexus-700 p-6 rounded-[2rem] flex gap-6 hover:border-nexus-accent transition-all animate-fade-in group relative overflow-hidden">
                         <div className={`absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10`}>
                            {t.vibe === 'legend' ? <Crown size={80} /> : t.vibe === 'mvp' ? <Award size={80} /> : <Zap size={80} />}
                         </div>
                         
                         <img src={t.fromAvatar} className="w-16 h-16 rounded-2xl border-2 border-nexus-700 shrink-0" />
                         <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-white text-lg">@{t.fromName}</h4>
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${
                                    t.vibe === 'legend' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                    t.vibe === 'mvp' ? 'bg-nexus-secondary/10 border-nexus-secondary/20 text-nexus-secondary' :
                                    'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent'
                                  }`}>
                                     {t.vibe}
                                  </span>
                               </div>
                               <span className="text-[10px] text-gray-600 font-mono">{new Date(t.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed italic">"{t.content}"</p>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          )}

          {profileTab === 'synergy' && synergyData && (
              <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-fade-in">
                  <div className="text-center space-y-6">
                      <div className="inline-flex items-center gap-6 px-10 py-6 bg-nexus-accent/10 border border-nexus-accent/30 rounded-[3rem] shadow-2xl relative group">
                          <Heart className="text-red-500 animate-pulse" size={32} />
                          <div>
                             <h3 className="text-2xl font-display font-bold text-white">DNA Gamer: <span className="text-nexus-accent">{synergyData.rank}</span></h3>
                             <p className="text-[10px] text-nexus-accent/60 font-bold uppercase tracking-[0.2em]">Match em Tempo Real</p>
                          </div>
                          {synergyData.percentage > 25 && (
                             <button className="ml-6 px-6 py-3 bg-nexus-accent text-white font-bold rounded-2xl flex items-center gap-2 shadow-xl shadow-nexus-accent/40 animate-bounce hover:animate-none transition-all">
                                <SwordsIcon size={18} /> ASSEMBLE STRIKE TEAM
                             </button>
                          )}
                      </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      <div className="lg:col-span-7 bg-nexus-800/40 border border-nexus-700 rounded-[3rem] p-8 relative overflow-hidden group">
                          <div className="h-[450px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={synergyData.radarChartData}>
                                      <PolarGrid stroke="#23232f" />
                                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} />
                                      <PolarRadiusAxis angle={45} domain={[0, 100]} tick={false} axisLine={false} />
                                      <Radar name="Você" dataKey="A" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.4} />
                                      <Radar name={profileData.username} dataKey="B" stroke="#06b6d4" strokeWidth={3} fill="#06b6d4" fillOpacity={0.4} />
                                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f0f15', border: '1px solid #23232f', borderRadius: '12px' }} />
                                  </RadarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      <div className="lg:col-span-5 space-y-6">
                         <div className="bg-nexus-accent/10 border border-nexus-accent/30 p-8 rounded-[3rem] relative overflow-hidden group">
                            <Sparkles className="absolute -top-4 -right-4 text-nexus-accent opacity-10" size={100} />
                            <h4 className="text-nexus-accent font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Oracle Synergy Analysis</h4>
                            <p className="text-gray-300 italic text-sm leading-relaxed">
                               "Sua Strike Team é mais eficiente em {synergyData.radarChartData.sort((a,b) => (b.A+b.B) - (a.A+a.B))[0].subject}. Sugiro uma sessão imediata de {synergyData.sharedGames[0]?.title || 'cooperação estratégica'} para maximizar o legado mútuo."
                            </p>
                         </div>
                      </div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};
