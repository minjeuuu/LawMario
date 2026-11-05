import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FlagpoleStreakState,
  getFlagpoleProgress,
  claimFlagpoleMilestone,
  saveFlagpoleStreak,
  FLAGPOLE_5DAY_BONUS_XP,
  FLAGPOLE_BADGE_MULTIPLIER_VALUE,
} from '../utils/quizFlagpoleStreak';
import { MarioCharacterAvatar, MarioStarIcon, MarioCoinIcon } from './MarioIcons';
import { MarioAvatar } from '../types/laborLaw';
import { marioAudio } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface FlagpoleStreakWidgetProps {
  streakState: FlagpoleStreakState;
  onUpdateStreakState: (nextState: FlagpoleStreakState) => void;
  onAwardBonusXp?: (xp: number) => void;
  equippedAvatar?: MarioAvatar;
  onStartDailyQuiz?: () => void;
  compact?: boolean;
}

export const FlagpoleStreakWidget: React.FC<FlagpoleStreakWidgetProps> = ({
  streakState,
  onUpdateStreakState,
  onAwardBonusXp,
  equippedAvatar = 'mario',
  onStartDailyQuiz,
  compact = false,
}) => {
  const [justClaimed, setJustClaimed] = useState(false);
  const progress = getFlagpoleProgress(streakState);

  const handleClaim = () => {
    const res = claimFlagpoleMilestone(streakState, 5);
    if (!res.success) return;

    onUpdateStreakState(res.nextState);
    if (typeof window !== 'undefined') {
      saveFlagpoleStreak(res.nextState, window.localStorage);
    }

    if (onAwardBonusXp) {
      onAwardBonusXp(res.xpAwarded);
    }

    setJustClaimed(true);
    marioAudio.playPowerUp();

    // Trigger celebratory Mario fireworks
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899'],
      });
    } catch {}

    setTimeout(() => setJustClaimed(false), 5000);
  };

  const steps = [1, 2, 3, 4, 5];
  const flagHeightPercent = Math.min(100, (progress.dayOfCycle / 5) * 100);

  return (
    <div
      data-testid="flagpole-streak-widget"
      className={`relative rounded-2xl bg-gradient-to-b from-sky-900 via-slate-900 to-slate-950 text-white border-3 border-black shadow-[4px_4px_0_#000] p-4 sm:p-5 overflow-hidden transition-all ${
        compact ? 'p-3' : 'p-5'
      }`}
    >
      {/* Background Clouds / Sky Ambience */}
      <div className="absolute top-2 left-4 w-12 h-5 bg-white/10 rounded-full blur-[1px] pointer-events-none" />
      <div className="absolute top-4 right-10 w-20 h-6 bg-white/10 rounded-full blur-[1px] pointer-events-none" />

      {/* Header Info */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0_#000]">
            <Trophy className="w-5 h-5 text-red-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase text-amber-300 font-display tracking-tight">
                5-Day Flagpole Streak
              </span>
              {progress.isMultiplierActive && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 border border-black animate-pulse">
                  <Zap className="w-2.5 h-2.5 fill-current" />
                  {FLAGPOLE_BADGE_MULTIPLIER_VALUE}x MULTIPLIER
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300">
              Clear 1 daily quiz for 5 consecutive days to trigger the Super Flagpole Bonus!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-700">
            Streak: <span className="text-white font-black text-sm">{streakState.currentStreak}</span> / 5 Days
          </span>
          {streakState.bestStreak > 0 && (
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              (Best: {streakState.bestStreak}d)
            </span>
          )}
        </div>
      </div>

      {/* Flagpole Arena Layout */}
      <div className="relative z-10 pt-4 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left / Center: Interactive Visual Mario Flagpole */}
        <div className="flex items-end justify-center w-full md:w-auto gap-4 py-2">
          {/* Flagpole structure */}
          <div className="relative flex flex-col items-center">
            {/* Golden Sphere Finial on Top */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 border-2 border-black shadow-[0_0_10px_rgba(251,191,36,0.6)] flex items-center justify-center z-20">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>

            {/* The Metal Pole */}
            <div className="relative w-2.5 h-44 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 border-x border-black shadow-inner">
              {/* Day graduation ticks */}
              {steps.map((step) => (
                <div
                  key={step}
                  className="absolute w-3.5 h-0.5 bg-black left-1/2 -translate-x-1/2"
                  style={{ bottom: `${(step / 5) * 100}%` }}
                />
              ))}

              {/* Sliding Mario Flag */}
              <motion.div
                className="absolute left-2.5 flex items-center z-10"
                initial={false}
                animate={{
                  bottom: `${Math.max(5, Math.min(90, flagHeightPercent))}%`,
                }}
                transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              >
                <div className="flex items-center">
                  {/* Triangular Mario Flag */}
                  <div
                    className="w-0 h-0 border-t-[14px] border-t-transparent border-b-[14px] border-b-transparent border-l-[32px] border-l-red-600 drop-shadow-[2px_2px_0_#000]"
                  />
                  <div className="-ml-6 z-10 w-4 h-4 rounded-full bg-amber-400 border border-black flex items-center justify-center">
                    <span className="text-[9px] font-black font-mario text-slate-950">M</span>
                  </div>
                </div>
              </motion.div>

              {/* Sliding Mario Character */}
              <motion.div
                className="absolute -left-6 z-20"
                initial={false}
                animate={{
                  bottom: `${Math.max(0, Math.min(85, flagHeightPercent - 6))}%`,
                }}
                transition={{ type: 'spring', stiffness: 90, damping: 14 }}
              >
                <div className="w-7 h-7 bg-amber-400 rounded-lg border-2 border-black shadow flex items-center justify-center">
                  <MarioCharacterAvatar character={equippedAvatar} className="w-5 h-5" />
                </div>
              </motion.div>
            </div>

            {/* Brick Stair Base */}
            <div className="w-14 h-4 bg-amber-700 border-2 border-black rounded-sm shadow-[0_2px_0_#000] flex items-center justify-center">
              <div className="w-full h-full bg-[repeating-linear-gradient(90deg,#78350f,#78350f_6px,#92400e_6px,#92400e_12px)] opacity-60" />
            </div>
            {/* Green Hill Floor */}
            <div className="w-24 h-2.5 bg-emerald-600 rounded-t-lg border-t-2 border-x-2 border-black" />
          </div>

          {/* Stepper Timeline Buttons */}
          <div className="flex flex-col gap-1.5 min-w-[170px]">
            {steps.map((day) => {
              const reached = progress.dayOfCycle >= day;
              const isTodayTarget = progress.dayOfCycle + 1 === day;
              return (
                <div
                  key={day}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                    reached
                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                      : isTodayTarget
                      ? 'bg-amber-950/60 border-amber-400 text-amber-200 animate-pulse'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black font-mario ${
                        reached
                          ? 'bg-emerald-400 text-slate-950'
                          : isTodayTarget
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {day}
                    </span>
                    <span className="font-bold">Day {day} Quiz</span>
                  </div>

                  {reached ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : day === 5 ? (
                    <span className="text-[10px] font-black text-amber-400 uppercase">
                      +500 XP
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Pending</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Milestone Rewards & Claim Actions */}
        <div className="flex-1 max-w-sm space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-amber-300 font-display flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              5-Day Flagpole Rewards
            </h4>
            <ul className="text-xs text-slate-300 space-y-1">
              <li className="flex items-center gap-1.5">
                <span className="text-amber-400 font-black">+500</span> User Level Experience Points
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-black">1.5x</span> 24-Hour Quiz Score & Badge Multiplier
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-sky-300 font-black">Permanent</span> 5-Day Flagpole Champion Trophy
              </li>
            </ul>
          </div>

          {/* Multiplier status if active */}
          {progress.isMultiplierActive && (
            <div className="p-2.5 bg-amber-950/40 border border-amber-500/70 rounded-lg flex items-center gap-2 text-xs text-amber-200">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold">1.5x Multiplier Active!</span>
                <p className="text-[10px] text-amber-300/80 font-mono">
                  Expires in ~{Math.ceil(progress.multiplierRemainingMinutes / 60)}h ({progress.multiplierRemainingMinutes} mins)
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          {progress.hasUnclaimed5Day ? (
            <button
              onClick={handleClaim}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase rounded-xl border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-slate-950" />
              Claim 500 XP & 1.5x Multiplier!
            </button>
          ) : progress.dayOfCycle < 5 && onStartDailyQuiz ? (
            <button
              onClick={onStartDailyQuiz}
              className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase rounded-xl border-2 border-black shadow-[0_2px_0_#000] cursor-pointer flex items-center justify-center gap-1.5"
            >
              Take Today&apos;s Quiz to Advance Flag
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="text-center py-1 text-[11px] text-emerald-400 font-mono font-bold">
              {progress.hasReached5Day
                ? 'Flagpole Mastered! Keep clearing daily quizzes to maintain your streak.'
                : 'Complete daily quizzes to climb the flagpole!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
