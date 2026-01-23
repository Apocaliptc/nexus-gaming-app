
import React, { useState, useEffect } from 'react';
// Added ShieldCheck to imports from lucide-react
import { User, Camera, Link2, Unlink, Check, Save, RefreshCw, Smartphone, Monitor, Gamepad2, Database, Shield, ShieldCheck, Lock, ChevronDown, ChevronUp, AlertCircle, Globe, CloudCheck, ExternalLink, Server, Key, Wifi, WifiOff, Loader2, Sparkles, UserCircle, Info, Zap, Settings as SettingsIcon, Search, History } from 'lucide-react';
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
    <div className="h-full bg-[#050507] text-gray-100 overflow-y-auto custom-scrollbar animate-fade-in">
      <header className="p-10 border-b border-nexus-800 bg-gradient-to-b from-nexus-900/50 to-transparent">
         <div className="max-w-5xl mx-auto space-y-4">
            <h1 className="text-4xl font-display font-bold text-white flex items-center gap-4">
               <SettingsIcon className="text-nexus-accent" /> Nexus <span className="text-nexus-accent">Sync Hub</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">Gerencie suas conexões de rede, sincronize troféus e configure sua identidade soberana na nuvem.</p>
         </div>
      </header>

      <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-16 pb-40">
         
         {/* NEXUS CRAWLER - CONEXÃO INTELIGENTE */}
         <section className="space-y-8">
            <div className="flex items-center justify-between">
               <h2 className="text-3xl font-display font-bold text-white flex items-center gap-4">
                  <RefreshCw className="text-nexus-secondary" /> Nexus Crawler v4.0
               </h2>
               <div className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Sistema Online
               </div>
            </div>

            <div className="bg-nexus-900 border border-nexus-800 rounded-[3.5rem] p-12 space-y-10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                  <Globe size={250} />
               </div>
               
               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                     <p className="text-gray-400 text-lg leading-relaxed">
                        O Oráculo Nexus utiliza inteligência artificial para rastrear seus dados públicos de forma automática.
                     </p>
                     <div className="space-y-4">
                        <FeaturePoint icon={ShieldCheck} text="Não solicitamos senhas (apenas dados públicos)." />
                        <FeaturePoint icon={History} text="Logs de conquistas datados e verificados." />
                        <FeaturePoint icon={CloudCheck} text="Redundância em 5 redes de agregação." />
                     </div>
                  </div>

                  <div className="bg-nexus-800/50 p-8 rounded-[2.5rem] border border-nexus-700 space-y-6 backdrop-blur-md">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Rede Alvo</label>
                           <select 
                              value={crawlerPlatform}
                              onChange={(e) => setCrawlerPlatform(e.target.value as Platform)}
                              className="w-full bg-nexus-900 border border-nexus-700 rounded-2xl px-5 py-4 text-sm text-white focus:border-nexus-accent outline-none transition-all appearance-none"
                           >
                              {[Platform.STEAM, Platform.PSN, Platform.XBOX, Platform.BATTLENET, Platform.EPIC].map(p => (
                                 <option key={p} value={p}>{p}</option>
                              ))}
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Identificador Público</label>
                           <input 
                              type="text" 
                              value={crawlerUsername}
                              onChange={(e) => setCrawlerUsername(e.target.value)}
                              placeholder="Ex: @TheHunter_2024"
                              className="w-full bg-nexus-900 border border-nexus-700 rounded-2xl px-5 py-4 text-sm text-white focus:border-nexus-accent outline-none"
                           />
                        </div>
                     </div>

                     <button 
                        onClick={handleStartCrawler}
                        disabled={!crawlerUsername.trim()}
                        className="w-full py-5 bg-nexus-accent hover:bg-nexus-accent/80 text-white rounded-2xl transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-nexus-accent/20 disabled:opacity-50 flex items-center justify-center gap-3"
                     >
                        <Zap size={20} className="fill-white" /> Disparar Rastreamento IA
                     </button>
                  </div>
               </div>
            </div>
         </section>

         {/* CONTAS VINCULADAS */}
         <section className="space-y-8">
            <h2 className="text-3xl font-display font-bold text-white flex items-center gap-4">
               <Link2 className="text-nexus-secondary" /> Ecossistemas Ativos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {userStats?.linkedAccounts.map((account) => (
               <div key={account.platform} className="bg-nexus-900 border border-nexus-800 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-nexus-accent transition-all shadow-xl">
                  <div className="flex items-center gap-5">
                     <div className="w-14 h-14 bg-nexus-800 rounded-2xl flex items-center justify-center border border-nexus-700 group-hover:scale-110 transition-transform">
                        <PlatformIcon platform={account.platform} className="w-7 h-7" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{account.platform}</p>
                        <p className="text-white font-bold text-lg">{account.username}</p>
                     </div>
                  </div>
                  <button 
                     onClick={() => unlinkAccount(account.platform)}
                     className="p-3 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                  >
                     <Unlink size={22} />
                  </button>
               </div>
               ))}

               {userStats?.platformsConnected.length === 0 && (
               <div className="col-span-full py-20 text-center bg-nexus-900 border border-nexus-800 border-dashed rounded-[4rem]">
                  <WifiOff size={64} className="mx-auto mb-6 opacity-10" />
                  <p className="text-xl text-gray-500 font-medium italic">Nenhum ecossistema conectado.</p>
               </div>
               )}
            </div>
         </section>

         {/* PERFIL */}
         <section className="space-y-8">
            <h2 className="text-3xl font-display font-bold text-white flex items-center gap-4">
               <UserCircle className="text-nexus-accent" /> Identidade Soberana
            </h2>
            <div className="bg-nexus-900 border border-nexus-800 rounded-[3.5rem] p-10 flex flex-col md:flex-row gap-12 items-center md:items-start shadow-2xl relative overflow-hidden">
               <div className="relative group z-10 shrink-0">
                  <div className="w-40 h-40 rounded-[3rem] overflow-hidden border-4 border-nexus-800 shadow-2xl bg-nexus-800 transition-transform group-hover:scale-105 duration-500">
                     <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                        className="w-full h-full object-cover" 
                     />
                  </div>
                  <button 
                     onClick={() => setAvatarSeed(Math.random().toString(36))}
                     className="absolute -bottom-2 -right-2 p-4 bg-nexus-accent text-white rounded-2xl shadow-2xl border-4 border-nexus-900 hover:scale-110 transition-all"
                  >
                     <Camera size={20} />
                  </button>
               </div>

               <div className="flex-1 w-full space-y-8 z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3 opacity-50">
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Nome de Registro</label>
                        <input type="text" readOnly value={displayName} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-6 py-4 text-gray-400 cursor-not-allowed" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Nexus ID Público</label>
                        <input 
                           type="text" 
                           value={nexusId}
                           onChange={(e) => setNexusId(e.target.value)}
                           className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-6 py-4 text-white focus:border-nexus-accent outline-none font-mono text-lg"
                           placeholder="@seu-nick"
                        />
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-end">
                     <button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className={`px-12 py-5 font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-3 shadow-2xl ${showSaved ? 'bg-green-600 text-white shadow-green-500/20' : 'bg-nexus-accent hover:bg-nexus-accent/80 text-white shadow-nexus-accent/30'}`}
                     >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : (showSaved ? <Check size={20} /> : <Save size={20} />)}
                        {isSaving ? 'Codificando...' : (showSaved ? 'Sincronizado!' : 'Salvar Legado')}
                     </button>
                  </div>
               </div>
            </div>
         </section>

         {/* SEGURANÇA E INFORMAÇÕES */}
         <section className="space-y-8">
            <h2 className="text-3xl font-display font-bold text-white flex items-center gap-4">
               <Shield className="text-nexus-success" /> Segurança & Integridade Cloud
            </h2>
            <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 space-y-6 shadow-xl">
               <div className="flex items-center justify-between py-6 border-b border-nexus-800">
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 bg-nexus-800 rounded-2xl flex items-center justify-center text-gray-500 border border-nexus-700">
                        <Server size={24} />
                     </div>
                     <div>
                        <p className="text-base font-bold text-white">Status da Nuvem Soberana</p>
                        <p className="text-sm text-nexus-success font-medium">Online — Latência: 12ms</p>
                     </div>
                  </div>
                  <div className="px-5 py-2 bg-nexus-success/10 text-nexus-success border border-nexus-success/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Criptografia Militar</div>
               </div>
               
               <div className="p-8 bg-nexus-accent/5 border border-nexus-accent/20 rounded-[2rem] flex items-start gap-6">
                  <Info className="text-nexus-accent shrink-0 mt-1" size={28} />
                  <div className="space-y-2">
                     <h4 className="text-lg font-bold text-white">Privacidade do Hall da Fama</h4>
                     <p className="text-gray-400 leading-relaxed">
                        Seu legado gamer é armazenado de forma criptografada na Nuvem Nexus. O Crawler não possui acesso às suas senhas, apenas extrai dados públicos para compor seu Hall da Fama. Você é o único dono dos seus metadados de glória.
                     </p>
                  </div>
               </div>
            </div>
         </section>
      </div>

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

const FeaturePoint = ({ icon: Icon, text }: { icon: any, text: string }) => (
   <div className="flex items-center gap-4 text-gray-300">
      <div className="p-2 bg-nexus-accent/20 rounded-xl text-nexus-accent">
         <Icon size={18} />
      </div>
      <span className="text-sm font-medium">{text}</span>
   </div>
);
