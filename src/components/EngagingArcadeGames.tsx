import React, { useState, useEffect, useRef } from 'react';
import { MarioAvatar } from '../types/laborLaw';
import { marioAudio } from '../utils/audio';
import {
  stepKoopaPinballBall,
  PINBALL_PASS_SCORE,
  PINBALL_JACKPOT_SCORE,
} from '../utils/round12Features';
import {
  MarioCoinIcon,
  MarioStarIcon,
  MarioCharacterAvatar,
} from './MarioIcons';
import {
  stepPlatformerVerticalPhysics,
  generatePayrollVoucher,
  evaluatePayrollStampDecision,
  PayrollInspectionVoucher,
  buildStatutoryWordHuntGrid,
  resolveWordHuntHint,
  TOWER_GUARDIAN_UNITS,
  TowerGuardianDef,
  COMMISSIONER_CRISIS_DECK,
  CommissionerMeters,
  applyCommissionerRuling,
} from '../utils/round10Features';
import { createFreshShuffledDeck } from '../utils/round11Features';
import {
  Play,
  Pause,
  RotateCcw,
  Shield,
  Sparkles,
  CheckCircle2,
  XCircle,
  Search,
  Lightbulb,
  Scale,
  Crosshair,
  Stamp,
  Heart,
  Zap,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
} from 'lucide-react';

export interface ArcadeActiveBoosts {
  doublePayoutActive: boolean;
  bonusShieldActive: boolean;
  radarCharges: number;
  onConsumeRadar?: () => void;
}

interface SharedEngagingGameProps {
  equippedAvatar: MarioAvatar;
  onEarnCoins: (amount: number) => void;
  boosts?: ArcadeActiveBoosts;
}

type ShellGameState = 'title' | 'playing' | 'paused' | 'gameover';

function syncBodyGameState(state: ShellGameState) {
  if (typeof document !== 'undefined') {
    document.body.dataset.state = state;
  }
}

/* ============================================================================
 * GAME 1: LAKITU SKYBRIDGE DASH (Canvas2D Action Platformer & Hazard Dodger)
 * ========================================================================== */
interface ParticleSlot {
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

interface SkyHazard {
  kind: 'spiny' | 'bullet' | 'hex';
  x: number;
  y: number;
  vx: number;
  baseY: number;
  phase: number;
  telegraph: number;
}

interface SkyToken {
  x: number;
  y: number;
  label: string;
  collected: boolean;
}

export const LakituSkybridgeDashGame: React.FC<SharedEngagingGameProps> = ({
  onEarnCoins,
  boosts,
}) => {
  const [gameState, setGameState] = useState<ShellGameState>(() => {
    if (
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('autostart') === '1'
    ) {
      return 'playing';
    }
    return 'title';
  });
  const [hudScore, setHudScore] = useState(0);
  const [hudHp, setHudHp] = useState(3);
  const [hudTokens, setHudTokens] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [victoryReached, setVictoryReached] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<ShellGameState>(gameState);
  stateRef.current = gameState;

  const boostsRef = useRef(boosts);
  boostsRef.current = boosts;
  const earnRef = useRef(onEarnCoins);
  earnRef.current = onEarnCoins;

  const inputRef = useRef({
    left: false,
    right: false,
    jumpHeld: false,
    jumpJustPressed: false,
    jumpCut: false,
    dashJustPressed: false,
  });

  const simRef = useRef({
    px: 130,
    py: 290,
    vx: 0,
    vy: 0,
    coyote: 0.1,
    jumpBuf: 0,
    dashTimer: 0,
    invuln: 0,
    hitstop: 0,
    shake: 0,
    scaleX: 1,
    scaleY: 1,
    hp: 3,
    maxHp: 3,
    score: 0,
    tokens: 0,
    distance: 0,
    spawnTimer: 1.2,
    tokenTimer: 0.7,
    hazards: [] as SkyHazard[],
    pickups: [] as SkyToken[],
    particles: Array.from({ length: 32 }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 0.4,
      color: '#fbbf24',
      size: 4,
    })) as ParticleSlot[],
    particleCursor: 0,
  });

  const spawnBurst = (x: number, y: number, color: string, count: number) => {
    const s = simRef.current;
    for (let i = 0; i < count; i++) {
      const slot = s.particles[s.particleCursor % s.particles.length];
      s.particleCursor = (s.particleCursor + 1) % s.particles.length;
      const angle = (Math.PI * 2 * i) / count + (i % 3) * 0.2;
      const speed = 70 + (i % 4) * 45;
      slot.active = true;
      slot.x = x;
      slot.y = y;
      slot.vx = Math.cos(angle) * speed;
      slot.vy = Math.sin(angle) * speed - 40;
      slot.life = 0.38;
      slot.maxLife = 0.38;
      slot.color = color;
      slot.size = count > 8 ? 5 : 3.5;
    }
  };

  const startRun = () => {
    const startHp = boostsRef.current?.bonusShieldActive ? 4 : 3;
    simRef.current = {
      ...simRef.current,
      px: 130,
      py: 290,
      vx: 0,
      vy: 0,
      coyote: 0.1,
      jumpBuf: 0,
      dashTimer: 0,
      invuln: 1.0,
      hitstop: 0,
      shake: 0,
      scaleX: 1,
      scaleY: 1,
      hp: startHp,
      maxHp: startHp,
      score: 0,
      tokens: 0,
      distance: 0,
      spawnTimer: 1.5,
      tokenTimer: 0.5,
      hazards: [],
      pickups: [
        { x: 340, y: 235, label: '8h', collected: false },
        { x: 520, y: 195, label: '+25% OT', collected: false },
      ],
    };
    inputRef.current = {
      left: false,
      right: false,
      jumpHeld: false,
      jumpJustPressed: false,
      jumpCut: false,
      dashJustPressed: false,
    };
    setHudHp(startHp);
    setHudScore(0);
    setHudTokens(0);
    setVictoryReached(false);
    setGameState('playing');
    syncBodyGameState('playing');
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    marioAudio.playJump();
  };

  useEffect(() => {
    syncBodyGameState(gameState);
  }, [gameState]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (stateRef.current === 'title' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        startRun();
        return;
      }
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (stateRef.current === 'playing') setGameState('paused');
        else if (stateRef.current === 'paused') setGameState('playing');
        return;
      }
      if (stateRef.current !== 'playing') return;

      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        inputRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        inputRef.current.right = true;
      }
      if (
        e.key === ' ' ||
        e.key === 'ArrowUp' ||
        e.key.toLowerCase() === 'w'
      ) {
        e.preventDefault();
        if (!inputRef.current.jumpHeld) {
          inputRef.current.jumpJustPressed = true;
        }
        inputRef.current.jumpHeld = true;
      }
      if (e.key === 'Shift' || e.key.toLowerCase() === 'k') {
        inputRef.current.dashJustPressed = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        inputRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        inputRef.current.right = false;
      }
      if (
        e.key === ' ' ||
        e.key === 'ArrowUp' ||
        e.key.toLowerCase() === 'w'
      ) {
        inputRef.current.jumpHeld = false;
        inputRef.current.jumpCut = true;
      }
    };

    const clearHeld = () => {
      inputRef.current.left = false;
      inputRef.current.right = false;
      inputRef.current.jumpHeld = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearHeld);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearHeld);
    };
  }, []);

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    const LABELS = ['8h Day', '+25% OT', '200% Hol', '105d Mat', '13th Mo', '5d SIL'];

    const loop = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(Math.max(0, rawDt), 0.05);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (canvas && ctx) {
        const W = 760;
        const H = 360;
        const groundY = 290;
        const s = simRef.current;

        if (stateRef.current === 'playing') {
          if (s.hitstop > 0) {
            s.hitstop = Math.max(0, s.hitstop - dt);
          } else {
            const inp = inputRef.current;
            if (inp.jumpJustPressed) {
              s.jumpBuf = 0.12;
              inp.jumpJustPressed = false;
            }
            if (inp.dashJustPressed && s.dashTimer <= 0) {
              s.dashTimer = 0.22;
              inp.dashJustPressed = false;
              spawnBurst(s.px, s.py - 14, '#38bdf8', 6);
              marioAudio.playJump();
            } else {
              inp.dashJustPressed = false;
            }

            const moveDir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
            const speed = s.dashTimer > 0 ? 440 : 250;
            s.vx = moveDir * speed;
            s.px = Math.max(40, Math.min(W - 40, s.px + s.vx * dt));
            s.dashTimer = Math.max(0, s.dashTimer - dt);
            s.invuln = Math.max(0, s.invuln - dt);

            const wasGrounded = s.py >= groundY - 0.5;
            const vStep = stepPlatformerVerticalPhysics({
              y: s.py,
              vy: s.vy,
              groundY,
              rawDt: dt,
              coyoteTimer: s.coyote,
              jumpBufferTimer: s.jumpBuf,
              jumpCutRequested: inp.jumpCut,
            });
            inp.jumpCut = false;
            s.py = vStep.y;
            s.vy = vStep.vy;
            s.coyote = vStep.coyoteTimer;
            s.jumpBuf = vStep.jumpBufferTimer;

            if (vStep.jumpedThisStep) {
              s.scaleX = 0.85;
              s.scaleY = 1.18;
              spawnBurst(s.px, groundY, '#fef08a', 5);
              marioAudio.playJump();
            } else if (!wasGrounded && vStep.grounded) {
              s.scaleX = 1.22;
              s.scaleY = 0.78;
            }
            s.scaleX += (1 - s.scaleX) * Math.min(1, dt * 14);
            s.scaleY += (1 - s.scaleY) * Math.min(1, dt * 14);

            // Scroll world distance & difficulty ramp
            const scrollSpeed = 165 + Math.min(110, s.tokens * 6);
            s.distance += scrollSpeed * dt;
            s.spawnTimer -= dt;
            if (s.spawnTimer <= 0) {
              const roll = (s.tokens + Math.floor(s.distance / 180)) % 3;
              if (roll === 0) {
                // Archetype 1: Spiny Ground Patrol
                s.hazards.push({
                  kind: 'spiny',
                  x: W + 30,
                  y: groundY,
                  vx: -scrollSpeed * 0.95,
                  baseY: groundY,
                  phase: 0,
                  telegraph: 0,
                });
              } else if (roll === 1) {
                // Archetype 2: Bullet Bill Charger with 0.45s sightline telegraph
                const laneY = s.tokens % 2 === 0 ? 245 : 195;
                s.hazards.push({
                  kind: 'bullet',
                  x: W - 18,
                  y: laneY,
                  vx: -360,
                  baseY: laneY,
                  phase: 0,
                  telegraph: 0.48,
                });
              } else {
                // Archetype 3: Magikoopa Sine-Wave Hex Orb
                s.hazards.push({
                  kind: 'hex',
                  x: W + 24,
                  y: 225,
                  vx: -220,
                  baseY: 225,
                  phase: 0,
                  telegraph: 0,
                });
              }
              s.spawnTimer = Math.max(0.85, 1.65 - s.tokens * 0.03);
            }

            s.tokenTimer -= dt;
            if (s.tokenTimer <= 0) {
              const idx = s.tokens % LABELS.length;
              s.pickups.push({
                x: W + 25,
                y: idx % 2 === 0 ? 225 : 175,
                label: LABELS[idx],
                collected: false,
              });
              s.tokenTimer = 1.05;
            }

            // Update pickups
            for (const tk of s.pickups) {
              tk.x -= scrollSpeed * dt;
              if (
                !tk.collected &&
                Math.abs(tk.x - s.px) < 28 &&
                Math.abs(tk.y - (s.py - 16)) < 28
              ) {
                tk.collected = true;
                s.tokens += 1;
                s.score += 100;
                spawnBurst(tk.x, tk.y, '#fbbf24', 7);
                marioAudio.playCoin();
                setHudTokens(s.tokens);
                setHudScore(s.score);
                if (s.tokens >= 15) {
                  const mult = boostsRef.current?.doublePayoutActive ? 2 : 1;
                  earnRef.current(18 * mult);
                  setBestScore((b) => Math.max(b, s.score + 300));
                  setHudScore(s.score + 300);
                  setVictoryReached(true);
                  setGameState('gameover');
                  marioAudio.playLevelUp();
                }
              }
            }
            s.pickups = s.pickups.filter((t) => !t.collected && t.x > -50);

            // Update hazards
            for (const hz of s.hazards) {
              if (hz.telegraph > 0) {
                hz.telegraph -= dt;
                continue;
              }
              hz.x += hz.vx * dt;
              hz.phase += dt * 5;
              if (hz.kind === 'hex') {
                hz.y = hz.baseY + Math.sin(hz.phase) * 38;
              }
              const hitDistX = Math.abs(hz.x - s.px);
              const hitDistY = Math.abs(hz.y - 12 - (s.py - 16));
              if (hitDistX < 22 && hitDistY < 22 && s.invuln <= 0 && s.dashTimer <= 0) {
                s.hp -= 1;
                s.invuln = 1.1;
                s.hitstop = 0.06;
                s.shake = 1;
                spawnBurst(s.px, s.py - 16, '#ef4444', 14);
                marioAudio.playStomp();
                setHudHp(Math.max(0, s.hp));
                if (s.hp <= 0) {
                  const mult = boostsRef.current?.doublePayoutActive ? 2 : 1;
                  if (s.tokens > 0) {
                    earnRef.current(Math.max(2, Math.floor(s.tokens / 2)) * mult);
                  }
                  setBestScore((b) => Math.max(b, s.score));
                  setVictoryReached(false);
                  setGameState('gameover');
                }
              }
            }
            s.hazards = s.hazards.filter((h) => h.x > -60);
          }
        }

        // Tick shake & particles even during hitstop
        s.shake = Math.max(0, s.shake - dt * 3.5);
        for (const p of s.particles) {
          if (!p.active) continue;
          p.life -= dt;
          if (p.life <= 0) {
            p.active = false;
            continue;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 320 * dt;
        }

        // Render Skybridge Stage
        ctx.save();
        if (s.shake > 0) {
          const mag = s.shake * s.shake * 7;
          ctx.translate((Math.sin(now) * mag), (Math.cos(now * 1.3) * mag));
        }
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, '#0c4a6e');
        sky.addColorStop(0.65, '#0284c7');
        sky.addColorStop(1, '#38bdf8');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);

        // Parallax clouds
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        for (let i = 0; i < 5; i++) {
          const cx = ((i * 190 - (s.distance * 0.25 + now * 0.015)) % (W + 160) + (W + 160)) % (W + 160) - 80;
          const cy = 54 + (i % 3) * 38;
          ctx.beginPath();
          ctx.roundRect(cx, cy, 96, 26, 13);
          ctx.fill();
        }

        // Golden Skybridge Deck
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(0, groundY, W, 16);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, groundY + 16, W, H - groundY - 16);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(W, groundY);
        ctx.stroke();

        // Pickups
        for (const tk of s.pickups) {
          ctx.fillStyle = '#fbbf24';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(tk.x, tk.y, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(tk.label, tk.x, tk.y + 3);
        }

        // Hazards + Telegraphs
        for (const hz of s.hazards) {
          if (hz.telegraph > 0) {
            ctx.strokeStyle = 'rgba(248, 113, 113, 0.85)';
            ctx.setLineDash([8, 6]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, hz.y - 10);
            ctx.lineTo(W, hz.y - 10);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('! CHARGER !', W - 14, hz.y - 16);
            continue;
          }
          if (hz.kind === 'spiny') {
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(hz.x, hz.y - 12, 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
          } else if (hz.kind === 'bullet') {
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.roundRect(hz.x - 18, hz.y - 22, 34, 20, 8);
            ctx.fill();
            ctx.fillStyle = '#f97316';
            ctx.fillRect(hz.x + 14, hz.y - 17, 8, 10);
          } else {
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(hz.x, hz.y - 12, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        // Hero Actor
        const blink = s.invuln > 0 && Math.floor(now / 70) % 2 === 0;
        if (!blink) {
          ctx.save();
          ctx.translate(s.px, s.py);
          ctx.scale(s.scaleX, s.scaleY);
          ctx.fillStyle = s.dashTimer > 0 ? '#38bdf8' : '#ef4444';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(-15, -34, 30, 34, 9);
          ctx.fill();
          ctx.stroke();
          // Visor / Cap emblem
          ctx.fillStyle = '#fde047';
          ctx.fillRect(-9, -27, 18, 8);
          ctx.restore();
        }

        // Pooled Particles
        for (const p of s.particles) {
          if (!p.active) continue;
          ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      data-testid="game-skybridge-dash"
      className="bg-slate-950 rounded-3xl border-4 border-black overflow-hidden shadow-[6px_6px_0_#000] text-white relative"
    >
      {/* Compact Perimeter HUD */}
      <div className="bg-slate-900 px-4 py-2.5 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" aria-label={`Vitality ${hudHp}`}>
            {Array.from({ length: Math.max(3, hudHp) }).map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 ${
                  i < hudHp ? 'text-rose-500 fill-rose-500' : 'text-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="text-xs font-mono font-black tabular-nums text-amber-300">
            TOKENS {hudTokens}/15 · SCORE {hudScore}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {gameState === 'playing' && (
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                setGameState('paused');
              }}
              aria-label="Pause Skybridge Dash"
              className="min-h-[38px] min-w-[38px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 inline-flex items-center justify-center cursor-pointer"
            >
              <Pause className="w-4 h-4 text-amber-300" />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              startRun();
            }}
            aria-label="Restart Skybridge Dash"
            className="min-h-[38px] min-w-[38px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 inline-flex items-center justify-center cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-emerald-300" />
          </button>
        </div>
      </div>

      {/* Isolated Canvas Stage */}
      <div className="relative bg-sky-950">
        <canvas
          ref={canvasRef}
          width={760}
          height={360}
          className="w-full h-[250px] sm:h-[340px] block object-cover select-none"
        />

        {/* Title Overlay (Diegetic In-World Awakening) */}
        {gameState === 'title' && (
          <div className="absolute inset-0 bg-slate-950/65 flex flex-col items-center justify-between p-5 text-center">
            <div />
            <div className="space-y-3 max-w-md">
              <svg
                viewBox="0 0 360 64"
                className="w-64 sm:w-80 mx-auto drop-shadow-[0_4px_0_#000]"
                aria-hidden="true"
              >
                <rect x="6" y="6" width="348" height="52" rx="14" fill="#fbbf24" stroke="#0f172a" strokeWidth="4" />
                <text
                  x="180"
                  y="40"
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="22"
                  fontWeight="900"
                  fontFamily="sans-serif"
                >
                  LAKITU SKYBRIDGE DASH
                </text>
              </svg>
              <p className="text-xs sm:text-sm font-bold text-sky-100">
                Collect 15 Golden Statutory Tokens while jumping Spinies, dodging telegraphed Chargers &amp; dashing through Hex Orbs!
              </p>
              <button
                type="button"
                data-start="true"
                onClick={startRun}
                className="min-h-[48px] px-7 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Start Run</span>
              </button>
            </div>
            <p className="text-[11px] font-semibold text-sky-200">
              WASD / Arrows Move · Space Jump (Hold Higher) · Shift Dash · P Pause
            </p>
          </div>
        )}

        {/* Pause Modal */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-3 border-amber-400 rounded-2xl p-5 max-w-xs w-full text-center space-y-3 shadow-[6px_6px_0_#000]">
              <h3 className="text-lg font-black text-amber-300">RUN PAUSED</h3>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setGameState('playing')}
                  className="min-h-[44px] rounded-xl bg-amber-400 text-slate-950 font-black text-xs border-2 border-black cursor-pointer"
                >
                  Resume
                </button>
                <button
                  type="button"
                  onClick={startRun}
                  className="min-h-[44px] rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-600 cursor-pointer"
                >
                  Restart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Victory / Defeat Modal */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-3 border-amber-400 rounded-2xl p-5 max-w-sm w-full text-center space-y-3 shadow-[6px_6px_0_#000]">
              <h3 className="text-xl font-black text-amber-300">
                {victoryReached ? 'SKYBRIDGE CLEAR!' : 'SKYBRIDGE WIPEOUT'}
              </h3>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono tabular-nums">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">TOKENS</span>
                  <span className="font-black text-emerald-300">{hudTokens}/15</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">SCORE</span>
                  <span className="font-black text-white">{hudScore}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">BEST</span>
                  <span className="font-black text-amber-300">
                    {Math.max(bestScore, hudScore)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                data-start="true"
                onClick={startRun}
                className="min-h-[46px] w-full rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm border-2 border-black shadow-[0_3px_0_#000] cursor-pointer"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Responsive Touch Gamepad (>=48px Hitboxes for Phones & Tablets) */}
      <div className="bg-slate-900 p-3 border-t-2 border-slate-800 grid grid-cols-4 gap-2">
        <button
          type="button"
          onPointerDown={() => {
            inputRef.current.left = true;
          }}
          onPointerUp={() => {
            inputRef.current.left = false;
          }}
          onPointerLeave={() => {
            inputRef.current.left = false;
          }}
          className="min-h-[48px] rounded-xl bg-slate-800 active:bg-amber-400 active:text-slate-950 font-black text-xs border-2 border-slate-700 inline-flex items-center justify-center gap-1 select-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Left</span>
        </button>
        <button
          type="button"
          onPointerDown={() => {
            inputRef.current.right = true;
          }}
          onPointerUp={() => {
            inputRef.current.right = false;
          }}
          onPointerLeave={() => {
            inputRef.current.right = false;
          }}
          className="min-h-[48px] rounded-xl bg-slate-800 active:bg-amber-400 active:text-slate-950 font-black text-xs border-2 border-slate-700 inline-flex items-center justify-center gap-1 select-none cursor-pointer"
        >
          <span>Right</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onPointerDown={() => {
            inputRef.current.dashJustPressed = true;
          }}
          className="min-h-[48px] rounded-xl bg-sky-500 active:bg-sky-400 text-slate-950 font-black text-xs border-2 border-black inline-flex items-center justify-center gap-1 select-none cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          <span>Dash</span>
        </button>
        <button
          type="button"
          onPointerDown={() => {
            inputRef.current.jumpJustPressed = true;
            inputRef.current.jumpHeld = true;
          }}
          onPointerUp={() => {
            inputRef.current.jumpHeld = false;
            inputRef.current.jumpCut = true;
          }}
          className="min-h-[48px] rounded-xl bg-amber-400 active:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black inline-flex items-center justify-center gap-1 select-none cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
          <span>Jump</span>
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
 * GAME 2: DOLE WAGE & PAYROLL STAMP DESK (Papers-Please Tactile Desk Sim)
 * ========================================================================== */
export const DolePayrollStampDeskGame: React.FC<SharedEngagingGameProps> = ({
  onEarnCoins,
  boosts,
}) => {
  const [gameState, setGameState] = useState<ShellGameState>('title');
  const [voucherDeck, setVoucherDeck] = useState<number[]>(() =>
    createFreshShuffledDeck(
      Array.from({ length: 24 }, (_, idx) => idx),
      Date.now()
    )
  );
  const [voucherStep, setVoucherStep] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [mistakesLeft, setMistakesLeft] = useState(3);
  const [stampedMark, setStampedMark] = useState<null | {
    approved: boolean;
    correct: boolean;
    feedback: string;
  }>(null);
  const [radarRevealed, setRadarRevealed] = useState(false);

  const voucherIdx = voucherDeck[voucherStep % voucherDeck.length] ?? 0;
  const currentVoucher: PayrollInspectionVoucher = generatePayrollVoucher(voucherIdx);

  const startShift = () => {
    setVoucherDeck(
      createFreshShuffledDeck(
        Array.from({ length: 24 }, (_, idx) => idx),
        Date.now() + Math.floor(Math.random() * 99999)
      )
    );
    setVoucherStep(0);
    setScore(0);
    setCombo(0);
    setMistakesLeft(boosts?.bonusShieldActive ? 4 : 3);
    setStampedMark(null);
    setRadarRevealed(false);
    setGameState('playing');
    marioAudio.playPipe();
  };

  const handleStamp = (approveCompliant: boolean) => {
    if (stampedMark || gameState !== 'playing') return;
    const res = evaluatePayrollStampDecision(currentVoucher, approveCompliant);
    setStampedMark({
      approved: approveCompliant,
      correct: res.correct,
      feedback: res.feedback,
    });
    if (res.correct) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setScore((s) => s + res.pointsDelta + nextCombo * 25);
      const mult = boosts?.doublePayoutActive ? 2 : 1;
      onEarnCoins(3 * mult);
      marioAudio.playCoin();
    } else {
      setCombo(0);
      setMistakesLeft((m) => {
        const next = m - 1;
        if (next <= 0) {
          window.setTimeout(() => setGameState('gameover'), 900);
        }
        return next;
      });
      marioAudio.playStomp();
    }
  };

  const handleNextPayslip = () => {
    if (voucherStep >= 9) {
      const mult = boosts?.doublePayoutActive ? 2 : 1;
      onEarnCoins(15 * mult);
      marioAudio.playLevelUp();
      setGameState('gameover');
      return;
    }
    setVoucherStep((i) => i + 1);
    setStampedMark(null);
    setRadarRevealed(false);
    marioAudio.playClick();
  };

  return (
    <div
      data-testid="game-payroll-stamp-desk"
      className="bg-[#3e2723] rounded-3xl border-4 border-slate-950 p-4 sm:p-6 shadow-[6px_6px_0_#000] text-white space-y-4"
    >
      {/* Top Mahogany Desk Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/85 px-4 py-3 rounded-2xl border-2 border-amber-500/70">
        <div className="flex items-center gap-2.5">
          <Stamp className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <h3 className="font-black text-sm sm:text-base font-display text-amber-300">
              DOLE PAYROLL INSPECTOR STAMP DESK
            </h3>
            <p className="text-[11px] text-slate-300 font-semibold">
              Inspect payslip math vs. Labor Code benchmarks &amp; slam the right rubber stamp!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono font-black tabular-nums">
          <span className="text-emerald-300">COMBO x{combo}</span>
          <span className="text-amber-300">SCORE {score}</span>
          <span className="text-rose-300">SEALS {mistakesLeft}</span>
        </div>
      </div>

      {gameState === 'title' ? (
        <div className="bg-slate-950/80 rounded-2xl p-6 text-center space-y-4 border-2 border-amber-400/50">
          <h4 className="text-xl sm:text-2xl font-black font-display text-white">
            REGIONAL LABOR STANDARDS AUDIT SHIFT
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Employers submit live weekly payslips across your mahogany inspection counter. Compare Daily Wage, Overtime (125%), Holiday Multipliers (130%/200%), and Deductions against the Reference Manual — then stamp <strong className="text-emerald-300">APPROVE</strong> or <strong className="text-rose-300">COMPLIANCE ORDER</strong>!
          </p>
          <button
            type="button"
            data-start="true"
            onClick={startShift}
            className="min-h-[48px] px-7 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm border-3 border-black shadow-[0_4px_0_#000] cursor-pointer"
          >
            Open Inspection Window
          </button>
        </div>
      ) : gameState === 'gameover' ? (
        <div className="bg-slate-950/90 rounded-2xl p-6 text-center space-y-4 border-3 border-amber-400">
          <h4 className="text-xl font-black text-amber-300">
            AUDIT SHIFT COMPLETE · {score} PTS
          </h4>
          <p className="text-xs sm:text-sm text-slate-300">
            You audited {voucherStep + 1} randomized establishment payroll vouchers for Philippine workers!
          </p>
          <button
            type="button"
            data-start="true"
            onClick={startShift}
            className="min-h-[46px] px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm border-2 border-black shadow-[0_3px_0_#000] cursor-pointer"
          >
            Replay Audit Shift
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left: Tactile Paper Payslip Voucher */}
          <div className="lg:col-span-7 bg-[#fffbeb] text-slate-950 rounded-2xl p-4 sm:p-5 border-3 border-slate-950 shadow-[4px_4px_0_#000] relative space-y-3">
            <div className="flex items-center justify-between border-b-2 border-slate-300 pb-2">
              <div>
                <span className="text-[10px] font-mono font-black text-slate-500 block">
                  VOUCHER #{currentVoucher.voucherNo}
                </span>
                <h4 className="font-black text-base text-slate-900">
                  {currentVoucher.establishment}
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-200/70 px-2.5 py-1 rounded-lg">
                {currentVoucher.regionLabel}
              </span>
            </div>

            <div className="space-y-1.5 text-xs sm:text-sm font-mono tabular-nums">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-sans font-bold">Employee:</span>
                <span className="font-bold">{currentVoucher.workerName}</span>
              </div>
              <div
                className={`flex justify-between py-1 border-b border-slate-200 ${
                  radarRevealed && currentVoucher.violationCode === 'sub_minimum_wage'
                    ? 'bg-rose-200 px-1.5 rounded font-black'
                    : ''
                }`}
              >
                <span className="text-slate-600 font-sans font-bold">
                  Daily Basic Wage ({currentVoucher.regularDays}d):
                </span>
                <span className="font-black">
                  ₱{currentVoucher.dailyRatePaid}/day (₱
                  {currentVoucher.dailyRatePaid * currentVoucher.regularDays})
                </span>
              </div>
              <div
                className={`flex justify-between py-1 border-b border-slate-200 ${
                  radarRevealed && currentVoucher.violationCode === 'underpaid_ot'
                    ? 'bg-rose-200 px-1.5 rounded font-black'
                    : ''
                }`}
              >
                <span className="text-slate-600 font-sans font-bold">
                  Overtime ({currentVoucher.overtimeHours} hrs):
                </span>
                <span className="font-black">₱{currentVoucher.overtimePayListed}</span>
              </div>
              <div
                className={`flex justify-between py-1 border-b border-slate-200 ${
                  radarRevealed && currentVoucher.violationCode === 'holiday_shortfall'
                    ? 'bg-rose-200 px-1.5 rounded font-black'
                    : ''
                }`}
              >
                <span className="text-slate-600 font-sans font-bold">
                  Holiday ({currentVoucher.holidayType}):
                </span>
                <span className="font-black">₱{currentVoucher.holidayPayListed}</span>
              </div>
              <div
                className={`flex justify-between py-1 border-b border-slate-200 ${
                  radarRevealed && currentVoucher.violationCode === 'illegal_deduction'
                    ? 'bg-rose-200 px-1.5 rounded font-black'
                    : ''
                }`}
              >
                <span className="text-slate-600 font-sans font-bold">
                  Deduction ({currentVoucher.deductionLabel}):
                </span>
                <span className="font-black text-rose-700">
                  -₱{currentVoucher.deductionAmount}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-base font-black text-slate-950">
                <span>NET PAYSLIP DISBURSED:</span>
                <span>₱{currentVoucher.netPayslipTotal.toLocaleString()}</span>
              </div>
            </div>

            {stampedMark && (
              <div
                className={`p-3 rounded-xl border-2 text-xs font-bold space-y-2 ${
                  stampedMark.correct
                    ? 'bg-emerald-100 border-emerald-700 text-emerald-950'
                    : 'bg-rose-100 border-rose-700 text-rose-950'
                }`}
              >
                <div className="font-black uppercase flex items-center gap-1.5">
                  {stampedMark.correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  )}
                  <span>
                    {stampedMark.correct ? 'ACCURATE RULING!' : 'AUDIT DISCREPANCY!'}
                  </span>
                </div>
                <p>{stampedMark.feedback}</p>
                <button
                  type="button"
                  onClick={handleNextPayslip}
                  className="min-h-[42px] w-full rounded-xl bg-slate-950 text-amber-300 font-black text-xs cursor-pointer"
                >
                  Next Payslip Voucher →
                </button>
              </div>
            )}
          </div>

          {/* Right: DOLE Inspector Field Manual + Stamp Paddles */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-slate-900 rounded-2xl p-4 border-2 border-slate-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-300">
                  DOLE STATUTORY BENCHMARK CARD
                </span>
                {boosts && boosts.radarCharges > 0 && !radarRevealed && !stampedMark && (
                  <button
                    type="button"
                    onClick={() => {
                      setRadarRevealed(true);
                      boosts.onConsumeRadar?.();
                      marioAudio.playPowerUp();
                    }}
                    className="min-h-[34px] px-2.5 rounded-lg bg-sky-400 text-slate-950 font-black text-[11px] cursor-pointer"
                  >
                    Use Radar ({boosts.radarCharges})
                  </button>
                )}
              </div>
              <ul className="text-xs text-slate-200 space-y-1.5 font-medium">
                <li>· NCR Minimum Wage: <strong className="text-amber-300">₱645/day</strong> (₱80.63/hr)</li>
                <li>· Ordinary OT (Art. 87): <strong className="text-amber-300">Hourly × 1.25 × hrs</strong> (₱100.78/hr @ ₱645)</li>
                <li>· Regular Holiday Worked: <strong className="text-amber-300">200% Daily Wage</strong> (₱1,290 @ ₱645)</li>
                <li>· Special Day Worked: <strong className="text-amber-300">130% Daily Wage</strong></li>
                <li>· Deductions (Art. 113): SSS/PhilHealth/Pag-IBIG &amp; Union Check-off OK; unilateral breakage illegal!</li>
              </ul>
              {radarRevealed && currentVoucher.isCompliant && (
                <p className="text-xs font-black text-emerald-300 pt-1">
                  Radar Scan: All line items match statutory minimums!
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                disabled={Boolean(stampedMark)}
                onClick={() => handleStamp(true)}
                className="min-h-[54px] rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs border-3 border-black shadow-[0_3px_0_#000] px-3 py-2 cursor-pointer"
              >
                STAMP COMPLIANT
              </button>
              <button
                type="button"
                disabled={Boolean(stampedMark)}
                onClick={() => handleStamp(false)}
                className="min-h-[54px] rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white font-black text-xs border-3 border-black shadow-[0_3px_0_#000] px-3 py-2 cursor-pointer"
              >
                ISSUE VIOLATION ORDER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * GAME 3: MUSHROOM UNION TOWER DEFENSE (5x7 Tactical Lane Grid Defense)
 * ========================================================================== */
interface PlacedGuardian {
  id: string;
  row: number;
  col: number;
  def: TowerGuardianDef;
  hp: number;
  cooldown: number;
}

interface LaneInvader {
  id: number;
  row: number;
  xCol: number; // 6.8 down to 0
  hp: number;
  maxHp: number;
  speed: number;
  archetype: 'swarmer' | 'charger' | 'phantom';
  chillTimer: number;
}

export const MushroomUnionTowerDefenseGame: React.FC<SharedEngagingGameProps> = ({
  onEarnCoins,
  boosts,
}) => {
  const [gameState, setGameState] = useState<ShellGameState>('title');
  const [selectedUnit, setSelectedUnit] = useState<TowerGuardianDef>(
    TOWER_GUARDIAN_UNITS[0]
  );
  const [unionGold, setUnionGold] = useState(120);
  const [treasuryHp, setTreasuryHp] = useState(100);
  const [wave, setWave] = useState(1);
  const [towers, setTowers] = useState<PlacedGuardian[]>([]);
  const [invaders, setInvaders] = useState<LaneInvader[]>([]);
  const [defeatedCount, setDefeatedCount] = useState(0);

  const nextEnemyId = useRef(1);

  const startDefense = () => {
    setUnionGold(130 + (boosts?.radarCharges ? 20 : 0));
    setTreasuryHp(boosts?.bonusShieldActive ? 130 : 100);
    setWave(1);
    setDefeatedCount(0);
    setTowers([
      {
        id: 'starter-0',
        row: 2,
        col: 1,
        def: TOWER_GUARDIAN_UNITS[0],
        hp: TOWER_GUARDIAN_UNITS[0].maxHp,
        cooldown: 0.4,
      },
    ]);
    setInvaders([
      {
        id: nextEnemyId.current++,
        row: 2,
        xCol: 6.6,
        hp: 70,
        maxHp: 70,
        speed: 0.48,
        archetype: 'swarmer',
        chillTimer: 0,
      },
    ]);
    setGameState('playing');
    marioAudio.playPowerUp();
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = window.setInterval(() => {
      setUnionGold((g) => g + 3);
      setTowers((currTowers) => {
        let bonusMint = 0;
        const nextT = currTowers.map((t) => {
          let cd = t.cooldown - 0.25;
          if (cd <= 0 && t.def.incomePerTick) {
            bonusMint += t.def.incomePerTick;
            cd = t.def.cooldownSec;
          }
          return { ...t, cooldown: cd };
        });
        if (bonusMint > 0) setUnionGold((g) => g + bonusMint);
        return nextT;
      });

      setInvaders((currInv) => {
        let leakedDamage = 0;
        let newlyDefeated = 0;

        // Apply tower attacks per row
        const updated = currInv.map((inv) => {
          let hp = inv.hp;
          let chill = Math.max(0, inv.chillTimer - 0.25);
          for (const t of towers) {
            if (t.row === inv.row && t.col <= inv.xCol && inv.xCol - t.col <= 4.5) {
              hp -= t.def.damage * 0.25;
              if (t.def.slowFactor) chill = 1.5;
            }
          }
          const mult = chill > 0 ? 0.55 : 1;
          const blocked = towers.some(
            (t) => t.row === inv.row && Math.abs(inv.xCol - t.col) < 0.35
          );
          const nextX = blocked ? inv.xCol : inv.xCol - inv.speed * mult * 0.25;
          if (nextX <= 0) {
            leakedDamage += 18;
          }
          if (hp <= 0) {
            newlyDefeated += 1;
          }
          return { ...inv, hp, xCol: nextX, chillTimer: chill };
        });

        // Damage blocking towers
        if (currInv.length > 0) {
          setTowers((prevTowers) =>
            prevTowers
              .map((t) => {
                const hitting = currInv.some(
                  (inv) => inv.row === t.row && Math.abs(inv.xCol - t.col) < 0.4
                );
                return hitting ? { ...t, hp: t.hp - 9 } : t;
              })
              .filter((t) => t.hp > 0)
          );
        }

        if (newlyDefeated > 0) {
          setUnionGold((g) => g + newlyDefeated * 18);
          setDefeatedCount((c) => {
            const total = c + newlyDefeated;
            const nextWave = Math.min(5, 1 + Math.floor(total / 5));
            setWave(nextWave);
            if (total >= 20) {
              const mult = boosts?.doublePayoutActive ? 2 : 1;
              onEarnCoins(22 * mult);
              marioAudio.playLevelUp();
              setGameState('gameover');
            }
            return total;
          });
        }

        if (leakedDamage > 0) {
          setTreasuryHp((hp) => {
            const rem = Math.max(0, hp - leakedDamage);
            if (rem <= 0) {
              setGameState('gameover');
              marioAudio.playGameOver();
            }
            return rem;
          });
        }

        const survivors = updated.filter((i) => i.hp > 0 && i.xCol > 0);
        if (survivors.length < Math.min(5, wave + 1)) {
          const row = (nextEnemyId.current * 3) % 5;
          const archRoll = nextEnemyId.current % 3;
          const archetype =
            archRoll === 0 ? 'swarmer' : archRoll === 1 ? 'charger' : 'phantom';
          const baseHp =
            archetype === 'phantom' ? 115 : archetype === 'charger' ? 65 : 85;
          survivors.push({
            id: nextEnemyId.current++,
            row,
            xCol: 6.7,
            hp: baseHp + wave * 12,
            maxHp: baseHp + wave * 12,
            speed: archetype === 'charger' ? 0.82 : archetype === 'phantom' ? 0.4 : 0.55,
            archetype,
            chillTimer: 0,
          });
        }
        return survivors;
      });
    }, 250);

    return () => window.clearInterval(interval);
  }, [gameState, towers, wave, boosts, onEarnCoins]);

  const handlePlaceTile = (r: number, c: number) => {
    if (gameState !== 'playing' || c >= 6) return;
    const existing = towers.find((t) => t.row === r && t.col === c);
    if (existing) return;
    if (unionGold < selectedUnit.cost) {
      marioAudio.playStomp();
      return;
    }
    setUnionGold((g) => g - selectedUnit.cost);
    setTowers((prev) => [
      ...prev,
      {
        id: `t-${Date.now()}-${r}-${c}`,
        row: r,
        col: c,
        def: selectedUnit,
        hp: selectedUnit.maxHp,
        cooldown: 0.5,
      },
    ]);
    marioAudio.playCoin();
  };

  return (
    <div
      data-testid="game-union-tower-defense"
      className="bg-slate-900 rounded-3xl border-4 border-slate-950 p-4 sm:p-5 shadow-[6px_6px_0_#000] text-white space-y-4"
    >
      {/* Unified Perimeter Dock */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-2xl border-2 border-emerald-500/60">
        <div>
          <h3 className="font-black text-sm sm:text-base font-display text-emerald-300">
            MUSHROOM UNION TOWER DEFENSE
          </h3>
          <p className="text-[11px] text-slate-300">
            Deploy Labor Guardians on the 5×7 grid to stop 20 Wage-Shaver &amp; Ghost-Agency invaders!
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono font-black tabular-nums">
          <span className="text-amber-300">GOLD {unionGold}g</span>
          <span className="text-sky-300">WAVE {wave}/5</span>
          <span className="text-emerald-300">KO {defeatedCount}/20</span>
          <span className="text-rose-300">VAULT HP {treasuryHp}</span>
        </div>
      </div>

      {gameState === 'title' ? (
        <div className="bg-slate-950/90 rounded-2xl p-6 text-center space-y-4 border-2 border-emerald-400/50">
          <h4 className="text-xl font-black font-display">
            PROTECT THE WORKERS&apos; TREASURY
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Select a Guardian unit below and tap any green turf cell (columns 1–6) to fortify lanes against 3 distinct invader types: Wage-Shaver Swarmers, Ghost-Agency Chargers &amp; Brownout Phantoms!
          </p>
          <button
            type="button"
            data-start="true"
            onClick={startDefense}
            className="min-h-[48px] px-7 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm border-3 border-black shadow-[0_4px_0_#000] cursor-pointer"
          >
            Start Lane Defense
          </button>
        </div>
      ) : gameState === 'gameover' ? (
        <div className="bg-slate-950/90 rounded-2xl p-6 text-center space-y-4 border-3 border-amber-400">
          <h4 className="text-xl font-black text-amber-300">
            {treasuryHp > 0 ? 'WORKERS TREASURY DEFENDED!' : 'TREASURY BREACHED'}
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 font-mono tabular-nums">
            Invaders Repelled: {defeatedCount}/20 · Remaining Vault HP: {treasuryHp}
          </p>
          <button
            type="button"
            data-start="true"
            onClick={startDefense}
            className="min-h-[46px] px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-sm border-2 border-black cursor-pointer"
          >
            Play Again
          </button>
        </div>
      ) : (
        <>
          {/* Buildable Unit Dock with Live Cost, Keybind & Role Clue */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {TOWER_GUARDIAN_UNITS.map((u) => {
              const active = selectedUnit.id === u.id;
              const canAfford = unionGold >= u.cost;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUnit(u)}
                  className={`min-h-[54px] p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-950 text-white border-slate-700 hover:border-amber-400'
                  } ${!canAfford && !active ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between text-xs font-black">
                    <span>
                      [{u.keyBind}] {u.name}
                    </span>
                    <span className="font-mono tabular-nums">{u.cost}g</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold block mt-0.5 ${
                      active ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {u.roleClue}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 5x7 Tactical Turf Board */}
          <div className="space-y-1.5 bg-[#0f5132] p-2.5 sm:p-3.5 rounded-2xl border-3 border-black overflow-hidden">
            {Array.from({ length: 5 }).map((_, r) => (
              <div key={r} className="grid grid-cols-7 gap-1.5 relative">
                {Array.from({ length: 7 }).map((__, c) => {
                  const placed = towers.find((t) => t.row === r && t.col === c);
                  const isSpawnZone = c === 6;
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={isSpawnZone}
                      onClick={() => handlePlaceTile(r, c)}
                      aria-label={`Lane ${r + 1} Column ${c + 1}`}
                      className={`min-h-[46px] sm:min-h-[54px] rounded-xl border flex flex-col items-center justify-center relative text-[10px] font-black cursor-pointer transition-colors ${
                        isSpawnZone
                          ? 'bg-rose-950/70 border-rose-500/40 text-rose-300 cursor-default'
                          : placed
                          ? 'bg-slate-900 border-amber-400 text-amber-300'
                          : 'bg-emerald-800/75 hover:bg-emerald-700/80 border-emerald-600/50 text-emerald-200/70'
                      }`}
                    >
                      {placed ? (
                        <>
                          <span className="truncate max-w-full px-1">
                            {placed.def.name.split(' ')[0]}
                          </span>
                          <span className="text-[9px] font-mono text-emerald-300">
                            {Math.ceil(placed.hp)}hp
                          </span>
                        </>
                      ) : isSpawnZone ? (
                        <span>SPAWN</span>
                      ) : (
                        <span>+</span>
                      )}
                    </button>
                  );
                })}

                {/* Invaders marching across Lane r */}
                {invaders
                  .filter((inv) => inv.row === r)
                  .map((inv) => {
                    const leftPct = Math.max(2, Math.min(94, (inv.xCol / 7) * 100));
                    return (
                      <div
                        key={inv.id}
                        style={{ left: `${leftPct}%` }}
                        className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-rose-600 border-2 border-black text-white text-[9px] font-mono font-black shadow-md whitespace-nowrap"
                      >
                        {inv.archetype === 'charger'
                          ? 'FAST'
                          : inv.archetype === 'phantom'
                          ? 'TANK'
                          : 'SHAVER'}{' '}
                        {Math.ceil(inv.hp)}
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ============================================================================
 * GAME 4: KOOPA SHELL PINBALL ARENA (Canvas2D Ricochet Bumper Physics)
 * ========================================================================== */
export const KoopaPinballBumperArenaGame: React.FC<SharedEngagingGameProps> = ({
  onEarnCoins,
  boosts,
}) => {
  const [gameState, setGameState] = useState<ShellGameState>('title');
  const [score, setScore] = useState(0);
  const [shellsLeft, setShellsLeft] = useState(3);
  const [lastBumperNote, setLastBumperNote] = useState(
    'Pull plunger with [SPACE] or Launch button to fire shell into the arena!'
  );
  const [combo, setCombo] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const flipperRef = useRef({ left: false, right: false, space: false });
  const comboRef = useRef(0);
  const targetsRef = useRef([
    { label: 'W', x: 100, y: 38, lit: false, pts: 60 },
    { label: 'A', x: 170, y: 32, lit: false, pts: 60 },
    { label: 'G', x: 260, y: 28, lit: false, pts: 100 },
    { label: 'E', x: 350, y: 32, lit: false, pts: 60 },
    { label: 'S', x: 420, y: 38, lit: false, pts: 60 },
  ]);
  const lastBumperHitTimeRef = useRef<Record<string, number>>({});

  const ballRef = useRef({
    x: 488,
    y: 280,
    vx: 0,
    vy: 0,
    shells: 3,
    score: 0,
    inShooter: true,
  });

  const BUMPERS = [
    { id: 'b_ot', x: 155, y: 115, r: 24, pts: 75, label: '125% OT', color: '#f59e0b' },
    { id: 'b_hol', x: 260, y: 92, r: 26, pts: 100, label: '200% HOL', color: '#ef4444' },
    { id: 'b_mat', x: 365, y: 115, r: 24, pts: 75, label: '105d MAT', color: '#ec4899' },
    { id: 'b_13th', x: 205, y: 175, r: 22, pts: 60, label: 'P.D. 851', color: '#10b981' },
    { id: 'b_ret', x: 315, y: 175, r: 22, pts: 80, label: '22.5d RET', color: '#38bdf8' },
  ];

  const launchPlunger = () => {
    if (stateRef.current !== 'playing') return;
    const b = ballRef.current;
    if (b.inShooter) {
      b.inShooter = false;
      b.vx = -45;
      b.vy = -490;
      marioAudio.playPipe();
      setLastBumperNote('Shell launched! Use flippers to keep it alive.');
    }
  };

  const startPinball = () => {
    const startShells = boosts?.bonusShieldActive ? 4 : 3;
    ballRef.current = {
      x: 488,
      y: 280,
      vx: 0,
      vy: 0,
      shells: startShells,
      score: 0,
      inShooter: true,
    };
    comboRef.current = 0;
    setCombo(0);
    targetsRef.current.forEach((t) => (t.lit = false));
    setScore(0);
    setShellsLeft(startShells);
    setGameState('playing');
    marioAudio.playJump();
    setLastBumperNote('Shell loaded in plunger! Press [SPACE] or Launch to shoot.');
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a')
        flipperRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd')
        flipperRef.current.right = true;
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        flipperRef.current.space = true;
        launchPlunger();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a')
        flipperRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd')
        flipperRef.current.right = false;
      if (e.code === 'Space' || e.key === ' ') {
        flipperRef.current.space = false;
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let prev = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.04, Math.max(0, (now - prev) / 1000));
      prev = now;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        const W = 520;
        const H = 340;
        const b = ballRef.current;

        if (stateRef.current === 'playing') {
          if (b.inShooter) {
            // Ball rests in the right-hand shooter chute awaiting player launch
            b.x = 488;
            b.y = 280;
            b.vx = 0;
            b.vy = 0;
          } else {
            const stepRes = stepKoopaPinballBall({
              x: b.x,
              y: b.y,
              vx: b.vx,
              vy: b.vy,
              rawDt: dt,
              leftFlip: flipperRef.current.left,
              rightFlip: flipperRef.current.right,
              ballsLeft: b.shells,
              score: b.score,
            });

            b.x = stepRes.x;
            b.y = stepRes.y;
            b.vx = stepRes.vx;
            b.vy = stepRes.vy;
            b.shells = stepRes.ballsLeft;

            // Rollover Targets (W-A-G-E-S)
            for (const t of targetsRef.current) {
              const dx = b.x - t.x;
              const dy = b.y - t.y;
              if (Math.hypot(dx, dy) < 16 && !t.lit) {
                t.lit = true;
                const bonus = t.pts * Math.max(1, comboRef.current);
                b.score += bonus;
                setScore(b.score);
                setLastBumperNote(`Lit '${t.label}' Rollover Target (+${bonus} pts)!`);
                marioAudio.playCoin();
                // Check if all 5 targets are lit
                if (targetsRef.current.every((tgt) => tgt.lit)) {
                  b.score += 500;
                  setScore(b.score);
                  setLastBumperNote('SUPER W-A-G-E-S JACKPOT BONUS (+500 pts)!');
                  marioAudio.playPowerUp();
                  setTimeout(() => {
                    targetsRef.current.forEach((tgt) => (tgt.lit = false));
                  }, 800);
                }
                break;
              }
            }

            let hitBumper = false;
            if (!stepRes.drainedThisStep) {
              for (const bmp of BUMPERS) {
                const dx = b.x - bmp.x;
                const dy = b.y - bmp.y;
                const dist = Math.hypot(dx, dy);
                const minDist = bmp.r + 10;
                const lastHit = lastBumperHitTimeRef.current[bmp.id] || 0;
                if (dist < minDist && dist > 0.001 && now - lastHit > 160) {
                  lastBumperHitTimeRef.current[bmp.id] = now;
                  const nx = dx / dist;
                  const ny = dy / dist;
                  b.x = bmp.x + nx * (minDist + 2);
                  b.y = bmp.y + ny * (minDist + 2);
                  const speed = Math.min(350, Math.max(220, Math.hypot(b.vx, b.vy)));
                  b.vx = nx * speed;
                  b.vy = ny * speed;
                  const ptsWithCombo = bmp.pts * Math.max(1, comboRef.current);
                  b.score += ptsWithCombo;
                  hitBumper = true;
                  setScore(b.score);
                  setLastBumperNote(`Hit ${bmp.label} Bumper (+${ptsWithCombo} pts)!`);
                  marioAudio.playCoin();
                  break;
                }
              }
            }

            if (!hitBumper && stepRes.bouncedFlipper) {
              comboRef.current += 1;
              setCombo(comboRef.current);
              b.score += 25 * comboRef.current;
              setScore(b.score);
              setLastBumperNote(`Active Flipper Volley! (${comboRef.current}x Combo)`);
              marioAudio.playJump();
            }

            if (stepRes.drainedThisStep) {
              comboRef.current = 0;
              setCombo(0);
              setShellsLeft(b.shells);
              if (b.shells > 0) {
                // Next shell returns to plunger lane so player must launch again!
                b.inShooter = true;
                b.x = 488;
                b.y = 280;
                b.vx = 0;
                b.vy = 0;
              }
              setLastBumperNote(
                b.shells > 0
                  ? `Shell drained! Press [SPACE] or Launch Shell (${b.shells} remaining).`
                  : b.score >= PINBALL_PASS_SCORE
                  ? `Run Complete — Cleared ${PINBALL_PASS_SCORE} target!`
                  : `Game Over — All shells drained below ${PINBALL_PASS_SCORE} target!`
              );
              marioAudio.playPipe();
            }

            if (b.score >= PINBALL_JACKPOT_SCORE) {
              const mult = boosts?.doublePayoutActive ? 2 : 1;
              onEarnCoins(18 * mult);
              setScore(b.score);
              setGameState('gameover');
              marioAudio.playLevelUp();
            } else if (stepRes.gameOver) {
              if (b.score >= PINBALL_PASS_SCORE) {
                const mult = boosts?.doublePayoutActive ? 2 : 1;
                onEarnCoins(10 * mult);
                marioAudio.playLevelUp();
              } else {
                marioAudio.playGameOver();
              }
              setGameState('gameover');
            }
          }
        }

        // Draw Pinball Table
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.strokeRect(8, 8, W - 16, H - 16);

        // Shooter Lane Divider (separates right-hand plunger lane x: 472..504)
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(472, 70);
        ctx.lineTo(472, H - 12);
        ctx.stroke();

        // Top Curved Shooter Guide
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(440, 70, 32, -Math.PI / 2, 0);
        ctx.stroke();

        // Draw Visible Center Drain Pit Hazard Zone (212..308)
        ctx.fillStyle = 'rgba(244, 63, 94, 0.28)';
        ctx.fillRect(212, H - 28, 96, 20);
        ctx.fillStyle = '#fda4af';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DRAIN PIT', 260, H - 14);

        // Draw Rollover Targets (W-A-G-E-S)
        for (const t of targetsRef.current) {
          ctx.fillStyle = t.lit ? '#fde047' : '#334155';
          ctx.beginPath();
          ctx.roundRect(t.x - 12, t.y - 12, 24, 24, 6);
          ctx.fill();
          ctx.strokeStyle = t.lit ? '#fbbf24' : '#64748b';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = t.lit ? '#0f172a' : '#cbd5e1';
          ctx.font = 'black 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(t.label, t.x, t.y + 4);
        }

        // Draw Bumpers
        for (const bmp of BUMPERS) {
          ctx.fillStyle = bmp.color;
          ctx.beginPath();
          ctx.arc(bmp.x, bmp.y, bmp.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(bmp.label, bmp.x, bmp.y + 3);
        }

        // Flippers with Real 96px Center Drain Gap (76..212 and 308..444)
        ctx.fillStyle = flipperRef.current.left ? '#fde047' : '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(76, flipperRef.current.left ? 283 : 295, 136, 13, 7);
        ctx.fill();

        ctx.fillStyle = flipperRef.current.right ? '#fde047' : '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(308, flipperRef.current.right ? 283 : 295, 136, 13, 7);
        ctx.fill();

        // Plunger indicator when ball is in shooter
        if (b.inShooter) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('PULL', 488, 320);
          ctx.fillText('SPACE', 488, 330);
        }

        // Koopa Shell Ball
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [boosts, onEarnCoins]);

  return (
    <div
      data-testid="game-koopa-pinball"
      className="bg-slate-950 rounded-3xl border-4 border-black p-4 shadow-[6px_6px_0_#000] text-white space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-700">
        <div>
          <h3 className="font-black text-sm sm:text-base font-display text-amber-300">
            KOOPA SHELL STATUTORY PINBALL
          </h3>
          <p className="text-[11px] text-slate-300">{lastBumperNote}</p>
        </div>
        <div className="font-mono text-xs font-black tabular-nums text-emerald-300">
          SHELLS {shellsLeft} · SCORE {score}/{PINBALL_PASS_SCORE} PASS ({PINBALL_JACKPOT_SCORE} JACKPOT)
        </div>
      </div>

      <div className="relative max-w-xl mx-auto">
        <canvas
          ref={canvasRef}
          width={520}
          height={340}
          className="w-full h-[270px] sm:h-[330px] rounded-2xl border-2 border-slate-800 block"
        />
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-slate-950/85 rounded-2xl flex flex-col items-center justify-center p-5 text-center space-y-3">
            <h4 className="text-xl font-black text-amber-300">
              {gameState === 'gameover'
                ? score >= PINBALL_PASS_SCORE
                  ? `VICTORY · ${score} PTS!`
                  : `GAME OVER · ${score}/${PINBALL_PASS_SCORE} PTS`
                : 'RICOCHET KOOPA BUMPER ARENA'}
            </h4>
            <p className="text-xs text-slate-300 max-w-sm">
              {gameState === 'gameover'
                ? score >= PINBALL_PASS_SCORE
                  ? 'Course Cleared! Coins credited to your Toad Shop vault.'
                  : `All 3 Shells drained! Press Left/Right Flippers actively to guard the center pit and reach ${PINBALL_PASS_SCORE}+ pts to earn coins.`
                : `Actively time Left & Right Flippers to guard the center Drain Pit! Score ${PINBALL_PASS_SCORE}+ pts to pass or ${PINBALL_JACKPOT_SCORE} for Jackpot!`}
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startPinball}
              className="min-h-[46px] px-6 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-sm border-2 border-black cursor-pointer"
            >
              {gameState === 'gameover' ? 'Launch Again' : 'Launch Shell'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-xl mx-auto">
        <button
          type="button"
          onPointerDown={() => {
            flipperRef.current.left = true;
          }}
          onPointerUp={() => {
            flipperRef.current.left = false;
          }}
          className="min-h-[48px] rounded-xl bg-sky-500 active:bg-amber-400 text-slate-950 font-black text-[11px] sm:text-xs border-2 border-black cursor-pointer shadow-[0_2px_0_#000]"
        >
          LEFT FLIP [A / ←]
        </button>
        <button
          type="button"
          onClick={launchPlunger}
          className="min-h-[48px] rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-black text-[11px] sm:text-xs border-2 border-black cursor-pointer shadow-[0_2px_0_#000]"
        >
          LAUNCH [SPACE]
        </button>
        <button
          type="button"
          onPointerDown={() => {
            flipperRef.current.right = true;
          }}
          onPointerUp={() => {
            flipperRef.current.right = false;
          }}
          className="min-h-[48px] rounded-xl bg-sky-500 active:bg-amber-400 text-slate-950 font-black text-[11px] sm:text-xs border-2 border-black cursor-pointer shadow-[0_2px_0_#000]"
        >
          RIGHT FLIP [D / →]
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
 * GAME 5: BAR CODAL WORD HUNT (Accessible 10x10 Grid + 4-Tier Hints)
 * ========================================================================== */
export const BarCodalWordHuntGame: React.FC<SharedEngagingGameProps> = ({
  onEarnCoins,
  boosts,
}) => {
  const [boardIndex, setBoardIndex] = useState(() =>
    Math.floor(Math.random() * 12)
  );
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [startCell, setStartCell] = useState<{ r: number; c: number } | null>(
    null
  );
  const [hintTier, setHintTier] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  const board = buildStatutoryWordHuntGrid(boardIndex);
  const nextUnfound = board.placements.find(
    (p) => !foundWords.includes(p.word)
  );

  const handleTapCell = (r: number, c: number) => {
    if (!startCell) {
      setStartCell({ r, c });
      marioAudio.playClick();
      return;
    }
    // Check if startCell -> (r,c) or (r,c) -> startCell matches any placement!
    const match = board.placements.find((p) => {
      const first = p.cells[0];
      const last = p.cells[p.cells.length - 1];
      return (
        (first.r === startCell.r &&
          first.c === startCell.c &&
          last.r === r &&
          last.c === c) ||
        (last.r === startCell.r &&
          last.c === startCell.c &&
          first.r === r &&
          first.c === c)
      );
    });

    if (match && !foundWords.includes(match.word)) {
      const updated = [...foundWords, match.word];
      setFoundWords(updated);
      setStartCell(null);
      setHintTier(0);
      setHintMessage(`Found ${match.word} (${match.articleRef}): ${match.clue}`);
      const mult = boosts?.doublePayoutActive ? 2 : 1;
      onEarnCoins((updated.length === board.placements.length ? 14 : 4) * mult);
      marioAudio.playCoin();
    } else {
      setStartCell({ r, c });
      marioAudio.playClick();
    }
  };

  const handleRequestHint = () => {
    if (!nextUnfound) return;
    const nextT = (Math.min(4, hintTier + 1) || 1) as 1 | 2 | 3 | 4;
    setHintTier(nextT);
    setHintMessage(resolveWordHuntHint(nextUnfound, nextT));
    if (boosts && boosts.radarCharges > 0 && nextT === 1) {
      boosts.onConsumeRadar?.();
    }
    marioAudio.playJump();
  };

  const isCellFound = (r: number, c: number) =>
    board.placements.some(
      (p) =>
        foundWords.includes(p.word) &&
        p.cells.some((cell) => cell.r === r && cell.c === c)
    );

  const isCellHintPinpoint = (r: number, c: number) =>
    hintTier === 4 &&
    nextUnfound &&
    nextUnfound.startRow === r &&
    nextUnfound.startCol === c;

  return (
    <div
      data-testid="game-codal-word-hunt"
      className="bg-[#f8fafc] text-slate-900 rounded-3xl border-4 border-slate-950 p-4 sm:p-6 shadow-[6px_6px_0_#000] space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-200 pb-3">
        <div>
          <h3 className="font-black text-base sm:text-lg font-display text-slate-950">
            BAR CODAL WORD HUNT · BOARD {boardIndex + 1}
          </h3>
          <p className="text-xs font-semibold text-slate-600">
            Tap the FIRST letter then the LAST letter of any hidden Philippine Labor Law term!
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleRequestHint}
            disabled={!nextUnfound}
            className="min-h-[42px] px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-black text-xs border-2 border-black inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 shrink-0" />
            <span>4-Tier Hint ({hintTier}/4)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setBoardIndex((i) => i + 1 + Math.floor(Math.random() * 5));
              setFoundWords([]);
              setStartCell(null);
              setHintTier(0);
              setHintMessage(null);
              marioAudio.playPipe();
            }}
            className="min-h-[42px] px-3.5 rounded-xl bg-slate-900 text-white font-black text-xs border-2 border-black cursor-pointer"
          >
            Replay New Grid
          </button>
        </div>
      </div>

      {hintMessage && (
        <div className="bg-amber-100 border-2 border-amber-500 text-amber-950 px-3.5 py-2.5 rounded-xl text-xs font-bold">
          {hintMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* High-Contrast 10x10 Letter Grid */}
        <div className="lg:col-span-7 grid grid-cols-10 gap-1 sm:gap-1.5 bg-slate-900 p-2 sm:p-3 rounded-2xl border-2 border-black">
          {board.grid.map((row, r) =>
            row.map((letter, c) => {
              const found = isCellFound(r, c);
              const selected = startCell?.r === r && startCell?.c === c;
              const pinpoint = isCellHintPinpoint(r, c);
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleTapCell(r, c)}
                  aria-label={`Row ${r + 1} Col ${c + 1} Letter ${letter}`}
                  className={`aspect-square min-h-[30px] sm:min-h-[42px] rounded-lg font-black text-sm sm:text-base flex items-center justify-center transition-colors cursor-pointer select-none ${
                    found
                      ? 'bg-emerald-400 text-slate-950'
                      : selected
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-white'
                      : pinpoint
                      ? 'bg-sky-400 text-slate-950 ring-2 ring-amber-300'
                      : 'bg-white hover:bg-amber-50 text-slate-950'
                  }`}
                >
                  {letter}
                </button>
              );
            })
          )}
        </div>

        {/* Statutory Clues Checklist */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-black uppercase text-slate-700">
            Found {foundWords.length} / {board.placements.length} Doctrines
          </div>
          {board.placements.map((p) => {
            const done = foundWords.includes(p.word);
            return (
              <div
                key={p.word}
                className={`p-3 rounded-xl border-2 text-xs ${
                  done
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-black">
                  <span>{done ? p.word : `${p.word[0]}${'· '.repeat(p.word.length - 1)}`}</span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {p.articleRef}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">{p.clue}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * GAME 6: REPUBLIC LABOR COMMISSIONER SIM (4-Meter Decision Balancer)
 * ========================================================================== */
export const LaborCommissionerBalanceSimGame: React.FC<
  SharedEngagingGameProps
> = ({ onEarnCoins, boosts }) => {
  const [meters, setMeters] = useState<CommissionerMeters>({
    workerWelfare: 60,
    complianceRate: 60,
    enterpriseStability: 60,
    publicTrust: 60,
  });
  const [crisisDeck, setCrisisDeck] = useState(() =>
    createFreshShuffledDeck(COMMISSIONER_CRISIS_DECK, Date.now())
  );
  const [cardIdx, setCardIdx] = useState(0);
  const [termComplete, setTermComplete] = useState(false);
  const [collapsedReason, setCollapsedReason] = useState<string | null>(null);

  const currentCard = crisisDeck[cardIdx % crisisDeck.length];

  const handleDecision = (side: 'left' | 'right') => {
    const choice = side === 'left' ? currentCard.leftChoice : currentCard.rightChoice;
    const next = applyCommissionerRuling(meters, choice.deltas);
    setMeters(next);

    if (
      next.workerWelfare <= 0 ||
      next.complianceRate <= 0 ||
      next.enterpriseStability <= 0 ||
      next.publicTrust <= 0
    ) {
      setCollapsedReason('One of the four national labor pillars collapsed to 0%!');
      setTermComplete(true);
      marioAudio.playGameOver();
      return;
    }

    if (cardIdx >= crisisDeck.length - 1) {
      const mult = boosts?.doublePayoutActive ? 2 : 1;
      onEarnCoins(18 * mult);
      setTermComplete(true);
      marioAudio.playLevelUp();
    } else {
      const mult = boosts?.doublePayoutActive ? 2 : 1;
      onEarnCoins(3 * mult);
      setCardIdx((i) => i + 1);
      marioAudio.playCoin();
    }
  };

  const resetSim = () => {
    const base = boosts?.bonusShieldActive ? 70 : 60;
    setMeters({
      workerWelfare: base,
      complianceRate: base,
      enterpriseStability: base,
      publicTrust: base,
    });
    setCrisisDeck(
      createFreshShuffledDeck(
        COMMISSIONER_CRISIS_DECK,
        Date.now() + Math.floor(Math.random() * 99999)
      )
    );
    setCardIdx(0);
    setTermComplete(false);
    setCollapsedReason(null);
    marioAudio.playPipe();
  };

  return (
    <div
      data-testid="game-commissioner-sim"
      className="bg-[#0a192f] rounded-3xl border-4 border-slate-950 p-4 sm:p-6 shadow-[6px_6px_0_#000] text-white space-y-4"
    >
      {/* 4 Live Resource Meters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: 'Worker Welfare', val: meters.workerWelfare, bar: 'bg-emerald-400' },
          { label: 'Law Compliance', val: meters.complianceRate, bar: 'bg-amber-400' },
          { label: 'Enterprise Health', val: meters.enterpriseStability, bar: 'bg-sky-400' },
          { label: 'Public Trust', val: meters.publicTrust, bar: 'bg-purple-400' },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-slate-900/90 p-3 rounded-2xl border border-slate-700 space-y-1.5"
          >
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-300">{m.label}</span>
              <span className="font-mono font-black tabular-nums">{m.val}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${m.bar} transition-all duration-200`}
                style={{ width: `${m.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {termComplete ? (
        <div className="bg-slate-900 rounded-2xl p-6 border-3 border-amber-400 text-center space-y-3">
          <h3 className="text-xl font-black text-amber-300">
            {collapsedReason
              ? 'COMMISSION TERM CUT SHORT'
              : 'DISTINGUISHED TERM COMPLETED!'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            {collapsedReason ||
              'You balanced social justice, statutory compliance, and industrial peace across all 6 national dockets!'}
          </p>
          <button
            type="button"
            data-start="true"
            onClick={resetSim}
            className="min-h-[46px] px-6 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-sm border-2 border-black cursor-pointer"
          >
            Replay New Term
          </button>
        </div>
      ) : (
        <div className="bg-white text-slate-950 rounded-2xl p-5 border-3 border-slate-950 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <span className="text-xs font-mono font-black text-red-700">
              DOCKET {cardIdx + 1} OF {COMMISSIONER_CRISIS_DECK.length} ·{' '}
              {currentCard.petitioner}
            </span>
            <span className="text-xs font-bold text-slate-600">
              {currentCard.statutoryNote}
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-lg sm:text-xl font-black font-display">
              {currentCard.docketTitle}
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {currentCard.situation}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleDecision('left')}
              className="min-h-[64px] text-left p-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-700 transition-colors cursor-pointer"
            >
              <span className="font-black text-sm text-emerald-950 block">
                Order A: {currentCard.leftChoice.label}
              </span>
              <span className="text-xs text-emerald-800 block mt-0.5">
                {currentCard.leftChoice.summary}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleDecision('right')}
              className="min-h-[64px] text-left p-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-700 transition-colors cursor-pointer"
            >
              <span className="font-black text-sm text-amber-950 block">
                Order B: {currentCard.rightChoice.label}
              </span>
              <span className="text-xs text-amber-900 block mt-0.5">
                {currentCard.rightChoice.summary}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
