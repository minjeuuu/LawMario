import React, { useMemo, useEffect, useState } from 'react';
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
  Zap,
  BookOpen,
} from 'lucide-react';
import { BossBattleLogEntry } from '../utils/round8Features';
import { QuickQuizLogEntry } from '../utils/round9Features';
import { marioAudio } from '../utils/audio';

interface BossBattleLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: BossBattleLogEntry[];
  quickQuizEntries?: QuickQuizLogEntry[];
  initialTab?: 'boss' | 'quick';
  onLaunchWeaknessDrill?: () => void;
  onJumpToTopic?: (topicId: string, worldId: string) => void;
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
  quickQuizEntries = [],
  initialTab = 'boss',
  onLaunchWeaknessDrill,
  onJumpToTopic,
}) => {
  const [activeLogTab, setActiveLogTab] = useState<'boss' | 'quick'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveLogTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const bossStats = useMemo(() => {
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

  const quickStats = useMemo(() => {
    if (quickQuizEntries.length === 0) {
      return { avgAccuracy: 0, perfectRuns: 0, uniqueTopics: 0, fastestSec: 0 };
    }
    const avgAccuracy = Math.round(
      quickQuizEntries.reduce((acc, e) => acc + e.percent, 0) / quickQuizEntries.length
    );
    const perfectRuns = quickQuizEntries.filter((e) => e.score >= e.totalQuestions).length;
    const uniqueTopics = new Set(quickQuizEntries.map((e) => e.topicId)).size;
    const fastestSec = Math.min(...quickQuizEntries.map((e) => e.durationSeconds));
    return { avgAccuracy, perfectRuns, uniqueTopics, fastestSec };
  }, [quickQuizEntries]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bar Master Boss Battle & Quick Quiz Log"
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
            <div
              className={`w-11 h-11 rounded-2xl text-white border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000] ${
                activeLogTab === 'boss' ? 'bg-rose-600' : 'bg-amber-500 text-slate-950'
              }`}
            >
              {activeLogTab === 'boss' ? (
                <Swords className="w-6 h-6" />
              ) : (
                <Zap className="w-6 h-6 text-slate-950" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-rose-400 font-mario block truncate">
                {activeLogTab === 'boss'
                  ? 'BAR MASTER DIFFICULTY TIER · PAST 10 RUNS'
                  : 'TOPIC CARD MINI-QUIZ MASTERY · PAST 15 RUNS'}
              </span>
              <h2 className="text-lg sm:text-2xl font-black font-display text-white truncate">
                {activeLogTab === 'boss'
                  ? `Boss Battle Log (${entries.length}/10)`
                  : `Quick Quiz Log (${quickQuizEntries.length}/15)`}
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

        {/* Mode Switcher: Boss Battles vs Topic Quick Quizzes */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              data-testid="boss-log-tab-boss"
              onClick={() => {
                setActiveLogTab('boss');
                marioAudio.playClick();
              }}
              className={`min-h-[38px] px-3 rounded-lg text-xs font-black inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                activeLogTab === 'boss'
                  ? 'bg-rose-600 text-white border border-black shadow-[0_2px_0_#000]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5 shrink-0" />
              <span>Boss Battles ({entries.length})</span>
            </button>
            <button
              type="button"
              data-testid="boss-log-tab-quick"
              onClick={() => {
                setActiveLogTab('quick');
                marioAudio.playClick();
              }}
              className={`min-h-[38px] px-3 rounded-lg text-xs font-black inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                activeLogTab === 'quick'
                  ? 'bg-amber-400 text-slate-950 border border-black shadow-[0_2px_0_#000]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>Quick Quizzes ({quickQuizEntries.length})</span>
            </button>
          </div>
        </div>

        {/* Summary Metrics */}
        {activeLogTab === 'boss' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 px-4 sm:px-6 py-3.5 bg-slate-950/75 border-b border-slate-800 shrink-0 tabular-nums">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block">Runs Logged</span>
              <span className="text-base sm:text-lg font-black text-white">{entries.length} / 10</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block">Avg Accuracy</span>
              <span className="text-base sm:text-lg font-black text-amber-300">
                {entries.length ? `${bossStats.avgAccuracy}%` : '—'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block">Best Clear</span>
              <span className="text-base sm:text-lg font-black text-emerald-300">
                {entries.length ? `${bossStats.bestAccuracy}%` : '—'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block">Fastest Time</span>
              <span className="text-base sm:text-lg font-black text-sky-300">
                {entries.length ? formatDurationLabel(bossStats.fastestSec) : '—'}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 px-4 sm:px-6 py-3.5 bg-slate-950/75 border-b border-slate-800 shrink-0 tabular-nums">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block">Mini-Quizzes</span>
              <span className="text-base sm:text-lg font-black text-white">
                {quickQuizEntries.length} / 15
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block">Avg Mastery</span>
              <span className="text-base sm:text-lg font-black text-amber-300">
                {quickQuizEntries.length ? `${quickStats.avgAccuracy}%` : '—'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block">3/3 Flawless</span>
              <span className="text-base sm:text-lg font-black text-emerald-300">
                {quickQuizEntries.length ? quickStats.perfectRuns : '—'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block">Topics Tested</span>
              <span className="text-base sm:text-lg font-black text-sky-300">
                {quickQuizEntries.length ? quickStats.uniqueTopics : '—'}
              </span>
            </div>
          </div>
        )}

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {activeLogTab === 'boss' ? (
            entries.length === 0 ? (
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
                          <span className="font-black text-rose-300">
                            #{idx + 1} · {entry.difficultyTier}
                          </span>
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
            )
          ) : quickQuizEntries.length === 0 ? (
            <div
              data-testid="quick-quiz-empty-state"
              className="bg-slate-950/70 border-2 border-dashed border-slate-700 rounded-2xl p-7 text-center space-y-3"
            >
              <Zap className="w-9 h-9 text-amber-400 mx-auto" />
              <h3 className="text-base sm:text-lg font-black font-display text-white">
                No Topic Card Quick Quizzes Logged Yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Click the <strong className="text-amber-300">Quick Quiz (3Q)</strong> button on any Topic Card inside Modules to test your mastery of that specific statutory section and track your scores here separately from Boss Battles!
              </p>
            </div>
          ) : (
            quickQuizEntries.map((qq, idx) => {
              const isPerfect = qq.score >= qq.totalQuestions;
              return (
                <article
                  key={qq.id}
                  data-testid={`quick-quiz-log-entry-${idx}`}
                  className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-black text-amber-300">{qq.topicBadge}</span>
                        <span aria-hidden="true">·</span>
                        <span>{qq.formattedDate}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white font-display truncate mt-0.5">
                        {qq.topicTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 tabular-nums">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{formatDurationLabel(qq.durationSeconds)}</span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-lg border ${
                          isPerfect
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                            : qq.percent >= 66
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500/60'
                            : 'bg-rose-950/80 text-rose-300 border-rose-500/60'
                        }`}
                      >
                        {isPerfect ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>
                          {qq.score}/{qq.totalQuestions} ({qq.percent}%)
                        </span>
                      </span>
                      {onJumpToTopic && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onJumpToTopic(qq.topicId, qq.worldId);
                          }}
                          className="min-h-[30px] px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Open</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {qq.missedPoints.length === 0 ? (
                    <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>100% Section Mastery — All 3 questions answered accurately!</span>
                    </p>
                  ) : (
                    <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 space-y-1">
                      <span className="text-[11px] font-bold text-amber-300 block">
                        Doctrines to Review ({qq.missedPoints.length}):
                      </span>
                      <ul className="text-xs text-slate-200 space-y-1">
                        {qq.missedPoints.map((mp, mIdx) => (
                          <li key={mIdx} className="leading-relaxed">
                            • {mp}
                          </li>
                        ))}
                      </ul>
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
            {activeLogTab === 'boss'
              ? 'Automatically retains your latest 10 Bar Master tier battles'
              : 'Automatically tracks your latest 15 Topic Card 3-Question Quick Quizzes'}
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

