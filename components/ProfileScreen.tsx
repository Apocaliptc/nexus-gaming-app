
import React, { useState, useMemo } from 'react';
import { Friend, Game, CollectionItem, UserStats } from '../types';
import { MOCK_USER_STATS, MOCK_GAMES, MOCK_DISCOVER_GAMES, MOCK_COLLECTION } from '../services/mockData';
import { GameDetailView } from './GameDetailView';
import { NexusIDCard } from './NexusIDCard';
import { ChevronLeft, Trophy, Crown, Zap, MessageSquare, Swords, LayoutDashboard, Grid, Box, Medal, Clock, Link as LinkIcon, Copy, Gamepad2, Sparkles } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { useAppContext } from '../context/AppContext';

interface ProfileProps {
  profileData: Friend;
  isOwnProfile?: boolean;
  onClose?: () => void;
  onChallenge?: () => void;
}

export const ProfileScreen: React.FC<ProfileProps> = ({ profileData, isOwnProfile = false, onClose, onChallenge }) => {
  const { userStats } = useAppContext();
  const [profileTab, setProfileTab] = useState<'overview' | 'games' | 'collection' | 'achievements'>('overview');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const gamesList = useMemo(() => {
    if (isOwnProfile) return MOCK_USER_STATS.recentGames;
    const allMockGames = [...MOCK_GAMES, ...MOCK_DISCOVER_GAMES];
    return allMockGames.filter((_, i) => (profileData.id.charCodeAt(0) + i) % 2 === 0).slice(0, 12);
  }, [isOwnProfile, profileData]);

  const collectionList = useMemo(() => {
    if (isOwnProfile) return MOCK_COLLECTION.filter(i => i.ownerId === 'me');
    return MOCK_COLLECTION.filter(i => i.ownerId === profileData.id);
  }, [isOwnProfile, profileData]);

  const nexusLevel = Math.max(1, Math.floor(Math.sqrt((profileData.totalTrophies * 10) + (profileData.platinumCount * 200)) / 15));

  const stats = useMemo(() => {
      let platinum = 0, gold = 0, silver = 0, bronze = 0;
      gamesList.forEach(game => {
           const total = game.achievementCount;
           if (game.title === 'Elden Ring') platinum += 1;
           const g = Math.floor(total * 0.1);
           const s = Math.floor(total * 0.25);
           const b = total - g - s;
           gold += g; silver += s; bronze += b;
      });
      if (platinum < profileData.platinumCount) platinum = profileData.platinumCount;
      const nextLevelScore = Math.pow((nexusLevel + 1) * 15, 2);
      const currentLevelScore = Math.pow(nexusLevel * 15, 2);
      const currentScoreApprox = currentLevelScore + ((nextLevelScore - currentLevelScore) * 0.45);
      const progress = ((currentScoreApprox - currentLevelScore) / (nextLevelScore - currentLevelScore)) * 100;
      return { platinum, gold, silver, bronze, progress };
  }, [gamesList, profileData, nexusLevel]);

  if (selectedGame) {
      return (
          <div className="h-full w-full relative z-50">
              <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} />
          </div>
      );
  }

  return (
    <div className="h-full w-full bg-[#050507] animate-fade-in relative overflow-y-auto custom-scrollbar">
      {onClose && (
        <div className="fixed top-6 left-6 z-50">
            <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-xl rounded-full text-white transition-all border border-white/10 font-bold text-sm shadow-2xl group">
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                <span className="hidden sm:inline">Voltar</span>
            </button>
        </div>
      )}

      <div className="relative">
          <div className="h-64 md:h-80 w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/60 to-transparent z-20"></div>
              <div className={`absolute inset-0 opacity-60 bg-gradient-to-br ${
                  profileData.topGenres[0] === 'RPG' ? 'from-purple-900 via-indigo-900 to-black' : 
                  profileData.topGenres[0] === 'FPS' ? 'from-emerald-900 via-teal-900 to-black' :
                  'from-blue-900 via-slate-900 to-black'
              }`}></div>
          </div>

          <div className="px-6 md:px-10 -mt-24 relative z-30 flex flex-col md:flex-row items-end gap-8 pb-8">
              <div className="relative group">
                  <div className={`w-36 h-36 md:w-48 md:h-48 rounded-[2rem] border-4 border-[#050507] bg-nexus-800 shadow-2xl overflow-hidden relative z-10 ${
                      profileData.status === 'online' ? 'shadow-[0_0_40px_rgba(34,197,94,0.2)]' : 
                      profileData.status === 'ingame' ? 'shadow-[0_0_40px_rgba(139,92,246,0.2)]' : ''
                  }`}>
                      <img src={profileData.avatarUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 z-20">
                      <div className="relative bg-gradient-to-br from-nexus-800 to-black border border-nexus-700 p-1.5 rounded-2xl shadow-xl flex flex-col items-center min-w-[70px]">
                          <span className="text-[9px] font-bold text-nexus-accent uppercase tracking-widest mb-0.5">Level</span>
                          <span className="text-3xl font-display font-bold text-white leading-none">{nexusLevel}</span>
                      </div>
                  </div>
              </div>

              <div className="flex-1 pb-2 w-full">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                      <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight drop-shadow-lg">{profileData.username}</h2>
                      <div className="flex gap-2">
                        {isOwnProfile && <span className="px-2 py-1 bg-nexus-accent text-white text-[10px] font-bold rounded uppercase tracking-wider shadow-lg shadow-nexus-accent/20">YOU</span>}
                        <span className="text-nexus-secondary text-xs font-mono bg-nexus-secondary/10 px-2 py-1 rounded border border-nexus-secondary/20 backdrop-blur-sm">{profileData.nexusId}</span>
                      </div>
                  </div>
              </div>

              {!isOwnProfile && (
                  <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none py-3 px-6 bg-nexus-accent hover:bg-nexus-accent/80 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group">
                        <MessageSquare size={18} /> Chat
                    </button>
                    <button onClick={onChallenge} className="flex-1 md:flex-none py-3 px-6 bg-nexus-800 hover:bg-nexus-700 border border-nexus-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                        <Swords size={18} /> Desafiar
                    </button>
                  </div>
              )}
          </div>
      </div>

      <div className="sticky top-0 z-40 bg-[#050507]/90 backdrop-blur-xl border-y border-nexus-800 shadow-2xl">
          <div className="px-6 md:px-10 flex gap-8 overflow-x-auto custom-scrollbar scrollbar-hide">
            <button onClick={() => setProfileTab('overview')} className={`py-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${profileTab === 'overview' ? 'border-nexus-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                <LayoutDashboard size={16} /> Visão Geral
            </button>
            <button onClick={() => setProfileTab('achievements')} className={`py-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${profileTab === 'achievements' ? 'border-nexus-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                <Trophy size={16} /> Conquistas
            </button>
            <button onClick={() => setProfileTab('games')} className={`py-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${profileTab === 'games' ? 'border-nexus-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                <Grid size={16} /> Jogos
            </button>
          </div>
      </div>

      <div className="p-6 md:p-10 min-h-[500px]">
          {profileTab === 'overview' && (
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent text-[10px] font-bold uppercase tracking-widest">
                            <Sparkles size={12} /> Cartão de Identidade Soberana
                        </div>
                        <h3 className="text-3xl font-display font-bold text-white leading-tight">Sua história unificada em um único <span className="text-nexus-accent">Social Card.</span></h3>
                        <p className="text-gray-400 text-lg">Este card é a prova do seu legado. Ele resume suas conquistas através de todas as plataformas e pode ser compartilhado em qualquer rede social.</p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-gray-300"><div className="w-1.5 h-1.5 rounded-full bg-nexus-accent"></div> Verificado via Blockchain do Nexus</li>
                            <li className="flex items-center gap-3 text-gray-300"><div className="w-1.5 h-1.5 rounded-full bg-nexus-accent"></div> Metadados dinâmicos baseados em IA</li>
                            <li className="flex items-center gap-3 text-gray-300"><div className="w-1.5 h-1.5 rounded-full bg-nexus-accent"></div> Reconhecido por todas as comunidades</li>
                        </ul>
                    </div>
                    <div>
                        {userStats && <NexusIDCard stats={userStats} insight={null} />}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-nexus-800 p-8 rounded-3xl border border-nexus-700 shadow-xl space-y-6">
                    <h4 className="text-xl font-bold text-white flex items-center gap-2"><Clock className="text-nexus-secondary" size={24} /> Atividade Vitalícia</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-nexus-900 p-4 rounded-2xl border border-nexus-700">
                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Playtime</p>
                            <p className="text-2xl font-mono text-white font-bold">{profileData.totalHours}h</p>
                        </div>
                        <div className="bg-nexus-900 p-4 rounded-2xl border border-nexus-700">
                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Games Owned</p>
                            <p className="text-2xl font-mono text-white font-bold">{profileData.gamesOwned}</p>
                        </div>
                    </div>
                  </div>
                  
                  <div className="bg-nexus-800 p-8 rounded-3xl border border-nexus-700 shadow-xl space-y-6">
                    <h4 className="text-xl font-bold text-white flex items-center gap-2"><Trophy className="text-yellow-500" size={24} /> Especialidades</h4>
                    <div className="flex flex-wrap gap-2">
                        {profileData.topGenres.map(genre => (
                            <span key={genre} className="px-4 py-2 bg-nexus-900 border border-nexus-700 rounded-xl text-xs font-bold text-gray-300">{genre}</span>
                        ))}
                    </div>
                  </div>
                </div>
            </div>
          )}

          {profileTab === 'achievements' && (
              <div className="space-y-8 pb-10 max-w-6xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-nexus-900 to-nexus-800 p-6 rounded-2xl border border-nexus-700 shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                          <div className="relative z-10">
                              <div className="w-24 h-24 rounded-full border-4 border-nexus-accent bg-nexus-900 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                                  <Crown size={40} className="text-nexus-accent" />
                              </div>
                              <h2 className="text-4xl font-display font-bold text-white">{nexusLevel}</h2>
                              <p className="text-xs font-bold text-nexus-accent uppercase tracking-widest mb-4">Nexus Level</p>
                              <div className="w-48 h-2 bg-nexus-900 rounded-full overflow-hidden border border-nexus-700">
                                  <div className="h-full bg-nexus-accent" style={{ width: `${stats.progress}%` }}></div>
                              </div>
                          </div>
                      </div>

                      <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-nexus-800 p-4 rounded-2xl border border-nexus-700 flex flex-col items-center justify-center gap-2">
                              <Trophy size={32} className="text-yellow-400" />
                              <span className="text-2xl font-bold text-white">{stats.platinum}</span>
                              <span className="text-xs text-gray-500 font-bold uppercase">Platinum</span>
                          </div>
                          <div className="bg-nexus-800 p-4 rounded-2xl border border-nexus-700 flex flex-col items-center justify-center gap-2">
                              <Medal size={32} className="text-yellow-200" />
                              <span className="text-2xl font-bold text-white">{stats.gold}</span>
                              <span className="text-xs text-gray-500 font-bold uppercase">Gold</span>
                          </div>
                          <div className="bg-nexus-800 p-4 rounded-2xl border border-nexus-700 flex flex-col items-center justify-center gap-2">
                              <Medal size={32} className="text-gray-400" />
                              <span className="text-2xl font-bold text-white">{stats.silver}</span>
                              <span className="text-xs text-gray-500 font-bold uppercase">Silver</span>
                          </div>
                          <div className="bg-nexus-800 p-4 rounded-2xl border border-nexus-700 flex flex-col items-center justify-center gap-2">
                              <Medal size={32} className="text-orange-700" />
                              <span className="text-2xl font-bold text-white">{stats.bronze}</span>
                              <span className="text-xs text-gray-500 font-bold uppercase">Bronze</span>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {profileTab === 'games' && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-10 max-w-6xl mx-auto">
              {gamesList.map(game => (
                <div key={game.id} onClick={() => setSelectedGame(game)} className="bg-nexus-800 border border-nexus-700 rounded-xl overflow-hidden group hover:border-nexus-500 hover:shadow-xl transition-all flex flex-col hover:-translate-y-1 cursor-pointer">
                    <div className="h-40 relative overflow-hidden">
                      <img src={game.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-nexus-800 to-transparent opacity-60"></div>
                      <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-white text-[10px] font-bold border border-white/10 uppercase flex items-center gap-1.5 backdrop-blur-sm">
                        <PlatformIcon platform={game.platform} className="w-3.5 h-3.5" /> {game.platform}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className="font-bold text-white text-md truncate mb-1" title={game.title}>{game.title}</h4>
                      <div className="flex items-center justify-between mt-auto">
                         <span className="text-xs text-gray-500 flex items-center gap-1">
                           <Trophy size={12} className="text-yellow-500" /> {game.totalAchievements}
                         </span>
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
