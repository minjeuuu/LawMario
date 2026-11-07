import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  MarioCharacterAvatar,
  MarioMushroomIcon,
  MarioFireFlowerIcon,
  MarioStarIcon,
  MarioPipeIcon,
  MarioPeachCrownIcon,
  Mario1UpIcon,
  MarioCoinIcon,
  MarioBowserIcon,
  MarioFlagIcon,
  MarioQuestionBlockIcon,
} from './MarioIcons';
import { MarioAvatar } from '../types/laborLaw';
import { HERO_ROSTER, getHeroMeta } from '../data/heroesData';
import { ALL_LAW_TOPICS, WORLDS_METADATA } from '../data/laborLawData';
import {
  computeWorldProgressMap,
  SHORTCUT_MAP_HIGHLIGHTS,
  isShortcutKeyTopic,
} from '../utils/engagementFeatures';
import { computeFireFlowerStreakProgress } from '../utils/profileAchievements';
import {
  DAILY_CHALLENGE_BASE_COINS,
  DAILY_CHALLENGE_REVIEW_COINS,
  getDailyChallengeForDate,
  getNextDailyChallengeCountdown,
  loadDailyChallengeState,
  submitDailyChallengeAnswer,
} from '../data/dailyChallengesData';
import { marioAudio } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  Compass,
  Users,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Unlock,
  Lock,
  Sparkles,
  Award,
  Shuffle,
  Trophy,
  Zap,
  MapPin,
  Scale,
  Clock,
  XCircle,
  Pin,
  Trash2,
  Star,
  BookOpen,
} from 'lucide-react';
import { WorldGoalRing } from './TopicStudyModals';
import { PinnedRuleBookmark } from '../utils/round9Features';
import {
  getLocalDateKey,
  loadOrGenerateDailyMissions,
  claimDailyMissionReward,
  DailyMissionBundle,
  DAILY_MISSIONS_STORAGE_KEY,
  computeToadstoolQuestLog,
} from '../utils/round11Features';
import {
  filterFavoriteTopics,
  computeOwnedChambersAndRelicsSummary,
  hitMarioMysteryLawBlock,
} from '../utils/round12Features';

interface WorldMapProps {
  onSelectWorld: (worldId: string) => void;
  onSelectTopic?: (worldId: string, topicId: string) => void;
  activeWorld: string;
  fontSize: 'normal' | 'large' | 'xlarge';
  equippedAvatar: MarioAvatar;
  setEquippedAvatar: (avatar: MarioAvatar) => void;
  completedTopicIds?: string[];
  onToggleTopicComplete?: (topicId: string) => void;
  onOpenWalkthrough?: () => void;
  onOpenProfile?: () => void;
  unlockedAchievementsCount?: number;
  loginStreak?: number;
  onStartQuickStudy?: () => void;
  onOpenLeaderboard?: () => void;
  shortcutMapActive?: boolean;
  needsImprovementCount?: number;
  onEarnCoins?: (amount: number) => void;
  superStarActive?: boolean;
  recentlyViewedTopics?: {
    id: string;
    title: string;
    badge: string;
    worldId: string;
  }[];
  pinnedRuleBookmarks?: PinnedRuleBookmark[];
  onJumpToPinnedRule?: (worldId: string, topicId: string) => void;
  onRemovePinnedRule?: (bookmarkId: string) => void;
  unlockAllModulesActive?: boolean;
  favoriteTopicIds?: string[];
  onToggleFavoriteTopic?: (topicId: string) => void;
  unlockedShopItemIds?: string[];
}

interface MapNode {
  id: string;
  levelNumber: string;
  name: string;
  worldName: string;
  x: number;
  y: number;
  iconType: 'mushroom' | 'flower' | 'star' | 'crown' | '1up' | 'pipe' | 'holiday';
  badge: string;
  summary: string;
  themeDescription: string;
  topicsCount: number;
}

const MAP_NODES: MapNode[] = [
  {
    id: 'world1',
    levelNumber: 'WORLD 1',
    name: 'YOSHI ISLAND',
    worldName: 'Hours of Work',
    x: 16,
    y: 68,
    iconType: 'mushroom',
    badge: 'Art. 82-90 Labor Code',
    summary:
      'Coverage & Exclusions, Managerial & Field Tests, 20-min Brownouts, Travel Time, Compressed Work Week & Overtime.',
    themeDescription: 'Yoshi Island Grasslands & Tropical Shore',
    topicsCount: 3,
  },
  {
    id: 'world2',
    levelNumber: 'WORLD 2',
    name: 'DONUT PLAINS',
    worldName: 'Rest & Holidays',
    x: 28,
    y: 42,
    iconType: 'flower',
    badge: 'Art. 91-94, RA 11360, PD 851',
    summary:
      'Rest Periods, 12 Regular & 9 Special Holidays, Double Holidays, 100% Service Charge & 13th Month Pay.',
    themeDescription: 'Donut Plains Sunflower Meadow & Rolling Hills',
    topicsCount: 4,
  },
  {
    id: 'holidays',
    levelNumber: 'HOLIDAY HUB',
    name: 'FESTIVAL ISLAND',
    worldName: 'PH Holidays Master Tab',
    x: 42,
    y: 24,
    iconType: 'holiday',
    badge: '12 Regular + Special Days',
    summary:
      'Dedicated Holiday Hub: All Regular & Special Non-Working Days, Double Holiday 300%/390% rules, Preceding Absence doctrines & Interactive Holiday Simulator.',
    themeDescription: 'Festival Island Carnival & Firework Skies',
    topicsCount: 12,
  },
  {
    id: 'world3',
    levelNumber: 'WORLD 3',
    name: 'VANILLA DOME',
    worldName: 'Wages & D.O. 174',
    x: 52,
    y: 72,
    iconType: 'star',
    badge: 'Art. 97-129 & D.O. 174',
    summary:
      'No Work-No Pay, Wage vs Salary, 12 Exemptions, D.O. 174 Job vs Labor-Only Contracting, 10 Deductions & Distortion.',
    themeDescription: 'Vanilla Dome Crystal Cavern & Underground Subterrane',
    topicsCount: 2,
  },
  {
    id: 'world4',
    levelNumber: 'WORLD 4',
    name: 'FOREST OF ILLUSION',
    worldName: 'Special Groups',
    x: 68,
    y: 52,
    iconType: 'crown',
    badge: 'Women, Minors, Kasambahay',
    summary:
      'Women Facilities & Discrimination, Competitor Rule, Child Labor, Batas Kasambahay 8 Rights, Homeworkers & Night Work.',
    themeDescription: 'Forest of Illusion Mystic Canopy & Haunted Woods',
    topicsCount: 2,
  },
  {
    id: 'world5',
    levelNumber: 'WORLD 5',
    name: 'BOWSER CASTLE',
    worldName: 'Protective Laws',
    x: 81,
    y: 68,
    iconType: '1up',
    badge: 'RA 10028, 7192, 9710, 7877, 11313, 9262',
    summary:
      'Breastfeeding Act, RA 7192, Magna Carta, Sexual Harassment, Safe Spaces Act, Anti-VAWC, SPES & Telecommuting.',
    themeDescription: "Bowser's Castle Molten Magma Keep & Dark Fortress",
    topicsCount: 3,
  },
  {
    id: 'world6',
    levelNumber: 'WORLD 6',
    name: 'PEACH CASTLE',
    worldName: 'Statutory Leaves',
    x: 83,
    y: 31,
    iconType: 'crown',
    badge: 'Art. 95, RA 11210, 8187, 8972/11861, 9710, 9262',
    summary:
      '7 Full Stages: Service Incentive Leave (5d & Auto Bus prescription), 105-Day Maternity & 7-Day Father Allocation, Paternity, Solo Parents (6-mo service), Gynecological Surgery, VAWC & Master Leave Matrix.',
    themeDescription: "Princess Peach's Sky Observatory & Starlit Haven",
    topicsCount: 7,
  },
  {
    id: 'warp_calc',
    levelNumber: 'WARP PIPE',
    name: 'PIPE LAND',
    worldName: 'Multiplier Calculator',
    x: 34,
    y: 78,
    iconType: 'pipe',
    badge: 'Interactive Wage Engine',
    summary:
      'Statutory calculation simulator for base pay, overtime, holiday premiums, night differentials, and 13th month.',
    themeDescription: 'Underground Emerald Warp Pipe Machine Room',
    topicsCount: 1,
  },
  {
    id: 'wages_matrix',
    levelNumber: 'STAR ROAD',
    name: 'STAR ROAD',
    worldName: '17 Regions Matrix',
    x: 58,
    y: 24,
    iconType: 'star',
    badge: 'NCR to BARMM Rates',
    summary:
      'Complete regional minimum wage rates for Non-Agriculture, Agriculture, and Kasambahay domestic workers.',
    themeDescription: 'Galactic Rainbow Star Road Celestial Matrix',
    topicsCount: 1,
  },
];

export const WorldMap: React.FC<WorldMapProps> = ({
  onSelectWorld,
  onSelectTopic,
  activeWorld,
  fontSize,
  equippedAvatar,
  setEquippedAvatar,
  completedTopicIds = [],
  onToggleTopicComplete,
  onOpenWalkthrough,
  onOpenProfile,
  unlockedAchievementsCount = 0,
  loginStreak = 1,
  onStartQuickStudy,
  onOpenLeaderboard,
  shortcutMapActive = false,
  needsImprovementCount = 0,
  onEarnCoins,
  superStarActive = false,
  recentlyViewedTopics = [],
  pinnedRuleBookmarks = [],
  onJumpToPinnedRule,
  onRemovePinnedRule,
  unlockAllModulesActive = false,
  favoriteTopicIds = [],
  onToggleFavoriteTopic,
  unlockedShopItemIds = [],
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    MAP_NODES.some((n) => n.id === activeWorld) ? activeWorld : 'world1'
  );
  const [mapViewTab, setMapViewTab] = useState<'overworld' | 'favorites'>('overworld');
  const [mapMysteryBanner, setMapMysteryBanner] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);
  const [summaryModalNode, setSummaryModalNode] = useState<MapNode | null>(null);
  const [showAllHeroes, setShowAllHeroes] = useState<boolean>(false);
  const [isFastTravelOpen, setIsFastTravelOpen] = useState<boolean>(false);
  const [warpPipeTargetNode, setWarpPipeTargetNode] = useState<MapNode | null>(null);
  const warpTimerRef = useRef<number | null>(null);
  const favoriteTopics = useMemo(
    () => filterFavoriteTopics(ALL_LAW_TOPICS, favoriteTopicIds),
    [favoriteTopicIds]
  );
  const prestigeSummary = useMemo(
    () => computeOwnedChambersAndRelicsSummary(unlockedShopItemIds),
    [unlockedShopItemIds]
  );
  const [mapQBlockState, setMapQBlockState] = useState<{
    hitCountToday: number;
    dropCursor: number;
  }>({ hitCountToday: 0, dropCursor: 0 });
  const [dailyMissionBundle, setDailyMissionBundle] = useState<DailyMissionBundle>(() =>
    loadOrGenerateDailyMissions(
      getLocalDateKey(),
      typeof window !== 'undefined' ? window.localStorage : undefined
    )
  );

  useEffect(() => {
    const syncMissions = () => {
      setDailyMissionBundle(
        loadOrGenerateDailyMissions(
          getLocalDateKey(),
          typeof window !== 'undefined' ? window.localStorage : undefined
        )
      );
    };
    window.addEventListener('mario-daily-missions-updated', syncMissions);
    window.addEventListener('storage', syncMissions);
    return () => {
      window.removeEventListener('mario-daily-missions-updated', syncMissions);
      window.removeEventListener('storage', syncMissions);
      if (warpTimerRef.current !== null) {
        window.clearTimeout(warpTimerRef.current);
      }
    };
  }, []);

  const handleTriggerFastTravelWarp = (node: MapNode) => {
    setIsFastTravelOpen(false);
    setSelectedNodeId(node.id);
    setWarpPipeTargetNode(node);
    marioAudio.playPipe();
    if (warpTimerRef.current !== null) {
      window.clearTimeout(warpTimerRef.current);
    }
    warpTimerRef.current = window.setTimeout(() => {
      setWarpPipeTargetNode(null);
      onSelectWorld(node.id);
    }, 620);
  };

  const handleClaimDailyMission = (missionId: string) => {
    const { updated, coinsAwarded } = claimDailyMissionReward(dailyMissionBundle, missionId);
    if (coinsAwarded <= 0) return;
    setDailyMissionBundle(updated);
    try {
      window.localStorage.setItem(DAILY_MISSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    onEarnCoins?.(coinsAwarded);
    marioAudio.playCompletionOrMilestoneCoin();
    try {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#fbbf24', '#10b981', '#38bdf8'],
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!summaryModalNode || typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSummaryModalNode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [summaryModalNode]);

  // 24-Hour Daily Bar Challenge State & Midnight Countdown
  const [nowDate, setNowDate] = useState<Date>(() => new Date());
  const [dailyRecord, setDailyRecord] = useState(() =>
    loadDailyChallengeState(typeof window !== 'undefined' ? window.localStorage : null)
  );
  const [isDailyChallengeOpen, setIsDailyChallengeOpen] = useState<boolean>(false);
  const [selectedDailyOption, setSelectedDailyOption] = useState<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      const nextNow = new Date();
      setNowDate(nextNow);
      const refreshed = loadDailyChallengeState(
        typeof window !== 'undefined' ? window.localStorage : null,
        nextNow
      );
      setDailyRecord((prev) => {
        if (prev.dateKey !== refreshed.dateKey) {
          setSelectedDailyOption(null);
          return refreshed;
        }
        return prev;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const todayChallenge = useMemo(() => getDailyChallengeForDate(nowDate), [nowDate]);
  const dailyCountdown = useMemo(() => getNextDailyChallengeCountdown(nowDate), [nowDate]);
  const effectiveDailyReward = superStarActive
    ? DAILY_CHALLENGE_BASE_COINS * 2
    : DAILY_CHALLENGE_BASE_COINS;

  const handleSubmitDailyChallenge = () => {
    if (selectedDailyOption === null || dailyRecord.completed) return;
    const result = submitDailyChallengeAnswer(
      typeof window !== 'undefined' ? window.localStorage : null,
      selectedDailyOption,
      new Date()
    );
    setDailyRecord(result.record);
    if (!result.alreadyCompletedToday && result.baseCoinsEarned > 0) {
      onEarnCoins?.(result.baseCoinsEarned);
      if (result.record.isCorrect) {
        marioAudio.playLevelUp();
        try {
          confetti({
            particleCount: 65,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#10b981', '#ef4444', '#38bdf8'],
          });
        } catch {
          // ignore
        }
      } else {
        marioAudio.playCoin();
      }
    }
  };

  const streakInfo = useMemo(
    () => computeFireFlowerStreakProgress(loginStreak, 6),
    [loginStreak]
  );

  const worldProgressMap = useMemo(() => {
    const raw = computeWorldProgressMap(ALL_LAW_TOPICS, completedTopicIds);
    if (!unlockAllModulesActive) return raw;
    const unlockedCopy: typeof raw = {};
    for (const [k, wp] of Object.entries(raw)) {
      unlockedCopy[k] = {
        ...wp,
        isWorldUnlocked: true,
        topics: wp.topics.map((t) => ({ ...t, isUnlocked: true })),
      };
    }
    return unlockedCopy;
  }, [completedTopicIds, unlockAllModulesActive]);

  const uncompletedTopics = useMemo(() => {
    return ALL_LAW_TOPICS.filter((t) => !completedTopicIds?.includes(t.id));
  }, [completedTopicIds]);

  const [quickStudyOffset, setQuickStudyOffset] = useState<number>(0);

  const suggestedTopic = useMemo(() => {
    const pool = uncompletedTopics.length > 0 ? uncompletedTopics : ALL_LAW_TOPICS;
    if (pool.length === 0) return null;
    return pool[quickStudyOffset % pool.length];
  }, [uncompletedTopics, quickStudyOffset]);

  const handleShuffleQuickStudy = () => {
    marioAudio.playCoin();
    setQuickStudyOffset((prev) => prev + 1);
  };

  const handleWarpToSuggested = (topic: typeof ALL_LAW_TOPICS[number]) => {
    marioAudio.playPipe();
    if (onSelectTopic) {
      onSelectTopic(topic.worldId, topic.id);
    } else {
      onSelectWorld(topic.worldId);
    }
  };

  const selectedNode =
    MAP_NODES.find((n) => n.id === selectedNodeId) || MAP_NODES[0];
  const selectedWorldProgress = worldProgressMap[selectedNode.id] || null;

  const totalClearedWorlds = Object.values(worldProgressMap).filter(
    (w) => w.isWorldCleared
  ).length;

  const questLogSnapshot = useMemo(() => {
    let quizHighScoresCount = 0;
    let unlockedItemsCount = 5;
    if (typeof window !== 'undefined') {
      try {
        const qHist = JSON.parse(localStorage.getItem('mario_quiz_history_v1') || '[]');
        if (Array.isArray(qHist)) {
          quizHighScoresCount = qHist.filter(
            (r: { accuracyPercent?: number }) => (r?.accuracyPercent ?? 0) >= 70
          ).length;
        }
      } catch {
        // ignore
      }
      try {
        const uItems = JSON.parse(localStorage.getItem('mario_unlocked_items') || '[]');
        if (Array.isArray(uItems)) {
          unlockedItemsCount = uItems.length;
        }
      } catch {
        // ignore
      }
    }
    return computeToadstoolQuestLog({
      completedTopicsCount: completedTopicIds.length,
      totalTopicsCount: ALL_LAW_TOPICS.length,
      clearedWorldsCount: totalClearedWorlds,
      quizHighScoresCount,
      unlockedItemsCount,
    });
  }, [completedTopicIds.length, totalClearedWorlds]);

  const handleNodeInspect = (node: MapNode) => {
    setSelectedNodeId(node.id);
    marioAudio.playJump();
  };

  const handleSelectHero = (id: MarioAvatar) => {
    setEquippedAvatar(id);
    marioAudio.playJump();
    try {
      localStorage.setItem('mario_equipped_avatar', id);
    } catch {
      // ignore
    }
  };

  const activeHeroMeta = getHeroMeta(equippedAvatar);
  const bodyTextClass =
    fontSize === 'xlarge' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-base';

  return (
    <div className="space-y-6">
      <div className="bg-[#1e293b] rounded-3xl mario-card border-4 border-slate-950 p-4 md:p-6 text-white overflow-hidden relative">
        {/* Top Header of Map */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b-2 border-slate-700 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-400 border-2 border-slate-900 rounded-2xl flex items-center justify-center shadow-[0_3px_0_#000] shrink-0">
              <Compass className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider font-mario">
                  OVERWORLD LEVEL SELECT
                </span>
                <span className="text-emerald-300 text-xs font-bold tabular-nums">
                  · {completedTopicIds.length}/{ALL_LAW_TOPICS.length} Topics · {totalClearedWorlds}/6 Worlds
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white font-display">
                MUSHROOM KINGDOM INTERACTIVE MAP
              </h2>
              <div className="flex flex-wrap items-center gap-2 pt-2 max-w-full">
                {onOpenWalkthrough && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenWalkthrough();
                      marioAudio.playCoin();
                    }}
                    className="min-h-[42px] px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap max-w-full"
                  >
                    <Compass className="w-4 h-4 shrink-0" />
                    <span className="truncate">App Guide Tour</span>
                  </button>
                )}
                {onOpenProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenProfile();
                      marioAudio.playCoin();
                    }}
                    className="min-h-[42px] px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs border-2 border-slate-700 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap tabular-nums max-w-full"
                  >
                    <Award className="w-4 h-4 shrink-0" />
                    <span className="truncate">Achievements ({unlockedAchievementsCount}/14)</span>
                  </button>
                )}
                {onOpenLeaderboard && (
                  <button
                    type="button"
                    data-testid="map-open-leaderboard-btn"
                    onClick={() => {
                      onOpenLeaderboard();
                      marioAudio.playCoin();
                    }}
                    className="min-h-[42px] px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap max-w-full"
                  >
                    <Trophy className="w-4 h-4 shrink-0" />
                    <span className="truncate">Global Leaderboard</span>
                  </button>
                )}
                <button
                  type="button"
                  data-testid="top-open-world-summary-btn"
                  onClick={() => {
                    setSummaryModalNode(selectedNode);
                    marioAudio.playCoin();
                  }}
                  className="min-h-[42px] px-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs border-2 border-amber-400 shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap max-w-full"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">World Summary</span>
                </button>
                <button
                  type="button"
                  data-testid="map-fast-travel-btn"
                  aria-expanded={isFastTravelOpen}
                  onClick={() => {
                    setIsFastTravelOpen((v) => !v);
                    marioAudio.playPipe();
                  }}
                  className="min-h-[42px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap max-w-full"
                >
                  <MarioPipeIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">Fast-Travel Warp</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isFastTravelOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Active Hero Summary + All 34 Characters Toggle */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/95 px-3 py-2.5 rounded-2xl border-2 border-slate-700 w-full lg:w-auto justify-between lg:justify-end">
            <div className="inline-flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center shrink-0">
                <MarioCharacterAvatar character={equippedAvatar} className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black text-amber-400 uppercase font-mario block leading-none">
                  HERO ({HERO_ROSTER.length} AVAILABLE)
                </span>
                <span className="text-xs sm:text-sm font-black text-white font-display block mt-0.5 leading-tight truncate">
                  {activeHeroMeta.name} ·{' '}
                  <span className="text-slate-300 font-semibold">{activeHeroMeta.title}</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAllHeroes((v) => !v);
                marioAudio.playPipe();
              }}
              className="min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>{showAllHeroes ? 'Hide Roster' : `All ${HERO_ROSTER.length} Heroes`}</span>
              {showAllHeroes ? (
                <ChevronUp className="w-4 h-4 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Fast-Travel Warp-Pipe Menu Drawer (Quick-Jump to Any Unlocked World Node) */}
        {isFastTravelOpen && (
          <div
            data-testid="map-fast-travel-panel"
            className="mb-4 bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-950 border-3 border-emerald-400 rounded-2xl p-4 shadow-[4px_4px_0_#000] space-y-3 animate-in fade-in duration-150"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MarioPipeIcon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-black uppercase text-emerald-300 font-mario">
                  WARP ZONE FAST-TRAVEL · SELECT UNLOCKED STAGE
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFastTravelOpen(false)}
                className="text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer"
              >
                Close Pipe Menu
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {MAP_NODES.map((node) => {
                const wp = worldProgressMap[node.id];
                const isNodeUnlocked = wp ? wp.isWorldUnlocked : true;
                const isNodeCleared = Boolean(wp?.isWorldCleared);
                return (
                  <button
                    key={`fast-travel-${node.id}`}
                    type="button"
                    data-testid={`fast-travel-node-${node.id}`}
                    disabled={!isNodeUnlocked}
                    onClick={() => handleTriggerFastTravelWarp(node)}
                    className={`min-h-[52px] px-3 py-2 rounded-xl border-2 flex items-center justify-between gap-2 text-left transition-all ${
                      isNodeUnlocked
                        ? 'bg-slate-900 hover:bg-emerald-900/60 border-emerald-400/70 hover:border-amber-300 text-white cursor-pointer shadow-[0_2px_0_#000]'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center shrink-0">
                        {isNodeUnlocked ? (
                          <MarioPipeIcon className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-500" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black font-mario text-amber-300 block truncate">
                          {node.levelNumber}
                        </span>
                        <span className="text-xs font-extrabold text-slate-100 block truncate">
                          {node.worldName}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-black shrink-0 ${
                        isNodeCleared
                          ? 'bg-emerald-400 text-slate-950'
                          : isNodeUnlocked
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {isNodeCleared ? 'CLEARED' : isNodeUnlocked ? 'WARP' : 'LOCKED'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Warp-Pipe Transition Animation Overlay */}
        {warpPipeTargetNode && (
          <div
            data-testid="warp-pipe-transition-overlay"
            className="fixed inset-0 z-[95] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto"
          >
            <div className="bg-gradient-to-b from-emerald-900 via-slate-950 to-slate-950 border-4 border-emerald-400 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-[0_12px_40px_rgba(16,185,129,0.45)] animate-in zoom-in-95 duration-150">
              <div className="text-[10px] font-black uppercase text-emerald-300 font-mario tracking-wider">
                ENTERING SUBTERRANEAN WARP PIPE...
              </div>
              <div className="relative h-28 flex flex-col items-center justify-end overflow-hidden">
                <div className="animate-bounce mb-1">
                  <MarioCharacterAvatar character={equippedAvatar} className="w-10 h-10" />
                </div>
                <div className="w-20 h-14 rounded-t-xl bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-700 border-4 border-black shadow-[0_4px_0_#000] flex items-center justify-center">
                  <MarioPipeIcon className="w-9 h-9" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-black text-amber-300 font-display">
                  {warpPipeTargetNode.levelNumber}: {warpPipeTargetNode.worldName}
                </h4>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">
                  {warpPipeTargetNode.themeDescription}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Visual Mario-Style 6-World Progress Timeline */}
        <section
          data-testid="world-map-progress-timeline"
          aria-label="Mario 6-World Mastery Timeline"
          className="mb-4 bg-slate-950/95 border-2 border-amber-400/70 rounded-2xl p-3.5 sm:p-4 space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MarioFlagIcon className="w-4 h-4 shrink-0" />
              <span className="text-[10px] sm:text-xs font-black uppercase text-amber-300 font-mario">
                MUSHROOM KINGDOM 6-WORLD STAGE TIMELINE
              </span>
            </div>
            <span className="text-xs font-mono font-black text-emerald-300 tabular-nums">
              {Math.round(
                (completedTopicIds.length / Math.max(1, ALL_LAW_TOPICS.length)) * 100
              )}
              % Overall Journey ({completedTopicIds.length}/{ALL_LAW_TOPICS.length} Topics)
            </span>
          </div>

          <div className="relative pt-1">
            <div className="hidden sm:block absolute left-6 right-6 top-6 h-2 bg-slate-800 rounded-full border border-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-yellow-300 transition-all duration-500"
                style={{
                  width: `${Math.round(
                    (completedTopicIds.length / Math.max(1, ALL_LAW_TOPICS.length)) * 100
                  )}%`,
                }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 relative z-10">
              {WORLDS_METADATA.map((wMeta) => {
                const wp = worldProgressMap[wMeta.id];
                const nodeRef = MAP_NODES.find((n) => n.id === wMeta.id);
                const cleared = Boolean(wp?.isWorldCleared);
                const unlocked = wp ? wp.isWorldUnlocked : true;
                return (
                  <button
                    key={`timeline-${wMeta.id}`}
                    type="button"
                    onClick={() => {
                      if (nodeRef && unlocked) {
                        handleTriggerFastTravelWarp(nodeRef);
                      } else if (nodeRef) {
                        handleNodeInspect(nodeRef);
                      }
                    }}
                    className={`p-2 rounded-xl border-2 flex flex-col items-center text-center gap-1 transition-all cursor-pointer ${
                      cleared
                        ? 'bg-emerald-950/90 border-emerald-400 text-white shadow-[0_2px_0_#000]'
                        : unlocked
                        ? 'bg-slate-900 hover:bg-slate-800 border-amber-400/70 text-slate-100'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-mario font-bold ${
                        cleared
                          ? 'bg-emerald-400 text-slate-950'
                          : unlocked
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {cleared ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : `W${wMeta.worldNumber}`}
                    </span>
                    <span className="text-[11px] font-black truncate w-full">
                      {wMeta.shortTitle}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-300 tabular-nums">
                      {wp ? `${wp.completedCount}/${wp.totalCount}` : '0/0'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 1. Full Hero Roster Aligned Grid (Directly beneath Hero Switcher Header) */}
        <div className="mb-4 bg-slate-900/95 border-2 border-slate-700 rounded-2xl p-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {(showAllHeroes ? HERO_ROSTER : HERO_ROSTER.slice(0, 8)).map((hero) => {
              const isSelected = equippedAvatar === hero.id;
              return (
                <button
                  key={hero.id}
                  type="button"
                  onClick={() => handleSelectHero(hero.id)}
                  className={`min-h-[44px] px-2.5 rounded-xl border-2 inline-flex items-center justify-start gap-2 transition-all cursor-pointer leading-none min-w-0 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <MarioCharacterAvatar character={hero.id} className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-black truncate">{hero.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1.5 Recently Viewed Topics Strip (Last 5 Accessed Modules) */}
        <section
          data-testid="map-recently-viewed-section"
          aria-label="Recently Viewed Topics"
          className="mb-4 bg-slate-900/95 text-white rounded-2xl border-4 border-slate-950 p-3.5 sm:p-4 shadow-[4px_4px_0_#000] space-y-2.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-black uppercase text-amber-400 font-mario shrink-0">
                RECENTLY VIEWED
              </span>
              <span className="text-slate-500" aria-hidden="true">
                ·
              </span>
              <span className="text-xs font-bold text-slate-300 truncate">
                Last {Math.min(5, recentlyViewedTopics.length)} accessed labor law topics
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400 tabular-nums">
              {recentlyViewedTopics.length}/5 Recent
            </span>
          </div>

          {recentlyViewedTopics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {recentlyViewedTopics.slice(0, 5).map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`recently-viewed-topic-${item.id}`}
                  onClick={() => {
                    if (onSelectTopic) {
                      onSelectTopic(item.worldId, item.id);
                    } else {
                      onSelectWorld(item.worldId);
                    }
                  }}
                  className="min-h-[54px] text-left bg-slate-950 hover:bg-slate-800 border-2 border-slate-700 hover:border-amber-400 rounded-xl px-3 py-2 transition-colors cursor-pointer flex flex-col justify-between gap-1 min-w-0"
                >
                  <div className="flex items-center justify-between gap-1.5 text-[10px] font-mono font-bold text-amber-300 min-w-0">
                    <span className="truncate">{item.badge}</span>
                    <span className="text-slate-500 shrink-0">#{idx + 1}</span>
                  </div>
                  <span className="text-xs font-extrabold text-white truncate block">
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium">
              Open any module card or use Quick Jump to pin your last 5 accessed topics here for instant 1-click re-selection.
            </p>
          )}
        </section>

        {/* 1B. Quick Review: Pinned Rule-Items Bookmarked from Topic Cards */}
        <section
          data-testid="world-map-quick-review-section"
          className="mb-4 bg-slate-900/95 border-2 border-amber-400/60 rounded-2xl p-3.5 sm:p-4 space-y-2.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 font-mario">
                QUICK REVIEW · PINNED RULE ITEMS ({pinnedRuleBookmarks.length})
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Pin specific statutory rules inside any Module Topic Card for rapid pre-exam review
            </span>
          </div>

          {pinnedRuleBookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {pinnedRuleBookmarks.slice(0, 6).map((bm) => (
                <div
                  key={bm.id}
                  data-testid={`quick-review-bookmark-${bm.id}`}
                  className="bg-slate-950/95 border border-slate-700 hover:border-amber-400 rounded-xl p-3 flex items-start justify-between gap-2.5 transition-colors pinned-bookmark-pop"
                >
                  <button
                    type="button"
                    onClick={() => {
                      marioAudio.playPipe();
                      if (onJumpToPinnedRule) {
                        onJumpToPinnedRule(bm.worldId, bm.topicId);
                      } else if (onSelectTopic) {
                        onSelectTopic(bm.worldId, bm.topicId);
                      } else {
                        onSelectWorld(bm.worldId);
                      }
                    }}
                    className="text-left flex-1 min-w-0 space-y-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono font-bold text-amber-300">
                      <span>{bm.topicBadge}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-300 truncate">{bm.ruleHeading}</span>
                      {bm.tag && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/50 text-[9px] font-black font-mario uppercase">
                          {bm.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-100 leading-snug line-clamp-2 break-words">
                      {bm.itemText}
                    </p>
                  </button>
                  {onRemovePinnedRule && (
                    <button
                      type="button"
                      onClick={() => {
                        onRemovePinnedRule(bm.id);
                        marioAudio.playClick();
                      }}
                      aria-label={`Remove pinned rule from ${bm.topicTitle}`}
                      title="Unpin rule item"
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white inline-flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium">
              No individual rule items pinned yet — click the <strong className="text-amber-300">Pin</strong> button on any rule clause in the Modules tab to build your custom Quick Review deck here.
            </p>
          )}
        </section>

        {/* 2. Quick Study Widget: 5-Minute Curated Flashcard Deck + Topic Warp */}
        <div
          data-testid="quick-study-widget"
          className="mb-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-2xl border-4 border-slate-950 p-4 shadow-[4px_4px_0_#000] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-slate-950"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-950 text-amber-400 border-2 border-slate-900 flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-slate-900">
                <span className="font-black uppercase font-mario text-[10px] text-red-900">
                  QUICK STUDY MODE
                </span>
                <span aria-hidden="true">·</span>
                {suggestedTopic && <span className="font-mono font-black">{suggestedTopic.badge}</span>}
                <span aria-hidden="true">·</span>
                <span>
                  {needsImprovementCount > 0
                    ? `${needsImprovementCount} flagged for Need Improvement`
                    : uncompletedTopics.length > 0
                    ? `${uncompletedTopics.length} topics left to master`
                    : 'All topics cleared — curated review ready'}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-slate-950 font-display truncate mt-0.5">
                {suggestedTopic ? suggestedTopic.title : 'Ready to study!'}
              </h4>
              <p className="text-xs text-slate-900 font-medium line-clamp-1">
                {suggestedTopic
                  ? suggestedTopic.summary
                  : 'Launch a 5-minute curated flashcard sprint or warp to a stage below.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 max-w-full">
            {onStartQuickStudy && (
              <button
                type="button"
                data-testid="map-quick-study-5m-btn"
                onClick={() => {
                  marioAudio.playPowerUp();
                  onStartQuickStudy();
                }}
                className="min-h-[42px] px-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap max-w-full"
              >
                <Zap className="w-4 h-4 shrink-0" />
                <span className="truncate">5-Min Quick Study</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShuffleQuickStudy}
              title="Suggest another topic"
              className="min-h-[42px] px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs border-2 border-slate-950 shadow-[0_2px_0_#000] active:translate-y-0.5 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Shuffle className="w-4 h-4 shrink-0" />
              <span>Shuffle</span>
            </button>

            {suggestedTopic && (
              <button
                type="button"
                onClick={() => handleWarpToSuggested(suggestedTopic)}
                className="min-h-[42px] px-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap max-w-full"
              >
                <span className="truncate">Warp to Topic</span>
                <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* 3. 24-Hour Refreshing Daily Statutory Mastery Challenge */}
        <div
          data-testid="daily-challenge-card"
          className="mb-4 bg-slate-950 border-3 border-emerald-400 rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0_#000] text-white space-y-4 w-full max-w-full min-w-0 overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
                <Scale className="w-6 h-6" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-slate-300">
                  <span className="font-black uppercase font-mario text-[10px] text-emerald-300">
                    DAILY STATUTORY CHALLENGE
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-300">{todayChallenge.worldLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{todayChallenge.difficultyLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 font-mono text-sky-300 tabular-nums">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    Refreshes in {dailyCountdown.formatted}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white font-display leading-snug">
                  {todayChallenge.title}
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  {dailyRecord.completed
                    ? dailyRecord.isCorrect
                      ? `Solved today (+${dailyRecord.coinsAwarded} base coins claimed) · Lifetime Daily Cases Mastered: ${dailyRecord.totalSolvedCount}`
                      : `Reviewed today (+${dailyRecord.coinsAwarded} review coins claimed) · Next high-difficulty case unlocks at midnight`
                    : `Solve today's high-difficulty Philippine Labor Law Bar scenario for +${effectiveDailyReward} Gold Coins${
                        superStarActive ? ' (2x Super Star Active!)' : ''
                      }!`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 max-w-full">
              <div className="min-h-[42px] px-3 rounded-xl bg-slate-900 border border-amber-400/60 inline-flex items-center gap-1.5 font-black text-xs text-amber-300 tabular-nums">
                <MarioCoinIcon className="w-4 h-4 shrink-0" />
                <span>
                  {dailyRecord.completed
                    ? `Claimed +${dailyRecord.coinsAwarded}c`
                    : `+${effectiveDailyReward} Coins`}
                </span>
              </div>

              <button
                type="button"
                data-testid="daily-challenge-toggle-btn"
                aria-expanded={isDailyChallengeOpen}
                onClick={() => {
                  setIsDailyChallengeOpen((v) => !v);
                  marioAudio.playQuestionBlock();
                }}
                className={`min-h-[42px] px-3.5 rounded-xl font-black text-xs border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap max-w-full ${
                  dailyRecord.completed
                    ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-emerald-400/70'
                    : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                }`}
              >
                <span className="truncate">
                  {isDailyChallengeOpen
                    ? 'Hide Daily Scenario'
                    : dailyRecord.completed
                    ? 'View Ruling & Doctrine'
                    : 'Solve Daily Challenge'}
                </span>
                {isDailyChallengeOpen ? (
                  <ChevronUp className="w-4 h-4 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {isDailyChallengeOpen && (
            <div
              data-testid="daily-challenge-solver"
              className="pt-3.5 border-t border-slate-800 space-y-4"
            >
              {/* Fact Pattern & Issue */}
              <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 sm:p-4 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 font-mono block">
                  Practical Workplace Fact Pattern ({dailyRecord.dateKey})
                </span>
                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                  {todayChallenge.factPattern}
                </p>
                <p className="text-xs sm:text-sm font-black text-emerald-300 pt-1">
                  Issue: {todayChallenge.questionPrompt}
                </p>
              </div>

              {/* 4 Multiple-Choice Legal Rulings */}
              <div className="grid grid-cols-1 gap-2.5">
                {todayChallenge.options.map((opt, idx) => {
                  const chosenIdx = dailyRecord.completed
                    ? dailyRecord.selectedOptionIndex
                    : selectedDailyOption;
                  const isSelected = chosenIdx === idx;
                  const isCorrectOpt = idx === todayChallenge.correctIndex;

                  let optionStyle =
                    'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-100';
                  if (dailyRecord.completed) {
                    if (isCorrectOpt) {
                      optionStyle =
                        'bg-emerald-950/80 border-emerald-400 text-emerald-100';
                    } else if (isSelected && !isCorrectOpt) {
                      optionStyle = 'bg-rose-950/75 border-rose-400 text-rose-100';
                    } else {
                      optionStyle = 'bg-slate-900/60 border-slate-800 text-slate-400';
                    }
                  } else if (isSelected) {
                    optionStyle =
                      'bg-amber-400/20 border-amber-400 text-white ring-2 ring-amber-400/50';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={dailyRecord.completed}
                      data-testid={`daily-challenge-option-${idx}`}
                      onClick={() => {
                        setSelectedDailyOption(idx);
                        marioAudio.playClick();
                      }}
                      className={`min-h-[48px] w-full text-left p-3 sm:p-3.5 rounded-xl border-2 transition-colors flex items-start justify-between gap-3 ${
                        dailyRecord.completed ? 'cursor-default' : 'cursor-pointer'
                      } ${optionStyle}`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-600 font-mono font-black text-xs text-amber-300 inline-flex items-center justify-center shrink-0 mt-0.5">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold leading-relaxed">
                          {opt}
                        </span>
                      </div>

                      {dailyRecord.completed && isCorrectOpt && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-300 shrink-0">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Correct</span>
                        </span>
                      )}
                      {dailyRecord.completed && isSelected && !isCorrectOpt && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-300 shrink-0">
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span>Your Choice</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Submit Action or Supreme Court Doctrinal Explanation */}
              {!dailyRecord.completed ? (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <span className="text-xs text-slate-400">
                    Correct ruling awards <strong className="text-amber-300">+{effectiveDailyReward} Coins</strong> (or +{superStarActive ? DAILY_CHALLENGE_REVIEW_COINS * 2 : DAILY_CHALLENGE_REVIEW_COINS} review coins if missed).
                  </span>
                  <button
                    type="button"
                    data-testid="daily-challenge-submit-btn"
                    disabled={selectedDailyOption === null}
                    onClick={handleSubmitDailyChallenge}
                    className="min-h-[44px] px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 inline-flex items-center justify-center gap-2 cursor-pointer max-w-full"
                  >
                    <Scale className="w-4 h-4 shrink-0" />
                    <span className="truncate">Submit Bar Ruling (+{effectiveDailyReward} Coins)</span>
                  </button>
                </div>
              ) : (
                <div
                  data-testid="daily-challenge-explanation"
                  className="bg-slate-900 border-2 border-emerald-400/70 rounded-xl p-4 space-y-3 w-full max-w-full min-w-0 overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                    <span className="text-xs sm:text-sm font-black text-emerald-300 flex items-start sm:items-center gap-1.5 min-w-0">
                      {dailyRecord.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
                          <span className="min-w-0 break-words">
                            Bar-Ready Ruling! You earned +{dailyRecord.coinsAwarded}
                            {superStarActive ? ' (x2 Super Star)' : ''} Gold Coins!
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 shrink-0 text-amber-300 mt-0.5 sm:mt-0" />
                          <span className="min-w-0 break-words">
                            Doctrine Reviewed (+{dailyRecord.coinsAwarded} Review Coins Awarded)
                          </span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-amber-300 break-words">
                      {todayChallenge.statutoryBasis}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                    {todayChallenge.doctrinalExplanation}
                  </p>
                  <div className="pt-3 border-t border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full max-w-full min-w-0">
                    <div className="text-xs font-bold text-amber-200 flex items-start gap-2 min-w-0 flex-1">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                      <span className="min-w-0 break-words leading-relaxed">
                        Bar Takeaway: {todayChallenge.barTakeaway}
                      </span>
                    </div>
                    <button
                      type="button"
                      data-testid="daily-challenge-review-world-btn"
                      onClick={() => onSelectWorld(todayChallenge.worldId)}
                      className="min-h-[42px] w-full lg:w-auto lg:max-w-[300px] shrink-0 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs border border-amber-400/50 inline-flex items-center justify-center lg:justify-between gap-2 cursor-pointer whitespace-normal text-center lg:text-left leading-snug"
                    >
                      <span className="min-w-0 break-words">Review {todayChallenge.worldLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3B. Daily Missions Board (3 Unique Daily Tasks + Bonus Coin Rewards) & Toadstool Quest Log */}
        <div className="mb-5 grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Daily Missions Card */}
          <section
            data-testid="world-map-daily-missions"
            aria-label="Daily Missions"
            className="bg-slate-950 border-3 border-amber-400 rounded-2xl p-4 shadow-[4px_4px_0_#000] space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <MarioStarIcon className="w-5 h-5 shrink-0" />
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
                    DAILY MISSIONS · 3 FRESH QUESTS TODAY
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    Complete tasks across study modes to claim bonus Gold Coins
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-mono font-bold text-emerald-300 tabular-nums">
                {dailyMissionBundle.missions.filter((m) => m.claimed).length}/3 Claimed
              </span>
            </div>

            <div className="space-y-2.5">
              {dailyMissionBundle.missions.map((mission) => {
                const isReadyToClaim = mission.progress >= mission.target && !mission.claimed;
                const pct = Math.min(100, Math.round((mission.progress / Math.max(1, mission.target)) * 100));
                return (
                  <div
                    key={mission.id}
                    data-testid={`daily-mission-row-${mission.id}`}
                    className={`rounded-xl border-2 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      mission.claimed
                        ? 'bg-emerald-950/35 border-emerald-500/60'
                        : isReadyToClaim
                        ? 'bg-amber-950/40 border-amber-400'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-white">
                          {mission.title}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-mono font-black border border-amber-400/40 tabular-nums">
                          +{mission.rewardCoins}c
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium leading-snug">
                        {mission.subtitle}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <div className="flex-1 h-2 bg-slate-950 rounded-full border border-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-300 tabular-nums">
                          {mission.progress}/{mission.target}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {mission.claimed ? (
                        <span className="min-h-[36px] px-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-mario font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>CLAIMED</span>
                        </span>
                      ) : isReadyToClaim ? (
                        <button
                          type="button"
                          data-testid={`claim-daily-mission-${mission.id}`}
                          onClick={() => handleClaimDailyMission(mission.id)}
                          className="min-h-[38px] px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <MarioCoinIcon className="w-4 h-4 shrink-0" />
                          <span>Claim +{mission.rewardCoins}c</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            marioAudio.playJump();
                            if (mission.actionView === 'wages_matrix') {
                              onSelectWorld('wages_matrix');
                            } else if (mission.actionView === 'statute_lookup') {
                              window.dispatchEvent(new CustomEvent('mario-open-statute-lookup'));
                            } else if (mission.actionView) {
                              window.dispatchEvent(
                                new CustomEvent('mario-navigate-tab', { detail: mission.actionView })
                              );
                            } else {
                              onSelectWorld('world1');
                            }
                          }}
                          className="min-h-[36px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs border border-slate-600 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <span>Go</span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Toadstool Campaign Quest Log */}
          <section
            data-testid="world-map-toadstool-quest-log"
            aria-label="Toadstool Quest Log"
            className="bg-slate-950 border-3 border-rose-500/80 rounded-2xl p-4 shadow-[4px_4px_0_#000] space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <MarioBowserIcon className="w-5 h-5 shrink-0" />
                <div>
                  <span className="text-[10px] font-black uppercase text-rose-300 font-mario block">
                    TOADSTOOL CAMPAIGN QUEST LOG
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    Long-term Bar Mastery campaign culminating at Bowser&apos;s Final Keep
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/50 text-[11px] font-mono font-bold text-amber-300 tabular-nums">
                {questLogSnapshot.completedSteps}/{questLogSnapshot.steps.length} Stages ({questLogSnapshot.overallPercent}%)
              </span>
            </div>

            <div className="space-y-2">
              {questLogSnapshot.steps.map((step, idx) => {
                const isFinale = idx === questLogSnapshot.steps.length - 1;
                return (
                  <div
                    key={step.id}
                    className={`rounded-xl border px-3 py-2 flex items-center justify-between gap-2.5 ${
                      step.completed
                        ? 'bg-emerald-950/35 border-emerald-500/60'
                        : isFinale
                        ? 'bg-rose-950/35 border-rose-500/50'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg border border-black flex items-center justify-center shrink-0 ${
                          step.completed
                            ? 'bg-emerald-400 text-slate-950'
                            : isFinale
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-800 text-amber-300'
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                        ) : isFinale ? (
                          <MarioBowserIcon className="w-4 h-4" />
                        ) : (
                          <span className="text-[10px] font-mario font-bold">{idx + 1}</span>
                        )}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-white block truncate">
                          {step.title}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {step.description}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono font-black text-amber-300 block tabular-nums">
                        {step.current}/{step.target}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-300 block">
                        {step.rewardLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* 4. Visual Consecutive Days Studied Tracker (Fire Flower for every 5-day streak + Milestone Progress Bar) */}
        <div
          data-testid="consecutive-days-tracker"
          className="mb-5 bg-slate-900/95 border-2 border-amber-400/70 rounded-2xl p-3.5 sm:p-4 shadow-md"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
                <MarioFireFlowerIcon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase text-amber-300 font-mario">
                    CONSECUTIVE DAYS STUDIED TRACKER
                  </span>
                  <span className="text-xs font-bold text-slate-300 tabular-nums">
                    · {streakInfo.streakDays} {streakInfo.streakDays === 1 ? 'Day' : 'Days'} Active ·{' '}
                    {streakInfo.fireFlowersEarned} Fire {streakInfo.fireFlowersEarned === 1 ? 'Flower' : 'Flowers'} Earned
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Earn 1 blooming <strong className="text-amber-300">Fire Flower</strong> every 5 consecutive study days!{' '}
                  <span className="text-emerald-300 font-bold tabular-nums">
                    ({streakInfo.daysRemainingToNextFlower} {streakInfo.daysRemainingToNextFlower === 1 ? 'day' : 'days'} until Day {streakInfo.nextMilestoneDays} Fire Flower)
                  </span>
                </p>
              </div>
            </div>

            {/* Fire Flower Milestone Icons (5d, 10d, 15d, 20d, 25d, 30d) */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
              {streakInfo.milestoneMarkers.map((m) => {
                const isCurrentTarget =
                  !m.achieved && m.dayTarget === streakInfo.nextMilestoneDays;
                return (
                  <div
                    key={`fire-flower-${m.flowerIndex}-${m.dayTarget}`}
                    data-testid={`fire-flower-slot-${m.dayTarget}`}
                    title={
                      m.achieved
                        ? `Day ${m.dayTarget} Fire Flower Unlocked!`
                        : `Study ${m.dayTarget} consecutive days to bloom this Fire Flower`
                    }
                    className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl border-2 shrink-0 transition-all ${
                      m.achieved
                        ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.25)]'
                        : isCurrentTarget
                        ? 'bg-slate-800 border-orange-400/70 text-slate-200'
                        : 'bg-slate-950/70 border-slate-800 text-slate-500 opacity-75'
                    }`}
                  >
                    <div className={m.achieved ? 'scale-105' : 'grayscale opacity-50'}>
                      <MarioFireFlowerIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[10px] font-black font-mono tabular-nums mt-0.5">
                      {m.dayTarget}d
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Bar filling toward next 5-day Fire Flower milestone */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 tabular-nums">
              <span>
                Cycle Progress: {streakInfo.daysIntoCurrentCycle}/5 Days toward Fire Flower #{streakInfo.fireFlowersEarned + 1}
              </span>
              <span className="text-amber-300 font-black">{streakInfo.progressPercentToNextFlower}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={streakInfo.progressPercentToNextFlower}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progress toward next 5-day Fire Flower milestone"
              className="w-full h-3 bg-slate-950 rounded-full border-2 border-slate-700 overflow-hidden p-0.5"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 transition-transform duration-300 origin-left"
                style={{ transform: `scaleX(${Math.max(0.06, streakInfo.progressPercentToNextFlower / 100)})` }}
              />
            </div>
          </div>
        </div>

        {/* 4B. Overworld Map vs. Favorites View Switcher + Interactive Mario [?] Mystery Law Block */}
        <div
          data-testid="world-map-view-switcher"
          className="mb-3 bg-slate-950/90 border-2 border-slate-800 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2"
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="world-map-overworld-tab"
              aria-pressed={mapViewTab === 'overworld'}
              onClick={() => {
                setMapViewTab('overworld');
                marioAudio.playClick();
              }}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-black border-2 inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                mapViewTab === 'overworld'
                  ? 'bg-emerald-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>Overworld Map</span>
            </button>

            <button
              type="button"
              data-testid="world-map-favorites-tab"
              aria-pressed={mapViewTab === 'favorites'}
              onClick={() => {
                setMapViewTab('favorites');
                marioAudio.playCoin();
              }}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-black border-2 inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                mapViewTab === 'favorites'
                  ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700'
              }`}
            >
              <Star className={`w-4 h-4 shrink-0 ${favoriteTopics.length > 0 ? 'fill-current' : ''}`} />
              <span>Favorites ({favoriteTopics.length})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {prestigeSummary.chambersBonusPct > 0 && (
              <span
                data-testid="world-map-prestige-badge"
                className="px-2.5 py-1 rounded-xl bg-purple-950/90 border border-purple-400/70 text-purple-200 text-[10px] font-black font-mario"
              >
                CHAMBERS &amp; RELICS: +{prestigeSummary.chambersBonusPct}% PRESTIGE
              </span>
            )}
            <button
              type="button"
              data-testid="world-map-mystery-block-btn"
              onClick={() => {
                const res = hitMarioMysteryLawBlock(mapQBlockState);
                setMapQBlockState({
                  hitCountToday: res.nextHitCountToday,
                  dropCursor: res.nextDropCursor,
                });
                if (res.coinsAwarded > 0) {
                  onEarnCoins?.(res.coinsAwarded);
                  marioAudio.playCoin();
                } else {
                  marioAudio.playClick();
                }
                setMapMysteryBanner(
                  `${res.drop.mnemonicTitle}: ${res.drop.statutoryRule}${
                    res.coinsAwarded > 0 ? ` (+${res.coinsAwarded} Coins)` : ''
                  }`
                );
              }}
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-black shadow-[0_2px_0_#000] text-xs font-black inline-flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
            >
              <MarioQuestionBlockIcon className="w-4 h-4 shrink-0" />
              <span>Hit [?] Law Block</span>
            </button>
          </div>
        </div>

        {mapMysteryBanner && (
          <div
            role="status"
            data-testid="world-map-mystery-banner"
            className="mb-3 bg-amber-400/15 border-2 border-amber-400 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs text-amber-100 font-bold"
          >
            <div className="flex items-center gap-2 min-w-0">
              <MarioQuestionBlockIcon className="w-4 h-4 shrink-0" />
              <span className="leading-snug">{mapMysteryBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setMapMysteryBanner(null)}
              aria-label="Dismiss Mystery Law Block tip"
              className="px-2 py-0.5 rounded-lg bg-slate-900 text-amber-300 border border-amber-400/60 text-[10px] font-black cursor-pointer shrink-0"
            >
              OK
            </button>
          </div>
        )}

        {/* Owned Toad's Shop Law Chambers & Statutory Relics Showcase Strip */}
        {(prestigeSummary.ownedChambersCount > 0 || prestigeSummary.ownedRelicsCount > 0) && (
          <div
            data-testid="world-map-owned-chambers-relics"
            className="mb-4 bg-slate-950/90 border-2 border-amber-400/70 rounded-2xl p-3 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-mario text-[10px] text-amber-300 uppercase">
                UNLOCKED LAW CHAMBERS ({prestigeSummary.ownedChambersCount}) &amp; STATUTORY RELICS ({prestigeSummary.ownedRelicsCount})
              </span>
              <span className="text-[11px] font-extrabold text-emerald-300">
                Active Sanctuary Aura · +{prestigeSummary.chambersBonusPct}% Counsel Prestige
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {prestigeSummary.ownedChamberNames.map((chName) => (
                <span
                  key={`ch-${chName}`}
                  className="px-2.5 py-1 rounded-xl bg-amber-400/15 border border-amber-400/60 text-amber-200 text-[11px] font-bold"
                >
                  {chName}
                </span>
              ))}
              {prestigeSummary.ownedRelicNames.map((rlName) => (
                <span
                  key={`rl-${rlName}`}
                  className="px-2.5 py-1 rounded-xl bg-emerald-400/15 border border-emerald-400/60 text-emerald-200 text-[11px] font-bold"
                >
                  {rlName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Favorites View Panel within World Map */}
        {mapViewTab === 'favorites' && (
          <div
            data-testid="world-map-favorites-view"
            className="mb-5 bg-slate-950 rounded-2xl border-4 border-amber-400 p-4 sm:p-5 space-y-4 shadow-[5px_5px_0_#000]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white font-display">
                    PINNED FAVORITE LABOR LAW TOPICS ({favoriteTopics.length})
                  </h3>
                  <p className="text-xs text-slate-300">
                    Quick-launch your pinned Labor Standards modules directly from the World Map.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMapViewTab('overworld')}
                className="min-h-[36px] px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-black cursor-pointer"
              >
                Back to Overworld Map
              </button>
            </div>

            {favoriteTopics.length === 0 ? (
              <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center space-y-3">
                <Star className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-sm font-black text-white">No Favorite Topics Pinned Yet</p>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Open any Labor Law module card and click the <strong className="text-amber-300">Favorite</strong> star button to pin high-yield doctrines here!
                </p>
                <button
                  type="button"
                  onClick={() => onSelectWorld('all')}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>Browse All Modules to Pin Favorites</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {favoriteTopics.map((topic) => {
                  const isMastered = completedTopicIds.includes(topic.id);
                  const worldMeta = WORLDS_METADATA.find((w) => w.id === topic.worldId);
                  return (
                    <div
                      key={topic.id}
                      data-testid={`world-map-favorite-card-${topic.id}`}
                      className="bg-slate-900 border-2 border-slate-700 hover:border-amber-400 rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-600 text-[10px] font-black text-amber-300 uppercase truncate">
                            {worldMeta ? `${worldMeta.worldNumber} · ${worldMeta.title}` : topic.worldId.toUpperCase()}
                          </span>
                          {isMastered && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/60 text-[10px] font-black text-emerald-300 shrink-0">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Mastered</span>
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-sm text-white leading-snug">{topic.title}</h4>
                        <p className="text-xs text-slate-300 line-clamp-2">{topic.summary}</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          data-testid={`world-map-open-favorite-${topic.id}`}
                          onClick={() => {
                            if (onSelectTopic) {
                              onSelectTopic(topic.worldId, topic.id);
                            } else if (onJumpToPinnedRule) {
                              onJumpToPinnedRule(topic.worldId, topic.id);
                            } else {
                              onSelectWorld(topic.worldId);
                            }
                          }}
                          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Study Topic</span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </button>

                        {onToggleFavoriteTopic && (
                          <button
                            type="button"
                            data-testid={`world-map-unfavorite-${topic.id}`}
                            onClick={() => onToggleFavoriteTopic(topic.id)}
                            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-amber-300 hover:text-rose-200 border border-slate-600 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-current shrink-0" />
                            <span>Unpin</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. 2D Canvas-style Interactive Overworld Map Display with Live Unlocked/Cleared Progress */}
        <div
          data-testid="interactive-world-map"
          className={`${
            mapViewTab === 'favorites' ? 'hidden' : 'block'
          } relative w-full h-[440px] sm:h-[500px] md:h-[540px] bg-[#064e3b] rounded-2xl border-4 border-slate-950 shadow-inner select-none mb-5 overflow-hidden`}
        >
          {/* Inner clipped container for background patterns & water gradient */}
          <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `radial-gradient(#10b981 15%, transparent 16%), radial-gradient(#059669 15%, transparent 16%)`,
                backgroundSize: '36px 36px',
                backgroundPosition: '0 0, 18px 18px',
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-[#1e3a8a]/70 border-t-4 border-[#3b82f6]/40" />
            {/* Dotted / Illuminated Level Trail Lines */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
            >
              <path
                d="M 16 68 Q 22 54 28 42"
                stroke={worldProgressMap.world2?.isWorldUnlocked ? '#34d399' : '#F59E0B'}
                strokeWidth="1.4"
                strokeDasharray={worldProgressMap.world1?.isWorldCleared ? undefined : '2 2'}
                fill="none"
              />
              <path d="M 28 42 L 42 24" stroke="#EC4899" strokeWidth="1.2" strokeDasharray="1.8 1.8" fill="none" />
              <path
                d="M 28 42 Q 40 58 52 72"
                stroke={worldProgressMap.world3?.isWorldUnlocked ? '#34d399' : '#F59E0B'}
                strokeWidth="1.4"
                strokeDasharray={worldProgressMap.world2?.isWorldCleared ? undefined : '2 2'}
                fill="none"
              />
              <path
                d="M 52 72 Q 60 62 68 52"
                stroke={worldProgressMap.world4?.isWorldUnlocked ? '#34d399' : '#F59E0B'}
                strokeWidth="1.4"
                strokeDasharray={worldProgressMap.world3?.isWorldCleared ? undefined : '2 2'}
                fill="none"
              />
              <path
                d="M 68 52 Q 75 60 81 68"
                stroke={worldProgressMap.world5?.isWorldUnlocked ? '#34d399' : '#F59E0B'}
                strokeWidth="1.4"
                strokeDasharray={worldProgressMap.world4?.isWorldCleared ? undefined : '2 2'}
                fill="none"
              />
              <path
                d="M 81 68 Q 85 50 83 31"
                stroke={worldProgressMap.world6?.isWorldUnlocked ? '#34d399' : '#F59E0B'}
                strokeWidth="1.4"
                strokeDasharray={worldProgressMap.world5?.isWorldCleared ? undefined : '2 2'}
                fill="none"
              />
              <path d="M 16 68 L 34 78" stroke="#10B981" strokeWidth="1" strokeDasharray="1.5 1.5" fill="none" />
              <path d="M 42 24 L 58 24 L 68 52" stroke="#FCD34D" strokeWidth="1" strokeDasharray="1.5 1.5" fill="none" />
            </svg>
          </div>

          {/* Map Legend Bar + Instant World Summary Trigger (Clean Non-Overflowing Overlay) */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
            <div className="bg-slate-950/85 border border-slate-700 rounded-xl px-2.5 py-1.5 flex items-center gap-2 text-[10px] font-bold text-slate-200 pointer-events-auto">
              <span className="inline-flex items-center gap-1 text-emerald-300 whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3 shrink-0" /> Cleared
              </span>
              <span className="inline-flex items-center gap-1 text-amber-300 whitespace-nowrap">
                <Unlock className="w-3 h-3 shrink-0" /> Unlocked
              </span>
              <span className="hidden md:inline text-slate-400 whitespace-nowrap">
                Tap node to inspect · Double-tap to warp
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSummaryModalNode(selectedNode);
                marioAudio.playCoin();
              }}
              className="pointer-events-auto min-h-[34px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap max-w-full"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Summary</span>
            </button>
          </div>

          {/* Map Level Nodes */}
          {MAP_NODES.map((node) => {
            const isSelected = selectedNode.id === node.id;
            const isActive = activeWorld === node.id;
            const wp = worldProgressMap[node.id];
            const isCleared = Boolean(wp?.isWorldCleared);
            const isUnlocked = wp ? wp.isWorldUnlocked : true;

            const isNearTop = node.y < 46;
            const isNearLeft = node.x < 32;
            const isNearRight = node.x > 68;
            const tooltipYClass = isNearTop ? 'top-full mt-3' : 'bottom-full mb-3';
            const tooltipXClass = isNearLeft
              ? 'left-0 translate-x-0'
              : isNearRight
              ? 'right-0 left-auto translate-x-0'
              : 'left-1/2 -translate-x-1/2';

            return (
              <div
                key={node.id}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 w-max"
              >
                {/* World Summary Hover Tooltip */}
                {hoveredNode?.id === node.id && (
                  <div
                    role="tooltip"
                    data-testid={`world-summary-tooltip-${node.id}`}
                    className={`absolute ${tooltipYClass} ${tooltipXClass} w-72 sm:w-80 max-w-[calc(100vw-40px)] bg-slate-950/98 border-3 border-amber-400 rounded-2xl p-3.5 shadow-2xl text-left pointer-events-none z-50 space-y-2 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150`}
                  >
                    <div className="flex items-center justify-between gap-1 border-b border-slate-800 pb-1.5">
                      <span className="text-[10px] font-black uppercase text-amber-300 font-mario">
                        {node.levelNumber} SUMMARY
                      </span>
                      {wp && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            isCleared
                              ? 'bg-emerald-400 text-slate-950 font-black'
                              : 'bg-amber-400/20 text-amber-300'
                          }`}
                        >
                          {isCleared ? 'CLEARED 100%' : `${wp.percent}% Mastered`}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white font-display">
                        {node.name}: {node.worldName}
                      </h4>
                      <div className="text-[10px] font-mono font-black text-emerald-400 mt-0.5">
                        {wp ? `${wp.percent}% Complete` : '0% Complete'} ({wp ? `${wp.completedCount}/${wp.totalCount} stages` : '0 stages'})
                      </div>
                      <p className="text-[10px] text-amber-200/90 font-semibold mt-0.5">
                        Theme: {node.themeDescription}
                      </p>
                    </div>
                    <div className="text-[11px] text-slate-300 leading-snug">
                      <span className="font-bold text-slate-100">Coverage: </span>
                      {node.summary}
                    </div>
                    {wp && (
                      <div className="pt-1.5 border-t border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                          <span>Stages Mastered</span>
                          <span className="font-mono text-emerald-300">
                            {wp.completedCount}/{wp.totalCount} ({wp.percent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all"
                            style={{ width: `${wp.percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <span className="text-[9px] font-mono text-slate-400 block text-center pt-0.5">
                      Double-tap to warp • Click for dossier
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  data-testid={`map-node-${node.id}`}
                  aria-label={`Inspect ${node.levelNumber}: ${node.worldName}`}
                  onClick={() => handleNodeInspect(node)}
                  onDoubleClick={() => onSelectWorld(node.id)}
                  className={`group relative min-w-[48px] min-h-[48px] p-1.5 flex flex-col items-center focus:outline-none cursor-pointer transition-transform duration-200 ${
                    isActive || isSelected ? 'scale-105' : 'hover:scale-105'
                  }`}
                >
                  {(isActive || isSelected) && (
                    <div className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce">
                      <div className="bg-white/95 p-0.5 sm:p-1 rounded-full border-2 border-black shadow-md">
                        <MarioCharacterAvatar
                          character={equippedAvatar}
                          className="w-5 h-5 sm:w-6 sm:h-6"
                        />
                      </div>
                    </div>
                  )}

                  <div className="relative p-1 inline-flex items-center justify-center">
                    {wp && (
                      <span
                        data-testid={`map-node-status-badge-${node.id}`}
                        className={`absolute top-0 right-0 z-20 w-5 h-5 rounded-full border-2 border-black flex items-center justify-center shadow overflow-hidden ${
                          isCleared
                            ? 'bg-emerald-400 text-slate-950'
                            : isUnlocked
                            ? 'bg-amber-300 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                        title={
                          isCleared
                            ? 'World 100% Mastered!'
                            : isUnlocked
                            ? `Unlocked (${wp.completedCount}/${wp.totalCount})`
                            : 'Complete a topic in the previous World to unlock trail'
                        }
                      >
                        {isCleared ? (
                          <CheckCircle2 className="w-3 h-3 stroke-[3] shrink-0" />
                        ) : isUnlocked ? (
                          <Unlock className="w-2.5 h-2.5 stroke-[2.5] shrink-0" />
                        ) : (
                          <Lock className="w-2.5 h-2.5 stroke-[2.5] shrink-0" />
                        )}
                      </span>
                    )}

                    <div
                      className={`w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border-3 sm:border-4 border-slate-950 transition-all ${
                        isCleared
                          ? 'bg-emerald-500 shadow-[0_0_16px_#10b981]'
                          : isSelected || isActive
                          ? 'bg-amber-400 shadow-[0_0_15px_#f59e0b]'
                          : node.iconType === 'pipe'
                          ? 'bg-emerald-600'
                          : node.iconType === 'holiday'
                          ? 'bg-pink-600'
                          : node.iconType === 'star'
                          ? 'bg-yellow-500'
                          : isUnlocked
                          ? 'bg-red-600'
                          : 'bg-slate-700 opacity-90'
                      }`}
                    >
                      {node.iconType === 'mushroom' && (
                        <MarioMushroomIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                      )}
                      {node.iconType === 'flower' && (
                        <MarioFireFlowerIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                      )}
                      {node.iconType === 'star' && (
                        <MarioStarIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                      )}
                      {node.iconType === 'crown' && (
                        <MarioPeachCrownIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                      )}
                      {node.iconType === '1up' && (
                        <Mario1UpIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                      )}
                      {node.iconType === 'pipe' && (
                        <MarioPipeIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                      )}
                      {node.iconType === 'holiday' && (
                        <Calendar
                          className={`w-5 h-5 sm:w-7 sm:h-7 ${
                            isSelected || isActive ? 'text-slate-950' : 'text-white'
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-1 px-1.5 sm:px-2 py-0.5 rounded-lg bg-slate-950/95 text-white border-2 border-slate-700 shadow font-black text-[9px] sm:text-[10px] whitespace-nowrap flex flex-col items-center gap-0.5">
                    <span className="font-mario">{node.levelNumber}</span>
                    <span
                      className={`px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold ${
                        isCleared
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-slate-900 text-amber-300 border border-slate-800'
                      }`}
                    >
                      {wp ? `${wp.percent}%` : '0%'}
                      <span className="hidden sm:inline"> Complete</span>
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* 6. Selected Stage Dossier + Interactive Topic Unlock & Completion Checklist */}
        {selectedNode && (
          <div className="bg-slate-900 border-3 border-amber-400 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-red-600 text-white text-[11px] font-black rounded-md border border-black uppercase font-mario leading-none">
                    {selectedNode.levelNumber}
                  </span>
                  <WorldGoalRing
                    percent={selectedWorldProgress?.percent ?? 0}
                    size={32}
                  />
                  <h3 className="text-lg sm:text-xl font-black text-amber-300 leading-tight font-display">
                    {selectedNode.name}: {selectedNode.worldName}
                  </h3>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span
                    data-testid="world-completion-indicator"
                    className={`px-2.5 py-0.5 rounded-md font-mono font-black inline-flex items-center gap-1.5 border tabular-nums ${
                      selectedWorldProgress?.isWorldCleared
                        ? 'bg-emerald-400 text-slate-950 border-emerald-500'
                        : 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {selectedWorldProgress
                        ? `${selectedWorldProgress.percent}% Complete`
                        : '0% Complete'}
                    </span>
                  </span>
                  <span className="text-slate-400 font-bold tabular-nums">
                    (
                    {selectedWorldProgress
                      ? `${selectedWorldProgress.completedCount}/${selectedWorldProgress.totalCount}`
                      : '0'}{' '}
                    stages)
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-xs font-bold text-slate-300">
                    {selectedNode.badge}
                  </span>
                </div>
                <p
                  className={`${bodyTextClass} text-slate-200 font-semibold text-xs sm:text-sm pt-0.5 leading-relaxed`}
                >
                  {selectedNode.summary}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0 max-w-full">
                <button
                  type="button"
                  data-testid="open-world-summary-modal-btn"
                  onClick={() => {
                    setSummaryModalNode(selectedNode);
                    marioAudio.playCoin();
                  }}
                  className="min-h-[44px] px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 font-black rounded-xl border-2 border-amber-400/70 shadow-[0_3px_0_#000] text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:translate-y-0.5 max-w-full"
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="truncate">World Summary</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectWorld(selectedNode.id)}
                  className="min-h-[44px] px-5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-transform whitespace-nowrap max-w-full"
                >
                  <span className="truncate">ENTER {selectedNode.levelNumber}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>

            {/* Interactive Unlocked Topics Map Progression Grid */}
            {selectedWorldProgress && selectedWorldProgress.topics.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase text-amber-400 font-mario flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>STAGE PROGRESSION (+50 COINS ON CLEAR)</span>
                  </span>
                  <div className="w-full sm:w-44 h-2 bg-slate-950 rounded-full border border-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-transform duration-300 origin-left"
                      style={{ transform: `scaleX(${selectedWorldProgress.percent / 100})` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {selectedWorldProgress.topics.map((topic) => {
                    const isShortcutKey = shortcutMapActive && isShortcutKeyTopic(topic.id);
                    return (
                      <div
                        key={topic.id}
                        data-testid={`map-topic-row-${topic.id}`}
                        className={`rounded-xl p-3 border-2 flex items-center justify-between gap-2.5 transition-all ${
                          isShortcutKey
                            ? 'bg-amber-950/55 border-amber-300 ring-2 ring-amber-400/50 text-white'
                            : topic.isCompleted
                            ? 'bg-emerald-950/45 border-emerald-400/80 text-white'
                            : topic.isUnlocked
                            ? 'bg-slate-800/90 border-amber-400/50 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectTopic) {
                              onSelectTopic(selectedNode.id, topic.id);
                            } else {
                              onSelectWorld(selectedNode.id);
                            }
                          }}
                          className="min-h-[44px] flex items-center gap-2.5 min-w-0 text-left flex-1 cursor-pointer"
                        >
                          <span
                            className={`w-9 h-9 rounded-lg border border-black flex items-center justify-center shrink-0 font-black text-xs font-mario ${
                              topic.isCompleted
                                ? 'bg-emerald-400 text-slate-950'
                                : topic.isUnlocked
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {topic.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                            ) : topic.isUnlocked ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                              <span className="font-black font-mono uppercase text-amber-300">
                                Stage {selectedNode.levelNumber.replace('WORLD ', '')}-{topic.stageOrder}
                              </span>
                              <span aria-hidden="true" className="text-slate-500">·</span>
                              <span className="text-slate-300 font-bold">{topic.badge}</span>
                              {isShortcutKey && (
                                <>
                                  <span aria-hidden="true" className="text-amber-400">·</span>
                                  <span className="inline-flex items-center gap-0.5 text-amber-300 font-black uppercase">
                                    <MapPin className="w-3 h-3" /> Key Bar Topic
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm font-black text-white mt-0.5 leading-snug break-words">
                              {topic.title}
                            </p>
                            {isShortcutKey && SHORTCUT_MAP_HIGHLIGHTS[topic.id] && (
                              <p className="text-[11px] text-amber-200 font-semibold mt-1 flex items-start gap-1 leading-snug break-words">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                                <span>{SHORTCUT_MAP_HIGHLIGHTS[topic.id].barShortcutNote}</span>
                              </p>
                            )}
                          </div>
                        </button>

                        {onToggleTopicComplete && (
                          <button
                            type="button"
                            onClick={() => onToggleTopicComplete(topic.id)}
                            data-testid={`map-toggle-complete-${topic.id}`}
                            aria-label={
                              topic.isCompleted
                                ? `Unmark ${topic.title} as complete`
                                : `Mark ${topic.title} as complete`
                            }
                            className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border border-black font-black text-[10px] font-mario inline-flex items-center justify-center gap-1 shrink-0 cursor-pointer transition-colors ${
                              topic.isCompleted
                                ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                                : 'bg-slate-700 hover:bg-amber-400 hover:text-slate-950 text-amber-300'
                            }`}
                          >
                            {topic.isCompleted ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">DONE</span>
                              </>
                            ) : (
                              <>
                                <MarioCoinIcon className="w-3.5 h-3.5" />
                                <span>+2</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dedicated Interactive World Summary Modal (Portaled + Single-Row Non-Covering Tab Bar) */}
      {summaryModalNode &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${summaryModalNode.levelNumber} Summary`}
            data-testid="world-summary-modal"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSummaryModalNode(null);
            }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none print:hidden"
          >
            <div
              data-testid="world-summary-modal-card"
              className="bg-[#1e293b] text-white w-[96vw] max-w-6xl rounded-3xl border-4 border-amber-400 shadow-[0_16px_48px_rgba(0,0,0,0.85)] overflow-hidden gap-3 p-3.5 sm:p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 border-b-2 border-slate-700 pb-2.5 shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 font-black shadow-[0_2px_0_#000] shrink-0">
                    <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-black uppercase text-amber-400 font-mario block truncate">
                      {summaryModalNode.levelNumber} COMPLETE STATUTORY DOSSIER
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <WorldGoalRing
                        percent={worldProgressMap[summaryModalNode.id]?.percent ?? 0}
                        size={30}
                      />
                      <h3 className="text-base sm:text-2xl font-black text-white font-display truncate">
                        {summaryModalNode.name}: {summaryModalNode.worldName}
                      </h3>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSummaryModalNode(null)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white border border-slate-600 inline-flex items-center justify-center cursor-pointer transition-colors shrink-0"
                  aria-label="Close World Summary"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Compact Single-Row Horizontal World Switcher Strip with Scroll Controls — Never Wraps Over Content */}
              <div className="flex items-center gap-1.5 pb-1.5 shrink-0 max-w-full border-b border-slate-800">
                <button
                  type="button"
                  aria-label="Scroll world tabs left"
                  onClick={(e) => {
                    const list = e.currentTarget.nextElementSibling as HTMLElement | null;
                    list?.scrollBy({ left: -200, behavior: 'smooth' });
                  }}
                  className="h-8 w-7 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 inline-flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div
                  role="tablist"
                  aria-label="Select World Summary"
                  data-testid="world-summary-tabs"
                  className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar"
                >
                  {MAP_NODES.map((nodeOpt) => {
                    const isCurrent = nodeOpt.id === summaryModalNode.id;
                    const shortPrefix = nodeOpt.levelNumber.startsWith('WORLD ')
                      ? `W${nodeOpt.levelNumber.replace('WORLD ', '')}`
                      : nodeOpt.levelNumber === 'HOLIDAY HUB'
                      ? 'Holidays'
                      : nodeOpt.levelNumber === 'WARP PIPE'
                      ? 'Calculator'
                      : '17 Regions';
                    const tabLabel = nodeOpt.levelNumber.startsWith('WORLD ')
                      ? `${shortPrefix}: ${nodeOpt.worldName}`
                      : shortPrefix;
                    return (
                      <button
                        key={nodeOpt.id}
                        type="button"
                        role="tab"
                        aria-selected={isCurrent}
                        onClick={(e) => {
                          setSummaryModalNode(nodeOpt);
                          setSelectedNodeId(nodeOpt.id);
                          e.currentTarget.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                            inline: 'center',
                          });
                          marioAudio.playClick();
                        }}
                        className={`h-8 px-2.5 sm:px-3 rounded-xl border text-[11px] sm:text-xs font-black whitespace-nowrap cursor-pointer transition-colors shrink-0 inline-flex items-center justify-center ${
                          isCurrent
                            ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <span>{tabLabel}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  aria-label="Scroll world tabs right"
                  onClick={(e) => {
                    const list = e.currentTarget.previousElementSibling as HTMLElement | null;
                    list?.scrollBy({ left: 200, behavior: 'smooth' });
                  }}
                  className="h-8 w-7 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 inline-flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Modal Body: Side-by-Side Overview + Multi-Column Stage Grid */}
              <div className="space-y-4 overflow-y-auto pr-1 flex-1 min-h-0">
                {/* Side-by-Side Top Overview Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                  <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-3.5 sm:p-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-sky-400 font-mario flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>THEME &amp; STATUTORY CODIFICATION</span>
                      </span>
                      <span className="text-xs font-bold font-mono text-amber-300">
                        {summaryModalNode.badge}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white">
                      {summaryModalNode.themeDescription}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      {summaryModalNode.summary}
                    </p>
                  </div>

                  {worldProgressMap[summaryModalNode.id] ? (
                    <div className="bg-slate-900 border-2 border-emerald-400/60 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[10px] font-black uppercase text-emerald-300 font-mario flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>WORLD COMPLETION &amp; LEVEL-UP STATUS</span>
                        </span>
                        <span className="text-xs font-mono font-black text-emerald-300 tabular-nums">
                          {worldProgressMap[summaryModalNode.id].completedCount}/
                          {worldProgressMap[summaryModalNode.id].totalCount} Stages Mastered (
                          {worldProgressMap[summaryModalNode.id].percent}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-700 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-green-300 transition-transform duration-300 origin-left"
                          style={{
                            transform: `scaleX(${Math.max(
                              0.03,
                              worldProgressMap[summaryModalNode.id].percent / 100
                            )})`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-300 font-medium">
                        {worldProgressMap[summaryModalNode.id].isWorldCleared
                          ? 'World 100% Mastered! All statutory standards and formulas completed.'
                          : 'Complete all stages in this world to trigger a +50 Gold Coins World Level-Up Bonus!'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-900 border-2 border-amber-400/50 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-center gap-1.5">
                      <span className="text-[10px] font-black uppercase text-amber-300 font-mario">
                        INTERACTIVE SPECIAL ZONE
                      </span>
                      <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                        Direct interactive tool and reference hub. Click Enter below to launch immediately.
                      </p>
                    </div>
                  )}
                </div>

                {/* Stage-by-Stage Wide Multi-Column Breakdown */}
                {(() => {
                  const modalWorldTopics = ALL_LAW_TOPICS.filter(
                    (t) => t.worldId === summaryModalNode.id
                  );
                  if (modalWorldTopics.length === 0) return null;
                  const stageGridCols =
                    modalWorldTopics.length === 1
                      ? 'grid-cols-1'
                      : modalWorldTopics.length === 2
                      ? 'grid-cols-1 md:grid-cols-2'
                      : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';

                  return (
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                        ALL {modalWorldTopics.length} STAGES &amp; KEY LEGAL DOCTRINES IN THIS WORLD
                      </span>

                      <div className={`grid ${stageGridCols} gap-3 items-stretch`}>
                        {modalWorldTopics.map((topic, sIdx) => {
                          const isDone = completedTopicIds?.includes(topic.id);
                          return (
                            <div
                              key={topic.id}
                              className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-2.5 h-full min-w-0 ${
                                isDone
                                  ? 'bg-emerald-950/40 border-emerald-400/80 text-white'
                                  : 'bg-slate-900 border-slate-700 text-slate-200'
                              }`}
                            >
                              <div className="space-y-2 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-300">
                                      <span className="font-mario text-[10px] text-amber-300 font-black">
                                        STAGE {summaryModalNode.levelNumber.replace('WORLD ', '')}-
                                        {sIdx + 1}
                                      </span>
                                      <span aria-hidden="true" className="text-slate-500">
                                        ·
                                      </span>
                                      <span className="font-bold text-slate-300">{topic.badge}</span>
                                      <span aria-hidden="true" className="text-slate-500">
                                        ·
                                      </span>
                                      <span className="font-mono font-bold text-sky-300">
                                        {topic.difficulty || 'Intermediate'}
                                      </span>
                                    </div>
                                    <h4 className="text-sm sm:text-base font-black text-white font-display leading-snug break-words">
                                      {topic.title}
                                    </h4>
                                  </div>

                                  <span
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mario font-bold shrink-0 border ${
                                      isDone
                                        ? 'bg-emerald-400 text-slate-950 border-black'
                                        : 'bg-slate-800 text-slate-400 border-slate-700'
                                    }`}
                                  >
                                    {isDone ? 'CLEARED' : 'UNREAD'}
                                  </span>
                                </div>

                                <p className="text-xs text-slate-300 leading-relaxed font-medium break-words">
                                  {topic.summary}
                                </p>
                              </div>

                              <div className="space-y-2 min-w-0">
                                {topic.keyDoctrines && topic.keyDoctrines.length > 0 && (
                                  <div className="pt-2 border-t border-slate-800/80">
                                    <span className="text-[10px] font-bold text-amber-300 font-mono block">
                                      Core Bar Doctrine:
                                    </span>
                                    <p className="text-xs text-slate-200 font-medium italic mt-0.5 break-words line-clamp-3">
                                      &ldquo;{topic.keyDoctrines[0]}&rdquo;
                                    </p>
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    const wId = summaryModalNode.id;
                                    setSummaryModalNode(null);
                                    if (onSelectTopic) {
                                      onSelectTopic(wId, topic.id);
                                    } else {
                                      onSelectWorld(wId);
                                    }
                                  }}
                                  className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-600 inline-flex items-center justify-between gap-2 cursor-pointer transition-colors min-w-0"
                                >
                                  <span className="truncate">Jump to Stage {sIdx + 1}</span>
                                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer Controls — Responsive & Zero Overflow */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-800 shrink-0 max-w-full">
                <button
                  type="button"
                  onClick={() => setSummaryModalNode(null)}
                  className="min-h-[42px] px-3.5 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-600 cursor-pointer whitespace-nowrap"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetId = summaryModalNode.id;
                    setSummaryModalNode(null);
                    onSelectWorld(targetId);
                  }}
                  className="min-h-[42px] px-4 sm:px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm border-2 border-black shadow-[0_3px_0_#000] inline-flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5 whitespace-nowrap max-w-full"
                >
                  <span className="truncate">Enter {summaryModalNode.levelNumber}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
