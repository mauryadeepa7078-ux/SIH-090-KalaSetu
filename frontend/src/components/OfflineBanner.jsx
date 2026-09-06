import React from 'react';
import { useApp } from '../context/AppContext';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

export const OfflineBanner = () => {
  const { isOnline, pendingQueue, triggerSync, t } = useApp();

  if (isOnline && pendingQueue.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center space-x-2">
          {!isOnline ? (
            <WifiOff className="w-4 h-4 flex-shrink-0 animate-pulse" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>
            {!isOnline ? t('offlineMode') : 'Online'} — {pendingQueue.length > 0 ? `${pendingQueue.length} ${t('pendingSync')}` : t('offlineDesc')}
          </span>
        </div>

        {pendingQueue.length > 0 && (
          <button
            onClick={triggerSync}
            className="flex items-center space-x-1.5 bg-stone-900/80 hover:bg-stone-900 text-white font-semibold px-3 py-1 rounded-full text-xs transition-colors shadow-inner"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>{t('syncNow')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
