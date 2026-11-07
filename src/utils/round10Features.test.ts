import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ROUND10_ALL_NEW_SHOP_ITEMS,
  LAW_CHAMBERS_UPGRADE_ITEMS,
  ARCADE_AND_QUIZ_CONSUMABLE_ITEMS,
  CLICK_AND_CONFETTI_FX_ITEMS,
  RELICS_AND_NAMEPLATES_ITEMS,
  EXTENDED_COMPANIONS_AND_FRAMES_ITEMS,
  COIN_UTILITY_DESTINATIONS,
  computeLawChambersPrestige,
  resolveLuckyWheelSpin,
  generatePayrollVoucher,
  evaluatePayrollStampDecision,
  buildStatutoryWordHuntGrid,
  resolveWordHuntHint,
  applyCommissionerRuling,
  stepPlatformerVerticalPhysics,
  getCertificateOrientationSpec,
  MASTER_DIPLOMA_TRANSCRIPT_PILLARS,
  loadRound10VaultState,
  saveRound10VaultState,
} from './round10Features';
import {
  buildCertificatePdfBytes,
  buildMasterDiplomaPdfBytes,
} from './pdfExportService';

test('Toad Shop expansion ships 100+ unique new purchasable items across 5 new categories', () => {
  assert.ok(
    ROUND10_ALL_NEW_SHOP_ITEMS.length >= 110,
    `Expected >= 110 new items, got ${ROUND10_ALL_NEW_SHOP_ITEMS.length}`
  );
  const ids = new Set(ROUND10_ALL_NEW_SHOP_ITEMS.map((i) => i.id));
  assert.equal(ids.size, ROUND10_ALL_NEW_SHOP_ITEMS.length, 'Every shop item ID must be unique');
  assert.equal(LAW_CHAMBERS_UPGRADE_ITEMS.length, 18);
  assert.equal(ARCADE_AND_QUIZ_CONSUMABLE_ITEMS.length, 20);
  assert.equal(CLICK_AND_CONFETTI_FX_ITEMS.length, 16);
  assert.equal(RELICS_AND_NAMEPLATES_ITEMS.length, 34);
  assert.equal(EXTENDED_COMPANIONS_AND_FRAMES_ITEMS.length, 24);
});

test('Where Can I Use My Coins directory covers quizzes, arcade, chambers, wheel, and diploma', () => {
  assert.equal(COIN_UTILITY_DESTINATIONS.length, 8);
  const targets = COIN_UTILITY_DESTINATIONS.map((d) => d.targetValue);
  assert.ok(targets.includes('quiz'));
  assert.ok(targets.includes('vault'));
  assert.ok(targets.includes('law_chambers'));
  assert.ok(targets.includes('certificate'));
});

test('Law Chambers prestige and Round 10 storage round-trip cleanly', () => {
  const prestige = computeLawChambersPrestige([
    'chamber_mahogany_desk',
    'chamber_starlight_chandelier',
  ]);
  assert.equal(prestige.unlockedCount, 2);
  assert.equal(prestige.bonusCoinPct, 5);

  const mem = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
  };
  const initial = loadRound10VaultState(mockStorage);
  initial.inventory.quiz5050 += 4;
  initial.equippedNameplate = 'FUTURE BAR TOPNOTCHER';
  initial.equippedGearId = 'gear_warp_pipe_bookends';
  saveRound10VaultState(initial, mockStorage);
  const reloaded = loadRound10VaultState(mockStorage);
  assert.equal(reloaded.inventory.quiz5050, 5);
  assert.equal(reloaded.equippedNameplate, 'FUTURE BAR TOPNOTCHER');
  assert.equal(reloaded.equippedGearId, 'gear_warp_pipe_bookends');
});

test('Lucky Wheel deterministic resolver scales rewards for Standard vs High-Roller spins', () => {
  const std = resolveLuckyWheelSpin(0.01, false);
  const high = resolveLuckyWheelSpin(0.01, true);
  assert.equal(std.wedgeIndex, 0);
  assert.equal(high.effectiveAmount, std.effectiveAmount * 3);
});

test('DOLE Payroll Inspector generates valid compliant and statutory-violation vouchers', () => {
  const vCompliant = generatePayrollVoucher(0);
  assert.equal(vCompliant.isCompliant, true);
  assert.equal(evaluatePayrollStampDecision(vCompliant, true).correct, true);
  assert.equal(evaluatePayrollStampDecision(vCompliant, false).correct, false);

  const vSubMin = generatePayrollVoucher(1);
  assert.equal(vSubMin.isCompliant, false);
  assert.equal(vSubMin.violationCode, 'sub_minimum_wage');
  assert.equal(evaluatePayrollStampDecision(vSubMin, false).correct, true);

  const vUnderOt = generatePayrollVoucher(2);
  assert.equal(vUnderOt.isCompliant, false);
  assert.equal(vUnderOt.violationCode, 'underpaid_ot');
});

test('Bar Codal Word Hunt places every statutory term cleanly and resolves 4-tier hints', () => {
  const board = buildStatutoryWordHuntGrid(0);
  assert.equal(board.size, 10);
  assert.equal(board.placements.length, 6);
  for (const p of board.placements) {
    const spelled = p.cells.map((cell) => board.grid[cell.r][cell.c]).join('');
    assert.equal(spelled, p.word);
  }
  const first = board.placements[0];
  assert.match(resolveWordHuntHint(first, 1), /Starts with/);
  assert.match(resolveWordHuntHint(first, 2), /Orientation/);
  assert.match(resolveWordHuntHint(first, 3), /Row/);
  assert.match(resolveWordHuntHint(first, 4), /highlighted/);
});

test('Commissioner 4-meter balance simulator clamps meters between 0 and 100', () => {
  const updated = applyCommissionerRuling(
    { workerWelfare: 95, complianceRate: 50, enterpriseStability: 8, publicTrust: 50 },
    { workerWelfare: 20, enterpriseStability: -25 }
  );
  assert.equal(updated.workerWelfare, 100);
  assert.equal(updated.enterpriseStability, 0);
});

test('Platformer physics clamps dt, honors coyote buffered jump, and applies variable jump cut', () => {
  const jumped = stepPlatformerVerticalPhysics({
    y: 300,
    vy: 0,
    groundY: 300,
    rawDt: 0.25,
    coyoteTimer: 0.1,
    jumpBufferTimer: 0.12,
    jumpCutRequested: false,
  });
  assert.equal(jumped.jumpedThisStep, true);
  assert.ok(jumped.y < 300);

  const cut = stepPlatformerVerticalPhysics({
    y: 240,
    vy: -500,
    groundY: 300,
    rawDt: 0.016,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    jumpCutRequested: true,
  });
  assert.ok(cut.vy > -250, 'Upward velocity should be cut when jump is released early');
});

test('Certificate & Master Diploma orientation specs and distinct PDF generators produce valid %PDF- bytes', () => {
  const land = getCertificateOrientationSpec('landscape');
  const port = getCertificateOrientationSpec('portrait');
  assert.equal(land.widthMm, 297);
  assert.equal(land.heightMm, 210);
  assert.equal(port.widthMm, 210);
  assert.equal(port.heightMm, 297);
  assert.equal(MASTER_DIPLOMA_TRANSCRIPT_PILLARS.length, 6);

  const certLand = buildCertificatePdfBytes({
    recipientName: 'Atty. Maria Clara',
    completedCount: 40,
    totalCount: 40,
    orientation: 'landscape',
  });
  const certPort = buildCertificatePdfBytes({
    recipientName: 'Atty. Maria Clara',
    completedCount: 40,
    totalCount: 40,
    orientation: 'portrait',
  });
  const dipLand = buildMasterDiplomaPdfBytes({
    recipientName: 'Atty. Maria Clara',
    completedCount: 40,
    totalCount: 40,
    orientation: 'landscape',
  });
  const dipPort = buildMasterDiplomaPdfBytes({
    recipientName: 'Atty. Maria Clara',
    completedCount: 40,
    totalCount: 40,
    orientation: 'portrait',
  });

  const header = (bytes: Uint8Array) =>
    String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4]);
  assert.equal(header(certLand), '%PDF-');
  assert.equal(header(certPort), '%PDF-');
  assert.equal(header(dipLand), '%PDF-');
  assert.equal(header(dipPort), '%PDF-');
  assert.notDeepEqual(certLand, dipLand, 'Master Diploma PDF must be distinct from Print Certificate PDF');
});
