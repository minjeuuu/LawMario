import React, { useState, useCallback } from 'react';
import { MarioAvatar } from '../types/laborLaw';
import {
  MarioCharacterAvatar,
  MarioCoinIcon,
  MarioStarIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';
import { drawUniqueFromDeck, shuffleChoiceOptions } from '../utils/gameQuestionDeck';
import { QuizCompletionPayload } from '../utils/profileAchievements';
import { MasterArcadeScenario } from './MasterVaultGames';
import {
  Compass,
  Sun,
  ShieldAlert,
  Music,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Heart,
  Play,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

export interface RoyalVaultGameProps {
  equippedAvatar: MarioAvatar;
  onEarnCoins?: (amount: number) => void;
  onQuizCompleted?: (payload: QuizCompletionPayload) => void;
}

export const CAPTAIN_TOAD_MINECART_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'ct1',
    worldCode: 'w4',
    headline: 'Kasambahay Minimum Rest Period',
    prompt: 'Under R.A. 10361 (Batas Kasambahay), what is the mandatory daily aggregate rest period for a domestic worker?',
    options: [
      'At least 8 hours per day',
      'At least 6 hours per day',
      'At least 10 hours per day',
      'At least 12 hours per day',
    ],
    correctIndex: 0,
    statute: 'Sec. 20, R.A. 10361',
    explanation: 'Every domestic worker is entitled to an aggregate daily rest period of at least eight (8) hours per day, plus at least 24 consecutive hours of weekly rest.',
  },
  {
    id: 'ct2',
    worldCode: 'w4',
    headline: 'Kasambahay 5-Day Service Incentive Leave',
    prompt: 'After rendering 1 year of service, is a Kasambahay’s unused 5-day Service Incentive Leave (SIL) convertible to cash?',
    options: [
      'No — Kasambahay SIL is NOT cumulative and NOT convertible to cash',
      'Yes — convertible to cash every December',
      'Yes — cumulative up to 15 days',
      'Kasambahays have no SIL under R.A. 10361',
    ],
    correctIndex: 0,
    statute: 'Sec. 29, R.A. 10361',
    explanation: 'Unlike ordinary Book III workers whose unused SIL is commutable to cash, a Kasambahay’s 5-day SIL shall not be accumulated nor carried over and is not convertible to cash.',
  },
  {
    id: 'ct3',
    worldCode: 'w4',
    headline: 'Child Labor Below 15 Years Old',
    prompt: 'Under R.A. 9231, what is the maximum work schedule allowed for a child below 15 years old working under a valid DOLE permit in public entertainment?',
    options: [
      'Not more than 4 hours/day and 20 hours/week; no work 8:00 PM to 6:00 AM',
      'Not more than 8 hours/day and 40 hours/week; no work 10:00 PM to 6:00 AM',
      'Not more than 6 hours/day and 30 hours/week',
      'Unlimited hours if accompanied by a parent',
    ],
    correctIndex: 0,
    statute: 'Sec. 3, R.A. 9231',
    explanation: 'A child below 15 may work max 4 hours/day and max 20 hours/week, and never between 8:00 PM and 6:00 AM.',
  },
  {
    id: 'ct4',
    worldCode: 'w4',
    headline: 'PWD Tax Incentive vs Wage Rate',
    prompt: 'Under R.A. 7277 (Magna Carta for Persons with Disability), how much minimum wage must a qualified PWD employee receive compared to an able-bodied worker?',
    options: [
      '100% of the applicable statutory minimum wage',
      '75% of the minimum wage like learners/apprentices',
      '80% of the minimum wage',
      '50% subsidized by DSWD',
    ],
    correctIndex: 0,
    statute: 'Sec. 5, R.A. 7277',
    explanation: 'A qualified disabled employee shall be subject to the same terms and conditions of employment and the same 100% compensation, privileges, and benefits as a qualified able-bodied person.',
  },
  {
    id: 'ct5',
    worldCode: 'w4',
    headline: 'Telecommuting Parity Principle',
    prompt: 'Under R.A. 11165 (Telecommuting Act), are work-from-home employees entitled to Overtime Pay and Night Shift Differential?',
    options: [
      'Yes — under the Fair Treatment standard, telecommuters enjoy the same minimum labor standards',
      'No — telecommuters are automatically classified as field personnel',
      'Only if they live within 5 km of the office',
      'Only Overtime, never Night Shift Differential',
    ],
    correctIndex: 0,
    statute: 'Sec. 5, R.A. 11165 & D.O. 237-22',
    explanation: 'Telecommuting employees are not field personnel; their hours are verifiable via digital logs and they receive full parity in OT, NSD, and holiday pay.',
  },
  {
    id: 'ct6',
    worldCode: 'w4',
    headline: 'Apprenticeship vs Learnership Duration',
    prompt: 'What is the maximum statutory duration of a Learnership agreement compared to a standard Apprenticeship?',
    options: [
      'Learnership: max 3 months; Apprenticeship: more than 3 months (typically up to 6 months)',
      'Learnership: max 1 year; Apprenticeship: max 2 years',
      'Both are capped at 60 days',
      'Learnership: 6 months; Apprenticeship: 3 months',
    ],
    correctIndex: 0,
    statute: 'Arts. 58 & 75, Labor Code',
    explanation: 'Learnership covers semi-skilled non-apprenticeable occupations for not more than 3 months (75% min wage), with mandatory regularization commitment if retained.',
  },
];

export const DAISY_HOLIDAY_DERBY_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'dh1',
    worldCode: 'holidays',
    headline: 'Unworked Regular Holiday Rate',
    prompt: 'Daisy did not report for work on National Heroes Day (Regular Holiday), and she was present on the workday immediately preceding it. What pay does she receive?',
    options: [
      '100% of her regular daily wage',
      'No work, no pay (0%)',
      '200% of her regular daily wage',
      '130% of her regular daily wage',
    ],
    correctIndex: 0,
    statute: 'Art. 94, Labor Code',
    explanation: 'Covered employees receive 100% of their regular daily wage even if unworked on a Regular Holiday, subject to the preceding-day presence/paid-leave rule.',
  },
  {
    id: 'dh2',
    worldCode: 'holidays',
    headline: 'Double Regular Holiday (Worked)',
    prompt: 'Araw ng Kagitingan and Maundy Thursday fell on the exact same calendar day, and Luigi worked 8 hours. What is his statutory pay rate?',
    options: [
      '300% of his regular daily wage',
      '200% of his regular daily wage',
      '400% of his regular daily wage',
      '260% of his regular daily wage',
    ],
    correctIndex: 0,
    statute: 'DOLE Handbook on Workers’ Statutory Monetary Benefits',
    explanation: 'On a Double Regular Holiday, an unworked employee receives 200%, and if worked for the first 8 hours, the employee receives 300% (390% if also on Rest Day!).',
  },
  {
    id: 'dh3',
    worldCode: 'holidays',
    headline: 'Special Non-Working Day (Unworked)',
    prompt: 'Unless there is a favorable company practice or CBA, what rule governs an unworked Special (Non-Working) Day like Ninoy Aquino Day?',
    options: [
      '“No work, no pay” principle applies (0% extra pay if unworked)',
      '100% paid holiday even if unworked',
      '50% half-day standby pay',
      '130% automatic pay',
    ],
    correctIndex: 0,
    statute: 'Art. 93 & DOLE Handbook',
    explanation: 'Special Non-Working Days follow the “no work, no pay” rule unless a company policy, practice, or CBA grants payment.',
  },
  {
    id: 'dh4',
    worldCode: 'holidays',
    headline: 'Special Non-Working Day Falling on Rest Day',
    prompt: 'Peach worked 8 hours on All Saints’ Day (Special Non-Working Day), which also happened to be her scheduled Sunday Rest Day. What rate applies?',
    options: [
      '150% of regular daily wage',
      '130% of regular daily wage',
      '200% of regular daily wage',
      '260% of regular daily wage',
    ],
    correctIndex: 0,
    statute: 'Art. 93(c), Labor Code',
    explanation: 'Work performed on a Special Non-Working Day = 130%, and when it also falls on the employee’s scheduled Rest Day, the rate rises to 150%.',
  },
  {
    id: 'dh5',
    worldCode: 'holidays',
    headline: 'Successive Regular Holidays Absence Trap',
    prompt: 'Maundy Thursday and Good Friday are successive Regular Holidays. Toad was absent WITHOUT pay on Wednesday, did not work Thursday, but WORKED on Good Friday. Which holiday pay does he get?',
    options: [
      'Entitled to holiday pay (200%) for Good Friday because he worked on Friday, though disqualified for Thursday',
      'Forfeits holiday pay for BOTH Thursday and Friday permanently',
      'Gets 100% for both Thursday and Friday anyway',
      'Gets 50% penalty rate on Friday',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule IV Sec. 10',
    explanation: 'Where there are two successive regular holidays, an employee absent without pay on the preceding day is not paid if absent on both holidays, EXCEPT if they work on the first holiday or actually work on the second holiday (earning holiday pay for the worked holiday).',
  },
  {
    id: 'dh6',
    worldCode: 'holidays',
    headline: 'Retail Store With 8 Regular Workers',
    prompt: 'A bakery regularly employs 8 workers in total. Are its bakers statutorily entitled to Art. 94 Regular Holiday Pay?',
    options: [
      'No — retail and service establishments regularly employing less than 10 workers are exempt from Holiday Pay',
      'Yes — only establishments with <=5 workers are exempt from Holiday Pay',
      'Yes — bakeries are heavy manufacturing',
      'Only on Christmas and New Year',
    ],
    correctIndex: 0,
    statute: 'Art. 94(a), Labor Code',
    explanation: 'Art. 94 explicitly exempts retail and service establishments regularly employing less than ten (10) workers from statutory Holiday Pay.',
  },
];

export const DRY_BONES_CRYPT_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'db1',
    worldCode: 'w5',
    headline: 'Money Claims Prescriptive Period',
    prompt: 'Within how many years from accrual of the cause of action must pure money claims arising from employer-employee relations be filed?',
    options: [
      'Three (3) years',
      'Four (4) years',
      'One (1) year',
      'Ten (10) years',
    ],
    correctIndex: 0,
    statute: 'Art. 306 [291], Labor Code',
    explanation: 'All money claims arising from employer-employee relations accruing during the effectivity of the Labor Code shall be filed within three (3) years from the time the cause of action accrued.',
  },
  {
    id: 'db2',
    worldCode: 'w5',
    headline: 'Illegal Dismissal Prescriptive Period',
    prompt: 'Under Art. 1146 of the Civil Code and Supreme Court jurisprudence (Callanta v. Carnation), what is the prescriptive period to file an Illegal Dismissal complaint?',
    options: [
      'Four (4) years as an injury to the rights of the plaintiff',
      'Three (3) years under Art. 306',
      'One (1) year like Unfair Labor Practice',
      'Five (5) years',
    ],
    correctIndex: 0,
    statute: 'Art. 1146, Civil Code',
    explanation: 'Illegal dismissal is an injury to one’s constitutional/statutory right to security of tenure and prescribes in four (4) years.',
  },
  {
    id: 'db3',
    worldCode: 'w5',
    headline: 'Unfair Labor Practice (ULP) Prescription',
    prompt: 'Within what period must an Unfair Labor Practice (ULP) complaint be filed?',
    options: [
      'One (1) year from accrual of such unfair labor practice',
      'Three (3) years from accrual',
      'Six (6) months from dismissal',
      'Thirty (30) days from notice',
    ],
    correctIndex: 0,
    statute: 'Art. 305 [290], Labor Code',
    explanation: 'All unfair labor practices arising from Book V shall be filed within one (1) year from accrual; otherwise they shall be forever barred.',
  },
  {
    id: 'db4',
    worldCode: 'w5',
    headline: 'King of Kings Transport 5-Day NTE Rule',
    prompt: 'Under the Twin-Notice Rule for Just Cause termination, how many calendar days must an employee be given to submit a written explanation after the First Notice (NTE)?',
    options: [
      'At least five (5) calendar days',
      '24 hours is always sufficient',
      'At least thirty (30) calendar days',
      'At least fifteen (15) working days',
    ],
    correctIndex: 0,
    statute: 'King of Kings Transport v. Mamac & D.O. 147-15',
    explanation: '“Reasonable opportunity” in the First Notice means a period of at least five (5) calendar days from receipt of notice to prepare a written defense.',
  },
  {
    id: 'db5',
    worldCode: 'w5',
    headline: 'Authorized Cause 30-Day Dual Notice',
    prompt: 'When terminating employees due to Redundancy or Retrenchment (Art. 298), whom must the employer serve written notice upon, and when?',
    options: [
      'Both the affected workers AND DOLE at least one (1) month (30 days) before intended date',
      'Only the Union President 5 days before termination',
      'Only DOLE 15 days after termination',
      'Verbal townhall announcement is valid if separation pay is paid',
    ],
    correctIndex: 0,
    statute: 'Art. 298 [283], Labor Code',
    explanation: 'Authorized cause termination requires written notice to BOTH the employee and the DOLE Regional Office at least one (1) month prior to the effective date.',
  },
  {
    id: 'db6',
    worldCode: 'w5',
    headline: 'Bona Fide Suspension / Floating Status Cap',
    prompt: 'Under Art. 301 [286], what is the maximum period of bona fide suspension of operations or security guard “floating status” before constructive dismissal sets in?',
    options: [
      'Period not exceeding six (6) months',
      'Period not exceeding three (3) months',
      'Period not exceeding one (1) year',
      'Period not exceeding ninety (90) days',
    ],
    correctIndex: 0,
    statute: 'Art. 301 [286], Labor Code',
    explanation: 'Bona fide suspension of business operations or off-detail status shall not exceed six (6) months; beyond 6 months without recall or valid separation, constructive dismissal attaches.',
  },
];

export const PAULINE_WAGE_CONCERT_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'pw1',
    worldCode: 'w3',
    headline: '100% Service Charges Distribution',
    prompt: 'Under R.A. 11360 (amending Art. 96), what percentage of collected service charges in hotels and restaurants belongs to covered employees?',
    options: [
      '100% distributed completely and equally among covered rank-and-file/supervisory workers (excluding managerial)',
      '85% to workers and 15% to management for breakage',
      '90% to workers and 10% admin fee',
      '50% split between management and staff',
    ],
    correctIndex: 0,
    statute: 'R.A. 11360 (Art. 96, Labor Code)',
    explanation: 'R.A. 11360 abolished management’s old 15% share; 100% of service charges must be distributed completely and equally among covered employees (excluding managerial employees).',
  },
  {
    id: 'pw2',
    worldCode: 'w3',
    headline: '13th Month Pay Deadline & Formula',
    prompt: 'Under P.D. 851, what is the statutory formula and mandatory payout deadline for 13th Month Pay?',
    options: [
      'At least 1/12 of total basic salary earned within the calendar year, paid not later than December 24',
      'One full gross monthly salary including OT & allowances, paid December 31',
      '1/12 of gross income only for regularized workers with 1 year service',
      'Optional Christmas bonus subject to company profits',
    ],
    correctIndex: 0,
    statute: 'P.D. 851 & Revised Guidelines',
    explanation: 'Rank-and-file employees who worked at least 1 month during the calendar year are entitled to 1/12 of total basic salary earned, payable on or before December 24.',
  },
  {
    id: 'pw3',
    worldCode: 'w3',
    headline: 'Prohibition Against Payment by Chits or Coupons',
    prompt: 'A plantation pays workers 70% in Philippine Pesos and 30% in company store grocery vouchers, claiming workers requested it. Is this valid?',
    options: [
      'Void and criminal — wages must be paid strictly in legal tender even if employees expressly request tokens/vouchers',
      'Valid because 70% was paid in cash',
      'Valid if employees signed a notarized request',
      'Valid for agricultural plantations',
    ],
    correctIndex: 0,
    statute: 'Art. 102, Labor Code',
    explanation: 'Art. 102 strictly prohibits paying wages via promissory notes, vouchers, coupons, tokens, or chits, even when expressly requested by the employee!',
  },
  {
    id: 'pw4',
    worldCode: 'w3',
    headline: 'Facilities vs. Supplements (Mabeza / SLL Doctrine)',
    prompt: 'What is the controlling legal test used by the Supreme Court to determine whether board/lodging is a deductible “Facility” or a non-deductible “Supplement”?',
    options: [
      'Purpose Test — whether furnished primarily for the benefit of the employee (Facility) or for the convenience of the employer (Supplement)',
      'Monetary Value Test — anything over PHP 500 is a Facility',
      'Location Test — inside vs outside company premises',
      'Tenure Test — probationary vs regular',
    ],
    correctIndex: 0,
    statute: 'SLL International Cables Specialist v. NLRC',
    explanation: 'Under the Purpose Test, distinction rests not on kind but on purpose: Facilities benefit the worker/family (requiring Voluntary Acceptance + Fair Value + Customary proof to deduct), whereas Supplements benefit employer convenience and are never deductible.',
  },
  {
    id: 'pw5',
    worldCode: 'w3',
    headline: 'D.O. 174 Substantial Capital Threshold',
    prompt: 'Under DOLE D.O. No. 174-17, what is the minimum paid-up capital / net financial contracting capacity required for corporations/partnerships to qualify as having “substantial capital”?',
    options: [
      'At least PHP 5,000,000.00',
      'At least PHP 3,000,000.00',
      'At least PHP 1,000,000.00',
      'At least PHP 500,000.00',
    ],
    correctIndex: 0,
    statute: 'Sec. 3(l), DOLE D.O. 174-17',
    explanation: 'D.O. 174-17 raised the substantial capital requirement to at least PHP 5,000,000 paid-up capital for corporations/partnerships/cooperatives or net worth for single proprietorships.',
  },
  {
    id: 'pw6',
    worldCode: 'w3',
    headline: 'R.A. 8188 Double Indemnity Penalty',
    prompt: 'If an employer refuses or fails to pay the prescribed statutory wage increase under an RTWPB Wage Order, what special monetary sanction attaches under R.A. 8188?',
    options: [
      'Double Indemnity — payment of double (2x) the unpaid benefits/wage increase owing to the employees',
      'Triple damages plus automatic closure',
      'Nominal damages of PHP 10,000 only',
      'Simple 6% legal interest only',
    ],
    correctIndex: 0,
    statute: 'Sec. 4, R.A. 8188',
    explanation: 'R.A. 8188 imposes Double Indemnity (2x the unpaid prescribed wage adjustment) against employers who refuse or fail to pay RTWPB-mandated minimum wage increases.',
  },
];

interface RoyalArcadeEngineProps extends RoyalVaultGameProps {
  deckKey: string;
  gameTitle: string;
  kickerBadge: string;
  description: string;
  bannerGradientClass: string;
  accentButtonClass: string;
  icon: React.ReactNode;
  bank: readonly MasterArcadeScenario[];
  victoryCoins: number;
  reportWorldCode: string;
}

const RoyalArcadeEngine: React.FC<RoyalArcadeEngineProps> = ({
  deckKey,
  equippedAvatar,
  onEarnCoins,
  onQuizCompleted,
  gameTitle,
  kickerBadge,
  description,
  bannerGradientClass,
  accentButtonClass,
  icon,
  bank,
  victoryCoins,
  reportWorldCode,
}) => {
  const [phase, setPhase] = useState<'READY' | 'PLAYING' | 'VICTORY' | 'GAME_OVER'>('READY');
  const [deck, setDeck] = useState<MasterArcadeScenario[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pickedOption, setPickedOption] = useState<number | null>(null);
  const [startedAtMs, setStartedAtMs] = useState<number>(() => Date.now());

  const startRun = useCallback(() => {
    const drawn = drawUniqueFromDeck(deckKey, bank, Math.min(5, bank.length)).map((item) => {
      const shuf = shuffleChoiceOptions(item.options, item.correctIndex);
      return {
        ...item,
        options: shuf.options,
        correctIndex: shuf.correctIndex,
      };
    });
    setDeck(drawn);
    setCurrentIdx(0);
    setHearts(3);
    setScore(0);
    setStreak(0);
    setPickedOption(null);
    setStartedAtMs(Date.now());
    setPhase('PLAYING');
    marioAudio.playPowerUp();
  }, [deckKey, bank]);

  const currentItem = deck[currentIdx];

  const handleChoose = (idx: number) => {
    if (pickedOption !== null || !currentItem) return;
    setPickedOption(idx);
    if (idx === currentItem.correctIndex) {
      const nextStreak = streak + 1;
      setScore((s) => s + 1);
      setStreak(nextStreak);
      onEarnCoins?.(nextStreak >= 2 ? 4 : 3);
      marioAudio.playCoin();
    } else {
      setStreak(0);
      setHearts((h) => Math.max(0, h - 1));
      marioAudio.playWrongAnswer();
    }
  };

  const handleAdvance = () => {
    const elapsedSec = Math.max(1, Math.round((Date.now() - startedAtMs) / 1000));
    if (hearts <= 0) {
      setPhase('GAME_OVER');
      marioAudio.playGameOver();
      onQuizCompleted?.({
        mode: 'arcade_vault',
        correctCount: score,
        totalCount: deck.length,
        elapsedSeconds: elapsedSec,
        worldCode: reportWorldCode,
      });
      return;
    }

    if (currentIdx + 1 >= deck.length) {
      setPhase('VICTORY');
      onEarnCoins?.(victoryCoins);
      marioAudio.playLevelUp();
      onQuizCompleted?.({
        mode: 'arcade_vault',
        correctCount: score,
        totalCount: deck.length,
        elapsedSeconds: elapsedSec,
        worldCode: reportWorldCode,
      });
      return;
    }

    setCurrentIdx((i) => i + 1);
    setPickedOption(null);
    marioAudio.playClick();
  };

  return (
    <div className="bg-slate-950 text-white rounded-3xl border-4 border-black shadow-[6px_6px_0_#000] overflow-hidden w-full max-w-full min-w-0">
      {/* Compact Responsive HUD Header */}
      <div className={`${bannerGradientClass} p-3.5 sm:p-5 border-b-3 border-black flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
            {icon}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-amber-300 font-mario block truncate">
              {kickerBadge}
            </span>
            <h3 className="text-base sm:text-xl font-black font-display text-white truncate">
              {gameTitle}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/60 border border-slate-700" aria-label={`${hearts} hearts remaining`}>
            {Array.from({ length: 3 }, (_, idx) => (
              <Heart
                key={idx}
                className={`w-4 h-4 ${
                  idx < hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-600'
                }`}
              />
            ))}
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center">
            <MarioCharacterAvatar character={equippedAvatar} className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Playable Stage */}
      <div className="p-4 sm:p-6">
        {phase === 'READY' && (
          <div className="text-center py-6 sm:py-8 space-y-4 max-w-xl mx-auto">
            <p className="text-xs sm:text-sm font-semibold text-slate-300 leading-relaxed">
              {description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                data-start="true"
                onClick={startRun}
                className={`min-h-[48px] px-6 py-2.5 rounded-2xl font-black text-sm border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer active:translate-y-0.5 ${accentButtonClass}`}
              >
                <Play className="w-4 h-4 fill-current shrink-0" />
                <span>Start 5-Stage Arcade Run (+{victoryCoins}c Clear Bonus)</span>
              </button>
            </div>
          </div>
        )}

        {phase === 'PLAYING' && currentItem && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
              <span className="text-amber-300 font-mono tabular-nums">
                Stage {currentIdx + 1}/{deck.length} · {currentItem.headline}
              </span>
              <span className="text-emerald-300 tabular-nums">
                Score: {score} {streak >= 2 ? `· ${streak}x Streak!` : ''}
              </span>
            </div>

            <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 sm:p-5">
              <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed">
                {currentItem.prompt}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentItem.options.map((opt, idx) => {
                const isPicked = pickedOption === idx;
                const isRight = idx === currentItem.correctIndex;
                let btnTone = 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-100';
                if (pickedOption !== null) {
                  if (isRight) {
                    btnTone = 'bg-emerald-500/25 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400';
                  } else if (isPicked) {
                    btnTone = 'bg-rose-500/25 border-rose-500 text-rose-100';
                  } else {
                    btnTone = 'bg-slate-950/60 border-slate-800 text-slate-500';
                  }
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={pickedOption !== null}
                    onClick={() => handleChoose(idx)}
                    className={`min-h-[54px] p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${btnTone}`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-black border border-slate-700 text-amber-300 font-black font-mario text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-xs sm:text-sm font-bold leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>

            {pickedOption !== null && (
              <div
                className={`rounded-2xl p-4 border-2 space-y-1.5 ${
                  pickedOption === currentItem.correctIndex
                    ? 'bg-emerald-950/75 border-emerald-500 text-emerald-100'
                    : 'bg-rose-950/75 border-rose-500 text-rose-100'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black">
                  <span className="inline-flex items-center gap-1.5">
                    {pickedOption === currentItem.correctIndex ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>DOCTRINE LOCKED IN!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>MISSED TRAP (-1 HEART)</span>
                      </>
                    )}
                  </span>
                  <span className="text-amber-300 font-mono">{currentItem.statute}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {currentItem.explanation}
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAdvance}
                    className="min-h-[44px] px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm border-2 border-black inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      {hearts <= 0
                        ? 'View Run Summary'
                        : currentIdx + 1 >= deck.length
                        ? 'Claim Clear Bonus'
                        : 'Next Stage'}
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === 'VICTORY' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 border-3 border-black mx-auto flex items-center justify-center shadow-[0_4px_0_#000]">
              <MarioStarIcon className="w-9 h-9" />
            </div>
            <h4 className="text-2xl sm:text-3xl font-black font-display text-white tabular-nums">
              STAGE CLEARED! ({score}/{deck.length})
            </h4>
            <p className="text-xs sm:text-sm font-bold text-emerald-300 inline-flex items-center gap-1.5">
              <MarioCoinIcon className="w-4 h-4" />
              <span>+{victoryCoins} Bonus Gold Coins Banked!</span>
            </p>
            <div>
              <button
                type="button"
                data-start="true"
                onClick={startRun}
                className="min-h-[46px] px-6 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Play Fresh Shuffled Deck</span>
              </button>
            </div>
          </div>
        )}

        {phase === 'GAME_OVER' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-600 border-3 border-black mx-auto flex items-center justify-center text-white">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black font-display text-white tabular-nums">
              OUT OF HEARTS ({score}/{deck.length} CLEARED)
            </h4>
            <button
              type="button"
              data-start="true"
              onClick={startRun}
              className="min-h-[46px] px-6 py-2 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>Retry Shuffled Run</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const CaptainToadMinecartGame: React.FC<RoyalVaultGameProps> = (props) => (
  <RoyalArcadeEngine
    {...props}
    deckKey="royal_captain_toad_minecart"
    gameTitle="Captain Toad's Special-Workers Minecart"
    kickerBadge="WORLD 4 • KASAMBAHAY, CHILD LABOR, PWD & TELECOMMUTING"
    description="Ride Captain Toad's headlamp minecart through World 4 statutory protections! Master R.A. 10361 Kasambahay SIL/rest rules, R.A. 9231 Child Labor caps, R.A. 7277 100% PWD parity, and R.A. 11165 Telecommuting."
    bannerGradientClass="bg-gradient-to-r from-amber-800 via-red-900 to-slate-900"
    accentButtonClass="bg-amber-400 hover:bg-amber-300 text-slate-950"
    icon={<Compass className="w-6 h-6" />}
    bank={CAPTAIN_TOAD_MINECART_BANK}
    victoryCoins={30}
    reportWorldCode="w4"
  />
);

export const DaisyHolidayDerbyGame: React.FC<RoyalVaultGameProps> = (props) => (
  <RoyalArcadeEngine
    {...props}
    deckKey="royal_daisy_holiday_derby"
    gameTitle="Princess Daisy's Sarasaland Holiday Derby"
    kickerBadge="HOLIDAYS • REGULAR, DOUBLE & PRECEDING-DAY TRAPS"
    description="Sprint across Sarasaland's Holiday Matrix! Conquer Regular vs. Special Non-Working Day multipliers (100%, 150%, 200%, 300%), Double Holidays, <10 retail exemptions, and successive-holiday absence traps."
    bannerGradientClass="bg-gradient-to-r from-orange-800 via-amber-800 to-slate-900"
    accentButtonClass="bg-orange-300 hover:bg-orange-200 text-slate-950"
    icon={<Sun className="w-6 h-6" />}
    bank={DAISY_HOLIDAY_DERBY_BANK}
    victoryCoins={30}
    reportWorldCode="holidays"
  />
);

export const DryBonesCryptGame: React.FC<RoyalVaultGameProps> = (props) => (
  <RoyalArcadeEngine
    {...props}
    deckKey="royal_dry_bones_crypt"
    gameTitle="Dry Bones' Prescriptive & Due Process Crypt"
    kickerBadge="DEADLINES • 1-YR ULP, 3-YR MONEY, 4-YR DISMISSAL & NTE"
    description="Unlock the castle crypt before statutory claims prescribe! Distinguish 1-Year ULP, 3-Year Money Claims, 4-Year Illegal Dismissal, 5-Day NTE, 30-Day DOLE Notice, and the 6-Month Floating Status cap."
    bannerGradientClass="bg-gradient-to-r from-slate-800 via-zinc-900 to-indigo-950"
    accentButtonClass="bg-cyan-400 hover:bg-cyan-300 text-slate-950"
    icon={<ShieldAlert className="w-6 h-6" />}
    bank={DRY_BONES_CRYPT_BANK}
    victoryCoins={30}
    reportWorldCode="w5"
  />
);

export const PaulineWageConcertGame: React.FC<RoyalVaultGameProps> = (props) => (
  <RoyalArcadeEngine
    {...props}
    deckKey="royal_pauline_wage_concert"
    gameTitle="Mayor Pauline's Metro Wage Festival"
    kickerBadge="WORLD 3 • R.A. 11360, P.D. 851, FACILITIES & R.A. 8188"
    description="Headline Metro Kingdom's Wage Festival! Hit every statutory note on 100% Service Charges, P.D. 851 13th Month Pay, Art. 102 Legal Tender, Purpose Test (Facilities vs. Supplements), and R.A. 8188 Double Indemnity."
    bannerGradientClass="bg-gradient-to-r from-rose-900 via-red-900 to-purple-950"
    accentButtonClass="bg-rose-300 hover:bg-rose-200 text-slate-950"
    icon={<Music className="w-6 h-6" />}
    bank={PAULINE_WAGE_CONCERT_BANK}
    victoryCoins={35}
    reportWorldCode="w3"
  />
);
