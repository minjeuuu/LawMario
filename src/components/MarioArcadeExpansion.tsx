import React, { useState, useEffect, useRef } from 'react';
import { MarioAvatar } from '../types/laborLaw';
import { marioAudio } from '../utils/audio';
import {
  MarioCoinIcon,
  MarioStarIcon,
  MarioPipeIcon,
  MarioQuestionBlockIcon,
  MarioAxeIcon,
  MarioBowserIcon,
} from './MarioIcons';
import { ArcadeActiveBoosts } from './EngagingArcadeGames';
import {
  createFreshShuffledDeck,
  stepCoinMagnetPull,
  dispatchDailyMissionEvent,
} from '../utils/round11Features';
import {
  Play,
  RotateCcw,
  Heart,
  Zap,
  Magnet,
  ArrowLeft,
  ArrowRight,
  Flame,
  Eye,
  CheckCircle2,
  XCircle,
  Trophy,
  Sparkles,
} from 'lucide-react';

export interface ExpansionArcadeProps {
  equippedAvatar: MarioAvatar;
  onEarnCoins: (amount: number) => void;
  boosts?: ArcadeActiveBoosts;
  coinMagnetActive?: boolean;
  onRecordBestPlay?: (gameId: string, gameTitle: string, score: number, coinsEarned: number) => void;
}

type ArcadePhase = 'title' | 'playing' | 'gameover';

function syncDatasetState(phase: ArcadePhase) {
  if (typeof document !== 'undefined') {
    document.body.dataset.state = phase;
  }
}

function useKeyboardStart(phase: ArcadePhase, onStart: () => void) {
  const startRef = useRef(onStart);
  startRef.current = onStart;

  useEffect(() => {
    syncDatasetState(phase);
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'title' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        startRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);
}

/* ============================================================================
 * 1. WARP PIPE WHACK-A-VIOLATION (3x3 Emerald Pipe Reflex Blitz)
 * ========================================================================== */
interface PipeMoleItem {
  label: string;
  kind: 'violation' | 'ally' | 'coin';
}

const PIPE_MOLE_POOL: PipeMoleItem[] = [
  { label: 'Labor-Only Endo', kind: 'violation' },
  { label: 'Sub-Minimum Pay', kind: 'violation' },
  { label: 'Unpaid 125% OT', kind: 'violation' },
  { label: 'Withheld 13th Mo.', kind: 'violation' },
  { label: 'Illegal Cash Bond', kind: 'violation' },
  { label: 'Skipped 10% NSD', kind: 'violation' },
  { label: 'Yellow-Dog Pact', kind: 'violation' },
  { label: 'Summary Firing', kind: 'violation' },
  { label: 'Denied 5d SIL', kind: 'violation' },
  { label: 'Child Hazard Job', kind: 'violation' },
  { label: 'Union Toad Ally', kind: 'ally' },
  { label: 'DOLE Officer Toad', kind: 'ally' },
  { label: 'Compliant Employer', kind: 'ally' },
  { label: 'Bonus Gold Coin', kind: 'coin' },
  { label: 'Treasury Star Coin', kind: 'coin' },
];

export const WarpPipeWhackAViolationGame: React.FC<ExpansionArcadeProps> = ({
  onEarnCoins,
  boosts,
  coinMagnetActive = false,
  onRecordBestPlay,
}) => {
  const [phase, setPhase] = useState<ArcadePhase>(() =>
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1'
      ? 'playing'
      : 'title'
  );
  const [slots, setSlots] = useState<(PipeMoleItem | null)[]>(Array(9).fill(null));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hp, setHp] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(28);
  const [statusLog, setStatusLog] = useState('Whack labor violations popping out of Warp Pipes!');
  const deckRef = useRef<PipeMoleItem[]>(createFreshShuffledDeck(PIPE_MOLE_POOL, Date.now()));
  const cursorRef = useRef(0);

  const startGame = () => {
    deckRef.current = createFreshShuffledDeck(PIPE_MOLE_POOL, Date.now() + Math.random() * 9999);
    cursorRef.current = 0;
    setSlots(Array(9).fill(null));
    setScore(0);
    setCombo(0);
    setHp(boosts?.bonusShieldActive ? 4 : 3);
    setSecondsLeft(28);
    setStatusLog('Shift active! Whack red violations — spare green Allies!');
    setPhase('playing');
    marioAudio.playPipe();
    dispatchDailyMissionEvent('arcade_play', 1);
  };

  useKeyboardStart(phase, startGame);

  useEffect(() => {
    if (phase !== 'playing') return;
    const spawner = window.setInterval(() => {
      setSlots(() => {
        const next: (PipeMoleItem | null)[] = Array(9).fill(null);
        const holeIndices = createFreshShuffledDeck([0, 1, 2, 3, 4, 5, 6, 7, 8], Date.now());
        const count = 2 + (Math.random() > 0.45 ? 1 : 0);
        for (let i = 0; i < count; i++) {
          if (cursorRef.current >= deckRef.current.length) {
            deckRef.current = createFreshShuffledDeck(PIPE_MOLE_POOL, Date.now() + i);
            cursorRef.current = 0;
          }
          const item = deckRef.current[cursorRef.current++];
          if (item.kind === 'coin' && coinMagnetActive) {
            setScore((s) => s + 90);
            onEarnCoins(2);
            setStatusLog('Coin Magnet auto-pulled a Pipe Bonus Coin (+90 pts)!');
          } else {
            next[holeIndices[i]] = item;
          }
        }
        return next;
      });
    }, 950);

    const clock = window.setInterval(() => {
      setSecondsLeft((t) => {
        if (t <= 1) {
          window.clearInterval(spawner);
          window.clearInterval(clock);
          setPhase('gameover');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(spawner);
      window.clearInterval(clock);
    };
  }, [phase, coinMagnetActive, onEarnCoins]);

  useEffect(() => {
    if (phase === 'gameover') {
      const passed = score >= 600 && hp > 0;
      const mult = boosts?.doublePayoutActive ? 2 : 1;
      const earned = passed ? Math.max(6, Math.min(24, Math.round(score / 95))) * mult : 0;
      if (earned > 0) {
        onEarnCoins(earned);
      }
      onRecordBestPlay?.('pipe_whack_violation', 'Warp Pipe Whack-a-Violation', score, earned);
      if (passed) marioAudio.playLevelUp();
      else marioAudio.playGameOver();
    }
  }, [phase]);

  const handleWhack = (idx: number) => {
    if (phase !== 'playing') return;
    const target = slots[idx];
    if (!target) return;
    setSlots((prev) => prev.map((it, i) => (i === idx ? null : it)));

    if (target.kind === 'violation') {
      const nextCombo = combo + 1;
      const pts = 110 + nextCombo * 20;
      setCombo(nextCombo);
      setScore((s) => s + pts);
      setStatusLog(`Stomped "${target.label}" (+${pts} pts)!`);
      marioAudio.playStomp();
    } else if (target.kind === 'coin') {
      setScore((s) => s + 100);
      onEarnCoins(2);
      setStatusLog(`Collected ${target.label} (+2c)!`);
      marioAudio.playCoin();
    } else {
      setCombo(0);
      setStatusLog(`Oops! "${target.label}" is compliant — lost 1 Heart!`);
      marioAudio.playTryAgain();
      setHp((h) => {
        const next = h - 1;
        if (next <= 0) setPhase('gameover');
        return next;
      });
    }
  };

  return (
    <div
      data-testid="game-pipe-whack-violation"
      className="bg-slate-950 rounded-3xl border-4 border-black p-4 sm:p-6 shadow-[6px_6px_0_#000] text-white space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 px-4 py-3 rounded-2xl border-2 border-emerald-500/60">
        <div className="flex items-center gap-2.5">
          <MarioPipeIcon className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-black text-sm sm:text-base font-display text-emerald-300">
              WARP PIPE WHACK-A-VIOLATION
            </h3>
            <p className="text-[11px] text-slate-300">{statusLog}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs font-black tabular-nums">
          {coinMagnetActive && (
            <span className="inline-flex items-center gap-1 text-amber-300">
              <Magnet className="w-3.5 h-3.5" /> MAGNET ON
            </span>
          )}
          <span className="text-rose-400">HP {hp}</span>
          <span className="text-amber-300">COMBO x{combo}</span>
          <span className="text-emerald-300">{secondsLeft}s · {score} PTS</span>
        </div>
      </div>

      {phase === 'title' ? (
        <div className="bg-emerald-950/50 border-2 border-emerald-500/60 rounded-2xl p-6 text-center space-y-4">
          <svg viewBox="0 0 380 64" className="w-64 sm:w-80 mx-auto" aria-hidden="true">
            <rect x="6" y="6" width="368" height="52" rx="14" fill="#10b981" stroke="#0f172a" strokeWidth="4" />
            <text x="190" y="39" textAnchor="middle" fill="#0f172a" fontSize="20" fontWeight="900" fontFamily="sans-serif">
              PIPE WHACK-A-VIOLATION
            </text>
          </svg>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto font-semibold">
            Stomp crimson Labor Code violations popping out of 9 Warp Pipes, collect Gold Coins, and avoid hitting friendly Union Toads!
          </p>
          <button
            type="button"
            data-start="true"
            onClick={startGame}
            className="min-h-[48px] px-7 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Start Pipe Patrol</span>
          </button>
          <p className="text-[11px] text-slate-400">Tap / Click Active Pipes · Enter or Space to Start</p>
        </div>
      ) : phase === 'gameover' ? (
        <div className="bg-slate-900 border-3 border-amber-400 rounded-2xl p-6 text-center space-y-4">
          <h4 className="text-xl font-black text-amber-300 font-display">
            {score >= 600 && hp > 0
              ? `PATROL CLEARED · ${score} PTS!`
              : `PATROL FAILED · ${score}/600 PTS`}
          </h4>
          <p className="text-xs sm:text-sm text-slate-300">
            {score >= 600 && hp > 0
              ? `Course Clear! Peak Combo x${combo} · Coins awarded!`
              : 'Reach 600+ PTS with at least 1 HP remaining to pass and earn coins!'}
          </p>
          <button
            type="button"
            data-start="true"
            onClick={startGame}
            className="min-h-[46px] px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm border-2 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay Fresh Wave</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto">
          {slots.map((item, idx) => {
            const tone =
              item?.kind === 'violation'
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-amber-300 -translate-y-1'
                : item?.kind === 'coin'
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-white -translate-y-1'
                : item?.kind === 'ally'
                ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 border-emerald-950 -translate-y-1'
                : 'bg-slate-900 text-slate-500 border-emerald-800';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleWhack(idx)}
                aria-label={item ? `Pipe ${idx + 1}: ${item.label}` : `Empty Pipe ${idx + 1}`}
                className={`min-h-[96px] sm:min-h-[110px] rounded-2xl border-3 p-2.5 flex flex-col items-center justify-between transition-all cursor-pointer select-none ${tone}`}
              >
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {item
                    ? item.kind === 'violation'
                      ? 'WHACK!'
                      : item.kind === 'coin'
                      ? 'BONUS COIN'
                      : 'SPARE ALLY'
                    : `PIPE #${idx + 1}`}
                </span>
                <span className="text-xs sm:text-sm font-black leading-tight text-center">
                  {item ? item.label : 'Waiting...'}
                </span>
                <MarioPipeIcon className="w-6 h-6 shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 2. YOSHI'S EGG-CATCH STATUTORY DROP (Canvas2D Basket Catcher + Coin Magnet)
 * ========================================================================== */
const YOSHI_EGG_LABELS = [
  '105d Mat.',
  '200% Hol.',
  '22.5d Ret.',
  '125% OT',
  '10% NSD',
  '5d SIL',
  '13th Mo.',
  '7d Solo',
  '10d VAWC',
];

export const YoshiEggCatchDropGame: React.FC<ExpansionArcadeProps> = ({
  onEarnCoins,
  boosts,
  coinMagnetActive = false,
  onRecordBestPlay,
}) => {
  const [phase, setPhase] = useState<ArcadePhase>(() =>
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1'
      ? 'playing'
      : 'title'
  );
  const [hudScore, setHudScore] = useState(0);
  const [hudHp, setHudHp] = useState(3);
  const [hudCaught, setHudCaught] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const magnetRef = useRef(coinMagnetActive);
  magnetRef.current = coinMagnetActive;

  const moveRef = useRef({ left: false, right: false });
  const simRef = useRef({
    px: 260,
    hp: 3,
    score: 0,
    caught: 0,
    spawnTimer: 0.4,
    labels: createFreshShuffledDeck(YOSHI_EGG_LABELS, Date.now()),
    cursor: 0,
    drops: [] as {
      x: number;
      y: number;
      vy: number;
      kind: 'egg' | 'coin' | 'spiny';
      label: string;
    }[],
  });

  const startCatch = () => {
    simRef.current = {
      px: 260,
      hp: boosts?.bonusShieldActive ? 4 : 3,
      score: 0,
      caught: 0,
      spawnTimer: 0.35,
      labels: createFreshShuffledDeck(YOSHI_EGG_LABELS, Date.now() + 77),
      cursor: 0,
      drops: [],
    };
    setHudHp(simRef.current.hp);
    setHudScore(0);
    setHudCaught(0);
    setPhase('playing');
    marioAudio.playPowerUp();
    dispatchDailyMissionEvent('arcade_play', 1);
  };

  useKeyboardStart(phase, startCatch);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRef.current.right = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRef.current.right = false;
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
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const cvs = canvasRef.current;
      const ctx = cvs?.getContext('2d');
      const s = simRef.current;

      if (cvs && ctx) {
        const W = cvs.width;
        const H = cvs.height;

        if (phaseRef.current === 'playing') {
          const dir = (moveRef.current.right ? 1 : 0) - (moveRef.current.left ? 1 : 0);
          s.px = Math.max(42, Math.min(W - 42, s.px + dir * 320 * dt));

          s.spawnTimer -= dt;
          if (s.spawnTimer <= 0) {
            s.spawnTimer = Math.max(0.66, 0.98 - s.caught * 0.014);
            const roll = Math.random();
            const kind: 'egg' | 'coin' | 'spiny' =
              roll < 0.3 ? 'spiny' : roll < 0.5 ? 'coin' : 'egg';
            if (s.cursor >= s.labels.length) {
              s.labels = createFreshShuffledDeck(YOSHI_EGG_LABELS, now);
              s.cursor = 0;
            }
            const lbl =
              kind === 'spiny' ? 'WAGE CUT' : kind === 'coin' ? '+COIN' : s.labels[s.cursor++];
            s.drops.push({
              x: 45 + Math.random() * (W - 90),
              y: -18,
              vy: 82 + Math.random() * 38 + Math.min(28, s.caught * 2), // Calm 82..148 px/s drop speed
              kind,
              label: lbl,
            });
          }

          for (let i = s.drops.length - 1; i >= 0; i--) {
            const d = s.drops[i];
            d.y += d.vy * dt;

            if (magnetRef.current && (d.kind === 'coin' || d.kind === 'egg')) {
              const pulled = stepCoinMagnetPull({
                coinX: d.x,
                coinY: d.y,
                playerX: s.px,
                playerY: H - 36,
                radius: 165,
                pullSpeed: 260,
                dt,
              });
              d.x = pulled.x;
              d.y = pulled.y;
            }

            if (Math.abs(d.x - s.px) < 42 && Math.abs(d.y - (H - 36)) < 28) {
              s.drops.splice(i, 1);
              if (d.kind === 'spiny') {
                s.hp -= 1;
                setHudHp(s.hp);
                marioAudio.playStomp();
                if (s.hp <= 0) {
                  setPhase('gameover');
                }
              } else {
                s.caught += 1;
                s.score += d.kind === 'coin' ? 120 : 95;
                setHudCaught(s.caught);
                setHudScore(s.score);
                marioAudio.playCoin();
                if (s.caught >= 15) {
                  setPhase('gameover');
                }
              }
              continue;
            }
            if (d.y > H + 26) {
              s.drops.splice(i, 1);
            }
          }
        }

        ctx.fillStyle = '#052e16';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#14532d';
        ctx.fillRect(0, H - 22, W, 22);

        if (magnetRef.current && phaseRef.current === 'playing') {
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(s.px, H - 36, 150, 0, Math.PI * 2);
          ctx.stroke();
        }

        for (const d of s.drops) {
          ctx.fillStyle =
            d.kind === 'spiny' ? '#ef4444' : d.kind === 'coin' ? '#fbbf24' : '#86efac';
          ctx.beginPath();
          ctx.arc(d.x, d.y, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(d.label, d.x, d.y + 3);
        }

        // Yoshi Basket
        ctx.fillStyle = '#22c55e';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(s.px - 36, H - 48, 72, 26, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('YOSHI', s.px, H - 31);
      }

      raf = window.requestAnimationFrame(frame);
    };

    raf = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (phase === 'gameover') {
      const passed = hudCaught >= 15 && hudHp > 0;
      const mult = boosts?.doublePayoutActive ? 2 : 1;
      const earned = passed ? Math.max(8, Math.min(24, Math.round(hudScore / 90))) * mult : 0;
      if (earned > 0) {
        onEarnCoins(earned);
      }
      onRecordBestPlay?.('yoshi_egg_catch', "Yoshi's Egg-Catch Statutory Drop", hudScore, earned);
      if (passed) marioAudio.playLevelUp();
      else marioAudio.playGameOver();
    }
  }, [phase]);

  return (
    <div
      data-testid="game-yoshi-egg-catch"
      className="bg-slate-950 rounded-3xl border-4 border-black p-4 shadow-[6px_6px_0_#000] text-white space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 px-4 py-2.5 rounded-2xl border border-emerald-600/60">
        <div>
          <h3 className="font-black text-sm sm:text-base font-display text-emerald-300">
            YOSHI&apos;S EGG-CATCH STATUTORY DROP
          </h3>
          <p className="text-[11px] text-slate-300">
            Catch 15 Benefit Eggs &amp; Coins while dodging red Wage-Cut Spinies!
          </p>
        </div>
        <div className="font-mono text-xs font-black tabular-nums text-amber-300">
          HP {hudHp} · EGGS {hudCaught}/15 · {hudScore} PTS
        </div>
      </div>

      <div className="relative max-w-xl mx-auto">
        <canvas
          ref={canvasRef}
          width={520}
          height={310}
          onPointerMove={(e) => {
            if (phase !== 'playing') return;
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 520;
            simRef.current.px = Math.max(42, Math.min(478, relX));
          }}
          className="w-full h-[250px] sm:h-[300px] rounded-2xl border-2 border-emerald-800 block touch-none"
        />
        {phase !== 'playing' && (
          <div className="absolute inset-0 bg-slate-950/80 rounded-2xl flex flex-col items-center justify-center p-5 text-center space-y-3">
            <h4 className="text-xl font-black text-emerald-300 font-display">
              {phase === 'gameover'
                ? hudCaught >= 15
                  ? `ISLAND CLEAR! ${hudScore} PTS`
                  : `BASKET OVERRUN · ${hudScore} PTS`
                : 'YOSHI STATUTORY EGG HARVEST'}
            </h4>
            <p className="text-xs text-slate-300 max-w-sm">
              Slide with Arrows / A-D or drag directly across the stage. Coin Magnet pulls nearby Eggs &amp; Gold Coins straight into Yoshi&apos;s basket!
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startCatch}
              className="min-h-[46px] px-6 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm border-2 border-black shadow-[0_3px_0_#000] cursor-pointer"
            >
              {phase === 'gameover' ? 'Replay Harvest' : 'Start Egg Catch'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
        <button
          type="button"
          onPointerDown={() => (moveRef.current.left = true)}
          onPointerUp={() => (moveRef.current.left = false)}
          onPointerLeave={() => (moveRef.current.left = false)}
          className="min-h-[46px] rounded-xl bg-slate-800 active:bg-emerald-400 active:text-slate-950 font-black text-xs border-2 border-slate-700 inline-flex items-center justify-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> SLIDE LEFT
        </button>
        <button
          type="button"
          onPointerDown={() => (moveRef.current.right = true)}
          onPointerUp={() => (moveRef.current.right = false)}
          onPointerLeave={() => (moveRef.current.right = false)}
          className="min-h-[46px] rounded-xl bg-slate-800 active:bg-emerald-400 active:text-slate-950 font-black text-xs border-2 border-slate-700 inline-flex items-center justify-center gap-1 cursor-pointer"
        >
          SLIDE RIGHT <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. LUIGI'S GHOST-CLAUSE FLASHLIGHT SWEEP (Haunted Contract UV Sweeper)
 * ========================================================================== */
interface ContractClauseTile {
  title: string;
  article: string;
  isGhostTrap: boolean;
}

const LUIGI_CLAUSE_POOL: ContractClauseTile[] = [
  { title: 'Yellow-Dog Anti-Union Ban', article: 'Art. 259 Void', isGhostTrap: true },
  { title: '12-Month Perpetual Probation', article: 'Art. 296 Void', isGhostTrap: true },
  { title: 'Blanket Waiver of OT Pay', article: 'Art. 87 Void', isGhostTrap: true },
  { title: 'Mandatory Store Scrip Coupons', article: 'Art. 102 Void', isGhostTrap: true },
  { title: 'Automatic Marriage Dismissal', article: 'Art. 134 Void', isGhostTrap: true },
  { title: 'Forced 20% Wage Kickback', article: 'Art. 116 Void', isGhostTrap: true },
  { title: 'Pre-Signed Blank Quitclaim', article: 'Public Policy Void', isGhostTrap: true },
  { title: '8-Hour Normal Workday', article: 'Art. 83 Valid', isGhostTrap: false },
  { title: '24-Hour Weekly Rest Day', article: 'Art. 91 Valid', isGhostTrap: false },
  { title: '105-Day Paid Maternity', article: 'R.A. 11210 Valid', isGhostTrap: false },
  { title: '5-Day Service Incentive Leave', article: 'Art. 95 Valid', isGhostTrap: false },
  { title: '13th Month Pay by Dec 24', article: 'P.D. 851 Valid', isGhostTrap: false },
];

export const LuigiGhostClauseFlashlightGame: React.FC<ExpansionArcadeProps> = ({
  onEarnCoins,
  boosts,
  onRecordBestPlay,
}) => {
  const [phase, setPhase] = useState<ArcadePhase>('title');
  const [tiles, setTiles] = useState<ContractClauseTile[]>([]);
  const [vacuumed, setVacuumed] = useState<number[]>([]);
  const [scannedIdx, setScannedIdx] = useState<number | null>(null);
  const [battery, setBattery] = useState(12);
  const [score, setScore] = useState(0);

  const startSweep = () => {
    const traps = createFreshShuffledDeck(
      LUIGI_CLAUSE_POOL.filter((c) => c.isGhostTrap),
      Date.now()
    ).slice(0, 4);
    const valids = createFreshShuffledDeck(
      LUIGI_CLAUSE_POOL.filter((c) => !c.isGhostTrap),
      Date.now() + 31
    ).slice(0, 5);
    setTiles(createFreshShuffledDeck([...traps, ...valids], Date.now() + 99));
    setVacuumed([]);
    setScannedIdx(null);
    setBattery(boosts?.bonusShieldActive ? 15 : 12);
    setScore(0);
    setPhase('playing');
    marioAudio.playPipe();
    dispatchDailyMissionEvent('arcade_play', 1);
  };

  useKeyboardStart(phase, startSweep);

  const totalGhosts = tiles.filter((t) => t.isGhostTrap).length || 4;

  const handleInspectOrVacuum = (idx: number) => {
    if (phase !== 'playing' || vacuumed.includes(idx)) return;
    if (scannedIdx !== idx) {
      setScannedIdx(idx);
      setBattery((b) => {
        const nb = b - 1;
        if (nb <= 0) setPhase('gameover');
        return nb;
      });
      marioAudio.playClick();
      return;
    }
    const target = tiles[idx];
    if (target.isGhostTrap) {
      const nextVac = [...vacuumed, idx];
      setVacuumed(nextVac);
      const nextScore = score + 225;
      setScore(nextScore);
      marioAudio.playCoin();
      if (nextVac.length >= totalGhosts) {
        const mult = boosts?.doublePayoutActive ? 2 : 1;
        onEarnCoins(16 * mult);
        onRecordBestPlay?.(
          'luigi_ghost_clause',
          "Luigi's Ghost-Clause Flashlight Sweep",
          nextScore + battery * 30,
          16 * mult
        );
        marioAudio.playLevelUp();
        setPhase('gameover');
      }
    } else {
      setBattery((b) => {
        const nb = Math.max(0, b - 2);
        if (nb <= 0) setPhase('gameover');
        return nb;
      });
      marioAudio.playTryAgain();
    }
  };

  return (
    <div
      data-testid="game-luigi-ghost-clause"
      className="bg-[#090d16] rounded-3xl border-4 border-emerald-500/80 p-4 sm:p-6 shadow-[6px_6px_0_#000] text-white space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 px-4 py-3 rounded-2xl border border-emerald-500/40">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="font-black text-sm sm:text-base font-display text-emerald-300">
              LUIGI&apos;S GHOST-CLAUSE FLASHLIGHT SWEEP
            </h3>
            <p className="text-[11px] text-slate-300">
              Tap once to shine UV Beam, tap again to Vacuum void Ghost Clauses!
            </p>
          </div>
        </div>
        <div className="font-mono text-xs font-black tabular-nums text-amber-300">
          BATTERY {battery} · GHOSTS {vacuumed.length}/{totalGhosts} · {score} PTS
        </div>
      </div>

      {phase === 'title' ? (
        <div className="bg-slate-900/90 rounded-2xl p-6 text-center space-y-4 border border-emerald-500/40">
          <h4 className="text-xl font-black font-display text-emerald-300">
            HAUNTED EMPLOYMENT CONTRACT AUDIT
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Four illegal Ghost Clauses are hiding in a pitch-black 9-clause employment contract. Shine your Poltergust UV Beam to reveal each clause, then vacuum ONLY the unlawful traps!
          </p>
          <button
            type="button"
            data-start="true"
            onClick={startSweep}
            className="min-h-[46px] px-7 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm border-2 border-black shadow-[0_3px_0_#000] cursor-pointer"
          >
            Switch On Poltergust UV
          </button>
        </div>
      ) : phase === 'gameover' ? (
        <div className="bg-slate-900 rounded-2xl p-6 text-center space-y-4 border-2 border-amber-400">
          <h4 className="text-xl font-black text-amber-300 font-display">
            {vacuumed.length >= totalGhosts ? 'MANSION CONTRACT PURIFIED!' : 'UV BATTERY DEPLETED'}
          </h4>
          <p className="text-xs sm:text-sm text-slate-300">
            Captured {vacuumed.length}/{totalGhosts} Ghost Clauses · Score {score}
          </p>
          <button
            type="button"
            data-start="true"
            onClick={startSweep}
            className="min-h-[46px] px-6 py-2 rounded-xl bg-emerald-400 text-slate-950 font-black text-sm border-2 border-black cursor-pointer"
          >
            Replay New Haunted Contract
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tiles.map((t, idx) => {
            const captured = vacuumed.includes(idx);
            const lit = scannedIdx === idx || captured;
            return (
              <button
                key={`${t.title}-${idx}`}
                type="button"
                onClick={() => handleInspectOrVacuum(idx)}
                className={`min-h-[96px] p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  captured
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                    : lit
                    ? 'bg-amber-300 text-slate-950 border-white shadow-[0_0_24px_rgba(252,211,77,0.45)]'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {captured ? (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-400 block">
                      VACUUMED GHOST
                    </span>
                    <span className="text-xs font-black block">{t.title}</span>
                  </div>
                ) : lit ? (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase block">
                      UV LIT · TAP AGAIN TO VACUUM IF VOID
                    </span>
                    <span className="text-xs sm:text-sm font-black block">{t.title}</span>
                    <span className="text-[11px] font-mono font-bold block">{t.article}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-1">
                    <Eye className="w-5 h-5 text-emerald-500/60" />
                    <span className="text-xs font-bold">Dark Clause #{idx + 1}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 4. MARIO KART WAGE-ORDER DRIFT (3-Lane Highway Dash + Coin Magnet)
 * ========================================================================== */
const KART_BOOST_LABELS = ['200% HOL', '125% OT', 'NCR WAGE', '5d SIL', '13TH MO', '10% NSD'];

export const MarioKartWageOrderDriftGame: React.FC<ExpansionArcadeProps> = ({
  onEarnCoins,
  boosts,
  coinMagnetActive = false,
  onRecordBestPlay,
}) => {
  const [phase, setPhase] = useState<ArcadePhase>('title');
  const [lane, setLane] = useState<0 | 1 | 2>(1);
  const [distance, setDistance] = useState(0);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(3);
  const [rows, setRows] = useState<
    { id: number; step: number; lane: 0 | 1 | 2; kind: 'boost' | 'hazard' | 'coin'; label: string }[]
  >([]);
  const laneRef = useRef<0 | 1 | 2>(1);
  laneRef.current = lane;

  const startRace = () => {
    setLane(1);
    setDistance(0);
    setScore(0);
    setHp(boosts?.bonusShieldActive ? 4 : 3);
    setRows([]);
    setPhase('playing');
    marioAudio.playPowerUp();
    dispatchDailyMissionEvent('arcade_play', 1);
  };

  useKeyboardStart(phase, startRace);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setLane((l) => Math.max(0, l - 1) as 0 | 1 | 2);
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setLane((l) => Math.min(2, l + 1) as 0 | 1 | 2);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    let idSeq = 1;
    const labels = createFreshShuffledDeck(KART_BOOST_LABELS, Date.now());
    const tick = window.setInterval(() => {
      setDistance((d) => {
        const nd = d + 50;
        if (nd >= 1000) {
          setPhase('gameover');
        }
        return nd;
      });
      setRows((prev) => {
        const advanced = prev
          .map((r) => ({ ...r, step: r.step + 1 }))
          .filter((r) => {
            if (r.step === 4) {
              const hit =
                r.lane === laneRef.current || (coinMagnetActive && r.kind === 'coin');
              if (hit) {
                if (r.kind === 'hazard') {
                  marioAudio.playStomp();
                  setHp((h) => {
                    const nh = h - 1;
                    if (nh <= 0) setPhase('gameover');
                    return nh;
                  });
                } else {
                  marioAudio.playCoin();
                  setScore((s) => s + (r.kind === 'coin' ? 140 : 110));
                }
                return false;
              }
            }
            return r.step <= 4;
          });

        const randLane = (Math.floor(Math.random() * 3) % 3) as 0 | 1 | 2;
        const roll = Math.random();
        const kind: 'boost' | 'hazard' | 'coin' =
          roll < 0.38 ? 'hazard' : roll < 0.65 ? 'boost' : 'coin';
        advanced.push({
          id: idSeq++,
          step: 0,
          lane: randLane,
          kind,
          label:
            kind === 'hazard'
              ? 'ENDO TRAP'
              : kind === 'coin'
              ? 'STAR COIN'
              : labels[idSeq % labels.length],
        });
        return advanced;
      });
    }, 480);

    return () => window.clearInterval(tick);
  }, [phase, coinMagnetActive]);

  useEffect(() => {
    if (phase === 'gameover') {
      const earned = Math.max(5, Math.min(25, Math.round((score + distance * 0.4) / 70)));
      const mult = boosts?.doublePayoutActive ? 2 : 1;
      onEarnCoins(earned * mult);
      onRecordBestPlay?.('kart_wage_drift', 'Mario Kart Wage-Order Drift', score + distance, earned * mult);
      if (distance >= 1000) marioAudio.playLevelUp();
      else marioAudio.playGameOver();
    }
  }, [phase]);

  return (
    <div
      data-testid="game-kart-wage-drift"
      className="bg-slate-950 rounded-3xl border-4 border-black p-4 sm:p-6 shadow-[6px_6px_0_#000] text-white space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 px-4 py-2.5 rounded-2xl border border-sky-500/50">
        <div>
          <h3 className="font-black text-sm sm:text-base font-display text-sky-300">
            MARIO KART WAGE-ORDER DRIFT
          </h3>
          <p className="text-[11px] text-slate-300">
            Drift across 3 Rainbow Lanes to hit 1,000m — grab Wage Boosts &amp; dodge Endo Traps!
          </p>
        </div>
        <div className="font-mono text-xs font-black tabular-nums text-amber-300">
          HP {hp} · {Math.min(1000, distance)}/1000m · {score} PTS
        </div>
      </div>

      {phase !== 'playing' ? (
        <div className="bg-slate-900 rounded-2xl p-6 text-center space-y-4 border-2 border-sky-400/60">
          <h4 className="text-xl font-black text-amber-300 font-display">
            {phase === 'gameover'
              ? distance >= 1000
                ? `CHECKERED FLAG! ${score + distance} PTS`
                : `SPIN-OUT AT ${distance}m`
              : 'RAINBOW WAGE HIGHWAY GRAND PRIX'}
          </h4>
          <button
            type="button"
            data-start="true"
            onClick={startRace}
            className="min-h-[46px] px-7 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm border-2 border-black cursor-pointer"
          >
            {phase === 'gameover' ? 'Replay Grand Prix' : 'Start Engines'}
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-w-lg mx-auto">
          <div className="grid grid-cols-3 gap-2 bg-slate-900 p-3 rounded-2xl border-2 border-slate-700">
            {[0, 1, 2].map((col) => (
              <div
                key={col}
                onClick={() => setLane(col as 0 | 1 | 2)}
                className="space-y-1.5 bg-slate-950/90 p-2 rounded-xl border border-slate-800 cursor-pointer"
              >
                {[0, 1, 2, 3, 4].map((st) => {
                  const item = rows.find((r) => r.lane === col && r.step === st);
                  const isPlayerHere = st === 4 && lane === col;
                  return (
                    <div
                      key={st}
                      className={`h-10 rounded-lg flex items-center justify-center text-[10px] font-black text-center px-1 ${
                        isPlayerHere
                          ? 'bg-sky-400 text-slate-950 border-2 border-white'
                          : item?.kind === 'hazard'
                          ? 'bg-rose-600 text-white'
                          : item?.kind === 'boost'
                          ? 'bg-emerald-400 text-slate-950'
                          : item?.kind === 'coin'
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-900/50 text-slate-700'
                      }`}
                    >
                      {isPlayerHere ? 'KART HERO' : item ? item.label : '·'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['LEFT LANE', 'CENTER LANE', 'RIGHT LANE'] as const).map((lbl, idx) => (
              <button
                key={lbl}
                type="button"
                onClick={() => setLane(idx as 0 | 1 | 2)}
                className={`min-h-[44px] rounded-xl font-black text-xs border-2 cursor-pointer ${
                  lane === idx
                    ? 'bg-amber-400 text-slate-950 border-black'
                    : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 5. TOAD'S CONVEYOR WAGE SORTER (3-Chute Factory Belt Routing)
 * ========================================================================== */
interface ConveyorCrate {
  label: string;
  chute: 'pay' | 'leave' | 'illegal';
}

const CONVEYOR_CRATE_POOL: ConveyorCrate[] = [
  { label: '13th Month Pay (1/12 Basic)', chute: 'pay' },
  { label: '+10% Night Shift Differential', chute: 'pay' },
  { label: '200% Regular Holiday Pay', chute: 'pay' },
  { label: '+25% Overtime Premium', chute: 'pay' },
  { label: '+30% Rest Day Premium', chute: 'pay' },
  { label: '22.5-Day Retirement Pay', chute: 'pay' },
  { label: '105-Day Maternity Leave', chute: 'leave' },
  { label: '7-Day Paternity Leave', chute: 'leave' },
  { label: '10-Day VAWC Safe Leave', chute: 'leave' },
  { label: '5-Day Service Incentive Leave', chute: 'leave' },
  { label: '7-Day Solo Parent Leave', chute: 'leave' },
  { label: '60-Day Gynecological Leave', chute: 'leave' },
  { label: 'Labor-Only Contracting', chute: 'illegal' },
  { label: 'Yellow-Dog Union Ban', chute: 'illegal' },
  { label: 'Wages Paid in Promissory Chits', chute: 'illegal' },
  { label: 'Withholding Kickback Art. 116', chute: 'illegal' },
  { label: 'Child Below 15 Hazardous Mine', chute: 'illegal' },
  { label: 'Dismissal Without Two Notices', chute: 'illegal' },
];

export const ToadConveyorWageSorterGame: React.FC<ExpansionArcadeProps> = ({
  onEarnCoins,
  boosts,
  onRecordBestPlay,
}) => {
  const [phase, setPhase] = useState<ArcadePhase>('title');
  const [deck, setDeck] = useState<ConveyorCrate[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [beltProgress, setBeltProgress] = useState(0);

  const startBelt = () => {
    setDeck(createFreshShuffledDeck(CONVEYOR_CRATE_POOL, Date.now()).slice(0, 10));
    setIdx(0);
    setScore(0);
    setLives(boosts?.bonusShieldActive ? 4 : 3);
    setBeltProgress(0);
    setPhase('playing');
    marioAudio.playPipe();
    dispatchDailyMissionEvent('arcade_play', 1);
  };

  useKeyboardStart(phase, startBelt);

  useEffect(() => {
    if (phase !== 'playing') return;
    const t = window.setInterval(() => {
      setBeltProgress((p) => {
        if (p >= 96) {
          marioAudio.playTryAgain();
          setLives((l) => {
            const nl = l - 1;
            if (nl <= 0) setPhase('gameover');
            return nl;
          });
          setIdx((i) => {
            if (i + 1 >= deck.length) {
              setPhase('gameover');
              return i;
            }
            return i + 1;
          });
          return 0;
        }
        return p + 4;
      });
    }, 220);
    return () => window.clearInterval(t);
  }, [phase, deck.length]);

  const handleRoute = (chosen: 'pay' | 'leave' | 'illegal') => {
    if (phase !== 'playing' || !deck[idx]) return;
    const right = deck[idx].chute === chosen;
    if (right) {
      setScore((s) => s + 130);
      marioAudio.playCoin();
    } else {
      marioAudio.playStomp();
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) setPhase('gameover');
        return nl;
      });
    }
    if (idx + 1 >= deck.length) {
      setPhase('gameover');
    } else {
      setIdx((i) => i + 1);
      setBeltProgress(0);
    }
  };

  useEffect(() => {
    if (phase === 'gameover') {
      const earned = Math.max(4, Math.min(22, Math.round(score / 80)));
      const mult = boosts?.doublePayoutActive ? 2 : 1;
      onEarnCoins(earned * mult);
      onRecordBestPlay?.('toad_conveyor_sorter', "Toad's Conveyor Wage Sorter", score, earned * mult);
      if (score >= 700) marioAudio.playLevelUp();
    }
  }, [phase]);

  const crate = deck[idx];

  return (
    <div
      data-testid="game-toad-conveyor-sorter"
      className="bg-slate-900 rounded-3xl border-4 border-black p-4 sm:p-6 shadow-[6px_6px_0_#000] text-white space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 px-4 py-3 rounded-2xl border border-amber-400/50">
        <div>
          <h3 className="font-black text-sm sm:text-base font-display text-amber-300">
            TOAD&apos;S CONVEYOR WAGE SORTER
          </h3>
          <p className="text-[11px] text-slate-300">
            Route each rolling crate into the right Warp Chute before it drops off the belt!
          </p>
        </div>
        <div className="font-mono text-xs font-black tabular-nums text-emerald-300">
          SEALS {lives} · CRATE {Math.min(deck.length, idx + 1)}/{deck.length || 10} · {score} PTS
        </div>
      </div>

      {phase !== 'playing' ? (
        <div className="bg-slate-950 rounded-2xl p-6 text-center space-y-4 border-2 border-amber-400">
          <h4 className="text-xl font-black text-amber-300 font-display">
            {phase === 'gameover' ? `SHIFT COMPLETE · ${score} PTS` : 'TOAD FACTORY LOGISTICS SHIFT'}
          </h4>
          <button
            type="button"
            data-start="true"
            onClick={startBelt}
            className="min-h-[46px] px-7 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm border-2 border-black cursor-pointer"
          >
            {phase === 'gameover' ? 'Replay Fresh 10-Crate Shift' : 'Start Conveyor Belt'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative h-24 rounded-2xl bg-slate-950 border-3 border-slate-700 overflow-hidden flex items-center px-4">
            <div
              className="px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs sm:text-sm border-2 border-black shadow-[0_3px_0_#000] transition-all duration-200 whitespace-nowrap"
              style={{ transform: `translateX(${beltProgress * 2.2}px)` }}
            >
              {crate?.label}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleRoute('pay')}
              className="min-h-[54px] rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm border-3 border-black shadow-[0_3px_0_#000] cursor-pointer"
            >
              CHUTE 1 · MONETARY PAY
            </button>
            <button
              type="button"
              onClick={() => handleRoute('leave')}
              className="min-h-[54px] rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-sm border-3 border-black shadow-[0_3px_0_#000] cursor-pointer"
            >
              CHUTE 2 · STATUTORY LEAVE
            </button>
            <button
              type="button"
              onClick={() => handleRoute('illegal')}
              className="min-h-[54px] rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs sm:text-sm border-3 border-black shadow-[0_3px_0_#000] cursor-pointer"
            >
              CHUTE 3 · PROHIBITED ACT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 6. BOWSER'S BRIDGE AXE TIMING DUEL (Oscillating Sweet-Spot Chain Breaker)
 * ========================================================================== */
const BRIDGE_CHAIN_DOCTRINES = [
  'Chain of Control Test (ER-EE)',
  'Chain of Non-Diminution (Art. 100)',
  'Chain of Twin-Notice Due Process',
  'Chain of Solidary Wage Liability',
  'Chain of 200% Regular Holiday Rule',
  'Chain of Security of Tenure (Art. 294)',
  'Chain of 22.5-Day Retirement Factor',
];

export const BowserBridgeAxeTimingGame: React.FC<ExpansionArcadeProps> = ({
  onEarnCoins,
  boosts,
  onRecordBestPlay,
}) => {
  const [phase, setPhase] = useState<ArcadePhase>('title');
  const [chains, setChains] = useState<string[]>([]);
  const [chainIdx, setChainIdx] = useState(0);
  const [needle, setNeedle] = useState(50);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const dirRef = useRef(1);

  const startDuel = () => {
    setChains(createFreshShuffledDeck(BRIDGE_CHAIN_DOCTRINES, Date.now()).slice(0, 5));
    setChainIdx(0);
    setNeedle(15);
    setLives(boosts?.bonusShieldActive ? 4 : 3);
    setScore(0);
    setPhase('playing');
    marioAudio.playPowerUp();
    dispatchDailyMissionEvent('arcade_play', 1);
  };

  useKeyboardStart(phase, startDuel);

  useEffect(() => {
    if (phase !== 'playing') return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const speed = 75 + chainIdx * 22;
      setNeedle((n) => {
        let next = n + dirRef.current * speed * dt;
        if (next >= 96) {
          next = 96;
          dirRef.current = -1;
        } else if (next <= 4) {
          next = 4;
          dirRef.current = 1;
        }
        return next;
      });
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [phase, chainIdx]);

  const strikeAxe = () => {
    if (phase !== 'playing') return;
    const sweetMin = 38;
    const sweetMax = 62;
    if (needle >= sweetMin && needle <= sweetMax) {
      const bullseye = Math.abs(needle - 50) <= 5;
      const pts = bullseye ? 250 : 160;
      const nextScore = score + pts;
      setScore(nextScore);
      marioAudio.playFireball();
      if (chainIdx + 1 >= chains.length) {
        const mult = boosts?.doublePayoutActive ? 2 : 1;
        onEarnCoins(18 * mult);
        onRecordBestPlay?.('bowser_axe_timing', "Bowser's Bridge Axe Timing Duel", nextScore, 18 * mult);
        marioAudio.playFlagpole();
        setPhase('gameover');
      } else {
        setChainIdx((c) => c + 1);
      }
    } else {
      marioAudio.playStomp();
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) setPhase('gameover');
        return nl;
      });
    }
  };

  return (
    <div
      data-testid="game-bowser-axe-timing"
      className="bg-gradient-to-b from-[#2a0808] to-slate-950 rounded-3xl border-4 border-black p-4 sm:p-6 shadow-[6px_6px_0_#000] text-white space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-black/75 px-4 py-3 rounded-2xl border border-amber-500/60">
        <div className="flex items-center gap-2.5">
          <MarioAxeIcon className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-black text-sm sm:text-base font-display text-amber-300">
              BOWSER&apos;S BRIDGE AXE TIMING DUEL
            </h3>
            <p className="text-[11px] text-slate-300">
              Strike the Golden Axe inside the emerald Sweet-Spot to sever all 5 Lava Keep chains!
            </p>
          </div>
        </div>
        <div className="font-mono text-xs font-black tabular-nums text-amber-300">
          HEARTS {lives} · CHAIN {Math.min(5, chainIdx + 1)}/5 · {score} PTS
        </div>
      </div>

      {phase !== 'playing' ? (
        <div className="bg-black/70 rounded-2xl p-6 text-center space-y-4 border-2 border-amber-400">
          <h4 className="text-xl font-black text-amber-300 font-display">
            {phase === 'gameover'
              ? chainIdx >= 4 && lives > 0
                ? `LAVA BRIDGE DROPPED! ${score} PTS`
                : `BOWSER HELD THE BRIDGE · ${score} PTS`
              : 'WORLD 8-4 GOLDEN AXE STRIKE'}
          </h4>
          <button
            type="button"
            data-start="true"
            onClick={startDuel}
            className="min-h-[46px] px-7 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm border-2 border-black cursor-pointer"
          >
            {phase === 'gameover' ? 'Replay Bridge Duel' : 'Step Onto Lava Bridge'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-xl mx-auto text-center">
          <div className="p-3 rounded-2xl bg-slate-900 border-2 border-red-700 font-black text-sm text-amber-200">
            Target #{chainIdx + 1}: {chains[chainIdx]}
          </div>

          <div className="relative h-12 rounded-2xl bg-slate-900 border-3 border-black overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-emerald-500/80 border-x-2 border-white"
              style={{ left: '38%', width: '24%' }}
            />
            <div
              className="absolute top-0 bottom-0 w-2.5 bg-amber-300 shadow-[0_0_12px_#fde047]"
              style={{ left: `calc(${needle}% - 5px)` }}
            />
          </div>

          <button
            type="button"
            onClick={strikeAxe}
            className="min-h-[54px] w-full rounded-2xl bg-amber-400 hover:bg-amber-300 active:translate-y-0.5 text-slate-950 font-black text-base border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <MarioAxeIcon className="w-5 h-5" />
            <span>STRIKE GOLDEN AXE NOW!</span>
          </button>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 7. PEACH'S MYSTERY BLOCK PAIR MATCH (4x3 12-Block [?] Memory Flip)
 * ========================================================================== */
const PEACH_MEMORY_PAIRS: { pairId: string; a: string; b: string }[] = [
  { pairId: 'hol', a: 'Regular Holiday Worked', b: '200% Daily Wage' },
  { pairId: 'ret', a: 'Art. 302 Half-Month', b: '22.5 Days / Year' },
  { pairId: 'nsd', a: 'Night Shift Diff', b: '+10% (10PM–6AM)' },
  { pairId: 'mat', a: 'Maternity Leave', b: '105 Days Paid' },
  { pairId: 'ot', a: 'Ordinary Overtime', b: '+25% Hourly Rate' },
  { pairId: 'sil', a: 'Service Incentive Leave', b: '5 Days After 1 Yr' },
  { pairId: 'vawc', a: 'R.A. 9262 VAWC Leave', b: '10 Paid Days' },
  { pairId: 'solo', a: 'Solo Parent Leave', b: '7 Days (6m Service)' },
  { pairId: 'money', a: 'Money Claim Prescription', b: '3 Years (Art. 306)' },
];

export const PeachMysteryBlockPairMatchGame: React.FC<ExpansionArcadeProps> = ({
  onEarnCoins,
  boosts,
  onRecordBestPlay,
}) => {
  const [phase, setPhase] = useState<ArcadePhase>('title');
  const [cards, setCards] = useState<{ uid: string; pairId: string; text: string }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  const startMatch = () => {
    const chosen = createFreshShuffledDeck(PEACH_MEMORY_PAIRS, Date.now()).slice(0, 6);
    const flat = chosen.flatMap((p) => [
      { uid: `${p.pairId}_a`, pairId: p.pairId, text: p.a },
      { uid: `${p.pairId}_b`, pairId: p.pairId, text: p.b },
    ]);
    setCards(createFreshShuffledDeck(flat, Date.now() + 55));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setPhase('playing');
    marioAudio.playPowerUp();
    dispatchDailyMissionEvent('arcade_play', 1);
  };

  useKeyboardStart(phase, startMatch);

  const handleFlip = (idx: number) => {
    if (phase !== 'playing' || flipped.length >= 2 || flipped.includes(idx)) return;
    const card = cards[idx];
    if (!card || matched.includes(card.pairId)) return;

    const nextFlip = [...flipped, idx];
    setFlipped(nextFlip);
    marioAudio.playJump();

    if (nextFlip.length === 2) {
      const nextMoves = moves + 1;
      setMoves(nextMoves);
      const first = cards[nextFlip[0]];
      const second = cards[nextFlip[1]];
      if (first.pairId === second.pairId) {
        const nextMatched = [...matched, first.pairId];
        setMatched(nextMatched);
        setFlipped([]);
        marioAudio.playCoin();
        if (nextMatched.length >= 6) {
          const score = Math.max(300, 1200 - nextMoves * 45);
          const mult = boosts?.doublePayoutActive ? 2 : 1;
          onEarnCoins(16 * mult);
          onRecordBestPlay?.('peach_block_match', "Peach's Mystery Block Pair Match", score, 16 * mult);
          marioAudio.playLevelUp();
          setPhase('gameover');
        }
      } else {
        window.setTimeout(() => setFlipped([]), 650);
      }
    }
  };

  return (
    <div
      data-testid="game-peach-block-match"
      className="bg-gradient-to-b from-pink-950 via-slate-900 to-slate-950 rounded-3xl border-4 border-black p-4 sm:p-6 shadow-[6px_6px_0_#000] text-white space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 px-4 py-3 rounded-2xl border border-pink-400/50">
        <div>
          <h3 className="font-black text-sm sm:text-base font-display text-pink-300">
            PEACH&apos;S MYSTERY BLOCK PAIR MATCH
          </h3>
          <p className="text-[11px] text-slate-300">
            Flip [?] Blocks to pair each Labor Law Doctrine with its exact Statutory Rate!
          </p>
        </div>
        <div className="font-mono text-xs font-black tabular-nums text-amber-300">
          PAIRS {matched.length}/6 · MOVES {moves}
        </div>
      </div>

      {phase !== 'playing' ? (
        <div className="bg-slate-900 rounded-2xl p-6 text-center space-y-4 border-2 border-pink-400/60">
          <h4 className="text-xl font-black text-amber-300 font-display">
            {phase === 'gameover'
              ? `ROYAL GALLERY CLEARED IN ${moves} MOVES!`
              : 'PEACH CASTLE [?] BLOCK MEMORY'}
          </h4>
          <button
            type="button"
            data-start="true"
            onClick={startMatch}
            className="min-h-[46px] px-7 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm border-2 border-black cursor-pointer"
          >
            {phase === 'gameover' ? 'Replay Shuffled Deck' : 'Deal 12 Mystery Blocks'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {cards.map((c, idx) => {
            const open = flipped.includes(idx) || matched.includes(c.pairId);
            return (
              <button
                key={c.uid}
                type="button"
                onClick={() => handleFlip(idx)}
                className={`min-h-[82px] p-2.5 rounded-2xl border-3 font-black text-xs leading-snug flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  matched.includes(c.pairId)
                    ? 'bg-emerald-400 text-slate-950 border-black'
                    : open
                    ? 'bg-white text-slate-950 border-pink-500'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-black shadow-[0_3px_0_#000]'
                }`}
              >
                {open ? (
                  <span>{c.text}</span>
                ) : (
                  <MarioQuestionBlockIcon className="w-8 h-8" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 8. CHAIN CHOMP STATUTORY TUG-OF-WAR (Momentum Pull + Ruling Surge)
 * ========================================================================== */
const CHOMP_RULING_SURGES: { statement: string; isTrue: boolean }[] = [
  { statement: 'Overtime work on an ordinary day pays +25% hourly.', isTrue: true },
  { statement: 'Employers can deduct OSH safety gear from minimum wage.', isTrue: false },
  { statement: '13th Month Pay must be paid on or before December 24.', isTrue: true },
  { statement: 'Probationary employment normally caps at 6 months.', isTrue: true },
  { statement: 'Managerial staff are entitled to statutory Overtime Pay.', isTrue: false },
  { statement: 'Unworked Regular Holiday still pays 100% daily wage.', isTrue: true },
  { statement: 'Money claims prescribe in 10 years under Art. 306.', isTrue: false },
  { statement: 'Solo parents qualify for 7-day leave after 6 months.', isTrue: true },
];

export const ChainChompTugOfWarGame: React.FC<ExpansionArcadeProps> = ({
  onEarnCoins,
  boosts,
  onRecordBestPlay,
}) => {
  const [phase, setPhase] = useState<ArcadePhase>('title');
  const [rope, setRope] = useState(50);
  const [rulings, setRulings] = useState<{ statement: string; isTrue: boolean }[]>([]);
  const [rIdx, setRIdx] = useState(0);
  const [score, setScore] = useState(0);

  const startTug = () => {
    setRope(boosts?.bonusShieldActive ? 58 : 50);
    setRulings(createFreshShuffledDeck(CHOMP_RULING_SURGES, Date.now()));
    setRIdx(0);
    setScore(0);
    setPhase('playing');
    marioAudio.playPowerUp();
    dispatchDailyMissionEvent('arcade_play', 1);
  };

  useKeyboardStart(phase, startTug);

  useEffect(() => {
    if (phase !== 'playing') return;
    const puller = window.setInterval(() => {
      setRope((r) => {
        const nr = r - 2.6;
        if (nr <= 0) {
          setPhase('gameover');
          return 0;
        }
        return nr;
      });
    }, 300);
    return () => window.clearInterval(puller);
  }, [phase]);

  const handleHeave = () => {
    if (phase !== 'playing') return;
    setScore((s) => s + 25);
    setRope((r) => {
      const nr = Math.min(100, r + 5.5);
      if (nr >= 100) setPhase('gameover');
      return nr;
    });
    marioAudio.playJump();
  };

  const handleSurge = (answer: boolean) => {
    if (phase !== 'playing' || !rulings[rIdx]) return;
    const right = rulings[rIdx].isTrue === answer;
    setRIdx((i) => (i + 1) % rulings.length);
    if (right) {
      setScore((s) => s + 180);
      marioAudio.playCoin();
      setRope((r) => {
        const nr = Math.min(100, r + 18);
        if (nr >= 100) setPhase('gameover');
        return nr;
      });
    } else {
      marioAudio.playStomp();
      setRope((r) => {
        const nr = Math.max(0, r - 12);
        if (nr <= 0) setPhase('gameover');
        return nr;
      });
    }
  };

  useEffect(() => {
    if (phase === 'gameover') {
      const won = rope >= 99;
      const finalPts = score + (won ? 400 : 0);
      const earned = won ? 18 : 6;
      const mult = boosts?.doublePayoutActive ? 2 : 1;
      onEarnCoins(earned * mult);
      onRecordBestPlay?.('chomp_tug_of_war', 'Chain Chomp Statutory Tug-of-War', finalPts, earned * mult);
      if (won) marioAudio.playFlagpole();
      else marioAudio.playGameOver();
    }
  }, [phase]);

  const cur = rulings[rIdx];

  return (
    <div
      data-testid="game-chomp-tug-of-war"
      className="bg-slate-950 rounded-3xl border-4 border-black p-4 sm:p-6 shadow-[6px_6px_0_#000] text-white space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 px-4 py-3 rounded-2xl border border-amber-400/50">
        <div>
          <h3 className="font-black text-sm sm:text-base font-display text-amber-300">
            CHAIN CHOMP STATUTORY TUG-OF-WAR
          </h3>
          <p className="text-[11px] text-slate-300">
            Heave the rope to 100% AND fire True/False Power Surges before Chain Chomp drags it to 0%!
          </p>
        </div>
        <div className="font-mono text-xs font-black tabular-nums text-emerald-300">
          ROPE {Math.round(rope)}% · {score} PTS
        </div>
      </div>

      {phase !== 'playing' ? (
        <div className="bg-slate-900 rounded-2xl p-6 text-center space-y-4 border-2 border-amber-400">
          <h4 className="text-xl font-black text-amber-300 font-display">
            {phase === 'gameover'
              ? rope >= 99
                ? `CHAIN CHOMP OUTPULLED! ${score + 400} PTS`
                : 'DRAGGED INTO CHOMP PIT!'
              : 'ROYAL COURTROOM ROPE DUEL'}
          </h4>
          <button
            type="button"
            data-start="true"
            onClick={startTug}
            className="min-h-[46px] px-7 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm border-2 border-black cursor-pointer"
          >
            {phase === 'gameover' ? 'Replay Tug-of-War' : 'Grab the Rope'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-xl mx-auto">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-black font-mario">
              <span className="text-rose-400">CHAIN CHOMP (0%)</span>
              <span className="text-emerald-300">WORKER VICTORY (100%)</span>
            </div>
            <div className="h-6 rounded-full bg-slate-800 border-2 border-black overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-150"
                style={{ width: `${Math.max(4, Math.min(100, rope))}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleHeave}
            className="min-h-[50px] w-full rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-black text-sm border-3 border-black shadow-[0_3px_0_#000] cursor-pointer"
          >
            HEAVE ROPE (+5.5% MOMENTUM)
          </button>

          {cur && (
            <div className="p-4 rounded-2xl bg-slate-900 border-2 border-slate-700 space-y-3">
              <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
                STATUTORY POWER SURGE (+18% ROPE):
              </span>
              <p className="text-xs sm:text-sm font-bold text-white">{cur.statement}</p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSurge(true)}
                  className="min-h-[44px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs border-2 border-black cursor-pointer"
                >
                  TRUE RULING
                </button>
                <button
                  type="button"
                  onClick={() => handleSurge(false)}
                  className="min-h-[44px] rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs border-2 border-black cursor-pointer"
                >
                  FALSE TRAP
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
