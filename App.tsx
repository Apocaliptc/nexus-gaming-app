
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Users, Bot, Settings, LogOut, Compass, BarChart2, Grid, Trophy, User, Globe, History, Loader2, Lock, AtSign, AlertCircle, X, Sparkles, UserCircle, Home, Zap, MessageSquare, BrainCircuit, Info } from 'lucide-react';
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
import { AppProvider, useAppContext } from './context/AppContext';
import { nexusCloud } from './services/nexusCloud';
import { Friend } from './types';

const LoginScreen: React.FC = () => {
  const { login, signup, setUserStats } = useAppContext();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [isLoading, setIsLoading] = useState(false);
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [nexusId, setNexusId] = useState('');
  
  const [userTokenInput, setUserTokenInput] = useState(['', '', '', '', '', '']);
  const tokenInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  
  const [error, setError] = useState('');

  const handleStartSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
        await nexusCloud.requestSignup(identifier, password, nexusId);
        setStep('verify');
    } catch (err: any) {
        setError(err.message || "Erro no cadastro.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyAndFinalize = async () => {
    setIsLoading(true);
    setError('');
    try {
        const token = userTokenInput.join('');
        const session = await nexusCloud.verifyEmailToken(identifier, token);
        const stats = await nexusCloud.finalizeProfile(session, nexusId);
        setUserStats(stats);
    } catch (err: any) {
        setError(err.message || "Token inválido.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
        await login(identifier, password);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#050507] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-nexus-900 p-8 md:p-10 rounded-[2.5rem] border border-nexus-800 shadow-2xl max-w-md w-full relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-nexus-accent to-nexus-secondary rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-nexus-accent/20 mb-4">
            <span className="font-display font-bold text-white text-2xl">N</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Nexus Alpha</h1>
          <p className="text-gray-500 text-sm italic">Onde seu legado se torna eterno.</p>
        </div>

        {step === 'form' ? (
          <>
            <div className="flex bg-nexus-800 p-1 rounded-xl border border-nexus-700">
              <button onClick={() => setMode('login')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${mode === 'login' ? 'bg-nexus-900 text-white shadow-lg' : 'text-gray-500'}`}>Login</button>
              <button onClick={() => setMode('signup')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${mode === 'signup' ? 'bg-nexus-900 text-white shadow-lg' : 'text-gray-500'}`}>Cadastro</button>
            </div>

            <form onSubmit={mode === 'login' ? handleLogin : handleStartSignup} className="space-y-4">
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input required type="text" placeholder="E-mail" className="w-full bg-nexus-800 border border-nexus-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-nexus-accent outline-none" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input required type="password" placeholder="Senha" className="w-full bg-nexus-800 border border-nexus-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-nexus-accent outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {mode === 'signup' && (
                <div className="relative animate-fade-in">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input required type="text" placeholder="Nexus ID (ex: @nick)" className="w-full bg-nexus-800 border border-nexus-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-nexus-accent outline-none font-mono" value={nexusId} onChange={(e) => setNexusId(e.target.value)} />
                </div>
              )}
              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs font-bold text-center">{error}</div>}
              <button type="submit" disabled={isLoading} className="w-full bg-nexus-accent hover:bg-nexus-accent/90 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-nexus-accent/20">
                {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : (mode === 'login' ? 'Entrar' : 'Solicitar Acesso')}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-6 text-center animate-fade-in">
             <div className="space-y-2">
                <h3 className="text-white font-bold text-xl">Verifique seu E-mail</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Enviamos um token para <strong className="text-nexus-secondary">{identifier}</strong></p>
             </div>

             <div className="flex justify-center gap-2 py-4">
                {userTokenInput.map((val, idx) => (
                   <input key={idx} ref={el => tokenInputsRef.current[idx] = el} type="text" maxLength={1} value={val} 
                     onChange={e => {
                        const newIn = [...userTokenInput]; newIn[idx] = e.target.value; setUserTokenInput(newIn);
                        if (e.target.value && idx < 5) tokenInputsRef.current[idx+1]?.focus();
                     }} 
                     className="w-10 h-12 bg-nexus-800 border border-nexus-700 rounded-lg text-center text-white text-xl font-bold focus:border-nexus-accent outline-none shadow-inner" />
                ))}
             </div>

             <div className="bg-nexus-accent/5 border border-nexus-accent/20 p-4 rounded-xl flex items-start gap-3 text-left">
                <Info size={16} className="text-nexus-accent shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 leading-tight">
                  <strong>Ambiente Alpha:</strong> Se não receber o e-mail em instantes, use o token mestre <strong className="text-nexus-accent select-all">123456</strong> para prosseguir com o teste.
                </p>
             </div>

             {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs font-bold text-center">{error}</div>}

             <button onClick={handleVerifyAndFinalize} disabled={isLoading} className="w-full bg-nexus-secondary hover:bg-nexus-secondary/80 text-white font-bold py-4 rounded-2xl shadow-xl shadow-nexus-secondary/20 transition-all flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Confirmar Legado</>}
             </button>
             
             <button onClick={() => setStep('form')} className="text-gray-500 text-xs hover:text-white transition-colors">Voltar e corrigir dados</button>
          </div>
        )}
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
            {activeTab === 'discord' && <DiscordBot />}
            {activeTab === 'settings' && <SettingsComponent />}
            {activeTab === 'oracle' && <NexusOracle />}
        </div>
      </main>
    </div>
  );
}
