
import React, { useState, useEffect } from 'react';
import { ActivityEvent, ActivityType, Platform } from '../types';
import { 
  Heart, MessageCircle, Share2, Trophy, Crown, Gamepad2, UserPlus, Clock, 
  RefreshCcw, Loader2, Globe, TrendingUp, Sparkles, Flame, Plus, Play, 
  Video, Radio, Users, Swords, PlayCircle, Box, Gavel, Monitor, Zap 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { nexusCloud } from '../services/nexusCloud';

export const GlobalFeed: React.FC = () => {
  const { userStats } = useAppContext();
  const [activeTab, setActiveTab] = useState<'posts' | 'lives'>('posts');
  const [filter, setFilter] = useState<'all' | 'friends' | 'global'>('all');
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
        if (activeTab === 'posts') {
            const data = await nexusCloud.getGlobalActivities();
            setActivities(data);
        } else {
            setActivities([]); 
        }
    } catch (e) {
        console.error("Pulse Error:", e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [activeTab]);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.PLATINUM: return <Crown className="text-yellow-500" />;
      case ActivityType.CHALLENGE: return <Swords className="text-red-500" />;
      case ActivityType.AUCTION_BID: return <Gavel className="text-nexus-accent" />;
      case ActivityType.AUCTION_WON: return <Trophy className="text-nexus-secondary" />;
      case ActivityType.COLLECTION_ADD: return <Box className="text-nexus-success" />;
      case ActivityType.STREAM: return <Radio className="text-red-600 animate-pulse" />;
      case ActivityType.POST: return <Monitor className="text-nexus-accent" />;
      default: return <Zap className="text-gray-400" />;
    }
  };

  return (
    <div className="w-full bg-[#050507] flex flex-col items-center min-h-full">
      <div className="w-full max-w-5xl px-6 pt-10 pb-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
           <div className="space-y-1">
              <h1 className="text-5xl font-display font-bold text-white tracking-tighter flex items-center gap-4">
                NEXUS <span className="text-nexus-accent">PULSE</span>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]"></div>
              </h1>
              <p className="text-gray-500 font-medium text-lg italic">A arena global de feitos imortais.</p>
           </div>
           
           <div className="flex bg-nexus-900 border border-nexus-800 p-1.5 rounded-[1.5rem] shadow-2xl">
              <button 
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'posts' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                <Video size={16} /> Pulse
              </button>
              <button 
                onClick={() => setActiveTab('lives')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'lives' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                <Radio size={16} className={activeTab === 'lives' ? 'animate-pulse' : ''} /> Ao Vivo
              </button>
           </div>
        </div>

        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
             <div className="md:col-span-9 bg-nexus-800 border border-nexus-700 rounded-[2.5rem] p-6 shadow-2xl flex items-center gap-6 group hover:border-nexus-accent/50 transition-all">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats?.nexusId}`} className="w-14 h-14 rounded-2xl border border-nexus-700" />
                <div className="flex-1 text-left">
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
                <div className="text-nexus-accent font-bold text-2xl font-mono">Real-Time</div>
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Sincronizado Cloud</div>
             </div>
          </div>
        )}

        <div className="flex justify-center md:justify-start gap-4">
            {(['all', 'friends', 'global'] as const).map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full border transition-all ${filter === f ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-gray-500 hover:text-gray-400'}`}
              >
                {f}
              </button>
            ))}
        </div>

        <div className={`grid gap-10 pb-32 ${activeTab === 'lives' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
           {isLoading ? (
             <div className="col-span-full py-32 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-nexus-accent" size={64} />
                <p className="text-gray-600 font-mono text-xs uppercase animate-pulse tracking-[0.3em]">Sincronizando Pulse...</p>
             </div>
           ) : activities.length > 0 ? (
             activities.map(event => (
                <div key={event.id} className="bg-nexus-800 border border-nexus-700 rounded-[3rem] overflow-hidden shadow-2xl group/card transition-all hover:border-nexus-600">
                   <div className="p-8 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <img src={event.userAvatar} className="w-12 h-12 rounded-2xl border border-nexus-700" />
                         <div className="text-left">
                            <h4 className="font-display font-bold text-white text-lg flex items-center gap-2">
                               {event.username}
                               {getActivityIcon(event.type)}
                            </h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — Sintonizado via {event.details.platform || 'Nexus'}
                            </p>
                         </div>
                      </div>
                      <div className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent">
                         {event.type.replace('_', ' ')}
                      </div>
                   </div>

                   <div className="px-8 pb-4 text-left">
                      {event.details.gameCover && (
                         <div className="bg-nexus-900 p-8 rounded-[2rem] border border-nexus-700 flex items-center gap-6 mb-6">
                            <img src={event.details.gameCover} className="w-24 h-32 rounded-xl object-cover shadow-2xl" />
                            <div className="text-left">
                               <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mb-1">Destaque Cloud</p>
                               <h3 className="text-2xl font-display font-bold text-white mb-1">{event.details.gameTitle}</h3>
                               {event.details.achievementName && <p className="text-sm text-nexus-secondary">Conquista: {event.details.achievementName}</p>}
                            </div>
                         </div>
                      )}
                      
                      {event.details.itemName && (
                         <div className="bg-nexus-accent/5 p-6 rounded-[1.5rem] border border-nexus-accent/20 mb-4">
                            <p className="text-[9px] text-nexus-accent font-black uppercase tracking-widest mb-1">Relíquia do Acervo</p>
                            <h4 className="text-xl font-bold text-white">{event.details.itemName}</h4>
                            {event.details.price && <p className="text-2xl font-display font-black text-white mt-1">${event.details.price}</p>}
                         </div>
                      )}
                      
                      {event.details.content && (
                        <p className="text-gray-300 text-lg leading-relaxed text-left italic">"{event.details.content}"</p>
                      )}
                   </div>

                   <div className="p-8 pt-4 flex items-center gap-8 border-t border-nexus-700/30">
                      <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                         <Heart size={20} /> <span className="font-mono font-bold text-sm">{event.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-nexus-accent transition-colors">
                         <MessageCircle size={20} /> <span className="font-mono font-bold text-sm">{Math.floor(event.likes / 4)}</span>
                      </button>
                      <div className="ml-auto text-gray-600">
                         <Share2 size={18} />
                      </div>
                   </div>
                </div>
             ))
           ) : (
             <div className="col-span-full py-32 text-center text-gray-600">
                <Globe size={48} className="mx-auto mb-4 opacity-10" />
                <p>Nenhuma atividade global registrada no banco ainda.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
