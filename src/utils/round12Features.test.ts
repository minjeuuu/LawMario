import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_LAW_TOPICS } from '../data/laborLawData';
import { HERO_ROSTER } from '../data/heroesData';
import { getPrintFontCssStack } from './round11Features';
import {
  EXTENDED_PRINT_COLOR_THEMES,
  EXTENDED_PRINT_FONT_CATALOG,
  MARIO_NAVBAR_AMBIENCE_OPTIONS,
  PINBALL_PASS_SCORE,
  PINBALL_JACKPOT_SCORE,
  resolveExtendedPrintTheme,
  resolveExtendedPrintFont,
  buildCanvasFontString,
  computeOverallLaborLawProgress,
  toggleFavoriteTopicId,
  filterFavoriteTopics,
  stepKoopaPinballBall,
  computeCatcherFallDelta,
  evaluateArcadePassOutcome,
  resolveUniversalCardFrame,
  resolveCompanionInteraction,
  resolveEquippedRing,
  resolveEquippedNameplate,
  computeOwnedChambersAndRelicsSummary,
  hitMarioMysteryLawBlock,
} from './round12Features';
import {
  buildTrueFontStudyReviewerPdfBytesAsync,
  buildTrueFontCertificateOrDiplomaPdfBytesAsync,
} from './pdfTrueFontRenderer';

test('Print Studio exposes 52 color themes and 44 distinct true-rendered fonts with legacy alias compatibility', () => {
  assert.equal(EXTENDED_PRINT_COLOR_THEMES.length, 52);
  assert.equal(EXTENDED_PRINT_FONT_CATALOG.length, 44);

  const playfair = resolveExtendedPrintFont('playfair_royal');
  assert.equal(playfair.primaryFamily, 'Playfair Display');
  assert.ok(getPrintFontCssStack('playfair_royal').includes('Playfair Display'));

  const dmSansClean = resolveExtendedPrintFont('dm_sans_clean');
  assert.equal(dmSansClean.id, 'dm_sans_clean');
  assert.equal(dmSansClean.primaryFamily, 'DM Sans');

  const dmSansAlias = resolveExtendedPrintFont('dm_sans');
  assert.equal(dmSansAlias.id, 'dm_sans_clean');
  assert.equal(dmSansAlias.primaryFamily, 'DM Sans');

  const outfit = resolveExtendedPrintFont('outfit_geometric');
  assert.equal(outfit.primaryFamily, 'Outfit');

  const jetbrains = resolveExtendedPrintFont('jetbrains_tabular');
  assert.equal(jetbrains.primaryFamily, 'JetBrains Mono');

  const pixel = resolveExtendedPrintFont('press_start_mario');
  assert.equal(pixel.primaryFamily, 'Press Start 2P');
  assert.ok(buildCanvasFontString(pixel, 700, 14, true).includes('Press Start 2P'));

  const theme = resolveExtendedPrintTheme('mario_crimson');
  assert.equal(theme.id, 'mario_crimson');
  assert.ok(theme.headerBgHex.startsWith('#'));
});

test('True-Font PDF renderer produces valid %PDF- bytes in Node fallback and browser modes', async () => {
  const reviewerPdf = await buildTrueFontStudyReviewerPdfBytesAsync({
    topics: ALL_LAW_TOPICS.slice(0, 3),
    selectedWorlds: ['world1'],
    completedTopicIds: [ALL_LAW_TOPICS[0].id],
    includeMultipliers: true,
    includeRegionalWages: true,
    includePersonalNotes: false,
    studyNotes: [],
    fontStyle: 'playfair_royal',
    colorAccent: 'mario_crimson',
    orientation: 'portrait',
    includeBarTips: true,
  });
  const header = Buffer.from(reviewerPdf.slice(0, 5)).toString('ascii');
  assert.equal(header, '%PDF-');

  const diplomaPdf = await buildTrueFontCertificateOrDiplomaPdfBytesAsync(
    {
      recipientName: 'Atty. Mario Counsel',
      honors: 'Summa Cum Laude',
      completedCount: ALL_LAW_TOPICS.length,
      totalCount: ALL_LAW_TOPICS.length,
      dateLabel: 'November 4, 2026',
      orientation: 'landscape',
      colorAccent: 'classic_navy',
      fontStyle: 'cinzel_imperial',
    },
    true
  );
  assert.equal(Buffer.from(diplomaPdf.slice(0, 5)).toString('ascii'), '%PDF-');
});

test('Overall Labor Law progress bar computes accurate overall %, milestones, and 6-world breakdown', () => {
  const halfCount = Math.ceil(ALL_LAW_TOPICS.length / 2);
  const completedTopicIds = ALL_LAW_TOPICS.slice(0, halfCount).map((t) => t.id);
  const summary = computeOverallLaborLawProgress({
    allTopics: ALL_LAW_TOPICS,
    completedTopicIds,
  });

  assert.equal(summary.totalTopics, ALL_LAW_TOPICS.length);
  assert.equal(summary.completedTopics, halfCount);
  assert.ok(summary.topicPercent >= 50);
  assert.equal(summary.worldBreakdown.length, 6);
  assert.equal(summary.milestones[0].reached, true); // 25%
  assert.equal(summary.milestones[1].reached, true); // 50%
});

test('Favorite topic toggle and WorldMap Favorites filter work deterministically', () => {
  const firstId = ALL_LAW_TOPICS[0].id;
  const secondId = ALL_LAW_TOPICS[1].id;

  const res1 = toggleFavoriteTopicId([], firstId);
  assert.equal(res1.isNowFavorite, true);
  assert.deepEqual(res1.nextIds, [firstId]);

  const res2 = toggleFavoriteTopicId(res1.nextIds, secondId);
  assert.equal(res2.isNowFavorite, true);
  assert.deepEqual(res2.nextIds, [secondId, firstId]);

  const filtered = filterFavoriteTopics(ALL_LAW_TOPICS, res2.nextIds);
  assert.equal(filtered.length, 2);
  assert.equal(filtered[0].id, secondId);

  const res3 = toggleFavoriteTopicId(res2.nextIds, firstId);
  assert.equal(res3.isNowFavorite, false);
  assert.deepEqual(res3.nextIds, [secondId]);
});

test('Study Ambience options include Overworld Breeze and Underground Echoes', () => {
  const ids = MARIO_NAVBAR_AMBIENCE_OPTIONS.map((o) => o.id);
  assert.ok(ids.includes('off'));
  assert.ok(ids.includes('overworld_breeze'));
  assert.ok(ids.includes('underground_echoes'));
});

test('Koopa Pinball drains shells through center pit (212..308), slopes unpressed flippers, and triggers Game Over at 0 shells', () => {
  // 1. Unpressed left flipper slopes ball downward & inward instead of auto-bouncing upward
  const unpressedStep = stepKoopaPinballBall({
    x: 160,
    y: 298,
    vx: 0,
    vy: 180,
    rawDt: 0.016,
    leftFlip: false,
    rightFlip: false,
    ballsLeft: 3,
    score: 0,
  });
  assert.ok(unpressedStep.vy > 0, 'Unpressed flipper must not auto-bounce upward');
  assert.ok(unpressedStep.vx > 0, 'Unpressed left flipper slopes ball toward center drain');

  // 2. Actively pressed left flipper launches ball upward at -425 px/s
  const pressedStep = stepKoopaPinballBall({
    x: 160,
    y: 298,
    vx: 0,
    vy: 180,
    rawDt: 0.016,
    leftFlip: true,
    rightFlip: false,
    ballsLeft: 3,
    score: 0,
  });
  assert.equal(pressedStep.bouncedFlipper, 'left');
  assert.ok(pressedStep.vy <= -400);

  // 3. Ball falling through center drain pit (x = 260) loses last shell and triggers gameOver: true
  const drainLoss = stepKoopaPinballBall({
    x: 260,
    y: 336,
    vx: 0,
    vy: 220,
    rawDt: 0.03,
    leftFlip: true,
    rightFlip: true,
    ballsLeft: 1,
    score: 500,
  });
  assert.equal(drainLoss.drainedThisStep, true);
  assert.equal(drainLoss.ballsLeft, 0);
  assert.equal(drainLoss.gameOver, true);
  assert.ok(PINBALL_PASS_SCORE >= 1800);
  assert.ok(PINBALL_JACKPOT_SCORE >= 2500);
});

test('Catcher speed clamping and Arcade pass outcomes prevent hyper-fast falls and unearned coins', () => {
  const deltaNormal = computeCatcherFallDelta(110, 0.016);
  assert.ok(deltaNormal > 1.5 && deltaNormal < 2.2);

  // Huge frame hiccup dt=0.5s is clamped to 0.05s and speed clamped <= 165 px/s
  const deltaSpike = computeCatcherFallDelta(999, 0.5);
  assert.ok(deltaSpike <= 165 * 0.05 + 0.001);

  const failOutcome = evaluateArcadePassOutcome({
    score: 120,
    passScore: 220,
    passCoins: 10,
  });
  assert.equal(failOutcome.passed, false);
  assert.equal(failOutcome.coinsEarned, 0);

  const passOutcome = evaluateArcadePassOutcome({
    score: 260,
    passScore: 220,
    passCoins: 12,
  });
  assert.equal(passOutcome.passed, true);
  assert.equal(passOutcome.coinsEarned, 12);
});

test('All Toad Shop buyable Card Frames, Companions, Nameplates, Chambers, Relics, and [?] Block work end-to-end', () => {
  const stainedFrame = resolveUniversalCardFrame('frame_peach_stained_glass');
  assert.equal(stainedFrame.id, 'frame_peach_stained_glass');
  assert.ok(stainedFrame.borderClasses.includes('border-pink-400'));

  const gearFrame = resolveUniversalCardFrame('gear_frame_diamond_platinum');
  assert.equal(gearFrame.id, 'gear_frame_diamond_platinum');
  assert.equal(gearFrame.badgeText, 'TOPNOTCHER PLATINUM');

  const yoshiPet = resolveCompanionInteraction('comp_baby_yoshi', 1);
  assert.equal(yoshiPet.bonusCoinsPerTopic, 1);
  assert.equal(yoshiPet.avatarKey, 'goldenyoshi');
  assert.ok(yoshiPet.speech.length > 15);

  const plate = resolveEquippedNameplate('plate_summa_cum_codal');
  assert.ok(plate);
  assert.equal(plate.id, 'plate_summa_cum_codal');
  assert.ok(plate.name.includes('Summa Cum Codal'));

  const prestige = computeOwnedChambersAndRelicsSummary([
    'chamber_narra_gavel_podium',
    'relic_pd442_first_edition',
  ]);
  assert.equal(prestige.ownedChambersCount, 1);
  assert.equal(prestige.ownedRelicsCount, 1);
  assert.ok(prestige.chambersBonusPct >= 2);

  const hit1 = hitMarioMysteryLawBlock({ hitCountToday: 0, dropCursor: 0 });
  assert.equal(hit1.coinsAwarded, 2);
  assert.equal(hit1.nextHitCountToday, 1);
  assert.ok(hit1.drop.mnemonicTitle.length > 5);

  // Verify new card frames
  const glacierFrame = resolveUniversalCardFrame('frame_glacier_crystal');
  assert.equal(glacierFrame.badgeText, 'GLACIER CRYSTAL');
  assert.ok(glacierFrame.borderClasses.includes('border-cyan-300'));

  const execFrame = resolveUniversalCardFrame('frame_midnight_executive');
  assert.equal(execFrame.badgeText, 'MIDNIGHT EXECUTIVE');

  const auroraFrame = resolveUniversalCardFrame('frame_aurora_borealis');
  assert.equal(auroraFrame.badgeText, 'AURORA BOREALIS');

  // Verify new rings
  const megaRing = resolveEquippedRing('ring_mega_mushroom');
  assert.ok(megaRing.perkEffect.includes('Boss Battles'));

  const boomRing = resolveEquippedRing('ring_boomerang_flower');
  assert.ok(boomRing.perkEffect.includes('recovery'));

  const cloudRing = resolveEquippedRing('ring_cloud_flower');
  assert.ok(cloudRing.perkEffect.includes('+3 Bonus Coins'));

  // Verify new companions
  const rosalinaBuddy = resolveCompanionInteraction('comp_rosalina_star');
  assert.equal(rosalinaBuddy.avatarKey, 'rosalina');
  assert.equal(rosalinaBuddy.bonusCoinsPerTopic, 2);

  const warioBuddy = resolveCompanionInteraction('comp_wario_tax_auditor');
  assert.equal(warioBuddy.avatarKey, 'wario');
  assert.ok(warioBuddy.speech.includes('13th-Month Pay'));

  // Verify new heroes in roster
  const egadd = HERO_ROSTER.find((h) => h.id === 'egadd');
  assert.ok(egadd);
  assert.equal(egadd.name, 'Prof. Elvin Gadd');

  const paulinemetro = HERO_ROSTER.find((h) => h.id === 'paulinemetro');
  assert.ok(paulinemetro);
  assert.equal(paulinemetro.faction, 'Royal Court');

  const diddyscholar = HERO_ROSTER.find((h) => h.id === 'diddyscholar');
  assert.ok(diddyscholar);
  assert.equal(diddyscholar.shopPrice, 45);
});
