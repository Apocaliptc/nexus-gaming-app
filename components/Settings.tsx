
import React, { useState } from 'react';
import { User, Camera, Link2, Unlink, Check, Save, RefreshCw, Smartphone, Monitor, Gamepad2, Database, Shield, Lock, ChevronDown, ChevronUp, AlertCircle, Globe, CloudCheck, ExternalLink } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Platform } from '../types';
import { PlatformIcon } from './PlatformIcon';
import { SyncPortal } from './SyncPortal';

export const Settings: React.FC = () => {
  const { userStats, setUserStats, linkAccount, unlinkAccount } = useAppContext();
  
  // Profile State
  const [displayName, setDisplayName] = useState(userStats?.nexusId.replace('@', '') || '');
  const [nexusId, setNexusId] = useState(userStats?.nexusId || '');
  const [avatarSeed, setAvatarSeed] = useState(userStats?.nexusId || 'default');
  
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

  const startSync = (platform: Platform) => {
    const username = gamertags[platform];
    if (!username) {
      alert(`Por favor, insira seu nome de usuário da ${platform}`);
      return;
    }
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
    { id: Platform.EPIC, name: 'Epic Games', color: 'text-white' },
    { id: Platform.SWITCH, name: 'Nintendo Online', color: 'text-red-500' },
    { id: Platform.BATTLENET, name: 'Battle.net', color: 'text-blue-300' }
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10 animate-fade-in pb-24 h-full overflow-y-auto custom-scrollbar text-gray-100">
      
      {/* SECTION: GAMER IDENTITY */}
      <section className="space-y-6">
        <div className="border-b border-nexus-700 pb-4">
          <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <User className="text-nexus-accent" /> Identidade Gamer
          </h2>
          <p className="text-gray-400">Como o mundo vê seu legado no Nexus.</p>
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
                Salvar Alterações
              </button>
           </div>
        </div>
      </section>

      {/* SECTION: LINK ACCOUNTS */}
      <section className="space-y-6">
        <div className="border-b border-nexus-700 pb-4">
          <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Link2 className="text-nexus-secondary" /> Vincular Ecossistemas
          </h2>
          <p className="text-gray-400">Conecte suas gamertags para unificar estatísticas e conquistas.</p>
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
                        {isConnected ? `Conectado como: ${linkedAccount?.username}` : 'Sincronize seu progresso agora.'}
                     </p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                     {!isConnected ? (
                       <>
                         <input 
                           type="text" 
                           placeholder="Gamertag / Username"
                           value={gamertags[platform.id] || ''}
                           onChange={(e) => setGamertags({...gamertags, [platform.id]: e.target.value})}
                           className="flex-1 md:w-48 bg-nexus-900 border border-nexus-700 rounded-xl px-4 py-2 text-sm text-white focus:border-nexus-secondary outline-none"
                         />
                         <button 
                           onClick={() => startSync(platform.id)}
                           className="px-6 py-2 bg-nexus-secondary hover:bg-nexus-secondary/80 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2"
                         >
                            Vincular
                         </button>
                       </>
                     ) : (
                       <button 
                         onClick={() => unlinkAccount(platform.id)}
                         className="px-6 py-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2"
                       >
                          <Unlink size={14} /> Desvincular
                       </button>
                     )}
                  </div>
               </div>
             );
           })}
        </div>
      </section>

      {/* FOOTER */}
      <div className="pt-10 flex gap-4 border-t border-nexus-800">
          <button 
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all text-xs"
          >
            Limpar Cache e Resetar App
          </button>
      </div>

      {/* SYNC MODAL OVERLAY */}
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
