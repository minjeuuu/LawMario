import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Headphones,
  Scale,
  Music,
  Zap,
} from 'lucide-react';
import {
  STUDY_SPRINT_DURATION_SECONDS,
  STUDY_AMBIENCE_OPTIONS,
  StudyAmbiencePreset,
  evaluateStudySprintCompletion,
} from '../utils/round8Features';
import { MarioCoinIcon } from './MarioIcons';
import { marioAudio, AudioSettings } from '../utils/audio';

interface ModulesStudySprintProps {
  activeTab: string;
  onEarnCoins?: (amount: number) => void;
  onOpenStatuteLookup?: () => void;
}

export const ModulesStudySprint: React.FC<ModulesStudySprintProps> = ({
  activeTab,
  onEarnCoins,
  onOpenStatuteLookup,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(STUDY_SPRINT_DURATION_SECONDS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [switchedTabs, setSwitchedTabs] = useState<boolean>(false);
  const [completedSprints, setCompletedSprints] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const raw = localStorage.getItem('mario_modules_study_sprints_completed_v1');
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  });
  const [rewardBanner, setRewardBanner] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<AudioSettings>({ ...marioAudio.settings });

  const switchedTabsRef = useRef<boolean>(false);
  switchedTabsRef.current = switchedTabs;

  useEffect(() => {
    return marioAudio.subscribe((next) => setAudioState({ ...next }));
  }, []);

  // Detect tab switches or document visibility loss while a Study Sprint is running
  useEffect(() => {
    if (!isRunning) return;
    if (activeTab !== 'modules') {
      setSwitchedTabs(true);
    }
  }, [activeTab, isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setSwitchedTabs(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);
          const reward = evaluateStudySprintCompletion({
            completedFull25Minutes: true,
            switchedTabsDuringSprint: switchedTabsRef.current,
          });
          onEarnCoins?.(reward.totalCoins);
          marioAudio.playLevelUp();
          setCompletedSprints((c) => {
            const next = c + 1;
            try {
              localStorage.setItem('mario_modules_study_sprints_completed_v1', String(next));
            } catch {
              // ignore
            }
            return next;
          });
          setRewardBanner(
            reward.unbrokenFocus
              ? `25m Unbroken Focus Sprint Complete! +${reward.totalCoins} Gold Coins (+${reward.focusBonusCoins} Focus Bonus)!`
              : `25m Study Sprint Complete! +${reward.totalCoins} Gold Coins earned.`
          );
          setSecondsLeft(STUDY_SPRINT_DURATION_SECONDS);
          setSwitchedTabs(false);
          return STUDY_SPRINT_DURATION_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning, onEarnCoins]);

  const handleToggleRun = () => {
    setRewardBanner(null);
    if (!isRunning && secondsLeft === STUDY_SPRINT_DURATION_SECONDS) {
      setSwitchedTabs(false);
    }
    setIsRunning((r) => !r);
    marioAudio.playCoin();
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(STUDY_SPRINT_DURATION_SECONDS);
    setSwitchedTabs(false);
    setRewardBanner(null);
    marioAudio.playClick();
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const elapsedPct = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((STUDY_SPRINT_DURATION_SECONDS - secondsLeft) / STUDY_SPRINT_DURATION_SECONDS) * 100
      )
    )
  );

  const activeAmbience: StudyAmbiencePreset = audioState.studyAmbience || 'off';
  const ambiencePausedByBgm = marioAudio.isStudyAmbiencePausedByBgm();

  return (
    <section
      data-testid="modules-study-sprint-timer"
      aria-label="Study Sprint 25-Minute Pomodoro & Study Ambience"
      className="bg-slate-900 text-white rounded-2xl border-3 border-slate-950 p-3.5 sm:p-4 shadow-[4px_4px_0_#000] space-y-3 print:hidden"
    >
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Left: 25-Min Study Sprint Pomodoro */}
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
            <Timer className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-black text-amber-300 font-display">
                Study Sprint (25-Min Focus)
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              {!switchedTabs ? (
                <span className="inline-flex items-center gap-1 text-emerald-300 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Unbroken Focus (+60 Coins)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Tab Switched (+20 Base Coins)</span>
                </span>
              )}
              {completedSprints > 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-300 font-mono font-bold tabular-nums">
                    {completedSprints} Sprints Cleared
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium mt-0.5">
              Stay inside Modules for 25 minutes without switching tabs to earn an extra +40 Focus Bonus Coins!
            </p>
          </div>
        </div>

        {/* Center/Right: Countdown + Controls + Statute Lookup */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div
            data-testid="study-sprint-clock"
            className="min-h-[40px] px-3.5 rounded-xl bg-slate-950 border-2 border-amber-400/80 font-mono font-black text-base sm:text-lg text-amber-300 inline-flex items-center gap-2 tabular-nums"
          >
            <span>{formattedTime}</span>
            <MarioCoinIcon className="w-4 h-4 shrink-0" />
          </div>

          <button
            type="button"
            data-testid="study-sprint-start-pause-btn"
            onClick={handleToggleRun}
            className={`min-h-[40px] px-3.5 rounded-xl font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              isRunning
                ? 'bg-rose-500 hover:bg-rose-400 text-white'
                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>Pause Sprint</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>{secondsLeft < STUDY_SPRINT_DURATION_SECONDS ? 'Resume Sprint' : 'Start Sprint'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            data-testid="study-sprint-reset-btn"
            onClick={handleReset}
            title="Reset 25-minute Study Sprint"
            aria-label="Reset 25-minute Study Sprint"
            className="min-h-[40px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Reset</span>
          </button>

          {onOpenStatuteLookup && (
            <button
              type="button"
              data-testid="modules-open-statute-lookup-btn"
              onClick={() => {
                onOpenStatuteLookup();
                marioAudio.playPowerUp();
              }}
              className="min-h-[40px] px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Scale className="w-3.5 h-3.5 shrink-0" />
              <span>Statute Lookup</span>
            </button>
          )}
        </div>
      </div>

      {/* Musical Note Focus Gauge + Pure SVG Progress Track */}
      <div
        data-testid="study-sprint-musical-note-gauge"
        className="bg-slate-950/85 rounded-xl border border-slate-800 px-3 py-2 space-y-2"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="text-amber-300 font-display tracking-tight">
              Musical Note Focus Gauge
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className={switchedTabs ? 'text-amber-300' : 'text-emerald-300'}>
              {switchedTabs
                ? 'Focus Interrupted (+20 Base Coins)'
                : `${Math.min(8, Math.floor((elapsedPct / 100) * 8))}/8 Notes Charged (+40 Bonus Coins at 8/8)`}
            </span>
          </div>

          <div
            className="flex items-center gap-1"
            aria-label={`Focus musical notes: ${Math.min(8, Math.floor((elapsedPct / 100) * 8))} of 8 lit`}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((noteIdx) => {
              const filledNotes = Math.min(8, Math.floor((elapsedPct / 100) * 8));
              const isFilled = noteIdx < filledNotes;
              const isCurrentCharging = !switchedTabs && isRunning && noteIdx === filledNotes;
              return (
                <span
                  key={noteIdx}
                  data-testid={`sprint-note-${noteIdx}`}
                  className={`w-6 h-6 rounded-lg border text-xs font-black inline-flex items-center justify-center transition-all select-none ${
                    switchedTabs
                      ? 'bg-slate-900 border-slate-800 text-slate-600'
                      : isFilled
                      ? 'bg-amber-400 text-slate-950 border-black shadow-[0_1px_0_#000] scale-105'
                      : isCurrentCharging
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 animate-pulse'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {noteIdx === 7 ? (
                    <Zap className="w-3 h-3" />
                  ) : (
                    <Music className="w-3 h-3" />
                  )}
                </span>
              );
            })}
          </div>
        </div>

        <svg
          viewBox="0 0 100 3"
          preserveAspectRatio="none"
          className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden block"
          aria-hidden="true"
        >
          <rect
            x="0"
            y="0"
            width={Math.max(isRunning ? 2 : 0, elapsedPct)}
            height="3"
            fill={switchedTabs ? '#fbbf24' : '#34d399'}
          />
        </svg>
      </div>

      {/* Bottom Row: Study Ambience Soundscapes (All 6 Audible Presets) */}
      <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-300 min-w-0">
          <Headphones className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="font-bold">Study Ambience:</span>
          {ambiencePausedByBgm ? (
            <span className="text-[11px] font-bold text-amber-300 truncate">
              Click any ambience preset to switch from BGM
            </span>
          ) : activeAmbience !== 'off' && !audioState.enabled ? (
            <span className="text-[11px] font-bold text-rose-300 truncate">
              Muted globally (press M to unmute)
            </span>
          ) : activeAmbience !== 'off' ? (
            <span className="text-[11px] font-bold text-emerald-300 truncate">
              Playing {STUDY_AMBIENCE_OPTIONS.find((o) => o.id === activeAmbience)?.label}
            </span>
          ) : null}
        </div>

        <div
          role="group"
          aria-label="Study Ambience Soundscape Selector"
          className="flex flex-wrap items-center gap-1.5"
        >
          {STUDY_AMBIENCE_OPTIONS.map((opt) => {
            const isSelected = activeAmbience === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                data-testid={`modules-ambience-${opt.id}`}
                onClick={() => {
                  if (opt.id !== 'off' && !audioState.enabled) {
                    marioAudio.toggleMute();
                  }
                  marioAudio.setStudyAmbience(opt.id, true);
                }}
                title={opt.subtitle}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-sky-400 text-slate-950 border-black font-black'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {rewardBanner && (
        <div className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center justify-between gap-2">
          <span>{rewardBanner}</span>
          <button
            type="button"
            onClick={() => setRewardBanner(null)}
            className="text-emerald-300 hover:text-white font-black px-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </section>
  );
};
