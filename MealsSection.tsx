
import React, { useState } from 'react';
import { Calendar, Timer, MapPin, Activity, Heart, Star, CheckCircle } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { calculatePace } from '../../lib/utils';
import { RunRecord } from '../../types';

export const RunLogSection: React.FC = () => {
  const { addRun } = useApp();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<RunRecord['type']>('easy');
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hr, setHr] = useState(0);
  const [rpe, setRpe] = useState(0);
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (distance <= 0 || duration <= 0) {
      alert('Distância e duração devem ser maiores que zero.');
      return;
    }

    const pace = calculatePace(duration, distance);
    const success = await addRun({
      date: date.split('-').reverse().join('/'),
      type,
      distance,
      duration,
      hr: hr || undefined,
      rpe: rpe || undefined,
      notes: notes || undefined,
      pace
    });

    if (success) {
      alert('Corrida registrada com sucesso!');
      setDistance(0);
      setDuration(0);
      setHr(0);
      setRpe(0);
      setNotes('');
    }
  };

  return (
    <section className="space-y-6 animate-in">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Data
            </label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Tipo de Treino
            </label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100"
            >
              <option value="easy">Rodagem Leve</option>
              <option value="tempo">Tempo Run</option>
              <option value="intervals">Intervalado</option>
              <option value="long">Longão</option>
              <option value="race">Prova</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Distância (km)
            </label>
            <input 
              type="number" 
              step="0.01"
              value={distance || ''}
              onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100" 
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Timer className="w-3 h-3" /> Duração (minutos)
            </label>
            <input 
              type="number" 
              value={duration || ''}
              onChange={(e) => setDuration(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100" 
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Heart className="w-3 h-3" /> Frequência Média (bpm)
            </label>
            <input 
              type="number" 
              value={hr || ''}
              onChange={(e) => setHr(parseInt(e.target.value) || 0)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100" 
              placeholder="Opcional"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Star className="w-3 h-3" /> Esforço Percebido (1-10)
            </label>
            <input 
              type="number" 
              min="1" max="10"
              value={rpe || ''}
              onChange={(e) => setRpe(parseInt(e.target.value) || 0)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100" 
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Notas do Treino</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100 h-24 resize-none" 
            placeholder="Como foi o treino? Clima, sensação, percurso..."
          ></textarea>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Salvar Treino de Corrida
        </button>
      </div>
    </section>
  );
};
