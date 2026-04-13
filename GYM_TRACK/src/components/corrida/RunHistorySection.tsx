
import React from 'react';
import { Trash2, MapPin, Timer, Zap, Heart, Star, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useApp } from '../../hooks/useApp';

export const RunHistorySection: React.FC = () => {
  const { runs, plannedRuns, deleteRun } = useApp();

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
      case 'easy': return 'Leve';
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

  const parsePace = (paceStr: string) => {
    if (!paceStr) return 0;
    const [min, sec] = paceStr.split(':').map(Number);
    return min * 60 + (sec || 0);
  };

  return (
    <section className="space-y-4 animate-in">
      {sortedRuns.map((run) => {
        const plan = plannedRuns.find(p => p.id === run.planned_id);
        const distDiff = plan ? run.distance - plan.distance : 0;
        
        const actualPaceSec = parsePace(run.pace);
        const plannedPaceSec = plan?.pace ? parsePace(plan.pace) : 0;
        const paceDiff = plannedPaceSec ? actualPaceSec - plannedPaceSec : 0;

        return (
          <div key={run.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden group">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/30">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{run.date}</span>
                  <span className={`mt-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider w-fit ${getTypeColor(run.type)}`}>
                    {getTypeLabel(run.type)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => run.id && handleDelete(run.id)}
                className="p-2 text-zinc-300 dark:text-zinc-700 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Actual Stats */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Realizado</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Distância</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">{run.distance}</span>
                      <span className="text-[10px] font-bold text-zinc-400">km</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Pace</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">{run.pace}</span>
                      <span className="text-[10px] font-bold text-zinc-400">/km</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Tempo</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">{run.duration}</span>
                      <span className="text-[10px] font-bold text-zinc-400">min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison / Planned */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    {plan ? 'Comparativo com Plano' : 'Sem Plano Vinculado'}
                  </h4>
                </div>
                
                {plan ? (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase mb-2">Meta de Distância</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">{plan.distance}km</span>
                        <div className={`flex items-center gap-1 text-[10px] font-bold ${distDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {distDiff > 0 ? <TrendingUp className="w-3 h-3" /> : distDiff < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {Math.abs(distDiff).toFixed(1)}km
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase mb-2">Meta de Pace</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">{plan.pace}/km</span>
                        <div className={`flex items-center gap-1 text-[10px] font-bold ${paceDiff <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {paceDiff < 0 ? <TrendingUp className="w-3 h-3" /> : paceDiff > 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {Math.abs(paceDiff)}s
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Treino Avulso</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Stats */}
            {(run.hr || run.rpe || run.notes) && (
              <div className="px-6 py-4 bg-zinc-50/30 dark:bg-zinc-800/10 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-6">
                {run.hr && (
                  <div className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{run.hr} bpm</span>
                  </div>
                )}
                {run.rpe && (
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">RPE {run.rpe}/10</span>
                  </div>
                )}
                {run.notes && (
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <Target className="w-3.5 h-3.5 text-blue-500" />
                    <p className="text-xs text-zinc-500 italic truncate">"{run.notes}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {sortedRuns.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Timer className="w-8 h-8 text-zinc-300" />
          </div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 mb-2">Sem histórico</h3>
          <p className="text-zinc-500 text-sm">Você ainda não registrou nenhuma corrida.</p>
        </div>
      )}
    </section>
  );
};
