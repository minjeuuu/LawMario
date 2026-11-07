export type DocumentOrientation = 'landscape' | 'portrait';

export interface Round10ShopCatalogItem {
  id: string;
  name: string;
  section:
    | 'law_chambers'
    | 'arcade_quiz_boosts'
    | 'click_confetti_fx'
    | 'relics_badges'
    | 'extended_gear';
  subType:
    | 'chambers_furniture'
    | 'quiz_lifeline'
    | 'arcade_boost'
    | 'click_fx'
    | 'confetti_fx'
    | 'statutory_relic'
    | 'hud_nameplate'
    | 'extra_companion'
    | 'extra_frame';
  price: number;
  badge: string;
  description: string;
  effectSummary: string;
  isConsumable?: boolean;
  consumableKey?:
    | 'quiz5050'
    | 'quizHint'
    | 'quizShield'
    | 'arcade2x'
    | 'arcadeShield'
    | 'arcadeRadar';
  packQuantity?: number;
  chambersBonusPct?: number;
  chambersSlot?: string;
  fxColorHex?: string;
}

export interface Round10VaultState {
  unlockedIds: string[];
  equippedClickFx: string;
  equippedConfettiFx: string;
  equippedNameplate: string;
  wheelSpinsCount: number;
  inventory: {
    quiz5050: number;
    quizHint: number;
    quizShield: number;
    arcade2x: number;
    arcadeShield: number;
    arcadeRadar: number;
  };
}

export const ROUND10_STORAGE_KEY = 'mario_round10_vault_v1';

export const DEFAULT_ROUND10_VAULT_STATE: Round10VaultState = {
  unlockedIds: ['fx_click_classic_coin', 'fx_confetti_gold'],
  equippedClickFx: 'fx_click_classic_coin',
  equippedConfettiFx: 'fx_confetti_gold',
  equippedNameplate: '',
  wheelSpinsCount: 0,
  inventory: {
    quiz5050: 1,
    quizHint: 1,
    quizShield: 0,
    arcade2x: 1,
    arcadeShield: 1,
    arcadeRadar: 1,
  },
};

export function loadRound10VaultState(
  storage?: Pick<Storage, 'getItem'> | null
): Round10VaultState {
  const target =
    storage ?? (typeof window !== 'undefined' ? window.localStorage : null);
  if (!target) return { ...DEFAULT_ROUND10_VAULT_STATE };
  try {
    const raw = target.getItem(ROUND10_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ROUND10_VAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<Round10VaultState>;
    return {
      unlockedIds: Array.isArray(parsed.unlockedIds)
        ? Array.from(
            new Set([
              'fx_click_classic_coin',
              'fx_confetti_gold',
              ...parsed.unlockedIds,
            ])
          )
        : [...DEFAULT_ROUND10_VAULT_STATE.unlockedIds],
      equippedClickFx:
        typeof parsed.equippedClickFx === 'string'
          ? parsed.equippedClickFx
          : 'fx_click_classic_coin',
      equippedConfettiFx:
        typeof parsed.equippedConfettiFx === 'string'
          ? parsed.equippedConfettiFx
          : 'fx_confetti_gold',
      equippedNameplate:
        typeof parsed.equippedNameplate === 'string'
          ? parsed.equippedNameplate
          : '',
      wheelSpinsCount:
        typeof parsed.wheelSpinsCount === 'number' ? parsed.wheelSpinsCount : 0,
      inventory: {
        quiz5050: Math.max(0, Number(parsed.inventory?.quiz5050 ?? 1)),
        quizHint: Math.max(0, Number(parsed.inventory?.quizHint ?? 1)),
        quizShield: Math.max(0, Number(parsed.inventory?.quizShield ?? 0)),
        arcade2x: Math.max(0, Number(parsed.inventory?.arcade2x ?? 1)),
        arcadeShield: Math.max(0, Number(parsed.inventory?.arcadeShield ?? 1)),
        arcadeRadar: Math.max(0, Number(parsed.inventory?.arcadeRadar ?? 1)),
      },
    };
  } catch {
    return { ...DEFAULT_ROUND10_VAULT_STATE };
  }
}

export function saveRound10VaultState(
  state: Round10VaultState,
  storage?: Pick<Storage, 'setItem'> | null
): void {
  const target =
    storage ?? (typeof window !== 'undefined' ? window.localStorage : null);
  if (!target) return;
  try {
    target.setItem(ROUND10_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

/* ============================================================================
 * 1. LAW CHAMBERS SANCTUARY UPGRADES (18 ITEMS)
 * ========================================================================== */
export const LAW_CHAMBERS_UPGRADE_ITEMS: Round10ShopCatalogItem[] = [
  {
    id: 'chamber_mahogany_desk',
    name: 'Narra & Brass Senior Counsel Desk',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 45,
    badge: 'Desk Lv.1',
    description: 'Hand-carved Philippine Narra desk with inlaid golden scales for drafting pleadings.',
    effectSummary: '+2% Law Chambers Prestige & Sanctuary Visual Upgrade',
    chambersBonusPct: 2,
    chambersSlot: 'Main Desk',
  },
  {
    id: 'chamber_codal_bookshelf',
    name: 'Floor-to-Ceiling P.D. 442 Bookshelf',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 55,
    badge: 'Library',
    description: 'Complete leather-bound SCRA & Labor Code annotated volumes from Worlds 1 to 6.',
    effectSummary: '+2% Law Chambers Prestige & Sanctuary Visual Upgrade',
    chambersBonusPct: 2,
    chambersSlot: 'Back Wall',
  },
  {
    id: 'chamber_golden_scales',
    name: 'Balanced Scales of Social Justice',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 40,
    badge: 'Centerpiece',
    description: 'Gleaming brass balance symbolizing Art. 4 construction in favor of labor.',
    effectSummary: '+1% Law Chambers Prestige',
    chambersBonusPct: 1,
    chambersSlot: 'Desk Top',
  },
  {
    id: 'chamber_espresso_station',
    name: 'Toadista Bar-Prep Espresso Machine',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 50,
    badge: 'Night Owl',
    description: 'Dual-boiler Mushroom roast brewer for late-night Art. 86 graveyard study sessions.',
    effectSummary: '+2% Law Chambers Prestige',
    chambersBonusPct: 2,
    chambersSlot: 'Side Counter',
  },
  {
    id: 'chamber_bankers_lamp',
    name: 'Emerald Glass Juris Banker Lamp',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 35,
    badge: 'Lighting',
    description: 'Warm amber brass reading lamp casting focused light across statutory tables.',
    effectSummary: '+1% Law Chambers Prestige',
    chambersBonusPct: 1,
    chambersSlot: 'Desk Left',
  },
  {
    id: 'chamber_crimson_rug',
    name: 'Royal Peach Courtroom Woven Carpet',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 65,
    badge: 'Flooring',
    description: 'Plush crimson-and-gold crest rug from Princess Peach’s High Tribunal.',
    effectSummary: '+2% Law Chambers Prestige',
    chambersBonusPct: 2,
    chambersSlot: 'Floor',
  },
  {
    id: 'chamber_gavel_stand',
    name: 'NLRC Arbiter Rosewood Gavel & Block',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 48,
    badge: 'Authority',
    description: 'Ceremonial arbiter gavel used to stamp final and executory wage awards.',
    effectSummary: '+1% Law Chambers Prestige',
    chambersBonusPct: 1,
    chambersSlot: 'Desk Right',
  },
  {
    id: 'chamber_starlight_chandelier',
    name: 'Rosalina Observatory Star Chandelier',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 95,
    badge: 'Ceiling',
    description: 'Suspended Luma crystal chandelier illuminating your entire Law Chambers.',
    effectSummary: '+3% Law Chambers Prestige',
    chambersBonusPct: 3,
    chambersSlot: 'Ceiling',
  },
  {
    id: 'chamber_vinyl_jukebox',
    name: '8-Bit Symphonic Vinyl Gramophone',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 70,
    badge: 'Acoustic',
    description: 'Spins warm chiptune & lo-fi courtroom vinyls inside your private chambers.',
    effectSummary: '+2% Law Chambers Prestige',
    chambersBonusPct: 2,
    chambersSlot: 'Corner Left',
  },
  {
    id: 'chamber_koopa_aquarium',
    name: 'Cheep-Cheep Coral Reef Aquarium',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 80,
    badge: 'Zen Tank',
    description: 'Tranquil sunlit reef tank that lowers study stress between Boss Battles.',
    effectSummary: '+2% Law Chambers Prestige',
    chambersBonusPct: 2,
    chambersSlot: 'East Alcove',
  },
  {
    id: 'chamber_wingback_chair',
    name: 'Chief Justice Tufted Leather Throne',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 85,
    badge: 'Seating',
    description: 'Ergonomic oxblood leather executive chair built for 4-hour mock Bar marathons.',
    effectSummary: '+2% Law Chambers Prestige',
    chambersBonusPct: 2,
    chambersSlot: 'Executive Seat',
  },
  {
    id: 'chamber_stained_glass',
    name: 'Mushroom Charter Stained-Glass Window',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 110,
    badge: 'Archway',
    description: 'Cathedral-grade stained glass depicting the Six Worlds of Labor Standards.',
    effectSummary: '+3% Law Chambers Prestige',
    chambersBonusPct: 3,
    chambersSlot: 'Center Window',
  },
  {
    id: 'chamber_yoshi_bonsai',
    name: 'Yoshi Island Golden Fruit Bonsai',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 38,
    badge: 'Botanical',
    description: 'Living miniature fruit tree bringing calm island energy to your study table.',
    effectSummary: '+1% Law Chambers Prestige',
    chambersBonusPct: 1,
    chambersSlot: 'Window Sill',
  },
  {
    id: 'chamber_question_safe',
    name: 'Golden [?] Block Coin Vault Safe',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 90,
    badge: 'Treasury',
    description: 'Reinforced brass vault housing your earned coins, relics, and Bar medals.',
    effectSummary: '+2% Law Chambers Prestige',
    chambersBonusPct: 2,
    chambersSlot: 'Vault Nook',
  },
  {
    id: 'chamber_constitution_frame',
    name: 'Framed Art. XIII Sec. 3 Calligraphic Scroll',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 60,
    badge: 'Wall Crest',
    description: 'Gold-leaf calligraphy of the Full Protection to Labor constitutional mandate.',
    effectSummary: '+2% Law Chambers Prestige',
    chambersBonusPct: 2,
    chambersSlot: 'West Wall',
  },
  {
    id: 'chamber_wage_globe',
    name: 'Illuminated 17-Region Wage Atlas Globe',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 75,
    badge: 'Cartography',
    description: 'Interactive brass globe charting NCR to BARMM Regional Tripartite Wage Boards.',
    effectSummary: '+2% Law Chambers Prestige',
    chambersBonusPct: 2,
    chambersSlot: 'Pedestal',
  },
  {
    id: 'chamber_neon_bar_sign',
    name: 'Warm Amber "FUTURE COUNSEL" Studio Sign',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 52,
    badge: 'Motivation',
    description: 'Crisp studio placard reminding you of the oath waiting at the finish flagpole.',
    effectSummary: '+1% Law Chambers Prestige',
    chambersBonusPct: 1,
    chambersSlot: 'Upper Frieze',
  },
  {
    id: 'chamber_marble_pillars',
    name: 'Twin Doric Marble Tribunal Columns',
    section: 'law_chambers',
    subType: 'chambers_furniture',
    price: 135,
    badge: 'Grand Hall',
    description: 'Fluted classical Supreme Court columns framing your completed Law Sanctuary.',
    effectSummary: '+4% Law Chambers Prestige',
    chambersBonusPct: 4,
    chambersSlot: 'Grand Entrance',
  },
];

/* ============================================================================
 * 2. ARCADE & QUIZ CONSUMABLE TOKENS & LIFELINES (20 ITEMS)
 * ========================================================================== */
export const ARCADE_AND_QUIZ_CONSUMABLE_ITEMS: Round10ShopCatalogItem[] = [
  {
    id: 'token_quiz_5050_single',
    name: '50/50 Distractor Zapper (x2 Uses)',
    section: 'arcade_quiz_boosts',
    subType: 'quiz_lifeline',
    price: 20,
    badge: 'Quiz Lifeline',
    description: 'Eliminates 2 incorrect options immediately on any Practice, Quick, or Boss question.',
    effectSummary: '+2 50/50 Lifeline Charges in Quest & Boss Battles',
    isConsumable: true,
    consumableKey: 'quiz5050',
    packQuantity: 2,
  },
  {
    id: 'token_quiz_5050_pack',
    name: '50/50 Fireball Bundle (x6 Uses)',
    section: 'arcade_quiz_boosts',
    subType: 'quiz_lifeline',
    price: 50,
    badge: 'Value Pack',
    description: 'Stockpile six 50/50 option eliminators for marathon Bar Simulation runs.',
    effectSummary: '+6 50/50 Lifeline Charges',
    isConsumable: true,
    consumableKey: 'quiz5050',
    packQuantity: 6,
  },
  {
    id: 'token_quiz_hint_single',
    name: "Toad's Statutory Hint Scroll (x2 Uses)",
    section: 'arcade_quiz_boosts',
    subType: 'quiz_lifeline',
    price: 22,
    badge: 'Quiz Hint',
    description: 'Reveals the governing Labor Code Article & statutory doctrine before you submit.',
    effectSummary: '+2 Statutory Hint Scrolls in Quest',
    isConsumable: true,
    consumableKey: 'quizHint',
    packQuantity: 2,
  },
  {
    id: 'token_quiz_hint_pack',
    name: 'Codal Whisperer Scroll Case (x6 Uses)',
    section: 'arcade_quiz_boosts',
    subType: 'quiz_lifeline',
    price: 55,
    badge: '6x Scrolls',
    description: 'Six pre-paid statutory whispers from Counsel Toad during tough Exam Prep questions.',
    effectSummary: '+6 Statutory Hint Scrolls',
    isConsumable: true,
    consumableKey: 'quizHint',
    packQuantity: 6,
  },
  {
    id: 'token_quiz_shield_single',
    name: '1-Up Mistake Shield Heart (x2 Uses)',
    section: 'arcade_quiz_boosts',
    subType: 'quiz_lifeline',
    price: 30,
    badge: 'Boss Armor',
    description: 'Blocks heart loss & combo reset if you miss a timed Bowser Boss Battle question!',
    effectSummary: '+2 Mistake Shield Charges',
    isConsumable: true,
    consumableKey: 'quizShield',
    packQuantity: 2,
  },
  {
    id: 'token_quiz_shield_pack',
    name: 'Royal Aegis Heart Crate (x5 Uses)',
    section: 'arcade_quiz_boosts',
    subType: 'quiz_lifeline',
    price: 68,
    badge: '5x Shields',
    description: 'Five emergency Boss Battle shields for high-stakes Exam Prep Castle runs.',
    effectSummary: '+5 Mistake Shield Charges',
    isConsumable: true,
    consumableKey: 'quizShield',
    packQuantity: 5,
  },
  {
    id: 'token_arcade_2x_single',
    name: '2x Arcade Payout Ticket (x2 Runs)',
    section: 'arcade_quiz_boosts',
    subType: 'arcade_boost',
    price: 20,
    badge: 'Arcade 2x',
    description: 'Doubles all coins earned in your next 2 Arcade Game runs inside the Game Vault!',
    effectSummary: '+2 Arcade 2x Payout Tickets',
    isConsumable: true,
    consumableKey: 'arcade2x',
    packQuantity: 2,
  },
  {
    id: 'token_arcade_2x_pack',
    name: 'VIP Arcade High-Roller Booklet (x6 Runs)',
    section: 'arcade_quiz_boosts',
    subType: 'arcade_boost',
    price: 52,
    badge: '6x VIP Runs',
    description: 'Six double-payout arcade tickets for Skybridge Dash, Stamp Desk, Pinball & Tower Defense.',
    effectSummary: '+6 Arcade 2x Payout Tickets',
    isConsumable: true,
    consumableKey: 'arcade2x',
    packQuantity: 6,
  },
  {
    id: 'token_arcade_shield_single',
    name: 'Super Mushroom Arcade Armor (x2 Runs)',
    section: 'arcade_quiz_boosts',
    subType: 'arcade_boost',
    price: 18,
    badge: 'Extra HP',
    description: 'Grants +1 bonus life/heart or +20 fortress HP when activated inside the Arcade Vault.',
    effectSummary: '+2 Arcade Armor Tokens',
    isConsumable: true,
    consumableKey: 'arcadeShield',
    packQuantity: 2,
  },
  {
    id: 'token_arcade_shield_pack',
    name: 'Iron Koopa Shell Garrison Pack (x6 Runs)',
    section: 'arcade_quiz_boosts',
    subType: 'arcade_boost',
    price: 46,
    badge: '6x Armor',
    description: 'Six durability boosts for Action Platformers, Payroll Desk & Union Tower Defense.',
    effectSummary: '+6 Arcade Armor Tokens',
    isConsumable: true,
    consumableKey: 'arcadeShield',
    packQuantity: 6,
  },
  {
    id: 'token_arcade_radar_single',
    name: 'Lakitu Inspector Lens & Radar (x3 Uses)',
    section: 'arcade_quiz_boosts',
    subType: 'arcade_boost',
    price: 18,
    badge: 'Game Hint',
    description: 'Highlights hidden letters in Word Hunt, flags suspect payslips, or grants bonus tower gold!',
    effectSummary: '+3 Arcade Radar & Hint Charges',
    isConsumable: true,
    consumableKey: 'arcadeRadar',
    packQuantity: 3,
  },
  {
    id: 'token_arcade_radar_pack',
    name: 'Observatory Tactical Radar Case (x8 Uses)',
    section: 'arcade_quiz_boosts',
    subType: 'arcade_boost',
    price: 42,
    badge: '8x Radars',
    description: 'Eight tactical inspection charges across all Puzzle, Sim & Strategy Arcade games.',
    effectSummary: '+8 Arcade Radar & Hint Charges',
    isConsumable: true,
    consumableKey: 'arcadeRadar',
    packQuantity: 8,
  },
  {
    id: 'token_care_starter_kit',
    name: 'Statutory Scholar Tactical Supply Kit',
    section: 'arcade_quiz_boosts',
    subType: 'quiz_lifeline',
    price: 40,
    badge: 'Combo Kit',
    description: 'Balanced supply drop adding +2 50/50 Zappers and +1 Statutory Hint Scroll.',
    effectSummary: '+2 50/50 Charges + Bonus Utility',
    isConsumable: true,
    consumableKey: 'quiz5050',
    packQuantity: 3,
  },
  {
    id: 'token_arcade_champion_chest',
    name: 'Arcade Champion Token Pouch',
    section: 'arcade_quiz_boosts',
    subType: 'arcade_boost',
    price: 44,
    badge: 'Pro Gamer',
    description: 'Stocks +4 Arcade 2x Payout Tickets for rapid coin farming in non-quiz games.',
    effectSummary: '+4 Arcade 2x Payout Tickets',
    isConsumable: true,
    consumableKey: 'arcade2x',
    packQuantity: 4,
  },
  {
    id: 'token_payroll_stamp_ink',
    name: 'DOLE Inspector Gold Stamp Refill (x4)',
    section: 'arcade_quiz_boosts',
    subType: 'arcade_boost',
    price: 25,
    badge: 'Stamp Desk',
    description: 'Four Lakitu Radar charges usable on the DOLE Wage & Payroll Stamp Desk.',
    effectSummary: '+4 Arcade Radar Charges',
    isConsumable: true,
    consumableKey: 'arcadeRadar',
    packQuantity: 4,
  },
  {
    id: 'token_union_war_chest',
    name: 'Union Tower Defense War Chest (x4)',
    section: 'arcade_quiz_boosts',
    subType: 'arcade_boost',
    price: 28,
    badge: 'Defense Boost',
    description: 'Four Arcade Armor charges to reinforce Worker Treasury HP in Tower Defense.',
    effectSummary: '+4 Arcade Armor Charges',
    isConsumable: true,
    consumableKey: 'arcadeShield',
    packQuantity: 4,
  },
  {
    id: 'token_word_hunt_compass',
    name: 'Codal Word-Hunt Magnifier Pack (x5)',
    section: 'arcade_quiz_boosts',
    subType: 'arcade_boost',
    price: 26,
    badge: 'Word Puzzle',
    description: 'Five instant hint reveals for Bar Codal Word Hunt without spending per-turn coins.',
    effectSummary: '+5 Arcade Radar Charges',
    isConsumable: true,
    consumableKey: 'arcadeRadar',
    packQuantity: 5,
  },
  {
    id: 'token_boss_tribunal_writ',
    name: 'Supreme Writ of Certiorari Pack (x4)',
    section: 'arcade_quiz_boosts',
    subType: 'quiz_lifeline',
    price: 48,
    badge: 'Certiorari',
    description: 'Four emergency Mistake Shields to overturn fatal errors against Employer Bowser.',
    effectSummary: '+4 Mistake Shield Charges',
    isConsumable: true,
    consumableKey: 'quizShield',
    packQuantity: 4,
  },
  {
    id: 'token_counsel_briefcase',
    name: 'Senior Partner Litigation Briefcase (x8)',
    section: 'arcade_quiz_boosts',
    subType: 'quiz_lifeline',
    price: 72,
    badge: 'Mega Briefcase',
    description: 'Eight Statutory Hint Scrolls with instant Labor Code citations during quizzes.',
    effectSummary: '+8 Statutory Hint Scrolls',
    isConsumable: true,
    consumableKey: 'quizHint',
    packQuantity: 8,
  },
  {
    id: 'token_grand_bar_arsenal',
    name: 'Grand Bar Week Emergency Arsenal (x10)',
    section: 'arcade_quiz_boosts',
    subType: 'quiz_lifeline',
    price: 85,
    badge: '10x Zappers',
    description: 'Ten 50/50 Distractor Zappers for relentless full-syllabus practice sessions.',
    effectSummary: '+10 50/50 Lifeline Charges',
    isConsumable: true,
    consumableKey: 'quiz5050',
    packQuantity: 10,
  },
];

/* ============================================================================
 * 3. INTERACTIVE CLICK SPARKS & CONFETTI FX COSMETICS (16 ITEMS)
 * ========================================================================== */
export const CLICK_AND_CONFETTI_FX_ITEMS: Round10ShopCatalogItem[] = [
  {
    id: 'fx_click_classic_coin',
    name: 'Classic Gold Coin Spark (Default)',
    section: 'click_confetti_fx',
    subType: 'click_fx',
    price: 0,
    badge: 'Click FX',
    description: 'Crisp golden coin ring ripple whenever you click buttons across the app.',
    effectSummary: 'Equips Golden Coin Click Burst',
    fxColorHex: '#fbbf24',
  },
  {
    id: 'fx_click_super_star',
    name: 'Super Star Rainbow Prism Click',
    section: 'click_confetti_fx',
    subType: 'click_fx',
    price: 35,
    badge: 'Click FX',
    description: 'Radiant starlight prism sparks burst from your cursor on interactive clicks.',
    effectSummary: 'Equips Starlight Click Burst',
    fxColorHex: '#fde047',
  },
  {
    id: 'fx_click_fireball',
    name: 'Fire Flower Ember Pop Click',
    section: 'click_confetti_fx',
    subType: 'click_fx',
    price: 38,
    badge: 'Click FX',
    description: 'Warm crimson-orange fireball embers flare on every tap or button press.',
    effectSummary: 'Equips Fireball Click Burst',
    fxColorHex: '#f97316',
  },
  {
    id: 'fx_click_ice_frost',
    name: 'Ice Flower Crystal Frost Click',
    section: 'click_confetti_fx',
    subType: 'click_fx',
    price: 38,
    badge: 'Click FX',
    description: 'Cool glacial cyan frost rings bloom cleanly under your pointer.',
    effectSummary: 'Equips Ice Crystal Click Burst',
    fxColorHex: '#38bdf8',
  },
  {
    id: 'fx_click_emerald_pipe',
    name: 'Warp Pipe Emerald Sonic Ripple',
    section: 'click_confetti_fx',
    subType: 'click_fx',
    price: 42,
    badge: 'Click FX',
    description: 'Vibrant Mushroom Kingdom emerald rings expand on button clicks.',
    effectSummary: 'Equips Emerald Warp Click Burst',
    fxColorHex: '#10b981',
  },
  {
    id: 'fx_click_gavel_gold',
    name: 'Supreme Court Brass Gavel Seal Click',
    section: 'click_confetti_fx',
    subType: 'click_fx',
    price: 48,
    badge: 'Click FX',
    description: 'Authoritative burgundy-and-brass judicial seal pulse on every click.',
    effectSummary: 'Equips Judicial Seal Click Burst',
    fxColorHex: '#e11d48',
  },
  {
    id: 'fx_click_yoshi_lime',
    name: 'Yoshi Egg Lime Polka Pop',
    section: 'click_confetti_fx',
    subType: 'click_fx',
    price: 40,
    badge: 'Click FX',
    description: 'Cheerful Dinosaur Land lime-green polka sparks on every interaction.',
    effectSummary: 'Equips Yoshi Lime Click Burst',
    fxColorHex: '#84cc16',
  },
  {
    id: 'fx_click_cosmic_luma',
    name: 'Rosalina Nebula Stardust Click',
    section: 'click_confetti_fx',
    subType: 'click_fx',
    price: 55,
    badge: 'Click FX',
    description: 'Deep observatory violet-silver stardust rings trail your clicks.',
    effectSummary: 'Equips Cosmic Luma Click Burst',
    fxColorHex: '#a855f7',
  },
  {
    id: 'fx_confetti_gold',
    name: 'Mushroom Treasury Gold Confetti (Default)',
    section: 'click_confetti_fx',
    subType: 'confetti_fx',
    price: 0,
    badge: 'Confetti FX',
    description: 'Classic gold & crimson celebration confetti on purchases and mastery.',
    effectSummary: 'Equips Treasury Gold Confetti',
    fxColorHex: '#f59e0b',
  },
  {
    id: 'fx_confetti_sakura',
    name: 'Peach Garden Sakura Blossom Shower',
    section: 'click_confetti_fx',
    subType: 'confetti_fx',
    price: 45,
    badge: 'Confetti FX',
    description: 'Soft rose, coral, and pearl petals celebrate your completed modules & purchases.',
    effectSummary: 'Equips Sakura Blossom Confetti',
    fxColorHex: '#f472b6',
  },
  {
    id: 'fx_confetti_emerald',
    name: '1-Up Emerald & Mint Victory Burst',
    section: 'click_confetti_fx',
    subType: 'confetti_fx',
    price: 45,
    badge: 'Confetti FX',
    description: 'Crisp emerald, lime, and gold streamers erupt on celebration moments.',
    effectSummary: 'Equips 1-Up Emerald Confetti',
    fxColorHex: '#22c55e',
  },
  {
    id: 'fx_confetti_galaxy',
    name: 'Comet Observatory Astral Confetti',
    section: 'click_confetti_fx',
    subType: 'confetti_fx',
    price: 55,
    badge: 'Confetti FX',
    description: 'Indigo, cyan, and starlight silver confetti inspired by Super Mario Galaxy.',
    effectSummary: 'Equips Astral Galaxy Confetti',
    fxColorHex: '#6366f1',
  },
  {
    id: 'fx_confetti_royal_crimson',
    name: 'Bar Topnotcher Crimson & Gold Foil',
    section: 'click_confetti_fx',
    subType: 'confetti_fx',
    price: 60,
    badge: 'Confetti FX',
    description: 'Ceremonial Supreme Court crimson & metallic 24k gold foil celebration.',
    effectSummary: 'Equips Topnotcher Foil Confetti',
    fxColorHex: '#dc2626',
  },
  {
    id: 'fx_confetti_fire_ice',
    name: 'Twin-Element Fire & Ice Volley',
    section: 'click_confetti_fx',
    subType: 'confetti_fx',
    price: 52,
    badge: 'Confetti FX',
    description: 'Blazing orange and glacial sky-blue confetti burst in tandem.',
    effectSummary: 'Equips Fire & Ice Confetti',
    fxColorHex: '#0ea5e9',
  },
  {
    id: 'fx_confetti_sarasaland',
    name: 'Daisy Sarasaland Citrus Sunburst',
    section: 'click_confetti_fx',
    subType: 'confetti_fx',
    price: 48,
    badge: 'Confetti FX',
    description: 'Sunny tangerine, marigold, and ivory ribbons light up the screen.',
    effectSummary: 'Equips Sunburst Confetti',
    fxColorHex: '#fb923c',
  },
  {
    id: 'fx_confetti_rainbow_star',
    name: 'Rainbow Road Grand Prix Finale',
    section: 'click_confetti_fx',
    subType: 'confetti_fx',
    price: 75,
    badge: 'Confetti FX',
    description: 'Full-spectrum championship confetti worthy of 100% 6-World Bar Mastery.',
    effectSummary: 'Equips Rainbow Finale Confetti',
    fxColorHex: '#ec4899',
  },
];

/* ============================================================================
 * 4. COLLECTIBLE STATUTORY RELICS & HUD NAMEPLATES (34 ITEMS)
 * ========================================================================== */
export const RELICS_AND_NAMEPLATES_ITEMS: Round10ShopCatalogItem[] = [
  // 20 Statutory Museum Relics
  {
    id: 'relic_pd442_first_edition',
    name: '1974 P.D. No. 442 Illuminated Vellum Scroll',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 65,
    badge: 'World 1 Relic',
    description: 'Archival museum replica of the foundational Labor Code of the Philippines.',
    effectSummary: 'Unlocks Archival Relic in Vault Collection',
  },
  {
    id: 'relic_four_fold_compass',
    name: 'Brass Four-Fold Control Test Compass',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 55,
    badge: 'Jurisprudence',
    description: 'Engraved with Selection, Payment of Wages, Power of Dismissal & Control.',
    effectSummary: 'Unlocks Jurisprudence Relic',
  },
  {
    id: 'relic_overtime_chronometer',
    name: 'Art. 87 Golden 125% Pocket Chronometer',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 58,
    badge: 'Hours Relic',
    description: 'Precision railway watch calibrated to 8 regular hours and +25% OT.',
    effectSummary: 'Unlocks World 1 Timepiece Relic',
  },
  {
    id: 'relic_nightshift_lantern',
    name: 'Luigi’s 10PM–6AM Moonstone Lantern',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 52,
    badge: 'Art. 86 NSD',
    description: 'Glows softly during graveyard hours to commemorate the +10% Night Shift rule.',
    effectSummary: 'Unlocks Graveyard Shift Relic',
  },
  {
    id: 'relic_double_holiday_chalice',
    name: '300% Araw ng Kagitingan Golden Goblet',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 70,
    badge: 'World 2 Relic',
    description: 'Celebrates the rare Double Regular Holiday 300% (390% on Rest Day) pay rule.',
    effectSummary: 'Unlocks Holiday Multiplier Relic',
  },
  {
    id: 'relic_pd851_medallion',
    name: 'P.D. 851 Dec. 24 Thirteenth-Month Medallion',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 60,
    badge: 'Bonus Relic',
    description: 'Stamped with "Basic Salary ÷ 12 · Mandatory Before December 24".',
    effectSummary: 'Unlocks 13th Month Pay Relic',
  },
  {
    id: 'relic_ra11360_bell',
    name: 'R.A. 11360 100% Service Charge Silver Bell',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 54,
    badge: 'Hotel & Dining',
    description: 'Hotel concierge bell honoring 100% distribution to covered rank-and-file.',
    effectSummary: 'Unlocks Service Charge Relic',
  },
  {
    id: 'relic_do174_wax_seal',
    name: 'DOLE D.O. 174-17 ₱5M Capitalization Seal',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 75,
    badge: 'World 3 Relic',
    description: 'Heavy crimson wax stamper used to void prohibited Labor-Only Contracting.',
    effectSummary: 'Unlocks Anti-Endo Seal Relic',
  },
  {
    id: 'relic_pineda_abacus',
    name: 'Jade Pineda Wage Distortion Abacus',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 68,
    badge: 'Art. 124',
    description: 'Calculates (Minimum Wage ÷ Actual Salary) × Prescribed Increase with precision.',
    effectSummary: 'Unlocks Wage Distortion Relic',
  },
  {
    id: 'relic_mabeza_tray',
    name: 'Mabeza Meals & Facilities Balance Scale',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 56,
    badge: 'Supplements',
    description: 'Distinguishes deductible employee Facilities (70% fair value) from Supplements.',
    effectSummary: 'Unlocks Mabeza Doctrine Relic',
  },
  {
    id: 'relic_kasambahay_hearth',
    name: 'R.A. 10361 Batas Kasambahay Golden Key',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 62,
    badge: 'World 4 Relic',
    description: 'Honors 8h daily aggregate rest, SSS/PhilHealth/Pag-IBIG & 5-day SIL rights.',
    effectSummary: 'Unlocks Kasambahay Charter Relic',
  },
  {
    id: 'relic_ra9231_shield',
    name: 'R.A. 9231 Child Protection Star Shield',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 64,
    badge: 'Youth Rights',
    description: 'Enforces the 4h/day (20h/wk) cap under 15 and strict 8PM–6AM night work ban.',
    effectSummary: 'Unlocks Child Protection Relic',
  },
  {
    id: 'relic_magna_carta_pwd_crest',
    name: 'R.A. 7277 Equal 100% Wage Sapphire Crest',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 60,
    badge: 'PWD Equality',
    description: 'Symbolizes 100% statutory minimum wage & 5% government reserve positions.',
    effectSummary: 'Unlocks Equal Opportunity Relic',
  },
  {
    id: 'relic_twin_notice_quill',
    name: 'King v. Goya Twin-Notice Golden Feather Quill',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 72,
    badge: 'World 5 Relic',
    description: 'Inscribed with "5 Calendar Days to Explain · Ample Opportunity to Be Heard".',
    effectSummary: 'Unlocks Due Process Relic',
  },
  {
    id: 'relic_agabon_gavel',
    name: 'Agabon Nominal Damages Obsidian Mallet',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 78,
    badge: '₱30k / ₱50k',
    description: 'Marks the ₱30,000 (Just Cause) vs ₱50,000 (Authorized Cause) procedural rule.',
    effectSummary: 'Unlocks Agabon Jurisprudence Relic',
  },
  {
    id: 'relic_ra7641_hourglass',
    name: 'R.A. 7641 22.5-Day Retirement Hourglass',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 82,
    badge: 'Art. 302',
    description: '15 days + 5 days SIL + 2.5 days (1/12 of 13th month) = 22.5 days per year!',
    effectSummary: 'Unlocks Retirement Formula Relic',
  },
  {
    id: 'relic_ra11058_helmet',
    name: 'R.A. 11058 OSH Imminent Danger Gold Hardhat',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 64,
    badge: 'Safety Relic',
    description: 'Honors the worker’s right to refuse unsafe work and employer-paid PPE.',
    effectSummary: 'Unlocks Workplace Safety Relic',
  },
  {
    id: 'relic_ra11210_crown',
    name: 'R.A. 11210 105-Day Maternal Ruby Tiara',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 85,
    badge: 'World 6 Relic',
    description: '105 days paid live childbirth (+15d solo parent; up to 7d transferable).',
    effectSummary: 'Unlocks Expanded Maternity Relic',
  },
  {
    id: 'relic_safe_spaces_lantern',
    name: 'R.A. 11313 Bawal Bastos Guardian Torch',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 66,
    badge: 'Safe Spaces',
    description: 'Zero-tolerance beacon against peer, subordinate, and superior harassment.',
    effectSummary: 'Unlocks Safe Spaces Relic',
  },
  {
    id: 'relic_telecommuting_crystal',
    name: 'R.A. 11165 Fair Treatment Work-From-Home Prism',
    section: 'relics_badges',
    subType: 'statutory_relic',
    price: 62,
    badge: 'Digital Labor',
    description: 'Guarantees telecommuting workers equal overtime, holiday, and leave rights.',
    effectSummary: 'Unlocks Telecommuting Relic',
  },
  // 14 HUD Nameplate Badges
  {
    id: 'plate_future_bar_topnotcher',
    name: 'Nameplate: FUTURE BAR TOPNOTCHER',
    section: 'relics_badges',
    subType: 'hud_nameplate',
    price: 45,
    badge: 'Nameplate',
    description: 'Displays "FUTURE BAR TOPNOTCHER" on your Shop & Profile Honor Banner.',
    effectSummary: 'Equips Honor Nameplate Title',
  },
  {
    id: 'plate_guardian_of_art4',
    name: 'Nameplate: GUARDIAN OF ART. 4 LABOR CODE',
    section: 'relics_badges',
    subType: 'hud_nameplate',
    price: 45,
    badge: 'Nameplate',
    description: 'Proclaims your fidelity to resolving all doubts in favor of labor.',
    effectSummary: 'Equips Honor Nameplate Title',
  },
  {
    id: 'plate_endo_slayer',
    name: 'Nameplate: D.O. 174 ENDO SLAYER',
    section: 'relics_badges',
    subType: 'hud_nameplate',
    price: 50,
    badge: 'Nameplate',
    description: 'Awarded to inspectors who bust Labor-Only Ghost Contractors on sight.',
    effectSummary: 'Equips Honor Nameplate Title',
  },
  {
    id: 'plate_overtime_architect',
    name: 'Nameplate: 390% PAYROLL GRANDMASTER',
    section: 'relics_badges',
    subType: 'hud_nameplate',
    price: 55,
    badge: 'Nameplate',
    description: 'For scholars who compute Double Holiday Rest Day OT without blinking.',
    effectSummary: 'Equips Honor Nameplate Title',
  },
  {
    id: 'plate_nlrc_chief_arbiter',
    name: 'Nameplate: GRAND ARBITER OF MUSHROOM COURT',
    section: 'relics_badges',
    subType: 'hud_nameplate',
    price: 65,
    badge: 'Nameplate',
    description: 'Distinguished courtroom title recognized across Worlds 1 to 6.',
    effectSummary: 'Equips Honor Nameplate Title',
  },
  {
    id: 'plate_kasambahay_champion',
    name: 'Nameplate: DEFENDER OF SPECIAL WORKERS',
    section: 'relics_badges',
    subType: 'hud_nameplate',
    price: 48,
    badge: 'Nameplate',
    description: 'Honors mastery of Kasambahay, Homeworkers, Night Workers & Apprentice rules.',
    effectSummary: 'Equips Honor Nameplate Title',
  },
  {
    id: 'plate_world6_sage',
    name: 'Nameplate: MASTER OF STATUTORY LEAVES',
    section: 'relics_badges',
    subType: 'hud_nameplate',
    price: 52,
    badge: 'Nameplate',
    description: 'Signifies 100% fluency across SIL, Maternity, Paternity, VAWC & MCW leaves.',
    effectSummary: 'Equips Honor Nameplate Title',
  },
  {
    id: 'plate_amicus_curiae',
    name: 'Nameplate: AMICUS CURIAE · SUPREME BENCH',
    section: 'relics_badges',
    subType: 'hud_nameplate',
    price: 75,
    badge: 'Nameplate',
    description: 'Prestigious Friend of the Court title for elite Exam Prep challengers.',
    effectSummary: 'Equips Honor Nameplate Title',
  },
  {
    id: 'plate_solgen_advocate',
    name: 'Nameplate: SOCIAL JUSTICE TRIBUNE',
    section: 'relics_badges',
    subType: 'hud_nameplate',
    price: 60,
    badge: 'Nameplate',
    description: 'Inspired by Calalang v. Williams — humanizing laws and equalizing forces.',
    effectSummary: 'Equips Honor Nameplate Title',
  },
  {
    id: 'plate_star_road_legend',
    name: 'Nameplate: STAR ROAD JURISPRUDENCE LEGEND',
    section: 'relics_badges',
    subType: 'hud_nameplate',
    price: 85,
    badge: 'Nameplate',
    description: 'Reserved for seasoned coin collectors who conquered Star Road.',
    effectSummary: 'Equips Honor Nameplate Title',
  },
  {
    id: 'plate_pomodoro_virtuoso',
    name: 'Nameplate: 25-MINUTE FOCUS VIRTUOSO',
    section: 'relics_badges',
    subType: 'hud_nameplate',
    price: 42,
    badge: 'Nameplate',
    description: 'Celebrates unbroken Pomodoro study sprints without tab-switching.',
    effectSummary: 'Equips Honor Nameplate Title',
  },
  {
    id: 'plate_bowser_prosecutor',
    name: 'Nameplate: SPECIAL PROSECUTOR VS. BOWSER CORP.',
    section: 'relics_badges',
    subType: 'hud_nameplate',
    price: 70,
    badge: 'Nameplate',
    description: 'Earned by holding Bowser Ironworks accountable for every illegal deduction.',
    effectSummary: 'Equips Honor Nameplate Title',
  },
  {
    id: 'plate_magna_cum_codal',
    name: 'Nameplate: SUMMA CUM CODAL SOVEREIGN',
    section: 'relics_badges',
    subType: 'hud_nameplate',
    price: 95,
    badge: 'Nameplate',
    description: 'Gold-tier academic sovereign badge for complete Labor Code command.',
    effectSummary: 'Equips Honor Nameplate Title',
  },
  {
    id: 'plate_royal_chancellor',
    name: 'Nameplate: CHANCELLOR OF MUSHROOM LAW ACADEMY',
    section: 'relics_badges',
    subType: 'hud_nameplate',
    price: 120,
    badge: 'Apex Title',
    description: 'The highest ceremonial nameplate sold in Toad’s Grand Coin Bazaar.',
    effectSummary: 'Equips Apex Honor Nameplate Title',
  },
];

/* ============================================================================
 * 5. EXTENDED DESK COMPANIONS & PRESTIGE STUDIO GEAR (24 ITEMS)
 * ========================================================================== */
export const EXTENDED_COMPANIONS_AND_FRAMES_ITEMS: Round10ShopCatalogItem[] = [
  {
    id: 'ext_comp_toadsworth',
    name: 'Dean Toadsworth Senior Bar Mentor',
    section: 'extended_gear',
    subType: 'extra_companion',
    price: 78,
    badge: 'Elder Mentor',
    description: 'Veteran Royal Steward who whispers Art. 302 retirement & tenure tips.',
    effectSummary: 'Unlocks Collectible Mentor Charter in Vault',
  },
  {
    id: 'ext_comp_captain_toad',
    name: 'Captain Toad Headlamp Case Finder',
    section: 'extended_gear',
    subType: 'extra_companion',
    price: 72,
    badge: 'Explorer',
    description: 'Shines his miner headlamp on hidden statutory exceptions & provisos.',
    effectSummary: 'Unlocks Collectible Explorer Companion',
  },
  {
    id: 'ext_comp_pauline_mayor',
    name: 'Mayor Pauline Metro Wage Commissioner',
    section: 'extended_gear',
    subType: 'extra_companion',
    price: 84,
    badge: 'City Hall',
    description: 'New Donk City executive overseeing NCR Wage Order compliance.',
    effectSummary: 'Unlocks Collectible Commissioner Companion',
  },
  {
    id: 'ext_comp_dry_bones_clerk',
    name: 'Dry Bones Prescription Archivist',
    section: 'extended_gear',
    subType: 'extra_companion',
    price: 68,
    badge: 'Deadlines',
    description: 'Never forgets 1-Year ULP, 3-Year Money Claims, and 4-Year Illegal Dismissal.',
    effectSummary: 'Unlocks Collectible Archivist Companion',
  },
  {
    id: 'ext_comp_shy_guy_auditor',
    name: 'Auditor Shy Guy Payroll Certified',
    section: 'extended_gear',
    subType: 'extra_companion',
    price: 64,
    badge: 'CPA Clerk',
    description: 'Double-checks holiday multipliers, SIL commutations, and 13th month pay.',
    effectSummary: 'Unlocks Collectible Auditor Companion',
  },
  {
    id: 'ext_comp_birdo_advocate',
    name: 'Counsel Birdo Safe-Spaces Advocate',
    section: 'extended_gear',
    subType: 'extra_companion',
    price: 70,
    badge: 'Gender & Leaves',
    description: 'Champions R.A. 11313, R.A. 9710 Magna Carta for Women & R.A. 11210.',
    effectSummary: 'Unlocks Collectible Advocate Companion',
  },
  {
    id: 'ext_comp_dk_steward',
    name: 'Donkey Kong Union Shop Steward',
    section: 'extended_gear',
    subType: 'extra_companion',
    price: 82,
    badge: 'Union Guard',
    description: 'Protects collective bargaining gains and lawful union check-offs.',
    effectSummary: 'Unlocks Collectible Steward Companion',
  },
  {
    id: 'ext_comp_diddy_paralegal',
    name: 'Diddy Kong Rapid Brief Runner',
    section: 'extended_gear',
    subType: 'extra_companion',
    price: 62,
    badge: 'Speed Filing',
    description: 'Files NLRC appeal memorandums and surety bonds well before Day 10!',
    effectSummary: 'Unlocks Collectible Runner Companion',
  },
  {
    id: 'ext_comp_kamek_scholar',
    name: 'Magikoopa Codal Cross-Referencer',
    section: 'extended_gear',
    subType: 'extra_companion',
    price: 76,
    badge: 'Cross-Ref',
    description: 'Links original Labor Code numbering with renumbered DOLE 2015 articles.',
    effectSummary: 'Unlocks Collectible Cross-Ref Companion',
  },
  {
    id: 'ext_comp_monty_researcher',
    name: 'Monty Mole Underground Miner Specialist',
    section: 'extended_gear',
    subType: 'extra_companion',
    price: 60,
    badge: 'R.A. 10757',
    description: 'Expert on Age 50 optional / Age 60 compulsory retirement for miners.',
    effectSummary: 'Unlocks Collectible Miner Specialist',
  },
  {
    id: 'ext_comp_nabbit_recovery',
    name: 'Nabbit Unpaid Backwages Bailiff',
    section: 'extended_gear',
    subType: 'extra_companion',
    price: 74,
    badge: 'Garnishment',
    description: 'Recovers illegally withheld wages (Art. 116) and 100% service charges.',
    effectSummary: 'Unlocks Collectible Bailiff Companion',
  },
  {
    id: 'ext_comp_geno_arbiter',
    name: 'Star Road Emissary Jurisprudence Guide',
    section: 'extended_gear',
    subType: 'extra_companion',
    price: 92,
    badge: 'Star Legend',
    description: 'Guides Bar candidates through complex multi-issue Supreme Court hypotheticals.',
    effectSummary: 'Unlocks Collectible Star Emissary',
  },
  // 12 Prestige Studio Certificates, Seals & Dossier Upgrades
  {
    id: 'ext_gear_gold_embosser',
    name: '24K Royal Diploma Gold Foil Seal Upgrade',
    section: 'extended_gear',
    subType: 'extra_frame',
    price: 65,
    badge: 'Diploma Upgrade',
    description: 'Adds an official Gold Senate Registry Serial endorsement to your Master Diploma.',
    effectSummary: 'Upgrades Royal Master Diploma Seal Prestige',
  },
  {
    id: 'ext_gear_latin_laurel',
    name: 'Supreme Laureate Olive Wreath Insignia',
    section: 'extended_gear',
    subType: 'extra_frame',
    price: 58,
    badge: 'Insignia',
    description: 'Classical golden olive wreath honoring Summa Cum Laude statutory accuracy.',
    effectSummary: 'Unlocks Laureate Wreath Crest',
  },
  {
    id: 'ext_gear_bar_countdown_bell',
    name: 'Ceremonial Oath-Taking Brass Bell',
    section: 'extended_gear',
    subType: 'extra_frame',
    price: 54,
    badge: 'Ceremonial',
    description: 'Rung upon completing all 6 Worlds of Philippine Labor Standards.',
    effectSummary: 'Unlocks Oath-Taking Bell Collectible',
  },
  {
    id: 'ext_gear_velvet_tube',
    name: 'Crimson Velvet Diploma Charter Cylinder',
    section: 'extended_gear',
    subType: 'extra_frame',
    price: 48,
    badge: 'Charter Case',
    description: 'Protective brass-capped scroll case for your Portrait & Landscape diplomas.',
    effectSummary: 'Unlocks Velvet Charter Case',
  },
  {
    id: 'ext_gear_wax_signet',
    name: 'Matthew’s Curatorial Gold Signet Ring',
    section: 'extended_gear',
    subType: 'extra_frame',
    price: 95,
    badge: 'Creator Signet',
    description: 'Commemorative curatorial signet honoring craftsmanship in legal education.',
    effectSummary: 'Unlocks Curatorial Signet Collectible',
  },
  {
    id: 'ext_gear_ivory_vellum',
    name: 'Archival Cotton-Rag Parchment Stock',
    section: 'extended_gear',
    subType: 'extra_frame',
    price: 50,
    badge: 'Print Craft',
    description: 'Museum-grade parchment finish appreciation badge for Print Studio aficionados.',
    effectSummary: 'Unlocks Archival Print Craft Badge',
  },
  {
    id: 'ext_gear_scra_bookmark',
    name: 'Solid Gold SCRA Ribbon Bookmark Trio',
    section: 'extended_gear',
    subType: 'extra_frame',
    price: 44,
    badge: 'Study Craft',
    description: 'Crimson, emerald, and gold silk ribbons for marking landmark labor cases.',
    effectSummary: 'Unlocks SCRA Bookmark Trio',
  },
  {
    id: 'ext_gear_fountain_pen',
    name: 'Montblanc-Style Bar Counsel Nib Pen',
    section: 'extended_gear',
    subType: 'extra_frame',
    price: 88,
    badge: 'Executive Pen',
    description: 'Iridescent black-lacquer and gold nib pen for signing Roll of Attorneys.',
    effectSummary: 'Unlocks Counsel Fountain Pen',
  },
  {
    id: 'ext_gear_moot_court_cup',
    name: 'National Labor Moot Court Champion Cup',
    section: 'extended_gear',
    subType: 'extra_frame',
    price: 105,
    badge: 'Grand Trophy',
    description: 'Towering silver-and-gold championship cup for undefeated Courtroom RPG heroes.',
    effectSummary: 'Unlocks Moot Court Champion Cup',
  },
  {
    id: 'ext_gear_juris_medallion',
    name: 'Order of the Mushroom Bar Grand Collar',
    section: 'extended_gear',
    subType: 'extra_frame',
    price: 125,
    badge: 'Grand Collar',
    description: 'Chain of office worn by Grand Masters of Philippine Social Legislation.',
    effectSummary: 'Unlocks Grand Collar Regalia',
  },
  {
    id: 'ext_gear_star_globe',
    name: 'Celestial Grand Star Paperweight',
    section: 'extended_gear',
    subType: 'extra_frame',
    price: 72,
    badge: 'Desk Jewel',
    description: 'Captures a miniature spinning Grand Star inside beveled optical crystal.',
    effectSummary: 'Unlocks Grand Star Crystal',
  },
  {
    id: 'ext_gear_flagpole_finial',
    name: '1-Up Castle Flagpole Golden Finial',
    section: 'extended_gear',
    subType: 'extra_frame',
    price: 80,
    badge: 'Course Clear',
    description: 'The iconic golden orb from the top of the World 6-4 victory flagpole!',
    effectSummary: 'Unlocks Flagpole Golden Finial',
  },
];

export const ROUND10_ALL_NEW_SHOP_ITEMS: Round10ShopCatalogItem[] = [
  ...LAW_CHAMBERS_UPGRADE_ITEMS,
  ...ARCADE_AND_QUIZ_CONSUMABLE_ITEMS,
  ...CLICK_AND_CONFETTI_FX_ITEMS,
  ...RELICS_AND_NAMEPLATES_ITEMS,
  ...EXTENDED_COMPANIONS_AND_FRAMES_ITEMS,
];

export function computeLawChambersPrestige(
  unlockedIds: string[],
  extraChambersItems: Round10ShopCatalogItem[] = []
): {
  unlockedCount: number;
  totalCount: number;
  bonusCoinPct: number;
  rankLabel: string;
} {
  const combinedChambers = [...LAW_CHAMBERS_UPGRADE_ITEMS, ...extraChambersItems];
  const unlockedItems = combinedChambers.filter((i) =>
    unlockedIds.includes(i.id)
  );
  const bonusCoinPct = unlockedItems.reduce(
    (acc, item) => acc + (item.chambersBonusPct || 0),
    0
  );
  const count = unlockedItems.length;
  const rankLabel =
    count >= 15
      ? 'Supreme Court Grand Chambers'
      : count >= 9
      ? 'Senior Partner Law Suite'
      : count >= 4
      ? 'Associate Counsel Office'
      : count >= 1
      ? 'Junior Paralegal Study Desk'
      : 'Starter Law Carrel';
  return {
    unlockedCount: count,
    totalCount: combinedChambers.length,
    bonusCoinPct,
    rankLabel,
  };
}

/* ============================================================================
 * 6. "WHERE CAN I USE MY COINS?" DIRECTORY ECOSYSTEM
 * ========================================================================== */
export interface CoinUtilityDestination {
  id: string;
  title: string;
  costRangeLabel: string;
  whereLabel: string;
  description: string;
  targetType: 'app_tab' | 'shop_category';
  targetValue: string;
  ctaLabel: string;
}

export const COIN_UTILITY_DESTINATIONS: CoinUtilityDestination[] = [
  {
    id: 'use_quiz_lifelines',
    title: 'Quest & Boss Battle Lifelines',
    costRangeLabel: '15–30 Coins or Tokens',
    whereLabel: 'Quest Tab (Practice, Quick & Boss Modes)',
    description:
      'Spend coins directly inside live quizzes for 50/50 Option Zappers, Counsel Toad Statutory Hints, or Boss Mistake Shields!',
    targetType: 'app_tab',
    targetValue: 'quiz',
    ctaLabel: 'Use in Quest Quizzes',
  },
  {
    id: 'use_arcade_boosts',
    title: 'Arcade Vault Power-Ups & Coin Wagers',
    costRangeLabel: '5–20 Coins',
    whereLabel: 'Arcade Tab (47 Games)',
    description:
      'Activate 2x Arcade Payout Multipliers, Extra Shield Hearts, and Inspector Radars across our new non-quiz Action, Sim & Defense games!',
    targetType: 'app_tab',
    targetValue: 'vault',
    ctaLabel: 'Play & Boost in Arcade',
  },
  {
    id: 'use_law_chambers',
    title: 'Build Your Law Chambers Sanctuary',
    costRangeLabel: '35–165 Coins (26 Upgrades)',
    whereLabel: "Toad's Shop · Law Chambers",
    description:
      'Furnish your interactive legal office with Narra desks, SCRA libraries, chandeliers & espresso bars for permanent Prestige!',
    targetType: 'shop_category',
    targetValue: 'law_chambers',
    ctaLabel: 'Open Law Chambers',
  },
  {
    id: 'use_lucky_wheel',
    title: "Toad's Lucky Star Prize Wheel",
    costRangeLabel: '25 / 75 Coins per Spin',
    whereLabel: "Toad's Shop · Lucky Wheel",
    description:
      'Spin Toad’s 8-wedge Star Wheel to win Lifeline Packs, Arcade 2x Tickets, Super Star Multipliers, and up to 250 Jackpot Coins!',
    targetType: 'shop_category',
    targetValue: 'lucky_wheel',
    ctaLabel: 'Spin Lucky Wheel',
  },
  {
    id: 'use_consumable_tokens',
    title: 'Stockpile Lifeline & Arcade Bundles',
    costRangeLabel: '18–145 Coins (28 Packs)',
    whereLabel: "Toad's Shop · Boost Tokens",
    description:
      'Buy discounted 6x and 10x value packs of 50/50 Zappers, Hint Scrolls, Boss Shields, and Arcade Radars.',
    targetType: 'shop_category',
    targetValue: 'arcade_quiz_boosts',
    ctaLabel: 'Browse Boost Packs',
  },
  {
    id: 'use_fx_relics',
    title: 'Click FX, Confetti, Relics & 34 Heroes',
    costRangeLabel: '35–125 Coins (100+ Cosmetics)',
    whereLabel: "Toad's Shop · FX, Relics & Heroes",
    description:
      'Customize every click spark, celebration confetti burst, HUD nameplate, Mario skin, UI theme, and 6-World Statutory Relic!',
    targetType: 'shop_category',
    targetValue: 'click_confetti_fx',
    ctaLabel: 'Equip Click & Confetti FX',
  },
  {
    id: 'use_mystery_chests',
    title: '3-Tier Mystery Chests & Special Events',
    costRangeLabel: '15 / 60 / 150 Coins',
    whereLabel: "Toad's Shop · Chests & Events",
    description:
      'Crack Classic [?], Golden Super Blocks, or Royal Treasury Chests, or ignite Golden Hour 3x Coin Multipliers!',
    targetType: 'shop_category',
    targetValue: 'mystery',
    ctaLabel: 'Open Mystery Chests',
  },
  {
    id: 'use_master_diploma',
    title: 'Royal Grand Master Juris Diploma',
    costRangeLabel: '50 Coins Unlock',
    whereLabel: "Toad's Shop · Master Diploma",
    description:
      'Confer your official Portrait or Landscape 6-World Transcript Charter with High Academy Coat of Arms & Gold Rosette Seal!',
    targetType: 'shop_category',
    targetValue: 'certificate',
    ctaLabel: 'View Master Diploma',
  },
];

/* ============================================================================
 * 7. TOAD'S LUCKY PRIZE WHEEL ENGINE
 * ========================================================================== */
export interface LuckyWheelPrize {
  id: string;
  label: string;
  rewardType: 'coins' | 'quiz5050' | 'quizHint' | 'arcade2x' | 'superStarMins';
  amount: number;
  colorClass: string;
}

export const TOAD_LUCKY_WHEEL_WEDGES: LuckyWheelPrize[] = [
  {
    id: 'wedge_coins_40',
    label: '+40 Gold Coins',
    rewardType: 'coins',
    amount: 40,
    colorClass: 'bg-amber-400 text-slate-950',
  },
  {
    id: 'wedge_5050_2',
    label: '+2 Quiz 50/50 Zappers',
    rewardType: 'quiz5050',
    amount: 2,
    colorClass: 'bg-rose-500 text-white',
  },
  {
    id: 'wedge_arcade2x_2',
    label: '+2 Arcade 2x Tickets',
    rewardType: 'arcade2x',
    amount: 2,
    colorClass: 'bg-emerald-500 text-slate-950',
  },
  {
    id: 'wedge_coins_15',
    label: '+15 Consolation Coins',
    rewardType: 'coins',
    amount: 15,
    colorClass: 'bg-slate-800 text-amber-300',
  },
  {
    id: 'wedge_hint_2',
    label: '+2 Toad Hint Scrolls',
    rewardType: 'quizHint',
    amount: 2,
    colorClass: 'bg-sky-500 text-slate-950',
  },
  {
    id: 'wedge_star_5m',
    label: '5-Min 2x Super Star Rush!',
    rewardType: 'superStarMins',
    amount: 5,
    colorClass: 'bg-purple-600 text-white',
  },
  {
    id: 'wedge_coins_65',
    label: '+65 Treasury Coins!',
    rewardType: 'coins',
    amount: 65,
    colorClass: 'bg-orange-400 text-slate-950',
  },
  {
    id: 'wedge_jackpot_180',
    label: 'GRAND STAR +180 COINS!',
    rewardType: 'coins',
    amount: 180,
    colorClass: 'bg-yellow-300 text-red-900',
  },
];

export function resolveLuckyWheelSpin(
  randomZeroToOne: number,
  highRoller = false
): { wedgeIndex: number; prize: LuckyWheelPrize; effectiveAmount: number } {
  const clamped = Math.max(0, Math.min(0.999999, randomZeroToOne));
  const wedgeIndex = Math.floor(clamped * TOAD_LUCKY_WHEEL_WEDGES.length);
  const prize = TOAD_LUCKY_WHEEL_WEDGES[wedgeIndex];
  const multiplier = highRoller ? 3 : 1;
  return {
    wedgeIndex,
    prize,
    effectiveAmount: prize.amount * multiplier,
  };
}

/* ============================================================================
 * 8. NON-QUIZ GAME PURE ENGINES (PAYROLL DESK, WORD HUNT, TOWER DEFENSE, SIM)
 * ========================================================================== */

// --- Game B: DOLE Wage & Payroll Inspector Stamp Desk ---
export type PayrollViolationCode =
  | 'compliant'
  | 'sub_minimum_wage'
  | 'underpaid_ot'
  | 'holiday_shortfall'
  | 'illegal_deduction';

export interface PayrollInspectionVoucher {
  voucherNo: string;
  establishment: string;
  workerName: string;
  regionLabel: string;
  statutoryMinDaily: number;
  dailyRatePaid: number;
  regularDays: number;
  overtimeHours: number;
  overtimePayListed: number;
  holidayType: 'None' | 'Regular Holiday (200%)' | 'Special Non-Working (130%)';
  holidayPayListed: number;
  deductionLabel: string;
  deductionAmount: number;
  netPayslipTotal: number;
  isCompliant: boolean;
  violationCode: PayrollViolationCode;
  auditExplanation: string;
}

const ESTABLISHMENTS = [
  'Koopa Troopa Logistics Inc.',
  'Toadstool Harbour Catering',
  'Sarasaland Garments Corp.',
  'Bob-omb Steel Fabrication',
  'Starlight BPO Services',
  'Yoshi Orchard Agro-Ventures',
];

const WORKER_NAMES = [
  'Mateo Santos (Rank-and-File)',
  'Clara Reyes (Machine Operator)',
  'Lino Bautista (Warehouseman)',
  'Rosa Mendoza (Line Cook)',
  'Jomar Villanueva (Delivery Crew)',
  'Elena Navarro (Quality Clerk)',
];

export function generatePayrollVoucher(
  seedIndex: number
): PayrollInspectionVoucher {
  const statutoryMinDaily = 645; // NCR Benchmark
  const est = ESTABLISHMENTS[seedIndex % ESTABLISHMENTS.length];
  const worker = WORKER_NAMES[(seedIndex * 3 + 1) % WORKER_NAMES.length];
  const voucherNo = `DOLE-2025-${String(1040 + seedIndex * 7).padStart(4, '0')}`;
  const regularDays = 5;
  const hourlyMin = statutoryMinDaily / 8; // 80.625

  const scenarioType = seedIndex % 5; // 0 & 3 = compliant (40%), 1=sub_min, 2=underpaid_ot, 4=illegal_deduction / holiday
  if (scenarioType === 0) {
    const otHours = 4;
    const exactOt = Math.round(hourlyMin * 1.25 * otHours); // 403
    const holidayPay = statutoryMinDaily * 2; // 1290 Regular Holiday worked
    const sssDed = 250;
    const basePay = statutoryMinDaily * regularDays;
    return {
      voucherNo,
      establishment: est,
      workerName: worker,
      regionLabel: 'NCR (Min ₱645/day)',
      statutoryMinDaily,
      dailyRatePaid: statutoryMinDaily,
      regularDays,
      overtimeHours: otHours,
      overtimePayListed: exactOt,
      holidayType: 'Regular Holiday (200%)',
      holidayPayListed: holidayPay,
      deductionLabel: 'SSS / PhilHealth / Pag-IBIG Statutory Share',
      deductionAmount: sssDed,
      netPayslipTotal: basePay + exactOt + holidayPay - sssDed,
      isCompliant: true,
      violationCode: 'compliant',
      auditExplanation:
        '100% Compliant: ₱645/day meets NCR minimum, 4h OT paid at 125% (Art. 87), Regular Holiday paid at 200% (Art. 94), and statutory social insurance deductions are lawful (Art. 113).',
    };
  }

  if (scenarioType === 3) {
    const otHours = 2;
    const exactOt = Math.round((700 / 8) * 1.25 * otHours); // 219
    const holidayPay = Math.round(700 * 1.3); // 910 Special day
    const unionCheckoff = 120;
    const basePay = 700 * regularDays;
    return {
      voucherNo,
      establishment: est,
      workerName: worker,
      regionLabel: 'NCR (Min ₱645/day)',
      statutoryMinDaily,
      dailyRatePaid: 700,
      regularDays,
      overtimeHours: otHours,
      overtimePayListed: exactOt,
      holidayType: 'Special Non-Working (130%)',
      holidayPayListed: holidayPay,
      deductionLabel: 'Authorized Union Check-Off (Art. 113)',
      deductionAmount: unionCheckoff,
      netPayslipTotal: basePay + exactOt + holidayPay - unionCheckoff,
      isCompliant: true,
      violationCode: 'compliant',
      auditExplanation:
        '100% Compliant: Above-minimum ₱700/day rate, 125% OT, 130% Special Day pay (Art. 93), and lawful union check-off.',
    };
  }

  if (scenarioType === 1) {
    const underRate = 520;
    const basePay = underRate * regularDays;
    return {
      voucherNo,
      establishment: est,
      workerName: worker,
      regionLabel: 'NCR (Min ₱645/day)',
      statutoryMinDaily,
      dailyRatePaid: underRate,
      regularDays,
      overtimeHours: 0,
      overtimePayListed: 0,
      holidayType: 'None',
      holidayPayListed: 0,
      deductionLabel: 'SSS / PhilHealth Statutory Share',
      deductionAmount: 200,
      netPayslipTotal: basePay - 200,
      isCompliant: false,
      violationCode: 'sub_minimum_wage',
      auditExplanation:
        'VIOLATION (R.A. 6727 / Art. 99): Daily rate of ₱520 is below the ₱645 NCR statutory minimum wage (triggers Double Indemnity under R.A. 8188!).',
    };
  }

  if (scenarioType === 2) {
    const otHours = 6;
    const wrongStraightOt = Math.round(hourlyMin * 1.0 * otHours); // Paid 100% instead of 125%!
    const basePay = statutoryMinDaily * regularDays;
    return {
      voucherNo,
      establishment: est,
      workerName: worker,
      regionLabel: 'NCR (Min ₱645/day)',
      statutoryMinDaily,
      dailyRatePaid: statutoryMinDaily,
      regularDays,
      overtimeHours: otHours,
      overtimePayListed: wrongStraightOt,
      holidayType: 'None',
      holidayPayListed: 0,
      deductionLabel: 'SSS / PhilHealth Statutory Share',
      deductionAmount: 220,
      netPayslipTotal: basePay + wrongStraightOt - 220,
      isCompliant: false,
      violationCode: 'underpaid_ot',
      auditExplanation: `VIOLATION (Art. 87 Overtime): 6h overtime was paid at straight 100% (₱${wrongStraightOt}) instead of the mandatory 125% ordinary-day OT rate (₱${Math.round(
        hourlyMin * 1.25 * otHours
      )})!`,
    };
  }

  // scenarioType === 4: Illegal cash bond / breakage deduction without due process or holiday shortfall
  if (seedIndex % 2 === 0) {
    const basePay = statutoryMinDaily * regularDays;
    const illegalDed = 1450; // >20% weekly wage & unilateral breakage deduction
    return {
      voucherNo,
      establishment: est,
      workerName: worker,
      regionLabel: 'NCR (Min ₱645/day)',
      statutoryMinDaily,
      dailyRatePaid: statutoryMinDaily,
      regularDays,
      overtimeHours: 0,
      overtimePayListed: 0,
      holidayType: 'None',
      holidayPayListed: 0,
      deductionLabel: 'Unilateral Tool Breakage Penalty (No Hearing)',
      deductionAmount: illegalDed,
      netPayslipTotal: basePay - illegalDed,
      isCompliant: false,
      violationCode: 'illegal_deduction',
      auditExplanation:
        'VIOLATION (Art. 113–115): Unilateral breakage deduction without hearing/due process and exceeding the 20% weekly wage cap!',
    };
  }

  const shortHoliday = statutoryMinDaily; // Paid only 100% instead of 200% for worked Regular Holiday
  const basePay = statutoryMinDaily * regularDays;
  return {
    voucherNo,
    establishment: est,
    workerName: worker,
    regionLabel: 'NCR (Min ₱645/day)',
    statutoryMinDaily,
    dailyRatePaid: statutoryMinDaily,
    regularDays,
    overtimeHours: 0,
    overtimePayListed: 0,
    holidayType: 'Regular Holiday (200%)',
    holidayPayListed: shortHoliday,
    deductionLabel: 'SSS / PhilHealth Statutory Share',
    deductionAmount: 220,
    netPayslipTotal: basePay + shortHoliday - 220,
    isCompliant: false,
    violationCode: 'holiday_shortfall',
    auditExplanation:
      'VIOLATION (Art. 94 Holiday Pay): Worked Regular Holiday was paid only ₱645 (100%) instead of the mandatory 200% (₱1,290)!',
  };
}

export function evaluatePayrollStampDecision(
  voucher: PayrollInspectionVoucher,
  stampedApprove: boolean
): { correct: boolean; pointsDelta: number; feedback: string } {
  const correct = voucher.isCompliant === stampedApprove;
  return {
    correct,
    pointsDelta: correct ? 150 : -50,
    feedback: voucher.auditExplanation,
  };
}

// --- Game E: Bar Codal Word Hunt (10x10 Grid + 4-Tier Hints) ---
export interface WordHuntPlacement {
  word: string;
  clue: string;
  articleRef: string;
  startRow: number;
  startCol: number;
  dRow: number;
  dCol?: number;
  cells: Array<{ r: number; c: number }>;
  orientationLabel: 'Horizontal (Row)' | 'Vertical (Col)' | 'Diagonal (Down-Right)';
}

export interface WordHuntPuzzleBoard {
  size: number;
  grid: string[][];
  placements: WordHuntPlacement[];
}

export const WORD_HUNT_PUZZLE_SETS: {
  title: string;
  entries: {
    word: string;
    clue: string;
    articleRef: string;
    r: number;
    c: number;
    dr: number;
    dc: number;
  }[];
}[] = [
  {
    title: 'Board 1 · Core Labor Standards Doctrines',
    entries: [
      {
        word: 'OVERTIME',
        clue: 'Work beyond 8 hours paid at +25% on ordinary days',
        articleRef: 'Art. 87',
        r: 0,
        c: 1,
        dr: 0,
        dc: 1,
      },
      {
        word: 'PATERNITY',
        clue: '7 calendar days full pay for married male employee (first 4 deliveries)',
        articleRef: 'R.A. 8187',
        r: 2,
        c: 0,
        dr: 0,
        dc: 1,
      },
      {
        word: 'AGABON',
        clue: 'Doctrine awarding ₱30,000 nominal damages when Just Cause lacks procedural due process',
        articleRef: 'G.R. 158693',
        r: 4,
        c: 2,
        dr: 0,
        dc: 1,
      },
      {
        word: 'PINEDA',
        clue: 'Supreme Court wage distortion formula case',
        articleRef: 'Art. 124',
        r: 1,
        c: 9,
        dr: 1,
        dc: 0,
      },
      {
        word: 'TENURE',
        clue: 'No dismissal except for Just or Authorized causes',
        articleRef: 'Art. 294',
        r: 6,
        c: 1,
        dr: 0,
        dc: 1,
      },
      {
        word: 'MABEZA',
        clue: '3-prong test distinguishing deductible Facilities from Supplements',
        articleRef: 'G.R. 118506',
        r: 8,
        c: 2,
        dr: 0,
        dc: 1,
      },
    ],
  },
  {
    title: 'Board 2 · Special Groups & Leaves',
    entries: [
      {
        word: 'MATERNITY',
        clue: '105 days paid leave for live childbirth (+15 days for solo parents)',
        articleRef: 'R.A. 11210',
        r: 0,
        c: 0,
        dr: 0,
        dc: 1,
      },
      {
        word: 'HOLIDAY',
        clue: '200% daily wage when working on a Regular Holiday',
        articleRef: 'Art. 94',
        r: 2,
        c: 1,
        dr: 0,
        dc: 1,
      },
      {
        word: 'RESTDAY',
        clue: '24 consecutive hours rest after 6 consecutive normal workdays',
        articleRef: 'Art. 91',
        r: 4,
        c: 0,
        dr: 0,
        dc: 1,
      },
      {
        word: 'BONUS',
        clue: '13th month pay equal to at least 1/12 of total basic salary',
        articleRef: 'P.D. 851',
        r: 6,
        c: 3,
        dr: 0,
        dc: 1,
      },
      {
        word: 'MINER',
        clue: 'Optional retirement at 50 and compulsory at 60 with 5 yrs service',
        articleRef: 'R.A. 10757',
        r: 3,
        c: 8,
        dr: 1,
        dc: 0,
      },
      {
        word: 'VAWC',
        clue: 'Up to 10 days paid leave for victim-survivors',
        articleRef: 'R.A. 9262',
        r: 9,
        c: 1,
        dr: 0,
        dc: 1,
      },
    ],
  },
];

const FILLER_ALPHABET = 'ABCDEFGHJKLMNPQRSTVWXYZ';

export function buildStatutoryWordHuntGrid(boardIdx: number): WordHuntPuzzleBoard {
  const size = 10;
  const set = WORD_HUNT_PUZZLE_SETS[Math.abs(boardIdx) % WORD_HUNT_PUZZLE_SETS.length];
  const grid: string[][] = Array.from({ length: size }, (_, r) =>
    Array.from(
      { length: size },
      (__, c) =>
        FILLER_ALPHABET[(r * 7 + c * 13 + boardIdx * 5) % FILLER_ALPHABET.length]
    )
  );

  const placements: WordHuntPlacement[] = set.entries.map((entry) => {
    const cells: { r: number; c: number }[] = [];
    for (let i = 0; i < entry.word.length; i++) {
      const rr = entry.r + entry.dr * i;
      const cc = entry.c + entry.dc * i;
      grid[rr][cc] = entry.word[i];
      cells.push({ r: rr, c: cc });
    }
    const orientationLabel =
      entry.dr === 0
        ? 'Horizontal (Row)'
        : entry.dc === 0
        ? 'Vertical (Col)'
        : 'Diagonal (Down-Right)';
    return {
      word: entry.word,
      clue: entry.clue,
      articleRef: entry.articleRef,
      startRow: entry.r,
      startCol: entry.c,
      dRow: entry.dr,
      dCol: entry.dc,
      orientationLabel,
      cells,
    };
  });

  return { size, grid, placements };
}

export function resolveWordHuntHint(
  placement: WordHuntPlacement,
  tier: 1 | 2 | 3 | 4
): string {
  if (tier === 1) {
    return `Tier 1 (First Letter): Starts with "${placement.word[0]}" (${placement.word.length} letters · ${placement.articleRef})`;
  }
  if (tier === 2) {
    return `Tier 2 (Orientation): Placed ${placement.orientationLabel} for "${placement.word}"`;
  }
  if (tier === 3) {
    return `Tier 3 (Grid Line): Begins on Row ${placement.startRow + 1}, Column ${placement.startCol + 1}`;
  }
  return `Tier 4 (Pinpoint Highlight): Starting cell [R${placement.startRow + 1}, C${placement.startCol + 1}] highlighted on board!`;
}

// --- Game C: Mushroom Union Tower Defense ---
export interface TowerGuardianDef {
  id: 'ot_cannon' | 'do174_wall' | 'maternity_shrine' | 'nlrc_frost';
  keyBind: '1' | '2' | '3' | '4';
  name: string;
  roleClue: string;
  cost: number;
  maxHp: number;
  damage: number;
  cooldownSec: number;
  slowFactor?: number;
  incomePerTick?: number;
  accentHex: string;
}

export const TOWER_GUARDIAN_UNITS: TowerGuardianDef[] = [
  {
    id: 'ot_cannon',
    keyBind: '1',
    name: 'Art. 87 OT Turret',
    roleClue: 'Rapid Single-Target Bolts',
    cost: 40,
    maxHp: 120,
    damage: 26,
    cooldownSec: 1.0,
    accentHex: '#f59e0b',
  },
  {
    id: 'do174_wall',
    keyBind: '2',
    name: 'D.O. 174 Shield Barrier',
    roleClue: 'High-HP Lane Blocker',
    cost: 30,
    maxHp: 340,
    damage: 6,
    cooldownSec: 1.8,
    accentHex: '#10b981',
  },
  {
    id: 'nlrc_frost',
    keyBind: '3',
    name: 'NLRC Garnish Beacon',
    roleClue: 'Chills & Slows Lane 45%',
    cost: 55,
    maxHp: 110,
    damage: 18,
    cooldownSec: 1.25,
    slowFactor: 0.55,
    accentHex: '#38bdf8',
  },
  {
    id: 'maternity_shrine',
    keyBind: '4',
    name: 'P.D. 851 Coin Mint',
    roleClue: 'Generates +8 Union Gold',
    cost: 50,
    maxHp: 100,
    damage: 8,
    cooldownSec: 2.2,
    incomePerTick: 8,
    accentHex: '#f43f5e',
  },
];

// --- Game F: Republic Labor Commissioner 4-Meter Balance Simulator ---
export interface CommissionerMeters {
  workerWelfare: number;
  complianceRate: number;
  enterpriseStability: number;
  publicTrust: number;
}

export interface CommissionerCrisisCard {
  id: string;
  docketTitle: string;
  petitioner: string;
  situation: string;
  statutoryNote: string;
  leftChoice: {
    label: string;
    summary: string;
    deltas: Partial<CommissionerMeters>;
  };
  rightChoice: {
    label: string;
    summary: string;
    deltas: Partial<CommissionerMeters>;
  };
}

export const COMMISSIONER_CRISIS_DECK: CommissionerCrisisCard[] = [
  {
    id: 'crisis_typhoon_ot',
    docketTitle: 'Typhoon Signal No. 3 Power-Grid Emergency',
    petitioner: 'Meralco-Style Line Crew vs. Grid Utility',
    situation:
      'A super typhoon knocked out hospital power lines. Management ordered 4 hours of emergency overtime under Art. 89 to prevent loss of life, offering 125% OT pay.',
    statutoryNote: 'Art. 89 allows compulsory emergency OT when paid statutory +25% OT.',
    leftChoice: {
      label: 'Enforce Art. 89 + Hazard Bonus',
      summary: 'Authorize emergency repair with full 125% OT + safety gear audit.',
      deltas: {
        workerWelfare: 8,
        complianceRate: 12,
        enterpriseStability: 8,
        publicTrust: 10,
      },
    },
    rightChoice: {
      label: 'Halt All Grid Repairs',
      summary: 'Block emergency overtime despite hospital blackout risk.',
      deltas: {
        workerWelfare: 4,
        complianceRate: -8,
        enterpriseStability: -14,
        publicTrust: -16,
      },
    },
  },
  {
    id: 'crisis_ghost_agency',
    docketTitle: '500 Mall Cashiers Under ₱50k Shell Agency',
    petitioner: 'Mall Rank-and-File Union vs. KoopMart Inc.',
    situation:
      'DOLE inspectors discovered 500 cashiers performing core retail work supplied by an agency with only ₱50,000 paid-up capital and zero independent tools.',
    statutoryNote: 'D.O. 174-17 requires ₱5M capital & independent control; otherwise Labor-Only!',
    leftChoice: {
      label: 'Declare Regular Employees',
      summary: 'Pierce labor-only veil and regularize all 500 cashiers with KoopMart.',
      deltas: {
        workerWelfare: 16,
        complianceRate: 14,
        enterpriseStability: -6,
        publicTrust: 14,
      },
    },
    rightChoice: {
      label: 'Grant 1-Year Grace Waiver',
      summary: 'Allow the undercapitalized agency to keep operating temporarily.',
      deltas: {
        workerWelfare: -18,
        complianceRate: -16,
        enterpriseStability: 8,
        publicTrust: -14,
      },
    },
  },
  {
    id: 'crisis_service_charge',
    docketTitle: 'Luxury Hotel Withholding 15% of Service Charges',
    petitioner: 'Waitstaff Collective vs. Grand Bowser Hotel',
    situation:
      'Management kept 15% of restaurant service charges for "breakage & pilferage reserves" citing the old pre-2019 Labor Code rule.',
    statutoryNote: 'R.A. No. 11360 mandates 100% distribution of service charges to covered workers!',
    leftChoice: {
      label: 'Order 100% Distribution',
      summary: 'Enforce R.A. 11360 and refund withheld 15% pool to rank-and-file.',
      deltas: {
        workerWelfare: 14,
        complianceRate: 14,
        enterpriseStability: -4,
        publicTrust: 12,
      },
    },
    rightChoice: {
      label: 'Allow 85/15 Old Split',
      summary: 'Permit obsolete management retention contrary to R.A. 11360.',
      deltas: {
        workerWelfare: -16,
        complianceRate: -18,
        enterpriseStability: 6,
        publicTrust: -12,
      },
    },
  },
  {
    id: 'crisis_wage_distortion',
    docketTitle: 'RTWPB +₱40 Wage Order Compressed Pay Tiers',
    petitioner: 'Senior Technicians vs. Sarasaland Electronics',
    situation:
      'A new Wage Order raised entry-level pay to ₱645, erasing the gap with 5-year technicians also at ₱645. Workers threaten an immediate wildcat strike!',
    statutoryNote: 'Art. 124 prohibits strikes over wage distortion; resolve via grievance/NCMB & Pineda formula.',
    leftChoice: {
      label: 'Apply Pineda Formula & NCMB',
      summary: 'Enjoin strike and order proportional Pineda wage distortion adjustment.',
      deltas: {
        workerWelfare: 10,
        complianceRate: 14,
        enterpriseStability: 10,
        publicTrust: 10,
      },
    },
    rightChoice: {
      label: 'Raise Everyone Flat +₱40',
      summary: 'Mandate across-the-board hike beyond statutory distortion formula.',
      deltas: {
        workerWelfare: 12,
        complianceRate: -4,
        enterpriseStability: -16,
        publicTrust: 4,
      },
    },
  },
  {
    id: 'crisis_maternity_solo',
    docketTitle: 'Unwed Solo Mother Denied +15-Day Extension',
    petitioner: 'Ms. Rosalina Cruz vs. Orbit Call Center',
    situation:
      'HR granted 105 days paid maternity leave under R.A. 11210 but denied the +15-day Solo Parent extension because the employee is unmarried.',
    statutoryNote: 'R.A. 11210 applies regardless of civil status; qualified solo parents get +15 paid days (120 total).',
    leftChoice: {
      label: 'Award Full 120 Paid Days',
      summary: 'Enforce R.A. 11210 + R.A. 11861 regardless of civil status.',
      deltas: {
        workerWelfare: 15,
        complianceRate: 14,
        enterpriseStability: 2,
        publicTrust: 14,
      },
    },
    rightChoice: {
      label: 'Cap Leave at 105 Days',
      summary: 'Side with HR’s unlawful marital-status restriction.',
      deltas: {
        workerWelfare: -18,
        complianceRate: -16,
        enterpriseStability: 4,
        publicTrust: -16,
      },
    },
  },
  {
    id: 'crisis_redundancy_automation',
    docketTitle: 'AI Warehouse Sorting Redundancy Program',
    petitioner: '40 Warehouse Clerks vs. Lakitu Freight Corp.',
    situation:
      'Employer served written notice to workers & DOLE 30 days ahead and offered 1 month pay per year of service under Art. 298 for good-faith automation.',
    statutoryNote: 'Art. 298 Redundancy requires 30-day dual notice, fair criteria & 1 month/yr separation pay.',
    leftChoice: {
      label: 'Certify Valid Art. 298 Package',
      summary: 'Verify LIFO fair criteria, 30-day DOLE notice & full 1-mo/yr payout.',
      deltas: {
        workerWelfare: 6,
        complianceRate: 14,
        enterpriseStability: 14,
        publicTrust: 8,
      },
    },
    rightChoice: {
      label: 'Nullify Compliant Redundancy',
      summary: 'Block lawful authorized cause despite full statutory separation pay.',
      deltas: {
        workerWelfare: 6,
        complianceRate: -12,
        enterpriseStability: -18,
        publicTrust: -6,
      },
    },
  },
];

export function applyCommissionerRuling(
  current: CommissionerMeters,
  deltas: Partial<CommissionerMeters>
): CommissionerMeters {
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  return {
    workerWelfare: clamp(current.workerWelfare + (deltas.workerWelfare || 0)),
    complianceRate: clamp(current.complianceRate + (deltas.complianceRate || 0)),
    enterpriseStability: clamp(
      current.enterpriseStability + (deltas.enterpriseStability || 0)
    ),
    publicTrust: clamp(current.publicTrust + (deltas.publicTrust || 0)),
  };
}

// --- Game A: Platformer Pure Step Helper ---
export function stepPlatformerVerticalPhysics(params: {
  y: number;
  vy: number;
  groundY: number;
  rawDt: number;
  coyoteTimer: number;
  jumpBufferTimer: number;
  jumpCutRequested: boolean;
  gravity?: number;
  jumpVelocity?: number;
}): {
  y: number;
  vy: number;
  grounded: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  jumpedThisStep: boolean;
} {
  const dt = Math.min(Math.max(0, params.rawDt), 0.05);
  const gravity = params.gravity ?? 1550;
  const jumpVel = params.jumpVelocity ?? -620;

  let { y, vy, coyoteTimer, jumpBufferTimer } = params;
  let grounded = y >= params.groundY - 0.5 && vy >= 0;
  coyoteTimer = grounded ? 0.1 : Math.max(0, coyoteTimer - dt);
  jumpBufferTimer = Math.max(0, jumpBufferTimer - dt);

  let jumpedThisStep = false;
  if (jumpBufferTimer > 0 && coyoteTimer > 0) {
    vy = jumpVel;
    grounded = false;
    coyoteTimer = 0;
    jumpBufferTimer = 0;
    jumpedThisStep = true;
  }

  if (params.jumpCutRequested && vy < -120) {
    vy *= 0.45;
  }

  vy += gravity * dt;
  y += vy * dt;

  if (y >= params.groundY) {
    y = params.groundY;
    vy = 0;
    grounded = true;
    coyoteTimer = 0.1;
  }

  return {
    y,
    vy,
    grounded,
    coyoteTimer,
    jumpBufferTimer,
    jumpedThisStep,
  };
}

/* ============================================================================
 * 9. CERTIFICATE VS. ROYAL MASTER DIPLOMA ORIENTATION & TRANSCRIPT METADATA
 * ========================================================================== */
export function getCertificateOrientationSpec(orientation: DocumentOrientation): {
  orientation: DocumentOrientation;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
  aspectClass: string;
} {
  if (orientation === 'portrait') {
    return {
      orientation: 'portrait',
      widthMm: 210,
      heightMm: 297,
      widthPx: 794,
      heightPx: 1122,
      aspectClass: 'lg:aspect-[1/1.414] max-w-[794px]',
    };
  }
  return {
    orientation: 'landscape',
    widthMm: 297,
    heightMm: 210,
    widthPx: 1122,
    heightPx: 794,
    aspectClass: 'lg:aspect-[1.414/1] max-w-5xl',
  };
}

export interface DiplomaWorldTranscriptPillar {
  worldNum: number;
  code: string;
  pillarTitle: string;
  statutesCovered: string;
  gradeSeal: string;
}

export const MASTER_DIPLOMA_TRANSCRIPT_PILLARS: DiplomaWorldTranscriptPillar[] = [
  {
    worldNum: 1,
    code: 'BOOK III · TITLE I',
    pillarTitle: 'Hours of Work & Overtime',
    statutesCovered: 'Arts. 82–90 · 8h Normal · +25% OT · +10% NSD',
    gradeSeal: 'SUMMA · SEALED',
  },
  {
    worldNum: 2,
    code: 'ARTS. 91–96 · P.D. 851',
    pillarTitle: 'Rest Days, Holidays & 13th Mo.',
    statutesCovered: '200% Regular · 130% Special · R.A. 11360 100%',
    gradeSeal: 'SUMMA · SEALED',
  },
  {
    worldNum: 3,
    code: 'ARTS. 97–129 · D.O. 174',
    pillarTitle: 'Minimum Wages & Contracting',
    statutesCovered: 'R.A. 6727 · Pineda Formula · ₱5M Valid Contractor',
    gradeSeal: 'SUMMA · SEALED',
  },
  {
    worldNum: 4,
    code: 'SPECIAL PROTECTION',
    pillarTitle: 'Kasambahay, Youth & PWD',
    statutesCovered: 'R.A. 10361 · R.A. 9231 · R.A. 7277 · R.A. 11165',
    gradeSeal: 'SUMMA · SEALED',
  },
  {
    worldNum: 5,
    code: 'BOOK VI · SECURITY',
    pillarTitle: 'Tenure, Due Process & Retirement',
    statutesCovered: 'Arts. 294–302 · Twin-Notice · R.A. 7641 22.5d',
    gradeSeal: 'SUMMA · SEALED',
  },
  {
    worldNum: 6,
    code: 'STATUTORY LEAVES',
    pillarTitle: 'Maternal, Parental & Safe Spaces',
    statutesCovered: 'R.A. 11210 (105d) · R.A. 8187 · R.A. 9262 · 9710',
    gradeSeal: 'SUMMA · SEALED',
  },
];
