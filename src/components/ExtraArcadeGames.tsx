import React, { useState } from 'react';
import { MarioAvatar } from '../types/laborLaw';
import { marioAudio } from '../utils/audio';
import {
  MarioCharacterAvatar,
  MarioCoinIcon,
  MarioStarIcon,
  MarioFireFlowerIcon,
  MarioMushroomIcon,
} from './MarioIcons';
import { ArcadeDoctrineCard } from './ArcadeDoctrineCard';
import {
  Coins,
  Sparkles,
  Shield,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  Stamp,
  FileText,
  Heart,
  Award,
  Clock,
  BadgeCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  drawSlotTriviaQuestion,
  drawWorld6LeaveCase,
  drawClimberTowerRun,
  SlotTriviaItem,
  LeaveClinicCaseItem,
  ClimberRungItem,
  WORLD6_LEAVE_CLINIC_BANK,
} from '../utils/gameQuestionDeck';

interface ExtraGameProps {
  equippedAvatar: MarioAvatar;
  coins: number;
  onAdjustCoins: (delta: number) => void;
}

// ============================================================================
// 1. TOAD'S STATUTORY COIN TREASURY SLOTS (Spend Coins & Double via Statutory Trivia!)
// ============================================================================
const SLOT_REELS = [
  { id: 'star', label: '390% Double Holiday + RD', payoutMult: 5 },
  { id: 'flower', label: '105d Maternity Leave', payoutMult: 4 },
  { id: 'mushroom', label: '200% Regular Holiday', payoutMult: 3 },
  { id: 'coin', label: '100% Service Charge', payoutMult: 2 },
] as const;

export const ToadHouseCoinSlots: React.FC<ExtraGameProps> = ({
  equippedAvatar,
  coins,
  onAdjustCoins,
}) => {
  const [wager, setWager] = useState<5 | 15 | 30>(15);
  const [reels, setReels] = useState<[number, number, number]>([0, 1, 2]);
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<string>(
    'Select your coin wager (5c, 15c, or 30c) and pull Toad’s Treasury Lever!'
  );
  const [pendingTriviaWin, setPendingTriviaWin] = useState<number>(0);
  const [activeTrivia, setActiveTrivia] = useState<SlotTriviaItem>(() => drawSlotTriviaQuestion());

  const renderSymbol = (idx: number) => {
    const item = SLOT_REELS[idx] ?? SLOT_REELS[0];
    if (item.id === 'star') return <MarioStarIcon className="w-10 h-10" />;
    if (item.id === 'flower') return <MarioFireFlowerIcon className="w-10 h-10" />;
    if (item.id === 'mushroom') return <MarioMushroomIcon className="w-10 h-10" />;
    return <MarioCoinIcon className="w-10 h-10" />;
  };

  const handleSpin = () => {
    if (spinning || coins < wager) return;
    onAdjustCoins(-wager);
    setPendingTriviaWin(0);
    setSpinning(true);
    marioAudio.playQuestionBlock();

    setTimeout(() => {
      const r1 = Math.floor(Math.random() * SLOT_REELS.length);
      const r2 = Math.floor(Math.random() * SLOT_REELS.length);
      const r3 = Math.random() < 0.42 ? r1 : Math.floor(Math.random() * SLOT_REELS.length);
      setReels([r1, r2, r3]);
      setSpinning(false);

      if (r1 === r2 && r2 === r3) {
        const win = wager * SLOT_REELS[r1].payoutMult;
        onAdjustCoins(win);
        setPendingTriviaWin(win);
        setActiveTrivia(drawSlotTriviaQuestion());
        setLastResult(`JACKPOT! 3x ${SLOT_REELS[r1].label} — Won +${win} Coins!`);
        marioAudio.playOneUp();
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
      } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        const matchIdx = r1 === r2 ? r1 : r3;
        const win = Math.round(wager * 1.8);
        onAdjustCoins(win);
        setPendingTriviaWin(Math.max(5, Math.round(wager * 0.8)));
        setActiveTrivia(drawSlotTriviaQuestion());
        setLastResult(`PAIR MATCH (${SLOT_REELS[matchIdx].label})! Won +${win} Coins!`);
        marioAudio.playPowerUp();
      } else {
        setLastResult('No match this spin! Answer the Rescue Question below to win back +8 Coins!');
        setPendingTriviaWin(8);
        setActiveTrivia(drawSlotTriviaQuestion());
      }
    }, 320);
  };

  const handleAnswerBonus = (choice: number) => {
    if (choice === activeTrivia.ans) {
      onAdjustCoins(pendingTriviaWin);
      marioAudio.playCoin();
      setLastResult(`CORRECT STATUTORY DOCTRINE! Bonus +${pendingTriviaWin} Coins added to your wallet!`);
    } else {
      marioAudio.playBowserHit();
      setLastResult(`Review Tip: Correct answer was "${activeTrivia.opts[activeTrivia.ans]}". Spin again!`);
    }
    setPendingTriviaWin(0);
  };

  return (
    <div className="bg-[#1e293b] text-white rounded-3xl p-5 sm:p-7 border-4 border-slate-950 shadow-[6px_6px_0_#000] max-w-3xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-700 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center shrink-0">
            <MarioCharacterAvatar character={equippedAvatar} className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black font-mario text-amber-400 uppercase block">
              TOAD HOUSE COIN WAGER ARCADE
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              STATUTORY TREASURY SLOTS
            </h2>
          </div>
        </div>
        <div className="bg-slate-900 px-3.5 py-2 rounded-xl border-2 border-amber-400 flex items-center gap-2 font-mario text-xs text-amber-300 tabular-nums">
          <MarioCoinIcon className="w-4 h-4" />
          <span>{coins} COINS</span>
        </div>
      </div>

      {/* Wager Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-slate-900 p-3.5 rounded-2xl border-2 border-slate-700 w-full max-w-full">
        <span className="text-xs font-bold text-slate-300">Choose Coin Wager:</span>
        <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {([5, 15, 30] as const).map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                setWager(amt);
                marioAudio.playClick();
              }}
              className={`min-h-[44px] px-2 sm:px-4 py-2 rounded-xl font-mario text-[11px] sm:text-xs border-2 cursor-pointer transition-colors whitespace-nowrap text-center flex items-center justify-center ${
                wager === amt
                  ? 'bg-amber-400 text-slate-950 border-black font-black'
                  : 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700'
              }`}
            >
              {amt} Coins
            </button>
          ))}
        </div>
      </div>

      {/* 3 Reels */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-slate-950 p-4 sm:p-6 rounded-2xl border-3 border-amber-400">
        {reels.map((symbolIdx, i) => (
          <div
            key={i}
            className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center min-h-[120px]"
          >
            <div className={spinning ? 'scale-110 transition-transform' : ''}>
              {renderSymbol(symbolIdx)}
            </div>
            <span className="text-[11px] font-bold text-amber-200 leading-tight">
              {SLOT_REELS[symbolIdx].label}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm font-bold text-amber-300 text-center">
        {lastResult}
      </div>

      {pendingTriviaWin > 0 && (
        <div className="bg-indigo-950/90 border-2 border-amber-400 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mario text-amber-300 uppercase">
              STATUTORY TRIVIA BONUS (+{pendingTriviaWin} COINS)
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-white">
            {activeTrivia.q}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {activeTrivia.opts.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAnswerBonus(idx)}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-white font-bold text-xs border border-slate-600 cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={spinning || coins < wager}
        onClick={handleSpin}
        className="w-full min-h-[50px] py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 font-mario text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
      >
        <Coins className="w-5 h-5" />
        <span>
          {coins < wager
            ? `NEED ${wager} COINS TO SPIN`
            : spinning
            ? 'SPINNING REELS...'
            : `SPIN TREASURY REELS (-${wager} COINS)`}
        </span>
      </button>
    </div>
  );
};

// ============================================================================
// 2. WORLD 6 STATUTORY LEAVE CLINIC (Dedicated Module 6 Mastery Arcade!)
// ============================================================================
export const World6LeaveMatcherGame: React.FC<ExtraGameProps> = ({
  equippedAvatar,
  coins,
  onAdjustCoins,
}) => {
  const [caseNumber, setCaseNumber] = useState(1);
  const [current, setCurrent] = useState<LeaveClinicCaseItem>(() => drawWorld6LeaveCase());
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string; selectedOpt: string } | null>(null);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [stampedOpt, setStampedOpt] = useState<string | null>(null);

  const handleSelect = (opt: string) => {
    if (feedback) return;
    setStampedOpt(opt);

    const isCorrect = opt === current.correctLeave;
    setTimeout(() => {
      if (isCorrect) {
        const reward = 6 + Math.min(10, streak * 2);
        onAdjustCoins(reward);
        setStreak((s) => s + 1);
        setFeedback({ ok: true, text: `Officially Dispatched! +${reward} Coins · ${current.statute}`, selectedOpt: opt });
        marioAudio.playCoin();
      } else {
        setStreak(0);
        setFeedback({ ok: false, text: `Statutory Mismatch! Correct: ${current.correctLeave} (${current.statute})`, selectedOpt: opt });
        marioAudio.playBowserHit();
      }
    }, 300);
  };

  const nextCase = () => {
    setCaseNumber((n) => n + 1);
    setCurrent(drawWorld6LeaveCase());
    setFeedback(null);
    setStampedOpt(null);
    setHintUnlocked(false);
    marioAudio.playClick();
  };

  const buyHint = () => {
    if (coins < 5 || hintUnlocked) return;
    onAdjustCoins(-5);
    setHintUnlocked(true);
    marioAudio.playPowerUp();
  };

  // Color & Icon mapping for 4 Royal Wax Seals
  const STAMP_PALETTES = [
    { border: 'border-pink-400', bg: 'bg-pink-950/80', hover: 'hover:bg-pink-600', text: 'text-pink-300', wax: 'bg-pink-500' },
    { border: 'border-sky-400', bg: 'bg-sky-950/80', hover: 'hover:bg-sky-600', text: 'text-sky-300', wax: 'bg-sky-500' },
    { border: 'border-amber-400', bg: 'bg-amber-950/80', hover: 'hover:bg-amber-600', text: 'text-amber-300', wax: 'bg-amber-500' },
    { border: 'border-purple-400', bg: 'bg-purple-950/80', hover: 'hover:bg-purple-600', text: 'text-purple-300', wax: 'bg-purple-500' },
  ];

  return (
    <div className="bg-[#140f24] text-white rounded-3xl p-4 sm:p-7 border-4 border-slate-950 shadow-[6px_6px_0_#000] max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-pink-900/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-pink-500 rounded-2xl border-3 border-black flex items-center justify-center shrink-0 shadow-[0_3px_0_#000]">
            <MarioCharacterAvatar character={equippedAvatar} className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-black font-mario text-pink-300 uppercase block tracking-wider">
              WORLD 6 · PRINCESS PEACH STATUTORY CLINIC
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              PEACH&apos;S LEAVE BENEFIT DISPATCH DESK
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mario text-xs tabular-nums">
          <span className="bg-slate-950/90 px-3.5 py-2 rounded-xl border border-pink-500/40 text-emerald-400 shadow-inner">
            DISPATCH STREAK: x{streak}
          </span>
        </div>
      </div>

      {/* Royal Dispatch Counter & Applicant Petition Clipboard */}
      <div className="relative rounded-2xl border-3 border-pink-500/50 bg-gradient-to-b from-[#25153a] via-[#170c29] to-[#0c0617] p-4 sm:p-6 overflow-hidden space-y-3">
        {/* Ambient Top Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-pink-800/40 pb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-pink-950 border border-pink-400 text-[10px] font-mario text-pink-300 uppercase">
              APPLICANT #{caseNumber}
            </span>
            <span className="text-xs font-mono font-bold text-slate-300">
              CITIZEN LEAVE PETITION
            </span>
          </div>
          <button
            type="button"
            disabled={coins < 5 || hintUnlocked}
            onClick={buyHint}
            className="min-h-[34px] px-3 py-1 rounded-xl bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs border border-black cursor-pointer shadow-[0_2px_0_#000] active:translate-y-0.5"
          >
            {hintUnlocked ? 'Codal Clue Active' : 'Buy Codal Clue (-5 Coins)'}
          </button>
        </div>

        {/* Applicant Circumstances Scroll */}
        <div className="bg-slate-950/80 rounded-xl border border-pink-500/30 p-4 space-y-2 relative">
          <div className="flex items-center gap-2 text-xs font-mono text-pink-300 uppercase">
            <FileText className="w-4 h-4 text-pink-400" />
            <span>SWORN STATEMENT OF STATUTORY CIRCUMSTANCES</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
            &ldquo;{current.scenario}&rdquo;
          </p>

          {hintUnlocked && (
            <div className="text-xs text-amber-300 bg-amber-950/80 p-2.5 rounded-xl border border-amber-400/60 flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Controlling Statutory Law: {current.statute}</span>
            </div>
          )}

          {/* Stamped Royal Seal Overlay */}
          {stampedOpt && (
            <div className="absolute right-4 bottom-3 border-4 border-amber-400/90 rounded-2xl p-2 bg-black/60 rotate-[-8deg] pointer-events-none animate-pulse">
              <span className="text-xs font-mario text-amber-300 uppercase tracking-widest block font-black">
                {feedback?.ok ? 'DISPATCHED APPROVED' : 'DISPATCH REVIEW'}
              </span>
            </div>
          )}
        </div>

        <div className="text-center pt-1">
          <span className="text-[10px] font-mario text-pink-300 uppercase tracking-widest">
            SELECT ROYAL WAX SEAL TO DISPATCH STATUTORY LEAVE
          </span>
        </div>
      </div>

      {/* 4 Interactive Royal Wax Seal Stampers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current.options.map((opt, i) => {
          const pal = STAMP_PALETTES[i % STAMP_PALETTES.length];
          const isSelected = stampedOpt === opt;
          return (
            <button
              key={opt}
              type="button"
              disabled={Boolean(feedback)}
              onClick={() => handleSelect(opt)}
              className={`min-h-[64px] p-3.5 rounded-2xl border-3 text-left transition-all cursor-pointer relative overflow-hidden group shadow-[0_4px_0_#000] active:translate-y-0.5 ${
                feedback === null
                  ? `${pal.bg} ${pal.border} ${pal.hover} hover:text-slate-950 text-white`
                  : isSelected && feedback.ok
                  ? 'bg-emerald-500 text-slate-950 border-black shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                  : isSelected && !feedback.ok
                  ? 'bg-rose-600 text-white border-black'
                  : 'bg-slate-900/40 text-slate-500 border-slate-800 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* 3D Wax Stamper Knob */}
                <div className={`w-10 h-10 rounded-xl ${pal.wax} border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]`}>
                  <Stamp className="w-5 h-5 text-slate-950" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75">
                    ROYAL SEAL #{i + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-display font-extrabold block truncate">
                    {opt}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback & High-Yield Statutory Leave Doctrine Takeaway */}
      {feedback && (
        <ArcadeDoctrineCard
          title={`Applicant #${caseNumber} · ${current.correctLeave}`}
          statute={current.statute}
          rule={current.scenario}
          takeaway={
            feedback.ok
              ? `Statutory Leave Benefit Dispatched! Controlling entitlement: "${current.correctLeave}". ${current.statute}. Employee receives full statutory compensation and leave credit without loss of seniority!`
              : `Statutory Leave Mismatch! The controlling entitlement under ${current.statute} is "${current.correctLeave}". Avoid confusing with "${feedback.selectedOpt}".`
          }
          isCorrect={feedback.ok}
          worldCode="w6"
          scenarioText={current.scenario}
          chosenAnswerText={feedback.selectedOpt}
          correctAnswerText={current.correctLeave}
          advanceLabel="Dispatch Next Applicant →"
          onAdvance={nextCase}
        />
      )}
    </div>
  );
};

// ============================================================================
// 3. LAKITU'S CLOUD CLIMBER TOWER (High-Stakes Coin Ladder + Cloud Shield!)
// ============================================================================
export const LakituCloudClimberGame: React.FC<ExtraGameProps> = ({
  equippedAvatar,
  coins,
  onAdjustCoins,
}) => {
  const [rungs, setRungs] = useState<ClimberRungItem[]>(() => drawClimberTowerRun());
  const [rungIdx, setRungIdx] = useState(0);
  const [bankedPot, setBankedPot] = useState(0);
  const [cloudShield, setCloudShield] = useState(false);
  const [status, setStatus] = useState<'climbing' | 'won' | 'fell'>('climbing');

  const currentRung = rungs[rungIdx] ?? rungs[0];

  const buyShield = () => {
    if (coins < 12 || cloudShield) return;
    onAdjustCoins(-12);
    setCloudShield(true);
    marioAudio.playPowerUp();
  };

  const answerRung = (choice: number) => {
    if (status !== 'climbing') return;
    if (choice === currentRung.ans) {
      const nextPot = currentRung.reward;
      setBankedPot(nextPot);
      marioAudio.playCoin();
      if (rungIdx + 1 >= rungs.length) {
        onAdjustCoins(nextPot);
        setStatus('won');
        marioAudio.playQuizComplete();
      } else {
        setRungIdx((r) => r + 1);
      }
    } else if (cloudShield) {
      setCloudShield(false);
      marioAudio.playPipe();
    } else {
      setBankedPot(0);
      setStatus('fell');
      marioAudio.playBowserHit();
    }
  };

  const cashOut = () => {
    if (bankedPot <= 0) return;
    onAdjustCoins(bankedPot);
    marioAudio.playOneUp();
    setStatus('won');
  };

  const resetClimb = () => {
    setRungs(drawClimberTowerRun());
    setRungIdx(0);
    setBankedPot(0);
    setStatus('climbing');
    marioAudio.playClick();
  };

  return (
    <div className="bg-[#1e293b] text-white rounded-3xl p-5 sm:p-7 border-4 border-slate-950 shadow-[6px_6px_0_#000] max-w-3xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-700 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-sky-400 rounded-xl border-2 border-black flex items-center justify-center shrink-0">
            <MarioCharacterAvatar character={equippedAvatar} className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black font-mario text-sky-300 uppercase block">
              RISK-AND-REWARD SKY TOWER
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              LAKITU&apos;S CLOUD JACKPOT CLIMBER
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={coins < 12 || cloudShield || status !== 'climbing'}
            onClick={buyShield}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs border-2 border-black flex items-center gap-1.5 cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>{cloudShield ? 'Cloud Shield ON' : 'Cloud Shield (-12c)'}</span>
          </button>
        </div>
      </div>

      {/* Progress Rungs */}
      <div className="grid grid-cols-5 gap-2 tabular-nums">
        {rungs.map((r, i) => (
          <div
            key={r.rung}
            className={`p-2 rounded-xl border text-center text-xs font-bold ${
              i === rungIdx && status === 'climbing'
                ? 'bg-amber-400 text-slate-950 border-black font-black'
                : i < rungIdx || status === 'won'
                ? 'bg-emerald-600 text-white border-emerald-300'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
          >
            <span className="block text-[10px]">Floor {r.rung}</span>
            <span>+{r.reward}c</span>
          </div>
        ))}
      </div>

      {status === 'climbing' && (
        <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-mario text-amber-300">
              FLOOR {currentRung.rung}/5 • POT: {bankedPot} COINS
            </span>
            {bankedPot > 0 && (
              <button
                type="button"
                onClick={cashOut}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs border-2 border-black cursor-pointer"
              >
                Cash Out +{bankedPot} Coins
              </button>
            )}
          </div>
          <p className="text-sm sm:text-base font-bold text-white">{currentRung.q}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentRung.opts.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => answerRung(idx)}
                className="min-h-[48px] p-3.5 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-white font-bold text-xs sm:text-sm border-2 border-slate-600 cursor-pointer text-left"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {status !== 'climbing' && (
        <div className="bg-slate-900 border-2 border-amber-400 rounded-2xl p-6 text-center space-y-3">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-xl font-black font-display">
            {status === 'won'
              ? `SUMMIT CLAIMED! +${bankedPot} COINS BANKED!`
              : 'THWOMP KNOCKOUT! POT LOST!'}
          </h3>
          <p className="text-xs text-slate-300">
            {status === 'won'
              ? 'Your Mario Coins have been added directly to your wallet for Toad’s Shop!'
              : 'Tip: Equip Lakitu’s Cloud Shield (-12c) to survive one wrong answer on high floors!'}
          </p>
          <button
            type="button"
            onClick={resetClimb}
            className="min-h-[46px] px-6 py-2.5 bg-amber-400 text-slate-950 font-black rounded-xl border-2 border-black font-mario text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>CLIMB AGAIN</span>
          </button>
        </div>
      )}
    </div>
  );
};
