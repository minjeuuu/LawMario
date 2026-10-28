export interface QuickGlossaryItem {
  id: string;
  term: string;
  aliases: string[];
  marioPowerUp: string;
  marioIcon: 'mushroom' | 'fire_flower' | 'star' | '1up' | 'coin' | 'pipe' | 'bowser' | 'question_block';
  marioAnalogy: string;
  simplifiedDefinition: string;
  statutoryBasis: string;
  barExamTip: string;
}

export const QUICK_GLOSSARY_TERMS: QuickGlossaryItem[] = [
  {
    id: 'control-test',
    term: 'Control Test (Four-Fold Test)',
    aliases: ['control test', 'four-fold test', 'power of control', 'means and methods'],
    marioPowerUp: 'Lakitu Camera Drone',
    marioIcon: 'star',
    marioAnalogy:
      'Lakitu floating above you controls not just the finish line, but every turn, drift, and button press on your controller. If the boss dictates HOW you drive and not merely THAT you finish the lap, you are an Employee!',
    simplifiedDefinition:
      'The most crucial test to determine an Employer-Employee relationship: whether the employer controls not only the end result to be achieved, but also the means, methods, and manner of performing the work.',
    statutoryBasis: 'Article 82 & jurisprudence (Calamba Medical Center v. CIR; Auto Bus Transport v. Bautista)',
    barExamTip:
      'Always emphasize the distinction between control over the RESULT (which an independent contractor agrees to) versus control over the MEANS AND METHODS (which creates employment).',
  },
  {
    id: 'two-notice-rule',
    term: 'Two-Notice Rule (Statutory Due Process)',
    aliases: ['two-notice rule', 'two notice rule', 'notice to explain', 'notice of termination', 'statutory due process'],
    marioPowerUp: 'Double Fireball Flower',
    marioIcon: 'fire_flower',
    marioAnalogy:
      'To defeat a Boss legally, Mario must throw TWO separate fireballs: 1st Fireball is the Notice to Explain (giving the Koopa at least 5 days to dodge/reply), and the 2nd Fireball is the Final Notice of Decision!',
    simplifiedDefinition:
      'The mandatory procedural due process required before dismissing an employee for just cause: (1) First written notice specifying grounds with at least 5 calendar days to explain, followed by a hearing, and (2) Second written notice indicating the final decision.',
    statutoryBasis: 'Labor Code Article 292(b) & King of Kings Transport v. Mamac',
    barExamTip:
      'If just cause exists but the Two-Notice Rule was violated, dismissal is VALID but the employer must pay nominal damages (₱30,000 for just cause under Agabon; ₱50,000 for authorized cause under Jaka).',
  },
  {
    id: 'compressed-work-week',
    term: 'Compressed Work Week (CWW)',
    aliases: ['compressed work week', 'compressed workweek', 'cww'],
    marioPowerUp: 'Super Mushroom Overdrive',
    marioIcon: 'mushroom',
    marioAnalogy:
      'Mario eats a Super Mushroom to run 48 hours of racing in only 4 days! He works up to 12 hours a day without triggering Overtime pay, as long as the total weekly work stays within 48 hours and safety rules are certified.',
    simplifiedDefinition:
      'A flexible work arrangement where the normal 48-hour workweek is compressed into fewer than 6 days (e.g. 4 days of 12 hours) without liability for overtime pay beyond 8 hours, subject to DOLE requirements.',
    statutoryBasis: 'DOLE Advisory No. 02-04 & Article 83 Labor Code',
    barExamTip:
      'Daily work under CWW cannot exceed 12 hours. Any work beyond the agreed compressed daily shift (e.g. 10 or 12 hours) must be compensated at overtime rates.',
  },
  {
    id: 'wage-distortion',
    term: 'Wage Distortion',
    aliases: ['wage distortion', 'distortion'],
    marioPowerUp: 'Warp Pipe Level Resizer',
    marioIcon: 'pipe',
    marioAnalogy:
      'A new wage order raises Mario (Level 1) salary right up to Luigi (Level 5) salary! The gap between ranks vanishes. Management and union must negotiate to restore the pay gap, not cancel the wage order!',
    simplifiedDefinition:
      'A situation where an increase in prescribed wage rates results in the elimination or severe contraction of intentional quantitative differences in wage or salary rates between employee positions.',
    statutoryBasis: 'Article 124, Labor Code & Ilaw at Buklod ng Manggagawa v. NLRC',
    barExamTip:
      'Wage distortion does NOT invalidate the Wage Order. The employer must resolve it through the grievance machinery or voluntary arbitration, NOT through strikes or lockouts.',
  },
  {
    id: 'service-incentive-leave',
    term: 'Service Incentive Leave (SIL)',
    aliases: ['service incentive leave', 'sil'],
    marioPowerUp: '1-Up Mushroom Bank',
    marioIcon: '1up',
    marioAnalogy:
      'After completing 1 continuous year in Peach’s castle, Mario banks 5 Golden 1-Up leaves. If unused by year-end, Toad converts them directly into shiny Gold Coins based on his salary!',
    simplifiedDefinition:
      'A mandatory benefit granting at least five (5) days of paid leave for every covered employee who has rendered at least one (1) year of service. Unused SIL is convertible to cash at the end of the year.',
    statutoryBasis: 'Article 95, Labor Code & Auto Bus Transport v. Bautista',
    barExamTip:
      'The 3-year prescriptive period to recover money claims for unpaid SIL starts to run ONLY upon employer demand/refusal or employee separation, NOT at the end of every calendar year!',
  },
  {
    id: 'night-shift-differential',
    term: 'Night Shift Differential (NSD)',
    aliases: ['night shift differential', 'nsd', 'night differential'],
    marioPowerUp: 'Boo Ghost Night Lantern',
    marioIcon: 'star',
    marioAnalogy:
      'When Mario patrols the spooky Ghost House between 10:00 PM and 6:00 AM, he receives a glowing +10% bonus gold on top of his regular hourly pay rate!',
    simplifiedDefinition:
      'An additional compensation of not less than ten percent (10%) of the regular wage for each hour of work performed between ten o’clock in the evening (10:00 PM) and six o’clock in the morning (6:00 AM).',
    statutoryBasis: 'Article 86, Labor Code of the Philippines',
    barExamTip:
      'If overtime occurs between 10 PM and 6 AM, calculate base rate + OT first, then add the 10% NSD on top of the OT rate: Base Rate × 125% × 110% = 137.5% per hour.',
  },
  {
    id: 'regular-holiday-pay',
    term: 'Regular Holiday Pay (200% Rule)',
    aliases: ['regular holiday', 'holiday pay', '200% rule', 'double pay'],
    marioPowerUp: 'Double Star Invincibility',
    marioIcon: 'star',
    marioAnalogy:
      'On Kingdom Holidays like Christmas or Independence Day, Mario gets 100% pay even if sleeping in Toad’s cottage! If Bowser summons him to work, Mario earns a blazing 200% Double Pay!',
    simplifiedDefinition:
      'Statutory entitlement under Art. 94 where an employee is paid 100% regular daily wage if unworked (subject to day-before attendance rule), and 200% if worked for the first 8 hours.',
    statutoryBasis: 'Article 94, Labor Code & DOLE Handbook',
    barExamTip:
      'Remember the Day-Before Attendance Rule: An employee must be present or on leave with pay on the working day immediately preceding the holiday to receive unworked holiday pay.',
  },
  {
    id: 'special-non-working-day',
    term: 'Special Non-Working Day (No Work, No Pay)',
    aliases: ['special non-working day', 'special holiday', '130% rule'],
    marioPowerUp: 'Bronze Coin Multiplier',
    marioIcon: 'coin',
    marioAnalogy:
      'Unlike Regular Holidays, a Special Non-Working Day follows the strict "No Work, No Pay" rule: Unworked = 0 Coins. But if Mario works 8 hours, he earns 130% daily pay (or 150% on rest day)!',
    simplifiedDefinition:
      'Days proclaimed by law or presidential issuance where the principle of "No Work, No Pay" applies unless company policy provides otherwise. Worked shifts receive +30% premium (130% total).',
    statutoryBasis: 'Article 93, Labor Code & Executive Order 292',
    barExamTip:
      'Distinguish from Regular Holiday: Unworked Regular Holiday = 100% pay; Unworked Special Day = 0 pay unless stipulated otherwise.',
  },
  {
    id: 'service-charge',
    term: 'Service Charge 100% Distribution (R.A. 11360)',
    aliases: ['service charge', 'service charges', 'ra 11360'],
    marioPowerUp: 'Yoshi Feast Treasury',
    marioIcon: 'coin',
    marioAnalogy:
      'In restaurants and hotels, 100% of all service charges collected must be distributed equally among non-managerial staff. Boss Bowser can no longer pocket the old 15% managerial cut!',
    simplifiedDefinition:
      'Under Republic Act No. 11360, 100% of service charges collected by hotels, restaurants, and similar establishments must be distributed completely and equally among covered rank-and-file and supervisory workers.',
    statutoryBasis: 'Republic Act No. 11360 (amending Article 96, Labor Code)',
    barExamTip:
      'Management employees are strictly excluded from service charge distribution. Deductions for breakage or losses are illegal.',
  },
  {
    id: 'thirteenth-month-pay',
    term: '13th Month Pay (P.D. 851)',
    aliases: ['13th month pay', 'thirteenth month pay', 'pd 851'],
    marioPowerUp: 'Golden Year-End Chest',
    marioIcon: 'coin',
    marioAnalogy:
      'Every December 24, Princess Peach empties the Golden Year-End Chest: Mario’s total basic salary earned during the calendar year is divided by 12 and paid in cash legal tender!',
    simplifiedDefinition:
      'A mandatory statutory benefit requiring employers to pay rank-and-file employees one-twelfth (1/12) of their total basic salary earned within a calendar year, payable not later than December 24.',
    statutoryBasis: 'Presidential Decree No. 851 & Revised DOLE Guidelines',
    barExamTip:
      'Basic salary EXCLUDES overtime pay, night shift differential, holiday pay, premium pay, and allowances unless company practice includes them.',
  },
  {
    id: 'non-diminution',
    term: 'Non-Diminution of Benefits (Art. 100)',
    aliases: ['non-diminution', 'diminution of benefits', 'article 100'],
    marioPowerUp: 'Eternal Star Barrier',
    marioIcon: 'star',
    marioAnalogy:
      'Once Princess Peach gives Mario a voluntary extra allowance for a long period without objection, an Eternal Star Barrier protects it! The castle cannot unilaterally take it back.',
    simplifiedDefinition:
      'The statutory principle under Article 100 prohibiting employers from unilaterally eliminating or reducing benefits that have ripened into company practice through consistent and deliberate grant over time.',
    statutoryBasis: 'Article 100, Labor Code & Royal Plant Workers Union v. Coca-Cola',
    barExamTip:
      'Non-diminution does NOT apply to benefits granted due to a bona fide error in calculation or interpretation of law.',
  },
  {
    id: 'labor-only-contracting',
    term: 'Labor-Only Contracting (Prohibited)',
    aliases: ['labor-only contracting', 'labor only contracting', 'do 174', 'sham contractor'],
    marioPowerUp: 'Ghost Subcontractor Buster',
    marioIcon: 'bowser',
    marioAnalogy:
      'Bowser hires a Ghost Agency with no tools or capital to supply workers in the castle. The law sees right through the ghost: Bowser is declared the DIRECT employer liable for all wages and benefits!',
    simplifiedDefinition:
      'A prohibited arrangement where a contractor merely recruits and supplies workers to a principal without having substantial capital or investment in tools/equipment, or where the principal exercises control.',
    statutoryBasis: 'Article 106, Labor Code & DOLE Department Order No. 174-17',
    barExamTip:
      'Substantial capital for legitimate job contracting is at least ₱5,000,000 paid-up capital. Labor-only contracting makes the principal the direct employer for all purposes.',
  },
  {
    id: 'bona-fide-suspension',
    term: 'Bona Fide Suspension (Floating Status, Art. 301)',
    aliases: ['floating status', 'bona fide suspension', 'article 301', 'temporary off-detail'],
    marioPowerUp: 'Pause Block Limit',
    marioIcon: 'question_block',
    marioAnalogy:
      'When operations pause due to business distress, workers enter a temporary "Pause State". But the Pause Block expires at exactly 6 MONTHS. After 6 months, Mario must be recalled or paid Separation Pay!',
    simplifiedDefinition:
      'The temporary suspension of business operations or off-detail status of security guards/contract workers not exceeding six (6) months. After 6 months without recall, it becomes constructive dismissal.',
    statutoryBasis: 'Article 301 (formerly Art. 286), Labor Code',
    barExamTip:
      'If the floating status exceeds 6 months without the employer recalling the employee or offering equivalent assignment, the employee is constructively dismissed and entitled to separation pay + backwages.',
  },
  {
    id: 'constructive-dismissal',
    term: 'Constructive Dismissal',
    aliases: ['constructive dismissal', 'forced resignation', 'involuntary resignation'],
    marioPowerUp: 'Poison Mushroom Trap',
    marioIcon: 'bowser',
    marioAnalogy:
      'Bowser doesn’t formally fire Luigi, but demotes him to cleaning lava pits with zero pay. The working condition becomes so unbearable and hostile that Luigi is forced to quit—the law treats it as an ILLEGAL DISMISSAL!',
    simplifiedDefinition:
      'A cessation of work because continued employment is rendered impossible, unreasonable, or unlikely, such as through demotion in rank or diminution in pay, making resignation involuntary.',
    statutoryBasis: 'Labor Code Article 294 & Supreme Court Jurisprudence',
    barExamTip:
      'Constructive dismissal entitles the worker to the same remedies as illegal dismissal: reinstatement without loss of seniority rights, full backwages, and damages if attended by bad faith.',
  },
  {
    id: 'expanded-maternity-leave',
    term: 'Expanded Maternity Leave (105 Days, R.A. 11210)',
    aliases: ['expanded maternity leave', 'ra 11210', '105 days', 'maternity leave'],
    marioPowerUp: 'Peach Crown 105-Day Shield',
    marioIcon: 'mushroom',
    marioAnalogy:
      'Princess Peach welcomes a baby Toad! Under R.A. 11210, she is shielded with 105 paid calendar days with full pay. Solo parent mothers get +15 bonus days (120 days total), and up to 7 days can be transferred to Mario!',
    simplifiedDefinition:
      'Paid leave of 105 calendar days for live childbirth regardless of mode of delivery, with an optional 30 days extension without pay. Solo parents receive an additional 15 paid days (120 days total). Miscarriages receive 60 paid days.',
    statutoryBasis: 'Republic Act No. 11210 & DOLE-CSC-SSS Implementing Rules',
    barExamTip:
      'R.A. 11210 completely removed the old 4-delivery cap under the Labor Code. Female workers can now claim maternity leave for EVERY pregnancy!',
  },
  {
    id: 'paternity-leave',
    term: 'Paternity Leave (7 Days, R.A. 8187)',
    aliases: ['paternity leave', 'ra 8187', '7 days paternity'],
    marioPowerUp: 'Father Toad Family Shield',
    marioIcon: 'star',
    marioAnalogy:
      'When Princess Peach gives birth, Father Mario gets 7 calendar days of paid time off to take care of his newborn Toad! It covers the first 4 deliveries of his legal wife whom he lives with.',
    simplifiedDefinition:
      'Seven (7) calendar days of leave with full pay granted to married male employees in the private and public sectors for the first four (4) deliveries or miscarriages of their legitimate, cohabiting spouse.',
    statutoryBasis: 'Republic Act No. 8187 (Paternity Leave Act of 1996)',
    barExamTip:
      'Paternity leave requires: (1) Valid marriage, (2) Cohabitation with spouse, and (3) Limited to the first 4 deliveries. Unused paternity leave is NOT convertible to cash.',
  },
  {
    id: 'solo-parent-leave',
    term: 'Solo Parent Leave (7 Days, R.A. 11861)',
    aliases: ['solo parent leave', 'ra 11861', 'solo parent act'],
    marioPowerUp: 'Super Star Solo Cape',
    marioIcon: 'star',
    marioAnalogy:
      'A solo parent Mario caring for a young Toad gets 7 working days paid leave every year! Under R.A. 11861, you only need 6 MONTHS of service (down from 1 year), and children qualify up to age 22!',
    simplifiedDefinition:
      'Seven (7) working days of paid parental leave granted annually to qualified solo parents who have rendered at least six (6) months of service, to attend to parental duties.',
    statutoryBasis: 'Republic Act No. 11861 (Expanded Solo Parents Welfare Act)',
    barExamTip:
      'Key update in R.A. 11861: Qualifying service was reduced from 1 year to 6 months; dependent child age threshold was raised from below 18 to 22 years old.',
  },
  {
    id: 'vawc-leave',
    term: 'VAWC Leave (10 Days, R.A. 9262)',
    aliases: ['vawc leave', 'ra 9262', 'anti-vawc', 'violence against women'],
    marioPowerUp: 'Invincible Protection Star',
    marioIcon: 'star',
    marioAnalogy:
      'If a female worker suffers physical, psychological, or economic abuse, she receives up to 10 paid days to attend court hearings and medical clinics upon presenting a Protection Order or Police certification.',
    simplifiedDefinition:
      'Paid leave of up to ten (10) days granted to female victims of physical, sexual, psychological, or economic violence under R.A. 9262 to cover medical and legal attendances.',
    statutoryBasis: 'Republic Act No. 9262 (Anti-VAWC Act of 2004)',
    barExamTip:
      'VAWC leave is extendible when the necessity arises as specified in the Protection Order. Unused leave is non-cumulative and non-convertible to cash.',
  },
  {
    id: 'special-leave-women',
    term: 'Special Leave for Women (Gynecological, R.A. 9710)',
    aliases: ['special leave for women', 'gynecological leave', 'ra 9710', 'magna carta of women'],
    marioPowerUp: 'Peach Blossom Healing Elixir',
    marioIcon: 'fire_flower',
    marioAnalogy:
      'A female worker recovering from surgical operation caused by a gynecological disorder (e.g. hysterectomy) is granted up to 2 full months of paid leave after 6 months of aggregate service!',
    simplifiedDefinition:
      'A paid leave of up to two (2) months following surgery caused by gynecological disorders under the Magna Carta of Women, available to female employees with at least 6 months continuous service.',
    statutoryBasis: 'Republic Act No. 9710 Section 18',
    barExamTip:
      'Requires surgery caused by gynecological disorders certified by a competent physician. It is non-cumulative and non-convertible to cash.',
  },
  {
    id: 'kasambahay-law',
    term: 'Kasambahay Law (Batas Kasambahay, R.A. 10361)',
    aliases: ['kasambahay', 'domestic worker', 'ra 10361', 'batas kasambahay'],
    marioPowerUp: 'Golden Household Crown',
    marioIcon: 'mushroom',
    marioAnalogy:
      'Domestic helpers (cooks, yayas, cleaners) are protected workers! Free meals, lodging, and medical assistance cannot be deducted from their minimum wage. They are entitled to 5 days SIL and 13th Month Pay!',
    simplifiedDefinition:
      'Statutory magna carta for domestic workers mandating minimum wage rates, 13th month pay, 5 days annual SIL with pay, social security coverage (SSS, PhilHealth, Pag-IBIG), and standard daily/weekly rest.',
    statutoryBasis: 'Republic Act No. 10361 & DOLE Rules',
    barExamTip:
      'Family drivers are EXCLUDED from R.A. 10361 coverage (they are governed by Civil Code and DOLE Labor Advisory No. 17-19).',
  },
  {
    id: 'retirement-pay',
    term: 'Retirement Pay (Article 302, 22.5 Days Formula)',
    aliases: ['retirement pay', 'article 302', 'art 302', 'one-half month salary', '22.5 days'],
    marioPowerUp: 'Golden 22.5-Day Mushroom Trove',
    marioIcon: 'coin',
    marioAnalogy:
      'In the Mushroom Kingdom, "One-Half Month Salary" does NOT mean 15 days! It means 22.5 Days: 15 days basic salary + 5 days SIL + 2.5 days (1/12 of 13th month pay)!',
    simplifiedDefinition:
      'Statutory minimum retirement benefit of at least one-half (1/2) month salary for every year of service (at least 6 months counted as whole year), where 1/2 month is statutorily defined as 22.5 days.',
    statutoryBasis: 'Article 302 (formerly Art. 287), Labor Code & Capitol Wireless v. Sec. of Labor',
    barExamTip:
      'Remember the 22.5-day breakdown: 15 days basic wage + 5 days SIL + 2.5 days proportionate 13th month pay. Fractional service of at least 6 months counts as 1 full year.',
  },
  {
    id: 'field-personnel',
    term: 'Field Personnel Exclusion (Art. 82)',
    aliases: ['field personnel', 'field employees', 'supervised in field'],
    marioPowerUp: 'Lakitu GPS Tracker',
    marioIcon: 'pipe',
    marioAnalogy:
      'If Mario drives outside the castle but Toad tracks his GPS every minute, Mario is NOT field personnel! Field Personnel must be unsupervised workers whose actual work hours cannot be determined.',
    simplifiedDefinition:
      'Non-agricultural employees who regularly perform their duties away from the principal place of business and whose actual hours of work in the field cannot be determined with reasonable certainty.',
    statutoryBasis: 'Article 82, Labor Code & Auto Bus Transport v. Bautista',
    barExamTip:
      'Even if an employee works out in the field, if the company monitors time via GPS, logbooks, or call-ins, the employee is NOT field personnel and remains entitled to overtime and SIL.',
  },
];

export function findGlossaryTerm(matchStr: string): QuickGlossaryItem | undefined {
  if (!matchStr) return undefined;
  const norm = matchStr.toLowerCase().trim();
  if (norm.length < 3) return undefined;

  const byId = QUICK_GLOSSARY_TERMS.find((item) => item.id.toLowerCase() === norm);
  if (byId) return byId;

  const byTerm = QUICK_GLOSSARY_TERMS.find((item) => {
    const full = item.term.toLowerCase();
    const clean = item.term.replace(/\s*\(.*?\)/g, '').trim().toLowerCase();
    return full === norm || clean === norm;
  });
  if (byTerm) return byTerm;

  const byAlias = QUICK_GLOSSARY_TERMS.find((item) =>
    item.aliases.some((a) => a.toLowerCase() === norm)
  );
  if (byAlias) return byAlias;

  return undefined;
}

export const ALL_GLOSSARY_KEYWORDS: { keyword: string; item: QuickGlossaryItem }[] = (() => {
  const list: { keyword: string; item: QuickGlossaryItem }[] = [];
  QUICK_GLOSSARY_TERMS.forEach((item) => {
    const cleanTerm = item.term.replace(/\s*\(.*?\)/g, '').trim();
    if (cleanTerm.length >= 3) {
      list.push({ keyword: cleanTerm, item });
    }
    item.aliases.forEach((alias) => {
      if (alias.trim().length >= 3) {
        list.push({ keyword: alias.trim(), item });
      }
    });
  });
  return list.sort((a, b) => b.keyword.length - a.keyword.length);
})();
