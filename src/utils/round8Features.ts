import { LawTopic, QuizQuestion } from '../types/laborLaw';
import { formatDateKey } from './profileAchievements';

export interface SimpleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

// ============================================================================
// 1. DAILY BOSS QUIZ STREAK TRACKER (CONSECUTIVE DAYS + BONUS COINS)
// ============================================================================

export const DAILY_BOSS_QUIZ_STREAK_STORAGE_KEY = 'mario_daily_boss_quiz_streak_v1';

export interface DailyBossQuizStreakState {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
  totalBossQuizzesCleared: number;
}

export interface ActiveDailyQuizStreakSnapshot {
  activeStreak: number;
  bestStreak: number;
  completedToday: boolean;
  atRiskToday: boolean;
  lastCompletedDate: string | null;
  nextStreakBonusCoins: number;
  totalBossQuizzesCleared: number;
}

export interface BossQuizStreakUpdateResult {
  nextState: DailyBossQuizStreakState;
  activeStreak: number;
  previousStreak: number;
  extendedConsecutiveDay: boolean;
  firstCompletionToday: boolean;
  bonusCoinsAwarded: number;
}

export const DEFAULT_DAILY_BOSS_QUIZ_STREAK_STATE: DailyBossQuizStreakState = {
  currentStreak: 0,
  bestStreak: 0,
  lastCompletedDate: null,
  totalBossQuizzesCleared: 0,
};

function parseLocalDateKeyToDayEpoch(dateKey: string): number | null {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey.trim());
  if (!parts) return null;
  const year = Number(parts[1]);
  const month = Number(parts[2]) - 1;
  const day = Number(parts[3]);
  const utcMs = Date.UTC(year, month, day);
  return Math.floor(utcMs / 86_400_000);
}

export function computeConsecutiveQuizBonusCoins(nextStreak: number): number {
  const safeStreak = Math.max(1, Math.floor(nextStreak));
  if (safeStreak === 1) {
    return 15;
  }
  // Consecutive days (Day 2+): 25 base + 5 per streak day (capped at +75 bonus coins)
  return 25 + Math.min(50, safeStreak * 5);
}

export function loadDailyBossQuizStreak(
  storage?: SimpleStorage | null
): DailyBossQuizStreakState {
  if (!storage) return { ...DEFAULT_DAILY_BOSS_QUIZ_STREAK_STATE };
  try {
    const raw = storage.getItem(DAILY_BOSS_QUIZ_STREAK_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DAILY_BOSS_QUIZ_STREAK_STATE };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_DAILY_BOSS_QUIZ_STREAK_STATE };
    }
    const currentStreak = Math.max(0, Math.floor(Number(parsed.currentStreak) || 0));
    const bestStreak = Math.max(
      currentStreak,
      Math.floor(Number(parsed.bestStreak) || 0)
    );
    const lastCompletedDate =
      typeof parsed.lastCompletedDate === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(parsed.lastCompletedDate)
        ? parsed.lastCompletedDate
        : null;
    const totalBossQuizzesCleared = Math.max(
      0,
      Math.floor(Number(parsed.totalBossQuizzesCleared) || 0)
    );
    return {
      currentStreak,
      bestStreak,
      lastCompletedDate,
      totalBossQuizzesCleared,
    };
  } catch {
    return { ...DEFAULT_DAILY_BOSS_QUIZ_STREAK_STATE };
  }
}

export function saveDailyBossQuizStreak(
  state: DailyBossQuizStreakState,
  storage?: SimpleStorage | null
): void {
  if (!storage) return;
  try {
    storage.setItem(DAILY_BOSS_QUIZ_STREAK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

export function getActiveDailyBossQuizStreak(
  state: DailyBossQuizStreakState,
  now: Date = new Date()
): ActiveDailyQuizStreakSnapshot {
  const todayKey = formatDateKey(now);
  const todayEpoch = parseLocalDateKeyToDayEpoch(todayKey) ?? 0;
  const lastEpoch = state.lastCompletedDate
    ? parseLocalDateKeyToDayEpoch(state.lastCompletedDate)
    : null;

  if (lastEpoch === null || state.currentStreak <= 0) {
    return {
      activeStreak: 0,
      bestStreak: state.bestStreak,
      completedToday: false,
      atRiskToday: false,
      lastCompletedDate: state.lastCompletedDate,
      nextStreakBonusCoins: computeConsecutiveQuizBonusCoins(1),
      totalBossQuizzesCleared: state.totalBossQuizzesCleared,
    };
  }

  const diffDays = todayEpoch - lastEpoch;
  if (diffDays <= 0) {
    // Completed today (or clock slightly behind)
    return {
      activeStreak: state.currentStreak,
      bestStreak: Math.max(state.bestStreak, state.currentStreak),
      completedToday: true,
      atRiskToday: false,
      lastCompletedDate: state.lastCompletedDate,
      nextStreakBonusCoins: computeConsecutiveQuizBonusCoins(state.currentStreak + 1),
      totalBossQuizzesCleared: state.totalBossQuizzesCleared,
    };
  }

  if (diffDays === 1) {
    // Completed yesterday — streak is still alive and ready to extend today!
    return {
      activeStreak: state.currentStreak,
      bestStreak: Math.max(state.bestStreak, state.currentStreak),
      completedToday: false,
      atRiskToday: true,
      lastCompletedDate: state.lastCompletedDate,
      nextStreakBonusCoins: computeConsecutiveQuizBonusCoins(state.currentStreak + 1),
      totalBossQuizzesCleared: state.totalBossQuizzesCleared,
    };
  }

  // Gap of 2+ days — streak expired
  return {
    activeStreak: 0,
    bestStreak: state.bestStreak,
    completedToday: false,
    atRiskToday: false,
    lastCompletedDate: state.lastCompletedDate,
    nextStreakBonusCoins: computeConsecutiveQuizBonusCoins(1),
    totalBossQuizzesCleared: state.totalBossQuizzesCleared,
  };
}

export function recordBossQuizCompletionForDailyStreak(
  prevState: DailyBossQuizStreakState,
  now: Date = new Date()
): BossQuizStreakUpdateResult {
  const todayKey = formatDateKey(now);
  const todayEpoch = parseLocalDateKeyToDayEpoch(todayKey) ?? 0;
  const lastEpoch = prevState.lastCompletedDate
    ? parseLocalDateKeyToDayEpoch(prevState.lastCompletedDate)
    : null;

  const previousSnapshot = getActiveDailyBossQuizStreak(prevState, now);

  if (lastEpoch !== null && todayEpoch - lastEpoch <= 0 && prevState.currentStreak > 0) {
    // Already completed at least one Boss Quiz today
    const nextState: DailyBossQuizStreakState = {
      ...prevState,
      bestStreak: Math.max(prevState.bestStreak, prevState.currentStreak),
      totalBossQuizzesCleared: prevState.totalBossQuizzesCleared + 1,
    };
    return {
      nextState,
      activeStreak: nextState.currentStreak,
      previousStreak: previousSnapshot.activeStreak,
      extendedConsecutiveDay: false,
      firstCompletionToday: false,
      bonusCoinsAwarded: 0,
    };
  }

  const isConsecutive =
    lastEpoch !== null && todayEpoch - lastEpoch === 1 && prevState.currentStreak > 0;
  const nextStreak = isConsecutive ? prevState.currentStreak + 1 : 1;
  const bonusCoinsAwarded = computeConsecutiveQuizBonusCoins(nextStreak);

  const nextState: DailyBossQuizStreakState = {
    currentStreak: nextStreak,
    bestStreak: Math.max(prevState.bestStreak, nextStreak),
    lastCompletedDate: todayKey,
    totalBossQuizzesCleared: prevState.totalBossQuizzesCleared + 1,
  };

  return {
    nextState,
    activeStreak: nextStreak,
    previousStreak: previousSnapshot.activeStreak,
    extendedConsecutiveDay: isConsecutive,
    firstCompletionToday: true,
    bonusCoinsAwarded,
  };
}

// ============================================================================
// 2. TARGETED WEAKNESS DRILL DECK BUILDER
// ============================================================================

const WORLD_ID_TO_QUIZ_CODE: Record<string, QuizQuestion['worldCode']> = {
  world1: 'w1',
  w1: 'w1',
  world2: 'w2',
  w2: 'w2',
  holidays: 'holidays',
  world3: 'w3',
  w3: 'w3',
  world4: 'w4',
  w4: 'w4',
  world5: 'w5',
  w5: 'w5',
  world6: 'w6',
  w6: 'w6',
};

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'under',
  'rules',
  'rule',
  'work',
  'workers',
  'employee',
  'employees',
  'labor',
  'law',
  'laws',
  'act',
  'general',
  'special',
  'provisions',
  'principles',
  'pay',
  'art',
  'arts',
]);

function extractTopicSearchSignals(topic: Pick<LawTopic, 'id' | 'title' | 'badge' | 'worldId'>): {
  worldCode: QuizQuestion['worldCode'];
  keywords: string[];
  numbers: string[];
} {
  const worldCode = WORLD_ID_TO_QUIZ_CODE[topic.worldId] || 'w1';
  const combined = `${topic.title} ${topic.badge}`.toLowerCase();
  const rawWords = combined
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
  const numbers = Array.from(new Set(combined.match(/\b\d{2,5}\b/g) || []));
  return {
    worldCode,
    keywords: Array.from(new Set(rawWords)),
    numbers,
  };
}

function shuffleWithRng<T>(items: readonly T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface TargetedWeaknessDrillItem {
  question: QuizQuestion;
  matchedTopicTitle: string | null;
  matchTier: 'exact_topic' | 'flagged_world' | 'diagnostic_fallback';
}

export interface TargetedWeaknessDrillDeckResult {
  items: TargetedWeaknessDrillItem[];
  deck: QuizQuestion[];
  hasUserFlags: boolean;
  targetedTopicTitles: string[];
  targetedWorldCodes: QuizQuestion['worldCode'][];
  summaryLabel: string;
}

export function buildTargetedWeaknessDrillDeck(params: {
  pool: readonly QuizQuestion[];
  allTopics: readonly Pick<LawTopic, 'id' | 'title' | 'badge' | 'worldId'>[];
  needsImprovementTopicIds?: readonly string[];
  needsImprovementWorlds?: readonly string[];
  deckSize?: number;
  rng?: () => number;
}): TargetedWeaknessDrillDeckResult {
  const {
    pool,
    allTopics,
    needsImprovementTopicIds = [],
    needsImprovementWorlds = [],
    deckSize = 8,
    rng = Math.random,
  } = params;

  const targetCount = Math.max(1, Math.min(deckSize, pool.length));
  const flaggedTopics = allTopics.filter((t) => needsImprovementTopicIds.includes(t.id));
  const topicSignals = flaggedTopics.map((t) => ({
    topic: t,
    ...extractTopicSearchSignals(t),
  }));

  const flaggedWorldCodeSet = new Set<QuizQuestion['worldCode']>();
  for (const w of needsImprovementWorlds) {
    const code = WORLD_ID_TO_QUIZ_CODE[w.toLowerCase()];
    if (code) flaggedWorldCodeSet.add(code);
  }
  for (const ts of topicSignals) {
    flaggedWorldCodeSet.add(ts.worldCode);
  }

  const hasUserFlags = flaggedTopics.length > 0 || flaggedWorldCodeSet.size > 0;

  if (!hasUserFlags) {
    const shuffled = shuffleWithRng(pool, rng).slice(0, targetCount);
    return {
      items: shuffled.map((question) => ({
        question,
        matchedTopicTitle: null,
        matchTier: 'diagnostic_fallback',
      })),
      deck: shuffled,
      hasUserFlags: false,
      targetedTopicTitles: [],
      targetedWorldCodes: [],
      summaryLabel:
        'No topics are flagged as "Needs Improvement" yet — running a cross-world diagnostic drill. Flag any topic below or in your Profile to lock onto specific weak spots!',
    };
  }

  const exactMatches: TargetedWeaknessDrillItem[] = [];
  const worldMatches: TargetedWeaknessDrillItem[] = [];
  const fallbackPool: TargetedWeaknessDrillItem[] = [];

  for (const q of pool) {
    const haystack = `${q.scenario} ${q.legalBasis} ${q.explanation} ${q.world}`.toLowerCase();
    let bestTopicTitle: string | null = null;
    let bestScore = 0;

    for (const sig of topicSignals) {
      let score = 0;
      if (q.worldCode === sig.worldCode) {
        score += 2;
      }
      for (const num of sig.numbers) {
        if (haystack.includes(num)) {
          score += 4;
        }
      }
      for (const kw of sig.keywords) {
        if (haystack.includes(kw)) {
          score += 2;
        }
      }
      if (score >= 4 && score > bestScore) {
        bestScore = score;
        bestTopicTitle = sig.topic.title;
      }
    }

    if (bestTopicTitle) {
      exactMatches.push({
        question: q,
        matchedTopicTitle: bestTopicTitle,
        matchTier: 'exact_topic',
      });
    } else if (flaggedWorldCodeSet.has(q.worldCode)) {
      const worldTopic = flaggedTopics.find(
        (ft) => WORLD_ID_TO_QUIZ_CODE[ft.worldId] === q.worldCode
      );
      worldMatches.push({
        question: q,
        matchedTopicTitle: worldTopic ? worldTopic.title : null,
        matchTier: 'flagged_world',
      });
    } else {
      fallbackPool.push({
        question: q,
        matchedTopicTitle: null,
        matchTier: 'diagnostic_fallback',
      });
    }
  }

  const orderedCandidates = [
    ...shuffleWithRng(exactMatches, rng),
    ...shuffleWithRng(worldMatches, rng),
    ...shuffleWithRng(fallbackPool, rng),
  ];

  const selected = orderedCandidates.slice(0, targetCount);
  const targetedTopicTitles = flaggedTopics.map((t) => t.title);
  const targetedWorldCodes = Array.from(flaggedWorldCodeSet);

  const summaryLabel =
    targetedTopicTitles.length > 0
      ? `Targeting ${targetedTopicTitles.length} flagged topic${
          targetedTopicTitles.length === 1 ? '' : 's'
        }: ${targetedTopicTitles.slice(0, 3).join(', ')}${
          targetedTopicTitles.length > 3 ? ` +${targetedTopicTitles.length - 3} more` : ''
        }.`
      : `Targeting ${targetedWorldCodes.length} flagged world${
          targetedWorldCodes.length === 1 ? '' : 's'
        } (${targetedWorldCodes.map((c) => c.toUpperCase()).join(', ')}).`;

  return {
    items: selected,
    deck: selected.map((s) => s.question),
    hasUserFlags: true,
    targetedTopicTitles,
    targetedWorldCodes,
    summaryLabel,
  };
}

// ============================================================================
// 3. VISUAL QUIZ RESULT SUMMARY BREAKDOWN (RIGHT VS WRONG PER WORLD/CATEGORY)
// ============================================================================

export interface QuizCategoryAnswerInput {
  worldCode: string;
  isCorrect: boolean;
}

export interface QuizCategoryBreakdownRow {
  categoryKey: string;
  shortLabel: string;
  fullLabel: string;
  rightCount: number;
  wrongCount: number;
  totalCount: number;
  accuracyPercent: number;
  rightBarPercent: number;
  wrongBarPercent: number;
}

export interface QuizWorldResultSummary {
  rows: QuizCategoryBreakdownRow[];
  totalRight: number;
  totalWrong: number;
  totalQuestions: number;
  overallAccuracyPercent: number;
  maxCategoryTotal: number;
  strongestCategory: QuizCategoryBreakdownRow | null;
  weakestCategory: QuizCategoryBreakdownRow | null;
}

const CATEGORY_META_ORDER: readonly {
  key: string;
  shortLabel: string;
  fullLabel: string;
}[] = [
  { key: 'w1', shortLabel: 'W1', fullLabel: 'World 1: Hours & OT' },
  { key: 'w2', shortLabel: 'W2', fullLabel: 'World 2: Rest & 13th Mo.' },
  { key: 'holidays', shortLabel: 'HOL', fullLabel: 'Holidays & Multipliers' },
  { key: 'w3', shortLabel: 'W3', fullLabel: 'World 3: Wages & D.O. 174' },
  { key: 'w4', shortLabel: 'W4', fullLabel: 'World 4: Special Groups' },
  { key: 'w5', shortLabel: 'W5', fullLabel: 'World 5: Protective Laws' },
  { key: 'w6', shortLabel: 'W6', fullLabel: 'World 6: Statutory Leaves' },
  { key: 'boss', shortLabel: 'BOSS', fullLabel: 'Boss Challenge' },
];

function normalizeCategoryKey(raw: string): string {
  const clean = (raw || '').trim().toLowerCase();
  if (clean === 'world1' || clean === 'w1') return 'w1';
  if (clean === 'world2' || clean === 'w2') return 'w2';
  if (clean === 'holidays' || clean === 'hol') return 'holidays';
  if (clean === 'world3' || clean === 'w3') return 'w3';
  if (clean === 'world4' || clean === 'w4') return 'w4';
  if (clean === 'world5' || clean === 'w5') return 'w5';
  if (clean === 'world6' || clean === 'w6') return 'w6';
  return 'boss';
}

export function computeQuizWorldResultSummary(
  records: readonly QuizCategoryAnswerInput[]
): QuizWorldResultSummary {
  const bucket = new Map<string, { right: number; wrong: number }>();

  for (const rec of records) {
    const key = normalizeCategoryKey(rec.worldCode);
    const prev = bucket.get(key) || { right: 0, wrong: 0 };
    if (rec.isCorrect) {
      prev.right += 1;
    } else {
      prev.wrong += 1;
    }
    bucket.set(key, prev);
  }

  const rows: QuizCategoryBreakdownRow[] = [];
  for (const meta of CATEGORY_META_ORDER) {
    const counts = bucket.get(meta.key);
    if (!counts) continue;
    const totalCount = counts.right + counts.wrong;
    if (totalCount <= 0) continue;
    const accuracyPercent = Math.round((counts.right / totalCount) * 100);
    const rightBarPercent = Math.round((counts.right / totalCount) * 100);
    const wrongBarPercent = 100 - rightBarPercent;
    rows.push({
      categoryKey: meta.key,
      shortLabel: meta.shortLabel,
      fullLabel: meta.fullLabel,
      rightCount: counts.right,
      wrongCount: counts.wrong,
      totalCount,
      accuracyPercent,
      rightBarPercent,
      wrongBarPercent,
    });
  }

  const totalRight = rows.reduce((sum, r) => sum + r.rightCount, 0);
  const totalWrong = rows.reduce((sum, r) => sum + r.wrongCount, 0);
  const totalQuestions = totalRight + totalWrong;
  const overallAccuracyPercent =
    totalQuestions > 0 ? Math.round((totalRight / totalQuestions) * 100) : 0;
  const maxCategoryTotal = rows.reduce((max, r) => Math.max(max, r.totalCount), 1);

  let strongestCategory: QuizCategoryBreakdownRow | null = null;
  let weakestCategory: QuizCategoryBreakdownRow | null = null;

  for (const row of rows) {
    if (
      !strongestCategory ||
      row.accuracyPercent > strongestCategory.accuracyPercent ||
      (row.accuracyPercent === strongestCategory.accuracyPercent &&
        row.rightCount > strongestCategory.rightCount)
    ) {
      strongestCategory = row;
    }
    if (
      !weakestCategory ||
      row.accuracyPercent < weakestCategory.accuracyPercent ||
      (row.accuracyPercent === weakestCategory.accuracyPercent &&
        row.wrongCount > weakestCategory.wrongCount)
    ) {
      weakestCategory = row;
    }
  }

  return {
    rows,
    totalRight,
    totalWrong,
    totalQuestions,
    overallAccuracyPercent,
    maxCategoryTotal,
    strongestCategory,
    weakestCategory:
      weakestCategory && weakestCategory.wrongCount > 0 ? weakestCategory : null,
  };
}

// ============================================================================
// 4. GLOBAL KEYBOARD SHORTCUT ('M' KEY) MUTE GUARD
// ============================================================================

export function shouldTriggerGlobalMuteShortcut(event: {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  repeat?: boolean;
  defaultPrevented?: boolean;
  targetTagName?: string | null;
  targetIsContentEditable?: boolean;
}): boolean {
  if (event.defaultPrevented || event.repeat) return false;
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  if ((event.key || '').toLowerCase() !== 'm') return false;
  if (event.targetIsContentEditable) return false;

  const tag = (event.targetTagName || '').toUpperCase();
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return false;
  }
  return true;
}

// ============================================================================
// 5. RECENTLY VIEWED TOPICS TRACKER (LAST 5 ACCESSED TOPICS)
// ============================================================================

export const RECENTLY_VIEWED_TOPICS_STORAGE_KEY = 'mario_recently_viewed_topics_v1';
export const MAX_RECENTLY_VIEWED_TOPICS = 5;

export function recordRecentlyViewedTopic(
  previousIds: readonly string[],
  accessedTopicId: string,
  validTopicIds?: ReadonlySet<string>,
  maxItems: number = MAX_RECENTLY_VIEWED_TOPICS
): string[] {
  const cleanId = (accessedTopicId || '').trim();
  if (!cleanId) return [...previousIds].slice(0, maxItems);
  if (validTopicIds && !validTopicIds.has(cleanId)) {
    return [...previousIds].filter((id) => validTopicIds.has(id)).slice(0, maxItems);
  }

  const next = [cleanId, ...previousIds.filter((id) => id !== cleanId && Boolean(id))];
  const filtered = validTopicIds ? next.filter((id) => validTopicIds.has(id)) : next;
  return filtered.slice(0, Math.max(1, maxItems));
}

export function loadRecentlyViewedTopicIds(
  storage?: SimpleStorage | null,
  validTopicIds?: ReadonlySet<string>
): string[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(RECENTLY_VIEWED_TOPICS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of parsed) {
      if (typeof item !== 'string') continue;
      const trimmed = item.trim();
      if (!trimmed || seen.has(trimmed)) continue;
      if (validTopicIds && !validTopicIds.has(trimmed)) continue;
      seen.add(trimmed);
      result.push(trimmed);
      if (result.length >= MAX_RECENTLY_VIEWED_TOPICS) break;
    }
    return result;
  } catch {
    return [];
  }
}

export function saveRecentlyViewedTopicIds(
  ids: readonly string[],
  storage?: SimpleStorage | null
): void {
  if (!storage) return;
  try {
    storage.setItem(
      RECENTLY_VIEWED_TOPICS_STORAGE_KEY,
      JSON.stringify(ids.slice(0, MAX_RECENTLY_VIEWED_TOPICS))
    );
  } catch {
    // ignore storage quota errors
  }
}

// ============================================================================
// 6. 7-DAY COMPLETED TOPICS MINI SPARKLINE SERIES
// ============================================================================

export const COMPLETED_TOPICS_HISTORY_STORAGE_KEY = 'mario_completed_topics_history_v1';

export type CompletedTopicsHistoryMap = Record<string, number>;

export interface SparklinePoint {
  dateKey: string;
  dayLabel: string;
  shortDate: string;
  count: number;
  isToday: boolean;
  svgX: number;
  svgY: number;
}

export interface CompletedTopicsSparklineSeries {
  points: SparklinePoint[];
  polylinePoints: string;
  areaPath: string;
  minCount: number;
  maxCount: number;
  delta7d: number;
  latestCount: number;
  svgWidth: number;
  svgHeight: number;
}

const SHORT_WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function loadCompletedTopicsHistory(
  storage?: SimpleStorage | null
): CompletedTopicsHistoryMap {
  if (!storage) return {};
  try {
    const raw = storage.getItem(COMPLETED_TOPICS_HISTORY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const clean: CompletedTopicsHistoryMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && Number.isFinite(Number(v))) {
        clean[k] = Math.max(0, Math.floor(Number(v)));
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export function saveCompletedTopicsHistory(
  history: CompletedTopicsHistoryMap,
  storage?: SimpleStorage | null
): void {
  if (!storage) return;
  try {
    storage.setItem(COMPLETED_TOPICS_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore storage errors
  }
}

export function syncCompletedTopicsDailyHistory(
  prevHistory: CompletedTopicsHistoryMap,
  currentCompletedCount: number,
  now: Date = new Date()
): CompletedTopicsHistoryMap {
  const todayKey = formatDateKey(now);
  const safeCount = Math.max(0, Math.floor(currentCompletedCount));
  const next: CompletedTopicsHistoryMap = {
    ...prevHistory,
    [todayKey]: safeCount,
  };

  // Prune entries older than 45 days so storage stays tiny
  const sortedKeys = Object.keys(next).sort();
  if (sortedKeys.length > 45) {
    const toRemove = sortedKeys.slice(0, sortedKeys.length - 45);
    for (const k of toRemove) {
      delete next[k];
    }
  }
  return next;
}

export function buildCompletedTopicsSparklineSeries(params: {
  history: CompletedTopicsHistoryMap;
  currentCompletedCount: number;
  totalTopicsCount: number;
  now?: Date;
  svgWidth?: number;
  svgHeight?: number;
}): CompletedTopicsSparklineSeries {
  const {
    history,
    currentCompletedCount,
    totalTopicsCount,
    now = new Date(),
    svgWidth = 280,
    svgHeight = 72,
  } = params;

  const safeCurrent = Math.max(0, Math.floor(currentCompletedCount));
  const mergedHistory: CompletedTopicsHistoryMap = {
    ...history,
    [formatDateKey(now)]: safeCurrent,
  };

  // Find baseline value before the 7-day window if any historical date exists
  const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  const windowStartKey = formatDateKey(windowStart);
  const priorKeys = Object.keys(mergedHistory)
    .filter((k) => k < windowStartKey)
    .sort();
  let carryCount = priorKeys.length > 0 ? mergedHistory[priorKeys[priorKeys.length - 1]] : 0;

  const rawDays: {
    dateKey: string;
    dayLabel: string;
    shortDate: string;
    count: number;
    isToday: boolean;
  }[] = [];

  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const key = formatDateKey(d);
    if (offset === 0) {
      carryCount = safeCurrent;
    } else if (Object.prototype.hasOwnProperty.call(mergedHistory, key)) {
      carryCount = mergedHistory[key];
    }
    rawDays.push({
      dateKey: key,
      dayLabel: SHORT_WEEKDAY_LABELS[d.getDay()],
      shortDate: `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`,
      count: carryCount,
      isToday: offset === 0,
    });
  }

  const counts = rawDays.map((d) => d.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const domainMin = Math.max(0, minCount > 0 ? minCount - 1 : 0);
  const domainMax = Math.max(
    domainMin + 2,
    maxCount,
    Math.min(Math.max(4, safeCurrent + 1), Math.max(4, totalTopicsCount))
  );

  const padX = 16;
  const padTop = 12;
  const padBottom = 14;
  const plotW = Math.max(40, svgWidth - padX * 2);
  const plotH = Math.max(20, svgHeight - padTop - padBottom);

  const points: SparklinePoint[] = rawDays.map((day, idx) => {
    const ratioX = rawDays.length > 1 ? idx / (rawDays.length - 1) : 0.5;
    const ratioY =
      domainMax > domainMin ? (day.count - domainMin) / (domainMax - domainMin) : 0;
    const svgX = Number((padX + ratioX * plotW).toFixed(1));
    const svgY = Number((padTop + plotH - ratioY * plotH).toFixed(1));
    return {
      ...day,
      svgX,
      svgY,
    };
  });

  const polylinePoints = points.map((p) => `${p.svgX},${p.svgY}`).join(' ');
  const baselineY = Number((padTop + plotH).toFixed(1));
  const firstPt = points[0];
  const lastPt = points[points.length - 1];
  const areaPath =
    points.length > 0
      ? `M ${firstPt.svgX} ${baselineY} ` +
        points.map((p) => `L ${p.svgX} ${p.svgY}`).join(' ') +
        ` L ${lastPt.svgX} ${baselineY} Z`
      : '';

  const delta7d = safeCurrent - (rawDays[0]?.count ?? 0);

  return {
    points,
    polylinePoints,
    areaPath,
    minCount,
    maxCount,
    delta7d,
    latestCount: safeCurrent,
    svgWidth,
    svgHeight,
  };
}

// ============================================================================
// 7. EXTENDED PRINT STUDIO COLOR THEMES (12) & FONT STYLES (12)
// ============================================================================

export type ExtendedPrintThemeId =
  | 'executive_navy'
  | 'supreme_court_crimson'
  | 'forest_dole_emerald'
  | 'vintage_parchment'
  | 'mario_mushroom_red'
  | 'starlight_cobalt'
  | 'royal_amethyst'
  | 'yoshi_jade_lime'
  | 'teal_tribunal'
  | 'terracotta_codal'
  | 'bowser_obsidian_gold'
  | 'ink_saver_bw';

export type ExtendedPrintFontId =
  | 'editorial_serif'
  | 'modern_sans'
  | 'academic_times'
  | 'formal_georgia'
  | 'warm_charter'
  | 'clean_inter'
  | 'condensed_narrow'
  | 'dyslexic_sans'
  | 'classic_monospace'
  | 'retro_mario_mono'
  | 'playfair_royal'
  | 'space_grotesk';

export interface PrintThemeCatalogItem {
  id: ExtendedPrintThemeId;
  label: string;
  shortLabel: string;
  swatchSwatchClass: string;
  accentDotClass: string;
  headingBorderClass: string;
  subtleBoxClass: string;
  tableHeaderClass: string;
  summaryBannerHeaderClass: string;
  summaryPaperBgClass: string;
  certClasses: {
    paper: string;
    corner: string;
    sealCircle: string;
    title: string;
    honors: string;
    badge: string;
  };
}

export const PRINT_COLOR_THEMES: readonly PrintThemeCatalogItem[] = [
  {
    id: 'executive_navy',
    label: 'Executive Navy & Gold',
    shortLabel: 'Navy Gold',
    swatchSwatchClass: 'bg-[#0f172a]',
    accentDotClass: 'bg-[#d97706]',
    headingBorderClass: 'border-[#0f172a]',
    subtleBoxClass: 'bg-slate-50 border-slate-300',
    tableHeaderClass: 'bg-slate-100 text-slate-950 border-b-2 border-[#0f172a]',
    summaryBannerHeaderClass: 'bg-[#0f172a] text-white',
    summaryPaperBgClass: 'bg-white text-slate-950 border-[#0f172a]',
    certClasses: {
      paper: 'bg-[#f8fafc] border-[#0f172a] outline-[#1e3a8a]/60',
      corner: 'border-[#1e3a8a] text-[#1e3a8a]',
      sealCircle: 'border-[#1e3a8a] bg-blue-50 text-[#1e3a8a]',
      title: 'text-[#0f172a] border-[#1e3a8a]/80',
      honors: 'text-[#1d4ed8]',
      badge: 'border-slate-300 bg-slate-100 text-slate-900',
    },
  },
  {
    id: 'supreme_court_crimson',
    label: 'Supreme Court Crimson',
    shortLabel: 'Crimson',
    swatchSwatchClass: 'bg-[#7f1d1d]',
    accentDotClass: 'bg-[#ef4444]',
    headingBorderClass: 'border-[#991b1b]',
    subtleBoxClass: 'bg-red-50/50 border-red-300',
    tableHeaderClass: 'bg-red-50 text-red-950 border-b-2 border-[#991b1b]',
    summaryBannerHeaderClass: 'bg-[#7f1d1d] text-white',
    summaryPaperBgClass: 'bg-white text-slate-950 border-[#7f1d1d]',
    certClasses: {
      paper: 'bg-[#fffbfb] border-[#991b1b] outline-[#7f1d1d]/60',
      corner: 'border-[#991b1b] text-[#991b1b]',
      sealCircle: 'border-[#991b1b] bg-red-50 text-[#991b1b]',
      title: 'text-[#7f1d1d] border-[#991b1b]/80',
      honors: 'text-[#991b1b]',
      badge: 'border-red-300 bg-red-50/70 text-red-950',
    },
  },
  {
    id: 'forest_dole_emerald',
    label: 'DOLE Forest Emerald',
    shortLabel: 'Emerald',
    swatchSwatchClass: 'bg-[#064e3b]',
    accentDotClass: 'bg-[#10b981]',
    headingBorderClass: 'border-[#065f46]',
    subtleBoxClass: 'bg-emerald-50/50 border-emerald-300',
    tableHeaderClass: 'bg-emerald-50 text-emerald-950 border-b-2 border-[#065f46]',
    summaryBannerHeaderClass: 'bg-[#064e3b] text-white',
    summaryPaperBgClass: 'bg-white text-slate-950 border-[#064e3b]',
    certClasses: {
      paper: 'bg-[#f8fffb] border-[#065f46] outline-[#064e3b]/60',
      corner: 'border-[#065f46] text-[#065f46]',
      sealCircle: 'border-[#065f46] bg-emerald-50 text-[#065f46]',
      title: 'text-[#064e3b] border-[#065f46]/80',
      honors: 'text-[#065f46]',
      badge: 'border-emerald-300 bg-emerald-50/70 text-emerald-950',
    },
  },
  {
    id: 'vintage_parchment',
    label: 'Classic Gold Parchment',
    shortLabel: 'Parchment',
    swatchSwatchClass: 'bg-[#78350f]',
    accentDotClass: 'bg-[#f59e0b]',
    headingBorderClass: 'border-[#78350f]',
    subtleBoxClass: 'bg-amber-50/60 border-amber-300',
    tableHeaderClass: 'bg-amber-100/70 text-amber-950 border-b-2 border-[#78350f]',
    summaryBannerHeaderClass: 'bg-[#78350f] text-amber-50',
    summaryPaperBgClass: 'bg-[#fffbeb] text-[#291d12] border-[#78350f]',
    certClasses: {
      paper: 'bg-[#fdf8eb] border-[#92400e] outline-[#78350f]/60',
      corner: 'border-[#92400e] text-[#92400e]',
      sealCircle: 'border-[#92400e] bg-amber-100 text-[#78350f]',
      title: 'text-[#78350f] border-[#92400e]/80',
      honors: 'text-[#b45309]',
      badge: 'border-amber-400 bg-amber-50 text-amber-950',
    },
  },
  {
    id: 'mario_mushroom_red',
    label: 'Mushroom Kingdom Red & Gold',
    shortLabel: 'Mario Red',
    swatchSwatchClass: 'bg-[#b91c1c]',
    accentDotClass: 'bg-[#fbbf24]',
    headingBorderClass: 'border-[#b91c1c]',
    subtleBoxClass: 'bg-amber-50/50 border-red-300',
    tableHeaderClass: 'bg-amber-100 text-red-950 border-b-2 border-[#b91c1c]',
    summaryBannerHeaderClass: 'bg-[#b91c1c] text-white',
    summaryPaperBgClass: 'bg-[#fffdf9] text-slate-950 border-[#b91c1c]',
    certClasses: {
      paper: 'bg-[#fffdf7] border-[#b91c1c] outline-[#f59e0b]/70',
      corner: 'border-[#b91c1c] text-[#b91c1c]',
      sealCircle: 'border-[#b91c1c] bg-amber-100 text-[#991b1b]',
      title: 'text-[#991b1b] border-[#d97706]',
      honors: 'text-[#b45309]',
      badge: 'border-amber-400 bg-red-50/70 text-red-950',
    },
  },
  {
    id: 'starlight_cobalt',
    label: 'Rosalina Starlight Cobalt',
    shortLabel: 'Cobalt',
    swatchSwatchClass: 'bg-[#1e3a8a]',
    accentDotClass: 'bg-[#38bdf8]',
    headingBorderClass: 'border-[#1e3a8a]',
    subtleBoxClass: 'bg-sky-50/60 border-sky-300',
    tableHeaderClass: 'bg-sky-100/80 text-blue-950 border-b-2 border-[#1e3a8a]',
    summaryBannerHeaderClass: 'bg-[#1e3a8a] text-white',
    summaryPaperBgClass: 'bg-[#f8fbff] text-slate-950 border-[#1e3a8a]',
    certClasses: {
      paper: 'bg-[#f5faff] border-[#1e3a8a] outline-[#0284c7]/60',
      corner: 'border-[#0284c7] text-[#1e3a8a]',
      sealCircle: 'border-[#1e3a8a] bg-sky-100 text-[#1e3a8a]',
      title: 'text-[#1e3a8a] border-[#0284c7]/80',
      honors: 'text-[#0369a1]',
      badge: 'border-sky-300 bg-sky-50 text-blue-950',
    },
  },
  {
    id: 'royal_amethyst',
    label: 'Princess Royal Amethyst',
    shortLabel: 'Amethyst',
    swatchSwatchClass: 'bg-[#581c87]',
    accentDotClass: 'bg-[#e879f9]',
    headingBorderClass: 'border-[#6b21a8]',
    subtleBoxClass: 'bg-purple-50/60 border-purple-300',
    tableHeaderClass: 'bg-purple-100/70 text-purple-950 border-b-2 border-[#6b21a8]',
    summaryBannerHeaderClass: 'bg-[#581c87] text-white',
    summaryPaperBgClass: 'bg-[#fdfaff] text-slate-950 border-[#581c87]',
    certClasses: {
      paper: 'bg-[#fdfaff] border-[#6b21a8] outline-[#a855f7]/60',
      corner: 'border-[#6b21a8] text-[#6b21a8]',
      sealCircle: 'border-[#6b21a8] bg-purple-100 text-[#581c87]',
      title: 'text-[#581c87] border-[#7e22ce]/80',
      honors: 'text-[#7e22ce]',
      badge: 'border-purple-300 bg-purple-50 text-purple-950',
    },
  },
  {
    id: 'yoshi_jade_lime',
    label: 'Yoshi Island Jade',
    shortLabel: 'Yoshi Jade',
    swatchSwatchClass: 'bg-[#14532d]',
    accentDotClass: 'bg-[#84cc16]',
    headingBorderClass: 'border-[#166534]',
    subtleBoxClass: 'bg-lime-50/60 border-green-300',
    tableHeaderClass: 'bg-lime-100/70 text-green-950 border-b-2 border-[#166534]',
    summaryBannerHeaderClass: 'bg-[#14532d] text-white',
    summaryPaperBgClass: 'bg-[#fafff8] text-slate-950 border-[#14532d]',
    certClasses: {
      paper: 'bg-[#f9fff6] border-[#15803d] outline-[#65a30d]/60',
      corner: 'border-[#15803d] text-[#15803d]',
      sealCircle: 'border-[#15803d] bg-lime-100 text-[#14532d]',
      title: 'text-[#14532d] border-[#15803d]/80',
      honors: 'text-[#15803d]',
      badge: 'border-lime-400 bg-lime-50 text-green-950',
    },
  },
  {
    id: 'teal_tribunal',
    label: 'Oceanic Tribunal Teal',
    shortLabel: 'Teal',
    swatchSwatchClass: 'bg-[#134e4a]',
    accentDotClass: 'bg-[#14b8a6]',
    headingBorderClass: 'border-[#0f766e]',
    subtleBoxClass: 'bg-teal-50/60 border-teal-300',
    tableHeaderClass: 'bg-teal-100/70 text-teal-950 border-b-2 border-[#0f766e]',
    summaryBannerHeaderClass: 'bg-[#134e4a] text-white',
    summaryPaperBgClass: 'bg-[#f7fffe] text-slate-950 border-[#134e4a]',
    certClasses: {
      paper: 'bg-[#f6fffe] border-[#0f766e] outline-[#14b8a6]/60',
      corner: 'border-[#0f766e] text-[#0f766e]',
      sealCircle: 'border-[#0f766e] bg-teal-100 text-[#134e4a]',
      title: 'text-[#134e4a] border-[#0f766e]/80',
      honors: 'text-[#0f766e]',
      badge: 'border-teal-300 bg-teal-50 text-teal-950',
    },
  },
  {
    id: 'terracotta_codal',
    label: 'Terracotta Codal Bronze',
    shortLabel: 'Terracotta',
    swatchSwatchClass: 'bg-[#7c2d12]',
    accentDotClass: 'bg-[#f97316]',
    headingBorderClass: 'border-[#9a3412]',
    subtleBoxClass: 'bg-orange-50/60 border-orange-300',
    tableHeaderClass: 'bg-orange-100/70 text-orange-950 border-b-2 border-[#9a3412]',
    summaryBannerHeaderClass: 'bg-[#7c2d12] text-white',
    summaryPaperBgClass: 'bg-[#fffaf5] text-slate-950 border-[#7c2d12]',
    certClasses: {
      paper: 'bg-[#fffaf4] border-[#9a3412] outline-[#ea580c]/60',
      corner: 'border-[#9a3412] text-[#9a3412]',
      sealCircle: 'border-[#9a3412] bg-orange-100 text-[#7c2d12]',
      title: 'text-[#7c2d12] border-[#9a3412]/80',
      honors: 'text-[#c2410c]',
      badge: 'border-orange-300 bg-orange-50 text-orange-950',
    },
  },
  {
    id: 'bowser_obsidian_gold',
    label: 'Obsidian Keep & Gold',
    shortLabel: 'Obsidian',
    swatchSwatchClass: 'bg-[#18181b]',
    accentDotClass: 'bg-[#eab308]',
    headingBorderClass: 'border-[#18181b]',
    subtleBoxClass: 'bg-amber-50/40 border-zinc-400',
    tableHeaderClass: 'bg-zinc-200 text-zinc-950 border-b-2 border-[#18181b]',
    summaryBannerHeaderClass: 'bg-[#18181b] text-amber-300',
    summaryPaperBgClass: 'bg-[#fcfcfc] text-zinc-950 border-[#18181b]',
    certClasses: {
      paper: 'bg-[#fafaf8] border-[#18181b] outline-[#ca8a04]/70',
      corner: 'border-[#ca8a04] text-[#18181b]',
      sealCircle: 'border-[#18181b] bg-amber-200 text-[#18181b]',
      title: 'text-[#18181b] border-[#ca8a04]',
      honors: 'text-[#a16207]',
      badge: 'border-amber-500 bg-zinc-100 text-zinc-950',
    },
  },
  {
    id: 'ink_saver_bw',
    label: 'Ink-Saver Pure B&W',
    shortLabel: 'Pure B&W',
    swatchSwatchClass: 'bg-white border border-black',
    accentDotClass: 'bg-black',
    headingBorderClass: 'border-black',
    subtleBoxClass: 'bg-white border-slate-500',
    tableHeaderClass: 'bg-white text-black border-b-2 border-black',
    summaryBannerHeaderClass: 'bg-white text-black border-b-2 border-black',
    summaryPaperBgClass: 'bg-white text-black border-black',
    certClasses: {
      paper: 'bg-white border-black outline-black/60',
      corner: 'border-black text-black',
      sealCircle: 'border-black bg-neutral-100 text-black',
      title: 'text-black border-black',
      honors: 'text-neutral-800',
      badge: 'border-neutral-400 bg-white text-black',
    },
  },
];

export interface PrintFontCatalogItem {
  id: ExtendedPrintFontId;
  label: string;
  shortLabel: string;
  category: 'serif' | 'sans' | 'mono';
  previewClass: string;
}

export const PRINT_FONT_STYLES: readonly PrintFontCatalogItem[] = [
  {
    id: 'modern_sans',
    label: 'Modern Jakarta Sans',
    shortLabel: 'Jakarta Sans',
    category: 'sans',
    previewClass: 'print-font-modern-sans',
  },
  {
    id: 'editorial_serif',
    label: 'Merriweather Editorial Serif',
    shortLabel: 'Editorial Serif',
    category: 'serif',
    previewClass: 'print-font-editorial-serif',
  },
  {
    id: 'playfair_royal',
    label: 'Playfair Display Royal',
    shortLabel: 'Playfair Serif',
    category: 'serif',
    previewClass: 'print-font-playfair-royal',
  },
  {
    id: 'academic_times',
    label: 'Academic Times Review',
    shortLabel: 'Academic Times',
    category: 'serif',
    previewClass: 'print-font-academic-times',
  },
  {
    id: 'formal_georgia',
    label: 'Judicial Georgia Book',
    shortLabel: 'Georgia Book',
    category: 'serif',
    previewClass: 'print-font-formal-georgia',
  },
  {
    id: 'warm_charter',
    label: 'Lora Textbook Serif',
    shortLabel: 'Lora Serif',
    category: 'serif',
    previewClass: 'print-font-warm-charter',
  },
  {
    id: 'clean_inter',
    label: 'Crisp Inter Executive',
    shortLabel: 'Clean Inter',
    category: 'sans',
    previewClass: 'print-font-clean-inter',
  },
  {
    id: 'space_grotesk',
    label: 'Space Grotesk Geometric',
    shortLabel: 'Space Grotesk',
    category: 'sans',
    previewClass: 'print-font-space-grotesk',
  },
  {
    id: 'condensed_narrow',
    label: 'Compact Digest Narrow',
    shortLabel: 'Compact Digest',
    category: 'sans',
    previewClass: 'print-font-condensed-narrow',
  },
  {
    id: 'dyslexic_sans',
    label: 'Accessible Wide Legibility',
    shortLabel: 'Wide Accessible',
    category: 'sans',
    previewClass: 'print-font-dyslexic-sans',
  },
  {
    id: 'classic_monospace',
    label: 'JetBrains Statutory Mono',
    shortLabel: 'JetBrains Mono',
    category: 'mono',
    previewClass: 'print-font-classic-monospace',
  },
  {
    id: 'retro_mario_mono',
    label: 'Retro Pixel & Courier',
    shortLabel: 'Arcade Mono',
    category: 'mono',
    previewClass: 'print-font-retro-mario-mono',
  },
];

export function getPrintThemeCatalogItem(colorAccent?: string): PrintThemeCatalogItem {
  return (
    PRINT_COLOR_THEMES.find((t) => t.id === colorAccent) || PRINT_COLOR_THEMES[0]
  );
}

export function getPrintFontCatalogItem(fontStyle?: string): PrintFontCatalogItem {
  return (
    PRINT_FONT_STYLES.find((f) => f.id === fontStyle) || PRINT_FONT_STYLES[0]
  );
}
