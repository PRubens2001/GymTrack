
import React, { useMemo } from 'react';
import { useApp } from '../../hooks/useApp';
import { Flame, Beef, Wheat, Droplets } from 'lucide-react';

export const DailySummary: React.FC = () => {
  const { meals, dietGoals } = useApp();
  const today = new Date().toLocaleDateString('pt-BR');

  const totals = useMemo(() => {
    const todayMeals = meals.filter(m => m.date === today);
    return todayMeals.reduce((acc, m) => ({
      kcal: acc.kcal + (Number(m.kcal) || 0),
      prot: acc.prot + (Number(m.prot) || 0),
      carb: acc.carb + (Number(m.carb) || 0),
      fat_total: acc.fat_total + (Number(m.fat_total) || 0),
      fat_sat: acc.fat_sat + (Number(m.fat_sat) || 0),
      fiber: acc.fiber + (Number(m.fiber) || 0)
    }), { kcal: 0, prot: 0, carb: 0, fat_total: 0, fat_sat: 0, fiber: 0 });
  }, [meals, today]);

  const stats = [
    { label: 'Calorias', value: totals.kcal, goal: dietGoals.kcal, unit: 'kcal', icon: Flame, color: 'text-orange-600', barColor: 'bg-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Proteínas', value: totals.prot, goal: dietGoals.prot, unit: 'g', icon: Beef, color: 'text-blue-600', barColor: 'bg-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Carbos', value: totals.carb, goal: dietGoals.carb, unit: 'g', icon: Wheat, color: 'text-amber-600', barColor: 'bg-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Gord. Total', value: totals.fat_total, goal: dietGoals.fat_total, unit: 'g', icon: Droplets, color: 'text-red-600', barColor: 'bg-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Gord. Sat.', value: totals.fat_sat, goal: dietGoals.fat_sat, unit: 'g', icon: Droplets, color: 'text-rose-600', barColor: 'bg-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Fibras', value: totals.fiber, goal: dietGoals.fiber, unit: 'g', icon: Wheat, color: 'text-emerald-600', barColor: 'bg-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 animate-in">
      {stats.map((stat) => {
        const goalValue = Number(stat.goal) || 1; // Avoid division by zero or NaN
        const percent = Math.min(100, (stat.value / goalValue) * 100);
        return (
          <div key={stat.label} className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className={`p-2 ${stat.bg} rounded-xl`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 leading-none">
                {stat.value >= 100 ? Math.round(stat.value) : stat.value.toFixed(1).replace(/\.0$/, '')}
                <span className="text-xs font-bold text-zinc-400 ml-1">{stat.unit}</span>
              </p>
              <p className="text-[10px] font-bold text-zinc-400 mt-1">Meta: {stat.goal}{stat.unit}</p>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${stat.barColor} transition-all duration-500`}
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
