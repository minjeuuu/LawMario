import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import {
  computeQuizSkillBreakdown,
  computeBarMasterRankProgress,
  buildMissedTopicsStudySummary,
  MissedQuestionBriefInput,
} from '../utils/round9Features';
import { QuizHistoryRecord } from '../utils/profileAchievements';
import { appendQuickTextToStudyNotes } from '../utils/round8Features';
import { SaveSingleQuizErrorButton } from './SaveSingleQuizErrorButton';
import { MarioStarIcon, MarioFireFlowerIcon } from './MarioIcons';
import { marioAudio } from '../utils/audio';
import {
  Flame,
  Trophy,
  FileText,
  Copy,
  Check,
  BookmarkPlus,
  BarChart3,
} from 'lucide-react';

// ============================================================================
// 1. VISUAL 'DAILY STREAK' FIRE METER IN BARQUIZQUEST
// ============================================================================

interface DailyQuizFireMeterProps {
  activeStreak: number;
  completedToday: boolean;
  nextRewardCoins: number;
}

export const DailyQuizFireMeter: React.FC<DailyQuizFireMeterProps> = ({
  activeStreak,
  completedToday,
  nextRewardCoins,
}) => {
  const cappedFlames = Math.min(7, Math.max(0, activeStreak));
  const fillPercent = Math.min(100, Math.round((Math.min(7, activeStreak) / 7) * 100));

  return (
    <div
      data-testid="daily-quiz-fire-meter"
      className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950/90 text-white rounded-2xl px-4 py-3 border-3 border-black shadow-[4px_4px_0_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shrink-0 ${
            completedToday ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-amber-400'
          }`}
        >
          <Flame className="w-5 h-5 fill-current" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-black">
            <span className="text-amber-300 font-display tracking-tight">
              DAILY QUIZ FIRE METER · {activeStreak} {activeStreak === 1 ? 'DAY' : 'DAYS'}
            </span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className={completedToday ? 'text-emerald-300' : 'text-amber-200'}>
              {completedToday ? 'Ignited Today!' : `Win Boss Run for +${nextRewardCoins}c`}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="w-36 sm:w-48 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 transition-all duration-500"
                style={{ width: `${Math.max(8, fillPercent)}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-300 tabular-nums">
              {cappedFlames}/7 Weekly Flame
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0" aria-hidden="true">
        {Array.from({ length: 7 }, (_, idx) => {
          const lit = idx < cappedFlames;
          return (
            <div
              key={idx}
              className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                lit
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                  : 'bg-slate-950/70 border-slate-800 text-slate-600'
              }`}
            >
              {lit ? (
                <MarioFireFlowerIcon className="w-3.5 h-3.5" />
              ) : (
                <Flame className="w-3 h-3" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 2. BOSS DEFEAT CELEBRATION: FALLING GOLDEN STARS + 5-MIN INVINCIBLE BANNER
// ============================================================================

export const BossDefeatStarShower: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;

  const stars = [
    { left: '8%', delay: 0, duration: 2.3 },
    { left: '20%', delay: 0.25, duration: 2.6 },
    { left: '34%', delay: 0.1, duration: 2.1 },
    { left: '48%', delay: 0.4, duration: 2.5 },
    { left: '62%', delay: 0.15, duration: 2.4 },
    { left: '76%', delay: 0.35, duration: 2.2 },
    { left: '89%', delay: 0.2, duration: 2.7 },
  ];

  return (
    <div
      data-testid="boss-defeat-star-shower"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-20"
    >
      {stars.map((st, idx) => (
        <motion.div
          key={idx}
          initial={{ y: -36, opacity: 1, rotate: 0, scale: 0.9 }}
          animate={{ y: 380, opacity: [1, 1, 0], rotate: 360, scale: [0.9, 1.15, 0.85] }}
          transition={{
            duration: st.duration,
            delay: st.delay,
            repeat: 2,
            ease: 'easeIn',
          }}
          style={{ left: st.left }}
          className="absolute top-0"
        >
          <MarioStarIcon className="w-7 h-7 drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)]" />
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// 3. QUIZ RESULTS ANALYTICS PANEL (RECHARTS SKILL BREAKDOWN + RANK BAR + SUMMARY)
// ============================================================================

interface QuizAnalyticsPanelProps {
  records: readonly { worldCode: string; isCorrect: boolean }[];
  missedQuestions: readonly MissedQuestionBriefInput[];
  quizHistory?: readonly QuizHistoryRecord[];
  currentRunCorrect: number;
}

export const QuizAnalyticsPanel: React.FC<QuizAnalyticsPanelProps> = ({
  records,
  missedQuestions,
  quizHistory = [],
  currentRunCorrect,
}) => {
  const [showSummary, setShowSummary] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedToNotes, setSavedToNotes] = useState(false);

  const skillData = useMemo(() => computeQuizSkillBreakdown(records), [records]);
  const rankInfo = useMemo(
    () =>
      computeBarMasterRankProgress({
        quizHistory,
        fallbackCurrentCorrect: currentRunCorrect,
      }),
    [quizHistory, currentRunCorrect]
  );
  const studySummary = useMemo(
    () => buildMissedTopicsStudySummary(missedQuestions),
    [missedQuestions]
  );

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard?.writeText(studySummary.plainTextForNotes);
      setCopied(true);
      marioAudio.playCoin();
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleSaveToStudyNotes = () => {
    if (typeof window !== 'undefined') {
      appendQuickTextToStudyNotes(
        window.localStorage,
        'Quiz Quick Study Summary',
        studySummary.plainTextForNotes
      );
      setSavedToNotes(true);
      marioAudio.playPowerUp();
      window.setTimeout(() => setSavedToNotes(false), 2600);
    }
  };

  return (
    <div
      data-testid="quiz-analytics-panel"
      className="rounded-2xl bg-slate-900 text-white border-3 border-black p-4 sm:p-5 space-y-5 shadow-[4px_4px_0_#000] text-left"
    >
      {/* 1. Quiz Progress Tracker toward Next Bar Master Rank */}
      <div
        data-testid="bar-master-rank-tracker"
        className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-black uppercase text-amber-300 font-display">
              Quiz Progress Tracker · Rank {rankInfo.rankIndex}/{rankInfo.totalRanks}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-300 tabular-nums">
            {rankInfo.totalCorrectAnswers} Cumulative Correct Answers
          </span>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-base sm:text-lg font-black font-display text-white">
            {rankInfo.currentRankTitle}
          </h4>
          <span className="text-xs font-semibold text-slate-300 tabular-nums">
            {rankInfo.nextRankTitle
              ? `${rankInfo.remainingCorrectToNext} more correct to ${rankInfo.nextRankTitle}`
              : 'Maximum Rank Achieved!'}
          </span>
        </div>

        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 transition-all duration-500"
            style={{ width: `${Math.max(6, rankInfo.progressPercent)}%` }}
          />
        </div>
      </div>

      {/* 2. Recharts 'Skill Breakdown' Bar Chart */}
      {skillData.length > 0 && (
        <div className="space-y-2.5" data-testid="recharts-skill-breakdown">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm sm:text-base font-black font-display text-amber-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>SKILL BREAKDOWN BY LABOR LAW PILLAR</span>
            </h4>
            <span className="text-xs font-semibold text-slate-400">Accuracy (%)</span>
          </div>

          <div className="w-full h-52 bg-slate-950 rounded-2xl p-3 border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 700 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#fbbf24',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: unknown, _name: unknown, props: { payload?: { correct?: number; total?: number; skillLabel?: string } }) => {
                    const p = props?.payload;
                    return [
                      `${val}% (${p?.correct ?? 0}/${p?.total ?? 0} correct)`,
                      p?.skillLabel || 'Accuracy',
                    ];
                  }}
                />
                <Bar dataKey="accuracyPercent" radius={[8, 8, 0, 0]} maxBarSize={44}>
                  {skillData.map((entry) => (
                    <Cell
                      key={entry.skillKey}
                      fill={
                        entry.accuracyPercent >= 80
                          ? '#34d399'
                          : entry.accuracyPercent >= 50
                          ? '#fbbf24'
                          : '#f43f5e'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 3. 'Quick Study Summary' Generator for Missed Doctrines */}
      <div className="pt-1 border-t border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-black text-white block">
              Targeted Post-Quiz Study Brief
            </span>
            <span className="text-[11px] text-slate-400">
              Generate a concise statutory summary of missed questions for rapid retention.
            </span>
          </div>

          <button
            type="button"
            data-testid="generate-quick-study-summary-btn"
            onClick={() => {
              setShowSummary((v) => !v);
              marioAudio.playClick();
            }}
            className="min-h-[40px] px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>{showSummary ? 'Hide Quick Study Summary' : 'Quick Study Summary'}</span>
          </button>
        </div>

        {showSummary && (
          <div
            data-testid="quick-study-summary-box"
            className="bg-slate-950 rounded-2xl border border-amber-400/60 p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h5 className="text-xs sm:text-sm font-black text-amber-300">
                {studySummary.headline}
              </h5>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="min-h-[34px] px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-600 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  data-testid="save-summary-to-notes-btn"
                  onClick={handleSaveToStudyNotes}
                  className="min-h-[34px] px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black border border-black inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {savedToNotes ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved All to Notes!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>Save All to Notes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {studySummary.items.length === 0 ? (
              <p className="text-xs text-emerald-300 font-semibold">
                Zero missed doctrines in this run — your statutory mastery was spotless!
              </p>
            ) : (
              <ul className="space-y-2.5 text-xs">
                {studySummary.items.map((item, idx) => {
                  const sourceMissed = missedQuestions[idx];
                  return (
                    <li
                      key={idx}
                      data-testid={`quick-study-summary-item-${idx}`}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono font-black text-amber-300">
                          {idx + 1}. {item.legalBasis}
                        </span>
                        <SaveSingleQuizErrorButton
                          testId={`save-summary-error-item-${idx}`}
                          compact
                          darkSurface
                          errorItem={{
                            scenario: sourceMissed?.scenario || item.correctRule,
                            correctOptionText: item.correctRule,
                            chosenOptionText: sourceMissed?.chosenOptionText,
                            legalBasis: item.legalBasis,
                            explanation: item.doctrinalNote,
                            worldCode: sourceMissed?.worldCode,
                            quizModeLabel: sourceMissed?.quizModeLabel || 'Quiz Summary',
                          }}
                        />
                      </div>
                      <p className="font-bold text-white">Rule: {item.correctRule}</p>
                      <p className="text-slate-300 leading-relaxed">{item.doctrinalNote}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
