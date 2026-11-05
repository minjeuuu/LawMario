import { ALL_LAW_TOPICS } from '../data/laborLawData';

export interface SimpleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const QUIZ_SECTION_ANALYTICS_STORAGE_KEY = 'mario_quiz_section_analytics_v2';

export interface SectionQuestionAttempt {
  topicId: string;
  isCorrect: boolean;
  dateKey: string; // YYYY-MM-DD
  timestamp: number;
}

export interface SectionQuizStats {
  topicId: string;
  attempts: number;
  correct: number;
  missed: number;
  lastTestedTimestamp: number;
}

export type HeatmapCategory =
  | 'critical'      // < 50% accuracy or >= 3 misses
  | 'needs_review'  // 50% - 69% accuracy
  | 'competent'     // 70% - 84% accuracy
  | 'mastered'      // >= 85% accuracy
  | 'untested';     // 0 attempts

export interface HeatmapSectionItem {
  topicId: string;
  sectionTitle: string;
  shortLabel: string;
  legalBasis: string;
  worldId: string;
  worldName: string;
  attempts: number;
  correct: number;
  missed: number;
  accuracyPercent: number;
  category: HeatmapCategory;
  lastTestedDate: string | null;
}

export interface HeatmapSummaryReport {
  timeWindowDays: number;
  items: HeatmapSectionItem[];
  mostMissed: HeatmapSectionItem[];
  barReadinessIndex: number;
  totalAttempts: number;
  totalCorrect: number;
  criticalCount: number;
  masteredCount: number;
}

// Built-in foundational seeds mapped to the actual topic IDs in ALL_LAW_TOPICS
const DEFAULT_PRESET_PERFORMANCE: Record<string, { attempts: number; correct: number }> = {
  'm1-fwa-cww-meals-ot': { attempts: 10, correct: 5 }, // Frequent tricky OT & meal offset questions
  'm1-hours-worked': { attempts: 8, correct: 5 }, // Waiting time / travel time rules
  'm1-coverage': { attempts: 9, correct: 7 }, // Field personnel vs managerial staff
  'm2-service-charge': { attempts: 8, correct: 4 }, // 100% distribution under R.A. 11360
  'm2-13th-month': { attempts: 11, correct: 9 }, // Basic salary definition
  'm2-holiday-pay': { attempts: 12, correct: 7 }, // Regular vs special holiday formulas
  'm2-rest-days': { attempts: 7, correct: 5 },
  'm3-payment-contracting-distortion': { attempts: 8, correct: 4 }, // D.O. 174 & Wage Distortion procedure
  'm3-wage-principles': { attempts: 10, correct: 8 }, // Facilities vs supplements
  'm4-minors-kasambahay-homework': { attempts: 7, correct: 4 }, // Kasambahay 13th month & minor hours
  'm4-women-workers': { attempts: 8, correct: 6 },
  'm5-harassment-safe-spaces': { attempts: 7, correct: 6 }, // R.A. 7877 vs R.A. 11313
  'm5-women-special-laws': { attempts: 6, correct: 4 },
  'm5-vawc-minors-telecommuting': { attempts: 6, correct: 5 },
  'm6-maternity-leave': { attempts: 12, correct: 10 }, // 105 days + 15 solo parent
  'm6-vawc-leave': { attempts: 7, correct: 3 }, // 10 days paid Battered Woman leave
  'm6-service-incentive-leave': { attempts: 9, correct: 8 }, // 5 days commutable to cash
  'm6-solo-parents-leave': { attempts: 6, correct: 4 }, // 7 days under R.A. 8972/11861
  'm6-gynecological-leave': { attempts: 5, correct: 3 }, // 2 months special leave
  'm6-paternity-leave': { attempts: 8, correct: 7 }, // 7 days cohabiting spouse
  'm6-statutory-leave-matrix-special': { attempts: 7, correct: 5 },
};

export function loadSectionAttemptLog(storage?: SimpleStorage | null): SectionQuestionAttempt[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(QUIZ_SECTION_ANALYTICS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SectionQuestionAttempt =>
        Boolean(item) &&
        typeof item.topicId === 'string' &&
        typeof item.isCorrect === 'boolean' &&
        typeof item.timestamp === 'number'
    );
  } catch {
    return [];
  }
}

export function saveSectionAttemptLog(
  attempts: readonly SectionQuestionAttempt[],
  storage?: SimpleStorage | null
): void {
  if (!storage) return;
  try {
    storage.setItem(
      QUIZ_SECTION_ANALYTICS_STORAGE_KEY,
      JSON.stringify(attempts.slice(-500))
    );
  } catch {
    // ignore
  }
}

export function recordSectionQuestionAnswer(
  existing: readonly SectionQuestionAttempt[],
  topicId: string,
  isCorrect: boolean,
  timestamp: number = Date.now(),
  storage?: SimpleStorage | null
): SectionQuestionAttempt[] {
  const dateKey = new Date(timestamp).toISOString().split('T')[0];
  const nextItem: SectionQuestionAttempt = {
    topicId,
    isCorrect,
    dateKey,
    timestamp,
  };
  const updated = [...existing, nextItem].slice(-500);
  if (storage) {
    saveSectionAttemptLog(updated, storage);
  }
  return updated;
}

export function determineHeatmapCategory(
  attempts: number,
  accuracyPercent: number,
  missed: number
): HeatmapCategory {
  if (attempts === 0) return 'untested';
  if (missed >= 3 || accuracyPercent < 50) return 'critical';
  if (accuracyPercent < 70) return 'needs_review';
  if (accuracyPercent < 85) return 'competent';
  return 'mastered';
}

export function buildLaborLawSectionHeatmap(params: {
  timeWindowDays?: number;
  attemptsLog?: readonly SectionQuestionAttempt[];
  filterWorldId?: string;
  now?: Date;
}): HeatmapSummaryReport {
  const {
    timeWindowDays = 30,
    attemptsLog = [],
    filterWorldId = 'all',
    now = new Date(),
  } = params;

  const cutoffMs =
    timeWindowDays > 0 ? now.getTime() - timeWindowDays * 24 * 60 * 60 * 1000 : 0;

  const userAggregates = new Map<string, { attempts: number; correct: number; lastTs: number }>();

  for (const att of attemptsLog) {
    if (att.timestamp >= cutoffMs) {
      const cur = userAggregates.get(att.topicId) || { attempts: 0, correct: 0, lastTs: 0 };
      cur.attempts += 1;
      if (att.isCorrect) cur.correct += 1;
      if (att.timestamp > cur.lastTs) cur.lastTs = att.timestamp;
      userAggregates.set(att.topicId, cur);
    }
  }

  const items: HeatmapSectionItem[] = [];

  for (const topic of ALL_LAW_TOPICS) {
    if (filterWorldId !== 'all' && topic.worldId !== filterWorldId) {
      continue;
    }

    const userStats = userAggregates.get(topic.id);
    const preset = DEFAULT_PRESET_PERFORMANCE[topic.id];

    let totalAttempts = userStats ? userStats.attempts : 0;
    let totalCorrect = userStats ? userStats.correct : 0;
    let lastTestedDate: string | null =
      userStats && userStats.lastTs > 0
        ? new Date(userStats.lastTs).toISOString().split('T')[0]
        : null;

    if (totalAttempts === 0 && preset) {
      totalAttempts = preset.attempts;
      totalCorrect = preset.correct;
      lastTestedDate = new Date(now.getTime() - 4 * 86400000).toISOString().split('T')[0];
    }

    const missed = Math.max(0, totalAttempts - totalCorrect);
    const accuracyPercent =
      totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    const category = determineHeatmapCategory(totalAttempts, accuracyPercent, missed);

    const worldLabels: Record<string, string> = {
      world1: 'World 1: Hours of Work',
      world2: 'World 2: Rest & Holidays',
      world3: 'World 3: Wages & Benefits',
      world4: 'World 4: Special Groups',
      world5: 'World 5: Protective Laws',
      world6: 'World 6: Leaves & Welfare',
    };

    items.push({
      topicId: topic.id,
      sectionTitle: topic.title,
      shortLabel: topic.title.replace(/^Module \d+ - /, '').split('(')[0].trim(),
      legalBasis: topic.badge || 'Labor Code Provisions',
      worldId: topic.worldId,
      worldName: worldLabels[topic.worldId] || topic.worldId,
      attempts: totalAttempts,
      correct: totalCorrect,
      missed,
      accuracyPercent,
      category,
      lastTestedDate,
    });
  }

  const mostMissed = items
    .filter((it) => it.attempts > 0 && it.missed > 0)
    .sort((a, b) => {
      if (b.missed !== a.missed) return b.missed - a.missed;
      return a.accuracyPercent - b.accuracyPercent;
    })
    .slice(0, 5);

  const totalAttempts = items.reduce((sum, it) => sum + it.attempts, 0);
  const totalCorrect = items.reduce((sum, it) => sum + it.correct, 0);
  const criticalCount = items.filter((it) => it.category === 'critical').length;
  const masteredCount = items.filter((it) => it.category === 'mastered').length;

  const testedItems = items.filter((it) => it.attempts > 0);
  const barReadinessIndex =
    testedItems.length > 0
      ? Math.round(
          testedItems.reduce((acc, it) => acc + it.accuracyPercent, 0) / testedItems.length
        )
      : 72;

  return {
    timeWindowDays,
    items,
    mostMissed,
    barReadinessIndex,
    totalAttempts,
    totalCorrect,
    criticalCount,
    masteredCount,
  };
}
