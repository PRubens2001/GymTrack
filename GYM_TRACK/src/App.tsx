
import React, { useState } from 'react';
import { useApp } from './hooks/useApp';
import { AuthOverlay } from './components/AuthOverlay';
import { Sidebar } from './components/Sidebar';
import { Menu, Dumbbell, Timer, Apple, Clock } from 'lucide-react';
import { AppMode } from './types';
import { supabase } from './lib/supabase';
import { MusculacaoContainer } from './components/musculacao/MusculacaoContainer';
import { CorridaContainer } from './components/corrida/CorridaContainer';
import { AlimentacaoContainer } from './components/alimentacao/AlimentacaoContainer';
import { GallerySection } from './components/musculacao/GallerySection';
import { EmailConfirmation } from './components/EmailConfirmation';
import { ResetPassword } from './components/ResetPassword';

const App: React.FC = () => {
  const { user, userProfile, loading, error, loadAllData } = useApp();
  const [mode, setMode] = useState<AppMode>('musculacao');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(window.location.pathname === '/confirmacao-sucesso');
  const [showResetPassword, setShowResetPassword] = useState(window.location.pathname === '/reset-password');

  if (showConfirmation) {
    return <EmailConfirmation onBackToLogin={() => {
      window.history.pushState({}, '', '/');
      setShowConfirmation(false);
    }} />;
  }

  if (showResetPassword) {
    return <ResetPassword onSuccess={() => {
      window.history.pushState({}, '', '/');
      setShowResetPassword(false);
    }} />;
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center z-[10000]">
        <div className="loading-spinner mb-4"></div>
        <p className="text-zinc-900 dark:text-zinc-100 font-bold text-lg">Sincronizando seus dados...</p>
        <p className="text-zinc-500 text-sm mt-2">Iniciando conexão segura...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthOverlay />;
  }

  // Se houver erro ou o perfil não carregou, mostramos uma tela de erro/ação
  if (error || !userProfile) {
    return (
      <div className="fixed inset-0 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-8 text-center z-[10000]">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2">Erro de Configuração</h2>
        <p className="text-zinc-500 max-w-md mb-6">
          {error || "Não foi possível carregar seu perfil de usuário. Isso geralmente acontece se as tabelas do banco de dados não foram criadas."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => loadAllData(user, true)}
            className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
          >
            Tentar Novamente
          </button>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="px-6 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-zinc-300 transition-all"
          >
            Sair da Conta
          </button>
        </div>
        <p className="mt-8 text-xs text-zinc-400 max-w-xs">
          Dica: Certifique-se de ter executado o script SQL no painel do Supabase para criar as tabelas necessárias.
        </p>
      </div>
    );
  }

  if (!userProfile.is_approved) {
    return (
      <div className="fixed inset-0 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-8 text-center z-[10000]">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-3xl flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-orange-600" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2">Aguardando Liberação</h2>
        <p className="text-zinc-500 max-w-md">
          Sua conta foi criada com sucesso! Por segurança, um administrador precisa liberar seu acesso manualmente. 
          Você receberá um aviso assim que puder começar a usar o GymTrack Pro.
        </p>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="mt-8 px-6 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-zinc-300 transition-all"
        >
          Sair da Conta
        </button>
      </div>
    );
  }

  return (
    <div id="app" className="max-w-4xl mx-auto p-3 sm:p-4 md:p-8 relative z-10" data-mode={mode}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onOpenGallery={() => setIsGalleryOpen(true)}
      />

      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-2 left-2 sm:top-4 sm:left-4 z-[130] p-2 sm:p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl shadow-xl text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-all active:scale-95"
      >
        <Menu className="w-5 h-5 sm:w-6 h-6" />
      </button>

      {/* Mode Switcher */}
      <div className="flex justify-start sm:justify-center mb-8 overflow-x-auto no-scrollbar px-2 pl-14 sm:pl-2">
        <div className="inline-flex p-1 bg-zinc-200 dark:bg-zinc-900 rounded-2xl shadow-inner border border-zinc-300 dark:border-zinc-800 flex-nowrap min-w-max">
          <button 
            onClick={() => setMode('musculacao')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${mode === 'musculacao' ? 'active-mode-musculacao' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            <Dumbbell className="w-4 h-4" />
            Musculação
          </button>
          <button 
            onClick={() => setMode('corrida')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${mode === 'corrida' ? 'active-mode-corrida' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            <Timer className="w-4 h-4" />
            Corrida
          </button>
          <button 
            onClick={() => setMode('alimentacao')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${mode === 'alimentacao' ? 'active-mode-alimentacao' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            <Apple className="w-4 h-4" />
            Alimentação
          </button>
        </div>
      </div>

      {mode === 'musculacao' && <MusculacaoContainer />}
      {mode === 'corrida' && <CorridaContainer />}
      {mode === 'alimentacao' && <AlimentacaoContainer />}

      {isGalleryOpen && <GallerySection onClose={() => setIsGalleryOpen(false)} />}

      <footer className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-zinc-400 dark:text-zinc-600 text-sm">
        <p>GymTrack Pro &copy; 2026 - Persistência Supabase</p>
      </footer>
    </div>
  );
};

export default App;
