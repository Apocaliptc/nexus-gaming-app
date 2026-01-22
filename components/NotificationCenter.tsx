
import React, { useState, useEffect } from 'react';
import { Bell, Trophy, MessageSquare, Swords, UserPlus, Circle, Check, Trash2, Loader2, Award, Zap, Info, ArrowLeft, Gamepad2, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { nexusCloud } from '../services/nexusCloud';
import { Notification } from '../types';

export const NotificationCenter: React.FC<{ onReadUpdate: (count: number) => void }> = ({ onReadUpdate }) => {
  const { userStats } = useAppContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    if (!userStats) return;
    setIsLoading(true);
    try {
      const data = await nexusCloud.getNotifications(userStats.nexusId);
      setNotifications(data);
      onReadUpdate(data.filter(n => !n.read).length);
    } catch (e) {
      console.error("Pulse Alert Error: Falha ao carregar alertas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [userStats]);

  const handleMarkRead = async (id: string) => {
    await nexusCloud.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    onReadUpdate(notifications.filter(n => (n.id === id ? true : !n.read) && n.id !== id).length);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'testimonial': return <Award className="text-nexus-accent" size={24} />;
      case 'challenge': return <Swords className="text-red-500" size={24} />;
      case 'invite': return <UserPlus className="text-nexus-secondary" size={24} />;
      case 'mention': return <Zap className="text-yellow-500" size={24} />;
      default: return <Info className="text-gray-400" size={24} />;
    }
  };

  const getVibeColor = (type: string) => {
    switch (type) {
      case 'testimonial': return 'from-nexus-accent/20 to-transparent border-nexus-accent/30';
      case 'challenge': return 'from-red-500/20 to-transparent border-red-500/30';
      case 'invite': return 'from-nexus-secondary/20 to-transparent border-nexus-secondary/30';
      default: return 'from-gray-800/20 to-transparent border-gray-700';
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto h-full flex flex-col bg-[#050507] animate-fade-in overflow-hidden">
      <header className="flex justify-between items-center border-b border-nexus-800 pb-8 shrink-0">
         <div className="space-y-1">
            <h1 className="text-4xl font-display font-bold text-white flex items-center gap-4">
               <Bell className="text-nexus-accent" /> Nexus Pulse: Alertas
               {notifications.some(n => !n.read) && (
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
               )}
            </h1>
            <p className="text-gray-400 text-lg">Suas interações no Hall da Fama e desafios recebidos.</p>
         </div>
         <button 
           onClick={fetchNotifs} 
           disabled={isLoading}
           className="p-3 bg-nexus-800 rounded-2xl hover:bg-nexus-700 transition-all border border-nexus-700 disabled:opacity-50"
         >
            {isLoading ? <Loader2 className="animate-spin" size={22} /> : <Zap size={22} className="text-nexus-accent" />}
         </button>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-8 pb-32 space-y-6">
         {isLoading && notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-24">
               <div className="relative">
                  <Bell className="text-nexus-accent animate-bounce" size={48} />
                  <div className="absolute inset-0 bg-nexus-accent blur-xl opacity-20"></div>
               </div>
               <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">Sintonizando Alertas do Banco...</p>
            </div>
         ) : notifications.length === 0 ? (
            <div className="text-center py-32 bg-nexus-900/30 border border-nexus-800 border-dashed rounded-[4rem] flex flex-col items-center gap-6">
               <div className="w-24 h-24 bg-nexus-800 rounded-[2rem] flex items-center justify-center text-gray-700">
                  <Bell size={48} />
               </div>
               <div className="space-y-2">
                  <p className="text-gray-500 text-xl font-display font-bold italic">Céus Limpos.</p>
                  <p className="text-gray-600 text-sm">Nenhum alerta pendente no Nexus Soberano.</p>
               </div>
            </div>
         ) : (
            notifications.map((n) => (
               <div 
                 key={n.id} 
                 onClick={() => !n.read && handleMarkRead(n.id)}
                 className={`flex gap-6 p-8 rounded-[2.5rem] border transition-all relative overflow-hidden group cursor-pointer ${
                   n.read 
                    ? 'bg-nexus-800/10 border-nexus-800/50 grayscale-[0.5]' 
                    : `bg-gradient-to-br border-2 shadow-2xl ${getVibeColor(n.type)}`
                 }`}
               >
                  {!n.read && (
                    <div className="absolute top-0 right-0 w-2.5 h-full bg-nexus-accent shadow-[0_0_20px_rgba(139,92,246,0.5)]"></div>
                  )}

                  <div className="relative shrink-0">
                    <img src={n.fromAvatar} className="w-16 h-16 rounded-[1.2rem] border-2 border-nexus-700 group-hover:border-nexus-accent transition-colors" />
                    <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-xl border border-nexus-900 shadow-xl bg-nexus-900`}>
                       {getIcon(n.type)}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <h4 className="font-bold text-white text-xl">@{n.fromName}</h4>
                           {!n.read && <span className="px-2 py-0.5 bg-nexus-accent text-white text-[9px] font-bold uppercase rounded-full">Novo</span>}
                        </div>
                        <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">{new Date(n.timestamp).toLocaleDateString()} — {new Date(n.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                     </div>
                     <p className={`text-lg leading-relaxed ${n.read ? 'text-gray-500' : 'text-gray-200'}`}>
                        {n.content}
                     </p>
                  </div>

                  {!n.read && (
                    <div className="flex items-center">
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                         className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all"
                       >
                          <Check size={20} />
                       </button>
                    </div>
                  )}
               </div>
            ))
         )}
      </div>
    </div>
  );
};
