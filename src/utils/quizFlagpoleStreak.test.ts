import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadFlagpoleStreak,
  saveFlagpoleStreak,
  recordQuizForFlagpole,
  claimFlagpoleMilestone,
  getFlagpoleProgress,
  DEFAULT_FLAGPOLE_STREAK_STATE,
  FLAGPOLE_5DAY_BONUS_XP,
  FLAGPOLE_BADGE_MULTIPLIER_VALUE,
  FlagpoleStreakState,
} from './quizFlagpoleStreak';

class MemoryStorage {
  private map = new Map<string, string>();
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
}

test('quizFlagpoleStreak: initializes with default values and loads properly', () => {
  const storage = new MemoryStorage();
  const initial = loadFlagpoleStreak(storage);
  assert.equal(initial.currentStreak, 0);
  assert.equal(initial.bestStreak, 0);
  assert.equal(initial.claimedMilestones.length, 0);
  assert.equal(initial.multiplierActiveUntil, null);
});

test('quizFlagpoleStreak: records consecutive quiz attempts and triggers 5-day milestone', () => {
  let state = { ...DEFAULT_FLAGPOLE_STREAK_STATE };

  // Day 1
  let res = recordQuizForFlagpole(state, '2026-11-01');
  assert.equal(res.streakIncremented, true);
  assert.equal(res.nextState.currentStreak, 1);
  state = res.nextState;

  // Same day should not increment
  res = recordQuizForFlagpole(state, '2026-11-01');
  assert.equal(res.streakIncremented, false);
  assert.equal(res.nextState.currentStreak, 1);

  // Day 2
  res = recordQuizForFlagpole(state, '2026-11-02');
  assert.equal(res.nextState.currentStreak, 2);
  state = res.nextState;

  // Day 3
  res = recordQuizForFlagpole(state, '2026-11-03');
  assert.equal(res.nextState.currentStreak, 3);
  state = res.nextState;

  // Day 4
  res = recordQuizForFlagpole(state, '2026-11-04');
  assert.equal(res.nextState.currentStreak, 4);
  state = res.nextState;

  // Day 5 - Milestone!
  res = recordQuizForFlagpole(state, '2026-11-05');
  assert.equal(res.nextState.currentStreak, 5);
  assert.equal(res.milestoneUnlocked, true);
  state = res.nextState;

  const progress = getFlagpoleProgress(state);
  assert.equal(progress.dayOfCycle, 5);
  assert.equal(progress.poleClimbPercent, 100);
  assert.equal(progress.hasReached5Day, true);
  assert.equal(progress.hasUnclaimed5Day, true);
});

test('quizFlagpoleStreak: claims 5-day milestone and activates 1.5x badge multiplier and +500 XP', () => {
  let state: FlagpoleStreakState = {
    ...DEFAULT_FLAGPOLE_STREAK_STATE,
    currentStreak: 5,
    bestStreak: 5,
    lastQuizDate: '2026-11-05',
  };

  const nowMs = 1793500000000;
  const claimRes = claimFlagpoleMilestone(state, 5, nowMs);
  assert.equal(claimRes.success, true);
  assert.equal(claimRes.xpAwarded, FLAGPOLE_5DAY_BONUS_XP);
  assert.equal(claimRes.multiplierDurationHours, 24);
  state = claimRes.nextState;

  // Claiming again should fail gracefully
  const secondClaim = claimFlagpoleMilestone(state, 5, nowMs);
  assert.equal(secondClaim.success, false);

  // Check progress with active multiplier
  const progressActive = getFlagpoleProgress(state, nowMs + 1000);
  assert.equal(progressActive.isMultiplierActive, true);
  assert.equal(progressActive.effectiveMultiplier, FLAGPOLE_BADGE_MULTIPLIER_VALUE);
  assert.equal(progressActive.hasUnclaimed5Day, false);

  // After 25 hours, multiplier expires
  const progressExpired = getFlagpoleProgress(state, nowMs + 25 * 3600 * 1000);
  assert.equal(progressExpired.isMultiplierActive, false);
  assert.equal(progressExpired.effectiveMultiplier, 1.0);
});

test('quizFlagpoleStreak: resets streak if 2 days pass', () => {
  const state = {
    ...DEFAULT_FLAGPOLE_STREAK_STATE,
    currentStreak: 4,
    bestStreak: 4,
    lastQuizDate: '2026-11-01',
  };

  // Skip 3 days
  const res = recordQuizForFlagpole(state, '2026-11-04');
  assert.equal(res.streakIncremented, true);
  assert.equal(res.nextState.currentStreak, 1);
  assert.equal(res.nextState.bestStreak, 4);
});
