
import React, { useState, useEffect, useRef } from 'react';
import { Platform, Game } from '../types';
import { fetchPublicProfileData } from '../services/geminiService';
import { Loader2, Zap, Check, ShieldCheck, Globe, AlertCircle, RefreshCw, Info, ExternalLink, Database, Search, XCircle, ArrowRight, BrainCircuit } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';

interface Props {
  platform: Platform;
  username: string;
  onComplete: (games: Game[], totalHours: number) => void;
  onCancel: () => void;
}

export const SyncPortal: React.FC<Props> = ({ platform, username, onComplete, onCancel }) => {
  const [status, setStatus] = useState<'connecting' | 'fetching' | 'processing' | 'saving' | 'done' | 'error'>('connecting');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [foundData, setFoundData] = useState<{ games: Game[], totalHours: number } | null>(null);
  const logIntervalRef = useRef<number | null>(null);

  const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`].slice(-6));

  useEffect(() => {
    let isMounted = true;

    const runSync = async () => {
      // Step 1: Connecting
      addLog(`Iniciando Handshake com ecossistema ${platform}...`);
      await new Promise(r => setTimeout(r, 800));
      if (!isMounted) return;
      
      // Step 2: Fetching
      setStatus('fetching');
      const targetHint = platform === Platform.PSN ? 'PSNProfiles + Exophase' : platform === Platform.STEAM ? 'SteamCommunity' : 'Agregadores';
      addLog(`IA Crawler ativada com Lógica Scraper v4.0. Escaneando ${targetHint}/${username}...`);
      setProgress(20);
      
      // Pseudo-live logs
      const thinkingLogs = [
        "Acessando Google Search Grounding...",
        "Carregando Protocolo PSNProfiles-Scraper (yndajas)...",
        `Extraindo dados via Grounding de https://psnprofiles.com/${username}...`,
        "IA: Analisando seletores de troféus e raridade...",
        "Executando redundância via Exophase.com...",
        "Calculando volume de horas de imersão...",
        "Sincronizando vetores com a Nuvem Soberana Nexus..."
      ];
      let logIdx = 0;
      logIntervalRef.current = window.setInterval(() => {
        if (logIdx < thinkingLogs.length) {
          addLog(`[CRAWLER] ${thinkingLogs[logIdx]}`);
          logIdx++;
          setProgress(prev => Math.min(prev + 8, 80));
        }
      }, 3500);

      try {
        const data = await fetchPublicProfileData(platform, username);
        if (logIntervalRef.current) clearInterval(logIntervalRef.current);
        
        if (!isMounted) return;
        
        if (data.sources.length > 0) {
          setSources(data.sources);
          addLog(`Sucesso: IA confirmou dados via ${data.sources.length} fontes.`);
        }
        
        if (data.games.length === 0 && data.totalHours === 0) {
          setStatus('error');
          addLog(`AVISO: A IA não conseguiu extrair dados legíveis com o scraper atual.`);
          return;
        }

        setFoundData({ games: data.games, totalHours: data.totalHours });
        addLog(`Legado Capturado: ${data.games.length} jogos sintonizados via Scraper.`);
        setProgress(90);
        
        // Step 3: Processing
        setStatus('processing');
        addLog(`Refinando Power Level e sincronizando troféus...`);
        await new Promise(r => setTimeout(r, 1200));
        setProgress(96);
        
        // Step 4: Saving
        setStatus('saving');
        addLog(`Transmitindo dados para o Hall da Fama...`);
        await new Promise(r => setTimeout(r, 800));
        setProgress(99);
        
        // Step 5: Done
        setStatus('done');
        addLog(`Sincronização Finalizada. Bem-vindo ao Nexus.`);
        setProgress(100);
        
        await new Promise(r => setTimeout(r, 1000));
        if (isMounted) onComplete(data.games, data.totalHours);
      } catch (err) {
        setStatus('error');
        addLog(`ERRO FATAL: Falha crítica na conexão com o Oráculo.`);
      }
    };

    runSync();
    return () => { 
      isMounted = false; 
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#050507]/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-6 overflow-y-auto">
       <div className="w-full max-w-xl space-y-8 py-10">
          
          <div className="text-center space-y-6">
            <div className="relative inline-block">
               <div className={`w-24 h-24 rounded-[2.5rem] bg-nexus-900 border-2 flex items-center justify-center mx-auto shadow-2xl transition-all duration-500 ${
                 status === 'done' ? 'border-nexus-success text-nexus-success shadow-nexus-success/20' : 
                 status === 'error' ? 'border-red-500 text-red-500 shadow-red-500/20' :
                 'border-nexus-accent text-nexus-accent shadow-nexus-accent/20'
               }`}>
                  {status === 'done' ? <Check size={48} /> : 
                   status === 'error' ? <XCircle size={48} /> :
                   <div className="relative">
                      <BrainCircuit size={40} className="animate-pulse text-nexus-accent" />
                      <div className="absolute inset-0 bg-nexus-accent blur-xl opacity-20"></div>
                   </div>}
               </div>
               {status !== 'done' && status !== 'error' && (
                  <div className="absolute -inset-4 border-2 border-nexus-accent/20 border-t-nexus-accent rounded-full animate-spin"></div>
               )}
            </div>

            <div className="space-y-2">
               <h2 className="text-4xl font-display font-bold text-white tracking-tighter">
                  {status === 'connecting' && 'Sintonizando...'}
                  {status === 'fetching' && 'Extraindo Dados...'}
                  {status === 'processing' && 'Ajustando Legado...'}
                  {status === 'saving' && 'Gravando Cloud...'}
                  {status === 'done' && 'Sincronizado!'}
                  {status === 'error' && 'Falha na IA Crawler'}
               </h2>
               <p className="text-gray-400 font-medium italic text-lg">
                  {username} @ {platform}
               </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="w-full bg-nexus-900 h-2 rounded-full overflow-hidden border border-nexus-800">
               <div 
                 className={`h-full transition-all duration-700 ease-out ${status === 'error' ? 'bg-red-500' : 'bg-gradient-to-r from-nexus-accent to-nexus-secondary'}`} 
                 style={{ width: `${progress}%` }}
               ></div>
            </div>

            <div className="bg-black/40 rounded-3xl border border-nexus-800 p-6 font-mono text-[10px] space-y-2 min-h-[140px] shadow-inner text-left">
               {logs.map((log, i) => (
                  <div key={i} className={`flex gap-3 ${i === logs.length - 1 ? (status === 'error' ? 'text-red-500' : 'text-nexus-accent animate-pulse') : 'text-gray-500'}`}>
                     <span className="opacity-30 shrink-0">[{i+1}]</span>
                     <span>{log}</span>
                  </div>
               ))}
            </div>
          </div>

          {status === 'error' && (
            <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-[2.5rem] space-y-6 animate-fade-in">
               <div className="flex items-center gap-4 text-red-500">
                  <AlertCircle size={32} />
                  <p className="text-sm font-bold text-left">O Protocolo de Scraper falhou em ler os dados.</p>
               </div>
               <div className="text-gray-400 text-xs leading-relaxed space-y-4 bg-black/30 p-4 rounded-2xl text-left">
                  <p>A Sony protege os dados contra bots. Tente estas etapas para "limpar o caminho":</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Abra o site <a href="https://psnprofiles.com" target="_blank" className="text-nexus-accent underline">PSNProfiles.com</a> e busque seu ID lá para forçar uma atualização.</li>
                    <li>Verifique se o site <strong>Exophase.com</strong> também mostra seus jogos (busque lá).</li>
                    <li>No console, mude sua privacidade de "Qualquer um" para "Privado" e depois volte para "Qualquer um" para resetar o status na rede da Sony.</li>
                  </ol>
               </div>
               <div className="flex gap-4">
                  <button onClick={onCancel} className="flex-1 py-3 bg-nexus-800 hover:bg-nexus-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                    Voltar
                  </button>
                  <button onClick={() => window.location.reload()} className="flex-1 py-3 bg-nexus-accent hover:bg-nexus-accent/80 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                    Tentar Novamente
                  </button>
               </div>
            </div>
          )}

          {sources.length > 0 && status !== 'error' && (
            <div className="space-y-3 animate-fade-in">
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">Fontes Verificadas pela IA:</p>
               <div className="grid grid-cols-1 gap-2">
                  {sources.map((source, i) => (
                     <div key={i} className="flex items-center justify-between gap-2 px-4 py-2 bg-nexus-800/50 border border-nexus-700 rounded-xl text-[10px] text-gray-400 group">
                        <div className="flex items-center gap-2 truncate">
                           <Globe size={12} className="text-nexus-secondary shrink-0" />
                           <span className="truncate">{source.web?.uri || source.web?.title}</span>
                        </div>
                        <ArrowRight size={10} className="text-gray-600 group-hover:text-nexus-accent" />
                     </div>
                  ))}
               </div>
            </div>
          )}
       </div>
    </div>
  );
};
