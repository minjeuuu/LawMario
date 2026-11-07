import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { MarioAvatar } from '../types/laborLaw';
import { getHeroMeta } from '../data/heroesData';
import { marioAudio } from '../utils/audio';
import {
  MarioCharacterAvatar,
  MarioCoinIcon,
  MarioStarIcon,
  MarioBowserIcon,
  MarioFireballIcon,
  MarioAxeIcon,
  MarioQuestionBlockIcon,
} from './MarioIcons';
import { ArcadeDoctrineCard } from './ArcadeDoctrineCard';
import {
  Play,
  RotateCcw,
  Hammer,
  Grid,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Trophy,
  Clock,
  Heart,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowDown,
  Search,
  Eye,
  Zap,
  Wind,
  FileText,
  Check,
  Activity,
} from 'lucide-react';
import {
  drawGoombaTargets,
  drawMultiplierMemoryPairs,
  drawContractorDockets,
  drawBridgePuzzle,
  drawPayrollCapsules,
  DeductionPipeTargetItem,
  ContractorDocketItem,
  BridgeDoctrineItem,
  PayrollCapsuleItem,
} from '../utils/gameQuestionDeck';

interface MiniGameProps {
  equippedAvatar: MarioAvatar;
  onEarnCoins: (amount: number) => void;
}

/* ============================================================================
   GAME 4: WHACK-A-GOOMBA: ILLEGAL DEDUCTION SMASHER (Art. 113-116)
   ============================================================================ */
export const WhackAGoombaGame: React.FC<MiniGameProps> = ({ equippedAvatar, onEarnCoins }) => {
  const hero = getHeroMeta(equippedAvatar);
  const [phase, setPhase] = useState<'title' | 'playing' | 'done'>('title');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(35);
  const [activePipes, setActivePipes] = useState<(DeductionPipeTargetItem | null)[]>(Array(9).fill(null));
  const [feedback, setFeedback] = useState<string>('Smash RED Goombas (Illegal Practices) — Spare GREEN Toads (Lawful Art. 113 Deductions)!');

  useEffect(() => {
    if (phase !== 'playing') return;

    const spawnInterval = setInterval(() => {
      setActivePipes(() => {
        const next: (DeductionPipeTargetItem | null)[] = Array(9).fill(null);
        const count = 2 + Math.floor(Math.random() * 2);
        const chosenIndices = new Set<number>();
        while (chosenIndices.size < count) {
          chosenIndices.add(Math.floor(Math.random() * 9));
        }
        const drawnTargets = drawGoombaTargets(count);
        Array.from(chosenIndices).forEach((pipeIdx, idx) => {
          next[pipeIdx] = drawnTargets[idx] ?? null;
        });
        return next;
      });
    }, 1450);

    const clockInterval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase('done');
          marioAudio.playQuizComplete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(clockInterval);
    };
  }, [phase]);

  const startRound = () => {
    setScore(0);
    setLives(3);
    setTimeLeft(35);
    setActivePipes(Array(9).fill(null));
    setFeedback('Smash Illegal Deductions! Do NOT hit Lawful Statutory Deductions!');
    setPhase('playing');
    marioAudio.playPowerUp();
  };

  const handleWhack = (idx: number) => {
    const target = activePipes[idx];
    if (!target || phase !== 'playing') return;

    const updated = [...activePipes];
    updated[idx] = null;
    setActivePipes(updated);

    if (target.isIllegal) {
      setScore((s) => s + 150);
      onEarnCoins(2);
      setFeedback(`SMASHED! +2 Coins — ${target.ruleNote}`);
      marioAudio.playStomp();
      marioAudio.playCoin();
    } else {
      setFeedback(`OOPS! That was LAWFUL: ${target.ruleNote}`);
      marioAudio.playBowserHit();
      setLives((l) => {
        const nextL = l - 1;
        if (nextL <= 0) setPhase('done');
        return nextL;
      });
    }
  };

  return (
    <div className="bg-[#1e293b] rounded-3xl mario-card border-4 border-slate-950 p-4 sm:p-6 text-white space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-700 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center shrink-0">
            <MarioCharacterAvatar character={equippedAvatar} className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
              ARTICLES 102 & 112–116 • {hero.name.toUpperCase()}
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              WHACK-A-GOOMBA: DEDUCTION SMASHER
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 px-3.5 py-2 rounded-xl border-2 border-slate-700 tabular-nums">
          <span className="font-mario text-xs text-amber-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {timeLeft}s
          </span>
          <span className="font-mario text-xs text-emerald-400">PTS: {score}</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((h) => (
              <Heart
                key={h}
                className={`w-4 h-4 ${h <= lives ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-400 text-slate-950 px-3.5 py-2.5 rounded-xl border-2 border-black font-bold text-xs sm:text-sm flex items-center gap-2">
        <Hammer className="w-4 h-4 shrink-0 text-red-700" />
        <span className="flex-1 min-w-0 break-words leading-tight">{feedback}</span>
      </div>

      {phase === 'title' && (
        <div className="bg-slate-900 rounded-2xl border-3 border-black p-8 text-center space-y-4">
          <Hammer className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-2xl sm:text-3xl font-black font-display">SMASH ILLEGAL WAGE DEDUCTIONS!</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-semibold">
            Goombas pop out of 9 Warp Pipes carrying illegal wage deductions (cashier reserves without hearing, forced grocery cuts, undertime offsets). Smash them for +2 Coins, and spare green lawful Art. 113 deductions!
          </p>
          <button
            type="button"
            onClick={startRound}
            className="h-11 px-8 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_4px_0_#000] cursor-pointer font-mario text-xs leading-none whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span>START SMASHING</span>
          </button>
        </div>
      )}

      {phase === 'playing' && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-slate-950 p-2.5 sm:p-4 rounded-2xl border-3 border-black">
          {activePipes.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleWhack(idx)}
              className={`min-h-[118px] sm:min-h-[155px] h-auto rounded-2xl border-3 border-black p-1.5 sm:p-2.5 flex flex-col items-center justify-between transition-all cursor-pointer ${
                item
                  ? item.isIllegal
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_4px_0_#000] -translate-y-1'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_0_#000] -translate-y-1'
                  : 'bg-slate-900 text-slate-500'
              }`}
            >
              {item ? (
                <>
                  <span className="text-[9px] font-black font-mario uppercase px-2 py-0.5 rounded bg-black/40">
                    {item.isIllegal ? 'SMASH GOOMBA!' : 'LAWFUL • SPARE!'}
                  </span>
                  <span className="text-[11px] sm:text-xs font-black leading-tight text-center my-1 line-clamp-3 overflow-hidden break-words w-full px-0.5">
                    {item.label}
                  </span>
                  <div className="w-full h-3 mario-green-pipe rounded-md" />
                </>
              ) : (
                <>
                  <span className="text-[10px] font-mario text-slate-600 mt-3">PIPE {idx + 1}</span>
                  <div className="w-full h-6 mario-green-pipe rounded-lg" />
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {phase === 'done' && (
        <div className="bg-slate-900 rounded-2xl border-3 border-amber-400 p-8 text-center space-y-4">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-2xl font-black font-display text-amber-300">SHIFT COMPLETE!</h3>
          <p className="text-sm font-bold text-slate-200">
            Final Deduction Audit Score: <span className="text-emerald-400 font-black">{score} PTS</span>
          </p>
          <button
            type="button"
            onClick={startRound}
            className="h-11 px-7 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_4px_0_#000] cursor-pointer font-mario text-xs leading-none whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>PLAY AGAIN</span>
          </button>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   GAME 5: MARIO PARTY: MULTIPLIER MEMORY MATCH (16 Flipping [?] Blocks)
   ============================================================================ */
interface MemoryCard {
  uid: string;
  pairId: string;
  text: string;
  kind: 'scenario' | 'rate';
}

const MEMORY_PAIR_COUNT = 8;

export const MultiplierMemoryGame: React.FC<MiniGameProps> = ({ equippedAvatar, onEarnCoins }) => {
  const [deck, setDeck] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const lockRef = useRef(false);

  const initDeck = () => {
    const selectedPairs = drawMultiplierMemoryPairs(MEMORY_PAIR_COUNT);
    const raw: MemoryCard[] = [];
    selectedPairs.forEach((p) => {
      raw.push({ uid: `${p.id}-s`, pairId: p.id, text: p.scenario, kind: 'scenario' });
      raw.push({ uid: `${p.id}-r`, pairId: p.id, text: p.rate, kind: 'rate' });
    });
    for (let i = raw.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [raw[i], raw[j]] = [raw[j], raw[i]];
    }
    setDeck(raw);
    setFlipped([]);
    setMatchedPairIds([]);
    setMoves(0);
    lockRef.current = false;
  };

  useEffect(() => {
    initDeck();
  }, []);

  const handleCardFlip = (idx: number) => {
    if (lockRef.current) return;
    if (flipped.includes(idx)) return;
    const card = deck[idx];
    if (!card || matchedPairIds.includes(card.pairId)) return;

    marioAudio.playJump();
    const nextFlipped = [...flipped, idx];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = nextFlipped;
      const first = deck[firstIdx];
      const second = deck[secondIdx];

      if (first.pairId === second.pairId) {
        const updatedMatches = [...matchedPairIds, first.pairId];
        setMatchedPairIds(updatedMatches);
        setFlipped([]);
        onEarnCoins(3);
        marioAudio.playCoin();
        if (updatedMatches.length === MEMORY_PAIR_COUNT) {
          onEarnCoins(20);
          marioAudio.playQuizComplete();
          try {
            confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
        }
      } else {
        lockRef.current = true;
        setTimeout(() => {
          setFlipped([]);
          lockRef.current = false;
        }, 780);
      }
    }
  };

  const allCleared = matchedPairIds.length === MEMORY_PAIR_COUNT && deck.length > 0;

  return (
    <div className="bg-[#1e293b] rounded-3xl mario-card border-4 border-slate-950 p-4 sm:p-6 text-white space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-700 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center shrink-0">
            <MarioCharacterAvatar character={equippedAvatar} className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
              MARIO PARTY MEMORY TABLE • DOLE MULTIPLIERS
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              MULTIPLIER MEMORY MATCH
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 px-3.5 py-2 rounded-xl border-2 border-slate-700 font-mario text-xs tabular-nums flex items-center gap-3">
            <span className="text-amber-300">PAIRS: {matchedPairIds.length}/8</span>
            <span className="text-cyan-300">MOVES: {moves}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              initDeck();
              marioAudio.playPowerUp();
            }}
            className="h-10 px-4 inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black shadow-[0_3px_0_#000] cursor-pointer text-xs leading-none whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {allCleared && (
        <div className="bg-emerald-900/90 border-3 border-amber-400 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MarioStarIcon className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="font-black text-amber-300 font-display text-lg">ALL 8 STATUTORY MULTIPLIERS MATCHED!</h3>
              <p className="text-xs font-bold text-emerald-100">Completed in {moves} moves • +20 Bonus Mario Coins awarded!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={initDeck}
            className="h-10 px-5 inline-flex items-center justify-center gap-1.5 bg-amber-400 text-slate-950 font-black rounded-xl border-2 border-black cursor-pointer font-mario text-xs leading-none whitespace-nowrap"
          >
            NEW BOARD
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {deck.map((card, idx) => {
          const isRevealed = flipped.includes(idx) || matchedPairIds.includes(card.pairId);
          const isMatched = matchedPairIds.includes(card.pairId);
          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => handleCardFlip(idx)}
              className={`h-24 sm:h-28 rounded-2xl border-3 border-black p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                isMatched
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_3px_0_#000]'
                  : isRevealed
                  ? card.kind === 'rate'
                    ? 'bg-amber-300 text-slate-950 shadow-[0_3px_0_#000]'
                    : 'bg-white text-slate-950 shadow-[0_3px_0_#000]'
                  : 'mario-question-block text-slate-950 hover:-translate-y-0.5'
              }`}
            >
              {isRevealed ? (
                <>
                  <span className="text-[9px] font-black font-mario uppercase opacity-75 mb-1">
                    {card.kind === 'rate' ? 'MULTIPLIER' : 'DAY SCENARIO'}
                  </span>
                  <span className="text-xs sm:text-sm font-black leading-tight">{card.text}</span>
                </>
              ) : (
                <span className="font-mario text-2xl font-black text-slate-950">?</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
   GAME 6: LUIGI'S MANSION: CONTRACTOR BUSTER (DOLE D.O. 174-17 Inspector)
   ============================================================================ */
export const ContractorBusterGame: React.FC<MiniGameProps> = ({ equippedAvatar, onEarnCoins }) => {
  const [cases, setCases] = useState<ContractorDocketItem[]>(() => drawContractorDockets(6));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<null | { correct: boolean; message: string; action: 'bust' | 'certify' }>(null);
  const [completed, setCompleted] = useState(false);
  const [activeSensor, setActiveSensor] = useState<'capital' | 'registration' | 'control' | 'work'>('capital');
  const [suctionActive, setSuctionActive] = useState(false);
  const [stampActive, setStampActive] = useState(false);
  const [ghostOpacity, setGhostOpacity] = useState(1);

  const current = cases[idx] ?? cases[0];

  const handleInspect = (declareLaborOnly: boolean) => {
    if (answered || !current) return;
    const isCorrect = declareLaborOnly === current.isLaborOnly;

    if (declareLaborOnly) {
      setSuctionActive(true);
      marioAudio.playPowerUp();
      setTimeout(() => {
        setGhostOpacity(0.15);
      }, 350);
    } else {
      setStampActive(true);
      marioAudio.playCoin();
    }

    setTimeout(() => {
      setSuctionActive(false);
      setStampActive(false);
      if (isCorrect) {
        setScore((s) => s + 1);
        onEarnCoins(5);
        marioAudio.playCoin();
      } else {
        marioAudio.playBowserHit();
      }
      setAnswered({
        correct: isCorrect,
        message: current.verdictNote,
        action: declareLaborOnly ? 'bust' : 'certify',
      });
    }, 600);
  };

  const nextCase = () => {
    if (idx < cases.length - 1) {
      setIdx((i) => i + 1);
      setAnswered(null);
      setGhostOpacity(1);
      setActiveSensor('capital');
      marioAudio.playPipe();
    } else {
      setCompleted(true);
      onEarnCoins(15);
      marioAudio.playQuizComplete();
    }
  };

  const resetCases = () => {
    setCases(drawContractorDockets(6));
    setIdx(0);
    setScore(0);
    setAnswered(null);
    setGhostOpacity(1);
    setActiveSensor('capital');
    setCompleted(false);
    marioAudio.playPowerUp();
  };

  return (
    <div className="bg-[#0b1120] rounded-3xl mario-card border-4 border-slate-950 p-4 sm:p-6 text-white space-y-4 max-w-4xl mx-auto shadow-[0_12px_36px_rgba(0,0,0,0.8)]">
      {/* HUD Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-emerald-900/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-400 rounded-2xl border-3 border-black flex items-center justify-center shrink-0 shadow-[0_3px_0_#000]">
            <MarioCharacterAvatar character={equippedAvatar} className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-emerald-400 font-mario tracking-wider">
                DOLE D.O. 174-17 · POLTERGUST 3000 AUDIT
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-wide">
              LUIGI&apos;S MANSION: CONTRACTOR BUSTER
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950/90 px-3.5 py-2 rounded-xl border-2 border-emerald-500/40 font-mario text-xs tabular-nums text-slate-300">
            DOCKET <span className="text-amber-300">{idx + 1}</span>/{cases.length}
          </div>
          <div className="bg-slate-950/90 px-3.5 py-2 rounded-xl border-2 border-emerald-500/40 font-mario text-xs tabular-nums">
            SCORE: <span className="text-emerald-400 font-black">{score}</span>
          </div>
        </div>
      </div>

      {!completed ? (
        <div className="space-y-4">
          {/* Haunted Mansion Stage Viewport */}
          <div className="relative rounded-2xl border-3 border-emerald-500/50 bg-gradient-to-b from-[#131b2e] via-[#0b101e] to-[#050811] p-4 sm:p-6 overflow-hidden min-h-[280px] flex flex-col justify-between">
            {/* Ambient Background Cobwebs & Ectoplasm Specks */}
            <div className="absolute top-2 right-3 text-xs font-mono text-emerald-400/40 uppercase tracking-widest select-none pointer-events-none">
              SPECTRAL SCANNER: 84.7 kHz
            </div>
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Flashlight Spotlight Cone Effect */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                background: 'radial-gradient(ellipse at 25% 45%, rgba(52, 211, 153, 0.45) 0%, rgba(15, 23, 42, 0) 65%)',
              }}
            />

            {/* Top Stage Bar: Docket ID & 5M Capital Badge */}
            <div className="relative z-10 flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-400/50 text-[10px] font-mario text-emerald-300 uppercase">
                  DOCKET #{idx + 101}
                </span>
                <span className="text-xs font-bold text-slate-300 truncate font-display">
                  {current.agencyName}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-950/80 border border-amber-400/50 text-[10px] font-mono font-bold text-amber-300">
                DOLE 5M RULE
              </span>
            </div>

            {/* Ghost / Contractor Target Stage Display */}
            <div className="relative z-10 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Luigi Flashlight & Poltergust Nozzle on the Left */}
              <div className="flex items-center gap-3 self-center sm:self-start">
                <div className="relative w-16 h-16 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                  <MarioCharacterAvatar character={equippedAvatar} className="w-12 h-12" />
                  {suctionActive && (
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 animate-pulse">
                      <Wind className="w-5 h-5 text-cyan-300" />
                    </div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <span className="text-[10px] font-mario text-emerald-300 uppercase block">POLTERGUST 3000</span>
                  <span className="text-xs text-slate-400 font-mono">Vacuum Suction Ready</span>
                </div>
              </div>

              {/* Animated Target: Boo-like Ghost Contractor vs Legitimate Engineer */}
              <div
                className={`transition-all duration-500 transform ${
                  suctionActive ? 'scale-75 -translate-x-8 rotate-12' : 'hover:scale-105'
                }`}
                style={{ opacity: ghostOpacity }}
              >
                <div className="relative flex flex-col items-center">
                  {/* Floating Target Entity */}
                  <div
                    className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-3 flex flex-col items-center justify-center p-2 text-center transition-all shadow-[0_8px_24px_rgba(0,0,0,0.6)] ${
                      current.isLaborOnly
                        ? 'bg-gradient-to-b from-purple-900/60 to-slate-950 border-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                        : 'bg-gradient-to-b from-emerald-900/60 to-slate-950 border-emerald-400/80 shadow-[0_0_20px_rgba(52,211,153,0.35)]'
                    }`}
                  >
                    {/* Animated Spectral Face */}
                    <div className="text-3xl sm:text-4xl select-none mb-1">
                      {current.isLaborOnly ? (
                        <div className="inline-block animate-bounce">
                          <Eye className="w-9 h-9 text-purple-300 mx-auto" />
                        </div>
                      ) : (
                        <ShieldCheck className="w-9 h-9 text-emerald-400 mx-auto" />
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider font-mario text-amber-300 block leading-tight">
                      {current.isLaborOnly ? 'PHANTOM INTERMEDIARY' : 'LEGITIMATE CONTRACTOR'}
                    </span>
                    <span className="text-[9px] text-slate-300 font-mono block mt-0.5">
                      {current.isLaborOnly ? 'Sub-Contracting Trap' : 'Independent DOLE Firm'}
                    </span>
                  </div>

                  {/* Stamp Impact Effect */}
                  {stampActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-amber-400/30 rounded-3xl border-4 border-amber-300 animate-ping" />
                  )}
                </div>
              </div>

              {/* Right Side: Tactical Telemetry Sensor Meters */}
              <div className="w-full sm:w-60 bg-slate-950/80 rounded-xl border border-slate-800 p-2.5 space-y-1.5 text-xs font-mono">
                <div className="text-[9px] font-mario text-slate-400 uppercase border-b border-slate-800 pb-1 flex items-center justify-between">
                  <span>TELEMETRY DIAGNOSTICS</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capital Level:</span>
                    <span className={current.capital.includes('₱2,') || current.capital.includes('₱1,') || current.capital.includes('₱800,') || current.capital.includes('₱500,') ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {current.capital.split(' ')[0]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Registry:</span>
                    <span className={current.registration.toLowerCase().includes('unreg') || current.registration.toLowerCase().includes('expired') ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {current.registration.toLowerCase().includes('unreg') ? 'UNREGISTERED' : 'REGISTERED'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Control Holder:</span>
                    <span className="text-amber-300 font-bold truncate max-w-[120px]">
                      {current.controlHolder.split(' ')[0]}...
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Evidence Dossier Tabs */}
            <div className="relative z-10 bg-slate-950/90 rounded-xl border border-slate-800 p-3 space-y-2">
              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'capital', label: '1. Capital & Tools', icon: <Hammer className="w-3.5 h-3.5" /> },
                  { id: 'registration', label: '2. DOLE Registry', icon: <FileText className="w-3.5 h-3.5" /> },
                  { id: 'control', label: '3. Right of Control', icon: <Zap className="w-3.5 h-3.5" /> },
                  { id: 'work', label: '4. Nature of Work', icon: <Search className="w-3.5 h-3.5" /> },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveSensor(t.id as typeof activeSensor);
                      marioAudio.playClick();
                    }}
                    className={`min-h-[34px] px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                      activeSensor === t.id
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_2px_0_#000]'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Sensor Content Display */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200">
                {activeSensor === 'capital' && (
                  <div className="flex items-start gap-2">
                    <Hammer className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px] uppercase">Paid-Up Capital &amp; Specialized Equipment:</span>
                      <strong className="text-white text-sm">{current.capital}</strong>
                    </div>
                  </div>
                )}
                {activeSensor === 'registration' && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px] uppercase">DOLE D.O. 174 Registration Status:</span>
                      <strong className="text-white text-sm">{current.registration}</strong>
                    </div>
                  </div>
                )}
                {activeSensor === 'control' && (
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px] uppercase">Exercise of Control Over Means &amp; Methods:</span>
                      <strong className="text-white text-sm">{current.controlHolder}</strong>
                    </div>
                  </div>
                )}
                {activeSensor === 'work' && (
                  <div className="flex items-start gap-2">
                    <Search className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px] uppercase">Nature of Work Contracted:</span>
                      <strong className="text-white text-sm">{current.workRelation}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Luigi's Mansion Action Buttons */}
          {!answered ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInspect(true)}
                className="min-h-[58px] p-3.5 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white font-black rounded-2xl border-3 border-black shadow-[0_5px_0_#000] active:translate-y-1 active:shadow-[0_2px_0_#000] cursor-pointer text-xs sm:text-sm leading-tight text-center transition-transform"
              >
                <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/20">
                  <Wind className="w-5 h-5 text-cyan-300" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-mario text-rose-200 block uppercase">FIRE POLTERGUST VACUUM</span>
                  <span className="font-display font-extrabold text-sm sm:text-base">BUST GHOST! (Labor-Only / Void)</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleInspect(false)}
                className="min-h-[58px] p-3.5 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl border-3 border-black shadow-[0_5px_0_#000] active:translate-y-1 active:shadow-[0_2px_0_#000] cursor-pointer text-xs sm:text-sm leading-tight text-center transition-transform"
              >
                <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/20">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-mario text-emerald-200 block uppercase">STAMP DOLE ACCREDITATION</span>
                  <span className="font-display font-extrabold text-sm sm:text-base">CERTIFY VALID (Legitimate D.O. 174)</span>
                </div>
              </button>
            </div>
          ) : (
            <ArcadeDoctrineCard
              title={current.agencyName}
              statute="DOLE D.O. No. 174-17 · Arts. 106–109, Labor Code"
              rule={`Capital: ${current.capital} · Registry: ${current.registration} · Control: ${current.controlHolder} · Work: ${current.workRelation}`}
              takeaway={`${answered.message} Controlling Doctrine: ${current.verdictNote}`}
              isCorrect={answered.correct}
              worldCode="w2"
              scenarioText={`Dossier: ${current.agencyName} (${current.capital}, ${current.registration}, ${current.controlHolder})`}
              chosenAnswerText={answered.action === 'bust' ? 'Poltergust Fired (Labor-Only / Void)' : 'DOLE Accreditation Stamped (Legitimate D.O. 174)'}
              correctAnswerText={current.isLaborOnly ? 'Poltergust: Prohibited Labor-Only Intermediary' : 'Accredited: Legitimate Contractor'}
              advanceLabel={idx + 1 >= cases.length ? 'Complete Mansion Audit' : 'Next Contractor Docket →'}
              onAdvance={nextCase}
            />
          )}
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-2xl border-3 border-emerald-400 p-8 text-center space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <Trophy className="w-14 h-14 text-amber-400 mx-auto animate-bounce" />
          <h3 className="text-2xl sm:text-3xl font-black font-display text-emerald-300">
            MANSION AUDIT CLEARED!
          </h3>
          <p className="text-sm sm:text-base font-bold text-slate-200 max-w-md mx-auto">
            You accurately adjudicated {score} of {cases.length} D.O. 174 contracting dockets! +15 Bonus Coins awarded to your pouch!
          </p>
          <button
            type="button"
            onClick={resetCases}
            className="min-h-[48px] px-8 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_4px_0_#000] cursor-pointer font-mario text-xs whitespace-nowrap active:translate-y-0.5"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>INSPECT NEXT MANSION</span>
          </button>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   GAME 7: BOWSER'S BRIDGE: DOCTRINE RESCUE (Statutory Term Decoder)
   ============================================================================ */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const BowsersBridgeGame: React.FC<MiniGameProps> = ({ equippedAvatar, onEarnCoins }) => {
  const [puzzle, setPuzzle] = useState<BridgeDoctrineItem>(() => drawBridgePuzzle());
  const [guessed, setGuessed] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const maxMistakes = 6;

  const letters = puzzle.word.split('');
  const isSolved = letters.every((ch) => guessed.includes(ch));
  const isLost = mistakes >= maxMistakes;

  const handleGuess = (letter: string) => {
    if (guessed.includes(letter) || isSolved || isLost) return;
    const next = [...guessed, letter];
    setGuessed(next);
    if (puzzle.word.includes(letter)) {
      marioAudio.playJump();
      if (letters.every((ch) => next.includes(ch))) {
        onEarnCoins(8);
        marioAudio.playQuizComplete();
      }
    } else {
      setMistakes((m) => m + 1);
      marioAudio.playBowserHit();
    }
  };

  const nextPuzzle = () => {
    setPuzzle(drawBridgePuzzle());
    setGuessed([]);
    setMistakes(0);
    marioAudio.playPowerUp();
  };

  return (
    <div className="bg-[#1e293b] rounded-3xl mario-card border-4 border-slate-950 p-4 sm:p-6 text-white space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-700 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-red-500 rounded-xl border-2 border-black flex items-center justify-center shrink-0">
            <MarioCharacterAvatar character={equippedAvatar} className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
              CASTLE LAVA BRIDGE • STATUTORY DECODER
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              BOWSER&apos;S BRIDGE: DOCTRINE RESCUE
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 px-3.5 py-2 rounded-xl border-2 border-slate-700 font-mario text-xs tabular-nums">
          <MarioBowserIcon className="w-5 h-5 shrink-0" />
          <span className="text-rose-400">BRIDGE INTEGRITY: {maxMistakes - mistakes}/{maxMistakes}</span>
        </div>
      </div>

      {/* Bridge Visual Meter */}
      <div className="bg-slate-950 rounded-2xl border-3 border-black p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1">
            {Array.from({ length: maxMistakes }).map((_, i) => (
              <div
                key={i}
                className={`h-4 flex-1 rounded border-2 border-black transition-all ${
                  i < maxMistakes - mistakes ? 'bg-amber-500' : 'bg-red-950 opacity-35'
                }`}
              />
            ))}
          </div>
          <MarioAxeIcon className="w-7 h-7 shrink-0" />
        </div>

        <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-3.5 text-center space-y-2">
          <span className="text-[10px] font-mario text-amber-400 uppercase block">STATUTORY CLUE:</span>
          <p className="text-xs sm:text-sm font-bold text-slate-100">{puzzle.clue}</p>
        </div>

        {/* Letter Slots */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 py-2">
          {letters.map((ch, idx) => {
            const show = guessed.includes(ch) || isLost;
            return (
              <div
                key={idx}
                className={`w-8 h-10 sm:w-10 sm:h-12 rounded-xl border-2 border-black flex items-center justify-center font-mario text-sm sm:text-base font-black ${
                  show ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {show ? ch : '_'}
              </div>
            );
          })}
        </div>
      </div>

      {(isSolved || isLost) && (
        <ArcadeDoctrineCard
          title={`Bowser's Bridge: ${puzzle.word}`}
          statute="Philippine Labor Standards Codification"
          rule={puzzle.clue}
          takeaway={
            isSolved
              ? `Bridge Rescued! Decoded Statutory Term: "${puzzle.word}". Excellent statutory decoding under Philippine labor standards!`
              : `Bridge Collapsed! The controlling statutory legal term was "${puzzle.word}". Review definition: ${puzzle.clue}`
          }
          isCorrect={isSolved}
          worldCode="w1"
          scenarioText={puzzle.clue}
          chosenAnswerText={isSolved ? puzzle.word : 'Bridge Collapsed'}
          correctAnswerText={puzzle.word}
          advanceLabel="Next Bridge Challenge →"
          onAdvance={nextPuzzle}
        />
      )}

      {/* Keyboard */}
      <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5">
        {ALPHABET.map((letter) => {
          const used = guessed.includes(letter);
          const hit = used && puzzle.word.includes(letter);
          return (
            <button
              key={letter}
              type="button"
              disabled={used || isSolved || isLost}
              onClick={() => handleGuess(letter)}
              className={`min-h-[44px] h-11 rounded-xl border-2 border-black font-mario text-xs font-black inline-flex items-center justify-center transition-all cursor-pointer ${
                used
                  ? hit
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-600 opacity-50'
                  : 'bg-white hover:bg-amber-300 text-slate-950 shadow-[0_2px_0_#000]'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
   GAME 8: DR. MARIO: HOLIDAY & WAGE PIPE SORTER
   ============================================================================ */
export const HolidayWageSorterGame: React.FC<MiniGameProps> = ({ equippedAvatar, onEarnCoins }) => {
  const [capsules, setCapsules] = useState<PayrollCapsuleItem[]>(() => drawPayrollCapsules(8));
  const [capsuleIdx, setCapsuleIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Route each Payroll Capsule into the matching Statutory Warp Pipe!');
  const [finished, setFinished] = useState(false);
  const [routedVerdict, setRoutedVerdict] = useState<{
    isCorrect: boolean;
    chosen: PayrollCapsuleItem['bucket'];
    capsule: PayrollCapsuleItem;
  } | null>(null);

  const capsule = capsules[capsuleIdx] ?? capsules[0];

  const handleSort = (chosen: PayrollCapsuleItem['bucket']) => {
    if (finished || !capsule || routedVerdict !== null) return;
    const isCorrect = chosen === capsule.bucket;
    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setScore((s) => s + 100 + nextStreak * 20);
      onEarnCoins(3);
      setStatusMsg(`CORRECT PIPE! +3 Coins — ${capsule.note}`);
      marioAudio.playCoin();
    } else {
      setStreak(0);
      setStatusMsg(`WRONG PIPE! ${capsule.note}`);
      marioAudio.playBowserHit();
    }

    setRoutedVerdict({
      isCorrect,
      chosen,
      capsule,
    });
  };

  const handleNextCapsule = () => {
    if (capsuleIdx < capsules.length - 1) {
      setCapsuleIdx((i) => i + 1);
      setRoutedVerdict(null);
    } else {
      setFinished(true);
      setRoutedVerdict(null);
      onEarnCoins(15);
      marioAudio.playQuizComplete();
    }
  };

  const restartSorter = () => {
    setCapsules(drawPayrollCapsules(8));
    setCapsuleIdx(0);
    setScore(0);
    setStreak(0);
    setRoutedVerdict(null);
    setFinished(false);
    setStatusMsg('Route each Payroll Capsule into the matching Statutory Warp Pipe!');
    marioAudio.playPowerUp();
  };

  return (
    <div className="bg-[#1e293b] rounded-3xl mario-card border-4 border-slate-950 p-4 sm:p-6 text-white space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-700 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-cyan-400 rounded-xl border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
            <MarioCharacterAvatar character={equippedAvatar} className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-cyan-300 font-mario block">
              DR. MARIO PAYROLL CLINIC • HOLIDAY & REST PIPES
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              HOLIDAY & WAGE PIPE SORTER
            </h2>
          </div>
        </div>

        <div className="bg-slate-900 px-3.5 py-2 rounded-xl border-2 border-slate-700 font-mario text-xs tabular-nums flex items-center gap-3">
          <span className="text-amber-300">CAPSULE {Math.min(capsules.length, capsuleIdx + 1)}/{capsules.length}</span>
          <span className="text-emerald-400">SCORE: {score}</span>
        </div>
      </div>

      <div className="bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-amber-200">
        {statusMsg}
      </div>

      {!finished ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 rounded-2xl border-3 border-black p-6 text-center space-y-2 shadow-[0_4px_0_#000]">
            <span className="text-[10px] font-mario uppercase bg-black text-amber-300 px-2.5 py-1 rounded inline-block">
              INCOMING PAYROLL CAPSULE #{capsuleIdx + 1}
            </span>
            <h3 className="text-lg sm:text-xl font-black font-display">{capsule.title}</h3>
            <p className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
              <ArrowDown className="w-4 h-4" /> Drop into the correct statutory multiplier pipe below:
            </p>
          </div>

          {routedVerdict === null ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSort('base100')}
                className="h-24 rounded-2xl border-3 border-black bg-sky-500 hover:bg-sky-400 text-slate-950 p-3 flex flex-col items-center justify-between font-black shadow-[0_4px_0_#000] cursor-pointer transition-transform active:translate-y-0.5"
              >
                <span className="font-mario text-xs">PIPE A • 100%</span>
                <span className="text-xs font-extrabold">100% Basic Daily Rate</span>
                <div className="w-full h-3 mario-green-pipe rounded" />
              </button>

              <button
                type="button"
                onClick={() => handleSort('special130')}
                className="h-24 rounded-2xl border-3 border-black bg-amber-400 hover:bg-amber-300 text-slate-950 p-3 flex flex-col items-center justify-between font-black shadow-[0_4px_0_#000] cursor-pointer transition-transform active:translate-y-0.5"
              >
                <span className="font-mario text-xs">PIPE B • 130%–150%</span>
                <span className="text-xs font-extrabold">Rest / Special Non-Working</span>
                <div className="w-full h-3 mario-green-pipe rounded" />
              </button>

              <button
                type="button"
                onClick={() => handleSort('regular200')}
                className="h-24 rounded-2xl border-3 border-black bg-rose-500 hover:bg-rose-400 text-white p-3 flex flex-col items-center justify-between font-black shadow-[0_4px_0_#000] cursor-pointer transition-transform active:translate-y-0.5"
              >
                <span className="font-mario text-xs">PIPE C • 200%–390%</span>
                <span className="text-xs font-extrabold">Regular / Double Holiday</span>
                <div className="w-full h-3 mario-green-pipe rounded" />
              </button>
            </div>
          ) : (
            <ArcadeDoctrineCard
              title={routedVerdict.capsule.title}
              statute="Arts. 87, 93, 94, Labor Code · DOLE Handbook"
              rule={routedVerdict.capsule.note}
              takeaway={
                routedVerdict.isCorrect
                  ? `Correct Multiplier Routing! ${routedVerdict.capsule.note}`
                  : `Multiplier Routing Trap! The controlling category for "${routedVerdict.capsule.title}" is ${
                      routedVerdict.capsule.bucket === 'base100'
                        ? '100% Ordinary Day'
                        : routedVerdict.capsule.bucket === 'special130'
                        ? '130%-150% Rest/Special Day'
                        : '200%-390% Regular/Double Holiday'
                    }. Rule: ${routedVerdict.capsule.note}`
              }
              isCorrect={routedVerdict.isCorrect}
              worldCode="holidays"
              scenarioText={`Incoming Capsule: ${routedVerdict.capsule.title}`}
              chosenAnswerText={
                routedVerdict.chosen === 'base100'
                  ? 'Pipe A: 100% Basic Day'
                  : routedVerdict.chosen === 'special130'
                  ? 'Pipe B: 130%-150% Rest/Special Day'
                  : 'Pipe C: 200%-390% Regular/Double Holiday'
              }
              correctAnswerText={
                routedVerdict.capsule.bucket === 'base100'
                  ? 'Pipe A: 100% Basic Day'
                  : routedVerdict.capsule.bucket === 'special130'
                  ? 'Pipe B: 130%-150% Rest/Special Day'
                  : 'Pipe C: 200%-390% Regular/Double Holiday'
              }
              advanceLabel={capsuleIdx + 1 >= capsules.length ? 'View Sorting Results' : 'Next Payroll Capsule →'}
              onAdvance={handleNextCapsule}
            />
          )}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border-3 border-cyan-400 p-8 text-center space-y-4">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-2xl font-black font-display text-cyan-300">ALL CAPSULES SORTED!</h3>
          <p className="text-sm font-bold text-slate-200">
            Total Clinic Score: <span className="text-emerald-400">{score} PTS</span> • +15 Bonus Coins!
          </p>
          <button
            type="button"
            onClick={restartSorter}
            className="h-11 px-7 inline-flex items-center justify-center gap-2 bg-amber-400 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_4px_0_#000] cursor-pointer font-mario text-xs leading-none whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>SORT AGAIN</span>
          </button>
        </div>
      )}
    </div>
  );
};
