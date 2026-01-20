
import React, { useState } from 'react';
import { MOCK_COLLECTION, MOCK_FRIENDS } from '../services/mockData';
import { CollectionItem, Platform } from '../types';
import { Box, Plus, Search, Filter, DollarSign, Repeat, Tag, X, Image as ImageIcon, Check } from 'lucide-react';

export const Collection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my_collection' | 'marketplace'>('my_collection');
  const [items, setItems] = useState<CollectionItem[]>(MOCK_COLLECTION);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Item Form State
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
      imageUrl: `https://picsum.photos/200/200?random=${Date.now()}`,
      value: newItem.value,
      dateAdded: new Date().toISOString()
    };
    setItems([item, ...items]);
    setShowAddModal(false);
    setNewItem({ name: '', type: 'Game', condition: 'CIB', status: 'collection', value: 0 });
  };

  const getOwnerName = (id: string) => {
    const friend = MOCK_FRIENDS.find(f => f.id === id);
    return friend ? friend.username : 'Unknown';
  };

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in text-gray-100 h-full flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-nexus-700 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Minha Coleção</h1>
          <p className="text-gray-400">Gerencie itens físicos, hardware e edições de colecionador.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setActiveTab('my_collection')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'my_collection' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-400 hover:text-white bg-nexus-800'}`}
           >
             Meus Itens
           </button>
           <button 
             onClick={() => setActiveTab('marketplace')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'marketplace' ? 'bg-nexus-secondary text-white shadow-lg' : 'text-gray-400 hover:text-white bg-nexus-800'}`}
           >
             Marketplace
           </button>
           <button 
             onClick={() => setShowAddModal(true)}
             className="px-4 py-2 bg-nexus-accent/10 text-nexus-accent border border-nexus-accent/20 rounded-lg hover:bg-nexus-accent/20 transition-all text-sm font-bold flex items-center gap-2"
           >
             <Plus size={16} /> <span className="hidden sm:inline">Adicionar Item</span>
           </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
         <input 
           type="text" 
           placeholder={`Buscar em ${activeTab === 'my_collection' ? 'minha coleção' : 'marketplace'}...`}
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full bg-nexus-900 border border-nexus-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-nexus-accent outline-none"
         />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8 overflow-y-auto">
         {filteredItems.map(item => (
            <div key={item.id} className="bg-nexus-800 rounded-2xl border border-nexus-700 overflow-hidden group hover:border-nexus-500 transition-all flex flex-col relative">
               
               {/* Badge */}
               <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 items-end">
                  {item.status === 'sale' && (
                    <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-lg flex items-center gap-1">
                      <DollarSign size={10} /> Venda
                    </span>
                  )}
                  {item.status === 'trade' && (
                    <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-lg flex items-center gap-1">
                      <Repeat size={10} /> Troca
                    </span>
                  )}
               </div>

               <div className="h-48 relative overflow-hidden bg-nexus-900">
                  <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {activeTab === 'marketplace' && (
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-xs text-white font-bold flex items-center gap-1">
                       <Tag size={12} /> {getOwnerName(item.ownerId)}
                    </div>
                  )}
               </div>

               <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] text-nexus-accent font-bold uppercase tracking-wider">{item.type}</span>
                    <span className="text-[10px] text-gray-400 font-mono border border-gray-700 px-1.5 rounded">{item.condition}</span>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2 leading-tight">{item.name}</h3>
                  
                  <div className="mt-auto pt-4 border-t border-nexus-700/50 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Valor Est.</p>
                        <p className="text-lg font-mono font-bold text-green-400">${item.value}</p>
                     </div>
                     {activeTab === 'marketplace' ? (
                       <button className="px-3 py-1.5 bg-nexus-accent hover:bg-nexus-accent/80 text-white text-xs font-bold rounded-lg transition-colors">
                          Negociar
                       </button>
                     ) : (
                       <button className="text-xs text-gray-400 hover:text-white transition-colors">
                          Editar
                       </button>
                     )}
                  </div>
               </div>
            </div>
         ))}

         {filteredItems.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">
               <Box size={48} className="mx-auto mb-4 opacity-20" />
               <p>Nenhum item encontrado.</p>
            </div>
         )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-nexus-800 w-full max-w-md rounded-2xl border border-nexus-700 shadow-2xl overflow-hidden">
             <div className="p-6 border-b border-nexus-700 flex justify-between items-center">
               <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                 <Plus className="text-nexus-accent" /> Adicionar Item
               </h3>
               <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                 <X size={20} />
               </button>
             </div>
             
             <form onSubmit={handleAddItem} className="p-6 space-y-4">
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nome do Item</label>
                   <input 
                     required
                     type="text" 
                     value={newItem.name}
                     onChange={e => setNewItem({...newItem, name: e.target.value})}
                     className="w-full bg-nexus-900 border border-nexus-700 rounded-lg p-3 text-white focus:border-nexus-accent outline-none"
                     placeholder="Ex: Game Boy Color, God of War..."
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tipo</label>
                     <select 
                       value={newItem.type}
                       onChange={e => setNewItem({...newItem, type: e.target.value})}
                       className="w-full bg-nexus-900 border border-nexus-700 rounded-lg p-3 text-white focus:border-nexus-accent outline-none appearance-none"
                     >
                        <option value="Game">Jogo</option>
                        <option value="Console">Console</option>
                        <option value="Accessory">Acessório</option>
                        <option value="Merch">Merch</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Condição</label>
                     <select 
                       value={newItem.condition}
                       onChange={e => setNewItem({...newItem, condition: e.target.value})}
                       className="w-full bg-nexus-900 border border-nexus-700 rounded-lg p-3 text-white focus:border-nexus-accent outline-none appearance-none"
                     >
                        <option value="Sealed">Lacrado</option>
                        <option value="CIB">Completo (CIB)</option>
                        <option value="Loose">Solto</option>
                        <option value="Digital">Digital Code</option>
                     </select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Valor ($)</label>
                     <input 
                       type="number" 
                       value={newItem.value}
                       onChange={e => setNewItem({...newItem, value: Number(e.target.value)})}
                       className="w-full bg-nexus-900 border border-nexus-700 rounded-lg p-3 text-white focus:border-nexus-accent outline-none"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                     <select 
                       value={newItem.status}
                       onChange={e => setNewItem({...newItem, status: e.target.value})}
                       className="w-full bg-nexus-900 border border-nexus-700 rounded-lg p-3 text-white focus:border-nexus-accent outline-none appearance-none"
                     >
                        <option value="collection">Coleção</option>
                        <option value="trade">Para Troca</option>
                        <option value="sale">Para Venda</option>
                     </select>
                   </div>
                </div>
                
                <div className="pt-2">
                   <button type="submit" className="w-full py-3 bg-nexus-accent hover:bg-nexus-accent/80 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                      <Check size={18} /> Salvar Item
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

    </div>
  );
};
