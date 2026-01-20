
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Bot, Settings, LogOut, Compass, BarChart2, Grid, Box, Trophy, User, Zap, Mail, LogIn, ArrowRight, Globe, Beaker, History, Info, Loader2, Lock, AtSign, UserPlus } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Friends } from './components/Friends';
import { DiscordBot } from './components/DiscordBot';
import { Settings as SettingsComponent } from './components/Settings';
import { GameSearch } from './components/GameSearch';
import { Statistics } from './components/Statistics';
import { GameLibrary } from './components/GameLibrary';
import { Collection } from './components/Collection';
import { Achievements } from './components/Achievements';
import { ProfileScreen } from './components/ProfileScreen';
import { GlobalFeed } from './components/GlobalFeed';
import { NexusLab } from './components/NexusLab';
import { NexusChronos } from './components/NexusChronos';
import { AppProvider, useAppContext } from './context/AppContext';
import { Friend } from './types';
import { decodeProfileFromSharing } from './services/shareService';
import { nexusCloud } from './services/nexusCloud';

const LoginScreen: React.FC = () => {
  const { login, signup } = useAppContext();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nexusId, setNexusId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!nexusId.startsWith('@')) {
          setError('O Nexus ID deve começar com @');
          setLoading(false);
          return;
        }
        await signup(email, password, nexusId);
      }
    } catch (err: any) {
      setError(err.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#050507] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-nexus-accent/10 blur-[120px] rounded-full"></div>
      <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-nexus-secondary/10 blur-[120px] rounded-full"></div>

      <div className="bg-nexus-900 p-8 md:p-10 rounded-[2.5rem] border border-nexus-800 shadow-2xl max-w-md w-full relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-nexus-accent to-nexus-secondary rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-nexus-accent/20 mb-4">
            <span className="font-display font-bold text-3xl text-white">N</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Nexus Alpha</h1>
          <p className="text-gray-500 text-sm italic">Onde seu legado é imortalizado.</p>
        </div>

        <div className="flex bg-nexus-800 p-1 rounded-xl border border-nexus-700">
          <button 
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${mode === 'login' ? 'bg-nexus-900 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            Login
          </button>
          <button 
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${mode === 'signup' ? 'bg-nexus-900 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            Cadastro
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                required
                type="email" 
                placeholder="E-mail" 
                className="w-full bg-nexus-800 border border-nexus-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-nexus-accent outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                required
                type="password" 
                placeholder="Senha" 
                className="w-full bg-nexus-800 border border-nexus-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-nexus-accent outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-1 animate-fade-in">
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  required
                  type="text" 
                  placeholder="Seu Nexus ID (ex: @gamer)" 
                  className="w-full bg-nexus-800 border border-nexus-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-nexus-accent outline-none transition-all font-mono"
                  value={nexusId}
                  onChange={(e) => setNexusId(e.target.value)}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-center gap-2 animate-pulse">
               <Info size={14} /> {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-nexus-accent hover:bg-nexus-accent/90 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-nexus-accent/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                {mode === 'login' ? 'Acessar Nexus' : 'Criar Legado'}
              </>
            )}
          </button>
        </form>

        <div className="text-center">
           <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
              Protegido por Criptografia de Ponta-a-Ponta
           </p>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { userStats, currentUser, logout, isLoading } = useAppContext();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'friends' | 'discord' | 'settings' | 'discover' | 'statistics' | 'library' | 'collection' | 'achievements' | 'profile' | 'feed' | 'lab' | 'chronos'>('dashboard');
  const [sharedProfile, setSharedProfile] = useState<Friend | null>(null);
  const [isResolvingLink, setIsResolvingLink] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get('user');
      if (userId) {
        setIsResolvingLink(true);
        try {
          const stats = await nexusCloud.getUser(userId);
          if (stats) {
            setSharedProfile({
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
            });
            setActiveTab('profile');
          }
        } catch (e) {
          console.error("Link resolution failed", e);
        } finally {
          setIsResolvingLink(false);
        }
      }
    };

    resolveParams();
  }, []);

  if (isLoading || isResolvingLink) return (
    <div className="h-screen bg-[#050507] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-nexus-accent" size={48} />
      <p className="text-nexus-accent font-bold animate-pulse text-xs uppercase tracking-widest">Acessando Nuvem Nexus...</p>
    </div>
  );

  if (!currentUser || !userStats) return <LoginScreen />;

  const myProfileData: Friend = {
    id: 'me',
    nexusId: userStats.nexusId,
    username: userStats.nexusId,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats.nexusId}`,
    status: 'online',
    totalTrophies: userStats.totalAchievements,
    platinumCount: userStats.platinumCount,
    totalHours: userStats.totalHours,
    gamesOwned: userStats.gamesOwned,
    topGenres: userStats.genreDistribution.map(g => g.name),
    compatibilityScore: 0,
    linkedAccounts: userStats.linkedAccounts
  };

  const displayProfile = sharedProfile || myProfileData;

  return (
    <div className="flex h-screen bg-[#050507] text-gray-100 font-sans overflow-hidden">
      <aside className="w-20 lg:w-64 bg-nexus-900 border-r border-nexus-800 flex flex-col justify-between flex-shrink-0 transition-all duration-300">
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-nexus-accent to-nexus-secondary rounded-lg flex items-center justify-center shadow-lg shadow-nexus-accent/20">
              <span className="font-display font-bold text-white">N</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight hidden lg:block text-white">Nexus</span>
          </div>

          <nav className="mt-4 px-3 space-y-1">
            <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavButton active={activeTab === 'chronos'} onClick={() => setActiveTab('chronos')} icon={<History size={20} />} label="Nexus Chronos" />
            <NavButton active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} icon={<Globe size={20} />} label="Feed Global" />
            <NavButton active={activeTab === 'lab'} onClick={() => setActiveTab('lab')} icon={<Beaker size={20} />} label="Nexus Lab" />
            
            <div className="pt-4 pb-2 px-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden lg:block">Meu Legado</span>
            </div>
            
            <NavButton active={activeTab === 'profile'} onClick={() => { setSharedProfile(null); setActiveTab('profile'); }} icon={<User size={20} />} label="Perfil" />
            <NavButton active={activeTab === 'library'} onClick={() => setActiveTab('library')} icon={<Grid size={20} />} label="Biblioteca" />
            <NavButton active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} icon={<Trophy size={20} />} label="Conquistas" />
            <NavButton active={activeTab === 'collection'} onClick={() => setActiveTab('collection')} icon={<Box size={20} />} label="Coleção" />
            
            <div className="pt-4 pb-2 px-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden lg:block">Universo</span>
            </div>
            
            <NavButton active={activeTab === 'statistics'} onClick={() => setActiveTab('statistics')} icon={<BarChart2 size={20} />} label="Estatísticas" />
            <NavButton active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} icon={<Compass size={20} />} label="Descobrir" />
            <NavButton active={activeTab === 'friends'} onClick={() => setActiveTab('friends')} icon={<Users size={20} />} label="Amigos" />
            <NavButton active={activeTab === 'discord'} onClick={() => setActiveTab('discord')} icon={<Bot size={20} />} label="Discord Bot" />
          </nav>
        </div>
        
        <div className="p-3 mb-4 space-y-2 flex-shrink-0">
           <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} label="Configurações" />
           <div className="border-t border-nexus-800 my-2 mx-2"></div>
           <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-nexus-800/50 transition-all group">
             <LogOut size={20} />
             <span className="hidden lg:block font-medium text-sm">Sair</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-[#050507]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        
        {sharedProfile && (
           <div className="sticky top-0 z-[60] bg-nexus-accent text-white py-2 px-4 text-center font-bold text-xs flex items-center justify-center gap-4 animate-fade-in shadow-xl">
              <Info size={14} /> Você está visualizando o legado de {sharedProfile.username}
              <button 
                onClick={() => { 
                  setSharedProfile(null); 
                  window.history.replaceState({}, '', window.location.pathname); 
                  setActiveTab('dashboard');
                }}
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors border border-white/20"
              >
                Voltar ao meu Nexus
              </button>
           </div>
        )}

        <div className="relative z-10 h-full">
           {activeTab === 'dashboard' && <Dashboard onNavigate={(tab) => setActiveTab(tab as any)} />}
           {activeTab === 'feed' && <GlobalFeed />}
           {activeTab === 'lab' && <NexusLab />}
           {activeTab === 'chronos' && <NexusChronos />}
           {activeTab === 'library' && <GameLibrary />}
           {activeTab === 'collection' && <Collection />}
           {activeTab === 'statistics' && <Statistics />}
           {activeTab === 'friends' && <Friends />}
           {activeTab === 'discord' && <DiscordBot />}
           {activeTab === 'settings' && <SettingsComponent />}
           {activeTab === 'discover' && <GameSearch />}
           {activeTab === 'achievements' && <Achievements />}
           {activeTab === 'profile' && <ProfileScreen profileData={displayProfile} isOwnProfile={!sharedProfile} />}
        </div>
      </main>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-nexus-800 text-white shadow-lg border border-nexus-700' 
        : 'text-gray-400 hover:text-white hover:bg-nexus-800/50'
    }`}
  >
    <div className={`${active ? 'text-nexus-accent' : 'group-hover:text-nexus-secondary transition-colors'}`}>
      {icon}
    </div>
    <span className="hidden lg:block font-medium text-sm">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-nexus-accent hidden lg:block shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>}
  </button>
);

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
