
import React from 'react';
import { UserStats, AIInsight } from '../types';
import { Trophy, Crown, Zap, Star, Share2, Download, ShieldCheck, Globe } from 'lucide-react';

interface Props {
  stats: UserStats;
  insight: AIInsight | null;
}

export const NexusIDCard: React.FC<Props> = ({ stats, insight }) => {
  return (
    <div className="w-full max-w-md mx-auto group">
      <div className="relative aspect-[1.586/1] w-full bg-nexus-900 rounded-[2rem] p-8 border-2 border-white/10 overflow-hidden shadow-2xl transition-all hover:border-nexus-accent/50 group-hover:shadow-nexus-accent/20">
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-nexus-accent/10 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-nexus-secondary/10 blur-[80px] rounded-full"></div>
        
        {/* Header */}
        <div className="relative z-10 flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-tr from-nexus-accent to-nexus-secondary rounded-xl flex items-center justify-center shadow-lg">
                <span className="font-display font-bold text-white text-xl">N</span>
             </div>
             <div>
                <h3 className="text-white font-display font-bold text-lg leading-none">Nexus Identity</h3>
                <p className="text-[10px] text-nexus-secondary font-mono tracking-widest uppercase mt-1">Sovereign Gamer ID</p>
             </div>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Verified Legacy</span>
             <ShieldCheck size={16} className="text-nexus-success ml-auto mt-1" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 grid grid-cols-2 gap-6">
           <div className="space-y-4">
              <div>
                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Nexus Identifier</p>
                <p className="text-white font-display font-bold text-xl truncate">{stats.nexusId}</p>
              </div>
              <div>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-1">Core Persona</p>
                <p className="text-nexus-accent font-bold text-xs uppercase italic">{insight?.personaTitle || "Nexus Explorer"}</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">
                 <p className="text-[7px] text-gray-500 font-bold uppercase">Hours</p>
                 <p className="text-sm font-mono font-bold text-white">{stats.totalHours}h</p>
              </div>
              <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">
                 <p className="text-[7px] text-gray-500 font-bold uppercase">Rank</p>
                 <p className="text-sm font-mono font-bold text-yellow-500">#{stats.platinumCount}</p>
              </div>
              <div className="col-span-2 bg-nexus-accent/10 border border-nexus-accent/20 p-2 rounded-xl flex items-center justify-center gap-2">
                 <Crown size={12} className="text-nexus-accent" />
                 <span className="text-[10px] font-bold text-white uppercase">Prestige: {stats.prestigePoints}</span>
              </div>
           </div>
        </div>

        {/* Footer/Hologram Look */}
        <div className="absolute bottom-8 left-8 right-8 z-10 flex justify-between items-end">
           <div className="flex gap-1">
              {stats.platformsConnected.map(p => (
                 <div key={p} className="p-1 bg-white/5 rounded border border-white/10 opacity-50">
                    <Globe size={10} className="text-gray-400" />
                 </div>
              ))}
           </div>
           <div className="text-[8px] font-mono text-gray-600">
              BLOCK_ID: {Math.random().toString(36).substring(7).toUpperCase()}
           </div>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
         <button className="flex items-center gap-2 px-4 py-2 bg-nexus-800 hover:bg-nexus-700 text-white rounded-xl text-xs font-bold border border-nexus-700 transition-all">
            <Download size={14} /> Download
         </button>
         <button className="flex items-center gap-2 px-4 py-2 bg-nexus-accent hover:bg-nexus-accent/80 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-nexus-accent/20">
            <Share2 size={14} /> Share Legacy
         </button>
      </div>
    </div>
  );
};
