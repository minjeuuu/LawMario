import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Sparkles,
  Music,
  CheckCircle2,
  Flame,
  Award,
} from 'lucide-react';
import { MarioCoinIcon, MarioStarIcon } from './MarioIcons';
import { marioAudio } from '../utils/audio';

interface PomodoroSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnCoins?: (amount: number) => void;
}

export const PomodoroSprintModal: React.FC<PomodoroSprintModalProps> = ({
  isOpen,
  onClose,
  onEarnCoins,
}) => {
  const [totalSeconds, setTotalSeconds] = useState<number>(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            setIsCompleted(true);
            onEarnCoins?.(60);
            marioAudio.playStageClear();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, secondsLeft, onEarnCoins]);

  const handleToggleTimer = () => {
    if (!isActive) {
      marioAudio.playPowerUp();
    } else {
      marioAudio.playClick();
    }
    setIsActive((prev) => !prev);
  };

  const handleResetTimer = (minutes: number = 25) => {
    setIsActive(false);
    setIsCompleted(false);
    setTotalSeconds(minutes * 60);
    setSecondsLeft(minutes * 60);
    marioAudio.playClick();
  };

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="25-Minute Focus Study Sprint"
      className="fixed inset-0 z-[150] bg-slate-950/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-2.5 sm:p-5 overflow-y-auto overscroll-contain animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg flex flex-col bg-slate-900 border-4 border-black rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.9)] overflow-hidden text-white my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b-2 border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white border border-black flex items-center justify-center font-black shadow-[0_2px_0_#000] shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-purple-300 font-mario tracking-wider block">
                POMODORO FOCUS SPRINT
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-200">
                Deep Labor Law Retention Block
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Pomodoro Sprint"
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timer Display */}
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative w-48 h-48 rounded-full border-8 border-slate-800 bg-slate-950 flex flex-col items-center justify-center shadow-inner">
            <span className="text-5xl font-mono font-black tracking-tight text-amber-300">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs font-bold text-slate-400 mt-1">
              {isActive ? 'FOCUS IN PROGRESS' : isCompleted ? 'SPRINT DONE!' : 'READY TO START'}
            </span>
            <div className="absolute inset-x-0 bottom-3 text-center text-[10px] font-mono text-purple-400">
              {progressPercent}% Complete
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2">
            {[
              { min: 15, label: '15m Quick' },
              { min: 25, label: '25m Standard' },
              { min: 50, label: '50m Marathon' },
            ].map((p) => (
              <button
                key={p.min}
                type="button"
                onClick={() => handleResetTimer(p.min)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer ${
                  totalSeconds === p.min * 60
                    ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleTimer}
              className={`min-h-[46px] px-8 rounded-2xl font-black text-sm uppercase flex items-center gap-2 border-2 border-black shadow-[0_3px_0_#000] cursor-pointer active:translate-y-0.5 transition-all ${
                isActive
                  ? 'bg-rose-500 hover:bg-rose-400 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Sprint</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleResetTimer(Math.round(totalSeconds / 60))}
              aria-label="Reset Timer"
              title="Reset Timer"
              className="min-h-[46px] w-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Reward Callout */}
          <div className="p-3 bg-purple-950/70 border border-purple-500/70 rounded-2xl flex items-center gap-2 max-w-sm text-xs font-semibold text-purple-200">
            <MarioCoinIcon className="w-5 h-5 shrink-0" />
            <span>Complete this uninterrupted study sprint to earn +60 Gold Coins!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
