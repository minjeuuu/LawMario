import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  marioAudio,
  AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
  SOUND_PACK_DEFINITIONS,
  TabSfxType,
  CardSfxType,
  QuizSfxType,
} from '../utils/audio';
import {
  MARIO_SOUNDSCAPES,
  MarioSoundscapeId,
} from '../utils/engagementFeatures';
import {
  Volume2,
  VolumeX,
  X,
  Play,
  Pause,
  RotateCcw,
  Check,
  Music,
  Sliders,
  Disc3,
  ShoppingBag,
} from 'lucide-react';
import {
  MarioMushroomIcon,
  MarioCoinIcon,
  MarioPipeIcon,
  MarioStarIcon,
  MarioFireballIcon,
  Mario1UpIcon,
} from './MarioIcons';
import { ComplexityMode } from '../types/laborLaw';
import {
  DAILY_GOAL_INCREMENTS,
  cycleNextDailyGoalMinutes,
  normalizeDailyGoalMinutes,
  saveDailyGoalMinutes,
} from '../utils/round13Features';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  complexityMode?: ComplexityMode;
  setComplexityMode?: (mode: ComplexityMode) => void;
  showLegalCitations?: boolean;
  setShowLegalCitations?: (show: boolean) => void;
  onOpenShop?: () => void;
  dailyGoalMinutes?: number;
  onChangeDailyGoalMinutes?: (minutes: number) => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  complexityMode = 'beginner',
  setComplexityMode,
  showLegalCitations = true,
  setShowLegalCitations,
  onOpenShop,
  dailyGoalMinutes = 30,
  onChangeDailyGoalMinutes,
}) => {
  const [settings, setSettings] = useState<AudioSettings>({ ...marioAudio.settings });

  useEffect(() => {
    setSettings({ ...marioAudio.settings });
    return marioAudio.subscribe((next) => setSettings(next));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleEnabled = () => {
    const next = !settings.enabled;
    marioAudio.updateSettings({ enabled: next });
    if (next) marioAudio.playCoin();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    marioAudio.updateSettings({ volume: vol });
  };

  const handleTabSfxChange = (sfx: TabSfxType) => {
    marioAudio.updateSettings({ tabSfx: sfx });
  };

  const handleCardSfxChange = (sfx: CardSfxType) => {
    marioAudio.updateSettings({ cardSfx: sfx });
  };

  const handleQuizSfxChange = (sfx: QuizSfxType) => {
    marioAudio.updateSettings({ quizSfx: sfx });
  };

  const handleToggleSfx = () => {
    const next = !settings.sfxEnabled;
    marioAudio.updateSettings({ sfxEnabled: next });
    if (next) marioAudio.playCoin();
  };

  const handleToggleMusic = () => {
    const next = marioAudio.toggleBgm();
    if (next) marioAudio.playPowerUp();
  };

  const handleSelectSoundscape = (id: MarioSoundscapeId) => {
    marioAudio.setSoundscape(id, true);
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    marioAudio.updateSettings({ musicVolume: vol });
  };

  const handleToggleAmbiance = () => {
    const next = !settings.ambianceEnabled;
    if (next) {
      marioAudio.setStudyAmbience(
        settings.studyAmbience && settings.studyAmbience !== 'off'
          ? settings.studyAmbience
          : 'forest',
        true
      );
    } else {
      marioAudio.setStudyAmbience('off', false);
    }
  };

  const handleAmbianceVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    marioAudio.updateSettings({ ambianceVolume: vol });
  };

  const handleResetDefaults = () => {
    marioAudio.updateSettings({ ...DEFAULT_AUDIO_SETTINGS });
    marioAudio.playPowerUp();
  };

  const isMusicActive = settings.enabled && settings.musicEnabled;

  const modal = (
    <div
      role="dialog"
      aria-label="Mushroom Sound Settings"
      data-testid="audio-settings-modal"
      className="fixed inset-0 z-[140] flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto overscroll-contain touch-pan-y select-none print:hidden"
    >
      <div className="bg-[#1e293b] text-white w-full max-w-lg rounded-3xl border-4 border-slate-950 shadow-[8px_8px_0_#000] overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Modal Header */}
        <div className="bg-[#0f172a] p-3.5 sm:p-5 border-b-3 border-slate-700 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000] shrink-0">
              <Sliders className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-xs font-black uppercase text-amber-400 font-mario block truncate">
                SOUNDSCAPES &amp; SFX MIXER
              </span>
              <h2 className="text-base sm:text-2xl font-black text-white font-display leading-tight truncate">
                MUSHROOM SOUND SETTINGS
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Sound Settings"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 space-y-5 overflow-y-auto overscroll-contain touch-pan-y flex-1 min-h-0">
          {/* Master Sound Switch */}
          <div className="bg-slate-900/90 rounded-2xl p-3.5 sm:p-4 border-2 border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shrink-0 ${
                  settings.enabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {settings.enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <span className="font-black text-sm sm:text-base block">Master Audio</span>
                <span className="text-xs font-semibold text-slate-400 block">
                  {settings.enabled ? 'Synthesizer & soundscapes ready' : 'All audio globally muted'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleEnabled}
              className={`px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm border-2 border-black cursor-pointer shadow-[0_2px_0_#000] active:translate-y-0.5 transition-all shrink-0 ${
                settings.enabled
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
            >
              {settings.enabled ? 'ON' : 'MUTED'}
            </button>
          </div>

          {/* Global Legal Citations Toggle for Advanced / Bar Review Students */}
          {setShowLegalCitations && (
            <div
              data-testid="legal-citations-setting-card"
              className="bg-slate-900/90 rounded-2xl p-3.5 sm:p-4 border-2 border-amber-400/70 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
                  <MarioStarIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-black text-sm sm:text-base text-white">Legal Citations Display</span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-mario leading-none shrink-0">
                      BAR STUDY
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-0.5 leading-snug">
                    Reveal or hide explicit Article numbers (e.g. Art. 83) and Republic Acts in topic cards.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLegalCitations(!showLegalCitations);
                  marioAudio.playCoin();
                }}
                className={`px-3 py-2 rounded-xl font-black text-[10px] font-mario border-2 border-black cursor-pointer shadow-[0_2px_0_#000] active:translate-y-0.5 transition-all shrink-0 ${
                  showLegalCitations
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {showLegalCitations ? 'SHOWN' : 'HIDDEN'}
              </button>
            </div>
          )}

          {/* Ambient Mario Soundscape Selector + BGM Player */}
          <div className="bg-slate-900/95 rounded-2xl p-3.5 sm:p-4 border-2 border-amber-400/60 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Disc3
                  className={`w-5 h-5 text-amber-400 shrink-0 ${
                    isMusicActive ? 'animate-spin' : ''
                  }`}
                />
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-xs font-black uppercase text-amber-400 font-mario block leading-snug">
                    MARIO AMBIENT SOUNDSCAPES
                  </span>
                  <span className="text-xs text-slate-300 font-semibold block">
                    Choose a themed background study soundtrack
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleMusic}
                data-testid="modal-bgm-toggle"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs border-2 border-black cursor-pointer shadow-[0_2px_0_#000] transition-all shrink-0 ${
                  isMusicActive
                    ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
              >
                {isMusicActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span>PAUSE BGM</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span>PLAY BGM</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MARIO_SOUNDSCAPES.map((track) => {
                const isSelected = settings.soundscape === track.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => handleSelectSoundscape(track.id)}
                    data-testid={`soundscape-${track.id}`}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400 text-white shadow-[0_2px_0_#000]'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-black text-xs sm:text-sm font-display text-white">
                        {track.name}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-black font-mario border border-black ${track.accentClass}`}
                      >
                        {isSelected && isMusicActive ? 'LIVE' : track.shortName.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium leading-snug">
                      {track.subtitle}
                    </p>
                    <span className="text-[10px] font-mono text-amber-300/90 mt-1 block">
                      {track.bpmLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Independent Music & SFX Volume Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <Music className="w-3.5 h-3.5 text-emerald-400" />
                    Music Volume
                  </span>
                  <span>{Math.round((settings.musicVolume ?? 0.42) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  aria-label="Background Music Volume"
                  value={settings.musicVolume ?? 0.42}
                  onChange={handleMusicVolumeChange}
                  disabled={!settings.enabled}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 disabled:opacity-40"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    SFX Volume
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{Math.round((settings.volume ?? 0.8) * 100)}%</span>
                    <button
                      type="button"
                      onClick={handleToggleSfx}
                      disabled={!settings.enabled}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black font-mario cursor-pointer ${
                        settings.sfxEnabled && settings.enabled
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {settings.sfxEnabled && settings.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  aria-label="Sound Effects Volume"
                  value={settings.volume}
                  onChange={handleVolumeChange}
                  disabled={!settings.enabled || !settings.sfxEnabled}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40"
                />
              </div>
            </div>

            {/* Atmospheric Background Ambiance Toggle & Volume */}
            <div className="pt-2.5 border-t border-slate-800 space-y-2">
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] sm:text-xs font-black uppercase text-sky-400 font-mario block">
                    BACKGROUND AMBIANCE
                  </span>
                  <span className="text-[11px] text-slate-300 font-medium block leading-snug">
                    Subtle, loopable atmospheric game soundscapes (waterfall, underground dripping, castle fire) tied to theme
                  </span>
                </div>
                <button
                  type="button"
                  data-testid="ambiance-toggle-btn"
                  onClick={handleToggleAmbiance}
                  disabled={!settings.enabled}
                  className={`px-2.5 py-1.5 rounded-xl font-black text-[10px] font-mario border-2 border-black cursor-pointer shadow-[0_2px_0_#000] transition-all shrink-0 ${
                    settings.ambianceEnabled && settings.enabled
                      ? 'bg-sky-400 text-slate-950'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {settings.ambianceEnabled && settings.enabled ? 'AMBIANCE ON' : 'AMBIANCE OFF'}
                </button>
              </div>

              {settings.ambianceEnabled && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span className="text-[11px]">Ambiance Level</span>
                    <span className="font-mono">{Math.round((settings.ambianceVolume ?? 0.28) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    aria-label="Ambiance Volume"
                    value={settings.ambianceVolume ?? 0.28}
                    onChange={handleAmbianceVolumeChange}
                    disabled={!settings.enabled || !settings.ambianceEnabled}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 disabled:opacity-40"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content Complexity Mode Toggle */}
          <div className="bg-slate-900/90 rounded-2xl p-3.5 sm:p-4 border-2 border-slate-700 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-black uppercase text-amber-400 tracking-wider block font-mario">
                  CONTENT COMPLEXITY MODE
                </span>
                <span className="text-xs text-slate-300 font-semibold block">
                  Switch summary style for all memory aid modules
                </span>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black text-amber-300 border border-amber-400/50 font-mario shrink-0">
                {complexityMode === 'beginner' ? 'BEGINNER' : 'ADVANCED'}
              </span>
            </div>

            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (setComplexityMode) setComplexityMode('beginner');
                  marioAudio.playPowerUp();
                }}
                className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer min-w-0 ${
                  complexityMode === 'beginner'
                    ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-[10px] font-mario mb-1 leading-snug">
                  <MarioMushroomIcon className="w-4 h-4 shrink-0" />
                  <span className="break-words">Mushroom Kingdom</span>
                </div>
                <p className="text-[11px] font-medium leading-tight opacity-90">
                  Beginner: Plain-English practical takeaways &amp; easy rules of thumb.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (setComplexityMode) setComplexityMode('advanced');
                  marioAudio.playFireball();
                }}
                className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer min-w-0 ${
                  complexityMode === 'advanced'
                    ? 'bg-red-600 text-white border-black shadow-[0_2px_0_#000]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-[10px] font-mario mb-1 leading-snug">
                  <MarioStarIcon className="w-4 h-4 shrink-0" />
                  <span className="break-words">Bowser&apos;s Castle</span>
                </div>
                <p className="text-[11px] font-medium leading-tight opacity-90">
                  Advanced: Full codified articles, jurisprudence &amp; exhaustive exceptions.
                </p>
              </button>
            </div>
          </div>

          {/* Section 1: Tab Switch SFX */}
          <div className="space-y-3">
            <span className="text-[10px] sm:text-xs font-black uppercase text-amber-400 tracking-wider block font-mario">
              1. TAB SWITCH SOUND
            </span>
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
              {[
                { id: 'pipe', label: 'Warp Pipe', icon: <MarioPipeIcon className="w-4 h-4 shrink-0" />, play: () => marioAudio.playPipe() },
                { id: 'jump', label: 'Mario Jump', icon: <MarioMushroomIcon className="w-4 h-4 shrink-0" />, play: () => marioAudio.playJump() },
                { id: 'coin', label: 'Coin Clink', icon: <MarioCoinIcon className="w-4 h-4 shrink-0" />, play: () => marioAudio.playCoin() },
                { id: 'stomp', label: 'Enemy Stomp', icon: <MarioStarIcon className="w-4 h-4 shrink-0" />, play: () => marioAudio.playStomp() },
              ].map((opt) => (
                <div
                  key={opt.id}
                  className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border-2 transition-all min-w-0 ${
                    settings.tabSfx === opt.id
                      ? 'bg-amber-400/20 border-amber-400 text-white'
                      : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleTabSfxChange(opt.id as TabSfxType)}
                    className="flex items-center gap-2 font-bold text-xs sm:text-sm cursor-pointer flex-1 text-left min-w-0"
                  >
                    {opt.icon}
                    <span className="truncate">{opt.label}</span>
                  </button>
                  <button
                    type="button"
                    onClick={opt.play}
                    aria-label={`Sample ${opt.label}`}
                    title="Sample Sound"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-600 cursor-pointer shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Topic Completion / Quiz Celebration SFX */}
          <div className="space-y-3">
            <span className="text-[10px] sm:text-xs font-black uppercase text-amber-400 tracking-wider block font-mario">
              2. TOPIC COMPLETION &amp; QUIZ SOUND
            </span>
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
              {[
                { id: 'coin', label: 'Coin Collect', icon: <MarioCoinIcon className="w-4 h-4 shrink-0" />, play: () => marioAudio.playCoin() },
                { id: 'powerup', label: 'Super Mushroom', icon: <MarioMushroomIcon className="w-4 h-4 shrink-0" />, play: () => marioAudio.playPowerUp() },
                { id: 'fireball', label: 'Fireball', icon: <MarioFireballIcon className="w-4 h-4 shrink-0" />, play: () => marioAudio.playFireball() },
                { id: 'oneup', label: '1-Up Jingle', icon: <Mario1UpIcon className="w-4 h-4 shrink-0" />, play: () => marioAudio.playOneUp() },
              ].map((opt) => (
                <div
                  key={opt.id}
                  className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border-2 transition-all min-w-0 ${
                    settings.cardSfx === opt.id
                      ? 'bg-amber-400/20 border-amber-400 text-white'
                      : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleCardSfxChange(opt.id as CardSfxType)}
                    className="flex items-center gap-2 font-bold text-xs sm:text-sm cursor-pointer flex-1 text-left min-w-0"
                  >
                    {opt.icon}
                    <span className="truncate">{opt.label}</span>
                  </button>
                  <button
                    type="button"
                    onClick={opt.play}
                    aria-label={`Sample ${opt.label}`}
                    title="Sample Sound"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-600 cursor-pointer shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
              {[
                { id: 'fanfare' as const, label: 'Fanfare', play: () => marioAudio.playFanfare() },
                { id: 'star' as const, label: 'Star Theme', play: () => marioAudio.playStarTheme() },
                { id: 'oneup' as const, label: '1-Up Clear', play: () => marioAudio.playOneUp() },
              ].map((qOpt) => (
                <button
                  key={qOpt.id}
                  type="button"
                  onClick={() => {
                    handleQuizSfxChange(qOpt.id);
                    qOpt.play();
                  }}
                  className={`py-2 px-1.5 sm:px-2.5 rounded-xl border text-[11px] sm:text-xs font-bold cursor-pointer truncate ${
                    settings.quizSfx === qOpt.id
                      ? 'bg-emerald-500 text-slate-950 border-black font-black'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {qOpt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Dedicated 8-Bit Sound Board */}
          <div className="space-y-3 pt-2 border-t-2 border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-black uppercase text-amber-400 tracking-wider block font-mario">
                  3. INTERACTION SFX SOUND BOARD
                </span>
                <span className="text-xs text-slate-400 font-semibold block">
                  Preview coin collection, level-up, wrong-answer &amp; game-over cues
                </span>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black text-amber-300 font-mario border border-amber-400/40 shrink-0">
                8-BIT MIXER
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'coin' as const, label: 'Coin Collect', play: () => marioAudio.playCoin() },
                { key: 'jump' as const, label: 'Jump', play: () => marioAudio.playJump() },
                { key: 'powerup' as const, label: 'Power-Up', play: () => marioAudio.playPowerUp() },
                { key: 'pipe' as const, label: 'Warp Pipe', play: () => marioAudio.playPipe() },
                { key: 'stomp' as const, label: 'Quiz Miss', play: () => marioAudio.playWrongAnswer() },
                { key: 'boss' as const, label: 'Game Over', play: () => marioAudio.playGameOver() },
                { key: 'fireball' as const, label: 'Fireball', play: () => marioAudio.playFireball() },
                { key: 'fanfare' as const, label: 'Level Up', play: () => marioAudio.playLevelUp() },
              ].map((item) => {
                const isEnabled = settings.soundToggles?.[item.key] ?? true;

                return (
                  <div
                    key={item.key}
                    className={`p-2.5 rounded-xl border-2 transition-all flex flex-col justify-between gap-2 min-w-0 ${
                      isEnabled
                        ? 'bg-slate-900 border-amber-400/80 text-white'
                        : 'bg-slate-900/40 border-slate-700 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 min-w-0">
                      <span className="font-bold text-[11px] sm:text-xs truncate min-w-0">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const current = settings.soundToggles?.[item.key] ?? true;
                          const next = !current;
                          marioAudio.updateSettings({
                            soundToggles: {
                              ...settings.soundToggles,
                              [item.key]: next,
                            },
                          });
                        }}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-black font-mario cursor-pointer transition-all shrink-0 ${
                          isEnabled
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={item.play}
                      disabled={!settings.enabled}
                      title={`Sample ${item.label} Sound`}
                      className="flex items-center justify-center gap-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold border border-slate-600 disabled:opacity-40 cursor-pointer w-full"
                    >
                      <Play className="w-3 h-3 fill-current shrink-0" />
                      <span className="truncate">Test SFX</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Equipped Audio Pack & Synthesizer Timbre */}
          <div className="space-y-3 pt-2 border-t-2 border-slate-700" data-testid="audio-packs-section">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-black uppercase text-amber-400 tracking-wider block font-mario">
                  4. ACTIVE AUDIO PACK &amp; TIMBRE
                </span>
                <span className="text-xs text-slate-300 font-semibold block">
                  Equip soundpacks unlocked in Toad&apos;s Store to modify synthesized instruments
                </span>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mario border border-black shrink-0">
                STORE AUDIO PACKS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SOUND_PACK_DEFINITIONS.map((pack) => {
                const unlockedItemIds = (() => {
                  const defaults = [
                    'theme_overworld',
                    'avatar_mario',
                    'avatar_luigi',
                    'avatar_peach',
                    'sound_default',
                  ];
                  if (typeof window !== 'undefined') {
                    try {
                      const saved = localStorage.getItem('mario_unlocked_items');
                      if (saved) {
                        const parsed = JSON.parse(saved) as string[];
                        return Array.from(new Set([...defaults, ...parsed]));
                      }
                    } catch {
                      // fallback
                    }
                  }
                  return defaults;
                })();

                const isEquipped = settings.soundPack === pack.id;
                const isUnlocked = unlockedItemIds.includes(pack.id) || pack.defaultPrice === 0;

                return (
                  <div
                    key={pack.id}
                    data-testid={`settings-soundpack-${pack.id}`}
                    className={`p-3 rounded-2xl border-2 transition-all flex flex-col justify-between gap-2.5 min-w-0 ${
                      isEquipped
                        ? 'bg-amber-400/15 border-amber-400 text-white shadow-[0_2px_0_#000]'
                        : 'bg-slate-900/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                        <span className="font-black text-xs sm:text-sm text-white font-display leading-snug">
                          {pack.name}
                        </span>
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-900 text-amber-300 border border-black font-mario">
                            {pack.badge}
                          </span>
                          {isEquipped && (
                            <span className="text-[8px] font-black uppercase text-emerald-900 bg-emerald-300 px-1.5 py-0.5 rounded font-mario inline-flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3] shrink-0" />
                              <span>EQUIPPED</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {pack.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-slate-800">
                      {isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => marioAudio.toggleSoundPackFullTrack(pack.id)}
                          disabled={!settings.enabled}
                          data-testid={`settings-loop-soundpack-${pack.id}`}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black border cursor-pointer disabled:opacity-40 transition-colors ${
                            isEquipped && isMusicActive
                              ? 'bg-emerald-400 text-slate-950 border-black'
                              : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-600'
                          }`}
                        >
                          {isEquipped && isMusicActive ? (
                            <>
                              <Pause className="w-3 h-3 fill-current shrink-0" />
                              <span>Pause Loop</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current shrink-0" />
                              <span>Play Loop</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => marioAudio.previewSoundPack(pack.id)}
                          disabled={!settings.enabled}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold border border-slate-600 cursor-pointer disabled:opacity-40"
                        >
                          <Play className="w-3 h-3 fill-current shrink-0" />
                          <span>Sample Tone</span>
                        </button>
                      )}

                      {isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => marioAudio.setSoundPack(pack.id, true)}
                          disabled={isEquipped && isMusicActive}
                          className={`px-2.5 py-1 rounded-lg font-black text-[11px] border cursor-pointer transition-all ${
                            isEquipped && isMusicActive
                              ? 'bg-emerald-500 text-slate-950 border-black cursor-default'
                              : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-black shadow-[0_1px_0_#000]'
                          }`}
                        >
                          {isEquipped && isMusicActive ? 'Live' : 'Equip & Loop'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenShop) {
                              onClose();
                              onOpenShop();
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg font-black text-[11px] bg-red-600 hover:bg-red-500 text-white border border-black cursor-pointer shadow-[0_1px_0_#000]"
                        >
                          Store ({pack.defaultPrice}c)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Study Goal Customizer (15m to 120m in 15-Minute Increments) */}
          <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-700 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs font-black text-amber-300 block">
                  Daily Study Goal Target
                </span>
                <span className="text-[11px] text-slate-400">
                  Step in 15-minute increments (15m to 120m)
                </span>
              </div>
              <button
                type="button"
                data-testid="settings-modal-daily-goal-toggle-btn"
                onClick={() => {
                  const next = cycleNextDailyGoalMinutes(dailyGoalMinutes);
                  saveDailyGoalMinutes(
                    next,
                    typeof window !== 'undefined' ? window.localStorage : null
                  );
                  onChangeDailyGoalMinutes?.(next);
                  marioAudio.playCoin();
                }}
                className="min-h-[36px] px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] cursor-pointer tabular-nums max-w-full leading-tight text-center"
              >
                Daily Goal: {normalizeDailyGoalMinutes(dailyGoalMinutes)}m (+15m)
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {DAILY_GOAL_INCREMENTS.map((inc) => {
                const isSelected = normalizeDailyGoalMinutes(dailyGoalMinutes) === inc;
                return (
                  <button
                    key={inc}
                    type="button"
                    data-testid={`settings-modal-daily-goal-${inc}m`}
                    onClick={() => {
                      saveDailyGoalMinutes(
                        inc,
                        typeof window !== 'undefined' ? window.localStorage : null
                      );
                      onChangeDailyGoalMinutes?.(inc);
                      marioAudio.playCoin();
                    }}
                    className={`min-h-[34px] rounded-lg text-xs font-black border cursor-pointer tabular-nums ${
                      isSelected
                        ? 'bg-emerald-400 text-slate-950 border-black'
                        : 'bg-slate-950 text-slate-300 hover:text-white border-slate-700'
                    }`}
                  >
                    {inc}m
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#0f172a] p-3.5 sm:p-5 border-t-2 border-slate-700 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="w-full min-[420px]:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-600 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full min-[420px]:w-auto inline-flex items-center justify-center gap-1.5 px-5 sm:px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl border-2 border-black shadow-[0_2px_0_#000] cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3] shrink-0" />
            <span>Save &amp; Return</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' && document.body ? createPortal(modal, document.body) : modal;
};
