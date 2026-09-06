import React from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';

export const ResetDemoModal = () => {
  const { showResetModal, setShowResetModal, handleResetDemo, loading, t } = useApp();

  if (!showResetModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center space-x-2 text-orange-400 font-bold text-base">
            <RotateCcw className="w-5 h-5" />
            <span>{t('resetDemo')}</span>
          </div>
          <button
            onClick={() => setShowResetModal(false)}
            className="text-stone-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 flex items-start space-x-3">
          <div className="p-2.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-700/50 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Restore Pristine SIH 2026 Demo Dataset?
            </p>
            <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
              This will restore all 10 authentic Indian craft listings (Banarasi Silk, Madhubani Art, Dokra Brass, Channapatna Toys, Blue Pottery, etc.) with pre-calculated ML pricing, GI tags, and MoSJE digital certificates.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3 pt-3 border-t border-stone-800">
          <button
            onClick={() => setShowResetModal(false)}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleResetDemo}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-900/40 transition-all disabled:opacity-50"
          >
            {loading ? 'Resetting Database...' : 'Confirm Reset'}
          </button>
        </div>
      </div>
    </div>
  );
};
