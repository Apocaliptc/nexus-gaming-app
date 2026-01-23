
import React, { useState } from 'react';
import { MOCK_FRIENDS } from '../services/mockData';
import { CollectionItem, Platform } from '../types';
import { 
  Box, Plus, Search, Filter, DollarSign, Repeat, Tag, X, 
  Image as ImageIcon, Check, History, ShieldCheck, 
  Database, BrainCircuit, Sparkles, Loader2, FileText, Zap, AlertTriangle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { parseCollectionSpreadsheet } from '../services/geminiService';

export const Collection: React.FC = () => {
  const { userStats, addItemsToCollection } = useAppContext();
  const [activeTab, setActiveTab] = useState<'my_collection' | 'marketplace'>('my_collection');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Import state
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedItems, setParsedItems] = useState<CollectionItem[]>([]);

  const [newItem, setNewItem] = useState({
    name: '',
    type: 'Game',
    condition: 'CIB',
    status: 'collection',
    value: 0
  });

  const myItems = userStats?.collection || [];
  const marketItems = []; // No mock data for now beyond local items

  const filteredItems = (activeTab === 'my_collection' ? myItems : marketItems).filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const item: CollectionItem = {
      id: `new-${Date.now()}`,
      ownerId: 'me',
      name: newItem.name,
      type: newItem.type,
      condition: newItem.condition,
      status: newItem.status,
      imageUrl: `https://picsum.photos/400/400?random=${Date.now()}`,
      value: newItem.value,
      dateAdded: new Date().toISOString()
    };
    addItemsToCollection([item]);
    setShowAddModal(false);
    setNewItem({ name: '', type: 'Game', condition: 'CIB', status: 'collection', value: 0 });
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
      {/* Header Compacto */}
      <header className="p-6 md:p-8 border-b border-nexus-800 bg-gradient-to-b from-nexus-900/50 to-transparent shrink-0">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold text-white tracking-tighter uppercase">NEXUS <span className="text-nexus-secondary">COLEÇÃO</span></h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Acervo Físico, Hardware e Relíquias</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex bg-nexus-900 p-1 rounded-xl border border-nexus-800 shadow-xl">
               <button 
                 onClick={() => setActiveTab('my_collection')}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'my_collection' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
               >
                 Meu Acervo
               </button>
               <button 
                 onClick={() => setActiveTab('marketplace')}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'marketplace' ? 'bg-nexus-secondary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
               >
                 Mercado Global
               </button>
             </div>
             
             <button 
               onClick={() => setShowImportModal(true)}
               className="p-2.5 bg-nexus-900 border border-nexus-700 text-nexus-accent rounded-xl hover:bg-nexus-800 transition-all shadow-lg flex items-center gap-2"
               title="Importar Planilha"
             >
               <BrainCircuit size={20} />
               <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Smart Import</span>
             </button>

             <button 
               onClick={() => setShowAddModal(true)}
               className="p-2.5 bg-nexus-accent rounded-xl hover:bg-nexus-accent/80 transition-all shadow-lg"
               title="Registrar Item"
             >
               <Plus size={20} />
             </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="p-4 border-b border-nexus-800 shrink-0 bg-[#050507]">
         <div className="max-w-[1600px] mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder={`Filtrar ${activeTab === 'my_collection' ? 'seu acervo' : 'no mercado global'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-nexus-900 border border-nexus-700 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-nexus-secondary outline-none transition-all font-medium"
            />
         </div>
      </div>

      {/* Grid de Itens */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 pb-24">
           {filteredItems.map(item => (
              <div key={item.id} className="bg-nexus-900 rounded-[3rem] border border-nexus-800 overflow-hidden group hover:border-nexus-secondary transition-all flex flex-col shadow-2xl relative hover:-translate-y-2 duration-500">
                 <div className="h-48 relative overflow-hidden bg-black shrink-0">
                    <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100" alt={item.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-nexus-900 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5 text-[9px] text-white font-bold flex items-center gap-1.5 uppercase tracking-widest">
                       <Box size={10} className="text-nexus-secondary" /> {item.type}
                    </div>
                 </div>

                 <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">{item.condition}</span>
                       <ShieldCheck size={14} className="text-nexus-success opacity-50" />
                    </div>
                    <h3 className="font-display font-bold text-white text-lg leading-tight group-hover:text-nexus-secondary transition-colors truncate mb-4">{item.name}</h3>
                    
                    <div className="mt-auto pt-4 border-t border-white/5 flex items-end justify-between">
                       <div>
                          <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Avaliação</p>
                          <p className="text-xl font-display font-black text-nexus-secondary leading-none tracking-tighter">${item.value}</p>
                       </div>
                    </div>
                 </div>
              </div>
           ))}

           {filteredItems.length === 0 && (
              <div className="col-span-full py-32 text-center text-gray-600">
                 <Box size={64} className="mx-auto mb-4 opacity-10" />
                 <p className="text-xl font-display font-bold uppercase tracking-widest opacity-20">Acervo Vazio</p>
              </div>
           )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
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

      {/* Add Modal (Manual) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-nexus-900 w-full max-w-lg rounded-[3rem] border border-nexus-700 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
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
