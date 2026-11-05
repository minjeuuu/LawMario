import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  Flame,
  CheckCircle2,
  Lock,
  ArrowRight,
  Edit3,
  Check,
  BookOpen,
  Compass,
  StickyNote,
  ShoppingBag,
  Flag,
  Zap,
  Crown,
  Star,
  Trash2,
  Copy,
  BarChart3,
} from 'lucide-react';
import {
  MarioCharacterAvatar,
  MarioCoinIcon,
  MarioMushroomIcon,
  MarioStarIcon,
  MarioPeachCrownIcon,
  MarioBowserIcon,
} from './MarioIcons';
import { MarioAvatar } from '../types/laborLaw';
import { HERO_ROSTER, getHeroMeta } from '../data/heroesData';
import { ALL_LAW_TOPICS, WORLDS_METADATA } from '../data/laborLawData';
import {
  EvaluatedAchievement,
  PlayerProfileStats,
  formatStudyDuration,
  formatDateKey,
  getWeeklyPomodoroChartData,
  WeeklyPomodoroDayData,
  readStoredDailyStudyGoal,
  saveStoredDailyStudyGoal,
  computeDailyStudyGoalStatus,
  computeWorldMasteryBadges,
  buildMonthlyStudyCalendar,
  MonthlyCalendarDayCell,
} from '../utils/profileAchievements';
import {
  UserProgressionState,
  getProgressionForXp,
  isAvatarUnlockedByLevel,
  LEVEL_THRESHOLDS,
} from '../utils/levelProgressionService';
import {
  ActiveDailyQuizStreakSnapshot,
  CompletedTopicsSparklineSeries,
  loadCompletedTopicsDailyHistory,
} from '../utils/round8Features';
import {
  CoinLedgerMap,
  LuxuryAvatarFrameId,
  LuxuryMushroomAuraId,
  build30DayStudyIntensitySeries,
  build30DayCompletionSparklineSeries,
  build30DayCoinVaultSeries,
  loadCoinLedger30d,
  loadLuxuryEquippedState,
} from '../utils/round9Features';
import { loadRound10VaultState } from '../utils/round10Features';
import {
  resolveEquippedNameplate,
  resolveCompanionInteraction,
} from '../utils/round12Features';
import { marioAudio } from '../utils/audio';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import { FlagpoleStreakWidget } from './FlagpoleStreakWidget';
import { StreakMilestoneTracker } from './StreakMilestoneTracker';
import { FlagpoleStreakState } from '../utils/quizFlagpoleStreak';
import { WorldBossRankCard } from './WorldBossRankCard';
import { QuizPerformanceInsightsPanel } from './QuizPerformanceInsightsPanel';
import { BossBattleLogEntry } from '../utils/round8Features';
import { SectionQuestionAttempt } from '../utils/quizPerformanceInsights';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: PlayerProfileStats | null;
  onUpdatePlayerName: (name: string) => void;
  achievements: EvaluatedAchievement[];
  equippedAvatar: MarioAvatar;
  onSelectAvatar: (avatar: MarioAvatar) => void;
  coins: number;
  loginStreak: number;
  completedTopicsCount: number;
  completedTopicIds?: string[];
  totalTopicsCount: number;
  onNavigateAction: (tab: string, worldId?: string) => void;
  onOpenWalkthrough: () => void;
  onOpenExportScoreCard: () => void;
  onToggleNeedsImprovementTopic?: (topicId: string) => void;
  onToggleNeedsImprovementWorld?: (worldId: string) => void;
  onStartQuickStudy?: () => void;
  onOpenLeaderboard?: () => void;
  dailyBossQuizStreak?: ActiveDailyQuizStreakSnapshot;
  completedTopicsSparkline?: CompletedTopicsSparklineSeries;
  onOpenBossBattleLog?: () => void;
  bossBattleLogCount?: number;
  onLaunchWeaknessDrill?: () => void;
  coinLedger?: CoinLedgerMap;
  completedTopicsHistory?: Record<string, number>;
  equippedLuxuryFrame?: LuxuryAvatarFrameId;
  equippedLuxuryAura?: LuxuryMushroomAuraId;
  userProgression?: UserProgressionState;
  onOpenLevelProgression?: () => void;
  flagpoleStreak?: FlagpoleStreakState;
  onUpdateFlagpoleStreak?: (next: FlagpoleStreakState) => void;
  onAwardBonusXp?: (xp: number) => void;
  bossBattleLog?: readonly BossBattleLogEntry[];
  onFightBoss?: (worldId?: string) => void;
  sectionAttemptsLog?: SectionQuestionAttempt[];
  onStartTargetedDrill?: (topicId: string) => void;
  onStartDailyQuiz?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdatePlayerName,
  achievements,
  equippedAvatar,
  onSelectAvatar,
  coins,
  loginStreak,
  completedTopicsCount,
  completedTopicIds = [],
  totalTopicsCount,
  onNavigateAction,
  onOpenWalkthrough,
  onOpenExportScoreCard,
  onToggleNeedsImprovementTopic,
  onToggleNeedsImprovementWorld,
  onStartQuickStudy,
  onOpenLeaderboard,
  dailyBossQuizStreak,
  completedTopicsSparkline,
  onOpenBossBattleLog,
  bossBattleLogCount = 0,
  onLaunchWeaknessDrill,
  coinLedger,
  completedTopicsHistory,
  equippedLuxuryFrame,
  equippedLuxuryAura,
  userProgression,
  onOpenLevelProgression,
  flagpoleStreak,
  onUpdateFlagpoleStreak,
  onAwardBonusXp,
  bossBattleLog = [],
  onFightBoss,
  sectionAttemptsLog,
  onStartTargetedDrill,
  onStartDailyQuiz,
}) => {
  const safeStats: PlayerProfileStats = React.useMemo(() => stats || {
    playerName: 'Mario Scholar',
    studiedSeconds: 0,
    studyTimeMinutes: 0,
    totalStudySessions: 0,
    quizzesCompleted: 0,
    perfectQuizzesCount: 0,
    consecutiveDaysStreak: 1,
    bestStreak: 1,
    firstActivityDate: '',
    lastActivityDate: '',
    accuracyPercentage: 0,
    coinsSpentTotal: 0,
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    needsImprovementTopicIds: [],
    needsImprovementWorlds: [],
    unlockedAchievementDates: {},
    dailyPomodoroLogs: {},
    quizHistory: [],
    perfectAnyQuizzes: 0,
    perfectWageQuizzes: 0,
    bestWageQuizPercent: 0,
  }, [stats]);

  const progressionStats = getProgressionForXp(userProgression?.totalXp || 0);
  const [filterTab, setFilterTab] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(safeStats.playerName);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showAllTopicsChecklist, setShowAllTopicsChecklist] = useState(false);
  const [showProfileHeatmap, setShowProfileHeatmap] = useState<boolean>(false);
  const [dailyGoalTarget, setDailyGoalTarget] = useState<number>(() => readStoredDailyStudyGoal());
  const [referenceNow, setReferenceNow] = useState<Date>(() => new Date());
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [chartMetric, setChartMetric] = useState<'minutes' | 'sessions'>('minutes');
  const todayStr = formatDateKey(referenceNow);
  const goalStatus = computeDailyStudyGoalStatus(safeStats, dailyGoalTarget, todayStr);

  const fallbackLuxury = React.useMemo(
    () =>
      typeof window !== 'undefined'
        ? loadLuxuryEquippedState(window.localStorage)
        : { avatarFrame: 'lux_frame_none' as const, mushroomAura: 'lux_aura_none' as const, cartridgeBadge: 'lux_cart_none' as const },
    [isOpen]
  );
  const activeLuxuryFrame = equippedLuxuryFrame || fallbackLuxury.avatarFrame;
  const activeLuxuryAura = equippedLuxuryAura || fallbackLuxury.mushroomAura;

  const studyIntensity30d = React.useMemo(
    () =>
      build30DayStudyIntensitySeries({
        dailyPomodoroLogs: safeStats.dailyPomodoroLogs,
        todayStudiedSeconds: safeStats.studiedSeconds,
        now: referenceNow,
      }),
    [safeStats.dailyPomodoroLogs, safeStats.studiedSeconds, todayStr]
  );

  const completionSparkline30d = React.useMemo(() => {
    const hist =
      completedTopicsHistory ||
      (typeof window !== 'undefined' ? loadCompletedTopicsDailyHistory(window.localStorage) : {});
    return build30DayCompletionSparklineSeries({
      history: hist,
      currentCompletedCount: completedTopicsCount,
      now: referenceNow,
    });
  }, [completedTopicsHistory, completedTopicsCount, todayStr]);

  const coinVault30d = React.useMemo(() => {
    const effectiveLedger =
      coinLedger || (typeof window !== 'undefined' ? loadCoinLedger30d(window.localStorage) : {});
    return build30DayCoinVaultSeries({
      ledger: effectiveLedger,
      currentCoins: coins,
      now: referenceNow,
    });
  }, [coinLedger, coins, todayStr]);

  // Favorite Tips State synced from localStorage
  const [favoriteTips, setFavoriteTips] = useState<{ title: string; tip: string; savedAt?: number }[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mario_favorite_tips');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [copiedTipTitle, setCopiedTipTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setReferenceNow(new Date());
    setWeekOffset(0);
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mario_favorite_tips');
        if (saved) setFavoriteTips(JSON.parse(saved));
      } catch {}
    }
    const timer = window.setInterval(() => {
      setReferenceNow(new Date());
    }, 30000);
    return () => window.clearInterval(timer);
  }, [isOpen]);

  const handleRemoveFavoriteTip = (title: string) => {
    const updated = favoriteTips.filter((t) => t.title !== title);
    setFavoriteTips(updated);
    try {
      localStorage.setItem('mario_favorite_tips', JSON.stringify(updated));
    } catch {}
    marioAudio.playPipe();
  };

  const handleCopyFavoriteTip = (tip: { title: string; tip: string }) => {
    try {
      navigator.clipboard.writeText(`${tip.title}\n\n${tip.tip}\n\nSuper Mario Labor Adventure`);
      setCopiedTipTitle(tip.title);
      setTimeout(() => setCopiedTipTitle(null), 2000);
      marioAudio.playCoin();
    } catch {}
  };

  // Monthly Calendar & Streak + Completed Daily Goal Grid State
  const [calendarViewDate, setCalendarViewDate] = useState(() => new Date());
  const [selectedCalendarDayKey, setSelectedCalendarDayKey] = useState<string>(() =>
    formatDateKey(new Date())
  );
  const calYear = calendarViewDate.getFullYear();
  const calMonth = calendarViewDate.getMonth();
  const monthName = calendarViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const isCurrentCalendarMonth =
    calYear === referenceNow.getFullYear() && calMonth === referenceNow.getMonth();

  const monthlyCalendar = React.useMemo(
    () =>
      buildMonthlyStudyCalendar({
        stats: safeStats,
        year: calYear,
        month: calMonth,
        loginStreak,
        dailyGoalTarget,
        referenceToday: referenceNow,
      }),
    [safeStats, calYear, calMonth, loginStreak, dailyGoalTarget, todayStr]
  );

  const selectedCalendarCell: MonthlyCalendarDayCell | null = React.useMemo(
    () =>
      monthlyCalendar.cells.find((d) => d.dateKey === selectedCalendarDayKey) ||
      monthlyCalendar.cells.find((d) => d.isToday) ||
      monthlyCalendar.cells[0] ||
      null,
    [monthlyCalendar.cells, selectedCalendarDayKey]
  );

  const weeklyChartData = React.useMemo(
    () => getWeeklyPomodoroChartData(safeStats, referenceNow, weekOffset),
    [safeStats, referenceNow, weekOffset]
  );

  const weeklyTotalMinutes = React.useMemo(
    () => weeklyChartData.reduce((acc, item) => acc + item.minutes, 0),
    [weeklyChartData]
  );

  const weeklyTotalSessions = React.useMemo(
    () => weeklyChartData.reduce((acc, item) => acc + item.sessions, 0),
    [weeklyChartData]
  );

  const weeklyRangeLabel =
    weeklyChartData.length > 0
      ? `${weeklyChartData[0].dateDisplay} – ${weeklyChartData[weeklyChartData.length - 1].dateDisplay}`
      : '';

  const worldMasteryBadges = React.useMemo(
    () =>
      computeWorldMasteryBadges(
        completedTopicIds,
        ALL_LAW_TOPICS,
        safeStats.unlockedAchievementDates
      ),
    [completedTopicIds, safeStats.unlockedAchievementDates]
  );

  const unlockedWorldBadgesCount = React.useMemo(
    () => worldMasteryBadges.filter((b) => b.unlocked).length,
    [worldMasteryBadges]
  );

  const handleSelectGoalMinutes = (mins: number) => {
    setDailyGoalTarget(mins);
    saveStoredDailyStudyGoal(mins);
    marioAudio.playCoin();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const heroMeta = getHeroMeta(equippedAvatar);
  const overallProgressPercent = Math.min(
    100,
    Math.round((completedTopicsCount / Math.max(1, totalTopicsCount)) * 100)
  );

  const weakTopicIds = safeStats.needsImprovementTopicIds || [];
  const weakWorlds = safeStats.needsImprovementWorlds || [];
  const totalWeakCount = weakTopicIds.length + weakWorlds.length;

  const heroRank =
    unlockedCount >= 10 || overallProgressPercent >= 100
      ? 'Invincible Star Bar Grandmaster'
      : unlockedCount >= 6 || overallProgressPercent >= 65
      ? 'Fire Flower Statutory Specialist'
      : unlockedCount >= 3 || overallProgressPercent >= 30
      ? 'Super Mushroom Labor Advocate'
      : 'Stage 1-1 Law Challenger';

  const visibleAchievements = achievements.filter((item) => {
    if (filterTab === 'unlocked') return item.unlocked;
    if (filterTab === 'locked') return !item.unlocked;
    return true;
  });

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = nameInput.trim();
    if (cleaned) {
      onUpdatePlayerName(cleaned);
    } else {
      setNameInput(safeStats.playerName);
    }
    setIsEditingName(false);
    marioAudio.playCoin();
  };

  const renderBadgeIcon = (iconKey: EvaluatedAchievement['iconKey']) => {
    switch (iconKey) {
      case 'clock':
        return <Clock className="w-6 h-6 text-sky-400" />;
      case 'trophy':
        return <Trophy className="w-6 h-6 text-amber-400" />;
      case 'wage_crown':
        return <MarioPeachCrownIcon className="w-6 h-6" />;
      case 'mushroom':
        return <MarioMushroomIcon className="w-6 h-6" />;
      case 'flame':
        return <Flame className="w-6 h-6 text-orange-400" />;
      case 'bowser':
        return <MarioBowserIcon className="w-6 h-6" />;
      case 'book':
        return <BookOpen className="w-6 h-6 text-emerald-400" />;
      case 'notes':
        return <StickyNote className="w-6 h-6 text-yellow-300" />;
      case 'compass':
        return <Compass className="w-6 h-6 text-cyan-400" />;
      case 'star':
      default:
        return <MarioStarIcon className="w-6 h-6" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-label="User Profile and Achievements"
      data-testid="user-profile-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 select-none overflow-y-auto print:hidden"
    >
      <div className="bg-[#1e293b] text-white w-full h-[100dvh] max-h-[100dvh] rounded-none border-0 sm:w-full sm:max-w-4xl sm:h-auto sm:max-h-[92vh] sm:rounded-3xl sm:border-4 sm:border-slate-950 shadow-[8px_8px_0_#000] overflow-hidden my-auto flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        {/* Top Modal Header */}
        <div className="bg-[#0f172a] px-4 sm:px-6 py-3.5 sm:py-4 border-b-2 border-slate-700 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000] shrink-0">
              <Award className="w-6 h-6 text-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-amber-400 font-mario">
                  HERO DOSSIER &amp; MILESTONES
                </span>
                {(() => {
                  const r10 =
                    typeof window !== 'undefined'
                      ? loadRound10VaultState(window.localStorage)
                      : null;
                  const plate = resolveEquippedNameplate(r10?.equippedNameplate);
                  if (!plate) return null;
                  return (
                    <span
                      data-testid="profile-equipped-nameplate"
                      className={`px-2 py-0.5 rounded-lg border text-[9px] font-black ${plate.badgeClasses}`}
                    >
                      {plate.name}
                    </span>
                  );
                })()}
              </div>
              <h2 className="text-base sm:text-xl font-black text-white font-display truncate">
                USER PROFILE &amp; ACHIEVEMENTS
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenLeaderboard && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLeaderboard();
                }}
                className="hidden md:inline-flex min-h-[44px] px-3 items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black cursor-pointer whitespace-nowrap"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Coin Leaderboard</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenExportScoreCard();
              }}
              className="hidden sm:inline-flex min-h-[44px] px-3 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs border-2 border-black cursor-pointer whitespace-nowrap"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>Export Score Card</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close User Profile Modal"
              className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 min-h-0 overscroll-contain">
          {/* Section 1: Hero Identity & Live Telemetry Card */}
          <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border-2 border-slate-700 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative inline-flex shrink-0">
                  {activeLuxuryAura !== 'lux_aura_none' && (
                    <span
                      aria-hidden="true"
                      data-testid="profile-luxury-aura"
                      className={`pointer-events-none absolute -inset-1.5 rounded-3xl blur-xs opacity-90 ${
                        activeLuxuryAura === 'lux_aura_cosmic_nebula'
                          ? 'bg-gradient-to-tr from-fuchsia-500 via-cyan-400 to-indigo-500'
                          : activeLuxuryAura === 'lux_aura_royal_crown_glow'
                          ? 'bg-gradient-to-tr from-rose-500 via-amber-300 to-yellow-200'
                          : 'bg-gradient-to-tr from-amber-500 via-yellow-300 to-emerald-400'
                      }`}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowAvatarPicker((prev) => !prev);
                      marioAudio.playJump();
                    }}
                    aria-label="Change Equipped Hero Avatar"
                    title="Click to switch Hero Avatar"
                    data-testid="profile-hero-avatar-btn"
                    className={`relative w-16 h-16 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shrink-0 ${
                      activeLuxuryFrame === 'lux_frame_gold_filigree'
                        ? 'bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 border-4 border-amber-300 ring-2 ring-yellow-200 shadow-[0_4px_12px_rgba(251,191,36,0.5)]'
                        : activeLuxuryFrame === 'lux_frame_grand_star_platinum'
                        ? 'bg-gradient-to-br from-slate-100 via-cyan-200 to-indigo-300 border-4 border-cyan-200 ring-2 ring-white shadow-[0_4px_12px_rgba(103,232,249,0.5)]'
                        : activeLuxuryFrame === 'lux_frame_sovereign_ruby'
                        ? 'bg-gradient-to-br from-rose-500 via-amber-400 to-red-700 border-4 border-amber-300 ring-2 ring-rose-300 shadow-[0_4px_12px_rgba(244,63,94,0.5)]'
                        : 'bg-amber-400 border-3 border-black shadow-[0_3px_0_#000]'
                    }`}
                  >
                    <MarioCharacterAvatar character={equippedAvatar} className="w-12 h-12" />
                  </button>
                </div>

                <div className="min-w-0 space-y-1">
                  {isEditingName ? (
                    <form onSubmit={handleSaveName} className="flex items-center gap-2">
                      <label htmlFor="profile-player-name" className="sr-only">
                        Player Name
                      </label>
                      <input
                        id="profile-player-name"
                        type="text"
                        maxLength={32}
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        autoFocus
                        className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-950 border-2 border-amber-400 text-white font-bold text-sm w-44 sm:w-56"
                      />
                      <button
                        type="submit"
                        aria-label="Save Player Name"
                        className="min-h-[44px] px-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs border-2 border-black inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-white font-display truncate">
                        {safeStats.playerName}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setNameInput(safeStats.playerName);
                          setIsEditingName(true);
                        }}
                        aria-label="Edit Player Name"
                        className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 inline-flex items-center justify-center cursor-pointer shrink-0"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-semibold pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLevelProgression?.();
                        marioAudio.playPowerUp();
                      }}
                      title="View Level Roadmap & Character Unlocks"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs hover:brightness-105 transition-all cursor-pointer border border-black shadow-[0_2px_0_#000]"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Level {progressionStats.level}: {progressionStats.title}</span>
                    </button>
                    <span className="text-amber-200 font-mono text-[11px] font-bold">
                      {progressionStats.xpInCurrentLevel}/{progressionStats.xpRequiredForCurrentLevel} XP
                    </span>
                    {typeof window !== 'undefined' && localStorage.getItem('mario_equipped_title') && (
                      <span className="text-emerald-300 font-bold">
                        · {localStorage.getItem('mario_equipped_title')}
                      </span>
                    )}
                    {typeof window !== 'undefined' && (() => {
                      const compId = localStorage.getItem('mario_equipped_companion');
                      if (!compId || compId === 'comp_none') return null;
                      const compMeta = resolveCompanionInteraction(compId);
                      return (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 text-pink-300 font-bold">
                            <span>Pet: {compMeta.name}</span>
                          </span>
                        </>
                      );
                    })()}
                    <span aria-hidden="true">·</span>
                    <span>Hero: {heroMeta.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker((prev) => !prev)}
                  className="min-h-[44px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-600 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{showAvatarPicker ? 'Hide Heroes' : 'Switch Hero'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenExportScoreCard();
                  }}
                  className="sm:hidden min-h-[44px] px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Score Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWalkthrough();
                  }}
                  className="min-h-[44px] px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span>App Guide</span>
                </button>
              </div>
            </div>

            {/* Quick Inline Avatar Switcher */}
            {showAvatarPicker && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                    HERO ROSTER ({progressionStats.unlockedAvatars.length}/{HERO_ROSTER.length} UNLOCKED AT LV.{progressionStats.level})
                  </span>
                  {onOpenLevelProgression && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLevelProgression();
                      }}
                      className="text-[11px] font-bold text-amber-300 hover:underline cursor-pointer"
                    >
                      View Unlock Roadmap &rarr;
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {HERO_ROSTER.map((hero) => {
                    const active = equippedAvatar === hero.id;
                    const isUnlocked = isAvatarUnlockedByLevel(hero.id, progressionStats.level);
                    const requiredLevel = LEVEL_THRESHOLDS.find((t) => t.unlockedAvatars.includes(hero.id))?.level || 1;

                    return (
                      <button
                        key={hero.id}
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => {
                          if (!isUnlocked) {
                            marioAudio.playWrongAnswer();
                            return;
                          }
                          onSelectAvatar(hero.id);
                          marioAudio.playCoin();
                        }}
                        title={isUnlocked ? `Equip ${hero.name}` : `Locked! Reach Level ${requiredLevel} to unlock ${hero.name}`}
                        className={`min-h-[64px] p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all relative ${
                          !isUnlocked
                            ? 'bg-slate-950/60 text-slate-500 border-slate-800 opacity-60 cursor-not-allowed'
                            : active
                            ? 'bg-amber-400 text-slate-950 border-black font-black shadow-[0_2px_0_#000] cursor-pointer'
                            : 'bg-slate-950/80 text-slate-300 border-slate-700 hover:border-amber-400/60 cursor-pointer'
                        }`}
                      >
                        {!isUnlocked && (
                          <div className="absolute top-1 right-1 bg-black/80 rounded-md p-0.5 border border-slate-700">
                            <Lock className="w-2.5 h-2.5 text-amber-400" />
                          </div>
                        )}
                        <MarioCharacterAvatar character={hero.id} className="w-7 h-7" />
                        <span className="text-[10px] font-bold truncate w-full">{hero.name}</span>
                        {!isUnlocked && (
                          <span className="text-[8px] font-mono text-amber-400 font-black">
                            Lv.{requiredLevel}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7 Live Stat Readouts (Including Daily Login Streak + Daily Boss Quiz Streak) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
              <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Study Time
                </span>
                <span
                  data-testid="profile-stat-study-time"
                  className="text-base sm:text-lg font-black text-sky-300 tabular-nums mt-0.5 block"
                >
                  {formatStudyDuration(safeStats.studiedSeconds)}
                </span>
                <span className="text-[11px] text-slate-400">Goal: 5h 00m</span>
              </div>

              <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Quizzes Done
                </span>
                <span
                  data-testid="profile-stat-quizzes"
                  className="text-base sm:text-lg font-black text-amber-300 tabular-nums mt-0.5 block"
                >
                  {safeStats.quizzesCompleted}
                </span>
                <span className="text-[11px] text-slate-400">Goal: 10 Runs</span>
              </div>

              <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Wage Quiz Best
                </span>
                <span
                  data-testid="profile-stat-wage-best"
                  className="text-base sm:text-lg font-black text-emerald-300 tabular-nums mt-0.5 block"
                >
                  {safeStats.perfectWageQuizzes >= 1 ? '100%' : `${safeStats.bestWageQuizPercent}%`}
                </span>
                <span className="text-[11px] text-slate-400">World 3 Wages</span>
              </div>

              <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Modules Read
                </span>
                <span className="text-base sm:text-lg font-black text-white tabular-nums mt-0.5 block">
                  {completedTopicsCount}/{totalTopicsCount}
                </span>
                <span className="text-[11px] text-slate-400">{overallProgressPercent}% Clear</span>
              </div>

              <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Login Streak
                </span>
                <span className="text-base sm:text-lg font-black text-orange-300 tabular-nums mt-0.5 block">
                  {loginStreak} {loginStreak === 1 ? 'Day' : 'Days'}
                </span>
                <span className="text-[11px] text-slate-400">Daily Login</span>
              </div>

              <div
                data-testid="profile-daily-quiz-streak-card"
                className="bg-slate-950/90 rounded-xl p-3 border border-rose-500/50"
              >
                <span className="text-[10px] font-bold uppercase text-rose-300 block">
                  Quiz Streak
                </span>
                <span className="text-base sm:text-lg font-black text-rose-300 tabular-nums mt-0.5 block">
                  {dailyBossQuizStreak?.activeStreak ?? 0}{' '}
                  {(dailyBossQuizStreak?.activeStreak ?? 0) === 1 ? 'Day' : 'Days'}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  {dailyBossQuizStreak?.completedToday
                    ? 'Done Today!'
                    : `Next: +${dailyBossQuizStreak?.nextStreakBonusCoins ?? 15}c`}
                </span>
              </div>

              <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Coin Wallet
                </span>
                <span className="text-base sm:text-lg font-black text-amber-400 tabular-nums mt-0.5 inline-flex items-center gap-1">
                  <MarioCoinIcon className="w-4 h-4" />
                  <span>x{coins}</span>
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {unlockedCount}/{achievements.length} Badges
                </span>
              </div>
            </div>

            {/* 7-Day Completed Topics Mini Sparkline Trend Card */}
            {completedTopicsSparkline && (
              <div
                data-testid="completed-topics-sparkline-card"
                className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-black uppercase text-emerald-300 font-mario block">
                    7-DAY COMPLETED TOPICS TREND
                  </span>
                  <div className="flex items-baseline gap-2 flex-wrap tabular-nums">
                    <span className="text-lg sm:text-xl font-black text-white">
                      {completedTopicsSparkline.latestCount} / {totalTopicsCount} Topics
                    </span>
                    <span
                      className={`text-xs font-extrabold ${
                        completedTopicsSparkline.delta7d > 0
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {completedTopicsSparkline.delta7d > 0
                        ? `+${completedTopicsSparkline.delta7d} in last 7 days`
                        : 'Steady over last 7 days'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono tabular-nums flex-wrap">
                    {completedTopicsSparkline.points.map((pt) => (
                      <span
                        key={pt.dateKey}
                        className={pt.isToday ? 'text-amber-300 font-bold' : ''}
                      >
                        {pt.dayLabel}:{pt.count}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-full sm:w-64 shrink-0 bg-slate-900/90 rounded-lg p-2 border border-slate-800">
                  <svg
                    viewBox={`0 0 ${completedTopicsSparkline.svgWidth} ${completedTopicsSparkline.svgHeight}`}
                    role="img"
                    aria-label="7-day completed topics sparkline chart"
                    className="w-full h-16"
                  >
                    <defs>
                      <linearGradient id="completedSparkArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    {completedTopicsSparkline.areaPath && (
                      <path
                        d={completedTopicsSparkline.areaPath}
                        fill="url(#completedSparkArea)"
                      />
                    )}
                    <polyline
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={completedTopicsSparkline.polylinePoints}
                    />
                    {completedTopicsSparkline.points.map((pt) => (
                      <circle
                        key={pt.dateKey}
                        cx={pt.svgX}
                        cy={pt.svgY}
                        r={pt.isToday ? 4 : 2.75}
                        fill={pt.isToday ? '#fbbf24' : '#34d399'}
                        stroke="#0f172a"
                        strokeWidth="1.2"
                      />
                    ))}
                  </svg>
                </div>
              </div>
            )}

            {/* 30-Day Recharts Analytics Suite: Study Intensity, 30-Day Completion Sparkline & Coin Vault */}
            <div
              data-testid="profile-30d-analytics"
              className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 pt-1"
            >
              {/* 1. 30-Day Study Intensity Bar Chart */}
              <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
                      STUDY INTENSITY (30D)
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      Minutes Studied Per Day
                    </span>
                  </div>
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                </div>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studyIntensity30d} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: '#94a3b8', fontSize: 9 }}
                        interval={6}
                        axisLine={{ stroke: '#334155' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#f59e0b',
                          borderRadius: '10px',
                          fontSize: '11px',
                          color: '#f8fafc',
                        }}
                      />
                      <Bar dataKey="minutes" name="Minutes" fill="#fbbf24" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2. 30-Day Completion Sparkline */}
              <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-300 font-mario block">
                      30-DAY COMPLETION SPARKLINE
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      Mastered Topics Trajectory
                    </span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={completionSparkline30d} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="profileComp30dGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: '#94a3b8', fontSize: 9 }}
                        interval={6}
                        axisLine={{ stroke: '#334155' }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, Math.max(totalTopicsCount, 10)]}
                        tick={{ fill: '#94a3b8', fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#10b981',
                          borderRadius: '10px',
                          fontSize: '11px',
                          color: '#f8fafc',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="completedTopics"
                        name="Mastered Topics"
                        stroke="#34d399"
                        strokeWidth={2.5}
                        fill="url(#profileComp30dGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 3. Coin Vault 30-Day Earned vs Spent Line Graph */}
              <div
                data-testid="profile-coin-vault-chart"
                className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-cyan-300 font-mario block">
                      COIN VAULT (30D LEDGER)
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      Cumulative Earned vs Spent
                    </span>
                  </div>
                  <MarioCoinIcon className="w-4 h-4 shrink-0" />
                </div>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={coinVault30d} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: '#94a3b8', fontSize: 9 }}
                        interval={6}
                        axisLine={{ stroke: '#334155' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#38bdf8',
                          borderRadius: '10px',
                          fontSize: '11px',
                          color: '#f8fafc',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '2px' }} />
                      <Line
                        type="monotone"
                        dataKey="totalEarned"
                        name="Earned"
                        stroke="#fbbf24"
                        strokeWidth={2.2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalSpent"
                        name="Spent"
                        stroke="#f43f5e"
                        strokeWidth={2.2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1.1: 5-Day Quiz Performance Flagpole Streak */}
          {flagpoleStreak && onUpdateFlagpoleStreak && (
            <div data-testid="profile-flagpole-section">
              <FlagpoleStreakWidget
                streakState={flagpoleStreak}
                onUpdateStreakState={onUpdateFlagpoleStreak}
                onAwardBonusXp={onAwardBonusXp}
                equippedAvatar={equippedAvatar}
                onStartDailyQuiz={() => {
                  onClose();
                  if (onStartDailyQuiz) {
                    onStartDailyQuiz();
                  } else {
                    onNavigateAction('quiz');
                  }
                }}
              />
            </div>
          )}

          {/* Section 1.15: Consecutive Study Day Pixel-Art Milestone Tracker */}
          <div data-testid="profile-streak-milestones-section">
            <StreakMilestoneTracker
              currentStreakDays={Math.max(loginStreak, flagpoleStreak?.currentStreak ?? 0)}
            />
          </div>

          {/* Section 1.2: World Boss Competitive Rank System Card */}
          <div data-testid="profile-world-boss-ranks-section">
            <WorldBossRankCard
              bossBattleLog={bossBattleLog}
              onFightBoss={(worldId) => {
                onClose();
                if (onFightBoss) {
                  onFightBoss(worldId);
                } else {
                  onNavigateAction('quiz');
                }
              }}
              onOpenBossBattleLog={onOpenBossBattleLog}
            />
          </div>

          {/* Section 1.23: 30-Day Quiz Performance Insights & Labor Law Section Heatmap */}
          <div data-testid="profile-quiz-heatmap-section" className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/95 border-2 border-slate-800 rounded-2xl p-3 sm:p-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 border border-black flex items-center justify-center font-black shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-white font-display truncate">
                    30-Day Quiz Miss &amp; Accuracy Heatmap
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    Interactive diagnostic heatmap of Philippine Labor Law provisions and codal sections
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowProfileHeatmap((prev) => !prev);
                  marioAudio.playPipe();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border border-black shadow-[0_2px_0_#000] cursor-pointer whitespace-nowrap shrink-0 transition-all self-start sm:self-auto"
              >
                {showProfileHeatmap ? 'Hide 30-Day Heatmap' : 'Show 30-Day Heatmap'}
              </button>
            </div>

            {showProfileHeatmap && (
              <QuizPerformanceInsightsPanel
                attemptsLog={sectionAttemptsLog}
                onStartTargetedDrill={(topicId) => {
                  onClose();
                  if (onStartTargetedDrill) {
                    onStartTargetedDrill(topicId);
                  } else {
                    onNavigateAction('quiz');
                  }
                }}
                onOpenStudyNotes={(topicId) => {
                  onClose();
                  const matchedTopic = ALL_LAW_TOPICS.find((t) => t.id === topicId);
                  onNavigateAction('modules', matchedTopic?.worldId);
                }}
              />
            )}
          </div>

          {/* Section 1.25: 'Need Improvement' Focus Areas & 5-Min Quick Study Mode */}
          <div
            data-testid="profile-needs-improvement-section"
            className="bg-slate-900 rounded-2xl p-4 sm:p-5 border-2 border-rose-500/60 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500 border-2 border-black flex items-center justify-center text-white shadow-[0_2px_0_#000] shrink-0">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-rose-300 font-mario block">
                    PERSONALIZED WEAK-SPOT DECK ({totalWeakCount} FLAGGED)
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white font-display">
                    TOPICS MARKED &ldquo;NEED IMPROVEMENT&rdquo;
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {onLaunchWeaknessDrill && (
                  <button
                    type="button"
                    data-testid="profile-launch-weakness-drill-btn"
                    onClick={() => {
                      onClose();
                      onLaunchWeaknessDrill();
                    }}
                    className="min-h-[44px] px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs border-2 border-black shadow-[0_3px_0_#000] inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Flame className="w-4 h-4 shrink-0" />
                    <span>Targeted Weakness Drill</span>
                  </button>
                )}

                {onStartQuickStudy && (
                  <button
                    type="button"
                    data-testid="profile-launch-quick-study-btn"
                    onClick={() => {
                      onClose();
                      onStartQuickStudy();
                    }}
                    className="min-h-[44px] px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_3px_0_#000] inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Zap className="w-4 h-4 shrink-0" />
                    <span>Quick Study Mode (5-Min Deck)</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Mark any World or specific Labor Law topic below as <strong className="text-rose-300">Need Improvement</strong>. Clicking <strong>Quick Study Mode</strong> builds a 5-minute curated flashcard sprint targeting these exact areas!
            </p>

            {/* Quick World Flag Buttons (W1–W6 + Holidays) */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                ...WORLDS_METADATA.map((w) => ({ id: w.id, label: `W${w.worldNumber}: ${w.shortTitle}` })),
                { id: 'holidays', label: 'Holidays Hub' },
              ].map((item) => {
                const flagged = weakWorlds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`toggle-weak-world-${item.id}`}
                    onClick={() => {
                      onToggleNeedsImprovementWorld?.(item.id);
                      marioAudio.playCoin();
                    }}
                    className={`min-h-[44px] px-3 rounded-xl text-xs font-black border transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                      flagged
                        ? 'bg-rose-600 text-white border-black shadow-[0_2px_0_#000]'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-rose-400'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Expandable Individual Topic Checklist */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAllTopicsChecklist((p) => !p)}
                className="min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>
                  {showAllTopicsChecklist
                    ? 'Hide Individual Topic Checklist'
                    : `Select Specific Topics (${weakTopicIds.length}/${ALL_LAW_TOPICS.length} Marked)`}
                </span>
              </button>

              {showAllTopicsChecklist && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 max-h-60 overflow-y-auto pr-1">
                  {ALL_LAW_TOPICS.map((topic) => {
                    const isMarked = weakTopicIds.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => {
                          onToggleNeedsImprovementTopic?.(topic.id);
                          marioAudio.playJump();
                        }}
                        className={`min-h-[44px] p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between gap-2 cursor-pointer ${
                          isMarked
                            ? 'bg-rose-950/80 border-rose-400 text-rose-100'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span className="truncate">{topic.title}</span>
                        <span className="shrink-0 text-[10px] font-black uppercase">
                          {isMarked ? 'Marked' : '+ Flag'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section 1.3: Favorite Tips (Bookmarked Toad's Pro Tips) */}
          <div
            data-testid="profile-favorite-tips-section"
            className="bg-slate-900 rounded-2xl p-4 sm:p-5 border-2 border-slate-700 space-y-3.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 shadow-[0_2px_0_#000] shrink-0">
                  <Star className="w-5 h-5 fill-slate-950 text-slate-950" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                    BOOKMARKED PRO DOCTRINES ({favoriteTips.length} SAVED)
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white font-display">
                    FAVORITE TIPS &amp; DOCTRINES
                  </h3>
                </div>
              </div>
            </div>

            {favoriteTips.length === 0 ? (
              <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 text-center space-y-1.5">
                <p className="text-xs text-slate-300 font-medium">
                  No favorite tips saved yet. Click the <strong className="text-amber-300">Favorite</strong> (Star) button on Toad&apos;s Pro Tip dialog on the World Map to save key labor doctrines here for rapid Bar review!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {favoriteTips.map((tip, idx) => (
                  <div
                    key={tip.title || idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        <h4 className="text-xs sm:text-sm font-black text-amber-300 font-display truncate">
                          {tip.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {tip.tip}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyFavoriteTip(tip)}
                        title="Copy tip to clipboard"
                        aria-label="Copy favorite tip to clipboard"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                      >
                        {copiedTipTitle === tip.title ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-amber-300" />
                        )}
                        <span className="sm:hidden">{copiedTipTitle === tip.title ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveFavoriteTip(tip.title)}
                        title="Remove from favorites"
                        aria-label="Remove from favorites"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sm:hidden">Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 1.5: Daily Study Goal Tracker */}
          <div
            data-testid="daily-study-goal-section"
            className="bg-slate-900 rounded-2xl p-4 sm:p-5 border-2 border-slate-700 space-y-3.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 shadow-[0_2px_0_#000] shrink-0">
                  <Flame className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                    DAILY COMMITMENT
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white font-display">
                    DAILY STUDY GOAL TRACKER
                  </h3>
                </div>
              </div>

              {/* Goal Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleSelectGoalMinutes(mins)}
                    className={`min-h-[44px] min-w-[44px] px-3 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                      dailyGoalTarget === mins
                        ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Bar & Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <span>Target: {dailyGoalTarget} minutes today</span>
                  {goalStatus.isGoalAchieved && (
                    <span className="text-emerald-400 font-black">· Goal Met!</span>
                  )}
                </span>
                <span className="font-mono text-amber-300 tabular-nums font-black text-sm">
                  {goalStatus.minutesToday}m / {dailyGoalTarget}m ({goalStatus.progressPercent}%)
                </span>
              </div>

              <div className="w-full h-4 bg-slate-950 rounded-xl border border-slate-700 overflow-hidden relative p-0.5">
                <div
                  className={`h-full rounded-lg transition-all duration-500 ${
                    goalStatus.isGoalAchieved
                      ? 'bg-gradient-to-r from-emerald-400 to-green-300'
                      : 'bg-gradient-to-r from-amber-500 to-amber-300'
                  }`}
                  style={{ width: `${goalStatus.progressPercent}%` }}
                />
              </div>

              <p className="text-xs text-slate-400">
                {goalStatus.isGoalAchieved
                  ? 'Congratulations! You achieved your daily study goal. Interacting with topic audio, flashcards, or quiz questions continues to build your mastery.'
                  : `${Math.max(0, dailyGoalTarget - goalStatus.minutesToday)} minutes remaining to complete today's goal. Read topic articles, listen to audio, or practice flashcards to advance!`}
              </p>
            </div>
          </div>

          {/* Section 1.75: Quiz History (Last 5 Completed Quiz Attempts) */}
          <div
            data-testid="profile-quiz-history-section"
            className="bg-slate-900 rounded-2xl p-4 sm:p-5 border-2 border-slate-700 space-y-4 max-w-full overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 shadow-[0_2px_0_#000] shrink-0">
                  <Trophy className="w-5 h-5 text-slate-950" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-amber-400 font-mario block truncate">
                    PERFORMANCE TRACKER
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white font-display truncate">
                    QUIZ HISTORY &amp; MASTERY PROGRESS
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-300">
                <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-amber-300 font-mono">
                  Total Runs: {safeStats.quizzesCompleted}
                </span>
                {safeStats.perfectAnyQuizzes > 0 && (
                  <span className="bg-emerald-950 px-2.5 py-1 rounded-xl border border-emerald-700 text-emerald-300 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {safeStats.perfectAnyQuizzes} Perfect
                  </span>
                )}
                {onOpenBossBattleLog && (
                  <button
                    type="button"
                    data-testid="profile-open-boss-log-btn"
                    onClick={() => {
                      onOpenBossBattleLog();
                      marioAudio.playCoin();
                    }}
                    className="min-h-[34px] px-3 py-1 rounded-xl bg-red-950 hover:bg-red-900 border border-red-600 text-amber-300 font-black inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Boss Battle Log ({bossBattleLogCount})</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed break-words">
              Review your last 5 completed quiz runs across all Worlds and Boss battles. Track accuracy trends and pinpoint areas for improvement.
            </p>

            {(!safeStats.quizHistory || safeStats.quizHistory.length === 0) ? (
              <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 text-center space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-white font-display">No Completed Quizzes Recorded Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Take the Bar Quiz Quest or challenge Bowser in the Courtroom Boss Battle to start logging your scores here!
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateAction('quiz');
                    }}
                    className="min-h-[42px] px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl border-2 border-black shadow-[0_2px_0_#000] cursor-pointer inline-flex items-center gap-1.5 active:translate-y-0.5"
                  >
                    <span>Launch Bar Quiz Quest</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {safeStats.quizHistory.slice(0, 5).map((attempt, idx) => {
                  const isHigh = attempt.scorePercent >= 80;
                  const isMid = attempt.scorePercent >= 60 && attempt.scorePercent < 80;
                  const scoreColor = isHigh
                    ? 'text-emerald-400 border-emerald-600/80 bg-emerald-950/40'
                    : isMid
                    ? 'text-amber-400 border-amber-600/80 bg-amber-950/40'
                    : 'text-rose-400 border-rose-600/80 bg-rose-950/40';

                  const badgeBg = isHigh
                    ? 'bg-emerald-500 text-slate-950'
                    : isMid
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-rose-600 text-white';

                  return (
                    <div
                      key={attempt.id || idx}
                      data-testid={`profile-quiz-history-item-${idx}`}
                      className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center font-mario text-xs font-black shrink-0 ${scoreColor}`}
                        >
                          #{idx + 1}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-black text-white font-display truncate max-w-full">
                              {attempt.topicOrWorld}
                            </span>
                            {attempt.isPerfect && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mario shrink-0">
                                PERFECT
                              </span>
                            )}
                            {attempt.isBossVictory && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mario shrink-0">
                                BOSS CLEARED
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                            <span className="font-medium">{attempt.formattedDate}</span>
                            <span aria-hidden="true">•</span>
                            <span className="font-mono text-slate-300">
                              {attempt.correctCount} / {attempt.totalCount} Correct
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        {/* Visual mini-bar */}
                        <div className="w-24 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 hidden sm:block">
                          <div
                            className={`h-full ${
                              isHigh ? 'bg-emerald-400' : isMid ? 'bg-amber-400' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.max(5, attempt.scorePercent)}%` }}
                          />
                        </div>

                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-black font-mario tabular-nums shrink-0 ${badgeBg}`}
                        >
                          {attempt.scorePercent}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Weekly Daily Study & Focus Bar Chart (Live Rolling 7-Day Calendar Window) */}
          <div
            data-testid="weekly-pomodoro-history-section"
            className="bg-slate-900 rounded-2xl p-4 sm:p-5 border-2 border-slate-700 space-y-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 shadow-[0_2px_0_#000] shrink-0">
                  <Clock className="w-5 h-5 text-slate-950" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                    LIVE 7-DAY CALENDAR TRACKER
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white font-display">
                    WEEKLY STUDY &amp; FOCUS ACTIVITY
                  </h3>
                </div>
              </div>

              {/* Metric Switcher + Week Date Stepper */}
              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
                <div
                  role="group"
                  aria-label="Weekly chart metric"
                  className="inline-flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700"
                >
                  <button
                    type="button"
                    data-testid="weekly-chart-metric-minutes"
                    onClick={() => {
                      setChartMetric('minutes');
                      marioAudio.playClick();
                    }}
                    className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      chartMetric === 'minutes'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Study Mins ({weeklyTotalMinutes}m)
                  </button>
                  <button
                    type="button"
                    data-testid="weekly-chart-metric-sessions"
                    onClick={() => {
                      setChartMetric('sessions');
                      marioAudio.playClick();
                    }}
                    className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      chartMetric === 'sessions'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Focus Blocks ({weeklyTotalSessions})
                  </button>
                </div>

                <div className="inline-flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    data-testid="weekly-chart-prev-week-btn"
                    aria-label="Previous 7 days"
                    onClick={() => {
                      setWeekOffset((w) => w - 1);
                      marioAudio.playClick();
                    }}
                    className="min-h-[36px] min-w-[36px] px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 inline-flex items-center justify-center cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span
                    data-testid="weekly-chart-range-label"
                    className="px-2 text-[11px] font-bold text-slate-200 tabular-nums whitespace-nowrap"
                  >
                    {weeklyRangeLabel}
                  </span>
                  <button
                    type="button"
                    data-testid="weekly-chart-next-week-btn"
                    aria-label="Next 7 days"
                    disabled={weekOffset >= 0}
                    onClick={() => {
                      setWeekOffset((w) => Math.min(0, w + 1));
                      marioAudio.playClick();
                    }}
                    className="min-h-[36px] min-w-[36px] px-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed text-slate-200 inline-flex items-center justify-center cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {weekOffset < 0 && (
                    <button
                      type="button"
                      data-testid="weekly-chart-today-btn"
                      onClick={() => {
                        setWeekOffset(0);
                        marioAudio.playCoin();
                      }}
                      className="min-h-[36px] px-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] cursor-pointer whitespace-nowrap"
                    >
                      Today
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 tabular-nums">
              <span>
                {weekOffset === 0
                  ? 'Rolling 7-day window ending Today — study modules, flashcards, quizzes, or Pomodoro blocks to grow today’s bar.'
                  : `Viewing historical 7-day window (${Math.abs(weekOffset)} week${Math.abs(weekOffset) === 1 ? '' : 's'} ago).`}
              </span>
              <span className="font-semibold text-amber-300">
                Today ({weeklyChartData.find((d) => d.isToday)?.shortDate ?? formatDateKey(referenceNow).slice(5).replace('-', '/')}):{' '}
                {goalStatus.minutesToday}m logged
              </span>
            </div>

            {/* Recharts Responsive Bar Chart with Explicit Day + Calendar Date (MM/DD) X-Axis */}
            <div className="w-full h-60 sm:h-68 pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyChartData}
                  margin={{ top: 12, right: 12, left: -16, bottom: 18 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis
                    dataKey="dateKey"
                    interval={0}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={false}
                    height={44}
                    tick={(props: { x?: string | number; y?: string | number; payload?: { value?: string | number } }) => {
                      const x = Number(props.x || 0);
                      const y = Number(props.y || 0);
                      const key = String(props.payload?.value || '');
                      const item = weeklyChartData.find((d) => d.dateKey === key);
                      if (!item) return <g />;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text
                            x={0}
                            y={13}
                            textAnchor="middle"
                            fill={item.isToday ? '#fbbf24' : '#e2e8f0'}
                            fontSize={11}
                            fontWeight={item.isToday ? 800 : 700}
                          >
                            {item.isToday ? `${item.dayLabel}•` : item.dayLabel}
                          </text>
                          <text
                            x={0}
                            y={28}
                            textAnchor="middle"
                            fill={item.isToday ? '#fde68a' : '#94a3b8'}
                            fontSize={10}
                            fontWeight={item.isToday ? 700 : 500}
                          >
                            {item.shortDate}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={false}
                    domain={[0, chartMetric === 'minutes' ? 'dataMax + 5' : 'dataMax + 1']}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as WeeklyPomodoroDayData;
                        return (
                          <div className="bg-slate-950 border-2 border-amber-400 p-2.5 rounded-xl shadow-xl text-white text-xs font-bold space-y-1">
                            <p className="font-mario text-amber-300 text-[10px]">
                              {data.dateDisplay} · {data.dayLabel}
                              {data.isToday ? ' (TODAY)' : ''}
                            </p>
                            <p className="text-emerald-400 font-extrabold text-sm">
                              {data.minutes} Minute{data.minutes !== 1 ? 's' : ''} Studied
                            </p>
                            <p className="text-slate-200 font-semibold">
                              {data.sessions} Focus Block{data.sessions !== 1 ? 's' : ''} (25m)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey={chartMetric}
                    name={chartMetric === 'minutes' ? 'Study Minutes' : 'Focus Sessions'}
                    radius={[8, 8, 2, 2]}
                    maxBarSize={48}
                    minPointSize={4}
                  >
                    {weeklyChartData.map((entry) => {
                      const val = chartMetric === 'minutes' ? entry.minutes : entry.sessions;
                      return (
                        <Cell
                          key={`cell-${entry.dateKey}`}
                          fill={
                            entry.isToday
                              ? '#fbbf24'
                              : val > 0
                              ? '#34d399'
                              : '#334155'
                          }
                          stroke={entry.isToday ? '#000000' : 'none'}
                          strokeWidth={entry.isToday ? 2 : 0}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 2B: Visual Calendar View — Daily Study Streaks & Completed Goal Days Grid */}
          <div
            data-testid="monthly-study-calendar-section"
            className="bg-slate-900 rounded-2xl p-4 sm:p-5 border-2 border-slate-700 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 border-2 border-black flex items-center justify-center text-slate-950 shadow-[0_2px_0_#000] shrink-0">
                  <Calendar className="w-5 h-5 text-slate-950" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-emerald-400 font-mario block">
                    STREAKS &amp; COMPLETED DAILY GOALS
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white font-display truncate">
                    VISUAL STUDY CALENDAR
                  </h3>
                </div>
              </div>

              {/* Month Navigation Controls */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {!isCurrentCalendarMonth && (
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      setCalendarViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
                      setSelectedCalendarDayKey(formatDateKey(now));
                      marioAudio.playCoin();
                    }}
                    className="min-h-[40px] px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black cursor-pointer whitespace-nowrap"
                  >
                    Today
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Previous Month"
                  onClick={() => {
                    const prev = new Date(calYear, calMonth - 1, 1);
                    setCalendarViewDate(prev);
                    setSelectedCalendarDayKey(formatDateKey(prev));
                    marioAudio.playJump();
                  }}
                  className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white inline-flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span
                  data-testid="calendar-month-label"
                  className="text-xs font-black uppercase text-amber-300 font-mario px-2 min-w-[132px] text-center whitespace-nowrap"
                >
                  {monthName}
                </span>
                <button
                  type="button"
                  aria-label="Next Month"
                  onClick={() => {
                    const next = new Date(calYear, calMonth + 1, 1);
                    setCalendarViewDate(next);
                    setSelectedCalendarDayKey(formatDateKey(next));
                    marioAudio.playJump();
                  }}
                  className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white inline-flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3-Card Streak & Goal Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Current Streak
                  </span>
                  <span
                    data-testid="calendar-streak-count"
                    className="text-base sm:text-lg font-black text-amber-300 font-mono tabular-nums"
                  >
                    {loginStreak} {loginStreak === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <Flame className="w-5 h-5 text-orange-400 shrink-0" />
              </div>

              <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Goal Days Met (&ge;{dailyGoalTarget}m)
                  </span>
                  <span
                    data-testid="calendar-completed-goals-count"
                    className="text-base sm:text-lg font-black text-emerald-400 font-mono tabular-nums"
                  >
                    {monthlyCalendar.completedGoalDaysCount} / {monthlyCalendar.daysInMonth}
                  </span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>

              <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Active Study Days
                  </span>
                  <span
                    data-testid="calendar-active-days-count"
                    className="text-base sm:text-lg font-black text-sky-300 font-mono tabular-nums"
                  >
                    {monthlyCalendar.activeDaysCount} / {monthlyCalendar.daysInMonth}
                  </span>
                </div>
                <Calendar className="w-5 h-5 text-sky-400 shrink-0" />
              </div>
            </div>

            {/* 7-Column Interactive Calendar Grid */}
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[10px] sm:text-xs font-black text-slate-400 uppercase font-mono">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div
                data-testid="visual-calendar-grid"
                className="grid grid-cols-7 gap-1 sm:gap-1.5"
              >
                {Array.from({ length: monthlyCalendar.firstDayOffset }).map((_, i) => (
                  <div
                    key={`offset-${i}`}
                    aria-hidden="true"
                    className="min-h-[44px] sm:min-h-[54px] rounded-xl bg-slate-950/25 border border-slate-800/30"
                  />
                ))}

                {monthlyCalendar.cells.map((cell) => {
                  const isSelected = selectedCalendarCell?.dateKey === cell.dateKey;
                  let cellTone = 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-600';
                  if (cell.isFuture) {
                    cellTone = 'bg-slate-950/30 border-slate-900 text-slate-600';
                  } else if (cell.isGoalCompleted) {
                    cellTone =
                      'bg-emerald-500 border-emerald-300 text-slate-950 font-black shadow-[0_2px_0_rgba(0,0,0,0.6)]';
                  } else if (cell.isStreakDay) {
                    cellTone =
                      'bg-amber-500/20 border-amber-400 text-amber-100 font-extrabold hover:bg-amber-500/30';
                  } else if (cell.hasActivity) {
                    cellTone =
                      'bg-sky-900/50 border-sky-400/70 text-sky-100 font-bold hover:bg-sky-900/70';
                  }

                  const statusLabel = cell.isFuture
                    ? 'Upcoming date'
                    : cell.isGoalCompleted && cell.isStreakDay
                    ? `Daily goal completed (${cell.minutesStudied}m) and active streak day`
                    : cell.isGoalCompleted
                    ? `Daily goal completed (${cell.minutesStudied}m)`
                    : cell.isStreakDay
                    ? `Active streak day (${cell.minutesStudied}m studied)`
                    : cell.hasActivity
                    ? `${cell.minutesStudied}m studied`
                    : 'No study logged';

                  return (
                    <button
                      key={cell.dateKey}
                      type="button"
                      data-testid={`calendar-day-${cell.dateKey}`}
                      data-streak={cell.isStreakDay ? 'true' : 'false'}
                      data-goal-completed={cell.isGoalCompleted ? 'true' : 'false'}
                      aria-label={`${cell.dateKey}: ${statusLabel}`}
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedCalendarDayKey(cell.dateKey);
                        marioAudio.playClick();
                      }}
                      className={`relative min-h-[44px] sm:min-h-[54px] rounded-xl border p-1 sm:p-1.5 flex flex-col items-center justify-between transition-colors cursor-pointer select-none ${cellTone} ${
                        cell.isToday ? 'ring-2 ring-amber-400' : ''
                      } ${isSelected ? 'outline-2 outline-white -outline-offset-2' : ''}`}
                    >
                      <span className="text-[11px] sm:text-xs font-mono tabular-nums leading-none">
                        {cell.dayNum}
                      </span>

                      <div className="flex items-center justify-center gap-0.5 min-h-[14px]">
                        {cell.isStreakDay && (
                          <Flame
                            className={`w-3 h-3 shrink-0 ${
                              cell.isGoalCompleted ? 'text-slate-950 fill-amber-300' : 'text-orange-400 fill-orange-400/40'
                            }`}
                          />
                        )}
                        {cell.isGoalCompleted && (
                          <CheckCircle2 className="w-3 h-3 shrink-0 text-slate-950" />
                        )}
                        {!cell.isGoalCompleted && cell.minutesStudied > 0 && (
                          <span className="text-[9px] font-mono tabular-nums leading-none">
                            {cell.minutesStudied}m
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Calendar Date Detail Inspector */}
            {selectedCalendarCell && (
              <div
                data-testid="calendar-selected-day-detail"
                className="bg-slate-950/90 rounded-xl p-3 sm:p-3.5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-white tabular-nums">
                      {selectedCalendarCell.dateKey}
                    </span>
                    {selectedCalendarCell.isToday && (
                      <span className="text-amber-300 font-bold">· Today</span>
                    )}
                    <span aria-hidden="true" className="text-slate-600">
                      ·
                    </span>
                    <span
                      className={`font-bold ${
                        selectedCalendarCell.isStreakDay ? 'text-orange-300' : 'text-slate-400'
                      }`}
                    >
                      {selectedCalendarCell.isStreakDay ? 'Active Streak Day' : 'Outside Current Streak'}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">
                      ·
                    </span>
                    <span
                      className={`font-bold ${
                        selectedCalendarCell.isGoalCompleted ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {selectedCalendarCell.isFuture
                        ? 'Upcoming Day'
                        : selectedCalendarCell.isGoalCompleted
                        ? 'Daily Goal Completed'
                        : `Goal Progress: ${selectedCalendarCell.minutesStudied} / ${dailyGoalTarget}m`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {selectedCalendarCell.isFuture
                      ? 'Future calendar date — keep your study streak alive each day!'
                      : `${selectedCalendarCell.minutesStudied} min active study · ${selectedCalendarCell.sessions} Pomodoro ${
                          selectedCalendarCell.sessions === 1 ? 'session' : 'sessions'
                        } (${selectedCalendarCell.goalProgressPercent}% of ${dailyGoalTarget}m daily target)`}
                  </p>
                </div>

                {!selectedCalendarCell.isFuture && (
                  <div className="w-full sm:w-36 shrink-0 space-y-1">
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                      <div
                        className={`h-full transition-all ${
                          selectedCalendarCell.isGoalCompleted ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${selectedCalendarCell.goalProgressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Calendar Visual Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
              <span className="text-slate-400 font-medium">Tap any date cell to inspect streak &amp; goal details:</span>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-300 inline-flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-slate-950" />
                  </span>
                  <span>Goal Met (&ge;{dailyGoalTarget}m)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/40" />
                  <span>Streak Day</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-sky-900/70 border border-sky-400/70" />
                  <span>Partial Study</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-800" />
                  <span>No Activity</span>
                </span>
              </div>
            </div>
          </div>


          {/* Section 2C: Thematic World Mastery Badges (Worlds 1–6) */}
          <div
            data-testid="world-mastery-badges-section"
            className="bg-slate-900 rounded-2xl p-4 sm:p-5 border-2 border-slate-700 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 shadow-[0_2px_0_#000] shrink-0">
                  <Crown className="w-5 h-5 text-slate-950" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                    WORLD COMPLETION HONORS
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white font-display">
                    THEMATIC WORLD MASTERY BADGES ({unlockedWorldBadgesCount} / {worldMasteryBadges.length})
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-300 font-semibold">
                Complete every module within a World to earn its official Labor Law title &amp; bonus Gold Coins.
              </p>
            </div>

            {/* 6-World Mastery Bar Chart (0%–100% Completion Per World) */}
            <div
              data-testid="profile-world-mastery-bar-chart"
              className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black uppercase text-amber-300 font-mario">
                  WORLD MASTERY BAR CHART (WORLDS 1–6)
                </span>
                <span className="text-xs font-bold text-slate-400 tabular-nums">
                  Overall Completion: {overallProgressPercent}% ({completedTopicsCount}/{totalTopicsCount})
                </span>
              </div>
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox="0 0 560 168"
                  role="img"
                  aria-label="Bar chart showing completion percentage for each of the 6 Labor Law worlds"
                  className="w-full h-40 min-w-[300px]"
                >
                  {[0, 50, 100].map((pct) => {
                    const gy = 132 - (pct / 100) * 96;
                    return (
                      <g key={pct}>
                        <line
                          x1={38}
                          y1={gy}
                          x2={546}
                          y2={gy}
                          stroke="#334155"
                          strokeDasharray={pct === 0 ? undefined : '4 4'}
                          strokeWidth="1"
                        />
                        <text
                          x={32}
                          y={gy + 4}
                          textAnchor="end"
                          fill="#94a3b8"
                          fontSize="10"
                          fontWeight="700"
                        >
                          {pct}%
                        </text>
                      </g>
                    );
                  })}

                  {worldMasteryBadges.map((wBadge, idx) => {
                    const pct = Math.max(0, Math.min(100, wBadge.progressPercent));
                    const slotW = 82;
                    const barW = 46;
                    const x = 52 + idx * slotW;
                    const barH = Math.max(pct > 0 ? 4 : 0, Math.round((pct / 100) * 96));
                    const y = 132 - barH;
                    const fill =
                      pct >= 100 ? '#fbbf24' : pct >= 50 ? '#34d399' : '#38bdf8';

                    return (
                      <g key={wBadge.worldId}>
                        <rect
                          x={x}
                          y={36}
                          width={barW}
                          height={96}
                          rx={6}
                          fill="#0f172a"
                          stroke="#1e293b"
                          strokeWidth="1"
                        />
                        {barH > 0 && (
                          <rect
                            x={x}
                            y={y}
                            width={barW}
                            height={barH}
                            rx={6}
                            fill={fill}
                          />
                        )}
                        <text
                          x={x + barW / 2}
                          y={Math.max(28, y - 5)}
                          textAnchor="middle"
                          fill="#f8fafc"
                          fontSize="11"
                          fontWeight="800"
                        >
                          {pct}%
                        </text>
                        <text
                          x={x + barW / 2}
                          y={149}
                          textAnchor="middle"
                          fill="#e2e8f0"
                          fontSize="11"
                          fontWeight="800"
                        >
                          W{wBadge.worldNumber}
                        </text>
                        <text
                          x={x + barW / 2}
                          y={162}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="9.5"
                          fontWeight="600"
                        >
                          {wBadge.completedCount}/{wBadge.totalCount}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {worldMasteryBadges.map((wBadge) => (
                <div
                  key={wBadge.worldId}
                  data-testid={`world-mastery-badge-${wBadge.worldId}`}
                  className={`rounded-2xl p-3.5 border-2 flex flex-col justify-between gap-3 transition-all ${
                    wBadge.unlocked
                      ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/70 border-amber-400 shadow-[0_3px_0_#000]'
                      : 'bg-slate-950/70 border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0 ${
                            wBadge.unlocked
                              ? 'bg-slate-900 border-amber-400 shadow-[0_2px_0_#000]'
                              : 'bg-slate-900/60 border-slate-700 opacity-75'
                          }`}
                        >
                          {renderBadgeIcon(wBadge.iconKey)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-amber-300 block">
                            {wBadge.worldLabel}
                          </span>
                          <h4 className="font-black text-sm text-white font-display leading-snug">
                            {wBadge.badgeTitle}
                          </h4>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-black text-amber-300 tabular-nums shrink-0">
                        <MarioCoinIcon className="w-3.5 h-3.5" />
                        <span>+{wBadge.coinReward}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {wBadge.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold tabular-nums">
                      <span className="text-slate-300">
                        {wBadge.completedCount} / {wBadge.totalCount} Modules
                      </span>
                      {wBadge.unlocked ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-black">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Earned</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">{wBadge.progressPercent}%</span>
                      )}
                    </div>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          wBadge.unlocked ? 'bg-amber-400' : 'bg-sky-400'
                        }`}
                        style={{ width: `${wBadge.progressPercent}%` }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onNavigateAction('modules', wBadge.worldId);
                        onClose();
                        marioAudio.playPipe();
                      }}
                      className={`w-full min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-black border-2 inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                        wBadge.unlocked
                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/60 text-emerald-200'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                      }`}
                    >
                      <span>
                        {wBadge.unlocked
                          ? `Review World ${wBadge.worldNumber}`
                          : `Study World ${wBadge.worldNumber}`}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Achievements & Milestone Badges */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white font-display">
                  ACHIEVEMENTS &amp; MILESTONE BADGES ({unlockedCount} / {achievements.length})
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-semibold">
                  Earn unique badges and Gold Coin rewards for study hours, quiz marathons, and statutory mastery.
                </p>
              </div>

              {/* Segmented Filter Controls */}
              <div className="inline-flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-700 self-start sm:self-auto">
                {(
                  [
                    { id: 'all' as const, label: `All (${achievements.length})` },
                    { id: 'unlocked' as const, label: `Unlocked (${unlockedCount})` },
                    {
                      id: 'locked' as const,
                      label: `In Progress (${achievements.length - unlockedCount})`,
                    },
                  ]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setFilterTab(tab.id);
                      marioAudio.playJump();
                    }}
                    className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer whitespace-nowrap ${
                      filterTab === tab.id
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {visibleAchievements.length === 0 ? (
              <div className="bg-slate-900 rounded-2xl p-8 text-center border border-slate-700 space-y-2">
                <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="font-bold text-slate-200 text-sm">
                  {filterTab === 'unlocked'
                    ? 'No badges unlocked yet — complete a Quick Test or App Guide to unlock your first badge!'
                    : 'Incredible! You have unlocked every single milestone badge!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {visibleAchievements.map((badge) => (
                  <div
                    key={badge.id}
                    data-testid={`achievement-card-${badge.id}`}
                    className={`rounded-2xl p-4 border-2 transition-all flex flex-col justify-between gap-3 ${
                      badge.unlocked
                        ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border-amber-400 shadow-[0_3px_0_#000]'
                        : 'bg-slate-900/80 border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center shrink-0 ${
                          badge.unlocked
                            ? 'bg-slate-950 border-amber-400 shadow-[0_2px_0_#000]'
                            : 'bg-slate-950/60 border-slate-700 opacity-75'
                        }`}
                      >
                        {renderBadgeIcon(badge.iconKey)}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-black text-sm sm:text-base text-white font-display truncate">
                            {badge.title}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-xs font-black text-amber-300 tabular-nums shrink-0">
                            <MarioCoinIcon className="w-3.5 h-3.5" />
                            <span>+{badge.coinReward}</span>
                          </span>
                        </div>

                        <p className="text-xs font-extrabold text-amber-300">
                          Milestone: {badge.milestoneLabel}
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {badge.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress & Status Footer */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs font-bold tabular-nums">
                        <span className="text-slate-300">{badge.progressText}</span>
                        {badge.unlocked ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-black">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>UNLOCKED{badge.unlockedAt ? ` · ${badge.unlockedAt}` : ''}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <Lock className="w-3 h-3" />
                            <span>{badge.progressPercent}%</span>
                          </span>
                        )}
                      </div>

                      <div className="w-full h-2.5 bg-slate-950 rounded-full border border-slate-700 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            badge.unlocked ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${badge.progressPercent}%` }}
                        />
                      </div>

                      {!badge.unlocked && (
                        <div className="flex justify-end pt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              if (badge.id === 'tour_graduate') {
                                onOpenWalkthrough();
                              } else {
                                onNavigateAction(badge.actionTab, badge.actionWorld);
                              }
                            }}
                            className="min-h-[40px] inline-flex items-center gap-1 text-xs font-black text-amber-300 hover:text-amber-200 cursor-pointer"
                          >
                            <span>{badge.actionLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
