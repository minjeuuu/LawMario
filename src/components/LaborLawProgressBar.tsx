import React, { useState } from 'react';
import { LawTopic, MarioAvatar } from '../types/laborLaw';
import {
  MarioFlagIcon,
  MarioMushroomIcon,
  MarioFireFlowerIcon,
  MarioStarIcon,
  MarioPeachCrownIcon,
  MarioQuestionBlockIcon,
  MarioCoinIcon,
  MarioCharacterAvatar,
} from './MarioIcons';
import {
  computeOverallLaborLawProgress,
  hitMarioMysteryLawBlock,
  MarioMysteryBlockDrop,
  MYSTERY_BLOCK_DAILY_COIN_CAP,
} from '../utils/round12Features';
import { getLocalDateKey } from '../utils/round11Features';
import { marioAudio } from '../utils/audio';
import { CheckCircle2, Sparkles, Star } from 'lucide-react';

interface LaborLawProgressBarProps {
  allTopics: readonly LawTopic[];
  completedTopicIds: readonly string[];
  activeWorld: string;
  onSelectWorld: (worldId: string) => void;
  equippedAvatar?: MarioAvatar;
  favoriteCount?: number;
  showFavoritesOnly?: boolean;
  onToggleFavoritesFilter?: () => void;
  onEarnCoins?: (amount: number) => void;
}

const MYSTERY_BLOCK_STORAGE_KEY = 'mario_modules_qblock_v1';

export const LaborLawProgressBar: React.FC<LaborLawProgressBarProps> = ({
  allTopics,
  completedTopicIds,
  activeWorld,
  onSelectWorld,
  equippedAvatar = 'mario',
  favoriteCount = 0,
  showFavoritesOnly = false,
  onToggleFavoritesFilter,
  onEarnCoins,
}) => {
  const progress = computeOverallLaborLawProgress({
    allTopics,
    completedTopicIds,
  });

  const [mysteryDrop, setMysteryDrop] = useState<MarioMysteryBlockDrop | null>(null);
  const [blockBounce, setBlockBounce] = useState(false);
  const [mysteryState, setMysteryState] = useState<{
    dateKey: string;
    hitsToday: number;
    cursor: number;
  }>(() => {
    const today = getLocalDateKey();
    if (typeof window === 'undefined') return { dateKey: today, hitsToday: 0, cursor: 0 };
    try {
      const raw = window.localStorage.getItem(MYSTERY_BLOCK_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.dateKey === today) {
          return {
            dateKey: today,
            hitsToday: Number(parsed.hitsToday || 0),
            cursor: Number(parsed.cursor || 0),
          };
        }
      }
    } catch {
      // ignore storage errors
    }
    return { dateKey: today, hitsToday: 0, cursor: 0 };
  });

  const handleHitMysteryBlock = () => {
    const today = getLocalDateKey();
    const baseHits = mysteryState.dateKey === today ? mysteryState.hitsToday : 0;
    const outcome = hitMarioMysteryLawBlock({
      hitCountToday: baseHits,
      dropCursor: mysteryState.cursor,
    });

    const next = {
      dateKey: today,
      hitsToday: outcome.nextHitCountToday,
      cursor: outcome.nextDropCursor,
    };
    setMysteryState(next);
    setMysteryDrop(outcome.drop);
    setBlockBounce(true);
    window.setTimeout(() => setBlockBounce(false), 260);

    try {
      window.localStorage.setItem(MYSTERY_BLOCK_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }

    if (outcome.coinsAwarded > 0 && onEarnCoins) {
      onEarnCoins(outcome.coinsAwarded);
      marioAudio.playCoin();
    } else {
      marioAudio.playQuestionBlock();
    }
  };

  const renderMilestoneIcon = (type: 'mushroom' | 'flower' | 'star' | 'crown') => {
    switch (type) {
      case 'mushroom':
        return <MarioMushroomIcon className="w-3.5 h-3.5 shrink-0" />;
      case 'flower':
        return <MarioFireFlowerIcon className="w-3.5 h-3.5 shrink-0" />;
      case 'star':
        return <MarioStarIcon className="w-3.5 h-3.5 shrink-0" />;
      case 'crown':
        return <MarioPeachCrownIcon className="w-3.5 h-3.5 shrink-0" />;
    }
  };

  return (
    <section
      data-testid="modules-overall-progress-bar"
      aria-label="Overall Labor Law Topics Progress"
      className="bg-slate-950 text-white rounded-3xl border-4 border-black shadow-[5px_5px_0_#000] p-4 sm:p-5 space-y-3.5 overflow-hidden"
    >
      {/* Top Row: Title + Percentage Readout + Interactive Mario [?] Mystery Block */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_3px_0_#000]">
            <MarioFlagIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase text-amber-300 font-mario">
                ALL LABOR LAW TOPICS MASTERY
              </span>
              <span className="text-slate-500" aria-hidden="true">
                ·
              </span>
              <span className="text-xs font-bold text-emerald-300">{progress.rankTitle}</span>
            </div>
            <div className="flex items-baseline gap-2.5 flex-wrap mt-0.5">
              <span
                data-testid="modules-overall-progress-percent"
                className="text-xl sm:text-2xl font-black text-white font-display tabular-nums"
              >
                {progress.topicPercent}% Complete
              </span>
              <span className="text-xs font-bold text-slate-300 tabular-nums">
                ({progress.completedTopics} of {progress.totalTopics} Labor Law Topics Mastered ·{' '}
                {progress.remainingTopics === 0
                  ? 'All Stages Cleared!'
                  : `${progress.remainingTopics} Left`}
                )
              </span>
            </div>
          </div>
        </div>

        {/* Action Cluster: Favorites Quick Toggle + Mario [?] Mystery Mnemonic Block */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onToggleFavoritesFilter && (
            <button
              type="button"
              data-testid="modules-favorites-filter-btn"
              onClick={() => {
                onToggleFavoritesFilter();
                marioAudio.playCoin();
              }}
              className={`min-h-[42px] px-3.5 rounded-xl border-2 border-black font-black text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap shadow-[0_2px_0_#000] ${
                showFavoritesOnly
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-400/60'
              }`}
            >
              <Star
                className={`w-4 h-4 shrink-0 ${
                  showFavoritesOnly || favoriteCount > 0 ? 'fill-current' : ''
                }`}
              />
              <span>
                {showFavoritesOnly ? `Showing Favorites (${favoriteCount})` : `Favorites (${favoriteCount})`}
              </span>
            </button>
          )}

          <button
            type="button"
            data-testid="modules-mystery-law-block-btn"
            onClick={handleHitMysteryBlock}
            title="Strike the Mario [?] Block for a high-yield statutory mnemonic and +2 Gold Coins!"
            className={`min-h-[42px] px-3.5 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-950 font-black text-xs border-2 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer transition-transform whitespace-nowrap ${
              blockBounce ? '-translate-y-1.5 scale-105' : ''
            }`}
          >
            <MarioQuestionBlockIcon className="w-4 h-4 shrink-0" />
            <span>Hit [?] Law Block</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 text-[10px] font-mono font-black tabular-nums inline-flex items-center gap-1">
              <MarioCoinIcon className="w-3 h-3 shrink-0" />
              {mysteryState.hitsToday < MYSTERY_BLOCK_DAILY_COIN_CAP ? '+2c' : 'TIP'}
            </span>
          </button>
        </div>
      </div>

      {/* Mario Stage Flagpole Track + 4 Power-Up Milestones */}
      <div className="space-y-2">
        <div className="relative pt-2 pb-1">
          <div
            role="progressbar"
            aria-label="Progress percentage across all Labor Law topics"
            aria-valuenow={progress.topicPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-5 bg-slate-900 rounded-full border-2 border-slate-700 overflow-hidden p-0.5 relative"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all duration-500 relative"
              style={{ width: `${Math.max(progress.topicPercent > 0 ? 4 : 0, progress.topicPercent)}%` }}
            />
          </div>

          {/* Running Hero Indicator on the Progress Track */}
          <div
            aria-hidden="true"
            className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 border-2 border-black shadow-[0_2px_0_#000] absolute top-0.5 -translate-x-1/2 transition-all duration-500 pointer-events-none"
            style={{
              left: `${Math.min(97, Math.max(3, progress.topicPercent))}%`,
            }}
          >
            <MarioCharacterAvatar character={equippedAvatar} className="w-4 h-4" />
          </div>
        </div>

        {/* 4 Power-Up Milestones Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {progress.milestones.map((ms) => (
            <div
              key={ms.thresholdPct}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-between gap-1.5 text-[11px] font-bold ${
                ms.reached
                  ? 'bg-emerald-950/70 border-emerald-400/70 text-emerald-200'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400'
              }`}
            >
              <span className="inline-flex items-center gap-1.5 min-w-0 truncate">
                {renderMilestoneIcon(ms.marioItem)}
                <span className="truncate">{ms.title}</span>
              </span>
              {ms.reached ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <span className="text-[10px] font-mono tabular-nums shrink-0">
                  {ms.thresholdPct}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Popped Mario [?] Block High-Yield Mnemonic Card */}
      {mysteryDrop && (
        <div
          data-testid="modules-mystery-law-drop-card"
          className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-900 border-2 border-amber-400 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 animate-in fade-in duration-150"
        >
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-[10px] font-black uppercase text-amber-300 font-mario">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>[?] BLOCK POWER-UP UNLOCKED: {mysteryDrop.powerUpType}</span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-white font-display">
              {mysteryDrop.mnemonicTitle}
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {mysteryDrop.statutoryRule}
            </p>
            <p className="text-[11px] font-bold text-amber-200 leading-snug">
              {mysteryDrop.examTrapNote}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMysteryDrop(null)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 shrink-0 self-end sm:self-start cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Per-World Mini Progress Jump Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 pt-0.5">
        {progress.worldBreakdown.map((wb) => {
          const isCurrent = activeWorld === wb.worldId;
          return (
            <button
              key={wb.worldId}
              type="button"
              onClick={() => {
                onSelectWorld(wb.worldId);
                marioAudio.playJump();
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-left transition-colors cursor-pointer ${
                isCurrent
                  ? 'bg-amber-400 text-slate-950 border-black font-black shadow-[0_2px_0_#000]'
                  : wb.percent === 100
                  ? 'bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-200 border-emerald-500/60 font-bold'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 font-semibold'
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-[11px]">
                <span className="truncate">{wb.shortLabel}</span>
                <span className="font-mono text-[10px] tabular-nums shrink-0">
                  {wb.completed}/{wb.total}
                </span>
              </div>
              <div
                className={`mt-1 h-1.5 rounded-full overflow-hidden ${
                  isCurrent ? 'bg-slate-950/25' : 'bg-slate-950'
                }`}
              >
                <div
                  className={`h-full rounded-full ${
                    isCurrent ? 'bg-slate-950' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${wb.percent}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
