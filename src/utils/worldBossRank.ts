import { BossBattleLogEntry } from './round8Features';

export type BossRankTier = 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'UNRANKED';

export interface WorldBossMetadata {
  worldId: string;
  worldNumber: number;
  worldName: string;
  bossName: string;
  bossTitle: string;
  lawDomain: string;
  primaryDoctrine: string;
  targetClearSeconds: number;
  avatarIcon: string;
}

export const WORLD_BOSS_CATALOG: Record<string, WorldBossMetadata> = {
  world1: {
    worldId: 'world1',
    worldNumber: 1,
    worldName: 'World 1: Hours of Work',
    bossName: 'Clockwork Foreman Spike',
    bossTitle: 'Chief Overtime Enforcer',
    lawDomain: 'Hours of Work, Overtime & Meal Intervals (Arts. 83-90)',
    primaryDoctrine: 'Undertime cannot be offset by overtime; meal periods must be at least 60 continuous minutes.',
    targetClearSeconds: 50,
    avatarIcon: 'spike',
  },
  world2: {
    worldId: 'world2',
    worldNumber: 2,
    worldName: 'World 2: Rest & Holidays',
    bossName: 'Calendar Boom Boom',
    bossTitle: 'Holiday Wage Auditor',
    lawDomain: 'Weekly Rest, Holiday Premium & Service Charges (Arts. 91-96)',
    primaryDoctrine: '100% full distribution of service charges to rank-and-file employees; regular holiday worked = 200%.',
    targetClearSeconds: 55,
    avatarIcon: 'boomboom',
  },
  world3: {
    worldId: 'world3',
    worldNumber: 3,
    worldName: 'World 3: Wages & Benefits',
    bossName: 'Wage Thwomp the Crushing Paymaster',
    bossTitle: 'Wage Board Chairman',
    lawDomain: 'Statutory Minimum Wages, Wage Orders & Distortion (Arts. 97-129)',
    primaryDoctrine: 'Facilities deductible if voluntarily accepted in writing; supplements non-deductible wage perks.',
    targetClearSeconds: 60,
    avatarIcon: 'thwomp',
  },
  world4: {
    worldId: 'world4',
    worldNumber: 4,
    worldName: 'World 4: Special Groups',
    bossName: 'Ludwig von Koopa',
    bossTitle: 'Apprentice Labor Magistrate',
    lawDomain: 'Women, Minors, Kasambahay & Homeworkers (Arts. 130-155)',
    primaryDoctrine: 'No child below 15 permitted except under direct parental responsibility; Kasambahay 13th month guaranteed.',
    targetClearSeconds: 60,
    avatarIcon: 'ludwig',
  },
  world5: {
    worldId: 'world5',
    worldNumber: 5,
    worldName: 'World 5: Protective Laws',
    bossName: 'Kamek the Compliance Wizard',
    bossTitle: 'Workplace Safety Arch-Mage',
    lawDomain: 'Anti-Harassment, Safe Spaces, OSH & Telecommuting',
    primaryDoctrine: 'Safe Spaces Act covers peer-to-peer and cyber harassment with immediate employer accountability.',
    targetClearSeconds: 65,
    avatarIcon: 'kamek',
  },
  world6: {
    worldId: 'world6',
    worldNumber: 6,
    worldName: 'World 6: Leaves & Welfare',
    bossName: 'Chief Justice Koopa',
    bossTitle: 'Supreme Leave Guardian',
    lawDomain: 'SIL, Maternity (R.A. 11210), Paternity, VAWC & Solo Parent',
    primaryDoctrine: '105 days fully paid maternity leave with 15 days additional for solo parents, regardless of legitimacy.',
    targetClearSeconds: 70,
    avatarIcon: 'koopa',
  },
  all: {
    worldId: 'all',
    worldNumber: 0,
    worldName: 'Grand Courtroom Arena',
    bossName: 'Employer Bowser',
    bossTitle: 'Managing Director, Koopa Corp',
    lawDomain: 'Comprehensive Labor Standards & Statutory Trials',
    primaryDoctrine: 'Summary Judgment against unfair labor practices, bad-faith dismissals, and statutory underpayments!',
    targetClearSeconds: 75,
    avatarIcon: 'bowser',
  },
};

export interface WorldBossRankSummary {
  worldId: string;
  metadata: WorldBossMetadata;
  totalBattles: number;
  victories: number;
  winRatePercent: number;
  bestAccuracyPercent: number;
  bestScore: number;
  totalQuestions: number;
  fastestClearSeconds: number | null;
  averageClearSeconds: number | null;
  combatRating: number; // 0 to 10,000
  tier: BossRankTier;
  tierTitle: string;
  percentileText: string;
  badgeGradient: string;
  isUnlocked: boolean;
}

export function computeCombatRating(params: {
  accuracyPercent: number;
  timeSeconds: number;
  targetSeconds: number;
  victoriesCount: number;
}): number {
  const { accuracyPercent, timeSeconds, targetSeconds, victoriesCount } = params;
  if (accuracyPercent <= 0) return 0;

  // Base score from accuracy: up to 7,000 pts
  const accuracyComponent = Math.round((accuracyPercent / 100) * 7000);

  // Speed bonus: up to 2,000 pts
  // Faster than target seconds gives bonus, slower tapers down
  const speedRatio = Math.max(0.2, Math.min(2.0, targetSeconds / Math.max(15, timeSeconds)));
  const speedComponent = Math.round(Math.min(2000, 1000 * speedRatio));

  // Victory experience bonus: up to 1,000 pts
  const expComponent = Math.min(1000, victoriesCount * 200);

  return Math.min(10000, Math.max(0, accuracyComponent + speedComponent + expComponent));
}

export function determineBossRankTier(combatRating: number, victories: number): {
  tier: BossRankTier;
  tierTitle: string;
  percentileText: string;
  badgeGradient: string;
} {
  if (victories === 0 && combatRating === 0) {
    return {
      tier: 'UNRANKED',
      tierTitle: 'Uncontested Challenger',
      percentileText: 'Needs First Trial Win',
      badgeGradient: 'from-slate-700 to-slate-900 border-slate-600',
    };
  }

  if (combatRating >= 9000) {
    return {
      tier: 'SSS',
      tierTitle: 'Super Star Juris Doctor',
      percentileText: 'Top 0.8% Elite Labor Scholars',
      badgeGradient: 'from-amber-400 via-rose-500 to-indigo-600 border-amber-300 text-amber-200 shadow-amber-500/50',
    };
  }

  if (combatRating >= 8000) {
    return {
      tier: 'SS',
      tierTitle: 'Supreme Court Champion',
      percentileText: 'Top 3.5% Statewide',
      badgeGradient: 'from-purple-600 via-pink-600 to-red-500 border-purple-400 text-purple-100 shadow-purple-500/40',
    };
  }

  if (combatRating >= 7000) {
    return {
      tier: 'S',
      tierTitle: 'Bowser Annihilator',
      percentileText: 'Top 10% Contenders',
      badgeGradient: 'from-emerald-500 via-teal-600 to-cyan-700 border-emerald-400 text-emerald-100 shadow-emerald-500/30',
    };
  }

  if (combatRating >= 5500) {
    return {
      tier: 'A',
      tierTitle: 'Appellate Bar Master',
      percentileText: 'Top 25% Contenders',
      badgeGradient: 'from-blue-600 to-indigo-700 border-blue-400 text-blue-100 shadow-blue-500/20',
    };
  }

  if (combatRating >= 4000) {
    return {
      tier: 'B',
      tierTitle: 'Mushroom Court Advocate',
      percentileText: 'Top 50% Contenders',
      badgeGradient: 'from-amber-600 to-orange-700 border-amber-500 text-amber-100',
    };
  }

  return {
    tier: 'C',
    tierTitle: 'Novice Labor Plumber',
    percentileText: 'Foundational Rank',
    badgeGradient: 'from-slate-600 to-slate-800 border-slate-500 text-slate-200',
  };
}

export function computeWorldBossRank(
  worldId: string,
  bossLog: readonly BossBattleLogEntry[]
): WorldBossRankSummary {
  const metadata = WORLD_BOSS_CATALOG[worldId] || WORLD_BOSS_CATALOG['all'];

  // Filter boss battles matching this world
  // (matches either explicit worldId or mode label containing world name/number)
  const matchingBattles = bossLog.filter((entry) => {
    if (worldId === 'all') return true;
    if ((entry as { worldId?: string }).worldId === worldId) return true;
    const label = (entry.modeLabel || '').toLowerCase();
    const wNum = metadata.worldNumber;
    return (
      label.includes(`world ${wNum}`) ||
      label.includes(`world${wNum}`) ||
      label.includes(metadata.bossName.toLowerCase()) ||
      label.includes(metadata.worldName.toLowerCase())
    );
  });

  const totalBattles = matchingBattles.length;
  const victoriesList = matchingBattles.filter((b) => b.victory);
  const victories = victoriesList.length;
  const winRatePercent = totalBattles > 0 ? Math.round((victories / totalBattles) * 100) : 0;

  let bestAccuracyPercent = 0;
  let bestScore = 0;
  let totalQuestions = 5;
  let fastestClearSeconds: number | null = null;
  let totalClearTime = 0;

  for (const b of matchingBattles) {
    if (b.accuracyPercent > bestAccuracyPercent) {
      bestAccuracyPercent = b.accuracyPercent;
    }
    if (b.score > bestScore) {
      bestScore = b.score;
      totalQuestions = b.totalQuestions || 5;
    }
    if (b.victory) {
      totalClearTime += b.timeTakenSeconds;
      if (fastestClearSeconds === null || b.timeTakenSeconds < fastestClearSeconds) {
        fastestClearSeconds = b.timeTakenSeconds;
      }
    }
  }

  const averageClearSeconds =
    victories > 0 ? Math.round(totalClearTime / victories) : null;

  // Calculate combat rating
  const effectiveSpeed = fastestClearSeconds || metadata.targetClearSeconds * 1.5;
  const combatRating = computeCombatRating({
    accuracyPercent: bestAccuracyPercent,
    timeSeconds: effectiveSpeed,
    targetSeconds: metadata.targetClearSeconds,
    victoriesCount: victories,
  });

  const tierInfo = determineBossRankTier(combatRating, victories);

  return {
    worldId,
    metadata,
    totalBattles,
    victories,
    winRatePercent,
    bestAccuracyPercent,
    bestScore,
    totalQuestions,
    fastestClearSeconds,
    averageClearSeconds,
    combatRating,
    tier: tierInfo.tier,
    tierTitle: tierInfo.tierTitle,
    percentileText: tierInfo.percentileText,
    badgeGradient: tierInfo.badgeGradient,
    isUnlocked: totalBattles > 0,
  };
}

export function computeAllWorldsBossRanks(
  bossLog: readonly BossBattleLogEntry[]
): Record<string, WorldBossRankSummary> {
  const worldKeys = ['all', 'world1', 'world2', 'world3', 'world4', 'world5', 'world6'];
  const result: Record<string, WorldBossRankSummary> = {};

  for (const w of worldKeys) {
    result[w] = computeWorldBossRank(w, bossLog);
  }

  return result;
}
