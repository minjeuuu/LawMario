import React, { useState } from 'react';
import {
  BookOpen,
  Zap,
  Timer,
  AlertTriangle,
  RotateCcw,
  Scale,
  Award,
  Sparkles,
  Flame,
  ArrowRight,
  X,
  Target,
  FileCheck2,
  BrainCircuit,
  Calculator,
  Compass,
} from 'lucide-react';
import {
  MarioStarIcon,
  MarioMushroomIcon,
  MarioFireFlowerIcon,
  MarioCoinIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';

export type GlobalStudyLaunchMode =
  | 'exam_sim'
  | 'rapid_blitz'
  | 'weakness_gauntlet'
  | 'multiplier_test'
  | 'reverse_citation'
  | 'pomodoro_sprint'
  | 'flagpole_quiz';

interface GlobalStudyHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchMode: (mode: GlobalStudyLaunchMode, meta?: Record<string, unknown>) => void;
  activeStreakDays?: number;
  criticalTopicsCount?: number;
}

export const GlobalStudyHubModal: React.FC<GlobalStudyHubModalProps> = ({
  isOpen,
  onClose,
  onLaunchMode,
  activeStreakDays = 0,
  criticalTopicsCount = 0,
}) => {
  if (!isOpen) return null;

  const studyModes: {
    id: GlobalStudyLaunchMode;
    title: string;
    subtitle: string;
    badge: string;
    badgeColor: string;
    description: string;
    coinsReward: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'exam_sim',
      title: 'Bar Exam 10-Question Timed Sprint',
      subtitle: 'Official Mock Bar Simulation',
      badge: 'Bar Master',
      badgeColor: 'bg-red-600 text-white',
      description: '10 randomized high-yield questions across all 6 Labor Law Worlds with strict 6-minute clock and codal grading.',
      coinsReward: '+50 Coins',
      icon: <Scale className="w-5 h-5 text-amber-300" />,
    },
    {
      id: 'rapid_blitz',
      title: '60-Second Rapid Fire Blitz',
      subtitle: 'Survival Speedrun',
      badge: 'Fast Pace',
      badgeColor: 'bg-amber-500 text-slate-950',
      description: 'Answer as many rapid questions as possible in 60 seconds. Correct answers add +3s; incorrect answers cost 1 heart!',
      coinsReward: '+10 to +80 Coins',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'weakness_gauntlet',
      title: 'Weakest Doctrines Gauntlet',
      subtitle: 'Targeted Heatmap Remediation',
      badge: `${criticalTopicsCount > 0 ? `${criticalTopicsCount} Critical Areas` : 'Diagnostic'}`,
      badgeColor: 'bg-rose-600 text-white',
      description: 'Curates questions strictly from your highest-missed statutory sections (Articles 83-90, Service Charge, 13th Month).',
      coinsReward: '+40 Coins + XP',
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
    },
    {
      id: 'multiplier_test',
      title: 'Statutory Multiplier Table Drill',
      subtitle: 'Calculator & Wage Rate Training',
      badge: 'Math & Wages',
      badgeColor: 'bg-emerald-600 text-white',
      description: 'Master Philippine multiplier rates (Regular Holiday 200%, Special Holiday Rest Day 150%, Rest Day OT 169%).',
      coinsReward: '+30 Coins',
      icon: <Calculator className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'reverse_citation',
      title: 'Reverse Legal Citation Recitation',
      subtitle: 'Doctrine to Article/RA Matching',
      badge: 'Codal Memory',
      badgeColor: 'bg-blue-600 text-white',
      description: 'You are presented with a landmark legal doctrine or rule; identify the exact Article number or Republic Act.',
      coinsReward: '+35 Coins',
      icon: <BrainCircuit className="w-5 h-5 text-sky-400" />,
    },
    {
      id: 'pomodoro_sprint',
      title: '25-Minute Focus Study Sprint',
      subtitle: 'Deep Pomodoro with Mario Ambience',
      badge: 'Focus Sprint',
      badgeColor: 'bg-purple-600 text-white',
      description: 'Unbroken 25-minute deep retention study session. Enjoy lo-fi Mario world soundscapes and earn +60 coins!',
      coinsReward: '+60 Coins',
      icon: <Timer className="w-5 h-5 text-purple-300" />,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Study Options Hub"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-2.5 sm:p-5 overflow-y-auto overscroll-contain"
    >
      <div className="relative w-full max-w-3xl max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-3 border-black rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.9)] overflow-hidden text-white my-auto">
        {/* Sky Background Tint */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 pb-3 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0_#000]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black font-display text-white">
                Global Study Hub &amp; Exam Modes
              </h2>
              <p className="text-xs text-slate-300">
                Select your preferred bar preparation mode and challenge style
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              marioAudio.playPipe();
              onClose();
            }}
            aria-label="Close Study Hub"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 flex items-center justify-center cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Streak banner */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">
              Active Quiz Streak: <span className="text-amber-300 font-bold">{activeStreakDays} Days</span>
            </span>
          </div>

          <button
            onClick={() => {
              onLaunchMode('flagpole_quiz');
              onClose();
            }}
            className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
          >
            Climb Today&apos;s Flagpole &rarr;
          </button>
        </div>

        {/* Study Modes Grid */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {studyModes.map((mode) => (
            <div
              key={mode.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                marioAudio.playCoin();
                onLaunchMode(mode.id);
                onClose();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  marioAudio.playCoin();
                  onLaunchMode(mode.id);
                  onClose();
                }
              }}
              className="bg-slate-900/90 hover:bg-slate-800/90 border-2 border-slate-800 hover:border-amber-400 rounded-2xl p-4 transition-all flex flex-col justify-between gap-3 group shadow-sm text-left cursor-pointer active:scale-[0.99] focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center">
                      {mode.icon}
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-black font-mono ${mode.badgeColor}`}>
                      {mode.badge}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-amber-300">
                    {mode.coinsReward}
                  </span>
                </div>

                <h3 className="text-sm font-black text-white font-display group-hover:text-amber-300 transition-colors">
                  {mode.title}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono block mb-1">
                  {mode.subtitle}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {mode.description}
                </p>
              </div>

              <div
                className="w-full py-2 px-3 bg-amber-400 group-hover:bg-amber-300 text-slate-950 font-black text-xs uppercase rounded-xl border-2 border-black shadow-[0_2px_0_#000] flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Launch Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
