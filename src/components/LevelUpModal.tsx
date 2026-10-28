import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { MarioStarIcon, MarioCoinIcon, Mario1UpIcon } from './MarioIcons';
import { WORLDS_METADATA, ALL_LAW_TOPICS } from '../data/laborLawData';
import { marioAudio } from '../utils/audio';

interface LevelUpModalProps {
  worldId: string | null;
  bonusCoins: number;
  onClose: () => void;
  onOpenWorldMap?: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  worldId,
  bonusCoins,
  onClose,
  onOpenWorldMap,
}) => {
  const [renderedWorldId, setRenderedWorldId] = useState<string | null>(worldId);
  const [renderedCoins, setRenderedCoins] = useState<number>(bonusCoins);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const exitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (worldId) {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      setRenderedWorldId(worldId);
      setRenderedCoins(bonusCoins);
      setIsExiting(false);
      marioAudio.playLevelUp();

      const celebrationColors = ['#f59e0b', '#fbbf24', '#ef4444', '#10b981', '#38bdf8'];
      const timers: number[] = [];

      try {
        confetti({
          particleCount: 95,
          spread: 80,
          startVelocity: 42,
          origin: { x: 0.5, y: 0.58 },
          colors: celebrationColors,
        });

        timers.push(
          window.setTimeout(() => {
            try {
              confetti({
                particleCount: 55,
                angle: 60,
                spread: 62,
                origin: { x: 0.12, y: 0.65 },
                colors: celebrationColors,
              });
              confetti({
                particleCount: 55,
                angle: 120,
                spread: 62,
                origin: { x: 0.88, y: 0.65 },
                colors: celebrationColors,
              });
            } catch {
              // ignore confetti fallback
            }
          }, 220)
        );

        timers.push(
          window.setTimeout(() => {
            try {
              confetti({
                particleCount: 70,
                spread: 110,
                scalar: 1.08,
                origin: { x: 0.5, y: 0.42 },
                colors: celebrationColors,
              });
            } catch {
              // ignore confetti fallback
            }
          }, 480)
        );
      } catch {
        // ignore confetti fallback
      }

      return () => {
        timers.forEach((id) => window.clearTimeout(id));
      };
    } else if (renderedWorldId && !isExiting) {
      setIsExiting(true);
      exitTimerRef.current = window.setTimeout(() => {
        setRenderedWorldId(null);
        setIsExiting(false);
        exitTimerRef.current = null;
      }, 260);
    }
  }, [worldId, bonusCoins]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  const handleAnimatedClose = (afterClose?: () => void) => {
    if (isExiting) return;
    marioAudio.playClick();
    setIsExiting(true);
    exitTimerRef.current = window.setTimeout(() => {
      setRenderedWorldId(null);
      setIsExiting(false);
      exitTimerRef.current = null;
      onClose();
      if (afterClose) {
        afterClose();
      }
    }, 250);
  };

  if (!renderedWorldId) return null;

  const worldMeta = WORLDS_METADATA.find((w) => w.id === renderedWorldId);
  const worldTopics = ALL_LAW_TOPICS.filter((t) => t.worldId === renderedWorldId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="World Level Up Celebration"
      data-testid="level-up-modal"
      data-animation-state={isExiting ? 'exiting' : 'entering'}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none print:hidden ${
        isExiting ? 'animate-levelup-backdrop-out' : 'animate-levelup-backdrop-in'
      }`}
    >
      <div
        data-testid="level-up-modal-card"
        className={`relative w-full max-w-md bg-gradient-to-b from-[#1e293b] to-[#0f172a] text-white rounded-3xl border-4 border-amber-400 shadow-[0_12px_40px_rgba(245,158,11,0.35)] overflow-hidden ${
          isExiting ? 'animate-levelup-bounce-out' : 'animate-levelup-bounce-in'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => handleAnimatedClose()}
          aria-label="Close Level Up Modal"
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-200 hover:text-white cursor-pointer z-10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Celebratory Banner */}
        <div className="bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 p-6 text-center border-b-4 border-slate-950 relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 text-amber-300 text-[10px] font-black font-mario uppercase border border-amber-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>STAGE CLEAR · LEVEL UP</span>
          </div>

          <div className="flex items-center justify-center gap-3 my-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-950/90 border-2 border-amber-300 flex items-center justify-center animate-bounce">
              <Mario1UpIcon className="w-7 h-7" />
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white border-4 border-slate-950 shadow-[0_4px_0_#000] flex items-center justify-center">
              <MarioStarIcon className="w-10 h-10" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-950/90 border-2 border-amber-300 flex items-center justify-center animate-bounce">
              <Trophy className="w-7 h-7 text-amber-300" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-display drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
            {worldMeta ? `WORLD ${worldMeta.worldNumber} MASTERED!` : 'WORLD MASTERED!'}
          </h2>
          <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
            {worldMeta?.title || 'Philippine Labor Standards Stage Clear'}
          </p>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Bonus Coin Reward Box */}
          <div className="bg-slate-900 rounded-2xl p-4 border-2 border-amber-400 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center shrink-0">
                <MarioCoinIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                  WORLD CLEAR REWARD
                </span>
                <span className="text-lg font-black text-white font-display tabular-nums">
                  +{renderedCoins} Bonus Coins!
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] font-mario border border-black shrink-0">
              CLAIMED
            </span>
          </div>

          {/* Completed Modules Checklist */}
          <div className="bg-slate-900/70 rounded-2xl p-3.5 border border-slate-700 space-y-2 max-h-44 overflow-y-auto">
            <span className="text-[10px] font-black uppercase text-slate-400 font-mario block">
              ALL {worldTopics.length} MODULES CONQUERED:
            </span>
            <ul className="space-y-1.5">
              {worldTopics.map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{t.title}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {onOpenWorldMap && (
              <button
                type="button"
                onClick={() => handleAnimatedClose(onOpenWorldMap)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs border-2 border-slate-600 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>View World Map</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            )}
            <button
              type="button"
              data-testid="level-up-continue-btn"
              onClick={() => handleAnimatedClose()}
              className={`min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs font-mario border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                onOpenWorldMap ? '' : 'sm:col-span-2'
              }`}
            >
              <span>CONTINUE QUEST</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

