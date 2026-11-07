import { formatLocalDayKey, StorageLike } from '../utils/studyModes';

export const DAILY_CHALLENGE_STORAGE_KEY = 'mario_daily_bar_challenge_v1';
export const DAILY_CHALLENGE_BASE_COINS = 75;
export const DAILY_CHALLENGE_REVIEW_COINS = 20;

export interface DailyChallengeScenario {
  id: string;
  worldId: 'world1' | 'world2' | 'world3' | 'world4' | 'world5' | 'world6' | 'holidays';
  worldLabel: string;
  difficultyLabel: 'Advanced Statutory Mastery' | 'Supreme Court Doctrine Trap' | 'Multi-Issue Statutory Math';
  title: string;
  factPattern: string;
  questionPrompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  statutoryBasis: string;
  doctrinalExplanation: string;
  barTakeaway: string;
}

export interface DailyChallengeRecord {
  dateKey: string;
  challengeId: string;
  completed: boolean;
  selectedOptionIndex: number | null;
  isCorrect: boolean;
  coinsAwarded: number;
  completedAtIso: string | null;
  totalSolvedCount: number;
}

export interface DailyChallengeCountdown {
  hours: number;
  minutes: number;
  seconds: number;
  totalSecondsRemaining: number;
  formatted: string;
}

export const DAILY_CHALLENGE_BANK: readonly DailyChallengeScenario[] = [
  {
    id: 'dc-01-maternity-paternity-allocation',
    worldId: 'world6',
    worldLabel: 'World 6: Statutory Leaves',
    difficultyLabel: 'Advanced Statutory Mastery',
    title: 'The 14-Day New Father Allocation & Unmarried Cohabitation Trap',
    factPattern:
      'Atty. Sofia and Marco are unmarried partners living together for 6 years. Sofia gives birth to their first child in a private hospital. Sofia executes a written notice allocating seven (7) days of her 105-day Expanded Maternity Leave to Marco, and Marco also files for seven (7) days of statutory Paternity Leave under R.A. 8187 with his employer, Peach Logistics Inc., claiming 14 paid days total.',
    questionPrompt:
      'How many total paid leave days is Marco legally entitled to demand from Peach Logistics Inc.?',
    options: [
      '14 days paid leave in full, because 6 years of exclusive cohabitation without legal impediment under Art. 147 of the Family Code satisfies both R.A. 8187 and R.A. 11210.',
      '0 days paid leave, because both Sec. 2 of R.A. 8187 and Sec. 6 of R.A. 11210 require proof of a valid civil or church marriage prior to childbirth.',
      '7 days paid leave ONLY under Sec. 6 of R.A. 11210 (which applies regardless of civil status), as R.A. 8187 Paternity Leave strictly requires lawful marriage to the mother.',
      '7 days paid leave ONLY under R.A. 8187 as a cohabiting biological father, because R.A. 11210 leave allocation is restricted exclusively to legitimate spouses.',
    ],
    correctIndex: 2,
    statutoryBasis: 'Sec. 6, R.A. No. 11210 vs. Sec. 2, R.A. No. 8187',
    doctrinalExplanation:
      'Under Sec. 6 of R.A. 11210 (105-Day Expanded Maternity Leave Law), a female worker may allocate up to 7 days of her maternity leave to the child’s father WHETHER OR NOT he is married to her. Conversely, Sec. 2 of R.A. 8187 (Paternity Leave Act) strictly grants the 7-day Paternity Leave ONLY to a MARRIED male employee cohabiting with his legitimate spouse. Because Marco and Sofia are unmarried, Marco gets the 7 allocated days under R.A. 11210, but NOT the 7 days under R.A. 8187.',
    barTakeaway:
      'Married father = up to 14 days (7d RA 8187 + 7d RA 11210). Unmarried father = up to 7 days ONLY via RA 11210 mother’s allocation!',
  },
  {
    id: 'dc-02-sil-prescription-autobus',
    worldId: 'world6',
    worldLabel: 'World 6: Statutory Leaves',
    difficultyLabel: 'Supreme Court Doctrine Trap',
    title: 'Prescription of Unused Service Incentive Leave (Auto Bus Doctrine)',
    factPattern:
      'Luigi worked as a regular warehouseman (not a field personnel) for Koopa Freight Corp. (employing 45 workers) from January 2018 until his resignation on March 1, 2025. Throughout his 7 years of service, he never used his 5-day annual Service Incentive Leave (SIL) and was never paid its cash commutation. On June 1, 2025, Luigi filed a complaint claiming cash conversion of ALL 35 days of unused SIL from 2018 to 2024. Koopa Freight invokes the 3-year prescriptive period under Article 306, arguing claims prior to June 2022 have prescribed.',
    questionPrompt:
      'Rule on Koopa Freight Corp.’s defense of prescription.',
    options: [
      'Overruled: Under Auto Bus Transport Systems v. Bautista, the 3-year period for SIL runs only from employer refusal upon demand OR upon separation from service, so all 7 years are recoverable.',
      'Sustained: Under Art. 306 of the Labor Code, money claims accrue at the close of each calendar year when SIL becomes commutable, barring the 2018–2021 SIL credits.',
      'Sustained in part: While Art. 306 bars claims older than 3 years, Art. 1144 of the Civil Code allows recovery of the last 5 years of written statutory leave credits.',
      'Overruled in part: Unused SIL credits accumulate for a maximum statutory cap of 15 days under the Omnibus Rules, regardless of when the employee resigns.',
    ],
    correctIndex: 0,
    statutoryBasis: 'Art. 95 & Art. 306, Labor Code; Auto Bus Transport Systems, Inc. v. Bautista (G.R. No. 156367)',
    doctrinalExplanation:
      'In Auto Bus Transport Systems, Inc. v. Bautista, the Supreme Court held that because an employee may choose either to use SIL or commute it to cash at the end of service, the cause of action for accumulated SIL accrues only when the employer refuses a demand for payment OR upon termination/resignation of employment. Since Luigi resigned on March 1, 2025 and filed on June 1, 2025 (within 3 months), NONE of his 2018–2024 SIL claims have prescribed!',
    barTakeaway:
      '3-year prescription for SIL runs from DEMAND/REFUSAL or SEPARATION from service—not year-by-year!',
  },
  {
    id: 'dc-03-double-holiday-restday-ot',
    worldId: 'holidays',
    worldLabel: 'Holidays & Multipliers',
    difficultyLabel: 'Multi-Issue Statutory Math',
    title: 'Double Regular Holiday Coinciding with Scheduled Rest Day + Overtime',
    factPattern:
      'Toadette earns a basic daily wage of ₱800.00 (₱100.00/hour) for an 8-hour shift. Araw ng Kagitingan (April 9) coincides with Good Friday (a Double Regular Holiday), which also happens to be Toadette’s scheduled weekly Rest Day. At management’s urgent request, Toadette works ten (10) hours from 8:00 AM to 7:00 PM (with a 1-hour meal break).',
    questionPrompt:
      'Compute Toadette’s exact statutory gross pay for that 10-hour shift.',
    options: [
      '₱3,900.00 total, computed at 390% for the first 8 hours (₱3,120.00) plus 2 overtime hours computed using a 390% straight hourly rate (₱780.00).',
      '₱3,120.00 total, computed at 300% for the first 8 hours on a Double Regular Holiday (₱2,400.00) plus 2 overtime hours at 360% per hour (₱720.00).',
      '₱3,768.00 total, computed at 360% for the first 8 hours on a Double Holiday Rest Day (₱2,880.00) plus 2 overtime hours at 444% per hour (₱888.00).',
      '₱4,134.00 total, computed at 390% for the first 8 hours (₱3,120.00) plus 2 overtime hours at 507% per hour [₱100 × 3.90 × 1.30] (₱1,014.00).',
    ],
    correctIndex: 3,
    statutoryBasis: 'Art. 87, 93 & 94, Labor Code; DOLE Statutory Benefits Handbook',
    doctrinalExplanation:
      'Step 1 (First 8 Hours): Double Regular Holiday worked = 300%. Because it also falls on her scheduled Rest Day, add +30% of 300% (+90%) = 390%. ₱800 × 3.90 = ₱3,120.00 (effective hourly rate on that day = ₱390.00/hr). Step 2 (2 Hours Overtime): Holiday/Rest Day OT adds +30% on top of the 390% hourly rate: ₱100 × 3.90 × 1.30 = ₱507.00/hr (507%). For 2 OT hours: ₱507 × 2 = ₱1,014.00. Total = ₱3,120.00 + ₱1,014.00 = ₱4,134.00!',
    barTakeaway:
      'Double Reg Holiday + Rest Day = 390% first 8 hrs; Overtime rate = 390% × 1.30 = 507% per hour!',
  },
  {
    id: 'dc-04-exact-headcount-exemption-trap',
    worldId: 'world3',
    worldLabel: 'World 3: Wages & Thresholds',
    difficultyLabel: 'Advanced Statutory Mastery',
    title: 'The 5 / 9 / 10 Retail Worker Headcount Statutory Trap',
    factPattern:
      'Yoshi Bakeshop is a neighborhood retail pastry store employing EXACTLY ten (10) regular rank-and-file bakers and cashiers. It applies with the RTWPB for a minimum wage exemption and simultaneously stops paying Regular Holiday Pay, Service Incentive Leave (SIL), and Night Shift Differential (NSD), claiming small retail establishments with 10 workers are exempt from all four.',
    questionPrompt:
      'Which statutory exemptions may Yoshi Bakeshop validly invoke with EXACTLY ten (10) regular workers?',
    options: [
      'It is automatically exempt from Regular Holiday Pay, SIL, and Minimum Wage (all "not more than 10"), and is liable only for Night Shift Differential ("not more than 5").',
      'It may apply ONLY for Minimum Wage exemption under R.A. 6727 ("not more than 10" = ≤10 upon RTWPB approval); Holiday Pay & SIL require "less than 10" (≤9) and NSD requires "not more than 5" (≤5).',
      'It is automatically exempt from all four benefits under Art. 82 and R.A. 9178 as a micro-retail enterprise employing ten or fewer regular rank-and-file personnel.',
      'It is exempt from Regular Holiday Pay and SIL under Arts. 94 and 95, but remains strictly liable for statutory Minimum Wage and Night Shift Differential.',
    ],
    correctIndex: 1,
    statutoryBasis: 'Art. 82/86 (NSD ≤5), Art. 94 (Holiday <10), Art. 95 (SIL <10), R.A. 6727 Sec. 4 (Min Wage ≤10)',
    doctrinalExplanation:
      'One of the sharpest statutory distinctions in Philippine Labor Standards: (1) Night Shift Differential exempts retail/service establishments regularly employing NOT MORE THAN FIVE (≤5) workers; (2) Regular Holiday Pay (Art. 94) and Service Incentive Leave (Art. 95) exempt retail/service establishments regularly employing LESS THAN TEN (<10, meaning at most 9) workers; (3) R.A. 6727 allows retail/service establishments employing NOT MORE THAN TEN (≤10) workers to apply with the RTWPB for minimum wage exemption. At 10 workers, ONLY R.A. 6727 (upon RTWPB application) is available!',
    barTakeaway:
      'NSD = ≤ 5 workers | Holiday Pay & SIL = < 10 workers (max 9!) | R.A. 6727 Min Wage application = ≤ 10 workers!',
  },
  {
    id: 'dc-05-do174-labor-only-contracting',
    worldId: 'world3',
    worldLabel: 'World 3: D.O. 174 Contracting',
    difficultyLabel: 'Supreme Court Doctrine Trap',
    title: 'Substantial Capital Alone vs. Right of Control in D.O. 174',
    factPattern:
      'ShyGuy Manpower Inc. has ₱8,000,000.00 in verified paid-up capital (exceeding the ₱5M D.O. 174 threshold) and holds a DOLE Certificate of Registration. It deploys 40 assembly-line operators to Bowser Electronics Corp. Inside the plant, Bowser’s own floor supervisors set the operators’ daily quotas, discipline them, approve leaves, and dictate assembly methods using Bowser’s conveyor machines.',
    questionPrompt:
      'What is the legal status of ShyGuy Manpower Inc. and its deployed operators?',
    options: [
      'Legitimate Job Contractor, because verified paid-up capital exceeding ₱5,000,000.00 and an active DOLE Certificate of Registration conclusively establish independent contracting.',
      'Legitimate Job Contractor as to corporate personality, rendering Bowser Electronics merely solidarily liable for unpaid statutory wages under Art. 109 without employer-employee ties.',
      'Prohibited Labor-Only Contractor under Sec. 5(b) of D.O. 174-17; lacking the Right of Control makes Bowser Electronics the direct employer of the 40 operators ab initio despite ₱8M capital.',
      'Permissible Trilateral Service Arrangement, provided ShyGuy Manpower executes six-month service agreements co-terminous with Bowser Electronics’ production cycles.',
    ],
    correctIndex: 2,
    statutoryBasis: 'Art. 106, Labor Code; Sec. 5(b), DOLE D.O. No. 174-17; Alilin v. Petron Corp.',
    doctrinalExplanation:
      'Under Section 5 of DOLE D.O. No. 174-17, Labor-Only Contracting exists under EITHER of two independent prongs: Prong (a) lack of substantial capital/investment + work directly related to principal’s main business, OR Prong (b) the contractor DOES NOT EXERCISE THE RIGHT OF CONTROL over the performance of the work of the employee! Even ₱8M paid-up capital and DOLE registration (which is not conclusive, only disputable) cannot save an arrangement where the principal exercises control. Bowser becomes the direct employer ab initio.',
    barTakeaway:
      'D.O. 174 has TWO fatal prongs: Even with ₱5M+ capital, if the PRINCIPAL exercises Control, it is Prohibited Labor-Only Contracting!',
  },
  {
    id: 'dc-06-kasambahay-sil-vs-regular-sil',
    worldId: 'world4',
    worldLabel: 'World 4 & World 6 Interplay',
    difficultyLabel: 'Advanced Statutory Mastery',
    title: 'Kasambahay 5-Day SIL vs. Labor Code Art. 95 5-Day SIL',
    factPattern:
      'Nana Daisy worked for 3 continuous years as a live-in family cook (Kasambahay) in Quezon City, while her brother Mario worked for 3 years as a cook in a commercial restaurant in Quezon City. Neither used any of their 5 annual Service Incentive Leave (SIL) days during their 3 years of service. Both resign today and demand cash conversion of 15 accumulated SIL days.',
    questionPrompt:
      'Who is legally entitled to cash conversion of accumulated unused SIL?',
    options: [
      'Mario gets all 15 days of unused SIL converted to cash under Art. 95, whereas Daisy gets ZERO cash conversion because under Sec. 29 of R.A. 10361 unused Kasambahay SIL is non-cumulative and non-convertible to cash.',
      'Both Mario and Daisy are entitled to full cash commutation of 15 accumulated SIL days upon resignation pursuant to the Auto Bus doctrine and R.A. 10361 parity rules.',
      'Mario gets 15 days converted to cash under Art. 95, while Daisy gets 5 days converted to cash corresponding only to her final year of household service under Sec. 29 of R.A. 10361.',
      'Neither gets cash conversion upon voluntary resignation, because statutory SIL commutation applies only when separation is due to an authorized cause by the employer.',
    ],
    correctIndex: 0,
    statutoryBasis: 'Sec. 29, R.A. No. 10361 (Batas Kasambahay) vs. Art. 95, Labor Code',
    doctrinalExplanation:
      'While both regular rank-and-file employees (Art. 95, after 1 year of service) and Kasambahays (Sec. 29, R.A. 10361, after 1 year of service) are entitled to 5 days of annual Service Incentive Leave with pay, their legal treatment of UNUSED leave is diametrically opposite: Regular Art. 95 SIL is COMMUTABLE to cash if unused, whereas R.A. 10361 Sec. 29 explicitly provides that unused Kasambahay SIL "shall not be cumulative or carried over to the succeeding years" and "Unused leaves shall not be convertible to cash."',
    barTakeaway:
      'Regular Art. 95 SIL = Cumulative & Cash-Convertible | Kasambahay R.A. 10361 SIL = Non-Cumulative & Non-Convertible to Cash!',
  },
  {
    id: 'dc-07-solo-parent-ra11861-amendment',
    worldId: 'world6',
    worldLabel: 'World 6: Statutory Leaves',
    difficultyLabel: 'Advanced Statutory Mastery',
    title: 'Expanded Solo Parents Welfare Act (R.A. 11861) Tenure & Cash Rules',
    factPattern:
      'Rosalina, a single mother holding a valid LGU-issued Solo Parent Identification Card (SPIC), has rendered seven (7) months of service (broken into 4 months probationary + 3 months regular) at Star Observatory BPO. She applies for 7 working days of paid Parental Leave to attend her child’s pediatric therapy. HR denies the leave, arguing R.A. 8972 requires at least one (1) full year of service.',
    questionPrompt:
      'Evaluate HR’s denial of Rosalina’s 7-day Parental Leave.',
    options: [
      'Valid denial: Parental Leave under R.A. 8972 and R.A. 11861 still requires twelve (12) months of aggregate service, excluding broken probationary periods.',
      'Invalid denial, and if Rosalina does not utilize the 7 working days within the calendar year, Star Observatory BPO must automatically convert them to cash in December.',
      'Valid denial in part: At 6 months of service she qualifies only for a pro-rated 3.5 days of Parental Leave until she completes one full year of regular employment.',
      'Invalid denial: R.A. 11861 lowered the service requirement from 1 year down to SIX (6) MONTHS (continuous or broken), entitling Rosalina to the full 7-day forfeitable paid Parental Leave.',
    ],
    correctIndex: 3,
    statutoryBasis: 'Sec. 8, R.A. No. 8972 as amended by R.A. No. 11861',
    doctrinalExplanation:
      'R.A. No. 11861 amended R.A. 8972 by reducing the service qualification for the 7-day paid Parental Leave from one (1) year down to at least SIX (6) MONTHS of service (regardless of employment status, continuous or broken) and presenting a valid Solo Parent ID. Note, however, that the 7-day leave remains forfeitable—non-cumulative and non-convertible to cash unless otherwise agreed upon.',
    barTakeaway:
      'R.A. 11861 Solo Parent Leave = 7 working days/year after just 6 MONTHS of service + valid SPIC (non-convertible to cash)!',
  },
  {
    id: 'dc-08-safe-spaces-vs-ra7877',
    worldId: 'world5',
    worldLabel: 'World 5: Protective Laws',
    difficultyLabel: 'Supreme Court Doctrine Trap',
    title: 'Subordinate-to-Superior Online Harassment & Employer Solidarity',
    factPattern:
      'During a remote work week, Junior Analyst Wario repeatedly sends unsolicited sexually explicit messages and lewd memes in the company Slack group directed at his Female Department Director, Pauline. Pauline formally reports the screenshots to the CEO, who laughs it off and takes no action for 4 months, saying "You’re his boss—harassment only happens top-down!"',
    questionPrompt:
      'Assess the criminal/administrative liability of Wario AND the civil liability of the company/CEO.',
    options: [
      'Neither is liable for workplace sexual harassment because R.A. 7877 strictly requires moral ascendancy, authority, or supervisory influence by the offender over the victim.',
      'Wario is liable under Sec. 16 of R.A. 11313 (which covers peer and subordinate-to-superior physical or online acts), and the employer/CEO is SOLIDARILY LIABLE for damages under Sec. 19 for taking no action.',
      'Wario is personally liable under R.A. 10175 for cyber-unjust vexation, but the employer incurs zero civil liability because Wario lacked managerial authority over Pauline.',
      'Both are liable under R.A. 7877 only if Wario conditioned his cooperation on sexual favors ("quid pro quo"), as offensive Slack memes alone do not create a hostile environment.',
    ],
    correctIndex: 1,
    statutoryBasis: 'Secs. 16 & 19, R.A. No. 11313 (Safe Spaces Act) vs. R.A. No. 7877',
    doctrinalExplanation:
      'While R.A. 7877 (1995) required authority, influence, or moral ascendancy, Section 16 of R.A. 11313 (Safe Spaces Act) expressly expanded Gender-Based Sexual Harassment in the Workplace to acts committed "between peers and those committed to a superior officer by a subordinate," whether physical or online! Moreover, under Sec. 19 of R.A. 11313, if the employer/head of office is informed by the offended party and takes no immediate action (or fails to constitute an independent CODI), the employer is SOLIDARILY LIABLE for damages.',
    barTakeaway:
      'R.A. 11313 covers peer & subordinate-to-superior harassment (physical + online), with employer solidary liability upon inaction!',
  },
  {
    id: 'dc-09-service-charge-ra11360',
    worldId: 'world2',
    worldLabel: 'World 2: Service Charges & 13th Month',
    difficultyLabel: 'Advanced Statutory Mastery',
    title: 'R.A. 11360 100% Service Charge Distribution & Abolition Rule',
    factPattern:
      'Grand Star Resort collects ₱500,000 in monthly 10% service charges. Management retains 15% (₱75,000) to cover crystal glassware pilferage/breakage, includes the Hotel General Manager in the remaining 85% pool, and announces that next quarter it will abolish the service charge entirely without adjusting basic wages.',
    questionPrompt:
      'Identify ALL statutory violations committed by Grand Star Resort under Article 96 (as amended by R.A. 11360).',
    options: [
      'Three violations: (1) 100% of service charges must go equally to covered employees (R.A. 11360 repealed the 15% management cut); (2) Managerial employees are excluded; and (3) upon abolition, the 12-month average share must be integrated into basic wages.',
      'Only one violation: Management may still retain up to 15% for documented pilferage and abolish the charge freely, but Art. 96 bars including the General Manager in the employee pool.',
      'Two violations: 100% must be distributed to rank-and-file and supervisory staff excluding the General Manager, but abolishing a discretionary service charge requires no basic wage integration.',
      'Zero violations, provided Grand Star Resort’s rank-and-file employees already receive basic wages above the prevailing RTWPB regional minimum wage rate.',
    ],
    correctIndex: 0,
    statutoryBasis: 'Art. 96, Labor Code as amended by R.A. No. 11360 & DOLE D.O. No. 206-19',
    doctrinalExplanation:
      'R.A. 11360 repealed the old 85%–15% management retention rule and mandated that 100% of all service charges collected by hotels, restaurants, and similar establishments be distributed COMPLETELY and EQUALLY among covered employees (all direct and agency workers EXCEPT managerial employees). Furthermore, under Art. 96 / IRR, if the service charge is abolished, the share of covered employees shall be considered integrated into their basic wages based on the average monthly share for the preceding 12 months.',
    barTakeaway:
      'R.A. 11360 = 100% equal distribution (0% management cut), Managerial excluded, 12-month average integrated if abolished!',
  },
  {
    id: 'dc-10-gynecological-leave-ra9710',
    worldId: 'world6',
    worldLabel: 'World 6: Statutory Leaves',
    difficultyLabel: 'Advanced Statutory Mastery',
    title: 'Magna Carta of Women 2-Month Special Leave vs. Maternity Leave',
    factPattern:
      'Daisy, a regular accountant who has worked 8 continuous months over the past year at Mushroom Audit LLP, undergoes an emergency hysterectomy (surgical removal of the uterus due to severe myoma, unrelated to pregnancy). Her attending OB-GYN certifies a 60-day recovery period. HR tells her she only gets 5 days of SIL and must file unpaid leave for the rest because she was not pregnant.',
    questionPrompt:
      'What statutory leave benefit is Daisy entitled to demand directly from her employer?',
    options: [
      '60 days of paid Emergency Gynecological Maternity Leave under R.A. 11210, advanced by the employer and reimbursed 100% by the Social Security System.',
      'Only SSS Sickness Daily Allowance equivalent to 90% of her average daily salary credit under R.A. 11199, because non-obstetric surgery requires 12 months of tenure for employer-paid leave.',
      'Special Leave Benefit for Women under Sec. 18 of R.A. 9710 (Magna Carta of Women): up to two (2) months with FULL PAY based on gross monthly compensation following gynecological surgery.',
      'Up to 30 calendar days of Special Gynecological Leave at basic pay only (excluding mandatory allowances) under DOLE D.O. 112-11, convertible to cash if unused.',
    ],
    correctIndex: 2,
    statutoryBasis: 'Sec. 18, R.A. No. 9710 (Magna Carta of Women) & DOLE D.O. No. 112-11',
    doctrinalExplanation:
      'Under Section 18 of R.A. 9710 and DOLE D.O. 112-11, any female employee who has rendered continuous aggregate employment service of at least six (6) months for the last twelve (12) months is entitled to a Special Leave Benefit of up to two (2) months WITH FULL PAY (basic salary + mandatory allowances) following surgery caused by gynecological disorders (e.g. myoma, endometriosis, ovarian cyst, hysterectomy). Note: If she instead suffered a miscarriage/EOP, she would claim 60-day Maternity Leave under R.A. 11210 (not both simultaneously for the same surgical event).',
    barTakeaway:
      'R.A. 9710 Sec. 18 = Up to 2 months FULL PAY after gynecological surgery (requires 6 mos aggregate service in last 12 mos)!',
  },
  {
    id: 'dc-11-preceding-absence-successive-holidays',
    worldId: 'holidays',
    worldLabel: 'Holidays & Preceding Day Rule',
    difficultyLabel: 'Supreme Court Doctrine Trap',
    title: 'Successive Regular Holidays (Maundy Thursday & Good Friday) Preceding Absence Trap',
    factPattern:
      'Bowser Logistics operates Monday to Saturday. Waluigi went AWOL (absent without pay) on Holy Wednesday. Compare Scenario A (he rests on both Maundy Thursday and Good Friday) against Scenario B (he works on Maundy Thursday or works 8 hours on Good Friday).',
    questionPrompt:
      'Under Omnibus Rules Book III, Rule IV, Sec. 10, state the exact holiday pay rules for successive Regular Holidays:',
    options: [
      'Holy Wednesday AWOL forfeits unworked Maundy Thursday only; because Maundy Thursday is a non-working Regular Holiday, he automatically regains 100% unworked pay for Good Friday.',
      'Holy Wednesday AWOL permanently reduces worked holiday pay on both Maundy Thursday and Good Friday from 200% down to 130% penalty holiday pay.',
      'Monthly-paid and daily-paid workers alike receive 100% unworked holiday pay for both days regardless of Holy Wednesday AWOL under Art. 94 of the Labor Code.',
      'Resting both days after Wednesday AWOL forfeits unworked pay for BOTH holidays; working Maundy Thursday (200%) restores 100% unworked pay for Good Friday, and working Good Friday always earns 200%.',
    ],
    correctIndex: 3,
    statutoryBasis: 'Book III, Rule IV, Sec. 10, Omnibus Rules Implementing the Labor Code',
    doctrinalExplanation:
      'Where there are two (2) successive regular holidays (like Maundy Thursday and Good Friday), an employee who is absent without pay on the day immediately preceding the FIRST holiday may not be paid for BOTH holidays UNLESS he works on the first holiday, in which case he is entitled to holiday pay on the second holiday! Furthermore, whenever an employee ACTUALLY WORKS on any Regular Holiday, he ALWAYS earns 200% for that worked holiday regardless of prior unpaid absence.',
    barTakeaway:
      'AWOL before 2 successive Regular Holidays = forfeits BOTH unworked; working Holiday #1 restores unworked 100% on Holiday #2!',
  },
  {
    id: 'dc-12-facilities-vs-supplements-mabeza',
    worldId: 'world3',
    worldLabel: 'World 3: Wages & Deductions',
    difficultyLabel: 'Supreme Court Doctrine Trap',
    title: 'Facilities vs. Supplements: The 3-Requisite Deductibility Test (Mabeza v. NLRC)',
    factPattern:
      'At Ghost House Inn, front-desk clerks are required to stay on premises overnight during typhoon alerts and eat meals from the hotel kitchen so they never leave the lobby unattended. Management deducts ₱120/meal and ₱150/lodging per shift from their minimum wage without any written authorization, arguing food and lodging are intrinsically "Facilities."',
    questionPrompt:
      'Are the meal and lodging deductions from the clerks’ wages legally valid?',
    options: [
      'Invalid: Under the Purpose Test, staying on-site served the hotel’s business convenience (non-deductible Supplements), and even Facilities require Custom + Written Employee Acceptance + Fair Value under Mabeza v. NLRC.',
      'Valid in part: Under DOLE meal valuation rules, Ghost House Inn may deduct up to 70% of the subsidized cost of meals without written consent, though overnight typhoon lodging is non-deductible.',
      'Valid in full: Food and lodging furnished to hotel personnel are classified ipso jure as wage-deductible Facilities under Art. 97(f) of the Labor Code without needing individual written waivers.',
      'Valid up to 20% of the employee’s weekly minimum wage pursuant to Art. 114 of the Labor Code governing hotel deposits and operational subsistence advances.',
    ],
    correctIndex: 0,
    statutoryBasis: 'Art. 97(f), Labor Code; Mabeza v. NLRC (G.R. No. 118506); Our Haus Realty v. Parian',
    doctrinalExplanation:
      'In Mabeza v. NLRC and Our Haus Realty Development Corp. v. Parian, the Supreme Court established two strict barriers: (1) Under the PURPOSE TEST, the decisive factor is not the kind of item (food/lodging) but its PURPOSE—since staying on-site served the hotel’s operational convenience, they are non-deductible SUPPLEMENTS; and (2) even if an item qualifies as a Facility, deduction from wages is illegal unless the employer proves ALL THREE requisites: customary in the trade, voluntary WRITTEN authorization by the employee, and fair/reasonable value.',
    barTakeaway:
      'Purpose Test controls Facility vs. Supplement; even Facilities require Custom + Written Employee Consent + Fair Value!',
  },
  {
    id: 'dc-13-compressed-work-week-undertime',
    worldId: 'world1',
    worldLabel: 'World 1: Hours of Work',
    difficultyLabel: 'Advanced Statutory Mastery',
    title: 'Brownouts, Undertime Offsetting (Art. 88) & Unilateral Compressed Work Week',
    factPattern:
      'On Monday, a 15-minute power brownout hit Toadstool Factory, and Captain Toad also left 30 minutes early (undertime) for a dental appointment. On Tuesday, management ordered him to work 9 hours (1 hour past his 8-hour shift), deducted the 15-minute Monday brownout, and offset his 30-minute Monday undertime against 30 minutes of Tuesday’s extra hour at straight pay.',
    questionPrompt:
      'Identify the correct statutory computation for Monday and Tuesday.',
    options: [
      'Management may validly offset Monday’s 30-minute undertime against Tuesday’s extra hour within the same weekly cutoff, but must pay the 15-minute brownout as compensable waiting time.',
      'Both the brownout deduction and undertime offset are valid under Art. 83 so long as Captain Toad’s aggregate hours for the six-day workweek do not exceed forty-eight (48) hours.',
      'Both are ILLEGAL: Brownouts ≤ 20 minutes are compensable hours worked, and Art. 88 strictly bars offsetting Monday’s 30m undertime against Tuesday’s 1-hour Overtime (+25% OT pay applies to the full hour).',
      'Art. 88 bars offsetting undertime with overtime, so Tuesday’s full hour earns +25% OT pay, but power brownouts of any duration follow the "no work, no pay" rule and are deductible.',
    ],
    correctIndex: 2,
    statutoryBasis: 'Art. 84 & Art. 88, Labor Code; Omnibus Rules Book III, Rule I, Sec. 4(d)',
    doctrinalExplanation:
      'First, power interruptions or brownouts of twenty (20) minutes or less are treated as compensable hours worked. Second, Article 88 of the Labor Code categorically mandates that undertime work on any particular day SHALL NOT BE OFFSET by overtime work on any other day (because allowing offset would deprive the worker of the +25%/+30% overtime premium!).',
    barTakeaway:
      'Brownouts ≤ 20 mins = Compensable! Art. 88 = Undertime can NEVER be offset by Overtime (even on the same day or week)!',
  },
  {
    id: 'dc-14-vawc-leave-protection-order',
    worldId: 'world6',
    worldLabel: 'World 6: Statutory Leaves',
    difficultyLabel: 'Advanced Statutory Mastery',
    title: 'R.A. 9262 VAWC Leave Extension & Proof Requirements',
    factPattern:
      'Pauline, a probationary bank teller in her 3rd month of work, suffers psychological and economic abuse from her former live-in partner. She presents a Certification from the Punong Barangay confirming a pending Barangay Protection Order (BPO) application and requests 10 days of paid VAWC Leave, followed by a 5-day extension expressly specified in the issued TPO for court hearings. The bank denies both, claiming: (a) she is still probationary (<1 year), (b) no criminal conviction exists yet, and (c) VAWC leave is strictly capped at 10 days.',
    questionPrompt:
      'Rule on all three grounds raised by the bank.',
    options: [
      'Pauline qualifies immediately without 1-year tenure upon presenting the Barangay Certification, but Sec. 43 of R.A. 9262 caps paid VAWC Leave at 10 days so the 5-day TPO extension is unpaid.',
      'All three grounds fail! Under Sec. 43 of R.A. 9262, VAWC Leave requires NO minimum tenure, a Barangay/Prosecutor/Clerk certification of a pending action suffices, and the 10-day paid leave is EXTENDIBLE as specified in the Protection Order.',
      'The bank may validly defer paid VAWC Leave until Pauline attains regular status on her 6th month, after which the 10 days and 5-day TPO extension become retroactively payable.',
      'VAWC Leave under Sec. 43 of R.A. 9262 requires a Prosecutor’s Resolution finding probable cause (a Barangay Certification alone is insufficient), though it is extendible once filed in court.',
    ],
    correctIndex: 1,
    statutoryBasis: 'Sec. 43, R.A. No. 9262 (Anti-VAWC Act of 2004)',
    doctrinalExplanation:
      'Section 43 of R.A. 9262 entitles woman-victims of VAWC (whether married, dating, or sharing a common child with the perpetrator) to up to ten (10) days paid leave in addition to other leaves, EXTENDIBLE when the necessity arises as specified in the protection order (BPO/TPO/PPO). There is NO minimum length of service requirement, and the sole documentary requirement is a certification from the Punong Barangay/Kagawad, Prosecutor, or Clerk of Court that an action is pending. Penalizing or denying her exposes the employer to liability for discrimination and contempt.',
    barTakeaway:
      'VAWC Leave (R.A. 9262 Sec. 43) = 10 days paid + EXTENDIBLE per Protection Order; ZERO tenure requirement; Barangay/Court cert suffices!',
  },
] as const;

/**
 * Deterministically picks today's Daily Challenge scenario using local calendar date YYYY-MM-DD.
 * Guarantees every student sees the same challenge on a given date and a fresh scenario every 24h!
 */
export function getDailyChallengeForDate(now: Date = new Date()): DailyChallengeScenario {
  const dayKey = formatLocalDayKey(now);
  const [y, m, d] = dayKey.split('-').map((n) => parseInt(n, 10));
  const epochDays = Math.floor(Date.UTC(y, (m || 1) - 1, d || 1) / 86_400_000);
  const idx = ((epochDays % DAILY_CHALLENGE_BANK.length) + DAILY_CHALLENGE_BANK.length) % DAILY_CHALLENGE_BANK.length;
  return DAILY_CHALLENGE_BANK[idx];
}

/**
 * Computes exact countdown until local midnight (next 24-hour Daily Challenge refresh).
 */
export function getNextDailyChallengeCountdown(now: Date = new Date()): DailyChallengeCountdown {
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );
  const diffMs = Math.max(0, nextMidnight.getTime() - now.getTime());
  const totalSecondsRemaining = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSecondsRemaining / 3600);
  const minutes = Math.floor((totalSecondsRemaining % 3600) / 60);
  const seconds = totalSecondsRemaining % 60;

  const formatted = [hours, minutes, seconds]
    .map((v) => String(v).padStart(2, '0'))
    .join(':');

  return {
    hours,
    minutes,
    seconds,
    totalSecondsRemaining,
    formatted,
  };
}

/**
 * Loads persistent Daily Challenge progress, automatically resetting completion status
 * whenever the local calendar date YYYY-MM-DD advances to a new 24h cycle while preserving
 * lifetime `totalSolvedCount`.
 */
export function loadDailyChallengeState(
  storage?: StorageLike | null,
  now: Date = new Date()
): DailyChallengeRecord {
  const todayKey = formatLocalDayKey(now);
  const todayScenario = getDailyChallengeForDate(now);

  const freshDefault: DailyChallengeRecord = {
    dateKey: todayKey,
    challengeId: todayScenario.id,
    completed: false,
    selectedOptionIndex: null,
    isCorrect: false,
    coinsAwarded: 0,
    completedAtIso: null,
    totalSolvedCount: 0,
  };

  if (!storage) return freshDefault;

  try {
    const raw = storage.getItem(DAILY_CHALLENGE_STORAGE_KEY);
    if (!raw) return freshDefault;
    const parsed = JSON.parse(raw) as Partial<DailyChallengeRecord>;
    const lifetimeSolved =
      typeof parsed.totalSolvedCount === 'number' && parsed.totalSolvedCount >= 0
        ? parsed.totalSolvedCount
        : 0;

    if (parsed.dateKey === todayKey && parsed.completed) {
      return {
        dateKey: todayKey,
        challengeId: parsed.challengeId || todayScenario.id,
        completed: true,
        selectedOptionIndex:
          typeof parsed.selectedOptionIndex === 'number' ? parsed.selectedOptionIndex : null,
        isCorrect: Boolean(parsed.isCorrect),
        coinsAwarded: typeof parsed.coinsAwarded === 'number' ? parsed.coinsAwarded : 0,
        completedAtIso: parsed.completedAtIso || null,
        totalSolvedCount: lifetimeSolved,
      };
    }

    // New 24-hour calendar day -> unlock fresh Daily Challenge while keeping lifetime solved counter!
    return {
      ...freshDefault,
      totalSolvedCount: lifetimeSolved,
    };
  } catch {
    return freshDefault;
  }
}

/**
 * Submits an answer for today's Daily Challenge (idempotent within the same 24h dateKey).
 * Returns the updated persistent record and base coins to grant (caller passes through Super Star 2x multiplier if active).
 */
export function submitDailyChallengeAnswer(
  storage: StorageLike | null | undefined,
  selectedOptionIndex: number,
  now: Date = new Date()
): {
  record: DailyChallengeRecord;
  scenario: DailyChallengeScenario;
  baseCoinsEarned: number;
  alreadyCompletedToday: boolean;
} {
  const current = loadDailyChallengeState(storage, now);
  const scenario = getDailyChallengeForDate(now);

  if (current.completed) {
    return {
      record: current,
      scenario,
      baseCoinsEarned: 0,
      alreadyCompletedToday: true,
    };
  }

  const isCorrect = selectedOptionIndex === scenario.correctIndex;
  const baseCoinsEarned = isCorrect
    ? DAILY_CHALLENGE_BASE_COINS
    : DAILY_CHALLENGE_REVIEW_COINS;

  const updated: DailyChallengeRecord = {
    dateKey: formatLocalDayKey(now),
    challengeId: scenario.id,
    completed: true,
    selectedOptionIndex,
    isCorrect,
    coinsAwarded: baseCoinsEarned,
    completedAtIso: now.toISOString(),
    totalSolvedCount: current.totalSolvedCount + (isCorrect ? 1 : 0),
  };

  if (storage) {
    try {
      storage.setItem(DAILY_CHALLENGE_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage quota errors
    }
  }

  return {
    record: updated,
    scenario,
    baseCoinsEarned,
    alreadyCompletedToday: false,
  };
}
