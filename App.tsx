
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, LogOut, Compass, BarChart2, Grid, 
  Trophy, Loader2, Lock, AtSign, UserCircle, 
  Zap, Database, Activity, BrainCircuit, Settings as SettingsIcon, 
  MessageSquare, Bell, Box, BookOpen, Play, Menu, Home, Search,
  ChevronUp, X, LayoutGrid, Gavel, Shield, ChevronRight, ChevronLeft,
  CircleDot, Plus, Share2, Target, MousePointer2, Layout
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
  
  // NAV STATES
  const [isRadialOpen, setIsRadialOpen] = useState(false);
  const [isVerticalMenuOpen, setIsVerticalMenuOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [touchPos, setTouchPos] = useState({ x: 0, y: 0 });
  const [centerPos, setCenterPos] = useState({ x: 0, y: 0 });
  
  const radialButtonRef = useRef<HTMLButtonElement>(null);

  const menuItems = useMemo(() => [
    { id: 'pulse', label: 'Pulse', icon: Activity, desc: 'Feed Global' },
    { id: 'chat', label: 'Chat', icon: MessageSquare, desc: 'Comunidade' },
    { id: 'friends', label: 'Social', icon: Users, desc: 'Guerreiros' },
    { id: 'profile', label: 'DNA', icon: UserCircle, desc: 'Meu Legado' },
    { id: 'achievements', label: 'Troféus', icon: Trophy, desc: 'Feitos' },
    { id: 'library', label: 'Biblioteca', icon: Grid, desc: 'Meus Jogos' },
    { id: 'oracle', label: 'IA', icon: BrainCircuit, desc: 'Oráculo' },
    { id: 'discover', label: 'Explorar', icon: Compass, desc: 'Busca AI' },
    { id: 'vault', label: 'Cofre', icon: Box, desc: 'Físico' },
    { id: 'auctions', label: 'Leilões', icon: Gavel, desc: 'Mercado' },
    { id: 'notifications', label: 'Alertas', icon: Bell, desc: 'Nexus Pulse' },
    { id: 'settings', label: 'Ajustes', icon: SettingsIcon, desc: 'Core Setup' },
    { id: 'logout', label: 'Sair', icon: LogOut, desc: 'Desconectar', action: logout },
  ], [logout]);

  useEffect(() => {
    if (userStats) {
      const poll = async () => {
        const notifs = await nexusCloud.getNotifications(userStats.nexusId);
        setUnreadCount(notifs.filter(n => !n.read).length);
      };
      poll();
      const interval = setInterval(poll, 30000);
      return () => clearInterval(interval);
    }
  }, [userStats]);

  // RADIAL HANDLERS
  const handleRadialStart = (e: React.TouchEvent | React.MouseEvent) => {
    const pos = 'touches' in e ? e.touches[0] : (e as any);
    if (radialButtonRef.current) {
      const rect = radialButtonRef.current.getBoundingClientRect();
      setCenterPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
    setIsRadialOpen(true);
    setActiveIdx(null);
    updateRadialSelection(pos.clientX, pos.clientY);
  };

  const updateRadialSelection = (clientX: number, clientY: number) => {
    setTouchPos({ x: clientX, y: clientY });
    const dx = clientX - centerPos.x;
    const dy = clientY - centerPos.y;
    const dist = Math.hypot(dx, dy);
    
    if (dist < 40) {
      setActiveIdx(null);
      return;
    }

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    const step = 360 / menuItems.length;
    const idx = Math.floor(angle / step);
    setActiveIdx(idx);
  };

  const handleRadialMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isRadialOpen) return;
    const pos = 'touches' in e ? e.touches[0] : (e as any);
    updateRadialSelection(pos.clientX, pos.clientY);
  };

  const handleRadialEnd = () => {
    if (!isRadialOpen) return;
    if (activeIdx !== null) {
      const item = menuItems[activeIdx];
      if (item.action) item.action();
      else setActiveTab(item.id);
    }
    setIsRadialOpen(false);
    setActiveIdx(null);
  };

  const navigateTo = (id: string, action?: () => void) => {
    if (action) action();
    else setActiveTab(id);
    setIsVerticalMenuOpen(false);
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

  return (
    <div 
      className="flex h-screen w-screen bg-[#050507] text-white overflow-hidden font-sans select-none touch-none"
      onMouseMove={handleRadialMove}
      onMouseUp={handleRadialEnd}
      onTouchMove={handleRadialMove}
      onTouchEnd={handleRadialEnd}
    >
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-nexus-900 border-r border-nexus-800 flex-col shrink-0 h-full z-50">
        <div className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-nexus-accent to-nexus-secondary rounded-2xl flex items-center justify-center shadow-2xl cursor-pointer" onClick={() => setActiveTab('pulse')}>
            <span className="font-display font-bold text-white text-2xl">N</span>
          </div>
          <div><h2 className="font-display font-bold text-xl tracking-tighter">NEXUS</h2><p className="text-[8px] font-black text-nexus-accent uppercase tracking-widest">Sovereign Legacy</p></div>
        </div>
        <nav className="flex-1 px-3 space-y-6 overflow-y-auto custom-scrollbar pt-4">
           <div className="space-y-1">
             {menuItems.slice(0, 11).map(item => (
                <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} active={activeTab} onClick={setActiveTab} />
             ))}
           </div>
        </nav>
        <div className="p-4 border-t border-nexus-800 space-y-2">
          <NavItem id="settings" icon={SettingsIcon} label="Ajustes" active={activeTab} onClick={setActiveTab} />
          <button onClick={logout} className="w-full flex items-center gap-4 p-3 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"><LogOut size={20} /><span className="font-bold text-xs">Sair</span></button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden relative flex flex-col bg-[#050507] h-full">
        {isSyncing && (
          <div className="absolute top-4 right-4 z-[100] animate-fade-in">
             <div className="bg-nexus-900/90 backdrop-blur-xl border border-nexus-accent/40 px-4 py-2 rounded-xl flex items-center gap-3 shadow-2xl">
                <Loader2 size={14} className="animate-spin text-nexus-accent" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Sync...</span>
             </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
           {renderContent()}
           <div className="md:hidden h-32 w-full"></div>
        </div>

        {/* MOBILE RADIAL OVERLAY */}
        {isRadialOpen && (
           <div className="md:hidden fixed inset-0 z-[200] flex items-center justify-center animate-fade-in pointer-events-none">
              <div className="absolute inset-0 bg-black/85 backdrop-blur-3xl"></div>
              <div className="relative w-80 h-80 flex items-center justify-center">
                 <div 
                    className="absolute w-1 h-32 bg-gradient-to-t from-nexus-accent/0 to-nexus-accent origin-bottom transition-transform duration-100 ease-out"
                    style={{ 
                        transform: `rotate(${Math.atan2(touchPos.y - centerPos.y, touchPos.x - centerPos.x) * (180 / Math.PI) + 90}deg)`,
                        left: 'calc(50% - 2px)',
                        bottom: '50%'
                    }}
                 ><div className="w-4 h-4 bg-white rounded-full absolute -top-2 left-1/2 -translate-x-1/2 shadow-[0_0_15px_#fff]"></div></div>
                 <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100">
                    {menuItems.map((_, i) => {
                       const step = 360 / menuItems.length;
                       const start = i * step;
                       const end = (i + 1) * step;
                       const isFocused = activeIdx === i;
                       const x1 = 50 + 48 * Math.cos(Math.PI * start / 180);
                       const y1 = 50 + 48 * Math.sin(Math.PI * start / 180);
                       const x2 = 50 + 48 * Math.cos(Math.PI * end / 180);
                       const y2 = 50 + 48 * Math.sin(Math.PI * end / 180);
                       const x3 = 50 + 35 * Math.cos(Math.PI * end / 180);
                       const y3 = 50 + 35 * Math.sin(Math.PI * end / 180);
                       const x4 = 50 + 35 * Math.cos(Math.PI * start / 180);
                       const y4 = 50 + 35 * Math.sin(Math.PI * start / 180);
                       return <path key={i} d={`M ${x1} ${y1} A 48 48 0 0 1 ${x2} ${y2} L ${x3} ${y3} A 35 35 0 0 0 ${x4} ${y4} Z`} fill={isFocused ? "rgba(139, 92, 246, 0.4)" : "rgba(255, 255, 255, 0.03)"} stroke={isFocused ? "#8b5cf6" : "rgba(255, 255, 255, 0.05)"} strokeWidth="0.3" className="transition-all duration-200" />;
                    })}
                 </svg>
                 {menuItems.map((item, i) => {
                    const step = 360 / menuItems.length;
                    const angle = i * step + (step / 2);
                    const isFocused = activeIdx === i;
                    const radius = isFocused ? 125 : 110;
                    const x = Math.cos(angle * Math.PI / 180) * radius;
                    const y = Math.sin(angle * Math.PI / 180) * radius;
                    return (
                       <div key={i} className={`absolute transition-all duration-300 flex flex-col items-center gap-1.5 ${isFocused ? 'scale-125 z-50' : 'opacity-40'}`} style={{ transform: `translate(${x}px, ${y}px)` }}>
                          <div className={`p-3 rounded-2xl border-2 transition-all ${isFocused ? 'bg-nexus-accent border-white text-white shadow-[0_0_30px_rgba(139,92,246,0.8)]' : 'bg-nexus-900 border-white/10 text-gray-400'}`}><item.icon size={22} /></div>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded backdrop-blur-md ${isFocused ? 'bg-white text-black' : 'bg-black/40 text-gray-500'}`}>{item.label}</span>
                       </div>
                    );
                 })}
                 <div className="w-24 h-24 rounded-full bg-nexus-900 border-4 border-nexus-accent flex flex-col items-center justify-center shadow-2xl z-10"><span className="font-display font-black text-2xl text-white">N</span></div>
              </div>
           </div>
        )}

        {/* MOBILE VERTICAL MENU (DRAWER) OVERLAY */}
        {isVerticalMenuOpen && (
           <div className="md:hidden fixed inset-0 z-[250] flex flex-col animate-fade-in">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsVerticalMenuOpen(false)}></div>
              <div className="mt-auto bg-nexus-900 border-t border-nexus-700 rounded-t-[3rem] p-6 pb-12 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] relative z-[260] translate-y-0 transition-transform duration-500 ease-out">
                 <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-8"></div>
                 <div className="flex items-center justify-between mb-8 px-4">
                    <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                       <LayoutGrid className="text-nexus-accent" /> Navegação
                    </h2>
                    <button onClick={() => setIsVerticalMenuOpen(false)} className="p-3 bg-nexus-800 rounded-2xl text-gray-400"><X size={20}/></button>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-3">
                    {menuItems.map(item => (
                       <button 
                         key={item.id} 
                         onClick={() => navigateTo(item.id, item.action)}
                         className={`flex flex-col items-center justify-center p-5 rounded-[2rem] border transition-all ${activeTab === item.id ? 'bg-nexus-accent border-nexus-accent shadow-lg shadow-nexus-accent/20' : 'bg-nexus-800/50 border-nexus-800 hover:bg-nexus-800'}`}
                       >
                          <item.icon size={24} className={activeTab === item.id ? 'text-white' : 'text-nexus-accent'} />
                          <span className="text-[10px] font-black uppercase tracking-tighter mt-2 text-white">{item.label}</span>
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        )}

        {/* HYBRID MOBILE CONTROLS */}
        <div className="md:hidden fixed bottom-10 inset-x-0 flex items-center justify-center gap-6 z-[210]">
           {/* Botão Gatilho Radial (Esquerda) */}
           <button 
             ref={radialButtonRef}
             onMouseDown={handleRadialStart}
             onTouchStart={handleRadialStart}
             className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_40px_rgba(139,92,246,0.3)] border-2 ${
               isRadialOpen ? 'scale-0 opacity-0' : 'bg-nexus-900 text-nexus-accent border-nexus-accent/40 active:scale-90 active:bg-nexus-accent active:text-white'
             }`}
           >
              <Target size={24} strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-full animate-ping bg-nexus-accent/5 pointer-events-none"></div>
           </button>

           {/* Botão Gatilho Vertical (Direita) */}
           <button 
             onClick={() => setIsVerticalMenuOpen(true)}
             className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_40px_rgba(6,182,212,0.3)] border-2 ${
               isRadialOpen ? 'scale-0 opacity-0' : 'bg-nexus-900 text-nexus-secondary border-nexus-secondary/40 active:scale-90 active:bg-nexus-secondary active:text-white'
             }`}
           >
              <Layout size={24} strokeWidth={2.5} />
           </button>
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ id: string, icon: any, label: string, active: string, onClick: (id: string) => void }> = ({ id, icon: Icon, label, active, onClick }) => (
  <button 
    onClick={() => onClick(id)} 
    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all group ${
      active === id ? 'bg-nexus-accent text-white shadow-xl shadow-nexus-accent/20' : 'text-gray-400 hover:bg-nexus-800/60 hover:text-gray-300'
    }`}
  >
    <Icon size={18} className={`transition-all ${active === id ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="font-bold text-xs tracking-tight">{label}</span>
  </button>
);

const AppContent: React.FC = () => {
  const { userStats, isInitializing } = useAppContext();
  if (isInitializing) return (
    <div className="h-screen bg-[#050507] flex flex-col items-center justify-center gap-6">
      <div className="relative"><Loader2 className="animate-spin text-nexus-accent" size={48} /><div className="absolute inset-0 bg-nexus-accent blur-3xl opacity-20"></div></div>
      <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Handshake...</p>
    </div>
  );
  return userStats ? <MainApp /> : <LoginScreen />;
};

const App: React.FC = () => (
  <AppProvider><AppContent /></AppProvider>
);

export default App;
