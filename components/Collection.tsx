
import React, { useState, useMemo } from 'react';
import { MOCK_FRIENDS } from '../services/mockData';
import { CollectionItem, Platform } from '../types';
import { 
  Box, Plus, Search, Filter, DollarSign, Repeat, Tag, X, 
  Image as ImageIcon, Check, History, ShieldCheck, 
  Database, BrainCircuit, Sparkles, Loader2, FileText, Zap, AlertTriangle,
  TrendingUp, BarChart3, PieChart as PieIcon, LayoutGrid, Calendar, ChevronRight, Info,
  Monitor, Gamepad2, Package, Globe, UserCircle, Star, ArrowDown
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { parseCollectionSpreadsheet } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PedigreeTimeline } from './PedigreeTimeline';

const PIE_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#ef4444'];

export const Collection: React.FC = () => {
  const { userStats, addItemsToCollection } = useAppContext();
  const [activeTab, setActiveTab] = useState<'my_collection' | 'analytics' | 'marketplace'>('my_collection');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  // Import state
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedItems, setParsedItems] = useState<CollectionItem[]>([]);

  const [newItem, setNewItem] = useState({
    name: '',
    type: 'Game',
    condition: 'CIB',
    status: 'collection',
    value: 0,
    platform: '',
    year: 2024,
    generation: '9th Gen',
    description: ''
  });

  const myItems = userStats?.collection || [];
  const marketItems: CollectionItem[] = []; 

  const filteredItems = useMemo(() => {
    const source = activeTab === 'my_collection' ? myItems : marketItems;
    return source.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'all' || item.type === filterType;
      const matchCond = filterCondition === 'all' || item.condition === filterCondition;
      const matchPlat = filterPlatform === 'all' || item.platform?.toLowerCase().includes(filterPlatform.toLowerCase());
      return matchSearch && matchType && matchCond && matchPlat;
    });
  }, [myItems, marketItems, activeTab, searchTerm, filterType, filterCondition, filterPlatform]);

  // Analytics Data
  const analyticsData = useMemo(() => {
    if (myItems.length === 0) return null;

    const totalValue = myItems.reduce((acc, i) => acc + i.value, 0);
    
    const byType = myItems.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + i.value;
      return acc;
    }, {} as Record<string, number>);

    const byCondition = myItems.reduce((acc, i) => {
      acc[i.condition] = (acc[i.condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeChartData = Object.entries(byType).map(([name, value]) => ({ name, value }));
    const conditionChartData = Object.entries(byCondition).map(([name, value]) => ({ name, value }));

    const topValueItems = [...myItems].sort((a, b) => b.value - a.value).slice(0, 5);

    return { totalValue, typeChartData, conditionChartData, topValueItems };
  }, [myItems]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const item: CollectionItem = {
      id: `new-${Date.now()}`,
      ownerId: 'me',
      ...newItem,
      imageUrl: `https://picsum.photos/400/400?random=${Date.now()}`,
      dateAdded: new Date().toISOString()
    };
    addItemsToCollection([item]);
    setShowAddModal(false);
    setNewItem({ name: '', type: 'Game', condition: 'CIB', status: 'collection', value: 0, platform: '', year: 2024, generation: '9th Gen', description: '' });
  };

  const handleSmartImport = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    try {
      const items = await parseCollectionSpreadsheet(rawText);
      setParsedItems(items);
    } catch (e) {
      console.error("Smart Import Failed", e);
    } finally {
      setIsParsing(false);
    }
  };

  const confirmImport = () => {
    addItemsToCollection(parsedItems);
    setShowImportModal(false);
    setParsedItems([]);
    setRawText('');
  };

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 animate-fade-in overflow-hidden">
      {/* Header Premium */}
      <header className="p-6 md:p-8 border-b border-nexus-800 bg-gradient-to-b from-nexus-900/50 to-transparent shrink-0">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tighter uppercase flex items-center gap-4">
              NEXUS <span className="text-nexus-secondary">COLEÇÃO</span>
              <Box className="text-nexus-accent animate-pulse" />
            </h1>
            <p className="text-gray-500 text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">Acervo Físico, Hardware e Relíquias Verificadas</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex bg-nexus-900 p-1 rounded-2xl border border-nexus-800 shadow-2xl backdrop-blur-xl">
               <button 
                 onClick={() => setActiveTab('my_collection')}
                 className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'my_collection' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
               >
                 <LayoutGrid size={14} /> Meu Acervo
               </button>
               <button 
                 onClick={() => setActiveTab('analytics')}
                 className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-nexus-secondary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
               >
                 <BarChart3 size={14} /> Analytics
               </button>
               <button 
                 onClick={() => setActiveTab('marketplace')}
                 className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'marketplace' ? 'bg-nexus-accent/20 text-nexus-accent shadow-lg' : 'text-gray-500 hover:text-white'}`}
               >
                 <Globe size={14} /> Mercado
               </button>
             </div>
             
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowImportModal(true)}
                  className="p-3 bg-nexus-900 border border-nexus-700 text-nexus-accent rounded-xl hover:bg-nexus-800 transition-all shadow-lg flex items-center gap-2"
                  title="Importar Planilha"
                >
                  <BrainCircuit size={20} />
                  <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Smart Import</span>
                </button>

                <button 
                  onClick={() => setShowAddModal(true)}
                  className="p-3 bg-nexus-accent rounded-xl hover:bg-nexus-accent/80 text-white transition-all shadow-lg shadow-nexus-accent/20"
                  title="Registrar Item"
                >
                  <Plus size={20} />
                </button>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'my_collection' && (
          <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
            {/* Expanded Toolbar with Filters */}
            <div className="p-6 border-b border-nexus-800 bg-[#050507] shrink-0 space-y-4">
              <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Localizar relíquia no acervo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-nexus-900 border border-nexus-700 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:border-nexus-accent outline-none transition-all shadow-inner"
                  />
                </div>
                
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                   <select 
                     value={filterType}
                     onChange={e => setFilterType(e.target.value)}
                     className="bg-nexus-900 border border-nexus-700 rounded-xl px-4 py-2 text-xs font-bold text-gray-400 focus:border-nexus-accent outline-none appearance-none cursor-pointer"
                   >
                     <option value="all">Categoria: Todas</option>
                     <option value="Game">Jogos</option>
                     <option value="Console">Consoles</option>
                     <option value="Accessory">Acessórios</option>
                   </select>

                   <select 
                     value={filterPlatform}
                     onChange={e => setFilterPlatform(e.target.value)}
                     className="bg-nexus-900 border border-nexus-700 rounded-xl px-4 py-2 text-xs font-bold text-gray-400 focus:border-nexus-accent outline-none appearance-none cursor-pointer"
                   >
                     <option value="all">Plataforma: Todas</option>
                     <option value="PlayStation">PlayStation</option>
                     <option value="Nintendo">Nintendo</option>
                     <option value="Xbox">Xbox</option>
                     <option value="Sega">Sega</option>
                   </select>

                   <select 
                     value={filterCondition}
                     onChange={e => setFilterCondition(e.target.value)}
                     className="bg-nexus-900 border border-nexus-700 rounded-xl px-4 py-2 text-xs font-bold text-gray-400 focus:border-nexus-accent outline-none appearance-none cursor-pointer"
                   >
                     <option value="all">Estado: Todos</option>
                     <option value="Sealed">Sealed</option>
                     <option value="CIB">CIB</option>
                     <option value="Loose">Loose</option>
                   </select>
                </div>
              </div>
            </div>

            {/* Grid de Itens */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10 pb-32">
                {filteredItems.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedItem(item)}
                    className="bg-nexus-900 rounded-[3rem] border border-nexus-800 overflow-hidden group hover:border-nexus-accent transition-all flex flex-col shadow-2xl relative hover:-translate-y-2 duration-500 cursor-pointer"
                  >
                    <div className="h-56 relative overflow-hidden bg-black shrink-0">
                        <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100" alt={item.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-nexus-900 via-transparent to-transparent"></div>
                        <div className="absolute top-4 right-4 bg-nexus-accent/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[8px] text-white font-black uppercase tracking-widest shadow-lg">
                           {item.year || 'Retro'}
                        </div>
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 text-[9px] text-white font-bold flex items-center gap-1.5 uppercase tracking-widest">
                          <Box size={10} className="text-nexus-secondary" /> {item.type}
                        </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">{item.condition}</span>
                          <div className="flex gap-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-nexus-success"></div>
                             <div className="w-1.5 h-1.5 rounded-full bg-nexus-success opacity-50"></div>
                             <div className="w-1.5 h-1.5 rounded-full bg-nexus-success opacity-20"></div>
                          </div>
                        </div>
                        <h3 className="font-display font-bold text-white text-xl leading-tight group-hover:text-nexus-accent transition-colors truncate mb-4">{item.name}</h3>
                        
                        <div className="flex items-center gap-3 mb-6">
                           <div className="flex items-center gap-1.5 text-gray-500">
                              <Gamepad2 size={12} className="text-nexus-secondary" />
                              <span className="text-[10px] font-bold uppercase truncate">{item.platform || 'General'}</span>
                           </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/5 flex items-end justify-between">
                          <div>
                              <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1">Valor Estimado</p>
                              <p className="text-2xl font-display font-black text-nexus-accent leading-none tracking-tighter">${item.value}</p>
                          </div>
                          <ChevronRight className="text-gray-800 group-hover:text-white transition-all" size={24} />
                        </div>
                    </div>
                  </div>
                ))}

                {filteredItems.length === 0 && (
                  <div className="col-span-full py-40 text-center text-gray-600 flex flex-col items-center gap-6">
                    <Box size={80} className="opacity-10" />
                    <p className="text-2xl font-display font-bold uppercase tracking-[0.4em] opacity-20">Acervo não Localizado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && analyticsData && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 animate-fade-in">
            <div className="max-w-[1400px] mx-auto space-y-12 pb-32">
               {/* KPI Header */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-nexus-900 border border-nexus-800 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                     <DollarSign className="absolute -top-6 -right-6 text-nexus-accent opacity-5 group-hover:scale-110 transition-transform" size={150} />
                     <p className="text-xs font-black text-nexus-accent uppercase tracking-[0.3em] mb-4">Capital de Legado</p>
                     <h3 className="text-5xl font-display font-black text-white tracking-tighter">${analyticsData.totalValue}</h3>
                     <p className="text-xs text-gray-500 mt-2 italic">Avaliação total do acervo sintonizado.</p>
                  </div>
                  
                  <div className="bg-nexus-900 border border-nexus-800 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                     <Package className="absolute -top-6 -right-6 text-nexus-secondary opacity-5 group-hover:scale-110 transition-transform" size={150} />
                     <p className="text-xs font-black text-nexus-secondary uppercase tracking-[0.3em] mb-4">Volume Físico</p>
                     <h3 className="text-5xl font-display font-black text-white tracking-tighter">{myItems.length}</h3>
                     <p className="text-xs text-gray-500 mt-2 italic">Unidades imortalizadas no banco.</p>
                  </div>

                  <div className="bg-nexus-900 border border-nexus-800 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                     <TrendingUp className="absolute -top-6 -right-6 text-nexus-success opacity-5 group-hover:scale-110 transition-transform" size={150} />
                     <p className="text-xs font-black text-nexus-success uppercase tracking-[0.3em] mb-4">Média por Item</p>
                     <h3 className="text-5xl font-display font-black text-white tracking-tighter">${Math.round(analyticsData.totalValue / (myItems.length || 1))}</h3>
                     <p className="text-xs text-gray-500 mt-2 italic">Valor médio das relíquias individuais.</p>
                  </div>
               </div>

               {/* Charts Grid */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="bg-nexus-900 border border-nexus-800 p-10 rounded-[3rem] shadow-2xl flex flex-col h-[500px]">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-nexus-accent/20 rounded-2xl text-nexus-accent"><PieIcon size={24}/></div>
                        <div>
                           <h4 className="text-xl font-display font-bold text-white uppercase">Distribuição de Valor</h4>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Valor por Categoria de Item</p>
                        </div>
                     </div>
                     <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                 data={analyticsData.typeChartData}
                                 cx="50%"
                                 cy="50%"
                                 innerRadius={80}
                                 outerRadius={120}
                                 paddingAngle={8}
                                 dataKey="value"
                              >
                                 {analyticsData.typeChartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                                 ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#0f0f15', border: '1px solid #23232f', borderRadius: '1rem' }} />
                              <Legend verticalAlign="bottom" iconType="circle" />
                           </PieChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  <div className="bg-nexus-900 border border-nexus-800 p-10 rounded-[3rem] shadow-2xl flex flex-col h-[500px]">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-nexus-secondary/20 rounded-2xl text-nexus-secondary"><ShieldCheck size={24}/></div>
                        <div>
                           <h4 className="text-xl font-display font-bold text-white uppercase">Métrica de Conservação</h4>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Volume de Itens por Estado</p>
                        </div>
                     </div>
                     <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={analyticsData.conditionChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#181820" vertical={false} />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10 }} />
                              <YAxis hide />
                              <Tooltip contentStyle={{ backgroundColor: '#0f0f15', border: '1px solid #23232f', borderRadius: '1rem' }} />
                              <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </div>

               {/* Top Items Table */}
               <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] shadow-2xl overflow-hidden">
                  <div className="p-10 border-b border-nexus-800 flex justify-between items-center">
                     <h4 className="text-2xl font-display font-bold text-white flex items-center gap-4">
                        <Star className="text-yellow-500" fill="currentColor" size={24} /> Ouro do Acervo
                     </h4>
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Top 5 Maiores Avaliações</span>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full">
                        <tbody className="divide-y divide-nexus-800">
                           {analyticsData.topValueItems.map((item, idx) => (
                              <tr key={item.id} className="hover:bg-nexus-800/20 transition-all group">
                                 <td className="p-6 pl-10 w-16">
                                    <span className="text-2xl font-display font-black text-nexus-accent">#{idx + 1}</span>
                                 </td>
                                 <td className="p-6">
                                    <div className="flex items-center gap-6">
                                       <img src={item.imageUrl} className="w-14 h-14 rounded-2xl object-cover border border-nexus-700 group-hover:scale-105 transition-transform" />
                                       <div>
                                          <h5 className="font-bold text-white text-lg">{item.name}</h5>
                                          <p className="text-[10px] text-gray-500 font-bold uppercase">{item.platform} • {item.year}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-6 text-center">
                                    <span className="px-4 py-1.5 rounded-xl border border-nexus-success/20 bg-nexus-success/10 text-nexus-success text-[10px] font-black uppercase tracking-widest">
                                       {item.condition}
                                    </span>
                                 </td>
                                 <td className="p-6 pr-10 text-right">
                                    <p className="text-2xl font-display font-black text-nexus-accent">${item.value}</p>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'marketplace' && (
           <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-fade-in opacity-40">
              <div className="w-40 h-40 bg-nexus-800 rounded-[3rem] border-2 border-dashed border-nexus-700 flex items-center justify-center">
                 <Globe size={64} className="text-gray-600" />
              </div>
              <div className="text-center space-y-2">
                 <h3 className="text-3xl font-display font-bold text-white">Mercado Global em Sincronia</h3>
                 <p className="text-gray-500 max-w-sm mx-auto">Aguardando sinais da rede de comércio peer-to-peer do Nexus.</p>
              </div>
           </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
           <div className="bg-nexus-900 w-full max-w-5xl rounded-[3.5rem] border border-nexus-700 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] animate-fade-in relative">
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-8 right-8 z-[310] p-4 bg-black/60 hover:bg-white/10 rounded-2xl text-white transition-all border border-white/5"
              >
                <X size={24} />
              </button>

              <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden border-r border-nexus-800">
                 <img src={selectedItem.imageUrl} className="w-full h-full object-contain scale-95 hover:scale-100 transition-transform duration-1000" />
                 <div className="absolute bottom-10 left-10 flex gap-4">
                    <div className="bg-nexus-accent px-6 py-3 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-2xl">
                       ID: {selectedItem.id.split('-')[0].toUpperCase()}
                    </div>
                    {selectedItem.year && (
                      <div className="bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-2xl">
                         Lançamento: {selectedItem.year}
                      </div>
                    )}
                 </div>
              </div>

              <div className="w-full md:w-[450px] flex flex-col overflow-y-auto custom-scrollbar bg-nexus-900 p-10 md:p-14">
                 <div className="space-y-12">
                    <div className="space-y-4">
                       <div className="flex flex-wrap gap-2">
                          <span className="px-4 py-1.5 bg-nexus-secondary/20 border border-nexus-secondary/30 rounded-xl text-nexus-secondary text-[10px] font-black uppercase tracking-widest">{selectedItem.type}</span>
                          <span className="px-4 py-1.5 bg-nexus-accent/20 border border-nexus-accent/30 rounded-xl text-nexus-accent text-[10px] font-black uppercase tracking-widest">{selectedItem.condition}</span>
                          {selectedItem.generation && <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-[10px] font-black uppercase tracking-widest">{selectedItem.generation}</span>}
                       </div>
                       <h2 className="text-4xl font-display font-bold text-white tracking-tighter leading-tight">{selectedItem.name}</h2>
                       <div className="flex items-center gap-3 text-nexus-secondary">
                          <Gamepad2 size={20} />
                          <span className="text-lg font-bold">{selectedItem.platform || 'Multiformato'}</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="p-6 bg-nexus-800/40 rounded-3xl border border-nexus-700">
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Avaliação</p>
                          <p className="text-3xl font-display font-black text-nexus-accent">${selectedItem.value}</p>
                       </div>
                       <div className="p-6 bg-nexus-800/40 rounded-3xl border border-nexus-700">
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Status</p>
                          <p className="text-xl font-bold text-white">{selectedItem.status === 'collection' ? 'No Acervo' : 'Negociável'}</p>
                       </div>
                    </div>

                    {selectedItem.description && (
                       <div className="space-y-4">
                          <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                             <Info size={16} className="text-nexus-accent" /> Sobre a Peça
                          </h4>
                          <p className="text-gray-400 text-base leading-relaxed italic">"{selectedItem.description}"</p>
                       </div>
                    )}

                    <div className="space-y-6">
                       <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <History size={16} className="text-nexus-secondary" /> Linhagem Nexus Pedigree
                       </h4>
                       <div className="p-8 bg-nexus-800/30 border border-nexus-700 rounded-[2.5rem]">
                          <PedigreeTimeline records={selectedItem.pedigree || [
                             { ownerNexusId: 'leg-1', ownerName: 'Apocaliptc', acquiredDate: selectedItem.dateAdded, ownerPrestigeAtTime: userStats?.prestigePoints || 18200 }
                          ]} />
                       </div>
                    </div>

                    <div className="pt-8 flex gap-4">
                       <button className="flex-1 py-5 bg-nexus-accent hover:bg-nexus-accent/80 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl shadow-nexus-accent/20">
                          Ver Certificado
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[400] flex items-center justify-center p-4">
           <div className="bg-nexus-900 w-full max-w-2xl rounded-[3rem] border border-nexus-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-nexus-800 flex justify-between items-center bg-gradient-to-r from-nexus-accent/10 to-transparent">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-nexus-accent/20 rounded-2xl flex items-center justify-center text-nexus-accent border border-nexus-accent/30">
                       <BrainCircuit size={28} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-display font-bold text-white">Nexus Smart Parser</h3>
                       <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Processamento de Dados por IA</p>
                    </div>
                 </div>
                 <button onClick={() => setShowImportModal(false)} className="text-gray-500 hover:text-white p-2">
                    <X size={24} />
                 </button>
              </div>

              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                 {parsedItems.length === 0 ? (
                    <div className="space-y-4">
                       <div className="bg-nexus-800/50 p-6 rounded-3xl border border-nexus-700">
                          <p className="text-sm text-gray-400 leading-relaxed mb-4">
                             Cole o conteúdo da sua planilha abaixo. A IA do Nexus irá identificar automaticamente títulos, consoles, condições e valores.
                          </p>
                          <textarea 
                             value={rawText}
                             onChange={(e) => setRawText(e.target.value)}
                             placeholder="Ex: Console | PlayStation | Classic... ou apenas uma lista de jogos..."
                             className="w-full bg-nexus-900 border border-nexus-700 rounded-2xl p-6 text-white font-mono text-xs focus:border-nexus-accent outline-none h-64 resize-none shadow-inner"
                          />
                       </div>
                       <button 
                          onClick={handleSmartImport}
                          disabled={isParsing || !rawText.trim()}
                          className="w-full py-5 bg-nexus-accent text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all hover:bg-nexus-accent/80 flex items-center justify-center gap-3 disabled:opacity-50"
                       >
                          {isParsing ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                          {isParsing ? 'Analizando Dados...' : 'Escanear com IA'}
                       </button>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <h4 className="text-xl font-bold text-white flex items-center gap-2">
                             <Check className="text-nexus-success" /> {parsedItems.length} Itens Identificados
                          </h4>
                          <button onClick={() => setParsedItems([])} className="text-xs text-gray-500 hover:text-white uppercase font-bold underline">Limpar e Refazer</button>
                       </div>
                       <div className="grid grid-cols-1 gap-3">
                          {parsedItems.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-4 bg-nexus-800/40 p-4 rounded-2xl border border-nexus-700">
                                <div className="w-10 h-10 rounded-lg bg-nexus-900 flex items-center justify-center text-nexus-secondary border border-nexus-700">
                                   <Box size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                   <p className="text-sm font-bold text-white truncate">{item.name}</p>
                                   <div className="flex gap-3 text-[9px] font-black uppercase tracking-widest text-gray-500">
                                      <span>{item.type}</span>
                                      <span>{item.condition}</span>
                                      <span className="text-nexus-accent">${item.value}</span>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                       <button 
                          onClick={confirmImport}
                          className="w-full py-5 bg-nexus-success text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all hover:bg-green-500 flex items-center justify-center gap-3"
                       >
                          <Database size={18} /> Confirmar Importação no Perfil
                       </button>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
          <div className="bg-nexus-900 w-full max-w-xl rounded-[3rem] border border-nexus-700 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
             <div className="p-8 border-b border-nexus-800 flex justify-between items-center bg-gradient-to-r from-nexus-secondary/10 to-transparent">
               <h3 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                 <Plus className="text-nexus-secondary" /> Registrar Relíquia
               </h3>
               <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white p-2">
                 <X size={24} />
               </button>
             </div>
             
             <form onSubmit={handleAddItem} className="p-8 space-y-6">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Nome do Item</label>
                   <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl p-4 text-white focus:border-nexus-secondary outline-none shadow-inner transition-all" placeholder="Ex: Game Boy Advance SP..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Tipo</label>
                     <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value})} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl p-4 text-white focus:border-nexus-secondary outline-none appearance-none cursor-pointer">
                        <option value="Game">Jogo Físico</option>
                        <option value="Console">Console</option>
                        <option value="Accessory">Acessório</option>
                        <option value="Merch">Merchandise</option>
                     </select>
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Condição</label>
                     <select value={newItem.condition} onChange={e => setNewItem({...newItem, condition: e.target.value})} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl p-4 text-white focus:border-nexus-secondary outline-none appearance-none cursor-pointer">
                        <option value="Sealed">Lacrado (Sealed)</option>
                        <option value="CIB">Completo (CIB)</option>
                        <option value="Loose">Solto (Loose)</option>
                        <option value="Refurbished">Restaurado</option>
                     </select>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Plataforma</label>
                     <input type="text" value={newItem.platform} onChange={e => setNewItem({...newItem, platform: e.target.value})} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl p-4 text-white focus:border-nexus-secondary outline-none" placeholder="Ex: SNES" />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Ano</label>
                     <input type="number" value={newItem.year} onChange={e => setNewItem({...newItem, year: Number(e.target.value)})} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl p-4 text-white focus:border-nexus-secondary outline-none" />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Geração</label>
                     <input type="text" value={newItem.generation} onChange={e => setNewItem({...newItem, generation: e.target.value})} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl p-4 text-white focus:border-nexus-secondary outline-none" placeholder="Ex: 4th Gen" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Avaliação ($)</label>
                     <input type="number" value={newItem.value} onChange={e => setNewItem({...newItem, value: Number(e.target.value)})} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl p-4 text-white focus:border-nexus-secondary outline-none shadow-inner" />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Privacidade</label>
                     <select value={newItem.status} onChange={e => setNewItem({...newItem, status: e.target.value})} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl p-4 text-white focus:border-nexus-secondary outline-none appearance-none cursor-pointer">
                        <option value="collection">Privado (Coleção)</option>
                        <option value="trade">Para Troca</option>
                        <option value="sale">Para Venda</option>
                     </select>
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Descrição</label>
                   <textarea value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl p-4 text-white focus:border-nexus-secondary outline-none h-24 resize-none" placeholder="Detalhes únicos da peça..." />
                </div>
                
                <button type="submit" className="w-full py-5 bg-nexus-secondary text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all hover:bg-nexus-secondary/80 flex items-center justify-center gap-3">
                   <Check size={20} /> Eternizar no Acervo
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
