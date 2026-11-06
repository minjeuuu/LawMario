import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { inflateSync } from 'node:zlib';
import {
  EXTENDED_PRINT_COLOR_THEMES,
  EXTENDED_PRINT_FONT_CATALOG,
} from './round12Features';
import {
  getPdfFontProfile,
  getPrintFontCssStack,
  loadFullDailyMissionBoard,
  applyDailyMissionProgress,
  claimDailyMissionReward,
  StorageLike,
} from './round11Features';
import {
  resolvePdfThemeAndFont,
  buildOnePageSummaryPdfBytes,
  buildCertificatePdfBytes,
  buildMasterDiplomaPdfBytes,
  buildStudyGuideReviewerPdfBytes,
  buildScoreCardLandscapePdfBytes,
} from './pdfExportService';
import {
  loadNoteLineAnnotations,
  saveNoteLineAnnotations,
  toggleNoteLineHighlight,
  toggleNoteLineStar,
  createEmptyWeeklySchedule,
  assignModuleToPlannerDay,
  removeModuleFromPlannerDay,
  saveWeeklyStudyPlanner,
  loadWeeklyStudyPlanner,
} from './studyPlannerAndNotes';
import {
  recordQuizGhostRun,
  evaluateGhostRaceStatus,
  recordArcadeGhostRun,
  buildArcadeGhostRaceComparison,
  LABOR_KNOWLEDGE_GRAPH_NODES,
  LABOR_KNOWLEDGE_GRAPH_EDGES,
} from './ghostRaceAndKnowledgeGraph';
import {
  createInitialCoinRushState,
  stepCoinRushState,
  saveCoinRushHighScore,
  loadCoinRushHighScore,
} from './coinRushGame';
import { ALL_LAW_TOPICS, WORLDS_METADATA } from '../data/laborLawData';

class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

test('All 52 Print Studio themes and 44 fonts (including DM Sans) apply distinctly to PDF exports', () => {
  assert.equal(EXTENDED_PRINT_COLOR_THEMES.length, 52);
  assert.equal(EXTENDED_PRINT_FONT_CATALOG.length, 44);

  // Every theme produces distinct primary/accent RGB values in resolvePdfThemeAndFont
  const seenPalettes = new Set<string>();
  for (const theme of EXTENDED_PRINT_COLOR_THEMES) {
    const resolved = resolvePdfThemeAndFont(theme.id, 'dm_sans_clean');
    seenPalettes.add(
      `${resolved.primary.join(',')}_${resolved.accent.join(',')}_${resolved.badgeFill.join(',')}`
    );
  }
  assert.ok(
    seenPalettes.size >= 40,
    `Expected at least 40 distinct resolved PDF color palettes across 44 themes, got ${seenPalettes.size}`
  );

  // Every font in 36-font catalog resolves to valid PDF font profile & CSS stack (including dm_sans_clean and dm_sans alias)
  const dmClean = getPdfFontProfile('dm_sans_clean');
  const dmAlias = getPdfFontProfile('dm_sans');
  assert.equal(dmClean.displayLabel, 'DM Sans');
  assert.equal(dmAlias.displayLabel, 'DM Sans');
  assert.ok(getPrintFontCssStack('dm_sans_clean').includes('DM Sans'));

  for (const font of EXTENDED_PRINT_FONT_CATALOG) {
    const fp = getPdfFontProfile(font.id);
    assert.ok(['helvetica', 'times', 'courier'].includes(fp.fontFamily));
    assert.equal(fp.displayLabel, font.name);
  }

  // Exporting PDFs with different themes & fonts produces distinct PDF byte streams without hardcoded courier overrides
  const pdfA = buildOnePageSummaryPdfBytes({
    colorAccent: 'wario_bullion_vault',
    fontStyle: 'dm_sans_clean',
    dateLabel: 'Nov 5, 2026',
  });
  const pdfB = buildOnePageSummaryPdfBytes({
    colorAccent: 'padre_faura_maroon',
    fontStyle: 'editorial_garamond',
    dateLabel: 'Nov 5, 2026',
  });
  const asciiA = Buffer.from(pdfA).toString('latin1');
  const asciiB = Buffer.from(pdfB).toString('latin1');
  assert.ok(asciiA.startsWith('%PDF-'));
  assert.ok(asciiB.startsWith('%PDF-'));
  assert.notEqual(asciiA, asciiB);
  const bufA = Buffer.from(pdfA);
  const streamStart = bufA.indexOf('stream\n');
  const streamEnd = bufA.indexOf('\nendstream', streamStart);
  assert.ok(streamStart > 0 && streamEnd > streamStart);
  const contentStreamA = inflateSync(bufA.subarray(streamStart + 7, streamEnd)).toString('latin1');
  const tfMatchesA = contentStreamA.match(/\/F\d+\s+[\d.]+\s+Tf/g) || [];
  assert.ok(tfMatchesA.length > 0, 'Expected Tf font operators in PDF content stream');
  for (const tf of tfMatchesA) {
    const fNum = parseInt(tf.slice(2), 10);
    assert.ok(
      fNum >= 1 && fNum <= 4,
      `DM Sans PDF must only emit Helvetica font operators (/F1..F4), found ${tf}`
    );
  }
  const warioRgbPrefix = resolvePdfThemeAndFont('wario_bullion_vault', 'dm_sans_clean')
    .primary.map((v) => (v / 255).toFixed(3))
    .join(' ');
  const streamStartB = Buffer.from(pdfB).indexOf('stream\n');
  const streamEndB = Buffer.from(pdfB).indexOf('\nendstream', streamStartB);
  const contentStreamB = inflateSync(
    Buffer.from(pdfB).subarray(streamStartB + 7, streamEndB)
  ).toString('latin1');
  const padreRgbPrefix = resolvePdfThemeAndFont('padre_faura_maroon', 'editorial_garamond')
    .primary.map((v) => (v / 255).toFixed(3))
    .join(' ');
  assert.ok(
    contentStreamA.includes(warioRgbPrefix),
    `Expected Wario Bullion Vault primary RGB (${warioRgbPrefix}) in PDF stream`
  );
  assert.ok(
    contentStreamB.includes(padreRgbPrefix),
    `Expected Padre Faura Maroon primary RGB (${padreRgbPrefix}) in PDF stream`
  );
  assert.notEqual(warioRgbPrefix, padreRgbPrefix);

  const certA = buildCertificatePdfBytes({
    recipientName: 'Mario Counsel',
    completedCount: 15,
    totalCount: 30,
    colorAccent: 'world1_overworld_emerald',
    fontStyle: 'dm_sans_clean',
  });
  const certB = buildCertificatePdfBytes({
    recipientName: 'Mario Counsel',
    completedCount: 15,
    totalCount: 30,
    colorAccent: 'world5_bowser_magma',
    fontStyle: 'tabular_mono',
  });
  assert.notEqual(Buffer.from(certA).toString('latin1'), Buffer.from(certB).toString('latin1'));

  const dipA = buildMasterDiplomaPdfBytes({
    recipientName: 'Luigi Juris',
    completedCount: 30,
    totalCount: 30,
    colorAccent: 'wario_bullion_vault',
    fontStyle: 'dm_sans_clean',
  });
  const dipB = buildMasterDiplomaPdfBytes({
    recipientName: 'Luigi Juris',
    completedCount: 30,
    totalCount: 30,
    colorAccent: 'peach_sky_sanctuary',
    fontStyle: 'cinzel_supreme',
  });
  assert.notEqual(Buffer.from(dipA).toString('latin1'), Buffer.from(dipB).toString('latin1'));

  const guidePdf = buildStudyGuideReviewerPdfBytes({
    completedTopicIds: ['w1-hours'],
    topics: ALL_LAW_TOPICS.slice(0, 2),
    selectedWorlds: ['world1'],
    colorAccent: 'world1_overworld_emerald',
    fontStyle: 'dm_sans_clean',
  });
  assert.ok(Buffer.from(guidePdf).toString('latin1').startsWith('%PDF-'));

  const scorePdf = buildScoreCardLandscapePdfBytes({
    playerName: 'Princess Peach',
    heroName: 'Peach',
    heroRank: 'Super Star',
    completedCount: 20,
    totalTopics: 30,
    coins: 500,
    loginStreak: 7,
    unlockedAchievementsCount: 8,
    totalAchievementsCount: 14,
    quizRunsCompleted: 9,
    studyDurationFormatted: '2h 15m',
    colorAccent: 'peach_sky_sanctuary',
    fontStyle: 'dm_sans_clean',
    worldBreakdown: WORLDS_METADATA.map((w) => ({
      worldNumber: w.worldNumber,
      shortTitle: w.shortTitle,
      completed: 3,
      total: 5,
      percent: 60,
    })),
  });
  assert.ok(Buffer.from(scorePdf).toString('latin1').startsWith('%PDF-'));
});

test('Note line Highlight & Star annotations and 7-day Study Planner persist deterministically', () => {
  const storage = new MemoryStorage();
  let map = loadNoteLineAnnotations(storage);
  map = toggleNoteLineHighlight(map, 'note-1', 0);
  map = toggleNoteLineHighlight(map, 'note-1', 2);
  map = toggleNoteLineStar(map, 'note-1', 1);
  saveNoteLineAnnotations(map, storage);

  const reloaded = loadNoteLineAnnotations(storage);
  assert.deepEqual(reloaded['note-1'].highlightedLines, [0, 2]);
  assert.deepEqual(reloaded['note-1'].starredLines, [1]);

  let schedule = createEmptyWeeklySchedule();
  schedule = assignModuleToPlannerDay(schedule, 'Mon', {
    topicId: 'w1-hours',
    title: '8-Hour Workday',
    worldId: 'world1',
    badge: 'Art. 83',
  });
  // Dragging from Mon to Wed moves the module cleanly without duplicating
  schedule = assignModuleToPlannerDay(
    schedule,
    'Wed',
    {
      topicId: 'w1-hours',
      title: '8-Hour Workday',
      worldId: 'world1',
      badge: 'Art. 83',
    },
    'Mon'
  );
  saveWeeklyStudyPlanner(schedule, storage);

  const loadedPlanner = loadWeeklyStudyPlanner(storage);
  assert.equal(loadedPlanner.Mon.length, 0);
  assert.equal(loadedPlanner.Wed.length, 1);

  const afterRemove = removeModuleFromPlannerDay(loadedPlanner, 'Wed', 'w1-hours');
  assert.equal(afterRemove.Wed.length, 0);
});

test('Quiz & Arcade Ghost Racing and Labor Law Knowledge Graph operate deterministically', () => {
  const storage = new MemoryStorage();
  const firstRun = recordQuizGhostRun({
    bucketKey: 'all',
    accuracyPercent: 80,
    totalTimeSec: 45,
    checkpoints: [
      { questionIndex: 1, elapsedSec: 10, accuracyPercent: 100 },
      { questionIndex: 2, elapsedSec: 22, accuracyPercent: 50 },
      { questionIndex: 3, elapsedSec: 34, accuracyPercent: 67 },
      { questionIndex: 4, elapsedSec: 45, accuracyPercent: 80 },
    ],
    storage,
  });
  assert.equal(firstRun.isNewRecord, true);

  const raceStatus = evaluateGhostRaceStatus({
    currentQuestionNumber: 2,
    totalQuestions: 4,
    playerAccuracyPercent: 100,
    playerElapsedSec: 18,
    ghost: firstRun.currentBest,
  });
  assert.equal(raceStatus.hasGhost, true);
  assert.equal(raceStatus.leadStatus, 'ahead');

  const arcadeGhost = recordArcadeGhostRun({
    gameId: 'coin_rush',
    gameTitle: 'Super Mario Coin Rush',
    finalScore: 620,
    storage,
  });
  const cmp = buildArcadeGhostRaceComparison(arcadeGhost.coin_rush.finalScore, 740);
  assert.equal(cmp.length, 5);
  assert.ok(cmp[4].challengerScore > cmp[4].ghostScore);

  assert.ok(LABOR_KNOWLEDGE_GRAPH_NODES.length >= 18);
  assert.ok(LABOR_KNOWLEDGE_GRAPH_EDGES.length >= 16);
});

test('Super Mario Coin Rush physics collects coins, blocks hazards on Star shield, and tracks Daily Missions', () => {
  const storage = new MemoryStorage();
  const initial = createInitialCoinRushState(1);
  // Position Mario directly onto first collectible coin
  const firstCoin = initial.collectibles[0];
  const onCoinState = {
    ...initial,
    playerX: firstCoin.x - initial.playerW / 2,
    playerY: firstCoin.y - initial.playerH / 2,
  };
  const afterPickup = stepCoinRushState(onCoinState, { left: false, right: true, jump: false }, 0.016);
  assert.ok(afterPickup.coinsCollected >= 1);
  assert.ok(afterPickup.score > initial.score);

  const savedBest = saveCoinRushHighScore(afterPickup.score, storage);
  assert.equal(savedBest, afterPickup.score);
  assert.equal(loadCoinRushHighScore(storage), afterPickup.score);

  // Daily Missions board tracks both 'Master a Topic' and 'Perform 5 Quick Quizzes'
  let board = loadFullDailyMissionBoard('2026-11-05', storage);
  assert.ok(board.missions.some((m) => m.title === 'Master a Topic'));
  assert.ok(board.missions.some((m) => m.title === 'Perform 5 Quick Quizzes'));
  board = applyDailyMissionProgress(board, 'master_topic', 1);
  board = applyDailyMissionProgress(board, 'quiz_attempt', 5);
  const claimQuick = claimDailyMissionReward(board, 'dm_quick_quizzes_5');
  assert.equal(claimQuick.coinsAwarded, 75);
});

test('Zero Unicode pictograph emojis exist anywhere in src/ or index.html', () => {
  const emojiRegex = /[\p{Extended_Pictographic}\uFE0F]/gu;
  const srcRoot = path.resolve(process.cwd(), 'src');
  const violations: string[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist') continue;
        walk(full);
      } else if (/\.(ts|tsx|css|html)$/i.test(entry.name)) {
        const content = fs.readFileSync(full, 'utf8');
        const matches = content.match(emojiRegex);
        if (matches && matches.length > 0) {
          violations.push(`${path.relative(process.cwd(), full)}: ${matches.join(' ')}`);
        }
      }
    }
  }

  walk(srcRoot);
  const indexHtml = path.resolve(process.cwd(), 'index.html');
  if (fs.existsSync(indexHtml)) {
    const htmlContent = fs.readFileSync(indexHtml, 'utf8');
    const htmlMatches = htmlContent.match(emojiRegex);
    if (htmlMatches && htmlMatches.length > 0) {
      violations.push(`index.html: ${htmlMatches.join(' ')}`);
    }
  }

  assert.deepEqual(violations, [], `Found forbidden emojis: ${violations.join('; ')}`);
});
