
import React from 'react';
import { Trash2, MapPin, Timer, Zap, Heart, Star, Target } from 'lucide-react';
import { useApp } from '../../hooks/useApp';

export const RunHistorySection: React.FC = () => {
  const { runs, deleteRun } = useApp();

  const sortedRuns = [...runs].sort((a, b) => {
    const [d1, m1, y1] = a.date.split('/');
    const [d2, m2, y2] = b.date.split('/');
    return new Date(parseInt(y2), parseInt(m2)-1, parseInt(d2)).getTime() - 
           new Date(parseInt(y1), parseInt(m1)-1, parseInt(d1)).getTime();
  });

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente excluir esta corrida?')) {
      await deleteRun(id);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'easy': return 'Rodagem';
      case 'tempo': return 'Tempo Run';
      case 'intervals': return 'Intervalado';
      case 'long': return 'Longão';
      case 'race': return 'Prova';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'tempo': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'intervals': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'long': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'race': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  return (
    <section className="space-y-4 animate-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Data</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Distância</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tempo</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pace</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">HR/RPE</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {sortedRuns.map((run) => (
                <tr key={run.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{run.date}</p>
                      {run.planned_id && (
                        <Target className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getTypeColor(run.type)}`}>
                      {getTypeLabel(run.type)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{run.distance}km</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Timer className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{run.duration}min</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{run.pace}/km</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-3">
                      {run.hr && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500" />
                          <span className="text-xs font-bold text-zinc-500">{run.hr}</span>
                        </div>
                      )}
                      {run.rpe && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500" />
                          <span className="text-xs font-bold text-zinc-500">{run.rpe}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => run.id && handleDelete(run.id)}
                      className="p-2 text-zinc-300 dark:text-zinc-700 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {sortedRuns.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-400 italic text-sm">
                    Nenhuma corrida registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
