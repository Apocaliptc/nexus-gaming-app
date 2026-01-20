
import React, { useState } from 'react';
import { Platform } from '../types';
import { Save, Link as LinkIcon, Shield, User, Globe, Search, AlertTriangle, Check, X, Share2, Copy } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { useAppContext } from '../context/AppContext';
import { encodeProfileForSharing } from '../services/shareService';
import { SyncPortal } from './SyncPortal';

export const Settings: React.FC = () => {
  const { userStats, setUserStats, linkAccount, unlinkAccount } = useAppContext();
  const [nexusId, setNexusId] = useState(userStats?.nexusId || '');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync Logic State
  const [syncingPlatform, setSyncingPlatform] = useState<Platform | null>(null);
  const [syncUsername, setSyncUsername] = useState('');
  const [isPreSync, setIsPreSync] = useState(false);

  if (!userStats) return null;

  const handleShareProfile = () => {
    const encoded = encodeProfileForSharing(userStats);
    const url = `${window.location.origin}${window.location.pathname}?view_legacy=${encoded}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const platformsList = [
    { id: Platform.STEAM, name: 'Steam', icon: <PlatformIcon platform={Platform.STEAM} /> },
    { id: Platform.PSN, name: 'PlayStation Network', icon: <PlatformIcon platform={Platform.PSN} /> },
    { id: Platform.XBOX, name: 'Xbox Live', icon: <PlatformIcon platform={Platform.XBOX} /> },
    { id: Platform.EPIC, name: 'Epic Games', icon: <PlatformIcon platform={Platform.EPIC} /> },
  ];

  const handleUnlink = (platform: Platform) => {
    if (confirm(`Desvincular sua conta da ${platform}? Seus dados sincronizados serão mantidos no Nexus.`)) {
      unlinkAccount(platform);
    }
  };

  const startSyncFlow = (platform: Platform) => {
    setSyncingPlatform(platform);
    setIsPreSync(true);
  };

  const handleSyncComplete = (games: any[], hours: number) => {
    if (syncingPlatform) {
      linkAccount(syncingPlatform, syncUsername, games, hours);
      setSyncingPlatform(null);
      setIsPreSync(false);
      setSyncUsername('');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in text-gray-100 pb-20 h-full overflow-y-auto custom-scrollbar">
      <div className="border-b border-nexus-700 pb-4">
        <h2 className="text-3xl font-display font-bold text-white">Configurações de Nuvem</h2>
        <p className="text-gray-400">Gerencie seu Legado Nexus e sincronize suas plataformas.</p>
      </div>

      <div className="bg-gradient-to-r from-nexus-accent/20 to-nexus-secondary/20 rounded-2xl border border-nexus-accent/30 p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="space-y-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <Share2 className="text-nexus-accent" /> Compartilhar meu Nexus
              </h3>
              <p className="text-sm text-gray-400 max-w-md">Seu Legacy Link permite que qualquer pessoa visualize seu perfil unificado em tempo real.</p>
           </div>
           <button 
             onClick={handleShareProfile}
             className={`px-6 py-4 rounded-xl font-bold text-white transition-all flex items-center gap-2 shadow-2xl ${copiedLink ? 'bg-green-500' : 'bg-nexus-accent hover:bg-nexus-accent/80'}`}
           >
             {copiedLink ? <><Check size={18} /> Link Copiado!</> : <><Copy size={18} /> Gerar Legacy Link</>}
           </button>
        </div>
      </div>

      <div className="bg-nexus-800 rounded-2xl border border-nexus-700 p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <LinkIcon className="text-nexus-secondary" /> Conectar Plataformas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platformsList.map((platform) => {
            const isConnected = userStats.linkedAccounts.some(acc => acc.platform === platform.id);
            return (
              <div key={platform.name} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isConnected ? 'bg-nexus-900/50 border-nexus-600' : 'bg-nexus-900/20 border-nexus-800 opacity-70 hover:opacity-100'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg ${isConnected ? 'bg-white/10' : 'bg-gray-800'}`}>{platform.icon}</div>
                  <h4 className="font-bold text-white truncate">{platform.name}</h4>
                </div>
                {isConnected ? (
                  <button onClick={() => handleUnlink(platform.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">Desvincular</button>
                ) : (
                  <button onClick={() => startSyncFlow(platform.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-nexus-accent/10 text-nexus-accent border border-nexus-accent/20 hover:bg-nexus-accent/20">Conectar Agora</button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sync Flow Modals */}
      {isPreSync && syncingPlatform && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-nexus-800 w-full max-w-md rounded-2xl border border-nexus-700 p-8 space-y-6">
            <div className="text-center space-y-2">
               <PlatformIcon platform={syncingPlatform} className="w-12 h-12 mx-auto" />
               <h3 className="text-2xl font-display font-bold text-white">Vincular {syncingPlatform}</h3>
               <p className="text-sm text-gray-500 italic">Digite seu ID público para que o Nexus possa escanear seu legado.</p>
            </div>
            <input 
              autoFocus
              type="text" 
              placeholder="Ex: GamerTag ou URL do Perfil"
              value={syncUsername}
              onChange={e => setSyncUsername(e.target.value)}
              className="w-full bg-nexus-900 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-accent outline-none"
            />
            <div className="flex gap-3">
               <button onClick={() => setIsPreSync(false)} className="flex-1 py-3 bg-nexus-900 text-gray-400 font-bold rounded-xl border border-nexus-700">Cancelar</button>
               <button 
                 disabled={!syncUsername}
                 onClick={() => setIsPreSync(false)} 
                 className="flex-1 py-3 bg-nexus-accent text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
               >
                 Iniciar Sync
               </button>
            </div>
          </div>
        </div>
      )}

      {syncingPlatform && !isPreSync && (
        <SyncPortal 
          platform={syncingPlatform} 
          username={syncUsername} 
          onComplete={handleSyncComplete} 
          onCancel={() => setSyncingPlatform(null)} 
        />
      )}
    </div>
  );
};
