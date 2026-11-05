import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MarioAvatar } from '../types/laborLaw';
import {
  MarioCharacterAvatar,
  MarioCoinIcon,
  MarioStarIcon,
  MarioBooIcon,
  MarioThwompIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';
import { drawUniqueFromDeck } from '../utils/gameQuestionDeck';
import { shuffleChoiceOptionsSafely } from '../utils/round14Improvements';
import {
  Clock,
  Moon,
  Sparkles,
  Stamp,
  Vault,
  Scale,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Heart,
  Play,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Train,
  Crown,
  Scroll,
  Coins,
  Compass,
  Zap,
} from 'lucide-react';
import { awardUserXp } from '../utils/levelProgressionService';

export interface MasterArcadeScenario {
  id: string;
  worldCode: string;
  headline: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  statute: string;
  explanation: string;
}

export const YOSHI_OVERTIME_EXPRESS_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'yo1',
    worldCode: 'w1',
    headline: '10 Hours on Ordinary Working Day',
    prompt: 'Yoshi worked 10 hours on an ordinary Tuesday (8 regular + 2 overtime hours). What is the statutory overtime rate for the 2 excess hours?',
    options: ['125% of hourly rate', '130% of hourly rate', '150% of hourly rate', '200% of hourly rate'],
    correctIndex: 0,
    statute: 'Art. 87, Labor Code',
    explanation: 'Work performed beyond 8 hours on an ordinary working day earns an additional 25% (125% hourly rate).',
  },
  {
    id: 'yo2',
    worldCode: 'w1',
    headline: 'Monday Undertime vs Tuesday Overtime',
    prompt: 'Toad left 2 hours early on Monday (undertime) and worked 2 hours overtime on Tuesday. Can the employer offset Monday undertime with Tuesday overtime?',
    options: [
      'No — offsetting undertime by overtime is strictly prohibited',
      'Yes — if within the same payroll week',
      'Yes — if agreed verbally',
      'Only for rank-and-file workers',
    ],
    correctIndex: 0,
    statute: 'Art. 88, Labor Code',
    explanation: 'Art. 88 prohibits offsetting undertime on one day with overtime worked on another day; the worker must still receive overtime premium.',
  },
  {
    id: 'yo3',
    worldCode: 'holidays',
    headline: 'Overtime on a Regular Holiday',
    prompt: 'Mario worked 9 hours on Independence Day (Regular Holiday). What multiplier applies to the 9th (overtime) hour?',
    options: ['260% of hourly rate', '200% of hourly rate', '169% of hourly rate', '300% of hourly rate'],
    correctIndex: 0,
    statute: 'Art. 87 & Art. 94, Labor Code',
    explanation: 'Regular Holiday first 8 hours = 200%, and overtime adds +30% of the holiday hourly rate: 200% × 1.30 = 260%.',
  },
  {
    id: 'yo4',
    worldCode: 'w2',
    headline: 'Overtime on Scheduled Rest Day',
    prompt: 'Peach worked 10 hours on her scheduled Sunday Rest Day (not a holiday). What hourly multiplier applies to hours 9 and 10?',
    options: ['169% of hourly rate', '130% of hourly rate', '150% of hourly rate', '195% of hourly rate'],
    correctIndex: 0,
    statute: 'Art. 87 & Art. 93(a), Labor Code',
    explanation: 'Rest day rate is 130%, and overtime beyond 8 hours on a rest day adds 30% of 130% = 169%.',
  },
  {
    id: 'yo5',
    worldCode: 'w1',
    headline: '15-Minute Coffee Break Check',
    prompt: 'Workers get a 15-minute morning rest break and a 15-minute afternoon rest break. Are these short breaks counted as compensable hours worked?',
    options: [
      'Yes — rest periods of 5 to 20 minutes are compensable working time',
      'No — all breaks under 1 hour are unpaid',
      'Only if the employee stays at their desk',
      'Half paid, half unpaid',
    ],
    correctIndex: 0,
    statute: 'Art. 84 & Omnibus Rules',
    explanation: 'Short rest periods of 5 to 20 minutes are compensable working hours; only full meal periods of at least 60 minutes are non-compensable.',
  },
  {
    id: 'yo6',
    worldCode: 'w1',
    headline: 'Work During Power Outage (Brownout)',
    prompt: 'A power brownout halts factory machines for 45 minutes, but workers are told to wait at their stations until power returns. Is this time paid?',
    options: [
      'Yes — waiting time where the employee is required to remain on premises is compensable',
      'No — brownouts are force majeure and strictly unpaid',
      'Only 50% paid',
      'Employer may force vacation leave',
    ],
    correctIndex: 0,
    statute: 'DOLE Policy Instructions No. 36',
    explanation: 'Waiting time spent by an employee on duty or where the worker is required to remain at the workplace is compensable hours worked.',
  },
  {
    id: 'yo7',
    worldCode: 'holidays',
    headline: 'Overtime on Special Day on Rest Day',
    prompt: 'Luigi works 9 hours on Ninoy Aquino Day (Special Non-Working Day) which also falls on his scheduled Rest Day. What rate applies to the 9th hour?',
    options: ['195% of hourly rate', '150% of hourly rate', '169% of hourly rate', '260% of hourly rate'],
    correctIndex: 0,
    statute: 'Art. 87 & Art. 93(c), Labor Code',
    explanation: 'Special Day on Rest Day is 150%, and overtime adds 30% of 150%: 150% × 1.30 = 195%.',
  },
  {
    id: 'yo8',
    worldCode: 'holidays',
    headline: 'Regular Holiday on Rest Day Overtime',
    prompt: 'A security guard works 10 hours on Christmas Day (Regular Holiday) which happens to be their scheduled Rest Day. What hourly rate applies to the 2 overtime hours?',
    options: ['338% of hourly rate', '260% of hourly rate', '200% of hourly rate', '300% of hourly rate'],
    correctIndex: 0,
    statute: 'DOLE Handbook on Statutory Monetary Benefits',
    explanation: 'Regular Holiday on Rest Day is 260% for first 8 hours, and overtime adds +30% of 260%: 260% × 1.30 = 338%!',
  },
];

export const LUIGI_NIGHTSHIFT_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'ln1',
    worldCode: 'w1',
    headline: 'Statutory Night Shift Window',
    prompt: 'Under Article 86 of the Labor Code, between what specific hours is the statutory Night Shift Differential (NSD) mandatory?',
    options: [
      'Between 10:00 PM and 6:00 AM',
      'Between 11:00 PM and 7:00 AM',
      'Between 8:00 PM and 4:00 AM',
      'Between 12:00 Midnight and 8:00 AM',
    ],
    correctIndex: 0,
    statute: 'Art. 86, Labor Code',
    explanation: 'Article 86 explicitly defines the night shift interval as work performed between 10:00 o’clock in the evening and 6:00 o’clock in the morning.',
  },
  {
    id: 'ln2',
    worldCode: 'w1',
    headline: 'Night Shift Differential Base Rate',
    prompt: 'What is the minimum statutory rate of additional compensation for each hour of night work performed between 10:00 PM and 6:00 AM?',
    options: [
      'Not less than 10% of the regular wage',
      'Not less than 15% of the regular wage',
      'Not less than 20% of the regular wage',
      'Not less than 25% of the regular wage',
    ],
    correctIndex: 0,
    statute: 'Art. 86, Labor Code',
    explanation: 'Every employee shall be paid a night shift differential of not less than ten percent (10%) of their regular wage for each hour of work between 10PM and 6AM.',
  },
  {
    id: 'ln3',
    worldCode: 'w1',
    headline: 'Retail / Service Small Business Exemption',
    prompt: 'Which retail and service establishments are legally exempted from the mandatory payment of Night Shift Differential under Article 86?',
    options: [
      'Retail and service establishments regularly employing not more than 5 workers',
      'Retail and service establishments regularly employing not more than 10 workers',
      'All establishments with fewer than 20 workers',
      'No establishments are exempt',
    ],
    correctIndex: 0,
    statute: 'Art. 86 & Omnibus Rules Book III Rule II',
    explanation: 'Retail and service establishments regularly employing not more than five (5) employees are exempted from mandatory NSD.',
  },
  {
    id: 'ln4',
    worldCode: 'w1',
    headline: 'Ordinary Day Overtime + Night Shift',
    prompt: 'Daisy’s shift is 2:00 PM to 10:00 PM, and she works overtime from 10:00 PM to 12:00 MN on an ordinary day. What combined multiplier applies to 10PM–12MN?',
    options: ['137.5% (1.25 × 1.10)', '135% (1.25 + 0.10)', '125% only', '150% flat'],
    correctIndex: 0,
    statute: 'Art. 86 & Art. 87, DOLE Handbook',
    explanation: 'Night Shift Differential stacks multiplicatively on top of the overtime hourly rate: 125% × 1.10 = 137.5%.',
  },
  {
    id: 'ln5',
    worldCode: 'holidays',
    headline: 'Regular Holiday Night Shift (First 8 Hours)',
    prompt: 'Bowser Jr. works an 8-hour graveyard shift (10:00 PM to 6:00 AM) on New Year’s Day (Regular Holiday). What multiplier applies?',
    options: ['220% (200% × 1.10)', '210% (200% + 10%)', '200% only', '260%'],
    correctIndex: 0,
    statute: 'Art. 86 & Art. 94, DOLE Handbook',
    explanation: 'Regular Holiday hourly rate is 200%, multiplied by 1.10 for night shift work = 220%.',
  },
  {
    id: 'ln6',
    worldCode: 'w1',
    headline: 'Managerial Staff Member at 11:30 PM',
    prompt: 'A bona fide Plant Manager (Art. 82 managerial employee) stays until midnight reviewing budgets. Can they demand statutory NSD?',
    options: [
      'No — managerial employees are excluded from Book III Title I coverage under Art. 82',
      'Yes — everyone working past 10 PM gets 10% NSD',
      'Yes — at 20% managerial rate',
      'Only if approved by union',
    ],
    correctIndex: 0,
    statute: 'Art. 82, Labor Code',
    explanation: 'Managerial employees and officers/members of the managerial staff are excluded from Title I (Hours of Work, OT, NSD).',
  },
  {
    id: 'ln7',
    worldCode: 'w2',
    headline: 'Rest Day Night Shift (First 8 Hours)',
    prompt: 'Toadette works 10:00 PM to 6:00 AM on her scheduled Rest Day (not a holiday). What hourly multiplier applies?',
    options: ['143% (130% × 1.10)', '140% (130% + 10%)', '130% only', '169%'],
    correctIndex: 0,
    statute: 'Art. 86 & Art. 93(a)',
    explanation: 'Scheduled Rest Day rate is 130%, and working between 10:00 PM and 6:00 AM multiplies it by 1.10 = 143%.',
  },
  {
    id: 'ln8',
    worldCode: 'w4',
    headline: 'Night Worker Health Assessment',
    prompt: 'Under R.A. 10151 (Night Workers Law), can a night worker request a free health assessment before and during their night assignment?',
    options: [
      'Yes — night workers have the right to undergo a health assessment without charge',
      'No — medical checkups are deducted from wages',
      'Only after 5 years of service',
      'Only in mining companies',
    ],
    correctIndex: 0,
    statute: 'R.A. 10151 (Art. 154–156)',
    explanation: 'R.A. 10151 grants night workers the right to free health assessments and mandatory transfer to day work if certified unfit due to health or pregnancy.',
  },
];

export const ROSALINA_WAGE_MATRIX_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'rw1',
    worldCode: 'w3',
    headline: 'Facilities vs Supplements Test',
    prompt: 'What is the controlling Supreme Court test to determine if an item is a deductible "Facility" or a non-deductible "Supplement"?',
    options: [
      'Purpose Test — whether it is primarily for the benefit of the employee or the employer’s business',
      'Cost Test — whether it costs over PHP 1,000',
      'Location Test — whether provided inside or outside the office',
      'Seniority Test',
    ],
    correctIndex: 0,
    statute: 'Mabeza v. NLRC & Art. 97(f)',
    explanation: 'Under the Purpose Test, independent of designation, if an item benefits the employer’s trade (like specialized uniforms/meals on overtime), it is a non-deductible Supplement.',
  },
  {
    id: 'rw2',
    worldCode: 'w3',
    headline: '3 Requisites to Deduct a Facility',
    prompt: 'Even if meals/lodging qualify as a Facility, what 3 strict requirements must an employer prove before deducting their cost from minimum wage?',
    options: [
      'Customary in trade + Voluntary written employee acceptance + Fair and reasonable value',
      'Verbal notice + HR memo + Market price',
      'CBA clause only',
      'Board resolution + 30-day notice',
    ],
    correctIndex: 0,
    statute: 'Our Haus Realty v. Parian',
    explanation: 'Without proof of customariness, voluntary written authorization by the employee, and fair/reasonable valuation, facility deductions are illegal.',
  },
  {
    id: 'rw3',
    worldCode: 'w3',
    headline: 'D.O. 174-17 Substantial Capital Threshold',
    prompt: 'Under DOLE Department Order No. 174-17, what minimum paid-up capital / net worth defines "Substantial Capital" for corporations/partnerships/sole proprietors?',
    options: ['At least PHP 5,000,000', 'At least PHP 3,000,000', 'At least PHP 1,000,000', 'At least PHP 500,000'],
    correctIndex: 0,
    statute: 'DOLE D.O. No. 174-17 Sec. 3(l)',
    explanation: 'D.O. 174-17 raised the minimum substantial capital requirement to PHP 5,000,000 paid-up capital stocks/shares or net worth.',
  },
  {
    id: 'rw4',
    worldCode: 'w3',
    headline: 'Wage Distortion Definition',
    prompt: 'A new RTWPB Wage Order raises minimum wage from PHP 570 to PHP 610, wiping out the intentional pay gap with supervisors earning PHP 615. What is this called?',
    options: ['Wage Distortion', 'Non-Diminution Violation', 'Constructive Dismissal', 'Unfair Labor Practice'],
    correctIndex: 0,
    statute: 'Art. 124, Labor Code (R.A. 6727)',
    explanation: 'Wage distortion occurs when a prescribed wage increase eliminates or severely contracts intentional quantitative differences between wage groups.',
  },
  {
    id: 'rw5',
    worldCode: 'w3',
    headline: 'Resolving Wage Distortion in Unorganized Firm',
    prompt: 'In an unorganized establishment (no union), if employer and workers fail to settle a wage distortion within 10 days, where is it referred?',
    options: [
      'NCMB for conciliation (10 days), then NLRC Labor Arbiter for compulsory arbitration',
      'Regular Regional Trial Court',
      'Barangay Lupon',
      'Workers may immediately stage a strike',
    ],
    correctIndex: 0,
    statute: 'Art. 124, Labor Code',
    explanation: 'Wage distortion is non-strikeable! Unorganized disputes go to NCMB conciliation first, then to the NLRC Labor Arbiter.',
  },
  {
    id: 'rw6',
    worldCode: 'w3',
    headline: 'Double Indemnity Penalty',
    prompt: 'Under R.A. 8188, an employer who refuses or fails to pay a prescribed RTWPB minimum wage increase is liable for:',
    options: [
      'Double the unpaid benefits/wage increase owing to the employees',
      'Half of the unpaid differential',
      'Nominal damages of PHP 10,000 only',
      'Warning letter only',
    ],
    correctIndex: 0,
    statute: 'R.A. 8188 (amending R.A. 6727 Sec. 12)',
    explanation: 'R.A. 8188 imposes double indemnity (twice the unpaid prescribed wage increase) plus potential criminal liability.',
  },
  {
    id: 'rw7',
    worldCode: 'w3',
    headline: 'Non-Diminution of Benefits (Art. 100)',
    prompt: 'For 8 years, a company deliberately and unconditionally paid a Mid-Year Rice Grant even without a legal mandate. Can management unilaterally revoke it?',
    options: [
      'No — it has ripened into a company practice protected by Art. 100 Non-Diminution of Benefits',
      'Yes — management prerogative is absolute',
      'Yes — with 5 days notice',
      'Only if approved by accounting',
    ],
    correctIndex: 0,
    statute: 'Art. 100, Labor Code',
    explanation: 'Consistent, deliberate, long-standing, unconditional grants ripen into demandable benefits that cannot be unilaterally withdrawn.',
  },
  {
    id: 'rw8',
    worldCode: 'w2',
    headline: '100% Service Charge Distribution',
    prompt: 'Under R.A. 11360 amending Art. 96, what share of service charges collected by hotels and restaurants belongs to covered employees?',
    options: [
      '100% distributed completely and equally among covered non-managerial employees',
      '85% to workers and 15% to management',
      '90% to workers and 10% for breakages',
      '50% to kitchen and 50% to owners',
    ],
    correctIndex: 0,
    statute: 'R.A. 11360 (Art. 96)',
    explanation: 'R.A. 11360 abolished the old 85%-15% split; 100% of collected service charges must go to covered rank-and-file/non-managerial workers.',
  },
];

export const PEACH_ROYAL_LEAVES_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'pl1',
    worldCode: 'w6',
    headline: 'Expanded Maternity Leave — Live Birth',
    prompt: 'Princess Peach (married private-sector worker) delivers a healthy baby. How many paid maternity leave days does R.A. 11210 grant?',
    options: ['105 days with full pay', '60 days with full pay', '78 days with full pay', '90 days with full pay'],
    correctIndex: 0,
    statute: 'R.A. 11210 Sec. 3',
    explanation: 'R.A. 11210 grants 105 days paid maternity leave for live childbirth regardless of whether delivery is normal or caesarean.',
  },
  {
    id: 'pl2',
    worldCode: 'w6',
    headline: 'Solo Parent Maternity Extension',
    prompt: 'If a female worker qualifies as a Solo Parent under R.A. 8972 / R.A. 11861, how many total paid maternity days apply for live childbirth?',
    options: ['120 days (105 + 15 additional days)', '112 days (105 + 7 days)', '135 days', '105 days only'],
    correctIndex: 0,
    statute: 'R.A. 11210 Sec. 3',
    explanation: 'Solo parent mothers receive an additional 15 days with full pay on top of 105 days, totaling 120 paid days.',
  },
  {
    id: 'pl3',
    worldCode: 'w6',
    headline: 'Paternity Leave Cap & Civil Status',
    prompt: 'Under R.A. 8187, who qualifies for 7-day Paternity Leave and up to how many deliveries of the legitimate spouse?',
    options: [
      'Married male employee cohabiting with his legitimate spouse, for the first 4 deliveries/miscarriages',
      'Any male employee regardless of marriage, unlimited deliveries',
      'Married male employee for the first 2 deliveries only',
      'Male employee after 3 years tenure',
    ],
    correctIndex: 0,
    statute: 'R.A. 8187 Sec. 2–3',
    explanation: 'Statutory 7-day Paternity Leave requires valid marriage and cohabitation with the legitimate spouse, capped at the first 4 deliveries.',
  },
  {
    id: 'pl4',
    worldCode: 'w6',
    headline: 'Expanded Solo Parents Welfare Act Tenure',
    prompt: 'Under R.A. 11861 (Expanded Solo Parents Welfare Act), how many months of service are required to earn the 7-day paid Parental Leave?',
    options: [
      'At least 6 months of service (reduced from 1 year)',
      'At least 12 months of service',
      'At least 24 months of service',
      'Zero tenure required on Day 1',
    ],
    correctIndex: 0,
    statute: 'R.A. 11861',
    explanation: 'R.A. 11861 lowered the service requirement from 1 year down to 6 months and raised the dependent child age threshold up to 22 years old.',
  },
  {
    id: 'pl5',
    worldCode: 'w6',
    headline: 'VAWC 10-Day Paid Leave',
    prompt: 'What document must a woman employee present to avail of the 10-day paid leave under R.A. 9262 (Anti-VAWC Act)?',
    options: [
      'Certification from Barangay Punong Barangay/Kagawad, Prosecutor, or Clerk of Court that an action is pending',
      'Final Supreme Court conviction of the offender',
      'Hospital surgical bill exceeding PHP 50,000',
      'SSS maternity notification',
    ],
    correctIndex: 0,
    statute: 'R.A. 9262 Sec. 43',
    explanation: 'Only a certification of pending VAWC action / protection order from the Barangay, Prosecutor, or Clerk of Court is required.',
  },
  {
    id: 'pl6',
    worldCode: 'w6',
    headline: 'Magna Carta of Women Surgery Leave',
    prompt: 'Under R.A. 9710 Sec. 18, a female employee with 6 months aggregate service in the last 12 months who undergoes gynecological surgery gets:',
    options: [
      'Special leave of up to 2 months with full pay based on gross monthly compensation',
      '15 days unpaid leave',
      '60 days SSS sickness benefit only',
      '7 days commutable leave',
    ],
    correctIndex: 0,
    statute: 'R.A. 9710 Sec. 18',
    explanation: 'Magna Carta of Women grants up to 2 months paid special leave following surgery caused by gynecological disorders.',
  },
  {
    id: 'pl7',
    worldCode: 'w6',
    headline: 'Service Incentive Leave vs Kasambahay Leave',
    prompt: 'Compare ordinary Art. 95 SIL (5 days) with R.A. 10361 Kasambahay SIL (5 days) when unused at year-end:',
    options: [
      'Art. 95 SIL is commutable to cash; Kasambahay 5-day leave is non-cumulative and non-convertible to cash',
      'Both are automatically convertible to cash',
      'Neither is convertible to cash',
      'Kasambahay leave is 10 days commutable',
    ],
    correctIndex: 0,
    statute: 'Art. 95 Labor Code vs R.A. 10361 Sec. 29',
    explanation: 'Ordinary rank-and-file unused SIL converts to cash, whereas Kasambahay 5-day leave is forfeited if unused and not cash-convertible.',
  },
  {
    id: 'pl8',
    worldCode: 'w6',
    headline: 'Miscarriage or Emergency Termination',
    prompt: 'How many paid days of maternity leave are granted under R.A. 11210 for miscarriage or emergency termination of pregnancy?',
    options: ['60 days with full pay', '105 days with full pay', '45 days with full pay', '30 days with full pay'],
    correctIndex: 0,
    statute: 'R.A. 11210 Sec. 3',
    explanation: 'Miscarriage or emergency termination of pregnancy entitles the female worker to 60 days maternity leave with full pay.',
  },
];

export const WARIO_DEDUCTION_AUDIT_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'wd1',
    worldCode: 'w3',
    headline: 'Mandatory Statutory Contributions',
    prompt: 'Wario deducts the employee’s statutory share of SSS, PhilHealth, Pag-IBIG, and BIR withholding tax without separate written consent. Lawful or Illegal?',
    options: [
      'Lawful — deductions mandated by law do not require individual employee consent',
      'Illegal — requires notarized waiver',
      'Illegal — employer must shoulder 100% for all salaries',
      'Lawful only for managerial staff',
    ],
    correctIndex: 0,
    statute: 'Art. 113, Labor Code',
    explanation: 'Statutory deductions (SSS, PhilHealth, Pag-IBIG, withholding tax) are expressly authorized by law.',
  },
  {
    id: 'wd2',
    worldCode: 'w3',
    headline: 'Unilateral Tool Breakage Deduction (50% of Pay)',
    prompt: 'A worker accidentally drops a wrench. Without a hearing and deducting 50% of weekly pay at once, Wario slashes the worker’s paycheck. Lawful or Illegal?',
    options: [
      'Illegal — loss/damage deductions require clear employee fault, due process hearing, fair cost, and cannot exceed 20% of weekly wage',
      'Lawful — property protection is absolute',
      'Lawful if below PHP 10,000',
      'Lawful if noted on payslip',
    ],
    correctIndex: 0,
    statute: 'Art. 114–115 & Omnibus Rules Book III Rule VIII Sec. 11',
    explanation: 'Loss/damage deductions require proof of clear employee responsibility, opportunity to be heard, fair value, and a strict 20% weekly wage deduction cap!',
  },
  {
    id: 'wd3',
    worldCode: 'w3',
    headline: 'Union Agency Fee for Non-Union Beneficiaries',
    prompt: 'Rank-and-file non-union employees accept benefits under the certified Union’s CBA. Can agency fees be checked off from their wages without individual authorization?',
    options: [
      'Lawful — Art. 259(e) authorizes agency fee check-off for non-union members who accept CBA benefits',
      'Illegal — violates freedom of association',
      'Only if approved by DOLE Regional Director',
      'Illegal unless employee joins union',
    ],
    correctIndex: 0,
    statute: 'Art. 113 & Art. 259(e), Labor Code',
    explanation: 'Non-union members of the bargaining unit who accept CBA benefits may be assessed a reasonable agency fee without individual written authorization.',
  },
  {
    id: 'wd4',
    worldCode: 'w3',
    headline: 'Written Authorization to Pay 3rd-Party Cooperative',
    prompt: 'An employee signs a free, written authorization directing payroll to remit PHP 500/month to their credit cooperative, and the employer receives zero kickback. Lawful or Illegal?',
    options: [
      'Lawful — Art. 113(b) allows third-party deductions with written employee authorization when the employer receives no pecuniary benefit',
      'Illegal — third-party payments are banned',
      'Requires Supreme Court approval',
      'Illegal if over PHP 200',
    ],
    correctIndex: 0,
    statute: 'Art. 113(b), Labor Code',
    explanation: 'Written employee authorization for payment to a third person is valid under Art. 113(b) provided the employer receives neither direct nor indirect kickback/pecuniary benefit.',
  },
  {
    id: 'wd5',
    worldCode: 'w3',
    headline: 'Forced Cash Deposit in Manufacturing',
    prompt: 'A standard shoe factory (no recognized custom or DOLE authorization) forces every new hire to post a PHP 5,000 cash bond via payroll deductions. Lawful or Illegal?',
    options: [
      'Illegal — Art. 114 prohibits requiring deposits for loss/damage unless recognized by DOLE as customary/necessary in that trade',
      'Lawful for all probationary hires',
      'Lawful if refunded after 5 years',
      'Lawful if kept in company vault',
    ],
    correctIndex: 0,
    statute: 'Art. 114, Labor Code',
    explanation: 'Employers cannot compel loss/damage deposits unless engaged in a trade recognized by the DOLE Secretary where deposits are necessary or desirable.',
  },
  {
    id: 'wd6',
    worldCode: 'w3',
    headline: 'Withholding Final Wages as Retaliation',
    prompt: 'An employee files a labor standards complaint, so Wario freezes their already-earned salary until they withdraw the complaint. Lawful or Illegal?',
    options: [
      'Illegal — Art. 116 makes it unlawful to withhold wages or induce kickbacks, and Art. 118 bars retaliation',
      'Lawful as management clearance hold',
      'Lawful for up to 6 months',
      'Allowed if stated in handbook',
    ],
    correctIndex: 0,
    statute: 'Art. 116 & Art. 118, Labor Code',
    explanation: 'Withholding earned wages by force, stealth, intimidation, or in retaliation for a labor complaint violates Articles 116 and 118.',
  },
  {
    id: 'wd7',
    worldCode: 'w4',
    headline: 'Kasambahay SSS Deduction at PHP 4,500 Wage',
    prompt: 'A Kasambahay earns PHP 4,500/month. The household employer deducts the employee share of SSS, PhilHealth, and Pag-IBIG from the PHP 4,500 wage. Lawful or Illegal?',
    options: [
      'Illegal — under R.A. 10361, if a Kasambahay’s monthly wage is less than PHP 5,000, the employer pays 100% of premium contributions',
      'Lawful — SSS is always 50/50',
      'Lawful after 6 months',
      'Illegal only in NCR',
    ],
    correctIndex: 0,
    statute: 'R.A. 10361 Sec. 30',
    explanation: 'When a Kasambahay earns less than PHP 5,000/month, the employer shoulders the entire statutory premium without deducting from the worker’s pay.',
  },
  {
    id: 'wd8',
    worldCode: 'w3',
    headline: 'Payment of Wages via Promissory Chits / Tokens',
    prompt: 'Instead of legal tender or compliant ATM payroll, Wario pays factory workers in redeemable Wario-Mart store coupons. Lawful or Illegal?',
    options: [
      'Illegal — Art. 102 strictly prohibits paying wages in promissory notes, vouchers, coupons, tokens, or chits',
      'Lawful if coupons include +5% bonus groceries',
      'Lawful if store is adjacent to plant',
      'Lawful with 51% worker vote',
    ],
    correctIndex: 0,
    statute: 'Art. 102, Labor Code',
    explanation: 'Art. 102 mandates payment in legal tender (or compliant bank/ATM payroll) and penalizes payment via chits, vouchers, or store tokens.',
  },
];

export const TOADSWORTH_RETIREMENT_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'tr1',
    worldCode: 'w5',
    headline: 'Statutory 22.5-Day Retirement Breakdown',
    prompt: 'Under R.A. 7641 (Art. 302), "one-half month salary" per year of service equals 22.5 days. How is 22.5 days composed?',
    options: [
      '15 days basic pay + 5 days Service Incentive Leave + 2.5 days (1/12 of 13th Month Pay)',
      '20 days basic pay + 2.5 days hazard pay',
      '22.5 calendar days straight basic pay',
      '15 days basic pay + 7.5 days loyalty bonus',
    ],
    correctIndex: 0,
    statute: 'Art. 302 (R.A. 7641) & Elegir v. PAL',
    explanation: 'Unless excluded by nature of employment, one-half month retirement salary = 15 days + 5 days SIL + 1/12 of 13th month pay (2.5 days) = 22.5 days.',
  },
  {
    id: 'tr2',
    worldCode: 'w5',
    headline: 'General Optional vs Compulsory Retirement Age',
    prompt: 'In the absence of a retirement plan or CBA, what are the optional and compulsory retirement ages for ordinary private-sector workers with >= 5 years service?',
    options: [
      'Optional at 60 years old; Compulsory at 65 years old',
      'Optional at 55 years old; Compulsory at 60 years old',
      'Optional at 62 years old; Compulsory at 67 years old',
      'Compulsory at 60 years old for everyone',
    ],
    correctIndex: 0,
    statute: 'Art. 302, Labor Code',
    explanation: 'Under R.A. 7641, general optional retirement starts at age 60 (with at least 5 years of service) and compulsory retirement is at age 65.',
  },
  {
    id: 'tr3',
    worldCode: 'w5',
    headline: 'Underground & Surface Mine Workers Age',
    prompt: 'Under R.A. 8558 and R.A. 10757, what are the optional and compulsory retirement ages for underground and surface mine workers?',
    options: [
      'Optional at 50 years old; Compulsory at 60 years old',
      'Optional at 55 years old; Compulsory at 65 years old',
      'Optional at 45 years old; Compulsory at 55 years old',
      'Same 60/65 rule as office workers',
    ],
    correctIndex: 0,
    statute: 'R.A. 8558 & R.A. 10757',
    explanation: 'Both underground and surface mine workers may optionally retire at 50 and compulsorily retire at 60 (with at least 5 years of service).',
  },
  {
    id: 'tr4',
    worldCode: 'w5',
    headline: 'Redundancy / Labor-Saving Device Separation Pay',
    prompt: 'Under Article 298, what separation pay rate applies to Redundancy or Installation of Labor-Saving Devices?',
    options: [
      '1 month pay OR 1 month pay per year of service, whichever is higher',
      '1 month pay OR 1/2 month pay per year of service, whichever is higher',
      '22.5 days per year of service',
      'No separation pay required',
    ],
    correctIndex: 0,
    statute: 'Art. 298, Labor Code',
    explanation: 'Redundancy and Installation of Labor-Saving Devices carry the higher tier: 1 month pay or 1 month pay for every year of service, whichever is higher.',
  },
  {
    id: 'tr5',
    worldCode: 'w5',
    headline: 'Retrenchment to Prevent Losses Separation Pay',
    prompt: 'What statutory separation pay rate applies to valid Retrenchment to Prevent Losses or Closure NOT due to serious business losses?',
    options: [
      '1 month pay OR 1/2 month pay per year of service, whichever is higher',
      '1 month pay per year of service',
      'Zero separation pay',
      '2 months pay per year of service',
    ],
    correctIndex: 0,
    statute: 'Art. 298, Labor Code',
    explanation: 'Retrenchment and Closure not due to serious business losses entitle workers to 1 month pay or 1/2 month pay per year of service, whichever is higher (a fraction of >= 6 months counts as 1 whole year).',
  },
  {
    id: 'tr6',
    worldCode: 'w5',
    headline: 'Disease Ground Under Article 299',
    prompt: 'To validly terminate employment due to Disease (Art. 299), whose certification is strictly required in addition to separation pay?',
    options: [
      'Competent public health authority certifying the disease cannot be cured within 6 months even with proper medical treatment',
      'Company nurse or private clinic physician alone',
      'HR Manager medical memo',
      'SSS clerk receipt',
    ],
    correctIndex: 0,
    statute: 'Art. 299, Labor Code',
    explanation: 'A certification by a competent public health authority (not merely a company doctor) is an indispensable substantive requirement under Art. 299.',
  },
  {
    id: 'tr7',
    worldCode: 'w5',
    headline: 'Small Establishment Exemption in R.A. 7641',
    prompt: 'Which establishments are exempt from mandatory retirement pay under R.A. 7641?',
    options: [
      'Retail, service, and agricultural establishments or operations employing not more than 10 employees',
      'Establishments employing fewer than 50 employees',
      'All family corporations',
      'BPO companies under PEZA',
    ],
    correctIndex: 0,
    statute: 'Art. 302 (R.A. 7641)',
    explanation: 'Retail, service, and agricultural establishments employing not more than 10 employees or workers are exempted from R.A. 7641 coverage.',
  },
  {
    id: 'tr8',
    worldCode: 'w5',
    headline: '30-Day Dual Notice for Authorized Causes',
    prompt: 'Before implementing Redundancy or Retrenchment, whom must the employer serve written notice upon, and how far in advance?',
    options: [
      'Both the affected employee AND the DOLE Regional Office at least 30 days (1 month) before the effective date',
      'Only the employee 5 calendar days before termination',
      'Only the union president on the day of layoff',
      'NLRC Labor Arbiter 15 days after termination',
    ],
    correctIndex: 0,
    statute: 'Art. 298, Labor Code',
    explanation: 'Authorized causes require separate written notices to BOTH the worker and DOLE at least 1 month (30 days) prior to the intended date of termination.',
  },
];

interface MasterVaultGameCommonProps {
  equippedAvatar: MarioAvatar;
  onEarnCoins: (amount: number) => void;
  onQuizCompleted?: (payload: {
    worldCode: string;
    correctCount: number;
    totalCount: number;
    isBossVictory?: boolean;
    topicTitle?: string;
  }) => void;
}

/**
 * Bespoke Interactive Game Stage for each Master Arcade Title
 */
const InteractiveMasterArcadeStage: React.FC<{
  gameTitle: string;
  stageNum: number;
  totalStages: number;
  options: string[];
  pickedOption: number | null;
  correctIndex: number;
  onPickOption: (idx: number) => void;
  streak: number;
}> = ({
  gameTitle,
  stageNum,
  totalStages,
  options,
  pickedOption,
  correctIndex,
  onPickOption,
}) => {
  const [trainWhistleActive, setTrainWhistleActive] = useState(false);
  const [yoshiTrackLever, setYoshiTrackLever] = useState<number>(0);
  const [uvChannelIdx, setUvChannelIdx] = useState<number>(0);
  const [aimAngle, setAimAngle] = useState(45);
  const [flashlightPos, setFlashlightPos] = useState({ x: 50, y: 50 });
  const [peachSealLocked, setPeachSealLocked] = useState(false);
  const [vaultDialDeg, setVaultDialDeg] = useState(90);
  const [tribunalCounterweight, setTribunalCounterweight] = useState<'22.5d' | 'mine' | 'exempt'>('22.5d');

  // 1. Yoshi Overtime Express — Live Railway Switcher Simulator
  if (gameTitle.includes('Yoshi')) {
    const trackLabels = ['125% Ord OT', '169% RD-OT', '260% Hol-OT'];
    const handleWhistle = () => {
      setTrainWhistleActive(true);
      setYoshiTrackLever((prev) => (prev + 1) % trackLabels.length);
      marioAudio.playPowerUp();
      setTimeout(() => setTrainWhistleActive(false), 800);
    };

    return (
      <div className="bg-slate-900 border-3 border-emerald-500 rounded-3xl p-4 sm:p-5 text-white shadow-[0_6px_0_#000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/40 pb-2.5">
          <div className="flex items-center gap-2">
            <Train className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-mario text-[11px] text-emerald-300 uppercase">
              Yoshi Overtime Locomotive · Station #{stageNum}/{totalStages}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {trackLabels.map((lbl, idx) => (
              <button
                key={lbl}
                type="button"
                onClick={() => {
                  setYoshiTrackLever(idx);
                  marioAudio.playClick();
                }}
                className={`px-2 py-1 rounded-lg font-mono text-[10px] font-black border cursor-pointer ${
                  yoshiTrackLever === idx
                    ? 'bg-emerald-400 text-slate-950 border-black'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {lbl}
              </button>
            ))}
            <button
              type="button"
              onClick={handleWhistle}
              title="Switch Track & Blow Whistle"
              className="px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] border border-black shadow-[0_2px_0_#000] cursor-pointer flex items-center gap-1 active:translate-y-0.5"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>SWITCH TRACK</span>
            </button>
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-sky-950 via-slate-950 to-emerald-950 rounded-2xl border-2 border-emerald-600/60 p-3.5 flex flex-col justify-between gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-2xl bg-emerald-500 border-2 border-black shadow-[0_3px_0_#000] ${trainWhistleActive ? 'animate-bounce' : ''}`}>
                <MarioCharacterAvatar character="yoshi" className="w-8 h-8" />
              </div>
              <div className="bg-black/75 px-3 py-1.5 rounded-xl border border-emerald-400/50 text-xs font-bold text-emerald-200">
                <span>Active Lever: {trackLabels[yoshiTrackLever]} · Pick the controlling Art. 87 rule below!</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-black text-amber-300 font-mono text-xs border border-slate-700 tabular-nums">
              {trainWhistleActive ? '120 MPH' : `${55 + stageNum * 5} MPH`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {options.map((opt, i) => {
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              let trackColor = 'bg-slate-950/95 hover:bg-emerald-950/80 border-slate-700 text-slate-100';
              if (pickedOption !== null) {
                if (isRight) {
                  trackColor = 'bg-emerald-600 text-white border-black ring-2 ring-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.8)]';
                } else if (isSelected) {
                  trackColor = 'bg-rose-600 text-white border-black';
                } else {
                  trackColor = 'bg-slate-950/50 text-slate-500 border-slate-800';
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={pickedOption !== null}
                  onClick={() => onPickOption(i)}
                  className={`p-3 rounded-xl border-2 text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${trackColor}`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-black text-amber-300 font-mario text-[10px] flex items-center justify-center shrink-0 border border-slate-700 mt-0.5">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-xs sm:text-sm font-bold leading-snug break-words whitespace-normal">{opt}</span>
                  </div>
                  {pickedOption !== null && isRight && (
                    <span className="text-[10px] font-mario text-amber-300 shrink-0 mt-0.5">CLEAR!</span>
                  )}
                  {pickedOption !== null && isSelected && !isRight && (
                    <MarioThwompIcon className="w-5 h-5 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2. Luigi Night-Shift Poltergust — Ghost Vacuum Arena
  if (gameTitle.includes('Luigi')) {
    const uvChannels = ['+10% NSD', '137.5% OT-NSD', '220% RegHol-NSD'];
    return (
      <div className="bg-slate-900 border-3 border-indigo-500 rounded-3xl p-4 sm:p-5 text-white shadow-[0_6px_0_#000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-500/40 pb-2.5">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-400 shrink-0" />
            <span className="font-mario text-[11px] text-indigo-300 uppercase">
              Graveyard Shift Vacuum · 10:00 PM – 6:00 AM Window
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {uvChannels.map((ch, idx) => (
              <button
                key={ch}
                type="button"
                onClick={() => {
                  setUvChannelIdx(idx);
                  marioAudio.playClick();
                }}
                className={`px-2 py-1 rounded-lg font-mono text-[10px] font-black border cursor-pointer ${
                  uvChannelIdx === idx
                    ? 'bg-indigo-400 text-slate-950 border-black'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        <div
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setFlashlightPos({
              x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
              y: Math.round(((e.clientY - rect.top) / rect.height) * 100),
            });
          }}
          className="relative bg-gradient-to-b from-slate-950 via-indigo-950/80 to-black rounded-2xl border-2 border-indigo-600/60 p-3.5 overflow-hidden flex flex-col justify-between gap-3"
        >
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-75"
            style={{
              background: `radial-gradient(circle 110px at ${flashlightPos.x}% ${flashlightPos.y}%, rgba(254, 240, 138, 0.22) 0%, rgba(15, 23, 42, 0.85) 75%)`,
            }}
          />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-indigo-500 border-2 border-black shadow-[0_3px_0_#000]">
                <MarioCharacterAvatar character="luigi" className="w-8 h-8" />
              </div>
              <div className="bg-black/80 px-3 py-1.5 rounded-xl border border-indigo-400/50 text-xs font-bold text-indigo-200">
                <span>UV Filter: {uvChannels[uvChannelIdx]} · Spotlight &amp; vacuum the lawful night-shift ruling!</span>
              </div>
            </div>
            <span className="text-xs text-amber-300 font-mono bg-black/70 px-2.5 py-1 rounded-lg border border-slate-700 tabular-nums">
              02:45 AM Graveyard
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative z-10">
            {options.map((opt, i) => {
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              let ghostBox = 'bg-slate-950/95 hover:bg-indigo-950/80 border-slate-700 text-slate-100';
              if (pickedOption !== null) {
                if (isRight) {
                  ghostBox = 'bg-indigo-600 text-white border-black ring-2 ring-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.8)]';
                } else if (isSelected) {
                  ghostBox = 'bg-rose-600 text-white border-black';
                } else {
                  ghostBox = 'bg-slate-950/50 text-slate-500 border-slate-800';
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={pickedOption !== null}
                  onClick={() => onPickOption(i)}
                  className={`p-3 rounded-xl border-2 text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${ghostBox}`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <MarioBooIcon className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-bold leading-snug break-words whitespace-normal">{opt}</span>
                  </div>
                  {pickedOption !== null && isRight && (
                    <span className="text-[10px] font-mario text-emerald-300 shrink-0 mt-0.5">VACUUMED!</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 3. Rosalina's Star Wage Observatory — Celestial Telescope
  if (gameTitle.includes('Rosalina')) {
    return (
      <div className="bg-slate-900 border-3 border-sky-500 rounded-3xl p-4 sm:p-5 text-white shadow-[0_6px_0_#000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-500/40 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400 shrink-0" />
            <span className="font-mario text-[11px] text-sky-300 uppercase">
              Comet Observatory · Wage Constellations
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-sky-200">
            <button
              type="button"
              onClick={() => {
                setAimAngle((prev) => (prev + 325) % 360);
                marioAudio.playClick();
              }}
              className="px-2 py-0.5 rounded bg-slate-950 border border-sky-400/50 text-sky-300 hover:bg-sky-900/50 cursor-pointer"
            >
              -35°
            </button>
            <span className="px-2 py-0.5 rounded bg-black text-amber-300 border border-slate-700 tabular-nums">
              {aimAngle}°
            </span>
            <button
              type="button"
              onClick={() => {
                setAimAngle((prev) => (prev + 35) % 360);
                marioAudio.playClick();
              }}
              className="px-2 py-0.5 rounded bg-slate-950 border border-sky-400/50 text-sky-300 hover:bg-sky-900/50 cursor-pointer"
            >
              +35°
            </button>
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-indigo-950 via-slate-950 to-sky-950 rounded-2xl border-2 border-sky-600/60 p-3.5 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-sky-500 border-2 border-black shadow-[0_3px_0_#000]">
              <MarioCharacterAvatar character="rosalina" className="w-8 h-8" />
            </div>
            <div className="bg-black/80 px-3 py-1.5 rounded-xl border border-sky-400/50 text-xs font-bold text-sky-200">
              <span>Rotate telescope turret ({aimAngle}°) and lock the controlling Supreme Court wage doctrine!</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {options.map((opt, i) => {
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              let starStyle = 'bg-slate-950/95 hover:bg-sky-950/80 border-slate-700 text-slate-100';
              if (pickedOption !== null) {
                if (isRight) {
                  starStyle = 'bg-sky-400 text-slate-950 border-black ring-2 ring-sky-200 font-black shadow-[0_0_12px_rgba(56,189,248,0.8)]';
                } else if (isSelected) {
                  starStyle = 'bg-rose-600 text-white border-black';
                } else {
                  starStyle = 'bg-slate-950/50 text-slate-500 border-slate-800';
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={pickedOption !== null}
                  onClick={() => {
                    setAimAngle(30 + i * 35);
                    onPickOption(i);
                  }}
                  className={`p-3 rounded-xl border-2 text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${starStyle}`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <MarioStarIcon className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-bold leading-snug break-words whitespace-normal">{opt}</span>
                  </div>
                  {pickedOption !== null && isRight && (
                    <span className="text-[10px] font-mario text-slate-950 shrink-0 mt-0.5">ALIGNED!</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 4. Peach's Royal Leave Dispatch — Royal Mail Sorting
  if (gameTitle.includes('Peach')) {
    return (
      <div className="bg-slate-900 border-3 border-pink-500 rounded-3xl p-4 sm:p-5 text-white shadow-[0_6px_0_#000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-500/40 pb-2.5">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-pink-400 shrink-0" />
            <span className="font-mario text-[11px] text-pink-300 uppercase">
              Princess Peach Royal Leave Dispatch Desk
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setPeachSealLocked((v) => !v);
              marioAudio.playCoin();
            }}
            className={`px-2.5 py-1 rounded-xl border font-black text-[10px] cursor-pointer ${
              peachSealLocked
                ? 'bg-pink-400 text-slate-950 border-black'
                : 'bg-black/60 text-pink-300 border-pink-500/60'
            }`}
          >
            {peachSealLocked ? 'ROYAL SEAL ARMED' : 'ARM ROYAL WAX SEAL'}
          </button>
        </div>

        <div className="relative bg-gradient-to-b from-pink-950 via-slate-950 to-purple-950 rounded-2xl border-2 border-pink-600/60 p-3.5 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-pink-500 border-2 border-black shadow-[0_3px_0_#000]">
              <MarioCharacterAvatar character="peach" className="w-8 h-8" />
            </div>
            <div className="bg-black/80 px-3 py-1.5 rounded-xl border border-pink-400/50 text-xs font-bold text-pink-200 flex items-center gap-2">
              <Scroll className="w-4 h-4 text-pink-300 shrink-0" />
              <span>File the statutory leave petition into the certified World 6 chute!</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {options.map((opt, i) => {
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              let chuteStyle = 'bg-slate-950/95 hover:bg-pink-950/80 border-slate-700 text-slate-100';
              if (pickedOption !== null) {
                if (isRight) {
                  chuteStyle = 'bg-pink-400 text-slate-950 border-black ring-2 ring-pink-200 font-black shadow-[0_0_12px_rgba(236,72,153,0.8)]';
                } else if (isSelected) {
                  chuteStyle = 'bg-rose-600 text-white border-black';
                } else {
                  chuteStyle = 'bg-slate-950/50 text-slate-500 border-slate-800';
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={pickedOption !== null}
                  onClick={() => onPickOption(i)}
                  className={`p-3 rounded-xl border-2 text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${chuteStyle}`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Stamp className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-bold leading-snug break-words whitespace-normal">{opt}</span>
                  </div>
                  {pickedOption !== null && isRight && (
                    <span className="text-[10px] font-mario text-slate-950 shrink-0 mt-0.5">STAMPED!</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 5. Wario's Payroll Deduction Vault — Mechanical Safe Cracker
  if (gameTitle.includes('Wario')) {
    return (
      <div className="bg-slate-900 border-3 border-amber-500 rounded-3xl p-4 sm:p-5 text-white shadow-[0_6px_0_#000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/40 pb-2.5">
          <div className="flex items-center gap-2">
            <Vault className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-mario text-[11px] text-amber-300 uppercase">
              Wario Treasury · Mechanical Safe Combination
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <button
              type="button"
              data-testid="wario-dial-left-btn"
              onClick={() => {
                setVaultDialDeg((d) => (d + 315) % 360);
                marioAudio.playClick();
              }}
              className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-amber-500/60 hover:bg-amber-950 cursor-pointer font-black"
            >
              Dial -45°
            </button>
            <span className="text-amber-300 bg-black px-2 py-0.5 rounded border border-amber-600/50 tabular-nums">
              {vaultDialDeg}°
            </span>
            <button
              type="button"
              data-testid="wario-dial-right-btn"
              onClick={() => {
                setVaultDialDeg((d) => (d + 45) % 360);
                marioAudio.playClick();
              }}
              className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-amber-500/60 hover:bg-amber-950 cursor-pointer font-black"
            >
              Dial +45°
            </button>
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-amber-950 via-slate-950 to-yellow-950 rounded-2xl border-2 border-amber-600/60 p-3.5 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500 border-2 border-black shadow-[0_3px_0_#000] shrink-0">
              <MarioCharacterAvatar character="wario" className="w-8 h-8" />
            </div>
            <div className="bg-black/80 px-3 py-1.5 rounded-xl border border-amber-400/50 text-xs font-bold text-amber-200">
              <span>Safe Tumbler #{stageNum} ({vaultDialDeg}°) · Audit Wario&apos;s payroll safe &amp; rule on lawful vs. illegal deductions!</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {options.map((opt, i) => {
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              let vaultStyle = 'bg-slate-950/95 hover:bg-amber-950/80 border-slate-700 text-slate-100';
              if (pickedOption !== null) {
                if (isRight) {
                  vaultStyle = 'bg-amber-400 text-slate-950 border-black ring-2 ring-amber-200 font-black shadow-[0_0_12px_rgba(251,191,36,0.8)]';
                } else if (isSelected) {
                  vaultStyle = 'bg-rose-600 text-white border-black';
                } else {
                  vaultStyle = 'bg-slate-950/50 text-slate-500 border-slate-800';
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={pickedOption !== null}
                  onClick={() => {
                    setVaultDialDeg(45 + i * 90);
                    onPickOption(i);
                  }}
                  className={`p-3 rounded-xl border-2 text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${vaultStyle}`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Coins className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-bold leading-snug break-words whitespace-normal">{opt}</span>
                  </div>
                  {pickedOption !== null && isRight && (
                    <span className="text-[10px] font-mario text-slate-950 shrink-0 mt-0.5">CRACKED!</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 6. Toadsworth's Retirement Tribunal — Scale of Justice
  return (
    <div className="bg-slate-900 border-3 border-amber-600 rounded-3xl p-4 sm:p-5 text-white shadow-[0_6px_0_#000] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-600/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="font-mario text-[11px] text-amber-300 uppercase">
            Chancellor Toadsworth Retirement Scale of Justice
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {(
            [
              { id: '22.5d' as const, label: '22.5d Formula' },
              { id: 'mine' as const, label: 'Mine 50–60' },
              { id: 'exempt' as const, label: '<=10 Exempt' },
            ]
          ).map((cw) => (
            <button
              key={cw.id}
              type="button"
              onClick={() => {
                setTribunalCounterweight(cw.id);
                marioAudio.playClick();
              }}
              className={`px-2 py-0.5 rounded-lg font-mono text-[10px] font-black border cursor-pointer ${
                tribunalCounterweight === cw.id
                  ? 'bg-amber-400 text-slate-950 border-black'
                  : 'bg-slate-950 text-amber-200 border-amber-700/60'
              }`}
            >
              {cw.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative bg-gradient-to-b from-stone-950 via-slate-950 to-amber-950 rounded-2xl border-2 border-amber-700/60 p-3.5 flex flex-col justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-amber-600 border-2 border-black shadow-[0_3px_0_#000]">
            <MarioCharacterAvatar character="capttoad" className="w-8 h-8" />
          </div>
          <div className="bg-black/80 px-3 py-1.5 rounded-xl border border-amber-500/50 text-xs font-bold text-amber-200">
            <span>Scale Weight: {tribunalCounterweight} · Balance the statutory R.A. 7641 &amp; separation pay formula!</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {options.map((opt, i) => {
            const isSelected = pickedOption === i;
            const isRight = i === correctIndex;
            let scaleStyle = 'bg-slate-950/95 hover:bg-stone-900 border-slate-700 text-slate-100';
            if (pickedOption !== null) {
              if (isRight) {
                scaleStyle = 'bg-amber-400 text-slate-950 border-black ring-2 ring-amber-200 font-black shadow-[0_0_12px_rgba(245,158,11,0.8)]';
              } else if (isSelected) {
                scaleStyle = 'bg-rose-600 text-white border-black';
              } else {
                scaleStyle = 'bg-slate-950/50 text-slate-500 border-slate-800';
              }
            }

            return (
              <button
                key={i}
                type="button"
                disabled={pickedOption !== null}
                onClick={() => onPickOption(i)}
                className={`p-3 rounded-xl border-2 text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${scaleStyle}`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <Scale className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-bold leading-snug break-words whitespace-normal">{opt}</span>
                </div>
                {pickedOption !== null && isRight && (
                  <span className="text-[10px] font-mario text-slate-950 shrink-0 mt-0.5">BALANCED!</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface ThemedMasterArcadeEngineProps extends MasterVaultGameCommonProps {
  gameTitle: string;
  kickerBadge: string;
  description: string;
  bannerGradientClass: string;
  accentButtonClass: string;
  icon: React.ReactNode;
  bank: readonly MasterArcadeScenario[];
  deckCount?: number;
  victoryCoins: number;
  reportWorldCode: string;
}

const ThemedMasterArcadeEngine: React.FC<ThemedMasterArcadeEngineProps> = ({
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
  deckCount = 6,
  victoryCoins,
  reportWorldCode,
}) => {
  const [phase, setPhase] = useState<'TITLE' | 'PLAYING' | 'VICTORY' | 'GAME_OVER'>('TITLE');
  const [deck, setDeck] = useState<MasterArcadeScenario[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pickedOption, setPickedOption] = useState<number | null>(null);

  const startRun = useCallback(() => {
    const fresh = drawUniqueFromDeck(
      `master_vault_${gameTitle}`,
      bank,
      Math.min(deckCount, bank.length)
    ).map((item) => {
      const shuf = shuffleChoiceOptionsSafely(item.options, item.correctIndex);
      return {
        ...item,
        options: shuf.options,
        correctIndex: shuf.correctIndex,
      };
    });
    setDeck(fresh);
    setCurrentIdx(0);
    setHearts(3);
    setScore(0);
    setStreak(0);
    setPickedOption(null);
    setPhase('PLAYING');
    marioAudio.playPowerUp();
  }, [bank, deckCount, gameTitle]);

  const currentItem = deck[currentIdx];

  const handleChooseOption = (idx: number) => {
    if (pickedOption !== null || !currentItem) return;
    setPickedOption(idx);
    const isCorrect = idx === currentItem.correctIndex;
    if (isCorrect) {
      const nextScore = score + 1;
      const nextStreak = streak + 1;
      setScore(nextScore);
      setStreak(nextStreak);
      onEarnCoins(nextStreak >= 3 ? 5 : 3);
      awardUserXp({ amount: 25 + nextStreak * 5, reason: `${gameTitle} Stage Cleared` });
      marioAudio.playCoin();
    } else {
      const nextHearts = hearts - 1;
      setHearts(nextHearts);
      setStreak(0);
      marioAudio.playWrongAnswer();
      if (nextHearts <= 0) {
        awardUserXp({ amount: 15, reason: `${gameTitle} Effort` });
        onQuizCompleted?.({
          worldCode: reportWorldCode,
          correctCount: score,
          totalCount: deck.length,
          topicTitle: gameTitle,
        });
      }
    }
  };

  const handleAdvance = () => {
    if (hearts <= 0) {
      setPhase('GAME_OVER');
      return;
    }
    if (currentIdx + 1 >= deck.length) {
      onEarnCoins(victoryCoins);
      awardUserXp({ amount: 100, reason: `${gameTitle} Grand Master Clear` });
      marioAudio.playQuizComplete();
      onQuizCompleted?.({
        worldCode: reportWorldCode,
        correctCount: score,
        totalCount: deck.length,
        topicTitle: gameTitle,
      });
      setPhase('VICTORY');
      return;
    }
    setCurrentIdx((i) => i + 1);
    setPickedOption(null);
    marioAudio.playJump();
  };

  return (
    <div className="bg-slate-950 rounded-3xl border-4 border-black shadow-[6px_6px_0_#000] overflow-hidden text-white">
      {/* Arcade Header HUD */}
      <div className={`p-4 sm:p-6 border-b-4 border-black ${bannerGradientClass}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 border-3 border-black flex items-center justify-center shadow-[0_3px_0_#000] shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-amber-300 font-mario block truncate">
                {kickerBadge}
              </span>
              <h3 className="text-lg sm:text-2xl font-black font-display text-white truncate">
                {gameTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="flex items-center gap-1 bg-black/50 px-2.5 py-1.5 rounded-xl border border-white/15">
              {[0, 1, 2].map((h) => (
                <Heart
                  key={h}
                  className={`w-4 h-4 ${
                    h < hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <div className="bg-black/50 px-3 py-1.5 rounded-xl border border-white/15 text-xs font-black tabular-nums text-amber-300">
              {phase === 'PLAYING' ? `Stage ${currentIdx + 1}/${deck.length}` : `${deckCount} Stages`}
            </div>
          </div>
        </div>
      </div>

      {/* Stage Body */}
      <div className="p-4 sm:p-7">
        {phase === 'TITLE' && (
          <div className="text-center py-6 space-y-5 max-w-xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border-2 border-amber-400">
              <MarioCharacterAvatar character={equippedAvatar} className="w-11 h-11" />
            </div>
            <p className="text-sm sm:text-base text-slate-200 font-semibold leading-relaxed">
              {description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-300">
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{deckCount} Non-Repeating Scenarios</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 inline-flex items-center gap-1.5 text-amber-300">
                <MarioCoinIcon className="w-4 h-4" />
                <span>+{victoryCoins} Clear Bounty</span>
              </span>
            </div>
            <button
              type="button"
              onClick={startRun}
              className={`min-h-[48px] max-w-full px-5 sm:px-7 py-2.5 rounded-2xl border-3 border-black shadow-[0_4px_0_#000] font-black text-xs sm:text-base leading-tight text-center inline-flex items-center justify-center gap-2 cursor-pointer ${accentButtonClass}`}
            >
              <Play className="w-5 h-5 fill-current shrink-0" />
              <span>Start {gameTitle}</span>
            </button>
          </div>
        )}

        {phase === 'PLAYING' && currentItem && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300">
                Case #{currentIdx + 1}: {currentItem.headline}
              </span>
              {streak >= 2 && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-black">
                  {streak}x Streak Bonus Active!
                </span>
              )}
            </div>

            {/* Prompt Statement */}
            <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 sm:p-5">
              <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed">
                {currentItem.prompt}
              </p>
            </div>

            {/* Bespoke Interactive Game Stage for this game */}
            <InteractiveMasterArcadeStage
              gameTitle={gameTitle}
              stageNum={currentIdx + 1}
              totalStages={deck.length}
              options={currentItem.options}
              pickedOption={pickedOption}
              correctIndex={currentItem.correctIndex}
              onPickOption={handleChooseOption}
              streak={streak}
            />

            {/* Feedback & Advance Panel */}
            {pickedOption !== null && (
              <div
                className={`rounded-2xl p-4 border-2 space-y-1.5 ${
                  pickedOption === currentItem.correctIndex
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-100'
                    : 'bg-rose-950/70 border-rose-500 text-rose-100'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black">
                  <span className="inline-flex items-center gap-1.5">
                    {pickedOption === currentItem.correctIndex ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>STATUTORY HIT!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>MISSED RULING (-1 HEART)</span>
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
                    className="min-h-[42px] px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm border-2 border-black inline-flex items-center gap-1.5 cursor-pointer shadow-[0_2px_0_#000]"
                  >
                    <span>
                      {hearts <= 0
                        ? 'View Run Summary'
                        : currentIdx + 1 >= deck.length
                        ? 'Claim Victory Coins'
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
            <h4 className="text-2xl sm:text-3xl font-black font-display text-white">
              STAGE CLEARED! ({score}/{deck.length})
            </h4>
            <p className="text-xs sm:text-sm font-bold text-emerald-300 inline-flex items-center gap-1.5">
              <MarioCoinIcon className="w-4 h-4" />
              <span>+{victoryCoins} Bonus Gold Coins &amp; +100 XP Added!</span>
            </p>
            <div>
              <button
                type="button"
                onClick={startRun}
                className="min-h-[46px] px-6 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Play Fresh Deck</span>
              </button>
            </div>
          </div>
        )}

        {phase === 'GAME_OVER' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-600 border-3 border-black mx-auto flex items-center justify-center text-white">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black font-display text-white">
              OUT OF HEARTS ({score}/{deck.length} CLEARED)
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Every retry deals a freshly shuffled statutory scenario order so you keep sharpening new angles!
            </p>
            <button
              type="button"
              onClick={startRun}
              className="min-h-[46px] px-6 py-2 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>Retry With Shuffled Deck</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const YoshiOvertimeExpressGame: React.FC<MasterVaultGameCommonProps> = (props) => (
  <ThemedMasterArcadeEngine
    {...props}
    gameTitle="Yoshi's Overtime Ledger Express"
    kickerBadge="WORLD 1-2 • HOURS, BREAKS &amp; OT MULTIPLIERS"
    description="Inspect timecards aboard Yoshi's Express! Rule on ordinary overtime (125%), rest/holiday overtime (169% / 260% / 338%), short breaks, brownouts, and the strict Art. 88 non-offsetting rule."
    bannerGradientClass="bg-gradient-to-r from-emerald-800 via-green-800 to-slate-900"
    accentButtonClass="bg-lime-400 hover:bg-lime-300 text-slate-950"
    icon={<Clock className="w-6 h-6" />}
    bank={YOSHI_OVERTIME_EXPRESS_BANK}
    victoryCoins={25}
    reportWorldCode="w1"
  />
);

export const LuigiNightShiftPoltergustGame: React.FC<MasterVaultGameCommonProps> = (props) => (
  <ThemedMasterArcadeEngine
    {...props}
    gameTitle="Luigi's Night-Shift Poltergust"
    kickerBadge="10:00 PM – 6:00 AM • ART. 86 &amp; R.A. 10151"
    description="Patrol the graveyard shift from 10:00 PM to 6:00 AM! Master the +10% Night Shift Differential, multiplicative OT/Holiday stacking (137.5%, 143%, 220%), &lt;=5 retail exemptions, and Night Worker health rights."
    bannerGradientClass="bg-gradient-to-r from-indigo-900 via-emerald-950 to-slate-950"
    accentButtonClass="bg-emerald-400 hover:bg-emerald-300 text-slate-950"
    icon={<Moon className="w-6 h-6" />}
    bank={LUIGI_NIGHTSHIFT_BANK}
    victoryCoins={25}
    reportWorldCode="w1"
  />
);

export const RosalinaWageObservatoryGame: React.FC<MasterVaultGameCommonProps> = (props) => (
  <ThemedMasterArcadeEngine
    {...props}
    gameTitle="Rosalina's Star Wage Observatory"
    kickerBadge="WORLD 3 • WAGES, DISTORTION &amp; D.O. 174"
    description="Chart cosmic payroll constellations! Distinguish Facilities vs. Supplements (Purpose Test), PHP 5M D.O. 174 capital, Art. 124 Wage Distortion, R.A. 8188 Double Indemnity, and 100% Service Charges."
    bannerGradientClass="bg-gradient-to-r from-sky-900 via-blue-950 to-indigo-950"
    accentButtonClass="bg-sky-400 hover:bg-sky-300 text-slate-950"
    icon={<Sparkles className="w-6 h-6" />}
    bank={ROSALINA_WAGE_MATRIX_BANK}
    victoryCoins={30}
    reportWorldCode="w3"
  />
);

export const PeachRoyalLeaveDispatchGame: React.FC<MasterVaultGameCommonProps> = (props) => (
  <ThemedMasterArcadeEngine
    {...props}
    gameTitle="Peach's Royal Leave Dispatch"
    kickerBadge="WORLD 6 • STATUTORY LEAVES &amp; SPECIAL LAWS"
    description="Stamp Royal HR leave applications with precision! Verify exact day caps and eligibility across 105d/120d/60d Maternity, 7d Paternity, 7d Solo Parent (6-mo tenure), 10d VAWC, 2-mo Gynecological, and SIL."
    bannerGradientClass="bg-gradient-to-r from-pink-800 via-rose-900 to-purple-950"
    accentButtonClass="bg-pink-300 hover:bg-pink-200 text-slate-950"
    icon={<Stamp className="w-6 h-6" />}
    bank={PEACH_ROYAL_LEAVES_BANK}
    victoryCoins={30}
    reportWorldCode="w6"
  />
);

export const WarioDeductionVaultGame: React.FC<MasterVaultGameCommonProps> = (props) => (
  <ThemedMasterArcadeEngine
    {...props}
    gameTitle="Wario's Payroll Deduction Vault"
    kickerBadge="ARTS. 102 &amp; 113–118 • LAWFUL VS ILLEGAL"
    description="Audit Wario's treasury chests! Approve lawful tax/SSS/agency-fee/consented 3rd-party deductions and reject illegal chits, unconsented breakage cuts (>20% weekly cap), and retaliatory wage holds."
    bannerGradientClass="bg-gradient-to-r from-amber-800 via-yellow-900 to-purple-950"
    accentButtonClass="bg-amber-400 hover:bg-amber-300 text-slate-950"
    icon={<Vault className="w-6 h-6" />}
    bank={WARIO_DEDUCTION_AUDIT_BANK}
    victoryCoins={25}
    reportWorldCode="w3"
  />
);

export const ToadsworthRetirementTribunalGame: React.FC<MasterVaultGameCommonProps> = (props) => (
  <ThemedMasterArcadeEngine
    {...props}
    gameTitle="Toadsworth's Retirement &amp; Separation Tribunal"
    kickerBadge="ARTS. 298–302 • R.A. 7641 &amp; SEPARATION PAY"
    description="Preside with Chancellor Toadsworth over R.A. 7641 22.5-day retirement formulas, 50–60 mine worker retirement ages, &lt;=10 retail exemptions, and Art. 298/299 separation pay tiers."
    bannerGradientClass="bg-gradient-to-r from-amber-900 via-stone-900 to-slate-950"
    accentButtonClass="bg-amber-300 hover:bg-amber-200 text-slate-950"
    icon={<Scale className="w-6 h-6" />}
    bank={TOADSWORTH_RETIREMENT_BANK}
    victoryCoins={30}
    reportWorldCode="w5"
  />
);
