
import React, { useState, useMemo } from 'react';
import { useApp } from '../../hooks/useApp';
import { Plus, Trash2, Utensils, X, CheckCircle, Lightbulb, Sparkles } from 'lucide-react';
import { AiMealAssistantModal } from './AiMealAssistantModal';
import { MealAnalysis } from '../../lib/gemini';

export const MealsSection: React.FC = () => {
  const { meals, addMeal, deleteMeal } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = new Date().toLocaleDateString('pt-BR');

  const todayMeals = useMemo(() => {
    return meals.filter(m => m.date === today).sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [meals, today]);

  return (
    <section className="space-y-4 animate-in">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-green-600" />
          Refeições de Hoje
        </h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-2 bg-green-600 text-white rounded-lg shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95 flex items-center gap-2 text-sm font-bold"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      <div className="space-y-3">
        {todayMeals.map((meal) => (
          <div key={meal.id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between group animate-in">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{meal.name}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">P: {meal.prot}g</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">C: {meal.carb}g</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">GT: {meal.fat_total}g</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-rose-500/70">GS: {meal.fat_sat}g</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-emerald-500/70">F: {meal.fiber}g</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-base font-black text-zinc-900 dark:text-zinc-100">{meal.kcal}<span className="text-[10px] font-bold text-zinc-400 ml-0.5">kcal</span></p>
              <button 
                onClick={() => meal.id && deleteMeal(meal.id)}
                className="p-2 text-zinc-300 dark:text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {todayMeals.length === 0 && (
          <div className="py-12 text-center text-zinc-400 italic text-sm bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 border-dashed">
            Nenhuma refeição registrada hoje.
          </div>
        )}
      </div>

      {isModalOpen && (
        <AddMealModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={async (data) => {
            await addMeal(data);
            setIsModalOpen(false);
          }}
        />
      )}
    </section>
  );
};

interface AddMealModalProps {
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const AddMealModal: React.FC<AddMealModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [kcal, setKcal] = useState(0);
  const [prot, setProt] = useState(0);
  const [carb, setCarb] = useState(0);
  const [fatTotal, setFatTotal] = useState(0);
  const [fatSat, setFatSat] = useState(0);
  const [fiber, setFiber] = useState(0);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const handleApplyAi = (analysis: MealAnalysis) => {
    setKcal(analysis.kcal);
    setProt(analysis.prot);
    setCarb(analysis.carb);
    setFatTotal(analysis.fat_total);
    setFatSat(analysis.fat_sat);
    setFiber(analysis.fiber);
    setAiExplanation(analysis.explanation);
    setIsAiModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Nova Refeição</h3>
            <button 
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl hover:bg-amber-100 transition-all flex items-center gap-2"
              title="Assistente de IA"
            >
              <Lightbulb className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-widest">IA</span>
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ name, kcal, prot, carb, fat_total: fatTotal, fat_sat: fatSat, fiber });
          }}
          className="p-6 space-y-4"
        >
          {aiExplanation && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl animate-in">
              <div className="flex items-center gap-2 mb-1 text-amber-600">
                <Sparkles className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">Análise da IA</span>
              </div>
              <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed italic">{aiExplanation}</p>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nome da Refeição</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Almoço, Shake Pós-Treino..."
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Calorias (kcal)</label>
              <input 
                type="number" 
                value={kcal || ''}
                onChange={(e) => setKcal(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Proteínas (g)</label>
              <input 
                type="number" 
                value={prot || ''}
                onChange={(e) => setProt(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Carbos (g)</label>
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
              className="flex-1 py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95"
            >
              Salvar Refeição
            </button>
          </div>
        </form>
      </div>

      {isAiModalOpen && (
        <AiMealAssistantModal 
          onClose={() => setIsAiModalOpen(false)} 
          onApply={handleApplyAi}
        />
      )}
    </div>
  );
};
