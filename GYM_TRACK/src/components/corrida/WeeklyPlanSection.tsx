
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
  Play,
  LayoutGrid,
  List
} from 'lucide-react';
import { PlannedRun } from '../../types';
import { PlannedRunModal } from './PlannedRunModal';
import { RunLogModal } from './RunLogModal';

export const WeeklyPlanSection: React.FC = () => {
  const { plannedRuns, deletePlannedRun } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
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

  // Monthly logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthYear = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  // Adjust first day to start on Monday (0=Mon, 6=Sun)
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  const monthDays = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    d.setDate(d.getDate() - adjustedFirstDay + i);
    return d;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const getPlannedRunsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return plannedRuns.filter(run => run.date === dateStr);
  };

  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setCurrentDate(d);
  };

  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'easy': return 'bg-green-500';
      case 'tempo': return 'bg-blue-500';
      case 'intervals': return 'bg-purple-500';
      case 'long': return 'bg-orange-500';
      case 'race': return 'bg-red-500';
      default: return 'bg-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation and Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-zinc-900 dark:text-zinc-100">Planejamento</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Organize sua jornada</p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-center">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'week' ? 'bg-white dark:bg-zinc-700 text-blue-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              <List className="w-4 h-4" />
              Semana
            </button>
            <button 
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'month' ? 'bg-white dark:bg-zinc-700 text-blue-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              Mês
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={prevPeriod} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <span className="text-xs font-black text-zinc-700 dark:text-zinc-300 min-w-[120px] text-center uppercase tracking-widest">
              {viewMode === 'week' ? (
                `${weekDays[0].getDate()} - ${weekDays[6].getDate()} ${weekDays[6].toLocaleString('pt-BR', { month: 'short' })}`
              ) : (
                monthYear
              )}
            </span>
            <button onClick={nextPeriod} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'week' ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day, idx) => {
            const runs = getPlannedRunsForDate(day);
            const isToday = formatDate(day) === formatDate(new Date());
            
            return (
              <div 
                key={idx} 
                className={`flex flex-col min-h-[180px] bg-white dark:bg-zinc-900 rounded-3xl border transition-all ${isToday ? 'border-blue-500 ring-1 ring-blue-500/20 shadow-lg shadow-blue-500/5' : 'border-zinc-100 dark:border-zinc-800 shadow-sm'}`}
              >
                <div className={`p-4 border-b flex items-center justify-between ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' : 'border-zinc-50 dark:border-zinc-800'}`}>
                  <div className="text-center">
                    <p className={`text-[10px] font-black uppercase tracking-wider ${isToday ? 'text-blue-600' : 'text-zinc-400'}`}>
                      {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </p>
                    <p className={`text-xl font-black ${isToday ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {day.getDate()}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingPlan({ date: formatDate(day), type: 'easy', distance: 5, pace: '05:00', intervals: 1 } as any);
                      setIsPlanModalOpen(true);
                    }}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-blue-600 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[250px] custom-scrollbar">
                  {runs.length === 0 ? (
                    <div className="h-full flex items-center justify-center opacity-10">
                      <MapPin className="w-10 h-10 text-zinc-400" />
                    </div>
                  ) : (
                    runs.map((run) => (
                      <div 
                        key={run.id}
                        className={`p-3 rounded-2xl border group relative transition-all ${run.completed ? 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800' : 'bg-blue-50/30 dark:bg-blue-900/5 border-blue-100/50 dark:border-blue-900/20'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              {run.completed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                              )}
                              <span className={`text-[9px] font-black uppercase tracking-wider truncate ${run.completed ? 'text-zinc-400' : 'text-blue-600'}`}>
                                {run.type === 'easy' ? 'Leve' : 
                                 run.type === 'tempo' ? 'Tempo' : 
                                 run.type === 'intervals' ? 'Intervalado' : 
                                 run.type === 'long' ? 'Longo' : 'Prova'}
                              </span>
                            </div>
                            <div className="text-sm font-black text-zinc-900 dark:text-zinc-100 mb-1">
                              {run.distance}km {run.intervals && run.intervals > 1 ? `(${run.intervals}x)` : ''}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold">
                              <Clock className="w-3 h-3" />
                              {run.pace || '05:00'} /km
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!run.completed && (
                              <button 
                                onClick={() => handleCompletePlan(run)}
                                className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                                title="Registrar Realizado"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleEditPlan(run)}
                              className="p-1.5 bg-white dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeletePlan(run.id!)}
                              className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="py-3 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50/50 dark:bg-zinc-800/30">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day, idx) => {
              const runs = getPlannedRunsForDate(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = formatDate(day) === formatDate(new Date());

              return (
                <div 
                  key={idx}
                  onClick={() => {
                    if (runs.length === 0) {
                      setEditingPlan({ date: formatDate(day), type: 'easy', distance: 5, pace: '05:00', intervals: 1 } as any);
                      setIsPlanModalOpen(true);
                    }
                  }}
                  className={`min-h-[100px] p-2 border-r border-b border-zinc-50 dark:border-zinc-800 transition-all cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30 ${!isCurrentMonth ? 'opacity-30' : ''} ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black ${isToday ? 'text-blue-600' : 'text-zinc-500'}`}>
                      {day.getDate()}
                    </span>
                    {isCurrentMonth && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPlan({ date: formatDate(day), type: 'easy', distance: 5, pace: '05:00', intervals: 1 } as any);
                          setIsPlanModalOpen(true);
                        }}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-blue-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {runs.map(run => (
                      <div 
                        key={run.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPlan(run);
                        }}
                        className={`px-1.5 py-0.5 rounded-md text-[8px] font-black text-white truncate flex items-center justify-between gap-1 group/item ${getTypeColor(run.type)}`}
                      >
                        <div className="flex items-center gap-1 overflow-hidden">
                          {run.completed && <CheckCircle2 className="w-2 h-2 shrink-0" />}
                          <span className="truncate">{run.distance}km</span>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlan(run.id!);
                            }}
                            className="p-0.5 hover:bg-black/20 rounded transition-colors"
                          >
                            <Trash2 className="w-2 h-2" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
