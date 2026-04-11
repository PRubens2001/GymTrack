
import React, { useState } from 'react';
import { useApp } from './hooks/useApp';
import { AuthOverlay } from './components/AuthOverlay';
import { Sidebar } from './components/Sidebar';
import { Menu, Dumbbell, Timer, Apple } from 'lucide-react';
import { AppMode } from './types';
import { MusculacaoContainer } from './components/musculacao/MusculacaoContainer';
import { CorridaContainer } from './components/corrida/CorridaContainer';
import { AlimentacaoContainer } from './components/alimentacao/AlimentacaoContainer';
import { GallerySection } from './components/musculacao/GallerySection';

const App: React.FC = () => {
  const { user, loading } = useApp();
  const [mode, setMode] = useState<AppMode>('musculacao');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

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
