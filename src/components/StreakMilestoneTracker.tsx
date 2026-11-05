import React from 'react';
import {
  MarioGoombaIcon,
  MarioMushroomIcon,
  MarioFireFlowerIcon,
  MarioStarIcon,
  MarioYoshiEggIcon,
  MarioPeachCrownIcon,
  Mario1UpIcon,
  MarioCharacterAvatar,
} from './MarioIcons';
import { Flame, CheckCircle2, Lock, Sparkles, Award } from 'lucide-react';

export interface StreakMilestoneSpec {
  days: number;
  id: string;
  title: string;
  subtitle: string;
  perk: string;
  iconType: 'goomba' | 'mushroom' | 'flower' | 'star' | 'egg' | 'feather' | 'crown' | 'juris';
}

export const CONSECUTIVE_STREAK_MILESTONES: readonly StreakMilestoneSpec[] = [
  {
    days: 1,
    id: 'streak_1d',
    title: 'Goomba Initiate',
    subtitle: 'Day 1 Study Kickoff',
    perk: 'Mushroom Kingdom Law Trail registration',
    iconType: 'goomba',
  },
  {
    days: 3,
    id: 'streak_3d',
    title: 'Super Mushroom Explorer',
    subtitle: '3-Day Consecutive Study',
    perk: '+50 Bonus Coins & Enhanced Digest Speed',
    iconType: 'mushroom',
  },
  {
    days: 5,
    id: 'streak_5d',
    title: 'Fire Flower Flame Master',
    subtitle: '5-Day Flagpole Streak',
    perk: '+500 XP & 1.5x Badge Multiplier for 24h',
    iconType: 'flower',
  },
  {
    days: 7,
    id: 'streak_7d',
    title: 'Super Star Invincible',
    subtitle: '7-Day Unbroken Week',
    perk: 'Invincible Shield against 1 incorrect quiz answer',
    iconType: 'star',
  },
  {
    days: 14,
    id: 'streak_14d',
    title: 'Yoshi Egg Dedication',
    subtitle: '14-Day Study Discipline',
    perk: 'Double Egg Hatches & 10% Shop Discount',
    iconType: 'egg',
  },
  {
    days: 30,
    id: 'streak_30d',
    title: 'Cape Feather Jurisprudence',
    subtitle: '30-Day Monthly Marathon',
    perk: 'Permanent Golden Mario Avatar clearance',
    iconType: 'feather',
  },
  {
    days: 50,
    id: 'streak_50d',
    title: 'Princess Royal Crown',
    subtitle: '50-Day Half-Century',
    perk: 'Crown of Labor Equity & Exclusive Profile Flair',
    iconType: 'crown',
  },
  {
    days: 100,
    id: 'streak_100d',
    title: 'Royal Juris Doctor Summa',
    subtitle: '100-Day Centennial Sovereign',
    perk: 'Top Distinction Diploma & Supreme Court Bench Access',
    iconType: 'juris',
  },
];

interface StreakMilestoneTrackerProps {
  currentStreakDays: number;
}

export const StreakMilestoneTracker: React.FC<StreakMilestoneTrackerProps> = ({
  currentStreakDays,
}) => {
  const safeStreak = Math.max(0, currentStreakDays);
  const nextMilestone =
    CONSECUTIVE_STREAK_MILESTONES.find((m) => m.days > safeStreak) || null;

  const earnedCount = CONSECUTIVE_STREAK_MILESTONES.filter(
    (m) => safeStreak >= m.days
  ).length;

  const renderBadgeIcon = (type: StreakMilestoneSpec['iconType'], isUnlocked: boolean) => {
    const iconClass = isUnlocked ? 'w-7 h-7' : 'w-7 h-7 grayscale opacity-40';
    switch (type) {
      case 'goomba':
        return <MarioGoombaIcon className={iconClass} />;
      case 'mushroom':
        return <MarioMushroomIcon className={iconClass} />;
      case 'flower':
        return <MarioFireFlowerIcon className={iconClass} />;
      case 'star':
        return <MarioStarIcon className={iconClass} />;
      case 'egg':
        return <MarioYoshiEggIcon className={iconClass} />;
      case 'feather':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
            <path d="M20 4C14 4 6 10 4 20C9 19 14 15 17 11L19 7Z" fill="#FBBF24" stroke="#0F172A" strokeWidth="2" />
            <path d="M4 20L10 14" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'crown':
        return <MarioPeachCrownIcon className={iconClass} />;
      case 'juris':
        return <MarioCharacterAvatar character="lawyertoad" className={iconClass} />;
      default:
        return <MarioStarIcon className={iconClass} />;
    }
  };

  return (
    <div
      data-testid="streak-milestone-tracker"
      className="bg-slate-900/90 border-2 border-amber-500/80 rounded-3xl p-4 sm:p-5 text-white space-y-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 border border-black flex items-center justify-center text-slate-950 font-black shadow-[0_2px_0_#000]">
            <Flame className="w-5 h-5 fill-red-600 text-red-700" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
              STUDY STREAK MILESTONES
            </span>
            <h3 className="text-base sm:text-lg font-black text-white font-display">
              Consecutive Study Day Pixel Badges
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-black/60 border border-amber-500/60 font-mono text-xs font-bold text-amber-300">
            {earnedCount} / {CONSECUTIVE_STREAK_MILESTONES.length} Badges Unlocked
          </span>
        </div>
      </div>

      {/* Current Progress Gauge */}
      {nextMilestone && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">
              Current Streak: <strong className="text-amber-300 font-mono">{safeStreak} Days</strong>
            </span>
            <span className="text-emerald-400">
              Next: <strong className="text-white">{nextMilestone.title}</strong> ({nextMilestone.days}d)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round((safeStreak / nextMilestone.days) * 100))}%`,
              }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {Math.max(1, nextMilestone.days - safeStreak)} more consecutive study day(s) to unlock {nextMilestone.title}!
          </div>
        </div>
      )}

      {/* Grid of 8 Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {CONSECUTIVE_STREAK_MILESTONES.map((badge) => {
          const isUnlocked = safeStreak >= badge.days;
          return (
            <div
              key={badge.id}
              data-testid={`streak-badge-${badge.id}`}
              className={`p-3 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-2 ${
                isUnlocked
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-400/90 shadow-md ring-1 ring-amber-400/30'
                  : 'bg-slate-950/60 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-lg bg-black/60 border border-slate-700 text-[10px] font-mono font-bold text-amber-300">
                  {badge.days}D STREAK
                </span>
                {isUnlocked ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>

              {/* Badge Icon */}
              <div className="flex justify-center py-1">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${
                    isUnlocked
                      ? 'bg-amber-400/20 border-amber-400 shadow-[0_2px_0_#000]'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  {renderBadgeIcon(badge.iconType, isUnlocked)}
                </div>
              </div>

              {/* Badge Title & Perk */}
              <div className="text-center space-y-0.5 min-w-0">
                <h4 className="text-xs font-black text-white font-display truncate">
                  {badge.title}
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold leading-tight line-clamp-2">
                  {badge.perk}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
