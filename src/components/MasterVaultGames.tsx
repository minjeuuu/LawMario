import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MarioAvatar } from '../types/laborLaw';
import {
  MarioCharacterAvatar,
  MarioCoinIcon,
  MarioStarIcon,
  MarioBooIcon,
  MarioThwompIcon,
  MarioMushroomIcon,
  MarioFlagIcon,
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
    options: [
      '125% of regular hourly rate (100% regular wage + 25% statutory overtime premium)',
      '130% of regular hourly rate (100% regular wage + 30% statutory rest day premium)',
      '150% of regular hourly rate (100% regular wage + 50% special holiday premium)',
      '200% of regular hourly rate (100% regular wage + 100% regular holiday premium)',
    ],
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
      'No — offsetting undertime by overtime on other days is strictly prohibited by Art. 88',
      'Yes — undertime and overtime can be offset if both occur within the same payroll workweek',
      'Yes — offsetting is permitted provided there is prior verbal approval from the supervisor',
      'Only rank-and-file workers may have undertime offset if authorized by an internal policy',
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
    options: [
      '260% of hourly rate (200% holiday base multiplied by 1.30 statutory overtime factor)',
      '200% of hourly rate (100% regular daily wage base plus 100% regular holiday premium)',
      '169% of hourly rate (130% rest day base multiplied by 1.30 statutory overtime factor)',
      '300% of hourly rate (200% holiday rate plus 100% additional holiday overtime bonus)',
    ],
    correctIndex: 0,
    statute: 'Art. 87 & Art. 94, Labor Code',
    explanation: 'Regular Holiday first 8 hours = 200%, and overtime adds +30% of the holiday hourly rate: 200% x 1.30 = 260%.',
  },
  {
    id: 'yo4',
    worldCode: 'w2',
    headline: 'Overtime on Scheduled Rest Day',
    prompt: 'Peach worked 10 hours on her scheduled Sunday Rest Day (not a holiday). What hourly multiplier applies to hours 9 and 10?',
    options: [
      '169% of hourly rate (130% rest day base multiplied by 1.30 statutory overtime factor)',
      '130% of hourly rate (100% regular daily wage base plus 30% rest day premium pay)',
      '150% of hourly rate (100% regular wage plus 50% special non-working day premium)',
      '195% of hourly rate (150% special rest day rate multiplied by 1.30 overtime factor)',
    ],
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
      'Yes — rest periods of 5 to 20 minutes are compensable working hours under Art. 84',
      'No — any rest intervals shorter than one full hour are strictly unpaid non-working time',
      'Only if the worker remains seated at their desk without moving to the pantry or lounge',
      'Half the break is paid as working time while the remaining half is unpaid personal time',
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
      'Yes — waiting time where workers must remain on premises is compensable under DOLE rules',
      'No — brownouts and power outages are force majeure and strictly unpaid non-working hours',
      'Only 50% of the waiting time is paid unless the employer has an active backup generator',
      'The employer may compulsorily charge the brownout against the worker\'s vacation leave',
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
    options: [
      '195% of hourly rate (150% special rest day base rate multiplied by 1.30 overtime factor)',
      '150% of hourly rate (100% regular wage plus 50% special day rest day combined premium)',
      '169% of hourly rate (130% ordinary rest day rate multiplied by 1.30 overtime factor)',
      '260% of hourly rate (200% regular holiday rate multiplied by 1.30 overtime factor)',
    ],
    correctIndex: 0,
    statute: 'Art. 87 & Art. 93(c), Labor Code',
    explanation: 'Special Day on Rest Day is 150%, and overtime adds 30% of 150%: 150% x 1.30 = 195%.',
  },
  {
    id: 'yo8',
    worldCode: 'holidays',
    headline: 'Regular Holiday on Rest Day Overtime',
    prompt: 'A security guard works 10 hours on Christmas Day (Regular Holiday) which happens to be their scheduled Rest Day. What hourly rate applies to the 2 overtime hours?',
    options: [
      '338% of hourly rate (260% holiday rest day rate multiplied by 1.30 overtime factor)',
      '260% of hourly rate (200% regular holiday base plus 60% rest day statutory premium)',
      '200% of hourly rate (100% regular wage plus 100% regular holiday unworked compensation)',
      '300% of hourly rate (200% regular holiday rate plus 100% straight overtime surcharge)',
    ],
    correctIndex: 0,
    statute: 'DOLE Handbook on Statutory Monetary Benefits',
    explanation: 'Regular Holiday on Rest Day is 260% for first 8 hours, and overtime adds +30% of 260%: 260% x 1.30 = 338%!',
  },
  {
    id: 'yo9',
    worldCode: 'w1',
    headline: 'Compressed Workweek Daily Limit',
    prompt: 'Under DOLE Advisory No. 02-04, what is the maximum daily work duration permitted without overtime in an authorized Compressed Workweek (CWW)?',
    options: [
      'Up to 12 hours/day without overtime, provided total weekly hours do not exceed 48 hours',
      'Up to 10 hours/day without overtime, but any work beyond 40 weekly hours requires OT pay',
      'Up to 14 hours/day without overtime, provided workers are given two consecutive rest days',
      'Up to 8 hours/day strictly, as the Labor Code prohibits extending daily hours without OT',
    ],
    correctIndex: 0,
    statute: 'DOLE Advisory No. 02-04',
    explanation: 'CWW allows daily hours up to 12 hours without overtime premium, as long as 48 normal weekly hours are not exceeded and operations are not hazardous.',
  },
  {
    id: 'yo10',
    worldCode: 'w1',
    headline: 'Meal Period Shortened Below 60 Minutes',
    prompt: 'Management shortens the daily lunch period from 60 minutes to 30 minutes to let workers leave earlier. How must the 30-minute period be treated?',
    options: [
      'Compensable working time, because meal periods shorter than 60 minutes must be paid',
      'Unpaid personal time, as long as workers are allowed to leave 30 minutes earlier at dismissal',
      'Fifty percent paid and fifty percent unpaid, depending on whether workers remain on premises',
      'Discretionary non-working time, provided it is authorized by a majority vote of employees',
    ],
    correctIndex: 0,
    statute: 'Art. 85, Labor Code',
    explanation: 'Under Article 85, meal periods must be at least 60 minutes. A shortened meal break of less than 60 minutes constitutes compensable hours worked.',
  },
  {
    id: 'yo11',
    worldCode: 'w1',
    headline: 'Compulsory Emergency Overtime Grounds',
    prompt: 'Under Article 89 of the Labor Code, in which of the following circumstances can an employer legally compel employees to perform overtime work?',
    options: [
      'When urgent work must be performed on machinery or equipment to prevent serious loss or damage',
      'Whenever the employer experiences an unexpected seasonal surge in standard customer orders',
      'When an employee has incurred undertime earlier in the week and must balance company hours',
      'Whenever managerial staff determine that company profits for the fiscal quarter are below target',
    ],
    correctIndex: 0,
    statute: 'Art. 89, Labor Code',
    explanation: 'Art. 89 lists statutory emergency overtime exceptions, including disasters, urgent repairs on machinery to prevent serious loss, and preventing loss of perishable goods.',
  },
  {
    id: 'yo12',
    worldCode: 'w1',
    headline: 'Telecommuting Work-From-Home Overtime',
    prompt: 'Under R.A. 11165 (Telecommuting Act), do telecommuting home-based employees enjoy the same statutory rights to overtime and rest periods as on-site workers?',
    options: [
      'Yes — telecommuting workers must receive equal treatment and statutory overtime benefits',
      'No — remote home-based workers are classified as field personnel excluded from overtime pay',
      'Only if the telecommuting arrangement is registered with the DOLE National Office beforehand',
      'Overtime pay is replaced by a flat monthly internet stipend negotiated under the contract',
    ],
    correctIndex: 0,
    statute: 'Sec. 5, R.A. 11165',
    explanation: 'R.A. 11165 mandates that telecommuting employees receive fair and equal treatment comparable to on-site employees, including statutory overtime and rest day rates.',
  },
  {
    id: 'yo13',
    worldCode: 'w2',
    headline: 'Mandatory Weekly Rest Period Duration',
    prompt: 'Under Article 91 of the Labor Code, what is the mandatory minimum rest period an employer must provide after every 6 consecutive normal work days?',
    options: [
      'At least 24 consecutive hours of rest after every 6 consecutive normal working days',
      'At least 48 consecutive hours of rest after every 5 consecutive normal working days',
      'At least 12 consecutive hours of rest after every 6 consecutive normal working days',
      'At least 36 consecutive hours of rest after every 7 consecutive normal working days',
    ],
    correctIndex: 0,
    statute: 'Art. 91, Labor Code',
    explanation: 'Every employer shall provide each of his employees a weekly rest period of not less than twenty-four (24) consecutive hours after every six (6) consecutive normal work days.',
  },
  {
    id: 'yo14',
    worldCode: 'holidays',
    headline: 'Overtime on Ordinary Special Non-Working Day',
    prompt: 'Daisy works 10 hours on All Saints\' Day (Special Non-Working Day, not falling on a rest day). What rate applies to the 2 overtime hours (hours 9 and 10)?',
    options: [
      '169% of regular hourly rate (130% special day base multiplied by 1.30 overtime factor)',
      '150% of regular hourly rate (100% regular wage plus 50% premium for working on special days)',
      '195% of regular hourly rate (150% special day rest day rate multiplied by 1.30 overtime factor)',
      '260% of regular hourly rate (200% regular holiday base multiplied by 1.30 overtime factor)',
    ],
    correctIndex: 0,
    statute: 'Art. 87 & Art. 93(a), Labor Code',
    explanation: 'Special Non-Working Day first 8 hours = 130%. Overtime adds 30% of that base hourly rate: 130% x 1.30 = 169%.',
  },
  {
    id: 'yo15',
    worldCode: 'w1',
    headline: 'On-Call Duty Confinement to Quarters',
    prompt: 'An IT technician is placed on-call over the weekend but is strictly forbidden from leaving company quarters so they can respond within 5 minutes. Is this time compensable?',
    options: [
      'Yes — on-call time where the worker\'s movement is confined to company premises is compensable',
      'No — on-call duty is never compensable unless an active emergency call is actually received',
      'Only 25% of the on-call hours are paid as standby allowance without regular hourly wages',
      'Compensable only if the technician logs into the server and executes code for over 4 hours',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule I Sec. 5',
    explanation: 'An employee who is required to remain on call in the employer\'s premises, or so close thereto that he cannot use the time effectively for his own purposes, is working while on call.',
  },
  {
    id: 'yo16',
    worldCode: 'w1',
    headline: 'Interrupted Meal Break Due to Work Calls',
    prompt: 'During a 1-hour lunch break, a customer service agent is frequently required by management to answer incoming client phone calls. How is this period graded?',
    options: [
      'Compensable working hours in full, because the worker was not completely freed from duties',
      'Non-compensable lunch period, provided the total phone call duration did not exceed 15 minutes',
      'Fifty percent compensable, with the remainder treated as non-compensable personal break time',
      'Compensable only if the agent submits an overtime requisition slip signed by the client',
    ],
    correctIndex: 0,
    statute: 'Art. 85, Labor Code; Pan American World Airways v. Pan American',
    explanation: 'To be non-compensable, meal time must be completely free from work. If the employee is required to perform duties or answer calls, the entire period is compensable.',
  },
];

export const LUIGI_NIGHTSHIFT_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'ln1',
    worldCode: 'w1',
    headline: 'Statutory Night Shift Window',
    prompt: 'Under Article 86 of the Labor Code, between what specific hours is the statutory Night Shift Differential (NSD) mandatory?',
    options: [
      'Between 10:00 PM and 6:00 AM (inclusive of all qualifying graveyard work intervals)',
      'Between 11:00 PM and 7:00 AM (aligning with conventional industrial evening rotations)',
      'Between 8:00 PM and 4:00 AM (covering sunset to early dawn shift operational cycles)',
      'Between 12:00 Midnight and 8:00 AM (encompassing post-midnight manufacturing hours)',
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
      'Not less than 10% of the employee\'s regular hourly wage for each qualifying night hour',
      'Not less than 15% of the employee\'s regular hourly wage for each qualifying night hour',
      'Not less than 20% of the employee\'s regular hourly wage for each qualifying night hour',
      'Not less than 25% of the employee\'s regular hourly wage for each qualifying night hour',
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
      'Retail and service establishments regularly employing not more than five (5) workers',
      'Retail and service establishments regularly employing not more than ten (10) workers',
      'Manufacturing and logistics enterprises regularly employing fewer than twenty (20) workers',
      'Export-oriented call center hubs regardless of total employee headcount or business size',
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
    options: [
      '137.5% of regular hourly rate (125% overtime base multiplied by 1.10 night shift factor)',
      '135.0% of regular hourly rate (125% overtime base plus 10% straight additive differential)',
      '125.0% of regular hourly rate (overtime rate alone without separate night shift differential)',
      '150.0% of regular hourly rate (standard special non-working holiday premium equivalent)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 & Art. 87, DOLE Handbook',
    explanation: 'Night Shift Differential stacks multiplicatively on top of the overtime hourly rate: 125% x 1.10 = 137.5%.',
  },
  {
    id: 'ln5',
    worldCode: 'holidays',
    headline: 'Regular Holiday Night Shift (First 8 Hours)',
    prompt: 'Bowser Jr. works an 8-hour graveyard shift (10:00 PM to 6:00 AM) on New Year’s Day (Regular Holiday). What multiplier applies?',
    options: [
      '220% of hourly rate (200% regular holiday base multiplied by 1.10 night differential)',
      '210% of hourly rate (200% regular holiday base plus 10% flat additive night differential)',
      '200% of hourly rate (standard unadjusted regular holiday rate without night differential)',
      '260% of hourly rate (holiday overtime rate computed with full statutory overtime factor)',
    ],
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
      'Yes — any worker performing duties past 10:00 PM is entitled to 10% night differential',
      'Yes — managerial staff receive an enhanced 20% night differential under executive policy',
      'Only if the managerial night work was approved in writing by the collective bargaining unit',
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
    options: [
      '143% of regular hourly rate (130% scheduled rest day base multiplied by 1.10 factor)',
      '140% of regular hourly rate (130% rest day base plus 10% flat additive night differential)',
      '130% of regular hourly rate (ordinary rest day premium alone without night differential)',
      '169% of regular hourly rate (rest day overtime rate applied to all regular working hours)',
    ],
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
      'Yes — night workers have statutory right to health assessments at no cost to themselves',
      'No — medical checkups are voluntary personal expenses deducted from monthly paychecks',
      'Only after completing at least five consecutive years on graveyard shift assignments',
      'Only workers in underground mining and hazardous chemical refineries enjoy this right',
    ],
    correctIndex: 0,
    statute: 'R.A. 10151 (Art. 154–156)',
    explanation: 'R.A. 10151 grants night workers the right to free health assessments and mandatory transfer to day work if certified unfit due to health or pregnancy.',
  },
  {
    id: 'ln9',
    worldCode: 'w4',
    headline: 'Pregnant Night Worker Mandatory Transfer',
    prompt: 'A pregnant employee on night shift presents a medical certificate that night work poses health risks to her unborn child. What is the employer\'s obligation?',
    options: [
      'Transfer her to suitable day work without loss of tenure, pay grade, or accrued seniority',
      'Grant mandatory immediate unpaid leave until delivery without guaranteeing job return',
      'Require her to sign a waiver absolving the employer of all health liabilities during shift',
      'Dismiss her with thirty days nominal separation pay under authorized operational closure',
    ],
    correctIndex: 0,
    statute: 'Art. 157, Labor Code (R.A. 10151)',
    explanation: 'Measures shall be taken to ensure an alternative to night work is available to women workers who would otherwise be called upon to perform such work during pregnancy or nursing.',
  },
  {
    id: 'ln10',
    worldCode: 'w4',
    headline: 'Safe Transportation for Night Workers',
    prompt: 'Under R.A. 10151 and DOLE guidelines, what duty exists regarding safe transportation for graveyard shift employees?',
    options: [
      'Employers must ensure suitable and safe transportation facilities during unholy hours',
      'Employees are strictly responsible for their own commute regardless of transit dangers',
      'Transportation duty applies only if workers reside more than twenty-five kilometers away',
      'The local city government alone bears complete responsibility for providing shuttle vans',
    ],
    correctIndex: 0,
    statute: 'R.A. 10151 & DOLE D.O. 119-12',
    explanation: 'Safe, comfortable, and suitable transport facilities shall be provided by employers for night workers from specified pickup/drop-off points to the workplace and vice versa.',
  },
  {
    id: 'ln11',
    worldCode: 'holidays',
    headline: 'Night Shift on Special Non-Working Day',
    prompt: 'Mario works from 10:00 PM to 6:00 AM on a Special Non-Working Day (ordinary day, not a rest day). What multiplier applies to the shift?',
    options: [
      '143% of regular hourly rate (130% special holiday base multiplied by 1.10 night factor)',
      '140% of regular hourly rate (130% special holiday base plus 10% straight night addition)',
      '130% of regular hourly rate (standard special holiday wage without night differential)',
      '195% of regular hourly rate (special day rest day overtime rate applied to night hours)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 & Art. 93(c), DOLE Handbook',
    explanation: 'Special Non-Working Day is 130%, and working during the 10PM–6AM window adds 10% multiplicatively: 130% x 1.10 = 143%.',
  },
  {
    id: 'ln12',
    worldCode: 'w2',
    headline: 'Rest Day Overtime on Graveyard Shift',
    prompt: 'An employee works an overtime hour between 11:00 PM and 12:00 Midnight on their scheduled Rest Day. What hourly multiplier applies?',
    options: [
      '185.9% of hourly rate (169% rest day overtime base multiplied by 1.10 night differential)',
      '179.0% of hourly rate (169% rest day overtime base plus 10% flat additive night differential)',
      '169.0% of hourly rate (rest day overtime rate alone without night shift differential)',
      '220.0% of hourly rate (regular holiday graveyard rate applied to rest day overtime hours)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 & Art. 87, DOLE Handbook',
    explanation: 'Rest day overtime is 169% (130% x 1.30). Night differential adds 10% of that total: 169% x 1.10 = 185.9%!',
  },
  {
    id: 'ln13',
    worldCode: 'holidays',
    headline: 'Regular Holiday Overtime at 2:00 AM',
    prompt: 'A worker renders overtime between 1:00 AM and 3:00 AM on a Regular Holiday. What multiplier applies to these overtime hours?',
    options: [
      '286% of hourly rate (260% holiday overtime base multiplied by 1.10 night differential)',
      '270% of hourly rate (260% holiday overtime base plus 10% flat additive night differential)',
      '260% of hourly rate (holiday overtime rate alone without night shift differential)',
      '338% of hourly rate (holiday rest day overtime rate applied to ordinary working days)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 & Art. 94, DOLE Handbook',
    explanation: 'Regular holiday overtime is 260% (200% x 1.30). Applying the 1.10 night shift differential yields: 260% x 1.10 = 286%!',
  },
  {
    id: 'ln14',
    worldCode: 'w4',
    headline: 'Lactation Breaks for Nursing Night Workers',
    prompt: 'Under R.A. 10028 (Expanded Breastfeeding Promotion Act), what lactation break intervals must be provided to nursing mothers during work?',
    options: [
      'At least 40 minutes of paid lactation periods for every eight-hour working shift',
      'At least 15 minutes of unpaid lactation intervals during standard lunch periods only',
      'At least 60 minutes of lactation leave deducted from annual service incentive credits',
      'Lactation breaks apply exclusively to daytime employees and never during night shifts',
    ],
    correctIndex: 0,
    statute: 'Sec. 12, R.A. 10028',
    explanation: 'Lactation periods shall not be less than a total of forty (40) minutes for every eight-hour working period, and are counted as compensable working hours.',
  },
  {
    id: 'ln15',
    worldCode: 'w1',
    headline: 'Piece-Rate Workers Night Shift Differential',
    prompt: 'Are piece-rate (takay) workers who render work between 10:00 PM and 6:00 AM entitled to Night Shift Differential under the Labor Code?',
    options: [
      'Yes — piece-rate workers are covered employees entitled to 10% night differential pay',
      'No — workers paid on piece-rate basis are strictly excluded from all Title I benefits',
      'Only if their daily output exceeds the statutory minimum output rate set by the DOLE',
      'Night differential applies only if piece-rate work is performed on a regular holiday',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule II Sec. 1',
    explanation: 'Piece-rate workers whose output rates are compliant with DOLE standards are employees entitled to statutory night shift differential for work between 10PM and 6AM.',
  },
  {
    id: 'ln16',
    worldCode: 'w1',
    headline: 'Field Personnel Night Shift Differential',
    prompt: 'A traveling medical sales representative whose actual working hours in the field cannot be determined works late at night. Do they get NSD?',
    options: [
      'No — bona fide field personnel whose hours cannot be determined are excluded under Art. 82',
      'Yes — anyone who sends an email after 10:00 PM is legally entitled to 10% night differential',
      'Yes — field representatives receive a mandatory flat 25% nighttime travel allowance',
      'Only if their quarterly sales targets are met within ninety percent of company forecast',
    ],
    correctIndex: 0,
    statute: 'Art. 82, Labor Code',
    explanation: 'Field personnel whose actual hours of work in the field cannot be determined with reasonable certainty are excluded from Article 86 Night Shift Differential.',
  },
];

export const ROSALINA_WAGE_MATRIX_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'rw1',
    worldCode: 'w3',
    headline: 'Facilities vs Supplements Test',
    prompt: 'What is the controlling Supreme Court test to determine if an item is a deductible \'Facility\' or a non-deductible \'Supplement\'?',
    options: [
      'Purpose Test — whether primarily for employee benefit or necessary for employer trade',
      'Cost Test — whether the monetary cost of the benefit exceeds one thousand pesos',
      'Location Test — whether the item or service is utilized inside or outside the workplace',
      'Seniority Test — whether the benefit is reserved exclusively for tenured regular workers',
    ],
    correctIndex: 0,
    statute: 'Mabeza v. NLRC & Art. 97(f)',
    explanation: 'Under the Purpose Test, independent of designation, if an item benefits the employer\'s trade (like specialized uniforms/meals on overtime), it is a non-deductible Supplement.',
  },
  {
    id: 'rw2',
    worldCode: 'w3',
    headline: '3 Requisites to Deduct a Facility',
    prompt: 'Even if meals/lodging qualify as a Facility, what 3 strict requirements must an employer prove before deducting their cost from minimum wage?',
    options: [
      'Customary in trade + Voluntary written employee acceptance + Fair and reasonable value',
      'Verbal notice + Supervisor endorsement memo + Prevailing local commercial market price',
      'Collective bargaining agreement clause alone without individual employee authorizations',
      'Board of Directors resolution approved by majority stockholders plus thirty days notice',
    ],
    correctIndex: 0,
    statute: 'Our Haus Realty v. Parian',
    explanation: 'Without proof of customariness, voluntary written authorization by the employee, and fair/reasonable valuation, facility deductions are illegal.',
  },
  {
    id: 'rw3',
    worldCode: 'w3',
    headline: 'D.O. 174-17 Substantial Capital Threshold',
    prompt: 'Under DOLE Department Order No. 174-17, what minimum paid-up capital / net worth defines \'Substantial Capital\' for contractor entities?',
    options: [
      'At least PHP 5,000,000 paid-up capital or net worth (raised from old threshold)',
      'At least PHP 3,000,000 paid-up capital or net worth for corporate entities only',
      'At least PHP 1,000,000 paid-up capital or net worth for all business partnerships',
      'At least PHP 500,000 paid-up capital or net worth for single sole proprietorships',
    ],
    correctIndex: 0,
    statute: 'DOLE D.O. No. 174-17 Sec. 3(l)',
    explanation: 'D.O. 174-17 raised the minimum substantial capital requirement to PHP 5,000,000 paid-up capital stocks/shares or net worth.',
  },
  {
    id: 'rw4',
    worldCode: 'w3',
    headline: 'Wage Distortion Definition',
    prompt: 'A new RTWPB Wage Order raises minimum wage from PHP 570 to PHP 610, wiping out the intentional pay gap with supervisors earning PHP 615. What is this called?',
    options: [
      'Wage Distortion — statutory elimination or severe contraction of wage differences',
      'Non-Diminution Violation — illegal reduction of long-standing voluntary company benefits',
      'Constructive Dismissal — creating intolerable working conditions forcing staff exit',
      'Unfair Labor Practice — anti-union discrimination or interference with collective bargaining',
    ],
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
      'Regular Regional Trial Court for immediate declaratory relief and preliminary injunction',
      'Barangay Lupon Tagapamayapa under the Katarungang Pambarangay conciliation framework',
      'The employees are legally authorized to stage an immediate wildcat industrial strike',
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
      'Double indemnity — twice the unpaid wage increase plus potential criminal liability',
      'Half of the unpaid wage differential provided the employer settles within ninety days',
      'Nominal damages of ten thousand pesos without liability for back wage differentials',
      'A formal warning letter issued by the Regional Director with no financial penalties',
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
      'No — it has ripened into a company practice protected by Art. 100 Non-Diminution',
      'Yes — management prerogative permits unilateral withdrawal of voluntary bonuses at will',
      'Yes — provided the employer serves thirty days advance notice to the Department of Labor',
      'Only if the company\'s external certified public accountant certifies operational losses',
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
      '85% distributed to rank-and-file workers and 15% retained by hotel management',
      '90% distributed to covered workers and 10% reserved for glassware and dish breakages',
      '50% distributed to kitchen personnel and 50% retained by establishment owners',
    ],
    correctIndex: 0,
    statute: 'R.A. 11360 (Art. 96)',
    explanation: 'R.A. 11360 abolished the old 85%-15% split; 100% of collected service charges must go to covered rank-and-file/non-managerial workers.',
  },
  {
    id: 'rw9',
    worldCode: 'w2',
    headline: '13th Month Pay Proportionate Share for Resignees',
    prompt: 'An employee resigns effective July 1 after working exactly 6 months in the calendar year. Are they entitled to 13th Month Pay?',
    options: [
      'Yes — entitled to a proportionate 13th month pay equal to 6/12 of total basic earnings',
      'No — 13th month pay is strictly forfeited if an employee resigns prior to December 24',
      'Only if the employee rendered at least five continuous years of service prior to exit',
      'Only if the resignation was approved by management with an explicit waiver of claims',
    ],
    correctIndex: 0,
    statute: 'P.D. 851 & Revised Guidelines Sec. 6',
    explanation: 'An employee who has resigned or whose services were terminated at any time before payment of the 13th month pay is entitled to this benefit in proportion to length of service.',
  },
  {
    id: 'rw10',
    worldCode: 'w3',
    headline: 'Uniform Cost Deduction from Minimum Wage',
    prompt: 'A security agency deducts PHP 800/month for required duty uniforms, dropping the guard\'s take-home pay below minimum wage. Lawful or Illegal?',
    options: [
      'Illegal — uniforms required for company business are supplements that cannot cut wage',
      'Lawful — employers have full managerial discretion to deduct company gear expenses',
      'Lawful provided the security guard is given two complete sets of uniforms per year',
      'Illegal only if the security guard resigns within ninety days of initial employment',
    ],
    correctIndex: 0,
    statute: 'Art. 97(f) & Mabeza v. NLRC',
    explanation: 'Specialized uniforms required by the employer are Supplements for the employer\'s benefit, not Facilities, and cannot be deducted from wages.',
  },
  {
    id: 'rw11',
    worldCode: 'w3',
    headline: 'Retail and Service Minimum Wage Exemption',
    prompt: 'Under Republic Act No. 6727 (Wage Rationalization Act), which establishments may apply for exemption from RTWPB Wage Orders?',
    options: [
      'Retail and service establishments regularly employing not more than 10 workers',
      'All registered export processing zone corporations employing fewer than 100 workers',
      'Information technology business process outsourcing firms operating on night shifts',
      'Establishments where over fifty percent of equity is owned by foreign investors',
    ],
    correctIndex: 0,
    statute: 'Sec. 3, R.A. 6727 & NWPC Guidelines',
    explanation: 'Retail/service establishments regularly employing not more than ten (10) workers and distressed establishments may apply for statutory exemption from Wage Orders.',
  },
  {
    id: 'rw12',
    worldCode: 'w3',
    headline: 'Legitimate Job Contracting Elements',
    prompt: 'What two core elements must co-exist to establish legitimate independent contracting under D.O. No. 174-17?',
    options: [
      'Substantial capital / equipment AND right of control over the manner of doing work',
      'Registration with the Securities and Exchange Commission AND an office lease contract',
      'At least fifty regular employees AND a certified collective bargaining agreement',
      'ISO 9001 corporate certification AND five years continuous business registration',
    ],
    correctIndex: 0,
    statute: 'D.O. 174-17 Sec. 8',
    explanation: 'Legitimate contracting requires distinct capital/equipment and freedom from the principal\'s control as to the manner and methods of performing the work.',
  },
  {
    id: 'rw13',
    worldCode: 'w3',
    headline: 'Labor-Only Contracting Legal Consequence',
    prompt: 'When a contractor is declared a \'Labor-Only Contractor\' by the DOLE or NLRC, what is the statutory legal consequence?',
    options: [
      'The principal is declared the direct employer of the workers as if directly hired',
      'The contractor alone pays a nominal administrative fine with no impact on employment',
      'The workers are immediately separated from service with thirty days separation pay',
      'The workers are transferred to civil service government status under the Labor Code',
    ],
    correctIndex: 0,
    statute: 'Art. 106, Labor Code & D.O. 174-17 Sec. 12',
    explanation: 'In labor-only contracting, the contractor is treated merely as an agent of the principal, and the principal is deemed the direct employer of the deployed workers.',
  },
  {
    id: 'rw14',
    worldCode: 'w3',
    headline: 'Wage Distortion Non-Strikeable Doctrine',
    prompt: 'A union stages a strike over a wage distortion resulting from a newly issued Wage Order. Is this strike legal or illegal?',
    options: [
      'Illegal — Article 124 mandates settlement through grievance machinery or arbitration',
      'Legal — wage distortion is an economic issue that constitutes a valid strike ground',
      'Legal provided the union filed a thirty-day strike notice with the NCMB beforehand',
      'Legal if approved by two-thirds of all union members during a secret balloting',
    ],
    correctIndex: 0,
    statute: 'Art. 124, Labor Code; Ilaw at Buklod v. NLRC',
    explanation: 'Wage distortion is non-strikeable under Article 124. Any strike staged on the ground of wage distortion is illegal and exposes union officers to dismissal.',
  },
  {
    id: 'rw15',
    worldCode: 'w2',
    headline: '13th Month Pay Mandatory Deadline',
    prompt: 'Under Presidential Decree No. 851, what is the absolute latest deadline for employers to disburse the mandatory 13th Month Pay?',
    options: [
      'On or before December 24 of each calendar year (statutory mandatory deadline)',
      'On or before December 31 coinciding with the end of the corporate fiscal year',
      'On or before January 15 of the following calendar year along with annual tax forms',
      'On or before November 30 to coincide with the standard national holiday bonus',
    ],
    correctIndex: 0,
    statute: 'P.D. 851 Sec. 1',
    explanation: 'P.D. 851 mandates that 13th month pay shall be paid not later than December 24 of each year.',
  },
  {
    id: 'rw16',
    worldCode: 'w2',
    headline: 'Exclusions from Basic Salary for 13th Month',
    prompt: 'Under P.D. 851 revised guidelines, which payments are excluded from the \'Basic Salary\' used to compute 13th Month Pay?',
    options: [
      'Overtime pay, night differential, holiday pay, and cost-of-living allowances (COLA)',
      'Regular basic hourly wages earned during ordinary daytime working schedules',
      'Paid sick leaves and vacation leaves commuted to cash during regular payroll runs',
      'Statutory daily minimum wage rates mandated by the regional wage boards',
    ],
    correctIndex: 0,
    statute: 'Revised Guidelines on P.D. 851',
    explanation: 'Basic salary includes all remunerations paid for services rendered but excludes overtime, night shift differential, holiday pay, unused leave cash conversions, and COLA unless treated as basic pay by company practice.',
  },
];

export const PEACH_ROYAL_LEAVES_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'pl1',
    worldCode: 'w6',
    headline: 'Expanded Maternity Leave — Live Birth',
    prompt: 'Princess Peach (married private-sector worker) delivers a healthy baby. How many paid maternity leave days does R.A. 11210 grant?',
    options: [
      '105 days with full pay regardless of whether delivery is normal or caesarean section',
      '60 days with full pay for normal delivery and 78 days for caesarean section delivery',
      '90 days with full pay provided the female worker has rendered two years of service',
      '120 days with full pay for all married female workers in the private economic sector',
    ],
    correctIndex: 0,
    statute: 'R.A. 11210 Sec. 3',
    explanation: 'R.A. 11210 grants 105 days paid maternity leave for live childbirth regardless of whether delivery is normal or caesarean.',
  },
  {
    id: 'pl2',
    worldCode: 'w6',
    headline: 'Solo Parent Maternity Extension',
    prompt: 'If a female worker qualifies as a Solo Parent under R.A. 8972 / R.A. 11861, how many total paid maternity days apply for live childbirth?',
    options: [
      '120 days with full pay (105 standard days plus 15 additional solo parent days)',
      '112 days with full pay (105 standard days plus 7 statutory paternity leave days)',
      '135 days with full pay (105 standard days plus 30 optional unpaid leave days)',
      '105 days with full pay, as solo parent status does not increase maternity duration',
    ],
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
      'Married male employee cohabiting with legitimate spouse, for the first 4 deliveries',
      'Any male employee regardless of marital status, for unlimited biological deliveries',
      'Married male employee cohabiting with legitimate spouse, for the first 2 deliveries only',
      'Male employee who has rendered at least three continuous years of company service',
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
      'At least 6 months of service (reduced from the previous 1-year tenure requirement)',
      'At least 12 months of continuous service with the same employer at time of filing',
      'At least 24 months of aggregate service across any registered private establishments',
      'Zero tenure required, as parental leave applies immediately on the first day of hire',
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
      'Certification from Barangay, Prosecutor, or Clerk of Court that an action is pending',
      'Final Supreme Court judgment convicting the perpetrator of violence against women',
      'Hospital surgical bill indicating serious physical injuries requiring hospitalization',
      'Formal resolution approved by the company\'s internal Committee on Decency and Safety',
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
      'Special leave of 15 days unpaid leave with continuation of health insurance coverage',
      'Special leave of 60 days paid solely through SSS sickness benefit cash disbursements',
      'Special leave of 7 days commutable to cash if unused at the end of the calendar year',
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
      'Art. 95 SIL is commutable to cash; Kasambahay 5-day leave is non-cumulative and non-cashable',
      'Both leave credits are automatically convertible to cash at the close of every calendar year',
      'Neither leave credit is convertible to cash, but both accumulate indefinitely across years',
      'Kasambahay leave carries a 10-day statutory cash bonus while Art. 95 carries five days',
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
    options: [
      '60 days with full pay (statutory paid leave for non-live deliveries under R.A. 11210)',
      '105 days with full pay (the same duration granted for ordinary live childbirth deliveries)',
      '45 days with full pay (standard medical recovery duration set by social security rules)',
      '30 days with full pay (half the duration granted under old Social Security legislation)',
    ],
    correctIndex: 0,
    statute: 'R.A. 11210 Sec. 3',
    explanation: 'Miscarriage or emergency termination of pregnancy entitles the female worker to 60 days maternity leave with full pay.',
  },
  {
    id: 'pl9',
    worldCode: 'w6',
    headline: 'Allocation of Maternity Leave to Unmarried Father',
    prompt: 'Under R.A. 11210, can a mother allocate up to seven (7) days of her 105-day maternity leave to the child\'s father if they are not married?',
    options: [
      'Yes — R.A. 11210 allows allocation to the child\'s father whether or not married to him',
      'No — allocation is strictly limited to legitimate husbands under valid civil marriage',
      'Only if the unmarried father proves cohabitation for a minimum of ten continuous years',
      'Only if the child\'s grandmother signs a sworn concurrence filed with the barangay',
    ],
    correctIndex: 0,
    statute: 'R.A. 11210 Sec. 6',
    explanation: 'A female worker entitled to maternity leave benefits may allocate up to seven (7) days of said benefits to the child\'s father, whether or not the same is married to the female worker.',
  },
  {
    id: 'pl10',
    worldCode: 'w6',
    headline: 'Optional Unpaid Maternity Leave Extension',
    prompt: 'In addition to the 105 days of paid maternity leave, what optional additional leave may a female worker take under R.A. 11210?',
    options: [
      'An additional thirty (30) days without pay, provided written notice is given 45 days prior',
      'An additional sixty (60) days with half pay, provided the employer consents in writing',
      'An additional fifteen (15) days with full pay, deductible from future vacation leave',
      'No additional leave is permitted beyond the mandatory 105-day statutory period',
    ],
    correctIndex: 0,
    statute: 'R.A. 11210 Sec. 3',
    explanation: 'A worker may opt to extend maternity leave for an additional thirty (30) days without pay, upon due written notice to the employer at least 45 days before the end of maternity leave.',
  },
  {
    id: 'pl11',
    worldCode: 'w6',
    headline: 'Paternity Leave Cash Conversion Rule',
    prompt: 'A married male employee never uses his 7-day Paternity Leave upon his wife\'s delivery. Can he demand its cash conversion at year-end?',
    options: [
      'No — statutory Paternity Leave under R.A. 8187 is non-cumulative and non-convertible to cash',
      'Yes — all statutory leaves under Philippine labor law convert to cash if unused at year-end',
      'Yes — convertible to cash provided he submits a certified true copy of the child\'s birth certificate',
      'Half of the unused days convert to cash while the other half are carried over to the next child',
    ],
    correctIndex: 0,
    statute: 'R.A. 8187 & Implementing Rules Sec. 7',
    explanation: 'If paternity leave is not availed of, it shall not be convertible to cash and cannot be accumulated from year to year.',
  },
  {
    id: 'pl12',
    worldCode: 'w6',
    headline: 'Solo Parent Leave Forfeiture Rule',
    prompt: 'Does unused 7-day Parental Leave for Solo Parents under R.A. 8972 / R.A. 11861 carry over to the next year or convert to cash?',
    options: [
      'No — solo parent leave is non-cumulative and cannot be converted to cash if unused',
      'Yes — unused solo parent leave automatically converts to cash on the employee\'s birthday',
      'Yes — unused days accumulate up to a statutory ceiling of thirty-five working days',
      'Convertible to cash only if the solo parent has more than three dependent children',
    ],
    correctIndex: 0,
    statute: 'R.A. 8972 / R.A. 11861',
    explanation: 'Parental leave for solo parents is not convertible to cash and cannot be accumulated from year to year.',
  },
  {
    id: 'pl13',
    worldCode: 'w6',
    headline: 'Adoption Leave Under Domestic Administrative Adoption Act',
    prompt: 'Under R.A. 11642, how many paid leave days does an adoptive mother receive upon placement of a child below seven (7) years old?',
    options: [
      'Sixty (60) days of paid adoption leave with full pay from the date of child placement',
      'One hundred five (105) days of paid leave equivalent to natural live childbirth',
      'Thirty (30) days of paid leave provided the adopted child is below one year of age',
      'Seven (7) days of paid parental leave identical to standard solo parent leave benefits',
    ],
    correctIndex: 0,
    statute: 'Sec. 34, R.A. 11642',
    explanation: 'The adoptive mother shall be entitled to maternity leave benefits of sixty (60) days with full pay if the adoptee is below seven (7) years of age on placement.',
  },
  {
    id: 'pl14',
    worldCode: 'w6',
    headline: 'Service Incentive Leave Tenure Requirement',
    prompt: 'Under Article 95 of the Labor Code, after what tenure does an employee become entitled to five (5) days of paid Service Incentive Leave?',
    options: [
      'After at least one (1) year of service (inclusive of authorized absences and regular holidays)',
      'After at least six (6) months of service (matching probationary employment duration)',
      'After at least three (3) years of continuous tenure with the same establishment',
      'Immediately upon regularization after passing the six-month performance appraisal',
    ],
    correctIndex: 0,
    statute: 'Art. 95, Labor Code',
    explanation: 'Every employee who has rendered at least one year of service shall be entitled to a yearly service incentive leave of five days with pay.',
  },
  {
    id: 'pl15',
    worldCode: 'w6',
    headline: 'Maternity Leave Differential in Private Sector',
    prompt: 'Under R.A. 11210, what is the private employer\'s duty regarding the difference between SSS maternity benefit and actual monthly wage?',
    options: [
      'The private employer must pay the salary differential between SSS benefit and full wage',
      'The private employer pays nothing because SSS benefits constitute full satisfaction of law',
      'The employee must file a claim with the NLRC to recover the unpaid salary differential',
      'The salary differential is refunded to the employer by the Department of Finance yearly',
    ],
    correctIndex: 0,
    statute: 'Sec. 5, R.A. 11210 & DOLE D.O. 208-19',
    explanation: 'Employers in the private sector shall pay the salary differential between the full salary and actual SSS maternity benefit received, subject to statutory exceptions for micro-enterprises.',
  },
  {
    id: 'pl16',
    worldCode: 'w6',
    headline: 'VAWC Leave Protection from Disciplinary Action',
    prompt: 'Can an employer issue a disciplinary warning or sanction to a female employee for absences covered by a valid 10-day VAWC leave?',
    options: [
      'No — taking VAWC leave shall not be a ground for prejudice in employment or evaluation',
      'Yes — excessive absences even with VAWC certification may be sanctioned under company rules',
      'Yes — provided the employer issues a written notice of explanation within twenty-four hours',
      'Disciplinary sanctions are permitted if the employee fails to obtain a permanent protection order',
    ],
    correctIndex: 0,
    statute: 'Sec. 43, R.A. 9262',
    explanation: 'The availing of VAWC leave shall not be a ground for termination, prejudice in employment or performance evaluation, or demotion under Republic Act No. 9262.',
  },
];

export const WARIO_DEDUCTION_AUDIT_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'wd1',
    worldCode: 'w3',
    headline: 'Mandatory Statutory Contributions',
    prompt: 'Wario deducts the employee\'s statutory share of SSS, PhilHealth, Pag-IBIG, and BIR withholding tax without separate written consent. Lawful or Illegal?',
    options: [
      'Lawful — deductions mandated by express provisions of law require no separate consent',
      'Illegal — every statutory deduction requires a notarized waiver signed by the employee',
      'Illegal — the employer is legally mandated to shoulder one hundred percent of all taxes',
      'Lawful only if the employee belongs to managerial staff earning above minimum wage',
    ],
    correctIndex: 0,
    statute: 'Art. 113, Labor Code',
    explanation: 'Statutory deductions (SSS, PhilHealth, Pag-IBIG, withholding tax) are expressly authorized by law.',
  },
  {
    id: 'wd2',
    worldCode: 'w3',
    headline: 'Unilateral Tool Breakage Deduction (50% of Pay)',
    prompt: 'A worker accidentally drops a wrench. Without a hearing and deducting 50% of weekly pay at once, Wario slashes the worker\'s paycheck. Lawful or Illegal?',
    options: [
      'Illegal — loss/damage deductions require proven fault, hearing, and max 20% weekly cap',
      'Lawful — management prerogative to protect company tools and assets is absolute in nature',
      'Lawful provided the replacement purchase cost of the tool is below ten thousand pesos',
      'Lawful provided the deduction is itemized on the computerized payslip given to the worker',
    ],
    correctIndex: 0,
    statute: 'Art. 114–115 & Omnibus Rules Book III Rule VIII Sec. 11',
    explanation: 'Loss/damage deductions require proof of clear employee responsibility, opportunity to be heard, fair value, and a strict 20% weekly wage deduction cap!',
  },
  {
    id: 'wd3',
    worldCode: 'w3',
    headline: 'Union Agency Fee for Non-Union Beneficiaries',
    prompt: 'Rank-and-file non-union employees accept benefits under the certified Union\'s CBA. Can agency fees be checked off from their wages without individual authorization?',
    options: [
      'Lawful — Art. 259(e) authorizes agency fee check-off for non-members who accept CBA benefits',
      'Illegal — checking off fees without signed consent violates the constitutional freedom of association',
      'Lawful only if the check-off was approved in an executive resolution by the DOLE Regional Director',
      'Illegal unless the non-union employee executes a formal sworn application to join the labor union',
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
      'Lawful — Art. 113(b) permits third-party deductions with written consent and zero kickback',
      'Illegal — direct payment to any third person or entity is strictly prohibited by labor standards',
      'Lawful only if approved in a formal administrative resolution by the Supreme Court En Banc',
      'Illegal if the deducted monthly remittance exceeds two hundred pesos per payroll cut-off',
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
      'Illegal — Art. 114 bans cash deposits unless recognized by DOLE as customary in that trade',
      'Lawful — employers may mandate cash security bonds for all newly hired probationary staff',
      'Lawful provided the deposit is returned with six percent legal interest upon five years tenure',
      'Lawful provided the cash deposit is deposited inside an escrow account in the company vault',
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
      'Illegal — Art. 116 bars withholding wages and Art. 118 prohibits retaliatory acts',
      'Lawful — management clearance holds are permitted while legal disputes remain pending',
      'Lawful for up to six months while the parties undergo mandatory NCMB conciliation',
      'Permitted provided the employer\'s company employee handbook contains an explicit hold rule',
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
      'Illegal — under R.A. 10361, if wage is below PHP 5,000, employer pays 100% of premiums',
      'Lawful — social security statutory contributions are always divided equally fifty-fifty',
      'Lawful provided the Kasambahay has completed at least six months of household employment',
      'Illegal only within the National Capital Region and fully lawful in provincial areas',
    ],
    correctIndex: 0,
    statute: 'R.A. 10361 Sec. 30',
    explanation: 'When a Kasambahay earns less than PHP 5,000/month, the employer shoulders the entire statutory premium without deducting from the worker\'s pay.',
  },
  {
    id: 'wd8',
    worldCode: 'w3',
    headline: 'Payment of Wages via Promissory Chits / Tokens',
    prompt: 'Instead of legal tender or compliant ATM payroll, Wario pays factory workers in redeemable Wario-Mart store coupons. Lawful or Illegal?',
    options: [
      'Illegal — Art. 102 strictly prohibits paying wages in vouchers, tokens, or chits',
      'Lawful provided the store coupons include a five percent bonus markup on groceries',
      'Lawful provided the grocery store is located within five hundred meters of the plant',
      'Lawful provided the coupon payment was ratified by fifty-one percent of union members',
    ],
    correctIndex: 0,
    statute: 'Art. 102, Labor Code',
    explanation: 'Art. 102 mandates payment in legal tender (or compliant bank/ATM payroll) and penalizes payment via chits, vouchers, or store tokens.',
  },
  {
    id: 'wd9',
    worldCode: 'w3',
    headline: 'Payroll Deduction for Group Insurance Premiums',
    prompt: 'Can an employer deduct insurance premiums from an employee\'s wage for an employer-negotiated group health plan?',
    options: [
      'Lawful — provided the employee voluntarily gave prior written authorization under Art. 113',
      'Illegal — all non-tax insurance deductions are void ab initio under Philippine labor standards',
      'Lawful without employee consent provided the company pays twenty percent of the premium',
      'Lawful only if the group insurance provider is a government-owned financial institution',
    ],
    correctIndex: 0,
    statute: 'Art. 113(a), Labor Code',
    explanation: 'Deductions for insurance premiums with written employee authorization are valid under Art. 113 where the employer is authorized in writing by the individual employee.',
  },
  {
    id: 'wd10',
    worldCode: 'w3',
    headline: 'Garnishment of Minimum Wages for Personal Civil Debts',
    prompt: 'A bank secures a writ of execution from a trial court garnishing a factory worker\'s minimum wage for unpaid credit card debt. Is minimum wage garnishable?',
    options: [
      'Illegal — Art. 1708 of the Civil Code explicitly exempts laborers\' wages from execution',
      'Lawful — any final trial court writ of execution overrides statutory minimum wage laws',
      'Lawful provided the garnishment does not exceed fifty percent of the monthly wage',
      'Lawful only if the laborer executed a promissory note with an acceleration clause',
    ],
    correctIndex: 0,
    statute: 'Art. 1708, Civil Code; Gaa v. Court of Appeals',
    explanation: 'Article 1708 of the Civil Code provides that the laborer\'s wages shall not be subject to execution or attachment, except for debts incurred for food, shelter, clothing and medical attendance.',
  },
  {
    id: 'wd11',
    worldCode: 'w3',
    headline: 'Direct Payment of Wages Requirement',
    prompt: 'Under Article 105 of the Labor Code, to whom must an employee\'s wages be directly paid on scheduled payroll paydays?',
    options: [
      'Directly to the worker, except in force majeure or with written authorization to an immediate relative',
      'Directly to the employee\'s spouse regardless of whether written authority was executed',
      'Directly to the department supervisor who is authorized to disburse cash at their discretion',
      'Directly to the certified collective bargaining union treasurer for distribution to workers',
    ],
    correctIndex: 0,
    statute: 'Art. 105, Labor Code',
    explanation: 'Wages shall be paid directly to the workers, except when the employer is authorized to pay through an immediate member of the family upon written authority, or in case of death.',
  },
  {
    id: 'wd12',
    worldCode: 'w3',
    headline: "Attorney's Fees Ceiling in Labor Cases",
    prompt: 'Under Article 111 of the Labor Code, what is the maximum statutory attorney\'s fees that may be assessed in unlawful wage withholding cases?',
    options: [
      'Not exceeding ten percent (10%) of the total amount of wages recovered by the worker',
      'Not exceeding twenty-five percent (25%) of the total amount of wages recovered by the worker',
      'A flat ceiling of fifty thousand pesos without regard to the amount of unpaid wages',
      'Attorney\'s fees are completely prohibited in proceedings before the NLRC Labor Arbiter',
    ],
    correctIndex: 0,
    statute: 'Art. 111, Labor Code',
    explanation: 'In cases of unlawful withholding of wages, the culpable party may be assessed attorney\'s fees equivalent to ten percent of the amount of wages recovered.',
  },
  {
    id: 'wd13',
    worldCode: 'w3',
    headline: 'Wage Rebates and Kickbacks Prohibition',
    prompt: 'A supervisor demands a monthly PHP 1,000 cash kickback from workers in exchange for keeping them on preferred shifts. What provision is violated?',
    options: [
      'Article 116 — prohibiting any rebate or deduction from wages as consideration for employment',
      'Article 124 — prohibiting wage distortion across different quantitative skill categories',
      'Article 95 — prohibiting unauthorized commutation of annual service incentive leaves',
      'Article 83 — establishing eight hours as the normal working hours of company employees',
    ],
    correctIndex: 0,
    statute: 'Art. 116, Labor Code',
    explanation: 'It shall be unlawful for any person to withhold any amount from the wages of an employee or induce him to give up any part of the wages by force, stealth, intimidation, threat or by any other means whatsoever.',
  },
  {
    id: 'wd14',
    worldCode: 'w3',
    headline: 'Requisites for a Valid Labor Quitclaim',
    prompt: 'Under established Supreme Court jurisprudence, when is an employee\'s signed waiver and quitclaim legally valid and binding?',
    options: [
      'Voluntary execution + Fair and reasonable consideration + No fraud or deceit + Full understanding',
      'Notarization before a notary public alone, regardless of the financial consideration paid',
      'Signing inside HR office in the presence of two co-workers without financial compensation',
      'Approval by the certified bargaining union president within thirty days of separation',
    ],
    correctIndex: 0,
    statute: 'EDI Staffbuilders v. NLRC',
    explanation: 'A quitclaim is valid if executed voluntarily, with full understanding, without fraud or duress, for a fair and reasonable consideration, and not contrary to law or public policy.',
  },
  {
    id: 'wd15',
    worldCode: 'w3',
    headline: 'Deductions for Company Salary Loans',
    prompt: 'Can management deduct monthly amortizations for a company emergency loan from a worker\'s paycheck?',
    options: [
      'Lawful — provided the employee executed a written loan agreement authorizing payroll deduction',
      'Illegal — employers can never deduct loan amortizations even with written employee agreement',
      'Lawful without written consent as long as the loan was disbursed directly to the worker\'s bank',
      'Lawful only if the loan carries a statutory interest rate of at least twelve percent per annum',
    ],
    correctIndex: 0,
    statute: 'Art. 113(c), Labor Code',
    explanation: 'Deductions are lawful in cases where the employer is authorized by law or regulations, including debts owing to the employer with written employee authorization.',
  },
  {
    id: 'wd16',
    worldCode: 'w3',
    headline: 'Prohibited Place of Wage Payment',
    prompt: 'Under Article 104 of the Labor Code, in which of the following places is the payment of wages strictly prohibited?',
    options: [
      'Inside bars, night clubs, drinking places, massage clinics, or gambling houses',
      'Inside the registered principal office or manufacturing plant of the employer',
      'Through automated teller machines (ATMs) of accredited universal commercial banks',
      'Inside company dining halls or auditoriums during designated off-duty break hours',
    ],
    correctIndex: 0,
    statute: 'Art. 104, Labor Code',
    explanation: 'Payment of wages shall be made at or near the place of undertaking, except in bars, night clubs, drinking places, massage clinics, or gambling establishments where payment is banned.',
  },
];

export const TOADSWORTH_RETIREMENT_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'tr1',
    worldCode: 'w5',
    headline: 'Statutory 22.5-Day Retirement Breakdown',
    prompt: 'Under R.A. 7641 (Art. 302), \'one-half month salary\' per year of service equals 22.5 days. How is 22.5 days composed?',
    options: [
      '15 days basic pay + 5 days Service Incentive Leave + 2.5 days (1/12 of 13th Month Pay)',
      '20 days basic pay + 2.5 days hazard allowance without service incentive leave credits',
      '22.5 calendar days straight basic pay without considering 13th month pay or incentives',
      '15 days basic pay + 7.5 days loyalty service bonus established under company practice',
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
      'Optional at 60 years old; Compulsory at 65 years old (with >= 5 years of service)',
      'Optional at 55 years old; Compulsory at 60 years old (matching civil service standards)',
      'Optional at 62 years old; Compulsory at 67 years old (under international labor conventions)',
      'Compulsory at 60 years old for all employees regardless of total years of company service',
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
      'Optional at 50 years old; Compulsory at 60 years old (with >= 5 years of mining tenure)',
      'Optional at 55 years old; Compulsory at 65 years old (identical to general commercial workers)',
      'Optional at 45 years old; Compulsory at 55 years old (reserved for hazardous military service)',
      'Compulsory at 50 years old with no optional retirement category provided under mining law',
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
      '1 month pay OR 1 month pay per year of service, whichever is higher (higher statutory tier)',
      '1 month pay OR 1/2 month pay per year of service, whichever is higher (retrenchment tier)',
      '22.5 days per year of service matching the standard statutory retirement pay formula',
      'No separation pay required if the employer provides sixty days advance termination notice',
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
      '1 month pay OR 1/2 month pay per year of service, whichever is higher (half-month tier)',
      '1 month pay per year of service matching redundancy and labor-saving machinery tiers',
      'Zero separation pay, because economic losses completely exempt employers from payouts',
      '2 months pay per year of service as mandated by the Omnibus Rules for retrenched staff',
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
      'Competent public health authority certifying disease cannot be cured within six months',
      'Company retained physician or private clinic doctor issuing an internal health memo',
      'Human Resources General Manager certifying the employee exceeded sick leave credits',
      'Social Security System regional claims processor confirming sickness benefit disbursement',
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
      'Retail, service, and agricultural establishments employing not more than ten (10) workers',
      'Corporate manufacturing establishments employing fewer than fifty (50) regular employees',
      'All family-owned holding corporations registered under the Philippine Corporation Code',
      'Foreign business process outsourcing firms operating inside PEZA registered ecozones',
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
      'Both the affected employee AND the DOLE Regional Office at least 30 days before termination',
      'Only the affected employee at least five calendar days before the effective date of exit',
      'Only the certified bargaining union president on the exact date of employee severance',
      'The NLRC Labor Arbiter within fifteen days following implementation of the reduction',
    ],
    correctIndex: 0,
    statute: 'Art. 298, Labor Code',
    explanation: 'Authorized causes require separate written notices to BOTH the worker and DOLE at least 1 month (30 days) prior to the intended date of termination.',
  },
  {
    id: 'tr9',
    worldCode: 'w5',
    headline: 'Serious Business Losses Exemption from Separation Pay',
    prompt: 'When an enterprise shuts down completely due to audited, catastrophic, serious business losses, what is its separation pay obligation?',
    options: [
      'Exempt from separation pay under Art. 298, provided serious audited losses are proven',
      'Mandated to pay one full month salary per year of service regardless of bankruptcy',
      'Mandated to pay one-half month salary per year of service subsidized by the DOLE',
      'Exempt from separation pay only if all company corporate assets are assigned to workers',
    ],
    correctIndex: 0,
    statute: 'Art. 298, Labor Code; North Davao Mining v. NLRC',
    explanation: 'Closure or cessation of operations of establishment or undertaking resulting from serious business losses or financial reverses does not require separation pay under Art. 298.',
  },
  {
    id: 'tr10',
    worldCode: 'w5',
    headline: 'Two-Notice Rule for Just Causes (King of Kings)',
    prompt: 'Under the King of Kings doctrine, what two separate written notices must an employer serve to dismiss a worker for a Just Cause (Art. 297)?',
    options: [
      'First Notice detailing specific charges with 5 days to explain, and Second Notice of decision',
      'First Notice of immediate thirty-day suspension, and Second Notice demanding voluntary quitclaim',
      'Verbal reprimand during an HR conference, followed by a written termination certificate',
      'Single written letter of dismissal served on the employee on their last day of reporting',
    ],
    correctIndex: 0,
    statute: 'King of Kings Transport v. Mamac',
    explanation: 'King of Kings sets forth the Two-Notice Rule: (1) First written notice specifying grounds with ample opportunity to explain (at least 5 calendar days), and (2) Second written notice of decision.',
  },
  {
    id: 'tr11',
    worldCode: 'w5',
    headline: 'Hearing Requirement for Just Cause Dismissal',
    prompt: 'Under Perez v. PT&T, is a formal trial-type courtroom hearing mandatory before dismissing an employee for just cause?',
    options: [
      'No — \'ample opportunity to be heard\' does not require a formal courtroom-style trial',
      'Yes — failure to conduct a full trial with stenographic cross-examination voids dismissal',
      'A formal hearing is mandatory only if the employee is represented by private legal counsel',
      'A formal hearing is mandatory only for managerial staff and optional for rank-and-file',
    ],
    correctIndex: 0,
    statute: 'Perez v. Philippine Telegraph and Telephone Co.',
    explanation: 'In Perez v. PT&T, the Supreme Court clarified that a formal hearing or conference is not mandatory unless requested by the employee or required by company rules.',
  },
  {
    id: 'tr12',
    worldCode: 'w5',
    headline: 'Six-Month Fraction Rule for Separation Pay',
    prompt: 'An employee worked for 3 years and 7 months before being retrenched under Article 298. How many years of service are credited for separation pay?',
    options: [
      'Four (4) credited years, because a fraction of at least six (6) months counts as one whole year',
      'Three (3) credited years, because fractions of a year are disregarded in authorized causes',
      'Three and a half (3.5) credited years computed on a strict pro-rata daily mathematical basis',
      'Five (5) credited years under the automatic statutory rounding rule for retrenched personnel',
    ],
    correctIndex: 0,
    statute: 'Art. 298, Labor Code',
    explanation: 'Under Article 298, a fraction of at least six (6) months shall be considered as one (1) whole year in computing statutory separation pay.',
  },
  {
    id: 'tr13',
    worldCode: 'w5',
    headline: 'Strained Relations Doctrine Remedy',
    prompt: 'When an illegally dismissed employee\'s position is fraught with deep, irreconcilable personal antagonism with management, what remedy is awarded?',
    options: [
      'Separation pay in lieu of reinstatement, plus full statutory backwages from dismissal',
      'Reinstatement to the same position without backwages or monetary moral damages',
      'Immediate transfer to another company branch with forfeiture of accrued back salaries',
      'Nominal damages of five thousand pesos with no separation pay or backwages awarded',
    ],
    correctIndex: 0,
    statute: 'Bani Rural Bank v. De Guzman',
    explanation: 'Under the Doctrine of Strained Relations, where reinstatement is no longer feasible due to severe antagonism, separation pay is awarded in lieu of reinstatement, plus full backwages.',
  },
  {
    id: 'tr14',
    worldCode: 'w5',
    headline: 'Constructive Dismissal Supreme Court Test',
    prompt: 'What is the standard test to determine if an employer\'s transfer or demotion of an employee constitutes illegal \'Constructive Dismissal\'?',
    options: [
      'Whether continued employment is rendered impossible, unreasonable, or unbearable',
      'Whether the employee experienced subjective hurt feelings or discomfort in the new role',
      'Whether the employer gave thirty days advance notice before effecting the department transfer',
      'Whether the employee\'s salary remained identical regardless of severe demotion in rank',
    ],
    correctIndex: 0,
    statute: 'Tan v. NLRC & Duldulao v. CA',
    explanation: 'Constructive dismissal exists where there is a cessation of work because continued employment is rendered impossible, unreasonable, or unlikely, as an offer involving a demotion in rank or a diminution in pay.',
  },
  {
    id: 'tr15',
    worldCode: 'w5',
    headline: '30-Day Limit on Preventive Suspension',
    prompt: 'During an internal misconduct investigation, what is the maximum duration an employee may be placed on preventive suspension without pay?',
    options: [
      'Maximum 30 days without pay; after 30 days, the employer must reinstate or pay salary',
      'Maximum 60 days without pay while the company legal department gathers evidence',
      'Maximum 90 days without pay matching standard ninety-day criminal investigation periods',
      'Unlimited duration without pay provided the worker is notified weekly of inquiry status',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book V Rule XXIII Sec. 8–9',
    explanation: 'No preventive suspension shall last longer than thirty (30) days. The employer must thereafter reinstate the worker or pay wages during any extension.',
  },
  {
    id: 'tr16',
    worldCode: 'w5',
    headline: 'Agabon Doctrine Nominal Damages for Procedural Defect',
    prompt: 'When an employee is dismissed for a valid Just Cause (theft) but the employer failed to observe statutory procedural due process, what is the ruling?',
    options: [
      'Dismissal is upheld as valid, but the employer must pay nominal damages (Agabon doctrine)',
      'Dismissal is declared void ab initio, requiring full reinstatement and backwages',
      'The employee is awarded separation pay in lieu of reinstatement without nominal damages',
      'The employer is criminally prosecuted while the employee is acquitted of all wrongdoing',
    ],
    correctIndex: 0,
    statute: 'Agabon v. NLRC (G.R. No. 158693)',
    explanation: 'Under the Agabon doctrine, if the dismissal is for just cause but lacks statutory procedural due process, the dismissal is upheld but the employer is liable for nominal damages (typically PHP 30,000 for just cause).',
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
  eliminatedIndices?: Set<number>;
}> = ({
  gameTitle,
  stageNum,
  totalStages,
  options,
  pickedOption,
  correctIndex,
  onPickOption,
  eliminatedIndices,
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
              const isEliminated = eliminatedIndices?.has(i);
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              let trackColor = 'bg-slate-950/95 hover:bg-emerald-950/80 border-slate-700 text-slate-100';
              if (isEliminated) {
                trackColor = 'opacity-30 line-through bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed';
              } else if (pickedOption !== null) {
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
                  disabled={pickedOption !== null || isEliminated}
                  onClick={() => !isEliminated && onPickOption(i)}
                  className={`p-3 rounded-xl border-2 text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${trackColor}`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-black text-amber-300 font-mario text-[10px] flex items-center justify-center shrink-0 border border-slate-700 mt-0.5">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-xs sm:text-sm font-bold leading-snug break-words whitespace-normal">{opt}</span>
                  </div>
                  {isEliminated && (
                    <span className="text-[9px] font-mario text-rose-400 shrink-0 mt-0.5">ZAPPED!</span>
                  )}
                  {pickedOption !== null && isRight && !isEliminated && (
                    <span className="text-[10px] font-mario text-amber-300 shrink-0 mt-0.5">CLEAR!</span>
                  )}
                  {pickedOption !== null && isSelected && !isRight && !isEliminated && (
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
              const isEliminated = eliminatedIndices?.has(i);
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              let ghostBox = 'bg-slate-950/95 hover:bg-indigo-950/80 border-slate-700 text-slate-100';
              if (isEliminated) {
                ghostBox = 'opacity-30 line-through bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed';
              } else if (pickedOption !== null) {
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
                  disabled={pickedOption !== null || isEliminated}
                  onClick={() => !isEliminated && onPickOption(i)}
                  className={`p-3 rounded-xl border-2 text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${ghostBox}`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <MarioBooIcon className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-bold leading-snug break-words whitespace-normal">{opt}</span>
                  </div>
                  {isEliminated && (
                    <span className="text-[9px] font-mario text-rose-400 shrink-0 mt-0.5">ZAPPED!</span>
                  )}
                  {pickedOption !== null && isRight && !isEliminated && (
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
              const isEliminated = eliminatedIndices?.has(i);
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              let starStyle = 'bg-slate-950/95 hover:bg-sky-950/80 border-slate-700 text-slate-100';
              if (isEliminated) {
                starStyle = 'opacity-30 line-through bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed';
              } else if (pickedOption !== null) {
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
                  disabled={pickedOption !== null || isEliminated}
                  onClick={() => {
                    if (!isEliminated) {
                      setAimAngle(30 + i * 35);
                      onPickOption(i);
                    }
                  }}
                  className={`p-3 rounded-xl border-2 text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${starStyle}`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <MarioStarIcon className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-bold leading-snug break-words whitespace-normal">{opt}</span>
                  </div>
                  {isEliminated && (
                    <span className="text-[9px] font-mario text-rose-400 shrink-0 mt-0.5">ZAPPED!</span>
                  )}
                  {pickedOption !== null && isRight && !isEliminated && (
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
              const isEliminated = eliminatedIndices?.has(i);
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              let chuteStyle = 'bg-slate-950/95 hover:bg-pink-950/80 border-slate-700 text-slate-100';
              if (isEliminated) {
                chuteStyle = 'opacity-30 line-through bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed';
              } else if (pickedOption !== null) {
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
                  disabled={pickedOption !== null || isEliminated}
                  onClick={() => !isEliminated && onPickOption(i)}
                  className={`p-3 rounded-xl border-2 text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${chuteStyle}`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Stamp className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-bold leading-snug break-words whitespace-normal">{opt}</span>
                  </div>
                  {isEliminated && (
                    <span className="text-[9px] font-mario text-rose-400 shrink-0 mt-0.5">ZAPPED!</span>
                  )}
                  {pickedOption !== null && isRight && !isEliminated && (
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
              const isEliminated = eliminatedIndices?.has(i);
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              let vaultStyle = 'bg-slate-950/95 hover:bg-amber-950/80 border-slate-700 text-slate-100';
              if (isEliminated) {
                vaultStyle = 'opacity-30 line-through bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed';
              } else if (pickedOption !== null) {
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
                  disabled={pickedOption !== null || isEliminated}
                  onClick={() => {
                    if (!isEliminated) {
                      setVaultDialDeg(45 + i * 90);
                      onPickOption(i);
                    }
                  }}
                  className={`p-3 rounded-xl border-2 text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${vaultStyle}`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Coins className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-bold leading-snug break-words whitespace-normal">{opt}</span>
                  </div>
                  {isEliminated && (
                    <span className="text-[9px] font-mario text-rose-400 shrink-0 mt-0.5">ZAPPED!</span>
                  )}
                  {pickedOption !== null && isRight && !isEliminated && (
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
            const isEliminated = eliminatedIndices?.has(i);
            let scaleStyle = 'bg-slate-950/95 hover:bg-stone-900 border-slate-700 text-slate-100';
            if (isEliminated) {
              scaleStyle = 'bg-slate-900/40 text-slate-600 border-slate-800 line-through opacity-40 cursor-not-allowed';
            } else if (pickedOption !== null) {
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
                disabled={pickedOption !== null || isEliminated}
                onClick={() => onPickOption(i)}
                className={`p-3 rounded-xl border-2 text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${scaleStyle}`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <Scale className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-bold leading-snug break-words whitespace-normal">{opt}</span>
                </div>
                {isEliminated && (
                  <span className="text-[10px] font-mario text-rose-400/80 shrink-0 mt-0.5">ZAPPED!</span>
                )}
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
    setMushroomUsesLeft(2);
    setEliminatedIndices(new Set());
    setFeverStars(0);
    setIsFeverActive(false);
    setShowRadarClue(false);
    setRadarUsesLeft(2);
    setSecondsLeft(15);
    setSpeedBonusAwarded(false);
    setShieldAbsorbedHit(false);
    setPhase('PLAYING');
    marioAudio.playPowerUp();
  }, [bank, deckCount, gameTitle]);

  const currentItem = deck[currentIdx];

  // Speedrunner 15s Countdown Clock
  useEffect(() => {
    if (phase !== 'PLAYING' || pickedOption !== null) return;
    if (secondsLeft <= 0) {
      handleChooseOption(-1);
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

  const handleChooseOption = (idx: number) => {
    if (pickedOption !== null || !currentItem) return;
    setPickedOption(idx);
    const isCorrect = idx === currentItem.correctIndex;
    const isFast = secondsLeft >= 8;

    if (isCorrect) {
      const nextScore = score + 1;
      const nextStreak = streak + 1;
      setScore(nextScore);
      setStreak(nextStreak);

      let coinReward = nextStreak >= 3 ? 5 : 3;
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

      onEarnCoins(coinReward);
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
        const nextHearts = hearts - 1;
        setHearts(nextHearts);
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
    setEliminatedIndices(new Set());
    setShowRadarClue(false);
    setSecondsLeft(15);
    setSpeedBonusAwarded(false);
    setShieldAbsorbedHit(false);
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
              <span className="text-[10px] font-black uppercase text-amber-300 font-mario block break-words">
                {kickerBadge}
              </span>
              <h3 className="text-lg sm:text-2xl font-black font-display text-white break-words">
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
          <div className="space-y-4">
            {/* Mini-Mario Interactive Stage Map Track */}
            <div className="bg-slate-900/90 border-2 border-slate-700 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                  <Train className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-[10px] font-black uppercase text-amber-300 font-mario hidden sm:inline">
                  Track:
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

            {/* Arcade Action Bar: 15s Speedrunner Timer, Star Fever Rush, 50/50 Mushroom Zap, Radar Clue */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 border-2 border-slate-800 rounded-2xl p-2.5 sm:p-3">
              {/* Speedrunner Clock & Star Fever Meter */}
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

              {/* Powerup Lifelines */}
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

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 max-w-full break-words">
                Case #{currentIdx + 1}: {currentItem.headline}
              </span>
              {streak >= 2 && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-black">
                  {streak}x Streak Active!
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
              eliminatedIndices={eliminatedIndices}
            />

            {/* Feedback & Advance Panel */}
            {pickedOption !== null && (
              <div
                className={`rounded-2xl p-4 border-2 space-y-1.5 ${
                  pickedOption === currentItem.correctIndex
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-100'
                    : shieldAbsorbedHit
                    ? 'bg-sky-950/70 border-sky-400 text-sky-100'
                    : 'bg-rose-950/70 border-rose-500 text-rose-100'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black">
                  <span className="inline-flex items-center gap-1.5">
                    {pickedOption === currentItem.correctIndex ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>STATUTORY HIT!</span>
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
                        <span>{pickedOption === -1 ? "TIME'S UP! (-1 HEART)" : "MISSED RULING (-1 HEART)"}</span>
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
