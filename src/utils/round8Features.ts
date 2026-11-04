import { LawTopic } from '../types/laborLaw';
import { QuizQuestion } from '../data/quizQuestionsData';
import { formatDateKey } from './profileAchievements';
import {
  loadStudyNotes,
  saveStudyNotes,
  createStudyNote,
  StudyNoteItem,
} from './engagementFeatures';

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

export const loadCompletedTopicsDailyHistory = loadCompletedTopicsHistory;

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
// 7. EXTENDED PRINT STUDIO COLOR THEMES (24), PRINT FONTS (20), APP FONTS (8) & A4 PREVIEW SCALER
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
  | 'peach_blossom_rose'
  | 'luigi_mansion_jade'
  | 'rosalina_cosmic_ice'
  | 'golden_crown_ivory'
  | 'sakura_editorial'
  | 'midnight_espresso'
  | 'arctic_glacier'
  | 'solarized_amber'
  | 'mint_dole_ledger'
  | 'sunset_coral'
  | 'indigo_jurisprudence'
  | 'wario_royal_gold'
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
  | 'space_grotesk'
  | 'libre_baskerville'
  | 'cormorant_chancery'
  | 'crimson_juris'
  | 'source_serif_codal'
  | 'dm_sans_clean'
  | 'outfit_geometric'
  | 'bricolage_editorial'
  | 'ibm_plex_docket';

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
  worldBannerClass: string;
  zebraRowClass: string;
  tipBoxClass: string;
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
    worldBannerClass: 'bg-[#1e293b] text-white border-[#0f172a]',
    zebraRowClass: 'bg-slate-50/75',
    tipBoxClass: 'bg-amber-50/80 border-amber-300 text-slate-900',
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
    worldBannerClass: 'bg-[#7f1d1d] text-white border-[#450a0a]',
    zebraRowClass: 'bg-red-50/45',
    tipBoxClass: 'bg-red-50/70 border-red-300 text-red-950',
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
    worldBannerClass: 'bg-[#064e3b] text-white border-[#022c22]',
    zebraRowClass: 'bg-emerald-50/45',
    tipBoxClass: 'bg-emerald-50/70 border-emerald-300 text-emerald-950',
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
    subtleBoxClass: 'bg-amber-50/70 border-amber-300',
    tableHeaderClass: 'bg-amber-100/80 text-amber-950 border-b-2 border-[#78350f]',
    summaryBannerHeaderClass: 'bg-[#78350f] text-amber-50',
    summaryPaperBgClass: 'bg-[#fffbeb] text-[#291d12] border-[#78350f]',
    worldBannerClass: 'bg-[#78350f] text-amber-50 border-[#451a03]',
    zebraRowClass: 'bg-amber-100/40',
    tipBoxClass: 'bg-amber-100/70 border-amber-400 text-amber-950',
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
    worldBannerClass: 'bg-[#b91c1c] text-white border-[#7f1d1d]',
    zebraRowClass: 'bg-amber-50/55',
    tipBoxClass: 'bg-amber-50/85 border-amber-400 text-red-950',
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
    worldBannerClass: 'bg-[#1e3a8a] text-white border-[#172554]',
    zebraRowClass: 'bg-sky-50/55',
    tipBoxClass: 'bg-sky-50/80 border-sky-300 text-blue-950',
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
    worldBannerClass: 'bg-[#581c87] text-white border-[#3b0764]',
    zebraRowClass: 'bg-purple-50/55',
    tipBoxClass: 'bg-purple-50/80 border-purple-300 text-purple-950',
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
    worldBannerClass: 'bg-[#14532d] text-white border-[#052e16]',
    zebraRowClass: 'bg-lime-50/55',
    tipBoxClass: 'bg-lime-50/80 border-lime-400 text-green-950',
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
    worldBannerClass: 'bg-[#134e4a] text-white border-[#042f2e]',
    zebraRowClass: 'bg-teal-50/55',
    tipBoxClass: 'bg-teal-50/80 border-teal-300 text-teal-950',
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
    worldBannerClass: 'bg-[#7c2d12] text-white border-[#431407]',
    zebraRowClass: 'bg-orange-50/55',
    tipBoxClass: 'bg-orange-50/80 border-orange-300 text-orange-950',
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
    worldBannerClass: 'bg-[#18181b] text-amber-300 border-black',
    zebraRowClass: 'bg-zinc-100/70',
    tipBoxClass: 'bg-amber-50/80 border-amber-400 text-zinc-950',
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
    id: 'peach_blossom_rose',
    label: 'Peach Blossom Royal Rose',
    shortLabel: 'Peach Rose',
    swatchSwatchClass: 'bg-[#9d174d]',
    accentDotClass: 'bg-[#f472b6]',
    headingBorderClass: 'border-[#9d174d]',
    subtleBoxClass: 'bg-pink-50/60 border-pink-300',
    tableHeaderClass: 'bg-pink-100/80 text-pink-950 border-b-2 border-[#9d174d]',
    summaryBannerHeaderClass: 'bg-[#9d174d] text-white',
    summaryPaperBgClass: 'bg-[#fffafc] text-slate-950 border-[#9d174d]',
    worldBannerClass: 'bg-[#9d174d] text-white border-[#831843]',
    zebraRowClass: 'bg-pink-50/55',
    tipBoxClass: 'bg-pink-50/80 border-pink-300 text-pink-950',
    certClasses: {
      paper: 'bg-[#fff9fb] border-[#be185d] outline-[#ec4899]/60',
      corner: 'border-[#be185d] text-[#9d174d]',
      sealCircle: 'border-[#9d174d] bg-pink-100 text-[#9d174d]',
      title: 'text-[#831843] border-[#be185d]/80',
      honors: 'text-[#be185d]',
      badge: 'border-pink-300 bg-pink-50 text-pink-950',
    },
  },
  {
    id: 'luigi_mansion_jade',
    label: 'Luigi Mansion Jade & Mint',
    shortLabel: 'Luigi Jade',
    swatchSwatchClass: 'bg-[#15803d]',
    accentDotClass: 'bg-[#4ade80]',
    headingBorderClass: 'border-[#15803d]',
    subtleBoxClass: 'bg-green-50/60 border-green-300',
    tableHeaderClass: 'bg-green-100/80 text-green-950 border-b-2 border-[#15803d]',
    summaryBannerHeaderClass: 'bg-[#15803d] text-white',
    summaryPaperBgClass: 'bg-[#f8fff9] text-slate-950 border-[#15803d]',
    worldBannerClass: 'bg-[#15803d] text-white border-[#14532d]',
    zebraRowClass: 'bg-green-50/55',
    tipBoxClass: 'bg-green-50/80 border-green-300 text-green-950',
    certClasses: {
      paper: 'bg-[#f6fff8] border-[#15803d] outline-[#22c55e]/60',
      corner: 'border-[#15803d] text-[#15803d]',
      sealCircle: 'border-[#15803d] bg-green-100 text-[#14532d]',
      title: 'text-[#14532d] border-[#15803d]/80',
      honors: 'text-[#15803d]',
      badge: 'border-green-300 bg-green-50 text-green-950',
    },
  },
  {
    id: 'rosalina_cosmic_ice',
    label: 'Rosalina Cosmic Cyan',
    shortLabel: 'Cosmic Ice',
    swatchSwatchClass: 'bg-[#0e7490]',
    accentDotClass: 'bg-[#22d3ee]',
    headingBorderClass: 'border-[#0e7490]',
    subtleBoxClass: 'bg-cyan-50/60 border-cyan-300',
    tableHeaderClass: 'bg-cyan-100/80 text-cyan-950 border-b-2 border-[#0e7490]',
    summaryBannerHeaderClass: 'bg-[#0e7490] text-white',
    summaryPaperBgClass: 'bg-[#f6fdff] text-slate-950 border-[#0e7490]',
    worldBannerClass: 'bg-[#0e7490] text-white border-[#164e63]',
    zebraRowClass: 'bg-cyan-50/55',
    tipBoxClass: 'bg-cyan-50/80 border-cyan-300 text-cyan-950',
    certClasses: {
      paper: 'bg-[#f4fcff] border-[#0e7490] outline-[#06b6d4]/60',
      corner: 'border-[#0e7490] text-[#0e7490]',
      sealCircle: 'border-[#0e7490] bg-cyan-100 text-[#164e63]',
      title: 'text-[#164e63] border-[#0e7490]/80',
      honors: 'text-[#0891b2]',
      badge: 'border-cyan-300 bg-cyan-50 text-cyan-950',
    },
  },
  {
    id: 'golden_crown_ivory',
    label: 'Golden Crown Ivory',
    shortLabel: 'Crown Gold',
    swatchSwatchClass: 'bg-[#a16207]',
    accentDotClass: 'bg-[#facc15]',
    headingBorderClass: 'border-[#a16207]',
    subtleBoxClass: 'bg-yellow-50/70 border-yellow-400',
    tableHeaderClass: 'bg-yellow-100/80 text-yellow-950 border-b-2 border-[#a16207]',
    summaryBannerHeaderClass: 'bg-[#854d0e] text-white',
    summaryPaperBgClass: 'bg-[#fffef7] text-slate-950 border-[#a16207]',
    worldBannerClass: 'bg-[#854d0e] text-white border-[#713f12]',
    zebraRowClass: 'bg-yellow-50/60',
    tipBoxClass: 'bg-yellow-50/90 border-yellow-400 text-yellow-950',
    certClasses: {
      paper: 'bg-[#fffef5] border-[#a16207] outline-[#eab308]/65',
      corner: 'border-[#a16207] text-[#854d0e]',
      sealCircle: 'border-[#a16207] bg-yellow-100 text-[#713f12]',
      title: 'text-[#713f12] border-[#a16207]/80',
      honors: 'text-[#a16207]',
      badge: 'border-yellow-400 bg-yellow-50 text-yellow-950',
    },
  },
  {
    id: 'sakura_editorial',
    label: 'Sakura Hanami Editorial',
    shortLabel: 'Sakura',
    swatchSwatchClass: 'bg-[#be123c]',
    accentDotClass: 'bg-[#fda4af]',
    headingBorderClass: 'border-[#be123c]',
    subtleBoxClass: 'bg-rose-50/60 border-rose-300',
    tableHeaderClass: 'bg-rose-100/80 text-rose-950 border-b-2 border-[#be123c]',
    summaryBannerHeaderClass: 'bg-[#be123c] text-white',
    summaryPaperBgClass: 'bg-[#fff8f9] text-slate-950 border-[#be123c]',
    worldBannerClass: 'bg-[#be123c] text-white border-[#881337]',
    zebraRowClass: 'bg-rose-50/55',
    tipBoxClass: 'bg-rose-50/80 border-rose-300 text-rose-950',
    certClasses: {
      paper: 'bg-[#fff7f9] border-[#be123c] outline-[#fb7185]/60',
      corner: 'border-[#be123c] text-[#9f1239]',
      sealCircle: 'border-[#be123c] bg-rose-100 text-[#881337]',
      title: 'text-[#881337] border-[#be123c]/80',
      honors: 'text-[#e11d48]',
      badge: 'border-rose-300 bg-rose-50 text-rose-950',
    },
  },
  {
    id: 'midnight_espresso',
    label: 'Midnight Espresso Chambers',
    shortLabel: 'Espresso',
    swatchSwatchClass: 'bg-[#292524]',
    accentDotClass: 'bg-[#d6d3d1]',
    headingBorderClass: 'border-[#44403c]',
    subtleBoxClass: 'bg-stone-100/80 border-stone-400',
    tableHeaderClass: 'bg-stone-200/80 text-stone-950 border-b-2 border-[#292524]',
    summaryBannerHeaderClass: 'bg-[#292524] text-amber-100',
    summaryPaperBgClass: 'bg-[#fafaf9] text-stone-950 border-[#292524]',
    worldBannerClass: 'bg-[#292524] text-amber-100 border-[#1c1917]',
    zebraRowClass: 'bg-stone-100/70',
    tipBoxClass: 'bg-stone-100 border-stone-400 text-stone-900',
    certClasses: {
      paper: 'bg-[#faf9f6] border-[#44403c] outline-[#78716c]/60',
      corner: 'border-[#44403c] text-[#292524]',
      sealCircle: 'border-[#44403c] bg-stone-200 text-[#292524]',
      title: 'text-[#1c1917] border-[#44403c]',
      honors: 'text-[#78350f]',
      badge: 'border-stone-400 bg-stone-100 text-stone-900',
    },
  },
  {
    id: 'arctic_glacier',
    label: 'Arctic Glacier Slate',
    shortLabel: 'Glacier',
    swatchSwatchClass: 'bg-[#0369a1]',
    accentDotClass: 'bg-[#7dd3fc]',
    headingBorderClass: 'border-[#0369a1]',
    subtleBoxClass: 'bg-sky-50/70 border-sky-300',
    tableHeaderClass: 'bg-sky-100 text-sky-950 border-b-2 border-[#0369a1]',
    summaryBannerHeaderClass: 'bg-[#0369a1] text-white',
    summaryPaperBgClass: 'bg-[#f8fcff] text-slate-950 border-[#0369a1]',
    worldBannerClass: 'bg-[#0369a1] text-white border-[#0c4a6e]',
    zebraRowClass: 'bg-sky-50/60',
    tipBoxClass: 'bg-sky-50/85 border-sky-300 text-sky-950',
    certClasses: {
      paper: 'bg-[#f7fcff] border-[#0369a1] outline-[#38bdf8]/60',
      corner: 'border-[#0369a1] text-[#075985]',
      sealCircle: 'border-[#0369a1] bg-sky-100 text-[#0c4a6e]',
      title: 'text-[#0c4a6e] border-[#0369a1]/80',
      honors: 'text-[#0284c7]',
      badge: 'border-sky-300 bg-sky-50 text-sky-950',
    },
  },
  {
    id: 'solarized_amber',
    label: 'Solarized Warm Study',
    shortLabel: 'Solarized',
    swatchSwatchClass: 'bg-[#b45309]',
    accentDotClass: 'bg-[#fbbf24]',
    headingBorderClass: 'border-[#b45309]',
    subtleBoxClass: 'bg-[#fdf6e3] border-amber-300',
    tableHeaderClass: 'bg-[#eee8d5] text-[#073642] border-b-2 border-[#b45309]',
    summaryBannerHeaderClass: 'bg-[#073642] text-[#fdf6e3]',
    summaryPaperBgClass: 'bg-[#fdf6e3] text-[#073642] border-[#073642]',
    worldBannerClass: 'bg-[#073642] text-[#fdf6e3] border-[#002b36]',
    zebraRowClass: 'bg-[#eee8d5]/65',
    tipBoxClass: 'bg-[#eee8d5] border-amber-500 text-[#073642]',
    certClasses: {
      paper: 'bg-[#fdf6e3] border-[#073642] outline-[#b58900]/70',
      corner: 'border-[#b58900] text-[#073642]',
      sealCircle: 'border-[#073642] bg-[#eee8d5] text-[#b58900]',
      title: 'text-[#073642] border-[#b58900]',
      honors: 'text-[#cb4b16]',
      badge: 'border-[#93a1a1] bg-[#eee8d5] text-[#073642]',
    },
  },
  {
    id: 'mint_dole_ledger',
    label: 'Mint DOLE Ledger',
    shortLabel: 'Mint Ledger',
    swatchSwatchClass: 'bg-[#047857]',
    accentDotClass: 'bg-[#6ee7b7]',
    headingBorderClass: 'border-[#047857]',
    subtleBoxClass: 'bg-emerald-50/70 border-emerald-300',
    tableHeaderClass: 'bg-emerald-100/80 text-emerald-950 border-b-2 border-[#047857]',
    summaryBannerHeaderClass: 'bg-[#047857] text-white',
    summaryPaperBgClass: 'bg-[#f6fef9] text-slate-950 border-[#047857]',
    worldBannerClass: 'bg-[#047857] text-white border-[#064e3b]',
    zebraRowClass: 'bg-emerald-50/60',
    tipBoxClass: 'bg-emerald-50/85 border-emerald-400 text-emerald-950',
    certClasses: {
      paper: 'bg-[#f4fef8] border-[#047857] outline-[#10b981]/60',
      corner: 'border-[#047857] text-[#065f46]',
      sealCircle: 'border-[#047857] bg-emerald-100 text-[#064e3b]',
      title: 'text-[#064e3b] border-[#047857]/80',
      honors: 'text-[#059669]',
      badge: 'border-emerald-300 bg-emerald-50 text-emerald-950',
    },
  },
  {
    id: 'sunset_coral',
    label: 'Sunset Coral Vermilion',
    shortLabel: 'Coral',
    swatchSwatchClass: 'bg-[#c2410c]',
    accentDotClass: 'bg-[#fb7185]',
    headingBorderClass: 'border-[#e11d48]',
    subtleBoxClass: 'bg-orange-50/60 border-rose-300',
    tableHeaderClass: 'bg-rose-100/75 text-rose-950 border-b-2 border-[#e11d48]',
    summaryBannerHeaderClass: 'bg-[#e11d48] text-white',
    summaryPaperBgClass: 'bg-[#fffaf8] text-slate-950 border-[#e11d48]',
    worldBannerClass: 'bg-[#e11d48] text-white border-[#9f1239]',
    zebraRowClass: 'bg-orange-50/55',
    tipBoxClass: 'bg-orange-50/85 border-orange-300 text-rose-950',
    certClasses: {
      paper: 'bg-[#fffaf8] border-[#e11d48] outline-[#f97316]/60',
      corner: 'border-[#e11d48] text-[#be123c]',
      sealCircle: 'border-[#e11d48] bg-orange-100 text-[#9f1239]',
      title: 'text-[#9f1239] border-[#e11d48]/80',
      honors: 'text-[#ea580c]',
      badge: 'border-rose-300 bg-orange-50 text-rose-950',
    },
  },
  {
    id: 'indigo_jurisprudence',
    label: 'Indigo Jurisprudence',
    shortLabel: 'Indigo',
    swatchSwatchClass: 'bg-[#312e81]',
    accentDotClass: 'bg-[#818cf8]',
    headingBorderClass: 'border-[#3730a3]',
    subtleBoxClass: 'bg-indigo-50/60 border-indigo-300',
    tableHeaderClass: 'bg-indigo-100/80 text-indigo-950 border-b-2 border-[#3730a3]',
    summaryBannerHeaderClass: 'bg-[#312e81] text-white',
    summaryPaperBgClass: 'bg-[#f9f9ff] text-slate-950 border-[#312e81]',
    worldBannerClass: 'bg-[#312e81] text-white border-[#1e1b4b]',
    zebraRowClass: 'bg-indigo-50/55',
    tipBoxClass: 'bg-indigo-50/80 border-indigo-300 text-indigo-950',
    certClasses: {
      paper: 'bg-[#f8f9ff] border-[#3730a3] outline-[#6366f1]/60',
      corner: 'border-[#3730a3] text-[#312e81]',
      sealCircle: 'border-[#3730a3] bg-indigo-100 text-[#312e81]',
      title: 'text-[#1e1b4b] border-[#3730a3]/80',
      honors: 'text-[#4338ca]',
      badge: 'border-indigo-300 bg-indigo-50 text-indigo-950',
    },
  },
  {
    id: 'wario_royal_gold',
    label: 'Wario Imperial Purple & Gold',
    shortLabel: 'Imperial Gold',
    swatchSwatchClass: 'bg-[#4c1d95]',
    accentDotClass: 'bg-[#facc15]',
    headingBorderClass: 'border-[#5b21b6]',
    subtleBoxClass: 'bg-amber-50/65 border-purple-300',
    tableHeaderClass: 'bg-amber-100/80 text-purple-950 border-b-2 border-[#5b21b6]',
    summaryBannerHeaderClass: 'bg-[#4c1d95] text-amber-300',
    summaryPaperBgClass: 'bg-[#fffef9] text-slate-950 border-[#4c1d95]',
    worldBannerClass: 'bg-[#4c1d95] text-amber-300 border-[#2e1065]',
    zebraRowClass: 'bg-purple-50/45',
    tipBoxClass: 'bg-amber-50/85 border-amber-400 text-purple-950',
    certClasses: {
      paper: 'bg-[#fffdf6] border-[#5b21b6] outline-[#eab308]/75',
      corner: 'border-[#ca8a04] text-[#4c1d95]',
      sealCircle: 'border-[#5b21b6] bg-amber-200 text-[#4c1d95]',
      title: 'text-[#4c1d95] border-[#ca8a04]',
      honors: 'text-[#b45309]',
      badge: 'border-amber-400 bg-purple-50 text-purple-950',
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
    worldBannerClass: 'bg-white text-black border-2 border-black',
    zebraRowClass: 'bg-white',
    tipBoxClass: 'bg-white border-black text-black',
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
    id: 'libre_baskerville',
    label: 'Libre Baskerville Law',
    shortLabel: 'Baskerville',
    category: 'serif',
    previewClass: 'print-font-libre-baskerville',
  },
  {
    id: 'cormorant_chancery',
    label: 'Cormorant Garamond Chancery',
    shortLabel: 'Cormorant',
    category: 'serif',
    previewClass: 'print-font-cormorant-chancery',
  },
  {
    id: 'crimson_juris',
    label: 'Crimson Pro Jurisprudence',
    shortLabel: 'Crimson Pro',
    category: 'serif',
    previewClass: 'print-font-crimson-juris',
  },
  {
    id: 'source_serif_codal',
    label: 'Source Serif 4 Codal',
    shortLabel: 'Source Serif',
    category: 'serif',
    previewClass: 'print-font-source-serif-codal',
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
    id: 'outfit_geometric',
    label: 'Outfit Geometric Sans',
    shortLabel: 'Outfit Sans',
    category: 'sans',
    previewClass: 'print-font-outfit-geometric',
  },
  {
    id: 'dm_sans_clean',
    label: 'DM Sans Clean Studio',
    shortLabel: 'DM Sans',
    category: 'sans',
    previewClass: 'print-font-dm-sans-clean',
  },
  {
    id: 'bricolage_editorial',
    label: 'Bricolage Editorial Grotesque',
    shortLabel: 'Bricolage',
    category: 'sans',
    previewClass: 'print-font-bricolage-editorial',
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
    label: 'Public Sans Compact Digest',
    shortLabel: 'Public Narrow',
    category: 'sans',
    previewClass: 'print-font-condensed-narrow',
  },
  {
    id: 'dyslexic_sans',
    label: 'Lexend Accessible Wide',
    shortLabel: 'Lexend Wide',
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
    id: 'ibm_plex_docket',
    label: 'IBM Plex Docket Mono',
    shortLabel: 'IBM Plex Mono',
    category: 'mono',
    previewClass: 'print-font-ibm-plex-docket',
  },
  {
    id: 'retro_mario_mono',
    label: 'Fira Code & Arcade Pixel',
    shortLabel: 'Arcade Mono',
    category: 'mono',
    previewClass: 'print-font-retro-mario-mono',
  },
];

export type AppStudyFontId =
  | 'jakarta'
  | 'editorial_serif'
  | 'outfit'
  | 'lexend'
  | 'crimson'
  | 'dm_sans'
  | 'bricolage'
  | 'jetbrains_mono';

export interface AppStudyFontCatalogItem {
  id: AppStudyFontId;
  label: string;
  shortLabel: string;
  subtitle: string;
  cssClass: string;
}

export const APP_STUDY_FONT_STORAGE_KEY = 'mario_app_study_font_v1';

export const APP_STUDY_FONTS: readonly AppStudyFontCatalogItem[] = [
  {
    id: 'jakarta',
    label: 'Plus Jakarta Sans (Default)',
    shortLabel: 'Jakarta Sans',
    subtitle: 'Crisp modern geometric legibility',
    cssClass: 'app-study-font-jakarta',
  },
  {
    id: 'editorial_serif',
    label: 'Merriweather Law Book',
    shortLabel: 'Merriweather',
    subtitle: 'Classic textbook & Supreme Court digest feel',
    cssClass: 'app-study-font-editorial-serif',
  },
  {
    id: 'lexend',
    label: 'Lexend High-Clarity',
    shortLabel: 'Lexend Wide',
    subtitle: 'Designed for zero eye-strain reading speed',
    cssClass: 'app-study-font-lexend',
  },
  {
    id: 'outfit',
    label: 'Outfit Geometric Studio',
    shortLabel: 'Outfit',
    subtitle: 'Friendly, rounded geometric proportions',
    cssClass: 'app-study-font-outfit',
  },
  {
    id: 'crimson',
    label: 'Crimson Pro Jurisprudence',
    shortLabel: 'Crimson Serif',
    subtitle: 'Refined literary & statutory codal serif',
    cssClass: 'app-study-font-crimson',
  },
  {
    id: 'dm_sans',
    label: 'DM Sans Minimalist',
    shortLabel: 'DM Sans',
    subtitle: 'Balanced low-contrast neo-grotesque prose',
    cssClass: 'app-study-font-dm-sans',
  },
  {
    id: 'bricolage',
    label: 'Bricolage Grotesque',
    shortLabel: 'Bricolage',
    subtitle: 'Expressive editorial character & sharp numerals',
    cssClass: 'app-study-font-bricolage',
  },
  {
    id: 'jetbrains_mono',
    label: 'JetBrains Statutory Mono',
    shortLabel: 'Codal Mono',
    subtitle: 'Precision tabular alignment for rates & formulas',
    cssClass: 'app-study-font-jetbrains-mono',
  },
];

export type PreviewZoomPreset = 'fit' | '75' | '100' | '125';

export interface A4PreviewStageMetrics {
  logicalWidthPx: number;
  logicalMinHeightPx: number;
  fitScale: number;
  effectiveScale: number;
  scaledWidthPx: number;
}

export function computeA4PreviewStageMetrics(params: {
  containerWidthPx: number;
  containerHeightPx?: number;
  fitWholePageVertically?: boolean;
  isLandscape: boolean;
  zoomPreset: PreviewZoomPreset;
}): A4PreviewStageMetrics {
  const logicalWidthPx = params.isLandscape ? 1122 : 794;
  const logicalMinHeightPx = params.isLandscape ? 794 : 1123;
  const safeContainer = Math.max(260, Math.floor(params.containerWidthPx || 820));
  const usableWidth = Math.max(236, safeContainer - 24);
  const widthScale = usableWidth / logicalWidthPx;

  let rawFitScale = widthScale;
  if (
    params.fitWholePageVertically &&
    typeof params.containerHeightPx === 'number' &&
    params.containerHeightPx > 180
  ) {
    const usableHeight = Math.max(180, Math.floor(params.containerHeightPx) - 24);
    const heightScale = usableHeight / logicalMinHeightPx;
    rawFitScale = Math.min(widthScale, heightScale);
  }

  const fitScale = Math.min(1, Number(rawFitScale.toFixed(4)));

  const effectiveScale =
    params.zoomPreset === 'fit'
      ? fitScale
      : params.zoomPreset === '75'
      ? 0.75
      : params.zoomPreset === '125'
      ? 1.25
      : 1;

  return {
    logicalWidthPx,
    logicalMinHeightPx,
    fitScale,
    effectiveScale,
    scaledWidthPx: Math.round(logicalWidthPx * effectiveScale),
  };
}

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

// ============================================================================
// 7. 'REVIEW REQUIRED' SPACED RETENTION SYSTEM (> 14 DAYS UNACCESSED)
// ============================================================================

export const TOPIC_LAST_ACCESSED_STORAGE_KEY = 'mario_topic_last_accessed_map_v1';
export const TOPIC_ACCESS_SEEDED_KEY = 'mario_topic_access_seeded_v1';
export const REVIEW_REQUIRED_THRESHOLD_DAYS = 14;
export const MS_PER_DAY = 86_400_000;

export type TopicLastAccessedMap = Record<string, number>;

export interface OverdueReviewTopicItem {
  topicId: string;
  title: string;
  badge: string;
  worldId: string;
  daysSinceAccess: number;
  lastAccessedMs: number;
}

export function loadTopicLastAccessedMap(
  storage?: Pick<Storage, 'getItem'> | null
): TopicLastAccessedMap {
  if (!storage) return {};
  try {
    const raw = storage.getItem(TOPIC_LAST_ACCESSED_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const clean: TopicLastAccessedMap = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (typeof key === 'string' && typeof val === 'number' && Number.isFinite(val) && val > 0) {
        clean[key] = val;
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export function saveTopicLastAccessedMap(
  map: TopicLastAccessedMap,
  storage?: Pick<Storage, 'setItem'> | null
): void {
  if (!storage) return;
  try {
    storage.setItem(TOPIC_LAST_ACCESSED_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

export function initializeTopicAccessMapWithRetentionSeed(params: {
  existingMap: TopicLastAccessedMap;
  completedTopicIds: readonly string[];
  allTopicIds: readonly string[];
  alreadySeeded: boolean;
  nowMs?: number;
}): { map: TopicLastAccessedMap; didSeed: boolean } {
  const nowMs = params.nowMs ?? Date.now();
  const next: TopicLastAccessedMap = { ...params.existingMap };
  let didSeed = false;

  // Backfill legacy completed topics without recorded access timestamps as 16 days ago
  for (const topicId of params.completedTopicIds) {
    if (!next[topicId]) {
      next[topicId] = nowMs - 16 * MS_PER_DAY;
      didSeed = true;
    }
  }

  // Seed 2 starter foundational topics once on a fresh profile so spaced-repetition notifications are immediately actionable
  if (!params.alreadySeeded && Object.keys(next).length === 0 && params.allTopicIds.length > 0) {
    const firstId = params.allTopicIds[0];
    const secondId = params.allTopicIds.find((id) => id.includes('holiday')) || params.allTopicIds[1];
    if (firstId) next[firstId] = nowMs - 16 * MS_PER_DAY;
    if (secondId && secondId !== firstId) next[secondId] = nowMs - 15 * MS_PER_DAY;
    didSeed = true;
  }

  return { map: next, didSeed };
}

export function recordTopicAccessTimestamp(
  currentMap: TopicLastAccessedMap,
  topicId: string,
  nowMs: number = Date.now()
): TopicLastAccessedMap {
  const trimmed = topicId.trim();
  if (!trimmed) return currentMap;
  return {
    ...currentMap,
    [trimmed]: nowMs,
  };
}

export function recordMultipleTopicsAccessTimestamp(
  currentMap: TopicLastAccessedMap,
  topicIds: readonly string[],
  nowMs: number = Date.now()
): TopicLastAccessedMap {
  const next = { ...currentMap };
  for (const id of topicIds) {
    const trimmed = id.trim();
    if (trimmed) {
      next[trimmed] = nowMs;
    }
  }
  return next;
}

export function getOverdueReviewTopics(params: {
  lastAccessedMap: TopicLastAccessedMap;
  allTopics: readonly { id: string; title: string; badge: string; worldId: string }[];
  nowMs?: number;
  thresholdDays?: number;
}): OverdueReviewTopicItem[] {
  const nowMs = params.nowMs ?? Date.now();
  const thresholdDays = params.thresholdDays ?? REVIEW_REQUIRED_THRESHOLD_DAYS;
  const thresholdMs = thresholdDays * MS_PER_DAY;

  const overdue: OverdueReviewTopicItem[] = [];
  for (const topic of params.allTopics) {
    const ts = params.lastAccessedMap[topic.id];
    if (typeof ts !== 'number' || !Number.isFinite(ts) || ts <= 0) continue;
    const elapsedMs = nowMs - ts;
    if (elapsedMs > thresholdMs) {
      overdue.push({
        topicId: topic.id,
        title: topic.title,
        badge: topic.badge,
        worldId: topic.worldId,
        daysSinceAccess: Math.floor(elapsedMs / MS_PER_DAY),
        lastAccessedMs: ts,
      });
    }
  }

  return overdue.sort((a, b) => b.daysSinceAccess - a.daysSinceAccess);
}

// ============================================================================
// 8. 'BOSS BATTLE LOG' (PAST 10 BAR MASTER / EXAM_PREP QUIZ RESULTS)
// ============================================================================

export const BOSS_BATTLE_LOG_STORAGE_KEY = 'mario_boss_battle_log_v1';
export const MAX_BOSS_BATTLE_LOG_ENTRIES = 10;

export interface BossBattleLogEntry {
  id: string;
  playedAtIso: string;
  modeLabel: string;
  difficultyTier: 'Bar Master';
  score: number;
  totalQuestions: number;
  accuracyPercent: number;
  timeTakenSeconds: number;
  incorrectTopics: string[];
  victory: boolean;
}

export function loadBossBattleLog(
  storage?: Pick<Storage, 'getItem'> | null
): BossBattleLogEntry[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(BOSS_BATTLE_LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is BossBattleLogEntry =>
          Boolean(item) &&
          typeof item.id === 'string' &&
          typeof item.score === 'number' &&
          typeof item.totalQuestions === 'number'
      )
      .slice(0, MAX_BOSS_BATTLE_LOG_ENTRIES);
  } catch {
    return [];
  }
}

export function saveBossBattleLog(
  entries: readonly BossBattleLogEntry[],
  storage?: Pick<Storage, 'setItem'> | null
): void {
  if (!storage) return;
  try {
    storage.setItem(
      BOSS_BATTLE_LOG_STORAGE_KEY,
      JSON.stringify(entries.slice(0, MAX_BOSS_BATTLE_LOG_ENTRIES))
    );
  } catch {
    // ignore storage errors
  }
}

export function recordBossBattleLogEntry(
  existing: readonly BossBattleLogEntry[],
  input: {
    modeLabel: string;
    score: number;
    totalQuestions: number;
    timeTakenSeconds: number;
    incorrectTopics: readonly string[];
    victory?: boolean;
    nowIso?: string;
  }
): BossBattleLogEntry[] {
  const total = Math.max(1, Math.round(input.totalQuestions));
  const score = Math.max(0, Math.min(total, Math.round(input.score)));
  const accuracyPercent = Math.round((score / total) * 100);
  const uniqueMissed = Array.from(
    new Set(input.incorrectTopics.map((t) => t.trim()).filter(Boolean))
  ).slice(0, 8);

  const entry: BossBattleLogEntry = {
    id: `bblog-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    playedAtIso: input.nowIso || new Date().toISOString(),
    modeLabel: input.modeLabel || 'Bar Master Boss Run',
    difficultyTier: 'Bar Master',
    score,
    totalQuestions: total,
    accuracyPercent,
    timeTakenSeconds: Math.max(1, Math.round(input.timeTakenSeconds)),
    incorrectTopics: uniqueMissed,
    victory: input.victory ?? accuracyPercent >= 70,
  };

  return [entry, ...existing].slice(0, MAX_BOSS_BATTLE_LOG_ENTRIES);
}

// ============================================================================
// 9. MODULES 'STUDY SPRINT' 25-MINUTE POMODORO EVALUATION
// ============================================================================

export const STUDY_SPRINT_DURATION_SECONDS = 25 * 60;
export const STUDY_SPRINT_BASE_COINS = 20;
export const STUDY_SPRINT_UNBROKEN_BONUS_COINS = 40;

export interface StudySprintRewardSummary {
  baseCoins: number;
  focusBonusCoins: number;
  totalCoins: number;
  unbrokenFocus: boolean;
}

export function evaluateStudySprintCompletion(params: {
  completedFull25Minutes: boolean;
  switchedTabsDuringSprint: boolean;
}): StudySprintRewardSummary {
  if (!params.completedFull25Minutes) {
    return {
      baseCoins: 0,
      focusBonusCoins: 0,
      totalCoins: 0,
      unbrokenFocus: false,
    };
  }
  const unbrokenFocus = !params.switchedTabsDuringSprint;
  const baseCoins = STUDY_SPRINT_BASE_COINS;
  const focusBonusCoins = unbrokenFocus ? STUDY_SPRINT_UNBROKEN_BONUS_COINS : 0;
  return {
    baseCoins,
    focusBonusCoins,
    totalCoins: baseCoins + focusBonusCoins,
    unbrokenFocus,
  };
}

// ============================================================================
// 10. STUDY AMBIENCE SOUNDSCAPES (AUTO-PAUSE WHEN MARIO BGM PLAYS)
// ============================================================================

export type StudyAmbiencePreset =
  | 'off'
  | 'overworld_breeze'
  | 'underground_echoes'
  | 'peach_castle_rain'
  | 'rosalina_starlight'
  | 'yoshi_tropic_waves'
  | 'koopa_library_hearth'
  | 'forest'
  | 'underwater'
  | 'castle'
  | 'rainy_library'
  | 'starry_night';

export const STUDY_AMBIENCE_OPTIONS: readonly {
  id: StudyAmbiencePreset;
  label: string;
  subtitle: string;
}[] = [
  { id: 'off', label: 'Off', subtitle: 'No background ambience' },
  { id: 'overworld_breeze', label: 'Overworld Breeze', subtitle: 'Mushroom Kingdom meadow breeze & soft coin harmonics' },
  { id: 'underground_echoes', label: 'Underground Echoes', subtitle: 'Crystal cavern resonance & subterranean droplets' },
  { id: 'peach_castle_rain', label: 'Peach Castle Rain', subtitle: 'Warm stained-glass library rain pattering' },
  { id: 'rosalina_starlight', label: 'Starlight Observatory', subtitle: 'Celestial Luma synth pads & calm shimmer' },
  { id: 'yoshi_tropic_waves', label: 'Yoshi Tropic Shore', subtitle: 'Calm tropical lagoon surf & island breeze' },
  { id: 'koopa_library_hearth', label: 'Koopa Keep Hearth', subtitle: 'Crackling fireplace embers & amber drone' },
  { id: 'forest', label: 'Forest', subtitle: 'Soft woodland breeze & gentle chimes' },
  { id: 'underwater', label: 'Underwater', subtitle: 'Deep aquatic currents & calm bubbles' },
  { id: 'castle', label: 'Castle', subtitle: 'Warm hearth crackle & stone hall' },
  { id: 'rainy_library', label: 'Rainy Library', subtitle: 'Gentle rain pattering & study hall warmth' },
  { id: 'starry_night', label: 'Starry Night', subtitle: 'Calm observatory pads & celestial shimmer' },
] as const;

export function shouldPlayStudyAmbience(params: {
  audioEnabled: boolean;
  ambiencePreset: StudyAmbiencePreset;
  bgmPlaying: boolean;
}): boolean {
  if (!params.audioEnabled) return false;
  if (params.ambiencePreset === 'off') return false;
  if (params.bgmPlaying) return false;
  return true;
}

// ============================================================================
// 11. 'STATUTE LOOKUP' ENGINE (LABOR CODE ARTICLES & SPECIAL R.A. STATUTES)
// ============================================================================

export interface StatuteLookupEntry {
  id: string;
  articleNumber: string;
  codeLabel: string;
  title: string;
  worldId: string;
  topicId?: string;
  statutoryText: string;
  supremeCourtDoctrines: string[];
  interpretationTips: string[];
  keywords: string[];
}

export const STATUTE_LOOKUP_CATALOG: readonly StatuteLookupEntry[] = [
  {
    id: 'art-82',
    articleNumber: '82',
    codeLabel: 'Art. 82, Labor Code',
    title: 'Coverage & Exclusions from Title I (Working Conditions & Hours of Work)',
    worldId: 'world1',
    topicId: 'm1-coverage',
    statutoryText:
      'The provisions of this Title shall apply to employees in all establishments and undertakings whether for profit or not, but not to government employees, managerial employees, field personnel, members of the family of the employer who are dependent on him for support, domestic helpers, persons in the personal service of another, and workers who are paid by results as determined by the Secretary of Labor.',
    supremeCourtDoctrines: [
      'Auto Bus Transport Systems v. Bautista (G.R. No. 156367): Drivers and conductors paid on commission who remain under dispatchers, inspectors, and fixed route schedules are NOT field personnel because their actual hours can be determined with reasonable certainty.',
      'San Miguel Brewery v. Democratic Labor Organization: The decisive test for field personnel is whether actual hours of work in the field cannot be determined with reasonable certainty by the employer.',
    ],
    interpretationTips: [
      'Exempt from Book III Title I means NO statutory entitlement to overtime pay, night shift differential, holiday pay, or SIL (unless stipulated in contract/CBA).',
      'Piece-rate workers supervised inside employer premises are NOT automatically excluded from all benefits; verify whether work is supervised or unsupervised.',
    ],
    keywords: ['coverage', 'exclusions', 'managerial', 'field personnel', 'domestic', 'piece rate'],
  },
  {
    id: 'art-83',
    articleNumber: '83',
    codeLabel: 'Art. 83, Labor Code',
    title: 'Normal Hours of Work & Health Personnel 40-Hour Week',
    worldId: 'world1',
    topicId: 'm1-hours-worked',
    statutoryText:
      'The normal hours of work of any employee shall not exceed eight (8) hours a day. Health personnel in cities and municipalities with a population of at least one million (1,000,000) or in hospitals and clinics with a bed capacity of at least one hundred (100) shall hold regular office hours for eight (8) hours a day, for five (5) days a week, exclusive of time for meals, except where the exigencies of the service require such personnel to work for six (6) days or forty-eight (48) hours, in which case they shall be entitled to an additional compensation of at least thirty percent (30%) of their regular wage for work on the sixth day.',
    supremeCourtDoctrines: [
      'San Juan De Dios Hospital Employees Association v. NLRC (G.R. No. 126383): Art. 83 does not mandate a paid 40-hour week where 2 rest days are paid; rather, if covered hospital personnel are required to work on the 6th day (48 hrs), they receive +30% premium for the 6th day.',
    ],
    interpretationTips: [
      'Check the TWO alternative thresholds for covered health personnel: (1) city/municipality population >= 1,000,000 OR (2) hospital/clinic bed capacity >= 100.',
      'The 6th-day exigency premium for covered health personnel is +30% (130% total), distinct from ordinary +25% daily overtime.',
    ],
    keywords: ['normal hours', '8 hours', 'health personnel', 'hospital', '100 bed', 'sixth day'],
  },
  {
    id: 'art-84',
    articleNumber: '84',
    codeLabel: 'Art. 84, Labor Code',
    title: 'Hours Worked, Waiting Time, Brownouts & Lectures',
    worldId: 'world1',
    topicId: 'm1-hours-worked',
    statutoryText:
      'Hours worked shall include (a) all time during which an employee is required to be on duty or to be at a prescribed workplace; and (b) all time during which an employee is suffered or permitted to work. Rest periods of short duration during working hours shall be counted as hours worked.',
    supremeCourtDoctrines: [
      'Rada v. NLRC (G.R. No. 96078): Project driver picking up and dropping off co-employees along designated routes before/after office hours is performing compensable work essential to company operations.',
      'Pan American World Airways System v. Pan American Employees Association: Meal/rest periods during which workers remain at the employer’s disposal and cannot leave their post are compensable hours worked.',
    ],
    interpretationTips: [
      'Short coffee/rest breaks of 5 to 20 minutes are ALWAYS compensable working time.',
      'Power interruptions / brownouts up to 20 minutes are compensable; beyond 20 minutes are non-compensable ONLY if employees may leave the premises or use the time freely.',
      'Attendance at lectures/seminars is NOT compensable if all 4 conditions concur: outside regular hours, voluntary, no productive work performed, and not directly related to the employee’s job.',
    ],
    keywords: ['hours worked', 'waiting time', 'brownout', 'rest break', '20 minutes', 'travel time'],
  },
  {
    id: 'art-85',
    articleNumber: '85',
    codeLabel: 'Art. 85, Labor Code',
    title: 'Meal Periods (60-Minute Time-Off Rule)',
    worldId: 'world1',
    topicId: 'm1-fwa-cww-meals-ot',
    statutoryText:
      'Subject to such regulations as the Secretary of Labor may prescribe, it shall be the duty of every employer to give his employees not less than sixty (60) minutes time-off for their regular meals.',
    supremeCourtDoctrines: [
      'Sime Darby Pilipinas v. NLRC (G.R. No. 119205): Management retains prerogative to change a 30-minute paid on-call meal break into a full 60-minute unpaid off-duty meal break without violating non-diminution of benefits.',
    ],
    interpretationTips: [
      'General rule: 60 minutes unpaid regular meal period (excluded from 8 hours worked).',
      'Exception (Omnibus Rules): Meal period may be shortened to NOT LESS THAN 20 minutes, PROVIDED it is credited as compensable hours worked (e.g., non-manual work, 16+ hr establishment operation, emergencies, perishable goods).',
    ],
    keywords: ['meal period', '60 minutes', 'shortened meal', 'lunch break'],
  },
  {
    id: 'art-86',
    articleNumber: '86',
    codeLabel: 'Art. 86, Labor Code',
    title: 'Night Shift Differential (+10% from 10:00 PM to 6:00 AM)',
    worldId: 'world1',
    topicId: 'm1-fwa-cww-meals-ot',
    statutoryText:
      'Every employee shall be paid a night shift differential of not less than ten percent (10%) of his regular wage for each hour of work performed between ten o’clock in the evening and six o’clock in the morning.',
    supremeCourtDoctrines: [
      'Mercury Drug Co. v. Dayao: Night shift differential is a statutory public-policy benefit founded on the deleterious physiological effects of graveyard work and cannot be waived.',
    ],
    interpretationTips: [
      'Additional exemption specific to Art. 86: Retail and service establishments regularly employing NOT MORE THAN FIVE (5) workers.',
      'Night Shift Differential stacks multiplicatively with Overtime and Holiday rates: Ordinary OT + NSD = 1.25 × 1.10 = 137.5%; Regular Holiday + NSD = 2.00 × 1.10 = 220%.',
    ],
    keywords: ['night shift', 'nsd', '10%', '10pm', '6am', '5 workers'],
  },
  {
    id: 'art-87',
    articleNumber: '87',
    codeLabel: 'Art. 87, Labor Code',
    title: 'Overtime Work (+25% Ordinary Day / +30% Holiday or Rest Day)',
    worldId: 'world1',
    topicId: 'm1-fwa-cww-meals-ot',
    statutoryText:
      'Work may be performed beyond eight (8) hours a day provided that the employee is paid for the overtime work, an additional compensation equivalent to his regular wage plus at least twenty-five percent (25%) thereof. Work performed beyond eight hours on a holiday or rest day shall be paid an additional compensation equivalent to the rate of the first eight hours on a holiday or rest day plus at least thirty percent (30%) thereof.',
    supremeCourtDoctrines: [
      'Robina Farms Cebu v. Villa (G.R. No. 175869): Entitlement to overtime pay must be proved by the employee through time records, DTRs, or credible corroborative proof showing actual rendition of authorized excess hours.',
      'Bisig Manggagawa sa Tryco v. NLRC: Under a valid Compressed Workweek (CWW) scheme (e.g., 48 hours over 5 days), hours beyond 8 up to the agreed daily CWW limit waive daily overtime provided weekly hours do not exceed 48.',
    ],
    interpretationTips: [
      'Memorize the two OT multipliers: +25% on ordinary working days (125%); +30% of the day’s hourly rate on Rest Days, Special Days, and Regular Holidays (e.g., Rest Day OT = 130% × 1.30 = 169%; Regular Holiday OT = 200% × 1.30 = 260%).',
      '"Regular wage" for OT base includes cash wage + fair value of facilities, excluding COLA.',
    ],
    keywords: ['overtime', 'ot', '125%', '169%', '260%', 'beyond 8 hours'],
  },
  {
    id: 'art-88',
    articleNumber: '88',
    codeLabel: 'Art. 88, Labor Code',
    title: 'Undertime Not Offset by Overtime',
    worldId: 'world1',
    topicId: 'm1-fwa-cww-meals-ot',
    statutoryText:
      'Undertime work on any particular day shall not be offset by overtime work on any other day. Permission given to the employee to go on leave on some other day of the week shall not exempt the employer from paying the additional compensation required in this Chapter.',
    supremeCourtDoctrines: [
      'NWSA v. NWSA Consolidated Unions: Offsetting undertime against overtime is unfair to the worker because undertime is deducted at the straight 100% hourly rate whereas overtime is compensated at 125% or 130%+.',
    ],
    interpretationTips: [
      'Classic trap: If an employee incurs 2 hours undertime on Monday and renders 2 hours overtime on Wednesday, the employer CANNOT cancel them out — deduct 2 straight hours on Monday and pay 2 hours at 125% for Wednesday.',
    ],
    keywords: ['undertime', 'offset', 'overtime'],
  },
  {
    id: 'art-91',
    articleNumber: '91',
    codeLabel: 'Art. 91–93, Labor Code',
    title: 'Right to Weekly Rest Period (24 Consecutive Hours After 6 Days)',
    worldId: 'world2',
    topicId: 'm2-rest-periods',
    statutoryText:
      'It shall be the duty of every employer, whether operating for profit or not, to provide each of his employees a rest period of not less than twenty-four (24) consecutive hours after every six (6) consecutive normal work days. The employer shall determine and schedule the weekly rest day of his employees subject to collective bargaining agreement, provided the employer shall respect the preference of employees as to their weekly rest day when such preference is based on religious grounds.',
    supremeCourtDoctrines: [
      'Religious Preference Rule (Omnibus Rules): When respecting an employee’s religious rest day preference causes serious prejudice or obstruction to operations, the employer must grant the preferred religious rest day at least TWO (2) days a month.',
    ],
    interpretationTips: [
      'Work on scheduled Rest Day = +30% premium (130%).',
      'Work on Special Non-Working Day that ALSO falls on scheduled Rest Day = +50% premium (150%).',
      'Compulsory rest day work is permitted only in statutory emergencies (calamity, urgent machinery repair, abnormal workload, perishable goods, continuous-process nature).',
    ],
    keywords: ['rest day', 'weekly rest', '24 hours', 'religious', '130%', '150%'],
  },
  {
    id: 'art-94',
    articleNumber: '94',
    codeLabel: 'Art. 94, Labor Code',
    title: 'Right to Holiday Pay (100% Unworked / 200% Worked Regular Holiday)',
    worldId: 'world2',
    topicId: 'm2-holiday-pay',
    statutoryText:
      'Every worker shall be paid his regular daily wage during regular holidays, except in retail and service establishments regularly employing less than ten (10) workers; The employer may require an employee to work on any holiday but such employee shall be paid a compensation equivalent to twice his regular rate.',
    supremeCourtDoctrines: [
      'Asian Transmission Corp. v. Court of Appeals (G.R. No. 144664): When two regular holidays fall on the same day (e.g., Araw ng Kagitingan and Good Friday), an unworked employee receives 200% and an employee who works receives 300% (390% if also their rest day).',
      'Jose Rizal College v. NLRC: Hourly-paid faculty members are not entitled to regular holiday pay during semestral breaks, but are entitled when classes are merely suspended due to regular holidays.',
    ],
    interpretationTips: [
      'Retail/service exemption threshold under Art. 94 & Art. 95 (SIL): LESS THAN TEN (< 10) regular workers (i.e., 1 to 9 workers). Contrast with Art. 86 NSD (<= 5 workers).',
      'Successive Regular Holidays (Maundy Thursday & Good Friday): Being on unpaid absence on Wednesday disqualifies BOTH holidays UNLESS the employee actually works on Maundy Thursday, which restores Friday holiday pay!',
    ],
    keywords: ['holiday pay', 'regular holiday', '200%', '300%', '390%', 'double holiday', '10 workers'],
  },
  {
    id: 'art-95',
    articleNumber: '95',
    codeLabel: 'Art. 95, Labor Code',
    title: 'Service Incentive Leave (5 Days Paid & Commutable After 1 Year)',
    worldId: 'world6',
    topicId: 'm6-service-incentive-leave',
    statutoryText:
      'Every employee who has rendered at least one year of service shall be entitled to a yearly service incentive leave of five days with pay. This provision shall not apply to those who are already enjoying the benefit herein provided, those enjoying vacation leave with pay of at least five days and those employed in establishments regularly employing less than ten employees.',
    supremeCourtDoctrines: [
      'Auto Bus Transport Systems v. Bautista (G.R. No. 156367): The 3-year prescriptive period for money claims on unused commutable SIL starts NOT at the end of each calendar year, but from the moment the employer refuses to pay upon demand or upon separation from employment!',
    ],
    interpretationTips: [
      '"At least 1 year of service" means 12 months, whether continuous or broken, reckoned from hiring date including authorized absences and regular holidays.',
      'Compare: Regular employee SIL (Art. 95) IS commutable to cash if unused; Kasambahay 5-day SIL (R.A. 10361) is NOT cumulative and NOT convertible to cash!',
    ],
    keywords: ['service incentive leave', 'sil', '5 days', 'auto bus', 'commutable'],
  },
  {
    id: 'art-96',
    articleNumber: '96',
    codeLabel: 'Art. 96, Labor Code (as amended by R.A. 11360)',
    title: '100% Service Charges Distributed to Covered Employees',
    worldId: 'world2',
    topicId: 'm2-service-charges',
    statutoryText:
      'All service charges collected by hotels, restaurants and similar establishments shall be distributed completely and equally among the covered workers except managerial employees.',
    supremeCourtDoctrines: [
      'R.A. 11360 Statutory Overhaul (2019): Abolished the old 85%–15% management share split. Management can no longer retain 15% for losses and breakages; 100% goes to rank-and-file and supervisory employees.',
    ],
    interpretationTips: [
      'Managerial employees are strictly EXCLUDED from sharing in service charges; supervisory and rank-and-file employees under direct employment or covered contractors are INCLUDED.',
      'Payout frequency: Completely and equally distributed at least once every two (2) weeks or twice a month.',
    ],
    keywords: ['service charge', '11360', '100%', 'hotels', 'restaurants', 'managerial'],
  },
  {
    id: 'art-100',
    articleNumber: '100',
    codeLabel: 'Art. 100, Labor Code',
    title: 'Prohibition Against Elimination or Diminution of Benefits',
    worldId: 'world3',
    topicId: 'm3-wage-principles',
    statutoryText:
      'Nothing in this Book shall be construed to eliminate or in any way diminish supplements, or other employee benefits being enjoyed at the time of promulgation of this Code.',
    supremeCourtDoctrines: [
      'Vergara, Jr. v. Coca-Cola Bottlers Philippines (G.R. No. 176985): Diminution of benefits is unlawful only when 4 requisites concur: (1) grant is Ripened Company Practice over a considerable period; (2) consistent and deliberate; (3) NOT due to error in construing a doubtful question of law; and (4) unilateral withdrawal by employer.',
    ],
    interpretationTips: [
      'Conditional bonuses (e.g., profit-sharing contingent on target net income) do NOT ripen into demandable benefits if the condition fails.',
      'Correction of a good-faith mathematical or doubtful legal error does NOT violate Art. 100.',
    ],
    keywords: ['non-diminution', 'diminution', 'company practice', 'bonus', 'benefits'],
  },
  {
    id: 'art-106',
    articleNumber: '106',
    codeLabel: 'Art. 106–109, Labor Code & DOLE D.O. 174-17',
    title: 'Legitimate Job Contracting vs. Prohibited Labor-Only Contracting',
    worldId: 'world3',
    topicId: 'm3-payment-contracting-distortion',
    statutoryText:
      'There is "labor-only" contracting where the person supplying workers to an employer does not have substantial capital or investment in the form of tools, equipment, machineries, work premises, among others, and the workers recruited and placed by such person are performing activities which are directly related to the principal business of such employer. In such cases, the person or intermediary shall be considered merely as an agent of the employer who shall be responsible to the workers in the same manner and extent as if the latter were directly employed by him.',
    supremeCourtDoctrines: [
      'Alilin v. Petron Corporation (G.R. No. 177592): A contractor is presumed to be a labor-only contractor unless the principal/contractor proves substantial capital AND independent control over means and methods.',
      'DOLE D.O. 174-17 Capital Benchmark: Substantial capital requires paid-up capital stock/shares or net worth of at least Five Million Pesos (₱5,000,000.00).',
    ],
    interpretationTips: [
      'Distinguish liability: In Legitimate Contracting, the principal is solidarily liable ONLY for unpaid wages/labor standards; in Labor-Only Contracting, the principal becomes the DIRECT EMPLOYER for all purposes including illegal dismissal and regularization!',
    ],
    keywords: ['contracting', 'labor-only', 'do 174', '174', '5 million', 'solidary', 'principal'],
  },
  {
    id: 'art-113',
    articleNumber: '113',
    codeLabel: 'Art. 113–116, Labor Code',
    title: 'Authorized Wage Deductions & Deposit Restrictions',
    worldId: 'world3',
    topicId: 'm3-payment-contracting-distortion',
    statutoryText:
      'No employer, in his own behalf or in behalf of any person, shall make any deduction from the wages of his employees, except: (a) Insurance premiums with employee consent; (b) Union dues where right of check-off is recognized; and (c) Cases where the employer is authorized by law or regulations issued by the Secretary of Labor.',
    supremeCourtDoctrines: [
      'Nina Jewelry Manufacturing of Metal Arts v. Montecillo (G.R. No. 188169): Deductions for loss or breakage are illegal unless employer proves: (1) employee is clearly shown responsible; (2) due process/opportunity to be heard; (3) deduction is fair and reasonable; and (4) does NOT exceed 20% of the employee’s weekly wage.',
    ],
    interpretationTips: [
      'Individual written authorization is required for third-party payments, provided the employer receives NO pecuniary benefit directly or indirectly.',
      'Withholding wages through force, stealth, intimidation, or kickbacks is unlawful under Art. 116.',
    ],
    keywords: ['deductions', 'wage deduction', 'loss', 'breakage', '20%', 'check-off'],
  },
  {
    id: 'art-124',
    articleNumber: '124',
    codeLabel: 'Art. 124, Labor Code (R.A. 6727)',
    title: 'Standards/Criteria for Minimum Wage Fixing & Wage Distortion',
    worldId: 'world3',
    topicId: 'm3-payment-contracting-distortion',
    statutoryText:
      'A wage distortion shall mean a situation where an increase in prescribed wage rates results in the elimination or severe contraction of intentional quantitative differences in wage or salary rates between and among employee groups in an establishment as to effectively obliterate the distinctions embodied in such wage structure based on skills, length of service, or other logical bases of differentiation.',
    supremeCourtDoctrines: [
      'Prubankers Association v. Prudential Bank & Trust Co. (G.R. No. 131247): Wage distortion is region-specific; disparity in wages between employees in different regions resulting from regional RTWPB wage orders does NOT constitute actionable wage distortion.',
      'Metropolitan Bank & Trust Co. Employees Union v. NLRC (Pineda Formula): Minimum Wage / Actual Salary × Prescribed Increase = Distortion Adjustment.',
    ],
    interpretationTips: [
      'Dispute procedure: Organized establishment -> Grievance Machinery then Voluntary Arbitration; Unorganized establishment -> NCMB conciliation then NLRC compulsory arbitration.',
      'Wage distortion is NEVER a valid ground for a strike or lockout.',
    ],
    keywords: ['wage distortion', 'prubankers', 'pineda', 'rtwpb', 'minimum wage'],
  },
  {
    id: 'art-297',
    articleNumber: '297',
    codeLabel: 'Art. 297 [formerly Art. 282], Labor Code',
    title: 'Termination by Employer — Just Causes',
    worldId: 'world5',
    statutoryText:
      'An employer may terminate an employment for any of the following causes: (a) Serious misconduct or willful disobedience; (b) Gross and habitual neglect of duties; (c) Fraud or willful breach of trust; (d) Commission of a crime or offense by the employee against the person of his employer or immediate family/representative; and (e) Other analogous causes.',
    supremeCourtDoctrines: [
      'King of Kings Transport v. Mamac (G.R. No. 166208): Procedural due process for Just Causes requires Twin Notices (1st Notice to Explain granting at least 5 calendar days to submit written explanation + administrative hearing/opportunity to be heard + 2nd Notice of Decision).',
      'Agabon v. NLRC (G.R. No. 158693): If dismissal is for a valid Just Cause but lacks Twin-Notice procedural due process, dismissal remains valid, but employer pays ₱30,000 nominal damages.',
    ],
    interpretationTips: [
      'Neglect of duty must generally be BOTH gross AND habitual (except where a single act causes massive loss).',
      'Just cause dismissal carries NO statutory separation pay.',
    ],
    keywords: ['just cause', '282', 'serious misconduct', 'twin notice', '5 calendar days', 'agabon'],
  },
  {
    id: 'art-298',
    articleNumber: '298',
    codeLabel: 'Art. 298–299 [formerly Art. 283–284], Labor Code',
    title: 'Authorized Causes & Disease Termination (30-Day DOLE + Worker Notice)',
    worldId: 'world5',
    statutoryText:
      'The employer may also terminate the employment of any employee due to the installation of labor-saving devices, redundancy, retrenchment to prevent losses or the closing or cessation of operation of the establishment or undertaking by serving a written notice on the workers and the DOLE at least one (1) month before the intended date thereof.',
    supremeCourtDoctrines: [
      'Jaka Food Processing Corp. v. Pacot (G.R. No. 151378): Valid Authorized Cause lacking 30-day advance written notice to employee and DOLE results in ₱50,000 nominal damages (higher than Agabon’s ₱30,000).',
    ],
    interpretationTips: [
      'Separation Pay Rates: Labor-Saving Devices or Redundancy = 1 month pay OR 1 month per year of service (whichever is higher). Retrenchment, Closure NOT due to serious business losses, or Incurable Disease (Art. 299) = 1 month pay OR 1/2 month per year of service (whichever is higher). A fraction of at least 6 months counts as 1 whole year!',
      'Closure DUE TO serious business losses = ZERO separation pay (employer must prove losses via audited financial statements).',
    ],
    keywords: ['authorized cause', '283', '284', 'redundancy', 'retrenchment', 'separation pay', 'jaka', 'disease'],
  },
  {
    id: 'art-302',
    articleNumber: '302',
    codeLabel: 'Art. 302 [formerly Art. 287], Labor Code (R.A. 7641)',
    title: 'Retirement Pay (22.5 Days Per Year of Service)',
    worldId: 'world5',
    statutoryText:
      'In the absence of a retirement plan or agreement providing for retirement benefits of employees in the establishment, an employee upon reaching the age of sixty (60) years or more, but not beyond sixty-five (65) years which is hereby declared the compulsory retirement age, who has served at least five (5) years in the said establishment, may retire and shall be entitled to retirement pay equivalent to at least one-half (1/2) month salary for every year of service.',
    supremeCourtDoctrines: [
      'Elegir v. Philippine Airlines (G.R. No. 181995): Statutory "one-half month salary" under R.A. 7641 strictly equals 22.5 days (15 days + 5 days SIL + 2.5 days [1/12 of 13th month pay]) unless the company plan yields a higher benefit.',
    ],
    interpretationTips: [
      'General retirement ages: 60 (optional) and 65 (compulsory) + minimum 5 years of service.',
      'Underground & surface mine workers (R.A. 8558 / R.A. 10757): 50 (optional) and 60 (compulsory).',
      'Exemptions from R.A. 7641: Retail, service, and agricultural establishments regularly employing NOT MORE THAN TEN (<= 10) employees.',
    ],
    keywords: ['retirement', '287', '7641', '22.5 days', '60', '65', 'mine workers'],
  },
  {
    id: 'art-306',
    articleNumber: '306',
    codeLabel: 'Art. 305–306 [formerly Art. 290–291], Labor Code & Civil Code Art. 1146',
    title: 'Prescriptive Periods (1 Year ULP • 3 Years Money Claims • 4 Years Illegal Dismissal)',
    worldId: 'world5',
    statutoryText:
      'All money claims arising from employer-employee relations accruing during the effectivity of this Code shall be filed within three (3) years from the time the cause of action accrued; otherwise they shall be forever barred. Unfair labor practices shall be filed within one (1) year from accrual.',
    supremeCourtDoctrines: [
      'Callanta v. Carnation Philippines (G.R. No. L-70615): Illegal dismissal is an injury to the employee’s property right in employment under Art. 1146 of the Civil Code and prescribes in FOUR (4) years (not 3 years), even when accompanied by prayer for backwages.',
    ],
    interpretationTips: [
      'Quick Prescription Matrix: ULP = 1 Year | Pure Money Claims = 3 Years | Illegal Dismissal (with backwages) = 4 Years | SSS unremitted contributions = 20 Years.',
    ],
    keywords: ['prescription', 'prescriptive', '291', '3 years', '4 years', '1 year', 'money claims', 'ulp'],
  },
  {
    id: 'pd-851',
    articleNumber: 'PD 851',
    codeLabel: 'Presidential Decree No. 851',
    title: '13th-Month Pay Law (Total Basic Salary Earned ÷ 12)',
    worldId: 'world2',
    topicId: 'm2-13th-month',
    statutoryText:
      'All employers are hereby required to pay all their rank-and-file employees a 13th-month pay not later than December 24 of every year, provided that they have worked for at least one (1) month during a calendar year.',
    supremeCourtDoctrines: [
      'San Miguel Corp. v. Inciong: Overtime pay, night shift differential, holiday/rest-day premiums, and unused leave conversions are EXCLUDED from "basic salary" in computing 13th-month pay unless integrated by CBA/practice.',
    ],
    interpretationTips: [
      'Minimum service: At least ONE (1) month during the calendar year (resigned or terminated workers receive pro-rated 13th-month pay!).',
      'Mandatory payout deadline: On or before December 24.',
    ],
    keywords: ['13th month', 'pd 851', '851', 'december 24', 'basic salary'],
  },
  {
    id: 'ra-11210',
    articleNumber: 'RA 11210',
    codeLabel: 'Republic Act No. 11210',
    title: '105-Day Expanded Maternity Leave Law',
    worldId: 'world6',
    topicId: 'm6-maternity-leave',
    statutoryText:
      'All covered female workers in government and the private sector, including those in the informal economy, regardless of civil status or the legitimacy of her child, shall be granted one hundred five (105) days maternity leave with full pay, with an option to extend for an additional thirty (30) days without pay, and an additional fifteen (15) days with full pay if the female worker qualifies as a solo parent.',
    supremeCourtDoctrines: [
      'Expanded Coverage Rule: Applies to EVERY instance of pregnancy, miscarriage, or emergency termination of pregnancy (60 days full pay), abolishing the old four-delivery cap.',
    ],
    interpretationTips: [
      'Key numbers: 105 days live childbirth | +15 days (= 120 days) if Solo Parent | 60 days miscarriage or ETP | Up to 7 days transferable to child’s father (married or unmarried!) or alternate caregiver.',
      'Private-sector employers must pay the SALARY DIFFERENTIAL between full pay and SSS maternity benefit (subject to narrow DOLE exemptions).',
    ],
    keywords: ['maternity', '11210', '105 days', '120 days', '60 days', 'miscarriage', '7 days'],
  },
  {
    id: 'ra-10361',
    articleNumber: 'RA 10361',
    codeLabel: 'Republic Act No. 10361',
    title: 'Batas Kasambahay (Domestic Workers Act)',
    worldId: 'world4',
    topicId: 'm4-minors-kasambahay-homework',
    statutoryText:
      'Domestic workers (general househelp, yaya, cook, gardener, laundry person) performing regular domestic work in an occupational household are entitled to minimum wage, 8-hour daily aggregate rest, 24-hour weekly rest, 13th-month pay, SSS/PhilHealth/Pag-IBIG coverage (employer-paid if wage < ₱5,000), and 5-day annual SIL.',
    supremeCourtDoctrines: [
      'Atienza v. Saluta (G.R. No. 233413): A personal/family driver is NOT covered by R.A. 10361 (which repealed Civil Code/Labor Code househelper provisions only as to enumerated kasambahay roles) and is governed by the Civil Code.',
    ],
    interpretationTips: [
      'Family drivers are EXCLUDED from R.A. 10361.',
      'Kasambahay 5-day SIL after 1 year of service is NON-CUMULATIVE and NON-CONVERTIBLE to cash (opposite of Art. 95 regular employees!).',
    ],
    keywords: ['kasambahay', '10361', 'domestic worker', 'family driver', '5000'],
  },
  {
    id: 'ra-11313',
    articleNumber: 'RA 11313',
    codeLabel: 'Republic Act No. 11313',
    title: 'Safe Spaces Act (Bawal Bastos Law) vs. R.A. 7877',
    worldId: 'world5',
    topicId: 'm5-harassment-safe-spaces',
    statutoryText:
      'Gender-based sexual harassment in workplaces includes unwelcome sexual actions, remarks, or online conduct whether between peers, by a superior, or by a subordinate toward a superior. Employers must establish an independent Committee on Decorum and Investigation (CODI).',
    supremeCourtDoctrines: [
      'Peer & Subordinate Liability Doctrine: Unlike R.A. 7877 (which required authority, influence, or moral ascendancy), R.A. 11313 penalizes peer-to-peer and subordinate-to-superior workplace harassment as well as online harassment.',
    ],
    interpretationTips: [
      'CODI must investigate and resolve complaints within ten (10) working days or period prescribed by IRR; employer failure to establish CODI incurs direct statutory fines.',
    ],
    keywords: ['safe spaces', '11313', '7877', 'sexual harassment', 'codi', 'peer'],
  },
];

export function lookupStatutesByQuery(
  query: string,
  allTopics: readonly {
    id: string;
    title: string;
    badge: string;
    worldId: string;
    summary: string;
    verbatimProvision?: string;
    keyDoctrines?: string[];
    barTips?: string[];
    keyTips?: string[];
  }[] = []
): StatuteLookupEntry[] {
  const raw = query.trim();
  if (!raw) {
    return [...STATUTE_LOOKUP_CATALOG];
  }

  const normalized = raw
    .toLowerCase()
    .replace(/^(article|art\.?|republic act|r\.?a\.?|p\.?d\.?|d\.?o\.?)\s*/i, '')
    .trim();
  const qLower = raw.toLowerCase();

  const scored: { entry: StatuteLookupEntry; score: number }[] = [];

  for (const item of STATUTE_LOOKUP_CATALOG) {
    const artNorm = item.articleNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
    const queryAlphaNum = normalized.replace(/[^a-z0-9]/g, '');
    let score = 0;

    if (item.articleNumber.toLowerCase() === normalized || artNorm === queryAlphaNum) {
      score += 100;
    } else if (
      queryAlphaNum.length > 0 &&
      (item.codeLabel.toLowerCase().includes(normalized) || artNorm.includes(queryAlphaNum))
    ) {
      score += 70;
    }

    if (item.title.toLowerCase().includes(qLower)) score += 45;
    if (item.keywords.some((kw) => kw.toLowerCase().includes(qLower) || qLower.includes(kw.toLowerCase()))) {
      score += 35;
    }
    if (item.statutoryText.toLowerCase().includes(qLower)) score += 15;
    if (item.supremeCourtDoctrines.some((d) => d.toLowerCase().includes(qLower))) score += 20;

    if (score > 0) {
      scored.push({ entry: item, score });
    }
  }

  // Fallback synthesis from ALL_LAW_TOPICS if query matches a topic not in curated catalog
  if (scored.length === 0 && allTopics.length > 0) {
    for (const topic of allTopics) {
      const hay = `${topic.badge} ${topic.title} ${topic.summary} ${topic.verbatimProvision || ''}`.toLowerCase();
      if (hay.includes(qLower) || (normalized && hay.includes(normalized))) {
        scored.push({
          score: 25,
          entry: {
            id: `topic-${topic.id}`,
            articleNumber: topic.badge,
            codeLabel: topic.badge,
            title: topic.title,
            worldId: topic.worldId,
            topicId: topic.id,
            statutoryText: topic.verbatimProvision || topic.summary,
            supremeCourtDoctrines: (topic.keyDoctrines || []).slice(0, 3),
            interpretationTips: (topic.barTips || topic.keyTips || []).slice(0, 3),
            keywords: [topic.badge, topic.title],
          },
        });
      }
    }
  }

  return scored.sort((a, b) => b.score - a.score).map((s) => s.entry);
}

export function appendQuickTextToStudyNotes(
  storage: SimpleStorage | null | undefined,
  title: string,
  content: string,
  worldTag: string = 'all'
): StudyNoteItem[] {
  const existing = loadStudyNotes(storage);
  const updated = createStudyNote(existing, {
    title,
    content,
    worldTag,
    categoryTag: 'Bar Exam Review',
  });
  saveStudyNotes(updated, storage);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mario-study-notes-updated'));
  }
  return updated;
}


