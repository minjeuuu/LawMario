// Pure deterministic physics & obstacle reducer for 'Super Mario Coin Rush: Labor Shield Run'
import { StorageLike } from './round11Features';

export const COIN_RUSH_HIGH_SCORE_KEY = 'mario_coin_rush_high_score_v1';

export interface CoinRushPlatform {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CoinRushCollectible {
  id: number;
  x: number;
  y: number;
  kind: 'coin' | 'star' | 'mushroom';
  collected: boolean;
  doctrineTip: string;
}

export interface CoinRushObstacle {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  minX: number;
  maxX: number;
  violationTitle: string;
  articleRef: string;
}

export interface CoinRushGameState {
  width: number;
  height: number;
  groundY: number;
  playerX: number;
  playerY: number;
  playerW: number;
  playerH: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  score: number;
  coinsCollected: number;
  streakCombo: number;
  lives: number;
  shieldTimerSec: number;
  invulnTimerSec: number;
  timeRemainingSec: number;
  status: 'idle' | 'playing' | 'finished';
  lastBannerText: string;
  platforms: CoinRushPlatform[];
  collectibles: CoinRushCollectible[];
  obstacles: CoinRushObstacle[];
  nextEntityId: number;
}

const DOCTRINE_PICKUP_TIPS = [
  'Art. 87: Overtime beyond 8h = +25% Hourly Rate!',
  'P.D. 851: 13th-Month Pay = Basic Salary / 12!',
  'Art. 95: 5-Day Service Incentive Leave is commutable!',
  'Art. 297: Twin-Notice + Hearing = Valid Procedural Due Process!',
  'R.A. 7641: Retirement Pay = 22.5 Days per Year of Service!',
  'R.A. 11210: 105 Days Expanded Maternity Leave with full pay!',
];

const LABOR_VIOLATION_HAZARDS = [
  { title: 'Endo Contrivance', ref: 'Art. 295' },
  { title: 'Unpaid OT Spike', ref: 'Art. 87' },
  { title: 'Sub-Min Goomba', ref: 'R.A. 6727' },
  { title: 'Illegal Deduction', ref: 'Art. 113' },
  { title: 'No Twin-Notice', ref: 'Art. 297' },
];

export function createInitialCoinRushState(seed = 1): CoinRushGameState {
  const width = 560;
  const height = 270;
  const groundY = 232;

  const platforms: CoinRushPlatform[] = [
    { x: 48, y: 175, w: 120, h: 12 },
    { x: 220, y: 142, w: 125, h: 12 },
    { x: 392, y: 175, w: 120, h: 12 },
  ];

  const collectibles: CoinRushCollectible[] = [];
  let nextId = 1;

  // Spawn initial row of coins + star across platforms & ground
  const coinCoords: Array<{ x: number; y: number; kind: 'coin' | 'star' | 'mushroom' }> = [
    { x: 75, y: 148, kind: 'coin' },
    { x: 115, y: 148, kind: 'coin' },
    { x: 255, y: 114, kind: 'star' },
    { x: 300, y: 114, kind: 'coin' },
    { x: 425, y: 148, kind: 'coin' },
    { x: 468, y: 148, kind: 'coin' },
    { x: 165, y: 205, kind: 'coin' },
    { x: 345, y: 205, kind: 'mushroom' },
  ];

  coinCoords.forEach((c, idx) => {
    collectibles.push({
      id: nextId++,
      x: c.x,
      y: c.y,
      kind: c.kind,
      collected: false,
      doctrineTip: DOCTRINE_PICKUP_TIPS[(idx + seed) % DOCTRINE_PICKUP_TIPS.length],
    });
  });

  const obstacles: CoinRushObstacle[] = [
    {
      id: nextId++,
      x: 150,
      y: groundY - 26,
      w: 28,
      h: 26,
      vx: 72,
      minX: 40,
      maxX: 255,
      violationTitle: LABOR_VIOLATION_HAZARDS[0].title,
      articleRef: LABOR_VIOLATION_HAZARDS[0].ref,
    },
    {
      id: nextId++,
      x: 420,
      y: groundY - 26,
      w: 28,
      h: 26,
      vx: -85,
      minX: 295,
      maxX: 505,
      violationTitle: LABOR_VIOLATION_HAZARDS[1].title,
      articleRef: LABOR_VIOLATION_HAZARDS[1].ref,
    },
  ];

  return {
    width,
    height,
    groundY,
    playerX: 268,
    playerY: groundY - 30,
    playerW: 24,
    playerH: 30,
    vx: 0,
    vy: 0,
    onGround: true,
    facing: 1,
    score: 0,
    coinsCollected: 0,
    streakCombo: 0,
    lives: 3,
    shieldTimerSec: 0,
    invulnTimerSec: 0,
    timeRemainingSec: 35,
    status: 'playing',
    lastBannerText: 'Collect Coins & Super Stars — Dodge Labor Violations!',
    platforms,
    collectibles,
    obstacles,
    nextEntityId: nextId,
  };
}

export interface CoinRushInput {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export function stepCoinRushState(
  state: CoinRushGameState,
  input: CoinRushInput,
  rawDt: number,
  entropy = Date.now()
): CoinRushGameState {
  if (state.status !== 'playing') return state;

  const dt = Math.min(0.05, Math.max(0.004, rawDt));
  const nextTime = Math.max(0, state.timeRemainingSec - dt);
  if (nextTime <= 0) {
    return {
      ...state,
      timeRemainingSec: 0,
      status: 'finished',
      lastBannerText: 'Time Up! Final Labor Shield Tally Recorded.',
    };
  }

  let vx = 0;
  let facing = state.facing;
  const moveSpeed = 235;
  if (input.left && !input.right) {
    vx = -moveSpeed;
    facing = -1;
  } else if (input.right && !input.left) {
    vx = moveSpeed;
    facing = 1;
  }

  let vy = state.vy;
  let onGround = state.onGround;
  if (input.jump && onGround) {
    vy = -445;
    onGround = false;
  }

  vy += 1180 * dt; // Gravity
  let nextX = Math.max(8, Math.min(state.width - state.playerW - 8, state.playerX + vx * dt));
  let nextY = state.playerY + vy * dt;

  // Platform top landings
  onGround = false;
  if (vy >= 0) {
    for (const plat of state.platforms) {
      const horizOverlap = nextX + state.playerW > plat.x + 4 && nextX < plat.x + plat.w - 4;
      const prevBottom = state.playerY + state.playerH;
      const nextBottom = nextY + state.playerH;
      if (horizOverlap && prevBottom <= plat.y + 6 && nextBottom >= plat.y) {
        nextY = plat.y - state.playerH;
        vy = 0;
        onGround = true;
        break;
      }
    }
  }

  // Floor collision
  if (nextY + state.playerH >= state.groundY) {
    nextY = state.groundY - state.playerH;
    vy = 0;
    onGround = true;
  }

  let score = state.score;
  let coinsCollected = state.coinsCollected;
  let streakCombo = state.streakCombo;
  let lives = state.lives;
  let shieldTimerSec = Math.max(0, state.shieldTimerSec - dt);
  let invulnTimerSec = Math.max(0, state.invulnTimerSec - dt);
  let lastBannerText = state.lastBannerText;
  let nextEntityId = state.nextEntityId;

  // Collectibles pickup check
  const pCenterX = nextX + state.playerW / 2;
  const pCenterY = nextY + state.playerH / 2;

  const updatedCollectibles = state.collectibles.map((item) => {
    if (item.collected) return item;
    const dist = Math.hypot(pCenterX - item.x, pCenterY - item.y);
    if (dist <= 24) {
      streakCombo += 1;
      coinsCollected += item.kind === 'star' ? 3 : 1;
      const pts =
        (item.kind === 'star' ? 120 : item.kind === 'mushroom' ? 80 : 35) +
        Math.min(50, streakCombo * 5);
      score += pts;
      if (item.kind === 'star') {
        shieldTimerSec = 5.5;
        lastBannerText = `Star Invincibility! +${pts} pts — ${item.doctrineTip}`;
      } else {
        lastBannerText = `+${pts} pts — ${item.doctrineTip}`;
      }
      return { ...item, collected: true };
    }
    return item;
  });

  // Respawn fresh batch of collectibles if all collected
  const remaining = updatedCollectibles.filter((c) => !c.collected);
  let finalCollectibles = updatedCollectibles.filter((c) => !c.collected);
  if (remaining.length <= 2) {
    const waveSpots = [
      { x: 65 + ((entropy * 13) % 70), y: 146 },
      { x: 240 + ((entropy * 29) % 85), y: 112 },
      { x: 405 + ((entropy * 17) % 85), y: 146 },
      { x: 140 + ((entropy * 31) % 240), y: 204 },
    ];
    waveSpots.forEach((spot, i) => {
      const kind: 'coin' | 'star' | 'mushroom' =
        i === 1 && (entropy + i) % 3 === 0
          ? 'star'
          : i === 3 && (entropy + i) % 4 === 0
          ? 'mushroom'
          : 'coin';
      finalCollectibles.push({
        id: nextEntityId++,
        x: Math.round(spot.x),
        y: spot.y,
        kind,
        collected: false,
        doctrineTip:
          DOCTRINE_PICKUP_TIPS[(entropy + nextEntityId + i) % DOCTRINE_PICKUP_TIPS.length],
      });
    });
  }

  // Obstacles patrol & AABB collision with Labor Violations
  let status: CoinRushGameState['status'] = 'playing';
  const updatedObstacles = state.obstacles.map((obs) => {
    let ox = obs.x + obs.vx * dt;
    let ovx = obs.vx;
    if (ox <= obs.minX) {
      ox = obs.minX;
      ovx = Math.abs(ovx);
    } else if (ox >= obs.maxX) {
      ox = obs.maxX;
      ovx = -Math.abs(ovx);
    }

    const overlaps =
      nextX + state.playerW - 4 > ox &&
      nextX + 4 < ox + obs.w &&
      nextY + state.playerH - 2 > obs.y &&
      nextY + 4 < obs.y + obs.h;

    if (overlaps) {
      // Check if stomping from above or protected by Star Shield
      const isStomp = vy > 0 && state.playerY + state.playerH <= obs.y + 12;
      if (shieldTimerSec > 0 || isStomp) {
        score += 90;
        if (isStomp) {
          vy = -310;
        }
        lastBannerText = `Nullified ${obs.violationTitle} (${obs.articleRef})! +90 Bonus XP!`;
        // Bounce obstacle back to opposite patrol edge
        ox = ovx > 0 ? obs.maxX : obs.minX;
      } else if (invulnTimerSec <= 0) {
        lives = Math.max(0, lives - 1);
        streakCombo = 0;
        invulnTimerSec = 1.6;
        lastBannerText = `Hit ${obs.violationTitle} (${obs.articleRef})! -1 Shield Heart!`;
        if (lives <= 0) {
          status = 'finished';
        }
      }
    }

    return {
      ...obs,
      x: ox,
      vx: ovx,
    };
  });

  return {
    ...state,
    playerX: nextX,
    playerY: nextY,
    vx,
    vy,
    onGround,
    facing,
    score,
    coinsCollected,
    streakCombo,
    lives,
    shieldTimerSec,
    invulnTimerSec,
    timeRemainingSec: nextTime,
    status,
    lastBannerText,
    collectibles: finalCollectibles,
    obstacles: updatedObstacles,
    nextEntityId,
  };
}

export function loadCoinRushHighScore(storage?: StorageLike): number {
  if (!storage) return 0;
  try {
    const raw = storage.getItem(COIN_RUSH_HIGH_SCORE_KEY);
    const val = Number(raw);
    return Number.isFinite(val) && val > 0 ? Math.round(val) : 0;
  } catch {
    return 0;
  }
}

export function saveCoinRushHighScore(score: number, storage?: StorageLike): number {
  const prev = loadCoinRushHighScore(storage);
  const best = Math.max(prev, Math.max(0, Math.round(score)));
  if (storage) {
    try {
      storage.setItem(COIN_RUSH_HIGH_SCORE_KEY, String(best));
    } catch {
      // ignore
    }
  }
  return best;
}
