
import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Trophy, Library, Zap, Target, Info, X } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { PersonalRecord } from '../../types';
import { GROUP_COLORS } from '../../constants';
import { calculate1RM, getHypertrophyZone } from '../../lib/utils';
import { GallerySection } from './GallerySection';

export const PRsSection: React.FC = () => {
  const { prs, deletePr, addPr, updatePr } = useApp();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPr, setEditingPr] = useState<PersonalRecord | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const groupedPrs = useMemo(() => {
    const groups: Record<string, PersonalRecord[]> = {};
    prs.forEach(pr => {
      if (!groups[pr.group]) groups[pr.group] = [];
      groups[pr.group].push(pr);
    });
    return Object.entries(groups).sort();
  }, [prs]);

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) newExpanded.delete(group);
    else newExpanded.add(group);
    setExpandedGroups(newExpanded);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente excluir este recorde?')) {
      await deletePr(id);
    }
  };

  const handleOpenModal = (pr?: PersonalRecord) => {
    setEditingPr(pr || null);
    setIsModalOpen(true);
  };

  return (
    <section className="space-y-6 animate-in">
      {/* Performance Guide & Ideal Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-zinc-900 dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-32 h-32 text-orange-600" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-orange-500">
              <Zap className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Guia de Performance</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">Metodologia 1RM & Hipertrofia</h3>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
              O <span className="text-white font-bold">1RM</span> é o seu "padrão ouro" de força. Estimamos sua carga máxima para uma repetição perfeita usando a fórmula de <span className="text-white font-bold">Brzycki</span>. Acompanhar essa métrica permite que você treine com a intensidade exata necessária para evoluir sem estagnar.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-full border border-zinc-700">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Zona Alvo: 60-85%</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-600 p-6 rounded-3xl shadow-xl shadow-orange-600/20 relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Volume Ideal</h3>
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-orange-100">Séries</span>
                <span className="text-lg font-black text-white">3 - 5</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-orange-100">Reps (Hipertrofia)</span>
                <span className="text-lg font-black text-white">8 - 12</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-orange-100">Reps (Força)</span>
                <span className="text-lg font-black text-white">1 - 6</span>
              </div>
            </div>
            <p className="text-[9px] font-bold text-orange-100 italic mt-6">Frequência sugerida: 2x por semana/grupo.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Recordes Pessoais (PR)</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsGalleryOpen(true)}
            className="flex-1 sm:flex-none p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:text-orange-600 transition-all flex items-center justify-center gap-2 text-sm font-bold"
          >
            <Library className="w-4 h-4" />
            Galeria
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none p-2 bg-orange-600 text-white rounded-lg shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            Novo PR
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {groupedPrs.map(([group, records]) => (
          <div key={group} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all">
            <button 
              onClick={() => toggleGroup(group)}
              className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: GROUP_COLORS[group] || '#71717a', boxShadow: `0 4px 12px ${GROUP_COLORS[group]}33` }}
                >
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{group}</p>
                  <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                    {records.length} {records.length === 1 ? 'exercício' : 'exercícios'}
                  </p>
                </div>
              </div>
              {expandedGroups.has(group) ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
            </button>

            {expandedGroups.has(group) && (
              <div className="border-t border-zinc-100 dark:border-zinc-800 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                      <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Exercício</th>
                      <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Peso</th>
                      <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Reps</th>
                      <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">1RM Est.</th>
                      <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Zona Hipertrofia</th>
                      <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Data</th>
                      <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {records.map((record) => {
                      const oneRM = record.oneRM || calculate1RM(record.pr, record.rep);
                      const zone = getHypertrophyZone(oneRM);
                      return (
                        <tr key={record.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                          <td className="px-4 py-4 text-sm font-bold text-zinc-800 dark:text-zinc-200">{record.exercise}</td>
                          <td className="px-4 py-4 text-sm font-black text-zinc-900 dark:text-zinc-100 text-center">{record.pr}kg</td>
                          <td className="px-4 py-4 text-sm font-bold text-zinc-500 text-center">{record.rep}</td>
                          <td className="px-4 py-4 text-sm font-black text-orange-600 text-center">{Math.round(oneRM)}kg</td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                              {Math.round(zone.min)} - {Math.round(zone.max)}kg
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs font-medium text-zinc-400 text-center">{record.date}</td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => handleOpenModal(record)}
                                className="p-2 text-zinc-300 dark:text-zinc-700 hover:text-orange-600 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => record.id && handleDelete(record.id)}
                                className="p-2 text-zinc-300 dark:text-zinc-700 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <PrModal 
          pr={editingPr} 
          onClose={() => setIsModalOpen(false)} 
          onSave={async (data) => {
            if (editingPr?.id) await updatePr(editingPr.id, data);
            else await addPr(data as any);
            setIsModalOpen(false);
          }}
          onDelete={async () => {
            if (editingPr?.id) {
              if (confirm('Deseja realmente excluir este recorde?')) {
                await deletePr(editingPr.id);
                setIsModalOpen(false);
              }
            }
          }}
        />
      )}

      {isGalleryOpen && <GallerySection onClose={() => setIsGalleryOpen(false)} />}
    </section>
  );
};

interface PrModalProps {
  pr: PersonalRecord | null;
  onClose: () => void;
  onSave: (data: Partial<PersonalRecord>) => Promise<void>;
  onDelete: () => Promise<void>;
}

const PrModal: React.FC<PrModalProps> = ({ pr, onClose, onSave, onDelete }) => {
  const { exercisesByGroup } = useApp();
  const [group, setGroup] = useState(pr?.group || '');
  const [exercise, setExercise] = useState(pr?.exercise || '');
  const [weight, setWeight] = useState(pr?.pr || 0);
  const [reps, setReps] = useState(pr?.rep || 0);
  const [date, setDate] = useState(pr?.date || new Date().toLocaleDateString('pt-BR'));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {pr ? 'Editar Recorde' : 'Novo Recorde'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ group, exercise, pr: weight, rep: reps, date });
          }}
          className="p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Grupo</label>
              <select 
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100"
              >
                <option value="" disabled>Selecione</option>
                {Object.keys(exercisesByGroup).sort().map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Exercício</label>
              <select 
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100"
              >
                <option value="" disabled>Selecione</option>
                {group && exercisesByGroup[group]?.map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Peso (kg)</label>
              <input 
                type="number" 
                value={weight || ''}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Repetições</label>
              <input 
                type="number" 
                value={reps || ''}
                onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Data</label>
            <input 
              type="text" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              placeholder="DD/MM/AAAA"
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100" 
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="submit" 
              className="flex-1 py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
            >
              Salvar PR
            </button>
            {pr && (
              <button 
                type="button" 
                onClick={onDelete}
                className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
