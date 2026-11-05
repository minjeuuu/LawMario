import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  LEVEL_THRESHOLDS,
  getProgressionForXp,
  isAvatarUnlockedByLevel,
  ProgressionStats,
} from '../utils/levelProgressionService';
import { MarioAvatar } from '../types/laborLaw';
import {
  MarioCharacterAvatar,
  MarioCoinIcon,
  MarioStarIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';
import {
  Trophy,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  X,
  ChevronRight,
  Clock,
  BookOpen,
  Award,
  Swords,
} from 'lucide-react';

interface LevelProgressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalXp: number;
  equippedAvatar: MarioAvatar;
  onEquipAvatar: (avatar: MarioAvatar) => void;
}

export const LevelProgressionModal: React.FC<LevelProgressionModalProps> = ({
  isOpen,
  onClose,
  totalXp,
  equippedAvatar,
  onEquipAvatar,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'unlocked' | 'locked'>('all');
  if (!isOpen) return null;

  const progression: ProgressionStats = getProgressionForXp(totalXp);

  const filteredThresholds = LEVEL_THRESHOLDS.filter((item) => {
    const isUnlocked = item.level <= progression.level;
    if (filterMode === 'unlocked') return isUnlocked;
    if (filterMode === 'locked') return !isUnlocked;
    return true;
  });

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Level Progression & Character Avatar Unlocks"
      data-testid="level-progression-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[140] bg-black/85 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto overscroll-contain touch-pan-y animate-fadeIn select-none"
    >
      <div className="bg-slate-950 border-4 border-black rounded-3xl max-w-4xl w-full shadow-[10px_10px_0_#000] text-white max-h-[90vh] my-auto flex flex-col overflow-hidden touch-pan-y">
        {/* Sticky Header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b-2 border-slate-800 flex items-center justify-between gap-2 shrink-0 bg-slate-950">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-amber-300 font-mario block break-words">
                PLAYER PROGRESSION &amp; CHARACTER AVATARS
              </span>
              <h2 className="text-base sm:text-xl font-black font-display text-white break-words">
                Level {progression.level}: {progression.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Level Progression Modal"
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div
          data-testid="level-progression-scroll-body"
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-3.5 sm:p-6 space-y-4 custom-scrollbar select-text"
        >
          {/* Current Level XP Gauge Card */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs font-black font-mario shadow-[0_2px_0_#000]">
                  LEVEL {progression.level}
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {progression.title}
                </span>
              </div>
              <div className="text-right text-xs font-mono font-bold text-amber-300">
                <span>{progression.xpInCurrentLevel}</span>
                <span className="text-slate-400"> / </span>
                <span>{progression.xpRequiredForCurrentLevel} XP</span>
                <span className="text-slate-400"> (Total: {progression.totalXp} XP)</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-700 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-300 transition-all duration-500 rounded-full"
                style={{ width: `${progression.progressPercent}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-300 font-semibold gap-2">
              <span>Perk: <span className="text-emerald-300">{progression.perkDescription}</span></span>
              {progression.nextUnlockPreview && (
                <span className="text-amber-200">
                  Next Unlock at Level {progression.nextUnlockPreview.level}: <strong className="text-white">{progression.nextUnlockPreview.title}</strong>
                </span>
              )}
            </div>
          </div>

          {/* XP Earning Cheat Sheet */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Quiz Answering</span>
              </div>
              <p className="text-[11px] text-slate-300">+30 XP per correct codal answer</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>Streak &amp; Perfect</span>
              </div>
              <p className="text-[11px] text-slate-300">+100 XP bonus for perfect quiz deck</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>Active Study</span>
              </div>
              <p className="text-[11px] text-slate-300">+4 XP per minute in study mode</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <Swords className="w-3.5 h-3.5" />
                <span>Arcade &amp; Bosses</span>
              </div>
              <p className="text-[11px] text-slate-300">+100 XP for clear + 1.5x Boss multi</p>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 font-mario">
              ROADMAP FILTER:
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'all'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All (33 Levels)
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('unlocked')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'unlocked'
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Unlocked ({progression.level})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('locked')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'locked'
                    ? 'bg-rose-500 text-white font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Locked ({Math.max(0, 33 - progression.level)})
              </button>
            </div>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            {progression.unlockedAvatars.length} of 34 Avatars Unlocked
          </span>
        </div>

        {/* Level Roadmap List */}
        <div className="space-y-2.5">
          {filteredThresholds.map((threshold) => {
            const isUnlocked = threshold.level <= progression.level;
            const isCurrent = threshold.level === progression.level;

            return (
              <div
                key={threshold.level}
                data-testid={`level-card-${threshold.level}`}
                className={`p-3 sm:p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-amber-950/40 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                    : isUnlocked
                    ? 'bg-slate-900/90 border-slate-700 hover:border-slate-600'
                    : 'bg-slate-950/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center font-mario text-xs shrink-0 ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000] font-black'
                        : isUnlocked
                        ? 'bg-slate-800 text-emerald-400 border-slate-700 font-bold'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    {isUnlocked ? (
                      `L${threshold.level}`
                    ) : (
                      <Lock className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-black text-white break-words">
                        {threshold.title}
                      </h4>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] font-mario shrink-0">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 font-semibold break-words">
                      {threshold.perkDescription}
                    </p>
                    <span className="text-[10px] font-mono text-amber-300/80">
                      Requirement: {threshold.xpRequired} XP
                    </span>
                  </div>
                </div>

                {/* Avatar Preview & Action */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {threshold.unlockedAvatars.map((avatarId) => {
                    const isEquipped = equippedAvatar === avatarId;
                    return (
                      <div
                        key={avatarId}
                        className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1.5 rounded-xl border border-slate-800"
                      >
                        <MarioCharacterAvatar character={avatarId} className="w-6 h-6 shrink-0" />
                        <span className="text-xs font-bold text-slate-200 capitalize">
                          {avatarId}
                        </span>
                        {isUnlocked ? (
                          isEquipped ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-black text-[10px] font-mario">
                              EQUIPPED
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                onEquipAvatar(avatarId);
                                marioAudio.playPowerUp();
                              }}
                              className="px-2 py-0.5 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] cursor-pointer"
                            >
                              Equip
                            </button>
                          )
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export const LevelUpCelebrationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  newTitle: string;
  newlyUnlockedAvatars: MarioAvatar[];
  onEquipAvatar: (avatar: MarioAvatar) => void;
}> = ({ isOpen, onClose, newLevel, newTitle, newlyUnlockedAvatars, onEquipAvatar }) => {
  if (!isOpen) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Level Up Celebration"
      data-testid="level-up-celebration-dialog"
      className="fixed inset-0 z-[140] bg-black/90 backdrop-blur-md flex items-start sm:items-center justify-center p-2.5 sm:p-4 overflow-y-auto overscroll-contain animate-fadeIn"
    >
      <div className="bg-slate-950 border-4 border-amber-400 rounded-3xl max-w-lg w-full max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] overflow-y-auto overscroll-contain p-5 sm:p-6 shadow-[10px_10px_0_#000] text-white text-center space-y-5 my-auto animate-scaleUp">
        {/* Mario Level Complete Star Banner */}
        <div className="w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 border-3 border-black mx-auto flex items-center justify-center shadow-[0_4px_0_#000] animate-bounce">
          <Trophy className="w-9 h-9" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-widest text-amber-300 font-mario block">
            LEVEL UP CLEAR!
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
            ADVANCED TO LEVEL {newLevel}!
          </h2>
          <p className="text-sm font-bold text-emerald-400">
            {newTitle}
          </p>
        </div>

        {/* Newly Unlocked Characters */}
        {newlyUnlockedAvatars.length > 0 && (
          <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-4 space-y-3">
            <span className="text-[10px] font-black uppercase text-emerald-300 font-mario block">
              NEW MARIO AVATARS UNLOCKED!
            </span>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {newlyUnlockedAvatars.map((avatarId) => (
                <div
                  key={avatarId}
                  className="bg-slate-950 border-2 border-amber-400 rounded-xl p-3 flex flex-col items-center gap-2 min-w-[110px]"
                >
                  <MarioCharacterAvatar character={avatarId} className="w-12 h-12" />
                  <span className="text-xs font-black capitalize text-white">
                    {avatarId}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onEquipAvatar(avatarId);
                      marioAudio.playPowerUp();
                      onClose();
                    }}
                    className="min-h-[32px] px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-lg border border-black shadow-[0_2px_0_#000] cursor-pointer"
                  >
                    Equip Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[46px] py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-xl border-2 border-black shadow-[0_3px_0_#000] cursor-pointer font-mario"
        >
          CONTINUE LABOR ADVENTURE
        </button>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
