export type GlossaryCategory =
  | 'Hours & Overtime'
  | 'Rest & Holidays'
  | 'Wages & D.O. 174'
  | 'Special & Protective'
  | 'Leaves & Retirement'
  | 'Tenure & Dismissal';

export interface QuickGlossaryItem {
  id: string;
  term: string;
  category: GlossaryCategory;
  aliases: string[];
  marioPowerUp: string;
  marioIcon:
    | 'mushroom'
    | 'fire_flower'
    | 'star'
    | '1up'
    | 'coin'
    | 'pipe'
    | 'bowser'
    | 'question_block';
  marioAnalogy: string;
  simplifiedDefinition: string;
  statutoryBasis: string;
  barExamTip: string;
}

export const GLOSSARY_CATEGORIES: readonly GlossaryCategory[] = [
  'Hours & Overtime',
  'Rest & Holidays',
  'Wages & D.O. 174',
  'Special & Protective',
  'Leaves & Retirement',
  'Tenure & Dismissal',
];

export const QUICK_GLOSSARY_TERMS: QuickGlossaryItem[] = [
  // ==================== 1. HOURS OF WORK & OVERTIME ====================
  {
    id: 'control-test',
    term: 'Control Test (Four-Fold Test)',
    category: 'Hours & Overtime',
    aliases: ['control test', 'four-fold test', 'power of control', 'means and methods'],
    marioPowerUp: 'Lakitu Camera Drone',
    marioIcon: 'star',
    marioAnalogy:
      'Lakitu floating above you controls not just the finish line, but every turn, drift, and button press on your controller. If the boss dictates HOW you drive and not merely THAT you finish the lap, you are an Employee!',
    simplifiedDefinition:
      'The most crucial element of the Four-Fold Test (selection, payment of wages, power of dismissal, and power of control): whether the employer controls or reserves the right to control not only the end result, but also the means and methods of achieving it.',
    statutoryBasis: 'Art. 82, Labor Code; Francisco v. NLRC; Sonza v. ABS-CBN',
    barExamTip:
      'Control over the RESULT alone is consistent with independent contracting; control over the MEANS AND METHODS establishes an employer-employee relationship.',
  },
  {
    id: 'economic-reality-test',
    term: 'Two-Tiered / Economic Reality Test',
    category: 'Hours & Overtime',
    aliases: ['economic reality test', 'economic dependence', 'two-tiered test'],
    marioPowerUp: 'Golden Lifeline Vine',
    marioIcon: '1up',
    marioAnalogy:
      'When there is no written contract in the Mushroom Kingdom, check whose castle coins keep Toad fed! If Toad depends entirely on Peach’s treasury for survival and has no independent shop, he is economically dependent!',
    simplifiedDefinition:
      'A supplementary doctrine used alongside the Control Test when there is no written employment agreement, examining the totality of economic circumstances to determine whether the worker is economically dependent on the putative employer.',
    statutoryBasis: 'Francisco v. NLRC (G.R. No. 170087); Orozco v. CA',
    barExamTip:
      'Invoke the Two-Tiered Test (Control Test + Economic Reality Test) whenever the Bar problem features talent/commission arrangements without clear written contracts.',
  },
  {
    id: 'field-personnel',
    term: 'Field Personnel Exclusion (Art. 82)',
    category: 'Hours & Overtime',
    aliases: ['field personnel', 'field employees', 'unsupervised field workers'],
    marioPowerUp: 'Lakitu GPS Tracker',
    marioIcon: 'pipe',
    marioAnalogy:
      'If Mario drives outside the castle but Toad tracks his GPS route, dispatch schedule, and terminal check-ins, Mario is NOT field personnel! Field Personnel must work away from the office with hours that cannot be determined with reasonable certainty.',
    simplifiedDefinition:
      'Non-agricultural employees who regularly perform their duties away from the principal place of business and whose actual hours of work in the field cannot be determined with reasonable certainty.',
    statutoryBasis: 'Article 82, Labor Code & Auto Bus Transport Systems v. Bautista',
    barExamTip:
      'Bus drivers, conductors, and delivery crews bound by fixed schedules, inspectors, or GPS tracking are regular supervised employees entitled to SIL and holiday pay—NOT field personnel.',
  },
  {
    id: 'managerial-employees',
    term: 'Managerial Employees Exclusion (Art. 82)',
    category: 'Hours & Overtime',
    aliases: ['managerial employee', 'managerial employees', 'managerial staff'],
    marioPowerUp: 'Peach Castle Scepter',
    marioIcon: 'star',
    marioAnalogy:
      'Chancellor Toadsworth sets Kingdom policy, hires guards, and disciplines Koopas using independent judgment. Because he runs the castle, Book III clock-in overtime rules do not apply to him!',
    simplifiedDefinition:
      'Employees whose primary duty consists of managing the establishment or a customarily recognized department, customarily directing two or more employees, and having authority to hire, fire, or effectively recommend personnel actions.',
    statutoryBasis: 'Article 82, Labor Code & Omnibus Rules Book III, Rule I, Sec. 2',
    barExamTip:
      'Job title alone ("Supervisor" or "Assistant Manager") is NOT controlling; examine actual duties and exercise of independent discretion, not routine clerical tasks.',
  },
  {
    id: 'engaged-to-wait',
    term: 'Engaged to Wait vs. Waiting to be Engaged',
    category: 'Hours & Overtime',
    aliases: ['engaged to wait', 'waiting to be engaged', 'waiting time', 'on-call work'],
    marioPowerUp: ' Warp Pipe Standby Bell',
    marioIcon: 'pipe',
    marioAnalogy:
      'If Fire Mario must sit inside the Castle Firehouse in uniform waiting for an alarm, he is ENGAGED TO WAIT (paid!). If he can go karting at Rainbow Road and leave his pager number, he is WAITING TO BE ENGAGED (unpaid until called)!',
    simplifiedDefinition:
      'Waiting time is compensable if waiting is an integral part of the employee’s work or the employee cannot use the time effectively for personal purposes ("engaged to wait").',
    statutoryBasis: 'Article 84, Labor Code & Omnibus Rules Book III, Rule I, Sec. 5',
    barExamTip:
      'An on-call employee required to remain on employer premises or so close thereto that they cannot use the time for their own benefit is working and entitled to wages.',
  },
  {
    id: 'power-brownout-rule',
    term: 'Power Brownout / Work Interruption Rule (20-Min Rule)',
    category: 'Hours & Overtime',
    aliases: ['power brownout', 'brownout rule', '20-minute brownout', 'work interruption'],
    marioPowerUp: 'Amp Spark Generator',
    marioIcon: 'question_block',
    marioAnalogy:
      'Lights out in Bowser’s factory! If the blackout lasts 20 minutes or less, the clock keeps paying Coins! Beyond 20 minutes, it is unpaid ONLY if workers can leave the castle freely!',
    simplifiedDefinition:
      'Brownouts or work interruptions not exceeding 20 minutes are compensable hours worked. If exceeding 20 minutes, they are non-compensable ONLY if employees can leave the premises or use the time effectively for their own interest.',
    statutoryBasis: 'Omnibus Rules Implementing the Labor Code, Book III, Rule I, Sec. 4(d)',
    barExamTip:
      'Even if a brownout exceeds 20 minutes, if the employer requires employees to stay at their workstations on standby, the entire interruption is compensable.',
  },
  {
    id: 'meal-period-rule',
    term: 'Regular Meal Period & Shortened Meal Exceptions (Art. 85)',
    category: 'Hours & Overtime',
    aliases: ['meal period', 'shortened meal period', 'time-off for regular meals', 'article 85'],
    marioPowerUp: 'Super Mushroom Lunchbox',
    marioIcon: 'mushroom',
    marioAnalogy:
      'Every hero gets at least 60 minutes of unpaid lunch off-duty! If Peach shortens lunch to 30 minutes for non-manual factory shifts, she MUST pay for the full lunch hour—unless workers themselves request a shorter unpaid lunch to go home early!',
    simplifiedDefinition:
      'Employers must give not less than 60 minutes time-off for regular meals (non-compensable). Meal periods may be shortened to not less than 20 minutes WITH PAY in non-manual work, 16+ hour establishments, emergencies, or perishable work.',
    statutoryBasis: 'Article 85, Labor Code; Sime Darby Pilipinas v. NLRC',
    barExamTip:
      'Any meal break shortened to less than 20 minutes is treated merely as a compensable rest/coffee break, NOT a valid meal period.',
  },
  {
    id: 'coffee-rest-breaks',
    term: 'Short Rest / Coffee Breaks (5 to 20 Minutes)',
    category: 'Hours & Overtime',
    aliases: ['coffee break', 'coffee breaks', 'short rest periods', 'rest periods'],
    marioPowerUp: 'Mini Mushroom Espresso',
    marioIcon: 'mushroom',
    marioAnalogy:
      'Quick 15-minute Mushroom Tea breaks boost Mario’s stamina on the assembly line—so the Labor Code counts every 5-to-20-minute break as PAID hours worked!',
    simplifiedDefinition:
      'Rest periods or coffee breaks of short duration running from five (5) to twenty (20) minutes are considered compensable working time.',
    statutoryBasis: 'Article 84, Labor Code & Omnibus Rules Book III, Rule I, Sec. 7',
    barExamTip:
      'Employers cannot deduct two 15-minute daily coffee breaks from the 8-hour workday or require employees to stay 30 minutes longer to offset them.',
  },
  {
    id: 'health-personnel-40-hour-rule',
    term: 'Health Personnel 40-Hour / 5-Day Workweek (Art. 83)',
    category: 'Hours & Overtime',
    aliases: ['health personnel', '40-hour workweek', 'resident physicians', 'article 83'],
    marioPowerUp: 'Dr. Mario Megavitamin',
    marioIcon: '1up',
    marioAnalogy:
      'Dr. Mario working in a big city (1M+ population) or a 100+ bed hospital works a normal 8-hour, 5-day (40-hour) week! If the hospital makes him work a 6th day due to shortage of doctors, he earns +30% extra pay on Day 6!',
    simplifiedDefinition:
      'Health personnel in cities/municipalities with at least 1,000,000 population OR in hospitals/clinics with at least 100 bed capacity have regular office hours of 8 hours a day for 5 days a week (40 hours). Work on the 6th day earns at least +30% additional compensation.',
    statutoryBasis: 'Article 83, Labor Code; San Juan De Dios Hospital Employees Assoc. v. NLRC',
    barExamTip:
      'Article 83 does NOT grant automatic full pay for unworked 6th and 7th days; it fixes the normal workweek at 5 days (40 hours) with a +30% premium if required to work on the 6th day.',
  },
  {
    id: 'compressed-work-week',
    term: 'Compressed Work Week (CWW)',
    category: 'Hours & Overtime',
    aliases: ['compressed work week', 'compressed workweek', 'cww'],
    marioPowerUp: 'Super Mushroom Overdrive',
    marioIcon: 'mushroom',
    marioAnalogy:
      'Mario eats a Super Mushroom to run 48 hours of racing in only 4 or 5 days! He works up to 12 hours a day without triggering Overtime pay, provided weekly hours do not exceed 48 and workers voluntarily agree!',
    simplifiedDefinition:
      'A flexible work arrangement where the normal workweek is reduced to fewer than 6 days while total weekly normal hours (up to 48) remain unchanged, waiving daily overtime beyond 8 hours up to 12 hours/day.',
    statutoryBasis: 'DOLE Advisory No. 02-04 & Article 83, Labor Code; Bisig Manggagawa sa Tryco v. NLRC',
    barExamTip:
      'Requisites: (1) Express voluntary agreement of majority of employees, (2) DOLE Regional Office notice, (3) Certification of safe chemical/noise exposure if hazardous, and (4) Max 12 hours/day.',
  },
  {
    id: 'overtime-pay',
    term: 'Overtime Work & Premium Rates (Art. 87)',
    category: 'Hours & Overtime',
    aliases: ['overtime pay', 'overtime work', 'article 87', '25% overtime'],
    marioPowerUp: 'Golden Dash Mushroom',
    marioIcon: 'coin',
    marioAnalogy:
      'Once Mario clears the 8-hour lap, hitting the Golden Dash Mushroom boosts his hourly coin rate by +25% on ordinary days—or +30% on Rest Days, Special Days, and Regular Holidays!',
    simplifiedDefinition:
      'Work performed beyond eight (8) hours in a workday, compensated at an additional 25% of the regular hourly wage on ordinary working days, or an additional 30% of the applicable hourly rate on rest days, special days, or regular holidays.',
    statutoryBasis: 'Article 87, Labor Code',
    barExamTip:
      'Built-in or fixed overtime is generally invalid unless: (1) expressly stipulated, (2) employee is compensated at least equal to statutory OT, and (3) such hours are actually/regularly worked (e.g., overseas seafarers).',
  },
  {
    id: 'undertime-not-offset',
    term: 'Undertime Not Offset by Overtime (Art. 88)',
    category: 'Hours & Overtime',
    aliases: ['undertime not offset', 'offsetting overtime', 'undertime', 'article 88'],
    marioPowerUp: 'One-Way Gate Lock',
    marioIcon: 'pipe',
    marioAnalogy:
      'Bowser cannot cancel Mario’s 2 hours of +25% Overtime on Tuesday just because Mario arrived 2 hours late (undertime) on Monday! Otherwise Mario loses the 25% overtime premium!',
    simplifiedDefinition:
      'Undertime work on any particular day shall NOT be offset by overtime work on any other day (or even the same day). Permission to go on leave on another day also does not exempt the employer from paying overtime premiums.',
    statutoryBasis: 'Article 88, Labor Code; NWSA v. NWSA Consolidated Unions',
    barExamTip:
      'Why is offsetting illegal? Because 1 hour of undertime is worth 100% regular hourly rate, whereas 1 hour of overtime is worth 125% (or 130%+). Offsetting deprives the worker of the statutory premium!',
  },
  {
    id: 'emergency-overtime',
    term: 'Compulsory / Emergency Overtime Work (Art. 89)',
    category: 'Hours & Overtime',
    aliases: ['emergency overtime', 'compulsory overtime', 'article 89'],
    marioPowerUp: 'Castle Alarm Bell',
    marioIcon: 'bowser',
    marioAnalogy:
      'Normally Mario can say "No thanks!" to overtime. But if a Volcano erupts, pipes burst, or perishable Yoshi fruit will rot, Mario MUST render emergency overtime (with full OT pay)!',
    simplifiedDefinition:
      'General rule: Overtime is voluntary. Exceptions where an employer may compel overtime (with OT pay): war/national emergency, imminent danger to life/property from calamity, urgent machine repairs, preventing loss of perishable goods, or completion of work necessary to prevent serious obstruction.',
    statutoryBasis: 'Article 89, Labor Code',
    barExamTip:
      'Refusal to render overtime on an ordinary day WITHOUT any Article 89 emergency ground is NOT willful disobedience; refusal DURING a valid Art. 89 emergency can be insubordination.',
  },
  {
    id: 'night-shift-differential',
    term: 'Night Shift Differential (NSD, Art. 86)',
    category: 'Hours & Overtime',
    aliases: ['night shift differential', 'nsd', 'night differential', 'article 86'],
    marioPowerUp: 'Boo Ghost Night Lantern',
    marioIcon: 'star',
    marioAnalogy:
      'When Mario patrols the Ghost House between 10:00 PM and 6:00 AM, he earns a glowing +10% bonus on top of his applicable hourly rate for every night hour worked!',
    simplifiedDefinition:
      'Additional compensation of not less than ten percent (10%) of an employee’s regular wage for each hour of work performed between 10:00 PM and 6:00 AM.',
    statutoryBasis: 'Article 86, Labor Code',
    barExamTip:
      'Retail and service establishments regularly employing NOT MORE THAN FIVE (5) workers are exempt from NSD. When stacking OT + NSD on an ordinary day: Base × 1.25 × 1.10 = 1.375 (137.5%).',
  },
  {
    id: 'seafarers-fixed-overtime',
    term: 'Seafarers Fixed Overtime Doctrine',
    category: 'Hours & Overtime',
    aliases: ['seafarer overtime', 'fixed overtime', 'guaranteed overtime'],
    marioPowerUp: 'Koopa Galleon Compass',
    marioIcon: 'coin',
    marioAnalogy:
      'On Captain Mario’s ocean ship, sailors cannot walk home after 8 hours! Their POEA/DMW contract already includes guaranteed fixed overtime—so they cannot demand extra OT beyond it without proof of extra hours!',
    simplifiedDefinition:
      'Filipino seafarers are contractual employees governed by POEA/DMW Standard Employment Contracts. Where their contract stipulates guaranteed or fixed overtime pay, they cannot claim additional overtime without concrete proof of actual extra hours beyond the guaranteed hours.',
    statutoryBasis: 'PCL Shipping Phils. v. NLRC; Serrano v. Gallant Maritime',
    barExamTip:
      'Remember two seafarer classics: (1) They are contractual, never regular employees (Millares v. NLRC), and (2) Guaranteed overtime in a DMW-approved contract is valid without daily time logs.',
  },
  {
    id: 'piece-rate-workers',
    term: 'Piece-Rate Workers (Supervised vs. Unsupervised)',
    category: 'Hours & Overtime',
    aliases: ['piece-rate workers', 'piece rate', 'pakiao', 'takay'],
    marioPowerUp: 'Coin Block Counter',
    marioIcon: 'coin',
    marioAnalogy:
      'Toad is paid per brick polished! If he polishes bricks INSIDE Peach’s castle under Toadette’s watch from 8 AM to 5 PM, he still gets Holiday Pay, SIL, and 13th Month Pay!',
    simplifiedDefinition:
      'Workers paid by results (pakiao/takay). Those working inside employer premises under time/output supervision are entitled to statutory minimum wage equivalents, holiday pay, 13th month pay, and NSD; unsupervised piece-rate workers outside premises are generally excluded from Book III hours rules.',
    statutoryBasis: 'Article 101, Labor Code; Labor Congress of the Phils. v. NLRC; Lambo v. NLRC',
    barExamTip:
      'Payment by piece/results does NOT automatically exclude a worker from Labor Standards—always apply the supervision & premises test from Lambo v. NLRC!',
  },

  // ==================== 2. REST DAYS, HOLIDAYS & 13TH MONTH ====================
  {
    id: 'weekly-rest-day',
    term: 'Right to Weekly Rest Day (24 Consecutive Hours, Art. 91)',
    category: 'Rest & Holidays',
    aliases: ['weekly rest day', 'rest day pay', 'article 91', '24 consecutive hours'],
    marioPowerUp: 'Toad House Rest Bed',
    marioIcon: '1up',
    marioAnalogy:
      'After 6 consecutive stages of platforming, Mario unlocks a mandatory 24-hour Toad House recharge! If Peach calls him in on his Rest Day, he earns +30% Rest Day premium (130%)!',
    simplifiedDefinition:
      'Every employer must provide each employee a rest period of not less than 24 consecutive hours after every six (6) consecutive normal workdays. Work on a scheduled rest day earns +30% premium pay (130% total).',
    statutoryBasis: 'Articles 91 & 93, Labor Code',
    barExamTip:
      'The employer schedules the weekly rest day, SUBJECT to the employee’s preference grounded on religious grounds!',
  },
  {
    id: 'religious-rest-day-preference',
    term: 'Religious Rest Day Preference Rule (Art. 91[b])',
    category: 'Rest & Holidays',
    aliases: ['religious rest day', 'religious grounds rest day', 'sabbath rest day'],
    marioPowerUp: 'Star Shrine Sanctuary',
    marioIcon: 'star',
    marioAnalogy:
      'Luigi observes Saturday Sabbath worship! Peach MUST respect his religious rest day—unless doing so causes serious obstruction/prejudice to the castle, in which case Peach must still grant it on at least 2 days a month!',
    simplifiedDefinition:
      'The employer shall respect the preference of employees as to their weekly rest day when based on religious grounds. If this causes serious prejudice to operations and no other remedial measure is available, the employer may schedule their preferred religious day on at least two (2) days a month.',
    statutoryBasis: 'Article 91(b), Labor Code & Omnibus Rules Book III, Rule III, Sec. 4',
    barExamTip:
      'Memorize the exact compromise threshold: "at least two (2) days in a month" of the employee’s religious rest day when full accommodation causes serious business prejudice.',
  },
  {
    id: 'regular-holiday-pay',
    term: 'Regular Holiday Pay (200% Rule, Art. 94)',
    category: 'Rest & Holidays',
    aliases: ['regular holiday', 'holiday pay', '200% rule', 'double pay', 'article 94'],
    marioPowerUp: 'Double Star Invincibility',
    marioIcon: 'star',
    marioAnalogy:
      'On Kingdom Regular Holidays like Independence Day or Bonifacio Day, Mario gets 100% pay even while resting! If he works 8 hours, he earns 200% Double Pay—and 260% if it also falls on his Rest Day!',
    simplifiedDefinition:
      'Covered employees receive 100% of their regular daily wage on unworked regular holidays (subject to preceding-day presence/paid leave), 200% for the first 8 hours if worked, and 260% (200% × 130%) if worked on a scheduled rest day.',
    statutoryBasis: 'Article 94, Labor Code & DOLE Handbook on Workers’ Statutory Monetary Benefits',
    barExamTip:
      'Retail and service establishments regularly employing LESS THAN TEN (<10) workers are EXEMPT from Regular Holiday Pay under Art. 94(a)!',
  },
  {
    id: 'special-non-working-day',
    term: 'Special Non-Working Day (No Work, No Pay / 130%)',
    category: 'Rest & Holidays',
    aliases: ['special non-working day', 'special holiday', '130% rule'],
    marioPowerUp: 'Bronze Coin Multiplier',
    marioIcon: 'coin',
    marioAnalogy:
      'On a Special Non-Working Day, staying home earns 0 Coins ("No Work, No Pay"). Working 8 hours earns 130% daily pay—or 150% if it falls on Mario’s Rest Day!',
    simplifiedDefinition:
      'Follows the "No Work, No Pay" principle unless a favorable company policy or CBA exists. Work performed for the first 8 hours earns +30% (130% total), or +50% (150% total) when falling on the employee’s scheduled rest day.',
    statutoryBasis: 'Article 93, Labor Code & Executive Order No. 292',
    barExamTip:
      'Watch out for "Special WORKING Days": on a Special Working Day, an employee receives only 100% basic pay (no +30% premium) because it is treated as an ordinary working day!',
  },
  {
    id: 'double-regular-holiday',
    term: 'Double Regular Holiday (300% / 390% Rule)',
    category: 'Rest & Holidays',
    aliases: ['double holiday', 'double regular holiday', '300% rule', '390% rule'],
    marioPowerUp: 'Triple Gold Crown Star',
    marioIcon: 'star',
    marioAnalogy:
      'Two Regular Holidays collide on the same calendar date (like Maundy Thursday + Araw ng Kagitingan)! Unworked = 200% pay; Worked = 300% pay; Worked on Rest Day = 390% pay!',
    simplifiedDefinition:
      'When two regular holidays fall on the same day (e.g., Araw ng Kagitingan and Maundy Thursday/Good Friday), a covered employee receives 200% if unworked, 300% if worked for the first 8 hours, and 390% (300% × 130%) if worked on a rest day.',
    statutoryBasis: 'DOLE Handbook on Workers’ Statutory Monetary Benefits & Asian Transmission v. CA',
    barExamTip:
      'In Asian Transmission Corp. v. CA, the Supreme Court affirmed that monthly-paid and daily-paid workers are entitled to BOTH holiday pays on a double regular holiday because Art. 94 guarantees every regular holiday.',
  },
  {
    id: 'successive-regular-holidays',
    term: 'Successive Regular Holidays Rule (Maundy Thursday & Good Friday)',
    category: 'Rest & Holidays',
    aliases: ['successive regular holidays', 'successive holidays', 'preceding day absence'],
    marioPowerUp: 'Chain Chomp Double Link',
    marioIcon: 'question_block',
    marioAnalogy:
      'If Mario goes AWOL (unpaid absence) on Wednesday before Holy Week, he loses unworked holiday pay for BOTH Maundy Thursday AND Good Friday—UNLESS he reports to work on Maundy Thursday, which unlocks Good Friday’s 100% pay!',
    simplifiedDefinition:
      'Where there are two successive regular holidays (like Maundy Thursday and Good Friday), an employee may not be paid for both holidays if absent WITHOUT pay on the workday immediately preceding the first holiday, unless they work on the first holiday (in which case they are entitled to holiday pay on the second).',
    statutoryBasis: 'Omnibus Rules Book III, Rule IV, Sec. 10',
    barExamTip:
      'If the employee was on LEAVE WITH PAY on Wednesday, they receive 100% unworked holiday pay for BOTH Thursday and Friday!',
  },
  {
    id: 'muslim-holidays',
    term: 'Muslim Holidays Doctrine (P.D. 1083)',
    category: 'Rest & Holidays',
    aliases: ['muslim holidays', 'pd 1083', 'eid al-fitr', 'eid al-adha'],
    marioPowerUp: 'Crescent Star Medallion',
    marioIcon: 'star',
    marioAnalogy:
      'In designated Mindanao provinces, regional Muslim Holidays apply to BOTH Muslim and Christian workers! Outside those areas, Eid’l Fitr and Eid’l Adha are nationwide Regular Holidays for all Filipinos!',
    simplifiedDefinition:
      'Eid’l Fitr (R.A. 9177) and Eid’l Adha (R.A. 9849) are nationwide regular holidays for all workers. Regional Muslim holidays under P.D. 1083 are observed by BOTH Muslim and non-Muslim employees within the designated provinces, while Muslim employees working outside those provinces are excused WITH PAY.',
    statutoryBasis: 'P.D. No. 1083, R.A. 9177, R.A. 9849; San Miguel Corp. v. CA (G.R. No. 146775)',
    barExamTip:
      'SMC v. CA rule: Within the P.D. 1083 provinces, non-Muslim workers ALSO enjoy Muslim holiday pay because holiday proclamations within a territory apply regardless of religion.',
  },
  {
    id: 'divisor-365-261',
    term: 'Monthly-Paid vs. Daily-Paid Divisor (365 / 261 Rule)',
    category: 'Rest & Holidays',
    aliases: ['365 divisor', '261 divisor', 'monthly-paid employees', 'eemr'],
    marioPowerUp: 'Toad Abacus Multiplier',
    marioIcon: 'coin',
    marioAnalogy:
      'Monthly-paid Peach guards are paid for ALL 365 days of the year (including rest days & holidays), so their unworked holiday pay is already baked into their monthly salary!',
    simplifiedDefinition:
      'Monthly-paid employees are paid every day of the month including unworked rest days, special days, and regular holidays (factor 365). Daily-paid employees are paid only on days actually worked and unworked regular holidays (e.g., factor 261 for 5-day workweek or 313 for 6-day workweek).',
    statutoryBasis: 'DOLE Handbook; Chartered Bank Employees Assoc. v. Ople; Odango v. NLRC',
    barExamTip:
      'An employer CANNOT unilaterally reduce or increase a long-established divisor if doing so diminishes daily/overtime rates (Art. 100 Non-Diminution).',
  },
  {
    id: 'service-incentive-leave',
    term: 'Service Incentive Leave (SIL, 5 Days, Art. 95)',
    category: 'Rest & Holidays',
    aliases: ['service incentive leave', 'sil', 'article 95'],
    marioPowerUp: '1-Up Mushroom Bank',
    marioIcon: '1up',
    marioAnalogy:
      'After completing 1 year of service (whether continuous or broken), Mario banks 5 paid SIL days! Unused SIL converts to cash at year-end based on his current salary!',
    simplifiedDefinition:
      'Every covered employee who has rendered at least one (1) year of service is entitled to yearly Service Incentive Leave of five (5) days with pay, commutable to cash if unused at the end of the year.',
    statutoryBasis: 'Article 95, Labor Code; Auto Bus Transport v. Bautista',
    barExamTip:
      'Exemptions from SIL: (1) Managerial/field personnel, (2) Those already enjoying >=5 days vacation leave with pay, and (3) Establishments regularly employing LESS THAN TEN (<10) workers. Prescription (3 yrs) runs from demand/refusal or separation!',
  },
  {
    id: 'service-charge',
    term: 'Service Charge 100% Distribution (R.A. 11360)',
    category: 'Rest & Holidays',
    aliases: ['service charge', 'service charges', 'ra 11360', 'article 96'],
    marioPowerUp: 'Yoshi Feast Treasury',
    marioIcon: 'coin',
    marioAnalogy:
      'In hotels and restaurants, 100% of all service charges go equally to covered workers! Boss Bowser lost his old 15% management share forever under R.A. 11360!',
    simplifiedDefinition:
      'All service charges collected by hotels, restaurants, and similar establishments shall be distributed completely and equally (100%) among covered employees, excluding managerial employees.',
    statutoryBasis: 'Republic Act No. 11360 (amending Article 96, Labor Code) & DOLE D.O. 206-19',
    barExamTip:
      'Frequency of payout: completely and equally at least once every two (2) weeks or twice a month at intervals not exceeding 16 days.',
  },
  {
    id: 'thirteenth-month-pay',
    term: '13th Month Pay (P.D. 851)',
    category: 'Rest & Holidays',
    aliases: ['13th month pay', 'thirteenth month pay', 'pd 851'],
    marioPowerUp: 'Golden Year-End Chest',
    marioIcon: 'coin',
    marioAnalogy:
      'Work at least 1 month during the calendar year and Princess Peach opens the Year-End Chest by December 24: Total Basic Salary Earned ÷ 12!',
    simplifiedDefinition:
      'Mandatory monetary benefit for all rank-and-file employees who have worked for at least one (1) month during a calendar year, equal to at least 1/12 of total basic salary earned within that calendar year, payable on or before December 24.',
    statutoryBasis: 'Presidential Decree No. 851 & Revised Guidelines',
    barExamTip:
      'Resigned or even validly terminated employees are entitled to PROPORTIONATE 13th month pay! Commissions form part of basic salary ONLY if they are direct wage-type commissions tied to basic pay, not productivity bonuses (Boie-Takeda / Philippine Duplicators rule).',
  },
  {
    id: 'bonus-demandability',
    term: 'Bonus / 14th Month Pay Demandability Rule',
    category: 'Rest & Holidays',
    aliases: ['bonus demandability', '14th month pay', 'christmas bonus'],
    marioPowerUp: 'Mystery Gift Star Box',
    marioIcon: 'question_block',
    marioAnalogy:
      'Unlike 13th Month Pay (which is the law!), a 14th Month Bonus is Peach’s voluntary generosity—UNLESS promised in a contract without profit conditions or turned into an unconditional company practice!',
    simplifiedDefinition:
      'A bonus is an act of generosity and management prerogative—NOT a demandable and enforceable obligation—EXCEPT when: (1) made part of the wage/compensation by express agreement without conditions, or (2) ripened into a long, consistent, unconditional company practice.',
    statutoryBasis: 'Producers Bank v. NLRC; American Wire & Cable Daily Rated Employees Union v. American Wire',
    barExamTip:
      'Always contrast 13th Month Pay (statutory & mandatory regardless of business losses) vs. Christmas/14th Month Bonus (prerogative unless contractual or unconditional practice).',
  },

  // ==================== 3. WAGES, WAGE PROTECTION & D.O. 174 ====================
  {
    id: 'wage-vs-salary',
    term: 'Wage vs. Salary Distinction (Art. 1708 Civil Code)',
    category: 'Wages & D.O. 174',
    aliases: ['wage vs salary', 'article 1708', 'garnishment of wages'],
    marioPowerUp: 'Brick Mason Coin Pouch',
    marioIcon: 'coin',
    marioAnalogy:
      'Toad the bricklayer’s manual WAGE cannot be seized by creditors—except for debts for food, shelter, clothing, and medical care! High-ranking executives’ SALARIES have no such shield!',
    simplifiedDefinition:
      '"Wage" applies to compensation for manual/skilled labor and is exempt from execution or attachment under Art. 1708 Civil Code (except for debts incurred for food, shelter, clothing, and medical attendance). "Salary" denotes higher-grade or white-collar compensation and is NOT exempt from garnishment.',
    statutoryBasis: 'Article 97(f), Labor Code; Article 1708, Civil Code; Gaa v. Court of Appeals',
    barExamTip:
      'Cite Gaa v. CA whenever a Bar question asks whether a bank manager’s or executive’s pay can be garnished by a judgment creditor (Answer: YES, because it is salary, not manual wage).',
  },
  {
    id: 'fair-days-wage',
    term: 'No Work, No Pay (Fair Day’s Wage for a Fair Day’s Labor)',
    category: 'Wages & D.O. 174',
    aliases: ['no work no pay', 'fair days wage', 'a fair days wage'],
    marioPowerUp: 'Balanced Coin Scale',
    marioIcon: 'coin',
    marioAnalogy:
      'If Mario skips the stage without valid leave or illegal lockout, he collects zero stage coins! Equal fairness protects both worker and castle.',
    simplifiedDefinition:
      'The general age-old rule governing employment: if there is no work performed by the employee, there can be no wage or pay, unless the laborer was able, willing, and ready to work but was illegally locked out, suspended, or dismissed.',
    statutoryBasis: 'Aklan Electric Cooperative v. NLRC; Sugue v. Triumph International',
    barExamTip:
      'Economic strike days are generally "No Work, No Pay" unless strikers were illegally locked out or discriminated against upon unconditional offer to return.',
  },
  {
    id: 'facilities-vs-supplements',
    term: 'Facilities vs. Supplements (Mabeza 3-Requisite Test)',
    category: 'Wages & D.O. 174',
    aliases: ['facilities vs supplements', 'facilities', 'supplements', 'mabeza test'],
    marioPowerUp: 'Castle Armor vs. Toad Soup',
    marioIcon: 'mushroom',
    marioAnalogy:
      'Fireproof Armor given to Mario so he survives Bowser’s lava is a SUPPLEMENT (for the employer’s benefit—cannot be deducted!). Everyday meals are FACILITIES, deductible ONLY if Mario signs a written consent and DOLE values them fairly!',
    simplifiedDefinition:
      'Criterion is PURPOSE, not kind: Facilities are items of expense necessary for the laborer’s and family’s existence (deductible from wage). Supplements are extra remuneration/tools given primarily for the employer’s convenience (NEVER deductible).',
    statutoryBasis: 'Article 97(f), Labor Code; Mabeza v. NLRC; Our Haus Realty v. Parian',
    barExamTip:
      'Memorize the 3 Mabeza/Our Haus requisites to deduct a Facility: (1) Proof it is customarily furnished in the trade, (2) Voluntary WRITTEN acceptance by the employee, and (3) Fair & reasonable value not exceeding cost.',
  },
  {
    id: 'non-diminution',
    term: 'Non-Diminution of Benefits (Art. 100)',
    category: 'Wages & D.O. 174',
    aliases: ['non-diminution', 'diminution of benefits', 'article 100', 'company practice'],
    marioPowerUp: 'Eternal Star Barrier',
    marioIcon: 'star',
    marioAnalogy:
      'Once Princess Peach deliberately grants Mario an extra sack of coins year after year, an Eternal Star Barrier locks it in! She cannot unilaterally take it away.',
    simplifiedDefinition:
      'Prohibits employers from unilaterally eliminating or reducing supplements or other employee benefits being enjoyed if founded on an express policy, written contract, or a consistent, deliberate grant over a considerable period.',
    statutoryBasis: 'Article 100, Labor Code; Vergara v. Coca-Cola Bottlers Phils.',
    barExamTip:
      'Exceptions where diminution is VALID: (1) Correction of a patent error in law/computation, (2) Contingent/conditional benefits (like OT or relocation allowance when condition ceases), and (3) Negotiated CBA modifications.',
  },
  {
    id: 'wage-distortion',
    term: 'Wage Distortion (Art. 124)',
    category: 'Wages & D.O. 174',
    aliases: ['wage distortion', 'distortion', 'article 124'],
    marioPowerUp: 'Warp Pipe Level Resizer',
    marioIcon: 'pipe',
    marioAnalogy:
      'A RTWPB Wage Order lifts Level 1 Toad’s pay right up to Level 5 Captain Toad’s pay! The rank gap vanished. They must resolve it via grievance/NCMB—NEVER by going on strike!',
    simplifiedDefinition:
      'A situation where a government-mandated wage increase eliminates or severely contracts intentional quantitative differences in wage or salary rates between lower and higher skill/position groups within the same region and establishment.',
    statutoryBasis: 'Article 124, Labor Code; Prubankers Assoc. v. Prudential Bank; Ilaw at Buklod v. NLRC',
    barExamTip:
      '4 Elements: (1) Existing hierarchy of positions, (2) Significant pay gap between classes, (3) Elimination/severe contraction of gap, (4) Caused by a Wage Order in the SAME region (Prubankers: inter-regional differences are NOT wage distortion!). Strikes over wage distortion are ILLEGAL.',
  },
  {
    id: 'bmbe-exemption',
    term: 'Barangay Micro Business Enterprise (BMBE, R.A. 9178)',
    category: 'Wages & D.O. 174',
    aliases: ['bmbe', 'ra 9178', 'barangay micro business'],
    marioPowerUp: 'Mini Toad Market Stall',
    marioIcon: 'mushroom',
    marioAnalogy:
      'Tiny village stalls certified as BMBEs (assets up to ₱3M) are exempt from Minimum Wage Orders to help small shops grow—but Toad workers STILL get SSS, PhilHealth, Pag-IBIG, 13th Month Pay, and Holiday Pay!',
    simplifiedDefinition:
      'Registered Barangay Micro Business Enterprises (total assets not exceeding ₱3,000,000 excluding land) are exempted from the coverage of the Minimum Wage Law, though all employees remain entitled to social security and other Labor Code benefits.',
    statutoryBasis: 'Republic Act No. 9178, Sec. 8',
    barExamTip:
      'BMBE exemption covers ONLY the Minimum Wage Law and Income Tax from operations—it does NOT exempt the business from SIL, Holiday Pay, Overtime, 13th Month Pay, or SSS/PhilHealth!',
  },
  {
    id: 'legal-tender-rule',
    term: 'Payment of Wages in Legal Tender (Art. 102)',
    category: 'Wages & D.O. 174',
    aliases: ['legal tender', 'promissory notes', 'chits', 'coupons', 'atm payroll'],
    marioPowerUp: 'Authentic Gold Coin Mint',
    marioIcon: 'coin',
    marioAnalogy:
      'Bowser cannot pay workers in "Bowser Store Coupons", IOUs, or tokens—EVEN IF the Koopas begged for coupons! Only real Philippine Pesos (or compliant bank check/ATM payroll) are legal!',
    simplifiedDefinition:
      'No employer shall pay the wages of an employee by means of promissory notes, vouchers, coupons, tokens, tickets, chits, or any object other than legal tender, even when expressly requested by the employee (criminal liability under Art. 303).',
    statutoryBasis: 'Article 102, Labor Code & DOLE Labor Advisory on ATM Payroll',
    barExamTip:
      'Payment by check or ATM is valid when customary, near a bank/ATM (<1 km), with written consent/CBA, and reasonable paid time to withdraw without charges.',
  },
  {
    id: 'permissible-wage-deductions',
    term: 'Prohibition Against Unlawful Wage Deductions (Art. 113)',
    category: 'Wages & D.O. 174',
    aliases: ['wage deductions', 'article 113', 'authorized deductions', 'agency fee'],
    marioPowerUp: 'Locked Treasury Vault',
    marioIcon: 'coin',
    marioAnalogy:
      'Nobody touches Mario’s paycheck except the Tax/SSS Toad, an insurance company Mario authorized in writing, or a Union Agency Fee!',
    simplifiedDefinition:
      'No employer may make any deduction from wages except: (a) insurance premiums with employee consent where employer is insured with worker, (b) union dues with individual written check-off or agency fees (no written authorization needed for non-union CBA beneficiaries), and (c) deductions authorized by law (SSS, PhilHealth, Pag-IBIG, withholding tax) or written employee authorization for third-party payment without employer kickback.',
    statutoryBasis: 'Article 113, Labor Code; Nina Jewelry Manufacturing v. Montecillo',
    barExamTip:
      'Unilateral salary set-offs for alleged cash shortages without complying with Art. 114–115 due process are illegal deductions.',
  },
  {
    id: 'deposits-for-loss-damage',
    term: 'Deposits & Deductions for Loss or Damage (Arts. 114–115)',
    category: 'Wages & D.O. 174',
    aliases: ['deposits for loss', 'loss or damage deduction', 'article 114', 'article 115'],
    marioPowerUp: 'Koopa Shell Breakage Shield',
    marioIcon: 'question_block',
    marioAnalogy:
      'If Luigi accidentally drops a crystal vase, Peach cannot slash his whole paycheck! She must prove Luigi was clearly at fault, give him a hearing, and never deduct more than 20% of his weekly wage!',
    simplifiedDefinition:
      'Cash deposits for loss/damage are prohibited unless customary/DOLE-authorized. Even then, deductions require: (1) employee is clearly shown responsible, (2) ample opportunity to be heard, (3) fair/reasonable deduction not exceeding actual loss, and (4) deduction does NOT exceed 20% of the employee’s weekly wage.',
    statutoryBasis: 'Articles 114 & 115, Labor Code; Omnibus Rules Book III, Rule VIII, Sec. 11',
    barExamTip:
      'Memorize the 20% weekly cap! Any deduction for loss/breakage exceeding 20% of the employee’s weekly wage violates the Implementing Rules.',
  },
  {
    id: 'worker-preference-bankruptcy',
    term: 'Worker Preference in Bankruptcy (Art. 110)',
    category: 'Wages & D.O. 174',
    aliases: ['worker preference', 'bankruptcy preference', 'article 110', 'first preference'],
    marioPowerUp: 'First-Place Pole Position Flag',
    marioIcon: 'star',
    marioAnalogy:
      'If Bowser’s Castle goes bankrupt and enters liquidation court, unpaid worker wages jump ahead of unsecured creditors and even government taxes—right after mortgaged property liens!',
    simplifiedDefinition:
      'In the event of bankruptcy or liquidation of an employer’s business, unpaid wages and monetary claims of workers enjoy FIRST PREFERENCE as regards free/unencumbered property ahead of taxes and other general claims, subject to formal insolvency/liquidation proceedings and special preferred liens (mortgages) on specific property.',
    statutoryBasis: 'Article 110, Labor Code; DBP v. NLRC; Republic v. Peralta; FRIA (R.A. 10142)',
    barExamTip:
      'Two Bar traps: (1) Requires a formal declaration of bankruptcy or judicial liquidation proceeding in rem, and (2) A registered mortgage/lien over a SPECIFIC property (in rem) still prevails over that specific asset (DBP v. NLRC).',
  },
  {
    id: 'attorneys-fees-art-111',
    term: 'Attorney’s Fees — 10% Extraordinary Concept (Art. 111)',
    category: 'Wages & D.O. 174',
    aliases: ['attorneys fees', 'article 111', '10% attorneys fees', 'unlawful withholding'],
    marioPowerUp: 'Lawyer Toad Briefcase',
    marioIcon: 'coin',
    marioAnalogy:
      'When Bowser unlawfully withholds wages and forces Mario to litigate to recover them, Bowser gets hit with a +10% Attorney’s Fee indemnity awarded to Mario!',
    simplifiedDefinition:
      'In cases of unlawful withholding of wages (or where an employee is compelled to litigate to recover valid monetary claims), the culpable party may be assessed attorney’s fees equivalent to ten percent (10%) of the amount of wages recovered.',
    statutoryBasis: 'Article 111, Labor Code; Tangga-an v. Philippine Transmarine Carriers',
    barExamTip:
      'In its extraordinary concept under Art. 111, the 10% award belongs to the LITIGANT (worker) as indemnity for damages—and does NOT require proof of bad faith once wages were unlawfully withheld!',
  },
  {
    id: 'legitimate-job-contracting',
    term: 'Legitimate Job Contracting (Trilateral Relationship)',
    category: 'Wages & D.O. 174',
    aliases: ['legitimate job contracting', 'trilateral relationship', 'independent contractor', '5 million capital'],
    marioPowerUp: 'Certified Builder Mario Rig',
    marioIcon: 'pipe',
    marioAnalogy:
      'Builder Toad owns ₱5,000,000+ in cranes and supervises his own crew while building Peach’s bridge! Builder Toad is the direct employer, while Peach is solidarily liable ONLY for unpaid statutory wages!',
    simplifiedDefinition:
      'Permissible contracting where the contractor: (1) is registered with DOLE, (2) carries an independent business free from the principal’s control except as to results, and (3) has substantial capital (at least ₱5,000,000 paid-up capital/net worth) OR investment in tools, equipment, and work premises.',
    statutoryBasis: 'Articles 106–109, Labor Code & DOLE Department Order No. 174-17',
    barExamTip:
      'Failure to register with DOLE gives rise to a disputable PRESUMPTION of labor-only contracting!',
  },
  {
    id: 'labor-only-contracting',
    term: 'Labor-Only Contracting (LOC — Strictly Prohibited)',
    category: 'Wages & D.O. 174',
    aliases: ['labor-only contracting', 'labor only contracting', 'do 174', 'sham contractor', 'endo'],
    marioPowerUp: 'Ghost Subcontractor Buster',
    marioIcon: 'bowser',
    marioAnalogy:
      'Bowser uses a fake agency with zero tools and zero capital to supply castle guards he bosses around daily. The law pierces the ghost: Bowser becomes the DIRECT EMPLOYER for ALL purposes!',
    simplifiedDefinition:
      'Prohibited arrangement where: (a) the contractor lacks substantial capital OR investment AND the workers perform activities directly related to the principal’s main business, OR (b) the contractor does not exercise the right to control the performance of the employees’ work.',
    statutoryBasis: 'Article 106, Labor Code & DOLE D.O. No. 174-17, Sec. 5',
    barExamTip:
      'Contrast liability: In Legitimate Contracting -> Principal is solidarily liable ONLY for unpaid wages (limited purpose). In Labor-Only Contracting -> Principal IS the direct employer liable for illegal dismissal, backwages, CBA benefits, and damages (all purposes)!',
  },

  // ==================== 4. SPECIAL GROUPS & PROTECTIVE STATUTES ====================
  {
    id: 'kasambahay-law',
    term: 'Batas Kasambahay (Domestic Workers Act, R.A. 10361)',
    category: 'Special & Protective',
    aliases: ['kasambahay', 'domestic worker', 'ra 10361', 'batas kasambahay'],
    marioPowerUp: 'Golden Household Crown',
    marioIcon: 'mushroom',
    marioAnalogy:
      'Live-in yayas, cooks, and gardeners get 8 hours daily aggregate rest, 24h weekly rest, 5 days non-cumulative SIL, 13th Month Pay, and FREE meals/lodging that can NEVER be deducted from wages!',
    simplifiedDefinition:
      'Comprehensive charter protecting general househelp, yaya, cook, gardener, and laundry person working in an occupational household: grants regional minimum wage, 13th month pay, 5 days annual SIL (non-cumulative, non-convertible to cash!), and mandatory SSS/PhilHealth/Pag-IBIG.',
    statutoryBasis: 'Republic Act No. 10361',
    barExamTip:
      'TWO classic Kasambahay traps: (1) Family drivers and children under foster family arrangement are EXCLUDED; (2) Unlike Art. 95 Labor Code SIL, Kasambahay 5-day SIL is NON-CUMULATIVE and NOT convertible to cash!',
  },
  {
    id: 'nightwork-women-ra-10151',
    term: 'Night Workers Law (Repeal of Women Nightwork Ban, R.A. 10151)',
    category: 'Special & Protective',
    aliases: ['ra 10151', 'night workers', 'pregnant night worker'],
    marioPowerUp: 'Starlight Health Shield',
    marioIcon: 'star',
    marioAnalogy:
      'Women are no longer banned from night quests! Instead, ALL night workers (men & women working >=7 consecutive hours covering 12 MN–5 AM) get free health assessments, transport, and maternity day-shift transfers!',
    simplifiedDefinition:
      'Repealed the old blanket prohibition on nightwork for women (former Arts. 130–131) and enacted gender-neutral health, sleeping quarters, transportation, and transfer protections for "night workers" (employed at least 7 consecutive hours spanning midnight to 5:00 AM), with special day-shift alternatives for pregnant/nursing women.',
    statutoryBasis: 'Republic Act No. 10151 (adding Arts. 154–161, Labor Code)',
    barExamTip:
      'Pregnant and nursing night workers must be provided an alternative to nightwork for at least 16 weeks before/after childbirth (at least 8 weeks before expected childbirth) without loss of status or pay.',
  },
  {
    id: 'no-marriage-stipulation',
    term: 'Prohibition Against Stipulation Against Marriage (Art. 134)',
    category: 'Special & Protective',
    aliases: ['stipulation against marriage', 'no-spouse policy', 'star paper doctrine', 'article 134'],
    marioPowerUp: 'Wedding Bell Invincibility',
    marioIcon: 'fire_flower',
    marioAnalogy:
      'Bowser cannot make Peach sign a contract promising "If you marry Mario, you’re automatically resigned!" Unless Bowser proves a real Bona Fide Occupational Qualification (like marrying a direct competitor’s spy), the policy is VOID!',
    simplifiedDefinition:
      'It is unlawful for an employer to require as a condition of employment or continuation of employment that a woman employee shall not get married, or to stipulate expressly or tacitly that upon getting married she shall be deemed resigned or separated.',
    statutoryBasis: 'Article 134 (formerly Art. 136), Labor Code; Star Paper Corp. v. Simbol; Duncan Assoc. v. Glaxo Wellcome',
    barExamTip:
      'Compare Star Paper (blanket ban on marrying co-workers = VOID, failed reasonable business necessity) vs. Duncan v. Glaxo (ban on marrying employees of a DIRECT COMPETITOR = VALID BFOQ to protect trade secrets!).',
  },
  {
    id: 'bfoq-doctrine',
    term: 'Bona Fide Occupational Qualification (BFOQ)',
    category: 'Special & Protective',
    aliases: ['bfoq', 'bona fide occupational qualification', 'meiorin test'],
    marioPowerUp: 'Precision Keyhole Gate',
    marioIcon: 'question_block',
    marioAnalogy:
      'Requiring Toads to pass a fitness weight limit only works if riding a delicate Paratroopa wing genuinely requires it for passenger safety—not for vanity!',
    simplifiedDefinition:
      'An employment qualification that would otherwise be discriminatory is valid ONLY if the employer proves: (1) the standard is reasonably necessary to the essence of the business operation, and (2) there is a factual basis that all or substantially all persons lacking the qualification cannot perform the job safely and efficiently.',
    statutoryBasis: 'Yrasuegui v. Philippine Airlines; Star Paper Corp. v. Simbol',
    barExamTip:
      'In Yrasuegui v. PAL, cabin crew weight standards were upheld as a valid BFOQ strictly because of aircraft emergency evacuation safety—NOT aesthetics.',
  },
  {
    id: 'anti-age-discrimination',
    term: 'Anti-Age Discrimination in Employment Act (R.A. 10911)',
    category: 'Special & Protective',
    aliases: ['anti-age discrimination', 'ra 10911', 'age limit job ad'],
    marioPowerUp: 'Timeless Cranky-to-Mario Badge',
    marioIcon: '1up',
    marioAnalogy:
      'Job ads saying "Must be 21–28 years old, pleasing personality" are outlawed in the Kingdom! Skill and merit—not birthday candles—decide who enters the Warp Pipe!',
    simplifiedDefinition:
      'Prohibits employers and publishers from printing age preferences/limitations in job ads, requiring declaration of age during application, declining employment, denying promotion/training, or imposing early retirement on the basis of age, subject to narrow BFOQ exceptions.',
    statutoryBasis: 'Republic Act No. 10911',
    barExamTip:
      'Exceptions under R.A. 10911: (1) Age is a BFOQ (e.g., child actor), (2) Bona fide seniority system, (3) Bona fide voluntary early retirement plan approved by DOLE/employees.',
  },
  {
    id: 'child-labor-ra-9231',
    term: 'Working Child Rules & Worst Forms of Child Labor (R.A. 9231)',
    category: 'Special & Protective',
    aliases: ['child labor', 'working child', 'ra 9231', 'below 15 years old'],
    marioPowerUp: 'Baby Mario Bubble Shield',
    marioIcon: 'mushroom',
    marioAnalogy:
      'Baby Mario (<15 yrs) can only work under parents’ sole responsibility or in DOLE-permitted entertainment: max 4 hours/day, max 20 hours/week, and NEVER between 8:00 PM and 6:00 AM!',
    simplifiedDefinition:
      'Children below 15 cannot be employed except under parents’ direct responsibility (non-hazardous, schooling assured) or public entertainment with DOLE permit. Hours cap: Below 15 = max 4h/day, 20h/wk, no work 8 PM–6 AM; Ages 15 to <18 = max 8h/day, 40h/wk, no work 10 PM–6 AM, zero hazardous work.',
    statutoryBasis: 'Republic Act No. 9231 (amending R.A. 7610) & Art. 137 Labor Code',
    barExamTip:
      'Memorize the exact curfew and weekly cap contrast: Below 15 -> 4h/day, 20h/wk, 8 PM–6 AM curfew; 15 to <18 -> 8h/day, 40h/wk, 10 PM–6 AM curfew!',
  },
  {
    id: 'apprentices-vs-learners',
    term: 'Apprentices vs. Learners (Arts. 58 & 73)',
    category: 'Special & Protective',
    aliases: ['apprentice', 'learnership', 'apprenticeship', '75% minimum wage'],
    marioPowerUp: 'Toad Kart Academy License',
    marioIcon: 'pipe',
    marioAnalogy:
      'Apprentices train >3–6 months in highly technical trades; Learners train <=3 months in semi-skilled tasks WITH an employer commitment to hire them as Regulars once they finish!',
    simplifiedDefinition:
      'Apprenticeship (>3 to 6 months) covers apprenticeable technical trades with TESDA approval and no commitment to hire. Learnership (<=3 months) covers non-apprenticeable semi-skilled industrial jobs and REQUIRES a commitment to employ the learner as a regular employee upon completion. Both start at >=75% statutory minimum wage.',
    statutoryBasis: 'Articles 58–77, Labor Code; Nitto Enterprises v. NLRC',
    barExamTip:
      'Without prior TESDA approval or a valid signed apprenticeship/learnership agreement BEFORE work starts, the trainee is deemed a REGULAR EMPLOYEE from Day 1 (Nitto Enterprises v. NLRC)!',
  },
  {
    id: 'pwd-magna-carta',
    term: 'Magna Carta for Persons with Disability (PWD, R.A. 7277)',
    category: 'Special & Protective',
    aliases: ['pwd', 'qualified disabled employee', 'ra 7277', 'magna carta for disabled'],
    marioPowerUp: 'Golden Rainbow Ramp',
    marioIcon: 'star',
    marioAnalogy:
      'A qualified Toad with a disability gets 100% EQUAL minimum wage and the exact same regularization rights as every other castle knight—never a discounted wage!',
    simplifiedDefinition:
      'Qualified employees with disabilities are entitled to the same terms, conditions, compensation, privileges, benefits, fringe benefits, or incentives as qualified able-bodied employees (100% statutory wage). Government agencies must reserve at least 1% of positions for PWDs; private corporations with >100 employees are encouraged to reserve at least 1%.',
    statutoryBasis: 'Republic Act No. 7277 (as amended by R.A. 10524); Bernardo v. NLRC',
    barExamTip:
      'In Bernardo v. NLRC, deaf-mute bank workers performing necessary & desirable cash-sorting tasks beyond 6 months became REGULAR employees!',
  },
  {
    id: 'telecommuting-act',
    term: 'Telecommuting Act (Work-From-Home Fair Treatment, R.A. 11165)',
    category: 'Special & Protective',
    aliases: ['telecommuting', 'ra 11165', 'work from home', 'fair treatment'],
    marioPowerUp: 'Warp Pipe Remote Terminal',
    marioIcon: 'pipe',
    marioAnalogy:
      'Working from Toad’s Cottage via Warp Zoom earns the EXACT same overtime, night differential, holiday pay, leaves, and career promotions as working inside Peach’s Castle!',
    simplifiedDefinition:
      'Recognizes voluntary work from an alternative workplace using telecommunications/computer technologies and mandates the "Fair Treatment" standard: telecommuting employees must receive pay, overtime, NSD, leaves, training, and career development no less favorable than comparable on-site employees.',
    statutoryBasis: 'Republic Act No. 11165 & DOLE D.O. No. 237-22',
    barExamTip:
      'Telecommuting is VOLUNTARY via mutual agreement and never converts regular supervised workers into excluded "field personnel".',
  },
  {
    id: 'anti-sexual-harassment-ra-7877',
    term: 'Anti-Sexual Harassment Act (Work/Education/Training, R.A. 7877)',
    category: 'Special & Protective',
    aliases: ['sexual harassment', 'ra 7877', 'codi', 'authority influence moral ascendancy'],
    marioPowerUp: 'Committee on Decorum Shield',
    marioIcon: 'fire_flower',
    marioAnalogy:
      'Under R.A. 7877, if Boss Koopa uses his authority or moral ascendancy to demand favors (or create a hostile castle), BOTH Koopa AND an employer who ignores the complaint become solidarily liable!',
    simplifiedDefinition:
      'Committed by a person having authority, influence, or moral ascendancy over another in a work, training, or education environment who demands, requests, or otherwise requires a sexual favor (quid pro quo OR hostile environment). Requires every employer to create a Committee on Decorum and Investigation (CODI).',
    statutoryBasis: 'Republic Act No. 7877; Domingo v. Rayala; LBC Express-Vis v. Palco',
    barExamTip:
      'No categorical demand for a sexual favor is needed if the act creates an intimidating, hostile, or offensive environment (Domingo v. Rayala). Employer is solidarily liable for damages if informed and fails to take immediate action!',
  },
  {
    id: 'safe-spaces-bawal-bastos',
    term: 'Safe Spaces Act / Bawal Bastos Law (Peer & Online Harassment, R.A. 11313)',
    category: 'Special & Protective',
    aliases: ['safe spaces act', 'bawal bastos', 'ra 11313', 'peer sexual harassment'],
    marioPowerUp: 'Universal Star Fortress',
    marioIcon: 'star',
    marioAnalogy:
      'What if a CO-WORKER or even a SUBORDINATE harasses Peach—or sends sleazy chat messages? R.A. 7877 needed "moral ascendancy", so R.A. 11313 closed the gap: peer-to-peer and subordinate-to-superior harassment are now punishable too!',
    simplifiedDefinition:
      'Expands workplace gender-based sexual harassment to cover acts committed between PEERS, by a SUBORDINATE to a superior, or online/in public spaces—removing R.A. 7877’s requirement of authority, influence, or moral ascendancy.',
    statutoryBasis: 'Republic Act No. 11313 (Safe Spaces Act of 2019)',
    barExamTip:
      'Always pair R.A. 7877 (requires authority/moral ascendancy) with R.A. 11313 (covers peer-to-peer, subordinate-to-superior, and online workplace harassment)!',
  },
  {
    id: 'osh-law-ra-11058',
    term: 'Occupational Safety & Health Law — Right to Refuse Unsafe Work (R.A. 11058)',
    category: 'Special & Protective',
    aliases: ['osh law', 'ra 11058', 'imminent danger', 'right to refuse unsafe work', 'ppe'],
    marioPowerUp: 'Hardhat Buzzy Beetle Helmet',
    marioIcon: 'mushroom',
    marioAnalogy:
      'If lava is leaking onto the bridge, Mario has the statutory RIGHT TO REFUSE UNSAFE WORK without losing pay while the hazard persists—and free PPE helmets can NEVER be charged to Mario!',
    simplifiedDefinition:
      'Grants workers: (1) Right to know workplace hazards, (2) Right to report accidents without retaliation, (3) Right to REFUSE UNSAFE WORK without threat of reprisal when an imminent danger situation exists, and (4) Right to FREE Personal Protective Equipment (PPE) at the employer’s expense.',
    statutoryBasis: 'Republic Act No. 11058, Secs. 5–8 & DOLE D.O. No. 198-18',
    barExamTip:
      'If DOLE issues a Work Stoppage Order (WSO) due to imminent danger caused by the employer’s violation or fault, the employer MUST PAY the affected workers’ wages during the stoppage!',
  },
  {
    id: 'expanded-breastfeeding-act',
    term: 'Expanded Breastfeeding Promotion Act (Lactation Breaks, R.A. 10028)',
    category: 'Special & Protective',
    aliases: ['lactation periods', 'lactation station', 'ra 10028', 'breastfeeding breaks'],
    marioPowerUp: 'Peach Nursery Sanctuary',
    marioIcon: '1up',
    marioAnalogy:
      'Nursing mothers get at least 40 PAID minutes per 8-hour shift—ON TOP OF their regular 60-minute lunch break—inside a clean private lactation station!',
    simplifiedDefinition:
      'Requires workplaces to establish clean, non-bathroom lactation stations and grants nursing employees paid "lactation periods" of not less than a total of forty (40) minutes for every eight-hour working period, IN ADDITION to regular meal time-off.',
    statutoryBasis: 'Republic Act No. 10028, Sec. 12',
    barExamTip:
      'Lactation breaks (minimum 40 minutes per 8-hour shift) are COMPENSABLE working hours and cannot replace the 60-minute regular meal break.',
  },
  {
    id: 'first-time-jobseekers',
    term: 'First Time Jobseekers Assistance Act (R.A. 11261)',
    category: 'Special & Protective',
    aliases: ['first time jobseekers', 'ra 11261', 'free nbi clearance'],
    marioPowerUp: 'Starter Stage Free Pass',
    marioIcon: 'coin',
    marioAnalogy:
      'New graduates entering World 1-1 get a one-time FREE Warp Pass for NBI, Police, Birth Certificate, and government pre-employment clearances upon presenting a Barangay Certification!',
    simplifiedDefinition:
      'Waives all government fees and charges (NBI clearance, police clearance, PSA birth certificate, transcript, etc.) ONE TIME for Filipino first-time jobseekers, including new graduates, out-of-school youth, and working students, upon presenting a Barangay Certification.',
    statutoryBasis: 'Republic Act No. 11261',
    barExamTip:
      'Fee waiver applies once per beneficiary and excludes professional licensure examination fees (PRC/Bar Exam fees) and passports/driver’s licenses.',
  },

  // ==================== 5. STATUTORY LEAVES & RETIREMENT ====================
  {
    id: 'expanded-maternity-leave',
    term: 'Expanded Maternity Leave (105 / 120 / 60 Days, R.A. 11210)',
    category: 'Leaves & Retirement',
    aliases: ['expanded maternity leave', 'ra 11210', '105 days', 'maternity leave', 'salary differential'],
    marioPowerUp: 'Peach Crown 105-Day Shield',
    marioIcon: 'mushroom',
    marioAnalogy:
      'Princess Peach gets 105 paid days for every live birth (+15 days if Solo Parent = 120; 60 days for miscarriage/ETP), can transfer up to 7 days to Mario, and has ZERO delivery limit!',
    simplifiedDefinition:
      'Grants 105 days paid leave with full pay for live childbirth (regardless of NSD/CS delivery or civil status), +15 paid days for qualified solo parents (120 days total), optional 30 days unpaid extension, and 60 paid days for miscarriage or emergency termination of pregnancy—applicable to EVERY instance of pregnancy.',
    statutoryBasis: 'Republic Act No. 11210',
    barExamTip:
      'Private employers must advance full maternity pay within 30 days and pay the SALARY DIFFERENTIAL (difference between full salary and SSS maternity benefit), unless exempt (distressed, <10 retail/service, micro-business, or already granting equivalent benefits).',
  },
  {
    id: 'paternity-leave',
    term: 'Paternity Leave Act (7 Calendar Days, R.A. 8187)',
    category: 'Leaves & Retirement',
    aliases: ['paternity leave', 'ra 8187', '7 days paternity'],
    marioPowerUp: 'Father Mario Family Shield',
    marioIcon: 'star',
    marioAnalogy:
      'Married Mario living with Peach gets 7 paid days for her first 4 deliveries/miscarriages—and if Peach transfers 7 days of her R.A. 11210 maternity leave, Mario enjoys 14 paid days!',
    simplifiedDefinition:
      'Grants 7 days leave with full pay to every married male employee in the private and public sectors for the first four (4) deliveries (childbirth or miscarriage) of the legitimate spouse with whom he is cohabiting.',
    statutoryBasis: 'Republic Act No. 8187',
    barExamTip:
      'Contrast R.A. 8187 Paternity Leave (married + cohabiting + max 4 deliveries) vs. R.A. 11210 7-day Allocated Leave from mother (available to child’s father WHETHER OR NOT married to the mother!).',
  },
  {
    id: 'solo-parent-leave',
    term: 'Expanded Solo Parents Welfare Leave (7 Days, R.A. 11861)',
    category: 'Leaves & Retirement',
    aliases: ['solo parent leave', 'ra 11861', 'solo parent act', 'ra 8972'],
    marioPowerUp: 'Super Star Solo Cape',
    marioIcon: 'star',
    marioAnalogy:
      'Solo Parent Mario now needs only 6 MONTHS of service (reduced from 1 year!), qualifies with children up to 22 years old, and gets priority telecommuting!',
    simplifiedDefinition:
      'Forfeitable (non-cumulative) 7 working days annual paid parental leave for any solo parent employee holding a valid Solo Parent ID who has rendered at least six (6) months of service (including kasambahays!).',
    statutoryBasis: 'Republic Act No. 11861 (amending R.A. 8972)',
    barExamTip:
      'Three major R.A. 11861 Bar updates: (1) Service requirement reduced from 1 year to 6 months, (2) Dependent child age raised to 22 years old (unmarried & dependent), and (3) Spouses/family caregivers of OFWs in low/semi-skilled categories away for 12 continuous months can qualify!',
  },
  {
    id: 'vawc-leave',
    term: 'Anti-VAWC Victim Paid Leave (10 Days, R.A. 9262)',
    category: 'Leaves & Retirement',
    aliases: ['vawc leave', 'ra 9262', 'anti-vawc', 'violence against women'],
    marioPowerUp: 'Invincible Protection Star',
    marioIcon: 'star',
    marioAnalogy:
      'A woman worker surviving abuse gets up to 10 paid days (extendible per Protection Order) simply by presenting a Barangay/Prosecutor/Clerk of Court certification that an action is pending!',
    simplifiedDefinition:
      'Up to ten (10) days paid leave in addition to other paid leaves for female employees who are victims of physical, sexual, psychological, or economic violence under R.A. 9262, extendible when specified in the Protection Order.',
    statutoryBasis: 'Republic Act No. 9262, Sec. 43',
    barExamTip:
      'No prior conviction is needed! A simple certification from the Punong Barangay/Kagawad, Prosecutor, or Clerk of Court that a VAWC action is pending suffices.',
  },
  {
    id: 'special-leave-women',
    term: 'Special Leave Benefit for Women (Gynecological Surgery, R.A. 9710)',
    category: 'Leaves & Retirement',
    aliases: ['special leave for women', 'gynecological leave', 'ra 9710', 'magna carta of women'],
    marioPowerUp: 'Peach Blossom Healing Elixir',
    marioIcon: 'fire_flower',
    marioAnalogy:
      'After 6 months of aggregate service in the past 12 months, a female worker undergoing gynecological surgery receives up to 2 FULL MONTHS of gross compensation!',
    simplifiedDefinition:
      'A female employee who has rendered continuous aggregate employment service of at least six (6) months for the last 12 months is entitled to a special leave benefit of up to two (2) months with full pay based on gross monthly compensation following surgery caused by gynecological disorders.',
    statutoryBasis: 'Republic Act No. 9710, Sec. 18 & DOLE D.O. No. 112-11',
    barExamTip:
      'If gynecological surgery occurs due to miscarriage/ETP, the woman claims the 60-day Expanded Maternity Leave under R.A. 11210, NOT double recovery under R.A. 9710.',
  },
  {
    id: 'retirement-pay',
    term: 'Retirement Pay Law (22.5-Day Formula, Art. 302)',
    category: 'Leaves & Retirement',
    aliases: ['retirement pay', 'article 302', 'art 302', 'one-half month salary', '22.5 days'],
    marioPowerUp: 'Golden 22.5-Day Mushroom Trove',
    marioIcon: 'coin',
    marioAnalogy:
      'At Optional age 60 or Compulsory age 65 (with >=5 years service), "1/2 month salary" equals 22.5 DAYS per year of service: 15 days basic + 5 days SIL + 2.5 days (1/12 of 13th month)!',
    simplifiedDefinition:
      'In the absence of a superior retirement plan, an employee aged 60 (optional) to 65 (compulsory) with at least 5 years of service receives at least 1/2 month salary (= 22.5 days) for every year of service, a fraction of at least 6 months being considered as 1 whole year.',
    statutoryBasis: 'Article 302 (formerly Art. 287), Labor Code; R.A. 7641; Elegir v. PAL',
    barExamTip:
      'Retail, service, and agricultural establishments employing NOT MORE THAN TEN (<=10) employees are EXEMPT from R.A. 7641 statutory retirement pay. Part-time employees ARE covered if they meet age + 5-year service!',
  },
  {
    id: 'underground-surface-miners-retirement',
    term: 'Underground & Surface Mine Workers Retirement (Age 50 / 60)',
    category: 'Leaves & Retirement',
    aliases: ['underground mine workers', 'surface mine workers', 'ra 8558', 'ra 10757'],
    marioPowerUp: 'Monty Mole Golden Pickaxe',
    marioIcon: 'coin',
    marioAnalogy:
      'Digging deep in World 1-2 caverns is tough work! Both underground AND surface mine workers can retire optionally at 50 and compulsorily at 60!',
    simplifiedDefinition:
      'Reduces the retirement age of both underground and surface mine workers (mill, electrical, mechanical, tailings pond personnel) with at least 5 years of service to 50 years (optional) and 60 years (compulsory).',
    statutoryBasis: 'R.A. 8558 & R.A. 10757 (amending Art. 302, Labor Code)',
    barExamTip:
      'Also remember R.A. 10789 for Racehorse Jockeys: compulsory retirement age is 55 years old with at least 5 years of service!',
  },

  // ==================== 6. SECURITY OF TENURE, DISMISSAL & REMEDIES ====================
  {
    id: 'regular-employment',
    term: 'Regular Employment (By Nature of Work vs. Length of Service, Art. 295)',
    category: 'Tenure & Dismissal',
    aliases: ['regular employment', 'regular employee', 'necessary or desirable', 'article 295'],
    marioPowerUp: 'Permanent Star Knight Crest',
    marioIcon: 'star',
    marioAnalogy:
      'If Mario’s plumbing is "usually necessary or desirable" to Peach’s Castle pipes, he is a Regular Knight from Day 1 (unless under valid probation, project, or season)!',
    simplifiedDefinition:
      'Two types of regular employees under Art. 295: (1) By nature of work — engaged to perform activities usually necessary or desirable in the usual business or trade of the employer; and (2) By length of service — casual employees who have rendered at least one (1) year of service, whether continuous or broken, with respect to the activity in which they are employed.',
    statutoryBasis: 'Article 295 (formerly Art. 280), Labor Code; Universal Robina v. Acibo',
    barExamTip:
      'Repeated rehiring on short 5-month contracts ("5-5-5" or "endo") for tasks necessary to the core business circumvents security of tenure and makes the worker REGULAR!',
  },
  {
    id: 'project-employment',
    term: 'Project Employment (Identifiable Undertaking & Duration)',
    category: 'Tenure & Dismissal',
    aliases: ['project employee', 'project employment', 'project completion'],
    marioPowerUp: 'World Bridge Blueprint',
    marioIcon: 'pipe',
    marioAnalogy:
      'Builder Luigi is hired specifically to build "World 4 Sky Bridge" with clear scope and completion made known at the moment he enters the stage!',
    simplifiedDefinition:
      'Employment fixed for a specific project or undertaking whose completion or termination has been determined and communicated to the employee at the time of engagement.',
    statutoryBasis: 'Article 295, Labor Code; GMA Network v. Pabriga; Maraguinot v. NLRC',
    barExamTip:
      'Under Maraguinot v. NLRC, a "work pool" employee becomes REGULAR if: (1) continuously rehired for the same tasks across projects, AND (2) those tasks are vital, necessary, and indispensable to the employer’s usual business. Failure to file DOLE project termination reports is a strong badge of regular employment!',
  },
  {
    id: 'seasonal-employment',
    term: 'Seasonal Employment & Regular Seasonal Employees',
    category: 'Tenure & Dismissal',
    aliases: ['seasonal employee', 'seasonal employment', 'regular seasonal'],
    marioPowerUp: 'Harvest Yoshi Melon Basket',
    marioIcon: 'mushroom',
    marioAnalogy:
      'Yoshi harvests Star Melons every summer season for 5 straight years! He is a REGULAR SEASONAL worker: off-season is just temporary unpaid leave ("on leave"), NOT termination!',
    simplifiedDefinition:
      'Employment where work or services are seasonal in nature and for the duration of the season. Workers repeatedly and continuously hired for the same task across multiple seasons become REGULAR SEASONAL employees—during off-season their employment is merely suspended, not severed.',
    statutoryBasis: 'Article 295, Labor Code; Hacienda Fatima v. National Federation of Sugarcane Workers',
    barExamTip:
      'Refusing to rehire a regular seasonal employee at the start of the next harvest season without valid cause constitutes ILLEGAL DISMISSAL!',
  },
  {
    id: 'casual-employment',
    term: 'Casual Employment (1-Year Regularization Rule)',
    category: 'Tenure & Dismissal',
    aliases: ['casual employee', 'casual employment', 'one year of service'],
    marioPowerUp: '365-Day Transformation Mushroom',
    marioIcon: '1up',
    marioAnalogy:
      'Toad is hired for an incidental task unrelated to castle defense—like painting festive banners. Once his total days (continuous OR broken!) reach 1 year, he levels up into a Regular worker for that activity!',
    simplifiedDefinition:
      'Employment not covered by regular, project, or seasonal categories (incidental to main business). Any casual employee who renders at least one (1) year of service, whether continuous or broken, becomes a regular employee with respect to the activity in which employed.',
    statutoryBasis: 'Article 295 (2nd paragraph), Labor Code; Kimberly-Clark v. Drilon',
    barExamTip:
      'Regularization of a casual employee after 1 year occurs BY OPERATION OF LAW (no appointment paper needed), though it subsists only while that specific activity exists.',
  },
  {
    id: 'probationary-employment',
    term: 'Probationary Employment (6-Month Cap & Known Standards, Art. 296)',
    category: 'Tenure & Dismissal',
    aliases: ['probationary employment', 'probationary employee', '6 months probation', 'article 296'],
    marioPowerUp: 'Trial Stage Checkpoint Flag',
    marioIcon: 'question_block',
    marioAnalogy:
      'Peach must tell Rookie Mario the exact Castle Grading Rubric ON DAY 1! If she forgets—or lets him work on Day 181 past 6 months—Mario automatically becomes a Regular Knight!',
    simplifiedDefinition:
      'Trial employment not exceeding six (6) months from the date the employee started working (unless covered by an apprenticeship agreement or longer academic probation for teachers). Reasonable standards for regularization MUST be made known to the employee at the time of engagement.',
    statutoryBasis: 'Article 296, Labor Code; Abbott Laboratories v. Alcaraz',
    barExamTip:
      'Two automatic regularization triggers: (1) Failure to communicate regularization standards at engagement (regular from Day 1, unless self-explanatory professional role per Abbott v. Alcaraz), or (2) Allowing employee to work AFTER the 6-month period expires. Private school teachers require 3 consecutive years (6 semesters for tertiary) full-time satisfactory service!',
  },
  {
    id: 'brent-fixed-term-doctrine',
    term: 'Fixed-Term Employment (Brent School Doctrine)',
    category: 'Tenure & Dismissal',
    aliases: ['fixed-term employment', 'brent doctrine', 'brent school'],
    marioPowerUp: 'Hourglass Contract Seal',
    marioIcon: 'coin',
    marioAnalogy:
      'Dean Mario signs a 3-year Academy Dean contract on equal footing with zero pressure! Under Brent School, fixed-term contracts are valid ONLY when both sides stood on equal bargaining ground!',
    simplifiedDefinition:
      'Fixed-term employment is valid even for tasks necessary/desirable to the business ONLY IF: (1) the fixed period was knowingly and voluntarily agreed upon without force, duress, or improper moral dominance, OR (2) both parties dealt with each other on more or less equal terms with no moral dominance exercised by the employer.',
    statutoryBasis: 'Brent School, Inc. v. Zamora (G.R. No. L-48494); Fuji Television Network v. Espiritu',
    barExamTip:
      'Ordinary rank-and-file factory workers, cashiers, or drivers signing repetitive 5-month "fixed-term" contracts FAIL the Brent test because of unequal bargaining power—making them REGULAR employees!',
  },
  {
    id: 'security-of-tenure',
    term: 'Security of Tenure (Constitutional & Art. 294 Guarantee)',
    category: 'Tenure & Dismissal',
    aliases: ['security of tenure', 'article 294', 'illegal dismissal'],
    marioPowerUp: 'Golden Invincibility Fortress',
    marioIcon: 'star',
    marioAnalogy:
      'Even Probationary, Project, and Seasonal heroes enjoy Security of Tenure during their contract—nobody gets kicked down a pit without a lawful Just or Authorized Cause PLUS Due Process!',
    simplifiedDefinition:
      'In cases of regular employment (and during the term of probationary/project/fixed-term employment), the employer shall not terminate the services of an employee except for a just cause or when authorized by Title I, Book VI of the Labor Code.',
    statutoryBasis: '1987 Constitution Art. XIII, Sec. 3 & Labor Code Article 294',
    barExamTip:
      'In illegal dismissal cases, the BURDEN OF PROOF rests squarely on the EMPLOYER to prove by substantial evidence that dismissal was for a valid cause—after the employee first establishes the fact of dismissal!',
  },
  {
    id: 'serious-misconduct',
    term: 'Serious Misconduct (Just Cause, Art. 297[a])',
    category: 'Tenure & Dismissal',
    aliases: ['serious misconduct', 'grave misconduct', 'wrongful intent'],
    marioPowerUp: 'Thwomp Hammer Strike',
    marioIcon: 'bowser',
    marioAnalogy:
      'Simply slipping on a banana peel at work is NOT Serious Misconduct! The act must be grave, connected to Mario’s castle duties, and driven by wrongful/corrupt intent!',
    simplifiedDefinition:
      'Improper or wrong conduct of a grave and aggravated character—not merely trivial or unimportant—transgressing an established and definite rule of action, performed with wrongful intent and directly related to the performance of the employee’s duties.',
    statutoryBasis: 'Article 297(a), Labor Code; Imasen Philippine Manufacturing v. Alcon',
    barExamTip:
      '3 Requisites: (1) Grave and aggravated misconduct, (2) Related to the performance of employee’s duties showing unfitness to continue working, and (3) Performed with wrongful intent.',
  },
  {
    id: 'willful-disobedience',
    term: 'Willful Disobedience / Insubordination (Art. 297[a])',
    category: 'Tenure & Dismissal',
    aliases: ['willful disobedience', 'insubordination'],
    marioPowerUp: 'Koopa Command Scroll',
    marioIcon: 'bowser',
    marioAnalogy:
      'To fire Luigi for disobeying an order, the order itself must be lawful, reasonable, known to Luigi, and tied to his job—AND Luigi’s refusal must be perverse and intentional!',
    simplifiedDefinition:
      'Just cause requiring two concurrent elements: (1) the employee’s assailed conduct was willful or intentional, characterized by a wrongful and perverse attitude; and (2) the order violated was reasonable, lawful, made known to the employee, and pertained to the duties they were engaged to discharge.',
    statutoryBasis: 'Article 297(a), Labor Code; Dongon v. Rapid Movers',
    barExamTip:
      'Refusing an unlawful order (e.g., falsifying tax records or working in imminent OSH danger) is NEVER willful disobedience!',
  },
  {
    id: 'gross-habitual-neglect',
    term: 'Gross and Habitual Neglect of Duties (Art. 297[b])',
    category: 'Tenure & Dismissal',
    aliases: ['gross and habitual neglect', 'gross neglect', 'habitual tardiness'],
    marioPowerUp: 'Sleeping Piranha Plant',
    marioIcon: 'bowser',
    marioAnalogy:
      'Generally, neglect must be BOTH Gross (utter lack of care) AND Habitual (repeated)—UNLESS one single catastrophic nap burns down half of Peach’s Castle treasury!',
    simplifiedDefinition:
      'Gross negligence (want of even slight care or diligence) coupled with habitual neglect (repeated failure to perform duties over a period of time). Exception: Habituality may be dispensed with when a SINGLE act of gross negligence causes massive, substantial damage or loss to the employer.',
    statutoryBasis: 'Article 297(b), Labor Code; LBC Express v. Mateo; National Bookstore v. CA',
    barExamTip:
      'Remember the single-incident exception (LBC Express / Fuentes v. NLRC): if gross negligence causes enormous financial loss or threatens human life, habituality is NOT required!',
  },
  {
    id: 'abandonment-of-work',
    term: 'Abandonment of Work (Two-Element Doctrine)',
    category: 'Tenure & Dismissal',
    aliases: ['abandonment', 'abandonment of work', 'animus revertendi', 'awol'],
    marioPowerUp: 'Vanishing Boo Cloak',
    marioIcon: 'bowser',
    marioAnalogy:
      'Being absent (AWOL) alone is NOT Abandonment! Bowser must prove Mario vanished without justification AND clearly intended NEVER to return—and if Mario immediately files an illegal dismissal case, usually there is NO abandonment!',
    simplifiedDefinition:
      'A form of neglect of duty requiring two concurring elements: (1) failure to report for work or absence without valid or justifiable reason, AND (2) a clear intention to sever the employer-employee relationship (animus non revertendi) manifested by overt acts.',
    statutoryBasis: 'Article 297(b), Labor Code; Demex Rattancraft v. Leron',
    barExamTip:
      'Mere AWOL != Abandonment. Sending a Return-to-Work notice to the employee’s last known address AND Notice to Explain is mandatory. Immediate filing of a complaint praying for reinstatement negates abandonment!',
  },
  {
    id: 'loss-of-trust-confidence',
    term: 'Loss of Trust and Confidence (Managerial vs. Fiduciary Rank-and-File)',
    category: 'Tenure & Dismissal',
    aliases: ['loss of trust and confidence', 'breach of trust', 'fiduciary employees'],
    marioPowerUp: 'Royal Vault Keyholder',
    marioIcon: 'bowser',
    marioAnalogy:
      'Two tiers of trust: For Chancellor Toadsworth (Manager), mere basis to believe he breached trust is enough; for Vault Cashier Toad (Fiduciary Rank-and-File), Bowser needs PROOF of actual involvement in the loss!',
    simplifiedDefinition:
      'Applies only to TWO classes of positions of trust: (1) Managerial employees (mere existence of a basis for believing breach of trust suffices), and (2) Fiduciary rank-and-file employees who routinely handle significant money or property, like cashiers, auditors, and property custodians (requires proof of actual involvement in the events in question).',
    statutoryBasis: 'Article 297(c), Labor Code; Bristol Myers Squibb v. Baban; Etcuban v. Sulpicio Lines',
    barExamTip:
      'An ordinary factory janitor, driver, or clerk who does NOT routinely handle significant money/property CANNOT be dismissed for "loss of trust and confidence"!',
  },
  {
    id: 'totality-of-infractions',
    term: 'Totality of Infractions Doctrine',
    category: 'Tenure & Dismissal',
    aliases: ['totality of infractions', 'previous offenses'],
    marioPowerUp: 'Koopa Strike Counter',
    marioIcon: 'bowser',
    marioAnalogy:
      'Past warnings help calibrate the penalty when Mario commits a NEW offense—but Bowser cannot re-punish old offenses that were already penalized if there is NO new violation!',
    simplifiedDefinition:
      'The totality of an employee’s previous infractions may be considered in determining the imposable penalty (such as dismissal) for a CURRENT offense, especially when they show a pattern of defiance. However, prior offenses already penalized cannot by themselves justify dismissal without a new, related infraction.',
    statutoryBasis: 'Merin v. NLRC; Villanueva v. NLRC',
    barExamTip:
      'Past penalized infractions cannot be resurrected alone (double jeopardy principle in labor discipline), UNLESS connected to a fresh subsequent offense!',
  },
  {
    id: 'two-notice-rule',
    term: 'Two-Notice & Hearing Rule (Statutory Due Process)',
    category: 'Tenure & Dismissal',
    aliases: ['two-notice rule', 'two notice rule', 'twin-notice rule', 'notice to explain', 'king of kings'],
    marioPowerUp: 'Double Fireball Flower',
    marioIcon: 'fire_flower',
    marioAnalogy:
      'Before dismissing for Just Cause, throw TWO notices + an opportunity to be heard: (1) Detailed Charge Sheet giving >=5 CALENDAR days to submit a written explanation, (2) Meaningful Hearing/Conference, and (3) Final Decision Notice!',
    simplifiedDefinition:
      'Procedural due process for Just Cause dismissal under King of Kings Transport v. Mamac: (1) First written notice detailing specific acts/grounds + directive giving at least 5 calendar days to submit written explanation; (2) Ample opportunity to be heard (formal hearing mandatory only when requested in writing, substantial evidentiary disputes exist, or company rules require it — Perez v. PT&T); and (3) Second written notice of termination.',
    statutoryBasis: 'Article 292(b), Labor Code; DOLE D.O. 147-15; King of Kings Transport v. Mamac; Perez v. PT&T',
    barExamTip:
      'Memorize "5 calendar days" (King of Kings Transport) and "ample opportunity to be heard != mandatory trial-type hearing" (Perez v. PT&T)!',
  },
  {
    id: 'preventive-suspension',
    term: 'Preventive Suspension (30-Day Maximum Cap)',
    category: 'Tenure & Dismissal',
    aliases: ['preventive suspension', '30-day preventive suspension'],
    marioPowerUp: '30-Second Ice Flower Freeze',
    marioIcon: 'question_block',
    marioAnalogy:
      'Preventive Suspension is NOT a penalty—it only freezes a worker for up to 30 days IF their presence poses a serious threat to castle life, property, or evidence! Extend past 30 days? Pay full wages!',
    simplifiedDefinition:
      'A preliminary disciplinary measure (not a penalty) placing an employee under investigation off-duty WITHOUT pay for a maximum of thirty (30) days ONLY when their continued presence poses a serious and imminent threat to the life or property of the employer or co-workers. Any extension beyond 30 days requires reinstatement on payroll/actual duty with full wages and benefits.',
    statutoryBasis: 'Omnibus Rules Book V, Rule XXIII, Secs. 8–9; Gatbonton v. NLRC',
    barExamTip:
      'Preventive suspension exceeding 30 days WITHOUT pay constitutes CONSTRUCTIVE DISMISSAL! Also invalid if there is no serious/imminent threat to life, property, or investigation integrity.',
  },
  {
    id: 'redundancy-vs-retrenchment',
    term: 'Authorized Causes: Redundancy vs. Retrenchment (Art. 298)',
    category: 'Tenure & Dismissal',
    aliases: ['redundancy', 'retrenchment', 'labor-saving devices', 'authorized causes', 'article 298'],
    marioPowerUp: 'Castle Restructuring Blueprint',
    marioIcon: 'pipe',
    marioAnalogy:
      'Redundancy & Labor-Saving Machines pay 1 FULL MONTH per year of service; Retrenchment to prevent losses & Non-Loss Closure pay 1/2 MONTH per year of service (always min 1 month + 30-day notice to BOTH worker & DOLE)!',
    simplifiedDefinition:
      'Authorized causes under Art. 298 require 30-day prior written notice to BOTH the employee AND DOLE Regional Office, fair/reasonable criteria (Last-In, First-Out, efficiency, seniority), good faith, and Separation Pay: (a) Installation of labor-saving devices or Redundancy = 1 month pay or 1 month per year of service, whichever is higher; (b) Retrenchment to prevent serious losses or Closure NOT due to serious losses = 1 month pay or 1/2 month per year of service, whichever is higher.',
    statutoryBasis: 'Article 298 (formerly Art. 283), Labor Code; Asian Alcohol Corp. v. NLRC; North Davao Mining v. NLRC',
    barExamTip:
      'Closure DUE TO SERIOUS BUSINESS LOSSES (proven by audited financial statements) requires 30-day notice to worker + DOLE, but ZERO separation pay (North Davao Mining v. NLRC)!',
  },
  {
    id: 'disease-termination-art-299',
    term: 'Disease as Ground for Termination (Competent Public Health Authority, Art. 299)',
    category: 'Tenure & Dismissal',
    aliases: ['disease termination', 'article 299', 'incurable within 6 months', 'competent public health'],
    marioPowerUp: 'Dr. Toad Public Clinic Seal',
    marioIcon: '1up',
    marioAnalogy:
      'The castle’s own private company doctor CANNOT sign the dismissal certificate! Only a Competent PUBLIC Health Authority (DOH/Government Doctor) can certify the illness cannot be cured within 6 months!',
    simplifiedDefinition:
      'An employer may terminate an employee suffering from any disease whose continued employment is prohibited by law or prejudicial to their health or co-workers’ health ONLY WITH: (1) Certification by a COMPETENT PUBLIC HEALTH AUTHORITY that the disease cannot be cured within 6 months even with proper medical treatment, (2) Twin notices, and (3) Separation pay of 1 month or 1/2 month per year of service, whichever is higher.',
    statutoryBasis: 'Article 299 (formerly Art. 284), Labor Code; Deoferio v. Intel Technology Phils.',
    barExamTip:
      ' two-fold Bar goldmine: (1) Certification by a COMPANY physician alone makes the dismissal ILLEGAL; (2) Under R.A. 11166 (Philippine HIV and AIDS Policy Act), actual/perceived HIV status is NEVER a valid ground for termination!',
  },
  {
    id: 'bona-fide-suspension',
    term: 'Bona Fide Suspension / Floating Status (6-Month Cap, Art. 301)',
    category: 'Tenure & Dismissal',
    aliases: ['floating status', 'bona fide suspension', 'article 301', 'temporary off-detail'],
    marioPowerUp: 'Pause Block 6-Month Timer',
    marioIcon: 'question_block',
    marioAnalogy:
      'Security Guard Toad waiting for a new client post can be placed on "Floating Status" for at most 6 MONTHS! On Month 6 + Day 1 without recall, it turns into Constructive Dismissal!',
    simplifiedDefinition:
      'Bona fide suspension of business operations or off-detail status of security guards/service workers for a period NOT exceeding six (6) months does not terminate employment. Beyond 6 months without recall or new assignment, the employee is deemed constructively dismissed.',
    statutoryBasis: 'Article 301 (formerly Art. 286), Labor Code; Exocet Security v. Serrano',
    barExamTip:
      'During COVID/calamity extensions under DOLE D.O. 215-20, extensions beyond 6 months required mutual voluntary agreement reported to DOLE; unilateral indefinite floating status is illegal dismissal.',
  },
  {
    id: 'constructive-dismissal',
    term: 'Constructive Dismissal (Quit Because Unbearable)',
    category: 'Tenure & Dismissal',
    aliases: ['constructive dismissal', 'forced resignation', 'involuntary resignation'],
    marioPowerUp: 'Poison Mushroom Trap',
    marioIcon: 'bowser',
    marioAnalogy:
      'Bowser doesn’t say "You’re fired!"—he strips Luigi’s badge, cuts his pay, and locks him in an empty basement until Luigi resigns! The law calls it Constructive (Illegal) Dismissal!',
    simplifiedDefinition:
      'Cessation of work because continued employment is rendered impossible, unreasonable, or unlikely—such as an unwarranted demotion in rank, diminution in pay, or clear discrimination, insensibility, or disdain by an employer that leaves a reasonable person no choice but to forego continued employment.',
    statutoryBasis: 'Article 294, Labor Code; Morales v. Harbour Centre Port Terminal',
    barExamTip:
      'Test of Constructive Dismissal: Whether a reasonable person in the employee’s position would have felt compelled to give up their employment under the circumstances.',
  },
  {
    id: 'agabon-jaka-nominal-damages',
    term: 'Agabon vs. Jaka Doctrine (Valid Cause, Defective Procedure)',
    category: 'Tenure & Dismissal',
    aliases: ['agabon doctrine', 'jaka doctrine', 'nominal damages', '30000 nominal damages', '50000 nominal damages'],
    marioPowerUp: 'Yellow Penalty Coin Fine',
    marioIcon: 'coin',
    marioAnalogy:
      'If Bowser had a REAL lawful cause to dismiss Koopa, but skipped the required notices, the dismissal STAYS VALID—but Bowser pays ₱30,000 (Just Cause) or ₱50,000 (Authorized Cause) Nominal Damages!',
    simplifiedDefinition:
      'Where dismissal is supported by a valid substantive cause (Just or Authorized) but the employer failed to comply with statutory procedural due process: the dismissal is UPHELD as valid (no reinstatement/backwages), and the employer is held liable for NOMINAL DAMAGES: ₱30,000 for Just Cause (Agabon v. NLRC) or ₱50,000 for Authorized Cause (Jaka Food Processing v. Pacot).',
    statutoryBasis: 'Agabon v. NLRC (G.R. No. 158693); Jaka Food Processing Corp. v. Pacot (G.R. No. 151378)',
    barExamTip:
      'Why is Jaka (₱50,000) higher than Agabon (₱30,000)? Because in Just Cause (Agabon), dismissal was triggered by the employee’s own fault/misconduct, whereas in Authorized Cause (Jaka), the employee committed zero fault!',
  },
  {
    id: 'reinstatement-backwages-strained-relations',
    term: 'Illegal Dismissal Twin Remedies & Strained Relations Doctrine',
    category: 'Tenure & Dismissal',
    aliases: ['full backwages', 'strained relations', 'payroll reinstatement', 'garcia v pal', 'bustamante doctrine'],
    marioPowerUp: '1-Up Full Revival Star',
    marioIcon: '1up',
    marioAnalogy:
      'Illegally dismissed Mario gets BOTH Reinstatement (immediately executory even on appeal!) AND Full Backwages without deducting outside side-quests! If the castle is too toxic (Strained Relations), Separation Pay (1 mo/yr) replaces Reinstatement!',
    simplifiedDefinition:
      'An illegally dismissed employee is entitled to: (1) Reinstatement without loss of seniority rights (immediately self-executory upon Labor Arbiter award via actual or payroll reinstatement — Garcia v. PAL; wages paid during payroll reinstatement are non-refundable even if reversed on appeal!), AND (2) Full Backwages from withholding up to actual reinstatement without deduction for earnings elsewhere (Bustamante v. NLRC). Under the Doctrine of Strained Relations, separation pay of 1 month per year of service is awarded in lieu of reinstatement.',
    statutoryBasis: 'Article 294 & Art. 229, Labor Code; Bustamante v. NLRC; Garcia v. PAL; Nacar v. Gallery Frames (6% legal interest)',
    barExamTip:
      'Wages received via Labor Arbiter payroll reinstatement are NEVER refundable even if the NLRC/CA/SC later reverses the illegal dismissal ruling, unless the employer was prevented from reinstating due to corporate rehabilitation (Garcia v. PAL)!',
  },
  {
    id: 'quitclaims-waivers',
    term: 'Quitclaims, Releases & Waivers (Periquet 4-Requisite Rule)',
    category: 'Tenure & Dismissal',
    aliases: ['quitclaim', 'release waiver quitclaim', 'periquet doctrine', 'unconscionable quitclaim'],
    marioPowerUp: 'Golden magnifying Lens',
    marioIcon: 'question_block',
    marioAnalogy:
      'Courts frown on cheap "Sign here for ₱5,000 and waive ₱500,000!" papers! A Quitclaim is valid ONLY if voluntary, with zero fraud, AND for a reasonable, credible consideration!',
    simplifiedDefinition:
      'Quitclaims are generally frowned upon as contrary to public policy, EXCEPT when the employer proves (Periquet / Goodrich rule): (1) voluntary execution with full understanding, (2) no fraud or deceit by employer, (3) credible and REASONABLE consideration (not grossly unconscionable), and (4) terms are not contrary to law, morals, or public policy. Even a valid quitclaim does NOT bar an illegal dismissal action unless clearly and fairly settled.',
    statutoryBasis: 'Periquet v. NLRC; Goodrich Manufacturing v. Ativo',
    barExamTip:
      '"Dire necessity" of a jobless worker negates voluntariness when the consideration is unconscionably low compared to the statutory entitlement—in which case the worker keeps the partial payout and recovers the balance!',
  },
  {
    id: 'management-prerogative-transfer',
    term: 'Management Prerogative & Valid Transfer of Employees',
    category: 'Tenure & Dismissal',
    aliases: ['management prerogative', 'transfer of employees', 'lateral transfer'],
    marioPowerUp: 'Peach Castle Strategy Map',
    marioIcon: 'pipe',
    marioAnalogy:
      'Princess Peach can reassign Mario from World 1 Castle to World 2 Castle at the same rank and pay for genuine Kingdom defense—as long as it is NOT a disguised punishment or demotion!',
    simplifiedDefinition:
      'Employers have the inherent prerogative to regulate all aspects of employment—including hiring, work assignments, lateral transfers, working methods, and discipline—provided exercised in GOOD FAITH for advancing business interests and NOT to defeat or circumvent employee rights under law or contract.',
    statutoryBasis: 'Rural Bank of Cantilan v. Julve; Philippine Japan Active Carbon v. NLRC',
    barExamTip:
      'A transfer is VALID if: (1) no demotion in rank, (2) no diminution in pay/benefits, and (3) not motivated by bad faith, discrimination, or punishment. Refusing a valid lateral transfer constitutes willful disobedience!',
  },
  {
    id: 'visitorial-enforcement-power',
    term: 'Visitorial and Enforcement Power of DOLE Secretary (Art. 128 — No ₱5,000 Cap!)',
    category: 'Tenure & Dismissal',
    aliases: ['visitorial power', 'article 128', 'article 129', '5000 cap', 'peoples broadcasting'],
    marioPowerUp: 'Inspector Lakitu All-Seeing Lens',
    marioIcon: 'star',
    marioAnalogy:
      'Under Art. 128, DOLE Inspectors can check ANY active employer’s payroll and order payment of ₱10,000,000+ in unpaid wages WITHOUT any ₱5,000 cap! The ₱5,000 cap only applies to Art. 129 summary claims!',
    simplifiedDefinition:
      'Under Art. 128(b), where an employer-employee relationship STILL EXISTS (or existed at inspection), the DOLE Secretary/Regional Director has visitorial and enforcement power to inspect records, determine labor standards violations (even choosing whether an ER-EE relationship exists per People’s Broadcasting / Bombo Radyo), and issue compliance/writs of execution REGARDLESS OF AMOUNT (no ₱5,000 limit!). Contrast Art. 129 (Regional Director adjudicatory recovery: no reinstatement claim + <=₱5,000 per employee).',
    statutoryBasis: 'Articles 128 & 129, Labor Code (as amended by R.A. 7730); People’s Broadcasting Service (Bombo Radyo) v. Sec. of Labor',
    barExamTip:
      'Classic Bar distinction: Art. 128 Inspection = NO monetary cap, ER-EE exists, appeal to DOLE Secretary. Art. 129 Adjudication = <=₱5,000 per worker, ER-EE severed without reinstatement claim, appeal to NLRC!',
  },
  {
    id: 'prescriptive-periods-labor',
    term: 'Prescriptive Periods: 3-Year Money Claims vs. 4-Year Illegal Dismissal',
    category: 'Tenure & Dismissal',
    aliases: ['prescriptive period', '3 years money claims', '4 years illegal dismissal', 'article 306'],
    marioPowerUp: 'Chrono Clock Star',
    marioIcon: 'question_block',
    marioAnalogy:
      'Memorize the 1-3-4-10 Kingdom Clocks: 1 Year for Unfair Labor Practice (ULP), 3 Years for Money Claims, 4 Years for Illegal Dismissal, and 10 Years for SSS remittance violations (20 yrs under R.A. 11199)!',
    simplifiedDefinition:
      'Key Labor Law prescriptive periods: (1) Unfair Labor Practice (ULP) = 1 year from accrual (Art. 305); (2) Pure Money Claims arising from employer-employee relations = 3 years from accrual (Art. 306); (3) Illegal Dismissal (injury to one’s rights under Art. 1146 Civil Code) = 4 years from dismissal (Callanta v. Carnation Phils.)—along with backwages incidental to illegal dismissal; (4) Non-remittance of SSS contributions = 20 years (R.A. 11199).',
    statutoryBasis: 'Articles 305–306, Labor Code; Article 1146, Civil Code; Callanta v. Carnation Phils.; Arriola v. Pilipino Star Ngayon',
    barExamTip:
      'Arriola v. Pilipino Star trap: An illegal dismissal complaint may be filed within 4 YEARS, and its prayer for backwages also enjoys 4 years—EXCEPT independent unpaid Labor Standards money claims (like old unpaid SIL/13th month prior to dismissal), which remain subject to the 3-year prescriptive period!',
  },

  // ==================== ADDITIONAL HIGH-YIELD DOCTRINES (58–88) ====================
  {
    id: 'travel-time-rules',
    term: 'Travel Time Compensability Rules (Home-to-Work vs. All in a Day’s Work)',
    category: 'Hours & Overtime',
    aliases: ['travel time', 'home to work travel', 'all in a days work'],
    marioPowerUp: 'Warp Cannon Commute',
    marioIcon: 'pipe',
    marioAnalogy:
      'Mario walking from his house to World 1-1 Pipe is ordinary commute (UNPAID). Once clocked in, riding a cart from World 1-1 to World 1-2 jobsite—or flying to Isle Delfino on special assignment—IS PAID!',
    simplifiedDefinition:
      '(1) Normal travel from home to work = non-compensable; (2) Travel that is "all in a day’s work" (from one jobsite to another during the workday, or after reporting to a central meeting point) = compensable; (3) Special one-day out-of-town assignment = travel time (minus regular home-to-work time and meal breaks) is compensable; (4) Overnight travel away from home = compensable when cutting across normal working hours (even on non-working days).',
    statutoryBasis: 'Article 84, Labor Code & U.S. FLSA / DOLE Persuasive Rules',
    barExamTip:
      'Company shuttle bus rides from home to plant are NOT compensable hours unless employees perform required work or mandatory safety briefings during transit.',
  },
  {
    id: 'semper-vigilans-labor-construction',
    term: 'Liberal Construction in Favor of Labor (In Dubio Pro Operario, Art. 4)',
    category: 'Tenure & Dismissal',
    aliases: ['in dubio pro operario', 'article 4 labor code', 'doubts resolved in favor of labor', 'equipoise rule'],
    marioPowerUp: 'Princess Peach Justice Star',
    marioIcon: 'star',
    marioAnalogy:
      'When the courtroom scales between Worker Toad and Boss Bowser are tied 50–50 (Equipoise!), Art. 4 tips the Star Scale in favor of Labor! If there is NO doubt and Toad clearly broke the rules, the law enforces management’s rights fairly.',
    simplifiedDefinition:
      'All doubts in the implementation and interpretation of the provisions of the Labor Code, its implementing rules, and ambiguities in employment contracts/evidence (Equipoise Rule) shall be resolved in favor of labor. However, where the law and facts are clear and free from doubt, courts cannot invent liability out of sympathy.',
    statutoryBasis: 'Article 4, Labor Code; Article 1702, Civil Code; Penaflor v. Outdoor Clothing',
    barExamTip:
      'Invoke the Equipoise Rule when employer and employee evidence on illegal dismissal are equally balanced: since the employer bears the burden of proof, tie goes to the employee!',
  },
  {
    id: 'emergency-rest-day-work',
    term: 'Compulsory / Emergency Rest Day Work (Art. 92)',
    category: 'Rest & Holidays',
    aliases: ['emergency rest day', 'compulsory rest day work', 'article 92'],
    marioPowerUp: 'Red Alert Castle Horn',
    marioIcon: 'bowser',
    marioAnalogy:
      'Peach cannot force Mario to work on his Sunday Rest Day—EXCEPT during calamities, urgent machinery breakdowns, abnormal pressure of work, perishable goods, or continuous-process plants!',
    simplifiedDefinition:
      'An employer may require work on any scheduled rest day (with +30% rest day premium) ONLY in cases of: actual/impending emergencies/calamities, urgent work on machinery/equipment, abnormal pressure of work due to special circumstances, preventing loss of perishable goods, continuous-operation nature of work, or analogous weather-dependent work.',
    statutoryBasis: 'Article 92, Labor Code',
    barExamTip:
      'Notice the subtle difference from Art. 89 (Emergency OT): Art. 92 includes "abnormal pressure of work" and "continuous operations" (e.g., 24/7 hospitals or power plants, since another rest day or +30% applies)!',
  },
  {
    id: 'unworked-holiday-business-closure',
    term: 'Holiday Pay During Temporary Shutdown vs. Permanent Closure',
    category: 'Rest & Holidays',
    aliases: ['holiday pay temporary shutdown', 'temporary cessation holiday pay'],
    marioPowerUp: 'Frozen Castle Calendar',
    marioIcon: 'coin',
    marioAnalogy:
      'If Bowser shuts the factory for 2 weeks of December inventory maintenance, Mario STILL gets paid for Christmas Day and Rizal Day! Only a full 6-month bona fide suspension or permanent closure stops Holiday Pay!',
    simplifiedDefinition:
      'In case of temporary or periodic shutdown and temporary cessation of work of an establishment (such as yearly inventory or repair of machinery), regular holidays falling within the period SHALL BE COMPENSATED in accordance with Art. 94.',
    statutoryBasis: 'Omnibus Rules Book III, Rule IV, Sec. 7(a)',
    barExamTip:
      'Exception: If cessation is due to business reverses AS AUTHORIZED BY THE SECRETARY OF LABOR, the employer may not be required to pay regular holidays during that authorized suspension.',
  },
  {
    id: 'commission-sales-workers-holiday',
    term: 'Commission Workers: Pure Commission vs. Basic Plus Commission',
    category: 'Rest & Holidays',
    aliases: ['pure commission', 'basic plus commission', 'commission 13th month'],
    marioPowerUp: 'Merchant Toad Gem Bag',
    marioIcon: 'coin',
    marioAnalogy:
      'Sales Toad paid PURELY on commission (field) is exempt from Holiday Pay; Sales Toad paid Fixed Basic Salary + Override Sales Commission gets 13th Month Pay on his Basic Salary (and on guaranteed wage-commissions)!',
    simplifiedDefinition:
      'Employees paid purely on commission (especially unsupervised field sales) are excluded from Holiday Pay and SIL, and exempt from PD 851 13th Month Pay ONLY if purely commission-based. Employees receiving a guaranteed basic wage PLUS commission are entitled to 13th Month Pay computed on basic salary (including direct sales commissions integral to basic pay, excluding productivity/profit-sharing bonuses).',
    statutoryBasis: 'Revised PD 851 Guidelines; Philippine Duplicators v. NLRC; Boie-Takeda Chemicals v. De la Serna',
    barExamTip:
      'Distinguish Philippine Duplicators (salesmen paid small fixed rate + per-unit direct sales commission -> INCLUDED in 13th month!) vs. Boie-Takeda (medical representatives’ productivity bonus on regional targets -> EXCLUDED!).',
  },
  {
    id: 'prohibition-kickbacks-art-116',
    term: 'Withholding of Wages & Kickbacks Prohibited (Arts. 116–118)',
    category: 'Wages & D.O. 174',
    aliases: ['kickback', 'withholding of wages', 'retaliatory dismissal', 'article 116', 'article 118'],
    marioPowerUp: 'Anti-Bandit Shy Guy Shield',
    marioIcon: 'bowser',
    marioAnalogy:
      'Supervisor Shy Guy demanding ₱500 "kickback" for hiring Toad—or Bowser withholding Mario’s final pay because Mario testified at DOLE—is an unlawful criminal labor offense!',
    simplifiedDefinition:
      'Art. 116 outlaws withholding wages or inducing workers to give up any part of their wages by force, stealth, intimidation, or threat. Art. 117 outlaws deductions as consideration for hiring/retention ("kickbacks"). Art. 118 makes it unlawful to refuse to pay, reduce wages, or discharge/discriminate against any employee who has filed a complaint or testified (or is about to testify) in wage proceedings.',
    statutoryBasis: 'Articles 116, 117 & 118, Labor Code; SHS Perforated Materials v. Diaz',
    barExamTip:
      'Remember: Under Art. 118, retaliatory dismissal for testifying in a Wage/Book III case is unlawful; compare with Art. 259(f), where retaliatory dismissal for testifying under ANY Labor Code proceeding is an Unfair Labor Practice (ULP)!',
  },
  {
    id: 'clearance-final-pay-30-days',
    term: 'Final Pay & Certificate of Employment Rule (30 Days / 3 Days)',
    category: 'Wages & D.O. 174',
    aliases: ['final pay', 'last pay', 'certificate of employment', 'labor advisory 06-20', 'milan v nlrc'],
    marioPowerUp: 'Stage Clear Exit Scroll',
    marioIcon: 'coin',
    marioAnalogy:
      'When Mario leaves the castle, his Certificate of Employment (COE) must be issued within 3 DAYS, and his Final Pay within 30 DAYS—though Peach can hold clearance only until Mario returns the Castle Kart he borrowed!',
    simplifiedDefinition:
      'Under DOLE Labor Advisory No. 06-20: (1) Final Pay (unpaid wages, pro-rated 13th month, cash conversion of unused SIL, separation/retirement pay) must be released within thirty (30) days from separation unless a more favorable policy exists; (2) Certificate of Employment (COE) must be issued within three (3) days from request! Under Milan v. NLRC, employers may validly require clearance and withhold release/set off unreturned company property of determinate value.',
    statutoryBasis: 'DOLE Labor Advisory No. 06-20; Milan v. NLRC (G.R. No. 202961)',
    barExamTip:
      'Memorize "30 days for Final Pay, 3 days for COE" (LA 06-20) + "Clearance valid for unreturned company property" (Milan v. NLRC)!',
  },
  {
    id: 'two-tiered-wage-system',
    term: 'Two-Tiered Wage System (Mandatory Floor + Productivity Incentive)',
    category: 'Wages & D.O. 174',
    aliases: ['two-tiered wage', 'tier 1 floor wage', 'tier 2 productivity'],
    marioPowerUp: 'Double-Deck Coin Platform',
    marioIcon: 'coin',
    marioAnalogy:
      'Tier 1 is the rock-solid RTWPB Minimum Wage Floor nobody can fall below; Tier 2 is an advisory productivity bonus shared when the Toad crew beats castle targets!',
    simplifiedDefinition:
      'Philippine minimum wage reform structure consisting of: Tier 1 — Mandatory Regional Floor Wage set by RTWPBs to protect vulnerable workers above poverty thresholds; and Tier 2 — Voluntary Productivity-Based Pay implemented through labor-management committees guided by RTWPB advisories.',
    statutoryBasis: 'NWPC Guidelines No. 02, Series of 2012 & R.A. 6727 (Wage Rationalization Act)',
    barExamTip:
      'Tier 1 is MANDATORY and enforceable via Art. 128/double indemnity (R.A. 8188); Tier 2 is ADVISORY and negotiated at the enterprise level.',
  },
  {
    id: 'double-indemnity-ra-8188',
    term: 'Double Indemnity Penalty for Unpaid Wage Increases (R.A. 8188)',
    category: 'Wages & D.O. 174',
    aliases: ['double indemnity', 'ra 8188', 'prescribed wage increase'],
    marioPowerUp: '2x Penalty Hammer',
    marioIcon: 'bowser',
    marioAnalogy:
      'If Bowser refuses to pay the new RTWPB Wage Order increase, DOLE hits him with DOUBLE INDEMNITY—paying Mario TWICE the unpaid prescribed wage hike!',
    simplifiedDefinition:
      'Any person or corporation that refuses or fails to pay any of the prescribed increases or adjustments in the wage rates made in accordance with R.A. 6727 shall be punished by fine/imprisonment AND ordered to pay an amount equivalent to DOUBLE the unpaid benefits owing to the employees.',
    statutoryBasis: 'Republic Act No. 8188 (amending Sec. 12 of R.A. 6727)',
    barExamTip:
      'Payment of double indemnity does NOT absolve the employer from criminal liability under R.A. 8188, and applies specifically to unpaid RTWPB prescribed wage increases/adjustments!',
  },
  {
    id: 'equal-pay-equal-value',
    term: 'Equal Remuneration for Work of Equal Value (Art. 133 & International School Alliance)',
    category: 'Wages & D.O. 174',
    aliases: ['equal pay for equal work', 'work of equal value', 'international school alliance'],
    marioPowerUp: 'Twin Mirror Star',
    marioIcon: 'star',
    marioAnalogy:
      'Paying "Foreign-Hire" Koopas higher salaries than "Local-Hire" Toads doing the EXACT same teaching work side-by-side in the same school is unconstitutional wage discrimination!',
    simplifiedDefinition:
      'Persons who work with substantially equal qualifications, skill, effort, and responsibility, under similar conditions, should be paid similar salaries. Prohibits both gender wage discrimination (Art. 133 Labor Code) and nationality/local-vs-foreign-hire discrimination without valid distinction.',
    statutoryBasis: 'Article 133 (formerly Art. 135), Labor Code; International School Alliance of Educators v. Quisumbing',
    barExamTip:
      'Always cite International School Alliance of Educators v. Quisumbing when an employer pays local-hires less than foreign-hires performing identical duties in the Philippines!',
  },
  {
    id: 'industrial-homeworkers',
    term: 'Industrial Homeworkers (Arts. 151–153)',
    category: 'Special & Protective',
    aliases: ['industrial homeworker', 'industrial homeworkers', 'homework'],
    marioPowerUp: 'Cottage Craft Loom',
    marioIcon: 'mushroom',
    marioAnalogy:
      'Toadette weaves royal tapestries inside her own home using yarn delivered by Bowser’s distributor—the distributor/principal is her EMPLOYER and must remit SSS, PhilHealth, and Pag-IBIG immediately upon paying her!',
    simplifiedDefinition:
      'Workers who process or fabricate goods in or about a home from materials furnished by an employer/distributor to be returned after processing. The "employer" of homeworkers includes any person/principal who delivers goods to be processed at home and thereafter re-delivered or sold under their direction.',
    statutoryBasis: 'Articles 151–153, Labor Code & DOLE D.O. No. 5-92',
    barExamTip:
      'Prohibited homework: explosives, fireworks, drugs, poisons, and hazardous articles harmful to life and health.',
  },
  {
    id: 'academic-personnel-probation',
    term: 'Private School Teachers Probationary Rules (3-Year / 6-Semester Rule)',
    category: 'Special & Protective',
    aliases: ['probationary teacher', 'private school teacher', '3 consecutive years', '6 semesters'],
    marioPowerUp: 'Professor E. Gadd Diploma',
    marioIcon: 'question_block',
    marioAnalogy:
      'Teaching at Mushroom University takes FOUR concurrent keys to unlock Permanency: Full-Time + 3 Consecutive Years (or 6 Semesters in college) + Satisfactory Rating + Required DepEd/CHED Credentials (like Master’s degree or LET)!',
    simplifiedDefinition:
      'Academic personnel in private schools are governed by DepEd/CHED Manuals rather than the 6-month Art. 296 cap: maximum probation is 3 consecutive years (elementary/secondary), 6 consecutive regular semesters (tertiary), or 9 consecutive trimesters. Permanency requires: (1) full-time teacher, (2) completed probationary period, (3) satisfactory service, AND (4) possession of minimum DepEd/CHED academic qualifications (e.g., Master’s degree for college faculty; LET for basic ed).',
    statutoryBasis: 'Lacuesta v. Ateneo de Manila; Mercado v. AMA Computer College; University of the East v. Pepanio',
    barExamTip:
      'Part-time teachers NEVER acquire permanent status even after 10+ years, and a college instructor without a CHED-mandated Master’s degree cannot become permanent even after 6 semesters!',
  },
  {
    id: 'kasambahay-unjust-termination',
    term: 'Kasambahay Termination & 15-Day Unjust Dismissal Indemnity (R.A. 10361)',
    category: 'Special & Protective',
    aliases: ['kasambahay dismissal', '15 days indemnity', 'kasambahay notice'],
    marioPowerUp: '15-Coin Indemnity Purse',
    marioIcon: 'coin',
    marioAnalogy:
      'Unlike corporate illegal dismissal (reinstatement + full backwages), if a household unjustly fires a Kasambahay before the contract ends, the remedy is earned wages PLUS 15 DAYS’ WAGE indemnity!',
    simplifiedDefinition:
      'If a Kasambahay is unjustly dismissed prior to contract expiration, the domestic worker shall be paid the compensation already earned PLUS the equivalent of fifteen (15) days’ work by way of indemnity (not reinstatement to a private home!). If no duration is fixed, either party may give 5 days’ notice before termination.',
    statutoryBasis: 'Republic Act No. 10361, Sec. 32',
    barExamTip:
      'Memorize the unique Kasambahay numbers: 15-day wage indemnity for unjust pre-termination, 5-day notice when contract has no fixed term, and forfeiture of max 15 days’ unpaid salary if the Kasambahay leaves without justifiable reason!',
  },
  {
    id: 'kasambahay-debt-bondage',
    term: 'Kasambahay Protection Against Debt Bondage & Agency Fees',
    category: 'Special & Protective',
    aliases: ['debt bondage', 'kasambahay deployment expenses', 'finder fee'],
    marioPowerUp: 'Broken Chain Star',
    marioIcon: 'star',
    marioAnalogy:
      'Recruitment and travel costs to bring Yaya Toadette to the household belong 100% to the EMPLOYER—charging her recruitment fees or trapping her in debt bondage is strictly illegal!',
    simplifiedDefinition:
      'Under R.A. 10361: (1) All deployment expenses and private employment agency fees are shouldered by the EMPLOYER and can never be charged or deducted from the Kasambahay’s wages (recoverable by employer ONLY if the worker unreasonably leaves within 6 months); (2) Bonding a Kasambahay for loss/damage or holding them in debt bondage is outlawed; (3) Cash advances deductions cannot exceed 20% of monthly wage.',
    statutoryBasis: 'Republic Act No. 10361, Secs. 13–15 & 28',
    barExamTip:
      'Minimum employable age for a Kasambahay is strictly FIFTEEN (15) years old!',
  },
  {
    id: 'mental-health-hiv-tb-hep-policies',
    term: 'Mandatory Non-Discrimination Health Policies (HIV, TB, Hepatitis B & Mental Health)',
    category: 'Special & Protective',
    aliases: ['hiv workplace policy', 'ra 11166', 'ra 11036', 'hepatitis b policy', 'tuberculosis workplace'],
    marioPowerUp: 'Four-Element Healing Heart',
    marioIcon: '1up',
    marioAnalogy:
      'Mandatory HIV screening for job applicants is ILLEGAL, and workers with HIV, TB, Hepatitis B, or Mental Health conditions enjoy confidentiality, reasonable accommodation, and protection against stigma!',
    simplifiedDefinition:
      'Philippine workplaces must implement DOLE-compliant non-discriminatory programs for: (1) HIV & AIDS (R.A. 11166 — compulsory HIV testing as pre-employment condition is unlawful; HIV status is not a ground for dismissal), (2) Mental Health (R.A. 11036), (3) Tuberculosis (DOLE D.O. 73-05), and (4) Hepatitis B (DOLE Advisory 05-10).',
    statutoryBasis: 'R.A. 11166, R.A. 11036, DOLE D.O. 73-05 & Advisory 05-10',
    barExamTip:
      'Requiring an OFW or local job applicant to undergo mandatory HIV testing as a condition for hiring violates R.A. 11166!',
  },
  {
    id: 'floating-status-recall-notice',
    term: 'Security Guard Off-Detail vs. Resignation & Recall',
    category: 'Tenure & Dismissal',
    aliases: ['off-detail', 'security guard floating status', 'specific assignment recall'],
    marioPowerUp: 'Guard Tower Signal Flare',
    marioIcon: 'pipe',
    marioAnalogy:
      'To stop the 6-month Floating Clock, the Security Agency must send Toad a SPECIFIC client post order—a vague "Come visit our office to apply again" letter does NOT count as valid recall!',
    simplifiedDefinition:
      'For a recall from off-detail/floating status within the 6-month Art. 301 window to be valid and negate constructive dismissal, the agency must issue a definite, specific order assigning the guard to a concrete client post—not a mere general invitation to report to headquarters and wait.',
    statutoryBasis: 'Ibon v. Genghis Khan Security Services (G.R. No. 221085); Padilla v. Airborne Security',
    barExamTip:
      'Cite Ibon v. Genghis Khan Security: a general return-to-headquarters notice without a specific client post deployment order does NOT toll the 6-month Art. 301 period!',
  },
  {
    id: 'crime-against-employer-just-cause',
    term: 'Commission of a Crime or Offense Against Employer / Family (Art. 297[d])',
    category: 'Tenure & Dismissal',
    aliases: ['crime against employer', 'immediate family', 'article 297d'],
    marioPowerUp: 'Royal Guard Arrest Warrant',
    marioIcon: 'bowser',
    marioAnalogy:
      'If Koopa assaults Peach, Peach’s parent/spouse/child, or her authorized Castle Manager, Bowser doesn’t need to wait for a criminal court conviction beyond reasonable doubt—substantial evidence in the admin hearing is enough to dismiss!',
    simplifiedDefinition:
      'Commission of a crime or offense by the employee against the person of their employer, any immediate member of the employer’s family (spouse, ascendants, descendants, legitimate/natural/adopted brothers or sisters), or their duly authorized representative. Prior criminal conviction or prosecutor filing is NOT required—substantial evidence suffices.',
    statutoryBasis: 'Article 297(d), Labor Code; Starlite Plastic Industrial Corp. v. NLRC',
    barExamTip:
      'Acquittal in a criminal case based on reasonable doubt does NOT automatically invalidate dismissal for just cause, which requires only SUBSTANTIAL EVIDENCE!',
  },
  {
    id: 'analogous-causes-dismissal',
    term: 'Analogous Causes for Dismissal (Art. 297[e] — Express Company Rule Rule)',
    category: 'Tenure & Dismissal',
    aliases: ['analogous causes', 'gross inefficiency', 'attitude problem'],
    marioPowerUp: 'Castle Rulebook Codex',
    marioIcon: 'bowser',
    marioAnalogy:
      'Under DOLE D.O. 147-15, an act is an "Analogous Cause" ONLY IF it comes from the employee’s own voluntary fault AND is written in the Castle Code of Conduct (unless it’s Gross Inefficiency, which is analogous to Gross Neglect)!',
    simplifiedDefinition:
      'Other causes analogous to Arts. 297(a)–(d) susceptible to the employee’s own voluntary/willful act or omission. Under DOLE D.O. 147-15, no act or omission shall be considered an analogous cause unless EXPRESSLY SPECIFIED in company rules and regulations or policies (Note: Gross Inefficiency is jurisprudentially treated as analogous to Gross & Habitual Neglect — Lim v. NLRC).',
    statutoryBasis: 'Article 297(e), Labor Code; DOLE D.O. No. 147-15; Lim v. NLRC; Heavylift Manila v. CA',
    barExamTip:
      'In Heavylift Manila v. CA, "attitude problem" can be an analogous cause ONLY if proven by concrete overt acts disrupting team operations AND after fair warning/due process—never mere subjective dislike!',
  },
  {
    id: 'union-security-clause-dismissal',
    term: 'Union Security Clause Enforcement (Closed / Union Shop Dismissal)',
    category: 'Tenure & Dismissal',
    aliases: ['union security clause', 'closed shop', 'union shop', 'religious objectors'],
    marioPowerUp: 'Guild Emblem Banner',
    marioIcon: 'fire_flower',
    marioAnalogy:
      'Even when the Union expels Toad under a CBA Union Shop clause and demands his firing, Peach MUST STILL conduct her own independent hearing before dismissing him—and religious objectors (like Iglesia ni Cristo) are exempt!',
    simplifiedDefinition:
      'Stipulation in a CBA requiring membership in the sole and exclusive bargaining agent as a condition for continued employment. Validly enforceable by dismissal ONLY IF: (1) Union security clause is unequivocal, (2) Union requests enforcement, AND (3) Employer conducts an INDEPENDENT administrative investigation verifying sufficient evidence of disloyalty/expulsion. Exempt: (a) Religious objectors (Victoriano v. Elizalde Rope), and (b) Employees already members of another union when the CBA took effect!',
    statutoryBasis: 'Article 259(e), Labor Code; Alabang Country Club v. NLRC;Inguillo v. First Philippine Scales',
    barExamTip:
      'Employer CANNOT blindly rubber-stamp the union’s demand to fire an expelled member: skipping the employer’s independent due-process inquiry renders the employer liable!',
  },
  {
    id: 'resignation-30-day-notice',
    term: 'Voluntary Resignation (With vs. Without 30-Day Written Notice, Art. 300)',
    category: 'Tenure & Dismissal',
    aliases: ['voluntary resignation', 'resignation 30 days', 'immediate resignation', 'article 300'],
    marioPowerUp: 'Honorable Farewell Feather',
    marioIcon: 'mushroom',
    marioAnalogy:
      'Mario gives Peach 30 days’ written notice so she can train a replacement—UNLESS Bowser insulted Mario’s honor or hurt him, in which case Mario can resign IMMEDIATELY on the spot!',
    simplifiedDefinition:
      'An employee may terminate employment WITHOUT just cause by serving a written notice on the employer at least one (1) month (30 days) in advance (failure to serve notice exposes employee to damages). An employee may resign IMMEDIATELY WITHOUT notice for just causes: (1) serious insult by employer/representative on honor and person, (2) inhuman and unbearable treatment, (3) commission of a crime/offense against employee or immediate family, or (4) analogous causes.',
    statutoryBasis: 'Article 300 (formerly Art. 285), Labor Code; Hechanova Bugay Vilchez Lawyers v. Matorre',
    barExamTip:
      'The 30-day notice is for the EMPLOYER’S benefit—so the employer may validly waive or shorten the 30-day waiting period and accept resignation earlier without committing illegal dismissal!',
  },
  {
    id: 'withdrawal-of-resignation',
    term: 'Withdrawal / Retraction of Resignation Rule',
    category: 'Tenure & Dismissal',
    aliases: ['withdrawal of resignation', 'retraction of resignation'],
    marioPowerUp: 'Rewind Stopwatch',
    marioIcon: 'question_block',
    marioAnalogy:
      'Once Princess Peach formally accepts Mario’s resignation letter, Mario cannot unilaterally hit "Undo" unless Peach agrees to take him back!',
    simplifiedDefinition:
      'A resignation is revocable by the employee BEFORE it is accepted by the employer. Once a voluntary resignation has been validly accepted by the employer, the employee can no longer unilaterally withdraw or retract it without the employer’s consent.',
    statutoryBasis: 'Intertrod Maritime, Inc. v. NLRC; BMG Records v. Aparecio',
    barExamTip:
      'Check the timeline carefully in Bar questions: Retracted BEFORE employer acceptance = employee stays employed; Retracted AFTER employer acceptance = employer’s refusal to re-admit is NOT illegal dismissal!',
  },
  {
    id: 'merger-consolidation-sale-assets',
    term: 'Corporate Merger vs. Asset Sale Impact on Employees (Bank of P.I. vs. Sundowner)',
    category: 'Tenure & Dismissal',
    aliases: ['corporate merger', 'absorption of employees', 'asset sale', 'bpi v bpi employees', 'sundowner doctrine'],
    marioPowerUp: 'Fused Double-Castle Crown',
    marioIcon: 'star',
    marioAnalogy:
      'In a statutory MERGER of Peach Castle + Daisy Castle, the surviving castle AUTOMATICALLY absorbs all knights! In a good-faith ASSET SALE (just buying karts), the buyer does NOT have to absorb the seller’s drivers!',
    simplifiedDefinition:
      '(1) Statutory Merger or Consolidation (Sec. 79 Revised Corporation Code): the surviving corporation AUTOMATICALLY absorbs the employees of the absorbed corporation with continuity of tenure (BPI v. BPI Employees Union). (2) Bona Fide Sale of Assets (in rem): the buyer in good faith has NO legal obligation to absorb the seller’s employees, unless expressly assumed or the sale was simulated in bad faith to bust a union/evade liabilities (Sundowner Development Corp. v. Drilon).',
    statutoryBasis: 'BPI v. BPI Employees Union-Davao (G.R. No. 164301); Sundowner Dev. Corp. v. Drilon',
    barExamTip:
      'Distinguish 3 transactions: Stock Sale (same corporate employer continues -> employees unaffected), Statutory Merger (surviving corp absorbs employees -> BPI rule), Bona Fide Asset Sale (no obligation to absorb -> Sundowner rule)!',
  },
  {
    id: 'nepotism-spouse-co-employment',
    term: 'Exogamy / Anti-Nepotism Workplace Policy',
    category: 'Special & Protective',
    aliases: ['exogamy policy', 'no-spouse rule', 'anti-nepotism'],
    marioPowerUp: 'Twin-Castle Transfer Portal',
    marioIcon: 'pipe',
    marioAnalogy:
      'If two bank vault auditors marry each other and create an internal audit conflict of interest, transferring one spouse to another branch (rather than automatic firing without proving BFOQ) balances marriage rights and business safety!',
    simplifiedDefinition:
      'Company rules restricting spouses or close relatives from working in the same department/company are invalid under Art. 134 unless the employer proves a genuine BFOQ / reasonable business necessity (such as conflict of interest in auditing or competitor trade secrets) AND demonstrates there is no less-drastic alternative like departmental transfer.',
    statutoryBasis: 'PT&T v. NLRC; Star Paper v. Simbol; Duncan v. Glaxo',
    barExamTip:
      'Always start your Bar answer with the constitutional protection of marriage + Art. 134 Labor Code, then apply the 2-prong BFOQ / Reasonable Business Necessity test!',
  },
  {
    id: 'social-justice-separation-pay',
    term: 'Equitable / Financial Assistance Separation Pay (PLDT Doctrine)',
    category: 'Tenure & Dismissal',
    aliases: ['financial assistance', 'pldt doctrine', 'toyota doctrine', 'compassionate justice'],
    marioPowerUp: 'Mercy Mushroom Pouch',
    marioIcon: '1up',
    marioAnalogy:
      'Can a validly fired worker ever get compassionate separation pay? NEVER if fired for Serious Misconduct or Moral Turpitude (theft, fraud)! Only when dismissed for a non-serious, non-dishonest cause after long faithful service!',
    simplifiedDefinition:
      'General Rule: An employee validly dismissed for a Just Cause under Art. 297 is NOT entitled to separation pay. Equitable Exception (PLDT v. NLRC / Toyota Motor Phils. v. Toyota Workers Assoc.): Courts may grant financial assistance only when the dismissal is for a cause OTHER THAN serious misconduct OR offenses reflecting on the employee’s moral character (dishonesty/theft/fraud).',
    statutoryBasis: 'PLDT v. NLRC (G.R. No. L-80609); Toyota Motor Phils. Corp. Workers Assoc. v. NLRC',
    barExamTip:
      'Automatic disqualifiers for compassionate financial assistance: (1) Serious Misconduct, or (2) Moral Turpitude / Dishonesty / Fraud—even if the worker served 25+ years!',
  },
  {
    id: 'single-entry-approach-sena',
    term: 'Single Entry Approach (SEnA — 30-Day Mandatory Conciliation, R.A. 10396)',
    category: 'Tenure & Dismissal',
    aliases: ['sena', 'single entry approach', 'ra 10396', '30-day conciliation'],
    marioPowerUp: 'Peace Pipe Roundtable',
    marioIcon: 'pipe',
    marioAnalogy:
      'Before battling in the NLRC Courtroom, Toad and Bowser sit with a SEnA Desk Officer for up to 30 calendar days to see if they can settle fast and amicably without lawyers’ red tape!',
    simplifiedDefinition:
      'Prescribes a mandatory 30-calendar-day conciliation-mediation process through Single Entry Assistance Desks (SEAD) for all labor and employment disputes before they mature into formal compulsory arbitration/docketed cases (except notices of strike/lockout, preventive mediation, and CBA interpretation grievances).',
    statutoryBasis: 'Republic Act No. 10396 & DOLE D.O. No. 151-16',
    barExamTip:
      'Filing a Request for Assistance (RFA) under SEnA interrupts/tolls the running of prescriptive periods while conciliation is pending!',
  },
  {
    id: 'appeal-bond-nlrc-art-229',
    term: 'Employer Monetary Appeal Bond & McBurnie 10% Motion Rule (Art. 229)',
    category: 'Tenure & Dismissal',
    aliases: ['appeal bond', 'mcburnie rule', '10% provisional bond', 'article 229'],
    marioPowerUp: 'Golden Escrow Chest',
    marioIcon: 'coin',
    marioAnalogy:
      'If Bowser loses ₱1,000,000 at the Labor Arbiter and wants to appeal to the NLRC within 10 calendar days, he MUST post a Cash or Surety Bond—or file a meritorious Motion to Reduce Bond WITH at least 10% cash/surety attached!',
    simplifiedDefinition:
      'An appeal by an employer from a Labor Arbiter decision involving a monetary award may be perfected ONLY upon posting a cash or surety bond equivalent to the monetary award (excluding damages and attorney’s fees) within the 10-calendar-day reglementary period. Under McBurnie v. Ganzon, a motion to reduce bond stops the period ONLY IF grounded on meritorious grounds AND accompanied by a reasonable provisional bond of at least 10% of the monetary award.',
    statutoryBasis: 'Article 229 (formerly Art. 223), Labor Code; McBurnie v. Ganzon (G.R. Nos. 178034 & 178117)',
    barExamTip:
      'Three precision rules on Art. 229 Appeal: (1) 10 calendar days (no extension!), (2) Bond excludes moral/exemplary damages & attorney’s fees, and (3) McBurnie requires meritorious ground + >=10% provisional bond!',
  },
  {
    id: 'corporate-officers-intra-corporate',
    term: 'Corporate Officers vs. Employees (RTC vs. Labor Arbiter Jurisdiction)',
    category: 'Tenure & Dismissal',
    aliases: ['corporate officer', 'intra-corporate controversy', 'matling doctrine', 'by-laws officer'],
    marioPowerUp: 'Royal Charter Throne',
    marioIcon: 'star',
    marioAnalogy:
      'Just calling Luigi "Vice President for Plumbing" doesn’t make him a Corporate Officer! Unless his office is explicitly created in the Corporation Code OR Corporate By-Laws AND elected by the Board, he is an EMPLOYEE who sues at the Labor Arbiter!',
    simplifiedDefinition:
      'For dismissal to be an intra-corporate dispute under Regional Trial Court (Special Commercial Court) jurisdiction rather than the Labor Arbiter, TWO Matling requisites must concur: (1) the position is expressly created by the Revised Corporation Code (President, Treasurer, Corporate Secretary, Compliance Officer) OR expressly listed as a corporate office in the Corporate By-Laws, AND (2) the officer was elected/appointed by the Board of Directors or stockholders.',
    statutoryBasis: 'Matling Industrial & Commercial Corp. v. Coros (G.R. No. 157802); Marc II Marketing v. Joson',
    barExamTip:
      'A By-Laws clause merely authorizing the Board or President to "create other offices as may be necessary" does NOT convert those board-created VP posts into statutory corporate offices—their dismissal belongs to the LABOR ARBITER (Matling doctrine)!',
  },
  {
    id: 'overseas-filipino-workers-serrano-sameer',
    term: 'OFW Unexpired Portion Backwages & Solidary Agency Liability (R.A. 10022)',
    category: 'Special & Protective',
    aliases: ['ofw illegal dismissal', 'serrano v gallant', 'sameer overseas', 'unexpired portion', 'ra 10022'],
    marioPowerUp: 'Global Warp Star Passport',
    marioIcon: 'star',
    marioAnalogy:
      'If OFW Mario on a 2-year abroad contract is illegally fired on Month 2, he recovers the ENTIRE 22-month unexpired portion (the old "3-month cap" was struck down TWICE as unconstitutional!)—and his Philippine recruitment agency + corporate directors are SOLIDARILY liable!',
    simplifiedDefinition:
      'Illegally dismissed Overseas Filipino Workers (fixed-term) are entitled to full salaries for the ENTIRE UNEXPIRED PORTION of their employment contract (the "or for 3 months for every year, whichever is less" cap was declared unconstitutional in Serrano v. Gallant Maritime and again in Sameer Overseas Placement v. Cabiles), plus full reimbursement of placement fees with 12% interest per annum! Local recruitment agencies and their corporate officers/directors are solidarily liable with the foreign principal.',
    statutoryBasis: 'R.A. 8042 as amended by R.A. 10022, Sec. 10; Serrano v. Gallant Maritime; Sameer Overseas Placement Agency v. Cabiles',
    barExamTip:
      'Note the unique statutory exception to Nacar’s 6% interest: in Sameer Overseas v. Cabiles, the 12% p.a. interest on OFW placement fee reimbursement stays at 12% because it is fixed by explicit statute (R.A. 8042/10022), while unexpired salary awards earn 6% p.a.!',
  },
  {
    id: 'paternity-maternity-miscarriage-distinction',
    term: 'Miscarriage & Emergency Termination of Pregnancy (60 Days + 7 Days)',
    category: 'Leaves & Retirement',
    aliases: ['miscarriage leave', 'emergency termination of pregnancy', '60 days maternity'],
    marioPowerUp: 'Gentle Recovery Heart',
    marioIcon: '1up',
    marioAnalogy:
      'In the heartbreaking event of miscarriage or emergency termination of pregnancy, Peach receives 60 paid days under R.A. 11210—and married cohabiting Mario also qualifies for his 7-day R.A. 8187 Paternity Leave (if within the first 4 deliveries/miscarriages)!',
    simplifiedDefinition:
      'Under R.A. 11210, female workers receive 60 calendar days of paid maternity leave for miscarriage or emergency termination of pregnancy (Note: the 7-day allocation to the father under R.A. 11210 applies ONLY to live childbirth, NOT miscarriage—however, a married cohabiting husband independently qualifies for 7-day Paternity Leave under R.A. 8187 for miscarriage within the first 4 deliveries!).',
    statutoryBasis: 'R.A. 11210, Secs. 3 & 6; R.A. 8187, Sec. 3',
    barExamTip:
      'High-yield subtle Bar distinction: In miscarriage, the mother CANNOT transfer 7 days of her 60-day maternity leave (transfer applies only to live childbirth), so an UNMARRIED father gets 0 days, whereas a MARRIED cohabiting father gets his own 7 days under R.A. 8187!',
  },
  {
    id: 'tax-exemption-minimum-wage-earners',
    term: 'Minimum Wage Earner (MWE) Income Tax Exemption (R.A. 9504 / TRAIN Law)',
    category: 'Wages & D.O. 174',
    aliases: ['minimum wage earner', 'mwe tax exemption', 'ra 9504', 'soriano v secretary of finance'],
    marioPowerUp: 'Tax-Free Golden Shield',
    marioIcon: 'coin',
    marioAnalogy:
      'Minimum Wage Toad keeps 100% of his basic wage, Holiday Pay, Overtime Pay, Night Shift Differential, and Hazard Pay—ZERO withholding tax!',
    simplifiedDefinition:
      'Statutory Minimum Wage Earners (MWEs) in the private/public sector are exempt from paying income tax on their statutory minimum wage as well as on their holiday pay, overtime pay, night shift differential pay, and hazard pay.',
    statutoryBasis: 'NIRC Sec. 22(HH) & Sec. 24(A)(2), as amended by R.A. 9504 & R.A. 10963; Soriano v. Secretary of Finance',
    barExamTip:
      'Under Soriano v. Secretary of Finance, earning modest commissions/bonuses within the ₱90,000 tax-exempt 13th month & other benefits ceiling does NOT forfeit MWE tax-exempt status on basic minimum wage, OT, NSD, holiday, and hazard pay!',
  },
  {
    id: 'burden-of-proof-payment-vs-dismissal',
    term: 'Burden of Proof Matrix: Payment of Benefits vs. Overtime Claim',
    category: 'Wages & D.O. 174',
    aliases: ['burden of proof', 'proof of payment', 'minsberg', 'saberola'],
    marioPowerUp: 'Courtroom Evidence Ledger',
    marioIcon: 'question_block',
    marioAnalogy:
      'Routine benefits (Salary, SIL, 13th Month, Holiday Pay)? EMPLOYER must prove payment via payroll! Extraordinary claims (Overtime, Worked Rest Day, Damages)? EMPLOYEE must first prove they actually rendered the extra hours!',
    simplifiedDefinition:
      'Jurisprudential division of evidentiary burden in money claims: (1) Routine statutory benefits accruing in the normal course of employment (unpaid wages, 13th month pay, SIL, regular holiday pay) -> Burden is on the EMPLOYER to prove payment because payrolls/vouchers are in its custody; (2) Extraordinary/contingent claims (overtime pay, premium pay for worked rest/special days, moral/exemplary damages) -> Burden is on the EMPLOYEE to first prove entitlement/actual work rendered.',
    statutoryBasis: 'Minsberg v. NLRC; Loon v. Power Master, Inc. (G.R. No. 189404); Lagatic v. NLRC',
    barExamTip:
      'Cite Loon v. Power Master, Inc. in every money-claims Bar question—examiners love testing who bears the burden of proof for SIL/13th Month (Employer!) vs. Overtime (Employee!)!',
  },
  {
    id: 'floating-talent-independent-contractor-sonza-fuji',
    term: 'Independent Contractor Talent vs. Regular Media Employee (Sonza vs. Begino / Fuji)',
    category: 'Hours & Overtime',
    aliases: ['sonza v abs-cbn', 'fuji television v espiritu', 'begino v abs-cbn', 'talent contract'],
    marioPowerUp: 'Superstar Spotlight vs. Crew Mic',
    marioIcon: 'star',
    marioAnalogy:
      'Celebrity Jay Sonza negotiated a giant ₱317,000/mo unique talent deal on his own star power (Independent Contractor!). Cameramen and news producers using network gear under daily producer scripts (Begino / Fuji) are REGULAR EMPLOYEES!',
    simplifiedDefinition:
      'Distinguishes true independent contractors/celebrities hired for unique skills, high bargaining power, and freedom over manner of performance (Sonza v. ABS-CBN) from ordinary reporters, cameramen, and producers performing necessary, desirable, network-controlled work under "talent" labels (Fuji Television v. Espiritu; Begino v. ABS-CBN; Dumpit-Murillo v. CA), who are REGULAR employees.',
    statutoryBasis: 'Sonza v. ABS-CBN; Fuji Television Network v. Espiritu; Begino v. ABS-CBN',
    barExamTip:
      'Sonza is the narrow celebrity exception; for rank-and-file media crew, writers, and correspondents under exclusivity and editorial control, apply Fuji and Begino -> Regular Employees!',
  },
  {
    id: 'non-compete-post-employment-rivera',
    term: 'Post-Employment Non-Compete Clause Validity (Reasonable Restraint Test)',
    category: 'Tenure & Dismissal',
    aliases: ['non-compete clause', 'restraint of trade', 'rivera v solidbank', 'tio v platinum'],
    marioPowerUp: '1-Year Kingdom Border Fence',
    marioIcon: 'pipe',
    marioAnalogy:
      'Peach cannot ban ex-chemist Toad from working "anywhere in the universe forever!" A Non-Compete is valid ONLY if reasonably limited in TIME, PLACE, and TRADE!',
    simplifiedDefinition:
      'Post-employment non-compete stipulations are valid (not an unreasonable restraint of trade) ONLY when reasonable limitations exist as to: (1) TIME (e.g., 1 to 2 years), (2) TRADE/ACTIVITY (direct competing line of business), and (3) PLACE/TERRITORY, proportionate to protecting legitimate employer trade secrets or client goodwill.',
    statutoryBasis: 'Ferrazzini v. Gsell; Tiu v. Platinum Plans Phils.; Daisy Tiu; Rivera v. Solidbank',
    barExamTip:
      'A non-compete without territorial or time limits is VOID against public policy; a 2-year restriction within the same specialized industry (Tiu v. Platinum Plans) is VALID!',
  },
  {
    id: 'training-bond-reimbursement',
    term: 'Training Bond / Scholarship Return-Service Agreement',
    category: 'Wages & D.O. 174',
    aliases: ['training bond', 'return service agreement', 'employment bond'],
    marioPowerUp: 'Star Academy Tuition Scroll',
    marioIcon: 'coin',
    marioAnalogy:
      'If Peach spends ₱300,000 sending Engineer Luigi to Japan for specialized Kart Robotics training in exchange for a 2-year return service, Luigi must reimburse actual pro-rated training cost if he quits early—not involuntary servitude!',
    simplifiedDefinition:
      'Agreements requiring an employee who received specialized employer-funded training to render a reasonable return-service period—or reimburse actual/reasonable training costs upon early resignation—are VALID under Civil Code obligations and do NOT violate involuntary servitude (since only monetary reimbursement, not forced labor, is enforced).',
    statutoryBasis: 'Article 1306, Civil Code; Almario v. Philippine Airlines',
    barExamTip:
      'To be enforceable, the employer must have incurred genuine training expenses and the liquidated reimbursement amount must not be unconscionable or punitive.',
  },
  {
    id: 'meal-period-shortened-20-min',
    term: 'Shortened Compensable Meal Period (20-Minute Exception, Omnibus Rules)',
    category: 'Hours & Overtime',
    aliases: ['shortened meal break', '20-minute meal break', 'compensable meal period'],
    marioPowerUp: '20-Minute Speed Mushroom Snack',
    marioIcon: 'mushroom',
    marioAnalogy:
      'Regular 60-minute lunch is unpaid—but if Peach shortens Mario’s meal break to 20–30 minutes for continuous non-manual factory ops, the ENTIRE meal break becomes PAID working time!',
    simplifiedDefinition:
      'While the regular >=60-minute meal period under Art. 85 is non-compensable, DOLE Omnibus Rules allow shortening a meal period to NOT LESS THAN 20 MINUTES WITH FULL PAY in four strict cases: (1) non-manual work not involving strenuous physical exertion, (2) establishments operating >=16 hours/day, (3) actual/impending emergencies or urgent machinery repairs, and (4) necessary to prevent serious loss of perishable goods.',
    statutoryBasis: 'Article 85, Labor Code; Book III, Rule I, Sec. 7, Omnibus Rules; Pan American World Airways v. Pan Am Employees Assoc.',
    barExamTip:
      'Any meal break shortened below 20 minutes is ILLEGAL—it counts only as a paid rest/coffee break (5–20 mins) and the employee is still owed a proper meal period!',
  },
  {
    id: 'emergency-overtime-art-89',
    term: 'Compulsory / Emergency Overtime Work (Art. 89)',
    category: 'Hours & Overtime',
    aliases: ['compulsory overtime', 'emergency overtime', 'article 89'],
    marioPowerUp: 'Red Alarm Castle Bell',
    marioIcon: 'fire_flower',
    marioAnalogy:
      'Ordinarily Mario can say "No thanks!" to overtime—EXCEPT when a typhoon floods Peach’s Castle, perishable Super Mushrooms will rot, or urgent pipe repairs are needed to keep fellow Toads working!',
    simplifiedDefinition:
      'General Rule: Overtime is voluntary and refusal is not insubordination. Six Statutory Exceptions under Art. 89 where an employer may REQUIRE overtime work (with full OT pay): (1) country at war or national/local emergency, (2) imminent danger to public safety due to calamity/fire/flood/typhoon, (3) urgent work on machines/installations to avoid serious loss, (4) necessary to prevent loss/damage to perishable goods, (5) completion of work started before the 8th hour is necessary to prevent serious obstruction/prejudice to business, and (6) necessary to avail of favorable weather/environmental conditions.',
    statutoryBasis: 'Article 89, Labor Code',
    barExamTip:
      'Refusing lawful Art. 89 emergency overtime can constitute willful disobedience/insubordination, whereas refusing ordinary non-emergency overtime CANNOT be punished!',
  },
  {
    id: 'waiting-time-engaged-to-wait',
    term: 'Waiting Time Doctrine ("Engaged to Wait" vs. "Waiting to Be Engaged")',
    category: 'Hours & Overtime',
    aliases: ['waiting time', 'engaged to wait', 'waiting to be engaged', 'on-call pay'],
    marioPowerUp: 'Standby Fire Brigade Bell',
    marioIcon: 'question_block',
    marioAnalogy:
      'Company Driver Luigi waiting inside the garage between trips is "Engaged to Wait" = 100% PAID! Luigi chilling at home with a pager free to play video games is "Waiting to Be Engaged" = UNPAID until called!',
    simplifiedDefinition:
      'Waiting time is compensable working time if waiting is an integral part of the employee’s work or the employee is required by the employer to remain on duty/premises so they cannot use the time effectively for their own purposes ("engaged to wait"). On-call employees free to leave premises and use time for personal pursuits merely by leaving contact details are NOT working while waiting ("waiting to be engaged").',
    statutoryBasis: 'Book III, Rule I, Sec. 5, Omnibus Rules; Arica v. NLRC; Rada v. NLRC',
    barExamTip:
      'Compare Rada v. NLRC (driver picking up employees along fixed company bus route = COMPENSABLE) vs. Arica v. NLRC (30-min assembly roll-call not restricting personal freedom = NOT compensable)!',
  },
  {
    id: 'travel-time-compensability',
    term: 'Travel Time Compensability (Home-to-Work vs. Special Out-of-Town Assignment)',
    category: 'Hours & Overtime',
    aliases: ['travel time', 'home to work travel', 'out of town travel'],
    marioPowerUp: 'Lakitu Cloud Commute',
    marioIcon: 'pipe',
    marioAnalogy:
      'Daily Warp Pipe commuting from home to work is UNPAID—but when Peach sends Mario on a special 1-day repair mission to Sarasaland or travel cuts across normal work hours, that travel time is PAID!',
    simplifiedDefinition:
      '(1) Normal home-to-work and work-to-home travel is NOT compensable working time. (2) Travel that is "all in the day’s work" (job site to job site during shift) IS compensable. (3) Special 1-day out-of-town assignment travel is compensable. (4) Overnight travel away from home is compensable when it cuts across the employee’s regular working hours (even on rest days during those same clock hours!).',
    statutoryBasis: 'Department of Labor Manual / Omnibus Rules on Hours Worked',
    barExamTip:
      'If an employer provides optional shuttle buses for employee convenience, travel isn’t compensable; if driving the shuttle IS the employee’s assigned duty to transport crew (Rada v. NLRC), it IS compensable!',
  },
  {
    id: 'hospital-40-hour-week-5-days',
    term: 'Health Personnel 40-Hour / 5-Day Workweek & +30% 6th-Day Rule (Art. 83)',
    category: 'Hours & Overtime',
    aliases: ['health personnel', '40-hour workweek', 'hospital 1m population', '100 bed capacity'],
    marioPowerUp: 'Dr. Mario 5-Day Stethoscope',
    marioIcon: '1up',
    marioAnalogy:
      'In big cities (>=1M people) OR big hospitals (>=100 beds), Dr. Mario works only 8 hours x 5 days (40 hours)! If the hospital makes him work a 6th day due to nurse shortage, he earns +30% on top of his regular wage!',
    simplifiedDefinition:
      'Resident physicians, nurses, nutritionists, dietitians, pharmacists, social workers, lab technicians, paramedics, psychologists, midwives, and attendants in cities/municipalities with a population of at least 1,000,000 OR in hospitals/clinics with a bed capacity of at least 100 have normal work hours of 8 hours/day for 5 days/week (40 hours), exclusive of meal time. Where exigencies require 6 days/48 hours, they must receive an additional at least +30% of regular wage for work on the 6th day!',
    statutoryBasis: 'Article 83, Labor Code; San Juan De Dios Hospital Employees Assoc. v. NLRC',
    barExamTip:
      'Note the conjunctive "OR" trigger in Art. 83: a small 25-bed clinic located inside Quezon City (population >= 1M) IS COVERED by the 40-hour / 5-day rule!',
  },
  {
    id: 'seafarer-hours-fixed-overtime',
    term: 'Seafarer Fixed Guaranteed Overtime vs. Land-Based Overtime Rule',
    category: 'Hours & Overtime',
    aliases: ['seafarer overtime', 'guaranteed overtime', 'stolt-nielsen', 'pcl shipping'],
    marioPowerUp: 'Galleon Star Anchor',
    marioIcon: 'coin',
    marioAnalogy:
      'On the high seas, Sailor Mario’s POEA contract includes a "Fixed Guaranteed Overtime" stipend—valid ONLY for seafarers at sea, whereas "built-in overtime" in ordinary land-based pay is generally disallowed!',
    simplifiedDefinition:
      'Because seafarers remain aboard vessels continuously at sea, POEA-approved contracts with fixed/guaranteed monthly overtime pay are valid and Seafarers cannot claim extra overtime beyond the guaranteed package UNLESS they prove actual overtime hours worked in excess of the guaranteed hours via ship logbooks. Conversely, for land-based workers, composite/all-in salaries hiding overtime are generally invalid unless express, voluntary, and >= statutory minimum + OT.',
    statutoryBasis: 'PCL Shipping Phils. v. NLRC; Bahia Shipping Services v. Chua; Damasco v. NLRC',
    barExamTip:
      'Never confuse Seafarer Guaranteed OT (valid per POEA-SEC) with land-based "all-in wage" schemes (invalid unless strict Damasco requisites are proven)!',
  },
  {
    id: 'muslim-holidays-pd-1083',
    term: 'Muslim Holidays: Nationwide Eid vs. Regional Muslim Holidays (P.D. 1083)',
    category: 'Rest & Holidays',
    aliases: ['muslim holidays', 'pd 1083', 'eidul fitr', 'eidul adha', 'san miguel v ca'],
    marioPowerUp: 'Crescent Star Lantern',
    marioIcon: 'star',
    marioAnalogy:
      'Eid’l Fitr & Eid’l Adha are Regular Holidays for EVERYONE nationwide! And inside designated Mindanao provinces under P.D. 1083, regional Muslim holidays cover BOTH Muslim AND Christian workers in that province (San Miguel Corp. v. CA)!',
    simplifiedDefinition:
      '(1) Eidul Fitr (R.A. 9177) and Eidul Adha (R.A. 9849) are NATIONAL Regular Holidays enjoyed by all covered workers nationwide regardless of religion. (2) Other Muslim holidays under P.D. 1083 (Amun Jadid, Maulid-un-Nabi, Lailatul Isra Wal Mi’raj) are observed as regular holidays in specified Mindanao provinces/cities—where BOTH Muslim and non-Muslim employees working there receive holiday pay (San Miguel Corp. v. CA); outside those areas, Muslim employees are excused from work without diminution of salary.',
    statutoryBasis: 'P.D. 1083, Arts. 169–172; R.A. 9177; R.A. 9849; San Miguel Corp. v. Court of Appeals (G.R. No. 146775)',
    barExamTip:
      'Remember San Miguel Corp. v. CA: inside P.D. 1083 provinces, holiday pay cannot be restricted by religion—both Muslim and Christian workers in Iligan/Cotabato get 200% if worked!',
  },
  {
    id: 'commissions-13th-month-boie-takeda',
    term: 'Commissions in 13th Month Pay (Wage-Integrated vs. Productivity Bonus)',
    category: 'Rest & Holidays',
    aliases: ['boie-takeda', 'philippine duplicators', 'commissions 13th month', 'overriding commissions'],
    marioPowerUp: 'Twin Coin Scale',
    marioIcon: 'coin',
    marioAnalogy:
      'Salesman Luigi’s direct % commission per copier sold IS his basic wage -> INCLUDED in 13th month (Philippine Duplicators)! Medical rep Mario’s profit-sharing productivity bonus on top of fixed salary -> EXCLUDED (Boie-Takeda)!',
    simplifiedDefinition:
      'Whether commissions are included in "basic salary" for P.D. 851 13th Month Pay depends on their nature: (1) Direct/Wage-Integrated Commissions paid as direct remuneration for actual sales closed by a salesperson (Philippine Duplicators v. NLRC) ARE INCLUDED; (2) Productivity/Overriding Commissions having no direct relation to individual unit sales and functioning as extra profit-sharing incentives on top of fixed basic pay (Boie-Takeda Chemicals v. De la Serna; Reyes v. NLRC) ARE EXCLUDED.',
    statutoryBasis: 'P.D. 851; Philippine Duplicators, Inc. v. NLRC (G.R. No. 110068); Boie-Takeda Chemicals v. De la Serna',
    barExamTip:
      'Spot the trigger phrase in Bar exams: "fixed modest base + direct % of every unit sold by salesman" = Philippine Duplicators (INCLUDE); "medical representative paid fixed salary + overriding territory productivity bonus" = Boie-Takeda (EXCLUDE)!',
  },
  {
    id: 'monthly-paid-vs-daily-paid-factors',
    term: 'Monthly-Paid vs. Daily-Paid Employees (365 / 313 / 261 EEMR Divisors)',
    category: 'Rest & Holidays',
    aliases: ['365 factor', '261 factor', '313 factor', 'eemr', 'monthly paid vs daily paid'],
    marioPowerUp: 'Calendar Multiplier Abacus',
    marioIcon: 'coin',
    marioAnalogy:
      '365-factor Monthly Toad is paid for EVERY single day of the year (including unworked Sundays & holidays)! 261-factor Daily Toad is paid only on days worked + 12 regular holidays!',
    simplifiedDefinition:
      'Monthly-paid employees are those paid every day of the month, including unworked rest days, special days, and regular holidays (365-day factor). Daily-paid employees are paid on the days they actually work and on unworked regular holidays (313-day factor for 6-day workweek; 261-day factor for 5-day workweek). DOLE cannot unilaterally change a lawful divisor without violating Non-Diminution or contractual intent.',
    statutoryBasis: 'DOLE Handbook on Workers’ Statutory Monetary Benefits; Chartered Bank Employees Assoc. v. Ople; Leyte IV Electric Coop. v. LEYECO IV Employees Union',
    barExamTip:
      'If a monthly-paid employee is already paid using a 365 divisor, their unworked Regular Holiday (100%) is ALREADY built into their monthly salary—if they work on that Regular Holiday, add +100% more (total 200%)!',
  },
  {
    id: 'double-special-day',
    term: 'Double Special Non-Working Day Rate (150% / 195% DOLE Rule)',
    category: 'Rest & Holidays',
    aliases: ['double special day', 'two special holidays', '150% special day'],
    marioPowerUp: 'Twin Silver Bell',
    marioIcon: 'question_block',
    marioAnalogy:
      'Don’t confuse Double Regular Holiday (300% worked / 200% unworked) with a Regular Holiday + Special Day (260% worked / 100% unworked)! Know which holidays overlap on the same calendar date!',
    simplifiedDefinition:
      'When ONE Regular Holiday and ONE Special Non-Working Day fall on the same date (e.g., Araw ng Kagitingan coinciding with Black Saturday): Unworked = 100%; Worked = 260% (or 300% if also Rest Day). When TWO Regular Holidays fall on the same date (e.g., Maundy Thursday + Araw ng Kagitingan): Unworked = 200%; Worked = 300% (or 390% if also Rest Day)!',
    statutoryBasis: 'DOLE Labor Advisories on Overlapping Holidays & Handbook on Workers’ Statutory Monetary Benefits',
    barExamTip:
      'Check the exact pairing in Bar problems: Regular + Regular = 300% worked (390% on Rest Day); Regular + Special = 260% worked!',
  },
  {
    id: 'wage-order-exemption-nwpc',
    term: 'Wage Order Exemptions (Distressed, New Business, Calamity & Retail <=10)',
    category: 'Wages & D.O. 174',
    aliases: ['wage order exemption', 'distressed establishment', 'bmbe', 'nwpc exemption'],
    marioPowerUp: 'Emergency Relief Shield',
    marioIcon: 'mushroom',
    marioAnalogy:
      'A tiny <=10-worker Toad Bakery or a typhoon-wrecked shop can apply to the RTWPB within 75 days for a 1-year temporary Wage Order exemption—if denied, they must pay back wages + 1% monthly interest!',
    simplifiedDefinition:
      'Under NWPC Guidelines (No. 02, Series of 2007 as amended) and R.A. 6727, four categories may apply for temporary exemption (max 1 year) from an RTWPB Wage Order within 75 days of publication: (1) Distressed establishments, (2) Retail/Service establishments regularly employing not more than 10 workers, (3) Establishments adversely affected by natural/human-induced calamities, and (4) Registered Barangay Micro Business Enterprises (BMBEs under R.A. 9178 are statutorily exempt from minimum wage law, while still covered by SSS/PhilHealth/13th Month!).',
    statutoryBasis: 'R.A. 6727 (Wage Rationalization Act); R.A. 9178 (BMBE Law); NWPC Omnibus Rules on Minimum Wage Determination',
    barExamTip:
      'Exemption from a Wage Order is NEVER automatic (except statutory BMBE certificate holders)—the employer must timely apply within 75 days, and if disapproved, pay the wage differential plus simple interest of 1% per month!',
  },
  {
    id: 'barangay-micro-business-bmbe-ra-9178',
    term: 'Barangay Micro Business Enterprise (BMBE) Minimum Wage Exemption (R.A. 9178)',
    category: 'Wages & D.O. 174',
    aliases: ['bmbe', 'ra 9178', 'micro business exemption', '3 million assets'],
    marioPowerUp: 'Toad Village Micro-Shop Permit',
    marioIcon: 'mushroom',
    marioAnalogy:
      'A duly registered neighborhood Toad Sari-Sari Workshop with total assets <= ₱3,000,000 (excluding land) is exempt from Minimum Wage Laws—but MUST still give SSS, PhilHealth, Pag-IBIG, 13th Month, Holiday & Overtime Pay!',
    simplifiedDefinition:
      'Any business entity/enterprise engaged in production, processing, manufacturing, trading, or services with total assets of not more than ₱3,000,000 (excluding the land on which the office/plant is situated) and holding a valid BMBE Certificate of Authority is EXEMPT from the coverage of the Minimum Wage Law—provided that all BMBE employees remain entitled to the same social security, healthcare, 13th month, overtime, holiday, and SIL benefits as other employees.',
    statutoryBasis: 'Republic Act No. 9178 (BMBEs Act of 2002), Sec. 8, as amended by R.A. 10644 (Go Negosyo Act)',
    barExamTip:
      'Two classic Bar traps on BMBEs: (1) Value of the LAND is EXCLUDED in computing the ₱3,000,000 asset cap, and (2) BMBE workers are exempt ONLY from Minimum Wage—NEVER exempt from SSS, PhilHealth, 13th Month Pay, SIL, or Holiday Pay!',
  },
  {
    id: 'worker-preference-bankruptcy-art-110',
    term: 'Worker First Preference in Bankruptcy or Liquidation (Art. 110)',
    category: 'Wages & D.O. 174',
    aliases: ['worker preference', 'bankruptcy preference', 'article 110', 'dbt v nlrc'],
    marioPowerUp: 'First-in-Line Golden Ticket',
    marioIcon: 'coin',
    marioAnalogy:
      'When Bowser Corp. goes into formal Liquidation Court, unpaid workers jump to #1 priority ahead of ordinary creditors and government taxes—EXCEPT secured mortgage liens on specific castle land (DBP v. NLRC)!',
    simplifiedDefinition:
      'In the event of bankruptcy or liquidation of an employer’s business, workers enjoy FIRST PREFERENCE as regards their unpaid wages and other monetary claims, prior to claims of the government and other general creditors. Under DBP v. NLRC & Republic v. Peralta, two rules govern: (1) formal insolvency/liquidation proceedings in rem are required so all creditors are convened, and (2) Art. 110 applies to general/unencumbered assets and does NOT wipe out special preferred credits/registered mortgages over specific property under Arts. 2241–2242 Civil Code.',
    statutoryBasis: 'Article 110, Labor Code; Development Bank of the Philippines v. NLRC; FRIA (R.A. 10142)',
    barExamTip:
      'Two magic words for Art. 110 Bar questions: (1) Requires formal IN REM liquidation proceeding, and (2) Subordinate only to SPECIAL preferred liens (like registered real estate/chattel mortgages) on specific assets, but beats taxes and unsecured creditors!',
  },
  {
    id: 'attorneys-fees-10-percent-art-111',
    term: 'Statutory 10% Attorney’s Fees in Unlawful Wage Withholding (Art. 111)',
    category: 'Wages & D.O. 174',
    aliases: ['attorneys fees 10%', 'article 111', 'kaisahan v giudote', 'pao attorneys fees'],
    marioPowerUp: 'Lawyer Toad 10% Briefcase',
    marioIcon: 'coin',
    marioAnalogy:
      'When Toad is forced to litigate to recover unlawfully withheld wages, Bowser pays an extra 10% Attorney’s Fees (extraordinary concept = goes to the client as indemnity, even if represented by PAO)!',
    simplifiedDefinition:
      'In cases of unlawful withholding of wages (and by jurisprudence, any action for recovery of wages/monetary benefits where the employee was compelled to litigate), the culpable party may be assessed attorney’s fees equivalent to ten percent (10%) of the amount of wages recovered—and it is unlawful to demand or accept more than 10% in any judicial/administrative wage recovery stage.',
    statutoryBasis: 'Article 111, Labor Code; Tangga-an v. Philippine Transmarine Carriers; Alva v. High Capacity Security Force',
    barExamTip:
      'Even employees represented free of charge by the Public Attorney’s Office (PAO) are entitled to 10% Art. 111 attorney’s fees (deposited in the National Treasury trust fund for PAO under R.A. 9406)!',
  },
  {
    id: 'prohibition-against-kickbacks-art-115-117',
    term: 'Prohibition Against Kickbacks, Retaliatory & Job-Retention Deductions (Arts. 116–118)',
    category: 'Wages & D.O. 174',
    aliases: ['kickbacks', 'article 116', 'article 117', 'article 118', 'retaliatory measures'],
    marioPowerUp: 'Anti-Extortion Fire Shield',
    marioIcon: 'fire_flower',
    marioAnalogy:
      'Foreman Wario demanding ₱500 "thank-you fee" to keep Toad on the roster (Art. 117) or firing Toad for testifying in a wage inspection (Art. 118) is an automatic Labor Code violation!',
    simplifiedDefinition:
      'Three protective wage shields: (1) Art. 116 makes withholding wages or inducing kickbacks unlawful; (2) Art. 117 prohibits deducting any amount from wages as consideration of a promise of employment or retention in employment; and (3) Art. 118 makes it unlawful for an employer to refuse to pay/reduce wages or discharge/discriminate against any employee who has filed a complaint or testified (or is about to testify) in any Book III wage proceeding.',
    statutoryBasis: 'Articles 116, 117 & 118, Labor Code',
    barExamTip:
      'Watch out for the distinction in Bar exams: retaliation for testifying in a WAGE case (Art. 118) is unlawful under Book III, whereas retaliation for testifying under the Labor Code in relation to self-organization/ULP (Art. 259[f]) is specifically an Unfair Labor Practice (ULP)!',
  },
  {
    id: 'yellow-dog-contract',
    term: 'Yellow Dog Contract (Unfair Labor Practice, Art. 259[b])',
    category: 'Tenure & Dismissal',
    aliases: ['yellow dog contract', 'non-union condition', 'article 259b'],
    marioPowerUp: 'Broken Chain Emblem',
    marioIcon: 'bowser',
    marioAnalogy:
      'Making Rookie Mario sign a contract promising "I will NEVER join a labor union or I get fired!" is a classic void Yellow Dog Contract—and an Unfair Labor Practice!',
    simplifiedDefinition:
      'An unlawful employment agreement requiring a job applicant or employee, as a condition of employment or continued employment, NOT to join a labor organization or to withdraw from one to which they belong. Declared null and void and constitutes an Unfair Labor Practice (ULP) by the employer.',
    statutoryBasis: 'Article 259(b) (formerly Art. 248[b]), Labor Code',
    barExamTip:
      'Contrast Yellow Dog Contract (forcing worker NOT to join a union = ILLEGAL ULP) vs. Union Security Clause (CBA requiring covered workers to join/maintain membership in the SEBA = VALID under Art. 259[e])!',
  },
  {
    id: 'dole-visitorial-enforcement-art-128',
    term: 'DOLE Visitorial & Enforcement Power — No ₱5,000 Ceiling! (Art. 128)',
    category: 'Wages & D.O. 174',
    aliases: ['visitorial and enforcement power', 'article 128', 'article 129', 'peoples broadcasting', 'bombo radyo'],
    marioPowerUp: 'DOLE Inspector Master Key',
    marioIcon: 'star',
    marioAnalogy:
      'While Mario STILL works at the factory (or ER-EE existed at inspection), DOLE Regional Director has UNLIMITED monetary jurisdiction under Art. 128 (even ₱50 Million!)—and can determine ER-EE relationship too (Bombo Radyo)!',
    simplifiedDefinition:
      'Under Art. 128 (as amended by R.A. 7730), the DOLE Secretary or Regional Director exercises visitorial and enforcement power to inspect records and issue Compliance Orders for labor standards violations WITHOUT ANY MONETARY CEILING, provided an employer-employee relationship still exists (or existed at the time of inspection). Under People’s Broadcasting Service (Bombo Radyo) v. Sec. of Labor (2012 En Banc), DOLE has full power to determine the existence of an ER-EE relationship in exercising Art. 128!',
    statutoryBasis: 'Article 128, Labor Code; R.A. 7730; People’s Broadcasting Service (Bombo Radyo Phils.) v. Secretary of Labor (G.R. No. 179652, March 6, 2012)',
    barExamTip:
      'Contrast Art. 128 vs. Art. 129 vs. Art. 224: Art. 128 = DOLE Inspection, NO ₱5k cap, ER-EE exists; Art. 129 = DOLE Regional Director recovery complaint, <=₱5,000 per claimant, ER-EE severed, NO reinstatement claim; Art. 224 = Labor Arbiter (>₱5,000 or with reinstatement/illegal dismissal)!',
  },
  {
    id: 'alien-employment-permit-aep',
    term: 'Alien Employment Permit (AEP) & Labor Market Test (Art. 40)',
    category: 'Special & Protective',
    aliases: ['alien employment permit', 'aep', 'non-resident alien', 'article 40', 'wpp'],
    marioPowerUp: 'Mushroom Kingdom Work Visa',
    marioIcon: 'pipe',
    marioAnalogy:
      'Foreign Chef Toadsworth needs a DOLE Alien Employment Permit (AEP) BEFORE working—only after proving no willing, able, and competent Filipino chef is available at the time of application!',
    simplifiedDefinition:
      'Any non-resident alien seeking admission to the Philippines for employment, or any domestic/foreign employer desiring to engage an alien for local employment, must first obtain an Alien Employment Permit (AEP) from DOLE after determination of the non-availability of a competent, able, and willing person in the Philippines ("Labor Market Test"). Foreign nationals illegally dismissed without an AEP cannot demand reinstatement, though jurisprudence protects against unjust enrichment for actual work rendered depending on good/bad faith.',
    statutoryBasis: 'Articles 40–42, Labor Code; DOLE D.O. No. 221-21; WPP Marketing Communications v. Galera',
    barExamTip:
      'Under WPP Marketing v. Galera, a foreign national hired by an employer without first securing an AEP is in pari delicto and cannot invoke Philippine Labor Code security-of-tenure remedies like reinstatement/backwages!',
  },
  {
    id: 'anti-age-discrimination-ra-10911',
    term: 'Anti-Age Discrimination in Employment Act (R.A. 10911)',
    category: 'Special & Protective',
    aliases: ['anti-age discrimination', 'age limit', 'ra 10911', 'bfoq age'],
    marioPowerUp: 'Timeless Star Badge',
    marioIcon: 'star',
    marioAnalogy:
      'Job ads saying "Must be 21–28 years old, pleasing personality" are ILLEGAL under R.A. 10911! Age limits are valid ONLY when age is a Bona Fide Occupational Qualification (like statutory airline pilot safety caps)!',
    simplifiedDefinition:
      'Prohibits employers, publishers, and labor contractors from: (1) printing/publishing age preferences or limitations in job notices, (2) requiring declaration of age/birth date during the application process, (3) declining employment, denying promotion/training, or imposing early/forcible layoff because of age. Exceptions: Bona Fide Occupational Qualification (BFOQ), intent to observe a bona fide seniority system or lawful voluntary early retirement plan certified by DOLE.',
    statutoryBasis: 'Republic Act No. 10911 & DOLE D.O. No. 170-17',
    barExamTip:
      'Remember both prohibitions at hiring stage: NO age ceilings in job ads AND NO requiring birth date during initial application screening unless BFOQ applies!',
  },
  {
    id: 'mental-health-workplace-ra-11036',
    term: 'Mental Health Act Workplace Policy & Non-Discrimination (R.A. 11036)',
    category: 'Special & Protective',
    aliases: ['mental health act', 'ra 11036', 'workplace mental health'],
    marioPowerUp: 'Calm Star Sanctuary',
    marioIcon: '1up',
    marioAnalogy:
      'Employers must establish a DOLE-compliant Mental Health Workplace Policy—and can NEVER fire or demote Luigi merely because of a mental health condition without reasonable accommodation!',
    simplifiedDefinition:
      'Requires employers to develop appropriate policies and programs on mental health in the workplace designed to raise awareness, correct stigma and discrimination, identify and provide support for individuals at risk, and facilitate access to treatment and psychosocial support (DOLE D.O. No. 208-20). Prohibits discrimination in hiring, promotion, or retention on account of a mental health condition.',
    statutoryBasis: 'Republic Act No. 11036, Sec. 25 & DOLE D.O. No. 208-20',
    barExamTip:
      'Pair R.A. 11036 with Art. 299 (Disease as Authorized Cause): termination for mental/physical illness is lawful ONLY if a competent public health authority certifies it is incurable within 6 months AND prejudicial to health!',
  },
  {
    id: 'hiv-aids-non-discrimination-ra-11166',
    term: 'Philippine HIV and AIDS Policy Act — Ban on Compulsory Testing & Dismissal (R.A. 11166)',
    category: 'Special & Protective',
    aliases: ['hiv law', 'ra 11166', 'compulsory hiv testing', 'hiv discrimination'],
    marioPowerUp: 'Confidentiality Ribbon Shield',
    marioIcon: '1up',
    marioAnalogy:
      'Compulsory HIV testing as a condition for hiring or keeping a job—or firing Toad because of actual, perceived, or suspected HIV status—is STRICTLY CRIMINALIZED under R.A. 11166!',
    simplifiedDefinition:
      'Strictly prohibits compulsory HIV testing as a precondition to employment, promotion, or continued employment, mandates strict medical confidentiality, and penalizes rejection of job application, termination of employment, or discriminatory work conditions based on actual, perceived, or suspected HIV status.',
    statutoryBasis: 'Republic Act No. 11166, Secs. 29, 44 & 49; DOLE D.O. No. 102-10',
    barExamTip:
      'Even an overseas principal’s demand cannot justify illegal dismissal of a Filipino worker solely for HIV status where Philippine law governs local recruitment liability!',
  },
  {
    id: 'hepatitis-b-tb-drug-free-dole',
    term: 'DOLE Workplace Health Policies: Hepatitis B, Tuberculosis & Random Drug Testing',
    category: 'Special & Protective',
    aliases: ['random drug testing', 'hepatitis b policy', 'mirant v caro', 'drug test two-step'],
    marioPowerUp: 'Dual-Vial Verification Kit',
    marioIcon: 'mushroom',
    marioAnalogy:
      'For workplace drug testing to validly dismiss an employee, TWO separate tests (Screening Test + Confirmatory Test!) by a DOH-accredited lab are mandatory—one unconfirmed positive test is NEVER enough!',
    simplifiedDefinition:
      'Under R.A. 9165 & DOLE D.O. 53-03, random drug testing in workplaces with >=10 employees is lawful when conducted by DOH-accredited testing centers using TWO tests: (1) Screening Test, and if positive, (2) Confirmatory Test (valid for 1 year). First-time positive non-dependent workers are referred for treatment/rehabilitation where feasible, while refusal without valid reason to undergo authorized random testing may constitute insubordination (Mirant Phils. v. Caro). Under DOLE advisories on Hepatitis B and TB, positive status alone is NOT a ground for dismissal if fit to work.',
    statutoryBasis: 'R.A. 9165, Sec. 36(d); DOLE D.O. No. 53-03; Mirant Philippines Corp. v. Caro (G.R. No. 181490)',
    barExamTip:
      'Always check in Bar drug-test dismissal questions: Was a CONFIRMATORY test performed by a DOH-accredited lab? Without the confirmatory test, dismissal for drug use is ILLEGAL (Nacague v. Sulpicio Lines)!',
  },
  {
    id: 'kasambahay-deployment-loan-protection',
    term: 'Kasambahay Protection: Zero Deployment Fee, Debt Bondage Ban & Board/Lodging (R.A. 10361)',
    category: 'Special & Protective',
    aliases: ['kasambahay deployment expenses', 'debt bondage', 'kasambahay loan 20%', 'batas kasambahay'],
    marioPowerUp: 'Home Hearth Sanctuary',
    marioIcon: '1up',
    marioAnalogy:
      'Peach pays 100% of Kasambahay Toadette’s agency & deployment fare, gives FREE 3 meals + humane sleeping quarters (never deducted from wage!), and any cash loan repayment is capped at <=20% of her monthly wage!',
    simplifiedDefinition:
      'Under R.A. 10361 (Batas Kasambahay): (1) Employer pays all deployment expenses (recoverable ONLY if the kasambahay unreasonably leaves within 6 months); (2) Basic necessities—at least 3 adequate meals/day and humane sleeping arrangements—are FREE and can NEVER be deducted from wages; (3) Debt bondage is outlawed and voluntary loan deductions cannot exceed 20% of monthly wage; (4) Kasambahay has 8 hours aggregate daily rest, 24 consecutive hours weekly rest, 5 days non-cumulative/non-convertible SIL after 1 year, 13th month pay, and SSS/PhilHealth/Pag-IBIG after 1 month (100% employer-paid if wage < ₱5,000!).',
    statutoryBasis: 'Republic Act No. 10361, Secs. 6, 13, 15, 20–21, 29–30',
    barExamTip:
      'Spot the huge contrast between Ordinary Rank-and-File SIL vs. Kasambahay SIL: Ordinary SIL (Art. 95) IS commutable to cash if unused; Kasambahay 5-day SIL (R.A. 10361, Sec. 29) is FORFEITED if unused and NOT convertible to cash!',
  },
  {
    id: 'seafarer-poea-sec-elburg',
    term: 'Seafarer Disability Grading & The 120 / 240-Day Elburg Rule',
    category: 'Special & Protective',
    aliases: ['120 240 day rule', 'elburg shipmanagement', 'seafarer total permanent disability', '3-day mandatory reporting'],
    marioPowerUp: 'Maritime Medical Chronometer',
    marioIcon: 'question_block',
    marioAnalogy:
      'Repatriated Sailor Mario MUST report to the company doctor within 3 working days! Then the company doctor has 120 days (extendible to 240 days if further treatment is justified) to issue a final disability assessment—or Total & Permanent Disability ($60k+) attaches BY OPERATION OF LAW!',
    simplifiedDefinition:
      'Four-Rule Elburg Shipmanagement v. Quiogue framework for seafarer disability claims: (1) Seafarer must submit to post-employment medical exam by the company-designated physician within 3 working days from repatriation; (2) Company doctor must issue a final, definite assessment of fitness or disability grade within 120 days from repatriation; (3) If justified by need for further medical treatment, the period extends to 240 days; (4) Failure to issue a final, definite assessment within 120 days (without justification) or after 240 days renders the disability TOTAL AND PERMANENT by operation of law!',
    statutoryBasis: 'POEA-SEC Sec. 20(A); Elburg Shipmanagement Phils., Inc. v. Quiogue (G.R. No. 211882); Vergara v. Hammonia Maritime',
    barExamTip:
      'An "interim" or tentative disability grading issued on Day 118 without justification or final rating on Day 240 triggers Total & Permanent Disability (Grade 1) by operation of law!',
  },
  {
    id: 'migrant-workers-dmw-ra-11641',
    term: 'Department of Migrant Workers Act (DMW vs. NLRC OFW Jurisdiction, R.A. 11641)',
    category: 'Special & Protective',
    aliases: ['department of migrant workers', 'dmw', 'ra 11641', 'poea'],
    marioPowerUp: 'Overseas Embassy Warp Hub',
    marioIcon: 'pipe',
    marioAnalogy:
      'Illegal dismissal & money claims of OFWs STILL go to the Labor Arbiter / NLRC—while recruitment license cancellation & disciplinary rules over agencies/OFWs belong to the DMW (formerly POEA)!',
    simplifiedDefinition:
      'R.A. 11641 merged POEA and overseas labor offices into the Department of Migrant Workers (DMW). Jurisdictional split: (1) Labor Arbiters (NLRC) retain original and exclusive jurisdiction over monetary claims and illegal dismissal cases arising out of employer-employee relations or by virtue of law/contract involving OFWs (including damages); (2) DMW exercises regulatory/administrative jurisdiction over recruitment violations, license suspension/cancellation, and disciplinary actions.',
    statutoryBasis: 'R.A. 8042 Sec. 10 (as amended by R.A. 10022) & R.A. 11641 (DMW Act)',
    barExamTip:
      'Even if an OFW signed an employment contract that was NEVER deployed without the worker’s fault, the Labor Arbiter STILL has jurisdiction over the money/breach claim (Santiago v. CF Sharp Crew Management)!',
  },
  {
    id: 'adoptive-parents-maternity-leave',
    term: 'Adoptive Parents Maternity & Paternity Leave Parity (R.A. 8552 / R.A. 11642)',
    category: 'Leaves & Retirement',
    aliases: ['adoptive parents leave', 'adoption leave', 'ra 11642', 'pre-adoptive placement'],
    marioPowerUp: 'Stork Adoption Star Cradle',
    marioIcon: '1up',
    marioAnalogy:
      'Adoptive parents welcoming a child below 7 years old receive paid maternity/paternity leave parity counted from the Pre-Adoptive Placement Authority (PAPA) so they can bond with their child!',
    simplifiedDefinition:
      'Under Domestic Administrative Adoption laws (R.A. 8552 / R.A. 11642, Sec. 43), adoptive parents of a child below seven (7) years of age enjoy all maternity and paternity leave benefits granted to biological parents, counted from the date the child is placed with the adoptive parents via Pre-Adoptive Placement Authority.',
    statutoryBasis: 'Republic Act No. 11642 (Domestic Administrative Adoption and Alternative Child Care Act), Sec. 43',
    barExamTip:
      'Watch the age threshold for adoptive leave benefits: the adopted child must be BELOW SEVEN (7) YEARS OF AGE upon pre-adoptive placement!',
  },
  {
    id: 'early-retirement-plan-less-than-22-5',
    term: 'Company Retirement Plan vs. Statutory Floor & Early Retirement Rule',
    category: 'Leaves & Retirement',
    aliases: ['early retirement plan', 'company retirement plan', 'beltran', 'oxales', 'differential retirement'],
    marioPowerUp: 'Emerald Vault Pension Key',
    marioIcon: 'coin',
    marioAnalogy:
      'At age 60–65, a company plan can NEVER pay less than Art. 302’s 22.5 days/year (if it does, Peach must pay the differential!). Before age 60 (e.g., age 45 early retirement), a lower voluntary plan is valid ONLY IF Mario freely & explicitly consented!',
    simplifiedDefinition:
      '(1) At age 60–65: Company/CBA retirement benefits cannot fall below the statutory floor of 22.5 days per year of service under Art. 302; if less, the employer must pay the difference (Elegir v. PAL). (2) Early Retirement (<60 years old): An employer may offer an early retirement plan with a lower age requirement, and an employee cannot be compulsorily retired BEFORE age 60 unless they expressly, voluntarily, and knowingly consented to the early retirement age in the plan/CBA (Jaculbe v. Silliman University; Cercado v. Uniprom)!',
    statutoryBasis: 'Article 302, Labor Code; Cercado v. Uniprom, Inc.; Laya, Jr. v. Philippine Veterans Bank',
    barExamTip:
      'Passive acceptance of a company handbook upon hiring is NOT always enough to force compulsory retirement at age 50/55—look for explicit, voluntary employee assent (Cercado / Laya doctrines)!',
  },
  {
    id: 'racehorse-jockey-retirement-ra-10789',
    term: 'Racehorse Jockeys Retirement Act (Compulsory Age 55, R.A. 10789)',
    category: 'Leaves & Retirement',
    aliases: ['racehorse jockey', 'ra 10789', 'jockey retirement 55'],
    marioPowerUp: 'Yoshi Derby Golden Saddle',
    marioIcon: 'star',
    marioAnalogy:
      'Riding Yoshi at derby speeds takes athletic reflexes—so professional Racehorse Jockeys compulsorily retire at age 55 with >=5 years of service!',
    simplifiedDefinition:
      'Amends Art. 302 of the Labor Code to set the compulsory retirement age of professional racehorse jockeys duly licensed by PHILRACOM at fifty-five (55) years old, with at least five (5) years of service and minimum retirement pay of 1/2 month salary (22.5 days) per year of service.',
    statutoryBasis: 'Republic Act No. 10789 (Racehorse Jockeys Retirement Act)',
    barExamTip:
      'Quick memory triad of special retirement ages: Ordinary = 60 optional / 65 compulsory; Underground & Surface Miners = 50 optional / 60 compulsory; Racehorse Jockeys = 55 compulsory!',
  },
  {
    id: 'sss-unemployment-benefit-ra-11199',
    term: 'SSS Unemployment Insurance / Involuntary Separation Benefit (R.A. 11199)',
    category: 'Leaves & Retirement',
    aliases: ['unemployment benefit', 'sss unemployment', 'involuntary separation benefit', 'ra 11199'],
    marioPowerUp: '2-Month Parachute Coin Cushion',
    marioIcon: 'coin',
    marioAnalogy:
      'If Mario is laid off due to redundancy or retrenchment (NOT his fault!), SSS gives him a 2-month cash parachute equal to 50% of his average monthly salary credit!',
    simplifiedDefinition:
      'Under the Social Security Act of 2018 (R.A. 11199, Sec. 14-B), a covered SSS employee (not over 60 years old at separation; <=50 for miners; <=55 for racehorse jockeys) who has paid at least 36 monthly contributions (12 of which in the 18-month period prior to involuntary separation) and is INVOLUNTARILY separated (e.g., authorized causes, closure, calamity—NEVER just-cause fault!) receives a cash benefit equal to 50% of their Average Monthly Salary Credit (AMSC) for up to two (2) months, claimable once every 3 years.',
    statutoryBasis: 'Republic Act No. 11199 (Social Security Act of 2018), Sec. 14-B',
    barExamTip:
      'SSS Unemployment Benefit is IN ADDITION TO statutory separation pay from the employer under Art. 298—there is NO deduction or offset between the two!',
  },
  {
    id: 'employees-compensation-ecp-going-coming',
    term: 'Employees’ Compensation: Going-and-Coming Rule & 24-Hour Duty Doctrine',
    category: 'Special & Protective',
    aliases: ['going and coming rule', 'proximity rule', '24-hour duty doctrine', 'employees compensation'],
    marioPowerUp: 'Castle Gate Medkit',
    marioIcon: '1up',
    marioAnalogy:
      'Injuries on ordinary commutes are NOT work-connected—EXCEPT when Mario is injured right at the castle gate (Proximity Rule), riding the company bus, running a boss errand, or on 24-hour uniformed duty!',
    simplifiedDefinition:
      'General Rule ("Going-and-Coming Rule"): Injury or death sustained while commuting to or from work is NOT compensable under the Employees’ Compensation Program (P.D. 626). Four Classic Bar Exceptions: (1) Proximity / Ingress-Egress Rule (injured very near/at workplace entrance/exit), (2) Employer-Sponsored Conveyance (riding official company shuttle), (3) Special Errand / Street Peril Rule (performing an employer errand en route), and (4) 24-Hour Duty Doctrine for soldiers/policemen/seafarers (except injuries from purely personal/unlawful escapades).',
    statutoryBasis: 'P.D. 626 (Book IV, Labor Code); Alano v. ECC; Iloilo Dock & Engineering Co. v. WCC',
    barExamTip:
      'Memorize the 4 Exceptions to Going-and-Coming: (1) Proximity, (2) Company Shuttle, (3) Special Errand, and (4) 24-Hour Duty—guaranteed points on Welfare/ECP Bar items!',
  },
  {
    id: 'fixed-term-employment-brent-school',
    term: 'Fixed-Term Employment Validity (Brent School Two-Prong Doctrine)',
    category: 'Tenure & Dismissal',
    aliases: ['fixed-term employment', 'brent school', 'term employment', 'equal footing'],
    marioPowerUp: 'Sealed Royal Contract Scroll',
    marioIcon: 'question_block',
    marioAnalogy:
      'Dean Toadsworth and Peach negotiating a 3-year College Dean contract on equal footing is VALID (Brent School)! Making 200 factory cashiers sign rolling 5-month contracts under economic pressure is VOID -> Regular Employees!',
    simplifiedDefinition:
      'Fixed-term employment is NOT per se illegal even if the work is necessary and desirable, PROVIDED either of the two Brent School v. Zamora criteria is strictly satisfied: (1) the fixed period of employment was knowingly and voluntarily agreed upon by the parties WITHOUT any force, duress, or improper pressure being brought to bear upon the employee and absent any other circumstances vitiating consent; OR (2) it satisfactorily appears that the employer and employee dealt with each other on MORE OR LESS EQUAL TERMS with no moral dominance exercised by the former over the latter.',
    statutoryBasis: 'Brent School, Inc. v. Zamora (G.R. No. L-48494); GMA Network v. Pabriga; Fuji Television v. Espiritu',
    barExamTip:
      'Where rank-and-file workers with zero bargaining leverage are repeatedly made to sign fixed-term contracts for core operations, Brent School does NOT apply—they are REGULAR employees (Fuji Television / GMA Network v. Pabriga)!',
  },
  {
    id: 'preventive-suspension-30-day-cap',
    term: 'Preventive Suspension (Serious Threat Prerequisite & 30-Day Cap)',
    category: 'Tenure & Dismissal',
    aliases: ['preventive suspension', '30-day preventive suspension', 'constructive dismissal suspension'],
    marioPowerUp: '30-Day Hourglass Barrier',
    marioIcon: 'bowser',
    marioAnalogy:
      'Preventive suspension is NOT a penalty—it’s only allowed while investigating IF Koopa’s presence poses a serious & imminent threat to castle life or property, and NEVER beyond 30 days without restoring full pay!',
    simplifiedDefinition:
      'An employer may place an employee under preventive suspension during a pending administrative investigation ONLY IF the employee’s continued employment poses a SERIOUS AND IMMINENT THREAT to the life or property of the employer or co-workers. Maximum duration: 30 calendar days without pay. If the investigation is not finished after 30 days, the employer MUST either reinstate the worker OR extend the suspension WITH FULL WAGES AND BENEFITS—an unpaid extension beyond 30 days amounts to CONSTRUCTIVE DISMISSAL!',
    statutoryBasis: 'DOLE D.O. No. 147-15, Sec. 8–9; Book V Omnibus Rules; Maula v. Ximex Delivery Express',
    barExamTip:
      'Putting an employee on preventive suspension for simple tardiness or minor infractions (where no threat to life/property/evidence exists) is INVALID and renders the employer liable for unpaid wages during the improper suspension!',
  },
  {
    id: 'floating-status-bona-fide-suspension-art-301',
    term: 'Bona Fide Suspension of Operations / "Floating Status" (6-Month Cap, Art. 301)',
    category: 'Tenure & Dismissal',
    aliases: ['floating status', 'temporary off-detail', 'bona fide suspension', 'article 301', '6 months floating'],
    marioPowerUp: '6-Month Lakitu Cloud Hold',
    marioIcon: 'pipe',
    marioAnalogy:
      'Security Guard Toad waiting for a new client post can be placed on "Floating Status" (temporary off-detail) in good faith for AT MOST 6 MONTHS—on Month 6 Day 1 without recall or retrenchment pay, it becomes Constructive Illegal Dismissal!',
    simplifiedDefinition:
      'Under Art. 301 (formerly Art. 286), the bona fide suspension of the operation of a business or undertaking for a period NOT EXCEEDING SIX (6) MONTHS (or fulfillment of military/civic duty) does NOT terminate employment. Before placing employees on floating status/temporary lay-off, the employer must notify DOLE and the affected workers at least 1 month prior (where practicable) and prove good-faith lack of assignment/business dire necessity. Exceeding 6 months without recall or valid separation pay results in CONSTRUCTIVE DISMISSAL.',
    statutoryBasis: 'Article 301 (formerly Art. 286), Labor Code; Exocet Security v. Serrano; Airborne Maintenance v. Egos',
    barExamTip:
      'If a security agency has other available client posts requiring guards of the same rank and deliberately refuses to assign the guard, Constructive Dismissal can occur EVEN BEFORE the 6-month period expires!',
  },
  {
    id: 'strained-relations-doctrine',
    term: 'Doctrine of Strained Relations (Separation Pay in Lieu of Reinstatement)',
    category: 'Tenure & Dismissal',
    aliases: ['strained relations', 'separation pay in lieu of reinstatement', 'globe-mackay'],
    marioPowerUp: 'Golden Peace Severance Chest',
    marioIcon: 'coin',
    marioAnalogy:
      'When an illegally fired confidential secretary and her boss have irreconcilable hostility so reinstatement would breed constant castle warfare, the court awards 1 Month Pay per Year of Service IN LIEU of physical reinstatement (ON TOP of full backwages)!',
    simplifiedDefinition:
      'Where reinstatement of an illegally dismissed employee is no longer viable because antagonism and hostility between employer and employee have become so severe that harmonious working relations are impossible (particularly in positions of trust and confidence or close personal contact), courts award Separation Pay of ONE (1) MONTH SALARY FOR EVERY YEAR OF SERVICE in lieu of reinstatement, IN ADDITION TO full backwages computed up to finality of the decision!',
    statutoryBasis: 'Globe-Mackay Cable and Radio Corp. v. NLRC; Golden Ace Builders v. Talde; Claudia’s Kitchen v. Tanguin',
    barExamTip:
      'Strained relations is NEVER presumed from the mere filing of an illegal dismissal case—it must be alleged and proven by substantial factual evidence (Claudia’s Kitchen v. Tanguin)!',
  },
  {
    id: 'quitclaim-release-waiver-validity',
    term: 'Quitclaims, Waivers & Releases (Periquet Validity vs. Unconscionable Amount)',
    category: 'Wages & D.O. 174',
    aliases: ['quitclaim', 'release waiver and quitclaim', 'periquet v nlrc', 'dire necessity'],
    marioPowerUp: 'Magnifying Audit Lens',
    marioIcon: 'question_block',
    marioAnalogy:
      'Making starving Toad sign a "Full Quitclaim" for ₱5,000 when he is legally owed ₱250,000 is VOID! Toad still recovers the ₱245,000 balance (the ₱5,000 already paid is simply deducted)!',
    simplifiedDefinition:
      'Quitclaims are frowned upon in Labor Law and never bar employees from demanding statutory benefits. Under Periquet v. NLRC & Goodrich Manufacturing v. Ativo, a quitclaim is valid ONLY IF: (1) executed voluntarily with full understanding of its import, (2) no fraud or coercion was used, (3) consideration is credible, reasonable, and NOT unconscionably low compared to what is legally due, and (4) not contrary to law/morals/public policy. Even if invalid, any partial sum received is deducted from the total monetary award.',
    statutoryBasis: 'Periquet v. NLRC (G.R. No. 91298); Goodrich Manufacturing Corp. v. Ativo; Inter-Orient Maritime v. Candava',
    barExamTip:
      'Remember both rules: "Dire necessity" vitiates consent when paired with a grossly unconscionable settlement amount, AND signing a quitclaim NEVER bars filing an Illegal Dismissal complaint unless Periquet requisites concur!',
  },
  {
    id: 'payroll-reinstatement-garcia-pal',
    term: 'Immediate Reinstatement Pending Appeal & Garcia v. PAL Non-Refund Rule (Art. 229)',
    category: 'Tenure & Dismissal',
    aliases: ['payroll reinstatement', 'garcia v pal', 'reinstatement pending appeal', 'self-executory reinstatement'],
    marioPowerUp: 'Instant Respawn Star',
    marioIcon: 'star',
    marioAnalogy:
      'The Labor Arbiter’s reinstatement order is IMMEDIATELY SELF-EXECUTORY (actual OR payroll at employer’s option) even while Bowser appeals! And even if Bowser later wins on appeal at the Supreme Court, Mario NEVER refunds the payroll reinstatement salaries he received!',
    simplifiedDefinition:
      'Under Art. 229 (3rd par.), the decision of the Labor Arbiter reinstating a dismissed employee is IMMEDIATELY EXECUTORY even pending appeal (no writ of execution needed!). The employer must immediately admit the worker back under the same terms OR reinstate them in the payroll. Under Garcia v. Philippine Airlines (En Banc): (1) the employee is NOT required to refund salaries received during payroll reinstatement even if the higher court later reverses the LA and declares the dismissal valid; and (2) if the employer unjustifiably refused to reinstate pending appeal, the employer must STILL pay accrued reinstatement wages unless prevented by corporate rehabilitation stay order!',
    statutoryBasis: 'Article 229 (formerly Art. 223), Labor Code; Pioneer Texturizing v. NLRC; Roquero v. PAL; Garcia v. Philippine Airlines (G.R. No. 164856)',
    barExamTip:
      'Master the 3 pillars of LA Reinstatement: (1) Immediately self-executory (Pioneer Texturizing), (2) Posting an appeal bond does NOT stay reinstatement, and (3) NO REFUND of payroll reinstatement wages even upon reversal on appeal (Garcia v. PAL)!',
  },
  {
    id: 'nacar-6-percent-legal-interest',
    term: '6% Per Annum Legal Interest on Labor Monetary Awards (Nacar v. Gallery Frames)',
    category: 'Wages & D.O. 174',
    aliases: ['nacar v gallery frames', '6% legal interest', 'legal interest labor awards'],
    marioPowerUp: '6% Golden Interest Meter',
    marioIcon: 'coin',
    marioAnalogy:
      'Every final illegal dismissal or money-claim judgment earns 6% legal interest per annum from finality of judgment until Bowser pays the very last centavo!',
    simplifiedDefinition:
      'Under Nacar v. Gallery Frames (modifying Eastern Shipping Lines following BSP Circular No. 799, effective July 1, 2013), monetary awards in labor cases (backwages, separation pay, unpaid statutory benefits, damages) earn legal interest at the rate of SIX PERCENT (6%) PER ANNUM from the finality of the judgment/resolution until full satisfaction (unless a specific statute fixes a higher rate, such as 12% p.a. on OFW placement fee refunds under R.A. 10022).',
    statutoryBasis: 'Nacar v. Gallery Frames (G.R. No. 189871, August 13, 2013); BSP-MB Circular No. 799, Series of 2013',
    barExamTip:
      'Always close your dispositive illegal dismissal computation in the Bar Exam with: "...plus legal interest of six percent (6%) per annum on the total monetary award from finality of judgment until full payment (Nacar v. Gallery Frames)."',
  },
  {
    id: 'prescriptive-periods-labor-matrix',
    term: 'Master Matrix of Prescriptive Periods in Philippine Labor Law (1 / 3 / 4 / 10 / 20 Years)',
    category: 'Tenure & Dismissal',
    aliases: ['prescriptive period', '3 years money claims', '4 years illegal dismissal', '1 year ulp', 'auto bus v bautista'],
    marioPowerUp: 'Chrono-Warp Master Clock',
    marioIcon: 'question_block',
    marioAnalogy:
      'Know the 5 Master Timers: 1 Year = ULP & Offenses; 3 Years = Money Claims (SIL runs from refusal/resignation per Auto Bus!); 4 Years = Illegal Dismissal; 10 Years = SSS Benefits; 20 Years = Unremitted SSS Contributions!',
    simplifiedDefinition:
      'Complete Bar Prescriptive Periods: (1) Unfair Labor Practice (Art. 305) = 1 year from accrual; (2) Criminal Offenses under Labor Code (Art. 305) = 3 years (except ULP criminal aspect suspended during admin case); (3) Pure Money Claims (Art. 306) = 3 years from accrual (NOTE: for commutable SIL, the 3-year clock starts ONLY upon employer’s refusal to pay or upon separation from service — Auto Bus Transport Systems v. Bautista!); (4) Illegal Dismissal (Art. 1146 Civil Code, injury to rights) = 4 years from dismissal (Callanta v. Carnation); (5) Employees’ Compensation Claims = 3 years; (6) SSS Benefit Claims = 10 years; (7) Employer Non-Remittance of SSS Contributions = 20 years!',
    statutoryBasis: 'Articles 305–306, Labor Code; Art. 1146, Civil Code; Callanta v. Carnation Phils.; Auto Bus Transport Systems v. Bautista (G.R. No. 156367)',
    barExamTip:
      'Bar Examiner’s #1 Prescription Trap (Auto Bus v. Bautista): Even if an employee worked 10 years without using SIL, their SIL money claim for ALL 10 years is NOT barred by 3-year prescription upon resignation—because the cause of action for commutable SIL accrues ONLY when the employer refuses to pay or upon separation!',
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

const GENERIC_SINGLE_WORD_EXCLUSIONS = new Set([
  'work',
  'wage',
  'bonus',
  'leave',
  'chips',
  'chits',
  'coupons',
  'homework',
]);

export const ALL_GLOSSARY_KEYWORDS: { keyword: string; item: QuickGlossaryItem }[] = (() => {
  const seen = new Set<string>();
  const list: { keyword: string; item: QuickGlossaryItem }[] = [];

  const pushKeyword = (rawKw: string, item: QuickGlossaryItem) => {
    const kw = rawKw.trim();
    const lower = kw.toLowerCase();
    if (kw.length < 3) return;
    if (GENERIC_SINGLE_WORD_EXCLUSIONS.has(lower)) return;
    if (seen.has(lower)) return;
    seen.add(lower);
    list.push({ keyword: kw, item });
  };

  QUICK_GLOSSARY_TERMS.forEach((item) => {
    const cleanTerm = item.term.replace(/\s*\(.*?\)/g, '').trim();
    pushKeyword(cleanTerm, item);
    item.aliases.forEach((alias) => {
      pushKeyword(alias, item);
    });
  });

  return list.sort((a, b) => b.keyword.length - a.keyword.length);
})();
