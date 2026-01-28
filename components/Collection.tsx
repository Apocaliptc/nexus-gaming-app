
import React, { useState, useMemo } from 'react';
import { CollectionItem, Platform, OwnershipRecord } from '../types';
import { 
  Box, Plus, Search, Filter, DollarSign, Repeat, Tag, X, 
  Image as ImageIcon, Check, History, ShieldCheck, 
  Database, BrainCircuit, Sparkles, Loader2, FileText, Zap, AlertTriangle,
  TrendingUp, BarChart3, PieChart as PieIcon, LayoutGrid, Calendar, ChevronRight, Info,
  Monitor, Gamepad2, Package, Globe, UserCircle, Star, ArrowDown, Hexagon, Layers,
  Clock, Award, Hash, ScrollText, Binary, Settings, ShieldAlert, Cpu, HardDrive, Disc, MapPin, 
  Ticket, FileCheck, Landmark, CheckCircle2, UserPlus, ShoppingCart, PieChart as PieChartIcon,
  BarChart as BarChartIcon, Briefcase
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { parseCollectionSpreadsheet } from '../services/geminiService';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Radar, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { PedigreeTimeline } from './PedigreeTimeline';
import { PlatformIcon } from './PlatformIcon';

const PIE_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#3b82f6'];

export const Collection: React.FC = () => {
  const { userStats, addItemsToCollection } = useAppContext();
  const [activeTab, setActiveTab] = useState<'my_collection' | 'analytics'>('my_collection');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtros Avançados
  const [filterType, setFilterType] = useState<string>('all');
  const [filterManufacturer, setFilterManufacturer] = useState<string>('all');
  const [filterGen, setFilterGen] = useState<string>('all');

  // Estado do Novo Item
  const [newItem, setNewItem] = useState<Partial<CollectionItem & { isFirstOwner: boolean, previousOwnerHandle: string }>>({
    name: '',
    type: 'Console',
    condition: 'CIB',
    status: 'collection',
    value: 0,
    manufacturer: '',
    platform: '',
    year: 2024,
    generation: '9th Gen',
    description: '',
    serialNumber: '',
    history: '',
    hasOriginalBox: true,
    hasManual: true,
    hasOriginalAccessories: true,
    hasReceipt: false,
    functionality: 'Totalmente funcional',
    accessoriesIncluded: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    acquisitionForm: 'Compra',
    acquisitionValue: 0,
    isFirstOwner: true,
    previousOwnerHandle: ''
  });

  const myItems = useMemo(() => userStats?.collection || [], [userStats?.collection]);

  const filteredItems = useMemo(() => {
    return myItems.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const serialMatch = item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const manMatch = item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchSearch = nameMatch || serialMatch || manMatch;
      const matchType = filterType === 'all' || item.type === filterType;
      const matchMan = filterManufacturer === 'all' || 
                        (item.manufacturer && item.manufacturer.toLowerCase().includes(filterManufacturer.toLowerCase()));
      const matchGen = filterGen === 'all' || item.generation === filterGen;
      
      return matchSearch && matchType && matchMan && matchGen;
    });
  }, [myItems, searchTerm, filterType, filterManufacturer, filterGen]);

  // Análise Avançada para "Estatísticas da Coleção"
  const analyticsData = useMemo(() => {
    if (myItems.length === 0) return null;

    // 1. Distribuição por Marca (Manufacturer)
    // Explicitly using the generic parameter for reduce to ensure the accumulator is typed correctly
    const manCounts = myItems.reduce<Record<string, number>>((acc, i) => {
      let man = i.manufacturer || 'Outras';
      if (man.toLowerCase().includes('sony')) man = 'Sony';
      if (man.toLowerCase().includes('nintendo')) man = 'Nintendo';
      if (man.toLowerCase().includes('microsoft')) man = 'Microsoft';
      if (man.toLowerCase().includes('sega')) man = 'Sega';
      if (man.toLowerCase().includes('tectoy')) man = 'Tectoy';
      acc[man] = (acc[man] || 0) + 1;
      return acc;
    }, {});

    const manChartData = Object.entries(manCounts)
      .map(([name, value]) => ({ name, value: Number(value) }))
      .sort((a, b) => b.value - a.value);

    // 2. Análise de Geração
    // Explicitly using the generic parameter for reduce to ensure the accumulator is typed correctly
    const genCounts = myItems.reduce<Record<string, number>>((acc, i) => {
      const gen = i.generation || 'Retro';
      acc[gen] = (acc[gen] || 0) + 1;
      return acc;
    }, {});

    const genChartData = Object.entries(genCounts)
      .map(([name, value]) => ({ name, value: Number(value) }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // 3. Análise por Família (Linhagem)
    // Explicitly using the generic parameter for reduce to ensure the accumulator is typed correctly
    const familyCounts = myItems.reduce<Record<string, number>>((acc, i) => {
      const family = i.family || 'Standalone';
      acc[family] = (acc[family] || 0) + 1;
      return acc;
    }, {});

    const familyData = Object.entries(familyCounts)
      // Fix for Error line 123: Ensuring count is explicitly a number for arithmetic operations in .sort()
      .map(([name, count]) => ({ name, count: Number(count) }))
      .sort((a, b) => b.count - a.count);

    // 4. Integridade da Coleção (Checklist de Itens)
    const totalBoxed = myItems.filter(i => i.hasOriginalBox).length;
    const totalManual = myItems.filter(i => i.hasManual).length;
    const totalCIB = myItems.filter(i => i.condition === 'CIB' || i.condition.includes('Sealed')).length;

    return { 
      manChartData, 
      genChartData, 
      familyData,
      totalItems: myItems.length, 
      totalValue: myItems.reduce((acc, i) => acc + (i.value || 0), 0),
      metrics: {
        boxedRate: Math.round((totalBoxed / myItems.length) * 100),
        manualRate: Math.round((totalManual / myItems.length) * 100),
        cibRate: Math.round((totalCIB / myItems.length) * 100)
      }
    };
  }, [myItems]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userStats) return;

    const pedigree: OwnershipRecord[] = [];
    if (!newItem.isFirstOwner && newItem.previousOwnerHandle) {
      pedigree.push({
        ownerNexusId: newItem.previousOwnerHandle.startsWith('@') ? newItem.previousOwnerHandle : `@${newItem.previousOwnerHandle}`,
        ownerName: newItem.previousOwnerHandle.replace('@', ''),
        acquiredDate: 'Origem Primária',
        soldDate: newItem.acquisitionDate,
        ownerPrestigeAtTime: 0
      });
    }

    pedigree.push({
      ownerNexusId: userStats.nexusId,
      ownerName: userStats.nexusId.replace('@', ''),
      acquiredDate: newItem.acquisitionDate || new Date().toISOString(),
      ownerPrestigeAtTime: userStats.prestigePoints
    });

    const item: CollectionItem = {
      id: `c-${Date.now()}`,
      ownerId: userStats.nexusId,
      name: newItem.name || 'Nova Relíquia',
      type: newItem.type as any || 'Console',
      condition: newItem.condition || 'Usado',
      status: 'collection',
      imageUrl: newItem.imageUrl || `https://picsum.photos/800/800?random=${Date.now()}`,
      value: newItem.value || 0,
      dateAdded: new Date().toISOString(),
      manufacturer: newItem.manufacturer,
      family: newItem.family,
      modelCode: newItem.modelCode,
      region: newItem.region,
      serialNumber: newItem.serialNumber,
      platform: newItem.platform,
      year: newItem.year,
      generation: newItem.generation,
      architecture: newItem.architecture,
      storageCapacity: newItem.storageCapacity,
      mediaType: newItem.mediaType,
      functionality: newItem.functionality,
      modifications: newItem.modifications,
      firmware: newItem.firmware,
      hasOriginalBox: newItem.hasOriginalBox,
      hasManual: newItem.hasManual,
      hasOriginalAccessories: newItem.hasOriginalAccessories,
      hasReceipt: newItem.hasReceipt,
      accessoriesIncluded: newItem.accessoriesIncluded,
      acquisitionDate: newItem.acquisitionDate,
      acquisitionForm: newItem.acquisitionForm,
      acquisitionValue: newItem.acquisitionValue,
      history: newItem.history,
      pedigree: pedigree
    };

    addItemsToCollection([item]);
    setShowAddModal(false);
    setNewItem({
      name: '', type: 'Console', condition: 'CIB', status: 'collection', value: 0,
      hasOriginalBox: true, hasManual: true, hasOriginalAccessories: true, isFirstOwner: true
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 animate-fade-in overflow-hidden">
      {/* Header Soberano */}
      <header className="p-6 md:p-10 border-b border-nexus-800 bg-gradient-to-b from-nexus-900/50 to-transparent shrink-0">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-bold text-white tracking-tighter uppercase flex items-center gap-4">
              <Database className="text-nexus-accent animate-pulse" /> NEXUS <span className="text-nexus-secondary">ACERVO</span>
            </h1>
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.4em]">Gestão Patrimonial e Linhagem Técnica</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex bg-nexus-900 p-1.5 rounded-[1.5rem] border border-nexus-800 shadow-2xl backdrop-blur-xl">
               <button onClick={() => setActiveTab('my_collection')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'my_collection' ? 'bg-nexus-accent text-white' : 'text-gray-500 hover:text-white'}`}>
                 <LayoutGrid size={14} /> Galeria
               </button>
               <button onClick={() => setActiveTab('analytics')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-nexus-secondary text-white' : 'text-gray-500 hover:text-white'}`}>
                 <BarChart3 size={14} /> Estatísticas da Coleção
               </button>
             </div>
             
             <button onClick={() => setShowAddModal(true)} className="p-4 bg-nexus-accent text-white rounded-2xl shadow-xl shadow-nexus-accent/20 hover:scale-105 transition-all"><Plus size={20} /></button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'my_collection' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 bg-[#050507] border-b border-nexus-800 shrink-0">
              <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-nexus-accent transition-colors" size={18} />
                  <input type="text" placeholder="Localizar item pelo nome, serial ou marca..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-nexus-900 border border-nexus-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:border-nexus-accent outline-none shadow-inner" />
                </div>
                
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                   <FilterSelect value={filterType} onChange={setFilterType} options={['all', 'Console', 'Game', 'Accessory']} label="Tipo" />
                   <FilterSelect value={filterManufacturer} onChange={setFilterManufacturer} options={['all', 'Sony', 'Nintendo', 'Sega', 'Microsoft', 'Atari']} label="Fabricante" />
                   <FilterSelect value={filterGen} onChange={setFilterGen} options={['all', '9ª geração', '9th Gen', '8th Gen', '7th Gen', '6th Gen', '5th Gen', '4th Gen', '3rd Gen', 'Retro']} label="Geração" />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
              <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-8 pb-40">
                {filteredItems.map(item => (
                  <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-nexus-900 border border-nexus-800 rounded-[2.5rem] overflow-hidden group hover:border-nexus-accent transition-all cursor-pointer shadow-2xl relative hover:-translate-y-1">
                    <div className="h-48 relative overflow-hidden bg-black">
                        <img src={item.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                        <div className="absolute top-4 right-4 bg-nexus-accent/90 px-3 py-1 rounded-full text-[8px] font-black uppercase text-white shadow-lg">{item.generation}</div>
                        <div className="absolute inset-0 bg-gradient-to-t from-nexus-900 via-transparent to-transparent"></div>
                    </div>
                    <div className="p-6 space-y-4">
                       <div className="flex justify-between items-start">
                          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{item.condition}</span>
                          <span className="text-xs font-bold text-white/40">{item.year}</span>
                       </div>
                       <h3 className="text-lg font-bold text-white group-hover:text-nexus-accent transition-colors truncate">{item.name}</h3>
                       <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-400">
                             <Gamepad2 size={14} className="text-nexus-secondary" />
                             <span className="text-[10px] font-bold uppercase">{item.manufacturer?.split(' ')[0]}</span>
                          </div>
                          <ChevronRight size={18} className="text-gray-700 group-hover:text-white" />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && analyticsData && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 animate-fade-in bg-[#050507]">
            <div className="max-w-[1400px] mx-auto space-y-12 pb-40">
               
               {/* 1. Dashboard de KPIs de Valor e Volume */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KPICard label="Patrimônio Estimado" value={`R$ ${analyticsData.totalValue}`} icon={Landmark} color="text-nexus-accent" />
                  <KPICard label="Volume de Relíquias" value={analyticsData.totalItems} icon={Package} color="text-nexus-secondary" />
                  <KPICard label="Itens CIB / Sealed" value={`${analyticsData.metrics.cibRate}%`} icon={ShieldCheck} color="text-nexus-success" />
                  <KPICard label="Fabricante Dominante" value={analyticsData.manChartData[0]?.name || 'N/A'} icon={Star} color="text-yellow-500" />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Dominância de Marca */}
                  <div className="lg:col-span-5 bg-nexus-900 border border-nexus-800 p-10 rounded-[3.5rem] shadow-2xl flex flex-col h-[550px]">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-nexus-accent/20 rounded-2xl text-nexus-accent"><PieChartIcon size={24}/></div>
                        <div>
                           <h3 className="text-xl font-display font-bold text-white uppercase">Dominância de Marca</h3>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Market Share no Acervo</p>
                        </div>
                     </div>
                     <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie data={analyticsData.manChartData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">
                                 {analyticsData.manChartData.map((_, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />)}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#0f0f15', border: 'none', borderRadius: '1rem', color: '#fff', fontSize: '10px' }} />
                              <Legend iconType="circle" />
                           </PieChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  {/* Densidade de Geração */}
                  <div className="lg:col-span-7 bg-nexus-900 border border-nexus-800 p-10 rounded-[3.5rem] shadow-2xl flex flex-col h-[550px]">
                     <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-nexus-secondary/20 rounded-2xl text-nexus-secondary"><BarChartIcon size={24}/></div>
                        <div>
                           <h3 className="text-xl font-display font-bold text-white uppercase">Densidade por Geração</h3>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Cronologia Técnica do Hall</p>
                        </div>
                     </div>
                     <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={analyticsData.genChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#181820" vertical={false} />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10 }} />
                              <YAxis hide />
                              <Bar dataKey="value" fill="#06b6d4" radius={[12, 12, 0, 0]} barSize={50}>
                                 {analyticsData.genChartData.map((_, index) => <Cell key={index} fill={index % 2 === 0 ? '#8b5cf6' : '#06b6d4'} />)}
                              </Bar>
                              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0f0f15', border: 'none', borderRadius: '1rem', color: '#fff', fontSize: '10px' }} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </div>

               {/* Análise de Famílias e Linhagem */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-8 bg-nexus-900 border border-nexus-800 p-10 rounded-[3.5rem] shadow-2xl">
                     <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-nexus-accent/20 rounded-2xl text-nexus-accent"><History size={24}/></div>
                        <div>
                           <h3 className="text-xl font-display font-bold text-white uppercase">Matriz de Famílias</h3>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Concentração de Linhagem e Franquias</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analyticsData.familyData.map((fam, idx) => (
                           <div key={idx} className="bg-black/40 border border-white/5 p-6 rounded-3xl group hover:border-nexus-accent transition-all flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-nexus-800 flex items-center justify-center text-nexus-accent font-bold group-hover:scale-110 transition-transform">
                                    {fam.name.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-white truncate max-w-[120px]">{fam.name}</p>
                                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{fam.count} Itens</p>
                                 </div>
                              </div>
                              <div className="h-8 w-px bg-white/5 mx-2"></div>
                              <div className="text-nexus-accent font-mono font-bold text-xs">{Math.round((fam.count / analyticsData.totalItems) * 100)}%</div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="lg:col-span-4 bg-gradient-to-br from-nexus-accent/15 to-nexus-900 border border-nexus-accent/30 p-10 rounded-[3.5rem] shadow-2xl flex flex-col justify-center gap-8 relative overflow-hidden group">
                     <BrainCircuit className="absolute -bottom-10 -right-10 text-nexus-accent opacity-5 group-hover:scale-110 transition-transform" size={250} />
                     <h3 className="text-2xl font-display font-black text-white italic tracking-tighter uppercase leading-tight">Insight do Oráculo</h3>
                     <p className="text-gray-300 leading-relaxed text-lg italic relative z-10">
                        "Seu acervo apresenta uma inclinação fascinante para a família <span className="text-nexus-accent font-bold">{analyticsData.familyData[0]?.name}</span>. Você detém um fragmento significativo da história do gaming na <span className="text-nexus-secondary font-bold">{analyticsData.genChartData[0]?.name}</span>."
                     </p>
                     <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                        <div className="text-center">
                           <p className="text-[8px] text-gray-500 font-bold uppercase">CIB Status</p>
                           <p className="text-lg font-display font-black text-white">{analyticsData.metrics.cibRate}%</p>
                        </div>
                        <div className="text-center">
                           <p className="text-[8px] text-gray-500 font-bold uppercase">Boxed</p>
                           <p className="text-lg font-display font-black text-white">{analyticsData.metrics.boxedRate}%</p>
                        </div>
                        <div className="text-center">
                           <p className="text-[8px] text-gray-500 font-bold uppercase">Manual</p>
                           <p className="text-lg font-display font-black text-white">{analyticsData.metrics.manualRate}%</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* DETALHE DA RELÍQUIA */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
           <div className="bg-nexus-900 w-full max-w-7xl rounded-[3.5rem] border border-nexus-800 shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[92vh] animate-fade-in relative">
              <button onClick={() => setSelectedItem(null)} className="absolute top-8 right-8 z-[310] p-4 bg-black/60 hover:bg-white/10 rounded-2xl text-white transition-all border border-white/5"><X size={24} /></button>

              <div className="lg:w-[500px] bg-black relative flex items-center justify-center border-r border-nexus-800 overflow-hidden shrink-0">
                 <img src={selectedItem.imageUrl} className="w-full h-full object-contain scale-90" />
                 <div className="absolute bottom-10 left-10 flex flex-col gap-3">
                    <div className="bg-nexus-accent px-6 py-3 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-2xl">ID: {selectedItem.id.split('-')[0].toUpperCase()}</div>
                    {selectedItem.serialNumber && (
                       <div className="bg-nexus-secondary/90 backdrop-blur-md px-6 py-3 rounded-2xl text-white font-mono text-[11px] uppercase border border-white/10 shadow-2xl flex items-center gap-3">
                          <Hash size={16} /> SERIAL: {selectedItem.serialNumber}
                       </div>
                    )}
                 </div>
              </div>

              <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-[#08080c] p-8 lg:p-12 space-y-12">
                 <div className="space-y-6">
                    <div className="flex flex-wrap gap-3">
                       <BadgeItem label={selectedItem.type} icon={Package} />
                       <BadgeItem label={selectedItem.condition} icon={ShieldCheck} highlight />
                       <BadgeItem label={selectedItem.rarity || '---'} icon={Star} />
                       <BadgeItem label={selectedItem.generation || '---'} icon={Layers} />
                    </div>
                    <h2 className="text-5xl font-display font-bold text-white tracking-tighter leading-tight">{selectedItem.name}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                       <TechData icon={Landmark} label="Fabricante" value={selectedItem.manufacturer} />
                       <TechData icon={Layers} label="Família" value={selectedItem.family} />
                       <TechData icon={Binary} label="Código Modelo" value={selectedItem.modelCode} />
                       <TechData icon={Globe} label="Região" value={selectedItem.region} />
                    </div>
                 </div>

                 <section className="space-y-6">
                    <h4 className="text-xs font-black text-nexus-accent uppercase tracking-[0.3em] flex items-center gap-2"><Settings size={18} /> Especificações Técnicas</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                       <TechData icon={Gamepad2} label="Plataforma" value={selectedItem.platform} />
                       <TechData icon={Calendar} label="Ano Lançamento" value={selectedItem.year?.toString()} />
                       <TechData icon={Cpu} label="Arquitetura / SoC" value={selectedItem.architecture} />
                       <TechData icon={HardDrive} label="Capacidade" value={selectedItem.storageCapacity} />
                       <TechData icon={Disc} label="Mídia Suporte" value={selectedItem.mediaType} />
                       <TechData icon={MapPin} label="Local Fabricação" value={selectedItem.manufacturingPlace} />
                    </div>
                 </section>

                 <section className="space-y-6">
                    <h4 className="text-xs font-black text-nexus-secondary uppercase tracking-[0.3em] flex items-center gap-2"><ShieldAlert size={18} /> Estado e Integridade</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                       <TechData label="Funcionamento" value={selectedItem.functionality} highlight={selectedItem.functionality?.toLowerCase().includes('funcional')} />
                       <TechData label="Modificações" value={selectedItem.modifications || 'Nenhuma'} />
                       <TechData label="Firmware" value={selectedItem.firmware} />
                       <TechData label="Data Fabricação" value={selectedItem.manufacturingDate} />
                    </div>
                 </section>

                 <section className="space-y-6">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2"><FileCheck size={18} /> Documentação & Checklist</h4>
                    <div className="grid grid-cols-1 gap-6">
                       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <CheckItem label="Caixa Original" active={selectedItem.hasOriginalBox} />
                          <CheckItem label="Manual" active={selectedItem.hasManual} />
                          <CheckItem label="Acessórios Orig." active={selectedItem.hasOriginalAccessories} />
                          <CheckItem label="Nota Fiscal" active={selectedItem.hasReceipt} />
                       </div>
                       <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                          <p className="text-[10px] text-gray-500 font-black uppercase mb-3">Lista de Acessórios</p>
                          <p className="text-sm text-gray-300 font-medium">{selectedItem.accessoriesIncluded || '---'}</p>
                       </div>
                    </div>
                 </section>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-5">
                       <h4 className="text-xs font-black text-nexus-accent uppercase tracking-[0.3em] flex items-center gap-2"><ScrollText size={18} /> História da Relíquia</h4>
                       <p className="text-gray-300 text-lg leading-relaxed italic border-l-2 border-nexus-accent/30 pl-6">
                          "{selectedItem.history || "Este item aguarda o registro de sua linhagem memorial."}"
                       </p>
                    </div>
                    <div className="space-y-5">
                       <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2"><Landmark size={18} /> Informações de Coleção</h4>
                       <div className="grid grid-cols-2 gap-3">
                          <TechData label="Aquisição" value={selectedItem.acquisitionDate} />
                          <TechData label="Forma" value={selectedItem.acquisitionForm} />
                       </div>
                       <div className="bg-nexus-800/40 p-6 rounded-3xl border border-nexus-700 flex justify-between items-center">
                          <div>
                             <p className="text-[10px] text-gray-500 font-bold uppercase">Avaliação de Mercado</p>
                             <p className="text-3xl font-display font-black text-nexus-accent">R$ {selectedItem.value}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] text-gray-500 font-bold uppercase">Valor de Compra</p>
                             <p className="text-xl font-display font-bold text-gray-400">R$ {selectedItem.acquisitionValue || '---'}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2"><History size={18} /> Nexus Pedigree (Cadeia de Custódia)</h4>
                    <div className="p-8 bg-black/20 border border-nexus-800 rounded-[3rem]">
                       <PedigreeTimeline records={selectedItem.pedigree || []} />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* FORMULÁRIO DE ADIÇÃO COMPLETO */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
          <div className="bg-nexus-900 w-full max-w-4xl rounded-[3rem] border border-nexus-700 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
             <div className="p-8 border-b border-nexus-800 flex justify-between items-center bg-gradient-to-r from-nexus-secondary/10 to-transparent">
               <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tighter">Registrar Nova Relíquia</h3>
               <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white p-2"><X size={24} /></button>
             </div>
             
             <form onSubmit={handleAddItem} className="p-8 space-y-10 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   {/* Coluna 1: Dados Básicos */}
                   <div className="space-y-8">
                      <div className="space-y-4">
                         <p className="text-[10px] font-black text-nexus-accent uppercase tracking-widest">Identificação Básica</p>
                         <Input label="Nome do Item" value={newItem.name} onChange={(v: string) => setNewItem({...newItem, name: v})} placeholder="Ex: SNES 1CHIP-01" />
                         <div className="grid grid-cols-2 gap-4">
                            <Select label="Tipo" value={newItem.type} onChange={(v: string) => setNewItem({...newItem, type: v as any})} options={['Console', 'Game', 'Accessory', 'Merch']} />
                            <Input label="Fabricante" value={newItem.manufacturer} onChange={(v: string) => setNewItem({...newItem, manufacturer: v})} placeholder="Ex: Nintendo" />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <Input label="Família" value={newItem.family} onChange={(v: string) => setNewItem({...newItem, family: v})} placeholder="Ex: GameBoy" />
                            <Input label="Modelo" value={newItem.modelCode} onChange={(v: string) => setNewItem({...newItem, modelCode: v})} placeholder="Ex: SNS-001" />
                         </div>
                         <Input label="Serial Number" value={newItem.serialNumber} onChange={(v: string) => setNewItem({...newItem, serialNumber: v})} placeholder="Ex: UN239420" />
                      </div>

                      <div className="space-y-4">
                         <p className="text-[10px] font-black text-nexus-secondary uppercase tracking-widest">Especificações</p>
                         <div className="grid grid-cols-2 gap-4">
                            <Input label="Plataforma" value={newItem.platform} onChange={(v: string) => setNewItem({...newItem, platform: v})} placeholder="SNES" />
                            <Select label="Geração" value={newItem.generation} onChange={(v: string) => setNewItem({...newItem, generation: v})} options={['9th Gen', '9ª geração', '8th Gen', '7th Gen', '6th Gen', '5th Gen', '4th Gen', '3rd Gen', 'Retro']} />
                            <Input label="Arquitetura / SoC" value={newItem.architecture} onChange={(v: string) => setNewItem({...newItem, architecture: v})} placeholder="Ex: Motorola 68000" />
                            <Input label="Ano Lanç." value={newItem.year?.toString()} onChange={(v: string) => setNewItem({...newItem, year: Number(v)})} type="number" />
                         </div>
                      </div>
                   </div>

                   {/* Coluna 2: Origem e Pedigree */}
                   <div className="space-y-8">
                      <div className="bg-nexus-800/40 p-6 rounded-3xl border border-nexus-700 space-y-6">
                         <div className="flex items-center gap-3 text-nexus-accent">
                            <History size={18} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Matriz de Origem (Nexus Pedigree)</p>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                            <button 
                               type="button"
                               onClick={() => setNewItem({...newItem, isFirstOwner: true})}
                               className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${newItem.isFirstOwner ? 'bg-nexus-accent/20 border-nexus-accent text-white' : 'bg-nexus-900 border-nexus-800 text-gray-500 opacity-60'}`}
                            >
                               <ShieldCheck size={24} />
                               <span className="text-[10px] font-bold uppercase">Primeiro Dono</span>
                            </button>
                            <button 
                               type="button"
                               onClick={() => setNewItem({...newItem, isFirstOwner: false})}
                               className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${!newItem.isFirstOwner ? 'bg-nexus-secondary/20 border-nexus-secondary text-white' : 'bg-nexus-900 border-nexus-800 text-gray-500 opacity-60'}`}
                            >
                               <UserPlus size={24} />
                               <span className="text-[10px] font-bold uppercase">De Terceiros</span>
                            </button>
                         </div>

                         {!newItem.isFirstOwner && (
                            <div className="space-y-4 animate-fade-in">
                               <Input label="Vendedor (@NexusID ou Nome)" value={newItem.previousOwnerHandle} onChange={(v: string) => setNewItem({...newItem, previousOwnerHandle: v})} placeholder="Ex: @ColecionadorAlpha" />
                               <p className="text-[9px] text-gray-500 italic">O sistema vinculará este ID como o detentor anterior da linhagem.</p>
                            </div>
                         )}

                         <div className="grid grid-cols-2 gap-4 pt-2">
                            <Input label="Data de Aquisição" type="date" value={newItem.acquisitionDate} onChange={(v: string) => setNewItem({...newItem, acquisitionDate: v})} />
                            <Input label="Valor Pago (R$)" type="number" value={newItem.acquisitionValue?.toString()} onChange={(v: string) => setNewItem({...newItem, acquisitionValue: Number(v)})} placeholder="0.00" />
                         </div>
                      </div>

                      <div className="space-y-4">
                         <p className="text-[10px] font-black text-nexus-success uppercase tracking-widest">Integridade & Checklist</p>
                         <div className="grid grid-cols-2 gap-4">
                            <Select label="Estado de Compra" value={newItem.acquisitionForm} onChange={(v: string) => setNewItem({...newItem, acquisitionForm: v})} options={['Novo (Lacrado)', 'Novo (Aberto)', 'Usado', 'Recondicionado', 'Troca']} />
                            <Input label="Estado Cosmético Atual" value={newItem.condition} onChange={(v: string) => setNewItem({...newItem, condition: v})} placeholder="Ex: Near Mint" />
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <BooleanInput label="Caixa" value={newItem.hasOriginalBox} onChange={(v: boolean) => setNewItem({...newItem, hasOriginalBox: v})} />
                            <BooleanInput label="Manual" value={newItem.hasManual} onChange={(v: boolean) => setNewItem({...newItem, hasManual: v})} />
                            <BooleanInput label="Acessórios" value={newItem.hasOriginalAccessories} onChange={(v: boolean) => setNewItem({...newItem, hasOriginalAccessories: v})} />
                            <BooleanInput label="Nota Fiscal" value={newItem.hasReceipt} onChange={(v: boolean) => setNewItem({...newItem, hasReceipt: v})} />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Memória Patológica</p>
                   <textarea 
                     value={newItem.history} 
                     onChange={e => setNewItem({...newItem, history: e.target.value})} 
                     className="w-full bg-nexus-800 border border-nexus-700 rounded-3xl p-6 text-white focus:border-nexus-accent outline-none h-32 resize-none text-sm italic shadow-inner" 
                     placeholder="Relate a jornada técnica deste item e por que ele é especial no seu legado..." 
                   />
                </div>

                <button type="submit" className="w-full py-6 bg-nexus-accent text-white font-black uppercase text-xs tracking-[0.4em] rounded-2xl shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-4">
                   <Zap size={20} /> IMORTALIZAR NO ACERVO SOBERANO
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- SUB-COMPONENTES AUXILIARES --- */

const KPICard = ({ label, value, icon: Icon, color }: any) => (
   <div className="bg-nexus-900 border border-nexus-800 p-8 rounded-[2.5rem] shadow-xl flex flex-col gap-4 group hover:border-white/10 transition-all">
      <div className={`p-3 rounded-2xl bg-white/5 w-fit ${color} group-hover:scale-110 transition-transform`}>
         <Icon size={20} />
      </div>
      <div>
         <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
         <p className="text-3xl font-display font-black text-white">{value}</p>
      </div>
   </div>
);

const TechData = ({ icon: Icon, label, value, highlight }: any) => (
   <div className={`p-4 rounded-2xl border transition-all ${highlight ? 'bg-nexus-accent/10 border-nexus-accent/30' : 'bg-white/5 border-white/5'} group hover:border-nexus-accent/20`}>
      <div className="flex items-center gap-2 mb-1.5 opacity-60">
         {Icon && <Icon size={12} />}
         <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-sm font-bold truncate ${highlight ? 'text-nexus-accent' : 'text-white'}`}>{value || '---'}</p>
   </div>
);

const BadgeItem = ({ label, icon: Icon, highlight }: any) => (
  <div className={`px-4 py-1.5 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${highlight ? 'bg-nexus-accent/20 border-nexus-accent/30 text-nexus-accent' : 'bg-white/5 border-white/10 text-gray-400'}`}>
     <Icon size={12} /> {label}
  </div>
);

const CheckItem = ({ label, active }: { label: string, active?: boolean }) => (
   <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${active ? 'bg-nexus-success/10 border-nexus-success/30 text-nexus-success' : 'bg-nexus-900 border-nexus-800 text-gray-600'}`}>
      {active ? <CheckCircle2 size={14} /> : <X size={14} />}
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
   </div>
);

const FilterSelect = ({ value, onChange, options, label }: any) => (
  <div className="flex flex-col gap-1.5 shrink-0">
     <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest pl-1">{label}</span>
     <select value={value} onChange={e => onChange(e.target.value)} className="bg-nexus-900 border border-nexus-800 rounded-xl px-4 py-2 text-[10px] font-bold text-gray-400 focus:border-nexus-accent outline-none cursor-pointer appearance-none min-w-[110px]">
        {options.map((o: string) => <option key={o} value={o}>{o === 'all' ? 'Todos' : o}</option>)}
     </select>
  </div>
);

const Input = ({ label, value, onChange, placeholder, type = "text" }: any) => (
  <div className="space-y-1">
     <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{label}</label>
     <input required type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-6 py-4 text-white focus:border-nexus-accent outline-none shadow-inner transition-all placeholder:text-gray-700" placeholder={placeholder} />
  </div>
);

const Select = ({ label, value, onChange, options }: any) => (
  <div className="space-y-1">
     <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{label}</label>
     <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-5 py-4 text-sm text-white focus:border-nexus-accent outline-none appearance-none cursor-pointer">
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
     </select>
  </div>
);

const BooleanInput = ({ label, value, onChange }: any) => (
   <button type="button" onClick={() => onChange(!value)} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${value ? 'bg-nexus-success/10 border-nexus-success/30 text-white' : 'bg-nexus-800 border-nexus-700 text-gray-500'}`}>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      {value ? <CheckCircle2 size={16} className="text-nexus-success" /> : <X size={16} />}
   </button>
);
