import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MarioAvatar } from '../types/laborLaw';
import { getHeroMeta } from '../data/heroesData';
import { MarioCharacterAvatar, MarioCoinIcon, MarioStarIcon } from './MarioIcons';
import { marioAudio } from '../utils/audio';
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Heart,
  Crosshair,
  Eye,
  Timer,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Flame,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import {
  YOSHI_LAUNCH_X,
  YOSHI_LAUNCH_Y,
  YOSHI_EGG_SPEED,
  YOSHI_EGG_GRAVITY,
  YOSHI_MIN_AIM_DEG,
  YOSHI_MAX_AIM_DEG,
  YOSHI_RADIAL_CLOUD_SLOTS,
  YoshiTargetState,
  computeYoshiCloudY,
  solveMovingCloudAimDeg,
  checkEggHitsCloud,
  predictLockedCloudSlot,
} from '../utils/yoshiBallistics';
import {
  drawBrickBreakerQuestions,
  drawYoshiEggRounds,
  YoshiEggRoundItem,
  drawBooBurdenCases,
  drawChronoPrescriptionClaims,
} from '../utils/gameQuestionDeck';

interface NewVaultGameProps {
  equippedAvatar: MarioAvatar;
  onEarnCoins: (amount: number) => void;
}

type ArcadeShellState = 'title' | 'playing' | 'paused' | 'victory' | 'gameover';

interface EndRunSnapshot {
  score: number;
  best: number;
  cleared: number;
  total: number;
  coinsEarned: number;
}

function hasAutoStartParam(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('autostart') === '1';
  } catch {
    return false;
  }
}

function syncBodyGameState(state: ArcadeShellState) {
  if (typeof document === 'undefined') return;
  document.body.dataset.state =
    state === 'victory' || state === 'gameover' ? 'gameover' : state;
}

// ============================================================================
// 1. KOOPA SHELL STATUTORY BRICK BREAKER (Canvas2D Breakout + Pooled Particles)
// ============================================================================

interface StatutoryBrick {
  x: number;
  y: number;
  w: number;
  h: number;
  alive: boolean;
  hp: number;
  isQuestionBlock: boolean;
  color: string;
  rateTag: string;
  doctrine: string;
  hitFlash: number;
}

interface PooledParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export const KOOPA_BREAKER_DOCTRINES: { rateTag: string; doctrine: string }[] = [
  { rateTag: '125% OT', doctrine: 'Art. 87: Ordinary day overtime = Regular Hourly Wage × 125%.' },
  { rateTag: '+10% NSD', doctrine: 'Art. 86: Night Shift Differential = at least +10% per hour between 10:00 PM and 6:00 AM.' },
  { rateTag: '130% RD', doctrine: 'Art. 93(a): Work on scheduled Rest Day or Special Non-Working Day = 130% of basic wage.' },
  { rateTag: '150% RD+SD', doctrine: 'Art. 93(c): Special Non-Working Day falling on scheduled Rest Day = 150% of basic wage.' },
  { rateTag: '200% HOL', doctrine: 'Art. 94(b): Work on a Regular Holiday (first 8 hours) = 200% of regular daily wage.' },
  { rateTag: '260% HOL+RD', doctrine: 'Art. 94: Regular Holiday work falling on scheduled Rest Day = 260% (200% × 1.30).' },
  { rateTag: '300% 2xHOL', doctrine: 'DOLE Handbook: Work on a Double Regular Holiday (e.g., Araw ng Kagitingan + Maundy Thursday) = 300%.' },
  { rateTag: '390% MAX', doctrine: 'DOLE Handbook: Double Regular Holiday falling on Rest Day = 390% (300% × 1.30); OT adds ×1.30!' },
  { rateTag: '1/12 13TH', doctrine: 'P.D. 851: Mandatory 13th Month Pay = at least 1/12 of total basic salary earned in a calendar year (due Dec 24).' },
  { rateTag: '5d SIL', doctrine: 'Art. 95: Service Incentive Leave = 5 days with pay after at least 1 year of service; commutable to cash.' },
  { rateTag: '100% SC', doctrine: 'R.A. 11360 (Art. 96): 100% of collected Service Charges distributed equally to covered rank-and-file.' },
  { rateTag: '105d MAT', doctrine: 'R.A. 11210: 105 days paid Maternity Leave (+15 days for Solo Parents) regardless of civil status or frequency.' },
];

export const KoopaBrickBreakerGame: React.FC<NewVaultGameProps> = ({
  equippedAvatar,
  onEarnCoins,
}) => {
  const hero = getHeroMeta(equippedAvatar);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onEarnCoinsRef = useRef(onEarnCoins);
  onEarnCoinsRef.current = onEarnCoins;

  const [shellState, setShellState] = useState<ArcadeShellState>(() =>
    hasAutoStartParam() ? 'playing' : 'title'
  );
  const [hudScore, setHudScore] = useState(0);
  const [hudLives, setHudLives] = useState(3);
  const [hudBricksLeft, setHudBricksLeft] = useState(24);
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('mario_koopa_breaker_best') || '0');
    } catch {
      return 0;
    }
  });
  const [activeBanner, setActiveBanner] = useState<string>(
    'Hit [?] Gold Blocks with the Koopa Shell to pop statutory Labor Code multipliers!'
  );
  const [snapshot, setSnapshot] = useState<EndRunSnapshot | null>(null);

  const simRef = useRef({
    paddleX: 315,
    paddleW: 130,
    wideTimer: 0,
    shellX: 380,
    shellY: 372,
    shellVx: 235,
    shellVy: -265,
    shellLaunched: false,
    shellSpin: 0,
    lives: 3,
    score: 0,
    coinsEarned: 0,
    hitstop: 0,
    shake: 0,
    bricks: [] as StatutoryBrick[],
    particles: Array.from({ length: 36 }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      color: '#fbbf24',
      size: 4,
    })) as PooledParticle[],
    particleCursor: 0,
    keys: new Set<string>(),
  });

  const buildBricks = useCallback((): StatutoryBrick[] => {
    const rows = 4;
    const cols = 6;
    const padX = 36;
    const topY = 48;
    const gapX = 10;
    const gapY = 10;
    const brickW = Math.floor((760 - padX * 2 - gapX * (cols - 1)) / cols);
    const brickH = 32;
    const rowColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
    const list: StatutoryBrick[] = [];

    const dynamicItems = drawBrickBreakerQuestions(12).map((item) => ({
      rateTag: item.opts[item.correct].slice(0, 14),
      doctrine: `${item.cite}: ${item.q} → ${item.opts[item.correct]}`,
    }));
    const combinedPool = [...KOOPA_BREAKER_DOCTRINES, ...dynamicItems];
    for (let i = combinedPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combinedPool[i], combinedPool[j]] = [combinedPool[j], combinedPool[i]];
    }

    let dIdx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isQ = (r + c) % 2 === 0;
        const doc = combinedPool[dIdx % combinedPool.length];
        dIdx++;
        list.push({
          x: padX + c * (brickW + gapX),
          y: topY + r * (brickH + gapY),
          w: brickW,
          h: brickH,
          alive: true,
          hp: isQ ? 2 : 1,
          isQuestionBlock: isQ,
          color: isQ ? '#f59e0b' : rowColors[r % rowColors.length],
          rateTag: doc.rateTag,
          doctrine: doc.doctrine,
          hitFlash: 0,
        });
      }
    }
    return list;
  }, []);

  const spawnBurst = useCallback((x: number, y: number, color: string, count: number) => {
    const sim = simRef.current;
    for (let i = 0; i < count; i++) {
      const p = sim.particles[sim.particleCursor % sim.particles.length];
      sim.particleCursor = (sim.particleCursor + 1) % sim.particles.length;
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 70 + Math.random() * 150;
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0.45 + Math.random() * 0.25;
      p.maxLife = p.life;
      p.color = color;
      p.size = 3 + Math.random() * 4;
    }
  }, []);

  const resetRun = useCallback(() => {
    const bricks = buildBricks();
    simRef.current.paddleX = 315;
    simRef.current.paddleW = 150;
    simRef.current.wideTimer = 6;
    simRef.current.shellX = 380;
    simRef.current.shellY = 372;
    simRef.current.shellVx = 65;
    simRef.current.shellVy = -265;
    simRef.current.shellLaunched = true;
    simRef.current.lives = 3;
    simRef.current.score = 0;
    simRef.current.coinsEarned = 0;
    simRef.current.hitstop = 0;
    simRef.current.shake = 0;
    simRef.current.bricks = bricks;
    simRef.current.keys.clear();
    for (const p of simRef.current.particles) p.active = false;

    setHudScore(0);
    setHudLives(3);
    setHudBricksLeft(bricks.length);
    setSnapshot(null);
    setActiveBanner('Koopa Shell launched! Keep rebounding to smash all 24 Labor Code blocks!');
  }, [buildBricks]);

  const startGame = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    resetRun();
    setShellState('playing');
    syncBodyGameState('playing');
    marioAudio.playPowerUp();
  }, [resetRun]);

  useEffect(() => {
    simRef.current.bricks = buildBricks();
    syncBodyGameState(shellState);
    if (shellState === 'playing' && simRef.current.score === 0 && !simRef.current.shellLaunched) {
      resetRun();
    }
  }, [buildBricks, resetRun, shellState]);

  // Keyboard & Blur Listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (shellState === 'title' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        startGame();
        return;
      }

      if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && (shellState === 'playing' || shellState === 'paused')) {
        e.preventDefault();
        setShellState((prev) => {
          const next = prev === 'playing' ? 'paused' : 'playing';
          syncBodyGameState(next);
          return next;
        });
        return;
      }

      if (shellState !== 'playing') return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        simRef.current.keys.add('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        simRef.current.keys.add('right');
      } else if (e.key === ' ') {
        e.preventDefault();
        if (!simRef.current.shellLaunched) {
          simRef.current.shellLaunched = true;
          marioAudio.playJump();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        simRef.current.keys.delete('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        simRef.current.keys.delete('right');
      }
    };

    const clearHeld = () => {
      simRef.current.keys.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearHeld);
    document.addEventListener('visibilitychange', clearHeld);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearHeld);
      document.removeEventListener('visibilitychange', clearHeld);
    };
  }, [shellState, startGame]);

  // Main 60Hz Canvas Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTs = performance.now();

    const finishRun = (outcome: 'victory' | 'gameover') => {
      const sim = simRef.current;
      const cleared = sim.bricks.filter((b) => !b.alive).length;
      const bonus = outcome === 'victory' ? 25 : 0;
      if (bonus > 0) {
        sim.coinsEarned += bonus;
        sim.score += 250;
        onEarnCoinsRef.current(bonus);
        marioAudio.playFanfare();
      } else {
        marioAudio.playWrongAnswer();
      }
      const nextBest = Math.max(bestScore, sim.score);
      if (nextBest > bestScore) {
        setBestScore(nextBest);
        try {
          localStorage.setItem('mario_koopa_breaker_best', String(nextBest));
        } catch {
          // ignore
        }
      }
      setHudScore(sim.score);
      setSnapshot({
        score: sim.score,
        best: nextBest,
        cleared,
        total: sim.bricks.length,
        coinsEarned: sim.coinsEarned,
      });
      setShellState(outcome);
      syncBodyGameState(outcome);
    };

    const renderFrame = (now: number) => {
      const rawDt = (now - lastTs) / 1000;
      lastTs = now;
      const dt = Math.min(Math.max(rawDt, 0.001), 0.05);
      const sim = simRef.current;

      // Tick hitstop & camera trauma in real dt
      if (sim.hitstop > 0) sim.hitstop = Math.max(0, sim.hitstop - dt);
      if (sim.shake > 0) sim.shake = Math.max(0, sim.shake - dt * 2.8);

      // Update particles
      for (const p of sim.particles) {
        if (!p.active) continue;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 260 * dt;
        p.life -= dt;
        if (p.life <= 0) p.active = false;
      }

      if (shellState === 'playing' && sim.hitstop <= 0) {
        // Wide paddle timer
        if (sim.wideTimer > 0) {
          sim.wideTimer = Math.max(0, sim.wideTimer - dt);
          sim.paddleW = sim.wideTimer > 0 ? 176 : 130;
        }

        // Paddle movement
        const paddleSpeed = 460;
        if (sim.keys.has('left')) sim.paddleX -= paddleSpeed * dt;
        if (sim.keys.has('right')) sim.paddleX += paddleSpeed * dt;
        sim.paddleX = Math.max(16, Math.min(760 - 16 - sim.paddleW, sim.paddleX));

        if (!sim.shellLaunched) {
          sim.shellX = sim.paddleX + sim.paddleW / 2;
          sim.shellY = 382;
        } else {
          sim.shellSpin += dt * 14;
          sim.shellX += sim.shellVx * dt;
          sim.shellY += sim.shellVy * dt;

          const r = 12;
          // Wall bounces
          if (sim.shellX - r <= 12) {
            sim.shellX = 12 + r;
            sim.shellVx = Math.abs(sim.shellVx);
            marioAudio.playClick();
          } else if (sim.shellX + r >= 748) {
            sim.shellX = 748 - r;
            sim.shellVx = -Math.abs(sim.shellVx);
            marioAudio.playClick();
          }
          if (sim.shellY - r <= 12) {
            sim.shellY = 12 + r;
            sim.shellVy = Math.abs(sim.shellVy);
            marioAudio.playClick();
          }

          // Paddle collision
          const paddleY = 396;
          if (
            sim.shellVy > 0 &&
            sim.shellY + r >= paddleY &&
            sim.shellY - r <= paddleY + 18 &&
            sim.shellX >= sim.paddleX - 8 &&
            sim.shellX <= sim.paddleX + sim.paddleW + 8
          ) {
            const hitOffset =
              (sim.shellX - (sim.paddleX + sim.paddleW / 2)) / (sim.paddleW / 2);
            const clampedOffset = Math.max(-0.92, Math.min(0.92, hitOffset));
            const speed = Math.min(430, Math.hypot(sim.shellVx, sim.shellVy) * 1.02);
            sim.shellVx = speed * clampedOffset * 0.86;
            sim.shellVy = -Math.sqrt(Math.max(180 * 180, speed * speed - sim.shellVx * sim.shellVx));
            sim.shellY = paddleY - r - 1;
            spawnBurst(sim.shellX, paddleY, '#34d399', 6);
            marioAudio.playJump();
          }

          // Brick collisions
          for (const b of sim.bricks) {
            if (b.hitFlash > 0) b.hitFlash = Math.max(0, b.hitFlash - dt * 6);
            if (!b.alive) continue;
            const closestX = Math.max(b.x, Math.min(sim.shellX, b.x + b.w));
            const closestY = Math.max(b.y, Math.min(sim.shellY, b.y + b.h));
            const dx = sim.shellX - closestX;
            const dy = sim.shellY - closestY;
            if (dx * dx + dy * dy <= r * r) {
              if (Math.abs(dx) > Math.abs(dy)) {
                sim.shellVx = -sim.shellVx;
              } else {
                sim.shellVy = -sim.shellVy;
              }
              b.hp -= 1;
              b.hitFlash = 1;
              if (b.hp <= 0) {
                b.alive = false;
                const pts = b.isQuestionBlock ? 50 : 25;
                sim.score += pts;
                setHudScore(sim.score);
                const remaining = sim.bricks.filter((item) => item.alive).length;
                setHudBricksLeft(remaining);
                spawnBurst(b.x + b.w / 2, b.y + b.h / 2, b.color, 14);
                sim.hitstop = 0.032;
                sim.shake = 0.35;

                if (b.isQuestionBlock) {
                  sim.coinsEarned += 3;
                  sim.wideTimer = 7;
                  onEarnCoinsRef.current(3);
                  setActiveBanner(`[${b.rateTag}] ${b.doctrine}`);
                } else {
                  sim.coinsEarned += 1;
                  onEarnCoinsRef.current(1);
                }

                if (remaining === 0) {
                  finishRun('victory');
                  break;
                }
              } else {
                spawnBurst(closestX, closestY, '#fde047', 6);
                marioAudio.playCoin();
              }
              break;
            }
          }

          // Bottom pit fall
          if (sim.shellY - r > 440) {
            sim.lives -= 1;
            setHudLives(sim.lives);
            sim.shake = 0.55;
            if (sim.lives <= 0) {
              finishRun('gameover');
            } else {
              sim.shellLaunched = false;
              sim.shellVx = 235 * (Math.random() > 0.5 ? 1 : -1);
              sim.shellVy = -275;
              setActiveBanner('Shell fell into the lava pit! Press SPACE or tap LAUNCH SHELL to continue.');
              marioAudio.playWrongAnswer();
            }
          }
        }
      } else if (shellState === 'title') {
        // Gentle idle showcase animation on Title Screen
        sim.paddleX = 315 + Math.sin(now * 0.0018) * 110;
        sim.shellX = sim.paddleX + sim.paddleW / 2;
        sim.shellY = 380 + Math.sin(now * 0.006) * 4;
      }

      // Draw Canvas
      ctx.save();
      const shakeOffset = sim.shake > 0 ? sim.shake * sim.shake * 8 : 0;
      if (shakeOffset > 0.1) {
        ctx.translate(
          (Math.random() - 0.5) * shakeOffset,
          (Math.random() - 0.5) * shakeOffset
        );
      }

      // Sky / Underground Overworld Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 440);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.65, '#1e293b');
      grad.addColorStop(1, '#334155');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 760, 440);

      // Subtle architectural grid lines
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1;
      for (let gx = 40; gx < 760; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, 440);
        ctx.stroke();
      }

      // Bricks
      for (const b of sim.bricks) {
        if (!b.alive) continue;
        ctx.fillStyle = b.hitFlash > 0.2 ? '#ffffff' : b.color;
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 6);
        ctx.fill();
        ctx.stroke();

        // Top highlight bar
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.fillRect(b.x + 4, b.y + 3, b.w - 8, 4);

        ctx.fillStyle = b.isQuestionBlock ? '#0f172a' : '#ffffff';
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          b.isQuestionBlock ? `[?] ${b.rateTag}` : b.rateTag,
          b.x + b.w / 2,
          b.y + b.h / 2 + 1
        );
      }

      // Mushroom Paddle
      const paddleY = 396;
      ctx.fillStyle = sim.wideTimer > 0 ? '#10b981' : '#e11d48';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(sim.paddleX, paddleY, sim.paddleW, 18, 9);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.fillRect(sim.paddleX + 14, paddleY + 4, sim.paddleW - 28, 4);

      // Koopa Shell
      ctx.save();
      ctx.translate(sim.shellX, sim.shellY);
      ctx.rotate(sim.shellSpin);
      ctx.fillStyle = '#16a34a';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#bbf7d0';
      ctx.beginPath();
      ctx.arc(-3, -3, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Particles
      for (const p of sim.particles) {
        if (!p.active) continue;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.globalAlpha = 1;

      // Lava hazard trim at bottom
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 434, 760, 6);

      ctx.restore();
      rafId = window.requestAnimationFrame(renderFrame);
    };

    rafId = window.requestAnimationFrame(renderFrame);
    return () => window.cancelAnimationFrame(rafId);
  }, [bestScore, shellState, spawnBurst]);

  const handleCanvasPointer = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas || shellState !== 'playing') return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0) return;
    const worldX = ((clientX - rect.left) / rect.width) * 760;
    const sim = simRef.current;
    sim.paddleX = Math.max(16, Math.min(760 - 16 - sim.paddleW, worldX - sim.paddleW / 2));
  };

  return (
    <div
      data-testid="vault-game-koopa-breaker"
      onContextMenu={(e) => e.preventDefault()}
      className="bg-slate-900 text-white rounded-3xl border-4 border-slate-950 shadow-[6px_6px_0_#000] overflow-hidden select-none"
    >
      {/* Top World-Matched Arcade Perimeter Bar */}
      <div className="bg-slate-950 px-4 py-3 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 border-2 border-black flex items-center justify-center shrink-0">
            <MarioCharacterAvatar character={equippedAvatar} className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-emerald-400 font-mario block truncate">
              KOOPA SHELL STATUTORY BREAKER
            </span>
            <span className="text-xs font-bold text-slate-300 block truncate">
              Pilot: {hero.name} · Smash [?] Blocks for Labor Multipliers
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5 font-mono tabular-nums">
          <div className="text-right">
            <span className="text-[9px] font-bold uppercase text-slate-400 block">SCORE</span>
            <span className="text-base sm:text-lg font-black text-amber-300">{hudScore}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold uppercase text-slate-400 block">BLOCKS</span>
            <span className="text-base sm:text-lg font-black text-emerald-300">{hudBricksLeft}</span>
          </div>
          <div className="flex items-center gap-1" aria-label={`Lives remaining: ${hudLives}`}>
            {[0, 1, 2].map((idx) => (
              <Heart
                key={idx}
                className={`w-5 h-5 ${
                  idx < hudLives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'
                }`}
              />
            ))}
          </div>
          {shellState === 'playing' && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Pause Koopa Breaker"
              onClick={(e) => {
                e.currentTarget.blur();
                setShellState('paused');
                syncBodyGameState('paused');
              }}
              className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center cursor-pointer"
            >
              <Pause className="w-4 h-4 text-amber-300" />
            </button>
          )}
        </div>
      </div>

      {/* Live Doctrine Banner */}
      <div className="bg-amber-950/50 border-b border-amber-500/30 px-4 py-2 text-xs sm:text-sm font-bold text-amber-200 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="leading-snug">{activeBanner}</span>
      </div>

      {/* Canvas Stage */}
      <div className="relative bg-slate-950 arcade-viewport-scaled">
        <canvas
          ref={canvasRef}
          width={760}
          height={440}
          onMouseMove={(e) => handleCanvasPointer(e.clientX)}
          onTouchMove={(e) => {
            if (e.touches[0]) handleCanvasPointer(e.touches[0].clientX);
          }}
          onClick={() => {
            if (shellState === 'playing' && !simRef.current.shellLaunched) {
              simRef.current.shellLaunched = true;
              marioAudio.playJump();
            }
          }}
          className="w-full h-auto block cursor-crosshair touch-none"
        />

        {/* Title Overlay */}
        {shellState === 'title' && (
          <div className="absolute inset-0 bg-slate-950/88 flex flex-col items-center justify-center p-6 text-center">
            <svg viewBox="0 0 64 64" className="w-16 h-16 mb-3" aria-hidden="true">
              <circle cx="32" cy="32" r="26" fill="#16a34a" stroke="#020617" strokeWidth="4" />
              <path d="M14 32 H50 M32 10 V54" stroke="#dcfce7" strokeWidth="4" />
              <circle cx="24" cy="22" r="6" fill="#86efac" />
            </svg>
            <h2 className="text-xl sm:text-3xl font-black font-display text-amber-300 tracking-tight">
              KOOPA SHELL STATUTORY BREAKER
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-1.5 mb-5">
              Rebound the Koopa Troopa Shell across 24 Labor Standards blocks! Gold [?] blocks grant Wide-Paddle Mushrooms and +3 Coins.
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-7 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] text-sm font-mario inline-flex items-center gap-2 cursor-pointer active:translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START GAME</span>
            </button>
            <p className="text-[11px] font-mono text-slate-400 mt-4">
              Drag / Touch · A-D or Left-Right Move · Space Launch · P Pause
            </p>
          </div>
        )}

        {/* Paused Modal */}
        {shellState === 'paused' && (
          <div className="absolute inset-0 bg-slate-950/88 flex items-center justify-center p-5">
            <div className="bg-slate-900 border-3 border-amber-400 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
              <h3 className="text-lg font-black font-mario text-amber-300">GAME PAUSED</h3>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShellState('playing');
                    syncBodyGameState('playing');
                  }}
                  className="min-h-[44px] px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl border-2 border-black cursor-pointer"
                >
                  Resume Game
                </button>
                <button
                  type="button"
                  onClick={startGame}
                  className="min-h-[44px] px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black cursor-pointer"
                >
                  Restart Stage
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Victory / Game Over Modal */}
        {(shellState === 'victory' || shellState === 'gameover') && snapshot && (
          <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center p-5">
            <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 border-2 border-black mx-auto flex items-center justify-center text-slate-950">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black font-display text-white">
                {shellState === 'victory' ? 'STAGE CLEAR! ALL BLOCKS SMASHED!' : 'SHELL LOST IN BOWSER PIT'}
              </h3>
              <div className="grid grid-cols-3 gap-2 font-mono tabular-nums">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">SCORE</span>
                  <span className="text-base font-black text-amber-300">{snapshot.score}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">BLOCKS</span>
                  <span className="text-base font-black text-emerald-300">
                    {snapshot.cleared}/{snapshot.total}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">COINS</span>
                  <span className="text-base font-black text-yellow-300">+{snapshot.coinsEarned}</span>
                </div>
              </div>
              <button
                type="button"
                data-start="true"
                onClick={startGame}
                className="min-h-[48px] w-full px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl border-2 border-black font-mario text-xs cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>PLAY AGAIN</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Ergonomic Touch Dock (>=44px buttons) */}
      <div className="p-3 bg-slate-950 border-t-2 border-slate-800 grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onPointerDown={() => simRef.current.keys.add('left')}
          onPointerUp={() => simRef.current.keys.delete('left')}
          onPointerLeave={() => simRef.current.keys.delete('left')}
          onPointerCancel={() => simRef.current.keys.delete('left')}
          className="min-h-[46px] bg-slate-800 active:bg-amber-400 active:text-slate-950 text-white font-black rounded-xl border-2 border-slate-700 flex items-center justify-center gap-1.5 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>MOVE LEFT</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (shellState === 'title') {
              startGame();
            } else if (shellState === 'playing' && !simRef.current.shellLaunched) {
              simRef.current.shellLaunched = true;
              marioAudio.playJump();
            }
          }}
          className="min-h-[46px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl border-2 border-black flex items-center justify-center gap-1.5 text-xs cursor-pointer"
        >
          <span>LAUNCH SHELL</span>
        </button>
        <button
          type="button"
          onPointerDown={() => simRef.current.keys.add('right')}
          onPointerUp={() => simRef.current.keys.delete('right')}
          onPointerLeave={() => simRef.current.keys.delete('right')}
          onPointerCancel={() => simRef.current.keys.delete('right')}
          className="min-h-[46px] bg-slate-800 active:bg-amber-400 active:text-slate-950 text-white font-black rounded-xl border-2 border-slate-700 flex items-center justify-center gap-1.5 text-xs cursor-pointer"
        >
          <span>MOVE RIGHT</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 2. YOSHI EGG STATUTORY RATE TOSS (Trajectory Aiming & Floating Cloud Targets)
// ============================================================================

export interface YoshiRateRound {
  prompt: string;
  correctRate: string;
  distractors: [string, string, string];
  statute: string;
}

export const YOSHI_RATE_ROUNDS: YoshiRateRound[] = [
  {
    prompt: 'First 8 hours of work rendered on a Regular Holiday falling on the employee’s Rest Day',
    correctRate: '260%',
    distractors: ['200%', '150%', '300%'],
    statute: 'Art. 94 + Omnibus Rules: 200% Regular Holiday × 130% Rest Day = 260%.',
  },
  {
    prompt: 'Overtime work rendered beyond 8 hours on an ordinary working day',
    correctRate: '125%',
    distractors: ['110%', '130%', '150%'],
    statute: 'Art. 87, Labor Code: Ordinary Overtime = Regular Hourly Rate × 125%.',
  },
  {
    prompt: 'First 8 hours of work on a Special Non-Working Day falling on a scheduled Rest Day',
    correctRate: '150%',
    distractors: ['130%', '200%', '260%'],
    statute: 'Art. 93(c), Labor Code: Special Day on Rest Day = at least 150% of regular wage.',
  },
  {
    prompt: 'First 8 hours of work rendered on a Double Regular Holiday falling on a Rest Day',
    correctRate: '390%',
    distractors: ['300%', '260%', '200%'],
    statute: 'DOLE Statutory Handbook: 300% Double Holiday × 130% Rest Day = 390%!',
  },
  {
    prompt: 'Night Shift Differential additional rate per hour for work between 10:00 PM and 6:00 AM',
    correctRate: '+10%',
    distractors: ['+20%', '+25%', '+30%'],
    statute: 'Art. 86, Labor Code: Not less than 10% additional pay per night hour.',
  },
  {
    prompt: 'Employee share of collected Service Charges in hotels & restaurants under R.A. 11360',
    correctRate: '100%',
    distractors: ['85%', '50%', '90%'],
    statute: 'R.A. 11360 (amending Art. 96): 100% distributed completely and equally to covered workers.',
  },
  {
    prompt: 'First 8 hours of work performed on a Regular Holiday (ordinary workday)',
    correctRate: '200%',
    distractors: ['130%', '150%', '260%'],
    statute: 'Art. 94(b), Labor Code: Twice (200%) the employee’s regular daily wage.',
  },
  {
    prompt: 'Overtime hourly multiplier on a Regular Holiday (ordinary workday, beyond 8 hours)',
    correctRate: '260%',
    distractors: ['200%', '230%', '300%'],
    statute: 'Art. 87 & 94: Hourly Regular Holiday rate (200%) × 1.30 Holiday OT = 260%/hr.',
  },
];

export const YoshiEggTossGame: React.FC<NewVaultGameProps> = ({
  equippedAvatar,
  onEarnCoins,
}) => {
  const hero = getHeroMeta(equippedAvatar);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onEarnCoinsRef = useRef(onEarnCoins);
  onEarnCoinsRef.current = onEarnCoins;

  const [rounds, setRounds] = useState<YoshiEggRoundItem[]>(() => drawYoshiEggRounds(8));
  const roundsRef = useRef<YoshiEggRoundItem[]>(rounds);
  roundsRef.current = rounds;

  const [shellState, setShellState] = useState<ArcadeShellState>(() =>
    hasAutoStartParam() ? 'playing' : 'title'
  );
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [aimDeg, setAimDeg] = useState(42);
  const [lockedSlot, setLockedSlot] = useState<number | null>(1);
  const [feedback, setFeedback] = useState<string>(
    'Click any cloud, tap a Quick-Cloud button below, or slide the angle to launch Yoshi’s Egg!'
  );
  const [snapshot, setSnapshot] = useState<EndRunSnapshot | null>(null);

  const simRef = useRef({
    aimRad: (42 * Math.PI) / 180,
    intendedSlot: null as number | null,
    eggActive: false,
    eggX: YOSHI_LAUNCH_X,
    eggY: YOSHI_LAUNCH_Y,
    eggVx: 0,
    eggVy: 0,
    roundIndex: 0,
    score: 0,
    lives: 3,
    coinsEarned: 0,
    targets: [] as YoshiTargetState[],
  });

  const setupRoundTargets = useCallback((idx: number, deckOverride?: YoshiEggRoundItem[]) => {
    const activeDeck = deckOverride || roundsRef.current;
    const round = activeDeck[idx % activeDeck.length];
    if (!round) return;

    const builtTargets: YoshiTargetState[] = YOSHI_RADIAL_CLOUD_SLOTS.map((geom, slot) => {
      const label = round.options[slot] ?? `${slot + 1}`;
      const y = computeYoshiCloudY(geom.baseY, geom.phaseOffset, geom.bobAmplitude);
      return {
        slot,
        x: geom.x,
        baseY: geom.baseY,
        y,
        bobAmplitude: geom.bobAmplitude,
        bobFrequency: geom.bobFrequency,
        phase: geom.phaseOffset,
        label,
        isCorrect: slot === round.correctIdx,
      };
    });

    simRef.current.targets = builtTargets;
    simRef.current.eggActive = false;
    simRef.current.intendedSlot = null;
    simRef.current.eggX = YOSHI_LAUNCH_X;
    simRef.current.eggY = YOSHI_LAUNCH_Y;
    setLockedSlot(predictLockedCloudSlot(simRef.current.aimRad, builtTargets));
  }, []);

  const startGame = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const freshRounds = drawYoshiEggRounds(8);
    roundsRef.current = freshRounds;
    setRounds(freshRounds);

    simRef.current.roundIndex = 0;
    simRef.current.score = 0;
    simRef.current.lives = 3;
    simRef.current.coinsEarned = 0;
    setupRoundTargets(0, freshRounds);
    setRoundIdx(0);
    setScore(0);
    setLives(3);
    setSnapshot(null);
    setFeedback('Staggered sky lanes unlocked! Click a cloud directly or use Quick-Cloud Lock & Throw.');
    setShellState('playing');
    syncBodyGameState('playing');
    marioAudio.playPowerUp();
  }, [setupRoundTargets]);

  useEffect(() => {
    setupRoundTargets(0);
    syncBodyGameState(shellState);
  }, [setupRoundTargets, shellState]);

  const fireEggWithAngle = useCallback(
    (overrideDeg?: number, targetSlotOverride?: number | null) => {
      const sim = simRef.current;
      if (shellState !== 'playing' || sim.eggActive) return;

      if (typeof overrideDeg === 'number') {
        const clamped = Math.max(YOSHI_MIN_AIM_DEG, Math.min(YOSHI_MAX_AIM_DEG, overrideDeg));
        setAimDeg(Math.round(clamped));
        sim.aimRad = (clamped * Math.PI) / 180;
      }

      sim.intendedSlot =
        targetSlotOverride !== undefined
          ? targetSlotOverride
          : predictLockedCloudSlot(sim.aimRad, sim.targets);
      setLockedSlot(sim.intendedSlot);

      sim.eggActive = true;
      sim.eggX = YOSHI_LAUNCH_X;
      sim.eggY = YOSHI_LAUNCH_Y;
      sim.eggVx = Math.cos(sim.aimRad) * YOSHI_EGG_SPEED;
      sim.eggVy = -Math.sin(sim.aimRad) * YOSHI_EGG_SPEED;
      marioAudio.playJump();
    },
    [shellState]
  );

  const lockAndThrowAtSlot = useCallback(
    (slot: number) => {
      if (shellState === 'title') {
        startGame();
        return;
      }
      const sim = simRef.current;
      if (shellState !== 'playing' || sim.eggActive) return;
      const target = sim.targets.find((t) => t.slot === slot);
      if (!target) return;
      const solvedDeg = solveMovingCloudAimDeg(target);
      fireEggWithAngle(solvedDeg, slot);
    },
    [fireEggWithAngle, shellState, startGame]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTs = performance.now();

    const endGame = (outcome: 'victory' | 'gameover') => {
      const sim = simRef.current;
      if (outcome === 'victory') {
        sim.coinsEarned += 20;
        sim.score += 200;
        onEarnCoinsRef.current(20);
        marioAudio.playFanfare();
      } else {
        marioAudio.playWrongAnswer();
      }
      setScore(sim.score);
      setSnapshot({
        score: sim.score,
        best: sim.score,
        cleared: sim.roundIndex,
        total: roundsRef.current.length,
        coinsEarned: sim.coinsEarned,
      });
      setShellState(outcome);
      syncBodyGameState(outcome);
    };

    const tick = (now: number) => {
      const dt = Math.min(Math.max((now - lastTs) / 1000, 0.001), 0.05);
      lastTs = now;
      const sim = simRef.current;

      for (const t of sim.targets) {
        t.phase += dt * t.bobFrequency;
        t.y = computeYoshiCloudY(t.baseY, t.phase, t.bobAmplitude);
      }

      const livePredictedSlot = sim.eggActive
        ? sim.intendedSlot
        : predictLockedCloudSlot(sim.aimRad, sim.targets);

      if (shellState === 'playing' && sim.eggActive) {
        // Sub-step integration so fast eggs never skip through target clouds
        const subSteps = 3;
        const stepDt = dt / subSteps;
        let hitHandled = false;

        for (let s = 0; s < subSteps && !hitHandled; s++) {
          sim.eggX += sim.eggVx * stepDt;
          sim.eggY += sim.eggVy * stepDt;
          sim.eggVy += YOSHI_EGG_GRAVITY * stepDt;

          for (const t of sim.targets) {
            if (checkEggHitsCloud(sim.eggX, sim.eggY, t, sim.intendedSlot)) {
              sim.eggActive = false;
              hitHandled = true;
              const activeDeck = roundsRef.current;
              const round = activeDeck[sim.roundIndex % activeDeck.length];
              const correctLabel = round.options[round.correctIdx];

              if (t.isCorrect) {
                sim.score += 100;
                sim.coinsEarned += 5;
                onEarnCoinsRef.current(5);
                setScore(sim.score);
                setFeedback(`BULLSEYE (${t.label})! ${round.note}`);
                marioAudio.playCoin();

                if (sim.roundIndex + 1 >= activeDeck.length) {
                  sim.roundIndex += 1;
                  endGame('victory');
                } else {
                  sim.roundIndex += 1;
                  setRoundIdx(sim.roundIndex);
                  setupRoundTargets(sim.roundIndex);
                }
              } else {
                sim.lives -= 1;
                setLives(sim.lives);
                setFeedback(
                  `Hit ${t.label} — incorrect! Exact rule answer is ${correctLabel}. (${round.note})`
                );
                if (sim.lives <= 0) {
                  endGame('gameover');
                } else {
                  marioAudio.playWrongAnswer();
                }
              }
              break;
            }
          }
        }

        if (sim.eggActive && (sim.eggX > 775 || sim.eggY > 445 || sim.eggY < -45)) {
          sim.eggActive = false;
          setFeedback('Egg sailed past the clouds! Tap a cloud directly or use Quick-Cloud buttons.');
        }
      }

      // Draw Sky Island Canvas
      const sky = ctx.createLinearGradient(0, 0, 0, 420);
      sky.addColorStop(0, '#0369a1');
      sky.addColorStop(0.7, '#0ea5e9');
      sky.addColorStop(1, '#7dd3fc');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 760, 420);

      // Ground Hill
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(0, 384, 760, 36);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 384, 760, 6);

      // Dotted Ballistic Trajectory Preview with Target Lock Indicator
      if (!sim.eggActive) {
        const vx = Math.cos(sim.aimRad) * YOSHI_EGG_SPEED;
        const vy = -Math.sin(sim.aimRad) * YOSHI_EGG_SPEED;
        ctx.fillStyle =
          livePredictedSlot !== null ? 'rgba(190, 242, 100, 0.95)' : 'rgba(255, 255, 255, 0.85)';
        for (let step = 1; step <= 18; step++) {
          const tSec = step * 0.055;
          const px = YOSHI_LAUNCH_X + vx * tSec;
          const py = YOSHI_LAUNCH_Y + vy * tSec + 0.5 * YOSHI_EGG_GRAVITY * tSec * tSec;
          if (px > 752 || py > 390) break;
          ctx.beginPath();
          ctx.arc(px, py, step % 3 === 0 ? 4 : 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Yoshi Cannon Pedestal
      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(YOSHI_LAUNCH_X, YOSHI_LAUNCH_Y + 4, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Staggered Radial Cloud Targets (non-blocking corridors)
      for (const t of sim.targets) {
        const isLocked = livePredictedSlot === t.slot;
        ctx.fillStyle = isLocked ? '#ecfccb' : '#ffffff';
        ctx.strokeStyle = isLocked ? '#65a30d' : '#0f172a';
        ctx.lineWidth = isLocked ? 4 : 3;
        ctx.beginPath();
        ctx.roundRect(t.x - 46, t.y - 25, 92, 50, 22);
        ctx.fill();
        ctx.stroke();

        // Slot number tag on top-left corner of cloud
        ctx.fillStyle = isLocked ? '#4d7c0f' : '#334155';
        ctx.font = '800 10px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`#${t.slot + 1}`, t.x, t.y - 14);

        ctx.fillStyle = '#0f172a';
        ctx.font = '900 15px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(t.label, t.x, t.y + 5);
      }

      // Flying Spotted Yoshi Egg
      const ex = sim.eggActive ? sim.eggX : YOSHI_LAUNCH_X;
      const ey = sim.eggActive ? sim.eggY : YOSHI_LAUNCH_Y - 18;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(ex, ey, 11, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(ex - 3, ey - 3, 3.5, 0, Math.PI * 2);
      ctx.arc(ex + 4, ey + 4, 3, 0, Math.PI * 2);
      ctx.fill();

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [setupRoundTargets, shellState]);

  const adjustAngle = (nextDeg: number) => {
    const clamped = Math.max(YOSHI_MIN_AIM_DEG, Math.min(YOSHI_MAX_AIM_DEG, nextDeg));
    setAimDeg(Math.round(clamped));
    const rad = (clamped * Math.PI) / 180;
    simRef.current.aimRad = rad;
    setLockedSlot(predictLockedCloudSlot(rad, simRef.current.targets));
  };

  const handleCanvasAim = (clientX: number, clientY: number, fireNow: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas || shellState !== 'playing') return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const wx = ((clientX - rect.left) / rect.width) * 760;
    const wy = ((clientY - rect.top) / rect.height) * 420;

    // Snap with lead-assist if hovering/clicking directly on or near a cloud
    let snappedTarget: YoshiTargetState | null = null;
    let bestDist = 66;
    for (const t of simRef.current.targets) {
      const dist = Math.hypot(wx - t.x, wy - t.y);
      if (dist < bestDist) {
        bestDist = dist;
        snappedTarget = t;
      }
    }

    if (snappedTarget) {
      const solvedDeg = solveMovingCloudAimDeg(snappedTarget);
      adjustAngle(solvedDeg);
      if (fireNow) {
        fireEggWithAngle(solvedDeg, snappedTarget.slot);
      }
      return;
    }

    const dx = Math.max(20, wx - YOSHI_LAUNCH_X);
    const dy = Math.max(12, YOSHI_LAUNCH_Y - wy);
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    adjustAngle(deg);
    if (fireNow) {
      fireEggWithAngle(deg);
    }
  };

  const currentRound = rounds[roundIdx % rounds.length] || rounds[0];

  return (
    <div
      data-testid="vault-game-yoshi-toss"
      onContextMenu={(e) => e.preventDefault()}
      className="bg-slate-900 text-white rounded-3xl border-4 border-slate-950 shadow-[6px_6px_0_#000] overflow-hidden select-none"
    >
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-lime-400 border-2 border-black flex items-center justify-center shrink-0">
            <Crosshair className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-lime-400 font-mario block">
              YOSHI’S STATUTORY EGG TOSS
            </span>
            <span className="text-xs font-bold text-slate-300 block">
              Hero: {hero.name} · Wave {Math.min(roundIdx + 1, rounds.length)} of {rounds.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono tabular-nums">
          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase block">SCORE</span>
            <span className="text-base sm:text-lg font-black text-amber-300">{score}</span>
          </div>
          <div className="flex items-center gap-1" aria-label={`Eggs left: ${lives}`}>
            {[0, 1, 2].map((i) => (
              <Heart
                key={i}
                className={`w-5 h-5 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Live Payroll Scenario Prompt */}
      <div className="bg-slate-800/95 px-4 py-3 border-b-2 border-slate-950 space-y-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
          TARGET LABOR STANDARDS RULE:
        </span>
        <p className="text-sm sm:text-base font-extrabold text-white leading-snug">
          {currentRound?.prompt}
        </p>
        <p className="text-xs font-semibold text-emerald-300">{feedback}</p>
      </div>

      {/* Canvas Viewport */}
      <div className="relative arcade-viewport-scaled bg-sky-600">
        <canvas
          ref={canvasRef}
          width={760}
          height={420}
          onMouseMove={(e) => handleCanvasAim(e.clientX, e.clientY, false)}
          onClick={(e) => handleCanvasAim(e.clientX, e.clientY, true)}
          className="w-full h-auto block cursor-crosshair touch-none"
        />

        {shellState === 'title' && (
          <div className="absolute inset-0 bg-slate-950/88 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-xl sm:text-3xl font-black font-display text-lime-300">
              YOSHI’S STATUTORY EGG TOSS
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-2 mb-5">
              Click any sky cloud directly, use Quick-Cloud Lock &amp; Throw, or adjust Yoshi’s angle across 8 non-repeating statutory waves!
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-7 py-3 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] text-sm font-mario inline-flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START GAME</span>
            </button>
          </div>
        )}

        {(shellState === 'victory' || shellState === 'gameover') && snapshot && (
          <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center p-5">
            <div className="bg-slate-900 border-4 border-lime-400 rounded-3xl p-6 max-w-md w-full text-center space-y-4">
              <h3 className="text-xl font-black font-display text-white">
                {shellState === 'victory' ? 'YOSHI ISLAND AUDIT COMPLETE!' : 'OUT OF YOSHI EGGS!'}
              </h3>
              <div className="grid grid-cols-3 gap-2 font-mono tabular-nums">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">SCORE</span>
                  <span className="text-base font-black text-amber-300">{snapshot.score}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">WAVES</span>
                  <span className="text-base font-black text-lime-300">
                    {snapshot.cleared}/{snapshot.total}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">COINS</span>
                  <span className="text-base font-black text-yellow-300">+{snapshot.coinsEarned}</span>
                </div>
              </div>
              <button
                type="button"
                data-start="true"
                onClick={startGame}
                className="min-h-[48px] w-full px-5 py-3 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black rounded-2xl border-2 border-black font-mario text-xs cursor-pointer"
              >
                PLAY AGAIN (NEW QUESTIONS)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick-Cloud Lock & Throw Buttons + Precision Angle Slider */}
      <div className="p-3.5 bg-slate-950 border-t-2 border-slate-800 space-y-3">
        {currentRound && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {currentRound.options.map((optLabel, slotIdx) => {
              const isLocked = lockedSlot === slotIdx;
              return (
                <button
                  key={`${currentRound.id}-slot-${slotIdx}`}
                  type="button"
                  data-testid={`yoshi-cloud-btn-${slotIdx}`}
                  onClick={() => lockAndThrowAtSlot(slotIdx)}
                  className={`min-h-[42px] px-2.5 py-1.5 rounded-xl font-black text-xs border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0 ${
                    isLocked
                      ? 'bg-lime-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-mono opacity-80 shrink-0">#{slotIdx + 1}</span>
                  <span className="truncate">{optLabel}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <label
              htmlFor="yoshi-aim-slider"
              className="text-xs font-black font-mono text-lime-300 whitespace-nowrap tabular-nums"
            >
              ANGLE: {aimDeg}°
            </label>
            <input
              id="yoshi-aim-slider"
              type="range"
              min={YOSHI_MIN_AIM_DEG}
              max={YOSHI_MAX_AIM_DEG}
              value={aimDeg}
              onChange={(e) => adjustAngle(Number(e.target.value))}
              className="w-full accent-lime-400 cursor-pointer"
            />
          </div>
          <button
            type="button"
            onClick={() => (shellState === 'title' ? startGame() : fireEggWithAngle())}
            className="min-h-[46px] px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black font-mario text-xs cursor-pointer shrink-0"
          >
            FIRE YOSHI EGG
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. KING BOO'S BURDEN OF PROOF MANSION (Loon v. Power Master Evidentiary Spotlight)
// ============================================================================

export interface BurdenMansionCase {
  id: string;
  claimTitle: string;
  scenario: string;
  correctBurden: 'employer' | 'employee';
  explanation: string;
  citation: string;
}

export const BOO_BURDEN_CASES: BurdenMansionCase[] = [
  {
    id: 'bb-1',
    claimTitle: 'Unpaid Salary Differential, 13th Month Pay & SIL Pay',
    scenario:
      'Once the employee establishes the existence of an employer-employee relationship, who bears the burden of proving that basic wages, 13th month pay, and Service Incentive Leave were actually paid?',
    correctBurden: 'employer',
    explanation:
      'EMPLOYER BURDEN: Under Loon v. Power Master, Inc., the employer has custody of payrolls, vouchers, and daily time records, so the employer must prove payment of normal statutory benefits.',
    citation: 'Loon v. Power Master, Inc. (G.R. No. 189404) · Art. 113/95',
  },
  {
    id: 'bb-2',
    claimTitle: 'Entitlement to Unpaid Overtime Pay & Holiday Work Premiums',
    scenario:
      'A rank-and-file clerk claims she worked 3 extra overtime hours every night and worked on 4 Regular Holidays, which the company denies. Who bears the burden of proving actual overtime/holiday hours worked?',
    correctBurden: 'employee',
    explanation:
      'EMPLOYEE BURDEN: Overtime and holiday work are never presumed! Because these are extraordinary entitlements beyond regular hours, the employee must first prove she actually rendered overtime/holiday service.',
    citation: 'Loon v. Power Master / Robina Farms v. Villa',
  },
  {
    id: 'bb-3',
    claimTitle: 'Validity & Just Cause of Termination',
    scenario:
      'It is undisputed that the employee was served a termination notice, and the employee challenges the dismissal as illegal. Who bears the burden of proving that the dismissal was for a valid Just or Authorized Cause?',
    correctBurden: 'employer',
    explanation:
      'EMPLOYER BURDEN: Art. 292(b) [277(b)] mandates that the burden of proving that the termination was for a valid or authorized cause rests squarely upon the employer by substantial evidence.',
    citation: 'Art. 292(b) [277(b)], Labor Code',
  },
  {
    id: 'bb-4',
    claimTitle: 'Fact of Dismissal (When Employer Denies Firing Worker)',
    scenario:
      'An employer denies dismissing the worker and claims the worker simply stopped reporting, while the worker alleges verbal ouster. Before inquiring into legality, who must first prove the FACT of dismissal?',
    correctBurden: 'employee',
    explanation:
      'EMPLOYEE BURDEN: Before the employer is required to prove legality of termination, the employee must first establish the fact of dismissal by positive, overt acts of the employer.',
    citation: 'Machica v. Roosevelt Services / Italkarat 18 v. Gerasmio',
  },
  {
    id: 'bb-5',
    claimTitle: 'Legitimate Independent Contracting vs. Labor-Only Contracting',
    scenario:
      'Workers deployed by a manpower agency claim they are regular employees of the principal. Who bears the burden of proving that the contractor has substantial capital (≥₱5M) and independent control?',
    correctBurden: 'employer',
    explanation:
      'EMPLOYER / PRINCIPAL BURDEN: Labor-only contracting is presumed unless the principal/contractor proves substantial capital or investment AND independent control under D.O. No. 174-17.',
    citation: 'Art. 106 · DOLE D.O. No. 174-17 · Alilin v. Petron',
  },
  {
    id: 'bb-6',
    claimTitle: 'Voluntariness & Validity of an Employee Quitclaim',
    scenario:
      'An employer interposes a signed Release, Waiver, and Quitclaim to bar a complaint for statutory underpayment. Who bears the burden of proving the quitclaim was executed voluntarily and for reasonable consideration?',
    correctBurden: 'employer',
    explanation:
      'EMPLOYER BURDEN: Quitclaims are frowned upon in Philippine jurisprudence; the employer bears the burden of proving voluntariness, absence of fraud, and credible/reasonable consideration.',
    citation: ' Goodrich Manufacturing v. Ativo · Periquet Doctrine',
  },
  {
    id: 'bb-7',
    claimTitle: 'Allegation of Abandonment of Work as a Defense',
    scenario:
      'To defeat an illegal dismissal complaint, the employer alleges the employee "abandoned" his job. Who bears the burden of proving both (1) failure to report without valid reason and (2) clear intent to sever employment?',
    correctBurden: 'employer',
    explanation:
      'EMPLOYER BURDEN: Abandonment is an affirmative defense of the employer requiring clear proof of unjustified absence PLUS overt acts showing a deliberate intent to sever the relationship.',
    citation: 'Tan Brothers Corp. v. Escudero · Art. 297(b)',
  },
  {
    id: 'bb-8',
    claimTitle: 'Existence of Intolerable Conditions in Constructive Dismissal',
    scenario:
      'An employee submits a resignation letter but later sues for Constructive Dismissal, alleging humiliation and demotion forced her hand. Who must prove that resignation was coerced or conditions were unbearable?',
    correctBurden: 'employee',
    explanation:
      'EMPLOYEE BURDEN: When a facially voluntary resignation exists, the employee claiming constructive dismissal must prove clear acts of discrimination, insensibility, or disdain by substantial evidence.',
    citation: 'Gan v. Galderma Philippines, Inc.',
  },
];

export const BooBurdenMansionGame: React.FC<NewVaultGameProps> = ({
  equippedAvatar,
  onEarnCoins,
}) => {
  const hero = getHeroMeta(equippedAvatar);
  const [shellState, setShellState] = useState<ArcadeShellState>(() =>
    hasAutoStartParam() ? 'playing' : 'title'
  );
  const [caseIdx, setCaseIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [selectedSide, setSelectedSide] = useState<'employer' | 'employee' | null>(null);
  const [deck, setDeck] = useState<BurdenMansionCase[]>(() =>
    drawBooBurdenCases(8).map((c) => ({
      id: c.id,
      claimTitle: c.dispute,
      scenario: c.detail,
      correctBurden: c.burden,
      explanation: c.explanation,
      citation: 'Philippine Labor Jurisprudence · Onus Probandi',
    }))
  );

  const startGame = () => {
    const fresh = drawBooBurdenCases(8).map((c) => ({
      id: c.id,
      claimTitle: c.dispute,
      scenario: c.detail,
      correctBurden: c.burden,
      explanation: c.explanation,
      citation: 'Philippine Labor Jurisprudence · Onus Probandi',
    }));
    setDeck(fresh);
    setCaseIdx(0);
    setScore(0);
    setLives(3);
    setCoinsEarned(0);
    setSelectedSide(null);
    setShellState('playing');
    syncBodyGameState('playing');
    marioAudio.playPowerUp();
  };

  const currentCase = deck[caseIdx % deck.length];

  const handleSpotlight = (choice: 'employer' | 'employee') => {
    if (shellState !== 'playing' || selectedSide !== null) return;
    setSelectedSide(choice);
    const isCorrect = choice === currentCase.correctBurden;
    if (isCorrect) {
      setScore((s) => s + 125);
      setCoinsEarned((c) => c + 5);
      onEarnCoins(5);
      marioAudio.playCoin();
    } else {
      const nextLives = lives - 1;
      setLives(nextLives);
      marioAudio.playWrongAnswer();
      if (nextLives <= 0) {
        setTimeout(() => {
          setShellState('gameover');
          syncBodyGameState('gameover');
        }, 1200);
        return;
      }
    }
  };

  const handleNextDocket = () => {
    if (caseIdx + 1 >= deck.length) {
      onEarnCoins(20);
      setCoinsEarned((c) => c + 20);
      setScore((s) => s + 200);
      setShellState('victory');
      syncBodyGameState('victory');
      marioAudio.playFanfare();
    } else {
      setCaseIdx((i) => i + 1);
      setSelectedSide(null);
      marioAudio.playClick();
    }
  };

  return (
    <div
      data-testid="vault-game-boo-burden"
      onContextMenu={(e) => e.preventDefault()}
      className="bg-slate-950 text-white rounded-3xl border-4 border-purple-500 shadow-[6px_6px_0_#000] overflow-hidden select-none"
    >
      {/* Header */}
      <div className="bg-[#140c24] px-4 py-3 border-b-2 border-purple-900 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-400 border-2 border-black flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-purple-300 font-mario block">
              KING BOO’S BURDEN OF PROOF MANSION
            </span>
            <span className="text-xs font-bold text-slate-300 block">
              Investigator: {hero.name} · Docket {Math.min(caseIdx + 1, deck.length)} / {deck.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono tabular-nums">
          <div className="text-right">
            <span className="text-[9px] text-purple-300 uppercase block">SCORE</span>
            <span className="text-base sm:text-lg font-black text-amber-300">{score}</span>
          </div>
          <div className="flex items-center gap-1" aria-label={`Lantern lives: ${lives}`}>
            {[0, 1, 2].map((i) => (
              <Heart
                key={i}
                className={`w-5 h-5 ${i < lives ? 'text-purple-400 fill-purple-400' : 'text-slate-800'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Mansion Body */}
      <div className="p-5 sm:p-7 bg-gradient-to-b from-[#1a1030] to-slate-950 min-h-[340px] flex flex-col justify-between gap-5">
        {shellState === 'title' && (
          <div className="my-auto text-center space-y-4 py-6">
            <h2 className="text-xl sm:text-3xl font-black font-display text-purple-200">
              KING BOO’S BURDEN OF PROOF MANSION
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              Master the Supreme Court’s <strong className="text-amber-300">Loon v. Power Master</strong> evidentiary rule! Shine your Poltergust Spotlight on who bears the legal Burden of Proof: <strong>Employer</strong> or <strong>Employee</strong>.
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-7 py-3 bg-purple-400 hover:bg-purple-300 text-slate-950 font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] text-sm font-mario inline-flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>ENTER MANSION</span>
            </button>
          </div>
        )}

        {shellState === 'playing' && (
          <>
            <div className="bg-slate-900/90 border-2 border-purple-500/50 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs font-mono text-purple-300">
                <span>EVIDENTIARY DOCKET #{caseIdx + 1}</span>
                <span>ONUS PROBANDI TEST</span>
              </div>
              <h3 className="text-base sm:text-xl font-black font-display text-amber-300">
                {currentCase.claimTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {currentCase.scenario}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={selectedSide !== null}
                onClick={() => handleSpotlight('employer')}
                className={`min-h-[68px] p-4 rounded-2xl border-3 font-black text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedSide === null
                    ? 'bg-slate-900 hover:bg-amber-400 hover:text-slate-950 border-purple-400 text-white'
                    : currentCase.correctBurden === 'employer'
                    ? 'bg-emerald-500 text-slate-950 border-black'
                    : selectedSide === 'employer'
                    ? 'bg-rose-600 text-white border-black'
                    : 'bg-slate-900/50 text-slate-500 border-slate-800'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase block opacity-80">SPOTLIGHT LEFT</span>
                  <span className="text-sm sm:text-base font-display block">EMPLOYER BURDEN</span>
                </div>
                <Scale className="w-6 h-6 shrink-0" />
              </button>

              <button
                type="button"
                disabled={selectedSide !== null}
                onClick={() => handleSpotlight('employee')}
                className={`min-h-[68px] p-4 rounded-2xl border-3 font-black text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedSide === null
                    ? 'bg-slate-900 hover:bg-sky-400 hover:text-slate-950 border-purple-400 text-white'
                    : currentCase.correctBurden === 'employee'
                    ? 'bg-emerald-500 text-slate-950 border-black'
                    : selectedSide === 'employee'
                    ? 'bg-rose-600 text-white border-black'
                    : 'bg-slate-900/50 text-slate-500 border-slate-800'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase block opacity-80">SPOTLIGHT RIGHT</span>
                  <span className="text-sm sm:text-base font-display block">EMPLOYEE BURDEN</span>
                </div>
                <ShieldAlert className="w-6 h-6 shrink-0" />
              </button>
            </div>

            {selectedSide !== null && (
              <div className="bg-slate-900 border-2 border-amber-400 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black">
                    {selectedSide === currentCase.correctBurden ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="text-amber-300">{currentCase.citation}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200">{currentCase.explanation}</p>
                </div>
                {lives > 0 && (
                  <button
                    type="button"
                    onClick={handleNextDocket}
                    className="min-h-[44px] px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black font-mario text-xs cursor-pointer shrink-0"
                  >
                    {caseIdx + 1 >= deck.length ? 'FINISH' : 'NEXT CASE'}
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {(shellState === 'victory' || shellState === 'gameover') && (
          <div className="my-auto text-center space-y-4 py-4">
            <h3 className="text-xl sm:text-2xl font-black font-display text-amber-300">
              {shellState === 'victory'
                ? 'KING BOO DEFEATED! ONUS PROBANDI MASTERED!'
                : 'MANSION LANTERNS EXTINGUISHED'}
            </h3>
            <p className="text-sm font-mono tabular-nums text-slate-300">
              Final Score: <strong className="text-white">{score}</strong> · Coins Earned: <strong className="text-amber-300">+{coinsEarned}</strong>
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-7 py-3 bg-purple-400 hover:bg-purple-300 text-slate-950 font-black rounded-2xl border-2 border-black font-mario text-xs cursor-pointer"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 4. BOB-OMB CHRONO PRESCRIPTION BLITZ (Statutory Deadlines & Prescriptive Periods)
// ============================================================================

export interface ChronoBlitzQuestion {
  id: string;
  claim: string;
  correctPeriod: string;
  options: [string, string, string, string];
  basis: string;
}

export const CHRONO_BLITZ_BANK: ChronoBlitzQuestion[] = [
  {
    id: 'cb-1',
    claim: 'Prescriptive period for pure Money Claims (unpaid wages, OT, 13th month, SIL) arising from employer-employee relations',
    correctPeriod: '3 Years',
    options: ['1 Year', '3 Years', '4 Years', '10 Years'],
    basis: 'Art. 306 [291], Labor Code: All money claims accrue and prescribe in 3 years from cause of action.',
  },
  {
    id: 'cb-2',
    claim: 'Prescriptive period to file a complaint for Illegal Dismissal (injury to constitutional right to security of tenure)',
    correctPeriod: '4 Years',
    options: ['1 Year', '2 Years', '3 Years', '4 Years'],
    basis: 'Art. 1146, Civil Code (Callanta v. Carnation Phils.): 4 years from unlawful dismissal.',
  },
  {
    id: 'cb-3',
    claim: 'Prescriptive period for Unfair Labor Practice (ULP) offenses and claims',
    correctPeriod: '1 Year',
    options: ['6 Months', '1 Year', '3 Years', '4 Years'],
    basis: 'Art. 305 [290], Labor Code: ULP prescribes in 1 year from accrual of such unfair labor practice.',
  },
  {
    id: 'cb-4',
    claim: 'Minimum reasonable period given to an employee to submit a written explanation after First Notice (NTE) in Just Cause dismissal',
    correctPeriod: '5 Calendar Days',
    options: ['24 Hours', '3 Working Days', '5 Calendar Days', '15 Calendar Days'],
    basis: 'King of Kings Transport v. Mamac / DOLE D.O. 147-15: At least 5 calendar days to prepare defense.',
  },
  {
    id: 'cb-5',
    claim: 'Mandatory prior written notice to BOTH DOLE and affected workers before Authorized Cause termination (Redundancy, Retrenchment, Closure)',
    correctPeriod: '30 Days Prior',
    options: ['5 Calendar Days', '10 Calendar Days', '15 Days Prior', '30 Days Prior'],
    basis: 'Art. 298 [283], Labor Code: Written notice served at least 1 month (30 days) before intended date.',
  },
  {
    id: 'cb-6',
    claim: 'Reglementary period to perfect an Appeal from a Labor Arbiter’s Decision to the NLRC',
    correctPeriod: '10 Calendar Days',
    options: ['5 Calendar Days', '10 Calendar Days', '15 Calendar Days', '30 Calendar Days'],
    basis: 'Art. 229 [223], Labor Code: Decisions of the Labor Arbiter are final unless appealed within 10 calendar days.',
  },
  {
    id: 'cb-7',
    claim: 'Maximum duration of bona fide Suspension of Operations ("Floating Status") before Constructive Dismissal sets in',
    correctPeriod: '6 Months Max',
    options: ['30 Days Max', '3 Months Max', '6 Months Max', '1 Year Max'],
    basis: 'Art. 301 [286], Labor Code: Bona fide suspension of business or security off-detail must not exceed 6 months.',
  },
  {
    id: 'cb-8',
    claim: 'Maximum duration of unpaid Preventive Suspension (non-construction) while investigating a serious threat to company life/property',
    correctPeriod: '30 Days Max',
    options: ['10 Days Max', '15 Days Max', '30 Days Max', '60 Days Max'],
    basis: 'Omnibus Rules Book V, Rule XXIII, Sec. 9: Maximum 30 days; extension requires reinstatement on payroll!',
  },
];

export const ChronoPrescriptionBlitzGame: React.FC<NewVaultGameProps> = ({
  equippedAvatar,
  onEarnCoins,
}) => {
  const hero = getHeroMeta(equippedAvatar);
  const [shellState, setShellState] = useState<ArcadeShellState>(() =>
    hasAutoStartParam() ? 'playing' : 'title'
  );
  const [deck, setDeck] = useState<ChronoBlitzQuestion[]>(() =>
    drawChronoPrescriptionClaims(8).map((c) => ({
      id: c.id,
      claim: c.claim,
      correctPeriod: c.options[c.correctIdx],
      options: c.options,
      basis: c.basis,
    }))
  );
  const [idx, setIdx] = useState(0);
  const [fuseLeft, setFuseLeft] = useState(14);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const startGame = () => {
    setDeck(
      drawChronoPrescriptionClaims(8).map((c) => ({
        id: c.id,
        claim: c.claim,
        correctPeriod: c.options[c.correctIdx],
        options: c.options,
        basis: c.basis,
      }))
    );
    setIdx(0);
    setFuseLeft(14);
    setScore(0);
    setLives(3);
    setCoinsEarned(0);
    setPicked(null);
    setShellState('playing');
    syncBodyGameState('playing');
    marioAudio.playPowerUp();
  };

  const current = deck[idx % deck.length];

  useEffect(() => {
    if (shellState !== 'playing' || picked !== null) return;
    const timer = window.setInterval(() => {
      setFuseLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setPicked('__TIMEOUT__');
          setLives((l) => {
            const next = l - 1;
            if (next <= 0) {
              setTimeout(() => {
                setShellState('gameover');
                syncBodyGameState('gameover');
              }, 1100);
            }
            return next;
          });
          marioAudio.playWrongAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [shellState, picked, idx]);

  const handleCutWire = (option: string) => {
    if (shellState !== 'playing' || picked !== null) return;
    setPicked(option);
    if (option === current.correctPeriod) {
      const speedBonus = fuseLeft * 10;
      setScore((s) => s + 100 + speedBonus);
      setCoinsEarned((c) => c + 5);
      onEarnCoins(5);
      marioAudio.playCoin();
    } else {
      const nextLives = lives - 1;
      setLives(nextLives);
      marioAudio.playWrongAnswer();
      if (nextLives <= 0) {
        setTimeout(() => {
          setShellState('gameover');
          syncBodyGameState('gameover');
        }, 1200);
      }
    }
  };

  const handleNextBomb = () => {
    if (idx + 1 >= deck.length) {
      onEarnCoins(20);
      setCoinsEarned((c) => c + 20);
      setScore((s) => s + 200);
      setShellState('victory');
      syncBodyGameState('victory');
      marioAudio.playFanfare();
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
      setFuseLeft(14);
      marioAudio.playClick();
    }
  };

  return (
    <div
      data-testid="vault-game-chrono-blitz"
      onContextMenu={(e) => e.preventDefault()}
      className="bg-slate-950 text-white rounded-3xl border-4 border-amber-500 shadow-[6px_6px_0_#000] overflow-hidden select-none"
    >
      {/* Header */}
      <div className="bg-slate-900 px-4 py-3 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center shrink-0">
            <Timer className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
              BOB-OMB CHRONO PRESCRIPTION BLITZ
            </span>
            <span className="text-xs font-bold text-slate-300 block">
              Defuser: {hero.name} · Bomb {Math.min(idx + 1, deck.length)} / {deck.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono tabular-nums">
          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase block">FUSE</span>
            <span className={`text-base sm:text-lg font-black ${fuseLeft <= 4 ? 'text-rose-400' : 'text-emerald-300'}`}>
              {fuseLeft}s
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase block">SCORE</span>
            <span className="text-base sm:text-lg font-black text-amber-300">{score}</span>
          </div>
          <div className="flex items-center gap-1" aria-label={`Shields: ${lives}`}>
            {[0, 1, 2].map((i) => (
              <Heart
                key={i}
                className={`w-5 h-5 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-800'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Bomb Defusal Stage */}
      <div className="p-5 sm:p-7 min-h-[340px] flex flex-col justify-between gap-5 bg-slate-950">
        {shellState === 'title' && (
          <div className="my-auto text-center space-y-4 py-6">
            <div className="w-14 h-14 rounded-full bg-slate-800 border-3 border-amber-400 mx-auto flex items-center justify-center">
              <Flame className="w-7 h-7 text-orange-400" />
            </div>
            <h2 className="text-xl sm:text-3xl font-black font-display text-amber-300">
              BOB-OMB CHRONO PRESCRIPTION BLITZ
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              Defuse 8 ticking Labor Law claims before the 14-second Bob-omb fuse runs out! Cut the wire matching the exact statutory prescriptive or notice period.
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-7 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] text-sm font-mario inline-flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START DEFUSAL</span>
            </button>
          </div>
        )}

        {shellState === 'playing' && (
          <>
            {/* Live Fuse Progress Bar */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-300 ${
                    fuseLeft <= 4 ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.max(0, (fuseLeft / 14) * 100)}%` }}
                />
              </div>

              <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 sm:p-5">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block mb-1">
                  TICKING STATUTORY DEADLINE CLAIM
                </span>
                <p className="text-sm sm:text-lg font-extrabold text-white leading-snug">
                  {current.claim}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.options.map((opt, wireIdx) => {
                const wireLabels = ['RED WIRE', 'BLUE WIRE', 'GOLD WIRE', 'GREEN WIRE'];
                const isSelected = picked === opt;
                const isAnswer = opt === current.correctPeriod;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={picked !== null}
                    onClick={() => handleCutWire(opt)}
                    className={`min-h-[58px] px-4 py-3 rounded-2xl border-3 font-black text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      picked === null
                        ? 'bg-slate-900 hover:bg-amber-400 hover:text-slate-950 border-slate-700 text-white'
                        : isAnswer
                        ? 'bg-emerald-500 text-slate-950 border-black'
                        : isSelected
                        ? 'bg-rose-600 text-white border-black'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono block opacity-75">
                        {wireLabels[wireIdx]}
                      </span>
                      <span className="text-sm sm:text-base font-display">{opt}</span>
                    </div>
                    <MarioStarIcon className="w-5 h-5 shrink-0" />
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <div className="bg-slate-900 border-2 border-emerald-400/70 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-xs sm:text-sm font-bold text-emerald-200">{current.basis}</p>
                {lives > 0 && (
                  <button
                    type="button"
                    onClick={handleNextBomb}
                    className="min-h-[44px] px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-xl border-2 border-black font-mario text-xs cursor-pointer shrink-0"
                  >
                    {idx + 1 >= deck.length ? 'FINISH' : 'NEXT BOB-OMB'}
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {(shellState === 'victory' || shellState === 'gameover') && (
          <div className="my-auto text-center space-y-4 py-5">
            <h3 className="text-xl sm:text-2xl font-black font-display text-amber-300">
              {shellState === 'victory'
                ? 'ALL 8 BOB-OMBS DEFUSED! PRESCRIPTION EXPERT!'
                : 'KABOOM! STATUTORY CLAIM PRESCRIBED!'}
            </h3>
            <p className="text-sm font-mono tabular-nums text-slate-300">
              Final Score: <strong className="text-white">{score}</strong> · Coins Earned:{' '}
              <strong className="text-amber-300">+{coinsEarned}</strong>
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-7 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl border-2 border-black font-mario text-xs cursor-pointer"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
