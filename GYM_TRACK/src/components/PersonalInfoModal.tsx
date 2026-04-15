
import React, { useState } from 'react';
import { X, User, Save, Ruler, Weight, Activity, Target, Calendar, Info } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { UserProfile } from '../types';

interface PersonalInfoModalProps {
  onClose: () => void;
}

export const PersonalInfoModal: React.FC<PersonalInfoModalProps> = ({ onClose }) => {
  const { userProfile, updateProfile } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: userProfile?.full_name || '',
    birth_date: userProfile?.birth_date || '',
    gender: userProfile?.gender || 'male',
    height: userProfile?.height?.toString() || '',
    weight: userProfile?.weight?.toString() || '',
    activity_level: userProfile?.activity_level || 'moderate',
    goal: userProfile?.goal || 'maintain'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const success = await updateProfile({
        full_name: formData.full_name,
        birth_date: formData.birth_date,
        gender: formData.gender as any,
        height: parseFloat(formData.height) || undefined,
        weight: parseFloat(formData.weight) || undefined,
        activity_level: formData.activity_level as any,
        goal: formData.goal as any
      });
      
      if (success) {
        onClose();
      } else {
        alert('Erro ao salvar informações. Tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-orange-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold">Informações Pessoais</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Seu nome"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Data de Nascimento</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="date" 
                    value={formData.birth_date}
                    onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Gênero</label>
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Altura (cm)</label>
                <div className="relative">
                  <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="number" 
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    placeholder="175"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Peso Atual (kg)</label>
                <div className="relative">
                  <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="number" 
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="75.5"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nível de Atividade</label>
              <div className="relative">
                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <select 
                  value={formData.activity_level}
                  onChange={(e) => setFormData({...formData, activity_level: e.target.value as any})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100 appearance-none"
                >
                  <option value="sedentary">Sedentário (Pouco ou nenhum exercício)</option>
                  <option value="light">Leve (Exercício 1-3 dias/semana)</option>
                  <option value="moderate">Moderado (Exercício 3-5 dias/semana)</option>
                  <option value="active">Ativo (Exercício 6-7 dias/semana)</option>
                  <option value="very_active">Muito Ativo (Atleta ou trabalho físico pesado)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Objetivo</label>
              <div className="relative">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <select 
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value as any})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 dark:text-zinc-100 appearance-none"
                >
                  <option value="lose_weight">Perder Peso / Definição</option>
                  <option value="maintain">Manter Peso / Saúde</option>
                  <option value="gain_muscle">Ganhar Massa / Bulking</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex-1 py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
