import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCalculatorMonthsInput,
  normalizeCalculatorMonthsOnBlur,
  getPrintFontCssStack,
  getPdfFontProfile,
  PRINT_FONT_CSS_STACKS,
  PDF_FONT_PROFILES,
  evaluateDailyGoalMilestone,
  dismissDailyGoalBanner,
  generateDailyMissionsForDate,
  applyDailyMissionProgress,
  claimDailyMissionReward,
  computeToadstoolQuestLog,
  createInitialKoopaBossState,
  stepKoopaBossAnswer,
  createOneUpRecoveryBlocks,
  encodeAsyncBattleChallenge,
  decodeAsyncBattleChallenge,
  recordArcadeBestPlay,
  stepCoinMagnetPull,
  createFreshShuffledDeck,
  SOUNDBOARD_SFX_CATALOG,
  StorageLike,
} from './round11Features';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
  };
}

test('Calculator months parser allows clearing empty input and typing any number 1-12 including decimals', () => {
  const empty = parseCalculatorMonthsInput('');
  assert.equal(empty.rawText, '');
  assert.equal(empty.numericMonths, 0);

  const five = parseCalculatorMonthsInput('5');
  assert.equal(five.rawText, '5');
  assert.equal(five.numericMonths, 5);

  const halfYear = parseCalculatorMonthsInput('6.5');
  assert.equal(halfYear.rawText, '6.5');
  assert.equal(halfYear.numericMonths, 6.5);

  const overflow = parseCalculatorMonthsInput('18');
  assert.equal(overflow.rawText, '12');
  assert.equal(overflow.numericMonths, 12);

  const blurredEmpty = normalizeCalculatorMonthsOnBlur('');
  assert.equal(blurredEmpty.rawText, '1');
  assert.equal(blurredEmpty.numericMonths, 1);

  const blurredSeven = normalizeCalculatorMonthsOnBlur('7');
  assert.equal(blurredSeven.rawText, '7');
  assert.equal(blurredSeven.numericMonths, 7);
});

test('All 20 Print Studio & PDF font styles have distinct CSS stacks and PDF profiles', () => {
  const keys = Object.keys(PRINT_FONT_CSS_STACKS);
  assert.equal(keys.length, 20);
  for (const key of keys) {
    assert.ok(getPrintFontCssStack(key).length > 5);
    const pdfProfile = getPdfFontProfile(key);
    assert.ok(['helvetica', 'times', 'courier'].includes(pdfProfile.fontFamily));
    assert.ok(pdfProfile.displayLabel.length > 3);
    assert.ok(PDF_FONT_PROFILES[key]);
  }
});

test('Daily study goal milestone triggers once per dateKey and persists dismissal', () => {
  const storage = createMemoryStorage();
  const dateKey = '2026-11-03';

  const below = evaluateDailyGoalMilestone({
    dateKey,
    studiedSeconds: 500,
    goalMinutes: 15,
    storage,
  });
  assert.equal(below.newlyReached, false);
  assert.equal(below.shouldShowBanner, false);

  const reached = evaluateDailyGoalMilestone({
    dateKey,
    studiedSeconds: 900,
    goalMinutes: 15,
    storage,
  });
  assert.equal(reached.newlyReached, true);
  assert.equal(reached.shouldShowBanner, true);

  const repeatCheck = evaluateDailyGoalMilestone({
    dateKey,
    studiedSeconds: 1200,
    goalMinutes: 15,
    storage,
  });
  assert.equal(repeatCheck.newlyReached, false);
  assert.equal(repeatCheck.shouldShowBanner, true);

  dismissDailyGoalBanner(dateKey, storage);
  const afterDismiss = evaluateDailyGoalMilestone({
    dateKey,
    studiedSeconds: 1300,
    goalMinutes: 15,
    storage,
  });
  assert.equal(afterDismiss.shouldShowBanner, false);
});

test('Daily Missions generates 3 distinct tasks and awards coins once when completed', () => {
  const bundle = generateDailyMissionsForDate('2026-11-03');
  assert.equal(bundle.missions.length, 3);
  const uniqueEvents = new Set(bundle.missions.map((m) => m.eventType));
  assert.equal(uniqueEvents.size, 3);

  const first = bundle.missions[0];
  const progressed = applyDailyMissionProgress(bundle, first.eventType, first.target);
  assert.equal(progressed.missions[0].progress, first.target);

  const claim1 = claimDailyMissionReward(progressed, first.id);
  assert.equal(claim1.coinsAwarded, first.rewardCoins);
  assert.equal(claim1.updated.missions[0].claimed, true);

  const claim2 = claimDailyMissionReward(claim1.updated, first.id);
  assert.equal(claim2.coinsAwarded, 0);
});

test('Toadstool Quest Log computes multi-stage campaign progress accurately', () => {
  const res = computeToadstoolQuestLog({
    completedTopicsCount: 15,
    totalTopicsCount: 30,
    clearedWorldsCount: 3,
    quizHighScoresCount: 2,
    unlockedItemsCount: 10,
  });
  assert.equal(res.steps.length, 5);
  assert.equal(res.completedSteps, 3);
  assert.ok(res.overallPercent > 50 && res.overallPercent < 100);
});

test('Koopa Boss Mode allows at most 1 miss across 10 questions', () => {
  let state = createInitialKoopaBossState();
  // 1 miss on Q1 is still active
  state = stepKoopaBossAnswer(state, false, 10);
  assert.equal(state.status, 'active');
  assert.equal(state.missCount, 1);

  // 9 consecutive correct -> victory at Q10
  for (let i = 0; i < 9; i++) {
    state = stepKoopaBossAnswer(state, true, 10);
  }
  assert.equal(state.status, 'victory');
  assert.equal(state.correctCount, 9);

  // Second miss causes immediate defeat
  let failState = createInitialKoopaBossState();
  failState = stepKoopaBossAnswer(failState, false, 10);
  failState = stepKoopaBossAnswer(failState, false, 10);
  assert.equal(failState.status, 'defeat');
});

test('1-Up recovery blocks, Async Battle codec, Soundboard catalog & Coin Magnet pull work', () => {
  const blocks = createOneUpRecoveryBlocks(7);
  assert.equal(blocks.length, 3);
  assert.equal(blocks.filter((b) => b.hasOneUp).length, 1);

  const encoded = encodeAsyncBattleChallenge({
    worldId: 'world1',
    challengerName: 'Atty. Mario',
    challengerScore: 3,
    challengerTimeSec: 21,
    questionIds: ['q1', 'q2', 'q3'],
  });
  const decoded = decodeAsyncBattleChallenge(encoded);
  assert.ok(decoded);
  assert.equal(decoded.challengerName, 'Atty. Mario');
  assert.equal(decoded.challengerScore, 3);

  assert.equal(SOUNDBOARD_SFX_CATALOG.length, 12);

  const storage = createMemoryStorage();
  const plays = recordArcadeBestPlay(
    { gameId: 'whack_pipe', gameTitle: 'Warp Pipe Whack', score: 420, coinsEarned: 35 },
    storage
  );
  assert.equal(plays.length, 1);
  assert.equal(plays[0].bestScore, 420);

  const pulled = stepCoinMagnetPull({
    coinX: 100,
    coinY: 100,
    playerX: 150,
    playerY: 100,
    radius: 120,
    pullSpeed: 300,
    dt: 0.016,
  });
  assert.equal(pulled.pulled, true);
  assert.ok(pulled.x > 100);

  const deck = createFreshShuffledDeck([1, 2, 3, 4, 5, 6, 7, 8], 42);
  assert.equal(deck.length, 8);
});
