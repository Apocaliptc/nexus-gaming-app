
import React from 'react';
import { OwnershipRecord } from '../types';
import { History, ArrowDown, ShieldCheck, Star, Calendar } from 'lucide-react';

interface Props {
  records: OwnershipRecord[];
  className?: string;
}

export const PedigreeTimeline: React.FC<Props> = ({ records, className = "" }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-nexus-accent/20 rounded-lg text-nexus-accent border border-nexus-accent/30">
          <History size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-widest">Nexus Pedigree</h4>
          <p className="text-[10px] text-gray-500 font-medium">Linhagem de custódia verificada na nuvem</p>
        </div>
      </div>

      <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-nexus-accent before:to-nexus-secondary before:opacity-30">
        {records.map((record, idx) => (
          <div key={idx} className="relative animate-fade-in" style={{ animationDelay: `${idx * 150}ms` }}>
            {/* Dot */}
            <div className={`absolute -left-[30px] top-1 w-6 h-6 rounded-full border-4 border-[#050507] z-10 flex items-center justify-center shadow-lg ${
              idx === 0 ? 'bg-nexus-accent animate-pulse' : 'bg-nexus-800'
            }`}>
              {idx === 0 && <Star size={10} className="text-white" />}
            </div>

            <div className="bg-nexus-800/40 border border-nexus-700 p-4 rounded-2xl group hover:border-nexus-accent/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-xs font-bold text-white group-hover:text-nexus-accent transition-colors">@{record.ownerName}</span>
                 <div className="flex items-center gap-1.5 text-yellow-500">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[10px] font-mono font-bold">{record.ownerPrestigeAtTime}</span>
                 </div>
              </div>
              
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                    <Calendar size={10} /> Aquisição: {new Date(record.acquiredDate).toLocaleDateString()}
                 </div>
                 {record.soldDate && (
                    <div className="flex items-center gap-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                       <ArrowDown size={10} className="text-nexus-secondary" /> Custódia encerrada: {new Date(record.soldDate).toLocaleDateString()}
                    </div>
                 )}
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-nexus-success/10 border border-nexus-success/20 rounded-xl text-nexus-success">
              <ShieldCheck size={12} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Origem Autêntica</span>
           </div>
        </div>
      </div>
    </div>
  );
};
