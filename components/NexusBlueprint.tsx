import React, { useState } from 'react';
import { 
  FileCode, Layers, GitBranch, Share2, Database, ListTodo, 
  User, Server, Cpu, Globe, ArrowRight, Zap, Target, 
  CheckCircle2, Clock, Play, MessageSquare, ShieldCheck, Box,
  Search, X, RefreshCw, Code2, Link2, Key, Activity, Workflow,
  /* Added missing Info icon */
  Info
} from 'lucide-react';

type BlueprintTab = 'usecase' | 'activity' | 'interaction' | 'conceptual' | 'backlog';

export const NexusBlueprint: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BlueprintTab>('usecase');

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 animate-fade-in overflow-hidden">
      <header className="p-8 border-b border-nexus-800 bg-gradient-to-b from-nexus-900/50 to-transparent shrink-0">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-bold text-white tracking-tighter flex items-center gap-4">
              <Code2 className="text-nexus-accent" size={36} /> NEXUS <span className="text-nexus-accent">BLUEPRINT</span>
            </h1>
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">System Architecture & API Documentation v4.2</p>
          </div>
          <div className="flex gap-2">
             <span className="px-3 py-1 bg-nexus-success/10 border border-nexus-success/20 text-nexus-success rounded-lg text-[9px] font-bold uppercase tracking-widest">Stable Release</span>
             <span className="px-3 py-1 bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent rounded-lg text-[9px] font-bold uppercase tracking-widest">TS Strict Mode</span>
          </div>
        </div>
      </header>

      <div className="flex bg-nexus-900 border-b border-nexus-800 px-6 gap-2 overflow-x-auto no-scrollbar shrink-0">
         <BlueprintTabButton id="usecase" label="Use Cases" icon={Target} active={activeTab} onClick={setActiveTab} />
         <BlueprintTabButton id="activity" label="Data Flow" icon={Workflow} active={activeTab} onClick={setActiveTab} />
         <BlueprintTabButton id="interaction" label="Sequence" icon={Share2} active={activeTab} onClick={setActiveTab} />
         <BlueprintTabButton id="conceptual" label="Data Schema" icon={Database} active={activeTab} onClick={setActiveTab} />
         <BlueprintTabButton id="backlog" label="Sprint Backlog" icon={ListTodo} active={activeTab} onClick={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
         <div className="max-w-6xl mx-auto space-y-12 pb-32">
            
            {activeTab === 'usecase' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl">
                     <h3 className="text-xl font-display font-bold text-white mb-8 border-l-4 border-nexus-accent pl-6">Mapeamento Funcional (Actors & Services)</h3>
                     <div className="grid grid-cols-1 gap-4">
                        <TechnicalUseCase 
                           actor="Player" 
                           action="Sincronizar Troféus" 
                           service="nexusCloud.saveGame()" 
                           requirement="Google Search Grounding + Web Scraping" 
                        />
                        <TechnicalUseCase 
                           actor="System (IA)" 
                           action="Gerar DNA Insight" 
                           service="geminiService.analyzeGamingProfile()" 
                           requirement="Prompt Engineering + JSON Schema Validation" 
                        />
                        <TechnicalUseCase 
                           actor="Merchant" 
                           action="Postar Promoção (Loot)" 
                           service="nexusCloud.saveDeal()" 
                           requirement="Affiliate URL Sanitization" 
                        />
                        <TechnicalUseCase 
                           actor="Admin/System" 
                           action="Verificar Pedigree" 
                           service="nexusCloud.getOwnershipHistory()" 
                           requirement="Blockchain-like Immutable Logs" 
                        />
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'activity' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl overflow-hidden">
                     <h3 className="text-xl font-display font-bold text-white mb-10 border-l-4 border-nexus-secondary pl-6">Diagrama de Fluxo (Crawler Engine)</h3>
                     <div className="relative pt-10">
                        {/* Swimlanes Headers */}
                        <div className="grid grid-cols-3 border-b border-white/10 pb-4 mb-10">
                           <div className="text-center text-[10px] font-black uppercase text-gray-500 tracking-widest">UI (Frontend)</div>
                           <div className="text-center text-[10px] font-black uppercase text-nexus-accent tracking-widest">Logic (Services)</div>
                           <div className="text-center text-[10px] font-black uppercase text-nexus-secondary tracking-widest">Storage (Cloud)</div>
                        </div>
                        
                        <div className="space-y-8 max-w-4xl mx-auto">
                           <FlowStep side="left" label="Input Public ID" icon={User} />
                           <FlowLine />
                           <FlowStep side="center" label="Fetch Public Profile (Search Grounding)" icon={Globe} />
                           <FlowLine />
                           <FlowStep side="center" label="Parse Metadata (IA Scraper)" icon={Cpu} />
                           <FlowLine />
                           <FlowStep side="right" label="Insert/Update Rest API (PATCH)" icon={Database} />
                           <FlowLine />
                           <FlowStep side="left" label="Update Dashboard Store" icon={RefreshCw} />
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'interaction' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl">
                     <h3 className="text-xl font-display font-bold text-white mb-10 border-l-4 border-nexus-accent pl-6">Sequence Diagram: Handshake de Autenticação</h3>
                     <div className="font-mono text-[11px] bg-black/40 p-8 rounded-3xl border border-white/5 space-y-6">
                        <SequenceLine time="0ms" from="Client" to="NexusCloud" msg="POST /rest/v1/auth/login" />
                        <SequenceLine time="120ms" from="NexusCloud" to="PostgreSQL" msg="SELECT * FROM profiles WHERE email = ?" />
                        <SequenceLine time="250ms" from="PostgreSQL" to="NexusCloud" msg="ProfileData + JWT_Token" />
                        <SequenceLine time="260ms" from="NexusCloud" to="Client" msg="HTTP 200 (UserStats JSON)" status="success" />
                        <div className="h-px bg-white/5 my-4"></div>
                        <SequenceLine time="280ms" from="Client" to="Gemini_API" msg="POST /generateContent (Insight Prompt)" />
                        <SequenceLine time="1200ms" from="Gemini_API" to="Client" msg="Streaming Response (Part 1...n)" status="pending" />
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'conceptual' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl overflow-hidden">
                     <h3 className="text-xl font-display font-bold text-white mb-10 border-l-4 border-nexus-secondary pl-6">Modelo de Dados (ER Schema)</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                        <SchemaTable 
                           title="PROFILES" 
                           fields={[
                              { name: 'nexus_id', type: 'PK (string)', rel: '1:N' },
                              { name: 'stats', type: 'JSONB (UserStats)' },
                              { name: 'email', type: 'Unique (string)' }
                           ]} 
                        />
                        <SchemaTable 
                           title="GAMES" 
                           fields={[
                              { name: 'id', type: 'PK (uuid)' },
                              { name: 'title', type: 'string' },
                              { name: 'hours', type: 'integer' },
                              { name: 'nexus_id', type: 'FK -> PROFILES' }
                           ]} 
                           secondary
                        />
                        <SchemaTable 
                           title="LOOT_DEALS" 
                           fields={[
                              { name: 'id', type: 'PK (uuid)' },
                              { name: 'price', type: 'numeric' },
                              { name: 'is_expired', type: 'boolean' },
                              { name: 'posted_by', type: 'FK -> PROFILES' }
                           ]} 
                        />
                     </div>
                     <div className="mt-10 p-6 bg-nexus-accent/5 border border-nexus-accent/20 rounded-2xl flex items-center gap-4">
                        <Info className="text-nexus-accent" size={20} />
                        <p className="text-[11px] text-gray-500 uppercase font-black tracking-widest">
                           Nota: O campo 'stats' armazena o estado volátil via JSONB para flexibilidade de atributos da IA.
                        </p>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'backlog' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl">
                     <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-display font-bold text-white border-l-4 border-nexus-accent pl-6">Sprint Management (Active Backlog)</h3>
                        <div className="flex items-center gap-4">
                           <div className="text-right">
                              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Velocity</p>
                              <p className="text-sm font-mono text-white">42pts/wk</p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="space-y-3">
                        <TechnicalBacklogItem id="NEX-104" title="Refactor: linkAccount middleware for concurrency" priority="High" status="doing" tech="React/Context" />
                        <TechnicalBacklogItem id="NEX-105" title="Feature: Multi-region scraping (NTSC-J Support)" priority="Medium" status="todo" tech="AI/Grounding" />
                        <TechnicalBacklogItem id="NEX-106" title="Fix: Memory leak on Oracle Chat streaming" priority="Critical" status="doing" tech="WebSockets" />
                        <TechnicalBacklogItem id="NEX-102" title="Infrastructure: Supabase Realtime for Pulse Feed" priority="Low" status="done" tech="PostgreSQL" />
                        <TechnicalBacklogItem id="NEX-108" title="Security: E2E Encryption for Nexus Chat" priority="Critical" status="todo" tech="Crypto API" />
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
    className={`px-6 py-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${active === id ? 'border-nexus-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
  >
    <Icon size={14} /> {label}
  </button>
);

const TechnicalUseCase = ({ actor, action, service, requirement }: any) => (
   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-nexus-800/40 border border-nexus-700 rounded-2xl hover:border-nexus-accent transition-all group">
      <div className="flex items-center gap-3">
         <User size={14} className="text-gray-500" />
         <span className="text-xs font-bold text-white uppercase tracking-tighter">{actor}</span>
      </div>
      <div className="flex items-center text-xs font-medium text-gray-300">
         {action}
      </div>
      <div className="flex items-center gap-2">
         <Code2 size={12} className="text-nexus-accent" />
         <span className="text-[10px] font-mono text-nexus-accent bg-nexus-accent/5 px-2 py-1 rounded">{service}</span>
      </div>
      <div className="flex items-center gap-2">
         <ShieldCheck size={12} className="text-nexus-secondary" />
         <span className="text-[10px] text-gray-500 italic">{requirement}</span>
      </div>
   </div>
);

const FlowStep = ({ side, label, icon: Icon }: any) => (
   <div className={`flex items-center ${side === 'left' ? 'justify-start' : side === 'right' ? 'justify-end' : 'justify-center'}`}>
      <div className={`flex items-center gap-4 p-4 rounded-2xl bg-nexus-900 border border-nexus-800 shadow-xl min-w-[240px] ${side === 'center' ? 'border-nexus-accent/30' : ''}`}>
         <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${side === 'center' ? 'bg-nexus-accent' : 'bg-nexus-800'}`}>
            <Icon size={18} />
         </div>
         <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{label}</span>
      </div>
   </div>
);

const FlowLine = () => (
   <div className="h-8 flex justify-center">
      <div className="w-0.5 h-full bg-gradient-to-b from-nexus-accent/40 to-transparent"></div>
   </div>
);

const SequenceLine = ({ time, from, to, msg, status }: any) => (
   <div className="flex items-center gap-6 hover:bg-white/5 p-2 rounded-lg transition-colors">
      <span className="text-[9px] text-gray-600 font-mono w-12">{time}</span>
      <span className="text-nexus-secondary font-bold min-w-[60px]">{from}</span>
      <ArrowRight size={10} className="text-gray-700" />
      <span className="text-nexus-accent font-bold min-w-[80px]">{to}</span>
      <div className="h-3 w-px bg-white/10"></div>
      <span className={`flex-1 ${status === 'success' ? 'text-green-500' : status === 'pending' ? 'text-yellow-500' : 'text-gray-400'}`}>
         {msg}
      </span>
   </div>
);

const SchemaTable = ({ title, fields, secondary }: any) => (
   <div className={`bg-nexus-900 border rounded-3xl overflow-hidden shadow-2xl ${secondary ? 'border-nexus-secondary/30' : 'border-nexus-accent/30'}`}>
      <div className={`p-4 font-display font-black text-[11px] uppercase tracking-widest text-white text-center flex items-center justify-center gap-2 ${secondary ? 'bg-nexus-secondary/20' : 'bg-nexus-accent/20'}`}>
         <Database size={14}/> {title}
      </div>
      <div className="p-5 space-y-3">
         {fields.map((f: any) => (
            <div key={f.name} className="flex flex-col gap-1">
               <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-white">{f.name}</span>
                  {f.rel && <span className="text-[9px] text-nexus-accent font-black">{f.rel}</span>}
               </div>
               <span className="text-[9px] text-gray-600 font-mono italic">{f.type}</span>
            </div>
         ))}
      </div>
   </div>
);

const TechnicalBacklogItem = ({ id, title, priority, status, tech }: any) => (
   <div className={`flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all ${status === 'done' ? 'bg-nexus-success/5 border-nexus-success/20 opacity-40' : 'bg-nexus-800 border-nexus-700 hover:border-nexus-accent'}`}>
      <span className="text-[9px] font-mono text-gray-600 font-black">{id}</span>
      <div className="flex-1">
         <h4 className="font-bold text-white text-xs">{title}</h4>
         <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 bg-black/40 rounded text-[7px] font-black uppercase text-gray-500 tracking-widest">{tech}</span>
         </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
         <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${
            priority === 'Critical' ? 'border-red-500 text-red-500' :
            priority === 'High' ? 'border-orange-500 text-orange-500' : 'border-gray-700 text-gray-500'
         }`}>
            {priority}
         </div>
         <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            status === 'done' ? 'text-nexus-success' : status === 'doing' ? 'text-nexus-accent animate-pulse' : 'text-gray-700'
         }`}>
            {status === 'done' ? <CheckCircle2 size={18}/> : <Activity size={18}/>}
         </div>
      </div>
   </div>
);