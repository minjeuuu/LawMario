import { Flashcard, LawTopic, MarioAvatar } from '../types/laborLaw';
import { QuizQuestion } from '../data/quizQuestionsData';
import { DailyPomodoroRecord, QuizHistoryRecord, formatDateKey } from './profileAchievements';
import { SimpleStorage } from './round8Features';

// ============================================================================
// 1. TOPIC SUB-SECTION MASTERY & EXPERIENCE BAR
// ============================================================================

export const TOPIC_MASTERED_SECTIONS_KEY = 'mario_topic_mastered_sections_v1';

export interface TopicSectionDescriptor {
  key: string;
  label: string;
  category: 'doctrine' | 'rule' | 'exception' | 'tips';
}

export type TopicMasteredSectionsMap = Record<string, string[]>;

export interface TopicSectionProgress {
  completedSections: number;
  totalSections: number;
  ratio: number;
  percent: number;
  remainingSections: number;
  masteredKeys: string[];
}

export function getTopicSubSectionDescriptors(topic: LawTopic): TopicSectionDescriptor[] {
  const sections: TopicSectionDescriptor[] = [];

  if (topic.keyDoctrines && topic.keyDoctrines.length > 0) {
    sections.push({
      key: 'doctrines',
      label: 'Core Doctrines',
      category: 'doctrine',
    });
  }

  topic.rules.forEach((rule, idx) => {
    sections.push({
      key: `rule_${idx}`,
      label: rule.heading || `Rule Section ${idx + 1}`,
      category: 'rule',
    });
  });

  if (topic.exceptions && topic.exceptions.length > 0) {
    sections.push({
      key: 'exceptions',
      label: 'Statutory Exceptions',
      category: 'exception',
    });
  }

  if ((topic.barTips && topic.barTips.length > 0) || (topic.keyTips && topic.keyTips.length > 0)) {
    sections.push({
      key: 'bar_tips',
      label: 'Bar Exam Tips',
      category: 'tips',
    });
  }

  if (sections.length === 0) {
    sections.push({
      key: 'overview',
      label: 'Overview',
      category: 'rule',
    });
  }

  return sections;
}

export function loadTopicMasteredSectionsMap(
  storage?: SimpleStorage | null
): TopicMasteredSectionsMap {
  if (!storage) return {};
  try {
    const raw = storage.getItem(TOPIC_MASTERED_SECTIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: TopicMasteredSectionsMap = {};
    for (const [topicId, arr] of Object.entries(parsed)) {
      if (Array.isArray(arr)) {
        out[topicId] = Array.from(
          new Set(arr.filter((v): v is string => typeof v === 'string' && v.length > 0))
        );
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function saveTopicMasteredSectionsMap(
  map: TopicMasteredSectionsMap,
  storage?: SimpleStorage | null
): void {
  if (!storage) return;
  try {
    storage.setItem(TOPIC_MASTERED_SECTIONS_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

export function toggleTopicSectionMastered(
  prevMap: TopicMasteredSectionsMap,
  topicId: string,
  sectionKey: string
): { nextMap: TopicMasteredSectionsMap; isNowMastered: boolean } {
  const existing = prevMap[topicId] || [];
  const exists = existing.includes(sectionKey);
  const nextKeys = exists
    ? existing.filter((k) => k !== sectionKey)
    : [...existing, sectionKey];
  return {
    nextMap: {
      ...prevMap,
      [topicId]: nextKeys,
    },
    isNowMastered: !exists,
  };
}

export function computeTopicSectionProgress(
  topic: LawTopic,
  masteredMap: TopicMasteredSectionsMap,
  isTopicCompleted: boolean
): TopicSectionProgress {
  const descriptors = getTopicSubSectionDescriptors(topic);
  const totalSections = Math.max(1, descriptors.length);
  const validKeys = new Set(descriptors.map((d) => d.key));
  const rawMastered = (masteredMap[topic.id] || []).filter((k) => validKeys.has(k));

  if (isTopicCompleted) {
    return {
      completedSections: totalSections,
      totalSections,
      ratio: 1,
      percent: 100,
      remainingSections: 0,
      masteredKeys: descriptors.map((d) => d.key),
    };
  }

  const completedSections = Math.min(totalSections, rawMastered.length);
  const ratio = completedSections / totalSections;
  const percent = Math.round(ratio * 100);

  return {
    completedSections,
    totalSections,
    ratio,
    percent,
    remainingSections: Math.max(0, totalSections - completedSections),
    masteredKeys: rawMastered,
  };
}

// ============================================================================
// 2. 'QUICK STUDY' RULE-ITEM BOOKMARKING FOR MAP TAB QUICK REVIEW
// ============================================================================

export const PINNED_RULE_ITEMS_STORAGE_KEY = 'mario_pinned_rule_items_v1';

export interface PinnedRuleBookmark {
  id: string;
  topicId: string;
  topicTitle: string;
  topicBadge: string;
  worldId: string;
  ruleHeading: string;
  itemText: string;
  pinnedAt: string;
}

export function makeRuleItemBookmarkId(
  topicId: string,
  ruleIndex: number,
  itemIndex: number
): string {
  return `${topicId}::r${ruleIndex}::i${itemIndex}`;
}

export function loadPinnedRuleBookmarks(
  storage?: SimpleStorage | null
): PinnedRuleBookmark[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(PINNED_RULE_ITEMS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PinnedRuleBookmark =>
        Boolean(item) &&
        typeof item.id === 'string' &&
        typeof item.topicId === 'string' &&
        typeof item.itemText === 'string'
    );
  } catch {
    return [];
  }
}

export function savePinnedRuleBookmarks(
  items: readonly PinnedRuleBookmark[],
  storage?: SimpleStorage | null
): void {
  if (!storage) return;
  try {
    storage.setItem(PINNED_RULE_ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
}

export function togglePinnedRuleBookmark(
  prevItems: readonly PinnedRuleBookmark[],
  candidate: Omit<PinnedRuleBookmark, 'pinnedAt'>,
  now: Date = new Date()
): { nextItems: PinnedRuleBookmark[]; pinned: boolean } {
  const exists = prevItems.some((item) => item.id === candidate.id);
  if (exists) {
    return {
      nextItems: prevItems.filter((item) => item.id !== candidate.id),
      pinned: false,
    };
  }
  const entry: PinnedRuleBookmark = {
    ...candidate,
    pinnedAt: now.toISOString(),
  };
  return {
    nextItems: [entry, ...prevItems].slice(0, 40),
    pinned: true,
  };
}

// ============================================================================
// 3. TOPIC CARD DEDICATED FLASHCARD DECK & 3-QUESTION QUICK QUIZ GENERATOR
// ============================================================================

export interface TopicMiniQuizQuestion {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  legalBasis: string;
  explanation: string;
}

export const QUICK_QUIZ_LOG_STORAGE_KEY = 'mario_quick_quiz_log_v1';
export const MAX_QUICK_QUIZ_LOG_ENTRIES = 15;

export interface QuickQuizLogEntry {
  id: string;
  timestampIso: string;
  formattedDate: string;
  topicId: string;
  topicTitle: string;
  topicBadge: string;
  worldId: string;
  score: number;
  totalQuestions: number;
  percent: number;
  durationSeconds: number;
  missedPoints: string[];
}

export function loadQuickQuizLog(storage?: SimpleStorage | null): QuickQuizLogEntry[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(QUICK_QUIZ_LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is QuickQuizLogEntry =>
          Boolean(e) && typeof e.id === 'string' && typeof e.topicId === 'string'
      )
      .slice(0, MAX_QUICK_QUIZ_LOG_ENTRIES);
  } catch {
    return [];
  }
}

export function saveQuickQuizLog(
  entries: readonly QuickQuizLogEntry[],
  storage?: SimpleStorage | null
): void {
  if (!storage) return;
  try {
    storage.setItem(
      QUICK_QUIZ_LOG_STORAGE_KEY,
      JSON.stringify(entries.slice(0, MAX_QUICK_QUIZ_LOG_ENTRIES))
    );
  } catch {
    // ignore
  }
}

export function recordQuickQuizLogEntry(
  prevEntries: readonly QuickQuizLogEntry[],
  input: {
    topicId: string;
    topicTitle: string;
    topicBadge: string;
    worldId: string;
    score: number;
    totalQuestions: number;
    durationSeconds: number;
    missedPoints: readonly string[];
  },
  now: Date = new Date()
): QuickQuizLogEntry[] {
  const safeTotal = Math.max(1, Math.floor(input.totalQuestions));
  const safeScore = Math.max(0, Math.min(safeTotal, Math.floor(input.score)));
  const percent = Math.round((safeScore / safeTotal) * 100);
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const entry: QuickQuizLogEntry = {
    id: `qq-${now.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
    timestampIso: now.toISOString(),
    formattedDate,
    topicId: input.topicId,
    topicTitle: input.topicTitle,
    topicBadge: input.topicBadge,
    worldId: input.worldId,
    score: safeScore,
    totalQuestions: safeTotal,
    percent,
    durationSeconds: Math.max(1, Math.round(input.durationSeconds)),
    missedPoints: Array.from(new Set(input.missedPoints)).slice(0, 5),
  };

  return [entry, ...prevEntries].slice(0, MAX_QUICK_QUIZ_LOG_ENTRIES);
}

function shuffleArrayWithRng<T>(arr: readonly T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shuffleQuizOptions(
  options: readonly string[],
  correctIdx: number,
  rng: () => number
): { options: [string, string, string, string]; correctIndex: number } {
  const tagged = options.slice(0, 4).map((text, idx) => ({
    text,
    isCorrect: idx === correctIdx,
  }));
  while (tagged.length < 4) {
    tagged.push({
      text: 'Subject exclusively to tripartite Regional Wage Board mediation prior to DOLE enforcement.',
      isCorrect: false,
    });
  }
  const shuffled = shuffleArrayWithRng(tagged, rng);
  const foundIdx = Math.max(
    0,
    shuffled.findIndex((item) => item.isCorrect)
  );
  return {
    options: [
      shuffled[0].text,
      shuffled[1].text,
      shuffled[2].text,
      shuffled[3].text,
    ],
    correctIndex: foundIdx,
  };
}

export function generateTopicQuickQuiz(params: {
  topic: LawTopic;
  questionPool: readonly QuizQuestion[];
  allTopics: readonly LawTopic[];
  rng?: () => number;
}): TopicMiniQuizQuestion[] {
  const { topic, questionPool, allTopics, rng = Math.random } = params;
  const worldMap: Record<string, string> = {
    world1: 'w1',
    world2: 'w2',
    world3: 'w3',
    world4: 'w4',
    world5: 'w5',
    world6: 'w6',
    holidays: 'holidays',
  };
  const targetWorldCode = worldMap[topic.worldId] || 'w1';
  const badgeTokens = (topic.badge.toLowerCase().match(/\b\d{2,5}\b/g) || []);
  const titleWords = topic.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !['work', 'labor', 'rules', 'rule', 'under', 'with'].includes(w));

  const scoredPool = questionPool
    .map((q) => {
      const hay = `${q.scenario} ${q.legalBasis} ${q.explanation}`.toLowerCase();
      let score = 0;
      if (q.worldCode === targetWorldCode) score += 2;
      for (const num of badgeTokens) {
        if (hay.includes(num)) score += 5;
      }
      for (const w of titleWords) {
        if (hay.includes(w)) score += 2;
      }
      return { q, score };
    })
    .filter((item) => item.score >= 4)
    .sort((a, b) => b.score - a.score);

  const selectedQuestions: TopicMiniQuizQuestion[] = [];
  const shuffledMatches = shuffleArrayWithRng(scoredPool.slice(0, 8), rng);

  for (const match of shuffledMatches) {
    if (selectedQuestions.length >= 3) break;
    const { q } = match;
    const shuf = shuffleQuizOptions(q.options, q.correctIndex, rng);
    selectedQuestions.push({
      id: `${topic.id}-pool-${q.id}`,
      prompt: q.scenario,
      options: shuf.options,
      correctIndex: shuf.correctIndex,
      legalBasis: q.legalBasis,
      explanation: q.explanation,
    });
  }

  // Synthesize topic-specific questions from topic doctrines/rules if pool had < 3 exact matches
  const otherTopics = allTopics.filter((t) => t.id !== topic.id);
  const distractorDoctrines = otherTopics
    .flatMap((t) => t.keyDoctrines.slice(0, 1))
    .filter((d) => d.length > 20);
  const distractorSummaries = otherTopics
    .map((t) => t.summary)
    .filter((s) => s.length > 20);

  if (selectedQuestions.length < 3 && topic.keyDoctrines.length > 0) {
    const correctDoctrine = topic.keyDoctrines[0];
    const pickedDistractors = shuffleArrayWithRng(
      distractorDoctrines.length >= 3 ? distractorDoctrines : distractorSummaries,
      rng
    ).slice(0, 3);
    const shuf = shuffleQuizOptions([correctDoctrine, ...pickedDistractors], 0, rng);
    selectedQuestions.push({
      id: `${topic.id}-synth-doctrine`,
      prompt: `Under ${topic.badge} (${topic.title}), which controlling statutory or Supreme Court doctrine governs?`,
      options: shuf.options,
      correctIndex: shuf.correctIndex,
      legalBasis: `${topic.badge} — ${topic.title}`,
      explanation: `${correctDoctrine} (${topic.summary})`,
    });
  }

  if (selectedQuestions.length < 3) {
    const firstRuleItem =
      topic.rules.flatMap((r) => r.items || [])[0] ||
      topic.rules[0]?.description ||
      topic.summary;
    const otherRuleItems = shuffleArrayWithRng(
      otherTopics.flatMap((t) => t.rules.flatMap((r) => (r.items || []).slice(0, 1))),
      rng
    ).slice(0, 3);
    const shuf = shuffleQuizOptions([firstRuleItem, ...otherRuleItems], 0, rng);
    selectedQuestions.push({
      id: `${topic.id}-synth-rule`,
      prompt: `Which of the following is an accurate statutory rule under ${topic.title} (${topic.badge})?`,
      options: shuf.options,
      correctIndex: shuf.correctIndex,
      legalBasis: `${topic.badge} — ${topic.rules[0]?.heading || topic.title}`,
      explanation: firstRuleItem,
    });
  }

  if (selectedQuestions.length < 3) {
    const tipOrTakeaway =
      topic.barTips?.[0] || topic.practicalTakeaway || topic.beginnerSummary || topic.summary;
    const otherTakeaways = shuffleArrayWithRng(
      otherTopics.map((t) => t.barTips?.[0] || t.summary).filter(Boolean),
      rng
    ).slice(0, 3);
    const shuf = shuffleQuizOptions([tipOrTakeaway, ...otherTakeaways], 0, rng);
    selectedQuestions.push({
      id: `${topic.id}-synth-bar-tip`,
      prompt: `When answering a Bar Exam problem involving ${topic.title} (${topic.badge}), what key rule or takeaway must be applied?`,
      options: shuf.options,
      correctIndex: shuf.correctIndex,
      legalBasis: topic.badge,
      explanation: tipOrTakeaway,
    });
  }

  return selectedQuestions.slice(0, 3);
}

export function buildTopicFlashcards(
  topic: LawTopic,
  allFlashcards: readonly Flashcard[]
): Flashcard[] {
  const badgeNums = topic.badge.toLowerCase().match(/\b\d{2,5}\b/g) || [];
  const worldNumMatch = /world(\d)/.exec(topic.worldId);
  const worldNum = worldNumMatch ? Number(worldNumMatch[1]) : 1;

  const matched = allFlashcards.filter((fc) => {
    const hay = `${fc.question} ${fc.answer} ${fc.keyTakeaway}`.toLowerCase();
    if (badgeNums.some((n) => hay.includes(n))) return true;
    const titleLower = topic.title.toLowerCase();
    if (hay.includes(titleLower)) return true;
    return false;
  });

  const synthesized: Flashcard[] = [];

  synthesized.push({
    id: `${topic.id}_fc_summary`,
    world: topic.badge,
    worldNum,
    question: `What is the core statutory scope and rule under ${topic.title} (${topic.badge})?`,
    answer: topic.summary,
    keyTakeaway: topic.practicalTakeaway || topic.beginnerSummary || topic.badge,
    difficulty: 'Easy',
  });

  topic.keyDoctrines.forEach((doc, idx) => {
    synthesized.push({
      id: `${topic.id}_fc_doc_${idx}`,
      world: topic.badge,
      worldNum,
      question: `${topic.title} (${topic.badge}) — Key Doctrine #${idx + 1}: Explain the controlling legal rule.`,
      answer: doc,
      keyTakeaway: topic.barTips?.[idx] || topic.badge,
      difficulty: 'Medium',
    });
  });

  topic.rules.forEach((rule, idx) => {
    const body =
      rule.items && rule.items.length > 0
        ? rule.items.slice(0, 3).join(' • ')
        : rule.description || topic.summary;
    synthesized.push({
      id: `${topic.id}_fc_rule_${idx}`,
      world: topic.badge,
      worldNum,
      question: `Under ${topic.title}, what are the statutory rules for "${rule.heading}"?`,
      answer: body,
      keyTakeaway: `${topic.badge} — ${rule.heading}`,
      difficulty: 'Medium',
    });
  });

  if (topic.exceptions && topic.exceptions.length > 0) {
    const ex = topic.exceptions[0];
    synthesized.push({
      id: `${topic.id}_fc_exc_0`,
      world: topic.badge,
      worldNum,
      question: `State the General Rule and Exceptions under ${topic.title} (${topic.badge}).`,
      answer: `General Rule: ${ex.generalRule} | Exceptions: ${ex.exceptions.join('; ')}`,
      keyTakeaway: ex.exceptionToException?.[0] || 'Watch out for statutory exceptions in Bar problems!',
      difficulty: 'Hard',
    });
  }

  const combined = [...matched, ...synthesized];
  const seen = new Set<string>();
  return combined.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

// ============================================================================
// 4. DAILY STUDY GOAL STREAK & 7-DAY WEEKLY CONSISTENCY TRACKER (NAVBAR)
// ============================================================================

export interface GoalStreakAndWeeklyConsistency {
  goalStreakDays: number;
  goalMetToday: boolean;
  todayMinutes: number;
  dailyGoalMinutes: number;
  weeklyStudiedMinutes: number;
  weeklyTargetMinutes: number;
  weeklyConsistencyPercent: number;
  daysMetInLast7: number;
}

export function computeGoalStreakAndWeeklyConsistency(params: {
  dailyPomodoroLogs?: Record<string, DailyPomodoroRecord>;
  dailyGoalMinutes: number;
  todayStudiedSeconds: number;
  now?: Date;
}): GoalStreakAndWeeklyConsistency {
  const {
    dailyPomodoroLogs = {},
    dailyGoalMinutes,
    todayStudiedSeconds,
    now = new Date(),
  } = params;

  const targetMin = Math.max(5, Math.round(dailyGoalMinutes || 30));
  const todayKey = formatDateKey(now);
  const loggedTodayMin = dailyPomodoroLogs[todayKey]?.minutes || 0;
  const todayMinutes = Math.max(loggedTodayMin, Math.floor(Math.max(0, todayStudiedSeconds) / 60));

  const getMinutesForDate = (d: Date): number => {
    const key = formatDateKey(d);
    if (key === todayKey) return todayMinutes;
    const rec = dailyPomodoroLogs[key];
    if (!rec) return 0;
    const fromActive = rec.activeSeconds ? Math.floor(rec.activeSeconds / 60) : 0;
    return Math.max(rec.minutes || 0, fromActive);
  };

  const goalMetToday = todayMinutes >= targetMin;

  // Consecutive days meeting daily goal
  let goalStreakDays = 0;
  const startOffset = goalMetToday ? 0 : 1;
  for (let offset = startOffset; offset < 365; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    if (getMinutesForDate(d) >= targetMin) {
      goalStreakDays += 1;
    } else {
      break;
    }
  }

  // Last 7 days consistency
  let weeklyStudiedMinutes = 0;
  let daysMetInLast7 = 0;
  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const mins = getMinutesForDate(d);
    weeklyStudiedMinutes += mins;
    if (mins >= targetMin) {
      daysMetInLast7 += 1;
    }
  }

  const weeklyTargetMinutes = targetMin * 7;
  const weeklyConsistencyPercent = Math.min(
    100,
    Math.round((weeklyStudiedMinutes / Math.max(1, weeklyTargetMinutes)) * 100)
  );

  return {
    goalStreakDays,
    goalMetToday,
    todayMinutes,
    dailyGoalMinutes: targetMin,
    weeklyStudiedMinutes,
    weeklyTargetMinutes,
    weeklyConsistencyPercent,
    daysMetInLast7,
  };
}

// ============================================================================
// 5. 30-DAY RECHARTS SERIES (STUDY INTENSITY, COMPLETION SPARKLINE, COIN VAULT)
// ============================================================================

export const COIN_LEDGER_30D_STORAGE_KEY = 'mario_coin_ledger_30d_v1';

export interface DailyCoinLedgerEntry {
  earned: number;
  spent: number;
}

export type CoinLedgerMap = Record<string, DailyCoinLedgerEntry>;

export interface StudyIntensity30dPoint {
  dateKey: string;
  label: string;
  minutes: number;
  sessions: number;
}

export interface Completion30dPoint {
  dateKey: string;
  label: string;
  completedTopics: number;
}

export interface CoinVault30dPoint {
  dateKey: string;
  label: string;
  dailyEarned: number;
  dailySpent: number;
  totalEarned: number;
  totalSpent: number;
}

export function loadCoinLedger30d(storage?: SimpleStorage | null): CoinLedgerMap {
  if (!storage) return {};
  try {
    const raw = storage.getItem(COIN_LEDGER_30D_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: CoinLedgerMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && v && typeof v === 'object') {
        const entry = v as Partial<DailyCoinLedgerEntry>;
        out[k] = {
          earned: Math.max(0, Math.round(Number(entry.earned) || 0)),
          spent: Math.max(0, Math.round(Number(entry.spent) || 0)),
        };
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function saveCoinLedger30d(
  ledger: CoinLedgerMap,
  storage?: SimpleStorage | null
): void {
  if (!storage) return;
  try {
    storage.setItem(COIN_LEDGER_30D_STORAGE_KEY, JSON.stringify(ledger));
  } catch {
    // ignore
  }
}

export function recordCoinDeltaInLedger(
  prevLedger: CoinLedgerMap,
  delta: number,
  now: Date = new Date()
): CoinLedgerMap {
  if (!Number.isFinite(delta) || delta === 0) return prevLedger;
  const todayKey = formatDateKey(now);
  const existing = prevLedger[todayKey] || { earned: 0, spent: 0 };
  const nextEntry: DailyCoinLedgerEntry =
    delta > 0
      ? { earned: existing.earned + Math.round(delta), spent: existing.spent }
      : { earned: existing.earned, spent: existing.spent + Math.round(Math.abs(delta)) };

  const next: CoinLedgerMap = {
    ...prevLedger,
    [todayKey]: nextEntry,
  };

  const keys = Object.keys(next).sort();
  if (keys.length > 45) {
    for (const oldKey of keys.slice(0, keys.length - 45)) {
      delete next[oldKey];
    }
  }
  return next;
}

export function build30DayStudyIntensitySeries(params: {
  dailyPomodoroLogs?: Record<string, DailyPomodoroRecord>;
  todayStudiedSeconds?: number;
  now?: Date;
}): StudyIntensity30dPoint[] {
  const { dailyPomodoroLogs = {}, todayStudiedSeconds = 0, now = new Date() } = params;
  const todayKey = formatDateKey(now);
  const points: StudyIntensity30dPoint[] = [];

  for (let offset = 29; offset >= 0; offset--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const key = formatDateKey(d);
    const rec = dailyPomodoroLogs[key];
    const recMins = rec
      ? Math.max(rec.minutes || 0, rec.activeSeconds ? Math.floor(rec.activeSeconds / 60) : 0)
      : 0;
    const mins =
      key === todayKey
        ? Math.max(recMins, Math.floor(Math.max(0, todayStudiedSeconds) / 60))
        : recMins;
    points.push({
      dateKey: key,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      minutes: mins,
      sessions: rec?.sessions || 0,
    });
  }

  return points;
}

export function build30DayCompletionSparklineSeries(params: {
  history: Record<string, number>;
  currentCompletedCount: number;
  now?: Date;
}): Completion30dPoint[] {
  const { history, currentCompletedCount, now = new Date() } = params;
  const safeCurrent = Math.max(0, Math.floor(currentCompletedCount));
  const todayKey = formatDateKey(now);
  const merged = { ...history, [todayKey]: safeCurrent };

  const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
  const startKey = formatDateKey(startDay);
  const priorKeys = Object.keys(merged)
    .filter((k) => k < startKey)
    .sort();
  let carry = priorKeys.length > 0 ? merged[priorKeys[priorKeys.length - 1]] : 0;

  const points: Completion30dPoint[] = [];
  for (let offset = 29; offset >= 0; offset--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const key = formatDateKey(d);
    if (offset === 0) {
      carry = safeCurrent;
    } else if (Object.prototype.hasOwnProperty.call(merged, key)) {
      carry = merged[key];
    }
    points.push({
      dateKey: key,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      completedTopics: carry,
    });
  }

  return points;
}

export function build30DayCoinVaultSeries(params: {
  ledger: CoinLedgerMap;
  currentCoins: number;
  now?: Date;
}): CoinVault30dPoint[] {
  const { ledger, currentCoins, now = new Date() } = params;
  const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
  const startKey = formatDateKey(startDay);

  let runningEarned = 0;
  let runningSpent = 0;

  for (const [k, entry] of Object.entries(ledger)) {
    if (k < startKey) {
      runningEarned += entry.earned || 0;
      runningSpent += entry.spent || 0;
    }
  }

  // If no ledger transactions recorded yet, seed baseline with current coin balance so the 30d graph reflects actual balance
  const hasAnyTransactions = Object.keys(ledger).length > 0;
  if (!hasAnyTransactions && currentCoins > 0) {
    runningEarned = Math.max(0, Math.round(currentCoins));
  }

  const points: CoinVault30dPoint[] = [];
  for (let offset = 29; offset >= 0; offset--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const key = formatDateKey(d);
    const dayEntry = ledger[key] || { earned: 0, spent: 0 };
    runningEarned += dayEntry.earned;
    runningSpent += dayEntry.spent;

    points.push({
      dateKey: key,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      dailyEarned: dayEntry.earned,
      dailySpent: dayEntry.spent,
      totalEarned: runningEarned,
      totalSpent: runningSpent,
    });
  }

  return points;
}

// ============================================================================
// 6. FLASHCARD MASTERY TIERS (MUSHROOM / FIRE FLOWER / SUPER STAR)
// ============================================================================

export const FLASHCARD_MASTERY_TIERS_KEY = 'mario_flashcard_mastery_tiers_v1';

export type FlashcardMasteryTier = 'learning' | 'reviewing' | 'mastered';

export type FlashcardMasteryMap = Record<string, FlashcardMasteryTier>;

export const FLASHCARD_MASTERY_META: Record<
  FlashcardMasteryTier,
  {
    tier: FlashcardMasteryTier;
    label: string;
    powerupName: string;
    badgeClass: string;
  }
> = {
  learning: {
    tier: 'learning',
    label: 'Learning',
    powerupName: 'Super Mushroom',
    badgeClass: 'bg-red-950/90 text-red-200 border-red-400/70',
  },
  reviewing: {
    tier: 'reviewing',
    label: 'Reviewing',
    powerupName: 'Fire Flower',
    badgeClass: 'bg-amber-950/90 text-amber-200 border-amber-400/80',
  },
  mastered: {
    tier: 'mastered',
    label: 'Mastered',
    powerupName: 'Super Star',
    badgeClass: 'bg-emerald-950/90 text-emerald-200 border-emerald-400/80',
  },
};

export function loadFlashcardMasteryTiers(
  storage?: SimpleStorage | null
): FlashcardMasteryMap {
  if (!storage) return {};
  try {
    const raw = storage.getItem(FLASHCARD_MASTERY_TIERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: FlashcardMasteryMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (v === 'learning' || v === 'reviewing' || v === 'mastered') {
        out[k] = v;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function saveFlashcardMasteryTiers(
  map: FlashcardMasteryMap,
  storage?: SimpleStorage | null
): void {
  if (!storage) return;
  try {
    storage.setItem(FLASHCARD_MASTERY_TIERS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function advanceFlashcardMasteryTier(
  current: FlashcardMasteryTier
): FlashcardMasteryTier {
  if (current === 'learning') return 'reviewing';
  return 'mastered';
}

// ============================================================================
// 7. QUIZ RESULTS ANALYTICS (RECHARTS SKILL BREAKDOWN, BAR MASTER RANK, SUMMARY & LEADERBOARD)
// ============================================================================

export interface QuizSkillBreakdownPoint {
  skillKey: string;
  skillLabel: string;
  shortLabel: string;
  correct: number;
  wrong: number;
  total: number;
  accuracyPercent: number;
}

const SKILL_PILLARS: readonly {
  key: string;
  label: string;
  shortLabel: string;
  worldCodes: readonly string[];
}[] = [
  { key: 'hours_ot', label: 'Hours & Overtime', shortLabel: 'Hours/OT', worldCodes: ['w1', 'world1'] },
  {
    key: 'rest_holidays',
    label: 'Rest & Holidays',
    shortLabel: 'Holidays',
    worldCodes: ['w2', 'world2', 'holidays'],
  },
  {
    key: 'wages_do174',
    label: 'Wages & Contracting',
    shortLabel: 'Wages',
    worldCodes: ['w3', 'world3'],
  },
  {
    key: 'special_groups',
    label: 'Special Workers',
    shortLabel: 'Special',
    worldCodes: ['w4', 'world4'],
  },
  {
    key: 'protective_laws',
    label: 'Protective Statutes',
    shortLabel: 'Protective',
    worldCodes: ['w5', 'world5'],
  },
  {
    key: 'leave_benefits',
    label: 'Statutory Leaves',
    shortLabel: 'Leaves',
    worldCodes: ['w6', 'world6', 'boss'],
  },
];

export function computeQuizSkillBreakdown(
  records: readonly { worldCode: string; isCorrect: boolean }[]
): QuizSkillBreakdownPoint[] {
  const buckets = new Map<string, { correct: number; wrong: number }>();
  for (const pillar of SKILL_PILLARS) {
    buckets.set(pillar.key, { correct: 0, wrong: 0 });
  }

  for (const rec of records) {
    const clean = (rec.worldCode || '').toLowerCase().trim();
    const matched =
      SKILL_PILLARS.find((p) => p.worldCodes.includes(clean)) ||
      SKILL_PILLARS[SKILL_PILLARS.length - 1];
    const prev = buckets.get(matched.key) || { correct: 0, wrong: 0 };
    if (rec.isCorrect) prev.correct += 1;
    else prev.wrong += 1;
    buckets.set(matched.key, prev);
  }

  return SKILL_PILLARS.map((pillar) => {
    const counts = buckets.get(pillar.key) || { correct: 0, wrong: 0 };
    const total = counts.correct + counts.wrong;
    return {
      skillKey: pillar.key,
      skillLabel: pillar.label,
      shortLabel: pillar.shortLabel,
      correct: counts.correct,
      wrong: counts.wrong,
      total,
      accuracyPercent: total > 0 ? Math.round((counts.correct / total) * 100) : 0,
    };
  }).filter((row) => row.total > 0);
}

export interface BarMasterRankInfo {
  totalCorrectAnswers: number;
  currentRankTitle: string;
  nextRankTitle: string | null;
  rankIndex: number;
  totalRanks: number;
  progressPercent: number;
  remainingCorrectToNext: number;
}

const BAR_MASTER_RANKS: readonly { title: string; minCorrect: number }[] = [
  { title: '1L Labor Law Cadet', minCorrect: 0 },
  { title: 'Junior DOLE Counsel', minCorrect: 15 },
  { title: 'NLRC Arbiter Scholar', minCorrect: 40 },
  { title: 'Appellate Labor Advocate', minCorrect: 80 },
  { title: 'Bar Master Jurist', minCorrect: 130 },
  { title: 'Supreme Grand Bar Master', minCorrect: 200 },
];

export function computeBarMasterRankProgress(params: {
  quizHistory?: readonly QuizHistoryRecord[];
  fallbackCurrentCorrect?: number;
}): BarMasterRankInfo {
  const { quizHistory = [], fallbackCurrentCorrect = 0 } = params;
  const historicalSum = quizHistory.reduce(
    (sum, item) => sum + Math.max(0, Math.floor(item.correctCount || 0)),
    0
  );
  const totalCorrectAnswers = Math.max(historicalSum, Math.max(0, Math.floor(fallbackCurrentCorrect)));

  let rankIdx = 0;
  for (let i = 0; i < BAR_MASTER_RANKS.length; i++) {
    if (totalCorrectAnswers >= BAR_MASTER_RANKS[i].minCorrect) {
      rankIdx = i;
    }
  }

  const currentRank = BAR_MASTER_RANKS[rankIdx];
  const nextRank = BAR_MASTER_RANKS[rankIdx + 1] || null;

  if (!nextRank) {
    return {
      totalCorrectAnswers,
      currentRankTitle: currentRank.title,
      nextRankTitle: null,
      rankIndex: rankIdx + 1,
      totalRanks: BAR_MASTER_RANKS.length,
      progressPercent: 100,
      remainingCorrectToNext: 0,
    };
  }

  const span = Math.max(1, nextRank.minCorrect - currentRank.minCorrect);
  const gainedInSpan = Math.max(0, totalCorrectAnswers - currentRank.minCorrect);
  const progressPercent = Math.min(100, Math.round((gainedInSpan / span) * 100));

  return {
    totalCorrectAnswers,
    currentRankTitle: currentRank.title,
    nextRankTitle: nextRank.title,
    rankIndex: rankIdx + 1,
    totalRanks: BAR_MASTER_RANKS.length,
    progressPercent,
    remainingCorrectToNext: Math.max(0, nextRank.minCorrect - totalCorrectAnswers),
  };
}

export interface MissedQuestionBriefInput {
  scenario: string;
  correctOptionText: string;
  legalBasis: string;
  explanation: string;
}

export interface MissedTopicStudySummary {
  headline: string;
  bulletCount: number;
  items: {
    legalBasis: string;
    correctRule: string;
    doctrinalNote: string;
  }[];
  plainTextForNotes: string;
}

export function buildMissedTopicsStudySummary(
  missedQuestions: readonly MissedQuestionBriefInput[]
): MissedTopicStudySummary {
  if (missedQuestions.length === 0) {
    return {
      headline: 'Flawless Run — 100% Doctrinal Accuracy!',
      bulletCount: 0,
      items: [],
      plainTextForNotes:
        'Quick Study Summary: Perfect 100% score! Zero missed statutory doctrines in this run.',
    };
  }

  const items = missedQuestions.map((m) => ({
    legalBasis: m.legalBasis || 'Philippine Labor Code',
    correctRule: m.correctOptionText,
    doctrinalNote: m.explanation,
  }));

  const lines = [
    `Quick Study Summary (${items.length} Missed Doctrine${items.length === 1 ? '' : 's'}):`,
    ...items.map(
      (it, idx) =>
        `${idx + 1}. [${it.legalBasis}] Rule: ${it.correctRule} — Why: ${it.doctrinalNote}`
    ),
  ];

  return {
    headline: `Targeted Review Brief (${items.length} Doctrine${items.length === 1 ? '' : 's'} to Reinforce)`,
    bulletCount: items.length,
    items,
    plainTextForNotes: lines.join('\n\n'),
  };
}

export interface QuizLeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar: MarioAvatar;
  correctAnswers: number;
  quizzesCleared: number;
  accuracyPercent: number;
  cartridgeBadge?: string;
  isCurrentUser?: boolean;
}

export function computeQuizLeaderboardEntries(params: {
  playerName: string;
  equippedAvatar: MarioAvatar;
  quizHistory?: readonly QuizHistoryRecord[];
  equippedCartridgeBadge?: string | null;
}): QuizLeaderboardEntry[] {
  const {
    playerName,
    equippedAvatar,
    quizHistory = [],
    equippedCartridgeBadge = null,
  } = params;

  const userCorrect = quizHistory.reduce((s, r) => s + Math.max(0, r.correctCount || 0), 0);
  const userTotal = quizHistory.reduce((s, r) => s + Math.max(0, r.totalCount || 0), 0);
  const userAccuracy = userTotal > 0 ? Math.round((userCorrect / userTotal) * 100) : 0;

  const rivals: Omit<QuizLeaderboardEntry, 'rank'>[] = [
    {
      id: 'q-rival-rosalina',
      name: 'Justice Rosalina',
      avatar: 'cosmicrosalina',
      correctAnswers: 164,
      quizzesCleared: 18,
      accuracyPercent: 95,
      cartridgeBadge: 'Super Famicom Gold Cart',
    },
    {
      id: 'q-rival-peach',
      name: 'Chancellor Peach',
      avatar: 'drpeach',
      correctAnswers: 138,
      quizzesCleared: 15,
      accuracyPercent: 92,
      cartridgeBadge: 'Royal Peach Pink Cart',
    },
    {
      id: 'q-rival-toad',
      name: 'Atty. Toadsworth',
      avatar: 'lawyertoad',
      correctAnswers: 112,
      quizzesCleared: 13,
      accuracyPercent: 89,
      cartridgeBadge: '1985 NES Classic Cart',
    },
    {
      id: 'q-rival-luigi',
      name: 'Arbiter Luigi',
      avatar: 'iceluigi',
      correctAnswers: 84,
      quizzesCleared: 10,
      accuracyPercent: 86,
      cartridgeBadge: 'Emerald Mansion Cart',
    },
    {
      id: 'q-rival-yoshi',
      name: 'Advocate Yoshi',
      avatar: 'goldenyoshi',
      correctAnswers: 52,
      quizzesCleared: 7,
      accuracyPercent: 83,
    },
    {
      id: 'q-rival-daisy',
      name: 'Counsel Daisy',
      avatar: 'daisy',
      correctAnswers: 24,
      quizzesCleared: 4,
      accuracyPercent: 80,
    },
    {
      id: 'q-user',
      name: (playerName || 'Law Adventurer').trim() || 'Law Adventurer',
      avatar: equippedAvatar,
      correctAnswers: userCorrect,
      quizzesCleared: quizHistory.length,
      accuracyPercent: userAccuracy,
      cartridgeBadge: equippedCartridgeBadge || undefined,
      isCurrentUser: true,
    },
  ];

  return rivals
    .sort((a, b) => {
      if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
      return b.accuracyPercent - a.accuracyPercent;
    })
    .map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));
}

// ============================================================================
// 8. TOAD'S SPECIAL EVENTS & LUXURY GOODS PERSISTENCE
// ============================================================================

export const TOAD_SPECIAL_EVENTS_KEY = 'mario_toad_special_events_v1';
export const LUXURY_EQUIPPED_KEY = 'mario_luxury_equipped_v1';

export interface ToadSpecialEventsState {
  invincibleEndsAt: number; // 5-min Boss Defeat 2x Coin Invincible Study Mode
  doubleXpEndsAt: number; // 1-hour Toad Special Event 2x XP/Coin buff
  unlockAllModulesEndsAt: number; // 30-min Unlock All Locked Modules buff
  bossSkipTokens: number; // One-time Boss Battle Skip tokens
}

export type LuxuryAvatarFrameId =
  | 'lux_frame_none'
  | 'lux_frame_gold_filigree'
  | 'lux_frame_grand_star_platinum'
  | 'lux_frame_sovereign_ruby';

export type LuxuryMushroomAuraId =
  | 'lux_aura_none'
  | 'lux_aura_golden_truffle'
  | 'lux_aura_cosmic_nebula'
  | 'lux_aura_royal_crown_glow';

export type LuxuryCartridgeBadgeId =
  | 'lux_cart_none'
  | 'lux_cart_nes_1985_gold'
  | 'lux_cart_famicom_ruby'
  | 'lux_cart_star_road_holo';

export interface LuxuryEquippedState {
  avatarFrame: LuxuryAvatarFrameId;
  mushroomAura: LuxuryMushroomAuraId;
  cartridgeBadge: LuxuryCartridgeBadgeId;
}

export const LUXURY_CARTRIDGE_LABELS: Record<LuxuryCartridgeBadgeId, string> = {
  lux_cart_none: '',
  lux_cart_nes_1985_gold: '1985 Championship Gold Cart',
  lux_cart_famicom_ruby: 'Famicom Crimson Collector Cart',
  lux_cart_star_road_holo: 'Star Road Holographic Cart',
};

export const DEFAULT_SPECIAL_EVENTS_STATE: ToadSpecialEventsState = {
  invincibleEndsAt: 0,
  doubleXpEndsAt: 0,
  unlockAllModulesEndsAt: 0,
  bossSkipTokens: 0,
};

export const DEFAULT_LUXURY_EQUIPPED_STATE: LuxuryEquippedState = {
  avatarFrame: 'lux_frame_none',
  mushroomAura: 'lux_aura_none',
  cartridgeBadge: 'lux_cart_none',
};

export function loadToadSpecialEventsState(
  storage?: SimpleStorage | null
): ToadSpecialEventsState {
  if (!storage) return { ...DEFAULT_SPECIAL_EVENTS_STATE };
  try {
    const raw = storage.getItem(TOAD_SPECIAL_EVENTS_KEY);
    if (!raw) return { ...DEFAULT_SPECIAL_EVENTS_STATE };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_SPECIAL_EVENTS_STATE };
    return {
      invincibleEndsAt: Math.max(0, Number(parsed.invincibleEndsAt) || 0),
      doubleXpEndsAt: Math.max(0, Number(parsed.doubleXpEndsAt) || 0),
      unlockAllModulesEndsAt: Math.max(0, Number(parsed.unlockAllModulesEndsAt) || 0),
      bossSkipTokens: Math.max(0, Math.floor(Number(parsed.bossSkipTokens) || 0)),
    };
  } catch {
    return { ...DEFAULT_SPECIAL_EVENTS_STATE };
  }
}

export function saveToadSpecialEventsState(
  state: ToadSpecialEventsState,
  storage?: SimpleStorage | null
): void {
  if (!storage) return;
  try {
    storage.setItem(TOAD_SPECIAL_EVENTS_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function loadLuxuryEquippedState(
  storage?: SimpleStorage | null
): LuxuryEquippedState {
  if (!storage) return { ...DEFAULT_LUXURY_EQUIPPED_STATE };
  try {
    const raw = storage.getItem(LUXURY_EQUIPPED_KEY);
    if (!raw) return { ...DEFAULT_LUXURY_EQUIPPED_STATE };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_LUXURY_EQUIPPED_STATE };
    return {
      avatarFrame: (parsed.avatarFrame as LuxuryAvatarFrameId) || 'lux_frame_none',
      mushroomAura: (parsed.mushroomAura as LuxuryMushroomAuraId) || 'lux_aura_none',
      cartridgeBadge: (parsed.cartridgeBadge as LuxuryCartridgeBadgeId) || 'lux_cart_none',
    };
  } catch {
    return { ...DEFAULT_LUXURY_EQUIPPED_STATE };
  }
}

export function saveLuxuryEquippedState(
  state: LuxuryEquippedState,
  storage?: SimpleStorage | null
): void {
  if (!storage) return;
  try {
    storage.setItem(LUXURY_EQUIPPED_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}
