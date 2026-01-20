
import React, { useState } from 'react';
import { CommunitySuggestion, SuggestionStatus } from '../types';
import { Lightbulb, ThumbsUp, MessageSquare, BrainCircuit, Rocket, Clock, CheckCircle2, Plus, Search, Filter, Sparkles, Zap, ChevronUp } from 'lucide-react';

const MOCK_SUGGESTIONS: CommunitySuggestion[] = [
  {
    id: 's1',
    title: 'Integração com RetroAchievements',
    description: 'Permitir que o Nexus escaneie e unifique conquistas de emuladores via API do RetroAchievements.org.',
    authorId: 'u123',
    authorName: 'OldSchoolGamer',
    votes: 1240,
    status: SuggestionStatus.IMPLEMENTING,
    category: 'integration',
    createdAt: new Date().toISOString(),
    aiFeasibilityScore: 95,
    aiComment: 'API estável e documentada. Baixo custo de implementação e alto engajamento da comunidade retrô.'
  },
  {
    id: 's2',
    title: 'Modo de Realidade Aumentada para Coleção',
    description: 'Usar a câmera para reconhecer capas de jogos físicos e mostrar as estatísticas flutuando sobre a caixa.',
    authorId: 'u456',
    authorName: 'TechEnthusiast',
    votes: 850,
    status: SuggestionStatus.VALIDATING,
    category: 'ui',
    createdAt: new Date().toISOString(),
    aiFeasibilityScore: 60,
    aiComment: 'Requer processamento de visão computacional intensivo. Recomendado apenas para dispositivos high-end.'
  },
  {
    id: 's3',
    title: 'Ligas de Competição Mensal',
    description: 'Criar rankings automáticos por gênero que dão badges exclusivos de "Mestre do RPG" ou "Sniper de Elite".',
    authorId: 'u789',
    authorName: 'CompetitiveSoul',
    votes: 3200,
    status: SuggestionStatus.LIVE,
    category: 'social',
    createdAt: new Date().toISOString(),
    aiFeasibilityScore: 100,
    aiComment: 'Já integrado ao núcleo social. Escalabilidade garantida via Google Cloud Functions.'
  }
];

export const NexusLab: React.FC = () => {
  const [suggestions, setSuggestions] = useState<CommunitySuggestion[]>(MOCK_SUGGESTIONS);
  const [filter, setFilter] = useState<'all' | 'voting' | 'live'>('all');

  const getStatusColor = (status: SuggestionStatus) => {
    switch (status) {
      case SuggestionStatus.LIVE: return 'text-green-400 bg-green-500/10 border-green-500/20';
      case SuggestionStatus.IMPLEMENTING: return 'text-nexus-secondary bg-nexus-secondary/10 border-nexus-secondary/20';
      case SuggestionStatus.VALIDATING: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: SuggestionStatus) => {
    switch (status) {
      case SuggestionStatus.LIVE: return <CheckCircle2 size={14} />;
      case SuggestionStatus.IMPLEMENTING: return <Rocket size={14} />;
      case SuggestionStatus.VALIDATING: return <BrainCircuit size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in max-w-6xl mx-auto h-full overflow-y-auto custom-scrollbar">
      {/* Header Section */}
      <div className="relative p-10 rounded-[3rem] bg-gradient-to-br from-nexus-900 to-nexus-800 border border-nexus-700 overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-nexus-accent/20 blur-[100px] rounded-full group-hover:bg-nexus-accent/30 transition-all duration-700"></div>
        
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nexus-accent/20 border border-nexus-accent/30 text-nexus-accent text-[10px] font-bold uppercase tracking-widest">
            <Sparkles size={12} /> Laboratório da Comunidade
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">O futuro do Nexus é <span className="text-nexus-accent">você quem decide.</span></h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Sugira novas integrações, vote em funções experimentais e acompanhe nossa IA validando a viabilidade técnica de cada ideia em tempo real.
          </p>
          <div className="flex gap-4 pt-4">
            <button className="px-6 py-3 bg-nexus-accent hover:bg-nexus-accent/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-nexus-accent/20 flex items-center gap-2">
              <Plus size={18} /> Sugerir Nova Função
            </button>
            <button className="px-6 py-3 bg-nexus-900 border border-nexus-700 text-gray-400 hover:text-white font-bold rounded-xl transition-all">
              Documentação API
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-nexus-900/50 p-2 rounded-2xl border border-nexus-800">
        <div className="flex gap-2">
           {(['all', 'voting', 'live'] as const).map(f => (
             <button 
               key={f}
               onClick={() => setFilter(f)}
               className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filter === f ? 'bg-nexus-800 text-white shadow-lg border border-nexus-700' : 'text-gray-500 hover:text-white'}`}
             >
               {f === 'all' ? 'Todas' : f === 'voting' ? 'Em Votação' : 'Lançadas'}
             </button>
           ))}
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
           <input type="text" placeholder="Filtrar ideias..." className="w-full bg-nexus-900 border border-nexus-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-nexus-accent outline-none" />
        </div>
      </div>

      {/* Suggestions List */}
      <div className="grid grid-cols-1 gap-6 pb-20">
        {suggestions.map(suggestion => (
          <div key={suggestion.id} className="bg-nexus-800 border border-nexus-700 rounded-3xl overflow-hidden hover:border-nexus-600 transition-all group flex flex-col md:flex-row">
            {/* Vote Side */}
            <div className="p-6 bg-nexus-900/50 flex flex-col items-center justify-center border-r border-nexus-700 md:w-32">
               <button className="p-3 rounded-2xl bg-nexus-800 hover:bg-nexus-accent hover:text-white text-gray-400 transition-all border border-nexus-700 group-hover:border-nexus-accent/30">
                  <ChevronUp size={24} />
               </button>
               <span className="text-xl font-display font-bold text-white mt-2">{suggestion.votes > 1000 ? (suggestion.votes/1000).toFixed(1) + 'k' : suggestion.votes}</span>
               <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Vibes</span>
            </div>

            {/* Content Side */}
            <div className="p-8 flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                 <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(suggestion.status)}`}>
                    {getStatusIcon(suggestion.status)} {suggestion.status}
                 </span>
                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-nexus-900 px-3 py-1 rounded-full border border-nexus-800">
                    {suggestion.category}
                 </span>
              </div>
              
              <div>
                <h3 className="text-2xl font-display font-bold text-white group-hover:text-nexus-accent transition-colors">{suggestion.title}</h3>
                <p className="text-gray-400 mt-2 leading-relaxed">{suggestion.description}</p>
              </div>

              {/* AI Insights Bar */}
              {suggestion.aiFeasibilityScore && (
                <div className="p-4 bg-nexus-900 rounded-2xl border border-nexus-700/50 space-y-3">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-xs font-bold text-nexus-secondary">
                        <BrainCircuit size={16} /> Nexus AI Analysis
                     </div>
                     <div className="text-xs font-mono font-bold text-white">Viability: {suggestion.aiFeasibilityScore}%</div>
                  </div>
                  <div className="h-1 bg-nexus-800 rounded-full overflow-hidden">
                     <div 
                       className={`h-full transition-all duration-1000 ${suggestion.aiFeasibilityScore > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                       style={{ width: `${suggestion.aiFeasibilityScore}%` }}
                     ></div>
                  </div>
                  <p className="text-xs text-gray-500 italic">"{suggestion.aiComment}"</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                 <div className="flex items-center gap-2">
                    <img src={`https://i.pravatar.cc/150?u=${suggestion.authorId}`} className="w-6 h-6 rounded-full border border-nexus-700" />
                    <span className="text-xs text-gray-500">por <span className="text-gray-300 font-bold">{suggestion.authorName}</span></span>
                 </div>
                 <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-white text-xs font-bold transition-colors">
                       <MessageSquare size={16} /> Comentários
                    </button>
                    <button className="bg-nexus-900 hover:bg-nexus-800 text-gray-400 p-2 rounded-xl border border-nexus-700 transition-all">
                       <Zap size={16} />
                    </button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
