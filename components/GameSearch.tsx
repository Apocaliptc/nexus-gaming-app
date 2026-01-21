
import React, { useState, useEffect } from 'react';
// Fixed: Removed MOCK_GAMES which was not exported from mockData.ts
import { MOCK_DISCOVER_GAMES } from '../services/mockData';
import { Game, Platform } from '../types';
import { searchGamesWithAI, getTrendingGames } from '../services/geminiService';
import { Search, Trophy, Info, Loader2, Sparkles, AlertCircle, Flame, TrendingUp, Zap, Filter, ChevronRight, Globe } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { GameDetailView } from './GameDetailView';

export const GameSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [trendingGames, setTrendingGames] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [searched, setSearched] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const trending = await getTrendingGames();
        setTrendingGames(trending);
      } catch (e) {
        console.error("Failed to load trending", e);
      } finally {
        setIsLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setSearched(true);
    setSearchResults([]);

    try {
        const aiResults = await searchGamesWithAI(searchTerm);
        setSearchResults(aiResults);
    } catch (error) {
        console.error("Search failed", error);
    } finally {
        setIsSearching(false);
    }
  };

  if (selectedGame) {
    return <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} isOwner={false} />;
  }

  return (
    <div className="p-6 md:p-10 space-y-10 animate-fade-in text-gray-100 h-full flex flex-col bg-[#050507] overflow-y-auto custom-scrollbar">
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-2">
           <h2 className="text-4xl font-display font-bold text-white flex items-center gap-3">
             Explorar Universo <Globe className="text-nexus-accent animate-pulse" />
           </h2>
           <p className="text-gray-400 text-lg">Descubra novos mundos e rastreie conquistas globais via Nexus Crawler.</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative w-full lg:w-[450px] group">
          <div className="absolute inset-0 bg-nexus-accent/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl"></div>
          <div className="relative bg-nexus-900 border border-nexus-700 rounded-2xl flex items-center px-4 py-4 focus-within:border-nexus-accent transition-all">
            <Search className="text-gray-500 mr-3" size={22} />
            <input 
              type="text" 
              placeholder="Pesquisar títulos, franquias ou gêneros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-full text-lg font-medium placeholder-gray-600"
            />
            {isSearching && <Loader2 className="animate-spin text-nexus-accent" size={20} />}
          </div>
        </form>
      </div>

      {/* Main Content Area */}
      {!searched ? (
        <div className="space-y-12">
          {/* Hype Radar Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                 <Flame className="text-orange-500" /> Radar de Hype
               </h3>
               <div className="flex gap-2">
                  <span className="px-3 py-1 bg-nexus-800 rounded-full text-[10px] font-bold text-gray-400 border border-nexus-700 uppercase">Live Crawling</span>
               </div>
            </div>

            {isLoadingTrending ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-72 bg-nexus-800/50 rounded-3xl border border-nexus-700 animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingGames.map((game: any) => (
                  <div 
                    key={game.id} 
                    onClick={() => setSelectedGame(game)}
                    className="relative group bg-nexus-800 rounded-[2rem] border border-nexus-700 overflow-hidden hover:border-nexus-accent transition-all cursor-pointer shadow-xl hover:shadow-nexus-accent/10"
                  >
                    <div className="h-56 relative overflow-hidden">
                       <img src={game.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                       <div className="absolute inset-0 bg-gradient-to-t from-nexus-800 via-transparent to-transparent"></div>
                       
                       {/* Hype Badge */}
                       <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg border border-orange-400/50">
                          <TrendingUp size={12} /> HYPE {game.hypeLevel || 95}%
                       </div>

                       <div className="absolute bottom-4 left-4 flex items-center gap-2">
                          <div className="p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                             <PlatformIcon platform={game.platform} className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/40 px-2 py-1 rounded-lg backdrop-blur-md">{game.platform}</span>
                       </div>
                    </div>
                    
                    <div className="p-6 space-y-3">
                       <h4 className="text-lg font-bold text-white leading-tight group-hover:text-nexus-accent transition-colors truncate">{game.title}</h4>
                       <div className="flex flex-wrap gap-2">
                          {game.genres?.slice(0, 2).map((g: string) => (
                            <span key={g} className="text-[10px] text-gray-500 font-bold border border-nexus-700 px-2 py-0.5 rounded">{g}</span>
                          ))}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Categories / Quick Filters */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <button onClick={() => { setSearchTerm('E-sports'); handleSearch(); }} className="p-6 bg-nexus-800 border border-nexus-700 rounded-3xl hover:bg-nexus-700 transition-all flex flex-col items-center gap-3 group">
                <Zap className="text-nexus-accent group-hover:scale-110 transition-transform" size={32} />
                <span className="font-bold text-sm">E-sports</span>
             </button>
             <button onClick={() => { setSearchTerm('Lançamentos 2025'); handleSearch(); }} className="p-6 bg-nexus-800 border border-nexus-700 rounded-3xl hover:bg-nexus-700 transition-all flex flex-col items-center gap-3 group">
                <Flame className="text-orange-500 group-hover:scale-110 transition-transform" size={32} />
                <span className="font-bold text-sm">Lançamentos</span>
             </button>
             <button onClick={() => { setSearchTerm('AAA RPG'); handleSearch(); }} className="p-6 bg-nexus-800 border border-nexus-700 rounded-3xl hover:bg-nexus-700 transition-all flex flex-col items-center gap-3 group">
                <Sparkles className="text-yellow-400 group-hover:scale-110 transition-transform" size={32} />
                <span className="font-bold text-sm">Blockbusters</span>
             </button>
             <button onClick={() => { setSearchTerm('Indie Gems'); handleSearch(); }} className="p-6 bg-nexus-800 border border-nexus-700 rounded-3xl hover:bg-nexus-700 transition-all flex flex-col items-center gap-3 group">
                <TrendingUp className="text-nexus-secondary group-hover:scale-110 transition-transform" size={32} />
                <span className="font-bold text-sm">Indie Gems</span>
             </button>
          </section>
        </div>
      ) : (
        /* Search Results View */
        <div className="space-y-8 pb-20">
           <div className="flex items-center justify-between">
              <button onClick={() => setSearched(false)} className="text-nexus-accent font-bold text-sm flex items-center gap-2 hover:underline">
                 <ChevronRight size={16} className="rotate-180" /> Voltar para Tendências
              </button>
              <p className="text-gray-500 text-sm">Encontrados {searchResults.length} resultados para "{searchTerm}"</p>
           </div>

           {isSearching ? (
             <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="animate-spin text-nexus-accent" size={48} />
                <p className="text-gray-500 animate-pulse">Sintonizando frequências do Nexus Crawler...</p>
             </div>
           ) : searchResults.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map(game => (
                  <div key={game.id} onClick={() => setSelectedGame(game)} className="bg-nexus-800 border border-nexus-700 rounded-3xl overflow-hidden hover:border-nexus-accent transition-all group cursor-pointer">
                     <div className="h-48 relative">
                        <img src={game.coverUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-2 left-2 flex items-center gap-2">
                           <div className="p-1.5 bg-black/60 rounded-lg border border-white/10">
                              <PlatformIcon platform={game.platform} className="w-3 h-3" />
                           </div>
                        </div>
                     </div>
                     <div className="p-5">
                        <h4 className="font-bold text-white truncate mb-2">{game.title}</h4>
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-gray-500">{game.genres[0]}</span>
                           <span className="text-nexus-accent font-bold flex items-center gap-1"><Trophy size={12} /> {game.totalAchievements} Conquistas</span>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           ) : (
             <div className="text-center py-24 text-gray-600">
                <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nenhum jogo encontrado com este termo. Tente ser mais específico.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
};
