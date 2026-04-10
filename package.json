
import React, { useState } from 'react';
import { useApp } from '../../hooks/useApp';
import { X, CheckCircle } from 'lucide-react';

interface DietGoalsModalProps {
  onClose: () => void;
}

export const DietGoalsModal: React.FC<DietGoalsModalProps> = ({ onClose }) => {
  const { dietGoals, water, updateDietGoals } = useApp();
  const [kcal, setKcal] = useState(dietGoals.kcal);
  const [prot, setProt] = useState(dietGoals.prot);
  const [carb, setCarb] = useState(dietGoals.carb);
  const [fat, setFat] = useState(dietGoals.fat);
  const [waterGoal, setWaterGoal] = useState(water?.goal || 3000);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDietGoals({ kcal, prot, carb, fat, water_goal: waterGoal });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Configurar Metas</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Meta de Calorias (kcal)</label>
            <input 
              type="number" 
              value={kcal || ''}
              onChange={(e) => setKcal(parseFloat(e.target.value) || 0)}
              required
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Prot (g)</label>
              <input 
                type="number" 
                value={prot || ''}
                onChange={(e) => setProt(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Carb (g)</label>
              <input 
                type="number" 
                value={carb || ''}
                onChange={(e) => setCarb(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Fat (g)</label>
              <input 
                type="number" 
                value={fat || ''}
                onChange={(e) => setFat(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Meta de Água (ml)</label>
            <input 
              type="number" 
              value={waterGoal || ''}
              onChange={(e) => setWaterGoal(parseFloat(e.target.value) || 0)}
              required
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Salvar Metas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
