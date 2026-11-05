/**
 * Round 14 Features:
 * - Dynamic Game Question Randomization & Option Shuffling
 * - Spaced-Repetition Review-Now Calculation & Overdue Verification
 * - Pure Vector Copyable PDF Exporter Guard
 * - Mario World Random Element Generator (Easter Eggs & Thematic Flavors)
 * - Engaging Study Modes (Speedrun Sprint & Topic Duel Matrix)
 */

import { LawTopic } from '../types/laborLaw';

export interface ShuffledChoiceResult {
  options: string[];
  correctIndex: number;
}

/**
 * Shuffles choice options so that correct answers are never always in index 0
 * and options are distributed unpredictably across A, B, C, D slots.
 */
export function shuffleChoiceOptionsSafely(
  options: readonly string[],
  correctIndex: number,
  rng: () => number = Math.random
): ShuffledChoiceResult {
  if (!options || options.length <= 1) {
    return { options: [...(options || [])], correctIndex: Math.max(0, correctIndex) };
  }
  const tagged = options.map((opt, idx) => ({
    text: opt,
    isCorrect: idx === correctIndex,
  }));

  for (let i = tagged.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = tagged[i];
    tagged[i] = tagged[j];
    tagged[j] = temp;
  }

  const nextOptions = tagged.map((t) => t.text);
  const nextCorrectIndex = Math.max(0, tagged.findIndex((t) => t.isCorrect));

  return {
    options: nextOptions,
    correctIndex: nextCorrectIndex,
  };
}

/**
 * Random Mario World Flavor Elements with Philippine Labor Law parallels
 */
export interface MarioWorldElement {
  id: string;
  name: string;
  marioItem: string;
  articleCitation: string;
  quote: string;
  iconType:
    | 'mushroom'
    | '1up'
    | 'star'
    | 'flower'
    | 'coin'
    | 'pipe'
    | 'block'
    | 'feather'
    | 'shell'
    | 'parasol'
    | 'egg'
    | 'vacuum'
    | 'crown';
  // Aliases for UI consumers (App.tsx, TopicCard.tsx)
  icon: string;
  elementIcon: string;
  statuteCitation: string;
  doctrineSummary: string;
  flavorQuote: string;
  analogyTitle: string;
  laborDoctrineAnalogy: string;
  character: string;
}

export const MARIO_WORLD_ELEMENTS: MarioWorldElement[] = [
  {
    id: 'elem_mushroom',
    name: 'Super Mushroom',
    marioItem: 'Super Mushroom (Size Boost)',
    laborConcept: 'Statutory Basic Minimum Wage & Floor Pay',
    articleCitation: 'Labor Code Art. 99 & RTWPB Wage Orders',
    iconType: 'mushroom',
    quote: 'Mushroom grows you to full stature—just like statutory minimum wage protects basic worker subsistence without illegal deductions!',
    icon: 'MUSHROOM',
    elementIcon: 'MUSHROOM',
    statuteCitation: 'Labor Code Art. 99 & RTWPB Wage Orders',
    doctrineSummary: 'Statutory Basic Minimum Wage & Floor Pay',
    flavorQuote: 'Mushroom grows you to full stature—just like statutory minimum wage protects basic worker subsistence without illegal deductions!',
    analogyTitle: 'Super Mushroom Floor',
    laborDoctrineAnalogy: 'Statutory Basic Minimum Wage & Floor Pay',
    character: 'Mario',
  },
  {
    id: 'elem_fire_flower',
    name: 'Fire Flower',
    marioItem: 'Fire Flower (Fireball Power)',
    laborConcept: 'Night Shift Differential (10PM–6AM +10%)',
    articleCitation: 'Labor Code Art. 86',
    iconType: 'flower',
    quote: 'Working the graveyard hours? Fire Flower illuminates the night and awards an extra +10% regular rate for every hour between 10:00 PM and 6:00 AM!',
    icon: 'FLOWER',
    elementIcon: 'FLOWER',
    statuteCitation: 'Labor Code Art. 86',
    doctrineSummary: 'Night Shift Differential (10PM–6AM +10%)',
    flavorQuote: 'Working the graveyard hours? Fire Flower illuminates the night and awards an extra +10% regular rate for every hour between 10:00 PM and 6:00 AM!',
    analogyTitle: 'Fire Flower Night Illuminator',
    laborDoctrineAnalogy: 'Night Shift Differential (10PM–6AM +10%)',
    character: 'Mario',
  },
  {
    id: 'elem_star',
    name: 'Super Star',
    marioItem: 'Super Star (Invincibility)',
    laborConcept: 'Solidary Liability for Unpaid Wages',
    articleCitation: 'Labor Code Art. 106 & 109 · DOLE D.O. 174',
    iconType: 'star',
    quote: 'Invincible shield! In labor contracting, the principal is solidarily liable with the contractor for unpaid minimum wages and benefits!',
    icon: 'STAR',
    elementIcon: 'STAR',
    statuteCitation: 'Labor Code Art. 106 & 109 · DOLE D.O. 174',
    doctrineSummary: 'Solidary Liability for Unpaid Wages',
    flavorQuote: 'Invincible shield! In labor contracting, the principal is solidarily liable with the contractor for unpaid minimum wages and benefits!',
    analogyTitle: 'Super Star Solidary Shield',
    laborDoctrineAnalogy: 'Solidary Liability for Unpaid Wages',
    character: 'Star Power',
  },
  {
    id: 'elem_1up',
    name: '1-Up Mushroom',
    marioItem: '1-Up Green Mushroom (Extra Life)',
    laborConcept: '5-Day Service Incentive Leave (Commutable)',
    articleCitation: 'Labor Code Art. 95',
    iconType: 'mushroom',
    quote: 'Extra life in your pocket! 5 days of paid SIL after 1 year of service, fully commutable to cash if unused at year-end!',
    icon: '1UP',
    elementIcon: '1UP',
    statuteCitation: 'Labor Code Art. 95',
    doctrineSummary: '5-Day Service Incentive Leave (Commutable)',
    flavorQuote: 'Extra life in your pocket! 5 days of paid SIL after 1 year of service, fully commutable to cash if unused at year-end!',
    analogyTitle: '1-Up Extra Life Bank',
    laborDoctrineAnalogy: '5-Day Service Incentive Leave (Commutable)',
    character: 'Luigi',
  },
  {
    id: 'elem_pipe',
    name: 'Emerald Warp Pipe',
    marioItem: 'Warp Pipe (Shortcut Transit)',
    laborConcept: 'Compressed Workweek (CWW) Voluntary Agreement',
    articleCitation: 'DOLE Advisory No. 02-04 & 04-10',
    iconType: 'pipe',
    quote: 'Warp straight to the weekend! A valid Compressed Workweek condenses 48 hours into 4 or 5 days without triggering daily overtime pay!',
    icon: 'PIPE',
    elementIcon: 'PIPE',
    statuteCitation: 'DOLE Advisory No. 02-04 & 04-10',
    doctrineSummary: 'Compressed Workweek (CWW) Voluntary Agreement',
    flavorQuote: 'Warp straight to the weekend! A valid Compressed Workweek condenses 48 hours into 4 or 5 days without triggering daily overtime pay!',
    analogyTitle: 'Emerald Warp Pipe Shortcut',
    laborDoctrineAnalogy: 'Compressed Workweek (CWW) Voluntary Agreement',
    character: 'Toad',
  },
  {
    id: 'elem_question_block',
    name: 'Mystery [?] Block',
    marioItem: '[ ? ] Question Block (Reward Surprise)',
    laborConcept: '13th Month Pay (P.D. 851)',
    articleCitation: 'Presidential Decree No. 851',
    iconType: 'block',
    quote: 'Hit the block before December 24! Mandatory 13th Month Pay is total basic salary earned during the calendar year divided by 12!',
    icon: 'BLOCK',
    elementIcon: 'BLOCK',
    statuteCitation: 'Presidential Decree No. 851',
    doctrineSummary: '13th Month Pay (P.D. 851)',
    flavorQuote: 'Hit the block before December 24! Mandatory 13th Month Pay is total basic salary earned during the calendar year divided by 12!',
    analogyTitle: 'Mystery Question Block Bounty',
    laborDoctrineAnalogy: '13th Month Pay (P.D. 851)',
    character: 'Yoshi',
  },
  {
    id: 'elem_feather',
    name: 'Super Cape Feather',
    marioItem: 'Cape Feather (Glide Over Traps)',
    laborConcept: 'Exemption from Statutory Hours of Work',
    articleCitation: 'Labor Code Art. 82',
    iconType: 'feather',
    quote: 'Glide over hours-of-work restrictions! Managerial employees, managerial staff, field personnel, and family members are exempt from Art. 83–96!',
    icon: 'FEATHER',
    elementIcon: 'FEATHER',
    statuteCitation: 'Labor Code Art. 82',
    doctrineSummary: 'Exemption from Statutory Hours of Work',
    flavorQuote: 'Glide over hours-of-work restrictions! Managerial employees, managerial staff, field personnel, and family members are exempt from Art. 83–96!',
    analogyTitle: 'Cape Feather Flight Exemption',
    laborDoctrineAnalogy: 'Exemption from Statutory Hours of Work',
    character: 'Mario',
  },
  {
    id: 'elem_koopa_shell',
    name: 'Red Koopa Shell',
    marioItem: 'Red Shell (Homing Strike)',
    laborConcept: 'Wage Distortion Dispute Correction',
    articleCitation: 'Labor Code Art. 124 (Pineda Doctrine)',
    iconType: 'shell',
    quote: 'Target restored hierarchy! When statutory wage orders crush the pay difference between job grades, wage distortion formulas restore fair margins!',
    icon: 'SHELL',
    elementIcon: 'SHELL',
    statuteCitation: 'Labor Code Art. 124 (Pineda Doctrine)',
    doctrineSummary: 'Wage Distortion Dispute Correction',
    flavorQuote: 'Target restored hierarchy! When statutory wage orders crush the pay difference between job grades, wage distortion formulas restore fair margins!',
    analogyTitle: 'Red Shell Homing Correction',
    laborDoctrineAnalogy: 'Wage Distortion Dispute Correction',
    character: 'Koopa Troopa',
  },
  {
    id: 'elem_coin',
    name: 'Dragon Gold Coin',
    marioItem: 'Dragon Coin (+1000 Pts)',
    laborConcept: 'Service Charges 100% Equal Distribution',
    articleCitation: 'Labor Code Art. 96 as amended by R.A. 11360',
    iconType: 'coin',
    quote: 'No management retention! 100% of collected service charges must be equally distributed among all rank-and-file and supervisory workers!',
    icon: 'COIN',
    elementIcon: 'COIN',
    statuteCitation: 'Labor Code Art. 96 as amended by R.A. 11360',
    doctrineSummary: 'Service Charges 100% Equal Distribution',
    flavorQuote: 'No management retention! 100% of collected service charges must be equally distributed among all rank-and-file and supervisory workers!',
    analogyTitle: 'Dragon Coin Equal Share',
    laborDoctrineAnalogy: 'Service Charges 100% Equal Distribution',
    character: 'Toadette',
  },
  {
    id: 'elem_yoshi_egg',
    name: 'Yoshi Spotted Egg',
    marioItem: 'Yoshi Egg (New Life)',
    laborConcept: '105-Day Expanded Maternity Leave',
    articleCitation: 'R.A. 11210 · 105 Days Full Pay',
    iconType: 'mushroom',
    quote: 'Nurturing new life! R.A. 11210 guarantees 105 calendar days of paid maternity leave for every pregnancy regardless of marital status or frequency!',
    icon: 'EGG',
    elementIcon: 'EGG',
    statuteCitation: 'R.A. 11210 · 105 Days Full Pay',
    doctrineSummary: '105-Day Expanded Maternity Leave',
    flavorQuote: 'Nurturing new life! R.A. 11210 guarantees 105 calendar days of paid maternity leave for every pregnancy regardless of marital status or frequency!',
    analogyTitle: 'Yoshi Egg Nesting Protection',
    laborDoctrineAnalogy: '105-Day Expanded Maternity Leave',
    character: 'Yoshi',
  },
  {
    id: 'elem_poltergust',
    name: "Luigi's Poltergust G-00",
    marioItem: 'Poltergust (Ghost Vacuum)',
    laborConcept: 'Unmasking Labor-Only Ghost Agencies',
    articleCitation: 'Labor Code Art. 106 & DOLE D.O. 174',
    iconType: 'pipe',
    quote: 'Suck up sham contractors! Labor-only contracting is a prohibited ghost scheme; the law declares the principal as direct employer from day one!',
    icon: 'VACUUM',
    elementIcon: 'VACUUM',
    statuteCitation: 'Labor Code Art. 106 & DOLE D.O. 174',
    doctrineSummary: 'Unmasking Labor-Only Ghost Agencies',
    flavorQuote: 'Suck up sham contractors! Labor-only contracting is a prohibited ghost scheme; the law declares the principal as direct employer from day one!',
    analogyTitle: 'Poltergust Anti-Ghost Cleaner',
    laborDoctrineAnalogy: 'Unmasking Labor-Only Ghost Agencies',
    character: 'Luigi',
  },
  {
    id: 'elem_peach_parasol',
    name: "Princess Peach's Royal Parasol",
    marioItem: 'Royal Parasol (Protective Shield)',
    laborConcept: 'Safe Spaces Act & Special Leaves for Women',
    articleCitation: 'R.A. 11313, R.A. 9710 & R.A. 9262',
    iconType: 'star',
    quote: 'Full workplace protection! Special leaves for gynecological surgeries (up to 2 months full pay) and VAWC leave (10 days paid) shield women from harassment and illness!',
    icon: 'PARASOL',
    elementIcon: 'PARASOL',
    statuteCitation: 'R.A. 11313, R.A. 9710 & R.A. 9262',
    doctrineSummary: 'Safe Spaces Act & Special Leaves for Women',
    flavorQuote: 'Full workplace protection! Special leaves for gynecological surgeries (up to 2 months full pay) and VAWC leave (10 days paid) shield women from harassment and illness!',
    analogyTitle: 'Royal Parasol Gender Shield',
    laborDoctrineAnalogy: 'Safe Spaces Act & Special Leaves for Women',
    character: 'Princess Peach',
  },
  {
    id: 'elem_bowser_spikes',
    name: "Bowser's Spiked Shell",
    marioItem: 'Spiked Shell (Tough Defense)',
    laborConcept: 'Twin-Notice Rule for Just Cause Dismissal',
    articleCitation: 'King of Kings Transport v. Mamac',
    iconType: 'shell',
    quote: 'Due process armor! Even when valid just cause exists, employer must serve: (1) First Notice (NTE with >= 5 calendar days to answer), (2) Hearing, and (3) Written Notice of Termination!',
    icon: 'SHIELD',
    elementIcon: 'SHIELD',
    statuteCitation: 'King of Kings Transport v. Mamac',
    doctrineSummary: 'Twin-Notice Rule for Just Cause Dismissal',
    flavorQuote: 'Due process armor! Even when valid just cause exists, employer must serve: (1) First Notice (NTE with >= 5 calendar days to answer), (2) Hearing, and (3) Written Notice of Termination!',
    analogyTitle: 'Spiked Shell Due Process Armor',
    laborDoctrineAnalogy: 'Twin-Notice Rule for Just Cause Dismissal',
    character: 'Bowser',
  },
  {
    id: 'elem_wario_magnet',
    name: "Wario's Coin Magnet",
    marioItem: 'Coin Magnet (Attracts Gold)',
    laborConcept: 'Prohibition Against Unlawful Deductions',
    articleCitation: 'Labor Code Art. 113 & 116',
    iconType: 'coin',
    quote: 'Hands off the worker’s wages! Deductions are strictly limited to insurance, union dues check-off, and debts legally due. No employer kickbacks allowed!',
    icon: 'MAGNET',
    elementIcon: 'MAGNET',
    statuteCitation: 'Labor Code Art. 113 & 116',
    doctrineSummary: 'Prohibition Against Unlawful Deductions',
    flavorQuote: 'Hands off the worker’s wages! Deductions are strictly limited to insurance, union dues check-off, and debts legally due. No employer kickbacks allowed!',
    analogyTitle: 'Coin Magnet Wage Protection',
    laborDoctrineAnalogy: 'Prohibition Against Unlawful Deductions',
    character: 'Wario',
  },
  {
    id: 'elem_bobomb',
    name: 'Bob-omb Fuse Clock',
    marioItem: 'Bob-omb (Ticking Timer)',
    laborConcept: 'Strike Notice & Cooling-Off Period Deadlines',
    articleCitation: 'Labor Code Art. 278 [263]',
    iconType: 'flower',
    quote: 'Strict statutory countdown! 30 days cooling-off period for bargaining deadlocks; 15 days for unfair labor practice strikes; plus 7-day strike vote report!',
    icon: 'FUSE',
    elementIcon: 'FUSE',
    statuteCitation: 'Labor Code Art. 278 [263]',
    doctrineSummary: 'Strike Notice & Cooling-Off Period Deadlines',
    flavorQuote: 'Strict statutory countdown! 30 days cooling-off period for bargaining deadlocks; 15 days for unfair labor practice strikes; plus 7-day strike vote report!',
    analogyTitle: 'Bob-omb Countdown Clock',
    laborDoctrineAnalogy: 'Strike Notice & Cooling-Off Period Deadlines',
    character: 'Captain Toad',
  },
  {
    id: 'elem_chain_chomp',
    name: 'Chain Chomp Restraint',
    marioItem: 'Chain Chomp (Restrained Tether)',
    laborConcept: 'Non-Compete Clause Reasonable Restraint Test',
    articleCitation: 'Tiu v. Platinum Plans (SC En Banc)',
    iconType: 'pipe',
    quote: 'Post-employment bounds! Non-compete covenants are valid ONLY IF reasonably limited in time (max 1–2 yrs), geographic trade territory, and specific competing business!',
    icon: 'CHAIN',
    elementIcon: 'CHAIN',
    statuteCitation: 'Tiu v. Platinum Plans (SC En Banc)',
    doctrineSummary: 'Non-Compete Clause Reasonable Restraint Test',
    flavorQuote: 'Post-employment bounds! Non-compete covenants are valid ONLY IF reasonably limited in time (max 1–2 yrs), geographic trade territory, and specific competing business!',
    analogyTitle: 'Chain Chomp Reasonable Tether',
    laborDoctrineAnalogy: 'Non-Compete Clause Reasonable Restraint Test',
    character: 'Mario World Referee',
  },
];

/**
 * Picks a random Mario World Element
 */
export function getRandomMarioWorldElement(rng: () => number = Math.random): MarioWorldElement {
  const idx = Math.floor(rng() * MARIO_WORLD_ELEMENTS.length);
  return MARIO_WORLD_ELEMENTS[idx] || MARIO_WORLD_ELEMENTS[0];
}

/**
 * Filter topics by world and search query
 */
export function filterTopicsByWorldAndQuery(
  topics: readonly LawTopic[],
  selectedWorld: string,
  searchQuery: string
): LawTopic[] {
  const cleanQuery = (searchQuery || '').trim().toLowerCase();
  return topics.filter((t) => {
    if (selectedWorld !== 'all' && t.worldId !== selectedWorld) {
      return false;
    }
    if (!cleanQuery) return true;
    return (
      t.title.toLowerCase().includes(cleanQuery) ||
      t.summary.toLowerCase().includes(cleanQuery) ||
      t.badge.toLowerCase().includes(cleanQuery) ||
      (t.keyDoctrines && t.keyDoctrines.some((d) => d.toLowerCase().includes(cleanQuery))) ||
      (t.rules &&
        t.rules.some(
          (r) =>
            r.heading.toLowerCase().includes(cleanQuery) ||
            (r.description && r.description.toLowerCase().includes(cleanQuery)) ||
            (r.items && r.items.some((it) => it.toLowerCase().includes(cleanQuery)))
        ))
    );
  });
}

/**
 * Topic Duel comparison pairing definitions
 */
export interface TopicDuelConcept {
  name: string;
  basis: string;
  multiplierOrRule: string;
  keyPoints: string[];
}

export interface TopicDuelDoctrine {
  label: string;
  statute: string;
  rule: string;
  payMultiplier: string;
}

export interface TopicDuelPair {
  id: string;
  title: string;
  topicIdA?: string;
  topicIdB?: string;
  conceptA: TopicDuelConcept;
  conceptB: TopicDuelConcept;
  pivotalDistinction: string;
  trapWarning: string;

  // App.tsx modal properties
  doctrineA: TopicDuelDoctrine;
  doctrineB: TopicDuelDoctrine;
  scenario: string;
  verdict: string;
  trap: string;
  memoryRule: string;

  // TopicCard.tsx component properties
  citationA: string;
  citationB: string;
  summaryA: string;
  summaryB: string;
  keyDifferences: string[];
  barExamTrap: string;
}

export const TOPIC_DUEL_PAIRS: TopicDuelPair[] = [
  {
    id: 'duel_regular_vs_special_holiday',
    title: 'Regular Holiday vs. Special Non-Working Day',
    topicIdA: 'art-94-regular-holiday',
    topicIdB: 'art-93-rest-day-special-holiday',
    conceptA: {
      name: 'Regular Holiday (12 National Days)',
      basis: 'Labor Code Art. 94',
      multiplierOrRule: 'Unworked: 100% · Worked: 200% (260% on Rest Day)',
      keyPoints: [
        'Paid even if unworked (provided present or on paid leave day prior)',
        'Compulsory 200% daily rate if worked first 8 hours',
        '+30% overtime computed on the 200% holiday rate (260% hourly)',
      ],
    },
    conceptB: {
      name: 'Special Non-Working Day',
      basis: 'Labor Code Art. 93(c)',
      multiplierOrRule: 'Unworked: 0% · Worked: 130% (150% on Rest Day)',
      keyPoints: [
        'Strictly "No work, no pay" principle applies if unworked',
        '130% daily rate if worked on an ordinary day',
        '150% daily rate if falling on employee scheduled rest day',
      ],
    },
    pivotalDistinction:
      'Regular holidays guarantee paid leave even when unworked; Special non-working days adhere strictly to "No Work, No Pay" unless CBA/practice says otherwise.',
    trapWarning: 'Beware of double regular holidays where unworked pays 200% and worked pays 300%!',
    doctrineA: {
      label: 'Regular Holiday',
      statute: 'Labor Code Art. 94',
      rule: 'Paid even if unworked (100%); 200% when worked on regular day.',
      payMultiplier: '200% daily rate (260% if coinciding with rest day)',
    },
    doctrineB: {
      label: 'Special Non-Working Day',
      statute: 'Labor Code Art. 93(c)',
      rule: 'No work, no pay if unworked; 130% when worked on regular day.',
      payMultiplier: '130% daily rate (150% if coinciding with rest day)',
    },
    scenario:
      'Mario works as a kart mechanic earning ₱800/day. On Independence Day (Regular Holiday), he works 8 hours. On Ninoy Aquino Day (Special Day), he stays home.',
    verdict:
      'Mario receives ₱1,600 (200%) on Independence Day. On Ninoy Aquino Day, he gets ₱0 under "No work, no pay" unless CBA provides otherwise.',
    trap: 'Unworked Regular Holiday pays 100% ONLY IF the employee was present or on paid leave on the workday immediately preceding!',
    memoryRule: 'Regular = 200% worked / 100% unworked; Special = 130% worked / 0% unworked.',
    citationA: 'Labor Code Art. 94',
    citationB: 'Labor Code Art. 93(c)',
    summaryA: 'Compulsory paid holiday; 200% if worked on ordinary day, 260% if worked on rest day.',
    summaryB: 'No work no pay if unworked; 130% if worked on ordinary day, 150% if on rest day.',
    keyDifferences: [
      'Unworked compensation: 100% basic salary vs 0% (No work, no pay)',
      'Worked rate: 200% vs 130% of standard basic day rate',
      'Rest day coincidence: 260% vs 150%',
      'Overtime premium calculation: Computed on top of 200% vs 130%',
    ],
    barExamTrap: 'Beware of double regular holidays where unworked pays 200% and worked pays 300%!',
  },
  {
    id: 'duel_facilities_vs_supplements',
    title: 'Facilities vs. Supplements (Mabeza Doctrine)',
    topicIdA: 'art-97-wages-facilities-supplements',
    topicIdB: 'art-113-wage-deductions',
    conceptA: {
      name: 'Facilities (Deductible)',
      basis: 'Art. 97(f) · Mabeza v. NLRC',
      multiplierOrRule: 'Fair and reasonable value forms part of basic wage',
      keyPoints: [
        'Items of expense necessary for worker and family subsistence (meals, housing)',
        'Allowed to be deducted ONLY IF: customary + voluntary written authorization + fair value',
        'Benefit is primarily for the employee and family sustenance',
      ],
    },
    conceptB: {
      name: 'Supplements (Non-Deductible)',
      basis: 'Art. 97(f) · SLL International Cables',
      multiplierOrRule: 'Independent of basic wage; CANNOT be deducted',
      keyPoints: [
        'Extra remuneration or special privilege given for employer’s business convenience',
        'Cannot be deducted from employee minimum wage',
        'Includes meals furnished on-site for special business exigencies or shifts',
      ],
    },
    pivotalDistinction:
      'Purpose test: Is the benefit for worker subsistence (Facility) or for employer’s business convenience (Supplement)?',
    trapWarning: 'Oral agreement to deduct meals is VOID. Written consent is mandatory!',
    doctrineA: {
      label: 'Facilities (Deductible)',
      statute: 'Labor Code Art. 97(f)',
      rule: 'Subsistence expenses deductible ONLY WITH written employee authorization at fair value.',
      payMultiplier: 'Forms part of basic wage if authorized',
    },
    doctrineB: {
      label: 'Supplements (Non-Deductible)',
      statute: 'SLL Intl Cables & Telecommunications',
      rule: 'Extra benefits given for convenience of employer; strictly NON-DEDUCTIBLE.',
      payMultiplier: 'Over and above basic minimum wage',
    },
    scenario:
      'Peach Castle Cafeteria provides lunch to hotel receptionists who are required to remain on premises during their lunch hour.',
    verdict:
      'Meals are supplements (for employer convenience) and CANNOT be deducted from statutory minimum wages.',
    trap: 'Oral deduction agreements are completely void; written employee consent is an absolute prerequisite for facility deduction.',
    memoryRule: 'Subsistence for worker = Facility (Deductible); Convenience of employer = Supplement (Non-deductible).',
    citationA: 'Art. 97(f) · Mabeza v. NLRC',
    citationB: 'Art. 97(f) · SLL International Cables',
    summaryA: 'Articles for worker subsistence deductible only with voluntary written authorization.',
    summaryB: 'Benefits granted for employer convenience; strictly non-deductible from minimum wage.',
    keyDifferences: [
      'Beneficiary purpose: Employee subsistence vs Employer convenience',
      'Wage deductibility: Permissible with written consent vs Completely non-deductible',
      'Computation inclusion: Part of basic wage vs Above and beyond basic wage',
    ],
    barExamTrap: 'Oral agreement to deduct meals is VOID. Written consent is mandatory!',
  },
  {
    id: 'duel_contracting_vs_labor_only',
    title: 'Legitimate Job Contracting vs. Prohibited Labor-Only Contracting',
    topicIdA: 'art-106-contractor-subcontractor',
    topicIdB: 'art-109-solidary-liability',
    conceptA: {
      name: 'Legitimate Job Contractor',
      basis: 'Art. 106 · DOLE D.O. 174-17',
      multiplierOrRule: 'Permissible commercial service arrangement',
      keyPoints: [
        'Must possess substantial capital (at least ₱5,000,000 paid-up capital or net worth)',
        'Contractor independently exercises control over means and methods',
        'Principal is solidarily liable ONLY for unpaid wages and monetary claims',
      ],
    },
    conceptB: {
      name: 'Labor-Only Contractor (Prohibited)',
      basis: 'Art. 106(4) · D.O. 174-17',
      multiplierOrRule: 'Strictly prohibited; Agent of principal only',
      keyPoints: [
        'Lacks substantial capital OR workers perform activities directly related to main business',
        'Principal exercises control over means, methods, and conduct of workers',
        'Principal is declared DIRECT EMPLOYER for all legal intents and purposes',
      ],
    },
    pivotalDistinction:
      'Control test is supreme: If the principal dictates means and methods, it is conclusively Labor-Only Contracting regardless of capital.',
    trapWarning: 'Even with ₱10M capital, if principal controls means and methods, it is Labor-Only!',
    doctrineA: {
      label: 'Legitimate Contracting',
      statute: 'Labor Code Art. 106 & DOLE D.O. 174',
      rule: 'Contractor has >= ₱5M capital and independent control over means and methods.',
      payMultiplier: 'Principal solidarily liable ONLY for wage violations',
    },
    doctrineB: {
      label: 'Labor-Only Contracting',
      statute: 'Labor Code Art. 106(4)',
      rule: 'Prohibited sham agency: Lacks capital OR principal exercises control over workers.',
      payMultiplier: 'Principal declared DIRECT EMPLOYER with full regular status',
    },
    scenario:
      'Bowser Castle hires Goombas through "Spike Agency" which has ₱10,000,000 capital, but Bowser personally directs their daily marching routes and disciplines them.',
    verdict:
      'Because Bowser controls the means and methods of work, Spike Agency is a Labor-Only Contractor and Bowser is the direct employer.',
    trap: 'Substantial capital alone does not save a contractor if the principal exercises control over the means and methods!',
    memoryRule: 'Right of control trumps capital every time in contractor classification.',
    citationA: 'Art. 106 · DOLE D.O. 174-17',
    citationB: 'Art. 106(4) · D.O. 174-17',
    summaryA: 'Contractor possesses substantial capital (₱5M+) and controls means and methods.',
    summaryB: 'Sham scheme where principal controls workers; principal deemed direct employer.',
    keyDifferences: [
      'Substantial capital: Required (₱5M net worth) vs Ineffective defense if control exists',
      'Work supervision: Contractor controls workers vs Principal controls means and methods',
      'Legal consequence: Principal solidary for wages only vs Principal is direct employer',
    ],
    barExamTrap: 'Even with ₱10M capital, if principal controls means and methods, it is Labor-Only!',
  },
  {
    id: 'duel_maternity_vs_paternity',
    title: 'Expanded Maternity Leave (RA 11210) vs. Paternity Leave (RA 8187)',
    topicIdA: 'ra-11210-expanded-maternity-leave',
    topicIdB: 'ra-8187-paternity-leave',
    conceptA: {
      name: 'Expanded Maternity Leave (R.A. 11210)',
      basis: 'R.A. 11210',
      multiplierOrRule: '105 paid days (+15d solo parent) / 60d miscarriage',
      keyPoints: [
        'Granted in every instance of pregnancy regardless of frequency or civil status',
        'Option to transfer up to 7 days to the father / alternate caregiver',
        'Covered by full pay (SSS benefit + employer salary differential)',
      ],
    },
    conceptB: {
      name: 'Paternity Leave (R.A. 8187)',
      basis: 'R.A. 8187',
      multiplierOrRule: '7 paid calendar days (+ up to 7d transferred from mother)',
      keyPoints: [
        'Available only to legally married male employee cohabiting with legitimate spouse',
        'Limited strictly to the first 4 deliveries / miscarriages of the lawful spouse',
        'Non-cumulative and non-commutable to cash if unused',
      ],
    },
    pivotalDistinction:
      'Maternity leave applies to every pregnancy regardless of marital status; Paternity leave strictly requires valid marriage and cohabitation, capped at first 4 deliveries.',
    trapWarning: 'Common-law husbands are NOT entitled to RA 8187 Paternity Leave (though may receive 7d transferred maternity leave).',
    doctrineA: {
      label: 'Maternity Leave (RA 11210)',
      statute: 'R.A. No. 11210',
      rule: '105 paid days for female worker regardless of civil status or frequency of pregnancy.',
      payMultiplier: '100% full pay (SSS + Employer Differential)',
    },
    doctrineB: {
      label: 'Paternity Leave (RA 8187)',
      statute: 'R.A. No. 8187',
      rule: '7 paid days for legally married male cohabiting with spouse, up to first 4 deliveries.',
      payMultiplier: '100% full basic salary from employer',
    },
    scenario:
      'Mario and Peach are unmarried cohabiting partners. Mario requests 7 days paternity leave for the birth of their baby.',
    verdict:
      'Mario is NOT entitled to RA 8187 Paternity Leave (marriage required). However, Peach may transfer up to 7 days of her 105-day maternity leave to Mario under RA 11210!',
    trap: 'Paternity leave under RA 8187 strictly requires a valid marriage, whereas RA 11210 maternity leave applies to ALL mothers regardless of marital status.',
    memoryRule: 'Maternity = All mothers, 105 days, unlimited deliveries; Paternity = Married only, 7 days, max 4 deliveries.',
    citationA: 'R.A. 11210',
    citationB: 'R.A. 8187',
    summaryA: '105 paid calendar days (+15 for solo mother) for any pregnancy regardless of marital status.',
    summaryB: '7 paid calendar days for legally married male cohabiting with wife; capped at 4 deliveries.',
    keyDifferences: [
      'Marital status: Irrelevant vs Strictly required legitimate marriage',
      'Duration: 105 days (120 for solo parent) vs 7 days',
      'Delivery frequency limit: Unlimited vs Capped at first 4 deliveries',
    ],
    barExamTrap: 'Common-law husbands are NOT entitled to RA 8187 Paternity Leave (though may receive 7d transferred maternity leave).',
  },
  {
    id: 'duel_retrenchment_vs_redundancy',
    title: 'Retrenchment to Prevent Losses vs. Redundancy',
    topicIdA: 'art-298-authorized-causes-retrenchment',
    topicIdB: 'art-298-authorized-causes-redundancy',
    conceptA: {
      name: 'Retrenchment to Prevent Losses',
      basis: 'Labor Code Art. 298 [283]',
      multiplierOrRule: 'Separation Pay: At least 1/2 month pay per year of service (min 1 month)',
      keyPoints: [
        'Initiated to prevent imminent or actual financial losses (audited financial statements required)',
        'Fair and reasonable selection criteria (seniority, efficiency ratings)',
        '30-day prior written notice to DOLE and affected workers',
      ],
    },
    conceptB: {
      name: 'Redundancy',
      basis: 'Labor Code Art. 298 [283]',
      multiplierOrRule: 'Separation Pay: At least 1 month pay per year of service (higher rate!)',
      keyPoints: [
        'Positions are superfluous or in excess of actual business requirements',
        'Company does not need to show financial losses; business may be highly profitable',
        'Fair criteria (LIFO, efficiency, reclassification) + 30-day notice to DOLE and workers',
      ],
    },
    pivotalDistinction:
      'Redundancy is based on superfluity of positions and pays 1 FULL month pay per year of service; Retrenchment is based on financial losses and pays 1/2 month pay per year.',
    trapWarning: 'Redundancy separation pay is double the retrenchment rate (1 month vs 1/2 month per year)!',
    doctrineA: {
      label: 'Retrenchment (Loss Prevention)',
      statute: 'Labor Code Art. 298 [283]',
      rule: 'Downsizing to avert imminent financial losses; requires proof through audited financial statements.',
      payMultiplier: '1/2 month pay per year of service (min 1 full month)',
    },
    doctrineB: {
      label: 'Redundancy (Superfluity)',
      statute: 'Labor Code Art. 298 [283]',
      rule: 'Abolishing superfluous positions; employer may be highly profitable.',
      payMultiplier: '1 full month pay per year of service (min 1 month)',
    },
    scenario:
      'Toad Motors invents an automated kart assembly bot that renders 5 mechanics redundant, while earning record profits.',
    verdict:
      'Redundancy applies. Toad Motors does not need to prove losses, but must pay 1 full month salary per year of service.',
    trap: 'Do not confuse separation pay multipliers: Redundancy is 1 month/yr; Retrenchment to prevent losses is 1/2 month/yr!',
    memoryRule: 'Redundancy = Superfluous + 1 month/yr; Retrenchment = Losses + 1/2 month/yr.',
    citationA: 'Labor Code Art. 298 [283]',
    citationB: 'Labor Code Art. 298 [283]',
    summaryA: 'Economic cutbacks to avert proven financial losses; pays 1/2 month per year of service.',
    summaryB: 'Abolition of superfluous positions; pays 1 month per year of service even if profitable.',
    keyDifferences: [
      'Financial condition: Losses must be proven vs Company can be highly profitable',
      'Ground: Averting severe losses vs Superfluity/duplication of work',
      'Separation pay multiplier: 1/2 month pay per year vs 1 full month pay per year',
    ],
    barExamTrap: 'Redundancy separation pay is double the retrenchment rate (1 month vs 1/2 month per year)!',
  },
  {
    id: 'duel_just_vs_authorized_causes',
    title: 'Just Causes (Art. 297) vs. Authorized Causes (Art. 298–299)',
    topicIdA: 'art-297-just-causes-termination',
    topicIdB: 'art-298-authorized-causes-termination',
    conceptA: {
      name: 'Just Causes (Employee Fault)',
      basis: 'Labor Code Art. 297 [282]',
      multiplierOrRule: 'No separation pay (except equitable financial assistance for non-serious offenses)',
      keyPoints: [
        'Serious misconduct, willful disobedience, gross/habitual neglect, fraud, crimes',
        'Twin-Notice Rule: (1) Notice to Explain (min 5 days), (2) Hearing, (3) Notice of Dismissal',
        'Notice to DOLE is NOT required',
      ],
    },
    conceptB: {
      name: 'Authorized Causes (Business / Health Reasons)',
      basis: 'Labor Code Arts. 298 & 299 [283 & 284]',
      multiplierOrRule: 'Mandatory statutory separation pay (1/2 month or 1 month per year)',
      keyPoints: [
        'Installation of labor-saving devices, redundancy, retrenchment, closure, disease',
        'Single 30-day prior written notice to DOLE AND employee',
        'No hearing required; separation pay is mandatory',
      ],
    },
    pivotalDistinction:
      'Just causes stem from employee blameworthiness and require twin-notice (no DOLE notice, no separation pay); Authorized causes stem from business/health exigencies and require 30-day DOLE notice + mandatory separation pay.',
    trapWarning: 'Serrano/Agabon doctrine: Failure to follow procedure in Just Cause = nominal damages (₱30k); in Authorized Cause = ₱50k!',
    doctrineA: {
      label: 'Just Causes (Art. 297)',
      statute: 'Labor Code Art. 297 [282]',
      rule: 'Employee culpability (serious misconduct, insubordination); requires Twin-Notice procedure.',
      payMultiplier: '₱0 separation pay (forfeited due to employee fault)',
    },
    doctrineB: {
      label: 'Authorized Causes (Art. 298–299)',
      statute: 'Labor Code Arts. 298 & 299',
      rule: 'Business or health grounds; requires 30-day written notice to DOLE and employee.',
      payMultiplier: 'Mandatory statutory separation pay (1/2 mo or 1 mo per year)',
    },
    scenario:
      'Wario embezzles company funds. Employer fires him on the spot without notice or hearing, but valid proof exists.',
    verdict:
      'Dismissal is valid because just cause exists, but procedural due process was violated. Under Agabon v. NLRC, employer must pay ₱30,000 nominal damages.',
    trap: 'Agabon doctrine gives ₱30k nominal damages for procedurally defective Just Cause, while Jaka doctrine gives ₱50k for defective Authorized Cause!',
    memoryRule: 'Just Cause = Employee fault, Twin Notice, No DOLE notice, ₱0 separation; Authorized = Business ground, 30d DOLE notice, mandatory separation.',
    citationA: 'Labor Code Art. 297 [282]',
    citationB: 'Labor Code Arts. 298 & 299 [283 & 284]',
    summaryA: 'Employee blameworthy misconduct; Twin-Notice rule applies; no separation pay.',
    summaryB: 'Business exigencies or disease; 30-day DOLE notice applies; mandatory separation pay.',
    keyDifferences: [
      'Origin: Employee misconduct/fault vs Business/health necessity',
      'Due process procedure: Twin-Notice Rule + hearing vs 30-day prior written notice',
      'DOLE notification: Not required vs Mandatory 30-day notice to DOLE field office',
      'Separation pay: General rule is ₱0 vs Strictly mandatory by law',
    ],
    barExamTrap: 'Serrano/Agabon doctrine: Failure to follow procedure in Just Cause = nominal damages (₱30k); in Authorized Cause = ₱50k!',
  },
  {
    id: 'duel_13th_month_vs_bonus',
    title: '13th Month Pay (P.D. 851) vs. Discretionary Christmas Bonus',
    topicIdA: 'pd-851-13th-month-pay',
    topicIdB: 'art-97-wages-definition-bonus',
    conceptA: {
      name: '13th Month Pay (P.D. 851)',
      basis: 'Presidential Decree No. 851',
      multiplierOrRule: 'Statutory mandate: 1/12 of basic salary earned, on or before Dec 24',
      keyPoints: [
        'Mandatory right of all rank-and-file employees with >= 1 month service',
        'Pro-rated upon resignation or dismissal; strictly enforceable by DOLE',
        'Does not depend on employer financial profit',
      ],
    },
    conceptB: {
      name: 'Discretionary Christmas Bonus',
      basis: 'General Principles of Labor Law',
      multiplierOrRule: 'Management prerogative based on profit and company generosity',
      keyPoints: [
        'Not a demandable statutory right unless agreed upon in CBA or company practice',
        'Becomes demandable only if given unconditionally over a long period (non-diminution)',
        'May be subject to performance milestones or contingent on net profit',
      ],
    },
    pivotalDistinction:
      '13th month pay is a statutory obligation mandated by law; bonuses are gifts from employer largesse unless transformed into contractual rights via CBA or uninterrupted practice.',
    trapWarning: '13th month pay cannot be offset against ordinary bonuses unless specifically stipulated in writing as such!',
    doctrineA: {
      label: '13th Month Pay (P.D. 851)',
      statute: 'Presidential Decree No. 851',
      rule: 'Mandatory statutory benefit for all rank-and-file with >= 1 month service; due by Dec 24.',
      payMultiplier: '1/12 of total basic salary earned during the year',
    },
    doctrineB: {
      label: 'Discretionary Bonus',
      statute: 'Supreme Court Labor Jurisprudence',
      rule: 'Gratuity based on employer liberality; non-demandable unless guaranteed by contract or practice.',
      payMultiplier: 'Determined solely by management discretion',
    },
    scenario:
      'Bowser announces that because the castle did not earn gold coins this year, he will not pay 13th month pay.',
    verdict:
      'Bowser is liable for statutory violation. 13th Month Pay is mandatory by law and cannot be withheld due to lack of profit, unlike a discretionary bonus.',
    trap: '13th month pay is based only on basic salary, excluding allowances and overtime pay, unless incorporated by company policy.',
    memoryRule: '13th Month = Legal duty, mandatory by Dec 24; Bonus = Gratuity, dependent on goodwill/profit.',
    citationA: 'Presidential Decree No. 851',
    citationB: 'General Principles of Labor Law',
    summaryA: 'Mandatory statutory benefit equal to 1/12 of basic salary; mandatory by Dec 24.',
    summaryB: 'Discretionary gift or management incentive; non-demandable unless contractual.',
    keyDifferences: [
      'Legal basis: Statutory imperative (PD 851) vs Management prerogative/liberality',
      'Profit dependency: Payable regardless of profit vs Strictly contingent on company earnings',
      'Enforceability: Demandable as a matter of right vs Gratuitous unless established by custom',
    ],
    barExamTrap: '13th month pay cannot be offset against ordinary bonuses unless specifically stipulated in writing as such!',
  },
];
