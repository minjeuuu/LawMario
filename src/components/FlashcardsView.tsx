import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FLASHCARDS_DATA } from '../data/flashcardsData';
import { ALL_LAW_TOPICS } from '../data/laborLawData';
import { Flashcard, StudyDifficulty } from '../types/laborLaw';
import {
  filterFlashcardsForDifficulty,
  shuffleFlashcardDeck,
  buildFlashcardExamChoices,
  mapActiveWorldToFlashcardWorldNum,
  buildQuickStudyCuratedDeck,
  QUICK_STUDY_DURATION_SECONDS,
  REVIEW_SESSION_DURATION_SECONDS,
  buildNeedsImprovementFlashcards,
  buildRapidFireReviewQuiz,
  RapidFireReviewQuestion,
} from '../utils/studyModes';
import { generateNeedsImprovementPdfBytes } from '../utils/weakFlashcardsPdf';
import { formatPomodoroSeconds } from '../utils/engagementFeatures';
import { PlayerProfileStats } from '../utils/profileAchievements';
import { marioAudio } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  CheckCircle,
  XCircle,
  Sparkles,
  Filter,
  GraduationCap,
  Feather,
  Zap,
  Clock,
  Pause,
  Play,
  Flag,
  FileDown,
  Printer,
  Flame,
  X,
} from 'lucide-react';
import { MarioStarIcon, MarioCoinIcon } from './MarioIcons';

interface FlashcardsViewProps {
  fontSize: 'normal' | 'large' | 'xlarge';
  onEarnCoin: () => void;
  onEarnCoins?: (amount: number) => void;
  studyDifficulty: StudyDifficulty;
  setStudyDifficulty: (difficulty: StudyDifficulty) => void;
  activeWorld?: string;
  profileStats?: PlayerProfileStats;
  completedTopicIds?: string[];
  onToggleNeedsImprovementWorld?: (worldId: string) => void;
  onToggleNeedsImprovementTopic?: (topicId: string) => void;
  onOpenProfile?: () => void;
  quickStudyLaunchId?: number;
}

const WEAK_WORLD_OPTIONS: { id: string; label: string }[] = [
  { id: 'world1', label: 'World 1 · Hours of Work' },
  { id: 'world2', label: 'World 2 · Rest & Overtime' },
  { id: 'world3', label: 'World 3 · Wages & D.O. 174' },
  { id: 'world4', label: 'World 4 · Special Groups' },
  { id: 'world5', label: 'World 5 · Protective Laws' },
  { id: 'world6', label: 'World 6 · Statutory Leaves' },
  { id: 'holidays', label: 'Holidays · Pay Multipliers' },
];

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  fontSize,
  onEarnCoin,
  onEarnCoins,
  studyDifficulty,
  setStudyDifficulty,
  activeWorld = 'all',
  profileStats,
  completedTopicIds = [],
  onToggleNeedsImprovementWorld,
  onToggleNeedsImprovementTopic,
  onOpenProfile,
  quickStudyLaunchId = 0,
}) => {
  const [cards, setCards] = useState<Flashcard[]>(FLASHCARDS_DATA);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedWorld, setSelectedWorld] = useState<number | 'all'>(() =>
    mapActiveWorldToFlashcardWorldNum(activeWorld)
  );
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [isDeckShuffled, setIsDeckShuffled] = useState(false);
  const [justShuffled, setJustShuffled] = useState(false);

  // Exam Prep Multiple-Choice state per card
  const [selectedMcqIdx, setSelectedMcqIdx] = useState<number | null>(null);

  // 5-Minute Quick Study Mode State
  const [isQuickStudyMode, setIsQuickStudyMode] = useState(false);
  const [quickStudyDeck, setQuickStudyDeck] = useState<Flashcard[]>([]);
  const [quickStudySourceLabel, setQuickStudySourceLabel] = useState('');
  const [quickStudySecondsLeft, setQuickStudySecondsLeft] = useState(QUICK_STUDY_DURATION_SECONDS);
  const [isQuickStudyPaused, setIsQuickStudyPaused] = useState(false);
  const [quickStudyFinished, setQuickStudyFinished] = useState(false);
  const [quickStudyReviewedCount, setQuickStudyReviewedCount] = useState(0);

  // Full-Screen Exam Focus Mode State
  const [isExamFocusMode, setIsExamFocusMode] = useState(false);
  const [examTimerSeconds, setExamTimerSeconds] = useState(300);
  const [isExamTimerPaused, setIsExamTimerPaused] = useState(false);

  // 3-Minute 'Needs Improvement' Rapid-Fire Review Session State
  const [isReviewSessionOpen, setIsReviewSessionOpen] = useState(false);
  const [isReviewRunning, setIsReviewRunning] = useState(false);
  const [isReviewPaused, setIsReviewPaused] = useState(false);
  const [isReviewFinished, setIsReviewFinished] = useState(false);
  const [reviewSecondsLeft, setReviewSecondsLeft] = useState(REVIEW_SESSION_DURATION_SECONDS);
  const [reviewQuestions, setReviewQuestions] = useState<RapidFireReviewQuestion[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewPickedIdx, setReviewPickedIdx] = useState<number | null>(null);
  const [reviewCorrectCount, setReviewCorrectCount] = useState(0);
  const [reviewAnsweredCount, setReviewAnsweredCount] = useState(0);
  const [reviewStreak, setReviewStreak] = useState(0);
  const [reviewBestStreak, setReviewBestStreak] = useState(0);

  // Export 'Needs Improvement' Flashcards PDF Modal State
  const [isExportWeakPdfOpen, setIsExportWeakPdfOpen] = useState(false);
  const [pdfDownloadedNotice, setPdfDownloadedNotice] = useState(false);

  const allTopicMeta = useMemo(
    () =>
      ALL_LAW_TOPICS.map((t) => ({
        id: t.id,
        worldId: t.worldId,
        title: t.title,
        subtitle: t.badge,
      })),
    []
  );

  const needsImprovementData = useMemo(
    () =>
      buildNeedsImprovementFlashcards({
        allCards: FLASHCARDS_DATA,
        needsImprovementTopicIds: profileStats?.needsImprovementTopicIds || [],
        needsImprovementWorlds: profileStats?.needsImprovementWorlds || [],
        allTopics: allTopicMeta,
      }),
    [
      profileStats?.needsImprovementTopicIds,
      profileStats?.needsImprovementWorlds,
      allTopicMeta,
    ]
  );

  const launchReviewSessionQuiz = () => {
    const built = buildRapidFireReviewQuiz({
      allCards: FLASHCARDS_DATA,
      needsImprovementTopicIds: profileStats?.needsImprovementTopicIds || [],
      needsImprovementWorlds: profileStats?.needsImprovementWorlds || [],
      allTopics: allTopicMeta,
      shuffle: true,
    });

    setIsQuickStudyMode(false);
    setIsReviewSessionOpen(true);

    if (!built.hasFlaggedItems || built.questions.length === 0) {
      setIsReviewRunning(false);
      setIsReviewFinished(false);
      setReviewQuestions([]);
      marioAudio.playClick();
      return;
    }

    setReviewQuestions(built.questions);
    setReviewIndex(0);
    setReviewPickedIdx(null);
    setReviewCorrectCount(0);
    setReviewAnsweredCount(0);
    setReviewStreak(0);
    setReviewBestStreak(0);
    setReviewSecondsLeft(REVIEW_SESSION_DURATION_SECONDS);
    setIsReviewPaused(false);
    setIsReviewFinished(false);
    setIsReviewRunning(true);
    marioAudio.playPowerUp();
  };

  const finishReviewSession = (awardBonus = true) => {
    setIsReviewRunning(false);
    setIsReviewFinished(true);
    setIsReviewPaused(false);
    marioAudio.playQuizComplete();
    if (awardBonus && reviewCorrectCount > 0) {
      const bonus = Math.min(30, 10 + reviewCorrectCount * 2);
      if (onEarnCoins) onEarnCoins(bonus);
      else onEarnCoin();
    }
    try {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!isReviewSessionOpen || !isReviewRunning || isReviewPaused || isReviewFinished) return;
    const timer = window.setInterval(() => {
      setReviewSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setIsReviewRunning(false);
          setIsReviewFinished(true);
          marioAudio.playQuizComplete();
          if (onEarnCoins) onEarnCoins(15);
          else onEarnCoin();
          try {
            confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isReviewSessionOpen, isReviewRunning, isReviewPaused, isReviewFinished]);

  const advanceReviewQuestion = () => {
    setReviewPickedIdx(null);
    if (reviewQuestions.length === 0) return;
    if (reviewIndex + 1 < reviewQuestions.length) {
      setReviewIndex((prev) => prev + 1);
    } else {
      // Reshuffle Needs Improvement deck so rapid-fire drill continues until the 3-minute timer finishes
      const reshuffled = buildRapidFireReviewQuiz({
        allCards: FLASHCARDS_DATA,
        needsImprovementTopicIds: profileStats?.needsImprovementTopicIds || [],
        needsImprovementWorlds: profileStats?.needsImprovementWorlds || [],
        allTopics: allTopicMeta,
        shuffle: true,
      });
      setReviewQuestions(reshuffled.questions.length > 0 ? reshuffled.questions : reviewQuestions);
      setReviewIndex(0);
    }
  };

  const handlePickReviewChoice = (choiceIdx: number) => {
    if (reviewPickedIdx !== null || !isReviewRunning || isReviewPaused) return;
    const currentQ = reviewQuestions[reviewIndex];
    if (!currentQ) return;

    setReviewPickedIdx(choiceIdx);
    setReviewAnsweredCount((c) => c + 1);

    const isCorrect = choiceIdx === currentQ.correctIndex;
    if (isCorrect) {
      marioAudio.playCoin();
      if (onEarnCoins) onEarnCoins(2);
      else onEarnCoin();
      setReviewCorrectCount((c) => c + 1);
      setReviewStreak((s) => {
        const next = s + 1;
        setReviewBestStreak((best) => Math.max(best, next));
        return next;
      });
    } else {
      marioAudio.playStomp();
      setReviewStreak(0);
    }
  };

  const handleDownloadWeakPdf = () => {
    if (needsImprovementData.cards.length === 0) return;
    const pdfBytes = generateNeedsImprovementPdfBytes({
      cards: needsImprovementData.cards,
      playerName: profileStats?.playerName || 'Counsel Hero',
    });
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Needs-Improvement-Labor-Flashcards.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    setPdfDownloadedNotice(true);
    marioAudio.playCoin();
    window.setTimeout(() => setPdfDownloadedNotice(false), 3000);
  };

  useEffect(() => {
    if (!isExamFocusMode || isExamTimerPaused) return;
    const timer = window.setInterval(() => {
      setExamTimerSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          marioAudio.playQuizTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isExamFocusMode, isExamTimerPaused]);

  useEffect(() => {
    setSelectedWorld(mapActiveWorldToFlashcardWorldNum(activeWorld));
  }, [activeWorld]);

  const startQuickStudySprint = () => {
    const curated = buildQuickStudyCuratedDeck({
      allCards: FLASHCARDS_DATA,
      needsImprovementTopicIds: profileStats?.needsImprovementTopicIds || [],
      needsImprovementWorlds: profileStats?.needsImprovementWorlds || [],
      completedTopicIds,
      masteredCardIds: Array.from(masteredIds),
      allTopics: ALL_LAW_TOPICS.map((t) => ({
        id: t.id,
        worldId: t.worldId,
        title: t.title,
        subtitle: t.badge,
      })),
      deckSize: 15,
    });
    setQuickStudyDeck(curated.cards);
    setQuickStudySourceLabel(curated.sourceLabel);
    setQuickStudySecondsLeft(QUICK_STUDY_DURATION_SECONDS);
    setIsQuickStudyPaused(false);
    setQuickStudyFinished(false);
    setQuickStudyReviewedCount(0);
    setIsQuickStudyMode(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSelectedMcqIdx(null);
    marioAudio.playPowerUp();
  };

  useEffect(() => {
    if (quickStudyLaunchId > 0) {
      startQuickStudySprint();
    }
  }, [quickStudyLaunchId]);

  useEffect(() => {
    if (!isQuickStudyMode || isQuickStudyPaused || quickStudyFinished) return;
    const timer = window.setInterval(() => {
      setQuickStudySecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setQuickStudyFinished(true);
          marioAudio.playQuizComplete();
          if (onEarnCoins) onEarnCoins(20);
          else onEarnCoin();
          try {
            confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isQuickStudyMode, isQuickStudyPaused, quickStudyFinished]);

  const exitQuickStudyMode = () => {
    setIsQuickStudyMode(false);
    setQuickStudyFinished(false);
    setIsQuickStudyPaused(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSelectedMcqIdx(null);
    marioAudio.playPipe();
  };

  const standardFilteredCards = useMemo(
    () => filterFlashcardsForDifficulty(cards, studyDifficulty, selectedWorld, isDeckShuffled),
    [cards, studyDifficulty, selectedWorld, isDeckShuffled]
  );

  const filteredCards = isQuickStudyMode ? quickStudyDeck : standardFilteredCards;

  useEffect(() => {
    if (!isQuickStudyMode) {
      setCurrentIndex(0);
      setIsFlipped(false);
      setSelectedMcqIdx(null);
    }
  }, [studyDifficulty, selectedWorld, isQuickStudyMode]);

  const activeCard = filteredCards[currentIndex] || filteredCards[0];

  const examChoices = useMemo(
    () => (activeCard ? buildFlashcardExamChoices(activeCard, FLASHCARDS_DATA) : []),
    [activeCard]
  );

  const activeWorldIdForToggle = useMemo(() => {
    if (selectedWorld === 'all') return null;
    if (selectedWorld === 7) return 'holidays';
    return `world${selectedWorld}`;
  }, [selectedWorld]);

  const isSelectedWorldMarkedWeak = Boolean(
    activeWorldIdForToggle &&
      profileStats?.needsImprovementWorlds?.includes(activeWorldIdForToggle)
  );

  const totalNeedsImprovementCount =
    (profileStats?.needsImprovementTopicIds?.length || 0) +
    (profileStats?.needsImprovementWorlds?.length || 0);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
    marioAudio.playJump();
  };

  const handleNext = () => {
    setIsFlipped(false);
    setSelectedMcqIdx(null);
    if (isQuickStudyMode && currentIndex >= filteredCards.length - 1) {
      setQuickStudyFinished(true);
      marioAudio.playQuizComplete();
      if (onEarnCoins) onEarnCoins(20);
      else onEarnCoin();
      try {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      return;
    }
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
    marioAudio.playPipe();
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setSelectedMcqIdx(null);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(Math.max(0, filteredCards.length - 1));
    }
    marioAudio.playPipe();
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setSelectedMcqIdx(null);
    if (isQuickStudyMode) {
      setQuickStudyDeck((prev) => shuffleFlashcardDeck(prev, activeCard?.id));
    } else {
      // Find the first card currently visible in the filtered view so the new #1 card visibly changes
      const currentVisibleFirstId = activeCard?.id;
      setCards((prev) => {
        const next = shuffleFlashcardDeck(prev, currentVisibleFirstId);
        // If world filter is active and the filtered subset has >1 card, ensure its leading card also changes
        const filteredNext = filterFlashcardsForDifficulty(next, studyDifficulty, selectedWorld, true);
        if (filteredNext.length > 1 && filteredNext[0].id === currentVisibleFirstId) {
          const secondVisibleId = filteredNext[1].id;
          const idxA = next.findIndex((c) => c.id === currentVisibleFirstId);
          const idxB = next.findIndex((c) => c.id === secondVisibleId);
          if (idxA !== -1 && idxB !== -1) {
            [next[idxA], next[idxB]] = [next[idxB], next[idxA]];
          }
        }
        return next;
      });
      setIsDeckShuffled(true);
    }
    setCurrentIndex(0);
    setJustShuffled(true);
    window.setTimeout(() => setJustShuffled(false), 1600);
    marioAudio.playPowerUp();
  };

  const handleSelectMcqOption = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedMcqIdx !== null) return;
    setSelectedMcqIdx(idx);
    const picked = examChoices[idx];
    if (picked?.isCorrect) {
      marioAudio.playCoin();
      if (onEarnCoins) onEarnCoins(2);
      else onEarnCoin();
      if (isQuickStudyMode) {
        setQuickStudyReviewedCount((c) => c + 1);
      }
      try {
        confetti({ particleCount: 30, spread: 55, origin: { y: 0.7 } });
      } catch {
        // ignore
      }
    } else {
      marioAudio.playStomp();
    }
  };

  const handleMastered = () => {
    if (!activeCard) return;
    marioAudio.playCoin();
    onEarnCoin();
    if (isQuickStudyMode) {
      setQuickStudyReviewedCount((c) => c + 1);
    }

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#e11d48', '#10b981', '#3b82f6'],
      });
    } catch {
      // ignore
    }

    setMasteredIds((prev) => new Set(prev).add(activeCard.id));
    handleNext();
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isReviewSessionOpen || isExportWeakPdfOpen) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, filteredCards.length, isQuickStudyMode, isReviewSessionOpen, isExportWeakPdfOpen]);

  const bodyTextClass =
    fontSize === 'xlarge'
      ? 'text-xl sm:text-2xl leading-relaxed'
      : fontSize === 'large'
      ? 'text-lg sm:text-xl leading-relaxed'
      : 'text-base sm:text-lg leading-normal';

  return (
    <div className="space-y-5 max-w-4xl mx-auto w-full">
      {/* Full-Screen Distraction-Free Exam Focus Mode Overlay */}
      {isExamFocusMode && (
        <div
          data-testid="fullscreen-flashcards-exam-overlay"
          className="fixed inset-0 z-50 bg-[#070b14] text-white flex flex-col p-4 sm:p-8 overflow-y-auto"
        >
          {/* Top Focus Bar */}
          <div className="max-w-4xl w-full mx-auto flex items-center justify-between gap-4 border-b-2 border-slate-800 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mario block">
                  FULL-SCREEN EXAM FOCUS MODE
                </span>
                <h2 className="text-base sm:text-lg font-black text-white font-display">
                  FLASHCARD RAPID RECALL · {filteredCards.length} CARDS
                </h2>
              </div>
            </div>

            {/* Countdown Timer Display */}
            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-1.5 rounded-xl border-2 font-mono font-black text-xl sm:text-2xl tabular-nums shadow-xs ${
                  examTimerSeconds <= 60
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-slate-900 border-amber-400 text-amber-300'
                }`}
              >
                {Math.floor(examTimerSeconds / 60)
                  .toString()
                  .padStart(2, '0')}
                :{(examTimerSeconds % 60).toString().padStart(2, '0')}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsExamTimerPaused(!isExamTimerPaused);
                  marioAudio.playClick();
                }}
                className="min-h-[44px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isExamTimerPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                <span>{isExamTimerPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExamFocusMode(false);
                  marioAudio.playPipe();
                }}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-rose-900/60 border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                aria-label="Exit Exam Mode"
                title="Exit Exam Mode"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Exam Focus Body */}
          <div className="max-w-2xl w-full mx-auto my-auto py-6 flex-1 flex flex-col justify-center">
            {isExamTimerPaused ? (
              <div className="bg-slate-900 border-4 border-slate-800 rounded-3xl p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 mx-auto flex items-center justify-center">
                  <Pause className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black font-display">EXAM MODE PAUSED</h3>
                <p className="text-sm text-slate-300 font-semibold max-w-md mx-auto">
                  Take a moment to reset. Flashcard timers are paused.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsExamTimerPaused(false);
                    marioAudio.playPowerUp();
                  }}
                  className="min-h-[44px] px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black shadow-[0_3px_0_#000] cursor-pointer"
                >
                  Resume Flashcard Focus
                </button>
              </div>
            ) : examTimerSeconds === 0 ? (
              <div className="bg-slate-900 border-4 border-rose-600 rounded-3xl p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white mx-auto flex items-center justify-center">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black font-display text-rose-400">TIME&apos;S UP!</h3>
                <p className="text-sm text-slate-300 font-semibold max-w-md mx-auto">
                  Your 5-minute timed flashcard session is complete.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExamTimerSeconds(300);
                      setIsExamTimerPaused(false);
                      marioAudio.playPowerUp();
                    }}
                    className="min-h-[44px] px-5 py-2.5 bg-amber-400 text-slate-950 font-black rounded-xl border-2 border-black cursor-pointer"
                  >
                    Restart 5m Timer
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExamFocusMode(false)}
                    className="min-h-[44px] px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl border border-slate-600 cursor-pointer"
                  >
                    Exit Exam Mode
                  </button>
                </div>
              </div>
            ) : activeCard ? (
              <div className="bg-white text-slate-950 rounded-3xl border-4 border-slate-950 p-6 sm:p-8 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
                  <span className="text-xs font-black uppercase text-amber-600 font-mario">
                    CARD {currentIndex + 1} OF {filteredCards.length} · WORLD {activeCard.world}
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    {activeCard.difficulty} Difficulty
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border-2 border-slate-300 rounded-2xl min-h-[140px] flex flex-col justify-center">
                  <span className="text-[10px] font-black uppercase text-slate-500 font-mario mb-1">
                    {!isFlipped ? 'QUESTION / STATUTORY DOCTRINE:' : 'ANSWER / STATUTORY RULE:'}
                  </span>
                  <p className="text-base sm:text-lg font-extrabold text-slate-950 leading-relaxed">
                    {!isFlipped ? activeCard.question : activeCard.answer}
                  </p>
                </div>

                {/* Multiple Choice Options (if in exam prep and not flipped) */}
                {studyDifficulty === 'exam_prep' && !isFlipped && examChoices.length > 0 && (
                  <div className="space-y-2">
                    {examChoices.map((choice, idx) => {
                      let style = 'bg-white hover:bg-slate-100 border-slate-700 text-slate-900';
                      if (selectedMcqIdx === idx) {
                        style = choice.isCorrect
                          ? 'bg-emerald-100 border-emerald-600 text-emerald-950 ring-2 ring-emerald-400'
                          : 'bg-rose-100 border-rose-600 text-rose-950 ring-2 ring-rose-400';
                      }
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => handleSelectMcqOption(idx, e)}
                          className={`w-full min-h-[44px] p-3 rounded-xl border-2 text-left font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer ${style}`}
                        >
                          <span className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono shrink-0 font-bold">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1">{choice.text}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleFlip}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>{isFlipped ? 'Flip Back' : 'Flip to Reveal'}</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2 ml-auto">
                    <button
                      type="button"
                      data-testid="exam-focus-shuffle-btn"
                      onClick={handleShuffle}
                      aria-label="Shuffle current flashcard deck"
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs border-2 border-black inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Shuffle className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>{justShuffled ? 'Shuffled!' : 'Shuffle'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Previous card"
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs border border-slate-400 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleMastered}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs border-2 border-black flex items-center gap-1.5 cursor-pointer shadow-[0_2px_0_#000] whitespace-nowrap"
                    >
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>Mastered (+1c)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Next card"
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs border border-slate-400 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Header Banner + Quick Study Mode CTA */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 rounded-3xl p-4 sm:p-7 mario-card border-4 border-slate-950 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 text-center lg:text-left min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white font-black rounded-lg border border-black text-[10px] sm:text-[11px] uppercase font-mario max-w-full">
              <span className="break-words">
                {isQuickStudyMode
                  ? '5-MINUTE QUICK STUDY SPRINT'
                  : studyDifficulty === 'exam_prep'
                  ? 'EXAM PREP • MULTIPLE CHOICE BLOCKS'
                  : 'CASUAL • DEFINITION FLIP BLOCKS'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
              {isQuickStudyMode
                ? 'CURATED WEAK-SPOT FLASHCARD DECK'
                : 'QUESTION MARK FLIP BLOCKS'}
            </h2>
            <p className="text-amber-100 font-bold text-xs sm:text-sm max-w-xl mx-auto lg:mx-0">
              {isQuickStudyMode
                ? quickStudySourceLabel
                : studyDifficulty === 'exam_prep'
                ? 'Exam Prep Mode: Test yourself with 4-option multiple-choice doctrines across all 6 Worlds & Holidays before flipping (+2c per correct pick)!'
                : 'Casual Mode: Focus on foundational definitions and statutory thresholds across Worlds 1–6 & Holidays. Tap the card to flip!'}
            </p>
          </div>

          <div
            className={
              isQuickStudyMode
                ? 'flex items-center justify-center lg:justify-end gap-2 flex-wrap shrink-0 w-full lg:w-auto'
                : 'grid grid-cols-1 min-[420px]:grid-cols-2 gap-2 shrink-0 w-full lg:w-[410px]'
            }
          >
            {/* 3-Minute Rapid-Fire 'Review Session' Button (Needs Improvement Only) */}
            <button
              type="button"
              data-testid="flashcards-review-session-btn"
              onClick={launchReviewSessionQuiz}
              className="min-h-[44px] w-full px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 inline-flex items-center justify-center gap-1.5 text-xs sm:text-[13px] cursor-pointer whitespace-nowrap"
            >
              <Flame className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Review Session (3m)</span>
              {needsImprovementData.cards.length > 0 && (
                <span className="text-amber-200 tabular-nums text-xs">
                  · {needsImprovementData.cards.length}
                </span>
              )}
            </button>

            {/* Export 'Needs Improvement' Flashcards to Printable/Downloadable PDF */}
            <button
              type="button"
              data-testid="export-weak-flashcards-pdf-btn"
              onClick={() => {
                setIsExportWeakPdfOpen(true);
                marioAudio.playClick();
              }}
              className="min-h-[44px] w-full px-3 py-2 bg-white hover:bg-amber-50 text-slate-950 font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 inline-flex items-center justify-center gap-1.5 text-xs sm:text-[13px] cursor-pointer whitespace-nowrap"
            >
              <FileDown className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Export Weak PDF</span>
            </button>

            <button
              type="button"
              data-testid="toggle-flashcards-exam-mode-btn"
              onClick={() => {
                setIsExamFocusMode(true);
                setExamTimerSeconds(300);
                setIsExamTimerPaused(false);
                marioAudio.playPowerUp();
              }}
              className="min-h-[44px] w-full px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 inline-flex items-center justify-center gap-1.5 text-xs sm:text-[13px] cursor-pointer whitespace-nowrap"
            >
              <Clock className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Exam Focus</span>
            </button>

            {!isQuickStudyMode ? (
              <button
                type="button"
                data-testid="quick-study-mode-btn"
                onClick={() => {
                  setIsReviewSessionOpen(false);
                  startQuickStudySprint();
                }}
                className="min-h-[44px] w-full px-3 py-2 bg-slate-950 hover:bg-slate-900 text-amber-300 font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 inline-flex items-center justify-center gap-1.5 text-xs sm:text-[13px] cursor-pointer whitespace-nowrap"
              >
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Quick Study (5m)</span>
                {totalNeedsImprovementCount > 0 && (
                  <span className="text-emerald-300 tabular-nums">
                    · {totalNeedsImprovementCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={exitQuickStudyMode}
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-2xl border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center justify-center gap-1.5 text-xs cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>Back to Full {FLASHCARDS_DATA.length}-Card Deck</span>
              </button>
            )}
          </div>
        </div>

        {/* Active 5-Minute Quick Study Timer HUD */}
        {isQuickStudyMode && (
          <div
            data-testid="quick-study-timer-banner"
            className="bg-slate-950 text-white rounded-2xl p-3.5 sm:p-4 border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 tabular-nums">
                    {formatPomodoroSeconds(quickStudySecondsLeft)}
                  </span>
                  <span className="text-xs font-bold text-slate-300 tabular-nums">
                    · {quickStudyDeck.length} Curated Cards · {quickStudyReviewedCount} Mastered
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Prioritizing topics marked &ldquo;Need Improvement&rdquo; in your Profile Stats (+20c sprint finish bonus).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsQuickStudyPaused((p) => !p)}
                className="min-h-[44px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                {isQuickStudyPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-300" />
                    <span>Pause</span>
                  </>
                )}
              </button>
              <button
                type="button"
                data-testid="quick-study-shuffle-btn"
                onClick={handleShuffle}
                className="min-h-[44px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs border border-slate-600 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{justShuffled ? 'Shuffled!' : 'Shuffle'}</span>
              </button>
              <button
                type="button"
                onClick={startQuickStudySprint}
                className="min-h-[44px] px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <RotateCw className="w-3.5 h-3.5 shrink-0" />
                <span>Refresh 5m Deck</span>
              </button>
              {onOpenProfile && (
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="min-h-[44px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-600 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Edit Weak Topics</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter, Difficulty Switch & Shuffle Controls (Hidden during Quick Study Sprint Summary) */}
      {!isQuickStudyMode && (
        <div className="bg-white rounded-2xl border-4 border-slate-900 p-3 sm:p-4 space-y-3 shadow-[4px_4px_0_#000]">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Worlds 1–6 & Holidays Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-slate-700 inline-flex items-center gap-1 uppercase font-mario mr-1">
                <Filter className="w-3.5 h-3.5 shrink-0" /> Deck:
              </span>
              <button
                type="button"
                onClick={() => setSelectedWorld('all')}
                className={`min-h-[44px] px-3 inline-flex items-center justify-center rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer leading-none whitespace-nowrap tabular-nums ${
                  selectedWorld === 'all'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({filterFlashcardsForDifficulty(cards, studyDifficulty, 'all').length})
              </button>
              {[1, 2, 3, 4, 5, 6].map((w) => (
                <button
                  key={w}
                  type="button"
                  data-testid={`flashcard-world-${w}-btn`}
                  onClick={() => setSelectedWorld(w)}
                  className={`min-h-[44px] min-w-[44px] px-3 inline-flex items-center justify-center rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer leading-none whitespace-nowrap ${
                    selectedWorld === w
                      ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  W{w}
                </button>
              ))}
              <button
                type="button"
                data-testid="flashcard-holidays-btn"
                onClick={() => setSelectedWorld(7)}
                className={`min-h-[44px] px-3 inline-flex items-center justify-center rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer leading-none whitespace-nowrap ${
                  selectedWorld === 7
                    ? 'bg-red-600 text-white shadow-[0_2px_0_#000]'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Holidays
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeWorldIdForToggle && onToggleNeedsImprovementWorld && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleNeedsImprovementWorld(activeWorldIdForToggle);
                    marioAudio.playCoin();
                  }}
                  className={`min-h-[44px] px-3 inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-black font-black text-xs cursor-pointer leading-none whitespace-nowrap ${
                    isSelectedWorldMarkedWeak
                      ? 'bg-rose-600 text-white shadow-[0_2px_0_#000]'
                      : 'bg-amber-50 text-amber-950 hover:bg-amber-100'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isSelectedWorldMarkedWeak ? 'Marked Need Improvement' : 'Flag Need Improvement'}
                  </span>
                </button>
              )}

              {/* Inline Difficulty Switcher */}
              <button
                type="button"
                onClick={() =>
                  setStudyDifficulty(studyDifficulty === 'casual' ? 'exam_prep' : 'casual')
                }
                className={`min-h-[44px] px-3 inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-black font-black text-xs cursor-pointer leading-none whitespace-nowrap ${
                  studyDifficulty === 'exam_prep'
                    ? 'bg-red-600 text-white shadow-[0_2px_0_#000]'
                    : 'bg-emerald-400 text-slate-950 shadow-[0_2px_0_#000]'
                }`}
              >
                {studyDifficulty === 'exam_prep' ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Exam Prep (MCQ)</span>
                  </>
                ) : (
                  <>
                    <Feather className="w-3.5 h-3.5 shrink-0" />
                    <span>Casual (Definitions)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                data-testid="flashcards-shuffle-btn"
                onClick={handleShuffle}
                aria-label="Shuffle current flashcard deck"
                title="Randomize the order of the current deck for varied retention"
                className={`min-h-[44px] px-3.5 inline-flex items-center justify-center gap-1.5 font-black rounded-xl border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 text-xs cursor-pointer leading-none whitespace-nowrap transition-colors ${
                  justShuffled
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <Shuffle
                  className={`w-3.5 h-3.5 shrink-0 ${
                    justShuffled ? 'text-slate-950' : 'text-amber-300'
                  }`}
                />
                <span>{justShuffled ? 'Shuffled!' : 'Shuffle'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Minute Rapid-Fire 'Needs Improvement' Review Session Arena */}
      {isReviewSessionOpen ? (
        <section
          data-testid="review-session-arena"
          aria-label="3-Minute Rapid-Fire Needs Improvement Review Session"
          className="bg-slate-950 text-white rounded-3xl border-4 border-black shadow-[6px_6px_0_#000] p-4 sm:p-7 space-y-5"
        >
          {/* Top Session Header + Countdown Timer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <span>3-Minute Rapid-Fire Review Session</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300">Needs Improvement Only</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                {!needsImprovementData.hasFlaggedItems
                  ? 'Select Weak Topics to Start Your 3-Minute Drill'
                  : isReviewFinished
                  ? '3-Minute Rapid-Fire Session Complete'
                  : 'Rapid-Fire Weak-Topic Quiz'}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isReviewRunning && (
                <>
                  <div
                    data-testid="review-session-countdown"
                    className={`px-3.5 py-1.5 rounded-xl border-2 font-mono font-black text-lg sm:text-xl tabular-nums ${
                      reviewSecondsLeft <= 30
                        ? 'bg-rose-950 border-rose-500 text-rose-300'
                        : reviewSecondsLeft <= 60
                        ? 'bg-amber-950 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-emerald-400 text-emerald-300'
                    }`}
                  >
                    {formatPomodoroSeconds(reviewSecondsLeft)}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReviewPaused((p) => !p);
                      marioAudio.playClick();
                    }}
                    className="min-h-[42px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {isReviewPaused ? (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-300" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>
                </>
              )}

              <button
                type="button"
                data-testid="exit-review-session-btn"
                onClick={() => {
                  setIsReviewSessionOpen(false);
                  setIsReviewRunning(false);
                  setIsReviewPaused(false);
                  marioAudio.playPipe();
                }}
                className="min-h-[42px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Flashcards</span>
              </button>
            </div>
          </div>

          {/* Live Progress Countdown Bar */}
          {isReviewRunning && (
            <div className="space-y-1.5" data-testid="review-session-progress-wrapper">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 tabular-nums">
                <span>
                  Score: <strong className="text-emerald-300">{reviewCorrectCount}</strong> / {reviewAnsweredCount}
                  {' · '}
                  Streak: <strong className="text-amber-300">{reviewStreak}</strong>
                </span>
                <span>
                  Time Remaining: {formatPomodoroSeconds(reviewSecondsLeft)} / 03:00
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Review session countdown timer"
                aria-valuenow={reviewSecondsLeft}
                aria-valuemin={0}
                aria-valuemax={REVIEW_SESSION_DURATION_SECONDS}
                data-testid="review-session-progress-bar"
                className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700"
              >
                <div
                  className={`h-full transition-all duration-700 ease-linear ${
                    reviewSecondsLeft <= 30
                      ? 'bg-rose-500'
                      : reviewSecondsLeft <= 75
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, (reviewSecondsLeft / REVIEW_SESSION_DURATION_SECONDS) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* State 1: No 'Needs Improvement' topics flagged yet -> Inline 1-Click Focus Picker */}
          {!isReviewRunning && !isReviewFinished && (
            <div
              data-testid="review-session-empty-setup"
              className="bg-slate-900 rounded-2xl border border-slate-700 p-4 sm:p-6 space-y-4"
            >
              <p className="text-sm text-slate-200 leading-relaxed">
                Review Session pulls flashcards strictly from worlds or topics marked as{' '}
                <strong className="text-amber-300">Needs Improvement</strong>. Flag at least one weak world or doctrine below to launch your 3-minute rapid-fire quiz:
              </p>

              {onToggleNeedsImprovementWorld && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 block">
                    Flag Worlds Needing Improvement:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {WEAK_WORLD_OPTIONS.map((wOpt) => {
                      const flagged = Boolean(
                        profileStats?.needsImprovementWorlds?.includes(wOpt.id)
                      );
                      return (
                        <button
                          key={wOpt.id}
                          type="button"
                          data-testid={`flag-weak-world-${wOpt.id}`}
                          onClick={() => {
                            onToggleNeedsImprovementWorld(wOpt.id);
                            marioAudio.playClick();
                          }}
                          className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                            flagged
                              ? 'bg-rose-600 text-white border-amber-300'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
                          }`}
                        >
                          <Flag className="w-3.5 h-3.5 shrink-0" />
                          <span>{wOpt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {onToggleNeedsImprovementTopic && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 block">
                    Or Flag Specific Legal Doctrines:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {ALL_LAW_TOPICS.slice(0, 12).map((topic) => {
                      const flagged = Boolean(
                        profileStats?.needsImprovementTopicIds?.includes(topic.id)
                      );
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => {
                            onToggleNeedsImprovementTopic(topic.id);
                            marioAudio.playClick();
                          }}
                          className={`min-h-[40px] px-3 py-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer ${
                            flagged
                              ? 'bg-rose-950/90 border-rose-400 text-rose-100'
                              : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          <span className="truncate">{topic.title}</span>
                          <Flag
                            className={`w-3.5 h-3.5 shrink-0 ${
                              flagged ? 'text-amber-300' : 'text-slate-500'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-300 font-semibold tabular-nums">
                  {needsImprovementData.cards.length > 0
                    ? `${needsImprovementData.cards.length} weak-spot flashcards ready for rapid-fire review`
                    : '0 flashcards selected — flag at least 1 world or doctrine above'}
                </span>
                <button
                  type="button"
                  data-testid="start-flagged-review-session-btn"
                  disabled={needsImprovementData.cards.length === 0}
                  onClick={launchReviewSessionQuiz}
                  className={`min-h-[44px] px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm border-2 border-black inline-flex items-center gap-2 ${
                    needsImprovementData.cards.length > 0
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_3px_0_#000] cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Flame className="w-4 h-4 shrink-0" />
                  <span>Start 3-Minute Rapid-Fire Quiz</span>
                </button>
              </div>
            </div>
          )}

          {/* State 2: Active Rapid-Fire Question */}
          {isReviewRunning && reviewQuestions[reviewIndex] && (
            <div className="bg-white text-slate-950 rounded-2xl border-3 border-black p-4 sm:p-6 space-y-4">
              {isReviewPaused ? (
                <div className="py-8 text-center space-y-3">
                  <Pause className="w-10 h-10 text-amber-500 mx-auto" />
                  <h4 className="text-xl font-black font-display">Review Session Paused</h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                    Your 3-minute rapid-fire timer is paused at {formatPomodoroSeconds(reviewSecondsLeft)}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReviewPaused(false);
                      marioAudio.playPowerUp();
                    }}
                    className="min-h-[44px] px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black cursor-pointer"
                  >
                    Resume Rapid-Fire Quiz
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-600 border-b border-slate-200 pb-2.5">
                    <span>
                      {reviewQuestions[reviewIndex].card.world} · {reviewQuestions[reviewIndex].card.difficulty}
                    </span>
                    <span className="tabular-nums font-mono text-slate-800">
                      Prompt #{reviewAnsweredCount + (reviewPickedIdx === null ? 1 : 0)} · Pool of{' '}
                      {reviewQuestions.length}
                    </span>
                  </div>

                  <h4 className={`${bodyTextClass} font-black text-slate-950 leading-snug`}>
                    {reviewQuestions[reviewIndex].card.question}
                  </h4>

                  <div className="space-y-2">
                    {reviewQuestions[reviewIndex].choices.map((choice, idx) => {
                      const answered = reviewPickedIdx !== null;
                      const isPicked = reviewPickedIdx === idx;
                      let optionStyle =
                        'bg-slate-50 hover:bg-amber-50 border-slate-800 text-slate-950';
                      if (answered) {
                        if (choice.isCorrect) {
                          optionStyle =
                            'bg-emerald-100 border-emerald-700 text-emerald-950 ring-2 ring-emerald-500';
                        } else if (isPicked) {
                          optionStyle = 'bg-rose-100 border-rose-600 text-rose-950';
                        } else {
                          optionStyle = 'bg-slate-100 border-slate-300 text-slate-500';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={answered}
                          data-testid={`review-choice-${idx}`}
                          onClick={() => handlePickReviewChoice(idx)}
                          className={`w-full min-h-[46px] p-3 rounded-xl border-2 text-left flex items-start gap-2.5 transition-colors cursor-pointer ${optionStyle}`}
                        >
                          <span className="w-6 h-6 rounded-md bg-slate-950 text-amber-300 text-xs font-black font-mono flex items-center justify-center shrink-0 mt-0.5">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-xs sm:text-sm font-bold leading-snug flex-1">
                            {choice.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {reviewPickedIdx !== null && (
                    <div className="bg-slate-900 text-white rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs leading-relaxed">
                        <span className="font-black text-amber-300 block">
                          {reviewPickedIdx === reviewQuestions[reviewIndex].correctIndex
                            ? 'Correct (+2 Coins)'
                            : 'Statutory Rule'}
                        </span>
                        <span className="text-slate-200">
                          {reviewQuestions[reviewIndex].card.answer}
                        </span>
                      </div>
                      <button
                        type="button"
                        data-testid="review-next-question-btn"
                        onClick={advanceReviewQuestion}
                        className="min-h-[42px] px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black text-xs inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <span>Next Prompt</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <span className="text-slate-500 font-semibold">
                      {needsImprovementData.sourceSummary}
                    </span>
                    <button
                      type="button"
                      onClick={() => finishReviewSession(true)}
                      className="text-rose-700 hover:text-rose-900 font-black cursor-pointer"
                    >
                      Finish Session Early
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* State 3: Review Session Completed Summary */}
          {isReviewFinished && (
            <div
              data-testid="review-session-summary"
              className="bg-slate-900 rounded-2xl border-2 border-amber-400 p-6 text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black mx-auto flex items-center justify-center">
                <MarioStarIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-black text-white font-display">
                  Weak-Spot Drill Complete
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 font-semibold tabular-nums">
                  Correct Answers: {reviewCorrectCount} / {reviewAnsweredCount} · Best Streak:{' '}
                  {reviewBestStreak}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={launchReviewSessionQuiz}
                  className="min-h-[44px] px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Restart 3-Minute Review</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExportWeakPdfOpen(true);
                    marioAudio.playClick();
                  }}
                  className="min-h-[44px] px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl border-2 border-black text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-rose-600" />
                  <span>Export Weak Cards PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReviewSessionOpen(false);
                    setIsReviewFinished(false);
                  }}
                  className="min-h-[44px] px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-600 text-xs sm:text-sm cursor-pointer"
                >
                  Return to Deck
                </button>
              </div>
            </div>
          )}
        </section>
      ) : isQuickStudyMode && quickStudyFinished ? (
        <div
          data-testid="quick-study-complete-card"
          className="bg-white rounded-3xl mario-card border-4 border-slate-950 p-6 sm:p-8 text-center space-y-5"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-400 border-3 border-black mx-auto flex items-center justify-center shadow-[0_4px_0_#000]">
            <MarioStarIcon className="w-9 h-9" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-black uppercase text-emerald-700 font-mario block">
              5-MINUTE QUICK STUDY SPRINT COMPLETE
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 font-display">
              WEAK-SPOT DECK CLEARED!
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-600 max-w-lg mx-auto">
              You reviewed {quickStudyDeck.length} targeted flashcards ({quickStudyReviewedCount} mastered during this sprint) and earned +20 bonus coins!
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={startQuickStudySprint}
              className="min-h-[46px] px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span>Start Another 5-Min Sprint</span>
            </button>
            <button
              type="button"
              onClick={exitQuickStudyMode}
              className="min-h-[46px] px-6 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
            >
              <span>Return to All Flashcards</span>
            </button>
          </div>
        </div>
      ) : activeCard ? (
        <div className="space-y-4">
          <div
            onClick={studyDifficulty === 'casual' || isFlipped ? handleFlip : undefined}
            data-testid="flashcard-surface"
            className={`${
              studyDifficulty === 'casual' || isFlipped ? 'cursor-pointer' : ''
            } transition-all duration-200 rounded-3xl p-4 sm:p-7 md:p-9 min-h-[300px] sm:min-h-[340px] flex flex-col justify-between border-4 border-slate-950 mario-card select-none ${
              isFlipped ? 'bg-white' : 'mario-box'
            }`}
          >
            {/* Top Metadata Bar */}
            <div className="flex items-center justify-between border-b-2 border-slate-900/20 pb-3 gap-2 flex-wrap text-xs font-bold text-slate-900">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-slate-950">{activeCard.world}</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-700">{activeCard.difficulty}</span>
              </div>

              <div className="flex items-center gap-2 font-black text-xs text-slate-900 tabular-nums">
                <span className="font-mario text-[10px]">
                  Card {currentIndex + 1}/{filteredCards.length}
                </span>
                {masteredIds.has(activeCard.id) && (
                  <span className="text-emerald-800 inline-flex items-center gap-1 font-bold text-xs">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" /> Mastered
                  </span>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="py-5 sm:py-7 space-y-4">
              {!isFlipped ? (
                studyDifficulty === 'casual' ? (
                  /* CASUAL MODE: Clean Definition Flip Card */
                  <div className="space-y-4 max-w-2xl mx-auto text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/70 border-3 border-black rounded-2xl mx-auto flex items-center justify-center text-2xl font-black text-slate-950 shadow-[0_3px_0_#000]">
                      ?
                    </div>
                    <span className="text-[10px] font-black uppercase font-mario text-emerald-900 block">
                      CORE DEFINITION &amp; THRESHOLD
                    </span>
                    <h3 className={`${bodyTextClass} font-black text-slate-950 leading-relaxed px-1`}>
                      &ldquo;{activeCard.question}&rdquo;
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-amber-300 rounded-xl font-black text-[11px] uppercase font-mario shadow-sm">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>TAP TO FLIP DEFINITION</span>
                    </div>
                  </div>
                ) : (
                  /* EXAM PREP MODE: Harder 4-Option Multiple Choice Challenge */
                  <div className="space-y-4 max-w-2xl mx-auto">
                    <div className="text-center space-y-1.5">
                      <span className="text-[10px] font-black uppercase font-mario text-red-800 block">
                        EXAM PREP MULTIPLE-CHOICE CHALLENGE
                      </span>
                      <h3 className={`${bodyTextClass} font-black text-slate-950 leading-snug`}>
                        &ldquo;{activeCard.question}&rdquo;
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {examChoices.map((choice, cIdx) => {
                        const isPicked = selectedMcqIdx === cIdx;
                        const answered = selectedMcqIdx !== null;
                        let btnStyle =
                          'bg-white/95 hover:bg-white border-slate-900 text-slate-950';
                        if (answered) {
                          if (choice.isCorrect) {
                            btnStyle =
                              'bg-emerald-100 border-emerald-700 text-emerald-950 ring-2 ring-emerald-500';
                          } else if (isPicked) {
                            btnStyle = 'bg-rose-100 border-rose-600 text-rose-950';
                          } else {
                            btnStyle = 'bg-white/60 border-slate-400 text-slate-600';
                          }
                        }

                        return (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={(e) => handleSelectMcqOption(cIdx, e)}
                            disabled={answered}
                            className={`w-full min-h-[48px] text-left p-3 rounded-xl border-2 transition-all flex items-start gap-2.5 cursor-pointer ${btnStyle}`}
                          >
                            <span className="inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-md bg-slate-950 text-amber-300 text-xs font-black font-mario mt-0.5">
                              {String.fromCharCode(65 + cIdx)}
                            </span>
                            <span className="text-xs sm:text-sm font-bold leading-snug flex-1">
                              {choice.text}
                            </span>
                            {answered && choice.isCorrect && (
                              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                            )}
                            {answered && isPicked && !choice.isCorrect && (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-center pt-1">
                      <button
                        type="button"
                        onClick={handleFlip}
                        className="min-h-[44px] px-4 inline-flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-amber-300 rounded-xl font-black text-xs uppercase font-mario cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5 shrink-0" />
                        <span>Reveal Full Doctrine</span>
                      </button>
                    </div>
                  </div>
                )
              ) : (
                /* REVEALED BACK OF FLASHCARD */
                <div className="space-y-4 text-left bg-slate-50 p-4 sm:p-6 rounded-2xl border-3 border-emerald-600 shadow-sm">
                  <div className="bg-amber-100/90 border-2 border-amber-400 rounded-xl p-3 sm:p-4 flex items-start gap-2.5">
                    <MarioStarIcon className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-900 block font-mario">
                        CORE DEFINITION / TAKEAWAY:
                      </span>
                      <p className="text-sm sm:text-base font-black text-slate-950 mt-0.5">
                        {activeCard.keyTakeaway}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-900 font-black text-xs uppercase font-mario">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>COMPLETE STATUTORY PROVISION:</span>
                    </div>
                    <p className={`${bodyTextClass} font-bold text-slate-900 leading-relaxed`}>
                      {activeCard.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Bar: Quick Hint */}
            <div className="flex items-center justify-between border-t-2 border-slate-900/20 pt-3 text-xs font-bold text-slate-800 gap-2 flex-wrap">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip();
                }}
                className="min-h-[44px] inline-flex items-center gap-1 text-slate-900 font-black cursor-pointer hover:underline"
              >
                <RotateCw className="w-3.5 h-3.5 shrink-0" />
                <span>{isFlipped ? 'Flip back to prompt' : 'Flip card'}</span>
              </button>
              <span className="inline-flex items-center gap-1 text-amber-900 font-black">
                <MarioCoinIcon className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {studyDifficulty === 'exam_prep' ? '+2c Correct MCQ · +1c Mastered' : '+1 Coin on Mastery'}
                </span>
              </span>
            </div>
          </div>

          {/* Navigation Controls - Ergonomic 44px+ Mobile Targets with Always-Accessible Shuffle */}
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2.5 pt-1">
            <button
              type="button"
              onClick={handlePrev}
              className="min-h-[46px] px-3 sm:px-5 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 text-xs sm:text-sm cursor-pointer leading-none whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Prev</span>
            </button>

            <button
              type="button"
              data-testid="flashcards-bottom-shuffle-btn"
              onClick={handleShuffle}
              aria-label="Shuffle current deck order"
              title="Randomize the order of the current deck"
              className={`min-h-[46px] px-3 sm:px-5 inline-flex items-center justify-center gap-1.5 font-black rounded-xl border-3 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 text-xs sm:text-sm cursor-pointer leading-none whitespace-nowrap transition-colors ${
                justShuffled
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Shuffle
                className={`w-4 h-4 shrink-0 ${
                  justShuffled ? 'text-slate-950' : 'text-amber-300'
                }`}
              />
              <span>{justShuffled ? 'Shuffled!' : 'Shuffle'}</span>
            </button>

            <button
              type="button"
              onClick={handleMastered}
              className="min-h-[46px] px-3 sm:px-6 inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 text-xs sm:text-sm cursor-pointer leading-none whitespace-nowrap"
            >
              <CheckCircle className="w-4 h-4 text-emerald-800 shrink-0" />
              <span className="truncate">Mastered (+1c)</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="min-h-[46px] px-3 sm:px-5 inline-flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl border-3 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 text-xs sm:text-sm cursor-pointer leading-none whitespace-nowrap"
            >
              <span>{isQuickStudyMode && currentIndex === filteredCards.length - 1 ? 'Finish' : 'Next'}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-white rounded-2xl border-4 border-slate-900">
          <p className="font-bold text-slate-700 text-lg">No cards available in this category.</p>
        </div>
      )}

      {/* Printable & Downloadable 'Needs Improvement' Flashcards PDF Modal */}
      {isExportWeakPdfOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Export Needs Improvement Flashcards to PDF"
            data-testid="weak-flashcards-pdf-modal"
            className="fixed inset-0 z-[80] bg-slate-950/85 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            onClick={() => setIsExportWeakPdfOpen(false)}
          >
            <div
              className="bg-white text-slate-950 w-[96vw] max-w-6xl rounded-3xl border-4 border-black shadow-[8px_8px_0_#000] max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Modal Header */}
            <div className="weak-pdf-modal-chrome print:hidden bg-slate-950 text-white px-4 sm:px-5 py-4 flex items-center justify-between gap-3 border-b-2 border-black shrink-0">
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-amber-300 block">
                  Offline Study Reviewer · Direct PDF Download
                </span>
                <h3 className="text-base sm:text-xl font-black font-display truncate">
                  Needs Improvement Flashcards ({needsImprovementData.cards.length} Cards)
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close PDF Export Modal"
                onClick={() => setIsExportWeakPdfOpen(false)}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Toolbar */}
            <div className="weak-pdf-modal-chrome print:hidden bg-slate-100 px-4 sm:px-5 py-3.5 border-b border-slate-300 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs font-semibold text-slate-700">
                {needsImprovementData.hasFlaggedItems
                  ? needsImprovementData.sourceSummary
                  : 'Flag one or more weak worlds below to populate your offline PDF study packet.'}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-testid="download-weak-flashcards-pdf-file-btn"
                  disabled={needsImprovementData.cards.length === 0}
                  onClick={handleDownloadWeakPdf}
                  className={`min-h-[44px] px-4 py-2 rounded-xl font-black text-xs border-2 border-black inline-flex items-center gap-1.5 whitespace-nowrap ${
                    needsImprovementData.cards.length > 0
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_2px_0_#000] cursor-pointer'
                      : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                  }`}
                >
                  <FileDown className="w-4 h-4 shrink-0" />
                  <span>{pdfDownloadedNotice ? 'PDF Downloaded (.pdf)' : 'Download Weak Cards PDF (.pdf)'}</span>
                </button>
              </div>
            </div>

            {/* Quick World Filter Toggles */}
            {onToggleNeedsImprovementWorld && (
              <div className="weak-pdf-modal-chrome print:hidden px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-1.5 shrink-0">
                <span className="text-xs font-bold text-slate-600 mr-1">
                  Included Weak Worlds:
                </span>
                {WEAK_WORLD_OPTIONS.map((wOpt) => {
                  const active = Boolean(
                    profileStats?.needsImprovementWorlds?.includes(wOpt.id)
                  );
                  return (
                    <button
                      key={wOpt.id}
                      type="button"
                      onClick={() => {
                        onToggleNeedsImprovementWorld(wOpt.id);
                        marioAudio.playClick();
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                        active
                          ? 'bg-rose-600 text-white border-rose-800'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {wOpt.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Printable Study Sheet Preview */}
            <div className="p-5 overflow-y-auto print:overflow-visible print:p-0 flex-1 bg-white">
              {needsImprovementData.cards.length === 0 ? (
                <div className="text-center py-12 space-y-2 border-2 border-dashed border-slate-300 rounded-2xl p-6">
                  <Flag className="w-8 h-8 text-rose-500 mx-auto" />
                  <h4 className="text-base font-black text-slate-900">
                    No Flashcards Flagged as Needs Improvement Yet
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Select any world button above (or flag individual topics in the Modules view) to generate your printable and downloadable PDF flashcard reviewer.
                  </p>
                </div>
              ) : (
                <div
                  id="printable-weak-flashcards-sheet"
                  data-testid="printable-weak-flashcards-sheet"
                  className="space-y-3"
                >
                  <div className="border-b-2 border-slate-900 pb-3 mb-4">
                    <h2 className="text-lg font-black text-slate-950">
                      Philippine Labor Standards — Needs Improvement Flashcards Reviewer
                    </h2>
                    <p className="text-xs text-slate-600 font-semibold">
                      Scholar: {profileStats?.playerName || 'Counsel Hero'} · {needsImprovementData.cards.length} Targeted Flashcards · Offline Study Sheet
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {needsImprovementData.cards.map((card, idx) => (
                      <article
                        key={card.id}
                        className="weak-flashcard-print-item rounded-xl border border-slate-300 p-3.5 bg-slate-50/70 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-600 border-b border-slate-200 pb-1.5">
                          <span className="text-slate-900">
                            #{idx + 1} · {card.world}
                          </span>
                          <span>{card.difficulty}</span>
                        </div>
                        <p className="text-xs sm:text-sm font-black text-slate-950 leading-snug">
                          Q: {card.question}
                        </p>
                        <p className="text-xs font-bold text-emerald-900 leading-snug">
                          Core Takeaway: {card.keyTakeaway}
                        </p>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {card.answer}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
