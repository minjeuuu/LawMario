import React, { useState, useEffect } from 'react';
import {
  X,
  Calculator,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  Flame,
  ArrowRight,
  TrendingUp,
  Percent,
} from 'lucide-react';
import {
  MarioCoinIcon,
  MarioStarIcon,
  MarioMushroomIcon,
  MarioFireFlowerIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';

export interface MultiplierDrillScenario {
  id: string;
  scenarioTitle: string;
  dayType: string;
  condition: string;
  correctMultiplier: number; // e.g. 260 for 260%
  multiplierLabel: string; // '260%'
  options: number[]; // e.g. [200, 230, 260, 300]
  formula: string;
  citation: string;
  proTip: string;
}

export const MULTIPLIER_DRILL_DECK: MultiplierDrillScenario[] = [
  {
    id: 'reg_hol_unworked',
    scenarioTitle: 'Regular Holiday (Unworked)',
    dayType: 'Regular Holiday (Art. 94)',
    condition: 'Employee does not report to work (provided present or on paid leave on prior day)',
    correctMultiplier: 100,
    multiplierLabel: '100%',
    options: [0, 50, 100, 125],
    formula: '100% of regular daily wage',
    citation: 'Art. 94(a) Labor Code / DOLE Handbook',
    proTip: 'Subject to retail/service exemption (<10 workers). No work, full basic pay!',
  },
  {
    id: 'reg_hol_worked',
    scenarioTitle: 'Regular Holiday (Worked First 8 Hours)',
    dayType: 'Regular Holiday (Art. 94)',
    condition: 'Employee works regular 8 hours on an ordinary workday',
    correctMultiplier: 200,
    multiplierLabel: '200%',
    options: [130, 150, 200, 260],
    formula: 'Daily Wage x 200%',
    citation: 'Art. 94(b) Labor Code',
    proTip: 'Double pay! 100% holiday wage + 100% compensation for work rendered.',
  },
  {
    id: 'reg_hol_ot',
    scenarioTitle: 'Regular Holiday Overtime',
    dayType: 'Regular Holiday (Art. 94 & 87)',
    condition: 'Employee performs overtime beyond 8 hours on a regular holiday',
    correctMultiplier: 260,
    multiplierLabel: '260%',
    options: [200, 225, 250, 260],
    formula: 'Hourly rate x 200% x 130% = 260%',
    citation: 'Art. 87 & 94 Labor Code',
    proTip: 'Holiday hourly wage (200%) plus 30% holiday overtime premium = 260% per OT hour.',
  },
  {
    id: 'reg_hol_rest_day',
    scenarioTitle: 'Regular Holiday on Scheduled Rest Day',
    dayType: 'Regular Holiday + Rest Day',
    condition: 'Employee works first 8 hours on a regular holiday that coincides with their rest day',
    correctMultiplier: 260,
    multiplierLabel: '260%',
    options: [200, 230, 260, 300],
    formula: 'Daily Wage x 200% x 130% = 260%',
    citation: 'Art. 93(c) & 94 Labor Code',
    proTip: '200% holiday rate plus 30% rest day premium on the 200% rate = 260% of basic rate!',
  },
  {
    id: 'reg_hol_rest_day_ot',
    scenarioTitle: 'Regular Holiday + Rest Day Overtime',
    dayType: 'Regular Holiday + Rest Day + OT',
    condition: 'Employee works overtime in excess of 8 hours on a regular holiday rest day',
    correctMultiplier: 338,
    multiplierLabel: '338%',
    options: [260, 300, 338, 390],
    formula: 'Hourly rate x 260% x 130% = 338%',
    citation: 'Art. 87, 93(c) & 94 Labor Code',
    proTip: '260% rest day holiday rate x 130% overtime premium = 338% per overtime hour!',
  },
  {
    id: 'special_day_unworked',
    scenarioTitle: 'Special Non-Working Day (Unworked)',
    dayType: 'Special Non-Working Day',
    condition: 'Employee does not work on Ninoy Aquino Day or All Saints Day',
    correctMultiplier: 0,
    multiplierLabel: '0% (No Work, No Pay)',
    options: [0, 50, 100, 130],
    formula: 'No pay unless favorable company policy / CBA exists',
    citation: 'DOLE Holiday Guidelines / Principle of Fair Day\'s Wage',
    proTip: '"No work, no pay" applies unless company practice or CBA provides pay.',
  },
  {
    id: 'special_day_worked',
    scenarioTitle: 'Special Non-Working Day (Worked First 8 Hours)',
    dayType: 'Special Non-Working Day',
    condition: 'Employee works standard 8 hours on a regular working day',
    correctMultiplier: 130,
    multiplierLabel: '130%',
    options: [100, 125, 130, 150],
    formula: 'Basic daily wage + 30% premium = 130%',
    citation: 'Art. 93 Labor Code / DOLE Guidelines',
    proTip: '30% statutory premium on basic wage for work on a special holiday.',
  },
  {
    id: 'special_day_ot',
    scenarioTitle: 'Special Non-Working Day Overtime',
    dayType: 'Special Day + Overtime',
    condition: 'Employee performs overtime work beyond 8 hours on a special non-working day',
    correctMultiplier: 169,
    multiplierLabel: '169%',
    options: [130, 150, 169, 195],
    formula: 'Hourly rate x 130% x 130% = 169%',
    citation: 'Art. 87 & 93 Labor Code',
    proTip: '130% special day hourly rate multiplied by 130% overtime premium = 169% per OT hour.',
  },
  {
    id: 'special_day_rest_day',
    scenarioTitle: 'Special Non-Working Day on Scheduled Rest Day',
    dayType: 'Special Day + Rest Day',
    condition: 'Employee works first 8 hours on a special day that falls on their rest day',
    correctMultiplier: 150,
    multiplierLabel: '150%',
    options: [130, 150, 169, 200],
    formula: 'Basic daily wage + 50% premium = 150%',
    citation: 'Art. 93(c) Labor Code',
    proTip: 'Special holiday coincident with rest day earns a 50% premium instead of 30%!',
  },
  {
    id: 'special_day_rest_day_ot',
    scenarioTitle: 'Special Day + Rest Day Overtime',
    dayType: 'Special Day + Rest Day + OT',
    condition: 'Employee performs overtime on a special non-working day that falls on rest day',
    correctMultiplier: 195,
    multiplierLabel: '195%',
    options: [150, 169, 195, 230],
    formula: 'Hourly rate x 150% x 130% = 195%',
    citation: 'Art. 87 & 93(c) Labor Code',
    proTip: '150% special rest day rate x 130% overtime premium = 195% per OT hour.',
  },
  {
    id: 'ordinary_ot',
    scenarioTitle: 'Ordinary Workday Overtime',
    dayType: 'Ordinary Day (Art. 87)',
    condition: 'Work rendered in excess of 8 normal hours on a regular Monday to Friday',
    correctMultiplier: 125,
    multiplierLabel: '125%',
    options: [110, 120, 125, 130],
    formula: 'Regular hourly rate + at least 25% thereof = 125%',
    citation: 'Art. 87 Labor Code',
    proTip: 'Standard statutory overtime premium is at least 25% of regular wage.',
  },
  {
    id: 'rest_day_worked',
    scenarioTitle: 'Scheduled Rest Day (First 8 Hours)',
    dayType: 'Weekly Rest Day (Art. 91 & 93)',
    condition: 'Employee required or permitted to work on scheduled 24-hr rest day',
    correctMultiplier: 130,
    multiplierLabel: '130%',
    options: [120, 125, 130, 150],
    formula: 'Basic daily wage + 30% rest day premium = 130%',
    citation: 'Art. 93(a) Labor Code',
    proTip: 'At least 30% additional compensation on regular wage for rest day work.',
  },
  {
    id: 'double_holiday_worked',
    scenarioTitle: 'Double Regular Holiday (e.g. Maundy Thursday + Araw ng Kagitingan)',
    dayType: 'Double Regular Holiday',
    condition: 'Two regular holidays fall on the exact same date and employee works 8 hours',
    correctMultiplier: 300,
    multiplierLabel: '300%',
    options: [200, 260, 300, 390],
    formula: 'Daily wage x 300% (200% + 100% second holiday wage)',
    citation: 'DOLE Explanatory Bulletin on Double Holidays',
    proTip: 'Triple pay! 200% for the worked first holiday + 100% for unworked second holiday.',
  },
];

interface StatutoryMultiplierDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnCoins?: (amount: number) => void;
}

export const StatutoryMultiplierDrillModal: React.FC<StatutoryMultiplierDrillModalProps> = ({
  isOpen,
  onClose,
  onEarnCoins,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [questions, setQuestions] = useState<MultiplierDrillScenario[]>([]);

  // Initialize randomized drill deck
  const startFreshDrill = () => {
    const shuffled = [...MULTIPLIER_DRILL_DECK].sort(() => 0.5 - Math.random());
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsCompleted(false);
  };

  useEffect(() => {
    if (isOpen) {
      startFreshDrill();
    }
  }, [isOpen]);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const isAnswered = selectedAnswer !== null;
  const isCorrect = isAnswered && selectedAnswer === currentQ.correctMultiplier;

  const handlePickAnswer = (multiplierVal: number) => {
    if (isAnswered) return;
    setSelectedAnswer(multiplierVal);

    if (multiplierVal === currentQ.correctMultiplier) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxStreak) setMaxStreak(nextStreak);
      setScore((s) => s + 1);
      marioAudio.playCoin();
    } else {
      setStreak(0);
      marioAudio.playWrongAnswer();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      marioAudio.playClick();
    } else {
      // Completed drill
      setIsCompleted(true);
      const coinsEarned = 35 + score * 3 + (score === totalQuestions ? 20 : 0);
      onEarnCoins?.(coinsEarned);
      if (score === totalQuestions) {
        marioAudio.playStageClear();
      } else {
        marioAudio.playPowerUp();
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Statutory Multiplier Table Drill"
      className="fixed inset-0 z-[150] bg-slate-950/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-2.5 sm:p-5 overflow-y-auto overscroll-contain animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] flex flex-col bg-slate-900 border-4 border-black rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.9)] overflow-hidden text-white my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b-2 border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 border border-black flex items-center justify-center font-black shadow-[0_2px_0_#000] shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-amber-300 font-mario tracking-wider">
                  STATUTORY MULTIPLIER DRILL
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 font-mono">
                  DOLE BWC
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-200 break-words [overflow-wrap:anywhere] leading-snug">
                Philippine Labor Standards Wage Calculator Speed Test
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Drill"
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center cursor-pointer transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress & Streak Bar */}
        <div className="bg-slate-950/80 px-4 sm:px-6 py-2 border-b border-slate-800 flex items-center justify-between gap-2 text-xs font-mono font-bold">
          <div className="flex items-center gap-3">
            <span className="text-amber-300">
              Card {currentIndex + 1} / {totalQuestions}
            </span>
            <span className="text-emerald-400">
              Score: {score} / {totalQuestions}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-400">
            <Flame className={`w-4 h-4 ${streak > 1 ? 'animate-bounce text-orange-400' : ''}`} />
            <span>Streak: {streak}x</span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {!isCompleted ? (
            <>
              {/* Question Scenario Card */}
              <div className="bg-slate-950 rounded-2xl border-2 border-amber-400/80 p-4 sm:p-5 space-y-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono">
                    {currentQ.dayType}
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    {currentQ.citation}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-black font-display text-white leading-tight">
                  {currentQ.scenarioTitle}
                </h4>

                <p className="text-xs sm:text-sm font-semibold text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  {currentQ.condition}
                </p>

                <p className="text-xs font-bold text-amber-300 font-mono pt-1">
                  &rarr; What is the statutory compensation rate / pay multiplier?
                </p>
              </div>

              {/* Multiplier Option Choices */}
              <div className="grid grid-cols-2 gap-2.5">
                {currentQ.options.map((optVal) => {
                  const isThisSelected = selectedAnswer === optVal;
                  const isThisCorrect = optVal === currentQ.correctMultiplier;

                  let styleClass =
                    'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white hover:border-amber-400/80';
                  if (isAnswered) {
                    if (isThisCorrect) {
                      styleClass =
                        'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] font-black scale-[1.02]';
                    } else if (isThisSelected) {
                      styleClass = 'bg-rose-600 text-white border-rose-400 font-black';
                    } else {
                      styleClass = 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optVal}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handlePickAnswer(optVal)}
                      className={`min-h-[58px] p-3 rounded-2xl border-3 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer font-mono font-black ${styleClass}`}
                    >
                      <span className="text-lg sm:text-2xl tracking-tight">
                        {optVal === 0 ? '0%' : `${optVal}%`}
                      </span>
                      {optVal === 0 && (
                        <span className="text-[10px] font-sans font-bold opacity-90">
                          (No Work, No Pay)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Breakdown Drawer */}
              {isAnswered && (
                <div
                  className={`rounded-2xl p-4 border-2 space-y-2 animate-in fade-in duration-150 ${
                    isCorrect
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100'
                      : 'bg-rose-950/90 border-rose-500 text-rose-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-black text-sm">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          <span>EXACT MULTIPLIER! {currentQ.multiplierLabel}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                          <span>INCORRECT — Rate is {currentQ.multiplierLabel}</span>
                        </>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold opacity-80">
                      Formula: {currentQ.formula}
                    </span>
                  </div>

                  <p className="text-xs font-semibold leading-relaxed opacity-95">
                    <strong>Rule:</strong> {currentQ.proTip}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="min-h-[40px] px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 border-2 border-black shadow-[0_2px_0_#000] cursor-pointer active:translate-y-0.5 transition-all"
                    >
                      <span>{currentIndex + 1 < totalQuestions ? 'Next Rate' : 'View Results'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Results Screen */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 border-3 border-black mx-auto flex items-center justify-center shadow-[0_4px_0_#000]">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-black uppercase text-amber-300 font-mario tracking-wider">
                  DRILL COMPLETE
                </span>
                <h3 className="text-2xl font-black font-display text-white mt-1">
                  Wage Multiplier Master
                </h3>
                <p className="text-sm font-semibold text-slate-300 mt-1">
                  You scored <strong className="text-emerald-400 text-base">{score}</strong> out of{' '}
                  <strong>{totalQuestions}</strong> correct!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-center font-mono">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Accuracy</span>
                  <span className="text-xl font-black text-amber-300">
                    {Math.round((score / totalQuestions) * 100)}%
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Peak Streak</span>
                  <span className="text-xl font-black text-orange-400">{maxStreak}x</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/70 border border-emerald-500/80 rounded-2xl max-w-sm mx-auto flex items-center justify-center gap-2">
                <MarioCoinIcon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold text-emerald-200 font-mono">
                  +{35 + score * 3 + (score === totalQuestions ? 20 : 0)} Gold Coins Earned!
                </span>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={startFreshDrill}
                  className="min-h-[42px] px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase flex items-center gap-2 border border-slate-600 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Drill Again</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[42px] px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase flex items-center gap-2 border-2 border-black shadow-[0_2px_0_#000] cursor-pointer"
                >
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
