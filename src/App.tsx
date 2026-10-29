import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ALL_LAW_TOPICS,
  WORLDS_METADATA,
  TOPIC_DIFFICULTY_MAP,
} from './data/laborLawData';
import { Navbar } from './components/Navbar';
import { WorldMap } from './components/WorldMap';
import { TopicCard } from './components/TopicCard';
import { StageProgressBar } from './components/StageProgressBar';
import { BenefitsCalculator } from './components/Calculator';
import { RegionalWageMatrix } from './components/RegionalWageMatrix';
import { FlashcardsView } from './components/FlashcardsView';
import { BarQuizQuest } from './components/BarQuizQuest';
import { Game2D } from './components/Game2D';
import { Game3D } from './components/Game3D';
import { GameVault } from './components/GameVault';
import { ToadShop } from './components/ToadShop';
import { HolidaysView } from './components/HolidaysView';
import { DailyRewardModal } from './components/DailyRewardModal';
import { AutoScrollController } from './components/AutoScrollController';
import { ExportProgressModal } from './components/ExportProgressModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { PrintStudyGuideModal } from './components/PrintStudyGuideModal';
import { StudyNotesDrawer } from './components/StudyNotesDrawer';
import { IntegratedStudyNotesPanel } from './components/IntegratedStudyNotesPanel';
import { LevelUpModal } from './components/LevelUpModal';
import { OfflineIndicator } from './components/PWAInstallButton';
import { UserProfileModal } from './components/UserProfileModal';
import { AppWalkthroughModal } from './components/AppWalkthroughModal';
import { CoinLeaderboardModal } from './components/CoinLeaderboardModal';
import { LegalCitationsModal, CitationsView } from './components/LegalCitationsModal';
import { QuickGlossaryModal } from './components/QuickGlossaryModal';
import { DailyStudyGoalRing } from './components/DailyStudyGoalRing';
import { CoinConfetti } from './components/CoinConfetti';
import {
  MarioMushroomIcon,
  MarioFireFlowerIcon,
  MarioStarIcon,
  MarioPeachCrownIcon,
  Mario1UpIcon,
  MarioCoinIcon,
  MarioQuestionBlockIcon,
  MarioCharacterAvatar,
} from './components/MarioIcons';
import { marioAudio } from './utils/audio';
import {
  syncDailyLoginStreak,
  readStoredStudyDifficulty,
  STUDY_DIFFICULTY_KEY,
  STREAK_COUNT_KEY,
} from './utils/studyModes';
import {
  CLAIMED_WORLD_LEVELUPS_KEY,
  evaluateWorldLevelUp,
  GROUP_MEMBERS,
  MAIN_CREATOR_AUTHOR,
  SUPER_STAR_EXPIRY_STORAGE_KEY,
  SHORTCUT_MAP_ACTIVE_STORAGE_KEY,
  activateSuperStarBuff,
  getSuperStarBuffStatus,
  computeEffectiveCoinReward,
  loadStudyNotes,
  StudyNoteItem,
} from './utils/engagementFeatures';
import {
  ColorMode,
  readStoredColorMode,
  saveStoredColorMode,
  shouldAutoOpenWalkthrough,
  markWalkthroughCompleted,
  loadPlayerProfileStats,
  savePlayerProfileStats,
  recordStudySeconds,
  getTodayStudiedSeconds,
  recordPomodoroFocusFinish,
  recordCompletedQuizRun,
  toggleNeedsImprovementTopic,
  toggleNeedsImprovementWorld,
  evaluateAchievements,
  EvaluatedAchievement,
  PlayerProfileStats,
  QuizCompletionPayload,
} from './utils/profileAchievements';
import {
  MarioTheme,
  MarioAvatar,
  ComplexityMode,
  StudyDifficulty,
  StudyCompanionId,
  CardFrameId,
} from './types/laborLaw';
import {
  ArrowRight,
  ShoppingBag,
  Flame,
  Calendar,
  Users,
  Award,
  X,
  Compass,
  BookOpen,
  HelpCircle,
  Trophy,
  Gamepad2,
  Zap,
  Play,
  RotateCw,
  Lightbulb,
  CheckCircle2,
  Columns,
  Share2,
  Copy,
  Check,
  Star,
  Sparkles,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
} from 'lucide-react';

const TOAD_PRO_TIPS = [
  {
    title: 'Four-Fold Test Control Doctrine',
    tip: 'Memorize the Control Test above all: Not just the result, but the means and methods of achieving it. The Control Test is the primary determinant of Employer-Employee (ER-EE) relationship in Calamba Medical Center v. CIR.',
  },
  {
    title: 'Holiday Pay Multipliers Formula',
    tip: 'Regular Holiday = 200% (or 260% on rest day). Special Non-Working Day = 130% (or 150% on rest day). Unworked Regular Holiday = 100% pay (subject to the day-before attendance rule)!',
  },
  {
    title: '13th Month Pay Computation',
    tip: 'Total basic salary earned within the calendar year divided by 12. Excludes overtime pay, night shift differential, holiday pay, and maternity leave benefits unless included by employer practice.',
  },
  {
    title: 'Art. 302 Retirement Half-Month Formula',
    tip: 'In Philippine Labor Law, "one-half month salary" means 22.5 days: 15 days basic + 5 days Service Incentive Leave (SIL) + 2.5 days (1/12 of 13th month pay)! Capitol Wireless v. Sec. of Labor.',
  },
  {
    title: 'Night Shift Differential (NSD)',
    tip: 'NSD of 10% applies to work between 10:00 PM and 6:00 AM. If overtime occurs between 10 PM and 6 AM, calculate base rate + OT first, then add the 10% NSD on top of the OT rate.',
  },
  {
    title: 'Kasambahay Non-Diminution',
    tip: 'Under R.A. 10361, domestic workers are entitled to 5 days SIL, 13th month pay, and SSS/PhilHealth/Pag-IBIG. Free meals, lodging, and medical attendance cannot be deducted from minimum wage.',
  },
  {
    title: 'Compressed Work Week (CWW) Limits',
    tip: 'Under DOLE Advisory No. 02-04, normal 48 hours can be compressed to 4 or 5 days up to a maximum of 12 hours/day without overtime pay, provided the company meets statutory safety certifications.',
  },
  {
    title: 'Solo Parent Leave Under R.A. 11861',
    tip: 'Parental leave of 7 working days with full pay is now available to solo parents after only 6 months of continuous service (shortened from 1 year by R.A. 11861).',
  },
  {
    title: 'Expanded Maternity Leave (R.A. 11210)',
    tip: '105 days for live birth with full pay, extendible by 30 days without pay. Solo parents get +15 days (120 days total). Up to 7 days can be transferred to the working father!',
  },
  {
    title: 'Two-Notice Rule in Just Cause Dismissals',
    tip: 'King of Kings rule: 1st notice (specific acts with at least 5 calendar days to explain), hearing/conference, and 2nd notice (decision indicating grounds). Failure gives P30,000 nominal damages.',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('map');
  const [activeWorld, setActiveWorld] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [coins, setCoins] = useState<number>(35);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [zenMode, setZenMode] = useState<boolean>(false);

  // Warp pipe CSS transition state
  const [isWarpTransitioning, setIsWarpTransitioning] = useState<boolean>(false);

  // Quick Resume session state from localStorage
  const [lastStudiedTopicId, setLastStudiedTopicId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mario_last_studied_topic') || 'w1_hours_exclusions';
    }
    return 'w1_hours_exclusions';
  });

  // Searchable Quick Jump filter state
  const [quickJumpSearch, setQuickJumpSearch] = useState<string>('');

  // Toad's Pro Tip dialog state
  const [toadTipIndex, setToadTipIndex] = useState<number>(0);
  const [showToadTip, setShowToadTip] = useState<boolean>(true);
  const [toadTipTimerPaused, setToadTipTimerPaused] = useState<boolean>(false);
  const [toadTipCopied, setToadTipCopied] = useState<boolean>(false);
  const [toadTipShareSuccess, setToadTipShareSuccess] = useState<boolean>(false);

  const handleCopyTip = async () => {
    marioAudio.playCoin();
    const currentTip = TOAD_PRO_TIPS[toadTipIndex];
    const tipText = `Toad's Labor Law Pro Tip #${toadTipIndex + 1}: ${currentTip.title}\n\n"${currentTip.tip}"\n\nSuper Mario Labor Adventure`;
    try {
      await navigator.clipboard.writeText(tipText);
      setToadTipCopied(true);
      setTimeout(() => setToadTipCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShareTip = async () => {
    marioAudio.playCoin();
    const currentTip = TOAD_PRO_TIPS[toadTipIndex];
    const tipText = `Toad's Labor Law Pro Tip #${toadTipIndex + 1}: ${currentTip.title}\n\n"${currentTip.tip}"\n\nSuper Mario Labor Adventure`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Toad's Pro Tip: ${currentTip.title}`,
          text: tipText,
          url: window.location.href,
        });
        setToadTipShareSuccess(true);
        setTimeout(() => setToadTipShareSuccess(false), 2000);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }
    // Fallback to clipboard if Web Share API not available
    try {
      await navigator.clipboard.writeText(tipText);
      setToadTipCopied(true);
      setTimeout(() => setToadTipCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Auto-hide Toad's Pro Tip after 12s unless paused
  useEffect(() => {
    if (!showToadTip || toadTipTimerPaused || activeTab !== 'map') return;
    const timer = window.setTimeout(() => {
      setShowToadTip(false);
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [showToadTip, toadTipIndex, toadTipTimerPaused, activeTab]);

  // When returning to dashboard, show Toad's Pro Tip and shuffle next tip
  useEffect(() => {
    if (activeTab === 'map') {
      setShowToadTip(true);
      setToadTipIndex((prev) => (prev + 1) % TOAD_PRO_TIPS.length);
    }
  }, [activeTab]);

  // Modals & Persistent Drawers
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [isPrintGuideOpen, setIsPrintGuideOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isLegalCitationsOpen, setIsLegalCitationsOpen] = useState<boolean>(false);
  const [isQuickGlossaryOpen, setIsQuickGlossaryOpen] = useState<boolean>(false);
  const [showCoinConfetti, setShowCoinConfetti] = useState<boolean>(false);
  const [quickStudyLaunchId, setQuickStudyLaunchId] = useState<number>(0);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return shouldAutoOpenWalkthrough(window.location.search, window.localStorage);
    }
    return false;
  });

  // Dark / Light Mode state synced with <html class="dark">
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    if (typeof window !== 'undefined') {
      return readStoredColorMode(window.localStorage);
    }
    return 'light';
  });

  // Zen Reading Mode: High-contrast Pro Study dark theme across entire application
  const [zenReadingMode, setZenReadingMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('mario_zen_reading_mode') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('pro-study-zen', zenReadingMode);
      if (zenReadingMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.toggle('dark', colorMode === 'dark');
      }
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mario_zen_reading_mode', String(zenReadingMode));
      } catch {}
      saveStoredColorMode(colorMode, window.localStorage);
    }
  }, [zenReadingMode, colorMode]);

  const handleToggleZenReadingMode = () => {
    setZenReadingMode((prev) => !prev);
    marioAudio.playPowerUp();
  };

  const handleToggleColorMode = (explicitMode?: ColorMode) => {
    setColorMode((prev) =>
      explicitMode ? explicitMode : prev === 'dark' ? 'light' : 'dark'
    );
  };

  // Dynamic Difficulty Filter for Topics ('all' | 'Foundation' | 'Intermediate' | 'Bar Master')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Foundation' | 'Intermediate' | 'Bar Master'>('all');

  // Toad's Pro Tip Favorites (Persistent Array in localStorage)
  const [favoriteTips, setFavoriteTips] = useState<{ title: string; tip: string; savedAt: number }[]>(() => {
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

  const isCurrentTipFavorited = useMemo(() => {
    const cur = TOAD_PRO_TIPS[toadTipIndex];
    return cur ? favoriteTips.some((t) => t.title === cur.title) : false;
  }, [toadTipIndex, favoriteTips]);

  const handleToggleFavoriteTip = () => {
    const cur = TOAD_PRO_TIPS[toadTipIndex];
    if (!cur) return;
    let next: { title: string; tip: string; savedAt: number }[];
    if (isCurrentTipFavorited) {
      next = favoriteTips.filter((t) => t.title !== cur.title);
      marioAudio.playPipe();
    } else {
      next = [...favoriteTips, { title: cur.title, tip: cur.tip, savedAt: Date.now() }];
      marioAudio.playCoin();
    }
    setFavoriteTips(next);
    try {
      localStorage.setItem('mario_favorite_tips', JSON.stringify(next));
    } catch {}
  };

  // Persistent Player Profile Stats & Achievements
  const [profileStats, setProfileStats] = useState<PlayerProfileStats>(() =>
    typeof window !== 'undefined'
      ? loadPlayerProfileStats(window.localStorage)
      : loadPlayerProfileStats(null)
  );
  const [achievementBanner, setAchievementBanner] = useState<EvaluatedAchievement | null>(
    null
  );

  const [studyNotes, setStudyNotes] = useState<StudyNoteItem[]>(() =>
    typeof window !== 'undefined' ? loadStudyNotes(window.localStorage) : []
  );
  const [claimedWorldIds, setClaimedWorldIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(CLAIMED_WORLD_LEVELUPS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [levelUpCelebration, setLevelUpCelebration] = useState<{
    worldId: string | null;
    bonusCoins: number;
  }>({ worldId: null, bonusCoins: 0 });

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Unlocked Themes & Avatars
  const [activeTheme, setActiveTheme] = useState<MarioTheme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mario_active_theme') as MarioTheme;
        return saved || 'overworld';
      } catch {
        return 'overworld';
      }
    }
    return 'overworld';
  });

  const [equippedAvatar, setEquippedAvatar] = useState<MarioAvatar>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mario_equipped_avatar') as MarioAvatar;
        return saved || 'mario';
      } catch {
        return 'mario';
      }
    }
    return 'mario';
  });

  // Super Star Power-Up (2x Coins for 10m), Shortcut Map, Companions & Card Frames
  const [superStarEndsAt, setSuperStarEndsAt] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        return Number(localStorage.getItem(SUPER_STAR_EXPIRY_STORAGE_KEY) || '0') || 0;
      } catch {
        return 0;
      }
    }
    return 0;
  });
  const [buffNowMs, setBuffNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    if (superStarEndsAt <= Date.now()) return;
    setBuffNowMs(Date.now());
    const id = window.setInterval(() => {
      const now = Date.now();
      setBuffNowMs(now);
      if (now >= superStarEndsAt) {
        window.clearInterval(id);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [superStarEndsAt]);

  const superStarStatus = useMemo(
    () => getSuperStarBuffStatus(superStarEndsAt, buffNowMs),
    [superStarEndsAt, buffNowMs]
  );

  const [shortcutMapActive, setShortcutMapActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(SHORTCUT_MAP_ACTIVE_STORAGE_KEY) === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const [equippedCompanion, setEquippedCompanion] = useState<StudyCompanionId>(() => {
    const validCompanions: StudyCompanionId[] = [
      'comp_none',
      'comp_luma',
      'comp_baby_yoshi',
      'comp_polterpup',
      'comp_counsel_toad',
      'comp_chain_chomp',
      'comp_lakitu',
    ];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('mario_equipped_companion') as StudyCompanionId | null;
        return stored && validCompanions.includes(stored) ? stored : 'comp_none';
      } catch {
        return 'comp_none';
      }
    }
    return 'comp_none';
  });

  const [equippedCardFrame, setEquippedCardFrame] = useState<CardFrameId>(() => {
    const validFrames: CardFrameId[] = [
      'frame_default',
      'frame_royal_gold',
      'frame_starlight_prism',
      'frame_retro_brick',
      'frame_emerald_pipe',
      'frame_supreme_crimson',
    ];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('mario_equipped_card_frame') as CardFrameId | null;
        return stored && validFrames.includes(stored) ? stored : 'frame_default';
      } catch {
        return 'frame_default';
      }
    }
    return 'frame_default';
  });

  const hasMushroomCoinCharm = () => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem('mario_unlocked_items');
      const arr: string[] = raw ? JSON.parse(raw) : [];
      return arr.includes('booster_coin_charm');
    } catch {
      return false;
    }
  };

  const handleActivateSuperStar = (durationMinutes: number) => {
    const now = Date.now();
    const nextExpiry = activateSuperStarBuff(superStarEndsAt, now, durationMinutes * 60 * 1000);
    setSuperStarEndsAt(nextExpiry);
    setBuffNowMs(now);
    try {
      localStorage.setItem(SUPER_STAR_EXPIRY_STORAGE_KEY, String(nextExpiry));
    } catch {
      // ignore
    }
  };

  const handleToggleShortcutMap = (active: boolean) => {
    setShortcutMapActive(active);
    try {
      localStorage.setItem(SHORTCUT_MAP_ACTIVE_STORAGE_KEY, String(active));
    } catch {
      // ignore
    }
  };

  const handleEquipCompanion = (id: StudyCompanionId) => {
    setEquippedCompanion(id);
    try {
      localStorage.setItem('mario_equipped_companion', id);
    } catch {
      // ignore
    }
  };

  const handleEquipCardFrame = (id: CardFrameId) => {
    setEquippedCardFrame(id);
    try {
      localStorage.setItem('mario_equipped_card_frame', id);
    } catch {
      // ignore
    }
  };

  // Complexity Mode: 'beginner' vs 'advanced'
  const [complexityMode, setComplexityMode] = useState<ComplexityMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mario_complexity_mode') as ComplexityMode;
        return saved || 'beginner';
      } catch {
        return 'beginner';
      }
    }
    return 'beginner';
  });

  const handleSetComplexityMode = (mode: ComplexityMode) => {
    setComplexityMode(mode);
    try {
      localStorage.setItem('mario_complexity_mode', mode);
    } catch {
      // fallback
    }
  };

  // Global Study Difficulty ('casual' vs 'exam_prep') for Flashcards & Quizzes
  const [studyDifficulty, setStudyDifficultyState] = useState<StudyDifficulty>(() => {
    if (typeof window !== 'undefined') {
      try {
        return readStoredStudyDifficulty(window.localStorage);
      } catch {
        return 'exam_prep';
      }
    }
    return 'exam_prep';
  });

  const handleSetStudyDifficulty = (diff: StudyDifficulty) => {
    setStudyDifficultyState(diff);
    try {
      localStorage.setItem(STUDY_DIFFICULTY_KEY, diff);
    } catch {
      // fallback
    }
  };

  // Global Legal Citations Toggle for Bar students
  const [showLegalCitations, setShowLegalCitationsState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mario_legal_citations');
        return saved !== null ? saved === 'true' : true;
      } catch {
        return true;
      }
    }
    return true;
  });

  const handleSetShowLegalCitations = (show: boolean) => {
    setShowLegalCitationsState(show);
    try {
      localStorage.setItem('mario_legal_citations', String(show));
    } catch {
      // ignore
    }
  };

  // Modules Side-by-Side Split View (Topic Cards Left + Saved Study Notes Right)
  const [isSplitView, setIsSplitView] = useState<boolean>(false);

  // Additional Module Study & View Options (Stream / 2-Col Grid / Compact Outline / Focus Reader + Status Filter)
  const [moduleViewMode, setModuleViewMode] = useState<'stream' | 'grid' | 'outline' | 'focus'>('stream');
  const [moduleStatusFilter, setModuleStatusFilter] = useState<'all' | 'unread' | 'mastered' | 'flagged'>('all');
  const [expandCollapseSignal, setExpandCollapseSignal] = useState<{
    mode: 'expand' | 'collapse';
    seq: number;
  } | null>(null);
  const [focusTopicIdx, setFocusTopicIdx] = useState<number>(0);

  // Daily Login Streak Counter synced with localStorage
  const [loginStreak, setLoginStreak] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        return syncDailyLoginStreak(window.localStorage).streak;
      } catch {
        return 1;
      }
    }
    return 1;
  });

  const [isBonusClaimedToday, setIsBonusClaimedToday] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return syncDailyLoginStreak(window.localStorage).isBonusClaimedToday;
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const synced = syncDailyLoginStreak(window.localStorage);
      setLoginStreak(synced.streak);
      setIsBonusClaimedToday(synced.isBonusClaimedToday);
    } catch {
      // fallback
    }
  }, []);

  // Completed / Studied topics persistence
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mario_completed_topics');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const handleToggleTopicComplete = (topicId: string) => {
    const isNowDone = !completedTopicIds.includes(topicId);
    let next: string[];

    if (isNowDone) {
      next = [...completedTopicIds, topicId];
      // Coin collection SFX when topic is marked complete
      marioAudio.playCoin();

      const levelUpCheck = evaluateWorldLevelUp({
        toggledTopicId: topicId,
        previousCompletedIds: completedTopicIds,
        nextCompletedIds: next,
        allTopics: ALL_LAW_TOPICS,
        claimedWorldIds,
      });

      if (levelUpCheck.triggered && levelUpCheck.worldId) {
        const effectiveReward = computeEffectiveCoinReward(
          2 + levelUpCheck.bonusCoins,
          {
            isSuperStarActive: getSuperStarBuffStatus(superStarEndsAt).isActive,
            hasMushroomCoinCharm: hasMushroomCoinCharm(),
          }
        );
        setCoins((c) => c + effectiveReward);
        setClaimedWorldIds(levelUpCheck.updatedClaimedWorlds);
        try {
          localStorage.setItem(
            CLAIMED_WORLD_LEVELUPS_KEY,
            JSON.stringify(levelUpCheck.updatedClaimedWorlds)
          );
        } catch {
          // fallback
        }
        setLevelUpCelebration({
          worldId: levelUpCheck.worldId,
          bonusCoins: levelUpCheck.bonusCoins,
        });
        setShowCoinConfetti(true);
      } else {
        const effectiveReward = computeEffectiveCoinReward(2, {
          isSuperStarActive: getSuperStarBuffStatus(superStarEndsAt).isActive,
          hasMushroomCoinCharm: hasMushroomCoinCharm(),
        });
        setCoins((c) => c + effectiveReward);
      }
    } else {
      next = completedTopicIds.filter((id) => id !== topicId);
      marioAudio.playJump();
    }

    setCompletedTopicIds(next);
    try {
      localStorage.setItem('mario_completed_topics', JSON.stringify(next));
    } catch {
      // fallback
    }
  };

  const handleResetProgress = () => {
    setCompletedTopicIds([]);
    try {
      localStorage.removeItem('mario_completed_topics');
    } catch {
      // fallback
    }
    marioAudio.playPipe();
  };

  const handleMarkAllComplete = () => {
    const allIds = ALL_LAW_TOPICS.map((t) => t.id);
    setCompletedTopicIds(allIds);
    try {
      localStorage.setItem('mario_completed_topics', JSON.stringify(allIds));
    } catch {
      // fallback
    }
    marioAudio.playQuizComplete();
    setShowCoinConfetti(true);
  };

  // Helper for world icons
  const renderWorldIcon = (iconType: string, className = 'w-5 h-5') => {
    switch (iconType) {
      case 'mushroom':
        return <MarioMushroomIcon className={className} />;
      case 'flower':
        return <MarioFireFlowerIcon className={className} />;
      case 'star':
        return <MarioStarIcon className={className} />;
      case 'crown':
        return <MarioPeachCrownIcon className={className} />;
      case '1up':
        return <Mario1UpIcon className={className} />;
      default:
        return <MarioMushroomIcon className={className} />;
    }
  };

  // Filter topics based on active world, difficulty tag, and search query
  const displayedTopics = useMemo(() => {
    return ALL_LAW_TOPICS.filter((topic) => {
      const matchesWorld = activeWorld === 'all' || topic.worldId === activeWorld;
      if (!matchesWorld) return false;

      if (difficultyFilter !== 'all') {
        const topicDiff = topic.difficulty || TOPIC_DIFFICULTY_MAP[topic.id] || 'Intermediate';
        if (topicDiff !== difficultyFilter) return false;
      }

      if (moduleStatusFilter === 'unread' && completedTopicIds.includes(topic.id)) {
        return false;
      }
      if (moduleStatusFilter === 'mastered' && !completedTopicIds.includes(topic.id)) {
        return false;
      }
      if (
        moduleStatusFilter === 'flagged' &&
        !profileStats.needsImprovementTopicIds?.includes(topic.id)
      ) {
        return false;
      }

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const titleMatch = topic.title.toLowerCase().includes(q);
      const summaryMatch = topic.summary.toLowerCase().includes(q);
      const badgeMatch = topic.badge.toLowerCase().includes(q);
      const docMatch = topic.keyDoctrines.some((d) => d.toLowerCase().includes(q));
      const rulesMatch = topic.rules.some(
        (r) =>
          r.heading.toLowerCase().includes(q) ||
          (r.items && r.items.some((i) => i.toLowerCase().includes(q))) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
      const tipsMatch = topic.barTips && topic.barTips.some((t) => t.toLowerCase().includes(q));

      return titleMatch || summaryMatch || badgeMatch || docMatch || rulesMatch || tipsMatch;
    });
  }, [
    activeWorld,
    searchQuery,
    difficultyFilter,
    moduleStatusFilter,
    completedTopicIds,
    profileStats.needsImprovementTopicIds,
  ]);

  useEffect(() => {
    setFocusTopicIdx(0);
  }, [activeWorld, difficultyFilter, moduleStatusFilter, searchQuery]);

  // Quick Jump searchable dropdown items
  const quickJumpFilteredTopics = useMemo(() => {
    if (!quickJumpSearch.trim()) return ALL_LAW_TOPICS;
    const q = quickJumpSearch.toLowerCase();
    return ALL_LAW_TOPICS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.badge.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q)
    );
  }, [quickJumpSearch]);

  const hasInitializedAudioSyncRef = useRef<boolean>(false);

  // Automatically sync persistent module/world BGM whenever activeTab or activeWorld changes
  useEffect(() => {
    const resolvedModuleId = (() => {
      if (activeTab === 'modules' || activeTab === 'flashcards') {
        return activeWorld !== 'all' ? activeWorld : 'world1';
      }
      if (activeTab === 'map') {
        return activeWorld !== 'all' ? activeWorld : 'world1';
      }
      if (
        activeTab === 'holidays' ||
        activeTab === 'wages_matrix' ||
        activeTab === 'calculator' ||
        activeTab === 'quiz' ||
        activeTab === 'vault' ||
        activeTab === 'shop'
      ) {
        return activeTab;
      }
      return 'world1';
    })();

    if (!hasInitializedAudioSyncRef.current) {
      hasInitializedAudioSyncRef.current = true;
      marioAudio.syncModuleAudio(resolvedModuleId, false);
      return;
    }

    marioAudio.syncModuleAudio(resolvedModuleId, false);
  }, [activeTab, activeWorld]);

  const lastStudiedTopic = useMemo(() => {
    return ALL_LAW_TOPICS.find((t) => t.id === lastStudiedTopicId) || ALL_LAW_TOPICS[0];
  }, [lastStudiedTopicId]);

  const handleRecordAccessedTopic = (topicId: string) => {
    setLastStudiedTopicId(topicId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mario_last_studied_topic', topicId);
      } catch {
        // ignore
      }
    }
  };

  const triggerWarpTransition = (action: () => void) => {
    setIsWarpTransitioning(true);
    marioAudio.playPipe();
    window.setTimeout(() => {
      action();
    }, 180);
    window.setTimeout(() => {
      setIsWarpTransitioning(false);
    }, 600);
  };

  const handleWorldSelect = (worldId: string) => {
    triggerWarpTransition(() => {
      setActiveWorld(worldId);
      if (worldId !== 'all') {
        marioAudio.syncModuleAudio(worldId, true);
      } else {
        marioAudio.syncModuleAudio('world1', false);
        marioAudio.playTabSwitch();
      }
    });
  };

  const handleMapWorldSelect = (worldId: string) => {
    if (worldId === 'warp_calc') {
      triggerWarpTransition(() => {
        setActiveTab('calculator');
        marioAudio.syncModuleAudio('calculator', false);
      });
    } else if (worldId === 'wages_matrix') {
      triggerWarpTransition(() => {
        setActiveTab('wages_matrix');
        marioAudio.syncModuleAudio('wages_matrix', false);
      });
    } else if (worldId === 'holidays') {
      triggerWarpTransition(() => {
        setActiveTab('holidays');
        marioAudio.syncModuleAudio('holidays', true);
      });
    } else {
      triggerWarpTransition(() => {
        setActiveWorld(worldId);
        setActiveTab('modules');
        marioAudio.syncModuleAudio(worldId, true);
      });
    }
  };

  const handleEarnCoin = () => {
    const reward = computeEffectiveCoinReward(1, {
      isSuperStarActive: getSuperStarBuffStatus(superStarEndsAt).isActive,
      hasMushroomCoinCharm: hasMushroomCoinCharm(),
    });
    setCoins((c) => c + reward);
  };

  const handleEarnCoins = (amount: number) => {
    if (amount <= 0) return;
    const reward = computeEffectiveCoinReward(amount, {
      isSuperStarActive: getSuperStarBuffStatus(superStarEndsAt).isActive,
      hasMushroomCoinCharm: false,
    });
    setCoins((c) => c + reward);
  };

  // Wrapper for GameVault so arcade coin pickups also receive the Super Star 2x buff
  const handleArcadeSetCoins: React.Dispatch<React.SetStateAction<number>> = (updater) => {
    setCoins((prev) => {
      const rawNext = typeof updater === 'function' ? updater(prev) : updater;
      const delta = rawNext - prev;
      if (delta > 0 && getSuperStarBuffStatus(superStarEndsAt).isActive) {
        return prev + delta * 2;
      }
      return rawNext;
    });
  };

  const handleStartQuickStudy = () => {
    setActiveTab('flashcards');
    setQuickStudyLaunchId((n) => n + 1);
    marioAudio.playPowerUp();
  };

  const handleToggleNeedsImprovementTopic = (topicId: string) => {
    setProfileStats((prev) => toggleNeedsImprovementTopic(prev, topicId));
  };

  const handleToggleNeedsImprovementWorld = (worldId: string) => {
    setProfileStats((prev) => toggleNeedsImprovementWorld(prev, worldId));
  };

  const handleBoostStreak = (days: number) => {
    setLoginStreak((prev) => {
      const next = Math.max(1, prev + days);
      try {
        localStorage.setItem(STREAK_COUNT_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Persist profile stats whenever updated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      savePlayerProfileStats(profileStats, window.localStorage);
    }
  }, [profileStats]);

  // Passive active-study heartbeat (credits 15s every 15s while document is visible on study/quiz/calc tabs)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setProfileStats((prev) => recordStudySeconds(prev, 15));
      }
    }, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const handlePomodoroStudySeconds = (secs: number) => {
    setProfileStats((prev) => recordStudySeconds(prev, secs));
  };

  const handlePomodoroFocusComplete = () => {
    setProfileStats((prev) => recordPomodoroFocusFinish(prev, 0));
  };

  const handleQuizCompleted = (payload: QuizCompletionPayload) => {
    setProfileStats((prev) => recordCompletedQuizRun(prev, payload));
  };

  const handleUpdatePlayerName = (name: string) => {
    setProfileStats((prev) => ({ ...prev, playerName: name }));
  };

  const handleSelectAvatarPersist = (avatar: MarioAvatar) => {
    setEquippedAvatar(avatar);
    try {
      localStorage.setItem('mario_equipped_avatar', avatar);
    } catch {
      // ignore
    }
  };

  const handleCompleteWalkthrough = (navigateToTab?: string) => {
    const firstGraduation = !profileStats.walkthroughCompleted;
    if (typeof window !== 'undefined') {
      markWalkthroughCompleted(window.localStorage);
    }
    if (firstGraduation) {
      setProfileStats((prev) => ({
        ...prev,
        walkthroughCompleted: true,
      }));
    }
    if (navigateToTab) {
      setActiveTab(navigateToTab);
    }
    setIsWalkthroughOpen(false);
  };

  const world1TopicIds = useMemo(
    () => ALL_LAW_TOPICS.filter((t) => t.worldId === 'world1').map((t) => t.id),
    []
  );

  const topicsByWorld = useMemo(() => {
    const map: Record<string, string[]> = {};
    WORLDS_METADATA.forEach((w) => {
      map[w.id] = ALL_LAW_TOPICS.filter((t) => t.worldId === w.id).map((t) => t.id);
    });
    return map;
  }, []);

  const achievementSync = useMemo(
    () =>
      evaluateAchievements({
        stats: profileStats,
        completedTopicIds,
        totalTopicsCount: ALL_LAW_TOPICS.length,
        world1TopicIds,
        topicsByWorld,
        loginStreak,
        notesCount: studyNotes.length,
      }),
    [profileStats, completedTopicIds, world1TopicIds, topicsByWorld, loginStreak, studyNotes.length]
  );

  // Sync newly unlocked achievement dates & reward coins automatically
  useEffect(() => {
    if (achievementSync.newlyUnlocked.length > 0) {
      setProfileStats(achievementSync.updatedStats);
      if (achievementSync.totalBonusCoinsEarned > 0) {
        setCoins((c) => c + achievementSync.totalBonusCoinsEarned);
      }
      setAchievementBanner(achievementSync.newlyUnlocked[0]);
      marioAudio.playAchievementUnlock();
    }
  }, [achievementSync]);

  useEffect(() => {
    if (achievementBanner) {
      const timer = setTimeout(() => {
        setAchievementBanner(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [achievementBanner]);

  const unlockedAchievementsCount = useMemo(
    () => achievementSync.achievements.filter((a) => a.unlocked).length,
    [achievementSync.achievements]
  );

  // Font styling class
  const bodyTextClass =
    fontSize === 'xlarge' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-base';

  return (
    <div className={`min-h-screen flex flex-col text-slate-900 dark:text-slate-100 pb-16 antialiased theme-${activeTheme} w-full max-w-full`}>
      {/* Main Navigation Container — Safe Top Padding so UI is never cropped on mobile */}
      <div className="sticky top-0 z-40 w-full bg-[#0f172a] safe-top-nav">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          fontSize={fontSize}
          setFontSize={setFontSize}
          coins={coins}
          setCoins={setCoins}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          zenMode={zenMode}
          setZenMode={setZenMode}
          complexityMode={complexityMode}
          setComplexityMode={handleSetComplexityMode}
          studyDifficulty={studyDifficulty}
          setStudyDifficulty={handleSetStudyDifficulty}
          loginStreak={loginStreak}
          isBonusClaimedToday={isBonusClaimedToday}
          equippedAvatar={equippedAvatar}
          colorMode={colorMode}
          onToggleColorMode={() => handleToggleColorMode()}
          unlockedAchievementsCount={unlockedAchievementsCount}
          totalAchievementsCount={achievementSync.achievements.length}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
          onStudySecondsTick={handlePomodoroStudySeconds}
          onFocusSessionComplete={handlePomodoroFocusComplete}
          onEarnCoins={handleEarnCoins}
          onOpenShop={() => {
            setActiveTab('shop');
            marioAudio.playCoin();
          }}
          onOpenDailyReward={() => setIsDailyRewardOpen(true)}
          onOpenExportProgress={() => setIsExportModalOpen(true)}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
          onOpenPrintGuide={() => setIsPrintGuideOpen(true)}
          onOpenLegalCitationsModal={() => setIsLegalCitationsOpen(true)}
          onOpenQuickGlossary={() => setIsQuickGlossaryOpen(true)}
          showLegalCitations={showLegalCitations}
          setShowLegalCitations={handleSetShowLegalCitations}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onStartQuickStudy={handleStartQuickStudy}
          superStarRemainingLabel={
            superStarStatus.isActive ? superStarStatus.formattedRemaining : null
          }
          shortcutMapActive={shortcutMapActive}
          zenReadingMode={zenReadingMode}
          onToggleZenReadingMode={handleToggleZenReadingMode}
        />
      </div>

      {/* Main Container with Mobile Bottom Nav Padding */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 pt-4 sm:pt-6 md:pt-8 pb-24 lg:pb-8 overflow-x-hidden">
        <div key={activeTab} className="mario-view-enter w-full max-w-full min-w-0 space-y-6">
        {/* Tab 0: Super Mario World Overworld Interactive Map */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Quick Resume Button */}
            {lastStudiedTopic && (
              <div
                data-testid="quick-resume-banner"
                className="bg-gradient-to-r from-red-600 via-amber-500 to-amber-400 rounded-2xl p-1 shadow-[4px_4px_0_#000] border-3 border-slate-950 w-full max-w-full overflow-hidden"
              >
                <div className="bg-slate-950 text-white rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full max-w-full overflow-hidden">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1 w-full overflow-hidden">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black border-2 border-black shrink-0 shadow-[0_2px_0_#000] mt-0.5 sm:mt-0">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden space-y-0.5">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase text-amber-400 font-mario shrink-0">
                          QUICK RESUME SESSION
                        </span>
                        <span className="text-slate-400 text-xs font-bold truncate max-w-[200px] sm:max-w-none">
                          · {lastStudiedTopic.badge}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white font-display truncate block max-w-full">
                        {lastStudiedTopic.title}
                      </h3>
                      <p className="text-xs text-slate-300 font-medium line-clamp-1 block max-w-full overflow-hidden text-ellipsis">
                        {lastStudiedTopic.summary}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid="quick-resume-btn"
                    onClick={() => {
                      marioAudio.playPipe();
                      handleRecordAccessedTopic(lastStudiedTopic.id);
                      setActiveWorld(lastStudiedTopic.worldId);
                      setActiveTab('modules');
                      setTimeout(() => {
                        const el = document.getElementById(`topic-card-${lastStudiedTopic.id}`);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          el.classList.add('ring-4', 'ring-amber-400');
                          setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 2500);
                        }
                      }, 150);
                    }}
                    className="min-h-[44px] px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl border-2 border-black shadow-[0_2px_0_#000] cursor-pointer flex items-center gap-2 shrink-0 active:translate-y-0.5 whitespace-nowrap self-stretch md:self-auto justify-center"
                  >
                    <span>Resume Where You Left Off</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {/* Daily Study Goal Progress Ring Widget */}
            <DailyStudyGoalRing
              studiedSeconds={getTodayStudiedSeconds(profileStats)}
              onEarnCoins={handleEarnCoins}
              superStarActive={superStarStatus.isActive}
            />

            <WorldMap
              onSelectWorld={handleMapWorldSelect}
              onSelectTopic={(worldId, topicId) => {
                setActiveWorld(worldId);
                setActiveTab('modules');
                marioAudio.syncModuleAudio(worldId, true);
                setTimeout(() => {
                  const el = document.getElementById(`topic-card-${topicId}`);
                  el?.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              activeWorld={activeWorld}
              fontSize={fontSize}
              equippedAvatar={equippedAvatar}
              setEquippedAvatar={setEquippedAvatar}
              completedTopicIds={completedTopicIds}
              onToggleTopicComplete={handleToggleTopicComplete}
              onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
              onOpenProfile={() => setIsProfileOpen(true)}
              unlockedAchievementsCount={unlockedAchievementsCount}
              loginStreak={loginStreak}
              onStartQuickStudy={handleStartQuickStudy}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              shortcutMapActive={shortcutMapActive}
              needsImprovementCount={
                (profileStats.needsImprovementTopicIds?.length || 0) +
                (profileStats.needsImprovementWorlds?.length || 0)
              }
              onEarnCoins={handleEarnCoins}
              superStarActive={superStarStatus.isActive}
            />


            {/* Quick Access Portal Banners — Equal Height & Aligned Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('modules');
                  setActiveWorld('all');
                  marioAudio.playTabSwitch();
                }}
                className="h-full text-left bg-white rounded-2xl p-4 border-4 border-slate-950 shadow-[4px_4px_0_#000] hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 bg-red-100 border-2 border-red-700 rounded-xl flex items-center justify-center shrink-0">
                    <MarioMushroomIcon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-950 text-sm sm:text-base font-display truncate">All 6 Worlds</h3>
                    <p className="text-xs font-bold text-slate-600 truncate">Full statutory guide</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-red-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('holidays');
                  marioAudio.playTabSwitch();
                }}
                className="h-full text-left bg-white rounded-2xl p-4 border-4 border-slate-950 shadow-[4px_4px_0_#000] hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 bg-rose-100 border-2 border-rose-700 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-rose-700" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-950 text-sm sm:text-base font-display truncate">Holidays Hub</h3>
                    <p className="text-xs font-bold text-slate-600 truncate">12 Regular & Special</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-rose-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('shop');
                  marioAudio.playCoin();
                }}
                className="h-full text-left bg-white rounded-2xl p-4 border-4 border-slate-950 shadow-[4px_4px_0_#000] hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 bg-emerald-100 border-2 border-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-6 h-6 text-emerald-800" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-950 text-sm sm:text-base font-display truncate">Toad&apos;s Shop</h3>
                    <p className="text-xs font-bold text-slate-600 truncate">34 Heroes &amp; Perks</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('vault');
                  marioAudio.playCardAction();
                }}
                className="h-full text-left bg-white rounded-2xl p-4 border-4 border-slate-950 shadow-[4px_4px_0_#000] hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 bg-amber-100 border-2 border-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <MarioStarIcon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-950 text-sm sm:text-base font-display truncate">Game Vault</h3>
                    <p className="text-xs font-bold text-slate-600 truncate">17 Arcade Games</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('quiz');
                  marioAudio.playCardAction();
                }}
                className="h-full text-left bg-white rounded-2xl p-4 border-4 border-slate-950 shadow-[4px_4px_0_#000] hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 bg-red-100 border-2 border-red-800 rounded-xl flex items-center justify-center shrink-0">
                    <Flame className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-950 text-sm sm:text-base font-display truncate">Boss &amp; Quiz</h3>
                    <p className="text-xs font-bold text-slate-600 truncate">189+ Bar Scenarios</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-red-700 shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: All Unabridged Modules View */}
        {activeTab === 'modules' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Breadcrumb Navigation Trail with Horizontal Scroll & Equal Flex-Grow Segments */}
            <div className="w-full overflow-x-auto no-scrollbar py-0.5">
              <nav
                aria-label="Module Breadcrumb Navigation"
                data-testid="modules-breadcrumb-nav"
                className="bg-white rounded-2xl border-3 border-slate-950 p-1.5 sm:p-2.5 shadow-[3px_3px_0_#000] flex items-stretch gap-1.5 sm:gap-2 min-w-max text-xs font-black text-slate-800"
              >
                <button
                  type="button"
                  onClick={() => {
                    handleWorldSelect('all');
                  }}
                  className={`flex-1 grow shrink-0 w-36 min-w-[140px] max-w-[155px] h-11 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-center ${
                    activeWorld === 'all'
                      ? 'bg-amber-400 text-slate-950 border-2 border-black shadow-[0_2px_0_#000] font-black'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
                  }`}
                >
                  <MarioMushroomIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">All 6 Worlds</span>
                </button>

                <div className="flex items-center text-slate-400 font-bold select-none px-0.5">/</div>

                {WORLDS_METADATA.map((w) => {
                  const isCurActive = activeWorld === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        handleWorldSelect(w.id);
                      }}
                      className={`flex-1 grow shrink-0 w-36 min-w-[140px] max-w-[155px] h-11 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer text-center ${
                        isCurActive
                          ? 'bg-red-600 text-white border-2 border-black shadow-[0_2px_0_#000] font-black'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
                      }`}
                    >
                      {renderWorldIcon(w.iconType, 'w-3.5 h-3.5 shrink-0')}
                      <span className="whitespace-nowrap">W{w.worldNumber}:</span>
                      <span className="truncate">{w.shortTitle}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Jump Searchable Dropdown Menu */}
            <div
              data-testid="modules-quick-jump-container"
              className="bg-amber-400/95 border-3 border-slate-950 rounded-2xl p-2.5 sm:p-3 shadow-[3px_3px_0_#000] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_1px_0_#000]">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-950 font-mario block">
                    TOPIC QUICK JUMP
                  </span>
                  <span className="text-xs font-bold text-slate-900 hidden sm:inline">
                    Instantly jump to any Labor Standards topic card
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 md:max-w-xl">
                <div className="relative w-full sm:w-44 shrink-0">
                  <input
                    type="text"
                    value={quickJumpSearch}
                    onChange={(e) => setQuickJumpSearch(e.target.value)}
                    placeholder="Filter topics..."
                    aria-label="Filter Quick Jump Topics"
                    className="w-full h-11 bg-white text-slate-950 placeholder:text-slate-500 text-xs font-bold border-2 border-slate-950 rounded-xl px-3 py-1 shadow-[0_2px_0_#000] focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  {quickJumpSearch && (
                    <button
                      type="button"
                      onClick={() => setQuickJumpSearch('')}
                      className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-800 text-xs font-bold cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="relative flex-1 w-full">
                  <select
                    data-testid="quick-jump-select"
                    aria-label="Quick Jump to Topic Card"
                    value=""
                    onChange={(e) => {
                      const topicId = e.target.value;
                      if (!topicId) return;
                      handleRecordAccessedTopic(topicId);
                      marioAudio.playPipe();
                      const targetTopic = ALL_LAW_TOPICS.find((t) => t.id === topicId);
                      if (targetTopic) {
                        if (activeWorld !== 'all' && activeWorld !== targetTopic.worldId) {
                          setActiveWorld(targetTopic.worldId);
                        }
                        setTimeout(() => {
                          const el = document.getElementById(`topic-card-${topicId}`);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            el.classList.add('ring-4', 'ring-amber-400');
                            setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 2500);
                          }
                        }, 120);
                      }
                    }}
                    className="w-full min-h-[44px] h-11 bg-white text-slate-950 text-xs sm:text-sm font-bold border-2 border-slate-950 rounded-xl px-3 py-2 pr-8 shadow-[0_2px_0_#000] cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-600 truncate"
                  >
                    <option value="" disabled>
                      {quickJumpFilteredTopics.length === 0
                        ? '-- No Matching Topics Found --'
                        : `-- Jump to Topic (${quickJumpFilteredTopics.length} available) --`}
                    </option>
                    {WORLDS_METADATA.map((world) => {
                      const worldTopics = quickJumpFilteredTopics.filter((t) => t.worldId === world.id);
                      if (worldTopics.length === 0) return null;
                      return (
                        <optgroup key={world.id} label={`World ${world.worldNumber}: ${world.title}`}>
                          {worldTopics.map((top) => (
                            <option key={top.id} value={top.id}>
                              {top.badge} — {top.title}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar with Equipped Avatar */}
            <StageProgressBar
              completedCount={completedTopicIds.length}
              totalTopics={ALL_LAW_TOPICS.length}
              completedTopicIds={completedTopicIds}
              onSelectWorld={(worldId) => {
                setActiveWorld(worldId);
                marioAudio.syncModuleAudio(worldId, true);
              }}
              onResetProgress={handleResetProgress}
              onMarkAllComplete={handleMarkAllComplete}
              fontSize={fontSize}
              avatar={equippedAvatar}
              onOpenExportProgress={() => setIsExportModalOpen(true)}
            />

            {/* Stage Select Banner */}
            <div className="bg-white rounded-3xl mario-card border-4 border-slate-950 p-4 sm:p-6 md:p-8 shadow-[6px_6px_0_#000]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-slate-200 pb-4 mb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-600 text-white font-black rounded-lg border border-black text-[11px] uppercase mb-1.5 font-mario">
                    <MarioMushroomIcon className="w-3.5 h-3.5" />
                    <span>PHILIPPINE LABOR STANDARDS</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight font-display">
                    LABOR STANDARDS & PROTECTIVE LAWS
                  </h1>
                  <p className={`${bodyTextClass} text-slate-700 font-bold mt-1 max-w-2xl text-xs sm:text-sm`}>
                    100% Unabridged memory aid with zero omissions: statutory provisions, standards, exceptions, and wage formulas.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                  {/* Direct Legal Glossary Quick Launcher (Zero Scroll Needed) */}
                  <button
                    type="button"
                    data-testid="modules-top-glossary-btn"
                    onClick={() => {
                      setIsQuickGlossaryOpen(true);
                      marioAudio.playPowerUp();
                    }}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-2xl text-xs font-black font-mario bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-black shadow-[0_2px_0_#000] cursor-pointer inline-flex items-center gap-1.5 transition-all whitespace-nowrap active:translate-y-0.5"
                  >
                    <MarioQuestionBlockIcon className="w-4 h-4 text-slate-950 shrink-0" />
                    <span>GLOSSARY</span>
                  </button>

                  {/* Split View Toggle for Integrated Reading & Note-taking */}
                  <button
                    type="button"
                    data-testid="toggle-split-view-btn"
                    onClick={() => {
                      setIsSplitView(!isSplitView);
                      marioAudio.playPipe();
                    }}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-2xl text-xs font-black border-2 border-black cursor-pointer inline-flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      isSplitView
                        ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                        : 'bg-slate-900 text-slate-200 hover:text-white'
                    }`}
                  >
                    <Columns className="w-4 h-4 text-amber-400" />
                    <span>{isSplitView ? 'Split View ON' : 'Split View'}</span>
                  </button>

                  {/* Complexity Quick Switcher in Modules Header */}
                  <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border-2 border-black">
                    <span className="text-[10px] font-black uppercase text-amber-400 font-mario pl-2">MODE:</span>
                    <button
                      onClick={() => handleSetComplexityMode('beginner')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        complexityMode === 'beginner'
                          ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <MarioMushroomIcon className="w-3.5 h-3.5" />
                      <span>Beginner</span>
                    </button>
                    <button
                      onClick={() => handleSetComplexityMode('advanced')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        complexityMode === 'advanced'
                          ? 'bg-red-600 text-white shadow-[0_2px_0_#000]'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Advanced</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* World Selector Stage Buttons - Mobile Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-2.5">
                <button
                  onClick={() => handleWorldSelect('all')}
                  className={`p-2.5 sm:p-3 rounded-2xl border-2 sm:border-3 border-black text-left transition-all cursor-pointer ${
                    activeWorld === 'all'
                      ? 'bg-amber-400 text-slate-950 shadow-[0_3px_0_#000] -translate-y-0.5'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase text-slate-600 block font-mario">ALL WORLDS</span>
                  <span className="font-black text-xs sm:text-sm flex items-center justify-between mt-1">
                    <span>Complete View</span>
                    <MarioStarIcon className="w-4 h-4 flex-shrink-0" />
                  </span>
                </button>

                {WORLDS_METADATA.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => handleWorldSelect(w.id)}
                    className={`p-2.5 sm:p-3 rounded-2xl border-2 sm:border-3 border-black text-left transition-all cursor-pointer ${
                      activeWorld === w.id
                        ? 'bg-amber-400 text-slate-950 shadow-[0_3px_0_#000] -translate-y-0.5'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase text-slate-600 block font-mario">
                      WORLD {w.worldNumber}
                    </span>
                    <span className="font-black text-xs sm:text-sm flex items-center justify-between mt-1">
                      <span className="truncate">{w.shortTitle}</span>
                      {renderWorldIcon(w.iconType, 'w-4 h-4 flex-shrink-0')}
                    </span>
                  </button>
                ))}
              </div>

              {/* Dynamic Difficulty Filters: All, Foundation, Intermediate, Bar Master */}
              <div
                data-testid="difficulty-filter-container"
                className="mt-4 pt-3.5 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-800 font-mario flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>FILTER BY STATUTORY COMPLEXITY:</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'All Difficulties' },
                    { id: 'Foundation', label: 'Foundation' },
                    { id: 'Intermediate', label: 'Intermediate' },
                    { id: 'Bar Master', label: 'Bar Master' },
                  ].map((diff) => {
                    const isSel = difficultyFilter === diff.id;
                    const testId = `difficulty-filter-${diff.id.toLowerCase().replace(/\s+/g, '')}`;
                    return (
                      <button
                        key={diff.id}
                        type="button"
                        data-testid={testId}
                        onClick={() => {
                          setDifficultyFilter(diff.id as any);
                          marioAudio.playCoin();
                        }}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-black text-xs border-2 transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                          isSel
                            ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        {diff.id === 'Bar Master' ? (
                          <MarioStarIcon className="w-3 h-3 text-amber-500 shrink-0" />
                        ) : diff.id === 'Foundation' ? (
                          <MarioMushroomIcon className="w-3 h-3 text-emerald-600 shrink-0" />
                        ) : diff.id === 'Intermediate' ? (
                          <MarioFireFlowerIcon className="w-3 h-3 text-red-600 shrink-0" />
                        ) : null}
                        <span>{diff.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Study Layout & Completion Status Toolbar */}
            <div
              data-testid="module-view-options-bar"
              className="bg-slate-900 text-white rounded-2xl p-3 sm:p-4 border-3 border-slate-950 shadow-[4px_4px_0_#000] flex flex-col xl:flex-row xl:items-center justify-between gap-3"
            >
              {/* Left: View Layout Selector */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-amber-300 mr-1">View Mode:</span>
                {(
                  [
                    { id: 'stream' as const, label: 'Full Stream', icon: <BookOpen className="w-3.5 h-3.5 shrink-0" /> },
                    { id: 'grid' as const, label: '2-Col Grid', icon: <LayoutGrid className="w-3.5 h-3.5 shrink-0" /> },
                    { id: 'outline' as const, label: 'Compact Outline', icon: <List className="w-3.5 h-3.5 shrink-0" /> },
                    { id: 'focus' as const, label: 'Focus Reader', icon: <Compass className="w-3.5 h-3.5 shrink-0" /> },
                  ]
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    data-testid={`module-view-mode-${mode.id}`}
                    onClick={() => {
                      setModuleViewMode(mode.id);
                      if (mode.id === 'outline') {
                        setExpandCollapseSignal((prev) => ({
                          mode: 'collapse',
                          seq: (prev?.seq || 0) + 1,
                        }));
                      } else if (mode.id === 'stream' || mode.id === 'focus') {
                        setExpandCollapseSignal((prev) => ({
                          mode: 'expand',
                          seq: (prev?.seq || 0) + 1,
                        }));
                      }
                      marioAudio.playClick();
                    }}
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5 border transition-colors cursor-pointer whitespace-nowrap ${
                      moduleViewMode === mode.id
                        ? 'bg-amber-400 text-slate-950 border-black'
                        : 'bg-slate-800 text-slate-200 hover:text-white border-slate-700'
                    }`}
                  >
                    {mode.icon}
                    <span>{mode.label}</span>
                  </button>
                ))}

                <div className="inline-flex items-center gap-1 ml-0 sm:ml-1">
                  <button
                    type="button"
                    data-testid="modules-expand-all-btn"
                    onClick={() => {
                      setExpandCollapseSignal((prev) => ({
                        mode: 'expand',
                        seq: (prev?.seq || 0) + 1,
                      }));
                      marioAudio.playJump();
                    }}
                    className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <ChevronsDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Expand All</span>
                  </button>
                  <button
                    type="button"
                    data-testid="modules-collapse-all-btn"
                    onClick={() => {
                      setExpandCollapseSignal((prev) => ({
                        mode: 'collapse',
                        seq: (prev?.seq || 0) + 1,
                      }));
                      marioAudio.playPipe();
                    }}
                    className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <ChevronsUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Collapse All</span>
                  </button>
                </div>
              </div>

              {/* Right: Completion Status Filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400 mr-1">Status:</span>
                {(
                  [
                    { id: 'all' as const, label: 'All' },
                    { id: 'unread' as const, label: 'Unread' },
                    { id: 'mastered' as const, label: 'Mastered' },
                    { id: 'flagged' as const, label: 'Flagged Review' },
                  ]
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    data-testid={`module-status-filter-${st.id}`}
                    onClick={() => {
                      setModuleStatusFilter(st.id);
                      marioAudio.playClick();
                    }}
                    className={`min-h-[38px] px-3 py-1 rounded-xl text-xs font-black border transition-colors cursor-pointer whitespace-nowrap ${
                      moduleStatusFilter === st.id
                        ? 'bg-emerald-400 text-slate-950 border-black'
                        : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Smooth Slide-In Container on World / Topic Filter Switch */}
            <div
              key={`module-stream-${activeWorld}-${difficultyFilter}-${complexityMode}-${moduleViewMode}-${moduleStatusFilter}`}
              data-testid="module-doctrine-transition"
              className="space-y-6 animate-module-slide-in"
            >
              {/* Active World Spotlight Banner */}
              {activeWorld !== 'all' && (
                <div className="bg-[#1e293b] text-white rounded-2xl p-4 sm:p-5 border-3 border-black shadow-[4px_4px_0_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center flex-shrink-0">
                      {renderWorldIcon(
                        WORLDS_METADATA.find((w) => w.id === activeWorld)?.iconType || 'mushroom',
                        'w-6 h-6'
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-amber-300 font-display">
                        {WORLDS_METADATA.find((w) => w.id === activeWorld)?.title}
                      </h2>
                      <p className="text-xs sm:text-sm font-semibold text-slate-300">
                        {WORLDS_METADATA.find((w) => w.id === activeWorld)?.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleWorldSelect('all')}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-black rounded-xl border border-white/40 cursor-pointer self-end sm:self-auto flex-shrink-0"
                  >
                    Show All Worlds
                  </button>
                </div>
              )}

              {/* Topics Stream with Optional Side-by-Side Split View Notes Workspace */}
              {displayedTopics.length > 0 ? (
                <div className={isSplitView ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start' : 'space-y-6'}>
                  <div
                    className={`${
                      isSplitView
                        ? 'lg:col-span-7 space-y-6'
                        : moduleViewMode === 'grid'
                        ? 'grid grid-cols-1 xl:grid-cols-2 gap-5 items-start'
                        : moduleViewMode === 'outline'
                        ? 'space-y-3.5'
                        : 'space-y-6'
                    } module-doctrine-stream`}
                  >
                    {moduleViewMode === 'focus' ? (
                      (() => {
                        const clampedIdx = Math.min(
                          Math.max(0, focusTopicIdx),
                          displayedTopics.length - 1
                        );
                        const focusedTopic = displayedTopics[clampedIdx];
                        return (
                          <div data-testid="module-focus-reader" className="space-y-4">
                            <div className="bg-slate-900 text-white rounded-2xl p-3 sm:p-4 border-2 border-slate-950 flex flex-wrap items-center justify-between gap-3">
                              <button
                                type="button"
                                disabled={clampedIdx === 0}
                                onClick={() => {
                                  setFocusTopicIdx((i) => Math.max(0, i - 1));
                                  marioAudio.playPipe();
                                }}
                                className="min-h-[42px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-black text-xs border border-slate-600 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                              >
                                <ChevronLeft className="w-4 h-4 shrink-0" />
                                <span>Previous Module</span>
                              </button>

                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs font-black text-amber-300 tabular-nums whitespace-nowrap">
                                  Module {clampedIdx + 1} of {displayedTopics.length}
                                </span>
                                <select
                                  aria-label="Select focus module"
                                  value={clampedIdx}
                                  onChange={(e) => {
                                    setFocusTopicIdx(Number(e.target.value) || 0);
                                    marioAudio.playClick();
                                  }}
                                  className="min-h-[40px] max-w-[200px] sm:max-w-xs rounded-xl bg-slate-950 border border-slate-700 px-3 text-xs font-bold text-white"
                                >
                                  {displayedTopics.map((item, idx) => (
                                    <option key={item.id} value={idx}>
                                      {idx + 1}. {item.title}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <button
                                type="button"
                                disabled={clampedIdx >= displayedTopics.length - 1}
                                onClick={() => {
                                  setFocusTopicIdx((i) =>
                                    Math.min(displayedTopics.length - 1, i + 1)
                                  );
                                  marioAudio.playPipe();
                                }}
                                className="min-h-[42px] px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                              >
                                <span>Next Module</span>
                                <ChevronRight className="w-4 h-4 shrink-0" />
                              </button>
                            </div>

                            {focusedTopic && (
                              <TopicCard
                                key={focusedTopic.id}
                                topic={focusedTopic}
                                fontSize={fontSize}
                                searchQuery={searchQuery}
                                isCompleted={completedTopicIds.includes(focusedTopic.id)}
                                onToggleComplete={() => handleToggleTopicComplete(focusedTopic.id)}
                                complexityMode={complexityMode}
                                showLegalCitations={showLegalCitations}
                                needsImprovement={Boolean(
                                  profileStats.needsImprovementTopicIds?.includes(focusedTopic.id)
                                )}
                                onToggleNeedsImprovement={() =>
                                  handleToggleNeedsImprovementTopic(focusedTopic.id)
                                }
                                shortcutMapActive={shortcutMapActive}
                                equippedCardFrame={equippedCardFrame}
                                expandCollapseSignal={expandCollapseSignal}
                                compactView={false}
                              />
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      displayedTopics.map((topic) => (
                        <TopicCard
                          key={topic.id}
                          topic={topic}
                          fontSize={fontSize}
                          searchQuery={searchQuery}
                          isCompleted={completedTopicIds.includes(topic.id)}
                          onToggleComplete={() => handleToggleTopicComplete(topic.id)}
                          complexityMode={complexityMode}
                          showLegalCitations={showLegalCitations}
                          needsImprovement={Boolean(
                            profileStats.needsImprovementTopicIds?.includes(topic.id)
                          )}
                          onToggleNeedsImprovement={() =>
                            handleToggleNeedsImprovementTopic(topic.id)
                          }
                          shortcutMapActive={shortcutMapActive}
                          equippedCardFrame={equippedCardFrame}
                          expandCollapseSignal={expandCollapseSignal}
                          compactView={moduleViewMode === 'outline'}
                        />
                      ))
                    )}
                  </div>

                  {isSplitView && (
                    <div className="lg:col-span-5 sticky top-20">
                      <IntegratedStudyNotesPanel
                        activeWorld={activeWorld}
                        onCloseSplitView={() => setIsSplitView(false)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl mario-card border-4 border-slate-900 p-8 sm:p-12 text-center space-y-4">
                  <div className="w-14 h-14 bg-red-100 rounded-full border-2 border-red-500 mx-auto flex items-center justify-center">
                    <MarioMushroomIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                    No doctrines matched &quot;{searchQuery}&quot;
                  </h3>
                  <p className="text-slate-600 font-semibold max-w-md mx-auto text-sm">
                    Try searching for keywords like &quot;overtime&quot;, &quot;maternity&quot;, &quot;kasambahay&quot;, &quot;service charge&quot;, &quot;lactation&quot;, or &quot;distortion&quot;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="min-h-[44px] px-6 py-2.5 bg-amber-400 text-slate-950 font-black rounded-xl border-2 border-black cursor-pointer shadow-[0_2px_0_#000]"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Toad's Item Shop */}
        {activeTab === 'shop' && (
          <ToadShop
            coins={coins}
            setCoins={setCoins}
            activeTheme={activeTheme}
            setActiveTheme={setActiveTheme}
            equippedAvatar={equippedAvatar}
            setEquippedAvatar={setEquippedAvatar}
            superStarEndsAt={superStarEndsAt}
            onActivateSuperStar={handleActivateSuperStar}
            shortcutMapActive={shortcutMapActive}
            onToggleShortcutMap={handleToggleShortcutMap}
            equippedCompanion={equippedCompanion}
            onEquipCompanion={handleEquipCompanion}
            equippedCardFrame={equippedCardFrame}
            onEquipCardFrame={handleEquipCardFrame}
            onBoostStreak={handleBoostStreak}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />
        )}

        {/* Tab 3: Warp Zone Multiplier & Wage Calculator */}
        {activeTab === 'calculator' && (
          <BenefitsCalculator fontSize={fontSize} />
        )}

        {/* Tab 4: Regional Wage Matrix */}
        {activeTab === 'wages_matrix' && (
          <RegionalWageMatrix fontSize={fontSize} />
        )}

        {/* Tab 5: [ ? ] Mystery Block Flashcards & 5-Min Quick Study Mode */}
        {activeTab === 'flashcards' && (
          <FlashcardsView
            fontSize={fontSize}
            onEarnCoin={handleEarnCoin}
            onEarnCoins={handleEarnCoins}
            studyDifficulty={studyDifficulty}
            setStudyDifficulty={handleSetStudyDifficulty}
            activeWorld={activeWorld}
            profileStats={profileStats}
            completedTopicIds={completedTopicIds}
            onToggleNeedsImprovementWorld={handleToggleNeedsImprovementWorld}
            onToggleNeedsImprovementTopic={handleToggleNeedsImprovementTopic}
            onOpenProfile={() => setIsProfileOpen(true)}
            quickStudyLaunchId={quickStudyLaunchId}
          />
        )}

        {/* Tab 6: Mario Arcade Game Vault (17 Total Games) */}
        {(activeTab === 'vault' || activeTab === 'game2d' || activeTab === 'game3d') && (
          <GameVault
            equippedAvatar={equippedAvatar}
            setEquippedAvatar={setEquippedAvatar}
            coins={coins}
            setCoins={handleArcadeSetCoins}
            fontSize={fontSize}
            onQuizCompleted={handleQuizCompleted}
          />
        )}

        {/* Tab 7: Dedicated Philippine Holidays Hub */}
        {activeTab === 'holidays' && (
          <HolidaysView fontSize={fontSize} onEarnCoins={handleEarnCoins} />
        )}

        {/* Tab 8: Castle Quest & Boss Battle */}
        {activeTab === 'quiz' && (
          <BarQuizQuest
            fontSize={fontSize}
            onEarnCoins={handleEarnCoins}
            activeWorld={activeWorld}
            onChangeActiveWorld={setActiveWorld}
            studyDifficulty={studyDifficulty}
            setStudyDifficulty={handleSetStudyDifficulty}
            onQuizCompleted={handleQuizCompleted}
            onOpenProfile={() => setIsProfileOpen(true)}
            unlockedAchievementsCount={unlockedAchievementsCount}
            needsImprovementTopicIds={profileStats.needsImprovementTopicIds}
            needsImprovementWorlds={profileStats.needsImprovementWorlds}
          />
        )}

        {/* Tab 9: Complete Legal Citations & Exact Verbatim Statutory Provisions */}
        {activeTab === 'citations' && (
          <div className="bg-[#1e293b] rounded-3xl border-4 border-slate-950 p-4 sm:p-6 text-white shadow-[6px_6px_0_#000]">
            <CitationsView
              onSelectTopic={(worldId, topicId) => {
                setActiveWorld(worldId);
                setActiveTab('modules');
                marioAudio.syncModuleAudio(worldId, true);
                setTimeout(() => {
                  const el = document.getElementById(`topic-card-${topicId}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('ring-4', 'ring-amber-400');
                    setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 2500);
                  }
                }, 150);
              }}
              onOpenPrintGuide={() => setIsPrintGuideOpen(true)}
            />
          </div>
        )}
        </div>
      </main>

      {/* Achievement Unlocked Celebration Toast */}
      {achievementBanner && (
        <div
          role="status"
          data-testid="achievement-unlocked-toast"
          className="fixed top-28 right-3 left-3 sm:left-auto sm:top-28 sm:right-6 z-40 sm:max-w-sm bg-[#0f172a] text-white rounded-2xl border-3 border-amber-400 shadow-[6px_6px_0_#000] p-3.5 flex items-start gap-3 print:hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
              ACHIEVEMENT UNLOCKED!
            </span>
            <p className="text-sm font-black text-white font-display truncate">
              {achievementBanner.title}
            </p>
            <p className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <span>{achievementBanner.milestoneLabel}</span>
              <span className="inline-flex items-center gap-0.5 text-amber-300 font-black">
                <MarioCoinIcon className="w-3 h-3" />+{achievementBanner.coinReward}
              </span>
            </p>
            <button
              type="button"
              onClick={() => {
                setAchievementBanner(null);
                setIsProfileOpen(true);
              }}
              className="text-xs font-black text-emerald-300 hover:text-emerald-200 pt-0.5 cursor-pointer"
            >
              View Profile Badges →
            </button>
          </div>
          <button
            type="button"
            onClick={() => setAchievementBanner(null)}
            aria-label="Dismiss Achievement Notification"
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* User Profile & Milestone Achievements Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        stats={profileStats}
        onUpdatePlayerName={handleUpdatePlayerName}
        achievements={achievementSync.achievements}
        equippedAvatar={equippedAvatar}
        onSelectAvatar={handleSelectAvatarPersist}
        coins={coins}
        loginStreak={loginStreak}
        completedTopicsCount={completedTopicIds.length}
        completedTopicIds={completedTopicIds}
        totalTopicsCount={ALL_LAW_TOPICS.length}
        onNavigateAction={(tab, worldId) => {
          setActiveTab(tab);
          if (worldId) setActiveWorld(worldId);
          marioAudio.playTabSwitch();
        }}
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
        onOpenExportScoreCard={() => setIsExportModalOpen(true)}
        onToggleNeedsImprovementTopic={handleToggleNeedsImprovementTopic}
        onToggleNeedsImprovementWorld={handleToggleNeedsImprovementWorld}
        onStartQuickStudy={() => {
          setIsProfileOpen(false);
          handleStartQuickStudy();
        }}
        onOpenLeaderboard={() => {
          setIsProfileOpen(false);
          setIsLeaderboardOpen(true);
        }}
      />

      {/* Global Coin Leaderboard Modal */}
      <CoinLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        playerName={profileStats.playerName}
        onUpdatePlayerName={handleUpdatePlayerName}
        equippedAvatar={equippedAvatar}
        coins={coins}
        streakDays={loginStreak}
        completedTopicsCount={completedTopicIds.length}
      />

      {/* First-Time & On-Demand Complete 10-Chapter App Walkthrough Guide */}
      <AppWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => handleCompleteWalkthrough()}
        onCompleteWalkthrough={handleCompleteWalkthrough}
        colorMode={colorMode}
        onToggleColorMode={(m) => handleToggleColorMode(m)}
        studyDifficulty={studyDifficulty}
        onSelectDifficulty={handleSetStudyDifficulty}
        equippedAvatar={equippedAvatar}
        onSelectAvatar={handleSelectAvatarPersist}
        alreadyGraduated={profileStats.walkthroughCompleted}
      />

      {/* Daily Login Reward Modal */}
      <DailyRewardModal
        isOpen={isDailyRewardOpen}
        onClose={() => setIsDailyRewardOpen(false)}
        coins={coins}
        setCoins={setCoins}
        streak={loginStreak}
        isBonusClaimedToday={isBonusClaimedToday}
        onClaimSuccess={(updatedStreak) => {
          setLoginStreak(updatedStreak);
          setIsBonusClaimedToday(true);
        }}
      />

      {/* Export Player Score Card Modal */}
      <ExportProgressModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        completedTopicIds={completedTopicIds}
        coins={coins}
        playerName={profileStats.playerName}
        equippedAvatar={equippedAvatar}
        loginStreak={loginStreak}
        unlockedAchievementsCount={unlockedAchievementsCount}
        totalAchievementsCount={achievementSync.achievements.length}
        quizRunsCompleted={profileStats.quizzesCompleted}
        studiedSeconds={profileStats.studiedSeconds}
      />

      {/* Global Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onSelectResult={(tab, targetId) => {
          setActiveTab(tab);
          if (targetId) {
            setActiveWorld('all');
            setTimeout(() => {
              const el = document.getElementById(`topic-card-${targetId}`);
              el?.scrollIntoView({ behavior: 'smooth' });
            }, 150);
          }
        }}
        onOpenPrintGuide={() => setIsPrintGuideOpen(true)}
        onOpenShop={() => {
          setActiveTab('shop');
          marioAudio.playCoin();
        }}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onStartQuickStudy={handleStartQuickStudy}
      />

      {/* Print Study Guide & PDF Generator Modal */}
      <PrintStudyGuideModal
        isOpen={isPrintGuideOpen}
        onClose={() => setIsPrintGuideOpen(false)}
        completedTopicIds={completedTopicIds}
        coins={coins}
        studyNotes={studyNotes}
      />

      {/* World Completion 'Level Up' Celebration Modal */}
      <LevelUpModal
        worldId={levelUpCelebration.worldId}
        bonusCoins={levelUpCelebration.bonusCoins}
        onClose={() => {
          setLevelUpCelebration({ worldId: null, bonusCoins: 0 });
          setShowCoinConfetti(false);
        }}
        onOpenWorldMap={() => {
          setActiveTab('map');
          marioAudio.playTabSwitch();
        }}
      />

      {/* Complete Legal Citations Repertory Modal */}
      <LegalCitationsModal
        isOpen={isLegalCitationsOpen}
        onClose={() => setIsLegalCitationsOpen(false)}
        onSelectTopic={(worldId, topicId) => {
          setActiveWorld(worldId);
          setActiveTab('modules');
          marioAudio.syncModuleAudio(worldId, true);
          setTimeout(() => {
            const el = document.getElementById(`topic-card-${topicId}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('ring-4', 'ring-amber-400');
              setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 2500);
            }
          }, 150);
        }}
      />

      {/* Global Mushroom Kingdom Legal Glossary Modal */}
      <QuickGlossaryModal
        isOpen={isQuickGlossaryOpen}
        onClose={() => setIsQuickGlossaryOpen(false)}
      />

      {/* Mario Golden Coin Confetti Animation */}
      <CoinConfetti
        active={showCoinConfetti}
        particlesOnly={Boolean(levelUpCelebration.worldId)}
        onComplete={() => setShowCoinConfetti(false)}
      />

      {/* Persistent Floating Right-Side 'Study Notes' Drawer */}
      <StudyNotesDrawer
        activeWorld={activeWorld}
        activeTab={activeTab}
        onNotesChange={setStudyNotes}
      />

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Floating Auto-Scroll Speed Controller */}
      <AutoScrollController />

      {/* Summoned Study Companion Desk Widget (coordinated so it never overlaps Toad's Pro Tip on Map) */}
      {equippedCompanion !== 'comp_none' && (
        <button
          type="button"
          onClick={handleStartQuickStudy}
          data-testid="study-companion-widget"
          title="Study Companion Active — Click to launch a 5-Min Quick Study Sprint!"
          className={`${
            activeTab === 'map'
              ? showToadTip
                ? 'hidden xl:flex bottom-6 left-[436px]'
                : 'hidden sm:flex bottom-40 lg:bottom-20 left-6'
              : 'hidden sm:flex bottom-20 lg:bottom-5 left-4'
          } fixed z-30 bg-[#0f172a] hover:bg-slate-900 text-white border-2 border-amber-400 rounded-2xl px-3 py-2 shadow-[4px_4px_0_#000] items-center gap-2.5 cursor-pointer transition-transform hover:-translate-y-0.5 print:hidden`}
        >
          <div className="w-8 h-8 rounded-xl bg-amber-400 border border-black flex items-center justify-center shrink-0">
            <MarioCharacterAvatar
              character={
                equippedCompanion === 'comp_baby_yoshi'
                  ? 'goldenyoshi'
                  : equippedCompanion === 'comp_luma'
                  ? 'cosmicrosalina'
                  : equippedCompanion === 'comp_counsel_toad'
                  ? 'lawyertoad'
                  : equippedCompanion === 'comp_polterpup'
                  ? 'boo'
                  : equippedCompanion === 'comp_lakitu'
                  ? 'koopatroopa'
                  : 'bowserjr'
              }
              className="w-6 h-6"
            />
          </div>
          <div className="text-left">
            <span className="text-[9px] font-black uppercase text-amber-300 font-mario block leading-none">
              STUDY COMPANION
            </span>
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1 mt-0.5">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>5-Min Quick Study</span>
            </span>
          </div>
        </button>
      )}

      {/* Mario Ground Footer with Discreet Official 'Created by Matthew' Credit & Group Members */}
      <footer className="mt-16 bg-[#1e293b] border-t-4 border-black text-amber-100 py-8 px-4 pb-24 lg:pb-8 shadow-[0_-4px_0_rgba(0,0,0,0.3)] print:hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-bold text-sm border-b border-slate-700 pb-5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <MarioMushroomIcon className="w-6 h-6 flex-shrink-0" />
              <span className="text-white font-black text-sm sm:text-base font-display">
                SUPER MARIO LABOR ADVENTURE
              </span>
              <span className="text-amber-300 font-semibold hidden sm:inline">
                · Philippine Labor Standards Memory Aid
              </span>
              <span
                data-testid="footer-matthew-credit"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1"
              >
                <MarioStarIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{MAIN_CREATOR_AUTHOR.shortBadge}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-200">Main Creator</span>
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-300 flex-wrap justify-center">
              <span>Hours of Work</span>
              <span aria-hidden="true">·</span>
              <span>Rest &amp; Holidays</span>
              <span aria-hidden="true">·</span>
              <span>Wages &amp; D.O. 174</span>
              <span aria-hidden="true">·</span>
              <span>Special Groups</span>
              <span aria-hidden="true">·</span>
              <span>Protective Laws</span>
              <span aria-hidden="true">·</span>
              <span>Statutory Leaves</span>
            </div>
          </div>

          {/* Group Members Roster in Global Footer */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-300 font-mario">
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                <span>GROUP MEMBERS &amp; AUTHORSHIP</span>
              </div>
              <span className="text-xs font-semibold text-slate-300">
                {MAIN_CREATOR_AUTHOR.fullCredit}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-bold text-slate-100">
              {GROUP_MEMBERS.map((member, index) => {
                const isMainCreator = member === MAIN_CREATOR_AUTHOR.memberListing;
                return (
                  <div
                    key={member}
                    className={`rounded-xl px-3 py-2.5 flex items-center justify-between gap-2 border ${
                      isMainCreator
                        ? 'bg-slate-900 border-amber-400/80 text-amber-200'
                        : 'bg-slate-900/80 border-slate-700 text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-mono text-amber-400 tabular-nums shrink-0">
                        {String(index + 1).padStart(2, '0')}.
                      </span>
                      <span className="truncate">{member}</span>
                    </div>
                    {isMainCreator && (
                      <span className="text-[10px] font-black text-emerald-300 whitespace-nowrap shrink-0">
                        Main Creator
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile-Friendly Bottom Navigation Bar (5 equal columns, >=44px touch targets & notch safe-area padding) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        data-testid="mobile-bottom-nav"
        className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t-2 border-amber-400 px-1 py-1 grid grid-cols-5 w-full gap-1 lg:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.6)] select-none safe-bottom-dock print:hidden"
      >
        {[
          { id: 'map', label: 'Map', icon: <Compass className="w-5 h-5 shrink-0" /> },
          { id: 'modules', label: 'Modules', icon: <BookOpen className="w-5 h-5 shrink-0" /> },
          { id: 'flashcards', label: 'Cards', icon: <HelpCircle className="w-5 h-5 shrink-0" /> },
          { id: 'quiz', label: 'Quiz', icon: <Trophy className="w-5 h-5 shrink-0" /> },
          { id: 'vault', label: 'Arcade', icon: <Gamepad2 className="w-5 h-5 shrink-0" /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                marioAudio.playTabSwitch();
              }}
              className={`min-h-[50px] h-[52px] w-full min-w-0 flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-black shadow-[0_2px_0_#000]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="text-[9.5px] sm:text-[10px] font-black uppercase font-mario mt-0.5 leading-tight truncate max-w-full text-center">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Floating Toad's Pro Tip Dialog on Dashboard (Anchored Bottom-Left with Safe Responsive Containment) */}
      {activeTab === 'map' && showToadTip && (
        <aside
          data-testid="toad-pro-tip-dialog"
          aria-label="Toad's Labor Law Pro Tip"
          onMouseEnter={() => setToadTipTimerPaused(true)}
          onMouseLeave={() => setToadTipTimerPaused(false)}
          className="fixed bottom-28 sm:bottom-24 lg:bottom-6 left-3 right-16 sm:right-auto sm:left-6 z-30 w-auto sm:w-[400px] max-w-[calc(100vw-24px)] sm:max-w-md bg-slate-950/95 text-white border-3 border-amber-400 rounded-2xl p-3 sm:p-4 shadow-[0_12px_32px_rgba(0,0,0,0.8)] backdrop-blur-md animate-toad-pop duration-200 overflow-hidden"
        >
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-red-600 border border-black flex items-center justify-center shrink-0">
                <MarioMushroomIcon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-amber-400 font-mario block truncate">
                  TOAD&apos;S PRO TIP #{toadTipIndex + 1}
                </span>
                <h4 className="text-xs sm:text-sm font-black text-white font-display truncate">
                  {TOAD_PRO_TIPS[toadTipIndex].title}
                </h4>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                marioAudio.playClick();
                setShowToadTip(false);
              }}
              aria-label="Dismiss Toad's Pro Tip"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-medium pt-2 break-words">
            {TOAD_PRO_TIPS[toadTipIndex].tip}
          </p>

          <div className="flex flex-col gap-2 pt-2.5 border-t border-slate-800/80 mt-2.5 text-[11px] min-w-0">
            <div className="flex items-center justify-between gap-2 text-slate-400 font-mono text-[10px] min-w-0">
              <span className="truncate">
                {toadTipTimerPaused ? 'Paused' : 'Auto-hiding'} · Tip {toadTipIndex + 1} of {TOAD_PRO_TIPS.length}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0 max-w-full">
              <div className="flex items-center gap-1.5 min-w-0">
                {/* Favorite Tip Toggle Button */}
                <button
                  type="button"
                  data-testid="toad-favorite-tip-btn"
                  onClick={handleToggleFavoriteTip}
                  title={isCurrentTipFavorited ? 'Remove tip from Favorites' : 'Save tip to Favorites'}
                  aria-label={isCurrentTipFavorited ? 'Remove tip from Favorites' : 'Save tip to Favorites'}
                  className={`p-1.5 rounded-xl border cursor-pointer inline-flex items-center justify-center active:translate-y-0.5 shrink-0 transition-colors ${
                    isCurrentTipFavorited
                      ? 'bg-amber-400 text-slate-950 border-black shadow-[0_1px_0_#000]'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                  }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      isCurrentTipFavorited ? 'fill-slate-950 text-slate-950' : 'text-amber-300'
                    }`}
                  />
                </button>

                {/* Share Tip Button via Web Share API */}
                <button
                  type="button"
                  data-testid="toad-share-tip-btn"
                  onClick={handleShareTip}
                  title="Share this tip via Web Share API or copy snippet"
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl border border-slate-700 cursor-pointer inline-flex items-center gap-1 active:translate-y-0.5 text-[11px] font-sans shrink-0 whitespace-nowrap"
                >
                  <Share2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{toadTipShareSuccess ? 'Shared' : 'Share'}</span>
                </button>

                {/* Copy Icon Button next to Refresh Tip */}
                <button
                  type="button"
                  data-testid="toad-copy-tip-btn"
                  onClick={handleCopyTip}
                  title={toadTipCopied ? 'Copied to clipboard!' : 'Copy tip text to clipboard'}
                  aria-label="Copy tip text to clipboard"
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-slate-700 cursor-pointer inline-flex items-center justify-center active:translate-y-0.5 shrink-0"
                >
                  {toadTipCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-amber-300" />
                  )}
                </button>
              </div>

              {/* Refresh Tip Button */}
              <button
                type="button"
                data-testid="toad-refresh-tip-btn"
                onClick={() => {
                  marioAudio.playCoin();
                  setToadTipIndex((prev) => (prev + 1) % TOAD_PRO_TIPS.length);
                  setShowToadTip(true);
                }}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black shadow-[0_2px_0_#000] cursor-pointer inline-flex items-center gap-1.5 active:translate-y-0.5 text-[11px] font-sans shrink-0 max-w-full whitespace-nowrap"
              >
                <RotateCw className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Refresh Tip</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Reopen Toad's Pro Tip launcher when dialog is hidden on Dashboard */}
      {activeTab === 'map' && !showToadTip && (
        <button
          type="button"
          onClick={() => {
            marioAudio.playCoin();
            setShowToadTip(true);
          }}
          data-testid="reopen-toad-tip-btn"
          title="Open Toad's Labor Law Pro Tip"
          className="fixed bottom-28 sm:bottom-24 lg:bottom-6 left-3 sm:left-6 z-30 min-h-[44px] px-3.5 py-2 bg-slate-950/95 text-amber-300 border-2 border-amber-400 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.6)] cursor-pointer inline-flex items-center gap-2 hover:bg-slate-900 active:translate-y-0.5 text-xs font-black font-mario animate-in fade-in"
        >
          <div className="w-6 h-6 rounded-lg bg-red-600 border border-black flex items-center justify-center shrink-0">
            <MarioMushroomIcon className="w-4 h-4 text-white" />
          </div>
          <span>TOAD&apos;S PRO TIP</span>
        </button>
      )}

      {/* Mario Warp Pipe Transition Curtain Animation */}
      {isWarpTransitioning && (
        <div
          data-testid="warp-pipe-transition-overlay"
          className="warp-pipe-transition-active fixed inset-0 z-50 pointer-events-none flex flex-col justify-end items-center"
          aria-hidden="true"
        >
          <div className="w-64 sm:w-80 h-36 bg-emerald-600 border-4 border-black rounded-t-3xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] relative flex flex-col items-center justify-center">
            <div className="w-full h-9 bg-emerald-500 border-b-4 border-black absolute top-0 flex items-center justify-between px-6 rounded-t-2xl">
              <div className="w-3.5 h-3.5 bg-emerald-300 rounded-full border border-emerald-700" />
              <div className="w-3.5 h-3.5 bg-emerald-300 rounded-full border border-emerald-700" />
            </div>
            <span className="text-white font-black font-mario text-sm sm:text-base tracking-widest uppercase drop-shadow-[0_2px_0_#000] mt-4">
              WARPING PIPE...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
