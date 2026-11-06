import React, { useState, useEffect } from 'react';
import { MarioAvatar } from '../types/laborLaw';
import { HERO_ROSTER, getHeroMeta } from '../data/heroesData';
import { LaborKart } from './LaborKart';
import { Game2D } from './Game2D';
import { Game3D } from './Game3D';
import { CourtroomBossBattle } from './CourtroomBossBattle';
import { WarpPipeSorter } from './WarpPipeSorter';
import { LawCatcherGame } from './LawCatcherGame';
import { CoinRushArcadeGame } from './CoinRushArcadeGame';
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
  CaptainToadMinecartGame,
  DaisyHolidayDerbyGame,
  DryBonesCryptGame,
  PaulineWageConcertGame,
} from './RoyalVaultGames';
import {
  LakituSkybridgeDashGame,
  DolePayrollStampDeskGame,
  MushroomUnionTowerDefenseGame,
  KoopaPinballBumperArenaGame,
  BarCodalWordHuntGame,
  LaborCommissionerBalanceSimGame,
} from './EngagingArcadeGames';
import {
  WarpPipeWhackAViolationGame,
  YoshiEggCatchDropGame,
  LuigiGhostClauseFlashlightGame,
  MarioKartWageOrderDriftGame,
  ToadConveyorWageSorterGame,
  BowserBridgeAxeTimingGame,
  PeachMysteryBlockPairMatchGame,
  ChainChompTugOfWarGame,
} from './MarioArcadeExpansion';
import {
  loadRound10VaultState,
  saveRound10VaultState,
  Round10VaultState,
} from '../utils/round10Features';
import {
  COIN_MAGNET_ACTIVE_KEY,
  ArcadeBestPlayEntry,
  loadArcadeBestPlays,
  recordArcadeBestPlay,
  dispatchDailyMissionEvent,
} from '../utils/round11Features';
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
  Compass,
  Sun,
  ShieldAlert,
  Music,
  Magnet,
  Trophy,
  RotateCcw,
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
  | 'coin_rush'
  | 'pipe_whack_violation'
  | 'yoshi_egg_catch'
  | 'luigi_ghost_clause'
  | 'kart_wage_drift'
  | 'toad_conveyor_sorter'
  | 'bowser_axe_timing'
  | 'peach_block_match'
  | 'chomp_tug_of_war'
  | 'skybridge_dash'
  | 'payroll_stamp_desk'
  | 'union_tower_defense'
  | 'koopa_pinball'
  | 'codal_word_hunt'
  | 'commissioner_sim'
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
  | 'toadsworth_tribunal'
  | 'captain_toad_minecart'
  | 'daisy_holiday_derby'
  | 'dry_bones_crypt'
  | 'pauline_wage_concert';

export const PURE_ACTION_GAME_IDS = new Set<VaultGameId>([
  'coin_rush',
  'pipe_whack_violation',
  'yoshi_egg_catch',
  'bowser_axe_timing',
  'chomp_tug_of_war',
  'catcher',
  'whack',
  'hammer_blitz',
  'chrono_blitz',
  'kamek_duel',
  'run2d',
  'island3d',
  'skybridge_dash',
  'kart',
  'kart_wage_drift',
  'koopa_pinball',
  'koopa_breaker',
  'yoshi_toss',
  'payroll_stamp_desk',
  'toad_conveyor_sorter',
  'pipe_sorter',
  'sorter',
  'shy_conveyor',
  'mansion',
  'luigi_ghost_clause',
  'union_tower_defense',
  'commissioner_sim',
  'codal_word_hunt',
  'peach_block_match',
  'memory',
  'bridge',
  'toad_slots',
  'lakitu_climber',
  'courtroom',
]);

export const GameVault: React.FC<GameVaultProps> = ({
  equippedAvatar,
  setEquippedAvatar,
  coins,
  setCoins,
  onEarnCoins,
  onQuizCompleted,
}) => {
  const [activeGame, setActiveGame] = useState<VaultGameId>('pipe_whack_violation');
  const [replayNonce, setReplayNonce] = useState<number>(0);
  const [genreFilter, setGenreFilter] = useState<
    | 'all'
    | 'pure_action'
    | 'action_reflex'
    | 'platformer_kart'
    | 'inspection_sim'
    | 'strategy_puzzle'
    | 'courtroom_tribunal'
  >('all');
  const [showHeroPicker, setShowHeroPicker] = useState(false);
  const [showDoctrineModal, setShowDoctrineModal] = useState(false);
  const [compactVaultHeader, setCompactVaultHeader] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  const [vaultTokens, setVaultTokens] = useState<Round10VaultState>(() =>
    loadRound10VaultState()
  );
  const [doublePayoutActive, setDoublePayoutActive] = useState(false);
  const [bonusShieldActive, setBonusShieldActive] = useState(false);
  const [coinMagnetActive, setCoinMagnetActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(COIN_MAGNET_ACTIVE_KEY) === 'true';
  });
  const [bestPlays, setBestPlays] = useState<ArcadeBestPlayEntry[]>(() =>
    typeof window !== 'undefined' ? loadArcadeBestPlays(window.localStorage) : []
  );
  const [showBestPlays, setShowBestPlays] = useState<boolean>(true);
  const [boostNotice, setBoostNotice] = useState<string | null>(null);

  useEffect(() => {
    const syncMagnet = () => {
      if (typeof window !== 'undefined') {
        setCoinMagnetActive(localStorage.getItem(COIN_MAGNET_ACTIVE_KEY) === 'true');
      }
    };
    window.addEventListener('mario-coin-magnet-updated', syncMagnet);
    return () => window.removeEventListener('mario-coin-magnet-updated', syncMagnet);
  }, []);

  const heroMeta = getHeroMeta(equippedAvatar);

  const syncSaveTokens = (next: Round10VaultState) => {
    setVaultTokens(next);
    saveRound10VaultState(next);
  };

  const handleActivate2xBoost = () => {
    if (doublePayoutActive) return;
    if (vaultTokens.inventory.arcade2x > 0) {
      syncSaveTokens({
        ...vaultTokens,
        inventory: {
          ...vaultTokens.inventory,
          arcade2x: vaultTokens.inventory.arcade2x - 1,
        },
      });
      setDoublePayoutActive(true);
      setBoostNotice('2x Arcade Coin Payout Ticket Activated!');
      marioAudio.playPowerUp();
    } else if (coins >= 15) {
      setCoins((c) => Math.max(0, c - 15));
      setDoublePayoutActive(true);
      setBoostNotice('Spent 15 Coins · 2x Arcade Coin Multiplier Active!');
      marioAudio.playPowerUp();
    } else {
      marioAudio.playStomp();
    }
  };

  const handleActivateShieldBoost = () => {
    if (bonusShieldActive) return;
    if (vaultTokens.inventory.arcadeShield > 0) {
      syncSaveTokens({
        ...vaultTokens,
        inventory: {
          ...vaultTokens.inventory,
          arcadeShield: vaultTokens.inventory.arcadeShield - 1,
        },
      });
      setBonusShieldActive(true);
      setBoostNotice('Bonus Shield & Extra HP Activated!');
      marioAudio.playPowerUp();
    } else if (coins >= 15) {
      setCoins((c) => Math.max(0, c - 15));
      setBonusShieldActive(true);
      setBoostNotice('Spent 15 Coins · Bonus Shield & Extra HP Active!');
      marioAudio.playPowerUp();
    } else {
      marioAudio.playStomp();
    }
  };

  const handleBuyRadarCharge = () => {
    if (coins < 10) {
      marioAudio.playStomp();
      return;
    }
    setCoins((c) => Math.max(0, c - 10));
    syncSaveTokens({
      ...vaultTokens,
      inventory: {
        ...vaultTokens.inventory,
        arcadeRadar: vaultTokens.inventory.arcadeRadar + 2,
      },
    });
    setBoostNotice('Spent 10 Coins · Added +2 Inspector Radar Charges!');
    marioAudio.playCoin();
  };

  const handleConsumeRadar = () => {
    if (vaultTokens.inventory.arcadeRadar <= 0) return;
    syncSaveTokens({
      ...vaultTokens,
      inventory: {
        ...vaultTokens.inventory,
        arcadeRadar: Math.max(0, vaultTokens.inventory.arcadeRadar - 1),
      },
    });
  };

  const handleToggleOrBuyCoinMagnet = () => {
    let unlocked: string[] = [];
    try {
      unlocked = JSON.parse(localStorage.getItem('mario_unlocked_items') || '[]');
    } catch {
      unlocked = [];
    }
    const ownsMagnet = unlocked.includes('powerup_coin_magnet');
    if (ownsMagnet || coinMagnetActive) {
      const next = !coinMagnetActive;
      setCoinMagnetActive(next);
      try {
        localStorage.setItem(COIN_MAGNET_ACTIVE_KEY, String(next));
      } catch {
        // ignore
      }
      setBoostNotice(next ? 'Coin Magnet Field Activated!' : 'Coin Magnet Field Paused');
      marioAudio.playPowerUp();
      return;
    }
    if (coins < 20) {
      marioAudio.playStomp();
      return;
    }
    setCoins((c) => Math.max(0, c - 20));
    setCoinMagnetActive(true);
    try {
      const merged = Array.from(new Set([...unlocked, 'powerup_coin_magnet']));
      localStorage.setItem('mario_unlocked_items', JSON.stringify(merged));
      localStorage.setItem(COIN_MAGNET_ACTIVE_KEY, 'true');
    } catch {
      // ignore
    }
    setBoostNotice('Unlocked Coin Magnet! Nearby Coins & Eggs auto-pull in Arcade!');
    marioAudio.playPowerUp();
  };

  const handleRecordBestPlay = (
    gameId: string,
    gameTitle: string,
    score: number,
    coinsEarned: number
  ) => {
    if (typeof window === 'undefined') return;
    const next = recordArcadeBestPlay(
      { gameId, gameTitle, score, coinsEarned },
      window.localStorage
    );
    setBestPlays(next);
  };

  const handleEarnCoins = (amount: number) => {
    const magnetBonus = coinMagnetActive && amount > 0 ? Math.max(1, Math.round(amount * 0.25)) : 0;
    const finalAmount = (doublePayoutActive ? amount * 2 : amount) + magnetBonus;
    if (onEarnCoins && finalAmount > 0) {
      onEarnCoins(finalAmount);
    } else {
      setCoins((prev) => Math.max(0, prev + finalAmount));
    }
    if (finalAmount > 0) {
      marioAudio.playCoin();
      dispatchDailyMissionEvent('arcade_play', 1);
      const found = games.find((gm) => gm.id === activeGame);
      if (found && typeof window !== 'undefined') {
        const next = recordArcadeBestPlay(
          {
            gameId: found.id,
            gameTitle: found.title,
            score: finalAmount * 50,
            coinsEarned: finalAmount,
          },
          window.localStorage
        );
        setBestPlays(next);
      }
    }
  };

  const handleAdjustCoins = (delta: number) => {
    if (delta > 0 && onEarnCoins) {
      onEarnCoins(doublePayoutActive ? delta * 2 : delta);
    } else {
      setCoins((prev) =>
        Math.max(0, prev + (delta > 0 && doublePayoutActive ? delta * 2 : delta))
      );
    }
    if (delta !== 0) {
      dispatchDailyMissionEvent('arcade_play', 1);
    }
  };

  type GameVaultCategory =
    | 'action_reflex'
    | 'platformer_kart'
    | 'inspection_sim'
    | 'strategy_puzzle'
    | 'courtroom_tribunal';

  const GAME_CATEGORY_META: {
    id: GameVaultCategory;
    label: string;
    shortLabel: string;
    subtitle: string;
  }[] = [
    {
      id: 'action_reflex',
      label: 'Action & Reflex Arcade',
      shortLabel: 'Action & Reflex',
      subtitle: 'Fast-paced pipe smashers, timing duels, basket catchers, and deadline defusals.',
    },
    {
      id: 'platformer_kart',
      label: 'Platformer, Kart & Physics',
      shortLabel: 'Platformer, Kart & Physics',
      subtitle: '2D & 3D Mario platformers, drift kart racers, pinball bumpers, and shell physics.',
    },
    {
      id: 'inspection_sim',
      label: 'Inspection, Factory & Desk Sims',
      shortLabel: 'Inspection & Sims',
      subtitle: 'Payroll stamp audits, factory conveyor belts, leave clinics, and UV contract sweeps.',
    },
    {
      id: 'strategy_puzzle',
      label: 'Strategy, Board & Coin Treasury',
      shortLabel: 'Strategy, Puzzle & Treasury',
      subtitle: 'Tactical lane defense, policy simulators, codal grids, memory blocks, and coin reels.',
    },
    {
      id: 'courtroom_tribunal',
      label: 'Courtroom & Statutory Tribunals',
      shortLabel: 'Courtroom & Tribunals',
      subtitle: 'Turn-based courtroom battles, evidentiary spotlights, due-process relays, and world tribunals.',
    },
  ];

  const games: {
    id: VaultGameId;
    title: string;
    genre: string;
    desc: string;
    badge: string;
    icon: React.ReactNode;
    category: GameVaultCategory;
  }[] = [
    {
      id: 'coin_rush',
      title: 'Mario Coin Rush: Labor Obstacle Run',
      genre: 'Interactive Platformer Runner',
      desc: 'Navigate your hero across floating brick platforms to collect statutory coins and Star Power while dodging Labor Violations and Thwomps! Features Race Against Your Ghost!',
      badge: 'COIN RUSH',
      icon: <MarioCoinIcon className="w-6 h-6 text-amber-400" />,
      category: 'action_reflex',
    },
    {
      id: 'pipe_whack_violation',
      title: 'Warp Pipe Whack-a-Violation',
      genre: '3×3 Reflex Pipe Smasher',
      desc: 'Smash Labor-Only Endo & Sub-Minimum Wage moles popping from 9 Warp Pipes while sparing Union Toad Allies!',
      badge: 'PIPE SMASH',
      icon: <Hammer className="w-6 h-6 text-emerald-500" />,
      category: 'action_reflex',
    },
    {
      id: 'yoshi_egg_catch',
      title: "Yoshi's Egg-Catch Statutory Drop",
      genre: 'Canvas2D Basket Catcher',
      desc: 'Slide Yoshi’s basket to catch 15 Benefit Eggs & Gold Coins while dodging red Wage-Cut Spinies! Supports Coin Magnet!',
      badge: 'EGG CATCH',
      icon: <MarioStarIcon className="w-6 h-6" />,
      category: 'action_reflex',
    },
    {
      id: 'bowser_axe_timing',
      title: "Bowser's Bridge Axe Timing Duel",
      genre: 'Oscillating Sweet-Spot Breaker',
      desc: 'Strike the Golden Axe at the exact emerald sweet-spot to sever 5 Fortress Chains and drop Employer Bowser!',
      badge: 'AXE TIMING',
      icon: <MarioAxeIcon className="w-6 h-6" />,
      category: 'action_reflex',
    },
    {
      id: 'chomp_tug_of_war',
      title: 'Chain Chomp Statutory Tug-of-War',
      genre: 'Momentum Rope + Power Surge',
      desc: 'Heave the courtroom rope to 100% and fire True/False Statutory Power Surges before Chain Chomp drags it to 0%!',
      badge: 'TUG OF WAR',
      icon: <Scale className="w-6 h-6 text-rose-500" />,
      category: 'action_reflex',
    },
    {
      id: 'catcher',
      title: 'Super Mario Law Catcher',
      genre: 'Sky Drop Arcade',
      desc: 'Catch 13th month coins, 105-day leave mushrooms, and service charge stars while dodging unfair labor Thwomps!',
      badge: 'SKY CATCH',
      icon: <MarioStarIcon className="w-6 h-6" />,
      category: 'action_reflex',
    },
    {
      id: 'whack',
      title: 'Whack-a-Goomba Audit',
      genre: 'Reflex Pipe Smasher',
      desc: 'Smash illegal wage deductions popping from 9 pipes while sparing lawful Art. 113 deductions!',
      badge: 'ART. 113–116',
      icon: <Hammer className="w-6 h-6 text-rose-600" />,
      category: 'action_reflex',
    },
    {
      id: 'hammer_blitz',
      title: 'Hammer Bros. Payroll Blitz',
      genre: '3-Lane Payroll Shield & Smash',
      desc: 'Guard the Castle Payroll Vault! Shield lawful statutory premiums and smash illegal undertime offsets & deductions!',
      badge: 'SHIELD BLITZ',
      icon: <Hammer className="w-6 h-6 text-amber-700" />,
      category: 'action_reflex',
    },
    {
      id: 'chrono_blitz',
      title: 'Bob-omb Prescription Blitz',
      genre: 'Statutory Deadlines Defusal',
      desc: 'Cut the right wire (1 Yr ULP, 3 Yrs Money, 4 Yrs Dismissal, 5d NTE, 10d Appeal, 30d Notice) before boom!',
      badge: 'WIRE DEFUSE',
      icon: <Timer className="w-6 h-6 text-amber-600" />,
      category: 'action_reflex',
    },
    {
      id: 'kamek_duel',
      title: "Kamek's Statutory Deadlines Duel",
      genre: 'Prescriptive Spell-Shield',
      desc: 'Reflect Kamek’s hexes by casting exact statutory prescriptive periods (1 Yr ULP, 3 Yrs Money, 4 Yrs Dismissal, 20 Yrs SSS)!',
      badge: 'SPELL DUEL',
      icon: <Wand2 className="w-6 h-6 text-indigo-600" />,
      category: 'action_reflex',
    },
    {
      id: 'yoshi_overtime',
      title: "Yoshi's Overtime Express",
      genre: 'World 1 OT & Undertime Rail',
      desc: 'Dispatch rapid overtime multipliers (125%, 169%, 260%) and block prohibited Art. 88 undertime offsets!',
      badge: 'ART. 87–88',
      icon: <Clock className="w-6 h-6 text-lime-600" />,
      category: 'action_reflex',
    },
    {
      id: 'pauline_wage_concert',
      title: "Pauline's Metro Wage Concert",
      genre: '13th Month, Service Charge & Wages',
      desc: 'Conduct Metro Kingdom’s brass band! Hit the right notes on P.D. 851 13th month pay, 100% service charges, and D.O. 174!',
      badge: 'P.D. 851 / R.A. 11360',
      icon: <Music className="w-6 h-6 text-rose-600" />,
      category: 'action_reflex',
    },
    {
      id: 'run2d',
      title: 'Super Mario Legal Run',
      genre: 'Variable-Jump 2D Platformer',
      desc: 'Tap Jump for crisp short hops or hold Jump for high Mario arcs! Hit [?] blocks for World 1–6 Labor Law doctrines!',
      badge: '2D PLATFORMER',
      icon: <MarioMushroomIcon className="w-6 h-6" />,
      category: 'platformer_kart',
    },
    {
      id: 'island3d',
      title: '3D Mario Coin Island',
      genre: '3D Spatial Platformer',
      desc: 'Explore the 3D Mushroom Kingdom island with smooth momentum physics, hold-jump arcs, and solid AABB collisions!',
      badge: '3D ISLAND',
      icon: <Box className="w-6 h-6 text-indigo-600" />,
      category: 'platformer_kart',
    },
    {
      id: 'skybridge_dash',
      title: 'Lakitu Skybridge Dash',
      genre: 'Canvas2D Action Dodger',
      desc: 'Jump Spinies, dash through Hex Orbs, and dodge telegraphed Chargers while collecting 15 Golden Statutory Tokens!',
      badge: 'SKY DODGER',
      icon: <Cloud className="w-6 h-6 text-sky-500" />,
      category: 'platformer_kart',
    },
    {
      id: 'kart',
      title: 'Labor Kart GP (Drift Edition)',
      genre: 'Drift-Boost Mode-7 Racer',
      desc: 'Hop into corners with Shift/E or DRIFT button to charge Blue, Orange & Purple Mini-Turbo sparks across 3 laps!',
      badge: 'DRIFT RACER',
      icon: <MarioStarIcon className="w-6 h-6" />,
      category: 'platformer_kart',
    },
    {
      id: 'kart_wage_drift',
      title: 'Mario Kart Wage-Order Drift',
      genre: '3-Lane Rainbow Highway Racer',
      desc: 'Drift across 3 Rainbow Lanes to reach 1,000m — collect 200% Holiday & 125% OT Boost Pads while dodging Endo Traps!',
      badge: '3-LANE DRIFT',
      icon: <Compass className="w-6 h-6 text-sky-500" />,
      category: 'platformer_kart',
    },
    {
      id: 'koopa_pinball',
      title: 'Koopa Shell Pinball Arena',
      genre: 'Canvas2D Bumper Physics',
      desc: 'Launch emerald Koopa Shells into 125% OT, 200% Holiday & 22.5d Retirement bumpers with twin arcade flippers!',
      badge: 'BUMPER PINBALL',
      icon: <Disc className="w-6 h-6 text-lime-600" />,
      category: 'platformer_kart',
    },
    {
      id: 'koopa_breaker',
      title: 'Koopa Shell Statutory Breaker',
      genre: 'Breakout Physics Arcade',
      desc: 'Rebound a spinning Koopa Shell off your Mushroom Paddle to smash 24 Labor Code [?] multiplier blocks!',
      badge: 'BRICK BREAKER',
      icon: <Disc className="w-6 h-6 text-emerald-600" />,
      category: 'platformer_kart',
    },
    {
      id: 'yoshi_toss',
      title: "Yoshi's Statutory Egg Toss",
      genre: 'Trajectory Aim Shooter',
      desc: 'Aim Yoshi’s dotted arc and launch spotted eggs at floating 100%–390% statutory payroll rate clouds!',
      badge: 'ARC AIMING',
      icon: <Crosshair className="w-6 h-6 text-lime-600" />,
      category: 'platformer_kart',
    },
    {
      id: 'daisy_holiday_derby',
      title: "Daisy's Sarasaland Holiday Derby",
      genre: 'Holiday & Rest Day Multipliers',
      desc: 'Sprint through Sarasaland checkpoints! Compute 200% Regular, 300% Double Holiday, and 260% Rest Day holiday rates!',
      badge: 'ART. 93–94',
      icon: <Sun className="w-6 h-6 text-orange-500" />,
      category: 'platformer_kart',
    },
    {
      id: 'payroll_stamp_desk',
      title: 'DOLE Payroll Stamp Desk',
      genre: 'Papers-Please Audit Sim',
      desc: 'Inspect real employer payslips against minimum wage, 125% OT & Art. 113 rules — then slam APPROVE or VIOLATION!',
      badge: 'AUDIT DESK',
      icon: <Stamp className="w-6 h-6 text-amber-600" />,
      category: 'inspection_sim',
    },
    {
      id: 'toad_conveyor_sorter',
      title: "Toad's Conveyor Wage Sorter",
      genre: '3-Chute Factory Belt Router',
      desc: 'Route rolling factory crates into Monetary Pay, Statutory Leave, or Prohibited Act chutes before they drop off the belt!',
      badge: 'BELT ROUTER',
      icon: <Factory className="w-6 h-6 text-amber-500" />,
      category: 'inspection_sim',
    },
    {
      id: 'pipe_sorter',
      title: 'Warp Pipe Labor Sorter',
      genre: 'Speed Classification Arcade',
      desc: 'Flick incoming employment tickets into Green Pipe (Covered / Mandatory) or Red Pipe (Exempt / Prohibited)!',
      badge: 'CLASSIFIER',
      icon: <MarioPipeIcon className="w-6 h-6" />,
      category: 'inspection_sim',
    },
    {
      id: 'sorter',
      title: 'Dr. Mario Wage Sorter',
      genre: 'Holiday & Payroll Clinic',
      desc: 'Sort incoming Holiday & Rest Day payroll capsules into 100%, 130%–150%, or 200%–390% pipes!',
      badge: 'HOLIDAY PIPES',
      icon: <Layers className="w-6 h-6 text-cyan-600" />,
      category: 'inspection_sim',
    },
    {
      id: 'shy_conveyor',
      title: "Shy Guy's Wage & D.O. 174 Belt",
      genre: 'Real-Time Factory Conveyor',
      desc: 'Inspect moving crates on Shy Guy’s factory belt: certify P5M contractors & Pineda formulas, and bust labor-only chits!',
      badge: 'CONVEYOR',
      icon: <Factory className="w-6 h-6 text-emerald-700" />,
      category: 'inspection_sim',
    },
    {
      id: 'mansion',
      title: 'Contractor Buster',
      genre: 'DOLE D.O. 174 Inspector',
      desc: 'Bust prohibited Labor-Only Ghost Agencies and certify valid ₱5M independent contractors!',
      badge: 'D.O. 174-17',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      category: 'inspection_sim',
    },
    {
      id: 'luigi_ghost_clause',
      title: "Luigi's Ghost-Clause Flashlight Sweep",
      genre: 'Haunted Contract UV Sweeper',
      desc: 'Shine your Poltergust UV beam on dark contract tiles to expose and vacuum void Yellow-Dog & Perpetual Probation ghosts!',
      badge: 'UV SWEEPER',
      icon: <Eye className="w-6 h-6 text-lime-500" />,
      category: 'inspection_sim',
    },
    {
      id: 'world6_clinic',
      title: "Peach's World 6 Leave Clinic",
      genre: 'Statutory Leaves Dispatch',
      desc: 'Master SIL (5d), 105-Day Maternity, Paternity (7d), Solo Parent (7d), Gynecological (2m) & VAWC (10d) cases!',
      badge: 'LEAVE CLINIC',
      icon: <MarioFireFlowerIcon className="w-6 h-6" />,
      category: 'inspection_sim',
    },
    {
      id: 'peach_dispatch',
      title: "Peach's Royal Leave Dispatch",
      genre: 'Special Statutory Leaves',
      desc: 'Grant exact paid days for 105-Day Maternity, 7-Day Paternity, Solo Parent, VAWC, and Magna Carta for Women!',
      badge: 'SPECIAL LEAVES',
      icon: <Stamp className="w-6 h-6 text-pink-600" />,
      category: 'inspection_sim',
    },
    {
      id: 'union_tower_defense',
      title: 'Mushroom Union Tower Defense',
      genre: '5×7 Tactical Lane Defense',
      desc: 'Spend Union Gold to deploy OT Turrets, D.O. 174 Barriers & Garnish Beacons against 20 Wage-Shaver waves!',
      badge: 'LANE DEFENSE',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      category: 'strategy_puzzle',
    },
    {
      id: 'commissioner_sim',
      title: 'Labor Commissioner Balance Sim',
      genre: '4-Meter Policy Simulator',
      desc: 'Rule on national workplace crises while balancing Worker Welfare, Compliance, Enterprise Health & Public Trust!',
      badge: 'POLICY SIM',
      icon: <Scale className="w-6 h-6 text-purple-600" />,
      category: 'strategy_puzzle',
    },
    {
      id: 'codal_word_hunt',
      title: 'Bar Codal Word Hunt',
      genre: '10×10 Puzzle + 4-Tier Hints',
      desc: 'Search high-contrast letter grids for key Labor Code & Supreme Court doctrines using our 4-Tier Hint magnifier!',
      badge: 'WORD GRID',
      icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
      category: 'strategy_puzzle',
    },
    {
      id: 'peach_block_match',
      title: "Peach's Mystery Block Pair Match",
      genre: '12-Block [?] Memory Flip',
      desc: 'Flip randomized Royal Castle [?] Blocks to pair Philippine Labor Doctrines with their exact statutory multipliers!',
      badge: '12 [?] PAIRS',
      icon: <MarioQuestionBlockIcon className="w-6 h-6" />,
      category: 'strategy_puzzle',
    },
    {
      id: 'memory',
      title: 'Multiplier Memory Match',
      genre: 'Mario Party Flip Board',
      desc: 'Flip 16 Mystery [?] Blocks to pair work scenarios with statutory rates (125% to 390%)!',
      badge: '16 [?] BLOCKS',
      icon: <MarioQuestionBlockIcon className="w-6 h-6" />,
      category: 'strategy_puzzle',
    },
    {
      id: 'bridge',
      title: "Bowser's Bridge Rescue",
      genre: 'Statutory Term Decoder',
      desc: 'Decode Labor Code doctrines letter-by-letter to trigger the golden axe before the bridge falls!',
      badge: 'WORD AXE',
      icon: <MarioAxeIcon className="w-6 h-6" />,
      category: 'strategy_puzzle',
    },
    {
      id: 'toad_slots',
      title: "Toad's Coin Treasury Slots",
      genre: 'Coin Wager & Bar Bonus',
      desc: 'Wager 5, 15, or 30 coins on statutory multiplier reels and answer instant Bar Trivia to double your coin jackpot!',
      badge: 'SPEND COINS',
      icon: <MarioCoinIcon className="w-6 h-6" />,
      category: 'strategy_puzzle',
    },
    {
      id: 'lakitu_climber',
      title: "Lakitu's Bar Jackpot Climber",
      genre: 'Risk-Reward Sky Tower',
      desc: 'Buy Lakitu’s Cloud Shield (-12c) and climb 5 statutory floors to bank up to +120 coins per summit!',
      badge: 'CLOUD SHIELD',
      icon: <Cloud className="w-6 h-6 text-sky-600" />,
      category: 'strategy_puzzle',
    },
    {
      id: 'courtroom',
      title: 'Courtroom Boss Battle',
      genre: 'Turn-Based Mario RPG',
      desc: 'Battle Employer Bowser in court! Counter illegal overtime, pregnancy dismissals, and deductions with statutory legal motions!',
      badge: 'BOSS RPG',
      icon: <Scale className="w-6 h-6 text-red-600" />,
      category: 'courtroom_tribunal',
    },
    {
      id: 'boo_burden',
      title: "King Boo's Burden Mansion",
      genre: 'Evidentiary Spotlight',
      desc: 'Master Loon v. Power Master! Shine your Poltergust spotlight on Employer vs. Employee Burden of Proof!',
      badge: 'EVIDENCE',
      icon: <Eye className="w-6 h-6 text-purple-600" />,
      category: 'courtroom_tribunal',
    },
    {
      id: 'toadette_relay',
      title: "Toadette's Twin-Notice Relay",
      genre: 'Procedural Sequence Builder',
      desc: 'Assemble chronological Just Cause, Authorized Cause, Disease, and Abandonment due process steps without nominal damages!',
      badge: 'DUE PROCESS',
      icon: <ListOrdered className="w-6 h-6 text-pink-600" />,
      category: 'courtroom_tribunal',
    },
    {
      id: 'luigi_nightshift',
      title: "Luigi's Night Shift Poltergust",
      genre: 'Graveyard 10PM–6AM Audit',
      desc: 'Sweep graveyard shift scenarios! Compute stacked +10% NSD rates and spot the <=5 worker retail exemption!',
      badge: 'ART. 86 NSD',
      icon: <Moon className="w-6 h-6 text-emerald-600" />,
      category: 'courtroom_tribunal',
    },
    {
      id: 'rosalina_observatory',
      title: "Rosalina's Wage Observatory",
      genre: 'Regional Wage & Distortion',
      desc: 'Calibrate RTWPB wage orders, apply the Pineda distortion formula, and distinguish facilities from supplements!',
      badge: 'ART. 97–124',
      icon: <Sparkles className="w-6 h-6 text-sky-600" />,
      category: 'courtroom_tribunal',
    },
    {
      id: 'wario_vault',
      title: "Wario's Deduction Vault",
      genre: 'Wage Protection Tribunal',
      desc: 'Audit Wario’s payroll ledger! Approve lawful check-offs and block illegal loss deductions exceeding 20% weekly wage!',
      badge: 'ART. 113–116',
      icon: <Vault className="w-6 h-6 text-amber-600" />,
      category: 'courtroom_tribunal',
    },
    {
      id: 'toadsworth_tribunal',
      title: "Toadsworth's Retirement Tribunal",
      genre: 'R.A. 7641 & Separation Pay',
      desc: 'Adjudicate 22.5-day retirement pay, underground miner ages (50–60), and authorized cause separation multipliers!',
      badge: 'ART. 298–302',
      icon: <Scale className="w-6 h-6 text-purple-600" />,
      category: 'courtroom_tribunal',
    },
    {
      id: 'captain_toad_minecart',
      title: "Captain Toad's Kasambahay Minecart",
      genre: 'Special Groups & R.A. 10361',
      desc: 'Steer Captain Toad’s headlamp cart through Batas Kasambahay rest periods, child labor hours, and PWD 100% minimum wage!',
      badge: 'R.A. 10361 / 9231',
      icon: <Compass className="w-6 h-6 text-amber-600" />,
      category: 'courtroom_tribunal',
    },
    {
      id: 'dry_bones_crypt',
      title: "Dry Bones' Prescription Crypt",
      genre: 'Prescriptive Periods & Safe Spaces',
      desc: 'Unlock ancient statutory crypts! Master 3-year money claims, 4-year illegal dismissal, R.A. 7877, and R.A. 11313 deadlines!',
      badge: 'ART. 305–306',
      icon: <ShieldAlert className="w-6 h-6 text-slate-700" />,
      category: 'courtroom_tribunal',
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
              {GAME_CATEGORY_META.map((cat) => {
                const catGames = games.filter((gm) => gm.category === cat.id);
                return (
                  <optgroup key={cat.id} label={`${cat.label} (${catGames.length})`}>
                    {catGames.map((gm) => (
                      <option key={`opt-${gm.id}`} value={gm.id}>
                        {PURE_ACTION_GAME_IDS.has(gm.id) ? '[ACTION] ' : ''}{gm.title} — {gm.genre} [{gm.badge}]
                      </option>
                    ))}
                  </optgroup>
                );
              })}
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

        {/* Live Arcade Coin Boost Bar — Spend Coins or Shop Tokens Directly Inside Arcade */}
        <div
          data-testid="arcade-coin-boost-bar"
          className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2"
        >
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
            <MarioCoinIcon className="w-4 h-4 shrink-0" />
            <span>SPEND COINS IN ARCADE (x{coins}):</span>
            {boostNotice && (
              <span className="text-emerald-300 font-semibold hidden sm:inline">
                · {boostNotice}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              data-testid="arcade-boost-2x-btn"
              onClick={handleActivate2xBoost}
              disabled={doublePayoutActive || (vaultTokens.inventory.arcade2x <= 0 && coins < 15)}
              className={`min-h-[38px] px-3 rounded-xl text-xs font-black border cursor-pointer transition-colors whitespace-nowrap ${
                doublePayoutActive
                  ? 'bg-emerald-400 text-slate-950 border-black'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-400/60 disabled:opacity-40'
              }`}
            >
              {doublePayoutActive
                ? '2x Payout ON'
                : vaultTokens.inventory.arcade2x > 0
                ? `Use 2x Ticket (${vaultTokens.inventory.arcade2x})`
                : '2x Payout (15c)'}
            </button>
            <button
              type="button"
              data-testid="arcade-boost-shield-btn"
              onClick={handleActivateShieldBoost}
              disabled={bonusShieldActive || (vaultTokens.inventory.arcadeShield <= 0 && coins < 15)}
              className={`min-h-[38px] px-3 rounded-xl text-xs font-black border cursor-pointer transition-colors whitespace-nowrap ${
                bonusShieldActive
                  ? 'bg-sky-400 text-slate-950 border-black'
                  : 'bg-slate-900 hover:bg-slate-800 text-sky-300 border-sky-400/60 disabled:opacity-40'
              }`}
            >
              {bonusShieldActive
                ? 'Extra Armor ON'
                : vaultTokens.inventory.arcadeShield > 0
                ? `Use Armor (${vaultTokens.inventory.arcadeShield})`
                : 'Extra Armor (15c)'}
            </button>
            <button
              type="button"
              data-testid="arcade-boost-radar-btn"
              onClick={handleBuyRadarCharge}
              disabled={coins < 10}
              className="min-h-[38px] px-3 rounded-xl text-xs font-black border bg-slate-900 hover:bg-slate-800 text-emerald-300 border-emerald-400/60 disabled:opacity-40 cursor-pointer whitespace-nowrap"
            >
              +2 Radars (10c · Own {vaultTokens.inventory.arcadeRadar})
            </button>
            <button
              type="button"
              data-testid="arcade-boost-magnet-btn"
              onClick={handleToggleOrBuyCoinMagnet}
              className={`min-h-[38px] px-3 rounded-xl text-xs font-black border inline-flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${
                coinMagnetActive
                  ? 'bg-amber-400 text-slate-950 border-black'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-200 border-amber-400/60'
              }`}
            >
              <Magnet className="w-3.5 h-3.5 shrink-0" />
              <span>{coinMagnetActive ? 'Coin Magnet ON (+25%)' : 'Coin Magnet (20c)'}</span>
            </button>
            <button
              type="button"
              data-testid="arcade-instant-replay-btn"
              onClick={() => {
                setReplayNonce((n) => n + 1);
                marioAudio.playPipe();
              }}
              className="min-h-[38px] px-3 rounded-xl text-xs font-black border bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-black inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Replay Game</span>
            </button>
          </div>
        </div>
      </div>

      {/* My Best Plays (Hall of Fame) Persistent High-Score & Instant 1-Click Replay Strip */}
      <div
        data-testid="arcade-best-plays-panel"
        className="bg-[#0f172a] border-2 border-amber-400/50 rounded-2xl p-3 sm:p-4 text-white space-y-2.5"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-black uppercase text-amber-300 font-mario truncate">
              MY BEST PLAYS ({bestPlays.length} RECORDED)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowBestPlays((v) => !v)}
            className="text-xs font-bold text-slate-300 hover:text-white cursor-pointer whitespace-nowrap"
          >
            {showBestPlays ? 'Hide Records' : 'Show Records'}
          </button>
        </div>

        {showBestPlays &&
          (bestPlays.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold">
              Play any of the {games.length} Arcade Games above to record your personal high scores, coins won, and 1-click Replay shortcuts here!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {bestPlays.slice(0, 8).map((bp) => (
                <div
                  key={bp.gameId}
                  className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white truncate">{bp.gameTitle}</div>
                    <div className="text-[11px] font-mono font-bold text-emerald-300 tabular-nums">
                      Best {bp.bestScore} pts · +{bp.bestCoins}c · {bp.playsCount}x
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveGame(bp.gameId as VaultGameId);
                      setReplayNonce((n) => n + 1);
                      marioAudio.playPipe();
                    }}
                    className="min-h-[34px] px-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] border border-black shrink-0 cursor-pointer"
                  >
                    Replay
                  </button>
                </div>
              ))}
            </div>
          ))}
      </div>

      {/* Active Game Surface First on Mobile for Immediate Thumb Reach, Followed by Full Game Shelf */}
      <div
        id="active-vault-game-stage"
        key={`${activeGame}-${replayNonce}`}
        className="relative z-10 select-none w-full max-w-full min-w-0"
        onContextMenu={(e) => e.preventDefault()}
      >
        {activeGame === 'coin_rush' && (
          <CoinRushArcadeGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
          />
        )}
        {activeGame === 'pipe_whack_violation' && (
          <WarpPipeWhackAViolationGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            coinMagnetActive={coinMagnetActive}
            onRecordBestPlay={handleRecordBestPlay}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'yoshi_egg_catch' && (
          <YoshiEggCatchDropGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            coinMagnetActive={coinMagnetActive}
            onRecordBestPlay={handleRecordBestPlay}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'luigi_ghost_clause' && (
          <LuigiGhostClauseFlashlightGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            coinMagnetActive={coinMagnetActive}
            onRecordBestPlay={handleRecordBestPlay}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'kart_wage_drift' && (
          <MarioKartWageOrderDriftGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            coinMagnetActive={coinMagnetActive}
            onRecordBestPlay={handleRecordBestPlay}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'toad_conveyor_sorter' && (
          <ToadConveyorWageSorterGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            coinMagnetActive={coinMagnetActive}
            onRecordBestPlay={handleRecordBestPlay}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'bowser_axe_timing' && (
          <BowserBridgeAxeTimingGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            coinMagnetActive={coinMagnetActive}
            onRecordBestPlay={handleRecordBestPlay}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'peach_block_match' && (
          <PeachMysteryBlockPairMatchGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            coinMagnetActive={coinMagnetActive}
            onRecordBestPlay={handleRecordBestPlay}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'chomp_tug_of_war' && (
          <ChainChompTugOfWarGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            coinMagnetActive={coinMagnetActive}
            onRecordBestPlay={handleRecordBestPlay}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'skybridge_dash' && (
          <LakituSkybridgeDashGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'payroll_stamp_desk' && (
          <DolePayrollStampDeskGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'union_tower_defense' && (
          <MushroomUnionTowerDefenseGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'koopa_pinball' && (
          <KoopaPinballBumperArenaGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'codal_word_hunt' && (
          <BarCodalWordHuntGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'commissioner_sim' && (
          <LaborCommissionerBalanceSimGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
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
        {activeGame === 'captain_toad_minecart' && (
          <CaptainToadMinecartGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'daisy_holiday_derby' && (
          <DaisyHolidayDerbyGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'dry_bones_crypt' && (
          <DryBonesCryptGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'pauline_wage_concert' && (
          <PaulineWageConcertGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
      </div>

      {/* Genre Category Filter Strip for All 47 Playable Games */}
      <div
        data-testid="arcade-genre-filter-strip"
        className="flex flex-wrap items-center gap-2 bg-slate-900 p-2.5 rounded-2xl border-2 border-slate-800"
      >
        {[
          { id: 'all' as const, label: `All Games (${games.length})` },
          {
            id: 'pure_action' as const,
            label: `Pure Action & Physics (${games.filter((gm) => PURE_ACTION_GAME_IDS.has(gm.id)).length})`,
          },
          ...GAME_CATEGORY_META.map((cat) => ({
            id: cat.id,
            label: `${cat.shortLabel} (${games.filter((gm) => gm.category === cat.id).length})`,
          })),
        ].map((gf) => (
          <button
            key={gf.id}
            type="button"
            onClick={() => {
              setGenreFilter(gf.id);
              marioAudio.playClick();
            }}
            className={`min-h-[40px] px-3.5 rounded-xl text-xs font-black transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
              genreFilter === gf.id
                ? 'bg-amber-400 text-slate-950 border-2 border-black'
                : 'bg-slate-800 text-slate-200 hover:text-white border border-slate-700'
            }`}
          >
            {gf.label}
          </button>
        ))}
      </div>

      {/* Organized Category Shelves */}
      <div className="space-y-6" data-testid="arcade-organized-shelves">
        {GAME_CATEGORY_META.filter((cat) => genreFilter === 'all' || genreFilter === 'pure_action' || genreFilter === cat.id).map(
          (cat) => {
            const shelfGames = games.filter(
              (gm) => gm.category === cat.id && (genreFilter !== 'pure_action' || PURE_ACTION_GAME_IDS.has(gm.id))
            );
            if (shelfGames.length === 0) return null;
            return (
              <section
                key={cat.id}
                data-testid={`arcade-shelf-${cat.id}`}
                className="space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-slate-950 text-white border-2 border-black rounded-2xl px-4 py-2.5 shadow-[3px_3px_0_#000]">
                  <div className="flex items-center gap-2 min-w-0">
                    <h2 className="text-sm sm:text-base font-black font-display text-amber-300">
                      {cat.label}
                    </h2>
                    <span className="text-xs font-bold text-emerald-300 tabular-nums shrink-0">
                      · {shelfGames.length} games
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-300">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {shelfGames.map((g) => {
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
                        className={`h-full text-left p-4 rounded-2xl border-4 transition-colors cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-400 border-slate-950 text-slate-950 shadow-[4px_4px_0_#000]'
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
                                isSelected
                                  ? 'bg-slate-950 text-amber-300'
                                  : 'bg-slate-900 text-amber-300'
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
                          <span>{isSelected ? 'ACTIVE GAME' : 'PLAY GAME'}</span>
                          <ArrowRight className="w-4 h-4 shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          }
        )}
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
