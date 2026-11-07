import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flame,
  ArrowRight,
  BrainCircuit,
  Scale,
} from 'lucide-react';
import { MarioCoinIcon, MarioStarIcon } from './MarioIcons';
import { marioAudio } from '../utils/audio';

export interface ReverseCitationItem {
  id: string;
  doctrine: string;
  summary: string;
  correctCitation: string; // e.g. "Art. 88"
  correctTitle: string; // e.g. "Undertime Not Offset by Overtime"
  options: { citation: string; title: string }[];
  landmarkCase?: string;
}

export const REVERSE_CITATION_DECK: ReverseCitationItem[] = [
  {
    id: 'rc_undertime_ot',
    doctrine:
      'Undertime work on any particular day shall NOT be offset by overtime work on any other day. Permission given to the employee to take time off shall not exempt the employer from paying overtime premium.',
    summary: 'Prohibition against offsetting undertime with overtime.',
    correctCitation: 'Art. 88',
    correctTitle: 'Undertime not offset by overtime',
    options: [
      { citation: 'Art. 87', title: 'Overtime work' },
      { citation: 'Art. 88', title: 'Undertime not offset by overtime' },
      { citation: 'Art. 89', title: 'Emergency overtime work' },
      { citation: 'Art. 90', title: 'Computation of additional compensation' },
    ],
  },
  {
    id: 'rc_nsd',
    doctrine:
      'Every covered employee shall be paid an additional compensation of not less than ten percent (10%) of their regular wage for each hour of work performed between ten o’clock in the evening and six o’clock in the morning.',
    summary: 'Night Shift Differential (10% premium from 10 PM to 6 AM).',
    correctCitation: 'Art. 86',
    correctTitle: 'Night shift differential',
    options: [
      { citation: 'Art. 85', title: 'Meal periods' },
      { citation: 'Art. 86', title: 'Night shift differential' },
      { citation: 'Art. 87', title: 'Overtime work' },
      { citation: 'Art. 91', title: 'Right to weekly rest day' },
    ],
  },
  {
    id: 'rc_service_charge',
    doctrine:
      '100% of all service charges collected by hotels, restaurants, and similar establishments shall be distributed completely and equally among covered rank-and-file and supervisory employees.',
    summary: 'Complete and equal distribution of service charges (abolished 85/15 split).',
    correctCitation: 'R.A. 11360',
    correctTitle: 'Service Charges Equal Distribution Act (amending Art. 96)',
    options: [
      { citation: 'Art. 96 (Original)', title: 'Old 85-15 Service Charge Rule' },
      { citation: 'R.A. 11360', title: 'Service Charges Equal Distribution Act' },
      { citation: 'P.D. 851', title: '13th Month Pay Law' },
      { citation: 'Art. 100', title: 'Prohibition against Diminution of Benefits' },
    ],
    landmarkCase: 'DOLE Department Order No. 206-19',
  },
  {
    id: 'rc_sil',
    doctrine:
      'Every covered employee who has rendered at least one year of service shall be entitled to a yearly service incentive leave of five days with pay, commutable to cash at year end.',
    summary: '5-Day Service Incentive Leave (SIL) after 1 year service.',
    correctCitation: 'Art. 95',
    correctTitle: 'Right to service incentive leave',
    options: [
      { citation: 'Art. 94', title: 'Right to holiday pay' },
      { citation: 'Art. 95', title: 'Right to service incentive leave' },
      { citation: 'Art. 91', title: 'Right to weekly rest day' },
      { citation: 'Art. 102', title: 'Forms of payment' },
    ],
    landmarkCase: 'Auto Bus Transport Systems v. Bautista (G.R. No. 156367)',
  },
  {
    id: 'rc_13th_month',
    doctrine:
      'All employers are required to pay all their rank-and-file employees a 13th month pay not later than December 24 of every year, provided the employee has worked for at least one (1) month in the calendar year.',
    summary: 'Mandatory 13th Month Pay payable on or before Dec 24.',
    correctCitation: 'P.D. 851',
    correctTitle: '13th-Month Pay Decree',
    options: [
      { citation: 'Art. 97', title: 'Definition of Wages' },
      { citation: 'Art. 102', title: 'Forms of Payment' },
      { citation: 'P.D. 851', title: '13th-Month Pay Decree' },
      { citation: 'R.A. 6715', title: 'Herrera Law' },
    ],
    landmarkCase: 'Revised Guidelines on the Implementation of 13th Month Pay Law',
  },
  {
    id: 'rc_maternity',
    doctrine:
      'Grants 105 days of paid maternity leave for live childbirth to all female workers in the private and public sectors, regardless of civil status or mode of delivery, with an optional 30-day unpaid extension and +15 days for Solo Parents.',
    summary: '105-Day Expanded Maternity Leave Law.',
    correctCitation: 'R.A. 11210',
    correctTitle: '105-Day Expanded Maternity Leave Act',
    options: [
      { citation: 'R.A. 8187', title: 'Paternity Leave Act of 1996' },
      { citation: 'R.A. 11210', title: '105-Day Expanded Maternity Leave Act' },
      { citation: 'R.A. 9710', title: 'Magna Carta of Women' },
      { citation: 'R.A. 11861', title: 'Expanded Solo Parents Welfare Act' },
    ],
  },
  {
    id: 'rc_diminution',
    doctrine:
      'Nothing in this Book shall be construed to eliminate or in any way diminish supplements, or other employee benefits being enjoyed at the time of promulgation of this Code.',
    summary: 'Non-Diminution of Benefits Principle (Ripened Company Practice).',
    correctCitation: 'Art. 100',
    correctTitle: 'Prohibition against elimination or diminution of benefits',
    options: [
      { citation: 'Art. 100', title: 'Non-Diminution of Benefits' },
      { citation: 'Art. 106', title: 'Contractor and Subcontractor' },
      { citation: 'Art. 113', title: 'Permissible Wage Deductions' },
      { citation: 'Art. 116', title: 'Withholding of Wages' },
    ],
    landmarkCase: 'Vergara v. Coca-Cola Bottlers Philippines (G.R. No. 176985)',
  },
  {
    id: 'rc_contracting',
    doctrine:
      'Where the contractor or subcontractor does not have substantial capital or investments in tools/machinery, or does not exercise the right of control over the performance of work, the principal is deemed the direct employer.',
    summary: 'Prohibition against Labor-Only Contracting (Substantial Capital & Control).',
    correctCitation: 'Art. 106 / D.O. 174-17',
    correctTitle: 'Contractor or Subcontractor',
    options: [
      { citation: 'Art. 106 / D.O. 174-17', title: 'Contractor or Subcontractor' },
      { citation: 'Art. 82', title: 'Coverage of Labor Standards' },
      { citation: 'Art. 124', title: 'Wage Distortion Standards' },
      { citation: 'Art. 295', title: 'Regular and Casual Employment' },
    ],
    landmarkCase: 'DOLE Department Order No. 174, Series of 2017',
  },
  {
    id: 'rc_retirement',
    doctrine:
      'In the absence of a retirement plan or agreement, an employee upon reaching the age of 60 years or more, but not beyond 65 years which is compulsory, who has served at least 5 years, may retire and receive 1/2 month salary per year (defined as 22.5 days).',
    summary: 'Statutory Retirement Pay (22.5 Days Formula: 15d basic + 5d SIL + 2.5d 13th mo).',
    correctCitation: 'Art. 302 [287]',
    correctTitle: 'Retirement from the Service',
    options: [
      { citation: 'Art. 297 [279]', title: 'Security of Tenure' },
      { citation: 'Art. 298 [283]', title: 'Closure and Authorized Causes' },
      { citation: 'Art. 302 [287]', title: 'Retirement from the Service' },
      { citation: 'Art. 306 [291]', title: 'Money Claims Prescription' },
    ],
    landmarkCase: 'Capitol Wireless, Inc. v. Confesor (G.R. No. 117174)',
  },
  {
    id: 'rc_telecommuting',
    doctrine:
      'Requires an employer to treat telecommuting employees in the same manner as comparable workers who work at the employer’s premises, ensuring equal pay, overtime, night shift differential, and career growth opportunities.',
    summary: 'Telecommuting Act & Principle of Fair Treatment.',
    correctCitation: 'R.A. 11165',
    correctTitle: 'Telecommuting Act',
    options: [
      { citation: 'R.A. 10361', title: 'Batas Kasambahay' },
      { citation: 'R.A. 11165', title: 'Telecommuting Act' },
      { citation: 'R.A. 11058', title: 'Occupational Safety and Health Standards Act' },
      { citation: 'R.A. 11313', title: 'Safe Spaces Act' },
    ],
  },
];

interface ReverseCitationRecitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnCoins?: (amount: number) => void;
}

export const ReverseCitationRecitationModal: React.FC<ReverseCitationRecitationModalProps> = ({
  isOpen,
  onClose,
  onEarnCoins,
}) => {
  const [deck, setDeck] = useState<ReverseCitationItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCitation, setSelectedCitation] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const startFresh = () => {
    const shuffled = [...REVERSE_CITATION_DECK].sort(() => 0.5 - Math.random());
    setDeck(shuffled);
    setCurrentIndex(0);
    setSelectedCitation(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsCompleted(false);
  };

  useEffect(() => {
    if (isOpen) {
      startFresh();
    }
  }, [isOpen]);

  if (!isOpen || deck.length === 0) return null;

  const currentQ = deck[currentIndex];
  const isAnswered = selectedCitation !== null;
  const isCorrect = isAnswered && selectedCitation === currentQ.correctCitation;

  const handlePick = (cit: string) => {
    if (isAnswered) return;
    setSelectedCitation(cit);
    if (cit === currentQ.correctCitation) {
      const next = streak + 1;
      setStreak(next);
      if (next > maxStreak) setMaxStreak(next);
      setScore((s) => s + 1);
      marioAudio.playCoin();
    } else {
      setStreak(0);
      marioAudio.playWrongAnswer();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < deck.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedCitation(null);
      marioAudio.playClick();
    } else {
      setIsCompleted(true);
      const earnedCoins = 35 + score * 3;
      onEarnCoins?.(earnedCoins);
      if (score === deck.length) {
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
      aria-label="Reverse Legal Citation Recitation"
      className="fixed inset-0 z-[150] bg-slate-950/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-2.5 sm:p-5 overflow-y-auto overscroll-contain animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] flex flex-col bg-slate-900 border-4 border-black rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.9)] overflow-hidden text-white my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b-2 border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-slate-950 border border-black flex items-center justify-center font-black shadow-[0_2px_0_#000] shrink-0">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-sky-300 font-mario tracking-wider block">
                REVERSE CITATION RECITATION
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-200 break-words [overflow-wrap:anywhere] leading-snug">
                Doctrine to Exact Article / Republic Act Matching
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Recitation"
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center cursor-pointer transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-950/80 px-4 sm:px-6 py-2 border-b border-slate-800 flex items-center justify-between gap-2 text-xs font-mono font-bold">
          <div className="flex items-center gap-3">
            <span className="text-sky-300">
              Recitation {currentIndex + 1} / {deck.length}
            </span>
            <span className="text-emerald-400">
              Score: {score} / {deck.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-400">
            <Flame className={`w-4 h-4 ${streak > 1 ? 'animate-bounce text-orange-400' : ''}`} />
            <span>Streak: {streak}x</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {!isCompleted ? (
            <>
              {/* Doctrine Card */}
              <div className="bg-slate-950 rounded-2xl border-2 border-sky-400/80 p-4 sm:p-5 space-y-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500 font-mono">
                  SUPREME COURT / STATUTORY DOCTRINE
                </span>

                <blockquote className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 italic">
                  &ldquo;{currentQ.doctrine}&rdquo;
                </blockquote>

                <p className="text-xs font-bold text-amber-300 font-mono pt-1">
                  &rarr; Which exact Labor Code Article or Republic Act codifies this rule?
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedCitation === opt.citation;
                  const isRight = opt.citation === currentQ.correctCitation;

                  let btnStyle =
                    'bg-slate-800 hover:bg-slate-700 text-white border-slate-700 hover:border-sky-400';
                  if (isAnswered) {
                    if (isRight) {
                      btnStyle = 'bg-emerald-600 text-white border-emerald-400 font-black shadow-md';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-600 text-white border-rose-400 font-black';
                    } else {
                      btnStyle = 'bg-slate-950/60 text-slate-500 border-slate-800 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt.citation}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handlePick(opt.citation)}
                      className={`min-h-[56px] p-3 rounded-2xl border-2 text-left flex flex-col justify-center transition-all cursor-pointer ${btnStyle}`}
                    >
                      <span className="font-mono font-black text-sm text-amber-300">
                        {opt.citation}
                      </span>
                      <span className="text-xs font-medium break-words [overflow-wrap:anywhere] leading-snug mt-0.5 opacity-90">
                        {opt.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {isAnswered && (
                <div
                  className={`rounded-2xl p-4 border-2 space-y-2 animate-in fade-in duration-150 ${
                    isCorrect
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100'
                      : 'bg-rose-950/90 border-rose-500 text-rose-100'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-sm">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span>CORRECT CODAL PROVISION!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        <span>INCORRECT — Codified under {currentQ.correctCitation}!</span>
                      </>
                    )}
                  </div>

                  <p className="text-xs font-semibold leading-relaxed">
                    <strong>Rule:</strong> {currentQ.summary}
                  </p>

                  {currentQ.landmarkCase && (
                    <p className="text-[11px] font-mono text-amber-300">
                      <strong>Controlling Authority:</strong> {currentQ.landmarkCase}
                    </p>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="min-h-[38px] px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 border-2 border-black shadow-[0_2px_0_#000] cursor-pointer"
                    >
                      <span>{currentIndex + 1 < deck.length ? 'Next Doctrine' : 'Finish'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Results Screen */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-sky-500 text-slate-950 border-3 border-black mx-auto flex items-center justify-center shadow-[0_4px_0_#000]">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-black uppercase text-sky-300 font-mario tracking-wider">
                  RECITATION MASTERED
                </span>
                <h3 className="text-2xl font-black font-display text-white mt-1">
                  Labor Law Codal Memory
                </h3>
                <p className="text-sm font-semibold text-slate-300 mt-1">
                  You scored <strong className="text-emerald-400 text-base">{score}</strong> out of{' '}
                  <strong>{deck.length}</strong> provisions!
                </p>
              </div>

              <div className="p-3 bg-emerald-950/70 border border-emerald-500/80 rounded-2xl max-w-sm mx-auto flex items-center justify-center gap-2">
                <MarioCoinIcon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold text-emerald-200 font-mono">
                  +{35 + score * 3} Gold Coins Earned!
                </span>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={startFresh}
                  className="min-h-[42px] px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase flex items-center gap-2 border border-slate-600 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Recite Again</span>
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
