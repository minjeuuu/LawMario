import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MarioAvatar } from '../types/laborLaw';
import { MarioCharacterAvatar, MarioStarIcon, MarioCoinIcon } from './MarioIcons';
import { marioAudio } from '../utils/audio';
import { Swords, Shield } from 'lucide-react';

interface PipeWarpTransitionOverlayProps {
  isActive: boolean;
  bossTitle?: string;
  avatar?: MarioAvatar;
  onTransitionComplete: () => void;
}

export const PipeWarpTransitionOverlay: React.FC<PipeWarpTransitionOverlayProps> = ({
  isActive,
  bossTitle = 'BOWSER COURTROOM SHOWDOWN',
  avatar = 'mario',
  onTransitionComplete,
}) => {
  const [animStage, setAnimStage] = useState<'idle' | 'descending' | 'blackout' | 'done'>('idle');

  useEffect(() => {
    if (!isActive) {
      setAnimStage('idle');
      return;
    }

    setAnimStage('descending');
    marioAudio.playPipe();

    const blackoutTimer = window.setTimeout(() => {
      setAnimStage('blackout');
    }, 650);

    const completeTimer = window.setTimeout(() => {
      setAnimStage('done');
      onTransitionComplete();
    }, 1050);

    return () => {
      clearTimeout(blackoutTimer);
      clearTimeout(completeTimer);
    };
  }, [isActive, onTransitionComplete]);

  if (!isActive && animStage === 'idle') return null;

  const overlay = (
    <div
      role="alert"
      aria-live="assertive"
      data-testid="pipe-warp-transition-overlay"
      className={`fixed inset-0 z-[130] h-[100dvh] w-screen overflow-hidden flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-auto select-none p-4 ${
        animStage === 'blackout' || animStage === 'done'
          ? 'bg-black opacity-100'
          : 'bg-slate-950/95 backdrop-blur-md opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-5 text-center max-w-md w-full">
        {/* Mario Warp HUD Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500 border-2 border-black text-slate-950 font-black text-xs uppercase shadow-[0_3px_0_#000]">
            <Swords className="w-4 h-4 shrink-0" />
            <span>BOSS SHOWDOWN WARP</span>
            <Shield className="w-4 h-4 shrink-0" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-mario text-amber-300 tracking-wider leading-snug">
            {bossTitle.toUpperCase()}
          </h2>
          <p className="text-xs text-slate-300 font-bold uppercase tracking-widest font-mono">
            WARPING THROUGH KINGDOM PIPE...
          </p>
        </div>

        {/* Warp Pipe Stage */}
        <div className="relative w-48 h-52 flex flex-col items-center justify-end overflow-hidden">
          {/* Avatar Sliding Down */}
          <div
            className={`relative z-10 transition-transform duration-700 ease-in ${
              animStage === 'descending'
                ? 'translate-y-12 scale-95 opacity-95'
                : 'translate-y-0 scale-100 opacity-100'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center shadow-[0_4px_0_#000]">
              <MarioCharacterAvatar character={avatar} className="w-12 h-12" />
            </div>
          </div>

          {/* Green Warp Pipe Top Lip & Body */}
          <div className="relative z-20 w-36 h-28 flex flex-col items-center">
            <div className="w-36 h-10 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-700 border-4 border-black rounded-t-lg shadow-[0_6px_0_#000] relative">
              <div className="absolute inset-x-3 top-1 h-2 bg-emerald-300/60 rounded-full" />
              <div className="absolute inset-x-2 bottom-1 h-3 bg-slate-950/80 rounded-full" />
            </div>
            <div className="w-28 h-20 bg-gradient-to-r from-emerald-700 via-emerald-500 to-emerald-800 border-x-4 border-b-4 border-black relative">
              <div className="absolute left-2 inset-y-0 w-3 bg-emerald-300/40" />
              <div className="absolute right-2 inset-y-0 w-4 bg-emerald-900/60" />
            </div>
          </div>
        </div>

        {/* Crisp Mario Emblem Strip */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-xl bg-slate-900 border-2 border-slate-700 text-xs font-black text-amber-300 font-mono">
          <MarioStarIcon className="w-4 h-4 shrink-0" />
          <span>WORLD BOSS CHAMBER LOCKED</span>
          <MarioCoinIcon className="w-4 h-4 shrink-0" />
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(overlay, document.body);
  }
  return overlay;
};

