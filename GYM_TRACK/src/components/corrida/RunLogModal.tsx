
import React, { useState } from 'react';
import { useApp } from '../../hooks/useApp';
import { X, CheckCircle, Clock, MapPin, Activity, Heart, AlignLeft } from 'lucide-react';
import { PlannedRun } from '../../types';

interface RunLogModalProps {
  onClose: () => void;
  plannedRun?: PlannedRun | null;
}

export const RunLogModal: React.FC<RunLogModalProps> = ({ onClose, plannedRun }) => {
  const { addRun, updatePlannedRun } = useApp();
  const [date, setDate] = useState(plannedRun?.date || new Date().toLocaleDateString('pt-BR'));
  const [type, setType] = useState<PlannedRun['type']>(plannedRun?.type || 'easy');
  const [distance, setDistance] = useState(plannedRun?.distance || 0);
  const [duration, setDuration] = useState(plannedRun?.duration || 0);
  const [hr, setHr] = useState<number | undefined>(undefined);
  const [rpe, setRpe] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');

  const calculatePace = (dist: number, dur: number) => {
    if (!dist || !dur) return '0:00';
    const totalSeconds = dur * 60;
    const secondsPerKm = totalSeconds / dist;
    const min = Math.floor(secondsPerKm / 60);
    const sec = Math.round(secondsPerKm % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const pace = calculatePace(distance, duration);
    
    const success = await addRun({
      date,
      type,
      distance,
      duration,
      hr,
      rpe,
      notes,
      pace,
      planned_id: plannedRun?.id
    });

    if (success && plannedRun?.id) {
      await updatePlannedRun(plannedRun.id, { completed: true });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-green-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Registrar Realizado</h3>
              {plannedRun && <p className="text-[10px] font-bold uppercase opacity-80">Vinculado ao plano de {plannedRun.date}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Data</label>
              <input 
                type="text" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Tipo</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100"
              >
                <option value="easy">Leve</option>
                <option value="tempo">Tempo</option>
                <option value="intervals">Intervalos</option>
                <option value="long">Longo</option>
                <option value="race">Prova</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Distância (km)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="number" 
                  step="0.01"
                  value={distance || ''}
                  onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
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
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">FC Média (bpm)</label>
              <div className="relative">
                <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="number" 
                  value={hr || ''}
                  onChange={(e) => setHr(parseInt(e.target.value) || undefined)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Esforço (RPE 1-10)</label>
              <input 
                type="number" 
                min="1"
                max="10"
                value={rpe || ''}
                onChange={(e) => setRpe(parseInt(e.target.value) || undefined)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Notas do Treino</label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-3 w-4 h-4 text-zinc-400" />
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Como você se sentiu? Alguma dor?"
                rows={3}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100 resize-none" 
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
              className="flex-1 py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Salvar Treino
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
