
import React, { useState } from 'react';
import { useApp } from '../../hooks/useApp';
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Circle,
  MoreVertical,
  Trash2,
  Edit2,
  Play
} from 'lucide-react';
import { PlannedRun } from '../../types';
import { PlannedRunModal } from './PlannedRunModal';
import { RunLogModal } from './RunLogModal';

export const WeeklyPlanSection: React.FC = () => {
  const { plannedRuns, deletePlannedRun } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlannedRun | null>(null);
  const [editingPlan, setEditingPlan] = useState<PlannedRun | null>(null);

  // Get start of week (Monday)
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const getPlannedRunsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return plannedRuns.filter(run => run.date === dateStr);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const handleCompletePlan = (plan: PlannedRun) => {
    setSelectedPlan(plan);
    setIsLogModalOpen(true);
  };

  const handleEditPlan = (plan: PlannedRun) => {
    setEditingPlan(plan);
    setIsPlanModalOpen(true);
  };

  const handleDeletePlan = async (id: number) => {
    if (confirm('Deseja excluir este planejamento?')) {
      await deletePlannedRun(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Planejamento Semanal</h3>
            <p className="text-xs text-zinc-500">Organize seus treinos para a semana.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 min-w-[140px] text-center">
            {weekDays[0].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
          </span>
          <button onClick={nextWeek} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, idx) => {
          const runs = getPlannedRunsForDate(day);
          const isToday = formatDate(day) === formatDate(new Date());
          
          return (
            <div 
              key={idx} 
              className={`flex flex-col min-h-[160px] bg-white dark:bg-zinc-900 rounded-2xl border transition-all ${isToday ? 'border-blue-500 ring-1 ring-blue-500/20 shadow-lg shadow-blue-500/5' : 'border-zinc-100 dark:border-zinc-800 shadow-sm'}`}
            >
              <div className={`p-3 border-b flex items-center justify-between ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' : 'border-zinc-50 dark:border-zinc-800'}`}>
                <div className="text-center">
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isToday ? 'text-blue-600' : 'text-zinc-400'}`}>
                    {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </p>
                  <p className={`text-lg font-black ${isToday ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {day.getDate()}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setEditingPlan({ date: formatDate(day), type: 'easy', distance: 5, duration: 30 } as any);
                    setIsPlanModalOpen(true);
                  }}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-blue-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[200px] custom-scrollbar">
                {runs.length === 0 ? (
                  <div className="h-full flex items-center justify-center opacity-20">
                    <MapPin className="w-8 h-8 text-zinc-400" />
                  </div>
                ) : (
                  runs.map((run) => (
                    <div 
                      key={run.id}
                      className={`p-2 rounded-xl border group relative transition-all ${run.completed ? 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800' : 'bg-blue-50/30 dark:bg-blue-900/5 border-blue-100/50 dark:border-blue-900/20'}`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            {run.completed ? (
                              <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="w-3 h-3 text-blue-400 flex-shrink-0" />
                            )}
                            <span className={`text-[10px] font-bold uppercase truncate ${run.completed ? 'text-zinc-400' : 'text-blue-600'}`}>
                              {run.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-black text-zinc-900 dark:text-zinc-100">
                            {run.distance}km
                          </div>
                          <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-medium">
                            <Clock className="w-2.5 h-2.5" />
                            {run.duration} min
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!run.completed && (
                            <button 
                              onClick={() => handleCompletePlan(run)}
                              className="p-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                              title="Registrar Realizado"
                            >
                              <Play className="w-3 h-3" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleEditPlan(run)}
                            className="p-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDeletePlan(run.id!)}
                            className="p-1 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isPlanModalOpen && (
        <PlannedRunModal 
          onClose={() => {
            setIsPlanModalOpen(false);
            setEditingPlan(null);
          }}
          initialData={editingPlan}
        />
      )}

      {isLogModalOpen && selectedPlan && (
        <RunLogModal 
          onClose={() => {
            setIsLogModalOpen(false);
            setSelectedPlan(null);
          }}
          plannedRun={selectedPlan}
        />
      )}
    </div>
  );
};
