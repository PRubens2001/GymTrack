
import React, { useState, useRef } from 'react';
import { X, Send, Camera, Image as ImageIcon, Sparkles, Loader2, Info } from 'lucide-react';
import { analyzeMeal, MealAnalysis } from '../../lib/gemini';

interface AiMealAssistantModalProps {
  onClose: () => void;
  onApply: (analysis: MealAnalysis) => void;
}

export const AiMealAssistantModal: React.FC<AiMealAssistantModalProps> = ({ onClose, onApply }) => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description && !image) {
      setError('Por favor, descreva a refeição ou adicione uma foto.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const analysis = await analyzeMeal(description, image || undefined);
      onApply(analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao analisar a refeição.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[300] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in border border-zinc-100 dark:border-zinc-800">
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">Assistente IA</h3>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Nutrição & Performance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Descreva sua refeição</label>
              <div className="group relative">
                <Info className="w-3.5 h-3.5 text-zinc-300 cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-zinc-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                  Dica: Explique o que é cada alimento e as quantidades estimadas (ex: 200g de arroz, 150g de frango grelhado).
                </div>
              </div>
            </div>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: 200g de arroz integral, 150g de peito de frango grelhado e uma salada de alface com tomate..."
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-green-500 dark:text-zinc-100 min-h-[120px] resize-none transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Foto da Refeição (Opcional)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 overflow-hidden ${image ? 'border-green-500 bg-green-50/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-green-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
            >
              {image ? (
                <>
                  <img src={image} alt="Refeição" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-zinc-400">Clique para adicionar foto</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in">
              <Info className="w-4 h-4" />
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-green-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-green-600/20 hover:bg-green-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Analisar com IA
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
