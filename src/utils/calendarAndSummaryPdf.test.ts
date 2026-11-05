import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMonthlyStudyCalendar,
  DEFAULT_PLAYER_PROFILE_STATS,
  PlayerProfileStats,
} from './profileAchievements';
import {
  ONE_PAGE_LEGAL_FORMULAS,
  ONE_PAGE_LEGAL_DEADLINES,
  ONE_PAGE_STATUTORY_LEAVE_CAPS,
} from './onePageSummaryData';
import {
  buildOnePageSummaryPdfBytes,
  buildCertificateLandscapePdfBytes,
  buildStudyGuideReviewerPdfBytes,
  buildScoreCardLandscapePdfBytes,
} from './pdfExportService';
import { ALL_LAW_TOPICS } from '../data/laborLawData';
import {
  HAMMER_BROS_PAYROLL_BANK,
  TOADETTE_DUE_PROCESS_CASES,
  SHY_GUY_CONVEYOR_BANK,
  KAMEK_DEADLINE_SPELLS,
} from '../components/BonusVaultGames';

test('buildMonthlyStudyCalendar tracks daily study streaks and completed goal days accurately', () => {
  const stats: PlayerProfileStats = {
    ...DEFAULT_PLAYER_PROFILE_STATS,
    dailyPomodoroLogs: {
      '2026-10-12': { sessions: 1, minutes: 30, activeSeconds: 1800 }, // completes 25m goal
      '2026-10-13': { sessions: 0, minutes: 10, activeSeconds: 600 }, // active + streak, < 25m goal
      '2026-10-14': { sessions: 1, minutes: 26, activeSeconds: 1560 }, // completes 25m goal + streak
      '2026-10-15': { sessions: 1, minutes: 45, activeSeconds: 2700 }, // today, completes 25m goal + streak
    },
  };

  const refDate = new Date(2026, 9, 15, 14, 0, 0);
  const cal = buildMonthlyStudyCalendar({
    stats,
    year: 2026,
    month: 9, // October (0-indexed)
    dailyGoalTarget: 25,
    loginStreak: 3, // Oct 15, Oct 14, Oct 13
    referenceToday: refDate,
  });

  assert.equal(cal.monthLabel, 'October 2026');
  assert.equal(cal.cells.length, 31);
  assert.equal(cal.activeDaysCount, 4);
  assert.equal(cal.completedGoalDaysCount, 3); // Oct 12, Oct 14, Oct 15
  assert.equal(cal.streakDaysInMonth, 3); // Oct 13, Oct 14, Oct 15

  const oct12 = cal.cells.find((d) => d.dateKey === '2026-10-12');
  const oct13 = cal.cells.find((d) => d.dateKey === '2026-10-13');
  const oct15 = cal.cells.find((d) => d.dateKey === '2026-10-15');
  const oct20 = cal.cells.find((d) => d.dateKey === '2026-10-20');

  assert.ok(oct12 && oct13 && oct15 && oct20);
  assert.equal(oct12.isGoalCompleted, true);
  assert.equal(oct12.isStreakDay, false);

  assert.equal(oct13.isGoalCompleted, false);
  assert.equal(oct13.isStreakDay, true);
  assert.equal(oct13.hasActivity, true);

  assert.equal(oct15.isToday, true);
  assert.equal(oct15.isGoalCompleted, true);
  assert.equal(oct15.isStreakDay, true);

  assert.equal(oct20.isFuture, true);
  assert.equal(oct20.isGoalCompleted, false);
});

test('One-Page Summary data compiles complete formulas, statutory deadlines, and leave caps', () => {
  assert.equal(ONE_PAGE_LEGAL_FORMULAS.length, 13);
  assert.equal(ONE_PAGE_LEGAL_DEADLINES.length, 14);
  assert.equal(ONE_PAGE_STATUTORY_LEAVE_CAPS.length, 6);

  for (const f of ONE_PAGE_LEGAL_FORMULAS) {
    assert.ok(f.title.length > 0 && f.formula.length > 0 && f.citation.length > 0);
  }
  for (const d of ONE_PAGE_LEGAL_DEADLINES) {
    assert.ok(d.claimOrAction.length > 0 && d.deadline.length > 0 && d.citation.length > 0);
  }
});

test('Direct A4 PDF builders produce valid PDF byte streams and One-Page Summary fits strictly on 1 page', () => {
  const summaryBytes = buildOnePageSummaryPdfBytes({
    candidateName: 'Atty. Maria Clara',
    dateLabel: 'October 31, 2026',
  });
  const summaryAscii = new TextDecoder('latin1').decode(summaryBytes);
  assert.ok(summaryAscii.startsWith('%PDF-'), 'One-Page Summary must start with %PDF-');
  const pageCountMatches = summaryAscii.match(/\/Type\s*\/Page\b/g) || [];
  assert.equal(
    pageCountMatches.length,
    1,
    'One-Page A4 Summary PDF must fit strictly on 1 single page'
  );

  const certBytes = buildCertificateLandscapePdfBytes({
    recipientName: 'Atty. Jose Rizal',
    honors: 'Summa Cum Laude • Super Star Rank',
    completedCount: ALL_LAW_TOPICS.length,
    totalCount: ALL_LAW_TOPICS.length,
    dateLabel: 'October 31, 2026',
  });
  const certAscii = new TextDecoder('latin1').decode(certBytes);
  assert.ok(certAscii.startsWith('%PDF-'), 'Landscape Certificate must start with %PDF-');
  assert.equal(
    (certAscii.match(/\/Type\s*\/Page\b/g) || []).length,
    1,
    'Certificate PDF must fit on 1 landscape page'
  );

  const reviewerBytes = buildStudyGuideReviewerPdfBytes({
    orientation: 'portrait',
    candidateName: 'Bar Candidate',
    completedTopicIds: [ALL_LAW_TOPICS[0].id],
    topics: ALL_LAW_TOPICS.slice(0, 3),
    selectedWorlds: ['world-1'],
    includeGroupMembers: true,
    includeProgress: true,
    includeMultipliers: true,
    includeRegionalWages: true,
    includeLeavesMatrix: true,
    includePersonalNotes: false,
    includeBarTips: true,
    includeLegalCitations: true,
    matricesOnlyMode: false,
    studyNotes: [],
  });
  assert.ok(new TextDecoder('latin1').decode(reviewerBytes).startsWith('%PDF-'));

  const scoreBytes = buildScoreCardLandscapePdfBytes({
    playerName: 'Counsel Hero',
    heroName: 'Super Mario',
    heroRank: 'Labor Law Legend',
    coins: 500,
    loginStreak: 7,
    completedCount: 15,
    totalTopics: ALL_LAW_TOPICS.length,
    studyDurationFormatted: '3h 20m',
    unlockedAchievementsCount: 8,
    totalAchievementsCount: 18,
    quizRunsCompleted: 6,
    worldBreakdown: [
      { worldNumber: 1, shortTitle: 'Hours of Work', completed: 4, total: 4, percent: 100 },
      { worldNumber: 2, shortTitle: 'Rest & Holidays', completed: 3, total: 4, percent: 75 },
    ],
  });
  assert.ok(new TextDecoder('latin1').decode(scoreBytes).startsWith('%PDF-'));
});

test('4 new Bonus Vault Arcade Games expose complete Philippine Labor Law doctrine decks', () => {
  assert.ok(HAMMER_BROS_PAYROLL_BANK.length >= 10);
  assert.ok(TOADETTE_DUE_PROCESS_CASES.length >= 5);
  assert.ok(SHY_GUY_CONVEYOR_BANK.length >= 8);
  assert.ok(KAMEK_DEADLINE_SPELLS.length >= 8);
});
