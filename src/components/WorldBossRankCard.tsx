import React, { useState, useMemo } from 'react';
import {
  WorldBossRankSummary,
  computeWorldBossRank,
  computeAllWorldsBossRanks,
  WORLD_BOSS_CATALOG,
  BossRankTier,
} from '../utils/worldBossRank';
import { BossBattleLogEntry } from '../utils/round8Features';
import { MarioBowserIcon, MarioStarIcon, Mario1UpIcon } from './MarioIcons';
import { marioAudio } from '../utils/audio';
import {
  Trophy,
  Swords,
  Clock,
  Zap,
  Target,
  Sparkles,
  Shield,
  ArrowRight,
  Flame,
  Award,
} from 'lucide-react';

interface WorldBossRankCardProps {
  bossBattleLog: readonly BossBattleLogEntry[];
  onFightBoss?: (worldId?: string) => void;
  onOpenBossBattleLog?: () => void;
  compact?: boolean;
}

export const WorldBossRankCard: React.FC<WorldBossRankCardProps> = ({
  bossBattleLog,
  onFightBoss,
  onOpenBossBattleLog,
  compact = false,
}) => {
  const [selectedWorld, setSelectedWorld] = useState<string>('all');

  const allRanks = useMemo(
    () => computeAllWorldsBossRanks(bossBattleLog),
    [bossBattleLog]
  );

  const currentRank: WorldBossRankSummary = allRanks[selectedWorld] || allRanks['all'];

  const totalAllClears = useMemo(
    () => bossBattleLog.filter((b) => b.victory).length,
    [bossBattleLog]
  );

  const worldTabs = [
    { id: 'all', label: 'Grand Court' },
    { id: 'world1', label: 'W1: Hours' },
    { id: 'world2', label: 'W2: Rest/Holidays' },
    { id: 'world3', label: 'W3: Wages' },
    { id: 'world4', label: 'W4: Special Groups' },
    { id: 'world5', label: 'W5: Protective' },
    { id: 'world6', label: 'W6: Leaves' },
  ];

  const getTierCrest = (tier: BossRankTier) => {
    switch (tier) {
      case 'SSS':
        return {
          textColor: 'text-amber-300',
          borderColor: 'border-amber-400',
          gradient: 'from-amber-400 via-rose-500 to-indigo-600',
          glow: 'shadow-[0_0_20px_rgba(251,191,36,0.6)]',
          crown: true,
        };
      case 'SS':
        return {
          textColor: 'text-purple-300',
          borderColor: 'border-purple-400',
          gradient: 'from-purple-600 via-pink-600 to-red-500',
          glow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]',
          crown: false,
        };
      case 'S':
        return {
          textColor: 'text-emerald-300',
          borderColor: 'border-emerald-400',
          gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
          glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
          crown: false,
        };
      case 'A':
        return {
          textColor: 'text-blue-300',
          borderColor: 'border-blue-400',
          gradient: 'from-blue-600 to-indigo-700',
          glow: 'shadow-[0_0_10px_rgba(59,130,246,0.3)]',
          crown: false,
        };
      case 'B':
        return {
          textColor: 'text-amber-200',
          borderColor: 'border-amber-500',
          gradient: 'from-amber-600 to-orange-700',
          glow: '',
          crown: false,
        };
      case 'C':
        return {
          textColor: 'text-slate-300',
          borderColor: 'border-slate-500',
          gradient: 'from-slate-600 to-slate-800',
          glow: '',
          crown: false,
        };
      case 'UNRANKED':
      default:
        return {
          textColor: 'text-slate-400',
          borderColor: 'border-slate-700',
          gradient: 'from-slate-800 to-slate-900',
          glow: '',
          crown: false,
        };
    }
  };

  const crest = getTierCrest(currentRank.tier);

  return (
    <div
      data-testid="world-boss-rank-card"
      className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white border-3 border-black shadow-[4px_4px_0_#000] p-4 sm:p-5 space-y-4 text-left"
    >
      {/* Header and Total Clears */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0_#000]">
            <Swords className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black font-display text-white">
              World Boss Competitive Rank System
            </h3>
            <p className="text-[11px] text-slate-300">
              Bar combat efficiency, speed, and accuracy across all Labor Law World Bosses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-700">
            Total Clears: <span className="text-white font-black">{totalAllClears}</span>
          </span>
          {onOpenBossBattleLog && (
            <button
              onClick={onOpenBossBattleLog}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 cursor-pointer"
            >
              Battle Log ({bossBattleLog.length})
            </button>
          )}
        </div>
      </div>

      {/* World Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 text-xs">
        {worldTabs.map((tab) => {
          const rank = allRanks[tab.id];
          const hasVictories = rank && rank.victories > 0;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedWorld(tab.id);
                marioAudio.playPipe();
              }}
              className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedWorld === tab.id
                  ? 'bg-amber-400 text-slate-950 font-black shadow-[0_2px_0_#000]'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              {hasVictories && (
                <span className="text-[9px] px-1 rounded bg-black/40 text-amber-200 font-mono">
                  {rank.tier}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* The Competitive Boss Rank Card */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${crest.gradient} p-0.5 border-3 ${crest.borderColor} ${crest.glow}`}
      >
        <div className="bg-slate-950/90 rounded-[14px] p-4 sm:p-5 space-y-4">
          {/* Card Top: Rank Crest & Boss Identity */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Boss Identity */}
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-amber-700 border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0_#000]">
                <MarioBowserIcon className="w-10 h-10 text-amber-300 drop-shadow" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  {currentRank.metadata.worldName}
                </span>
                <h4 className="text-lg sm:text-xl font-black text-white font-display">
                  {currentRank.metadata.bossName}
                </h4>
                <p className="text-xs text-slate-300">
                  {currentRank.metadata.bossTitle} · {currentRank.metadata.lawDomain}
                </p>
              </div>
            </div>

            {/* Right: Big Metallic Tier Badge */}
            <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2.5 rounded-2xl border-2 border-slate-700 shrink-0">
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                  Boss Rank
                </span>
                <span className="text-xs font-bold text-amber-300 block">
                  {currentRank.tierTitle}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono block">
                  {currentRank.percentileText}
                </span>
              </div>

              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${crest.gradient} border-2 ${crest.borderColor} flex flex-col items-center justify-center font-black font-mario shadow-inner`}
              >
                <span className="text-base text-white drop-shadow-[0_2px_2px_#000]">
                  {currentRank.tier}
                </span>
              </div>
            </div>
          </div>

          {/* Combat Rating Meter */}
          <div className="space-y-1.5 bg-slate-900/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Combat Performance Rating:
              </span>
              <span className="font-black text-amber-300 text-sm tabular-nums">
                {currentRank.combatRating} / 10,000 PTS
              </span>
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 transition-all duration-500"
                style={{ width: `${Math.max(4, Math.round((currentRank.combatRating / 10000) * 100))}%` }}
              />
            </div>
          </div>

          {/* Key Battle Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">Fastest Clear</span>
              <span className="text-base font-black text-emerald-400 font-mono tabular-nums">
                {currentRank.fastestClearSeconds !== null ? `${currentRank.fastestClearSeconds}s` : '--'}
              </span>
              <span className="text-[9px] text-slate-500 block font-mono">
                Target: {currentRank.metadata.targetClearSeconds}s
              </span>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">Best Accuracy</span>
              <span className="text-base font-black text-amber-300 font-mono tabular-nums">
                {currentRank.bestAccuracyPercent}%
              </span>
              <span className="text-[9px] text-slate-500 block font-mono">
                Score: {currentRank.bestScore}/{currentRank.totalQuestions}
              </span>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">Trials Cleared</span>
              <span className="text-base font-black text-white font-mono tabular-nums">
                {currentRank.victories}
              </span>
              <span className="text-[9px] text-slate-500 block font-mono">
                Total Fought: {currentRank.totalBattles}
              </span>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">Win Rate</span>
              <span className="text-base font-black text-sky-300 font-mono tabular-nums">
                {currentRank.winRatePercent}%
              </span>
              <span className="text-[9px] text-slate-500 block font-mono">
                Avg: {currentRank.averageClearSeconds !== null ? `${currentRank.averageClearSeconds}s` : '--'}
              </span>
            </div>
          </div>

          {/* Lore Doctrine Card */}
          <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-start gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase text-amber-300 font-mario">
                KEY BOSS DOCTRINE:
              </span>
              <p className="text-slate-300 italic text-[11px]">
                &quot;{currentRank.metadata.primaryDoctrine}&quot;
              </p>
            </div>
          </div>

          {/* Fight Boss CTA */}
          {onFightBoss && (
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => onFightBoss(selectedWorld)}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase rounded-xl border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4" />
                {currentRank.victories > 0 ? `Rematch ${currentRank.metadata.bossName}` : `Challenge ${currentRank.metadata.bossName}`}
              </button>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Earn bonus coins &amp; climb to SSS Super Star tier
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
