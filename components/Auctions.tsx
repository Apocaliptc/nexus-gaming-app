
import React, { useState, useEffect } from 'react';
import { AuctionItem, AuctionCategory, Platform, ItemCondition, Region, ItemMedia, GameEdition, OwnershipRecord } from '../types';
import { 
  Gavel, Clock, DollarSign, Tag, Filter, Search, 
  ChevronRight, ArrowUpRight, Heart, Timer, 
  ShieldCheck, Package, MapPin, Star, AlertCircle,
  Disc, Layers, Scroll, FileText, Sparkles,
  Plus, Globe, History
} from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { useAppContext } from '../context/AppContext';
import { AuctionDetailView } from './AuctionDetailView';

// Mock Data Mantido
const MOCK_AUCTIONS: AuctionItem[] = [
  {
    id: 'auc-1',
    sellerId: '@retro_king',
    sellerName: 'Retro King',
    sellerRating: 4.9,
    title: 'Silent Hill 2 - PS2 (Black Label)',
    description: 'Edição original Black Label, completa com manual. Disco em estado impecável, sem riscos.',
    category: AuctionCategory.GAME,
    platform: Platform.PSN,
    condition: ItemCondition.CIB,
    media: ItemMedia.DVD,
    edition: GameEdition.STANDARD,
    hasManual: true,
    isOriginalCover: true,
    region: Region.NTSCU,
    imageUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1v9m.jpg',
    galleryUrls: [],
    startingBid: 50,
    currentBid: 145,
    buyItNowPrice: 250,
    bidCount: 12,
    endTime: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
    bids: [],
    pedigree: [
      { ownerNexusId: 'leg-1', ownerName: 'LordKoji', acquiredDate: '2001-09-24', soldDate: '2015-05-10', ownerPrestigeAtTime: 9500 },
      { ownerNexusId: 'leg-2', ownerName: 'RetroKing', acquiredDate: '2015-05-10', ownerPrestigeAtTime: 18200 }
    ]
  },
  {
    id: 'auc-hw-1',
    sellerId: '@vintage_collector',
    sellerName: 'Vintage Vault',
    sellerRating: 5.0,
    title: 'Nintendo 64 - Jungle Green',
    description: 'Console Jungle Green translúcido. Acompanha controle original com analógico firme.',
    category: AuctionCategory.CONSOLE,
    platform: Platform.SWITCH,
    condition: ItemCondition.BOXED,
    media: ItemMedia.CARTRIDGE,
    region: Region.REGION_FREE,
    imageUrl: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=800&auto=format&fit=crop',
    galleryUrls: [],
    startingBid: 250,
    currentBid: 380,
    bidCount: 8,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    bids: [],
    pedigree: [
      { ownerNexusId: 'old-skool', ownerName: 'OldSkool90s', acquiredDate: '1999-12-25', soldDate: '2018-04-10', ownerPrestigeAtTime: 1500 },
      { ownerNexusId: 'v-vault', ownerName: 'VintageVault', acquiredDate: '2018-04-10', ownerPrestigeAtTime: 45000 }
    ]
  },
  {
    id: 'auc-umd-1',
    sellerId: '@psp_lord',
    sellerName: 'Handheld Heaven',
    sellerRating: 4.7,
    title: 'Crisis Core: FF VII - Ltd UMD',
    description: 'Versão de colecionador japonesa. UMD selado de fábrica.',
    category: AuctionCategory.GAME,
    platform: Platform.PSN,
    condition: ItemCondition.SEALED,
    media: ItemMedia.UMD,
    edition: GameEdition.LIMITED,
    region: Region.NTSCJ,
    imageUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co20u8.jpg',
    galleryUrls: [],
    startingBid: 150,
    currentBid: 215,
    bidCount: 5,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    bids: []
  },
  {
    id: 'auc-pedigree-1',
    sellerId: '@apex_predator',
    sellerName: 'Apex Predator',
    sellerRating: 5.0,
    title: 'Super Mario World - SNES (9.8)',
    description: 'VGA Silver Label Graded. Item de museu.',
    category: AuctionCategory.GAME,
    platform: Platform.SWITCH,
    condition: ItemCondition.SEALED,
    media: ItemMedia.CARTRIDGE,
    edition: GameEdition.STANDARD,
    region: Region.NTSCU,
    imageUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co496y.jpg',
    galleryUrls: [],
    startingBid: 2000,
    currentBid: 5400,
    bidCount: 45,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    bids: [],
    pedigree: [
      { ownerNexusId: 'champ-1', ownerName: 'SpeedyGonzales', acquiredDate: '1991-08-13', soldDate: '2010-12-01', ownerPrestigeAtTime: 99999 },
      { ownerNexusId: 'apex-1', ownerName: 'ApexPredator', acquiredDate: '2010-12-01', ownerPrestigeAtTime: 45000 }
    ]
  }
];

export const Auctions: React.FC = () => {
  const { userStats } = useAppContext();
  const [auctions, setAuctions] = useState<AuctionItem[]>(MOCK_AUCTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AuctionCategory | 'all'>('all');
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);

  const filteredAuctions = auctions.filter(auc => {
    const matchesSearch = auc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || auc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 overflow-hidden animate-fade-in">
      {selectedAuction && (
        <AuctionDetailView auction={selectedAuction} onClose={() => setSelectedAuction(null)} />
      )}

      <div className="p-6 md:p-8 border-b border-nexus-800 bg-gradient-to-b from-nexus-900/50 to-transparent shrink-0">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tighter flex items-center gap-2">
              <Gavel className="text-nexus-accent" size={24} /> NEXUS <span className="text-nexus-accent italic">AUCTIONS</span>
            </h1>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Sovereign Legacy Market</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-nexus-900 border border-nexus-800 rounded-xl px-4 py-2 flex items-center gap-3 shadow-xl">
               <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Saldo</span>
               <span className="text-lg font-mono font-bold text-nexus-accent">${userStats?.prestigePoints || 0}</span>
            </div>
            <button className="bg-nexus-accent hover:bg-nexus-accent/80 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2">
               <Plus size={14} /> <span className="hidden sm:inline">Anunciar Relíquia</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-nexus-800 bg-[#050507] shrink-0">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Busque linhagens raras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-nexus-900 border border-nexus-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-nexus-accent outline-none"
            />
          </div>
          <select 
             value={selectedCategory} 
             onChange={e => setSelectedCategory(e.target.value as any)}
             className="bg-nexus-900 border border-nexus-800 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-gray-400 focus:border-nexus-accent outline-none appearance-none cursor-pointer"
           >
              <option value="all">Todas Categorias</option>
              {Object.values(AuctionCategory).map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
          {filteredAuctions.map(item => (
            <AuctionCard key={item.id} item={item} onClick={() => setSelectedAuction(item)} />
          ))}
        </div>
      </div>
    </div>
  );
};

const AuctionCard: React.FC<{ item: AuctionItem, onClick: () => void }> = ({ item, onClick }) => {
  const { userBids } = useAppContext();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(item.endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Finalizado');
        clearInterval(timer);
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [item.endTime]);

  const myBid = userBids[item.id];
  const isHighPrestige = item.pedigree && item.pedigree.some(p => p.ownerPrestigeAtTime > 50000);

  return (
    <div 
      onClick={onClick}
      className={`bg-nexus-900 border ${myBid ? 'border-nexus-accent shadow-nexus-accent/10' : isHighPrestige ? 'border-yellow-500/40' : 'border-nexus-800'} rounded-3xl overflow-hidden group hover:border-nexus-accent transition-all flex flex-col shadow-xl relative cursor-pointer hover:-translate-y-1 duration-300`}
    >
      
      {item.pedigree && item.pedigree.length > 0 && (
        <div className="absolute top-3 left-3 z-30 flex flex-col gap-1.5">
           <div className="bg-nexus-accent/90 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
              <History size={10} /> {item.pedigree.length} Donos
           </div>
        </div>
      )}

      {myBid && (
        <div className="absolute top-3 right-3 z-30">
           <div className="bg-nexus-success text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase border border-white/10 shadow-lg">
              Seu Lance: ${myBid.current}
           </div>
        </div>
      )}

      <div className="h-48 relative overflow-hidden bg-black shrink-0">
        <img src={item.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000 group-hover:opacity-100" alt={item.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-nexus-900 via-transparent to-transparent"></div>
        <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/5 bg-black/40 flex items-center justify-between">
           <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Tempo</span>
           <span className={`font-mono font-black text-xs ${timeLeft.includes('0h') ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timeLeft}</span>
        </div>
      </div>

      <div className="p-5 space-y-4 flex-1 flex flex-col">
        <div>
          <div className="flex items-center justify-between mb-1">
             <span className="text-[8px] text-nexus-accent font-black uppercase tracking-[0.2em]">{item.category}</span>
             <span className="text-[8px] text-gray-500 font-mono">{item.condition.split(' ')[0]}</span>
          </div>
          <h3 className="text-lg font-display font-bold text-white group-hover:text-nexus-accent transition-colors truncate">{item.title}</h3>
          <div className="flex items-center gap-2">
             <PlatformIcon platform={item.platform} className="w-3 h-3 opacity-50" />
             <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">@{item.sellerName}</p>
          </div>
        </div>

        <div className="bg-nexus-800/80 p-4 rounded-2xl border border-nexus-700 shadow-inner group-hover:bg-nexus-800 transition-colors">
           <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Lance Atual</p>
           <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-nexus-accent font-bold text-xs">$</span>
                <p className="text-3xl font-display font-black text-white">{myBid ? Math.max(item.currentBid, myBid.current) : item.currentBid}</p>
              </div>
              <span className="text-[9px] text-gray-600 font-bold uppercase">{item.bidCount} Lances</span>
           </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
           <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Sovereign Legacy</span>
           <ChevronRight className="text-nexus-accent group-hover:translate-x-1 transition-transform" size={20} />
        </div>
      </div>
    </div>
  );
};
