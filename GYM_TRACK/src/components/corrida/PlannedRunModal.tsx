
import React, { useState, useEffect } from 'react';
import { useApp } from '../../hooks/useApp';
import { X, CheckCircle, Calendar, Clock, MapPin, AlignLeft, Repeat } from 'lucide-react';
import { PlannedRun } from '../../types';

interface PlannedRunModalProps {
  onClose: () => void;
  initialData?: PlannedRun | null;
}

export const PlannedRunModal: React.FC<PlannedRunModalProps> = ({ onClose, initialData }) => {
  const { addPlannedRun, addPlannedRuns, updatePlannedRun } = useApp();
  const [date, setDate] = useState(initialData?.date || new Date().toLocaleDateString('pt-BR'));
  const [type, setType] = useState<PlannedRun['type']>(initialData?.type || 'easy');
  const [distance, setDistance] = useState<string>(initialData?.distance.toString() || '5');
  const [pace, setPace] = useState(initialData?.pace || '05:00');
  const [intervals, setIntervals] = useState<string>(initialData?.intervals?.toString() || '1');
  const [notes, setNotes] = useState(initialData?.notes || '');
  
  // Replication state
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState(4);
  const [selectedDays, setSelectedDays] = useState<number[]>([]); // 0=Sun, 1=Mon, ...

  const daysOfWeek = [
    { id: 1, label: 'S' },
    { id: 2, label: 'T' },
    { id: 3, label: 'Q' },
    { id: 4, label: 'Q' },
    { id: 5, label: 'S' },
    { id: 6, label: 'S' },
    { id: 0, label: 'D' },
  ];

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parse = (v: string) => {
      const normalized = v.replace(',', '.');
      const parsed = parseFloat(normalized);
      return isNaN(parsed) ? 0 : parsed;
    };
    const distNum = parse(distance);
    const baseData = { 
      type, 
      distance: distNum, 
      pace, 
      intervals: type === 'intervals' ? (parseInt(intervals) || 1) : 1, 
      notes 
    };

    if (initialData?.id) {
      await updatePlannedRun(initialData.id, { ...baseData, date });
    } else if (isRepeating && selectedDays.length > 0) {
      const newRuns: Omit<PlannedRun, 'user_id' | 'id'>[] = [];
      const [d, m, y] = date.split('/').map(Number);
      const startDate = new Date(y, m - 1, d);

      for (let i = 0; i < repeatWeeks; i++) {
        selectedDays.forEach(dayId => {
          const currentRunDate = new Date(startDate);
          // Find the next occurrence of this dayId starting from startDate + i weeks
          const daysUntilNext = (dayId - startDate.getDay() + 7) % 7;
          currentRunDate.setDate(startDate.getDate() + daysUntilNext + (i * 7));
          
          // Only add if it's not the exact start date (which is already covered or will be)
          // Actually, let's just add all selected days for each week
          newRuns.push({
            ...baseData,
            date: currentRunDate.toLocaleDateString('pt-BR'),
            completed: false
          });
        });
      }
      
      // Remove duplicates if the start date was included in selectedDays
      const uniqueRuns = Array.from(new Set(newRuns.map(r => r.date)))
        .map(dateStr => newRuns.find(r => r.date === dateStr)!);

      await addPlannedRuns(uniqueRuns);
    } else {
      await addPlannedRun({ ...baseData, date });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-blue-600 text-white shrink-0">
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

        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
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
                  step="any"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pace Alvo (min/km)</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  value={pace}
                  onChange={(e) => setPace(e.target.value)}
                  placeholder="05:00"
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100" 
                />
              </div>
            </div>
          </div>

          {type === 'intervals' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Número de Intervalos</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="number" 
                  value={intervals}
                  onChange={(e) => setIntervals(e.target.value)}
                  required
                  min="1"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100" 
                />
              </div>
            </div>
          )}

          {!initialData?.id && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4">
              <button
                type="button"
                onClick={() => setIsRepeating(!isRepeating)}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-2">
                  <Repeat className={`w-4 h-4 ${isRepeating ? 'text-blue-600' : 'text-zinc-400'}`} />
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Repetir Treino</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isRepeating ? 'bg-blue-600' : 'bg-zinc-300'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isRepeating ? 'left-4.5' : 'left-0.5'}`}></div>
                </div>
              </button>

              {isRepeating && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Dias da Semana</p>
                    <div className="flex justify-between">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${selectedDays.includes(day.id) ? 'bg-blue-600 text-white' : 'bg-white dark:bg-zinc-700 text-zinc-400 border border-zinc-100 dark:border-zinc-600'}`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Repetir por quantas semanas?</p>
                    <input 
                      type="range" 
                      min="1" max="12" 
                      value={repeatWeeks}
                      onChange={(e) => setRepeatWeeks(parseInt(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                      <span>1 semana</span>
                      <span className="text-blue-600">{repeatWeeks} semanas</span>
                      <span>12 semanas</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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

          <div className="pt-4 flex gap-3 shrink-0">
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
