
import React from 'react';
import { Game, Platform } from '../types';
import { PlatformIcon } from './PlatformIcon';
import { Crown, Trophy, Calendar, ChevronRight, Clock } from 'lucide-react';

interface Props {
  game: Game;
  onClick: () => void;
}

export const GameListItem: React.FC<Props> = ({ game, onClick }) => {
  const percent = game.totalAchievements > 0 
    ? Math.round((game.achievementCount / game.totalAchievements) * 100) 
    : 0;

  const getPlatformColors = (platform: Platform) => {
    switch (platform) {
      case Platform.PSN: return 'border-blue-500/50 bg-blue-600/20 text-blue-400 shadow-blue-500/20';
      case Platform.XBOX: return 'border-green-500/50 bg-green-600/20 text-green-400 shadow-green-500/20';
      case Platform.STEAM: return 'border-cyan-400/50 bg-cyan-500/20 text-cyan-300 shadow-cyan-400/20';
      case Platform.SWITCH: return 'border-red-500/50 bg-red-600/20 text-red-400 shadow-red-500/20';
      default: return 'border-nexus-700 bg-nexus-900 text-gray-400';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-nexus-800/40 p-3 md:p-4 rounded-xl md:rounded-[2rem] border border-nexus-800 flex items-center gap-4 md:gap-6 hover:bg-nexus-800/80 hover:border-nexus-accent/50 transition-all cursor-pointer group shadow-xl relative overflow-hidden"
    >
      {/* Indicador de progresso lateral sutil */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${percent === 100 ? 'bg-nexus-accent shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-transparent'}`}></div>

      <div className="w-14 h-20 md:w-20 md:h-28 flex-shrink-0 relative">
        <img 
            src={game.coverUrl} 
            alt={game.title}
            className="w-full h-full object-cover rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-700" 
        />
        
        {/* Badge de Plataforma Destacado */}
        <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl border backdrop-blur-md shadow-2xl z-10 transition-transform group-hover:scale-110 ${getPlatformColors(game.platform)}`}>
           <PlatformIcon platform={game.platform} className="w-4 h-4 md:w-5 md:h-5" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
         <div className="flex justify-between items-start mb-1">
            <h4 className="text-sm md:text-xl font-display font-bold text-white truncate pr-2 group-hover:text-nexus-accent transition-colors tracking-tight">{game.title}</h4>
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest bg-black/20 px-2 py-1 rounded-lg">
               <span className="hidden md:inline">{game.platform}</span>
               <ChevronRight className="text-nexus-800 md:group-hover:text-white transition-all shrink-0" size={14} />
            </div>
         </div>

         <div className="flex items-center gap-4 md:gap-6 text-[10px] md:text-xs text-gray-500 mt-2">
            <span className="flex items-center gap-1.5 font-bold">
               <Trophy size={14} className={percent === 100 ? 'text-yellow-500' : 'text-nexus-secondary'} />
               <span className="text-gray-300">{game.achievementCount}</span>
               <span className="opacity-30">/</span>
               <span className="opacity-50">{game.totalAchievements}</span>
            </span>
            <span className="flex items-center gap-1.5 font-mono">
                <Clock size={14} className="text-nexus-accent/60" /> {game.hoursPlayed}h
            </span>
         </div>
         
         <div className="mt-3 md:mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-nexus-900 rounded-full overflow-hidden border border-nexus-800 p-[1px]">
               <div 
                  className={`h-full rounded-full transition-all duration-1000 ${percent === 100 ? 'bg-gradient-to-r from-nexus-secondary to-nexus-accent shadow-[0_0_10px_rgba(139,92,246,0.3)]' : 'bg-nexus-secondary'}`} 
                  style={{ width: `${percent}%` }}
               ></div>
            </div>
            <span className={`text-[10px] md:text-xs font-black w-8 text-right font-display ${percent === 100 ? 'text-nexus-accent' : 'text-gray-500'}`}>{percent}%</span>
         </div>
      </div>

      <div className="hidden xl:flex flex-col items-end gap-1 px-6 border-l border-nexus-800 min-w-[120px]">
         {percent === 100 ? (
            <div className="text-nexus-accent flex flex-col items-center animate-fade-in">
               <div className="p-2 bg-nexus-accent/10 rounded-full mb-1">
                 <Crown size={22} className="drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
               </div>
               <span className="text-[8px] font-black uppercase tracking-[0.2em]">Soberano</span>
            </div>
         ) : (
            <div className="text-center space-y-0.5">
               <span className="text-2xl font-display font-black text-white leading-none">{(game.totalAchievements - game.achievementCount).toString().padStart(2, '0')}</span>
               <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Pendentes</p>
            </div>
         )}
      </div>
    </div>
  );
};
