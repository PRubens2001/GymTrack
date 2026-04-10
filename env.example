
import React from 'react';
import { useApp } from '../../hooks/useApp';
import { Droplets, Plus, Minus } from 'lucide-react';

export const WaterTracker: React.FC = () => {
  const { water, updateWater } = useApp();

  if (!water) return null;

  const percent = Math.min(100, (water.current / water.goal) * 100);

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <Droplets className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Hidratação</h3>
            <p className="text-xs text-zinc-500 font-medium">Mantenha seu corpo funcionando bem.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-blue-600 leading-none">
            {water.current}<span className="text-xs font-bold text-zinc-400 ml-1">ml</span>
          </p>
          <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">Meta: {water.goal}ml</p>
        </div>
      </div>

      <div className="relative h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          style={{ width: `${percent}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={() => updateWater(-250)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
        >
          <Minus className="w-4 h-4" />
          250ml
        </button>
        <button 
          onClick={() => updateWater(250)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          250ml
        </button>
      </div>
    </div>
  );
};
