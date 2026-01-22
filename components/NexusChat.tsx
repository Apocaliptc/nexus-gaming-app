
import React, { useState, useEffect, useRef } from 'react';
import { 
  Hash, Users, Lock, Send, Plus, Search, 
  MessageSquare, UserCircle, Settings, Phone, 
  Video, Pin, Bell, AtSign, HelpCircle, 
  ChevronDown, Mic, Headphones, Bot, Sparkles, 
  Shield, Globe, Swords, Radio, Zap, UserPlus
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ChatChannel, ChatMessage, ChannelType } from '../types';

export const NexusChat: React.FC = () => {
  const { userStats, friends } = useAppContext();
  const [activeChannel, setActiveChannel] = useState<string>('hall-global');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mock channels
  const channels: ChatChannel[] = [
    { id: 'hall-global', name: 'hall-global', description: 'O ponto de encontro universal de todos os gamers do Nexus.', type: 'public' },
    { id: 'lounge-pc', name: 'pc-master-race', description: 'Discussão sobre hardware e jogos de PC.', type: 'public' },
    { id: 'console-war', name: 'arena-consoles', description: 'Debates (amigáveis) sobre PlayStation, Xbox e Nintendo.', type: 'public' },
    { id: 'clan-nexus', name: 'clã-privado', description: 'Espaço restrito para membros do círculo Nexus.', type: 'private' },
    { id: 'raid-room', name: 'sala-de-raid', description: 'Coordenação de jogatinas em grupo.', type: 'private' },
  ];

  const dmChannels = friends.map(f => ({
    id: `dm-${f.nexusId}`,
    name: f.username,
    description: `Conversa privada com ${f.username}`,
    type: 'dm' as ChannelType,
    avatar: f.avatarUrl
  }));

  useEffect(() => {
    // Scroll to bottom on message
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userStats) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: activeChannel,
      senderId: userStats.nexusId,
      senderName: userStats.nexusId.replace('@', ''),
      senderAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats.nexusId}`,
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // Simulate bot response for demo
    if (activeChannel === 'hall-global' && input.toLowerCase().includes('oráculo')) {
        setTimeout(() => {
            const botMsg: ChatMessage = {
                id: `msg-bot-${Date.now()}`,
                channelId: activeChannel,
                senderId: 'nexus-bot',
                senderName: 'Nexus AI',
                senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=nexus',
                content: 'Estou monitorando as frequências. O Oráculo está atento às suas conquistas!',
                timestamp: new Date().toISOString(),
                isAi: true
            };
            setMessages(prev => [...prev, botMsg]);
        }, 1000);
    }
  };

  const selectedChannel = [...channels, ...dmChannels].find(c => c.id === activeChannel);

  return (
    <div className="flex h-full bg-[#09090b] text-[#dcddde] overflow-hidden animate-fade-in">
      
      {/* SIDEBAR: SERVERS (Icons only) */}
      <div className="w-[72px] bg-[#020202] flex flex-col items-center py-3 space-y-2 border-r border-white/5 flex-shrink-0">
        <div className="w-12 h-12 bg-nexus-accent rounded-[1.5rem] hover:rounded-2xl transition-all cursor-pointer flex items-center justify-center text-white shadow-xl shadow-nexus-accent/20">
           <span className="font-display font-bold text-xl">N</span>
        </div>
        <div className="w-8 h-px bg-nexus-800"></div>
        <div className="w-12 h-12 bg-nexus-800 rounded-[1.5rem] hover:rounded-2xl transition-all cursor-pointer flex items-center justify-center hover:bg-nexus-secondary group">
           <Swords size={20} className="text-gray-400 group-hover:text-white" />
        </div>
        <div className="w-12 h-12 bg-nexus-800 rounded-[1.5rem] hover:rounded-2xl transition-all cursor-pointer flex items-center justify-center hover:bg-nexus-success group">
           <Globe size={20} className="text-gray-400 group-hover:text-white" />
        </div>
        <div className="w-12 h-12 bg-nexus-800 rounded-[1.5rem] hover:rounded-2xl transition-all cursor-pointer flex items-center justify-center hover:bg-orange-500 group">
           <Radio size={20} className="text-gray-400 group-hover:text-white" />
        </div>
        <div className="flex-1"></div>
        <div className="w-12 h-12 bg-nexus-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer group">
           <Plus size={24} className="text-green-500 group-hover:text-white" />
        </div>
      </div>

      {/* SIDEBAR: CHANNELS */}
      <div className="w-60 bg-[#18181b] flex flex-col border-r border-white/5 flex-shrink-0">
        <header className="h-12 px-4 flex items-center justify-between border-b border-black/20 hover:bg-white/5 transition-colors cursor-pointer">
           <h3 className="font-display font-bold text-white tracking-tight">COMUNIDADE NEXUS</h3>
           <ChevronDown size={18} />
        </header>

        <nav className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-6">
           {/* Public Rooms */}
           <div className="space-y-0.5">
              <div className="flex items-center px-2 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                 <ChevronDown size={12} className="mr-1" /> SALAS PÚBLICAS
              </div>
              {channels.filter(c => c.type === 'public').map(c => (
                <button 
                  key={c.id} 
                  onClick={() => setActiveChannel(c.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all group ${activeChannel === c.id ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-gray-300'}`}
                >
                  <Hash size={20} className={activeChannel === c.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'} />
                  <span className="text-sm font-medium">{c.name}</span>
                </button>
              ))}
           </div>

           {/* Private Rooms */}
           <div className="space-y-0.5">
              <div className="flex items-center px-2 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                 <ChevronDown size={12} className="mr-1" /> CLÃ PRIVADO
              </div>
              {channels.filter(c => c.type === 'private').map(c => (
                <button 
                  key={c.id} 
                  onClick={() => setActiveChannel(c.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all group ${activeChannel === c.id ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-gray-300'}`}
                >
                  <Lock size={16} className={activeChannel === c.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'} />
                  <span className="text-sm font-medium">{c.name}</span>
                </button>
              ))}
           </div>

           {/* DMs */}
           <div className="space-y-0.5">
              <div className="flex items-center px-2 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                 <ChevronDown size={12} className="mr-1" /> MENSAGENS DIRETAS
              </div>
              {dmChannels.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => setActiveChannel(c.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all group ${activeChannel === c.id ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-gray-300'}`}
                >
                  <div className="relative">
                    <img src={c.avatar} className="w-8 h-8 rounded-full bg-nexus-900 border border-white/5" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#18181b]"></div>
                  </div>
                  <span className="text-sm font-medium truncate">{c.name}</span>
                </button>
              ))}
           </div>
        </nav>

        {/* Channel Footer */}
        <div className="bg-[#121215] p-2 flex items-center gap-2">
           <div className="relative group">
              <div className="w-8 h-8 rounded-full bg-nexus-accent/20 flex items-center justify-center text-nexus-accent border border-white/5 overflow-hidden">
                {userStats && <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats.nexusId}`} className="w-full h-full object-cover" />}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#121215]"></div>
           </div>
           <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{userStats?.nexusId.replace('@','')}</p>
              <p className="text-[9px] text-gray-500 font-bold uppercase truncate">#Sincronizado</p>
           </div>
           <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400"><Mic size={14}/></button>
              <button className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400"><Headphones size={14}/></button>
              <button className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400"><Settings size={14}/></button>
           </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col bg-[#0f0f13]">
        {/* Chat Header */}
        <header className="h-12 px-4 flex items-center justify-between border-b border-black/20 bg-[#0f0f13]/80 backdrop-blur-md relative z-10">
           <div className="flex items-center gap-2">
              <span className="text-gray-500 font-bold text-2xl leading-none">#</span>
              <h4 className="font-bold text-white text-sm">{selectedChannel?.name}</h4>
              <div className="h-4 w-px bg-white/10 mx-2"></div>
              <p className="text-xs text-gray-500 truncate hidden lg:block">{selectedChannel?.description}</p>
           </div>
           <div className="flex items-center gap-4 text-gray-400">
              <button className="hover:text-white transition-colors"><Bell size={18}/></button>
              <button className="hover:text-white transition-colors"><Pin size={18}/></button>
              <button className="hover:text-white transition-colors"><Users size={18}/></button>
              <div className="relative">
                 <input type="text" placeholder="Buscar" className="bg-black/40 border-none rounded-md px-2 py-1 text-xs w-36 outline-none focus:w-48 transition-all" />
                 <Search className="absolute right-2 top-1.5 text-gray-500" size={14} />
              </div>
              <button className="hover:text-white transition-colors"><AtSign size={18}/></button>
              <button className="hover:text-white transition-colors"><HelpCircle size={18}/></button>
           </div>
        </header>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
           <div className="pb-8 pt-4 border-b border-white/5 mb-8">
              <div className="w-16 h-16 bg-nexus-accent/20 rounded-full flex items-center justify-center text-nexus-accent mb-4">
                 <Hash size={40} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo a #{selectedChannel?.name}!</h2>
              <p className="text-gray-400 text-sm">Este é o começo da história do canal #{selectedChannel?.name}.</p>
           </div>

           {messages.map((msg, i) => (
             <div key={msg.id} className="flex gap-4 group hover:bg-white/[0.02] -mx-4 px-4 py-1 transition-colors">
                <img src={msg.senderAvatar} className="w-10 h-10 rounded-xl bg-nexus-900 border border-white/5 flex-shrink-0 cursor-pointer hover:shadow-lg transition-all" />
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                      <h5 className={`font-bold text-sm cursor-pointer hover:underline ${msg.isAi ? 'text-nexus-accent' : 'text-white'}`}>{msg.senderName}</h5>
                      {msg.isAi && (
                        <span className="bg-nexus-accent/20 text-nexus-accent text-[9px] px-1 rounded flex items-center gap-1 font-bold uppercase">
                           <Bot size={8} /> BOT
                        </span>
                      )}
                      <span className="text-[10px] text-gray-500 font-medium">Hoje às {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   <p className="text-sm text-gray-300 leading-relaxed break-words">{msg.content}</p>
                </div>
             </div>
           ))}
           <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="px-4 pb-6">
           <form onSubmit={handleSend} className="bg-[#2f3136]/50 rounded-xl flex items-center px-4 py-2 border border-white/5 focus-within:border-nexus-accent transition-all relative">
              <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-[#2f3136] hover:bg-gray-400 cursor-pointer transition-colors">
                 <Plus size={16} strokeWidth={3} />
              </div>
              <input 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder={`Conversar em #${selectedChannel?.name}`} 
                 className="flex-1 bg-transparent border-none outline-none text-white px-4 py-2.5 text-sm placeholder:text-gray-500"
              />
              <div className="flex items-center gap-4 text-gray-400">
                 <button type="button" className="hover:text-white transition-colors"><Zap size={18}/></button>
                 <button type="button" className="hover:text-white transition-colors"><UserPlus size={18}/></button>
                 <button type="submit" className="text-nexus-accent hover:scale-110 transition-transform"><Send size={18}/></button>
              </div>
           </form>
           <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2 px-4 flex items-center gap-2">
              <Sparkles size={10} className="text-nexus-accent" /> Nexus Comms v2.0 Protocolo Seguro
           </p>
        </div>
      </div>

      {/* MEMBERS LIST (Visible only on Large Screens) */}
      <div className="w-60 bg-[#18181b] flex flex-col border-l border-white/5 hidden xl:flex">
         <header className="h-12 px-4 flex items-center border-b border-black/20">
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest">MEMBROS — {friends.length + 2}</h5>
         </header>
         <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-6">
            <div className="space-y-1">
               <div className="px-2 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nexus Core (Bots)</div>
               <div className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="relative">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=nexus" className="w-8 h-8 rounded-full bg-nexus-900 border border-nexus-accent/30" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#18181b]"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-nexus-accent flex items-center gap-1">Nexus AI <Bot size={12}/></p>
                    <p className="text-[10px] text-gray-500 truncate">Vigiando o Hall da Fama</p>
                  </div>
               </div>
            </div>

            <div className="space-y-1">
               <div className="px-2 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Disponível — {friends.length + 1}</div>
               <div className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="relative">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats?.nexusId}`} className="w-8 h-8 rounded-full bg-nexus-900 border border-white/5" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#18181b]"></div>
                  </div>
                  <p className="text-sm font-bold text-white">{userStats?.nexusId.replace('@','')}</p>
               </div>
               
               {friends.map(f => (
                 <div key={f.id} className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="relative">
                      <img src={f.avatarUrl} className="w-8 h-8 rounded-full bg-nexus-900 border border-white/5" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#18181b]"></div>
                    </div>
                    <p className="text-sm font-bold text-gray-400 group-hover:text-gray-200">{f.username}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};
