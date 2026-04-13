
import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Trash2, Filter, Edit2, X, Calendar, Check, Search, ChevronRight } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { ExerciseRecord } from '../../types';
import { GROUP_COLORS } from '../../constants';
import { formatDateFromInput, formatDateToInput } from '../../lib/utils';

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const HistorySection: React.FC = () => {
  const { history, deleteHistoryRecord, updateHistoryRecord, exercisesByGroup } = useApp();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(10);
  const [editingRecord, setEditingRecord] = useState<ExerciseRecord | null>(null);
  
  // Filters
  const [dateFilter, setDateFilter] = useState<string[] | null>(null);
  const [groupFilter, setGroupFilter] = useState<string[] | null>(null);
  const [exerciseFilter, setExerciseFilter] = useState<string[] | null>(null);
  
  const [activeFilterTab, setActiveFilterTab] = useState<'date' | 'group' | 'exercise' | null>(null);

  const filteredHistory = useMemo(() => {
    return history.filter(record => {
      if (dateFilter && dateFilter.length > 0 && !dateFilter.includes(record.date)) return false;
      if (groupFilter && groupFilter.length > 0 && !groupFilter.includes(record.group)) return false;
      if (exerciseFilter && exerciseFilter.length > 0 && !exerciseFilter.includes(record.exercise)) return false;
      return true;
    });
  }, [history, dateFilter, groupFilter, exerciseFilter]);

  const groupedHistory = useMemo(() => {
    const groups: Record<string, ExerciseRecord[]> = {};
    filteredHistory.forEach(record => {
      if (!groups[record.date]) groups[record.date] = [];
      groups[record.date].push(record);
    });
    return Object.entries(groups).sort((a, b) => {
      const [d1, m1, y1] = a[0].split('/');
      const [d2, m2, y2] = b[0].split('/');
      return new Date(parseInt(y2), parseInt(m2) - 1, parseInt(d2)).getTime() - 
             new Date(parseInt(y1), parseInt(m1) - 1, parseInt(d1)).getTime();
    });
  }, [filteredHistory]);

  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) newExpanded.delete(date);
    else newExpanded.add(date);
    setExpandedDays(newExpanded);
  };

  const handleDelete = async (record: ExerciseRecord) => {
    if (confirm('Deseja realmente excluir este registro?')) {
      await deleteHistoryRecord(record);
    }
  };

  const uniqueDates = useMemo(() => [...new Set(history.map(h => h.date))].sort((a, b) => {
    const [d1, m1, y1] = a.split('/');
    const [d2, m2, y2] = b.split('/');
    return new Date(parseInt(y2), parseInt(m2) - 1, parseInt(d2)).getTime() - 
           new Date(parseInt(y1), parseInt(m1) - 1, parseInt(d1)).getTime();
  }), [history]);

  const dateHierarchy = useMemo(() => {
    const hierarchy: any = {};
    uniqueDates.forEach(date => {
      const [d, m, y] = date.split('/');
      const monthName = MONTH_NAMES[parseInt(m) - 1];
      if (!hierarchy[y]) hierarchy[y] = {};
      if (!hierarchy[y][monthName]) hierarchy[y][monthName] = [];
      hierarchy[y][monthName].push(d);
    });
    return hierarchy;
  }, [uniqueDates]);

  const uniqueGroups = useMemo(() => [...new Set(history.map(h => h.group))].sort(), [history]);
  const uniqueExercises = useMemo(() => [...new Set(history.map(h => h.exercise))].sort(), [history]);

  const toggleFilterValue = (current: string[] | null, value: string) => {
    const list = current ? [...current] : [];
    const index = list.indexOf(value);
    if (index > -1) list.splice(index, 1);
    else list.push(value);
    return list.length === 0 ? null : list;
  };

  return (
    <section className="space-y-4 animate-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Histórico de Treinos</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveFilterTab(activeFilterTab === 'date' ? null : 'date')}
            className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-2 text-xs font-bold ${activeFilterTab === 'date' || (dateFilter && dateFilter.length > 0) ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Data
          </button>
          <button 
            onClick={() => setActiveFilterTab(activeFilterTab === 'group' ? null : 'group')}
            className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-2 text-xs font-bold ${activeFilterTab === 'group' || (groupFilter && groupFilter.length > 0) ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
          >
            <Filter className="w-3.5 h-3.5" />
            Grupo
          </button>
          <button 
            onClick={() => setActiveFilterTab(activeFilterTab === 'exercise' ? null : 'exercise')}
            className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-2 text-xs font-bold ${activeFilterTab === 'exercise' || (exerciseFilter && exerciseFilter.length > 0) ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
          >
            <Search className="w-3.5 h-3.5" />
            Exercício
          </button>
        </div>
      </div>

      {activeFilterTab && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl animate-in relative z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Filtrar por {activeFilterTab === 'date' ? 'Data' : activeFilterTab === 'group' ? 'Grupo' : 'Exercício'}
            </h3>
            <button 
              onClick={() => {
                if (activeFilterTab === 'date') setDateFilter(null);
                if (activeFilterTab === 'group') setGroupFilter(null);
                if (activeFilterTab === 'exercise') setExerciseFilter(null);
              }}
              className="text-[10px] font-bold text-orange-600 hover:underline"
            >
              Limpar
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto no-scrollbar space-y-1">
            {activeFilterTab === 'date' && (
              <div className="space-y-2">
                {Object.entries(dateHierarchy).map(([year, months]: [string, any]) => (
                  <div key={year} className="space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1">
                      <ChevronRight className="w-3 h-3 text-zinc-400" />
                      <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">{year}</span>
                    </div>
                    {Object.entries(months).map(([month, days]: [string, any]) => (
                      <div key={month} className="ml-4 space-y-1">
                        <div className="flex items-center gap-2 px-2 py-1">
                          <ChevronRight className="w-3 h-3 text-zinc-400" />
                          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{month}</span>
                        </div>
                        <div className="ml-4 grid grid-cols-4 gap-1">
                          {days.map((day: string) => {
                            const fullDate = `${day}/${(MONTH_NAMES.indexOf(month) + 1).toString().padStart(2, '0')}/${year}`;
                            const isSelected = dateFilter?.includes(fullDate);
                            return (
                              <button
                                key={fullDate}
                                onClick={() => setDateFilter(toggleFilterValue(dateFilter, fullDate))}
                                className={`flex items-center justify-center p-2 rounded-lg text-[10px] font-bold transition-all ${isSelected ? 'bg-orange-600 text-white' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {activeFilterTab === 'group' && uniqueGroups.map(group => (
              <button
                key={group}
                onClick={() => setGroupFilter(toggleFilterValue(groupFilter, group))}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${groupFilter?.includes(group) ? 'bg-orange-600 border-orange-600' : 'border-zinc-300 dark:border-zinc-700'}`}>
                    {groupFilter?.includes(group) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm font-bold ${groupFilter?.includes(group) ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>{group}</span>
                </div>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GROUP_COLORS[group] }}></div>
              </button>
            ))}

            {activeFilterTab === 'exercise' && uniqueExercises.map(ex => (
              <button
                key={ex}
                onClick={() => setExerciseFilter(toggleFilterValue(exerciseFilter, ex))}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${exerciseFilter?.includes(ex) ? 'bg-orange-600 border-orange-600' : 'border-zinc-300 dark:border-zinc-700'}`}>
                  {exerciseFilter?.includes(ex) && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm font-bold ${exerciseFilter?.includes(ex) ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>{ex}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button 
              onClick={() => setActiveFilterTab(null)}
              className="px-6 py-2 bg-orange-600 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-lg shadow-orange-600/20 active:scale-95 transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {groupedHistory.slice(0, limit).map(([date, records]) => (
          <div key={date} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all">
            <button 
              onClick={() => toggleDay(date)}
              className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <span className="text-xs font-bold text-zinc-500">{date.split('/')[0]}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{date}</p>
                  <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                    {records.length} {records.length === 1 ? 'exercício' : 'exercícios'}
                  </p>
                </div>
              </div>
              {expandedDays.has(date) ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
            </button>

            {expandedDays.has(date) && (
              <div className="border-t border-zinc-100 dark:border-zinc-800 p-2 space-y-1 animate-in">
                {records.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-1.5 h-8 rounded-full" 
                        style={{ backgroundColor: GROUP_COLORS[record.group] || '#71717a' }}
                      ></div>
                      <div>
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{record.exercise}</p>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{record.group}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">{record.weight}kg</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{record.reps} reps</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingRecord(record)}
                          className="p-2 text-zinc-300 dark:text-zinc-700 hover:text-orange-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(record)}
                          className="p-2 text-zinc-300 dark:text-zinc-700 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {groupedHistory.length > limit && (
        <button 
          onClick={() => setLimit(limit + 10)}
          className="w-full py-4 text-sm font-bold text-zinc-500 hover:text-orange-600 transition-colors"
        >
          Carregar mais histórico...
        </button>
      )}

      {editingRecord && (
        <EditHistoryModal 
          record={editingRecord} 
          onClose={() => setEditingRecord(null)} 
          onSave={async (data) => {
            if (editingRecord.id) await updateHistoryRecord(editingRecord.id, data);
            setEditingRecord(null);
          }}
          onDelete={async () => {
            if (confirm('Deseja realmente excluir este registro?')) {
              await deleteHistoryRecord(editingRecord);
              setEditingRecord(null);
            }
          }}
          exercisesByGroup={exercisesByGroup}
        />
      )}
    </section>
  );
};

interface EditHistoryModalProps {
  record: ExerciseRecord;
  onClose: () => void;
  onSave: (data: Partial<ExerciseRecord>) => Promise<void>;
  onDelete: () => Promise<void>;
  exercisesByGroup: Record<string, string[]>;
}

const EditHistoryModal: React.FC<EditHistoryModalProps> = ({ record, onClose, onSave, onDelete, exercisesByGroup }) => {
  const [group, setGroup] = useState(record.group);
  const [exercise, setExercise] = useState(record.exercise);
  const [weight, setWeight] = useState(record.weight);
  const [reps, setReps] = useState(record.reps);
  const [date, setDate] = useState(formatDateToInput(record.date));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Editar Histórico</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ 
              group, 
              exercise, 
              weight, 
              reps, 
              date: formatDateFromInput(date) 
            });
          }}
          className="p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Grupo Muscular</label>
            <select 
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100"
            >
              {Object.keys(exercisesByGroup).sort().map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Exercício</label>
            <select 
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100"
            >
              {exercisesByGroup[group]?.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Peso (kg)</label>
              <input 
                type="number" 
                value={weight || ''}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Repetições</label>
              <input 
                type="number" 
                value={reps || ''}
                onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Data da Execução</label>
            <div className="relative">
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100" 
              />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="submit" 
              className="flex-1 py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
            >
              Salvar Alterações
            </button>
            <button 
              type="button" 
              onClick={onDelete}
              className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
