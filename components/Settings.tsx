
import React, { useState, useEffect } from 'react';
import { User, Camera, Link2, Unlink, Check, Save, RefreshCw, Smartphone, Monitor, Gamepad2, Database, Shield, Lock, ChevronDown, ChevronUp, AlertCircle, Globe, CloudCheck, ExternalLink, Server, Key, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Platform } from '../types';
import { PlatformIcon } from './PlatformIcon';
import { SyncPortal } from './SyncPortal';
import { nexusCloud } from '../services/nexusCloud';

export const Settings: React.FC = () => {
  const { userStats, setUserStats, linkAccount, unlinkAccount, updateCloudConfig, isCloudActive } = useAppContext();
  
  // Profile State
  const [displayName, setDisplayName] = useState(userStats?.nexusId.replace('@', '') || '');
  const [nexusId, setNexusId] = useState(userStats?.nexusId || '');
  const [avatarSeed, setAvatarSeed] = useState(userStats?.nexusId || 'default');
  
  // Cloud Config State
  const [dbUrl, setDbUrl] = useState(localStorage.getItem('nexus_cloud_url') || '');
  const [dbKey, setDbKey] = useState(localStorage.getItem('nexus_cloud_key') || '');
  const [testingConn, setTestingConn] = useState(false);
  const [connResult, setConnResult] = useState<'success' | 'error' | null>(null);
  
  // Platform Linking State
  const [syncingPlatform, setSyncingPlatform] = useState<{platform: Platform, username: string} | null>(null);
  const [gamertags, setGamertags] = useState<Record<string, string>>({});
  
  // UI State
  const [isSaving, setIsSaving] = useState(false);

  if (!userStats) return null;

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      setUserStats(prev => prev ? {
        ...prev,
        nexusId: nexusId.startsWith('@') ? nexusId : `@${nexusId}`
      } : null);
      setIsSaving(false);
    }, 800);
  };

  const handleSaveCloudConfig = async () => {
    setTestingConn(true);
    setConnResult(null);
    
    // Temporariamente aplica para testar
    nexusCloud.updateConfig(dbUrl, dbKey);
    const isOk = await nexusCloud.ping();
    
    if (isOk) {
      updateCloudConfig(dbUrl, dbKey);
      setConnResult('success');
    } else {
      setConnResult('error');
    }
    setTestingConn(false);
  };

  const startSync = (platform: Platform) => {
    const username = gamertags[platform];
    if (!username) return;
    setSyncingPlatform({ platform, username });
  };

  const handleSyncComplete = (games: any[], hours: number) => {
    if (syncingPlatform) {
      linkAccount(syncingPlatform.platform, syncingPlatform.username, games, hours);
      setSyncingPlatform(null);
    }
  };

  const platforms = [
    { id: Platform.STEAM, name: 'Steam', color: 'text-blue-400' },
    { id: Platform.PSN, name: 'PlayStation Network', color: 'text-blue-600' },
    { id: Platform.XBOX, name: 'Xbox Live', color: 'text-green-500' },
    { id: Platform.EPIC, name: 'Epic Games', color: 'text-white' }
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-12 animate-fade-in pb-24 h-full overflow-y-auto custom-scrollbar text-gray-100">
      
      {/* SEÇÃO: CONFIGURAÇÃO DE BANCO (NUVEM) */}
      <section className="space-y-6">
        <div className="border-b border-nexus-700 pb-4">
          <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Server className="text-nexus-secondary" /> Conexão com a Nuvem
          </h2>
          <p className="text-gray-400">Configure seu projeto Supabase para sincronização global.</p>
        </div>

        <div className="bg-nexus-900 border border-nexus-800 rounded-[2.5rem] p-8 space-y-6 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Database size={120} />
           </div>

           <div className="grid grid-cols-1 gap-6 relative z-10">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    <Globe size={12} /> Supabase Project URL
                 </label>
                 <input 
                   type="text" 
                   placeholder="https://your-project.supabase.co"
                   value={dbUrl}
                   onChange={(e) => setDbUrl(e.target.value)}
                   className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-secondary outline-none font-mono text-sm"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    <Key size={12} /> Anon Key (Public API Key)
                 </label>
                 <div className="relative">
                    <input 
                      type="password" 
                      placeholder="eyJhbGciOiJIUzI1Ni..."
                      value={dbKey}
                      onChange={(e) => setDbKey(e.target.value)}
                      className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-secondary outline-none font-mono text-sm pr-12"
                    />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                 </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-nexus-800">
                 <div className="flex items-center gap-3">
                    {connResult === 'success' && (
                      <div className="flex items-center gap-2 text-nexus-success text-xs font-bold animate-fade-in">
                         <Wifi size={16} /> CONEXÃO ESTABELECIDA
                      </div>
                    )}
                    {connResult === 'error' && (
                      <div className="flex items-center gap-2 text-red-500 text-xs font-bold animate-fade-in">
                         <WifiOff size={16} /> FALHA NA CONEXÃO
                      </div>
                    )}
                    {!connResult && (
                      <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                         Status: {isCloudActive ? 'Configurado' : 'Não Configurado'}
                      </div>
                    )}
                 </div>

                 <button 
                   onClick={handleSaveCloudConfig}
                   disabled={testingConn || !dbUrl || !dbKey}
                   className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${connResult === 'success' ? 'bg-nexus-success text-white' : 'bg-nexus-secondary text-white shadow-nexus-secondary/20 hover:scale-105 active:scale-95 disabled:opacity-50'}`}
                 >
                    {testingConn ? <Loader2 className="animate-spin" size={18} /> : (connResult === 'success' ? <Check size={18} /> : <CloudCheck size={18} />)}
                    {connResult === 'success' ? 'Conectado!' : 'Testar e Salvar'}
                 </button>
              </div>
           </div>
        </div>
      </section>

      {/* SEÇÃO: IDENTIDADE GAMER */}
      <section className="space-y-6">
        <div className="border-b border-nexus-700 pb-4">
          <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <User className="text-nexus-accent" /> Identidade Gamer
          </h2>
          <p className="text-gray-400">Como seu legado é visto na Nuvem.</p>
        </div>

        <div className="bg-nexus-900 border border-nexus-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 items-center md:items-start shadow-xl">
           <div className="relative group">
              <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-nexus-800 shadow-2xl bg-nexus-800">
                 <img 
                   src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                   className="w-full h-full object-cover" 
                   alt="Avatar" 
                 />
              </div>
              <button 
                onClick={() => setAvatarSeed(Math.random().toString(36))}
                className="absolute -bottom-2 -right-2 p-3 bg-nexus-accent text-white rounded-2xl shadow-lg hover:scale-110 transition-all border-4 border-nexus-900"
              >
                <Camera size={18} />
              </button>
           </div>

           <div className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Nome de Exibição</label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-accent outline-none transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Nexus ID (@)</label>
                    <input 
                      type="text" 
                      value={nexusId}
                      onChange={(e) => setNexusId(e.target.value)}
                      className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-accent outline-none font-mono transition-all"
                    />
                 </div>
              </div>
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-8 py-3 bg-nexus-accent hover:bg-nexus-accent/80 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-nexus-accent/20"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                Salvar no Perfil
              </button>
           </div>
        </div>
      </section>

      {/* SEÇÃO: VINCULAR CONTAS */}
      <section className="space-y-6">
        <div className="border-b border-nexus-700 pb-4">
          <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Link2 className="text-nexus-accent" /> Vincular Ecossistemas
          </h2>
          <p className="text-gray-400">Conecte gamertags para unificar estatísticas na Nuvem.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
           {platforms.map(platform => {
             const isConnected = userStats.platformsConnected.includes(platform.id);
             const linkedAccount = userStats.linkedAccounts.find(a => a.platform === platform.id);

             return (
               <div key={platform.id} className={`bg-nexus-800 p-5 rounded-3xl border transition-all flex flex-col md:flex-row items-center gap-4 ${isConnected ? 'border-nexus-secondary/30 bg-nexus-secondary/5' : 'border-nexus-700'}`}>
                  <div className={`p-4 rounded-2xl bg-nexus-900 border border-nexus-700 ${platform.color}`}>
                     <PlatformIcon platform={platform.id} className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                     <h4 className="font-bold text-white text-lg">{platform.name}</h4>
                     <p className="text-xs text-gray-500">
                        {isConnected ? `Sincronizado: ${linkedAccount?.username}` : 'Clique para buscar dados públicos.'}
                     </p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                     {!isConnected ? (
                       <>
                         <input 
                           type="text" 
                           placeholder="Username Público"
                           value={gamertags[platform.id] || ''}
                           onChange={(e) => setGamertags({...gamertags, [platform.id]: e.target.value})}
                           className="flex-1 md:w-48 bg-nexus-900 border border-nexus-700 rounded-xl px-4 py-2 text-sm text-white focus:border-nexus-secondary outline-none"
                         />
                         <button 
                           onClick={() => startSync(platform.id)}
                           className="px-6 py-2 bg-nexus-secondary hover:bg-nexus-secondary/80 text-white font-bold rounded-xl text-xs transition-all"
                         >
                            Buscar
                         </button>
                       </>
                     ) : (
                       <button 
                         onClick={() => unlinkAccount(platform.id)}
                         className="px-6 py-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white font-bold rounded-xl text-xs transition-all"
                       >
                          Remover
                       </button>
                     )}
                  </div>
               </div>
             );
           })}
        </div>
      </section>

      {/* SYNC MODAL */}
      {syncingPlatform && (
        <SyncPortal 
          platform={syncingPlatform.platform} 
          username={syncingPlatform.username} 
          onComplete={handleSyncComplete}
          onCancel={() => setSyncingPlatform(null)}
        />
      )}
    </div>
  );
};
