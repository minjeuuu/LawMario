import test from 'node:test';
import assert from 'node:assert/strict';
import {
  syncDailyLoginStreak,
  STREAK_COUNT_KEY,
  STREAK_STUDY_DATE_KEY,
  LEGACY_LOGIN_DATE_KEY,
  mapActiveWorldToQuizCode,
  pickQuickTestQuestions,
  pickFlashbackQuizQuestions,
  computeQuickTestSummary,
  getQuizQuestionsForDifficulty,
  filterFlashcardsForDifficulty,
  buildFlashcardExamChoices,
  adaptBossQuestionForDifficulty,
  StorageLike,
} from './studyModes';
import { FLASHCARDS_DATA } from '../data/flashcardsData';
import { BOWSER_BOSS_QUESTIONS } from '../data/quizQuestionsData';

function createMemoryStorage(initial: Record<string, string> = {}): StorageLike {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  };
}

test('syncDailyLoginStreak initializes streak=1 in localStorage on first visit', () => {
  const storage = createMemoryStorage();
  const res = syncDailyLoginStreak(storage, new Date(2026, 9, 25, 10, 0, 0));
  assert.equal(res.streak, 1);
  assert.equal(storage.getItem(STREAK_COUNT_KEY), '1');
  assert.equal(storage.getItem(STREAK_STUDY_DATE_KEY), '2026-10-25');
  assert.equal(res.isBonusClaimedToday, false);
});

test('syncDailyLoginStreak increments streak on consecutive daily logins and preserves same-day logins', () => {
  const storage = createMemoryStorage({
    [STREAK_COUNT_KEY]: '3',
    [STREAK_STUDY_DATE_KEY]: '2026-10-24',
  });
  const day4 = syncDailyLoginStreak(storage, new Date(2026, 9, 25, 9, 30, 0));
  assert.equal(day4.streak, 4);
  assert.equal(storage.getItem(STREAK_COUNT_KEY), '4');

  // Calling again on the same day does not double-increment
  const sameDay = syncDailyLoginStreak(storage, new Date(2026, 9, 25, 21, 15, 0));
  assert.equal(sameDay.streak, 4);

  // Skipping a day resets to 1
  const skipped = syncDailyLoginStreak(storage, new Date(2026, 9, 27, 8, 0, 0));
  assert.equal(skipped.streak, 1);
  assert.equal(storage.getItem(STREAK_COUNT_KEY), '1');
});

test('syncDailyLoginStreak detects when today bonus gift is claimed via legacy date key', () => {
  const now = new Date(2026, 9, 25, 12, 0, 0);
  const storage = createMemoryStorage({
    [STREAK_COUNT_KEY]: '5',
    [STREAK_STUDY_DATE_KEY]: '2026-10-25',
    [LEGACY_LOGIN_DATE_KEY]: now.toDateString(),
  });
  const res = syncDailyLoginStreak(storage, now);
  assert.equal(res.streak, 5);
  assert.equal(res.isBonusClaimedToday, true);
});

test('pickQuickTestQuestions pulls 5 unique random questions scoped to activeWorld', () => {
  for (const world of ['world1', 'world2', 'world3', 'world4', 'world5', 'world6', 'holidays']) {
    const expectedCode = mapActiveWorldToQuizCode(world);
    const examPick = pickQuickTestQuestions(world, 'exam_prep', 5);
    assert.equal(examPick.length, 5);
    assert.equal(new Set(examPick.map((q) => q.id)).size, 5);
    examPick.forEach((q) => {
      assert.equal(q.worldCode, expectedCode);
      assert.equal(q.options.length, 4);
      assert.equal(q.difficultyMode, 'exam_prep');
    });

    const casualPick = pickQuickTestQuestions(world, 'casual', 5);
    assert.equal(casualPick.length, 5);
    assert.equal(new Set(casualPick.map((q) => q.id)).size, 5);
    casualPick.forEach((q) => {
      assert.equal(q.worldCode, expectedCode);
      assert.equal(q.options.length, 3);
      assert.equal(q.difficultyMode, 'casual');
      assert.ok(q.hint && q.hint.length > 0);
    });
  }
});

test('computeQuickTestSummary scales coins accurately with accuracy and difficulty', () => {
  const zero = computeQuickTestSummary(0, 5, 'casual');
  assert.equal(zero.accuracyPercent, 0);
  assert.equal(zero.coinsEarned, 0);

  const midCasual = computeQuickTestSummary(3, 5, 'casual');
  assert.equal(midCasual.accuracyPercent, 60);
  assert.ok(midCasual.coinsEarned > 0);

  const perfectCasual = computeQuickTestSummary(5, 5, 'casual');
  const perfectExam = computeQuickTestSummary(5, 5, 'exam_prep');
  assert.equal(perfectCasual.accuracyPercent, 100);
  assert.equal(perfectExam.accuracyPercent, 100);
  assert.ok(perfectExam.coinsEarned > perfectCasual.coinsEarned);
  assert.ok(perfectCasual.coinsEarned > midCasual.coinsEarned);
});

test('difficulty toggle adjusts both quiz questions and flashcards complexity', () => {
  const casualQuiz = getQuizQuestionsForDifficulty('casual', 'w1');
  const examQuiz = getQuizQuestionsForDifficulty('exam_prep', 'w1');
  assert.ok(casualQuiz.length >= 5);
  assert.ok(examQuiz.length >= 5);
  assert.equal(casualQuiz[0].options.length, 3);
  assert.equal(examQuiz[0].options.length, 4);

  const casualCards = filterFlashcardsForDifficulty(FLASHCARDS_DATA, 'casual', 'all');
  const examCards = filterFlashcardsForDifficulty(FLASHCARDS_DATA, 'exam_prep', 'all');
  assert.ok(casualCards.every((c) => c.difficulty !== 'Hard'));
  assert.ok(examCards.every((c) => c.difficulty !== 'Easy'));

  const mcqChoices = buildFlashcardExamChoices(examCards[0], FLASHCARDS_DATA);
  assert.equal(mcqChoices.length, 4);
  assert.equal(mcqChoices.filter((c) => c.isCorrect).length, 1);

  const bossAdapted = adaptBossQuestionForDifficulty(BOWSER_BOSS_QUESTIONS[0], 'casual');
  assert.equal(bossAdapted.options.length, 3);
  assert.equal(
    bossAdapted.options[bossAdapted.correctIndex],
    BOWSER_BOSS_QUESTIONS[0].options[BOWSER_BOSS_QUESTIONS[0].correctIndex]
  );
});

test('pickFlashbackQuizQuestions pulls targeted questions from weak topic worlds', () => {
  const result = pickFlashbackQuizQuestions(
    ['w3_wage_orders', 'w3_13th_month'],
    [],
    'exam_prep',
    5
  );
  assert.equal(result.questions.length, 5);
  assert.equal(result.isCuratedFromWeaknesses, true);
  assert.ok(result.questions.every((q) => q.worldCode === 'w3'));
  assert.ok(result.sourceLabel.includes('W3'));
});

test('buildNeedsImprovementFlashcards and buildRapidFireReviewQuiz filter strictly to Needs Improvement topics', async () => {
  const {
    REVIEW_SESSION_DURATION_SECONDS,
    buildNeedsImprovementFlashcards,
    buildRapidFireReviewQuiz,
  } = await import('./studyModes');

  assert.equal(REVIEW_SESSION_DURATION_SECONDS, 180);

  // Empty flags -> empty strict deck
  const emptyRes = buildNeedsImprovementFlashcards({
    allCards: FLASHCARDS_DATA,
    needsImprovementTopicIds: [],
    needsImprovementWorlds: [],
  });
  assert.equal(emptyRes.hasFlaggedItems, false);
  assert.equal(emptyRes.cards.length, 0);

  // World 1 flagged -> strictly World 1 cards
  const world1Res = buildNeedsImprovementFlashcards({
    allCards: FLASHCARDS_DATA,
    needsImprovementTopicIds: [],
    needsImprovementWorlds: ['world1'],
  });
  assert.equal(world1Res.hasFlaggedItems, true);
  assert.ok(world1Res.cards.length > 0);
  assert.ok(world1Res.cards.every((c) => c.worldNum === 1));

  // Rapid-fire quiz builder generates 4-choice questions strictly from flagged topics/worlds
  const quizRes = buildRapidFireReviewQuiz({
    allCards: FLASHCARDS_DATA,
    needsImprovementTopicIds: ['w1-brownouts'],
    needsImprovementWorlds: [],
    allTopics: [
      {
        id: 'w1-brownouts',
        worldId: 'world1',
        title: 'Power Brownouts & Compensable Hours',
      },
    ],
    shuffle: false,
  });
  assert.equal(quizRes.hasFlaggedItems, true);
  assert.ok(quizRes.questions.length > 0);
  quizRes.questions.forEach((item) => {
    assert.equal(item.card.worldNum, 1);
    assert.equal(item.choices.length, 4);
    assert.equal(item.choices[item.correctIndex].isCorrect, true);
  });
});

test('shuffleFlashcardDeck randomizes card order, guarantees a fresh leading card, and preserveOrder keeps mixed difficulty tiers', async () => {
  const { shuffleFlashcardDeck } = await import('./studyModes');
  const { buildDynamicPrintPageCss } = await import('./printHelper');

  const baseDeck = filterFlashcardsForDifficulty(FLASHCARDS_DATA, 'exam_prep', 1);
  assert.ok(baseDeck.length >= 6);

  const originalFirstId = baseDeck[0].id;
  for (let trial = 0; trial < 15; trial++) {
    const shuffledSource = shuffleFlashcardDeck(FLASHCARDS_DATA, originalFirstId);
    const preservedFiltered = filterFlashcardsForDifficulty(
      shuffledSource,
      'exam_prep',
      1,
      true
    );
    assert.equal(preservedFiltered.length, baseDeck.length);
    assert.equal(
      new Set(preservedFiltered.map((c) => c.id)).size,
      baseDeck.length,
      'Shuffled deck retains exact card membership with zero duplicates'
    );

    const directShuffled = shuffleFlashcardDeck(baseDeck, originalFirstId);
    assert.notEqual(
      directShuffled[0].id,
      originalFirstId,
      'Shuffling always rotates a fresh card to position 0 when deck has >1 cards'
    );
  }

  // Verify dynamic @page CSS forces landscape on certificates and portrait/landscape on guides
  const certCss = buildDynamicPrintPageCss('landscape', '6mm');
  assert.ok(certCss.includes('size: A4 landscape;'));
  assert.ok(certCss.includes('margin: 6mm;'));

  const portraitCss = buildDynamicPrintPageCss('portrait', '10mm 12mm');
  assert.ok(portraitCss.includes('size: A4 portrait;'));
});

test('expanded QUICK_GLOSSARY_TERMS covers >=155 unique Philippine Labor Law doctrines across all 6 categories', async () => {
  const { QUICK_GLOSSARY_TERMS, ALL_GLOSSARY_KEYWORDS, findGlossaryTerm } = await import(
    '../data/quickGlossaryData'
  );

  assert.ok(
    QUICK_GLOSSARY_TERMS.length >= 155,
    `Expected >= 155 glossary items, got ${QUICK_GLOSSARY_TERMS.length}`
  );

  const uniqueIds = new Set(QUICK_GLOSSARY_TERMS.map((item) => item.id));
  assert.equal(uniqueIds.size, QUICK_GLOSSARY_TERMS.length, 'Glossary IDs must be 100% unique');

  const categories = new Set(QUICK_GLOSSARY_TERMS.map((item) => item.category));
  assert.equal(categories.size, 6, 'All 6 Philippine Labor Law categories must be populated');

  assert.ok(ALL_GLOSSARY_KEYWORDS.length >= 180);
  const foundControl = findGlossaryTerm('Four-Fold Test');
  assert.ok(foundControl);
  assert.ok(foundControl.simplifiedDefinition.length > 40);
});

test('generateExamSimulationDeck builds a randomized 10-question multi-world quiz and computeExamSimulationBreakdown grades accurately', async () => {
  const {
    generateExamSimulationDeck,
    computeExamSimulationBreakdown,
    extractClozeSegments,
  } = await import('./studyModes');

  const deckExam = generateExamSimulationDeck('exam_prep', 10);
  assert.equal(deckExam.length, 10);
  assert.equal(new Set(deckExam.map((q) => q.id)).size, 10, '10 unique questions');

  const distinctWorlds = new Set(deckExam.map((q) => q.worldCode));
  assert.ok(
    distinctWorlds.size >= 5,
    `Expected broad multi-world topic coverage across Labor Law, got ${distinctWorlds.size}`
  );
  deckExam.forEach((q) => {
    assert.ok(q.options.length >= 3);
    assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length);
    assert.ok(q.explanation.length > 15);
    assert.ok(q.legalBasis.length > 3);
  });

  // Answer first 8 right, 9th wrong, 10th unanswered (timeout)
  const answersByIndex: Record<number, number | null> = {};
  deckExam.forEach((q, idx) => {
    if (idx < 8) {
      answersByIndex[idx] = q.correctIndex;
    } else if (idx === 8) {
      answersByIndex[idx] = (q.correctIndex + 1) % q.options.length;
    } else {
      answersByIndex[idx] = null;
    }
  });

  const summary = computeExamSimulationBreakdown({
    deck: deckExam,
    answersByIndex,
    elapsedSeconds: 412,
    timeLimitSeconds: 600,
    timedOut: false,
    difficulty: 'exam_prep',
  });

  assert.equal(summary.correctCount, 8);
  assert.equal(summary.totalCount, 10);
  assert.equal(summary.answeredCount, 9);
  assert.equal(summary.unansweredCount, 1);
  assert.equal(summary.accuracyPercent, 80);
  assert.equal(summary.barVerdict, 'BAR EXAM PASSER (75%+ STANDARD)');
  assert.equal(summary.coinsEarned, 8 * 7 + 15);
  assert.ok(summary.worldBreakdown.length >= 5);

  // Cloze extraction turns statutory percentages, days, and Articles into blanks
  const cloze = extractClozeSegments(
    'Under Article 87, overtime pay adds at least 25% after 8 hours, with ₱5,000,000 capital under D.O. 174.',
    'test'
  );
  const blanks = cloze.filter((s) => s.type === 'blank');
  assert.ok(blanks.length >= 4, `Expected >= 4 cloze blanks, got ${blanks.length}`);
});


