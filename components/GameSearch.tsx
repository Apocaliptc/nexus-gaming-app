
import React, { useState } from 'react';
import { MOCK_DISCOVER_GAMES, MOCK_GAMES } from '../services/mockData';
import { Game } from '../types';
import { searchGamesWithAI } from '../services/geminiService';
import { Search, Trophy, Info, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { GameDetailView } from './GameDetailView';

export const GameSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Combine owned games and discoverable games for default view
  const defaultGames = [...MOCK_DISCOVER_GAMES];
  
  const displayGames = (searched && searchResults.length > 0) ? searchResults : defaultGames;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setSearched(true);
    setSearchResults([]);

    try {
        // First check local matches
        const localMatches = [...MOCK_GAMES, ...MOCK_DISCOVER_GAMES].filter(g => 
            g.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Then ask AI for more
        const aiResults = await searchGamesWithAI(searchTerm);
        
        // Merge unique games (prefer AI results for new discovery, but keep local ID if exists)
        const combined = [...localMatches];
        aiResults.forEach(aiGame => {
            if (!combined.find(g => g.title.toLowerCase() === aiGame.title.toLowerCase())) {
                combined.push(aiGame);
            }
        });

        setSearchResults(combined);
    } catch (error) {
        console.error("Search failed", error);
    } finally {
        setIsSearching(false);
    }
  };

  if (selectedGame) {
    return (
      <div className="h-full relative">
         <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in text-gray-100 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-display font-bold text-white flex items-center gap-2">
             Descobrir Jogos {isSearching && <Loader2 className="animate-spin text-nexus-accent" />}
           </h2>
           <p className="text-gray-400">Pesquise títulos globais e visualize conquistas via Nexus AI.</p>
        </div>
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar títulos, franquias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-nexus-900 border border-nexus-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-nexus-accent focus:ring-1 focus:ring-nexus-accent transition-all outline-none shadow-lg"
          />
        </form>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar">
        {searched && searchResults.length === 0 && !isSearching ? (
             <div className="flex flex-col items-center justify-center py-20 text-gray-500 h-full">
                <AlertCircle size={48} className="mb-4 opacity-20" />
                <p>Nenhum jogo encontrado para "{searchTerm}". Tente outro termo.</p>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayGames.map(game => (
                <div key={game.id} className="bg-nexus-800 rounded-2xl border border-nexus-700 overflow-hidden hover:border-nexus-600 transition-all group flex flex-col hover:shadow-2xl hover:shadow-nexus-accent/10">
                    <div className="relative h-48 overflow-hidden bg-nexus-900">
                    <div className="absolute inset-0 bg-gradient-to-t from-nexus-800 to-transparent z-10"></div>
                    <img 
                        src={game.coverUrl} 
                        alt={game.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/600x900?text=No+Cover'; }}
                    />
                    <div className="absolute bottom-3 left-3 z-20 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-lg">
                        <PlatformIcon platform={game.platform} className="w-4 h-4 text-white" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{game.platform}</span>
                    </div>
                    {game.id.startsWith('ai-gen') && (
                        <div className="absolute top-3 right-3 z-20 bg-nexus-accent/20 backdrop-blur-md px-2 py-1 rounded-full border border-nexus-accent/30 text-[10px] font-bold text-nexus-accent flex items-center gap-1">
                            <Sparkles size={10} /> AI FOUND
                        </div>
                    )}
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-1 leading-tight truncate" title={game.title}>{game.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {game.genres.slice(0, 3).map(g => (
                        <span key={g} className="text-[10px] text-gray-400 bg-nexus-900 px-2 py-0.5 rounded border border-nexus-700">{g}</span>
                        ))}
                    </div>

                    <div className="mt-auto space-y-3">
                        <div className="flex items-center justify-between text-sm bg-nexus-900/50 p-2 rounded-lg border border-nexus-700/30">
                            <span className="text-gray-400 flex items-center gap-1.5"><Trophy size={14} className="text-yellow-500"/> Total Trophies</span>
                            <span className="font-mono font-bold text-white">{game.totalAchievements}</span>
                        </div>
                        
                        <button 
                            onClick={() => setSelectedGame(game)}
                            className="w-full py-2 bg-nexus-accent/10 hover:bg-nexus-accent text-nexus-accent hover:text-white border border-nexus-accent/20 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                        >
                        <Info size={16} /> Ver Detalhes
                        </button>
                    </div>
                    </div>
                </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
