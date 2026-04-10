
import React, { useState, useMemo } from 'react';
import { useApp } from '../../hooks/useApp';
import { ChevronDown, ChevronUp, Flame, Droplets, Utensils } from 'lucide-react';

export const DietHistorySection: React.FC = () => {
  const { meals, waterHistory } = useApp();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const groupedHistory = useMemo(() => {
    const dates = new Set([...meals.map(m => m.date), ...waterHistory.map(w => w.date)]);
    const history = Array.from(dates).map(date => {
      const dayMeals = meals.filter(m => m.date === date);
      const dayWater = waterHistory.find(w => w.date === date);
      
      const totals = dayMeals.reduce((acc, m) => ({
        kcal: acc.kcal + m.kcal,
        prot: acc.prot + m.prot,
        carb: acc.carb + m.carb,
        fat: acc.fat + m.fat
      }), { kcal: 0, prot: 0, carb: 0, fat: 0 });

      return {
        date,
        meals: dayMeals,
        water: dayWater,
        totals
      };
    });

    return history.sort((a, b) => {
      const [d1, m1, y1] = a.date.split('/');
      const [d2, m2, y2] = b.date.split('/');
      return new Date(parseInt(y2), parseInt(m2)-1, parseInt(d2)).getTime() - 
             new Date(parseInt(y1), parseInt(m1)-1, parseInt(d1)).getTime();
    });
  }, [meals, waterHistory]);

  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) newExpanded.delete(date);
    else newExpanded.add(date);
    setExpandedDays(newExpanded);
  };

  return (
    <section className="space-y-4 animate-in">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Histórico de Alimentação</h2>
      
      <div className="space-y-3">
        {groupedHistory.map((day) => (
          <div key={day.date} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all">
            <button 
              onClick={() => toggleDay(day.date)}
              className="w-full p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <span className="text-xs font-bold text-zinc-500">{day.date.split('/')[0]}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{day.date}</p>
                    <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                      {day.meals.length} refeições
                    </p>
                  </div>
                </div>
                {expandedDays.has(day.date) ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{Math.round(day.totals.kcal)}<span className="text-[10px] font-bold text-zinc-400 ml-0.5">kcal</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{day.water?.current || 0}<span className="text-[10px] font-bold text-zinc-400 ml-0.5">ml</span></span>
                </div>
                <div className="hidden sm:flex items-center gap-4 border-l border-zinc-100 dark:border-zinc-800 pl-4">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">P: {Math.round(day.totals.prot)}g</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">C: {Math.round(day.totals.carb)}g</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">G: {Math.round(day.totals.fat)}g</span>
                </div>
              </div>
            </button>

            {expandedDays.has(day.date) && (
              <div className="border-t border-zinc-100 dark:border-zinc-800 p-2 space-y-1 bg-zinc-50/30 dark:bg-zinc-900/30 animate-in">
                {day.meals.map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-zinc-800 transition-all">
                    <div className="flex items-center gap-3">
                      <Utensils className="w-4 h-4 text-zinc-400" />
                      <div>
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{meal.name}</p>
                        <div className="flex gap-2 mt-0.5">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">P: {meal.prot}g</span>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">C: {meal.carb}g</span>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">G: {meal.fat}g</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">{meal.kcal}kcal</p>
                  </div>
                ))}
                {day.meals.length === 0 && (
                  <p className="p-3 text-xs text-zinc-400 italic text-center">Nenhuma refeição registrada.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
