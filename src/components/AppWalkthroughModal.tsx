import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  VolumeX,
  Search,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  MousePointerClick,
  Sliders,
  MapPin,
  Music,
  Scale,
  BookmarkPlus,
  Eye,
  EyeOff,
  Flame,
  Zap,
  Hammer,
  Shield,
  Coins,
  FileText,
  Printer,
  Shuffle,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  MarioCharacterAvatar,
  MarioCoinIcon,
  MarioMushroomIcon,
  MarioStarIcon,
  Mario1UpIcon,
  MarioFireFlowerIcon,
  MarioBowserIcon,
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

interface ModalGuideItem {
  id: string;
  name: string;
  category: string;
  badge: string;
  summary: string;
  primaryFeatures: string[];
  keyButtons: { name: string; role: string; shortcut?: string }[];
  proTip: string;
}

export const MODAL_GUIDE_ITEMS: ModalGuideItem[] = [
  {
    id: 'modal_print_studio',
    name: 'Print Studio & High-DPI Reviewer',
    category: 'Study Tools & Offline',
    badge: 'A4 PDF Builder',
    summary:
      'Generates publication-quality single-page A4 memory aids, multi-page comprehensive reviewers, portrait diplomas, and score cards with true embedded fonts.',
    primaryFeatures: [
      'Choose from 24 studio color themes (Classic NES, Emerald Pipe, Royal Gold, Super Star, Cyberpunk, etc.)',
      'Select from 20 professional and accessibility fonts (Press Start 2P, Playfair Display, Cinzel, Lexend, Atkinson Hyperlegible)',
      'Responsive zoom preview: Fit Width, 100% Crisp, or Whole Page view',
      '100% offline generation with zero network requirement',
    ],
    keyButtons: [
      { name: 'Download PDF', role: 'Exports clean binary PDF file directly to device storage' },
      { name: 'Copy Plain Text', role: 'Copies complete formatted codal text to clipboard' },
      { name: 'Print Page', role: 'Opens system browser print dialog for paper printing' },
      { name: 'Theme Palettes', role: 'Instantly applies custom color styling across preview and export' },
    ],
    proTip: 'For the ultimate one-sheet exam cramming, pick the 1-Page Summary layout with Atkinson Hyperlegible font!',
  },
  {
    id: 'modal_statute_lookup',
    name: 'Statute & Codal Jurisprudence Lookup',
    category: 'Codal Repertory',
    badge: 'Search Engine',
    summary:
      'Instant search engine for all Philippine Labor Code articles, Republic Acts, and Supreme Court landmark rulings with exact verbatim text and high-yield study tips.',
    primaryFeatures: [
      'Search by article number (e.g., "83", "87"), law ("RA 11210"), or doctrine keywords ("control test")',
      'Listen aloud to statutory provisions with Web Speech synthesis and speed cycler',
      'Active Recall Cloze Mode: Veils numeric thresholds and doctrines into interactive recall blocks',
      'Codal margin line numbers toggle (#) for precise courtroom citation reference',
      'One-tap Save Note integration directly into Study Notes Drawer',
      'Quick jump to corresponding module study deck',
    ],
    keyButtons: [
      { name: 'Quick Statute Chips', role: 'Instant one-click shortcuts to top-tested articles (Art. 82, 87, 94, 100, 297)' },
      { name: 'Save Note', role: 'Saves complete codal provision and SC doctrines into your personal notebook' },
      { name: 'Listen / Stop', role: 'Reads aloud the statutory doctrine using natural speech synthesis' },
      { name: 'Study Module', role: 'Transports you directly to the relevant world learning deck' },
    ],
    proTip: 'Press ESC anytime to quickly close the lookup modal and resume your current study session.',
  },
  {
    id: 'modal_study_notes',
    name: 'Study Notes & Doctrine Drawer',
    category: 'Personal Notebook',
    badge: 'Notebook',
    summary:
      'Your persistent personal legal notebook for saving missed quiz doctrines, verbatim statutory provisions, pinned rules, and custom study notes.',
    primaryFeatures: [
      'Filter by category tags: Key Doctrine, Statutory Limit, Memorize, or Quiz Errors',
      'Organized markdown and plain-text note editor with instant local persistence',
      'Export All Notes (.txt) with automated clipboard copy and file download',
      'Visual badge markers for missed codal review doctrines and rule citations',
    ],
    keyButtons: [
      { name: 'New Note', role: 'Opens editor to draft custom study insights and rule summaries' },
      { name: 'Quiz Errors Filter', role: 'Filters notebook strictly to review takeaways from missed quiz items' },
      { name: 'Export Notes (.txt)', role: 'Downloads complete study notebook as a clean organized study reviewer' },
      { name: 'Pin Note', role: 'Pins crucial statutory doctrines to the top of your notebook list' },
    ],
    proTip: 'Whenever you miss an answer in any quiz, click "Save Error to Notes" to build an automatic weakness notebook!',
  },
  {
    id: 'modal_toads_training_log',
    name: 'Toad’s Training Log & Milestone Streaks',
    category: 'Telemetry & Habits',
    badge: 'Analytics',
    summary:
      'Visualizes your weekly study time and daily quiz accuracy in an interactive Mario-themed D3 line chart with 5-day flagpole bonuses.',
    primaryFeatures: [
      'Interactive D3 dual-axis line chart tracking daily minutes studied and quiz completion rates',
      'Visual Flagpole streak indicator awarding bonus XP and badge multipliers on 5-day streaks',
      'Historical daily study calendar tracking all milestone achievement days',
      'Weekly performance rank appraisal with custom Mario guidance',
    ],
    keyButtons: [
      { name: 'Flagpole Streak', role: 'Displays active consecutive study days and next milestone bonus' },
      { name: '7-Day D3 Points', role: 'Hover or tap chart points to view exact minutes and quiz accuracy for that day' },
      { name: 'History Calendar', role: 'Opens calendar view of all completed daily study goal days' },
      { name: 'Close Training Log', role: 'Returns to the main dashboard' },
    ],
    proTip: 'Hit a 5-day quiz streak to unlock the Fire Flower badge and earn a permanent 1.5x coin multiplier!',
  },
  {
    id: 'modal_daily_missions',
    name: 'Daily Mission & Bounty Board',
    category: 'Quests & Goals',
    badge: 'Bounties',
    summary:
      'Refreshes every 24 hours with three targeted study tasks like mastering a topic, performing quick quizzes, or logging focus time.',
    primaryFeatures: [
      '3 randomized daily study missions with real-time percentage progress bars',
      'Gold coin and XP bounties awarded instantly upon completing each task',
      'Midnight countdown timer indicating when fresh bounties arrive',
      'Visual mission completion stamps with celebratory audio',
    ],
    keyButtons: [
      { name: 'Claim Bounty', role: 'Collects gold coins and experience points for completed missions' },
      { name: 'Go To Mission', role: 'Directly navigates to the relevant world, quiz arena, or timer' },
      { name: 'Close Bounties', role: 'Closes board to resume studying' },
    ],
    proTip: 'Complete all 3 missions in a single day to claim the Super Star 2x Coin Rush bonus for 10 minutes!',
  },
  {
    id: 'modal_audio_synthesizer',
    name: 'Sound Synthesizer & Audio Packs',
    category: 'Audio Controls',
    badge: 'Chiptune Synthesizer',
    summary:
      'Controls the 15 distinct Mario audio packs, ambient focus soundscapes, volume mixers, and Toadify voice synthesizer.',
    primaryFeatures: [
      'Choose from 15 custom sound packs: NES 1985, Super Mario World 16-bit, N64, Mario Kart, Galaxy, and Lo-Fi Study Chiptune',
      'Toggle Toadify synthesizer to convert notifications into playful Toad chattered sound effects',
      'Select from 4 ambient study soundscapes (Mushroom Kingdom Rain, Lo-Fi Castle Fire, Pipe Ambience, Star Road Drone)',
      'Independent volume sliders for background BGM and sound effects (SFX)',
    ],
    keyButtons: [
      { name: 'Mute / Unmute All', role: 'Global mute toggle (can also press M on physical keyboards)' },
      { name: 'Equip Audio Pack', role: 'Activates selected sound pack and persists preference in storage' },
      { name: 'Toadify Voice Toggle', role: 'Toggles Toad voice modulation on study notifications and alerts' },
      { name: 'Preview SFX', role: 'Plays sample jump, coin, and power-up sounds for the selected pack' },
    ],
    proTip: 'Turn on the Star Road Drone soundscape while reading long verbatim codal provisions to stay deeply focused.',
  },
  {
    id: 'modal_player_progression',
    name: 'Player Progression & Level Roadmap',
    category: 'Progression & Heroes',
    badge: 'Levels 1–35',
    summary:
      'Complete progression roadmap mapping your total XP to 35 character levels, unlocking new Mario avatars and titles along the way.',
    primaryFeatures: [
      'Real-time level progress bar displaying XP earned vs XP needed for next level',
      'Hero roster of 34 Mario characters (Mario, Luigi, Peach, Bowser, Yoshi, Toadette, Rosalina, Geno, etc.)',
      'Level title roadmap from Level 1 Novice Toad to Level 35 Supreme Chief Justice of the Mushroom Court',
      'Instant equip hero button for unlocked character avatars',
    ],
    keyButtons: [
      { name: 'Equip Hero Avatar', role: 'Equips unlocked character as your active profile and quiz avatar' },
      { name: 'Filter Unlocked / Locked', role: 'Filters character roadmap by unlock status' },
      { name: 'Close Roadmap', role: 'Returns to current screen' },
    ],
    proTip: 'Playing Practice Arena quizzes and completing unbroken 25-minute Pomodoro sessions award the highest XP rates!',
  },
  {
    id: 'modal_courtroom_boss',
    name: 'Courtroom Bowser Boss Battle',
    category: 'Combat Quizzes',
    badge: 'Tribunal Boss',
    summary:
      'Turn-based legal battle against Employer Bowser where you file statutory objections and motions to dismantle his labor violations.',
    primaryFeatures: [
      'Turn-based courtroom combat featuring Player HP vs Bowser HP (200 HP)',
      'Four distinct statutory legal moves: 8-Hour Fireball, Maternity Hammer, Non-Diminution Shield, and D.O. 174 Ultra Stomp',
      'Counter-motion bonus damage when targeting Bowser’s specific statutory weakness',
      'Equipped Toad Shop items (1-Up Life Ring, Star Shield, Double Coin Mushroom) activate automatically',
    ],
    keyButtons: [
      { name: 'Statutory Attack Moves', role: 'Fires statutory legal actions inflicting direct damage on Bowser' },
      { name: 'Non-Diminution Shield', role: 'Deploys protective shield restoring HP and blocking illegal deductions' },
      { name: 'Reset Trial', role: 'Restarts the boss battle gauntlet from Round 1' },
    ],
    proTip: 'Equip the 1-Up Life Ring from Toad’s Shop to enter the battle with 130 HP instead of 100 HP!',
  },
  {
    id: 'modal_exam_focus_mode',
    name: 'Exam Focus Mode',
    category: 'Deep Study',
    badge: 'Distraction-Free',
    summary:
      'Stripped-down, full-screen reading environment eliminating navigation bars and sidebars for pure legal immersion.',
    primaryFeatures: [
      'Full-screen centered viewport (fixed inset-0 with clean overflow-y-auto)',
      'Adjustable typography sizing with zero horizontal scrolling or clipping',
      'Clean statutory provision viewer with high-contrast text',
      'Instant quick-exit button returning to the standard module deck',
    ],
    keyButtons: [
      { name: 'Exit Focus Mode', role: 'Exits full-screen focus and restores navigation bars' },
      { name: 'Text Size (A- / A+)', role: 'Enlarges or reduces font size for comfortable reading' },
      { name: 'Toggle Cloze Words', role: 'Toggles fill-in-the-blank hiding for memory testing' },
    ],
    proTip: 'Use Exam Focus Mode during final study sprints to eliminate visual noise and build deep memory retention.',
  },
  {
    id: 'modal_user_profile',
    name: 'User Profile & Hero Card',
    category: 'Profile & Telemetry',
    badge: 'Player Card',
    summary:
      'Your comprehensive learner dossier with avatar customization, 30-day performance heatmap, achievement trophies, and boss rank records.',
    primaryFeatures: [
      'Editable player name with active Mario title and equipped companion badge',
      'Collapsible 30-day quiz performance heatmap visualizing missed Labor Code provisions',
      'World Boss Rank competitive card tracking total completion time and accuracy across worlds',
      'Achievement trophy room showcasing unlocked badges and milestones',
    ],
    keyButtons: [
      { name: 'Switch Hero Avatar', role: 'Opens hero character picker to change your profile avatar' },
      { name: 'Show 30-Day Heatmap', role: 'Expands the interactive diagnostic heatmap of labor provisions' },
      { name: 'Export Progress (JSON)', role: 'Backs up your complete study records, coins, and notes to a file' },
      { name: 'Reset All Data', role: 'Clears saved progress with confirmation safeguard' },
    ],
    proTip: 'Check your World Boss Rank card to compare your completion times against top Mushroom Kingdom benchmarks!',
  },
  {
    id: 'modal_dole_calculator',
    name: 'DOLE Statutory Wage Multiplier Calculator',
    category: 'Calculators & Wages',
    badge: 'RTWPB 2026',
    summary:
      'Official interactive DOLE statutory calculator with 1-click regional wage presets for all 17 regions, 125% overtime, 110% night shift, 130% rest day, 200%/260%/300% holiday pay, 13th month, and Art. 302 retirement.',
    primaryFeatures: [
      'Official 17 Philippine regions RTWPB minimum wage presets with one tap',
      'Overtime, rest day, night shift differential, and holiday multipliers calculated in real time',
      'Accurate Article 302 statutory retirement computation using the 22.5-day legal divisor',
      'Copyable breakdown payroll slip ready for study notes and exam review',
    ],
    keyButtons: [
      { name: 'Region Presets', role: 'Instantly applies standard statutory minimum daily wages for any Philippine region' },
      { name: 'Copy Breakdown Slip', role: 'Copies the complete computed legal wage breakdown to your clipboard' },
      { name: 'Reset Inputs', role: 'Clears all hourly inputs to default baseline numbers' },
    ],
    proTip: 'Remember the 22.5-day retirement divisor: 15 days basic salary + 5 days SIL + 2.5 days (1/12th of 13th month)!',
  },
  {
    id: 'modal_research_cohort',
    name: 'Research Cohort Directory & Citation Engine',
    category: 'Legal Research',
    badge: '9 Cohort Fellows',
    summary:
      'Comprehensive directory of all 9 Research Cohort legal contributors with their assigned Labor Law domains, Mario roles, and 1-click Bluebook/APA citation generation.',
    primaryFeatures: [
      'Full roster of 9 research members with assigned statutory worlds and research domains',
      'Search and filter by keyword, topic area, or researcher name',
      '1-click Bluebook and APA citation formatting ready for academic papers and legal memorandums',
    ],
    keyButtons: [
      { name: 'Copy Bluebook Citation', role: 'Copies standardized Bluebook legal citation to clipboard' },
      { name: 'Copy APA Citation', role: 'Copies academic APA 7th edition citation to clipboard' },
    ],
    proTip: 'Use the cohort directory when writing case analyses or citing specific statutory provisions in class papers.',
  },
  {
    id: 'modal_companion_hud',
    name: 'Interactive Mario Study Companion HUD',
    category: 'Study Engagement',
    badge: 'Mario Pet & Tutor',
    summary:
      'Engaging interactive Mario pet widget with animated expressions, affection leveling (Lv. 1–10), petting, feeding Super Mushrooms, high-yield legal doctrine tips, and 5-minute study blitzes.',
    primaryFeatures: [
      'Companion Affection & Leveling system with persistent happiness meter (0–100%)',
      'Petting interaction with sound cues and floating affection hearts',
      'Feed Super Mushroom action to max out happiness and award bonus XP',
      'Instant legal doctrine advice rotating through landmark Philippine Supreme Court rulings',
      'Quick Companion Switcher allowing instant swapping between 8 Mario companions',
    ],
    keyButtons: [
      { name: 'Pet Companion', role: 'Increases affection and happiness with joyful sound effects' },
      { name: 'Feed (5c)', role: 'Feeds a Super Mushroom treat to boost happiness to 100%' },
      { name: 'Doctrine', role: 'Asks companion for an actionable statutory rule or practical workplace doctrine' },
      { name: '5m Study', role: 'Immediately launches a rapid 5-minute study blitz' },
      { name: 'Switch Companion', role: 'Opens menu to summon any of the 8 available Mario companions' },
    ],
    proTip: 'Pet your companion daily and level them up to Level 10 to maximize your bonus coin multipliers!',
  },
];

export const BUTTON_DIRECTORY: ButtonDirectoryItem[] = [
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
    whatItDoes: 'Switches cleanly between all major study hubs, reference tables, quizzes, 47 Arcade Games, and Toad’s Shop.',
    howToUse: 'Click any section tab on desktop, or use the 5-button bottom dock + Menu button on mobile.',
    proTip: 'Your progress, active Pomodoro timer, and saved notes stay synced across every single tab.',
    targetTab: 'modules',
  },
  {
    id: 'btn-menu-pixel-font',
    name: 'Menu Pixel Font Selector (Silkscreen, Pixelify, VT323, Press 2P)',
    part: 'Navbar Settings & Tools Popover (Desktop & Mobile Drawer)',
    category: 'Header & Global Controls',
    whatItDoes: 'Customizes the retro pixel typography applied to menu buttons (such as 17 Regions, Calculator, and Toad’s Shop inside the Menu drawer).',
    howToUse: 'Open the Tools (Sliders icon) menu, find Menu Pixel Font, and choose from Smart Pixel (Silkscreen + Press 2P), Silkscreen 8-Bit, Pixelify Sans, VT323 CRT, or NES Classic.',
    proTip: 'Smart Adaptive mode automatically applies compact Silkscreen typography to multi-word menu items like Regions and Calculator while preserving classic Press Start 2P for short menu items.',
    targetTab: 'map',
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
    id: 'btn-toad-pro-tips',
    name: 'Toad’s Pro Tip Floating Pill',
    part: 'Floating Screen Bottom (Overworld Map)',
    category: 'Header & Global Controls',
    whatItDoes: 'Cycles through 32 high-yield Philippine Labor Law study tips and memory analogies.',
    howToUse: 'Click the Toad pill on the map to cycle next tip, share, or copy tip text to clipboard.',
    proTip: 'Hovering over the tip pauses the auto-hide timer so you can read at your own pace.',
    targetTab: 'map',
  },
  {
    id: 'btn-dole-multiplier-modal',
    name: 'DOLE Pay Multiplier Calculator ("DOLE Calc")',
    part: 'Top Navigation Bar & Mobile Drawer',
    category: 'Header & Global Controls',
    whatItDoes: 'Launches the complete DOLE statutory multiplier wage calculator modal with 17-region RTWPB presets.',
    howToUse: 'Click DOLE Calc in the navbar or mobile menu, select your region, and review exact wage breakdowns.',
    proTip: 'Generates copyable official wage slips formatted for class problems and payroll audits.',
    targetTab: 'calculator',
  },
  {
    id: 'btn-research-cohort-modal',
    name: 'Research Cohort Directory ("Research")',
    part: 'Top Navigation Bar & Mobile Drawer',
    category: 'Header & Global Controls',
    whatItDoes: 'Opens the Research Cohort Directory of 9 academic legal fellows with 1-click Bluebook/APA citation generation.',
    howToUse: 'Click Research in the navbar to browse contributors, search topics, and copy academic citations.',
    proTip: 'Use Bluebook citation generation when citing the Labor Code and memory aid in academic papers and class projects.',
    targetTab: 'modules',
  },
  {
    id: 'btn-companion-widget',
    name: 'Interactive Mario Study Companion HUD',
    part: 'Floating Screen Bottom (All Views)',
    category: 'Header & Global Controls',
    whatItDoes: 'Engages you with real-time pet interactions, affection leveling, legal doctrine advice, and 5-min study blitzes.',
    howToUse: 'Click Pet to show love, Feed to boost happiness, Doctrine to ask legal tips, or Switch to change companions.',
    proTip: 'Level up your companion to Level 10 to earn bonus coin multipliers on every studied topic!',
    targetTab: 'modules',
  },
  {
    id: 'btn-statute-lookup-modal',
    name: 'Statute & Codal Jurisprudence Finder Button',
    part: 'Top Bar & Modules Header',
    category: 'Header & Global Controls',
    whatItDoes: 'Launches the instant search modal covering all Labor Code provisions, Republic Acts, and Supreme Court rulings.',
    howToUse: 'Click the Scales / Statute Lookup button, type an article number or keyword, and click Copy or Save Note.',
    proTip: 'Features a text-to-speech listener to read the statutory doctrine aloud.',
    targetTab: 'modules',
  },
  {
    id: 'btn-study-notes-drawer',
    name: 'Study Notes & Doctrine Drawer Toggle',
    part: 'Top Right Navigation Bar',
    category: 'Header & Global Controls',
    whatItDoes: 'Slides open your persistent legal notebook with category tags, quiz errors filter, and plain text export.',
    howToUse: 'Click the Notes button to draft new notes or review pinned rules and missed quiz items.',
    proTip: 'Use the "Export Notes (.txt)" button to bundle all your notes into an offline study sheet.',
    targetTab: 'modules',
  },
  {
    id: 'btn-exam-focus-mode',
    name: 'Exam Focus Mode Fullscreen Button',
    part: 'Modules Command Deck Header',
    category: 'Topic Card & Module Controls',
    whatItDoes: 'Switches the reading environment into an ultra-clean, distraction-free full-screen layout.',
    howToUse: 'Click "Exam Focus Mode" at the top of the modules view. Click Exit Focus Mode to return.',
    proTip: 'Keeps content perfectly centered with zero horizontal scrollbars or clipping.',
    targetTab: 'modules',
  },
  {
    id: 'btn-save-codal-to-notes',
    name: '1-Tap Save Codal to Study Notes Button',
    part: 'Topic Card Statutory Provision Drawer',
    category: 'Topic Card & Module Controls',
    whatItDoes: 'Saves the complete unabridged statutory text of any Labor Code article directly into Study Notes.',
    howToUse: 'Open "Read Provision" in any topic card and click "Save Note".',
    proTip: 'Automatically tags the note as "Statutory Text" with official DOLE citations.',
    targetTab: 'modules',
  },
  {
    id: 'btn-copy-rule-btn',
    name: 'Copy Rule to Clipboard Button',
    part: 'Every Numbered, Definition & Bullet Rule Item',
    category: 'Topic Card & Module Controls',
    whatItDoes: 'Copies the exact rule wording cleanly to clipboard without narrowing or squeezing the text.',
    howToUse: 'Click the "Copy" button located at the bottom-right of any rule item card.',
    proTip: 'Gives visual green "Copied" feedback and plays a pleasant coin chime.',
    targetTab: 'modules',
  },
  {
    id: 'btn-pin-rule-btn',
    name: 'Pin Rule Bookmark Button',
    part: 'Every Numbered, Definition & Bullet Rule Item',
    category: 'Topic Card & Module Controls',
    whatItDoes: 'Bookmarks the specific statutory rule so it appears at the top of your quick review list.',
    howToUse: 'Click the Bookmark ribbon next to the Copy button on any rule item.',
    proTip: 'Pinned rules sync instantly to your Study Notes Drawer.',
    targetTab: 'modules',
  },
  {
    id: 'btn-verbatim-theme-toggle',
    name: 'Statute Codex / Parchment Theme Toggle',
    part: 'Topic Card Statutory Provision Header',
    category: 'Topic Card & Module Controls',
    whatItDoes: 'Switches between antique warm legal Parchment vellum mode, deep Midnight Codex mode, and Law Library Ivory mode.',
    howToUse: 'Click the Sparkles / Theme button inside the verbatim provision box.',
    proTip: 'Parchment mode uses classic legal serif typography with warm gold leaf borders.',
    targetTab: 'modules',
  },
  {
    id: 'btn-verbatim-recitation-toggle',
    name: 'Active Recall Cloze Mode',
    part: 'Verbatim Codal Viewer Toolbar',
    category: 'Topic Card & Module Controls',
    whatItDoes: 'Veils high-yield statutory numbers, percentages, and doctrines as interactive mystery blocks for active recall testing.',
    howToUse: 'Click "Recitation Mode", then tap any ? RECALL ? block to verify the exact codal term.',
    proTip: 'Tap "Reveal All" to check your complete answers before class or exam review.',
    targetTab: 'modules',
  },
  {
    id: 'btn-verbatim-line-numbers',
    name: 'Codal Margin Line Numbers Toggle (#)',
    part: 'Verbatim Codal Viewer Toolbar',
    category: 'Topic Card & Module Controls',
    whatItDoes: 'Displays unselectable line numbers (01, 02, 03...) along the left margin for precise statutory referencing.',
    howToUse: 'Click the # Lines button in the statutory toolbar to toggle line numbering.',
    proTip: 'Copying statutory text automatically excludes line numbers for clean quotation in digests and pleadings.',
    targetTab: 'modules',
  },
  {
    id: 'btn-citations-codex-reader',
    name: 'Master Codex Reader View Mode',
    part: 'Citations & Verbatim Repertory Modal',
    category: 'Citations & Legal Tools',
    whatItDoes: 'Transforms the citations repertory into an authentic continuous Philippine Labor Code Codal book reader.',
    howToUse: 'Click the Codex Reader button in the Citations Repertory top toolbar.',
    proTip: 'Use the fast-jump pill track to leap instantly across all 38 statutory provisions without reloading.',
    targetTab: 'citations',
  },
  {
    id: 'btn-quiz-save-error-btn',
    name: 'Save Error to Notes Button',
    part: 'Quiz Review, Practice Arena & Exam Sim',
    category: 'Quizzes, Games & Shop Controls',
    whatItDoes: 'Converts any missed quiz scenario into a cohesive legal doctrine study note without repetitive colon clutter.',
    howToUse: 'Whenever you miss a quiz item, click "Save Error to Notes" on the result card.',
    proTip: 'Notes are saved with clean legal titles and review takeaways in the Study Notes Drawer.',
    targetTab: 'quiz',
  },
  {
    id: 'btn-courtroom-boss-moves',
    name: 'Courtroom Bowser Boss Legal Actions',
    part: 'Courtroom Boss Battle Modal',
    category: 'Quizzes, Games & Shop Controls',
    whatItDoes: 'Executes turn-based legal objections: 8-Hour Fireball, Maternity Hammer, Non-Diminution Shield, and D.O. 174 Stomp.',
    howToUse: 'Click any legal move on your turn to inflict damage or heal HP.',
    proTip: 'Check Bowser’s statutory violation prompt to trigger a 1.5x critical damage hit!',
    targetTab: 'quiz',
  },
  {
    id: 'btn-toad-shop-perks',
    name: 'Toad Shop 1-Up Life Ring & Star Shield',
    part: 'Toad’s Item Shop',
    category: 'Quizzes, Games & Shop Controls',
    whatItDoes: 'Equips combat bonuses: 1-Up Life Ring (+30 HP in Boss Fight) and Star Shield (-8 damage taken).',
    howToUse: 'Unlock and equip perks in Toad’s Shop using accumulated Gold Coins.',
    proTip: 'Equipped perks display active status badges in the Boss Battle HUD automatically!',
    targetTab: 'shop',
  },
  {
    id: 'btn-koopa-pinball-flippers',
    name: 'Koopa Pinball Manual Flippers & Plunger',
    part: 'GameVault Arcade -> Koopa Pinball',
    category: 'Quizzes, Games & Shop Controls',
    whatItDoes: 'Interactive pinball arcade table with left and right flippers, center drain pit, and target bumpers.',
    howToUse: 'Hold Plunger to launch the ball; tap Left/Right flipper buttons (or press Z and / on keyboard) to keep the ball alive.',
    proTip: 'Hitting the Labor Code Question Blocks triggers multiball coin frenzy!',
    targetTab: 'arcade',
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
  const [activeMode, setActiveMode] = useState<'chapters' | 'modals' | 'directory'>('chapters');
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [selectedModalGuideId, setSelectedModalGuideId] = useState<string>('modal_print_studio');
  const [directorySearch, setDirectorySearch] = useState<string>('');
  const [selectedDirectoryCategory, setSelectedDirectoryCategory] = useState<string>('All');
  const [expandedButtonId, setExpandedButtonId] = useState<string | null>(null);

  // Chapter interactive visualization demo states
  const [demoWorld, setDemoWorld] = useState<number>(1);
  const [demoViewTab, setDemoViewTab] = useState<'all' | 'cards' | 'tables' | 'verbatim'>('cards');
  const [demoClozeRevealed, setDemoClozeRevealed] = useState<boolean>(false);
  const [demoSpeed, setDemoSpeed] = useState<number>(1.0);
  const [demoHolidayMultiplier, setDemoHolidayMultiplier] = useState<number>(200);
  const [demoWageRegion, setDemoWageRegion] = useState<string>('NCR');
  const [demoOtHours, setDemoOtHours] = useState<number>(2);
  const [demoCardFlipped, setDemoCardFlipped] = useState<boolean>(false);
  const [demoLifeline5050, setDemoLifeline5050] = useState<boolean>(false);

  const chapterRailRef = useRef<HTMLDivElement>(null);
  const modalRailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeMode === 'chapters' && chapterRailRef.current) {
      const activeEl = chapterRailRef.current.querySelector<HTMLElement>(
        `[data-testid="walkthrough-step-tab-${stepIdx + 1}"]`
      );
      activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [stepIdx, activeMode]);

  useEffect(() => {
    if (activeMode === 'modals' && modalRailRef.current) {
      const activeEl = modalRailRef.current.querySelector<HTMLElement>(
        `[data-modal-id="${selectedModalGuideId}"]`
      );
      activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedModalGuideId, activeMode]);

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

  const selectedModal =
    MODAL_GUIDE_ITEMS.find((m) => m.id === selectedModalGuideId) || MODAL_GUIDE_ITEMS[0];

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
        <div className="bg-[#0f172a] px-3.5 sm:px-6 py-2.5 sm:py-3 border-b-2 border-slate-700 shrink-0 space-y-2 sm:space-y-0">
          {/* Main Header Row: Title & Badges on Left, Controls on Right */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000] shrink-0">
                <MarioMushroomIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-400 font-mario truncate">
                  <span className="truncate">MARIO LABOR LAW ADVENTURE</span>
                  <span aria-hidden="true" className="shrink-0">·</span>
                  <span className="text-emerald-300 shrink-0">{MAIN_CREATOR_AUTHOR.shortBadge}</span>
                </div>
                <h2 className="text-xs sm:text-base md:text-lg font-black text-white font-display truncate">
                  {activeMode === 'chapters'
                    ? `STEP-BY-STEP TOUR · CHAPTER ${stepIdx + 1} OF ${WALKTHROUGH_CHAPTERS.length}`
                    : activeMode === 'modals'
                    ? `MODAL-BY-MODAL GUIDE · ${selectedModal.name}`
                    : `CONTROL ATLAS (${BUTTON_DIRECTORY.length} CONTROLS)`}
                </h2>
              </div>
            </div>

            {/* Desktop Mode Switcher + Close Buttons */}
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="inline-flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700 h-[44px]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('chapters');
                    marioAudio.playTabSwitch();
                  }}
                  className={`h-[36px] px-2.5 sm:px-3 rounded-lg text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
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
                  data-testid="walkthrough-modal-guide-tab"
                  onClick={() => {
                    setActiveMode('modals');
                    marioAudio.playTabSwitch();
                  }}
                  className={`h-[36px] px-2.5 sm:px-3 rounded-lg text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                    activeMode === 'modals'
                      ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>Modal Guide</span>
                </button>
                <button
                  type="button"
                  data-testid="walkthrough-control-atlas-tab"
                  onClick={() => {
                    setActiveMode('directory');
                    marioAudio.playTabSwitch();
                  }}
                  className={`h-[36px] px-2.5 sm:px-3 rounded-lg text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
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
                className="min-h-[44px] h-[44px] px-3.5 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border-2 border-slate-700 cursor-pointer whitespace-nowrap"
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
                className="min-w-[44px] min-h-[44px] h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Close Button pinned Top-Right */}
            <button
              type="button"
              onClick={() => {
                onCompleteWalkthrough();
                marioAudio.playPipe();
              }}
              aria-label="Close Walkthrough Guide"
              className="sm:hidden min-w-[40px] min-h-[40px] h-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Full-Width 3-Column Equal Mode Switcher Bar */}
          <div className="grid grid-cols-3 sm:hidden bg-slate-950 p-1 rounded-xl border border-slate-700 h-[42px] gap-1 w-full">
            <button
              type="button"
              onClick={() => {
                setActiveMode('chapters');
                marioAudio.playTabSwitch();
              }}
              className={`h-[32px] px-1 rounded-lg text-[11px] font-black transition-all cursor-pointer inline-flex items-center justify-center gap-1 whitespace-nowrap truncate ${
                activeMode === 'chapters'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>Tour</span>
            </button>
            <button
              type="button"
              data-testid="walkthrough-modal-guide-tab"
              onClick={() => {
                setActiveMode('modals');
                marioAudio.playTabSwitch();
              }}
              className={`h-[32px] px-1 rounded-lg text-[11px] font-black transition-all cursor-pointer inline-flex items-center justify-center gap-1 whitespace-nowrap truncate ${
                activeMode === 'modals'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Modals</span>
            </button>
            <button
              type="button"
              data-testid="walkthrough-control-atlas-tab"
              onClick={() => {
                setActiveMode('directory');
                marioAudio.playTabSwitch();
              }}
              className={`h-[32px] px-1 rounded-lg text-[11px] font-black transition-all cursor-pointer inline-flex items-center justify-center gap-1 whitespace-nowrap truncate ${
                activeMode === 'directory'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <MousePointerClick className="w-3.5 h-3.5 shrink-0" />
              <span>Atlas</span>
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

        {/* MODE 1: 14-CHAPTER GUIDED TOUR */}
        {activeMode === 'chapters' && (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
            {/* Left Chapter Rail */}
            <aside className="lg:col-span-4 bg-slate-950/90 border-b lg:border-b-0 lg:border-r border-slate-800 p-3 sm:p-4 shrink-0 lg:overflow-y-auto lg:max-h-[calc(94vh-130px)]">
              <div className="hidden lg:block mb-2.5">
                <span className="text-[10px] font-black uppercase text-slate-400 font-mario">
                  14 STEP-BY-STEP CHAPTERS
                </span>
              </div>
              <div
                ref={chapterRailRef}
                className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-1 lg:pb-0"
              >
                {WALKTHROUGH_CHAPTERS.map((ch, idx) => {
                  const isActive = idx === stepIdx;
                  const isVisited = idx < stepIdx;
                  const cleanTitle = ch.shortTitle.replace(/^\d+\.\s*/, '');
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        setStepIdx(idx);
                        marioAudio.playJump();
                      }}
                      data-testid={`walkthrough-step-tab-${ch.stepNumber}`}
                      className={`px-3 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer shrink-0 lg:w-full min-w-[155px] sm:min-w-[185px] lg:min-w-0 ${
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
                        <span className="text-xs font-bold whitespace-nowrap lg:truncate">{cleanTitle}</span>
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
            <div className="lg:col-span-8 p-4 sm:p-6 space-y-4 overflow-y-auto lg:max-h-[calc(94vh-130px)]">
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
                      className="bg-slate-900 rounded-2xl p-3 sm:p-3.5 border border-slate-700 flex flex-col justify-start space-y-1.5"
                    >
                      <div className="flex items-start gap-1.5">
                        <span className="text-[10px] font-mono font-black text-amber-400 tabular-nums whitespace-nowrap shrink-0 mt-0.5">
                          0{idx + 1}.
                        </span>
                        <h4 className="font-black text-xs sm:text-sm text-white font-display leading-snug">
                          {hl.label}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">{hl.detail}</p>
                    </div>
                  ))}
                </div>

                {/* ==================== INTERACTIVE VISUALIZATION STAGES ==================== */}

                {/* Step 1 Setup Playground */}
                {chapter.id === 'welcome_setup' && (
                  <div className="bg-slate-950/90 rounded-2xl p-4 border-2 border-amber-400/60 space-y-4">
                    <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                      LIVE QUICK SETUP — PERSONALIZE YOUR EXPERIENCE
                    </span>
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
                              {hero.shortName || hero.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 Audio & Header Navigation Preview */}
                {chapter.id === 'header_navigation' && (
                  <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-700 space-y-3">
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

                {/* Step 3 World Map Progression Preview */}
                {chapter.id === 'world_map_progression' && (
                  <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-700 space-y-3">
                    <span className="text-[10px] font-black uppercase text-emerald-400 font-mario block">
                      OVERWORLD MAP STAGE SIMULATOR — 6 LABOR STANDARDS WORLDS
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { num: 1, name: 'Hours & Overtime', badge: 'Arts. 82-90', pct: 100 },
                        { num: 2, name: 'Rest & Holidays', badge: 'Arts. 91-96', pct: 85 },
                        { num: 3, name: 'Wages & D.O. 174', badge: 'Arts. 97-130', pct: 60 },
                        { num: 4, name: 'Special Groups', badge: 'Arts. 131-155', pct: 40 },
                        { num: 5, name: 'Tenure & Dismissal', badge: 'Arts. 297-302', pct: 20 },
                        { num: 6, name: 'Statutory Leaves', badge: 'Special Laws', pct: 90 },
                      ].map((w) => (
                        <button
                          key={w.num}
                          type="button"
                          onClick={() => {
                            setDemoWorld(w.num);
                            marioAudio.playCoin();
                          }}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            demoWorld === w.num
                              ? 'bg-amber-400 text-slate-950 border-black font-black shadow-[0_2px_0_#000]'
                              : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                            <span>WORLD {w.num}</span>
                            <span>{w.pct}%</span>
                          </div>
                          <span className="text-xs font-display font-bold block leading-tight mt-0.5 min-h-[28px] sm:min-h-0 flex items-center">
                            {w.name}
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            {w.badge}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4 Modules Command Deck Preview */}
                {chapter.id === 'modules_command_deck' && (
                  <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-700 space-y-3">
                    <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
                      MODULE VIEW FILTER SWITCHER SIMULATOR
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(['all', 'cards', 'tables', 'verbatim'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => {
                            setDemoViewTab(tab);
                            marioAudio.playTabSwitch();
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase border cursor-pointer transition-all ${
                            demoViewTab === tab
                              ? 'bg-amber-400 text-slate-950 border-black'
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}
                        >
                          {tab === 'all'
                            ? 'Complete View'
                            : tab === 'cards'
                            ? 'Rule Cards'
                            : tab === 'tables'
                            ? 'Comparison Tables'
                            : 'Verbatim Provision'}
                        </button>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed font-semibold">
                      {demoViewTab === 'cards' &&
                        'Filtered strictly to clean, numbered statutory rules and unnumbered definition cards.'}
                      {demoViewTab === 'tables' &&
                        'Filtered to side-by-side matrices like Regular vs Special Holiday rates, and Facility vs Supplement criteria.'}
                      {demoViewTab === 'verbatim' &&
                        'Displays unabridged statutory codifications with antique parchment mode, active recall cloze recitation, line numbering, speech read-aloud, and 1-tap notes saving.'}
                      {demoViewTab === 'all' &&
                        'Displays the complete module: summary, key doctrines, matrices, checklists, and statutory scrolls.'}
                    </div>
                  </div>
                )}

                {/* Step 5 Topic Card Lenses Preview */}
                {chapter.id === 'topic_card_lenses' && (
                  <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-700 space-y-3">
                    <span className="text-[10px] font-black uppercase text-red-400 font-mario block">
                      TOPIC CARD INTERACTION LENS SIMULATOR
                    </span>
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-amber-300">CLOZE ACTIVE RECALL LENS:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setDemoClozeRevealed((prev) => !prev);
                            marioAudio.playPowerUp();
                          }}
                          className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] border border-black cursor-pointer inline-flex items-center gap-1"
                        >
                          {demoClozeRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{demoClozeRevealed ? 'Hide Answer' : 'Reveal Word'}</span>
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                        Under Article 83, the normal hours of work shall not exceed{' '}
                        <span
                          className={`font-black px-1.5 py-0.5 rounded ${
                            demoClozeRevealed
                              ? 'bg-emerald-500 text-slate-950 font-mario'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {demoClozeRevealed ? 'EIGHT (8) HOURS' : '[ CLICK REVEAL ]'}
                        </span>{' '}
                        a day, exclusive of meal intervals.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 6 Scroller & Notes Preview */}
                {chapter.id === 'scroller_and_notes' && (
                  <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-700 space-y-3">
                    <span className="text-[10px] font-black uppercase text-cyan-300 font-mario block">
                      FLOATING AUTO-SCROLL CONTROLLER &amp; NOTE TAGS
                    </span>
                    <div className="flex items-center justify-between gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800 flex-wrap">
                      <span className="text-xs font-bold text-slate-300">Auto-Scroll Speed:</span>
                      <div className="flex items-center gap-1">
                        {[0.5, 1.0, 1.5, 2.0].map((spd) => (
                          <button
                            key={spd}
                            type="button"
                            onClick={() => {
                              setDemoSpeed(spd);
                              marioAudio.playClick();
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-black border cursor-pointer ${
                              demoSpeed === spd
                                ? 'bg-cyan-400 text-slate-950 border-black'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                      <span className="text-slate-400 font-bold">Category Tags:</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold">
                        Key Doctrine
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-600 font-bold">
                        Statutory Limit
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-600 font-bold">
                        Quiz Errors
                      </span>
                    </div>
                  </div>
                )}

                {/* Step 7 Holidays Hub Preview */}
                {chapter.id === 'holidays_hub' && (
                  <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-700 space-y-3">
                    <span className="text-[10px] font-black uppercase text-rose-400 font-mario block">
                      HOLIDAY PAY MULTIPLIER SIMULATOR (P645 DAILY WAGE BASE)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'Unworked Reg. Holiday', rate: 100, mult: '100%' },
                        { label: 'Worked Special Day', rate: 130, mult: '130%' },
                        { label: 'Worked Reg. Holiday', rate: 200, mult: '200%' },
                        { label: 'Double Holiday', rate: 300, mult: '300%' },
                      ].map((h) => (
                        <button
                          key={h.rate}
                          type="button"
                          onClick={() => {
                            setDemoHolidayMultiplier(h.rate);
                            marioAudio.playCoin();
                          }}
                          className={`p-2 rounded-xl border text-center cursor-pointer flex flex-col justify-between ${
                            demoHolidayMultiplier === h.rate
                              ? 'bg-rose-600 text-white border-black font-black'
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}
                        >
                          <span className="text-[10px] block leading-tight min-h-[24px] flex items-center justify-center text-center">{h.label}</span>
                          <span className="text-sm font-black font-mono block mt-0.5">{h.mult}</span>
                          <span className="text-[10px] text-amber-300 font-mono block">
                            P{((645 * h.rate) / 100).toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 8 Regional Wages Preview */}
                {chapter.id === 'regional_wages' && (
                  <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-700 space-y-3">
                    <span className="text-[10px] font-black uppercase text-emerald-300 font-mario block">
                      REGIONAL MINIMUM WAGE MATRIX &amp; WAGE DISTORTION
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { reg: 'NCR', rate: 'P645.00', desc: 'National Capital Region' },
                        { reg: 'Region IV-A', rate: 'P520.00', desc: 'Calabarzon' },
                        { reg: 'Region VII', rate: 'P468.00', desc: 'Central Visayas' },
                        { reg: 'BARMM', rate: 'P361.00', desc: 'Bangsamoro' },
                      ].map((r) => (
                        <button
                          key={r.reg}
                          type="button"
                          onClick={() => {
                            setDemoWageRegion(r.reg);
                            marioAudio.playClick();
                          }}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                            demoWageRegion === r.reg
                              ? 'bg-emerald-500 text-slate-950 border-black font-black'
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}
                        >
                          <span className="text-[10px] block font-mono">{r.reg}</span>
                          <span className={`text-sm font-black font-mono block ${demoWageRegion === r.reg ? 'text-slate-950 font-black' : 'text-amber-300'}`}>
                            {r.rate}
                          </span>
                          <span className="text-[9.5px] text-slate-400 block leading-tight mt-0.5">{r.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 9 Statutory Calculator Preview */}
                {chapter.id === 'statutory_calculator' && (
                  <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-700 space-y-3">
                    <span className="text-[10px] font-black uppercase text-cyan-400 font-mario block">
                      INTERACTIVE OVERTIME PAY CALCULATOR PREVIEW
                    </span>
                    <div className="flex items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 flex-wrap">
                      <div className="space-y-0.5">
                        <span className="text-xs text-slate-300 font-bold">Overtime Hours Worked:</span>
                        <div className="text-sm font-black text-amber-300 font-mono">
                          {demoOtHours} Hours OT = +P{((645 / 8) * 1.25 * demoOtHours).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4].map((hrs) => (
                          <button
                            key={hrs}
                            type="button"
                            onClick={() => {
                              setDemoOtHours(hrs);
                              marioAudio.playCoin();
                            }}
                            className={`w-9 h-9 rounded-xl text-xs font-black border cursor-pointer ${
                              demoOtHours === hrs
                                ? 'bg-cyan-400 text-slate-950 border-black'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {hrs}h
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 10 Mystery Flashcards Preview */}
                {chapter.id === 'mystery_flashcards' && (
                  <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-700 space-y-3">
                    <span className="text-[10px] font-black uppercase text-yellow-300 font-mario block">
                      3D FLIP FLASHCARD &amp; LEITNER MASTERY
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDemoCardFlipped((prev) => !prev);
                        marioAudio.playJump();
                      }}
                      className="w-full p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 border-2 border-amber-400 text-left cursor-pointer transition-transform active:scale-[0.99] shadow-lg"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-300 pb-2 border-b border-slate-800">
                        <span>{demoCardFlipped ? 'CARD REVERSE · STATUTORY DOCTRINE' : 'CARD FRONT · HYPOTHETICAL'}</span>
                        <span className="underline">Click to Flip</span>
                      </div>
                      <p className="text-xs sm:text-sm text-white font-semibold leading-relaxed pt-2">
                        {demoCardFlipped
                          ? 'Article 87 requires an additional compensation equivalent to the regular wage plus at least twenty-five percent (25%) thereof for overtime performed on an ordinary day.'
                          : 'Mario works 10 hours on an ordinary Wednesday in the Mushroom Factory. How much additional compensation is he entitled to receive for the 2 excess hours?'}
                      </p>
                    </button>
                  </div>
                )}

                {/* Step 11 Quizzes & Bowser Boss Preview */}
                {chapter.id === 'quizzes_and_boss' && (
                  <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-700 space-y-3">
                    <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
                      QUIZ BATTLE HUD WITH 50/50 LIFELINE
                    </span>
                    <div className="flex items-center justify-between gap-2 pb-1">
                      <button
                        type="button"
                        onClick={() => {
                          setDemoLifeline5050((prev) => !prev);
                          marioAudio.playPowerUp();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs border border-black cursor-pointer inline-flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{demoLifeline5050 ? 'Reset Choices' : 'Use 50/50 Glasses'}</span>
                      </button>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">
                        Bowser HP: 200 / 200
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                        A. 100% of basic wage
                      </div>
                      <div
                        className={`p-2 rounded-xl border ${
                          demoLifeline5050
                            ? 'opacity-25 line-through bg-slate-950 border-slate-800 text-slate-500'
                            : 'bg-slate-900 border-slate-800 text-slate-200'
                        }`}
                      >
                        B. 110% of basic wage
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 font-bold">
                        C. 125% of regular wage (Correct!)
                      </div>
                      <div
                        className={`p-2 rounded-xl border ${
                          demoLifeline5050
                            ? 'opacity-25 line-through bg-slate-950 border-slate-800 text-slate-500'
                            : 'bg-slate-900 border-slate-800 text-slate-200'
                        }`}
                      >
                        D. 150% of regular wage
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 12 Arcade GameVault Preview */}
                {chapter.id === 'arcade_game_vault' && (
                  <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-700 space-y-3">
                    <span className="text-[10px] font-black uppercase text-emerald-300 font-mario block">
                      POPULAR ARCADE MINI-GAMES (INTERACTIVE RETRO MECHANICS)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {[
                        { title: 'Koopa Pinball Arena', desc: 'Manual flippers & drain pit' },
                        { title: 'Coin Rush Obstacle Dash', desc: 'Dodge labor violations' },
                        { title: 'Mushroom Union Tower Defense', desc: 'Defend picket line' },
                        { title: 'DOLE Payroll Stamping Desk', desc: 'Inspect & approve compliance' },
                        { title: 'Lakitu Skybridge Dash', desc: 'Sprint & leap across bridges' },
                        { title: 'Labor Codal Word Hunt', desc: 'Find statutory terms on grid' },
                      ].map((g) => (
                        <div
                          key={g.title}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 flex flex-col justify-start"
                        >
                          <span className="font-bold text-amber-300 block leading-snug line-clamp-2 min-h-[30px] font-display">
                            {g.title}
                          </span>
                          <span className="text-[10px] text-slate-400 block leading-tight">{g.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 13 Toad Shop Preview */}
                {chapter.id === 'toad_shop_and_perks' && (
                  <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-700 space-y-3">
                    <span className="text-[10px] font-black uppercase text-pink-300 font-mario block">
                      TOAD’S ITEM SHOP PERKS, PETS &amp; CUSTOM FRAMES
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        { name: '1-Up Life Ring', role: '+30 HP in Boss Combat' },
                        { name: 'Star Shield', role: 'Absorbs -8 Boss DMG' },
                        { name: 'Yoshi Companion', role: '+10 Coins per Topic' },
                        { name: 'Royal Gold Frame', role: 'Gilded Card Border' },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1"
                        >
                          <span className="font-black text-amber-400 block font-display">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-300 block">{item.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 14 Print Studio Preview */}
                {chapter.id === 'profile_pdf_offline' && (
                  <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-700 space-y-3">
                    <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                      HIGH-DPI A4 PRINT STUDIO &amp; OFFLINE PWA
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="font-black text-white block">1-Page Summary A4</span>
                        <span className="text-[10px] text-slate-400 block">
                          Formulas, caps &amp; deadlines on single page
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="font-black text-white block">24 Color Themes</span>
                        <span className="text-[10px] text-slate-400 block">
                          From Classic NES to Royal Gold
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="font-black text-white block">20 True-Font Styles</span>
                        <span className="text-[10px] text-slate-400 block">
                          True embedded fonts in PDF binary
                        </span>
                      </div>
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

        {/* MODE 2: DEDICATED MODAL-BY-MODAL GUIDE */}
        {activeMode === 'modals' && (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
            {/* Left Rail: 10 Modals Selector */}
            <aside className="lg:col-span-4 bg-slate-950/90 border-b lg:border-b-0 lg:border-r border-slate-800 p-3 sm:p-4 shrink-0 lg:overflow-y-auto lg:max-h-[calc(94vh-130px)]">
              <span className="text-[10px] font-black uppercase text-slate-400 font-mario block mb-2.5">
                SELECT APP MODAL ({MODAL_GUIDE_ITEMS.length})
              </span>
              <div
                ref={modalRailRef}
                className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-1 lg:pb-0"
              >
                {MODAL_GUIDE_ITEMS.map((m) => {
                  const isActive = m.id === selectedModalGuideId;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      data-modal-id={m.id}
                      onClick={() => {
                        setSelectedModalGuideId(m.id);
                        marioAudio.playJump();
                      }}
                      className={`px-3 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer shrink-0 min-w-[195px] sm:min-w-[225px] lg:min-w-0 lg:w-full ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 border-black font-black shadow-[0_2px_0_#000]'
                          : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-850'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-display font-bold block truncate">
                          {m.name}
                        </span>
                        <span className={`text-[10px] font-mono block ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                          {m.category}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase shrink-0 font-mario ${
                          isActive
                            ? 'bg-slate-950 text-amber-300 border-black'
                            : 'bg-slate-800 text-amber-400 border-slate-700'
                        }`}
                      >
                        {m.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Right Detailed Modal Stage */}
            <div className="lg:col-span-8 p-4 sm:p-6 space-y-4 overflow-y-auto lg:max-h-[calc(94vh-130px)]">
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase font-mario">
                    <span>{selectedModal.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-300">{selectedModal.badge}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
                    {selectedModal.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed mt-1">
                    {selectedModal.summary}
                  </p>
                </div>

                {/* Primary Features */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase text-amber-400 font-mario block">
                    KEY CAPABILITIES &amp; HIGHLIGHTS:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedModal.primaryFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2 text-xs text-slate-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Buttons & Roles */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase text-amber-400 font-mario block">
                    BUTTON-BY-BUTTON MASTER ROLES:
                  </span>
                  <div className="space-y-1.5">
                    {selectedModal.keyButtons.map((btn, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 p-2.5 sm:p-3 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-3 items-start sm:items-center text-xs"
                      >
                        <span className="sm:col-span-4 font-black text-amber-300 font-display flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{btn.name}</span>
                        </span>
                        <span className="sm:col-span-8 text-slate-300 font-medium leading-snug">
                          {btn.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Pro Tip */}
                <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-700 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center shrink-0">
                    <MarioStarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-300 font-mario block">
                      PRO TIP FOR THIS MODAL
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed">
                      {selectedModal.proTip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: BUTTON-BY-BUTTON MASTER DIRECTORY */}
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
            {filteredButtons.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-900 rounded-2xl border-2 border-slate-800 space-y-3">
                <Search className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-black text-white font-display">No Controls Found</h4>
                <p className="text-xs text-slate-400">
                  No matching buttons or switches found for &ldquo;{directorySearch}&rdquo;. Try another search keyword.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDirectorySearch('');
                    setSelectedDirectoryCategory('All');
                    marioAudio.playCoin();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-amber-300 border border-slate-700 text-xs font-bold cursor-pointer hover:bg-slate-700"
                >
                  Clear Search &amp; Filter
                </button>
              </div>
            ) : (
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
                            <span className="text-[10px] text-slate-400 font-semibold inline-flex items-center gap-1">
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
                              <MarioStarIcon className="w-3.5 h-3.5 shrink-0" />
                              <span>PRO STUDY TIP</span>
                            </span>
                            <p className="text-slate-200 leading-relaxed font-semibold">
                              {btn.proTip}
                            </p>
                          </div>

                          {btn.targetTab && (
                            <button
                              type="button"
                              onClick={() => {
                                marioAudio.playPipe();
                                onCompleteWalkthrough(btn.targetTab);
                              }}
                              className="w-full mt-2 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border border-black shadow-[0_2px_0_#000] flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-0.5"
                            >
                              <span>Open {btn.targetTab.toUpperCase()} Section</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modal Bottom Footer Navigation */}
        <div className="bg-[#0f172a] px-3.5 sm:px-6 py-2.5 sm:py-3 border-t-2 border-slate-700 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
          {activeMode === 'chapters' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setStepIdx((prev) => Math.max(0, prev - 1));
                  marioAudio.playCoin();
                }}
                disabled={isFirst}
                className={`min-h-[44px] h-[44px] px-3 sm:px-4 rounded-xl text-xs font-black inline-flex items-center gap-1.5 sm:gap-2 border-2 transition-all shrink-0 ${
                  isFirst
                    ? 'opacity-30 border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700 cursor-pointer active:translate-y-0.5'
                }`}
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>Prev<span className="hidden sm:inline">ious</span></span>
              </button>

              {/* Mobile Centered Step Progression Counter */}
              <div className="sm:hidden text-center flex flex-col items-center justify-center min-w-0 px-1">
                <span className="text-[10px] font-black uppercase text-amber-300 font-mario tabular-nums truncate">
                  CH {stepIdx + 1}/{WALKTHROUGH_CHAPTERS.length}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {progressPct}% Done
                </span>
              </div>

              {/* Desktop Centered Chapter Progress & Dot Steppers */}
              <div className="flex-col items-center gap-1.5 hidden sm:flex">
                <div className="text-xs font-mono font-bold text-amber-300 text-center">
                  Chapter {stepIdx + 1} of {WALKTHROUGH_CHAPTERS.length} · {progressPct}% Complete
                </div>
                <div className="flex items-center gap-1">
                  {WALKTHROUGH_CHAPTERS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setStepIdx(i);
                        marioAudio.playCoin();
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        i === stepIdx
                          ? 'w-6 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                          : i < stepIdx
                          ? 'w-2.5 bg-emerald-400'
                          : 'w-2 bg-slate-700 hover:bg-slate-500'
                      }`}
                      title={`Go to Chapter ${i + 1}`}
                      aria-label={`Jump to Chapter ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isLast ? (
                  <button
                    type="button"
                    onClick={() => handleFinishTour(chapter.targetTab)}
                    className="min-h-[44px] h-[44px] px-3.5 sm:px-5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm border-2 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap animate-pulse active:translate-y-0.5 shrink-0"
                  >
                    <MarioStarIcon className="w-4 h-4 shrink-0" />
                    <span>
                      {alreadyGraduated ? (
                        <>
                          <span className="sm:hidden">Finish</span>
                          <span className="hidden sm:inline">Finish Walkthrough</span>
                        </>
                      ) : (
                        <>
                          <span className="sm:hidden">Finish (+25c)</span>
                          <span className="hidden sm:inline">Finish Guide & Claim +25 Coins</span>
                        </>
                      )}
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
                    className="min-h-[44px] h-[44px] px-3.5 sm:px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm border-2 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap active:translate-y-0.5 shrink-0"
                  >
                    <span>Next<span className="hidden sm:inline"> Chapter</span></span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                )}
              </div>
            </>
          ) : activeMode === 'modals' ? (
            <div className="w-full flex items-center justify-between gap-2.5">
              <span className="text-xs text-slate-400 font-semibold truncate flex-1 min-w-0">
                <span className="text-amber-300 font-bold">{selectedModal.name}</span>
                <span className="hidden sm:inline"> · {selectedModal.keyButtons.length} Primary Controls Documented</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onCompleteWalkthrough();
                  marioAudio.playPipe();
                }}
                className="min-h-[44px] h-[44px] px-3.5 sm:px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] cursor-pointer whitespace-nowrap shrink-0 active:translate-y-0.5"
              >
                Close<span className="hidden sm:inline"> Modal Guide</span>
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between gap-2.5">
              <span className="text-xs text-slate-400 font-semibold truncate flex-1 min-w-0">
                <span className="text-amber-300 font-bold">{MAIN_CREATOR_AUTHOR.shortBadge}</span>
                <span className="hidden sm:inline"> · Inspect every button, tab, and calculation switch across all 6 Worlds.</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onCompleteWalkthrough();
                  marioAudio.playPipe();
                }}
                className="min-h-[44px] h-[44px] px-3.5 sm:px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] cursor-pointer whitespace-nowrap shrink-0 active:translate-y-0.5"
              >
                Close<span className="hidden sm:inline"> Atlas</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
