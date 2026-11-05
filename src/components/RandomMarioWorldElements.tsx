import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  MarioQuestionBlockIcon,
  MarioCoinIcon,
  MarioGoombaIcon,
  MarioKoopaShellIcon,
  MarioPiranhaPlantIcon,
  MarioStarIcon,
  Mario1UpIcon,
  MarioCharacterAvatar,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';
import { awardUserXp } from '../utils/levelProgressionService';
import { Sparkles, X, Lightbulb, Zap, ShieldCheck } from 'lucide-react';

export interface MarioLaborProTip {
  id: string;
  character: 'mario' | 'toad' | 'peach' | 'luigi' | 'yoshi';
  speaker: string;
  topic: string;
  statute: string;
  tip: string;
}

export const MARIO_LABOR_PRO_TIPS: readonly MarioLaborProTip[] = [
  {
    id: 'tip-1',
    character: 'mario',
    speaker: 'Super Mario',
    topic: 'Regular Holiday Pay',
    statute: 'Art. 94, Labor Code',
    tip: 'Unworked Regular Holidays still pay 100% of the daily wage! If you work it, you earn 200% for the first 8 hours.',
  },
  {
    id: 'tip-2',
    character: 'toad',
    speaker: 'Toad Inspector',
    topic: 'Undertime vs Overtime',
    statute: 'Art. 88, Labor Code',
    tip: 'Strict Art. 88 prohibition: An employer CANNOT offset your undertime on one day with overtime worked on another day!',
  },
  {
    id: 'tip-3',
    character: 'peach',
    speaker: 'Princess Peach',
    topic: '105-Day Maternity Leave',
    statute: 'R.A. 11210 Sec. 3',
    tip: 'Every female worker gets 105 days paid maternity leave regardless of normal or C-section delivery, plus 15 extra days for solo parents!',
  },
  {
    id: 'tip-4',
    character: 'luigi',
    speaker: 'Luigi Auditor',
    topic: 'Night Shift Differential',
    statute: 'Art. 86, Labor Code',
    tip: 'Work between 10:00 PM and 6:00 AM qualifies for at least +10% NSD, and it stacks multiplicatively on overtime (125% × 1.10 = 137.5%)!',
  },
  {
    id: 'tip-5',
    character: 'yoshi',
    speaker: 'Yoshi Scholar',
    topic: '100% Service Charges',
    statute: 'R.A. 11360',
    tip: 'Old 85/15 split is history! 100% of service charges collected by hotels and dining spots now go equally to covered non-managerial staff.',
  },
  {
    id: 'tip-6',
    character: 'mario',
    speaker: 'Super Mario',
    topic: '5-Day SIL Cash Conversion',
    statute: 'Art. 95, Labor Code',
    tip: 'Employees with at least 1 year of service earn 5 days paid Service Incentive Leave. Unused SIL must be commuted to cash at year-end!',
  },
  {
    id: 'tip-7',
    character: 'toad',
    speaker: 'Toad Clerk',
    topic: 'Substantial Capital in D.O. 174',
    statute: 'D.O. 174-17 Sec. 3(l)',
    tip: 'Independent contractors must possess at least PHP 5,000,000 in paid-up capital or net worth to prevent being classified as illegal labor-only contractors!',
  },
  {
    id: 'tip-8',
    character: 'peach',
    speaker: 'Princess Peach',
    topic: 'Retirement 22.5 Days Formula',
    statute: 'Art. 302, R.A. 7641',
    tip: 'One-half month salary for retirement means 15 days basic + 5 days SIL + 2.5 days (1/12 of 13th month) = exactly 22.5 days per year of service!',
  },
];

/**
 * Floating Interactive [?] Question Block
 * Click to bounce, play retro coin chime, award +1 Coin / +5 XP, and reveal a high-yield Mario Pro-Tip!
 */
export const FloatingMarioMysteryBlock: React.FC<{
  className?: string;
  onEarnCoins?: (amount: number) => void;
  tipIndex?: number;
}> = ({ className = '', onEarnCoins, tipIndex }) => {
  const [isHit, setIsHit] = useState(false);
  const [showCoin, setShowCoin] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const blockBtnRef = useRef<HTMLButtonElement | null>(null);
  const [bubbleCoords, setBubbleCoords] = useState<{ top: number; left: number; width: number }>({
    top: 88,
    left: 16,
    width: 300,
  });
  const [tip] = useState<MarioLaborProTip>(() => {
    if (tipIndex !== undefined && MARIO_LABOR_PRO_TIPS[tipIndex]) {
      return MARIO_LABOR_PRO_TIPS[tipIndex];
    }
    const rand = Math.floor(Math.random() * MARIO_LABOR_PRO_TIPS.length);
    return MARIO_LABOR_PRO_TIPS[rand] || MARIO_LABOR_PRO_TIPS[0];
  });

  const updateBubbleCoords = useCallback(() => {
    if (!blockBtnRef.current || typeof window === 'undefined') return;
    const rect = blockBtnRef.current.getBoundingClientRect();
    const bubbleWidth = Math.min(320, Math.max(220, window.innerWidth - 24));
    const bubbleHeightEstimate = 160;
    const rawLeft = rect.left + rect.width / 2 - bubbleWidth / 2;
    const left = Math.max(12, Math.min(window.innerWidth - bubbleWidth - 12, rawLeft));
    const placeBelow =
      rect.bottom + 8 + bubbleHeightEstimate <= window.innerHeight - 12 || rect.top < 170;
    const top = placeBelow
      ? Math.min(window.innerHeight - bubbleHeightEstimate - 12, rect.bottom + 8)
      : Math.max(12, rect.top - bubbleHeightEstimate - 8);
    setBubbleCoords({ top, left, width: bubbleWidth });
  }, []);

  useEffect(() => {
    if (!showTip) return;
    updateBubbleCoords();
    window.addEventListener('scroll', updateBubbleCoords, true);
    window.addEventListener('resize', updateBubbleCoords);
    return () => {
      window.removeEventListener('scroll', updateBubbleCoords, true);
      window.removeEventListener('resize', updateBubbleCoords);
    };
  }, [showTip, updateBubbleCoords]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateBubbleCoords();
    if (isHit) {
      setShowTip((prev) => !prev);
      marioAudio.playClick();
      return;
    }

    setIsHit(true);
    setShowCoin(true);
    setShowTip(true);
    marioAudio.playQuestionBlock();
    marioAudio.playCoin();
    onEarnCoins?.(1);
    awardUserXp({ amount: 5, reason: 'Hit [?] Mystery Law Block' });

    setTimeout(() => {
      setShowCoin(false);
    }, 900);
  };

  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* Springing Coin Animation */}
      {showCoin && (
        <div className="fixed pointer-events-none z-[135] -translate-x-1/2 -translate-y-7 flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-full border border-black shadow-[0_2px_0_#000] animate-bounce whitespace-nowrap"
          style={{
            top: `${bubbleCoords.top}px`,
            left: `${bubbleCoords.left + 80}px`,
          }}
        >
          <MarioCoinIcon className="w-3.5 h-3.5" />
          <span>+1 COIN · +5 XP!</span>
        </div>
      )}

      {/* The Block */}
      <button
        ref={blockBtnRef}
        type="button"
        onClick={handleClick}
        data-testid="mario-mystery-question-block"
        aria-expanded={showTip}
        aria-label="Hit Mario Mystery Question Block for Labor Law Doctrine"
        title={isHit ? 'Click to toggle Mario Labor Law Doctrine' : 'Hit Mystery Block for Coins & Doctrine!'}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border-2 border-black flex items-center justify-center cursor-pointer transition-transform active:scale-90 active:-translate-y-1 shadow-[0_3px_0_#000] ${
          isHit
            ? 'bg-amber-800 text-amber-300 opacity-90'
            : 'bg-amber-400 hover:bg-amber-300 text-slate-950 hover:scale-105'
        }`}
      >
        {isHit ? (
          <div className="w-4 h-4 rounded-sm border border-amber-900 bg-amber-950/60" />
        ) : (
          <MarioQuestionBlockIcon className="w-6 h-6 animate-pulse" />
        )}
      </button>

      {/* Revealed Doctrine Speech Bubble — Portaled to document.body & Viewport-Clamped so Never Cropped */}
      {showTip &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            data-testid="mario-mystery-tip-bubble"
            style={{
              top: `${bubbleCoords.top}px`,
              left: `${bubbleCoords.left}px`,
              width: `${bubbleCoords.width}px`,
            }}
            className="fixed max-w-[calc(100vw-24px)] max-h-[85vh] overflow-y-auto overscroll-contain bg-slate-950 border-3 border-amber-400 rounded-2xl p-3.5 text-white shadow-[0_12px_32px_rgba(0,0,0,0.95)] z-[150] animate-fadeIn text-left select-text"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <MarioCharacterAvatar character={tip.character} className="w-5 h-5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-amber-300 font-mario block truncate">
                    {tip.speaker}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono block truncate">
                    {tip.statute}
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close Mario Doctrine Tip"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTip(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs font-semibold text-slate-100 leading-relaxed break-words">
              {tip.tip}
            </p>
          </div>,
          document.body
        )}
    </div>
  );
};

/**
 * Interactive Piranha Plant Warp Pipe
 * A classic green pipe with a peek-a-boo Piranha plant.
 * Clicking triggers a warp chime and grants a lucky XP boost!
 */
export const PiranhaPipePortal: React.FC<{
  className?: string;
  onWarpClick?: () => void;
}> = ({ className = '', onWarpClick }) => {
  const [peeking, setPeeking] = useState(false);
  const [warped, setWarped] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPeeking((prev) => !prev);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    marioAudio.playPipeWarp();
    setWarped(true);
    awardUserXp({ amount: 10, reason: 'Discovered Secret Piranha Pipe' });
    onWarpClick?.();
    setTimeout(() => setWarped(false), 1200);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title="Secret Warp Pipe! Click to enter."
      className={`relative inline-flex flex-col items-center cursor-pointer select-none group ${className}`}
    >
      {warped && (
        <span className="absolute -top-6 text-[9px] font-black font-mario bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full border border-black animate-bounce z-20 whitespace-nowrap">
          WARP +10 XP!
        </span>
      )}

      {/* Peeking Piranha Plant */}
      <div
        className={`transition-transform duration-500 origin-bottom ${
          peeking ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0 pointer-events-none'
        }`}
      >
        <MarioPiranhaPlantIcon className="w-6 h-6" />
      </div>

      {/* Green Pipe Top & Stem */}
      <div className="w-10 h-3 bg-emerald-500 rounded-t-sm border-2 border-black shadow-sm group-hover:bg-emerald-400 transition-colors" />
      <div className="w-8 h-4 bg-emerald-600 border-x-2 border-b-2 border-black" />
    </div>
  );
};

/**
 * Wandering Patrol Goomba / Koopa Shell
 * Clicking allows the user to "stomp" the enemy for sound effect and reward!
 */
export const PatrolMarioEnemy: React.FC<{
  type?: 'goomba' | 'koopa';
  className?: string;
}> = ({ type = 'goomba', className = '' }) => {
  const [stomped, setStomped] = useState(false);

  const handleStomp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stomped) return;
    setStomped(true);
    if (type === 'goomba') {
      marioAudio.playStomp();
      awardUserXp({ amount: 15, reason: 'Stomped Non-Compliant Goomba' });
    } else {
      marioAudio.playKick();
      awardUserXp({ amount: 20, reason: 'Kicked Illegal Subcontracting Shell' });
    }
    setTimeout(() => setStomped(false), 3000);
  };

  return (
    <button
      type="button"
      onClick={handleStomp}
      title={type === 'goomba' ? 'Click to stomp Goomba!' : 'Click to kick Koopa Shell!'}
      className={`inline-block transition-transform cursor-pointer select-none ${className} ${
        stomped ? 'scale-y-25 opacity-70' : 'hover:scale-110 active:scale-95'
      }`}
    >
      {type === 'goomba' ? (
        <MarioGoombaIcon className="w-6 h-6 sm:w-7 sm:h-7 animate-bounce" />
      ) : (
        <MarioKoopaShellIcon className="w-6 h-6 sm:w-7 sm:h-7" />
      )}
    </button>
  );
};

/**
 * Universal Mario World Sprinkles
 * Ambient floating decorative element container that renders random interactive blocks,
 * walking goombas, and warp pipes smoothly across screen boundaries.
 */
export const MarioWorldSprinkles: React.FC<{
  onEarnCoins?: (amount: number) => void;
  className?: string;
}> = ({ onEarnCoins, className = '' }) => {
  return (
    <div
      data-testid="mario-world-sprinkles"
      className={`flex items-center justify-between gap-3 bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-emerald-950/40 border-2 border-amber-400/40 rounded-2xl px-4 py-2.5 backdrop-blur-sm shadow-[0_3px_0_#000] select-none ${className}`}
    >
      <div className="flex items-center gap-3">
        <FloatingMarioMysteryBlock onEarnCoins={onEarnCoins} />
        <div className="hidden sm:block text-left">
          <div className="text-[10px] font-black uppercase text-amber-300 font-mario flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Mystery Law Block</span>
          </div>
          <div className="text-[11px] text-slate-300 font-medium">
            Hit for +1 Coin, +5 XP &amp; High-Yield Doctrine
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <PatrolMarioEnemy type="goomba" />
        <PatrolMarioEnemy type="koopa" />
        <PiranhaPipePortal />
      </div>
    </div>
  );
};

