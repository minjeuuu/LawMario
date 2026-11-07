import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  ALL_LAW_TOPICS,
  WORLDS_METADATA,
  TOPIC_DIFFICULTY_MAP,
} from './data/laborLawData';
import { Navbar } from './components/Navbar';
import { WorldMap } from './components/WorldMap';
import { TopicCard } from './components/TopicCard';
import { StageProgressBar } from './components/StageProgressBar';
import { LaborLawProgressBar } from './components/LaborLawProgressBar';
import { ModuleSessionBookmarksBar } from './components/ModuleSessionBookmarksBar';
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
import { PrintStudyGuideModal, PrintModalDocumentMode } from './components/PrintStudyGuideModal';
import { StudyNotesDrawer } from './components/StudyNotesDrawer';
import { IntegratedStudyNotesPanel } from './components/IntegratedStudyNotesPanel';
import { LevelUpModal } from './components/LevelUpModal';
import { LevelProgressionModal } from './components/LevelProgressionModal';
import { ToadsTrainingLogModal } from './components/ToadsTrainingLogModal';
import { DailyMissionModal } from './components/DailyMissionModal';
import { StudyGoalHistoryModal } from './components/StudyGoalHistoryModal';
import { LaborLawKnowledgeGraphModal } from './components/LaborLawKnowledgeGraphModal';
import {
  loadUserProgression,
  awardUserXp,
  calculateQuizXp,
  calculateStudyTimeXp,
  UserProgressionState,
} from './utils/levelProgressionService';
import {
  FloatingMarioMysteryBlock,
  PiranhaPipePortal,
  PatrolMarioEnemy,
  MarioWorldSprinkles,
} from './components/RandomMarioWorldElements';
import { OfflineIndicator } from './components/PWAInstallButton';
import { UserProfileModal } from './components/UserProfileModal';
import { AppWalkthroughModal } from './components/AppWalkthroughModal';
import { CoinLeaderboardModal } from './components/CoinLeaderboardModal';
import { LegalCitationsModal, CitationsView } from './components/LegalCitationsModal';
import { QuickGlossaryModal } from './components/QuickGlossaryModal';
import { StatuteLookupModal } from './components/StatuteLookupModal';
import { DolePayMultiplierCalculator } from './components/DolePayMultiplierCalculator';
import { ResearchCohortModal } from './components/ResearchCohortModal';
import { InteractiveCompanionHUD } from './components/InteractiveCompanionHUD';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BossBattleLogModal } from './components/BossBattleLogModal';
import {
  TopicFlashcardDeckModal,
  TopicQuickQuizModal,
  WorldGoalRing,
} from './components/TopicStudyModals';
import { ModulesStudySprint } from './components/ModulesStudySprint';
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
  MarioPipeIcon,
  MarioCharacterAvatar,
  MarioWorldElementBadgeIcon,
} from './components/MarioIcons';
import { marioAudio } from './utils/audio';
import {
  MARIO_WORLD_ELEMENTS,
  TOPIC_DUEL_PAIRS,
  MarioWorldElement,
  TopicDuelPair,
} from './utils/round14Improvements';
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
  readStoredDailyStudyGoal,
} from './utils/profileAchievements';
import {
  LawTopic,
  MarioTheme,
  MarioAvatar,
  ComplexityMode,
  StudyDifficulty,
  StudyCompanionId,
  CardFrameId,
  AppStudyFontId,
} from './types/laborLaw';
import {
  loadFlagpoleStreak,
  saveFlagpoleStreak,
  recordQuizForFlagpole,
  DEFAULT_FLAGPOLE_STREAK_STATE,
  FlagpoleStreakState,
} from './utils/quizFlagpoleStreak';
import {
  loadSectionAttemptLog,
  saveSectionAttemptLog,
  recordSectionQuestionAnswer,
  SectionQuestionAttempt,
} from './utils/quizPerformanceInsights';
import {
  GlobalStudyHubModal,
  GlobalStudyLaunchMode,
} from './components/GlobalStudyHubModal';
import { StatutoryMultiplierDrillModal } from './components/StatutoryMultiplierDrillModal';
import { ReverseCitationRecitationModal } from './components/ReverseCitationRecitationModal';
import { PomodoroSprintModal } from './components/PomodoroSprintModal';
import { FlagpoleStreakWidget } from './components/FlagpoleStreakWidget';
import { resolveCompanionInteraction, type MarioEquippedRing } from './utils/round12Features';
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
  FileDown,
  Bookmark,
  Presentation,
  ArrowUpDown,
  Scale,
  Bell,
  Search,
  Swords,
  Calculator,
} from 'lucide-react';
import {
  sortModuleTopics,
  TOPIC_SORT_OPTIONS,
  TopicSortOption,
  getFriendlyDifficultyLabel,
  getTopicQuickCheck,
} from './utils/moduleSorting';
import {
  loadDailyBossQuizStreak,
  saveDailyBossQuizStreak,
  getActiveDailyBossQuizStreak,
  recordBossQuizCompletionForDailyStreak,
  shouldTriggerGlobalMuteShortcut,
  loadRecentlyViewedTopicIds,
  saveRecentlyViewedTopicIds,
  recordRecentlyViewedTopic,
  loadCompletedTopicsHistory,
  saveCompletedTopicsHistory,
  syncCompletedTopicsDailyHistory,
  buildCompletedTopicsSparklineSeries,
  TOPIC_ACCESS_SEEDED_KEY,
  loadTopicLastAccessedMap,
  saveTopicLastAccessedMap,
  initializeTopicAccessMapWithRetentionSeed,
  recordTopicAccessTimestamp,
  recordMultipleTopicsAccessTimestamp,
  getOverdueReviewTopics,
  BossBattleLogEntry,
  loadBossBattleLog,
  saveBossBattleLog,
  recordBossBattleLogEntry,
  APP_STUDY_FONTS,
  APP_STUDY_FONT_STORAGE_KEY,
} from './utils/round8Features';
import {
  loadMenuPixelFont,
  saveMenuPixelFont,
  type MenuPixelFontId,
} from './utils/menuPixelFonts';
import {
  loadTopicMasteredSectionsMap,
  saveTopicMasteredSectionsMap,
  toggleTopicSectionMastered,
  PinnedRuleBookmark,
  loadPinnedRuleBookmarks,
  savePinnedRuleBookmarks,
  togglePinnedRuleBookmark,
  QuickQuizLogEntry,
  loadQuickQuizLog,
  saveQuickQuizLog,
  recordQuickQuizLogEntry,
  CoinLedgerMap,
  loadCoinLedger30d,
  saveCoinLedger30d,
  recordCoinDeltaInLedger,
  ToadSpecialEventsState,
  loadToadSpecialEventsState,
  saveToadSpecialEventsState,
  LuxuryEquippedState,
  LUXURY_CARTRIDGE_LABELS,
  loadLuxuryEquippedState,
  saveLuxuryEquippedState,
} from './utils/round9Features';
import { loadRound10VaultState } from './utils/round10Features';
import {
  evaluateDailyGoalMilestone,
  dismissDailyGoalBanner,
  DAILY_GOAL_BONUS_COINS,
  getLocalDateKey,
  dispatchDailyMissionEvent,
} from './utils/round11Features';
import {
  loadDailyGoalMinutes,
  saveDailyGoalMinutes,
  normalizeDailyGoalMinutes,
  resolveTopicDifficultyLevel,
  ModuleSessionBookmarkSlot,
} from './utils/round13Features';

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
  {
    title: 'Separation Pay Distinctions (Art. 298)',
    tip: 'Redundancy pays at least ONE MONTH salary per year of service. Retrenchment to prevent losses, closure, and disease pay at least ONE-HALF MONTH salary per year of service (minimum 1 month). Memorize this 1-month vs 1/2-month split!',
  },
  {
    title: 'Service Incentive Leave (SIL) Cash Commutation',
    tip: 'Employees with at least 1 year of service get 5 days SIL. Crucial bar tip: Unused SIL is legally commutable to its cash equivalent at the end of the year or upon separation from employment!',
  },
  {
    title: 'Service Charges Distribution (R.A. 11360)',
    tip: '100% of all service charges collected by hotels and restaurants must be distributed completely and equally among all rank-and-file and supervisory workers. Management is strictly excluded!',
  },
  {
    title: 'Floating Status 6-Month Ceiling (Art. 301)',
    tip: 'Bona fide suspension of business operations or temporary off-detail cannot exceed 6 months. If work does not resume after 6 months, the worker is considered constructively illegally dismissed!',
  },
  {
    title: 'Bona Fide Occupational Qualification (BFOQ)',
    tip: 'To justify discriminatory employment requirements (like age, marital status, or gender), the employer must prove: (1) The job demand requires it, and (2) There is no reasonable alternative (Star Paper Corp. v. Simbol).',
  },
  {
    title: 'Wage Distortion Restoration Formula',
    tip: 'When a wage order raises minimum wage and obliterates the wage gap between higher and lower salary grades, the statutory formula is: (Minimum Wage Increase / Old Wage) x Previous Wage Difference!',
  },
  {
    title: 'Overtime on Scheduled Rest Day',
    tip: 'Work on a scheduled rest day pays 130%. If the employee performs OVERTIME work on that rest day, each OT hour pays an additional 30% of the rest day hourly rate (130% x 1.30 = 169% of basic hourly rate)!',
  },
  {
    title: 'Paternity Leave Conditions (R.A. 8187)',
    tip: '7 days with full pay for the first 4 deliveries or miscarriages of the legitimate spouse with whom the husband cohabits. It cannot be converted to cash if unused.',
  },
  {
    title: 'VAWC 10-Day Paid Leave (R.A. 9262)',
    tip: 'Victims of physical, psychological, sexual, or economic violence are entitled to 10 days paid leave to attend medical, legal, and counseling needs. Extendible upon court certification!',
  },
  {
    title: 'Special Leave for Women (R.A. 9710)',
    tip: 'Female employees who undergo surgery caused by gynecological disorders are entitled to up to 2 months paid leave following surgery, provided they rendered at least 6 months continuous aggregate service.',
  },
  {
    title: 'Labor-Only Contracting vs Permissible (D.O. 174)',
    tip: 'Labor-only contracting exists if contractor lacks substantial capital (P5M paid-up capital/net worth) OR the workers perform activities directly related to principal business. Result: Principal is deemed direct employer!',
  },
  {
    title: 'In Dubio Pro Operario (Art. 4, Labor Code)',
    tip: 'All doubts in the implementation and interpretation of labor laws, including implementing rules and employment contracts, must be resolved in favor of labor. The scales of justice tip toward the working person!',
  },
  {
    title: 'Substantial Evidence Standard (Art. 227)',
    tip: 'The quantum of proof in labor and administrative proceedings is Substantial Evidence: that amount of relevant evidence which a reasonable mind might accept as adequate to justify a conclusion.',
  },
  {
    title: 'Thirty-Day Advance Written Notice (Jaka Doctrine)',
    tip: 'For authorized-cause dismissals (retrenchment, redundancy, closure), written notice must be served to BOTH the employee and the DOLE Regional Office at least 30 calendar days prior. Failure yields P50,000 nominal damages!',
  },
  {
    title: 'Preventive Suspension 30-Day Limit',
    tip: 'An employee under investigation may be placed on preventive suspension if their continued presence poses a threat to life or property, capped strictly at 30 days. Beyond 30 days, payroll reinstatement is mandatory!',
  },
  {
    title: 'Strained Relations Doctrine',
    tip: 'When illegal dismissal is found but animosity between employer and employee is so deep that harmonious relations are impossible, separation pay of 1 month per year of service is awarded IN LIEU OF reinstatement.',
  },
  {
    title: 'Meal Period Rules (Art. 85)',
    tip: 'Regular meal period must be not less than 60 minutes time-off without pay. If shortened to not less than 20 minutes under emergency/hazardous conditions, the entire 20 minutes MUST be counted as compensable hours worked!',
  },
  {
    title: 'Telecommuting Equal Treatment (R.A. 11165)',
    tip: 'Telecommuting / work-from-home employees must receive equal treatment: same rate of pay, overtime entitlements, leave benefits, promotion opportunities, and collective bargaining rights as on-site workers.',
  },
  {
    title: 'Constructive Dismissal Test',
    tip: 'Constructive dismissal is an involuntary resignation when continued employment is rendered impossible, unreasonable, or unlikely, or involves a clear demotion in rank or diminution in pay (Globe Telecom v. Florendo).',
  },
  {
    title: 'Union Security Clauses',
    tip: 'A CBA Closed-Shop clause requires the employer to hire only union members who must maintain membership in good standing. An Agency-Fee clause requires non-union members who accept CBA benefits to pay agency fees.',
  },
  {
    title: 'Going and Coming Rule & Proximity Exception',
    tip: 'Injuries sustained traveling to or from work are generally non-compensable under ECC, EXCEPT when within the premises proximity, on a special errand for the boss, or riding company-provided transportation.',
  },
  {
    title: 'Doctrine of Immutability of Final Labor Judgments',
    tip: 'Once an NLRC or Court of Appeals labor judgment attains finality, it becomes immutable and unalterable even by the highest court, barring supervening events or nunc pro tunc clerical corrections.',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('async_battle=')) {
      return 'quiz';
    }
    return 'map';
  });
  const [activeWorld, setActiveWorld] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchWorldFilter, setSearchWorldFilter] = useState<string>('all');
  const [activeMarioWorldElement, setActiveMarioWorldElement] = useState<MarioWorldElement | null>(null);
  const [activeTopicDuel, setActiveTopicDuel] = useState<TopicDuelPair | null>(null);
  const [topicDuelShowVerdict, setTopicDuelShowVerdict] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [coins, setCoins] = useState<number>(35);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => marioAudio.enabled);
  const [zenMode, setZenMode] = useState<boolean>(false);

  useEffect(() => {
    setSoundEnabled(marioAudio.enabled);
    return marioAudio.subscribe((settings) => {
      setSoundEnabled(settings.enabled);
    });
  }, []);

  // Warp pipe CSS transition state & smooth Modules Stage-Banner
  const [isWarpTransitioning, setIsWarpTransitioning] = useState<boolean>(false);
  const [modulesStageBanner, setModulesStageBanner] = useState<string | null>(null);
  const [dailyGoalBannerVisible, setDailyGoalBannerVisible] = useState<boolean>(false);
  const [dailyGoalMilestoneToast, setDailyGoalMilestoneToast] = useState<boolean>(false);
  const [clickSparks, setClickSparks] = useState<
    Array<{ id: number; x: number; y: number; color: string }>
  >([]);

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
  const [showToadTip, setShowToadTip] = useState<boolean>(false);
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

  // Advance Toad's Pro Tip index when returning to dashboard without forcing an arrival popup
  useEffect(() => {
    if (activeTab === 'map') {
      setToadTipIndex((prev) => (prev + 1) % TOAD_PRO_TIPS.length);
    }
  }, [activeTab]);

  // Modals & Persistent Drawers
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [isPrintGuideOpen, setIsPrintGuideOpen] = useState<boolean>(false);
  const [printGuideInitialMode, setPrintGuideInitialMode] =
    useState<PrintModalDocumentMode>('summary');
  const openPrintStudio = (mode: PrintModalDocumentMode = 'summary') => {
    setPrintGuideInitialMode(mode);
    setIsPrintGuideOpen(true);
  };
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isLegalCitationsOpen, setIsLegalCitationsOpen] = useState<boolean>(false);
  const [isQuickGlossaryOpen, setIsQuickGlossaryOpen] = useState<boolean>(false);
  const [isStatuteLookupOpen, setIsStatuteLookupOpen] = useState<boolean>(false);
  const [isDoleCalculatorOpen, setIsDoleCalculatorOpen] = useState<boolean>(false);
  const [isResearchCohortOpen, setIsResearchCohortOpen] = useState<boolean>(false);
  const [isBossBattleLogOpen, setIsBossBattleLogOpen] = useState<boolean>(false);
  // Level-Up Progression State (XP, levels, and unlocked Mario character avatars)
  const [userProgression, setUserProgression] = useState<UserProgressionState>(() =>
    loadUserProgression()
  );
  const [isLevelProgressionOpen, setIsLevelProgressionOpen] = useState<boolean>(false);
  const [isToadsTrainingLogOpen, setIsToadsTrainingLogOpen] = useState<boolean>(false);
  const [isDailyMissionsOpen, setIsDailyMissionsOpen] = useState<boolean>(false);
  const [isGoalHistoryOpen, setIsGoalHistoryOpen] = useState<boolean>(false);
  const [isKnowledgeGraphOpen, setIsKnowledgeGraphOpen] = useState<boolean>(false);
  const [showCoinConfetti, setShowCoinConfetti] = useState<boolean>(false);
  const [quickStudyLaunchId, setQuickStudyLaunchId] = useState<number>(0);
  const [overdueFlashcardLaunchId, setOverdueFlashcardLaunchId] = useState<number>(0);
  const [overdueFlashcardSnapshotIds, setOverdueFlashcardSnapshotIds] = useState<string[]>([]);
  const [reviewBannerDismissed, setReviewBannerDismissed] = useState<boolean>(false);
  const [dailyQuizStreakToast, setDailyQuizStreakToast] = useState<string | null>(null);
  const [quizExternalLaunch, setQuizExternalLaunch] = useState<{
    mode: 'quick' | 'exam_sim' | 'flashback' | 'practice' | 'boss';
    nonce: number;
  } | null>(null);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      if (
        window.location.search.includes('autostart=1') ||
        window.location.search.includes('async_battle=')
      ) {
        return false;
      }
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

  const isAnyModalOpenRef = useRef<boolean>(false);
  const closeAllModalsRef = useRef<() => void>(() => {});

  // Global Ctrl+K / Cmd+K search shortcut, Escape key modal dismiss, & Global 'M' key mute/unmute shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAnyModalOpenRef.current) {
          e.preventDefault();
          closeAllModalsRef.current();
          return;
        }
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
        return;
      }

      const targetEl = e.target as HTMLElement | null;
      if (
        shouldTriggerGlobalMuteShortcut({
          key: e.key,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          altKey: e.altKey,
          repeat: e.repeat,
          defaultPrevented: e.defaultPrevented,
          targetTagName: targetEl?.tagName || null,
          targetIsContentEditable: Boolean(targetEl?.isContentEditable),
        })
      ) {
        e.preventDefault();
        const nextEnabled = marioAudio.toggleMute();
        setSoundEnabled(nextEnabled);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Unlocked Themes, Reading Fonts & Avatars
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

  const handleSelectActiveTheme = (nextTheme: MarioTheme) => {
    setActiveTheme(nextTheme);
    try {
      localStorage.setItem('mario_active_theme', nextTheme);
    } catch {
      // ignore storage errors
    }
  };

  const [appStudyFont, setAppStudyFont] = useState<AppStudyFontId>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(APP_STUDY_FONT_STORAGE_KEY) as AppStudyFontId | null;
        if (saved && APP_STUDY_FONTS.some((f) => f.id === saved)) {
          return saved;
        }
      } catch {
        // ignore
      }
    }
    return 'jakarta';
  });

  const handleSelectAppStudyFont = (nextFont: AppStudyFontId) => {
    setAppStudyFont(nextFont);
    try {
      localStorage.setItem(APP_STUDY_FONT_STORAGE_KEY, nextFont);
    } catch {
      // ignore storage errors
    }
  };

  const [menuPixelFont, setMenuPixelFont] = useState<MenuPixelFontId>(() => {
    if (typeof window !== 'undefined') {
      return loadMenuPixelFont(window.localStorage);
    }
    return 'adaptive';
  });

  const handleSelectMenuPixelFont = (nextFont: MenuPixelFontId) => {
    setMenuPixelFont(nextFont);
    if (typeof window !== 'undefined') {
      saveMenuPixelFont(nextFont, window.localStorage);
    }
  };

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

  // Super Star Power-Up (2x Coins for 10m), Special Events, Luxury Goods, Ledger & Section Mastery
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

  const [specialEventsState, setSpecialEventsState] = useState<ToadSpecialEventsState>(() =>
    typeof window !== 'undefined'
      ? loadToadSpecialEventsState(window.localStorage)
      : loadToadSpecialEventsState(null)
  );
  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveToadSpecialEventsState(specialEventsState, window.localStorage);
    }
  }, [specialEventsState]);

  const [luxuryEquipped, setLuxuryEquipped] = useState<LuxuryEquippedState>(() =>
    typeof window !== 'undefined'
      ? loadLuxuryEquippedState(window.localStorage)
      : loadLuxuryEquippedState(null)
  );
  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveLuxuryEquippedState(luxuryEquipped, window.localStorage);
    }
  }, [luxuryEquipped]);

  const [coinLedger, setCoinLedger] = useState<CoinLedgerMap>(() =>
    typeof window !== 'undefined' ? loadCoinLedger30d(window.localStorage) : {}
  );
  const prevCoinsRef = useRef<number>(coins);
  useEffect(() => {
    const delta = coins - prevCoinsRef.current;
    prevCoinsRef.current = coins;
    if (delta !== 0) {
      setCoinLedger((prev) => {
        const next = recordCoinDeltaInLedger(prev, delta);
        if (typeof window !== 'undefined') {
          saveCoinLedger30d(next, window.localStorage);
        }
        return next;
      });
    }
  }, [coins]);

  const [topicMasteredSections, setTopicMasteredSections] = useState<TopicMasteredSectionsMap>(() =>
    typeof window !== 'undefined' ? loadTopicMasteredSectionsMap(window.localStorage) : {}
  );
  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveTopicMasteredSectionsMap(topicMasteredSections, window.localStorage);
    }
  }, [topicMasteredSections]);

  const [pinnedRuleBookmarks, setPinnedRuleBookmarks] = useState<PinnedRuleBookmark[]>(() =>
    typeof window !== 'undefined' ? loadPinnedRuleBookmarks(window.localStorage) : []
  );
  useEffect(() => {
    if (typeof window !== 'undefined') {
      savePinnedRuleBookmarks(pinnedRuleBookmarks, window.localStorage);
    }
  }, [pinnedRuleBookmarks]);
  const pinnedRuleIdSet = useMemo(
    () => new Set(pinnedRuleBookmarks.map((b) => b.id)),
    [pinnedRuleBookmarks]
  );

  const [quickQuizLog, setQuickQuizLog] = useState<QuickQuizLogEntry[]>(() =>
    typeof window !== 'undefined' ? loadQuickQuizLog(window.localStorage) : []
  );
  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveQuickQuizLog(quickQuizLog, window.localStorage);
    }
  }, [quickQuizLog]);
  const [bossBattleLogInitialTab, setBossBattleLogInitialTab] = useState<'boss' | 'quick'>('boss');
  const [activeTopicFlashcardModal, setActiveTopicFlashcardModal] = useState<LawTopic | null>(null);
  const [activeTopicQuickQuizModal, setActiveTopicQuickQuizModal] = useState<LawTopic | null>(null);

  const [buffNowMs, setBuffNowMs] = useState<number>(() => Date.now());

  const maxActiveBuffEndsAt = Math.max(
    superStarEndsAt,
    specialEventsState.invincibleEndsAt,
    specialEventsState.doubleXpEndsAt,
    specialEventsState.unlockAllModulesEndsAt
  );

  useEffect(() => {
    if (maxActiveBuffEndsAt <= Date.now()) return;
    setBuffNowMs(Date.now());
    const id = window.setInterval(() => {
      const now = Date.now();
      setBuffNowMs(now);
      if (now >= maxActiveBuffEndsAt) {
        window.clearInterval(id);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [maxActiveBuffEndsAt]);

  const superStarStatus = useMemo(
    () => getSuperStarBuffStatus(superStarEndsAt, buffNowMs),
    [superStarEndsAt, buffNowMs]
  );

  const formatCountdownLabel = (endsAt: number, nowMs: number): string | null => {
    if (endsAt <= nowMs) return null;
    const remSec = Math.max(0, Math.ceil((endsAt - nowMs) / 1000));
    const mins = Math.floor(remSec / 60);
    const secs = remSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const invincibleRemainingLabel = formatCountdownLabel(
    specialEventsState.invincibleEndsAt,
    buffNowMs
  );
  const doubleXpRemainingLabel = formatCountdownLabel(
    specialEventsState.doubleXpEndsAt,
    buffNowMs
  );
  const unlockAllRemainingLabel = formatCountdownLabel(
    specialEventsState.unlockAllModulesEndsAt,
    buffNowMs
  );
  const isUnlockAllActive = specialEventsState.unlockAllModulesEndsAt > buffNowMs;
  const isAny2xCoinActive =
    superStarStatus.isActive ||
    specialEventsState.invincibleEndsAt > buffNowMs ||
    specialEventsState.doubleXpEndsAt > buffNowMs;

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
      'comp_toadsworth',
      'comp_captain_toad',
      'comp_pauline',
      'comp_dry_bones',
      'comp_shy_guy',
      'comp_birdo',
      'comp_dk',
      'comp_diddy',
      'comp_kamek',
      'comp_nabbit',
    ];
    if (typeof window !== 'undefined') {
      try {
        const stored = (localStorage.getItem('mario_equipped_companion') ||
          localStorage.getItem('mario_study_companion_v1')) as StudyCompanionId | null;
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
      'frame_koopa_sovereign',
      'frame_peach_stained_glass',
      'frame_bowser_obsidian',
      'frame_yoshi_botanical',
      'frame_boo_ethereal',
      'frame_rainbow_prism',
    ];
    if (typeof window !== 'undefined') {
      try {
        const stored = (localStorage.getItem('mario_equipped_card_frame') ||
          localStorage.getItem('mario_card_frame_v1')) as CardFrameId | null;
        return stored && validFrames.includes(stored) ? stored : 'frame_default';
      } catch {
        return 'frame_default';
      }
    }
    return 'frame_default';
  });

  const [equippedRing, setEquippedRing] = useState<MarioEquippedRing>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('mario_equipped_ring_v1') as MarioEquippedRing | null;
        if (stored) return stored;
      } catch {
        return 'ring_curatorial_gold';
      }
    }
    return 'ring_curatorial_gold';
  });

  const handleEquipRing = (ringId: MarioEquippedRing) => {
    setEquippedRing(ringId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mario_equipped_ring_v1', ringId);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    const onCompanionEquipped = (e: Event) => {
      const custom = e as CustomEvent<StudyCompanionId>;
      if (custom.detail) setEquippedCompanion(custom.detail);
    };
    const onFrameEquipped = (e: Event) => {
      const custom = e as CustomEvent<CardFrameId>;
      if (custom.detail) setEquippedCardFrame(custom.detail);
    };
    const onRingEquipped = (e: Event) => {
      const custom = e as CustomEvent<MarioEquippedRing>;
      if (custom.detail) setEquippedRing(custom.detail);
    };
    window.addEventListener('mario-equip-companion', onCompanionEquipped);
    window.addEventListener('mario-equip-card-frame', onFrameEquipped);
    window.addEventListener('mario-equip-ring', onRingEquipped);
    return () => {
      window.removeEventListener('mario-equip-companion', onCompanionEquipped);
      window.removeEventListener('mario-equip-card-frame', onFrameEquipped);
      window.removeEventListener('mario-equip-ring', onRingEquipped);
    };
  }, []);

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
      localStorage.setItem('mario_study_companion_v1', id);
      window.dispatchEvent(new CustomEvent('mario-shop-equip-changed'));
    } catch {
      // ignore
    }
  };

  const handleEquipCardFrame = (id: CardFrameId) => {
    setEquippedCardFrame(id);
    try {
      localStorage.setItem('mario_equipped_card_frame', id);
      localStorage.setItem('mario_card_frame_v1', id);
      window.dispatchEvent(new CustomEvent('mario-shop-equip-changed'));
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

  // Additional Module Study & View Options (Stream / 2-Col Grid / Compact Outline / Focus Reader / Slide Deck + Status & Sort)
  const [moduleViewMode, setModuleViewMode] = useState<
    'stream' | 'grid' | 'outline' | 'focus' | 'slides'
  >('stream');
  const [moduleStatusFilter, setModuleStatusFilter] = useState<
    'all' | 'unread' | 'mastered' | 'flagged' | 'bookmarked'
  >('all');
  const [topicSortBy, setTopicSortBy] = useState<TopicSortOption>('default');
  const [bookmarkedTopicIds, setBookmarkedTopicIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mario_bookmarked_topics');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const handleToggleBookmarkTopic = (topicId: string) => {
    setBookmarkedTopicIds((prev) => {
      const next = prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId];
      try {
        localStorage.setItem('mario_bookmarked_topics', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    marioAudio.playCoin();
  };
  const [expandCollapseSignal, setExpandCollapseSignal] = useState<{
    mode: 'expand' | 'collapse';
    seq: number;
  } | null>(null);
  const [restoredOpenSignal, setRestoredOpenSignal] = useState<{
    openIds: ReadonlySet<string>;
    seq: number;
  } | null>(null);
  const [openTopicIdsMap, setOpenTopicIdsMap] = useState<Record<string, boolean>>({});
  const handleTopicOpenStateChange = useCallback((topicId: string, isOpen: boolean) => {
    setOpenTopicIdsMap((prev) => {
      if (prev[topicId] === isOpen) return prev;
      return { ...prev, [topicId]: isOpen };
    });
  }, []);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(() =>
    typeof window !== 'undefined' ? loadDailyGoalMinutes(window.localStorage) : 30
  );
  const handleChangeDailyGoalMinutes = useCallback((minutes: number) => {
    const normalized = saveDailyGoalMinutes(
      minutes,
      typeof window !== 'undefined' ? window.localStorage : null
    );
    setDailyGoalMinutes(normalized);
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncGoal = () => {
      setDailyGoalMinutes(loadDailyGoalMinutes(window.localStorage));
    };
    window.addEventListener('mario-daily-goal-updated', syncGoal);
    window.addEventListener('storage', syncGoal);
    return () => {
      window.removeEventListener('mario-daily-goal-updated', syncGoal);
      window.removeEventListener('storage', syncGoal);
    };
  }, []);
  const [focusTopicIdx, setFocusTopicIdx] = useState<number>(0);
  const [slideStepIdx, setSlideStepIdx] = useState<number>(0);
  const [slideQuizChoice, setSlideQuizChoice] = useState<number | null>(null);

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

  // Valid Topic IDs lookup set
  const validTopicIdSet = useMemo(
    () => new Set(ALL_LAW_TOPICS.map((t) => t.id)),
    []
  );

  // Recently Viewed Topics (Last 5 Accessed Topics on Dashboard Map)
  const [recentlyViewedTopicIds, setRecentlyViewedTopicIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = loadRecentlyViewedTopicIds(window.localStorage, validTopicIdSet);
    if (stored.length > 0) return stored;
    const fallbackLast = localStorage.getItem('mario_last_studied_topic');
    if (fallbackLast && validTopicIdSet.has(fallbackLast)) {
      return [fallbackLast];
    }
    return ALL_LAW_TOPICS[0] ? [ALL_LAW_TOPICS[0].id] : [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveRecentlyViewedTopicIds(recentlyViewedTopicIds, window.localStorage);
    }
  }, [recentlyViewedTopicIds]);

  const recentlyViewedTopics = useMemo(
    () =>
      recentlyViewedTopicIds
        .map((id) => ALL_LAW_TOPICS.find((t) => t.id === id))
        .filter((t): t is (typeof ALL_LAW_TOPICS)[number] => Boolean(t))
        .slice(0, 5)
        .map((t) => ({
          id: t.id,
          title: t.title,
          badge: t.badge,
          worldId: t.worldId,
        })),
    [recentlyViewedTopicIds]
  );

  // Per-Topic Last Accessed Map & >14 Days 'Review Required' Spaced Retention
  const [topicLastAccessedMap, setTopicLastAccessedMap] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};
    const existing = loadTopicLastAccessedMap(window.localStorage);
    const alreadySeeded = localStorage.getItem(TOPIC_ACCESS_SEEDED_KEY) === 'true';
    const init = initializeTopicAccessMapWithRetentionSeed({
      existingMap: existing,
      completedTopicIds,
      allTopicIds: ALL_LAW_TOPICS.map((t) => t.id),
      alreadySeeded,
    });
    if (init.didSeed) {
      try {
        localStorage.setItem(TOPIC_ACCESS_SEEDED_KEY, 'true');
        saveTopicLastAccessedMap(init.map, window.localStorage);
      } catch {
        // ignore
      }
    }
    return init.map;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveTopicLastAccessedMap(topicLastAccessedMap, window.localStorage);
    }
  }, [topicLastAccessedMap]);

  const overdueReviewTopics = useMemo(
    () =>
      getOverdueReviewTopics({
        lastAccessedMap: topicLastAccessedMap,
        allTopics: ALL_LAW_TOPICS,
      }),
    [topicLastAccessedMap]
  );

  // 7-Day Completed Topics History & Mini Sparkline Series
  const [completedTopicsHistory, setCompletedTopicsHistory] = useState<Record<string, number>>(
    () => (typeof window !== 'undefined' ? loadCompletedTopicsHistory(window.localStorage) : {})
  );

  useEffect(() => {
    setCompletedTopicsHistory((prev) => {
      const next = syncCompletedTopicsDailyHistory(prev, completedTopicIds.length);
      if (typeof window !== 'undefined') {
        saveCompletedTopicsHistory(next, window.localStorage);
      }
      return next;
    });
  }, [completedTopicIds.length]);

  const completedTopicsSparkline = useMemo(
    () =>
      buildCompletedTopicsSparklineSeries({
        history: completedTopicsHistory,
        currentCompletedCount: completedTopicIds.length,
        totalTopicsCount: ALL_LAW_TOPICS.length,
      }),
    [completedTopicsHistory, completedTopicIds.length]
  );

  // Daily Boss Quiz Streak & Bar Master Boss Battle Log
  const [dailyBossQuizStreakState, setDailyBossQuizStreakState] = useState(() =>
    typeof window !== 'undefined'
      ? loadDailyBossQuizStreak(window.localStorage)
      : loadDailyBossQuizStreak(null)
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveDailyBossQuizStreak(dailyBossQuizStreakState, window.localStorage);
    }
  }, [dailyBossQuizStreakState]);

  const dailyBossQuizStreakSnapshot = useMemo(
    () => getActiveDailyBossQuizStreak(dailyBossQuizStreakState),
    [dailyBossQuizStreakState]
  );

  const [bossBattleLog, setBossBattleLog] = useState<BossBattleLogEntry[]>(() =>
    typeof window !== 'undefined' ? loadBossBattleLog(window.localStorage) : []
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveBossBattleLog(bossBattleLog, window.localStorage);
    }
  }, [bossBattleLog]);

  // Visual 5-Day Quiz Performance Flagpole Streak State
  const [flagpoleStreakState, setFlagpoleStreakState] = useState<FlagpoleStreakState>(() =>
    typeof window !== 'undefined'
      ? loadFlagpoleStreak(window.localStorage)
      : { ...DEFAULT_FLAGPOLE_STREAK_STATE }
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveFlagpoleStreak(flagpoleStreakState, window.localStorage);
    }
  }, [flagpoleStreakState]);

  // 30-Day Section Quiz Attempts Log for Labor Law Heatmap
  const [sectionAttemptsLog, setSectionAttemptsLog] = useState<SectionQuestionAttempt[]>(() =>
    typeof window !== 'undefined'
      ? loadSectionAttemptLog(window.localStorage)
      : []
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveSectionAttemptLog(sectionAttemptsLog, window.localStorage);
    }
  }, [sectionAttemptsLog]);

  const [isGlobalStudyHubOpen, setIsGlobalStudyHubOpen] = useState(false);
  const [isMultiplierDrillOpen, setIsMultiplierDrillOpen] = useState(false);
  const [isReverseCitationOpen, setIsReverseCitationOpen] = useState(false);
  const [isPomodoroSprintOpen, setIsPomodoroSprintOpen] = useState(false);

  const isAnyModalOpen = Boolean(
    isDailyRewardOpen ||
    isExportModalOpen ||
    isGlobalSearchOpen ||
    isPrintGuideOpen ||
    isProfileOpen ||
    isLeaderboardOpen ||
    isLegalCitationsOpen ||
    isQuickGlossaryOpen ||
    isStatuteLookupOpen ||
    isDoleCalculatorOpen ||
    isResearchCohortOpen ||
    isBossBattleLogOpen ||
    isLevelProgressionOpen ||
    isToadsTrainingLogOpen ||
    isDailyMissionsOpen ||
    isGoalHistoryOpen ||
    isKnowledgeGraphOpen ||
    isWalkthroughOpen ||
    isGlobalStudyHubOpen ||
    isMultiplierDrillOpen ||
    isReverseCitationOpen ||
    isPomodoroSprintOpen ||
    activeTopicFlashcardModal ||
    activeTopicQuickQuizModal ||
    levelUpCelebration.worldId !== null
  );

  const closeAllModals = useCallback(() => {
    setIsDailyRewardOpen(false);
    setIsExportModalOpen(false);
    setIsGlobalSearchOpen(false);
    setIsPrintGuideOpen(false);
    setIsProfileOpen(false);
    setIsLeaderboardOpen(false);
    setIsLegalCitationsOpen(false);
    setIsQuickGlossaryOpen(false);
    setIsStatuteLookupOpen(false);
    setIsDoleCalculatorOpen(false);
    setIsResearchCohortOpen(false);
    setIsBossBattleLogOpen(false);
    setIsLevelProgressionOpen(false);
    setIsToadsTrainingLogOpen(false);
    setIsDailyMissionsOpen(false);
    setIsGoalHistoryOpen(false);
    setIsKnowledgeGraphOpen(false);
    setIsWalkthroughOpen(false);
    setIsGlobalStudyHubOpen(false);
    setIsMultiplierDrillOpen(false);
    setIsReverseCitationOpen(false);
    setIsPomodoroSprintOpen(false);
    setActiveTopicFlashcardModal(null);
    setActiveTopicQuickQuizModal(null);
    setLevelUpCelebration({ worldId: null, bonusCoins: 0 });
    setShowCoinConfetti(false);
  }, []);

  useEffect(() => {
    isAnyModalOpenRef.current = isAnyModalOpen;
    closeAllModalsRef.current = closeAllModals;
  }, [isAnyModalOpen, closeAllModals]);

  const recordTopicEngagement = (topicId: string) => {
    if (!topicId) return;
    setLastStudiedTopicId(topicId);
    setRecentlyViewedTopicIds((prev) =>
      recordRecentlyViewedTopic(prev, topicId, validTopicIdSet)
    );
    setTopicLastAccessedMap((prev) => recordTopicAccessTimestamp(prev, topicId));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mario_last_studied_topic', topicId);
      } catch {
        // ignore
      }
    }
  };

  const handleToggleTopicComplete = (topicId: string) => {
    recordTopicEngagement(topicId);
    const isNowDone = !completedTopicIds.includes(topicId);
    let next: string[];

    if (isNowDone) {
      next = [...completedTopicIds, topicId];
      // Equipped Mastery / Coin collection SFX + Daily Mission event when topic is marked complete
      marioAudio.playCompletionOrMilestoneCoin();
      dispatchDailyMissionEvent('master_topic', 1);
      // Passive Study Companion Bonus Coins when a Mario Pet is active
      if (equippedCompanion && equippedCompanion !== 'comp_none') {
        const petMeta = resolveCompanionInteraction(equippedCompanion, next.length);
        if (petMeta.bonusCoinsPerTopic > 0) {
          setCoins((c) => c + petMeta.bonusCoinsPerTopic);
        }
      }

      const levelUpCheck = evaluateWorldLevelUp({
        toggledTopicId: topicId,
        previousCompletedIds: completedTopicIds,
        nextCompletedIds: next,
        allTopics: ALL_LAW_TOPICS,
        claimedWorldIds,
      });

      if (levelUpCheck.triggered && levelUpCheck.worldId) {
        const nowCheck = Date.now();
        const active2x =
          getSuperStarBuffStatus(superStarEndsAt, nowCheck).isActive ||
          specialEventsState.invincibleEndsAt > nowCheck ||
          specialEventsState.doubleXpEndsAt > nowCheck;
        const effectiveReward = computeEffectiveCoinReward(
          2 + levelUpCheck.bonusCoins,
          {
            isSuperStarActive: active2x,
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
        const nowCheck = Date.now();
        const active2x =
          getSuperStarBuffStatus(superStarEndsAt, nowCheck).isActive ||
          specialEventsState.invincibleEndsAt > nowCheck ||
          specialEventsState.doubleXpEndsAt > nowCheck;
        const effectiveReward = computeEffectiveCoinReward(2, {
          isSuperStarActive: active2x,
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

  // Small pixel-art world achievement badge rendered at the top of each World Selector button
  const renderPixelWorldBadge = (
    badgeKey: string,
    completedInWorld: number,
    totalInWorld: number
  ) => {
    const isMastered = totalInWorld > 0 && completedInWorld >= totalInWorld;
    const isStarted = completedInWorld > 0 && !isMastered;
    const label = isMastered
      ? 'MASTERED'
      : isStarted
      ? `${completedInWorld}/${totalInWorld}`
      : `0/${totalInWorld}`;

    return (
      <span
        data-testid={`world-selector-pixel-badge-${badgeKey}`}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-mono font-black leading-none mb-1 ${
          isMastered
            ? 'bg-emerald-950 text-amber-300 border-amber-400'
            : isStarted
            ? 'bg-slate-950 text-emerald-300 border-emerald-500/70'
            : 'bg-slate-950/90 text-slate-400 border-slate-700'
        }`}
      >
        <svg
          viewBox="0 0 8 8"
          shapeRendering="crispEdges"
          aria-hidden="true"
          className="w-3 h-3 shrink-0"
        >
          {isMastered ? (
            <>
              <rect x="0" y="2" width="1" height="4" fill="#fbbf24" />
              <rect x="7" y="2" width="1" height="4" fill="#fbbf24" />
              <rect x="2" y="1" width="1" height="5" fill="#fbbf24" />
              <rect x="5" y="1" width="1" height="5" fill="#fbbf24" />
              <rect x="3" y="0" width="2" height="6" fill="#fde047" />
              <rect x="1" y="4" width="6" height="2" fill="#f59e0b" />
              <rect x="1" y="6" width="6" height="1" fill="#92400e" />
            </>
          ) : isStarted ? (
            <>
              <rect x="2" y="0" width="4" height="1" fill="#34d399" />
              <rect x="1" y="1" width="6" height="4" fill="#10b981" />
              <rect x="2" y="2" width="2" height="2" fill="#a7f3d0" />
              <rect x="2" y="5" width="4" height="2" fill="#059669" />
              <rect x="3" y="7" width="2" height="1" fill="#047857" />
            </>
          ) : (
            <>
              <rect x="1" y="1" width="6" height="6" fill="#334155" />
              <rect x="2" y="2" width="4" height="4" fill="#475569" />
              <rect x="3" y="3" width="2" height="2" fill="#94a3b8" />
            </>
          )}
        </svg>
        <span className="tabular-nums">{label}</span>
      </span>
    );
  };

  // Filter and sort topics based on active world, world search filter, difficulty tag, status, search query, and sort option
  const displayedTopics = useMemo(() => {
    const effectiveWorld = searchWorldFilter === 'active' ? activeWorld : searchWorldFilter;
    const filtered = ALL_LAW_TOPICS.filter((topic) => {
      const matchesWorld = activeWorld === 'all' || topic.worldId === activeWorld;
      if (!matchesWorld) return false;

      if (effectiveWorld !== 'all' && topic.worldId !== effectiveWorld) {
        return false;
      }

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
      if (moduleStatusFilter === 'bookmarked' && !bookmarkedTopicIds.includes(topic.id)) {
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

    return sortModuleTopics(filtered, topicSortBy, TOPIC_DIFFICULTY_MAP);
  }, [
    activeWorld,
    searchQuery,
    searchWorldFilter,
    difficultyFilter,
    moduleStatusFilter,
    completedTopicIds,
    profileStats.needsImprovementTopicIds,
    bookmarkedTopicIds,
    topicSortBy,
  ]);

  useEffect(() => {
    setFocusTopicIdx(0);
    setSlideStepIdx(0);
    setSlideQuizChoice(null);
  }, [activeWorld, difficultyFilter, moduleStatusFilter, searchQuery, searchWorldFilter, topicSortBy]);

  const openTopicIds = useMemo(() => {
    const displayedSet = new Set(displayedTopics.map((t) => t.id));
    return Object.entries(openTopicIdsMap)
      .filter(([id, isOpen]) => isOpen && displayedSet.has(id))
      .map(([id]) => id);
  }, [openTopicIdsMap, displayedTopics]);

  const triggerTopicOpenCueById = useCallback((topicId: string) => {
    const targetTopic = ALL_LAW_TOPICS.find((t) => t.id === topicId);
    const level = resolveTopicDifficultyLevel(
      targetTopic?.difficulty,
      topicId,
      TOPIC_DIFFICULTY_MAP
    );
    marioAudio.playTopicDifficultyCue(level);
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('mario-topic-opened-cue', {
            detail: { topicId, skipAudio: true },
          })
        );
      }, 160);
    }
  }, []);

  const handleRestoreModuleSessionSlot = useCallback((slot: ModuleSessionBookmarkSlot) => {
    setExpandCollapseSignal(null);
    setActiveWorld(slot.activeWorld);
    setModuleViewMode(slot.moduleViewMode);
    setModuleStatusFilter('all');
    setDifficultyFilter('all');
    setSearchQuery('');
    const openSet = new Set(slot.openTopicIds);
    setRestoredOpenSignal({ openIds: openSet, seq: Date.now() });
    setOpenTopicIdsMap(() => {
      const next: Record<string, boolean> = {};
      ALL_LAW_TOPICS.forEach((t) => {
        next[t.id] = openSet.has(t.id);
      });
      return next;
    });
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          window.scrollTo({ top: slot.scrollY, behavior: 'auto' });
        }, 90);
      });
    }
  }, []);

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
    recordTopicEngagement(topicId);
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
      setRestoredOpenSignal(null);
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
        setRestoredOpenSignal(null);
        setActiveWorld(worldId);
        setActiveTab('modules');
        marioAudio.syncModuleAudio(worldId, true);
      });
    }
  };

  const checkLive2xActive = () => {
    const nowCheck = Date.now();
    return (
      getSuperStarBuffStatus(superStarEndsAt, nowCheck).isActive ||
      specialEventsState.invincibleEndsAt > nowCheck ||
      specialEventsState.doubleXpEndsAt > nowCheck
    );
  };

  const handleEarnCoin = () => {
    const baseReward = computeEffectiveCoinReward(1, {
      isSuperStarActive: checkLive2xActive(),
      hasMushroomCoinCharm: hasMushroomCoinCharm(),
    });
    const finalReward =
      equippedRing === 'ring_curatorial_gold'
        ? Math.ceil(baseReward * 1.25)
        : baseReward;
    setCoins((c) => c + finalReward);
  };

  const handleEarnCoins = (amount: number) => {
    if (amount <= 0) return;
    const baseReward = computeEffectiveCoinReward(amount, {
      isSuperStarActive: checkLive2xActive(),
      hasMushroomCoinCharm: false,
    });
    const finalReward =
      equippedRing === 'ring_curatorial_gold'
        ? Math.ceil(baseReward * 1.25)
        : baseReward;
    setCoins((c) => c + finalReward);
  };

  // Wrapper for GameVault so arcade coin pickups also receive active 2x buffs
  const handleArcadeSetCoins: React.Dispatch<React.SetStateAction<number>> = (updater) => {
    setCoins((prev) => {
      const rawNext = typeof updater === 'function' ? updater(prev) : updater;
      const delta = rawNext - prev;
      if (delta > 0 && checkLive2xActive()) {
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

  const handleStartOverdueFlashcardReview = () => {
    const ids = overdueReviewTopics.map((item) => item.topicId);
    if (ids.length > 0) {
      setOverdueFlashcardSnapshotIds(ids);
      setTopicLastAccessedMap((prev) => recordMultipleTopicsAccessTimestamp(prev, ids));
    }
    setReviewBannerDismissed(false);
    setActiveTab('flashcards');
    setOverdueFlashcardLaunchId((n) => n + 1);
    marioAudio.playPowerUp();
  };

  const handleLaunchWeaknessDrill = () => {
    setActiveTab('quiz');
    setQuizExternalLaunch((prev) => ({
      mode: 'flashback',
      nonce: (prev?.nonce || 0) + 1,
    }));
    marioAudio.playPowerUp();
  };

  const handleBossQuizCompleted = () => {
    const res = recordBossQuizCompletionForDailyStreak(dailyBossQuizStreakState);
    setDailyBossQuizStreakState(res.nextState);
    if (res.bonusCoinsAwarded > 0) {
      handleEarnCoins(res.bonusCoinsAwarded);
      setDailyQuizStreakToast(
        `Daily Quiz Streak: ${res.activeStreak} ${
          res.activeStreak === 1 ? 'Day' : 'Days'
        }! +${res.bonusCoinsAwarded} Bonus Coins!`
      );
      window.setTimeout(() => {
        setDailyQuizStreakToast(null);
      }, 5000);
    }
  };

  const handleRecordBossBattleLog = (input: {
    modeLabel: string;
    score: number;
    totalQuestions: number;
    timeTakenSeconds: number;
    incorrectTopics: string[];
    victory?: boolean;
    worldId?: string;
  }) => {
    const battleInput = {
      ...input,
      worldId: input.worldId || activeWorld,
    };
    setBossBattleLog((prev) => recordBossBattleLogEntry(prev, battleInput));
  };

  const handleToggleSectionMastered = (topicId: string, sectionKey: string) => {
    recordTopicEngagement(topicId);
    setTopicMasteredSections((prev) => {
      const res = toggleTopicSectionMastered(prev, topicId, sectionKey);
      if (res.isNowMastered) {
        handleEarnCoin();
      }
      return res.nextMap;
    });
  };

  const handleTogglePinRuleItem = (candidate: Omit<PinnedRuleBookmark, 'pinnedAt'>) => {
    setPinnedRuleBookmarks((prev) => {
      const res = togglePinnedRuleBookmark(prev, candidate);
      return res.nextItems;
    });
  };

  const handleRemovePinnedRule = (bookmarkId: string) => {
    setPinnedRuleBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
  };

  const handleCompleteTopicQuickQuiz = (result: {
    topic: LawTopic;
    score: number;
    totalQuestions: number;
    durationSeconds: number;
    missedPoints: string[];
    coinsEarned: number;
  }) => {
    recordTopicEngagement(result.topic.id);
    setQuickQuizLog((prev) =>
      recordQuickQuizLogEntry(prev, {
        topicId: result.topic.id,
        topicTitle: result.topic.title,
        topicBadge: result.topic.badge,
        worldId: result.topic.worldId,
        score: result.score,
        totalQuestions: result.totalQuestions,
        durationSeconds: result.durationSeconds,
        missedPoints: result.missedPoints,
      })
    );
    if (result.coinsEarned > 0) {
      handleEarnCoins(result.coinsEarned);
    }
  };

  const handleUpdateSpecialEvents = (next: ToadSpecialEventsState) => {
    setSpecialEventsState(next);
    setBuffNowMs(Date.now());
  };

  const handleUpdateLuxuryEquipped = (next: LuxuryEquippedState) => {
    setLuxuryEquipped(next);
  };

  const handleConsumeBossSkipToken = () => {
    setSpecialEventsState((prev) => ({
      ...prev,
      bossSkipTokens: Math.max(0, prev.bossSkipTokens - 1),
    }));
  };

  const handleActivateBossDefeatInvincible = () => {
    const now = Date.now();
    setSpecialEventsState((prev) => ({
      ...prev,
      invincibleEndsAt: Math.max(prev.invincibleEndsAt, now) + 5 * 60 * 1000,
    }));
    setBuffNowMs(now);
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
        const gainedXp = calculateStudyTimeXp(15);
        if (gainedXp > 0) {
          const res = awardUserXp({ amount: gainedXp, reason: 'Active Study Time' });
          setUserProgression(res.updatedState);
          if (res.didLevelUp) {
            marioAudio.playStageClear();
            setShowCoinConfetti(true);
          }
        }
      }
    }, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const handlePomodoroStudySeconds = (secs: number) => {
    setProfileStats((prev) => recordStudySeconds(prev, secs));
    const gainedXp = calculateStudyTimeXp(secs);
    if (gainedXp > 0) {
      const res = awardUserXp({ amount: gainedXp, reason: 'Pomodoro Study Focus' });
      setUserProgression(res.updatedState);
      if (res.didLevelUp) {
        marioAudio.playStageClear();
        setShowCoinConfetti(true);
      }
    }
  };

  const handlePomodoroFocusComplete = () => {
    setProfileStats((prev) => recordPomodoroFocusFinish(prev, 0));
    const res = awardUserXp({ amount: 25, reason: 'Completed Pomodoro Study Cycle' });
    setUserProgression(res.updatedState);
    if (res.didLevelUp) {
      marioAudio.playStageClear();
      setShowCoinConfetti(true);
    }
  };

  const handleAwardBonusXp = (amount: number) => {
    const res = awardUserXp({ amount, reason: '5-Day Flagpole Streak Milestone' });
    setUserProgression(res.updatedState);
    if (res.didLevelUp) {
      marioAudio.playStageClear();
      setShowCoinConfetti(true);
      setIsLevelProgressionOpen(true);
    }
  };

  const handleRecordSectionAnswer = (topicId: string, isCorrect: boolean) => {
    setSectionAttemptsLog((prev) =>
      recordSectionQuestionAnswer(prev, topicId, isCorrect, Date.now(), window.localStorage)
    );
  };

  const handleLaunchGlobalStudyMode = (mode: GlobalStudyLaunchMode) => {
    if (mode === 'exam_sim') {
      setActiveTab('quiz');
      setQuizExternalLaunch((prev) => ({ mode: 'exam_sim', nonce: (prev?.nonce || 0) + 1 }));
      marioAudio.playPowerUp();
    } else if (mode === 'rapid_blitz') {
      setActiveTab('quiz');
      setQuizExternalLaunch((prev) => ({ mode: 'quick', nonce: (prev?.nonce || 0) + 1 }));
      marioAudio.playPowerUp();
    } else if (mode === 'weakness_gauntlet') {
      setActiveTab('quiz');
      setQuizExternalLaunch((prev) => ({ mode: 'flashback', nonce: (prev?.nonce || 0) + 1 }));
      marioAudio.playPowerUp();
    } else if (mode === 'multiplier_test') {
      setIsMultiplierDrillOpen(true);
      marioAudio.playCoin();
    } else if (mode === 'reverse_citation') {
      setIsReverseCitationOpen(true);
      marioAudio.playPowerUp();
    } else if (mode === 'pomodoro_sprint') {
      setIsPomodoroSprintOpen(true);
      marioAudio.playPowerUp();
    } else if (mode === 'flagpole_quiz') {
      setActiveTab('quiz');
      setQuizExternalLaunch((prev) => ({ mode: 'quick', nonce: (prev?.nonce || 0) + 1 }));
      marioAudio.playPowerUp();
    }
  };

  const handleQuizCompleted = (payload: QuizCompletionPayload) => {
    setProfileStats((prev) => recordCompletedQuizRun(prev, payload));
    if (payload.totalCount > 0 && payload.correctCount / payload.totalCount >= 0.8) {
      dispatchDailyMissionEvent('quiz_80', 1);
    }
    const earnedXp = calculateQuizXp({
      correctCount: payload.correctCount,
      totalCount: payload.totalCount,
      isBossOrExam: payload.mode === 'boss' || payload.mode === 'exam_sim',
    });
    const res = awardUserXp({
      amount: earnedXp,
      reason: `Quiz Completed (${payload.correctCount}/${payload.totalCount})`,
    });
    setUserProgression(res.updatedState);
    if (res.didLevelUp) {
      marioAudio.playStageClear();
      setShowCoinConfetti(true);
      setIsLevelProgressionOpen(true);
    }

    // Advance 5-Day Visual Flagpole Streak
    const todayStr = new Date().toISOString().split('T')[0];
    const fpResult = recordQuizForFlagpole(flagpoleStreakState, todayStr);
    if (fpResult.streakIncremented) {
      setFlagpoleStreakState(fpResult.nextState);
      if (fpResult.milestoneUnlocked) {
        setDailyQuizStreakToast(
          'Flagpole 5-Day Milestone Reached! Claim +500 XP & 1.5x Multiplier in Profile!'
        );
        window.setTimeout(() => setDailyQuizStreakToast(null), 6000);
      }
    }
  };

  // Daily Study Goal Milestone Celebration (1-Up Mushroom + Bonus Coins + Persistent Mario Banner)
  const handleDailyStudyMilestone = () => {
    marioAudio.playCompletionOrMilestoneCoin();
    marioAudio.playOneUp();
    setCoins((prev) => prev + DAILY_GOAL_BONUS_COINS);
    setShowCoinConfetti(true);
    setDailyGoalMilestoneToast(true);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const todaySecs = getTodayStudiedSeconds(profileStats);
    const goalMins = normalizeDailyGoalMinutes(dailyGoalMinutes);
    const res = evaluateDailyGoalMilestone({
      dateKey: getLocalDateKey(),
      studiedSeconds: todaySecs,
      goalMinutes: goalMins,
      storage: window.localStorage,
    });
    setDailyGoalBannerVisible(res.shouldShowBanner);
    if (res.newlyReached) {
      handleDailyStudyMilestone();
    }
  }, [profileStats, dailyGoalMinutes]);

  // Smooth Mario Stage-Banner when entering Modules or switching activeWorld + Daily Mission tab triggers
  useEffect(() => {
    if (activeTab === 'wages_matrix') {
      dispatchDailyMissionEvent('inspect_wages', 1);
    } else if (activeTab === 'flashcards') {
      dispatchDailyMissionEvent('flashcard_review', 1);
    } else if (activeTab === 'modules') {
      const worldMeta = WORLDS_METADATA.find((w) => w.id === activeWorld);
      const label = worldMeta
        ? `WORLD ${worldMeta.worldNumber} · ${worldMeta.title.toUpperCase()}`
        : `ALL 6 WORLDS · ${ALL_LAW_TOPICS.length} STATUTORY DOCTRINES READY`;
      setModulesStageBanner(label);
      const timer = window.setTimeout(() => setModulesStageBanner(null), 1100);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [activeTab, activeWorld]);

  useEffect(() => {
    if (isStatuteLookupOpen) {
      dispatchDailyMissionEvent('statute_lookup', 1);
    }
  }, [isStatuteLookupOpen]);

  // Global Custom Event Bridges (Daily Missions, Koopa Boss Frame Equip, Luxury Sync, Click Spark FX)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOpenStatute = () => {
      setIsStatuteLookupOpen(true);
    };
    const onNavigateTab = (ev: Event) => {
      const custom = ev as CustomEvent<{ tab?: string }>;
      const target = custom.detail?.tab;
      if (target) {
        setActiveTab(target === 'arcade' ? 'vault' : target);
        marioAudio.playTabSwitch();
      }
    };
    const onEquipFrame = (ev: Event) => {
      const custom = ev as CustomEvent<any>;
      const frameId = typeof custom.detail === 'string' ? custom.detail : custom.detail?.frameId;
      if (frameId) {
        handleEquipCardFrame(frameId);
      }
    };
    const onEquipCompanionEvent = (ev: Event) => {
      const custom = ev as CustomEvent<any>;
      const compId = typeof custom.detail === 'string' ? custom.detail : custom.detail?.companionId;
      if (compId) {
        handleEquipCompanion(compId);
      }
    };
    const onLuxuryUpdated = () => {
      setLuxuryEquipped(loadLuxuryEquippedState(window.localStorage));
    };
    const onPointerDownSpark = (e: PointerEvent) => {
      const vault = loadRound10VaultState();
      if (!vault.equippedClickFx) return;
      const colorMap: Record<string, string> = {
        fx_click_gold_coin: '#fbbf24',
        fx_click_super_star: '#fde047',
        fx_click_fire_flower: '#ef4444',
        fx_click_ice_flower: '#38bdf8',
        fx_click_1up_emerald: '#22c55e',
        fx_click_emerald_pipe: '#10b981',
        fx_click_fireball_amber: '#f97316',
        fx_click_cosmic_cyan: '#06b6d4',
      };
      const color = colorMap[vault.equippedClickFx] || '#fbbf24';
      const sparkId = Date.now() + Math.random();
      setClickSparks((prev) => [...prev.slice(-6), { id: sparkId, x: e.clientX, y: e.clientY, color }]);
      window.setTimeout(() => {
        setClickSparks((prev) => prev.filter((s) => s.id !== sparkId));
      }, 460);
    };

    window.addEventListener('mario-open-statute-lookup', onOpenStatute);
    window.addEventListener('mario-navigate-tab', onNavigateTab);
    window.addEventListener('mario-equip-card-frame', onEquipFrame);
    window.addEventListener('mario-equip-companion', onEquipCompanionEvent);
    window.addEventListener('mario-luxury-updated', onLuxuryUpdated);
    window.addEventListener('pointerdown', onPointerDownSpark, { passive: true });
    return () => {
      window.removeEventListener('mario-open-statute-lookup', onOpenStatute);
      window.removeEventListener('mario-navigate-tab', onNavigateTab);
      window.removeEventListener('mario-equip-card-frame', onEquipFrame);
      window.removeEventListener('mario-equip-companion', onEquipCompanionEvent);
      window.removeEventListener('mario-luxury-updated', onLuxuryUpdated);
      window.removeEventListener('pointerdown', onPointerDownSpark);
    };
  }, []);

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
      if (navigateToTab === 'print') {
        openPrintStudio('summary');
      } else if (navigateToTab === 'profile') {
        setIsProfileOpen(true);
      } else if (navigateToTab === 'glossary') {
        setIsQuickGlossaryOpen(true);
      } else if (navigateToTab === 'search') {
        setIsGlobalSearchOpen(true);
      } else if (navigateToTab === 'regions') {
        setActiveTab('wages_matrix');
      } else {
        setActiveTab(navigateToTab);
      }
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
  const appStudyFontClass =
    APP_STUDY_FONTS.find((f) => f.id === appStudyFont)?.cssClass || 'app-study-font-jakarta';

  return (
    <div
      data-study-font={appStudyFont}
      className={`min-h-screen min-h-[100dvh] flex-1 flex flex-col text-slate-900 dark:text-slate-100 antialiased theme-${activeTheme} ${appStudyFontClass} world-bg-${activeWorld || 'all'} transition-colors duration-500 w-full max-w-full overflow-x-clip`}
    >
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
          equippedCardFrame={equippedCardFrame}
          equippedRing={equippedRing}
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
          onOpenPrintGuide={() => openPrintStudio('guide')}
          onOpenOnePageSummary={() => openPrintStudio('summary')}
          onOpenLegalCitationsModal={() => setIsLegalCitationsOpen(true)}
          onOpenQuickGlossary={() => setIsQuickGlossaryOpen(true)}
          onOpenStatuteLookup={() => setIsStatuteLookupOpen(true)}
          onOpenDoleCalculator={() => setIsDoleCalculatorOpen(true)}
          onOpenResearchCohort={() => setIsResearchCohortOpen(true)}
          showLegalCitations={showLegalCitations}
          setShowLegalCitations={handleSetShowLegalCitations}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onStartQuickStudy={handleStartQuickStudy}
          onOpenGlobalStudyHub={() => setIsGlobalStudyHubOpen(true)}
          superStarRemainingLabel={
            superStarStatus.isActive ? superStarStatus.formattedRemaining : null
          }
          shortcutMapActive={shortcutMapActive}
          zenReadingMode={zenReadingMode}
          onToggleZenReadingMode={handleToggleZenReadingMode}
          activeTheme={activeTheme}
          onSelectTheme={handleSelectActiveTheme}
          appStudyFont={appStudyFont}
          onSelectAppStudyFont={handleSelectAppStudyFont}
          menuPixelFont={menuPixelFont}
          onSelectMenuPixelFont={handleSelectMenuPixelFont}
          dailyPomodoroLogs={profileStats.dailyPomodoroLogs}
          dailyGoalMinutes={dailyGoalMinutes}
          onChangeDailyGoalMinutes={handleChangeDailyGoalMinutes}
          todayStudiedSeconds={getTodayStudiedSeconds(profileStats)}
          invincibleRemainingLabel={invincibleRemainingLabel}
          doubleXpRemainingLabel={doubleXpRemainingLabel}
          unlockAllRemainingLabel={unlockAllRemainingLabel}
          userProgression={userProgression}
          onOpenLevelProgression={() => setIsLevelProgressionOpen(true)}
          onOpenDailyMissions={() => setIsDailyMissionsOpen(true)}
          onOpenGoalHistory={() => setIsGoalHistoryOpen(true)}
          onOpenKnowledgeGraph={() => setIsKnowledgeGraphOpen(true)}
          onOpenToadTrainingLog={() => setIsToadsTrainingLogOpen(true)}
        />

        {/* Breadcrumb Navigation Trail directly below Header in 'Modules' View */}
        {activeTab === 'modules' && !zenMode && (
          <nav
            aria-label="Modules Breadcrumb Navigation"
            data-testid="modules-breadcrumb-nav"
            className="bg-slate-900/98 border-b-2 border-amber-400/70 px-3 sm:px-4 py-1.5 sm:py-2 print:hidden"
          >
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs min-w-0 flex-1">
                <button
                  type="button"
                  data-testid="breadcrumb-return-map-btn"
                  onClick={() => {
                    setActiveTab('map');
                    marioAudio.playTabSwitch();
                  }}
                  className="min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-black inline-flex items-center gap-1.5 border border-slate-700 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span>World Map</span>
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />

                {/* Active World Switcher + WorldGoalRing */}
                {(() => {
                  const activeWObj = WORLDS_METADATA.find((w) => w.id === activeWorld);
                  const wTopicIds = activeWObj
                    ? topicsByWorld[activeWObj.id] || []
                    : ALL_LAW_TOPICS.map((t) => t.id);
                  const wDone = wTopicIds.filter((id) => completedTopicIds.includes(id)).length;
                  const wPct =
                    wTopicIds.length > 0 ? Math.round((wDone / wTopicIds.length) * 100) : 0;

                  return (
                    <div className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 min-h-[34px] min-w-0">
                      <WorldGoalRing percent={wPct} size={20} strokeWidth={2.6} showLabel={false} />
                      <select
                        aria-label="Switch active world from breadcrumb"
                        data-testid="breadcrumb-world-select"
                        value={activeWorld}
                        onChange={(e) => handleWorldSelect(e.target.value)}
                        className="bg-transparent text-white font-black text-xs focus:outline-none cursor-pointer min-w-0 max-w-[140px] sm:max-w-[210px] truncate"
                      >
                        <option value="all" className="bg-slate-950 text-white">
                          All 6 Worlds ({completedTopicIds.length}/{ALL_LAW_TOPICS.length})
                        </option>
                        {WORLDS_METADATA.map((w) => {
                          const ids = topicsByWorld[w.id] || [];
                          const done = ids.filter((id) => completedTopicIds.includes(id)).length;
                          return (
                            <option key={w.id} value={w.id} className="bg-slate-950 text-white">
                              W{w.worldNumber}: {w.shortTitle} ({done}/{ids.length})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  );
                })()}

                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 hidden sm:inline" aria-hidden="true" />

                {/* Active Category / Statutory Scope */}
                <span
                  data-testid="breadcrumb-active-category"
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] font-bold text-emerald-300 truncate max-w-[200px]"
                >
                  <span>
                    {activeWorld === 'all'
                      ? difficultyFilter === 'all'
                        ? 'All Statutory Categories'
                        : `${difficultyFilter} Tier`
                      : WORLDS_METADATA.find((w) => w.id === activeWorld)?.title || 'Module Topics'}
                  </span>
                </span>

                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />

                {/* Related Topics Quick-Jump Select */}
                <select
                  aria-label="Jump to related topic in current world"
                  data-testid="breadcrumb-topic-jump-select"
                  value=""
                  onChange={(e) => {
                    const topicId = e.target.value;
                    if (!topicId) return;
                    handleRecordAccessedTopic(topicId);
                    triggerTopicOpenCueById(topicId);
                    const idxInDisplayed = displayedTopics.findIndex((t) => t.id === topicId);
                    if (
                      (moduleViewMode === 'focus' || moduleViewMode === 'slides') &&
                      idxInDisplayed >= 0
                    ) {
                      setFocusTopicIdx(idxInDisplayed);
                      setSlideStepIdx(0);
                      return;
                    }
                    window.setTimeout(() => {
                      const el = document.getElementById(`topic-card-${topicId}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('ring-4', 'ring-amber-400');
                        window.setTimeout(
                          () => el.classList.remove('ring-4', 'ring-amber-400'),
                          2400
                        );
                      }
                    }, 80);
                  }}
                  className="min-h-[34px] rounded-lg bg-slate-950 border border-amber-400/60 focus:border-amber-400 px-2.5 py-1 text-xs font-bold text-amber-200 cursor-pointer min-w-0 max-w-[165px] sm:max-w-[240px] truncate"
                >
                  <option value="" disabled>
                    Jump to Topic ({displayedTopics.length})...
                  </option>
                  {displayedTopics.map((t, i) => (
                    <option key={t.id} value={t.id} className="bg-slate-950 text-white">
                      {i + 1}. {t.badge} — {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                data-testid="modules-open-quick-quiz-log-btn"
                onClick={() => {
                  setBossBattleLogInitialTab('quick');
                  setIsBossBattleLogOpen(true);
                  marioAudio.playClick();
                }}
                className="min-h-[34px] px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] border border-black inline-flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap tabular-nums"
              >
                <Trophy className="w-3.5 h-3.5 shrink-0" />
                <span>Quick Quiz Log ({quickQuizLog.length})</span>
              </button>
            </div>
          </nav>
        )}
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 pt-4 sm:pt-6 md:pt-8 pb-32 sm:pb-36 lg:pb-16 overflow-x-clip">
        {/* Persistent Mario Daily Study Goal Reached Banner + 1-Up Mushroom Bonus Celebration */}
        {dailyGoalBannerVisible && (
          <section
            role="status"
            data-testid="daily-goal-celebration-banner"
            aria-label="Daily Study Goal Reached Celebration"
            className="mb-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white rounded-2xl border-3 border-emerald-400 p-3.5 sm:p-4 shadow-[5px_5px_0_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full max-w-full overflow-hidden print:hidden"
          >
            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-2xl bg-emerald-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
                <Mario1UpIcon className="w-7 h-7" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase text-emerald-300 font-mario">
                    1-UP DAILY STUDY GOAL CLEAR!
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 border border-black text-[10px] font-black font-mario tabular-nums">
                    <MarioCoinIcon className="w-3 h-3 shrink-0" />
                    <span>+{DAILY_GOAL_BONUS_COINS} BONUS COINS</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-emerald-50">
                  Mamma Mia! Course Clear on today&apos;s Bar study target ({dailyGoalMinutes} mins)! Your 1-Up Mushroom &amp; +{DAILY_GOAL_BONUS_COINS} Gold Coin reward have been credited!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('shop');
                  marioAudio.playCoin();
                }}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] cursor-pointer whitespace-nowrap"
              >
                Spend in Toad&apos;s Shop
              </button>
              <button
                type="button"
                data-testid="dismiss-daily-goal-banner-btn"
                onClick={() => {
                  dismissDailyGoalBanner(getLocalDateKey(), window.localStorage);
                  setDailyGoalBannerVisible(false);
                  setDailyGoalMilestoneToast(false);
                }}
                aria-label="Dismiss Daily Study Goal celebration banner"
                className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-emerald-500/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* 'Review Required' (>14 Days Unaccessed) Spaced-Repetition Notification Banner */}
        {(activeTab === 'map' || activeTab === 'modules') &&
          overdueReviewTopics.length > 0 &&
          !reviewBannerDismissed && (
            <section
              data-testid="review-required-notification-banner"
              aria-label="Review Required Notification"
              className="mb-5 bg-slate-900 text-white rounded-2xl border-3 border-amber-400 p-3.5 sm:p-4 shadow-[4px_4px_0_#000] flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full max-w-full overflow-hidden print:hidden"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
                    <span className="text-[10px] font-black uppercase text-amber-300 font-mario">
                      REVIEW REQUIRED · 14+ DAYS UNACCESSED
                    </span>
                    <span className="text-slate-500" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-emerald-300 tabular-nums">
                      {overdueReviewTopics.length}{' '}
                      {overdueReviewTopics.length === 1 ? 'topic needs' : 'topics need'} refresh
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                    {overdueReviewTopics
                      .slice(0, 2)
                      .map((item) => `${item.title} (${item.daysSinceAccess}d ago)`)
                      .join(' · ')}
                    {overdueReviewTopics.length > 2
                      ? ` · +${overdueReviewTopics.length - 2} more`
                      : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  data-testid="start-overdue-flashcard-review-btn"
                  onClick={handleStartOverdueFlashcardReview}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>Quick Flashcard Review</span>
                </button>
                <button
                  type="button"
                  data-testid="dismiss-review-required-banner-btn"
                  onClick={() => setReviewBannerDismissed(true)}
                  aria-label="Dismiss Review Required notification"
                  className="min-h-[42px] px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </section>
          )}

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
                      handleRecordAccessedTopic(lastStudiedTopic.id);
                      setActiveWorld(lastStudiedTopic.worldId);
                      setActiveTab('modules');
                      triggerTopicOpenCueById(lastStudiedTopic.id);
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
              targetMinutes={dailyGoalMinutes}
              onChangeTargetMinutes={handleChangeDailyGoalMinutes}
              onEarnCoins={handleEarnCoins}
              superStarActive={isAny2xCoinActive}
            />

            {/* Ambient Mario World Sprinkles: Mystery Block, Stompable Goomba, Kickable Shell, Peeking Piranha */}
            <MarioWorldSprinkles
              onEarnCoins={handleEarnCoins}
              className="my-1 sm:my-2"
            />

            {/* Visual Flagpole Streak Progression & Celebration Banner */}
            <FlagpoleStreakWidget
              streakState={flagpoleStreakState}
              onUpdateStreakState={setFlagpoleStreakState}
              onAwardBonusXp={handleAwardBonusXp}
              equippedAvatar={equippedAvatar}
          equippedCardFrame={equippedCardFrame}
          equippedRing={equippedRing}
              onStartDailyQuiz={() => {
                setActiveTab('quiz');
                setQuizExternalLaunch((prev) => ({ mode: 'quick', nonce: (prev?.nonce || 0) + 1 }));
                marioAudio.playPowerUp();
              }}
            />

            {/* Global Study Hub Quick Launcher Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-3 sm:p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0_#000] flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center font-black">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black font-display text-white">
                    Super Mario Labor Standards Study Hub
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    6 Interactive Study Modes: 10-Question Timed Sprint, 60s Blitz, Weakness Gauntlet &amp; Pomodoro
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsGlobalStudyHubOpen(true);
                  marioAudio.playPowerUp();
                }}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase rounded-xl border-2 border-black shadow-[0_2px_0_#000] cursor-pointer whitespace-nowrap active:translate-y-0.5"
              >
                Choose Study Mode &rarr;
              </button>
            </div>

            <WorldMap
              onSelectWorld={handleMapWorldSelect}
              onSelectTopic={(worldId, topicId) => {
                handleRecordAccessedTopic(topicId);
                setActiveWorld(worldId);
                setActiveTab('modules');
                marioAudio.syncModuleAudio(worldId, true);
                triggerTopicOpenCueById(topicId);
                setTimeout(() => {
                  const el = document.getElementById(`topic-card-${topicId}`);
                  el?.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              activeWorld={activeWorld}
              fontSize={fontSize}
              equippedAvatar={equippedAvatar}
          equippedCardFrame={equippedCardFrame}
          equippedRing={equippedRing}
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
              superStarActive={isAny2xCoinActive}
              recentlyViewedTopics={recentlyViewedTopics}
              pinnedRuleBookmarks={pinnedRuleBookmarks}
              onJumpToPinnedRule={(worldId, topicId) => {
                handleRecordAccessedTopic(topicId);
                setActiveWorld(worldId);
                setActiveTab('modules');
                marioAudio.syncModuleAudio(worldId, true);
                triggerTopicOpenCueById(topicId);
                setTimeout(() => {
                  const el = document.getElementById(`topic-card-${topicId}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('ring-4', 'ring-amber-400');
                    setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 2500);
                  }
                }, 150);
              }}
              onRemovePinnedRule={handleRemovePinnedRule}
              unlockAllModulesActive={isUnlockAllActive}
              favoriteTopicIds={bookmarkedTopicIds}
              onToggleFavoriteTopic={handleToggleBookmarkTopic}
              unlockedShopItemIds={(() => {
                if (typeof window === 'undefined') return [];
                try {
                  const baseRaw = window.localStorage.getItem('mario_unlocked_items');
                  const baseArr: string[] = baseRaw ? JSON.parse(baseRaw) : [];
                  const r10 = loadRound10VaultState(window.localStorage);
                  return Array.from(new Set([...baseArr, ...(r10.unlockedIds || [])]));
                } catch {
                  return [];
                }
              })()}
            />


            {/* Quick Access Portal Banners — Equal Height & Aligned Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 pb-4">
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
                    <p className="text-xs font-bold text-slate-600 truncate">47 Arcade Games</p>
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
          <div className="space-y-4 sm:space-y-6 w-full max-w-full min-w-0">
            {/* Smooth Mario Stage-Banner Indicator on World/Module Entry */}
            {modulesStageBanner && (
              <div
                role="status"
                data-testid="modules-stage-transition-banner"
                className="bg-slate-950 text-amber-300 border-2 border-amber-400 rounded-2xl px-4 py-2.5 shadow-[3px_3px_0_#000] flex items-center justify-between gap-3 animate-fade-in"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MarioPipeIcon className="w-5 h-5 shrink-0" />
                  <span className="text-[10px] sm:text-xs font-black uppercase font-mario truncate">
                    {modulesStageBanner}
                  </span>
                </div>
                <span className="text-[10px] font-black text-emerald-400 font-mario shrink-0">
                  STAGE READY
                </span>
              </div>
            )}

            {/* Overall Labor Law Visual Progress Bar Component at the Very Top of Modules View */}
            <LaborLawProgressBar
              allTopics={ALL_LAW_TOPICS}
              completedTopicIds={completedTopicIds}
              activeWorld={activeWorld}
              onSelectWorld={(worldId) => {
                setActiveWorld(worldId);
                marioAudio.syncModuleAudio(worldId, true);
              }}
              equippedAvatar={equippedAvatar}
          equippedCardFrame={equippedCardFrame}
          equippedRing={equippedRing}
              favoriteCount={bookmarkedTopicIds.length}
              showFavoritesOnly={moduleStatusFilter === 'bookmarked'}
              onToggleFavoritesFilter={() => {
                setModuleStatusFilter((prev) => (prev === 'bookmarked' ? 'all' : 'bookmarked'));
                marioAudio.playCoin();
              }}
              onEarnCoins={handleEarnCoins}
            />

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

            {/* Unified Dark-Slate Stage & Study Command Deck (Zero White Cropped Navigator, Zero Horizontal Overflow) */}
            <section
              aria-label="Modules Stage and Study Command Deck"
              data-testid="modules-command-deck"
              className="bg-[#1e293b] text-white rounded-3xl border-4 border-slate-950 p-4 sm:p-6 shadow-[6px_6px_0_#000] w-full max-w-full overflow-hidden space-y-4"
            >
              {/* Row 1: Title & Primary Study Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-600 text-white font-black rounded-lg border border-black text-[10px] uppercase mb-1.5 font-mario">
                    <MarioMushroomIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>PHILIPPINE LABOR STANDARDS</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight font-display">
                    LABOR STANDARDS &amp; PROTECTIVE LAWS
                  </h1>
                  <p className={`${bodyTextClass} text-slate-300 font-semibold mt-0.5 max-w-2xl text-xs sm:text-sm`}>
                    Unabridged statutory provisions, wage multipliers, exceptions, and Supreme Court doctrines across Worlds 1–6.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Direct 1-Page A4 Legal Summary PDF Launcher */}
                  <button
                    type="button"
                    data-testid="modules-one-page-summary-btn"
                    onClick={() => {
                      openPrintStudio('summary');
                      marioAudio.playCoin();
                    }}
                    className="min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-2 border-black shadow-[0_2px_0_#000] cursor-pointer inline-flex items-center gap-1.5 transition-all whitespace-nowrap active:translate-y-0.5"
                  >
                    <FileDown className="w-4 h-4 text-slate-950 shrink-0" />
                    <span>1-Page A4 PDF</span>
                  </button>

                  {/* Direct Statute Lookup Launcher */}
                  <button
                    type="button"
                    data-testid="modules-statute-lookup-btn"
                    onClick={() => {
                      setIsStatuteLookupOpen(true);
                      marioAudio.playCoin();
                    }}
                    className="min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs font-black bg-sky-400 hover:bg-sky-300 text-slate-950 border-2 border-black shadow-[0_2px_0_#000] cursor-pointer inline-flex items-center gap-1.5 transition-all whitespace-nowrap active:translate-y-0.5"
                  >
                    <Scale className="w-4 h-4 text-slate-950 shrink-0" />
                    <span>Statute Lookup</span>
                  </button>

                  {/* Direct Legal Glossary Quick Launcher */}
                  <button
                    type="button"
                    data-testid="modules-top-glossary-btn"
                    onClick={() => {
                      setIsQuickGlossaryOpen(true);
                      marioAudio.playPowerUp();
                    }}
                    className="min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-black shadow-[0_2px_0_#000] cursor-pointer inline-flex items-center gap-1.5 transition-all whitespace-nowrap active:translate-y-0.5"
                  >
                    <MarioQuestionBlockIcon className="w-4 h-4 text-slate-950 shrink-0" />
                    <span>Glossary</span>
                  </button>

                  {/* Split View Toggle for Integrated Reading & Note-taking */}
                  <button
                    type="button"
                    data-testid="toggle-split-view-btn"
                    onClick={() => {
                      setIsSplitView(!isSplitView);
                      marioAudio.playPipe();
                    }}
                    className={`min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs font-black border-2 border-black cursor-pointer inline-flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      isSplitView
                        ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                        : 'bg-slate-900 text-slate-200 hover:text-white'
                    }`}
                  >
                    <Columns className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{isSplitView ? 'Split View ON' : 'Split View'}</span>
                  </button>

                  {/* Inline Study Notes Drawer Trigger (replaces overlapping floating tab on mobile/tablet/laptop) */}
                  <button
                    type="button"
                    data-testid="modules-open-notes-btn"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('mario-open-study-notes'));
                    }}
                    className="min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-amber-300 border-2 border-black cursor-pointer inline-flex items-center gap-1.5 transition-all whitespace-nowrap"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Notes ({studyNotes.length})</span>
                  </button>

                  {/* Complexity Quick Switcher */}
                  <div className="inline-flex items-center gap-1 bg-slate-950 p-1 rounded-xl border-2 border-black">
                    <button
                      type="button"
                      onClick={() => handleSetComplexityMode('beginner')}
                      className={`min-h-[34px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                        complexityMode === 'beginner'
                          ? 'bg-amber-400 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <MarioMushroomIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>Beginner</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetComplexityMode('advanced')}
                      className={`min-h-[34px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                        complexityMode === 'advanced'
                          ? 'bg-red-600 text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 shrink-0" />
                      <span>Advanced</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Responsive 7-Button World Stage Selector Grid with Pixel-Art Completion Badges */}
              <div
                role="tablist"
                aria-label="Select Labor Law World Stage"
                className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 w-full"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeWorld === 'all'}
                  onClick={() => handleWorldSelect('all')}
                  className={`min-h-[68px] p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer min-w-0 flex flex-col justify-between ${
                    activeWorld === 'all'
                      ? 'bg-amber-400 text-slate-950 border-black shadow-[0_3px_0_#000] -translate-y-0.5'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-700'
                  }`}
                >
                  <div>
                    {renderPixelWorldBadge(
                      'all',
                      completedTopicIds.length,
                      ALL_LAW_TOPICS.length
                    )}
                    <span
                      className={`text-[10px] font-black uppercase block font-mario truncate ${
                        activeWorld === 'all' ? 'text-slate-800' : 'text-amber-300'
                      }`}
                    >
                      ALL WORLDS
                    </span>
                  </div>
                  <span className="font-black text-xs flex items-center justify-between gap-1 mt-0.5 min-w-0">
                    <span className="truncate">Complete View</span>
                    <MarioStarIcon className="w-4 h-4 shrink-0" />
                  </span>
                </button>

                {WORLDS_METADATA.map((w) => {
                  const isActiveW = activeWorld === w.id;
                  const worldTopicIds = topicsByWorld[w.id] || [];
                  const doneInWorld = worldTopicIds.filter((id) =>
                    completedTopicIds.includes(id)
                  ).length;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      role="tab"
                      aria-selected={isActiveW}
                      onClick={() => handleWorldSelect(w.id)}
                      className={`min-h-[68px] p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer min-w-0 flex flex-col justify-between ${
                        isActiveW
                          ? 'bg-amber-400 text-slate-950 border-black shadow-[0_3px_0_#000] -translate-y-0.5'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-700'
                      }`}
                    >
                      <div>
                        {renderPixelWorldBadge(w.id, doneInWorld, worldTopicIds.length)}
                        <span
                          className={`text-[10px] font-black uppercase block font-mario truncate ${
                            isActiveW ? 'text-slate-800' : 'text-slate-400'
                          }`}
                        >
                          WORLD {w.worldNumber}
                        </span>
                      </div>
                      <span className="font-black text-xs flex items-center justify-between gap-1 mt-0.5 min-w-0">
                        <span className="truncate">{w.shortTitle}</span>
                        {renderWorldIcon(w.iconType, 'w-4 h-4 shrink-0')}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Row 2.5: Searchable Filter in Module View (Quick find by title or summary) */}
              <div
                data-testid="modules-search-filter-container"
                className="bg-slate-900/95 border-2 border-slate-700 rounded-2xl p-2.5 sm:p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 w-full min-w-0"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 border border-black shadow-[0_2px_0_#000]">
                    <Search className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-emerald-300 font-mario block">
                      SEARCH TOPIC MODULES
                    </span>
                    <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
                      Quick find by title, summary, or doctrine keyword
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-1 md:max-w-2xl min-w-0">
                  <div className="relative flex-1 min-w-[200px]">
                    <input
                      data-testid="modules-search-filter-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type doctrine, title or keyword (e.g. Overtime, 13th Month, Maternity)..."
                      aria-label="Search Labor Law Topics by Title or Summary"
                      className="w-full min-h-[42px] bg-slate-950 text-white placeholder:text-slate-400 text-xs sm:text-sm font-bold border-2 border-slate-700 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:border-emerald-400"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        aria-label="Clear module search"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <select
                    data-testid="global-search-filter-world-dropdown"
                    aria-label="Filter search results by world"
                    value={searchWorldFilter}
                    onChange={(e) => {
                      setSearchWorldFilter(e.target.value);
                      marioAudio.playClick();
                    }}
                    className="min-h-[42px] px-2.5 py-1.5 bg-slate-950 text-amber-300 border-2 border-slate-700 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-400 cursor-pointer shrink-0"
                  >
                    <option value="all">All Worlds</option>
                    <option value="active">Active World ({activeWorld.toUpperCase()})</option>
                    <option value="world1">W1: Principles</option>
                    <option value="world2">W2: Wages & Hours</option>
                    <option value="world3">W3: Leaves & Benefits</option>
                    <option value="world4">W4: Special Groups</option>
                    <option value="world5">W5: Labor Relations</option>
                    <option value="world6">W6: Post-Employment</option>
                  </select>
                  <span className="text-[10px] sm:text-xs font-bold text-amber-300 whitespace-nowrap px-2.5 py-2 bg-slate-950 rounded-xl border border-slate-700 shrink-0">
                    {displayedTopics.length} shown
                  </span>
                </div>
              </div>

              {/* Row 3: Integrated Topic Quick Jump Bar */}
              <div
                data-testid="modules-quick-jump-container"
                className="bg-slate-900/90 border-2 border-slate-700 rounded-2xl p-2.5 sm:p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 w-full min-w-0"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 border border-black">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
                      TOPIC QUICK JUMP
                    </span>
                    <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
                      Jump directly to any statutory card
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 md:max-w-xl min-w-0">
                  <div className="relative w-full sm:w-44 shrink-0">
                    <input
                      type="text"
                      value={quickJumpSearch}
                      onChange={(e) => setQuickJumpSearch(e.target.value)}
                      placeholder="Filter topics..."
                      aria-label="Filter Quick Jump Topics"
                      className="w-full min-h-[42px] bg-slate-950 text-white placeholder:text-slate-400 text-xs font-bold border-2 border-slate-700 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:border-amber-400"
                    />
                    {quickJumpSearch && (
                      <button
                        type="button"
                        aria-label="Clear topic filter"
                        onClick={() => setQuickJumpSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative flex-1 w-full min-w-0">
                    <select
                      data-testid="quick-jump-select"
                      aria-label="Quick Jump to Topic Card"
                      value=""
                      onChange={(e) => {
                        const topicId = e.target.value;
                        if (!topicId) return;
                        handleRecordAccessedTopic(topicId);
                        triggerTopicOpenCueById(topicId);
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
                      className="w-full min-h-[42px] bg-slate-950 text-white text-xs sm:text-sm font-bold border-2 border-slate-700 rounded-xl px-3 py-2 pr-8 cursor-pointer focus:outline-none focus:border-amber-400 truncate"
                    >
                      <option value="" disabled>
                        {quickJumpFilteredTopics.length === 0
                          ? '-- No Matching Topics Found --'
                          : `-- Jump to Topic (${quickJumpFilteredTopics.length} available) --`}
                      </option>
                      {WORLDS_METADATA.map((world) => {
                        const worldTopics = quickJumpFilteredTopics.filter(
                          (t) => t.worldId === world.id
                        );
                        if (worldTopics.length === 0) return null;
                        return (
                          <optgroup
                            key={world.id}
                            label={`World ${world.worldNumber}: ${world.title}`}
                          >
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

              {/* Ambient Interactive Mario World Elements Sprinkles */}
              <MarioWorldSprinkles onEarnCoins={handleEarnCoins} className="mb-3" />

              {/* Row 3.4: Mario World Elements & Mystery Power-Up Spawner */}
              <div
                data-testid="mario-elements-powerup-bar"
                className="bg-gradient-to-r from-red-950/70 via-slate-900 to-amber-950/70 border-2 border-amber-400/60 rounded-2xl p-3 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-testid="hit-mystery-block-btn"
                      onClick={() => {
                        const randomIndex = Math.floor(Math.random() * MARIO_WORLD_ELEMENTS.length);
                        const picked = MARIO_WORLD_ELEMENTS[randomIndex];
                        setActiveMarioWorldElement(picked);
                        marioAudio.playPowerUp();
                        handleEarnCoins(2);
                      }}
                      className="min-h-[36px] px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs font-mario rounded-xl border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
                    >
                      <MarioQuestionBlockIcon className="w-4 h-4 shrink-0 text-slate-950" />
                      <span>[?] HIT MYSTERY BLOCK (+2 COINS)</span>
                    </button>
                    <span className="text-[11px] font-bold text-slate-300 hidden sm:inline">
                      Discover random Mario World statutory doctrines & legal power-ups
                    </span>
                  </div>

                  <button
                    type="button"
                    data-testid="launch-doctrine-duel-btn"
                    onClick={() => {
                      setActiveTopicDuel(TOPIC_DUEL_PAIRS[0]);
                      setTopicDuelShowVerdict(false);
                      marioAudio.playCoin();
                    }}
                    className="min-h-[36px] px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Swords className="w-4 h-4 shrink-0" />
                    <span>DOCTRINE DUEL (4 SHOWDOWNS)</span>
                  </button>
                </div>

                {/* Horizontal Element Icons Strip */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {MARIO_WORLD_ELEMENTS.map((elem) => (
                    <button
                      key={elem.id}
                      type="button"
                      onClick={() => {
                        setActiveMarioWorldElement(elem);
                        marioAudio.playClick();
                      }}
                      className={`min-h-[32px] px-2 py-1 rounded-lg border text-[11px] font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                        activeMarioWorldElement?.id === elem.id
                          ? 'bg-amber-400 text-slate-950 border-black font-black'
                          : 'bg-slate-950/80 hover:bg-slate-800 text-slate-200 border-slate-700'
                      }`}
                    >
                      <MarioWorldElementBadgeIcon iconType={elem.iconType} className="w-4 h-4 shrink-0" />
                      <span className="truncate max-w-[120px]">{elem.name}</span>
                    </button>
                  ))}
                </div>

                {/* Active Mario Element Spotlight */}
                {activeMarioWorldElement && (
                  <div
                    data-testid="active-mario-element-card"
                    className="bg-slate-950/90 border border-amber-400/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-fadeIn"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-11 h-11 p-2 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                        <MarioWorldElementBadgeIcon iconType={activeMarioWorldElement.iconType} className="w-6 h-6 shrink-0" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-black text-xs text-amber-300 font-mario">
                            {activeMarioWorldElement.name}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold">
                            {activeMarioWorldElement.statuteCitation}
                          </span>
                        </div>
                        <p className="text-xs text-white font-semibold mt-0.5">
                          {activeMarioWorldElement.doctrineSummary}
                        </p>
                        <p className="text-[11px] text-amber-200 italic mt-0.5">
                          &ldquo;{activeMarioWorldElement.flavorQuote}&rdquo;
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveMarioWorldElement(null)}
                      className="self-end sm:self-center text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>

              {/* Row 3.5: Named Workspace Session Bookmarks (Scroll Position, Active World & Open Cards) */}
              <div className="pt-3 border-t border-slate-700/80">
                <ModuleSessionBookmarksBar
                  activeWorld={activeWorld}
                  openTopicIds={openTopicIds}
                  moduleViewMode={moduleViewMode}
                  onRestoreSlot={handleRestoreModuleSessionSlot}
                />
              </div>

              {/* Row 4: View Mode, Complexity & Completion Status Controls */}
              <div
                data-testid="module-view-options-bar"
                className="pt-3 border-t border-slate-700/80 space-y-3"
              >
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
                  {/* View Layout Selector */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-300 mr-1 whitespace-nowrap">
                      View:
                    </span>
                    {(
                      [
                        {
                          id: 'stream' as const,
                          label: 'Stream',
                          icon: <BookOpen className="w-3.5 h-3.5 shrink-0" />,
                        },
                        {
                          id: 'grid' as const,
                          label: '2-Col Grid',
                          icon: <LayoutGrid className="w-3.5 h-3.5 shrink-0" />,
                        },
                        {
                          id: 'outline' as const,
                          label: 'Outline',
                          icon: <List className="w-3.5 h-3.5 shrink-0" />,
                        },
                        {
                          id: 'focus' as const,
                          label: 'Focus Reader',
                          icon: <Compass className="w-3.5 h-3.5 shrink-0" />,
                        },
                        {
                          id: 'slides' as const,
                          label: 'Slide Deck',
                          icon: <Presentation className="w-3.5 h-3.5 shrink-0" />,
                        },
                      ]
                    ).map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        data-testid={`module-view-mode-${mode.id}`}
                        onClick={() => {
                          setRestoredOpenSignal(null);
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
                            : 'bg-slate-900 text-slate-200 hover:text-white border-slate-700'
                        }`}
                      >
                        {mode.icon}
                        <span>{mode.label}</span>
                      </button>
                    ))}

                    <button
                      type="button"
                      data-testid="modules-expand-all-btn"
                      onClick={() => {
                        setRestoredOpenSignal(null);
                        setExpandCollapseSignal((prev) => ({
                          mode: 'expand',
                          seq: (prev?.seq || 0) + 1,
                        }));
                        marioAudio.playJump();
                      }}
                      className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <ChevronsDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Expand All</span>
                    </button>
                    <button
                      type="button"
                      data-testid="modules-collapse-all-btn"
                      onClick={() => {
                        setRestoredOpenSignal(null);
                        setExpandCollapseSignal((prev) => ({
                          mode: 'collapse',
                          seq: (prev?.seq || 0) + 1,
                        }));
                        marioAudio.playPipe();
                      }}
                      className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <ChevronsUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Collapse All</span>
                    </button>
                    <button
                      type="button"
                      data-testid="modules-autoscroll-toggle-btn"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('mario-toggle-autoscroll'));
                      }}
                      className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <ChevronsDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Auto-Scroll</span>
                    </button>
                  </div>

                  {/* Completion Status Filter */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400 mr-1 whitespace-nowrap">
                      Status:
                    </span>
                    {(
                      [
                        { id: 'all' as const, label: 'All' },
                        { id: 'unread' as const, label: 'Unread' },
                        { id: 'mastered' as const, label: 'Mastered' },
                        { id: 'flagged' as const, label: 'Flagged' },
                        {
                          id: 'bookmarked' as const,
                          label: `Pinned (${bookmarkedTopicIds.length})`,
                        },
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
                        className={`min-h-[40px] px-3 py-1 rounded-xl text-xs font-black border transition-colors cursor-pointer whitespace-nowrap ${
                          moduleStatusFilter === st.id
                            ? 'bg-emerald-400 text-slate-950 border-black'
                            : 'bg-slate-900 text-slate-300 hover:text-white border-slate-700'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Statutory Complexity Filter */}
                <div
                  data-testid="difficulty-filter-container"
                  className="flex flex-wrap items-center gap-1.5"
                >
                  <span className="text-xs font-bold text-slate-400 mr-1 whitespace-nowrap">
                    Difficulty:
                  </span>
                  {[
                    { id: 'all', label: 'All Levels' },
                    { id: 'Foundation', label: 'Foundation (Easy)' },
                    { id: 'Intermediate', label: 'Intermediate' },
                    { id: 'Bar Master', label: 'Advanced Mastery' },
                  ].map((diff) => {
                    const isSel = difficultyFilter === diff.id;
                    const testId = `difficulty-filter-${diff.id
                      .toLowerCase()
                      .replace(/\s+/g, '')}`;
                    return (
                      <button
                        key={diff.id}
                        type="button"
                        data-testid={testId}
                        onClick={() => {
                          setDifficultyFilter(diff.id as any);
                          marioAudio.playCoin();
                        }}
                        className={`min-h-[38px] px-3 py-1 rounded-xl font-black text-xs border transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                          isSel
                            ? 'bg-amber-400 text-slate-950 border-black'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {diff.id === 'Bar Master' ? (
                          <MarioStarIcon className="w-3 h-3 text-amber-500 shrink-0" />
                        ) : diff.id === 'Foundation' ? (
                          <MarioMushroomIcon className="w-3 h-3 text-emerald-500 shrink-0" />
                        ) : diff.id === 'Intermediate' ? (
                          <MarioFireFlowerIcon className="w-3 h-3 text-red-500 shrink-0" />
                        ) : null}
                        <span>{diff.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Focused 25-Minute 'Study Sprint' Pomodoro Timer & Study Ambience Bar */}
            {moduleViewMode !== 'focus' && (
              <ModulesStudySprint
                activeTab={activeTab}
                onEarnCoins={handleEarnCoins}
                onOpenStatuteLookup={() => setIsStatuteLookupOpen(true)}
              />
            )}

            {/* Smooth Container on World / Topic Filter Switch (preserves mounted TopicCards) */}
            <div
              data-testid="module-doctrine-transition"
              className="space-y-5 animate-module-slide-in w-full max-w-full min-w-0"
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

              {/* Topic Sort Drop-Down Bar directly above the Topic Cards */}
              <div
                data-testid="module-topic-sort-bar"
                className="bg-slate-900 text-white rounded-2xl px-4 py-3 border-3 border-black shadow-[4px_4px_0_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0"
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-200 min-w-0">
                  <ArrowUpDown className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">
                    Showing <strong className="font-black text-amber-300 tabular-nums">{displayedTopics.length}</strong>{' '}
                    {displayedTopics.length === 1 ? 'topic module' : 'topic modules'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
                  <label
                    htmlFor="module-topic-sort-select"
                    className="text-xs font-black text-amber-300 whitespace-nowrap shrink-0"
                  >
                    Sort Topics:
                  </label>
                  <select
                    id="module-topic-sort-select"
                    data-testid="module-topic-sort-select"
                    value={topicSortBy}
                    onChange={(e) => {
                      setTopicSortBy(e.target.value as TopicSortOption);
                      marioAudio.playClick();
                    }}
                    className="min-h-[42px] min-w-0 w-full sm:w-auto flex-1 rounded-xl bg-slate-950 border-2 border-slate-700 focus:border-amber-400 px-3 py-1.5 text-xs sm:text-sm font-bold text-white cursor-pointer"
                  >
                    {TOPIC_SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                    {moduleViewMode === 'slides' ? (
                      (() => {
                        const clampedIdx = Math.min(
                          Math.max(0, focusTopicIdx),
                          displayedTopics.length - 1
                        );
                        const slideTopic = displayedTopics[clampedIdx];
                        if (!slideTopic) return null;
                        const slideDiff =
                          slideTopic.difficulty ||
                          TOPIC_DIFFICULTY_MAP[slideTopic.id] ||
                          'Intermediate';
                        const slideCheck = getTopicQuickCheck(slideTopic);
                        const totalSlides = 5;
                        const safeStep = Math.min(Math.max(0, slideStepIdx), totalSlides - 1);

                        return (
                          <div
                            data-testid="module-slides-deck"
                            className="bg-slate-900 text-white rounded-3xl border-4 border-slate-950 shadow-[6px_6px_0_#000] overflow-hidden"
                          >
                            {/* Slide Deck Header */}
                            <div className="bg-slate-950 px-4 py-3.5 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Presentation className="w-5 h-5 text-amber-400 shrink-0" />
                                <select
                                  aria-label="Select presentation module"
                                  value={clampedIdx}
                                  onChange={(e) => {
                                    setFocusTopicIdx(Number(e.target.value) || 0);
                                    setSlideStepIdx(0);
                                    setSlideQuizChoice(null);
                                    marioAudio.playClick();
                                  }}
                                  className="min-h-[40px] min-w-0 max-w-full sm:max-w-md rounded-xl bg-slate-900 border border-slate-700 px-3 text-xs sm:text-sm font-bold text-white"
                                >
                                  {displayedTopics.map((item, idx) => (
                                    <option key={item.id} value={idx}>
                                      {idx + 1}. {item.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 tabular-nums">
                                <span>{getFriendlyDifficultyLabel(slideDiff)}</span>
                                <span aria-hidden="true">·</span>
                                <span className="text-amber-300">
                                  Slide {safeStep + 1} / {totalSlides}
                                </span>
                              </div>
                            </div>

                            {/* Active Slide Canvas */}
                            <div className="p-5 sm:p-8 min-h-[300px] flex flex-col justify-between gap-6">
                              {safeStep === 0 && (
                                <div className="space-y-4">
                                  <span className="text-xs font-bold text-amber-300 block">
                                    01. Practical Overview · {slideTopic.badge}
                                  </span>
                                  <h3 className="text-xl sm:text-3xl font-black font-display text-white leading-tight">
                                    {slideTopic.title}
                                  </h3>
                                  <p className="text-sm sm:text-base font-medium text-slate-200 leading-relaxed">
                                    {complexityMode === 'beginner' && slideTopic.beginnerSummary
                                      ? slideTopic.beginnerSummary
                                      : slideTopic.summary}
                                  </p>
                                </div>
                              )}

                              {safeStep === 1 && (
                                <div className="space-y-4">
                                  <span className="text-xs font-bold text-emerald-300 block">
                                    02. Core Workplace Precepts
                                  </span>
                                  <h3 className="text-lg sm:text-2xl font-black font-display text-white">
                                    Essential Rules to Remember
                                  </h3>
                                  <ul className="space-y-2.5">
                                    {slideTopic.keyDoctrines.slice(0, 5).map((doc, dIdx) => (
                                      <li
                                        key={dIdx}
                                        className="bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed"
                                      >
                                        {doc}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {safeStep === 2 && (
                                <div className="space-y-4">
                                  <span className="text-xs font-bold text-sky-300 block">
                                    03. Key Statutory Rules &amp; Exceptions
                                  </span>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {slideTopic.rules.slice(0, 4).map((rule, rIdx) => (
                                      <div
                                        key={rIdx}
                                        className="bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 space-y-1.5"
                                      >
                                        <h4 className="text-sm font-black text-amber-300">
                                          {rule.heading}
                                        </h4>
                                        <p className="text-xs text-slate-200 leading-relaxed">
                                          {rule.description ||
                                            rule.items?.[0] ||
                                            'Refer to full statutory breakdown.'}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {safeStep === 3 && (
                                <div className="space-y-4">
                                  <span className="text-xs font-bold text-amber-300 block">
                                    04. Practical Study Checkpoints
                                  </span>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(slideTopic.keyTips || slideTopic.barTips || [slideTopic.summary])
                                      .slice(0, 4)
                                      .map((tip, tIdx) => (
                                        <div
                                          key={tIdx}
                                          className="bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed"
                                        >
                                          {tip}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {safeStep === 4 && (
                                <div className="space-y-4">
                                  <span className="text-xs font-bold text-lime-300 block">
                                    05. Interactive Slide Check (+3 Coins)
                                  </span>
                                  <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed break-words [overflow-wrap:anywhere] whitespace-normal">
                                    {slideCheck.question}
                                  </p>
                                  <div className="flex flex-col gap-2.5 w-full">
                                    {slideCheck.options.map((opt, oIdx) => {
                                      const picked = slideQuizChoice === oIdx;
                                      const isRight = oIdx === slideCheck.correctIndex;
                                      return (
                                        <button
                                          key={oIdx}
                                          type="button"
                                          onClick={() => {
                                            setSlideQuizChoice(oIdx);
                                            if (isRight) {
                                              handleEarnCoins(3);
                                              marioAudio.playCoin();
                                            } else {
                                              marioAudio.playWrongAnswer();
                                            }
                                          }}
                                          className={`w-full min-h-[48px] h-auto p-3.5 rounded-xl border-2 text-left text-xs sm:text-sm font-bold cursor-pointer flex items-start gap-2.5 break-words [overflow-wrap:anywhere] whitespace-normal leading-relaxed transition-all ${
                                            slideQuizChoice !== null
                                              ? isRight
                                                ? 'bg-emerald-500 text-slate-950 border-black font-black'
                                                : picked
                                                ? 'bg-rose-500 text-white border-black font-black'
                                                : 'bg-slate-950/60 text-slate-400 border-slate-800'
                                              : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                                          }`}
                                        >
                                          <span className="w-6 h-6 rounded-md bg-black/60 border border-slate-700 text-amber-300 font-mono font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                            {String.fromCharCode(65 + oIdx)}
                                          </span>
                                          <span className="w-full min-w-0 break-words [overflow-wrap:anywhere] whitespace-normal leading-relaxed flex-1">
                                            {opt}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {slideQuizChoice !== null && (
                                    <p className="text-xs sm:text-sm font-semibold text-emerald-300 leading-relaxed break-words [overflow-wrap:anywhere] whitespace-normal p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/60">
                                      {slideCheck.explanation}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Slide Navigation Footer */}
                              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                                <button
                                  type="button"
                                  disabled={safeStep === 0}
                                  onClick={() => {
                                    setSlideStepIdx((s) => Math.max(0, s - 1));
                                    marioAudio.playClick();
                                  }}
                                  className="min-h-[42px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-black text-xs border border-slate-600 inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                  <span>Prev Slide</span>
                                </button>

                                <div className="flex items-center gap-1.5">
                                  {[0, 1, 2, 3, 4].map((dot) => (
                                    <button
                                      key={dot}
                                      type="button"
                                      aria-label={`Go to slide ${dot + 1}`}
                                      onClick={() => setSlideStepIdx(dot)}
                                      className={`h-2.5 rounded-full transition-all cursor-pointer ${
                                        safeStep === dot
                                          ? 'w-7 bg-amber-400'
                                          : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                                      }`}
                                    />
                                  ))}
                                </div>

                                {safeStep < totalSlides - 1 ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSlideStepIdx((s) => Math.min(totalSlides - 1, s + 1));
                                      marioAudio.playClick();
                                    }}
                                    className="min-h-[42px] px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black inline-flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <span>Next Slide</span>
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleToggleTopicComplete(slideTopic.id);
                                      if (clampedIdx < displayedTopics.length - 1) {
                                        setFocusTopicIdx(clampedIdx + 1);
                                        setSlideStepIdx(0);
                                        setSlideQuizChoice(null);
                                      }
                                    }}
                                    className="min-h-[42px] px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs border-2 border-black inline-flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Master &amp; Next Topic</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : moduleViewMode === 'focus' ? (
                      (() => {
                        const clampedIdx = Math.min(
                          Math.max(0, focusTopicIdx),
                          displayedTopics.length - 1
                        );
                        const focusedTopic = displayedTopics[clampedIdx];
                        return (
                          <div
                            data-testid="module-focus-reader"
                            className="space-y-4 w-full max-w-full min-w-0 overflow-x-hidden"
                          >
                            <div className="bg-slate-900 text-white rounded-2xl p-3 sm:p-4 border-2 border-slate-950 flex flex-wrap items-center justify-between gap-3 w-full max-w-full min-w-0 overflow-hidden">
                              <button
                                type="button"
                                disabled={clampedIdx === 0}
                                onClick={() => {
                                  const nextIdx = Math.max(0, clampedIdx - 1);
                                  setFocusTopicIdx(nextIdx);
                                  if (displayedTopics[nextIdx]) {
                                    handleRecordAccessedTopic(displayedTopics[nextIdx].id);
                                  }
                                  marioAudio.playPipe();
                                }}
                                className="min-h-[42px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-black text-xs border border-slate-600 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                              >
                                <ChevronLeft className="w-4 h-4 shrink-0" />
                                <span>Previous Module</span>
                              </button>

                              <div className="flex items-center gap-2 min-w-0 max-w-full flex-1 sm:flex-initial justify-center">
                                <span className="text-xs font-black text-amber-300 tabular-nums whitespace-nowrap shrink-0">
                                  Module {clampedIdx + 1} of {displayedTopics.length}
                                </span>
                                <select
                                  aria-label="Select focus module"
                                  value={clampedIdx}
                                  onChange={(e) => {
                                    const nextIdx = Number(e.target.value) || 0;
                                    setFocusTopicIdx(nextIdx);
                                    if (displayedTopics[nextIdx]) {
                                      handleRecordAccessedTopic(displayedTopics[nextIdx].id);
                                    }
                                    marioAudio.playClick();
                                  }}
                                  className="min-h-[40px] min-w-0 w-full max-w-[190px] sm:max-w-xs rounded-xl bg-slate-950 border border-slate-700 px-3 text-xs font-bold text-white truncate"
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
                                  const nextIdx = Math.min(
                                    displayedTopics.length - 1,
                                    clampedIdx + 1
                                  );
                                  setFocusTopicIdx(nextIdx);
                                  if (displayedTopics[nextIdx]) {
                                    handleRecordAccessedTopic(displayedTopics[nextIdx].id);
                                  }
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
                                onEarnCoins={handleEarnCoins}
                                isBookmarked={bookmarkedTopicIds.includes(focusedTopic.id)}
                                onToggleBookmark={() => handleToggleBookmarkTopic(focusedTopic.id)}
                                masteredSectionsMap={topicMasteredSections}
                                onToggleSectionMastered={handleToggleSectionMastered}
                                pinnedRuleIds={pinnedRuleIdSet}
                                onTogglePinRuleItem={handleTogglePinRuleItem}
                                onOpenTopicFlashcardMode={(t) => setActiveTopicFlashcardModal(t)}
                                onOpenTopicQuickQuiz={(t) => setActiveTopicQuickQuizModal(t)}
                                restoredOpenSignal={restoredOpenSignal}
                                onOpenStateChange={handleTopicOpenStateChange}
                                activeWorld={activeWorld}
                                selectedWorld={searchWorldFilter}
                                onFilterWorldChange={(w) => setSearchWorldFilter(w)}
                              />
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      displayedTopics.map((topic, idx) => (
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
                          defaultExpanded={
                            activeWorld !== 'all' ||
                            Boolean(searchQuery.trim()) ||
                            idx < 4 ||
                            topic.id === lastStudiedTopicId
                          }
                          onEarnCoins={handleEarnCoins}
                          isBookmarked={bookmarkedTopicIds.includes(topic.id)}
                          onToggleBookmark={() => handleToggleBookmarkTopic(topic.id)}
                          masteredSectionsMap={topicMasteredSections}
                          onToggleSectionMastered={handleToggleSectionMastered}
                          pinnedRuleIds={pinnedRuleIdSet}
                          onTogglePinRuleItem={handleTogglePinRuleItem}
                          onOpenTopicFlashcardMode={setActiveTopicFlashcardModal}
                          onOpenTopicQuickQuiz={setActiveTopicQuickQuizModal}
                          restoredOpenSignal={restoredOpenSignal}
                          onOpenStateChange={handleTopicOpenStateChange}
                          activeWorld={activeWorld}
                          selectedWorld={searchWorldFilter}
                          onFilterWorldChange={(w) => setSearchWorldFilter(w)}
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
            setActiveTheme={handleSelectActiveTheme}
            equippedAvatar={equippedAvatar}
          equippedCardFrame={equippedCardFrame}
          equippedRing={equippedRing}
            setEquippedAvatar={setEquippedAvatar}
            superStarEndsAt={superStarEndsAt}
            onActivateSuperStar={handleActivateSuperStar}
            shortcutMapActive={shortcutMapActive}
            onToggleShortcutMap={handleToggleShortcutMap}
            equippedCompanion={equippedCompanion}
            onEquipCompanion={handleEquipCompanion}
            equippedCardFrame={equippedCardFrame}
            onEquipCardFrame={handleEquipCardFrame}
            equippedRing={equippedRing}
            onEquipRing={handleEquipRing}
            onBoostStreak={handleBoostStreak}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            appStudyFont={appStudyFont}
            onSelectAppStudyFont={handleSelectAppStudyFont}
            onOpenCertificatePreview={() => openPrintStudio('certificate')}
            specialEventsState={specialEventsState}
            onUpdateSpecialEventsState={handleUpdateSpecialEvents}
            luxuryEquipped={luxuryEquipped}
            onUpdateLuxuryEquipped={handleUpdateLuxuryEquipped}
            onNavigateTab={(tabId) => setActiveTab(tabId as typeof activeTab)}
          />
        )}

        {/* Tab 3: Warp Zone Multiplier & Wage Calculator */}
        {activeTab === 'calculator' && (
          <div className="space-y-4">
            <MarioWorldSprinkles onEarnCoins={handleEarnCoins} />
            <BenefitsCalculator fontSize={fontSize} />
          </div>
        )}

        {/* Tab 4: Regional Wage Matrix */}
        {activeTab === 'wages_matrix' && (
          <div className="space-y-4">
            <MarioWorldSprinkles onEarnCoins={handleEarnCoins} />
            <RegionalWageMatrix fontSize={fontSize} />
          </div>
        )}

        {/* Tab 5: [ ? ] Mystery Block Flashcards & 5-Min Quick Study Mode */}
        {activeTab === 'flashcards' && (
          <div className="space-y-4">
            <MarioWorldSprinkles onEarnCoins={handleEarnCoins} />
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
              overdueTopicIds={
                overdueFlashcardSnapshotIds.length > 0
                  ? overdueFlashcardSnapshotIds
                  : overdueReviewTopics.map((item) => item.topicId)
              }
              overdueLaunchId={overdueFlashcardLaunchId}
              equippedCardFrame={equippedCardFrame}
            />
          </div>
        )}

        {/* Tab 6: Mario Arcade Game Vault (38 Total Games) */}
        {(activeTab === 'vault' || activeTab === 'game2d' || activeTab === 'game3d') && (
          <div className="w-full min-w-0 overflow-visible space-y-4">
            <GameVault
              equippedAvatar={equippedAvatar}
              equippedCardFrame={equippedCardFrame}
              equippedRing={equippedRing}
              setEquippedAvatar={setEquippedAvatar}
              coins={coins}
              setCoins={handleArcadeSetCoins}
              fontSize={fontSize}
              onQuizCompleted={handleQuizCompleted}
            />
          </div>
        )}

        {/* Tab 7: Dedicated Philippine Holidays Hub */}
        {activeTab === 'holidays' && (
          <div className="space-y-4">
            <MarioWorldSprinkles onEarnCoins={handleEarnCoins} />
            <HolidaysView fontSize={fontSize} onEarnCoins={handleEarnCoins} />
          </div>
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
            onBossQuizCompleted={handleBossQuizCompleted}
            onRecordBossBattleLog={handleRecordBossBattleLog}
            onOpenBossBattleLog={() => {
              setBossBattleLogInitialTab('boss');
              setIsBossBattleLogOpen(true);
            }}
            bossBattleLogCount={bossBattleLog.length + quickQuizLog.length}
            externalLaunchMode={quizExternalLaunch}
            dailyBossQuizStreak={dailyBossQuizStreakSnapshot}
            quizHistory={profileStats.quizHistory || []}
            bossSkipTokens={specialEventsState.bossSkipTokens}
            onConsumeBossSkipToken={handleConsumeBossSkipToken}
            onActivateBossDefeatInvincible={handleActivateBossDefeatInvincible}
            coins={coins}
            onSpendCoins={(cost) => {
              if (coins < cost) return false;
              setCoins((prev) => Math.max(0, prev - cost));
              return true;
            }}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            equippedCardFrame={equippedCardFrame}
            equippedRing={equippedRing}
            flagpoleStreak={flagpoleStreakState}
            onUpdateFlagpoleStreak={setFlagpoleStreakState}
            onAwardBonusXp={handleAwardBonusXp}
            sectionAttemptsLog={sectionAttemptsLog}
            onRecordSectionAnswer={handleRecordSectionAnswer}
          />
        )}

        {/* Tab 9: Complete Legal Citations & Exact Verbatim Statutory Provisions */}
        {activeTab === 'citations' && (
          <div className="bg-[#1e293b] rounded-3xl border-4 border-slate-950 p-4 sm:p-6 text-white shadow-[6px_6px_0_#000] mb-6">
            <CitationsView
              onSelectTopic={(worldId, topicId) => {
                handleRecordAccessedTopic(topicId);
                setActiveWorld(worldId);
                setActiveTab('modules');
                marioAudio.syncModuleAudio(worldId, true);
                triggerTopicOpenCueById(topicId);
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
          className="fixed top-[120px] right-3 left-3 sm:left-auto sm:top-28 sm:right-6 z-40 sm:max-w-sm bg-[#0f172a] text-white rounded-2xl border-3 border-amber-400 shadow-[6px_6px_0_#000] p-3.5 flex items-start gap-3 print:hidden"
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

      {/* Daily Boss Quiz Streak Bonus Toast */}
      {dailyQuizStreakToast && (
        <div
          role="status"
          data-testid="daily-quiz-streak-toast"
          className="fixed top-[120px] sm:top-20 right-3 left-3 sm:left-auto sm:right-6 z-40 sm:max-w-sm bg-slate-950 text-white rounded-2xl border-3 border-rose-500 shadow-[6px_6px_0_#000] p-3.5 flex items-center justify-between gap-3 print:hidden"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Flame className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs font-black text-amber-200 truncate">
              {dailyQuizStreakToast}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDailyQuizStreakToast(null)}
            aria-label="Dismiss Daily Quiz Streak Notification"
            className="text-slate-400 hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1-Up Mushroom Daily Study Goal Milestone Celebration Toast */}
      {dailyGoalMilestoneToast && (
        <div
          role="status"
          data-testid="daily-goal-1up-toast"
          className={`fixed ${
            dailyQuizStreakToast ? 'top-[188px] sm:top-36' : 'top-[120px] sm:top-20'
          } right-3 left-3 sm:left-auto sm:right-6 z-50 sm:max-w-sm bg-emerald-950 text-white rounded-2xl border-3 border-emerald-400 shadow-[6px_6px_0_#000] p-3.5 flex items-center justify-between gap-3 print:hidden animate-in fade-in slide-in-from-top-2 duration-200`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0">
              <Mario1UpIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-emerald-300 font-mario block">
                1-UP MILESTONE UNLOCKED!
              </span>
              <span className="text-xs font-black text-white block truncate">
                Daily Goal Reached · +{DAILY_GOAL_BONUS_COINS} Bonus Coins!
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDailyGoalMilestoneToast(false)}
            aria-label="Dismiss 1-Up Daily Goal Toast"
            className="text-emerald-200 hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Equipped Click Spark FX Overlay */}
      {clickSparks.length > 0 && (
        <div className="pointer-events-none fixed inset-0 z-[130] overflow-hidden print:hidden">
          {clickSparks.map((spark) => (
            <span
              key={spark.id}
              className="mario-click-spark"
              style={{
                left: `${spark.x}px`,
                top: `${spark.y}px`,
                borderColor: spark.color,
                boxShadow: `0 0 10px ${spark.color}`,
              }}
            />
          ))}
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
        equippedCardFrame={equippedCardFrame}
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
        dailyBossQuizStreak={dailyBossQuizStreakSnapshot}
        completedTopicsSparkline={completedTopicsSparkline}
        onOpenBossBattleLog={() => {
          setIsProfileOpen(false);
          setBossBattleLogInitialTab('boss');
          setIsBossBattleLogOpen(true);
        }}
        bossBattleLogCount={bossBattleLog.length + quickQuizLog.length}
        onLaunchWeaknessDrill={handleLaunchWeaknessDrill}
        coinLedger={coinLedger}
        completedTopicsHistory={completedTopicsHistory}
        equippedLuxuryFrame={luxuryEquipped.avatarFrame}
        equippedLuxuryAura={luxuryEquipped.mushroomAura}
        userProgression={userProgression}
        onOpenLevelProgression={() => {
          setIsProfileOpen(false);
          setIsLevelProgressionOpen(true);
        }}
        flagpoleStreak={flagpoleStreakState}
        onUpdateFlagpoleStreak={setFlagpoleStreakState}
        onAwardBonusXp={handleAwardBonusXp}
        bossBattleLog={bossBattleLog}
        onFightBoss={(worldId) => {
          setIsProfileOpen(false);
          setActiveTab('quiz');
          if (worldId && worldId !== 'all') setActiveWorld(worldId);
          setQuizExternalLaunch((prev) => ({ mode: 'boss', nonce: (prev?.nonce || 0) + 1 }));
          marioAudio.playPowerUp();
        }}
        sectionAttemptsLog={sectionAttemptsLog}
        onStartTargetedDrill={(topicId) => {
          setIsProfileOpen(false);
          setActiveTab('quiz');
          setQuizExternalLaunch((prev) => ({ mode: 'flashback', nonce: (prev?.nonce || 0) + 1 }));
          marioAudio.playPowerUp();
        }}
        onStartDailyQuiz={() => {
          setIsProfileOpen(false);
          setActiveTab('quiz');
          setQuizExternalLaunch((prev) => ({ mode: 'quick', nonce: (prev?.nonce || 0) + 1 }));
          marioAudio.playPowerUp();
        }}
      />

      {/* Global Study Hub & Exam Modes Modal */}
      <GlobalStudyHubModal
        isOpen={isGlobalStudyHubOpen}
        onClose={() => setIsGlobalStudyHubOpen(false)}
        onLaunchMode={handleLaunchGlobalStudyMode}
        activeStreakDays={flagpoleStreakState.currentStreak}
        criticalTopicsCount={sectionAttemptsLog.filter((s) => !s.isCorrect).length}
      />

      {/* Statutory Multiplier Table Speed Drill Modal */}
      <StatutoryMultiplierDrillModal
        isOpen={isMultiplierDrillOpen}
        onClose={() => setIsMultiplierDrillOpen(false)}
        onEarnCoins={handleEarnCoins}
      />

      {/* Reverse Legal Citation Recitation Modal */}
      <ReverseCitationRecitationModal
        isOpen={isReverseCitationOpen}
        onClose={() => setIsReverseCitationOpen(false)}
        onEarnCoins={handleEarnCoins}
      />

      {/* 25-Minute Focus Pomodoro Study Sprint Modal */}
      <PomodoroSprintModal
        isOpen={isPomodoroSprintOpen}
        onClose={() => setIsPomodoroSprintOpen(false)}
        onEarnCoins={handleEarnCoins}
      />

      {/* Level-Up Progression & Mario Avatar Unlock Modal */}
      <LevelProgressionModal
        isOpen={isLevelProgressionOpen}
        onClose={() => setIsLevelProgressionOpen(false)}
        totalXp={userProgression.totalXp}
        equippedAvatar={equippedAvatar}
        equippedCardFrame={equippedCardFrame}
        onEquipAvatar={handleSelectAvatarPersist}
      />

      {/* Toad's Training Log D3 Line Chart Modal */}
      <ToadsTrainingLogModal
        isOpen={isToadsTrainingLogOpen}
        onClose={() => setIsToadsTrainingLogOpen(false)}
        profileStats={profileStats}
        onLaunchStudySprint={() => {
          setIsToadsTrainingLogOpen(false);
          setActiveTab('modules');
        }}
      />

      {/* Daily Missions Modal */}
      <DailyMissionModal
        isOpen={isDailyMissionsOpen}
        onClose={() => setIsDailyMissionsOpen(false)}
        onClaimCoins={(amt) => handleEarnCoins(amt)}
        onNavigateTab={(tab) => {
          setIsDailyMissionsOpen(false);
          setActiveTab(tab);
        }}
      />

      {/* Daily Study Goal History Calendar Modal */}
      <StudyGoalHistoryModal
        isOpen={isGoalHistoryOpen}
        onClose={() => setIsGoalHistoryOpen(false)}
        stats={profileStats}
        dailyGoalMinutes={dailyGoalMinutes}
        onChangeDailyGoalMinutes={handleChangeDailyGoalMinutes}
        loginStreak={loginStreak}
      />

      {/* Labor Law Interactive Knowledge Graph Modal */}
      <LaborLawKnowledgeGraphModal
        isOpen={isKnowledgeGraphOpen}
        onClose={() => setIsKnowledgeGraphOpen(false)}
        completedTopicIds={completedTopicIds}
        onSelectTopicModule={(topicId, worldId) => {
          setIsKnowledgeGraphOpen(false);
          handleRecordAccessedTopic(topicId);
          setActiveWorld(worldId || 'all');
          setActiveTab('modules');
          marioAudio.syncModuleAudio(worldId || 'world1', true);
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

      {/* Global Coin & Quiz Leaderboard Modal */}
      <CoinLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        playerName={profileStats.playerName}
        onUpdatePlayerName={handleUpdatePlayerName}
        equippedAvatar={equippedAvatar}
        equippedCardFrame={equippedCardFrame}
        coins={coins}
        streakDays={loginStreak}
        completedTopicsCount={completedTopicIds.length}
        quizHistory={profileStats.quizHistory || []}
        equippedCartridgeBadge={LUXURY_CARTRIDGE_LABELS[luxuryEquipped.cartridgeBadge] || null}
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
        equippedCardFrame={equippedCardFrame}
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
        equippedCardFrame={equippedCardFrame}
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
        activeWorld={activeWorld}
        onSelectResult={(tab, targetId) => {
          setActiveTab(tab);
          if (targetId) {
            if (validTopicIdSet.has(targetId)) {
              handleRecordAccessedTopic(targetId);
            }
            setActiveWorld('all');
            setTimeout(() => {
              const el = document.getElementById(`topic-card-${targetId}`);
              el?.scrollIntoView({ behavior: 'smooth' });
            }, 150);
          }
        }}
        onOpenPrintGuide={() => openPrintStudio('summary')}
        onOpenShop={() => {
          setActiveTab('shop');
          marioAudio.playCoin();
        }}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onStartQuickStudy={handleStartQuickStudy}
        onOpenDoleCalculator={() => setIsDoleCalculatorOpen(true)}
        onOpenResearchCohort={() => setIsResearchCohortOpen(true)}
      />

      {/* Print Study Guide & PDF Generator Modal */}
      <PrintStudyGuideModal
        isOpen={isPrintGuideOpen}
        onClose={() => setIsPrintGuideOpen(false)}
        completedTopicIds={completedTopicIds}
        coins={coins}
        studyNotes={studyNotes}
        initialMode={printGuideInitialMode}
        playerName={profileStats.playerName}
        equippedAvatar={equippedAvatar}
        equippedCardFrame={equippedCardFrame}
        loginStreak={loginStreak}
        unlockedAchievementsCount={unlockedAchievementsCount}
        totalAchievementsCount={achievementSync.achievements.length}
        quizRunsCompleted={profileStats.quizzesCompleted}
        studiedSeconds={profileStats.studiedSeconds}
        appStudyFont={appStudyFont}
        activeAppTheme={activeTheme}
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
          handleRecordAccessedTopic(topicId);
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

      {/* Labor Code & Special Laws Statute Lookup Modal */}
      <StatuteLookupModal
        isOpen={isStatuteLookupOpen}
        onClose={() => setIsStatuteLookupOpen(false)}
        onJumpToTopic={(worldId, topicId) => {
          if (topicId) {
            handleRecordAccessedTopic(topicId);
          }
          setActiveWorld(worldId || 'all');
          setActiveTab('modules');
          marioAudio.syncModuleAudio(worldId || 'world1', true);
          if (topicId) {
            setTimeout(() => {
              const el = document.getElementById(`topic-card-${topicId}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-4', 'ring-amber-400');
                setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 2500);
              }
            }, 150);
          }
        }}
      />

      {/* DOLE BWC Statutory Pay Multiplier & Wage Calculator Modal */}
      <DolePayMultiplierCalculator
        isOpen={isDoleCalculatorOpen}
        onClose={() => setIsDoleCalculatorOpen(false)}
      />

      {/* Official Research Cohort & Authors Directory Modal */}
      <ResearchCohortModal
        isOpen={isResearchCohortOpen}
        onClose={() => setIsResearchCohortOpen(false)}
      />

      {/* Bar Master 'Boss Battle & Quick Quiz Log' Modal */}
      <BossBattleLogModal
        isOpen={isBossBattleLogOpen}
        onClose={() => setIsBossBattleLogOpen(false)}
        entries={bossBattleLog}
        quickQuizEntries={quickQuizLog}
        initialTab={bossBattleLogInitialTab}
        onLaunchWeaknessDrill={() => {
          setIsBossBattleLogOpen(false);
          handleLaunchWeaknessDrill();
        }}
        onJumpToTopic={(topicId, worldId) => {
          setIsBossBattleLogOpen(false);
          handleRecordAccessedTopic(topicId);
          setActiveWorld(worldId || 'all');
          setActiveTab('modules');
          marioAudio.syncModuleAudio(worldId || 'world1', true);
          window.setTimeout(() => {
            const el = document.getElementById(`topic-card-${topicId}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('ring-4', 'ring-amber-400');
              window.setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 2400);
            }
          }, 150);
        }}
      />

      {/* Dedicated Topic Card Flashcard Deck Modal */}
      <TopicFlashcardDeckModal
        topic={activeTopicFlashcardModal}
        onClose={() => setActiveTopicFlashcardModal(null)}
        onEarnCoin={handleEarnCoin}
      />

      {/* Dedicated Topic Card 3-Question Quick Quiz Modal */}
      <TopicQuickQuizModal
        topic={activeTopicQuickQuizModal}
        onClose={() => setActiveTopicQuickQuizModal(null)}
        onCompleteQuickQuiz={handleCompleteTopicQuickQuiz}
      />

      {/* Doctrine Duel Comparative Matrix Modal */}
      {activeTopicDuel && (
        <div
          data-testid="topic-duel-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
        >
          <div className="bg-slate-950 border-4 border-black rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-[8px_8px_0_#000] text-white space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 border border-black shadow-[0_2px_0_#000]">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                    PHILIPPINE LABOR STANDARDS DOCTRINE DUEL
                  </span>
                  <h3 className="text-base sm:text-lg font-black font-display text-white">
                    {activeTopicDuel.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTopicDuel(null)}
                aria-label="Close Doctrine Duel"
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Duel Selectors */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {TOPIC_DUEL_PAIRS.map((duel) => (
                <button
                  key={duel.id}
                  type="button"
                  onClick={() => {
                    setActiveTopicDuel(duel);
                    setTopicDuelShowVerdict(false);
                    marioAudio.playClick();
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    activeTopicDuel.id === duel.id
                      ? 'bg-amber-400 text-slate-950 border-black font-black'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {duel.title}
                </button>
              ))}
            </div>

            {/* Head to Head Doctrine Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-900 border-2 border-red-500/60 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-red-400 font-mario">{activeTopicDuel.doctrineA.label}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{activeTopicDuel.doctrineA.statute}</span>
                </div>
                <p className="text-xs text-slate-200 leading-snug">
                  {activeTopicDuel.doctrineA.rule}
                </p>
                <div className="pt-1.5 border-t border-slate-800 text-[11px] text-amber-300 font-semibold">
                  Compensation: {activeTopicDuel.doctrineA.payMultiplier}
                </div>
              </div>

              <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-emerald-400 font-mario">{activeTopicDuel.doctrineB.label}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{activeTopicDuel.doctrineB.statute}</span>
                </div>
                <p className="text-xs text-slate-200 leading-snug">
                  {activeTopicDuel.doctrineB.rule}
                </p>
                <div className="pt-1.5 border-t border-slate-800 text-[11px] text-amber-300 font-semibold">
                  Compensation: {activeTopicDuel.doctrineB.payMultiplier}
                </div>
              </div>
            </div>

            {/* Real Statutory Scenario Challenge */}
            <div className="bg-slate-900/90 border border-amber-400/60 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
                STATUTORY HYPOTHETICAL CHALLENGE
              </span>
              <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                {activeTopicDuel.scenario}
              </p>
              {!topicDuelShowVerdict ? (
                <button
                  type="button"
                  data-testid="reveal-doctrine-verdict-btn"
                  onClick={() => {
                    setTopicDuelShowVerdict(true);
                    marioAudio.playCoin();
                    handleEarnCoins(3);
                  }}
                  className="min-h-[40px] px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer mt-1"
                >
                  <MarioStarIcon className="w-4 h-4 text-slate-950" />
                  <span>Reveal Legal Verdict &amp; Statutory Trap (+3 Coins)</span>
                </button>
              ) : (
                <div className="pt-2 border-t border-slate-700 space-y-2 animate-fadeIn">
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500 rounded-xl space-y-1">
                    <span className="text-[10px] font-black text-emerald-400 font-mario block">
                      SUPREME COURT DOCTRINAL VERDICT:
                    </span>
                    <p className="text-xs text-emerald-100 font-semibold leading-relaxed">
                      {activeTopicDuel.verdict}
                    </p>
                  </div>
                  <div className="p-2.5 bg-rose-950/50 border border-rose-500/70 rounded-xl text-xs text-rose-200">
                    <span className="font-black text-rose-400">Statutory Trap: </span>
                    {activeTopicDuel.trap}
                  </div>
                  <div className="p-2 bg-amber-950/50 border border-amber-400/60 rounded-xl text-xs text-amber-200 font-mono">
                    Memory Rule: {activeTopicDuel.memoryRule}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
        coins={coins}
      />

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Floating Auto-Scroll Speed Controller */}
      <AutoScrollController activeTab={activeTab} />

      {/* Interactive Mario Study Companion HUD — Animated Expressions, Affection Leveling, Pet, Feed, Legal Doctrines & Quick Study */}
      <ErrorBoundary fallback={null}>
        <InteractiveCompanionHUD
          equippedCompanionId={equippedCompanion}
          onEquipCompanion={handleEquipCompanion}
          onStartQuickStudy={handleStartQuickStudy}
          onEarnCoins={handleEarnCoins}
          coins={coins}
          completedTopicsCount={completedTopicIds.length}
          activeTab={activeTab}
          isToadTipOpen={activeTab === 'map' && showToadTip}
          hasActiveNotification={Boolean(achievementBanner || dailyQuizStreakToast || dailyGoalMilestoneToast)}
          equippedCardFrame={equippedCardFrame}
          equippedRing={equippedRing}
        />
      </ErrorBoundary>

      {/* Mario Ground Footer with Discreet Official 'Created by Matthew' Credit & Group Members */}
      <footer className="mt-10 sm:mt-14 w-full bg-[#1e293b] border-t-4 border-black text-amber-100 pt-6 sm:pt-8 px-4 pb-36 sm:pb-40 lg:pb-12 shadow-[0_-4px_0_rgba(0,0,0,0.3)] print:hidden">
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
          <div data-testid="group-members-card" className="space-y-2.5">
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

      {/* Mobile-Friendly Bottom Navigation Bar (5 equal columns, >=44px touch targets & compact landscape layout) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        data-testid="mobile-bottom-nav"
        className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t-2 border-amber-400 px-1 py-1 [@media(max-height:500px)]:py-0.5 grid grid-cols-5 w-full gap-1 lg:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.6)] select-none safe-bottom-dock print:hidden"
      >
        {(() => {
          const bottomTabs = [
            { id: 'map', label: 'Map', icon: <Compass className="w-5 h-5 [@media(max-height:500px)]:w-4 [@media(max-height:500px)]:h-4 shrink-0" /> },
            { id: 'modules', label: 'Modules', icon: <BookOpen className="w-5 h-5 [@media(max-height:500px)]:w-4 [@media(max-height:500px)]:h-4 shrink-0" /> },
            { id: 'flashcards', label: 'Cards', icon: <HelpCircle className="w-5 h-5 [@media(max-height:500px)]:w-4 [@media(max-height:500px)]:h-4 shrink-0" /> },
            { id: 'quiz', label: 'Quiz', icon: <Trophy className="w-5 h-5 [@media(max-height:500px)]:w-4 [@media(max-height:500px)]:h-4 shrink-0" /> },
            { id: 'vault', label: 'Arcade', icon: <Gamepad2 className="w-5 h-5 [@media(max-height:500px)]:w-4 [@media(max-height:500px)]:h-4 shrink-0" /> },
          ];

          return bottomTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`mobile-bottom-tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  marioAudio.playTabSwitch();
                }}
                className={`min-h-[50px] h-[52px] [@media(max-height:500px)]:min-h-[38px] [@media(max-height:500px)]:h-[38px] w-full min-w-0 flex-1 flex flex-col [@media(max-height:500px)]:flex-row [@media(max-height:500px)]:gap-1.5 items-center justify-center py-1 [@media(max-height:500px)]:py-0.5 px-0.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-black shadow-[0_2px_0_#000]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab.icon}
                <span className="text-[7.5px] sm:text-[8.5px] font-mario uppercase tracking-tighter mt-1 [@media(max-height:500px)]:mt-0 leading-none truncate max-w-full text-center">
                  {tab.label}
                </span>
              </button>
            );
          });
        })()}
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
