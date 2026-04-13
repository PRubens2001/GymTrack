
import React, { useState } from 'react';
import { Calendar, PlusCircle, CheckCircle, Trash2, Plus, X, HelpCircle } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { calculate1RM, getHypertrophyZone } from '../../lib/utils';
import { GROUP_COLORS } from '../../constants';

interface WorkoutExercise {
  id: string;
  group: string;
  exercise: string;
  weight: string | number;
  reps: string | number;
  newExerciseName?: string;
}

interface WorkoutGroup {
  id: string;
  group: string;
  exercises: WorkoutExercise[];
}

export const WorkoutSection: React.FC = () => {
  const { exercisesByGroup, prs, addWorkoutRecords } = useApp();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [groups, setGroups] = useState<WorkoutGroup[]>([
    { id: Math.random().toString(36).substr(2, 9), group: '', exercises: [] }
  ]);

  const handleAddGroup = () => {
    setGroups([...groups, { id: Math.random().toString(36).substr(2, 9), group: '', exercises: [] }]);
  };

  const handleRemoveGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
  };

  const handleUpdateGroup = (groupId: string, groupName: string) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, group: groupName } : g));
  };

  const handleAddExercise = (groupId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          exercises: [
            ...g.exercises,
            { id: Math.random().toString(36).substr(2, 9), group: g.group, exercise: '', weight: 0, reps: 0 }
          ]
        };
      }
      return g;
    }));
  };

  const handleRemoveExercise = (groupId: string, exerciseId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return { ...g, exercises: g.exercises.filter(e => e.id !== exerciseId) };
      }
      return g;
    }));
  };

  const handleUpdateExercise = (groupId: string, exerciseId: string, updates: Partial<WorkoutExercise>) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          exercises: g.exercises.map(e => e.id === exerciseId ? { ...e, ...updates } : e)
        };
      }
      return g;
    }));
  };

  const handleFinishWorkout = async () => {
    const parseValue = (v: string | number) => {
      if (typeof v === 'number') return v;
      const normalized = v.replace(',', '.');
      const parsed = parseFloat(normalized);
      return isNaN(parsed) ? 0 : parsed;
    };

    const records = groups.flatMap(g => 
      g.exercises
        .filter(e => (e.exercise || e.newExerciseName) && parseValue(e.weight) > 0 && Number(e.reps) > 0)
        .map(e => ({
          group: g.group,
          exercise: e.exercise === 'new' ? e.newExerciseName! : e.exercise,
          weight: parseValue(e.weight),
          reps: Number(e.reps)
        }))
    );

    if (records.length === 0) {
      alert('Adicione pelo menos um exercício válido com peso e repetições.');
      return;
    }

    const success = await addWorkoutRecords(records, date.split('-').reverse().join('/'));
    if (success) {
      alert('Treino finalizado e salvo com sucesso!');
      setGroups([{ id: Math.random().toString(36).substr(2, 9), group: '', exercises: [] }]);
    }
  };

  return (
    <section className="space-y-6 animate-in">
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
            <Calendar className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 leading-none mb-1">Data do Treino</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 outline-none bg-transparent" 
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="group-card bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-6 relative animate-in">
            <button 
              onClick={() => handleRemoveGroup(group.id)}
              className="absolute top-4 right-4 text-zinc-300 dark:text-zinc-600 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div 
                className="w-1.5 h-12 rounded-full shrink-0 transition-colors"
                style={{ backgroundColor: GROUP_COLORS[group.group] || '#e4e4e7' }}
              />
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Grupo Muscular</label>
                <select 
                  value={group.group}
                  onChange={(e) => handleUpdateGroup(group.id, e.target.value)}
                  className="select-group w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-zinc-100"
                >
                  <option value="" disabled>Selecione o grupo</option>
                  {Object.keys(exercisesByGroup).sort().map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="exercises-container space-y-4">
              {group.exercises.map((exercise) => {
                const exercisePr = prs.find(p => p.exercise === exercise.exercise);
                const oneRM = exercisePr?.oneRM || calculate1RM(exercisePr?.pr || 0, exercisePr?.rep || 0);
                const zone = getHypertrophyZone(oneRM);

                return (
                  <div key={exercise.id} className="exercise-row bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-4 relative group/row">
                    <button 
                      onClick={() => handleRemoveExercise(group.id, exercise.id)}
                      className="absolute -top-2 -right-2 bg-white dark:bg-zinc-900 text-zinc-300 dark:text-zinc-600 hover:text-red-500 border border-zinc-200 dark:border-zinc-800 rounded-full p-1 shadow-sm opacity-0 group-hover/row:opacity-100 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Exercício</label>
                        <select 
                          value={exercise.exercise}
                          onChange={(e) => handleUpdateExercise(group.id, exercise.id, { exercise: e.target.value })}
                          className="select-exercise w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-zinc-100"
                        >
                          <option value="" disabled>Selecione o exercício</option>
                          {group.group && exercisesByGroup[group.group]?.map(ex => (
                            <option key={ex} value={ex}>{ex}</option>
                          ))}
                          <option value="new">+ Adicionar novo exercício</option>
                        </select>
                      </div>
                      {exercise.exercise === 'new' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nome do Novo Exercício</label>
                          <input 
                            type="text" 
                            value={exercise.newExerciseName || ''}
                            onChange={(e) => handleUpdateExercise(group.id, exercise.id, { newExerciseName: e.target.value })}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none dark:text-zinc-100" 
                            placeholder="Ex: Supino 45" 
                          />
                        </div>
                      )}
                    </div>

                    {exercise.exercise && (
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                        <div className="sm:col-span-2 flex gap-4 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                          <div className="flex-1">
                            <p className="text-[9px] font-bold uppercase text-zinc-400 leading-none mb-1">PR Atual</p>
                            <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                              {exercisePr?.pr || 0}<span className="text-[10px] font-medium ml-0.5 text-zinc-400">kg</span>
                            </p>
                          </div>
                          <div className="flex-1 border-l border-zinc-100 dark:border-zinc-800 pl-4">
                            <p className="text-[9px] font-bold uppercase text-zinc-400 leading-none mb-1">Reps PR</p>
                            <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                              {exercisePr?.rep || 0}
                            </p>
                          </div>
                          <div className="flex-1 border-l border-zinc-100 dark:border-zinc-800 pl-4">
                            <p className="text-[9px] font-bold uppercase text-zinc-400 leading-none mb-1">1RM Est.</p>
                            <p className="text-base font-bold text-orange-600 leading-none">
                              {Math.round(oneRM)}<span className="text-[10px] font-medium ml-0.5 text-zinc-400">kg</span>
                            </p>
                          </div>
                        </div>

                        <div className="sm:col-span-2 bg-orange-50 dark:bg-orange-900/10 p-2.5 rounded-lg border border-orange-100 dark:border-orange-900/20">
                          <p className="text-[9px] font-bold uppercase text-orange-600 dark:text-orange-400 leading-none mb-1">Zona de Hipertrofia (60-85%)</p>
                          <p className="text-sm font-bold text-orange-600 dark:text-orange-300 leading-none">
                            {Math.round(zone.min)} - {Math.round(zone.max)}<span className="text-[10px] font-medium ml-0.5 text-orange-500 dark:text-orange-400">kg</span>
                          </p>
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Peso (PA)</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              step="any"
                              value={exercise.weight}
                              onChange={(e) => handleUpdateExercise(group.id, exercise.id, { weight: e.target.value })}
                              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-zinc-100" 
                              placeholder="0" 
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px] font-medium">kg</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Reps (REPA)</label>
                            <div className="group relative">
                              <HelpCircle className="w-3 h-3 text-zinc-300 hover:text-orange-500 cursor-help transition-colors" />
                              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-zinc-900 dark:bg-zinc-800 text-[10px] text-white rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-zinc-800 dark:border-zinc-700">
                                Coloque aqui a sua melhor série desse exercício. Deve ser realizado entre 3 a 4 séries dentro da faixa mostrada acima.
                                <div className="absolute top-full right-2 -mt-1 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800"></div>
                              </div>
                            </div>
                          </div>
                          <input 
                            type="number" 
                            value={exercise.reps}
                            onChange={(e) => handleUpdateExercise(group.id, exercise.id, { reps: e.target.value })}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-zinc-100" 
                            placeholder="0" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => handleAddExercise(group.id)}
              className="w-full py-2 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 dark:text-zinc-600 text-sm font-medium hover:border-orange-200 dark:hover:border-orange-900 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Exercício
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <button 
          onClick={handleAddGroup}
          className="flex-1 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white py-3 px-6 rounded-xl font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Adicionar Grupo
        </button>
        <button 
          onClick={handleFinishWorkout}
          className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20"
        >
          <CheckCircle className="w-5 h-5" />
          Finalizar Treino
        </button>
      </div>
    </section>
  );
};
