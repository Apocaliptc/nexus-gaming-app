
import React, { useState, useEffect, useMemo } from 'react';
import { Friend, Game, UserStats } from '../types';
import { nexusCloud } from '../services/nexusCloud';
import { GameDetailView } from './GameDetailView';
import { NexusIDCard } from './NexusIDCard';
import { ChevronLeft, Trophy, Crown, MessageSquare, Swords, LayoutDashboard, Grid, Clock, Medal, Sparkles, Loader2 } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { useAppContext } from '../context/AppContext';

interface ProfileProps {
  profileData: Friend;
  isOwnProfile?: boolean;
  onClose?: () => void;
  onChallenge?: () => void;
}

export const ProfileScreen: React.FC<ProfileProps> = ({ profileData, isOwnProfile: isOwnProfileProp, onClose, onChallenge }) => {
  const { userStats: currentUserStats } = useAppContext();
  const [profileTab, setProfileTab] = useState<'overview' | 'games'>('overview');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [fullUserStats, setFullUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = isOwnProfileProp || (currentUserStats?.nexusId === profileData.nexusId);

  useEffect(() => {
    const loadFullData = async () => {
      setIsLoading(true);
      const data = await nexusCloud.getUser(profileData.nexusId);
      setFullUserStats(data);
      setIsLoading(false);
    };
    loadFullData();
  }, [profileData.nexusId]);

  const nexusLevel = useMemo(() => {
    if (!fullUserStats) return 1;
    return Math.max(1, Math.floor(Math.sqrt((fullUserStats.totalAchievements * 10) + (fullUserStats.platinumCount * 200)) / 15));
  }, [fullUserStats]);

  if (isLoading) {
    return <div className="h-full flex items-center justify-center bg-[#050507]"><Loader2 className="animate-spin text-nexus-accent" size={48} /></div>;
  }

  if (selectedGame) {
    return <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} isOwner={isOwnProfile} />;
  }

  const displayStats = fullUserStats || (isOwnProfile ? currentUserStats : null);

  return (
    <div className="h-full w-full bg-[#050507] animate-fade-in relative overflow-y-auto custom-scrollbar">
      {onClose && (
        <div className="fixed top-6 left-6 z-50">
            <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-xl rounded-full text-white transition-all border border-white/10 font-bold text-sm shadow-2xl group">
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar
            </button>
        </div>
      )}

      <div className="relative">
          <div className="h-64 md:h-80 w-full relative overflow-hidden bg-gradient-to-br from-nexus-900 to-black">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay z-10"></div>
          </div>

          <div className="px-6 md:px-10 -mt-24 relative z-30 flex flex-col md:flex-row items-end gap-8 pb-8">
              <div className="relative">
                  <div className="w-36 h-36 md:w-48 md:h-48 rounded-[2rem] border-4 border-[#050507] bg-nexus-800 shadow-2xl overflow-hidden">
                      <img src={profileData.avatarUrl} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 z-20">
                      <div className="bg-nexus-800 border border-nexus-700 p-2 rounded-2xl shadow-xl flex flex-col items-center min-w-[70px]">
                          <span className="text-[9px] font-bold text-nexus-accent uppercase mb-0.5">Level</span>
                          <span className="text-3xl font-display font-bold text-white leading-none">{nexusLevel}</span>
                      </div>
                  </div>
              </div>

              <div className="flex-1 pb-2 w-full">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                      <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">{profileData.username}</h2>
                      <div className="flex gap-2">
                        {isOwnProfile && <span className="px-2 py-1 bg-nexus-accent text-white text-[10px] font-bold rounded uppercase">MEU PERFIL</span>}
                        <span className="text-nexus-secondary text-xs font-mono bg-nexus-secondary/10 px-2 py-1 rounded border border-nexus-secondary/20">{profileData.nexusId}</span>
                      </div>
                  </div>
              </div>

              {!isOwnProfile && (
                  <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none py-3 px-6 bg-nexus-accent text-white font-bold rounded-xl shadow-lg">Chat</button>
                    <button onClick={onChallenge} className="flex-1 md:flex-none py-3 px-6 bg-nexus-800 border border-nexus-600 text-white font-bold rounded-xl">Desafiar</button>
                  </div>
              )}
          </div>
      </div>

      <div className="sticky top-0 z-40 bg-[#050507]/90 backdrop-blur-xl border-y border-nexus-800">
          <div className="px-6 md:px-10 flex gap-8">
            <button onClick={() => setProfileTab('overview')} className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${profileTab === 'overview' ? 'border-nexus-accent text-white' : 'border-transparent text-gray-500'}`}>Visão Geral</button>
            <button onClick={() => setProfileTab('games')} className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${profileTab === 'games' ? 'border-nexus-accent text-white' : 'border-transparent text-gray-500'}`}>Jogos Sincronizados</button>
          </div>
      </div>

      <div className="p-6 md:p-10">
          {profileTab === 'overview' && displayStats && (
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h3 className="text-3xl font-display font-bold text-white leading-tight">Legado de <span className="text-nexus-accent">{profileData.username}</span></h3>
                        <p className="text-gray-400 text-lg">Visualizando dados reais recuperados da Nuvem Nexus.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-nexus-800 p-6 rounded-3xl border border-nexus-700">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-2">Horas Totais</p>
                                <p className="text-3xl font-mono text-white font-bold">{displayStats.totalHours}h</p>
                            </div>
                            <div className="bg-nexus-800 p-6 rounded-3xl border border-nexus-700">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-2">Conquistas</p>
                                <p className="text-3xl font-mono text-white font-bold">{displayStats.totalAchievements}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <NexusIDCard stats={displayStats} insight={null} />
                    </div>
                </div>
            </div>
          )}

          {profileTab === 'games' && displayStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10 max-w-6xl mx-auto">
              {displayStats.recentGames.map(game => (
                <div key={game.id} onClick={() => setSelectedGame(game)} className="bg-nexus-800 border border-nexus-700 rounded-xl overflow-hidden group hover:border-nexus-accent transition-all cursor-pointer">
                    <div className="h-40 relative">
                      <img src={game.coverUrl} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-[10px] font-bold border border-white/10 flex items-center gap-1.5">
                        <PlatformIcon platform={game.platform} className="w-3.5 h-3.5" /> {game.platform}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-white truncate mb-1">{game.title}</h4>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{game.hoursPlayed}h jogadas</span>
                        <span className="text-nexus-secondary">{Math.round((game.achievementCount/game.totalAchievements)*100)}%</span>
                      </div>
                    </div>
                </div>
              ))}
              {displayStats.recentGames.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-500 italic">Este usuário ainda não sincronizou jogos com o Nexus.</div>
              )}
            </div>
          )}
      </div>
    </div>
  );
};
