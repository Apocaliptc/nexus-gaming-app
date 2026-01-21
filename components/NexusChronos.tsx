
import React, { useState, useMemo } from 'react';
import { Milestone, JournalEntry } from '../types';
import { History, Trophy, Rocket, Flame, Clock, Star, Calendar, ChevronRight, Zap, ScrollText, Loader2, Share2, PenLine, Sparkles, Plus, Heart, Activity } from 'lucide-react';
import { generatePlayerManifesto, generateJournalNarrative } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';

export const NexusChronos: React.FC = () => {
  const { userStats, saveJournalMemory } = useAppContext();
  const [manifesto, setManifesto] = useState<string | null>(null);
  const [loadingManifesto, setLoadingManifesto] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [gameTitle, setGameTitle] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [loadingNarrative, setLoadingNarrative] = useState(false);

  const moodColorMap: Record<string, string> = {
    'Triumphant': 'from-yellow-500/20 to-orange-500/20 text-yellow-500',
    'Melancholic': 'from-blue-500/20 to-indigo-500/20 text-blue-400',
    'Intense': 'from-red-500/20 to-purple-500/20 text-red-500',
    'Epic': 'from-nexus-accent/20 to-nexus-secondary/20 text-nexus-accent'
  };

  const emotionalAnalysis = useMemo(() => {
    if (!userStats?.journalEntries || userStats.journalEntries.length === 0) return { mainMood: 'Equilibrado', description: 'O Oráculo aguarda sua primeira crônica.' };
    const moods = userStats.journalEntries.map(e => e.mood);
    const counts = moods.reduce((acc, mood) => { acc[mood] = (acc[mood] || 0) + 1; return acc; }, {} as Record<string, number>);
    const sorted = Object.entries(counts).sort((a,b) => (b[1] as any) - (a[1] as any));
    const main = sorted[0]?.[0] || 'Zen';
    return { mainMood: main, description: `Seu legado recente é majoritariamente ${main}. Isso reflete uma jornada de alta imersão emocional.` };
  }, [userStats?.journalEntries]);

  const handleGenerateManifesto = async () => {
    if (!userStats) return;
    setLoadingManifesto(true);
    try {
      const text = await generatePlayerManifesto(userStats);
      setManifesto(text);
    } catch (e) { console.error(e); } finally { setLoadingManifesto(false); }
  };

  const handleSaveMemory = async () => {
    if (!gameTitle || !rawInput || !userStats) return;
    setLoadingNarrative(true);
    try {
      const { narrative, mood } = await generateJournalNarrative(gameTitle, rawInput);
      const newEntry: JournalEntry = { id: `journal-${Date.now()}`, date: new Date().toISOString(), gameTitle, rawInput, narrative, mood };
      saveJournalMemory(newEntry);
      setShowCreator(false); setGameTitle(''); setRawInput('');
    } catch (e) { console.error(e); } finally { setLoadingNarrative(false); }
  };

  const allMilestones: Milestone[] = [
    ...(userStats?.journalEntries || []).map(entry => ({
      id: entry.id, date: entry.date, title: `Memória em ${entry.gameTitle}`, description: entry.narrative,
      icon: 'pen-line', type: 'journal' as const, gameTitle: entry.gameTitle, importance: 'high' as const
    })),
    { id: 'm1', date: '2024-02-28', title: 'Legado Sincronizado', description: 'Você unificou todas as suas plataformas no Nexus.', icon: 'globe', type: 'evolution' as const, importance: 'legendary' as const }
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <h2 className="text-4xl font-display font-bold text-white flex items-center gap-3"><History className="text-nexus-accent" /> Nexus Chronos</h2>
          <p className="text-gray-400">O seu diário épico de vida gamer.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowCreator(true)} className="px-6 py-3 bg-nexus-800 hover:bg-nexus-700 text-white font-bold rounded-2xl transition-all border border-nexus-700 flex items-center gap-2"><PenLine size={20} className="text-nexus-secondary" /> Nova Memória</button>
        </div>
      </div>

      <div className="mb-12 bg-nexus-800/40 border border-nexus-700 p-8 rounded-[2.5rem] relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-nexus-accent/10 to-transparent opacity-20"></div>
         <Activity className="absolute -top-6 -right-6 text-nexus-accent opacity-5" size={150} />
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-nexus-accent/20 rounded-[2rem] flex items-center justify-center text-nexus-accent border border-nexus-accent/30 shadow-2xl">
               <Heart size={40} className="animate-pulse" />
            </div>
            <div className="flex-1 space-y-2">
               <h4 className="text-xs font-bold text-nexus-accent uppercase tracking-[0.3em]">Emotional Heatmap</h4>
               <h3 className="text-2xl font-display font-bold text-white">Humor Dominante: <span className="text-nexus-secondary">{emotionalAnalysis.mainMood}</span></h3>
               <p className="text-gray-400 text-sm italic">{emotionalAnalysis.description}</p>
            </div>
            <div className="flex gap-2">
               {['Triumphant', 'Melancholic', 'Intense', 'Epic'].map(m => (
                  <div key={m} className={`w-3 h-12 rounded-full border border-white/5 ${moodColorMap[m]?.split(' ')[0]} ${moodColorMap[m]?.split(' ')[1]}`} title={m}></div>
               ))}
            </div>
         </div>
      </div>

      {showCreator && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-nexus-900 w-full max-w-lg rounded-[2.5rem] border border-nexus-700 p-8 space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2"><Sparkles className="text-nexus-accent" /> Registrar Momento</h3>
                <button onClick={() => setShowCreator(false)} className="text-gray-500 hover:text-white">Fechar</button>
             </div>
             <div className="space-y-4">
                <input type="text" value={gameTitle} onChange={e => setGameTitle(e.target.value)} placeholder="Jogo" className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-accent outline-none" />
                <textarea value={rawInput} onChange={e => setRawInput(e.target.value)} placeholder="O que aconteceu?" className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-accent outline-none h-32 resize-none" />
             </div>
             <button onClick={handleSaveMemory} disabled={loadingNarrative || !gameTitle || !rawInput} className="w-full py-4 bg-nexus-accent text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2">
                {loadingNarrative ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Transformar em Crônica</>}
             </button>
          </div>
        </div>
      )}

      <div className="relative border-l-2 border-nexus-800 ml-4 md:ml-8 pl-8 space-y-12 pb-20">
        {allMilestones.map((milestone, idx) => (
          <div key={milestone.id} className="relative animate-fade-in">
            <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-nexus-900 ${milestone.type === 'journal' ? 'bg-nexus-secondary' : 'bg-nexus-accent'}`}></div>
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-gray-500 bg-nexus-900 px-3 py-1 rounded-full border border-nexus-800">{new Date(milestone.date).toLocaleDateString()}</span>
              <div className={`bg-nexus-800 p-6 rounded-[2rem] border transition-all hover:border-nexus-600 ${milestone.type === 'journal' ? 'border-nexus-secondary/30' : 'border-nexus-700'}`}>
                <div className="flex gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-nexus-900 border border-nexus-700`}>
                    {milestone.type === 'journal' ? <PenLine size={32} className="text-nexus-secondary" /> : <Trophy size={32} className="text-nexus-accent" />}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-display font-bold text-white">{milestone.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed italic">"{milestone.description}"</p>
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
