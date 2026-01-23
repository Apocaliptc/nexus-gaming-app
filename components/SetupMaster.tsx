
import React, { useState } from 'react';
import { 
  Monitor, Cpu, Activity, Database, MousePointer2, 
  Keyboard, Headphones, Box, Image as ImageIcon, 
  Save, Check, Sparkles, Zap, HardDrive, Layout, 
  Settings as SettingsIcon, Info, ShieldCheck, PenTool
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { PCSetup } from '../types';

export const SetupMaster: React.FC = () => {
  const { userStats, setUserStats } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  
  const [tempSetup, setTempSetup] = useState<PCSetup>(userStats?.setup || {
    cpu: '', gpu: '', ram: '', storage: '', monitor: '', motherboard: '', 
    mouse: '', keyboard: '', headset: '', description: ''
  });

  const handleSave = () => {
    setUserStats(prev => prev ? { ...prev, setup: tempSetup } : null);
    setIsEditing(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const currentSetup = userStats?.setup;

  return (
    <div className="h-full bg-[#050507] text-gray-100 overflow-y-auto custom-scrollbar animate-fade-in">
      <header className="p-8 md:p-12 border-b border-nexus-800 bg-gradient-to-b from-nexus-900/50 to-transparent shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter uppercase flex items-center gap-4">
                MEU <span className="text-nexus-secondary">SETUP</span>
                <Monitor className="text-nexus-secondary" />
              </h1>
              <p className="text-gray-500 text-sm md:text-lg font-medium uppercase tracking-[0.2em]">O Coração Mecânico do seu Legado</p>
           </div>
           
           <div className="flex gap-4">
              {isEditing ? (
                 <button 
                   onClick={handleSave}
                   className="px-8 py-3 bg-nexus-success text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-nexus-success/20 flex items-center gap-2 hover:scale-105 transition-all"
                 >
                    <Check size={18} /> Eternizar Rig
                 </button>
              ) : (
                 <button 
                   onClick={() => setIsEditing(true)}
                   className="px-8 py-3 bg-nexus-accent text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-nexus-accent/20 flex items-center gap-2 hover:scale-105 transition-all"
                 >
                    <PenTool size={18} /> Atualizar Spec
                 </button>
              )}
           </div>
        </div>
      </header>

      <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-12 pb-40">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            <div className="lg:col-span-8 space-y-8">
               <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                     <Cpu size={300} />
                  </div>
                  <div className="relative z-10 space-y-10">
                     <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="p-3 bg-nexus-accent/20 rounded-2xl text-nexus-accent"><Cpu size={24} /></div>
                        <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Núcleo de Processamento</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <BlueprintInput icon={Cpu} label="Processador (CPU)" value={isEditing ? tempSetup.cpu : currentSetup?.cpu} onChange={v => setTempSetup({...tempSetup, cpu: v})} editing={isEditing} placeholder="Ex: Ryzen 9 7950X" />
                        <BlueprintInput icon={Activity} label="Gráficos (GPU)" value={isEditing ? tempSetup.gpu : currentSetup?.gpu} onChange={v => setTempSetup({...tempSetup, gpu: v})} editing={isEditing} placeholder="Ex: RTX 4090 OC" />
                        <BlueprintInput icon={Database} label="Memória (RAM)" value={isEditing ? tempSetup.ram : currentSetup?.ram} onChange={v => setTempSetup({...tempSetup, ram: v})} editing={isEditing} placeholder="Ex: 32GB DDR5 6000MHz" />
                        <BlueprintInput icon={HardDrive} label="Armazenamento" value={isEditing ? tempSetup.storage : currentSetup?.storage} onChange={v => setTempSetup({...tempSetup, storage: v})} editing={isEditing} placeholder="Ex: 4TB NVMe Gen5" />
                        <BlueprintInput icon={Layout} label="Placa Mãe" value={isEditing ? tempSetup.motherboard : currentSetup?.motherboard} onChange={v => setTempSetup({...tempSetup, motherboard: v})} editing={isEditing} placeholder="Ex: ROG Crosshair X670E" />
                        <BlueprintInput icon={Box} label="Gabinete / Case" value={isEditing ? tempSetup.case : currentSetup?.case} onChange={v => setTempSetup({...tempSetup, case: v})} editing={isEditing} placeholder="Ex: Hyte Y70 Touch" />
                     </div>
                  </div>
               </div>
               <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10 space-y-10">
                     <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="p-3 bg-nexus-secondary/20 rounded-2xl text-nexus-secondary"><MousePointer2 size={24} /></div>
                        <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Periféricos e Interface</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <BlueprintInput icon={Monitor} label="Monitor Principal" value={isEditing ? tempSetup.monitor : currentSetup?.monitor} onChange={v => setTempSetup({...tempSetup, monitor: v})} editing={isEditing} placeholder="Ex: 27' 240Hz OLED" />
                        <BlueprintInput icon={MousePointer2} label="Mouse" value={isEditing ? tempSetup.mouse : currentSetup?.mouse} onChange={v => setTempSetup({...tempSetup, mouse: v})} editing={isEditing} placeholder="Ex: Razer Viper V3 Pro" />
                        <BlueprintInput icon={Keyboard} label="Teclado" value={isEditing ? tempSetup.keyboard : currentSetup?.keyboard} onChange={v => setTempSetup({...tempSetup, keyboard: v})} editing={isEditing} placeholder="Ex: Keychron Q1 HE" />
                        <BlueprintInput icon={Headphones} label="Áudio / Headset" value={isEditing ? tempSetup.headset : currentSetup?.headset} onChange={v => setTempSetup({...tempSetup, headset: v})} editing={isEditing} placeholder="Ex: Audeze Maxwell" />
                     </div>
                  </div>
               </div>
            </div>
            <div className="lg:col-span-4 space-y-8">
               <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-8 space-y-8 shadow-xl">
                  <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest flex items-center gap-3">
                     <ImageIcon className="text-nexus-accent" /> Station Vibe
                  </h3>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Manifesto do Setup</label>
                     {isEditing ? (
                        <textarea 
                          value={tempSetup.description}
                          onChange={e => setTempSetup({...tempSetup, description: e.target.value})}
                          placeholder="Fale sobre sua estética, cores de RGB ou foco do seu setup..."
                          className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl p-6 text-sm text-white focus:border-nexus-accent outline-none min-h-[200px] resize-none"
                        />
                     ) : (
                        <div className="p-6 bg-nexus-800/40 rounded-2xl border border-nexus-700 min-h-[200px]">
                           <p className="text-gray-400 italic leading-relaxed">
                              {currentSetup?.description || "Nenhum manifesto registrado ainda. Defina a aura do seu hardware."}
                           </p>
                        </div>
                     )}
                  </div>
                  <div className="p-6 bg-nexus-accent/5 border border-nexus-accent/20 rounded-2xl space-y-4">
                     <div className="flex items-center gap-3 text-nexus-accent">
                        <ShieldCheck size={20} />
                        <span className="text-xs font-bold uppercase tracking-widest">Hardware Verificado</span>
                     </div>
                     <p className="text-[11px] text-gray-500 leading-relaxed italic">
                        As informações aqui registradas são públicas e ajudam outros jogadores a entenderem sua capacidade de resposta e fidelidade visual durante desafios.
                     </p>
                  </div>
               </div>
               {!isEditing && currentSetup && (
                  <div className="bg-gradient-to-br from-nexus-accent to-nexus-secondary p-8 rounded-[3rem] shadow-2xl text-white space-y-6 animate-fade-in">
                     <h4 className="font-display font-black text-2xl uppercase italic tracking-tighter leading-none">Power Level Rig</h4>
                     <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-80">
                           <span>Performance Global</span>
                           <span>Verificado</span>
                        </div>
                        <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                           <div className="h-full bg-white w-[94%] rounded-full shadow-[0_0_15px_#fff]"></div>
                        </div>
                     </div>
                     <p className="text-xs font-medium opacity-90 leading-relaxed italic">"Sua configuração está entre os 5% melhores sintonizados na rede Nexus este mês."</p>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

const BlueprintInput: React.FC<{ icon: any, label: string, value?: string, onChange: (v: string) => void, editing: boolean, placeholder: string }> = ({ icon: Icon, label, value, onChange, editing, placeholder }) => (
  <div className="space-y-3 group transition-all">
    <div className="flex items-center gap-2 px-1">
       <Icon size={12} className="text-gray-500 group-hover:text-nexus-accent transition-colors" />
       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</label>
    </div>
    {editing ? (
       <input 
          type="text" 
          value={value || ''} 
          onChange={e => onChange(e.target.value)} 
          placeholder={placeholder}
          className="w-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-nexus-accent transition-all" 
       />
    ) : (
       <div className="p-4 bg-nexus-800/40 border border-nexus-700 rounded-xl">
          <p className="text-sm font-bold text-white tracking-tight">{value || "Não especificado"}</p>
       </div>
    )}
  </div>
);
