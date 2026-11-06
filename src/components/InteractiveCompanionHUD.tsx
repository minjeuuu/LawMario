import React, { useState, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  Zap,
  RotateCcw,
  Volume2,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Award,
  X,
  MessageCircle,
  ArrowLeftRight,
  Crown,
} from 'lucide-react';
import { MarioCharacterAvatar, MarioAvatar } from './MarioIcons';
import {
  resolveCompanionInteraction,
  resolveUniversalCardFrame,
  resolveEquippedRing,
  StudyCompanionId,
  type CardFrameId,
  type MarioEquippedRing,
} from '../utils/round12Features';
import { marioAudio } from '../utils/audio';

const COMPANION_AFFECTION_STORAGE_KEY = 'mario_companion_affection_v2';
const COMPANION_DOCK_STORAGE_KEY = 'mario_companion_dock_side_v1';

interface CompanionAffectionData {
  affectionXp: number; // 0 to 100 per level
  level: number; // 1 to 10
  happiness: number; // 0 to 100%
  patsCount: number;
  lastInteractionDate: string;
}

const HIGH_YIELD_LEGAL_DOCTRINES = [
  {
    topic: 'Four-Fold Test',
    rule: 'The right of CONTROL over means and methods is the most decisive element in determining an employer-employee relationship (Brotherhood Labor Unity v. Zamora).',
    citation: 'Art. 295 / Landmark Jurisprudence',
  },
  {
    topic: 'Twin-Notice Requirement',
    rule: 'Due process requires TWO written notices: 1) First notice specifying legal grounds with ample opportunity to be heard (min. 5 calendar days), and 2) Second notice of dismissal.',
    citation: 'King of Kings Transport v. Mamac',
  },
  {
    topic: 'Art. 302 Retirement Pay',
    rule: 'Statutory minimum retirement pay equals 1/2 month salary per year of service, where "1/2 month" is defined as 22.5 DAYS (15 days basic + 5 days SIL + 2.5 days 1/12th of 13th month)!',
    citation: 'Art. 302 [287] Labor Code / Capitol Wireless',
  },
  {
    topic: '13th Month Pay Computation',
    rule: '13th Month Pay = Total basic salary earned in a calendar year divided by 12. Must be paid on or before December 24 each year to all rank-and-file employees with >=1 month service.',
    citation: 'P.D. 851 & Revised Guidelines',
  },
  {
    topic: 'Service Charge 100% Distribution',
    rule: 'Under R.A. 11360, 100% of all service charges collected by hotels and restaurants must be distributed completely and equally among all covered employees (except managerial).',
    citation: 'R.A. 11360 / DOLE D.O. 206-19',
  },
  {
    topic: 'Prohibition Against Undertime Offset',
    rule: 'Undertime work on any particular day shall NEVER be offset by overtime work on any other day. Permission given to employee to leave early shall not exempt employer from paying OT premium.',
    citation: 'Art. 88 Labor Code',
  },
  {
    topic: 'Regular Holiday Multipliers',
    rule: 'Regular Holiday worked: 200% for first 8 hrs. Worked on scheduled rest day: 260%. Unworked: 100% (provided present or on paid leave on working day immediately preceding).',
    citation: 'Art. 94 / DOLE Holiday Pay Rules',
  },
  {
    topic: 'Labor-Only Contracting',
    rule: 'In Labor-Only Contracting (no substantial capital or contractor does not exercise control), the principal is deemed the DIRECT EMPLOYER for all intents and purposes.',
    citation: 'Art. 106 Labor Code / D.O. 174-17',
  },
  {
    topic: 'Night Shift Differential (NSD)',
    rule: 'Not less than 10% premium on regular wage for each hour of work performed between 10:00 PM and 6:00 AM.',
    citation: 'Art. 86 Labor Code',
  },
  {
    topic: 'Constructive Dismissal Doctrine',
    rule: 'Constructive dismissal occurs when continued employment is rendered impossible, unreasonable, or unlikely, or involves a demotion in rank and/or diminution in pay (clear discrimination/insensibility).',
    citation: 'SHS Perforated v. Diaz',
  },
];

export const AVAILABLE_COMPANIONS: {
  id: StudyCompanionId;
  name: string;
  role: string;
  avatarKey: MarioAvatar;
  bonus: string;
}[] = [
  {
    id: 'comp_counsel_toad',
    name: 'Lawyer Toad Esq.',
    role: 'Senior Codal Clerk',
    avatarKey: 'lawyertoad',
    bonus: '+2 Coins/Topic',
  },
  {
    id: 'comp_baby_yoshi',
    name: 'Baby Yoshi',
    role: 'Speedrun Reviewer',
    avatarKey: 'goldenyoshi',
    bonus: '+1 Coin/Topic',
  },
  {
    id: 'comp_luma_sage',
    name: 'Cosmic Luma Sage',
    role: 'Observatory Mentor',
    avatarKey: 'cosmicrosalina',
    bonus: '+2 Coins/Topic',
  },
  {
    id: 'comp_toadsworth',
    name: 'Chancellor Toadsworth',
    role: 'Constitutional Scholar',
    avatarKey: 'toad',
    bonus: '+3 Coins/Topic',
  },
  {
    id: 'comp_polterpup',
    name: 'Ghost Hound Polterpup',
    role: 'Night Shift Patrol',
    avatarKey: 'boo',
    bonus: '+2 Coins/Topic',
  },
  {
    id: 'gear_comp_cappy_counsel',
    name: 'Cappy Senior Counsel',
    role: 'Contracting Specialist',
    avatarKey: 'mario',
    bonus: '+2 Coins/Topic',
  },
  {
    id: 'comp_shy_guy_clerk',
    name: 'Shy Guy Court Stenographer',
    role: 'Verbatim Typist',
    avatarKey: 'shyguy',
    bonus: '+1 Coin/Topic',
  },
  {
    id: 'comp_kamek',
    name: 'Magikoopa Kamek',
    role: 'Jurisprudence Sorcerer',
    avatarKey: 'kamek',
    bonus: '+3 Coins/Topic',
  },
];

interface InteractiveCompanionHUDProps {
  equippedCompanionId: StudyCompanionId;
  onEquipCompanion: (id: StudyCompanionId) => void;
  onStartQuickStudy: () => void;
  onEarnCoins: (amount: number) => void;
  coins: number;
  completedTopicsCount: number;
  isToadTipOpen?: boolean;
  activeTab?: string;
  equippedCardFrame?: CardFrameId;
  equippedRing?: MarioEquippedRing;
}

export const InteractiveCompanionHUD: React.FC<InteractiveCompanionHUDProps> = ({
  equippedCompanionId,
  onEquipCompanion,
  onStartQuickStudy,
  onEarnCoins,
  coins,
  completedTopicsCount,
  isToadTipOpen = false,
  activeTab = 'map',
  equippedCardFrame = 'frame_default',
  equippedRing = 'ring_none',
}) => {
  // If user selected none, fallback gracefully to Lawyer Toad as default interactive tutor
  const effectiveCompanionId: StudyCompanionId =
    !equippedCompanionId || equippedCompanionId === 'comp_none'
      ? 'comp_counsel_toad'
      : equippedCompanionId;

  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('mario_companion_minimized_v2') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const [dockSide, setDockSide] = useState<'right' | 'left'>(() => {
    if (typeof window !== 'undefined') {
      try {
        return (localStorage.getItem(COMPANION_DOCK_STORAGE_KEY) as 'right' | 'left') || 'right';
      } catch {
        return 'right';
      }
    }
    return 'right';
  });

  // If Toad's Pro Tip is open or we are on the dashboard map tab, force docking to the right so they NEVER overlap
  const effectiveDockSide: 'right' | 'left' = (activeTab === 'map' || isToadTipOpen) ? 'right' : dockSide;
  const positionClasses = effectiveDockSide === 'right' ? 'right-3 sm:right-6' : 'left-3 sm:left-6';
  const verticalPositionClass = isToadTipOpen
    ? 'bottom-[380px] sm:bottom-[340px] lg:bottom-24'
    : 'bottom-20 sm:bottom-22 lg:bottom-6';

  const [isSwitcherOpen, setIsSwitcherOpen] = useState<boolean>(false);
  const [doctrineIdx, setDoctrineIdx] = useState<number>(0);
  const [customQuote, setCustomQuote] = useState<string | null>(null);
  const [petAnimationPulse, setPetAnimationPulse] = useState<boolean>(false);
  const [heartsFloating, setHeartsFloating] = useState<boolean>(false);

  // Companion Affection & Happiness state
  const [affection, setAffection] = useState<CompanionAffectionData>(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(COMPANION_AFFECTION_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            affectionXp: parsed.affectionXp ?? 25,
            level: parsed.level ?? 1,
            happiness: parsed.happiness ?? 80,
            patsCount: parsed.patsCount ?? 0,
            lastInteractionDate: parsed.lastInteractionDate ?? today,
          };
        }
      } catch {
        // fallback
      }
    }
    return {
      affectionXp: 25,
      level: 1,
      happiness: 85,
      patsCount: 0,
      lastInteractionDate: today,
    };
  });

  const saveAffection = (updated: CompanionAffectionData) => {
    setAffection(updated);
    try {
      localStorage.setItem(COMPANION_AFFECTION_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleToggleMinimize = () => {
    const next = !isMinimized;
    setIsMinimized(next);
    marioAudio.playClick();
    try {
      localStorage.setItem('mario_companion_minimized_v2', String(next));
    } catch {
      // ignore
    }
  };

  // Pet action
  const handlePetCompanion = () => {
    marioAudio.playPowerUp();
    setPetAnimationPulse(true);
    setHeartsFloating(true);
    setTimeout(() => setPetAnimationPulse(false), 600);
    setTimeout(() => setHeartsFloating(false), 1400);

    const nextPats = affection.patsCount + 1;
    let nextXp = affection.affectionXp + 5;
    let nextLevel = affection.level;
    const nextHappiness = Math.min(100, affection.happiness + 6);

    if (nextXp >= 100) {
      nextXp -= 100;
      nextLevel = Math.min(10, nextLevel + 1);
      marioAudio.playStageClear();
      onEarnCoins(10);
      setCustomQuote(`Level UP! Your companion is now Level ${nextLevel}! +10 Bonus Coins awarded!`);
    } else {
      const petResponses = [
        '*Happy purr!* "Always verify the 22.5-day retirement divisor on Bar Exam day!"',
        '*Wiggles enthusiastically!* "The control test is supreme under Art. 295!"',
        '*Jumps for joy!* "100% of service charges go directly to workers under RA 11360!"',
        '*Cheering!* "No offsetting undertime with overtime under Art. 88!"',
        '*Affectionate chirp!* "Twin notice due process requires min 5 days to explain!"',
      ];
      setCustomQuote(petResponses[nextPats % petResponses.length]);
    }

    saveAffection({
      affectionXp: nextXp,
      level: nextLevel,
      happiness: nextHappiness,
      patsCount: nextPats,
      lastInteractionDate: new Date().toISOString().slice(0, 10),
    });
  };

  // Feed Super Mushroom
  const handleFeedMushroom = () => {
    if (coins < 5) {
      marioAudio.playWrongAnswer();
      setCustomQuote('You need at least 5 Coins to feed a Super Mushroom treat!');
      return;
    }
    marioAudio.playCoin();
    setHeartsFloating(true);
    setTimeout(() => setHeartsFloating(false), 1200);

    onEarnCoins(-5);
    let nextXp = affection.affectionXp + 20;
    let nextLevel = affection.level;
    const nextHappiness = 100;

    if (nextXp >= 100) {
      nextXp -= 100;
      nextLevel = Math.min(10, nextLevel + 1);
      marioAudio.playStageClear();
      setCustomQuote(`MUSHROOM POWER-UP! Level ${nextLevel} reached! Companion happiness maxed at 100%!`);
    } else {
      setCustomQuote('Delicious 1-Up Mushroom! Companion happiness boosted to 100%! (+20 Affection XP)');
    }

    saveAffection({
      affectionXp: nextXp,
      level: nextLevel,
      happiness: nextHappiness,
      patsCount: affection.patsCount,
      lastInteractionDate: new Date().toISOString().slice(0, 10),
    });
  };

  // Next Legal Doctrine Tip
  const handleNextDoctrine = () => {
    marioAudio.playCoin();
    const nextIdx = (doctrineIdx + 1) % HIGH_YIELD_LEGAL_DOCTRINES.length;
    setDoctrineIdx(nextIdx);
    const item = HIGH_YIELD_LEGAL_DOCTRINES[nextIdx];
    setCustomQuote(`[${item.topic}] "${item.rule}" (${item.citation})`);
  };

  const currentMeta = resolveCompanionInteraction(
    effectiveCompanionId,
    completedTopicsCount + affection.patsCount
  );

  const resolvedUniversalFrame = resolveUniversalCardFrame(equippedCardFrame || 'frame_default');
  const resolvedRing = resolveEquippedRing(equippedRing);

  const activeDoctrine = HIGH_YIELD_LEGAL_DOCTRINES[doctrineIdx];
  const displayedSpeech = customQuote || currentMeta.speech || activeDoctrine.rule;

  // Minimized Floating Mario Badge — Anchored to designated side without ever colliding with Toad's Pro Tip
  if (isMinimized) {
    return (
      <div
        data-testid="study-companion-widget-minimized"
        className={`fixed ${verticalPositionClass} ${positionClasses} z-40 print:hidden animate-fade-in`}
      >
        <button
          type="button"
          onClick={handleToggleMinimize}
          title="Open Interactive Study Companion HUD"
          className="group relative flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-2 border-amber-400 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.7)] hover:border-amber-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <div
            className={`relative w-9 h-9 rounded-xl bg-amber-400 border-2 flex items-center justify-center shrink-0 shadow-[0_2px_0_#000] ${
              equippedCardFrame && equippedCardFrame !== 'frame_default'
                ? resolvedUniversalFrame.borderClasses
                : 'border-black'
            }`}
          >
            <MarioCharacterAvatar character={currentMeta.avatarKey as MarioAvatar} className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border border-black flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-slate-950" />
            </div>
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-[10px] font-black text-amber-300 uppercase font-mario block leading-none">
              {currentMeta.name.split(' ')[0]} (Lv.{affection.level})
            </span>
            <span className="text-[9px] text-emerald-300 font-mono font-bold block leading-none mt-0.5">
              {affection.happiness}% Happy · Tap to Chat
            </span>
          </div>
          <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <aside
      data-testid="study-companion-widget"
      aria-label="Interactive Mario Study Companion HUD"
      className={`fixed ${verticalPositionClass} ${positionClasses} z-40 max-w-[350px] sm:max-w-[400px] w-[calc(100vw-1.5rem)] print:hidden select-none animate-in fade-in slide-in-from-bottom-2 duration-200`}
    >
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-3 border-black text-white rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.85)] p-3.5 sm:p-4 space-y-3 overflow-hidden ring-2 ring-amber-400/80">
        {/* Floating Heart Particles */}
        {heartsFloating && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
            <div className="animate-bounce flex items-center gap-1.5 bg-rose-600/90 text-white px-3 py-1 rounded-full border border-black text-xs font-black shadow-lg">
              <Heart className="w-4 h-4 fill-current text-rose-300" />
              <span>+Love &amp; +Affection!</span>
            </div>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              onClick={handlePetCompanion}
              title="Click to Pet Companion!"
              className={`relative w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 border-2 flex items-center justify-center shrink-0 cursor-pointer shadow-[0_2px_0_#000] hover:scale-105 active:scale-95 transition-all ${
                equippedCardFrame && equippedCardFrame !== 'frame_default'
                  ? resolvedUniversalFrame.borderClasses
                  : 'border-black'
              } ${petAnimationPulse ? 'ring-4 ring-rose-400 animate-pulse' : ''}`}
            >
              <MarioCharacterAvatar character={currentMeta.avatarKey as MarioAvatar} className="w-8 h-8" />
              <div className="absolute -bottom-1 -right-1 bg-black text-amber-300 text-[8px] font-black font-mono px-1 rounded-sm border border-amber-400 leading-none">
                Lv.{affection.level}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-black text-amber-300 uppercase font-mario truncate">
                  {currentMeta.name}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  +{currentMeta.bonusCoinsPerTopic}c/Topic
                </span>
              </div>

              {/* Happiness Meter */}
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${affection.happiness}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-slate-300 font-bold shrink-0">
                  {affection.happiness}% Happy
                </span>
              </div>
            </div>
          </div>

          {/* Top Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                const next = effectiveDockSide === 'right' ? 'left' : 'right';
                setDockSide(next);
                try {
                  localStorage.setItem(COMPANION_DOCK_STORAGE_KEY, next);
                } catch {
                  // ignore
                }
                marioAudio.playClick();
              }}
              title={`Dock Companion to ${effectiveDockSide === 'right' ? 'Left' : 'Right'} Side`}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              title="Switch Mario Study Companion"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 cursor-pointer text-[10px] font-black font-mono px-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleToggleMinimize}
              title="Minimize Companion HUD"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Companion Switcher Popover */}
        {isSwitcherOpen && (
          <div className="p-2.5 rounded-xl bg-slate-950 border-2 border-amber-400 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-black text-amber-300">
              <span>SELECT MARIO STUDY COMPANION</span>
              <button
                type="button"
                onClick={() => setIsSwitcherOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto overscroll-contain">
              {AVAILABLE_COMPANIONS.map((comp) => {
                const isSelected = comp.id === effectiveCompanionId;
                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => {
                      onEquipCompanion(comp.id);
                      setIsSwitcherOpen(false);
                      marioAudio.playPowerUp();
                      setCustomQuote(`"I am ready to help you conquer the Philippine Labor Code!"`);
                    }}
                    className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-black font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-6 h-6 rounded bg-black/40 flex items-center justify-center shrink-0">
                      <MarioCharacterAvatar character={comp.avatarKey} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold block truncate leading-tight">
                        {comp.name}
                      </span>
                      <span className="text-[8px] font-mono text-emerald-400 block leading-tight">
                        {comp.bonus}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Equipped Relic Ring Passive Perk Display */}
        {resolvedRing.id !== 'ring_none' && (
          <div className="flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/90 border border-amber-400/70 text-[10px] font-mono text-amber-200 shadow-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-bold truncate text-white">{resolvedRing.name}</span>
            </div>
            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-mario shrink-0">
              {resolvedRing.badge}
            </span>
          </div>
        )}

        {/* Speech Bubble with Tail & Full Uncropped Doctrine / Advice */}
        <div className="relative bg-slate-950/95 border-2 border-amber-400/60 rounded-2xl p-3 text-slate-200 text-xs leading-relaxed shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold border-b border-slate-800/80 pb-1">
            <span className="flex items-center gap-1 font-mario text-[8px] uppercase tracking-wider text-amber-400">
              <MessageCircle className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{currentMeta.name.split(' ')[0]}&apos;s Doctrine Guidance</span>
            </span>
            <span className="font-mono text-[9px] text-emerald-300 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <span>
                {affection.happiness >= 90
                  ? 'Ecstatic'
                  : affection.happiness >= 70
                  ? 'Joyful'
                  : 'Attentive'}
              </span>
            </span>
          </div>
          <div className="max-h-36 overflow-y-auto overscroll-contain pr-1 font-medium text-slate-100 text-xs leading-relaxed select-text space-y-1">
            <p className="whitespace-pre-wrap">{displayedSpeech}</p>
            {activeDoctrine.citation && (
              <span className="text-[10px] text-amber-300 font-mono block italic">
                Citation: {activeDoctrine.citation}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-800/80 pt-1.5 font-mono">
            <span>Pats: {affection.patsCount} · Level XP: {affection.affectionXp}/100</span>
            <button
              type="button"
              onClick={handleNextDoctrine}
              className="text-amber-300 hover:text-amber-200 font-bold underline cursor-pointer"
            >
              Next Doctrine &rarr;
            </button>
          </div>
        </div>

        {/* Interactive Action Bar */}
        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={handlePetCompanion}
            title="Pet Companion (+5% Happiness, +5 XP)"
            className="px-2 py-1.5 rounded-xl bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-black text-[10px] border border-black shadow-[0_2px_0_#000] active:translate-y-0.5 cursor-pointer flex flex-col items-center justify-center gap-0.5"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Pet</span>
          </button>

          <button
            type="button"
            onClick={handleFeedMushroom}
            title="Feed Super Mushroom Treat (-5 Coins, +20 XP, 100% Happy)"
            className="px-2 py-1.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-[10px] border border-black shadow-[0_2px_0_#000] active:translate-y-0.5 cursor-pointer flex flex-col items-center justify-center gap-0.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Feed (5c)</span>
          </button>

          <button
            type="button"
            onClick={handleNextDoctrine}
            title="Ask High-Yield Legal Doctrine"
            className="px-2 py-1.5 rounded-xl bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-black text-[10px] border border-black shadow-[0_2px_0_#000] active:translate-y-0.5 cursor-pointer flex flex-col items-center justify-center gap-0.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Doctrine</span>
          </button>

          <button
            type="button"
            onClick={onStartQuickStudy}
            title="Launch 5-Minute Quick Study Blitz"
            className="px-2 py-1.5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-[10px] border border-black shadow-[0_2px_0_#000] active:translate-y-0.5 cursor-pointer flex flex-col items-center justify-center gap-0.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>5m Study</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
