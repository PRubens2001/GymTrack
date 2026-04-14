
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, ShieldCheck, UserCheck, UserX, Search, Mail } from 'lucide-react';
import { UserProfile } from '../types';

interface AdminModalProps {
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ onClose }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gymtrack_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleToggleApproval = async (profile: UserProfile) => {
    const { error } = await supabase
      .from('gymtrack_profiles')
      .update({ is_approved: !profile.is_approved })
      .eq('id', profile.id);
    
    if (!error) {
      setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, is_approved: !p.is_approved } : p));
    }
  };

  const handleDeleteUser = async (profile: UserProfile) => {
    if (!confirm(`Deseja realmente excluir permanentemente o perfil de ${profile.email}? Isso não excluirá a conta de autenticação, apenas os dados do perfil.`)) return;
    
    const { error } = await supabase
      .from('gymtrack_profiles')
      .delete()
      .eq('id', profile.id);
    
    if (!error) {
      setProfiles(prev => prev.filter(p => p.id !== profile.id));
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Gerenciar Usuários</h3>
              <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest">Painel Administrativo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Buscar por e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
              <div className="loading-spinner mb-4"></div>
              <p className="font-bold">Carregando usuários...</p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold">Nenhum usuário encontrado.</p>
            </div>
          ) : (
            filteredProfiles.map((profile) => (
              <div 
                key={profile.id}
                className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-orange-500/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${profile.is_approved ? 'bg-green-500' : 'bg-zinc-400'}`}>
                    {profile.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{profile.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {profile.is_admin && (
                        <span className="text-[9px] font-black uppercase bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-1.5 py-0.5 rounded">Admin</span>
                      )}
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${profile.is_approved ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                        {profile.is_approved ? 'Aprovado' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                </div>

                {!profile.is_admin && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggleApproval(profile)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${profile.is_approved ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100' : 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100'}`}
                    >
                      {profile.is_approved ? (
                        <>
                          <UserX className="w-4 h-4" />
                          Bloquear
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Liberar
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(profile)}
                      className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-100 transition-all active:scale-95"
                      title="Excluir Perfil"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <p className="text-[10px] text-zinc-400 text-center font-medium uppercase tracking-widest">
            Aprovação Manual de Usuários - GymTrack Pro
          </p>
        </div>
      </div>
    </div>
  );
};
