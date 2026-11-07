import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Trophy,
  Crown,
  Search,
  Flame,
  BookOpen,
  Edit3,
  Check,
  Gamepad2,
  CheckCircle2,
} from 'lucide-react';
import { MarioAvatar } from '../types/laborLaw';
import {
  buildGlobalCoinLeaderboard,
  CoinLeaderboardEntry,
  MAIN_CREATOR_AUTHOR,
} from '../utils/engagementFeatures';
import { QuizHistoryRecord } from '../utils/profileAchievements';
import {
  computeQuizLeaderboardEntries,
  QuizLeaderboardEntry,
} from '../utils/round9Features';
import { MarioCharacterAvatar, MarioCoinIcon, MarioFireFlowerIcon } from './MarioIcons';
import { marioAudio } from '../utils/audio';
import { resolveUniversalCardFrame, type CardFrameId } from '../utils/round12Features';

interface CoinLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  onUpdatePlayerName?: (name: string) => void;
  equippedAvatar: MarioAvatar;
  equippedCardFrame?: CardFrameId;
  coins: number;
  streakDays: number;
  completedTopicsCount: number;
  activeWorldLabel?: string;
  quizHistory?: QuizHistoryRecord[];
  equippedCartridgeBadge?: string | null;
}

export const CoinLeaderboardModal: React.FC<CoinLeaderboardModalProps> = ({
  isOpen,
  onClose,
  playerName,
  onUpdatePlayerName,
  equippedAvatar,
  equippedCardFrame = 'frame_default',
  coins,
  streakDays,
  completedTopicsCount,
  activeWorldLabel = 'All 6 Worlds',
  quizHistory = [],
  equippedCartridgeBadge = null,
}) => {
  const [boardTab, setBoardTab] = useState<'coins' | 'quiz'>('coins');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(playerName);

  useEffect(() => {
    setDraftName(playerName);
  }, [playerName]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const rankedEntries: CoinLeaderboardEntry[] = useMemo(
    () =>
      buildGlobalCoinLeaderboard({
        currentUser: {
          studentName: playerName,
          avatar: equippedAvatar,
          totalCoins: coins,
          streakDays,
          modulesCompleted: completedTopicsCount,
          favoriteWorld: activeWorldLabel,
        },
      }),
    [playerName, equippedAvatar, coins, streakDays, completedTopicsCount, activeWorldLabel]
  );

  const quizRankedEntries: QuizLeaderboardEntry[] = useMemo(
    () =>
      computeQuizLeaderboardEntries({
        playerName,
        equippedAvatar,
        quizHistory,
        equippedCartridgeBadge,
      }),
    [playerName, equippedAvatar, quizHistory, equippedCartridgeBadge]
  );

  const visibleEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rankedEntries;
    return rankedEntries.filter(
      (entry) =>
        entry.studentName.toLowerCase().includes(q) ||
        entry.schoolOrSection.toLowerCase().includes(q) ||
        entry.favoriteWorld.toLowerCase().includes(q)
    );
  }, [rankedEntries, searchQuery]);

  const visibleQuizEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return quizRankedEntries;
    return quizRankedEntries.filter(
      (entry) =>
        entry.name.toLowerCase().includes(q) ||
        (entry.cartridgeBadge || '').toLowerCase().includes(q)
    );
  }, [quizRankedEntries, searchQuery]);

  if (!isOpen) return null;

  const currentUserEntry = rankedEntries.find((e) => e.isCurrentUser) || rankedEntries[0];
  const currentUserQuizEntry =
    quizRankedEntries.find((e) => e.isCurrentUser) || quizRankedEntries[0];
  const topThree = rankedEntries.slice(0, 3);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draftName.trim();
    if (cleaned && onUpdatePlayerName) {
      onUpdatePlayerName(cleaned);
    }
    setIsEditingName(false);
    marioAudio.playCoin();
  };

  return (
    <div
      role="dialog"
      aria-label="Global Coin & Quiz Leaderboard"
      data-testid="coin-leaderboard-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs select-none overflow-y-auto print:hidden"
    >
      <div className="bg-[#0f172a] text-white w-screen h-[100dvh] max-h-[100dvh] rounded-none border-0 sm:w-full sm:max-w-3xl sm:h-auto sm:max-h-[92vh] sm:rounded-3xl sm:border-4 sm:border-slate-950 shadow-[8px_8px_0_#000] overflow-hidden my-auto flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        {/* Header */}
        <div className="bg-slate-950 px-4 sm:px-6 py-4 border-b-2 border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center shadow-[0_3px_0_#000] shrink-0">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                {boardTab === 'coins' ? 'TOP STUDENT COIN EARNERS' : 'RANKED BY CORRECT ANSWERS'}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white font-display truncate">
                {boardTab === 'coins' ? 'GLOBAL COIN LEADERBOARD' : 'BAR QUIZ LEADERBOARD'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Global Coin Leaderboard"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher: Coin Vault vs Quiz Leaderboard */}
        <div className="px-3 sm:px-6 py-2.5 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              data-testid="leaderboard-tab-coins"
              onClick={() => {
                setBoardTab('coins');
                marioAudio.playClick();
              }}
              className={`min-h-[40px] px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors min-w-0 text-center leading-tight ${
                boardTab === 'coins'
                  ? 'bg-amber-400 text-slate-950 border border-black shadow-[0_2px_0_#000]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <MarioCoinIcon className="w-4 h-4 shrink-0" />
              <span className="truncate sm:whitespace-normal">Coin Vault Ranking</span>
            </button>
            <button
              type="button"
              data-testid="leaderboard-tab-quiz"
              onClick={() => {
                setBoardTab('quiz');
                marioAudio.playClick();
              }}
              className={`min-h-[40px] px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors min-w-0 text-center leading-tight ${
                boardTab === 'quiz'
                  ? 'bg-emerald-400 text-slate-950 border border-black shadow-[0_2px_0_#000]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="sm:hidden truncate">Quiz Leaderboard</span>
              <span className="hidden sm:inline truncate">Quiz Leaderboard (Correct)</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {boardTab === 'coins' ? (
            <>
              {/* Your Live Standing Banner */}
              {currentUserEntry && (
                <div
                  data-testid="leaderboard-user-standing"
                  className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 rounded-2xl p-4 border-2 border-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center font-black font-display text-lg tabular-nums shrink-0">
                      #{currentUserEntry.rank}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
                        YOUR LIVE STUDENT RANKING
                      </span>
                      {isEditingName ? (
                        <form onSubmit={handleSaveName} className="flex items-center gap-2 mt-1">
                          <label htmlFor="leaderboard-name-input" className="sr-only">
                            Student Display Name
                          </label>
                          <input
                            id="leaderboard-name-input"
                            type="text"
                            maxLength={32}
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            className="min-h-[40px] px-3 rounded-xl bg-slate-950 border border-amber-400 text-white text-sm font-bold w-44"
                          />
                          <button
                            type="submit"
                            className="min-h-[40px] px-3 rounded-xl bg-emerald-400 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base sm:text-lg font-black text-white truncate">
                            {currentUserEntry.studentName}
                          </span>
                          {equippedCartridgeBadge && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300">
                              <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
                              <span>{equippedCartridgeBadge}</span>
                            </span>
                          )}
                          {onUpdatePlayerName && (
                            <button
                              type="button"
                              onClick={() => setIsEditingName(true)}
                              aria-label="Edit Leaderboard Display Name"
                              className="min-h-[36px] min-w-[36px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 inline-flex items-center justify-center cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 tabular-nums">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Total Coins
                      </span>
                      <span className="text-xl font-black text-amber-300 inline-flex items-center gap-1">
                        <MarioCoinIcon className="w-5 h-5" />
                        <span>{currentUserEntry.totalCoins.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Top 3 Podium */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {topThree.map((leader, idx) => {
                  const medalStyles = [
                    'border-amber-400 bg-slate-900',
                    'border-slate-300 bg-slate-900/90',
                    'border-amber-700 bg-slate-900/85',
                  ];
                  const rankLabels = ['1st Place · Gold', '2nd Place · Silver', '3rd Place · Bronze'];
                  return (
                    <div
                      key={leader.id}
                      className={`rounded-2xl p-4 border-2 ${medalStyles[idx]} flex flex-col justify-between gap-2.5`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-amber-300 inline-flex items-center gap-1">
                          <Crown className="w-4 h-4 shrink-0" />
                          <span>{rankLabels[idx]}</span>
                        </span>
                        <span className="text-sm font-black text-amber-400 tabular-nums inline-flex items-center gap-1">
                          <MarioCoinIcon className="w-4 h-4" />
                          <span>{leader.totalCoins.toLocaleString()}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
                          <MarioCharacterAvatar
                            character={leader.avatar as MarioAvatar}
                            className="w-8 h-8"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-sm text-white truncate">
                            {leader.studentName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {leader.schoolOrSection}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <label htmlFor="leaderboard-search" className="sr-only">
                  Search students in leaderboard
                </label>
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="leaderboard-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student name, cohort, or favorite world..."
                  className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Sorted Student Leaderboard List */}
              <div
                data-testid="leaderboard-ranked-list"
                className="bg-slate-900 rounded-2xl border border-slate-800 divide-y divide-slate-800 overflow-hidden"
              >
                {visibleEntries.map((entry) => (
                  <div
                    key={entry.id}
                    data-testid={`leaderboard-row-${entry.id}`}
                    className={`p-3.5 sm:px-5 flex items-center justify-between gap-3 transition-colors ${
                      entry.isCurrentUser ? 'bg-amber-400/10' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-8 text-center font-black font-mono text-sm tabular-nums shrink-0 ${
                          entry.rank === 1
                            ? 'text-amber-300'
                            : entry.rank === 2
                            ? 'text-slate-200'
                            : entry.rank === 3
                            ? 'text-amber-600'
                            : 'text-slate-400'
                        }`}
                      >
                        #{entry.rank}
                      </span>

                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          entry.isCurrentUser && equippedCardFrame && equippedCardFrame !== 'frame_default'
                            ? resolveUniversalCardFrame(equippedCardFrame).borderClasses
                            : 'bg-slate-950 border border-slate-700'
                        }`}
                      >
                        <MarioCharacterAvatar
                          character={entry.avatar as MarioAvatar}
                          className="w-7 h-7"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-white truncate">
                            {entry.studentName}
                          </span>
                          {entry.isCurrentUser && (
                            <span className="text-[11px] font-bold text-amber-300">· You</span>
                          )}
                          {entry.isCurrentUser && equippedCartridgeBadge && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                              <Gamepad2 className="w-3 h-3 shrink-0" />
                              <span>{equippedCartridgeBadge}</span>
                            </span>
                          )}
                          {entry.isCreator && (
                            <span className="text-[11px] font-bold text-emerald-300">
                              · Main Creator
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <Flame className="w-3 h-3 text-orange-400 shrink-0" />
                            {entry.streakDays}d streak
                          </span>
                          {Math.floor(entry.streakDays / 5) > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-amber-300 tabular-nums">
                              <MarioFireFlowerIcon className="w-3.5 h-3.5" />
                              <span>x{Math.floor(entry.streakDays / 5)}</span>
                            </span>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <BookOpen className="w-3 h-3 text-sky-400 shrink-0" />
                            {entry.modulesCompleted} modules
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 tabular-nums">
                      <span className="inline-flex items-center gap-1.5 font-black text-base sm:text-lg text-amber-300">
                        <MarioCoinIcon className="w-4 h-4 shrink-0" />
                        <span>{entry.totalCoins.toLocaleString()}</span>
                      </span>
                      <span className="block text-[10px] text-slate-400">coins</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Quiz Leaderboard Standing Banner */}
              {currentUserQuizEntry && (
                <div
                  data-testid="quiz-leaderboard-user-standing"
                  className="bg-gradient-to-r from-emerald-500/20 via-slate-900 to-slate-900 rounded-2xl p-4 border-2 border-emerald-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-slate-950 border-2 border-black flex items-center justify-center font-black font-display text-lg tabular-nums shrink-0">
                      #{currentUserQuizEntry.rank}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase text-emerald-300 font-mario block">
                        YOUR QUIZ ACCURACY STANDING
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-white truncate">
                          {currentUserQuizEntry.name}
                        </span>
                        {currentUserQuizEntry.cartridgeBadge && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300">
                            <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{currentUserQuizEntry.cartridgeBadge}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 tabular-nums">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Accuracy
                      </span>
                      <span className="text-lg font-black text-amber-300">
                        {currentUserQuizEntry.accuracyPercent}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Correct Answers
                      </span>
                      <span className="text-xl font-black text-emerald-300">
                        {currentUserQuizEntry.correctAnswers.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Bar */}
              <div className="relative">
                <label htmlFor="quiz-leaderboard-search" className="sr-only">
                  Search quiz leaderboard
                </label>
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="quiz-leaderboard-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scholar name or vintage cartridge badge..."
                  className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Quiz Leaderboard Rows */}
              <div
                data-testid="quiz-leaderboard-ranked-list"
                className="bg-slate-900 rounded-2xl border border-slate-800 divide-y divide-slate-800 overflow-hidden"
              >
                {visibleQuizEntries.map((entry) => (
                  <div
                    key={entry.id}
                    data-testid={`quiz-leaderboard-row-${entry.id}`}
                    className={`p-3.5 sm:px-5 flex items-center justify-between gap-3 transition-colors ${
                      entry.isCurrentUser ? 'bg-emerald-400/10' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-8 text-center font-black font-mono text-sm tabular-nums shrink-0 ${
                          entry.rank === 1
                            ? 'text-amber-300'
                            : entry.rank === 2
                            ? 'text-slate-200'
                            : entry.rank === 3
                            ? 'text-amber-600'
                            : 'text-slate-400'
                        }`}
                      >
                        #{entry.rank}
                      </span>

                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
                        <MarioCharacterAvatar character={entry.avatar} className="w-7 h-7" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-white truncate">
                            {entry.name}
                          </span>
                          {entry.isCurrentUser && (
                            <span className="text-[11px] font-bold text-emerald-300">· You</span>
                          )}
                          {entry.cartridgeBadge && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300">
                              <Gamepad2 className="w-3 h-3 shrink-0" />
                              <span>{entry.cartridgeBadge}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap tabular-nums">
                          <span>{entry.quizzesCleared} quizzes completed</span>
                          <span aria-hidden="true">·</span>
                          <span>{entry.accuracyPercent}% accuracy</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 tabular-nums">
                      <span className="inline-flex items-center gap-1.5 font-black text-base sm:text-lg text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{entry.correctAnswers.toLocaleString()}</span>
                      </span>
                      <span className="block text-[10px] text-slate-400">correct answers</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="text-center text-xs text-slate-400 pt-1">
            {MAIN_CREATOR_AUTHOR.fullCredit}
          </div>
        </div>
      </div>
    </div>
  );
};

