import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { marioAudio } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  BOWSER_BOSS_QUESTIONS,
  QuizQuestion,
} from '../data/quizQuestionsData';
import { StudyDifficulty } from '../types/laborLaw';
import {
  AdaptedQuizQuestion,
  getQuizQuestionsForDifficulty,
  adaptBossQuestionForDifficulty,
  pickQuickTestQuestions,
  pickFlashbackQuizQuestions,
  computeQuickTestSummary,
  generateExamSimulationDeck,
  computeExamSimulationBreakdown,
  ExamSimulationSummary,
  mapActiveWorldToQuizCode,
  getQuizWorldLabel,
} from '../utils/studyModes';
import { drawUniqueFromDeck, shuffleChoiceOptions } from '../utils/gameQuestionDeck';
import {
  QuizCompletionPayload,
  QuizHistoryRecord,
} from '../utils/profileAchievements';
import { ALL_LAW_TOPICS } from '../data/laborLawData';
import {
  buildTargetedWeaknessDrillDeck,
  QuizCategoryAnswerInput,
  ActiveDailyQuizStreakSnapshot,
} from '../utils/round8Features';
import { MissedQuestionBriefInput } from '../utils/round9Features';
import {
  loadRound10VaultState,
  saveRound10VaultState,
  Round10VaultState,
} from '../utils/round10Features';
import { QuizResultSummaryChart } from './QuizResultSummaryChart';
import {
  DailyQuizFireMeter,
  BossDefeatStarShower,
  QuizAnalyticsPanel,
} from './QuizAnalyticsPanel';
import { SaveSingleQuizErrorButton } from './SaveSingleQuizErrorButton';
import {
  Trophy,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Award,
  Flame,
  Heart,
  Clock,
  Filter,
  Shuffle,
  Zap,
  Lightbulb,
  GraduationCap,
  Feather,
  Play,
  Pause,
  X,
  Target,
  Sparkles as SparklesIcon,
  Shield,
  Swords,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import {
  Mario1UpIcon,
  MarioFlagIcon,
  MarioStarIcon,
  MarioMushroomIcon,
  MarioCoinIcon,
  MarioBowserIcon,
  MarioFireballIcon,
  MarioAxeIcon,
  MarioQuestionBlockIcon,
  MarioPipeIcon,
  MarioCharacterAvatar,
} from './MarioIcons';
import { QuizResultsLeaderboard } from './QuizResultsLeaderboard';
import {
  INITIAL_QUIZ_LIVES,
  KOOPA_BOSS_TOTAL_QUESTIONS,
  KOOPA_BOSS_MAX_MISSES,
  KOOPA_SOVEREIGN_FRAME_ID,
  KoopaBossState,
  createInitialKoopaBossState,
  stepKoopaBossAnswer,
  OneUpBlockOption,
  createOneUpRecoveryBlocks,
  AsyncBattleChallenge,
  encodeAsyncBattleChallenge,
  decodeAsyncBattleChallenge,
  computeSimulatedRivalResult,
  dispatchDailyMissionEvent,
  createFreshShuffledDeck,
} from '../utils/round11Features';
import { resolveUniversalCardFrame } from '../utils/round12Features';

interface DigitalBadge {
  id: string;
  name: string;
  title: string;
  description: string;
  dateUnlocked: string;
}

interface QuickAnswerRecord {
  question: AdaptedQuizQuestion;
  chosenIndex: number;
  isCorrect: boolean;
}

import { FlagpoleStreakWidget } from './FlagpoleStreakWidget';
import {
  FlagpoleStreakState,
  recordQuizForFlagpole,
  claimFlagpoleMilestone,
} from '../utils/quizFlagpoleStreak';
import { QuizPerformanceInsightsPanel } from './QuizPerformanceInsightsPanel';
import { SectionQuestionAttempt } from '../utils/quizPerformanceInsights';
import { PipeWarpTransitionOverlay } from './PipeWarpTransitionOverlay';
import {
  QuizGhostCheckpoint,
  QuizGhostRunRecord,
  loadQuizGhostRuns,
  recordQuizGhostRun,
  evaluateGhostRaceStatus,
} from '../utils/ghostRaceAndKnowledgeGraph';

interface BarQuizQuestProps {
  fontSize: 'normal' | 'large' | 'xlarge';
  onEarnCoins: (amount: number) => void;
  activeWorld: string;
  onChangeActiveWorld?: (worldId: string) => void;
  studyDifficulty: StudyDifficulty;
  setStudyDifficulty: (difficulty: StudyDifficulty) => void;
  onQuizCompleted?: (payload: QuizCompletionPayload) => void;
  onOpenProfile?: () => void;
  unlockedAchievementsCount?: number;
  needsImprovementTopicIds?: string[];
  needsImprovementWorlds?: string[];
  onBossQuizCompleted?: () => void;
  onRecordBossBattleLog?: (input: {
    modeLabel: string;
    score: number;
    totalQuestions: number;
    timeTakenSeconds: number;
    incorrectTopics: string[];
    victory?: boolean;
    worldId?: string;
  }) => void;
  onOpenBossBattleLog?: () => void;
  bossBattleLogCount?: number;
  externalLaunchMode?: {
    mode:
      | 'quick'
      | 'exam_sim'
      | 'flashback'
      | 'practice'
      | 'boss'
      | 'koopa_boss'
      | 'async_battle';
    nonce: number;
  } | null;
  dailyBossQuizStreak?: ActiveDailyQuizStreakSnapshot;
  quizHistory?: QuizHistoryRecord[];
  bossSkipTokens?: number;
  onConsumeBossSkipToken?: () => void;
  onActivateBossDefeatInvincible?: () => void;
  coins?: number;
  onSpendCoins?: (cost: number) => boolean;
  onOpenLeaderboard?: () => void;
  equippedCardFrame?: string;
  flagpoleStreak?: FlagpoleStreakState;
  onUpdateFlagpoleStreak?: (next: FlagpoleStreakState) => void;
  onAwardBonusXp?: (xp: number) => void;
  sectionAttemptsLog?: SectionQuestionAttempt[];
  onRecordSectionAnswer?: (topicId: string, isCorrect: boolean) => void;
}

export const BarQuizQuest: React.FC<BarQuizQuestProps> = ({
  fontSize,
  onEarnCoins,
  activeWorld,
  onChangeActiveWorld,
  studyDifficulty,
  setStudyDifficulty,
  onQuizCompleted,
  onOpenProfile,
  unlockedAchievementsCount,
  needsImprovementTopicIds = [],
  needsImprovementWorlds = [],
  onBossQuizCompleted,
  onRecordBossBattleLog,
  onOpenBossBattleLog,
  bossBattleLogCount = 0,
  externalLaunchMode = null,
  dailyBossQuizStreak,
  quizHistory = [],
  bossSkipTokens = 0,
  onConsumeBossSkipToken,
  onActivateBossDefeatInvincible,
  coins = 0,
  onSpendCoins,
  onOpenLeaderboard,
  equippedCardFrame = 'frame_default',
  flagpoleStreak,
  onUpdateFlagpoleStreak,
  onAwardBonusXp,
  sectionAttemptsLog,
  onRecordSectionAnswer,
}) => {
  const resolvedQuizFrame = resolveUniversalCardFrame(equippedCardFrame);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activeMode, setActiveMode] = useState<
    | 'quick'
    | 'exam_sim'
    | 'flashback'
    | 'practice'
    | 'boss'
    | 'koopa_boss'
    | 'async_battle'
  >(() => {
    if (typeof window !== 'undefined') {
      const token = new URLSearchParams(window.location.search).get('async_battle');
      if (token) return 'async_battle';
    }
    return 'quick';
  });
  const [isBossWarping, setIsBossWarping] = useState<boolean>(false);
  const [bossWarpTitle, setBossWarpTitle] = useState<string>('BOWSER COURTROOM SHOWDOWN');
  const pendingBossWarpActionRef = useRef<(() => void) | null>(null);
  const [ghostRunsByBucket, setGhostRunsByBucket] = useState<Record<string, QuizGhostRunRecord>>(
    () =>
      loadQuizGhostRuns(typeof window !== 'undefined' ? window.localStorage : undefined)
  );
  const [latestGhostResult, setLatestGhostResult] = useState<{
    isNewRecord: boolean;
    previousBest: QuizGhostRunRecord | null;
    currentBest: QuizGhostRunRecord;
  } | null>(null);

  const launchWithBossWarp = (title: string, action: () => void) => {
    setBossWarpTitle(title);
    pendingBossWarpActionRef.current = action;
    setIsBossWarping(true);
  };

  const recordQuizRunCompletion = (params: {
    bucketKey: string;
    accuracyPercent: number;
    totalTimeSec: number;
    checkpoints?: QuizGhostCheckpoint[];
    recordsForHeatmap?: { worldCode?: string; isCorrect: boolean }[];
  }) => {
    dispatchDailyMissionEvent('quiz_attempt', 1);
    if (params.accuracyPercent >= 80) {
      dispatchDailyMissionEvent('quiz_80', 1);
    }

    if (onUpdateFlagpoleStreak && flagpoleStreak) {
      const { nextState, milestoneUnlocked } = recordQuizForFlagpole(flagpoleStreak);
      let finalStreakState = nextState;
      if (milestoneUnlocked) {
        const milestone = nextState.currentStreak;
        const claimRes = claimFlagpoleMilestone(nextState, milestone);
        if (claimRes.success) {
          finalStreakState = claimRes.nextState;
          if (claimRes.xpAwarded > 0) {
            onAwardBonusXp?.(claimRes.xpAwarded);
          }
        }
      }
      onUpdateFlagpoleStreak(finalStreakState);
    }

    if (onRecordSectionAnswer && params.recordsForHeatmap) {
      params.recordsForHeatmap.forEach((rec) => {
        onRecordSectionAnswer({
          worldCode: rec.worldCode || 'w1',
          isCorrect: rec.isCorrect,
        });
      });
    }

    const cps: QuizGhostCheckpoint[] =
      params.checkpoints && params.checkpoints.length > 0
        ? params.checkpoints
        : [
            {
              questionIndex: 1,
              elapsedSec: Math.max(1, Math.round(params.totalTimeSec / 2)),
              accuracyPercent: params.accuracyPercent,
            },
            {
              questionIndex: 2,
              elapsedSec: Math.max(2, Math.round(params.totalTimeSec)),
              accuracyPercent: params.accuracyPercent,
            },
          ];

    const res = recordQuizGhostRun({
      bucketKey: params.bucketKey,
      accuracyPercent: params.accuracyPercent,
      totalTimeSec: Math.max(1, Math.round(params.totalTimeSec)),
      checkpoints: cps,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    });
    setGhostRunsByBucket(
      loadQuizGhostRuns(typeof window !== 'undefined' ? window.localStorage : undefined)
    );
    setLatestGhostResult(res);
  };
  const [wrongShakeNonce, setWrongShakeNonce] = useState<number>(0);
  const [practiceMissedDetails, setPracticeMissedDetails] = useState<MissedQuestionBriefInput[]>([]);
  const [bossMissedDetails, setBossMissedDetails] = useState<MissedQuestionBriefInput[]>([]);
  const [koopaMissedDetails, setKoopaMissedDetails] = useState<MissedQuestionBriefInput[]>([]);
  const [asyncMissedDetails, setAsyncMissedDetails] = useState<MissedQuestionBriefInput[]>([]);
  const [r10Vault, setR10Vault] = useState<Round10VaultState>(() =>
    loadRound10VaultState()
  );
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [revealedCounselHint, setRevealedCounselHint] = useState<string | null>(
    null
  );
  const [bossShieldArmed, setBossShieldArmed] = useState<boolean>(false);

  useEffect(() => {
    const syncVault = () => setR10Vault(loadRound10VaultState());
    window.addEventListener('mario-round10-vault-updated', syncVault);
    return () =>
      window.removeEventListener('mario-round10-vault-updated', syncVault);
  }, []);

  const triggerWrongAnswerPulse = () => {
    setWrongShakeNonce(Date.now());
    window.setTimeout(() => {
      setWrongShakeNonce(0);
    }, 520);
  };

  // ==================== MODE 0A: EXAM SIMULATION (10 Randomized All-Topic Qs + Timer + Breakdown) ====================
  const [simTimePreset, setSimTimePreset] = useState<300 | 600 | 900>(600);
  const [simDeck, setSimDeck] = useState<AdaptedQuizQuestion[]>(() =>
    generateExamSimulationDeck(studyDifficulty, 10)
  );
  const [simIdx, setSimIdx] = useState<number>(0);
  const [simAnswers, setSimAnswers] = useState<Record<number, number | null>>({});
  const [simSecondsLeft, setSimSecondsLeft] = useState<number>(600);
  const [simPaused, setSimPaused] = useState<boolean>(false);
  const [simCompleted, setSimCompleted] = useState<boolean>(false);
  const [simTimedOut, setSimTimedOut] = useState<boolean>(false);
  const [simFinalSummary, setSimFinalSummary] = useState<ExamSimulationSummary | null>(null);

  const simStateRef = useRef({
    deck: simDeck,
    answers: simAnswers,
    secondsLeft: simSecondsLeft,
    timePreset: simTimePreset,
    completed: simCompleted,
    difficulty: studyDifficulty,
  });
  simStateRef.current = {
    deck: simDeck,
    answers: simAnswers,
    secondsLeft: simSecondsLeft,
    timePreset: simTimePreset,
    completed: simCompleted,
    difficulty: studyDifficulty,
  };

  const startFreshExamSimulation = (
    nextPreset: 300 | 600 | 900 = simTimePreset,
    nextDifficulty: StudyDifficulty = studyDifficulty
  ) => {
    const freshDeck = generateExamSimulationDeck(nextDifficulty, 10);
    setSimTimePreset(nextPreset);
    setSimDeck(freshDeck);
    setSimIdx(0);
    setSimAnswers({});
    setSimSecondsLeft(nextPreset);
    setSimPaused(false);
    setSimCompleted(false);
    setSimTimedOut(false);
    setSimFinalSummary(null);
  };

  useEffect(() => {
    if (externalLaunchMode && externalLaunchMode.nonce > 0) {
      if (externalLaunchMode.mode === 'boss') {
        launchWithBossWarp('BOWSER LAVA KEEP SHOWDOWN', () => setActiveMode('boss'));
      } else if (externalLaunchMode.mode === 'koopa_boss') {
        launchWithBossWarp('KOOPA SOVEREIGN CITADEL GAUNTLET', () => setActiveMode('koopa_boss'));
      } else {
        setActiveMode(externalLaunchMode.mode);
        if (externalLaunchMode.mode === 'exam_sim') {
          startFreshExamSimulation();
        }
      }
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        // ignore
      }
    }
  }, [externalLaunchMode]);

  const finishExamSimulation = (didTimeOut: boolean = false) => {
    const snap = simStateRef.current;
    if (snap.completed) return;
    const elapsed = didTimeOut
      ? snap.timePreset
      : Math.max(1, snap.timePreset - snap.secondsLeft);
    const summary = computeExamSimulationBreakdown({
      deck: snap.deck,
      answersByIndex: snap.answers,
      elapsedSeconds: elapsed,
      timeLimitSeconds: snap.timePreset,
      timedOut: didTimeOut,
      difficulty: snap.difficulty,
    });
    setSimTimedOut(didTimeOut);
    setSimFinalSummary(summary);
    setSimCompleted(true);
    setSimPaused(false);
    onQuizCompleted?.({
      worldCode: 'exam_sim',
      correctCount: summary.correctCount,
      totalCount: summary.totalCount,
      topicTitle: '10-Question Bar Exam Simulation (All Worlds)',
    });
    onBossQuizCompleted?.();
    if (snap.difficulty === 'exam_prep') {
      const missedTopics = snap.deck
        .filter((q, idx) => snap.answers[idx] !== q.correctIndex)
        .map((q) => `${q.world} (${q.legalBasis})`);
      onRecordBossBattleLog?.({
        modeLabel: 'Exam Simulation (10 Qs)',
        score: summary.correctCount,
        totalQuestions: summary.totalCount,
        timeTakenSeconds: elapsed,
        incorrectTopics: missedTopics,
        victory: !didTimeOut && summary.accuracyPercent >= 70,
      });
    }
    if (summary.coinsEarned > 0) {
      onEarnCoins(summary.coinsEarned);
    }
    recordQuizRunCompletion({
      bucketKey: 'exam_sim',
      accuracyPercent: summary.accuracyPercent,
      totalTimeSec: elapsed,
      recordsForHeatmap: snap.deck.map((item, idx) => ({
        worldCode: item.worldCode,
        isCorrect: snap.answers[idx] === item.correctIndex,
      })),
    });
    if (didTimeOut) {
      marioAudio.playQuizTimeout();
    } else if (summary.accuracyPercent === 100) {
      marioAudio.playFlagpole();
      marioAudio.playQuizComplete();
      try {
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    } else if (summary.accuracyPercent >= 75) {
      marioAudio.playQuizComplete();
      try {
        confetti({ particleCount: 95, spread: 80, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    } else {
      marioAudio.playGameOver();
    }
  };

  useEffect(() => {
    if (activeMode !== 'exam_sim' || simPaused || simCompleted) return;
    const timer = window.setInterval(() => {
      setSimSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          window.setTimeout(() => finishExamSimulation(true), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeMode, simPaused, simCompleted]);

  useEffect(() => {
    startFreshExamSimulation(simTimePreset, studyDifficulty);
  }, [studyDifficulty]);

  const simQ = simDeck[simIdx];
  const simAnsweredCount = useMemo(
    () =>
      Object.values(simAnswers).filter((v): v is number => typeof v === 'number' && v >= 0)
        .length,
    [simAnswers]
  );

  // ==================== MODE 0: QUICK TEST (5 Random Active-World Qs) ====================
  const [quickDeck, setQuickDeck] = useState<AdaptedQuizQuestion[]>(() =>
    pickQuickTestQuestions(activeWorld, studyDifficulty, 5)
  );
  const [quickIdx, setQuickIdx] = useState(0);
  const [quickSelected, setQuickSelected] = useState<number | null>(null);
  const [quickSubmitted, setQuickSubmitted] = useState(false);
  const [quickRecords, setQuickRecords] = useState<QuickAnswerRecord[]>([]);
  const [quickComplete, setQuickComplete] = useState(false);
  const [quickRewardedCoins, setQuickRewardedCoins] = useState(0);
  const quickStartTimeRef = useRef<number>(Date.now());
  const [quickElapsedSeconds, setQuickElapsedSeconds] = useState<number>(45);

  // Full-Screen Exam Focus Mode & Countdown Timer
  const [isExamMode, setIsExamMode] = useState<boolean>(false);
  const [examSecondsLeft, setExamSecondsLeft] = useState<number>(300);
  const [isExamPaused, setIsExamPaused] = useState<boolean>(false);

  useEffect(() => {
    if (!isExamMode || isExamPaused || quickComplete) return;
    const interval = window.setInterval(() => {
      setExamSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          marioAudio.playQuizTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isExamMode, isExamPaused, quickComplete]);

  // Randomize Questions toggle to prevent rote memorization during repeated practice sessions
  const [randomizeQuestions, setRandomizeQuestions] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mario_quiz_randomize_questions');
        return saved !== null ? saved === 'true' : true;
      } catch {
        return true;
      }
    }
    return true;
  });

  const handleToggleRandomizeQuestions = () => {
    setRandomizeQuestions((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('mario_quiz_randomize_questions', String(next));
      } catch {
        // ignore
      }
      if (next) {
        marioAudio.playPowerUp();
      } else {
        marioAudio.playJump();
      }
      startFreshQuickTest(activeWorld, studyDifficulty, next);
      setShuffleSeed((s) => s + 1);
      return next;
    });
  };

  const startFreshQuickTest = (
    targetWorld: string = activeWorld,
    targetDiff: StudyDifficulty = studyDifficulty,
    shouldRandomize: boolean = randomizeQuestions
  ) => {
    const rawFive = pickQuickTestQuestions(targetWorld, targetDiff, 5);
    const nextFive = shouldRandomize
      ? [...rawFive].sort(() => Math.random() - 0.5).map((item) => {
          const shuffled = shuffleChoiceOptions(item.options, item.correctIndex);
          return {
            ...item,
            options: shuffled.options,
            correctIndex: shuffled.correctIndex,
          };
        })
      : rawFive;

    setQuickDeck(nextFive);
    setQuickIdx(0);
    setQuickSelected(null);
    setQuickSubmitted(false);
    setQuickRecords([]);
    setQuickComplete(false);
    setQuickRewardedCoins(0);
    quickStartTimeRef.current = Date.now();
  };

  useEffect(() => {
    startFreshQuickTest(activeWorld, studyDifficulty);
  }, [activeWorld, studyDifficulty]);

  const quickQ = quickDeck[quickIdx];
  const activeWorldCode = mapActiveWorldToQuizCode(activeWorld);
  const activeWorldTitle = getQuizWorldLabel(activeWorldCode);

  const quickCheckpointsRef = useRef<QuizGhostCheckpoint[]>([]);

  const handleSelectQuickOption = (idx: number) => {
    if (quickSubmitted) return;
    setQuickSelected(idx);
    marioAudio.playJump();
  };

  const handleSubmitQuickAnswer = () => {
    if (quickSelected === null || !quickQ || quickSubmitted) return;
    const isCorrect = quickSelected === quickQ.correctIndex;
    setQuickSubmitted(true);
    const updatedRecords = [
      ...quickRecords,
      { question: quickQ, chosenIndex: quickSelected, isCorrect },
    ];
    setQuickRecords(updatedRecords);
    const elapsedNow = Math.max(1, Math.round((Date.now() - quickStartTimeRef.current) / 1000));
    const correctSoFar = updatedRecords.filter((r) => r.isCorrect).length;
    const accSoFar = Math.round((correctSoFar / updatedRecords.length) * 100);
    quickCheckpointsRef.current = [
      ...quickCheckpointsRef.current.filter((c) => c.questionIndex !== updatedRecords.length),
      {
        questionIndex: updatedRecords.length,
        elapsedSec: elapsedNow,
        accuracyPercent: accSoFar,
      },
    ];

    if (isCorrect) {
      marioAudio.playSuccess();
      marioAudio.playCoin();
    } else {
      marioAudio.playTryAgain();
    }
  };

  const handleNextQuickQuestion = () => {
    if (quickIdx < quickDeck.length - 1) {
      setQuickIdx((i) => i + 1);
      setQuickSelected(null);
      setQuickSubmitted(false);
      marioAudio.playPipe();
    } else {
      const correctTotal = quickRecords.filter((r) => r.isCorrect).length;
      const summary = computeQuickTestSummary(
        correctTotal,
        quickDeck.length,
        studyDifficulty
      );
      const elapsed = Math.max(1, Math.round((Date.now() - quickStartTimeRef.current) / 1000));
      setQuickElapsedSeconds(elapsed);
      setQuickRewardedCoins(summary.coinsEarned);
      setQuickComplete(true);
      onQuizCompleted?.({
        worldCode: activeWorldCode,
        correctCount: correctTotal,
        totalCount: quickDeck.length,
        topicTitle: `${activeWorldTitle} (5-Question Quick Test)`,
      });
      onBossQuizCompleted?.();
      if (studyDifficulty === 'exam_prep') {
        const missed = quickRecords
          .filter((r) => !r.isCorrect)
          .map((r) => `${r.question.world} (${r.question.legalBasis})`);
        onRecordBossBattleLog?.({
          modeLabel: `Quick Test · ${activeWorldTitle}`,
          score: correctTotal,
          totalQuestions: quickDeck.length,
          timeTakenSeconds: elapsed,
          incorrectTopics: missed,
          victory: summary.accuracyPercent >= 70,
        });
      }
      if (summary.coinsEarned > 0) {
        onEarnCoins(summary.coinsEarned);
      }
      recordQuizRunCompletion({
        bucketKey: activeWorld || 'all',
        accuracyPercent: summary.accuracyPercent,
        totalTimeSec: elapsed,
        checkpoints: quickCheckpointsRef.current,
        recordsForHeatmap: quickRecords.map((r) => ({
          worldCode: r.question.worldCode || activeWorldCode,
          isCorrect: r.isCorrect,
        })),
      });
      if (summary.accuracyPercent === 100) {
        marioAudio.playFlagpole();
        marioAudio.playQuizComplete();
      } else if (summary.accuracyPercent < 60) {
        marioAudio.playGameOver();
      } else {
        marioAudio.playQuizComplete();
      }
      try {
        confetti({ particleCount: 85, spread: 75, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    }
  };

  const quickSummary = useMemo(() => {
    const correctTotal = quickRecords.filter((r) => r.isCorrect).length;
    return computeQuickTestSummary(
      correctTotal,
      Math.max(1, quickDeck.length),
      studyDifficulty
    );
  }, [quickRecords, quickDeck.length, studyDifficulty]);

  // ==================== MODE 0.5: TARGETED WEAKNESS DRILL (FLAGGED TOPICS REINFORCEMENT) ====================
  const buildWeaknessDrillState = () => {
    const poolForDiff = getQuizQuestionsForDifficulty(studyDifficulty);
    const targeted = buildTargetedWeaknessDrillDeck({
      pool: poolForDiff,
      allTopics: ALL_LAW_TOPICS,
      needsImprovementTopicIds,
      needsImprovementWorlds,
      deckSize: 6,
    });
    if (targeted.deck.length > 0) {
      const adaptedDeck = targeted.deck.map((item) => {
        const shuffled = shuffleChoiceOptions(item.options, item.correctIndex);
        return {
          ...item,
          options: shuffled.options,
          correctIndex: shuffled.correctIndex,
        } as AdaptedQuizQuestion;
      });
      return {
        questions: adaptedDeck,
        sourceLabel: targeted.summaryLabel,
      };
    }
    const fallback = pickFlashbackQuizQuestions(
      needsImprovementTopicIds,
      needsImprovementWorlds,
      studyDifficulty,
      5
    );
    return fallback;
  };

  const [flashbackDeck, setFlashbackDeck] = useState<AdaptedQuizQuestion[]>(
    () => buildWeaknessDrillState().questions
  );
  const [flashbackLabel, setFlashbackLabel] = useState<string>(
    () => buildWeaknessDrillState().sourceLabel
  );
  const [flashbackIdx, setFlashbackIdx] = useState(0);
  const [flashbackSelected, setFlashbackSelected] = useState<number | null>(null);
  const [flashbackSubmitted, setFlashbackSubmitted] = useState(false);
  const [flashbackRecords, setFlashbackRecords] = useState<QuickAnswerRecord[]>([]);
  const [flashbackComplete, setFlashbackComplete] = useState(false);
  const [flashbackRewardedCoins, setFlashbackRewardedCoins] = useState(0);
  const flashbackStartTimeRef = useRef<number>(Date.now());
  const [flashbackElapsedSeconds, setFlashbackElapsedSeconds] = useState<number>(45);

  const startFreshFlashback = () => {
    const res = buildWeaknessDrillState();
    setFlashbackDeck(res.questions);
    setFlashbackLabel(res.sourceLabel);
    setFlashbackIdx(0);
    setFlashbackSelected(null);
    setFlashbackSubmitted(false);
    setFlashbackRecords([]);
    setFlashbackComplete(false);
    setFlashbackRewardedCoins(0);
    flashbackStartTimeRef.current = Date.now();
  };

  useEffect(() => {
    if (activeMode === 'flashback') {
      startFreshFlashback();
    }
  }, [needsImprovementTopicIds, needsImprovementWorlds, studyDifficulty, activeMode]);

  const flashbackQ = flashbackDeck[flashbackIdx];

  const handleSelectFlashbackOption = (idx: number) => {
    if (flashbackSubmitted) return;
    setFlashbackSelected(idx);
    marioAudio.playJump();
  };

  const handleSubmitFlashbackAnswer = () => {
    if (flashbackSelected === null || !flashbackQ || flashbackSubmitted) return;
    const isCorrect = flashbackSelected === flashbackQ.correctIndex;
    setFlashbackSubmitted(true);
    const updatedRecords = [
      ...flashbackRecords,
      { question: flashbackQ, chosenIndex: flashbackSelected, isCorrect },
    ];
    setFlashbackRecords(updatedRecords);

    if (isCorrect) {
      marioAudio.playSuccess();
      marioAudio.playCoin();
    } else {
      marioAudio.playTryAgain();
    }
  };

  const handleNextFlashbackQuestion = () => {
    if (flashbackIdx < flashbackDeck.length - 1) {
      setFlashbackIdx((i) => i + 1);
      setFlashbackSelected(null);
      setFlashbackSubmitted(false);
      marioAudio.playPipe();
    } else {
      const correctTotal = flashbackRecords.filter((r) => r.isCorrect).length;
      const summary = computeQuickTestSummary(
        correctTotal,
        flashbackDeck.length,
        studyDifficulty
      );
      const elapsed = Math.max(10, Math.round((Date.now() - flashbackStartTimeRef.current) / 1000));
      setFlashbackElapsedSeconds(elapsed);
      // Flashback grants extra bonus reward (+5 bonus coins) for reinforcing weak areas!
      const bonusReward = summary.coinsEarned > 0 ? summary.coinsEarned + 5 : 0;
      setFlashbackRewardedCoins(bonusReward);
      setFlashbackComplete(true);
      onQuizCompleted?.({
        worldCode: 'FLASHBACK',
        correctCount: correctTotal,
        totalCount: flashbackDeck.length,
        topicTitle: `Targeted Weakness Drill: ${flashbackLabel}`,
      });
      onBossQuizCompleted?.();
      if (studyDifficulty === 'exam_prep') {
        const missed = flashbackRecords
          .filter((r) => !r.isCorrect)
          .map((r) => `${r.question.world} (${r.question.legalBasis})`);
        onRecordBossBattleLog?.({
          modeLabel: 'Targeted Weakness Drill',
          score: correctTotal,
          totalQuestions: flashbackDeck.length,
          timeTakenSeconds: elapsed,
          incorrectTopics: missed,
          victory: summary.accuracyPercent >= 70,
        });
      }
      if (bonusReward > 0) {
        onEarnCoins(bonusReward);
      }
      recordQuizRunCompletion({
        bucketKey: 'flashback',
        accuracyPercent: summary.accuracyPercent,
        totalTimeSec: elapsed,
        recordsForHeatmap: flashbackRecords.map((r) => ({
          worldCode: r.question.worldCode || 'w1',
          isCorrect: r.isCorrect,
        })),
      });
      if (summary.accuracyPercent === 100) {
        marioAudio.playFlagpole();
        marioAudio.playQuizComplete();
      } else if (summary.accuracyPercent < 60) {
        marioAudio.playGameOver();
      } else {
        marioAudio.playQuizComplete();
      }
      try {
        confetti({ particleCount: 95, spread: 85, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    }
  };

  const flashbackSummary = useMemo(() => {
    const correctTotal = flashbackRecords.filter((r) => r.isCorrect).length;
    return computeQuickTestSummary(
      correctTotal,
      Math.max(1, flashbackDeck.length),
      studyDifficulty
    );
  }, [flashbackRecords, flashbackDeck.length, studyDifficulty]);

  // ==================== MODE 1: PRACTICE ARENA ====================
  const [worldFilter, setWorldFilter] = useState<'all' | QuizQuestion['worldCode']>('all');
  const [runLimit, setRunLimit] = useState<15 | 30 | 999>(999);
  const [shuffleSeed, setShuffleSeed] = useState<number>(() => Date.now());

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [practiceRecords, setPracticeRecords] = useState<QuizCategoryAnswerInput[]>([]);
  const [practiceMissedTopics, setPracticeMissedTopics] = useState<string[]>([]);
  const practiceStartTimeRef = useRef<number>(Date.now());
  const hasLifeRing = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = window.localStorage.getItem('mario_unlocked_items');
      return raw ? JSON.parse(raw).includes('perk_life') : false;
    } catch {
      return false;
    }
  }, []);
  const initialPracticeLives = hasLifeRing ? INITIAL_QUIZ_LIVES + 1 : INITIAL_QUIZ_LIVES;
  const [practiceLives, setPracticeLives] = useState<number>(() =>
    typeof window !== 'undefined' && window.localStorage.getItem('mario_unlocked_items')?.includes('perk_life')
      ? INITIAL_QUIZ_LIVES + 1
      : INITIAL_QUIZ_LIVES
  );
  const [oneUpBlocks, setOneUpBlocks] = useState<OneUpBlockOption[] | null>(null);
  const [oneUpPickedIdx, setOneUpPickedIdx] = useState<number | null>(null);
  const [oneUpRecoveryBanner, setOneUpRecoveryBanner] = useState<string | null>(null);
  const [practiceGameOver, setPracticeGameOver] = useState<boolean>(false);

  useEffect(() => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizComplete(false);
    setPracticeRecords([]);
    setPracticeMissedTopics([]);
    setPracticeLives(initialPracticeLives);
    setOneUpBlocks(null);
    setOneUpPickedIdx(null);
    setOneUpRecoveryBanner(null);
    setPracticeGameOver(false);
    practiceStartTimeRef.current = Date.now();
  }, [studyDifficulty, initialPracticeLives]);

  // ==================== MODE 2: BOWSER BOSS ====================
  const [bossTier, setBossTier] = useState<'standard' | 'mega'>('standard');
  const [bossDeck, setBossDeck] = useState<QuizQuestion[]>(BOWSER_BOSS_QUESTIONS);
  const [bossMaxHp, setBossMaxHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [playerHearts, setPlayerHearts] = useState(3);
  const [bossIdx, setBossIdx] = useState(0);
  const [bossSelectedAnswer, setBossSelectedAnswer] = useState<number | null>(null);
  const [bossAnswerSubmitted, setBossAnswerSubmitted] = useState(false);
  const [bossBattleState, setBossBattleState] = useState<'intro' | 'combat' | 'defeat' | 'victory'>('intro');
  const [comboStreak, setComboStreak] = useState(0);
  const defaultBossSeconds = studyDifficulty === 'casual' ? 32 : 25;
  const [timeLeft, setTimeLeft] = useState(defaultBossSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [bossRecords, setBossRecords] = useState<QuizCategoryAnswerInput[]>([]);
  const [bossMissedTopics, setBossMissedTopics] = useState<string[]>([]);
  const bossStartTimeRef = useRef<number>(Date.now());

  const [badges, setBadges] = useState<DigitalBadge[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mario_unlocked_badges');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const fullPracticePoolForDifficulty = useMemo(
    () => getQuizQuestionsForDifficulty(studyDifficulty, 'all'),
    [studyDifficulty]
  );

  const activePracticePool = useMemo(() => {
    const filtered = getQuizQuestionsForDifficulty(studyDifficulty, worldFilter);
    const targetCount = Math.min(runLimit, filtered.length);
    if (randomizeQuestions && shuffleSeed > 0) {
      const drawn = drawUniqueFromDeck(
        `practice_arena_${studyDifficulty}_${worldFilter}_${shuffleSeed}`,
        filtered,
        targetCount
      );
      return drawn.map((item) => {
        const shuffled = shuffleChoiceOptions(item.options, item.correctIndex);
        return {
          ...item,
          options: shuffled.options,
          correctIndex: shuffled.correctIndex,
        };
      });
    }
    return filtered.slice(0, targetCount);
  }, [studyDifficulty, worldFilter, runLimit, shuffleSeed, randomizeQuestions]);

  const bodyTextClass =
    fontSize === 'xlarge' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-base';

  const q = activePracticePool[currentIdx] || activePracticePool[0];

  const resetPracticeRun = (
    nextWorld: 'all' | QuizQuestion['worldCode'] = worldFilter,
    nextLimit: 15 | 30 | 999 = runLimit,
    shuffle = false
  ) => {
    setWorldFilter(nextWorld);
    setRunLimit(nextLimit);
    if (shuffle) setShuffleSeed((s) => s + 1);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizComplete(false);
    setPracticeRecords([]);
    setPracticeMissedTopics([]);
    setPracticeMissedDetails([]);
    setPracticeLives(INITIAL_QUIZ_LIVES);
    setOneUpBlocks(null);
    setOneUpPickedIdx(null);
    setOneUpRecoveryBanner(null);
    setPracticeGameOver(false);
    practiceStartTimeRef.current = Date.now();
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted || oneUpBlocks !== null || practiceGameOver) return;
    setSelectedAnswer(idx);
    marioAudio.playJump();
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !q || oneUpBlocks !== null || practiceGameOver) return;
    setIsAnswerSubmitted(true);
    setOneUpRecoveryBanner(null);
    const isRight = selectedAnswer === q.correctIndex;
    setPracticeRecords((prev) => [
      ...prev,
      { worldCode: q.worldCode || 'w1', isCorrect: isRight },
    ]);
    if (isRight) {
      setScore((s) => s + 1);
      onEarnCoins(studyDifficulty === 'exam_prep' ? 6 : 4);
      marioAudio.playSuccess();
      marioAudio.playCoin();
      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      } catch {
        // ignore
      }
    } else {
      setPracticeMissedTopics((prev) => [...prev, `${q.world} (${q.legalBasis})`]);
      setPracticeMissedDetails((prev) => [
        ...prev,
        {
          scenario: q.scenario,
          correctOptionText: q.options[q.correctIndex] || '',
          chosenOptionText: q.options[selectedAnswer] || '',
          legalBasis: q.legalBasis || 'Philippine Labor Code',
          explanation: q.explanation || '',
          worldCode: q.worldCode || 'w1',
          quizModeLabel: 'Practice Arena',
        },
      ]);
      triggerWrongAnswerPulse();
      marioAudio.playTryAgain();
      const nextLives = Math.max(0, practiceLives - 1);
      setPracticeLives(nextLives);
      if (nextLives === 0) {
        setOneUpBlocks(createOneUpRecoveryBlocks(Date.now() + currentIdx));
        setOneUpPickedIdx(null);
      }
    }
  };

  const handlePickOneUpBlock = (block: OneUpBlockOption) => {
    if (oneUpPickedIdx !== null) return;
    setOneUpPickedIdx(block.index);
    if (block.hasOneUp) {
      marioAudio.playOneUp();
      setPracticeLives(1);
      setOneUpRecoveryBanner('1-UP MUSHROOM FOUND! +1 Extra Life Restored — Keep Climbing!');
      window.setTimeout(() => {
        setOneUpBlocks(null);
        setOneUpPickedIdx(null);
      }, 950);
    } else {
      marioAudio.playGameOver();
      window.setTimeout(() => {
        setOneUpBlocks(null);
        setOneUpPickedIdx(null);
        setPracticeGameOver(true);
      }, 950);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < activePracticePool.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setOneUpRecoveryBanner(null);
      marioAudio.playPipe();
    } else {
      setIsQuizComplete(true);
      const practiceLabel =
        worldFilter === 'all' ? 'All Worlds Practice' : `World ${worldFilter.toUpperCase()} Practice`;
      const elapsed = Math.max(15, Math.round((Date.now() - practiceStartTimeRef.current) / 1000));
      const accPct = Math.round((score / Math.max(1, activePracticePool.length)) * 100);
      recordQuizRunCompletion({
        bucketKey: `practice_${worldFilter}`,
        accuracyPercent: accPct,
        totalTimeSec: elapsed,
        recordsForHeatmap: practiceRecords,
      });
      onQuizCompleted?.({
        worldCode: worldFilter,
        correctCount: score,
        totalCount: activePracticePool.length,
        topicTitle: `${practiceLabel} (${activePracticePool.length} Qs)`,
      });
      onBossQuizCompleted?.();
      if (studyDifficulty === 'exam_prep') {
        onRecordBossBattleLog?.({
          modeLabel: practiceLabel,
          score,
          totalQuestions: activePracticePool.length,
          timeTakenSeconds: elapsed,
          incorrectTopics: practiceMissedTopics,
          victory: score >= Math.ceil(activePracticePool.length * 0.7),
        });
      }
      if (accPct === 100) {
        marioAudio.playFlagpole();
        marioAudio.playQuizComplete();
      } else if (accPct < 60) {
        marioAudio.playGameOver();
      } else {
        marioAudio.playQuizComplete();
      }
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    }
  };

  // Boss Battle Logic
  const rawBossQ = bossDeck[bossIdx % bossDeck.length];
  const bossQ = useMemo(
    () => (rawBossQ ? adaptBossQuestionForDifficulty(rawBossQ, studyDifficulty) : null),
    [rawBossQ, studyDifficulty]
  );

  useEffect(() => {
    if (bossBattleState === 'combat' && !bossAnswerSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleBossTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [bossBattleState, bossAnswerSubmitted, bossIdx]);

  const handleBossTimeout = () => {
    setBossAnswerSubmitted(true);
    marioAudio.playTryAgain();
    setComboStreak(0);
    const curWorldCode = rawBossQ?.worldCode || 'boss';
    const nextRecs = [...bossRecords, { worldCode: curWorldCode, isCorrect: false }];
    const nextMissed = rawBossQ
      ? [...bossMissedTopics, `${rawBossQ.world} (${rawBossQ.legalBasis})`]
      : bossMissedTopics;
    if (bossQ) {
      setBossMissedDetails((prev) => [
        ...prev,
        {
          scenario: bossQ.scenario,
          correctOptionText: bossQ.options[bossQ.correctIndex] || '',
          chosenOptionText: 'Timed Out (No answer selected)',
          legalBasis: bossQ.legalBasis || 'Philippine Labor Code',
          explanation: bossQ.explanation || '',
          worldCode: curWorldCode,
          quizModeLabel: 'Bowser Boss',
        },
      ]);
    }
    setBossRecords(nextRecs);
    setBossMissedTopics(nextMissed);
    setPlayerHearts((h) => {
      const next = h - 1;
      if (next <= 0) {
        setBossBattleState('defeat');
        marioAudio.playGameOver();
        if (studyDifficulty === 'exam_prep') {
          const elapsed = Math.max(10, Math.round((Date.now() - bossStartTimeRef.current) / 1000));
          onRecordBossBattleLog?.({
            modeLabel: `Bowser Boss (${bossTier === 'mega' ? 'Mega 200 HP' : 'Standard 100 HP'})`,
            score: nextRecs.filter((r) => r.isCorrect).length,
            totalQuestions: nextRecs.length,
            timeTakenSeconds: elapsed,
            incorrectTopics: nextMissed,
            victory: false,
          });
        }
      }
      return next;
    });
  };

  const handleSkipBossWithToken = () => {
    if (bossSkipTokens <= 0) return;
    onConsumeBossSkipToken?.();
    setBossRecords([
      { worldCode: 'w1', isCorrect: true },
      { worldCode: 'w2', isCorrect: true },
      { worldCode: 'w3', isCorrect: true },
      { worldCode: 'w5', isCorrect: true },
      { worldCode: 'w6', isCorrect: true },
    ]);
    setBossBattleState('victory');
    onQuizCompleted?.({
      worldCode: 'BOSS',
      correctCount: 5,
      totalCount: 5,
      isBossVictory: true,
      topicTitle: 'Bowser Lava Keep (Royal Writ Skip)',
    });
    onBossQuizCompleted?.();
    onActivateBossDefeatInvincible?.();
    marioAudio.playStarTheme();
    onEarnCoins(100);
    try {
      confetti({ particleCount: 140, spread: 100, origin: { y: 0.5 } });
    } catch {
      // ignore
    }
  };

  const executeStartBossBattle = (tier: 'standard' | 'mega' = bossTier) => {
    const shuffled = drawUniqueFromDeck(
      'bowser_boss_arena',
      BOWSER_BOSS_QUESTIONS,
      BOWSER_BOSS_QUESTIONS.length
    ).map((item) => {
      const optShuffled = shuffleChoiceOptions(item.options, item.correctIndex);
      return {
        ...item,
        options: optShuffled.options,
        correctIndex: optShuffled.correctIndex,
      };
    });
    const hpTarget = tier === 'mega' ? 200 : 100;
    setBossTier(tier);
    setBossDeck(shuffled);
    setBossMaxHp(hpTarget);
    setBossHp(hpTarget);
    setPlayerHearts(tier === 'mega' ? 4 : 3);
    setBossIdx(0);
    setBossSelectedAnswer(null);
    setBossAnswerSubmitted(false);
    setComboStreak(0);
    setBossRecords([]);
    setBossMissedTopics([]);
    setBossMissedDetails([]);
    bossStartTimeRef.current = Date.now();
    setTimeLeft(defaultBossSeconds);
    setBossBattleState('combat');
    marioAudio.playPowerUp();
  };

  const handleStartBossBattle = (tier: 'standard' | 'mega' = bossTier) => {
    launchWithBossWarp(
      tier === 'mega' ? 'MEGA BOWSER 200 HP SHOWDOWN' : 'BOWSER LAVA KEEP SHOWDOWN',
      () => executeStartBossBattle(tier)
    );
  };

  const handleSelectBossOption = (idx: number) => {
    if (bossAnswerSubmitted) return;
    setBossSelectedAnswer(idx);
    marioAudio.playJump();
  };

  const handleSubmitBossAnswer = () => {
    if (bossSelectedAnswer === null || bossAnswerSubmitted || !bossQ) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setBossAnswerSubmitted(true);

    const isRight = bossSelectedAnswer === bossQ.correctIndex;
    const curWorldCode = rawBossQ?.worldCode || bossQ.worldCode || 'boss';
    const nextRecs = [...bossRecords, { worldCode: curWorldCode, isCorrect: isRight }];
    const nextMissed = isRight
      ? bossMissedTopics
      : [...bossMissedTopics, `${bossQ.world} (${bossQ.legalBasis})`];
    if (!isRight) {
      setBossMissedDetails((prev) => [
        ...prev,
        {
          scenario: bossQ.scenario,
          correctOptionText: bossQ.options[bossQ.correctIndex] || '',
          chosenOptionText: bossQ.options[bossSelectedAnswer] || '',
          legalBasis: bossQ.legalBasis || 'Philippine Labor Code',
          explanation: bossQ.explanation || '',
          worldCode: curWorldCode,
          quizModeLabel: 'Bowser Boss',
        },
      ]);
    }
    setBossRecords(nextRecs);
    setBossMissedTopics(nextMissed);

    if (isRight) {
      marioAudio.playSuccess();
      marioAudio.playFireball();
      marioAudio.playBowserHit();
      try {
        confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      const nextStreak = comboStreak + 1;
      setComboStreak(nextStreak);
      onEarnCoins(10);

      const nextHp = Math.max(0, bossHp - 20);
      setBossHp(nextHp);

      if (nextHp <= 0) {
        setTimeout(() => {
          setBossBattleState('victory');
          const elapsed = Math.max(10, Math.round((Date.now() - bossStartTimeRef.current) / 1000));
          onQuizCompleted?.({
            worldCode: 'BOSS',
            correctCount: nextRecs.filter((r) => r.isCorrect).length,
            totalCount: nextRecs.length,
            isBossVictory: true,
            topicTitle: `Bowser Lava Keep (${bossTier === 'mega' ? 'Mega 10-Hit' : 'Standard 5-Hit'})`,
          });
          onBossQuizCompleted?.();
          onActivateBossDefeatInvincible?.();
          if (studyDifficulty === 'exam_prep') {
            onRecordBossBattleLog?.({
              modeLabel: `Bowser Boss (${bossTier === 'mega' ? 'Mega 200 HP' : 'Standard 100 HP'})`,
              score: nextRecs.filter((r) => r.isCorrect).length,
              totalQuestions: nextRecs.length,
              timeTakenSeconds: elapsed,
              incorrectTopics: nextMissed,
              victory: true,
            });
          }
          marioAudio.playQuizComplete();
          onEarnCoins(bossTier === 'mega' ? 200 : 100);
          try {
            confetti({ particleCount: 140, spread: 100, origin: { y: 0.5 } });
          } catch {
            // ignore
          }

          const badgeId = bossTier === 'mega' ? 'mega_bowser_slayer' : 'bowser_slayer';
          const newBadge: DigitalBadge = {
            id: badgeId,
            name: bossTier === 'mega' ? 'MEGA BOWSER CONQUEROR' : 'BOWSER SLAYER',
            title:
              bossTier === 'mega'
                ? '10-Hit Grandmaster of Philippine Labor Law'
                : 'Supreme Master of Philippine Labor Standards',
            description: 'Defeated Bowser’s Lava Keep under rapid-fire statutory questioning!',
            dateUnlocked: new Date().toLocaleDateString(),
          };

          const updatedBadges = [...badges.filter((b) => b.id !== badgeId), newBadge];
          setBadges(updatedBadges);
          try {
            localStorage.setItem('mario_unlocked_badges', JSON.stringify(updatedBadges));
          } catch {
            // fallback
          }
        }, 900);
      }
    } else if (bossShieldArmed) {
      setBossShieldArmed(false);
      marioAudio.playPowerUp();
    } else {
      triggerWrongAnswerPulse();
      marioAudio.playTryAgain();
      setComboStreak(0);
      const nextHearts = playerHearts - 1;
      setPlayerHearts(nextHearts);
      if (nextHearts <= 0) {
        setTimeout(() => {
          setBossBattleState('defeat');
          marioAudio.playGameOver();
          if (studyDifficulty === 'exam_prep') {
            const elapsed = Math.max(10, Math.round((Date.now() - bossStartTimeRef.current) / 1000));
            onRecordBossBattleLog?.({
              modeLabel: `Bowser Boss (${bossTier === 'mega' ? 'Mega 200 HP' : 'Standard 100 HP'})`,
              score: nextRecs.filter((r) => r.isCorrect).length,
              totalQuestions: nextRecs.length,
              timeTakenSeconds: elapsed,
              incorrectTopics: nextMissed,
              victory: false,
            });
          }
        }, 900);
      }
    }
  };

  const handleNextBossQuestion = () => {
    setBossIdx((prev) => prev + 1);
    setBossSelectedAnswer(null);
    setBossAnswerSubmitted(false);
    setTimeLeft(defaultBossSeconds);
    marioAudio.playJump();
  };

  // ==================== MODE 3: KOOPA BOSS MODE (10 Hard Qs, <=1 Miss Unlocks Koopa Sovereign Frame) ====================
  const buildKoopaBossDeck = (): AdaptedQuizQuestion[] => {
    const hardSource = createFreshShuffledDeck(BOWSER_BOSS_QUESTIONS, Date.now());
    return hardSource.slice(0, KOOPA_BOSS_TOTAL_QUESTIONS).map((item) => {
      const adapted = adaptBossQuestionForDifficulty(item, 'exam_prep');
      const shuffled = shuffleChoiceOptions(adapted.options, adapted.correctIndex);
      return {
        ...adapted,
        options: shuffled.options,
        correctIndex: shuffled.correctIndex,
      };
    });
  };

  const [koopaDeck, setKoopaDeck] = useState<AdaptedQuizQuestion[]>(() => buildKoopaBossDeck());
  const [koopaIdx, setKoopaIdx] = useState<number>(0);
  const [koopaSelected, setKoopaSelected] = useState<number | null>(null);
  const [koopaSubmitted, setKoopaSubmitted] = useState<boolean>(false);
  const [koopaState, setKoopaState] = useState<KoopaBossState>(() =>
    createInitialKoopaBossState()
  );
  const [koopaFrameEquippedFeedback, setKoopaFrameEquippedFeedback] = useState<boolean>(false);

  const executeFreshKoopaBoss = () => {
    setKoopaDeck(buildKoopaBossDeck());
    setKoopaIdx(0);
    setKoopaSelected(null);
    setKoopaSubmitted(false);
    setKoopaState(createInitialKoopaBossState());
    setKoopaMissedDetails([]);
    setKoopaFrameEquippedFeedback(false);
    setEliminatedOptions([]);
    setRevealedCounselHint(null);
  };

  const startFreshKoopaBoss = (withPipeWarp = false) => {
    if (withPipeWarp) {
      launchWithBossWarp('KOOPA SOVEREIGN CITADEL GAUNTLET', executeFreshKoopaBoss);
    } else {
      executeFreshKoopaBoss();
    }
  };

  const koopaQ = koopaDeck[koopaIdx];

  const unlockKoopaSovereignFrame = () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('mario_unlocked_items');
      const parsed: string[] = raw ? JSON.parse(raw) : [];
      if (!parsed.includes(KOOPA_SOVEREIGN_FRAME_ID)) {
        const updated = [...parsed, KOOPA_SOVEREIGN_FRAME_ID];
        localStorage.setItem('mario_unlocked_items', JSON.stringify(updated));
        window.dispatchEvent(new Event('mario-unlocked-items-updated'));
      }
    } catch {
      // ignore
    }
  };

  const handleEquipKoopaFrameNow = () => {
    if (typeof window === 'undefined') return;
    try {
      unlockKoopaSovereignFrame();
      localStorage.setItem('mario_equipped_card_frame', KOOPA_SOVEREIGN_FRAME_ID);
      window.dispatchEvent(
        new CustomEvent('mario-equip-card-frame', { detail: KOOPA_SOVEREIGN_FRAME_ID })
      );
      setKoopaFrameEquippedFeedback(true);
      marioAudio.playPowerUp();
    } catch {
      // ignore
    }
  };

  const handleSubmitKoopaAnswer = () => {
    if (koopaSelected === null || koopaSubmitted || !koopaQ || koopaState.status !== 'active') {
      return;
    }
    setKoopaSubmitted(true);
    const isCorrect = koopaSelected === koopaQ.correctIndex;
    const koopaMaxAllowedMisses = KOOPA_BOSS_MAX_MISSES + (hasLifeRing ? 1 : 0);
    const nextState = stepKoopaBossAnswer(
      koopaState,
      isCorrect,
      koopaDeck.length,
      koopaMaxAllowedMisses
    );
    setKoopaState(nextState);

    if (isCorrect) {
      marioAudio.playSuccess();
      marioAudio.playFireball();
      onEarnCoins(10);
    } else {
      setKoopaMissedDetails((prev) => [
        ...prev,
        {
          scenario: koopaQ.scenario,
          correctOptionText: koopaQ.options[koopaQ.correctIndex] || '',
          chosenOptionText: koopaQ.options[koopaSelected] || '',
          legalBasis: koopaQ.legalBasis || 'Philippine Labor Code',
          explanation: koopaQ.explanation || '',
          worldCode: koopaQ.worldCode || 'w1',
          quizModeLabel: 'Koopa Citadel',
        },
      ]);
      triggerWrongAnswerPulse();
      marioAudio.playTryAgain();
    }

    if (nextState.status === 'victory') {
      unlockKoopaSovereignFrame();
      onEarnCoins(150);
      dispatchDailyMissionEvent('quiz_80', 1);
      onQuizCompleted?.({
        worldCode: 'KOOPA_BOSS',
        correctCount: nextState.correctCount,
        totalCount: koopaDeck.length,
        isBossVictory: true,
        topicTitle: 'Koopa Boss Gauntlet (10 Hard Qs)',
      });
      onBossQuizCompleted?.();
      marioAudio.playFlagpole();
      marioAudio.playLevelUp();
      try {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.55 } });
      } catch {
        // ignore
      }
    } else if (nextState.status === 'defeat') {
      marioAudio.playGameOver();
    }
  };

  const handleNextKoopaQuestion = () => {
    if (koopaState.status !== 'active') return;
    setKoopaIdx((i) => Math.min(koopaDeck.length - 1, i + 1));
    setKoopaSelected(null);
    setKoopaSubmitted(false);
    marioAudio.playPipe();
  };

  // ==================== MODE 4: ASYNC 3-QUESTION QUIZ BATTLE ====================
  const [incomingChallenge, setIncomingChallenge] = useState<AsyncBattleChallenge | null>(() => {
    if (typeof window === 'undefined') return null;
    const token = new URLSearchParams(window.location.search).get('async_battle') || '';
    return decodeAsyncBattleChallenge(token);
  });
  const [asyncWorld, setAsyncWorld] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const token = new URLSearchParams(window.location.search).get('async_battle') || '';
      const parsed = decodeAsyncBattleChallenge(token);
      if (parsed?.worldId) return parsed.worldId;
    }
    return activeWorld || 'world1';
  });

  const buildAsyncDeck = (targetWorldId: string, forcedIds?: string[]): AdaptedQuizQuestion[] => {
    const code = mapActiveWorldToQuizCode(targetWorldId);
    const fullPool = getQuizQuestionsForDifficulty('exam_prep', 'all');
    if (forcedIds && forcedIds.length > 0) {
      const matched = forcedIds
        .map((qid) => fullPool.find((item) => String(item.id) === String(qid)))
        .filter((item): item is AdaptedQuizQuestion => Boolean(item));
      if (matched.length >= 3) {
        return matched.slice(0, 3);
      }
    }
    const worldPool =
      code === 'all'
        ? fullPool
        : fullPool.filter((item) => item.worldCode === code);
    const source = worldPool.length >= 3 ? worldPool : fullPool;
    return createFreshShuffledDeck(source, Date.now()).slice(0, 3).map((item) => {
      const shuffled = shuffleChoiceOptions(item.options, item.correctIndex);
      return {
        ...item,
        options: shuffled.options,
        correctIndex: shuffled.correctIndex,
      };
    });
  };

  const [asyncDeck, setAsyncDeck] = useState<AdaptedQuizQuestion[]>(() =>
    buildAsyncDeck(asyncWorld, incomingChallenge?.questionIds)
  );
  const [asyncIdx, setAsyncIdx] = useState<number>(0);
  const [asyncSelected, setAsyncSelected] = useState<number | null>(null);
  const [asyncSubmitted, setAsyncSubmitted] = useState<boolean>(false);
  const [asyncScore, setAsyncScore] = useState<number>(0);
  const [asyncComplete, setAsyncComplete] = useState<boolean>(false);
  const [asyncElapsedSec, setAsyncElapsedSec] = useState<number>(0);
  const [asyncCopied, setAsyncCopied] = useState<boolean>(false);
  const asyncStartRef = useRef<number>(Date.now());

  useEffect(() => {
    if (activeMode !== 'async_battle' || asyncComplete) return;
    const t = window.setInterval(() => {
      setAsyncElapsedSec(Math.max(1, Math.round((Date.now() - asyncStartRef.current) / 1000)));
    }, 500);
    return () => window.clearInterval(t);
  }, [activeMode, asyncComplete]);

  const startFreshAsyncBattle = (targetWorldId: string = asyncWorld, keepIncoming = false) => {
    const nextChallenge = keepIncoming ? incomingChallenge : null;
    if (!keepIncoming) setIncomingChallenge(null);
    setAsyncWorld(targetWorldId);
    setAsyncDeck(buildAsyncDeck(targetWorldId, nextChallenge?.questionIds));
    setAsyncIdx(0);
    setAsyncSelected(null);
    setAsyncSubmitted(false);
    setAsyncScore(0);
    setAsyncComplete(false);
    setAsyncElapsedSec(0);
    setAsyncCopied(false);
    setAsyncMissedDetails([]);
    asyncStartRef.current = Date.now();
  };

  const asyncQ = asyncDeck[asyncIdx];

  const handleSubmitAsyncAnswer = () => {
    if (asyncSelected === null || asyncSubmitted || !asyncQ) return;
    setAsyncSubmitted(true);
    const isRight = asyncSelected === asyncQ.correctIndex;
    const nextScore = asyncScore + (isRight ? 1 : 0);
    setAsyncScore(nextScore);
    if (isRight) {
      marioAudio.playSuccess();
      marioAudio.playCoin();
    } else {
      setAsyncMissedDetails((prev) => [
        ...prev,
        {
          scenario: asyncQ.scenario,
          correctOptionText: asyncQ.options[asyncQ.correctIndex] || '',
          chosenOptionText: asyncQ.options[asyncSelected] || '',
          legalBasis: asyncQ.legalBasis || 'Philippine Labor Code',
          explanation: asyncQ.explanation || '',
          worldCode: asyncQ.worldCode || 'w1',
          quizModeLabel: 'Async Duel',
        },
      ]);
      triggerWrongAnswerPulse();
      marioAudio.playTryAgain();
    }
  };

  const handleNextAsyncQuestion = () => {
    if (asyncIdx < asyncDeck.length - 1) {
      setAsyncIdx((i) => i + 1);
      setAsyncSelected(null);
      setAsyncSubmitted(false);
      marioAudio.playPipe();
    } else {
      const totalSec = Math.max(4, Math.round((Date.now() - asyncStartRef.current) / 1000));
      setAsyncElapsedSec(totalSec);
      setAsyncComplete(true);
      const rival = incomingChallenge
        ? {
            rivalName: incomingChallenge.challengerName,
            rivalScore: incomingChallenge.challengerScore,
            rivalTimeSec: incomingChallenge.challengerTimeSec,
          }
        : computeSimulatedRivalResult(`${asyncWorld}_${asyncDeck.map((d) => d.id).join('_')}`);
      const playerWon =
        asyncScore > rival.rivalScore ||
        (asyncScore === rival.rivalScore && totalSec <= rival.rivalTimeSec);
      onEarnCoins(playerWon ? 45 : 20);
      if (asyncScore / Math.max(1, asyncDeck.length) >= 0.8) {
        dispatchDailyMissionEvent('quiz_80', 1);
      }
      if (playerWon) {
        marioAudio.playFlagpole();
        marioAudio.playQuizComplete();
      } else {
        marioAudio.playTryAgain();
      }
    }
  };

  const handleCopyAsyncShareUrl = () => {
    if (typeof window === 'undefined') return;
    const token = encodeAsyncBattleChallenge({
      worldId: asyncWorld,
      challengerName: 'Counsel Mario',
      challengerScore: asyncScore,
      challengerTimeSec: Math.max(4, asyncElapsedSec),
      questionIds: asyncDeck.map((item) => String(item.id)),
    });
    const shareUrl = `${window.location.origin}${window.location.pathname}?async_battle=${encodeURIComponent(token)}`;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setAsyncCopied(true);
    marioAudio.playCoin();
  };

  useEffect(() => {
    setEliminatedOptions([]);
    setRevealedCounselHint(null);
  }, [activeMode, quickIdx, currentIdx, bossIdx, flashbackIdx, simIdx, koopaIdx, asyncIdx]);

  const consumeTokenOrCoins = (
    tokenKey: 'quiz5050' | 'quizHint' | 'quizShield',
    coinCost: number
  ): boolean => {
    const latest = loadRound10VaultState();
    if ((latest.inventory[tokenKey] || 0) > 0) {
      const updated: Round10VaultState = {
        ...latest,
        inventory: {
          ...latest.inventory,
          [tokenKey]: Math.max(0, latest.inventory[tokenKey] - 1),
        },
      };
      setR10Vault(updated);
      saveRound10VaultState(updated);
      return true;
    }
    if (onSpendCoins && coins >= coinCost) {
      return onSpendCoins(coinCost);
    }
    return false;
  };

  const handleTrigger5050Lifeline = (
    optionsCount: number,
    correctIndex: number,
    alreadySubmitted: boolean
  ) => {
    if (alreadySubmitted || eliminatedOptions.length > 0) return;
    if (!consumeTokenOrCoins('quiz5050', 15)) {
      marioAudio.playStomp();
      return;
    }
    marioAudio.playPowerUp();
    const wrongIndices = Array.from({ length: optionsCount }, (_, i) => i).filter(
      (i) => i !== correctIndex
    );
    const toEliminate = wrongIndices.slice(0, Math.min(2, Math.max(1, optionsCount - 2)));
    setEliminatedOptions(toEliminate);
  };

  const handleTriggerHintLifeline = (
    legalBasis?: string,
    hintText?: string,
    explanationText?: string,
    alreadySubmitted?: boolean
  ) => {
    if (alreadySubmitted || revealedCounselHint) return;
    if (!consumeTokenOrCoins('quizHint', 15)) {
      marioAudio.playStomp();
      return;
    }
    marioAudio.playCoin();
    const basis = legalBasis || 'Philippine Labor Code (P.D. 442)';
    const clue =
      hintText ||
      (explanationText ? `${explanationText.slice(0, 125)}...` : 'Focus on the statutory threshold & exception.');
    setRevealedCounselHint(`Counsel Toad Statutory Clue (${basis}): ${clue}`);
  };

  const handleArmBossShield = () => {
    if (bossShieldArmed) return;
    if (!consumeTokenOrCoins('quizShield', 25)) {
      marioAudio.playStomp();
      return;
    }
    marioAudio.playPowerUp();
    setBossShieldArmed(true);
  };

  const renderMarioStageProgressBar = (params: {
    currentStep: number;
    totalSteps: number;
    stageTitle: string;
    rightLabel?: string;
    lives?: number;
    maxLives?: number;
  }) => {
    const safeTotal = Math.max(1, params.totalSteps);
    const clampedStep = Math.min(safeTotal, Math.max(1, params.currentStep));
    const pct = Math.min(100, Math.max(6, Math.round((clampedStep / safeTotal) * 100)));

    const activeGhost = ghostRunsByBucket[activeWorld || 'all'] || null;
    const elapsedSec = Math.max(1, Math.round((Date.now() - quickStartTimeRef.current) / 1000));
    const answeredCount = quickRecords.length;
    const correctSoFar = quickRecords.filter((r) => r.isCorrect).length;
    const currentAccPct =
      answeredCount > 0 ? Math.round((correctSoFar / answeredCount) * 100) : 100;
    const ghostEval = evaluateGhostRaceStatus({
      currentQuestionNumber: Math.max(1, answeredCount),
      totalQuestions: safeTotal,
      playerAccuracyPercent: currentAccPct,
      playerElapsedSec: elapsedSec,
      ghost: activeGhost,
    });

    return (
      <div
        data-testid="mario-stage-flag-progress"
        data-card-frame={equippedCardFrame}
        className={`rounded-2xl bg-slate-950 text-white p-3.5 border-3 ${
          resolvedQuizFrame.id !== 'frame_default'
            ? resolvedQuizFrame.borderClasses
            : 'border-black'
        } shadow-[0_3px_0_#000] space-y-2.5`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mario text-[10px] text-amber-300 whitespace-nowrap">
              STAGE {clampedStep}/{safeTotal}
            </span>
            <span className="text-slate-500">·</span>
            <span className="font-bold text-slate-200 truncate">{params.stageTitle}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {typeof params.lives === 'number' && (
              <div
                data-testid="quiz-mario-lives-indicator"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/90 border border-emerald-500/70"
              >
                {Array.from({ length: params.maxLives ?? INITIAL_QUIZ_LIVES }).map((_, i) => (
                  <Mario1UpIcon
                    key={i}
                    className={`w-4 h-4 transition-opacity ${
                      i < (params.lives ?? 0) ? 'opacity-100' : 'opacity-25 grayscale'
                    }`}
                  />
                ))}
                <span className="font-mario text-[9px] text-emerald-300 ml-0.5 tabular-nums">
                  x{params.lives}
                </span>
              </div>
            )}
            {params.rightLabel && (
              <span className="font-extrabold text-amber-300 text-xs tabular-nums">
                {params.rightLabel}
              </span>
            )}
          </div>
        </div>

        {/* Mario Overworld Track + Race Against Your Ghost Runner */}
        <div className="relative pt-3.5 pb-1 pr-7">
          <div className="w-full h-3.5 rounded-full bg-slate-800 border-2 border-black overflow-hidden relative">
            {/* Ghost Progress Marker Track */}
            {ghostEval.hasGhost && (
              <div
                className="h-full bg-cyan-400/25 border-r-2 border-cyan-300 transition-all duration-300 absolute inset-y-0 left-0"
                style={{ width: `${ghostEval.ghostProgressPct}%` }}
              />
            )}
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-300 transition-all duration-300 relative z-10"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Ghost Runner Marker */}
          {ghostEval.hasGhost && (
            <div
              className="absolute top-0 -translate-x-1/2 transition-all duration-300 pointer-events-none z-10"
              style={{ left: `calc(${ghostEval.ghostProgressPct}% * 0.92 + 10px)` }}
              title={`Ghost Best Run: ${activeGhost?.bestAccuracyPercent}% in ${activeGhost?.bestTotalTimeSec}s`}
            >
              <div className="px-1.5 py-0.5 rounded-md bg-cyan-950/95 border border-cyan-400 text-[9px] font-black text-cyan-200 font-mono whitespace-nowrap">
                GHOST {ghostEval.ghostAccuracyPct}%
              </div>
            </div>
          )}

          {/* Player Runner Icon advancing toward the Stage Flag */}
          <div
            className="absolute top-0.5 -translate-x-1/2 transition-all duration-300 pointer-events-none z-20"
            style={{ left: `calc(${pct}% * 0.92 + 10px)` }}
          >
            <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
              <MarioCharacterAvatar character="mario" className="w-4 h-4" />
            </div>
          </div>

          {/* Goal Flagpole at right end */}
          <div
            className="absolute right-0 top-0 w-7 h-7 rounded-xl bg-emerald-500 border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]"
            title="Course Goal Flagpole"
          >
            <MarioFlagIcon className="w-4 h-4" />
          </div>
        </div>

        {/* Race Against Your Ghost Status Line */}
        <div
          data-testid="quiz-ghost-race-banner"
          className="flex flex-wrap items-center justify-between gap-2 text-[11px] bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 font-mono"
        >
          <span className="font-black text-cyan-300">
            RACE AGAINST YOUR GHOST
          </span>
          <span
            className={`font-bold tabular-nums ${
              ghostEval.leadStatus === 'ahead'
                ? 'text-emerald-300'
                : ghostEval.leadStatus === 'behind'
                ? 'text-amber-300'
                : 'text-slate-300'
            }`}
          >
            {ghostEval.summaryLabel}
          </span>
        </div>
      </div>
    );
  };

  const renderMarioCourseOutcomeBanner = (params: {
    accuracyPercent: number;
    courseTitle: string;
  }) => {
    const isClear = params.accuracyPercent >= 60;
    const isPerfect = params.accuracyPercent === 100;

    return (
      <div
        data-testid={isClear ? 'mario-course-clear-overlay' : 'mario-game-over-overlay'}
        className={`rounded-3xl p-4 sm:p-5 border-3 border-black shadow-[0_4px_0_#000] text-white ${
          isClear
            ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900'
            : 'bg-gradient-to-r from-rose-950 via-red-950 to-slate-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div
              className={`w-14 h-14 rounded-2xl border-3 border-black flex items-center justify-center shrink-0 shadow-[0_3px_0_#000] ${
                isClear ? 'bg-amber-400 text-slate-950' : 'bg-red-700 text-white'
              }`}
            >
              {isClear ? (
                <MarioFlagIcon className="w-8 h-8" />
              ) : (
                <MarioBowserIcon className="w-9 h-9" />
              )}
            </div>
            <div className="space-y-1">
              <span className="font-mario text-[10px] sm:text-xs text-amber-300 uppercase block">
                {isPerfect
                  ? 'PERFECT 100% TOP-OF-FLAGPOLE FINISH!'
                  : isClear
                  ? 'MUSHROOM KINGDOM COURSE CLEAR!'
                  : 'GAME OVER — CONTINUE & MASTER THE CODAL!'}
              </span>
              <h4 className="text-lg sm:text-xl font-black font-display text-white">
                {params.courseTitle} · {params.accuracyPercent}% Accuracy
              </h4>
            </div>
          </div>

          {/* Animated Flagpole Slide on 100% Flawless Runs */}
          {isPerfect && (
            <div
              data-testid="perfect-score-flagpole-animation"
              className="relative w-20 h-24 rounded-2xl bg-sky-950/90 border-2 border-amber-400 flex items-end justify-center p-2 shrink-0 overflow-hidden"
            >
              <div className="w-1.5 h-20 bg-slate-200 border border-black rounded-full relative">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-black -top-2 -left-1 absolute" />
                <div className="absolute left-1 bottom-1 mario-flagpole-slider">
                  <MarioFlagIcon className="w-6 h-6" />
                </div>
              </div>
              <span className="absolute bottom-1 right-1.5 font-mario text-[8px] text-amber-300">
                1UP!
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderQuizCoinLifelineBar = (params: {
    optionsCount: number;
    correctIndex: number;
    legalBasis?: string;
    hint?: string;
    explanation?: string;
    submitted: boolean;
    isBoss?: boolean;
  }) => {
    const can5050 =
      !params.submitted &&
      eliminatedOptions.length === 0 &&
      (r10Vault.inventory.quiz5050 > 0 || (Boolean(onSpendCoins) && coins >= 15));
    const canHint =
      !params.submitted &&
      !revealedCounselHint &&
      (r10Vault.inventory.quizHint > 0 || (Boolean(onSpendCoins) && coins >= 15));
    const canShield =
      Boolean(params.isBoss) &&
      !bossShieldArmed &&
      (r10Vault.inventory.quizShield > 0 || (Boolean(onSpendCoins) && coins >= 25));

    return (
      <div
        data-testid="quiz-coin-lifeline-bar"
        className={`rounded-2xl p-3 border-2 flex flex-col gap-2 ${
          params.isBoss
            ? 'bg-slate-950/90 border-amber-500/60 text-white'
            : 'bg-amber-50/90 border-amber-400 text-slate-950'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase font-mario tracking-wider flex items-center gap-1.5">
            <MarioCoinIcon className="w-4 h-4 shrink-0" />
            <span>TOADSTOOL LIFELINES ({coins}c WALLET)</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              data-testid="lifeline-5050-btn"
              data-toadstool-powerup="true"
              disabled={!can5050}
              onClick={() =>
                handleTrigger5050Lifeline(
                  params.optionsCount,
                  params.correctIndex,
                  params.submitted
                )
              }
              className="min-h-[38px] px-3 py-1 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black text-xs border-2 border-black cursor-pointer inline-flex items-center gap-1.5 tabular-nums"
            >
              <MarioMushroomIcon className="w-4 h-4 shrink-0" />
              <span>
                Toadstool Power-Up (-2 Wrong){' '}
                {r10Vault.inventory.quiz5050 > 0
                  ? `(x${r10Vault.inventory.quiz5050})`
                  : '(15c)'}
              </span>
            </button>

            <button
              type="button"
              data-testid="lifeline-hint-btn"
              disabled={!canHint}
              onClick={() =>
                handleTriggerHintLifeline(
                  params.legalBasis,
                  params.hint,
                  params.explanation,
                  params.submitted
                )
              }
              className="min-h-[38px] px-3 py-1 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-black text-xs border-2 border-black cursor-pointer inline-flex items-center gap-1 tabular-nums"
            >
              <Lightbulb className="w-3.5 h-3.5 shrink-0" />
              <span>
                Statutory Hint{' '}
                {r10Vault.inventory.quizHint > 0
                  ? `(Scroll x${r10Vault.inventory.quizHint})`
                  : '(15c)'}
              </span>
            </button>

            {params.isBoss && (
              <button
                type="button"
                data-testid="lifeline-boss-shield-btn"
                disabled={!canShield}
                onClick={handleArmBossShield}
                className={`min-h-[38px] px-3 py-1 rounded-xl font-black text-xs border-2 border-black cursor-pointer inline-flex items-center gap-1 tabular-nums ${
                  bossShieldArmed
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950'
                }`}
              >
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {bossShieldArmed
                    ? 'Shield Armed!'
                    : r10Vault.inventory.quizShield > 0
                    ? `Heart Shield (x${r10Vault.inventory.quizShield})`
                    : 'Heart Shield (25c)'}
                </span>
              </button>
            )}
          </div>
        </div>

        {revealedCounselHint && (
          <div className="px-3 py-2 rounded-xl bg-sky-100 border border-sky-400 text-sky-950 text-xs font-extrabold">
            {revealedCounselHint}
          </div>
        )}
      </div>
    );
  };

  const worldSelectOptions: { worldId: string; label: string }[] = [
    { worldId: 'all', label: 'All Worlds' },
    { worldId: 'world1', label: 'W1: Hours' },
    { worldId: 'world2', label: 'W2: Rest' },
    { worldId: 'holidays', label: 'Holidays' },
    { worldId: 'world3', label: 'W3: Wages' },
    { worldId: 'world4', label: 'W4: Special' },
    { worldId: 'world5', label: 'W5: Protective' },
    { worldId: 'world6', label: 'W6: Leaves' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5 w-full">
      {/* Mario Pipe Warp Transition Overlay for Boss Battles */}
      <PipeWarpTransitionOverlay
        isActive={isBossWarping}
        bossTitle={bossWarpTitle}
        onTransitionComplete={() => {
          setIsBossWarping(false);
          const fn = pendingBossWarpActionRef.current;
          pendingBossWarpActionRef.current = null;
          fn?.();
        }}
      />

      {/* Full-Screen Distraction-Free Exam Focus Mode Overlay */}
      {isExamMode &&
        createPortal(
          <div
            data-testid="fullscreen-exam-mode-overlay"
            className="fixed inset-0 z-[130] w-full max-w-full overflow-y-auto overscroll-contain touch-pan-y bg-[#070b14] text-white flex flex-col p-3 sm:p-6 select-none"
          >
            {/* Compact Top Focus Bar */}
            <div className="max-w-3xl w-full mx-auto flex items-center justify-between gap-2 border-b-2 border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 border-2 border-black shadow-[0_2px_0_#000]">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mario block truncate">
                    EXAM FOCUS MODE
                  </span>
                  <h2 className="text-sm sm:text-base font-black text-white font-display truncate">
                    {activeWorldTitle.toUpperCase()} · BAR SIMULATION
                  </h2>
                </div>
              </div>

              {/* Countdown Timer + Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`px-3 py-1 rounded-xl border-2 font-mono font-black text-base sm:text-xl tabular-nums shadow-xs ${
                    examSecondsLeft <= 60
                      ? 'bg-rose-950/90 border-rose-500 text-rose-200'
                      : 'bg-slate-900 border-amber-400 text-amber-300'
                  }`}
                >
                  {Math.floor(examSecondsLeft / 60)
                    .toString()
                    .padStart(2, '0')}
                  :{(examSecondsLeft % 60).toString().padStart(2, '0')}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsExamPaused(!isExamPaused);
                    marioAudio.playClick();
                  }}
                  className="min-h-[40px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {isExamPaused ? (
                    <Play className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Pause className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span className="hidden sm:inline">
                    {isExamPaused ? 'Resume' : 'Pause'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsExamMode(false);
                    marioAudio.playPipe();
                  }}
                  className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-800 hover:bg-rose-900/60 border border-slate-600 flex items-center justify-center text-slate-200 hover:text-white cursor-pointer"
                  aria-label="Exit Exam Mode"
                  title="Exit Exam Mode"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Centered Single-Viewport Exam Stage */}
            <div className="max-w-3xl w-full mx-auto my-auto flex-1 flex flex-col justify-center py-4 min-w-0">
              {isExamPaused ? (
                <div className="bg-slate-900 border-4 border-slate-800 rounded-3xl p-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 mx-auto flex items-center justify-center border-2 border-black">
                    <Pause className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black font-display">EXAM MODE PAUSED</h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-semibold max-w-md mx-auto">
                    Take a deep breath. All timers are frozen. Ready to resume statutory questions?
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExamPaused(false);
                      marioAudio.playPowerUp();
                    }}
                    className="min-h-[44px] px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black shadow-[0_3px_0_#000] cursor-pointer"
                  >
                    Resume Exam Focus
                  </button>
                </div>
              ) : examSecondsLeft === 0 ? (
                <div className="bg-slate-900 border-4 border-rose-600 rounded-3xl p-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white mx-auto flex items-center justify-center border-2 border-black">
                    <Clock className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black font-display text-rose-400">
                    TIME&apos;S UP!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-semibold max-w-md mx-auto">
                    Your 5-minute timed examination session has concluded.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setExamSecondsLeft(300);
                        setIsExamPaused(false);
                        startFreshQuickTest(activeWorld, studyDifficulty);
                        marioAudio.playPowerUp();
                      }}
                      className="min-h-[44px] px-5 py-2 bg-amber-400 text-slate-950 font-black rounded-xl border-2 border-black cursor-pointer"
                    >
                      Try Another Sprint
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsExamMode(false)}
                      className="min-h-[44px] px-5 py-2 bg-slate-800 text-white font-bold rounded-xl border border-slate-600 cursor-pointer"
                    >
                      Exit Exam Mode
                    </button>
                  </div>
                </div>
              ) : quickComplete ? (
                <div className="bg-slate-900 border-4 border-emerald-500 rounded-3xl p-5 sm:p-6 text-center space-y-3.5 w-full min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-slate-950 mx-auto flex items-center justify-center border-2 border-black">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black font-display text-white">
                    EXAM SPRINT COMPLETED!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-semibold max-w-md mx-auto tabular-nums">
                    You scored {quickRecords.filter((r) => r.isCorrect).length} out of {quickDeck.length} with {Math.floor(examSecondsLeft / 60)}m {examSecondsLeft % 60}s remaining.
                  </p>

                  <div className="pt-1 text-left">
                    <QuizResultsLeaderboard
                      categoryKey="exam_mode"
                      categoryTitle="Exam Mode Sprint"
                      currentUserScore={{
                        correct: quickRecords.filter((r) => r.isCorrect).length,
                        total: quickDeck.length,
                        timeSeconds: Math.max(10, 300 - examSecondsLeft),
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setExamSecondsLeft(300);
                        setIsExamPaused(false);
                        startFreshQuickTest(activeWorld, studyDifficulty);
                        marioAudio.playPowerUp();
                      }}
                      className="min-h-[44px] px-5 py-2 bg-emerald-400 text-slate-950 font-black rounded-xl border-2 border-black cursor-pointer"
                    >
                      Start New Exam Sprint
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsExamMode(false)}
                      className="min-h-[44px] px-5 py-2 bg-slate-800 text-white font-bold rounded-xl border border-slate-600 cursor-pointer"
                    >
                      Return to Regular Mode
                    </button>
                  </div>
                </div>
              ) : quickQ ? (
                <div className="bg-white text-slate-950 rounded-3xl border-4 border-slate-950 p-4 sm:p-6 space-y-3.5 shadow-2xl w-full min-w-0">
                  <div className="flex items-center justify-between gap-2 border-b-2 border-slate-200 pb-2.5">
                    <span className="text-xs font-black uppercase text-red-600 font-mario tabular-nums">
                      QUESTION {quickIdx + 1} OF {quickDeck.length}
                    </span>
                    <span className="text-xs font-bold text-slate-600 tabular-nums">
                      Accuracy: {quickRecords.filter((r) => r.isCorrect).length} / {quickRecords.length}
                    </span>
                  </div>

                  <div className="p-3.5 sm:p-4 bg-slate-50 border-2 border-slate-300 rounded-2xl">
                    <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed break-words">
                      &ldquo;{quickQ.scenario}&rdquo;
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {quickQ.options.map((option, idx) => {
                      let optStyle = 'bg-white hover:bg-slate-100 border-slate-800 text-slate-900';
                      if (quickSelected === idx) {
                        optStyle = 'bg-amber-100 border-amber-600 text-amber-950 ring-2 ring-amber-400';
                      }
                      if (quickSubmitted) {
                        if (idx === quickQ.correctIndex) {
                          optStyle = 'bg-emerald-100 border-emerald-700 text-emerald-950 ring-3 ring-emerald-400';
                        } else if (quickSelected === idx) {
                          optStyle = 'bg-rose-100 border-rose-600 text-rose-950';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectQuickOption(idx)}
                          disabled={quickSubmitted}
                          className={`w-full min-h-[44px] p-2.5 sm:p-3 rounded-xl border-2 text-left font-bold text-xs sm:text-sm flex items-start gap-2.5 transition-all cursor-pointer ${optStyle}`}
                        >
                          <span className="min-w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-black shrink-0 mt-0.5">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1 leading-snug break-words">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3 border-t-2 border-slate-200">
                    {!quickSubmitted ? (
                      <button
                        type="button"
                        onClick={handleSubmitQuickAnswer}
                        disabled={quickSelected === null}
                        className="min-h-[42px] px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm rounded-xl border-2 border-black ml-auto cursor-pointer whitespace-nowrap"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNextQuickQuestion}
                        className="min-h-[42px] px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl border-2 border-black ml-auto flex items-center gap-2 cursor-pointer whitespace-nowrap"
                      >
                        <span>{quickIdx < quickDeck.length - 1 ? 'Next Question' : 'View Results'}</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>,
          document.body
        )}
      {/* Visual 5-Day Flagpole Streak Progression & Celebration */}
      {flagpoleStreak && onUpdateFlagpoleStreak && (
        <FlagpoleStreakWidget
          streakState={flagpoleStreak}
          onUpdateStreakState={onUpdateFlagpoleStreak}
          onAwardBonusXp={onAwardBonusXp}
          onStartDailyQuiz={() => {
            setActiveMode('quick');
            marioAudio.playPowerUp();
          }}
        />
      )}

      {/* Visual Daily Quiz Streak Fire Meter */}
      <DailyQuizFireMeter
        activeStreak={dailyBossQuizStreak?.activeStreak ?? 0}
        completedToday={dailyBossQuizStreak?.completedToday ?? false}
        nextRewardCoins={dailyBossQuizStreak?.nextStreakBonusCoins ?? 15}
      />

      {/* Quick Performance Heatmap Toggle Banner */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 px-4 py-2.5 rounded-2xl border-2 border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <Target className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200 truncate">
            Labor Law Codal Accuracy &amp; 30-Day Miss Heatmap
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowHeatmap((prev) => !prev);
            marioAudio.playPipe();
          }}
          className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase rounded-xl border border-black shadow cursor-pointer transition-all shrink-0 whitespace-nowrap"
        >
          {showHeatmap ? 'Hide 30d Heatmap' : 'Show 30d Heatmap'}
        </button>
      </div>

      {showHeatmap && (
        <QuizPerformanceInsightsPanel
          attemptsLog={sectionAttemptsLog}
          onStartTargetedDrill={(topicId) => {
            setShowHeatmap(false);
            setActiveMode('flashback');
            marioAudio.playPowerUp();
          }}
          onOpenStudyNotes={() => {
            if (onOpenProfile) onOpenProfile();
          }}
        />
      )}

      {/* Mode Switcher Tabs + Global Difficulty Indicator */}
      <div className="bg-slate-900 p-2.5 rounded-2xl border-3 border-slate-950 shadow-[4px_4px_0_#000] space-y-2.5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveMode('quick');
              marioAudio.playPowerUp();
            }}
            data-testid="quiz-mode-quick"
            className={`min-h-[44px] px-2.5 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-black transition-all cursor-pointer leading-none whitespace-nowrap min-w-0 ${
              activeMode === 'quick'
                ? 'bg-emerald-400 text-slate-950 border-2 border-black shadow-[0_2px_0_#000]'
                : 'bg-slate-800 text-slate-200 hover:text-white border-2 border-slate-700'
            }`}
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span className="truncate">Quick Test (5)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('exam_sim');
              marioAudio.playPowerUp();
              if (simCompleted) {
                startFreshExamSimulation(simTimePreset, studyDifficulty);
              }
            }}
            data-testid="quiz-mode-exam-sim"
            className={`min-h-[44px] px-2.5 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-black transition-all cursor-pointer leading-none whitespace-nowrap min-w-0 ${
              activeMode === 'exam_sim'
                ? 'bg-sky-400 text-slate-950 border-2 border-black shadow-[0_2px_0_#000]'
                : 'bg-slate-800 text-sky-300 hover:text-white border-2 border-slate-700'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span className="truncate">Exam Simulation</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('flashback');
              marioAudio.playPowerUp();
              startFreshFlashback();
            }}
            data-testid="quiz-mode-weakness-drill"
            className={`min-h-[44px] px-2.5 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-black transition-all cursor-pointer leading-none whitespace-nowrap min-w-0 ${
              activeMode === 'flashback'
                ? 'bg-rose-500 text-white border-2 border-black shadow-[0_2px_0_#000]'
                : 'bg-slate-800 text-rose-300 hover:text-white border-2 border-slate-700'
            }`}
          >
            <Target className="w-4 h-4 shrink-0" />
            <span className="truncate">Weakness Drill</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('practice');
              marioAudio.playJump();
            }}
            data-testid="quiz-mode-practice"
            className={`min-h-[44px] px-2.5 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-black transition-all cursor-pointer leading-none whitespace-nowrap min-w-0 ${
              activeMode === 'practice'
                ? 'bg-amber-400 text-slate-950 border-2 border-black shadow-[0_2px_0_#000]'
                : 'bg-slate-800 text-slate-200 hover:text-white border-2 border-slate-700'
            }`}
          >
            <Trophy className="w-4 h-4 shrink-0" />
            <span className="truncate">Practice ({fullPracticePoolForDifficulty.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              launchWithBossWarp('BOWSER LAVA KEEP SHOWDOWN', () => setActiveMode('boss'));
            }}
            data-testid="quiz-mode-boss"
            className={`min-h-[44px] px-2.5 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-black transition-all cursor-pointer leading-none whitespace-nowrap min-w-0 ${
              activeMode === 'boss'
                ? 'bg-red-600 text-white border-2 border-black shadow-[0_2px_0_#000]'
                : 'bg-slate-800 text-slate-200 hover:text-white border-2 border-slate-700'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate">Bowser Boss</span>
          </button>

          <button
            type="button"
            onClick={() => {
              launchWithBossWarp('KOOPA SOVEREIGN CITADEL GAUNTLET', () =>
                setActiveMode('koopa_boss')
              );
            }}
            data-testid="quiz-mode-koopa-boss"
            className={`min-h-[44px] px-2.5 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-black transition-all cursor-pointer leading-none whitespace-nowrap min-w-0 ${
              activeMode === 'koopa_boss'
                ? 'bg-lime-400 text-slate-950 border-2 border-black shadow-[0_2px_0_#000]'
                : 'bg-slate-800 text-lime-300 hover:text-white border-2 border-slate-700'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span className="truncate">Koopa Boss (10)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('async_battle');
              marioAudio.playPipe();
            }}
            data-testid="quiz-mode-async-battle"
            className={`col-span-2 sm:col-span-3 lg:col-span-2 min-h-[44px] px-2.5 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-black transition-all cursor-pointer leading-none whitespace-nowrap min-w-0 ${
              activeMode === 'async_battle'
                ? 'bg-violet-400 text-slate-950 border-2 border-black shadow-[0_2px_0_#000]'
                : 'bg-slate-800 text-violet-300 hover:text-white border-2 border-slate-700'
            }`}
          >
            <Swords className="w-4 h-4 shrink-0" />
            <span className="truncate">Async 3-Q Battle (Share Rival Link)</span>
          </button>
        </div>

        {/* Difficulty & Badges Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-bold">Difficulty:</span>
            <button
              type="button"
              onClick={() =>
                setStudyDifficulty(studyDifficulty === 'casual' ? 'exam_prep' : 'casual')
              }
              className={`min-h-[34px] px-3 rounded-lg border border-black font-black text-xs inline-flex items-center gap-1.5 cursor-pointer ${
                studyDifficulty === 'exam_prep'
                  ? 'bg-red-600 text-white'
                  : 'bg-emerald-400 text-slate-950'
              }`}
            >
              {studyDifficulty === 'exam_prep' ? (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Exam Prep (4-Choice)</span>
                </>
              ) : (
                <>
                  <Feather className="w-3.5 h-3.5 shrink-0" />
                  <span>Casual (3-Choice + Hints)</span>
                </>
              )}
            </button>

            <button
              type="button"
              data-testid="toggle-randomize-questions-btn"
              onClick={handleToggleRandomizeQuestions}
              aria-label={`Randomize Questions: ${randomizeQuestions ? 'On' : 'Off'}`}
              title="Shuffle question bank and answer orders for the active world to prevent rote memorization"
              className={`min-h-[34px] px-3 rounded-lg border font-black text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                randomizeQuestions
                  ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5 shrink-0" />
              <span>{randomizeQuestions ? 'Randomize: ON' : 'Randomize: OFF'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              data-testid="toggle-exam-mode-btn"
              onClick={() => {
                setIsExamMode((prev) => {
                  const next = !prev;
                  if (next) {
                    marioAudio.playPowerUp();
                    setExamSecondsLeft(300);
                    setIsExamPaused(false);
                  } else {
                    marioAudio.playPipe();
                  }
                  return next;
                });
              }}
              className={`min-h-[34px] px-3 rounded-lg border border-black font-black text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                isExamMode
                  ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{isExamMode ? 'Exit Exam Mode' : 'Exam Focus Mode'}</span>
            </button>

            {onOpenLeaderboard && (
              <button
                type="button"
                data-testid="open-quiz-leaderboard-btn"
                onClick={() => {
                  onOpenLeaderboard();
                  marioAudio.playCoin();
                }}
                className="min-h-[34px] px-3 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/70 inline-flex items-center gap-1.5 text-xs font-black text-amber-300 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Leaderboard</span>
              </button>
            )}

            {onOpenBossBattleLog && (
              <button
                type="button"
                data-testid="open-boss-battle-log-btn"
                onClick={() => {
                  onOpenBossBattleLog();
                  marioAudio.playCoin();
                }}
                className="min-h-[34px] px-3 rounded-lg bg-red-950/90 hover:bg-red-900 border border-red-600 inline-flex items-center gap-1.5 text-xs font-black text-amber-300 tabular-nums cursor-pointer whitespace-nowrap shrink-0"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Boss Log ({bossBattleLogCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onOpenProfile?.();
                marioAudio.playCoin();
              }}
              className="min-h-[34px] px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 inline-flex items-center gap-1.5 text-xs font-bold text-slate-200 tabular-nums cursor-pointer whitespace-nowrap shrink-0"
            >
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Badges:</span>
              <span className="text-amber-400 font-mario">
                {unlockedAchievementsCount !== undefined ? unlockedAchievementsCount : badges.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MODE 0A: EXAM SIMULATION (10 RANDOMIZED ALL-TOPIC QUESTIONS + TIMER + BREAKDOWN) ==================== */}
      {activeMode === 'exam_sim' && (
        <div data-testid="exam-simulation-view" className="space-y-5">
          {/* Exam Simulation Header & Live Countdown Timer */}
          <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-4 sm:p-6 mario-card border-4 border-slate-950 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                  <GraduationCap className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>All-Topics Mock Bar Exam · 10 Randomized Questions</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white font-display">
                  LABOR LAW EXAM SIMULATION
                </h2>
                <p className="text-xs sm:text-sm text-sky-100 font-semibold max-w-2xl">
                  Draws 10 randomized multiple-choice questions spanning Hours, Holidays, Wages, Special Workers, Tenure &amp; Leaves under a live Bar timer, followed by a complete score breakdown &amp; statutory explanations.
                </p>
              </div>

              {/* Timer & Controls Cluster */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div
                  data-testid="exam-sim-timer-display"
                  className={`min-h-[44px] px-4 py-1.5 rounded-xl border-2 font-mono font-black text-lg sm:text-xl tabular-nums inline-flex items-center gap-2 ${
                    simSecondsLeft <= 60 && !simCompleted
                      ? 'bg-rose-950 border-rose-400 text-rose-200 animate-pulse'
                      : 'bg-slate-950 border-amber-400 text-amber-300'
                  }`}
                >
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>
                    {Math.floor(simSecondsLeft / 60)
                      .toString()
                      .padStart(2, '0')}
                    :{(simSecondsLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                {!simCompleted && (
                  <button
                    type="button"
                    data-testid="exam-sim-pause-btn"
                    onClick={() => {
                      setSimPaused((p) => !p);
                      marioAudio.playClick();
                    }}
                    className="min-h-[44px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-xs font-black text-white inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    {simPaused ? (
                      <>
                        <Play className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4 text-amber-300 shrink-0" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  data-testid="exam-sim-new-deck-btn"
                  onClick={() => {
                    startFreshExamSimulation(simTimePreset, studyDifficulty);
                    marioAudio.playPowerUp();
                  }}
                  className="min-h-[44px] px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Shuffle className="w-3.5 h-3.5 shrink-0" />
                  <span>New 10-Q Exam</span>
                </button>
              </div>
            </div>

            {/* Timer Duration Presets + Progress Bar */}
            <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sky-200 font-bold">Timer Limit:</span>
                {(
                  [
                    { sec: 300 as const, label: '5 Mins (Blitz)' },
                    { sec: 600 as const, label: '10 Mins (Standard)' },
                    { sec: 900 as const, label: '15 Mins (Extended)' },
                  ]
                ).map((preset) => (
                  <button
                    key={preset.sec}
                    type="button"
                    onClick={() => {
                      startFreshExamSimulation(preset.sec, studyDifficulty);
                      marioAudio.playClick();
                    }}
                    className={`min-h-[36px] px-2.5 rounded-lg font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                      simTimePreset === preset.sec
                        ? 'bg-sky-400 text-slate-950 border-black font-black'
                        : 'bg-slate-900/80 text-slate-200 hover:text-white border-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="font-bold text-amber-300 tabular-nums">
                Answered: {simAnsweredCount} / {simDeck.length} Questions
              </div>
            </div>
          </div>

          {/* Active Timed Simulation Body vs. Post-Quiz Score Breakdown Screen */}
          {!simCompleted ? (
            simPaused ? (
              <div className="bg-white text-slate-900 rounded-3xl p-8 mario-card border-4 border-slate-950 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center mx-auto">
                  <Pause className="w-7 h-7 text-slate-950" />
                </div>
                <h3 className="text-2xl font-black font-display">EXAM SIMULATION PAUSED</h3>
                <p className="text-sm text-slate-600 font-semibold max-w-md mx-auto">
                  Questions are hidden while the simulation timer is paused. Click Resume when ready to continue.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSimPaused(false);
                    marioAudio.playPowerUp();
                  }}
                  className="min-h-[44px] px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black shadow-[0_3px_0_#000] cursor-pointer"
                >
                  Resume Exam Simulation
                </button>
              </div>
            ) : simQ ? (
              <div className="bg-white text-slate-900 rounded-3xl p-4 sm:p-7 mario-card border-4 border-slate-950 space-y-5">
                {/* 10-Question Navigator Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-slate-200">
                  <div
                    role="group"
                    aria-label="Exam question navigator"
                    className="flex items-center gap-1.5 flex-wrap"
                  >
                    {simDeck.map((item, qNumberIdx) => {
                      const isCurrent = qNumberIdx === simIdx;
                      const isAnswered =
                        typeof simAnswers[qNumberIdx] === 'number' &&
                        (simAnswers[qNumberIdx] as number) >= 0;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          data-testid={`exam-sim-nav-${qNumberIdx + 1}`}
                          onClick={() => {
                            setSimIdx(qNumberIdx);
                            marioAudio.playClick();
                          }}
                          className={`min-h-[40px] min-w-[40px] px-2 rounded-xl font-black text-xs tabular-nums border-2 transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-sky-500 text-white border-slate-950 shadow-[0_2px_0_#000]'
                              : isAnswered
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-600'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                          }`}
                        >
                          {qNumberIdx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-xs font-extrabold text-slate-600">
                    Topic: {getQuizWorldLabel(simQ.worldCode)}
                  </span>
                </div>

                {/* Question Prompt */}
                <div className="space-y-2">
                  <div className="text-xs font-extrabold text-sky-700 tabular-nums">
                    Question {simIdx + 1} of {simDeck.length} · {simQ.world}
                  </div>
                  <p className={`font-extrabold text-slate-950 leading-relaxed ${bodyTextClass}`}>
                    {simQ.scenario}
                  </p>
                  {studyDifficulty === 'casual' && simQ.hint && (
                    <p className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 rounded-xl px-3 py-2">
                      Memory Cue: {simQ.hint}
                    </p>
                  )}
                </div>

                {/* Multiple-Choice Options */}
                <div className="space-y-2.5">
                  {simQ.options.map((opt, optIdx) => {
                    const chosen = simAnswers[simIdx] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        data-testid={`exam-sim-option-${optIdx}`}
                        onClick={() => {
                          setSimAnswers((prev) => ({ ...prev, [simIdx]: optIdx }));
                          marioAudio.playJump();
                        }}
                        className={`w-full min-h-[52px] text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                          chosen
                            ? 'bg-sky-50 border-sky-600 text-slate-950 shadow-[0_3px_0_#0284c7]'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-900'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs border shrink-0 mt-0.5 ${
                            chosen
                              ? 'bg-sky-600 text-white border-black'
                              : 'bg-white text-slate-800 border-slate-400'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="font-bold text-sm sm:text-base leading-snug">
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation & Submit Exam Footer */}
                <div className="pt-4 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={simIdx === 0}
                      onClick={() => {
                        setSimIdx((i) => Math.max(0, i - 1));
                        marioAudio.playClick();
                      }}
                      className="min-h-[44px] px-4 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-900 font-black text-xs border-2 border-slate-400 cursor-pointer whitespace-nowrap"
                    >
                      Previous
                    </button>

                    {simIdx < simDeck.length - 1 && (
                      <button
                        type="button"
                        data-testid="exam-sim-next-btn"
                        onClick={() => {
                          setSimIdx((i) => Math.min(simDeck.length - 1, i + 1));
                          marioAudio.playPipe();
                        }}
                        className="min-h-[44px] px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs border-2 border-black inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    data-testid="exam-sim-submit-btn"
                    onClick={() => finishExamSimulation(false)}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm border-2 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>
                      Finish &amp; Grade Exam ({simAnsweredCount}/{simDeck.length})
                    </span>
                  </button>
                </div>
              </div>
            ) : null
          ) : simFinalSummary ? (
            <div
              data-testid="exam-sim-breakdown-screen"
              className="bg-white text-slate-900 rounded-3xl p-5 sm:p-8 mario-card border-4 border-slate-950 space-y-6"
            >
              {/* Overall Score Summary Header */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border-2 border-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="text-xs font-extrabold text-amber-300">
                    {simTimedOut
                      ? 'TIME EXPIRED — AUTO-SUBMITTED OFFICIAL SCORE REPORT'
                      : 'OFFICIAL EXAM SIMULATION SCORE REPORT'}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
                    {simFinalSummary.barVerdict}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-semibold max-w-xl">
                    {simFinalSummary.feedbackMessage}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 shrink-0 text-center">
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-700">
                    <span className="text-[11px] font-bold text-slate-400 block">Score</span>
                    <span
                      data-testid="exam-sim-score-value"
                      className="text-xl sm:text-2xl font-black text-emerald-400 tabular-nums"
                    >
                      {simFinalSummary.correctCount}/{simFinalSummary.totalCount}
                    </span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-700">
                    <span className="text-[11px] font-bold text-slate-400 block">Rating</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-300 tabular-nums">
                      {simFinalSummary.accuracyPercent}%
                    </span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-700">
                    <span className="text-[11px] font-bold text-slate-400 block">Time</span>
                    <span className="text-lg sm:text-xl font-black text-sky-300 tabular-nums">
                      {Math.floor(simFinalSummary.elapsedSeconds / 60)}m{' '}
                      {(simFinalSummary.elapsedSeconds % 60).toString().padStart(2, '0')}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Result Summary Breakdown Chart (Right vs Wrong per World/Category) */}
              <QuizResultSummaryChart
                records={simDeck.map((item, idx) => ({
                  worldCode: item.worldCode,
                  isCorrect: simAnswers[idx] === item.correctIndex,
                }))}
              />

              {/* Recharts Skill Breakdown, Bar Master Rank Progress & Quick Study Summary */}
              <QuizAnalyticsPanel
                records={simDeck.map((item, idx) => ({
                  worldCode: item.worldCode,
                  isCorrect: simAnswers[idx] === item.correctIndex,
                }))}
                missedQuestions={simDeck
                  .map((item, idx) => ({ item, userPick: simAnswers[idx] }))
                  .filter(({ item, userPick }) => userPick !== item.correctIndex)
                  .map(({ item, userPick }) => ({
                    scenario: item.scenario,
                    correctOptionText: item.options[item.correctIndex] || '',
                    chosenOptionText:
                      typeof userPick === 'number' && userPick >= 0
                        ? item.options[userPick] || ''
                        : 'Unanswered',
                    legalBasis: item.legalBasis || 'Philippine Labor Code',
                    explanation: item.explanation || '',
                    worldCode: item.worldCode,
                    quizModeLabel: 'Exam Simulation',
                  }))}
                quizHistory={quizHistory}
                currentRunCorrect={simFinalSummary.correctCount}
              />

              {/* Per-World Topic Accuracy Breakdown */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-base sm:text-lg font-black text-slate-950 font-display">
                    TOPIC-BY-TOPIC SCORE BREAKDOWN
                  </h4>
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 tabular-nums">
                    <MarioCoinIcon className="w-4 h-4" />
                    <span>+{simFinalSummary.coinsEarned} Gold Coins Earned</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {simFinalSummary.worldBreakdown.map((wb) => (
                    <div
                      key={wb.worldCode}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs font-bold">
                        <span className="text-slate-900 font-extrabold truncate">
                          {wb.worldLabel}
                        </span>
                        <span className="tabular-nums text-slate-700 shrink-0">
                          {wb.correctCount}/{wb.totalCount} · {wb.accuracyPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            wb.accuracyPercent >= 75
                              ? 'bg-emerald-500'
                              : wb.accuracyPercent >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.max(6, wb.accuracyPercent)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete 10-Question Explanations & Legal Citations */}
              <div
                data-testid="exam-sim-explanations-list"
                className="space-y-3 pt-2 border-t-2 border-slate-200"
              >
                <h4 className="text-base sm:text-lg font-black text-slate-950 font-display">
                  COMPLETE ANSWER KEY &amp; STATUTORY EXPLANATIONS (10 ITEMS)
                </h4>

                <div className="space-y-3">
                  {simDeck.map((item, idx) => {
                    const userPick = simAnswers[idx];
                    const hasPick = typeof userPick === 'number' && userPick >= 0;
                    const isRight = hasPick && userPick === item.correctIndex;
                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl p-4 border-2 space-y-2.5 ${
                          isRight
                            ? 'bg-emerald-50/60 border-emerald-400'
                            : 'bg-rose-50/60 border-rose-300'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                          <span className="text-slate-800">
                            Item #{idx + 1} · {getQuizWorldLabel(item.worldCode)} · {item.legalBasis}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 font-black ${
                              isRight ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {isRight ? (
                              <>
                                <CheckCircle className="w-4 h-4 shrink-0" />
                                <span>Correct</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 shrink-0" />
                                <span>{hasPick ? 'Incorrect' : 'Unanswered'}</span>
                              </>
                            )}
                          </span>
                        </div>

                        <p className="font-extrabold text-sm sm:text-base text-slate-950 leading-snug">
                          {item.scenario}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                            <span className="font-bold text-slate-500 block">Your Answer:</span>
                            <span
                              className={`font-extrabold ${
                                isRight ? 'text-emerald-800' : 'text-rose-800'
                              }`}
                            >
                              {hasPick
                                ? `${String.fromCharCode(65 + (userPick as number))}. ${
                                    item.options[userPick as number]
                                  }`
                                : 'No answer selected'}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-emerald-300">
                            <span className="font-bold text-emerald-700 block">
                              Correct Statutory Answer:
                            </span>
                            <span className="font-extrabold text-slate-950">
                              {String.fromCharCode(65 + item.correctIndex)}.{' '}
                              {item.options[item.correctIndex]}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/90 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div>
                            <strong className="font-black text-slate-950">Legal Explanation: </strong>
                            {item.explanation}
                          </div>
                          {!isRight && (
                            <SaveSingleQuizErrorButton
                              testId={`exam-sim-save-error-${idx}`}
                              compact
                              errorItem={{
                                scenario: item.scenario,
                                correctOptionText: item.options[item.correctIndex] || '',
                                chosenOptionText: hasPick
                                  ? item.options[userPick as number] || ''
                                  : 'Unanswered',
                                legalBasis: item.legalBasis || 'Philippine Labor Code',
                                explanation: item.explanation || '',
                                worldCode: item.worldCode,
                                quizModeLabel: 'Exam Simulation',
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-slate-200">
                <button
                  type="button"
                  data-testid="exam-sim-retake-btn"
                  onClick={() => {
                    startFreshExamSimulation(simTimePreset, studyDifficulty);
                    marioAudio.playPowerUp();
                  }}
                  className="min-h-[46px] px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm border-2 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Shuffle className="w-4 h-4 shrink-0" />
                  <span>Retake Randomized 10-Q Simulation</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ==================== MODE 0: QUICK TEST (5 RANDOM ACTIVE-WORLD QUESTIONS) ==================== */}
      {activeMode === 'quick' && (
        <div className="space-y-5">
          {/* Quick Test Header & Active World Selector */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-4 sm:p-6 mario-card border-4 border-slate-950 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 text-slate-950 font-black rounded-lg border border-black text-[10px] uppercase font-mario leading-snug">
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span className="sm:hidden">5-Q WORLD SPRINT</span>
                  <span className="hidden sm:inline">5-QUESTION ACTIVE WORLD SPRINT</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white font-display">
                  QUICK TEST: {activeWorldTitle.toUpperCase()}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 font-semibold max-w-2xl">
                  Pulls 5 random {studyDifficulty === 'casual' ? 'definition & threshold' : 'Bar Exam scenario'} questions from your active world and awards coins scaled to your accuracy!
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  startFreshQuickTest(activeWorld, studyDifficulty);
                  marioAudio.playPowerUp();
                }}
                className="min-h-[42px] px-4 inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black shadow-[0_2px_0_#000] text-xs cursor-pointer whitespace-nowrap shrink-0 w-full sm:w-auto"
              >
                <Shuffle className="w-3.5 h-3.5 shrink-0" />
                <span>New Random 5</span>
              </button>
            </div>

            {/* Active World Switcher inside Quick Test */}
            {onChangeActiveWorld && (
              <div className="pt-3 border-t border-white/15 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-amber-300 font-mario mr-1">
                  ACTIVE WORLD:
                </span>
                {worldSelectOptions.map((opt) => {
                  const isCurrent =
                    mapActiveWorldToQuizCode(activeWorld) ===
                    mapActiveWorldToQuizCode(opt.worldId);
                  return (
                    <button
                      key={opt.worldId}
                      type="button"
                      onClick={() => {
                        onChangeActiveWorld(opt.worldId);
                        marioAudio.playTabSwitch();
                      }}
                      className={`min-h-[44px] px-3 rounded-xl text-xs font-black border border-black cursor-pointer transition-all whitespace-nowrap ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                          : 'bg-slate-950/60 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {!quickComplete && quickQ ? (
            <div className="bg-white rounded-3xl mario-card border-4 border-slate-950 p-4 sm:p-7 space-y-5">
              {renderMarioStageProgressBar({
                currentStep: quickIdx + 1,
                totalSteps: quickDeck.length,
                stageTitle: quickQ.world,
                rightLabel: `Accuracy: ${quickRecords.filter((r) => r.isCorrect).length}/${quickRecords.length}`,
              })}

              {/* Question Prompt */}
              <div className="bg-slate-50 border-3 border-slate-800 rounded-2xl p-4 sm:p-6 space-y-2.5">
                <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider font-mario block">
                  {studyDifficulty === 'casual'
                    ? 'CASUAL CORE DEFINITION'
                    : 'EXAM PREP SCENARIO'}
                </span>
                <p className={`${bodyTextClass} font-extrabold text-slate-950 leading-relaxed`}>
                  &ldquo;{quickQ.scenario}&rdquo;
                </p>
                {studyDifficulty === 'casual' && quickQ.hint && (
                  <div className="pt-2 border-t border-slate-200 flex items-start gap-2 text-xs font-bold text-amber-900">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Hint: {quickQ.hint}</span>
                  </div>
                )}
              </div>

              {renderQuizCoinLifelineBar({
                optionsCount: quickQ.options.length,
                correctIndex: quickQ.correctIndex,
                legalBasis: quickQ.legalBasis,
                hint: quickQ.hint,
                explanation: quickQ.explanation,
                submitted: quickSubmitted,
              })}

              {/* Options */}
              <div className="space-y-2.5">
                {quickQ.options.map((option, idx) => {
                  const isZapped = !quickSubmitted && eliminatedOptions.includes(idx);
                  let optStyle = 'bg-white hover:bg-slate-100 border-slate-800 text-slate-900';
                  if (isZapped) {
                    optStyle = 'bg-slate-100 border-slate-300 text-slate-400 line-through opacity-55';
                  } else if (quickSelected === idx) {
                    optStyle = 'bg-amber-100 border-amber-600 text-amber-950 ring-2 ring-amber-400';
                  }
                  if (quickSubmitted) {
                    if (idx === quickQ.correctIndex) {
                      optStyle = 'bg-emerald-100 border-emerald-700 text-emerald-950 ring-3 ring-emerald-400';
                    } else if (quickSelected === idx) {
                      optStyle = 'bg-rose-100 border-rose-600 text-rose-950';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectQuickOption(idx)}
                      disabled={quickSubmitted || isZapped}
                      className={`w-full min-h-[52px] text-left p-3.5 sm:p-4 rounded-xl border-3 transition-all flex items-start gap-3 cursor-pointer ${optStyle}`}
                    >
                      <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-lg bg-slate-950 text-white text-xs sm:text-sm font-black font-mario">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className={`${bodyTextClass} font-bold leading-snug pt-0.5`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Instant Item Feedback */}
              {quickSubmitted && (
                <div
                  className={`p-4 rounded-2xl border-3 space-y-2 ${
                    quickSelected === quickQ.correctIndex
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                      : 'bg-rose-50 border-rose-600 text-rose-950'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-black text-sm font-mario">
                      {quickSelected === quickQ.correctIndex ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span>CORRECT!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          <span>NEEDS REVIEW</span>
                        </>
                      )}
                    </div>
                    {quickSelected !== quickQ.correctIndex && (
                      <SaveSingleQuizErrorButton
                        testId="quick-live-save-error-btn"
                        compact
                        errorItem={{
                          scenario: quickQ.scenario,
                          correctOptionText: quickQ.options[quickQ.correctIndex] || '',
                          chosenOptionText:
                            quickSelected !== null ? quickQ.options[quickSelected] || '' : '',
                          legalBasis: quickQ.legalBasis || 'Philippine Labor Code',
                          explanation: quickQ.explanation || '',
                          worldCode: quickQ.worldCode || activeWorldCode,
                          quizModeLabel: 'Quick Test',
                        }}
                      />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                    {quickQ.explanation}
                  </p>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between pt-3 border-t-2 border-slate-200 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    startFreshQuickTest(activeWorld, studyDifficulty);
                    marioAudio.playPipe();
                  }}
                  className="min-h-[44px] px-4 inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl border-2 border-black text-xs sm:text-sm cursor-pointer leading-none whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  <span>Redraw 5 Qs</span>
                </button>

                {!quickSubmitted ? (
                  <button
                    type="button"
                    data-testid="quick-submit-btn"
                    onClick={handleSubmitQuickAnswer}
                    disabled={quickSelected === null}
                    className="min-h-[44px] px-6 inline-flex items-center justify-center bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 text-sm cursor-pointer leading-none whitespace-nowrap flex-1 sm:flex-initial"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid="quick-next-btn"
                    onClick={handleNextQuickQuestion}
                    className="min-h-[44px] px-6 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl border-3 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 text-sm cursor-pointer leading-none whitespace-nowrap flex-1 sm:flex-initial"
                  >
                    <span>
                      {quickIdx < quickDeck.length - 1
                        ? 'Next Question'
                        : 'Finish & Claim Coins'}
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* INSTANT SCORE SUMMARY & ACCURACY COIN REWARD */
            <div
              data-testid="quick-test-summary"
              className="bg-white rounded-3xl mario-card border-4 border-slate-950 p-5 sm:p-8 space-y-6"
            >
              {renderMarioCourseOutcomeBanner({
                accuracyPercent: quickSummary.accuracyPercent,
                courseTitle: `${activeWorldTitle} Quick Sprint`,
              })}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-amber-400 border-4 border-black rounded-2xl mx-auto flex items-center justify-center shadow-[0_4px_0_#000]">
                  <MarioStarIcon className="w-9 h-9" />
                </div>
                <span className="text-xs font-black font-mario uppercase text-emerald-700 block">
                  INSTANT QUICK TEST SUMMARY · {activeWorldTitle}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 font-display">
                  {quickSummary.rankTitle}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-600 max-w-lg mx-auto">
                  {quickSummary.feedbackMessage}
                </p>
              </div>

              {/* 3-Metric Scoreboard (Score, Accuracy %, Coins Rewarded) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
                <div className="bg-slate-50 border-2 border-slate-900 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-black font-mario text-slate-500 uppercase block">
                    FINAL SCORE
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 font-display mt-1 block">
                    {quickSummary.correctCount} / {quickSummary.totalCount}
                  </span>
                </div>

                <div className="bg-emerald-50 border-2 border-emerald-700 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-black font-mario text-emerald-800 uppercase block">
                    ACCURACY RATE
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-display mt-1 block">
                    {quickSummary.accuracyPercent}%
                  </span>
                </div>

                <div className="bg-amber-50 border-2 border-amber-600 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-black font-mario text-amber-900 uppercase block">
                    ACCURACY BOUNTY
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-700 font-display mt-1 inline-flex items-center justify-center gap-1.5">
                    <MarioCoinIcon className="w-6 h-6 shrink-0" />
                    <span>+{quickRewardedCoins}c</span>
                  </span>
                </div>
              </div>

              {/* Race Against Your Ghost Run Comparison Card */}
              {latestGhostResult && (
                <div
                  data-testid="quiz-ghost-result-summary"
                  className="bg-slate-950 text-white rounded-2xl border-2 border-cyan-500 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mario uppercase text-cyan-300 block">
                        RACE AGAINST YOUR GHOST · PACE TELEMETRY
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-white font-display">
                        {latestGhostResult.isNewRecord
                          ? 'NEW GHOST RECORD SET!'
                          : `Ghost Benchmark: ${latestGhostResult.currentBest.bestAccuracyPercent}% in ${latestGhostResult.currentBest.bestTotalTimeSec}s`}
                      </h4>
                    </div>
                    <div className="text-xs font-mono tabular-nums text-right">
                      <div className="text-amber-300 font-black">
                        Your Run: {quickSummary.accuracyPercent}% ({quickElapsedSeconds}s)
                      </div>
                      {latestGhostResult.previousBest && (
                        <div className="text-cyan-300">
                          Prev Ghost: {latestGhostResult.previousBest.bestAccuracyPercent}% (
                          {latestGhostResult.previousBest.bestTotalTimeSec}s)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Checkpoint Split Path Comparison */}
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {latestGhostResult.currentBest.checkpoints.slice(0, 5).map((cp) => (
                      <div
                        key={cp.questionIndex}
                        className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-center font-mono tabular-nums"
                      >
                        <div className="text-[10px] text-slate-400">Q{cp.questionIndex}</div>
                        <div className="text-xs font-black text-cyan-300">
                          {cp.accuracyPercent}%
                        </div>
                        <div className="text-[10px] text-amber-300">{cp.elapsedSec}s</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visual Result Summary Breakdown Chart */}
              <QuizResultSummaryChart
                records={quickRecords.map((r) => ({
                   worldCode: r.question.worldCode || activeWorldCode,
                   isCorrect: r.isCorrect,
                 }))}
               />

               <QuizAnalyticsPanel
                 records={quickRecords.map((r) => ({
                   worldCode: r.question.worldCode || activeWorldCode,
                   isCorrect: r.isCorrect,
                 }))}
                 missedQuestions={quickRecords
                   .filter((r) => !r.isCorrect)
                   .map((r) => ({
                     scenario: r.question.scenario,
                     correctOptionText: r.question.options[r.question.correctIndex] || '',
                     chosenOptionText: r.question.options[r.chosenIndex] || '',
                     legalBasis: r.question.legalBasis || 'Philippine Labor Code',
                     explanation: r.question.explanation || '',
                     worldCode: r.question.worldCode || activeWorldCode,
                     quizModeLabel: 'Quick Test',
                   }))}
                 quizHistory={quizHistory}
                 currentRunCorrect={quickRecords.filter((r) => r.isCorrect).length}
               />

              {/* Per-Question Breakdown */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase font-mario text-slate-700">
                  5-QUESTION REVIEW BREAKDOWN
                </h4>
                <div className="space-y-2">
                  {quickRecords.map((rec, i) => (
                    <div
                      key={`${rec.question.id}-${i}`}
                      className={`p-3.5 rounded-2xl border-2 text-xs sm:text-sm space-y-2 ${
                        rec.isCorrect
                          ? 'bg-emerald-50/70 border-emerald-400'
                          : 'bg-rose-50/70 border-rose-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 font-black text-slate-950">
                        <span className="leading-snug">
                          Q{i + 1}. {rec.question.scenario}
                        </span>
                        <span
                          className={`shrink-0 font-mario text-[10px] px-2 py-0.5 rounded border ${
                            rec.isCorrect
                              ? 'bg-emerald-200 text-emerald-950 border-emerald-700'
                              : 'bg-rose-200 text-rose-950 border-rose-700'
                          }`}
                        >
                          {rec.isCorrect ? 'PASS' : 'MISS'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-700">
                          Correct Rule: {rec.question.options[rec.question.correctIndex]}
                        </p>
                        {!rec.isCorrect && (
                          <SaveSingleQuizErrorButton
                            testId={`quick-review-save-error-${i}`}
                            compact
                            errorItem={{
                              scenario: rec.question.scenario,
                              correctOptionText: rec.question.options[rec.question.correctIndex] || '',
                              chosenOptionText: rec.question.options[rec.chosenIndex] || '',
                              legalBasis: rec.question.legalBasis || 'Philippine Labor Code',
                              explanation: rec.question.explanation || '',
                              worldCode: rec.question.worldCode || activeWorldCode,
                              quizModeLabel: 'Quick Test',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiz Results Leaderboard (Top 5 Fastest Finishers) */}
              <QuizResultsLeaderboard
                categoryKey={`quick_${activeWorldCode}`}
                categoryTitle={activeWorldTitle}
                currentUserScore={{
                  correct: quickRecords.filter((r) => r.isCorrect).length,
                  total: quickDeck.length,
                  timeSeconds: quickElapsedSeconds,
                }}
              />

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
                <button
                  type="button"
                  data-testid="retake-quick-test-btn"
                  onClick={() => {
                    startFreshQuickTest(activeWorld, studyDifficulty);
                    marioAudio.playPowerUp();
                  }}
                  className="min-h-[48px] w-full sm:w-auto max-w-full px-4 sm:px-7 py-2.5 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-base rounded-2xl border-3 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 cursor-pointer leading-snug text-center"
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="min-w-0 break-words">Take Another 5-Question Quick Test</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODE 0.5: FLASHBACK QUIZ (TARGETED WEAK AREAS REINFORCEMENT) ==================== */}
      {activeMode === 'flashback' && (
        <div className="space-y-5">
          {/* Targeted Weakness Drill Banner */}
          <div className="bg-gradient-to-r from-rose-900 via-red-950 to-slate-900 text-white rounded-3xl p-4 sm:p-6 mario-card border-4 border-slate-950 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 text-slate-950 font-black rounded-lg border border-black text-[10px] uppercase font-mario leading-snug">
                  <Target className="w-3.5 h-3.5 shrink-0" />
                  <span>TARGETED WEAKNESS DRILL</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white font-display">
                  TARGETED WEAKNESS DRILL
                </h2>
                <p className="text-xs sm:text-sm text-rose-100 font-semibold max-w-2xl">
                  {flashbackLabel}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  startFreshFlashback();
                  marioAudio.playPowerUp();
                }}
                className="min-h-[42px] px-4 inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black shadow-[0_2px_0_#000] text-xs cursor-pointer whitespace-nowrap shrink-0 w-full sm:w-auto"
              >
                <Shuffle className="w-3.5 h-3.5 shrink-0" />
                <span>New Weakness Drill</span>
              </button>
            </div>
          </div>

          {!flashbackComplete && flashbackQ ? (
            <div className="bg-white rounded-3xl mario-card border-4 border-slate-950 p-4 sm:p-7 space-y-5">
              {renderMarioStageProgressBar({
                currentStep: flashbackIdx + 1,
                totalSteps: flashbackDeck.length,
                stageTitle: flashbackQ.world,
                rightLabel: 'Weakness Drill',
              })}

              {/* Scenario Prompt */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border-2 border-slate-900 space-y-2">
                <span className="text-[10px] font-black uppercase text-rose-700 font-mario tracking-wider block">
                  BAR EXAM HYPOTHETICAL CASE:
                </span>
                <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-relaxed">
                  {flashbackQ.scenario}
                </p>
                {flashbackQ.hint && (
                  <p className="text-xs text-amber-800 bg-amber-100/80 px-2.5 py-1.5 rounded-lg border border-amber-300 font-semibold inline-flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>{flashbackQ.hint}</span>
                  </p>
                )}
              </div>

              {/* Multiple-Choice Options */}
              <div className="space-y-2.5">
                {flashbackQ.options.map((opt, oIdx) => {
                  const isSelected = flashbackSelected === oIdx;
                  const isCorrectAnswer = oIdx === flashbackQ.correctIndex;

                  let optClass = 'bg-white hover:bg-slate-100 text-slate-900 border-slate-900';
                  if (flashbackSubmitted) {
                    if (isCorrectAnswer) {
                      optClass = 'bg-emerald-100 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500';
                    } else if (isSelected && !isCorrectAnswer) {
                      optClass = 'bg-red-100 border-red-600 text-red-950 ring-2 ring-red-500';
                    } else {
                      optClass = 'bg-slate-100 border-slate-300 text-slate-400 opacity-60';
                    }
                  } else if (isSelected) {
                    optClass = 'bg-amber-100 border-amber-500 text-slate-950 ring-2 ring-amber-400';
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={flashbackSubmitted}
                      onClick={() => handleSelectFlashbackOption(oIdx)}
                      className={`min-h-[50px] w-full text-left p-3.5 rounded-2xl border-3 font-semibold text-xs sm:text-sm flex items-start gap-3 transition-all cursor-pointer ${optClass}`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-950 text-amber-400 font-black font-mario text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1 min-w-0 leading-relaxed font-bold break-words">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Instant Doctrinal Feedback */}
              {flashbackSubmitted && (
                <div
                  className={`p-4 sm:p-5 rounded-2xl border-3 space-y-2 animate-in fade-in duration-150 ${
                    flashbackSelected === flashbackQ.correctIndex
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                      : 'bg-rose-50 border-rose-600 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-sm font-display">
                    {flashbackSelected === flashbackQ.correctIndex ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>WEAKNESS OVERCOME! PERFECT RULING!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>INCORRECT ANSWER — REVIEW STATUTORY BASIS</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                    {flashbackQ.explanation}
                  </p>
                  <div className="pt-2 border-t border-black/10 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-600">
                    <span>Statutory Reference: {flashbackQ.legalBasis}</span>
                    {flashbackSelected !== flashbackQ.correctIndex && (
                      <SaveSingleQuizErrorButton
                        testId="flashback-live-save-error-btn"
                        compact
                        errorItem={{
                          scenario: flashbackQ.scenario,
                          correctOptionText: flashbackQ.options[flashbackQ.correctIndex] || '',
                          chosenOptionText:
                            flashbackSelected !== null ? flashbackQ.options[flashbackSelected] || '' : '',
                          legalBasis: flashbackQ.legalBasis || 'Philippine Labor Code',
                          explanation: flashbackQ.explanation || '',
                          worldCode: flashbackQ.worldCode || 'w1',
                          quizModeLabel: 'Weakness Drill',
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons: Submit / Next */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs font-mono font-bold text-slate-500">
                  Question {flashbackIdx + 1} of {flashbackDeck.length}
                </span>

                {!flashbackSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitFlashbackAnswer}
                    disabled={flashbackSelected === null}
                    className="min-h-[44px] px-6 inline-flex items-center justify-center bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 text-sm cursor-pointer leading-none whitespace-nowrap flex-1 sm:flex-initial"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid="flashback-next-btn"
                    onClick={handleNextFlashbackQuestion}
                    className="min-h-[44px] px-6 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl border-3 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 text-sm cursor-pointer leading-none whitespace-nowrap flex-1 sm:flex-initial"
                  >
                    <span>
                      {flashbackIdx < flashbackDeck.length - 1
                        ? 'Next Question'
                        : 'Finish & Claim Bonus Coins'}
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* FLASHBACK SCORE SUMMARY & ACCURACY COIN REWARD */
            <div
              data-testid="flashback-test-summary"
              className="bg-white rounded-3xl mario-card border-4 border-slate-950 p-5 sm:p-8 space-y-6"
            >
              {renderMarioCourseOutcomeBanner({
                accuracyPercent: flashbackSummary.accuracyPercent,
                courseTitle: 'Weakness Drill Stage',
              })}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-rose-500 border-4 border-black rounded-2xl mx-auto flex items-center justify-center shadow-[0_4px_0_#000] text-white">
                  <RotateCcw className="w-9 h-9" />
                </div>
                <span className="text-xs font-black font-mario uppercase text-rose-700 block">
                  FLASHBACK WEAK AREA SUMMARY
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 font-display">
                  {flashbackSummary.rankTitle}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-600 max-w-lg mx-auto">
                  {flashbackSummary.feedbackMessage}
                </p>
              </div>

              {/* 3-Metric Scoreboard */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
                <div className="bg-slate-50 border-2 border-slate-900 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-black font-mario text-slate-500 uppercase block">
                    FLASHBACK SCORE
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 font-display mt-1 block">
                    {flashbackSummary.correctCount} / {flashbackSummary.totalCount}
                  </span>
                </div>

                <div className="bg-emerald-50 border-2 border-emerald-700 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-black font-mario text-emerald-800 uppercase block">
                    ACCURACY RATE
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-display mt-1 block">
                    {flashbackSummary.accuracyPercent}%
                  </span>
                </div>

                <div className="bg-amber-50 border-2 border-amber-600 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-black font-mario text-amber-900 uppercase block">
                    REINFORCEMENT BOUNTY
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-700 font-display mt-1 inline-flex items-center justify-center gap-1.5">
                    <MarioCoinIcon className="w-6 h-6 shrink-0" />
                    <span>+{flashbackRewardedCoins}c</span>
                  </span>
                </div>
              </div>

              {/* Visual Result Summary Breakdown Chart */}
              <QuizResultSummaryChart
                records={flashbackRecords.map((r) => ({
                  worldCode: r.question.worldCode || 'w1',
                  isCorrect: r.isCorrect,
                }))}
              />

              <QuizAnalyticsPanel
                records={flashbackRecords.map((r) => ({
                  worldCode: r.question.worldCode || 'w1',
                  isCorrect: r.isCorrect,
                }))}
                missedQuestions={flashbackRecords
                  .filter((r) => !r.isCorrect)
                  .map((r) => ({
                    scenario: r.question.scenario,
                    correctOptionText: r.question.options[r.question.correctIndex] || '',
                    chosenOptionText: r.question.options[r.chosenIndex] || '',
                    legalBasis: r.question.legalBasis || 'Philippine Labor Code',
                    explanation: r.question.explanation || '',
                    worldCode: r.question.worldCode || 'w1',
                    quizModeLabel: 'Weakness Drill',
                  }))}
                quizHistory={quizHistory}
                currentRunCorrect={flashbackRecords.filter((r) => r.isCorrect).length}
              />

              {/* Detailed Breakdown */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-black uppercase font-mario text-slate-800">
                  QUESTION REVIEW:
                </h4>
                <div className="space-y-2">
                  {flashbackRecords.map((rec, rIdx) => (
                    <div
                      key={rIdx}
                      className={`p-3.5 rounded-2xl border-2 text-xs space-y-2 ${
                        rec.isCorrect
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                          : 'bg-rose-50 border-rose-400 text-rose-950'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="font-mario text-[10px]">Q{rIdx + 1}: {rec.question.world}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            rec.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}
                        >
                          {rec.isCorrect ? 'PASS' : 'MISS'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-700">
                          Correct Rule: {rec.question.options[rec.question.correctIndex]}
                        </p>
                        {!rec.isCorrect && (
                          <SaveSingleQuizErrorButton
                            testId={`flashback-review-save-error-${rIdx}`}
                            compact
                            errorItem={{
                              scenario: rec.question.scenario,
                              correctOptionText: rec.question.options[rec.question.correctIndex] || '',
                              chosenOptionText: rec.question.options[rec.chosenIndex] || '',
                              legalBasis: rec.question.legalBasis || 'Philippine Labor Code',
                              explanation: rec.question.explanation || '',
                              worldCode: rec.question.worldCode || 'w1',
                              quizModeLabel: 'Weakness Drill',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiz Results Leaderboard */}
              <QuizResultsLeaderboard
                categoryKey="flashback_weak_areas"
                categoryTitle="Flashback Weak Areas"
                currentUserScore={{
                  correct: flashbackRecords.filter((r) => r.isCorrect).length,
                  total: flashbackDeck.length,
                  timeSeconds: flashbackElapsedSeconds,
                }}
              />

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
                <button
                  type="button"
                  onClick={() => {
                    startFreshFlashback();
                    marioAudio.playPowerUp();
                  }}
                  className="min-h-[48px] w-full sm:w-auto max-w-full px-4 sm:px-7 py-2.5 inline-flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs sm:text-base rounded-2xl border-3 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 cursor-pointer leading-snug text-center"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="min-w-0 break-words">Run Another Flashback Sprint</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODE 1: PRACTICE ARENA ==================== */}
      {activeMode === 'practice' && (
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-950 text-white rounded-3xl p-5 sm:p-7 mario-card border-4 border-slate-950">
            <div className="flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-slate-950 font-black rounded-lg border border-black text-xs uppercase leading-none">
                  <Mario1UpIcon className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span>
                    {studyDifficulty === 'casual'
                      ? 'CASUAL DEFINITIONS ARENA'
                      : 'EXAM PREP BAR ARENA'}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white font-display">
                  LABOR LAW DOCTRINE GAUNTLET
                </h2>
                <p className="text-xs sm:text-sm text-purple-100 font-bold max-w-xl">
                  {studyDifficulty === 'casual'
                    ? 'Casual Mode active: concise definition & threshold questions with 3 clear choices and statutory hints across all 6 Worlds & Holidays.'
                    : 'Exam Prep Mode active: full 4-option Bar Exam hypothetical fact patterns across all 6 Worlds & Holidays.'}
                </p>
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-400 border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0_#000] shrink-0">
                <Trophy className="w-8 h-8 text-slate-950" />
              </div>
            </div>
          </div>

          {/* World Filter & Deck Length Bar */}
          <div className="bg-white rounded-2xl border-4 border-slate-950 p-3.5 shadow-[4px_4px_0_#000] flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-black uppercase text-slate-700 inline-flex items-center gap-1 font-mario mr-1">
                  <Filter className="w-3.5 h-3.5" /> Topic:
                </span>
                {(
                  [
                    { id: 'all', label: `All (${fullPracticePoolForDifficulty.length})` },
                    { id: 'w1', label: 'W1' },
                    { id: 'w2', label: 'W2' },
                    { id: 'holidays', label: 'Holidays' },
                    { id: 'w3', label: 'W3' },
                    { id: 'w4', label: 'W4' },
                    { id: 'w5', label: 'W5' },
                    { id: 'w6', label: 'W6' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    data-testid={`practice-topic-${tab.id}`}
                    onClick={() => {
                      resetPracticeRun(tab.id, 999, false);
                      marioAudio.playJump();
                    }}
                    className={`min-h-[44px] min-w-[44px] px-3 inline-flex items-center justify-center rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer leading-none whitespace-nowrap tabular-nums ${
                      worldFilter === tab.id
                        ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {([15, 30, 999] as const).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => {
                      resetPracticeRun(worldFilter, len, false);
                      marioAudio.playPipe();
                    }}
                    className={`min-h-[44px] px-3 inline-flex items-center justify-center rounded-xl text-xs font-black border-2 border-black cursor-pointer leading-none whitespace-nowrap ${
                      runLimit === len
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {len === 999 ? 'Full Deck' : `${len} Qs`}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    resetPracticeRun(worldFilter, runLimit, true);
                    marioAudio.playPowerUp();
                  }}
                  className="min-h-[44px] px-3.5 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs border-2 border-black shadow-[0_2px_0_#000] cursor-pointer leading-none whitespace-nowrap"
                >
                  <Shuffle className="w-3.5 h-3.5 shrink-0" />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>
          </div>

          {!isQuizComplete && q ? (
            <div
              className={`bg-white rounded-3xl mario-card border-4 border-slate-950 p-4 sm:p-7 space-y-5 transition-shadow ${
                wrongShakeNonce > 0 ? 'mario-wrong-shake ring-4 ring-rose-500' : ''
              }`}
            >
              {renderMarioStageProgressBar({
                currentStep: currentIdx + 1,
                totalSteps: activePracticePool.length,
                stageTitle: q.world,
                rightLabel: `Score: ${score}/${currentIdx + (isAnswerSubmitted ? 1 : 0)}`,
                lives: practiceLives,
                maxLives: initialPracticeLives,
              })}

              {oneUpRecoveryBanner && (
                <div className="p-3.5 rounded-2xl bg-emerald-100 border-3 border-emerald-700 text-emerald-950 font-black text-xs sm:text-sm flex items-center gap-2.5">
                  <Mario1UpIcon className="w-6 h-6 shrink-0" />
                  <span>{oneUpRecoveryBanner}</span>
                </div>
              )}

              {/* 1-Up [?] Block Finder Recovery Mini-Game when Lives hit 0 */}
              {oneUpBlocks && (
                <div
                  data-testid="oneup-recovery-minigame"
                  className="rounded-3xl bg-slate-950 text-white p-5 border-4 border-amber-400 shadow-[0_4px_0_#000] space-y-4 text-center"
                >
                  <div className="space-y-1">
                    <span className="font-mario text-[10px] text-amber-300 uppercase block">
                      0 LIVES REMAINING · EMERGENCY TOAD HOUSE BONUS!
                    </span>
                    <h4 className="text-lg sm:text-xl font-black font-display text-white">
                      Strike a Mystery [?] Block to Find the Hidden 1-Up Mushroom!
                    </h4>
                    <p className="text-xs text-slate-300 font-semibold">
                      Hit the lucky block containing the Green 1-Up Mushroom to restore +1 Life and save your run!
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                    {oneUpBlocks.map((blk) => {
                      const revealed = oneUpPickedIdx !== null;
                      const isChosen = oneUpPickedIdx === blk.index;
                      return (
                        <button
                          key={blk.index}
                          type="button"
                          data-testid={`oneup-block-${blk.index}`}
                          disabled={revealed}
                          onClick={() => handlePickOneUpBlock(blk)}
                          className={`min-h-[84px] rounded-2xl border-3 border-black flex flex-col items-center justify-center gap-1.5 p-3 font-black cursor-pointer transition-transform active:translate-y-0.5 ${
                            !revealed
                              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_4px_0_#000]'
                              : blk.hasOneUp
                              ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-200'
                              : isChosen
                              ? 'bg-rose-700 text-white'
                              : 'bg-slate-800 text-slate-400 opacity-65'
                          }`}
                        >
                          {!revealed ? (
                            <>
                              <MarioQuestionBlockIcon className="w-9 h-9" />
                              <span className="font-mario text-[9px]">HIT #{blk.index + 1}</span>
                            </>
                          ) : blk.hasOneUp ? (
                            <>
                              <Mario1UpIcon className="w-9 h-9" />
                              <span className="font-mario text-[9px]">+1 UP!</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-7 h-7" />
                              <span className="font-mario text-[9px]">EMPTY</span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {practiceGameOver && (
                <div
                  data-testid="practice-lives-gameover"
                  className="rounded-3xl bg-gradient-to-b from-red-950 to-slate-950 text-white p-6 border-4 border-red-600 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-red-800 border-3 border-black mx-auto flex items-center justify-center">
                    <MarioBowserIcon className="w-10 h-10" />
                  </div>
                  <span className="font-mario text-xs text-amber-300 block">GAME OVER · OUT OF MARIO LIVES</span>
                  <h4 className="text-2xl font-black font-display">
                    You Reached Stage {currentIdx + 1} with Score {score}
                  </h4>
                  <button
                    type="button"
                    onClick={() => resetPracticeRun(worldFilter, runLimit, true)}
                    className="min-h-[46px] px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Continue with 3 Fresh Mario Lives</span>
                  </button>
                </div>
              )}

              <div className="bg-slate-50 border-3 border-slate-800 rounded-2xl p-4 sm:p-6 space-y-2">
                <span className="text-xs font-black uppercase text-amber-700 tracking-wider font-mario block">
                  {studyDifficulty === 'casual'
                    ? `DEFINITION PROMPT #${currentIdx + 1}:`
                    : `FACT PATTERN / SCENARIO #${q.id}:`}
                </span>
                <p className={`${bodyTextClass} font-extrabold text-slate-950 leading-relaxed`}>
                  &ldquo;{q.scenario}&rdquo;
                </p>
                {studyDifficulty === 'casual' && q.hint && (
                  <div className="pt-2 border-t border-slate-200 flex items-start gap-2 text-xs font-bold text-amber-900">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Hint: {q.hint}</span>
                  </div>
                )}
              </div>

              {renderQuizCoinLifelineBar({
                optionsCount: q.options.length,
                correctIndex: q.correctIndex,
                legalBasis: q.legalBasis,
                hint: q.hint,
                explanation: q.explanation,
                submitted: isAnswerSubmitted,
              })}

              <div className="space-y-2.5">
                {q.options.map((option, idx) => {
                  const isZapped = !isAnswerSubmitted && eliminatedOptions.includes(idx);
                  let optStyle = 'bg-white hover:bg-slate-100 border-slate-800 text-slate-900';
                  if (isZapped) {
                    optStyle = 'bg-slate-100 border-slate-300 text-slate-400 line-through opacity-55';
                  } else if (selectedAnswer === idx) {
                    optStyle = 'bg-amber-100 border-amber-600 text-amber-950 ring-2 ring-amber-400';
                  }
                  if (isAnswerSubmitted) {
                    if (idx === q.correctIndex) {
                      optStyle = 'bg-emerald-100 border-emerald-700 text-emerald-950 ring-4 ring-emerald-400';
                    } else if (selectedAnswer === idx) {
                      optStyle = 'bg-rose-100 border-rose-600 text-rose-950';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted || isZapped}
                      className={`w-full min-h-[52px] text-left p-3.5 sm:p-4 rounded-xl border-3 transition-all flex items-start gap-3 cursor-pointer ${optStyle}`}
                    >
                      <span className="inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-slate-950 text-white text-sm font-black font-mario">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className={`${bodyTextClass} font-bold leading-normal pt-0.5`}>{option}</span>
                    </button>
                  );
                })}
              </div>

              {isAnswerSubmitted && (
                <div
                  className={`p-4 sm:p-5 rounded-2xl border-3 space-y-2 ${
                    selectedAnswer === q.correctIndex
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                      : 'bg-rose-50 border-rose-600 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-base">
                    {selectedAnswer === q.correctIndex ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                        <span className="font-mario text-xs sm:text-sm">
                          CORRECT! +{studyDifficulty === 'exam_prep' ? 6 : 4} COINS EARNED!
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                        <span className="font-mario text-xs sm:text-sm">INCORRECT</span>
                      </>
                    )}
                  </div>
                  <p className={`${bodyTextClass} font-medium`}>{q.explanation}</p>
                  <div className="pt-2 border-t border-black/20 flex flex-wrap items-center justify-between gap-2 text-xs font-black uppercase text-slate-700">
                    <span>Legal Basis: {q.legalBasis}</span>
                    {selectedAnswer !== q.correctIndex && (
                      <SaveSingleQuizErrorButton
                        testId="practice-live-save-error-btn"
                        compact
                        errorItem={{
                          scenario: q.scenario,
                          correctOptionText: q.options[q.correctIndex] || '',
                          chosenOptionText:
                            selectedAnswer !== null ? q.options[selectedAnswer] || '' : '',
                          legalBasis: q.legalBasis || 'Philippine Labor Code',
                          explanation: q.explanation || '',
                          worldCode: q.worldCode || 'w1',
                          quizModeLabel: 'Practice Arena',
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between pt-4 border-t-2 border-slate-200 gap-3">
                <button
                  type="button"
                  onClick={() => resetPracticeRun(worldFilter, runLimit, false)}
                  className="min-h-[44px] px-4 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl border-2 border-black text-xs sm:text-sm cursor-pointer leading-none whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  <span>Restart Set</span>
                </button>

                {!isAnswerSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="min-h-[44px] px-6 inline-flex items-center justify-center bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 text-sm sm:text-base cursor-pointer leading-none whitespace-nowrap flex-1 sm:flex-initial"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="min-h-[44px] px-6 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl border-3 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 text-sm sm:text-base cursor-pointer leading-none whitespace-nowrap flex-1 sm:flex-initial"
                  >
                    <span>
                      {currentIdx < activePracticePool.length - 1
                        ? 'Next Question'
                        : 'View Final Results'}
                    </span>
                    <ArrowRight className="w-5 h-5 shrink-0" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl mario-card border-4 border-slate-950 p-6 sm:p-10 text-center space-y-6">
              {renderMarioCourseOutcomeBanner({
                accuracyPercent: Math.round((score / Math.max(1, activePracticePool.length)) * 100),
                courseTitle: 'Practice Doctrine Arena',
              })}
              <div className="w-20 h-20 bg-amber-400 border-4 border-black rounded-full mx-auto flex items-center justify-center shadow-[0_4px_0_#000]">
                <MarioFlagIcon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 font-display">
                COURSE CLEARED!
              </h3>
              <p className={`${bodyTextClass} text-slate-700 font-extrabold max-w-md mx-auto`}>
                You scored <span className="text-red-600 text-3xl font-black">{score}</span> out of{' '}
                {activePracticePool.length}!
              </p>

              <div className="bg-amber-50 border-3 border-amber-400 rounded-2xl p-5 max-w-md mx-auto">
                {score >= Math.ceil(activePracticePool.length * 0.8) ? (
                  <div className="space-y-1">
                    <span className="flex items-center justify-center gap-2 text-lg sm:text-xl font-black text-amber-600 font-mario">
                      <MarioStarIcon className="w-6 h-6" /> SUPER STAR RANK!
                    </span>
                    <p className="font-extrabold text-emerald-800 text-sm">
                      Outstanding mastery of Philippine Labor Standards and Protective Laws!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="flex items-center justify-center gap-2 text-lg sm:text-xl font-black text-red-600 font-mario">
                      <MarioMushroomIcon className="w-6 h-6" /> SOLID FOUNDATION!
                    </span>
                    <p className="font-extrabold text-amber-800 text-sm">
                      Review the Modules or Flashcards to master every statutory exception.
                    </p>
                  </div>
                )}
              </div>

              <QuizResultSummaryChart records={practiceRecords} />

              <div className="text-left">
                <QuizAnalyticsPanel
                  records={practiceRecords}
                  missedQuestions={practiceMissedDetails}
                  quizHistory={quizHistory}
                  currentRunCorrect={score}
                />
              </div>

              <div className="pt-2 text-left">
                <QuizResultsLeaderboard
                  categoryKey={`practice_${worldFilter}`}
                  categoryTitle={worldFilter === 'all' ? 'All Worlds Arena' : `World ${worldFilter} Arena`}
                  currentUserScore={{
                    correct: score,
                    total: activePracticePool.length,
                    timeSeconds: 65,
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => resetPracticeRun(worldFilter, runLimit, true)}
                className="min-h-[48px] w-full sm:w-auto max-w-full px-4 sm:px-7 py-2.5 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-base rounded-2xl border-3 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 cursor-pointer leading-snug text-center"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="min-w-0 break-words">Retake Shuffled Arena</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODE 2: BOWSER BOSS BATTLE ==================== */}
      {activeMode === 'boss' && (
        <div className="space-y-6">
          {bossBattleState === 'intro' && (
            <div className="bg-gradient-to-b from-[#450a0a] via-[#1c1917] to-[#0c0a09] text-white rounded-3xl p-5 sm:p-8 border-4 border-slate-950 shadow-[6px_6px_0_#000] text-center space-y-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-950 border-4 border-red-600 rounded-3xl mx-auto flex items-center justify-center shadow-[0_4px_0_#000]">
                <MarioBowserIcon className="w-14 h-14 sm:w-16 sm:h-16" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider font-mario">
                  WORLD 8-4 • 30-SCENARIO BOSS POOL
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white font-display">
                  BOWSER&apos;S LAVA KEEP GAUNTLET
                </h2>
                <p className={`${bodyTextClass} text-slate-300 max-w-xl mx-auto font-medium text-sm`}>
                  Face randomized rapid-fire Bar Exam traps! ({studyDifficulty === 'casual' ? 'Casual: 3 options + statutory hints' : 'Exam Prep: 4 options, no hints'}).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStartBossBattle('standard')}
                  className="min-h-[48px] px-5 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-base rounded-2xl border-3 border-black shadow-[0_4px_0_#000] cursor-pointer leading-none whitespace-nowrap"
                >
                  <Flame className="w-5 h-5 text-amber-300 shrink-0" />
                  <span>STANDARD BOWSER (100 HP)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartBossBattle('mega')}
                  className="min-h-[48px] px-5 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-base rounded-2xl border-3 border-black shadow-[0_4px_0_#000] cursor-pointer leading-none whitespace-nowrap"
                >
                  <MarioStarIcon className="w-5 h-5 shrink-0" />
                  <span>MEGA BOWSER (200 HP • +200c)</span>
                </button>

                {bossSkipTokens > 0 && (
                  <button
                    type="button"
                    data-testid="use-boss-skip-token-btn"
                    onClick={handleSkipBossWithToken}
                    className="min-h-[48px] px-5 inline-flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-base rounded-2xl border-3 border-black shadow-[0_4px_0_#000] cursor-pointer leading-none whitespace-nowrap"
                  >
                    <Shield className="w-5 h-5 shrink-0" />
                    <span>ROYAL WRIT SKIP ({bossSkipTokens} LEFT)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {bossBattleState === 'combat' && bossQ && (
            <div
              className={`bg-gradient-to-b from-[#2a0808] to-[#0f172a] rounded-3xl p-4 sm:p-8 border-4 border-slate-950 shadow-[6px_6px_0_#000] text-white space-y-5 transition-shadow ${
                wrongShakeNonce > 0 ? 'mario-wrong-shake ring-4 ring-rose-500' : ''
              }`}
            >
              <div className="bg-black/80 rounded-2xl p-3.5 sm:p-4 border-2 border-red-700/80 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                    <MarioBowserIcon className="w-9 h-9 shrink-0" />
                    <div className="flex-1 max-w-md">
                      <div className="flex justify-between text-xs font-black font-mario mb-1 tabular-nums">
                        <span className="text-red-400">{bossTier === 'mega' ? 'MEGA BOWSER' : 'BOWSER'} HP</span>
                        <span className="text-amber-400">
                          {bossHp}/{bossMaxHp}
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-4 rounded-full border border-black overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 h-full transition-all duration-300"
                          style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div
                      className={`h-9 px-3 inline-flex items-center gap-1.5 rounded-xl border-2 font-mario text-xs tabular-nums ${
                        timeLeft <= 8
                          ? 'bg-red-600 text-white border-white animate-bounce'
                          : 'bg-slate-900 border-slate-700 text-amber-400'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{timeLeft}s</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: bossTier === 'mega' ? 4 : 3 }).map((_, idx) => (
                        <Heart
                          key={idx}
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${
                            idx + 1 <= playerHearts ? 'text-red-500 fill-red-500' : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {comboStreak > 1 && (
                  <div className="flex items-center gap-1.5 text-xs font-black font-mario text-amber-300">
                    <MarioFireballIcon className="w-4 h-4 shrink-0" />
                    <span>{comboStreak}x COMBO STREAK!</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-900/90 border-3 border-red-900 rounded-2xl p-4 sm:p-6 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black font-mario text-red-400">
                  <span>ROUND {bossIdx + 1}</span>
                  <span className="text-slate-400">{bossQ.world}</span>
                </div>
                <p className={`${bodyTextClass} font-bold text-white leading-relaxed`}>
                  &ldquo;{bossQ.scenario}&rdquo;
                </p>
                {studyDifficulty === 'casual' && bossQ.hint && (
                  <p className="text-xs font-semibold text-amber-300 pt-1">
                    {bossQ.hint}
                  </p>
                )}
              </div>

              {renderQuizCoinLifelineBar({
                optionsCount: bossQ.options.length,
                correctIndex: bossQ.correctIndex,
                legalBasis: bossQ.legalBasis,
                hint: bossQ.hint,
                explanation: bossQ.explanation,
                submitted: bossAnswerSubmitted,
                isBoss: true,
              })}

              <div className="space-y-2.5">
                {bossQ.options.map((opt, idx) => {
                  const isZapped = !bossAnswerSubmitted && eliminatedOptions.includes(idx);
                  let optStyle = 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-100';
                  if (isZapped) {
                    optStyle = 'bg-slate-950/60 border-slate-800 text-slate-600 line-through opacity-50';
                  } else if (bossSelectedAnswer === idx) {
                    optStyle = 'bg-amber-400/20 border-amber-400 text-white ring-2 ring-amber-400';
                  }
                  if (bossAnswerSubmitted) {
                    if (idx === bossQ.correctIndex) {
                      optStyle = 'bg-emerald-900/80 border-emerald-500 text-emerald-100 ring-2 ring-emerald-400';
                    } else if (bossSelectedAnswer === idx) {
                      optStyle = 'bg-red-950/80 border-red-600 text-red-200';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectBossOption(idx)}
                      disabled={bossAnswerSubmitted || isZapped}
                      className={`w-full min-h-[50px] text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer ${optStyle}`}
                    >
                      <span className="inline-flex items-center justify-center w-7 h-7 shrink-0 rounded-lg bg-black text-amber-400 text-xs font-black font-mario">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className={`${bodyTextClass} font-semibold leading-normal`}>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {bossAnswerSubmitted && (
                <div
                  className={`p-4 rounded-xl border-2 space-y-1.5 ${
                    bossSelectedAnswer === bossQ.correctIndex
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                      : 'bg-red-950/80 border-red-600 text-red-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-black text-xs sm:text-sm font-mario">
                      {bossSelectedAnswer === bossQ.correctIndex ? (
                        <>
                          <MarioFireballIcon className="w-5 h-5 shrink-0" />
                          <span>DIRECT HIT! -20 HP!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                          <span>LOST 1 HEART!</span>
                        </>
                      )}
                    </div>
                    {bossSelectedAnswer !== bossQ.correctIndex && (
                      <SaveSingleQuizErrorButton
                        testId="boss-live-save-error-btn"
                        compact
                        darkSurface
                        errorItem={{
                          scenario: bossQ.scenario,
                          correctOptionText: bossQ.options[bossQ.correctIndex] || '',
                          chosenOptionText:
                            bossSelectedAnswer !== null
                              ? bossQ.options[bossSelectedAnswer] || 'Timed Out'
                              : 'Timed Out',
                          legalBasis: bossQ.legalBasis || 'Philippine Labor Code',
                          explanation: bossQ.explanation || '',
                          worldCode: bossQ.worldCode || 'boss',
                          quizModeLabel: 'Bowser Boss',
                        }}
                      />
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-300">
                    {bossQ.explanation} ({bossQ.legalBasis})
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                {!bossAnswerSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitBossAnswer}
                    disabled={bossSelectedAnswer === null}
                    className="min-h-[46px] w-full sm:w-auto px-7 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black rounded-xl border-2 border-black shadow-[0_3px_0_#000] cursor-pointer leading-none whitespace-nowrap"
                  >
                    <MarioFireballIcon className="w-5 h-5 shrink-0" />
                    <span>LAUNCH FIREBALL</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextBossQuestion}
                    className="min-h-[46px] w-full sm:w-auto px-7 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black shadow-[0_3px_0_#000] cursor-pointer leading-none whitespace-nowrap"
                  >
                    <span>NEXT ROUND</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                )}
              </div>
            </div>
          )}

          {bossBattleState === 'victory' && (
            <div className="relative overflow-hidden bg-gradient-to-b from-amber-950 via-slate-900 to-black text-white rounded-3xl p-6 sm:p-10 border-4 border-amber-400 shadow-[6px_6px_0_#000] text-center space-y-6">
              <BossDefeatStarShower active={true} />
              <div className="relative z-10 w-24 h-24 bg-amber-400 border-4 border-black rounded-full mx-auto flex items-center justify-center shadow-[0_4px_0_#000]">
                <MarioAxeIcon className="w-12 h-12" />
              </div>
              <h3 className="relative z-10 text-2xl sm:text-4xl font-black text-white font-display">
                YOU CONQUERED THE LAVA KEEP!
              </h3>
              <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-bold text-emerald-400 font-mario">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-400">
                  <MarioCoinIcon className="w-5 h-5 shrink-0" />
                  <span>+{bossTier === 'mega' ? 200 : 100} MARIO COINS!</span>
                </span>
                <span
                  data-testid="boss-defeat-invincible-banner"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 border-2 border-black font-black"
                >
                  <MarioStarIcon className="w-4 h-4 shrink-0" />
                  <span>5-MIN INVINCIBLE STUDY MODE (2X COINS)!</span>
                </span>
              </div>
              <div className="relative z-10 space-y-4">
                <QuizResultSummaryChart records={bossRecords} darkSurface />
                <QuizAnalyticsPanel
                  records={bossRecords}
                  missedQuestions={bossMissedDetails}
                  quizHistory={quizHistory}
                  currentRunCorrect={bossRecords.filter((r) => r.isCorrect).length}
                />
              </div>
              <button
                type="button"
                onClick={() => setBossBattleState('intro')}
                className="relative z-10 min-h-[48px] px-8 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] cursor-pointer leading-none whitespace-nowrap"
              >
                <RotateCcw className="w-5 h-5 shrink-0" />
                <span>Battle Bowser Again</span>
              </button>
            </div>
          )}

          {bossBattleState === 'defeat' && (
            <div className="bg-gradient-to-b from-[#2a0808] to-black text-white rounded-3xl p-6 sm:p-10 border-4 border-red-700 shadow-[6px_6px_0_#000] text-center space-y-6">
              <div className="w-20 h-20 bg-red-950 border-4 border-black rounded-full mx-auto flex items-center justify-center shadow-[0_4px_0_#000]">
                <MarioBowserIcon className="w-12 h-12" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
                DEFEATED IN THE LAVA KEEP!
              </h3>
              <QuizResultSummaryChart records={bossRecords} darkSurface />
              <QuizAnalyticsPanel
                records={bossRecords}
                missedQuestions={bossMissedDetails}
                quizHistory={quizHistory}
                currentRunCorrect={bossRecords.filter((r) => r.isCorrect).length}
              />
              <button
                type="button"
                onClick={() => handleStartBossBattle(bossTier)}
                className="min-h-[48px] px-8 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] cursor-pointer leading-none whitespace-nowrap"
              >
                <RotateCcw className="w-5 h-5 shrink-0" />
                <span>Retry Boss Battle</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODE 3: KOOPA BOSS GAUNTLET (10 HARD QS, <=1 MISS -> EXCLUSIVE FRAME) ==================== */}
      {activeMode === 'koopa_boss' && (
        <div data-testid="koopa-boss-mode-view" className="space-y-5">
          <div className="bg-gradient-to-r from-emerald-950 via-lime-950 to-slate-950 text-white rounded-3xl p-5 sm:p-7 mario-card border-4 border-slate-950 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-lime-400 text-slate-950 font-black rounded-lg border border-black text-[10px] uppercase font-mario">
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span>10 HARD QUESTIONS · MAX 1 MISS ALLOWED</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white font-display">
                  KOOPA SOVEREIGN CITADEL GAUNTLET
                </h2>
                <p className="text-xs sm:text-sm text-lime-100 font-semibold max-w-2xl">
                  Conquer {KOOPA_BOSS_TOTAL_QUESTIONS} consecutive Exam-Prep Bar scenarios with at most{' '}
                  {KOOPA_BOSS_MAX_MISSES} wrong answer (`9/10` or `10/10`) to unlock the exclusive{' '}
                  <strong>Koopa Sovereign Shell Card Frame</strong> + <strong>150 Bonus Coins</strong>!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  startFreshKoopaBoss(true);
                  marioAudio.playPowerUp();
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Fresh 10-Q Gauntlet</span>
              </button>
            </div>
          </div>

          {koopaState.status === 'active' && koopaQ ? (
            <div className="bg-white rounded-3xl mario-card border-4 border-slate-950 p-4 sm:p-7 space-y-5">
              {renderMarioStageProgressBar({
                currentStep: koopaIdx + 1,
                totalSteps: koopaDeck.length,
                stageTitle: koopaQ.world,
                rightLabel: `Misses: ${koopaState.missCount}/${
                  KOOPA_BOSS_MAX_MISSES + (hasLifeRing ? 1 : 0)
                } Max${hasLifeRing ? ' (1-Up Ring +1)' : ''}`,
                lives: Math.max(
                  0,
                  KOOPA_BOSS_MAX_MISSES + 1 + (hasLifeRing ? 1 : 0) - koopaState.missCount
                ),
                maxLives: KOOPA_BOSS_MAX_MISSES + 1 + (hasLifeRing ? 1 : 0),
              })}

              <div className="bg-slate-50 border-3 border-slate-900 rounded-2xl p-4 sm:p-6 space-y-2">
                <span className="text-[11px] font-black uppercase text-emerald-800 font-mario block">
                  KOOPA CITADEL HARD HYPOTHETICAL #{koopaIdx + 1}
                </span>
                <p className={`${bodyTextClass} font-extrabold text-slate-950 leading-relaxed`}>
                  &ldquo;{koopaQ.scenario}&rdquo;
                </p>
              </div>

              {renderQuizCoinLifelineBar({
                optionsCount: koopaQ.options.length,
                correctIndex: koopaQ.correctIndex,
                legalBasis: koopaQ.legalBasis,
                hint: koopaQ.hint,
                explanation: koopaQ.explanation,
                submitted: koopaSubmitted,
              })}

              <div className="space-y-2.5">
                {koopaQ.options.map((opt, idx) => {
                  const isZapped = !koopaSubmitted && eliminatedOptions.includes(idx);
                  let optStyle = 'bg-white hover:bg-slate-100 border-slate-800 text-slate-900';
                  if (isZapped) {
                    optStyle = 'bg-slate-100 border-slate-300 text-slate-400 line-through opacity-55';
                  } else if (koopaSelected === idx) {
                    optStyle = 'bg-lime-100 border-lime-700 text-slate-950 ring-2 ring-lime-400';
                  }
                  if (koopaSubmitted) {
                    if (idx === koopaQ.correctIndex) {
                      optStyle = 'bg-emerald-100 border-emerald-700 text-emerald-950 ring-3 ring-emerald-400';
                    } else if (koopaSelected === idx) {
                      optStyle = 'bg-rose-100 border-rose-600 text-rose-950';
                    }
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={koopaSubmitted || isZapped}
                      onClick={() => {
                        setKoopaSelected(idx);
                        marioAudio.playJump();
                      }}
                      className={`w-full min-h-[52px] text-left p-3.5 sm:p-4 rounded-xl border-3 transition-all flex items-start gap-3 cursor-pointer ${optStyle}`}
                    >
                      <span className="inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-slate-950 text-lime-300 text-xs sm:text-sm font-black font-mario">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className={`${bodyTextClass} font-bold leading-snug pt-0.5`}>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {koopaSubmitted && (
                <div
                  className={`p-4 rounded-2xl border-3 space-y-2 ${
                    koopaSelected === koopaQ.correctIndex
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                      : 'bg-rose-50 border-rose-600 text-rose-950'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-mario text-xs font-black">
                      {koopaSelected === koopaQ.correctIndex
                        ? 'SHELL CRACKED! +10 COINS!'
                        : 'WARNING: 1 SHELL SHIELD LOST (0 MISSES LEFT)!'}
                    </div>
                    {koopaSelected !== koopaQ.correctIndex && (
                      <SaveSingleQuizErrorButton
                        testId="koopa-live-save-error-btn"
                        compact
                        errorItem={{
                          scenario: koopaQ.scenario,
                          correctOptionText: koopaQ.options[koopaQ.correctIndex] || '',
                          chosenOptionText:
                            koopaSelected !== null ? koopaQ.options[koopaSelected] || '' : '',
                          legalBasis: koopaQ.legalBasis || 'Philippine Labor Code',
                          explanation: koopaQ.explanation || '',
                          worldCode: koopaQ.worldCode || 'w1',
                          quizModeLabel: 'Koopa Citadel',
                        }}
                      />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold">
                    {koopaQ.explanation} ({koopaQ.legalBasis})
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t-2 border-slate-200">
                {!koopaSubmitted ? (
                  <button
                    type="button"
                    data-testid="koopa-submit-btn"
                    disabled={koopaSelected === null}
                    onClick={handleSubmitKoopaAnswer}
                    className="min-h-[46px] px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 disabled:opacity-45 text-slate-950 font-black border-3 border-black shadow-[0_3px_0_#000] cursor-pointer"
                  >
                    Lock In Ruling
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid="koopa-next-btn"
                    onClick={handleNextKoopaQuestion}
                    className="min-h-[46px] px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Next Citadel Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : koopaState.status === 'victory' ? (
            <div
              data-testid="koopa-boss-victory-card"
              className="bg-gradient-to-b from-emerald-950 via-slate-900 to-black text-white rounded-3xl p-6 sm:p-10 border-4 border-lime-400 shadow-[6px_6px_0_#000] text-center space-y-5"
            >
              {renderMarioCourseOutcomeBanner({
                accuracyPercent: Math.round((koopaState.correctCount / koopaDeck.length) * 100),
                courseTitle: 'Koopa Sovereign Citadel',
              })}
              <h3 className="text-2xl sm:text-4xl font-black font-display text-lime-300">
                KOOPA SOVEREIGN SHELL FRAME UNLOCKED!
              </h3>
              <p className="text-sm text-slate-200 max-w-lg mx-auto font-semibold">
                You cleared all {koopaDeck.length} hard questions with {koopaState.correctCount}/
                {koopaDeck.length} correct and earned +150 Gold Coins plus the exclusive Koopa Sovereign Topic Card Frame!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  data-testid="equip-koopa-frame-btn"
                  onClick={handleEquipKoopaFrameNow}
                  className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-5 h-5" />
                  <span>
                    {koopaFrameEquippedFeedback
                      ? 'Koopa Sovereign Frame Equipped!'
                      : 'Equip Koopa Sovereign Frame Now'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={startFreshKoopaBoss}
                  className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black border-2 border-slate-600 inline-flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Another 10-Q Gauntlet</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              data-testid="koopa-boss-defeat-card"
              className="bg-gradient-to-b from-rose-950 to-slate-950 text-white rounded-3xl p-6 sm:p-10 border-4 border-rose-600 shadow-[6px_6px_0_#000] text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-800 border-3 border-black mx-auto flex items-center justify-center">
                <MarioBowserIcon className="w-10 h-10" />
              </div>
              <span className="font-mario text-xs text-amber-300 block">
                GAME OVER · EXCEEDED 1-MISS LIMIT ({koopaState.missCount} MISSES)
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-display">
                Koopa Citadel Repelled Your Advance at Question {koopaState.answeredCount}
              </h3>
              {koopaMissedDetails.length > 0 && (
                <div className="text-left space-y-2.5 max-w-2xl mx-auto">
                  <span className="text-xs font-black uppercase font-mario text-amber-300 block">
                    MISSED CITADEL QUESTIONS (SAVE ONE BY ONE):
                  </span>
                  {koopaMissedDetails.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 space-y-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono font-black text-amber-300">{m.legalBasis}</span>
                        <SaveSingleQuizErrorButton
                          testId={`koopa-defeat-save-error-${mIdx}`}
                          compact
                          darkSurface
                          errorItem={m}
                        />
                      </div>
                      <p className="font-bold text-white">{m.scenario}</p>
                      <p className="text-emerald-300 font-semibold">
                        Correct Rule: {m.correctOptionText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  startFreshKoopaBoss();
                  marioAudio.playPowerUp();
                }}
                className="min-h-[48px] px-7 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Retry Koopa Boss Gauntlet</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODE 4: ASYNC 3-QUESTION QUIZ BATTLE ==================== */}
      {activeMode === 'async_battle' && (
        <div data-testid="async-battle-mode-view" className="space-y-5">
          <div className="bg-gradient-to-r from-violet-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 mario-card border-4 border-slate-950 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-300 text-slate-950 font-black rounded-lg border border-black text-[10px] uppercase font-mario">
                  <Swords className="w-3.5 h-3.5 shrink-0" />
                  <span>ASYNC 3-QUESTION DUEL · SCORE &amp; SPEED</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white font-display">
                  ASYNCHRONOUS BAR QUIZ BATTLE
                </h2>
                <p className="text-xs sm:text-sm text-violet-100 font-semibold max-w-2xl">
                  {incomingChallenge
                    ? `Challenged by ${incomingChallenge.challengerName}: Beat ${incomingChallenge.challengerScore}/3 in ${incomingChallenge.challengerTimeSec}s!`
                    : 'Pick any Labor Law World, race 3 timed Bar questions against a Rival Counsel, and share your Challenge Link with friends!'}
                </p>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-slate-950 border-2 border-violet-400 font-mono font-black text-amber-300 text-base tabular-nums shrink-0">
                Time: {asyncElapsedSec}s
              </div>
            </div>

            <div className="pt-3 border-t border-white/15 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-violet-300 font-mario mr-1">
                BATTLE WORLD:
              </span>
              {worldSelectOptions.map((opt) => (
                <button
                  key={opt.worldId}
                  type="button"
                  onClick={() => {
                    startFreshAsyncBattle(opt.worldId, false);
                    marioAudio.playPipe();
                  }}
                  className={`min-h-[38px] px-3 rounded-xl text-xs font-black border border-black cursor-pointer whitespace-nowrap ${
                    asyncWorld === opt.worldId
                      ? 'bg-violet-300 text-slate-950 shadow-[0_2px_0_#000]'
                      : 'bg-slate-950/60 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {!asyncComplete && asyncQ ? (
            <div className="bg-white rounded-3xl mario-card border-4 border-slate-950 p-4 sm:p-7 space-y-5">
              {renderMarioStageProgressBar({
                currentStep: asyncIdx + 1,
                totalSteps: asyncDeck.length,
                stageTitle: asyncQ.world,
                rightLabel: `Duel Score: ${asyncScore}/${asyncIdx + (asyncSubmitted ? 1 : 0)}`,
              })}

              <div className="bg-slate-50 border-3 border-slate-900 rounded-2xl p-4 sm:p-6 space-y-2">
                <span className="text-[11px] font-black uppercase text-violet-800 font-mario block">
                  DUEL ROUND {asyncIdx + 1} OF 3
                </span>
                <p className={`${bodyTextClass} font-extrabold text-slate-950 leading-relaxed`}>
                  &ldquo;{asyncQ.scenario}&rdquo;
                </p>
              </div>

              <div className="space-y-2.5">
                {asyncQ.options.map((opt, idx) => {
                  let optStyle = 'bg-white hover:bg-slate-100 border-slate-800 text-slate-900';
                  if (asyncSelected === idx) {
                    optStyle = 'bg-violet-100 border-violet-700 text-slate-950 ring-2 ring-violet-400';
                  }
                  if (asyncSubmitted) {
                    if (idx === asyncQ.correctIndex) {
                      optStyle = 'bg-emerald-100 border-emerald-700 text-emerald-950 ring-3 ring-emerald-400';
                    } else if (asyncSelected === idx) {
                      optStyle = 'bg-rose-100 border-rose-600 text-rose-950';
                    }
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={asyncSubmitted}
                      onClick={() => {
                        setAsyncSelected(idx);
                        marioAudio.playJump();
                      }}
                      className={`w-full min-h-[52px] text-left p-3.5 sm:p-4 rounded-xl border-3 transition-all flex items-start gap-3 cursor-pointer ${optStyle}`}
                    >
                      <span className="inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-slate-950 text-violet-300 text-xs font-black font-mario">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className={`${bodyTextClass} font-bold leading-snug pt-0.5`}>{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2 border-t-2 border-slate-200">
                {!asyncSubmitted ? (
                  <button
                    type="button"
                    data-testid="async-submit-btn"
                    disabled={asyncSelected === null}
                    onClick={handleSubmitAsyncAnswer}
                    className="min-h-[46px] px-6 py-2.5 rounded-xl bg-violet-400 hover:bg-violet-300 disabled:opacity-45 text-slate-950 font-black border-3 border-black shadow-[0_3px_0_#000] cursor-pointer"
                  >
                    Lock In Duel Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid="async-next-btn"
                    onClick={handleNextAsyncQuestion}
                    className="min-h-[46px] px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>{asyncIdx < asyncDeck.length - 1 ? 'Next Duel Round' : 'Compare Duel Scorecard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            (() => {
              const rival = incomingChallenge
                ? {
                    rivalName: incomingChallenge.challengerName,
                    rivalScore: incomingChallenge.challengerScore,
                    rivalTimeSec: incomingChallenge.challengerTimeSec,
                  }
                : computeSimulatedRivalResult(`${asyncWorld}_${asyncDeck.map((d) => d.id).join('_')}`);
              const didWin =
                asyncScore > rival.rivalScore ||
                (asyncScore === rival.rivalScore && asyncElapsedSec <= rival.rivalTimeSec);

              return (
                <div
                  data-testid="async-battle-results-card"
                  className="bg-white rounded-3xl mario-card border-4 border-slate-950 p-6 sm:p-8 space-y-6"
                >
                  {renderMarioCourseOutcomeBanner({
                    accuracyPercent: Math.round((asyncScore / Math.max(1, asyncDeck.length)) * 100),
                    courseTitle: didWin ? 'Async Duel Victory!' : 'Close Rival Duel!',
                  })}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 tabular-nums">
                    <div className="p-5 rounded-2xl bg-emerald-50 border-3 border-emerald-700 space-y-1 text-center">
                      <span className="font-mario text-[10px] text-emerald-800 block">YOU (CHALLENGER)</span>
                      <div className="text-3xl font-black text-slate-950 font-display">
                        {asyncScore} / 3
                      </div>
                      <div className="text-xs font-extrabold text-emerald-800">
                        Clear Time: {asyncElapsedSec}s
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-violet-50 border-3 border-violet-700 space-y-1 text-center">
                      <span className="font-mario text-[10px] text-violet-800 block truncate">
                        RIVAL · {rival.rivalName.toUpperCase()}
                      </span>
                      <div className="text-3xl font-black text-slate-950 font-display">
                        {rival.rivalScore} / 3
                      </div>
                      <div className="text-xs font-extrabold text-violet-800">
                        Clear Time: {rival.rivalTimeSec}s
                      </div>
                    </div>
                  </div>

                  {asyncMissedDetails.length > 0 && (
                    <div className="space-y-2.5 text-left">
                      <span className="text-xs font-black uppercase font-mario text-rose-700 block">
                        MISSED DUEL ITEMS (SAVE ONE BY ONE):
                      </span>
                      {asyncMissedDetails.map((m, aIdx) => (
                        <div
                          key={aIdx}
                          className="p-3.5 rounded-2xl bg-rose-50/70 border-2 border-rose-300 space-y-2 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono font-black text-rose-900">{m.legalBasis}</span>
                            <SaveSingleQuizErrorButton
                              testId={`async-duel-save-error-${aIdx}`}
                              compact
                              errorItem={m}
                            />
                          </div>
                          <p className="font-bold text-slate-900">{m.scenario}</p>
                          <p className="text-emerald-800 font-bold">
                            Correct Rule: {m.correctOptionText}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      data-testid="copy-async-challenge-link-btn"
                      onClick={handleCopyAsyncShareUrl}
                      className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-black border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
                    >
                      {asyncCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>
                        {asyncCopied
                          ? 'Challenge Link Copied to Clipboard!'
                          : 'Copy Shareable 3-Q Challenge Link'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => startFreshAsyncBattle(asyncWorld, false)}
                      className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>New 3-Question Duel</span>
                    </button>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
};
