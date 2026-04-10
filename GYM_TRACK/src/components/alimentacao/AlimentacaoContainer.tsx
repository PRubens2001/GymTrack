
import React, { useState } from 'react';
import { DailySummary } from './DailySummary';
import { WaterTracker } from './WaterTracker';
import { MealsSection } from './MealsSection';
import { DietHistorySection } from './DietHistorySection';
import { Settings } from 'lucide-react';
import { DietGoalsModal } from './DietGoalsModal';

type Tab = 'daily' | 'history';

export const AlimentacaoContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);

  return (
    <div className="animate-in">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            GymTrack <span className="text-green-600">Diet</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Controle seus macros e hidratação.</p>
        </div>
        <div className="flex items-center gap-2">
          <nav className="nav-tabs flex gap-2 bg-zinc-200 dark:bg-zinc-900 p-1 rounded-lg self-start max-w-full overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('daily')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'daily' ? 'bg-white dark:bg-zinc-800 dark:text-zinc-100 shadow-sm' : 'hover:bg-zinc-300 dark:hover:bg-zinc-700 dark:text-zinc-400'}`}
            >
              Diário
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-white dark:bg-zinc-800 dark:text-zinc-100 shadow-sm' : 'hover:bg-zinc-300 dark:hover:bg-zinc-700 dark:text-zinc-400'}`}
            >
              Histórico
            </button>
          </nav>
          <button 
            onClick={() => setIsGoalsModalOpen(true)}
            className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-400 hover:text-green-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="space-y-6">
        {activeTab === 'daily' ? (
          <>
            <DailySummary />
            <WaterTracker />
            <MealsSection />
          </>
        ) : (
          <DietHistorySection />
        )}
      </main>

      {isGoalsModalOpen && <DietGoalsModal onClose={() => setIsGoalsModalOpen(false)} />}
    </div>
  );
};
