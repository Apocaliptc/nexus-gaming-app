
import React, { useState } from 'react';
import { Friend } from '../types';
// Added Crown to the imports from lucide-react
import { Users, Trophy, Medal, Clock, Search, UserPlus, Loader2, UserMinus, Sparkles, Check, ChevronRight, X, Crown } from 'lucide-react';
import { ProfileView } from './ProfileView';
import { useAppContext } from '../context/AppContext';
import { nexusCloud } from '../services/nexusCloud';

export const Friends: React.FC = () => {
  const { friends, addFriend, removeFriend, userStats } = useAppContext();
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'discover' | 'leaderboard'>('list');
  
  const [searchQuery, setSearchTerm] = useState('');
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
      setSearchResults(results.filter(u => u.nexusId !== userStats?.nexusId));
    } catch (err) {
      console.error("Erro na busca global:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (friend: Friend) => {
    await addFriend(friend);
    setSearchResults(prev => prev.map(f => f.nexusId === friend.nexusId ? { ...f, isFriend: true } : f));
  };

  const openProfile = async (nexusId: string) => {
    const stats = await nexusCloud.getUser(nexusId);
    if (stats) {
      const profile = nexusCloud.mapStatsToFriend(stats);
      setSelectedFriend(profile);
    }
  };

  const sortedByTrophies = [...friends, { ...userStats, username: userStats?.nexusId.replace('@', ''), status: 'online', avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats?.nexusId}`, compatibilityScore: 0 } as any]
    .sort((a, b) => (b.totalAchievements || b.totalTrophies || 0) - (a.totalAchievements || a.totalTrophies || 0));

  if (selectedFriend) {
    return <ProfileView friendData={selectedFriend} onCloseFriend={() => setSelectedFriend(null)} />;
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in h-full flex flex-col bg-[#050507]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-nexus-700 pb-6 flex-shrink-0">
        <div>
           <h2 className="text-3xl font-display font-bold text-white">Centro de Conexões</h2>
           <p className="text-gray-400 text-sm italic">Sincronize seu legado com outros guerreiros sintonizados.</p>
        </div>
        
        <div className="flex bg-nexus-900 p-1 rounded-xl border border-nexus-800">
            <button 
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              Círculo ({friends.length})
            </button>
            <button 
              onClick={() => setActiveTab('discover')}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'discover' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              Rastrear Hall
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'leaderboard' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              Hierarquia
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {activeTab === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
              {friends.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-nexus-800/20 border border-nexus-700 border-dashed rounded-3xl">
                  <Users size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest italic opacity-20">Nenhuma conexão detectada.</p>
                </div>
              ) : (
                friends.map((friend) => (
                  <div 
                     key={friend.nexusId} 
                     onClick={() => openProfile(friend.nexusId)}
                     className="bg-nexus-900 p-8 rounded-[3rem] border border-nexus-800 flex flex-col gap-6 hover:border-nexus-accent transition-all group cursor-pointer shadow-xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <Sparkles size={80} />
                    </div>
                    <div className="flex items-center gap-6 relative z-10">
                        <img src={friend.avatarUrl} className="w-20 h-20 rounded-[2rem] border-2 border-nexus-700 group-hover:border-nexus-accent transition-colors" alt="Avatar" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-bold text-white text-2xl truncate">@{friend.username}</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <div className={`w-2 h-2 rounded-full ${friend.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-600'}`}></div>
                             <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{friend.status}</p>
                          </div>
                        </div>
                        <ChevronRight className="text-gray-800 group-hover:text-white transition-colors" size={24} />
                    </div>
                    <div className="flex justify-between items-center pt-6 border-t border-nexus-800 relative z-10">
                        <div className="text-center">
                            <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Trof./Conq.</p>
                            <p className="font-display font-bold text-white text-xl">{friend.totalTrophies}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Imersão</p>
                            <p className="font-display font-bold text-nexus-secondary text-xl">{friend.totalHours}h</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Sinergia</p>
                            <p className="font-display font-bold text-nexus-accent text-xl">{friend.compatibilityScore}%</p>
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
                    <div className="relative bg-nexus-900 border border-nexus-700 rounded-3xl flex items-center px-8 py-5 focus-within:border-nexus-accent transition-all shadow-2xl">
                        <Search className="text-gray-500 mr-4" size={24} />
                        <input 
                            type="text" 
                            placeholder="Pesquisar @NexusID no hall global..." 
                            value={searchQuery}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-white w-full text-lg font-medium placeholder-gray-600"
                        />
                        <button type="submit" className="bg-nexus-accent text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-nexus-accent/20 hover:bg-nexus-accent/90 transition-all">
                            Scannear
                        </button>
                    </div>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isSearching ? (
                        <div className="col-span-full py-20 flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-nexus-accent" size={64} />
                            <p className="text-gray-600 animate-pulse font-mono text-[10px] uppercase tracking-[0.5em]">Lendo Arquivos Soberanos...</p>
                        </div>
                    ) : hasSearched && searchResults.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-nexus-800/10 border border-nexus-800 border-dashed rounded-[3rem]">
                            <X size={48} className="mx-auto mb-4 opacity-10 text-red-500" />
                            <p className="text-gray-500 italic">Identidade não localizada no banco.</p>
                        </div>
                    ) : (
                        searchResults.map((result) => {
                            const isAlreadyFriend = friends.some(f => f.nexusId === result.nexusId);
                            return (
                                <div key={result.nexusId} className="bg-nexus-900 p-8 rounded-[3rem] border border-nexus-800 flex items-center justify-between group animate-fade-in shadow-xl">
                                    <div className="flex items-center gap-6 cursor-pointer" onClick={() => openProfile(result.nexusId)}>
                                        <img src={result.avatarUrl} className="w-16 h-16 rounded-[1.2rem] border-2 border-nexus-700" alt="Result" />
                                        <div>
                                            <h4 className="font-bold text-white text-xl">@{result.username}</h4>
                                            <p className="text-xs text-gray-500 font-mono tracking-widest">{result.nexusId}</p>
                                        </div>
                                    </div>
                                    {isAlreadyFriend ? (
                                        <div className="flex items-center gap-2 px-6 py-2.5 bg-nexus-success/10 text-nexus-success border border-nexus-success/20 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                            <Check size={14} /> Sintonizado
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleAddFriend(result)}
                                            className="px-8 py-3.5 bg-nexus-accent hover:bg-nexus-accent/90 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl flex items-center gap-3"
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
           <div className="space-y-6 pb-20 max-w-4xl mx-auto">
               <div className="bg-nexus-accent/5 border border-nexus-accent/20 p-6 rounded-[2rem] flex items-center gap-4 mb-10">
                  <Medal className="text-nexus-accent" size={32} />
                  <p className="text-sm text-gray-400 italic leading-relaxed">O Ranking Soberano unifica todas as plataformas. Sua posição é determinada pelo volume total de feitos imortalizados.</p>
               </div>
               {sortedByTrophies.map((user, idx) => (
                   <div key={user.nexusId} onClick={() => openProfile(user.nexusId)} className={`flex items-center gap-6 p-6 rounded-[2.5rem] border transition-all cursor-pointer group ${idx === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-nexus-900 border-yellow-500/30 shadow-2xl' : 'bg-nexus-900 border-nexus-800 hover:border-nexus-accent'}`}>
                      <div className={`w-12 font-display font-bold text-4xl text-center ${idx === 0 ? 'text-yellow-500' : 'text-gray-800 group-hover:text-gray-600'}`}>{idx + 1}</div>
                      <img src={user.avatarUrl} className="w-16 h-16 rounded-full border-2 border-white/5" alt="Rank Avatar" />
                      <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-xl truncate">{user.username} {user.nexusId === userStats?.nexusId && <span className="text-nexus-accent ml-2 text-xs font-black uppercase tracking-widest">(VOCÊ)</span>}</h3>
                          <div className="flex gap-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                              <span className="flex items-center gap-1.5"><Clock size={12} className="text-nexus-secondary" /> {user.totalHours}h</span>
                              <span className="flex items-center gap-1.5"><Trophy size={12} className="text-yellow-500" /> {user.totalAchievements || user.totalTrophies || 0}</span>
                          </div>
                      </div>
                      <div className="text-right px-6 shrink-0">
                          {idx === 0 ? <Crown size={32} className="text-yellow-500 animate-bounce" /> : <ChevronRight size={24} className="text-gray-800 group-hover:text-white transition-colors" />}
                      </div>
                   </div>
               ))}
           </div>
        )}
      </div>
    </div>
  );
};
