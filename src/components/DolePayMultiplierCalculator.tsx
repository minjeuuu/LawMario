import React, { useState, useMemo } from 'react';
import {
  X,
  Calculator,
  DollarSign,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Moon,
  Clock,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  MarioCoinIcon,
  MarioCoinBlockIcon,
  MarioSuperStarIcon,
  MarioMushroomIcon,
  MarioWarpPipeIcon,
  MarioFireFlowerIcon,
  MarioBrickStrip,
} from './MarioPrintIcons';
import { REGIONAL_MINIMUM_WAGES } from '../data/regionalWages';
import { marioAudio } from '../utils/audio';

interface DolePayMultiplierCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export type WorkFactor = 313 | 365 | 261;

export interface WageScenarioCalculation {
  id: string;
  label: string;
  multiplier: number;
  multiplierDisplay: string;
  citation: string;
  hours: number;
  hourlyRate: number;
  totalPesos: number;
  formulaDescription: string;
}

export const DolePayMultiplierCalculator: React.FC<DolePayMultiplierCalculatorProps> = ({
  isOpen,
  onClose,
}) => {
  // Input states
  const [dailyWage, setDailyWage] = useState<number>(645); // Default NCR
  const [workFactor, setWorkFactor] = useState<WorkFactor>(313);
  const [calcTab, setCalcTab] = useState<'overtime' | 'holidays' | 'benefits'>('overtime');
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  // Overtime & Night Diff hours state
  const [regularHours, setRegularHours] = useState<number>(8);
  const [ordinaryOtHours, setOrdinaryOtHours] = useState<number>(2);
  const [nightDiffHours, setNightDiffHours] = useState<number>(2);
  const [restDayOtHours, setRestDayOtHours] = useState<number>(0);

  // 13th month & retirement inputs
  const [monthsWorkedInYear, setMonthsWorkedInYear] = useState<number>(12);
  const [yearsOfService, setYearsOfService] = useState<number>(5);

  if (!isOpen) return null;

  // Derived wage factors
  const hourlyRate = dailyWage / 8;
  const estimatedMonthlySalary = (dailyWage * workFactor) / 12;

  // Scenarios computations
  const scenarios: WageScenarioCalculation[] = [
    {
      id: 'reg_8h',
      label: 'Regular Day (8 Hours)',
      multiplier: 1.0,
      multiplierDisplay: '100%',
      citation: 'Art. 83 Labor Code',
      hours: regularHours,
      hourlyRate,
      totalPesos: hourlyRate * regularHours * 1.0,
      formulaDescription: `₱${hourlyRate.toFixed(2)}/hr × ${regularHours} hrs × 100%`,
    },
    {
      id: 'ordinary_ot',
      label: 'Ordinary Day Overtime (Beyond 8h)',
      multiplier: 1.25,
      multiplierDisplay: '125%',
      citation: 'Art. 87 Labor Code',
      hours: ordinaryOtHours,
      hourlyRate,
      totalPesos: hourlyRate * ordinaryOtHours * 1.25,
      formulaDescription: `₱${hourlyRate.toFixed(2)}/hr × ${ordinaryOtHours} hrs × 125%`,
    },
    {
      id: 'nsd',
      label: 'Night Shift Differential (10PM–6AM)',
      multiplier: 1.1,
      multiplierDisplay: '+10% (110%)',
      citation: 'Art. 86 Labor Code',
      hours: nightDiffHours,
      hourlyRate,
      totalPesos: hourlyRate * nightDiffHours * 0.1,
      formulaDescription: `₱${hourlyRate.toFixed(2)}/hr × ${nightDiffHours} hrs × 10% premium`,
    },
    {
      id: 'rest_day',
      label: 'Scheduled Rest Day / Special Non-Working Day',
      multiplier: 1.3,
      multiplierDisplay: '130%',
      citation: 'Art. 93 Labor Code',
      hours: 8,
      hourlyRate,
      totalPesos: hourlyRate * 8 * 1.3,
      formulaDescription: `₱${dailyWage.toFixed(2)} × 130%`,
    },
    {
      id: 'rest_day_ot',
      label: 'Rest Day / Special Day Overtime',
      multiplier: 1.69,
      multiplierDisplay: '169% (130% × 130%)',
      citation: 'Art. 93 par. 2',
      hours: restDayOtHours,
      hourlyRate,
      totalPesos: hourlyRate * restDayOtHours * 1.69,
      formulaDescription: `₱${hourlyRate.toFixed(2)}/hr × ${restDayOtHours} hrs × 169%`,
    },
    {
      id: 'special_on_rest',
      label: 'Special Day Falling on Scheduled Rest Day',
      multiplier: 1.5,
      multiplierDisplay: '150%',
      citation: 'DOLE BWC Guidelines',
      hours: 8,
      hourlyRate,
      totalPesos: hourlyRate * 8 * 1.5,
      formulaDescription: `₱${dailyWage.toFixed(2)} × 150%`,
    },
    {
      id: 'reg_holiday_unworked',
      label: 'Regular Holiday (Unworked)',
      multiplier: 1.0,
      multiplierDisplay: '100% (Paid)',
      citation: 'Art. 94 Labor Code',
      hours: 8,
      hourlyRate,
      totalPesos: dailyWage * 1.0,
      formulaDescription: `₱${dailyWage.toFixed(2)} × 100% (Provided employee present/on paid leave day before)`,
    },
    {
      id: 'reg_holiday_worked',
      label: 'Regular Holiday (Worked First 8h)',
      multiplier: 2.0,
      multiplierDisplay: '200% (Double Pay)',
      citation: 'Art. 94 par. 2',
      hours: 8,
      hourlyRate,
      totalPesos: dailyWage * 2.0,
      formulaDescription: `₱${dailyWage.toFixed(2)} × 200%`,
    },
    {
      id: 'reg_holiday_ot',
      label: 'Regular Holiday Overtime',
      multiplier: 2.6,
      multiplierDisplay: '260% (200% × 130%)',
      citation: 'Art. 94 & Art. 87',
      hours: 2,
      hourlyRate,
      totalPesos: hourlyRate * 2 * 2.6,
      formulaDescription: `₱${hourlyRate.toFixed(2)}/hr × 2 hrs × 260%`,
    },
    {
      id: 'reg_holiday_rest',
      label: 'Regular Holiday on Employee Rest Day',
      multiplier: 2.6,
      multiplierDisplay: '260%',
      citation: 'DOLE Handbook',
      hours: 8,
      hourlyRate,
      totalPesos: dailyWage * 2.6,
      formulaDescription: `₱${dailyWage.toFixed(2)} × 260%`,
    },
    {
      id: 'special_day_rest_ot',
      label: 'Special Day Overtime on Rest Day (Beyond 8h)',
      multiplier: 1.95,
      multiplierDisplay: '195% (150% × 130%)',
      citation: 'Art. 93 par. 2, Labor Code',
      hours: 2,
      hourlyRate,
      totalPesos: hourlyRate * 2 * 1.95,
      formulaDescription: `₱${hourlyRate.toFixed(2)}/hr × 2 hrs × 195% (150% special rest day rate × 130% OT)`,
    },
    {
      id: 'double_holiday',
      label: 'Double Regular Holiday (Worked First 8h)',
      multiplier: 3.0,
      multiplierDisplay: '300% (Triple Pay)',
      citation: 'Asian Transmission Corp. v. CA',
      hours: 8,
      hourlyRate,
      totalPesos: dailyWage * 3.0,
      formulaDescription: `₱${dailyWage.toFixed(2)} × 300% (Triple Pay)`,
    },
    {
      id: 'double_holiday_rest',
      label: 'Double Regular Holiday on Scheduled Rest Day',
      multiplier: 3.9,
      multiplierDisplay: '390% (300% + 30% of 300%)',
      citation: 'Asian Transmission Corp. / DOLE BWC',
      hours: 8,
      hourlyRate,
      totalPesos: dailyWage * 3.9,
      formulaDescription: `₱${dailyWage.toFixed(2)} × 390% (Double Holiday 300% + 30% rest day premium = 390%)`,
    },
  ];

  // 13th month & retirement calculation
  const thirteenthMonthPay = (dailyWage * (workFactor / 12) * monthsWorkedInYear) / 12;
  const silCashValue = dailyWage * 5;
  // Art. 302 Retirement Pay = 22.5 days per year of service: 15 days + 2.5 days SIL + 4.17 days (1/12 of 13th mo)
  const oneHalfMonthRetirement = dailyWage * 22.5;
  const totalRetirementPay = oneHalfMonthRetirement * yearsOfService;

  const handleCopySummary = () => {
    marioAudio.playCoin();
    const text = `=========================================
DOLE PHILIPPINE LABOR STANDARDS PAY SLIP
Daily Rate: ₱${dailyWage.toFixed(2)} | Hourly Rate: ₱${hourlyRate.toFixed(2)}
Estimated Monthly (Factor ${workFactor}): ₱${estimatedMonthlySalary.toFixed(2)}
-----------------------------------------
1. Regular Day (8h): ₱${dailyWage.toFixed(2)}
2. Ordinary Overtime (+2h @ 125%): ₱${(hourlyRate * 2 * 1.25).toFixed(2)}
3. Night Differential (+2h @ 110%): +₱${(hourlyRate * 2 * 0.1).toFixed(2)}
4. Rest Day / Special Day (130%): ₱${(dailyWage * 1.3).toFixed(2)}
5. Special Day on Rest Day (150%): ₱${(dailyWage * 1.5).toFixed(2)}
6. Regular Holiday Worked (200%): ₱${(dailyWage * 2.0).toFixed(2)}
7. Regular Holiday on Rest Day (260%): ₱${(dailyWage * 2.6).toFixed(2)}
8. Double Regular Holiday (300%): ₱${(dailyWage * 3.0).toFixed(2)}
9. Double Holiday on Rest Day (390%): ₱${(dailyWage * 3.9).toFixed(2)}
-----------------------------------------
Statutory 13th Month Pay (${monthsWorkedInYear} mos): ₱${thirteenthMonthPay.toFixed(2)}
Service Incentive Leave (5 days cash value): ₱${silCashValue.toFixed(2)}
Retirement Pay (Art. 302, ${yearsOfService} yrs @ 22.5 days/yr): ₱${totalRetirementPay.toFixed(2)}
=========================================
Super Mario Labor Adventure · Philippine Labor Standards Guide
Attribution: Corpuz (Main Creator) et al.`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2400);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dole-calc-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border-4 border-amber-400 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 px-4 py-3 sm:px-6 sm:py-3.5 border-b-4 border-black flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Calculator className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-200 font-mono block">
                DOLE BWC STATUTORY WAGE &amp; OVERTIME SIMULATOR
              </span>
              <h2
                id="dole-calc-title"
                className="text-lg sm:text-xl font-black text-white tracking-wide"
              >
                DOLE Pay Multiplier Calculator
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 border-2 border-black shadow-[0_2px_0_#000] cursor-pointer"
              title="Copy computation breakdown to clipboard"
            >
              {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedNotice ? 'Copied!' : 'Copy Slip'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                marioAudio.playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-slate-950 hover:bg-red-950 text-white border-2 border-black flex items-center justify-center cursor-pointer shadow-md"
              aria-label="Close DOLE Calculator"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mario Brick Accent Strip */}
        <MarioBrickStrip className="w-full h-2 shrink-0" />

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-slate-100">
          {/* Top Wage Input Strip */}
          <div className="bg-slate-850 bg-slate-800/90 border-2 border-slate-700 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <MarioCoinBlockIcon size={20} />
                <span className="font-black text-sm uppercase text-amber-300 tracking-wide">
                  Base Statutory Wage Rate
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-mono">Factor:</span>
                {([313, 261, 365] as WorkFactor[]).map((factor) => (
                  <button
                    key={factor}
                    type="button"
                    onClick={() => {
                      setWorkFactor(factor);
                      marioAudio.playClick();
                    }}
                    className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                      workFactor === factor
                        ? 'bg-amber-400 text-slate-950 border-black'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    {factor} Days
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Daily Minimum Wage (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-amber-400 font-black font-mono">₱</span>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    step="1"
                    value={dailyWage}
                    onChange={(e) => setDailyWage(Math.max(1, Number(e.target.value) || 0))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border-2 border-slate-600 focus:border-amber-400 rounded-xl font-mono font-black text-amber-300 text-lg outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-700">
                <span className="text-[11px] font-mono text-slate-400 block">Equivalent Hourly Rate (÷ 8h)</span>
                <span className="text-xl font-black font-mono text-emerald-400 tabular-nums">
                  ₱{hourlyRate.toFixed(2)}/hr
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-700">
                <span className="text-[11px] font-mono text-slate-400 block">Est. Monthly Basic Salary</span>
                <span className="text-xl font-black font-mono text-sky-400 tabular-nums">
                  ₱{estimatedMonthlySalary.toFixed(2)}/mo
                </span>
              </div>
            </div>

            {/* Quick Regional Wage Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                Quick Regional Wage Presets (DOLE RTWPB 2026):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'NCR (Metro Manila)', rate: 645 },
                  { label: 'Region IV-A (Calabarzon)', rate: 520 },
                  { label: 'Region III (Central Luzon)', rate: 500 },
                  { label: 'Region VII (Central Visayas)', rate: 468 },
                  { label: 'Region XI (Davao)', rate: 462 },
                  { label: 'BARMM', rate: 361 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setDailyWage(preset.rate);
                      marioAudio.playPowerUp();
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold cursor-pointer ${
                      dailyWage === preset.rate
                        ? 'bg-amber-400 text-slate-950 font-black border-black'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400 hover:text-white'
                    }`}
                  >
                    {preset.label}: ₱{preset.rate}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b-2 border-slate-700 gap-2 overflow-x-auto scrollbar-thin">
            {[
              {
                id: 'overtime',
                fullLabel: 'Overtime & Night Shift (Arts. 86–87)',
                shortLabel: 'Overtime & NSD',
                icon: <Clock className="w-3.5 h-3.5 shrink-0" />,
              },
              {
                id: 'holidays',
                fullLabel: 'Holidays & Rest Days (Arts. 93–94)',
                shortLabel: 'Holidays & Rest',
                icon: <Calendar className="w-3.5 h-3.5 shrink-0" />,
              },
              {
                id: 'benefits',
                fullLabel: '13th Month & Retirement (Art. 302)',
                shortLabel: '13th Mo. & Retire',
                icon: <ShieldCheck className="w-3.5 h-3.5 shrink-0" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCalcTab(tab.id as any);
                  marioAudio.playTabSwitch();
                }}
                className={`px-3.5 py-2 font-black text-xs rounded-t-xl border-t-2 border-x-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                  calcTab === tab.id
                    ? 'bg-slate-800 text-amber-300 border-amber-400'
                    : 'bg-slate-950 text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.fullLabel}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Overtime & Night Shift */}
          {calcTab === 'overtime' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Regular Day Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={regularHours}
                    onChange={(e) => setRegularHours(Math.max(1, Math.min(8, Number(e.target.value) || 0)))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg font-mono font-bold text-amber-300 text-sm"
                  />
                  <span className="text-[10px] text-slate-400 block">Max 8 hrs under Art. 83</span>
                </div>

                <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Ordinary Overtime Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="16"
                    value={ordinaryOtHours}
                    onChange={(e) => setOrdinaryOtHours(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg font-mono font-bold text-amber-300 text-sm"
                  />
                  <span className="text-[10px] text-slate-400 block">+25% premium (125%)</span>
                </div>

                <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Night Diff Hours (10PM–6AM)</label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={nightDiffHours}
                    onChange={(e) => setNightDiffHours(Math.max(0, Math.min(8, Number(e.target.value) || 0)))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg font-mono font-bold text-amber-300 text-sm"
                  />
                  <span className="text-[10px] text-slate-400 block">+10% premium under Art. 86</span>
                </div>
              </div>

              {/* Total Day Pay Simulation Box */}
              <div className="bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                    <MarioSuperStarIcon size={16} />
                    <span>Combined Single Shift Pay Estimate</span>
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    ₱{(hourlyRate * regularHours + hourlyRate * ordinaryOtHours * 1.25 + hourlyRate * nightDiffHours * 0.1).toFixed(2)}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Includes {regularHours}h regular + {ordinaryOtHours}h overtime + {nightDiffHours}h night shift premium.
                  </p>
                </div>
                <div className="text-right font-mono text-xs text-slate-400 shrink-0">
                  <div>Base: ₱{(hourlyRate * regularHours).toFixed(2)}</div>
                  <div>OT (+25%): ₱{(hourlyRate * ordinaryOtHours * 1.25).toFixed(2)}</div>
                  <div>NSD (+10%): +₱{(hourlyRate * nightDiffHours * 0.1).toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Holidays & Rest Days */}
          {calcTab === 'holidays' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scenarios.slice(3).map((sc) => (
                  <div
                    key={sc.id}
                    className="bg-slate-800 border border-slate-700 hover:border-amber-400/80 rounded-xl p-3.5 space-y-1.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs text-white leading-tight">{sc.label}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[11px] font-mono shrink-0">
                        {sc.multiplierDisplay}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-2 font-mono">
                      <span className="text-sm font-black text-emerald-400">
                        ₱{sc.totalPesos.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">{sc.citation}</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 font-mono">{sc.formulaDescription}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: 13th Month & Retirement */}
          {calcTab === 'benefits' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 13th Month Pay Card */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
                    <MarioCoinIcon size={18} />
                    <span className="font-black text-sm uppercase text-amber-300">
                      13th Month Pay (P.D. 851)
                    </span>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Months Worked in Calendar Year</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={monthsWorkedInYear}
                      onChange={(e) => setMonthsWorkedInYear(Math.max(1, Math.min(12, Number(e.target.value) || 0)))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg font-mono font-bold text-amber-300 text-sm"
                    />
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg">
                    <span className="text-[11px] text-slate-400 block font-mono">Computed 13th Month Pay:</span>
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      ₱{thirteenthMonthPay.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Formula: (Total basic salary earned in year) ÷ 12
                    </span>
                  </div>
                </div>

                {/* Retirement Pay Card (Art. 302) */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
                    <MarioMushroomIcon size={18} variant="1up" />
                    <span className="font-black text-sm uppercase text-amber-300">
                      Retirement Pay (Art. 302)
                    </span>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Years of Service (Fraction ≥ 6 mos = 1 yr)</label>
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={yearsOfService}
                      onChange={(e) => setYearsOfService(Math.max(5, Number(e.target.value) || 5))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg font-mono font-bold text-amber-300 text-sm"
                    />
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg space-y-1">
                    <span className="text-[11px] text-slate-400 block font-mono">Total Statutory Retirement Pay:</span>
                    <span className="text-2xl font-black font-mono text-amber-300">
                      ₱{totalRetirementPay.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      22.5 days/yr: 15d basic + 2.5d (5d SIL) + 4.17d (1/12 13th mo) = ₱{oneHalfMonthRetirement.toFixed(2)}/yr
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Incentive Leave (SIL) 5 Days */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-black uppercase text-amber-300 block">
                    Service Incentive Leave (SIL) Cash Value (Art. 95)
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    5 days paid leave convertible to cash if unused at end of year.
                  </p>
                </div>
                <div className="text-right font-mono shrink-0">
                  <span className="text-lg font-black text-emerald-400 block">₱{silCashValue.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500">₱{dailyWage.toFixed(2)} × 5 days</span>
                </div>
              </div>

              {/* Statutory Retirement Age Benchmarks Callout */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <MarioFireFlowerIcon size={16} />
                  <span className="font-black uppercase text-amber-300 tracking-wide">
                    Statutory Retirement Age Milestones (Art. 302 / R.A. 7641 &amp; R.A. 10757)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 space-y-0.5">
                    <span className="font-bold text-amber-300 block">General Private Sector:</span>
                    <div>Optional: <span className="font-mono text-emerald-400 font-bold">60 years old</span> (min. 5 yrs service)</div>
                    <div>Compulsory: <span className="font-mono text-amber-400 font-bold">65 years old</span></div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 space-y-0.5">
                    <span className="font-bold text-amber-300 block">Underground / Surface Miners (R.A. 10757):</span>
                    <div>Optional: <span className="font-mono text-emerald-400 font-bold">50 years old</span> (min. 5 yrs service)</div>
                    <div>Compulsory: <span className="font-mono text-amber-400 font-bold">60 years old</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-4 py-3 sm:px-6 border-t-2 border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <span>Labor Code of the Philippines (P.D. No. 442) · DOLE BWC Guidelines</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 font-bold cursor-pointer"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
