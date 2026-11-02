import React, { useState, useEffect } from 'react';
import {
  MarioTheme,
  MarioAvatar,
  ShopItem,
  SoundPackId,
  StudyCompanionId,
  CardFrameId,
  AppStudyFontId,
} from '../types/laborLaw';
import { APP_STUDY_FONTS } from '../utils/round8Features';
import { HERO_ROSTER } from '../data/heroesData';
import {
  MarioCoinIcon,
  MarioMushroomIcon,
  MarioCharacterAvatar,
  MarioStarIcon,
  Mario1UpIcon,
  MarioFireFlowerIcon,
  MarioPeachCrownIcon,
  MarioLakituCloudIcon,
  MarioIceFlowerIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';
import { loadPlayerProfileStats } from '../utils/profileAchievements';
import {
  getSuperStarBuffStatus,
  MAIN_CREATOR_AUTHOR,
} from '../utils/engagementFeatures';
import {
  applyPrintPageRule,
  clearPrintPageRule,
} from '../utils/printHelper';
import {
  downloadCertificateLandscapePdf,
  downloadMasterDiplomaPdf,
} from '../utils/pdfExportService';
import { ALL_LAW_TOPICS } from '../data/laborLawData';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  ToadSpecialEventsState,
  LuxuryEquippedState,
  LuxuryAvatarFrameId,
  LuxuryMushroomAuraId,
  LuxuryCartridgeBadgeId,
  LUXURY_CARTRIDGE_LABELS,
  loadToadSpecialEventsState,
  saveToadSpecialEventsState,
  loadLuxuryEquippedState,
  saveLuxuryEquippedState,
} from '../utils/round9Features';
import {
  ROUND10_ALL_NEW_SHOP_ITEMS,
  LAW_CHAMBERS_UPGRADE_ITEMS,
  ARCADE_AND_QUIZ_CONSUMABLE_ITEMS,
  CLICK_AND_CONFETTI_FX_ITEMS,
  RELICS_AND_NAMEPLATES_ITEMS,
  EXTENDED_COMPANIONS_AND_FRAMES_ITEMS,
  COIN_UTILITY_DESTINATIONS,
  TOAD_LUCKY_WHEEL_WEDGES,
  resolveLuckyWheelSpin,
  computeLawChambersPrestige,
  loadRound10VaultState,
  saveRound10VaultState,
  MASTER_DIPLOMA_TRANSCRIPT_PILLARS,
  DocumentOrientation,
  Round10ShopCatalogItem,
  Round10VaultState,
} from '../utils/round10Features';
import {
  ShoppingBag,
  Palette,
  User,
  Zap,
  X,
  Users,
  Volume2,
  Crown,
  FileCheck2,
  Sparkles,
  HelpCircle,
  FileDown,
  Check,
  Play,
  Pause,
  BookOpen,
  RotateCcw,
  Map as MapIcon,
  Trophy,
  Frame,
  Heart,
  Gem,
  Flame,
  Shield,
  Unlock,
  Compass,
  Search,
  Landmark,
  Gift,
  Wand2,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface ToadShopProps {
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  activeTheme: MarioTheme;
  setActiveTheme: (theme: MarioTheme) => void;
  equippedAvatar: MarioAvatar;
  setEquippedAvatar: (avatar: MarioAvatar) => void;
  onClose?: () => void;
  isModal?: boolean;
  superStarEndsAt?: number;
  onActivateSuperStar?: (durationMinutes: number) => void;
  shortcutMapActive?: boolean;
  onToggleShortcutMap?: (active: boolean) => void;
  equippedCompanion?: StudyCompanionId;
  onEquipCompanion?: (id: StudyCompanionId) => void;
  equippedCardFrame?: CardFrameId;
  onEquipCardFrame?: (id: CardFrameId) => void;
  onBoostStreak?: (days: number) => void;
  onOpenLeaderboard?: () => void;
  appStudyFont?: AppStudyFontId;
  onSelectAppStudyFont?: (font: AppStudyFontId) => void;
  onOpenCertificatePreview?: () => void;
  specialEventsState?: ToadSpecialEventsState;
  onUpdateSpecialEventsState?: (next: ToadSpecialEventsState) => void;
  luxuryEquipped?: LuxuryEquippedState;
  onUpdateLuxuryEquipped?: (next: LuxuryEquippedState) => void;
  onNavigateTab?: (tabId: string) => void;
}

export const POWERUP_ITEMS: ShopItem[] = [
  {
    id: 'powerup_super_star',
    name: 'Super Star Power-Up (10 Mins)',
    category: 'powerup',
    price: 35,
    description:
      'Doubles ALL Gold Coin earnings (2x multiplier) across modules, flashcards, Quick Study, quizzes, Pomodoro, and arcade games for 10 minutes!',
    badge: '2x Coins · 10m',
    perkEffect: 'Instant 10-Minute 2x Coin Multiplier (Stackable)',
    isConsumable: true,
    durationMinutes: 10,
  },
  {
    id: 'map_shortcut_bar',
    name: "Toad's Bar Exam Shortcut Map",
    category: 'powerup',
    price: 45,
    description:
      'Illuminates high-yield Bar Exam doctrines and Warp Shortcuts across the Overworld Map and inside every Module Topic Card (Worlds 1–6).',
    badge: 'Shortcut Map',
    perkEffect: 'Highlights Key Topics & Bar Traps Everywhere',
  },
  {
    id: 'powerup_mega_star_30m',
    name: 'Grand Star Overdrive (30 Mins)',
    category: 'powerup',
    price: 85,
    description:
      'Extended invincibility rush! Doubles all coin rewards (2x) across every study activity and Boss Battle for a full 30-minute block.',
    badge: '2x Coins · 30m',
    perkEffect: '30-Minute 2x Coin Multiplier (Stackable)',
    isConsumable: true,
    durationMinutes: 30,
  },
  {
    id: 'powerup_fire_flower_streak',
    name: 'Fire Flower Streak Booster (+5 Days)',
    category: 'powerup',
    price: 60,
    description:
      'Instantly fuels your Consecutive Days Studied tracker by +5 days and blooms an immediate Fire Flower milestone badge on the Overworld Map!',
    badge: '+1 Fire Flower',
    perkEffect: '+5 Consecutive Study Days Instantly',
    isConsumable: true,
  },
];

export const COMPANION_ITEMS: ShopItem[] = [
  {
    id: 'comp_luma',
    name: 'Starlight Luma Scholar',
    category: 'companion',
    companionId: 'comp_luma',
    price: 55,
    description: 'Celestial Star Luma companion who cheers you on with high-yield Labor Standards reminders.',
    badge: 'Galaxy Buddy',
  },
  {
    id: 'comp_baby_yoshi',
    name: 'Golden Baby Yoshi',
    category: 'companion',
    companionId: 'comp_baby_yoshi',
    price: 65,
    description: 'Cheerful island companion who loves statutory leaves and Holiday Pay multipliers.',
    badge: 'Dino Buddy',
  },
  {
    id: 'comp_counsel_toad',
    name: 'Counsel Toad Esq.',
    category: 'companion',
    companionId: 'comp_counsel_toad',
    price: 75,
    description: 'Bar-certified Mushroom Kingdom paralegal carrying miniature Labor Code annotations.',
    badge: 'Legal Clerk',
  },
  {
    id: 'comp_polterpup',
    name: 'Polterpup Night-Shift Hound',
    category: 'companion',
    companionId: 'comp_polterpup',
    price: 80,
    description: 'Loyal glowing pup guarding your late-night 10 PM – 6 AM (+10% NSD) review sessions.',
    badge: 'Night Buddy',
  },
  {
    id: 'comp_lakitu',
    name: 'Lakitu Cloud Broadcast',
    category: 'companion',
    companionId: 'comp_lakitu',
    price: 90,
    description: 'Hovers beside your workspace spotting exam exceptions and prescriptive periods.',
    badge: 'Sky Scout',
  },
  {
    id: 'comp_chain_chomp',
    name: 'Royal Gold Chain Chomp',
    category: 'companion',
    companionId: 'comp_chain_chomp',
    price: 120,
    description: 'Fierce golden courtroom guardian that chomps through Labor-Only Contracting traps!',
    badge: 'Luxury Pet',
  },
];

export const CARD_FRAME_ITEMS: ShopItem[] = [
  {
    id: 'frame_default',
    name: 'Classic Ink Slate Frame',
    category: 'frame',
    frameId: 'frame_default',
    price: 0,
    description: 'Clean high-contrast Mushroom Kingdom ink border for distraction-free statutory reading.',
    badge: 'Standard',
  },
  {
    id: 'frame_royal_gold',
    name: 'Royal Gold Sovereign Frame',
    category: 'frame',
    frameId: 'frame_royal_gold',
    price: 50,
    description: 'Gilded championship trim around every Module Topic Card with warm golden accents.',
    badge: 'Gold Trim',
  },
  {
    id: 'frame_emerald_pipe',
    name: 'Emerald Warp Pipe Frame',
    category: 'frame',
    frameId: 'frame_emerald_pipe',
    price: 45,
    description: 'Crisp Warp Zone emerald border styling engineered for rapid visual scanning.',
    badge: 'Warp Trim',
  },
  {
    id: 'frame_retro_brick',
    name: '1985 Heritage Brick Frame',
    category: 'frame',
    frameId: 'frame_retro_brick',
    price: 55,
    description: 'Warm terracotta NES block trim celebrating classic World 1-1 platforming.',
    badge: 'Retro 85',
  },
  {
    id: 'frame_starlight_prism',
    name: 'Starlight Observatory Frame',
    category: 'frame',
    frameId: 'frame_starlight_prism',
    price: 70,
    description: 'Luminous indigo-cyan cosmic border inspired by Rosalina’s Comet Observatory.',
    badge: 'Starlight',
  },
  {
    id: 'frame_supreme_crimson',
    name: 'Supreme Court Crimson Frame',
    category: 'frame',
    frameId: 'frame_supreme_crimson',
    price: 95,
    description: 'Distinguished judicial crimson border reserved for dedicated Bar Exam contenders.',
    badge: 'Judicial',
  },
];

export const THEME_ITEMS: ShopItem[] = [
  {
    id: 'theme_pro_study_paper',
    name: 'Pro Study: Archival Paper',
    category: 'theme',
    themeId: 'pro_study_paper',
    price: 35,
    badge: 'Pro Study',
    description:
      'Minimalist warm archival cream paper, crisp charcoal ink, hairline borders, and 1.74x reading line-height for zero eye strain.',
    previewColor: '#f5f2eb',
  },
  {
    id: 'theme_pro_study_slate',
    name: 'Pro Study: Midnight Slate',
    category: 'theme',
    themeId: 'pro_study_slate',
    price: 40,
    badge: 'Pro Study',
    description:
      'High-contrast matte slate dark-study skin with soft ivory typography and anti-glare surfaces built for marathon night Bar review.',
    previewColor: '#131924',
  },
  {
    id: 'theme_pro_study_sage',
    name: 'Pro Study: Botanical Sage',
    category: 'theme',
    themeId: 'pro_study_sage',
    price: 45,
    badge: 'Pro Study',
    description:
      'Calm low-glare botanical sage reading environment with deep forest slate ink and relaxed legal editorial typography.',
    previewColor: '#eaf2ec',
  },
  {
    id: 'theme_overworld',
    name: 'Overworld Classic',
    category: 'theme',
    themeId: 'overworld',
    price: 0,
    badge: 'Arcade',
    description: 'Iconic Mario green pipes, bright sky clouds, and golden sunlight.',
    previewColor: '#0f172a',
  },
  {
    id: 'theme_underground',
    name: 'Underground Cavern',
    category: 'theme',
    themeId: 'underground',
    price: 20,
    description: 'Deep subterranean cobalt caves with glowing cyan mushroom crystals.',
    previewColor: '#070e1b',
  },
  {
    id: 'theme_castle',
    name: "Bowser's Castle",
    category: 'theme',
    themeId: 'castle',
    price: 35,
    description: 'Dark obsidian lava keep with bubbling volcanic magma orange accents.',
    previewColor: '#450a0a',
  },
  {
    id: 'theme_galaxy',
    name: 'Starry Galaxy',
    category: 'theme',
    themeId: 'galaxy',
    price: 45,
    description: 'Cosmic deep space navy with glimmering golden nebula dust.',
    previewColor: '#1e1b4b',
  },
  {
    id: 'theme_rainbow',
    name: 'Rainbow Road',
    category: 'theme',
    themeId: 'rainbow',
    price: 60,
    description: 'Vibrant prism road skyline with luminous arcade pastel energy.',
    previewColor: '#3b0764',
  },
  {
    id: 'theme_bowser_lava',
    name: 'Bowser Magma Keep',
    category: 'theme',
    themeId: 'bowser_lava',
    price: 75,
    description: 'Intense boiling molten rock, fiery obsidian fortresses and brimstone ash.',
    previewColor: '#5c0a0a',
  },
  {
    id: 'theme_retro_nes',
    name: 'NES 1985 Retro 8-Bit',
    category: 'theme',
    themeId: 'retro_nes',
    price: 50,
    description: 'Nostalgic CRT raster glow, vintage brown clay bricks, and retro pixel sky.',
    previewColor: '#1b1b1b',
  },
  {
    id: 'theme_neon_synth',
    name: 'Neon Synth Arcade',
    category: 'theme',
    themeId: 'neon_synth',
    price: 65,
    description: 'Electric cyber violet, glowing cyan laser wireframes, and hot magenta beams.',
    previewColor: '#2b0938',
  },
  {
    id: 'theme_desert_oasis',
    name: 'Koopa Desert Oasis',
    category: 'theme',
    themeId: 'desert_oasis',
    price: 40,
    description: 'Sun-drenched golden pyramid sands, gentle turquoise mirages, and sunset warmth.',
    previewColor: '#2a1a08',
  },
  {
    id: 'theme_aurora',
    name: 'Boreal Star Aurora',
    category: 'theme',
    themeId: 'aurora',
    price: 80,
    description: 'Magical emerald northern polar lights shimmering across deep alpine starlight.',
    previewColor: '#052328',
  },
  {
    id: 'theme_peach_castle',
    name: "Peach's Blossom Castle",
    category: 'theme',
    themeId: 'peach_castle',
    price: 0,
    badge: 'Free Skin',
    description: 'Soft rose-blossom castle clouds with sunlit royal gold courtyard warmth.',
    previewColor: '#fbcfe8',
  },
  {
    id: 'theme_yoshi_island',
    name: "Yoshi's Pastel Island",
    category: 'theme',
    themeId: 'yoshi_island',
    price: 0,
    badge: 'Free Skin',
    description: 'Cheerful spring-meadow mint and lemon-sunburst storybook skies.',
    previewColor: '#6ee7b7',
  },
  {
    id: 'theme_rosalina_comet',
    name: 'Rosalina Comet Observatory',
    category: 'theme',
    themeId: 'rosalina_comet',
    price: 0,
    badge: 'Free Skin',
    description: 'Serene celestial teal-midnight observatory with golden starlight dust.',
    previewColor: '#0f2537',
  },
  {
    id: 'theme_royal_parchment',
    name: 'Pro Study: Royal Parchment',
    category: 'theme',
    themeId: 'royal_parchment',
    price: 0,
    badge: 'Pro Study · Free',
    description: 'Warm ivory codal parchment with crisp ink contrast and zero background distractions.',
    previewColor: '#faf5e8',
  },
  {
    id: 'theme_sakura_garden',
    name: 'Pro Study: Sakura Editorial',
    category: 'theme',
    themeId: 'sakura_garden',
    price: 30,
    badge: 'Pro Study',
    description: 'Ultra-gentle blossom-paper reading canvas with calm plum-slate contrast.',
    previewColor: '#fdf2f8',
  },
  {
    id: 'theme_luigi_mansion',
    name: "Luigi's Emerald Manor",
    category: 'theme',
    themeId: 'luigi_mansion',
    price: 35,
    badge: 'Arcade',
    description: 'Deep spectral jade manor glow with crisp emerald lantern highlights.',
    previewColor: '#063729',
  },
  {
    id: 'theme_arctic_ice_world',
    name: 'Sherbet Arctic Ice World',
    category: 'theme',
    themeId: 'arctic_ice_world',
    price: 40,
    badge: 'Arcade',
    description: 'Crisp glacier-blue crystal skies inspired by Ice Flower winter stages.',
    previewColor: '#bae6fd',
  },
  {
    id: 'theme_espresso_tribunal',
    name: 'Pro Study: Espresso Tribunal',
    category: 'theme',
    themeId: 'espresso_tribunal',
    price: 45,
    badge: 'Pro Study',
    description: 'Warm dark-roast mahogany study chamber engineered for late-night reading.',
    previewColor: '#1c1410',
  },
];

export const AVATAR_ITEMS: ShopItem[] = HERO_ROSTER.map((hero) => ({
  id: `avatar_${hero.id}`,
  name: hero.name,
  category: 'avatar',
  avatarId: hero.id,
  price: hero.shopPrice,
  description: hero.description,
  faction: hero.faction,
}));

export const PERK_ITEMS: ShopItem[] = [
  {
    id: 'perk_life',
    name: '1-Up Life Ring',
    category: 'perk',
    price: 30,
    description: 'Grants 1 extra heart in the Bowser Boss Battle combat mode.',
    badge: 'Extra Life',
    perkEffect: '+1 Heart in Boss Fight',
  },
  {
    id: 'perk_star',
    name: 'Star Shield',
    category: 'perk',
    price: 35,
    description: 'Survives 1 round timeout in the Boss Battle without taking damage.',
    badge: 'Invincible',
    perkEffect: 'Timeout Protection',
  },
  {
    id: 'perk_double',
    name: 'Double Coin Mushroom',
    category: 'perk',
    price: 40,
    description: 'Permanent +1 bonus coin charm when practicing flashcards and quizzes.',
    badge: 'Coin Charm',
    perkEffect: '+1 Bonus Coin Charm',
  },
  {
    id: 'perk_lakitu_glasses',
    name: 'Lakitu 50/50 Glasses',
    category: 'perk',
    price: 45,
    description: 'Eliminates 2 incorrect answer choices during tough Bar Exam multiple-choice quizzes.',
    badge: '50/50 MCQ',
    perkEffect: 'Cross out 2 Wrong Answers',
  },
  {
    id: 'perk_streak_freeze',
    name: 'Ice Flower Streak Freeze',
    category: 'perk',
    price: 50,
    description: 'Shields your daily study streak from resetting if you miss a study day.',
    badge: 'Streak Shield',
    perkEffect: '1-Day Streak Protection',
  },
  {
    id: 'perk_golden_fireball',
    name: 'Golden Fireball 3x',
    category: 'perk',
    price: 55,
    description: 'Unleashes radiant golden flame that triples all Boss Battle coin rewards.',
    badge: '3x Reward',
    perkEffect: '3x Boss Battle Coins',
  },
  {
    id: 'perk_chrono_watch',
    name: 'Chrono Pocket Watch',
    category: 'perk',
    price: 60,
    description: 'Adds +15 seconds of bonus thinking time on all timed Boss Battle combat questions.',
    badge: '+15s Clock',
    perkEffect: '+15s Boss Timer',
  },
  {
    id: 'perk_espresso_mushroom',
    name: 'Espresso Power Mushroom',
    category: 'perk',
    price: 25,
    description: 'Instant turbo booster that plays a joyful Mario fanfare and grants +10 instant focus boost.',
    badge: 'Focus Boost',
    perkEffect: 'Instant Fanfare & Alertness',
  },
  {
    id: 'perk_kart_gold_boost',
    name: 'Kart Golden Star Overdrive',
    category: 'perk',
    price: 35,
    description: 'Upgrades Labor Kart with enhanced drift mini-turbo sparks and permanent acceleration boost!',
    badge: 'Kart Turbo',
    perkEffect: 'Drift Boost Mini-Turbo Overdrive',
  },
  {
    id: 'perk_infinite_jump',
    name: 'Cape Feather Jump Enhancer',
    category: 'perk',
    price: 40,
    description: 'Super-charges your 2D platformer jump height with variable float aerodynamics!',
    badge: 'Cape Feather',
    perkEffect: 'Enhanced 2D Platformer Float',
  },
  {
    id: 'perk_triple_star_coin',
    name: 'Golden Star Coin Multiplier',
    category: 'perk',
    price: 45,
    description: 'Doubles all bonus coins awarded from World Level-Ups and Arcade Mini-Games!',
    badge: '2x Level-Up',
    perkEffect: '2x Bonus Coins across Games',
  },
  {
    id: 'perk_bar_defense_shield',
    name: 'Bar Exam Second-Chance Shield',
    category: 'perk',
    price: 50,
    description: 'Provides a second chance shield when attempting tough Labor Standards bar scenarios!',
    badge: 'Exam Shield',
    perkEffect: 'Protects Quiz Score on Missed Questions',
  },
];

export const PRESTIGE_ITEMS: ShopItem[] = [
  {
    id: 'title_supreme_arbiter',
    name: 'Supreme Labor Arbiter',
    category: 'title',
    price: 100,
    description: 'Elite honorary title displayed across your User Profile & Score Card.',
    badge: 'NLRC Sovereign',
  },
  {
    id: 'title_kasambahay_champion',
    name: 'Kasambahay Champion',
    category: 'title',
    price: 75,
    description: 'Commemorates mastery of R.A. 10361 Domestic Workers statutory rights.',
    badge: 'R.A. 10361 Guardian',
  },
  {
    id: 'title_leave_specialist',
    name: 'World 6 Statutory Leave Specialist',
    category: 'title',
    price: 110,
    description: 'Honors mastery of SIL, 105-Day Maternity, Paternity, Solo Parent, Gynecological & VAWC Leaves.',
    badge: 'World 6 Master',
  },
  {
    id: 'title_codal_sovereign',
    name: 'Invincible Codal Sovereign',
    category: 'title',
    price: 150,
    description: 'Badge of honor for mastering every single unabridged article in the Labor Code.',
    badge: '100% Codal',
  },
  {
    id: 'title_undersecretary',
    name: 'Undersecretary of Labor Standards',
    category: 'title',
    price: 200,
    description: 'High-ranking executive title certifying supreme knowledge of DOLE issuances.',
    badge: 'DOLE Bureau',
  },
  {
    id: 'title_dean_jurisprudence',
    name: 'Dean of Philippine Jurisprudence',
    category: 'title',
    price: 300,
    description: 'The pinnacle of achievement in Philippine Labor Standards and Social Legislation.',
    badge: 'Juris Doctor',
  },
  {
    id: 'title_mushroom_chief_justice',
    name: 'Grand Chief Justice of the Star Realm',
    category: 'title',
    price: 500,
    description: 'Ultimate coin-vault prestige honor reserved for top earners on the Global Coin Leaderboard.',
    badge: 'Supreme Seal',
  },
];

export const SOUNDPACK_ITEMS: ShopItem[] = [
  {
    id: 'sound_default',
    name: 'Mushroom Kingdom Classic',
    category: 'soundpack',
    soundPackId: 'sound_default',
    price: 0,
    description: 'Iconic Mario chiptune tones with balanced square waves, crisp coin pings, and playful arpeggios.',
    badge: 'Classic 8-Bit',
  },
  {
    id: 'sound_nes_8bit',
    name: 'NES 8-Bit Chiptune Pack',
    category: 'soundpack',
    soundPackId: 'sound_nes_8bit',
    price: 30,
    description: 'Crisp square-wave and triangle-wave sound effects inspired by the 1985 NES original.',
    badge: 'NES 1985',
  },
  {
    id: 'sound_snes_16bit',
    name: 'SNES 16-Bit Super Chime',
    category: 'soundpack',
    soundPackId: 'sound_snes_16bit',
    price: 45,
    description: 'Rich stereo brass, crystal bells, dual-voice warmth, and orchestra hits from the 1990 Super Mario World era.',
    badge: '16-Bit Super',
  },
  {
    id: 'sound_zen_lofi',
    name: 'Zen Lofi Study Chimes',
    category: 'soundpack',
    soundPackId: 'sound_zen_lofi',
    price: 50,
    description: 'Gentle pure-sine kalimba tones and warm mellow resonance for soothing deep-focus Bar review sessions.',
    badge: 'Zen Study',
  },
  {
    id: 'sound_galaxy_synth',
    name: 'Cosmic Galaxy Synth Pack',
    category: 'soundpack',
    soundPackId: 'sound_galaxy_synth',
    price: 60,
    description: 'Ethereal star arpeggios, shimmering space harmonics, and celestial chime cascades.',
    badge: 'Galaxy 2007',
  },
  {
    id: 'sound_bowser_metal',
    name: 'Bowser Lava Rock Overdrive',
    category: 'soundpack',
    soundPackId: 'sound_bowser_metal',
    price: 65,
    description: 'Boiling sawtooth distortion, crunchy sub-bass power, and intense courtroom boss energy.',
    badge: 'Magma Rock',
  },
  {
    id: 'sound_orchestral',
    name: 'Mario Modern Orchestral Symphony',
    category: 'soundpack',
    soundPackId: 'sound_orchestral',
    price: 70,
    description: 'Majestic symphonic brass fanfares, warm orchestral string harmonics, and timpani flourishes for grand Bar review study.',
    badge: 'Symphony Era',
  },
  {
    id: 'sound_underwater_ambient',
    name: 'Dire Dire Docks Coral Reef',
    category: 'soundpack',
    soundPackId: 'sound_underwater_ambient',
    price: 75,
    description: 'Dreamy electric-piano coral chords and gentle sub-aquatic bell progressions for calm statutory memorization.',
    badge: 'N64 Aquatic',
  },
  {
    id: 'sound_peach_royal',
    name: 'Peach Castle Harpsichord',
    category: 'soundpack',
    soundPackId: 'sound_peach_royal',
    price: 80,
    description: 'Regal plucked harpsichord cadences and chamber flute counter-melodies worthy of Supreme Court jurisprudence.',
    badge: 'Royal Court',
  },
  {
    id: 'sound_yoshi_tropical',
    name: 'Yoshi Island Marimba Breeze',
    category: 'soundpack',
    soundPackId: 'sound_yoshi_tropical',
    price: 85,
    description: 'Sunny wooden marimba arpeggios, island basslines, and cheerful syncopated melodies that prevent study burnout.',
    badge: 'Island Groove',
  },
  {
    id: 'sound_ghost_organ',
    name: 'Luigi Mansion Pipe Organ',
    category: 'soundpack',
    soundPackId: 'sound_ghost_organ',
    price: 90,
    description: 'Playful gothic pipe-organ harmonies and mysterious pizzicato steps for late-night Bar exam case crunching.',
    badge: 'Mansion Mystery',
  },
  {
    id: 'sound_dk_jungle',
    name: 'DK Country Jungle Groove',
    category: 'soundpack',
    soundPackId: 'sound_dk_jungle',
    price: 95,
    description: 'Warm sub-bass grooves layered with atmospheric rainforest flute echoes and crisp rhythmic momentum.',
    badge: 'Jungle Rhythm',
  },
  {
    id: 'sound_rainbow_synthwave',
    name: 'Rainbow Road Turbo Synth',
    category: 'soundpack',
    soundPackId: 'sound_rainbow_synthwave',
    price: 110,
    description: 'Soaring analog lead synths and euphoric championship chord progressions for high-speed review sprints.',
    badge: 'Star Cup',
  },
  {
    id: 'sound_paper_acoustic',
    name: 'Paper Kingdom Cozy Acoustic',
    category: 'soundpack',
    soundPackId: 'sound_paper_acoustic',
    price: 115,
    description: 'Intimate music-box celesta and warm acoustic pluck textures tailored for long reading sessions.',
    badge: 'Storybook',
  },
  {
    id: 'sound_starlight_jazz',
    name: 'New Donk Starlight Jazz',
    category: 'soundpack',
    soundPackId: 'sound_starlight_jazz',
    price: 125,
    description: 'Upbeat walking basslines, velvet jazz seventh chords, and crisp brass stabs from Metro Kingdom.',
    badge: 'Metro Brass',
  },
];

export const SPECIAL_EVENT_ITEMS = [
  {
    id: 'event_double_xp_1h',
    name: '1-Hour Double XP & Coin Rush',
    badge: 'Limited Event · 60m',
    price: 180,
    description:
      'Toad’s Grand Festival Pass! Doubles ALL Gold Coin & XP rewards across Modules, Study Sprints, Flashcards, and Boss Battles for 60 full minutes.',
    effectLabel: '2x Coin & XP Multiplier for 60 Minutes',
  },
  {
    id: 'event_unlock_all_30m',
    name: '30-Minute All-Worlds Master Key',
    badge: 'Stage Pass · 30m',
    price: 140,
    description:
      'Temporarily unlocks every locked Overworld Stage across Worlds 1–6 for 30 minutes so you can preview advanced Bar Exam modules ahead of schedule.',
    effectLabel: 'Unlocks All Locked World Map Stages for 30m',
  },
  {
    id: 'event_boss_skip_token',
    name: 'One-Time Boss Battle Skip Decree',
    badge: 'Royal Writ · 1 Use',
    price: 220,
    description:
      'Grants 1 Royal Writ of Certiorari token allowing an instant victorious bypass of any Bowser Boss Battle (+100 Coins & 5m Invincible Study Mode!).',
    effectLabel: '+1 One-Time Boss Battle Skip Token',
  },
  {
    id: 'event_grand_starlight_frenzy',
    name: 'Grand Starlight Frenzy Bundle',
    badge: 'Mega Event · Bundle',
    price: 260,
    description:
      'Combines a 90-Minute Double Coin Rush + 30-Minute All-Worlds Master Key + 1 Boss Battle Skip Token in one celebratory Toad’s Bazaar package!',
    effectLabel: '90m 2x Coins + 30m Unlock-All + 1 Boss Skip',
  },
] as const;

export interface LuxuryShopGood {
  id: string;
  name: string;
  badge: string;
  price: number;
  slot: 'frame' | 'aura' | 'cartridge';
  frameId?: LuxuryAvatarFrameId;
  auraId?: LuxuryMushroomAuraId;
  cartridgeId?: LuxuryCartridgeBadgeId;
  description: string;
}

export const LUXURY_GOODS_ITEMS: LuxuryShopGood[] = [
  {
    id: 'lux_frame_gold_filigree',
    name: '24K Gold-Plated Filigree Frame',
    badge: 'Avatar Frame · Gold',
    price: 160,
    slot: 'frame',
    frameId: 'lux_frame_gold_filigree',
    description: 'gleaming 24-karat Mushroom Kingdom filigree border around your Hero Avatar in Profile & Chambers.',
  },
  {
    id: 'lux_frame_grand_star_platinum',
    name: 'Grand Star Platinum Bezel',
    badge: 'Avatar Frame · Platinum',
    price: 280,
    slot: 'frame',
    frameId: 'lux_frame_grand_star_platinum',
    description: 'Celestial Rosalina observatory platinum bezel with diamond-cut cyan highlights.',
  },
  {
    id: 'lux_frame_sovereign_ruby',
    name: 'Sovereign Ruby Crown Frame',
    badge: 'Avatar Frame · Sovereign',
    price: 420,
    slot: 'frame',
    frameId: 'lux_frame_sovereign_ruby',
    description: 'Supreme Justice crimson-and-gold sovereign portrait frame reserved for elite Bar scholars.',
  },
  {
    id: 'lux_aura_golden_truffle',
    name: 'Rare Golden Truffle Aura',
    badge: 'Mushroom Aura · Rare',
    price: 150,
    slot: 'aura',
    auraId: 'lux_aura_golden_truffle',
    description: 'Surrounds your Hero Avatar with a warm golden-emerald truffle halo.',
  },
  {
    id: 'lux_aura_cosmic_nebula',
    name: 'Cosmic Starbit Nebula Aura',
    badge: 'Mushroom Aura · Mythic',
    price: 320,
    slot: 'aura',
    auraId: 'lux_aura_cosmic_nebula',
    description: 'Radiates an iridescent Star Road nebula shimmer behind your Hero portrait.',
  },
  {
    id: 'lux_aura_royal_crown_glow',
    name: 'Royal Peach Sunburst Aura',
    badge: 'Mushroom Aura · Imperial',
    price: 450,
    slot: 'aura',
    auraId: 'lux_aura_royal_crown_glow',
    description: 'Blazing royal rose-and-gold sunburst aura celebrating top-tier Labor Code mastery.',
  },
  {
    id: 'lux_cart_nes_1985_gold',
    name: '1985 Championship Gold Cartridge',
    badge: 'Leaderboard Cart · 1985',
    price: 190,
    slot: 'cartridge',
    cartridgeId: 'lux_cart_nes_1985_gold',
    description: 'Displays the iconic 1985 Nintendo World Championship Gold Cart badge beside your name on Leaderboards!',
  },
  {
    id: 'lux_cart_famicom_ruby',
    name: 'Famicom Crimson Collector Cart',
    badge: 'Leaderboard Cart · Collector',
    price: 340,
    slot: 'cartridge',
    cartridgeId: 'lux_cart_famicom_ruby',
    description: 'Displays a rare Tokyo Famicom Crimson Collector Cartridge emblem next to your Leaderboard rank!',
  },
  {
    id: 'lux_cart_star_road_holo',
    name: 'Star Road Holographic Cartridge',
    badge: 'Leaderboard Cart · 500c Apex',
    price: 500,
    slot: 'cartridge',
    cartridgeId: 'lux_cart_star_road_holo',
    description: 'The ultimate 500-Coin status symbol: a holographic Star Road cartridge displayed on Coin & Quiz Leaderboards!',
  },
];

export const CERTIFICATE_ITEM: ShopItem = {
  id: 'cert_mastery',
  name: 'Official Certificate of Labor Standards Mastery',
  category: 'certificate',
  price: 50,
  description: 'Unlocks a high-resolution, printable diploma certifying your mastery of Philippine Labor Standards with the Mushroom Kingdom Gold Seal!',
  badge: 'Printable Diploma',
};

export const ToadShop: React.FC<ToadShopProps> = ({
  coins,
  setCoins,
  activeTheme,
  setActiveTheme,
  equippedAvatar,
  setEquippedAvatar,
  onClose,
  isModal = false,
  superStarEndsAt = 0,
  onActivateSuperStar,
  shortcutMapActive = false,
  onToggleShortcutMap,
  equippedCompanion = 'comp_none',
  onEquipCompanion,
  equippedCardFrame = 'frame_default',
  onEquipCardFrame,
  onBoostStreak,
  onOpenLeaderboard,
  appStudyFont = 'jakarta',
  onSelectAppStudyFont,
  onOpenCertificatePreview,
  specialEventsState,
  onUpdateSpecialEventsState,
  luxuryEquipped,
  onUpdateLuxuryEquipped,
  onNavigateTab,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    | 'powerups'
    | 'law_chambers'
    | 'arcade_quiz_boosts'
    | 'lucky_wheel'
    | 'click_confetti_fx'
    | 'relics_badges'
    | 'extended_gear'
    | 'special_events'
    | 'luxury'
    | 'avatars'
    | 'companions'
    | 'themes'
    | 'perks'
    | 'prestige'
    | 'soundpacks'
    | 'mystery'
    | 'certificate'
  >('powerups');

  const [diplomaOrientation, setDiplomaOrientation] =
    useState<DocumentOrientation>('landscape');
  const [showCoinGuide, setShowCoinGuide] = useState<boolean>(true);
  const [shopSearchQuery, setShopSearchQuery] = useState<string>('');
  const [r10State, setR10State] = useState<Round10VaultState>(() =>
    loadRound10VaultState()
  );
  const [isSpinningWheel, setIsSpinningWheel] = useState<boolean>(false);
  const [wheelRotationDeg, setWheelRotationDeg] = useState<number>(0);
  const [wheelWinBanner, setWheelWinBanner] = useState<string | null>(null);

  const persistRound10State = (next: Round10VaultState) => {
    setR10State(next);
    saveRound10VaultState(next);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mario-round10-vault-updated'));
    }
  };

  useEffect(() => {
    if (activeCategory === 'certificate') {
      applyPrintPageRule(diplomaOrientation, '6mm');
      return () => {
        clearPrintPageRule();
      };
    }
    return undefined;
  }, [activeCategory, diplomaOrientation]);
  const [selectedFaction, setSelectedFaction] = useState<string>('All');
  const [mysteryResult, setMysteryResult] = useState<string | null>(null);
  const [isRollingMystery, setIsRollingMystery] = useState<boolean>(false);
  const [powerupNotice, setPowerupNotice] = useState<string | null>(null);
  const [, setNowTick] = useState<number>(() => Date.now());

  const [certRecipientName, setCertRecipientName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stats = loadPlayerProfileStats(window.localStorage);
      if (stats.playerName && stats.playerName !== 'Law Adventurer') {
        return stats.playerName;
      }
    }
    return 'Mario Bar Candidate';
  });
  const [certPdfDownloaded, setCertPdfDownloaded] = useState<boolean>(false);

  const [equippedTitle, setEquippedTitle] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mario_equipped_title') || '';
    }
    return '';
  });

  const [localCompanion, setLocalCompanion] = useState<StudyCompanionId>(() => {
    if (equippedCompanion && equippedCompanion !== 'comp_none') return equippedCompanion;
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('mario_study_companion_v1') as StudyCompanionId) || 'comp_none';
    }
    return 'comp_none';
  });

  const [localCardFrame, setLocalCardFrame] = useState<CardFrameId>(() => {
    if (equippedCardFrame && equippedCardFrame !== 'frame_default') return equippedCardFrame;
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('mario_card_frame_v1') as CardFrameId) || 'frame_default';
    }
    return 'frame_default';
  });

  const [localSuperStarEndsAt, setLocalSuperStarEndsAt] = useState<number>(() => {
    if (superStarEndsAt > 0) return superStarEndsAt;
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('mario_super_star_expiry_ms_v1') || '0') || 0;
    }
    return 0;
  });

  const [localShortcutMap, setLocalShortcutMap] = useState<boolean>(() => {
    if (shortcutMapActive) return true;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mario_shortcut_map_active_v1') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (superStarEndsAt > 0) setLocalSuperStarEndsAt(superStarEndsAt);
  }, [superStarEndsAt]);

  useEffect(() => {
    setLocalShortcutMap(shortcutMapActive);
  }, [shortcutMapActive]);

  useEffect(() => {
    const effectiveEnd = Math.max(superStarEndsAt, localSuperStarEndsAt);
    if (effectiveEnd <= Date.now()) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [superStarEndsAt, localSuperStarEndsAt]);

  const effectiveStarStatus = getSuperStarBuffStatus(
    Math.max(superStarEndsAt, localSuperStarEndsAt)
  );
  const effectiveShortcutActive = shortcutMapActive || localShortcutMap;
  const activeCompanion = onEquipCompanion ? equippedCompanion : localCompanion;
  const activeFrame = onEquipCardFrame ? equippedCardFrame : localCardFrame;

  const [themePackFilter, setThemePackFilter] = useState<'all' | 'pro_study' | 'arcade'>('all');
  const [equippedSoundPack, setEquippedSoundPack] = useState<SoundPackId>(() => {
    return marioAudio.settings.soundPack || 'sound_default';
  });
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(() => {
    return marioAudio.isMusicPlaying();
  });

  useEffect(() => {
    return marioAudio.subscribe((s) => {
      if (s.soundPack) {
        setEquippedSoundPack(s.soundPack);
      }
      setIsBgmPlaying(Boolean(s.enabled && s.musicEnabled && marioAudio.isMusicPlaying()));
    });
  }, []);

  const [unlockedItemIds, setUnlockedItemIds] = useState<string[]>(() => {
    const defaults = [
      'theme_overworld',
      'theme_peach_castle',
      'theme_yoshi_island',
      'theme_rosalina_comet',
      'theme_royal_parchment',
      'avatar_mario',
      'avatar_luigi',
      'avatar_peach',
      'sound_default',
      'frame_default',
    ];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mario_unlocked_items');
        if (saved) {
          const parsed = JSON.parse(saved) as string[];
          return Array.from(new Set([...defaults, ...parsed]));
        }
        return defaults;
      } catch {
        return defaults;
      }
    }
    return defaults;
  });

  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  const handleRestorePurchases = () => {
    const report = marioAudio.restoreAudioPacks();
    const merged = Array.from(new Set([...unlockedItemIds, ...report.restoredPacks]));
    setUnlockedItemIds(merged);
    try {
      localStorage.setItem('mario_unlocked_items', JSON.stringify(merged));
    } catch {
      // ignore
    }
    setEquippedSoundPack(report.activePack);
    setRestoreMessage(
      `Restored ${report.restoredPacks.length} Audio Packs & verified Modules 1–6 soundscapes (${
        report.newlyRecoveredCount > 0
          ? `${report.newlyRecoveredCount} missing pack(s) recovered`
          : 'all packs synced'
      })!`
    );
    setTimeout(() => setRestoreMessage(null), 4500);
  };

  const [coinRainBurstId, setCoinRainBurstId] = useState<number>(0);

  const [localSpecialEvents, setLocalSpecialEvents] = useState<ToadSpecialEventsState>(() =>
    typeof window !== 'undefined'
      ? loadToadSpecialEventsState(window.localStorage)
      : { invincibleEndsAt: 0, doubleXpEndsAt: 0, unlockAllModulesEndsAt: 0, bossSkipTokens: 0 }
  );
  const effectiveSpecialEvents = specialEventsState || localSpecialEvents;

  const updateSpecialEvents = (next: ToadSpecialEventsState) => {
    setLocalSpecialEvents(next);
    if (typeof window !== 'undefined') {
      saveToadSpecialEventsState(next, window.localStorage);
    }
    onUpdateSpecialEventsState?.(next);
  };

  const [localLuxuryEquipped, setLocalLuxuryEquipped] = useState<LuxuryEquippedState>(() =>
    typeof window !== 'undefined'
      ? loadLuxuryEquippedState(window.localStorage)
      : { avatarFrame: 'lux_frame_none', mushroomAura: 'lux_aura_none', cartridgeBadge: 'lux_cart_none' }
  );
  const effectiveLuxury = luxuryEquipped || localLuxuryEquipped;

  const updateLuxury = (next: LuxuryEquippedState) => {
    setLocalLuxuryEquipped(next);
    if (typeof window !== 'undefined') {
      saveLuxuryEquippedState(next, window.localStorage);
    }
    onUpdateLuxuryEquipped?.(next);
  };

  const triggerCoinRainIfHighRoller = (spentCoins: number) => {
    if (spentCoins >= 100) {
      setCoinRainBurstId(Date.now());
      window.setTimeout(() => {
        setCoinRainBurstId((prev) => (Date.now() - prev >= 2300 ? 0 : prev));
      }, 2400);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 55,
        spread: 72,
        origin: { y: 0.62 },
        colors: ['#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6'],
      });
    } catch {
      // ignore
    }
  };

  const handleBuySpecialEvent = (eventItem: (typeof SPECIAL_EVENT_ITEMS)[number]) => {
    if (coins < eventItem.price) {
      marioAudio.playStomp();
      return;
    }
    setCoins((prev) => prev - eventItem.price);
    triggerConfetti();
    triggerCoinRainIfHighRoller(eventItem.price);
    marioAudio.playStarTheme();

    const now = Date.now();
    const next = { ...effectiveSpecialEvents };
    if (eventItem.id === 'event_double_xp_1h') {
      next.doubleXpEndsAt = Math.max(now, next.doubleXpEndsAt) + 60 * 60 * 1000;
      setPowerupNotice('1-Hour Double XP & Coin Rush Activated! All rewards are 2x for 60 minutes!');
    } else if (eventItem.id === 'event_unlock_all_30m') {
      next.unlockAllModulesEndsAt = Math.max(now, next.unlockAllModulesEndsAt) + 30 * 60 * 1000;
      setPowerupNotice('30-Minute All-Worlds Master Key Active! Every locked World Map stage is now open!');
    } else if (eventItem.id === 'event_boss_skip_token') {
      next.bossSkipTokens = (next.bossSkipTokens || 0) + 1;
      setPowerupNotice('Royal Writ Acquired! +1 One-Time Boss Battle Skip Token ready in Bowser Boss Quest!');
    } else if (eventItem.id === 'event_grand_starlight_frenzy') {
      next.doubleXpEndsAt = Math.max(now, next.doubleXpEndsAt) + 90 * 60 * 1000;
      next.unlockAllModulesEndsAt = Math.max(now, next.unlockAllModulesEndsAt) + 30 * 60 * 1000;
      next.bossSkipTokens = (next.bossSkipTokens || 0) + 1;
      setPowerupNotice('Grand Starlight Frenzy Activated! 90m 2x Coins + 30m Unlock-All + 1 Boss Skip Token!');
    }
    updateSpecialEvents(next);
    setTimeout(() => setPowerupNotice(null), 4500);
  };

  const handleEquipLuxuryGood = (good: LuxuryShopGood) => {
    marioAudio.playLevelUp();
    if (good.slot === 'frame' && good.frameId) {
      updateLuxury({
        ...effectiveLuxury,
        avatarFrame: effectiveLuxury.avatarFrame === good.frameId ? 'lux_frame_none' : good.frameId,
      });
    } else if (good.slot === 'aura' && good.auraId) {
      updateLuxury({
        ...effectiveLuxury,
        mushroomAura: effectiveLuxury.mushroomAura === good.auraId ? 'lux_aura_none' : good.auraId,
      });
    } else if (good.slot === 'cartridge' && good.cartridgeId) {
      updateLuxury({
        ...effectiveLuxury,
        cartridgeBadge: effectiveLuxury.cartridgeBadge === good.cartridgeId ? 'lux_cart_none' : good.cartridgeId,
      });
    }
  };

  const handleBuyLuxuryGood = (good: LuxuryShopGood) => {
    if (coins < good.price) {
      marioAudio.playStomp();
      return;
    }
    setCoins((prev) => prev - good.price);
    triggerConfetti();
    triggerCoinRainIfHighRoller(good.price);
    marioAudio.playStarTheme();

    const updated = Array.from(new Set([...unlockedItemIds, good.id]));
    setUnlockedItemIds(updated);
    try {
      localStorage.setItem('mario_unlocked_items', JSON.stringify(updated));
    } catch {
      // ignore
    }
    handleEquipLuxuryGood(good);
    setPowerupNotice(`Luxury Vault Unlocked & Equipped: ${good.name}!`);
    setTimeout(() => setPowerupNotice(null), 4200);
  };

  const handleBuyPowerUpOrMap = (item: ShopItem) => {
    if (coins < item.price) {
      marioAudio.playStomp();
      return;
    }

    setCoins((prev) => prev - item.price);
    triggerConfetti();
    triggerCoinRainIfHighRoller(item.price);

    if (item.id === 'powerup_super_star' || item.id === 'powerup_mega_star_30m') {
      const mins = item.durationMinutes || 10;
      marioAudio.playStarTheme();
      if (onActivateSuperStar) {
        onActivateSuperStar(mins);
      } else {
        const nextEnd = Math.max(Date.now(), localSuperStarEndsAt) + mins * 60 * 1000;
        setLocalSuperStarEndsAt(nextEnd);
        try {
          localStorage.setItem('mario_super_star_expiry_ms_v1', String(nextEnd));
        } catch {
          // ignore
        }
      }
      setPowerupNotice(`Super Star Active! All coin rewards are DOUBLED (2x) for +${mins} minutes!`);
      setTimeout(() => setPowerupNotice(null), 4000);
      return;
    }

    if (item.id === 'powerup_fire_flower_streak') {
      marioAudio.playPowerUp();
      if (onBoostStreak) {
        onBoostStreak(5);
      } else if (typeof window !== 'undefined') {
        const cur = parseInt(localStorage.getItem('mario_daily_streak') || '1', 10) || 1;
        localStorage.setItem('mario_daily_streak', String(cur + 5));
      }
      setPowerupNotice('Fire Flower Bloomed! +5 Consecutive Study Days added to your Map Tracker!');
      setTimeout(() => setPowerupNotice(null), 4000);
      return;
    }

    if (item.id === 'map_shortcut_bar') {
      marioAudio.playLevelUp();
      const updated = Array.from(new Set([...unlockedItemIds, item.id]));
      setUnlockedItemIds(updated);
      try {
        localStorage.setItem('mario_unlocked_items', JSON.stringify(updated));
        localStorage.setItem('mario_shortcut_map_active_v1', 'true');
      } catch {
        // ignore
      }
      setLocalShortcutMap(true);
      onToggleShortcutMap?.(true);
      setPowerupNotice("Toad's Shortcut Map Unlocked & Active! High-yield Bar topics are now highlighted!");
      setTimeout(() => setPowerupNotice(null), 4000);
    }
  };

  const handleToggleShortcutMapState = () => {
    const next = !effectiveShortcutActive;
    marioAudio.playPipe();
    setLocalShortcutMap(next);
    try {
      localStorage.setItem('mario_shortcut_map_active_v1', String(next));
    } catch {
      // ignore
    }
    onToggleShortcutMap?.(next);
  };

  const handleEquipCompanionChoice = (compId: StudyCompanionId) => {
    marioAudio.playJump();
    setLocalCompanion(compId);
    try {
      localStorage.setItem('mario_study_companion_v1', compId);
    } catch {
      // ignore
    }
    onEquipCompanion?.(compId);
  };

  const handleEquipFrameChoice = (frameId: CardFrameId) => {
    marioAudio.playPipe();
    setLocalCardFrame(frameId);
    try {
      localStorage.setItem('mario_card_frame_v1', frameId);
    } catch {
      // ignore
    }
    onEquipCardFrame?.(frameId);
  };

  const handleBuyItem = (item: ShopItem) => {
    if (coins < item.price) {
      marioAudio.playStomp();
      return;
    }

    const nextCoins = coins - item.price;
    setCoins(nextCoins);
    marioAudio.playPowerUp();
    triggerConfetti();
    triggerCoinRainIfHighRoller(item.price);

    const updated = Array.from(new Set([...unlockedItemIds, item.id]));
    setUnlockedItemIds(updated);

    try {
      localStorage.setItem('mario_unlocked_items', JSON.stringify(updated));
    } catch {
      // fallback
    }

    if (item.category === 'theme' && item.themeId) {
      handleEquipTheme(item.themeId);
    } else if (item.category === 'avatar' && item.avatarId) {
      handleEquipAvatar(item.avatarId);
    } else if (item.category === 'soundpack' && item.soundPackId) {
      marioAudio.recordAudioPackPurchase(item.soundPackId);
      handleEquipSoundPack(item.soundPackId);
    } else if (item.category === 'companion' && item.companionId) {
      handleEquipCompanionChoice(item.companionId);
    } else if (item.category === 'frame' && item.frameId) {
      handleEquipFrameChoice(item.frameId);
    } else if (item.category === 'title') {
      handleEquipTitle(item.name);
    }
  };

  const handleEquipTheme = (themeId: MarioTheme) => {
    setActiveTheme(themeId);
    marioAudio.playPipe();
    try {
      localStorage.setItem('mario_active_theme', themeId);
    } catch {
      // fallback
    }
  };

  const handleEquipAvatar = (avatarId: MarioAvatar) => {
    setEquippedAvatar(avatarId);
    marioAudio.playJump();
    try {
      localStorage.setItem('mario_equipped_avatar', avatarId);
    } catch {
      // fallback
    }
  };

  const handleEquipSoundPack = (packId: SoundPackId) => {
    setEquippedSoundPack(packId);
    marioAudio.setSoundPack(packId, true);
  };

  const handleEquipTitle = (title: string) => {
    setEquippedTitle(title);
    marioAudio.playLevelUp();
    try {
      localStorage.setItem('mario_equipped_title', title);
    } catch {
      // fallback
    }
  };

  const handleRollMysteryBox = (tier: 'classic' | 'golden' | 'royal' = 'classic') => {
    const cost = tier === 'royal' ? 150 : tier === 'golden' ? 60 : 15;
    if (coins < cost || isRollingMystery) {
      marioAudio.playStomp();
      return;
    }

    setCoins((prev) => prev - cost);
    triggerCoinRainIfHighRoller(cost);
    setIsRollingMystery(true);
    setMysteryResult(null);
    marioAudio.playCoin();

    setTimeout(() => {
      const rand = Math.random();
      let payoutCoins = 25;
      let msg = '';

      if (tier === 'royal') {
        if (rand < 0.22) {
          payoutCoins = 420;
          msg = 'ROYAL VAULT JACKPOT! You struck 420 Gold Coins + Super Star fanfare!';
          marioAudio.playStarTheme();
        } else if (rand < 0.58) {
          payoutCoins = 240;
          msg = 'SUPREME WIN! 240 Gold Coins burst from Bowser’s Treasury (+90 net)!';
          marioAudio.playPowerUp();
        } else if (rand < 0.85) {
          payoutCoins = 180;
          msg = 'TREASURY HIT! You recovered 180 Gold Coins (+30 profit)!';
          marioAudio.playCoin();
        } else {
          payoutCoins = 110;
          msg = '110 Gold Coins returned + 3-Minute Super Star 2x Coin Bonus activated!';
          marioAudio.playPowerUp();
          onActivateSuperStar?.(3);
        }
      } else if (tier === 'golden') {
        if (rand < 0.2) {
          payoutCoins = 175;
          msg = 'GOLDEN BLOCK JACKPOT! 175 Gold Coins erupted from the Super Block!';
          marioAudio.playStarTheme();
        } else if (rand < 0.55) {
          payoutCoins = 95;
          msg = 'SUPER LUCKY! 95 Gold Coins (+35 profit) popped out!';
          marioAudio.playPowerUp();
        } else if (rand < 0.82) {
          payoutCoins = 75;
          msg = 'WINNER! 75 Gold Coins (+15 profit)!';
          marioAudio.playCoin();
        } else {
          payoutCoins = 45;
          msg = '45 Coins returned + 2-Minute Super Star 2x Coin Rush!';
          marioAudio.playCoin();
          onActivateSuperStar?.(2);
        }
      } else {
        if (rand < 0.15) {
          payoutCoins = 50;
          msg = 'JACKPOT! You struck a golden vein and won 50 Coins!';
          marioAudio.playStarTheme();
        } else if (rand < 0.4) {
          payoutCoins = 35;
          msg = 'SUPER LUCKY! 35 Golden Coins popped out of the ? Block!';
          marioAudio.playPowerUp();
        } else if (rand < 0.8) {
          payoutCoins = 25;
          msg = 'WINNER! You hit 25 Coins! (+10 profit)';
          marioAudio.playCoin();
        } else {
          payoutCoins = 10;
          msg = 'Good attempt! 10 Coins returned + 1-Up Mushroom blessing!';
          marioAudio.playCoin();
        }
      }

      setCoins((prev) => prev + payoutCoins);
      setMysteryResult(msg);
      setIsRollingMystery(false);
      triggerConfetti();
    }, 650);
  };

  const factions = [
    'All',
    'Mushroom Heroes',
    'Royal Court',
    'Kong & Dino Crew',
    'Rivals & Villains',
    'Special Legends',
  ];

  const displayedAvatars =
    selectedFaction === 'All'
      ? AVATAR_ITEMS
      : AVATAR_ITEMS.filter((item) => item.faction === selectedFaction);

  const isCertUnlocked = unlockedItemIds.includes(CERTIFICATE_ITEM.id);
  const isShortcutMapUnlocked = unlockedItemIds.includes('map_shortcut_bar');
  const chambersPrestige = computeLawChambersPrestige(r10State.unlockedIds);

  const totalShopCatalogCount =
    POWERUP_ITEMS.length +
    SPECIAL_EVENT_ITEMS.length +
    LUXURY_GOODS_ITEMS.length +
    SOUNDPACK_ITEMS.length +
    THEME_ITEMS.length +
    AVATAR_ITEMS.length +
    COMPANION_ITEMS.length +
    CARD_FRAME_ITEMS.length +
    PERK_ITEMS.length +
    PRESTIGE_ITEMS.length +
    ROUND10_ALL_NEW_SHOP_ITEMS.length +
    4; // 3 Mystery Chests + Master Diploma

  const handleEquipRound10Item = (item: Round10ShopCatalogItem) => {
    marioAudio.playJump();
    if (item.subType === 'click_fx') {
      persistRound10State({
        ...r10State,
        equippedClickFx: item.id,
      });
      setPowerupNotice(`Equipped Click Spark FX: ${item.name}!`);
      setTimeout(() => setPowerupNotice(null), 3200);
    } else if (item.subType === 'confetti_fx') {
      persistRound10State({
        ...r10State,
        equippedConfettiFx: item.id,
      });
      setPowerupNotice(`Equipped Celebration Confetti: ${item.name}!`);
      setTimeout(() => setPowerupNotice(null), 3200);
    } else if (item.subType === 'hud_nameplate') {
      const nextPlate =
        r10State.equippedNameplate === item.name ? '' : item.name;
      persistRound10State({
        ...r10State,
        equippedNameplate: nextPlate,
      });
      if (nextPlate) {
        handleEquipTitle(item.name);
      }
      setPowerupNotice(
        nextPlate
          ? `Equipped HUD Nameplate: ${item.name}!`
          : `Unequipped HUD Nameplate`
      );
      setTimeout(() => setPowerupNotice(null), 3200);
    }
  };

  const handleBuyRound10Item = (item: Round10ShopCatalogItem) => {
    if (coins < item.price) {
      marioAudio.playStomp();
      return;
    }
    setCoins((prev) => prev - item.price);
    triggerConfetti();
    triggerCoinRainIfHighRoller(item.price);
    marioAudio.playPowerUp();

    if (item.isConsumable && item.consumableKey) {
      const qty = item.packQuantity || 1;
      const nextInv = {
        ...r10State.inventory,
        [item.consumableKey]: (r10State.inventory[item.consumableKey] || 0) + qty,
      };
      persistRound10State({
        ...r10State,
        inventory: nextInv,
      });
      setPowerupNotice(
        `Added +${qty} token(s) from "${item.name}" to your Quest & Arcade Backpack!`
      );
      setTimeout(() => setPowerupNotice(null), 4000);
      return;
    }

    const nextUnlocked = Array.from(new Set([...r10State.unlockedIds, item.id]));
    const nextState: Round10VaultState = {
      ...r10State,
      unlockedIds: nextUnlocked,
      equippedClickFx:
        item.subType === 'click_fx' ? item.id : r10State.equippedClickFx,
      equippedConfettiFx:
        item.subType === 'confetti_fx' ? item.id : r10State.equippedConfettiFx,
      equippedNameplate:
        item.subType === 'hud_nameplate'
          ? item.name
          : r10State.equippedNameplate,
    };
    persistRound10State(nextState);
    if (item.subType === 'hud_nameplate') {
      handleEquipTitle(item.name);
    }
    setPowerupNotice(`Unlocked: ${item.name}!`);
    setTimeout(() => setPowerupNotice(null), 3800);
  };

  const handleSpinLuckyWheel = (highRoller: boolean) => {
    const spinCost = highRoller ? 75 : 25;
    if (coins < spinCost || isSpinningWheel) {
      marioAudio.playStomp();
      return;
    }
    setCoins((prev) => prev - spinCost);
    setIsSpinningWheel(true);
    setWheelWinBanner(null);
    marioAudio.playCoin();

    const outcome = resolveLuckyWheelSpin(Math.random(), highRoller);
    const sliceAngle = 360 / TOAD_LUCKY_WHEEL_WEDGES.length;
    const targetRotation =
      wheelRotationDeg + 1080 + (360 - outcome.wedgeIndex * sliceAngle);
    setWheelRotationDeg(targetRotation);

    window.setTimeout(() => {
      const latest = loadRound10VaultState();
      const nextInv = { ...latest.inventory };
      let summaryMsg = '';

      if (outcome.prize.rewardType === 'coins') {
        setCoins((prev) => prev + outcome.effectiveAmount);
        summaryMsg = `LUCKY STAR WIN! You landed on +${outcome.effectiveAmount} Gold Coins!`;
        marioAudio.playStarTheme();
      } else if (outcome.prize.rewardType === 'superStarMins') {
        onActivateSuperStar?.(outcome.effectiveAmount);
        summaryMsg = `SUPER STAR JACKPOT! +${outcome.effectiveAmount} Minutes of 2x Coin Multiplier Activated!`;
        marioAudio.playStarTheme();
      } else {
        const key = outcome.prize.rewardType;
        nextInv[key] = (nextInv[key] || 0) + outcome.effectiveAmount;
        summaryMsg = `PRIZE UNLOCKED! +${outcome.effectiveAmount} ${outcome.prize.label.replace(/^\+\d+\s*/, '')} added to your Backpack!`;
        marioAudio.playPowerUp();
      }

      persistRound10State({
        ...latest,
        wheelSpinsCount: (latest.wheelSpinsCount || 0) + 1,
        inventory: nextInv,
      });
      setWheelWinBanner(summaryMsg);
      setIsSpinningWheel(false);
      triggerConfetti();
    }, 900);
  };

  const handleCoinDestinationJump = (
    targetType: 'app_tab' | 'shop_category',
    targetValue: string
  ) => {
    marioAudio.playPipe();
    if (targetType === 'app_tab') {
      if (onNavigateTab) {
        onNavigateTab(targetValue);
        onClose?.();
      }
      return;
    }
    setShopSearchQuery('');
    setActiveCategory(targetValue as typeof activeCategory);
  };

  const normalizedSearch = shopSearchQuery.trim().toLowerCase();
  const matchingRound10Items = normalizedSearch
    ? ROUND10_ALL_NEW_SHOP_ITEMS.filter(
        (it) =>
          it.name.toLowerCase().includes(normalizedSearch) ||
          it.description.toLowerCase().includes(normalizedSearch) ||
          it.badge.toLowerCase().includes(normalizedSearch) ||
          it.effectSummary.toLowerCase().includes(normalizedSearch)
      )
    : [];

  const renderRound10CatalogGrid = (items: Round10ShopCatalogItem[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {items.map((item) => {
        const isOwned = !item.isConsumable && r10State.unlockedIds.includes(item.id);
        const isEquipped =
          (item.subType === 'click_fx' && r10State.equippedClickFx === item.id) ||
          (item.subType === 'confetti_fx' &&
            r10State.equippedConfettiFx === item.id) ||
          (item.subType === 'hud_nameplate' &&
            r10State.equippedNameplate === item.name);
        const tokenCount =
          item.isConsumable && item.consumableKey
            ? r10State.inventory[item.consumableKey] || 0
            : 0;

        return (
          <div
            key={item.id}
            data-testid={`r10-shop-card-${item.id}`}
            className={`rounded-2xl border-3 border-slate-950 p-4 flex flex-col justify-between gap-3 shadow-[3px_3px_0_#000] transition-transform ${
              isEquipped
                ? 'bg-amber-50 ring-2 ring-amber-400'
                : isOwned
                ? 'bg-emerald-50/75'
                : 'bg-white'
            } text-slate-950`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 text-amber-300 text-[10px] font-black uppercase font-mario">
                  {item.fxColorHex && (
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/60 inline-block"
                      style={{ backgroundColor: item.fxColorHex }}
                    />
                  )}
                  <span>{item.badge}</span>
                </span>
                {item.isConsumable ? (
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-300 text-[10px] font-black tabular-nums">
                    Owned: {tokenCount}
                  </span>
                ) : isOwned ? (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-200 text-emerald-950 border border-emerald-500 text-[10px] font-black">
                    UNLOCKED
                  </span>
                ) : null}
              </div>

              <h3 className="text-sm sm:text-base font-black text-slate-950 font-display leading-snug">
                {item.name}
              </h3>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                {item.description}
              </p>
              <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-[11px] font-extrabold text-slate-800">
                {item.effectSummary}
              </div>
            </div>

            <div className="pt-1">
              {item.isConsumable || !isOwned ? (
                <button
                  type="button"
                  onClick={() => handleBuyRound10Item(item)}
                  disabled={coins < item.price}
                  className="min-h-[44px] w-full rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1.5 cursor-pointer tabular-nums"
                >
                  <MarioCoinIcon className="w-4 h-4 shrink-0" />
                  <span>
                    {item.isConsumable
                      ? `Buy Pack · ${item.price} Coins`
                      : `Unlock · ${item.price} Coins`}
                  </span>
                </button>
              ) : item.subType === 'click_fx' ||
                item.subType === 'confetti_fx' ||
                item.subType === 'hud_nameplate' ? (
                <button
                  type="button"
                  onClick={() => handleEquipRound10Item(item)}
                  className={`min-h-[44px] w-full rounded-xl font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                    isEquipped
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-amber-300 hover:bg-slate-800'
                  }`}
                >
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{isEquipped ? 'Active & Equipped' : 'Equip Now'}</span>
                </button>
              ) : (
                <div className="min-h-[44px] w-full rounded-xl bg-emerald-100 border-2 border-emerald-600 text-emerald-950 font-black text-xs inline-flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0 text-emerald-700" />
                  <span>Active in Collection</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`space-y-6 max-w-full min-w-0 ${isModal ? 'max-w-4xl mx-auto' : 'max-w-6xl mx-auto'}`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-amber-500 to-red-700 text-slate-950 rounded-3xl p-4 sm:p-7 mario-card border-4 border-slate-950 shadow-[6px_6px_0_#000] relative overflow-hidden max-w-full min-w-0">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10 max-w-full min-w-0">
          <div className="flex items-start sm:items-center gap-3.5 max-w-full min-w-0">
            <div className="w-14 h-14 bg-white rounded-2xl border-3 border-black flex items-center justify-center shadow-[0_3px_0_#000] shrink-0">
              <MarioCharacterAvatar character={equippedAvatar} className="w-10 h-10" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black text-amber-300 font-black rounded-lg text-[9.5px] sm:text-[10px] uppercase font-mario leading-relaxed max-w-full">
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:hidden">TOAD&apos;S COIN BAZAAR</span>
                <span className="hidden sm:inline">TOAD&apos;S SHOP &amp; GRAND COIN BAZAAR</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-white font-display tracking-tight mt-1 break-words">
                POWER-UPS, SHORTCUT MAPS, 34 HEROES &amp; VAULT GEAR
              </h1>
              <p className="text-xs sm:text-sm font-bold text-amber-100 max-w-2xl break-words">
                Spend your study coins on 10-Minute Super Star 2x Coin Power-Ups, High-Yield Shortcut Maps, Desk Companions, Card Frames, 34 Mario Skins, Audio Packs &amp; Mystery Chests!
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {effectiveStarStatus.isActive && (
                  <span
                    data-testid="shop-super-star-active-badge"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-300 text-slate-950 border-2 border-black text-xs font-black font-mario tabular-nums shadow-[0_2px_0_#000]"
                  >
                    <MarioStarIcon className="w-4 h-4 shrink-0" />
                    <span>2X COINS ACTIVE · {effectiveStarStatus.formattedRemaining}</span>
                  </span>
                )}
                {effectiveShortcutActive && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-400 text-slate-950 border-2 border-black text-xs font-black font-mario shadow-[0_2px_0_#000]">
                    <MapIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>SHORTCUT MAP ON</span>
                  </span>
                )}
                {equippedTitle && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/85 border border-amber-400 text-amber-300 text-xs font-black font-mario">
                    <Crown className="w-3.5 h-3.5 shrink-0" />
                    <span>{equippedTitle}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end shrink-0">
            <div className="flex items-center gap-3 bg-black/85 border-3 border-amber-400 rounded-2xl px-4 py-2.5 shadow-[0_3px_0_#000]">
              <MarioCoinIcon className="w-7 h-7 shrink-0" />
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 block font-mario leading-none">
                  COIN WALLET
                </span>
                <span className="text-lg sm:text-xl font-black text-white font-mario mt-1 block leading-none tabular-nums">
                  x{coins.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleRestorePurchases}
                data-testid="shop-header-restore-audio-btn"
                className="min-h-[44px] px-3.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 whitespace-nowrap"
                title="Recover missing or previously purchased Audio Packs and verify Modules 1–6 soundscapes"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Restore Audio Pack</span>
              </button>

              {onOpenLeaderboard && (
                <button
                  type="button"
                  onClick={() => {
                    marioAudio.playCoin();
                    onOpenLeaderboard();
                  }}
                  data-testid="shop-open-leaderboard-btn"
                  className="min-h-[44px] px-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 whitespace-nowrap"
                >
                  <Trophy className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Leaderboard</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            aria-label="Close Toad's Shop"
            className="absolute top-4 right-4 min-w-[44px] min-h-[44px] rounded-xl bg-black/70 hover:bg-black text-white inline-flex items-center justify-center border-2 border-white/50 cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {(powerupNotice || restoreMessage) && (
        <div
          role="status"
          data-testid="shop-status-banner"
          className="bg-emerald-400 text-slate-950 p-3.5 rounded-2xl border-3 border-black font-black text-xs sm:text-sm flex items-center justify-between gap-3 shadow-[0_3px_0_#000]"
        >
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 stroke-[3] shrink-0" />
            <span>{powerupNotice || restoreMessage}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setPowerupNotice(null);
              setRestoreMessage(null);
            }}
            aria-label="Dismiss notification"
            className="min-w-[36px] min-h-[36px] rounded-lg bg-black/10 hover:bg-black/20 inline-flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* High-Roller Coin Rain Particle Animation (100+ Coin Spend) */}
      <AnimatePresence>
        {coinRainBurstId > 0 && (
          <motion.div
            key={coinRainBurstId}
            data-testid="shop-coin-rain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[120] overflow-hidden"
          >
            {Array.from({ length: 22 }).map((_, idx) => {
              const leftPct = (idx * 4.5 + (idx % 3) * 2) % 96;
              const delay = (idx % 6) * 0.08;
              return (
                <motion.div
                  key={idx}
                  initial={{ y: -60, x: 0, rotate: 0, opacity: 1 }}
                  animate={{
                    y: '108vh',
                    rotate: idx % 2 === 0 ? 360 : -360,
                    opacity: [1, 1, 0.85, 0],
                  }}
                  transition={{ duration: 1.9 + (idx % 4) * 0.2, delay, ease: 'easeIn' }}
                  style={{ left: `${leftPct}%` }}
                  className="absolute top-0"
                >
                  <MarioCoinIcon className="w-7 h-7 drop-shadow-[0_3px_4px_rgba(0,0,0,0.65)]" />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* "WHERE CAN I USE MY COINS?" INTERACTIVE DIRECTORY + BAZAAR SEARCH */}
      <section
        aria-label="Where Can I Use My Coins Guide"
        data-testid="where-to-use-coins-panel"
        className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl border-4 border-slate-950 p-4 sm:p-5 shadow-[5px_5px_0_#000] space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-lg font-black text-amber-300 font-display uppercase tracking-tight">
                  WHERE CAN I USE MY COINS? · {totalShopCatalogCount}+ ITEMS &amp; LIVE GAME BOOSTS
                </h2>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 text-[10px] font-black font-mario">
                  CHAMBERS +{chambersPrestige.bonusCoinPct}% PRESTIGE
                </span>
              </div>
              <p className="text-xs text-slate-300 font-semibold">
                Your coins now work everywhere: inside live Quest Quizzes (50/50, Hints, Boss Shields), Arcade Games (2x Payouts &amp; Radars), Law Chambers, Lucky Wheel &amp; 17 Shop Vaults!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="relative flex-1 sm:flex-initial min-w-[210px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={shopSearchQuery}
                onChange={(e) => setShopSearchQuery(e.target.value)}
                data-testid="shop-global-search-input"
                aria-label="Search Toad Shop items"
                placeholder={`Search ${ROUND10_ALL_NEW_SHOP_ITEMS.length}+ vault items...`}
                className="min-h-[44px] w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border-2 border-slate-700 focus:border-amber-400 text-xs font-bold text-white placeholder:text-slate-400 outline-none"
              />
            </div>
            <button
              type="button"
              data-testid="toggle-where-to-use-coins-btn"
              onClick={() => {
                setShowCoinGuide((prev) => !prev);
                marioAudio.playClick();
              }}
              className="min-h-[44px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border-2 border-slate-600 text-xs font-black cursor-pointer whitespace-nowrap"
            >
              {showCoinGuide ? 'Hide Coin Map' : 'Show Where to Use Coins'}
            </button>
          </div>
        </div>

        {/* Live Token Backpack Summary Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-black">
          <span className="text-amber-300 uppercase font-mario text-[10px]">
            YOUR CONSUMABLE BACKPACK:
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-rose-200 tabular-nums">
            50/50 Zappers: {r10State.inventory.quiz5050}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-sky-200 tabular-nums">
            Hint Scrolls: {r10State.inventory.quizHint}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-amber-200 tabular-nums">
            Boss Shields: {r10State.inventory.quizShield}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-emerald-200 tabular-nums">
            Arcade 2x: {r10State.inventory.arcade2x}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-purple-200 tabular-nums">
            Arcade Shields: {r10State.inventory.arcadeShield}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-cyan-200 tabular-nums">
            Radars: {r10State.inventory.arcadeRadar}
          </span>
        </div>

        {showCoinGuide && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
            {COIN_UTILITY_DESTINATIONS.map((dest) => (
              <div
                key={dest.id}
                data-testid={`coin-destination-${dest.id}`}
                className="rounded-2xl bg-slate-900/95 border-2 border-slate-700/90 hover:border-amber-400/80 p-3.5 flex flex-col justify-between gap-2.5 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-black uppercase text-amber-300 font-mario truncate">
                      {dest.costRangeLabel}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-white font-display leading-snug">
                    {dest.title}
                  </h3>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                    {dest.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCoinDestinationJump(dest.targetType, dest.targetValue)
                  }
                  className="min-h-[40px] w-full px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{dest.ctaLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            ))}
          </div>
        )}

        {normalizedSearch && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 uppercase font-mario">
                SEARCH RESULTS FOR &ldquo;{shopSearchQuery}&rdquo; ({matchingRound10Items.length} VAULT MATCHES)
              </span>
              <button
                type="button"
                onClick={() => setShopSearchQuery('')}
                className="text-xs font-bold text-slate-300 hover:text-white underline cursor-pointer"
              >
                Clear Search
              </button>
            </div>
            {matchingRound10Items.length > 0 ? (
              renderRound10CatalogGrid(matchingRound10Items)
            ) : (
              <p className="text-xs text-slate-400 font-semibold">
                No vault items matched that keyword. Try &ldquo;Narra&rdquo;, &ldquo;50/50&rdquo;, &ldquo;Confetti&rdquo;, &ldquo;Relic&rdquo;, or &ldquo;Yoshi&rdquo;.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Non-Scrollable Multi-Column Category Navigator Grid (Zero Horizontal Scrollbar) */}
      <nav
        aria-label="Toad Shop Categories"
        data-testid="shop-category-grid"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 bg-[#1e293b] p-2.5 rounded-2xl border-3 border-slate-950 shadow-[4px_4px_0_#000]"
      >
        {[
          { id: 'powerups' as const, label: `Power-Ups (${POWERUP_ITEMS.length})`, icon: Sparkles },
          {
            id: 'law_chambers' as const,
            label: `Law Chambers (${LAW_CHAMBERS_UPGRADE_ITEMS.length})`,
            icon: Landmark,
          },
          {
            id: 'arcade_quiz_boosts' as const,
            label: `Boost Packs (${ARCADE_AND_QUIZ_CONSUMABLE_ITEMS.length})`,
            icon: Layers,
          },
          { id: 'lucky_wheel' as const, label: 'Lucky Wheel', icon: Gift },
          {
            id: 'click_confetti_fx' as const,
            label: `Click & FX (${CLICK_AND_CONFETTI_FX_ITEMS.length})`,
            icon: Wand2,
          },
          {
            id: 'relics_badges' as const,
            label: `Relics & Plates (${RELICS_AND_NAMEPLATES_ITEMS.length})`,
            icon: Award,
          },
          {
            id: 'extended_gear' as const,
            label: `Studio Gear (${EXTENDED_COMPANIONS_AND_FRAMES_ITEMS.length})`,
            icon: BookOpen,
          },
          { id: 'special_events' as const, label: `Special Events (${SPECIAL_EVENT_ITEMS.length})`, icon: Flame },
          { id: 'luxury' as const, label: `Luxury Goods (${LUXURY_GOODS_ITEMS.length})`, icon: Gem },
          { id: 'mystery' as const, label: '3-Tier Chests', icon: HelpCircle },
          { id: 'soundpacks' as const, label: `Sound Packs (${SOUNDPACK_ITEMS.length})`, icon: Volume2 },
          { id: 'themes' as const, label: `UI Themes (${THEME_ITEMS.length})`, icon: Palette },
          { id: 'avatars' as const, label: `Heroes (${AVATAR_ITEMS.length})`, icon: User },
          {
            id: 'companions' as const,
            label: `Pets & Frames (${COMPANION_ITEMS.length + CARD_FRAME_ITEMS.length})`,
            icon: Frame,
          },
          { id: 'perks' as const, label: `Study Boosts (${PERK_ITEMS.length})`, icon: Zap },
          { id: 'prestige' as const, label: `Prestige (${PRESTIGE_ITEMS.length})`, icon: Crown },
          { id: 'certificate' as const, label: 'Master Diploma', icon: FileCheck2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isCurrent = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveCategory(tab.id);
                marioAudio.playTabSwitch();
              }}
              data-testid={`shop-tab-${tab.id}`}
              className={`min-h-[44px] w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer text-center leading-tight ${
                isCurrent
                  ? 'bg-amber-400 text-slate-950 border-2 border-black shadow-[0_2px_0_#000]'
                  : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white border-2 border-slate-700/70'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ==================== NEW CATEGORY 1: LAW CHAMBERS SANCTUARY ==================== */}
      {activeCategory === 'law_chambers' && (
        <div data-testid="shop-law-chambers-panel" className="space-y-4">
          <div className="bg-gradient-to-br from-amber-950 via-stone-900 to-slate-950 text-white rounded-3xl border-4 border-slate-950 p-5 sm:p-6 shadow-[5px_5px_0_#000] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-black uppercase font-mario">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>INTERACTIVE COUNSEL SANCTUARY</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                  {chambersPrestige.rankLabel.toUpperCase()} ({chambersPrestige.unlockedCount}/{chambersPrestige.totalCount} FURNISHED)
                </h2>
                <p className="text-xs sm:text-sm text-amber-100/90 font-semibold max-w-2xl">
                  Upgrade your personal Philippine Labor Law Chambers from a starter carrel into a Supreme Court Grand Suite! Every unlocked piece lights up inside your live office diagram below.
                </p>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-black/60 border-2 border-amber-400 text-right shrink-0">
                <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
                  SANCTUARY PRESTIGE BONUS
                </span>
                <span className="text-2xl font-black text-white font-display tabular-nums">
                  +{chambersPrestige.bonusCoinPct}% Prestige
                </span>
              </div>
            </div>

            {/* Live Visual Sanctuary Floorplan Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
              {LAW_CHAMBERS_UPGRADE_ITEMS.slice(0, 12).map((furn) => {
                const placed = r10State.unlockedIds.includes(furn.id);
                return (
                  <div
                    key={furn.id}
                    className={`rounded-xl p-2.5 border-2 text-center transition-all ${
                      placed
                        ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-xs'
                        : 'bg-slate-900/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase font-mario block truncate">
                      {furn.chambersSlot || furn.badge}
                    </span>
                    <span className="text-xs font-extrabold block truncate mt-0.5">
                      {placed ? furn.name.split(' ').slice(0, 3).join(' ') : 'Empty Slot'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {renderRound10CatalogGrid(LAW_CHAMBERS_UPGRADE_ITEMS)}
        </div>
      )}

      {/* ==================== NEW CATEGORY 2: ARCADE & QUIZ CONSUMABLE BOOST PACKS ==================== */}
      {activeCategory === 'arcade_quiz_boosts' && (
        <div data-testid="shop-boost-packs-panel" className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 text-white rounded-3xl border-4 border-slate-950 p-5 shadow-[4px_4px_0_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-amber-300 font-display uppercase">
                QUEST LIFELINES &amp; ARCADE POWER-UP BUNDLES (20 PACKS)
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 font-semibold mt-1">
                Stockpile discounted 50/50 Option Zappers, Counsel Toad Statutory Hints, Boss Mistake Shields, and Arcade 2x Payout Tickets—then trigger them directly inside Quest &amp; Arcade!
              </p>
            </div>
            {onNavigateTab && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCoinDestinationJump('app_tab', 'quiz')}
                  className="min-h-[44px] px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black cursor-pointer whitespace-nowrap"
                >
                  Go to Quest
                </button>
                <button
                  type="button"
                  onClick={() => handleCoinDestinationJump('app_tab', 'vault')}
                  className="min-h-[44px] px-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs border-2 border-black cursor-pointer whitespace-nowrap"
                >
                  Go to Arcade
                </button>
              </div>
            )}
          </div>

          {renderRound10CatalogGrid(ARCADE_AND_QUIZ_CONSUMABLE_ITEMS)}
        </div>
      )}

      {/* ==================== NEW CATEGORY 3: TOAD'S LUCKY STAR PRIZE WHEEL ==================== */}
      {activeCategory === 'lucky_wheel' && (
        <div data-testid="shop-lucky-wheel-panel" className="bg-gradient-to-b from-purple-950 via-slate-950 to-slate-900 text-white rounded-3xl border-4 border-slate-950 p-5 sm:p-7 shadow-[6px_6px_0_#000] space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-black uppercase font-mario">
                <Gift className="w-3.5 h-3.5" />
                <span>TOAD&apos;S CARNIVAL PAVILION · SPINS: {r10State.wheelSpinsCount}</span>
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white font-display mt-1.5">
                TOAD&apos;S LUCKY STAR PRIZE WHEEL
              </h2>
              <p className="text-xs sm:text-sm text-purple-200 font-semibold">
                Every spin guarantees a prize: Gold Coin Jackpots, 50/50 Zappers, Hint Scrolls, Arcade 2x Tickets, or Instant 2x Super Star Rush!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Animated Conic Wheel Visual */}
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative w-60 h-60 sm:w-72 sm:h-72 flex items-center justify-center">
                <div className="absolute -top-3 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-300 drop-shadow-[0_3px_0_#000]" />
                <div
                  style={{
                    transform: `rotate(${wheelRotationDeg}deg)`,
                    transition: isSpinningWheel
                      ? 'transform 0.88s cubic-bezier(0.16, 1, 0.3, 1)'
                      : 'none',
                    background:
                      'conic-gradient(#f59e0b 0deg 45deg, #f43f5e 45deg 90deg, #10b981 90deg 135deg, #1e293b 135deg 180deg, #0ea5e9 180deg 225deg, #9333ea 225deg 270deg, #fb923c 270deg 315deg, #fde047 315deg 360deg)',
                  }}
                  className="w-full h-full rounded-full border-8 border-black shadow-[0_6px_0_#000] relative flex items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-950 border-4 border-amber-400 flex items-center justify-center shadow-lg">
                    <MarioStarIcon className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                <button
                  type="button"
                  data-testid="spin-lucky-wheel-standard-btn"
                  onClick={() => handleSpinLuckyWheel(false)}
                  disabled={coins < 25 || isSpinningWheel}
                  className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer tabular-nums"
                >
                  <MarioCoinIcon className="w-4 h-4 shrink-0" />
                  <span>{isSpinningWheel ? 'Spinning...' : 'Standard Spin · 25 Coins'}</span>
                </button>
                <button
                  type="button"
                  data-testid="spin-lucky-wheel-highroller-btn"
                  onClick={() => handleSpinLuckyWheel(true)}
                  disabled={coins < 75 || isSpinningWheel}
                  className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-400 hover:from-rose-400 hover:to-amber-300 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer tabular-nums"
                >
                  <MarioStarIcon className="w-4 h-4 shrink-0" />
                  <span>3x High-Roller Spin · 75 Coins</span>
                </button>
              </div>
            </div>

            {/* 8-Wedge Prize Legend */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-amber-300 font-mario">
                8 GUARANTEED PRIZE WEDGES (TRIPLE PAYOUT ON HIGH-ROLLER!)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TOAD_LUCKY_WHEEL_WEDGES.map((w, i) => (
                  <div
                    key={w.id}
                    className={`rounded-xl px-3.5 py-2.5 border-2 border-black font-black text-xs flex items-center justify-between gap-2 ${w.colorClass}`}
                  >
                    <span>#{i + 1} · {w.label}</span>
                  </div>
                ))}
              </div>
              {wheelWinBanner && (
                <div
                  role="status"
                  data-testid="lucky-wheel-result-banner"
                  className="p-4 rounded-2xl bg-emerald-400 text-slate-950 border-3 border-black font-black text-xs sm:text-sm text-center shadow-[0_3px_0_#000]"
                >
                  {wheelWinBanner}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== NEW CATEGORY 4: CLICK SPARKS & CONFETTI FX ==================== */}
      {activeCategory === 'click_confetti_fx' && (
        <div data-testid="shop-click-fx-panel" className="space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl border-3 border-slate-950 p-5 shadow-[4px_4px_0_#000]">
            <h2 className="text-lg sm:text-2xl font-black text-amber-300 font-display uppercase">
              EQUIPPABLE CLICK SPARKS &amp; VICTORY CONFETTI FX ({CLICK_AND_CONFETTI_FX_ITEMS.length} EFFECTS)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-1">
              Customize your interactive pointer sparks across the entire reviewer and upgrade your celebratory confetti bursts!
            </p>
          </div>
          {renderRound10CatalogGrid(CLICK_AND_CONFETTI_FX_ITEMS)}
        </div>
      )}

      {/* ==================== NEW CATEGORY 5: STATUTORY RELICS & HUD NAMEPLATES ==================== */}
      {activeCategory === 'relics_badges' && (
        <div data-testid="shop-relics-panel" className="space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl border-3 border-slate-950 p-5 shadow-[4px_4px_0_#000]">
            <h2 className="text-lg sm:text-2xl font-black text-amber-300 font-display uppercase">
              6-WORLD STATUTORY MUSEUM RELICS &amp; HUD NAMEPLATES ({RELICS_AND_NAMEPLATES_ITEMS.length} COLLECTIBLES)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-1">
              Collect iconic artifacts from Philippine Labor Law jurisprudence and equip prestigious Counsel Nameplates on your shop &amp; profile banner!
            </p>
          </div>
          {renderRound10CatalogGrid(RELICS_AND_NAMEPLATES_ITEMS)}
        </div>
      )}

      {/* ==================== NEW CATEGORY 6: EXTENDED STUDIO GEAR & COMPANIONS ==================== */}
      {activeCategory === 'extended_gear' && (
        <div data-testid="shop-extended-gear-panel" className="space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl border-3 border-slate-950 p-5 shadow-[4px_4px_0_#000]">
            <h2 className="text-lg sm:text-2xl font-black text-amber-300 font-display uppercase">
              EXTENDED STUDY MASCOTS, CODAL FOLIOS &amp; STUDIO COLLECTIBLES ({EXTENDED_COMPANIONS_AND_FRAMES_ITEMS.length} ITEMS)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-1">
              Expand your study arsenal with rare Mushroom Kingdom paralegal mascots, gilded statutory folios, and collector desk gear!
            </p>
          </div>
          {renderRound10CatalogGrid(EXTENDED_COMPANIONS_AND_FRAMES_ITEMS)}
        </div>
      )}

      {/* Toad's Special Events View */}
      {activeCategory === 'special_events' && (
        <div data-testid="shop-special-events-panel" className="space-y-4">
          <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 text-white p-4 sm:p-5 rounded-2xl border-3 border-black shadow-[3px_3px_0_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
                <Flame className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg uppercase font-display text-amber-300">
                  TOAD&apos;S SPECIAL EVENTS &amp; ROYAL DECREES
                </h2>
                <p className="text-xs font-semibold text-slate-200 mt-0.5">
                  High-impact Bar Review event passes! Spend 100+ Coins to trigger the Golden Coin Rain celebration!
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-black font-mario">
              {effectiveSpecialEvents.bossSkipTokens > 0 && (
                <span className="px-3 py-1.5 rounded-xl bg-rose-500 text-white border-2 border-black">
                  BOSS SKIPS: {effectiveSpecialEvents.bossSkipTokens}
                </span>
              )}
              {effectiveSpecialEvents.doubleXpEndsAt > Date.now() && (
                <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 border-2 border-black">
                  2X EVENT ACTIVE
                </span>
              )}
              {effectiveSpecialEvents.unlockAllModulesEndsAt > Date.now() && (
                <span className="px-3 py-1.5 rounded-xl bg-cyan-300 text-slate-950 border-2 border-black">
                  ALL WORLDS UNLOCKED
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {SPECIAL_EVENT_ITEMS.map((ev) => (
              <div
                key={ev.id}
                data-testid={`shop-item-${ev.id}`}
                className="bg-white rounded-2xl mario-card border-4 border-slate-950 p-5 flex flex-col justify-between h-full"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-lg bg-rose-950 text-amber-300 border border-black font-mario">
                      {ev.badge}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-400">
                      Coin Rain 100c+
                    </span>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 border-3 border-black flex items-center justify-center shrink-0 shadow-[0_3px_0_#000]">
                      {ev.id.includes('unlock') ? (
                        <Unlock className="w-7 h-7 text-cyan-700" />
                      ) : ev.id.includes('skip') ? (
                        <Shield className="w-7 h-7 text-rose-700" />
                      ) : (
                        <MarioStarIcon className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-950 text-base sm:text-lg font-display leading-snug">
                        {ev.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-black text-emerald-900 bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-300">
                    Effect: {ev.effectLabel}
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-slate-200 mt-4 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 font-black text-sm text-slate-950 tabular-nums">
                    <MarioCoinIcon className="w-5 h-5 shrink-0" />
                    <span>{ev.price} Coins</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBuySpecialEvent(ev)}
                    disabled={coins < ev.price}
                    data-testid={`buy-${ev.id}`}
                    className="min-h-[44px] inline-flex items-center justify-center px-4 rounded-xl font-black text-xs bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 cursor-pointer whitespace-nowrap"
                  >
                    Activate Event Pass
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Luxury Goods Boutique View */}
      {activeCategory === 'luxury' && (
        <div data-testid="shop-luxury-goods-panel" className="space-y-4">
          <div className="bg-gradient-to-r from-slate-950 via-amber-950 to-slate-950 text-white p-4 sm:p-5 rounded-2xl border-3 border-amber-400 shadow-[4px_4px_0_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
                <Gem className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg uppercase font-display text-amber-300">
                  MUSHROOM KINGDOM LUXURY BOUTIQUE (150c–500c)
                </h2>
                <p className="text-xs font-semibold text-slate-200 mt-0.5">
                  Collectible 24K Gold-Plated Avatar Frames, Rare Mushroom Auras, and Vintage Game Cartridge Leaderboard Badges!
                </p>
              </div>
            </div>
            {effectiveLuxury.cartridgeBadge !== 'lux_cart_none' && (
              <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 border-2 border-black text-xs font-black font-mario">
                {LUXURY_CARTRIDGE_LABELS[effectiveLuxury.cartridgeBadge]}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {LUXURY_GOODS_ITEMS.map((good) => {
              const isUnlocked = unlockedItemIds.includes(good.id);
              const isEquipped =
                (good.slot === 'frame' && effectiveLuxury.avatarFrame === good.frameId) ||
                (good.slot === 'aura' && effectiveLuxury.mushroomAura === good.auraId) ||
                (good.slot === 'cartridge' && effectiveLuxury.cartridgeBadge === good.cartridgeId);

              return (
                <div
                  key={good.id}
                  data-testid={`shop-luxury-${good.id}`}
                  className={`bg-white rounded-2xl mario-card border-4 border-slate-950 p-5 flex flex-col justify-between h-full ${
                    isEquipped ? 'ring-4 ring-amber-400 bg-amber-50/50' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-slate-950 text-amber-300 border border-amber-400/60 font-mario">
                        {good.badge}
                      </span>
                      {isEquipped && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-950 border border-emerald-600">
                          Equipped
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-slate-950 text-base font-display leading-snug">
                      {good.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                      {good.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t-2 border-slate-200 mt-4 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 font-black text-sm text-slate-950 tabular-nums">
                      <MarioCoinIcon className="w-5 h-5 shrink-0" />
                      <span>{good.price} Coins</span>
                    </div>

                    {isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleEquipLuxuryGood(good)}
                        data-testid={`equip-${good.id}`}
                        className={`min-h-[44px] px-4 rounded-xl font-black text-xs border-2 border-black cursor-pointer whitespace-nowrap ${
                          isEquipped
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                            : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_2px_0_#000]'
                        }`}
                      >
                        {isEquipped ? 'Equipped (Unequip)' : 'Equip Luxury'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBuyLuxuryGood(good)}
                        disabled={coins < good.price}
                        data-testid={`buy-${good.id}`}
                        className="min-h-[44px] px-4 rounded-xl font-black text-xs bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-105 disabled:opacity-40 text-slate-950 border-2 border-black shadow-[0_2px_0_#000] cursor-pointer whitespace-nowrap"
                      >
                        Acquire Luxury
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Power-Ups & Shortcut Maps View */}
      {activeCategory === 'powerups' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border-3 border-black shadow-[3px_3px_0_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
                <MarioStarIcon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg uppercase font-display text-amber-300">
                  SUPER STAR POWER-UPS &amp; BAR SHORTCUT MAPS
                </h2>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">
                  Activate timed 2x Coin multipliers, illuminate high-yield Bar Exam topics across Worlds 1–6, or fuel your Fire Flower study streak!
                </p>
              </div>
            </div>
            {effectiveStarStatus.isActive && (
              <div className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 border-2 border-black font-black text-xs font-mario tabular-nums shrink-0">
                SUPER STAR: {effectiveStarStatus.formattedRemaining} LEFT
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {POWERUP_ITEMS.map((item) => {
              const isShortcutCard = item.id === 'map_shortcut_bar';
              const isStarCard = item.id === 'powerup_super_star' || item.id === 'powerup_mega_star_30m';
              return (
                <div
                  key={item.id}
                  data-testid={`shop-item-${item.id}`}
                  className={`bg-white rounded-2xl mario-card border-4 border-slate-950 p-5 flex flex-col justify-between h-full ${
                    (isShortcutCard && effectiveShortcutActive) || (isStarCard && effectiveStarStatus.isActive)
                      ? 'ring-4 ring-amber-400 bg-amber-50/40'
                      : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 border border-black font-mario">
                        {item.badge}
                      </span>
                      {isShortcutCard && isShortcutMapUnlocked && (
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-200 text-emerald-950 border border-emerald-600 font-mario">
                          {effectiveShortcutActive ? 'MAP ACTIVE' : 'OWNED'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-16 h-16 bg-amber-100 rounded-2xl border-3 border-black flex items-center justify-center shrink-0 shadow-[0_3px_0_#000]">
                        {isShortcutCard ? (
                          <MapIcon className="w-8 h-8 text-emerald-700" />
                        ) : item.id === 'powerup_fire_flower_streak' ? (
                          <MarioFireFlowerIcon className="w-9 h-9" />
                        ) : (
                          <MarioStarIcon className="w-9 h-9" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-950 text-base sm:text-lg font-display leading-snug">
                          {item.name}
                        </h3>
                        <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {item.perkEffect && (
                      <div className="text-xs font-black text-emerald-800 bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-300">
                        Effect: {item.perkEffect}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t-2 border-slate-200 mt-4 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 font-black text-sm text-slate-950 tabular-nums">
                      <MarioCoinIcon className="w-5 h-5 shrink-0" />
                      <span>{item.price} Coins</span>
                    </div>

                    {isShortcutCard && isShortcutMapUnlocked ? (
                      <button
                        type="button"
                        onClick={handleToggleShortcutMapState}
                        data-testid="toggle-shortcut-map-btn"
                        className={`min-h-[44px] inline-flex items-center justify-center px-4 rounded-xl font-black text-xs border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
                          effectiveShortcutActive
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_2px_0_#000]'
                            : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_2px_0_#000]'
                        }`}
                      >
                        {effectiveShortcutActive ? 'Highlights ON (Toggle Off)' : 'Enable Shortcut Highlights'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBuyPowerUpOrMap(item)}
                        disabled={coins < item.price}
                        data-testid={`buy-${item.id}`}
                        className="min-h-[44px] inline-flex items-center justify-center px-4 rounded-xl font-black text-xs bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 cursor-pointer whitespace-nowrap"
                      >
                        {item.isConsumable
                          ? isStarCard && effectiveStarStatus.isActive
                            ? `Extend +${item.durationMinutes}m`
                            : 'Activate Power-Up'
                          : 'Unlock Shortcut Map'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Desk Companions & Card Frames View */}
      {activeCategory === 'companions' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white font-display flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                <span>COLLECTIBLE STUDY DESK COMPANIONS</span>
              </h2>
              {activeCompanion !== 'comp_none' && (
                <button
                  type="button"
                  onClick={() => handleEquipCompanionChoice('comp_none')}
                  className="min-h-[44px] px-3.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-xs border border-slate-400 cursor-pointer"
                >
                  Rest Active Companion
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {COMPANION_ITEMS.map((item) => {
                const isUnlocked = unlockedItemIds.includes(item.id);
                const isEquipped = activeCompanion === item.companionId;
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl mario-card border-4 border-slate-950 p-4 flex flex-col justify-between h-full ${
                      isEquipped ? 'ring-4 ring-amber-400 bg-amber-50/50' : ''
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-mario">
                          {item.badge}
                        </span>
                        {isEquipped && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-950 border border-emerald-600 font-mario">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-slate-950 text-base font-display">{item.name}</h3>
                      <p className="text-xs font-semibold text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="pt-3 border-t-2 border-slate-200 mt-4 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 font-black text-xs sm:text-sm text-slate-950 tabular-nums">
                        <MarioCoinIcon className="w-4 h-4 shrink-0" />
                        <span>{item.price} Coins</span>
                      </span>
                      {isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => item.companionId && handleEquipCompanionChoice(item.companionId)}
                          disabled={isEquipped}
                          className={`min-h-[44px] px-4 rounded-xl font-black text-xs border-2 border-black cursor-pointer ${
                            isEquipped
                              ? 'bg-emerald-500 text-slate-950 cursor-default'
                              : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_2px_0_#000]'
                          }`}
                        >
                          {isEquipped ? 'Summoned' : 'Summon Buddy'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBuyItem(item)}
                          disabled={coins < item.price}
                          className="min-h-[44px] px-4 rounded-xl font-black text-xs bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white border-2 border-black shadow-[0_2px_0_#000] cursor-pointer"
                        >
                          Adopt Buddy
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white font-display flex items-center gap-2">
              <Frame className="w-5 h-5 text-amber-500" />
              <span>AESTHETIC MODULE TOPIC CARD FRAMES</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {CARD_FRAME_ITEMS.map((item) => {
                const isUnlocked = unlockedItemIds.includes(item.id) || item.price === 0;
                const isEquipped = activeFrame === item.frameId;
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl mario-card border-4 border-slate-950 p-4 flex flex-col justify-between h-full ${
                      isEquipped ? 'ring-4 ring-amber-400 bg-amber-50/50' : ''
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-950 text-amber-300 font-mario">
                          {item.badge}
                        </span>
                        {isEquipped && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-950 border border-emerald-600 font-mario">
                            EQUIPPED
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-slate-950 text-base font-display">{item.name}</h3>
                      <p className="text-xs font-semibold text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="pt-3 border-t-2 border-slate-200 mt-4 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 font-black text-xs sm:text-sm text-slate-950 tabular-nums">
                        <MarioCoinIcon className="w-4 h-4 shrink-0" />
                        <span>{item.price === 0 ? 'Free' : `${item.price} Coins`}</span>
                      </span>
                      {isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => item.frameId && handleEquipFrameChoice(item.frameId)}
                          disabled={isEquipped}
                          className={`min-h-[44px] px-4 rounded-xl font-black text-xs border-2 border-black cursor-pointer ${
                            isEquipped
                              ? 'bg-emerald-500 text-slate-950 cursor-default'
                              : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_2px_0_#000]'
                          }`}
                        >
                          {isEquipped ? 'Equipped' : 'Equip Frame'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBuyItem(item)}
                          disabled={coins < item.price}
                          className="min-h-[44px] px-4 rounded-xl font-black text-xs bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white border-2 border-black shadow-[0_2px_0_#000] cursor-pointer"
                        >
                          Unlock Frame
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Avatars Roster View */}
      {activeCategory === 'avatars' && (
        <div className="space-y-4">
          {/* Faction Filter Bar */}
          <div className="bg-white rounded-2xl border-3 border-slate-950 p-3 shadow-[4px_4px_0_#000] flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase font-mario text-slate-700 px-2">
              <Users className="w-4 h-4 text-red-600 shrink-0" />
              <span>FACTION:</span>
            </span>
            {factions.map((fac) => (
              <button
                key={fac}
                onClick={() => {
                  setSelectedFaction(fac);
                  marioAudio.playTabSwitch();
                }}
                className={`min-h-[44px] inline-flex items-center justify-center px-3.5 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
                  selectedFaction === fac
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {fac}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            {displayedAvatars.map((item) => {
              const heroMeta = HERO_ROSTER.find((h) => h.id === item.avatarId);
              const isUnlocked = unlockedItemIds.includes(item.id) || item.price === 0;
              const isEquipped = equippedAvatar === item.avatarId;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl mario-card border-4 border-slate-950 p-4 flex flex-col justify-between h-full transition-all ${
                    isEquipped ? 'ring-4 ring-amber-400 bg-amber-50/50' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 border border-black truncate">
                        {heroMeta?.title || item.faction}
                      </span>
                      {isEquipped && (
                        <span className="text-[9px] font-black uppercase text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded-md border border-emerald-600 font-mario shrink-0">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="w-16 h-16 bg-amber-100 rounded-2xl border-3 border-black mx-auto flex items-center justify-center shadow-[0_3px_0_#000]">
                      {item.avatarId && (
                        <MarioCharacterAvatar character={item.avatarId} className="w-11 h-11" />
                      )}
                    </div>

                    <div className="text-center">
                      <h3 className="font-black text-slate-950 text-base sm:text-lg font-display leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t-2 border-slate-200 mt-4 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 font-black text-xs sm:text-sm text-slate-950 whitespace-nowrap">
                      <MarioCoinIcon className="w-4 h-4 shrink-0" />
                      <span>{item.price === 0 ? 'Free' : `${item.price}c`}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isUnlocked && coins >= item.price && (
                        <button
                          onClick={() => handleBuyItem(item)}
                          className="min-h-[44px] inline-flex items-center justify-center px-3 rounded-xl font-black text-xs bg-red-600 hover:bg-red-500 text-white border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 cursor-pointer whitespace-nowrap"
                        >
                          Unlock
                        </button>
                      )}
                      <button
                        onClick={() => item.avatarId && handleEquipAvatar(item.avatarId)}
                        disabled={isEquipped}
                        className={`min-h-[44px] inline-flex items-center justify-center px-3.5 rounded-xl font-black text-xs border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
                          isEquipped
                            ? 'bg-emerald-500 text-slate-950 cursor-default'
                            : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_2px_0_#000] active:translate-y-0.5'
                        }`}
                      >
                        {isEquipped ? 'Equipped' : 'Select Hero'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Themes & Fonts Grid (Includes 21 App Skins + 8 Free App Study Fonts) */}
      {activeCategory === 'themes' && (
        <div className="space-y-4">
          {/* App-Wide Study Font Picker (8 Free Typography Families) */}
          <div
            data-testid="shop-app-font-studio"
            className="bg-white rounded-2xl border-4 border-slate-950 p-4 sm:p-5 shadow-[4px_4px_0_#000] space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-700 font-mario block">
                  APP-WIDE TYPOGRAPHY STUDIO · 8 READING FONTS (FREE)
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950 font-display">
                  Choose Your Study &amp; Module Reading Font
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-600">
                Active:{' '}
                <strong className="text-slate-950">
                  {APP_STUDY_FONTS.find((f) => f.id === appStudyFont)?.label || 'Jakarta Clean'}
                </strong>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {APP_STUDY_FONTS.map((fontOpt) => {
                const isSelected = appStudyFont === fontOpt.id;
                return (
                  <button
                    key={fontOpt.id}
                    type="button"
                    data-testid={`shop-app-font-${fontOpt.id}`}
                    onClick={() => {
                      marioAudio.playClick();
                      onSelectAppStudyFont?.(fontOpt.id as AppStudyFontId);
                    }}
                    className={`min-h-[54px] p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${fontOpt.cssClass} ${
                      isSelected
                        ? 'bg-amber-300 border-slate-950 text-slate-950 shadow-[0_2px_0_#000]'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full">
                      <span className="text-xs font-black truncate">{fontOpt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />}
                    </div>
                    <span className="text-[11px] font-medium opacity-80 truncate block">
                      Aa Bb · Art. 87 OT (+25%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pro Study Theme Pack Banner & Filter */}
          <div
            data-testid="pro-study-theme-banner"
            className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border-3 border-black shadow-[3px_3px_0_#000] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-black uppercase text-amber-300 font-mario">
                    21 APP SKINS &amp; PRO STUDY PACK
                  </span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span className="text-emerald-300 font-bold">
                    5 Free Skins Ready Immediately + Minimalist Eye-Care Reading Surfaces
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-300 leading-relaxed max-w-2xl">
                  Switch effortlessly between vibrant Mushroom Kingdom worlds and minimalist anti-glare study skins with relaxed 1.74x editorial line spacing.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-700 max-w-full w-full sm:w-auto shrink-0">
              {[
                { id: 'all' as const, label: `All Skins (${THEME_ITEMS.length})` },
                {
                  id: 'pro_study' as const,
                  label: `Pro Study (${
                    THEME_ITEMS.filter((i) =>
                      ['pro_study_paper', 'pro_study_slate', 'pro_study_sage', 'royal_parchment', 'sakura_garden', 'espresso_tribunal'].includes(
                        i.themeId || ''
                      )
                    ).length
                  })`,
                },
                {
                  id: 'arcade' as const,
                  label: `Mario Worlds (${
                    THEME_ITEMS.filter(
                      (i) =>
                        !['pro_study_paper', 'pro_study_slate', 'pro_study_sage', 'royal_parchment', 'sakura_garden', 'espresso_tribunal'].includes(
                          i.themeId || ''
                        )
                    ).length
                  })`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    marioAudio.playClick();
                    setThemePackFilter(tab.id);
                  }}
                  className={`min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex-1 sm:flex-initial text-center ${
                    themePackFilter === tab.id
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {THEME_ITEMS.filter((item) => {
              const isProStudy = [
                'pro_study_paper',
                'pro_study_slate',
                'pro_study_sage',
                'royal_parchment',
                'sakura_garden',
                'espresso_tribunal',
              ].includes(item.themeId || '');
              if (themePackFilter === 'pro_study') return isProStudy;
              if (themePackFilter === 'arcade') return !isProStudy;
              return true;
            }).map((item) => {
              const isUnlocked = unlockedItemIds.includes(item.id) || item.price === 0;
              const isEquipped = activeTheme === item.themeId;
              const isProStudy = [
                'pro_study_paper',
                'pro_study_slate',
                'pro_study_sage',
                'royal_parchment',
                'sakura_garden',
                'espresso_tribunal',
              ].includes(item.themeId || '');
              const isLightPreview = [
                'pro_study_paper',
                'pro_study_sage',
                'peach_castle',
                'yoshi_island',
                'royal_parchment',
                'sakura_garden',
                'arctic_ice_world',
              ].includes(item.themeId || '');

              return (
                <div
                  key={item.id}
                  data-testid={`shop-theme-${item.themeId}`}
                  className={`bg-white rounded-2xl mario-card border-4 border-slate-950 p-4 sm:p-5 flex flex-col justify-between h-full transition-all ${
                    isEquipped ? 'ring-4 ring-amber-400 bg-amber-50/40' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div
                      className="w-full h-24 rounded-xl border-2 border-slate-900 flex flex-col items-center justify-center relative overflow-hidden px-3 text-center"
                      style={{ backgroundColor: item.previewColor }}
                    >
                      <div
                        className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-black max-w-[95%] truncate ${
                          isLightPreview
                            ? 'bg-white/95 border-slate-300 text-slate-900 shadow-2xs'
                            : 'bg-black/75 border-white/25 text-white'
                        } ${isProStudy ? 'font-sans tracking-tight' : 'font-mario text-[9px] sm:text-[10px]'}`}
                      >
                        {isProStudy ? (
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Palette className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className="truncate">{item.name}</span>
                      </div>
                      {isProStudy && (
                        <span
                          className={`mt-1.5 text-[11px] font-medium ${
                            isLightPreview ? 'text-slate-700' : 'text-slate-300'
                          }`}
                        >
                          Aa Bb · Art. 95 Labor Code · Eye-Care Contrast
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          {isProStudy && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                              Pro Study · Zero Eye Strain
                            </span>
                          )}
                          <h3 className="font-black text-slate-950 text-base sm:text-lg font-display truncate">
                            {item.name}
                          </h3>
                        </div>
                        {isEquipped && (
                          <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-400 font-mario shrink-0">
                            EQUIPPED
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-slate-200 mt-4 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 font-black text-sm text-slate-950 tabular-nums">
                      <MarioCoinIcon className="w-4 h-4 shrink-0" />
                      <span>{item.price === 0 ? 'Free' : `${item.price} Coins`}</span>
                    </div>

                    {isUnlocked ? (
                      <button
                        type="button"
                        data-testid={`equip-theme-${item.themeId}`}
                        onClick={() => item.themeId && handleEquipTheme(item.themeId)}
                        disabled={isEquipped}
                        className={`min-h-[44px] inline-flex items-center justify-center px-4 rounded-xl font-black text-xs border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
                          isEquipped
                            ? 'bg-emerald-500 text-slate-950 opacity-90 cursor-default'
                            : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_2px_0_#000] active:translate-y-0.5'
                        }`}
                      >
                        {isEquipped ? 'Active Skin' : 'Equip Skin'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        data-testid={`buy-theme-${item.themeId}`}
                        onClick={() => handleBuyItem(item)}
                        disabled={coins < item.price}
                        className="min-h-[44px] inline-flex items-center justify-center px-4 rounded-xl font-black text-xs bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 cursor-pointer whitespace-nowrap"
                      >
                        Unlock Skin
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Perks / Boosters Grid */}
      {activeCategory === 'perks' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {PERK_ITEMS.map((item) => {
            const isUnlocked = unlockedItemIds.includes(item.id);

            const renderPerkIcon = (id: string) => {
              switch (id) {
                case 'perk_life':
                  return <Mario1UpIcon className="w-9 h-9" />;
                case 'perk_star':
                  return <MarioStarIcon className="w-9 h-9" />;
                case 'perk_double':
                  return <MarioMushroomIcon className="w-9 h-9" />;
                case 'perk_lakitu_glasses':
                  return <MarioLakituCloudIcon className="w-9 h-9" />;
                case 'perk_streak_freeze':
                  return <MarioIceFlowerIcon className="w-9 h-9" />;
                case 'perk_golden_fireball':
                  return <MarioFireFlowerIcon className="w-9 h-9" />;
                case 'perk_chrono_watch':
                  return <MarioPeachCrownIcon className="w-9 h-9" />;
                case 'perk_espresso_mushroom':
                default:
                  return <MarioMushroomIcon className="w-9 h-9" />;
              }
            };

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl mario-card border-4 border-slate-950 p-4 sm:p-5 flex flex-col justify-between h-full"
              >
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl border-3 border-black mx-auto flex items-center justify-center shadow-[0_3px_0_#000]">
                    {renderPerkIcon(item.id)}
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 inline-block mb-1">
                      {item.badge}
                    </span>
                    <h3 className="font-black text-slate-950 text-base font-display">
                      {item.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                    {item.perkEffect && (
                      <div className="mt-2 text-[11px] font-black text-emerald-700 bg-emerald-50 rounded-lg p-1 border border-emerald-200">
                        {item.perkEffect}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-slate-200 mt-4 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 font-black text-sm text-slate-950">
                    <MarioCoinIcon className="w-4 h-4 shrink-0" />
                    <span>{item.price} Coins</span>
                  </div>

                  {isUnlocked ? (
                    <span className="min-h-[44px] inline-flex items-center justify-center px-3 rounded-xl font-black text-xs bg-emerald-100 text-emerald-950 border-2 border-emerald-500">
                      Active Perk
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuyItem(item)}
                      disabled={coins < item.price}
                      className="min-h-[44px] inline-flex items-center justify-center px-4 rounded-xl font-black text-xs bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 cursor-pointer"
                    >
                      Acquire Perk
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Prestige Titles Grid */}
      {activeCategory === 'prestige' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 p-4 rounded-2xl border-3 border-black shadow-[3px_3px_0_#000] flex items-center gap-3">
            <Crown className="w-8 h-8 text-slate-950 shrink-0" />
            <div>
              <h3 className="font-black text-base uppercase font-display">
                PRESTIGE TITLES &amp; LEGAL HONORS
              </h3>
              <p className="text-xs font-bold text-slate-900">
                Unlock and equip honorary titles certifying your expertise in Philippine Labor Jurisprudence. These badges are featured in your User Profile and Export Score Card!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {PRESTIGE_ITEMS.map((item) => {
              const isUnlocked = unlockedItemIds.includes(item.id);
              const isEquipped = equippedTitle === item.name;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl mario-card border-4 border-slate-950 p-4 sm:p-5 flex flex-col justify-between h-full transition-all ${
                    isEquipped ? 'ring-4 ring-amber-400 bg-amber-50/50' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 border border-black">
                        {item.badge}
                      </span>
                      {isEquipped && (
                        <span className="text-[9px] font-black uppercase text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded-md border border-emerald-600 font-mario shrink-0">
                          EQUIPPED
                        </span>
                      )}
                    </div>

                    <div className="w-14 h-14 bg-amber-100 rounded-2xl border-3 border-black mx-auto flex items-center justify-center shadow-[0_3px_0_#000]">
                      <Crown className="w-8 h-8 text-amber-700" />
                    </div>

                    <div className="text-center">
                      <h3 className="font-black text-slate-950 text-base font-display">
                        {item.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-slate-200 mt-4 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 font-black text-sm text-slate-950">
                      <MarioCoinIcon className="w-4 h-4 shrink-0" />
                      <span>{item.price} Coins</span>
                    </div>

                    {isUnlocked ? (
                      <button
                        onClick={() => handleEquipTitle(item.name)}
                        disabled={isEquipped}
                        className={`min-h-[44px] inline-flex items-center justify-center px-4 rounded-xl font-black text-xs border-2 border-black transition-all cursor-pointer ${
                          isEquipped
                            ? 'bg-emerald-500 text-slate-950 cursor-default'
                            : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_2px_0_#000] active:translate-y-0.5'
                        }`}
                      >
                        {isEquipped ? 'Active' : 'Equip Title'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyItem(item)}
                        disabled={coins < item.price}
                        className="min-h-[44px] inline-flex items-center justify-center px-4 rounded-xl font-black text-xs bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 cursor-pointer"
                      >
                        Claim Title
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sound Packs (Full Continuous BGM + App-Wide SFX Synthesis) */}
      {activeCategory === 'soundpacks' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border-3 border-black shadow-[3px_3px_0_#000] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
                <Volume2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-base uppercase font-display text-amber-300">
                    FULL CONTINUOUS BGM &amp; SFX AUDIO PACKS
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-mario">
                    {isBgmPlaying ? 'BGM STREAMING LIVE' : 'FULL TRACK SYNTH'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-300 mt-0.5 leading-relaxed max-w-2xl">
                  Equipping or pressing Play Full BGM activates continuous multi-voice background music loops across Worlds 1–6 AND reshapes every coin, jump, warp pipe, and power-up sound effect across the app!
                </p>
              </div>
            </div>

            {/* Right actions: Play/Pause Active Pack + Restore button */}
            <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-between lg:justify-end shrink-0">
              <button
                type="button"
                data-testid="toggle-active-bgm-btn"
                onClick={() => {
                  const playing = marioAudio.toggleSoundPackFullTrack(equippedSoundPack);
                  setIsBgmPlaying(playing);
                }}
                className={`min-h-[44px] px-3.5 rounded-xl font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 whitespace-nowrap ${
                  isBgmPlaying
                    ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                    : 'bg-sky-400 hover:bg-sky-300 text-slate-950'
                }`}
              >
                {isBgmPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current shrink-0" />
                    <span>Pause Live BGM</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current shrink-0" />
                    <span>Play Active BGM</span>
                  </>
                )}
              </button>

              <button
                type="button"
                data-testid="restore-audio-pack-btn"
                onClick={handleRestorePurchases}
                className="min-h-[44px] px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 whitespace-nowrap"
                title="Restore missing or previously purchased audio content and verify Modules 1-6 audio"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Restore Audio Pack</span>
              </button>

              <div className="min-h-[44px] bg-slate-950 px-3 py-1.5 rounded-xl border-2 border-amber-400 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-amber-400 font-mario">
                  ACTIVE:
                </span>
                <span className="text-xs font-black text-white whitespace-nowrap">
                  {SOUNDPACK_ITEMS.find((s) => s.soundPackId === equippedSoundPack)?.name || 'Classic 8-Bit'}
                </span>
              </div>
            </div>
          </div>

          {restoreMessage && (
            <div className="bg-emerald-500 text-slate-950 p-3.5 rounded-xl border-2 border-black font-black text-xs flex items-center justify-between shadow-[0_3px_0_#000]">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3] shrink-0" />
                <span>{restoreMessage}</span>
              </span>
              <button
                type="button"
                aria-label="Dismiss restore message"
                onClick={() => setRestoreMessage(null)}
                className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {SOUNDPACK_ITEMS.map((item) => {
              const isUnlocked = unlockedItemIds.includes(item.id) || item.price === 0;
              const isEquipped = equippedSoundPack === item.soundPackId;
              const isThisPackStreaming = isEquipped && isBgmPlaying;

              return (
                <div
                  key={item.id}
                  data-testid={`shop-soundpack-${item.soundPackId}`}
                  className={`bg-white rounded-2xl mario-card border-4 border-slate-950 p-4 sm:p-5 flex flex-col justify-between h-full transition-all ${
                    isEquipped ? 'ring-4 ring-amber-400 bg-amber-50/50' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-indigo-900 text-amber-300 border border-black font-mario">
                        {item.badge}
                      </span>
                      {isEquipped && (
                        <span className="text-[9px] font-black uppercase text-emerald-950 bg-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-600 font-mario flex items-center gap-1 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                          {isThisPackStreaming ? 'BGM LIVE' : 'EQUIPPED'}
                        </span>
                      )}
                    </div>

                    <div className="w-16 h-16 bg-indigo-100/70 rounded-2xl border-3 border-black mx-auto flex items-center justify-center shadow-[0_3px_0_#000]">
                      <Volume2 className="w-9 h-9 text-indigo-700" />
                    </div>

                    <div className="text-center space-y-1">
                      <h3 className="font-black text-slate-950 text-base sm:text-lg font-display">
                        {item.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                      <p className="text-[11px] font-bold text-indigo-700 pt-0.5">
                        Includes: Full Continuous BGM Loop + Custom App SFX
                      </p>
                    </div>

                    {/* Persistent Full BGM Loop + Sample SFX Controls */}
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {item.soundPackId && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!item.soundPackId) return;
                            if (isUnlocked) {
                              setEquippedSoundPack(item.soundPackId);
                            }
                            const nowPlaying = marioAudio.toggleSoundPackFullTrack(item.soundPackId);
                            setIsBgmPlaying(nowPlaying);
                          }}
                          data-testid={`play-bgm-soundpack-${item.soundPackId}`}
                          className={`w-full min-h-[44px] py-2 px-3 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-all whitespace-nowrap ${
                            isThisPackStreaming ||
                            (marioAudio.settings.soundPack === item.soundPackId && isBgmPlaying)
                              ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-[0_2px_0_#000]'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_2px_0_#000]'
                          }`}
                        >
                          {isThisPackStreaming ||
                          (marioAudio.settings.soundPack === item.soundPackId && isBgmPlaying) ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current shrink-0" />
                              <span>Pause Persistent BGM Loop</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                              <span>
                                {isUnlocked ? 'Play Full Persistent BGM Loop' : 'Play Full BGM Track'}
                              </span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => item.soundPackId && marioAudio.previewSoundPack(item.soundPackId)}
                        aria-label={`Test interactive SFX chime for ${item.name}`}
                        data-testid={`preview-soundpack-${item.soundPackId}`}
                        className="w-full min-h-[40px] py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-400 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-all whitespace-nowrap"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                        <span>Test Interactive SFX</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-slate-200 mt-4 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 font-black text-sm text-slate-950 tabular-nums">
                      <MarioCoinIcon className="w-4 h-4 shrink-0" />
                      <span>{item.price === 0 ? 'Free' : `${item.price} Coins`}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!item.soundPackId) return;
                            handleEquipSoundPack(item.soundPackId);
                            setIsBgmPlaying(marioAudio.isMusicPlaying());
                          }}
                          disabled={isEquipped && isThisPackStreaming}
                          data-testid={`equip-soundpack-${item.soundPackId}`}
                          className={`min-h-[44px] inline-flex items-center justify-center px-4 rounded-xl font-black text-xs border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
                            isEquipped && isThisPackStreaming
                              ? 'bg-emerald-500 text-slate-950 cursor-default'
                              : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_2px_0_#000] active:translate-y-0.5'
                          }`}
                        >
                          {isEquipped && isThisPackStreaming ? 'Streaming' : isEquipped ? 'Start Pack BGM' : 'Equip & Play Pack'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBuyItem(item)}
                          disabled={coins < item.price}
                          data-testid={`buy-soundpack-${item.soundPackId}`}
                          className="min-h-[44px] inline-flex items-center justify-center px-4 rounded-xl font-black text-xs bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 cursor-pointer whitespace-nowrap"
                        >
                          Unlock Full Pack
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3-Tier Mystery Chests & Question Blocks */}
      {activeCategory === 'mystery' && (
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-7 border-4 border-slate-950 shadow-[6px_6px_0_#000] space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[10px] font-black uppercase px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-mario inline-block">
              TOAD&apos;S TREASURY CHESTS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
              3-TIER MYSTERY BLOCK VAULT
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold">
              Spend your earned Bar Review coins on Classic, Golden, or Royal Bowser Treasury Chests for massive coin jackpots and bonus Super Star 2x Coin Rush bursts!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {[
              {
                tier: 'classic' as const,
                title: 'Classic ? Block',
                cost: 15,
                maxWin: '50 Coins',
                desc: 'Classic Mushroom Kingdom lucky block. Win up to 50 Gold Coins!',
                accent: 'bg-amber-400 text-slate-950',
              },
              {
                tier: 'golden' as const,
                title: 'Golden Super Block',
                cost: 60,
                maxWin: '175 Coins + 2x Buff',
                desc: 'High-yield Golden Block! Up to 175 Gold Coins or a 2-Minute Super Star 2x Rush.',
                accent: 'bg-gradient-to-br from-yellow-200 via-amber-300 to-amber-500 text-slate-950',
              },
              {
                tier: 'royal' as const,
                title: 'Royal Treasury Chest',
                cost: 150,
                maxWin: '420 Coin Jackpot!',
                desc: 'Supreme high-roller chest! Up to 420 Gold Coins or a 3-Minute Super Star Overdrive.',
                accent: 'bg-gradient-to-br from-rose-500 via-red-600 to-amber-400 text-slate-950',
              },
            ].map((chest) => (
              <div
                key={chest.tier}
                data-testid={`mystery-chest-${chest.tier}`}
                className="bg-slate-950/90 border-3 border-slate-700 rounded-2xl p-5 flex flex-col justify-between text-center space-y-4"
              >
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
                    MAX WIN: {chest.maxWin}
                  </span>
                  <button
                    type="button"
                    aria-label={`Open ${chest.title} for ${chest.cost} Coins`}
                    onClick={() => handleRollMysteryBox(chest.tier)}
                    disabled={coins < chest.cost || isRollingMystery}
                    className={`w-24 h-24 mx-auto rounded-3xl ${chest.accent} border-4 border-black flex items-center justify-center shadow-[0_6px_0_#000] active:translate-y-1 disabled:opacity-40 cursor-pointer transition-transform ${
                      isRollingMystery ? 'animate-bounce' : 'hover:scale-105'
                    }`}
                  >
                    {chest.tier === 'classic' && (
                      <svg
                        viewBox="0 0 64 64"
                        aria-hidden="true"
                        data-testid="chest-icon-classic"
                        className="w-14 h-14"
                      >
                        <rect x="6" y="6" width="52" height="52" rx="10" fill="#f59e0b" stroke="#0f172a" strokeWidth="4" />
                        <circle cx="14" cy="14" r="3" fill="#78350f" />
                        <circle cx="50" cy="14" r="3" fill="#78350f" />
                        <circle cx="14" cy="50" r="3" fill="#78350f" />
                        <circle cx="50" cy="50" r="3" fill="#78350f" />
                        <path
                          d="M24 23c0-5 4-8 9-8s9 3 9 8c0 4-3 6-6 8-2 1-3 2-3 5h-5c0-5 2-7 5-9 2-1 3-2 3-4 0-2-1.5-3.5-3.5-3.5S29 21 29 23h-5zm5.5 19h5v6h-5v-6z"
                          fill="#fffbeb"
                          stroke="#0f172a"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                    {chest.tier === 'golden' && (
                      <svg
                        viewBox="0 0 64 64"
                        aria-hidden="true"
                        data-testid="chest-icon-golden"
                        className="w-14 h-14"
                      >
                        <rect x="6" y="6" width="52" height="52" rx="10" fill="#fde047" stroke="#0f172a" strokeWidth="4" />
                        <rect x="12" y="12" width="40" height="40" rx="6" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
                        <polygon
                          points="32,14 37,25 49,26 40,34 43,46 32,40 21,46 24,34 15,26 27,25"
                          fill="#fffbeb"
                          stroke="#0f172a"
                          strokeWidth="3"
                          strokeLinejoin="round"
                        />
                        <circle cx="29" cy="30" r="2" fill="#0f172a" />
                        <circle cx="35" cy="30" r="2" fill="#0f172a" />
                      </svg>
                    )}
                    {chest.tier === 'royal' && (
                      <svg
                        viewBox="0 0 64 64"
                        aria-hidden="true"
                        data-testid="chest-icon-royal"
                        className="w-14 h-14"
                      >
                        <path
                          d="M10 26h44v26a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V26z"
                          fill="#991b1b"
                          stroke="#0f172a"
                          strokeWidth="4"
                        />
                        <path
                          d="M8 26c0-9 9-14 24-14s24 5 24 14H8z"
                          fill="#dc2626"
                          stroke="#0f172a"
                          strokeWidth="4"
                        />
                        <rect x="27" y="21" width="10" height="14" rx="3" fill="#fbbf24" stroke="#0f172a" strokeWidth="3" />
                        <circle cx="32" cy="28" r="2" fill="#0f172a" />
                        <path
                          d="M20 14l4-6 8 5 8-5 4 6"
                          fill="none"
                          stroke="#fde047"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  <h3 className="text-lg font-black text-white font-display">{chest.title}</h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">{chest.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRollMysteryBox(chest.tier)}
                  disabled={coins < chest.cost || isRollingMystery}
                  className="min-h-[44px] w-full rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-black text-xs border-2 border-black shadow-[0_3px_0_#000] inline-flex items-center justify-center gap-1.5 cursor-pointer tabular-nums"
                >
                  <MarioCoinIcon className="w-4 h-4 shrink-0" />
                  <span>Open for {chest.cost} Coins</span>
                </button>
              </div>
            ))}
          </div>

          {mysteryResult && (
            <div className="p-4 bg-amber-400/20 border-2 border-amber-400 rounded-2xl text-amber-200 text-sm font-black text-center">
              {mysteryResult}
            </div>
          )}
        </div>
      )}

      {/* Official Royal Grand Master Juris Diploma (Distinct from Print Studio Executive Certificate) */}
      {activeCategory === 'certificate' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border-4 border-slate-950 p-4 sm:p-6 shadow-[6px_6px_0_#000] text-slate-950 space-y-5 print:border-0 print:shadow-none print:p-0">
            <div className="print:hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b-2 border-slate-200 pb-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-800 border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000] shrink-0">
                  <Crown className="w-7 h-7 text-amber-300" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-300 text-[10px] font-black uppercase font-mario">
                    ROYAL ACADEMIC SENATE CHARTER · DISTINCT FROM PRINT STUDIO CERTIFICATE
                  </span>
                  <h2 className="text-xl font-black font-display mt-0.5">
                    ROYAL GRAND MASTER JURIS DIPLOMA &amp; 6-WORLD TRANSCRIPT
                  </h2>
                  <p className="text-xs font-bold text-slate-600">
                    Ornate Crimson-Gold Senate Charter featuring High Academy Coat of Arms, 6-World Statutory Transcript Matrix &amp; Hanging Gold Rosette Seal
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Landscape OR Portrait Orientation Switcher */}
                <div
                  role="group"
                  aria-label="Master Diploma Orientation"
                  data-testid="diploma-orientation-toggle"
                  className="inline-flex items-center rounded-xl bg-slate-100 p-1 border-2 border-black"
                >
                  {(['landscape', 'portrait'] as const).map((orient) => (
                    <button
                      key={orient}
                      type="button"
                      data-testid={`diploma-orient-${orient}`}
                      onClick={() => {
                        setDiplomaOrientation(orient);
                        marioAudio.playClick();
                      }}
                      className={`min-h-[36px] px-3 rounded-lg text-xs font-black capitalize transition-all cursor-pointer ${
                        diplomaOrientation === orient
                          ? 'bg-red-800 text-amber-200 shadow-xs'
                          : 'text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      {orient}
                    </button>
                  ))}
                </div>

                {!isCertUnlocked ? (
                  <>
                    {onOpenCertificatePreview && (
                      <button
                        type="button"
                        data-testid="shop-preview-certificate-studio-btn"
                        onClick={() => {
                          marioAudio.playClick();
                          onOpenCertificatePreview();
                        }}
                        className="min-h-[44px] px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Sparkles className="w-4 h-4 shrink-0" />
                        <span>Executive Certificate (Print Studio)</span>
                      </button>
                    )}
                    <button
                      type="button"
                      data-testid="unlock-master-diploma-btn"
                      onClick={() => handleBuyItem(CERTIFICATE_ITEM)}
                      disabled={coins < CERTIFICATE_ITEM.price}
                      className="min-h-[44px] px-5 rounded-xl bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <MarioCoinIcon className="w-4 h-4 shrink-0" />
                      <span>Unlock Diploma · 50 Coins</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-950 border border-emerald-400 font-black text-xs rounded-xl">
                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>Charter Unlocked</span>
                    </span>
                    {onOpenCertificatePreview && (
                      <button
                        type="button"
                        data-testid="shop-preview-certificate-studio-btn"
                        onClick={() => {
                          marioAudio.playClick();
                          onOpenCertificatePreview();
                        }}
                        className="min-h-[44px] px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Sparkles className="w-4 h-4 shrink-0" />
                        <span>Compare Executive Certificate</span>
                      </button>
                    )}
                    <button
                      type="button"
                      data-testid="print-certificate-btn"
                      onClick={() => {
                        marioAudio.playQuizComplete();
                        downloadMasterDiplomaPdf({
                          recipientName: certRecipientName.trim() || 'Mario Bar Candidate',
                          honors: 'Grand Master of Philippine Labor Standards · Summa Cum Codal',
                          completedCount: ALL_LAW_TOPICS.length,
                          totalCount: ALL_LAW_TOPICS.length,
                          orientation: diplomaOrientation,
                        });
                        setCertPdfDownloaded(true);
                        window.setTimeout(() => setCertPdfDownloaded(false), 2600);
                      }}
                      className="min-h-[44px] px-4 rounded-xl bg-emerald-700 text-white hover:bg-emerald-600 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <FileDown className="w-4 h-4 shrink-0" />
                      <span>
                        {certPdfDownloaded
                          ? 'Master Diploma PDF Saved!'
                          : `Download ${diplomaOrientation === 'portrait' ? 'Portrait' : 'Landscape'} Diploma PDF`}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Recipient Customization */}
            <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-amber-50/70 p-3 rounded-2xl border-2 border-amber-300">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
                <label htmlFor="cert-name" className="text-xs font-black uppercase text-red-950">
                  Conferral Scholar Name:
                </label>
                <input
                  id="cert-name"
                  type="text"
                  value={certRecipientName}
                  onChange={(e) => setCertRecipientName(e.target.value)}
                  maxLength={40}
                  className="min-h-[44px] px-3 py-2 bg-white border-2 border-black rounded-xl font-bold text-sm text-slate-900 flex-1 min-w-[200px]"
                  placeholder="e.g., Atty. Juan Dela Cruz"
                />
              </div>
              <span className="text-[11px] font-black text-amber-900 uppercase font-mario">
                Active Sheet: A4 {diplomaOrientation.toUpperCase()} ({diplomaOrientation === 'portrait' ? '210 × 297 mm' : '297 × 210 mm'})
              </span>
            </div>

            {/* Distinct Royal Grand Master Juris Diploma & 6-World Transcript Charter */}
            <div
              id="official-labor-certificate"
              data-testid="toadshop-labor-certificate"
              data-orientation={diplomaOrientation}
              className={`mx-auto w-full bg-[#fefaf0] border-[10px] border-double border-red-900 ring-4 ring-amber-500 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-between transition-all ${
                diplomaOrientation === 'portrait'
                  ? 'max-w-[760px] p-5 sm:p-8 gap-5 lg:min-h-[1020px]'
                  : 'max-w-5xl p-5 sm:p-8 lg:px-10 lg:py-7 gap-4'
              }`}
            >
              {/* Filigree Corner Medallions */}
              <div className="absolute top-2.5 left-2.5 w-8 h-8 border-t-4 border-l-4 border-amber-600 pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 w-8 h-8 border-t-4 border-r-4 border-amber-600 pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 w-8 h-8 border-b-4 border-l-4 border-amber-600 pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 w-8 h-8 border-b-4 border-r-4 border-amber-600 pointer-events-none" />

              {/* 1. Royal Crimson Academic Senate Header Banner + Coat of Arms */}
              <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-amber-100 rounded-xl p-4 sm:px-6 sm:py-4 border-2 border-amber-400 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3.5">
                  {/* Inline SVG High Academy Coat of Arms Crest */}
                  <svg
                    viewBox="0 0 64 64"
                    className="w-14 h-14 shrink-0 drop-shadow"
                    aria-hidden="true"
                  >
                    <path
                      d="M32 4 L56 14 V32 C56 47 45 56 32 61 C19 56 8 47 8 32 V14 Z"
                      fill="#7f1d1d"
                      stroke="#fbbf24"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M32 11 L49 18 V31 C49 42 41 49 32 53 C23 49 15 42 15 31 V18 Z"
                      fill="#991b1b"
                      stroke="#fde68a"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M22 27 H42 M32 18 V42 M23 27 L19 35 H27 Z M41 27 L37 35 H45 Z"
                      stroke="#fde047"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-amber-300 font-mario block">
                      ROYAL MUSHROOM ACADEMY · SENATE OF SOCIAL LEGISLATION
                    </span>
                    <h1 className="text-xl sm:text-3xl font-black text-white font-serif tracking-tight mt-0.5">
                      GRAND MASTER JURIS DIPLOMA
                    </h1>
                    <p className="text-[11px] sm:text-xs italic text-amber-200 font-serif">
                      &ldquo;Iustitia Laboris · Salus Populi Suprema Lex · Six-World Statutory Charter&rdquo;
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-amber-400/70 text-center shrink-0">
                  <span className="text-[9px] font-black uppercase text-amber-300 font-mario block">
                    CHARTER SEAL
                  </span>
                  <span className="text-xs font-mono font-black text-white">
                    MK-JURIS-{ALL_LAW_TOPICS.length}W
                  </span>
                </div>
              </div>

              {/* 2. Official Charter Registry Strip */}
              <div className="bg-amber-100/90 border-y-2 border-amber-600/70 px-3 py-1.5 rounded-lg flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs font-mono font-black text-amber-950">
                <span>CHARTER REGISTRY: #PD442-ROYAL-SENATE</span>
                <span>TRANSCRIPT STATUS: 6 / 6 WORLDS SEALED</span>
                <span>
                  CONFERRED:{' '}
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* 3. Formal Sovereign Conferral Proclamation */}
              <div className="text-center space-y-1.5 py-1">
                <p className="text-xs sm:text-sm font-serif italic text-slate-700">
                  By Sovereign Authority of the High Academy of Jurisprudence, Be It Known That
                </p>
                <div className="text-2xl sm:text-4xl font-black font-serif text-red-900 border-b-2 border-amber-600 pb-1 max-w-xl mx-auto tracking-tight">
                  {certRecipientName || 'Mario Bar Candidate'}
                </div>
                <p className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-900 pt-0.5">
                  IS HEREBY INVESTED AS GRAND MASTER OF PHILIPPINE LABOR STANDARDS (SUMMA CUM CODAL)
                </p>
              </div>

              {/* 4. 6-World Statutory Transcript Pillar Matrix (Unique to Master Diploma!) */}
              <div
                data-testid="master-diploma-transcript-grid"
                className={`grid gap-2.5 text-left ${
                  diplomaOrientation === 'portrait'
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {MASTER_DIPLOMA_TRANSCRIPT_PILLARS.map((pillar) => (
                  <div
                    key={pillar.worldNum}
                    className="bg-white/95 border-2 border-amber-700/60 rounded-xl p-2.5 shadow-2xs flex flex-col justify-between gap-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-mono font-black uppercase text-red-900">
                        WORLD {pillar.worldNum} · {pillar.code}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-600 text-[8px] font-black text-emerald-900">
                        {pillar.gradeSeal}
                      </span>
                    </div>
                    <div className="text-xs font-black font-serif text-slate-950">
                      {pillar.pillarTitle}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-600 leading-snug">
                      {pillar.statutesCovered}
                    </div>
                  </div>
                ))}
              </div>

              {/* 5. Three-Signatory Academic Senate Footer + Hanging Crimson-Gold Rosette Seal */}
              <div
                className={`pt-3 border-t-2 border-amber-600/60 grid items-end gap-4 text-center ${
                  diplomaOrientation === 'portrait'
                    ? 'grid-cols-1 sm:grid-cols-3'
                    : 'grid-cols-3'
                }`}
              >
                <div className="px-1">
                  <div className="font-serif italic font-bold text-xs sm:text-sm text-slate-900 border-b-2 border-red-950 pb-0.5 mb-1">
                    Matthew Cesar Corpuz
                  </div>
                  <span className="text-[9px] font-black uppercase text-red-900 font-mario block">
                    CHANCELLOR &amp; LEAD CURATOR
                  </span>
                </div>

                {/* Hanging-Ribbon Gold Rosette Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative flex flex-col items-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 border-4 border-red-950 shadow-md flex flex-col items-center justify-center z-10">
                      <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-red-950" />
                      <span className="text-[7px] sm:text-[8px] font-black uppercase text-red-950 font-mario leading-none mt-0.5">
                        SENATE SEAL
                      </span>
                    </div>
                    <div className="flex items-center gap-2 -mt-2 z-0">
                      <div className="w-3.5 h-5 bg-red-800 border border-black -rotate-12" />
                      <div className="w-3.5 h-5 bg-red-800 border border-black rotate-12" />
                    </div>
                  </div>
                </div>

                <div className="px-1">
                  <div className="font-serif italic font-bold text-xs sm:text-sm text-slate-900 border-b-2 border-red-950 pb-0.5 mb-1">
                    High Tribunal of Labor Standards
                  </div>
                  <span className="text-[9px] font-black uppercase text-red-900 font-mario block">
                    ACADEMIC SENATE REGISTRAR
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
