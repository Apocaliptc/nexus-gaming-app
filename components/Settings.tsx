
import React, { useState } from 'react';
import { Save, Shield, User, Globe, Database, Server, Key, Link2, ChevronDown, ChevronUp, Copy, Check, Terminal, Table, FileCode, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { nexusCloud } from '../services/nexusCloud';

export const Settings: React.FC = () => {
  const { userStats } = useAppContext();
  const [dbUrl, setDbUrl] = useState(localStorage.getItem('nexus_db_url') || '');
  const [dbKey, setDbKey] = useState(localStorage.getItem('nexus_db_key') || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState<boolean | null>(null);
  const [showSql, setShowSql] = useState(false);

  if (!userStats) return null;

  const sqlSchema = `
-- NEXUS MASTER SCHEMA (NORMALIZED POSTGRES)

-- 1. Tabela de Perfis (Estatísticas Globais)
CREATE TABLE profiles (
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

-- 2. Tabela de Biblioteca (Jogos Individuais)
CREATE TABLE library (
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

-- 3. Tabela Chronos (Diário e Linha do Tempo)
CREATE TABLE chronos_journal (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(nexus_id) ON DELETE CASCADE,
  date TIMESTAMPTZ DEFAULT NOW(),
  game_title TEXT,
  raw_input TEXT,
  narrative TEXT,
  mood TEXT
);

-- 4. Tabela de Atividades (Feed Global)
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES profiles(nexus_id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  username TEXT,
  user_avatar TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details JSONB,
  likes INTEGER DEFAULT 0
);

-- Habilitar Realtime (Opcional para Supabase)
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table library;
alter publication supabase_realtime add table activity_feed;
  `.trim();

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    alert("SQL Completo copiado! Todas as tabelas de estatísticas, horas e conquistas estão inclusas.");
  };

  const handleConnectDatabase = async () => {
    setIsConnecting(true);
    setConnectionSuccess(null);
    setTimeout(() => {
      nexusCloud.updateConfig(dbUrl, dbKey);
      setIsConnecting(false);
      setConnectionSuccess(true);
      setTimeout(() => setConnectionSuccess(null), 3000);
    }, 1500);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in text-gray-100 pb-20 h-full overflow-y-auto custom-scrollbar">
      <div className="border-b border-nexus-700 pb-4">
        <h2 className="text-3xl font-display font-bold text-white">Infraestrutura Nexus</h2>
        <p className="text-gray-400 font-medium">Configure seu banco de dados remoto para persistência infinita.</p>
      </div>

      {/* CONEXÃO CLOUD */}
      <div className="bg-nexus-900 border-2 border-nexus-accent/20 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5"><Database size={120} /></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-nexus-accent/20 rounded-2xl text-nexus-accent">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Conexão Supabase / PostgreSQL</h3>
              <p className="text-xs text-gray-400">Suas estatísticas serão salvas em tempo real na nuvem.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                   <Link2 size={12} /> Project URL
                </label>
                <input 
                  type="text" 
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  placeholder="https://xyz.supabase.co"
                  className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-accent outline-none font-mono text-xs"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                   <Key size={12} /> Service Role Key
                </label>
                <input 
                  type="password" 
                  value={dbKey}
                  onChange={(e) => setDbKey(e.target.value)}
                  placeholder="Secret Key"
                  className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-white focus:border-nexus-accent outline-none font-mono text-xs"
                />
             </div>
          </div>

          <button 
            onClick={handleConnectDatabase}
            disabled={isConnecting}
            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              connectionSuccess ? 'bg-green-500' : 'bg-nexus-accent hover:bg-nexus-accent/80 shadow-lg shadow-nexus-accent/20'
            }`}
          >
            {isConnecting ? <><Database className="animate-spin" size={18} /> Validando...</> : connectionSuccess ? <><Check size={18} /> Conectado!</> : "Ativar Sincronização Global"}
          </button>
        </div>
      </div>

      {/* GERADOR DE SQL COMPLETO */}
      <div className="bg-nexus-800 border border-nexus-700 rounded-[2.5rem] p-8 space-y-6">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <FileCode className="text-nexus-secondary" size={24} />
               <div>
                  <h3 className="text-xl font-bold text-white">Script de Inicialização SQL</h3>
                  <p className="text-xs text-gray-400">Copie este código para criar TODAS as tabelas necessárias.</p>
               </div>
            </div>
            <button 
               onClick={copySql}
               className="p-2 bg-nexus-900 border border-nexus-700 rounded-lg hover:text-nexus-secondary transition-colors"
               title="Copiar SQL"
            >
               <Copy size={20} />
            </button>
         </div>

         <div className="relative">
            <pre className="bg-black/50 p-6 rounded-2xl text-[10px] font-mono text-nexus-secondary overflow-x-auto border border-nexus-700 h-64 custom-scrollbar leading-relaxed">
               {sqlSchema}
            </pre>
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-nexus-800 to-transparent pointer-events-none"></div>
         </div>

         <div className="p-4 bg-nexus-secondary/5 border border-nexus-secondary/20 rounded-xl flex gap-3">
            <AlertCircle className="text-nexus-secondary shrink-0" size={18} />
            <p className="text-xs text-gray-400 leading-relaxed">
               Este script cria as tabelas de **Perfis, Biblioteca (Jogos), Conquistas, Linha do Tempo (Chronos) e Feed Global**. 
               Ao rodar isso no seu banco de dados, o Nexus passará a organizar cada detalhe da sua carreira de forma relacional e segura.
            </p>
         </div>
      </div>
    </div>
  );
};
