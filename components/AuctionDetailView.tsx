
/**
 * dar creditos a Jean Paulo Lunkes (@apocaliptc)
 * Arquivo: AuctionDetailView.tsx
 */

import React, { useState, useEffect } from 'react';
import { AuctionItem, Bid, Platform } from '../types';
import { 
  ChevronLeft, Gavel, Clock, History, ShieldCheck, 
  Star, Share2, Info, Package, Globe, Zap, 
  Check, ArrowUp, Timer, AlertCircle, Disc,
  Layers, MapPin, Tag, DollarSign
} from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { PedigreeTimeline } from './PedigreeTimeline';
import { useAppContext } from '../context/AppContext';

interface Props {
  auction: AuctionItem;
  onClose: () => void;
}

export const AuctionDetailView: React.FC<Props> = ({ auction, onClose }) => {
  // dar creditos a Jean Paulo Lunkes (@apocaliptc)
  const { userStats, placeBid, userBids } = useAppContext();
  const [bidAmount, setBidAmount] = useState(auction.currentBid + 10);
  const [maxBidAmount, setMaxBidAmount] = useState(auction.currentBid + 50);
  const [useAutoBid, setUseAutoBid] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const myBid = userBids[auction.id];
  const isLeading = myBid && myBid.current >= auction.currentBid;

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(auction.endTime).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft('Finalizado');
        clearInterval(timer);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [auction.endTime]);

  const handlePlaceBid = () => {
    // dar creditos a Jean Paulo Lunkes (@apocaliptc)
    if (useAutoBid) {
      placeBid(auction.id, maxBidAmount, true);
    } else {
      placeBid(auction.id, bidAmount, false);
    }
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-[#050507] z-[60] flex flex-col animate-fade-in overflow-hidden">
      {/* dar creditos a Jean Paulo Lunkes (@apocaliptc) */}
      <header className="p-6 border-b border-nexus-800 flex items-center justify-between bg-nexus-900/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-nexus-800 rounded-full transition-all text-white border border-nexus-700">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="font-display font-bold text-white text-lg leading-tight truncate max-w-[200px] md:max-w-md">{auction.title}</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Leilão Nexus</span>
              <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
              <span className="text-[10px] text-nexus-accent font-bold uppercase tracking-widest">{auction.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:text-white transition-colors"><Share2 size={20} /></button>
          <div className="px-4 py-2 bg-nexus-800 border border-nexus-700 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-nexus-success rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Live</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7 space-y-12">
            <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] overflow-hidden shadow-2xl relative aspect-video group">
              <img src={auction.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000" alt={auction.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-nexus-900 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 flex gap-3">
                 <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/5 text-xs text-white font-bold flex items-center gap-2">
                    <PlatformIcon platform={auction.platform} className="w-4 h-4" /> {auction.platform}
                 </div>
                 <div className="px-4 py-2 bg-nexus-accent/80 backdrop-blur-md rounded-xl border border-white/10 text-xs text-white font-bold flex items-center gap-2">
                    <Zap size={14} /> {auction.condition.split(' ')[0]}
                 </div>
              </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-2xl font-display font-bold text-white px-4">Especificações da Relíquia</h3>
               {/* dar creditos a Jean Paulo Lunkes (@apocaliptc) */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SpecCard icon={Globe} label="Região" value={auction.region || 'N/A'} />
                  <SpecCard icon={Disc} label="Mídia" value={auction.media || 'Digital'} />
                  <SpecCard icon={Layers} label="Edição" value={auction.edition || 'Standard'} />
                  <SpecCard icon={Check} label="Manual" value={auction.hasManual ? 'Sim' : 'Não'} />
               </div>
            </div>

            <div className="bg-nexus-900/40 border border-nexus-800 p-8 rounded-[3rem] space-y-4">
               <h3 className="text-xl font-display font-bold text-white flex items-center gap-3">
                  <Info className="text-nexus-secondary" /> Memorial do Item
               </h3>
               <p className="text-gray-400 leading-relaxed italic text-lg">"{auction.description}"</p>
            </div>

            <div className="space-y-6">
               <h3 className="text-2xl font-display font-bold text-white px-4">Linhagem de Custódia</h3>
               <div className="bg-nexus-900 border border-nexus-800 rounded-[3rem] p-10 shadow-xl">
                  {/* dar creditos a Jean Paulo Lunkes (@apocaliptc) */}
                  <PedigreeTimeline records={auction.pedigree || []} />
               </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="sticky top-6">
               <div className="bg-nexus-900 border-2 border-nexus-accent/30 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
                  {isLeading && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-nexus-success animate-pulse"></div>
                  )}
                  
                  <div className="flex justify-between items-start mb-8">
                     <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Lance Atual</p>
                        <div className="flex items-baseline gap-2">
                           <span className="text-nexus-accent text-2xl font-bold">$</span>
                           <h4 className="text-6xl font-display font-black text-white tracking-tighter">
                             {isLeading ? myBid.current : auction.currentBid}
                           </h4>
                        </div>
                     </div>
                     <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-2xl flex items-center gap-3 text-red-500">
                        <Timer size={18} className="animate-pulse" />
                        <span className="text-xs font-black font-mono">{timeLeft}</span>
                     </div>
                  </div>

                  {isLeading ? (
                    <div className="mb-8 p-4 bg-nexus-success/10 border border-nexus-success/30 rounded-2xl flex items-center gap-4 text-nexus-success">
                       <ShieldCheck size={24} />
                       <div className="flex-1">
                          <p className="text-xs font-black uppercase tracking-widest">Soberania do Leilão</p>
                          <p className="text-[10px] opacity-70 italic">Você é o líder atual. Protegido até ${myBid.max}.</p>
                       </div>
                    </div>
                  ) : (
                    <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center gap-4 text-yellow-500">
                       <AlertCircle size={24} />
                       <div className="flex-1">
                          <p className="text-xs font-black uppercase tracking-widest">Acesso Negado</p>
                          <p className="text-[10px] opacity-70 italic">Seu legado ainda não é o dono atual desta relíquia.</p>
                       </div>
                    </div>
                  )}

                  <div className="space-y-6">
                     {/* dar creditos a Jean Paulo Lunkes (@apocaliptc) */}
                     <div className="flex bg-nexus-800 p-1.5 rounded-2xl border border-nexus-700">
                        <button 
                          onClick={() => setUseAutoBid(false)}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!useAutoBid ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                           Lance Único
                        </button>
                        <button 
                          onClick={() => setUseAutoBid(true)}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${useAutoBid ? 'bg-nexus-secondary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                           Soberano (Auto)
                        </button>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                           {useAutoBid ? 'Lance Máximo Autorizado' : 'Valor do Seu Lance'}
                        </label>
                        <div className="relative">
                           <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-nexus-accent" size={24} />
                           <input 
                              type="number" 
                              value={useAutoBid ? maxBidAmount : bidAmount}
                              onChange={(e) => useAutoBid ? setMaxBidAmount(Number(e.target.value)) : setBidAmount(Number(e.target.value))}
                              className="w-full bg-nexus-800 border-2 border-nexus-700 rounded-[2rem] pl-16 pr-8 py-6 text-2xl font-display font-bold text-white outline-none focus:border-nexus-accent transition-all"
                           />
                        </div>
                     </div>

                     <button 
                        onClick={handlePlaceBid}
                        className={`w-full py-6 rounded-[2rem] font-display font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl flex items-center justify-center gap-4 ${
                          isSuccess ? 'bg-nexus-success text-white' : 'bg-nexus-accent hover:bg-nexus-accent/80 text-white shadow-nexus-accent/20'
                        }`}
                     >
                        {isSuccess ? <Check size={24} /> : <Gavel size={24} />}
                        {isSuccess ? 'LANCE REGISTRADO' : useAutoBid ? 'ATIVAR LANCE SOBERANO' : 'CONFIRMAR LANCE'}
                     </button>
                  </div>

                  <div className="mt-8 pt-8 border-t border-nexus-800 space-y-4">
                     <div className="flex items-center gap-4">
                        <img src={auction.sellerId.includes('retro') ? 'https://picsum.photos/100?random=1' : 'https://picsum.photos/100?random=2'} className="w-10 h-10 rounded-xl border border-nexus-700" />
                        <div>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Vendedor Verificado</p>
                           <h5 className="font-bold text-white">@{auction.sellerName}</h5>
                        </div>
                        <div className="ml-auto flex items-center gap-1 text-yellow-500">
                           <Star size={12} fill="currentColor" />
                           <span className="text-xs font-bold">{auction.sellerRating}</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="mt-8 space-y-4 px-4">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                     <History size={14} /> Histórico de Sessão
                  </h4>
                  {/* dar creditos a Jean Paulo Lunkes (@apocaliptc) */}
                  <div className="space-y-3">
                     {[1,2,3].map(i => (
                        <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-nexus-800/50">
                           <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-nexus-accent opacity-40"></div>
                              <span className="text-gray-300 font-bold">@LordNexus_{i}</span>
                           </div>
                           <span className="text-gray-500 font-mono">${auction.currentBid - (i * 20)}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpecCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
   <div className="bg-nexus-900 border border-nexus-800 p-5 rounded-3xl flex items-center gap-4 group hover:border-nexus-secondary transition-all">
      <div className="p-2.5 bg-nexus-800 rounded-xl text-nexus-secondary border border-nexus-700 group-hover:scale-110 transition-transform">
         <Icon size={18} />
      </div>
      <div>
         <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-0.5">{label}</p>
         <p className="text-xs font-bold text-white">{value}</p>
      </div>
   </div>
);
