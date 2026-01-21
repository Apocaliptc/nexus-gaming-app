
import React, { useState, useEffect } from 'react';
import { ActivityEvent, ActivityType, Platform } from '../types';
import { Heart, MessageCircle, Share2, Trophy, Crown, Gamepad2, UserPlus, Clock, RefreshCcw, Loader2, Globe, TrendingUp, Sparkles, Flame, Plus, Play, Video, Radio, Users, Swords, PlayCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const GlobalFeed: React.FC = () => {
  const { userStats } = useAppContext();
  const [activeTab, setActiveTab] = useState<'posts' | 'lives'>('posts');
  const [filter, setFilter] = useState<'all' | 'friends' | 'global'>('all');
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const generateMockFeed = (): ActivityEvent[] => {
    return [
      {
        id: 'v1',
        type: ActivityType.VIDEO,
        userId: '@apocaliptc',
        username: 'Apocaliptc',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=apoc',
        timestamp: new Date().toISOString(),
        details: {
          gameTitle: 'Black Myth: Wukong',
          gameCover: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/library_600x900.jpg',
          content: 'No damage run contra o boss final do Capítulo 2! A esquiva perfeita é a chave.',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-mechanical-keyboard-typing-in-the-dark-42442-large.mp4' // Mock video
        },
        likes: 1240,
        comments: 56
      },
      {
        id: 'c1',
        type: ActivityType.CHALLENGE,
        userId: '@amigo_imaginário',
        username: 'Amigo Imaginário',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amigo',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        details: {
          gameTitle: 'Elden Ring',
          gameCover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg',
          challengeGoal: 'Platinar Shadow of the Erdtree em menos de 1 semana.',
          content: 'Aceito o desafio do Nexus! Quem mais está nessa corrida?'
        },
        likes: 89,
        comments: 24
      },
      {
        id: 'p1',
        type: ActivityType.PLATINUM,
        userId: '@pro_gamer_99',
        username: 'ProGamer99',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pro',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        details: {
          gameTitle: 'God of War Ragnarök',
          gameCover: 'https://image.api.playstation.com/vulcan/img/rnd/202207/1210/499264420_17878225.png',
          achievementName: 'The Bear and the Wolf'
        },
        likes: 432,
        comments: 12
      }
    ];
  };

  const generateMockLives = (): ActivityEvent[] => {
    return [
      {
        id: 'l1',
        type: ActivityType.STREAM,
        userId: '@streamer_nexus',
        username: 'NexusStream',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=stream',
        timestamp: new Date().toISOString(),
        details: {
          gameTitle: 'Valorant',
          gameCover: 'https://picsum.photos/600/900?random=val',
          viewers: 1240,
          content: 'Rumo ao Radiante! Jogando com inscritos.'
        },
        likes: 0
      },
      {
        id: 'l2',
        type: ActivityType.STREAM,
        userId: '@speedrunner_x',
        username: 'SpeedX',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=speed',
        timestamp: new Date().toISOString(),
        details: {
          gameTitle: 'Hades II',
          gameCover: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145350/library_600x900.jpg',
          viewers: 540,
          content: 'Attempting World Record - Any% Glitchless'
        },
        likes: 0
      }
    ];
  };

  const fetchContent = async () => {
    setIsLoading(true);
    setTimeout(() => {
        setActivities(activeTab === 'posts' ? generateMockFeed() : generateMockLives());
        setIsLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchContent();
  }, [activeTab]);

  return (
    <div className="h-full w-full bg-[#050507] overflow-y-auto custom-scrollbar flex flex-col items-center">
      
      {/* Social Dashboard Header */}
      <div className="w-full max-w-5xl px-6 pt-10 pb-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
           <div className="space-y-1">
              <h1 className="text-5xl font-display font-bold text-white tracking-tighter flex items-center gap-4">
                NEXUS <span className="text-nexus-accent">PULSE</span>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]"></div>
              </h1>
              <p className="text-gray-500 font-medium text-lg italic">A arena global de feitos imortais.</p>
           </div>
           
           {/* Tab Switcher */}
           <div className="flex bg-nexus-900 border border-nexus-800 p-1.5 rounded-[1.5rem] shadow-2xl">
              <button 
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'posts' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                <Video size={16} /> Postagens
              </button>
              <button 
                onClick={() => setActiveTab('lives')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'lives' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                <Radio size={16} className={activeTab === 'lives' ? 'animate-pulse' : ''} /> Ao Vivo
              </button>
           </div>
        </div>

        {/* Action Bar (Only for Posts) */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
             <div className="md:col-span-9 bg-nexus-800 border border-nexus-700 rounded-[2.5rem] p-6 shadow-2xl flex items-center gap-6 group hover:border-nexus-accent/50 transition-all">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats?.nexusId}`} className="w-14 h-14 rounded-2xl border border-nexus-700" />
                <div className="flex-1">
                   <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">Qual o seu próximo feito?</p>
                   <div className="flex gap-4">
                      <button className="flex items-center gap-2 text-white/40 hover:text-nexus-accent transition-colors">
                         <PlayCircle size={20} /> <span className="text-xs font-bold">Postar Clipe</span>
                      </button>
                      <button className="flex items-center gap-2 text-white/40 hover:text-nexus-secondary transition-colors">
                         <Swords size={20} /> <span className="text-xs font-bold">Lançar Desafio</span>
                      </button>
                      <button className="flex items-center gap-2 text-white/40 hover:text-yellow-500 transition-colors">
                         <Trophy size={20} /> <span className="text-xs font-bold">Marcar Conquista</span>
                      </button>
                   </div>
                </div>
                <button className="w-12 h-12 bg-nexus-accent rounded-2xl flex items-center justify-center text-white shadow-xl shadow-nexus-accent/20 hover:scale-110 transition-transform">
                   <Plus size={24} />
                </button>
             </div>

             <div className="md:col-span-3 bg-nexus-900 border border-nexus-800 rounded-[2.5rem] p-6 flex flex-col justify-center text-center">
                <div className="text-nexus-accent font-bold text-2xl font-mono">1.2k</div>
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Ativos Agora</div>
             </div>
          </div>
        )}

        {/* Filter (Global/Friends) */}
        <div className="flex justify-center md:justify-start gap-4">
            {(['all', 'friends', 'global'] as const).map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full border transition-all ${filter === f ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
              >
                {f}
              </button>
            ))}
        </div>

        {/* Content Feed */}
        <div className={`grid gap-10 pb-32 ${activeTab === 'lives' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
           {isLoading ? (
             <div className="col-span-full py-32 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-nexus-accent" size={64} />
                <p className="text-gray-600 font-mono text-xs uppercase animate-pulse tracking-[0.3em]">Sincronizando Pulse...</p>
             </div>
           ) : activities.map(event => (
             activeTab === 'posts' ? (
                <div key={event.id} className="bg-nexus-800 border border-nexus-700 rounded-[3rem] overflow-hidden shadow-2xl group/card transition-all hover:border-nexus-600">
                   {/* Header do Card */}
                   <div className="p-8 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <img src={event.userAvatar} className="w-12 h-12 rounded-2xl border border-nexus-700" />
                         <div>
                            <h4 className="font-display font-bold text-white text-lg flex items-center gap-2">
                               {event.username}
                               {event.type === ActivityType.PLATINUM && <Crown size={18} className="text-yellow-500" />}
                            </h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(event.timestamp).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border ${
                        event.type === ActivityType.VIDEO ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                        event.type === ActivityType.CHALLENGE ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                        'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      }`}>
                         {event.type}
                      </div>
                   </div>

                   {/* Conteúdo Multimídia */}
                   <div className="px-8 pb-4">
                      {event.type === ActivityType.VIDEO ? (
                         <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black border border-nexus-700 shadow-2xl">
                            <video 
                              src={event.details.videoUrl} 
                              className="w-full h-full object-cover opacity-60 group-hover/card:opacity-100 transition-opacity"
                              autoPlay muted loop
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-6 flex items-center gap-4">
                               <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white">
                                  <Play size={20} fill="currentColor" />
                               </div>
                               <div>
                                  <p className="text-white font-bold text-lg">{event.details.gameTitle}</p>
                                  <p className="text-white/60 text-xs">High Quality Highlight</p>
                               </div>
                            </div>
                         </div>
                      ) : event.type === ActivityType.CHALLENGE ? (
                         <div className="bg-gradient-to-br from-orange-500/10 to-nexus-900 p-8 rounded-[2rem] border border-orange-500/20 relative overflow-hidden">
                            <Swords className="absolute -bottom-4 -right-4 text-orange-500 opacity-5" size={120} />
                            <h3 className="text-nexus-accent font-bold uppercase tracking-widest text-xs mb-4">Novo Desafio Nexus</h3>
                            <h2 className="text-2xl font-display font-bold text-white mb-3 italic">"{event.details.challengeGoal}"</h2>
                            <p className="text-gray-400 text-sm leading-relaxed">{event.details.content}</p>
                            <button className="mt-6 bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-bold text-xs transition-all shadow-lg shadow-orange-600/20">ACEITAR DESAFIO</button>
                         </div>
                      ) : (
                         <div className="bg-nexus-900 p-8 rounded-[2rem] border border-nexus-700 flex items-center gap-6">
                            <img src={event.details.gameCover} className="w-24 h-32 rounded-xl object-cover shadow-2xl" />
                            <div>
                               <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mb-1">Legado Eternizado</p>
                               <h3 className="text-2xl font-display font-bold text-white mb-1">{event.details.achievementName}</h3>
                               <p className="text-gray-400 text-sm">{event.details.gameTitle}</p>
                            </div>
                         </div>
                      )}
                      
                      {/* Texto de Apoio (se houver) */}
                      {event.details.content && event.type !== ActivityType.VIDEO && event.type !== ActivityType.CHALLENGE && (
                        <p className="mt-6 text-gray-300 text-lg leading-relaxed">{event.details.content}</p>
                      )}
                   </div>

                   {/* Footer Interativo */}
                   <div className="p-8 pt-4 flex items-center gap-8 border-t border-nexus-700/30">
                      <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                         <Heart size={20} /> <span className="font-mono font-bold text-sm">{event.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-nexus-accent transition-colors">
                         <MessageCircle size={20} /> <span className="font-mono font-bold text-sm">{event.comments}</span>
                      </button>
                      <div className="ml-auto text-gray-600">
                         <Share2 size={18} />
                      </div>
                   </div>
                </div>
             ) : (
                /* Aba de Lives */
                <div key={event.id} className="bg-nexus-800 border border-nexus-700 rounded-[2.5rem] overflow-hidden group/live hover:border-red-500/50 transition-all shadow-2xl">
                   <div className="relative aspect-video bg-black">
                      <img src={`https://picsum.photos/800/450?random=${event.id}`} className="w-full h-full object-cover opacity-60 group-hover/live:opacity-90 transition-opacity" />
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-2 animate-pulse">
                         <Radio size={12} /> AO VIVO
                      </div>
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-2">
                         <Users size={12} /> {event.details.viewers} Assistindo
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/live:opacity-100 transition-all scale-75 group-hover/live:scale-100">
                         <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-red-600/40">
                            <Play size={24} fill="currentColor" />
                         </div>
                      </div>
                   </div>
                   <div className="p-6 flex gap-4">
                      <img src={event.userAvatar} className="w-12 h-12 rounded-2xl border border-nexus-700" />
                      <div className="flex-1 min-w-0">
                         <h4 className="font-bold text-white truncate">{event.details.content}</h4>
                         <p className="text-xs text-gray-500 mt-1">{event.username} jogando <span className="text-nexus-accent">{event.details.gameTitle}</span></p>
                      </div>
                   </div>
                </div>
             )
           ))}
        </div>
      </div>
    </div>
  );
};
