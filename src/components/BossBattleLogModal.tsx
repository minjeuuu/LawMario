import React, { useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Trophy,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  Flame,
  Target,
  Swords,
} from 'lucide-react';
import { BossBattleLogEntry } from '../utils/round8Features';
import { marioAudio } from '../utils/audio';

interface BossBattleLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: BossBattleLogEntry[];
  onLaunchWeaknessDrill?: () => void;
}

function formatDurationLabel(totalSeconds: number): string {
  const safe = Math.max(1, Math.round(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  if (mins <= 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

export const BossBattleLogModal: React.FC<BossBattleLogModalProps> = ({
  isOpen,
  onClose,
  entries,
  onLaunchWeaknessDrill,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const stats = useMemo(() => {
    if (entries.length === 0) {
      return { avgAccuracy: 0, bestAccuracy: 0, fastestSec: 0, victories: 0 };
    }
    const avgAccuracy = Math.round(
      entries.reduce((acc, e) => acc + e.accuracyPercent, 0) / entries.length
    );
    const bestAccuracy = Math.max(...entries.map((e) => e.accuracyPercent));
    const fastestSec = Math.min(...entries.map((e) => e.timeTakenSeconds));
    const victories = entries.filter((e) => e.victory).length;
    return { avgAccuracy, bestAccuracy, fastestSec, victories };
  }, [entries]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bar Master Boss Battle Log"
      data-testid="boss-battle-log-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[85] bg-black/80 flex items-center justify-center p-3 sm:p-5 print:hidden"
    >
      <div className="w-full max-w-3xl max-h-[90dvh] bg-slate-900 text-white rounded-3xl border-4 border-rose-500 shadow-[8px_8px_0_#000] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-4 sm:px-6 py-4 border-b-2 border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <Swords className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-rose-400 font-mario block truncate">
                BAR MASTER DIFFICULTY TIER • PAST 10 RUNS
              </span>
              <h2 className="text-lg sm:text-2xl font-black font-display text-white truncate">
                Boss Battle Log ({entries.length}/10)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Boss Battle Log"
            className="min-w-[42px] min-h-[42px] rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white border-2 border-slate-700 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 px-4 sm:px-6 py-3.5 bg-slate-950/75 border-b border-slate-800 shrink-0 tabular-nums">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">Runs Logged</span>
            <span className="text-base sm:text-lg font-black text-white">{entries.length} / 10</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">Avg Accuracy</span>
            <span className="text-base sm:text-lg font-black text-amber-300">
              {entries.length ? `${stats.avgAccuracy}%` : '—'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">Best Clear</span>
            <span className="text-base sm:text-lg font-black text-emerald-300">
              {entries.length ? `${stats.bestAccuracy}%` : '—'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">Fastest Time</span>
            <span className="text-base sm:text-lg font-black text-sky-300">
              {entries.length ? formatDurationLabel(stats.fastestSec) : '—'}
            </span>
          </div>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {entries.length === 0 ? (
            <div className="bg-slate-950/70 border-2 border-dashed border-slate-700 rounded-2xl p-7 text-center space-y-3">
              <Flame className="w-9 h-9 text-rose-400 mx-auto" />
              <h3 className="text-base sm:text-lg font-black font-display text-white">
                No Bar Master Boss Runs Recorded Yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Switch Study Difficulty to <strong className="text-amber-300">Bar Master (Exam Prep)</strong> and complete any Boss Battle, Exam Simulation, or Quest run to log your past 10 scores, clear times, and missed topics here!
              </p>
            </div>
          ) : (
            entries.map((entry, idx) => {
              const dateLabel = new Date(entry.playedAtIso).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              });
              return (
                <article
                  key={entry.id}
                  data-testid={`boss-log-entry-${idx}`}
                  className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-black text-rose-300">#{idx + 1} · {entry.difficultyTier}</span>
                        <span aria-hidden="true">·</span>
                        <span>{dateLabel}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white font-display truncate mt-0.5">
                        {entry.modeLabel}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 tabular-nums">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{formatDurationLabel(entry.timeTakenSeconds)}</span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-lg border ${
                          entry.victory
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                            : 'bg-rose-950/80 text-rose-300 border-rose-500/60'
                        }`}
                      >
                        {entry.victory ? (
                          <Trophy className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>
                          {entry.score}/{entry.totalQuestions} ({entry.accuracyPercent}%)
                        </span>
                      </span>
                    </div>
                  </div>

                  {entry.incorrectTopics.length === 0 ? (
                    <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Flawless Run — Zero missed topics!</span>
                    </p>
                  ) : (
                    <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                      <span className="text-[11px] font-bold text-rose-300 block mb-1">
                        Incorrect Topics to Drill ({entry.incorrectTopics.length}):
                      </span>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        {entry.incorrectTopics.join(' · ')}
                      </p>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        {/* Footer CTA */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <span className="text-xs text-slate-400 font-semibold">
            Automatically retains your latest 10 Bar Master tier battles
          </span>
          {onLaunchWeaknessDrill && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLaunchWeaknessDrill();
                marioAudio.playPowerUp();
              }}
              className="min-h-[40px] px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Target className="w-4 h-4 shrink-0" />
              <span>Practice Targeted Weakness Drill</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
