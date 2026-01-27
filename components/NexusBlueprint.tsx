
import React, { useState } from 'react';
import { 
  FileCode, Layers, GitBranch, Share2, Database, ListTodo, 
  User, Server, Cpu, Globe, ArrowRight, Zap, Target, 
  CheckCircle2, Clock, Play, MessageSquare, ShieldCheck, Box,
  Search, X, RefreshCw, Code2, Link2, Key, Activity, Workflow,
  Info, AlertTriangle, Terminal, Settings, HardDrive, BrainCircuit,
  Lock, Layout, AppWindow
} from 'lucide-react';

type BlueprintTab = 'usecase' | 'state' | 'interaction' | 'ai_spec' | 'conceptual' | 'infrastructure';

export const NexusBlueprint: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BlueprintTab>('usecase');

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 animate-fade-in overflow-hidden">
      <header className="p-8 border-b border-nexus-800 bg-gradient-to-b from-nexus-900/50 to-transparent shrink-0">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-bold text-white tracking-tighter flex items-center gap-4">
              <Terminal className="text-nexus-accent" size={36} /> NEXUS <span className="text-nexus-accent">BLUEPRINT</span>
            </h1>
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">Technical Documentation & System Design v4.8</p>
          </div>
          <div className="flex gap-2">
             <div className="flex items-center gap-2 px-3 py-1 bg-nexus-success/10 border border-nexus-success/20 text-nexus-success rounded-lg text-[9px] font-bold uppercase tracking-widest">
                <CheckCircle2 size={12}/> Build: Optimized
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent rounded-lg text-[9px] font-bold uppercase tracking-widest">
                <Settings size={12}/> TS React 19
             </div>
          </div>
        </div>
      </header>

      <div className="flex bg-nexus-900 border-b border-nexus-800 px-6 gap-2 overflow-x-auto no-scrollbar shrink-0">
         <BlueprintTabButton id="usecase" label="Casos de Uso" icon={Target} active={activeTab} onClick={setActiveTab} />
         <BlueprintTabButton id="state" label="Arquitetura de Estado" icon={Layout} active={activeTab} onClick={setActiveTab} />
         <BlueprintTabButton id="interaction" label="Sequência" icon={Share2} active={activeTab} onClick={setActiveTab} />
         <BlueprintTabButton id="ai_spec" label="IA Spec" icon={BrainCircuit} active={activeTab} onClick={setActiveTab} />
         <BlueprintTabButton id="conceptual" label="DB Schema" icon={Database} active={activeTab} onClick={setActiveTab} />
         <BlueprintTabButton id="infrastructure" label="Deploy" icon={HardDrive} active={activeTab} onClick={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
         <div className="max-w-6xl mx-auto space-y-12 pb-32">
            
            {activeTab === 'usecase' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl">
                     <h3 className="text-xl font-display font-bold text-white mb-8 border-l-4 border-nexus-accent pl-6">Implementation Map</h3>
                     <div className="grid grid-cols-1 gap-4">
                        <TechnicalUseCase 
                           actor="Player" 
                           action="Sincronizar Troféus" 
                           service="nexusCloud.saveGame()" 
                           notes="Fluxo: LinkAccount -> FetchScraper -> SaveStats -> UpdateContext" 
                        />
                        <TechnicalUseCase 
                           actor="System AI" 
                           action="Analisar DNA Gamer" 
                           service="geminiService.analyzeGamingProfile()" 
                           notes="Gera insight assíncrono para o Dashboard. Usa cache local." 
                        />
                        <TechnicalUseCase 
                           actor="Merchant" 
                           action="Postar Loot Deal" 
                           service="nexusCloud.saveDeal()" 
                           notes="Sanitização de URLs de afiliados via regex no Middleware." 
                        />
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'state' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl overflow-hidden">
                     <h3 className="text-xl font-display font-bold text-white mb-10 border-l-4 border-nexus-secondary pl-6">Fluxo de Dados Unidirecional</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StateNode title="Remote Source" desc="Supabase / Gemini API" icon={Globe} color="text-nexus-secondary" />
                        <ArrowRight className="hidden md:block self-center opacity-20" />
                        <StateNode title="Context Provider" desc="AppContext.tsx (React.createContext)" icon={AppWindow} color="text-nexus-accent" active />
                        <ArrowRight className="hidden md:block self-center opacity-20" />
                        <StateNode title="Consumer UI" desc="Dashboard / Library Components" icon={Layout} color="text-white" />
                     </div>
                     <div className="mt-12 p-8 bg-black/40 rounded-3xl border border-white/5 space-y-4 font-mono text-[11px]">
                        <p className="text-nexus-accent">// state_map.json</p>
                        <p className="text-gray-400">userStats: <span className="text-white">Object | null</span> (Persistente via LocalStorage)</p>
                        <p className="text-gray-400">isSyncing: <span className="text-white">Boolean</span> (Bloqueia UI durante escrita em nuvem)</p>
                        <p className="text-gray-400">friends: <span className="text-white">Array&lt;Friend&gt;</span> (Cacheado no mount inicial)</p>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'ai_spec' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl">
                     <h3 className="text-xl font-display font-bold text-white mb-8 border-l-4 border-nexus-accent pl-6">Gemini Engine Configuration</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <h4 className="text-sm font-black uppercase text-gray-500 tracking-widest">System Instruction (Oracle)</h4>
                           <div className="bg-black/60 p-6 rounded-2xl border border-nexus-accent/20 text-xs italic text-gray-300 leading-relaxed">
                              "Você é o Oráculo Nexus, um mestre em hardware e performance. Use o perfil do jogador (@nexusId) para gerar análises épicas e técnicas de alto nível."
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h4 className="text-sm font-black uppercase text-gray-500 tracking-widest">Model Schema (Insight)</h4>
                           <div className="bg-nexus-800 p-6 rounded-2xl border border-nexus-700 font-mono text-[10px]">
                              <span className="text-nexus-secondary">responseSchema:</span> {'{'}<br/>
                              &nbsp;&nbsp;personaTitle: <span className="text-nexus-accent">string</span>,<br/>
                              &nbsp;&nbsp;description: <span className="text-nexus-accent">string</span>,<br/>
                              &nbsp;&nbsp;suggestedGenres: <span className="text-nexus-accent">array&lt;string&gt;</span><br/>
                              {'}'}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'conceptual' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl">
                     <h3 className="text-xl font-display font-bold text-white mb-10 border-l-4 border-nexus-secondary pl-6">Esquema Relacional (Supabase)</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SchemaTable title="PROFILES" fields={[{name:'nexus_id', type:'PK (varchar)'}, {name:'stats', type:'JSONB'}]} />
                        <SchemaTable title="GAMES" fields={[{name:'id', type:'PK (uuid)'}, {name:'nexus_id', type:'FK (varchar)'}]} secondary />
                        <SchemaTable title="TESTIMONIALS" fields={[{name:'id', type:'PK (uuid)'}, {name:'vibe', type:'enum'}]} />
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'infrastructure' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl">
                     <h3 className="text-xl font-display font-bold text-white mb-8 border-l-4 border-red-500 pl-6">Deploy Troubleshooting</h3>
                     <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl space-y-4">
                        <div className="flex items-center gap-4 text-red-500">
                           <AlertTriangle size={32}/>
                           <h4 className="font-bold">Correção de Depreciação (DOMException)</h4>
                        </div>
                        <p className="text-sm text-gray-400">
                           O aviso "npm warn deprecated node-domexception" indica o uso de uma biblioteca legada de terceiros.
                        </p>
                        <div className="p-4 bg-black/40 rounded-xl font-mono text-xs text-gray-300">
                           Solução aplicada: Garantia de Node 18+ no build e remoção de polyfills desnecessários.<br/>
                           `npm uninstall node-domexception`
                        </div>
                     </div>
                  </div>
               </div>
            )}

         </div>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const BlueprintTabButton: React.FC<{ id: BlueprintTab, label: string, icon: any, active: string, onClick: (id: BlueprintTab) => void }> = ({ id, label, icon: Icon, active, onClick }) => (
  <button 
    onClick={() => onClick(id as BlueprintTab)}
    className={`px-6 py-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${active === id ? 'border-nexus-accent text-white bg-nexus-accent/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
  >
    <Icon size={14} /> {label}
  </button>
);

const TechnicalUseCase = ({ actor, action, service, notes }: {actor:string, action:string, service:string, notes:string}) => (
   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-nexus-800/40 border border-nexus-700 rounded-2xl hover:border-nexus-accent transition-all group">
      <div className="flex items-center gap-3">
         <div className="w-8 h-8 rounded-lg bg-nexus-900 flex items-center justify-center"><User size={14} className="text-gray-500" /></div>
         <span className="text-[10px] font-black text-white uppercase">{actor}</span>
      </div>
      <div className="flex items-center text-xs font-bold text-gray-300">{action}</div>
      <div className="flex items-center gap-2">
         <Code2 size={12} className="text-nexus-accent" />
         <span className="text-[10px] font-mono text-nexus-accent bg-nexus-accent/5 px-2 py-1 rounded">{service}</span>
      </div>
      <div className="flex items-center text-[10px] text-gray-500 italic">{notes}</div>
   </div>
);

const StateNode = ({ title, desc, icon: Icon, color, active }: any) => (
   <div className={`p-6 rounded-3xl border flex flex-col items-center gap-3 text-center transition-all ${active ? 'bg-nexus-accent/10 border-nexus-accent shadow-2xl' : 'bg-nexus-900 border-nexus-800 opacity-60'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active ? 'bg-nexus-accent text-white' : 'bg-nexus-800 ' + color}`}>
         <Icon size={24} />
      </div>
      <div>
         <p className="font-bold text-sm text-white">{title}</p>
         <p className="text-[10px] text-gray-500 mt-1">{desc}</p>
      </div>
   </div>
);

const SchemaTable = ({ title, fields, secondary }: {title:string, fields:any[], secondary?:boolean}) => (
   <div className={`bg-nexus-900 border rounded-3xl overflow-hidden shadow-2xl ${secondary ? 'border-nexus-secondary/30' : 'border-nexus-accent/30'}`}>
      <div className={`p-4 font-display font-black text-[11px] uppercase tracking-widest text-white text-center flex items-center justify-center gap-2 ${secondary ? 'bg-nexus-secondary/20' : 'bg-nexus-accent/20'}`}>
         <Database size={14}/> {title}
      </div>
      <div className="p-5 space-y-3">
         {fields.map((f: any) => (
            <div key={f.name} className="flex flex-col gap-1">
               <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-white">{f.name}</span>
               </div>
               <span className="text-[9px] text-gray-600 font-mono italic">{f.type}</span>
            </div>
         ))}
      </div>
   </div>
);
