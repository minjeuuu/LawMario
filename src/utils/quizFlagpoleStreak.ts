// Pure, deterministic logic & state helpers for 5-Day Flagpole Quiz Streak
import { StorageLike, getLocalDateKey } from './round11Features';

export const FLAGPOLE_STREAK_STORAGE_KEY = 'mario_quiz_flagpole_streak_v1';
export const FLAGPOLE_5DAY_BONUS_XP = 500;
export const FLAGPOLE_BADGE_MULTIPLIER_VALUE = 1.5;
export const FLAGPOLE_MULTIPLIER_DURATION_HOURS = 24;

export interface FlagpoleStreakState {
  currentStreak: number;
  bestStreak: number;
  lastQuizDate: string | null;
  claimedMilestones: number[];
  multiplierActiveUntil: number | null;
}

export const DEFAULT_FLAGPOLE_STREAK_STATE: FlagpoleStreakState = {
  currentStreak: 0,
  bestStreak: 0,
  lastQuizDate: null,
  claimedMilestones: [],
  multiplierActiveUntil: null,
};

export function loadFlagpoleStreak(storage?: StorageLike): FlagpoleStreakState {
  if (!storage) return { ...DEFAULT_FLAGPOLE_STREAK_STATE };
  try {
    const raw = storage.getItem(FLAGPOLE_STREAK_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_FLAGPOLE_STREAK_STATE };
    const parsed = JSON.parse(raw) as Partial<FlagpoleStreakState>;
    return {
      currentStreak:
        typeof parsed.currentStreak === 'number' && Number.isFinite(parsed.currentStreak)
          ? Math.max(0, parsed.currentStreak)
          : 0,
      bestStreak:
        typeof parsed.bestStreak === 'number' && Number.isFinite(parsed.bestStreak)
          ? Math.max(0, parsed.bestStreak)
          : 0,
      lastQuizDate: typeof parsed.lastQuizDate === 'string' ? parsed.lastQuizDate : null,
      claimedMilestones: Array.isArray(parsed.claimedMilestones)
        ? parsed.claimedMilestones.filter((m): m is number => typeof m === 'number')
        : [],
      multiplierActiveUntil:
        typeof parsed.multiplierActiveUntil === 'number' ? parsed.multiplierActiveUntil : null,
    };
  } catch {
    return { ...DEFAULT_FLAGPOLE_STREAK_STATE };
  }
}

export function saveFlagpoleStreak(
  state: FlagpoleStreakState,
  storage?: StorageLike
): void {
  if (!storage) return;
  try {
    storage.setItem(FLAGPOLE_STREAK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function diffCalendarDays(earlierIsoDate: string, laterIsoDate: string): number {
  const [y1, m1, d1] = earlierIsoDate.split('-').map(Number);
  const [y2, m2, d2] = laterIsoDate.split('-').map(Number);
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return 999;
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / (24 * 3600 * 1000));
}

export function recordQuizForFlagpole(
  state: FlagpoleStreakState,
  dateKey: string = getLocalDateKey()
): {
  nextState: FlagpoleStreakState;
  streakIncremented: boolean;
  milestoneUnlocked: boolean;
} {
  if (state.lastQuizDate === dateKey) {
    return {
      nextState: state,
      streakIncremented: false,
      milestoneUnlocked: false,
    };
  }

  let nextStreak = 1;
  if (state.lastQuizDate) {
    const gap = diffCalendarDays(state.lastQuizDate, dateKey);
    if (gap === 1) {
      nextStreak = state.currentStreak + 1;
    } else if (gap === 0) {
      nextStreak = Math.max(1, state.currentStreak);
    } else {
      nextStreak = 1;
    }
  }

  const nextBest = Math.max(state.bestStreak, nextStreak);
  const milestoneUnlocked = nextStreak > 0 && nextStreak % 5 === 0;

  return {
    nextState: {
      ...state,
      currentStreak: nextStreak,
      bestStreak: nextBest,
      lastQuizDate: dateKey,
    },
    streakIncremented: true,
    milestoneUnlocked,
  };
}

export function claimFlagpoleMilestone(
  state: FlagpoleStreakState,
  milestoneDays = 5,
  nowMs: number = Date.now()
): {
  success: boolean;
  nextState: FlagpoleStreakState;
  xpAwarded: number;
  multiplierDurationHours: number;
} {
  if (
    state.currentStreak < milestoneDays ||
    state.claimedMilestones.includes(milestoneDays)
  ) {
    return {
      success: false,
      nextState: state,
      xpAwarded: 0,
      multiplierDurationHours: 0,
    };
  }

  const nextClaimed = [...state.claimedMilestones, milestoneDays];
  const multiplierActiveUntil =
    nowMs + FLAGPOLE_MULTIPLIER_DURATION_HOURS * 3600 * 1000;

  return {
    success: true,
    nextState: {
      ...state,
      claimedMilestones: nextClaimed,
      multiplierActiveUntil,
    },
    xpAwarded: FLAGPOLE_5DAY_BONUS_XP,
    multiplierDurationHours: FLAGPOLE_MULTIPLIER_DURATION_HOURS,
  };
}

export function getFlagpoleProgress(
  state: FlagpoleStreakState,
  nowMs: number = Date.now()
): {
  dayOfCycle: number;
  poleClimbPercent: number;
  hasReached5Day: boolean;
  hasUnclaimed5Day: boolean;
  isMultiplierActive: boolean;
  effectiveMultiplier: number;
  multiplierRemainingMinutes: number;
} {
  const streak = Math.max(0, state.currentStreak);
  const dayOfCycle = streak === 0 ? 0 : streak % 5 === 0 ? 5 : streak % 5;
  const poleClimbPercent = Math.min(100, Math.round((dayOfCycle / 5) * 100));
  const hasReached5Day = streak >= 5;
  const hasUnclaimed5Day =
    hasReached5Day && !state.claimedMilestones.includes(5);

  const remainingMs =
    typeof state.multiplierActiveUntil === 'number'
      ? Math.max(0, state.multiplierActiveUntil - nowMs)
      : 0;
  const isMultiplierActive = remainingMs > 0;
  const effectiveMultiplier = isMultiplierActive
    ? FLAGPOLE_BADGE_MULTIPLIER_VALUE
    : 1.0;
  const multiplierRemainingMinutes = Math.ceil(remainingMs / 60000);

  return {
    dayOfCycle,
    poleClimbPercent,
    hasReached5Day,
    hasUnclaimed5Day,
    isMultiplierActive,
    effectiveMultiplier,
    multiplierRemainingMinutes,
  };
}
