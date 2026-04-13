
import React, { useState } from 'react';
import { X, Download, Upload, FileJson, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../hooks/useApp';

interface ImportExportModalProps {
  onClose: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ onClose }) => {
  const { exportUserData, importUserData } = useApp();
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    const data = exportUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gymtrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setStatus(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const result = await importUserData(json);
        if (result.success) {
          setStatus({ type: 'success', message: result.message });
        } else {
          setStatus({ type: 'error', message: result.message });
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Arquivo JSON inválido.' });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Backup de Dados</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3 mb-2">
                <Download className="w-5 h-5 text-orange-600" />
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Exportar</h4>
              </div>
              <p className="text-xs text-zinc-500 mb-4">Baixe todos os seus dados de treinos, recordes e exercícios em um arquivo JSON.</p>
              <button 
                onClick={handleExport}
                className="w-full py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                <FileJson className="w-4 h-4" />
                Baixar JSON
              </button>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3 mb-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Importar</h4>
              </div>
              <p className="text-xs text-zinc-500 mb-4">Selecione um arquivo JSON para restaurar ou mesclar seus dados. Registros duplicados serão ignorados.</p>
              <label className="block">
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImport}
                  disabled={isImporting}
                  className="hidden" 
                />
                <div className={`w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isImporting ? 'Importando...' : (
                    <>
                      <Upload className="w-4 h-4" />
                      Selecionar Arquivo
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {status && (
            <div className={`p-4 rounded-2xl flex items-start gap-3 animate-in ${status.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <p className="text-xs font-bold">{status.message}</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
          <button 
            onClick={onClose}
            className="w-full py-3 text-sm font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
