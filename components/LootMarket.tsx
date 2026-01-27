
import React, { useState, useMemo } from 'react';
import { DealCategory, GamingDeal } from '../types';
import { 
  ShoppingBag, Search, Filter, Tag, ExternalLink, 
  Plus, X, Clock, DollarSign, ArrowRight, Sparkles,
  Zap, Flame, Bookmark, History, Ban, CheckCircle, BarChart3, AlertTriangle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const INITIAL_MOCK_DEALS: GamingDeal[] = [
  {
    id: 'd1',
    postedBy: 'DealMaster',
    postedById: 'u1',
    title: 'PlayStation 5 Slim + 2 Jogos',
    description: 'Melhor preço histórico na Amazon com cupom exclusivo de 10% para membros Nexus.',
    price: 3450,
    originalPrice: 3899,
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800',
    affiliateUrl: 'https://amazon.com.br/ps5',
    category: DealCategory.CONSOLES,
    timestamp: new Date().toISOString(),
    store: 'Amazon BR',
    isExpired: false
  },
  {
    id: 'd2',
    postedBy: 'HardwareGuru',
    postedById: 'u2',
    title: 'Monitor Alienware 34" QD-OLED',
    description: 'Promoção relâmpago para o monitor definitivo de 165Hz. Estoque limitadíssimo.',
    price: 5200,
    originalPrice: 6500,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800',
    affiliateUrl: 'https://dell.com/alienware',
    category: DealCategory.HARDWARE,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    store: 'Dell Store',
    isExpired: false
  },
  {
    id: 'd3',
    postedBy: 'PCGamer99',
    postedById: 'u3',
    title: 'Elden Ring: Shadow of the Erdtree',
    description: 'Chave Steam em promoção na Nuuvem. Compre com saldo e acumule bônus.',
    price: 135,
    originalPrice: 159,
    imageUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg',
    affiliateUrl: 'https://nuuvem.com/elden-ring',
    category: DealCategory.GAMES,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    store: 'Nuuvem',
    isExpired: false
  },
  {
    id: 'd4',
    postedBy: 'OldSchool',
    postedById: 'u4',
    title: 'Xbox Series X - Edição Halo',
    description: 'Relíquia encontrada em estoque antigo. Já foi vendida, mas fica o registro do valor.',
    price: 4200,
    originalPrice: 4999,
    imageUrl: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?q=80&w=800',
    affiliateUrl: 'https://xbox.com',
    category: DealCategory.CONSOLES,
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    store: 'Microsoft Store',
    isExpired: true
  }
];

export const LootMarket: React.FC = () => {
  const { userStats } = useAppContext();
  const [deals, setDeals] = useState<GamingDeal[]>(INITIAL_MOCK_DEALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<DealCategory | 'all'>('all');
  const [viewTab, setViewTab] = useState<'active' | 'history'>('active');
  const [showShareModal, setShowShareModal] = useState(false);

  const toggleExpire = (id: string) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, isExpired: !d.isExpired } : d));
  };

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchTab = viewTab === 'active' ? !deal.isExpired : deal.isExpired;
      const matchCat = activeCategory === 'all' || deal.category === activeCategory;
      const matchSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          deal.store.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTab && matchCat && matchSearch;
    });
  }, [deals, viewTab, activeCategory, searchTerm]);

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 animate-fade-in overflow-hidden">
      <header className="p-8 border-b border-nexus-800 bg-gradient-to-b from-nexus-900/50 to-transparent shrink-0">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-bold text-white tracking-tighter flex items-center gap-4">
              <ShoppingBag className="text-nexus-secondary" size={36} /> LOOT MARKET
            </h1>
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">Promoções Sincronizadas e Histórico de Preços</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-nexus-900 border border-nexus-800 p-1 rounded-xl shadow-2xl">
               <button 
                 onClick={() => setViewTab('active')}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewTab === 'active' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
               >
                 <Zap size={14} /> Ofertas Ativas
               </button>
               <button 
                 onClick={() => setViewTab('history')}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewTab === 'history' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
               >
                 <History size={14} /> Histórico
               </button>
            </div>
            
            <button 
              onClick={() => setShowShareModal(true)}
              className="px-8 py-3 bg-nexus-secondary hover:bg-nexus-secondary/80 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-nexus-secondary/20 flex items-center gap-2"
            >
              <Plus size={18} /> Compartilhar Loot
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 border-b border-nexus-800 bg-nexus-900/30 flex flex-col md:flex-row gap-6 shrink-0">
        <div className="flex gap-3 overflow-x-auto no-scrollbar flex-1">
          <button 
            onClick={() => setActiveCategory('all')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === 'all' ? 'bg-nexus-secondary text-white border-nexus-secondary shadow-lg' : 'bg-nexus-800 text-gray-500 border-nexus-700'}`}
          >
            Categorias: Todas
          </button>
          {Object.values(DealCategory).map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat ? 'bg-nexus-secondary text-white border-nexus-secondary shadow-lg' : 'bg-nexus-800 text-gray-500 border-nexus-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar Loot..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-nexus-800 border border-nexus-700 rounded-xl pl-12 pr-4 py-2 text-sm text-white focus:border-nexus-secondary outline-none transition-all"
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 pb-32">
          {filteredDeals.map(deal => (
            <div 
              key={deal.id} 
              className={`bg-nexus-900 border border-nexus-800 rounded-[3rem] overflow-hidden group hover:border-nexus-secondary transition-all flex flex-col shadow-2xl relative ${deal.isExpired ? 'opacity-60 grayscale-[0.5]' : ''}`}
            >
               <div className="h-56 relative overflow-hidden bg-black shrink-0">
                  <img src={deal.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt={deal.title} />
                  
                  {deal.isExpired ? (
                    <div className="absolute top-4 right-4 bg-gray-700 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-gray-500">
                       ESGOTADO
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter animate-pulse border border-red-400">
                       OFERTA ATIVA
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-nexus-900 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 text-[9px] text-white font-bold flex items-center gap-1.5 uppercase tracking-widest">
                     <Tag size={10} className="text-nexus-secondary" /> {deal.store}
                  </div>
               </div>

               <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-[9px] text-nexus-secondary font-black uppercase tracking-widest">{deal.category}</span>
                     <span className="text-[10px] text-gray-500 font-bold italic">por @{deal.postedBy}</span>
                  </div>
                  <h3 className="font-display font-bold text-white text-xl leading-tight group-hover:text-nexus-secondary transition-colors mb-4">{deal.title}</h3>
                  
                  <div className="flex items-center gap-4 mb-6">
                     <div className="bg-nexus-800/80 px-4 py-2 rounded-2xl border border-nexus-700">
                        <p className="text-[8px] text-gray-500 uppercase font-black mb-0.5">{deal.isExpired ? 'Preço Histórico' : 'Agora'}</p>
                        <p className="text-2xl font-display font-black text-white leading-none tracking-tighter">${deal.price}</p>
                     </div>
                     {deal.originalPrice && (
                        <div className="opacity-40">
                           <p className="text-[8px] text-gray-500 uppercase font-black mb-0.5">Antes</p>
                           <p className="text-lg font-display font-black text-gray-400 line-through leading-none tracking-tighter">${deal.originalPrice}</p>
                        </div>
                     )}
                  </div>

                  <div className="mt-auto space-y-4">
                     {!deal.isExpired ? (
                        <>
                           <a 
                             href={deal.affiliateUrl} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="w-full py-4 bg-nexus-secondary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-nexus-secondary/20 hover:scale-105 transition-all"
                           >
                              Capturar Loot <ExternalLink size={14} />
                           </a>
                           <button 
                             onClick={() => toggleExpire(deal.id)}
                             className="w-full py-3 bg-nexus-800/40 border border-red-500/20 text-red-500/60 font-black text-[9px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/10 hover:text-red-500 transition-all"
                           >
                              <Ban size={12} /> Marcar Esgotado
                           </button>
                        </>
                     ) : (
                        <div className="space-y-3">
                           <button 
                             onClick={() => toggleExpire(deal.id)}
                             className="w-full py-3 bg-nexus-800 border border-nexus-700 text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-nexus-700 transition-all"
                           >
                              <CheckCircle size={14} /> Reativar Oferta
                           </button>
                           <div className="p-3 bg-nexus-800/50 border border-nexus-700 rounded-2xl flex items-center gap-3">
                              <BarChart3 size={18} className="text-nexus-accent" />
                              <div>
                                 <p className="text-[8px] text-gray-500 font-black uppercase">Tendência</p>
                                 <p className="text-[10px] text-white font-bold">Média histórico: ${deal.price + 20}</p>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          ))}

          {filteredDeals.length === 0 && (
            <div className="col-span-full py-32 text-center text-gray-600 bg-nexus-900/30 border-2 border-dashed border-nexus-800 rounded-[3rem] flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-nexus-800 rounded-full flex items-center justify-center opacity-10">
                 {viewTab === 'active' ? <ShoppingBag size={48} /> : <History size={48} />}
              </div>
              <div className="space-y-2">
                 <p className="text-xl font-display font-bold uppercase tracking-[0.3em] opacity-20 italic">Nada localizado</p>
                 <p className="text-sm opacity-30">Tente ajustar seus filtros ou termos de pesquisa.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Compartilhar Loot */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-nexus-900 w-full max-w-lg rounded-[3rem] border border-nexus-800 shadow-2xl overflow-hidden flex flex-col animate-fade-in">
              <div className="p-8 border-b border-nexus-800 flex justify-between items-center bg-gradient-to-r from-nexus-secondary/10 to-transparent">
                 <div>
                    <h3 className="text-2xl font-display font-bold text-white">Sincronizar Loot</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Compartilhe promoções e ganhe comissão</p>
                 </div>
                 <button onClick={() => setShowShareModal(false)} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
              </div>
              
              <div className="p-8 space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Link do Item (Afiliado)</label>
                    <input 
                      type="text" 
                      className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-6 py-4 text-white outline-none focus:border-nexus-secondary shadow-inner" 
                      placeholder="Cole aqui seu link..."
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Preço Atual</label>
                       <input 
                         type="number" 
                         className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-6 py-4 text-white outline-none focus:border-nexus-secondary" 
                         placeholder="$0.00"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Categoria</label>
                       <select className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-5 py-4 text-sm text-white focus:border-nexus-secondary outline-none appearance-none cursor-pointer">
                          {Object.values(DealCategory).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Descrição Curta</label>
                    <textarea 
                      className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl p-6 text-white outline-none focus:border-nexus-secondary h-32 resize-none" 
                      placeholder="Destaque por que esta oferta é imperdível..."
                    />
                 </div>
                 <button className="w-full py-5 bg-nexus-secondary text-white font-black text-xs uppercase tracking-[0.4em] rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3 transition-all hover:bg-nexus-secondary/80">
                    <Zap size={18}/> Compartilhar Agora
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
