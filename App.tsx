
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Users, Bot, Settings, LogOut, Compass, BarChart2, Grid, Trophy, User, Globe, History, Loader2, Lock, AtSign, AlertCircle, X, Sparkles, UserCircle, Home, Zap, MessageSquare, BrainCircuit, Info, Database, UserPlus, Check } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Friends } from './components/Friends';
import { DiscordBot } from './components/DiscordBot';
import { Settings as SettingsComponent } from './components/Settings';
import { GameSearch } from './components/GameSearch';
import { Statistics } from './components/Statistics';
import { GameLibrary } from './components/GameLibrary';
import { Achievements } from './components/Achievements';
import { NexusChronos } from './components/NexusChronos';
import { GlobalFeed } from './components/GlobalFeed';
import { NexusLab } from './components/NexusLab';
import { ProfileScreen } from './components/ProfileScreen';
import { NexusOracle } from './components/NexusOracle';
import { CloudExplorer } from './components/CloudExplorer';
import { AppProvider, useAppContext } from './context/AppContext';
import { nexusCloud } from './services/nexusCloud';
import { Friend } from './types';

const LoginScreen: React.FC = () => {
  const { login, signup } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [nexusId, setNexusId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
        if (mode === 'login') {
            await login(identifier, password);
        } else {
            // No cadastro, usamos o identifier como email
            await signup(identifier, password, nexusId);
            setSuccess('Conta criada com sucesso! Redirecionando...');
            setTimeout(() => {
               // O login é automático após o signup no AppContext
            }, 1500);
        }
    } catch (err: any) {
        setError(err.message || "Erro ao processar solicitação.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#050507] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1a1a2e,transparent)] opacity-50"></div>
      
      <div className="bg-nexus-900 p-8 md:p-10 rounded-[2.5rem] border border-nexus-800 shadow-2xl max-w-md w-full relative z-10 space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-nexus-accent to-nexus-secondary rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-nexus-accent/20 mb-4">
            <span className="font-display font-bold text-white text-2xl">N</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Nexus Alpha</h1>
          <p className="text-gray-500 text-sm italic">Sua jornada gamer imortalizada.</p>
        </div>

        <div className="space-y-6">
            <div className="flex bg-nexus-800 p-1 rounded-xl border border-nexus-700">
               <button 
                 onClick={() => { setMode('login'); setError(''); }}
                 className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
               >
                  Entrar
               </button>
               <button 
                 onClick={() => { setMode('signup'); setError(''); }}
                 className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
               >
                  Criar Conta
               </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  required 
                  type="email" 
                  placeholder="Seu E-mail" 
                  className="w-full bg-nexus-800 border border-nexus-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-nexus-accent outline-none" 
                  value={identifier} 
                  onChange={(e) => setIdentifier(e.target.value)} 
                />
              </div>

              {mode === 'signup' && (
                <div className="relative animate-fade-in">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    required 
                    type="text" 
                    placeholder="Nexus ID (ex: @nick)" 
                    className="w-full bg-nexus-800 border border-nexus-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-nexus-accent outline-none font-mono" 
                    value={nexusId} 
                    onChange={(e) => setNexusId(e.target.value)} 
                  />
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  required 
                  type="password" 
                  placeholder="Sua Senha" 
                  className="w-full bg-nexus-800 border border-nexus-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-nexus-accent outline-none" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs font-bold text-center flex items-center gap-2 justify-center animate-shake">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-500 text-xs font-bold text-center flex items-center gap-2 justify-center">
                  <Check size={14} /> {success}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-nexus-accent hover:bg-nexus-accent/90 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-nexus-accent/20 flex items-center justify-center gap-2 group"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    {mode === 'login' ? <Zap size={18} className="group-hover:scale-110" /> : <UserPlus size={18} className="group-hover:scale-110" />}
                    {mode === 'login' ? 'Acessar Nexus' : 'Finalizar Cadastro'}
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
               <p className="text-[10px] text-gray-600 uppercase tracking-widest leading-relaxed">
                  Sistema de Identidade Unificada <br/> Protegido por Nexus Alpha Protocol
               </p>
            </div>
        </div>
      </div>
    </div>
  );
};

const Navigation: React.FC<{ activeTab: string, onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => {
  const { logout } = useAppContext();
  
  const menuGroups = [
    {
      title: "Social",
      items: [
        { id: 'feed', icon: Home, label: 'Início' },
        { id: 'friends', icon: Users, label: 'Conexões' },
        { id: 'hall', icon: Database, label: 'Hall da Fama' },
        { id: 'discover', icon: Compass, label: 'Descobrir' },
      ]
    },
    {
      title: "Meu Legado",
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Meu Painel' },
        { id: 'profile', icon: UserCircle, label: 'Perfil Público' },
        { id: 'library', icon: Grid, label: 'Minha Biblioteca' },
        { id: 'chronos', icon: History, label: 'Nexus Chronos' },
      ]
    },
    {
      title: "Análise & Honra",
      items: [
        { id: 'oracle', icon: BrainCircuit, label: 'Oráculo' },
        { id: 'achievements', icon: Trophy, label: 'Conquistas' },
        { id: 'stats', icon: BarChart2, label: 'Estatísticas' },
      ]
    },
    {
      title: "Ecossistema",
      items: [
        { id: 'lab', icon: Sparkles, label: 'Nexus Lab' },
        { id: 'discord', icon: Bot, label: 'Discord Bot' },
      ]
    }
  ];

  return (
    <nav className="w-20 md:w-64 bg-nexus-900 border-r border-nexus-800 flex flex-col h-full overflow-hidden transition-all duration-300">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-nexus-accent rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-nexus-accent/20">
          <span className="text-white font-bold text-xl">N</span>
        </div>
        <span className="hidden md:block font-display font-bold text-xl text-white tracking-tighter">NEXUS</span>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 custom-scrollbar hide-scrollbar">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="hidden md:block text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] px-3">{group.title}</h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => onTabChange(item.id)} 
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${activeTab === item.id ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:bg-nexus-800 hover:text-white'}`}
                >
                  <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                  <span className="hidden md:block text-sm font-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-nexus-800 mt-auto space-y-1">
        <button onClick={() => onTabChange('settings')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-nexus-800 text-white' : 'text-gray-500 hover:text-white'}`}>
          <Settings size={20} />
          <span className="hidden md:block text-sm font-bold">Configurações</span>
        </button>
        <button onClick={logout} className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all group">
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="hidden md:block text-sm font-bold">Deslogar</span>
        </button>
      </div>
    </nav>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <AppProvider>
      <AppContextConsumer activeTab={activeTab} setActiveTab={setActiveTab} />
    </AppProvider>
  );
}

function AppContextConsumer({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  const { userStats, isInitializing } = useAppContext();

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#050507] gap-4">
        <Loader2 className="animate-spin text-nexus-accent" size={48} />
        <p className="text-gray-500 font-mono text-xs animate-pulse uppercase tracking-widest">Nexus System Booting...</p>
      </div>
    );
  }

  if (!userStats) return <LoginScreen />;

  const myProfileData: Friend = {
    id: userStats.nexusId,
    nexusId: userStats.nexusId,
    username: userStats.nexusId.replace('@', ''),
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats.nexusId}`,
    status: 'online',
    totalTrophies: userStats.totalAchievements,
    platinumCount: userStats.platinumCount,
    totalHours: userStats.totalHours,
    gamesOwned: userStats.gamesOwned,
    topGenres: userStats.genreDistribution?.map(g => g.name) || ['Gamer'],
    compatibilityScore: 100,
    linkedAccounts: userStats.linkedAccounts
  };

  return (
    <div className="flex h-screen bg-[#050507] text-gray-100 overflow-hidden font-sans">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full w-full overflow-hidden">
            {activeTab === 'feed' && <GlobalFeed />}
            {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
            {activeTab === 'profile' && <ProfileScreen profileData={myProfileData} isOwnProfile={true} />}
            {activeTab === 'library' && <GameLibrary />}
            {activeTab === 'achievements' && <Achievements />}
            {activeTab === 'chronos' && <NexusChronos />}
            {activeTab === 'friends' && <Friends />}
            {activeTab === 'discover' && <GameSearch />}
            {activeTab === 'stats' && <Statistics />}
            {activeTab === 'lab' && <NexusLab />}
            {activeTab === 'hall' && <CloudExplorer />}
            {activeTab === 'discord' && <DiscordBot />}
            {activeTab === 'settings' && <SettingsComponent />}
            {activeTab === 'oracle' && <NexusOracle />}
        </div>
      </main>
    </div>
  );
}
