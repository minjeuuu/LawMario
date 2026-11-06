import React, { useState, useCallback, useEffect } from 'react';
import { MarioAvatar } from '../types/laborLaw';
import {
  MarioCharacterAvatar,
  MarioCoinIcon,
  MarioStarIcon,
  MarioMushroomIcon,
  MarioFlagIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';
import { drawUniqueFromDeck, shuffleChoiceOptions } from '../utils/gameQuestionDeck';
import { QuizCompletionPayload } from '../utils/profileAchievements';
import { MasterArcadeScenario } from './MasterVaultGames';
import {
  Compass,
  Sun,
  ShieldAlert,
  Music,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Heart,
  Play,
  ArrowRight,
  AlertTriangle,
  Pickaxe,
  Flag,
  Skull,
  Flame,
  Lock,
  Unlock,
  Zap,
  Gauge,
  Sparkles,
  Trophy,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { awardUserXp } from '../utils/levelProgressionService';

export interface RoyalVaultGameProps {
  equippedAvatar: MarioAvatar;
  onEarnCoins?: (amount: number) => void;
  onQuizCompleted?: (payload: QuizCompletionPayload) => void;
}

export const CAPTAIN_TOAD_MINECART_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'ct1',
    worldCode: 'w4',
    headline: 'Kasambahay Minimum Rest Period',
    prompt: 'Under R.A. 10361 (Batas Kasambahay), what is the mandatory daily aggregate rest period for a domestic worker?',
    options: [
      'At least 8 hours per day',
      'At least 6 hours per day',
      'At least 10 hours per day',
      'At least 12 hours per day',
    ],
    correctIndex: 0,
    statute: 'Sec. 20, R.A. 10361',
    explanation: 'Every domestic worker is entitled to an aggregate daily rest period of at least eight (8) hours per day, plus at least 24 consecutive hours of weekly rest.',
  },
  {
    id: 'ct2',
    worldCode: 'w4',
    headline: 'Kasambahay 5-Day Service Incentive Leave',
    prompt: 'After rendering 1 year of service, is a Kasambahay’s unused 5-day Service Incentive Leave (SIL) convertible to cash?',
    options: [
      'No — Kasambahay SIL is non-cumulative and strictly non-convertible to cash under Sec. 29',
      'Yes — Kasambahay SIL is convertible to cash on December 24 together with 13th month pay',
      'Yes — Kasambahay SIL accumulates indefinitely up to a statutory ceiling of fifteen (15) days',
      'Kasambahays enjoy no statutory incentive leave entitlement under Republic Act No. 10361'
    ],
    correctIndex: 0,
    statute: 'Sec. 29, R.A. 10361',
    explanation: 'Unlike ordinary Book III workers whose unused SIL is commutable to cash, a Kasambahay’s 5-day SIL shall not be accumulated nor carried over and is not convertible to cash.',
  },
  {
    id: 'ct3',
    worldCode: 'w4',
    headline: 'Child Labor Below 15 Years Old',
    prompt: 'Under R.A. 9231, what is the maximum work schedule allowed for a child below 15 years old working under a valid DOLE permit in public entertainment?',
    options: [
      'Not more than 4 hours/day and 20 hours/week; strictly no work between 8:00 PM and 6:00 AM',
      'Not more than 8 hours/day and 40 hours/week; strictly no work between 10:00 PM and 6:00 AM',
      'Not more than 6 hours/day and 30 hours/week; strictly no work between 9:00 PM and 5:00 AM',
      'Unlimited hours permitted provided the child is accompanied on set by a biological parent'
    ],
    correctIndex: 0,
    statute: 'Sec. 3, R.A. 9231',
    explanation: 'A child below 15 may work max 4 hours/day and max 20 hours/week, and never between 8:00 PM and 6:00 AM.',
  },
  {
    id: 'ct4',
    worldCode: 'w4',
    headline: 'PWD Tax Incentive vs Wage Rate',
    prompt: 'Under R.A. 7277 (Magna Carta for Persons with Disability), how much minimum wage must a qualified PWD employee receive compared to an able-bodied worker?',
    options: [
      '100% of the applicable statutory minimum wage under the Equal Opportunity principle',
      '75% of the applicable minimum wage matching the statutory learner and apprentice rate',
      '80% of the applicable minimum wage under specialized vocational rehabilitation rules',
      '50% of the applicable minimum wage with the remaining half directly subsidized by DSWD'
    ],
    correctIndex: 0,
    statute: 'Sec. 5, R.A. 7277',
    explanation: 'A qualified disabled employee shall be subject to the same terms and conditions of employment and the same 100% compensation, privileges, and benefits as a qualified able-bodied person.',
  },
  {
    id: 'ct5',
    worldCode: 'w4',
    headline: 'Telecommuting Parity Principle',
    prompt: 'Under R.A. 11165 (Telecommuting Act), are work-from-home employees entitled to Overtime Pay and Night Shift Differential?',
    options: [
      'Yes — under Fair Treatment standard, telecommuters enjoy full statutory OT and NSD parity',
      'No — telecommuters are classified as field personnel excluded from Title I under Art. 82',
      'Only if their registered home office address is located within five kilometers of headquarters',
      'Entitled only to statutory Overtime pay and strictly excluded from Night Shift Differential'
    ],
    correctIndex: 0,
    statute: 'Sec. 5, R.A. 11165 & D.O. 237-22',
    explanation: 'Telecommuting employees are not field personnel; their hours are verifiable via digital logs and they receive full parity in OT, NSD, and holiday pay.',
  },
  {
    id: 'ct6',
    worldCode: 'w4',
    headline: 'Apprenticeship vs Learnership Duration',
    prompt: 'What is the maximum statutory duration of a Learnership agreement compared to a standard Apprenticeship?',
    options: [
      'Learnership: max 3 months; Apprenticeship: more than 3 months (typically up to 6 months)',
      'Learnership: max 12 months; Apprenticeship: up to 24 months for all technical engineering lines',
      'Both training arrangements are capped at a strict uniform statutory duration of sixty (60) days',
      'Learnership: max 6 months; Apprenticeship: max 3 months for semi-skilled industrial trades'
    ],
    correctIndex: 0,
    statute: 'Arts. 58 & 75, Labor Code',
    explanation: 'Learnership covers semi-skilled non-apprenticeable occupations for not more than 3 months (75% min wage), with mandatory regularization commitment if retained.',
  },
  {
    id: 'ct7',
    worldCode: 'w4',
    headline: 'Youth Employment (15–17 Years Old) Schedule Cap',
    prompt: 'Under R.A. 9231, what is the statutory maximum working schedule and nighttime window for adolescents aged 15 to below 18 years old?',
    options: [
      'Not more than 8 hours/day and 40 hours/week; prohibited from working between 10:00 PM and 6:00 AM',
      'Not more than 6 hours/day and 30 hours/week; prohibited from working between 8:00 PM and 6:00 AM',
      'Standard 48 hours/week with zero nighttime restrictions if paid applicable night differential',
      'Maximum 4 hours/day and 20 hours/week matching the statutory ceiling for children below 15'
    ],
    correctIndex: 0,
    statute: 'Sec. 3, R.A. 9231',
    explanation: 'Youth aged 15 to below 18 may work not more than 8 hours/day and 40 hours/week, and are strictly prohibited from working between 10:00 PM and 6:00 AM, in non-hazardous work only.',
  },
  {
    id: 'ct8',
    worldCode: 'w4',
    headline: 'Night Worker Mandatory Health Assessment',
    prompt: 'Under R.A. 10151 (Nightworkers Act), when is an employer required to provide night workers with a free health assessment without cost?',
    options: [
      'Before taking up assignment as a night worker and at regular intervals during employment',
      'Only after the employee files a formal social security medical claim for chronic sickness',
      'Only if formally requested in writing by the certified collective bargaining representative',
      'Only once during pre-employment medical examinations and never required during assignment'
    ],
    correctIndex: 0,
    statute: 'Art. 156 [154], Labor Code (R.A. 10151)',
    explanation: 'At their request, workers have the right to undergo a free health assessment without charge prior to assignment and at regular intervals to verify fitness for night work.',
  },
  {
    id: 'ct9',
    worldCode: 'w4',
    headline: 'Kasambahay Mandatory SSS, PhilHealth & Pag-IBIG',
    prompt: 'Under R.A. 10361, who pays the SSS, PhilHealth, and Pag-IBIG monthly contributions of a Kasambahay receiving less than PHP 5,000 per month?',
    options: [
      'The employer shoulders 100% of all contributions without any salary deduction from wage',
      'Split fifty-fifty between Kasambahay and household employer under standard SSS schedules',
      'Subsidized one hundred percent by the local barangay government through social funds',
      'Kasambahays receiving under five thousand pesos are completely exempt from SSS coverage'
    ],
    correctIndex: 0,
    statute: 'Sec. 30, R.A. 10361',
    explanation: 'If a Kasambahay receives less than PHP 5,000/month, the employer must pay 100% of SSS, PhilHealth, and Pag-IBIG contributions with zero deduction from the worker’s wage.',
  },
  {
    id: 'ct10',
    worldCode: 'w4',
    headline: 'Women Night Work Repeal by R.A. 10151',
    prompt: 'Did R.A. 10151 retain the old blanket prohibition against women working at night in industrial and commercial undertakings?',
    options: [
      'No — R.A. 10151 repealed the blanket ban; women can work night shifts with proper safeguards',
      'Yes — women remain completely barred from night work in commercial and industrial trades',
      'Only women who secure a written notarized marital consent waiver may work graveyard hours',
      'Night work is prohibited only for unmarried female employees residing outside city limits'
    ],
    correctIndex: 0,
    statute: 'R.A. 10151 (repealing Arts. 130–131)',
    explanation: 'R.A. 10151 repealed the discriminatory blanket prohibition against night work for women, replacing it with universal health, safety, transport, and maternity protections for all nightworkers.',
  },
  {
    id: 'ct11',
    worldCode: 'w4',
    headline: 'Learnership Mandatory Regularization Ratio',
    prompt: 'Under Art. 75 of the Labor Code, what hiring obligation rests upon an employer who trains learners upon completion of the 3-month program?',
    options: [
      'Obligation to hire at least 50% of the learners as regular employees upon completion',
      'No obligation to hire any learners, as learnerships are strictly vocational training programs',
      'Obligation to hire 100% of all enrolled learners or face immediate revocation of business license',
      'Obligation to renew the learnership contract for another six months at seventy-five percent wage'
    ],
    correctIndex: 0,
    statute: 'Art. 75(c), Labor Code',
    explanation: 'Learnership agreements must include a commitment to employ the learners if they so desire, as regular employees upon completion of learnership, with at least 50% retained.',
  },
  {
    id: 'ct12',
    worldCode: 'w4',
    headline: 'Industrial Homeworker Subcontractor Liability',
    prompt: 'Under D.O. No. 05 (Series of 1992), if a subcontractor fails to pay wages to homeworkers, what is the statutory liability of the principal employer?',
    options: [
      'Solidarily liable with the subcontractor for payment of wages to the industrial homeworkers',
      'Subsidiarily liable only up to twenty-five percent of the unpaid wages claimed by homeworkers',
      'Zero legal liability because industrial homework represents an independent civil contractor setup',
      'Liable only for administrative regulatory fines, without obligation for unpaid wage claims'
    ],
    correctIndex: 0,
    statute: 'Book III, Rule XIV Sec. 7 & Art. 106',
    explanation: 'The employer is solidarily liable with the contractor/subcontractor for any unpaid wage claims of homeworkers.',
  },
];

export const DAISY_HOLIDAY_DERBY_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'dh1',
    worldCode: 'holidays',
    headline: 'Unworked Regular Holiday Rate',
    prompt: 'Daisy did not report for work on National Heroes Day (Regular Holiday), and she was present on the workday immediately preceding it. What pay does she receive?',
    options: [
      '100% of her regular daily wage',
      'No work, no pay (0%)',
      '200% of her regular daily wage',
      '130% of her regular daily wage',
    ],
    correctIndex: 0,
    statute: 'Art. 94, Labor Code',
    explanation: 'Covered employees receive 100% of their regular daily wage even if unworked on a Regular Holiday, subject to the preceding-day presence/paid-leave rule.',
  },
  {
    id: 'dh2',
    worldCode: 'holidays',
    headline: 'Double Regular Holiday (Worked)',
    prompt: 'Araw ng Kagitingan and Maundy Thursday fell on the exact same calendar day, and Luigi worked 8 hours. What is his statutory pay rate?',
    options: [
      '300% of his regular daily wage',
      '200% of his regular daily wage',
      '400% of his regular daily wage',
      '260% of his regular daily wage',
    ],
    correctIndex: 0,
    statute: 'DOLE Handbook on Workers’ Statutory Monetary Benefits',
    explanation: 'On a Double Regular Holiday, an unworked employee receives 200%, and if worked for the first 8 hours, the employee receives 300% (390% if also on Rest Day!).',
  },
  {
    id: 'dh3',
    worldCode: 'holidays',
    headline: 'Special Non-Working Day (Unworked)',
    prompt: 'Unless there is a favorable company practice or CBA, what rule governs an unworked Special (Non-Working) Day like Ninoy Aquino Day?',
    options: [
      '“No work, no pay” principle applies (0% extra pay if unworked)',
      'Full 100% daily basic wage is paid even when unworked',
      'Half-day 50% guaranteed standby wage credited automatically',
      'Premium 130% holiday rate credited without actual reporting',
    ],
    correctIndex: 0,
    statute: 'Art. 93 & DOLE Handbook',
    explanation: 'Special Non-Working Days follow the “no work, no pay” rule unless a company policy, practice, or CBA grants payment.',
  },
  {
    id: 'dh4',
    worldCode: 'holidays',
    headline: 'Special Non-Working Day Falling on Rest Day',
    prompt: 'Peach worked 8 hours on All Saints’ Day (Special Non-Working Day), which also happened to be her scheduled Sunday Rest Day. What rate applies?',
    options: [
      '150% of regular daily wage',
      '130% of regular daily wage',
      '200% of regular daily wage',
      '260% of regular daily wage',
    ],
    correctIndex: 0,
    statute: 'Art. 93(c), Labor Code',
    explanation: 'Work performed on a Special Non-Working Day = 130%, and when it also falls on the employee’s scheduled Rest Day, the rate rises to 150%.',
  },
  {
    id: 'dh5',
    worldCode: 'holidays',
    headline: 'Successive Regular Holidays Absence Trap',
    prompt: 'Maundy Thursday and Good Friday are successive Regular Holidays. Toad was absent WITHOUT pay on Wednesday, did not work Thursday, but WORKED on Good Friday. Which holiday pay does he get?',
    options: [
      'Entitled to holiday pay for Good Friday because he worked, though disqualified for Thursday',
      'Forfeits holiday pay for BOTH Thursday and Friday due to unexcused absence on Wednesday',
      'Gets 100% holiday pay for both Thursday and Friday under the automatic statutory grant',
      'Gets 50% penalty rate on Friday because he failed to report for work on Maundy Thursday'
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule IV Sec. 10',
    explanation: 'Where there are two successive regular holidays, an employee absent without pay on the preceding day is not paid if absent on both holidays, EXCEPT if they work on the first holiday or actually work on the second holiday (earning holiday pay for the worked holiday).',
  },
  {
    id: 'dh6',
    worldCode: 'holidays',
    headline: 'Retail Store With 8 Regular Workers',
    prompt: 'A bakery regularly employs 8 workers in total. Are its bakers statutorily entitled to Art. 94 Regular Holiday Pay?',
    options: [
      'No — retail and service establishments employing less than 10 workers are exempt from Holiday Pay',
      'Yes — only retail and service establishments employing five or fewer workers are exempt from Holiday Pay',
      'Yes — commercial bakeries are classified as heavy industrial manufacturing enterprises under DOLE rules',
      'Exempt from all national holidays except Christmas Day and New Year\'s Day under regional wage rules'
    ],
    correctIndex: 0,
    statute: 'Art. 94(a), Labor Code',
    explanation: 'Art. 94 explicitly exempts retail and service establishments regularly employing less than ten (10) workers from statutory Holiday Pay.',
  },
  {
    id: 'dh7',
    worldCode: 'holidays',
    headline: 'Regular Holiday Falling on Scheduled Rest Day',
    prompt: 'Mario worked 8 hours on Labor Day (Regular Holiday), which also coincided with his scheduled Rest Day. What total rate does he receive?',
    options: [
      '260% of regular daily wage (200% holiday base + 30% rest day premium on 200%)',
      '200% of regular daily wage (standard regular holiday rate without rest day addition)',
      '230% of regular daily wage (200% holiday rate plus 30% additive regular rest day rate)',
      '300% of regular daily wage (double holiday rate applied to rest day work schedules)'
    ],
    correctIndex: 0,
    statute: 'Art. 93(d) & DOLE Handbook',
    explanation: 'Work performed on a Regular Holiday that falls on the employee’s scheduled Rest Day is compensated at 200% + 30% of 200% = 260% of daily wage for the first 8 hours.',
  },
  {
    id: 'dh8',
    worldCode: 'holidays',
    headline: 'Overtime Beyond 8 Hours on Regular Holiday',
    prompt: 'Peach worked 10 hours on Independence Day (Regular Holiday, ordinary work day). What hourly multiplier applies to the 2 overtime hours?',
    options: [
      '260% of basic hourly rate (200% regular holiday rate × 1.30 OT rate)',
      '200% of basic hourly rate (standard unextended regular holiday rate)',
      '169% of basic hourly rate (130% special holiday rate × 1.30 OT rate)',
      '300% of basic hourly rate (300% double regular holiday base rate)',
    ],
    correctIndex: 0,
    statute: 'Art. 87 & Art. 94, Labor Code',
    explanation: 'Holiday hourly rate is 200% of basic; overtime adds +30% of the holiday rate, yielding 200% × 1.30 = 260% for excess hours.',
  },
  {
    id: 'dh9',
    worldCode: 'holidays',
    headline: 'Night Shift Differential on Special Holiday Rest Day',
    prompt: 'Luigi worked from 10:00 PM to 6:00 AM on All Saints’ Day (Special Holiday) which was also his Rest Day. How is his Night Shift Differential (NSD) computed?',
    options: [
      'Additional 10% on top of his Special Holiday Rest Day rate (150% × 1.10 = 165%)',
      'Flat 10% premium computed solely from basic hourly wage rate (100% × 1.10 = 110%)',
      'No night shift differential is legally mandated for special non-working days',
      'Flat 200% holiday rate replaces and extinguishes all night differential claims',
    ],
    correctIndex: 0,
    statute: 'Art. 86 & Omnibus Rules Book III Rule II',
    explanation: 'Night Shift Differential is at least 10% of the regular wage for each hour worked between 10:00 PM and 6:00 AM, calculated on top of the applicable day rate (150% × 1.10 = 165%).',
  },
  {
    id: 'dh10',
    worldCode: 'holidays',
    headline: 'Faculty and Academic Holiday Pay in Semestral Breaks',
    prompt: 'Are regular full-time university professors paid holiday pay during semestral and Christmas academic breaks?',
    options: [
      'Yes — regular full-time faculty on monthly salaries receive holiday pay during breaks',
      'No — academic semestral breaks are automatically treated as unpaid no-work off-periods',
      'Only if make-up remedial lectures or online classes are conducted during the holiday',
      'Entitled strictly to 50% half-pay unless university CBA mandates full disbursement',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule IV Sec. 8',
    explanation: 'Regular faculty members who are paid monthly or on annual contract are entitled to holiday pay during semestral and Christmas breaks when no classes are scheduled.',
  },
  {
    id: 'dh11',
    worldCode: 'holidays',
    headline: 'Special Non-Working Day Overtime Multiplier',
    prompt: 'Toad worked 10 hours on Ninoy Aquino Day (Special Non-Working Day, ordinary work day). What rate applies to hours 9 and 10?',
    options: [
      '169% of hourly rate (130% special day base rate × 1.30 overtime multiplier)',
      '130% of hourly rate (standard special day rate without overtime multiplier)',
      '150% of hourly rate (special holiday falling on scheduled weekly rest day)',
      '200% of hourly rate (unworked or standard regular national legal holiday)',
    ],
    correctIndex: 0,
    statute: 'Art. 87 & Art. 93, Labor Code',
    explanation: 'First 8 hours on a Special Day = 130%; overtime beyond 8 hours adds 30% of that day’s hourly rate: 130% × 1.30 = 169%.',
  },
  {
    id: 'dh12',
    worldCode: 'holidays',
    headline: 'Field Personnel Exclusion from Holiday Standards',
    prompt: 'A pharmaceutical medical representative travels independently across rural provinces without supervision or fixed hours. Is he entitled to statutory Holiday Pay?',
    options: [
      'No — true field personnel whose actual hours cannot be determined are exempt from Art. 94',
      'Yes — pharmaceutical sales representatives are classified as regular factory work staff',
      'Yes — all private sector employees receive holiday pay irrespective of task supervision',
      'Entitled strictly to 50% prorated holiday compensation under DOLE commercial standards',
    ],
    correctIndex: 0,
    statute: 'Art. 82 & Auto Bus Transport Systems v. Bautista',
    explanation: 'Employees whose time and performance are unsupervised and who work away from the employer’s premises are field personnel exempt from statutory holiday pay.',
  },
];

export const DRY_BONES_CRYPT_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'db1',
    worldCode: 'w5',
    headline: 'Money Claims Prescriptive Period',
    prompt: 'Within how many years from accrual of the cause of action must pure money claims arising from employer-employee relations be filed?',
    options: [
      'Three (3) years from accrual under Article 306',
      'Four (4) years from breach under Article 1146',
      'One (1) year from incident under Article 305',
      'Ten (10) years from breach under Article 1144',
    ],
    correctIndex: 0,
    statute: 'Art. 306 [291], Labor Code',
    explanation: 'All money claims arising from employer-employee relations accruing during the effectivity of the Labor Code shall be filed within three (3) years from the time the cause of action accrued.',
  },
  {
    id: 'db2',
    worldCode: 'w5',
    headline: 'Illegal Dismissal Prescriptive Period',
    prompt: 'Under Art. 1146 of the Civil Code and Supreme Court jurisprudence (Callanta v. Carnation), what is the prescriptive period to file an Illegal Dismissal complaint?',
    options: [
      'Four (4) years as an injury to plaintiff’s security of tenure rights',
      'Three (3) years under Article 306 general labor code money provisions',
      'One (1) year analogous to Article 305 unfair labor practice actions',
      'Ten (10) years based on breach of a written bilateral labor contract',
    ],
    correctIndex: 0,
    statute: 'Art. 1146, Civil Code',
    explanation: 'Illegal dismissal is an injury to one’s constitutional/statutory right to security of tenure and prescribes in four (4) years.',
  },
  {
    id: 'db3',
    worldCode: 'w5',
    headline: 'Unfair Labor Practice (ULP) Prescription',
    prompt: 'Within what period must an Unfair Labor Practice (ULP) complaint be filed?',
    options: [
      'One (1) year from the date of accrual under Article 305',
      'Three (3) years from accrual under Article 306 standards',
      'Six (6) months from issuance of the management directive',
      'Thirty (30) days from exhaustion of grievance machinery',
    ],
    correctIndex: 0,
    statute: 'Art. 305 [290], Labor Code',
    explanation: 'All unfair labor practices arising from Book V shall be filed within one (1) year from accrual; otherwise they shall be forever barred.',
  },
  {
    id: 'db4',
    worldCode: 'w5',
    headline: 'King of Kings Transport 5-Day NTE Rule',
    prompt: 'Under the Twin-Notice Rule for Just Cause termination, how many calendar days must an employee be given to submit a written explanation after the First Notice (NTE)?',
    options: [
      'At least five (5) calendar days',
      '24 hours is always sufficient',
      'At least thirty (30) calendar days',
      'At least fifteen (15) working days',
    ],
    correctIndex: 0,
    statute: 'King of Kings Transport v. Mamac & D.O. 147-15',
    explanation: '“Reasonable opportunity” in the First Notice means a period of at least five (5) calendar days from receipt of notice to prepare a written defense.',
  },
  {
    id: 'db5',
    worldCode: 'w5',
    headline: 'Authorized Cause 30-Day Dual Notice',
    prompt: 'When terminating employees due to Redundancy or Retrenchment (Art. 298), whom must the employer serve written notice upon, and when?',
    options: [
      'Both the affected workers AND DOLE at least 30 days (1 month) before intended date',
      'Only the certified Union President at least five calendar days before termination date',
      'Only the DOLE Regional Office within fifteen calendar days after employee separation',
      'Verbal townhall announcement is legally sufficient provided separation pay is disbursed'
    ],
    correctIndex: 0,
    statute: 'Art. 298 [283], Labor Code',
    explanation: 'Authorized cause termination requires written notice to BOTH the employee and the DOLE Regional Office at least one (1) month prior to the effective date.',
  },
  {
    id: 'db6',
    worldCode: 'w5',
    headline: 'Bona Fide Suspension / Floating Status Cap',
    prompt: 'Under Art. 301 [286], what is the maximum period of bona fide suspension of operations or security guard “floating status” before constructive dismissal sets in?',
    options: [
      'Period not exceeding six (6) months',
      'Period not exceeding three (3) months',
      'Period not exceeding one (1) year',
      'Period not exceeding ninety (90) days',
    ],
    correctIndex: 0,
    statute: 'Art. 301 [286], Labor Code',
    explanation: 'Bona fide suspension of business operations or off-detail status shall not exceed six (6) months; beyond 6 months without recall or valid separation, constructive dismissal attaches.',
  },
  {
    id: 'db7',
    worldCode: 'w5',
    headline: 'Agabon Doctrine: Just Cause Dismissal Without Procedural Due Process',
    prompt: 'Under the landmark Agabon v. NLRC doctrine, if an employee was dismissed for a valid Just Cause (e.g. serious misconduct) but the employer failed to observe the twin-notice procedure, what is the legal consequence?',
    options: [
      'Dismissal is upheld as valid, but employer pays nominal damages (standard PHP 30,000)',
      'Dismissal is voided as illegal, ordering full reinstatement with backwages from dismissal',
      'Employee receives full separation pay plus one year guaranteed backwages compensation',
      'Employer faces automatic criminal prosecution and permanent revocation of DOLE license',
    ],
    correctIndex: 0,
    statute: 'Agabon v. NLRC, G.R. No. 158693 (2004)',
    explanation: 'Where dismissal is for just cause but lacks procedural due process, dismissal remains valid, but employer is liable for nominal damages (traditionally PHP 30,000 for just cause).',
  },
  {
    id: 'db8',
    worldCode: 'w5',
    headline: 'Jaka Investments Doctrine: Authorized Cause Without 30-Day Notice',
    prompt: 'Under Jaka Investments Corp. v. Paco, if an employee is retrenched for a valid Authorized Cause but without written notice to DOLE or the employee, how much nominal damages attach?',
    options: [
      'PHP 50,000 nominal damages (higher sanction because authorized cause is employer-driven)',
      'PHP 30,000 nominal damages (identical sanction to just cause violations under Agabon)',
      'PHP 100,000 exemplary damages (penal sanction for wilful violation of labor standards)',
      'Zero damages provided statutory retrenchment separation pay is tendered within 30 days',
    ],
    correctIndex: 0,
    statute: 'Jaka Investments Corp. v. Paco, G.R. No. 141322 (2005)',
    explanation: 'Authorized causes without statutory 30-day notice warrant a higher nominal damage sanction of PHP 50,000 because dismissal is initiated for business convenience rather than employee fault.',
  },
  {
    id: 'db9',
    worldCode: 'w5',
    headline: 'Preventive Suspension 30-Day Statutory Cap',
    prompt: 'What is the absolute maximum duration an employee may be placed under preventive suspension during investigation before the employer must reinstate them to actual work or payroll?',
    options: [
      'Not more than thirty (30) calendar days; thereafter mandatory payroll reinstatement applies',
      'Up to sixty (60) calendar days provided formal extension is approved by DOLE Regional Director',
      'Up to ninety (90) calendar days if complex independent forensic accounting audits are pending',
      'Ten (10) working days maximum with automatic entitlement to immediate emergency separation pay',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book V Rule XXIII Sec. 8–9',
    explanation: 'Preventive suspension cannot exceed 30 days. If extended beyond 30 days, the employer must reinstate the employee to their former position or in payroll reinstatement.',
  },
  {
    id: 'db10',
    worldCode: 'w5',
    headline: 'Employee Resignation 30-Day Written Notice Requirement',
    prompt: 'Under Art. 300 [285], how much advance written notice must an employee serve upon the employer when resigning without just cause?',
    options: [
      'At least one (1) month (30 days) written notice in advance; otherwise liable for damages',
      'At least fifteen (15) working days with written clearance from direct unit supervisor',
      'Zero notice — Philippine Constitution guarantees absolute freedom against forced labor',
      'Forty-five (45) calendar days for supervisory and confidential managerial personnel',
    ],
    correctIndex: 0,
    statute: 'Art. 300 [285], Labor Code',
    explanation: 'An employee may terminate without just cause the employee-employer relationship by serving written notice on the employer at least one (1) month in advance.',
  },
  {
    id: 'db11',
    worldCode: 'w5',
    headline: 'Elements of Valid Retrenchment (SGS Doctrine)',
    prompt: 'Which of the following is an indispensable substantive requirement for a valid Retrenchment to Prevent Losses under Art. 298?',
    options: [
      'Substantial losses proven by independent audited financial statements, reasonably preventing harm',
      'Anticipated financial losses merely alleged by human resource executives in internal memos',
      'Sworn affidavit of in-house company accountant without audited comparative balance sheets',
      'Prior written clearance certificate obtained from the DOLE Regional Director upon notice',
    ],
    correctIndex: 0,
    statute: 'Art. 298 & Manatad v. Philippine Telegraph and Telephone Co.',
    explanation: 'Retrenchment losses must be substantial, serious, actual or reasonably imminent, and proven by independent audited financial statements, not mere self-serving declarations.',
  },
  {
    id: 'db12',
    worldCode: 'w5',
    headline: 'Totality of Infractions Doctrine',
    prompt: 'Can previous offenses for which an employee was already reprimanded or suspended be considered in determining the penalty for a new infraction?',
    options: [
      'Yes — under Totality of Infractions doctrine, entire record is examined when imposing penalty',
      'No — constitutional double jeopardy strictly bars employer review of previously closed infractions',
      'Only if all past offenses occurred within the preceding thirty (30) consecutive calendar days',
      'Only for managerial confidential staff with fiduciary trust, never rank-and-file workers',
    ],
    correctIndex: 0,
    statute: 'Villanueva v. NLRC & Sy v. Neat, Inc.',
    explanation: 'The Totality of Infractions doctrine allows the employer to consider previous offenses in determining the penalty for subsequent infractions, as habitual disregard of rules justifies termination.',
  },
];

export const PAULINE_WAGE_CONCERT_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'pw1',
    worldCode: 'w3',
    headline: '100% Service Charges Distribution',
    prompt: 'Under R.A. 11360 (amending Art. 96), what percentage of collected service charges in hotels and restaurants belongs to covered employees?',
    options: [
      '100% distributed completely and equally among covered rank-and-file and supervisory workers',
      '85% distributed to rank-and-file employees and 15% retained by management for breakages',
      '90% distributed to covered service employees and 10% retained for administrative expenses',
      '50% divided equally between operational floor staff and restaurant management executives'
    ],
    correctIndex: 0,
    statute: 'R.A. 11360 (Art. 96, Labor Code)',
    explanation: 'R.A. 11360 abolished management’s old 15% share; 100% of service charges must be distributed completely and equally among covered employees (excluding managerial employees).',
  },
  {
    id: 'pw2',
    worldCode: 'w3',
    headline: '13th Month Pay Deadline & Formula',
    prompt: 'Under P.D. 851, what is the statutory formula and mandatory payout deadline for 13th Month Pay?',
    options: [
      'At least 1/12 of total basic salary earned in calendar year, paid on or before December 24',
      'One full gross monthly salary including overtime and allowances, paid on or before Dec 31',
      '1/12 of gross earnings restricted strictly to regular workers having full one-year tenure',
      'Discretionary Christmas bonus subject to employer profitability and executive approval',
    ],
    correctIndex: 0,
    statute: 'P.D. 851 & Revised Guidelines',
    explanation: 'Rank-and-file employees who worked at least 1 month during the calendar year are entitled to 1/12 of total basic salary earned, payable on or before December 24.',
  },
  {
    id: 'pw3',
    worldCode: 'w3',
    headline: 'Prohibition Against Payment by Chits or Coupons',
    prompt: 'A plantation pays workers 70% in Philippine Pesos and 30% in company store grocery vouchers, claiming workers requested it. Is this valid?',
    options: [
      'Void and criminal — wages must be paid strictly in legal tender even if requested',
      'Valid because seventy percent was paid in lawful Philippine currency through regular payroll',
      'Valid provided the employees executed individual notarized requests witnessed by the union',
      'Valid for registered agricultural plantations under specialized agrarian reform exemptions'
    ],
    correctIndex: 0,
    statute: 'Art. 102, Labor Code',
    explanation: 'Art. 102 strictly prohibits paying wages via promissory notes, vouchers, coupons, tokens, or chits, even when expressly requested by the employee!',
  },
  {
    id: 'pw4',
    worldCode: 'w3',
    headline: 'Facilities vs. Supplements (Mabeza / SLL Doctrine)',
    prompt: 'What is the controlling legal test used by the Supreme Court to determine whether board/lodging is a deductible “Facility” or a non-deductible “Supplement”?',
    options: [
      'Purpose Test — whether primarily for employee benefit (Facility) or employer convenience',
      'Monetary Value Test — any benefit exceeding five hundred pesos is classified as a Facility',
      'Location Test — whether the benefit or lodging is utilized inside or outside company premises',
      'Tenure Test — whether the benefit is granted exclusively to regularized tenured employees'
    ],
    correctIndex: 0,
    statute: 'SLL International Cables Specialist v. NLRC',
    explanation: 'Under the Purpose Test, distinction rests not on kind but on purpose: Facilities benefit the worker/family (requiring Voluntary Acceptance + Fair Value + Customary proof to deduct), whereas Supplements benefit employer convenience and are never deductible.',
  },
  {
    id: 'pw5',
    worldCode: 'w3',
    headline: 'D.O. 174 Substantial Capital Threshold',
    prompt: 'Under DOLE D.O. No. 174-17, what is the minimum paid-up capital / net financial contracting capacity required for corporations/partnerships to qualify as having “substantial capital”?',
    options: [
      'At least PHP 5,000,000.00',
      'At least PHP 3,000,000.00',
      'At least PHP 1,000,000.00',
      'At least PHP 500,000.00',
    ],
    correctIndex: 0,
    statute: 'Sec. 3(l), DOLE D.O. 174-17',
    explanation: 'D.O. 174-17 raised the substantial capital requirement to at least PHP 5,000,000 paid-up capital for corporations/partnerships/cooperatives or net worth for single proprietorships.',
  },
  {
    id: 'pw6',
    worldCode: 'w3',
    headline: 'R.A. 8188 Double Indemnity Penalty',
    prompt: 'If an employer refuses or fails to pay the prescribed statutory wage increase under an RTWPB Wage Order, what special monetary sanction attaches under R.A. 8188?',
    options: [
      'Double Indemnity: payment of double (2x) the unpaid benefits and wage increments owed',
      'Triple damages accompanied by immediate automatic cancellation of DOLE operating permit',
      'Nominal damages capped strictly at PHP 10,000 per violation regardless of unpaid workers',
      'Simple statutory six percent (6%) legal interest without any punitive indemnity multiplier',
    ],
    correctIndex: 0,
    statute: 'Sec. 4, R.A. 8188',
    explanation: 'R.A. 8188 imposes Double Indemnity (2x the unpaid prescribed wage adjustment) against employers who refuse or fail to pay RTWPB-mandated minimum wage increases.',
  },
  {
    id: 'pw7',
    worldCode: 'w3',
    headline: 'Wage Distortion Resolution in Unionized Establishments',
    prompt: 'When an RTWPB wage increase obliterates the pay differences between job classifications in an organized establishment with a recognized CBA, how must the wage distortion be resolved?',
    options: [
      'Grievance machinery under CBA, and if unresolved within 10 days, to voluntary arbitration',
      'Immediate notice of strike filed before NCMB with mandatory twenty-four (24) hour cooling',
      'Direct petition for certiorari filed before Court of Appeals within sixty (60) days',
      'Employer unilaterally promulgates new wage matrix without consultation or arbitration',
    ],
    correctIndex: 0,
    statute: 'Art. 124, Labor Code',
    explanation: 'In organized establishments, wage distortions must be processed through the grievance machinery of the CBA, and if unresolved, referred to voluntary arbitration within 10 days.',
  },
  {
    id: 'pw8',
    worldCode: 'w3',
    headline: 'Non-Diminution of Benefits Principle',
    prompt: 'Under Art. 100, what are the requisite conditions before a benefit or grant ripens into a company practice that cannot be unilaterally eliminated by the employer?',
    options: [
      'Given voluntarily, consistently, and deliberately over considerable time without legal error',
      'Granted at least twice during annual Christmas celebrations or company anniversary parties',
      'Stipulated in an unsigned preliminary draft employee handbook circulated for evaluation',
      'Practiced continuously for thirty (30) calendar days during initial probationary trial',
    ],
    correctIndex: 0,
    statute: 'Art. 100 & Vergara v. Coca-Cola Bottlers Philippines',
    explanation: 'To ripen into a non-diminution practice, the grant must be voluntary, consistent over a long period, deliberate, and not founded on an erroneous interpretation of legal provisions.',
  },
  {
    id: 'pw9',
    worldCode: 'w3',
    headline: 'Permissible Salary Deductions Without Court Order',
    prompt: 'Under Art. 113, in which of the following cases is an employer legally allowed to deduct amounts from an employee’s wage without a court judgment?',
    options: [
      'For worker insurance with consent, union check-off dues, or when authorized by statutory law',
      'Whenever management suspects inventory shrinkage or store shortages without written hearing',
      'For repair costs of damaged tools and uniforms automatically assessed against monthly salary',
      'For company banquet catering expenses and optional recreational team-building contributions',
    ],
    correctIndex: 0,
    statute: 'Art. 113, Labor Code',
    explanation: 'Art. 113 strictly limits lawful deductions to: (a) insurance premiums with employee consent, (b) union check-off dues, and (c) cases where employer is authorized by law or DOLE regulations.',
  },
  {
    id: 'pw10',
    worldCode: 'w3',
    headline: 'Service Charges Payout Frequency Under R.A. 11360',
    prompt: 'Under the Implementing Rules of R.A. 11360, how often must the 100% service charges collected by restaurants and hotels be distributed to covered employees?',
    options: [
      'Completely and equally at least once every two (2) weeks or twice monthly (interval <= 16 days)',
      'Annually every December together with statutory 13th month pay and year-end performance bonus',
      'Quarterly following formal reconciliation and submission of BIR quarterly tax return sheets',
      'Daily in cash at shift conclusion minus five percent administrative credit card surcharge',
    ],
    correctIndex: 0,
    statute: 'DOLE D.O. 206-19 Sec. 3',
    explanation: 'Service charges must be distributed completely and equally at least once every two (2) weeks or twice a month at intervals not exceeding 16 days.',
  },
  {
    id: 'pw11',
    worldCode: 'w3',
    headline: '13th Month Pay Coverage: Resigned & Terminated Workers',
    prompt: 'An employee resigned on August 31 after working 8 months of the calendar year. Is she entitled to receive 13th Month Pay?',
    options: [
      'Yes — entitled to proportionate 13th month pay (1/12 of basic salary earned in the 8 months)',
      'No — voluntary resignation forfeits all statutory 13th month pay benefits for calendar year',
      'Only if she rendered at least ten (10) active consecutive months of service in calendar year',
      'Only if termination was involuntary retrenchment or closure rather than voluntary departure',
    ],
    correctIndex: 0,
    statute: 'P.D. 851 Revised Guidelines Sec. 6',
    explanation: 'An employee who resigned or whose services were terminated at any time before the time of payment of 13th month pay is entitled to proportionate 13th month pay (1/12 of basic salary earned).',
  },
  {
    id: 'pw12',
    worldCode: 'w3',
    headline: 'Prohibition Against Attorney’s Fees in Wage Recovery (Art. 111)',
    prompt: 'Under Art. 111 of the Labor Code, what is the statutory ceiling on attorney’s fees in cases of unlawful withholding of wages?',
    options: [
      'Maximum ten percent (10%) of the total amount of wages recovered in the labor proceedings',
      'Maximum twenty-five percent (25%) of the cumulative monetary award assessed by arbiter',
      'Maximum thirty-three percent (33%) contingency fee as stipulated in retainer agreement',
      'No statutory ceiling; determined solely by market negotiation between lawyer and client',
    ],
    correctIndex: 0,
    statute: 'Art. 111, Labor Code',
    explanation: 'In cases of unlawful withholding of wages, culpable attorney’s fees assessed against the employer shall not exceed ten percent (10%) of the total amount of wages recovered.',
  },
];

const ThematicRoyalGameVisualizer: React.FC<{
  gameTitle: string;
  stageNum: number;
  totalStages: number;
  pickedOption: number | null;
  isRight: boolean;
}> = ({ gameTitle, stageNum, totalStages, pickedOption, isRight }) => {
  const progressPct = Math.min(100, Math.round(((stageNum + 1) / Math.max(1, totalStages)) * 100));
  const [mineRailBranch, setMineRailBranch] = useState<'upper' | 'lower'>('upper');
  const [derbyGear, setDerbyGear] = useState<'100%' | '150%' | '200%' | '300%'>('200%');
  const [activeRuneKeys, setActiveRuneKeys] = useState<number[]>([0]);
  const [concertChannel, setConcertChannel] = useState<number>(0);

  // 1. Captain Toad's Minecart Gem Dig
  if (gameTitle.includes('Toad') || gameTitle.includes('Minecart')) {
    return (
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500/70 rounded-2xl p-3 sm:p-4 text-xs font-bold text-white shadow-inner space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-black uppercase text-amber-300 font-mario">
          <span className="flex items-center gap-1.5">
            <Pickaxe className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Captain Toad Subterranean Rails</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMineRailBranch((b) => (b === 'upper' ? 'lower' : 'upper'));
                marioAudio.playClick();
              }}
              className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 border border-black font-mono text-[10px] font-black cursor-pointer"
            >
              Switch Track ({mineRailBranch === 'upper' ? 'Upper' : 'Lower'})
            </button>
            <span className="text-emerald-300 font-mono tabular-nums">
              Depth {stageNum * 60 + 120}m · {progressPct}%
            </span>
          </div>
        </div>
        <div className="relative h-14 bg-slate-950/90 rounded-xl border border-amber-600/50 overflow-hidden flex items-center px-3">
          <div className="absolute inset-x-0 bottom-3 h-1.5 bg-amber-600/60 border-t border-b border-amber-400/50 flex justify-between px-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-1.5 h-3 -mt-0.5 bg-amber-800 border-x border-amber-600" />
            ))}
          </div>
          <div className="absolute inset-x-4 top-1.5 flex justify-between text-xs opacity-75">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <MarioCoinIcon className="w-3.5 h-3.5 text-amber-400" />
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <MarioStarIcon className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <div
            className="absolute transition-all duration-500 ease-out flex items-center gap-1.5"
            style={{ left: `${Math.max(4, Math.min(84, (stageNum / Math.max(1, totalStages)) * 82))}%` }}
          >
            <div className="w-9 h-8 rounded-lg bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 shadow-[0_2px_0_#000]">
              <Pickaxe className="w-4 h-4 text-slate-950" />
            </div>
            {pickedOption !== null && isRight && (
              <span className="text-[10px] font-black font-mario text-amber-300 bg-black/80 px-1.5 py-0.5 rounded border border-amber-400 whitespace-nowrap">
                +1 GEM!
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Princess Daisy's Grand Prix Holiday Derby
  if (gameTitle.includes('Daisy') || gameTitle.includes('Derby')) {
    return (
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-2 border-rose-500/70 rounded-2xl p-3 sm:p-4 text-xs font-bold text-white shadow-inner space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-black uppercase text-rose-300 font-mario">
          <span className="flex items-center gap-1.5">
            <Flag className="w-4 h-4 text-rose-300 shrink-0" />
            <span>Daisy Circuit Grand Prix · Lap {stageNum + 1}/{totalStages}</span>
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {(['100%', '150%', '200%', '300%'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setDerbyGear(g);
                  marioAudio.playClick();
                }}
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-black border cursor-pointer ${
                  derbyGear === g
                    ? 'bg-orange-400 text-slate-950 border-black'
                    : 'bg-slate-950 text-rose-200 border-rose-500/50'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="relative h-14 bg-slate-950/90 rounded-xl border border-rose-600/50 overflow-hidden flex items-center px-3">
          <div className="absolute inset-x-0 bottom-2.5 h-2 bg-slate-800 border-t border-b border-rose-400/40 flex justify-between px-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-3 h-1 bg-amber-300/80 my-auto" />
            ))}
          </div>
          <div className="absolute right-3 top-2 bottom-2 w-4 bg-gradient-to-b from-white via-black to-white opacity-80 rounded" />
          <div
            className="absolute transition-all duration-500 ease-out flex items-center gap-1.5"
            style={{ left: `${Math.max(4, Math.min(84, (stageNum / Math.max(1, totalStages)) * 80))}%` }}
          >
            <div className="w-9 h-8 rounded-lg bg-orange-400 border-2 border-black flex items-center justify-center text-slate-950 shadow-[0_2px_0_#000]">
              <Zap className="w-4 h-4 text-slate-950" />
            </div>
            {pickedOption !== null && isRight && (
              <span className="text-[10px] font-black font-mario text-emerald-300 bg-black/80 px-1.5 py-0.5 rounded border border-emerald-400 whitespace-nowrap">
                TURBO!
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Dry Bones Crypt of Twin-Notice & Deadlines
  if (gameTitle.includes('Dry Bones') || gameTitle.includes('Crypt')) {
    const runeLabels = ['1-Yr ULP', '3-Yr Money', '4-Yr Dismiss', '5d NTE', '30d DOLE'];
    return (
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-2 border-purple-500/70 rounded-2xl p-3 sm:p-4 text-xs font-bold text-white shadow-inner space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-black uppercase text-purple-300 font-mario">
          <span className="flex items-center gap-1.5">
            <Skull className="w-4 h-4 text-purple-300 shrink-0" />
            <span>Dry Bones Dungeon Crypt</span>
          </span>
          <span className="text-cyan-300 font-mono tabular-nums">
            Portcullis Seal: {Math.max(0, totalStages - stageNum - 1)} Locks Left
          </span>
        </div>
        <div className="relative bg-slate-950/90 rounded-xl border border-purple-600/50 p-2.5 flex flex-wrap items-center justify-between gap-2">
          <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex flex-wrap items-center gap-1.5">
            {runeLabels.slice(0, totalStages).map((lbl, i) => {
              const unlockedRune = i <= stageNum || activeRuneKeys.includes(i);
              return (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => {
                    setActiveRuneKeys((prev) =>
                      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
                    );
                    marioAudio.playClick();
                  }}
                  className={`px-2 py-1 rounded-lg border font-mono text-[10px] font-black inline-flex items-center gap-1 cursor-pointer ${
                    unlockedRune
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                      : 'bg-slate-900 border-amber-500/50 text-amber-300'
                  }`}
                >
                  {unlockedRune ? (
                    <Unlock className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                  )}
                  <span>{lbl}</span>
                </button>
              );
            })}
          </div>
          <Flame className="w-4 h-4 text-amber-400 shrink-0" />
        </div>
      </div>
    );
  }

  // 4. Mayor Pauline's Big Band Wage Concert
  const eqBands = ['100% SC', '1/12 13th', 'Cash Cash', '2x RA 8188'];
  return (
    <div className="bg-gradient-to-r from-pink-950 via-slate-900 to-amber-950 border-2 border-pink-500/70 rounded-2xl p-3 sm:p-4 text-xs font-bold text-white shadow-inner space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-black uppercase text-pink-300 font-mario">
        <span className="flex items-center gap-1.5">
          <Music className="w-4 h-4 text-pink-300 shrink-0" />
          <span>Pauline Big Band Equalizer · {80 + stageNum * 5} dB</span>
        </span>
        <div className="flex flex-wrap items-center gap-1">
          {eqBands.map((b, idx) => (
            <button
              key={b}
              type="button"
              onClick={() => {
                setConcertChannel(idx);
                marioAudio.playClick();
              }}
              className={`px-2 py-0.5 rounded font-mono text-[10px] font-black border cursor-pointer ${
                concertChannel === idx
                  ? 'bg-amber-400 text-slate-950 border-black'
                  : 'bg-slate-950 text-pink-200 border-pink-500/50'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
      <div className="relative h-14 bg-slate-950/90 rounded-xl border border-pink-600/50 overflow-hidden flex items-end justify-between px-4 pb-2">
        {[30, 65, 45, 90, 50, 75, 40, 95, 60, 85, 55, 70, 100, 45].map((h, i) => (
          <div
            key={i}
            className="w-2.5 rounded-t bg-gradient-to-t from-pink-500 via-rose-400 to-amber-300 transition-all duration-300"
            style={{
              height: `${Math.max(15, Math.min(42, h * (0.4 + ((stageNum + concertChannel) / (totalStages + 2)) * 0.6)))}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

interface RoyalArcadeEngineProps extends RoyalVaultGameProps {
  deckKey: string;
  gameTitle: string;
  kickerBadge: string;
  description: string;
  bannerGradientClass: string;
  accentButtonClass: string;
  icon: React.ReactNode;
  bank: readonly MasterArcadeScenario[];
  victoryCoins: number;
  reportWorldCode: string;
}

const RoyalArcadeEngine: React.FC<RoyalArcadeEngineProps> = ({
  deckKey,
  equippedAvatar,
  onEarnCoins,
  onQuizCompleted,
  gameTitle,
  kickerBadge,
  description,
  bannerGradientClass,
  accentButtonClass,
  icon,
  bank,
  victoryCoins,
  reportWorldCode,
}) => {
  const [phase, setPhase] = useState<'READY' | 'PLAYING' | 'VICTORY' | 'GAME_OVER'>('READY');
  const [deck, setDeck] = useState<MasterArcadeScenario[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pickedOption, setPickedOption] = useState<number | null>(null);
  const [startedAtMs, setStartedAtMs] = useState<number>(() => Date.now());

  // Arcade Power-Ups & Speedrunner Engine
  const [mushroomUsesLeft, setMushroomUsesLeft] = useState(2);
  const [eliminatedIndices, setEliminatedIndices] = useState<Set<number>>(new Set());
  const [feverStars, setFeverStars] = useState(0);
  const [isFeverActive, setIsFeverActive] = useState(false);
  const [showRadarClue, setShowRadarClue] = useState(false);
  const [radarUsesLeft, setRadarUsesLeft] = useState(2);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [speedBonusAwarded, setSpeedBonusAwarded] = useState(false);
  const [shieldAbsorbedHit, setShieldAbsorbedHit] = useState(false);

  const startRun = useCallback(() => {
    const drawn = drawUniqueFromDeck(deckKey, bank, Math.min(5, bank.length)).map((item) => {
      const shuf = shuffleChoiceOptions(item.options, item.correctIndex);
      return {
        ...item,
        options: shuf.options,
        correctIndex: shuf.correctIndex,
      };
    });
    setDeck(drawn);
    setCurrentIdx(0);
    setHearts(3);
    setScore(0);
    setStreak(0);
    setPickedOption(null);
    setMushroomUsesLeft(2);
    setEliminatedIndices(new Set());
    setFeverStars(0);
    setIsFeverActive(false);
    setShowRadarClue(false);
    setRadarUsesLeft(2);
    setSecondsLeft(15);
    setSpeedBonusAwarded(false);
    setShieldAbsorbedHit(false);
    setStartedAtMs(Date.now());
    setPhase('PLAYING');
    marioAudio.playPowerUp();
  }, [deckKey, bank]);

  const currentItem = deck[currentIdx];

  // Speedrunner 15s Countdown Clock
  useEffect(() => {
    if (phase !== 'PLAYING' || pickedOption !== null) return;
    if (secondsLeft <= 0) {
      handleChoose(-1);
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, pickedOption, secondsLeft]);

  const handleMushroomZap = () => {
    if (mushroomUsesLeft <= 0 || !currentItem || pickedOption !== null || eliminatedIndices.size > 0) return;
    const wrongIndices = currentItem.options
      .map((_, i) => i)
      .filter((i) => i !== currentItem.correctIndex && !eliminatedIndices.has(i));
    if (wrongIndices.length === 0) return;
    const toZap = wrongIndices.slice(0, 2);
    setEliminatedIndices(new Set([...eliminatedIndices, ...toZap]));
    setMushroomUsesLeft((m) => Math.max(0, m - 1));
    marioAudio.playPowerUp();
  };

  const handleRadarClue = () => {
    if (radarUsesLeft <= 0 && !showRadarClue) return;
    if (pickedOption !== null) return;
    const next = !showRadarClue;
    setShowRadarClue(next);
    if (next) {
      setRadarUsesLeft((r) => Math.max(0, r - 1));
      marioAudio.playCoin();
    }
  };

  const handleChoose = (idx: number) => {
    if (pickedOption !== null || !currentItem) return;
    setPickedOption(idx);
    const isCorrect = idx === currentItem.correctIndex;
    const isFast = secondsLeft >= 8;

    if (isCorrect) {
      const nextStreak = streak + 1;
      setScore((s) => s + 1);
      setStreak(nextStreak);

      let coinReward = nextStreak >= 2 ? 4 : 3;
      if (isFast) {
        coinReward += 5;
        setSpeedBonusAwarded(true);
      }
      if (isFeverActive) {
        coinReward *= 2;
        setIsFeverActive(false);
        setFeverStars(0);
      } else {
        const nextStars = feverStars + 1;
        if (nextStars >= 3) {
          setIsFeverActive(true);
          setFeverStars(3);
          marioAudio.playPowerUp();
        } else {
          setFeverStars(nextStars);
        }
      }

      onEarnCoins?.(coinReward);
      awardUserXp({ amount: 25 + nextStreak * 5, reason: `${gameTitle} Stage Cleared` });
      marioAudio.playCoin();
    } else {
      setStreak(0);
      if (isFeverActive) {
        setShieldAbsorbedHit(true);
        setIsFeverActive(false);
        setFeverStars(0);
        marioAudio.playPowerUp();
      } else {
        setHearts((h) => Math.max(0, h - 1));
        marioAudio.playWrongAnswer();
      }
    }
  };

  const handleAdvance = () => {
    const elapsedSec = Math.max(1, Math.round((Date.now() - startedAtMs) / 1000));
    if (hearts <= 0) {
      setPhase('GAME_OVER');
      marioAudio.playGameOver();
      awardUserXp({ amount: 20, reason: `${gameTitle} Run Effort` });
      onQuizCompleted?.({
        mode: 'arcade_vault',
        correctCount: score,
        totalCount: deck.length,
        elapsedSeconds: elapsedSec,
        worldCode: reportWorldCode,
      });
      return;
    }

    if (currentIdx + 1 >= deck.length) {
      setPhase('VICTORY');
      onEarnCoins?.(victoryCoins);
      marioAudio.playLevelUp();
      awardUserXp({ amount: 100, reason: `${gameTitle} Grand Championship Clear` });
      onQuizCompleted?.({
        mode: 'arcade_vault',
        correctCount: score,
        totalCount: deck.length,
        elapsedSeconds: elapsedSec,
        worldCode: reportWorldCode,
      });
      return;
    }

    setCurrentIdx((i) => i + 1);
    setPickedOption(null);
    setEliminatedIndices(new Set());
    setShowRadarClue(false);
    setSecondsLeft(15);
    setSpeedBonusAwarded(false);
    setShieldAbsorbedHit(false);
    marioAudio.playClick();
  };

  return (
    <div className="bg-slate-950 text-white rounded-3xl border-4 border-black shadow-[6px_6px_0_#000] overflow-hidden w-full max-w-full min-w-0">
      {/* Compact Responsive HUD Header */}
      <div className={`${bannerGradientClass} p-3.5 sm:p-5 border-b-3 border-black flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
            {icon}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-amber-300 font-mario block truncate">
              {kickerBadge}
            </span>
            <h3 className="text-base sm:text-xl font-black font-display text-white truncate">
              {gameTitle}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/60 border border-slate-700" aria-label={`${hearts} hearts remaining`}>
            {Array.from({ length: 3 }, (_, idx) => (
              <Heart
                key={idx}
                className={`w-4 h-4 ${
                  idx < hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-600'
                }`}
              />
            ))}
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center">
            <MarioCharacterAvatar character={equippedAvatar} className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Playable Stage */}
      <div className="p-4 sm:p-6">
        {phase === 'READY' && (
          <div className="text-center py-6 sm:py-8 space-y-4 max-w-xl mx-auto">
            <p className="text-xs sm:text-sm font-semibold text-slate-300 leading-relaxed">
              {description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                data-start="true"
                onClick={startRun}
                className={`min-h-[48px] px-6 py-2.5 rounded-2xl font-black text-sm border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer active:translate-y-0.5 ${accentButtonClass}`}
              >
                <Play className="w-4 h-4 fill-current shrink-0" />
                <span>Start 5-Stage Arcade Run (+{victoryCoins}c Clear Bonus)</span>
              </button>
            </div>
          </div>
        )}

        {phase === 'PLAYING' && currentItem && (
          <div className="space-y-4">
            {/* Mini-Mario Interactive Stage Map Track */}
            <div className="bg-slate-900/90 border-2 border-slate-700 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-black uppercase text-amber-300 font-mario hidden sm:inline">
                  Course:
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center min-w-0 px-1">
                {deck.map((_, idx) => {
                  const isPast = idx < currentIdx;
                  const isCurr = idx === currentIdx;
                  return (
                    <div key={idx} className="flex items-center gap-1 shrink-0">
                      <div
                        className={`flex items-center justify-center rounded-xl font-mario text-[10px] transition-all ${
                          isCurr
                            ? 'w-8 h-8 bg-amber-400 text-slate-950 font-black border-2 border-black scale-110 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                            : isPast
                            ? 'w-6 h-6 bg-emerald-600/60 text-emerald-100 border border-emerald-400 font-bold'
                            : 'w-6 h-6 bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {isCurr ? (
                          <MarioCharacterAvatar character={equippedAvatar} className="w-5 h-5" />
                        ) : isPast ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      {idx < deck.length - 1 && (
                        <div
                          className={`h-0.5 w-2 sm:w-3 ${
                            isPast ? 'bg-emerald-400' : 'bg-slate-700'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
                <div className="flex items-center gap-1 shrink-0 pl-1">
                  <div className="w-6 h-6 rounded-xl bg-amber-500/30 border border-amber-400 flex items-center justify-center">
                    <MarioFlagIcon className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Arcade Action Bar: 15s Speedrunner Timer, Star Fever, 50/50 Mushroom Zap, Radar Clue */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 border-2 border-slate-800 rounded-2xl p-2.5 sm:p-3">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border-2 font-mono font-black text-xs tabular-nums ${
                    secondsLeft <= 5
                      ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                      : secondsLeft <= 8
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-700 text-slate-200'
                  }`}
                >
                  <Clock className={`w-3.5 h-3.5 ${secondsLeft <= 5 ? 'text-rose-400' : 'text-amber-400'}`} />
                  <span>{secondsLeft}s</span>
                  {secondsLeft >= 8 && pickedOption === null && (
                    <span className="text-[9px] font-mario text-emerald-400 uppercase hidden sm:inline">
                      +5 Speed
                    </span>
                  )}
                </div>

                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-xl border-2 transition-all ${
                    isFeverActive
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <MarioStarIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[10px] font-mario font-black">
                    {isFeverActive ? 'FEVER 2X SHIELD' : `STAR ${feverStars}/3`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={mushroomUsesLeft <= 0 || pickedOption !== null || eliminatedIndices.size > 0}
                  onClick={handleMushroomZap}
                  className={`min-h-[34px] px-2.5 py-1 rounded-xl border-2 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                    mushroomUsesLeft > 0 && pickedOption === null && eliminatedIndices.size === 0
                      ? 'bg-rose-600 hover:bg-rose-500 text-white border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50 cursor-not-allowed'
                  }`}
                  title="50/50 Mushroom Zap: Strike out 2 incorrect choices"
                >
                  <MarioMushroomIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>50/50 Zap ({mushroomUsesLeft})</span>
                </button>

                <button
                  type="button"
                  disabled={radarUsesLeft <= 0 && !showRadarClue}
                  onClick={handleRadarClue}
                  className={`min-h-[34px] px-2.5 py-1 rounded-xl border-2 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                    showRadarClue
                      ? 'bg-emerald-400 text-slate-950 border-black font-black'
                      : radarUsesLeft > 0
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50 cursor-not-allowed'
                  }`}
                  title="Statutory Radar Clue: Reveal controlling provision hint"
                >
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span>Radar ({radarUsesLeft})</span>
                </button>
              </div>
            </div>

            {/* Radar Clue Panel */}
            {showRadarClue && currentItem && (
              <div className="bg-indigo-950/90 border-2 border-indigo-400 rounded-2xl p-3 text-indigo-100 flex items-start gap-2.5">
                <Compass className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] font-mario text-cyan-300 uppercase block">STATUTORY RADAR CLUE</span>
                  <p className="text-xs font-bold leading-snug">
                    Controlling Legal Basis: <span className="font-mono text-amber-300">{currentItem.statute}</span>
                  </p>
                </div>
              </div>
            )}

            <ThematicRoyalGameVisualizer
              gameTitle={gameTitle}
              stageNum={currentIdx}
              totalStages={deck.length}
              pickedOption={pickedOption}
              isRight={pickedOption === currentItem.correctIndex}
              streak={streak}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
              <span className="text-amber-300 font-mono tabular-nums">
                Stage {currentIdx + 1}/{deck.length} · {currentItem.headline}
              </span>
              <span className="text-emerald-300 tabular-nums">
                Score: {score} {streak >= 2 ? `· ${streak}x Streak!` : ''}
              </span>
            </div>

            <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 sm:p-5">
              <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed">
                {currentItem.prompt}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentItem.options.map((opt, idx) => {
                const isPicked = pickedOption === idx;
                const isRight = idx === currentItem.correctIndex;
                const isEliminated = eliminatedIndices.has(idx);
                let btnTone = 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-100';
                if (isEliminated) {
                  btnTone = 'bg-slate-950/40 border-slate-800 text-slate-600 line-through opacity-40 cursor-not-allowed';
                } else if (pickedOption !== null) {
                  if (isRight) {
                    btnTone = 'bg-emerald-500/25 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400';
                  } else if (isPicked) {
                    btnTone = 'bg-rose-500/25 border-rose-500 text-rose-100';
                  } else {
                    btnTone = 'bg-slate-950/60 border-slate-800 text-slate-500';
                  }
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={pickedOption !== null || isEliminated}
                    onClick={() => handleChoose(idx)}
                    className={`min-h-[54px] p-3.5 rounded-2xl border-2 text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${btnTone}`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-black border border-slate-700 text-amber-300 font-black font-mario text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-xs sm:text-sm font-bold leading-snug">{opt}</span>
                    </div>
                    {isEliminated && (
                      <span className="text-[10px] font-mario text-rose-400/80 shrink-0 mt-0.5">ZAPPED!</span>
                    )}
                  </button>
                );
              })}
            </div>

            {pickedOption !== null && (
              <div
                className={`rounded-2xl p-4 border-2 space-y-1.5 ${
                  pickedOption === currentItem.correctIndex
                    ? 'bg-emerald-950/75 border-emerald-500 text-emerald-100'
                    : shieldAbsorbedHit
                    ? 'bg-sky-950/70 border-sky-400 text-sky-100'
                    : 'bg-rose-950/75 border-rose-500 text-rose-100'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black">
                  <span className="inline-flex items-center gap-1.5">
                    {pickedOption === currentItem.correctIndex ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>DOCTRINE LOCKED IN!</span>
                        {speedBonusAwarded && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-mario text-[9px]">
                            +5 SPEED BONUS!
                          </span>
                        )}
                      </>
                    ) : shieldAbsorbedHit ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-sky-300 shrink-0" />
                        <span>STAR SHIELD BLOCKED DAMAGE! (HEARTS SAFE)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{pickedOption === -1 ? "TIME'S UP! (-1 HEART)" : "MISSED TRAP (-1 HEART)"}</span>
                      </>
                    )}
                  </span>
                  <span className="text-amber-300 font-mono">{currentItem.statute}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {currentItem.explanation}
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAdvance}
                    className="min-h-[44px] px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm border-2 border-black inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      {hearts <= 0
                        ? 'View Run Summary'
                        : currentIdx + 1 >= deck.length
                        ? 'Claim Clear Bonus'
                        : 'Next Stage'}
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === 'VICTORY' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 border-3 border-black mx-auto flex items-center justify-center shadow-[0_4px_0_#000]">
              <MarioStarIcon className="w-9 h-9" />
            </div>
            <h4 className="text-2xl sm:text-3xl font-black font-display text-white tabular-nums">
              STAGE CLEARED! ({score}/{deck.length})
            </h4>
            <p className="text-xs sm:text-sm font-bold text-emerald-300 inline-flex items-center gap-1.5">
              <MarioCoinIcon className="w-4 h-4" />
              <span>+{victoryCoins} Bonus Gold Coins Banked!</span>
            </p>
            <div>
              <button
                type="button"
                data-start="true"
                onClick={startRun}
                className="min-h-[46px] px-6 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Play Fresh Shuffled Deck</span>
              </button>
            </div>
          </div>
        )}

        {phase === 'GAME_OVER' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-600 border-3 border-black mx-auto flex items-center justify-center text-white">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black font-display text-white tabular-nums">
              OUT OF HEARTS ({score}/{deck.length} CLEARED)
            </h4>
            <button
              type="button"
              data-start="true"
              onClick={startRun}
              className="min-h-[46px] px-6 py-2 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>Retry Shuffled Run</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const CaptainToadMinecartGame: React.FC<RoyalVaultGameProps> = (props) => (
  <RoyalArcadeEngine
    {...props}
    deckKey="royal_captain_toad_minecart"
    gameTitle="Captain Toad's Special-Workers Minecart"
    kickerBadge="WORLD 4 • KASAMBAHAY, CHILD LABOR, PWD & TELECOMMUTING"
    description="Ride Captain Toad's headlamp minecart through World 4 statutory protections! Master R.A. 10361 Kasambahay SIL/rest rules, R.A. 9231 Child Labor caps, R.A. 7277 100% PWD parity, and R.A. 11165 Telecommuting."
    bannerGradientClass="bg-gradient-to-r from-amber-800 via-red-900 to-slate-900"
    accentButtonClass="bg-amber-400 hover:bg-amber-300 text-slate-950"
    icon={<Compass className="w-6 h-6" />}
    bank={CAPTAIN_TOAD_MINECART_BANK}
    victoryCoins={30}
    reportWorldCode="w4"
  />
);

export const DaisyHolidayDerbyGame: React.FC<RoyalVaultGameProps> = (props) => (
  <RoyalArcadeEngine
    {...props}
    deckKey="royal_daisy_holiday_derby"
    gameTitle="Princess Daisy's Sarasaland Holiday Derby"
    kickerBadge="HOLIDAYS • REGULAR, DOUBLE & PRECEDING-DAY TRAPS"
    description="Sprint across Sarasaland's Holiday Matrix! Conquer Regular vs. Special Non-Working Day multipliers (100%, 150%, 200%, 300%), Double Holidays, <10 retail exemptions, and successive-holiday absence traps."
    bannerGradientClass="bg-gradient-to-r from-orange-800 via-amber-800 to-slate-900"
    accentButtonClass="bg-orange-300 hover:bg-orange-200 text-slate-950"
    icon={<Sun className="w-6 h-6" />}
    bank={DAISY_HOLIDAY_DERBY_BANK}
    victoryCoins={30}
    reportWorldCode="holidays"
  />
);

export const DryBonesCryptGame: React.FC<RoyalVaultGameProps> = (props) => (
  <RoyalArcadeEngine
    {...props}
    deckKey="royal_dry_bones_crypt"
    gameTitle="Dry Bones' Prescriptive & Due Process Crypt"
    kickerBadge="DEADLINES • 1-YR ULP, 3-YR MONEY, 4-YR DISMISSAL & NTE"
    description="Unlock the castle crypt before statutory claims prescribe! Distinguish 1-Year ULP, 3-Year Money Claims, 4-Year Illegal Dismissal, 5-Day NTE, 30-Day DOLE Notice, and the 6-Month Floating Status cap."
    bannerGradientClass="bg-gradient-to-r from-slate-800 via-zinc-900 to-indigo-950"
    accentButtonClass="bg-cyan-400 hover:bg-cyan-300 text-slate-950"
    icon={<ShieldAlert className="w-6 h-6" />}
    bank={DRY_BONES_CRYPT_BANK}
    victoryCoins={30}
    reportWorldCode="w5"
  />
);

export const PaulineWageConcertGame: React.FC<RoyalVaultGameProps> = (props) => (
  <RoyalArcadeEngine
    {...props}
    deckKey="royal_pauline_wage_concert"
    gameTitle="Mayor Pauline's Metro Wage Festival"
    kickerBadge="WORLD 3 • R.A. 11360, P.D. 851, FACILITIES & R.A. 8188"
    description="Headline Metro Kingdom's Wage Festival! Hit every statutory note on 100% Service Charges, P.D. 851 13th Month Pay, Art. 102 Legal Tender, Purpose Test (Facilities vs. Supplements), and R.A. 8188 Double Indemnity."
    bannerGradientClass="bg-gradient-to-r from-rose-900 via-red-900 to-purple-950"
    accentButtonClass="bg-rose-300 hover:bg-rose-200 text-slate-950"
    icon={<Music className="w-6 h-6" />}
    bank={PAULINE_WAGE_CONCERT_BANK}
    victoryCoins={35}
    reportWorldCode="w3"
  />
);
