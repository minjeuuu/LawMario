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
  APP_STUDY_FONTS,
  computeA4PreviewStageMetrics,
  initializeTopicAccessMapWithRetentionSeed,
  recordTopicAccessTimestamp,
  getOverdueReviewTopics,
  recordBossBattleLogEntry,
  evaluateStudySprintCompletion,
  shouldPlayStudyAmbience,
  lookupStatutesByQuery,
} from './round8Features';
import { createStudyNote, filterStudyNotes } from './engagementFeatures';
import {
  resolvePdfThemeAndFont,
  buildScoreCardLandscapePdfBytes,
  countPdfPagesFromBytes,
} from './pdfExportService';
import { LawTopic } from '../types/laborLaw';
import { QuizQuestion } from '../data/quizQuestionsData';

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

  const sampleTopics: Pick<LawTopic, 'id' | 'title' | 'badge' | 'worldId'>[] = [
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

  it('exposes 29 distinct Print Studio themes, 20 distinct Print font styles, and 8 App Reading Fonts', () => {
    assert.equal(PRINT_COLOR_THEMES.length, 29);
    assert.equal(PRINT_FONT_STYLES.length, 20);
    assert.equal(APP_STUDY_FONTS.length, 8);

    const uniqueThemeIds = new Set(PRINT_COLOR_THEMES.map((t) => t.id));
    const uniqueFontIds = new Set(PRINT_FONT_STYLES.map((f) => f.id));
    assert.equal(uniqueThemeIds.size, 29);
    assert.equal(uniqueFontIds.size, 20);

    for (const theme of PRINT_COLOR_THEMES) {
      for (const font of PRINT_FONT_STYLES) {
        const resolved = resolvePdfThemeAndFont(theme.id, font.id);
        assert.equal(resolved.id, theme.id);
        assert.ok(['helvetica', 'times', 'courier'].includes(resolved.fontFamily));
      }
    }
  });

  it('scales Portrait (794px) and Landscape (1122px) A4 previews proportionally with zero horizontal overflow on 360px phones', () => {
    const mobilePortraitA4 = computeA4PreviewStageMetrics({
      containerWidthPx: 332,
      isLandscape: false,
      zoomPreset: 'fit',
    });
    assert.equal(mobilePortraitA4.logicalWidthPx, 794);
    assert.ok(mobilePortraitA4.scaledWidthPx <= 332);
    assert.ok(mobilePortraitA4.effectiveScale > 0.35 && mobilePortraitA4.effectiveScale < 0.5);

    const mobileLandscapeCert = computeA4PreviewStageMetrics({
      containerWidthPx: 332,
      isLandscape: true,
      zoomPreset: 'fit',
    });
    assert.equal(mobileLandscapeCert.logicalWidthPx, 1122);
    assert.equal(mobileLandscapeCert.logicalMinHeightPx, 794);
    assert.ok(mobileLandscapeCert.scaledWidthPx <= 332);

    const desktopWholeCertFit = computeA4PreviewStageMetrics({
      containerWidthPx: 1200,
      containerHeightPx: 620,
      fitWholePageVertically: true,
      isLandscape: true,
      zoomPreset: 'fit',
    });
    assert.ok(desktopWholeCertFit.effectiveScale < 0.8);
    assert.ok(Math.round(desktopWholeCertFit.logicalMinHeightPx * desktopWholeCertFit.effectiveScale) <= 620);

    const desktopZoom125 = computeA4PreviewStageMetrics({
      containerWidthPx: 1200,
      isLandscape: false,
      zoomPreset: '125',
    });
    assert.equal(desktopZoom125.effectiveScale, 1.25);
    assert.equal(desktopZoom125.scaledWidthPx, Math.round(794 * 1.25));
  });

  it('builds a valid single-page A4 Landscape Hero Score Card PDF with custom theme and font', () => {
    const pdfBytes = buildScoreCardLandscapePdfBytes({
      playerName: 'Alex Scholar',
      heroName: 'Rosalina',
      heroRank: 'Star Master',
      completedCount: 18,
      totalTopics: 28,
      coins: 450,
      loginStreak: 7,
      unlockedAchievementsCount: 10,
      totalAchievementsCount: 16,
      quizRunsCompleted: 5,
      studyDurationFormatted: '2h 15m',
      colorAccent: 'sakura_editorial',
      fontStyle: 'cormorant_chancery',
      worldBreakdown: [
        { worldNumber: 1, shortTitle: 'Hours of Work', completed: 4, total: 5, percent: 80 },
        { worldNumber: 2, shortTitle: 'Leaves & Pay', completed: 3, total: 4, percent: 75 },
        { worldNumber: 3, shortTitle: 'Wages', completed: 3, total: 5, percent: 60 },
        { worldNumber: 4, shortTitle: 'Special Groups', completed: 3, total: 5, percent: 60 },
        { worldNumber: 5, shortTitle: 'Harassment', completed: 2, total: 4, percent: 50 },
        { worldNumber: 6, shortTitle: 'Social Welfare', completed: 3, total: 5, percent: 60 },
      ],
    });
    assert.ok(pdfBytes.byteLength > 1000);
    assert.equal(countPdfPagesFromBytes(pdfBytes), 1);
  });
});

describe('Review Required (>14 days), Boss Battle Log, Study Sprint, Statute Lookup & Notes Tags', () => {
  it('flags topics unaccessed for over 14 days and clears them once accessed', () => {
    const nowMs = new Date(2026, 10, 1, 12, 0, 0).getTime();
    const topics = [
      { id: 'm1-coverage', title: 'Coverage & Exclusions', badge: 'Art. 82', worldId: 'world1' },
      { id: 'm2-holiday-pay', title: 'Holiday Pay', badge: 'Art. 94', worldId: 'world2' },
    ];

    const seeded = initializeTopicAccessMapWithRetentionSeed({
      existingMap: {},
      completedTopicIds: ['m1-coverage'],
      allTopicIds: topics.map((t) => t.id),
      alreadySeeded: true,
      nowMs,
    });
    assert.equal(seeded.didSeed, true);

    const overdueBefore = getOverdueReviewTopics({
      lastAccessedMap: seeded.map,
      allTopics: topics,
      nowMs,
    });
    assert.equal(overdueBefore.length, 1);
    assert.equal(overdueBefore[0].topicId, 'm1-coverage');
    assert.ok(overdueBefore[0].daysSinceAccess > 14);

    const refreshedMap = recordTopicAccessTimestamp(seeded.map, 'm1-coverage', nowMs);
    const overdueAfter = getOverdueReviewTopics({
      lastAccessedMap: refreshedMap,
      allTopics: topics,
      nowMs,
    });
    assert.equal(overdueAfter.length, 0);
  });

  it('records up to 10 Bar Master Boss Battle Log entries with accuracy and missed topics', () => {
    let log = [] as ReturnType<typeof recordBossBattleLogEntry>;
    for (let i = 1; i <= 12; i++) {
      log = recordBossBattleLogEntry(log, {
        modeLabel: `Boss Run #${i}`,
        score: 8,
        totalQuestions: 10,
        timeTakenSeconds: 125,
        incorrectTopics: ['Art. 87 Overtime', 'Art. 87 Overtime', 'R.A. 11210'],
      });
    }
    assert.equal(log.length, 10);
    assert.equal(log[0].modeLabel, 'Boss Run #12');
    assert.equal(log[0].accuracyPercent, 80);
    assert.deepEqual(log[0].incorrectTopics, ['Art. 87 Overtime', 'R.A. 11210']);
  });

  it('awards +60 coins for an unbroken 25-minute Study Sprint and +20 if tabs were switched', () => {
    const unbroken = evaluateStudySprintCompletion({
      completedFull25Minutes: true,
      switchedTabsDuringSprint: false,
    });
    assert.equal(unbroken.totalCoins, 60);
    assert.equal(unbroken.unbrokenFocus, true);

    const broken = evaluateStudySprintCompletion({
      completedFull25Minutes: true,
      switchedTabsDuringSprint: true,
    });
    assert.equal(broken.totalCoins, 20);
    assert.equal(broken.unbrokenFocus, false);
  });

  it('pauses Study Ambience automatically whenever Mario BGM is playing or audio is muted', () => {
    assert.equal(
      shouldPlayStudyAmbience({ audioEnabled: true, ambiencePreset: 'forest', bgmPlaying: false }),
      true
    );
    assert.equal(
      shouldPlayStudyAmbience({ audioEnabled: true, ambiencePreset: 'forest', bgmPlaying: true }),
      false
    );
    assert.equal(
      shouldPlayStudyAmbience({ audioEnabled: false, ambiencePreset: 'castle', bgmPlaying: false }),
      false
    );
  });

  it('looks up Labor Code articles and R.A. numbers with statutory text, doctrines, and tips', () => {
    const art87 = lookupStatutesByQuery('Art. 87');
    assert.ok(art87.length >= 1);
    assert.equal(art87[0].articleNumber, '87');
    assert.ok(art87[0].supremeCourtDoctrines.length >= 1);
    assert.ok(art87[0].interpretationTips.length >= 1);

    const ra11210 = lookupStatutesByQuery('11210');
    assert.equal(ra11210[0].articleNumber, 'RA 11210');

    const pd851 = lookupStatutesByQuery('PD 851');
    assert.ok(pd851.length >= 1);
    assert.equal(pd851[0].articleNumber, 'PD 851');
    assert.ok(pd851[0].title.includes('13th-Month Pay'));

    // Test book scope filtering logic with digit stripping
    const allProvisions = lookupStatutesByQuery('');
    assert.ok(allProvisions.length >= 20);

    const book3Provisions = allProvisions.filter((entry) => {
      const artNum = entry.articleNumber.toUpperCase();
      const digitsOnly = artNum.replace(/[^0-9]/g, '');
      const num = digitsOnly ? parseInt(digitsOnly, 10) : NaN;
      return (!isNaN(num) && num >= 82 && num <= 100) || artNum.includes('94') || artNum.includes('95');
    });
    assert.ok(book3Provisions.length >= 10);
    assert.ok(book3Provisions.some((p) => p.articleNumber === '82'));
    assert.ok(book3Provisions.some((p) => p.articleNumber === '94'));

    const postEmploymentProvisions = allProvisions.filter((entry) => {
      const artNum = entry.articleNumber.toUpperCase();
      const code = entry.codeLabel.toUpperCase();
      const digitsOnly = artNum.replace(/[^0-9]/g, '');
      const num = digitsOnly ? parseInt(digitsOnly, 10) : NaN;
      return (
        (!isNaN(num) && num >= 297 && num <= 306) ||
        code.includes('297') ||
        code.includes('298') ||
        code.includes('302') ||
        code.includes('306') ||
        artNum.includes('297') ||
        artNum.includes('298') ||
        artNum.includes('302') ||
        artNum.includes('306')
      );
    });
    assert.ok(postEmploymentProvisions.some((p) => p.articleNumber === '297'));
    assert.ok(postEmploymentProvisions.some((p) => p.articleNumber === '302'));
    assert.ok(postEmploymentProvisions.some((p) => p.articleNumber === '306'));

    const specialLaws = allProvisions.filter((entry) => {
      const artNum = entry.articleNumber.toUpperCase();
      const code = entry.codeLabel.toUpperCase();
      return (
        code.includes('RA') ||
        code.includes('PD') ||
        code.includes('D.O.') ||
        code.includes('REPUBLIC ACT') ||
        code.includes('PRESIDENTIAL DECREE') ||
        code.includes('R.A.') ||
        code.includes('P.D.') ||
        artNum.includes('RA') ||
        artNum.includes('PD') ||
        artNum.includes('D.O.')
      );
    });
    assert.ok(specialLaws.some((s) => s.articleNumber === 'PD 851'));
    assert.ok(specialLaws.some((s) => s.articleNumber === 'RA 11210'));
    assert.ok(specialLaws.some((s) => s.articleNumber === 'RA 10361'));
    assert.ok(specialLaws.some((s) => s.articleNumber === 'RA 11313'));
  });

  it('creates and filters study notes by categoryTag', () => {
    let notes = createStudyNote([], {
      title: 'Twin Notice Rule',
      content: '5 calendar days to explain under Mamac doctrine',
      worldTag: 'world5',
      categoryTag: 'Bar Exam Review',
    });
    notes = createStudyNote(notes, {
      title: 'Pineda Formula',
      content: 'Min Wage / Actual Salary x Prescribed Increase',
      worldTag: 'world3',
      categoryTag: 'Complex Concept',
    });

    assert.equal(filterStudyNotes(notes, 'all', '', 'Bar Exam Review').length, 1);
    assert.equal(filterStudyNotes(notes, 'all', '', 'Complex Concept').length, 1);
    assert.equal(filterStudyNotes(notes, 'all', '', 'Quick Reference').length, 0);
  });
});

