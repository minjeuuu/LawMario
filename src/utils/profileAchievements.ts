import { StorageLike } from './engagementFeatures';

export type ColorMode = 'light' | 'dark';

export const COLOR_MODE_STORAGE_KEY = 'mario_color_mode_v1';
export const WALKTHROUGH_COMPLETED_KEY = 'mario_walkthrough_completed_v1';
export const PLAYER_STATS_STORAGE_KEY = 'mario_player_profile_stats_v1';
export const POMODORO_OVERLAY_PINNED_KEY = 'mario_pomodoro_overlay_pinned_v1';

export function readStoredColorMode(storage?: StorageLike | null): ColorMode {
  if (!storage) return 'light';
  try {
    const raw = storage.getItem(COLOR_MODE_STORAGE_KEY);
    return raw === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveStoredColorMode(mode: ColorMode, storage?: StorageLike | null): void {
  if (!storage) return;
  try {
    storage.setItem(COLOR_MODE_STORAGE_KEY, mode);
  } catch {
    // ignore storage errors
  }
}

export function shouldAutoOpenWalkthrough(
  locationSearch: string,
  storage?: StorageLike | null
): boolean {
  try {
    const normalized = locationSearch.startsWith('?')
      ? locationSearch.slice(1)
      : locationSearch;
    const params = new URLSearchParams(normalized);
    if (params.get('autostart') === '1') {
      return false;
    }
  } catch {
    // ignore malformed query string
  }

  if (!storage) return true;
  try {
    return storage.getItem(WALKTHROUGH_COMPLETED_KEY) !== 'true';
  } catch {
    return true;
  }
}

export function markWalkthroughCompleted(storage?: StorageLike | null): void {
  if (!storage) return;
  try {
    storage.setItem(WALKTHROUGH_COMPLETED_KEY, 'true');
  } catch {
    // ignore storage errors
  }
}

// ==================== PLAYER PROFILE & TELEMETRY STATS ====================

export interface DailyPomodoroRecord {
  sessions: number;
  minutes: number;
  activeSeconds?: number;
  interactionMinutes?: number;
}

export interface QuizHistoryRecord {
  id: string;
  timestamp: string;
  formattedDate: string;
  topicOrWorld: string;
  worldCode: string;
  correctCount: number;
  totalCount: number;
  scorePercent: number;
  isPerfect: boolean;
  isBossVictory?: boolean;
}

export interface PlayerProfileStats {
  playerName: string;
  studiedSeconds: number;
  pomodoroSessionsCompleted: number;
  quizzesCompleted: number;
  perfectWageQuizzes: number;
  bestWageQuizPercent: number;
  perfectAnyQuizzes: number;
  bossVictories: number;
  walkthroughCompleted: boolean;
  unlockedAchievementDates: Record<string, string>;
  dailyPomodoroLogs?: Record<string, DailyPomodoroRecord>;
  needsImprovementTopicIds?: string[];
  needsImprovementWorlds?: string[];
  quizHistory?: QuizHistoryRecord[];
}

export const DEFAULT_PLAYER_PROFILE_STATS: PlayerProfileStats = {
  playerName: 'Law Adventurer',
  studiedSeconds: 0,
  pomodoroSessionsCompleted: 0,
  quizzesCompleted: 0,
  perfectWageQuizzes: 0,
  bestWageQuizPercent: 0,
  perfectAnyQuizzes: 0,
  bossVictories: 0,
  walkthroughCompleted: false,
  unlockedAchievementDates: {},
  dailyPomodoroLogs: {},
  needsImprovementTopicIds: [],
  needsImprovementWorlds: [],
  quizHistory: [],
};

export function loadPlayerProfileStats(storage?: StorageLike | null): PlayerProfileStats {
  if (!storage) {
    return {
      ...DEFAULT_PLAYER_PROFILE_STATS,
      unlockedAchievementDates: {},
      dailyPomodoroLogs: {},
      needsImprovementTopicIds: [],
      needsImprovementWorlds: [],
    };
  }
  try {
    const raw = storage.getItem(PLAYER_STATS_STORAGE_KEY);
    const legacyPomodoros = Number(storage.getItem('mario_pomodoro_completed_sessions_v1') || '0') || 0;
    const walkthroughDone = storage.getItem(WALKTHROUGH_COMPLETED_KEY) === 'true';

    if (!raw) {
      return {
        ...DEFAULT_PLAYER_PROFILE_STATS,
        pomodoroSessionsCompleted: legacyPomodoros,
        studiedSeconds: legacyPomodoros * 25 * 60,
        walkthroughCompleted: walkthroughDone,
        unlockedAchievementDates: {},
        dailyPomodoroLogs: {},
        needsImprovementTopicIds: [],
        needsImprovementWorlds: [],
      };
    }

    const parsed = JSON.parse(raw) as Partial<PlayerProfileStats>;
    return {
      playerName:
        typeof parsed.playerName === 'string' && parsed.playerName.trim()
          ? parsed.playerName.trim()
          : DEFAULT_PLAYER_PROFILE_STATS.playerName,
      studiedSeconds: Math.max(0, Number(parsed.studiedSeconds) || 0),
      pomodoroSessionsCompleted: Math.max(
        legacyPomodoros,
        Number(parsed.pomodoroSessionsCompleted) || 0
      ),
      quizzesCompleted: Math.max(0, Number(parsed.quizzesCompleted) || 0),
      perfectWageQuizzes: Math.max(0, Number(parsed.perfectWageQuizzes) || 0),
      bestWageQuizPercent: Math.min(
        100,
        Math.max(0, Number(parsed.bestWageQuizPercent) || 0)
      ),
      perfectAnyQuizzes: Math.max(0, Number(parsed.perfectAnyQuizzes) || 0),
      bossVictories: Math.max(0, Number(parsed.bossVictories) || 0),
      walkthroughCompleted: Boolean(parsed.walkthroughCompleted || walkthroughDone),
      unlockedAchievementDates:
        parsed.unlockedAchievementDates && typeof parsed.unlockedAchievementDates === 'object'
          ? { ...parsed.unlockedAchievementDates }
          : {},
      dailyPomodoroLogs:
        parsed.dailyPomodoroLogs && typeof parsed.dailyPomodoroLogs === 'object'
          ? { ...parsed.dailyPomodoroLogs }
          : {},
      needsImprovementTopicIds: Array.isArray(parsed.needsImprovementTopicIds)
        ? parsed.needsImprovementTopicIds.filter((x): x is string => typeof x === 'string')
        : [],
      needsImprovementWorlds: Array.isArray(parsed.needsImprovementWorlds)
        ? parsed.needsImprovementWorlds.filter((x): x is string => typeof x === 'string')
        : [],
      quizHistory: Array.isArray(parsed.quizHistory)
        ? parsed.quizHistory.filter(
            (item): item is QuizHistoryRecord =>
              Boolean(item && typeof item === 'object' && typeof item.topicOrWorld === 'string')
          )
        : [],
    };
  } catch {
    return {
      ...DEFAULT_PLAYER_PROFILE_STATS,
      unlockedAchievementDates: {},
      dailyPomodoroLogs: {},
      needsImprovementTopicIds: [],
      needsImprovementWorlds: [],
    };
  }
}

export function toggleNeedsImprovementTopic(
  stats: PlayerProfileStats,
  topicId: string
): PlayerProfileStats {
  const cleanId = topicId.trim();
  if (!cleanId) return stats;
  const current = stats.needsImprovementTopicIds || [];
  const exists = current.includes(cleanId);
  const next = exists ? current.filter((id) => id !== cleanId) : [...current, cleanId];
  return {
    ...stats,
    needsImprovementTopicIds: next,
  };
}

export function toggleNeedsImprovementWorld(
  stats: PlayerProfileStats,
  worldId: string
): PlayerProfileStats {
  const cleanWorld = worldId.trim();
  if (!cleanWorld) return stats;
  const current = stats.needsImprovementWorlds || [];
  const exists = current.includes(cleanWorld);
  const next = exists ? current.filter((w) => w !== cleanWorld) : [...current, cleanWorld];
  return {
    ...stats,
    needsImprovementWorlds: next,
  };
}

export interface FireFlowerStreakProgress {
  streakDays: number;
  fireFlowersEarned: number;
  daysIntoCurrentCycle: number;
  daysRemainingToNextFlower: number;
  progressPercentToNextFlower: number;
  nextMilestoneDays: number;
  milestoneMarkers: {
    dayTarget: number;
    flowerIndex: number;
    achieved: boolean;
  }[];
}

export function computeFireFlowerStreakProgress(
  rawStreakDays: number,
  visibleFlowerSlots: number = 6
): FireFlowerStreakProgress {
  const streakDays = Math.max(0, Math.floor(Number.isFinite(rawStreakDays) ? rawStreakDays : 0));
  const fireFlowersEarned = Math.floor(streakDays / 5);
  const daysIntoCurrentCycle = streakDays % 5;
  const daysRemainingToNextFlower = 5 - daysIntoCurrentCycle;
  const progressPercentToNextFlower = Math.round((daysIntoCurrentCycle / 5) * 100);
  const nextMilestoneDays = (fireFlowersEarned + 1) * 5;

  const slotCount = Math.max(visibleFlowerSlots, fireFlowersEarned + 2);
  const milestoneMarkers = Array.from({ length: slotCount }, (_, idx) => {
    const dayTarget = (idx + 1) * 5;
    return {
      dayTarget,
      flowerIndex: idx + 1,
      achieved: streakDays >= dayTarget,
    };
  });

  return {
    streakDays,
    fireFlowersEarned,
    daysIntoCurrentCycle,
    daysRemainingToNextFlower,
    progressPercentToNextFlower,
    nextMilestoneDays,
    milestoneMarkers,
  };
}

export function savePlayerProfileStats(
  stats: PlayerProfileStats,
  storage?: StorageLike | null
): void {
  if (!storage) return;
  try {
    storage.setItem(PLAYER_STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore storage errors
  }
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateKey(): string {
  return formatDateKey(new Date());
}

function computeTotalDayMinutes(record: {
  sessions: number;
  activeSeconds?: number;
  interactionMinutes?: number;
  fallbackMinutes?: number;
}): number {
  const pomodoroFloorMinutes = Math.max(0, record.sessions) * 25;
  const secs = Math.max(0, record.activeSeconds || 0);
  const trackedActiveMinutes = secs >= 15 ? Math.max(1, Math.floor(secs / 60)) : 0;
  const baseMinutes = Math.max(
    pomodoroFloorMinutes,
    trackedActiveMinutes,
    Math.max(0, record.fallbackMinutes || 0)
  );
  return baseMinutes + Math.max(0, record.interactionMinutes || 0);
}

export function recordStudySeconds(
  stats: PlayerProfileStats,
  deltaSeconds: number,
  dateKey: string = getTodayDateKey()
): PlayerProfileStats {
  const safeDelta = Math.max(0, Math.floor(deltaSeconds));
  if (safeDelta === 0) return stats;

  const currentLogs = stats.dailyPomodoroLogs || {};
  const dayRecord = currentLogs[dateKey] || { sessions: 0, minutes: 0, activeSeconds: 0 };
  const nextActiveSeconds = (dayRecord.activeSeconds || 0) + safeDelta;
  const nextMinutes = computeTotalDayMinutes({
    sessions: dayRecord.sessions,
    activeSeconds: nextActiveSeconds,
    interactionMinutes: dayRecord.interactionMinutes,
    fallbackMinutes: dayRecord.minutes - (dayRecord.interactionMinutes || 0),
  });

  return {
    ...stats,
    studiedSeconds: stats.studiedSeconds + safeDelta,
    dailyPomodoroLogs: {
      ...currentLogs,
      [dateKey]: {
        ...dayRecord,
        activeSeconds: nextActiveSeconds,
        minutes: nextMinutes,
      },
    },
  };
}

export function getTodayStudiedSeconds(
  stats: PlayerProfileStats,
  dateKey: string = getTodayDateKey()
): number {
  const logs = stats.dailyPomodoroLogs || {};
  const dayRecord = logs[dateKey];
  if (dayRecord) {
    return Math.max(dayRecord.activeSeconds || 0, (dayRecord.minutes || 0) * 60);
  }
  const hasAnyLog = Object.keys(logs).length > 0;
  if (hasAnyLog) {
    return 0;
  }
  return stats.studiedSeconds;
}

export function recordPomodoroFocusFinish(
  stats: PlayerProfileStats,
  bonusCreditSeconds: number = 0,
  dateKey: string = getTodayDateKey()
): PlayerProfileStats {
  const currentLogs = stats.dailyPomodoroLogs || {};
  const dayRecord = currentLogs[dateKey] || { sessions: 0, minutes: 0, activeSeconds: 0 };
  const nextSessions = dayRecord.sessions + 1;
  const safeBonusSecs = Math.max(0, Math.floor(bonusCreditSeconds));
  const nextActiveSeconds = (dayRecord.activeSeconds || 0) + safeBonusSecs;
  const updatedDayRecord: DailyPomodoroRecord = {
    ...dayRecord,
    sessions: nextSessions,
    activeSeconds: nextActiveSeconds,
    minutes: Math.max(
      dayRecord.minutes + 25,
      computeTotalDayMinutes({
        sessions: nextSessions,
        activeSeconds: nextActiveSeconds,
        interactionMinutes: dayRecord.interactionMinutes,
      })
    ),
  };

  return {
    ...stats,
    pomodoroSessionsCompleted: stats.pomodoroSessionsCompleted + 1,
    studiedSeconds: stats.studiedSeconds + safeBonusSecs,
    dailyPomodoroLogs: {
      ...currentLogs,
      [dateKey]: updatedDayRecord,
    },
  };
}

export const DAILY_STUDY_GOAL_STORAGE_KEY = 'mario_daily_study_goal_minutes_v1';
export const DEFAULT_DAILY_STUDY_GOAL_MINUTES = 25;

export interface DailyStudyGoalStatus {
  targetMinutes: number;
  minutesToday: number;
  progressPercent: number;
  isGoalAchieved: boolean;
}

export function readStoredDailyStudyGoal(storage?: StorageLike | null): number {
  if (!storage) return DEFAULT_DAILY_STUDY_GOAL_MINUTES;
  try {
    const raw = storage.getItem(DAILY_STUDY_GOAL_STORAGE_KEY);
    const parsed = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DAILY_STUDY_GOAL_MINUTES;
  } catch {
    return DEFAULT_DAILY_STUDY_GOAL_MINUTES;
  }
}

export function saveStoredDailyStudyGoal(
  targetMinutes: number,
  storage?: StorageLike | null
): void {
  if (!storage) return;
  try {
    storage.setItem(DAILY_STUDY_GOAL_STORAGE_KEY, String(targetMinutes));
  } catch {
    // ignore
  }
}

export function computeDailyStudyGoalStatus(
  stats: PlayerProfileStats,
  targetMinutes: number,
  dateKey: string = getTodayDateKey()
): DailyStudyGoalStatus {
  const currentLogs = stats.dailyPomodoroLogs || {};
  const dayRecord = currentLogs[dateKey];
  const hasAnyDailyLogs = Object.keys(currentLogs).length > 0;
  const minutesToday = dayRecord
    ? dayRecord.minutes
    : hasAnyDailyLogs
    ? 0
    : Math.min(targetMinutes, Math.floor((stats.studiedSeconds % 86400) / 60));
  const progressPercent = Math.min(
    100,
    Math.round((minutesToday / Math.max(1, targetMinutes)) * 100)
  );
  return {
    targetMinutes,
    minutesToday,
    progressPercent,
    isGoalAchieved: minutesToday >= targetMinutes,
  };
}

export function recordInteractionStudyMinutes(
  stats: PlayerProfileStats,
  minutesToAdd: number,
  dateKey: string = getTodayDateKey()
): PlayerProfileStats {
  const safeMinutes = Math.max(1, Math.floor(minutesToAdd));
  const currentLogs = stats.dailyPomodoroLogs || {};
  const dayRecord = currentLogs[dateKey] || { sessions: 0, minutes: 0, activeSeconds: 0 };
  const nextInteractionMinutes = (dayRecord.interactionMinutes || 0) + safeMinutes;
  const updatedDayRecord: DailyPomodoroRecord = {
    ...dayRecord,
    sessions: dayRecord.sessions,
    interactionMinutes: nextInteractionMinutes,
    minutes: Math.max(
      dayRecord.minutes + safeMinutes,
      computeTotalDayMinutes({
        sessions: dayRecord.sessions,
        activeSeconds: dayRecord.activeSeconds,
        interactionMinutes: nextInteractionMinutes,
      })
    ),
  };

  return {
    ...stats,
    studiedSeconds: stats.studiedSeconds + safeMinutes * 60,
    dailyPomodoroLogs: {
      ...currentLogs,
      [dateKey]: updatedDayRecord,
    },
  };
}

export interface WeeklyPomodoroDayData {
  dateKey: string;
  dayLabel: string;
  shortDate: string;
  dateDisplay: string;
  sessions: number;
  minutes: number;
  activeSeconds: number;
  isToday: boolean;
}

export function getWeeklyPomodoroChartData(
  stats: PlayerProfileStats,
  referenceDate: Date = new Date(),
  weekOffset: number = 0
): WeeklyPomodoroDayData[] {
  const logs = stats.dailyPomodoroLogs || {};
  const result: WeeklyPomodoroDayData[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const safeOffset = Math.min(0, Math.floor(Number.isFinite(weekOffset) ? weekOffset : 0));
  const trueTodayKey = formatDateKey(referenceDate);

  const windowEnd = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  if (safeOffset !== 0) {
    windowEnd.setDate(windowEnd.getDate() + safeOffset * 7);
  }
  const windowEndDateKey = formatDateKey(windowEnd);

  // Only synthesize legacy Pomodoro bars when NO real per-day log exists yet on or before windowEndDateKey
  const hasRealLogInOrBeforeWindow = Object.keys(logs).some((k) => {
    const entry = logs[k];
    return (
      k <= windowEndDateKey &&
      Boolean(
        entry &&
          ((entry.sessions || 0) > 0 ||
            (entry.minutes || 0) > 0 ||
            (entry.activeSeconds || 0) > 0)
      )
    );
  });

  // 7-day rolling window ending on windowEnd
  for (let i = 6; i >= 0; i--) {
    const d = new Date(windowEnd.getFullYear(), windowEnd.getMonth(), windowEnd.getDate());
    d.setDate(d.getDate() - i);
    const dateKey = formatDateKey(d);
    const dayLabel = dayNames[d.getDay()];
    const shortDate = `${d.getMonth() + 1}/${d.getDate()}`;
    const dateDisplay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isToday = dateKey === trueTodayKey;

    const record = logs[dateKey];
    let sessions = record?.sessions || 0;
    let minutes = record?.minutes || 0;
    const activeSeconds = record?.activeSeconds || 0;

    if (
      !hasRealLogInOrBeforeWindow &&
      safeOffset === 0 &&
      sessions === 0 &&
      minutes === 0 &&
      stats.pomodoroSessionsCompleted > 0 &&
      i <= 3
    ) {
      if (isToday) {
        sessions = Math.max(1, Math.min(stats.pomodoroSessionsCompleted, 2));
      } else if (i === 1 && stats.pomodoroSessionsCompleted >= 2) {
        sessions = 2;
      } else if (i === 2 && stats.pomodoroSessionsCompleted >= 4) {
        sessions = 1;
      }
      minutes = sessions * 25;
    }

    result.push({
      dateKey,
      dayLabel,
      shortDate,
      dateDisplay,
      sessions,
      minutes,
      activeSeconds,
      isToday,
    });
  }

  return result;
}

export interface QuizCompletionPayload {
  worldCode: string; // e.g., 'W3', 'world3', 'all', 'W1', 'BOSS', 'HOLIDAYS', 'FLASHBACK'
  correctCount: number;
  totalCount: number;
  isBossVictory?: boolean;
  topicTitle?: string;
}

export function getQuizWorldDisplayName(worldCode: string): string {
  const norm = (worldCode || '').trim().toLowerCase();
  if (norm === 'boss') return 'Courtroom Boss Battle (Bowser)';
  if (norm === 'exam_sim' || norm === 'examsim') return '10-Question Bar Exam Simulation';
  if (norm === 'flashback') return 'Targeted Flashback Review';
  if (norm === 'holidays') return 'Philippine Holidays & Multipliers';
  if (norm === 'w1' || norm === 'world1') return 'World 1: Hours of Work';
  if (norm === 'w2' || norm === 'world2') return 'World 2: Rest & Holidays';
  if (norm === 'w3' || norm === 'world3' || norm === 'wages') return 'World 3: Wages & Wage Protection';
  if (norm === 'w4' || norm === 'world4') return 'World 4: Special Groups of Employees';
  if (norm === 'w5' || norm === 'world5') return 'World 5: Protective Labor Statutes';
  if (norm === 'w6' || norm === 'world6' || norm === 'leaves') return 'World 6: Statutory Leaves';
  if (norm === 'all') return 'All 6 Worlds Comprehensive Quiz';
  return `Quiz: ${worldCode.toUpperCase()}`;
}

export function isWageQuizWorld(worldCode: string): boolean {
  const normalized = (worldCode || '').trim().toLowerCase();
  return normalized === 'w3' || normalized === 'world3' || normalized === 'wages';
}

export function recordCompletedQuizRun(
  stats: PlayerProfileStats,
  payload: QuizCompletionPayload
): PlayerProfileStats {
  const total = Math.max(1, Math.floor(payload.totalCount));
  const correct = Math.min(total, Math.max(0, Math.floor(payload.correctCount)));
  const accuracy = Math.round((correct / total) * 100);
  const isPerfect = correct === total && payload.totalCount > 0;
  const isWage = isWageQuizWorld(payload.worldCode);

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const historyItem: QuizHistoryRecord = {
    id: `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now.toISOString(),
    formattedDate,
    topicOrWorld: payload.topicTitle || getQuizWorldDisplayName(payload.worldCode),
    worldCode: payload.worldCode,
    correctCount: correct,
    totalCount: total,
    scorePercent: accuracy,
    isPerfect,
    isBossVictory: Boolean(payload.isBossVictory),
  };

  const updatedHistory = [historyItem, ...(stats.quizHistory || [])].slice(0, 15);

  return {
    ...stats,
    quizzesCompleted: stats.quizzesCompleted + 1,
    perfectAnyQuizzes: stats.perfectAnyQuizzes + (isPerfect ? 1 : 0),
    perfectWageQuizzes: stats.perfectWageQuizzes + (isPerfect && isWage ? 1 : 0),
    bestWageQuizPercent: isWage
      ? Math.max(stats.bestWageQuizPercent, accuracy)
      : stats.bestWageQuizPercent,
    bossVictories: stats.bossVictories + (payload.isBossVictory ? 1 : 0),
    quizHistory: updatedHistory,
  };
}

export function formatStudyDuration(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const totalMinutes = Math.floor(clamped / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours === 0) {
    if (totalMinutes === 0 && clamped > 0) {
      return `${clamped}s`;
    }
    return `${mins}m`;
  }
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
}

// ==================== ACHIEVEMENTS & MILESTONE BADGES ====================

export type AchievementCategory = 'study_time' | 'quizzes' | 'mastery' | 'consistency';

export interface AchievementDefinition {
  id: string;
  title: string;
  milestoneLabel: string;
  description: string;
  category: AchievementCategory;
  coinReward: number;
  iconKey:
    | 'clock'
    | 'trophy'
    | 'wage_crown'
    | 'mushroom'
    | 'flame'
    | 'star'
    | 'bowser'
    | 'book'
    | 'notes'
    | 'compass';
  actionTab: string;
  actionWorld?: string;
  actionLabel: string;
}

export const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [
  {
    id: 'studied_5_hours',
    title: '5-Hour Star Scholar',
    milestoneLabel: 'Studied 5 hours',
    description:
      'Accumulate 5 full hours (300 minutes) of active statutory reading and Pomodoro focus sessions.',
    category: 'study_time',
    coinReward: 100,
    iconKey: 'clock',
    actionTab: 'modules',
    actionLabel: 'Study Modules',
  },
  {
    id: 'completed_10_quizzes',
    title: '10-Quiz Castle Veteran',
    milestoneLabel: 'Completed 10 Quizzes',
    description:
      'Complete 10 quiz runs across Quick Tests, Practice Arena marathons, or Bowser Boss Battles.',
    category: 'quizzes',
    coinReward: 75,
    iconKey: 'trophy',
    actionTab: 'quiz',
    actionLabel: 'Take a Quiz',
  },
  {
    id: 'perfect_wage_quiz',
    title: 'Wage & D.O. 174 Grandmaster',
    milestoneLabel: 'Perfect score on Wage Quiz',
    description:
      'Achieve a 100% perfect score on any World 3 (Wages, Minimum Wage & D.O. 174) Quick Test or Practice Quiz.',
    category: 'quizzes',
    coinReward: 60,
    iconKey: 'wage_crown',
    actionTab: 'quiz',
    actionWorld: 'world3',
    actionLabel: 'Launch Wage Quiz',
  },
  {
    id: 'first_pomodoro',
    title: 'Mushroom Focus Initiate',
    milestoneLabel: 'Complete 1 Pomodoro Focus Block',
    description:
      'Finish a focused Pomodoro study interval using the Navbar or Floating Screen Timer.',
    category: 'study_time',
    coinReward: 20,
    iconKey: 'mushroom',
    actionTab: 'modules',
    actionLabel: 'Start Focus Block',
  },
  {
    id: 'studied_1_hour',
    title: '60-Minute Fire Reader',
    milestoneLabel: 'Studied 1 hour',
    description:
      'Log at least 60 minutes of focused Philippine Labor Standards study time.',
    category: 'study_time',
    coinReward: 35,
    iconKey: 'flame',
    actionTab: 'modules',
    actionLabel: 'Keep Studying',
  },
  {
    id: 'first_quiz_clear',
    title: 'Stage 1 Quiz Challenger',
    milestoneLabel: 'Completed 1st Quiz',
    description:
      'Finish your very first Labor Standards Quick Test or Practice Quiz.',
    category: 'quizzes',
    coinReward: 15,
    iconKey: 'star',
    actionTab: 'quiz',
    actionLabel: 'Open Quiz Quest',
  },
  {
    id: 'bowser_slayer',
    title: "Bowser's Keep Conqueror",
    milestoneLabel: 'Defeat Bowser Boss Battle',
    description:
      'Deplete Bowser’s HP to zero under timed rapid-fire Labor Code scenarios.',
    category: 'quizzes',
    coinReward: 80,
    iconKey: 'bowser',
    actionTab: 'quiz',
    actionLabel: 'Fight Bowser',
  },
  {
    id: 'world_1_master',
    title: 'Overtime Guru',
    milestoneLabel: 'Master All World 1 Modules',
    description:
      'Complete every statutory module in World 1 (Articles 82–90 Hours of Work, Meal Periods, NSD & Overtime).',
    category: 'mastery',
    coinReward: 35,
    iconKey: 'clock',
    actionTab: 'modules',
    actionWorld: 'world1',
    actionLabel: 'Open World 1',
  },
  {
    id: 'world_2_master',
    title: 'Holiday & 13th Month Maven',
    milestoneLabel: 'Master All World 2 Modules',
    description:
      'Complete every statutory module in World 2 (Weekly Rest Days, Holiday Multipliers, Service Charges & P.D. 851 13th Month Pay).',
    category: 'mastery',
    coinReward: 35,
    iconKey: 'flame',
    actionTab: 'modules',
    actionWorld: 'world2',
    actionLabel: 'Open World 2',
  },
  {
    id: 'world_3_master',
    title: 'Wage Expert',
    milestoneLabel: 'Master All World 3 Modules',
    description:
      'Complete every statutory module in World 3 (Wages, Facilities vs. Supplements, Wage Distortion & DOLE D.O. 174 Subcontracting).',
    category: 'mastery',
    coinReward: 40,
    iconKey: 'wage_crown',
    actionTab: 'modules',
    actionWorld: 'world3',
    actionLabel: 'Open World 3',
  },
  {
    id: 'world_4_master',
    title: 'Special Groups Protector',
    milestoneLabel: 'Master All World 4 Modules',
    description:
      'Complete every statutory module in World 4 (Women Workers, Minors R.A. 9231, Batas Kasambahay R.A. 10361 & Homeworkers).',
    category: 'mastery',
    coinReward: 35,
    iconKey: 'mushroom',
    actionTab: 'modules',
    actionWorld: 'world4',
    actionLabel: 'Open World 4',
  },
  {
    id: 'world_5_master',
    title: 'Tenure & Safety Guardian',
    milestoneLabel: 'Master All World 5 Modules',
    description:
      'Complete every statutory module in World 5 (Security of Tenure, Anti-Sexual Harassment, Safe Spaces R.A. 11313 & OSHS R.A. 11058).',
    category: 'mastery',
    coinReward: 40,
    iconKey: 'trophy',
    actionTab: 'modules',
    actionWorld: 'world5',
    actionLabel: 'Open World 5',
  },
  {
    id: 'world_6_master',
    title: 'Statutory Leave Specialist',
    milestoneLabel: 'Master All World 6 Modules',
    description:
      'Complete every statutory module in World 6 (SIL, 105-Day Maternity, Paternity, Solo Parent R.A. 11861, Gynecological & VAWC Leaves).',
    category: 'mastery',
    coinReward: 40,
    iconKey: 'book',
    actionTab: 'modules',
    actionWorld: 'world6',
    actionLabel: 'Open World 6',
  },
  {
    id: 'all_worlds_master',
    title: '100% Statutory Sovereign',
    milestoneLabel: 'Complete All 6 Worlds',
    description:
      'Complete 100% of all unabridged Labor Standards, Protective Laws & Statutory Leaves modules across Worlds 1–6.',
    category: 'mastery',
    coinReward: 150,
    iconKey: 'star',
    actionTab: 'map',
    actionLabel: 'View World Map',
  },
  {
    id: 'streak_3_days',
    title: '3-Day Fire Streak',
    milestoneLabel: '3-Day Daily Login Streak',
    description:
      'Maintain a 3-day consecutive study login streak in the Mushroom Kingdom.',
    category: 'consistency',
    coinReward: 30,
    iconKey: 'flame',
    actionTab: 'map',
    actionLabel: 'Check Streak',
  },
  {
    id: 'note_crafter',
    title: 'Codal Note Architect',
    milestoneLabel: 'Save 3 Study Notes',
    description:
      'Create at least 3 personal mnemonics or codal notes in the right-side Study Notes Drawer.',
    category: 'consistency',
    coinReward: 25,
    iconKey: 'notes',
    actionTab: 'modules',
    actionLabel: 'Write Notes',
  },
  {
    id: 'tour_graduate',
    title: 'Adventure Guide Graduate',
    milestoneLabel: 'Complete Full App Guide',
    description:
      'Complete the interactive 10-chapter Super Mario Labor Adventure Walkthrough Guide.',
    category: 'consistency',
    coinReward: 25,
    iconKey: 'compass',
    actionTab: 'map',
    actionLabel: 'Open App Guide',
  },
] as const;

export interface WorldMasteryBadgeStatus {
  achievementId: string;
  worldId: string;
  worldNumber: number;
  badgeTitle: string;
  worldLabel: string;
  description: string;
  coinReward: number;
  iconKey: AchievementDefinition['iconKey'];
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export const WORLD_THEMATIC_BADGE_META: readonly {
  achievementId: string;
  worldId: string;
  worldNumber: number;
  badgeTitle: string;
  worldLabel: string;
  description: string;
  coinReward: number;
  iconKey: AchievementDefinition['iconKey'];
}[] = [
  {
    achievementId: 'world_1_master',
    worldId: 'world1',
    worldNumber: 1,
    badgeTitle: 'Overtime Guru',
    worldLabel: 'World 1 · Hours & Overtime',
    description: 'Complete all modules in World 1 (Arts. 82–90 Hours of Work, Meals, NSD & Overtime).',
    coinReward: 35,
    iconKey: 'clock',
  },
  {
    achievementId: 'world_2_master',
    worldId: 'world2',
    worldNumber: 2,
    badgeTitle: 'Holiday & 13th Month Maven',
    worldLabel: 'World 2 · Rest & Holidays',
    description: 'Complete all modules in World 2 (Rest Days, Holiday Pay, Service Charges & 13th Month).',
    coinReward: 35,
    iconKey: 'flame',
  },
  {
    achievementId: 'world_3_master',
    worldId: 'world3',
    worldNumber: 3,
    badgeTitle: 'Wage Expert',
    worldLabel: 'World 3 · Wages & D.O. 174',
    description: 'Complete all modules in World 3 (Minimum Wage, Deductions, Distortion & Contracting).',
    coinReward: 40,
    iconKey: 'wage_crown',
  },
  {
    achievementId: 'world_4_master',
    worldId: 'world4',
    worldNumber: 4,
    badgeTitle: 'Special Groups Protector',
    worldLabel: 'World 4 · Special Workers',
    description: 'Complete all modules in World 4 (Women, Working Children, Kasambahay & Homeworkers).',
    coinReward: 35,
    iconKey: 'mushroom',
  },
  {
    achievementId: 'world_5_master',
    worldId: 'world5',
    worldNumber: 5,
    badgeTitle: 'Tenure & Safety Guardian',
    worldLabel: 'World 5 · Protective Laws',
    description: 'Complete all modules in World 5 (Security of Tenure, Safe Spaces & OSHS R.A. 11058).',
    coinReward: 40,
    iconKey: 'trophy',
  },
  {
    achievementId: 'world_6_master',
    worldId: 'world6',
    worldNumber: 6,
    badgeTitle: 'Statutory Leave Specialist',
    worldLabel: 'World 6 · Statutory Leaves',
    description: 'Complete all modules in World 6 (SIL, Maternity, Paternity, Solo Parent & Special Leaves).',
    coinReward: 40,
    iconKey: 'book',
  },
] as const;

export function computeWorldMasteryBadges(
  completedTopicIds: readonly string[],
  allTopics: readonly { id: string; worldId: string }[],
  unlockedAchievementDates: Record<string, string> = {}
): WorldMasteryBadgeStatus[] {
  const completedSet = new Set(completedTopicIds);
  return WORLD_THEMATIC_BADGE_META.map((meta) => {
    const worldTopicIds = allTopics
      .filter((t) => t.worldId === meta.worldId)
      .map((t) => t.id);
    const totalCount = worldTopicIds.length;
    const completedCount = worldTopicIds.filter((id) => completedSet.has(id)).length;
    const previouslyUnlocked = Boolean(unlockedAchievementDates[meta.achievementId]);
    const meetsAll = totalCount > 0 && completedCount >= totalCount;
    const unlocked = previouslyUnlocked || meetsAll;
    const progressPercent = unlocked
      ? 100
      : totalCount > 0
      ? Math.min(99, Math.round((completedCount / totalCount) * 100))
      : 0;

    return {
      ...meta,
      completedCount,
      totalCount,
      progressPercent,
      unlocked,
      unlockedAt: unlockedAchievementDates[meta.achievementId],
    };
  });
}

export interface AchievementEvaluationContext {
  stats: PlayerProfileStats;
  completedTopicIds: string[];
  totalTopicsCount: number;
  world1TopicIds: string[];
  topicsByWorld?: Record<string, string[]>;
  loginStreak: number;
  notesCount: number;
}

export interface EvaluatedAchievement extends AchievementDefinition {
  unlocked: boolean;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
  progressText: string;
  unlockedAt?: string;
}

export interface AchievementSyncResult {
  achievements: EvaluatedAchievement[];
  newlyUnlocked: EvaluatedAchievement[];
  updatedStats: PlayerProfileStats;
  totalBonusCoinsEarned: number;
}

export function evaluateAchievements(
  ctx: AchievementEvaluationContext,
  nowDateLabel: string = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
): AchievementSyncResult {
  const {
    stats,
    completedTopicIds,
    totalTopicsCount,
    world1TopicIds,
    topicsByWorld,
    loginStreak,
    notesCount,
  } = ctx;

  const completedSet = new Set(completedTopicIds);
  const studiedMinutes = Math.floor(stats.studiedSeconds / 60);
  const safeTotalTopics = Math.max(1, totalTopicsCount);

  const getWorldProgress = (worldKey: string, fallbackIds?: string[]) => {
    const ids = topicsByWorld?.[worldKey] ?? fallbackIds ?? [];
    if (ids.length === 0) {
      return { completed: 0, target: 1, hasTopics: false };
    }
    const completed = ids.filter((id) => completedSet.has(id)).length;
    return { completed, target: Math.max(1, ids.length), hasTopics: true };
  };

  const w1Prog = getWorldProgress('world1', world1TopicIds);
  const w2Prog = getWorldProgress('world2');
  const w3Prog = getWorldProgress('world3');
  const w4Prog = getWorldProgress('world4');
  const w5Prog = getWorldProgress('world5');
  const w6Prog = getWorldProgress('world6');

  const nextUnlockedDates: Record<string, string> = {
    ...stats.unlockedAchievementDates,
  };
  const newlyUnlocked: EvaluatedAchievement[] = [];
  let totalBonusCoinsEarned = 0;

  const achievements: EvaluatedAchievement[] = ACHIEVEMENT_DEFINITIONS.map((def) => {
    let currentValue = 0;
    let targetValue = 1;
    let progressText = '';
    let canUnlockByProgress = true;

    switch (def.id) {
      case 'studied_5_hours':
        currentValue = Math.min(300, studiedMinutes);
        targetValue = 300;
        progressText = `${formatStudyDuration(stats.studiedSeconds)} / 5h 00m`;
        break;
      case 'completed_10_quizzes':
        currentValue = Math.min(10, stats.quizzesCompleted);
        targetValue = 10;
        progressText = `${stats.quizzesCompleted} / 10 Quizzes`;
        break;
      case 'perfect_wage_quiz':
        currentValue = stats.perfectWageQuizzes >= 1 ? 100 : stats.bestWageQuizPercent;
        targetValue = 100;
        progressText =
          stats.perfectWageQuizzes >= 1
            ? '100% Perfect Cleared!'
            : `Best: ${stats.bestWageQuizPercent}% / 100%`;
        break;
      case 'first_pomodoro':
        currentValue = Math.min(1, stats.pomodoroSessionsCompleted);
        targetValue = 1;
        progressText = `${stats.pomodoroSessionsCompleted} / 1 Focus Block`;
        break;
      case 'studied_1_hour':
        currentValue = Math.min(60, studiedMinutes);
        targetValue = 60;
        progressText = `${Math.min(60, studiedMinutes)} / 60 mins`;
        break;
      case 'first_quiz_clear':
        currentValue = Math.min(1, stats.quizzesCompleted);
        targetValue = 1;
        progressText = `${Math.min(1, stats.quizzesCompleted)} / 1 Quiz`;
        break;
      case 'bowser_slayer':
        currentValue = Math.min(1, stats.bossVictories);
        targetValue = 1;
        progressText = `${stats.bossVictories} / 1 Boss Victory`;
        break;
      case 'world_1_master':
        currentValue = w1Prog.completed;
        targetValue = w1Prog.target;
        canUnlockByProgress = w1Prog.hasTopics;
        progressText = `${w1Prog.completed} / ${w1Prog.target} Modules`;
        break;
      case 'world_2_master':
        currentValue = w2Prog.completed;
        targetValue = w2Prog.target;
        canUnlockByProgress = w2Prog.hasTopics;
        progressText = w2Prog.hasTopics ? `${w2Prog.completed} / ${w2Prog.target} Modules` : '0 Modules';
        break;
      case 'world_3_master':
        currentValue = w3Prog.completed;
        targetValue = w3Prog.target;
        canUnlockByProgress = w3Prog.hasTopics;
        progressText = w3Prog.hasTopics ? `${w3Prog.completed} / ${w3Prog.target} Modules` : '0 Modules';
        break;
      case 'world_4_master':
        currentValue = w4Prog.completed;
        targetValue = w4Prog.target;
        canUnlockByProgress = w4Prog.hasTopics;
        progressText = w4Prog.hasTopics ? `${w4Prog.completed} / ${w4Prog.target} Modules` : '0 Modules';
        break;
      case 'world_5_master':
        currentValue = w5Prog.completed;
        targetValue = w5Prog.target;
        canUnlockByProgress = w5Prog.hasTopics;
        progressText = w5Prog.hasTopics ? `${w5Prog.completed} / ${w5Prog.target} Modules` : '0 Modules';
        break;
      case 'world_6_master':
        currentValue = w6Prog.completed;
        targetValue = w6Prog.target;
        canUnlockByProgress = w6Prog.hasTopics;
        progressText = w6Prog.hasTopics ? `${w6Prog.completed} / ${w6Prog.target} Modules` : '0 Modules';
        break;
      case 'all_worlds_master':
        currentValue = Math.min(safeTotalTopics, completedSet.size);
        targetValue = safeTotalTopics;
        progressText = `${completedSet.size} / ${safeTotalTopics} Modules`;
        break;
      case 'streak_3_days':
        currentValue = Math.min(3, loginStreak);
        targetValue = 3;
        progressText = `${loginStreak} / 3 Days`;
        break;
      case 'note_crafter':
        currentValue = Math.min(3, notesCount);
        targetValue = 3;
        progressText = `${notesCount} / 3 Notes`;
        break;
      case 'tour_graduate':
        currentValue = stats.walkthroughCompleted ? 1 : 0;
        targetValue = 1;
        progressText = stats.walkthroughCompleted ? 'Completed' : '0 / 1 Tour';
        break;
    }

    const previouslyUnlocked = Boolean(nextUnlockedDates[def.id]);
    const meetsThreshold = canUnlockByProgress && currentValue >= targetValue;
    const unlocked = previouslyUnlocked || meetsThreshold;
    const progressPercent = unlocked
      ? 100
      : Math.min(99, Math.max(0, Math.round((currentValue / targetValue) * 100)));

    if (unlocked && !previouslyUnlocked) {
      nextUnlockedDates[def.id] = nowDateLabel;
    }

    const evaluated: EvaluatedAchievement = {
      ...def,
      unlocked,
      currentValue,
      targetValue,
      progressPercent,
      progressText,
      unlockedAt: nextUnlockedDates[def.id],
    };

    if (unlocked && !previouslyUnlocked) {
      newlyUnlocked.push(evaluated);
      totalBonusCoinsEarned += def.coinReward;
    }

    return evaluated;
  });

  const updatedStats: PlayerProfileStats =
    newlyUnlocked.length > 0
      ? {
          ...stats,
          unlockedAchievementDates: nextUnlockedDates,
        }
      : stats;

  return {
    achievements,
    newlyUnlocked,
    updatedStats,
    totalBonusCoinsEarned,
  };
}

// ==================== 14-CHAPTER COMPLETE STEP-BY-STEP INTERACTIVE APP WALKTHROUGH ====================

export interface WalkthroughChapter {
  stepNumber: number;
  id: string;
  shortTitle: string;
  kicker: string;
  headline: string;
  summary: string;
  highlights: { label: string; detail: string }[];
  proTip: string;
  targetTab: string;
  ctaLabel: string;
}

export const WALKTHROUGH_CHAPTERS: readonly WalkthroughChapter[] = [
  {
    stepNumber: 1,
    id: 'welcome_setup',
    shortTitle: '1. Welcome & Setup',
    kicker: 'Step 01 · Getting Started',
    headline: 'Learn Philippine Workplace Rights & Labor Standards Step by Step',
    summary:
      'Welcome to Super Mario Labor Adventure — Created by Matthew (Main Creator of this Memory Aid). This interactive study guide helps college learners, future professionals, HR/business students, and everyday workers understand the Philippine Labor Code (Arts. 82–155), D.O. 174, R.A. 11360, P.D. 851, Kasambahay rules, Protective Laws, and Statutory Leaves with zero intimidating jargon.',
    highlights: [
      {
        label: '6 Easy-to-Follow Worlds',
        detail:
          'Hours of Work (W1), Rest & Holidays (W2), Wages & Contracting (W3), Special Groups (W4), Workplace Protections (W5), and Paid Leaves (W6).',
      },
      {
        label: 'Study Mode Switch',
        detail:
          'Choose Casual Mode for plain-English summaries and friendly hints, or Challenge Mode for 4-choice practical workplace scenarios.',
      },
      {
        label: 'Personalize Right Below',
        detail:
          'Pick your favorite Mario character, toggle Dark or Daylight mode, and choose your preferred reading comfort before jumping in.',
      },
    ],
    proTip:
      'You can reopen this Walkthrough anytime from the Guide button in the top bar or inside the mobile Menu drawer!',
    targetTab: 'map',
    ctaLabel: 'Explore Overworld Map',
  },
  {
    stepNumber: 2,
    id: 'header_navigation',
    shortTitle: '2. Top Bar & Controls',
    kicker: 'Step 02 · Header & Navigation Bar',
    headline: 'Every Top Bar Button, Search Tool, Audio Control & Utility Explained',
    summary:
      'The top navigation bar gives you one-tap access to every section of the app, plus global search, audio tracks, focus timers, font sizing, and instant A4 PDF downloads.',
    highlights: [
      {
        label: 'Search (Ctrl+K) & 1-Pg PDF',
        detail:
          'Click Search to jump straight to any Labor Code article, topic, or glossary term. Click 1-Pg PDF to download a 1-page A4 formulas & deadlines sheet.',
      },
      {
        label: 'Calculator, Shop & Profile',
        detail:
          'Launch the Pay Calculator, visit Toad’s Shop to spend Gold Coins, or click your Hero Avatar to view your Study Streak Calendar and Badges.',
      },
      {
        label: 'Music, SFX, Pomodoro & Text Size',
        detail:
          'Play 4 ambient chiptune tracks, mute sound effects, start a 25m/5m Pomodoro focus timer, toggle Dark/Daylight theme, or scale text (A / A+ / A++).',
      },
    ],
    proTip:
      'On phones, the bottom dock switches between Map, Modules, Cards, Quiz, and Arcade, while the top utility row gives quick access to Menu, Search, 1-Pg PDF, Calculator, and Shop.',
    targetTab: 'map',
    ctaLabel: 'Check Out Header Controls',
  },
  {
    stepNumber: 3,
    id: 'world_map_progression',
    shortTitle: '3. Overworld Map',
    kicker: 'Step 03 · Visual Progress Map',
    headline: 'Unlock Worlds 1 to 6, Daily Quests & Warp Pipe Shortcuts',
    summary:
      'The Overworld Map shows your real-time learning journey across all six Philippine Labor Standards worlds, lighting up paths and castles as you finish topics.',
    highlights: [
      {
        label: 'Interactive World Nodes',
        detail:
          'Tap any World node on the map to inspect its stage checklist, jump straight to a specific lesson, or mark a topic completed.',
      },
      {
        label: 'Coin Rewards & World Badges',
        detail:
          'Earn +2 Gold Coins for every module marked Studied, plus a +50 Coin World Clear bonus and a thematic badge when you finish 100% of a World.',
      },
      {
        label: 'Daily Streak & Quick Warp Pipes',
        detail:
          'Keep your daily study streak alive and use the map’s Warp Pipe buttons to hop directly to Holidays, Regional Wages, or the Calculator.',
      },
    ],
    proTip:
      'Check your Daily Study Goal bar on the map or Profile to build consistent 15-minute daily learning habits.',
    targetTab: 'map',
    ctaLabel: 'Open Overworld Map',
  },
  {
    stepNumber: 4,
    id: 'modules_command_deck',
    shortTitle: '4. Modules & Sorting',
    kicker: 'Step 04 · Modules Command Deck',
    headline: 'Filter by World, Switch Viewing Layouts & Sort Topics Your Way',
    summary:
      'The Modules tab organizes all 19 unabridged lessons with flexible filters, five viewing modes, a Quick-Jump index, and a Topic Sort dropdown right above the cards.',
    highlights: [
      {
        label: 'Topic Sort Dropdown Menu',
        detail:
          'Use the Sort Topics dropdown above the cards to order lessons by Stage Order, Alphabetical (A → Z), Difficulty (Easiest First), or Difficulty (Hardest First).',
      },
      {
        label: '5 Engaging View Modes',
        detail:
          'Switch between Stream (full cards), 2-Column Grid, Compact Outline, Focus Single-Topic reader, or Interactive Slide Deck mode.',
      },
      {
        label: 'Status Filters & Split Notes',
        detail:
          'Filter by All, Unread, Mastered, Flagged, or Pinned topics — and toggle Split Notes on desktop to type notes side-by-side while reading!',
      },
    ],
    proTip:
      'New to a topic? Sort by "Difficulty (Easiest First)" and turn on Beginner Depth to build confidence from foundational concepts upward!',
    targetTab: 'modules',
    ctaLabel: 'Browse & Sort Modules',
  },
  {
    stepNumber: 5,
    id: 'topic_card_lenses',
    shortTitle: '5. Inside Topic Cards',
    kicker: 'Step 05 · Interactive Module Cards',
    headline: 'Study Lenses, Voice Reader, Highlighted Terms & Quick Knowledge Checks',
    summary:
      'Every Topic Card is an interactive learning station packed with visual aids, plain-language takeaways, audio narration, and a built-in mini-quiz.',
    highlights: [
      {
        label: '4 Study Lenses Inside Every Card',
        detail:
          'Switch between Full Lesson, Key Rules Only, Visual Map (structured rule breakdown), and Self-Recall (blur-to-reveal memory check).',
      },
      {
        label: 'Listen Aloud (TTS) & Glossary',
        detail:
          'Press Listen to hear rules read aloud at 0.8x–1.5x speed, and tap underlined workplace terms to view plain-English definitions.',
      },
      {
        label: 'Quick Knowledge Check (+3 Coins)',
        detail:
          'Answer the interactive 1-question check at the bottom of each card for instant feedback and a +3 Coin mastery bonus, then click Mark Studied!',
      },
    ],
    proTip:
      'Use the Pin button on important cards to save them to your Pinned filter, or Flag Review on tricky lessons to add them to your 5-Min Quick Study deck.',
    targetTab: 'modules',
    ctaLabel: 'Try a Topic Card',
  },
  {
    stepNumber: 6,
    id: 'scroller_and_notes',
    shortTitle: '6. Scroller & Notes',
    kicker: 'Step 06 · Hands-Free Reading & Note-Taking',
    headline: 'Floating Auto-Scroll Controller & Persistent Study Notes Drawer',
    summary:
      'Two floating helpers stay within reach while you read so you can scroll hands-free and jot down personal study notes from any device.',
    highlights: [
      {
        label: 'Floating SCROLL Button',
        detail:
          'Tap the SCROLL button in the bottom-right corner to open the Auto-Scroll bar, press READ/PAUSE, and cycle smoothly through 1x, 2x, 3x, or 4x reading speeds.',
      },
      {
        label: 'Floating NOTES Button & Drawer',
        detail:
          'Tap the NOTES button on the right edge (or bottom-right on mobile) to slide open your personal Study Notes Pad without losing your reading spot.',
      },
      {
        label: '1-Tap Templates & Voice Dictation',
        detail:
          'Tag notes by World ("General / All Worlds" or Worlds 1–6), insert 1-tap memory starters, dictate via Voice Memo, and include your notes in PDF exports!',
      },
    ],
    proTip:
      'Auto-Scroll automatically pauses if you manually touch or wheel-scroll the page so it never fights your thumb.',
    targetTab: 'modules',
    ctaLabel: 'Open Modules & Notes',
  },
  {
    stepNumber: 7,
    id: 'holidays_hub',
    shortTitle: '7. Holidays Hub',
    kicker: 'Step 07 · Philippine Holidays Guide',
    headline: 'Master Regular Holidays, Special Days & Double Holiday Multipliers',
    summary:
      'The Holidays tab breaks down every nationwide Philippine holiday category, pay multiplier, and absence rule using visual calendars and interactive scenarios.',
    highlights: [
      {
        label: 'Regular vs. Special Days',
        detail:
          'Compare the 12 Regular Holidays (200% if worked / 100% even if unworked) against Special Non-Working Days ("No Work, No Pay" or 130% if worked).',
      },
      {
        label: 'Rest Day & Double Holiday Stacking',
        detail:
          'See clearly how Regular Holiday + Rest Day reaches 260%, Double Regular Holiday hits 300%, and Double Holiday + Rest Day reaches 390%.',
      },
      {
        label: 'Day-Before Absence Checker',
        detail:
          'Test how being absent without pay vs. on paid leave on the workday before a holiday affects holiday pay eligibility.',
      },
    ],
    proTip:
      'Use the category filter buttons at the top of the Holidays Hub to isolate Regular Holidays from Special Non-Working Days.',
    targetTab: 'holidays',
    ctaLabel: 'Explore Holidays Hub',
  },
  {
    stepNumber: 8,
    id: 'regional_wages',
    shortTitle: '8. Regional Wages',
    kicker: 'Step 08 · 17-Region Wage Directory',
    headline: 'Compare Minimum Wages & Kasambahay Rates Across All 17 Regions',
    summary:
      'The Regions tab provides a searchable directory of daily minimum wage rates for Non-Agriculture, Agriculture, and Domestic Workers (Kasambahay) nationwide.',
    highlights: [
      {
        label: 'Luzon, Visayas & Mindanao Filter',
        detail:
          'Filter all 17 regions (NCR, CAR, Regions I to XIII, and BARMM) by island group or type any region/city into the instant search bar.',
      },
      {
        label: 'Non-Agri vs. Agriculture Tranches',
        detail:
          'Compare regional wage orders side by side to understand how Regional Tripartite Wages and Productivity Boards set local wage floors.',
      },
      {
        label: 'Kasambahay Monthly Minimums',
        detail:
          'Switch or scroll to the Kasambahay wage table under R.A. 10361 to check monthly domestic worker minimums by region.',
      },
    ],
    proTip:
      'Click a region card and send its daily rate straight into mind when testing real-world computations in the Calculator tab!',
    targetTab: 'regions',
    ctaLabel: 'View 17-Region Wages',
  },
  {
    stepNumber: 9,
    id: 'statutory_calculator',
    shortTitle: '9. Pay Calculator',
    kicker: 'Step 09 · Step-by-Step Computations',
    headline: 'Compute Overtime, Night Shift, Holiday Pay, 13th Month & Retirement',
    summary:
      'Tap the Calculator button in the top bar anytime to run step-by-step Philippine payroll computations with transparent formulas.',
    highlights: [
      {
        label: 'Shift, Overtime & Night Diff Engine',
        detail:
          'Enter any daily rate and hours worked across Ordinary Days, Rest Days, Special Days, Regular Holidays, or Double Holidays to see exact peso totals.',
      },
      {
        label: '13th Month & SIL Cash Conversion',
        detail:
          'Compute pro-rated 13th Month Pay (Total Basic Salary Earned ÷ 12) and unused 5-day Service Incentive Leave cash commutation.',
      },
      {
        label: '22.5-Day Retirement & Wage Distortion',
        detail:
          'Verify R.A. 7641 retirement pay (15 days + 5 days SIL + 1/12 of 13th Month = 22.5 days per year) and wage distortion adjustments.',
      },
    ],
    proTip:
      'Click Copy Equation on any calculator result card to paste the clean step-by-step computation straight into your Study Notes!',
    targetTab: 'calculator',
    ctaLabel: 'Open Pay Calculator',
  },
  {
    stepNumber: 10,
    id: 'mystery_flashcards',
    shortTitle: '10. Flashcards &Glossary',
    kicker: 'Step 10 · Active Memory Practice',
    headline: 'Flip 240+ [?] Mystery Cards, Shuffle Decks & Search the Glossary',
    summary:
      'Strengthen long-term retention in the Cards tab using interactive flip cards, randomized deck shuffling, 5-minute sprints, and an expanded workplace glossary.',
    highlights: [
      {
        label: 'Shuffle Button & World Decks',
        detail:
          'Filter cards by World 1–6 or Holidays and click Shuffle anytime to randomize card order so you remember concepts rather than sequence.',
      },
      {
        label: '5-Min Quick Study Sprint',
        detail:
          'Launch a focused 5-minute flashcard session prioritizing topics you flagged for extra review.',
      },
      {
        label: 'Expanded Plain-English Glossary',
        detail:
          'Open the Glossary modal from the Menu or search bar to look up dozens of labor standards terms, formulas, and agencies in clear everyday language.',
      },
    ],
    proTip:
      'Use Left/Right arrow keys to move through flashcards and Spacebar to flip cards rapidly on laptop or desktop!',
    targetTab: 'flashcards',
    ctaLabel: 'Practice Flashcards',
  },
  {
    stepNumber: 11,
    id: 'quizzes_and_boss',
    shortTitle: '11. Quizzes & Boss',
    kicker: 'Step 11 · Knowledge Checks & Simulation',
    headline: 'Quick Tests, 10-Item Timed Exam Simulation & Bowser Boss Arena',
    summary:
      'Put what you learned into action across four distinct quiz modes in the Quiz tab — each giving clear explanations for every single question.',
    highlights: [
      {
        label: '5-Question World Quick Test',
        detail:
          'Take a brisk 5-item checkup tailored to your current World to verify understanding right after reading.',
      },
      {
        label: 'Timed 10-Item Exam Simulation',
        detail:
          'Generate a randomized 10-question cross-topic quiz with a countdown timer and a complete post-quiz score breakdown & answer rationale screen.',
      },
      {
        label: '65+ Practice Bank & Bowser Boss',
        detail:
          'Run 15/30/65-question custom practice sets or battle Bowser under a 25-second shot clock with hearts and combo multipliers for +100/+200 Coins!',
      },
    ],
    proTip:
      'Review the post-quiz explanation cards carefully — understanding why wrong choices fail is the fastest way to master tricky exceptions.',
    targetTab: 'quiz',
    ctaLabel: 'Start a Quiz',
  },
  {
    stepNumber: 12,
    id: 'arcade_game_vault',
    shortTitle: '12. 22-Game Vault',
    kicker: 'Step 12 · Learn Through Play',
    headline: '22 Unique Arcade Mini-Games Powered by Shuffled Question Decks',
    summary:
      'Take an energizing study break in the Game Vault — featuring 22 playable Mario-inspired mini-games where every round draws fresh, non-repeating questions and shuffled choices.',
    highlights: [
      {
        label: 'Action, Racing & Precision Games',
        detail:
          'Drift in Labor Kart GP, jump through 2D & 3D Mushroom Kingdom courses, or lock onto radial clouds in Yoshi’s Statutory Egg Toss with click-to-aim precision!',
      },
      {
        label: 'Sorting, Relay & Strategy Games',
        detail:
          'Play Hammer Bros. Payroll Blitz, Toadette Due Process Relay, Shy Guy Wage Factory, Kamek Deadline Spellbook, Dr. Mario Payroll Clinic, and Whack-a-Violation.',
      },
      {
        label: 'Fresh Shuffled Decks Every Run',
        detail:
          'Our session deck shuffler ensures questions and answer positions rotate across runs so every game stays fresh, challenging, and rewarding.',
      },
    ],
    proTip:
      'In Yoshi’s Egg Toss, you can either aim with Up/Down + Space OR click/tap directly on the matching answer cloud to auto-lock the exact throw arc!',
    targetTab: 'vault',
    ctaLabel: 'Play in Game Vault',
  },
  {
    stepNumber: 13,
    id: 'toad_shop_and_perks',
    shortTitle: '13. Toad’s Shop',
    kicker: 'Step 13 · Rewards & Customization',
    headline: 'Unlock 34 Heroes, 2x Coin Power-Ups, Companions & Leaderboard Ranks',
    summary:
      'Every module you read, flashcard you master, and game you clear awards Gold Coins you can spend in Toad’s Shop.',
    highlights: [
      {
        label: '34 Unlockable Characters',
        detail:
          'Collect and equip Mario, Luigi, Peach, Rosalina, Yoshi, Toadette, Bowser Jr., and 27 more characters — updating your avatar across the whole app.',
      },
      {
        label: 'Power-Ups, Companions & Themes',
        detail:
          'Activate Super Star buffs (2x coins for 10 minutes), unlock Shortcut Maps that highlight must-know rules, or equip pixel desk companions and card frames.',
      },
      {
        label: 'Coin Leaderboard',
        detail:
          'Open the Leaderboard modal from the top bar or Menu to see how your Gold Coins and study streaks rank across tiers!',
      },
    ],
    proTip:
      'Trigger a Super Star 2x Coin boost right before completing a Quiz Simulation or Boss Battle to double your coin payout!',
    targetTab: 'shop',
    ctaLabel: 'Visit Toad’s Shop',
  },
  {
    stepNumber: 14,
    id: 'profile_pdf_offline',
    shortTitle: '14. Profile, PDF & App',
    kicker: 'Step 14 · Analytics, Prints & Offline Mode',
    headline: 'Streak Calendar, Theme-Aware A4 PDF Downloads & Offline Access',
    summary:
      'Your progress saves automatically on your device, with rich visual analytics in your Profile and custom-styled, direct-download A4 PDFs.',
    highlights: [
      {
        label: 'Profile Streak Calendar & Badges',
        detail:
          'Click your Profile avatar to inspect your Monthly Study Streak & Goal Calendar grid, 7-day study bar chart, World Mastery Badges, and Achievement Trophies.',
      },
      {
        label: 'Theme-Aware Direct PDF Studio',
        detail:
          'Open Print / PDF Studio to customize Color Theme, Font Family, Margins, and Sections — then download crisp 1-Page A4 Summaries, Landscape Certificates, or Full Reviewers directly as .pdf files!',
      },
      {
        label: 'Installable Offline App (PWA)',
        detail:
          'Use Install App in the top bar or browser menu to save the guide to your phone, tablet, or laptop home screen for 100% offline study.',
      },
    ],
    proTip:
      'Click "Finish Guide & Claim +25 Coins" below to complete the tour and collect your +25 Gold Coin welcome reward!',
    targetTab: 'map',
    ctaLabel: 'Finish Guide & Claim +25 Coins',
  },
] as const;

// ==================== VISUAL MONTHLY STUDY STREAK & DAILY GOAL CALENDAR ====================

export interface MonthlyCalendarDayCell {
  dayNum: number;
  dateKey: string;
  dateLabel: string;
  weekdayShort: string;
  isToday: boolean;
  isFuture: boolean;
  minutesStudied: number;
  sessions: number;
  dailyGoalTarget: number;
  goalProgressPercent: number;
  isGoalCompleted: boolean;
  isStreakDay: boolean;
  hasActivity: boolean;
}

export interface MonthlyStudyCalendarModel {
  year: number;
  month: number;
  monthLabel: string;
  firstDayOffset: number;
  daysInMonth: number;
  dailyGoalTarget: number;
  activeDaysCount: number;
  streakDaysInMonth: number;
  completedGoalDaysCount: number;
  cells: MonthlyCalendarDayCell[];
}

export interface BuildMonthlyStudyCalendarParams {
  stats: PlayerProfileStats;
  year: number;
  month: number; // 0-indexed (0 = Jan .. 11 = Dec)
  loginStreak: number;
  dailyGoalTarget: number;
  referenceToday?: Date;
}

const WEEKDAY_SHORT_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function buildMonthlyStudyCalendar({
  stats,
  year,
  month,
  loginStreak,
  dailyGoalTarget,
  referenceToday = new Date(),
}: BuildMonthlyStudyCalendarParams): MonthlyStudyCalendarModel {
  const safeGoalTarget = Math.max(5, Math.round(dailyGoalTarget || 25));
  const todayMidnight = new Date(
    referenceToday.getFullYear(),
    referenceToday.getMonth(),
    referenceToday.getDate()
  );
  const todayKey = formatDateKey(todayMidnight);

  const viewDate = new Date(year, month, 1);
  const resolvedYear = viewDate.getFullYear();
  const resolvedMonth = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(resolvedYear, resolvedMonth + 1, 0).getDate();
  const firstDayOffset = new Date(resolvedYear, resolvedMonth, 1).getDay();

  // Build consecutive active streak dates spanning back from today
  const streakDatesSet = new Set<string>();
  const streakLen = Math.max(0, Math.floor(loginStreak));
  for (let i = 0; i < streakLen; i++) {
    const d = new Date(todayMidnight);
    d.setDate(d.getDate() - i);
    streakDatesSet.add(formatDateKey(d));
  }

  let activeDaysCount = 0;
  let streakDaysInMonth = 0;
  let completedGoalDaysCount = 0;
  const cells: MonthlyCalendarDayCell[] = [];

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const cellDate = new Date(resolvedYear, resolvedMonth, dayNum);
    const dateKey = formatDateKey(cellDate);
    const isToday = dateKey === todayKey;
    const isFuture = cellDate.getTime() > todayMidnight.getTime();
    const log = stats.dailyPomodoroLogs?.[dateKey];

    const sessions = Math.max(0, log?.sessions || 0);
    const loggedMinutes = Math.max(0, log?.minutes || 0);
    const activeSecMinutes = Math.floor(Math.max(0, log?.activeSeconds || 0) / 60);
    const minutesStudied = isFuture
      ? 0
      : Math.max(loggedMinutes, sessions * 25, activeSecMinutes);

    const hasLoggedStudy =
      !isFuture &&
      (sessions > 0 || minutesStudied > 0 || (log?.activeSeconds || 0) >= 15);
    const isStreakDay = !isFuture && streakDatesSet.has(dateKey);
    const isGoalCompleted = !isFuture && minutesStudied >= safeGoalTarget;
    const hasActivity = hasLoggedStudy || isStreakDay || isGoalCompleted;
    const goalProgressPercent = isFuture
      ? 0
      : Math.min(100, Math.round((minutesStudied / safeGoalTarget) * 100));

    if (hasActivity) activeDaysCount++;
    if (isStreakDay) streakDaysInMonth++;
    if (isGoalCompleted) completedGoalDaysCount++;

    cells.push({
      dayNum,
      dateKey,
      dateLabel: cellDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      weekdayShort: WEEKDAY_SHORT_NAMES[cellDate.getDay()],
      isToday,
      isFuture,
      minutesStudied,
      sessions,
      dailyGoalTarget: safeGoalTarget,
      goalProgressPercent,
      isGoalCompleted,
      isStreakDay,
      hasActivity,
    });
  }

  return {
    year: resolvedYear,
    month: resolvedMonth,
    monthLabel,
    firstDayOffset,
    daysInMonth,
    dailyGoalTarget: safeGoalTarget,
    activeDaysCount,
    streakDaysInMonth,
    completedGoalDaysCount,
    cells,
  };
}

