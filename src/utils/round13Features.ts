import {
  loadStudyNotes,
  saveStudyNotes,
  createStudyNote,
  StudyNoteItem,
} from './engagementFeatures';

export interface SimpleStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

// ============================================================================
// 1. DAILY STUDY GOAL 15M–120M INCREMENT CUSTOMIZER & DYNAMIC PROGRESS MATH
// ============================================================================

export const DAILY_GOAL_STORAGE_KEY = 'mario_daily_study_goal_minutes_v1';

export const DAILY_GOAL_INCREMENTS = [15, 30, 45, 60, 75, 90, 105, 120] as const;

export type DailyGoalIncrement = (typeof DAILY_GOAL_INCREMENTS)[number];

export interface DailyStudyGoalProgress {
  targetMinutes: DailyGoalIncrement;
  targetSeconds: number;
  studiedSeconds: number;
  currentMinutes: number;
  remainingMinutes: number;
  completionPercent: number;
  isGoalReached: boolean;
}

export function normalizeDailyGoalMinutes(raw: unknown): DailyGoalIncrement {
  const num = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(num) || num <= 0) {
    return 30;
  }
  const clamped = Math.min(120, Math.max(15, num));
  const snapped = Math.round(clamped / 15) * 15;
  const match = DAILY_GOAL_INCREMENTS.find((inc) => inc === snapped);
  return match ?? 30;
}

export function loadDailyGoalMinutes(
  storage?: SimpleStorageLike | null
): DailyGoalIncrement {
  if (!storage) return 30;
  try {
    const raw = storage.getItem(DAILY_GOAL_STORAGE_KEY);
    if (!raw) return 30;
    return normalizeDailyGoalMinutes(parseInt(raw, 10));
  } catch {
    return 30;
  }
}

export function saveDailyGoalMinutes(
  minutes: number,
  storage?: SimpleStorageLike | null
): DailyGoalIncrement {
  const normalized = normalizeDailyGoalMinutes(minutes);
  if (storage) {
    try {
      storage.setItem(DAILY_GOAL_STORAGE_KEY, String(normalized));
    } catch {
      // ignore storage errors
    }
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mario-daily-goal-updated', {
        detail: { targetMinutes: normalized },
      })
    );
  }
  return normalized;
}

export function cycleNextDailyGoalMinutes(current: number): DailyGoalIncrement {
  const normalized = normalizeDailyGoalMinutes(current);
  const idx = DAILY_GOAL_INCREMENTS.indexOf(normalized);
  const nextIdx = (idx + 1) % DAILY_GOAL_INCREMENTS.length;
  return DAILY_GOAL_INCREMENTS[nextIdx];
}

export function computeDailyStudyGoalProgress(
  studiedSeconds: number,
  targetMinutes: number
): DailyStudyGoalProgress {
  const safeTargetMinutes = normalizeDailyGoalMinutes(targetMinutes);
  const targetSeconds = safeTargetMinutes * 60;
  const safeStudiedSeconds = Math.max(0, Math.floor(Number(studiedSeconds) || 0));
  const currentMinutes = Math.floor(safeStudiedSeconds / 60);
  const completionPercent = Math.min(
    100,
    Math.round((safeStudiedSeconds / targetSeconds) * 100)
  );
  const isGoalReached = safeStudiedSeconds >= targetSeconds;
  const remainingMinutes = isGoalReached
    ? 0
    : Math.max(1, Math.ceil((targetSeconds - safeStudiedSeconds) / 60));

  return {
    targetMinutes: safeTargetMinutes,
    targetSeconds,
    studiedSeconds: safeStudiedSeconds,
    currentMinutes,
    remainingMinutes,
    completionPercent,
    isGoalReached,
  };
}

// ============================================================================
// 2. 3-SECOND MARIO-THEMED AUDIO CUES BY LABOR LAW TOPIC DIFFICULTY
// ============================================================================

export type TopicDifficultyLevel = 'Foundation' | 'Intermediate' | 'Bar Master';

export interface TopicDifficultyToneStep {
  freqHz: number;
  harmonyHz?: number;
  startSec: number;
  durationSec: number;
  gain: number;
}

export interface TopicDifficultyCueSpec {
  difficulty: TopicDifficultyLevel;
  cueId: 'coin_foundation_3s' | 'fireflower_intermediate_3s' | 'powerup_barmaster_3s';
  cueLabel: string;
  badgeText: string;
  durationMs: 3000;
  wave: OscillatorType;
  steps: readonly TopicDifficultyToneStep[];
}

export const TOPIC_DIFFICULTY_AUDIO_CUES: Record<
  TopicDifficultyLevel,
  TopicDifficultyCueSpec
> = {
  Foundation: {
    difficulty: 'Foundation',
    cueId: 'coin_foundation_3s',
    cueLabel: 'Coin Cue',
    badgeText: 'Coin Cue · 3s',
    durationMs: 3000,
    wave: 'square',
    steps: [
      // Classic B5 -> E6 Mario Coin double-chime followed by cheerful Coin-Heaven cascade (~3.0s)
      { freqHz: 987.77, startSec: 0.0, durationSec: 0.11, gain: 0.65 },
      { freqHz: 1318.51, harmonyHz: 659.25, startSec: 0.11, durationSec: 0.42, gain: 0.7 },
      { freqHz: 987.77, startSec: 0.62, durationSec: 0.1, gain: 0.55 },
      { freqHz: 1318.51, startSec: 0.73, durationSec: 0.34, gain: 0.6 },
      { freqHz: 1046.5, harmonyHz: 523.25, startSec: 1.15, durationSec: 0.22, gain: 0.52 },
      { freqHz: 1318.51, harmonyHz: 659.25, startSec: 1.4, durationSec: 0.22, gain: 0.54 },
      { freqHz: 1567.98, harmonyHz: 783.99, startSec: 1.66, durationSec: 0.26, gain: 0.56 },
      { freqHz: 1318.51, startSec: 1.98, durationSec: 0.22, gain: 0.5 },
      { freqHz: 1567.98, startSec: 2.24, durationSec: 0.22, gain: 0.54 },
      { freqHz: 2093.0, harmonyHz: 1046.5, startSec: 2.5, durationSec: 0.48, gain: 0.62 },
    ],
  },
  Intermediate: {
    difficulty: 'Intermediate',
    cueId: 'fireflower_intermediate_3s',
    cueLabel: 'Fire Flower Cue',
    badgeText: 'Fire Flower Cue · 3s',
    durationMs: 3000,
    wave: 'triangle',
    steps: [
      // Super Mario Fire Flower & Overworld triad melody (~3.0s)
      { freqHz: 523.25, harmonyHz: 261.63, startSec: 0.0, durationSec: 0.2, gain: 0.62 },
      { freqHz: 659.25, harmonyHz: 329.63, startSec: 0.22, durationSec: 0.2, gain: 0.64 },
      { freqHz: 783.99, harmonyHz: 392.0, startSec: 0.44, durationSec: 0.24, gain: 0.66 },
      { freqHz: 1046.5, harmonyHz: 523.25, startSec: 0.72, durationSec: 0.34, gain: 0.68 },
      { freqHz: 880.0, harmonyHz: 440.0, startSec: 1.12, durationSec: 0.24, gain: 0.58 },
      { freqHz: 987.77, harmonyHz: 493.88, startSec: 1.4, durationSec: 0.24, gain: 0.6 },
      { freqHz: 1046.5, harmonyHz: 523.25, startSec: 1.68, durationSec: 0.28, gain: 0.64 },
      { freqHz: 783.99, harmonyHz: 392.0, startSec: 2.0, durationSec: 0.24, gain: 0.56 },
      { freqHz: 1046.5, harmonyHz: 523.25, startSec: 2.28, durationSec: 0.24, gain: 0.62 },
      { freqHz: 1318.51, harmonyHz: 659.25, startSec: 2.54, durationSec: 0.44, gain: 0.68 },
    ],
  },
  'Bar Master': {
    difficulty: 'Bar Master',
    cueId: 'powerup_barmaster_3s',
    cueLabel: 'Power-Up Cue',
    badgeText: 'Power-Up Cue · 3s',
    durationMs: 3000,
    wave: 'square',
    steps: [
      // Iconic Super Mario Rising Power-Up Arpeggio + Star Resolution (~3.0s)
      { freqHz: 392.0, startSec: 0.0, durationSec: 0.11, gain: 0.58 },
      { freqHz: 493.88, startSec: 0.11, durationSec: 0.11, gain: 0.6 },
      { freqHz: 587.33, startSec: 0.22, durationSec: 0.11, gain: 0.62 },
      { freqHz: 783.99, startSec: 0.33, durationSec: 0.11, gain: 0.64 },
      { freqHz: 987.77, startSec: 0.44, durationSec: 0.16, gain: 0.66 },
      { freqHz: 415.3, startSec: 0.64, durationSec: 0.11, gain: 0.58 },
      { freqHz: 523.25, startSec: 0.75, durationSec: 0.11, gain: 0.6 },
      { freqHz: 622.25, startSec: 0.86, durationSec: 0.11, gain: 0.62 },
      { freqHz: 830.61, startSec: 0.97, durationSec: 0.11, gain: 0.65 },
      { freqHz: 1046.5, startSec: 1.08, durationSec: 0.18, gain: 0.68 },
      { freqHz: 466.16, startSec: 1.3, durationSec: 0.11, gain: 0.6 },
      { freqHz: 587.33, startSec: 1.41, durationSec: 0.11, gain: 0.62 },
      { freqHz: 698.46, startSec: 1.52, durationSec: 0.11, gain: 0.65 },
      { freqHz: 932.33, startSec: 1.63, durationSec: 0.12, gain: 0.68 },
      { freqHz: 1174.66, harmonyHz: 587.33, startSec: 1.76, durationSec: 0.34, gain: 0.7 },
      { freqHz: 1318.51, harmonyHz: 659.25, startSec: 2.14, durationSec: 0.32, gain: 0.7 },
      { freqHz: 1567.98, harmonyHz: 783.99, startSec: 2.48, durationSec: 0.5, gain: 0.74 },
    ],
  },
};

export function resolveTopicDifficultyLevel(
  difficultyInput?: string | null,
  topicId?: string,
  difficultyMap?: Record<string, TopicDifficultyLevel>
): TopicDifficultyLevel {
  if (
    difficultyInput === 'Foundation' ||
    difficultyInput === 'Intermediate' ||
    difficultyInput === 'Bar Master'
  ) {
    return difficultyInput;
  }
  if (topicId && difficultyMap && difficultyMap[topicId]) {
    return difficultyMap[topicId];
  }
  return 'Intermediate';
}

export function getTopicDifficultyAudioCueSpec(
  difficultyInput?: string | null,
  topicId?: string,
  difficultyMap?: Record<string, TopicDifficultyLevel>
): TopicDifficultyCueSpec {
  const level = resolveTopicDifficultyLevel(difficultyInput, topicId, difficultyMap);
  return TOPIC_DIFFICULTY_AUDIO_CUES[level];
}

// ============================================================================
// 3. 'BOOKMARK SESSION' NAMED SLOTS IN MODULES VIEW (LOCALSTORAGE)
// ============================================================================

export const MODULE_SESSION_BOOKMARKS_STORAGE_KEY =
  'mario_module_session_bookmarks_v1';

export type ModuleWorkspaceViewMode =
  | 'stream'
  | 'grid'
  | 'outline'
  | 'focus'
  | 'slides';

export interface ModuleSessionBookmarkSlot {
  id: string;
  slotName: string;
  scrollY: number;
  activeWorld: string;
  openTopicIds: string[];
  moduleViewMode: ModuleWorkspaceViewMode;
  savedAt: number;
}

const VALID_MODULE_VIEW_MODES: readonly ModuleWorkspaceViewMode[] = [
  'stream',
  'grid',
  'outline',
  'focus',
  'slides',
];

export function loadModuleSessionBookmarks(
  storage?: SimpleStorageLike | null
): ModuleSessionBookmarkSlot[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(MODULE_SESSION_BOOKMARKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item, idx) => {
        const rawMode = String(item.moduleViewMode || 'stream') as ModuleWorkspaceViewMode;
        const safeMode = VALID_MODULE_VIEW_MODES.includes(rawMode) ? rawMode : 'stream';
        const openIds = Array.isArray(item.openTopicIds)
          ? Array.from(
              new Set(
                item.openTopicIds.filter(
                  (id): id is string => typeof id === 'string' && id.trim().length > 0
                )
              )
            )
          : [];
        return {
          id:
            typeof item.id === 'string' && item.id.trim()
              ? item.id
              : `slot-${idx}-${Number(item.savedAt) || 0}`,
          slotName:
            typeof item.slotName === 'string' && item.slotName.trim()
              ? item.slotName.trim().slice(0, 60)
              : `Session Slot ${idx + 1}`,
          scrollY: Math.max(0, Math.round(Number(item.scrollY) || 0)),
          activeWorld:
            typeof item.activeWorld === 'string' && item.activeWorld.trim()
              ? item.activeWorld.trim()
              : 'all',
          openTopicIds: openIds,
          moduleViewMode: safeMode,
          savedAt: Math.max(0, Math.floor(Number(item.savedAt) || 0)),
        };
      });
  } catch {
    return [];
  }
}

export function saveModuleSessionBookmarks(
  slots: readonly ModuleSessionBookmarkSlot[],
  storage?: SimpleStorageLike | null
): void {
  if (!storage) return;
  try {
    storage.setItem(MODULE_SESSION_BOOKMARKS_STORAGE_KEY, JSON.stringify(slots));
  } catch {
    // ignore storage errors
  }
}

export function upsertModuleSessionBookmarkSlot(
  existing: readonly ModuleSessionBookmarkSlot[],
  input: {
    slotName: string;
    scrollY: number;
    activeWorld: string;
    openTopicIds: readonly string[];
    moduleViewMode?: ModuleWorkspaceViewMode;
    now?: number;
  },
  storage?: SimpleStorageLike | null
): { slots: ModuleSessionBookmarkSlot[]; savedSlot: ModuleSessionBookmarkSlot } {
  const now = input.now ?? Date.now();
  const trimmedName = input.slotName.trim().slice(0, 60);
  const resolvedName = trimmedName || `Session Slot ${existing.length + 1}`;
  const safeScrollY = Math.max(0, Math.round(Number(input.scrollY) || 0));
  const safeWorld = input.activeWorld.trim() || 'all';
  const safeOpenIds = Array.from(
    new Set(
      input.openTopicIds.filter(
        (id): id is string => typeof id === 'string' && id.trim().length > 0
      )
    )
  );
  const safeViewMode: ModuleWorkspaceViewMode =
    input.moduleViewMode && VALID_MODULE_VIEW_MODES.includes(input.moduleViewMode)
      ? input.moduleViewMode
      : 'stream';

  const existingMatch = existing.find(
    (s) => s.slotName.toLowerCase() === resolvedName.toLowerCase()
  );

  const savedSlot: ModuleSessionBookmarkSlot = {
    id:
      existingMatch?.id ||
      `bmslot_${now}_${Math.random().toString(36).slice(2, 7)}`,
    slotName: resolvedName,
    scrollY: safeScrollY,
    activeWorld: safeWorld,
    openTopicIds: safeOpenIds,
    moduleViewMode: safeViewMode,
    savedAt: now,
  };

  const withoutMatch = existing.filter((s) => s.id !== savedSlot.id);
  const slots = [savedSlot, ...withoutMatch].slice(0, 15);
  saveModuleSessionBookmarks(slots, storage);

  return { slots, savedSlot };
}

export function deleteModuleSessionBookmarkSlot(
  existing: readonly ModuleSessionBookmarkSlot[],
  slotId: string,
  storage?: SimpleStorageLike | null
): ModuleSessionBookmarkSlot[] {
  const next = existing.filter((s) => s.id !== slotId);
  saveModuleSessionBookmarks(next, storage);
  return next;
}

// ============================================================================
// 4. ONE-BY-ONE SAVEABLE NOTES FROM QUIZ ERRORS & WRONGS
// ============================================================================

export interface QuizErrorNoteInput {
  scenario: string;
  correctOptionText: string;
  chosenOptionText?: string;
  legalBasis: string;
  explanation: string;
  worldCode?: string;
  quizModeLabel?: string;
}

function normalizeQuizWorldToNoteWorldTag(worldCode?: string): string {
  if (!worldCode) return 'all';
  const clean = worldCode.trim().toLowerCase();
  if (/^world[1-6]$/.test(clean)) return clean;
  const shortMatch = /^w([1-6])$/.exec(clean);
  if (shortMatch) return `world${shortMatch[1]}`;
  if (clean === 'holidays') return 'world2';
  return 'all';
}

export function computeQuizErrorFingerprint(
  input: Pick<QuizErrorNoteInput, 'legalBasis' | 'scenario' | 'correctOptionText'>
): string {
  const raw = `${(input.legalBasis || '').trim().toLowerCase()}|${(
    input.scenario || ''
  )
    .trim()
    .toLowerCase()
    .slice(0, 120)}|${(input.correctOptionText || '').trim().toLowerCase().slice(0, 80)}`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
  }
  return `qerr_${(hash >>> 0).toString(36)}`;
}

export function formatSingleQuizErrorNote(input: QuizErrorNoteInput): {
  title: string;
  content: string;
  worldTag: string;
  fingerprint: string;
} {
  const fingerprint = computeQuizErrorFingerprint(input);
  const basis = (input.legalBasis || 'Philippine Labor Code').trim();
  const modePrefix = input.quizModeLabel ? `[${input.quizModeLabel}] ` : '';
  const scenarioClean = (input.scenario || '').trim();
  const shortScenario =
    scenarioClean.length > 56 ? `${scenarioClean.slice(0, 53).trim()}...` : scenarioClean;

  const title = `${modePrefix}Missed Rule: ${basis}${
    shortScenario ? ` — ${shortScenario}` : ''
  }`.slice(0, 110);

  const lines: string[] = [
    `Scenario: ${scenarioClean}`,
    ...(input.chosenOptionText
      ? [`Your Answer (Missed): ${input.chosenOptionText.trim()}`]
      : []),
    `Correct Statutory Rule: ${(input.correctOptionText || '').trim()}`,
    `Legal Basis: ${basis}`,
    `Doctrinal Explanation: ${(input.explanation || '').trim()}`,
    `Ref: ${fingerprint}`,
  ];

  return {
    title,
    content: lines.join('\n\n'),
    worldTag: normalizeQuizWorldToNoteWorldTag(input.worldCode),
    fingerprint,
  };
}

export function isQuizErrorSavedInNotes(
  notes: readonly StudyNoteItem[],
  input: Pick<QuizErrorNoteInput, 'legalBasis' | 'scenario' | 'correctOptionText'>
): boolean {
  const fp = computeQuizErrorFingerprint(input);
  return notes.some((n) => typeof n.content === 'string' && n.content.includes(`Ref: ${fp}`));
}

export function saveSingleQuizErrorToStudyNotes(
  storage: SimpleStorageLike | null | undefined,
  input: QuizErrorNoteInput
): {
  notes: StudyNoteItem[];
  savedNote: StudyNoteItem;
  alreadyExists: boolean;
  fingerprint: string;
} {
  const existing = loadStudyNotes(storage ?? undefined);
  const formatted = formatSingleQuizErrorNote(input);

  const existingItem = existing.find(
    (n) =>
      typeof n.content === 'string' &&
      n.content.includes(`Ref: ${formatted.fingerprint}`)
  );

  if (existingItem) {
    return {
      notes: existing,
      savedNote: existingItem,
      alreadyExists: true,
      fingerprint: formatted.fingerprint,
    };
  }

  const updated = createStudyNote(existing, {
    title: formatted.title,
    content: formatted.content,
    worldTag: formatted.worldTag,
    categoryTag: 'Bar Exam Review',
  });
  saveStudyNotes(updated, storage ?? undefined);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mario-study-notes-updated'));
  }

  return {
    notes: updated,
    savedNote: updated[0],
    alreadyExists: false,
    fingerprint: formatted.fingerprint,
  };
}

// ============================================================================
// 5. SPACED REPETITION SECTION REVIEW TRACKER (> 30 DAYS UNREVIEWED)
// ============================================================================

export const SECTION_MASTERY_TIMESTAMPS_KEY = 'mario_section_mastery_timestamps_v1';
export const SECTION_REVIEW_OVERDUE_DAYS = 30;
export const MS_PER_DAY_CONST = 86_400_000;

export type SectionMasteryTimestampsMap = Record<string, number>; // key: `${topicId}::${sectionKey}` -> timestamp ms

export function makeSectionMasteryKey(topicId: string, sectionKey: string): string {
  return `${topicId.trim()}::${sectionKey.trim()}`;
}

export function loadSectionMasteryTimestamps(
  storage?: SimpleStorageLike | null
): SectionMasteryTimestampsMap {
  if (!storage) return {};
  try {
    const raw = storage.getItem(SECTION_MASTERY_TIMESTAMPS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const clean: SectionMasteryTimestampsMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof k === 'string' && typeof v === 'number' && Number.isFinite(v) && v > 0) {
        clean[k] = v;
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export function saveSectionMasteryTimestamps(
  map: SectionMasteryTimestampsMap,
  storage?: SimpleStorageLike | null
): void {
  if (!storage) return;
  try {
    storage.setItem(SECTION_MASTERY_TIMESTAMPS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function recordSectionReviewTimestamp(
  map: SectionMasteryTimestampsMap,
  topicId: string,
  sectionKey: string,
  timestampMs: number = Date.now()
): SectionMasteryTimestampsMap {
  const compositeKey = makeSectionMasteryKey(topicId, sectionKey);
  return {
    ...map,
    [compositeKey]: timestampMs,
  };
}

export interface SectionReviewStatus {
  isMastered: boolean;
  isOverdueForReview: boolean;
  daysSinceReview: number;
  lastReviewedMs: number;
  reviewLabel: string;
}

export function computeSectionReviewStatus(params: {
  topicId: string;
  sectionKey: string;
  isMastered: boolean;
  timestampsMap: SectionMasteryTimestampsMap;
  nowMs?: number;
  overdueThresholdDays?: number;
}): SectionReviewStatus {
  const { topicId, sectionKey, isMastered, timestampsMap } = params;
  if (!isMastered) {
    return {
      isMastered: false,
      isOverdueForReview: false,
      daysSinceReview: 0,
      lastReviewedMs: 0,
      reviewLabel: '',
    };
  }

  const nowMs = params.nowMs ?? Date.now();
  const threshold = params.overdueThresholdDays ?? SECTION_REVIEW_OVERDUE_DAYS;
  const compositeKey = makeSectionMasteryKey(topicId, sectionKey);
  const recordedMs = timestampsMap[compositeKey];

  // If mastered but never recorded, treat as needing review (e.g., 35 days ago default)
  const effectiveMs = typeof recordedMs === 'number' && recordedMs > 0 ? recordedMs : nowMs - 35 * MS_PER_DAY_CONST;
  const diffMs = Math.max(0, nowMs - effectiveMs);
  const days = Math.floor(diffMs / MS_PER_DAY_CONST);
  const isOverdue = days >= threshold;

  return {
    isMastered: true,
    isOverdueForReview: isOverdue,
    daysSinceReview: days,
    lastReviewedMs: effectiveMs,
    reviewLabel: isOverdue ? `Overdue (${days}d ago)` : `Reviewed (${days}d ago)`,
  };
}
