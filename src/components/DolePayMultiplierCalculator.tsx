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
import {
  ALL_17_REGIONAL_WAGE_PRESETS,
  RegionalWagePresetItem,
} from '../utils/round13Features';

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
  const [islandFilter, setIslandFilter] = useState<'all' | 'luzon' | 'visayas' | 'mindanao'>('all');

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

  const handleResetDefaults = () => {
    setDailyWage(645);
    setWorkFactor(313);
    setRegularHours(8);
    setOrdinaryOtHours(2);
    setNightDiffHours(2);
    setRestDayOtHours(0);
    setMonthsWorkedInYear(12);
    setYearsOfService(5);
    marioAudio.playWarp();
  };

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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-[0_16px_40px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 px-4 py-3 sm:px-6 sm:py-3.5 border-b-4 border-black flex items-center justify-between gap-3 text-white shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 shadow-[0_2px_0_#000] shrink-0">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-200 font-mono block leading-tight">
                DOLE BWC STATUTORY WAGE &amp; OVERTIME SIMULATOR
              </span>
              <h2
                id="dole-calc-title"
                className="text-base sm:text-xl font-black text-white tracking-wide font-display break-words [overflow-wrap:anywhere] leading-tight"
              >
                DOLE Pay Multiplier Calculator
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs inline-flex items-center gap-1 border-2 border-black shadow-[0_2px_0_#000] cursor-pointer"
              title="Reset all inputs to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
            <button
              type="button"
              onClick={handleCopySummary}
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 border-2 border-black shadow-[0_2px_0_#000] cursor-pointer"
              title="Copy computation breakdown to clipboard"
            >
              {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNotice ? 'Copied!' : 'Copy Slip'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                marioAudio.playClick();
                onClose();
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-950 hover:bg-red-950 text-white border-2 border-black flex items-center justify-center cursor-pointer shadow-md"
              aria-label="Close DOLE Calculator"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mario Brick Accent Strip */}
        <MarioBrickStrip className="w-full h-2 shrink-0" />

        {/* Modal Body (Strictly overflow-x-hidden, no left-right scroll) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-5 text-slate-100">
          {/* Top Wage Input Strip */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-slate-700 rounded-2xl p-3.5 sm:p-5 space-y-3.5 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2">
                <MarioCoinBlockIcon size={22} />
                <span className="font-black text-xs sm:text-sm uppercase text-amber-300 tracking-wide font-display">
                  Base Statutory Wage Rate
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-mono text-[11px] font-bold">Annual Factor:</span>
                {([313, 261, 365] as WorkFactor[]).map((factor) => (
                  <button
                    key={factor}
                    type="button"
                    onClick={() => {
                      setWorkFactor(factor);
                      marioAudio.playClick();
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold cursor-pointer transition-all ${
                      workFactor === factor
                        ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000] font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    {factor}d
                  </button>
                ))}
              </div>
            </div>

            {/* Wage Input + Hourly + Monthly Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
              {/* Daily Minimum Wage Input */}
              <div className="bg-slate-950/90 border border-slate-700 rounded-xl p-3 space-y-1.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block font-mono">
                    Daily Wage Rate (₱)
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono">Min. ₱1</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-amber-400 font-black font-mono text-base">₱</span>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    step="1"
                    value={dailyWage}
                    onChange={(e) => setDailyWage(Math.max(1, Number(e.target.value) || 0))}
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-900 border-2 border-slate-600 focus:border-amber-400 rounded-xl font-mono font-black text-amber-300 text-base sm:text-lg outline-none"
                  />
                </div>
                {/* Quick Nudge Buttons */}
                <div className="flex items-center gap-1 pt-0.5">
                  {[
                    { label: '-50', delta: -50 },
                    { label: '+10', delta: 10 },
                    { label: '+50', delta: 50 },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      onClick={() => {
                        setDailyWage((prev) => Math.max(1, prev + btn.delta));
                        marioAudio.playClick();
                      }}
                      className="flex-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-bold border border-slate-700 cursor-pointer"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hourly Rate Stat Card */}
              <div className="bg-slate-950/90 border border-slate-700 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold text-slate-400 block uppercase tracking-wider">
                    Equivalent Hourly Rate
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Daily Wage ÷ 8 hrs (Art. 83)</span>
                </div>
                <div className="pt-2">
                  <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tabular-nums block">
                    ₱{hourlyRate.toFixed(2)}
                    <span className="text-xs text-slate-400 font-normal">/hr</span>
                  </span>
                </div>
              </div>

              {/* Est. Monthly Basic Stat Card */}
              <div className="bg-slate-950/90 border border-slate-700 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold text-slate-400 block uppercase tracking-wider">
                    Est. Monthly Basic
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Factor {workFactor} days ÷ 12 mos</span>
                </div>
                <div className="pt-2">
                  <span className="text-xl sm:text-2xl font-black font-mono text-sky-400 tabular-nums block">
                    ₱{estimatedMonthlySalary.toFixed(2)}
                    <span className="text-xs text-slate-400 font-normal">/mo</span>
                  </span>
                </div>
              </div>
            </div>

            {/* All 17 Philippine Regional Wage Presets (DOLE RTWPB 2026 - strictly NO horizontal scroll) */}
            <div className="space-y-2 pt-2.5 border-t border-slate-700/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <MarioCoinIcon size={14} />
                  <span>All 17 DOLE Regional Minimum Wages (RTWPB 2026):</span>
                </span>

                {/* Instant Select Dropdown */}
                <div className="flex items-center gap-1.5 text-xs">
                  <label htmlFor="dole-region-quick-select" className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                    Select Region:
                  </label>
                  <select
                    id="dole-region-quick-select"
                    data-testid="dole-region-quick-select"
                    value={dailyWage}
                    onChange={(e) => {
                      setDailyWage(Number(e.target.value));
                      marioAudio.playPowerUp();
                    }}
                    className="bg-slate-900 text-amber-300 border-2 border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold font-mono focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <optgroup label="Luzon (8 Regions)">
                      {ALL_17_REGIONAL_WAGE_PRESETS.filter((r) => r.islandGroup === 'luzon').map((r) => (
                        <option key={r.id} value={r.rate}>
                          {r.label} — ₱{r.rate}/day
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Visayas (3 Regions)">
                      {ALL_17_REGIONAL_WAGE_PRESETS.filter((r) => r.islandGroup === 'visayas').map((r) => (
                        <option key={r.id} value={r.rate}>
                          {r.label} — ₱{r.rate}/day
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Mindanao (6 Regions)">
                      {ALL_17_REGIONAL_WAGE_PRESETS.filter((r) => r.islandGroup === 'mindanao').map((r) => (
                        <option key={r.id} value={r.rate}>
                          {r.label} — ₱{r.rate}/day
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Island Group Filter Pills */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                {[
                  { id: 'all', label: 'All 17 Regions' },
                  { id: 'luzon', label: 'Luzon (8)' },
                  { id: 'visayas', label: 'Visayas (3)' },
                  { id: 'mindanao', label: 'Mindanao (6)' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setIslandFilter(g.id as 'all' | 'luzon' | 'visayas' | 'mindanao');
                      marioAudio.playClick();
                    }}
                    className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      islandFilter === g.id
                        ? 'bg-amber-400 text-slate-950 font-black border-black shadow-[0_2px_0_#000]'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:border-slate-500'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {/* Grid of Regional Wage Cards (Strictly NO horizontal scroll, wraps gracefully) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {ALL_17_REGIONAL_WAGE_PRESETS.filter(
                  (r) => islandFilter === 'all' || r.islandGroup === islandFilter
                ).map((preset) => {
                  const isSelected = dailyWage === preset.rate;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      data-testid={`dole-region-btn-${preset.id}`}
                      onClick={() => {
                        setDailyWage(preset.rate);
                        marioAudio.playPowerUp();
                      }}
                      className={`p-2 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-black border-black shadow-[0_3px_0_#000] scale-[1.02]'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-400/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold truncate leading-tight" title={preset.label}>
                          {preset.shortLabel}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-slate-950 shrink-0" />}
                      </div>
                      <div className="flex items-baseline justify-between gap-1 mt-1 font-mono">
                        <span className={`text-xs font-black ${isSelected ? 'text-slate-950' : 'text-amber-300'}`}>
                          ₱{preset.rate}
                        </span>
                        <span className={`text-[8.5px] truncate max-w-[55px] ${isSelected ? 'text-slate-900' : 'text-slate-400'}`} title={preset.sub}>
                          {preset.sub}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab Navigation (Segmented Switch - strictly NO horizontal scroll) */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-2xl border-2 border-slate-700/80 shadow-inner">
            {[
              {
                id: 'overtime',
                fullLabel: 'Overtime & NSD (Arts. 86–87)',
                shortLabel: 'Overtime & NSD',
                icon: <Clock className="w-4 h-4 shrink-0" />,
              },
              {
                id: 'holidays',
                fullLabel: 'Holidays & Rest (Arts. 93–94)',
                shortLabel: 'Holidays & Rest',
                icon: <Calendar className="w-4 h-4 shrink-0" />,
              },
              {
                id: 'benefits',
                fullLabel: '13th Mo. & Retire (Art. 302)',
                shortLabel: '13th Mo. & Retire',
                icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCalcTab(tab.id as any);
                  marioAudio.playTabSwitch();
                }}
                className={`min-h-[44px] py-2 px-1.5 font-black text-xs rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-center cursor-pointer ${
                  calcTab === tab.id
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000] border-2 border-black'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 border-2 border-transparent'
                }`}
              >
                {tab.icon}
                <span className="hidden md:inline leading-tight font-display">{tab.fullLabel}</span>
                <span className="md:hidden leading-tight font-display text-[11px]">{tab.shortLabel}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Overtime & Night Shift */}
          {calcTab === 'overtime' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Regular Day Hours */}
                <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 block">Regular Day Hours</label>
                      <span className="text-[10px] text-amber-400 font-mono font-bold">100% Rate</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">Standard 8h under Art. 83</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRegularHours((h) => Math.max(1, h - 1));
                        marioAudio.playClick();
                      }}
                      className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-750 text-white font-black text-lg border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      -
                    </button>
                    <div className="font-mono font-black text-amber-300 text-xl text-center flex-1">
                      {regularHours} <span className="text-xs text-slate-400 font-normal">hrs</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRegularHours((h) => Math.min(8, h + 1));
                        marioAudio.playClick();
                      }}
                      className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-750 text-white font-black text-lg border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      +
                    </button>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 text-[11px] font-mono flex items-center justify-between">
                    <span className="text-slate-400">Regular Pay:</span>
                    <span className="text-emerald-400 font-black">₱{(hourlyRate * regularHours).toFixed(2)}</span>
                  </div>
                </div>

                {/* Ordinary Overtime */}
                <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 block">Ordinary Overtime Hours</label>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">+25% (125%)</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">Hours beyond 8h (Art. 87)</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOrdinaryOtHours((h) => Math.max(0, h - 1));
                        marioAudio.playClick();
                      }}
                      className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-750 text-white font-black text-lg border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      -
                    </button>
                    <div className="font-mono font-black text-amber-300 text-xl text-center flex-1">
                      {ordinaryOtHours} <span className="text-xs text-slate-400 font-normal">hrs</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOrdinaryOtHours((h) => Math.min(16, h + 1));
                        marioAudio.playClick();
                      }}
                      className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-750 text-white font-black text-lg border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      +
                    </button>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 text-[11px] font-mono flex items-center justify-between">
                    <span className="text-slate-400">OT Pay (125%):</span>
                    <span className="text-emerald-400 font-black">₱{(hourlyRate * ordinaryOtHours * 1.25).toFixed(2)}</span>
                  </div>
                </div>

                {/* Night Differential */}
                <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 block">Night Diff Hours (10PM–6AM)</label>
                      <span className="text-[10px] text-sky-400 font-mono font-bold">+10% Premium</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">10PM to 6AM (Art. 86)</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setNightDiffHours((h) => Math.max(0, h - 1));
                        marioAudio.playClick();
                      }}
                      className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-750 text-white font-black text-lg border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      -
                    </button>
                    <div className="font-mono font-black text-amber-300 text-xl text-center flex-1">
                      {nightDiffHours} <span className="text-xs text-slate-400 font-normal">hrs</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNightDiffHours((h) => Math.min(8, h + 1));
                        marioAudio.playClick();
                      }}
                      className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-750 text-white font-black text-lg border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      +
                    </button>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 text-[11px] font-mono flex items-center justify-between">
                    <span className="text-slate-400">NSD Premium:</span>
                    <span className="text-sky-400 font-black">+₱{(hourlyRate * nightDiffHours * 0.1).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Total Day Pay Simulation Box */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1.5 min-w-0">
                  <span className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                    <MarioSuperStarIcon size={16} />
                    <span>Combined Shift Total Pay Estimate</span>
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">
                    ₱{(hourlyRate * regularHours + hourlyRate * ordinaryOtHours * 1.25 + hourlyRate * nightDiffHours * 0.1).toFixed(2)}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Includes {regularHours}h regular wage + {ordinaryOtHours}h overtime (+25%) + {nightDiffHours}h night shift premium (+10%).
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-right font-mono text-xs text-slate-400 shrink-0 space-y-1 w-full sm:w-auto">
                  <div className="flex justify-between sm:justify-end gap-3">
                    <span>Base (8h):</span>
                    <span className="text-slate-200 font-bold">₱{(hourlyRate * regularHours).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between sm:justify-end gap-3">
                    <span>OT (125%):</span>
                    <span className="text-emerald-400 font-bold">₱{(hourlyRate * ordinaryOtHours * 1.25).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between sm:justify-end gap-3">
                    <span>NSD (+10%):</span>
                    <span className="text-sky-400 font-bold">+₱{(hourlyRate * nightDiffHours * 0.1).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Holidays & Rest Days */}
          {calcTab === 'holidays' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scenarios.slice(3).map((sc) => {
                  const isHighRate = sc.multiplier >= 3.0;
                  const isDoublePay = sc.multiplier === 2.0;
                  return (
                    <div
                      key={sc.id}
                      className={`rounded-2xl p-3.5 space-y-2 transition-all border-2 ${
                        isHighRate
                          ? 'bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-900 border-purple-500/80 shadow-md'
                          : isDoublePay
                          ? 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/80'
                          : 'bg-slate-800/90 border-slate-700 hover:border-amber-400/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs sm:text-[13px] text-white leading-snug break-words">
                          {sc.label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-lg font-black text-[11px] font-mono shrink-0 border ${
                            isHighRate
                              ? 'bg-purple-400 text-slate-950 border-purple-200 font-black shadow-xs'
                              : isDoublePay
                              ? 'bg-emerald-400 text-slate-950 border-emerald-200 font-black shadow-xs'
                              : 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                          }`}
                        >
                          {sc.multiplierDisplay}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between gap-2 font-mono pt-1">
                        <span className="text-lg font-black text-amber-300">
                          ₱{sc.totalPesos.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">{sc.citation}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                        {sc.formulaDescription}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: 13th Month & Retirement */}
          {calcTab === 'benefits' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 13th Month Pay Card */}
                <div className="bg-slate-800/90 border-2 border-slate-700 rounded-2xl p-4 space-y-3 shadow-md flex flex-col justify-between">
                  <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
                    <MarioCoinIcon size={20} />
                    <span className="font-black text-sm uppercase text-amber-300 font-display">
                      13th Month Pay (P.D. 851)
                    </span>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-bold">
                      Months Worked in Calendar Year (1–12):
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMonthsWorkedInYear((m) => Math.max(1, m - 1));
                          marioAudio.playClick();
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-750 text-white font-bold border border-slate-700 flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={monthsWorkedInYear}
                        onChange={(e) => setMonthsWorkedInYear(Math.max(1, Math.min(12, Number(e.target.value) || 0)))}
                        className="w-full text-center px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg font-mono font-bold text-amber-300 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMonthsWorkedInYear((m) => Math.min(12, m + 1));
                          marioAudio.playClick();
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-750 text-white font-bold border border-slate-700 flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                    <span className="text-[11px] text-slate-400 block font-mono font-bold">Computed 13th Month Pay:</span>
                    <span className="text-2xl font-black font-mono text-emerald-400 block">
                      ₱{thirteenthMonthPay.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Formula: (Estimated Monthly Basic × {monthsWorkedInYear}) ÷ 12
                    </span>
                  </div>
                </div>

                {/* Retirement Pay Card (Art. 302) */}
                <div className="bg-slate-800/90 border-2 border-slate-700 rounded-2xl p-4 space-y-3 shadow-md flex flex-col justify-between">
                  <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
                    <MarioMushroomIcon size={20} variant="1up" />
                    <span className="font-black text-sm uppercase text-amber-300 font-display">
                      Retirement Pay (Art. 302 / R.A. 7641)
                    </span>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-bold">
                      Years of Service (Fraction ≥ 6 mos = 1 yr):
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setYearsOfService((y) => Math.max(5, y - 1));
                          marioAudio.playClick();
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-750 text-white font-bold border border-slate-700 flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={yearsOfService}
                        onChange={(e) => setYearsOfService(Math.max(5, Number(e.target.value) || 5))}
                        className="w-full text-center px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg font-mono font-bold text-amber-300 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setYearsOfService((y) => Math.min(50, y + 1));
                          marioAudio.playClick();
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-750 text-white font-bold border border-slate-700 flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block font-mono font-bold">Total Statutory Retirement Pay:</span>
                    <span className="text-2xl font-black font-mono text-amber-300 block">
                      ₱{totalRetirementPay.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      22.5 days/yr: 15d basic + 2.5d (5d SIL) + 4.17d (1/12 13th mo) = ₱{oneHalfMonthRetirement.toFixed(2)}/yr
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Incentive Leave (SIL) 5 Days */}
              <div className="bg-slate-800/90 border-2 border-slate-700 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-black uppercase text-amber-300 block font-display">
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
              <div className="bg-slate-850 border-2 border-slate-700 rounded-2xl p-4 text-xs space-y-2.5">
                <div className="flex items-center gap-2">
                  <MarioFireFlowerIcon size={18} />
                  <span className="font-black uppercase text-amber-300 tracking-wide font-display">
                    Statutory Retirement Age Milestones (Art. 302 / R.A. 7641 &amp; R.A. 10757)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
                    <span className="font-bold text-amber-300 block text-xs">General Private Sector:</span>
                    <div>Optional Retirement: <span className="font-mono text-emerald-400 font-bold">60 years old</span> (at least 5 yrs service)</div>
                    <div>Compulsory Retirement: <span className="font-mono text-amber-400 font-bold">65 years old</span></div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
                    <span className="font-bold text-amber-300 block text-xs">Underground / Surface Miners (R.A. 10757):</span>
                    <div>Optional Retirement: <span className="font-mono text-emerald-400 font-bold">50 years old</span> (at least 5 yrs service)</div>
                    <div>Compulsory Retirement: <span className="font-mono text-amber-400 font-bold">60 years old</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-4 py-3 sm:px-6 border-t-2 border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 shrink-0">
          <span>Labor Code of the Philippines (P.D. No. 442) · DOLE BWC Guidelines</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg font-black text-xs cursor-pointer"
            >
              Copy Pay Slip
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-white rounded-lg border border-slate-600 font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
