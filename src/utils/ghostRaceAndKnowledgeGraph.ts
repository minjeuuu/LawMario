// Pure deterministic logic for Quiz & GameVault Ghost Racing and 6-World Labor Law SVG Knowledge Graph
import { StorageLike } from './round11Features';

export const QUIZ_GHOST_RUNS_KEY = 'mario_quiz_ghost_runs_v1';
export const ARCADE_GHOST_RUNS_KEY = 'mario_arcade_ghost_runs_v1';

export interface QuizGhostCheckpoint {
  questionIndex: number; // 1-based
  elapsedSec: number;
  accuracyPercent: number;
}

export interface QuizGhostRunRecord {
  bucketKey: string; // e.g., 'all', 'world1', 'koopa_boss'
  bestAccuracyPercent: number;
  bestTotalTimeSec: number;
  recordedAtIso: string;
  checkpoints: QuizGhostCheckpoint[];
}

export function loadQuizGhostRuns(
  storage?: StorageLike
): Record<string, QuizGhostRunRecord> {
  if (!storage) return {};
  try {
    const raw = storage.getItem(QUIZ_GHOST_RUNS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, QuizGhostRunRecord>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function recordQuizGhostRun(params: {
  bucketKey: string;
  accuracyPercent: number;
  totalTimeSec: number;
  checkpoints: QuizGhostCheckpoint[];
  storage?: StorageLike;
}): {
  isNewRecord: boolean;
  previousBest: QuizGhostRunRecord | null;
  currentBest: QuizGhostRunRecord;
} {
  const all = loadQuizGhostRuns(params.storage);
  const prev = all[params.bucketKey] || null;

  const isBetter =
    !prev ||
    params.accuracyPercent > prev.bestAccuracyPercent ||
    (params.accuracyPercent === prev.bestAccuracyPercent &&
      params.totalTimeSec < prev.bestTotalTimeSec);

  const nextRecord: QuizGhostRunRecord = {
    bucketKey: params.bucketKey,
    bestAccuracyPercent: params.accuracyPercent,
    bestTotalTimeSec: Math.max(1, Math.round(params.totalTimeSec)),
    recordedAtIso: new Date().toISOString(),
    checkpoints: params.checkpoints,
  };

  if (isBetter) {
    const updated = {
      ...all,
      [params.bucketKey]: nextRecord,
    };
    if (params.storage) {
      try {
        params.storage.setItem(QUIZ_GHOST_RUNS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    return {
      isNewRecord: true,
      previousBest: prev,
      currentBest: nextRecord,
    };
  }

  return {
    isNewRecord: false,
    previousBest: prev,
    currentBest: prev,
  };
}

export function evaluateGhostRaceStatus(params: {
  currentQuestionNumber: number; // 1-based answered count
  totalQuestions: number;
  playerAccuracyPercent: number;
  playerElapsedSec: number;
  ghost: QuizGhostRunRecord | null;
}): {
  hasGhost: boolean;
  playerProgressPct: number;
  ghostProgressPct: number;
  ghostAccuracyPct: number;
  leadStatus: 'ahead' | 'tied' | 'behind' | 'no_ghost';
  summaryLabel: string;
} {
  const totalQ = Math.max(1, params.totalQuestions);
  const playerProgressPct = Math.min(
    100,
    Math.round((params.currentQuestionNumber / totalQ) * 100)
  );

  if (!params.ghost || params.ghost.checkpoints.length === 0) {
    return {
      hasGhost: false,
      playerProgressPct,
      ghostProgressPct: 0,
      ghostAccuracyPct: 0,
      leadStatus: 'no_ghost',
      summaryLabel: 'Setting baseline Ghost benchmark run',
    };
  }

  // Find where ghost was at this elapsed time or question index
  const matchingCp =
    params.ghost.checkpoints.find((c) => c.questionIndex === params.currentQuestionNumber) ||
    params.ghost.checkpoints[params.ghost.checkpoints.length - 1];

  const ghostDoneByTime = params.ghost.checkpoints.filter(
    (c) => c.elapsedSec <= params.playerElapsedSec
  ).length;

  const ghostProgressPct = Math.min(
    100,
    Math.round((Math.max(1, ghostDoneByTime) / totalQ) * 100)
  );
  const ghostAcc = matchingCp?.accuracyPercent ?? params.ghost.bestAccuracyPercent;

  if (
    params.playerAccuracyPercent > ghostAcc ||
    (params.playerAccuracyPercent === ghostAcc &&
      params.playerElapsedSec <= (matchingCp?.elapsedSec ?? params.playerElapsedSec))
  ) {
    return {
      hasGhost: true,
      playerProgressPct,
      ghostProgressPct,
      ghostAccuracyPct: ghostAcc,
      leadStatus: 'ahead',
      summaryLabel: `Ahead of Ghost (${params.playerAccuracyPercent}% vs Ghost ${ghostAcc}%)`,
    };
  }

  if (params.playerAccuracyPercent === ghostAcc) {
    return {
      hasGhost: true,
      playerProgressPct,
      ghostProgressPct,
      ghostAccuracyPct: ghostAcc,
      leadStatus: 'tied',
      summaryLabel: `Neck-and-neck with Ghost (${params.playerAccuracyPercent}%)`,
    };
  }

  return {
    hasGhost: true,
    playerProgressPct,
    ghostProgressPct,
    ghostAccuracyPct: ghostAcc,
    leadStatus: 'behind',
    summaryLabel: `Chasing Ghost (${params.playerAccuracyPercent}% vs Ghost ${ghostAcc}%)`,
  };
}

// ============================================================================
// ARCADE VAULT GHOST RACE PROGRESS SERIES
// ============================================================================
export interface ArcadeGhostSeries {
  gameId: string;
  gameTitle: string;
  scoreCurve: number[]; // 5 checkpoints: [20%, 40%, 60%, 80%, 100%]
  finalScore: number;
  recordedAtIso: string;
}

export function loadArcadeGhostSeries(
  storage?: StorageLike
): Record<string, ArcadeGhostSeries> {
  if (!storage) return {};
  try {
    const raw = storage.getItem(ARCADE_GHOST_RUNS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ArcadeGhostSeries>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function recordArcadeGhostRun(params: {
  gameId: string;
  gameTitle: string;
  finalScore: number;
  storage?: StorageLike;
}): Record<string, ArcadeGhostSeries> {
  const existing = loadArcadeGhostSeries(params.storage);
  const prev = existing[params.gameId];
  const s = Math.max(20, Math.round(params.finalScore));
  const curve = [
    Math.round(s * 0.22),
    Math.round(s * 0.46),
    Math.round(s * 0.71),
    Math.round(s * 0.88),
    s,
  ];

  const nextEntry: ArcadeGhostSeries =
    prev && prev.finalScore > s
      ? prev
      : {
          gameId: params.gameId,
          gameTitle: params.gameTitle,
          scoreCurve: curve,
          finalScore: s,
          recordedAtIso: new Date().toISOString(),
        };

  const updated = {
    ...existing,
    [params.gameId]: nextEntry,
  };
  if (params.storage) {
    try {
      params.storage.setItem(ARCADE_GHOST_RUNS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
  return updated;
}

export function buildArcadeGhostRaceComparison(
  previousBestScore: number,
  latestScore: number
): {
  stepLabel: string;
  ghostScore: number;
  challengerScore: number;
}[] {
  const ghostPeak = Math.max(100, previousBestScore || 450);
  const challengerPeak = Math.max(120, latestScore || Math.round(ghostPeak * 1.15));
  const weights = [
    { label: 'Stage 1', g: 0.2, c: 0.24 },
    { label: 'Stage 2', g: 0.42, c: 0.48 },
    { label: 'Mid-Boss', g: 0.65, c: 0.72 },
    { label: 'Final Lap', g: 0.84, c: 0.9 },
    { label: 'Goal Pole', g: 1.0, c: 1.0 },
  ];
  return weights.map((w) => ({
    stepLabel: w.label,
    ghostScore: Math.round(ghostPeak * w.g),
    challengerScore: Math.round(challengerPeak * w.c),
  }));
}

// ============================================================================
// INTERACTIVE SVG LABOR LAW KNOWLEDGE GRAPH (6 WORLDS RELATIONAL TOPOLOGY)
// ============================================================================
export interface KnowledgeGraphNode {
  id: string;
  topicId: string;
  worldId: string;
  worldNumber: number;
  label: string;
  citation: string;
  x: number;
  y: number;
  color: string;
}

export interface KnowledgeGraphEdge {
  id: string;
  from: string;
  to: string;
  relation: 'computes' | 'requires' | 'contrasts' | 'protects' | 'governs';
  label: string;
}

export const LABOR_KNOWLEDGE_GRAPH_NODES: readonly KnowledgeGraphNode[] = [
  // World 1: Hours & Overtime
  {
    id: 'kg_hours',
    topicId: 'w1-hours',
    worldId: 'world1',
    worldNumber: 1,
    label: '8-Hour Workday & Hours Worked',
    citation: 'Arts. 82-84',
    x: 170,
    y: 120,
    color: '#16A34A',
  },
  {
    id: 'kg_overtime',
    topicId: 'w1-overtime',
    worldId: 'world1',
    worldNumber: 1,
    label: 'Overtime & Night Shift Diff (+25% / +10%)',
    citation: 'Arts. 86-90',
    x: 370,
    y: 95,
    color: '#15803D',
  },
  {
    id: 'kg_exempt',
    topicId: 'w1-coverage',
    worldId: 'world1',
    worldNumber: 1,
    label: 'Exemptions: Managerial & Field Personnel',
    citation: 'Art. 82',
    x: 170,
    y: 235,
    color: '#22C55E',
  },
  // World 2: Holidays & 13th Month
  {
    id: 'kg_holidays',
    topicId: 'w2-holidays',
    worldId: 'world2',
    worldNumber: 2,
    label: 'Regular vs. Special Holidays (200% / 130%)',
    citation: 'Art. 94',
    x: 590,
    y: 105,
    color: '#D97706',
  },
  {
    id: 'kg_13th',
    topicId: 'w2-13th-month',
    worldId: 'world2',
    worldNumber: 2,
    label: '13th-Month Pay (Basic Salary / 12)',
    citation: 'P.D. 851',
    x: 790,
    y: 135,
    color: '#B45309',
  },
  {
    id: 'kg_service_charge',
    topicId: 'w2-service-charge',
    worldId: 'world2',
    worldNumber: 2,
    label: '100% Service Charge Distribution',
    citation: 'R.A. 11360',
    x: 590,
    y: 225,
    color: '#F59E0B',
  },
  // World 3: Wages & Subcontracting
  {
    id: 'kg_min_wage',
    topicId: 'w3-minimum-wage',
    worldId: 'world3',
    worldNumber: 3,
    label: 'Regional Minimum Wages & Distortion',
    citation: 'R.A. 6727 / Art. 124',
    x: 380,
    y: 255,
    color: '#0284C7',
  },
  {
    id: 'kg_wage_prot',
    topicId: 'w3-payment-protections',
    worldId: 'world3',
    worldNumber: 3,
    label: 'Non-Diminution & Authorized Deductions',
    citation: 'Arts. 100, 112-117',
    x: 200,
    y: 365,
    color: '#0369A1',
  },
  {
    id: 'kg_do174',
    topicId: 'w3-contracting',
    worldId: 'world3',
    worldNumber: 3,
    label: 'Legitimate Contracting vs. Labor-Only (P5M)',
    citation: 'Arts. 106-109 / D.O. 174',
    x: 410,
    y: 380,
    color: '#2563EB',
  },
  // World 4: Special Groups
  {
    id: 'kg_women',
    topicId: 'w4-women-anti-discrim',
    worldId: 'world4',
    worldNumber: 4,
    label: 'Equal Pay & Safe Spaces Act (CODI)',
    citation: 'Art. 133 / R.A. 11313',
    x: 620,
    y: 345,
    color: '#9333EA',
  },
  {
    id: 'kg_kasambahay',
    topicId: 'w4-kasambahay',
    worldId: 'world4',
    worldNumber: 4,
    label: 'Batas Kasambahay & Homeworkers',
    citation: 'R.A. 10361',
    x: 810,
    y: 270,
    color: '#7E22CE',
  },
  {
    id: 'kg_minors_pwd',
    topicId: 'w4-minors',
    worldId: 'world4',
    worldNumber: 4,
    label: 'Child Labor Protections & Magna Carta PWD',
    citation: 'R.A. 9231 / R.A. 7277',
    x: 810,
    y: 395,
    color: '#A855F7',
  },
  // World 5: Security of Tenure & Retirement
  {
    id: 'kg_fourfold',
    topicId: 'w5-er-ee',
    worldId: 'world5',
    worldNumber: 5,
    label: 'Four-Fold Control & Two-Tiered Tests',
    citation: 'Art. 295 / Jurisprudence',
    x: 210,
    y: 495,
    color: '#DC2626',
  },
  {
    id: 'kg_termination',
    topicId: 'w5-termination',
    worldId: 'world5',
    worldNumber: 5,
    label: 'Just vs. Authorized Causes & Twin-Notice',
    citation: 'Arts. 297-299',
    x: 430,
    y: 505,
    color: '#B91C1C',
  },
  {
    id: 'kg_retirement',
    topicId: 'w5-retirement',
    worldId: 'world5',
    worldNumber: 5,
    label: 'Retirement Pay (22.5 Days x Years)',
    citation: 'Art. 302 / R.A. 7641',
    x: 640,
    y: 490,
    color: '#991B1B',
  },
  // World 6: Statutory Leaves
  {
    id: 'kg_sil',
    topicId: 'w6-sil-solo',
    worldId: 'world6',
    worldNumber: 6,
    label: '5-Day SIL (Commutable) & Solo Parent Leave',
    citation: 'Art. 95 / R.A. 11861',
    x: 420,
    y: 615,
    color: '#DB2777',
  },
  {
    id: 'kg_maternity',
    topicId: 'w6-maternity-paternity',
    worldId: 'world6',
    worldNumber: 6,
    label: '105-Day Expanded Maternity & 7-Day Paternity',
    citation: 'R.A. 11210 / R.A. 8187',
    x: 640,
    y: 615,
    color: '#BE185D',
  },
  {
    id: 'kg_vawc_magna',
    topicId: 'w6-vawc-magna',
    worldId: 'world6',
    worldNumber: 6,
    label: '10-Day VAWC & 2-Month Magna Carta Leave',
    citation: 'R.A. 9262 / R.A. 9710',
    x: 825,
    y: 550,
    color: '#9D174D',
  },
];

export const LABOR_KNOWLEDGE_GRAPH_EDGES: readonly KnowledgeGraphEdge[] = [
  { id: 'e1', from: 'kg_hours', to: 'kg_overtime', relation: 'computes', label: '>8h -> +25% OT' },
  { id: 'e2', from: 'kg_hours', to: 'kg_exempt', relation: 'contrasts', label: 'Art. 82 Exclusions' },
  { id: 'e3', from: 'kg_overtime', to: 'kg_holidays', relation: 'computes', label: 'Compound Multipliers' },
  { id: 'e4', from: 'kg_min_wage', to: 'kg_overtime', relation: 'computes', label: 'Hourly Base Rate' },
  { id: 'e5', from: 'kg_min_wage', to: 'kg_13th', relation: 'computes', label: 'Basic Salary Excludes OT' },
  { id: 'e6', from: 'kg_holidays', to: 'kg_service_charge', relation: 'governs', label: 'Rank-and-File Shares' },
  { id: 'e7', from: 'kg_min_wage', to: 'kg_wage_prot', relation: 'protects', label: 'No Unlawful Deductions' },
  { id: 'e8', from: 'kg_min_wage', to: 'kg_do174', relation: 'governs', label: 'Solidary Principal Liability' },
  { id: 'e9', from: 'kg_fourfold', to: 'kg_do174', relation: 'requires', label: 'Control Test' },
  { id: 'e10', from: 'kg_fourfold', to: 'kg_termination', relation: 'requires', label: 'Security of Tenure' },
  { id: 'e11', from: 'kg_termination', to: 'kg_retirement', relation: 'contrasts', label: 'Separation vs Retirement' },
  { id: 'e12', from: 'kg_kasambahay', to: 'kg_sil', relation: 'requires', label: '5-Day SIL (Non-Commutable)' },
  { id: 'e13', from: 'kg_women', to: 'kg_maternity', relation: 'protects', label: 'Female Worker Welfare' },
  { id: 'e14', from: 'kg_women', to: 'kg_vawc_magna', relation: 'protects', label: 'Gender Protective Laws' },
  { id: 'e15', from: 'kg_sil', to: 'kg_retirement', relation: 'computes', label: '+5d SIL in 22.5d Formula' },
  { id: 'e16', from: 'kg_exempt', to: 'kg_kasambahay', relation: 'contrasts', label: 'Special Statutory Code' },
  { id: 'e17', from: 'kg_minors_pwd', to: 'kg_hours', relation: 'governs', label: 'Strict Youth Hour Caps' },
];
