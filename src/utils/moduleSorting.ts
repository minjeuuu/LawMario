import { LawTopic } from '../types/laborLaw';

export type TopicSortOption =
  | 'default'
  | 'alphabetical'
  | 'difficulty_easiest'
  | 'difficulty_hardest';

export interface TopicSortOptionMeta {
  value: TopicSortOption;
  label: string;
  shortLabel: string;
}

export const TOPIC_SORT_OPTIONS: TopicSortOptionMeta[] = [
  {
    value: 'default',
    label: 'Default (World Stage Order)',
    shortLabel: 'Stage Order',
  },
  {
    value: 'alphabetical',
    label: 'Alphabetical (A → Z)',
    shortLabel: 'Alphabetical',
  },
  {
    value: 'difficulty_easiest',
    label: 'Difficulty (Easiest First)',
    shortLabel: 'Easiest First',
  },
  {
    value: 'difficulty_hardest',
    label: 'Difficulty (Hardest First)',
    shortLabel: 'Hardest First',
  },
];

export function getTopicDifficultyRank(difficulty?: string): number {
  if (!difficulty) return 2;
  const normalized = difficulty.trim().toLowerCase();
  if (normalized === 'foundation' || normalized === 'easy' || normalized === 'beginner') {
    return 1;
  }
  if (normalized === 'intermediate' || normalized === 'medium' || normalized === 'standard') {
    return 2;
  }
  if (
    normalized === 'bar master' ||
    normalized === 'advanced' ||
    normalized === 'hard' ||
    normalized === 'master'
  ) {
    return 3;
  }
  return 2;
}

export function getFriendlyDifficultyLabel(difficulty?: string): string {
  const rank = getTopicDifficultyRank(difficulty);
  if (rank === 1) return 'Foundation (Easy)';
  if (rank === 3) return 'Advanced Mastery';
  return 'Intermediate';
}

/**
 * Pure, stable sort for Module Deck topics.
 * Preserves original stage order as tie-breaker when difficulties match.
 */
export function sortModuleTopics<
  T extends { id: string; title: string; difficulty?: string },
>(
  topics: readonly T[],
  sortOption: TopicSortOption,
  difficultyMap?: Record<string, string>
): T[] {
  if (sortOption === 'default' || topics.length <= 1) {
    return [...topics];
  }

  const indexed = topics.map((topic, index) => {
    const resolvedDifficulty = topic.difficulty || difficultyMap?.[topic.id] || 'Intermediate';
    return {
      topic,
      index,
      rank: getTopicDifficultyRank(resolvedDifficulty),
      cleanTitle: topic.title.replace(/^[^a-zA-Z0-9]+/, '').trim(),
    };
  });

  if (sortOption === 'alphabetical') {
    indexed.sort((a, b) => {
      const cmp = a.cleanTitle.localeCompare(b.cleanTitle, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
      return cmp !== 0 ? cmp : a.index - b.index;
    });
  } else if (sortOption === 'difficulty_easiest') {
    indexed.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.index - b.index;
    });
  } else if (sortOption === 'difficulty_hardest') {
    indexed.sort((a, b) => {
      if (a.rank !== b.rank) return b.rank - a.rank;
      return a.index - b.index;
    });
  }

  return indexed.map((entry) => entry.topic);
}

/**
 * Interactive Micro-Quiz ("Quick Knowledge Check") embedded inside every TopicCard
 * to make studying modules actively engaging with instant feedback and coin rewards.
 */
export interface TopicQuickCheckItem {
  topicId: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  rewardCoins: number;
}

const CURATED_TOPIC_QUICK_CHECKS: Record<string, Omit<TopicQuickCheckItem, 'topicId'>> = {
  'm1-coverage': {
    question:
      'Which element of the Four-Fold Test is the most decisive factor in determining an employer-employee relationship?',
    options: [
      'Selection and engagement of the worker',
      'Payment of wages by time or result',
      'Power of Control over the means and methods of work',
      'Possession of a company ID card',
    ],
    correctIndex: 2,
    explanation:
      'Under Philippine Labor Standards, the Control Test (right to control not just the end result, but the means and methods) is the most important determinant.',
    rewardCoins: 3,
  },
  'm1-hours-worked': {
    question:
      'What is the normal maximum daily hours of work for covered rank-and-file employees under Article 83?',
    options: ['6 hours per day', '8 hours per day', '10 hours per day', '12 hours per day'],
    correctIndex: 1,
    explanation:
      'Article 83 sets normal hours of work at no more than 8 hours a day (with special 40-hour/5-day rules for covered health personnel in large cities/hospitals).',
    rewardCoins: 3,
  },
  'm1-fwa-cww-meals-ot': {
    question:
      'An employee was 30 minutes late on Tuesday, then worked 1 hour of overtime on Wednesday. Can the employer offset Tuesday’s undertime against Wednesday’s overtime?',
    options: [
      'Yes, if within the same payroll week',
      'Yes, with verbal employee consent',
      'No — offsetting undertime by overtime is strictly prohibited by Article 88',
      'Only for monthly-paid employees',
    ],
    correctIndex: 2,
    explanation:
      'Article 88 explicitly prohibits offsetting undertime on one day by overtime work on another day because overtime carries a statutory premium (125%+).',
    rewardCoins: 3,
  },
  'm1-nsd-restday': {
    question:
      'What is the statutory Night Shift Differential (NSD) rate and covered time window under Article 86?',
    options: [
      'Not less than +10% per hour between 10:00 PM and 6:00 AM',
      'Not less than +20% per hour between 8:00 PM and 4:00 AM',
      'Not less than +25% per hour between 11:00 PM and 5:00 AM',
      'Flat ₱100 allowance per night shift',
    ],
    correctIndex: 0,
    explanation:
      'Every covered employee receives at least 10% additional pay on their regular hourly wage for each hour worked between 10:00 PM and 6:00 AM.',
    rewardCoins: 3,
  },
  'm2-holiday-pay': {
    question:
      'If a covered employee works 8 hours on a Regular Holiday that also falls on their scheduled Rest Day, what total pay multiplier applies?',
    options: ['150% of daily wage', '200% of daily wage', '230% of daily wage', '260% of daily wage'],
    correctIndex: 3,
    explanation:
      'Regular Holiday worked (200%) multiplied by the 130% Rest Day rate equals 260% of the employee’s basic daily wage.',
    rewardCoins: 3,
  },
  'm2-13th-month': {
    question:
      'Under P.D. No. 851, what is the minimum length of service in a calendar year required for a rank-and-file employee to earn pro-rated 13th Month Pay, and when must it be paid?',
    options: [
      'At least 6 months; paid on December 31',
      'At least 1 month; paid not later than December 24',
      'At least 1 full year; paid on January 15',
      'At least 3 months; paid on December 30',
    ],
    correctIndex: 1,
    explanation:
      'Rank-and-file employees who worked at least 1 month during the calendar year are entitled to 13th Month Pay (at least 1/12 of total basic salary earned), paid on or before December 24.',
    rewardCoins: 3,
  },
  'm2-service-charges': {
    question:
      'Under Republic Act No. 11360 (amending Article 96), what percentage of collected service charges in hotels and restaurants belongs to covered employees?',
    options: [
      '85% to workers, 15% to management',
      '90% to workers, 10% for breakage',
      '100% distributed completely and equally among covered employees',
      '50% shared equally with managerial staff',
    ],
    correctIndex: 2,
    explanation:
      'R.A. 11360 abolished the old 85%-15% split: 100% of collected service charges must be distributed completely and equally among covered non-managerial workers.',
    rewardCoins: 3,
  },
  'm3-wage-principles': {
    question:
      'To validly deduct the fair value of "Facilities" (like meals or housing) from an employee’s minimum wage, what 3 requisites must all be present?',
    options: [
      'Company memo, HR signature, and 20% cap',
      'Customary in the trade, voluntary written employee acceptance, and fair & reasonable value',
      'Verbal notice and supervisor approval only',
      'Deduction is automatic for all food-sector staff',
    ],
    correctIndex: 1,
    explanation:
      'Under Mabeza v. NLRC, deducting facilities requires proof that (1) they are customarily furnished, (2) the worker voluntarily accepted them in writing, and (3) the value charged is fair and reasonable.',
    rewardCoins: 3,
  },
  'm3-payment-contracting-distortion': {
    question:
      'Under DOLE Department Order No. 174-17, what is the minimum paid-up capital or net worth threshold for substantial capital in legitimate job contracting?',
    options: ['₱500,000', '₱1,000,000', '₱3,000,000', '₱5,000,000'],
    correctIndex: 3,
    explanation:
      'D.O. No. 174-17 sets substantial capital at a minimum paid-up capital stock/shares (for corporations/coops) or net worth (for single proprietorships) of at least ₱5,000,000.',
    rewardCoins: 3,
  },
  'm4-women-pwd-solo-telecommute': {
    question:
      'Under the Telecommuting Act (R.A. 11165), how must remote/work-from-home employees be treated compared to comparable on-site workers?',
    options: [
      'Paid 80% of on-site base pay due to saved commute',
      'Fair treatment: at least the same minimum labor standards, overtime, rest, and career rights',
      'Exempt from all holiday and night differential pay',
      'Classified automatically as independent freelancers',
    ],
    correctIndex: 1,
    explanation:
      'R.A. 11165 guarantees the Fair Treatment Principle: telecommuting workers enjoy equivalent pay, overtime/holiday rules, workload standards, and training access as on-site peers.',
    rewardCoins: 3,
  },
  'm4-minors-kasambahay-homework': {
    question:
      'Under the Batas Kasambahay (R.A. 10361), how many days of Service Incentive Leave does a domestic worker earn after 1 year of service, and is unused leave convertible to cash?',
    options: [
      '5 days; convertible to cash if unused',
      '5 days; not convertible to cash and non-cumulative',
      '10 days; convertible to cash',
      '15 days; cumulative every year',
    ],
    correctIndex: 1,
    explanation:
      'Unlike ordinary Labor Code SIL (which is cash-commutable), Kasambahay 5-day SIL under R.A. 10361 is NOT convertible to cash and cannot be carried over if unused.',
    rewardCoins: 3,
  },
  'm5-security-of-tenure-dismissal': {
    question:
      'In a Just Cause dismissal under the Twin-Notice Rule, what is the minimum period given to an employee to submit a written explanation after receiving the First Notice (NTE)?',
    options: ['24 hours', '48 hours', 'At least 5 calendar days', '30 calendar days'],
    correctIndex: 2,
    explanation:
      'Under King of Kings Transport v. Mamac and DOLE D.O. 147-15, "reasonable opportunity" means at least 5 calendar days from receipt of the First Notice to prepare a written defense.',
    rewardCoins: 3,
  },
  'm5-harassment-safe-spaces': {
    question:
      'What key requirement of R.A. 7877 (1995 Anti-Sexual Harassment Act) was removed for peer-to-peer workplace harassment under R.A. 11313 (Safe Spaces Act)?',
    options: [
      'Written employment contract',
      'Authority, influence, or moral ascendancy over the victim',
      'Workplace incident report',
      'Minimum establishment size of 50 workers',
    ],
    correctIndex: 1,
    explanation:
      'Under R.A. 11313 (Safe Spaces Act), workplace gender-based sexual harassment can be committed between peers or even by a subordinate against a superior—moral ascendancy is no longer required.',
    rewardCoins: 3,
  },
  'm6-service-incentive-leave': {
    question:
      'Which criterion must an employee satisfy to earn the 5-day annual Service Incentive Leave (SIL) under Article 95, and what happens if it remains unused at year-end?',
    options: [
      '6 months service; forfeited automatically',
      'At least 1 year of service; commutable to its cash equivalent if unused',
      '2 years of service; transferable to coworkers',
      '3 months service; convertible only upon retirement',
    ],
    correctIndex: 1,
    explanation:
      'Article 95 grants 5 days of paid SIL to covered employees who have rendered at least 1 year of service, and any unused SIL is commutable to cash at the end of the year.',
    rewardCoins: 3,
  },
  'm6-maternity-leave': {
    question:
      'Under the 105-Day Expanded Maternity Leave Law (R.A. 11210), how many total paid days does a qualified female Solo Parent receive for live childbirth?',
    options: ['60 days', '98 days', '105 days', '120 days (105 days + 15 days Solo Parent extension)'],
    correctIndex: 3,
    explanation:
      'R.A. 11210 grants 105 days of paid maternity leave for live childbirth regardless of delivery mode, plus an additional 15 paid days if the mother is a qualified Solo Parent (120 days total).',
    rewardCoins: 3,
  },
  'm6-paternity-leave': {
    question:
      'Under R.A. 8187, Paternity Leave grants 7 paid days for the first 4 deliveries of the legitimate spouse. How can a father legally receive up to 14 paid days?',
    options: [
      'By filing a 7-day cash conversion request with SSS',
      'Through allocation of up to 7 days from the mother’s 105-day Expanded Maternity Leave (R.A. 11210)',
      'By working overtime in the preceding month',
      'Automatic double days for cesarean delivery',
    ],
    correctIndex: 1,
    explanation:
      'Under R.A. 11210, the mother may allocate up to 7 days of her 105-day paid maternity leave to the child’s father, increasing a married father’s paid leave from 7 to 14 days.',
    rewardCoins: 3,
  },
  'm6-solo-parents-leave': {
    question:
      'Under the Expanded Solo Parents Welfare Act (R.A. 11861), what minimum length of service is now required to avail of the 7-day paid Parental Leave?',
    options: ['At least 3 months', 'At least 6 months', 'At least 1 full year', 'At least 2 years'],
    correctIndex: 1,
    explanation:
      'R.A. 11861 lowered the service requirement from 1 year down to at least 6 months of service (whether continuous or broken), provided the employee holds a valid Solo Parent ID.',
    rewardCoins: 3,
  },
  'm6-gynecological-leave': {
    question:
      'Under the Magna Carta of Women (R.A. 9710), what is the maximum paid Special Leave Benefit for women who undergo surgery caused by gynecological disorders?',
    options: ['Up to 10 days', 'Up to 30 days', 'Up to 2 months with full pay', 'Up to 105 days'],
    correctIndex: 2,
    explanation:
      'R.A. 9710 Sec. 18 grants up to 2 months of special leave with full pay based on gross monthly compensation following surgery for gynecological disorders (after 6 months aggregate service in the last 12 months).',
    rewardCoins: 3,
  },
  'm6-vawc-leave': {
    question:
      'How many days of paid leave are granted to a woman employee who is a victim of violence under R.A. 9262 (Anti-VAWC Act) to attend to medical and legal concerns?',
    options: [
      'Up to 5 days',
      'Up to 7 days',
      'Up to 10 days with full pay (extendible when necessity is specified in a Protection Order)',
      'Up to 30 days unpaid',
    ],
    correctIndex: 2,
    explanation:
      'Section 43 of R.A. 9262 provides up to 10 paid days of VAWC Leave, extendible when specified in the protection order, upon presenting a certification from the Punong Barangay, Prosecutor, or Clerk of Court.',
    rewardCoins: 3,
  },
};

export function getTopicQuickCheck(topic: LawTopic): TopicQuickCheckItem {
  const curated = CURATED_TOPIC_QUICK_CHECKS[topic.id];
  if (curated) {
    return {
      topicId: topic.id,
      ...curated,
    };
  }

  const primaryRule =
    topic.keyDoctrines?.[0] ||
    topic.beginnerSummary ||
    topic.summary ||
    topic.rules?.[0]?.description ||
    topic.rules?.[0]?.heading ||
    `Covers core workplace standards under ${topic.badge}.`;

  const truncatedCorrect =
    primaryRule.length > 125 ? `${primaryRule.slice(0, 122).trim()}...` : primaryRule;

  return {
    topicId: topic.id,
    question: `Which statement accurately reflects the governing workplace rule under "${topic.title}" (${topic.badge})?`,
    options: [
      truncatedCorrect,
      'Coverage is purely optional and applies only if written in a private company memo.',
      'Benefits can be unilaterally waived or reduced below statutory minimums at any time.',
      'Applies exclusively to corporate directors and managerial officers.',
    ],
    correctIndex: 0,
    explanation: `${topic.badge}: ${primaryRule}`,
    rewardCoins: 3,
  };
}
