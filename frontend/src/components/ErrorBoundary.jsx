import React from 'react';
import { RotateCcw, AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleClearCacheAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Error clearing storage:', e);
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  handleResetState = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-center">
            {/* Warning Icon */}
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 shadow-lg shadow-amber-950">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-orange-950/80 text-orange-400 border border-orange-600/40">
                KalaSetu (कलासेतु) • Recovery Guard
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Application Rendering Notice
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                A component encountered a runtime state conflict. KalaSetu's automatic recovery guard intercepted the error to protect your craft data.
              </p>
            </div>

            {/* Error Message Details */}
            {this.state.error && (
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-left font-mono text-[11px] text-red-400 overflow-x-auto max-h-32">
                <span className="font-bold block text-stone-400">Error:</span>
                {this.state.error.toString()}
              </div>
            )}

            {/* Recovery Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={this.handleClearCacheAndReload}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-orange-950 transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>कैश साफ़ करें और रीलोड करें (Clear Cache & Reload)</span>
              </button>

              <button
                onClick={this.handleResetState}
                className="w-full py-3.5 px-4 rounded-2xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-orange-400" />
                <span>Try Resuming Application (पुनः प्रयास करें)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
