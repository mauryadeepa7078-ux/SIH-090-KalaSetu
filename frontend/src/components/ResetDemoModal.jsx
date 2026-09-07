import React from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw, AlertTriangle, X, Sparkles } from 'lucide-react';

export const ResetDemoModal = () => {
  const { showResetModal, setShowResetModal, handleResetDemo, loading, t } = useApp();

  if (!showResetModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-stone-700/80 rounded-3xl shadow-2xl max-w-md w-full p-6 text-stone-200 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between pb-3.5 border-b border-stone-800 relative z-10">
          <div className="flex items-center space-x-2 text-orange-400 font-bold text-base font-serif">
            <div className="p-1.5 rounded-xl bg-orange-500/20 text-orange-400">
              <RotateCcw className="w-4 h-4" />
            </div>
            <span className="text-white text-base">{t('resetDemo')}</span>
          </div>
          <button
            onClick={() => setShowResetModal(false)}
            className="text-stone-400 hover:text-white p-1.5 rounded-xl hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 flex items-start space-x-3.5 relative z-10">
          <div className="p-3 rounded-2xl bg-amber-950/80 text-amber-400 border border-amber-700/50 flex-shrink-0 shadow-inner">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-white font-serif">
              Restore Pristine SIH 2026 Demo Dataset?
            </p>
            <p className="text-xs text-stone-400 mt-1.5 leading-relaxed font-sans">
              This will restore all 10 authentic Indian craft listings (Banarasi Silk, Madhubani Art, Dokra Brass, Channapatna Toys, Blue Pottery, etc.) with pre-calculated ML pricing, GI tags, and MoSJE digital certificates.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-stone-800 relative z-10">
          <button
            onClick={() => setShowResetModal(false)}
            className="px-4 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-semibold transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleResetDemo}
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-900/40 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Resetting Database...' : 'Confirm Reset'}
          </button>
        </div>
      </div>
    </div>
  );
};
