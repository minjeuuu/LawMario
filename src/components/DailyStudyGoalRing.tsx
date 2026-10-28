import React, { useState, useEffect, useMemo } from 'react';
import { Target, Award, Clock, Sparkles, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { MarioCoinIcon, MarioMushroomIcon, MarioStarIcon, MarioFireFlowerIcon } from './MarioIcons';
import { marioAudio } from '../utils/audio';
import confetti from 'canvas-confetti';
import { formatLocalDayKey } from '../utils/studyModes';

interface DailyStudyGoalRingProps {
  studiedSeconds: number;
  onEarnCoins?: (amount: number) => void;
  superStarActive?: boolean;
}

const DAILY_GOAL_STORAGE_KEY = 'mario_daily_study_goal_minutes_v1';
const GOAL_REWARD_CLAIMED_PREFIX = 'mario_study_goal_reward_claimed_';

export const DailyStudyGoalRing: React.FC<DailyStudyGoalRingProps> = ({
  studiedSeconds,
  onEarnCoins,
  superStarActive = false,
}) => {
  const [targetMinutes, setTargetMinutes] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(DAILY_GOAL_STORAGE_KEY);
        const parsed = parseInt(saved || '30', 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
      } catch {
        return 30;
      }
    }
    return 30;
  });

  const todayKey = useMemo(() => formatLocalDayKey(new Date()), []);

  const [hasCelebrated, setHasCelebrated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(`${GOAL_REWARD_CLAIMED_PREFIX}${todayKey}`) === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const currentMinutes = useMemo(() => {
    return Math.floor(Math.max(0, studiedSeconds) / 60);
  }, [studiedSeconds]);

  const percent = useMemo(() => {
    if (targetMinutes <= 0) return 100;
    return Math.min(100, Math.round((currentMinutes / targetMinutes) * 100));
  }, [currentMinutes, targetMinutes]);

  const isGoalReached = percent >= 100;

  // Award goal completion bonus once per day
  useEffect(() => {
    if (isGoalReached && !hasCelebrated) {
      setHasCelebrated(true);
      try {
        localStorage.setItem(`${GOAL_REWARD_CLAIMED_PREFIX}${todayKey}`, 'true');
      } catch {
        // ignore
      }
      const reward = superStarActive ? 50 : 25;
      if (onEarnCoins) {
        onEarnCoins(reward);
      }
      marioAudio.playFanfare();
      try {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    }
  }, [isGoalReached, hasCelebrated, onEarnCoins, superStarActive, todayKey]);

  const handleSelectTarget = (mins: number) => {
    setTargetMinutes(mins);
    try {
      localStorage.setItem(DAILY_GOAL_STORAGE_KEY, String(mins));
    } catch {
      // ignore
    }
    marioAudio.playCoin();
  };

  // SVG Ring calculation
  const radius = 46;
  const stroke = 9;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div
      data-testid="daily-study-goal-ring"
      className="bg-slate-900/95 border-3 border-amber-400 rounded-3xl p-4 sm:p-5 text-white shadow-[5px_5px_0_#000] relative overflow-hidden"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Left: Interactive Progress Ring */}
        <div className="flex items-center gap-4">
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg height={radius * 2 + 16} width={radius * 2 + 16} className="-rotate-90 transform">
              <circle
                stroke="#1e293b"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius + 8}
                cy={radius + 8}
              />
              <circle
                stroke={isGoalReached ? '#10b981' : '#f59e0b'}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius + 8}
                cy={radius + 8}
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              {isGoalReached ? (
                <div className="flex flex-col items-center">
                  <MarioStarIcon className="w-6 h-6 animate-pulse" />
                  <span className="text-[11px] font-black font-mario text-emerald-400 mt-0.5">100%</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-base sm:text-lg font-black font-mario text-amber-300 leading-none">
                    {percent}%
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase mt-0.5">
                    {currentMinutes}m / {targetMinutes}m
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-black font-mario text-[10px] uppercase border border-black leading-none">
                DAILY GOAL
              </span>
              <span className="text-[11px] font-mono font-bold text-amber-300">
                {isGoalReached ? 'Target Accomplished!' : `${Math.max(0, targetMinutes - currentMinutes)} min remaining`}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white font-display">
              {isGoalReached ? 'Bar Mastery Goal Reached!' : 'Daily Statutory Study Goal'}
            </h3>

            <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-sm">
              {isGoalReached
                ? 'Outstanding focus! You earned your +25 Gold Coins daily study milestone.'
                : 'Duration updates in real-time as you read topics, practice flashcards, and solve quizzes.'}
            </p>
          </div>
        </div>

        {/* Right: Configurable Target Selector */}
        <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-400 font-mario">
            <Target className="w-3.5 h-3.5" />
            <span>CONFIGURE DAILY TARGET:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[15, 30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                type="button"
                data-testid={`goal-target-${mins}m`}
                onClick={() => handleSelectTarget(mins)}
                className={`min-h-[36px] px-3 rounded-xl font-black text-xs border-2 border-black cursor-pointer transition-all ${
                  targetMinutes === mins
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000] -translate-y-0.5'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>

          <div className="text-[10px] font-mono text-slate-400 pt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Session: {Math.floor(studiedSeconds / 60)}m {studiedSeconds % 60}s logged today</span>
          </div>
        </div>
      </div>
    </div>
  );
};
