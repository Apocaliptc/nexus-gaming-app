
import React, { useState, useEffect } from 'react';
import { Save, Shield, User, Globe, Database, Server, Key, Link2, ChevronDown, ChevronUp, Copy, Check, Terminal, Table, FileCode, AlertCircle, ExternalLink, ShieldCheck, XCircle, Info, RefreshCw, Sparkles, Monitor, CloudUpload } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { nexusCloud } from '../services/nexusCloud';

export const Settings: React.FC = () => {
  const { userStats } = useAppContext();
  const [dbUrl, setDbUrl] = useState(localStorage.getItem('nexus_db_url') || '');
  const [dbKey, setDbKey] = useState(localStorage.getItem('nexus_db_key') || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncingManual, setIsSyncingManual] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!userStats) return null;

  const sqlSchema = `
-- 1. NEXUS MASTER SCHEMA
-- Cole no 'SQL Editor' do Supabase e clique em 'RUN'

CREATE TABLE IF NOT EXISTS profiles (
  nexus_id TEXT PRIMARY KEY,
  total_hours INTEGER DEFAULT 0,
  total_achievements INTEGER DEFAULT 0,
  platinum_count INTEGER DEFAULT 0,
  prestige_points INTEGER DEFAULT 100,
  games_owned INTEGER DEFAULT 0,
  linked_accounts JSONB DEFAULT '[]',
  platforms_connected TEXT[] DEFAULT '{}',
  genre_distribution JSONB DEFAULT '[]',
  platform_distribution JSONB DEFAULT '[]',
  consistency JSONB DEFAULT '{}',
  skills JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS library (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(nexus_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  hours_played INTEGER DEFAULT 0,
  achievement_count INTEGER DEFAULT 0,
  total_achievements INTEGER DEFAULT 0,
  cover_url TEXT,
  last_played TIMESTAMPTZ,
  genres TEXT[],
  achievements JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS chronos_journal (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(nexus_id) ON DELETE CASCADE,
  date TIMESTAMPTZ DEFAULT NOW(),
  game_title TEXT,
  raw_input TEXT,
  narrative TEXT,
  mood TEXT
);

-- 2. DESATIVAR SEGURANÇA PARA USO PESSOAL (IMPORTANTE!)
-- Isso permite que o app salve dados usando a chave 'anon' pública.
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE library DISABLE ROW LEVEL SECURITY;
ALTER TABLE chronos_journal DISABLE ROW LEVEL SECURITY;
  `.trim();

  const handleConnectDatabase = async () => {
    if (!dbUrl || !dbKey) {
      setErrorMessage("Por favor, preencha o Project ID e a chave 'anon'.");
      setConnectionStatus('error');
      return;
    }

    if (dbKey.startsWith('sb_secret')) {
      setErrorMessage("Você tentou usar a Secret Key. O Supabase bloqueia essa chave no navegador por segurança. Use a chave 'anon / public'.");
      setConnectionStatus('error');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('idle');
    setErrorMessage('');

    let finalUrl = dbUrl.trim();
    if (!finalUrl.startsWith('http') && !finalUrl.includes('.')) {
      finalUrl = `https://${finalUrl}.supabase.co`;
    }
    finalUrl = finalUrl.replace(/\/$/, "");

    try {
      const res = await fetch(`${finalUrl}/rest/v1/profiles?limit=1`, {
        headers: {
          'apikey': dbKey.trim(),
          'Authorization': `Bearer ${dbKey.trim()}`
        }
      });

      if (res.ok) {
        nexusCloud.updateConfig(finalUrl, dbKey.trim());
        setDbUrl(finalUrl);
        setConnectionStatus('success');
        await nexusCloud.saveUser(userStats);
      } else {
        setErrorMessage("Falha na conexão. Verifique se a chave 'anon' está correta e se você rodou o script SQL.");
        setConnectionStatus('error');
      }
    } catch (e) {
      setErrorMessage("Erro de rede. Verifique seu Project ID.");
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualSync = async () => {
    if (!localStorage.getItem('nexus_db_url')) return;
    setIsSyncingManual(true);
    try {
      await nexusCloud.saveUser(userStats);
      alert("Legado sincronizado com sucesso no Cloud!");
    } catch (e) {
      alert("Erro ao sincronizar.");
    } finally {
      setIsSyncingManual(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in text-gray-100 pb-20 h-full overflow-y-auto custom-scrollbar">
      
      <div className="bg-gradient-to-r from-red-500/20 to-nexus-accent/20 border border-red-500/30 rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-500 rounded-2xl">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Atenção: Use a Chave 'anon' (Public)</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              O Supabase proíbe o uso da <b>Secret Key</b> (sb_secret...) no navegador. 
              Vá em <i>Project Settings > API</i> e copie a chave chamada <b>anon / public</b>.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center border-b border-nexus-700 pb-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Configuração da Nuvem</h2>
          <p className="text-gray-400 font-medium">Conecte o Nexus ao seu banco de dados Supabase.</p>
        </div>
        {connectionStatus === 'success' && (
          <button 
            onClick={handleManualSync}
            disabled={isSyncingManual}
            className="flex items-center gap-2 px-4 py-2 bg-nexus-accent/20 text-nexus-accent border border-nexus-accent/30 rounded-xl hover:bg-nexus-accent/30 transition-all font-bold text-xs"
          >
            {isSyncingManual ? <RefreshCw className="animate-spin" size={14} /> : <CloudUpload size={14} />}
            {isSyncingManual ? 'Sincronizando...' : 'Forçar Sync Cloud'}
          </button>
        )}
      </div>

      <div className={`bg-nexus-900 border-2 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative transition-all duration-500 ${
        connectionStatus === 'success' ? 'border-green-500/40' : 
        connectionStatus === 'error' ? 'border-red-500/40' : 'border-nexus-accent/20'
      }`}>
        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                   <Link2 size={12} /> Project ID ou URL
                </label>
                <input 
                  type="text" 
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  placeholder="Ex: xdwzlvnzgibgebcyxusy"
                  className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-accent outline-none font-mono text-xs"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                   <Key size={12} /> Key "anon / public"
                </label>
                <input 
                  type="password" 
                  value={dbKey}
                  onChange={(e) => setDbKey(e.target.value)}
                  placeholder="NÃO use a sb_secret_..."
                  className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-accent outline-none font-mono text-xs"
                />
             </div>
          </div>

          {connectionStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div><p className="font-bold">Erro de Segurança</p><p>{errorMessage}</p></div>
            </div>
          )}

          <button 
            onClick={handleConnectDatabase}
            disabled={isConnecting}
            className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
              connectionStatus === 'success' ? 'bg-green-600' : 'bg-nexus-accent hover:bg-nexus-accent/80'
            }`}
          >
            {isConnecting ? <RefreshCw className="animate-spin" size={18} /> : connectionStatus === 'success' ? <Check size={18} /> : null}
            {isConnecting ? "Validando..." : connectionStatus === 'success' ? "Sistema Conectado" : "Ativar Nuvem Nexus"}
          </button>
        </div>
      </div>

      <div className="bg-nexus-800 border border-nexus-700 rounded-[2.5rem] p-8 space-y-4">
         <div className="flex items-center gap-3">
            <FileCode className="text-nexus-secondary" size={24} />
            <h3 className="text-xl font-bold text-white">Novo Script SQL (Ajustado)</h3>
         </div>
         <p className="text-xs text-gray-400">Este script desativa o RLS para que o app consiga salvar dados.</p>
         <pre className="bg-black/40 p-6 rounded-2xl text-[10px] font-mono text-nexus-secondary overflow-x-auto border border-nexus-700 h-64 custom-scrollbar">
            {sqlSchema}
         </pre>
         <button 
            onClick={() => {
              navigator.clipboard.writeText(sqlSchema);
              alert("SQL Copiado! Rode no Supabase para liberar o acesso.");
            }}
            className="w-full py-3 bg-nexus-900 border border-nexus-700 rounded-xl text-xs font-bold hover:bg-nexus-700 transition-all flex items-center justify-center gap-2"
         >
            <Copy size={16} /> Copiar Novo SQL
         </button>
      </div>
    </div>
  );
};
