
import React, { useState } from 'react';
import { User, X, Library, Moon, Sun, LogOut, Database, ShieldCheck } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { supabase } from '../lib/supabase';
import { ImportExportModal } from './ImportExportModal';
import { AdminModal } from './AdminModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGallery: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenGallery }) => {
  const { user, userProfile, isDark, setIsDark } = useApp();
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const handleLogout = async () => {
    if (confirm('Deseja realmente sair?')) {
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-y-0 left-0 bg-white dark:bg-zinc-950 shadow-2xl z-[150] w-[320px] max-w-[85vw] transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
              <User className="w-6 h-6" />
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Usuário</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {user?.email || 'Carregando...'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Menu Principal</p>
          <button 
            onClick={() => { onClose(); onOpenGallery(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 rounded-xl transition-all"
          >
            <Library className="w-5 h-5" />
            Galeria de Exercícios
          </button>
          
          <div className="pt-4">
            <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Configurações</p>
            <button 
              onClick={() => setIsDark(!isDark)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                Tema Escuro
              </div>
              <div className={`w-10 h-5 ${isDark ? 'bg-orange-600' : 'bg-zinc-200 dark:bg-zinc-800'} rounded-full relative transition-colors`}>
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </button>

            <button 
              onClick={() => setIsImportExportOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all group"
            >
              <Database className="w-5 h-5 group-hover:text-orange-600 transition-colors" />
              Importar/Exportar Dados
            </button>

            {userProfile?.is_admin && (
              <div className="pt-4">
                <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Administração</p>
                <button 
                  onClick={() => setIsAdminOpen(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all group"
                >
                  <ShieldCheck className="w-5 h-5 group-hover:text-orange-600 transition-colors" />
                  Gerenciar Usuários
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-100 dark:bg-zinc-900 text-red-600 font-bold rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            Sair da Conta
          </button>
          <p className="text-center text-[10px] text-zinc-400 mt-4 font-medium uppercase tracking-widest">GymTrack Pro v2.0</p>
        </div>
      </div>

      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-[140] backdrop-blur-sm transition-opacity duration-300"
        ></div>
      )}

      {isImportExportOpen && <ImportExportModal onClose={() => setIsImportExportOpen(false)} />}
      {isAdminOpen && <AdminModal onClose={() => setIsAdminOpen(false)} />}
    </>
  );
};
