
import React, { useState, useMemo } from 'react';
import { ForumCategory, PostPrivacy, ForumPost } from '../types';
import { 
  MessagesSquare, Plus, Search, Filter, Lock, 
  Globe, Users, History, Heart, MessageSquare, 
  ShieldCheck, X, Send, UserCircle, ChevronRight, Hash
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const MOCK_FORUM_POSTS: ForumPost[] = [
  {
    id: 'f1',
    authorId: 'u1',
    authorName: 'JeanPaulo',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jean',
    category: ForumCategory.HARDWARE,
    title: 'Vale a pena trocar a RTX 3080 pela 5090 no lançamento?',
    content: 'Galera, estou com uma dúvida cruel sobre o bottleneck que a nova série pode causar no meu processador atual...',
    privacy: PostPrivacy.PUBLIC,
    timestamp: new Date().toISOString(),
    likes: 42,
    replies: 12
  },
  {
    id: 'f2',
    authorId: 'u2',
    authorName: 'RetroLover',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Retro',
    category: ForumCategory.COLLECTION,
    title: 'Minha coleção de GameBoy está quase completa!',
    content: 'Faltam apenas 3 títulos da série Pokémon para fechar o set nacional. Vejam as fotos...',
    privacy: PostPrivacy.FRIENDS,
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    likes: 120,
    replies: 45
  }
];

export const NexusForum: React.FC = () => {
  const { userStats } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<ForumCategory | 'Todas'>('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: ForumCategory.DIGITAL_GAMES,
    privacy: PostPrivacy.PUBLIC
  });

  const filteredPosts = useMemo(() => {
    return MOCK_FORUM_POSTS.filter(post => {
      const matchCat = activeCategory === 'Todas' || post.category === activeCategory;
      const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchTerm]);

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 animate-fade-in overflow-hidden">
      <header className="p-8 border-b border-nexus-800 bg-gradient-to-b from-nexus-900/50 to-transparent shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-bold text-white tracking-tighter flex items-center gap-4">
              <MessagesSquare className="text-nexus-accent" size={36} /> NEXUS FORUM
            </h1>
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">Discussões da Comunidade Soberana</p>
          </div>
          <button 
            onClick={() => setShowNewPostModal(true)}
            className="px-8 py-3 bg-nexus-accent hover:bg-nexus-accent/80 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-nexus-accent/20 flex items-center gap-2"
          >
            <Plus size={18} /> Novo Tópico
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Categorias */}
        <aside className="w-64 border-r border-nexus-800 p-6 hidden lg:flex flex-col gap-6 bg-nexus-900/30">
          <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2">Categorias</h3>
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveCategory('Todas')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeCategory === 'Todas' ? 'bg-nexus-accent text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              🚀 Todos os Temas
            </button>
            {Object.values(ForumCategory).map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeCategory === cat ? 'bg-nexus-secondary text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                # {cat}
              </button>
            ))}
          </nav>
        </aside>

        {/* Lista de Tópicos */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-nexus-800 shrink-0">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar nos arquivos da comunidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-nexus-900 border border-nexus-700 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:border-nexus-accent outline-none"
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {filteredPosts.map(post => (
              <div key={post.id} className="bg-nexus-900/80 border border-nexus-800 rounded-[2.5rem] p-8 hover:border-nexus-accent/50 transition-all group shadow-xl">
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                       <img src={post.authorAvatar} className="w-12 h-12 rounded-2xl border-2 border-nexus-800" />
                       <div>
                          <h4 className="font-bold text-white">@{post.authorName}</h4>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{post.timestamp.split('T')[0]} • {post.category}</p>
                       </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${
                      post.privacy === PostPrivacy.PUBLIC ? 'bg-nexus-success/10 text-nexus-success border-nexus-success/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                       {post.privacy === PostPrivacy.PUBLIC ? <Globe size={12}/> : <Users size={12}/>}
                       {post.privacy}
                    </div>
                 </div>

                 <h3 className="text-2xl font-display font-bold text-white mb-4 group-hover:text-nexus-accent transition-colors leading-tight">{post.title}</h3>
                 <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-6 italic">"{post.content}"</p>

                 <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex gap-6">
                       <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                          <Heart size={18}/> <span className="font-bold text-xs">{post.likes}</span>
                       </button>
                       <button className="flex items-center gap-2 text-gray-500 hover:text-nexus-accent transition-colors">
                          <MessageSquare size={18}/> <span className="font-bold text-xs">{post.replies}</span>
                       </button>
                    </div>
                    <button className="text-nexus-accent font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                       Sintonizar Tópico <ChevronRight size={14}/>
                    </button>
                 </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal Novo Tópico */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-nexus-900 w-full max-w-2xl rounded-[3rem] border border-nexus-800 shadow-2xl overflow-hidden flex flex-col animate-fade-in">
              <div className="p-8 border-b border-nexus-800 flex justify-between items-center bg-gradient-to-r from-nexus-accent/10 to-transparent">
                 <div>
                    <h3 className="text-2xl font-display font-bold text-white">Novo Tópico</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Inicie uma nova transmissão no Hall</p>
                 </div>
                 <button onClick={() => setShowNewPostModal(false)} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
              </div>
              
              <div className="p-8 space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Título da Discussão</label>
                    <input 
                      type="text" 
                      className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-6 py-4 text-white outline-none focus:border-nexus-accent" 
                      placeholder="Sobre o que vamos conversar?"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Categoria</label>
                       <select className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-5 py-4 text-sm text-white focus:border-nexus-accent outline-none appearance-none">
                          {Object.values(ForumCategory).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Privacidade</label>
                       <select className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl px-5 py-4 text-sm text-white focus:border-nexus-accent outline-none appearance-none">
                          {Object.values(PostPrivacy).map(p => <option key={p} value={p}>{p}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Mensagem</label>
                    <textarea 
                      className="w-full bg-nexus-800 border border-nexus-700 rounded-2xl p-6 text-white outline-none focus:border-nexus-accent h-40 resize-none" 
                      placeholder="Seu conhecimento aqui..."
                    />
                 </div>
                 <button className="w-full py-5 bg-nexus-accent text-white font-black text-xs uppercase tracking-[0.4em] rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3">
                    <Send size={18}/> Transmitir ao Nexus
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
