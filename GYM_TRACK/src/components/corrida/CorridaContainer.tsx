
import React, { useState } from 'react';
import { RunLogSection } from './RunLogSection';
import { RunHistorySection } from './RunHistorySection';
import { RunStatsSection } from './RunStatsSection';

type Tab = 'log' | 'history' | 'stats';

export const CorridaContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('log');

  return (
    <div className="animate-in">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            GymTrack <span className="text-blue-600">Run</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Monitore seu pace e evolução nas pistas.</p>
        </div>
        <nav className="nav-tabs flex gap-2 bg-zinc-200 dark:bg-zinc-900 p-1 rounded-lg self-start max-w-full overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('log')}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'log' ? 'bg-white dark:bg-zinc-800 dark:text-zinc-100 shadow-sm' : 'hover:bg-zinc-300 dark:hover:bg-zinc-700 dark:text-zinc-400'}`}
          >
            Registrar
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-white dark:bg-zinc-800 dark:text-zinc-100 shadow-sm' : 'hover:bg-zinc-300 dark:hover:bg-zinc-700 dark:text-zinc-400'}`}
          >
            Histórico
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'stats' ? 'bg-white dark:bg-zinc-800 dark:text-zinc-100 shadow-sm' : 'hover:bg-zinc-300 dark:hover:bg-zinc-700 dark:text-zinc-400'}`}
          >
            Estatísticas
          </button>
        </nav>
      </header>

      <main>
        {activeTab === 'log' && <RunLogSection />}
        {activeTab === 'history' && <RunHistorySection />}
        {activeTab === 'stats' && <RunStatsSection />}
      </main>
    </div>
  );
};
