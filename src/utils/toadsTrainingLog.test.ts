import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatToadDateKey,
  buildToadTrainingDataSeries,
  computeWeeklyTrainingSummary,
} from './toadsTrainingLog';

test('toadsTrainingLog: formats Date to YYYY-MM-DD correctly', () => {
  const d = new Date(2026, 10, 5); // Month is 0-indexed: 10 = Nov
  assert.equal(formatToadDateKey(d), '2026-11-05');
});

test('toadsTrainingLog: builds 7-day data series with proper structure and isToday flag', () => {
  const refDate = new Date(2026, 10, 5);
  const series = buildToadTrainingDataSeries({
    dayCount: 7,
    referenceDate: refDate,
    profileStats: {
      playerName: 'Mario Scholar',
      studiedSeconds: 3600,
      pomodoroSessionsCompleted: 4,
      quizzesCompleted: 5,
      perfectWageQuizzes: 1,
      bestWageQuizPercent: 100,
      perfectAnyQuizzes: 2,
      bossVictories: 1,
      walkthroughCompleted: true,
      unlockedAchievementDates: {},
      dailyPomodoroLogs: {
        '2026-11-05': { sessions: 2, minutes: 50 },
        '2026-11-04': { sessions: 1, minutes: 25 },
      },
      quizHistory: [
        {
          id: 'q1',
          timestamp: '2026-11-05T08:00:00Z',
          formattedDate: 'Nov 5',
          topicOrWorld: 'World 1',
          worldCode: 'm1',
          correctCount: 4,
          totalCount: 5,
          scorePercent: 80,
          isPerfect: false,
        },
      ],
    },
  });

  assert.equal(series.length, 7);
  const todayPt = series[series.length - 1];
  assert.equal(todayPt.dateKey, '2026-11-05');
  assert.equal(todayPt.isToday, true);
  assert.equal(todayPt.studyMinutes, 50);
  assert.equal(todayPt.quizzesAttempted, 1);
  assert.equal(todayPt.quizCompletionRate, 100);
});

test('toadsTrainingLog: computes weekly summary and assigns rank title and guidance', () => {
  const refDate = new Date(2026, 10, 5);
  const series = buildToadTrainingDataSeries({
    dayCount: 7,
    referenceDate: refDate,
    profileStats: {
      playerName: 'Mario Scholar',
      studiedSeconds: 20000,
      pomodoroSessionsCompleted: 10,
      quizzesCompleted: 10,
      perfectWageQuizzes: 5,
      bestWageQuizPercent: 100,
      perfectAnyQuizzes: 5,
      bossVictories: 3,
      walkthroughCompleted: true,
      unlockedAchievementDates: {},
      dailyPomodoroLogs: {
        '2026-11-05': { sessions: 3, minutes: 75 },
        '2026-11-04': { sessions: 3, minutes: 75 },
        '2026-11-03': { sessions: 3, minutes: 75 },
        '2026-11-02': { sessions: 4, minutes: 100 },
      },
    },
  });

  const summary = computeWeeklyTrainingSummary(series);
  assert.equal(summary.rangeDays, 7);
  assert.ok(summary.totalStudyMinutes >= 325);
  assert.ok(summary.dailyAverageMinutes > 0);
  assert.ok(summary.toadRankTitle.includes('Toad'));
  assert.ok(summary.toadProTip.includes("Toad's Pro-Tip:"));
});
