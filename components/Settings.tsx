
import React, { useState, useEffect } from 'react';
import { User, Camera, Link2, Unlink, Check, Save, RefreshCw, Smartphone, Monitor, Gamepad2, Database, Shield, Lock, ChevronDown, ChevronUp, AlertCircle, Globe, CloudCheck, ExternalLink, Server, Key, Wifi, WifiOff, Loader2, Sparkles, UserCircle, Info, Zap, Settings as SettingsIcon, Search } from 'lucide-react';
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
  
  // Crawler State
  const [syncingPlatform, setSyncingPlatform] = useState<{platform: Platform, username: string} | null>(null);
  const [crawlerPlatform, setCrawlerPlatform] = useState<Platform>(Platform.STEAM);
  const [crawlerUsername, setCrawlerUsername] = useState('');

  useEffect(() => {
    if (userStats) {
      setNexusId(userStats.nexusId);
      setDisplayName(userStats.nexusId.replace('@', ''));
      setAvatarSeed(userStats.nexusId);
    }
  }, [userStats]);

  const handleSaveProfile = () => {
    setIsSaving(true);
    const normalizedNewId = nexusId.startsWith('@') ? nexusId : `@${nexusId}`;
    
    setTimeout(() => {
      setUserStats(prev => prev ? { ...prev, nexusId: normalizedNewId } : null);
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    }, 800);
  };

  const handleStartCrawler = () => {
    if (!crawlerUsername.trim()) return;
    setSyncingPlatform({ platform: crawlerPlatform, username: crawlerUsername });
  };

  const handleSyncComplete = (games: any[], hours: number) => {
    if (syncingPlatform) {
      linkAccount(syncingPlatform.platform, syncingPlatform.username, games, hours);
      setSyncingPlatform(null);
      setCrawlerUsername('');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-12 animate-fade-in pb-24 h-full overflow-y-auto custom-scrollbar text-gray-100">
      
      <header className="space-y-2 border-b border-nexus-800 pb-8">
         <h1 className="text-4xl font-display font-bold text-white flex items-center gap-3">
            <SettingsIcon className="text-nexus-accent" /> Configurações
         </h1>
         <p className="text-gray-400">Configure sua identidade e sincronize seu legado.</p>
      </header>

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

      {/* NEXUS CRAWLER - CONEXÃO INTELIGENTE */}
      <section className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Search className="text-nexus-accent" /> Nexus Crawler (Auto-Track)
        </h2>
        <div className="bg-nexus-900 border border-nexus-800 rounded-[2.5rem] p-8 space-y-6 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
              <Globe size={150} />
           </div>
           
           <div className="max-w-xl space-y-4 relative z-10">
              <p className="text-gray-400 text-sm">
                O Oráculo Nexus pode rastrear seus dados públicos de forma automática. <strong>Não precisamos da sua senha</strong>, apenas do seu nome de usuário público.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-1">Plataforma</label>
                    <select 
                      value={crawlerPlatform}
                      onChange={(e) => setCrawlerPlatform(e.target.value as Platform)}
                      className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3.5 text-white focus:border-nexus-accent outline-none appearance-none"
                    >
                       {[Platform.STEAM, Platform.PSN, Platform.XBOX, Platform.BATTLENET, Platform.EPIC].map(p => (
                         <option key={p} value={p}>{p}</option>
                       ))}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-1">ID / Username Público</label>
                    <input 
                      type="text" 
                      value={crawlerUsername}
                      onChange={(e) => setCrawlerUsername(e.target.value)}
                      placeholder="Ex: @dragonSlayer"
                      className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3.5 text-white focus:border-nexus-accent outline-none"
                    />
                 </div>
              </div>

              <button 
                onClick={handleStartCrawler}
                disabled={!crawlerUsername.trim()}
                className="flex items-center gap-2 px-8 py-4 bg-nexus-accent hover:bg-nexus-accent/80 text-white rounded-2xl transition-all font-bold shadow-xl shadow-nexus-accent/20 disabled:opacity-50"
              >
                 <Zap size={20} /> Iniciar Rastreamento IA
              </button>
           </div>
        </div>
      </section>

      {/* CONTAS VINCULADAS */}
      <section className="space-y-6">
         <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Link2 className="text-nexus-secondary" /> Ecossistemas Conectados
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userStats?.linkedAccounts.map((account) => (
              <div key={account.platform} className="bg-nexus-900 border border-nexus-800 p-6 rounded-3xl flex items-center justify-between group">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-nexus-800 rounded-2xl flex items-center justify-center border border-nexus-700">
                       <PlatformIcon platform={account.platform} className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{account.platform}</p>
                       <p className="text-white font-bold">{account.username}</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => unlinkAccount(account.platform)}
                   className="p-3 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                 >
                    <Unlink size={20} />
                 </button>
              </div>
            ))}

            {userStats?.platformsConnected.length === 0 && (
              <div className="col-span-full py-12 text-center bg-nexus-900 border border-nexus-800 border-dashed rounded-[3rem]">
                 <WifiOff size={48} className="mx-auto mb-4 opacity-10" />
                 <p className="text-gray-500 italic">Nenhum ecossistema conectado. Use o Crawler acima para começar.</p>
              </div>
            )}
         </div>
      </section>

      {/* SEGURANÇA E INFORMAÇÕES */}
      <section className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Shield className="text-nexus-success" /> Segurança & Cloud
        </h2>
        <div className="bg-nexus-900 border border-nexus-800 rounded-3xl p-8 space-y-4">
           <div className="flex items-center justify-between py-4 border-b border-nexus-800">
              <div className="flex items-center gap-3">
                 <Server className="text-gray-500" size={20} />
                 <div>
                    <p className="text-sm font-bold text-white">Status da Nuvem Soberana</p>
                    <p className="text-xs text-nexus-success">Online e Sincronizado</p>
                 </div>
              </div>
              <div className="px-3 py-1 bg-nexus-success/10 text-nexus-success border border-nexus-success/20 rounded-full text-[10px] font-bold uppercase tracking-widest">Master</div>
           </div>
           
           <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                 <Database className="text-gray-500" size={20} />
                 <div>
                    <p className="text-sm font-bold text-white">Redundância de Dados</p>
                    <p className="text-xs text-gray-500">Supabase Nexus Core Primary</p>
                 </div>
              </div>
           </div>

           <div className="pt-4 p-4 bg-nexus-accent/5 border border-nexus-accent/20 rounded-2xl flex items-start gap-3">
              <Info className="text-nexus-accent shrink-0" size={18} />
              <p className="text-xs text-gray-400">
                Seu legado gamer é armazenado de forma criptografada na Nuvem Nexus. O Crawler não possui acesso às suas senhas, apenas extrai dados públicos para compor seu Hall da Fama.
              </p>
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
