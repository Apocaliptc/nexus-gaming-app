
import React, { useState, useEffect } from 'react';
import { Platform, Game } from '../types';
import { fetchPublicProfileData } from '../services/geminiService';
import { Loader2, Zap, Check, ShieldCheck, Globe, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';

interface Props {
  platform: Platform;
  username: string;
  onComplete: (games: Game[], totalHours: number) => void;
  onCancel: () => void;
}

export const SyncPortal: React.FC<Props> = ({ platform, username, onComplete, onCancel }) => {
  const [status, setStatus] = useState<'connecting' | 'fetching' | 'processing' | 'saving' | 'done'>('connecting');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`].slice(-4));

  useEffect(() => {
    let isMounted = true;

    const runSync = async () => {
      // Step 1: Connecting
      addLog(`Estabelecendo handshake com ${platform} Gateway...`);
      await new Promise(r => setTimeout(r, 1500));
      if (!isMounted) return;
      
      // Step 2: Fetching
      setStatus('fetching');
      addLog(`Rastreando perfil público: "${username}" via Nexus Crawler...`);
      addLog(`Certifique-se de que seu perfil na ${platform} está definido como PÚBLICO.`);
      const data = await fetchPublicProfileData(platform, username);
      setProgress(40);
      
      // Step 3: Processing (Gemini simulated logic)
      setStatus('processing');
      addLog(`Analisando dados rastreados de ${data.games.length} jogos...`);
      await new Promise(r => setTimeout(r, 2000));
      setProgress(75);
      
      // Step 4: Saving
      setStatus('saving');
      addLog(`Consolidando estatísticas na sua Nuvem Nexus...`);
      await new Promise(r => setTimeout(r, 1500));
      setProgress(100);
      
      // Step 5: Done
      setStatus('done');
      addLog(`Sincronização concluída. Legado atualizado.`);
      await new Promise(r => setTimeout(r, 1000));
      
      if (isMounted) onComplete(data.games, data.totalHours);
    };

    runSync();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#050507]/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-6">
       <div className="w-full max-w-lg space-y-8 text-center">
          <div className="relative inline-block">
             <div className="w-24 h-24 rounded-3xl bg-nexus-900 border-2 border-nexus-accent flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(139,92,246,0.3)] animate-pulse">
                {status === 'done' ? <Check className="text-nexus-success" size={48} /> : <PlatformIcon platform={platform} className="w-12 h-12" />}
             </div>
             {status !== 'done' && (
                <div className="absolute -inset-4 border-4 border-nexus-accent/20 border-t-nexus-accent rounded-full animate-spin"></div>
             )}
          </div>

          <div className="space-y-2">
             <h2 className="text-3xl font-display font-bold text-white">
                {status === 'connecting' && 'Conectando ao Provedor...'}
                {status === 'fetching' && 'Iniciando Crawler...'}
                {status === 'processing' && 'Analisando Legado...'}
                {status === 'saving' && 'Gravando na Nuvem...'}
                {status === 'done' && 'Sincronizado!'}
             </h2>
             <p className="text-gray-400 font-medium">Usuário: {username} | Plataforma: {platform}</p>
          </div>

          <div className="w-full bg-nexus-900 h-3 rounded-full overflow-hidden border border-nexus-800">
             <div 
               className="h-full bg-gradient-to-r from-nexus-accent to-nexus-secondary transition-all duration-500 ease-out" 
               style={{ width: `${progress}%` }}
             ></div>
          </div>

          <div className="bg-black/40 rounded-2xl border border-nexus-800 p-4 text-left font-mono text-[10px] space-y-1">
             {logs.map((log, i) => (
                <div key={i} className={i === logs.length - 1 ? 'text-nexus-secondary animate-pulse' : 'text-gray-600'}>
                   {log}
                </div>
             ))}
          </div>

          <div className="p-4 bg-nexus-secondary/5 border border-nexus-secondary/20 rounded-xl flex items-start gap-3 text-left">
             <Info className="text-nexus-secondary shrink-0" size={16} />
             <p className="text-[10px] text-gray-400 leading-tight">
                <strong>Nota Técnica:</strong> Este processo simula o rastreamento de perfis públicos (estilo Tracker.gg). Se seus dados não aparecerem, verifique se seu perfil na {platform} está configurado como 'Público' nas opções de privacidade.
             </p>
          </div>

          {status !== 'done' && (
             <button 
               onClick={onCancel}
               className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
             >
               Cancelar Sincronização
             </button>
          )}
       </div>
    </div>
  );
};
