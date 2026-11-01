import React, { useState } from 'react';
import { MarioAvatar } from '../types/laborLaw';
import { HERO_ROSTER, getHeroMeta } from '../data/heroesData';
import { LaborKart } from './LaborKart';
import { Game2D } from './Game2D';
import { Game3D } from './Game3D';
import { CourtroomBossBattle } from './CourtroomBossBattle';
import { WarpPipeSorter } from './WarpPipeSorter';
import { LawCatcherGame } from './LawCatcherGame';
import {
  WhackAGoombaGame,
  MultiplierMemoryGame,
  ContractorBusterGame,
  BowsersBridgeGame,
  HolidayWageSorterGame,
} from './ArcadeMiniGames';
import {
  ToadHouseCoinSlots,
  World6LeaveMatcherGame,
  LakituCloudClimberGame,
} from './ExtraArcadeGames';
import {
  KoopaBrickBreakerGame,
  YoshiEggTossGame,
  BooBurdenMansionGame,
  ChronoPrescriptionBlitzGame,
} from './NewVaultGames';
import {
  HammerBrosPayrollBlitzGame,
  ToadetteDueProcessRelayGame,
  ShyGuyWageOrderFactoryGame,
  KamekDeadlineSpellbookGame,
} from './BonusVaultGames';
import {
  YoshiOvertimeExpressGame,
  LuigiNightShiftPoltergustGame,
  RosalinaWageObservatoryGame,
  PeachRoyalLeaveDispatchGame,
  WarioDeductionVaultGame,
  ToadsworthRetirementTribunalGame,
} from './MasterVaultGames';
import {
  MarioCharacterAvatar,
  MarioMushroomIcon,
  MarioQuestionBlockIcon,
  MarioStarIcon,
  MarioAxeIcon,
  MarioPipeIcon,
  MarioCoinIcon,
  MarioFireFlowerIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';
import {
  Gamepad2,
  Sparkles,
  ArrowRight,
  Hammer,
  ShieldCheck,
  Layers,
  Box,
  Users,
  Scale,
  Cloud,
  BookOpen,
  Crosshair,
  Eye,
  Timer,
  Disc,
  Factory,
  Wand2,
  ListOrdered,
  Clock,
  Moon,
  Stamp,
  Vault,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Shuffle,
} from 'lucide-react';
import { GameDoctrinesModal } from './GameDoctrinesModal';

import { QuizCompletionPayload } from '../utils/profileAchievements';

interface GameVaultProps {
  equippedAvatar: MarioAvatar;
  setEquippedAvatar: (avatar: MarioAvatar) => void;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  fontSize: 'normal' | 'large' | 'xlarge';
  onEarnCoins?: (amount: number) => void;
  onQuizCompleted?: (payload: QuizCompletionPayload) => void;
}

export type VaultGameId =
  | 'courtroom'
  | 'pipe_sorter'
  | 'catcher'
  | 'kart'
  | 'run2d'
  | 'island3d'
  | 'whack'
  | 'memory'
  | 'mansion'
  | 'bridge'
  | 'sorter'
  | 'toad_slots'
  | 'world6_clinic'
  | 'lakitu_climber'
  | 'koopa_breaker'
  | 'yoshi_toss'
  | 'boo_burden'
  | 'chrono_blitz'
  | 'hammer_blitz'
  | 'toadette_relay'
  | 'shy_conveyor'
  | 'kamek_duel'
  | 'yoshi_overtime'
  | 'luigi_nightshift'
  | 'rosalina_observatory'
  | 'peach_dispatch'
  | 'wario_vault'
  | 'toadsworth_tribunal';

export const GameVault: React.FC<GameVaultProps> = ({
  equippedAvatar,
  setEquippedAvatar,
  coins,
  setCoins,
  onEarnCoins,
  onQuizCompleted,
}) => {
  const [activeGame, setActiveGame] = useState<VaultGameId>('courtroom');
  const [showHeroPicker, setShowHeroPicker] = useState(false);
  const [showDoctrineModal, setShowDoctrineModal] = useState(false);
  const [compactVaultHeader, setCompactVaultHeader] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  const heroMeta = getHeroMeta(equippedAvatar);

  const handleEarnCoins = (amount: number) => {
    if (onEarnCoins && amount > 0) {
      onEarnCoins(amount);
    } else {
      setCoins((prev) => Math.max(0, prev + amount));
    }
    if (amount > 0) marioAudio.playCoin();
  };

  const handleAdjustCoins = (delta: number) => {
    if (delta > 0 && onEarnCoins) {
      onEarnCoins(delta);
    } else {
      setCoins((prev) => Math.max(0, prev + delta));
    }
  };

  const games: {
    id: VaultGameId;
    title: string;
    genre: string;
    desc: string;
    badge: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'courtroom',
      title: 'Courtroom Boss Battle',
      genre: 'Turn-Based Mario RPG',
      desc: 'Battle Employer Bowser in court! Counter illegal overtime, pregnancy dismissals, and deductions with statutory legal motions!',
      badge: 'BOSS RPG',
      icon: <Scale className="w-6 h-6 text-red-600" />,
    },
    {
      id: 'kart',
      title: 'Labor Kart GP (Drift Edition)',
      genre: 'Drift-Boost Mode-7 Racer',
      desc: 'Hop into corners with Shift/E or DRIFT button to charge Blue, Orange & Purple Mini-Turbo sparks across 3 laps!',
      badge: 'DRIFT RACER',
      icon: <MarioStarIcon className="w-6 h-6" />,
    },
    {
      id: 'run2d',
      title: 'Super Mario Legal Run',
      genre: 'Variable-Jump 2D Platformer',
      desc: 'Tap Jump for crisp short hops or hold Jump for high Mario arcs! Hit [?] blocks for World 1–6 Labor Law doctrines!',
      badge: '2D PHYSICS',
      icon: <MarioMushroomIcon className="w-6 h-6" />,
    },
    {
      id: 'island3d',
      title: '3D Mario Coin Island',
      genre: '3D Spatial Platformer',
      desc: 'Explore the 3D Mushroom Kingdom island with smooth momentum physics, hold-jump arcs, and solid AABB collisions!',
      badge: '3D ISLAND',
      icon: <Box className="w-6 h-6 text-indigo-600" />,
    },
    {
      id: 'world6_clinic',
      title: "Peach's World 6 Leave Clinic",
      genre: 'Statutory Leaves Dispatch',
      desc: 'Master SIL (5d), 105-Day Maternity, Paternity (7d), Solo Parent (7d), Gynecological (2m) & VAWC (10d) cases!',
      badge: 'WORLD 6 NEW',
      icon: <MarioFireFlowerIcon className="w-6 h-6" />,
    },
    {
      id: 'toad_slots',
      title: "Toad's Coin Treasury Slots",
      genre: 'Coin Wager & Bar Bonus',
      desc: 'Wager 5, 15, or 30 coins on statutory multiplier reels and answer instant Bar Trivia to double your coin jackpot!',
      badge: 'SPEND COINS',
      icon: <MarioCoinIcon className="w-6 h-6" />,
    },
    {
      id: 'lakitu_climber',
      title: "Lakitu's Bar Jackpot Climber",
      genre: 'Risk-Reward Sky Tower',
      desc: 'Buy Lakitu’s Cloud Shield (-12c) and climb 5 statutory floors to bank up to +120 coins per summit!',
      badge: 'CLOUD SHIELD',
      icon: <Cloud className="w-6 h-6 text-sky-600" />,
    },
    {
      id: 'pipe_sorter',
      title: 'Warp Pipe Labor Sorter',
      genre: 'Speed Classification Arcade',
      desc: 'Flick incoming employment tickets into Green Pipe (Covered / Mandatory) or Red Pipe (Exempt / Prohibited)!',
      badge: 'CLASSIFIER',
      icon: <MarioPipeIcon className="w-6 h-6" />,
    },
    {
      id: 'catcher',
      title: 'Super Mario Law Catcher',
      genre: 'Sky Drop Arcade',
      desc: 'Catch 13th month coins, 105-day leave mushrooms, and service charge stars while dodging unfair labor Thwomps!',
      badge: 'SKY CATCH',
      icon: <MarioStarIcon className="w-6 h-6" />,
    },
    {
      id: 'whack',
      title: 'Whack-a-Goomba Audit',
      genre: 'Reflex Pipe Smasher',
      desc: 'Smash illegal wage deductions popping from 9 pipes while sparing lawful Art. 113 deductions!',
      badge: 'ART. 113–116',
      icon: <Hammer className="w-6 h-6 text-rose-600" />,
    },
    {
      id: 'memory',
      title: 'Multiplier Memory Match',
      genre: 'Mario Party Flip Board',
      desc: 'Flip 16 Mystery [?] Blocks to pair work scenarios with statutory rates (125% to 390%)!',
      badge: '16 [?] BLOCKS',
      icon: <MarioQuestionBlockIcon className="w-6 h-6" />,
    },
    {
      id: 'mansion',
      title: 'Contractor Buster',
      genre: 'DOLE D.O. 174 Inspector',
      desc: 'Bust prohibited Labor-Only Ghost Agencies and certify valid ₱5M independent contractors!',
      badge: 'D.O. 174-17',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
    },
    {
      id: 'bridge',
      title: "Bowser's Bridge Rescue",
      genre: 'Statutory Term Decoder',
      desc: 'Decode Labor Code doctrines letter-by-letter to trigger the golden axe before the bridge falls!',
      badge: 'WORD AXE',
      icon: <MarioAxeIcon className="w-6 h-6" />,
    },
    {
      id: 'sorter',
      title: 'Dr. Mario Wage Sorter',
      genre: 'Holiday & Payroll Clinic',
      desc: 'Sort incoming Holiday & Rest Day payroll capsules into 100%, 130%–150%, or 200%–390% pipes!',
      badge: 'HOLIDAY PIPES',
      icon: <Layers className="w-6 h-6 text-cyan-600" />,
    },
    {
      id: 'koopa_breaker',
      title: 'Koopa Shell Statutory Breaker',
      genre: 'Breakout Physics Arcade',
      desc: 'Rebound a spinning Koopa Shell off your Mushroom Paddle to smash 24 Labor Code [?] multiplier blocks!',
      badge: 'NEW BREAKOUT',
      icon: <Disc className="w-6 h-6 text-emerald-600" />,
    },
    {
      id: 'yoshi_toss',
      title: "Yoshi's Statutory Egg Toss",
      genre: 'Trajectory Aim Shooter',
      desc: 'Aim Yoshi’s dotted arc and launch spotted eggs at floating 100%–390% statutory payroll rate clouds!',
      badge: 'NEW AIMING',
      icon: <Crosshair className="w-6 h-6 text-lime-600" />,
    },
    {
      id: 'boo_burden',
      title: "King Boo's Burden Mansion",
      genre: 'Evidentiary Spotlight',
      desc: 'Master Loon v. Power Master! Shine your Poltergust spotlight on Employer vs. Employee Burden of Proof!',
      badge: 'NEW EVIDENCE',
      icon: <Eye className="w-6 h-6 text-purple-600" />,
    },
    {
      id: 'chrono_blitz',
      title: 'Bob-omb Prescription Blitz',
      genre: 'Statutory Deadlines Defusal',
      desc: 'Cut the right wire (1 Yr ULP, 3 Yrs Money, 4 Yrs Dismissal, 5d NTE, 10d Appeal, 30d Notice) before boom!',
      badge: 'NEW DEFUSAL',
      icon: <Timer className="w-6 h-6 text-amber-600" />,
    },
    {
      id: 'hammer_blitz',
      title: 'Hammer Bros. Payroll Blitz',
      genre: '3-Lane Payroll Shield & Smash',
      desc: 'Guard the Castle Payroll Vault! Shield lawful statutory premiums and smash illegal undertime offsets & deductions!',
      badge: 'BONUS BLITZ',
      icon: <Hammer className="w-6 h-6 text-amber-700" />,
    },
    {
      id: 'toadette_relay',
      title: "Toadette's Twin-Notice Relay",
      genre: 'Procedural Sequence Builder',
      desc: 'Assemble chronological Just Cause, Authorized Cause, Disease, and Abandonment due process steps without nominal damages!',
      badge: 'DUE PROCESS',
      icon: <ListOrdered className="w-6 h-6 text-pink-600" />,
    },
    {
      id: 'shy_conveyor',
      title: "Shy Guy's Wage & D.O. 174 Belt",
      genre: 'Real-Time Factory Conveyor',
      desc: 'Inspect moving crates on Shy Guy’s factory belt: certify P5M contractors & Pineda formulas, and bust labor-only chits!',
      badge: 'CONVEYOR',
      icon: <Factory className="w-6 h-6 text-emerald-700" />,
    },
    {
      id: 'kamek_duel',
      title: "Kamek's Statutory Deadlines Duel",
      genre: 'Prescriptive Spell-Shield',
      desc: 'Reflect Kamek’s hexes by casting exact statutory prescriptive periods (1 Yr ULP, 3 Yrs Money, 4 Yrs Dismissal, 20 Yrs SSS)!',
      badge: 'SPELL DUEL',
      icon: <Wand2 className="w-6 h-6 text-indigo-600" />,
    },
    {
      id: 'yoshi_overtime',
      title: "Yoshi's Overtime Express",
      genre: 'World 1 OT & Undertime Rail',
      desc: 'Dispatch rapid overtime multipliers (125%, 169%, 260%) and block prohibited Art. 88 undertime offsets!',
      badge: 'ART. 87–88',
      icon: <Clock className="w-6 h-6 text-lime-600" />,
    },
    {
      id: 'luigi_nightshift',
      title: "Luigi's Night Shift Poltergust",
      genre: 'Graveyard 10PM–6AM Audit',
      desc: 'Sweep graveyard shift scenarios! Compute stacked +10% NSD rates and spot the <=5 worker retail exemption!',
      badge: 'ART. 86 NSD',
      icon: <Moon className="w-6 h-6 text-emerald-600" />,
    },
    {
      id: 'rosalina_observatory',
      title: "Rosalina's Wage Observatory",
      genre: 'Regional Wage & Distortion',
      desc: 'Calibrate RTWPB wage orders, apply the Pineda distortion formula, and distinguish facilities from supplements!',
      badge: 'ART. 97–124',
      icon: <Sparkles className="w-6 h-6 text-sky-600" />,
    },
    {
      id: 'peach_dispatch',
      title: "Peach's Royal Leave Dispatch",
      genre: 'Special Statutory Leaves',
      desc: 'Grant exact paid days for 105-Day Maternity, 7-Day Paternity, Solo Parent, VAWC, and Magna Carta for Women!',
      badge: 'SPECIAL LEAVES',
      icon: <Stamp className="w-6 h-6 text-pink-600" />,
    },
    {
      id: 'wario_vault',
      title: "Wario's Deduction Vault",
      genre: 'Wage Protection Tribunal',
      desc: 'Audit Wario’s payroll ledger! Approve lawful check-offs and block illegal loss deductions exceeding 20% weekly wage!',
      badge: 'ART. 113–116',
      icon: <Vault className="w-6 h-6 text-amber-600" />,
    },
    {
      id: 'toadsworth_tribunal',
      title: "Toadsworth's Retirement Tribunal",
      genre: 'R.A. 7641 & Separation Pay',
      desc: 'Adjudicate 22.5-day retirement pay, underground miner ages (50–60), and authorized cause separation multipliers!',
      badge: 'ART. 298–302',
      icon: <Scale className="w-6 h-6 text-purple-600" />,
    },
  ];

  const activeGameIndex = Math.max(0, games.findIndex((gm) => gm.id === activeGame));
  const activeGameMeta = games[activeGameIndex] || games[0];

  const handleStepGame = (delta: number) => {
    const nextIdx = (activeGameIndex + delta + games.length) % games.length;
    setActiveGame(games[nextIdx].id);
    marioAudio.playPipe();
  };

  const handleRandomGame = () => {
    if (games.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * games.length);
    if (nextIdx === activeGameIndex) {
      nextIdx = (nextIdx + 1) % games.length;
    }
    setActiveGame(games[nextIdx].id);
    marioAudio.playPowerUp();
  };

  return (
    <div className="space-y-2 sm:space-y-5 max-w-6xl mx-auto w-full min-w-0 overflow-x-hidden">
      {/* Game Vault Hero Banner (Single-row compact bar by default on phones so game fits screen immediately) */}
      <div className="bg-[#1e293b] text-white rounded-2xl sm:rounded-3xl p-2 sm:p-6 mario-card border-3 sm:border-4 border-slate-950 shadow-[4px_4px_0_#000] sm:shadow-[5px_5px_0_#000]">
        {compactVaultHeader ? (
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center shrink-0">
                <MarioCharacterAvatar character={equippedAvatar} className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[8.5px] sm:text-[9px] font-black uppercase text-amber-400 font-mario block truncate leading-tight">
                  {games.length} GAMES
                </span>
                <span className="text-[11px] sm:text-xs font-black font-display text-white block truncate leading-tight">
                  {heroMeta.shortName || heroMeta.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                type="button"
                data-testid="open-game-doctrines-btn"
                onClick={() => {
                  setShowDoctrineModal(true);
                  marioAudio.playPowerUp();
                }}
                className="min-h-[38px] sm:min-h-[40px] px-2 sm:px-2.5 inline-flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl border-2 border-black text-[10.5px] sm:text-[11px] cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:hidden">Rules</span>
                <span className="hidden sm:inline">Doctrines</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowHeroPicker((v) => !v);
                  marioAudio.playJump();
                }}
                className="min-h-[38px] sm:min-h-[40px] px-2 sm:px-2.5 inline-flex items-center justify-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black text-[10.5px] sm:text-[11px] cursor-pointer whitespace-nowrap"
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>{showHeroPicker ? 'Close' : 'Heroes'}</span>
              </button>
              <button
                type="button"
                aria-label="Expand Arcade Banner"
                onClick={() => setCompactVaultHeader(false)}
                className="min-h-[38px] sm:min-h-[40px] px-1.5 sm:px-2 inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-600 cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 bg-amber-400 rounded-2xl border-3 border-black flex items-center justify-center shadow-[0_3px_0_#000] shrink-0">
                <Gamepad2 className="w-7 h-7 text-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white font-black rounded-lg border border-black text-[10px] uppercase font-mario leading-relaxed mb-1">
                  <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                  <span>{games.length} PLAYABLE ARCADE GAMES • {HERO_ROSTER.length} HEROES</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-white font-display tracking-tight">
                  MARIO LABOR LAW GAME VAULT
                </h1>
                <p className="text-xs sm:text-sm font-bold text-slate-300 max-w-xl">
                  Play {games.length} interactive games covering Worlds 1–6, spend or multiply coins in Toad&apos;s Treasury, and equip any of the {HERO_ROSTER.length} Mushroom Kingdom heroes!
                </p>
              </div>
            </div>

            {/* Equipped Hero Quick Switcher & Read Doctrines Button */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full xl:w-auto shrink-0">
              <button
                type="button"
                data-testid="open-game-doctrines-btn"
                onClick={() => {
                  setShowDoctrineModal(true);
                  marioAudio.playPowerUp();
                }}
                className="min-h-[44px] px-4 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl border-2 border-black text-xs cursor-pointer shadow-[0_3px_0_#000] font-mario active:translate-y-0.5"
              >
                <BookOpen className="w-4 h-4 text-slate-950 shrink-0" />
                <span>READ DOCTRINES &amp; Q&amp;A</span>
              </button>

              <div className="flex items-center justify-between sm:justify-start gap-2.5 bg-slate-900 border-2 border-amber-400 rounded-2xl p-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center shrink-0">
                    <MarioCharacterAvatar character={equippedAvatar} className="w-7 h-7" />
                  </div>
                  <div className="pr-1 min-w-0">
                    <span className="text-[9px] font-black font-mario text-amber-400 uppercase block">
                      ACTIVE HERO
                    </span>
                    <span className="text-xs font-black font-display text-white block truncate">
                      {heroMeta.name}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowHeroPicker((v) => !v);
                    marioAudio.playJump();
                  }}
                  className="min-h-[40px] px-3.5 inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black text-xs cursor-pointer leading-none whitespace-nowrap shrink-0"
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>{showHeroPicker ? 'Close' : `${HERO_ROSTER.length} Heroes`}</span>
                </button>
                <button
                  type="button"
                  aria-label="Compact Arcade Banner"
                  title="Compact Header"
                  onClick={() => setCompactVaultHeader(true)}
                  className="min-h-[40px] px-2 inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-600 cursor-pointer shrink-0"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instant 34-Hero Picker Drawer */}
        {showHeroPicker && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-slate-700 grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2 max-h-[280px] overflow-y-auto pr-1">
            {HERO_ROSTER.map((h) => {
              const active = equippedAvatar === h.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setEquippedAvatar(h.id);
                    try {
                      localStorage.setItem('mario_equipped_avatar', h.id);
                    } catch {
                      // ignore
                    }
                    marioAudio.playCoin();
                  }}
                  className={`min-h-[60px] p-1.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                    active
                      ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  <MarioCharacterAvatar character={h.id} className="w-6 h-6 shrink-0" />
                  <span className="text-[10px] font-black truncate max-w-full">{h.shortName}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Compact Top Dropdown Game Chooser + Prev / Next / Random Switcher */}
      <div
        data-testid="vault-quick-switcher"
        className="bg-[#0f172a] border-2 border-slate-800 rounded-2xl p-2 sm:p-4 space-y-1.5 sm:space-y-2.5 w-full max-w-full min-w-0"
      >
        <div className="flex items-center justify-between gap-2 min-w-0">
          <label
            htmlFor="arcade-game-chooser-select"
            className="text-[9px] sm:text-[10px] font-black uppercase text-amber-400 font-mario tracking-wide shrink-0"
          >
            GAME {activeGameIndex + 1}/{games.length}
          </label>
          <div className="text-[11px] sm:text-xs font-bold text-slate-300 truncate min-w-0">
            {activeGameMeta.genre} · <span className="text-emerald-300">{activeGameMeta.badge}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1.5 sm:gap-2 w-full min-w-0">
          <div className="flex-1 min-w-0">
            <select
              id="arcade-game-chooser-select"
              data-testid="arcade-game-chooser-dropdown"
              aria-label="Choose Arcade Game"
              value={activeGame}
              onChange={(e) => {
                setActiveGame(e.target.value as VaultGameId);
                marioAudio.playPipe();
              }}
              className="w-full min-h-[42px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm border-2 border-amber-400 shadow-[0_2px_0_#000] cursor-pointer focus:outline-hidden"
            >
              {games.map((gm, idx) => (
                <option key={`opt-${gm.id}`} value={gm.id}>
                  {String(idx + 1).padStart(2, '0')}. {gm.title} — {gm.genre} [{gm.badge}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 md:flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              data-testid="arcade-prev-game-btn"
              onClick={() => handleStepGame(-1)}
              aria-label="Previous Arcade Game"
              className="min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-black text-xs border-2 border-black inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <ChevronLeft className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Prev</span>
            </button>
            <button
              type="button"
              data-testid="arcade-next-game-btn"
              onClick={() => handleStepGame(1)}
              aria-label="Next Arcade Game"
              className="min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-black text-xs border-2 border-black inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 text-amber-300 shrink-0" />
            </button>
            <button
              type="button"
              data-testid="arcade-random-game-btn"
              onClick={handleRandomGame}
              aria-label="Pick Random Arcade Game"
              className="min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Shuffle className="w-3.5 h-3.5 shrink-0" />
              <span>Random</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Game Surface First on Mobile for Immediate Thumb Reach, Followed by Full Game Shelf */}
      <div
        id="active-vault-game-stage"
        className="relative z-10 select-none w-full max-w-full min-w-0"
        onContextMenu={(e) => e.preventDefault()}
      >
        {activeGame === 'courtroom' && (
          <CourtroomBossBattle
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'pipe_sorter' && (
          <WarpPipeSorter equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'catcher' && (
          <LawCatcherGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'kart' && (
          <LaborKart equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'run2d' && (
          <Game2D equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'island3d' && (
          <Game3D equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'whack' && (
          <WhackAGoombaGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'memory' && (
          <MultiplierMemoryGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'mansion' && (
          <ContractorBusterGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'bridge' && (
          <BowsersBridgeGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'sorter' && (
          <HolidayWageSorterGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'toad_slots' && (
          <ToadHouseCoinSlots
            equippedAvatar={equippedAvatar}
            coins={coins}
            onAdjustCoins={handleAdjustCoins}
          />
        )}
        {activeGame === 'world6_clinic' && (
          <World6LeaveMatcherGame
            equippedAvatar={equippedAvatar}
            coins={coins}
            onAdjustCoins={handleAdjustCoins}
          />
        )}
        {activeGame === 'lakitu_climber' && (
          <LakituCloudClimberGame
            equippedAvatar={equippedAvatar}
            coins={coins}
            onAdjustCoins={handleAdjustCoins}
          />
        )}
        {activeGame === 'koopa_breaker' && (
          <KoopaBrickBreakerGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'yoshi_toss' && (
          <YoshiEggTossGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'boo_burden' && (
          <BooBurdenMansionGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'chrono_blitz' && (
          <ChronoPrescriptionBlitzGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
          />
        )}
        {activeGame === 'hammer_blitz' && (
          <HammerBrosPayrollBlitzGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
          />
        )}
        {activeGame === 'toadette_relay' && (
          <ToadetteDueProcessRelayGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
          />
        )}
        {activeGame === 'shy_conveyor' && (
          <ShyGuyWageOrderFactoryGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
          />
        )}
        {activeGame === 'kamek_duel' && (
          <KamekDeadlineSpellbookGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
          />
        )}
        {activeGame === 'yoshi_overtime' && (
          <YoshiOvertimeExpressGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'luigi_nightshift' && (
          <LuigiNightShiftPoltergustGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'rosalina_observatory' && (
          <RosalinaWageObservatoryGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'peach_dispatch' && (
          <PeachRoyalLeaveDispatchGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'wario_vault' && (
          <WarioDeductionVaultGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'toadsworth_tribunal' && (
          <ToadsworthRetirementTribunalGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
      </div>

      {/* 28-Game Selection Shelf */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {games.map((g) => {
          const isSelected = activeGame === g.id;
          return (
            <button
              key={g.id}
              type="button"
              data-testid={`launch-game-${g.id}`}
              onClick={() => {
                setActiveGame(g.id);
                marioAudio.playPipe();
                document
                  .getElementById('active-vault-game-stage')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }}
              className={`h-full text-left p-4 rounded-2xl border-4 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-400 border-slate-950 text-slate-950 shadow-[4px_4px_0_#000] -translate-y-0.5'
                  : 'bg-white border-slate-950 text-slate-900 hover:bg-amber-50 shadow-[3px_3px_0_#000]'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-black flex items-center justify-center shrink-0">
                    {g.icon}
                  </div>
                  <span
                    className={`text-[9px] font-black font-mario px-2 py-1 rounded-lg uppercase leading-none whitespace-nowrap ${
                      isSelected ? 'bg-slate-950 text-amber-300' : 'bg-slate-900 text-amber-300'
                    }`}
                  >
                    {g.badge}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                    {g.genre}
                  </span>
                  <h3 className="font-black text-base font-display text-slate-950 leading-snug">
                    {g.title}
                  </h3>
                  <p className="text-xs font-semibold leading-relaxed mt-1 text-slate-700">
                    {g.desc}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t-2 border-slate-950/15 flex items-center justify-between text-[11px] font-black font-mario">
                <span>{isSelected ? 'NOW PLAYING' : 'PLAY GAME'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Unabridged Game Legal Doctrines & Question Bank Modal */}
      <GameDoctrinesModal
        isOpen={showDoctrineModal}
        onClose={() => setShowDoctrineModal(false)}
        activeGameId={activeGame}
      />
    </div>
  );
};
