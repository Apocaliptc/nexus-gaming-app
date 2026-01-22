
import React, { useState, useEffect } from 'react';
import { User, Camera, Link2, Unlink, Check, Save, RefreshCw, Smartphone, Monitor, Gamepad2, Database, Shield, Lock, ChevronDown, ChevronUp, AlertCircle, Globe, CloudCheck, ExternalLink, Server, Key, Wifi, WifiOff, Loader2, Sparkles, UserCircle, Info, Zap, Settings as SettingsIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Platform } from '../types';
import { PlatformIcon } from './PlatformIcon';
import { SyncPortal } from './SyncPortal';

export const Settings: React.FC = () => {
  const { userStats, setUserStats, linkAccount, unlinkAccount, updateCloudConfig, isCloudActive } = useAppContext();
  
  const [displayName, setDisplayName] = useState('');
  const [nexusId, setNexusId] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('default');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [syncingPlatform, setSyncingPlatform] = useState<{platform: Platform, username: string} | null>(null);

  const [dbUrl, setDbUrl] = useState('');
  const [dbKey, setDbKey] = useState('');

  useEffect(() => {
    if (userStats) {
      setNexusId(userStats.nexusId);
      setDisplayName(userStats.nexusId.replace('@', ''));
      setAvatarSeed(userStats.nexusId);
    }
  }, [userStats]);

  const handleUpdateCloud = () => {
     if (!dbUrl || !dbKey) {
        alert("Por favor, preencha a URL e a KEY do Supabase.");
        return;
     }
     updateCloudConfig(dbUrl, dbKey);
     alert("Configurações de nuvem atualizadas! Tente fazer login ou cadastrar agora.");
  };

  const handleSaveProfile = () => {
    if (!isCloudActive) {
        alert("Erro: Você precisa configurar o Banco de Dados abaixo antes de salvar seu perfil.");
        return;
    }
    setIsSaving(true);
    const normalizedNewId = nexusId.startsWith('@') ? nexusId : `@${nexusId}`;
    
    // Simula salvamento
    setTimeout(() => {
      setUserStats(prev => prev ? { ...prev, nexusId: normalizedNewId } : null);
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    }, 800);
  };

  const handleSyncComplete = (games: any[], hours: number) => {
    if (syncingPlatform) {
      linkAccount(syncingPlatform.platform, syncingPlatform.username, games, hours);
      setSyncingPlatform(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-12 animate-fade-in pb-24 h-full overflow-y-auto custom-scrollbar text-gray-100">
      
      <header className="space-y-2 border-b border-nexus-800 pb-8">
         <h1 className="text-4xl font-display font-bold text-white flex items-center gap-3">
            <SettingsIcon className="text-nexus-accent" /> Configurações
         </h1>
         <p className="text-gray-400">Configure a espinha dorsal do seu Nexus.</p>
      </header>

      {/* CONECTIVIDADE SUPABASE */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-nexus-800 pb-4">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Database className="text-nexus-secondary" /> Conexão Supabase
          </h2>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${isCloudActive ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
             {isCloudActive ? 'CONECTADO' : 'DESCONECTADO'}
          </div>
        </div>

        <div className="bg-nexus-900 border border-nexus-800 rounded-3xl p-8 space-y-6">
           <div className="p-4 bg-nexus-secondary/5 border border-nexus-secondary/20 rounded-2xl flex items-start gap-3">
              <Info className="text-nexus-secondary shrink-0" size={18} />
              <div className="text-xs text-gray-400 space-y-2">
                 <p>O Nexus utiliza a API REST do Supabase. Obtenha os dados em <strong>Project Settings > API</strong> no seu painel Supabase.</p>
                 <p className="text-nexus-accent">Certifique-se de executar o SQL de criação de tabelas antes de tentar conectar!</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Supabase Project URL</label>
                 <input 
                   type="text" 
                   value={dbUrl}
                   onChange={e => setDbUrl(e.target.value)}
                   className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-5 py-4 text-white focus:border-nexus-secondary outline-none transition-all"
                   placeholder="https://abc.supabase.co"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Anon Key (Public API Key)</label>
                 <input 
                   type="password" 
                   value={dbKey}
                   onChange={e => setDbKey(e.target.value)}
                   className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-5 py-4 text-white focus:border-nexus-secondary outline-none transition-all"
                   placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                 />
              </div>
           </div>

           <button 
             onClick={handleUpdateCloud}
             className="w-full py-4 bg-nexus-secondary hover:bg-nexus-secondary/80 text-white font-bold rounded-2xl transition-all shadow-xl shadow-nexus-secondary/20 flex items-center justify-center gap-2"
           >
              <Zap size={18} /> Aplicar Configurações de Nuvem
           </button>
        </div>
      </section>

      {/* PERFIL */}
      <section className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <UserCircle className="text-nexus-accent" /> Perfil Gamer
        </h2>
        <div className="bg-nexus-900 border border-nexus-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 items-center md:items-start shadow-xl relative overflow-hidden">
           <div className="relative group z-10">
              <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-nexus-800 shadow-2xl bg-nexus-800">
                 <img 
                   src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                   className="w-full h-full object-cover" 
                 />
              </div>
              <button 
                onClick={() => setAvatarSeed(Math.random().toString(36))}
                className="absolute -bottom-2 -right-2 p-3 bg-nexus-accent text-white rounded-2xl shadow-lg border-4 border-nexus-900"
              >
                <Camera size={18} />
              </button>
           </div>

           <div className="flex-1 w-full space-y-4 z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2 opacity-50">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-1">Nome</label>
                    <input type="text" readOnly value={displayName} className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-5 py-4 text-gray-400 cursor-not-allowed" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-1">Nexus ID</label>
                    <input 
                      type="text" 
                      value={nexusId}
                      onChange={(e) => setNexusId(e.target.value)}
                      className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-5 py-4 text-white focus:border-nexus-accent outline-none font-mono"
                      placeholder="@seu-nick"
                    />
                 </div>
              </div>
              
              <div className="flex items-center justify-end pt-4">
                 <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className={`px-8 py-3 font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg ${showSaved ? 'bg-green-600 text-white' : 'bg-nexus-accent hover:bg-nexus-accent/80 text-white'}`}
                 >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : (showSaved ? <Check size={18} /> : <Save size={18} />)}
                    {isSaving ? 'Gravando...' : (showSaved ? 'Sincronizado!' : 'Salvar Alterações')}
                 </button>
              </div>
           </div>
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
