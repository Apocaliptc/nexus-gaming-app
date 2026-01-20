
import React, { useState, useEffect } from 'react';
import { Friend, Platform } from '../types';
import { Users, Plus, Trophy, Medal, Crown, Clock, Gamepad2, X, Search, UserPlus, UserCheck, Loader2, Globe } from 'lucide-react';
import { ProfileScreen } from './ProfileScreen';
import { useAppContext } from '../context/AppContext';
import { nexusCloud } from '../services/nexusCloud';

export const Friends: React.FC = () => {
  const { friends, addFriend, userStats } = useAppContext();
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'list'>('list');

  // Load friends from context or initial fetch
  const sortedByTrophies = [...friends, { ...userStats, id: 'me', username: 'Você', status: 'online', avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats?.nexusId}`, compatibilityScore: 0 } as any].sort((a, b) => b.totalTrophies - a.totalTrophies);
  
  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await nexusCloud.searchGlobalUsers(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error("Erro na busca global:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const openExternalProfile = async (nexusId: string) => {
    const stats = await nexusCloud.getUser(nexusId);
    if (stats) {
      const profile: Friend = {
        id: stats.nexusId,
        nexusId: stats.nexusId,
        username: stats.nexusId.replace('@', ''),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${stats.nexusId}`,
        status: 'online',
        totalTrophies: stats.totalAchievements,
        platinumCount: stats.platinumCount,
        totalHours: stats.totalHours,
        gamesOwned: stats.gamesOwned,
        topGenres: stats.genreDistribution?.map(g => g.name) || ['Gamer'],
        compatibilityScore: 100,
        linkedAccounts: stats.linkedAccounts
      };
      setSelectedFriend(profile);
      setShowAddModal(false);
    }
  };

  const AddFriendModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-nexus-800 w-full max-w-xl rounded-3xl border border-nexus-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-nexus-700 flex justify-between items-center">
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Globe className="text-nexus-accent" /> Explorar Banco de Dados Nexus
          </h3>
          <button onClick={() => { setShowAddModal(false); setSearchResults([]); setSearchQuery(''); }} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <p className="text-xs text-gray-500 italic">Busque por qualquer Nexus ID que já tenha logado neste sistema para ver o que ele salvou.</p>
          <form onSubmit={handleSearchUsers} className="flex gap-2">
            <div className="flex-1 bg-nexus-900 border border-nexus-700 rounded-xl flex items-center px-4 py-3 focus-within:border-nexus-accent transition-colors">
              <Search className="text-gray-500 mr-3" size={20} />
              <input 
                type="text" 
                autoFocus
                placeholder="Pesquisar @usuario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white w-full font-medium"
              />
            </div>
            <button type="submit" disabled={isSearching} className="bg-nexus-accent hover:bg-nexus-accent/80 text-white px-6 rounded-xl font-bold transition-all disabled:opacity-50">
              {isSearching ? <Loader2 className="animate-spin" size={18} /> : "Buscar"}
            </button>
          </form>

          <div className="space-y-3">
            {searchResults.length > 0 ? (
              searchResults.map(result => {
                const isAlreadyFriend = friends.some(f => f.id === result.id);
                const isMe = result.nexusId === userStats?.nexusId;
                return (
                  <div key={result.id} className="bg-nexus-900/50 p-4 rounded-xl border border-nexus-700 flex items-center justify-between hover:bg-nexus-900 transition-all">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => openExternalProfile(result.nexusId)}>
                      <img src={result.avatarUrl} className="w-12 h-12 rounded-xl border border-nexus-700" />
                      <div>
                        <h4 className="font-bold text-white">{result.username}</h4>
                        <p className="text-xs text-nexus-secondary font-mono">{result.nexusId}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openExternalProfile(result.nexusId)} className="px-3 py-1.5 bg-nexus-800 hover:bg-nexus-700 text-white rounded-lg text-xs font-bold border border-nexus-700">Ver Perfil</button>
                      {!isMe && !isAlreadyFriend && (
                        <button 
                          onClick={() => addFriend(result)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-nexus-accent hover:bg-nexus-accent/80 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          <UserPlus size={14} /> Adicionar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              searchQuery && !isSearching && (
                <div className="text-center py-10">
                  <p className="text-gray-500 italic text-sm">Nenhum legado encontrado com este ID no Banco de Dados.</p>
                </div>
              )
            )}
            {!searchQuery && (
              <div className="text-center py-10 opacity-40">
                <Users size={48} className="mx-auto mb-3" />
                <p className="text-sm">Explore as contas reais cadastradas no Nexus.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (selectedFriend) {
    return <ProfileScreen profileData={selectedFriend} onClose={() => setSelectedFriend(null)} />;
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-nexus-700 pb-6 flex-shrink-0">
        <div>
           <h2 className="text-3xl font-display font-bold text-white">Centro de Conexões</h2>
           <p className="text-gray-400 text-sm">Explore dados reais de outros usuários do Nexus.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-nexus-accent text-white shadow-lg' : 'bg-nexus-800 text-gray-400 hover:text-white'}`}
            >
              Meus Amigos
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-nexus-accent text-white shadow-lg' : 'bg-nexus-800 text-gray-400 hover:text-white'}`}
            >
              Ranking Global
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-nexus-accent/10 text-nexus-accent border border-nexus-accent/20 rounded-lg hover:bg-nexus-accent/20 transition-all text-sm font-bold flex items-center gap-2 ml-2"
            >
              <Search size={16} /> Buscar Usuários
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {activeTab === 'list' && (
            <div className="grid gap-4 pb-8">
              {friends.length === 0 ? (
                <div className="text-center py-20 bg-nexus-800/20 border border-nexus-700 border-dashed rounded-3xl">
                  <Users size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-gray-500">Você ainda não segue nenhum legado. Use a busca para encontrar pessoas!</p>
                </div>
              ) : (
                friends.map((friend) => (
                  <div 
                     key={friend.id} 
                     onClick={() => openExternalProfile(friend.nexusId)}
                     className="bg-nexus-800 p-4 rounded-xl border border-nexus-700 flex items-center gap-4 hover:border-nexus-600 transition-all group cursor-pointer hover:shadow-lg hover:bg-nexus-700/50"
                  >
                    <img src={friend.avatarUrl} className="w-14 h-14 rounded-2xl object-cover border-2 border-nexus-700" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg truncate group-hover:text-nexus-accent transition-colors">{friend.username}</h3>
                      <p className="text-sm text-gray-500">{friend.nexusId}</p>
                    </div>
                    <div className="text-right hidden sm:block mr-4">
                      <div className="flex items-center justify-end gap-1.5 text-yellow-500">
                        <Trophy size={16} />
                        <span className="font-bold font-mono text-lg">{friend.totalTrophies}</span>
                      </div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                ))
              )}
            </div>
        )}

        {activeTab === 'leaderboard' && (
           <div className="space-y-4 pb-8">
               {sortedByTrophies.map((user, idx) => (
                   <div key={user.nexusId} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${idx === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-nexus-800 border-yellow-500/50 shadow-yellow-500/5' : 'bg-nexus-800 border-nexus-700'}`}>
                      <div className="w-10 font-display font-bold text-3xl text-gray-600 text-center">{idx + 1}</div>
                      <img src={user.avatarUrl} className="w-14 h-14 rounded-full border-2 border-white/5" />
                      <div className="flex-1">
                          <h3 className="font-bold text-white text-lg">{user.username} {user.nexusId === userStats?.nexusId && '(Você)'}</h3>
                          <div className="flex gap-4 text-xs text-gray-400 mt-1">
                              <span className="flex items-center gap-1"><Clock size={12}/> {user.totalHours}h</span>
                              <span className="flex items-center gap-1"><Medal size={12}/> {user.platinumCount} Platinas</span>
                          </div>
                      </div>
                      <div className="text-right px-4">
                          <span className="text-2xl font-bold font-display text-white">{user.totalTrophies}</span>
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
