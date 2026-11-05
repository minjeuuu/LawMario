import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEVEL_THRESHOLDS,
  calculateQuizXp,
  calculateStudyTimeXp,
  getProgressionForXp,
  isAvatarUnlockedByLevel,
  getRequiredLevelForAvatar,
  awardUserXp,
  resetUserProgression,
} from './levelProgressionService';

test('Level-Up Progression System: Thresholds and Bounds', () => {
  assert.equal(LEVEL_THRESHOLDS.length, 33, 'Must have 33 total progression levels');
  assert.equal(LEVEL_THRESHOLDS[0].level, 1);
  assert.equal(LEVEL_THRESHOLDS[0].xpRequired, 0);
  assert.ok(LEVEL_THRESHOLDS[0].unlockedAvatars.includes('mario'));
  assert.ok(LEVEL_THRESHOLDS[0].unlockedAvatars.includes('luigi'));

  // Monotonically increasing XP requirements
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    assert.ok(
      LEVEL_THRESHOLDS[i].xpRequired > LEVEL_THRESHOLDS[i - 1].xpRequired,
      `Level ${LEVEL_THRESHOLDS[i].level} XP (${LEVEL_THRESHOLDS[i].xpRequired}) must exceed Level ${LEVEL_THRESHOLDS[i - 1].level} XP (${LEVEL_THRESHOLDS[i - 1].xpRequired})`
    );
  }
});

test('calculateQuizXp computes accurate XP based on performance and game mode', () => {
  // 5 out of 5 correct standard quiz
  const perfectStandard = calculateQuizXp({ correctCount: 5, totalCount: 5, isBossOrExam: false });
  // 5*30 + 100 (perfect) = 250
  assert.equal(perfectStandard, 250);

  // 3 out of 5 correct standard quiz
  const partial = calculateQuizXp({ correctCount: 3, totalCount: 5, isBossOrExam: false });
  // 3*30 = 90
  assert.equal(partial, 90);

  // 10 out of 10 Boss showdown
  const perfectBoss = calculateQuizXp({ correctCount: 10, totalCount: 10, isBossOrExam: true });
  // (10*30 + 100) * 1.5 = 400 * 1.5 = 600
  assert.equal(perfectBoss, 600);

  // 0 answers gives minimum effort XP
  assert.equal(calculateQuizXp({ correctCount: 0, totalCount: 0 }), 10);
});

test('calculateStudyTimeXp awards XP based on active study seconds', () => {
  assert.equal(calculateStudyTimeXp(0), 0);
  // 60 seconds / 15 = 4 XP
  assert.equal(calculateStudyTimeXp(60), 4);
  // 300 seconds / 15 = 20 XP
  assert.equal(calculateStudyTimeXp(300), 20);
  // Negative or small fraction rounds cleanly
  assert.equal(calculateStudyTimeXp(-10), 0);
});

test('getProgressionForXp accurately calculates current level, next level, and progress percent', () => {
  const atZero = getProgressionForXp(0);
  assert.equal(atZero.level, 1);
  assert.equal(atZero.nextUnlockPreview?.level, 2);
  assert.equal(atZero.xpInCurrentLevel, 0);
  assert.equal(atZero.progressPercent, 0);

  // At Level 2 exactly (120 XP)
  const at120 = getProgressionForXp(120);
  assert.equal(at120.level, 2);
  assert.equal(at120.nextUnlockPreview?.level, 3);
  assert.equal(at120.progressPercent, 0);

  // Halfway through Level 2 (120 to 280 = 160 range, 120 + 80 = 200)
  const at200 = getProgressionForXp(200);
  assert.equal(at200.level, 2);
  assert.equal(at200.progressPercent, 50);

  // At max level (Level 33 requires 25,200 XP)
  const maxLvl = getProgressionForXp(26000);
  assert.equal(maxLvl.level, 33);
  assert.equal(maxLvl.nextUnlockPreview, null);
  assert.equal(maxLvl.progressPercent, 100);
});

test('Avatar Level Unlock verification', () => {
  // Mario and Luigi are unlocked at Level 1
  assert.equal(isAvatarUnlockedByLevel('mario', 1), true);
  assert.equal(isAvatarUnlockedByLevel('luigi', 1), true);

  // Toad unlocks at Level 2
  assert.equal(isAvatarUnlockedByLevel('toad', 1), false);
  assert.equal(isAvatarUnlockedByLevel('toad', 2), true);
  assert.equal(getRequiredLevelForAvatar('toad'), 2);

  // Peach unlocks at Level 5
  assert.equal(getRequiredLevelForAvatar('peach'), 5);

  // Rosalina unlocks at Level 8
  assert.equal(getRequiredLevelForAvatar('rosalina'), 8);

  // Shadow Mario requires Level 32
  assert.equal(getRequiredLevelForAvatar('shadowmario'), 32);

  // Dr. Peach requires Level 33
  assert.equal(getRequiredLevelForAvatar('drpeach'), 33);
  assert.equal(isAvatarUnlockedByLevel('drpeach', 32), false);
  assert.equal(isAvatarUnlockedByLevel('drpeach', 33), true);
});

test('awardUserXp updates state and triggers didLevelUp flag correctly', () => {
  // Mock localStorage
  const store: Record<string, string> = {};
  const mockStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => {
      store[key] = val;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };

  const initial = resetUserProgression(mockStorage);
  assert.equal(initial.totalXp, 0);
  assert.equal(initial.level, 1);

  // Award 50 XP (still level 1)
  const step1 = awardUserXp({ amount: 50, reason: 'Test 1', storage: mockStorage });
  assert.equal(step1.updatedState.totalXp, 50);
  assert.equal(step1.updatedState.level, 1);
  assert.equal(step1.didLevelUp, false);

  // Award another 80 XP (Total 130 XP -> crossed 120 threshold for Level 2)
  const step2 = awardUserXp({ amount: 80, reason: 'Test 2', storage: mockStorage });
  assert.equal(step2.updatedState.totalXp, 130);
  assert.equal(step2.updatedState.level, 2);
  assert.equal(step2.didLevelUp, true);
  assert.equal(step2.newLevel, 2);
  assert.ok(step2.newlyUnlockedAvatars.includes('toad'));
});
