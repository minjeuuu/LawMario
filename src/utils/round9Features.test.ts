import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_LAW_TOPICS } from '../data/laborLawData';
import { PRACTICE_QUESTIONS } from '../data/quizQuestionsData';
import { DAILY_CHALLENGE_BANK } from '../data/dailyChallengesData';
import {
  computeTopicSectionProgress,
  toggleTopicSectionMastered,
  getTopicSubSectionDescriptors,
  togglePinnedRuleBookmark,
  makeRuleItemBookmarkId,
  generateTopicQuickQuiz,
  recordQuickQuizLogEntry,
  computeGoalStreakAndWeeklyConsistency,
  recordCoinDeltaInLedger,
  build30DayCoinVaultSeries,
  build30DayStudyIntensitySeries,
  build30DayCompletionSparklineSeries,
  advanceFlashcardMasteryTier,
  computeQuizSkillBreakdown,
  computeBarMasterRankProgress,
  buildMissedTopicsStudySummary,
  computeQuizLeaderboardEntries,
} from './round9Features';

test('Topic sub-section progress computes accurate XP percentage and honors full completion', () => {
  const sampleTopic = ALL_LAW_TOPICS[0];
  const descriptors = getTopicSubSectionDescriptors(sampleTopic);
  assert.ok(descriptors.length >= 2);

  let map = {};
  const initProg = computeTopicSectionProgress(sampleTopic, map, false);
  assert.equal(initProg.completedSections, 0);
  assert.equal(initProg.percent, 0);

  const toggled = toggleTopicSectionMastered(map, sampleTopic.id, descriptors[0].key);
  map = toggled.nextMap;
  assert.equal(toggled.isNowMastered, true);

  const partialProg = computeTopicSectionProgress(sampleTopic, map, false);
  assert.equal(partialProg.completedSections, 1);
  assert.equal(partialProg.percent, Math.round((1 / descriptors.length) * 100));

  const fullProg = computeTopicSectionProgress(sampleTopic, map, true);
  assert.equal(fullProg.completedSections, descriptors.length);
  assert.equal(fullProg.percent, 100);
});

test('Pinned rule-item bookmarking toggles cleanly for Quick Review', () => {
  const id = makeRuleItemBookmarkId('w1_hours_exclusions', 0, 1);
  const res1 = togglePinnedRuleBookmark([], {
    id,
    topicId: 'w1_hours_exclusions',
    topicTitle: 'Hours of Work Exclusions',
    topicBadge: 'Art. 82',
    worldId: 'world1',
    ruleHeading: 'Exempt Employees',
    itemText: 'Managerial employees and field personnel are exempt from Book III Title I.',
  });
  assert.equal(res1.pinned, true);
  assert.equal(res1.nextItems.length, 1);

  const res2 = togglePinnedRuleBookmark(res1.nextItems, {
    id,
    topicId: 'w1_hours_exclusions',
    topicTitle: 'Hours of Work Exclusions',
    topicBadge: 'Art. 82',
    worldId: 'world1',
    ruleHeading: 'Exempt Employees',
    itemText: 'Managerial employees and field personnel are exempt from Book III Title I.',
  });
  assert.equal(res2.pinned, false);
  assert.equal(res2.nextItems.length, 0);
});

test('Topic 3-question Quick Quiz generator produces 3 valid questions and logs entries', () => {
  const sampleTopic = ALL_LAW_TOPICS[2];
  const miniQuiz = generateTopicQuickQuiz({
    topic: sampleTopic,
    questionPool: PRACTICE_QUESTIONS,
    allTopics: ALL_LAW_TOPICS,
  });
  assert.equal(miniQuiz.length, 3);
  for (const q of miniQuiz) {
    assert.equal(q.options.length, 4);
    assert.ok(q.correctIndex >= 0 && q.correctIndex <= 3);
    assert.ok(q.legalBasis.length > 0);
  }

  const log = recordQuickQuizLogEntry([], {
    topicId: sampleTopic.id,
    topicTitle: sampleTopic.title,
    topicBadge: sampleTopic.badge,
    worldId: sampleTopic.worldId,
    score: 2,
    totalQuestions: 3,
    durationSeconds: 42,
    missedPoints: ['Art. 87 Overtime'],
  });
  assert.equal(log.length, 1);
  assert.equal(log[0].percent, 67);
});

test('Daily Bar Challenge bank varies correctIndex across A/B/C/D and avoids length giveaways', () => {
  const seenIndices = new Set<number>();
  for (const sc of DAILY_CHALLENGE_BANK) {
    seenIndices.add(sc.correctIndex);
    const correctLen = sc.options[sc.correctIndex].length;
    const maxDistractorLen = Math.max(
      ...sc.options.filter((_, idx) => idx !== sc.correctIndex).map((o) => o.length)
    );
    // Distractors should be substantive statutory statements, never 3x shorter than correct option
    assert.ok(
      correctLen < maxDistractorLen * 1.55,
      `Scenario ${sc.id} correct option (${correctLen}) is disproportionately longer than distractors (${maxDistractorLen})`
    );
  }
  assert.deepEqual(Array.from(seenIndices).sort(), [0, 1, 2, 3]);
});

test('Goal Streak and Weekly Consistency compute consecutive days and 7-day ratio', () => {
  const now = new Date(2026, 4, 10, 12, 0, 0);
  const logs = {
    '2026-05-08': { sessions: 1, minutes: 35 },
    '2026-05-09': { sessions: 2, minutes: 45 },
    '2026-05-10': { sessions: 1, minutes: 30 },
  };
  const snap = computeGoalStreakAndWeeklyConsistency({
    dailyPomodoroLogs: logs,
    dailyGoalMinutes: 30,
    todayStudiedSeconds: 1800,
    now,
  });
  assert.equal(snap.goalStreakDays, 3);
  assert.equal(snap.goalMetToday, true);
  assert.equal(snap.weeklyStudiedMinutes, 110);
  assert.equal(snap.weeklyTargetMinutes, 210);
  assert.equal(snap.weeklyConsistencyPercent, 52);
});

test('30-Day Recharts series builders return 30 chronological points with Earned vs Spent ledger', () => {
  const now = new Date(2026, 4, 15, 10, 0, 0);
  let ledger = recordCoinDeltaInLedger({}, 120, new Date(2026, 4, 14, 10, 0, 0));
  ledger = recordCoinDeltaInLedger(ledger, -80, new Date(2026, 4, 15, 9, 0, 0));
  ledger = recordCoinDeltaInLedger(ledger, 50, new Date(2026, 4, 15, 9, 30, 0));

  const coinSeries = build30DayCoinVaultSeries({ ledger, currentCoins: 90, now });
  assert.equal(coinSeries.length, 30);
  assert.equal(coinSeries[29].totalEarned, 170);
  assert.equal(coinSeries[29].totalSpent, 80);

  const studySeries = build30DayStudyIntensitySeries({
    dailyPomodoroLogs: { '2026-05-15': { sessions: 2, minutes: 50 } },
    todayStudiedSeconds: 3000,
    now,
  });
  assert.equal(studySeries.length, 30);
  assert.equal(studySeries[29].minutes, 50);

  const compSeries = build30DayCompletionSparklineSeries({
    history: { '2026-05-10': 5 },
    currentCompletedCount: 9,
    now,
  });
  assert.equal(compSeries.length, 30);
  assert.equal(compSeries[29].completedTopics, 9);
});

test('Flashcard Mastery Tier advances and Quiz Analytics / Leaderboard rank accurately', () => {
  assert.equal(advanceFlashcardMasteryTier('learning'), 'reviewing');
  assert.equal(advanceFlashcardMasteryTier('reviewing'), 'mastered');
  assert.equal(advanceFlashcardMasteryTier('mastered'), 'mastered');

  const breakdown = computeQuizSkillBreakdown([
    { worldCode: 'w1', isCorrect: true },
    { worldCode: 'w1', isCorrect: false },
    { worldCode: 'w6', isCorrect: true },
  ]);
  assert.equal(breakdown.length, 2);
  assert.equal(breakdown[0].accuracyPercent, 50);
  assert.equal(breakdown[1].accuracyPercent, 100);

  const rank = computeBarMasterRankProgress({
    quizHistory: [
      {
        id: '1',
        timestamp: '',
        formattedDate: '',
        topicOrWorld: 'Boss',
        worldCode: 'boss',
        correctCount: 45,
        totalCount: 50,
        scorePercent: 90,
        isPerfect: false,
      },
    ],
  });
  assert.equal(rank.currentRankTitle, 'NLRC Arbiter Scholar');

  const summary = buildMissedTopicsStudySummary([
    {
      scenario: 'Holiday pay trap',
      correctOptionText: '200% Regular Holiday rate',
      legalBasis: 'Art. 94, Labor Code',
      explanation: 'Worked regular holiday pays 200%.',
    },
  ]);
  assert.equal(summary.bulletCount, 1);

  const board = computeQuizLeaderboardEntries({
    playerName: 'Atty. Mario',
    equippedAvatar: 'mario',
    quizHistory: [
      {
        id: 'q1',
        timestamp: '',
        formattedDate: '',
        topicOrWorld: 'Boss',
        worldCode: 'boss',
        correctCount: 170,
        totalCount: 180,
        scorePercent: 94,
        isPerfect: false,
      },
    ],
    equippedCartridgeBadge: '1985 Championship Gold Cart',
  });
  assert.equal(board[0].isCurrentUser, true);
  assert.equal(board[0].rank, 1);
});
