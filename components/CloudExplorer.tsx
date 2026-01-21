
import React, { useState, useEffect } from 'react';
import { nexusCloud } from '../services/nexusCloud';
import { Server, Search, RefreshCw, User, Mail, Calendar, Loader2, Database, ShieldCheck, AlertCircle } from 'lucide-react';

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
            <Database className="text-nexus-secondary" /> Hall da Fama
          </h2>
          <p className="text-gray-400 text-sm">Lista de perfis imortalizados no banco de dados.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={fetchUsers}
             disabled={loading}
             className="p-2 bg-nexus-800 hover:bg-nexus-700 text-gray-400 hover:text-white rounded-xl border border-nexus-700 transition-all"
             title="Sincronizar Banco"
           >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por @ID ou E-mail..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-nexus-900 border border-nexus-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-nexus-secondary outline-none w-64"
              />
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
         {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
               <Loader2 className="animate-spin text-nexus-secondary" size={48} />
               <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Acessando Supabase...</p>
            </div>
         ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl text-center space-y-4">
               <AlertCircle size={48} className="text-red-500 mx-auto" />
               <h3 className="text-xl font-bold text-white">Falha na Conexão</h3>
               <p className="text-gray-400 max-w-md mx-auto">{error}</p>
               <button onClick={fetchUsers} className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl">Tentar Novamente</button>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
               {filteredUsers.map((user, idx) => (
                  <div key={idx} className="bg-nexus-800 p-6 rounded-[2rem] border border-nexus-700 hover:border-nexus-secondary/50 transition-all group">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-nexus-900 rounded-2xl flex items-center justify-center text-nexus-secondary border border-nexus-700">
                           <User size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="text-lg font-bold text-white truncate">{user.nexus_id}</h4>
                           <div className="flex items-center gap-1.5 text-nexus-success">
                              <ShieldCheck size={12} />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Perfil Verificado</span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="space-y-3 pt-4 border-t border-nexus-700/50">
                        <div className="flex items-center gap-2 text-gray-500">
                           <Mail size={14} className="shrink-0" />
                           <span className="text-xs truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                           <Calendar size={14} className="shrink-0" />
                           <span className="text-[10px] font-bold uppercase">Desde: {new Date(user.updated_at).toLocaleDateString()}</span>
                        </div>
                     </div>
                  </div>
               ))}

               {filteredUsers.length === 0 && (
                  <div className="col-span-full py-20 text-center">
                     <Database size={48} className="mx-auto mb-4 opacity-10" />
                     <p className="text-gray-500">Nenhum usuário encontrado com estes critérios.</p>
                  </div>
               )}
            </div>
         )}
      </div>
    </div>
  );
};
