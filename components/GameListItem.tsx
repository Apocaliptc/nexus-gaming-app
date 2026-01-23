
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
      className="bg-nexus-800/40 p-3 md:p-4 rounded-2xl border border-nexus-800 flex items-center gap-4 hover:bg-nexus-800/80 hover:border-nexus-accent/50 transition-all cursor-pointer group shadow-lg"
    >
      <div className="w-12 h-16 md:w-16 md:h-22 flex-shrink-0 relative">
        <img 
            src={game.coverUrl} 
            alt={game.title}
            className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute -bottom-1.5 -right-1.5 bg-nexus-900 border border-nexus-700 p-1 rounded shadow-xl">
           <PlatformIcon platform={game.platform} className="w-2.5 h-2.5 md:w-3 md:h-3" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
         <div className="flex justify-between items-start">
            <h4 className="text-sm md:text-base font-bold text-white truncate pr-2 group-hover:text-nexus-accent transition-colors">{game.title}</h4>
            <ChevronRight className="text-nexus-800 group-hover:text-white transition-all shrink-0" size={16} />
         </div>

         <div className="flex items-center gap-4 text-[10px] text-gray-500 mt-1">
            <span className="flex items-center gap-1 font-bold text-gray-400">
               <Trophy size={10} className={percent === 100 ? 'text-yellow-500' : 'text-nexus-secondary'} />
               {game.achievementCount} <span className="text-gray-600">/</span> {game.totalAchievements}
            </span>
            <span className="flex items-center gap-1">
                <Clock size={10} /> {game.hoursPlayed}h
            </span>
         </div>
         
         <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1 bg-nexus-900 rounded-full overflow-hidden border border-nexus-800">
               <div 
                  className={`h-full rounded-full transition-all duration-1000 ${percent === 100 ? 'bg-nexus-accent' : 'bg-nexus-secondary'}`} 
                  style={{ width: `${percent}%` }}
               ></div>
            </div>
            <span className={`text-[9px] font-black w-6 text-right ${percent === 100 ? 'text-nexus-accent' : 'text-gray-400'}`}>{percent}%</span>
         </div>
      </div>

      <div className="hidden lg:flex flex-col items-end gap-0.5 px-4 border-l border-nexus-800 min-w-[100px]">
         {percent === 100 ? (
            <div className="text-nexus-accent flex flex-col items-center">
               <Crown size={18} />
               <span className="text-[8px] font-black uppercase tracking-widest mt-1">Legado</span>
            </div>
         ) : (
            <div className="text-center">
               <span className="text-lg font-mono font-black text-white">{game.totalAchievements - game.achievementCount}</span>
               <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Restam</p>
            </div>
         )}
      </div>
    </div>
  );
};
