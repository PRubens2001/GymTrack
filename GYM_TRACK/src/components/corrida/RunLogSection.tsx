
import React, { useState } from 'react';
import { Calendar, Timer, MapPin, Activity, Heart, Star, CheckCircle, List, ArrowRight, Info } from 'lucide-react';
import { useApp } from '../../hooks/useApp';
import { calculatePace } from '../../lib/utils';
import { RunRecord, PlannedRun } from '../../types';

export const RunLogSection: React.FC = () => {
  const { addRun, plannedRuns, updatePlannedRun } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<PlannedRun | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hr, setHr] = useState(0);
  const [rpe, setRpe] = useState(0);
  const [notes, setNotes] = useState('');

  // Filter only uncompleted planned runs
  const pendingPlans = plannedRuns.filter(p => !p.completed).sort((a, b) => {
    const dateA = a.date.split('/').reverse().join('-');
    const dateB = b.date.split('/').reverse().join('-');
    return dateA.localeCompare(dateB);
  });

  const handleSelectPlan = (plan: PlannedRun) => {
    setSelectedPlan(plan);
    // Pre-fill date if possible (assuming plan.date is DD/MM/YYYY)
    const [d, m, y] = plan.date.split('/');
    setDate(`${y}-${m}-${d}`);
    setDistance(plan.distance);
  };

  const handleSave = async () => {
    if (!selectedPlan) {
      alert('Por favor, selecione um treino planejado primeiro.');
      return;
    }
    if (distance <= 0 || duration <= 0) {
      alert('Distância e duração devem ser maiores que zero.');
      return;
    }

    const pace = calculatePace(duration, distance);
    const success = await addRun({
      date: date.split('-').reverse().join('/'),
      type: selectedPlan.type,
      distance,
      duration,
      hr: hr || undefined,
      rpe: rpe || undefined,
      notes: notes || undefined,
      pace,
      planned_id: selectedPlan.id
    });

    if (success) {
      // Mark plan as completed
      if (selectedPlan.id) {
        await updatePlannedRun(selectedPlan.id, { completed: true });
      }
      alert('Corrida registrada com sucesso!');
      setSelectedPlan(null);
      setDistance(0);
      setDuration(0);
      setHr(0);
      setRpe(0);
      setNotes('');
    }
  };

  if (!selectedPlan) {
    return (
      <section className="space-y-6 animate-in">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <List className="w-5 h-5 text-blue-600" />
            Treinos Planejados
          </h3>
        </div>

        {pendingPlans.length === 0 ? (
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="text-zinc-500 font-medium">Nenhum treino planejado pendente.</p>
            <p className="text-zinc-400 text-sm mt-1">Vá na aba "Planejamento" para criar um novo treino.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handleSelectPlan(plan)}
                className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-blue-500 transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    plan.type === 'intervals' ? 'bg-purple-100 text-purple-600' :
                    plan.type === 'tempo' ? 'bg-orange-100 text-orange-600' :
                    plan.type === 'long' ? 'bg-blue-100 text-blue-600' :
                    plan.type === 'race' ? 'bg-red-100 text-red-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{plan.date}</span>
                      <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                        {plan.type === 'easy' ? 'Leve' : 
                         plan.type === 'tempo' ? 'Tempo' : 
                         plan.type === 'intervals' ? 'Intervalado' : 
                         plan.type === 'long' ? 'Longo' : 'Prova'}
                      </span>
                    </div>
                    <h4 className="font-black text-zinc-900 dark:text-zinc-100">
                      {plan.distance}km {plan.pace ? `@ ${plan.pace}` : ''}
                      {plan.intervals && plan.intervals > 1 ? ` (${plan.intervals}x)` : ''}
                    </h4>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setSelectedPlan(null)}
          className="text-sm font-bold text-zinc-500 hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Voltar para a lista
        </button>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800">
          <Info className="w-3 h-3 text-blue-600" />
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Registrando: {selectedPlan.date}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Data Realizada
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
              <Activity className="w-3 h-3" /> Tipo (Planejado)
            </label>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-bold text-zinc-500 dark:text-zinc-400">
              {selectedPlan.type === 'easy' ? 'Rodagem Leve' : 
               selectedPlan.type === 'tempo' ? 'Tempo Run' : 
               selectedPlan.type === 'intervals' ? 'Intervalado' : 
               selectedPlan.type === 'long' ? 'Longão' : 'Prova'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Distância Real (km)
            </label>
            <input 
              type="number" 
              step="0.01"
              value={distance || ''}
              onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100" 
              placeholder="0.00"
            />
            <p className="text-[10px] text-zinc-400 italic">Planejado: {selectedPlan.distance}km</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Timer className="w-3 h-3" /> Duração Real (minutos)
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
