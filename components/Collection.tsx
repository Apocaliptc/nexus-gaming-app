
import React, { useState } from 'react';
import { MOCK_COLLECTION, MOCK_FRIENDS } from '../services/mockData';
import { CollectionItem, Platform } from '../types';
import { Box, Plus, Search, Filter, DollarSign, Repeat, Tag, X, Image as ImageIcon, Check, History, ShieldCheck } from 'lucide-react';

export const Collection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my_collection' | 'marketplace'>('my_collection');
  const [items, setItems] = useState<CollectionItem[]>(MOCK_COLLECTION);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newItem, setNewItem] = useState({
    name: '',
    type: 'Game',
    condition: 'CIB',
    status: 'collection',
    value: 0
  });

  const myItems = items.filter(item => item.ownerId === 'me');
  const marketItems = items.filter(item => item.ownerId !== 'me' && (item.status === 'sale' || item.status === 'trade'));

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
    setItems([item, ...items]);
    setShowAddModal(false);
    setNewItem({ name: '', type: 'Game', condition: 'CIB', status: 'collection', value: 0 });
  };

  const getOwnerName = (id: string) => {
    const friend = MOCK_FRIENDS.find(f => f.id === id);
    return friend ? friend.username : 'Especialista';
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
                 <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 items-end">
                    {item.status === 'sale' && (
                      <span className="bg-green-600 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase shadow-2xl border border-green-400/50">Venda</span>
                    )}
                    {item.status === 'trade' && (
                      <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase shadow-2xl border border-blue-400/50">Troca</span>
                    )}
                 </div>

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
                       {activeTab === 'marketplace' ? (
                         <button className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-nexus-secondary hover:text-white transition-all shadow-lg">
                            Proposta
                         </button>
                       ) : (
                         <button className="p-2 text-gray-600 hover:text-white transition-colors">
                            <History size={16} />
                         </button>
                       )}
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

      {/* Add Modal */}
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
