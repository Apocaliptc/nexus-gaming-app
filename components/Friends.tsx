
import React, { useState } from 'react';
import { MOCK_GLOBAL_USERS } from '../services/mockData';
import { Friend, Challenge, Platform, ChallengeType } from '../types';
import { Users, Zap, Plus, Medal, Crown, Flame, Clock, Trophy, Swords, Check, Gamepad2, X, Search, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { ProfileScreen } from './ProfileScreen';
import { useAppContext } from '../context/AppContext';

export const Friends: React.FC = () => {
  const { friends, addFriend, userStats } = useAppContext();
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'challenges' | 'list'>('list');

  // Sorted Friends for Leaderboard (including self)
  const sortedByTrophies = [...friends, { ...userStats, id: 'me', username: 'Você', status: 'online', avatarUrl: 'https://i.pravatar.cc/150?img=12', compatibilityScore: 0 } as any].sort((a, b) => b.totalTrophies - a.totalTrophies);
  
  const handleSearchUsers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate API search delay
    setTimeout(() => {
      const results = MOCK_GLOBAL_USERS.filter(u => 
        u.nexusId.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 600);
  };

  const handleAddFriendAction = (friend: Friend) => {
    addFriend(friend);
    // Visual feedback already handled by context update
  };

  const AddFriendModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-nexus-800 w-full max-w-xl rounded-2xl border border-nexus-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-nexus-700 flex justify-between items-center">
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Users className="text-nexus-accent" /> Buscar Pessoas no Nexus
          </h3>
          <button onClick={() => { setShowAddModal(false); setSearchResults([]); setSearchQuery(''); }} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSearchUsers} className="flex gap-2">
            <div className="flex-1 bg-nexus-900 border border-nexus-700 rounded-xl flex items-center px-4 py-3 focus-within:border-nexus-accent transition-colors">
              <Search className="text-gray-500 mr-3" size={20} />
              <input 
                type="text" 
                autoFocus
                placeholder="Pesquisar por Nexus ID ou Nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white w-full font-medium"
              />
            </div>
            <button type="submit" disabled={isSearching} className="bg-nexus-accent hover:bg-nexus-accent/80 text-white px-6 rounded-xl font-bold transition-all disabled:opacity-50">
              {isSearching ? <Loader2 className="animate-spin" /> : "Buscar"}
            </button>
          </form>

          <div className="space-y-3">
            {searchResults.length > 0 ? (
              searchResults.map(result => {
                const isAlreadyFriend = friends.some(f => f.id === result.id);
                return (
                  <div key={result.id} className="bg-nexus-900/50 p-4 rounded-xl border border-nexus-700 flex items-center justify-between hover:bg-nexus-900 transition-all">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelectedFriend(result)}>
                      <img src={result.avatarUrl} className="w-12 h-12 rounded-xl border border-nexus-700" />
                      <div>
                        <h4 className="font-bold text-white">{result.username}</h4>
                        <p className="text-xs text-nexus-secondary font-mono">{result.nexusId}</p>
                      </div>
                    </div>
                    {isAlreadyFriend ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg text-xs font-bold border border-green-500/20">
                        <UserCheck size={14} /> Amigo
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAddFriendAction(result)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-nexus-accent hover:bg-nexus-accent/80 text-white rounded-lg text-xs font-bold transition-all"
                      >
                        <UserPlus size={14} /> Adicionar
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              searchQuery && !isSearching && (
                <div className="text-center py-10">
                  <p className="text-gray-500 italic text-sm">Nenhum usuário encontrado com este critério.</p>
                </div>
              )
            )}
            {!searchQuery && (
              <div className="text-center py-10 opacity-40">
                <Users size={48} className="mx-auto mb-3" />
                <p className="text-sm">Digite o ID de um amigo para começar a competir.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Main Render - Switch between Hub List and Profile Screen
  if (selectedFriend) {
    return (
        <ProfileScreen 
            profileData={selectedFriend} 
            onClose={() => setSelectedFriend(null)} 
        />
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-nexus-700 pb-6 flex-shrink-0">
        <div>
           <h2 className="text-3xl font-display font-bold text-white">Social Hub</h2>
           <p className="text-gray-400 text-sm">Compare, compita e suba no ranking global.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-nexus-accent text-white shadow-lg' : 'bg-nexus-800 text-gray-400 hover:text-white'}`}
            >
              Amigos
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-nexus-accent text-white shadow-lg' : 'bg-nexus-800 text-gray-400 hover:text-white'}`}
            >
              Ranking
            </button>
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-nexus-accent/10 text-nexus-accent border border-nexus-accent/20 rounded-lg hover:bg-nexus-accent/20 transition-all text-sm font-bold flex items-center gap-2 ml-2"
            >
              <UserPlus size={16} /> <span className="hidden sm:inline">Buscar Pessoas</span>
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
      
      {/* FRIENDS LIST TAB */}
      {activeTab === 'list' && (
          <div className="grid gap-4 pb-8">
            {friends.length === 0 ? (
              <div className="text-center py-20 bg-nexus-800/20 border border-nexus-700 border-dashed rounded-3xl">
                <Users size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-gray-500">Sua lista de amigos está vazia. Comece a buscar agora!</p>
              </div>
            ) : (
              friends.map((friend) => (
                <div 
                   key={friend.id} 
                   onClick={() => setSelectedFriend(friend)}
                   className="bg-nexus-800 p-4 rounded-xl border border-nexus-700 flex items-center gap-4 hover:border-nexus-600 transition-all group cursor-pointer hover:shadow-lg hover:bg-nexus-700/50"
                >
                  <div className="relative">
                    <img src={friend.avatarUrl} alt={friend.username} className="w-14 h-14 rounded-2xl object-cover border-2 border-nexus-700 group-hover:border-nexus-500 transition-colors" />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-nexus-800 z-10 ${
                      friend.status === 'online' ? 'bg-green-500' : 
                      friend.status === 'ingame' ? 'bg-nexus-accent' : 'bg-gray-500'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-lg truncate group-hover:text-nexus-accent transition-colors">{friend.username}</h3>
                      <span className="text-[10px] font-mono text-gray-500 border border-gray-700 px-1.5 rounded hidden sm:inline-block">{friend.nexusId}</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate mt-0.5">
                      {friend.status === 'ingame' ? (
                        <span className="text-nexus-secondary font-medium flex items-center gap-1"><Gamepad2 className="w-3 h-3"/> {friend.currentActivity}</span>
                      ) : (
                        <span>{friend.status === 'online' ? 'Online' : 'Visto por último recentemente'}</span>
                      )}
                    </p>
                  </div>

                  <div className="text-right hidden sm:block mr-4">
                    <div className="flex items-center justify-end gap-1.5 text-yellow-500">
                      <Trophy size={16} />
                      <span className="font-bold font-mono text-lg">{friend.totalTrophies}</span>
                    </div>
                    <div className="text-xs text-gray-500">Total de Conquistas</div>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-nexus-900 border border-nexus-700 flex flex-col items-center justify-center min-w-[60px]" title="Sinergia">
                     <Zap size={18} className={`mb-0.5 ${friend.compatibilityScore > 80 ? 'text-green-500' : 'text-yellow-500'}`} />
                     <span className="font-mono text-xs font-bold text-gray-300">{friend.compatibilityScore}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
      )}

      {/* LEADERBOARD TAB */}
      {activeTab === 'leaderboard' && (
         <div className="space-y-4 pb-8">
             {sortedByTrophies.map((user, idx) => (
                 <div key={user.nexusId} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${idx === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-nexus-800 border-yellow-500/50 shadow-yellow-500/5' : 'bg-nexus-800 border-nexus-700'}`}>
                    <div className="w-10 font-display font-bold text-3xl text-gray-600 text-center flex items-center justify-center">
                       {idx === 0 ? <Crown className="text-yellow-500 fill-yellow-500/20" size={32} /> : idx + 1}
                    </div>
                    <img src={user.avatarUrl} className="w-14 h-14 rounded-full border-2 border-white/5" />
                    <div className="flex-1">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                          {user.username} 
                          {user.nexusId === userStats.nexusId && <span className="px-2 py-0.5 rounded-md bg-nexus-accent/20 text-nexus-accent text-xs font-bold uppercase">Você</span>}
                        </h3>
                        <div className="flex gap-4 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1"><Clock size={12}/> {user.totalHours}h Jogado</span>
                            <span className="flex items-center gap-1"><Medal size={12} className="text-purple-400"/> {user.platinumCount} Platinas</span>
                        </div>
                    </div>
                    <div className="text-right px-4">
                        <span className="text-3xl font-bold font-display text-white">{user.totalTrophies}</span>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Conquistas</p>
                    </div>
                 </div>
             ))}
         </div>
      )}

      </div>
      
      {showAddModal && <AddFriendModal />}
    </div>
  );
};
