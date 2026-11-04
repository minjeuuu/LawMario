// Pure, deterministic logic & state helpers for Round 11 features (Zero DOM side effects in core reducers)
import { resolveExtendedPrintFont } from './round12Features';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

// ============================================================================
// 1. CALCULATOR MONTHS PARSER (Allows clearing "", typing 1-12 & decimals like 6.5)
// ============================================================================
export interface ParsedMonthsInput {
  rawText: string;
  numericMonths: number;
}

export function parseCalculatorMonthsInput(raw: string): ParsedMonthsInput {
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === '.') {
    return { rawText: raw, numericMonths: 0 };
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { rawText: raw, numericMonths: 0 };
  }
  const clamped = Math.min(12, Math.max(0, parsed));
  return {
    rawText: parsed > 12 ? '12' : raw,
    numericMonths: clamped,
  };
}

export function normalizeCalculatorMonthsOnBlur(raw: string): ParsedMonthsInput {
  const trimmed = raw.trim();
  const parsed = Number(trimmed);
  if (!trimmed || !Number.isFinite(parsed) || parsed <= 0) {
    return { rawText: '1', numericMonths: 1 };
  }
  const clamped = Math.min(12, Math.max(0.5, Math.round(parsed * 100) / 100));
  return { rawText: String(clamped), numericMonths: clamped };
}

// ============================================================================
// 2. PRINT STUDIO & PDF EXPORT FONT STACKS (All 20 Font Styles)
// ============================================================================
export const PRINT_FONT_CSS_STACKS: Record<string, string> = {
  modern_sans: "'Plus Jakarta Sans', 'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  editorial_serif: "'Merriweather', Georgia, Cambria, serif",
  playfair_royal: "'Playfair Display', Georgia, 'Times New Roman', serif",
  academic_times: "'Times New Roman', Times, Georgia, serif",
  formal_georgia: "Georgia, 'Palatino Linotype', 'Book Antiqua', serif",
  warm_charter: "'Lora', Charter, Cambria, Georgia, serif",
  clean_inter: "'Public Sans', 'DM Sans', system-ui, -apple-system, sans-serif",
  space_grotesk: "'Bricolage Grotesque', 'Plus Jakarta Sans', sans-serif",
  condensed_narrow: "'Noto Sans', 'Arial Narrow', sans-serif",
  dyslexic_sans: "'Lexend', Verdana, Tahoma, 'Noto Sans', sans-serif",
  classic_monospace: "'JetBrains Mono', 'Courier New', ui-monospace, monospace",
  retro_mario_mono: "'Fira Code', 'Courier New', 'JetBrains Mono', monospace",
  libre_baskerville: "'Libre Baskerville', Georgia, 'Times New Roman', serif",
  cormorant_chancery: "'Cormorant Garamond', Garamond, Georgia, serif",
  crimson_juris: "'Crimson Pro', Georgia, Cambria, serif",
  source_serif_codal: "'Source Serif 4', Charter, Georgia, serif",
  outfit_geometric: "'Outfit', 'Plus Jakarta Sans', sans-serif",
  dm_sans_clean: "'DM Sans', 'Public Sans', sans-serif",
  bricolage_editorial: "'Bricolage Grotesque', 'Outfit', sans-serif",
  ibm_plex_docket: "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace",
};

export interface PdfFontProfile {
  fontFamily: 'helvetica' | 'times' | 'courier';
  headingStyle: 'bold' | 'bolditalic';
  subHeadingStyle: 'bold' | 'italic' | 'bolditalic';
  bodyStyle: 'normal' | 'italic';
  sizeScale: number;
  charSpace: number;
  lineHeightMultiplier: number;
  displayLabel: string;
}

export const PDF_FONT_PROFILES: Record<string, PdfFontProfile> = {
  modern_sans: {
    fontFamily: 'helvetica',
    headingStyle: 'bold',
    subHeadingStyle: 'bold',
    bodyStyle: 'normal',
    sizeScale: 1.0,
    charSpace: 0,
    lineHeightMultiplier: 1.0,
    displayLabel: 'Modern Sans (Jakarta)',
  },
  editorial_serif: {
    fontFamily: 'times',
    headingStyle: 'bold',
    subHeadingStyle: 'bolditalic',
    bodyStyle: 'normal',
    sizeScale: 1.02,
    charSpace: 0.05,
    lineHeightMultiplier: 1.04,
    displayLabel: 'Editorial Serif (Merriweather)',
  },
  playfair_royal: {
    fontFamily: 'times',
    headingStyle: 'bolditalic',
    subHeadingStyle: 'bolditalic',
    bodyStyle: 'normal',
    sizeScale: 1.05,
    charSpace: 0.14,
    lineHeightMultiplier: 1.06,
    displayLabel: 'Playfair Royal Chancery',
  },
  academic_times: {
    fontFamily: 'times',
    headingStyle: 'bold',
    subHeadingStyle: 'bold',
    bodyStyle: 'normal',
    sizeScale: 1.0,
    charSpace: -0.04,
    lineHeightMultiplier: 1.0,
    displayLabel: 'Academic Times Codal',
  },
  formal_georgia: {
    fontFamily: 'times',
    headingStyle: 'bold',
    subHeadingStyle: 'italic',
    bodyStyle: 'normal',
    sizeScale: 1.03,
    charSpace: 0.08,
    lineHeightMultiplier: 1.05,
    displayLabel: 'Formal Georgia Benchbook',
  },
  warm_charter: {
    fontFamily: 'times',
    headingStyle: 'bolditalic',
    subHeadingStyle: 'bold',
    bodyStyle: 'normal',
    sizeScale: 1.01,
    charSpace: 0.03,
    lineHeightMultiplier: 1.03,
    displayLabel: 'Warm Charter (Lora)',
  },
  clean_inter: {
    fontFamily: 'helvetica',
    headingStyle: 'bold',
    subHeadingStyle: 'bold',
    bodyStyle: 'normal',
    sizeScale: 0.98,
    charSpace: -0.05,
    lineHeightMultiplier: 0.99,
    displayLabel: 'Clean Public Sans',
  },
  space_grotesk: {
    fontFamily: 'helvetica',
    headingStyle: 'bold',
    subHeadingStyle: 'bolditalic',
    bodyStyle: 'normal',
    sizeScale: 1.02,
    charSpace: 0.12,
    lineHeightMultiplier: 1.02,
    displayLabel: 'Grotesque Architectural',
  },
  condensed_narrow: {
    fontFamily: 'helvetica',
    headingStyle: 'bold',
    subHeadingStyle: 'bold',
    bodyStyle: 'normal',
    sizeScale: 0.93,
    charSpace: -0.14,
    lineHeightMultiplier: 0.95,
    displayLabel: 'Condensed High-Density',
  },
  dyslexic_sans: {
    fontFamily: 'helvetica',
    headingStyle: 'bold',
    subHeadingStyle: 'bold',
    bodyStyle: 'normal',
    sizeScale: 1.06,
    charSpace: 0.24,
    lineHeightMultiplier: 1.12,
    displayLabel: 'Lexend Accessible Wide',
  },
  classic_monospace: {
    fontFamily: 'courier',
    headingStyle: 'bold',
    subHeadingStyle: 'bold',
    bodyStyle: 'normal',
    sizeScale: 0.95,
    charSpace: 0,
    lineHeightMultiplier: 1.02,
    displayLabel: 'Classic JetBrains Mono',
  },
  retro_mario_mono: {
    fontFamily: 'courier',
    headingStyle: 'bold',
    subHeadingStyle: 'bolditalic',
    bodyStyle: 'normal',
    sizeScale: 0.97,
    charSpace: 0.16,
    lineHeightMultiplier: 1.05,
    displayLabel: 'Retro 8-Bit Arcade Mono',
  },
  libre_baskerville: {
    fontFamily: 'times',
    headingStyle: 'bold',
    subHeadingStyle: 'bold',
    bodyStyle: 'normal',
    sizeScale: 1.04,
    charSpace: 0.1,
    lineHeightMultiplier: 1.06,
    displayLabel: 'Libre Baskerville Law Review',
  },
  cormorant_chancery: {
    fontFamily: 'times',
    headingStyle: 'bolditalic',
    subHeadingStyle: 'italic',
    bodyStyle: 'italic',
    sizeScale: 1.07,
    charSpace: 0.12,
    lineHeightMultiplier: 1.06,
    displayLabel: 'Cormorant Chancery Script',
  },
  crimson_juris: {
    fontFamily: 'times',
    headingStyle: 'bold',
    subHeadingStyle: 'bolditalic',
    bodyStyle: 'normal',
    sizeScale: 1.02,
    charSpace: 0.02,
    lineHeightMultiplier: 1.03,
    displayLabel: 'Crimson Pro Jurisprudence',
  },
  source_serif_codal: {
    fontFamily: 'times',
    headingStyle: 'bold',
    subHeadingStyle: 'bold',
    bodyStyle: 'normal',
    sizeScale: 0.99,
    charSpace: 0.01,
    lineHeightMultiplier: 1.01,
    displayLabel: 'Source Serif 4 Codal',
  },
  outfit_geometric: {
    fontFamily: 'helvetica',
    headingStyle: 'bold',
    subHeadingStyle: 'bold',
    bodyStyle: 'normal',
    sizeScale: 1.01,
    charSpace: 0.09,
    lineHeightMultiplier: 1.02,
    displayLabel: 'Outfit Geometric Modern',
  },
  dm_sans_clean: {
    fontFamily: 'helvetica',
    headingStyle: 'bold',
    subHeadingStyle: 'italic',
    bodyStyle: 'normal',
    sizeScale: 0.99,
    charSpace: 0.03,
    lineHeightMultiplier: 1.0,
    displayLabel: 'DM Sans Executive',
  },
  bricolage_editorial: {
    fontFamily: 'helvetica',
    headingStyle: 'bolditalic',
    subHeadingStyle: 'bold',
    bodyStyle: 'normal',
    sizeScale: 1.03,
    charSpace: 0.07,
    lineHeightMultiplier: 1.03,
    displayLabel: 'Bricolage Editorial Display',
  },
  ibm_plex_docket: {
    fontFamily: 'courier',
    headingStyle: 'bold',
    subHeadingStyle: 'bold',
    bodyStyle: 'normal',
    sizeScale: 0.94,
    charSpace: -0.05,
    lineHeightMultiplier: 1.0,
    displayLabel: 'IBM Plex Supreme Docket',
  },
};

export function getPrintFontCssStack(fontStyle?: string): string {
  if (!fontStyle) return PRINT_FONT_CSS_STACKS.modern_sans;
  if (PRINT_FONT_CSS_STACKS[fontStyle]) {
    return PRINT_FONT_CSS_STACKS[fontStyle];
  }
  return resolveExtendedPrintFont(fontStyle).cssFontFamily;
}

export function getPdfFontProfile(fontStyle?: string): PdfFontProfile {
  if (!fontStyle) return PDF_FONT_PROFILES.modern_sans;
  return PDF_FONT_PROFILES[fontStyle] || PDF_FONT_PROFILES.modern_sans;
}

// ============================================================================
// 3. DAILY STUDY GOAL PERSISTENT MILESTONE (1-Up + 50 Bonus Coins)
// ============================================================================
export const DAILY_GOAL_CELEBRATION_KEY = 'mario_daily_goal_celebrated_v1';
export const DAILY_GOAL_BONUS_COINS = 50;

export interface DailyGoalMilestoneRecord {
  dateKey: string;
  reachedAtIso: string;
  dismissed: boolean;
  bonusAwarded: boolean;
}

export function getLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function evaluateDailyGoalMilestone(params: {
  dateKey: string;
  studiedSeconds: number;
  goalMinutes: number;
  storage?: StorageLike;
}): {
  newlyReached: boolean;
  shouldShowBanner: boolean;
  record: DailyGoalMilestoneRecord | null;
} {
  const { dateKey, studiedSeconds, goalMinutes, storage } = params;
  const thresholdSeconds = Math.max(1, goalMinutes) * 60;
  let existing: DailyGoalMilestoneRecord | null = null;

  if (storage) {
    try {
      const raw = storage.getItem(DAILY_GOAL_CELEBRATION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DailyGoalMilestoneRecord;
        if (parsed && parsed.dateKey === dateKey) {
          existing = parsed;
        }
      }
    } catch {
      existing = null;
    }
  }

  if (existing) {
    return {
      newlyReached: false,
      shouldShowBanner: !existing.dismissed,
      record: existing,
    };
  }

  if (studiedSeconds >= thresholdSeconds) {
    const created: DailyGoalMilestoneRecord = {
      dateKey,
      reachedAtIso: new Date().toISOString(),
      dismissed: false,
      bonusAwarded: true,
    };
    if (storage) {
      try {
        storage.setItem(DAILY_GOAL_CELEBRATION_KEY, JSON.stringify(created));
      } catch {
        // ignore storage quota errors
      }
    }
    return {
      newlyReached: true,
      shouldShowBanner: true,
      record: created,
    };
  }

  return {
    newlyReached: false,
    shouldShowBanner: false,
    record: null,
  };
}

export function dismissDailyGoalBanner(dateKey: string, storage?: StorageLike): void {
  if (!storage) return;
  try {
    const raw = storage.getItem(DAILY_GOAL_CELEBRATION_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as DailyGoalMilestoneRecord;
    if (parsed.dateKey === dateKey) {
      storage.setItem(
        DAILY_GOAL_CELEBRATION_KEY,
        JSON.stringify({ ...parsed, dismissed: true })
      );
    }
  } catch {
    // ignore
  }
}

// ============================================================================
// 4. DAILY MISSIONS ENGINE (3 Unique Tasks Generated Daily on World Map)
// ============================================================================
export type DailyMissionEventType =
  | 'master_topic'
  | 'quiz_80'
  | 'statute_lookup'
  | 'flashcard_review'
  | 'arcade_play'
  | 'inspect_wages'
  | 'calculator_use';

export interface DailyMissionItem {
  id: string;
  eventType: DailyMissionEventType;
  title: string;
  subtitle: string;
  target: number;
  progress: number;
  rewardCoins: number;
  claimed: boolean;
  actionView?: string;
}

export interface DailyMissionBundle {
  dateKey: string;
  missions: DailyMissionItem[];
}

export const DAILY_MISSIONS_STORAGE_KEY = 'mario_daily_missions_v1';

const DAILY_MISSION_TEMPLATES: Omit<DailyMissionItem, 'progress' | 'claimed'>[] = [
  {
    id: 'dm_master_doctrine',
    eventType: 'master_topic',
    title: 'Master 1 Labor Doctrine',
    subtitle: 'Mark at least 1 Topic Card as mastered in any World module',
    target: 1,
    rewardCoins: 45,
    actionView: 'modules',
  },
  {
    id: 'dm_quiz_80',
    eventType: 'quiz_80',
    title: 'Achieve 80% on a Bar Quiz',
    subtitle: 'Finish any Quiz or Boss Gauntlet run with 80% or higher accuracy',
    target: 1,
    rewardCoins: 65,
    actionView: 'quiz',
  },
  {
    id: 'dm_statute_lookup_3',
    eventType: 'statute_lookup',
    title: 'Use Statute Lookup 3 Times',
    subtitle: 'Open Quick Statute Lookup or inspect codal citations 3 times',
    target: 3,
    rewardCoins: 40,
    actionView: 'statute_lookup',
  },
  {
    id: 'dm_flashcard_5',
    eventType: 'flashcard_review',
    title: 'Flip 3 Memory Flashcards',
    subtitle: 'Review active-recall flashcards in the Flashcard Deck',
    target: 3,
    rewardCoins: 45,
    actionView: 'flashcards',
  },
  {
    id: 'dm_arcade_sprint',
    eventType: 'arcade_play',
    title: 'Complete 1 Arcade Law Game',
    subtitle: 'Play any game inside the 8-Bit Labor Arcade Vault',
    target: 1,
    rewardCoins: 55,
    actionView: 'arcade',
  },
  {
    id: 'dm_wages_inspect',
    eventType: 'inspect_wages',
    title: 'Audit Regional Minimum Wages',
    subtitle: 'Open the 17-Region Wage Matrix and compare statutory rates',
    target: 1,
    rewardCoins: 35,
    actionView: 'wages_matrix',
  },
  {
    id: 'dm_master_2_doctrines',
    eventType: 'master_topic',
    title: 'Double Star: Master 2 Topics',
    subtitle: 'Complete 2 distinct Labor Standards Topic Cards today',
    target: 2,
    rewardCoins: 70,
    actionView: 'modules',
  },
];

function hashDateSeed(dateKey: string): number {
  let h = 2166136261;
  for (let i = 0; i < dateKey.length; i++) {
    h ^= dateKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

export function generateDailyMissionsForDate(dateKey: string): DailyMissionBundle {
  const seed = hashDateSeed(dateKey);
  const pool = [...DAILY_MISSION_TEMPLATES];
  const picked: DailyMissionItem[] = [];
  const usedEventTypes = new Set<DailyMissionEventType>();

  let cursor = seed;
  while (picked.length < 3 && pool.length > 0) {
    const idx = cursor % pool.length;
    cursor = Math.imul(cursor + 1013904223, 1664525) >>> 0;
    const candidate = pool.splice(idx, 1)[0];
    if (usedEventTypes.has(candidate.eventType)) continue;
    usedEventTypes.add(candidate.eventType);
    picked.push({
      ...candidate,
      progress: 0,
      claimed: false,
    });
  }

  return {
    dateKey,
    missions: picked,
  };
}

export function loadOrGenerateDailyMissions(
  dateKey: string,
  storage?: StorageLike
): DailyMissionBundle {
  if (storage) {
    try {
      const raw = storage.getItem(DAILY_MISSIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DailyMissionBundle;
        if (parsed && parsed.dateKey === dateKey && Array.isArray(parsed.missions) && parsed.missions.length === 3) {
          return parsed;
        }
      }
    } catch {
      // regenerate below
    }
  }
  const fresh = generateDailyMissionsForDate(dateKey);
  if (storage) {
    try {
      storage.setItem(DAILY_MISSIONS_STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // ignore
    }
  }
  return fresh;
}

export function applyDailyMissionProgress(
  bundle: DailyMissionBundle,
  eventType: DailyMissionEventType,
  amount = 1
): DailyMissionBundle {
  const inc = Math.max(1, amount);
  return {
    ...bundle,
    missions: bundle.missions.map((m) =>
      m.eventType === eventType
        ? { ...m, progress: Math.min(m.target, m.progress + inc) }
        : m
    ),
  };
}

export function claimDailyMissionReward(
  bundle: DailyMissionBundle,
  missionId: string
): { updated: DailyMissionBundle; coinsAwarded: number } {
  let coinsAwarded = 0;
  const missions = bundle.missions.map((m) => {
    if (m.id === missionId && m.progress >= m.target && !m.claimed) {
      coinsAwarded = m.rewardCoins;
      return { ...m, claimed: true };
    }
    return m;
  });
  return {
    updated: { ...bundle, missions },
    coinsAwarded,
  };
}

export function dispatchDailyMissionEvent(
  eventType: DailyMissionEventType,
  amount = 1
): void {
  if (typeof window === 'undefined') return;
  try {
    const dateKey = getLocalDateKey();
    const current = loadOrGenerateDailyMissions(dateKey, window.localStorage);
    const updated = applyDailyMissionProgress(current, eventType, amount);
    window.localStorage.setItem(DAILY_MISSIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent('mario-daily-missions-updated', { detail: updated })
    );
  } catch {
    // ignore
  }
}

// ============================================================================
// 5. TOADSTOOL QUEST LOG (Long-Term Multi-Milestone Campaign Ending at Bowser)
// ============================================================================
export interface ToadstoolQuestStep {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
  rewardLabel: string;
}

export function computeToadstoolQuestLog(params: {
  completedTopicsCount: number;
  totalTopicsCount: number;
  clearedWorldsCount: number;
  quizHighScoresCount: number;
  unlockedItemsCount: number;
}): {
  steps: ToadstoolQuestStep[];
  overallPercent: number;
  completedSteps: number;
} {
  const totalTopics = Math.max(1, params.totalTopicsCount);
  const steps: ToadstoolQuestStep[] = [
    {
      id: 'quest_first_world',
      title: 'Stage 1: Mushroom Plains Initiate',
      description: 'Clear your first World or master 5 Labor Standards doctrines',
      current: Math.min(5, Math.max(params.completedTopicsCount, params.clearedWorldsCount >= 1 ? 5 : 0)),
      target: 5,
      completed: params.clearedWorldsCount >= 1 || params.completedTopicsCount >= 5,
      rewardLabel: '+50c Star Seal',
    },
    {
      id: 'quest_midgame_worlds',
      title: 'Stage 2: Warp Pipe Juris Voyagers',
      description: 'Clear 3 Worlds across the Mushroom Kingdom Labor Map',
      current: Math.min(3, params.clearedWorldsCount),
      target: 3,
      completed: params.clearedWorldsCount >= 3,
      rewardLabel: '+100c Pipe Badge',
    },
    {
      id: 'quest_quiz_champion',
      title: 'Stage 3: Koopa Gauntlet Contender',
      description: 'Complete 3 Bar Quiz or Boss Runs with strong mastery',
      current: Math.min(3, params.quizHighScoresCount),
      target: 3,
      completed: params.quizHighScoresCount >= 3,
      rewardLabel: 'Koopa Crest',
    },
    {
      id: 'quest_treasury_patron',
      title: 'Stage 4: Toad Treasury Collector',
      description: 'Unlock 8 power-ups, themes, companions, or relics in Toad Shop',
      current: Math.min(8, params.unlockedItemsCount),
      target: 8,
      completed: params.unlockedItemsCount >= 8,
      rewardLabel: 'Royal Seal',
    },
    {
      id: 'quest_bowser_finale',
      title: 'Final Stage: Conquer All 6 Worlds & Bowser',
      description: `Master all ${totalTopics} statutory topics across Worlds 1 to 6`,
      current: Math.min(totalTopics, params.completedTopicsCount),
      target: totalTopics,
      completed: params.completedTopicsCount >= totalTopics && params.clearedWorldsCount >= 6,
      rewardLabel: 'Supreme Bar Crown',
    },
  ];

  const completedSteps = steps.filter((s) => s.completed).length;
  const fractionalSum = steps.reduce(
    (acc, step) => acc + Math.min(1, step.current / Math.max(1, step.target)),
    0
  );
  const overallPercent = Math.round((fractionalSum / steps.length) * 100);

  return {
    steps,
    overallPercent,
    completedSteps,
  };
}

// ============================================================================
// 6. BAR QUIZ QUEST: KOOPA BOSS MODE, 3-LIVES + 1-UP RECOVERY & ASYNC BATTLE
// ============================================================================
export const INITIAL_QUIZ_LIVES = 3;
export const KOOPA_BOSS_TOTAL_QUESTIONS = 10;
export const KOOPA_BOSS_MAX_MISSES = 1;
export const KOOPA_SOVEREIGN_FRAME_ID = 'frame_koopa_sovereign';

export interface KoopaBossState {
  answeredCount: number;
  correctCount: number;
  missCount: number;
  status: 'active' | 'victory' | 'defeat';
}

export function createInitialKoopaBossState(): KoopaBossState {
  return {
    answeredCount: 0,
    correctCount: 0,
    missCount: 0,
    status: 'active',
  };
}

export function stepKoopaBossAnswer(
  state: KoopaBossState,
  isCorrect: boolean,
  totalQuestions: number = KOOPA_BOSS_TOTAL_QUESTIONS
): KoopaBossState {
  if (state.status !== 'active') return state;
  const nextAnswered = state.answeredCount + 1;
  const nextCorrect = state.correctCount + (isCorrect ? 1 : 0);
  const nextMiss = state.missCount + (isCorrect ? 0 : 1);

  if (nextMiss > KOOPA_BOSS_MAX_MISSES) {
    return {
      answeredCount: nextAnswered,
      correctCount: nextCorrect,
      missCount: nextMiss,
      status: 'defeat',
    };
  }

  if (nextAnswered >= totalQuestions) {
    return {
      answeredCount: nextAnswered,
      correctCount: nextCorrect,
      missCount: nextMiss,
      status: 'victory',
    };
  }

  return {
    answeredCount: nextAnswered,
    correctCount: nextCorrect,
    missCount: nextMiss,
    status: 'active',
  };
}

export interface OneUpBlockOption {
  index: number;
  hasOneUp: boolean;
  label: string;
}

export function createOneUpRecoveryBlocks(seedNumber: number = Date.now()): OneUpBlockOption[] {
  const winningIndex = Math.abs(Math.floor(seedNumber)) % 3;
  return [0, 1, 2].map((idx) => ({
    index: idx,
    hasOneUp: idx === winningIndex,
    label: `Mystery Block #${idx + 1}`,
  }));
}

export interface AsyncBattleChallenge {
  worldId: string;
  challengerName: string;
  challengerScore: number;
  challengerTimeSec: number;
  questionIds: string[];
}

export function encodeAsyncBattleChallenge(payload: AsyncBattleChallenge): string {
  try {
    const json = JSON.stringify(payload);
    return typeof btoa === 'function'
      ? btoa(encodeURIComponent(json))
      : Buffer.from(encodeURIComponent(json), 'utf8').toString('base64');
  } catch {
    return '';
  }
}

export function decodeAsyncBattleChallenge(token: string): AsyncBattleChallenge | null {
  if (!token) return null;
  try {
    const decoded =
      typeof atob === 'function'
        ? decodeURIComponent(atob(token))
        : decodeURIComponent(Buffer.from(token, 'base64').toString('utf8'));
    const parsed = JSON.parse(decoded) as AsyncBattleChallenge;
    if (
      parsed &&
      typeof parsed.worldId === 'string' &&
      typeof parsed.challengerName === 'string' &&
      typeof parsed.challengerScore === 'number' &&
      Array.isArray(parsed.questionIds)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function computeSimulatedRivalResult(seedKey: string): {
  rivalName: string;
  rivalScore: number;
  rivalTimeSec: number;
} {
  const h = hashDateSeed(seedKey);
  const rivalNames = [
    'Counsel Koopa, LL.M.',
    'Advocate Rosalina',
    'Atty. Yoshi Juris',
    'Barrister Luigi',
  ];
  return {
    rivalName: rivalNames[h % rivalNames.length],
    rivalScore: 2 + (h % 2), // 2 or 3 out of 3
    rivalTimeSec: 18 + (h % 19), // 18s to 36s
  };
}

// ============================================================================
// 7. TOAD SHOP SOUNDBOARD, COIN MAGNET & 64+ EXPANDED ITEMS
// ============================================================================
export const EQUIPPED_SOUNDBOARD_SFX_KEY = 'mario_equipped_mastery_sfx_v1';
export const COIN_MAGNET_ACTIVE_KEY = 'mario_coin_magnet_active_v1';

export interface SoundboardShopItem {
  id: string;
  sfxMethod:
    | 'coin'
    | 'powerup'
    | 'oneup'
    | 'star'
    | 'levelup'
    | 'flagpole'
    | 'pipe'
    | 'fireball'
    | 'jump'
    | 'stomp'
    | 'bowser'
    | 'gameover';
  name: string;
  description: string;
  price: number;
  badge: string;
}

export const SOUNDBOARD_SFX_CATALOG: SoundboardShopItem[] = [
  {
    id: 'sfx_mastery_coin',
    sfxMethod: 'coin',
    name: 'Classic Gold Coin Chime',
    description: 'Crisp B5-E6 twin-crystal coin pickup chime when mastering a doctrine.',
    price: 0,
    badge: 'STARTER SFX',
  },
  {
    id: 'sfx_mastery_powerup',
    sfxMethod: 'powerup',
    name: 'Super Mushroom Arpeggio',
    description: 'Ascending 8-bit triad power-up surge on every mastered Topic Card.',
    price: 95,
    badge: 'CLASSIC',
  },
  {
    id: 'sfx_mastery_oneup',
    sfxMethod: 'oneup',
    name: 'Green 1-Up Extra Life',
    description: 'Iconic 6-note high-register 1-Up celebration chime.',
    price: 120,
    badge: 'FAN FAVORITE',
  },
  {
    id: 'sfx_mastery_star',
    sfxMethod: 'star',
    name: 'Super Star Invincibility Riff',
    description: 'Energetic Starman victory riff when locking in statutory rules.',
    price: 160,
    badge: 'STAR POWER',
  },
  {
    id: 'sfx_mastery_levelup',
    sfxMethod: 'levelup',
    name: 'Stage Clear Brass Fanfare',
    description: 'Triumphant Mushroom Kingdom stage-clear fanfare.',
    price: 185,
    badge: 'ROYAL',
  },
  {
    id: 'sfx_mastery_flagpole',
    sfxMethod: 'flagpole',
    name: 'Flagpole Slide Cadence',
    description: 'Ascending flagpole slide glissando from World 1-1.',
    price: 150,
    badge: 'NOSTALGIA',
  },
  {
    id: 'sfx_mastery_pipe',
    sfxMethod: 'pipe',
    name: 'Emerald Warp Pipe Descent',
    description: 'Retro 3-step subterranean warp-pipe resonance.',
    price: 110,
    badge: 'WARP ZONE',
  },
  {
    id: 'sfx_mastery_fireball',
    sfxMethod: 'fireball',
    name: 'Fire Flower Flame Burst',
    description: 'Punchy Fire Mario projectile burst on rule completion.',
    price: 115,
    badge: 'PYRO',
  },
  {
    id: 'sfx_mastery_jump',
    sfxMethod: 'jump',
    name: 'Springboard High Jump',
    description: 'Upbeat pitch-swept Mario platform jump cue.',
    price: 90,
    badge: 'NIMBLE',
  },
  {
    id: 'sfx_mastery_stomp',
    sfxMethod: 'stomp',
    name: 'Goomba Doctrine Stomp',
    description: 'Crisp percussive stomp crushing complex exceptions.',
    price: 105,
    badge: 'CRUSHER',
  },
  {
    id: 'sfx_mastery_bowser',
    sfxMethod: 'bowser',
    name: 'Bowser Fortress Thunder',
    description: 'Dramatic low-brass fortress chord for conquering hard sections.',
    price: 210,
    badge: 'BOSS TIER',
  },
  {
    id: 'sfx_mastery_gameover',
    sfxMethod: 'gameover',
    name: 'Retro Curtain Cadence',
    description: 'Playful classic curtain-close cadence for dramatic flair.',
    price: 130,
    badge: 'RETRO',
  },
];

// ============================================================================
// 8. ARCADE BEST PLAYS & COIN MAGNET PHYSICS
// ============================================================================
export const ARCADE_BEST_PLAYS_KEY = 'mario_arcade_best_plays_v1';

export interface ArcadeBestPlayEntry {
  gameId: string;
  gameTitle: string;
  bestScore: number;
  bestCoins: number;
  playsCount: number;
  lastPlayedIso: string;
}

export function loadArcadeBestPlays(storage?: StorageLike): ArcadeBestPlayEntry[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(ARCADE_BEST_PLAYS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ArcadeBestPlayEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordArcadeBestPlay(
  entry: { gameId: string; gameTitle: string; score: number; coinsEarned: number },
  storage?: StorageLike
): ArcadeBestPlayEntry[] {
  const existing = loadArcadeBestPlays(storage);
  const idx = existing.findIndex((e) => e.gameId === entry.gameId);
  const nowIso = new Date().toISOString();

  let updated: ArcadeBestPlayEntry[];
  if (idx >= 0) {
    const cur = existing[idx];
    const merged: ArcadeBestPlayEntry = {
      gameId: cur.gameId,
      gameTitle: entry.gameTitle || cur.gameTitle,
      bestScore: Math.max(cur.bestScore, Math.round(entry.score)),
      bestCoins: Math.max(cur.bestCoins, Math.round(entry.coinsEarned)),
      playsCount: cur.playsCount + 1,
      lastPlayedIso: nowIso,
    };
    updated = [...existing.slice(0, idx), merged, ...existing.slice(idx + 1)];
  } else {
    updated = [
      ...existing,
      {
        gameId: entry.gameId,
        gameTitle: entry.gameTitle,
        bestScore: Math.max(0, Math.round(entry.score)),
        bestCoins: Math.max(0, Math.round(entry.coinsEarned)),
        playsCount: 1,
        lastPlayedIso: nowIso,
      },
    ];
  }

  updated.sort((a, b) => b.bestScore - a.bestScore || b.playsCount - a.playsCount);

  if (storage) {
    try {
      storage.setItem(ARCADE_BEST_PLAYS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
  return updated;
}

export function stepCoinMagnetPull(params: {
  coinX: number;
  coinY: number;
  playerX: number;
  playerY: number;
  radius: number;
  pullSpeed: number;
  dt: number;
}): { x: number; y: number; pulled: boolean } {
  const dx = params.playerX - params.coinX;
  const dy = params.playerY - params.coinY;
  const dist = Math.hypot(dx, dy);
  if (dist <= 0.001 || dist > params.radius) {
    return { x: params.coinX, y: params.coinY, pulled: false };
  }
  const step = Math.min(dist, params.pullSpeed * Math.min(params.dt, 0.05));
  return {
    x: params.coinX + (dx / dist) * step,
    y: params.coinY + (dy / dist) * step,
    pulled: true,
  };
}

// Deterministic Fisher-Yates shuffle with fresh entropy seed so games never repeat identical sets
export function createFreshShuffledDeck<T>(items: readonly T[], extraEntropy: number = Date.now()): T[] {
  const copy = [...items];
  let s = (Math.floor(Math.random() * 0x7fffffff) ^ Math.floor(extraEntropy)) >>> 0;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (Math.imul(s ^ (s >>> 15), 2246822519) + 3266489917) >>> 0;
    const j = s % (i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}
