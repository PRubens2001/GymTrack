
import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface EmailConfirmationProps {
  onBackToLogin: () => void;
}

export const EmailConfirmation: React.FC<EmailConfirmationProps> = ({ onBackToLogin }) => {
  return (
    <div className="fixed inset-0 bg-zinc-50 dark:bg-zinc-950 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md mx-4 text-center animate-in">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2">
          E-mail Confirmado!
        </h2>
        
        <p className="text-zinc-500 mb-8 leading-relaxed">
          Sua conta foi verificada com sucesso. <br />
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            Agora, um administrador precisa liberar seu acesso manualmente por segurança.
          </span>
          <br /><br />
          Você receberá uma notificação assim que puder começar a usar o GymTrack Pro.
        </p>

        <button 
          onClick={onBackToLogin}
          className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          Voltar para o Início
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
