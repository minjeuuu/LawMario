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
} from 'lucide-react';
import { MarioCoinIcon, MarioCharacterAvatar, MarioStarIcon } from './MarioIcons';
import { marioAudio, AudioSettings, SOUND_PACK_DEFINITIONS } from '../utils/audio';
import { AudioSettingsModal } from './AudioSettingsModal';
import { ComplexityMode, MarioAvatar, StudyDifficulty } from '../types/laborLaw';
import { StudyTimer } from './StudyTimer';
import { LoginStreakCounter } from './LoginStreakCounter';
import { PWAInstallButton } from './PWAInstallButton';
import { MARIO_SOUNDSCAPES, MarioSoundscapeId } from '../utils/engagementFeatures';
import { ColorMode } from '../utils/profileAchievements';

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
  onOpenPrintGuide?: () => void;
  showLegalCitations?: boolean;
  setShowLegalCitations?: (show: boolean) => void;
  onOpenLeaderboard?: () => void;
  onStartQuickStudy?: () => void;
  superStarRemainingLabel?: string | null;
  shortcutMapActive?: boolean;
  onOpenLegalCitationsModal?: () => void;
  zenReadingMode?: boolean;
  onToggleZenReadingMode?: () => void;
}

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
  onOpenPrintGuide,
  showLegalCitations = true,
  setShowLegalCitations,
  onOpenLeaderboard,
  onStartQuickStudy,
  superStarRemainingLabel = null,
  shortcutMapActive = false,
  onOpenLegalCitationsModal,
  zenReadingMode = false,
  onToggleZenReadingMode,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showQuickAudioSliders, setShowQuickAudioSliders] = useState(false);
  const [showMoreToolsMenu, setShowMoreToolsMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [audioState, setAudioState] = useState<AudioSettings>({ ...marioAudio.settings });

  const mixerRef = useRef<HTMLDivElement | null>(null);
  const moreToolsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return marioAudio.subscribe((next) => setAudioState(next));
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

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    marioAudio.playTabSwitch();
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

  const navCategories = [
    {
      label: 'Study',
      items: [
        { id: 'map', label: 'World Map', icon: <Map className="w-4 h-4 text-amber-300 shrink-0" /> },
        { id: 'modules', label: 'Modules', icon: <BookOpen className="w-4 h-4 text-red-300 shrink-0" /> },
        { id: 'citations', label: 'Citations', icon: <Scale className="w-4 h-4 text-emerald-300 shrink-0" />, badge: 'Verbatim' },
        { id: 'holidays', label: 'Holidays', icon: <Calendar className="w-4 h-4 text-rose-300 shrink-0" />, badge: '12+' },
        { id: 'wages_matrix', label: '17 Regions', icon: <Grid className="w-4 h-4 text-blue-300 shrink-0" /> },
      ],
    },
    {
      label: 'Practice & Quizzes',
      items: [
        { id: 'flashcards', label: 'Flashcards', icon: <HelpCircle className="w-4 h-4 text-yellow-300 shrink-0" /> },
        { id: 'quiz', label: 'Quest & Boss', icon: <Trophy className="w-4 h-4 text-amber-300 shrink-0" /> },
      ],
    },
    {
      label: 'Games & Tools',
      items: [
        { id: 'vault', label: 'Arcade', icon: <Gamepad2 className="w-4 h-4 text-emerald-400 shrink-0" />, badge: '17' },
        { id: 'calculator', label: 'Calculator', icon: <Calculator className="w-4 h-4 text-cyan-300 shrink-0" /> },
        { id: 'shop', label: "Toad's Shop", icon: <ShoppingBag className="w-4 h-4 text-pink-300 shrink-0" /> },
      ],
    },
  ];

  const audioActive = audioState.enabled;
  const musicActive = audioState.musicEnabled && audioActive;
  const toadifyActive = Boolean(audioState.toadifyEnabled && audioState.enabled);
  const activeSoundscapeMeta =
    MARIO_SOUNDSCAPES.find((s) => s.id === audioState.soundscape) || MARIO_SOUNDSCAPES[0];

  return (
    <>
      <header
        data-testid="main-navbar"
        className="bg-[#1e293b] border-b-4 border-slate-950 shadow-[0_4px_0_rgba(0,0,0,0.5)] text-white select-none w-full max-w-full overflow-x-visible print:hidden relative z-40"
      >
        {/* Top Status & Power-Up HUD Bar — Zero-Overlap, Zero-Scroll, Zero-Crop */}
        {!zenMode && (
          <div className="bg-[#0f172a] border-b border-slate-800 px-1.5 min-[380px]:px-2 sm:px-4 py-1.5 flex items-center justify-between gap-1 sm:gap-2 text-xs font-semibold w-full max-w-full">
            {/* Zone 1: Hero Logo & Profile Button (The Logo IS the Profile Button) */}
            <button
              type="button"
              onClick={() => {
                onOpenProfile();
                marioAudio.playCoin();
              }}
              data-testid="navbar-profile-btn"
              aria-label={`Open Hero Profile (${unlockedAchievementsCount} of ${totalAchievementsCount} badges)`}
              title="Your Hero Profile & Milestone Achievements (Click to view badges & customize)"
              className="relative z-20 flex items-center gap-1 sm:gap-2 shrink-0 group hover:opacity-95 cursor-pointer bg-slate-900/90 hover:bg-slate-800/90 px-1 min-[380px]:px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xl border border-amber-400/60 shadow-[0_1px_0_#000] active:translate-y-0.5 transition-all"
            >
              <div
                data-testid="navbar-avatar-profile-btn"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-400 border-2 border-black inline-flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
              >
                <MarioCharacterAvatar character={equippedAvatar} className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col text-left leading-none min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-mario text-[8.5px] sm:text-[10px] tracking-tight uppercase text-amber-300 whitespace-nowrap">
                    <span className="sm:hidden">MARIO</span>
                    <span className="hidden sm:inline">MARIO LAW</span>
                  </span>
                  <span className="hidden md:inline-block px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[8px] font-bold border border-amber-400/40">
                    PROFILE
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-300 flex items-center gap-0.5 sm:gap-1 mt-0.5">
                  <Award className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  <span className="font-mono text-amber-200">{unlockedAchievementsCount}/{totalAchievementsCount}</span>
                  <span className="hidden sm:inline text-slate-400 font-semibold">Badges</span>
                </span>
              </div>
            </button>

            {/* Zone 2: Priority Power-Ups (2X Multiplier, Map), Wallet, Streak, Pomodoro, Theme, Audio & Tools */}
            <div className="flex items-center gap-0.5 min-[380px]:gap-1 sm:gap-1.5 shrink-0 flex-nowrap">
              {/* 1. Super Star 2X Coin Multiplier Power-Up — Dedicated Uncropped Slot */}
              {superStarRemainingLabel && (
                <button
                  type="button"
                  onClick={handleCoinClick}
                  data-testid="navbar-super-star-badge"
                  aria-label={`Super Star 2x Coin Multiplier Active, ${superStarRemainingLabel} remaining`}
                  title={`Super Star 2x Coin Multiplier Active (${superStarRemainingLabel} left) — Click to view Toad's Shop`}
                  className="h-7 px-1 min-[380px]:px-1.5 sm:px-2 inline-flex items-center justify-center gap-0.5 sm:gap-1 bg-gradient-to-r from-amber-300 via-emerald-300 to-amber-300 hover:brightness-105 text-slate-950 font-black rounded-lg border-2 border-black shadow-[0_1px_0_#000] cursor-pointer text-[10px] leading-none whitespace-nowrap tabular-nums shrink-0 animate-pulse"
                >
                  <MarioStarIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-mario text-[8.5px] sm:text-[9.5px]">2X</span>
                  <span className="hidden md:inline font-mono font-bold text-[10px]">
                    · {superStarRemainingLabel}
                  </span>
                </button>
              )}

              {/* 2. Shortcut Map Power-Up */}
              {shortcutMapActive && (
                <button
                  type="button"
                  onClick={handleCoinClick}
                  data-testid="navbar-shortcut-map-badge"
                  aria-label="Toad's Bar Exam Shortcut Map Power-Up Active"
                  title="Toad's Bar Exam Shortcut Map Active — Click to manage in Toad's Shop"
                  className="hidden md:inline-flex h-7 px-1.5 items-center justify-center gap-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-lg border border-black shadow-[0_1px_0_#000] cursor-pointer text-[10px] leading-none whitespace-nowrap shrink-0"
                >
                  <Map className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden 2xl:inline font-bold">Map</span>
                </button>
              )}

              {/* 3. Coin Counter / Toad's Shop Shortcut */}
              <button
                type="button"
                onClick={handleCoinClick}
                aria-label={`Coins: ${coins}. Open Toad's Shop`}
                title="Open Toad's Shop to spend coins!"
                data-testid="navbar-coin-counter"
                className="h-7 px-1 min-[380px]:px-1.5 sm:px-2 inline-flex items-center justify-center gap-0.5 sm:gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg border border-black shadow-[0_1px_0_#000] active:translate-y-0.5 cursor-pointer text-xs leading-none whitespace-nowrap tabular-nums shrink-0"
              >
                <MarioCoinIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="text-[9.5px] sm:text-xs font-mario">
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
                className={`inline-flex h-7 w-7 sm:w-auto sm:px-2 items-center justify-center gap-1 rounded-lg border font-black text-[11px] leading-none whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-[0_1px_0_#000] ${
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
                <span className="hidden md:inline font-bold text-[10px]">
                  {colorMode === 'dark' ? 'Dark' : 'Light'}
                </span>
              </button>

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
                          className="w-full bg-slate-900 border border-slate-700 hover:border-amber-400 rounded-lg text-xs font-bold px-2 py-1.5 text-white cursor-pointer focus:outline-hidden"
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
                    className="absolute right-0 top-full mt-2 w-72 bg-slate-950/95 border-3 border-amber-400 rounded-2xl p-3.5 shadow-[6px_6px_0_#000] z-50 text-white space-y-2.5 backdrop-blur-md"
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

                      {onOpenPrintGuide && (
                        <button
                          type="button"
                          data-testid="navbar-print-btn"
                          onClick={() => {
                            setShowMoreToolsMenu(false);
                            onOpenPrintGuide();
                            marioAudio.playClick();
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 shrink-0" />
                          <span>Print Guide</span>
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

        {/* Main Navigation Row: Clean Segmented Navigation Buttons */}
        <div className="px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-2 w-full max-w-full min-w-0">
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

          {/* Desktop Navigation — Single-Row Uniform h-9 Baseline Alignment with Zero Clipping */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-nowrap overflow-x-auto no-scrollbar flex-1 min-w-0"
          >
            {navCategories.flatMap((cat) => cat.items).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`h-9 px-2 xl:px-2.5 inline-flex items-center justify-center gap-1.5 rounded-xl font-black text-xs border-2 border-black transition-all cursor-pointer leading-none whitespace-nowrap shrink-0 ${
                  activeTab === item.id
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="hidden 2xl:inline-block text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-mario font-bold leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Mobile & Tablet Compact Navigation Bar — With Direct Menu & Search Buttons */}
          <div className="grid grid-cols-6 sm:flex lg:hidden items-center sm:justify-between w-full gap-1 sm:gap-1.5 min-w-0">
            <button
              type="button"
              aria-expanded={isMobileMenuOpen}
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                marioAudio.playClick();
              }}
              className="min-h-[44px] px-1 sm:px-3 inline-flex items-center justify-center gap-0.5 sm:gap-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border-2 border-black font-black text-[10px] sm:text-xs cursor-pointer leading-none whitespace-nowrap shrink-0"
            >
              <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
              <span>Menu</span>
              <ChevronDown
                className={`hidden min-[400px]:inline w-3 h-3 text-slate-400 shrink-0 transition-transform ${
                  isMobileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Direct Mobile & Tablet Quick Search Button */}
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
                className="min-h-[44px] px-1 sm:px-3 inline-flex items-center justify-center gap-0.5 sm:gap-1 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl border-2 border-amber-400 font-black text-[10px] sm:text-xs cursor-pointer leading-none whitespace-nowrap shrink-0 shadow-[0_1px_0_#000]"
              >
                <Search className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Search</span>
              </button>
            )}

            {[
              { id: 'map', mobileLabel: 'Map', tabletLabel: 'Map' },
              { id: 'modules', mobileLabel: 'Study', tabletLabel: 'Modules' },
              { id: 'flashcards', mobileLabel: 'Cards', tabletLabel: 'Cards' },
              { id: 'quiz', mobileLabel: 'Quiz', tabletLabel: 'Quiz' },
            ].map((quick) => (
              <button
                key={quick.id}
                type="button"
                onClick={() => handleTabClick(quick.id)}
                className={`min-h-[44px] px-1 sm:px-3.5 inline-flex items-center justify-center rounded-xl font-black text-[10px] sm:text-xs border-2 border-black leading-none whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === quick.id
                    ? 'bg-amber-400 text-slate-950 shadow-[0_1px_0_#000]'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <span className="sm:hidden">{quick.mobileLabel}</span>
                <span className="hidden sm:inline">{quick.tabletLabel}</span>
              </button>
            ))}
          </div>

          {/* Quick Search Shortcut Clicker (LG+ Desktop) */}
          <div className="relative hidden lg:flex items-center w-28 xl:w-40 shrink-0">
            <button
              type="button"
              data-testid="navbar-search-desktop-btn"
              onClick={() => {
                if (onOpenGlobalSearch) onOpenGlobalSearch();
                marioAudio.playClick();
              }}
              className="h-9 w-full inline-flex items-center justify-between gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-2.5 rounded-xl border-2 border-slate-700 text-xs transition-colors cursor-pointer leading-none"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Search className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Search...</span>
              </div>
              <kbd className="hidden xl:inline-block px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 shrink-0">
                Ctrl+K
              </kbd>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="block lg:hidden bg-slate-900 border-t-2 border-slate-700 p-3 space-y-3 max-h-[80vh] overflow-y-auto">
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

            {/* Quick Profile Achievements, App Guide, Toadify, Quick Study & Score Card */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenProfile();
                  marioAudio.playCoin();
                }}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>Badges ({unlockedAchievementsCount}/{totalAchievementsCount})</span>
              </button>

              <button
                type="button"
                onClick={handleToggleToadify}
                aria-pressed={toadifyActive}
                data-testid="mobile-toadify-toggle"
                className={`min-h-[44px] px-3 py-2 rounded-xl font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  toadifyActive ? 'bg-rose-500 text-white' : 'bg-slate-800 text-rose-200'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-white border border-black inline-flex items-center justify-center shrink-0">
                  <MarioCharacterAvatar character="toad" className="w-4 h-4" />
                </span>
                <span>{toadifyActive ? 'Toadify: ON' : 'Toadify: OFF'}</span>
              </button>

              {onStartQuickStudy && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onStartQuickStudy();
                    marioAudio.playPowerUp();
                  }}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-400 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>5-Min Quick Study</span>
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
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-indigo-600 text-white font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Trophy className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Score Card PNG</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenWalkthrough();
                    marioAudio.playClick();
                  }}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Compass className="w-4 h-4 shrink-0" />
                  <span>Full App Guide</span>
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

            <div className="space-y-3">
              {navCategories.map((cat) => (
                <div key={cat.label} className="space-y-1.5">
                  <span className="text-[10px] font-black font-mario text-amber-400 uppercase tracking-wider block">
                    {cat.label}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleTabClick(item.id)}
                        className={`min-h-[44px] flex items-center gap-2 p-2.5 rounded-xl font-black text-xs border-2 border-black text-left cursor-pointer transition-all ${
                          activeTab === item.id
                            ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
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
                  {onOpenPrintGuide && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenPrintGuide();
                        marioAudio.playClick();
                      }}
                      className="min-h-[42px] flex items-center justify-center gap-1.5 p-2 bg-emerald-600 text-white font-bold text-xs rounded-xl border border-black cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 shrink-0" />
                      <span>Print Guide</span>
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
      />
    </>
  );
};
