
import React from 'react';
import { Game } from '../types';
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

  return (
    <div 
      onClick={onClick}
      className="bg-nexus-800 p-4 rounded-2xl border border-nexus-700 flex items-center gap-4 md:gap-6 hover:bg-nexus-700/50 hover:border-nexus-accent transition-all cursor-pointer group shadow-lg"
    >
      {/* Cover Art */}
      <div className="w-16 h-20 md:w-20 md:h-28 flex-shrink-0 relative">
        <img 
            src={game.coverUrl} 
            alt={game.title}
            className="w-full h-full object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute -bottom-2 -right-2 bg-nexus-900 border border-nexus-700 p-1.5 rounded-lg shadow-xl">
           <PlatformIcon platform={game.platform} className="w-3 h-3 md:w-4 md:h-4" />
        </div>
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
         <div className="flex justify-between items-start">
            <h4 className="text-xl font-bold text-white truncate pr-4 group-hover:text-nexus-accent transition-colors">{game.title}</h4>
            <ChevronRight className="text-nexus-700 group-hover:text-white group-hover:translate-x-1 transition-all" size={24} />
         </div>

         <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-2">
            <span className="flex items-center gap-1.5 font-bold text-gray-300">
               <Trophy size={14} className={percent === 100 ? 'text-yellow-500' : 'text-nexus-secondary'} />
               {game.achievementCount} <span className="text-gray-600">/</span> {game.totalAchievements}
            </span>
            <span className="flex items-center gap-1.5 text-xs">
                <Clock size={12} /> {game.hoursPlayed}h
            </span>
            {game.lastPlayed && (
                <span className="flex items-center gap-1.5 text-xs hidden sm:flex">
                    <Calendar size={12} /> {new Date(game.lastPlayed).toLocaleDateString()}
                </span>
            )}
         </div>
         
         {/* Progress Bar */}
         <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 h-2 bg-nexus-900 rounded-full overflow-hidden border border-nexus-800">
               <div 
                  className={`h-full rounded-full transition-all duration-1000 ${percent === 100 ? 'bg-nexus-accent shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-nexus-secondary'}`} 
                  style={{ width: `${percent}%` }}
               ></div>
            </div>
            <span className={`text-xs font-bold w-10 text-right ${percent === 100 ? 'text-nexus-accent' : 'text-white'}`}>{percent}%</span>
         </div>
      </div>

      {/* Status Badge (Right Side) */}
      <div className="hidden lg:flex flex-col items-end gap-1 px-6 border-l border-nexus-700 min-w-[120px]">
         {percent === 100 ? (
            <div className="flex flex-col items-center text-nexus-accent animate-fade-in">
               <Crown size={28} className="drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Legado Completo</span>
            </div>
         ) : (
            <div className="text-center">
               <span className="text-2xl font-bold text-white font-mono">{game.totalAchievements - game.achievementCount}</span>
               <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Restantes</p>
            </div>
         )}
      </div>
    </div>
  );
};
