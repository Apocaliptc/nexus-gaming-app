
import React from 'react';
import { Game } from '../types';
import { PlatformIcon } from './PlatformIcon';
import { Crown, Trophy, Calendar, ChevronRight } from 'lucide-react';

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
      className="bg-nexus-800 p-4 rounded-xl border border-nexus-700 flex items-center gap-4 md:gap-6 hover:bg-nexus-700/50 hover:border-nexus-600 transition-all cursor-pointer group"
    >
      {/* Cover Art */}
      <div className="w-16 h-20 md:w-20 md:h-24 flex-shrink-0 relative">
        <img 
            src={game.coverUrl} 
            alt={game.title}
            className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform" 
        />
        <div className="absolute -bottom-2 -right-2 bg-nexus-900 border border-nexus-700 p-1 rounded-md shadow-sm">
           <PlatformIcon platform={game.platform} className="w-3 h-3 md:w-4 md:h-4" />
        </div>
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
         <div className="flex justify-between items-start">
            <h4 className="text-lg font-bold text-white truncate pr-4">{game.title}</h4>
            <ChevronRight className="text-nexus-700 group-hover:text-white transition-colors" size={20} />
         </div>

         <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-1">
            <span className="flex items-center gap-1.5 font-medium">
               <Trophy size={14} className={percent === 100 ? 'text-yellow-500' : 'text-gray-500'} />
               {game.achievementCount} <span className="text-gray-600">/</span> {game.totalAchievements}
            </span>
            {game.lastPlayed && (
                <span className="flex items-center gap-1.5 text-xs">
                    <Calendar size={12} /> {new Date(game.lastPlayed).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                </span>
            )}
         </div>
         
         {/* Progress Bar */}
         <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 bg-nexus-900 rounded-full overflow-hidden border border-nexus-800">
               <div 
                  className={`h-full rounded-full transition-all duration-1000 ${percent === 100 ? 'bg-nexus-accent' : 'bg-nexus-secondary'}`} 
                  style={{ width: `${percent}%` }}
               ></div>
            </div>
            <span className="text-xs font-bold text-white w-8 text-right">{percent}%</span>
         </div>
      </div>

      {/* Status Badge (Right Side) */}
      <div className="hidden md:flex flex-col items-end gap-1 px-4 border-l border-nexus-700 min-w-[100px]">
         {percent === 100 ? (
            <div className="flex flex-col items-center text-nexus-accent animate-pulse">
               <Crown size={24} />
               <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Platinado</span>
            </div>
         ) : (
            <div className="text-center">
               <span className="text-xl font-bold text-white font-mono">{game.totalAchievements - game.achievementCount}</span>
               <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Restantes</p>
            </div>
         )}
      </div>
    </div>
  );
};
