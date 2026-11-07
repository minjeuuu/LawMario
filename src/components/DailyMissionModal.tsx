import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Target,
  Sparkles,
  ArrowRight,
  Gift,
  Trophy,
  Flame,
  BookOpen,
} from 'lucide-react';
import {
  DailyMissionBundle,
  DailyMissionItem,
  loadFullDailyMissionBoard,
  loadOrGenerateDailyMissions,
  claimDailyMissionReward,
  getLocalDateKey,
  DAILY_MISSIONS_STORAGE_KEY,
  DAILY_MISSION_BOARD_STORAGE_KEY,
} from '../utils/round11Features';
import { MarioCoinIcon, MarioStarIcon, MarioCharacterAvatar } from './MarioIcons';
import { marioAudio } from '../utils/audio';

interface DailyMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimCoins: (coins: number, xp?: number) => void;
  onNavigateTab?: (tab: string) => void;
}

export const DailyMissionModal: React.FC<DailyMissionModalProps> = ({
  isOpen,
  onClose,
  onClaimCoins,
  onNavigateTab,
}) => {
  const dateKey = getLocalDateKey();
  const [featuredBundle, setFeaturedBundle] = useState<DailyMissionBundle>(() =>
    loadOrGenerateDailyMissions(
      dateKey,
      typeof window !== 'undefined' ? window.localStorage : undefined
    )
  );
  const [fullBoard, setFullBoard] = useState<DailyMissionBundle>(() =>
    loadFullDailyMissionBoard(
      dateKey,
      typeof window !== 'undefined' ? window.localStorage : undefined
    )
  );
  const [recentBanner, setRecentBanner] = useState<string | null>(null);

  const refreshMissions = () => {
    if (typeof window === 'undefined') return;
    const today = getLocalDateKey();
    setFeaturedBundle(loadOrGenerateDailyMissions(today, window.localStorage));
    setFullBoard(loadFullDailyMissionBoard(today, window.localStorage));
  };

  useEffect(() => {
    if (isOpen) {
      refreshMissions();
      setRecentBanner(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    window.addEventListener('mario-daily-missions-updated', refreshMissions);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('mario-daily-missions-updated', refreshMissions);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Merge featured 3 daily missions + full mission board without duplicate IDs
  const featuredIds = new Set(featuredBundle.missions.map((m) => m.id));
  const combinedMissions: DailyMissionItem[] = [
    ...featuredBundle.missions,
    ...fullBoard.missions.filter((m) => !featuredIds.has(m.id)),
  ];

  const completedCount = combinedMissions.filter((m) => m.progress >= m.target).length;
  const claimedCount = combinedMissions.filter((m) => m.claimed).length;
  const overallPercent = Math.round(
    (completedCount / Math.max(1, combinedMissions.length)) * 100
  );

  const handleClaim = (mission: DailyMissionItem) => {
    if (mission.progress < mission.target || mission.claimed) return;
    const today = getLocalDateKey();
    const resFeat = claimDailyMissionReward(featuredBundle, mission.id);
    const resBoard = claimDailyMissionReward(fullBoard, mission.id);

    const awardedCoins =
      Math.max(resFeat.coinsAwarded, resBoard.coinsAwarded) || mission.rewardCoins;
    const awardedXp = mission.rewardXp ?? 100;

    setFeaturedBundle(resFeat.updated);
    setFullBoard(resBoard.updated);

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          DAILY_MISSIONS_STORAGE_KEY,
          JSON.stringify(resFeat.updated)
        );
        window.localStorage.setItem(
          DAILY_MISSION_BOARD_STORAGE_KEY,
          JSON.stringify(resBoard.updated)
        );
        window.dispatchEvent(
          new CustomEvent('mario-daily-missions-updated', { detail: resFeat.updated })
        );
      } catch {
        // ignore
      }
    }

    onClaimCoins(awardedCoins, awardedXp);
    setRecentBanner(
      `Claimed "${mission.title}": +${awardedCoins} Coins and +${awardedXp} XP!`
    );
    marioAudio.playQuizComplete();
  };

  const handleGoAction = (mission: DailyMissionItem) => {
    marioAudio.playPipe();
    onClose();
    if (!onNavigateTab) return;
    const view = mission.actionView || 'modules';
    if (view === 'arcade') {
      onNavigateTab('vault');
    } else if (view === 'statute_lookup') {
      onNavigateTab('citations');
    } else {
      onNavigateTab(view);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Daily Mission Status Board"
      data-testid="daily-mission-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-2.5 sm:p-5 overflow-y-auto overscroll-contain print:hidden"
    >
      <div className="bg-slate-950 border-4 border-black rounded-3xl max-w-3xl w-full shadow-[10px_10px_0_#000] text-white my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#0f172a] px-4 sm:px-6 py-4 border-b-2 border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <Target className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-amber-400 font-mario block leading-tight">
                MUSHROOM KINGDOM BOUNTY QUESTS · {dateKey}
              </span>
              <h2 className="text-base sm:text-xl font-black font-display text-white break-words [overflow-wrap:anywhere] leading-tight">
                DAILY MISSION STATUS &amp; REWARDS
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Daily Mission Status"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-600 border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          data-testid="daily-mission-scroll-body"
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 custom-scrollbar"
        >
          {/* Summary Banner Card */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950/90 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0">
                  <MarioCharacterAvatar character="toad" className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
                    DAILY COMPLETION PROGRESS
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {completedCount} of {combinedMissions.length} Quests Completed ({claimedCount} Claimed)
                  </h3>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black font-mario text-xs border-2 border-black shadow-[0_2px_0_#000] tabular-nums">
                {overallPercent}% READY
              </span>
            </div>

            <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 transition-all duration-300 rounded-full"
                style={{ width: `${overallPercent}%` }}
              />
            </div>

            {recentBanner && (
              <div
                data-testid="daily-mission-claim-banner"
                className="bg-emerald-950/95 border border-emerald-400 text-emerald-200 rounded-xl px-3.5 py-2 text-xs font-black flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{recentBanner}</span>
              </div>
            )}
          </div>

          {/* Mission Cards List */}
          <div className="space-y-3">
            {combinedMissions.map((mission, index) => {
              const pct = Math.min(
                100,
                Math.round((mission.progress / Math.max(1, mission.target)) * 100)
              );
              const isComplete = mission.progress >= mission.target;
              const isFeatured = index < 3;

              return (
                <div
                  key={mission.id}
                  data-testid={`daily-mission-card-${mission.id}`}
                  className={`rounded-2xl p-4 border-2 transition-all space-y-3 ${
                    mission.claimed
                      ? 'bg-emerald-950/35 border-emerald-500/70'
                      : isComplete
                      ? 'bg-amber-950/35 border-amber-400 shadow-[0_3px_0_#000]'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {isFeatured && (
                          <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black font-mario uppercase border border-black">
                            PRIORITY QUEST
                          </span>
                        )}
                        <h4 className="text-sm sm:text-base font-black text-white font-display">
                          {mission.title}
                        </h4>
                        {mission.claimed && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>CLAIMED</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {mission.subtitle}
                      </p>
                    </div>

                    {/* Reward Pill & Action */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                      <div className="inline-flex items-center gap-2 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-black tabular-nums">
                        <span className="inline-flex items-center gap-1 text-amber-300">
                          <MarioCoinIcon className="w-3.5 h-3.5" />
                          <span>+{mission.rewardCoins}</span>
                        </span>
                        <span className="text-slate-600">|</span>
                        <span className="inline-flex items-center gap-1 text-cyan-300">
                          <MarioStarIcon className="w-3.5 h-3.5" />
                          <span>+{mission.rewardXp ?? 100} XP</span>
                        </span>
                      </div>

                      {isComplete && !mission.claimed ? (
                        <button
                          type="button"
                          data-testid={`claim-mission-${mission.id}`}
                          onClick={() => handleClaim(mission)}
                          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
                        >
                          <Gift className="w-3.5 h-3.5 shrink-0" />
                          <span>Claim Reward</span>
                        </button>
                      ) : !mission.claimed ? (
                        <button
                          type="button"
                          data-testid={`go-mission-${mission.id}`}
                          onClick={() => handleGoAction(mission)}
                          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs border border-slate-600 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Start Quest</span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold tabular-nums">
                      <span className="text-slate-400">Progress</span>
                      <span
                        className={
                          isComplete ? 'text-emerald-300 font-black' : 'text-amber-300 font-mono'
                        }
                      >
                        {mission.progress} / {mission.target} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isComplete ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0f172a] px-4 sm:px-6 py-3 border-t-2 border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Missions reset daily at midnight local time.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[38px] px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] cursor-pointer text-center"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
