import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Sun,
  Moon,
  GraduationCap,
  Feather,
  Map,
  BookOpen,
  Calendar,
  Calculator,
  HelpCircle,
  Trophy,
  Clock,
  Gamepad2,
  Award,
  Volume2,
  Search,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  VolumeX,
  Volume1,
  Printer,
  Sparkles,
  MousePointerClick,
  Sliders,
  Share2,
  ShieldAlert,
  Music,
  MapPin,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  MarioCharacterAvatar,
  MarioCoinIcon,
  MarioMushroomIcon,
  MarioStarIcon,
} from './MarioIcons';
import { MarioAvatar, StudyDifficulty } from '../types/laborLaw';
import { HERO_ROSTER } from '../data/heroesData';
import {
  ColorMode,
  WALKTHROUGH_CHAPTERS,
} from '../utils/profileAchievements';
import { MARIO_SOUNDSCAPES, MAIN_CREATOR_AUTHOR } from '../utils/engagementFeatures';
import { marioAudio } from '../utils/audio';

interface AppWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteWalkthrough: (navigateToTab?: string) => void;
  colorMode: ColorMode;
  onToggleColorMode: (mode: ColorMode) => void;
  studyDifficulty: StudyDifficulty;
  onSelectDifficulty: (diff: StudyDifficulty) => void;
  equippedAvatar: MarioAvatar;
  onSelectAvatar: (avatar: MarioAvatar) => void;
  alreadyGraduated: boolean;
}

interface ButtonDirectoryItem {
  id: string;
  name: string;
  part: string;
  category: string;
  whatItDoes: string;
  howToUse: string;
  proTip: string;
  targetTab?: string;
}

const BUTTON_DIRECTORY: ButtonDirectoryItem[] = [
  // 1. Header & Global Controls
  {
    id: 'btn-mario-logo',
    name: 'App Title & Home Emblem',
    part: 'Top Navigation Bar (Left)',
    category: 'Header & Global Controls',
    whatItDoes: 'Returns you immediately to the Overworld Map dashboard from anywhere in the app.',
    howToUse: 'Click the Super Mario Labor Adventure logo on the top-left at any time.',
    proTip: 'Great one-click home anchor whenever you finish studying a deep module or playing an arcade game.',
    targetTab: 'map',
  },
  {
    id: 'btn-desktop-nav-tabs',
    name: 'Primary Section Tabs (Map, Modules, Holidays, Regions, Cards, Quiz, Arcade, Shop)',
    part: 'Top Navigation Bar (Desktop) & Bottom Dock (Mobile)',
    category: 'Header & Global Controls',
    whatItDoes: 'Switches cleanly between all major study hubs, reference tables, quizzes, games, and Toad’s Shop.',
    howToUse: 'Click any section tab on desktop, or use the 5-button bottom dock + Menu button on mobile.',
    proTip: 'Your progress, active Pomodoro timer, and saved notes stay synced across every single tab.',
    targetTab: 'modules',
  },
  {
    id: 'btn-global-search',
    name: 'Global Search Button ("Search" / Ctrl+K)',
    part: 'Top Navigation Bar & Mobile Utility Row',
    category: 'Header & Global Controls',
    whatItDoes: 'Searches across all 19 modules, Labor Code articles, regional wages, holidays, and glossary definitions.',
    howToUse: 'Click Search (or press Ctrl+K / Cmd+K on keyboard) and type any keyword like "overtime" or "13th month".',
    proTip: 'Clicking any search result jumps straight to that exact module or reference hub.',
    targetTab: 'modules',
  },
  {
    id: 'btn-one-page-pdf',
    name: 'One-Page Summary Button ("1-Pg PDF")',
    part: 'Top Navigation Bar & Mobile Utility Row',
    category: 'Header & Global Controls',
    whatItDoes: 'Opens the Print & PDF Studio directly on the A4 One-Page Formulas & Deadlines Master Sheet.',
    howToUse: 'Click 1-Pg PDF, pick your favorite Color Theme & Font Family, and click Download A4 PDF.',
    proTip: 'Downloads a real .pdf file directly to your phone, tablet, or computer without opening a browser print popup.',
    targetTab: 'map',
  },
  {
    id: 'btn-calculator-shortcut',
    name: 'Calculator Button ("Calculator")',
    part: 'Top Navigation Bar & Mobile Utility Row',
    category: 'Header & Global Controls',
    whatItDoes: 'Opens the interactive Philippine Wage, Overtime, Holiday, 13th Month & Retirement Pay Calculator.',
    howToUse: 'Tap Calculator in the header bar to compute exact pay rates and copy step-by-step equations.',
    proTip: 'Works side-by-side with the 17-Region Wage Directory when checking real-world daily rates.',
    targetTab: 'calculator',
  },
  {
    id: 'btn-coin-wallet',
    name: 'Gold Coin Wallet Badge & Shop Button',
    part: 'Top Navigation Bar (Right) & Mobile Utility Row',
    category: 'Header & Global Controls',
    whatItDoes: 'Displays your live Gold Coin balance and opens Toad’s Shop to unlock characters, power-ups, and perks.',
    howToUse: 'Click your coin counter or Shop button to browse 34 heroes, 2x Super Star boosts, companions, and card frames.',
    proTip: 'Earn coins by completing modules (+2), answering Quick Knowledge Checks (+3), flipping flashcards, and playing games!',
    targetTab: 'shop',
  },
  {
    id: 'btn-pomodoro-pill',
    name: 'Pomodoro Focus Timer (25m / 5m)',
    part: 'Top Navigation Bar & Mobile Menu',
    category: 'Header & Global Controls',
    whatItDoes: 'Runs structured 25-minute study sessions and 5-minute rest breaks with optional floating screen overlay.',
    howToUse: 'Click the timer button to start, pause, reset, mute completion chimes, or pin the compact timer on screen.',
    proTip: 'Every focused minute automatically logs into your Profile’s Daily Study Streak Calendar and 7-day bar graph!',
    targetTab: 'modules',
  },
  {
    id: 'btn-audio-soundscape',
    name: 'Music & Sound Effects Controls',
    part: 'Top Navigation Bar (Right)',
    category: 'Header & Global Controls',
    whatItDoes: 'Controls 4 synthesized retro study soundscapes (Overworld, Underground, Castle, Star Road) and UI sound effects.',
    howToUse: 'Click the Music button to pick a track or toggle SFX mute anytime for quiet library reading.',
    proTip: 'Generated locally via Web Audio API so it works 100% offline with zero data usage.',
    targetTab: 'map',
  },
  {
    id: 'btn-font-and-theme',
    name: 'Theme Switch (Light / Dark) & Font Size Scaler (A / A+ / A++)',
    part: 'Top Navigation Bar & Mobile Menu',
    category: 'Header & Global Controls',
    whatItDoes: 'Switches between bright Daylight Sky and restful Dark Night mode, and scales lesson text across 3 comfort sizes.',
    howToUse: 'Click the Sun/Moon toggle or cycle A / A+ / A++ until text feels effortless to read.',
    proTip: 'Your chosen theme and font scale persist automatically across reloads.',
    targetTab: 'modules',
  },
  {
    id: 'btn-walkthrough-guide',
    name: 'Interactive Walkthrough & Control Atlas ("Guide")',
    part: 'Top Navigation Bar & Mobile Menu',
    category: 'Header & Global Controls',
    whatItDoes: 'Opens this 14-step guided walkthrough and searchable button-by-button reference atlas.',
    howToUse: 'Step through all 14 chapters in order or search any specific button/tool here in the Control Atlas.',
    proTip: 'Completing the guide for the first time awards +25 Gold Coins!',
    targetTab: 'map',
  },
  {
    id: 'btn-user-profile',
    name: 'User Profile, Streak Calendar & Badges (Avatar Button)',
    part: 'Top Navigation Bar (Far Right)',
    category: 'Header & Global Controls',
    whatItDoes: 'Opens your personal learner profile featuring your Monthly Streak Calendar, 7-day study chart, World Badges, and Achievements.',
    howToUse: 'Click your character avatar in the top-right corner to inspect your stats, edit your display name, or export your Score Card PDF.',
    proTip: 'Complete all lessons inside any World to earn thematic badges like Overtime Guru and Wage Expert!',
    targetTab: 'map',
  },

  // 2. Overworld Map & Floating Helpers
  {
    id: 'btn-world-nodes',
    name: 'Overworld Map Stage Nodes (Worlds 1 to 6)',
    part: 'World Map Canvas',
    category: 'Map & Floating Tools',
    whatItDoes: 'Shows visual progress across all 6 Labor Standards worlds and lets you open stage checklists or jump to lessons.',
    howToUse: 'Click any World node on the map to inspect its topics or warp directly to that World in Modules.',
    proTip: 'Finishing 100% of a World triggers a celebratory fanfare, +50 Bonus Coins, and a World Mastery Badge!',
    targetTab: 'map',
  },
  {
    id: 'btn-fire-flower-streak',
    name: 'Daily Streak Tracker & 5-Min Quick Study Launcher',
    part: 'World Map Top Banner',
    category: 'Map & Floating Tools',
    whatItDoes: 'Tracks consecutive study days, displays your daily minute goal, and launches a 5-minute flashcard sprint.',
    howToUse: 'Click 5-Min Quick Study on the banner for a fast review session, or Leaderboard to compare Gold Coins.',
    proTip: 'Studying even 5–15 minutes a day lights up your Profile’s visual calendar grid.',
    targetTab: 'map',
  },
  {
    id: 'btn-floating-autoscroll',
    name: 'Floating Auto-Scroll Controller ("SCROLL")',
    part: 'Bottom-Right Floating Button (Reading Tabs)',
    category: 'Map & Floating Tools',
    whatItDoes: 'Scrolls module lessons, holidays, and regional tables smoothly hands-free at 1x, 2x, 3x, or 4x speed.',
    howToUse: 'Tap SCROLL in the bottom-right corner, press READ to start or PAUSE to stop, and tap the speed badge (1x–4x) to adjust pace.',
    proTip: 'Tap the X icon on the expanded bar anytime to fold it back into the compact SCROLL pill.',
    targetTab: 'modules',
  },
  {
    id: 'btn-floating-study-notes',
    name: 'Floating Study Notes Drawer ("NOTES") & Category Selector',
    part: 'Right-Edge / Bottom-Right Floating Button',
    category: 'Map & Floating Tools',
    whatItDoes: 'Opens your persistent personal Study Notes Pad from any reading tab with World tags, voice dictation, and 1-tap templates.',
    howToUse: 'Tap NOTES, pick "General / All Worlds" or Worlds 1–6 in the category dropdown, type or dictate your note, and click SAVE NOTE.',
    proTip: 'All saved notes are stored locally and can be included automatically inside your downloaded Study Guide PDF!',
    targetTab: 'modules',
  },

  // 3. Modules Deck & Topic Cards
  {
    id: 'btn-module-world-selector',
    name: 'World Selector Cards (Worlds 1–6 + All 19 Modules)',
    part: 'Modules Tab Top Grid',
    category: 'Modules & Study Lenses',
    whatItDoes: 'Filters the Module Deck to a single World (W1–W6) or displays all 19 modules together.',
    howToUse: 'Click any World card at the top of the Modules tab, or click All 19 to browse the entire syllabus.',
    proTip: 'Each World card shows a live completion bar so you always see which World is closest to 100%.',
    targetTab: 'modules',
  },
  {
    id: 'btn-module-sort-dropdown',
    name: 'Sort Topics Dropdown Menu',
    part: 'Module Deck Bar (Directly Above Topic Cards)',
    category: 'Modules & Study Lenses',
    whatItDoes: 'Reorders the displayed module cards by Stage Order, Alphabetical (A → Z), Difficulty (Easiest First), or Difficulty (Hardest First).',
    howToUse: 'Click the "Sort Topics" dropdown right above the topic cards and select your preferred order.',
    proTip: 'Choose "Difficulty (Easiest First)" when starting out so foundational concepts build naturally into advanced rules!',
    targetTab: 'modules',
  },
  {
    id: 'btn-module-view-modes',
    name: '5 Module View Modes (Stream, Grid, Outline, Focus, Slide Deck)',
    part: 'Modules Command Deck Toolbar',
    category: 'Modules & Study Lenses',
    whatItDoes: 'Transforms how lessons are presented — from full scrollable cards to a 2-column grid, compact outline, single-topic reader, or interactive Slide Deck.',
    howToUse: 'Click Stream, Grid, Outline, Focus, or Slides in the View bar, and optionally toggle Split Notes on desktop.',
    proTip: 'Slide Deck mode breaks every module into clean, bite-sized presentation slides you can step through with Left/Right arrows!',
    targetTab: 'modules',
  },
  {
    id: 'btn-module-status-filters',
    name: 'Status Filter Buttons (All, Unread, Mastered, Flagged, Pinned) & Depth Switch',
    part: 'Modules Command Deck Toolbar',
    category: 'Modules & Study Lenses',
    whatItDoes: 'Filters topics by completion/bookmark status and switches between Beginner takeaways and Unabridged depth.',
    howToUse: 'Click Unread to focus on remaining lessons, Pinned to see saved favorites, or Beginner/Unabridged to adjust detail.',
    proTip: 'Combine "Unread" + "Difficulty (Easiest First)" for an effortless step-by-step study queue.',
    targetTab: 'modules',
  },
  {
    id: 'btn-topic-study-lenses',
    name: 'Inside-Card Study Lenses (Full, Key Rules, Cloze Recall, Checklist)',
    part: 'Inside Every Expanded Topic Card',
    category: 'Modules & Study Lenses',
    whatItDoes: 'Lets you study each topic four ways: full reading, condensed summary, fill-in-the-blank active recall, or interactive rule checklist.',
    howToUse: 'Click the Study Lens buttons near the top of any expanded Topic Card.',
    proTip: 'Cloze Recall hides key numbers and rates behind tap-to-reveal blanks so you can test yourself as you read!',
    targetTab: 'modules',
  },
  {
    id: 'btn-topic-tts-glossary',
    name: 'Voice Reader (Listen 0.8x–1.5x) & Clickable Glossary Highlights',
    part: 'Inside Every Topic Card',
    category: 'Modules & Study Lenses',
    whatItDoes: 'Reads module rules aloud via speech synthesis and opens plain-English popups when you click underlined terms.',
    howToUse: 'Click Listen in the card header to play/pause narration, or tap any dotted-underlined keyword in the text.',
    proTip: 'Great for auditory learners or reviewing lessons hands-free while commuting.',
    targetTab: 'modules',
  },
  {
    id: 'btn-topic-quick-check',
    name: 'Quick Knowledge Check Mini-Quiz (+3 Coins) & Mark Studied',
    part: 'Bottom of Every Expanded Topic Card',
    category: 'Modules & Study Lenses',
    whatItDoes: 'Tests the core concept of each module with an instant 4-choice check, clear explanation, and a one-time +3 Coin bonus.',
    howToUse: 'Pick an answer at the bottom of the card to verify understanding, then click Mark Studied (+2 Coins) and Pin if desired!',
    proTip: 'Answering the Quick Knowledge Check right after reading locks key percentages and deadlines into memory.',
    targetTab: 'modules',
  },

  // 4. Holidays, Wages & Calculator
  {
    id: 'btn-holidays-controls',
    name: 'Holiday Category Filters & Day-Before Absence Simulator',
    part: 'Holidays Hub Tab',
    category: 'Holidays, Wages & Calculator',
    whatItDoes: 'Separates Regular Holidays (200%) from Special Days (130%) and simulates consecutive-holiday absence scenarios.',
    howToUse: 'Filter holiday cards at the top and toggle employee status in the interactive Holiday Eligibility Simulator.',
    proTip: 'Remember: Regular Holidays pay 100% even when unworked, whereas Special Non-Working Days follow "No Work, No Pay".',
    targetTab: 'holidays',
  },
  {
    id: 'btn-regional-wages-controls',
    name: '17-Region Search, Island Filters & Kasambahay Matrix',
    part: 'Regions Wage Directory Tab',
    category: 'Holidays, Wages & Calculator',
    whatItDoes: 'Searches and filters daily minimum wages across Luzon, Visayas, and Mindanao for Non-Agri, Agri, and Kasambahay workers.',
    howToUse: 'Type a region/city in the search input or click All, Luzon, Visayas, or Mindanao filter buttons.',
    proTip: 'Compare NCR vs. regional rates to understand how local Wage Boards adjust regional minimums.',
    targetTab: 'wages_matrix',
  },
  {
    id: 'btn-calculator-modes',
    name: 'Pay Calculator Inputs, Day-Type Multipliers & Sub-Calculators',
    part: 'Calculator Tab',
    category: 'Holidays, Wages & Calculator',
    whatItDoes: 'Computes regular shift pay, overtime, night shift differential (+10%), 13th month pay, SIL cash value, and 22.5-day retirement pay.',
    howToUse: 'Enter a daily wage, pick the day type (Ordinary, Rest Day, Special, Regular, Double), adjust OT/NSD hours, and copy the formula breakdown.',
    proTip: 'Switch between the Shift Pay, 13th Month, Retirement, and Wage Distortion tabs to explore every statutory formula.',
    targetTab: 'calculator',
  },

  // 5. Flashcards, Quizzes & 22-Game Vault
  {
    id: 'btn-flashcard-controls',
    name: 'Flashcard Flip, World Filter, Shuffle Deck & 5-Min Quick Study',
    part: 'Flashcards Tab',
    category: 'Flashcards, Quizzes & Games',
    whatItDoes: 'Flips 240+ question-and-answer cards, shuffles card order, and tracks Mastered vs. Need Review cards.',
    howToUse: 'Click Shuffle to randomize the current deck, click the card (or press Space) to flip, and rate your recall.',
    proTip: 'Shuffling before each study session prevents memorizing answers by card order!',
    targetTab: 'flashcards',
  },
  {
    id: 'btn-quiz-modes',
    name: '5-Item Quick Test, 10-Item Timed Exam Simulation, Practice Bank & Bowser Boss',
    part: 'Quiz & Boss Tab',
    category: 'Flashcards, Quizzes & Games',
    whatItDoes: 'Offers untimed World checkups, a timed 10-question randomized Exam Simulation with score breakdown, 65+ item practice sets, and Bowser combat.',
    howToUse: 'Pick your mode in the Quiz tab, select answers (with optional Lakitu 50/50 hint), and read the full explanation screen at the end.',
    proTip: 'Timed Exam Simulation draws fresh randomized questions across all topics and breaks down every answer afterward!',
    targetTab: 'quiz',
  },
  {
    id: 'btn-vault-games',
    name: '22-Game Arcade Vault & Yoshi’s Precision Cloud Lock',
    part: 'Game Vault Tab',
    category: 'Flashcards, Quizzes & Games',
    whatItDoes: 'Launches 22 playable mini-games (Kart GP, 2D/3D Platformers, Yoshi Egg Toss, Payroll Blitz, Due Process Relay, Wage Factory, Spellbook & more).',
    howToUse: 'Filter games by category or click any game card to play. Every run deals non-repeating questions and shuffled answer slots!',
    proTip: 'In Yoshi’s Statutory Egg Toss, tap or click directly on any answer cloud to auto-lock the exact ballistic arc with zero front-cloud collisions!',
    targetTab: 'vault',
  },

  // 6. Toad's Shop, Profile & Theme-Aware PDF Studio
  {
    id: 'btn-shop-bazaar',
    name: 'Toad’s Shop Tabs (34 Heroes, Power-Ups, Companions, Frames, ? Chests)',
    part: 'Toad’s Shop Tab',
    category: 'Shop, Profile & PDF Prints',
    whatItDoes: 'Lets you unlock and equip 34 characters, 2x Coin Super Stars, Shortcut Maps, desk companions, card frames, and Mystery Chests.',
    howToUse: 'Select a category tab in Toad’s Shop and click Buy or Equip using your earned Gold Coins.',
    proTip: 'Equip Toad’s Shortcut Map to highlight must-know rules across all module cards.',
    targetTab: 'shop',
  },
  {
    id: 'btn-profile-calendar-stats',
    name: 'Visual Monthly Streak Calendar, 7-Day Bar Chart & World Badges',
    part: 'User Profile Modal',
    category: 'Shop, Profile & PDF Prints',
    whatItDoes: 'Visualizes daily study streaks and completed goal days on a monthly calendar grid alongside a 7-day rolling bar graph and earned badges.',
    howToUse: 'Open your Profile from the top-right avatar button, browse months on the Streak Calendar, and export your Hero Score Card PDF.',
    proTip: 'Green calendar cells mark days you hit your daily study goal; gold highlights today’s live progress!',
    targetTab: 'map',
  },
  {
    id: 'btn-print-pdf-studio',
    name: 'Theme-Aware Print & Direct A4 PDF Studio (Summary, Reviewer, Certificate)',
    part: 'Print / PDF Studio Modal',
    category: 'Shop, Profile & PDF Prints',
    whatItDoes: 'Customizes and directly downloads 1-Page A4 Formulas & Deadlines, Landscape Mastery Certificates, and Multi-Page Study Reviewers as .pdf files.',
    howToUse: 'Switch between 1-Page A4, Reviewer, or Certificate, pick your Color Theme (Navy, Ink-Saver B&W, Crimson, Emerald, Parchment) & Font Family, and click Download PDF.',
    proTip: 'Both the live on-screen preview and the downloaded .pdf file apply your chosen theme colors, fonts, margins, and section toggles with zero cropping!',
    targetTab: 'map',
  },
];

export const AppWalkthroughModal: React.FC<AppWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onCompleteWalkthrough,
  colorMode,
  onToggleColorMode,
  studyDifficulty,
  onSelectDifficulty,
  equippedAvatar,
  onSelectAvatar,
  alreadyGraduated,
}) => {
  const [activeMode, setActiveMode] = useState<'chapters' | 'directory'>('chapters');
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [directorySearch, setDirectorySearch] = useState<string>('');
  const [selectedDirectoryCategory, setSelectedDirectoryCategory] = useState<string>('All');
  const [expandedButtonId, setExpandedButtonId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStepIdx(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (activeMode === 'chapters' && e.key === 'ArrowRight') {
        setStepIdx((prev) => Math.min(WALKTHROUGH_CHAPTERS.length - 1, prev + 1));
      } else if (activeMode === 'chapters' && e.key === 'ArrowLeft') {
        setStepIdx((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, activeMode]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    BUTTON_DIRECTORY.forEach((b) => set.add(b.category));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredButtons = useMemo(() => {
    return BUTTON_DIRECTORY.filter((btn) => {
      const matchesCat =
        selectedDirectoryCategory === 'All' || btn.category === selectedDirectoryCategory;
      const q = directorySearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        btn.name.toLowerCase().includes(q) ||
        btn.part.toLowerCase().includes(q) ||
        btn.whatItDoes.toLowerCase().includes(q) ||
        btn.proTip.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [selectedDirectoryCategory, directorySearch]);

  if (!isOpen) return null;

  const chapter = WALKTHROUGH_CHAPTERS[stepIdx] || WALKTHROUGH_CHAPTERS[0];
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === WALKTHROUGH_CHAPTERS.length - 1;
  const progressPct = Math.round(((stepIdx + 1) / WALKTHROUGH_CHAPTERS.length) * 100);

  const renderChapterIcon = (id: string, cls = 'w-5 h-5') => {
    switch (id) {
      case 'welcome_setup':
        return <Compass className={`${cls} text-amber-400`} />;
      case 'header_navigation':
        return <Sliders className={`${cls} text-sky-400`} />;
      case 'world_map_progression':
        return <Map className={`${cls} text-emerald-400`} />;
      case 'modules_command_deck':
        return <Layers className={`${cls} text-amber-300`} />;
      case 'topic_card_lenses':
        return <BookOpen className={`${cls} text-red-400`} />;
      case 'scroller_and_notes':
        return <Clock className={`${cls} text-cyan-300`} />;
      case 'holidays_hub':
        return <Calendar className={`${cls} text-rose-400`} />;
      case 'regional_wages':
        return <MapPin className={`${cls} text-emerald-300`} />;
      case 'statutory_calculator':
        return <Calculator className={`${cls} text-cyan-400`} />;
      case 'mystery_flashcards':
        return <HelpCircle className={`${cls} text-yellow-300`} />;
      case 'quizzes_and_boss':
        return <Trophy className={`${cls} text-amber-300`} />;
      case 'arcade_game_vault':
        return <Gamepad2 className={`${cls} text-emerald-300`} />;
      case 'toad_shop_and_perks':
        return <Sparkles className={`${cls} text-pink-300`} />;
      case 'profile_pdf_offline':
      default:
        return <Award className={`${cls} text-amber-400`} />;
    }
  };

  const handleFinishTour = (targetTab?: string) => {
    marioAudio.playLevelUp();
    try {
      confetti({ particleCount: 110, spread: 85, origin: { y: 0.55 } });
    } catch {
      // ignore
    }
    onCompleteWalkthrough(targetTab);
  };

  return (
    <div
      role="dialog"
      aria-label="Complete Interactive App Guide Walkthrough"
      data-testid="app-walkthrough-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 select-none overflow-y-auto print:hidden"
    >
      <div className="bg-[#1e293b] text-white w-full max-w-5xl h-[100dvh] sm:h-auto sm:max-h-[94vh] rounded-none sm:rounded-3xl border-0 sm:border-4 border-slate-950 shadow-[10px_10px_0_#000] overflow-hidden my-auto flex flex-col safe-top-nav safe-bottom-dock">
        {/* Top Progress Header */}
        <div className="bg-[#0f172a] px-4 sm:px-6 py-3.5 border-b-2 border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000] shrink-0">
              <MarioMushroomIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase text-amber-400 font-mario">
                <span>MARIO LABOR LAW ADVENTURE</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-300">{MAIN_CREATOR_AUTHOR.shortBadge}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white font-display truncate">
                {activeMode === 'chapters'
                  ? `STEP-BY-STEP TOUR · CHAPTER ${stepIdx + 1} OF ${WALKTHROUGH_CHAPTERS.length}`
                  : `BUTTON-BY-BUTTON MASTER ATLAS (${BUTTON_DIRECTORY.length} CONTROLS)`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mode Switcher Tabs */}
            <div className="inline-flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('chapters');
                  marioAudio.playTabSwitch();
                }}
                className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                  activeMode === 'chapters'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5 shrink-0" />
                <span>14-Step Tour</span>
              </button>
              <button
                type="button"
                data-testid="walkthrough-control-atlas-tab"
                onClick={() => {
                  setActiveMode('directory');
                  marioAudio.playTabSwitch();
                }}
                className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                  activeMode === 'directory'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <MousePointerClick className="w-3.5 h-3.5 shrink-0" />
                <span>Control Atlas</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onCompleteWalkthrough();
                marioAudio.playPipe();
              }}
              data-testid="walkthrough-skip-btn"
              className="hidden sm:inline-flex min-h-[44px] px-3 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-600 cursor-pointer whitespace-nowrap"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onCompleteWalkthrough();
                marioAudio.playPipe();
              }}
              aria-label="Close Walkthrough Guide"
              className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Continuous Progress Bar in Chapter Mode */}
        {activeMode === 'chapters' && (
          <div className="w-full h-2 bg-slate-950 shrink-0">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* MODE 1: 10-CHAPTER GUIDED TOUR */}
        {activeMode === 'chapters' && (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
            {/* Left Chapter Rail */}
            <aside className="lg:col-span-4 bg-slate-950/90 border-b lg:border-b-0 lg:border-r border-slate-800 p-3 sm:p-4">
              <div className="hidden lg:block mb-2.5">
                <span className="text-[10px] font-black uppercase text-slate-400 font-mario">
                  14 STEP-BY-STEP CHAPTERS
                </span>
              </div>
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible no-scrollbar">
                {WALKTHROUGH_CHAPTERS.map((ch, idx) => {
                  const isActive = idx === stepIdx;
                  const isVisited = idx < stepIdx;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        setStepIdx(idx);
                        marioAudio.playJump();
                      }}
                      data-testid={`walkthrough-step-tab-${ch.stepNumber}`}
                      className={`px-3 py-2 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer shrink-0 lg:w-full ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 border-black font-black shadow-[0_2px_0_#000]'
                          : isVisited
                          ? 'bg-slate-900 text-emerald-300 border-slate-800 hover:bg-slate-800 font-bold'
                          : 'bg-slate-900/60 text-slate-300 border-slate-800/80 hover:bg-slate-800 font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`text-[10px] font-mario tabular-nums shrink-0 ${
                            isActive ? 'text-slate-950' : 'text-amber-400'
                          }`}
                        >
                          {String(ch.stepNumber).padStart(2, '0')}
                        </span>
                        <span className="text-xs whitespace-nowrap lg:truncate">{ch.shortTitle}</span>
                      </div>
                      {isVisited && !isActive && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 hidden lg:block" />
                      )}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Right Interactive Chapter Stage */}
            <div className="lg:col-span-8 p-4 sm:p-5 space-y-4 overflow-y-auto">
              <div className="space-y-4">
                {/* Chapter Kicker + Headline */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    {renderChapterIcon(chapter.id, 'w-4 h-4')}
                    <span>{chapter.kicker}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-display leading-tight">
                    {chapter.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    {chapter.summary}
                  </p>
                </div>

                {/* 3 Structured Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {chapter.highlights.map((hl, idx) => (
                    <div
                      key={hl.label}
                      className="bg-slate-900 rounded-2xl p-3 border border-slate-700 space-y-1"
                    >
                      <div className="flex items-start gap-1.5">
                        <span className="text-[10px] font-mono font-black text-amber-400 tabular-nums whitespace-nowrap shrink-0 mt-0.5">
                          0{idx + 1}.
                        </span>
                        <h4 className="font-black text-xs sm:text-sm text-white font-display leading-snug">
                          {hl.label}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{hl.detail}</p>
                    </div>
                  ))}
                </div>

                {/* Step 1 Setup Playground */}
                {stepIdx === 0 && (
                  <div className="bg-slate-950/90 rounded-2xl p-4 border-2 border-amber-400/60 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-amber-400 font-mario">
                        LIVE QUICK SETUP — PERSONALIZE YOUR EXPERIENCE NOW
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Theme Toggle */}
                      <div className="bg-slate-900 rounded-xl p-3 border border-slate-700 space-y-2">
                        <span className="text-xs font-black text-slate-200 block">
                          1. Reading Theme (Day vs Late-Night)
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onToggleColorMode('light');
                              marioAudio.playCoin();
                            }}
                            className={`py-2 px-2.5 rounded-lg text-xs font-black inline-flex items-center justify-center gap-1.5 border cursor-pointer whitespace-nowrap ${
                              colorMode === 'light'
                                ? 'bg-amber-400 text-slate-950 border-black'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            <Sun className="w-3.5 h-3.5" />
                            <span>Light Sky</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onToggleColorMode('dark');
                              marioAudio.playPowerUp();
                            }}
                            className={`py-2 px-2.5 rounded-lg text-xs font-black inline-flex items-center justify-center gap-1.5 border cursor-pointer whitespace-nowrap ${
                              colorMode === 'dark'
                                ? 'bg-indigo-500 text-white border-black'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            <Moon className="w-3.5 h-3.5" />
                            <span>Dark Night</span>
                          </button>
                        </div>
                      </div>

                      {/* Difficulty Toggle */}
                      <div className="bg-slate-900 rounded-xl p-3 border border-slate-700 space-y-2">
                        <span className="text-xs font-black text-slate-200 block">
                          2. Quiz &amp; Flashcard Difficulty
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectDifficulty('casual');
                              marioAudio.playPowerUp();
                            }}
                            className={`py-2 px-2.5 rounded-lg text-xs font-black inline-flex items-center justify-center gap-1.5 border cursor-pointer whitespace-nowrap ${
                              studyDifficulty === 'casual'
                                ? 'bg-emerald-400 text-slate-950 border-black'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            <Feather className="w-3.5 h-3.5" />
                            <span>Casual</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectDifficulty('exam_prep');
                              marioAudio.playFireball();
                            }}
                            className={`py-2 px-2.5 rounded-lg text-xs font-black inline-flex items-center justify-center gap-1.5 border cursor-pointer whitespace-nowrap ${
                              studyDifficulty === 'exam_prep'
                                ? 'bg-red-600 text-white border-black'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Exam Prep</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Starter Hero Selector */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-black text-slate-200 block">
                        3. Pick Your Starting Hero (34 Characters Available)
                      </span>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                        {HERO_ROSTER.slice(0, 8).map((hero) => (
                          <button
                            key={hero.id}
                            type="button"
                            onClick={() => {
                              onSelectAvatar(hero.id);
                              marioAudio.playCoin();
                            }}
                            className={`min-h-[48px] p-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                              equippedAvatar === hero.id
                                ? 'bg-amber-400 text-slate-950 border-black font-black'
                                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400/60'
                            }`}
                          >
                            <MarioCharacterAvatar character={hero.id} className="w-6 h-6" />
                            <span className="text-[10px] font-bold truncate w-full text-center">
                              {hero.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Official Creator Attribution inside App Information / Walkthrough Modal */}
                    <div
                      data-testid="walkthrough-matthew-credit-card"
                      className="bg-slate-900/95 rounded-xl px-3.5 py-2.5 border border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <MarioStarIcon className="w-4 h-4 shrink-0" />
                        <span className="font-black text-amber-300">
                          {MAIN_CREATOR_AUTHOR.shortBadge}
                        </span>
                        <span className="text-slate-400 hidden sm:inline">·</span>
                        <span className="text-slate-200 font-semibold">
                          Matthew Cesar Corpuz — Main Creator of this Memory Aid
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-300">
                        Worlds 1–6 Unabridged Edition
                      </span>
                    </div>
                  </div>
                )}

                {/* Step 2 Audio Preview */}
                {chapter.id === 'header_navigation' && (
                  <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-700 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-amber-400 font-mario">
                        TRY SOUND ALERTS &amp; AMBIENT SOUNDSCAPES
                      </span>
                      <button
                        type="button"
                        onClick={() => marioAudio.playPomodoroFocusComplete()}
                        className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Preview 25m Pomodoro Chime</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {MARIO_SOUNDSCAPES.map((sc) => (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => marioAudio.setSoundscape(sc.id, true)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left cursor-pointer"
                        >
                          <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                            <Music className="w-3 h-3 shrink-0" />
                            <span>{sc.shortName}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {sc.bpmLabel}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Helpful Study Tip Box */}
                <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-700 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center shrink-0">
                    <MarioStarIcon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
                      HELPFUL STUDY TIP
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed">
                      {chapter.proTip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: BUTTON-BY-BUTTON & PART-BY-PART MASTER DIRECTORY */}
        {activeMode === 'directory' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 min-h-0">
            {/* Search & Filter Header */}
            <div className="bg-slate-900 rounded-2xl p-4 border-2 border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                    placeholder="Search any button, part, tab, switch, or stepper..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border-2 border-slate-700 rounded-xl text-white text-xs sm:text-sm font-semibold placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div className="text-xs font-bold text-amber-300 px-2 py-1 bg-black/60 rounded-lg border border-amber-400/40 shrink-0 text-center">
                  Showing {filteredButtons.length} of {BUTTON_DIRECTORY.length} Controls
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedDirectoryCategory(cat);
                      marioAudio.playTabSwitch();
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-black border transition-all cursor-pointer whitespace-nowrap ${
                      selectedDirectoryCategory === cat
                        ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Button Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
              {filteredButtons.map((btn) => {
                const isExpanded = expandedButtonId === btn.id;

                return (
                  <div
                    key={btn.id}
                    className="bg-slate-900 rounded-2xl border-2 border-slate-700 hover:border-amber-400/80 transition-all overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedButtonId(isExpanded ? null : btn.id);
                        marioAudio.playCoin();
                      }}
                      className="w-full p-3.5 text-left flex items-start justify-between gap-3 cursor-pointer"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black text-amber-400 border border-slate-700 font-mario">
                            {btn.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold truncate inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{btn.part}</span>
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white font-display flex items-center gap-1.5">
                          <span>{btn.name}</span>
                        </h4>
                        <p className="text-xs text-slate-300 font-medium line-clamp-2">
                          {btn.whatItDoes}
                        </p>
                      </div>

                      <div className="p-1 rounded-lg bg-slate-800 text-slate-300 shrink-0 mt-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-800 space-y-2.5 bg-slate-950/60 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                            HOW TO USE STEP BY STEP
                          </span>
                          <p className="text-slate-200 font-semibold leading-relaxed">
                            {btn.howToUse}
                          </p>
                        </div>

                        <div className="space-y-0.5 bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                          <span className="text-[10px] font-black uppercase text-emerald-300 font-mario flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                            <span>SMART STUDY TIP</span>
                          </span>
                          <p className="text-slate-300 leading-relaxed font-medium">
                            {btn.proTip}
                          </p>
                        </div>

                        {btn.targetTab && (
                          <div className="flex justify-end pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                onCompleteWalkthrough(btn.targetTab);
                                marioAudio.playTabSwitch();
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] border border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                            >
                              <span>Jump &amp; Try This Part</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pinned Bottom Navigation Footer + Discreet Official Creator Credit */}
        <div className="bg-[#0f172a] px-4 sm:px-6 py-3 border-t-2 border-slate-700 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {activeMode === 'chapters' ? (
            <>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => {
                    setStepIdx((prev) => Math.max(0, prev - 1));
                    marioAudio.playJump();
                  }}
                  className="min-h-[44px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-black text-xs border-2 border-slate-600 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <span
                  data-testid="walkthrough-matthew-credit"
                  className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400"
                >
                  <span className="text-amber-300">{MAIN_CREATOR_AUTHOR.shortBadge}</span>
                  <span aria-hidden="true">·</span>
                  <span>Main Creator of this Memory Aid</span>
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {!isLast && (
                  <button
                    type="button"
                    onClick={() => {
                      onCompleteWalkthrough(chapter.targetTab);
                      marioAudio.playTabSwitch();
                    }}
                    className="hidden sm:inline-flex min-h-[44px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-600 items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>{chapter.ctaLabel}</span>
                  </button>
                )}

                {isLast ? (
                  <button
                    type="button"
                    data-testid="walkthrough-finish-btn"
                    onClick={() => handleFinishTour('map')}
                    className="min-h-[44px] px-5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-sm border-2 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <MarioStarIcon className="w-4 h-4" />
                    <span>
                      {alreadyGraduated
                        ? 'Finish Walkthrough'
                        : 'Finish Guide & Claim +25 Coins'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid="walkthrough-next-btn"
                    onClick={() => {
                      setStepIdx((prev) => Math.min(WALKTHROUGH_CHAPTERS.length - 1, prev + 1));
                      marioAudio.playCoin();
                    }}
                    className="min-h-[44px] px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm border-2 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <span>Next Chapter</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400 font-semibold">
                {MAIN_CREATOR_AUTHOR.shortBadge} · Inspect every button, tab, and calculation switch across all 6 Worlds.
              </span>
              <button
                type="button"
                onClick={() => {
                  onCompleteWalkthrough();
                  marioAudio.playPipe();
                }}
                className="min-h-[44px] px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] cursor-pointer whitespace-nowrap"
              >
                Close Atlas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
