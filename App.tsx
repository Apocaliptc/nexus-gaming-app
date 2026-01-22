
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, LogOut, Compass, BarChart2, Grid, 
  Trophy, Loader2, Lock, AtSign, AlertCircle, X, UserCircle, 
  Zap, Database, Activity, BrainCircuit, Settings as SettingsIcon, 
  Server, Copy, Check, History, Globe, User, ShieldCheck, MessageSquare,
  Bell
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Friends } from './components/Friends';
import { Settings } from './components/Settings';
import { GameSearch } from './components/GameSearch';
import { Statistics } from './components/Statistics';
import { GameLibrary } from './components/GameLibrary';
import { Achievements } from './components/Achievements';
import { NexusChronos } from './components/NexusChronos';
import { GlobalFeed } from './components/GlobalFeed';
import { NexusOracle } from './components/NexusOracle';
import { CloudExplorer } from './components/CloudExplorer';
import { ProfileScreen } from './components/ProfileScreen';
import { NexusChat } from './components/NexusChat';
import { NotificationCenter } from './components/NotificationCenter';
import { AppProvider, useAppContext } from './context/AppContext';
import { nexusCloud } from './services/nexusCloud';

const SQL_HELP_SCRIPT = `-- SCRIPT DE RESET TOTAL E SOBERANO
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  nexus_id text UNIQUE NOT NULL,
  stats jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  to_nexus_id text NOT NULL,
  from_nexus_id text NOT NULL,
  from_name text NOT NULL,
  from_avatar text NOT NULL,
  content text NOT NULL,
  vibe text NOT NULL,
  timestamp timestamp with time zone DEFAULT now()
);

CREATE TABLE chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id text NOT NULL,
  sender_id text NOT NULL,
  sender_name text NOT NULL,
  sender_avatar text NOT NULL,
  content text NOT NULL,
  timestamp timestamp with time zone DEFAULT now()
);

CREATE TABLE notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" text NOT NULL,
  type text NOT NULL,
  "fromId" text NOT NULL,
  "fromName" text NOT NULL,
  "fromAvatar" text NOT NULL,
  content text NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  read boolean DEFAULT false
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso Publico Profiles" ON profiles FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Publico Testimonials" ON testimonials FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Publico Chat" ON chat_messages FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Publico Notifications" ON notifications FOR ALL TO anon USING (true) WITH CHECK (true);`;

const LoginScreen: React.FC = () => {
  const { login, signup } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [nexusId, setNexusId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(identifier, password);
      } else {
        await signup(identifier, password, nexusId);
      }
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o Nexus Core.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#050507] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a1a2e,transparent)] opacity-50"></div>
      
      <div className="bg-nexus-900 p-10 rounded-[3rem] border border-nexus-800 shadow-2xl max-w-md w-full relative z-10 space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-gradient-to-tr from-nexus-accent to-nexus-secondary rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-nexus-accent/20 mb-4">
            <span className="font-display font-bold text-white text-4xl tracking-tighter">N</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tighter uppercase">Nexus</h1>
          <p className="text-gray-500 text-sm italic">Sintonize seu legado gamer.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input required type="email" placeholder="E-mail" value={identifier} onChange={e => setIdentifier(e.target.value)} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-nexus-accent outline-none transition-all placeholder:text-gray-600" />
            </div>
            
            {mode === 'signup' && (
              <div className="relative animate-fade-in">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input required type="text" placeholder="@NexusID" value={nexusId} onChange={e => setNexusId(e.target.value)} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-nexus-accent outline-none transition-all placeholder:text-gray-600" />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input required type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-nexus-accent outline-none transition-all placeholder:text-gray-600" />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-xs flex gap-2 animate-fade-in">
              <AlertCircle size={16} className="shrink-0" /> <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full py-4 bg-nexus-accent hover:bg-nexus-accent/80 text-white font-bold rounded-2xl transition-all shadow-xl shadow-nexus-accent/30 flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
            {mode === 'login' ? 'Acessar Nexus' : 'Criar Conta'}
          </button>
        </form>

        <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="w-full text-center text-gray-500 hover:text-white text-sm transition-colors">
          {mode === 'login' ? 'Novo por aqui? Criar Legado' : 'Já possui um Nexus ID? Entrar'}
        </button>
      </div>
    </div>
  );
};

const MainApp: React.FC = () => {
  const { logout, userStats, isSyncing } = useAppContext();
  const [activeTab, setActiveTab] = useState('pulse');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (userStats) {
      const pollNotifs = async () => {
        const notifs = await nexusCloud.getNotifications(userStats.nexusId);
        setUnreadCount(notifs.filter(n => !n.read).length);
      };
      pollNotifs();
      const interval = setInterval(pollNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [userStats]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
      case 'profile': return userStats ? <ProfileScreen profileData={{
        id: userStats.nexusId, nexusId: userStats.nexusId, username: userStats.nexusId.replace('@', ''), avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats.nexusId}`, status: 'online', totalTrophies: userStats.totalAchievements, platinumCount: userStats.platinumCount, totalHours: userStats.totalHours, gamesOwned: userStats.gamesOwned, topGenres: [], compatibilityScore: 100
      }} isOwnProfile={true} /> : null;
      case 'notifications': return <NotificationCenter onReadUpdate={setUnreadCount} />;
      case 'chat': return <NexusChat />;
      case 'library': return <GameLibrary />;
      case 'achievements': return <Achievements />;
      case 'stats': return <Statistics />;
      case 'pulse': return <GlobalFeed />;
      case 'oracle': return <NexusOracle />;
      case 'chronos': return <NexusChronos />;
      case 'discover': return <GameSearch />;
      case 'friends': return <Friends />;
      case 'cloud': return <CloudExplorer />;
      case 'settings': return <Settings />;
      default: return <GlobalFeed />;
    }
  };

  const navItems = [
    { id: 'pulse', icon: Activity, label: 'Feed Pulse' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel' },
    { id: 'profile', icon: User, label: 'Meu Perfil' },
    { id: 'notifications', icon: Bell, label: 'Alertas', badge: unreadCount },
    { id: 'chat', icon: MessageSquare, label: 'Comms' },
    { id: 'library', icon: Grid, label: 'Biblioteca' },
  ];

  const exploreItems = [
    { id: 'achievements', icon: Trophy, label: 'Conquistas' },
    { id: 'discover', icon: Compass, label: 'Crawler' },
    { id: 'friends', icon: Users, label: 'Conexões' },
    { id: 'chronos', icon: History, label: 'Chronos' },
    { id: 'oracle', icon: BrainCircuit, label: 'Oráculo' },
  ];

  const systemItems = [
    { id: 'cloud', icon: Database, label: 'Hall Cloud' },
    { id: 'settings', icon: SettingsIcon, label: 'Ajustes' },
  ];

  return (
    <div className="flex h-screen bg-[#050507] text-white overflow-hidden">
      <aside className="w-24 md:w-64 bg-nexus-900 border-r border-nexus-800 flex flex-col transition-all duration-300 relative z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-nexus-accent to-nexus-secondary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-nexus-accent/20">
            <span className="font-display font-bold text-white text-xl">N</span>
          </div>
          <span className="font-display font-bold text-2xl tracking-tighter hidden md:block">NEXUS</span>
        </div>

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4 px-4 hidden md:block">Comando</p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group relative ${
                  activeTab === item.id 
                    ? 'bg-nexus-accent text-white shadow-xl shadow-nexus-accent/20' 
                    : 'text-gray-500 hover:bg-nexus-800 hover:text-gray-300'
                }`}
              >
                <item.icon size={22} className={activeTab === item.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                <span className="font-bold text-sm hidden md:block">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <div className="absolute right-3 top-3 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-nexus-900 shadow-lg">
                    {item.badge}
                  </div>
                )}
                {activeTab === item.id && <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full hidden md:block"></div>}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4 px-4 hidden md:block">Explorar</p>
            {exploreItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group relative ${
                  activeTab === item.id 
                    ? 'bg-nexus-accent text-white shadow-xl shadow-nexus-accent/20' 
                    : 'text-gray-500 hover:bg-nexus-800 hover:text-gray-300'
                }`}
              >
                <item.icon size={22} />
                <span className="font-bold text-sm hidden md:block">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4 px-4 hidden md:block">Sistema</p>
            {systemItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group relative ${
                  activeTab === item.id 
                    ? 'bg-nexus-accent text-white shadow-xl shadow-nexus-accent/20' 
                    : 'text-gray-500 hover:bg-nexus-800 hover:text-gray-300'
                }`}
              >
                <item.icon size={22} />
                <span className="font-bold text-sm hidden md:block">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-6 bg-nexus-900 border-t border-nexus-800 space-y-4">
          {userStats && (
            <div className="hidden md:flex items-center gap-3 p-3 bg-nexus-800 rounded-2xl border border-nexus-700">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nexus-accent/40 to-nexus-secondary/40 flex items-center justify-center text-white font-bold border border-white/5">
                  {userStats.nexusId.charAt(1).toUpperCase()}
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{userStats.nexusId}</p>
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 bg-nexus-success rounded-full animate-pulse"></div>
                     <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Nuvem Online</p>
                  </div>
               </div>
            </div>
          )}
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 p-3.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"
          >
            <LogOut size={22} />
            <span className="font-bold text-sm hidden md:block">Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden relative flex flex-col bg-[#050507]">
        {isSyncing && (
          <div className="absolute top-6 right-8 z-[100] animate-fade-in">
             <div className="bg-nexus-900/80 backdrop-blur-xl border border-nexus-accent/30 px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-2xl">
                <Loader2 size={16} className="animate-spin text-nexus-accent" />
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Sincronizando Legado...</span>
             </div>
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

const AppContent: React.FC = () => {
  const { currentUser, isInitializing } = useAppContext();

  if (isInitializing) {
    return (
      <div className="h-screen bg-[#050507] flex flex-col items-center justify-center gap-8">
        <div className="w-24 h-24 bg-gradient-to-tr from-nexus-accent to-nexus-secondary rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-nexus-accent/20 animate-bounce">
          <span className="font-display font-bold text-white text-5xl tracking-tighter">N</span>
        </div>
        <div className="space-y-3 text-center">
           <p className="text-nexus-accent font-mono text-xs uppercase tracking-[0.5em] animate-pulse">Sintonizando frequências do Nexus...</p>
           <div className="w-48 h-1 bg-nexus-900 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-nexus-accent animate-[loading_2s_ease-in-out_infinite]"></div>
           </div>
        </div>
      </div>
    );
  }

  return currentUser ? <MainApp /> : <LoginScreen />;
};

export default App;
