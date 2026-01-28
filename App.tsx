
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, LogOut, Compass, BarChart2, Grid, 
  Trophy, Loader2, Lock, AtSign, UserCircle, 
  Zap, Database, Activity, BrainCircuit, Settings as SettingsIcon, 
  MessageSquare, Bell, Box, BookOpen, Play, Menu, Home, Search,
  ChevronUp, X, LayoutGrid, Gavel, Shield, ChevronRight, ChevronLeft,
  CircleDot, Plus, Share2, Target, MousePointer2, Layout, Sparkles, Monitor,
  ShoppingBag, MessagesSquare, Tag, FileCode, Store
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
import { SetupMaster } from './components/SetupMaster';
import { NexusForum } from './components/NexusForum';
import { LootMarket } from './components/LootMarket';
import { NexusMarket } from './components/NexusMarket';
import { NexusBlueprint } from './components/NexusBlueprint';
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
                   <input required value={nexusId} onChange={(e) => setNexusId(e.target.value)} type="text" placeholder="seu-nick" className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:border-nexus-accent outline-none" />
                </div>
             </div>
           )}
           <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3">E-mail</label>
              <div className="relative">
                 <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="nome@exemplo.com" className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-6 py-4 text-sm text-white focus:border-nexus-accent outline-none" />
              </div>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3">Senha</label>
              <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                 <input required value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:border-nexus-accent outline-none" />
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

  // MENU COMPLETO
  const fullMenuItems = useMemo(() => [
    { id: 'pulse', label: 'Pulse', icon: Activity, category: 'Core Hub' },
    { id: 'profile', label: 'DNA', icon: UserCircle, category: 'Core Hub' },
    { id: 'friends', label: 'Social', icon: Users, category: 'Core Hub' },
    { id: 'chat', label: 'Chat', icon: MessageSquare, category: 'Core Hub' },
    
    { id: 'library', label: 'Biblioteca', icon: Grid, category: 'Legado Digital' },
    { id: 'achievements', label: 'Troféus', icon: Trophy, category: 'Legado Digital' },
    { id: 'stats', label: 'Analytics', icon: BarChart2, category: 'Legado Digital' },
    { id: 'discover', label: 'Explorar', icon: Compass, category: 'Legado Digital' },
    { id: 'oracle', label: 'IA Oracle', icon: BrainCircuit, category: 'Legado Digital' },

    { id: 'forum', label: 'Nexus Forum', icon: MessagesSquare, category: 'Comunidade' },
    { id: 'market', label: 'Nexus Market', icon: Store, category: 'Comunidade' },
    { id: 'auctions', label: 'Leilões', icon: Gavel, category: 'Comunidade' },
    { id: 'loot', label: 'Loot Market', icon: ShoppingBag, category: 'Comunidade' },

    { id: 'setup', label: 'Meu Setup', icon: Monitor, category: 'Acervo & Hardware' },
    { id: 'vault', label: 'Coleção', icon: Box, category: 'Acervo & Hardware' },
    
    { id: 'notifications', label: 'Alertas', icon: Bell, category: 'Sistema' },
    { id: 'blueprint', label: 'Blueprint', icon: FileCode, category: 'Sistema' },
    { id: 'settings', label: 'Ajustes', icon: SettingsIcon, category: 'Sistema' },
  ], []);

  // Agrupamento para o menu vertical mobile
  const groupedMenuItems = useMemo(() => {
    // Cast to any[] to avoid 'unknown' type errors when using Object.entries in the UI
    return fullMenuItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }, [fullMenuItems]);

  // ATALHOS RÁPIDOS (Radial 360)
  const shortcutItems = useMemo(() => [
    { id: 'pulse', label: 'Feed', icon: Activity },
    { id: 'profile', label: 'DNA', icon: UserCircle },
    { id: 'library', label: 'Jogos', icon: Grid },
    { id: 'market', label: 'Market', icon: Store },
    { id: 'oracle', label: 'IA', icon: BrainCircuit },
    { id: 'notifications', label: 'Alertas', icon: Bell },
  ], []);

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

    const step = 360 / shortcutItems.length;
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
      const item = shortcutItems[activeIdx];
      setActiveTab(item.id);
    }
    setIsRadialOpen(false);
    setActiveIdx(null);
  };

  const navigateTo = (id: string) => {
    setActiveTab(id);
    setIsVerticalMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'pulse': return <GlobalFeed />;
      case 'profile': return <ProfileView onNavigate={setActiveTab} />;
      case 'notifications': return <NotificationCenter onReadUpdate={setUnreadCount} />;
      case 'chat': return <NexusChat />;
      case 'library': return <GameLibrary onNavigate={setActiveTab} />;
      case 'vault': return <Collection />;
      case 'setup': return <SetupMaster />;
      case 'achievements': return <Achievements />;
      case 'stats': return <Statistics />;
      case 'oracle': return <NexusOracle />;
      case 'chronos': return <NexusChronos />;
      case 'discover': return <GameSearch />;
      case 'friends': return <Friends />;
      case 'auctions': return <Auctions />;
      case 'market': return <NexusMarket />;
      case 'forum': return <NexusForum />;
      case 'loot': return <LootMarket />;
      case 'blueprint': return <NexusBlueprint />;
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
      <aside className="hidden md:flex w-64 bg-nexus-900 border-r border-nexus-800 flex-col shrink-0 h-full z-50">
        <div className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-nexus-accent to-nexus-secondary rounded-2xl flex items-center justify-center shadow-2xl cursor-pointer" onClick={() => setActiveTab('pulse')}>
            <span className="font-display font-bold text-white text-2xl">N</span>
          </div>
          <div><h2 className="font-display font-bold text-xl tracking-tighter text-white">NEXUS</h2><p className="text-[8px] font-black text-nexus-accent uppercase tracking-widest">Sovereign Legacy</p></div>
        </div>
        
        <nav className="flex-1 px-3 space-y-8 overflow-y-auto custom-scrollbar pt-4">
           {/* Fix: Explicitly cast Object.entries result to [string, any[]][] to avoid unknown map errors */}
           {(Object.entries(groupedMenuItems) as [string, any[]][]).map(([category, items]) => (
             <div key={category} className="space-y-1">
               <h3 className="px-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3">{category}</h3>
               {/* Use explicit typing via groups record fix to resolve 'unknown' type errors */}
               {items.map(item => (
                  <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} active={activeTab} onClick={setActiveTab} />
               ))}
             </div>
           ))}
        </nav>

        <div className="p-4 border-t border-nexus-800">
          <button onClick={logout} className="w-full flex items-center gap-4 p-3 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"><LogOut size={20} /><span className="font-bold text-xs">Desconectar</span></button>
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
           <div className="md:hidden h-40 w-full"></div>
        </div>

        {isRadialOpen && (
           <div className="md:hidden fixed inset-0 z-[200] flex items-center justify-center animate-fade-in pointer-events-none">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl"></div>
              <div className="relative w-80 h-80 flex items-center justify-center">
                 <div 
                    className="absolute w-1 h-32 bg-gradient-to-t from-nexus-accent/0 to-nexus-accent origin-bottom transition-transform duration-100 ease-out"
                    style={{ 
                        transform: `rotate(${Math.atan2(touchPos.y - centerPos.y, touchPos.x - centerPos.x) * (180 / Math.PI) + 90}deg)`,
                        left: 'calc(50% - 2px)',
                        bottom: '50%'
                    }}
                 ><div className="w-5 h-5 bg-white rounded-full absolute -top-2.5 left-1/2 -translate-x-1/2 shadow-[0_0_20px_#fff]"></div></div>
                 
                 <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100">
                    {shortcutItems.map((_, i) => {
                       const step = 360 / shortcutItems.length;
                       const start = i * step;
                       const end = (i + 1) * step;
                       const isFocused = activeIdx === i;
                       const x1 = 50 + 48 * Math.cos(Math.PI * start / 180);
                       const y1 = 50 + 48 * Math.sin(Math.PI * start / 180);
                       const x2 = 50 + 48 * Math.cos(Math.PI * end / 180);
                       const y2 = 50 + 48 * Math.sin(Math.PI * end / 180);
                       const x3 = 50 + 32 * Math.cos(Math.PI * end / 180);
                       const y3 = 50 + 32 * Math.sin(Math.PI * end / 180);
                       const x4 = 50 + 32 * Math.cos(Math.PI * start / 180);
                       const y4 = 50 + 32 * Math.sin(Math.PI * start / 180);
                       return <path key={i} d={`M ${x1} ${y1} A 48 48 0 0 1 ${x2} ${y2} L ${x3} ${y3} A 32 32 0 0 0 ${x4} ${y4} Z`} fill={isFocused ? "rgba(139, 92, 246, 0.5)" : "rgba(255, 255, 255, 0.03)"} stroke={isFocused ? "#8b5cf6" : "rgba(255, 255, 255, 0.1)"} strokeWidth="0.5" className="transition-all duration-200" />;
                    })}
                 </svg>

                 {shortcutItems.map((item, i) => {
                    const step = 360 / shortcutItems.length;
                    const angle = i * step + (step / 2);
                    const isFocused = activeIdx === i;
                    const radius = isFocused ? 130 : 115;
                    const x = Math.cos(angle * Math.PI / 180) * radius;
                    const y = Math.sin(angle * Math.PI / 180) * radius;
                    return (
                       <div key={i} className={`absolute transition-all duration-300 flex flex-col items-center gap-1.5 ${isFocused ? 'scale-125 z-50' : 'opacity-40'}`} style={{ transform: `translate(${x}px, ${y}px)` }}>
                          <div className={`p-4 rounded-[1.5rem] border-2 transition-all ${isFocused ? 'bg-nexus-accent border-white text-white shadow-[0_0_30px_rgba(139,92,246,0.8)]' : 'bg-nexus-900 border-white/10 text-gray-400'}`}><item.icon size={28} /></div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded backdrop-blur-md ${isFocused ? 'bg-white text-black' : 'bg-black/40 text-gray-500'}`}>{item.label}</span>
                       </div>
                    );
                 })}

                 <div className="w-24 h-24 rounded-full bg-nexus-900 border-4 border-nexus-accent flex flex-col items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.4)] z-10 transition-transform active:scale-95 overflow-hidden">
                    {activeIdx !== null ? (
                      <div className="animate-fade-in flex flex-col items-center text-nexus-accent">
                         {React.createElement(shortcutItems[activeIdx].icon, { size: 32 })}
                         <span className="text-[7px] font-black uppercase tracking-widest mt-1 text-white">Pronto</span>
                      </div>
                    ) : (
                      <span className="font-display font-black text-3xl text-white">N</span>
                    )}
                    <div className="absolute inset-0 rounded-full border-t border-white/10 animate-spin-slow"></div>
                 </div>
              </div>
              <div className="absolute bottom-24 text-center">
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Solte no atalho desejado</p>
              </div>
           </div>
        )}

        {isVerticalMenuOpen && (
           <div className="md:hidden fixed inset-0 z-[250] flex flex-col animate-fade-in pointer-events-auto">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => setIsVerticalMenuOpen(false)}></div>
              <div className="mt-auto bg-[#08080c] border-t border-nexus-700 rounded-t-[3.5rem] h-[85vh] flex flex-col relative z-[260] animate-slide-up shadow-[0_-20px_100px_rgba(0,0,0,0.8)]">
                 <div className="w-16 h-1.5 bg-gray-800 rounded-full mx-auto mt-6 mb-8 shrink-0"></div>
                 
                 <header className="px-10 flex items-center justify-between mb-8 shrink-0">
                    <div>
                       <h2 className="text-3xl font-display font-bold text-white flex items-center gap-4">
                          Central Nexus
                       </h2>
                       <p className="text-[10px] font-black text-nexus-accent uppercase tracking-widest mt-1">Sovereign Panel v4</p>
                    </div>
                    <button onClick={() => setIsVerticalMenuOpen(false)} className="p-4 bg-nexus-800 border border-nexus-700 rounded-2xl text-gray-400 active:scale-90 transition-all">
                       <X size={24}/>
                    </button>
                 </header>

                 <div className="flex-1 overflow-y-auto px-8 space-y-10 pb-40 custom-scrollbar">
                    {/* Fix: Explicitly cast Object.entries result to [string, any[]][] to avoid unknown map errors */}
                    {(Object.entries(groupedMenuItems) as [string, any[]][]).map(([category, items]) => (
                       <div key={category} className="space-y-4">
                          <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] pl-2 border-l-2 border-nexus-accent/30">{category}</h3>
                          <div className="grid grid-cols-2 gap-3">
                             {/* Use explicit typing from the central groupedMenuItems fix to resolve 'unknown' map errors */}
                             {items.map(item => (
                                <button 
                                  key={item.id} 
                                  onClick={() => navigateTo(item.id)}
                                  className={`flex flex-col items-center justify-center p-6 rounded-[2.5rem] border transition-all active:scale-95 ${activeTab === item.id ? 'bg-nexus-accent border-nexus-accent shadow-[0_0_30px_rgba(139,92,246,0.3)]' : 'bg-nexus-800/30 border-nexus-800 hover:bg-nexus-800'}`}
                                >
                                   <div className={`p-3 rounded-2xl mb-3 ${activeTab === item.id ? 'bg-white/20' : 'bg-nexus-900/50'}`}>
                                      <item.icon size={26} className={activeTab === item.id ? 'text-white' : 'text-nexus-accent'} />
                                   </div>
                                   <span className="text-[10px] font-bold uppercase tracking-tight text-white text-center leading-tight">{item.label}</span>
                                </button>
                             ))}
                          </div>
                       </div>
                    ))}
                    
                    <button 
                      onClick={logout}
                      className="w-full py-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[2.5rem] font-black text-xs uppercase tracking-widest mt-4 flex items-center justify-center gap-3 active:bg-red-500 active:text-white transition-all"
                    >
                       <LogOut size={20} /> Desconectar Protocolo
                    </button>
                 </div>
              </div>
           </div>
        )}

        {/* BOTTOM NAV BAR MOBILE FIXED */}
        <div className="md:hidden fixed bottom-8 inset-x-0 flex items-center justify-center gap-6 z-[210] pointer-events-none">
           <div className="flex flex-col items-center gap-2 pointer-events-auto group">
              <button 
                ref={radialButtonRef}
                onMouseDown={handleRadialStart}
                onTouchStart={handleRadialStart}
                className={`w-18 h-18 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.6)] border-2 ${
                  isRadialOpen ? 'scale-0 opacity-0' : 'bg-nexus-900 text-nexus-accent border-nexus-accent/40 active:scale-90 active:bg-nexus-accent active:text-white'
                }`}
              >
                 <Zap size={32} strokeWidth={2.5} className="fill-current" />
              </button>
              <span className={`text-[8px] font-black uppercase tracking-widest text-nexus-accent/60 transition-opacity duration-300 ${isRadialOpen ? 'opacity-0' : 'opacity-100'}`}>Shortcuts</span>
           </div>

           <div className="flex flex-col items-center gap-2 pointer-events-auto group">
              <button 
                onClick={() => setIsVerticalMenuOpen(true)}
                className={`w-18 h-18 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.6)] border-2 ${
                  isRadialOpen ? 'scale-0 opacity-0' : 'bg-nexus-900 text-nexus-secondary border-nexus-secondary/40 active:scale-90 active:bg-nexus-secondary active:text-white'
                }`}
              >
                 <Menu size={32} strokeWidth={2.5} />
              </button>
              <span className={`text-[8px] font-black uppercase tracking-widest text-nexus-secondary/60 transition-opacity duration-300 ${isRadialOpen ? 'opacity-0' : 'opacity-100'}`}>Full Panel</span>
           </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        .w-18 { width: 4.5rem; }
        .h-18 { height: 4.5rem; }
      `}} />
    </div>
  );
};

const NavItem: React.FC<{ id: string, icon: any, label: string, active: string, onClick: (id: string) => void }> = ({ id, icon: Icon, label, active, onClick }) => (
  <button 
    onClick={() => onClick(id)} 
    className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group ${
      active === id ? 'bg-nexus-accent text-white shadow-xl shadow-nexus-accent/20' : 'text-gray-400 hover:bg-nexus-800/60 hover:text-gray-300'
    }`}
  >
    <Icon size={20} className={`transition-all ${active === id ? 'scale-110' : 'group-hover:scale-110'}`} />
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
