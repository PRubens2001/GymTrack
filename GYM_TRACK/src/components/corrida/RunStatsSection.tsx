
import React, { useMemo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useApp } from '../../hooks/useApp';
import { MapPin, Zap, Timer, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
);

export const RunStatsSection: React.FC = () => {
  const { runs } = useApp();

  const stats = useMemo(() => {
    const totalKm = runs.reduce((acc, run) => acc + run.distance, 0);
    const totalMin = runs.reduce((acc, run) => acc + run.duration, 0);
    
    // Average pace
    let avgPace = "0:00";
    if (totalKm > 0) {
      const totalSeconds = (totalMin * 60) / totalKm;
      const m = Math.floor(totalSeconds / 60);
      const s = Math.round(totalSeconds % 60);
      avgPace = `${m}:${s.toString().padStart(2, '0')}`;
    }

    return { totalKm, totalMin, avgPace };
  }, [runs]);

  const chartData = useMemo(() => {
    const sortedRuns = [...runs].sort((a, b) => {
      const [d1, m1, y1] = a.date.split('/');
      const [d2, m2, y2] = b.date.split('/');
      return new Date(parseInt(y1), parseInt(m1)-1, parseInt(d1)).getTime() - 
             new Date(parseInt(y2), parseInt(m2)-1, parseInt(d2)).getTime();
    });

    const last10 = sortedRuns.slice(-10);
    const labels = last10.map(r => r.date.split('/')[0] + '/' + r.date.split('/')[1]);
    const distances = last10.map(r => r.distance);

    return {
      labels,
      datasets: [
        {
          label: 'Distância (km)',
          data: distances,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
        }
      ]
    };
  }, [runs]);

  const isDark = document.documentElement.classList.contains('dark');
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#18181b' : '#ffffff',
        titleColor: isDark ? '#f4f4f5' : '#18181b',
        bodyColor: isDark ? '#a1a1aa' : '#71717a',
        borderColor: isDark ? '#27272a' : '#e4e4e7',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: isDark ? '#27272a' : '#f4f4f5' },
        ticks: { color: '#a1a1aa', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#a1a1aa', font: { size: 10 } }
      }
    }
  };

  return (
    <section className="space-y-6 animate-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total KM</p>
          </div>
          <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{stats.totalKm.toFixed(1)}<span className="text-sm font-bold text-zinc-400 ml-1">km</span></p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
              <Zap className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pace Médio</p>
          </div>
          <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{stats.avgPace}<span className="text-sm font-bold text-zinc-400 ml-1">/km</span></p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <Timer className="w-4 h-4 text-zinc-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tempo Total</p>
          </div>
          <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{stats.totalMin}<span className="text-sm font-bold text-zinc-400 ml-1">min</span></p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Volume de Corrida (Últimos 10 treinos)</h3>
        </div>
        <div className="h-[250px] w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </section>
  );
};
