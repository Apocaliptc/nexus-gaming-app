
import React, { useState, useEffect } from 'react';
import { ActivityEvent, ActivityType } from '../types';
import { Heart, MessageCircle, Share2, Trophy, Crown, Gamepad2, UserPlus, Clock, RefreshCcw, Loader2, Globe } from 'lucide-react';
import { nexusCloud } from '../services/nexusCloud';

export const GlobalFeed: React.FC = () => {
  const [activeType, setActiveType] = useState<'all' | 'achievements' | 'discussions'>('all');
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeed = async () => {
    setIsLoading(true);
    const feed = await nexusCloud.getGlobalFeed();
    setActivities(feed);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFeed();
    // Simulate real-time by polling every 30 seconds
    const interval = setInterval(fetchFeed, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredActivities = activities.filter(act => {
    if (activeType === 'all') return true;
    if (activeType === 'achievements') return act.type === ActivityType.ACHIEVEMENT || act.type === ActivityType.PLATINUM;
    if (activeType === 'discussions') return act.type === ActivityType.POST;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6 animate-fade-in">
      {/* Feed Filter */}
      <div className="flex items-center gap-4 sticky top-4 z-30 justify-center">
        <div className="flex bg-nexus-900/80 p-1 rounded-2xl border border-nexus-700 shadow-2xl backdrop-blur-xl">
          {(['all', 'achievements', 'discussions'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveType(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${activeType === tab ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              {tab === 'all' ? 'Feed Global' : tab === 'achievements' ? 'Conquistas' : 'Discussões'}
            </button>
          ))}
        </div>
        <button onClick={fetchFeed} className="p-3 bg-nexus-900 border border-nexus-700 rounded-2xl text-gray-400 hover:text-white transition-all shadow-xl">
           <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Post Creator (Simplified) */}
      <div className="bg-nexus-800 border border-nexus-700 rounded-3xl p-6 shadow-xl">
        <div className="flex gap-4">
          <img src="https://i.pravatar.cc/150?img=12" className="w-12 h-12 rounded-2xl border border-nexus-600" />
          <textarea 
            placeholder="O que você está jogando hoje?"
            className="flex-1 bg-transparent border-none outline-none text-white resize-none pt-2 h-12 focus:h-24 transition-all"
          />
        </div>
        <div className="mt-4 flex justify-between border-t border-nexus-700 pt-4">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 text-gray-400 hover:text-nexus-secondary text-xs font-bold transition-colors">
              <Gamepad2 size={16} /> Marcar Jogo
            </button>
          </div>
          <button className="bg-nexus-accent hover:bg-nexus-accent/80 text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-nexus-accent/20">
            Postar na Nuvem
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-6 pb-20">
        {isLoading && activities.length === 0 ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin text-nexus-accent mx-auto" size={48} /></div>
        ) : filteredActivities.length > 0 ? (
          filteredActivities.map(event => (
            <div key={event.id} className="bg-nexus-800 border border-nexus-700 rounded-3xl overflow-hidden shadow-xl animate-fade-in group hover:border-nexus-600 transition-all">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={event.userAvatar} className="w-10 h-10 rounded-xl" />
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-2">
                      {event.username}
                      {event.type === ActivityType.PLATINUM && <Crown size={14} className="text-yellow-500" />}
                    </h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1">
                      <Clock size={10} /> {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                 {event.details.gameTitle ? (
                   <div className="relative rounded-2xl overflow-hidden aspect-video bg-nexus-900 border border-nexus-700 group/card">
                     {event.details.gameCover && <img src={event.details.gameCover} className="w-full h-full object-cover opacity-40 group-hover/card:scale-105 transition-transform duration-700" />}
                     <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                          <div className="flex items-center gap-3">
                             <Trophy className="text-yellow-500" size={32} />
                             <div>
                                <h3 className="text-xl font-display font-bold text-white">Platinum Legacy Unlocked</h3>
                                <p className="text-gray-300 text-sm">{event.details.gameTitle}</p>
                             </div>
                          </div>
                        </div>
                     </div>
                   </div>
                 ) : (
                   <p className="text-gray-200 leading-relaxed bg-nexus-900/50 p-6 rounded-2xl border border-nexus-700/50 font-medium">
                      {event.details.content}
                   </p>
                 )}
              </div>

              <div className="px-6 py-4 bg-nexus-900/50 border-t border-nexus-700/50 flex items-center gap-6">
                 <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Heart size={18} /> <span className="text-sm font-bold">{event.likes}</span>
                 </button>
                 <button className="flex items-center gap-2 text-gray-400 hover:text-nexus-secondary transition-colors">
                    <MessageCircle size={18} /> <span className="text-sm font-bold">{event.comments || 0}</span>
                 </button>
                 <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors ml-auto">
                    <Share2 size={18} />
                 </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-gray-500 border border-nexus-800 border-dashed rounded-3xl">
             <Globe size={48} className="mx-auto mb-4 opacity-10" />
             <p>O Feed Global está silencioso. Seja o primeiro a postar!</p>
          </div>
        )}
      </div>
    </div>
  );
};
