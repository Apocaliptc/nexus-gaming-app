
import React, { useState } from 'react';
import { Milestone, JournalEntry } from '../types';
import { History, Trophy, Rocket, Flame, Clock, Star, Calendar, ChevronRight, Zap, ScrollText, Loader2, Share2, PenLine, Sparkles, Plus } from 'lucide-react';
import { generatePlayerManifesto, generateJournalNarrative } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';

export const NexusChronos: React.FC = () => {
  const { userStats, setUserStats } = useAppContext();
  const [manifesto, setManifesto] = useState<string | null>(null);
  const [loadingManifesto, setLoadingManifesto] = useState(false);
  
  // Memory Creator State
  const [showCreator, setShowCreator] = useState(false);
  const [gameTitle, setGameTitle] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [loadingNarrative, setLoadingNarrative] = useState(false);

  const handleGenerateManifesto = async () => {
    if (!userStats) return;
    setLoadingManifesto(true);
    try {
      const text = await generatePlayerManifesto(userStats);
      setManifesto(text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingManifesto(false);
    }
  };

  const handleSaveMemory = async () => {
    if (!gameTitle || !rawInput || !userStats) return;
    setLoadingNarrative(true);
    try {
      const { narrative, mood } = await generateJournalNarrative(gameTitle, rawInput);
      const newEntry: JournalEntry = {
        id: `journal-${Date.now()}`,
        date: new Date().toISOString(),
        gameTitle,
        rawInput,
        narrative,
        mood
      };
      
      setUserStats({
        ...userStats,
        journalEntries: [newEntry, ...(userStats.journalEntries || [])]
      });
      
      setShowCreator(false);
      setGameTitle('');
      setRawInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNarrative(false);
    }
  };

  const allMilestones: Milestone[] = [
    ...(userStats?.journalEntries || []).map(entry => ({
      id: entry.id,
      date: entry.date,
      title: `Memória em ${entry.gameTitle}`,
      description: entry.narrative,
      icon: 'pen-line',
      type: 'journal' as const,
      gameTitle: entry.gameTitle,
      importance: 'high' as const
    })),
    // Fixed: Added 'as const' to literal types to match Milestone interface requirements
    {
      id: 'm1',
      date: '2024-02-28',
      title: 'Mestre das Terras Intermédias',
      description: 'Você atingiu 200 horas em Elden Ring e completou sua 42ª platina. Um marco lendário.',
      icon: 'trophy',
      type: 'achievement' as const,
      gameTitle: 'Elden Ring',
      importance: 'legendary' as const
    },
    // Fixed: Added 'as const' to literal types to match Milestone interface requirements
    {
      id: 'm2',
      date: '2023-11-15',
      title: 'A Ascensão do Atirador',
      description: 'Sua precisão em FPS subiu 40% este mês após maratonar The Finals.',
      icon: 'rocket',
      type: 'evolution' as const,
      importance: 'high' as const
    }
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <h2 className="text-4xl font-display font-bold text-white flex items-center gap-3">
            <History className="text-nexus-accent" /> Nexus Chronos
          </h2>
          <p className="text-gray-400">O seu diário épico de vida gamer.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCreator(true)}
            className="px-6 py-3 bg-nexus-800 hover:bg-nexus-700 text-white font-bold rounded-2xl transition-all border border-nexus-700 flex items-center gap-2"
          >
            <PenLine size={20} className="text-nexus-secondary" />
            Nova Memória
          </button>
          <button 
            onClick={handleGenerateManifesto}
            disabled={loadingManifesto}
            className="px-6 py-3 bg-gradient-to-r from-nexus-accent to-nexus-secondary hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-xl shadow-nexus-accent/20 flex items-center gap-2 disabled:opacity-50"
          >
            {loadingManifesto ? <Loader2 className="animate-spin" size={20} /> : <ScrollText size={20} />}
            Gerar Manifesto
          </button>
        </div>
      </div>

      {/* Memory Creator Modal */}
      {showCreator && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-nexus-900 w-full max-w-lg rounded-[2.5rem] border border-nexus-700 p-8 space-y-6 shadow-2xl">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-nexus-accent" /> Registrar Momento
                </h3>
                <button onClick={() => setShowCreator(false)} className="text-gray-500 hover:text-white transition-colors">Fechar</button>
             </div>
             
             <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Qual jogo marcou seu dia?</label>
                  <input 
                    type="text" 
                    value={gameTitle}
                    onChange={e => setGameTitle(e.target.value)}
                    placeholder="Ex: Cyberpunk 2077"
                    className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">O que aconteceu? (Seja breve e sincero)</label>
                  <textarea 
                    value={rawInput}
                    onChange={e => setRawInput(e.target.value)}
                    placeholder="Ex: Finalmente derrotei o boss depois de 3 horas. Foi intenso."
                    className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-accent outline-none h-32 resize-none"
                  />
                </div>
             </div>

             <button 
                onClick={handleSaveMemory}
                disabled={loadingNarrative || !gameTitle || !rawInput}
                className="w-full py-4 bg-nexus-accent hover:bg-nexus-accent/80 text-white font-bold rounded-2xl transition-all shadow-xl shadow-nexus-accent/20 flex items-center justify-center gap-2 disabled:opacity-50"
             >
                {loadingNarrative ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Transformar em Crônica</>}
             </button>
          </div>
        </div>
      )}

      {/* Manifesto Section */}
      {manifesto && (
        <div className="mb-12 animate-fade-in">
           <div className="bg-nexus-900 border-2 border-nexus-accent/30 rounded-[2.5rem] p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5"><ScrollText size={150} /></div>
              <div className="relative z-10 space-y-6">
                 <div className="flex justify-between items-center">
                    <span className="text-nexus-accent font-bold uppercase tracking-[0.3em] text-[10px]">Documento de Legado Nexus</span>
                    <button className="text-gray-500 hover:text-white transition-colors"><Share2 size={18} /></button>
                 </div>
                 <div className="text-gray-200 leading-relaxed font-serif italic text-lg whitespace-pre-wrap">
                    {manifesto}
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="relative border-l-2 border-nexus-800 ml-4 md:ml-8 pl-8 space-y-12 pb-20">
        {allMilestones.map((milestone, idx) => (
          <div key={milestone.id} className="relative animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-nexus-900 ${
              milestone.importance === 'legendary' ? 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]' :
              milestone.type === 'journal' ? 'bg-nexus-secondary' :
              milestone.importance === 'high' ? 'bg-nexus-accent' : 'bg-gray-600'
            }`}></div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <span className="text-xs font-mono font-bold text-gray-500 bg-nexus-900 px-3 py-1 rounded-full border border-nexus-800">
                    {new Date(milestone.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                 </span>
                 {milestone.type === 'journal' && (
                    <span className="text-[10px] font-bold uppercase text-nexus-secondary flex items-center gap-1 tracking-widest">
                       <PenLine size={12} /> Entrada de Diário
                    </span>
                 )}
              </div>

              <div className={`bg-nexus-800 p-6 rounded-[2rem] border transition-all hover:border-nexus-600 group ${
                milestone.importance === 'legendary' ? 'border-yellow-500/30 shadow-2xl shadow-yellow-500/5' : 
                milestone.type === 'journal' ? 'border-nexus-secondary/30' : 'border-nexus-700'
              }`}>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                    milestone.type === 'journal' ? 'bg-nexus-secondary/10 text-nexus-secondary' :
                    milestone.type === 'achievement' ? 'bg-yellow-500/10 text-yellow-500' :
                    milestone.type === 'evolution' ? 'bg-nexus-accent/10 text-nexus-accent' :
                    'bg-nexus-secondary/10 text-nexus-secondary'
                  }`}>
                    {milestone.type === 'journal' ? <PenLine size={32} /> :
                     milestone.type === 'achievement' ? <Trophy size={32} /> :
                     milestone.type === 'evolution' ? <Rocket size={32} /> : <Star size={32} />}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-display font-bold text-white group-hover:text-nexus-accent transition-colors">{milestone.title}</h3>
                    <p className="text-gray-400 leading-relaxed italic">{milestone.description}</p>
                    {milestone.gameTitle && (
                      <div className="pt-2 flex items-center gap-2 text-xs font-bold text-nexus-accent/70">
                        <Zap size={14} /> Jogo: {milestone.gameTitle}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
