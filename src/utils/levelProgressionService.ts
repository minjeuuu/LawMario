/**
 * Level Progression & XP System
 * 
 * Users earn Experience Points (XP) dynamically through:
 * - Quiz & Boss Showdown performance (correct answers, streaks, completion)
 * - Study time spent in sessions (active seconds logged)
 * - Arcade mini-game challenges and module mastery
 * 
 * Advancing through levels (Levels 1 to 33) unlocks new Mario character avatars,
 * titles, and exclusive rank badges.
 */

import { MarioAvatar } from '../types/laborLaw';

export interface LevelThreshold {
  level: number;
  xpRequired: number;
  title: string;
  unlockedAvatars: MarioAvatar[];
  perkDescription: string;
}

export const LEVEL_THRESHOLDS: readonly LevelThreshold[] = [
  {
    level: 1,
    xpRequired: 0,
    title: 'Novice Plumber (Labor Initiate)',
    unlockedAvatars: ['mario', 'luigi'],
    perkDescription: 'Standard Mushroom Kingdom labor rights credentials',
  },
  {
    level: 2,
    xpRequired: 120,
    title: 'Jurisdiction Apprentice',
    unlockedAvatars: ['toad'],
    perkDescription: 'Toad House advisory clearance',
  },
  {
    level: 3,
    xpRequired: 280,
    title: 'Mushroom Kingdom Clerk',
    unlockedAvatars: ['toadette'],
    perkDescription: 'DOLE docket filing permit',
  },
  {
    level: 4,
    xpRequired: 480,
    title: 'Dino Valley Paralegal',
    unlockedAvatars: ['yoshi'],
    perkDescription: 'Enhanced statutory digest speed',
  },
  {
    level: 5,
    xpRequired: 720,
    title: 'Mushroom Castle Counselor',
    unlockedAvatars: ['peach'],
    perkDescription: 'Royal decree statutory leaves analysis',
  },
  {
    level: 6,
    xpRequired: 1000,
    title: 'Subterranean Mine Explorer',
    unlockedAvatars: ['capttoad'],
    perkDescription: 'Unearths hidden labor jurisprudence gems',
  },
  {
    level: 7,
    xpRequired: 1320,
    title: 'Sarasaland Holiday Advocate',
    unlockedAvatars: ['daisy'],
    perkDescription: 'Regular and special holiday wage calculation mastery',
  },
  {
    level: 8,
    xpRequired: 1680,
    title: 'Comet Observatory Barrister',
    unlockedAvatars: ['rosalina'],
    perkDescription: 'Gravitational command of nighttime differential',
  },
  {
    level: 9,
    xpRequired: 2080,
    title: 'New Donk City Solicitor',
    unlockedAvatars: ['pauline'],
    perkDescription: 'Metropolitan wage order proficiency',
  },
  {
    level: 10,
    xpRequired: 2520,
    title: 'Jungle Arbiter of Work',
    unlockedAvatars: ['donkeykong'],
    perkDescription: 'Heavy-duty hazardous industry safety regulations',
  },
  {
    level: 11,
    xpRequired: 3000,
    title: 'Canopy Assistant Arbiter',
    unlockedAvatars: ['diddykong'],
    perkDescription: 'Agile apprentice and learnership oversight',
  },
  {
    level: 12,
    xpRequired: 3520,
    title: 'Egg Valley Statutory Jurist',
    unlockedAvatars: ['birdo'],
    perkDescription: 'Precision inspection of service charges distribution',
  },
  {
    level: 13,
    xpRequired: 4080,
    title: 'Koopa Shell Auditor',
    unlockedAvatars: ['koopatroopa'],
    perkDescription: 'Defensive audits against illegal wage deductions',
  },
  {
    level: 14,
    xpRequired: 4680,
    title: 'Subcon Subpoena Inspector',
    unlockedAvatars: ['shyguy'],
    perkDescription: 'Piercing legitimate contracting vs labor-only contracting',
  },
  {
    level: 15,
    xpRequired: 5320,
    title: 'Haunted Mansion Spectral Advocate',
    unlockedAvatars: ['boo'],
    perkDescription: 'Invisibility against procedural traps and prescription periods',
  },
  {
    level: 16,
    xpRequired: 6000,
    title: 'Crypt of Deadlines Master',
    unlockedAvatars: ['drybones'],
    perkDescription: 'Unbreakable command of the 3-year money claims prescription',
  },
  {
    level: 17,
    xpRequired: 6720,
    title: 'Koopa Magikoopa Jurist',
    unlockedAvatars: ['kamek'],
    perkDescription: 'Transmutes complex jurisprudence into crystal clarity',
  },
  {
    level: 18,
    xpRequired: 7480,
    title: 'Garlic Fortress Capitalist',
    unlockedAvatars: ['wario'],
    perkDescription: 'Relentless defense of 13th month pay computations',
  },
  {
    level: 19,
    xpRequired: 8280,
    title: 'Mischief Tennis Litigator',
    unlockedAvatars: ['waluigi'],
    perkDescription: 'Counter-serves unfair labor practice allegations',
  },
  {
    level: 20,
    xpRequired: 9120,
    title: 'Junior Castle Prosecutor',
    unlockedAvatars: ['bowserjr'],
    perkDescription: 'Fiery enforcement of managerial employee exemptions',
  },
  {
    level: 21,
    xpRequired: 10000,
    title: 'Molten Keep Chief Arbiter',
    unlockedAvatars: ['bowser'],
    perkDescription: 'Supreme solidary liability enforcement across contractors',
  },
  {
    level: 22,
    xpRequired: 10950,
    title: 'Heavy Alloy Jurisdict',
    unlockedAvatars: ['metalmario'],
    perkDescription: 'Indestructible shield against illegal dismissal suits',
  },
  {
    level: 23,
    xpRequired: 11950,
    title: 'Golden Treasury Chancellor',
    unlockedAvatars: ['goldmario'],
    perkDescription: 'Golden multiplier mastery across compressed workweeks',
  },
  {
    level: 24,
    xpRequired: 13000,
    title: 'Blazing Fireball Solicitor',
    unlockedAvatars: ['firemario'],
    perkDescription: 'Burning speed in resolving grievance machinery',
  },
  {
    level: 25,
    xpRequired: 14100,
    title: 'Frost Glaze Proceduralist',
    unlockedAvatars: ['iceluigi'],
    perkDescription: 'Freezes unlawful lockout orders in their tracks',
  },
  {
    level: 26,
    xpRequired: 15250,
    title: 'Super Leaf Flight Barrister',
    unlockedAvatars: ['tanookimario'],
    perkDescription: 'Glides over appellate jurisdictional obstacles',
  },
  {
    level: 27,
    xpRequired: 16450,
    title: 'Royal Feline Guardian',
    unlockedAvatars: ['catpeach'],
    perkDescription: 'Pounces on non-compliance with the Magna Carta for Women',
  },
  {
    level: 28,
    xpRequired: 17700,
    title: 'Cosmic Dimension Grand Scholar',
    unlockedAvatars: ['cosmicrosalina'],
    perkDescription: 'Universal synthesis of Supreme Court en banc rulings',
  },
  {
    level: 29,
    xpRequired: 19000,
    title: 'Undead Molten King Sovereign',
    unlockedAvatars: ['drybowser'],
    perkDescription: 'Resurrects valid claims despite procedural default',
  },
  {
    level: 30,
    xpRequired: 20400,
    title: 'Golden Dinosaur Legend',
    unlockedAvatars: ['goldenyoshi'],
    perkDescription: 'Golden clutch instincts on high-stakes statutory doctrines',
  },
  {
    level: 31,
    xpRequired: 21900,
    title: 'Toad Statutory Scholar Summa',
    unlockedAvatars: ['lawyertoad'],
    perkDescription: 'Top-tier statutory labor standards certificate honors',
  },
  {
    level: 32,
    xpRequired: 23500,
    title: 'Inverted Shadow Sovereign',
    unlockedAvatars: ['shadowmario'],
    perkDescription: 'Mastery over obscure special protective statutes',
  },
  {
    level: 33,
    xpRequired: 25200,
    title: 'Clinical Labor Diagnostics Doctor',
    unlockedAvatars: ['drpeach'],
    perkDescription: 'Flawless diagnosis of complex multi-tier employer-employee relationships',
  },
];

export const LEVEL_PROGRESSION_STORAGE_KEY = 'mario_level_progression_v2';

export interface UserProgressionState {
  totalXp: number;
  level: number;
  lastAwardedReason?: string;
  lastAwardedXp?: number;
  unlockedAvatars: MarioAvatar[];
  newlyUnlockedAvatars?: MarioAvatar[];
}

export interface ProgressionStats {
  level: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpInCurrentLevel: number;
  xpRequiredForCurrentLevel: number;
  progressPercent: number;
  title: string;
  perkDescription: string;
  unlockedAvatars: MarioAvatar[];
  nextUnlockPreview: {
    level: number;
    title: string;
    avatars: MarioAvatar[];
  } | null;
}

/**
 * Resolves player level and unlocked avatars based on total XP
 */
export function getProgressionForXp(totalXp: number): ProgressionStats {
  const safeXp = Math.max(0, Math.round(totalXp || 0));
  
  let currentThreshold = LEVEL_THRESHOLDS[0];
  let nextThreshold: LevelThreshold | null = LEVEL_THRESHOLDS[1] || null;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (safeXp >= LEVEL_THRESHOLDS[i].xpRequired) {
      currentThreshold = LEVEL_THRESHOLDS[i];
      nextThreshold = LEVEL_THRESHOLDS[i + 1] || null;
      break;
    }
  }

  // Aggregate all unlocked avatars up to current level
  const unlockedSet = new Set<MarioAvatar>();
  for (const t of LEVEL_THRESHOLDS) {
    if (t.level <= currentThreshold.level) {
      t.unlockedAvatars.forEach((a) => unlockedSet.add(a));
    }
  }

  const currentLevelXp = currentThreshold.xpRequired;
  const nextLevelXp = nextThreshold ? nextThreshold.xpRequired : currentLevelXp + 5000;
  const xpRequiredForCurrentLevel = Math.max(1, nextLevelXp - currentLevelXp);
  const xpInCurrentLevel = Math.min(xpRequiredForCurrentLevel, safeXp - currentLevelXp);
  const progressPercent = nextThreshold
    ? Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpRequiredForCurrentLevel) * 100)))
    : 100;

  return {
    level: currentThreshold.level,
    totalXp: safeXp,
    currentLevelXp,
    nextLevelXp,
    xpInCurrentLevel,
    xpRequiredForCurrentLevel,
    progressPercent,
    title: currentThreshold.title,
    perkDescription: currentThreshold.perkDescription,
    unlockedAvatars: Array.from(unlockedSet),
    nextUnlockPreview: nextThreshold
      ? {
          level: nextThreshold.level,
          title: nextThreshold.title,
          avatars: [...nextThreshold.unlockedAvatars],
        }
      : null,
  };
}

/**
 * Checks if an avatar is unlocked at a given player level
 */
export function isAvatarUnlockedByLevel(avatar: MarioAvatar, currentLevel: number): boolean {
  for (const t of LEVEL_THRESHOLDS) {
    if (t.level <= currentLevel && t.unlockedAvatars.includes(avatar)) {
      return true;
    }
  }
  return false;
}

/**
 * Returns the minimum required level to unlock an avatar
 */
export function getRequiredLevelForAvatar(avatar: MarioAvatar): number {
  for (const t of LEVEL_THRESHOLDS) {
    if (t.unlockedAvatars.includes(avatar)) {
      return t.level;
    }
  }
  return 1;
}


/**
 * Computes XP earned from quiz results
 */
export function calculateQuizXp(params: {
  correctCount: number;
  totalCount: number;
  isBossOrExam?: boolean;
  streakCount?: number;
}): number {
  const { correctCount, totalCount, isBossOrExam, streakCount = 0 } = params;
  if (totalCount <= 0 || correctCount <= 0) return 10; // Effort XP

  // Base: 30 XP per correct answer
  let xp = correctCount * 30;

  // Perfect run bonus
  if (correctCount === totalCount) {
    xp += 100;
  }

  // Streak bonus: +5 XP per consecutive streak point (max 50)
  xp += Math.min(50, streakCount * 5);

  // Boss / Final Exam multiplier
  if (isBossOrExam) {
    xp = Math.round(xp * 1.5);
  }

  return Math.max(15, xp);
}

/**
 * Computes XP earned from active study time
 * 1 XP per 15 seconds studied (4 XP per minute)
 */
export function calculateStudyTimeXp(studiedSeconds: number): number {
  if (studiedSeconds <= 0) return 0;
  return Math.floor(studiedSeconds / 15);
}

/**
 * Loads user progression from localStorage
 */
export function loadUserProgression(storage?: { getItem: (k: string) => string | null }): UserProgressionState {
  const store = storage || (typeof window !== 'undefined' ? window.localStorage : null);
  if (!store) {
    const defaultStats = getProgressionForXp(0);
    return {
      totalXp: 0,
      level: 1,
      unlockedAvatars: defaultStats.unlockedAvatars,
    };
  }

  try {
    const raw = store.getItem(LEVEL_PROGRESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const totalXp = Number(parsed.totalXp) || 0;
      const stats = getProgressionForXp(totalXp);
      return {
        totalXp,
        level: stats.level,
        lastAwardedReason: parsed.lastAwardedReason,
        lastAwardedXp: parsed.lastAwardedXp,
        unlockedAvatars: stats.unlockedAvatars,
      };
    }
  } catch {
    // fallback
  }

  const initialStats = getProgressionForXp(0);
  return {
    totalXp: 0,
    level: 1,
    unlockedAvatars: initialStats.unlockedAvatars,
  };
}

/**
 * Awards XP and saves to localStorage. Returns level-up event info if leveled up.
 */
export function awardUserXp(params: {
  amount: number;
  reason: string;
  storage?: { getItem: (k: string) => string | null; setItem: (k: string, v: string) => void };
}): {
  previousLevel: number;
  newLevel: number;
  didLevelUp: boolean;
  totalXp: number;
  xpAwarded: number;
  newlyUnlockedAvatars: MarioAvatar[];
  newTitle: string;
  updatedState: UserProgressionState;
} {
  const store = params.storage || (typeof window !== 'undefined' ? window.localStorage : null);
  const current = loadUserProgression(store || undefined);

  const safeAdd = Math.max(1, Math.round(params.amount));
  const newTotalXp = current.totalXp + safeAdd;

  const oldStats = getProgressionForXp(current.totalXp);
  const newStats = getProgressionForXp(newTotalXp);

  const didLevelUp = newStats.level > oldStats.level;
  
  // Find newly unlocked avatars
  const newlyUnlocked: MarioAvatar[] = [];
  if (didLevelUp) {
    const oldSet = new Set(oldStats.unlockedAvatars);
    for (const a of newStats.unlockedAvatars) {
      if (!oldSet.has(a)) {
        newlyUnlocked.push(a);
      }
    }
  }

  const nextState: UserProgressionState = {
    totalXp: newTotalXp,
    level: newStats.level,
    lastAwardedReason: params.reason,
    lastAwardedXp: safeAdd,
    unlockedAvatars: newStats.unlockedAvatars,
    newlyUnlockedAvatars: newlyUnlocked,
  };

  if (store) {
    try {
      store.setItem(LEVEL_PROGRESSION_STORAGE_KEY, JSON.stringify(nextState));
    } catch {
      // ignore quota errors
    }
  }

  return {
    previousLevel: oldStats.level,
    newLevel: newStats.level,
    didLevelUp,
    totalXp: newTotalXp,
    xpAwarded: safeAdd,
    newlyUnlockedAvatars: newlyUnlocked,
    newTitle: newStats.title,
    updatedState: nextState,
  };
}

/**
 * Resets user progression to Level 1 with 0 XP
 */
export function resetUserProgression(storage?: {
  removeItem?: (k: string) => void;
  setItem?: (k: string, v: string) => void;
}): UserProgressionState {
  const store = storage || (typeof window !== 'undefined' ? window.localStorage : null);
  const initial = getProgressionForXp(0);
  const resetState: UserProgressionState = {
    totalXp: 0,
    level: 1,
    unlockedAvatars: initial.unlockedAvatars,
  };
  if (store && store.setItem) {
    try {
      store.setItem(LEVEL_PROGRESSION_STORAGE_KEY, JSON.stringify(resetState));
    } catch {
      // ignore
    }
  }
  return resetState;
}

