
import React, { useState } from 'react';
import { X, Plus, Trash2, Search, Dumbbell } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { GROUP_COLORS } from '../../constants';

interface GallerySectionProps {
  onClose: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onClose }) => {
  const { exercisesByGroup, saveExercises } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newExerciseNames, setNewExerciseNames] = useState<Record<string, string>>({});

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    if (exercisesByGroup[newGroupName]) {
      alert('Este grupo já existe!');
      return;
    }
    const updated = { ...exercisesByGroup, [newGroupName]: [] };
    await saveExercises(updated);
    setNewGroupName('');
  };

  const handleRemoveGroup = async (group: string) => {
    if (confirm(`Deseja realmente excluir o grupo "${group}" e todos os seus exercícios?`)) {
      const updated = { ...exercisesByGroup };
      delete updated[group];
      await saveExercises(updated);
    }
  };

  const handleAddExercise = async (group: string) => {
    const name = newExerciseNames[group];
    if (!name?.trim()) return;
    if (exercisesByGroup[group].includes(name)) {
      alert('Este exercício já existe neste grupo!');
      return;
    }
    const updated = { ...exercisesByGroup, [group]: [...exercisesByGroup[group], name] };
    await saveExercises(updated);
    setNewExerciseNames({ ...newExerciseNames, [group]: '' });
  };

  const handleRemoveExercise = async (group: string, exercise: string) => {
    if (confirm(`Deseja excluir o exercício "${exercise}"?`)) {
      const updated = { ...exercisesByGroup, [group]: exercisesByGroup[group].filter(e => e !== exercise) };
      await saveExercises(updated);
    }
  };

  const filteredGroups = Object.entries(exercisesByGroup)
    .filter(([group, exercises]) => {
      const matchesGroup = group.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesExercise = exercises.some(ex => ex.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesGroup || matchesExercise;
    })
    .sort();

  return (
    <div className="fixed inset-0 bg-zinc-50 dark:bg-zinc-950 z-[200] flex flex-col animate-in">
      <header className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-orange-600 rounded-xl text-white shadow-lg shadow-orange-600/20">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Galeria de Exercícios</h2>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Gerencie sua base de dados</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all active:scale-90">
          <X className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Search and Add Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Buscar grupo ou exercício..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all dark:text-zinc-100"
              />
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Novo grupo..." 
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="flex-1 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all dark:text-zinc-100"
              />
              <button 
                onClick={handleAddGroup}
                className="p-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-95"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Groups List */}
          <div className="space-y-6">
            {filteredGroups.map(([group, exercises]) => (
              <div key={group} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden animate-in">
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: GROUP_COLORS[group] || '#71717a' }}
                    ></div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{group}</h3>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      {exercises.length} itens
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemoveGroup(group)}
                    className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Novo exercício..." 
                      value={newExerciseNames[group] || ''}
                      onChange={(e) => setNewExerciseNames({ ...newExerciseNames, [group]: e.target.value })}
                      className="flex-1 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all dark:text-zinc-100"
                    />
                    <button 
                      onClick={() => handleAddExercise(group)}
                      className="p-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {exercises
                      .filter(ex => ex.toLowerCase().includes(searchTerm.toLowerCase()))
                      .sort()
                      .map(ex => (
                        <div key={ex} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl group/item border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{ex}</span>
                          <button 
                            onClick={() => handleRemoveExercise(group, ex)}
                            className="p-1 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
