
import React, { useState } from 'react';
import { Friend } from '../types';
import { Users, Trophy, Medal, Clock, Search, UserPlus, Loader2, UserMinus, Sparkles, Check, ChevronRight, X } from 'lucide-react';
import { ProfileScreen } from './ProfileScreen';
import { useAppContext } from '../context/AppContext';
import { nexusCloud } from '../services/nexusCloud';

export const Friends: React.FC = () => {
  const { friends, addFriend, removeFriend, userStats } = useAppContext();
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'discover' | 'leaderboard'>('list');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await nexusCloud.searchGlobalUsers(searchQuery);
      // Filtra para não mostrar a si mesmo nos resultados da busca
      setSearchResults(results.filter(u => u.nexusId !== userStats?.nexusId));
    } catch (err) {
      console.error("Erro na busca global:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (friend: Friend) => {
    await addFriend(friend);
    // Atualiza a lista local de resultados para mostrar que já é amigo
    setSearchResults(prev => prev.map(f => f.nexusId === friend.nexusId ? { ...f, isFriend: true } : f));
  };

  const openProfile = async (nexusId: string) => {
    const stats = await nexusCloud.getUser(nexusId);
    if (stats) {
      const profile = nexusCloud.mapStatsToFriend(stats);
      setSelectedFriend(profile);
    }
  };

  // Friends sorted for leaderboard
  const sortedByTrophies = [...friends, { ...userStats, username: userStats?.nexusId.replace('@', ''), status: 'online', avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats?.nexusId}`, compatibilityScore: 0 } as any]
    .sort((a, b) => (b.totalAchievements || b.totalTrophies || 0) - (a.totalAchievements || a.totalTrophies || 0));

  if (selectedFriend) {
    return <ProfileScreen profileData={selectedFriend} onClose={() => setSelectedFriend(null)} />;
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in h-full flex flex-col bg-[#050507]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-nexus-700 pb-6 flex-shrink-0">
        <div>
           <h2 className="text-3xl font-display font-bold text-white">Centro de Conexões</h2>
           <p className="text-gray-400 text-sm">Sincronize seu legado com outros jogadores do banco.</p>
        </div>
        
        <div className="flex bg-nexus-900 p-1 rounded-xl border border-nexus-800">
            <button 
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              Amigos ({friends.length})
            </button>
            <button 
              onClick={() => setActiveTab('discover')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'discover' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              Buscar Amigos
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'leaderboard' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              Ranking
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {activeTab === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
              {friends.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-nexus-800/20 border border-nexus-700 border-dashed rounded-3xl">
                  <Users size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-gray-500">Sua lista de amigos está vazia. Vá em "Buscar Amigos" para encontrar perfis no banco.</p>
                </div>
              ) : (
                friends.map((friend) => (
                  <div 
                     key={friend.nexusId} 
                     onClick={() => openProfile(friend.nexusId)}
                     className="bg-nexus-800 p-5 rounded-[2rem] border border-nexus-700 flex flex-col gap-4 hover:border-nexus-accent/50 transition-all group cursor-pointer hover:shadow-xl relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4">
                        <img src={friend.avatarUrl} className="w-14 h-14 rounded-2xl object-cover border-2 border-nexus-700 group-hover:border-nexus-accent/50 transition-colors" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-lg truncate">{friend.username}</h3>
                          <p className="text-xs text-gray-500 font-mono">{friend.nexusId}</p>
                        </div>
                        <ChevronRight className="text-gray-600 group-hover:text-nexus-accent transition-colors" size={20} />
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-nexus-700/50">
                        <div className="flex items-center gap-1.5 text-yellow-500">
                            <Trophy size={14} />
                            <span className="font-bold font-mono text-sm">{friend.totalTrophies}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-nexus-secondary">
                            <Clock size={14} />
                            <span className="font-bold font-mono text-sm">{friend.totalHours}h</span>
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
        )}

        {activeTab === 'discover' && (
            <div className="space-y-8 pb-10">
                <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
                    <div className="absolute inset-0 bg-nexus-accent/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl"></div>
                    <div className="relative bg-nexus-900 border border-nexus-700 rounded-2xl flex items-center px-6 py-4 focus-within:border-nexus-accent transition-all">
                        <Search className="text-gray-500 mr-4" size={24} />
                        <input 
                            type="text" 
                            placeholder="Digite o @NexusID do seu amigo..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-white w-full text-lg font-medium placeholder-gray-600"
                        />
                        <button type="submit" className="bg-nexus-accent text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-nexus-accent/20 hover:bg-nexus-accent/90 transition-all">
                            Buscar
                        </button>
                    </div>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isSearching ? (
                        <div className="col-span-full py-20 flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-nexus-accent" size={48} />
                            <p className="text-gray-500 animate-pulse font-mono text-xs uppercase tracking-widest">Consultando arquivos do banco...</p>
                        </div>
                    ) : hasSearched && searchResults.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-nexus-800/20 border border-nexus-700 border-dashed rounded-3xl">
                            <X size={48} className="mx-auto mb-4 opacity-10 text-red-500" />
                            <p className="text-gray-500">Nenhum usuário com esse ID foi encontrado no seu banco de dados.</p>
                        </div>
                    ) : (
                        searchResults.map((result) => {
                            const isAlreadyFriend = friends.some(f => f.nexusId === result.nexusId);
                            return (
                                <div key={result.nexusId} className="bg-nexus-800 p-6 rounded-[2.5rem] border border-nexus-700 flex items-center justify-between group animate-fade-in">
                                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => openProfile(result.nexusId)}>
                                        <img src={result.avatarUrl} className="w-16 h-16 rounded-2xl border-2 border-nexus-700" />
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{result.username}</h4>
                                            <p className="text-xs text-gray-500 font-mono">{result.nexusId}</p>
                                        </div>
                                    </div>
                                    {isAlreadyFriend ? (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-nexus-success/10 text-nexus-success border border-nexus-success/20 rounded-xl text-xs font-bold uppercase tracking-widest">
                                            <Check size={14} /> Amigo
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleAddFriend(result)}
                                            className="px-6 py-3 bg-nexus-accent hover:bg-nexus-accent/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-nexus-accent/20 flex items-center gap-2"
                                        >
                                            <UserPlus size={18} /> Adicionar
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        )}

        {activeTab === 'leaderboard' && (
           <div className="space-y-4 pb-8 max-w-4xl mx-auto">
               {sortedByTrophies.map((user, idx) => (
                   <div key={user.nexusId} onClick={() => openProfile(user.nexusId)} className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${idx === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-nexus-800 border-yellow-500/50 shadow-yellow-500/5' : 'bg-nexus-800 border-nexus-700 hover:border-nexus-accent'}`}>
                      <div className={`w-10 font-display font-bold text-3xl text-center ${idx === 0 ? 'text-yellow-500' : 'text-gray-600'}`}>{idx + 1}</div>
                      <img src={user.avatarUrl} className="w-14 h-14 rounded-full border-2 border-white/5" />
                      <div className="flex-1">
                          <h3 className="font-bold text-white text-lg">{user.username} {user.nexusId === userStats?.nexusId && '(Você)'}</h3>
                          <div className="flex gap-4 text-xs text-gray-400 mt-1">
                              <span className="flex items-center gap-1"><Clock size={12}/> {user.totalHours}h</span>
                              <span className="flex items-center gap-1"><Medal size={12}/> {user.platinumCount || 0} Platinas</span>
                          </div>
                      </div>
                      <div className="text-right px-4">
                          <span className={`text-2xl font-bold font-display ${idx === 0 ? 'text-yellow-500' : 'text-white'}`}>{user.totalAchievements || user.totalTrophies || 0}</span>
                          <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Conquistas</p>
                      </div>
                   </div>
               ))}
           </div>
        )}
      </div>
    </div>
  );
};
