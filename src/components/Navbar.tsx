import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Search,
  BookOpen,
  Calculator,
  Grid,
  HelpCircle,
  Trophy,
  Map,
  Gamepad2,
  Eye,
  EyeOff,
  Sliders,
  ShoppingBag,
  Calendar,
  Menu,
  ChevronDown,
  Printer,
  GraduationCap,
  Feather,
  Music,
  Pause,
  Play,
  Sun,
  Moon,
  Award,
  Compass,
  Zap,
  X,
  Scale,
   MoreHorizontal,
  FileDown,
  Headphones,
  Flame,
  Shield,
  Unlock,
  Target,
  Activity,
  GitBranch,
  History,
} from 'lucide-react';
import { MarioCoinIcon, MarioCharacterAvatar, MarioStarIcon } from './MarioIcons';
import { marioAudio, AudioSettings, SOUND_PACK_DEFINITIONS } from '../utils/audio';
import type { StudyAmbiencePreset } from '../utils/round8Features';
import { AudioSettingsModal } from './AudioSettingsModal';
import {
  ComplexityMode,
  MarioAvatar,
  MarioTheme,
  StudyDifficulty,
  AppStudyFontId,
} from '../types/laborLaw';
import {
  UserProgressionState,
  getProgressionForXp,
} from '../utils/levelProgressionService';
import { StudyTimer } from './StudyTimer';
import { LoginStreakCounter } from './LoginStreakCounter';
import { PWAInstallButton } from './PWAInstallButton';
import { MARIO_SOUNDSCAPES, MarioSoundscapeId } from '../utils/engagementFeatures';
import { ColorMode, DailyPomodoroRecord } from '../utils/profileAchievements';
import {
  APP_STUDY_FONTS,
} from '../utils/round8Features';
import {
  MENU_PIXEL_FONTS,
  getMobileDrawerButtonTypography,
  type MenuPixelFontId,
} from '../utils/menuPixelFonts';
import { computeGoalStreakAndWeeklyConsistency } from '../utils/round9Features';
import { loadRound10VaultState } from '../utils/round10Features';
import {
  MARIO_NAVBAR_AMBIENCE_OPTIONS,
  resolveEquippedNameplate,
  resolveCompanionInteraction,
  resolveUniversalCardFrame,
  type CardFrameId,
} from '../utils/round12Features';
import {
  DAILY_GOAL_INCREMENTS,
  cycleNextDailyGoalMinutes,
  normalizeDailyGoalMinutes,
  saveDailyGoalMinutes,
  computeDailyStudyGoalProgress,
} from '../utils/round13Features';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  zenMode: boolean;
  setZenMode: (zen: boolean) => void;
  complexityMode: ComplexityMode;
  setComplexityMode: (mode: ComplexityMode) => void;
  studyDifficulty: StudyDifficulty;
  setStudyDifficulty: (difficulty: StudyDifficulty) => void;
  loginStreak: number;
  isBonusClaimedToday: boolean;
  equippedAvatar?: MarioAvatar;
  equippedCardFrame?: CardFrameId;
  colorMode: ColorMode;
  onToggleColorMode: () => void;
  unlockedAchievementsCount?: number;
  totalAchievementsCount?: number;
  onOpenProfile: () => void;
  onOpenWalkthrough: () => void;
  onStudySecondsTick?: (seconds: number) => void;
  onFocusSessionComplete?: () => void;
  onEarnCoins?: (amount: number) => void;
  onOpenShop: () => void;
  onOpenDailyReward: () => void;
  onOpenExportProgress?: () => void;
  onOpenGlobalSearch?: () => void;
  onOpenGlobalStudyHub?: () => void;
  onOpenPrintGuide?: () => void;
  onOpenOnePageSummary?: () => void;
  showLegalCitations?: boolean;
  setShowLegalCitations?: (show: boolean) => void;
  onOpenLeaderboard?: () => void;
  onStartQuickStudy?: () => void;
  superStarRemainingLabel?: string | null;
  shortcutMapActive?: boolean;
  onOpenLegalCitationsModal?: () => void;
  onOpenQuickGlossary?: () => void;
  onOpenStatuteLookup?: () => void;
  onOpenDoleCalculator?: () => void;
  onOpenResearchCohort?: () => void;
  zenReadingMode?: boolean;
  onToggleZenReadingMode?: () => void;
  activeTheme?: MarioTheme;
  onSelectTheme?: (theme: MarioTheme) => void;
  appStudyFont?: AppStudyFontId;
  onSelectAppStudyFont?: (font: AppStudyFontId) => void;
  menuPixelFont?: MenuPixelFontId;
  onSelectMenuPixelFont?: (font: MenuPixelFontId) => void;
  dailyPomodoroLogs?: Record<string, DailyPomodoroRecord>;
  dailyGoalMinutes?: number;
  onChangeDailyGoalMinutes?: (minutes: number) => void;
  todayStudiedSeconds?: number;
  invincibleRemainingLabel?: string | null;
  doubleXpRemainingLabel?: string | null;
  unlockAllRemainingLabel?: string | null;
  userProgression?: UserProgressionState;
  onOpenLevelProgression?: () => void;
  onOpenDailyMissions?: () => void;
  onOpenGoalHistory?: () => void;
  onOpenKnowledgeGraph?: () => void;
  onOpenToadTrainingLog?: () => void;
}

const QUICK_FREE_SKINS: Array<{ id: MarioTheme; label: string }> = [
  { id: 'overworld', label: 'Overworld Sky' },
  { id: 'peach_castle', label: 'Peach Blossom' },
  { id: 'yoshi_island', label: 'Yoshi Island' },
  { id: 'rosalina_comet', label: 'Rosalina Comet' },
  { id: 'royal_parchment', label: 'Royal Parchment' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  fontSize,
  setFontSize,
  coins,
  zenMode,
  setZenMode,
  complexityMode,
  setComplexityMode,
  studyDifficulty,
  setStudyDifficulty,
  loginStreak,
  isBonusClaimedToday,
  equippedAvatar = 'mario',
  equippedCardFrame = 'frame_default',
  colorMode,
  onToggleColorMode,
  unlockedAchievementsCount = 0,
  totalAchievementsCount = 12,
  onOpenProfile,
  onOpenWalkthrough,
  onStudySecondsTick,
  onFocusSessionComplete,
  onEarnCoins,
  onOpenShop,
  onOpenDailyReward,
  onOpenExportProgress,
  onOpenGlobalSearch,
  onOpenGlobalStudyHub,
  onOpenPrintGuide,
  onOpenOnePageSummary,
  showLegalCitations = true,
  setShowLegalCitations,
  onOpenLeaderboard,
  onStartQuickStudy,
  superStarRemainingLabel = null,
  shortcutMapActive = false,
  onOpenLegalCitationsModal,
  onOpenQuickGlossary,
  onOpenStatuteLookup,
  onOpenDoleCalculator,
  onOpenResearchCohort,
  zenReadingMode = false,
  onToggleZenReadingMode,
  activeTheme = 'overworld',
  onSelectTheme,
  appStudyFont = 'jakarta',
  onSelectAppStudyFont,
  menuPixelFont = 'adaptive',
  onSelectMenuPixelFont,
  dailyPomodoroLogs = {},
  dailyGoalMinutes = 30,
  onChangeDailyGoalMinutes,
  todayStudiedSeconds = 0,
  invincibleRemainingLabel = null,
  doubleXpRemainingLabel = null,
  unlockAllRemainingLabel = null,
  userProgression,
  onOpenLevelProgression,
  onOpenDailyMissions,
  onOpenGoalHistory,
  onOpenKnowledgeGraph,
  onOpenToadTrainingLog,
}) => {
  const progressionStats = getProgressionForXp(userProgression?.totalXp || 0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showQuickAudioSliders, setShowQuickAudioSliders] = useState(false);
  const [showMoreToolsMenu, setShowMoreToolsMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [audioState, setAudioState] = useState<AudioSettings>({ ...marioAudio.settings });
  const [luxuryAvatarFrame, setLuxuryAvatarFrame] = useState<string>('');
  const [luxuryAura, setLuxuryAura] = useState<string>('');
  const [equippedCompanionId, setEquippedCompanionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('mario_equipped_companion') || 'comp_yoshi';
    }
    return 'comp_yoshi';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        setEquippedCompanionId(
          window.localStorage.getItem('mario_equipped_companion') || 'comp_yoshi'
        );
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mario-shop-equip-changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mario-shop-equip-changed', handleStorageChange);
    };
  }, []);

  const companionMeta = resolveCompanionInteraction(equippedCompanionId);
  const resolvedEquippedFrame = resolveUniversalCardFrame(equippedCardFrame);

  const effectiveDailyGoal = normalizeDailyGoalMinutes(dailyGoalMinutes);
  const dailyGoalProgress = computeDailyStudyGoalProgress(
    todayStudiedSeconds,
    effectiveDailyGoal
  );

  const handleSelectDailyGoal = (minutes: number) => {
    const saved = saveDailyGoalMinutes(
      minutes,
      typeof window !== 'undefined' ? window.localStorage : null
    );
    onChangeDailyGoalMinutes?.(saved);
    marioAudio.playCoin();
  };

  const handleCycleDailyGoal = () => {
    const nextGoal = cycleNextDailyGoalMinutes(effectiveDailyGoal);
    handleSelectDailyGoal(nextGoal);
  };

  const mixerRef = useRef<HTMLDivElement | null>(null);
  const moreToolsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return marioAudio.subscribe((next) => setAudioState(next));
  }, []);

  useEffect(() => {
    const syncLuxury = () => {
      try {
        const raw = localStorage.getItem('mario_luxury_equipped_v1');
        if (!raw) return;
        const parsed = JSON.parse(raw) as Record<string, string>;
        setLuxuryAvatarFrame(parsed.avatarFrame || parsed.avatar_frames || '');
        setLuxuryAura(parsed.mushroomAura || parsed.mushroom_auras || '');
      } catch {
        // ignore
      }
    };
    syncLuxury();
    window.addEventListener('storage', syncLuxury);
    window.addEventListener('mario-luxury-updated', syncLuxury);
    window.addEventListener('mario-shop-equip-changed', syncLuxury);
    return () => {
      window.removeEventListener('storage', syncLuxury);
      window.removeEventListener('mario-luxury-updated', syncLuxury);
      window.removeEventListener('mario-shop-equip-changed', syncLuxury);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (showQuickAudioSliders && mixerRef.current && !mixerRef.current.contains(target)) {
        setShowQuickAudioSliders(false);
      }
      if (showMoreToolsMenu && moreToolsRef.current && !moreToolsRef.current.contains(target)) {
        setShowMoreToolsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showQuickAudioSliders, showMoreToolsMenu]);

  const handleCoinClick = () => {
    onOpenShop();
    marioAudio.playCoin();
  };

  const handleTabClick = (tab: string, e?: React.MouseEvent) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    marioAudio.playTabSwitch();
    if (e && e.currentTarget) {
      try {
        (e.currentTarget as HTMLElement).scrollIntoView({ inline: 'nearest', behavior: 'smooth' });
      } catch {
        // ignore
      }
    }
  };

  const handleToggleStudyDifficulty = () => {
    const next: StudyDifficulty = studyDifficulty === 'casual' ? 'exam_prep' : 'casual';
    setStudyDifficulty(next);
    if (next === 'exam_prep') {
      marioAudio.playFireball();
    } else {
      marioAudio.playPowerUp();
    }
  };

  const handleToggleBgm = () => {
    marioAudio.toggleBgm();
  };

  const handleToggleToadify = () => {
    marioAudio.toggleToadify(true);
  };

  const handleSelectSoundscape = (id: MarioSoundscapeId) => {
    marioAudio.setSoundscape(id, true);
  };

  const navCategories: Array<{
    label: string;
    items: Array<{
      id: string;
      label: string;
      shortLabel: string;
      icon: React.ReactNode;
      badge?: string;
    }>;
  }> = [
    {
      label: 'Study',
      items: [
        { id: 'map', label: 'World Map', shortLabel: 'Map', icon: <Map className="w-4 h-4 text-amber-300 shrink-0" /> },
        { id: 'modules', label: 'Modules', shortLabel: 'Modules', icon: <BookOpen className="w-4 h-4 text-red-300 shrink-0" /> },
        { id: 'citations', label: 'Citations', shortLabel: 'Citations', icon: <Scale className="w-4 h-4 text-emerald-300 shrink-0" />, badge: 'Verbatim' },
        { id: 'holidays', label: 'Holidays', shortLabel: 'Holidays', icon: <Calendar className="w-4 h-4 text-rose-300 shrink-0" />, badge: '12+' },
        { id: 'wages_matrix', label: '17 Regions', shortLabel: 'Wages', icon: <Grid className="w-4 h-4 text-blue-300 shrink-0" /> },
      ],
    },
    {
      label: 'Practice & Quizzes',
      items: [
        { id: 'flashcards', label: 'Flashcards', shortLabel: 'Cards', icon: <HelpCircle className="w-4 h-4 text-yellow-300 shrink-0" /> },
        { id: 'quiz', label: 'Quest & Boss', shortLabel: 'Quizzes', icon: <Trophy className="w-4 h-4 text-amber-300 shrink-0" /> },
      ],
    },
    {
      label: 'Games & Tools',
      items: [
        { id: 'vault', label: 'Arcade', shortLabel: 'Arcade', icon: <Gamepad2 className="w-4 h-4 text-emerald-400 shrink-0" />, badge: '47' },
        { id: 'calculator', label: 'Calculator', shortLabel: 'Pay Calc', icon: <Calculator className="w-4 h-4 text-cyan-300 shrink-0" /> },
        { id: 'shop', label: "Toad's Shop", shortLabel: 'Shop', icon: <ShoppingBag className="w-4 h-4 text-pink-300 shrink-0" /> },
      ],
    },
  ];

  const audioActive = audioState.enabled;
  const musicActive = audioState.musicEnabled && audioActive;
  const toadifyActive = Boolean(audioState.toadifyEnabled && audioState.enabled);
  const activeAmbience = (audioState.studyAmbience || 'off') as StudyAmbiencePreset;
  const ambiencePausedByBgm = marioAudio.isStudyAmbiencePausedByBgm();
  const activeSoundscapeMeta =
    MARIO_SOUNDSCAPES.find((s) => s.id === audioState.soundscape) || MARIO_SOUNDSCAPES[0];

  const goalConsistency = computeGoalStreakAndWeeklyConsistency({
    dailyPomodoroLogs,
    dailyGoalMinutes,
    todayStudiedSeconds,
  });

  return (
    <>
      <header
        data-testid="main-navbar"
        className="bg-gradient-to-b from-[#171226] via-[#13192b] to-[#0f172a] border-b-4 border-slate-950 shadow-[0_5px_0_rgba(0,0,0,0.65)] text-white select-none w-full max-w-full overflow-x-clip print:hidden relative z-40"
      >
        {/* Royal Gold Top Rim Accent */}
        <div
          aria-hidden="true"
          className="h-1 w-full bg-gradient-to-r from-red-600 via-amber-400 to-red-600"
        />

        {/* Top Status & Power-Up HUD Bar — Aesthetic Royal HUD, Dedicated Power-Up Space, Zero-Overlap, Zero-Scroll */}
        {!zenMode && (
          <div
            data-testid="navbar-top-status-row"
            className="bg-gradient-to-r from-[#0d1220] via-[#151d32] to-[#0d1220] border-b border-amber-400/20 px-1.5 sm:px-3.5 py-1.5 flex items-center justify-between gap-2 text-xs font-semibold w-full max-w-full min-w-0 overflow-hidden"
          >
            {/* Zone 1: Hero Logo, Profile Button, Level Progression & Desktop Goal Streak Consistency Capsule */}
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onOpenProfile();
                  marioAudio.playCoin();
                }}
                data-testid="navbar-profile-btn"
                aria-label={`Open Hero Profile (${unlockedAchievementsCount} of ${totalAchievementsCount} badges)`}
                title="Your Hero Profile & Milestone Achievements (Click to view badges & 30-day charts)"
                className="relative z-20 flex items-center gap-1 sm:gap-1.5 shrink-0 group hover:brightness-105 cursor-pointer bg-gradient-to-r from-red-950/90 via-slate-900 to-slate-900 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border-2 border-amber-400/80 shadow-[0_2px_0_#000] active:translate-y-0.5 transition-all"
              >
                <div
                  data-testid="navbar-avatar-profile-btn"
                  data-avatar-frame={equippedCardFrame || luxuryAvatarFrame || 'default'}
                  className={`w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-lg inline-flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                    equippedCardFrame && equippedCardFrame !== 'frame_default'
                      ? resolvedEquippedFrame.borderClasses
                      : luxuryAvatarFrame.includes('diamond') || luxuryAvatarFrame.includes('cosmic')
                      ? 'bg-cyan-300 border-2 border-cyan-100 ring-2 ring-cyan-400'
                      : luxuryAvatarFrame.includes('crimson') || luxuryAvatarFrame.includes('bowser')
                      ? 'bg-rose-500 border-2 border-amber-300 ring-2 ring-rose-400'
                      : luxuryAvatarFrame.includes('emerald') || luxuryAvatarFrame.includes('pipe')
                      ? 'bg-emerald-400 border-2 border-black ring-2 ring-emerald-300'
                      : luxuryAvatarFrame
                      ? 'bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-500 border-2 border-white ring-2 ring-amber-300'
                      : 'bg-amber-400 border-2 border-black'
                  } ${
                    luxuryAura
                      ? 'shadow-[0_0_12px_rgba(251,191,36,0.75)]'
                      : ''
                  }`}
                >
                  <MarioCharacterAvatar character={equippedAvatar} className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                {companionMeta.active && (
                  <div
                    data-testid="navbar-companion-avatar"
                    title={`Equipped Companion: ${companionMeta.name} (+${companionMeta.bonusCoinsPerTopic} coins/topic) · "${companionMeta.speech}"`}
                    className="hidden sm:inline-flex w-7 h-7 rounded-lg bg-pink-500/20 border-2 border-amber-300 items-center justify-center shrink-0 -ml-0.5 group-hover:scale-105 transition-transform shadow-[0_0_8px_rgba(244,114,182,0.4)]"
                  >
                    <MarioCharacterAvatar character={companionMeta.avatarKey as any} className="w-5 h-5" />
                  </div>
                )}
                <div className="flex flex-col text-left leading-none min-w-0">
                  <div className="hidden sm:flex items-center gap-1">
                    <span className="font-display sm:font-mario font-black text-[10px] tracking-tight uppercase text-amber-300 whitespace-nowrap">
                      MARIO LAW
                    </span>
                    <span className="hidden xl:inline-block px-1 py-0.2 rounded bg-amber-400 text-slate-950 text-[8px] font-black border border-black">
                      HERO
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-200 flex items-center gap-0.5 sm:gap-1 sm:mt-0.5">
                    <Award className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    <span className="font-mono text-amber-200 tabular-nums">
                      {unlockedAchievementsCount}/{totalAchievementsCount}
                    </span>
                    <span className="hidden lg:inline text-slate-300 font-semibold">Badges</span>
                  </span>
                </div>
              </button>

              {/* Player Level & Character Progression Pill */}
              <button
                type="button"
                onClick={() => {
                  onOpenLevelProgression?.();
                  marioAudio.playPowerUp();
                }}
                data-testid="navbar-level-progression-btn"
                aria-label={`Player Level ${progressionStats.level}: ${progressionStats.title} (${progressionStats.xpInCurrentLevel}/${progressionStats.xpRequiredForCurrentLevel} XP)`}
                title={`Level ${progressionStats.level}: ${progressionStats.title} · ${progressionStats.xpInCurrentLevel}/${progressionStats.xpRequiredForCurrentLevel} XP (${progressionStats.progressPercent}%) — Click to view Mario Character Avatar Unlocks & Progression Roadmap`}
                className="relative z-20 flex items-center gap-1 sm:gap-1.5 shrink-0 hover:brightness-110 cursor-pointer bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-950/60 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xl border border-amber-400/70 shadow-[0_1px_0_#000] active:translate-y-0.5 transition-all text-left"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-400 text-slate-950 font-black font-mario text-[9px] flex items-center justify-center shrink-0 border border-black shadow-[0_1px_0_#000]">
                  <span>{progressionStats.level}</span>
                </div>
                <div className="hidden min-[520px]:flex flex-col leading-none min-w-0 pr-0.5">
                  <div className="flex items-center gap-1">
                    <span className="font-mario text-[8px] text-amber-300 uppercase truncate">
                      LV.{progressionStats.level}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-300 tabular-nums">
                      {progressionStats.progressPercent}%
                    </span>
                  </div>
                  <div className="w-11 sm:w-14 h-1.5 bg-slate-950 rounded-full border border-slate-700 overflow-hidden mt-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
                      style={{ width: `${progressionStats.progressPercent}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Daily Goal Streak & 7-Day Consistency Pill (Click opens Goal History Calendar) */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenGoalHistory) {
                    onOpenGoalHistory();
                  } else {
                    onOpenProfile();
                  }
                  marioAudio.playCoin();
                }}
                data-testid="navbar-goal-streak-consistency"
                title={`Daily Study Goal Streak: ${goalConsistency.goalStreakDays}d (${goalConsistency.todayMinutes}/${goalConsistency.dailyGoalMinutes}m today) · 7-Day Consistency: ${goalConsistency.weeklyConsistencyPercent}% — Click to open Goal History Calendar`}
                className={`hidden min-[960px]:inline-flex h-7 px-2 items-center gap-1.5 rounded-xl border text-[10px] font-black leading-none whitespace-nowrap cursor-pointer transition-all shadow-[0_1px_0_#000] tabular-nums shrink-0 ${
                  goalConsistency.goalMetToday
                    ? 'bg-emerald-950/90 hover:bg-emerald-900/90 text-emerald-200 border-emerald-400/80'
                    : 'bg-slate-900/95 hover:bg-slate-800 text-amber-200 border-amber-400/45'
                }`}
              >
                <Flame
                  className={`w-3.5 h-3.5 shrink-0 ${
                    goalConsistency.goalMetToday ? 'text-emerald-400 fill-emerald-400' : 'text-amber-400'
                  }`}
                />
                <span>Goal {goalConsistency.goalStreakDays}d</span>
                <span className="text-slate-500">·</span>
                <span className="hidden xl:inline text-sky-300">
                  7d {goalConsistency.weeklyConsistencyPercent}%
                </span>
                <span className="xl:hidden text-sky-300">{goalConsistency.weeklyConsistencyPercent}%</span>
              </button>
            </div>

            {/* Zone 2: Reserved Power-Ups (2X, Invincible, 2X Event, Unlock-All & Map), Wallet, Streak, Pomodoro, Theme, Mute, Audio & Tools */}
            <div className="flex items-center justify-end gap-0.5 min-[400px]:gap-1 sm:gap-1.5 shrink-0 min-w-0">
              {/* Dedicated Power-Ups Slot (Uncropped on all viewports from 360px phones to 1440px desktop, zero horizontal scroll) */}
              <div
                data-testid="navbar-powerups-slot"
                className="inline-flex items-center gap-0.5 sm:gap-1 shrink-0 min-w-fit"
              >
                {superStarRemainingLabel || invincibleRemainingLabel || doubleXpRemainingLabel ? (
                  <button
                    type="button"
                    onClick={handleCoinClick}
                    data-testid="navbar-super-star-badge"
                    aria-label={`2x Coin Multiplier Active, ${
                      invincibleRemainingLabel || superStarRemainingLabel || doubleXpRemainingLabel
                    } remaining`}
                    title={`2x Coin Multiplier Active (${
                      invincibleRemainingLabel
                        ? `Invincible Study Mode: ${invincibleRemainingLabel}`
                        : superStarRemainingLabel
                        ? `Super Star: ${superStarRemainingLabel}`
                        : `Special Event 2x: ${doubleXpRemainingLabel}`
                    }) — Click to open Toad's Shop`}
                    className="h-7 px-1.5 sm:px-2 inline-flex items-center justify-center gap-0.5 sm:gap-1 bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 hover:brightness-105 text-slate-950 font-black rounded-lg border-2 border-black shadow-[0_1px_0_#000] cursor-pointer text-[10px] leading-none whitespace-nowrap tabular-nums shrink-0"
                  >
                    {invincibleRemainingLabel ? (
                      <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-700 shrink-0" />
                    ) : (
                      <MarioStarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    )}
                    <span className="font-mono sm:font-mario font-black text-[10px] sm:text-[9.5px]">
                      2X
                    </span>
                    <span className="hidden lg:inline font-mono font-bold text-[10px]">
                      · {invincibleRemainingLabel || superStarRemainingLabel || doubleXpRemainingLabel}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCoinClick}
                    data-testid="navbar-powerup-slot-launcher"
                    aria-label="Activate 2X Coin Power-Up in Toad's Shop"
                    title="2X Power-Up Slot Ready — Click to activate Super Star or Special Event 2x Coins in Toad's Shop!"
                    className="hidden sm:inline-flex h-7 px-1.5 lg:px-2 items-center justify-center gap-1 bg-slate-900/95 hover:bg-slate-800 text-amber-300 hover:text-amber-200 font-bold rounded-lg border border-amber-400/60 shadow-[0_1px_0_#000] cursor-pointer text-[10px] leading-none whitespace-nowrap shrink-0"
                  >
                    <MarioStarIcon className="w-3 h-3 shrink-0 opacity-90" />
                    <span className="font-mono font-black text-[10px]">2X</span>
                  </button>
                )}

                {unlockAllRemainingLabel && (
                  <button
                    type="button"
                    onClick={handleCoinClick}
                    data-testid="navbar-unlock-all-badge"
                    aria-label={`All Stages Unlocked Pass Active (${unlockAllRemainingLabel} left)`}
                    title={`All Locked Stages Unlocked (${unlockAllRemainingLabel} left)`}
                    className="hidden sm:inline-flex h-7 px-1.5 items-center justify-center gap-1 bg-cyan-300 hover:bg-cyan-200 text-slate-950 font-black rounded-lg border border-black shadow-[0_1px_0_#000] cursor-pointer text-[10px] leading-none whitespace-nowrap tabular-nums shrink-0"
                  >
                    <Unlock className="w-3 h-3 shrink-0" />
                    <span className="hidden xl:inline font-mono">{unlockAllRemainingLabel}</span>
                  </button>
                )}

                {shortcutMapActive && (
                  <button
                    type="button"
                    onClick={handleCoinClick}
                    data-testid="navbar-shortcut-map-badge"
                    aria-label="Toad's Bar Exam Shortcut Map Power-Up Active"
                    title="Toad's Bar Exam Shortcut Map Active — Click to manage in Toad's Shop"
                    className="inline-flex h-7 w-6 sm:w-auto sm:px-1.5 items-center justify-center gap-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-lg border border-black shadow-[0_1px_0_#000] cursor-pointer text-[10px] leading-none whitespace-nowrap shrink-0"
                  >
                    <Map className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="hidden xl:inline font-bold">Map</span>
                  </button>
                )}
              </div>

              {/* 3. Coin Counter / Toad's Shop Shortcut */}
              <button
                type="button"
                onClick={handleCoinClick}
                aria-label={`Coins: ${coins}. Open Toad's Shop`}
                title="Open Toad's Shop to spend coins!"
                data-testid="navbar-coin-counter"
                className="h-7 px-1 min-[400px]:px-1.5 sm:px-2 inline-flex items-center justify-center gap-0.5 sm:gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg border border-black shadow-[0_1px_0_#000] active:translate-y-0.5 cursor-pointer text-xs leading-none whitespace-nowrap tabular-nums shrink-0"
              >
                <MarioCoinIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="font-mono sm:font-mario font-black text-[10.5px] sm:text-xs tracking-tight">
                  x{coins.toString().padStart(2, '0')}
                </span>
              </button>

              {/* 4. Daily Login Streak Counter */}
              <LoginStreakCounter
                streak={loginStreak}
                isBonusClaimedToday={isBonusClaimedToday}
                onOpenStreakModal={onOpenDailyReward}
              />

              {/* 5. Pomodoro Study Timer */}
              <StudyTimer
                onEarnCoins={onEarnCoins}
                onStudySecondsTick={onStudySecondsTick}
                onFocusSessionComplete={onFocusSessionComplete}
              />

              {/* 6. Dark / Light Mode Toggle */}
              <button
                type="button"
                onClick={() => {
                  onToggleColorMode();
                  marioAudio.playJump();
                }}
                data-testid="navbar-theme-mode-toggle"
                aria-label={colorMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                title={
                  colorMode === 'dark'
                    ? 'Dark Mode Active — Click for Sunny Day Light Mode'
                    : 'Light Mode Active — Click for Late-Night Dark Mode'
                }
                className={`inline-flex h-7 w-6.5 sm:w-auto sm:px-2 items-center justify-center gap-1 rounded-lg border font-black text-[11px] leading-none whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-[0_1px_0_#000] ${
                  colorMode === 'dark'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-amber-200 border-indigo-400'
                    : 'bg-amber-300 hover:bg-amber-200 text-slate-950 border-amber-500'
                }`}
              >
                {colorMode === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 fill-current text-amber-300 shrink-0" />
                ) : (
                  <Sun className="w-3.5 h-3.5 fill-amber-500 text-amber-700 shrink-0" />
                )}
                <span className="hidden lg:inline font-bold text-[10px]">
                  {colorMode === 'dark' ? 'Dark' : 'Light'}
                </span>
              </button>

              {/* 6b. Global Audio Mute Indicator & [M] Shortcut Toggle */}
              <button
                type="button"
                data-testid="global-mute-toggle-btn"
                onClick={() => {
                  const nextEnabled = marioAudio.toggleMute();
                  if (nextEnabled) {
                    marioAudio.playCoin();
                  }
                }}
                aria-pressed={!audioActive}
                aria-label={
                  audioActive
                    ? 'Audio Unmuted — Press M or click to mute all audio'
                    : 'Audio Muted — Press M or click to unmute audio'
                }
                title={
                  audioActive
                    ? 'Global Audio Active (Shortcut: press M to mute)'
                    : 'GLOBAL AUDIO MUTED (Shortcut: press M to unmute)'
                }
                className={`inline-flex h-7 ${
                  audioActive ? 'w-6.5 md:w-auto md:px-2' : 'px-1 sm:px-2'
                } items-center justify-center gap-0.5 sm:gap-1 rounded-lg border font-black text-[10px] leading-none whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-[0_1px_0_#000] ${
                  audioActive
                    ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700'
                    : 'bg-rose-600 hover:bg-rose-500 text-white border-amber-300'
                }`}
              >
                {audioActive ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="hidden md:inline font-mono text-[9.5px]">[M]</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white shrink-0" />
                    <span
                      data-testid="global-muted-badge"
                      className="font-mono text-[8.5px] sm:text-[10px] tracking-tight"
                    >
                      <span className="sm:hidden">MUTE</span>
                      <span className="hidden sm:inline">MUTED</span>
                    </span>
                  </>
                )}
              </button>

              {/* Equipped Toad's Shop HUD Nameplate Badge (When Non-Default, wide 2xl+ desktop to protect top bar room) */}
              {(() => {
                const r10State =
                  typeof window !== 'undefined' ? loadRound10VaultState(window.localStorage) : null;
                const plateMeta = resolveEquippedNameplate(r10State?.equippedNameplate);
                if (!plateMeta) return null;
                return (
                  <button
                    type="button"
                    data-testid="navbar-equipped-nameplate"
                    onClick={onOpenProfile}
                    title={`Equipped HUD Nameplate: ${plateMeta.name}`}
                    className={`hidden 2xl:inline-flex h-6 px-2 items-center gap-1 rounded-lg border text-[9px] font-black leading-none shrink-0 cursor-pointer ${plateMeta.badgeClasses}`}
                  >
                    <Award className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[110px]">{plateMeta.name}</span>
                  </button>
                );
              })()}

              {/* 7. Dedicated Audio Mixer Popover (Inline on sm+ screens; also in mobile drawer) */}
              <div ref={mixerRef} className="relative hidden sm:block shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickAudioSliders(!showQuickAudioSliders);
                    setShowMoreToolsMenu(false);
                    marioAudio.playClick();
                  }}
                  data-testid="navbar-audio-sliders-btn"
                  aria-label="Open Dedicated Audio Volume Sliders"
                  title="Adjust BGM, SFX & Toadify audio settings"
                  className={`h-7 px-1.5 sm:px-2 inline-flex items-center justify-center gap-1 rounded-lg border text-xs font-bold leading-none whitespace-nowrap transition-all cursor-pointer ${
                    showQuickAudioSliders
                      ? 'bg-amber-400 text-slate-950 border-black shadow-[0_1px_0_#000]'
                      : audioActive
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                      : 'bg-red-950/60 hover:bg-red-900/60 text-red-300 border-red-700'
                  }`}
                >
                  {audioActive ? (
                    <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                  <Sliders className="w-3 h-3 text-slate-300 shrink-0" />
                </button>

                {showQuickAudioSliders && (
                  <div
                    data-testid="navbar-audio-sliders-popover"
                    className="fixed inset-x-3 top-14 sm:inset-x-auto sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-slate-950/95 border-3 border-amber-400 rounded-2xl p-4 shadow-[6px_6px_0_#000] z-50 text-white space-y-3.5 backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-black uppercase text-amber-400 font-mario">
                          AUDIO MIXER
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowQuickAudioSliders(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 cursor-pointer"
                        aria-label="Close Audio Mixer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Toadify Voice Clips Quick Row inside Mixer */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-white border border-black flex items-center justify-center shrink-0">
                          <MarioCharacterAvatar character="toad" className="w-5 h-5" />
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-white block leading-tight">
                            Toadify Voice SFX
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            Toad voice clips on UI clicks
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleToadify}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black font-mario border cursor-pointer shrink-0 ${
                          toadifyActive
                            ? 'bg-rose-500 text-white border-amber-300'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {toadifyActive ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {/* BGM Volume Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold flex items-center gap-1.5 text-slate-200">
                          <Music className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Background Music</span>
                        </span>
                        <span className="font-mono text-amber-300 font-bold tabular-nums">
                          {Math.round((audioState.musicVolume ?? 0.42) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        aria-label="Background Music Volume"
                        min="0"
                        max="1"
                        step="0.05"
                        value={audioState.musicVolume ?? 0.42}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          marioAudio.updateSettings({ musicVolume: val });
                        }}
                        className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                      />
                    </div>

                    {/* UI Sound Effects (SFX) Volume Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold flex items-center gap-1.5 text-slate-200">
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Sound Effects (SFX)</span>
                        </span>
                        <span className="font-mono text-amber-300 font-bold tabular-nums">
                          {Math.round((audioState.volume ?? 0.8) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        aria-label="Sound Effects Volume"
                        min="0"
                        max="1"
                        step="0.05"
                        value={audioState.volume ?? 0.8}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          marioAudio.updateSettings({ volume: val });
                        }}
                        onMouseUp={() => marioAudio.playClick()}
                        onTouchEnd={() => marioAudio.playClick()}
                        className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                      />
                    </div>

                    {/* Equipped Audio Pack Selector */}
                    <div className="pt-2 border-t border-slate-800 space-y-1.5" data-testid="navbar-audio-pack-control">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold flex items-center gap-1.5 text-slate-200">
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Active Audio Pack:</span>
                        </span>
                        <span className="font-mono text-amber-300 font-bold text-[10px] font-mario">
                          {SOUND_PACK_DEFINITIONS.find((p) => p.id === (audioState.soundPack || 'sound_default'))?.badge || 'Classic 8-Bit'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <select
                          aria-label="Active Sound Pack"
                          value={audioState.soundPack || 'sound_default'}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            marioAudio.setSoundPack(val, true);
                          }}
                          className="w-full bg-slate-900 [color-scheme:dark] border border-slate-700 hover:border-amber-400 rounded-lg text-xs font-bold px-2 py-1.5 text-white cursor-pointer focus:outline-hidden"
                        >
                          {SOUND_PACK_DEFINITIONS.map((pack) => {
                            const unlockedItemIds = (() => {
                              const defaults = ['theme_overworld', 'avatar_mario', 'avatar_luigi', 'avatar_peach', 'sound_default'];
                              try {
                                const saved = localStorage.getItem('mario_unlocked_items');
                                if (saved) return Array.from(new Set([...defaults, ...JSON.parse(saved)]));
                              } catch {}
                              return defaults;
                            })();
                            const isUnlocked = unlockedItemIds.includes(pack.id) || pack.defaultPrice === 0;
                            return (
                              <option key={pack.id} value={pack.id} disabled={!isUnlocked} className="bg-slate-900 text-white">
                                {pack.name} {!isUnlocked ? `(${pack.defaultPrice}c in Shop)` : ''}
                              </option>
                            );
                          })}
                        </select>
                        <button
                          type="button"
                          onClick={() =>
                            marioAudio.toggleSoundPackFullTrack(
                              audioState.soundPack || 'sound_default'
                            )
                          }
                          title={musicActive ? 'Pause persistent BGM loop' : 'Play full persistent BGM loop'}
                          aria-label={musicActive ? 'Pause active sound pack loop' : 'Play active sound pack loop'}
                          className={`h-8 px-2.5 rounded-lg border cursor-pointer flex items-center justify-center gap-1 shrink-0 font-bold text-[10px] ${
                            musicActive
                              ? 'bg-emerald-500 text-slate-950 border-black'
                              : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                          }`}
                        >
                          {musicActive ? (
                            <Pause className="w-3 h-3 fill-current" />
                          ) : (
                            <Play className="w-3 h-3 fill-current" />
                          )}
                          <span>{musicActive ? 'Looping' : 'Loop'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] font-semibold text-emerald-300 truncate flex items-center gap-1">
                        <Music className="w-3 h-3 shrink-0" />
                        <span>{marioAudio.getActiveTrackLabel()}</span>
                      </p>
                    </div>

                    {/* Study Ambience Soundscapes (Auto-Pauses When Mario BGM Plays) */}
                    <div
                      className="pt-2 border-t border-slate-800 space-y-1.5"
                      data-testid="navbar-study-ambience-control"
                    >
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span className="font-bold flex items-center gap-1.5 text-slate-200">
                          <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Study Ambience:</span>
                        </span>
                        <span className="text-[10px] font-bold text-cyan-300">
                          {ambiencePausedByBgm ? 'Paused by BGM' : activeAmbience.toUpperCase()}
                        </span>
                      </div>
                      <select
                        data-testid="navbar-study-ambience-selector"
                        aria-label="Study Ambience"
                        value={activeAmbience}
                        onChange={(e) => {
                          marioAudio.setStudyAmbience(e.target.value as any, true);
                        }}
                        className="w-full bg-slate-900 [color-scheme:dark] border border-cyan-500/50 rounded-lg px-2 py-1.5 text-[11px] font-bold text-cyan-200 focus:outline-hidden cursor-pointer"
                      >
                        {MARIO_NAVBAR_AMBIENCE_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id} className="bg-slate-900 text-white">
                            {opt.id === 'off' ? 'Ambience: Off' : opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-1">
                        {MARIO_NAVBAR_AMBIENCE_OPTIONS.map((opt) => {
                          const isSel = activeAmbience === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              data-testid={`navbar-ambience-${opt.id}`}
                              onClick={() => marioAudio.setStudyAmbience(opt.id as any, true)}
                              className={`min-h-[30px] px-1.5 rounded-lg text-[10px] font-black border cursor-pointer truncate transition-colors ${
                                isSel
                                  ? 'bg-cyan-400 text-slate-950 border-black'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        {ambiencePausedByBgm
                          ? 'Ambience is automatically paused while Mario BGM is playing.'
                          : 'Gentle background loop; pauses automatically when Mario BGM plays.'}
                      </p>
                    </div>

                    {/* Daily Study Goal Quick Toggle (15m to 120m in 15m increments) */}
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-300">Daily Goal:</span>
                        <button
                          type="button"
                          data-testid="quick-audio-daily-goal-toggle-btn"
                          onClick={handleCycleDailyGoal}
                          className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black border border-black cursor-pointer tabular-nums"
                        >
                          {effectiveDailyGoal}m (+15m) · {dailyGoalProgress.completionPercent}%
                        </button>
                      </div>
                    </div>

                    {/* Legal Citations Quick Toggle */}
                    {setShowLegalCitations && (
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">Legal Citations:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowLegalCitations(!showLegalCitations);
                            marioAudio.playClick();
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black font-mario border cursor-pointer ${
                            showLegalCitations
                              ? 'bg-amber-400 text-slate-950 border-black'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {showLegalCitations ? 'SHOWN' : 'HIDDEN'}
                        </button>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handleToggleBgm}
                        className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-black rounded-lg border border-slate-700 cursor-pointer"
                      >
                        {musicActive ? 'Pause Music' : 'Play Music'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSettingsOpen(true);
                          setShowQuickAudioSliders(false);
                          marioAudio.playPipe();
                        }}
                        className="flex-1 py-1.5 px-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-black rounded-lg border border-black cursor-pointer"
                      >
                        More Audio...
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 8. Clean Overflow 'Tools' Menu (Inline on sm+ screens; full quick tools in mobile drawer) */}
              <div ref={moreToolsRef} className="relative hidden sm:block shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreToolsMenu((prev) => !prev);
                    setShowQuickAudioSliders(false);
                    marioAudio.playClick();
                  }}
                  data-testid="navbar-more-tools-btn"
                  aria-expanded={showMoreToolsMenu}
                  aria-label="Open Study Tools & Quick Actions Menu"
                  title="Study Tools: Print PDF, Score Card, Leaderboard, Difficulty, Font Size & Zen HUD"
                  className={`h-7 px-2 inline-flex items-center justify-center gap-1 rounded-lg border font-black text-[11px] leading-none whitespace-nowrap transition-colors cursor-pointer ${
                    showMoreToolsMenu
                      ? 'bg-amber-400 text-slate-950 border-black shadow-[0_1px_0_#000]'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <MoreHorizontal className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">Tools</span>
                </button>

                {showMoreToolsMenu && (
                  <div
                    data-testid="navbar-more-tools-popover"
                    className="mario-menu-press2p absolute right-0 top-full mt-2 w-80 bg-slate-950/95 border-3 border-amber-400 rounded-2xl p-3.5 shadow-[6px_6px_0_#000] z-50 text-white space-y-2.5 backdrop-blur-md max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-black uppercase text-amber-400 font-mario">
                        QUICK TOOLS &amp; EXPORTS
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowMoreToolsMenu(false)}
                        aria-label="Close Study Tools Menu"
                        className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-xs font-bold text-slate-300">Study Difficulty:</span>
                      <button
                        type="button"
                        onClick={handleToggleStudyDifficulty}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black border border-black cursor-pointer inline-flex items-center gap-1 ${
                          studyDifficulty === 'exam_prep'
                            ? 'bg-red-600 text-white'
                            : 'bg-emerald-400 text-slate-950'
                        }`}
                      >
                        {studyDifficulty === 'exam_prep' ? (
                          <GraduationCap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        ) : (
                          <Feather className="w-3.5 h-3.5 text-emerald-950 shrink-0" />
                        )}
                        <span>{studyDifficulty === 'exam_prep' ? 'Exam Prep' : 'Casual'}</span>
                      </button>
                    </div>

                    {/* Daily Study Goal Customizer (15m to 120m in 15-Minute Increments) */}
                    <div
                      data-testid="navbar-daily-goal-settings-section"
                      className="bg-slate-900 px-2.5 py-2 rounded-xl border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-300">
                          Daily Goal ({dailyGoalProgress.completionPercent}%):
                        </span>
                        <button
                          type="button"
                          data-testid="navbar-daily-goal-toggle-btn"
                          onClick={handleCycleDailyGoal}
                          title="Cycle Daily Study Goal in 15-minute increments (15m to 120m)"
                          className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-black border border-black cursor-pointer tabular-nums whitespace-nowrap"
                        >
                          {effectiveDailyGoal}m (+15m)
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {DAILY_GOAL_INCREMENTS.map((inc) => {
                          const isCurrent = effectiveDailyGoal === inc;
                          return (
                            <button
                              key={`nav-goal-${inc}`}
                              type="button"
                              data-testid={`navbar-daily-goal-${inc}m`}
                              onClick={() => handleSelectDailyGoal(inc)}
                              className={`min-h-[28px] px-1.5 py-0.5 rounded-lg text-[10px] font-black border cursor-pointer tabular-nums ${
                                isCurrent
                                  ? 'bg-emerald-400 text-slate-950 border-black'
                                  : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                              }`}
                            >
                              {inc}m
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {onStartQuickStudy && (
                        <button
                          type="button"
                          data-testid="navbar-quick-study-btn"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            onStartQuickStudy();
                            marioAudio.playPowerUp();
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 shrink-0" />
                          <span>5m Study</span>
                        </button>
                      )}

                      {onOpenLeaderboard && (
                        <button
                          type="button"
                          data-testid="navbar-leaderboard-btn"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            onOpenLeaderboard();
                            marioAudio.playCoin();
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs border border-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trophy className="w-3.5 h-3.5 shrink-0" />
                          <span>Ranks</span>
                        </button>
                      )}

                      {onOpenLevelProgression && (
                        <button
                          type="button"
                          data-testid="navbar-level-progression-menu-btn"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            onOpenLevelProgression();
                            marioAudio.playPowerUp();
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5 shrink-0" />
                          <span>Lv.{progressionStats.level} Avatars</span>
                        </button>
                      )}

                      {onOpenDailyMissions && (
                        <button
                          type="button"
                          data-testid="navbar-daily-missions-btn"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            onOpenDailyMissions();
                            marioAudio.playPowerUp();
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Target className="w-3.5 h-3.5 shrink-0" />
                          <span>Missions</span>
                        </button>
                      )}

                      {onOpenGoalHistory && (
                        <button
                          type="button"
                          data-testid="navbar-goal-history-btn"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            onOpenGoalHistory();
                            marioAudio.playCoin();
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5 shrink-0" />
                          <span>Goal History</span>
                        </button>
                      )}

                      {onOpenToadTrainingLog && (
                        <button
                          type="button"
                          data-testid="navbar-toad-training-btn"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            onOpenToadTrainingLog();
                            marioAudio.playCoin();
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Activity className="w-3.5 h-3.5 shrink-0" />
                          <span>Training Log</span>
                        </button>
                      )}

                      {onOpenKnowledgeGraph && (
                        <button
                          type="button"
                          data-testid="navbar-knowledge-graph-btn"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            onOpenKnowledgeGraph();
                            marioAudio.playPowerUp();
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <GitBranch className="w-3.5 h-3.5 shrink-0" />
                          <span>Law Graph</span>
                        </button>
                      )}

                      {onOpenExportProgress && (
                        <button
                          type="button"
                          data-testid="navbar-export-score-btn"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            onOpenExportProgress();
                            marioAudio.playFanfare();
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trophy className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          <span>Score Card</span>
                        </button>
                      )}

                      {onOpenOnePageSummary && (
                        <button
                          type="button"
                          data-testid="navbar-one-page-summary-btn"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            onOpenOnePageSummary();
                            marioAudio.playCoin();
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Printer className="w-3.5 h-3.5 shrink-0" />
                          <span>Print</span>
                        </button>
                      )}

                      {onOpenPrintGuide && (
                        <button
                          type="button"
                          data-testid="navbar-print-btn"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            onOpenPrintGuide();
                            marioAudio.playClick();
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <FileDown className="w-3.5 h-3.5 shrink-0" />
                          <span>Reviewer PDF</span>
                        </button>
                      )}

                      {onOpenStatuteLookup && (
                        <button
                          type="button"
                          data-testid="navbar-statute-lookup-btn"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            onOpenStatuteLookup();
                            marioAudio.playPowerUp();
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Search className="w-3.5 h-3.5 shrink-0" />
                          <span>Statute Lookup</span>
                        </button>
                      )}

                      {onOpenDoleCalculator && (
                        <button
                          type="button"
                          data-testid="navbar-dole-calc-btn"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            onOpenDoleCalculator();
                            marioAudio.playCoin();
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Calculator className="w-3.5 h-3.5 shrink-0" />
                          <span>DOLE Pay Calc</span>
                        </button>
                      )}

                      {onOpenResearchCohort && (
                        <button
                          type="button"
                          data-testid="navbar-research-cohort-btn"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            onOpenResearchCohort();
                            marioAudio.playPowerUp();
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Users className="w-3.5 h-3.5 shrink-0" />
                          <span>Research Cohort</span>
                        </button>
                      )}

                      {onOpenLegalCitationsModal && (
                        <button
                          type="button"
                          data-testid="navbar-citations-btn"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            onOpenLegalCitationsModal();
                            marioAudio.playClick();
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Scale className="w-3.5 h-3.5 shrink-0" />
                          <span>Citations</span>
                        </button>
                      )}

                      {onOpenQuickGlossary && (
                        <button
                          type="button"
                          data-testid="navbar-glossary-btn"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            onOpenQuickGlossary();
                            marioAudio.playPowerUp();
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 shrink-0" />
                          <span>Glossary</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreToolsMenu(false);
                          onOpenWalkthrough();
                          marioAudio.playClick();
                        }}
                        className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5 shrink-0" />
                        <span>App Guide</span>
                      </button>

                      <button
                        type="button"
                        data-testid="navbar-open-notes-btn"
                        onClick={() => {
                          setShowMoreToolsMenu(false);
                          window.dispatchEvent(new CustomEvent('mario-open-study-notes'));
                        }}
                        className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>Study Notes</span>
                      </button>
                    </div>

                    {/* Text Size Scaler + Zen Controls */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-300">Reading Size:</span>
                        <div className="inline-flex h-7 items-center bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                          {(['normal', 'large', 'xlarge'] as const).map((sz, idx) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => {
                                setFontSize(sz);
                                marioAudio.playJump();
                              }}
                              className={`h-6 px-2 rounded text-[11px] font-black cursor-pointer ${
                                fontSize === sz
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {idx === 0 ? 'A' : idx === 1 ? 'A+' : 'A++'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quick App Skin & Reading Font Switchers */}
                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                        {onSelectAppStudyFont && (
                          <div className="flex items-center justify-between gap-2">
                            <label
                              htmlFor="tools-app-font-select"
                              className="text-xs font-bold text-slate-300 shrink-0"
                            >
                              Reading Font:
                            </label>
                            <select
                              id="tools-app-font-select"
                              data-testid="navbar-app-font-select"
                              value={appStudyFont}
                              onChange={(e) => {
                                marioAudio.playClick();
                                onSelectAppStudyFont(e.target.value as AppStudyFontId);
                              }}
                              className="h-7 flex-1 min-w-0 bg-slate-900 [color-scheme:dark] border border-slate-700 text-amber-200 text-xs font-bold rounded-lg px-2 cursor-pointer"
                            >
                              {APP_STUDY_FONTS.map((f) => (
                                <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                                  {f.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {onSelectMenuPixelFont && (
                          <div className="flex items-center justify-between gap-2">
                            <label
                              htmlFor="tools-menu-font-select"
                              className="text-xs font-bold text-slate-300 shrink-0"
                            >
                              Menu Font:
                            </label>
                            <select
                              id="tools-menu-font-select"
                              data-testid="navbar-menu-font-select"
                              value={menuPixelFont}
                              onChange={(e) => {
                                marioAudio.playClick();
                                onSelectMenuPixelFont(e.target.value as MenuPixelFontId);
                              }}
                              className="h-7 flex-1 min-w-0 bg-slate-900 [color-scheme:dark] border border-slate-700 text-cyan-200 text-xs font-bold rounded-lg px-2 cursor-pointer font-pixel-silkscreen"
                            >
                              {MENU_PIXEL_FONTS.map((mf) => (
                                <option key={mf.id} value={mf.id} className="bg-slate-900 text-white font-sans">
                                  {mf.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {onSelectTheme && (
                          <div className="flex items-center justify-between gap-2">
                            <label
                              htmlFor="tools-app-skin-select"
                              className="text-xs font-bold text-slate-300 shrink-0"
                            >
                              Free Skin:
                            </label>
                            <select
                              id="tools-app-skin-select"
                              data-testid="navbar-app-skin-select"
                              value={
                                QUICK_FREE_SKINS.some((s) => s.id === activeTheme)
                                  ? activeTheme
                                  : 'overworld'
                              }
                              onChange={(e) => {
                                marioAudio.playClick();
                                onSelectTheme(e.target.value as MarioTheme);
                              }}
                              className="h-7 flex-1 min-w-0 bg-slate-900 [color-scheme:dark] border border-slate-700 text-emerald-200 text-xs font-bold rounded-lg px-2 cursor-pointer"
                            >
                              {QUICK_FREE_SKINS.map((s) => (
                                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        {onToggleZenReadingMode && (
                          <button
                            type="button"
                            onClick={() => {
                              onToggleZenReadingMode();
                              marioAudio.playPowerUp();
                            }}
                            className={`flex-1 min-h-[34px] px-2.5 rounded-xl text-xs font-black border cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                              zenReadingMode
                                ? 'bg-amber-400 text-slate-950 border-black'
                                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                            }`}
                          >
                            <BookOpen className="w-3.5 h-3.5 shrink-0" />
                            <span>{zenReadingMode ? 'Zen Read: ON' : 'Zen Read'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            setZenMode(true);
                            marioAudio.playPipe();
                          }}
                          className="min-h-[34px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 inline-flex items-center justify-center gap-1 cursor-pointer"
                          title="Hide top status bar"
                        >
                          <EyeOff className="w-3.5 h-3.5 shrink-0" />
                          <span>Hide Top</span>
                        </button>
                      </div>

                      <PWAInstallButton fullWidth />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Goal Streak & Weekly Consistency Slim Sub-Bar (Clickable to open Goal History Calendar) */}
        {!zenMode && (
          <button
            type="button"
            onClick={() => {
              if (onOpenGoalHistory) {
                onOpenGoalHistory();
              } else {
                onOpenProfile();
              }
              marioAudio.playCoin();
            }}
            data-testid="navbar-goal-streak-mobile"
            className="w-full flex md:hidden items-center justify-between gap-2 px-2.5 py-1 bg-[#0b1324] hover:bg-slate-900 border-b border-slate-800/80 text-[10px] font-bold cursor-pointer text-left"
          >
            <span className="inline-flex items-center gap-1 text-amber-300 tabular-nums whitespace-nowrap">
              <Flame className="w-3 h-3 text-orange-400 shrink-0" />
              <span>Goal Streak: {goalConsistency.goalStreakDays}d</span>
              <span className="text-slate-400">
                ({goalConsistency.todayMinutes}/{goalConsistency.dailyGoalMinutes}m)
              </span>
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-16 h-1.5 bg-slate-950 rounded-full border border-slate-700 overflow-hidden shrink-0">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400"
                  style={{
                    width: `${Math.max(
                      goalConsistency.weeklyConsistencyPercent > 0 ? 10 : 0,
                      goalConsistency.weeklyConsistencyPercent
                    )}%`,
                  }}
                />
              </div>
              <span className="font-mono text-emerald-300 tabular-nums whitespace-nowrap">
                {goalConsistency.weeklyConsistencyPercent}% Wk
              </span>
            </div>
          </button>
        )}

        {/* Main Navigation Row: Royal Arcade Tabs, Zero Horizontal Scroll & Zero Crop Across All Viewports */}
        <div className="px-1.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 xl:gap-2 w-full max-w-full min-w-0">
          {/* Zen Restore Button */}
          {zenMode && (
            <button
              type="button"
              onClick={() => {
                setZenMode(false);
                marioAudio.playPipe();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 text-slate-950 rounded-xl font-black text-xs border-2 border-black shrink-0 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Full HUD</span>
            </button>
          )}

          {/* Desktop & Tablet Navigation — Responsive Royal Tabs, Tablet-Safe, Zero Horizontal Scroll */}
          <nav
            aria-label="Primary Navigation"
            data-testid="desktop-primary-nav"
            className="hidden md:flex items-center gap-0.5 xl:gap-1.5 flex-nowrap flex-1 min-w-0 overflow-x-auto no-scrollbar py-0.5 justify-start xl:justify-between"
          >
            {navCategories.flatMap((cat) => cat.items).map((item) => {
              const isSansTab =
                item.id === 'wages_matrix' || item.id === 'calculator' || item.id === 'shop';
              const labelTypography = isSansTab
                ? 'font-sans font-black text-[9px] sm:text-[9.5px] min-[1180px]:text-[10.5px] xl:text-xs'
                : 'font-mario font-bold text-[6.5px] sm:text-[7px] min-[1180px]:text-[7.5px] xl:text-[8.5px] 2xl:text-[9.5px] tracking-tighter';
              return (
                <button
                  key={item.id}
                  type="button"
                  data-nav-font={isSansTab ? 'sans' : 'mario'}
                  onClick={(e) => handleTabClick(item.id, e)}
                  title={item.label}
                  className={`h-9 px-1 min-[1180px]:px-1.5 xl:px-2.5 inline-flex items-center justify-center gap-0.5 xl:gap-1.5 rounded-xl border-2 transition-all cursor-pointer leading-none whitespace-nowrap shrink ${labelTypography} ${
                    activeTab === item.id
                      ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 border-black shadow-[0_2px_0_#000] -translate-y-0.5'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-700/90 hover:border-amber-400/60 shadow-[0_2px_0_#020617]'
                  }`}
                >
                  {item.icon}
                  <span className="xl:hidden text-[7px] min-[1180px]:text-[7.5px]">{item.shortLabel}</span>
                  <span className="hidden xl:inline 2xl:hidden">{item.shortLabel}</span>
                  <span className="hidden 2xl:inline">{item.label}</span>
                  {item.badge && (
                    <span className="hidden 2xl:inline-block text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded font-mario font-bold leading-none">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Phone 5-Column Equal Grid Utility Row (Zero Overflow & Zero Text Spill Outside Frames) */}
          <div
            data-testid="mobile-utility-nav-row"
            className="grid grid-cols-5 md:hidden items-center w-full gap-0.5 min-[360px]:gap-1 sm:gap-1.5 min-w-0"
          >
            <button
              type="button"
              data-testid="navbar-mobile-menu-btn"
              aria-expanded={isMobileMenuOpen}
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                marioAudio.playClick();
              }}
              className="font-sans min-h-[40px] [@media(max-height:500px)]:min-h-[34px] w-full min-w-0 px-0.5 min-[360px]:px-1 sm:px-2.5 inline-flex items-center justify-center gap-0.5 min-[360px]:gap-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border-2 border-black font-black text-[9px] min-[360px]:text-[10px] min-[420px]:text-[11px] sm:text-xs cursor-pointer leading-none whitespace-nowrap overflow-hidden"
            >
              <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
              <span className="truncate block max-w-full text-center">Menu</span>
              <ChevronDown
                className={`hidden sm:inline w-3 h-3 text-slate-400 shrink-0 transition-transform ${
                  isMobileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {onOpenGlobalSearch && (
              <button
                type="button"
                data-testid="navbar-search-mobile-btn"
                onClick={() => {
                  onOpenGlobalSearch();
                  marioAudio.playClick();
                }}
                aria-label="Search Philippine Labor Law (Ctrl+K)"
                title="Search topics, articles, and doctrines (Ctrl+K)"
                className="min-h-[40px] [@media(max-height:500px)]:min-h-[34px] w-full min-w-0 px-0.5 min-[360px]:px-1 sm:px-2.5 inline-flex items-center justify-center gap-0.5 min-[360px]:gap-1 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl border-2 border-amber-400 font-black text-[9px] min-[360px]:text-[10px] min-[420px]:text-[11px] sm:text-xs cursor-pointer leading-none whitespace-nowrap shadow-[0_1px_0_#000] overflow-hidden"
              >
                <Search className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate block max-w-full text-center">Search</span>
              </button>
            )}

            {onOpenOnePageSummary && (
              <button
                type="button"
                data-testid="navbar-mobile-row-summary-btn"
                onClick={() => {
                  onOpenOnePageSummary();
                  marioAudio.playCoin();
                }}
                className="min-h-[40px] [@media(max-height:500px)]:min-h-[34px] w-full min-w-0 px-0.5 min-[360px]:px-1 sm:px-2.5 inline-flex items-center justify-center gap-0.5 min-[360px]:gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl border-2 border-black font-black text-[9px] min-[360px]:text-[10px] min-[420px]:text-[11px] sm:text-xs cursor-pointer leading-none whitespace-nowrap overflow-hidden"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate block max-w-full text-center">Print</span>
              </button>
            )}

            <button
              type="button"
              data-testid="navbar-mobile-calculator-btn"
              onClick={() => handleTabClick('calculator')}
              aria-label="Open Wage, Overtime & 13th Month Pay Calculator"
              title="Open Wage, Overtime & 13th Month Pay Calculator"
              className={`min-h-[40px] [@media(max-height:500px)]:min-h-[34px] w-full min-w-0 px-0.5 min-[360px]:px-1 sm:px-2.5 inline-flex items-center justify-center gap-0.5 min-[360px]:gap-1 rounded-xl font-black text-[9px] min-[360px]:text-[10px] min-[420px]:text-[11px] sm:text-xs border-2 border-black leading-none whitespace-nowrap cursor-pointer transition-colors overflow-hidden ${
                activeTab === 'calculator'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_1px_0_#000]'
                  : 'bg-cyan-950/90 text-cyan-100 hover:bg-cyan-900 border-cyan-400/70'
              }`}
            >
              <Calculator
                className={`w-3.5 h-3.5 shrink-0 ${
                  activeTab === 'calculator' ? 'text-slate-950' : 'text-cyan-300'
                }`}
              />
              <span className="truncate block max-w-full sm:hidden text-center">Rates</span>
              <span className="hidden sm:inline truncate block max-w-full text-center">Calculator</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('shop')}
              className={`min-h-[40px] [@media(max-height:500px)]:min-h-[34px] w-full min-w-0 px-0.5 min-[360px]:px-1 sm:px-2.5 inline-flex items-center justify-center gap-0.5 min-[360px]:gap-1 rounded-xl font-black text-[9px] min-[360px]:text-[10px] min-[420px]:text-[11px] sm:text-xs border-2 border-black leading-none whitespace-nowrap cursor-pointer overflow-hidden ${
                activeTab === 'shop'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_1px_0_#000]'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <ShoppingBag
                className={`w-3.5 h-3.5 shrink-0 ${
                  activeTab === 'shop' ? 'text-slate-950' : 'text-pink-300'
                }`}
              />
              <span className="truncate block max-w-full text-center">Shop</span>
            </button>
          </div>

          {/* Quick Search Shortcut Clicker (LG+ Desktop & Tablet Compact) */}
          <div className="relative hidden lg:flex items-center w-9 xl:w-36 shrink-0">
            <button
              type="button"
              data-testid="navbar-search-desktop-btn"
              onClick={() => {
                if (onOpenGlobalSearch) onOpenGlobalSearch();
                marioAudio.playClick();
              }}
              title="Search Philippine Labor Law (Ctrl+K)"
              className="h-9 w-full inline-flex items-center justify-center xl:justify-between gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-1.5 xl:px-2.5 rounded-xl border-2 border-slate-700 text-xs transition-colors cursor-pointer leading-none"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Search className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden xl:inline truncate">Search</span>
              </div>
              <kbd className="hidden xl:inline-block px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 shrink-0">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Global Study Hub Quick Button */}
          {onOpenGlobalStudyHub && (
            <div className="relative hidden lg:flex items-center shrink-0">
              <button
                type="button"
                data-testid="navbar-study-hub-btn"
                onClick={() => {
                  onOpenGlobalStudyHub();
                  marioAudio.playPowerUp();
                }}
                title="Global Study Hub & Exam Modes"
                className="h-9 px-2.5 inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black shadow-[0_2px_0_#000] text-xs cursor-pointer active:translate-y-0.5 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span className="hidden xl:inline">Study Modes</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Dropdown Menu Drawer (All text & buttons inside Menu use Press Start 2P) */}
        {isMobileMenuOpen && (
          <div
            data-testid="navbar-mobile-menu-drawer"
            className="mario-menu-press2p block lg:hidden bg-slate-900 border-t-2 border-slate-700 p-3 space-y-3 max-h-[80vh] overflow-y-auto"
          >
            {/* Active Super Star 2X Banner inside Mobile Drawer when active */}
            {superStarRemainingLabel && (
              <div className="bg-emerald-950/90 border-2 border-emerald-400 rounded-2xl px-3 py-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MarioStarIcon className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-black text-emerald-200 truncate">
                    Super Star 2X Coin Multiplier
                  </span>
                </div>
                <span className="font-mono text-xs font-black text-amber-300 tabular-nums shrink-0">
                  {superStarRemainingLabel}
                </span>
              </div>
            )}

            {/* Top Priority Mobile Search Bar */}
            {onOpenGlobalSearch && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenGlobalSearch();
                  marioAudio.playClick();
                }}
                className="w-full min-h-[44px] flex items-center justify-between bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold px-3.5 py-2.5 rounded-xl border-2 border-amber-400 text-xs cursor-pointer shadow-[0_2px_0_#000]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Search className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate text-slate-100 font-bold">Search doctrines, wages, leaves, rules...</span>
                </div>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-amber-300 border border-slate-700 shrink-0">
                  Ctrl+K
                </kbd>
              </button>
            )}

            {/* Mobile Study Hub & Exam Modes Quick Button */}
            {onOpenGlobalStudyHub && (
              <button
                type="button"
                data-testid="navbar-study-hub-mobile-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenGlobalStudyHub();
                  marioAudio.playPowerUp();
                }}
                className="w-full min-h-[44px] flex items-center justify-between bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3.5 py-2.5 rounded-xl border-2 border-black text-xs cursor-pointer shadow-[0_2px_0_#000]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen className="w-4 h-4 text-slate-950 shrink-0" />
                  <span>Global Study Hub &amp; Exam Modes</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-black/20 px-2 py-0.5 rounded-full">
                  6 Modes &rarr;
                </span>
              </button>
            )}

            {/* Quick Profile Achievements, App Guide, Toadify, Quick Study & Score Card */}
            <div className="grid grid-cols-2 gap-2 min-w-0">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenProfile();
                  marioAudio.playCoin();
                }}
                className="min-h-[44px] px-2 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-[9px] min-[400px]:text-[10px] sm:text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1 cursor-pointer min-w-0 overflow-hidden leading-tight text-center"
              >
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Badges ({unlockedAchievementsCount}/{totalAchievementsCount})</span>
              </button>

              <button
                type="button"
                onClick={handleToggleToadify}
                aria-pressed={toadifyActive}
                data-testid="mobile-toadify-toggle"
                className={`min-h-[44px] px-2 py-1.5 rounded-xl font-black text-[9px] min-[400px]:text-[10px] sm:text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1 cursor-pointer min-w-0 overflow-hidden leading-tight text-center ${
                  toadifyActive ? 'bg-rose-500 text-white' : 'bg-slate-800 text-rose-200'
                }`}
              >
                <span className="w-4 h-4 rounded-md bg-white border border-black inline-flex items-center justify-center shrink-0">
                  <MarioCharacterAvatar character="toad" className="w-3.5 h-3.5" />
                </span>
                <span className="truncate">{toadifyActive ? 'Toadify: ON' : 'Toadify: OFF'}</span>
              </button>

              {onStartQuickStudy && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onStartQuickStudy();
                    marioAudio.playPowerUp();
                  }}
                  className="min-h-[44px] px-2 py-1.5 rounded-xl bg-emerald-400 text-slate-950 font-black text-[9px] min-[400px]:text-[10px] sm:text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1 cursor-pointer min-w-0 overflow-hidden leading-tight text-center"
                >
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">5m Quick Study</span>
                </button>
              )}

              {onOpenLevelProgression && (
                <button
                  type="button"
                  data-testid="mobile-level-progression-btn"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenLevelProgression();
                    marioAudio.playPowerUp();
                  }}
                  className="min-h-[44px] px-2 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-[9px] min-[400px]:text-[10px] sm:text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1 cursor-pointer min-w-0 overflow-hidden leading-tight text-center"
                >
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Lv.{progressionStats.level} Avatars</span>
                </button>
              )}

              {onOpenDailyMissions && (
                <button
                  type="button"
                  data-testid="mobile-daily-missions-btn"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenDailyMissions();
                    marioAudio.playPowerUp();
                  }}
                  className="min-h-[44px] px-2 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-[9px] min-[400px]:text-[10px] sm:text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1 cursor-pointer min-w-0 overflow-hidden leading-tight text-center"
                >
                  <Target className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Daily Missions</span>
                </button>
              )}

              {onOpenGoalHistory && (
                <button
                  type="button"
                  data-testid="mobile-goal-history-btn"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenGoalHistory();
                    marioAudio.playCoin();
                  }}
                  className="min-h-[44px] px-2 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-[9px] min-[400px]:text-[10px] sm:text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1 cursor-pointer min-w-0 overflow-hidden leading-tight text-center"
                >
                  <History className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Goal Calendar</span>
                </button>
              )}

              {onOpenToadTrainingLog && (
                <button
                  type="button"
                  data-testid="mobile-toad-training-btn"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenToadTrainingLog();
                    marioAudio.playCoin();
                  }}
                  className="min-h-[44px] px-2 py-1.5 rounded-xl bg-sky-400 text-slate-950 font-black text-[9px] min-[400px]:text-[10px] sm:text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1 cursor-pointer min-w-0 overflow-hidden leading-tight text-center"
                >
                  <Activity className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Training Log</span>
                </button>
              )}

              {onOpenKnowledgeGraph && (
                <button
                  type="button"
                  data-testid="mobile-knowledge-graph-btn"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenKnowledgeGraph();
                    marioAudio.playPowerUp();
                  }}
                  className="min-h-[44px] px-2 py-1.5 rounded-xl bg-purple-600 text-white font-black text-[9px] min-[400px]:text-[10px] sm:text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1 cursor-pointer min-w-0 overflow-hidden leading-tight text-center"
                >
                  <GitBranch className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Law Graph</span>
                </button>
              )}

              {onOpenExportProgress ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenExportProgress();
                    marioAudio.playFanfare();
                  }}
                  className="min-h-[44px] px-2 py-1.5 rounded-xl bg-indigo-600 text-white font-black text-[9px] min-[400px]:text-[10px] sm:text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1 cursor-pointer min-w-0 overflow-hidden leading-tight text-center"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="truncate">Score Card PNG</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenWalkthrough();
                    marioAudio.playClick();
                  }}
                  className="min-h-[44px] px-2 py-1.5 rounded-xl bg-cyan-400 text-slate-950 font-black text-[9px] min-[400px]:text-[10px] sm:text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1 cursor-pointer min-w-0 overflow-hidden leading-tight text-center"
                >
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Full App Guide</span>
                </button>
              )}
            </div>

            {/* Dark / Light Mode Segmented Switcher in Mobile Drawer */}
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-amber-400 font-mario">
                <span>DISPLAY THEME</span>
                <span>{colorMode === 'dark' ? 'LATE-NIGHT DARK' : 'SUNNY DAY LIGHT'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (colorMode !== 'light') onToggleColorMode();
                    marioAudio.playJump();
                  }}
                  className={`min-h-[40px] px-3 rounded-xl font-black text-xs border-2 border-black inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                    colorMode === 'light'
                      ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Sun className="w-4 h-4 shrink-0" />
                  <span>Light Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (colorMode !== 'dark') onToggleColorMode();
                    marioAudio.playJump();
                  }}
                  className={`min-h-[40px] px-3 rounded-xl font-black text-xs border-2 border-black inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                    colorMode === 'dark'
                      ? 'bg-indigo-600 text-white shadow-[0_2px_0_#000]'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Moon className="w-4 h-4 shrink-0" />
                  <span>Dark Mode</span>
                </button>
              </div>

              {/* Mobile Quick Skin, Reading Font & Menu Pixel Font Pickers */}
              {(onSelectAppStudyFont || onSelectTheme || onSelectMenuPixelFont) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1.5 border-t border-slate-800">
                  {onSelectAppStudyFont && (
                    <div className="space-y-1">
                      <label
                        htmlFor="mobile-drawer-font-select"
                        className="text-[10px] font-bold text-slate-400 block"
                      >
                        Reading Font:
                      </label>
                      <select
                        id="mobile-drawer-font-select"
                        value={appStudyFont}
                        onChange={(e) => {
                          marioAudio.playClick();
                          onSelectAppStudyFont(e.target.value as AppStudyFontId);
                        }}
                        className="min-h-[38px] w-full bg-slate-900 [color-scheme:dark] border border-slate-700 text-amber-200 text-xs font-bold rounded-xl px-2.5"
                      >
                        {APP_STUDY_FONTS.map((f) => (
                          <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {onSelectMenuPixelFont && (
                    <div className="space-y-1">
                      <label
                        htmlFor="mobile-drawer-menu-font-select"
                        className="text-[10px] font-bold text-slate-400 block"
                      >
                        Menu Pixel Font:
                      </label>
                      <select
                        id="mobile-drawer-menu-font-select"
                        value={menuPixelFont}
                        onChange={(e) => {
                          marioAudio.playClick();
                          onSelectMenuPixelFont(e.target.value as MenuPixelFontId);
                        }}
                        className="min-h-[38px] w-full bg-slate-900 [color-scheme:dark] border border-slate-700 text-cyan-200 text-xs font-bold rounded-xl px-2.5 font-pixel-silkscreen"
                      >
                        {MENU_PIXEL_FONTS.map((mf) => (
                          <option key={mf.id} value={mf.id} className="bg-slate-900 text-white font-sans">
                            {mf.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {onSelectTheme && (
                    <div className="space-y-1">
                      <label
                        htmlFor="mobile-drawer-skin-select"
                        className="text-[10px] font-bold text-slate-400 block"
                      >
                        Quick App Skin:
                      </label>
                      <select
                        id="mobile-drawer-skin-select"
                        value={
                          QUICK_FREE_SKINS.some((s) => s.id === activeTheme)
                            ? activeTheme
                            : 'overworld'
                        }
                        onChange={(e) => {
                          marioAudio.playClick();
                          onSelectTheme(e.target.value as MarioTheme);
                        }}
                        className="min-h-[38px] w-full bg-slate-900 [color-scheme:dark] border border-slate-700 text-emerald-200 text-xs font-bold rounded-xl px-2.5"
                      >
                        {QUICK_FREE_SKINS.map((s) => (
                          <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ambient Mario Soundscape Switcher in Mobile Drawer */}
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase text-amber-400 font-mario">
                  MARIO AMBIENT MUSIC
                </span>
                <button
                  type="button"
                  onClick={handleToggleBgm}
                  className={`px-2.5 py-1 rounded-lg font-black text-[10px] border border-black inline-flex items-center gap-1 cursor-pointer ${
                    musicActive ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {musicActive ? (
                    <Pause className="w-3 h-3 fill-current" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  <span>{musicActive ? 'PAUSE' : 'PLAY'}</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {MARIO_SOUNDSCAPES.map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => handleSelectSoundscape(track.id)}
                    className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-black border text-left cursor-pointer flex items-center gap-1.5 ${
                      audioState.soundscape === track.id
                        ? 'bg-amber-400 text-slate-950 border-black'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    <Music className="w-3 h-3 shrink-0" />
                    <span>{track.shortName}</span>
                  </button>
                ))}
              </div>

              {/* Mobile Volume Sliders for BGM and SFX */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1 font-bold">
                      <Music className="w-3.5 h-3.5 text-emerald-400" /> BGM Volume
                    </span>
                    <span className="font-mono text-amber-300 font-bold tabular-nums">
                      {Math.round((audioState.musicVolume ?? 0.42) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    aria-label="Mobile BGM Volume"
                    min="0"
                    max="1"
                    step="0.05"
                    value={audioState.musicVolume ?? 0.42}
                    onChange={(e) => marioAudio.updateSettings({ musicVolume: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1 font-bold">
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" /> SFX Volume
                    </span>
                    <span className="font-mono text-amber-300 font-bold tabular-nums">
                      {Math.round((audioState.volume ?? 0.8) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    aria-label="Mobile SFX Volume"
                    min="0"
                    max="1"
                    step="0.05"
                    value={audioState.volume ?? 0.8}
                    onChange={(e) => marioAudio.updateSettings({ volume: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Sound Pack Selector */}
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-700 space-y-1.5" data-testid="mobile-audio-pack-control">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-amber-400 font-mario">
                <span>ACTIVE AUDIO PACK</span>
                <span>
                  {SOUND_PACK_DEFINITIONS.find((p) => p.id === (audioState.soundPack || 'sound_default'))?.badge ||
                    'Classic 8-Bit'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  aria-label="Active Sound Pack (Mobile)"
                  value={audioState.soundPack || 'sound_default'}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    marioAudio.setSoundPack(val, true);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold px-2 py-2 text-white cursor-pointer"
                >
                  {SOUND_PACK_DEFINITIONS.map((pack) => {
                    const unlockedItemIds = (() => {
                      const defaults = ['theme_overworld', 'avatar_mario', 'avatar_luigi', 'avatar_peach', 'sound_default'];
                      try {
                        const saved = localStorage.getItem('mario_unlocked_items');
                        if (saved) return Array.from(new Set([...defaults, ...JSON.parse(saved)]));
                      } catch {}
                      return defaults;
                    })();
                    const isUnlocked = unlockedItemIds.includes(pack.id) || pack.defaultPrice === 0;
                    return (
                      <option key={pack.id} value={pack.id} disabled={!isUnlocked}>
                        {pack.name} {!isUnlocked ? `(${pack.defaultPrice}c in Shop)` : ''}
                      </option>
                    );
                  })}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    marioAudio.toggleSoundPackFullTrack(audioState.soundPack || 'sound_default')
                  }
                  title={musicActive ? 'Pause persistent BGM loop' : 'Play full persistent BGM loop'}
                  aria-label={musicActive ? 'Pause active sound pack loop' : 'Play active sound pack loop'}
                  className={`h-9 px-3 rounded-lg border flex items-center justify-center gap-1 shrink-0 cursor-pointer font-bold text-xs ${
                    musicActive
                      ? 'bg-emerald-500 text-slate-950 border-black'
                      : 'bg-slate-800 text-amber-300 border-slate-700'
                  }`}
                >
                  {musicActive ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{musicActive ? 'Looping' : 'Play Loop'}</span>
                </button>
              </div>
              <p className="text-[10px] font-semibold text-emerald-300 truncate flex items-center gap-1">
                <Music className="w-3 h-3 shrink-0" />
                <span>{marioAudio.getActiveTrackLabel()}</span>
              </p>

              {/* Mobile Study Ambience Selector */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-black uppercase text-cyan-300 font-mario">
                  <span>STUDY AMBIENCE</span>
                  <span>{ambiencePausedByBgm ? 'PAUSED BY BGM' : activeAmbience.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {MARIO_NAVBAR_AMBIENCE_OPTIONS.map((opt) => (
                    <button
                      key={`mob-amb-${opt.id}`}
                      type="button"
                      onClick={() => marioAudio.setStudyAmbience(opt.id as any, true)}
                      className={`min-h-[36px] px-2 rounded-lg text-[9px] font-black border cursor-pointer truncate ${
                        activeAmbience === opt.id
                          ? 'bg-cyan-400 text-slate-950 border-black'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Global Difficulty Segmented Selector inside Mobile Drawer */}
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-amber-400 font-mario">
                <span>QUIZ &amp; FLASHCARD DIFFICULTY</span>
                <span>{studyDifficulty === 'exam_prep' ? 'HARDER / MCQ' : 'EASY / DEFINITIONS'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStudyDifficulty('casual');
                    marioAudio.playPowerUp();
                  }}
                  className={`min-h-[42px] px-3 rounded-xl font-black text-xs border-2 border-black inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                    studyDifficulty === 'casual'
                      ? 'bg-emerald-400 text-slate-950 shadow-[0_2px_0_#000]'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Feather className="w-4 h-4 shrink-0" />
                  <span>Casual</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudyDifficulty('exam_prep');
                    marioAudio.playFireball();
                  }}
                  className={`min-h-[42px] px-3 rounded-xl font-black text-xs border-2 border-black inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                    studyDifficulty === 'exam_prep'
                      ? 'bg-red-600 text-white shadow-[0_2px_0_#000]'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span>Exam Prep</span>
                </button>
              </div>
            </div>

            {/* Daily Study Goal (15m–120m) inside Mobile Menu Drawer */}
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase text-emerald-300 font-mario">
                  DAILY STUDY GOAL ({dailyGoalProgress.completionPercent}%)
                </span>
                <button
                  type="button"
                  data-testid="mobile-daily-goal-toggle-btn"
                  onClick={handleCycleDailyGoal}
                  className="min-h-[34px] px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] border border-black cursor-pointer tabular-nums"
                >
                  {effectiveDailyGoal}m (+15m)
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {DAILY_GOAL_INCREMENTS.map((inc) => (
                  <button
                    key={`mob-goal-${inc}`}
                    type="button"
                    onClick={() => handleSelectDailyGoal(inc)}
                    className={`min-h-[36px] px-2 rounded-lg text-[10px] font-black border cursor-pointer tabular-nums ${
                      effectiveDailyGoal === inc
                        ? 'bg-emerald-400 text-slate-950 border-black'
                        : 'bg-slate-900 text-slate-300 border-slate-700'
                    }`}
                  >
                    {inc}m
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {navCategories.map((cat) => (
                <div key={cat.label} className="space-y-1.5">
                  <span className="text-[10px] font-black font-mario text-amber-400 uppercase tracking-wider block">
                    {cat.label}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.items.map((item) => {
                      const drawerTypo = getMobileDrawerButtonTypography(item.id, menuPixelFont);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          data-nav-font={drawerTypo.fontTag}
                          onClick={() => handleTabClick(item.id)}
                          className={`min-h-[44px] flex items-center gap-2 p-2.5 rounded-xl border-2 border-black text-left cursor-pointer transition-all min-w-0 ${drawerTypo.className} ${
                            activeTab === item.id
                              ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          {item.icon}
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Extra Mobile Actions: PWA Install, Print, Leaderboard, Guide & Audio/Settings */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <PWAInstallButton fullWidth />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {onOpenLeaderboard && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenLeaderboard();
                        marioAudio.playCoin();
                      }}
                      className="min-h-[42px] flex items-center justify-center gap-1.5 p-2 bg-slate-800 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5 shrink-0" />
                      <span>Leaderboard</span>
                    </button>
                  )}
                  {onOpenOnePageSummary && (
                    <button
                      type="button"
                      data-testid="mobile-one-page-summary-btn"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenOnePageSummary();
                        marioAudio.playCoin();
                      }}
                      className="min-h-[42px] flex items-center justify-center gap-1.5 p-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl border border-black cursor-pointer whitespace-nowrap"
                    >
                      <Printer className="w-3.5 h-3.5 shrink-0" />
                      <span>Print</span>
                    </button>
                  )}
                  {onOpenPrintGuide && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenPrintGuide();
                        marioAudio.playClick();
                      }}
                      className="min-h-[42px] flex items-center justify-center gap-1.5 p-2 bg-emerald-700 text-white font-bold text-xs rounded-xl border border-black cursor-pointer whitespace-nowrap"
                    >
                      <FileDown className="w-3.5 h-3.5 shrink-0" />
                      <span>Reviewer PDF</span>
                    </button>
                  )}
                  {onOpenStatuteLookup && (
                    <button
                      type="button"
                      data-testid="mobile-statute-lookup-btn"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenStatuteLookup();
                        marioAudio.playPowerUp();
                      }}
                      className="min-h-[42px] flex items-center justify-center gap-1.5 p-2 bg-sky-400 text-slate-950 font-black text-xs rounded-xl border border-black cursor-pointer whitespace-nowrap"
                    >
                      <Search className="w-3.5 h-3.5 shrink-0" />
                      <span>Statute Lookup</span>
                    </button>
                  )}
                  {onOpenDoleCalculator && (
                    <button
                      type="button"
                      data-testid="mobile-dole-calc-btn"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenDoleCalculator();
                        marioAudio.playCoin();
                      }}
                      className="min-h-[42px] flex items-center justify-center gap-1.5 p-2 bg-emerald-400 text-slate-950 font-black text-xs rounded-xl border border-black cursor-pointer whitespace-nowrap"
                    >
                      <Calculator className="w-3.5 h-3.5 shrink-0" />
                      <span>DOLE Pay Calc</span>
                    </button>
                  )}
                  {onOpenResearchCohort && (
                    <button
                      type="button"
                      data-testid="mobile-research-cohort-btn"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenResearchCohort();
                        marioAudio.playPowerUp();
                      }}
                      className="min-h-[42px] flex items-center justify-center gap-1.5 p-2 bg-amber-400 text-slate-950 font-black text-xs rounded-xl border border-black cursor-pointer whitespace-nowrap"
                    >
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span>Research Cohort</span>
                    </button>
                  )}
                  {onOpenLegalCitationsModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenLegalCitationsModal();
                        marioAudio.playClick();
                      }}
                      className="min-h-[42px] flex items-center justify-center gap-1.5 p-2 bg-amber-400 text-slate-950 font-black text-xs rounded-xl border border-black cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5 shrink-0" />
                      <span>Citations</span>
                    </button>
                  )}
                  {onOpenQuickGlossary && (
                    <button
                      type="button"
                      data-testid="mobile-glossary-btn"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenQuickGlossary();
                        marioAudio.playPowerUp();
                      }}
                      className="min-h-[42px] flex items-center justify-center gap-1.5 p-2 bg-rose-500 text-white font-black text-xs rounded-xl border border-black cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>Glossary</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenWalkthrough();
                      marioAudio.playClick();
                    }}
                    className="min-h-[42px] flex items-center justify-center gap-1.5 p-2 bg-cyan-500 text-slate-950 font-black text-xs rounded-xl border border-black cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 shrink-0" />
                    <span>App Guide</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSettingsOpen(true);
                      marioAudio.playPipe();
                    }}
                    className="min-h-[42px] flex items-center justify-center gap-1.5 p-2 bg-slate-800 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 shrink-0" />
                    <span>Audio &amp; Mixer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Soundscape & Complexity Settings Modal */}
      <AudioSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        complexityMode={complexityMode}
        setComplexityMode={setComplexityMode}
        showLegalCitations={showLegalCitations}
        setShowLegalCitations={setShowLegalCitations}
        onOpenShop={onOpenShop}
        dailyGoalMinutes={effectiveDailyGoal}
        onChangeDailyGoalMinutes={handleSelectDailyGoal}
      />
    </>
  );
};
