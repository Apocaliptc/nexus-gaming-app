
import React, { useState, useEffect } from 'react';
import { 
  Users, LogOut, Compass, BarChart2, Grid, 
  Trophy, Loader2, Lock, AtSign, UserCircle, 
  Zap, Database, Activity, BrainCircuit, Settings as SettingsIcon, 
  MessageSquare, Bell, Box, BookOpen, Play, Menu, Home, Search,
  ChevronUp, X, LayoutGrid, Gavel, Shield, ChevronRight
} from 'lucide-react';
import { Friends } from './components/Friends';
import { Settings } from './components/Settings';
import { GameSearch } from './components/GameSearch';
import { Statistics } from './components/Statistics';
import { GameLibrary } from './components/GameLibrary';
import { Achievements } from './components/Achievements';
import { NexusChronos } from './components/NexusChronos';
import { GlobalFeed } from './components/GlobalFeed';
import { NexusOracle } from './components/NexusOracle';
import { ProfileView } from './components/ProfileView';
import { NexusChat } from './components/NexusChat';
import { NotificationCenter } from './components/NotificationCenter';
import { Auctions } from './components/Auctions';
import { Collection } from './components/Collection';
import { AppProvider, useAppContext } from './context/AppContext';
import { nexusCloud } from './services/nexusCloud';

const LoginScreen: React.FC = () => {
  const { login, signup, isLoading } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nexusId, setNexusId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, nexusId);
      }
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação');
    }
  };

  return (
    <div className="h-screen bg-[#050507] flex items-center justify-center p-4 text-gray-100 overflow-hidden font-sans">
      <div className="w-full max-w-md bg-nexus-900 border border-nexus-800 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl space-y-8 animate-fade-in relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-nexus-accent/10 blur-[60px] rounded-full"></div>
        <div className="text-center space-y-4">
           <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-nexus-accent to-nexus-secondary rounded-[1.5rem] md:rounded-[2rem] mx-auto flex items-center justify-center text-white font-bold text-3xl shadow-2xl shadow-nexus-accent/20 mb-4">N</div>
           <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tighter uppercase">NEXUS</h1>
           <p className="text-gray-500 text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-black">Eternizing Your Gaming DNA</p>
        </div>
        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs text-center animate-pulse">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
           {!isLogin && (
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-3">Nexus ID</label>
                <div className="relative">
                   <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                   <input required value={nexusId} onChange={e => setNexusId(e.target.value)} type="text" placeholder="seu-nick" className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:border-nexus-accent outline-none" />
                </div>
             </div>
           )}
           <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-3">E-mail</label>
              <div className="relative">
                 <input required value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="nome@exemplo.com" className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-6 py-4 text-sm text-white focus:border-nexus-accent outline-none" />
              </div>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-3">Senha</label>
              <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                 <input required value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:border-nexus-accent outline-none" />
              </div>
           </div>
           <button disabled={isLoading} type="submit" className="w-full py-5 bg-nexus-accent hover:bg-nexus-accent/80 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-nexus-accent/30 flex items-center justify-center gap-3">
              {isLoading ? <Loader2 className="animate-spin" /> : isLogin ? 'Sincronizar Acesso' : 'Eternizar Perfil'}
           </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-[10px] text-gray-600 font-black uppercase tracking-widest hover:text-white">
           {isLogin ? "Reivindicar um novo ID" : "Já possuo um Perfil"}
        </button>
      </div>
    </div>
  );
};

const MainApp: React.FC = () => {
  const { logout, userStats, isSyncing } = useAppContext();
  const [activeTab, setActiveTab] = useState('pulse');
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  useEffect(() => {
    if (userStats) {
      const pollNotifs = async () => {
        try {
          const notifs = await nexusCloud.getNotifications(userStats.nexusId);
          setUnreadCount(notifs.filter(n => !n.read).length);
        } catch (e) {}
      };
      pollNotifs();
      const interval = setInterval(pollNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [userStats]);

  const toggleGroup = (group: string) => {
    if (activeGroup === group) setActiveGroup(null);
    else setActiveGroup(group);
  };

  const selectTab = (tab: string) => {
    setActiveTab(tab);
    setActiveGroup(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'pulse': return <GlobalFeed />;
      case 'profile': return <ProfileView onNavigate={setActiveTab} />;
      case 'notifications': return <NotificationCenter onReadUpdate={setUnreadCount} />;
      case 'chat': return <NexusChat />;
      case 'library': return <GameLibrary />;
      case 'vault': return <Collection />;
      case 'achievements': return <Achievements />;
      case 'stats': return <Statistics />;
      case 'oracle': return <NexusOracle />;
      case 'chronos': return <NexusChronos />;
      case 'discover': return <GameSearch />;
      case 'friends': return <Friends />;
      case 'auctions': return <Auctions />;
      case 'settings': return <Settings />;
      default: return <GlobalFeed />;
    }
  };

  const mobileMenuGroups = {
    pulse: {
      title: 'Nexus Pulse',
      items: [
        { id: 'pulse', label: 'Pulse Global', icon: Activity },
        { id: 'chat', label: 'Comunicações', icon: MessageSquare },
        { id: 'friends', label: 'Conexões', icon: Users },
      ]
    },
    digital: {
      title: 'Patrimônio Digital',
      items: [
        { id: 'profile', label: 'Perfil & DNA', icon: UserCircle },
        { id: 'achievements', label: 'Conquistas', icon: Trophy },
        { id: 'library', label: 'Biblioteca', icon: Grid },
        { id: 'stats', label: 'Analytics', icon: BarChart2 },
      ]
    },
    legacy: {
      title: 'Legacy Hub',
      items: [
        { id: 'vault', label: 'Coleção Física', icon: Box },
        { id: 'auctions', label: 'Mercado de Leilões', icon: Gavel },
      ]
    },
    intel: {
      title: 'Inteligência Nexus',
      items: [
        { id: 'oracle', label: 'Nexus Oracle IA', icon: BrainCircuit },
        { id: 'discover', label: 'Explorar Mundos', icon: Compass },
        { id: 'chronos', label: 'Diário Chronos', icon: BookOpen },
      ]
    },
    config: {
      title: 'Sistema Soberano',
      items: [
        { id: 'notifications', label: 'Central de Alertas', icon: Bell, badge: unreadCount },
        { id: 'settings', label: 'Ajustes de Conta', icon: SettingsIcon },
        { id: 'logout', label: 'Sair do Nexus', icon: LogOut, action: logout, color: 'text-red-500' },
      ]
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#050507] text-white overflow-hidden font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-nexus-900 border-r border-nexus-800 flex-col transition-all duration-300 relative z-50 shrink-0 h-full">
        <div className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-nexus-accent to-nexus-secondary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl cursor-pointer" onClick={() => setActiveTab('pulse')}>
            <span className="font-display font-bold text-white text-2xl">N</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl tracking-tighter leading-none">NEXUS</h2>
            <p className="text-[8px] font-black text-nexus-accent uppercase tracking-widest">Sovereign Legacy</p>
          </div>
        </div>

        <div className="px-4 mb-6">
           <button 
             onClick={() => setActiveTab('profile')}
             className={`w-full flex items-center gap-4 p-3 rounded-[1.5rem] transition-all group border-2 ${activeTab === 'profile' ? 'bg-nexus-accent border-nexus-accent text-white shadow-2xl scale-105' : 'bg-nexus-800/40 border-nexus-700 text-gray-500 hover:border-nexus-accent hover:bg-nexus-800/80'}`}
           >
             <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/10 shrink-0 relative">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats?.nexusId}`} className="w-full h-full object-cover" alt="Avatar" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-nexus-900 shadow-lg"></div>
             </div>
             <div className="text-left">
                <p className="font-black text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white/80">Meu Legado</p>
                <p className="font-bold text-sm text-white truncate">{userStats?.nexusId.replace('@', '')}</p>
             </div>
           </button>
        </div>

        <nav className="flex-1 px-3 space-y-8 overflow-y-auto custom-scrollbar pt-2">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3 px-3">Nexus Pulse</p>
            <NavItem id="pulse" icon={Activity} label="Pulse Global" active={activeTab} onClick={selectTab} />
            <NavItem id="chat" icon={MessageSquare} label="Comunicações" active={activeTab} onClick={selectTab} />
            <NavItem id="friends" icon={Users} label="Conexões" active={activeTab} onClick={selectTab} />
          </div>

          <div className="space-y-1">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3 px-3">Patrimônio Digital</p>
            <NavItem id="profile" icon={UserCircle} label="Perfil & DNA" active={activeTab} onClick={selectTab} />
            <NavItem id="achievements" icon={Trophy} label="Conquistas" active={activeTab} onClick={selectTab} />
            <NavItem id="library" icon={Grid} label="Biblioteca" active={activeTab} onClick={selectTab} />
            <NavItem id="stats" icon={BarChart2} label="Analytics" active={activeTab} onClick={selectTab} />
          </div>

          <div className="space-y-1">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3 px-3">Físico & Hardware</p>
            <NavItem id="vault" icon={Box} label="Coleção" active={activeTab} onClick={selectTab} />
            <NavItem id="auctions" icon={Play} label="Leilões" active={activeTab} onClick={selectTab} />
          </div>

          <div className="space-y-1">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3 px-3">Inteligência</p>
            <NavItem id="oracle" icon={BrainCircuit} label="Nexus Oracle" active={activeTab} onClick={selectTab} />
            <NavItem id="discover" icon={Compass} label="Explorar" active={activeTab} onClick={selectTab} />
            <NavItem id="chronos" icon={BookOpen} label="Chronos" active={activeTab} onClick={selectTab} />
          </div>
        </nav>

        <div className="p-4 bg-nexus-900 border-t border-nexus-800 space-y-3 shrink-0">
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all relative ${
              activeTab === 'notifications' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-500 hover:bg-nexus-800/50 hover:text-white'
            }`}
          >
             <Bell size={20} />
             <span className="font-bold text-xs">Alertas</span>
             {unreadCount > 0 && (
                <div className="absolute right-3 top-3 w-5 h-5 bg-red-600 rounded-lg flex items-center justify-center text-[8px] font-black border-2 border-nexus-900 shadow-xl">
                   {unreadCount}
                </div>
             )}
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${
              activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-nexus-800/50'
            }`}
          >
             <SettingsIcon size={20} />
             <span className="font-bold text-xs">Ajustes</span>
          </button>

          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 p-3 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-bold text-xs">Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden relative flex flex-col bg-[#050507] h-full">
        {/* Syncing Indicator */}
        {isSyncing && (
          <div className="absolute top-4 right-4 md:top-6 md:right-8 z-[100] animate-fade-in">
             <div className="bg-nexus-900/90 backdrop-blur-xl border border-nexus-accent/40 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl flex items-center gap-3 shadow-2xl shadow-nexus-accent/10">
                <Loader2 size={14} className="animate-spin text-nexus-accent" />
                <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.2em]">Sincronizando...</span>
             </div>
          </div>
        )}
        
        {/* ÁREA DE CONTEÚDO COM SCROLL ÚNICO */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative pb-32 md:pb-0">
           {renderContent()}
        </div>

        {/* MOBILE HUB MENU (Redesenhado para não cortar em nenhuma tela) */}
        {activeGroup && (
           <>
            <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[101] animate-fade-in" onClick={() => setActiveGroup(null)}></div>
            <div className="md:hidden fixed bottom-[90px] left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-lg bg-nexus-900/98 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 z-[102] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] animate-fade-in origin-bottom overflow-hidden box-border">
               <div className="flex items-center justify-between mb-5 px-1 border-b border-white/5 pb-3">
                  <div className="space-y-0.5">
                     <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Protocolo de Acesso</p>
                     <h4 className="text-xs font-display font-bold text-nexus-accent uppercase tracking-[0.1em]">{(mobileMenuGroups as any)[activeGroup].title}</h4>
                  </div>
                  <button onClick={() => setActiveGroup(null)} className="p-2 bg-white/5 rounded-full text-gray-400"><X size={18} /></button>
               </div>
               
               <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto no-scrollbar">
                  {(mobileMenuGroups as any)[activeGroup].items.map((item: any) => (
                     <button 
                       key={item.id}
                       onClick={() => item.action ? item.action() : selectTab(item.id)}
                       className={`flex items-center justify-between w-full p-4 rounded-2xl border transition-all active:scale-[0.97] ${activeTab === item.id ? 'bg-nexus-accent/20 border-nexus-accent/40 shadow-xl' : 'bg-nexus-800/40 border-white/5'}`}
                     >
                        <div className="flex items-center gap-4 min-w-0">
                           <div className={`p-2.5 rounded-xl flex-shrink-0 ${activeTab === item.id ? 'bg-nexus-accent text-white' : 'bg-nexus-900 text-gray-500'}`}>
                              <item.icon size={20} />
                           </div>
                           <div className="text-left min-w-0">
                              <span className={`block text-xs font-bold truncate ${activeTab === item.id ? 'text-white' : 'text-gray-300'}`}>{item.label}</span>
                              {item.badge !== undefined && item.badge > 0 && <span className="text-[7px] font-black text-nexus-accent uppercase">{item.badge} Pendente(s)</span>}
                           </div>
                        </div>
                        <ChevronRight size={16} className={activeTab === item.id ? 'text-nexus-accent' : 'text-gray-700'} />
                     </button>
                  ))}
               </div>
            </div>
           </>
        )}

        {/* Bottom Nav Mobile - Flutuante e Seguro */}
        <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md bg-[#09090b]/85 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] px-1 py-2 flex justify-around items-center z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.9)] box-border">
           <MobileHubItem icon={Activity} label="Pulse" group="pulse" active={activeGroup === 'pulse'} onClick={() => toggleGroup('pulse')} />
           <MobileHubItem icon={Trophy} label="Patrimônio" group="digital" active={activeGroup === 'digital'} onClick={() => toggleGroup('digital')} />
           <MobileHubItem icon={BrainCircuit} label="Oráculo" group="intel" active={activeGroup === 'intel'} onClick={() => toggleGroup('intel')} />
           <MobileHubItem icon={Box} label="Legacy" group="legacy" active={activeGroup === 'legacy'} onClick={() => toggleGroup('legacy')} />
           <MobileHubItem icon={UserCircle} label="Sistema" group="config" active={activeGroup === 'config'} onClick={() => toggleGroup('config')} />
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ id, icon: Icon, label, active, onClick }: { id: string, icon: any, label: string, active: string, onClick: (id: string) => void }) => (
  <button 
    onClick={() => onClick(id)} 
    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all group ${
      active === id ? 'bg-nexus-accent text-white shadow-xl shadow-nexus-accent/20' : 'text-gray-400 hover:bg-nexus-800 hover:text-gray-300'
    }`}
  >
    <Icon size={20} className={`transition-all ${active === id ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="font-bold text-xs tracking-tight">{label}</span>
  </button>
);

const MobileHubItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, group: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-full transition-all flex flex-col items-center justify-center relative min-w-[60px] ${active ? 'bg-nexus-accent/15 text-nexus-accent' : 'text-gray-500'}`}
  >
    <Icon size={22} className={`${active ? 'scale-110 transition-transform drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]' : ''}`} />
    <span className={`text-[7px] font-black uppercase mt-1 tracking-tighter ${active ? 'text-nexus-accent' : 'text-gray-600'}`}>{label}</span>
    {active && (
       <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-nexus-accent rounded-full animate-pulse shadow-[0_0_8px_#8b5cf6]"></div>
    )}
  </button>
);

const AppContent: React.FC = () => {
  const { userStats, isInitializing } = useAppContext();
  
  if (isInitializing) {
    return (
      <div className="h-screen bg-[#050507] flex flex-col items-center justify-center gap-6">
        <div className="relative">
           <Loader2 className="animate-spin text-nexus-accent" size={48} />
           <div className="absolute inset-0 bg-nexus-accent blur-3xl opacity-20"></div>
        </div>
        <p className="text-gray-500 font-mono text-[10px] md:text-xs uppercase tracking-[0.5em] animate-pulse">Handshaking Core...</p>
      </div>
    );
  }

  return userStats ? <MainApp /> : <LoginScreen />;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
