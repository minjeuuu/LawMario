import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  PlayerProfileStats,
  buildMonthlyStudyCalendar,
  readStoredDailyStudyGoal,
  saveStoredDailyStudyGoal,
  formatDateKey,
  computeDailyStudyGoalStatus,
} from '../utils/profileAchievements';
import { MarioCoinIcon, MarioStarIcon } from './MarioIcons';
import { marioAudio } from '../utils/audio';

interface StudyGoalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerProfileStats;
  dailyGoalMinutes?: number;
  onChangeDailyGoalMinutes?: (minutes: number) => void;
  loginStreak?: number;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const StudyGoalHistoryModal: React.FC<StudyGoalHistoryModalProps> = ({
  isOpen,
  onClose,
  stats,
  dailyGoalMinutes,
  onChangeDailyGoalMinutes,
  loginStreak = 1,
}) => {
  const now = useMemo(() => new Date(), [isOpen]);
  const [viewYear, setViewYear] = useState<number>(() => now.getFullYear());
  const [viewMonthIndex, setViewMonthIndex] = useState<number>(() => now.getMonth());
  const [goalTarget, setGoalTarget] = useState<number>(
    () => dailyGoalMinutes ?? readStoredDailyStudyGoal()
  );
  const [selectedDayKey, setSelectedDayKey] = useState<string>(() => formatDateKey(now));

  useEffect(() => {
    if (dailyGoalMinutes !== undefined) {
      setGoalTarget(dailyGoalMinutes);
    }
  }, [dailyGoalMinutes]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const todayKey = formatDateKey(now);
  const todayStatus = computeDailyStudyGoalStatus(stats, goalTarget, todayKey);

  // Build calendar cells for selected month
  const calendarModel = useMemo(() => {
    return buildMonthlyStudyCalendar({
      year: viewYear,
      month: viewMonthIndex,
      loginStreak: loginStreak || stats?.loginStreak || 1,
      dailyGoalTarget: goalTarget,
      stats: stats || ({} as PlayerProfileStats),
      referenceToday: now,
    });
  }, [viewYear, viewMonthIndex, goalTarget, stats, loginStreak, now]);

  const rawMonthCells = calendarModel?.cells || [];

  const leadingEmptyCells = useMemo(() => {
    return Array.from({ length: calendarModel?.firstDayOffset || 0 }, (_, idx) => idx);
  }, [calendarModel?.firstDayOffset]);

  const goalsMetInMonth = calendarModel?.completedGoalDaysCount || 0;
  const activeStudyDaysInMonth = calendarModel?.activeDaysCount || 0;
  const totalMinutesInMonth = rawMonthCells.reduce((acc, c) => acc + (c.minutesStudied || 0), 0);

  const selectedCell =
    rawMonthCells.find((c) => c.dateKey === selectedDayKey) ||
    rawMonthCells.find((c) => c.isToday) ||
    rawMonthCells[0] ||
    null;

  if (!isOpen) return null;

  const handleStepMonth = (delta: number) => {
    let nextMonth = viewMonthIndex + delta;
    let nextYear = viewYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setViewMonthIndex(nextMonth);
    setViewYear(nextYear);
    marioAudio.playClick();
  };

  const handlePickGoal = (mins: number) => {
    setGoalTarget(mins);
    saveStoredDailyStudyGoal(mins);
    onChangeDailyGoalMinutes?.(mins);
    marioAudio.playCoin();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Daily Study Goal Milestones History Calendar"
      data-testid="study-goal-history-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-2.5 sm:p-5 overflow-y-auto overscroll-contain print:hidden"
    >
      <div className="bg-slate-950 border-4 border-black rounded-3xl max-w-3xl w-full shadow-[10px_10px_0_#000] text-white my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#0f172a] px-4 sm:px-6 py-4 border-b-2 border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-emerald-300 font-mario block leading-tight">
                STUDY STREAK &amp; GOAL MILESTONE ARCHIVE
              </span>
              <h2 className="text-base sm:text-xl font-black font-display text-white break-words [overflow-wrap:anywhere] leading-tight">
                DAILY STUDY GOAL HISTORY CALENDAR
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Daily Study Goal History"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-600 border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          data-testid="study-goal-history-scroll-body"
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 custom-scrollbar"
        >
          {/* KPI Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-900 border-2 border-amber-400/70 rounded-2xl p-3">
              <span className="text-[10px] font-black uppercase text-amber-300 block">
                Goals Met This Month
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <MarioStarIcon className="w-5 h-5 shrink-0" />
                <span className="text-xl font-black text-white tabular-nums">
                  {goalsMetInMonth} Days
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-3">
              <span className="text-[10px] font-black uppercase text-orange-300 block">
                Active Study Streak
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-orange-400 shrink-0" />
                <span className="text-xl font-black text-white tabular-nums">
                  {Math.max(loginStreak, goalsMetInMonth)}d
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-3">
              <span className="text-[10px] font-black uppercase text-cyan-300 block">
                Monthly Study Time
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xl font-black text-white tabular-nums">
                  {totalMinutesInMonth}m
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-3">
              <span className="text-[10px] font-black uppercase text-emerald-300 block">
                Today&apos;s Goal Progress
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-base sm:text-lg font-black text-white tabular-nums">
                  {todayStatus.minutesToday}/{goalTarget}m ({todayStatus.progressPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Goal Target Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-black text-slate-200">
                Daily Target Threshold:
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[15, 30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handlePickGoal(mins)}
                  className={`min-h-[34px] px-3 rounded-xl text-xs font-black border cursor-pointer tabular-nums transition-colors ${
                    goalTarget === mins
                      ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-amber-400'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Month Navigation & Grid */}
          <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleStepMonth(-1)}
                aria-label="Previous Month"
                className="min-h-[38px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-black inline-flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <div className="text-center">
                <h3
                  data-testid="goal-calendar-month-title"
                  className="text-base sm:text-lg font-black font-display text-amber-300"
                >
                  {MONTH_NAMES[viewMonthIndex]} {viewYear}
                </h3>
                <span className="text-[11px] text-slate-400 font-semibold">
                  {activeStudyDaysInMonth} study days recorded · {goalsMetInMonth} milestones cleared
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleStepMonth(1)}
                aria-label="Next Month"
                className="min-h-[38px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-black inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-black uppercase text-slate-400 font-mono">
              {WEEKDAY_HEADERS.map((wd) => (
                <div key={wd} className="py-1">
                  {wd}
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {leadingEmptyCells.map((emptyIdx) => (
                <div key={`empty-${emptyIdx}`} className="min-h-[54px] rounded-xl bg-slate-950/30" />
              ))}

              {rawMonthCells.map((cell) => {
                const isSelected = selectedCell?.dateKey === cell.dateKey;
                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    data-testid={`goal-calendar-day-${cell.dateKey}`}
                    onClick={() => {
                      setSelectedDayKey(cell.dateKey);
                      marioAudio.playClick();
                    }}
                    className={`min-h-[54px] sm:min-h-[60px] p-1.5 rounded-xl border-2 flex flex-col items-center justify-between transition-all cursor-pointer tabular-nums ${
                      cell.isGoalCompleted
                        ? 'bg-emerald-950/85 border-emerald-400 text-emerald-100 shadow-[0_2px_0_#000]'
                        : (cell.minutesStudied || 0) > 0
                        ? 'bg-amber-950/45 border-amber-500/70 text-amber-100'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-600'
                    } ${cell.isToday ? 'ring-2 ring-cyan-400' : ''} ${
                      isSelected ? 'scale-[1.03] border-white' : ''
                    }`}
                  >
                    <div className="w-full flex items-center justify-between text-[11px] font-black">
                      <span>{cell.dayNum}</span>
                      {cell.isGoalCompleted && <MarioStarIcon className="w-3.5 h-3.5 shrink-0" />}
                    </div>
                    <span className="text-[10px] font-mono font-bold">
                      {(cell.minutesStudied || 0) > 0 ? `${cell.minutesStudied}m` : '—'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block border border-black" />
                  <span>Goal Milestone Achieved ({goalTarget}m+)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500/70 inline-block border border-black" />
                  <span>Partial Study Session</span>
                </span>
              </div>

              {selectedCell && (
                <span className="font-mono text-amber-300 font-bold">
                  Selected {selectedCell.dateKey}: {selectedCell.minutesStudied || 0}m studied (
                  {selectedCell.isGoalCompleted ? 'Goal Cleared' : `${Math.max(0, goalTarget - (selectedCell.minutesStudied || 0))}m to goal`})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0f172a] px-4 sm:px-6 py-3 border-t-2 border-slate-800 flex items-center justify-between gap-3 shrink-0 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Every day you hit {goalTarget}m earns a Super Star milestone stamp!</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] cursor-pointer"
          >
            Close Calendar
          </button>
        </div>
      </div>
    </div>
  );
};
