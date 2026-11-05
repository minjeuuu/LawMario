import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCombatRating,
  determineBossRankTier,
  computeWorldBossRank,
  computeAllWorldsBossRanks,
  WORLD_BOSS_CATALOG,
} from './worldBossRank';
import { BossBattleLogEntry } from './round8Features';

test('worldBossRank: computes combat ratings and tiers accurately', () => {
  // Unranked
  const unranked = determineBossRankTier(0, 0);
  assert.equal(unranked.tier, 'UNRANKED');

  // SSS tier: High rating >= 9000
  const sss = determineBossRankTier(9200, 3);
  assert.equal(sss.tier, 'SSS');
  assert.ok(sss.tierTitle.includes('Super Star'));

  // S tier
  const s = determineBossRankTier(7400, 2);
  assert.equal(s.tier, 'S');

  // Rating math
  const highRating = computeCombatRating({
    accuracyPercent: 100,
    timeSeconds: 30,
    targetSeconds: 50,
    victoriesCount: 5,
  });
  assert.ok(highRating >= 9000, `High performance should achieve >=9000, got ${highRating}`);
});

test('worldBossRank: calculates World Boss rank summary from log entries', () => {
  const dummyLog: BossBattleLogEntry[] = [
    {
      id: 'bb-1',
      playedAtIso: '2026-11-05T10:00:00Z',
      modeLabel: 'World 1 Boss Foreman Spike Run',
      difficultyTier: 'Bar Master',
      score: 5,
      totalQuestions: 5,
      accuracyPercent: 100,
      timeTakenSeconds: 38,
      incorrectTopics: [],
      victory: true,
    },
    {
      id: 'bb-2',
      playedAtIso: '2026-11-04T10:00:00Z',
      modeLabel: 'World 1 Boss Foreman Spike Run',
      difficultyTier: 'Bar Master',
      score: 4,
      totalQuestions: 5,
      accuracyPercent: 80,
      timeTakenSeconds: 45,
      incorrectTopics: ['m1-hours-worked'],
      victory: true,
    },
  ];

  const w1Summary = computeWorldBossRank('world1', dummyLog);
  assert.equal(w1Summary.worldId, 'world1');
  assert.equal(w1Summary.totalBattles, 2);
  assert.equal(w1Summary.victories, 2);
  assert.equal(w1Summary.winRatePercent, 100);
  assert.equal(w1Summary.fastestClearSeconds, 38);
  assert.equal(w1Summary.bestAccuracyPercent, 100);
  assert.ok(['SSS', 'SS', 'S'].includes(w1Summary.tier));
});

test('worldBossRank: computes all worlds boss ranks dictionary', () => {
  const ranks = computeAllWorldsBossRanks([]);
  assert.ok(ranks['world1']);
  assert.ok(ranks['world2']);
  assert.ok(ranks['world3']);
  assert.ok(ranks['world4']);
  assert.ok(ranks['world5']);
  assert.ok(ranks['world6']);
  assert.ok(ranks['all']);
  assert.equal(ranks['world1'].tier, 'UNRANKED');
});
