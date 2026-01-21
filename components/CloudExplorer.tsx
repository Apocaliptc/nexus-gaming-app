
import React, { useState, useEffect } from 'react';
import { nexusCloud } from '../services/nexusCloud';
import { Server, Search, RefreshCw, User, Mail, Calendar, Loader2, Database, ShieldCheck, ExternalLink, Filter } from 'lucide-react';

export const CloudExplorer: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await nexusCloud.listAllCloudUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.nexus_id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 space-y-8 animate-fade-in h-full flex flex-col bg-[#050507] overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-nexus-800 pb-8 shrink-0">
        <div className="space-y-1">
          <h2 className="text-4xl font-display font-bold text-white flex items-center gap-3">
            <Database className="text-nexus-secondary" /> Nexus Cloud Explorer
          </h2>
          <p className="text-gray-400 text-sm">Monitoramento em tempo real da tabela de perfis no Supabase.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-nexus-success/10 border border-nexus-success/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-nexus-success animate-pulse"></div>
              <span className="text-[10px] font-bold text-nexus-success uppercase tracking-widest">API Online</span>
           </div>
           <button 
             onClick={fetchUsers}
             className="p-3 bg-nexus-800 hover:bg-nexus-700 text-white rounded-xl border border-nexus-700 transition-all shadow-lg"
           >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      <div className="flex gap-4 shrink-0">
         <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-nexus-secondary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por Nexus ID ou E-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-nexus-900 border border-nexus-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-nexus-secondary outline-none transition-all shadow-xl"
            />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
             <Loader2 className="animate-spin text-nexus-secondary" size={48} />
             <p className="text-gray-500 font-mono text-xs animate-pulse uppercase tracking-[0.2em]">Sincronizando com Supabase...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-12 rounded-[2.5rem] text-center space-y-4">
             <ShieldCheck className="mx-auto text-red-500 opacity-50" size={64} />
             <h3 className="text-xl font-bold text-white">Falha na Requisição</h3>
             <p className="text-red-400/70 max-w-md mx-auto">{error}</p>
             <button onClick={fetchUsers} className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl text-sm">Tentar Novamente</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
             <div className="grid grid-cols-12 gap-4 px-6 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <div className="col-span-4">Identificador</div>
                <div className="col-span-4">E-mail</div>
                <div className="col-span-3">Última Atualização</div>
                <div className="col-span-1 text-right">Ação</div>
             </div>
             {filteredUsers.length === 0 ? (
               <div className="text-center py-20 bg-nexus-900/50 rounded-3xl border border-nexus-800 border-dashed">
                  <User className="mx-auto text-gray-700 mb-4" size={48} />
                  <p className="text-gray-500 italic">Nenhum registro encontrado para esta busca.</p>
               </div>
             ) : (
               filteredUsers.map((u, i) => (
                 <div 
                   key={i} 
                   className="grid grid-cols-12 gap-4 bg-nexus-800/40 p-5 rounded-2xl border border-nexus-800 hover:border-nexus-secondary hover:bg-nexus-800/80 transition-all group animate-fade-in"
                   style={{ animationDelay: `${i * 0.05}s` }}
                 >
                    <div className="col-span-4 flex items-center gap-3">
                       <div className="w-10 h-10 bg-nexus-900 rounded-xl flex items-center justify-center text-nexus-secondary border border-nexus-700 shadow-inner">
                          <User size={18} />
                       </div>
                       <span className="text-white font-bold font-mono text-sm">{u.nexus_id}</span>
                    </div>
                    <div className="col-span-4 flex items-center">
                       <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-200 transition-colors">
                          <Mail size={14} className="text-gray-600" />
                          <span className="text-xs truncate">{u.email}</span>
                       </div>
                    </div>
                    <div className="col-span-3 flex items-center">
                       <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-wide">
                          <Calendar size={14} className="text-gray-700" />
                          {u.updated_at ? new Date(u.updated_at).toLocaleDateString() : 'N/A'}
                       </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                       <button className="p-2 text-gray-600 hover:text-white transition-colors">
                          <ExternalLink size={18} />
                       </button>
                    </div>
                 </div>
               ))
             )}
          </div>
        )}
      </div>

      <div className="mt-auto p-6 bg-nexus-900/50 border-t border-nexus-800 flex justify-between items-center rounded-b-[2.5rem]">
         <div className="flex items-center gap-6">
            <div className="flex flex-col">
               <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Total Registrados</span>
               <span className="text-xl font-display font-bold text-white">{users.length}</span>
            </div>
            <div className="h-8 w-px bg-nexus-800"></div>
            <div className="flex flex-col">
               <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Storage Status</span>
               <span className="text-xs font-bold text-nexus-success uppercase">99.9% Disponível</span>
            </div>
         </div>
         <p className="text-[10px] text-gray-600 font-mono italic">PROJECT_REF: xdwzlvnzgibgebcyxusy</p>
      </div>
    </div>
  );
};
