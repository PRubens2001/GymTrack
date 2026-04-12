
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useApp } from '../../hooks/useApp';
import { GROUP_COLORS } from '../../constants';
import { calculate1RM } from '../../lib/utils';
import { ChevronLeft, ChevronRight, TrendingUp, BarChart3 } from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  Filler
);

export const StatsSection: React.FC = () => {
  const { history, exercisesByGroup } = useApp();
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    if (selectedGroup && !exercisesByGroup[selectedGroup]?.includes(selectedExercise)) {
      setSelectedExercise(exercisesByGroup[selectedGroup]?.[0] || '');
    }
  }, [selectedGroup, exercisesByGroup, selectedExercise]);

  const progressionData = useMemo(() => {
    if (!selectedExercise) return null;
    
    const exerciseHistory = history
      .filter(h => h.exercise === selectedExercise)
      .sort((a, b) => {
        const [d1, m1, y1] = a.date.split('/');
        const [d2, m2, y2] = b.date.split('/');
        return new Date(parseInt(y1), parseInt(m1)-1, parseInt(d1)).getTime() - 
               new Date(parseInt(y2), parseInt(m2)-1, parseInt(d2)).getTime();
      });

    const labels = exerciseHistory.map(h => h.date);
    const oneRMs = exerciseHistory.map(h => Math.round(calculate1RM(h.weight, h.reps)));
    const weights = exerciseHistory.map(h => h.weight);

    return {
      labels,
      datasets: [
        {
          label: '1RM Estimado (kg)',
          data: oneRMs,
          borderColor: '#ea580c',
          backgroundColor: 'rgba(234, 88, 12, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Peso Real (kg)',
          data: weights,
          borderColor: '#71717a',
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 0,
          fill: false,
        }
      ]
    };
  }, [history, selectedExercise]);

  const weeklyVolumeData = useMemo(() => {
    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const volumeByDay = [0, 0, 0, 0, 0, 0, 0];
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    history.forEach(record => {
      const [d, m, y] = record.date.split('/');
      const recordDate = new Date(parseInt(y), parseInt(m)-1, parseInt(d));
      if (recordDate >= weekStart && recordDate < weekEnd) {
        const dayIdx = (recordDate.getDay() + 6) % 7; // Adjust to Mon-Sun
        volumeByDay[dayIdx] += record.weight * record.reps;
      }
    });

    return {
      labels,
      datasets: [{
        label: 'Volume Total (kg)',
        data: volumeByDay,
        backgroundColor: '#ea580c',
        borderRadius: 8,
        barThickness: 20,
      }]
    };
  }, [history, weekStart]);

  const changeWeek = (delta: number) => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + delta * 7);
    setWeekStart(newDate);
  };

  const isDark = document.documentElement.classList.contains('dark');
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: isDark ? '#18181b' : '#ffffff',
        titleColor: isDark ? '#f4f4f5' : '#18181b',
        bodyColor: isDark ? '#a1a1aa' : '#71717a',
        borderColor: isDark ? '#27272a' : '#e4e4e7',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: isDark ? '#27272a' : '#f4f4f5',
        },
        ticks: {
          color: '#a1a1aa',
          font: { size: 10 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#a1a1aa',
          font: { size: 10 }
        }
      }
    }
  };

  return (
    <section className="space-y-6 animate-in">
      {/* Progression Chart */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Progressão de Carga</h3>
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-bold outline-none dark:text-zinc-100"
            >
              <option value="">Grupo</option>
              {Object.keys(exercisesByGroup).sort().map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select 
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-bold outline-none dark:text-zinc-100"
            >
              <option value="">Exercício</option>
              {selectedGroup && exercisesByGroup[selectedGroup]?.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>
          </div>
        </div>

        <div className="h-[250px] w-full">
          {progressionData ? (
            <Line data={progressionData} options={chartOptions} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-2">
              <TrendingUp className="w-8 h-8 opacity-20" />
              <p className="text-xs font-medium">Selecione um exercício para ver o gráfico</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Volume Chart */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Volume Semanal</h3>
          </div>
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 p-1 rounded-lg">
            <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">
              {weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - {new Date(new Date(weekStart).setDate(weekStart.getDate() + 6)).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </span>
            <button onClick={() => changeWeek(1)} className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="h-[200px] w-full">
          <Bar 
            data={weeklyVolumeData} 
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: { ...chartOptions.scales.y, beginAtZero: true }
              }
            }} 
          />
        </div>
      </div>
    </section>
  );
};
