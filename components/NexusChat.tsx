
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, Send, Search, UserCircle, MessageSquare, 
  MoreVertical, Smile, Paperclip, Users, UserPlus, 
  ChevronLeft, X, Check, ArrowLeft, Bot, Sparkles
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ChatMessage, Friend } from '../types';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  type: 'dm' | 'group';
  members: string[]; // IDs dos amigos
  online?: boolean;
}

export const NexusChat: React.FC = () => {
  const { userStats, friends } = useAppContext();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const [selectedForNewChat, setSelectedForNewChat] = useState<string[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Inicializa conversas baseadas em amigos e alguns grupos mock
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (friends) {
      const dms: Conversation[] = friends.map(f => ({
        id: f.nexusId,
        name: f.username,
        avatar: f.avatarUrl,
        lastMessage: 'Sincronizado via Nexus Pulse',
        timestamp: new Date().toISOString(),
        type: 'dm',
        members: [f.nexusId],
        online: f.status === 'online' || f.status === 'ingame'
      }));

      const clanGroup: Conversation = {
        id: 'clan-alpha',
        name: 'Clã Alpha (Nexus)',
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=clan`,
        lastMessage: 'Preparando raid para domingo...',
        timestamp: new Date().toISOString(),
        type: 'group',
        members: friends.map(f => f.nexusId)
      };

      setConversations([clanGroup, ...dms]);
    }
  }, [friends]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatId]);

  const activeChat = useMemo(() => 
    conversations.find(c => c.id === activeChatId), 
    [activeChatId, conversations]
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userStats || !activeChatId) return;

    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: activeChatId,
      senderId: userStats.nexusId,
      senderName: userStats.nexusId.replace('@', ''),
      senderAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats.nexusId}`,
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), msg]
    }));
    
    // Atualiza a prévia da última mensagem
    setConversations(prev => prev.map(c => 
      c.id === activeChatId ? { ...c, lastMessage: input, timestamp: msg.timestamp } : c
    ));

    setInput('');

    // Resposta Mock da IA se for um grupo ou se citar "Oráculo"
    if (input.toLowerCase().includes('oráculo')) {
      setTimeout(() => {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          channelId: activeChatId,
          senderId: 'bot',
          senderName: 'Nexus Oracle',
          senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=oracle',
          content: 'As frequências do Oráculo detectaram sua mensagem. Em que posso ser útil?',
          timestamp: new Date().toISOString(),
          isAi: true
        };
        setMessages(p => ({ ...p, [activeChatId]: [...(p[activeChatId] || []), botMsg] }));
      }, 1500);
    }
  };

  const startNewConversation = () => {
    if (selectedForNewChat.length === 0) return;

    if (selectedForNewChat.length === 1) {
      // Direct Message
      const friendId = selectedForNewChat[0];
      const existing = conversations.find(c => c.id === friendId && c.type === 'dm');
      if (existing) {
        setActiveChatId(existing.id);
      } else {
        const friend = friends.find(f => f.nexusId === friendId);
        if (friend) {
          const newConv: Conversation = {
            id: friend.nexusId,
            name: friend.username,
            avatar: friend.avatarUrl,
            lastMessage: 'Conversa iniciada',
            timestamp: new Date().toISOString(),
            type: 'dm',
            members: [friend.nexusId]
          };
          setConversations([newConv, ...conversations]);
          setActiveChatId(newConv.id);
        }
      }
    } else {
      // Group Chat
      const newGroupId = `group-${Date.now()}`;
      const newGroup: Conversation = {
        id: newGroupId,
        name: `Novo Grupo (${selectedForNewChat.length + 1})`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${newGroupId}`,
        lastMessage: 'Grupo criado',
        timestamp: new Date().toISOString(),
        type: 'group',
        members: selectedForNewChat
      };
      setConversations([newGroup, ...conversations]);
      setActiveChatId(newGroupId);
    }

    setSelectedForNewChat([]);
    setShowFriendSelector(false);
  };

  const toggleSelectFriend = (id: string) => {
    setSelectedForNewChat(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#050507] overflow-hidden animate-fade-in relative">
      
      {/* SIDEBAR: CONVERSAS */}
      <aside className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-nexus-800 bg-nexus-900/50 backdrop-blur-xl shrink-0 transition-all ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        <header className="p-6 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">Comunicações</h2>
              <button 
                onClick={() => setShowFriendSelector(true)}
                className="w-10 h-10 bg-nexus-accent hover:bg-nexus-accent/80 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-nexus-accent/20"
              >
                <Plus size={20} />
              </button>
           </div>

           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Buscar conversas..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-nexus-800/50 border border-nexus-700 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-nexus-accent outline-none transition-all"
              />
           </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1 pb-20">
           {filteredConversations.length === 0 ? (
             <div className="py-20 text-center space-y-4 px-10">
                <MessageSquare className="mx-auto text-gray-800" size={48} />
                <p className="text-gray-500 text-sm italic">Nenhuma transmissão ativa. Inicie uma nova conexão.</p>
             </div>
           ) : (
             filteredConversations.map(conv => (
               <button 
                 key={conv.id}
                 onClick={() => setActiveChatId(conv.id)}
                 className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all group ${activeChatId === conv.id ? 'bg-nexus-accent text-white shadow-xl shadow-nexus-accent/20' : 'hover:bg-nexus-800/40 text-gray-400'}`}
               >
                  <div className="relative shrink-0">
                     <img src={conv.avatar} className="w-12 h-12 rounded-2xl border-2 border-white/5" />
                     {conv.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-nexus-900 group-hover:border-nexus-accent transition-colors"></div>
                     )}
                     {conv.type === 'group' && (
                        <div className="absolute -top-1 -right-1 p-1 bg-nexus-secondary rounded-lg text-white border-2 border-nexus-900">
                           <Users size={10} />
                        </div>
                     )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                     <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className={`font-bold truncate ${activeChatId === conv.id ? 'text-white' : 'text-gray-200'}`}>{conv.name}</h4>
                        <span className="text-[9px] font-medium opacity-50">{new Date(conv.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                     </div>
                     <p className={`text-xs truncate opacity-70 ${activeChatId === conv.id ? 'text-white' : 'text-gray-500'}`}>{conv.lastMessage}</p>
                  </div>
               </button>
             ))
           )}
        </div>
      </aside>

      {/* CHAT WINDOW */}
      <main className={`flex-1 flex flex-col bg-[#050507] transition-all ${activeChatId ? 'flex' : 'hidden md:flex'}`}>
        {activeChat ? (
          <>
            {/* Header Janela */}
            <header className="h-20 px-6 border-b border-nexus-800 flex items-center justify-between bg-nexus-900/50 backdrop-blur-md sticky top-0 z-20">
               <div className="flex items-center gap-4">
                  <button onClick={() => setActiveChatId(null)} className="md:hidden p-2 text-gray-400 hover:text-white"><ArrowLeft size={24}/></button>
                  <div className="relative">
                    <img src={activeChat.avatar} className="w-10 h-10 rounded-xl border border-white/10" />
                    {activeChat.online && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-nexus-900"></div>}
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-none mb-1">{activeChat.name}</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                       {activeChat.type === 'group' ? `${activeChat.members.length + 1} Sintonizados` : activeChat.online ? 'Operativo' : 'Sinal Fraco'}
                    </p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button className="p-3 hover:bg-nexus-800 rounded-xl text-gray-400 hover:text-white transition-all"><Users size={18}/></button>
                  <button className="p-3 hover:bg-nexus-800 rounded-xl text-gray-400 hover:text-white transition-all"><MoreVertical size={18}/></button>
               </div>
            </header>

            {/* Lista de Mensagens */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
               <div className="py-12 text-center space-y-4 border-b border-white/5 mb-8">
                  <img src={activeChat.avatar} className="w-24 h-24 rounded-[2.5rem] mx-auto border-4 border-nexus-800 shadow-2xl" />
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">Início do Registro</h2>
                    <p className="text-gray-500 text-sm">Este é o começo da sua jornada de comunicação com <span className="text-nexus-accent font-bold">{activeChat.name}</span>.</p>
                  </div>
               </div>

               {(messages[activeChatId] || []).map((msg, i) => {
                 const isMe = msg.senderId === userStats?.nexusId;
                 return (
                   <div key={msg.id} className={`flex gap-4 group animate-fade-in ${isMe ? 'flex-row-reverse' : ''}`}>
                      <img src={msg.senderAvatar} className="w-10 h-10 rounded-xl border border-white/5 shrink-0" />
                      <div className={`max-w-[75%] space-y-1 ${isMe ? 'text-right' : ''}`}>
                         <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{msg.senderName}</span>
                            {msg.isAi && <span className="bg-nexus-accent/20 text-nexus-accent text-[8px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold uppercase"><Bot size={8}/> AI</span>}
                            <span className="text-[9px] text-gray-600 font-mono">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                         </div>
                         <div className={`p-4 rounded-3xl text-sm leading-relaxed ${isMe ? 'bg-nexus-accent text-white shadow-xl shadow-nexus-accent/10 rounded-tr-none' : 'bg-nexus-800 text-gray-200 rounded-tl-none border border-nexus-700'}`}>
                            {msg.content}
                         </div>
                      </div>
                   </div>
                 );
               })}
               <div ref={chatEndRef} />
            </div>

            {/* Input Área */}
            <div className="p-6 bg-gradient-to-t from-[#050507] via-[#050507] to-transparent">
               <form onSubmit={handleSend} className="bg-nexus-900 border border-nexus-700 rounded-[2rem] p-2 flex items-center gap-2 focus-within:border-nexus-accent transition-all shadow-2xl">
                  <button type="button" className="p-3 text-gray-500 hover:text-nexus-accent transition-colors"><Smile size={20}/></button>
                  <button type="button" className="p-3 text-gray-500 hover:text-nexus-secondary transition-colors"><Paperclip size={20}/></button>
                  <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`Transmitir para ${activeChat.name}...`}
                    className="flex-1 bg-transparent border-none outline-none text-white px-2 py-3 text-sm placeholder:text-gray-600"
                  />
                  <button type="submit" disabled={!input.trim()} className="w-12 h-12 bg-nexus-accent text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-nexus-accent/30 hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100">
                    <Send size={20} />
                  </button>
               </form>
               <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest mt-4 text-center flex items-center justify-center gap-2">
                  <Sparkles size={10} className="text-nexus-accent" /> Nexus Comms Protocolo Sintonizado
               </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 opacity-40">
             <div className="w-32 h-32 bg-nexus-800/50 rounded-[3rem] border-2 border-dashed border-nexus-700 flex items-center justify-center">
                <MessageSquare size={48} className="text-gray-600" />
             </div>
             <div className="text-center">
                <h3 className="text-2xl font-display font-bold text-white">Nenhum Chat Ativo</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">Selecione uma conversa ou inicie um novo grupo com seus aliados.</p>
             </div>
             <button onClick={() => setShowFriendSelector(true)} className="px-8 py-3 bg-nexus-accent text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:scale-105 transition-all">Iniciar Nova Transmissão</button>
          </div>
        )}
      </main>

      {/* FRIEND SELECTOR MODAL */}
      {showFriendSelector && (
         <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowFriendSelector(false)}></div>
            <div className="bg-nexus-900 w-full max-w-md rounded-[3rem] border border-nexus-700 shadow-2xl relative z-10 overflow-hidden flex flex-col animate-fade-in max-h-[80vh]">
               <header className="p-8 border-b border-nexus-800 flex justify-between items-center bg-gradient-to-r from-nexus-accent/10 to-transparent">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-white">Iniciar Chat</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Sincronizar Amigos</p>
                  </div>
                  <button onClick={() => setShowFriendSelector(false)} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
               </header>

               <div className="p-4 bg-nexus-800/40 border-b border-nexus-800">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Filtrar hall de amigos..." 
                      className="w-full bg-nexus-900 border border-nexus-700 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-nexus-accent outline-none"
                    />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
                  {friends.length === 0 ? (
                    <div className="py-20 text-center opacity-20 italic">Seu círculo está vazio.</div>
                  ) : (
                    friends.map(friend => (
                      <button 
                        key={friend.nexusId}
                        onClick={() => toggleSelectFriend(friend.nexusId)}
                        className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${selectedForNewChat.includes(friend.nexusId) ? 'bg-nexus-accent text-white' : 'hover:bg-nexus-800 text-gray-400'}`}
                      >
                         <img src={friend.avatarUrl} className="w-12 h-12 rounded-2xl border-2 border-white/5" />
                         <div className="flex-1 text-left min-w-0">
                            <h4 className={`font-bold truncate ${selectedForNewChat.includes(friend.nexusId) ? 'text-white' : 'text-gray-200'}`}>@{friend.username}</h4>
                            <p className={`text-[10px] uppercase font-black tracking-widest opacity-60`}>{friend.status}</p>
                         </div>
                         <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedForNewChat.includes(friend.nexusId) ? 'bg-white border-white text-nexus-accent' : 'border-nexus-700'}`}>
                            {selectedForNewChat.includes(friend.nexusId) && <Check size={16} strokeWidth={4} />}
                         </div>
                      </button>
                    ))
                  )}
               </div>

               <div className="p-8 border-t border-nexus-800 bg-[#050507]">
                  <button 
                    onClick={startNewConversation}
                    disabled={selectedForNewChat.length === 0}
                    className="w-full py-5 bg-nexus-accent hover:bg-nexus-accent/80 text-white rounded-[1.5rem] font-display font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl disabled:opacity-30 disabled:grayscale"
                  >
                    {selectedForNewChat.length > 1 ? `CRIAR GRUPO (${selectedForNewChat.length + 1})` : 'CONECTAR AGORA'}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
