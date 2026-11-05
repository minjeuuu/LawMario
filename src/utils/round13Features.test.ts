import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DAILY_GOAL_INCREMENTS,
  normalizeDailyGoalMinutes,
  loadDailyGoalMinutes,
  saveDailyGoalMinutes,
  cycleNextDailyGoalMinutes,
  computeDailyStudyGoalProgress,
  getTopicDifficultyAudioCueSpec,
  upsertModuleSessionBookmarkSlot,
  loadModuleSessionBookmarks,
  deleteModuleSessionBookmarkSlot,
  saveSingleQuizErrorToStudyNotes,
  isQuizErrorSavedInNotes,
  SimpleStorageLike,
} from './round13Features';
import { loadStudyNotes } from './engagementFeatures';

function createMemoryStorage(): SimpleStorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => {
      map.set(k, v);
    },
  };
}

test('Daily Study Goal increments cover 15m to 120m in 15-minute steps and cycle cleanly', () => {
  assert.deepEqual(
    [...DAILY_GOAL_INCREMENTS],
    [15, 30, 45, 60, 75, 90, 105, 120]
  );

  assert.equal(normalizeDailyGoalMinutes(15), 15);
  assert.equal(normalizeDailyGoalMinutes(75), 75);
  assert.equal(normalizeDailyGoalMinutes(120), 120);
  assert.equal(normalizeDailyGoalMinutes(5), 15);
  assert.equal(normalizeDailyGoalMinutes(999), 120);
  assert.equal(normalizeDailyGoalMinutes('invalid'), 30);

  let cur = 15;
  const visited: number[] = [cur];
  for (let i = 0; i < DAILY_GOAL_INCREMENTS.length; i++) {
    cur = cycleNextDailyGoalMinutes(cur);
    visited.push(cur);
  }
  assert.deepEqual(visited, [15, 30, 45, 60, 75, 90, 105, 120, 15]);
});

test('DailyStudyGoalProgress dynamically updates completion percentage across 15m-120m targets', () => {
  const storage = createMemoryStorage();
  assert.equal(loadDailyGoalMinutes(storage), 30);

  saveDailyGoalMinutes(60, storage);
  assert.equal(loadDailyGoalMinutes(storage), 60);

  // 900 seconds = 15 minutes studied
  const at15 = computeDailyStudyGoalProgress(900, 15);
  assert.equal(at15.completionPercent, 100);
  assert.equal(at15.isGoalReached, true);
  assert.equal(at15.remainingMinutes, 0);

  const at30 = computeDailyStudyGoalProgress(900, 30);
  assert.equal(at30.completionPercent, 50);
  assert.equal(at30.isGoalReached, false);
  assert.equal(at30.remainingMinutes, 15);

  const at45 = computeDailyStudyGoalProgress(900, 45);
  assert.equal(at45.completionPercent, 33);

  const at60 = computeDailyStudyGoalProgress(900, 60);
  assert.equal(at60.completionPercent, 25);

  const at120 = computeDailyStudyGoalProgress(900, 120);
  assert.equal(at120.completionPercent, 13);
});

test('Topic difficulty audio cues map Foundation -> Coin 3s and Bar Master -> Power-Up 3s', () => {
  const foundationCue = getTopicDifficultyAudioCueSpec('Foundation');
  assert.equal(foundationCue.cueId, 'coin_foundation_3s');
  assert.equal(foundationCue.cueLabel, 'Coin Cue');
  assert.equal(foundationCue.durationMs, 3000);
  const fEnd = Math.max(...foundationCue.steps.map((s) => s.startSec + s.durationSec));
  assert.ok(fEnd >= 2.8 && fEnd <= 3.1, `Foundation cue span ${fEnd}s should be ~3s`);

  const barMasterCue = getTopicDifficultyAudioCueSpec('Bar Master');
  assert.equal(barMasterCue.cueId, 'powerup_barmaster_3s');
  assert.equal(barMasterCue.cueLabel, 'Power-Up Cue');
  assert.equal(barMasterCue.durationMs, 3000);
  const bEnd = Math.max(...barMasterCue.steps.map((s) => s.startSec + s.durationSec));
  assert.ok(bEnd >= 2.8 && bEnd <= 3.1, `Bar Master cue span ${bEnd}s should be ~3s`);

  const interCue = getTopicDifficultyAudioCueSpec(undefined, 't1', { t1: 'Bar Master' });
  assert.equal(interCue.cueId, 'powerup_barmaster_3s');
});

test('Bookmark Session saves and restores named workspace slots (scrollY, activeWorld, openTopicIds) in localStorage', () => {
  const storage = createMemoryStorage();
  const res1 = upsertModuleSessionBookmarkSlot(
    [],
    {
      slotName: 'World 2 Holiday Review',
      scrollY: 428.4,
      activeWorld: 'world2',
      openTopicIds: ['m2-holidays', 'm2-sil', 'm2-holidays'],
      moduleViewMode: 'stream',
      now: 1700000001000,
    },
    storage
  );

  assert.equal(res1.slots.length, 1);
  assert.equal(res1.savedSlot.slotName, 'World 2 Holiday Review');
  assert.equal(res1.savedSlot.scrollY, 428);
  assert.equal(res1.savedSlot.activeWorld, 'world2');
  assert.deepEqual(res1.savedSlot.openTopicIds, ['m2-holidays', 'm2-sil']);

  const res2 = upsertModuleSessionBookmarkSlot(
    res1.slots,
    {
      slotName: 'World 5 Special Groups',
      scrollY: 910,
      activeWorld: 'world5',
      openTopicIds: ['m5-harassment-safe-spaces'],
      moduleViewMode: 'grid',
      now: 1700000002000,
    },
    storage
  );
  assert.equal(res2.slots.length, 2);

  // Reload from storage and verify exact state fidelity
  const loaded = loadModuleSessionBookmarks(storage);
  assert.equal(loaded.length, 2);
  assert.equal(loaded[0].slotName, 'World 5 Special Groups');
  assert.equal(loaded[1].slotName, 'World 2 Holiday Review');
  assert.deepEqual(loaded[1].openTopicIds, ['m2-holidays', 'm2-sil']);

  // Overwriting same slot name updates in place instead of duplicating
  const updated = upsertModuleSessionBookmarkSlot(
    loaded,
    {
      slotName: 'world 2 holiday review',
      scrollY: 640,
      activeWorld: 'world2',
      openTopicIds: ['m2-13th-month'],
      now: 1700000003000,
    },
    storage
  );
  assert.equal(updated.slots.length, 2);
  assert.equal(updated.savedSlot.scrollY, 640);
  assert.deepEqual(updated.savedSlot.openTopicIds, ['m2-13th-month']);

  const afterDelete = deleteModuleSessionBookmarkSlot(
    updated.slots,
    updated.savedSlot.id,
    storage
  );
  assert.equal(afterDelete.length, 1);
  assert.equal(afterDelete[0].slotName, 'World 5 Special Groups');
});

test('Quiz errors save one by one into StudyNotes without merging or duplicating', () => {
  const storage = createMemoryStorage();

  const err1 = {
    scenario: 'Ana worked 10 hours on a Regular Holiday falling on her Rest Day.',
    chosenOptionText: '200% of basic wage',
    correctOptionText: '260% for first 8 hours + 30% OT on hourly holiday rest-day rate',
    legalBasis: 'Art. 94 & Art. 87, Labor Code',
    explanation: 'Regular Holiday on Rest Day pays 260%, plus 30% overtime premium beyond 8 hours.',
    worldCode: 'w2',
    quizModeLabel: 'Quick Test',
  };

  const err2 = {
    scenario: 'Pedro is a personal family driver claiming Kasambahay SIL.',
    chosenOptionText: 'Entitled to 5 days SIL under R.A. 10361',
    correctOptionText: 'Excluded from R.A. 10361; governed by Civil Code (Atienza v. Saluta)',
    legalBasis: 'R.A. 10361 / Atienza v. Saluta',
    explanation: 'Family drivers are excluded from Batas Kasambahay coverage.',
    worldCode: 'w4',
    quizModeLabel: 'Quick Test',
  };

  // Save ONLY err1
  const save1 = saveSingleQuizErrorToStudyNotes(storage, err1);
  assert.equal(save1.alreadyExists, false);
  const notesAfter1 = loadStudyNotes(storage);
  assert.equal(notesAfter1.length, 1);
  assert.equal(isQuizErrorSavedInNotes(notesAfter1, err1), true);
  assert.equal(isQuizErrorSavedInNotes(notesAfter1, err2), false);
  assert.equal(notesAfter1[0].worldTag, 'world2');
  assert.equal(notesAfter1[0].categoryTag, 'Bar Exam Review');
  assert.ok(notesAfter1[0].content.includes('Your Answer (Missed): 200% of basic wage'));

  // Clicking save again on err1 is idempotent (no duplicate spam)
  const save1Repeat = saveSingleQuizErrorToStudyNotes(storage, err1);
  assert.equal(save1Repeat.alreadyExists, true);
  assert.equal(loadStudyNotes(storage).length, 1);

  // Now save err2 individually
  const save2 = saveSingleQuizErrorToStudyNotes(storage, err2);
  assert.equal(save2.alreadyExists, false);
  const notesAfter2 = loadStudyNotes(storage);
  assert.equal(notesAfter2.length, 2);
  assert.equal(isQuizErrorSavedInNotes(notesAfter2, err2), true);
  assert.equal(notesAfter2[0].worldTag, 'world4');
});
