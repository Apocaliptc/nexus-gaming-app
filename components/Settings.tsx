
import React, { useState, useEffect } from 'react';
import { User, Camera, Link2, Unlink, Check, Save, RefreshCw, Smartphone, Monitor, Gamepad2, Database, Shield, Lock, ChevronDown, ChevronUp, AlertCircle, Globe, CloudCheck, ExternalLink, Server, Key, Wifi, WifiOff, Loader2, Sparkles, UserCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Platform } from '../types';
import { PlatformIcon } from './PlatformIcon';
import { SyncPortal } from './SyncPortal';

export const Settings: React.FC = () => {
  const { userStats, setUserStats, linkAccount, unlinkAccount } = useAppContext();
  
  const [displayName, setDisplayName] = useState('');
  const [nexusId, setNexusId] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('default');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [syncingPlatform, setSyncingPlatform] = useState<{platform: Platform, username: string} | null>(null);
  const [gamertags, setGamertags] = useState<Record<string, string>>({});

  // Carrega dados iniciais do stats global
  useEffect(() => {
    if (userStats) {
      setNexusId(userStats.nexusId);
      setDisplayName(userStats.nexusId.replace('@', ''));
      setAvatarSeed(userStats.nexusId);
    }
  }, [userStats]);

  if (!userStats) return null;

  const handleSaveProfile = () => {
    setIsSaving(true);
    
    // Garante o prefixo @ no Nexus ID
    const normalizedNewId = nexusId.startsWith('@') ? nexusId : `@${nexusId}`;
    
    setTimeout(() => {
      setUserStats(prev => prev ? {
        ...prev,
        nexusId: normalizedNewId
      } : null);
      
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    }, 1000);
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
      
      <header className="space-y-2 border-b border-nexus-800 pb-8">
         <h1 className="text-4xl font-display font-bold text-white flex items-center gap-3">
            <UserCircle className="text-nexus-accent" /> Configurações de Perfil
         </h1>
         <p className="text-gray-400">Gerencie sua identidade gamer e vincule suas contas globais.</p>
      </header>

      {/* SEÇÃO: IDENTIDADE GAMER */}
      <section className="space-y-6">
        <div className="bg-nexus-900 border border-nexus-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 items-center md:items-start shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sparkles size={120} />
           </div>

           <div className="relative group z-10">
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

           <div className="flex-1 w-full space-y-4 z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2 opacity-50">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-1">Apelido (Leitura)</label>
                    <input 
                      type="text" 
                      readOnly
                      value={displayName}
                      className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-5 py-4 text-gray-400 outline-none cursor-not-allowed"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-1">Nexus ID (Identificador)</label>
                    <input 
                      type="text" 
                      value={nexusId}
                      onChange={(e) => setNexusId(e.target.value)}
                      className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-5 py-4 text-white focus:border-nexus-accent outline-none font-mono transition-all"
                      placeholder="@nick_exemplo"
                    />
                 </div>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                 <div className="flex items-center gap-2 text-nexus-success text-[10px] font-bold uppercase tracking-widest">
                    <Shield size={14} /> Legado Sincronizado com a Nuvem
                 </div>
                 <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className={`px-8 py-3 font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg ${showSaved ? 'bg-green-600 text-white' : 'bg-nexus-accent hover:bg-nexus-accent/80 text-white shadow-nexus-accent/20'}`}
                 >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : (showSaved ? <Check size={18} /> : <Save size={18} />)}
                    {isSaving ? 'Gravando...' : (showSaved ? 'Sincronizado!' : 'Salvar Nexus ID')}
                 </button>
              </div>
           </div>
        </div>
      </section>

      {/* SEÇÃO: VINCULAR CONTAS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-nexus-800 pb-4">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Link2 className="text-nexus-secondary" /> Ecossistemas Vinculados
          </h2>
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
                        {isConnected ? `Sincronizado: ${linkedAccount?.username}` : 'Conecte seu ID para importar conquistas e horas.'}
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
                           className="flex-1 md:w-48 bg-nexus-900 border border-nexus-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-nexus-secondary outline-none"
                         />
                         <button 
                           onClick={() => startSync(platform.id)}
                           className="px-6 py-2.5 bg-nexus-secondary hover:bg-nexus-secondary/80 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-nexus-secondary/10"
                         >
                            Buscar Dados
                         </button>
                       </>
                     ) : (
                       <button 
                         onClick={() => unlinkAccount(platform.id)}
                         className="px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white font-bold rounded-xl text-xs transition-all"
                       >
                          Desvincular
                       </button>
                     )}
                  </div>
               </div>
             );
           })}
        </div>
      </section>

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
