
import React, { useState } from 'react';
import { X, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { calculateDietGoals, DietGoalsAnalysis } from '../../lib/gemini';

interface AiDietGoalsAssistantModalProps {
  onClose: () => void;
  onApply: (analysis: DietGoalsAnalysis) => void;
}

export const AiDietGoalsAssistantModal: React.FC<AiDietGoalsAssistantModalProps> = ({ onClose, onApply }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [weight, setWeight] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [age, setAge] = useState<number>(0);
  const [sex, setSex] = useState<'masculino' | 'feminino'>('masculino');
  const [activityLevel, setActivityLevel] = useState('Sedentário (pouco ou nenhum exercício)');
  const [objective, setObjective] = useState<'emagrecer' | 'neutro' | 'ganhar_massa'>('neutro');
  const [bodyFat, setBodyFat] = useState<number | undefined>(undefined);
  const [leanMass, setLeanMass] = useState<number | undefined>(undefined);

  const [result, setResult] = useState<DietGoalsAnalysis | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const analysis = await calculateDietGoals({
        weight,
        height,
        age,
        sex,
        activityLevel,
        objective,
        bodyFat,
        leanMass
      });
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "Erro ao calcular metas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Assistente de Metas IA</h3>
              <p className="text-xs text-white/80 font-medium">Cálculo personalizado baseado no seu perfil</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {!result ? (
            <form onSubmit={handleCalculate} className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Peso (kg)</label>
                  <input 
                    type="number" 
                    value={weight || ''}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Altura (cm)</label>
                  <input 
                    type="number" 
                    value={height || ''}
                    onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Idade</label>
                  <input 
                    type="number" 
                    value={age || ''}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Sexo</label>
                  <select 
                    value={sex}
                    onChange={(e) => setSex(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Gordura % (Opcional)</label>
                  <input 
                    type="number" 
                    value={bodyFat || ''}
                    onChange={(e) => setBodyFat(parseFloat(e.target.value) || undefined)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Massa Magra kg (Opcional)</label>
                  <input 
                    type="number" 
                    value={leanMass || ''}
                    onChange={(e) => setLeanMass(parseFloat(e.target.value) || undefined)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nível de Atividade Diária</label>
                <select 
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100"
                >
                  <option>Sedentário (pouco ou nenhum exercício)</option>
                  <option>Levemente ativo (exercício leve 1-3 dias/semana)</option>
                  <option>Moderadamente ativo (exercício moderado 3-5 dias/semana)</option>
                  <option>Muito ativo (exercício pesado 6-7 dias/semana)</option>
                  <option>Extremamente ativo (trabalho físico pesado + treino intenso)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Objetivo</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'emagrecer', label: 'Emagrecer' },
                    { id: 'neutro', label: 'Manter Peso' },
                    { id: 'ganhar_massa', label: 'Ganhar Massa' }
                  ].map((obj) => (
                    <button
                      key={obj.id}
                      type="button"
                      onClick={() => setObjective(obj.id as any)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition-all ${objective === obj.id ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-600' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400'}`}
                    >
                      {obj.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex items-start gap-3 text-red-600 animate-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Calculando Metas...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Gerar Sugestão de Metas
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Calorias</p>
                  <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{result.kcal}<span className="text-xs ml-1">kcal</span></p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Proteínas</p>
                  <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{result.prot}<span className="text-xs ml-1">g</span></p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Carbos</p>
                  <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{result.carb}<span className="text-xs ml-1">g</span></p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Gord. Total</p>
                  <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{result.fat_total}<span className="text-xs ml-1">g</span></p>
                </div>
              </div>

              <div className="p-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-3xl">
                <h4 className="text-sm font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Análise da IA
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {result.explanation}
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setResult(null)}
                  className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Refazer Cálculo
                </button>
                <button 
                  onClick={() => onApply(result)}
                  className="flex-1 py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Aplicar Metas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
