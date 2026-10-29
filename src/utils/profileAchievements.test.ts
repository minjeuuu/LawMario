import test from 'node:test';
import assert from 'node:assert/strict';
import {
  readStoredColorMode,
  saveStoredColorMode,
  shouldAutoOpenWalkthrough,
  markWalkthroughCompleted,
  DEFAULT_PLAYER_PROFILE_STATS,
  loadPlayerProfileStats,
  recordStudySeconds,
  recordPomodoroFocusFinish,
  recordCompletedQuizRun,
  formatStudyDuration,
  evaluateAchievements,
  WALKTHROUGH_CHAPTERS,
  getWeeklyPomodoroChartData,
} from './profileAchievements';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

test('color mode reads and persists light and dark modes accurately', () => {
  const storage = createMemoryStorage();
  assert.equal(readStoredColorMode(storage), 'light');
  saveStoredColorMode('dark', storage);
  assert.equal(readStoredColorMode(storage), 'dark');
  saveStoredColorMode('light', storage);
  assert.equal(readStoredColorMode(storage), 'light');
});

test('walkthrough auto-opens on first visit, respects ?autostart=1, and stays closed once completed', () => {
  const storage = createMemoryStorage();
  assert.equal(shouldAutoOpenWalkthrough('', storage), true);
  assert.equal(shouldAutoOpenWalkthrough('?autostart=1', storage), false);

  markWalkthroughCompleted(storage);
  assert.equal(shouldAutoOpenWalkthrough('', storage), false);
});

test('10-chapter walkthrough guide has complete ordered steps', () => {
  assert.equal(WALKTHROUGH_CHAPTERS.length, 10);
  WALKTHROUGH_CHAPTERS.forEach((ch, idx) => {
    assert.equal(ch.stepNumber, idx + 1);
    assert.ok(ch.headline.length > 10);
    assert.ok(ch.highlights.length >= 3);
  });
});

test('study time formatting and accumulation unlock Studied 5 hours badge at 18000 seconds', () => {
  let stats = { ...DEFAULT_PLAYER_PROFILE_STATS };
  assert.equal(formatStudyDuration(0), '0m');
  assert.equal(formatStudyDuration(45), '45s');
  assert.equal(formatStudyDuration(1500), '25m');
  assert.equal(formatStudyDuration(3900), '1h 05m');
  assert.equal(formatStudyDuration(18000), '5h 00m');

  stats = recordStudySeconds(stats, 3600); // 1 hour
  stats = recordPomodoroFocusFinish(stats, 0);

  let eval1 = evaluateAchievements({
    stats,
    completedTopicIds: [],
    totalTopicsCount: 14,
    world1TopicIds: ['t1', 't2', 't3'],
    loginStreak: 1,
    notesCount: 0,
  });

  const oneHourBadge = eval1.achievements.find((a) => a.id === 'studied_1_hour')!;
  const fiveHourBadge = eval1.achievements.find((a) => a.id === 'studied_5_hours')!;
  const firstPomodoroBadge = eval1.achievements.find((a) => a.id === 'first_pomodoro')!;

  assert.equal(oneHourBadge.unlocked, true);
  assert.equal(firstPomodoroBadge.unlocked, true);
  assert.equal(fiveHourBadge.unlocked, false);
  assert.equal(fiveHourBadge.progressPercent, 20);

  // Add remaining 4 hours (14,400 seconds)
  stats = recordStudySeconds(eval1.updatedStats, 14400);
  const eval2 = evaluateAchievements({
    stats,
    completedTopicIds: [],
    totalTopicsCount: 14,
    world1TopicIds: ['t1', 't2', 't3'],
    loginStreak: 1,
    notesCount: 0,
  });

  const fiveHourAfter = eval2.achievements.find((a) => a.id === 'studied_5_hours')!;
  assert.equal(fiveHourAfter.unlocked, true);
  assert.equal(fiveHourAfter.progressPercent, 100);
  assert.equal(
    eval2.newlyUnlocked.some((b) => b.id === 'studied_5_hours'),
    true
  );
});

test('quiz runs track Completed 10 Quizzes and Perfect score on Wage Quiz accurately', () => {
  let stats = { ...DEFAULT_PLAYER_PROFILE_STATS };

  // Non-perfect World 3 Wage Quiz (4/5 = 80%)
  stats = recordCompletedQuizRun(stats, {
    worldCode: 'W3',
    correctCount: 4,
    totalCount: 5,
  });
  assert.equal(stats.quizzesCompleted, 1);
  assert.equal(stats.perfectWageQuizzes, 0);
  assert.equal(stats.bestWageQuizPercent, 80);

  // Perfect World 1 Quiz (5/5) should NOT unlock Wage Quiz badge
  stats = recordCompletedQuizRun(stats, {
    worldCode: 'W1',
    correctCount: 5,
    totalCount: 5,
  });
  assert.equal(stats.perfectAnyQuizzes, 1);
  assert.equal(stats.perfectWageQuizzes, 0);

  // Perfect World 3 Wage Quiz (5/5) unlocks Perfect score on Wage Quiz
  stats = recordCompletedQuizRun(stats, {
    worldCode: 'world3',
    correctCount: 5,
    totalCount: 5,
  });
  assert.equal(stats.perfectWageQuizzes, 1);
  assert.equal(stats.bestWageQuizPercent, 100);

  // Complete 7 more quizzes to reach 10 total quizzes
  for (let i = 0; i < 7; i++) {
    stats = recordCompletedQuizRun(stats, {
      worldCode: 'all',
      correctCount: 3,
      totalCount: 5,
    });
  }
  assert.equal(stats.quizzesCompleted, 10);

  const result = evaluateAchievements({
    stats,
    completedTopicIds: ['t1', 't2', 't3'],
    totalTopicsCount: 14,
    world1TopicIds: ['t1', 't2', 't3'],
    loginStreak: 3,
    notesCount: 3,
  });

  const tenQuizzes = result.achievements.find((a) => a.id === 'completed_10_quizzes')!;
  const perfectWage = result.achievements.find((a) => a.id === 'perfect_wage_quiz')!;
  const world1Master = result.achievements.find((a) => a.id === 'world_1_master')!;
  const streak3 = result.achievements.find((a) => a.id === 'streak_3_days')!;
  const noteCrafter = result.achievements.find((a) => a.id === 'note_crafter')!;

  assert.equal(tenQuizzes.unlocked, true);
  assert.equal(perfectWage.unlocked, true);
  assert.equal(world1Master.unlocked, true);
  assert.equal(streak3.unlocked, true);
  assert.equal(noteCrafter.unlocked, true);
});

test('loadPlayerProfileStats hydrates legacy pomodoro sessions cleanly', () => {
  const storage = createMemoryStorage({
    mario_pomodoro_completed_sessions_v1: '4',
    mario_walkthrough_completed_v1: 'true',
  });
  const loaded = loadPlayerProfileStats(storage);
  assert.equal(loaded.pomodoroSessionsCompleted, 4);
  assert.equal(loaded.studiedSeconds, 4 * 25 * 60);
  assert.equal(loaded.walkthroughCompleted, true);
});

test('getWeeklyPomodoroChartData returns 7 days of structured data with today flagged', () => {
  const refDate = new Date('2026-10-25T12:00:00Z');
  let stats = { ...DEFAULT_PLAYER_PROFILE_STATS };
  stats = recordPomodoroFocusFinish(stats, 25);
  stats = recordPomodoroFocusFinish(stats, 25);

  const chartData = getWeeklyPomodoroChartData(stats, refDate);
  assert.equal(chartData.length, 7);
  const todayEntry = chartData.find((d) => d.isToday);
  assert.ok(todayEntry);
  assert.equal(todayEntry.sessions, 2);
  assert.equal(todayEntry.minutes, 50);
});

test('Quiz History tracking stores up to 15 entries in reverse chronological order and records topicTitle, scorePercent, and badges', () => {
  let stats = { ...DEFAULT_PLAYER_PROFILE_STATS };

  // 1. Record a specific topic quiz run
  stats = recordCompletedQuizRun(stats, {
    worldCode: 'W1',
    topicTitle: 'Art. 83 Normal Hours of Work & 40-Hour Health Exception',
    correctCount: 4,
    totalCount: 5,
  });

  assert.equal(stats.quizHistory?.length, 1);
  const first = stats.quizHistory![0];
  assert.equal(first.topicOrWorld, 'Art. 83 Normal Hours of Work & 40-Hour Health Exception');
  assert.equal(first.scorePercent, 80);
  assert.equal(first.correctCount, 4);
  assert.equal(first.totalCount, 5);
  assert.equal(first.isPerfect, false);
  assert.equal(first.isBossVictory, false);
  assert.ok(first.formattedDate.length > 5);

  // 2. Record a Bowser Boss Battle victory
  stats = recordCompletedQuizRun(stats, {
    worldCode: 'boss',
    correctCount: 10,
    totalCount: 10,
    isBossVictory: true,
  });

  assert.equal(stats.quizHistory?.length, 2);
  const bossRun = stats.quizHistory![0]; // most recent is at index 0
  assert.equal(bossRun.isBossVictory, true);
  assert.equal(bossRun.isPerfect, true);
  assert.equal(bossRun.scorePercent, 100);

  // 3. Overflow test: add 16 more quiz runs to verify truncation to 15 records
  for (let i = 1; i <= 16; i++) {
    stats = recordCompletedQuizRun(stats, {
      worldCode: `W${(i % 6) + 1}`,
      correctCount: 3,
      totalCount: 5,
    });
  }

  assert.equal(stats.quizHistory?.length, 15);
});

test('loadPlayerProfileStats hydrates persisted quizHistory records from storage correctly', () => {
  const sampleHistory = [
    {
      id: 'quiz-1',
      timestamp: '2026-10-25T10:00:00.000Z',
      formattedDate: 'Oct 25, 2026, 6:00 PM',
      topicOrWorld: 'World 3: Wages & Wage Protection',
      worldCode: 'W3',
      correctCount: 5,
      totalCount: 5,
      scorePercent: 100,
      isPerfect: true,
      isBossVictory: false,
    },
  ];

  const storage = createMemoryStorage({
    mario_player_profile_stats_v1: JSON.stringify({
      ...DEFAULT_PLAYER_PROFILE_STATS,
      quizHistory: sampleHistory,
    }),
  });

  const loaded = loadPlayerProfileStats(storage);
  assert.equal(loaded.quizHistory?.length, 1);
  assert.equal(loaded.quizHistory![0].topicOrWorld, 'World 3: Wages & Wage Protection');
  assert.equal(loaded.quizHistory![0].scorePercent, 100);
});

test('Weekly bar graph advances cleanly across calendar days, logs active study minutes, and supports weekOffset navigation', async () => {
  const { getTodayStudiedSeconds } = await import('./profileAchievements');

  let stats = { ...DEFAULT_PLAYER_PROFILE_STATS };

  // Day 1 (Oct 26): complete 2 Pomodoros
  stats = recordPomodoroFocusFinish(stats, 0, '2026-10-26');
  stats = recordPomodoroFocusFinish(stats, 0, '2026-10-26');

  // Check chart on Oct 28 (2 days later) with NO activity on Oct 27 or Oct 28 yet:
  // Bars must NOT freeze at synthetic [1, 2, 2] — Oct 26 has 2 sessions (50m), Oct 27 & Oct 28 have 0!
  const oct28Ref = new Date(2026, 9, 28, 14, 0, 0);
  const chartOct28Before = getWeeklyPomodoroChartData(stats, oct28Ref, 0);
  assert.equal(chartOct28Before.length, 7);

  const oct26Bar = chartOct28Before.find((d) => d.dateKey === '2026-10-26')!;
  const oct27Bar = chartOct28Before.find((d) => d.dateKey === '2026-10-27')!;
  const oct28Bar = chartOct28Before.find((d) => d.dateKey === '2026-10-28')!;

  assert.equal(oct26Bar.sessions, 2);
  assert.equal(oct26Bar.minutes, 50);
  assert.equal(oct26Bar.isToday, false);
  assert.equal(oct26Bar.shortDate, '10/26');

  assert.equal(oct27Bar.sessions, 0);
  assert.equal(oct27Bar.minutes, 0);

  assert.equal(oct28Bar.sessions, 0);
  assert.equal(oct28Bar.minutes, 0);
  assert.equal(oct28Bar.isToday, true);
  assert.equal(oct28Bar.shortDate, '10/28');
  assert.equal(getTodayStudiedSeconds(stats, '2026-10-28'), 0);

  // Now study actively for 180 seconds (3 minutes) on Oct 28 without finishing a 25m Pomodoro
  stats = recordStudySeconds(stats, 180, '2026-10-28');
  const chartOct28After = getWeeklyPomodoroChartData(stats, oct28Ref, 0);
  const oct28Updated = chartOct28After.find((d) => d.dateKey === '2026-10-28')!;
  assert.equal(oct28Updated.minutes, 3);
  assert.equal(oct28Updated.activeSeconds, 180);
  assert.equal(getTodayStudiedSeconds(stats, '2026-10-28'), 180);

  // Step 1 week back (weekOffset = -1): window ends Oct 21, none marked isToday
  const prevWeekChart = getWeeklyPomodoroChartData(stats, oct28Ref, -1);
  assert.equal(prevWeekChart.length, 7);
  assert.equal(prevWeekChart[6].dateKey, '2026-10-21');
  assert.equal(prevWeekChart.some((d) => d.isToday), false);
});

test('Thematic World Mastery Badges unlock per world (Overtime Guru, Wage Expert, etc.) and compute accurate per-world progress', async () => {
  const { computeWorldMasteryBadges, WORLD_THEMATIC_BADGE_META } = await import(
    './profileAchievements'
  );

  assert.equal(WORLD_THEMATIC_BADGE_META.length, 6);
  const titles = WORLD_THEMATIC_BADGE_META.map((b) => b.badgeTitle);
  assert.ok(titles.includes('Overtime Guru'));
  assert.ok(titles.includes('Wage Expert'));
  assert.ok(titles.includes('Holiday & 13th Month Maven'));
  assert.ok(titles.includes('Special Groups Protector'));
  assert.ok(titles.includes('Tenure & Safety Guardian'));
  assert.ok(titles.includes('Statutory Leave Specialist'));

  const mockTopics = [
    { id: 'w1-a', worldId: 'world1' },
    { id: 'w1-b', worldId: 'world1' },
    { id: 'w2-a', worldId: 'world2' },
    { id: 'w3-a', worldId: 'world3' },
    { id: 'w3-b', worldId: 'world3' },
    { id: 'w4-a', worldId: 'world4' },
    { id: 'w5-a', worldId: 'world5' },
    { id: 'w6-a', worldId: 'world6' },
  ];

  const topicsByWorld: Record<string, string[]> = {
    world1: ['w1-a', 'w1-b'],
    world2: ['w2-a'],
    world3: ['w3-a', 'w3-b'],
    world4: ['w4-a'],
    world5: ['w5-a'],
    world6: ['w6-a'],
  };

  // Complete all of World 1 and World 3, partial nothing else
  const completedTopicIds = ['w1-a', 'w1-b', 'w3-a', 'w3-b'];
  const evalRes = evaluateAchievements(
    {
      stats: DEFAULT_PLAYER_PROFILE_STATS,
      completedTopicIds,
      totalTopicsCount: mockTopics.length,
      world1TopicIds: topicsByWorld.world1,
      topicsByWorld,
      loginStreak: 1,
      notesCount: 0,
    },
    'Oct 28, 2026'
  );

  const newlyUnlockedIds = evalRes.newlyUnlocked.map((a) => a.id);
  assert.ok(newlyUnlockedIds.includes('world_1_master'), 'Overtime Guru should unlock');
  assert.ok(newlyUnlockedIds.includes('world_3_master'), 'Wage Expert should unlock');
  assert.ok(!newlyUnlockedIds.includes('world_2_master'), 'World 2 should remain locked');
  assert.equal(evalRes.totalBonusCoinsEarned, 35 + 40);

  const badges = computeWorldMasteryBadges(
    ['w1-a', 'w1-b', 'w3-a'],
    mockTopics,
    evalRes.updatedStats.unlockedAchievementDates
  );
  assert.equal(badges.length, 6);
  const w1Badge = badges.find((b) => b.worldId === 'world1')!;
  const w2Badge = badges.find((b) => b.worldId === 'world2')!;
  const w3Badge = badges.find((b) => b.worldId === 'world3')!;
  assert.equal(w1Badge.badgeTitle, 'Overtime Guru');
  assert.equal(w1Badge.unlocked, true);
  assert.equal(w1Badge.progressPercent, 100);
  assert.equal(w2Badge.unlocked, false);
  assert.equal(w2Badge.progressPercent, 0);
  // Persisted unlock date keeps Wage Expert unlocked even if inspected later
  assert.equal(w3Badge.badgeTitle, 'Wage Expert');
  assert.equal(w3Badge.unlocked, true);
});

