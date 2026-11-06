import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flashcard, LawTopic } from '../types/laborLaw';
import { FLASHCARDS_DATA } from '../data/flashcardsData';
import { PRACTICE_QUESTIONS } from '../data/quizQuestionsData';
import { ALL_LAW_TOPICS } from '../data/laborLawData';
import {
  buildTopicFlashcards,
  generateTopicQuickQuiz,
  TopicMiniQuizQuestion,
  FlashcardMasteryTier,
  FLASHCARD_MASTERY_META,
  loadFlashcardMasteryTiers,
  saveFlashcardMasteryTiers,
} from '../utils/round9Features';
import {
  MarioCoinIcon,
  MarioStarIcon,
  MarioMushroomIcon,
  MarioFireFlowerIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';
import { SaveSingleQuizErrorButton } from './SaveSingleQuizErrorButton';
import {
  X,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  BookOpen,
  Trophy,
  Shuffle,
} from 'lucide-react';

// ============================================================================
// 1. TOPIC COMPLETION CIRCLE (WITH CELEBRATORY FILL & BURST ANIMATION)
// ============================================================================

interface TopicCompletionCircleProps {
  completedSections: number;
  totalSections: number;
  percent: number;
  isTopicCompleted: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const TopicCompletionCircle: React.FC<TopicCompletionCircleProps> = ({
  completedSections,
  totalSections,
  percent,
  isTopicCompleted,
  onClick,
}) => {
  const size = 44;
  const strokeWidth = 4.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.max(0, Math.min(100, percent));
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  const isComplete = isTopicCompleted || safePercent >= 100;

  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      data-testid="topic-completion-circle"
      aria-label={`Section mastery ${completedSections} of ${totalSections} sections (${safePercent}%)`}
      title={`Sub-section Mastery: ${completedSections}/${totalSections} (${safePercent}%) — Click to mark topic complete`}
      initial={false}
      animate={
        isComplete
          ? { scale: [1, 1.16, 1], rotate: [0, 8, -6, 0] }
          : { scale: 1, rotate: 0 }
      }
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`relative inline-flex items-center justify-center w-11 h-11 rounded-full shrink-0 cursor-pointer select-none transition-colors ${
        isComplete
          ? 'bg-emerald-950/95 ring-2 ring-amber-300 shadow-[0_2px_0_#000]'
          : 'bg-slate-950/90 ring-1 ring-slate-700 hover:ring-amber-400 shadow-[0_2px_0_#000]'
      }`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.25)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? '#34d399' : safePercent >= 50 ? '#fbbf24' : '#38bdf8'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      </svg>

      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        {isComplete ? (
          <MarioStarIcon className="w-4 h-4 drop-shadow-xs" />
        ) : (
          <span className="text-[9.5px] font-black font-mono tabular-nums text-white">
            {completedSections}/{totalSections}
          </span>
        )}
      </span>

      <AnimatePresence>
        {isComplete && (
          <motion.span
            key="burst-ring"
            initial={{ opacity: 0.9, scale: 0.85 }}
            animate={{ opacity: 0, scale: 1.45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-amber-300"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ============================================================================
// 2. WORLD GOAL PROGRESS RING (BESIDE WORLD TITLES IN MAP & MODULES)
// ============================================================================

interface WorldGoalRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  lightSurface?: boolean;
  showLabel?: boolean;
}

export const WorldGoalRing: React.FC<WorldGoalRingProps> = ({
  percent,
  size = 28,
  strokeWidth = 3.2,
  lightSurface = false,
  showLabel = true,
}) => {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePercent / 100) * circumference;
  const isDone = safePercent >= 100;

  return (
    <span
      data-testid="world-goal-ring"
      title={`World Goal: ${safePercent}% Mastered`}
      className="inline-flex items-center justify-center relative shrink-0 select-none"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={lightSurface ? 'rgba(15, 23, 42, 0.16)' : 'rgba(255, 255, 255, 0.2)'}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isDone ? '#10b981' : '#fbbf24'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300"
        />
      </svg>
      {showLabel && (
        <span
          className={`absolute inset-0 flex items-center justify-center text-[7.5px] font-black font-mono tabular-nums leading-none ${
            lightSurface ? 'text-slate-900' : 'text-amber-200'
          }`}
        >
          {safePercent}%
        </span>
      )}
    </span>
  );
};

// ============================================================================
// 3. TOPIC CARD DEDICATED 'FLASHCARD MODE' MODAL
// ============================================================================

interface TopicFlashcardDeckModalProps {
  topic: LawTopic | null;
  onClose: () => void;
  onEarnCoin?: () => void;
}

export const TopicFlashcardDeckModal: React.FC<TopicFlashcardDeckModalProps> = ({
  topic,
  onClose,
  onEarnCoin,
}) => {
  const deck: Flashcard[] = useMemo(() => {
    if (!topic) return [];
    return buildTopicFlashcards(topic, FLASHCARDS_DATA);
  }, [topic]);

  const [cards, setCards] = useState<Flashcard[]>(deck);
  const [idx, setIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteryTiers, setMasteryTiers] = useState<Record<string, FlashcardMasteryTier>>(() =>
    typeof window !== 'undefined' ? loadFlashcardMasteryTiers(window.localStorage) : {}
  );

  useEffect(() => {
    setCards(deck);
    setIdx(0);
    setIsFlipped(false);
  }, [deck]);

  useEffect(() => {
    if (!topic) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' || e.key === 'Enter') {
        if ((e.target as HTMLElement)?.tagName !== 'BUTTON') {
          e.preventDefault();
          setIsFlipped((f) => !f);
          marioAudio.playFlip();
        }
      }
      if (e.key === 'ArrowRight') {
        setIdx((i) => (cards.length > 0 ? (i + 1) % cards.length : 0));
        setIsFlipped(false);
      }
      if (e.key === 'ArrowLeft') {
        setIdx((i) => (cards.length > 0 ? (i - 1 + cards.length) % cards.length : 0));
        setIsFlipped(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [topic, cards.length, onClose]);

  if (!topic || cards.length === 0) return null;

  const activeCard = cards[Math.min(idx, cards.length - 1)];
  const currentTier: FlashcardMasteryTier = masteryTiers[activeCard.id] || 'learning';

  const handleSetTier = (tier: FlashcardMasteryTier) => {
    const prevTier = masteryTiers[activeCard.id];
    const next = { ...masteryTiers, [activeCard.id]: tier };
    setMasteryTiers(next);
    if (typeof window !== 'undefined') {
      saveFlashcardMasteryTiers(next, window.localStorage);
    }
    if (tier === 'mastered' && prevTier !== 'mastered') {
      marioAudio.playPowerUp();
      onEarnCoin?.();
    } else {
      marioAudio.playClick();
    }
  };

  const handleShuffleDeck = () => {
    const copy = [...cards];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setCards(copy);
    setIdx(0);
    setIsFlipped(false);
    marioAudio.playJump();
  };

  return (
    <div
      className="fixed inset-0 z-[130] bg-slate-950/85 p-2.5 sm:p-6 flex items-start sm:items-center justify-center overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label={`Flashcard Mode for ${topic.title}`}
      data-testid="topic-flashcard-mode-modal"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] flex flex-col bg-slate-900 text-white rounded-3xl border-4 border-black shadow-[8px_8px_0_#000] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 px-4 sm:px-6 py-4 border-b-2 border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Focused Topic Flashcard Deck</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-300 truncate">{topic.badge}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black font-display text-white truncate mt-0.5">
              {topic.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShuffleDeck}
              className="min-h-[40px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Shuffle</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Flashcard Mode"
              className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-800 hover:bg-rose-600 text-white border border-slate-600 inline-flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {/* Progress & Mastery Tier Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-black text-amber-300 font-mono tabular-nums">
              Card {idx + 1} of {cards.length}
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              {(
                [
                  { id: 'learning' as const, icon: <MarioMushroomIcon className="w-3.5 h-3.5" /> },
                  { id: 'reviewing' as const, icon: <MarioFireFlowerIcon className="w-3.5 h-3.5" /> },
                  { id: 'mastered' as const, icon: <MarioStarIcon className="w-3.5 h-3.5" /> },
                ]
              ).map((tierBtn) => {
                const meta = FLASHCARD_MASTERY_META[tierBtn.id];
                const active = currentTier === tierBtn.id;
                return (
                  <button
                    key={tierBtn.id}
                    type="button"
                    onClick={() => handleSetTier(tierBtn.id)}
                    className={`min-h-[34px] px-2.5 rounded-lg border text-[11px] font-black inline-flex items-center gap-1 cursor-pointer transition-all ${
                      active
                        ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    {tierBtn.icon}
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Flip Card */}
          <button
            type="button"
            onClick={() => {
              setIsFlipped((f) => !f);
              marioAudio.playFlip();
            }}
            data-testid="topic-flashcard-flip-card"
            className={`w-full min-h-[230px] sm:min-h-[250px] rounded-2xl border-3 border-black p-5 sm:p-7 text-left flex flex-col justify-between transition-colors cursor-pointer ${
              isFlipped ? 'bg-white text-slate-950' : 'mario-box text-slate-950'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold opacity-80">
              <span>{isFlipped ? 'STATUTORY ANSWER & RULE' : 'PROMPT — TAP TO FLIP'}</span>
              <span>{activeCard.difficulty}</span>
            </div>

            <div className="my-4 space-y-3">
              {!isFlipped ? (
                <p className="text-base sm:text-lg font-black leading-relaxed text-slate-950">
                  {activeCard.question}
                </p>
              ) : (
                <>
                  <p className="text-sm sm:text-base font-extrabold leading-relaxed text-slate-900">
                    {activeCard.answer}
                  </p>
                  {activeCard.keyTakeaway && (
                    <div className="p-3 rounded-xl bg-amber-100 border border-amber-400 text-xs font-bold text-slate-950">
                      <strong className="font-black">Key Takeaway: </strong>
                      {activeCard.keyTakeaway}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-black pt-2 border-t border-slate-900/15">
              <span className="inline-flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5" />
                <span>{isFlipped ? 'Show Question' : 'Reveal Doctrine'}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-amber-900">
                <MarioCoinIcon className="w-3.5 h-3.5" />
                <span>+1c when marked Mastered</span>
              </span>
            </div>
          </button>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setIdx((i) => (i - 1 + cards.length) % cards.length);
                setIsFlipped(false);
                marioAudio.playClick();
              }}
              className="min-h-[44px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs border-2 border-black inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleSetTier('mastered');
                setIdx((i) => (i + 1) % cards.length);
                setIsFlipped(false);
              }}
              className="min-h-[44px] px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <MarioStarIcon className="w-4 h-4" />
              <span>Master &amp; Next</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIdx((i) => (i + 1) % cards.length);
                setIsFlipped(false);
                marioAudio.playClick();
              }}
              className="min-h-[44px] px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. TOPIC CARD 3-QUESTION 'QUICK QUIZ' MODAL (LOGGED TO BOSS BATTLE LOG)
// ============================================================================

interface TopicQuickQuizModalProps {
  topic: LawTopic | null;
  onClose: () => void;
  onCompleteQuickQuiz?: (result: {
    topic: LawTopic;
    score: number;
    totalQuestions: number;
    durationSeconds: number;
    missedPoints: string[];
    coinsEarned: number;
  }) => void;
}

export const TopicQuickQuizModal: React.FC<TopicQuickQuizModalProps> = ({
  topic,
  onClose,
  onCompleteQuickQuiz,
}) => {
  const [questions, setQuestions] = useState<TopicMiniQuizQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [pickedOption, setPickedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [missedPoints, setMissedPoints] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [startedAtMs, setStartedAtMs] = useState<number>(() => Date.now());
  const [wrongShake, setWrongShake] = useState(false);

  const startFresh = (targetTopic: LawTopic) => {
    const generated = generateTopicQuickQuiz({
      topic: targetTopic,
      questionPool: PRACTICE_QUESTIONS,
      allTopics: ALL_LAW_TOPICS,
    });
    setQuestions(generated);
    setQIdx(0);
    setPickedOption(null);
    setScore(0);
    setMissedPoints([]);
    setFinished(false);
    setStartedAtMs(Date.now());
  };

  useEffect(() => {
    if (topic) {
      startFresh(topic);
    }
  }, [topic]);

  if (!topic || questions.length === 0) return null;

  const currentQ = questions[Math.min(qIdx, questions.length - 1)];

  const handleSelectOption = (optIdx: number) => {
    if (pickedOption !== null) return;
    setPickedOption(optIdx);
    const isCorrect = optIdx === currentQ.correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
      marioAudio.playCoin();
    } else {
      setMissedPoints((prev) => [...prev, `${currentQ.legalBasis}: ${currentQ.options[currentQ.correctIndex]}`]);
      setWrongShake(true);
      window.setTimeout(() => setWrongShake(false), 450);
      marioAudio.playWrongAnswer();
    }
  };

  const handleNext = () => {
    if (qIdx + 1 < questions.length) {
      setQIdx((i) => i + 1);
      setPickedOption(null);
      marioAudio.playClick();
    } else {
      const elapsedSec = Math.max(1, Math.round((Date.now() - startedAtMs) / 1000));
      const coinsEarned = score * 5 + (score === questions.length ? 10 : 0);
      setFinished(true);
      if (score === questions.length) {
        marioAudio.playQuizComplete();
      } else {
        marioAudio.playPowerUp();
      }
      onCompleteQuickQuiz?.({
        topic,
        score,
        totalQuestions: questions.length,
        durationSeconds: elapsedSec,
        missedPoints,
        coinsEarned,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[130] bg-slate-950/85 p-2.5 sm:p-6 flex items-start sm:items-center justify-center overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick 3-Question Quiz for ${topic.title}`}
      data-testid="topic-quick-quiz-modal"
      onClick={onClose}
    >
      <motion.div
        animate={wrongShake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] flex flex-col bg-slate-900 text-white rounded-3xl border-4 border-black shadow-[8px_8px_0_#000] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 px-4 sm:px-6 py-4 border-b-2 border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>3-Question Topic Quick Quiz</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300 truncate">{topic.badge}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black font-display text-white truncate mt-0.5">
              {topic.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Quick Quiz"
            className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-800 hover:bg-rose-600 text-white border border-slate-600 inline-flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {!finished ? (
            <>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="font-mono text-amber-300 tabular-nums">
                  Question {qIdx + 1} / {questions.length}
                </span>
                <span className="tabular-nums">
                  Score: <strong className="text-emerald-300">{score}</strong> / {questions.length}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {questions.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`h-2 rounded-full ${
                      idx < qIdx
                        ? 'bg-emerald-400'
                        : idx === qIdx
                        ? 'bg-amber-400'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5">
                <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed">
                  {currentQ.prompt}
                </p>
              </div>

              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => {
                  const answered = pickedOption !== null;
                  const isPicked = pickedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  let tone = 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-slate-100';
                  if (answered) {
                    if (isCorrect) {
                      tone = 'bg-emerald-950/90 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400';
                    } else if (isPicked) {
                      tone = 'bg-rose-950/90 border-rose-500 text-rose-100';
                    } else {
                      tone = 'bg-slate-950/60 border-slate-800 text-slate-500';
                    }
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={answered}
                      data-testid={`topic-quick-quiz-opt-${idx}`}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full min-h-[48px] p-3.5 rounded-xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${tone}`}
                    >
                      <span className="w-6 h-6 rounded-md bg-black border border-slate-700 text-amber-300 font-black font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="w-full min-w-0 break-words [overflow-wrap:anywhere] whitespace-normal text-xs sm:text-sm font-bold leading-relaxed flex-1">
                        {opt}
                      </span>
                      {answered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {answered && isPicked && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {pickedOption !== null && (
                <div className="rounded-2xl bg-slate-950 border border-slate-700 p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black">
                    <span
                      className={
                        pickedOption === currentQ.correctIndex ? 'text-emerald-400' : 'text-rose-400'
                      }
                    >
                      {pickedOption === currentQ.correctIndex
                        ? 'Correct Ruling!'
                        : 'Review Statutory Rule'}
                    </span>
                    <span className="text-amber-300 font-mono">{currentQ.legalBasis}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{currentQ.explanation}</p>
                  <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                    {pickedOption !== currentQ.correctIndex ? (
                      <SaveSingleQuizErrorButton
                        testId="topic-quick-quiz-save-error-btn"
                        compact
                        darkSurface
                        errorItem={{
                          scenario: currentQ.prompt,
                          correctOptionText: currentQ.options[currentQ.correctIndex] || '',
                          chosenOptionText: currentQ.options[pickedOption] || '',
                          legalBasis: currentQ.legalBasis || topic.badge,
                          explanation: currentQ.explanation,
                          worldCode: topic.worldId,
                          quizModeLabel: 'Topic Quick Quiz',
                        }}
                      />
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      data-testid="topic-quick-quiz-next-btn"
                      onClick={handleNext}
                      className="min-h-[42px] px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>
                        {qIdx + 1 < questions.length ? 'Next Question' : 'Finish Quick Quiz'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-5 text-center space-y-4" data-testid="topic-quick-quiz-summary">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 border-3 border-black mx-auto flex items-center justify-center shadow-[0_4px_0_#000]">
                <Trophy className="w-8 h-8 text-slate-950" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-300 block">
                  Logged to Quick Quiz History
                </span>
                <h4 className="text-2xl font-black font-display text-white tabular-nums">
                  {score} / {questions.length} Correct ({Math.round((score / questions.length) * 100)}%)
                </h4>
                <p className="text-xs sm:text-sm font-bold text-amber-300 inline-flex items-center gap-1.5">
                  <MarioCoinIcon className="w-4 h-4" />
                  <span>
                    +{score * 5 + (score === questions.length ? 10 : 0)} Coins Awarded!
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => startFresh(topic)}
                  className="min-h-[44px] px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>New 3-Q Set</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
