import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Zap, Crown, Award, Medal, Sparkles } from 'lucide-react';
import { MarioStarIcon, MarioCharacterAvatar } from './MarioIcons';
import { MarioAvatar } from '../types/laborLaw';

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: MarioAvatar;
  category: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeSeconds: number;
  dateStr: string;
  isUser?: boolean;
}

interface QuizResultsLeaderboardProps {
  categoryKey: string;
  categoryTitle: string;
  currentUserScore?: {
    correct: number;
    total: number;
    timeSeconds: number;
  };
  equippedAvatar?: MarioAvatar;
  playerName?: string;
}

const DEFAULT_SIMULATED_FINISHERS: Record<string, Omit<LeaderboardEntry, 'id' | 'category'>[]> = {
  default: [
    {
      name: 'Atty. Mario Bros',
      avatar: 'mario',
      score: 5,
      totalQuestions: 5,
      accuracy: 100,
      timeSeconds: 43,
      dateStr: 'Today',
    },
    {
      name: 'Princess Peach, LL.B',
      avatar: 'peach',
      score: 5,
      totalQuestions: 5,
      accuracy: 100,
      timeSeconds: 52,
      dateStr: 'Today',
    },
    {
      name: 'Toad (Bar Topnotcher)',
      avatar: 'toad',
      score: 5,
      totalQuestions: 5,
      accuracy: 100,
      timeSeconds: 61,
      dateStr: 'Yesterday',
    },
    {
      name: 'Luigi (Labor Advocate)',
      avatar: 'luigi',
      score: 4,
      totalQuestions: 5,
      accuracy: 80,
      timeSeconds: 68,
      dateStr: '2d ago',
    },
    {
      name: 'Yoshi Dino Juris',
      avatar: 'yoshi',
      score: 4,
      totalQuestions: 5,
      accuracy: 80,
      timeSeconds: 74,
      dateStr: '3d ago',
    },
  ],
};

function formatSecondsToTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const QuizResultsLeaderboard: React.FC<QuizResultsLeaderboardProps> = ({
  categoryKey,
  categoryTitle,
  currentUserScore,
  equippedAvatar = 'mario',
  playerName = 'Examinee',
}) => {
  const storageKey = `mario_quiz_leaderboard_${categoryKey}`;

  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }

    const defaultSeed = DEFAULT_SIMULATED_FINISHERS.default;
    return defaultSeed.map((item, idx) => ({
      ...item,
      id: `seed-${idx}`,
      category: categoryKey,
    }));
  });

  const [hasRecordedUser, setHasRecordedUser] = useState(false);

  // Automatically record current user run if passed
  useEffect(() => {
    if (!currentUserScore || hasRecordedUser || typeof window === 'undefined') return;

    const userAccuracy = Math.round(
      (currentUserScore.correct / Math.max(1, currentUserScore.total)) * 100
    );

    const userEntry: LeaderboardEntry = {
      id: `user-${Date.now()}`,
      name: playerName || 'You (Bar Candidate)',
      avatar: equippedAvatar,
      category: categoryKey,
      score: currentUserScore.correct,
      totalQuestions: currentUserScore.total,
      accuracy: userAccuracy,
      timeSeconds: Math.max(8, currentUserScore.timeSeconds),
      dateStr: 'Just now',
      isUser: true,
    };

    setEntries((prev) => {
      // Combine, sort by accuracy desc, then timeSeconds asc
      const combined = [...prev.filter((e) => !e.isUser), userEntry];
      combined.sort((a, b) => {
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return a.timeSeconds - b.timeSeconds;
      });
      const top5 = combined.slice(0, 5);

      try {
        localStorage.setItem(storageKey, JSON.stringify(top5));
      } catch {
        // ignore
      }
      return top5;
    });

    setHasRecordedUser(true);
  }, [currentUserScore, hasRecordedUser, categoryKey, equippedAvatar, playerName, storageKey]);

  return (
    <div
      data-testid="quiz-results-leaderboard"
      className="bg-slate-900 border-3 border-amber-400 rounded-3xl p-4 sm:p-6 text-white space-y-4 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-700 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black border-2 border-black shadow-[0_2px_0_#000] shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-amber-400 font-mario">
                LEADERBOARD
              </span>
              <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded font-mario">
                TOP 5 FASTEST
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-white font-display">
              {categoryTitle} Gauntlet Records
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-amber-300 font-bold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5" />
          <span>Ranked by Accuracy &amp; Speed</span>
        </div>
      </div>

      {/* Leaderboard Table / Rows */}
      <div className="space-y-2">
        {entries.map((entry, idx) => {
          const rank = idx + 1;
          const isTop1 = rank === 1;
          const isTop2 = rank === 2;
          const isTop3 = rank === 3;

          let rankBadgeBg = 'bg-slate-800 text-slate-300';
          let borderHighlight = 'border-slate-800 bg-slate-950/80';

          if (isTop1) {
            rankBadgeBg = 'bg-amber-400 text-slate-950 border border-black shadow-[0_1px_0_#000] font-black';
            borderHighlight = 'border-amber-400/80 bg-amber-950/30';
          } else if (isTop2) {
            rankBadgeBg = 'bg-slate-300 text-slate-950 border border-black font-black';
            borderHighlight = 'border-slate-400/60 bg-slate-800/40';
          } else if (isTop3) {
            rankBadgeBg = 'bg-amber-700 text-white border border-black font-black';
            borderHighlight = 'border-amber-700/60 bg-amber-950/20';
          }

          if (entry.isUser) {
            borderHighlight = 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-400';
          }

          return (
            <div
              key={entry.id}
              className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${borderHighlight}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black font-mario shrink-0 ${rankBadgeBg}`}
                >
                  {isTop1 ? <Crown className="w-4 h-4" /> : rank}
                </div>

                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center shrink-0">
                  <MarioCharacterAvatar character={entry.avatar} className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-black text-white truncate">
                      {entry.name}
                    </span>
                    {entry.isUser && (
                      <span className="text-[9px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.2 rounded font-mario shrink-0">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {entry.score}/{entry.totalQuestions} ({entry.accuracy}%) · {entry.dateStr}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 tabular-nums">
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black text-amber-300 font-mono flex items-center gap-1 justify-end">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    {formatSecondsToTime(entry.timeSeconds)}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold block">
                    {entry.accuracy === 100 ? 'Flawless' : `${entry.accuracy}% Pass`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
