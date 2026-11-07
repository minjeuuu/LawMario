import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MarioAvatar } from '../types/laborLaw';
import {
  MarioCharacterAvatar,
  MarioCoinIcon,
  MarioStarIcon,
  MarioFireFlowerIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';
import {
  Hammer,
  ShieldCheck,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Heart,
  Zap,
  Clock,
  Scale,
  Factory,
  Wand2,
  ListOrdered,
  Trophy,
  Sparkles,
  Shield,
  BookOpen,
  Flame,
  Flag,
  Target,
  ArrowRight,
  Eye,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { ArcadeDoctrineCard } from './ArcadeDoctrineCard';
import {
  drawUniqueFromDeck,
  drawWageFactoryPackages,
  drawKamekSpells,
  WAGE_FACTORY_PACKAGES_BANK,
} from '../utils/gameQuestionDeck';

interface BonusVaultGameProps {
  equippedAvatar: MarioAvatar;
  onEarnCoins: (amount: number) => void;
}

type ArcadePhase = 'TITLE' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';

// ============================================================================
// 1. HAMMER BROS. PAYROLL BLITZ — 3-Lane Statutory Payroll Shield & Smash
// ============================================================================
export interface HammerPayrollItem {
  id: string;
  label: string;
  detail: string;
  isValidPayroll: boolean;
  statute: string;
}

export const HAMMER_BROS_PAYROLL_BANK: HammerPayrollItem[] = [
  {
    id: 'hb1',
    label: 'Ordinary Overtime = 125% Hourly',
    detail: 'Base hourly rate × 1.25 for work beyond 8 hours on an ordinary working day.',
    isValidPayroll: true,
    statute: 'Art. 87, Labor Code',
  },
  {
    id: 'hb2',
    label: 'Undertime Offsets Overtime Hours',
    detail: 'Employer deducts Tuesday undertime to cancel Monday overtime premium.',
    isValidPayroll: false,
    statute: 'Art. 88 (Strictly Prohibited)',
  },
  {
    id: 'hb3',
    label: 'Regular Holiday Worked = 200%',
    detail: 'Employee working first 8 hours on a Regular Holiday receives double pay (200%).',
    isValidPayroll: true,
    statute: 'Art. 94, Labor Code',
  },
  {
    id: 'hb4',
    label: '85% / 15% Service Charge Split',
    detail: 'Hotel management retains 15% of collected service charges for losses.',
    isValidPayroll: false,
    statute: 'Art. 96 as amended by R.A. 11360 (100% to Workers)',
  },
  {
    id: 'hb5',
    label: 'Night Shift Diff. = +10% (10PM–6AM)',
    detail: 'Additional 10% of regular wage per hour worked between 10:00 PM and 6:00 AM.',
    isValidPayroll: true,
    statute: 'Art. 86, Labor Code',
  },
  {
    id: 'hb6',
    label: 'Special Day on Rest Day = 150%',
    detail: 'Work on a Special Non-Working Day falling on scheduled Rest Day pays 150%.',
    isValidPayroll: true,
    statute: 'Art. 93(c), Labor Code',
  },
  {
    id: 'hb7',
    label: '13th Month Paid on January 15',
    detail: 'Employer unilaterally defers mandatory 13th Month Pay to mid-January.',
    isValidPayroll: false,
    statute: 'P.D. No. 851 (Deadline: On or Before Dec 24)',
  },
  {
    id: 'hb8',
    label: 'Kasambahay Board & Lodging Deducted',
    detail: 'Household employer deducts daily meals and room from Kasambahay minimum wage.',
    isValidPayroll: false,
    statute: 'R.A. 10361 Sec. 25 (Free Board & Lodging)',
  },
  {
    id: 'hb9',
    label: 'Regular Holiday on Rest Day = 260%',
    detail: '200% regular holiday rate × 1.30 rest day premium = 260% for first 8 hours.',
    isValidPayroll: true,
    statute: 'Art. 94 & Omnibus Rules',
  },
  {
    id: 'hb10',
    label: 'SIL Unused Cash Conversion (5 Days)',
    detail: 'Unused 5-day Service Incentive Leave commuted to cash at year-end.',
    isValidPayroll: true,
    statute: 'Art. 95, Labor Code',
  },
  {
    id: 'hb11',
    label: 'Cash Bond Without DOLE Approval',
    detail: 'Store deducts P500/week tool deposit without recognized custom or DOLE permit.',
    isValidPayroll: false,
    statute: 'Arts. 113–114, Labor Code',
  },
  {
    id: 'hb12',
    label: 'Retirement 1/2 Month = 22.5 Days',
    detail: '15 days basic + 5 days SIL + 2.5 days (1/12 of 13th month) per year of service.',
    isValidPayroll: true,
    statute: 'Art. 302, R.A. 7641',
  },
];

export const HammerBrosPayrollBlitzGame: React.FC<BonusVaultGameProps> = ({
  equippedAvatar,
  onEarnCoins,
}) => {
  const [phase, setPhase] = useState<ArcadePhase>('TITLE');
  const [deck, setDeck] = useState<HammerPayrollItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [lane, setLane] = useState<number>(1);
  const [hp, setHp] = useState(3);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(9000);
  const [speedBonusAwarded, setSpeedBonusAwarded] = useState(false);
  const [verdict, setVerdict] = useState<{
    approvedAsLawful: boolean;
    isCorrect: boolean;
    item: HammerPayrollItem;
  } | null>(null);
  const [actionAnimation, setActionAnimation] = useState<'idle' | 'shield' | 'smash' | 'miss'>('idle');

  const startGame = useCallback(() => {
    const combinedPool: HammerPayrollItem[] = [
      ...HAMMER_BROS_PAYROLL_BANK,
      ...WAGE_FACTORY_PACKAGES_BANK.map((p) => ({
        id: `hb-${p.id}`,
        label: p.label,
        detail: p.detail,
        isValidPayroll: p.verdict === 'lawful',
        statute: p.ruleNote,
      })),
    ];
    const drawn = drawUniqueFromDeck('hammer_bros_payroll_combined', combinedPool, 10);
    setDeck(drawn);
    setIdx(0);
    setLane(Math.floor(Math.random() * 3));
    setHp(3);
    setScore(0);
    setCombo(0);
    setVerdict(null);
    setSpeedBonusAwarded(false);
    setActionAnimation('idle');
    setTimeLeftMs(9000);
    setPhase('PLAYING');
    marioAudio.playPowerUp();
  }, []);

  const currentItem = deck[idx] || HAMMER_BROS_PAYROLL_BANK[0];
  const targetCount = 10;

  const handleVerdict = useCallback(
    (approveAsLawful: boolean) => {
      if (phase !== 'PLAYING' || !currentItem || verdict !== null) return;
      const correct = approveAsLawful === currentItem.isValidPayroll;
      if (correct) {
        const nextCombo = combo + 1;
        const pts = 100 + nextCombo * 25;
        const nextScore = score + pts;
        setCombo(nextCombo);
        setScore(nextScore);
        setBestScore((b) => Math.max(b, nextScore));
        const isFast = timeLeftMs >= 4000;
        let bonusCoins = 2;
        if (isFast) {
          bonusCoins += 5;
          setSpeedBonusAwarded(true);
        }
        onEarnCoins(bonusCoins);
        setActionAnimation(approveAsLawful ? 'shield' : 'smash');
        marioAudio.playCoin();
      } else {
        const nextHp = hp - 1;
        setHp(nextHp);
        setCombo(0);
        setActionAnimation('miss');
        marioAudio.playStomp();
      }
      setVerdict({
        approvedAsLawful: approveAsLawful,
        isCorrect: correct,
        item: currentItem,
      });
    },
    [phase, currentItem, verdict, combo, score, hp, onEarnCoins, timeLeftMs]
  );

  const handleAdvanceWave = useCallback(() => {
    if (!verdict) return;
    if (hp <= 0) {
      setPhase('GAME_OVER');
      return;
    }
    if (idx + 1 >= targetCount) {
      onEarnCoins(10);
      marioAudio.playQuizComplete();
      setPhase('VICTORY');
      return;
    }
    setIdx((i) => i + 1);
    setLane(Math.floor(Math.random() * 3));
    setTimeLeftMs(Math.max(5500, 9000 - (idx + 1) * 280));
    setVerdict(null);
    setSpeedBonusAwarded(false);
    setActionAnimation('idle');
  }, [verdict, hp, idx, targetCount, onEarnCoins]);

  // Per-wave countdown timer (paused during doctrine review)
  useEffect(() => {
    if (phase !== 'PLAYING' || verdict !== null) return;
    const timer = window.setInterval(() => {
      setTimeLeftMs((prev) => {
        if (prev <= 200) {
          const nextHp = hp - 1;
          setHp(nextHp);
          setCombo(0);
          setActionAnimation('miss');
          marioAudio.playStomp();
          setVerdict({
            approvedAsLawful: false,
            isCorrect: false,
            item: currentItem,
          });
          return 0;
        }
        return prev - 200;
      });
    }, 200);
    return () => window.clearInterval(timer);
  }, [phase, verdict, hp, idx, currentItem]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (phase === 'TITLE' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        startGame();
      } else if (phase === 'PLAYING') {
        if (verdict !== null) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleAdvanceWave();
          }
        } else {
          if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            e.preventDefault();
            handleVerdict(true);
          } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            e.preventDefault();
            handleVerdict(false);
          } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
            setPhase('PAUSED');
          }
        }
      } else if (phase === 'PAUSED' && (e.key === 'p' || e.key === 'P' || e.key === 'Escape')) {
        setPhase('PLAYING');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, verdict, startGame, handleVerdict, handleAdvanceWave]);

  const LANE_TITLES = ['LANE 1 · HIGH BATTLEMENT', 'LANE 2 · CASTLE DRAWBRIDGE', 'LANE 3 · LOWER MOAT'];

  return (
    <div
      data-testid="game-hammer-bros-blitz"
      className="bg-[#0f172a] text-white rounded-3xl border-4 border-slate-950 shadow-[6px_6px_0_#000] overflow-hidden select-none"
    >
      {/* Top World-Matched Arcade HUD */}
      <div className="bg-slate-950 px-4 py-3 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 shrink-0 shadow-[0_2px_0_#000]">
            <Hammer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
              3-LANE PAYROLL DEFENSE
            </span>
            <h2 className="text-sm sm:text-lg font-black font-display text-white">
              HAMMER BROS. PAYROLL BLITZ
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1" aria-label={`Vitality: ${hp} of 3 hearts`}>
            {[0, 1, 2].map((i) => (
              <Heart
                key={i}
                className={`w-5 h-5 ${
                  i < hp ? 'text-rose-500 fill-rose-500' : 'text-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="bg-slate-900 px-3 py-1 rounded-xl border border-slate-700 text-xs font-mono tabular-nums">
            <span className="text-slate-400 mr-1">WAVE</span>
            <strong className="text-amber-300">
              {Math.min(targetCount, idx + 1)}/{targetCount}
            </strong>
          </div>
          <div className="bg-slate-900 px-3 py-1 rounded-xl border border-slate-700 text-xs font-mono tabular-nums">
            <span className="text-slate-400 mr-1">SCORE</span>
            <strong className="text-emerald-400">{score}</strong>
          </div>
          {phase === 'PLAYING' && (
            <button
              type="button"
              onClick={() => setPhase('PAUSED')}
              aria-label="Pause Hammer Bros Payroll Blitz"
              className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center cursor-pointer"
            >
              <Pause className="w-4 h-4 text-amber-300" />
            </button>
          )}
        </div>
      </div>

      {/* Main Arena */}
      <div className="p-4 sm:p-6 min-h-[340px] flex flex-col justify-between gap-4 bg-gradient-to-b from-[#1e293b] to-[#0f172a]">
        {phase === 'TITLE' && (
          <div className="my-auto text-center max-w-xl mx-auto space-y-4 py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-400 border-3 border-black shadow-[0_4px_0_#000] mx-auto">
              <MarioCharacterAvatar character={equippedAvatar} className="w-11 h-11" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display text-white">
              Defend the Payroll Treasury Against Hammer Bros.!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Inspect 10 incoming payroll orders hurled across 3 castle lanes. Shield lawful statutory multipliers (125% OT, +10% NSD, 200% Regular Holiday, 100% Service Charges) with your{' '}
              <strong className="text-emerald-300">Green Aegis Shield</strong>, and smash illegal wage shortcuts with your{' '}
              <strong className="text-rose-300">War Hammer</strong>!
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-7 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm font-mario border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START PAYROLL BLITZ</span>
            </button>
            <p className="text-[11px] font-mono text-slate-400">
              Controls: Tap Shield / Smash buttons · Keyboard [A / ←] Shield Lawful · [D / →] Smash Illegal · [P] Pause
            </p>
          </div>
        )}

        {phase === 'PAUSED' && (
          <div className="my-auto text-center space-y-4 py-6">
            <h3 className="text-xl font-black font-display text-amber-300">GAME PAUSED</h3>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setPhase('PLAYING')}
                className="min-h-[44px] px-5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs border-2 border-black cursor-pointer"
              >
                Resume Game
              </button>
              <button
                type="button"
                onClick={startGame}
                className="min-h-[44px] px-5 rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-600 cursor-pointer"
              >
                Restart
              </button>
            </div>
          </div>
        )}

        {phase === 'PLAYING' && currentItem && (
          <div className="space-y-4">
            {/* Visual Castle Rampart Battle Arena */}
            <div className="relative rounded-2xl border-3 border-slate-950 bg-gradient-to-b from-[#111827] via-[#1e293b] to-[#0f172a] p-4 sm:p-5 overflow-hidden shadow-inner">
              {/* Stone Crenellations Top Border */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-700/60 text-xs font-mono">
                <span className="text-amber-300 font-bold tabular-nums">
                  {LANE_TITLES[lane]} · {(timeLeftMs / 1000).toFixed(1)}s
                </span>
                {combo > 1 && (
                  <span className="text-emerald-400 font-black tabular-nums animate-pulse">
                    {combo}x STREAK COMBO
                  </span>
                )}
              </div>

              {/* Countdown Bar */}
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 my-2">
                <div
                  className="h-full bg-amber-400 transition-all duration-150"
                  style={{ width: `${Math.min(100, (timeLeftMs / 9000) * 100)}%` }}
                />
              </div>

              {/* Castle Lanes & Combatants Stage */}
              <div className="grid grid-cols-12 gap-2 items-center my-3 min-h-[140px]">
                {/* Left Defender: Castle Turret with Hero */}
                <div className="col-span-3 flex flex-col items-center justify-center text-center">
                  <div
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-3 flex items-center justify-center transition-all ${
                      actionAnimation === 'shield'
                        ? 'bg-emerald-950 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)] scale-110'
                        : actionAnimation === 'smash'
                        ? 'bg-amber-950 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)] scale-110'
                        : actionAnimation === 'miss'
                        ? 'bg-rose-950 border-rose-500 animate-bounce'
                        : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    <MarioCharacterAvatar character={equippedAvatar} className="w-10 h-10 sm:w-12 sm:h-12" />
                    {actionAnimation === 'shield' && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-emerald-300 bg-emerald-400/30 flex items-center justify-center animate-ping">
                        <ShieldCheck className="w-8 h-8 text-emerald-300" />
                      </div>
                    )}
                    {actionAnimation === 'smash' && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-amber-300 bg-amber-400/30 flex items-center justify-center animate-ping">
                        <Hammer className="w-8 h-8 text-amber-300" />
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mario text-emerald-300 uppercase mt-1 block">
                    {actionAnimation === 'shield' ? 'AEGIS SHIELD!' : actionAnimation === 'smash' ? 'HAMMER SMASH!' : 'DEFENDER'}
                  </span>
                </div>

                {/* Center: 3 Lanes with Hurled Projectile */}
                <div className="col-span-6 space-y-1.5">
                  {[0, 1, 2].map((ln) => {
                    const isActive = lane === ln;
                    return (
                      <div
                        key={ln}
                        className={`relative rounded-xl px-2.5 py-1.5 border text-xs font-mono transition-all flex items-center justify-between overflow-hidden ${
                          isActive
                            ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                            : 'bg-slate-950/60 border-slate-800 text-slate-600'
                        }`}
                      >
                        <span className="text-[10px] font-bold">L{ln + 1}</span>
                        {isActive && (
                          <div className="flex items-center gap-1.5 animate-pulse text-amber-300">
                            <Hammer className="w-4 h-4 animate-spin text-amber-400" />
                            <span className="text-[10px] font-black uppercase font-mario tracking-wider">
                              INCOMING VOUCHER #{idx + 1}
                            </span>
                          </div>
                        )}
                        <span className="text-[9px] opacity-60">CASTLE WALL</span>
                      </div>
                    );
                  })}
                </div>

                {/* Right Invader: Hammer Bro on Parapet */}
                <div className="col-span-3 flex flex-col items-center justify-center text-center">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-950/60 border-3 border-amber-500/80 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <div className="flex flex-col items-center animate-bounce">
                      <div className="w-7 h-5 rounded-t-full bg-emerald-500 border border-black flex items-center justify-center">
                        <div className="w-2 h-1 bg-white rounded-full" />
                      </div>
                      <div className="w-8 h-6 rounded-b-xl bg-amber-400 border border-black flex items-center justify-center">
                        <Hammer className="w-4 h-4 text-slate-950 animate-spin" />
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mario text-amber-400 uppercase mt-1 block">
                    HAMMER BRO
                  </span>
                </div>
              </div>

              {/* Active Incoming Voucher Dossier */}
              <div className="bg-white text-slate-950 rounded-2xl p-4 sm:p-5 border-3 border-black shadow-[4px_4px_0_#000] space-y-1.5 mt-2">
                <span className="text-[10px] font-black uppercase text-slate-500 font-mono block">
                  INCOMING STATUTORY PAYROLL ORDER #{idx + 1} OF {targetCount}
                </span>
                <h3 className="text-base sm:text-xl font-black font-display text-slate-950">
                  {currentItem.label}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-semibold">
                  {currentItem.detail}
                </p>
              </div>
            </div>

            {/* Action Buttons (Active when reviewing next order) */}
            {verdict === null ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleVerdict(true)}
                  className="min-h-[54px] px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm border-3 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 inline-flex items-center justify-center gap-2 cursor-pointer transition-transform"
                >
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>SHIELD: LAWFUL STATUTORY RIGHT [A]</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleVerdict(false)}
                  className="min-h-[54px] px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm border-3 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 inline-flex items-center justify-center gap-2 cursor-pointer transition-transform"
                >
                  <Hammer className="w-5 h-5 shrink-0" />
                  <span>SMASH: ILLEGAL SHORTCUT [D]</span>
                </button>
              </div>
            ) : (
              /* Rich High-Yield Statutory Learning Card with 1-Tap Save to Notes */
              <ArcadeDoctrineCard
                title={currentItem.label}
                statute={currentItem.statute}
                rule={currentItem.detail}
                takeaway={
                  currentItem.isValidPayroll
                    ? `Controlling Statutory Mandate: Guaranteed under ${currentItem.statute}. This multiplier or benefit is legally compulsory for covered workers under Philippine labor law. Employer must fully credit and compute without unlawful offsetting!`
                    : `Prohibited Wage Shortcut / Violation: Strictly illegal under ${currentItem.statute}. Smash and eliminate from payroll records to avoid backwages, interest, and DOLE administrative sanctions!`
                }
                isCorrect={verdict.isCorrect}
                speedBonusAwarded={speedBonusAwarded}
                worldCode="w1"
                scenarioText={currentItem.detail}
                chosenAnswerText={verdict.approvedAsLawful ? 'Shielded as Lawful Statutory Right' : 'Smashed as Illegal Shortcut'}
                correctAnswerText={currentItem.isValidPayroll ? 'Shield: Lawful Statutory Right' : 'Smash: Illegal Shortcut'}
                advanceLabel={idx + 1 >= targetCount ? 'Claim Victory Coins' : 'Next Castle Wave →'}
                onAdvance={handleAdvanceWave}
              />
            )}
          </div>
        )}

        {(phase === 'VICTORY' || phase === 'GAME_OVER') && (
          <div className="my-auto text-center max-w-md mx-auto space-y-4 py-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400 border-3 border-black mx-auto shadow-[0_3px_0_#000]">
              <Trophy className="w-7 h-7 text-slate-950" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display text-white">
              {phase === 'VICTORY' ? 'PAYROLL TREASURY SECURED!' : 'TREASURY BREACHED!'}
            </h3>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono tabular-nums">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">SCORE</span>
                <strong className="text-amber-300 text-sm">{score}</strong>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">BEST</span>
                <strong className="text-emerald-400 text-sm">{Math.max(bestScore, score)}</strong>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">WAVES</span>
                <strong className="text-sky-300 text-sm">
                  {phase === 'VICTORY' ? targetCount : idx}/{targetCount}
                </strong>
              </div>
            </div>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm font-mario border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 2. TOADETTE'S TWIN-NOTICE RELAY — Due Process Step Sequencer
// ============================================================================
export interface DueProcessRelayCase {
  id: string;
  title: string;
  scenario: string;
  orderedSteps: [string, string, string];
  statute: string;
  doctrineNote: string;
}

export const TOADETTE_DUE_PROCESS_CASES: DueProcessRelayCase[] = [
  {
    id: 'dp1',
    title: 'Just Cause Dismissal (Serious Misconduct)',
    scenario:
      'Cashier was caught falsifying payroll vouchers. Assemble the mandatory King of Kings Twin-Notice sequence:',
    orderedSteps: [
      '1st Written Notice (NTE) specifying acts + >= 5 calendar days to explain',
      'Administrative Hearing / Ample Opportunity to Be Heard with counsel',
      '2nd Written Notice of Decision stating established facts & legal grounds',
    ],
    statute: 'Art. 297, Labor Code · King of Kings Transport v. Mamac',
    doctrineNote:
      'If Just Cause exists but Twin-Notice is defective, dismissal remains valid but employer pays P30,000 nominal damages (Agabon v. NLRC).',
  },
  {
    id: 'dp2',
    title: 'Authorized Cause Dismissal (Redundancy)',
    scenario:
      'Company is abolishing duplicate regional billing roles in good faith. Sequence the valid Art. 298 procedure:',
    orderedSteps: [
      'Establish good-faith redundancy via fair & reasonable selection criteria',
      'Serve Written Notice to BOTH Employee and DOLE >= 30 days before effectivity',
      'Pay Separation Pay of at least 1 month pay or 1 month per year of service',
    ],
    statute: 'Art. 298, Labor Code · Jaka Food Processing v. Pacot',
    doctrineNote:
      'Procedural defect in an Authorized Cause dismissal entails P50,000 nominal damages under Jaka Food.',
  },
  {
    id: 'dp3',
    title: 'Termination Due to Disease (Art. 299)',
    scenario:
      'Worker suffers from a contagious illness affecting co-workers. Assemble the valid Art. 299 termination sequence:',
    orderedSteps: [
      'Secure Certification from a Competent Public Health Authority (incurable within 6 mos)',
      'Serve Twin Written Notices to the affected employee',
      'Pay Separation Pay of 1 month salary or 1/2 month per year of service (whichever is higher)',
    ],
    statute: 'Art. 299, Labor Code · Deoferio v. Intel Technology',
    doctrineNote:
      'A company physician certificate alone is insufficient; certification must come from a competent public health authority.',
  },
  {
    id: 'dp4',
    title: 'Abandonment of Work Dismissal',
    scenario:
      'Warehouse worker has been absent without official leave (AWOL) for 14 days. Sequence the lawful abandonment protocol:',
    orderedSteps: [
      'Verify absence without justifiable reason + overt act showing intent to sever ties',
      'Send 1st Notice / Return-to-Work Order to employee’s last known address',
      'Issue 2nd Written Notice of Termination after failure to report or explain',
    ],
    statute: 'Art. 297(b), Labor Code · Demex Rattancraft v. Leron',
    doctrineNote:
      'Mere absence is never enough; overt intent to abandon AND twin notices to last known address are mandatory.',
  },
  {
    id: 'dp5',
    title: 'Preventive Suspension Pending Investigation',
    scenario:
      'Vault custodian’s continued presence poses a serious & imminent threat to company property. Sequence the lawful steps:',
    orderedSteps: [
      'Serve 1st Written Notice to Explain (NTE) for the grave offense under investigation',
      'Place worker under Preventive Suspension for a maximum of 30 calendar days',
      'Reinstate to payroll/work if investigation extends beyond 30 days',
    ],
    statute: 'Omnibus Rules Book V · Mandapat v. Add Force Personnel',
    doctrineNote:
      'Preventive suspension beyond 30 days without pay amounts to constructive illegal dismissal.',
  },
  {
    id: 'dp6',
    title: 'Probationary Employment Evaluation (Art. 296)',
    scenario:
      'Tech startup hires a junior analyst on a 6-month probationary period. Sequence the valid regularization/evaluation steps:',
    orderedSteps: [
      'Communicate reasonable regularization standards to the employee on Day 1 of hiring',
      'Evaluate employee performance fairly against those disclosed metrics before Month 6 ends',
      'Serve written Notice of Non-Regularization prior to expiration of the 6-month period',
    ],
    statute: 'Art. 296, Labor Code · Abbott Laboratories v. Alcaraz',
    doctrineNote:
      'Failure to make reasonable standards known at the time of engagement makes the worker a regular employee from Day 1!',
  },
  {
    id: 'dp7',
    title: 'Retrenchment to Prevent Losses (Art. 298)',
    scenario:
      'Manufacturing plant faces severe financial downturn. Sequence the valid retrenchment protocol:',
    orderedSteps: [
      'Substantiate serious actual or imminent losses via independently audited financial statements',
      'Serve Written Notice to affected workers AND DOLE at least 30 days in advance using fair criteria',
      'Pay Separation Pay of 1 month pay or 1/2 month pay per year of service (whichever is higher)',
    ],
    statute: 'Art. 298, Labor Code · Flight Attendants (FASAP) v. PAL',
    doctrineNote:
      'Unaudited internal income statements are self-serving and insufficient to prove valid retrenchment.',
  },
  {
    id: 'dp8',
    title: 'Bona Fide Suspension / Floating Status (Art. 301)',
    scenario:
      'Security agency client contract expires leaving guards temporarily unassigned. Sequence the lawful off-detail limits:',
    orderedSteps: [
      'Notify worker of bona fide temporary off-detail / suspension of operations',
      'Actively redeploy worker to an equivalent post within a maximum of 6 months',
      'Recall to duty or pay separation benefits before the 6-month cap expires to avoid constructive dismissal',
    ],
    statute: 'Art. 301, Labor Code · Exocet Security v. Serrano',
    doctrineNote:
      'Floating status extending beyond 6 months ripens into illegal constructive dismissal.',
  },
  {
    id: 'dp9',
    title: 'Statutory Wage Distortion Resolution (Art. 124)',
    scenario:
      'A new regional Wage Order compresses the pay gap between junior and senior clerks in an unorganized firm:',
    orderedSteps: [
      'Employer and workers endeavor in good faith to negotiate and correct the distortion',
      'Refer unresolved distortion dispute to the NCMB for 10-day conciliation',
      'Submit unresolved distortion after conciliation to the NLRC Labor Arbiter for compulsory arbitration',
    ],
    statute: 'Art. 124, Labor Code · Prubankers Association v. Prudential Bank',
    doctrineNote:
      'In unionized establishments, wage distortion goes through the CBA grievance machinery then Voluntary Arbitration.',
  },
  {
    id: 'dp10',
    title: 'Expanded Maternity Leave Availment (R.A. 11210)',
    scenario:
      'Pregnant rank-and-file employee prepares for live childbirth leave. Sequence the statutory benefit steps:',
    orderedSteps: [
      'Employee notifies employer of pregnancy and expected childbirth date as soon as practicable',
      'Employer advances full 105-day (+15d if Solo Parent) maternity pay within 30 days of filing',
      'SSS reimburses the employer 100% of the statutory SSS maternity benefit upon proof of payment',
    ],
    statute: 'R.A. No. 11210 Sec. 5 · Implementing Rules',
    doctrineNote:
      'Private employers must also pay the salary differential between SSS benefit and full pay unless legally exempt.',
  },
];

export const ToadetteDueProcessRelayGame: React.FC<BonusVaultGameProps> = ({
  equippedAvatar,
  onEarnCoins,
}) => {
  const [phase, setPhase] = useState<ArcadePhase>('TITLE');
  const [relayDeck, setRelayDeck] = useState<DueProcessRelayCase[]>(() =>
    drawUniqueFromDeck('toadette_due_process_dockets', TOADETTE_DUE_PROCESS_CASES, 5)
  );
  const [caseIdx, setCaseIdx] = useState(0);
  const [shuffledPool, setShuffledPool] = useState<{ stepIdx: number; text: string }[]>([]);
  const [pickedOrder, setPickedOrder] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [roundCleared, setRoundCleared] = useState(false);
  const [runnerState, setRunnerState] = useState<'idle' | 'sprint' | 'stumble'>('idle');
  const [roundStartTime, setRoundStartTime] = useState<number>(() => Date.now());
  const [speedBonusAwarded, setSpeedBonusAwarded] = useState<boolean>(false);

  const loadRound = useCallback(
    (idxToLoad: number, sourceDeck?: DueProcessRelayCase[]) => {
      const activeList = sourceDeck || relayDeck;
      const c = activeList[idxToLoad % activeList.length];
      const items = c.orderedSteps.map((text, stepIdx) => ({ stepIdx, text }));
      const mixed = [...items].sort(() => Math.random() - 0.5);
      if (mixed[0].stepIdx === 0 && mixed[1].stepIdx === 1 && mixed[2].stepIdx === 2) {
        [mixed[0], mixed[1]] = [mixed[1], mixed[0]];
      }
      setShuffledPool(mixed);
      setPickedOrder([]);
      setRoundCleared(false);
      setRunnerState('idle');
      setRoundStartTime(Date.now());
      setSpeedBonusAwarded(false);
    },
    [relayDeck]
  );

  const startGame = () => {
    const freshCases = drawUniqueFromDeck(
      'toadette_due_process_dockets',
      TOADETTE_DUE_PROCESS_CASES,
      5
    );
    setRelayDeck(freshCases);
    setCaseIdx(0);
    setScore(0);
    setMistakes(0);
    setSpeedBonusAwarded(false);
    loadRound(0, freshCases);
    setPhase('PLAYING');
    marioAudio.playPowerUp();
  };

  const activeCase = relayDeck[caseIdx] || relayDeck[0] || TOADETTE_DUE_PROCESS_CASES[0];

  const handleSelectStep = (stepIdx: number) => {
    if (phase !== 'PLAYING' || roundCleared || pickedOrder.includes(stepIdx)) return;
    const expectedNext = pickedOrder.length;
    if (stepIdx === expectedNext) {
      const updated = [...pickedOrder, stepIdx];
      setPickedOrder(updated);
      setRunnerState('sprint');
      marioAudio.playCoin();
      if (updated.length === 3) {
        setRoundCleared(true);
        setScore((s) => s + 150);
        const isFast = Date.now() - roundStartTime <= 8000;
        let coins = 3;
        if (isFast) {
          coins += 5;
          setSpeedBonusAwarded(true);
        }
        onEarnCoins(coins);
      } else {
        setTimeout(() => setRunnerState('idle'), 400);
      }
    } else {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      setPickedOrder([]);
      setRunnerState('stumble');
      marioAudio.playStomp();
      setTimeout(() => setRunnerState('idle'), 600);
      if (nextMistakes >= 4) {
        setPhase('GAME_OVER');
      }
    }
  };

  const handleNextCase = () => {
    if (caseIdx + 1 >= relayDeck.length) {
      onEarnCoins(10);
      marioAudio.playQuizComplete();
      setPhase('VICTORY');
    } else {
      const next = caseIdx + 1;
      setCaseIdx(next);
      loadRound(next);
    }
  };

  const RUNNER_POSITIONS = ['6%', '34%', '66%', '92%'];

  return (
    <div
      data-testid="game-toadette-due-process"
      className="bg-[#0f172a] text-white rounded-3xl border-4 border-slate-950 shadow-[6px_6px_0_#000] overflow-hidden select-none"
    >
      <div className="bg-slate-950 px-4 py-3 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-pink-400 border-2 border-black flex items-center justify-center text-slate-950 shrink-0 shadow-[0_2px_0_#000]">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-pink-300 font-mario block">
              PROCEDURAL SEQUENCE BUILDER
            </span>
            <h2 className="text-sm sm:text-lg font-black font-display text-white">
              TOADETTE&apos;S TWIN-NOTICE RELAY
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-mono tabular-nums">
          <div className="bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
            <span className="text-slate-400 mr-1">CASE</span>
            <strong className="text-amber-300">
              {caseIdx + 1}/{relayDeck.length}
            </strong>
          </div>
          <div className="bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
            <span className="text-slate-400 mr-1">ERRORS</span>
            <strong className="text-rose-400">{mistakes}/4</strong>
          </div>
          <div className="bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
            <span className="text-slate-400 mr-1">SCORE</span>
            <strong className="text-emerald-400">{score}</strong>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 min-h-[340px] flex flex-col justify-between gap-4 bg-gradient-to-b from-[#1e293b] to-[#0f172a]">
        {phase === 'TITLE' && (
          <div className="my-auto text-center max-w-xl mx-auto space-y-4 py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-400 border-3 border-black shadow-[0_4px_0_#000] mx-auto">
              <MarioCharacterAvatar character={equippedAvatar} className="w-11 h-11" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display text-white">
              Sequence Statutory Due Process Without Nominal Damages!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sprint through the Olympic relay track! Tap the 3 procedural steps in strict chronological legal order (Step 1 → Step 2 → Step 3) across Just Cause, Authorized Cause, Disease, Abandonment, and Preventive Suspension dockets!
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-7 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm font-mario border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START RELAY DOCKET</span>
            </button>
          </div>
        )}

        {phase === 'PLAYING' && (
          <div className="space-y-4">
            {/* Visual Olympic Relay Running Track Arena */}
            <div className="relative rounded-2xl border-3 border-slate-950 bg-gradient-to-b from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-3 sm:p-4 overflow-hidden shadow-inner">
              {/* Distance Markers & Baton HUD */}
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-200 pb-2 border-b border-red-800/80">
                <span>0m START</span>
                <span>30m NOTICE 1 (NTE)</span>
                <span>65m HEARING / EXPLAIN</span>
                <span>100m DECISION (FINISH)</span>
              </div>

              {/* Running Lanes Stage */}
              <div className="relative my-4 h-16 sm:h-20 bg-red-950/80 rounded-xl border-2 border-red-700/60 flex items-center overflow-hidden">
                {/* Lane Stripe Dividers */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-dashed border-white/30" />

                {/* 3 Relay Checkpoint Flags */}
                <div className="absolute left-[34%] -translate-x-1/2 flex flex-col items-center">
                  <div className={`w-3.5 h-3.5 rounded-full border border-black ${pickedOrder.length >= 1 ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                  <span className="text-[8px] font-mono text-amber-200 mt-0.5">CHECK 1</span>
                </div>
                <div className="absolute left-[66%] -translate-x-1/2 flex flex-col items-center">
                  <div className={`w-3.5 h-3.5 rounded-full border border-black ${pickedOrder.length >= 2 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-[8px] font-mono text-amber-200 mt-0.5">CHECK 2</span>
                </div>
                <div className="absolute right-2 flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border border-black flex items-center justify-center ${pickedOrder.length >= 3 ? 'bg-amber-400' : 'bg-slate-700'}`}>
                    <Flag className="w-2.5 h-2.5 text-slate-950" />
                  </div>
                  <span className="text-[8px] font-mono text-amber-200 mt-0.5">FINISH</span>
                </div>

                {/* Animated Toadette Runner with Golden Baton */}
                <div
                  className={`absolute -translate-x-1/2 transition-all duration-500 flex items-center gap-1 z-10 ${
                    runnerState === 'stumble' ? 'animate-bounce' : runnerState === 'sprint' ? 'scale-110' : ''
                  }`}
                  style={{ left: RUNNER_POSITIONS[pickedOrder.length] }}
                >
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-pink-500 border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
                    <MarioCharacterAvatar character="toadette" className="w-8 h-8 sm:w-10 sm:h-10" />
                    {/* Glowing Golden Baton */}
                    <div className="absolute -right-1.5 -top-1 w-3.5 h-6 bg-amber-300 rounded-sm border border-black shadow-[0_0_8px_rgba(251,191,36,0.9)] rotate-12 flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-slate-950 animate-spin" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Baton Relay Status Ticker */}
              <div className="text-center">
                <span className="text-[10px] font-mario uppercase px-3 py-1 rounded-full bg-black/60 border border-amber-400/50 text-amber-300 inline-block">
                  {pickedOrder.length === 0
                    ? 'BATON AT START BLOCKS · SELECT STEP 1'
                    : pickedOrder.length === 1
                    ? 'BATON HANDOFF 1 COMPLETE → SELECT STEP 2'
                    : pickedOrder.length === 2
                    ? 'BATON HANDOFF 2 COMPLETE → SELECT FINAL STEP 3'
                    : 'DUE PROCESS FINISH LINE CROSSED!'}
                </span>
              </div>
            </div>

            {/* Case Dossier Header */}
            <div className="bg-white text-slate-950 rounded-2xl p-4 border-3 border-black shadow-[3px_3px_0_#000] space-y-1">
              <span className="text-[10px] font-black uppercase text-pink-700 font-mono block">
                {activeCase.statute}
              </span>
              <h3 className="text-base sm:text-lg font-black font-display">{activeCase.title}</h3>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">{activeCase.scenario}</p>
            </div>

            {/* Step Progress Slots */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              {[0, 1, 2].map((slot) => {
                const done = pickedOrder.length > slot;
                return (
                  <div
                    key={slot}
                    className={`py-2 px-2 rounded-xl border font-bold ${
                      done
                        ? 'bg-emerald-500 text-slate-950 border-black shadow-[0_2px_0_#000]'
                        : pickedOrder.length === slot
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400 animate-pulse'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    {done ? `STEP ${slot + 1} LOCKED` : `SELECT STEP ${slot + 1}`}
                  </div>
                );
              })}
            </div>

            {/* Clickable Procedural Step Cards */}
            {!roundCleared && (
              <div className="space-y-2.5">
                {shuffledPool.map((item) => {
                  const selectedRank = pickedOrder.indexOf(item.stepIdx);
                  const isSelected = selectedRank !== -1;
                  return (
                    <button
                      key={item.stepIdx}
                      type="button"
                      disabled={isSelected}
                      onClick={() => handleSelectStep(item.stepIdx)}
                      className={`w-full min-h-[52px] text-left p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200 cursor-default'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-amber-400 text-white cursor-pointer active:translate-y-0.5'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-bold leading-snug">{item.text}</span>
                      <span className="shrink-0 font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700">
                        {isSelected ? `#${selectedRank + 1}` : 'TAP'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Rich Statutory Learning Card on Cleared Docket */}
            {roundCleared && (
              <ArcadeDoctrineCard
                title={activeCase.title}
                statute={activeCase.statute}
                rule={activeCase.orderedSteps.map((s, i) => `Step ${i + 1}: ${s}`).join(' → ')}
                takeaway={activeCase.doctrineNote}
                isCorrect={true}
                speedBonusAwarded={speedBonusAwarded}
                worldCode="w5"
                scenarioText={activeCase.scenario}
                chosenAnswerText="Flawless Due Process Sequence"
                correctAnswerText={activeCase.orderedSteps.join(' → ')}
                advanceLabel={caseIdx + 1 >= relayDeck.length ? 'Finish Relay Championship' : 'Next Relay Docket →'}
                onAdvance={handleNextCase}
              />
            )}
          </div>
        )}

        {(phase === 'VICTORY' || phase === 'GAME_OVER') && (
          <div className="my-auto text-center max-w-md mx-auto space-y-4 py-4">
            <h3 className="text-xl sm:text-2xl font-black font-display text-amber-300">
              {phase === 'VICTORY'
                ? 'ALL 5 DUE PROCESS DOCKETS MASTERED!'
                : 'PROCEDURAL DEFECT LIMIT REACHED!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Final Score: <strong className="font-mono text-emerald-400">{score}</strong> · Cases Cleared:{' '}
              <strong className="font-mono text-amber-300">
                {phase === 'VICTORY' ? relayDeck.length : caseIdx}/{relayDeck.length}
              </strong>
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm font-mario border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 3. SHY GUY'S WAGE & D.O. 174 CONVEYOR — Real-Time Factory Belt Inspector
// ============================================================================
export interface ShyGuyConveyorCrate {
  id: string;
  title: string;
  spec: string;
  isCompliant: boolean;
  basis: string;
}

export const SHY_GUY_CONVEYOR_BANK: ShyGuyConveyorCrate[] = [
  {
    id: 'sg1',
    title: 'Independent Contractor (P6M Paid-Up Capital)',
    spec: 'Exercises full control over means & methods of janitorial staff with specialized tools.',
    isCompliant: true,
    basis: 'DOLE D.O. No. 174-17 (Threshold >= P5,000,000)',
  },
  {
    id: 'sg2',
    title: 'In-House Cooperative Staffing Core Line',
    spec: 'Agency owned by HR officers supplying assembly workers controlled by principal.',
    isCompliant: false,
    basis: 'D.O. 174-17 Sec. 5–6 (Prohibited In-House & Labor-Only Contracting)',
  },
  {
    id: 'sg3',
    title: 'Pineda Wage Distortion Adjustment',
    spec: '(Minimum Wage / Actual Salary) × Prescribed Increase added to preserve pay hierarchy.',
    isCompliant: true,
    basis: 'Art. 124, Labor Code · Pineda Formula',
  },
  {
    id: 'sg4',
    title: 'Payment of Wages via Supermarket Vouchers',
    spec: 'Factory pays 50% of rank-and-file weekly wages in store chits and tokens.',
    isCompliant: false,
    basis: 'Art. 102, Labor Code (Legal Tender Mandate)',
  },
  {
    id: 'sg5',
    title: 'Bi-Weekly Payroll Every 15th & 30th',
    spec: 'Wages paid in legal tender at intervals not exceeding 16 days.',
    isCompliant: true,
    basis: 'Art. 103, Labor Code',
  },
  {
    id: 'sg6',
    title: 'Unilateral Withdrawal of 10-Year Rice Subsidy',
    spec: 'Company cancels long-standing monthly rice allowance citing reorganization.',
    isCompliant: false,
    basis: 'Art. 100, Labor Code (Non-Diminution of Benefits)',
  },
  {
    id: 'sg7',
    title: 'Union Dues Check-Off With Individual Authorization',
    spec: 'Employer deducts monthly union dues backed by signed written authorization.',
    isCompliant: true,
    basis: 'Art. 113(b) & Art. 250(o), Labor Code',
  },
  {
    id: 'sg8',
    title: 'Withholding Final Pay to Force Quitclaim',
    spec: 'HR refuses to release earned wages unless resigned worker waives all NLRC claims.',
    isCompliant: false,
    basis: 'Art. 116, Labor Code (Unlawful Withholding of Wages)',
  },
];

export const ShyGuyWageOrderFactoryGame: React.FC<BonusVaultGameProps> = ({
  equippedAvatar,
  onEarnCoins,
}) => {
  const [phase, setPhase] = useState<ArcadePhase>('TITLE');
  const [crates, setCrates] = useState<ShyGuyConveyorCrate[]>([]);
  const [crateIdx, setCrateIdx] = useState(0);
  const [beltProgress, setBeltProgress] = useState(0); // 0 to 100% across conveyor
  const [hp, setHp] = useState(3);
  const [score, setScore] = useState(0);
  const [speedBonusAwarded, setSpeedBonusAwarded] = useState(false);
  const [verdict, setVerdict] = useState<{
    certifyCompliant: boolean;
    isCorrect: boolean;
    crate: ShyGuyConveyorCrate;
  } | null>(null);
  const [actionState, setActionState] = useState<'idle' | 'stamp' | 'crush' | 'timeout'>('idle');
  const lastFrameRef = useRef<number>(0);

  const startGame = useCallback(() => {
    const freshCrates: ShyGuyConveyorCrate[] = drawWageFactoryPackages(8).map((p) => ({
      id: p.id,
      title: p.label,
      spec: p.detail,
      isCompliant: p.verdict === 'lawful',
      basis: p.ruleNote,
    }));
    setCrates(freshCrates);
    setCrateIdx(0);
    setBeltProgress(8);
    setHp(3);
    setScore(0);
    setSpeedBonusAwarded(false);
    setVerdict(null);
    setActionState('idle');
    setPhase('PLAYING');
    marioAudio.playPowerUp();
  }, []);

  const totalCratesInShift = crates.length || 8;
  const currentCrate = crates[crateIdx] || SHY_GUY_CONVEYOR_BANK[0];

  const inspectCrate = useCallback(
    (certifyCompliant: boolean) => {
      if (phase !== 'PLAYING' || !currentCrate || verdict !== null) return;
      const ok = certifyCompliant === currentCrate.isCompliant;
      if (ok) {
        setScore((s) => s + 125);
        const isFast = beltProgress <= 55;
        let coins = 2;
        if (isFast) {
          coins += 5;
          setSpeedBonusAwarded(true);
        }
        onEarnCoins(coins);
        setActionState(certifyCompliant ? 'stamp' : 'crush');
        marioAudio.playCoin();
      } else {
        const nextHp = hp - 1;
        setHp(nextHp);
        setActionState('timeout');
        marioAudio.playStomp();
      }
      setVerdict({
        certifyCompliant,
        isCorrect: ok,
        crate: currentCrate,
      });
    },
    [phase, currentCrate, verdict, hp, onEarnCoins, beltProgress]
  );

  const handleNextCrate = useCallback(() => {
    if (!verdict) return;
    if (hp <= 0) {
      setPhase('GAME_OVER');
      return;
    }
    if (crateIdx + 1 >= totalCratesInShift) {
      onEarnCoins(10);
      marioAudio.playQuizComplete();
      setPhase('VICTORY');
      return;
    }
    setCrateIdx((i) => i + 1);
    setBeltProgress(6);
    setSpeedBonusAwarded(false);
    setVerdict(null);
    setActionState('idle');
  }, [verdict, hp, crateIdx, totalCratesInShift, onEarnCoins]);

  // Smooth clamped conveyor progress (paused when inspecting doctrine card)
  useEffect(() => {
    if (phase !== 'PLAYING' || verdict !== null) return;
    let rafId = 0;
    lastFrameRef.current = performance.now();

    const tick = (now: number) => {
      const rawDt = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;
      const dt = Math.min(rawDt, 0.05);
      setBeltProgress((prev) => {
        const next = prev + dt * 8.5; // ~12s across full conveyor
        if (next >= 100) {
          const nextHp = hp - 1;
          setHp(nextHp);
          setActionState('timeout');
          marioAudio.playStomp();
          setVerdict({
            certifyCompliant: false,
            isCorrect: false,
            crate: currentCrate,
          });
          return 95;
        }
        return next;
      });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [phase, verdict, hp, currentCrate]);

  return (
    <div
      data-testid="game-shy-guy-conveyor"
      className="bg-[#0f172a] text-white rounded-3xl border-4 border-slate-950 shadow-[6px_6px_0_#000] overflow-hidden select-none"
    >
      <div className="bg-slate-950 px-4 py-3 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-400 border-2 border-black flex items-center justify-center text-slate-950 shrink-0 shadow-[0_2px_0_#000]">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 font-mario block">
              DOLE FACTORY CONVEYOR AUDIT
            </span>
            <h2 className="text-sm sm:text-lg font-black font-display text-white">
              SHY GUY&apos;S WAGE &amp; D.O. 174 CONVEYOR
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1" aria-label={`Vitality: ${hp} of 3 hearts`}>
            {[0, 1, 2].map((i) => (
              <Heart
                key={i}
                className={`w-5 h-5 ${
                  i < hp ? 'text-rose-500 fill-rose-500' : 'text-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="bg-slate-900 px-3 py-1 rounded-xl border border-slate-700 text-xs font-mono tabular-nums">
            <span className="text-slate-400 mr-1">CRATE</span>
            <strong className="text-amber-300">
              {Math.min(SHY_GUY_CONVEYOR_BANK.length, crateIdx + 1)}/{SHY_GUY_CONVEYOR_BANK.length}
            </strong>
          </div>
          <div className="bg-slate-900 px-3 py-1 rounded-xl border border-slate-700 text-xs font-mono tabular-nums">
            <span className="text-slate-400 mr-1">SCORE</span>
            <strong className="text-emerald-400">{score}</strong>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 min-h-[340px] flex flex-col justify-between gap-4 bg-gradient-to-b from-[#1e293b] to-[#0f172a]">
        {phase === 'TITLE' && (
          <div className="my-auto text-center max-w-xl mx-auto space-y-4 py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-400 border-3 border-black shadow-[0_4px_0_#000] mx-auto">
              <MarioCharacterAvatar character={equippedAvatar} className="w-11 h-11" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display text-white">
              Inspect Moving Payroll &amp; Contracting Crates Before the Exit Gate!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Crates travel across Shy Guy&apos;s factory belt in real time. Stamp compliant P5M D.O. 174 contractors, Pineda formulas, and legal tender payrolls as{' '}
              <strong className="text-emerald-300">Compliant</strong>, and crush labor-only or benefit-diminution crates before they cross into the production floor!
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-7 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm font-mario border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START CONVEYOR AUDIT</span>
            </button>
          </div>
        )}

        {phase === 'PLAYING' && currentCrate && (
          <div className="space-y-4">
            {/* Visual Steampunk Factory Stage */}
            <div className="relative rounded-2xl border-3 border-slate-950 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0b1120] p-4 overflow-hidden shadow-inner">
              {/* Overhead Catwalk with Hardhat Shy Guy Inspector */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-600 border border-black flex items-center justify-center shadow-sm">
                    <MarioCharacterAvatar character="shyguy" className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mario text-amber-300 uppercase block">INSPECTOR SHY GUY</span>
                    <span className="text-[9px] text-slate-400">DOLE Compliance Officer</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-300 font-bold tabular-nums">
                    BELT SPEED: NORMAL · {Math.round(beltProgress)}%
                  </span>
                </div>
              </div>

              {/* Overhead Hydraulic Stamp & Industrial Crusher Apparatus */}
              <div className="relative h-28 my-3 rounded-xl bg-slate-950/80 border-2 border-slate-800 flex items-center overflow-hidden">
                {/* Rolling Conveyor Surface */}
                <div className="absolute inset-x-0 bottom-0 h-7 bg-slate-900 border-t-2 border-slate-700 flex items-center justify-around overflow-hidden">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="w-2.5 h-full border-r border-slate-800 bg-slate-800/60" />
                  ))}
                </div>

                {/* Left Overhead Stamp */}
                <div className="absolute left-[30%] -translate-x-1/2 top-1 flex flex-col items-center">
                  <div className={`w-10 h-7 rounded-t-lg bg-emerald-950 border-2 border-emerald-500/60 flex items-center justify-center transition-all ${
                    actionState === 'stamp' ? 'translate-y-4 bg-emerald-600 border-emerald-300' : ''
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  </div>
                  <span className="text-[7px] font-mono font-bold text-emerald-400 uppercase mt-0.5">DOLE STAMP</span>
                </div>

                {/* Right Overhead Crusher */}
                <div className="absolute left-[70%] -translate-x-1/2 top-1 flex flex-col items-center">
                  <div className={`w-10 h-7 rounded-t-lg bg-rose-950 border-2 border-rose-500/60 flex items-center justify-center transition-all ${
                    actionState === 'crush' ? 'translate-y-4 bg-rose-600 border-rose-300' : ''
                  }`}>
                    <XCircle className="w-4 h-4 text-rose-300" />
                  </div>
                  <span className="text-[7px] font-mono font-bold text-rose-400 uppercase mt-0.5">CRUSHER</span>
                </div>

                {/* Moving Heavy Wooden Crate */}
                <div
                  className="absolute bottom-6 transition-all duration-150 flex flex-col items-center -translate-x-1/2"
                  style={{ left: `${Math.min(92, Math.max(8, beltProgress))}%` }}
                >
                  <div className={`relative px-3 py-1.5 rounded-lg border-2 border-black flex items-center justify-center shadow-lg transition-transform ${
                    actionState === 'stamp'
                      ? 'bg-emerald-400 text-slate-950 scale-110 shadow-[0_0_15px_rgba(52,211,153,0.8)]'
                      : actionState === 'crush'
                      ? 'bg-rose-600 text-white scale-90 rotate-6 shadow-[0_0_15px_rgba(244,63,94,0.8)]'
                      : 'bg-amber-400 text-slate-950'
                  }`}>
                    <span className="text-[10px] font-black font-mono whitespace-nowrap">
                      CRATE #{crateIdx + 1}
                    </span>
                    {actionState === 'stamp' && (
                      <div className="absolute inset-0 rounded-lg border-2 border-emerald-300 bg-emerald-400/40 animate-ping" />
                    )}
                  </div>
                </div>
              </div>

              {/* Conveyor Belt Positions */}
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 px-1">
                <span>0% CHUTE INTAKE</span>
                <span className="text-amber-300 font-bold uppercase">CONVEYOR AUDIT LANE</span>
                <span className="text-rose-400">100% FACTORY GATE</span>
              </div>
            </div>

            {/* Crate Inspection Dossier */}
            <div className="bg-white text-slate-950 rounded-2xl p-4 sm:p-5 border-3 border-black shadow-[4px_4px_0_#000] space-y-1.5">
              <span className="text-[10px] font-black uppercase text-emerald-700 font-mono block">
                DOLE INSPECTION DOCKET #{crateIdx + 1} OF {totalCratesInShift}
              </span>
              <h3 className="text-base sm:text-xl font-black font-display text-slate-950">
                {currentCrate.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                {currentCrate.spec}
              </p>
            </div>

            {/* Interactive Inspection Buttons / Doctrine Takeaway */}
            {verdict === null ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => inspectCrate(true)}
                  className="min-h-[54px] px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center justify-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>CERTIFY COMPLIANT (DOLE ACCREDITED)</span>
                </button>
                <button
                  type="button"
                  onClick={() => inspectCrate(false)}
                  className="min-h-[54px] px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center justify-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
                >
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>BUST DOLE VIOLATION (LABOR-ONLY TRAP)</span>
                </button>
              </div>
            ) : (
              <ArcadeDoctrineCard
                title={currentCrate.title}
                statute={currentCrate.basis}
                rule={currentCrate.spec}
                takeaway={
                  currentCrate.isCompliant
                    ? `Compliant with Labor Standards: The contractor possesses substantial capital (>= ₱5,000,000 paid-up capital) and exercises direct control over the means and methods of work without principal interference.`
                    : `Prohibited Labor Trap: Violates mandatory statutory rules (labor-only contracting, unauthorized deduction, or illegal benefit diminution under Art. 100). Controlling Basis: ${currentCrate.basis}`
                }
                isCorrect={verdict.isCorrect}
                speedBonusAwarded={speedBonusAwarded}
                worldCode="w2"
                scenarioText={currentCrate.spec}
                chosenAnswerText={verdict.certifyCompliant ? 'Certified as Lawful & Compliant' : 'Busted as Prohibited DOLE Violation'}
                correctAnswerText={currentCrate.isCompliant ? 'Certify: Compliant' : 'Bust: Prohibited Practice'}
                advanceLabel={crateIdx + 1 >= totalCratesInShift ? 'Complete Factory Shift' : 'Inspect Next Crate →'}
                onAdvance={handleNextCrate}
              />
            )}
          </div>
        )}

        {(phase === 'VICTORY' || phase === 'GAME_OVER') && (
          <div className="my-auto text-center max-w-md mx-auto space-y-4 py-4">
            <h3 className="text-xl sm:text-2xl font-black font-display text-amber-300">
              {phase === 'VICTORY' ? 'FACTORY AUDIT 100% COMPLETE!' : 'UNINSPECTED VIOLATIONS PASSED!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Final Audit Score: <strong className="font-mono text-emerald-400">{score}</strong>
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm font-mario border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 4. KAMEK'S STATUTORY DEADLINES DUEL — Spell-Shield Prescriptive Battle
// ============================================================================
export interface KamekDeadlineSpell {
  id: string;
  spellTitle: string;
  claimPrompt: string;
  options: [string, string, string, string];
  correctAnswer: string;
  basis: string;
}

export const KAMEK_DEADLINE_SPELLS: KamekDeadlineSpell[] = [
  {
    id: 'km1',
    spellTitle: 'Hex of Unfair Labor Practice',
    claimPrompt: 'Within what statutory period must an Unfair Labor Practice (ULP) complaint be filed?',
    options: ['1 Year', '3 Years', '4 Years', '6 Months'],
    correctAnswer: '1 Year',
    basis: 'Art. 305, Labor Code (1 year from accrual of ULP)',
  },
  {
    id: 'km2',
    spellTitle: 'Curse of Unpaid Overtime & SIL',
    claimPrompt: 'What is the prescriptive period for pure Labor Standards money claims (OT, Holiday, SIL)?',
    options: ['1 Year', '3 Years', '4 Years', '10 Years'],
    correctAnswer: '3 Years',
    basis: 'Art. 306, Labor Code (3 years from cause of action)',
  },
  {
    id: 'km3',
    spellTitle: 'Beam of Illegal Dismissal',
    claimPrompt: 'Within what period must an Illegal Dismissal action (injury to rights) be instituted?',
    options: ['1 Year', '3 Years', '4 Years', '5 Years'],
    correctAnswer: '4 Years',
    basis: 'Art. 1146, Civil Code · Callanta v. Carnation Phils.',
  },
  {
    id: 'km4',
    spellTitle: 'Vortex of Unremitted SSS Contributions',
    claimPrompt: 'What is the prescriptive period for criminal/collection actions on unremitted SSS contributions?',
    options: ['3 Years', '4 Years', '10 Years', '20 Years'],
    correctAnswer: '20 Years',
    basis: 'R.A. No. 11199 (Social Security Act of 2018)',
  },
  {
    id: 'km5',
    spellTitle: 'Chrono Seal of NLRC Appeal',
    claimPrompt: 'Within how many days from receipt of a Labor Arbiter decision must an appeal to NLRC be perfected?',
    options: ['5 Calendar Days', '10 Calendar Days', '15 Working Days', '30 Calendar Days'],
    correctAnswer: '10 Calendar Days',
    basis: 'Art. 229, Labor Code (Extendible to next working day if Day 10 is Sat/Sun/Holiday)',
  },
  {
    id: 'km6',
    spellTitle: 'Phantom Off-Detail Spell',
    claimPrompt: 'What is the maximum lawful period of bona fide floating status / suspension of operations?',
    options: ['30 Days', '3 Months', '6 Months', '1 Year'],
    correctAnswer: '6 Months',
    basis: 'Art. 301, Labor Code',
  },
  {
    id: 'km7',
    spellTitle: 'Solo Parent Shield Rune',
    claimPrompt: 'Under R.A. 11861, what minimum service qualifies a Solo Parent for 7-day paid parental leave?',
    options: ['3 Months', '6 Months', '1 Year', '2 Years'],
    correctAnswer: '6 Months',
    basis: 'R.A. No. 11861 (Expanded Solo Parents Welfare Act)',
  },
  {
    id: 'km8',
    spellTitle: 'Maternity Recovery Enchantment',
    claimPrompt: 'How many paid days are granted for live childbirth to a solo-parent female worker under R.A. 11210?',
    options: ['60 Days', '98 Days', '105 Days', '120 Days'],
    correctAnswer: '120 Days',
    basis: 'R.A. No. 11210 (105 days standard + 15 days solo parent = 120 days)',
  },
];

export const KamekDeadlineSpellbookGame: React.FC<BonusVaultGameProps> = ({
  equippedAvatar,
  onEarnCoins,
}) => {
  const [phase, setPhase] = useState<ArcadePhase>('TITLE');
  const [spells, setSpells] = useState<KamekDeadlineSpell[]>([]);
  const [spellIdx, setSpellIdx] = useState(0);
  const [heroHp, setHeroHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [score, setScore] = useState(0);
  const [lastLog, setLastLog] = useState<string | null>(null);
  const [duelEffect, setDuelEffect] = useState<'idle' | 'reflect' | 'hex_hit'>('idle');
  const [pickedOption, setPickedOption] = useState<string | null>(null);
  const [spellStartTime, setSpellStartTime] = useState<number>(() => Date.now());
  const [speedBonusAwarded, setSpeedBonusAwarded] = useState<boolean>(false);
  const [verdict, setVerdict] = useState<{
    isHit: boolean;
    selectedOption: string;
    spell: KamekDeadlineSpell;
  } | null>(null);

  const startGame = () => {
    const freshSpells: KamekDeadlineSpell[] = drawKamekSpells(8).map((s) => ({
      id: s.id,
      spellTitle: s.spellName,
      claimPrompt: s.prompt,
      options: s.options,
      correctAnswer: s.options[s.correctIdx],
      basis: s.citation,
    }));
    setSpells(freshSpells);
    setSpellIdx(0);
    setHeroHp(100);
    setBossHp(100);
    setScore(0);
    setLastLog(null);
    setDuelEffect('idle');
    setPickedOption(null);
    setVerdict(null);
    setSpellStartTime(Date.now());
    setSpeedBonusAwarded(false);
    setPhase('PLAYING');
    marioAudio.playPowerUp();
  };

  const activeSpell = spells[spellIdx] || KAMEK_DEADLINE_SPELLS[0];

  const handleCastShield = (selected: string) => {
    if (phase !== 'PLAYING' || !activeSpell || pickedOption !== null) return;
    setPickedOption(selected);
    const isHit = selected === activeSpell.correctAnswer;
    const isFast = Date.now() - spellStartTime <= 8000;

    if (isHit) {
      setDuelEffect('reflect');
      marioAudio.playPowerUp();
      const nextBoss = Math.max(0, bossHp - 25);
      setBossHp(nextBoss);
      setScore((s) => s + 150);
      let coins = 3;
      if (isFast) {
        coins += 5;
        setSpeedBonusAwarded(true);
      }
      onEarnCoins(coins);
      setLastLog(isFast ? `+5 SPEED BONUS! REFLECTED! ${activeSpell.correctAnswer} · ${activeSpell.basis}` : `REFLECTED! ${activeSpell.correctAnswer} · ${activeSpell.basis}`);
      marioAudio.playCoin();
    } else {
      setDuelEffect('hex_hit');
      marioAudio.playStomp();
      const nextHero = Math.max(0, heroHp - 35);
      setHeroHp(nextHero);
      setLastLog(`HEX BREACHED SHIELD! Correct Rune: ${activeSpell.correctAnswer} (${activeSpell.basis})`);
    }

    setVerdict({
      isHit,
      selectedOption: selected,
      spell: activeSpell,
    });
  };

  const handleNextSpell = useCallback(() => {
    if (!verdict) return;
    if (heroHp <= 0) {
      setPhase('GAME_OVER');
      return;
    }
    if (bossHp <= 0 || spellIdx + 1 >= spells.length) {
      onEarnCoins(12);
      marioAudio.playQuizComplete();
      setPhase('VICTORY');
      return;
    }
    setSpellIdx((i) => i + 1);
    setPickedOption(null);
    setVerdict(null);
    setSpellStartTime(Date.now());
    setSpeedBonusAwarded(false);
    setDuelEffect('idle');
  }, [verdict, heroHp, bossHp, spellIdx, spells.length, onEarnCoins]);

  const GRIMOIRE_THEMES = [
    { border: 'border-rose-400', bg: 'bg-rose-950/80', rune: 'text-rose-400', badge: 'bg-rose-500' },
    { border: 'border-cyan-400', bg: 'bg-cyan-950/80', rune: 'text-cyan-400', badge: 'bg-cyan-500' },
    { border: 'border-amber-400', bg: 'bg-amber-950/80', rune: 'text-amber-400', badge: 'bg-amber-500' },
    { border: 'border-purple-400', bg: 'bg-purple-950/80', rune: 'text-purple-400', badge: 'bg-purple-500' },
  ];

  return (
    <div
      data-testid="game-kamek-deadlines"
      className="bg-[#0b0c1b] text-white rounded-3xl border-4 border-slate-950 shadow-[6px_6px_0_#000] overflow-hidden select-none"
    >
      {/* Header HUD */}
      <div className="bg-[#12132e] px-4 py-3 border-b-2 border-purple-900/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-500 border-2 border-black flex items-center justify-center text-slate-950 shrink-0 shadow-[0_3px_0_#000]">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-purple-300 font-mario block tracking-wider">
              PRESCRIPTIVE SPELL-SHIELD DUEL
            </span>
            <h2 className="text-sm sm:text-lg font-black font-display text-white">
              KAMEK&apos;S STATUTORY DEADLINES DUEL
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
          <div className="bg-slate-950/90 px-3 py-1.5 rounded-xl border border-emerald-500/40">
            <span className="text-slate-400 mr-1.5 font-bold">HERO HP</span>
            <strong className="text-emerald-400 font-black">{heroHp}%</strong>
          </div>
          <div className="bg-slate-950/90 px-3 py-1.5 rounded-xl border border-purple-500/40">
            <span className="text-slate-400 mr-1.5 font-bold">KAMEK HP</span>
            <strong className="text-purple-300 font-black">{bossHp}%</strong>
          </div>
          <div className="bg-slate-950/90 px-3 py-1.5 rounded-xl border border-amber-500/40">
            <span className="text-slate-400 mr-1.5 font-bold">SCORE</span>
            <strong className="text-amber-300 font-black">{score}</strong>
          </div>
        </div>
      </div>

      {/* Main Duel Stage Arena */}
      <div className="p-4 sm:p-6 min-h-[360px] flex flex-col justify-between gap-4 bg-gradient-to-b from-[#1c163b] via-[#110e28] to-[#070514]">
        {phase === 'TITLE' && (
          <div className="my-auto text-center max-w-xl mx-auto space-y-4 py-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-purple-950/80 border-3 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.4)] mx-auto">
              <Wand2 className="w-10 h-10 text-purple-300 animate-pulse" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display text-white">
              Deflect Magikoopa Kamek&apos;s Time-Bar Hexes!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto font-medium">
              Match each incoming labor dispute or statutory notice spell to its exact prescriptive period (1 Yr ULP, 3 Yrs Money Claims, 4 Yrs Illegal Dismissal, 20 Yrs SSS, 10d NLRC Appeal) to reflect Kamek&apos;s spells and drain his Boss HP!
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-8 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm font-mario border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START SPELL DUEL</span>
            </button>
          </div>
        )}

        {phase === 'PLAYING' && activeSpell && (
          <div className="space-y-4">
            {/* Visual Spell Arena with Animated Hero & Kamek */}
            <div className="relative rounded-2xl border-2 border-purple-500/40 bg-gradient-to-b from-[#1f1742] to-[#0d0920] p-4 sm:p-5 overflow-hidden">
              {/* Dual Combatant Stages */}
              <div className="flex items-center justify-between gap-3 relative z-10">
                {/* Left: Counsel Hero with Mirror Shield */}
                <div className="flex items-center gap-3">
                  <div className={`relative w-14 h-14 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.4)] ${
                    duelEffect === 'hex_hit' ? 'animate-bounce bg-rose-950 border-rose-500' : ''
                  }`}>
                    <MarioCharacterAvatar character={equippedAvatar} className="w-10 h-10" />
                    {duelEffect === 'reflect' && (
                      <div className="absolute inset-0 bg-amber-400/40 rounded-2xl border-2 border-amber-300 animate-ping" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mario text-emerald-300 uppercase block">COUNSEL HERO</span>
                    <span className="text-xs font-mono font-bold text-slate-300">Codal Shield Active</span>
                  </div>
                </div>

                {/* Center: Flying Geometric Hex Projectile */}
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${
                    duelEffect === 'reflect'
                      ? 'bg-amber-400 border-yellow-300 text-slate-950 scale-125 rotate-180 shadow-[0_0_20px_rgba(251,191,36,0.9)]'
                      : duelEffect === 'hex_hit'
                      ? 'bg-rose-600 border-rose-400 text-white scale-125'
                      : 'bg-purple-900/80 border-purple-400 text-purple-200 animate-pulse'
                  }`}>
                    {duelEffect === 'reflect' ? (
                      <Sparkles className="w-6 h-6 animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-[9px] font-mono font-bold text-purple-300 uppercase">
                    {duelEffect === 'reflect' ? 'REFLECTED!' : duelEffect === 'hex_hit' ? 'SHIELD BREACH' : 'INCOMING HEX'}
                  </span>
                </div>

                {/* Right: Magikoopa Kamek */}
                <div className="flex items-center gap-3 flex-row-reverse sm:flex-row">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-mario text-purple-300 uppercase block">MAGIKOOPA KAMEK</span>
                    <span className="text-xs font-mono font-bold text-slate-300">Broomstick Hexer</span>
                  </div>
                  <div className={`relative w-14 h-14 rounded-2xl bg-purple-950/80 border-2 border-purple-400 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] ${
                    duelEffect === 'reflect' ? 'animate-bounce bg-rose-950 border-rose-500' : ''
                  }`}>
                    <Wand2 className="w-8 h-8 text-purple-300" />
                  </div>
                </div>
              </div>

              {/* Incoming Claim Statement */}
              <div className="mt-4 pt-3 border-t border-purple-800/40 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
                  HEX #{spellIdx + 1}: {activeSpell.spellTitle}
                </span>
                <p className="text-sm sm:text-base font-extrabold text-white leading-snug">
                  {activeSpell.claimPrompt}
                </p>
              </div>
            </div>

            {/* 4 Ancient Grimoire Spell Tomes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeSpell.options.map((opt, i) => {
                const gr = GRIMOIRE_THEMES[i % GRIMOIRE_THEMES.length];
                const isSelected = pickedOption === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={pickedOption !== null}
                    onClick={() => handleCastShield(opt)}
                    className={`min-h-[64px] p-3.5 rounded-2xl border-3 text-left transition-all cursor-pointer relative overflow-hidden shadow-[0_4px_0_#000] active:translate-y-0.5 ${
                      pickedOption === null
                        ? `${gr.bg} ${gr.border} hover:bg-purple-900/70 hover:border-amber-400 text-white`
                        : isSelected && opt === activeSpell.correctAnswer
                        ? 'bg-emerald-500 text-slate-950 border-black shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                        : isSelected
                        ? 'bg-rose-600 text-white border-black'
                        : 'bg-slate-900/40 text-slate-500 border-slate-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${gr.badge} border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]`}>
                        <BookOpen className="w-5 h-5 text-slate-950" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75">
                          GRIMOIRE RUNIC SEAL #{i + 1}
                        </span>
                        <span className="text-sm sm:text-base font-mono font-black block">
                          {opt}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Duel Battle Log or High-Yield Takeaway Card */}
            {verdict === null ? (
              lastLog && (
                <div className="rounded-xl px-4 py-2.5 bg-slate-950/95 border border-purple-400/60 text-xs font-mono font-bold text-amber-300 shadow-inner">
                  {lastLog}
                </div>
              )
            ) : (
              <ArcadeDoctrineCard
                title={activeSpell.spellTitle}
                statute={activeSpell.basis}
                rule={`${activeSpell.claimPrompt} → Controlling Prescription: ${activeSpell.correctAnswer}`}
                takeaway={`Statutory Prescription Memory Peg: Under ${activeSpell.basis}, this action must be instituted within ${activeSpell.correctAnswer}. Remember the Bar hierarchy: 1 Year for ULP (Art. 305), 3 Years for Money Claims & SIL (Art. 306), 4 Years for Illegal Dismissal / injury to rights (Art. 1146 CC), 10 Calendar Days for NLRC Appeal (Art. 229), and 20 Years for unremitted SSS contributions (R.A. 11199).`}
                isCorrect={verdict.isHit}
                speedBonusAwarded={speedBonusAwarded}
                worldCode="w4"
                scenarioText={activeSpell.claimPrompt}
                chosenAnswerText={verdict.selectedOption}
                correctAnswerText={activeSpell.correctAnswer}
                advanceLabel={
                  bossHp <= 0 || heroHp <= 0 || spellIdx + 1 >= spells.length
                    ? 'View Duel Resolution'
                    : 'Duel Next Spell →'
                }
                onAdvance={handleNextSpell}
              />
            )}
          </div>
        )}

        {(phase === 'VICTORY' || phase === 'GAME_OVER') && (
          <div className="my-auto text-center max-w-md mx-auto space-y-4 py-4">
            <h3 className="text-xl sm:text-2xl font-black font-display text-amber-300">
              {phase === 'VICTORY' ? 'KAMEK DEFEATED BY STATUTORY LAW!' : 'HERO SPELL SHIELD BROKEN!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Duel Score: <strong className="font-mono text-emerald-400">{score}</strong> · Boss HP Remaining:{' '}
              <strong className="font-mono text-purple-300">{bossHp}%</strong>
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-8 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm font-mario border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>DUEL AGAIN</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
