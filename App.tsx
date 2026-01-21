
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Users, Bot, Settings, LogOut, Compass, BarChart2, Grid, Trophy, User, ArrowRight, Globe, History, Loader2, Lock, AtSign, AlertCircle, Database, CloudCheck, Server, X, RefreshCw, Wifi, WifiOff, Mail, CheckCircle, ShieldCheck } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Friends } from './components/Friends';
import { DiscordBot } from './components/DiscordBot';
import { Settings as SettingsComponent } from './components/Settings';
import { GameSearch } from './components/GameSearch';
import { Statistics } from './components/Statistics';
import { GameLibrary } from './components/GameLibrary';
import { Achievements } from './components/Achievements';
import { NexusChronos } from './components/NexusChronos';
import { AppProvider, useAppContext } from './context/AppContext';
import { nexusCloud } from './services/nexusCloud';

const RegistryExplorer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await nexusCloud.listAllCloudUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-nexus-900 w-full max-w-2xl rounded-[2.5rem] border border-nexus-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-8 border-b border-nexus-800 flex justify-between items-center bg-nexus-800/50">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-nexus-accent/20 rounded-2xl text-nexus-accent">
                 <Server size={24} />
              </div>
              <div>
                 <h2 className="text-2xl font-display font-bold text-white">Banco de Dados Cloud</h2>
                 <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Tabela de Perfis (Supabase)</p>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button onClick={fetchUsers} className="p-2 hover:bg-nexus-800 rounded-xl transition-all text-nexus-secondary">
                 <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-nexus-800 rounded-xl transition-all text-gray-500 hover:text-white">
                 <X size={24} />
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
           {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-nexus-accent" size={48} />
                <p className="text-gray-500 animate-pulse font-mono text-xs">QUERYING SUPABASE API...</p>
             </div>
           ) : error ? (
             <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center space-y-4">
                <AlertCircle className="mx-auto text-red-500" size={48} />
                <h3 className="text-white font-bold">Acesso Negado ou Erro de Banco</h3>
                <p className="text-red-400/80 text-sm leading-relaxed">{error}</p>
             </div>
           ) : (
             <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                   <span>Identificador Nexus</span>
                   <span>E-mail Associado</span>
                </div>
                {users.length === 0 ? (
                  <p className="text-center py-10 text-gray-600 italic">Nenhum registro encontrado no banco de dados.</p>
                ) : (
                  users.map((u, i) => (
                    <div key={i} className="grid grid-cols-2 gap-4 bg-nexus-800/40 p-4 rounded-2xl border border-nexus-700 hover:border-nexus-accent transition-all group animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-nexus-900 rounded-lg flex items-center justify-center text-nexus-accent border border-nexus-800">
                                <User size={14} />
                            </div>
                            <span className="text-white font-bold font-mono text-sm truncate">{u.nexus_id}</span>
                        </div>
                        <span className="text-gray-500 text-xs flex items-center truncate">{u.email}</span>
                    </div>
                  ))
                )}
             </div>
           )}
        </div>
        
        <div className="p-6 bg-nexus-900 border-t border-nexus-800 text-center flex justify-between items-center">
           <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">Total de Usuários: {users.length}</p>
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-nexus-success"></span>
              <span className="text-[10px] text-nexus-success uppercase font-bold">DB Conectado</span>
           </div>
        </div>
      </div>
    </div>
  );
};

const LoginScreen: React.FC = () => {
  const { login, signup, setUserStats, isCloudActive } = useAppContext();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [nexusId, setNexusId] = useState('');
  
  // Verification State
  const [userTokenInput, setUserTokenInput] = useState(['', '', '', '', '', '']);
  const tokenInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  
  const [error, setError] = useState('');
  const [showExplorer, setShowExplorer] = useState(false);
  const [connStatus, setConnStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle');

  useEffect(() => {
    const check = async () => {
      if (isCloudActive) {
        setConnStatus('checking');
        const ok = await nexusCloud.ping();
        setConnStatus(ok ? 'online' : 'offline');
      }
    };
    check();
  }, [isCloudActive]);

  const handleStartSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!identifier.includes('@')) {
        setError("Insira um e-mail válido.");
        setIsLoading(false);
        return;
    }

    try {
        await nexusCloud.requestSignup(identifier, password, nexusId);
        setStep('verify');
    } catch (err: any) {
        setError(err.message || "Erro ao enviar e-mail. Verifique se o Supabase Auth está ativo.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyAndFinalize = async () => {
    setIsLoading(true);
    setError('');
    const enteredToken = userTokenInput.join('');

    try {
        const session = await nexusCloud.verifyEmailToken(identifier, enteredToken);
        const stats = await nexusCloud.finalizeProfile(session, nexusId);
        setUserStats(stats);
    } catch (err: any) {
        setError(err.message || "Código inválido.");
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

  const handleTokenChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (value && isNaN(Number(value))) return;

    const newInputs = [...userTokenInput];
    newInputs[index] = value;
    setUserTokenInput(newInputs);

    if (value && index < 5) {
        tokenInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !userTokenInput[index] && index > 0) {
        tokenInputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="h-screen bg-[#050507] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <div className="bg-nexus-900 p-8 md:p-10 rounded-[2.5rem] border border-nexus-800 shadow-2xl max-w-md w-full relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-nexus-accent to-nexus-secondary rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-nexus-accent/20 mb-4">
            <span className="font-display font-bold text-white text-2xl">N</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Nexus Alpha</h1>
          <p className="text-gray-500 text-sm italic">
            {step === 'form' ? 'Acesso Unificado Cloud-Native.' : 'Verifique seu E-mail Agora.'}
          </p>
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
                <input required type="text" placeholder={mode === 'login' ? "E-mail cadastrado" : "E-mail (Enviaremos um Token)"} className="w-full bg-nexus-800 border border-nexus-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-nexus-accent outline-none" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input required type="password" placeholder="Senha" className="w-full bg-nexus-800 border border-nexus-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-nexus-accent outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              {mode === 'signup' && (
                <div className="relative animate-fade-in">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input required type="text" placeholder="Nexus ID (ex: @meu_id)" className="w-full bg-nexus-800 border border-nexus-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-nexus-accent outline-none font-mono" value={nexusId} onChange={(e) => setNexusId(e.target.value)} />
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-xs font-bold flex items-center gap-2 animate-fade-in">
                   <AlertCircle size={16} /> <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={isLoading} className="w-full bg-nexus-accent hover:bg-nexus-accent/90 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-nexus-accent/20">
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (mode === 'login' ? 'Acessar Legado' : 'Enviar E-mail de Validação')}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-6 animate-fade-in">
             <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-nexus-secondary/10 rounded-2xl text-nexus-secondary border border-nexus-secondary/20 mb-2">
                   <Mail size={32} />
                </div>
                <h3 className="text-white font-bold">Confirmação em Duas Etapas</h3>
                <p className="text-xs text-gray-500 leading-relaxed px-4">O Supabase enviou um código de 6 dígitos para o seu e-mail. <br/><b className="text-gray-300">{identifier}</b></p>
             </div>

             <div className="flex justify-between gap-2">
                {userTokenInput.map((val, idx) => (
                   <input
                     key={idx}
                     ref={el => tokenInputsRef.current[idx] = el}
                     type="text"
                     maxLength={1}
                     value={val}
                     onChange={e => handleTokenChange(idx, e.target.value)}
                     onKeyDown={e => handleKeyDown(idx, e)}
                     className="w-12 h-14 bg-nexus-800 border border-nexus-700 rounded-xl text-center text-xl font-bold text-white focus:border-nexus-secondary outline-none transition-all"
                   />
                ))}
             </div>

             {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs font-bold text-center">
                   {error}
                </div>
             )}

             <div className="space-y-3">
                <button 
                  onClick={handleVerifyAndFinalize}
                  disabled={isLoading || userTokenInput.some(v => !v)}
                  className="w-full bg-nexus-secondary hover:bg-nexus-secondary/90 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-nexus-secondary/20 disabled:opacity-50"
                >
                   {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={20} /> Confirmar e Registrar</>}
                </button>
                <button 
                  onClick={() => setStep('form')}
                  className="w-full py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
                >
                   Tentar outro e-mail
                </button>
             </div>
          </div>
        )}

        <div className="pt-6 border-t border-nexus-800 space-y-4">
           <button 
             onClick={() => setShowExplorer(true)}
             className="w-full p-4 bg-nexus-800 hover:bg-nexus-700 rounded-2xl border border-nexus-700 flex items-center justify-between group transition-all"
           >
              <div className="flex items-center gap-3">
                 <Server size={18} className="text-nexus-secondary group-hover:rotate-12 transition-transform" />
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registros na Nuvem</span>
              </div>
              <ArrowRight size={16} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
           </button>
           
           <div className="flex items-center justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                 {connStatus === 'online' ? (
                   <div className="flex items-center gap-1 text-nexus-success">
                      <div className="w-2 h-2 rounded-full bg-nexus-success animate-pulse"></div>
                      <span>Auth Engine Online</span>
                   </div>
                 ) : (
                   <div className="flex items-center gap-1 text-red-500">
                      <WifiOff size={14} />
                      <span>Link Offline</span>
                   </div>
                 )}
              </div>
              <span>API PROD v1.8</span>
           </div>
        </div>
      </div>

      {showExplorer && <RegistryExplorer onClose={() => setShowExplorer(false)} />}
    </div>
  );
};

const Navigation: React.FC<{ activeTab: string, onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => {
  const { logout } = useAppContext();
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Início' },
    { id: 'library', icon: Grid, label: 'Biblioteca' },
    { id: 'achievements', icon: Trophy, label: 'Conquistas' },
    { id: 'chronos', icon: History, label: 'Chronos' },
    { id: 'friends', icon: Users, label: 'Conexões' },
    { id: 'discover', icon: Compass, label: 'Descobrir' },
    { id: 'stats', icon: BarChart2, label: 'Análise' },
    { id: 'settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <nav className="w-20 md:w-64 bg-nexus-900 border-r border-nexus-800 flex flex-col h-full overflow-hidden transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-nexus-accent rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-nexus-accent/20">
          <span className="text-white font-bold text-xl">N</span>
        </div>
        <span className="hidden md:block font-display font-bold text-xl text-white">NEXUS</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => onTabChange(item.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${activeTab === item.id ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:bg-nexus-800 hover:text-white'}`}>
            <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
            <span className="hidden md:block text-sm font-bold">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="p-4 mt-auto border-t border-nexus-800">
        <button onClick={logout} className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all group">
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="hidden md:block text-sm font-bold">Deslogar</span>
        </button>
      </div>
    </nav>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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
        <p className="text-gray-500 font-mono text-xs animate-pulse">BOOTING NEXUS CORE...</p>
      </div>
    );
  }

  if (!userStats) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen bg-[#050507] text-gray-100 overflow-hidden font-sans">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'library' && <GameLibrary />}
        {activeTab === 'achievements' && <Achievements />}
        {activeTab === 'chronos' && <NexusChronos />}
        {activeTab === 'friends' && <Friends />}
        {activeTab === 'discover' && <GameSearch />}
        {activeTab === 'stats' && <Statistics />}
        {activeTab === 'settings' && <SettingsComponent />}
      </main>
    </div>
  );
}
