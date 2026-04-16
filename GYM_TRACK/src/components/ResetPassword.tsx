
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { KeyRound, CheckCircle } from 'lucide-react';

interface ResetPasswordProps {
  onSuccess: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      alert('Erro ao atualizar senha: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-zinc-50 dark:bg-zinc-950 z-[10000] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md mx-4 text-center animate-in">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2">Senha Atualizada!</h2>
          <p className="text-zinc-500 mb-4">Sua senha foi redefinida com sucesso. Você será redirecionado para o login em instantes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-zinc-50 dark:bg-zinc-950 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Nova Senha</h2>
          <p className="text-zinc-500 text-sm">Digite sua nova senha abaixo para recuperar o acesso.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Nova Senha</label>
            <input 
              type="password" 
              required 
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Confirmar Senha</label>
            <input 
              type="password" 
              required 
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Atualizando...' : 'Redefinir Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};
