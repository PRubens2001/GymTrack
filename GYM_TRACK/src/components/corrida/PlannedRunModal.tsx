
import React, { useState, useEffect } from 'react';
import { useApp } from '../../hooks/useApp';
import { X, CheckCircle, Calendar, Clock, MapPin, AlignLeft } from 'lucide-react';
import { PlannedRun } from '../../types';

interface PlannedRunModalProps {
  onClose: () => void;
  initialData?: PlannedRun | null;
}

export const PlannedRunModal: React.FC<PlannedRunModalProps> = ({ onClose, initialData }) => {
  const { addPlannedRun, updatePlannedRun } = useApp();
  const [date, setDate] = useState(initialData?.date || new Date().toLocaleDateString('pt-BR'));
  const [type, setType] = useState<PlannedRun['type']>(initialData?.type || 'easy');
  const [distance, setDistance] = useState(initialData?.distance || 5);
  const [duration, setDuration] = useState(initialData?.duration || 30);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { date, type, distance, duration, notes };
    
    if (initialData?.id) {
      await updatePlannedRun(initialData.id, data);
    } else {
      await addPlannedRun(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-blue-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold">{initialData?.id ? 'Editar Plano' : 'Planejar Treino'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Data do Treino</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="DD/MM/AAAA"
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Tipo de Treino</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'easy', label: 'Leve' },
                { id: 'tempo', label: 'Tempo' },
                { id: 'intervals', label: 'Intervalos' },
                { id: 'long', label: 'Longo' },
                { id: 'race', label: 'Prova' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as any)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${type === t.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Distância (km)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="number" 
                  step="0.1"
                  value={distance || ''}
                  onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Duração (min)</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="number" 
                  value={duration || ''}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Notas / Objetivo</label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-3 w-4 h-4 text-zinc-400" />
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Focar em manter o pace constante..."
                rows={3}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100 resize-none" 
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Salvar Plano
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
