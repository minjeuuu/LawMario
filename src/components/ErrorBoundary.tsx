import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle, ShieldCheck, Home } from 'lucide-react';
import { MarioMushroomIcon } from './MarioIcons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      // Clear any corrupted local state while preserving user stats if possible
      window.localStorage.removeItem('mario_equipped_companion');
      window.localStorage.removeItem('mario_equipped_card_frame');
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-4 border-amber-400 rounded-3xl p-6 shadow-[0_10px_35px_rgba(0,0,0,0.8)] text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 border-3 border-black mx-auto flex items-center justify-center font-black shadow-[0_4px_0_#000]">
              <MarioMushroomIcon className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 font-mario">
                1-UP MUSHROOM SAFEGUARD
              </span>
              <h2 className="text-xl font-black font-display text-white">
                Mushroom Kingdom Recovery
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                A minor rendering glitch occurred, but your coins, progress, and study stats are safe in the Kingdom vault!
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-left overflow-x-auto">
                <p className="text-[11px] font-mono text-rose-400 font-semibold break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase rounded-xl border-2 border-black shadow-[0_2px_0_#000] cursor-pointer inline-flex items-center justify-center gap-1.5 active:translate-y-0.5 transition-all"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Reload Adventure</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetStorage}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer inline-flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Safe Reset</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
