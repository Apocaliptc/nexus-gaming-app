
import React, { useState } from 'react';
import { 
  FileCode, Layers, GitBranch, Share2, Database, ListTodo, 
  User, Server, Cpu, Globe, ArrowRight, Zap, Target, 
  CheckCircle2, Clock, Play, MessageSquare, ShieldCheck, Box,
  Search, X, RefreshCw, Code2, Link2, Key, Activity, Workflow,
  Info, AlertTriangle, Terminal, Settings, HardDrive
} from 'lucide-react';

type BlueprintTab = 'usecase' | 'activity' | 'interaction' | 'conceptual' | 'backlog' | 'infrastructure';

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
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">Technical Documentation & System Design v4.5</p>
          </div>
          <div className="flex gap-2">
             <div className="flex items-center gap-2 px-3 py-1 bg-nexus-success/10 border border-nexus-success/20 text-nexus-success rounded-lg text-[9px] font-bold uppercase tracking-widest">
                <CheckCircle2 size={12}/> Build: Passing
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent rounded-lg text-[9px] font-bold uppercase tracking-widest">
                <Settings size={12}/> Node 18+ Required
             </div>
          </div>
        </div>
      </header>

      <div className="flex bg-nexus-900 border-b border-nexus-800 px-6 gap-2 overflow-x-auto no-scrollbar shrink-0">
         <BlueprintTabButton id="usecase" label="Casos de Uso" icon={Target} active={activeTab} onClick={setActiveTab} />
         <BlueprintTabButton id="activity" label="Fluxo de Dados" icon={Workflow} active={activeTab} onClick={setActiveTab} />
         <BlueprintTabButton id="interaction" label="Sequência (IA)" icon={Share2} active={activeTab} onClick={setActiveTab} />
         <BlueprintTabButton id="conceptual" label="DB Schema" icon={Database} active={activeTab} onClick={setActiveTab} />
         <BlueprintTabButton id="backlog" label="Backlog Técnico" icon={ListTodo} active={activeTab} onClick={setActiveTab} />
         <BlueprintTabButton id="infrastructure" label="Deploy & Build" icon={HardDrive} active={activeTab} onClick={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
         <div className="max-w-6xl mx-auto space-y-12 pb-32">
            
            {activeTab === 'usecase' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl">
                     <h3 className="text-xl font-display font-bold text-white mb-8 border-l-4 border-nexus-accent pl-6">Mapeamento de Serviços (Use Case -> Implementation)</h3>
                     <div className="grid grid-cols-1 gap-4">
                        <TechnicalUseCase 
                           actor="Gamer" 
                           action="Sincronizar Troféus" 
                           service="nexusCloud.saveGame()" 
                           notes="Usa fetchPublicProfileData() para scraping via Google Grounding." 
                        />
                        <TechnicalUseCase 
                           actor="System AI" 
                           action="Analisar DNA Gamer" 
                           service="geminiService.analyzeGamingProfile()" 
                           notes="Processamento assíncrono com retry (max 2) para Rate Limit." 
                        />
                        <TechnicalUseCase 
                           actor="Loot Bot" 
                           action="Validar Ofertas" 
                           service="LootMarket.toggleExpire()" 
                           notes="Persistência local-first com sincronização Supabase via PATCH." 
                        />
                        <TechnicalUseCase 
                           actor="Dev/Admin" 
                           action="Auditar Linhagem" 
                           service="PedigreeTimeline" 
                           notes="Renderização linear de OwnershipRecord[] com validação de PrestigePoints." 
                        />
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'activity' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl overflow-hidden">
                     <h3 className="text-xl font-display font-bold text-white mb-10 border-l-4 border-nexus-secondary pl-6">Pipeline de Sincronização (Crawler Architecture)</h3>
                     <div className="relative pt-10">
                        <div className="grid grid-cols-3 border-b border-white/10 pb-4 mb-10">
                           <div className="text-center text-[10px] font-black uppercase text-gray-500">React Client</div>
                           <div className="text-center text-[10px] font-black uppercase text-nexus-accent">Edge Functions / Gemini</div>
                           <div className="text-center text-[10px] font-black uppercase text-nexus-secondary">PostgreSQL (Supabase)</div>
                        </div>
                        
                        <div className="space-y-8 max-w-4xl mx-auto font-mono text-[10px]">
                           <FlowStep side="left" label="linkAccount(platform, username)" icon={Code2} />
                           <FlowLine />
                           <FlowStep side="center" label="fetchPublicProfileData() -> Grounding Search" icon={Globe} />
                           <FlowLine />
                           <FlowStep side="center" label="JSON.parse(AI_Response) -> Game[]" icon={Cpu} />
                           <FlowLine />
                           <FlowStep side="right" label="nexusCloud.saveUser() -> Profiles PATCH" icon={Database} />
                           <FlowLine />
                           <FlowStep side="left" label="AppProvider state update (isSyncing: false)" icon={RefreshCw} />
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'interaction' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl">
                     <h3 className="text-xl font-display font-bold text-white mb-10 border-l-4 border-nexus-accent pl-6">Sequência de Mensagens IA (NexusOracle)</h3>
                     <div className="font-mono text-[11px] bg-black/40 p-8 rounded-3xl border border-white/5 space-y-6">
                        <SequenceLine time="0ms" from="Oracle UI" to="AppContext" msg="useAppContext().userStats (Context Injection)" />
                        <SequenceLine time="15ms" from="Oracle UI" to="Gemini_SDK" msg="chat.sendMessageStream({ message })" />
                        <SequenceLine time="250ms" from="Gemini_API" to="Oracle UI" msg="onChunk: (GenerateContentResponse) -> part.text" status="pending" />
                        <SequenceLine time="1.2s" from="Oracle UI" to="State" msg="setMessages(prev => [...newChunk])" status="success" />
                        <div className="h-px bg-white/5 my-4"></div>
                        <div className="text-[10px] text-gray-600 italic">Nota técnica: O stream evita bloqueio da Main Thread em respostas longas da IA.</div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'conceptual' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl">
                     <h3 className="text-xl font-display font-bold text-white mb-10 border-l-4 border-nexus-secondary pl-6">Esquema Relacional e Tipos (Entity-Relationship)</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                        <SchemaTable 
                           title="PROFILES" 
                           fields={[
                              { name: 'nexus_id', type: 'PK (varchar)', rel: '1:N Games' },
                              { name: 'email', type: 'varchar (unique)', rel: '1:1 Session' },
                              { name: 'stats', type: 'jsonb (UserStats)', rel: 'Nested Object' }
                           ]} 
                        />
                        <SchemaTable 
                           title="TESTIMONIALS" 
                           fields={[
                              { name: 'id', type: 'PK (uuid)' },
                              { name: 'to_nexus_id', type: 'FK -> Profiles.nexus_id' },
                              { name: 'vibe', type: 'enum (pro, mvp, legend)' }
                           ]} 
                           secondary
                        />
                        <SchemaTable 
                           title="LOOT_MARKET" 
                           fields={[
                              { name: 'id', type: 'PK (uuid)' },
                              { name: 'price', type: 'numeric(10,2)' },
                              { name: 'affiliate_url', type: 'text' }
                           ]} 
                        />
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'backlog' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl">
                     <h3 className="text-xl font-display font-bold text-white mb-8 border-l-4 border-nexus-accent pl-6">Developer Roadmap & Technical Debt</h3>
                     <div className="space-y-3">
                        <TechnicalBacklogItem id="DEV-1" title="Upgrade para Gemini-3-Pro (High Priority)" status="doing" tech="SDK @google/genai" priority="Critical" />
                        <TechnicalBacklogItem id="ARC-2" title="Migração de state para React Query (Performance)" status="todo" tech="Client Side Cache" priority="Medium" />
                        <TechnicalBacklogItem id="SEC-1" title="Implementação de RLS (Row Level Security) em Testimonials" status="todo" tech="Supabase Policies" priority="High" />
                        <TechnicalBacklogItem id="FIX-4" title="Otimização de imagens da biblioteca (Next Gen Formats)" status="done" tech="Sharp / Cloudinary" priority="Low" />
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'infrastructure' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-2xl">
                     <h3 className="text-xl font-display font-bold text-white mb-8 border-l-4 border-red-500 pl-6">Guia de Troubleshooting de Deploy</h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                           <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-3xl space-y-4">
                              <div className="flex items-center gap-3 text-red-500">
                                 <AlertTriangle size={24}/>
                                 <h4 className="font-bold text-sm">Erro de Depreciação: node-domexception</h4>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                 "npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead"
                              </p>
                              <div className="p-4 bg-black/40 rounded-xl font-mono text-[10px] text-gray-300">
                                 # SOLUÇÃO:<br/>
                                 1. Certifique-se de que está usando Node.js 18 ou superior.<br/>
                                 2. O DOMException é nativo a partir dessa versão.<br/>
                                 3. Se persistir, remova o pacote explicitamente: <br/>
                                 `npm uninstall node-domexception`
                              </div>
                           </div>
                           
                           <div className="bg-nexus-accent/5 border border-nexus-accent/20 p-6 rounded-3xl space-y-4">
                              <div className="flex items-center gap-3 text-nexus-accent">
                                 <Key size={24}/>
                                 <h4 className="font-bold text-sm">Environment Variables</h4>
                              </div>
                              <ul className="space-y-2 text-[10px] font-mono text-gray-500">
                                 <li><span className="text-white">API_KEY:</span> Obrigatória para Gemini API</li>
                                 <li><span className="text-white">SUPABASE_URL:</span> Endereço da instância PostgreSQL</li>
                                 <li><span className="text-white">SUPABASE_KEY:</span> Client anon key para REST API</li>
                              </ul>
                           </div>
                        </div>

                        <div className="bg-nexus-800/40 p-8 rounded-[2.5rem] border border-nexus-700 space-y-6">
                           <h4 className="text-lg font-bold text-white flex items-center gap-3"><Zap className="text-yellow-500"/> Stack Tecnológica</h4>
                           <div className="grid grid-cols-2 gap-4">
                              <TechBadge label="React 19" />
                              <TechBadge label="TypeScript 5" />
                              <TechBadge label="Tailwind CSS 3" />
                              <TechBadge label="Gemini AI (Pro)" />
                              <TechBadge label="Supabase DB" />
                              <TechBadge label="Lucide Icons" />
                           </div>
                           <div className="pt-6 border-t border-white/5">
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Métricas de Performance (Lighthouse)</p>
                              <div className="flex gap-4">
                                 <PerformanceRing label="FCP" value="0.8s" />
                                 <PerformanceRing label="LCP" value="1.2s" />
                                 <PerformanceRing label="CLS" value="0.01" />
                              </div>
                           </div>
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

const TechnicalUseCase = ({ actor, action, service, notes }: any) => (
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

const FlowStep = ({ side, label, icon: Icon }: any) => (
   <div className={`flex items-center ${side === 'left' ? 'justify-start' : side === 'right' ? 'justify-end' : 'justify-center'}`}>
      <div className={`flex items-center gap-4 p-4 rounded-2xl bg-nexus-900 border border-nexus-800 shadow-xl min-w-[240px] ${side === 'center' ? 'border-nexus-accent/30 shadow-nexus-accent/5' : ''}`}>
         <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${side === 'center' ? 'bg-nexus-accent' : 'bg-nexus-800 border border-nexus-700'}`}>
            <Icon size={16} />
         </div>
         <span className="font-black uppercase tracking-tighter text-gray-300">{label}</span>
      </div>
   </div>
);

const FlowLine = () => (
   <div className="h-6 flex justify-center">
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
                  {f.rel && <span className="text-[8px] text-nexus-accent font-black">{f.rel}</span>}
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
      <div className="flex-1 min-w-0">
         <h4 className="font-bold text-white text-sm truncate">{title}</h4>
         <span className="px-2 py-0.5 bg-black/40 rounded text-[7px] font-black uppercase text-gray-500 tracking-widest mt-2 inline-block">{tech}</span>
      </div>
      <div className="flex items-center gap-4 shrink-0">
         <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${
            priority === 'Critical' ? 'border-red-500 text-red-500' :
            priority === 'High' ? 'border-orange-500 text-orange-500' :
            'border-gray-700 text-gray-500'
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

const TechBadge = ({ label }: { label: string }) => (
   <div className="px-4 py-3 bg-black/40 border border-white/5 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center">
      {label}
   </div>
);

const PerformanceRing = ({ label, value }: { label: string, value: string }) => (
   <div className="flex flex-col items-center gap-1">
      <div className="w-12 h-12 rounded-full border-4 border-nexus-success flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]">
         {value}
      </div>
      <span className="text-[8px] font-black text-gray-600 uppercase">{label}</span>
   </div>
);
