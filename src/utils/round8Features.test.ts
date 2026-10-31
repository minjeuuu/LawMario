import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_DAILY_BOSS_QUIZ_STREAK_STATE,
  getActiveDailyBossQuizStreak,
  recordBossQuizCompletionForDailyStreak,
  buildTargetedWeaknessDrillDeck,
  computeQuizWorldResultSummary,
  shouldTriggerGlobalMuteShortcut,
  recordRecentlyViewedTopic,
  syncCompletedTopicsDailyHistory,
  buildCompletedTopicsSparklineSeries,
  PRINT_COLOR_THEMES,
  PRINT_FONT_STYLES,
} from './round8Features';
import { QuizQuestion } from '../types/laborLaw';

describe('Daily Boss Quiz Streak tracking', () => {
  it('starts a 1-day streak with starter bonus coins on first boss quiz completion', () => {
    const day1 = new Date(2026, 9, 25, 14, 0, 0); // Oct 25, 2026
    const res = recordBossQuizCompletionForDailyStreak(
      DEFAULT_DAILY_BOSS_QUIZ_STREAK_STATE,
      day1
    );
    assert.equal(res.activeStreak, 1);
    assert.equal(res.firstCompletionToday, true);
    assert.equal(res.extendedConsecutiveDay, false);
    assert.equal(res.bonusCoinsAwarded, 15);
    assert.equal(res.nextState.lastCompletedDate, '2026-10-25');
  });

  it('does not double-award streak bonus on a second boss quiz on the same day', () => {
    const day1 = new Date(2026, 9, 25, 14, 0, 0);
    const first = recordBossQuizCompletionForDailyStreak(
      DEFAULT_DAILY_BOSS_QUIZ_STREAK_STATE,
      day1
    );
    const second = recordBossQuizCompletionForDailyStreak(
      first.nextState,
      new Date(2026, 9, 25, 20, 30, 0)
    );
    assert.equal(second.activeStreak, 1);
    assert.equal(second.firstCompletionToday, false);
    assert.equal(second.bonusCoinsAwarded, 0);
    assert.equal(second.nextState.totalBossQuizzesCleared, 2);
  });

  it('increments streak and awards consecutive-day bonus coins on next calendar day, and resets after missed day', () => {
    const day1 = new Date(2026, 9, 25, 10, 0, 0);
    const day2 = new Date(2026, 9, 26, 11, 0, 0);
    const day4AfterGap = new Date(2026, 9, 28, 9, 0, 0);

    const r1 = recordBossQuizCompletionForDailyStreak(
      DEFAULT_DAILY_BOSS_QUIZ_STREAK_STATE,
      day1
    );
    const r2 = recordBossQuizCompletionForDailyStreak(r1.nextState, day2);

    assert.equal(r2.activeStreak, 2);
    assert.equal(r2.extendedConsecutiveDay, true);
    assert.equal(r2.bonusCoinsAwarded, 35);
    assert.equal(r2.nextState.bestStreak, 2);

    const expiredSnap = getActiveDailyBossQuizStreak(r2.nextState, day4AfterGap);
    assert.equal(expiredSnap.activeStreak, 0);
    assert.equal(expiredSnap.completedToday, false);

    const r4 = recordBossQuizCompletionForDailyStreak(r2.nextState, day4AfterGap);
    assert.equal(r4.activeStreak, 1);
    assert.equal(r4.extendedConsecutiveDay, false);
    assert.equal(r4.nextState.bestStreak, 2);
    assert.equal(r4.bonusCoinsAwarded, 15);
  });
});

describe('Targeted Weakness Drill deck builder', () => {
  const samplePool: QuizQuestion[] = [
    {
      id: 1,
      world: 'World 1',
      worldCode: 'w1',
      scenario: 'Employee worked 10 hours on an ordinary day claiming overtime pay.',
      options: ['125%', '130%', '150%', '200%'],
      correctIndex: 0,
      explanation: 'Art. 87 provides +25% overtime pay.',
      legalBasis: 'Art. 87, Labor Code',
    },
    {
      id: 2,
      world: 'World 4',
      worldCode: 'w4',
      scenario: 'Kasambahay completed 1 year of service and requests 5 days leave.',
      options: ['Forfeitable SIL', 'Commutable SIL', '10 days', 'None'],
      correctIndex: 0,
      explanation: 'Under R.A. 10361, Kasambahay 5-day leave is non-cumulative.',
      legalBasis: 'R.A. 10361 (Kasambahay Law)',
    },
    {
      id: 3,
      world: 'World 6',
      worldCode: 'w6',
      scenario: 'Solo parent female employee gives live birth and claims maternity leave.',
      options: ['120 days', '105 days', '60 days', '90 days'],
      correctIndex: 0,
      explanation: '105 days + 15 days under R.A. 11210.',
      legalBasis: 'R.A. 11210',
    },
  ];

  const sampleTopics = [
    {
      id: 'm1-ot',
      title: 'Overtime Work & Art. 87',
      badge: 'Art. 87',
      worldId: 'world1',
    },
    {
      id: 'm4-kasambahay',
      title: 'Kasambahay Domestic Workers',
      badge: 'R.A. 10361',
      worldId: 'world4',
    },
    {
      id: 'm6-maternity',
      title: 'Expanded Maternity Leave',
      badge: 'R.A. 11210',
      worldId: 'world6',
    },
  ];

  it('prioritizes questions matching topics flagged as needs improvement', () => {
    const res = buildTargetedWeaknessDrillDeck({
      pool: samplePool,
      allTopics: sampleTopics,
      needsImprovementTopicIds: ['m4-kasambahay'],
      deckSize: 2,
      rng: () => 0.5,
    });

    assert.equal(res.hasUserFlags, true);
    assert.equal(res.items[0].question.id, 2);
    assert.equal(res.items[0].matchTier, 'exact_topic');
    assert.equal(res.items[0].matchedTopicTitle, 'Kasambahay Domestic Workers');
  });
});

describe('Visual Quiz Result Summary breakdown', () => {
  it('computes per-world right vs wrong counts and accuracy percentages', () => {
    const summary = computeQuizWorldResultSummary([
      { worldCode: 'w1', isCorrect: true },
      { worldCode: 'w1', isCorrect: true },
      { worldCode: 'w1', isCorrect: false },
      { worldCode: 'w3', isCorrect: false },
      { worldCode: 'w6', isCorrect: true },
    ]);

    assert.equal(summary.totalRight, 3);
    assert.equal(summary.totalWrong, 2);
    assert.equal(summary.totalQuestions, 5);
    assert.equal(summary.overallAccuracyPercent, 60);
    assert.equal(summary.rows.length, 3);

    const w1Row = summary.rows.find((r) => r.categoryKey === 'w1');
    assert.ok(w1Row);
    assert.equal(w1Row.rightCount, 2);
    assert.equal(w1Row.wrongCount, 1);
    assert.equal(w1Row.accuracyPercent, 67);
    assert.equal(summary.strongestCategory?.categoryKey, 'w6');
    assert.equal(summary.weakestCategory?.categoryKey, 'w3');
  });
});

describe('Global mute shortcut, Recently Viewed, Sparkline & Print catalogs', () => {
  it('guards M shortcut against text inputs and modifier keys', () => {
    assert.equal(shouldTriggerGlobalMuteShortcut({ key: 'm', targetTagName: 'BODY' }), true);
    assert.equal(shouldTriggerGlobalMuteShortcut({ key: 'M', targetTagName: 'BUTTON' }), true);
    assert.equal(shouldTriggerGlobalMuteShortcut({ key: 'm', ctrlKey: true, targetTagName: 'BODY' }), false);
    assert.equal(shouldTriggerGlobalMuteShortcut({ key: 'm', targetTagName: 'INPUT' }), false);
    assert.equal(
      shouldTriggerGlobalMuteShortcut({ key: 'm', targetTagName: 'DIV', targetIsContentEditable: true }),
      false
    );
  });

  it('tracks last 5 unique recently viewed topics in most-recent-first order', () => {
    const valid = new Set(['t1', 't2', 't3', 't4', 't5', 't6']);
    let list: string[] = [];
    for (const id of ['t1', 't2', 't3', 't4', 't5', 't6']) {
      list = recordRecentlyViewedTopic(list, id, valid);
    }
    assert.deepEqual(list, ['t6', 't5', 't4', 't3', 't2']);
    list = recordRecentlyViewedTopic(list, 't4', valid);
    assert.deepEqual(list, ['t4', 't6', 't5', 't3', 't2']);
  });

  it('builds a 7-day completed topics sparkline series with delta and valid SVG points', () => {
    const today = new Date(2026, 9, 31, 12, 0, 0);
    let hist = syncCompletedTopicsDailyHistory(
      { '2026-10-25': 2, '2026-10-28': 5 },
      9,
      today
    );
    const series = buildCompletedTopicsSparklineSeries({
      history: hist,
      currentCompletedCount: 9,
      totalTopicsCount: 28,
      now: today,
    });
    assert.equal(series.points.length, 7);
    assert.equal(series.points[0].count, 2);
    assert.equal(series.points[3].count, 5);
    assert.equal(series.points[6].count, 9);
    assert.equal(series.delta7d, 7);
    assert.ok(series.polylinePoints.length > 10);
  });

  it('exposes 12 distinct Print Studio themes and 12 distinct font styles', () => {
    assert.equal(PRINT_COLOR_THEMES.length, 12);
    assert.equal(PRINT_FONT_STYLES.length, 12);
  });
});
