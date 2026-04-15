
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Dumbbell, User, Ruler, Weight, Activity, Target, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';

export const AuthOverlay: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [signupStep, setSignupStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Personal Info State
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState('maintain');

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setSignupStep(1);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/confirmacao-sucesso`,
            data: {
              full_name: fullName,
              birth_date: birthDate,
              gender,
              height: parseFloat(height) || null,
              weight: parseFloat(weight) || null,
              activity_level: activityLevel,
              goal
            }
          }
        });
        if (error) throw error;
        alert('Cadastro realizado! Um e-mail de confirmação foi enviado. Após confirmar seu e-mail, seu acesso precisará ser liberado por um administrador.');
        setMode('login');
        setSignupStep(1);
        setEmail('');
        setPassword('');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        alert('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
        setMode('login');
      }
    } catch (err: any) {
      alert('Erro: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-50 dark:bg-zinc-950 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {mode === 'login' ? 'Bem-vindo ao GymTrack' : mode === 'signup' ? (signupStep === 1 ? 'Informações Pessoais' : 'Crie sua conta') : 'Recuperar Senha'}
          </h2>
          <p className="text-zinc-500 text-sm">
            {mode === 'login' ? 'Entre na sua conta para sincronizar seus treinos' : mode === 'signup' ? (signupStep === 1 ? 'Conte-nos um pouco sobre você' : 'Agora defina seu acesso') : 'Digite seu e-mail para receber o link de recuperação'}
          </p>
        </div>

        <form onSubmit={(e) => {
          if (mode === 'signup' && signupStep === 1) {
            e.preventDefault();
            setSignupStep(2);
          } else {
            handleSubmit(e);
          }
        }} className="space-y-4">
          {mode === 'signup' && signupStep === 1 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="text" 
                    required 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Nascimento</label>
                  <input 
                    type="date" 
                    required 
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Gênero</label>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Altura (cm)</label>
                  <input 
                    type="number" 
                    required 
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Peso (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    required 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Próximo Passo
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              {mode === 'signup' && (
                <button 
                  type="button"
                  onClick={() => setSignupStep(1)}
                  className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-orange-600 transition-colors mb-2"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Voltar para info pessoal
                </button>
              )}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">E-mail</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                />
              </div>
              {mode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Senha</label>
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[10px] text-orange-600 hover:underline font-bold uppercase tracking-widest"
                      >
                        Esqueceu?
                      </button>
                    )}
                  </div>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                  />
                </div>
              )}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Finalizar Cadastro' : 'Enviar Link'}
              </button>
            </>
          )}
        </form>

        <div className="mt-6 text-center space-y-2">
          <button 
            onClick={toggleMode}
            className="text-sm text-orange-600 hover:underline font-medium block w-full"
          >
            {mode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
          </button>
          {mode === 'forgot' && (
            <button 
              onClick={() => setMode('login')}
              className="text-xs text-zinc-500 hover:text-zinc-700 font-medium"
            >
              Voltar para o Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
