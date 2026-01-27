
import React, { useState, useMemo } from 'react';
import { MarketItem, MarketCategory, ItemCondition } from '../types';
import { 
  Store, Search, Filter, MapPin, Tag, Plus, MessageSquare, 
  ShieldCheck, Heart, Share2, ChevronRight, X, Image as ImageIcon,
  Zap, Package, CheckCircle2, History, Info
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const MOCK_MARKET_ITEMS: MarketItem[] = [
  {
    id: 'm1',
    sellerId: '@neon_ghost',
    sellerName: 'Neon Ghost',
    sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon',
    title: 'PlayStation 5 Slim - Novíssimo',
    description: 'Acompanha 2 controles e nota fiscal. Menos de 3 meses de uso.',
    price: 3200,
    location: 'São Paulo, SP',
    condition: ItemCondition.BOXED,
    category: MarketCategory.CONSOLES,
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800',
    timestamp: new Date().toISOString(),
    isSovereignVerified: true
  },
  {
    id: 'm2',
    sellerId: '@retro_master',
    sellerName: 'Retro Master',
    sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=retro',
    title: 'Zelda: Ocarina of Time N64 (Gold)',
    description: 'Cartucho em estado de colecionador. Versão dourada original.',
    price: 850,
    location: 'Curitiba, PR',
    condition: ItemCondition.CIB,
    category: MarketCategory.GAMES,
    imageUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co394v.jpg',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    isSovereignVerified: true
  },
  {
    id: 'm3',
    sellerId: '@pixel_queen',
    sellerName: 'Pixel Queen',
    sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel',
    title: 'RTX 4080 Founders Edition',
    description: 'GPU monstruosa. Funcionando perfeitamente. Nunca usada para mineração.',
    price: 6500,
    location: 'Rio de Janeiro, RJ',
    condition: ItemCondition.BOXED,
    category: MarketCategory.PC_PARTS,
    imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=800',
    timestamp: new Date(Date.now() - 86400000).toISOString()
  }
];

export const NexusMarket: React.FC = () => {
  const { userStats } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<MarketCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredItems = useMemo(() => {
    return MOCK_MARKET_ITEMS.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = activeCategory === 'all' || item.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 animate-fade-in overflow-hidden relative">
      {/* Header */}
      <header className="p-8 border-b border-nexus-800 bg-gradient-to-b from-nexus-900/50 to-transparent shrink-0">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-bold text-white tracking-tighter flex items-center gap-4">
              <Store className="text-nexus-accent" size={36} /> NEXUS <span className="text-nexus-accent">MARKET</span>
            </h1>
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">Comércio Direto entre Operativos</p>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setShowAddModal(true)}
               className="px-8 py-3 bg-nexus-accent hover:bg-nexus-accent/80 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-nexus-accent/20 flex items-center gap-2"
             >
               <Plus size={18} /> Anunciar no Hall
             </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="p-4 border-b border-nexus-800 bg-nexus-900/30 flex flex-col md:flex-row gap-6 shrink-0">
        <div className="flex gap-3 overflow-x-auto no-scrollbar flex-1">
          <button 
            onClick={() => setActiveCategory('all')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === 'all' ? 'bg-nexus-accent text-white border-nexus-accent' : 'bg-nexus-800 text-gray-500 border-nexus-700 hover:text-gray-300'}`}
          >
            Todos os Itens
          </button>
          {Object.values(MarketCategory).map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat ? 'bg-nexus-accent text-white border-nexus-accent shadow-lg' : 'bg-nexus-800 text-gray-500 border-nexus-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="O que você está procurando?" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-nexus-800 border border-nexus-700 rounded-xl pl-12 pr-4 py-2.5 text-sm text-white focus:border-nexus-accent outline-none transition-all"
            />
        </div>
      </div>

      {/* Grid de Itens */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 pb-32">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => setSelectedItem(item)}
              className="bg-nexus-900 border border-nexus-800 rounded-[2.5rem] overflow-hidden group hover:border-nexus-accent transition-all flex flex-col shadow-2xl relative cursor-pointer hover:-translate-y-1 duration-300"
            >
               <div className="h-56 relative overflow-hidden bg-black shrink-0">
                  <img src={item.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt={item.title} />
                  
                  {item.isSovereignVerified && (
                    <div className="absolute top-4 right-4 bg-nexus-accent/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border border-white/20 shadow-lg flex items-center gap-1.5">
                       <ShieldCheck size={12} /> VERIFICADO
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-nexus-900 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 text-[9px] text-white font-bold flex items-center gap-1.5 uppercase tracking-widest">
                     <Tag size={10} className="text-nexus-accent" /> {item.category}
                  </div>
               </div>

               <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{item.condition}</span>
                     <span className="text-[14px] font-display font-black text-nexus-accent leading-none tracking-tighter">R$ {item.price}</span>
                  </div>
                  <h3 className="font-bold text-white text-lg leading-tight group-hover:text-nexus-accent transition-colors mb-4 line-clamp-1">{item.title}</h3>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-1.5 text-gray-500">
                       <MapPin size={12} />
                       <span className="text-[10px] font-bold">{item.location}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                     <div className="flex items-center gap-3">
                        <img src={item.sellerAvatar} className="w-8 h-8 rounded-xl border border-nexus-700" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">@{item.sellerName}</span>
                     </div>
                     <ChevronRight className="text-gray-700 group-hover:text-white transition-all" size={20} />
                  </div>
               </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-32 text-center text-gray-600">
               <Store size={64} className="mx-auto mb-4 opacity-10" />
               <p className="text-xl font-display font-bold uppercase tracking-widest opacity-20">Market Vazio</p>
            </div>
          )}
        </div>
      </div>

      {/* Item Detail View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] flex items-center justify-center p-4">
           <div className="bg-nexus-900 w-full max-w-5xl rounded-[3rem] border border-nexus-700 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-fade-in relative">
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 z-[210] p-3 bg-black/60 hover:bg-white/10 rounded-full text-white transition-all"
              >
                <X size={24} />
              </button>

              <div className="flex-1 bg-black relative min-h-[300px] md:min-h-0">
                 <img src={selectedItem.imageUrl} className="w-full h-full object-contain" />
              </div>

              <div className="w-full md:w-[400px] bg-nexus-900 border-l border-nexus-800 p-10 flex flex-col overflow-y-auto custom-scrollbar">
                 <div className="space-y-8">
                    <div>
                       <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-nexus-accent/20 border border-nexus-accent/30 rounded-xl text-nexus-accent text-[9px] font-black uppercase tracking-widest">{selectedItem.category}</span>
                          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{selectedItem.condition}</span>
                       </div>
                       <h2 className="text-3xl font-display font-bold text-white tracking-tight">{selectedItem.title}</h2>
                       <p className="text-3xl font-display font-black text-nexus-accent mt-4">R$ {selectedItem.price}</p>
                    </div>

                    <div className="p-6 bg-nexus-800/40 rounded-3xl border border-nexus-700 space-y-4">
                       <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <Info size={14} /> Detalhes do Item
                       </h4>
                       <p className="text-gray-400 text-sm leading-relaxed italic">"{selectedItem.description}"</p>
                       <div className="flex items-center gap-2 text-nexus-secondary">
                          <MapPin size={14} />
                          <span className="text-xs font-bold">{selectedItem.location}</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-5 p-4 bg-nexus-900 border border-nexus-800 rounded-3xl">
                       <img src={selectedItem.sellerAvatar} className="w-14 h-14 rounded-2xl border-2 border-nexus-700" />
                       <div className="flex-1 min-w-0">
                          <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Vendedor</p>
                          <h5 className="font-bold text-white text-lg">@{selectedItem.sellerName}</h5>
                       </div>
                       <button className="p-3 bg-nexus-800 hover:bg-nexus-accent text-white rounded-2xl transition-all shadow-lg">
                          <MessageSquare size={20} />
                       </button>
                    </div>

                    <div className="space-y-4 pt-4">
                       <button className="w-full py-5 bg-nexus-accent hover:bg-nexus-accent/80 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl flex items-center justify-center gap-3">
                          <CheckCircle2 size={18} /> Iniciar Negociação
                       </button>
                       <button className="w-full py-4 bg-nexus-800 border border-nexus-700 text-gray-400 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all">
                          <Heart size={16} /> Salvar na Lista
                       </button>
                    </div>

                    <p className="text-[9px] text-center text-gray-600 uppercase font-black tracking-widest">
                       Publicado em {new Date(selectedItem.timestamp).toLocaleDateString()}
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Add Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[300] flex items-center justify-center p-4">
           <div className="bg-nexus-900 w-full max-w-xl rounded-[3rem] border border-nexus-700 shadow-2xl overflow-hidden flex flex-col animate-fade-in relative">
              <header className="p-8 border-b border-nexus-800 flex justify-between items-center bg-gradient-to-r from-nexus-accent/10 to-transparent">
                 <div>
                    <h3 className="text-2xl font-display font-bold text-white">Anunciar no Market</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Sincronize seu item com outros operativos</p>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
              </header>
              
              <div className="p-8 space-y-6">
                 <div className="p-12 border-2 border-dashed border-nexus-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-gray-600 hover:text-nexus-accent hover:border-nexus-accent transition-all cursor-pointer bg-nexus-800/20">
                    <ImageIcon size={48} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Upload de Fotos</span>
                 </div>

                 <div className="space-y-4">
                    <input className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-6 py-4 text-white outline-none focus:border-nexus-accent" placeholder="Título do anúncio" />
                    <div className="grid grid-cols-2 gap-4">
                       <input className="bg-nexus-800 border border-nexus-700 rounded-2xl px-6 py-4 text-white outline-none focus:border-nexus-accent" placeholder="Preço (R$)" type="number" />
                       <select className="bg-nexus-800 border border-nexus-700 rounded-2xl px-5 py-4 text-sm text-gray-400 focus:border-nexus-accent outline-none appearance-none">
                          <option>Categoria</option>
                          {Object.values(MarketCategory).map(c => <option key={c}>{c}</option>)}
                       </select>
                    </div>
                    <textarea className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl p-6 text-white outline-none focus:border-nexus-accent h-32 resize-none" placeholder="Descrição do item..." />
                 </div>

                 <button className="w-full py-5 bg-nexus-accent text-white font-black text-xs uppercase tracking-[0.4em] rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3">
                    <Zap size={18}/> Publicar no Nexus Market
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
