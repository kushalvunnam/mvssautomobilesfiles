import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col justify-center items-center h-full min-h-[400px] text-center p-6 bg-slate-50 dark:bg-slate-950/20 rounded-3xl border border-slate-202 dark:border-slate-800 m-4 shadow-xs">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-200/50 dark:border-rose-900/30 mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Something went wrong</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm leading-relaxed font-semibold">
            {this.state.error?.message || "An unexpected React runtime crash occurred in this module."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
