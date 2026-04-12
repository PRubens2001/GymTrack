
import React, { useState } from 'react';
import { useApp } from '../../hooks/useApp';
import { X, CheckCircle, Sparkles } from 'lucide-react';
import { AiDietGoalsAssistantModal } from './AiDietGoalsAssistantModal';
import { DietGoalsAnalysis } from '../../lib/gemini';

interface DietGoalsModalProps {
  onClose: () => void;
}

export const DietGoalsModal: React.FC<DietGoalsModalProps> = ({ onClose }) => {
  const { dietGoals, water, updateDietGoals } = useApp();
  const [kcal, setKcal] = useState(dietGoals.kcal);
  const [prot, setProt] = useState(dietGoals.prot);
  const [carb, setCarb] = useState(dietGoals.carb);
  const [fatTotal, setFatTotal] = useState(dietGoals.fat_total);
  const [fatSat, setFatSat] = useState(dietGoals.fat_sat);
  const [fiber, setFiber] = useState(dietGoals.fiber);
  const [waterGoal, setWaterGoal] = useState(water?.goal || 3000);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleApplyAi = (analysis: DietGoalsAnalysis) => {
    setKcal(analysis.kcal);
    setProt(analysis.prot);
    setCarb(analysis.carb);
    setFatTotal(analysis.fat_total);
    setFatSat(analysis.fat_sat);
    setFiber(analysis.fiber);
    setWaterGoal(analysis.water_goal);
    setIsAiModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDietGoals({ kcal, prot, carb, fat_total: fatTotal, fat_sat: fatSat, fiber, water_goal: waterGoal });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Configurar Metas</h3>
            <button 
              onClick={() => setIsAiModalOpen(true)}
              className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-all group"
              title="Assistente de Metas IA"
            >
              <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
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
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Gord. Total (g)</label>
              <input 
                type="number" 
                value={fatTotal || ''}
                onChange={(e) => setFatTotal(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Gord. Sat. (g)</label>
              <input 
                type="number" 
                value={fatSat || ''}
                onChange={(e) => setFatSat(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Fibras (g)</label>
              <input 
                type="number" 
                value={fiber || ''}
                onChange={(e) => setFiber(parseFloat(e.target.value) || 0)}
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

      {isAiModalOpen && (
        <AiDietGoalsAssistantModal 
          onClose={() => setIsAiModalOpen(false)}
          onApply={handleApplyAi}
        />
      )}
    </div>
  );
};
