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
} from 'lucide-react';
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
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState(9000);

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
    setFeedback(null);
    setTimeLeftMs(9000);
    setPhase('PLAYING');
    marioAudio.playPowerUp();
  }, []);

  const currentItem = deck[idx] || HAMMER_BROS_PAYROLL_BANK[0];
  const targetCount = 10;

  const handleVerdict = useCallback(
    (approveAsLawful: boolean) => {
      if (phase !== 'PLAYING' || !currentItem) return;
      const correct = approveAsLawful === currentItem.isValidPayroll;
      if (correct) {
        const nextCombo = combo + 1;
        const pts = 100 + nextCombo * 25;
        const nextScore = score + pts;
        setCombo(nextCombo);
        setScore(nextScore);
        setBestScore((b) => Math.max(b, nextScore));
        onEarnCoins(2);
        setFeedback({
          ok: true,
          text: `${currentItem.isValidPayroll ? 'SHIELDED LAWFUL PAYROLL' : 'SMASHED ILLEGAL SHORTCUT'} · ${currentItem.statute}`,
        });
      } else {
        const nextHp = hp - 1;
        setHp(nextHp);
        setCombo(0);
        marioAudio.playStomp();
        setFeedback({
          ok: false,
          text: `MISSED! ${currentItem.label} — ${currentItem.statute}`,
        });
        if (nextHp <= 0) {
          setPhase('GAME_OVER');
          return;
        }
      }

      if (idx + 1 >= targetCount) {
        onEarnCoins(10);
        marioAudio.playQuizComplete();
        setPhase('VICTORY');
      } else {
        setIdx((i) => i + 1);
        setLane(Math.floor(Math.random() * 3));
        setTimeLeftMs(Math.max(5500, 9000 - (idx + 1) * 280));
      }
    },
    [phase, currentItem, combo, score, hp, idx, onEarnCoins]
  );

  // Per-wave countdown timer (generous 9s initial window so player survives opening seconds easily)
  useEffect(() => {
    if (phase !== 'PLAYING') return;
    const timer = window.setInterval(() => {
      setTimeLeftMs((prev) => {
        if (prev <= 200) {
          const nextHp = hp - 1;
          setHp(nextHp);
          setCombo(0);
          marioAudio.playStomp();
          setFeedback({
            ok: false,
            text: `TIME EXPIRED! ${currentItem.label} (${currentItem.statute})`,
          });
          if (nextHp <= 0) {
            setPhase('GAME_OVER');
            return 0;
          }
          if (idx + 1 >= targetCount) {
            setPhase('VICTORY');
            return 0;
          }
          setIdx((i) => i + 1);
          setLane(Math.floor(Math.random() * 3));
          return 8000;
        }
        return prev - 200;
      });
    }, 200);
    return () => window.clearInterval(timer);
  }, [phase, hp, idx, currentItem]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (phase === 'TITLE' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        startGame();
      } else if (phase === 'PLAYING') {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          handleVerdict(true);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          handleVerdict(false);
        } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
          setPhase('PAUSED');
        }
      } else if (phase === 'PAUSED' && (e.key === 'p' || e.key === 'P' || e.key === 'Escape')) {
        setPhase('PLAYING');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, startGame, handleVerdict]);

  return (
    <div
      data-testid="game-hammer-bros-blitz"
      className="bg-[#0f172a] text-white rounded-3xl border-4 border-slate-950 shadow-[6px_6px_0_#000] overflow-hidden select-none"
    >
      {/* Top World-Matched Arcade HUD */}
      <div className="bg-slate-950 px-4 py-3 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 shrink-0">
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
              Inspect 10 incoming payroll orders across 3 castle lanes. Approve lawful statutory multipliers (125% OT, +10% NSD, 200% Regular Holiday, 100% Service Charges) with your{' '}
              <strong className="text-emerald-300">Green Shield</strong>, and smash illegal wage shortcuts with your{' '}
              <strong className="text-rose-300">Counter-Hammer</strong>!
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-7 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm font-mario border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer"
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
            {/* Timer Bar & Combo */}
            <div className="flex items-center justify-between gap-3 text-xs font-mono">
              <span className="text-amber-300 font-bold tabular-nums">
                LANE {lane + 1} INCOMING · {(timeLeftMs / 1000).toFixed(1)}s
              </span>
              {combo > 1 && (
                <span className="text-emerald-400 font-black tabular-nums">
                  {combo}x STREAK COMBO
                </span>
              )}
            </div>
            <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-amber-400 transition-all duration-150"
                style={{ width: `${Math.min(100, (timeLeftMs / 9000) * 100)}%` }}
              />
            </div>

            {/* 3 Castle Lanes Visual Indicator */}
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((ln) => (
                <div
                  key={ln}
                  className={`rounded-xl p-2 text-center border text-[11px] font-bold transition-all ${
                    lane === ln
                      ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                      : 'bg-slate-900/50 border-slate-800 text-slate-500'
                  }`}
                >
                  {lane === ln ? 'ACTIVE PAYROLL ORDER' : `Castle Lane ${ln + 1}`}
                </div>
              ))}
            </div>

            {/* Active Payroll Order Card */}
            <div className="bg-white text-slate-950 rounded-2xl p-4 sm:p-5 border-3 border-black shadow-[4px_4px_0_#000] space-y-1.5">
              <span className="text-[10px] font-black uppercase text-slate-500 font-mono block">
                INCOMING PAYROLL VOUCHER #{idx + 1}
              </span>
              <h3 className="text-base sm:text-xl font-black font-display text-slate-950">
                {currentItem.label}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold">
                {currentItem.detail}
              </p>
            </div>

            {/* Action Buttons (>= 48px Touch Targets) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleVerdict(true)}
                className="min-h-[52px] px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm border-3 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>SHIELD: LAWFUL PAYROLL [A]</span>
              </button>
              <button
                type="button"
                onClick={() => handleVerdict(false)}
                className="min-h-[52px] px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm border-3 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Hammer className="w-5 h-5 shrink-0" />
                <span>SMASH: ILLEGAL VIOLATION [D]</span>
              </button>
            </div>

            {feedback && (
              <div
                className={`rounded-xl px-3.5 py-2.5 border text-xs font-bold flex items-center gap-2 ${
                  feedback.ok
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-400 text-rose-200'
                }`}
              >
                {feedback.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}
          </div>
        )}

        {(phase === 'VICTORY' || phase === 'GAME_OVER') && (
          <div className="my-auto text-center max-w-md mx-auto space-y-4 py-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400 border-3 border-black mx-auto">
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
              className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm font-mario border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
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
      marioAudio.playCoin();
      if (updated.length === 3) {
        setRoundCleared(true);
        setScore((s) => s + 150);
        onEarnCoins(3);
      }
    } else {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      setPickedOrder([]);
      marioAudio.playStomp();
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

  return (
    <div
      data-testid="game-toadette-due-process"
      className="bg-[#0f172a] text-white rounded-3xl border-4 border-slate-950 shadow-[6px_6px_0_#000] overflow-hidden select-none"
    >
      <div className="bg-slate-950 px-4 py-3 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-pink-400 border-2 border-black flex items-center justify-center text-slate-950 shrink-0">
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
              Tap the 3 procedural steps in strict chronological legal order (Step 1 → Step 2 → Step 3) across Just Cause, Authorized Cause, Disease, Abandonment, and Preventive Suspension dockets!
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-7 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm font-mario border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START RELAY DOCKET</span>
            </button>
          </div>
        )}

        {phase === 'PLAYING' && (
          <div className="space-y-4">
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
                        ? 'bg-emerald-500 text-slate-950 border-black'
                        : pickedOrder.length === slot
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    {done ? `STEP ${slot + 1} LOCKED` : `SELECT STEP ${slot + 1}`}
                  </div>
                );
              })}
            </div>

            {/* Clickable Procedural Cards */}
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
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-amber-400 text-white cursor-pointer'
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

            {roundCleared && (
              <div className="bg-emerald-950/90 border-2 border-emerald-400 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 text-xs">
                  <span className="font-black text-emerald-300 block">
                    DUE PROCESS PERFECTLY SEQUENCED!
                  </span>
                  <p className="text-emerald-100">{activeCase.doctrineNote}</p>
                </div>
                <button
                  type="button"
                  onClick={handleNextCase}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shrink-0 cursor-pointer whitespace-nowrap"
                >
                  {caseIdx + 1 >= relayDeck.length ? 'Finish Relay' : 'Next Case →'}
                </button>
              </div>
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
              className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm font-mario border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
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
  const [verdictBanner, setVerdictBanner] = useState<{ ok: boolean; msg: string } | null>(null);
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
    setVerdictBanner(null);
    setPhase('PLAYING');
    marioAudio.playPowerUp();
  }, []);

  const totalCratesInShift = crates.length || 8;
  const currentCrate = crates[crateIdx] || SHY_GUY_CONVEYOR_BANK[0];

  const inspectCrate = useCallback(
    (certifyCompliant: boolean) => {
      if (phase !== 'PLAYING' || !currentCrate) return;
      const ok = certifyCompliant === currentCrate.isCompliant;
      if (ok) {
        setScore((s) => s + 125);
        onEarnCoins(2);
        setVerdictBanner({
          ok: true,
          msg: `INSPECTED: ${currentCrate.basis}`,
        });
      } else {
        const nextHp = hp - 1;
        setHp(nextHp);
        marioAudio.playStomp();
        setVerdictBanner({
          ok: false,
          msg: `AUDIT ERROR: ${currentCrate.title} — ${currentCrate.basis}`,
        });
        if (nextHp <= 0) {
          setPhase('GAME_OVER');
          return;
        }
      }

      if (crateIdx + 1 >= totalCratesInShift) {
        onEarnCoins(10);
        marioAudio.playQuizComplete();
        setPhase('VICTORY');
      } else {
        setCrateIdx((i) => i + 1);
        setBeltProgress(5);
      }
    },
    [phase, currentCrate, hp, crateIdx, totalCratesInShift, onEarnCoins]
  );

  // Smooth clamped conveyor progress (~10 seconds per crate so opening seconds never kill idle player)
  useEffect(() => {
    if (phase !== 'PLAYING') return;
    let rafId = 0;
    lastFrameRef.current = performance.now();

    const tick = (now: number) => {
      const rawDt = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;
      const dt = Math.min(rawDt, 0.05);
      setBeltProgress((prev) => {
        const next = prev + dt * 9.5; // ~10s across full conveyor
        if (next >= 100) {
          setHp((curHp) => {
            const updated = curHp - 1;
            if (updated <= 0) {
              setPhase('GAME_OVER');
            } else if (crateIdx + 1 >= SHY_GUY_CONVEYOR_BANK.length) {
              setPhase('VICTORY');
            } else {
              setCrateIdx((i) => i + 1);
            }
            return Math.max(0, updated);
          });
          return 5;
        }
        return next;
      });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [phase, crateIdx]);

  return (
    <div
      data-testid="game-shy-guy-conveyor"
      className="bg-[#0f172a] text-white rounded-3xl border-4 border-slate-950 shadow-[6px_6px_0_#000] overflow-hidden select-none"
    >
      <div className="bg-slate-950 px-4 py-3 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-400 border-2 border-black flex items-center justify-center text-slate-950 shrink-0">
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
              <strong className="text-emerald-300">Compliant</strong>, and bust labor-only or benefit-diminution crates!
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-7 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm font-mario border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START CONVEYOR AUDIT</span>
            </button>
          </div>
        )}

        {phase === 'PLAYING' && currentCrate && (
          <div className="space-y-4">
            {/* Animated Conveyor Track */}
            <div className="bg-slate-950 rounded-2xl p-3 border-2 border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>ENTRY CHUTE</span>
                <span className="text-amber-300 font-bold tabular-nums">
                  BELT POSITION: {Math.round(beltProgress)}%
                </span>
                <span className="text-rose-400">EXIT GATE</span>
              </div>
              <div className="relative h-8 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                <div
                  className="absolute top-1 bottom-1 w-12 rounded-lg bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 font-black text-[10px] font-mono"
                  style={{
                    left: `calc(${Math.min(92, beltProgress)}% - 8px)`,
                  }}
                >
                  #{crateIdx + 1}
                </div>
              </div>
            </div>

            {/* Crate Inspection Dossier */}
            <div className="bg-white text-slate-950 rounded-2xl p-4 sm:p-5 border-3 border-black shadow-[4px_4px_0_#000] space-y-1.5">
              <span className="text-[10px] font-black uppercase text-emerald-700 font-mono block">
                DOLE INSPECTION DOCKET #{crateIdx + 1}
              </span>
              <h3 className="text-base sm:text-xl font-black font-display">{currentCrate.title}</h3>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold">{currentCrate.spec}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => inspectCrate(true)}
                className="min-h-[52px] px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>CERTIFY COMPLIANT</span>
              </button>
              <button
                type="button"
                onClick={() => inspectCrate(false)}
                className="min-h-[52px] px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <XCircle className="w-5 h-5 shrink-0" />
                <span>BUST DOLE VIOLATION</span>
              </button>
            </div>

            {verdictBanner && (
              <div
                className={`rounded-xl px-3.5 py-2.5 border text-xs font-bold ${
                  verdictBanner.ok
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-400 text-rose-200'
                }`}
              >
                {verdictBanner.msg}
              </div>
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
              className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm font-mario border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
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
    setPhase('PLAYING');
    marioAudio.playPowerUp();
  };

  const activeSpell = spells[spellIdx] || KAMEK_DEADLINE_SPELLS[0];

  const handleCastShield = (selected: string) => {
    if (phase !== 'PLAYING' || !activeSpell) return;
    const isHit = selected === activeSpell.correctAnswer;
    if (isHit) {
      const nextBoss = Math.max(0, bossHp - 20);
      setBossHp(nextBoss);
      setScore((s) => s + 150);
      onEarnCoins(3);
      setLastLog(`REFLECTED! ${activeSpell.correctAnswer} — ${activeSpell.basis}`);
      if (nextBoss <= 0 || spellIdx + 1 >= spells.length) {
        onEarnCoins(12);
        marioAudio.playQuizComplete();
        setPhase('VICTORY');
        return;
      }
    } else {
      const nextHero = Math.max(0, heroHp - 35);
      setHeroHp(nextHero);
      marioAudio.playStomp();
      setLastLog(`HEX HIT! Correct Rune: ${activeSpell.correctAnswer} (${activeSpell.basis})`);
      if (nextHero <= 0) {
        setPhase('GAME_OVER');
        return;
      }
      if (spellIdx + 1 >= spells.length) {
        setPhase('VICTORY');
        return;
      }
    }
    setSpellIdx((i) => i + 1);
  };

  return (
    <div
      data-testid="game-kamek-deadlines"
      className="bg-[#0f172a] text-white rounded-3xl border-4 border-slate-950 shadow-[6px_6px_0_#000] overflow-hidden select-none"
    >
      <div className="bg-slate-950 px-4 py-3 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-400 border-2 border-black flex items-center justify-center text-slate-950 shrink-0">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-purple-300 font-mario block">
              PRESCRIPTIVE SPELL-SHIELD DUEL
            </span>
            <h2 className="text-sm sm:text-lg font-black font-display text-white">
              KAMEK&apos;S STATUTORY DEADLINES DUEL
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
          <div className="bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
            <span className="text-slate-400 mr-1">HERO HP</span>
            <strong className="text-emerald-400">{heroHp}%</strong>
          </div>
          <div className="bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
            <span className="text-slate-400 mr-1">KAMEK HP</span>
            <strong className="text-purple-300">{bossHp}%</strong>
          </div>
          <div className="bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
            <span className="text-slate-400 mr-1">SCORE</span>
            <strong className="text-amber-300">{score}</strong>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 min-h-[340px] flex flex-col justify-between gap-4 bg-gradient-to-b from-[#1e1b4b] to-[#0f172a]">
        {phase === 'TITLE' && (
          <div className="my-auto text-center max-w-xl mx-auto space-y-4 py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-400 border-3 border-black shadow-[0_4px_0_#000] mx-auto">
              <MarioCharacterAvatar character={equippedAvatar} className="w-11 h-11" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display text-white">
              Reflect Kamek&apos;s Time-Bar Hexes With Statutory Deadlines!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Match each labor law action or notice spell to its exact prescriptive period (1 Yr ULP, 3 Yrs Money Claims, 4 Yrs Illegal Dismissal, 20 Yrs SSS, 10d NLRC Appeal, 6m Floating Status) to drain Kamek&apos;s Boss HP!
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[48px] px-7 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm font-mario border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START SPELLBOOK DUEL</span>
            </button>
          </div>
        )}

        {phase === 'PLAYING' && activeSpell && (
          <div className="space-y-4">
            {/* Dual HP Bars */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-emerald-300 font-bold">COUNSEL HERO</span>
                  <span className="tabular-nums">{heroHp}/100</span>
                </div>
                <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-emerald-400 transition-all"
                    style={{ width: `${heroHp}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-purple-300 font-bold">MAGIKOOPA KAMEK</span>
                  <span className="tabular-nums">{bossHp}/100</span>
                </div>
                <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-purple-400 transition-all"
                    style={{ width: `${bossHp}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Incoming Spell Card */}
            <div className="bg-white text-slate-950 rounded-2xl p-4 sm:p-5 border-3 border-black shadow-[4px_4px_0_#000] space-y-1">
              <span className="text-[10px] font-black uppercase text-purple-700 font-mono block">
                INCOMING HEX · {activeSpell.spellTitle}
              </span>
              <h3 className="text-base sm:text-lg font-black font-display">
                {activeSpell.claimPrompt}
              </h3>
            </div>

            {/* 4 Statutory Rune Shield Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              {activeSpell.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleCastShield(opt)}
                  className="min-h-[50px] px-3 py-2.5 rounded-2xl bg-slate-900 hover:bg-amber-400 text-white hover:text-slate-950 font-black text-xs sm:text-sm border-2 border-purple-400 hover:border-black transition-colors cursor-pointer font-mono"
                >
                  {opt}
                </button>
              ))}
            </div>

            {lastLog && (
              <div className="rounded-xl px-3.5 py-2.5 bg-slate-950/90 border border-purple-400/50 text-xs font-bold text-purple-100">
                {lastLog}
              </div>
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
              className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm font-mario border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
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
