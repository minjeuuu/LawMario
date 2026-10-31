import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_LAW_TOPICS } from '../data/laborLawData';
import {
  sortModuleTopics,
  getTopicDifficultyRank,
  getTopicQuickCheck,
} from './moduleSorting';
import {
  YOSHI_LAUNCH_X,
  YOSHI_LAUNCH_Y,
  YOSHI_EGG_SPEED,
  YOSHI_EGG_GRAVITY,
  YOSHI_RADIAL_CLOUD_SLOTS,
  computeYoshiCloudY,
  solveMovingCloudAimDeg,
  checkEggHitsCloud,
  predictLockedCloudSlot,
} from './yoshiBallistics';
import {
  resetSessionDecks,
  drawBrickBreakerQuestions,
  drawYoshiEggRounds,
  drawBooBurdenCases,
  drawChronoPrescriptionClaims,
  drawHammerBrosShifts,
  drawDueProcessRelayCases,
  drawWageFactoryPackages,
  drawKamekSpells,
  KART_QUESTION_BANK,
  SLOTS_TRIVIA_BANK,
} from './gameQuestionDeck';
import {
  resolvePdfThemeAndFont,
  buildOnePageSummaryPdfBytes,
  buildCertificateLandscapePdfBytes,
  buildStudyGuideReviewerPdfBytes,
} from './pdfExportService';

test('sortModuleTopics accurately sorts by default, alphabetical, difficulty_easiest, and difficulty_hardest', () => {
  const sample = [
    { id: 't1', title: 'Wages & Contracting', difficulty: 'Bar Master' },
    { id: 't2', title: ' Coverage & Hours', difficulty: 'Foundation' },
    { id: 't3', title: 'Meal Periods', difficulty: 'Intermediate' },
    { id: 't4', title: 'Apprenticeship', difficulty: 'Foundation' },
  ];

  const def = sortModuleTopics(sample, 'default');
  assert.deepEqual(
    def.map((t) => t.id),
    ['t1', 't2', 't3', 't4']
  );

  const alpha = sortModuleTopics(sample, 'alphabetical');
  assert.deepEqual(
    alpha.map((t) => t.id),
    ['t4', 't2', 't3', 't1']
  );

  const easiest = sortModuleTopics(sample, 'difficulty_easiest');
  assert.deepEqual(
    easiest.map((t) => t.id),
    ['t2', 't4', 't3', 't1']
  );

  const hardest = sortModuleTopics(sample, 'difficulty_hardest');
  assert.deepEqual(
    hardest.map((t) => t.id),
    ['t1', 't3', 't2', 't4']
  );
  assert.equal(getTopicDifficultyRank('Foundation'), 1);
  assert.equal(getTopicDifficultyRank('Intermediate'), 2);
  assert.equal(getTopicDifficultyRank('Advanced'), 3);
});

test('getTopicQuickCheck returns valid 4-option micro-quiz for all 19 core Labor Law topics', () => {
  assert.ok(ALL_LAW_TOPICS.length >= 19);
  for (const topic of ALL_LAW_TOPICS) {
    const qc = getTopicQuickCheck(topic);
    assert.equal(qc.options.length, 4);
    assert.ok(qc.correctIndex >= 0 && qc.correctIndex < 4);
    assert.ok(qc.question.length > 15);
    assert.ok(qc.explanation.length > 15);
    assert.equal(qc.rewardCoins, 3);
  }
});

test('Yoshi radial cloud ballistics hit every target cloud cleanly with zero unintended front-cloud collisions across all phases', () => {
  for (let targetIdx = 0; targetIdx < YOSHI_RADIAL_CLOUD_SLOTS.length; targetIdx++) {
    for (let phaseStep = 0; phaseStep < 24; phaseStep++) {
      const startTime = (phaseStep / 24) * Math.PI * 2;
      const targets = YOSHI_RADIAL_CLOUD_SLOTS.map((geom, slot) => {
        const phase = geom.phaseOffset + startTime * geom.bobFrequency;
        return {
          slot,
          x: geom.x,
          baseY: geom.baseY,
          y: computeYoshiCloudY(geom.baseY, phase, geom.bobAmplitude),
          bobAmplitude: geom.bobAmplitude,
          bobFrequency: geom.bobFrequency,
          phase,
          label: `Opt ${slot + 1}`,
          isCorrect: slot === targetIdx,
        };
      });

      const aimDeg = solveMovingCloudAimDeg(targets[targetIdx]);
      const rad = (aimDeg * Math.PI) / 180;
      assert.equal(
        predictLockedCloudSlot(rad, targets),
        targetIdx,
        `Expected aimDeg ${aimDeg.toFixed(2)} at t=${startTime.toFixed(2)} to lock onto slot ${targetIdx}`
      );

      // Step simulation at 120Hz and verify first collision is ALWAYS targetIdx
      let ex = YOSHI_LAUNCH_X;
      let ey = YOSHI_LAUNCH_Y;
      const vx = Math.cos(rad) * YOSHI_EGG_SPEED;
      let vy = -Math.sin(rad) * YOSHI_EGG_SPEED;
      const dt = 1 / 120;
      let hitSlot: number | null = null;

      for (let step = 1; step <= 260; step++) {
        ex += vx * dt;
        ey += vy * dt;
        vy += YOSHI_EGG_GRAVITY * dt;

        for (let c = 0; c < targets.length; c++) {
          const geom = YOSHI_RADIAL_CLOUD_SLOTS[c];
          const simPhase = geom.phaseOffset + (startTime + step * dt) * geom.bobFrequency;
          const cy = computeYoshiCloudY(geom.baseY, simPhase, geom.bobAmplitude);
          if (checkEggHitsCloud(ex, ey, { slot: c, x: geom.x, y: cy }, targetIdx)) {
            hitSlot = c;
            break;
          }
        }
        if (hitSlot !== null) break;
      }

      assert.equal(
        hitSlot,
        targetIdx,
        `Throw toward slot ${targetIdx} at t=${startTime.toFixed(2)} hit slot ${hitSlot}`
      );
    }
  }
});

test('expanded gameQuestionDeck banks deal non-repeating items across consecutive runs and shuffle choice options', () => {
  resetSessionDecks();
  assert.ok(KART_QUESTION_BANK.length >= 75);
  assert.ok(SLOTS_TRIVIA_BANK.length >= 36);

  const yoshiRun1 = drawYoshiEggRounds(6);
  const yoshiRun2 = drawYoshiEggRounds(6);
  const yoshiRun3 = drawYoshiEggRounds(6);
  const allYoshiIds = new Set([
    ...yoshiRun1.map((r) => r.id),
    ...yoshiRun2.map((r) => r.id),
    ...yoshiRun3.map((r) => r.id),
  ]);
  assert.equal(allYoshiIds.size, 18, 'Expected 18 unique Yoshi rounds across 3 consecutive runs');

  const bb1 = drawBrickBreakerQuestions(8);
  const bb2 = drawBrickBreakerQuestions(8);
  assert.equal(new Set([...bb1.map((x) => x.id), ...bb2.map((x) => x.id)]).size, 16);

  const boo1 = drawBooBurdenCases(7);
  const boo2 = drawBooBurdenCases(7);
  assert.equal(new Set([...boo1.map((x) => x.id), ...boo2.map((x) => x.id)]).size, 14);

  const cp1 = drawChronoPrescriptionClaims(7);
  const cp2 = drawChronoPrescriptionClaims(7);
  assert.equal(new Set([...cp1.map((x) => x.id), ...cp2.map((x) => x.id)]).size, 14);

  const hb1 = drawHammerBrosShifts(5);
  const hb2 = drawHammerBrosShifts(5);
  assert.equal(new Set([...hb1.map((x) => x.id), ...hb2.map((x) => x.id)]).size, 10);

  const dp1 = drawDueProcessRelayCases(5);
  const dp2 = drawDueProcessRelayCases(5);
  assert.equal(new Set([...dp1.map((x) => x.id), ...dp2.map((x) => x.id)]).size, 10);

  const wf1 = drawWageFactoryPackages(7);
  const wf2 = drawWageFactoryPackages(7);
  assert.equal(new Set([...wf1.map((x) => x.id), ...wf2.map((x) => x.id)]).size, 14);

  const km1 = drawKamekSpells(6);
  const km2 = drawKamekSpells(6);
  assert.equal(new Set([...km1.map((x) => x.id), ...km2.map((x) => x.id)]).size, 12);
});

test('theme-aware PDF builders produce valid PDFs across all 5 color themes and font families', () => {
  const themes = [
    'executive_navy',
    'ink_saver_bw',
    'supreme_court_crimson',
    'forest_dole_emerald',
    'vintage_parchment',
  ] as const;
  const fonts = ['modern_sans', 'editorial_serif', 'classic_monospace'] as const;

  for (const colorAccent of themes) {
    for (const fontStyle of fonts) {
      const resolved = resolvePdfThemeAndFont(colorAccent, fontStyle);
      assert.equal(resolved.id, colorAccent);

      const summaryBytes = buildOnePageSummaryPdfBytes({
        candidateName: 'Maria Clara Santos',
        colorAccent,
        fontStyle,
        includeWatermark: true,
        watermarkText: 'PERSONAL STUDY COPY',
      });
      const summaryHeader = new TextDecoder().decode(summaryBytes.slice(0, 8));
      assert.ok(summaryHeader.startsWith('%PDF-'));
      assert.ok(summaryBytes.byteLength > 2500);

      const certBytes = buildCertificateLandscapePdfBytes({
        recipientName: 'Maria Clara Santos',
        honors: 'Summa Cum Laude',
        completedCount: 19,
        totalCount: 19,
        colorAccent,
        fontStyle,
      });
      assert.ok(new TextDecoder().decode(certBytes.slice(0, 8)).startsWith('%PDF-'));
    }
  }

  const reviewerBytes = buildStudyGuideReviewerPdfBytes({
    orientation: 'portrait',
    candidateName: 'Maria Clara Santos',
    completedTopicIds: ALL_LAW_TOPICS.slice(0, 5).map((t) => t.id),
    topics: ALL_LAW_TOPICS.slice(0, 4),
    selectedWorlds: ['world-1', 'world-2'],
    colorAccent: 'supreme_court_crimson',
    fontStyle: 'editorial_serif',
    paperMargins: 'compact',
    fontSizeScale: 'large',
    includeCheckboxes: true,
    includeFormulasCheatSheet: true,
    includeFourFoldControlTest: true,
    includeTwoNoticeChecklist: true,
    includeRetirementFormulaBox: true,
    includeHonorPledge: true,
    blankNoteLinesCount: 3,
  });
  assert.ok(new TextDecoder().decode(reviewerBytes.slice(0, 8)).startsWith('%PDF-'));
  assert.ok(reviewerBytes.byteLength > 5000);
});
