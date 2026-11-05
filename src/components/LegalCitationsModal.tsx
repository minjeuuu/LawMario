import React, { useState, useMemo } from 'react';
import {
  Scale,
  Search,
  X,
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  FileText,
  Gavel,
  Shield,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { MarioMushroomIcon, MarioCoinIcon, MarioStarIcon } from './MarioIcons';
import { marioAudio } from '../utils/audio';

export type CitationCategory =
  | 'all'
  | 'articles'
  | 'republic_acts'
  | 'presidential_decrees'
  | 'dept_orders'
  | 'landmark_cases';

export interface LegalCitationItem {
  id: string;
  citation: string;
  title: string;
  category: 'articles' | 'republic_acts' | 'presidential_decrees' | 'dept_orders' | 'landmark_cases';
  categoryLabel: string;
  summary: string;
  keyRule: string;
  worldId: string;
  topicId: string;
  topicTitle: string;
  worldBadge: string;
  verbatimProvision: string;
}

export const MASTER_LEGAL_CITATIONS: LegalCitationItem[] = [
  // ==================== ARTICLES ====================
  {
    id: 'cit-art82',
    citation: 'Labor Code Art. 82',
    title: 'Coverage & Exclusions from Working Hours',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Governs scope of Title I (Working Conditions). Lists 7 statutory exclusions.',
    keyRule: 'Excludes: Govt employees, managerial staff, field personnel, family members dependent for support, domestic workers, personal service, output-rate workers.',
    worldId: 'world1',
    topicId: 'm1-coverage',
    topicTitle: 'Coverage & Exclusions',
    worldBadge: 'World 1 · Hours of Work',
    verbatimProvision: `ART. 82. Coverage. — The provisions of this Title shall apply to employees in all establishments and undertakings whether for profit or not, but not to government employees, managerial employees, field personnel, members of the family of the employer who are dependent on him for support, domestic helpers, persons in the personal service of another, and workers who are paid by results as determined by the Secretary of Labor in appropriate regulations.

As used herein, "managerial employees" refer to those whose primary duty consists of the management of the establishment in which they are employed or of a department or subdivision thereof, and to other officers or members of the managerial staff.

"Field personnel" shall refer to non-agricultural employees who regularly perform their duties away from the principal place of business or branch office of the employer and whose actual hours of work in the field cannot be determined with reasonable certainty.`,
  },
  {
    id: 'cit-art83',
    citation: 'Labor Code Art. 83',
    title: 'Normal Hours of Work (8-Hour Limit & Health Personnel)',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Establishes the standard 8 hours a day as normal working hours.',
    keyRule: 'Health personnel in cities/municipalities with >=1M population or hospitals with >=100 beds work 40 hrs/week across 5 days (or 48 hrs with 30% premium for 6th day).',
    worldId: 'world1',
    topicId: 'm1-fwa-cww-meals-ot',
    topicTitle: 'Normal Hours & Health Personnel',
    worldBadge: 'World 1 · Hours of Work',
    verbatimProvision: `ART. 83. Normal hours of work. — The normal hours of work of any employee shall not exceed eight (8) hours a day.

Health personnel in cities and municipalities with a population of at least one million (1,000,000) or in hospitals and clinics with a bed capacity of at least one hundred (100) shall hold regular office hours for eight (8) hours a day, for five (5) days a week, or a total of forty (40) hours a week, exclusive of time for meals, except where the exigencies of the service require that such personnel work for six (6) days or forty-eight (48) hours, in which case, they shall be entitled to an additional compensation of at least thirty percent (30%) of their regular wage for work on the sixth day.

For purposes of this Article, "health personnel" shall include resident physicians, nurses, nutritionists, dietitians, pharmacists, social workers, laboratory technicians, paramedical technicians, psychologists, midwives, attendants and all other hospital or clinic personnel.`,
  },
  {
    id: 'cit-art84',
    citation: 'Labor Code Art. 84',
    title: 'Compensable Hours Worked & Principles of Working Time',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'All time employee is required to be on duty or at prescribed workplace.',
    keyRule: 'Waiting time is compensable if employee is engaged to wait (not waiting to be engaged). 20-min brownouts are compensable.',
    worldId: 'world1',
    topicId: 'm1-hours-worked',
    topicTitle: 'Hours Worked & Waiting Time',
    worldBadge: 'World 1 · Hours of Work',
    verbatimProvision: `ART. 84. Hours worked. — Hours worked shall include:
(a) All time during which an employee is required to be on duty or to be at a prescribed workplace; and
(b) All time during which an employee is suffered or permitted to work.

Rest periods of short duration during working hours shall be counted as hours worked.

[Implementing Rules Book III, Rule I, Sec. 4]:
(a) All hours which the employee is required to give to his employer, regardless of whether or not such hours are spent in productive labor or involve physical or mental exertion;
(b) An employee need not leave the premises of the workplace in order that his rest period may not be counted, it being sufficient that he stops working, may rest completely and may leave his workplace to go elsewhere, whether within or outside the premises;
(c) If work interruption is caused by an unscheduled brownout or power failure not exceeding twenty (20) minutes, the same shall be treated as hours worked whether the employees perform work or not.`,
  },
  {
    id: 'cit-art85',
    citation: 'Labor Code Art. 85',
    title: 'Meal Periods (60-Minute Standard & 20-Minute Short Breaks)',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Employer must give not less than 60 minutes time-off for regular meals.',
    keyRule: '60 minutes is non-compensable unless employee cannot leave post. Short meal breaks of 20 minutes count as compensable working time.',
    worldId: 'world1',
    topicId: 'm1-fwa-cww-meals-ot',
    topicTitle: 'Meal Periods & Rest Intervals',
    worldBadge: 'World 1 · Hours of Work',
    verbatimProvision: `ART. 85. Meal periods. — Subject to such regulations as the Secretary of Labor may prescribe, it shall be the duty of every employer to give his employees not less than sixty (60) minutes time-off for their regular meals.

[Omnibus Rules Book III, Rule I, Sec. 7]:
Meal periods may be shortened to not less than twenty (20) minutes, with full pay, under the following circumstances:
(a) Where the work is non-manual work in nature or does not involve strenuous physical exertion;
(b) Where the establishment regularly operates not less than sixteen (16) hours a day;
(c) In case of actual or impending emergencies, or there is urgent work to be performed on machineries, equipment or installations to avoid serious loss;
(d) Where the work is necessary to prevent serious loss of perishable goods.

Rest periods or coffee breaks running from five (5) to twenty (20) minutes shall be considered as compensable working time.`,
  },
  {
    id: 'cit-art86',
    citation: 'Labor Code Art. 86',
    title: 'Night Shift Differential (10% NSD for 10:00 PM to 6:00 AM)',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Additional compensation of 10% for work between 10:00 PM and 6:00 AM.',
    keyRule: 'Applies to every hour rendered between 10 PM and 6 AM. Overtime on night shift stacks: calculate OT rate first, then multiply by 1.10.',
    worldId: 'world1',
    topicId: 'm1-fwa-cww-meals-ot',
    topicTitle: 'Night Shift Differential (NSD)',
    worldBadge: 'World 1 · Hours of Work',
    verbatimProvision: `ART. 86. Night shift differential. — Every employee shall be paid a night shift differential of not less than ten percent (10%) of his regular wage for each hour of work performed between ten o'clock in the evening and six o'clock in the morning.

[Omnibus Rules Book III, Rule II, Sec. 1]:
This Chapter shall apply to all employees except:
(a) Government employees;
(b) Those of retail and service establishments regularly employing not more than five (5) workers;
(c) Domestic helpers and persons in the personal service of another;
(d) Managerial employees as defined in Book Three of this Code;
(e) Field personnel and other employees whose time and performance are unsupervised by the employer.`,
  },
  {
    id: 'cit-art87',
    citation: 'Labor Code Art. 87',
    title: 'Overtime Work (+25% Regular, +30% Holiday/Rest Day)',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Work rendered beyond 8 hours a day entitles worker to additional premium.',
    keyRule: 'Regular workday OT: +25% of hourly rate. Holiday or rest day OT: +30% of prevailing holiday/rest day rate.',
    worldId: 'world1',
    topicId: 'm1-fwa-cww-meals-ot',
    topicTitle: 'Overtime Computation & Rates',
    worldBadge: 'World 1 · Hours of Work',
    verbatimProvision: `ART. 87. Overtime work. — Work may be performed beyond eight (8) hours a day provided that the employee is paid for the overtime work, an additional compensation equivalent to his regular wage plus at least twenty-five percent (25%) thereof.

Work performed beyond eight hours on a holiday or rest day shall be paid an additional compensation equivalent to the rate of the first eight hours on a holiday or rest day plus at least thirty percent (30%) thereof.`,
  },
  {
    id: 'cit-art88',
    citation: 'Labor Code Art. 88',
    title: 'Undertime Not Offset by Overtime',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Statutory prohibition against offsetting undertime on one day against overtime on another.',
    keyRule: 'Undertime work on any particular day shall NOT be offset by overtime work on any other day. Leave credits cannot be deducted unilaterally to offset OT.',
    worldId: 'world1',
    topicId: 'm1-fwa-cww-meals-ot',
    topicTitle: 'Undertime Offset Prohibition',
    worldBadge: 'World 1 · Hours of Work',
    verbatimProvision: `ART. 88. Undertime not offset by overtime. — Undertime work on any particular day shall not be offset by overtime work on any other day. Permission given to the employee to go on leave on some other day of the week shall not exempt the employer from paying the additional compensation required under this Chapter.`,
  },
  {
    id: 'cit-art89',
    citation: 'Labor Code Art. 89',
    title: 'Emergency Overtime Work (5 Statutory Grounds)',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'When employer may require compulsory overtime without employee consent.',
    keyRule: 'War, disaster, imminent danger, urgency to prevent loss of perishable goods, or machinery repair where delay causes serious prejudice.',
    worldId: 'world1',
    topicId: 'm1-fwa-cww-meals-ot',
    topicTitle: 'Compulsory Overtime Conditions',
    worldBadge: 'World 1 · Hours of Work',
    verbatimProvision: `ART. 89. Emergency overtime work. — Any employee may be required by the employer to perform overtime work in any of the following cases:
(a) When the country is at war or when any other national or local emergency has been declared by the National Assembly or the Chief Executive;
(b) When it is necessary to prevent loss of life or property or in case of imminent danger to public safety due to an actual or impending emergency in the locality caused by serious accidents, fire, flood, typhoon, earthquake, epidemic, or other disaster or calamity;
(c) When there is urgent work to be performed on machines, installations, or equipment, in order to avoid serious loss or damage to the employer or some other cause of similar nature;
(d) When the work is necessary to prevent loss or damage to perishable goods; and
(e) Where the completion or continuation of the work started before the eighth hour is necessary to prevent serious obstruction or prejudice to the business or operations of the employer.`,
  },
  {
    id: 'cit-art91',
    citation: 'Labor Code Art. 91',
    title: 'Weekly Rest Day (24 Consecutive Hours)',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Every employer must provide a rest period of not less than 24 consecutive hours after 6 consecutive workdays.',
    keyRule: 'Employer schedules rest day based on business needs, but must respect employee religious preferences communicated in writing.',
    worldId: 'world2',
    topicId: 'm2-rest-days',
    topicTitle: 'Weekly Rest Day Standards',
    worldBadge: 'World 2 · Rest & Holidays',
    verbatimProvision: `ART. 91. Right to weekly rest day. — (a) It shall be the duty of every employer, whether operating for profit or not, to provide each of his employees a rest period of not less than twenty-four (24) consecutive hours after every six (6) consecutive normal work days.

(b) The employer shall determine and schedule the weekly rest day of his employees subject to collective bargaining agreement and to such rules and regulations as the Secretary of Labor and Employment may provide. However, the employer shall respect the preference of employees as to their weekly rest day when such preference is based on religious grounds.`,
  },
  {
    id: 'cit-art93',
    citation: 'Labor Code Art. 93',
    title: 'Compensation for Rest Day Work (+30%)',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Work rendered on an employee scheduled rest day.',
    keyRule: 'Work on rest day: 130% of regular rate. Work on rest day falling on a special holiday: 150%. Work on rest day falling on regular holiday: 260%.',
    worldId: 'world2',
    topicId: 'm2-rest-days',
    topicTitle: 'Rest Day Premium Computation',
    worldBadge: 'World 2 · Rest & Holidays',
    verbatimProvision: `ART. 93. Compensation for rest day, Sunday or holiday work. — (a) Where an employee is made or permitted to work on his scheduled rest day, he shall be paid an additional compensation of at least thirty percent (30%) of his regular wage. An employee shall be entitled to such additional compensation for work performed on Sunday only when it is his established rest day.

(b) When the nature of the work of the employee is such that he has no normal workdays and no certain weekly rest days can be scheduled, he shall be paid an additional compensation of at least thirty percent (30%) of his regular wage for work performed on Sundays and holidays.

(c) Work performed on any special holiday shall be paid an additional compensation of at least thirty percent (30%) of the regular wage of the employee. Where such holiday work falls on the employee's scheduled rest day, he shall be entitled to an additional compensation of at least fifty per cent (50%) of his regular wage.`,
  },
  {
    id: 'cit-art94',
    citation: 'Labor Code Art. 94',
    title: 'Right to Holiday Pay (200% Regular Holiday)',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Guarantees regular holiday pay even if unworked, and double pay if worked.',
    keyRule: 'Unworked regular holiday = 100% pay (subject to attendance on preceding day). Worked = 200%. Special non-working day unworked = No pay; worked = 130%.',
    worldId: 'world2',
    topicId: 'm2-holiday-pay',
    topicTitle: 'Holiday Pay & Multipliers',
    worldBadge: 'World 2 · Rest & Holidays',
    verbatimProvision: `ART. 94. Right to holiday pay. — (a) Every worker shall be paid his regular daily wage during regular holidays, except in retail and service establishments regularly employing less than ten (10) workers;
(b) The employer may require an employee to work on any holiday but such employee shall be paid a compensation equivalent to twice his regular rate; and
(c) As used in this Article, "holiday" includes: New Year's Day, Maundy Thursday, Good Friday, the ninth of April, the first of May, the twelfth of June, the fourth of July, the thirtieth of November, the twenty-fifth and thirtieth of December, and the day designated by law for holding a general election.

[Rule IV, Book III, Sec. 6 - Absence Preceding Holiday]:
(a) All covered employees shall be entitled to the benefit provided herein when they are on leave of absence with pay. Employees who are on leave of absence without pay on the day immediately preceding a regular holiday may not be paid the required holiday pay if they have not worked on such regular holiday.
(b) Where there are two (2) successive regular holidays, like Holy Thursday and Good Friday, an employee may not be paid for both holidays if he absents himself from work without pay on the day immediately preceding the first holiday, unless he works on the first holiday, in which case he is entitled to his holiday pay on the second holiday.`,
  },
  {
    id: 'cit-art95',
    citation: 'Labor Code Art. 95',
    title: 'Service Incentive Leave (5 Days With Pay)',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Entitlement of 5 days paid leave per year for employees with 1 year service.',
    keyRule: 'Commutable to cash if unused at end of year or upon separation. Auto Bus Transport: 3-year prescriptive period commences upon separation/demand, not end of each year.',
    worldId: 'world6',
    topicId: 'm6-service-incentive-leave',
    topicTitle: 'Service Incentive Leave (SIL)',
    worldBadge: 'World 6 · Statutory Leaves',
    verbatimProvision: `ART. 95. Right to service incentive leave. — (a) Every employee who has rendered at least one year of service shall be entitled to a yearly service incentive leave of five days with pay.

(b) This provision shall not apply to those who are already enjoying the benefit herein provided, those enjoying vacation leave with pay of at least five days and those employed in establishments regularly employing less than ten employees, or in establishments exempted from granting this benefit by the Secretary of Labor and Employment after considering the viability or financial condition of such establishment.

(c) The grant of benefit in excess of that provided herein shall not be made a subject of arbitration or any court of action.`,
  },
  {
    id: 'cit-art96',
    citation: 'Labor Code Art. 96',
    title: 'Service Charges in Establishments (100% Equal Distribution)',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Service charges collected by hotels, restaurants, and similar establishments.',
    keyRule: 'Under R.A. 11360, 100% is distributed completely and equally among rank-and-file and supervisory employees (formerly 85/15 split abolished).',
    worldId: 'world2',
    topicId: 'm2-service-charge',
    topicTitle: '100% Service Charge Rule',
    worldBadge: 'World 2 · Rest & Holidays',
    verbatimProvision: `ART. 96. Service charges. — All service charges collected by hotels, restaurants and similar establishments shall be distributed completely and equally among the covered workers, except managerial employees as defined herein.

In the event that the minimum wage is increased by law or wage order, service charges paid to the covered employees shall not be considered in determining the employer's compliance with the minimum wage law.

To facilitate resolution of any dispute between the management and the employees relating to service charges, the grievance machinery established in the collective bargaining agreement shall be utilized. In case no grievance mechanism is established or if the grievance machinery fails to resolve the dispute, the same shall be settled through conciliation or arbitration by the Department of Labor and Employment.`,
  },
  {
    id: 'cit-art97',
    citation: 'Labor Code Art. 97',
    title: 'Definition of Wage & Wage vs Salary',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Remuneration or earnings capable of being expressed in terms of money.',
    keyRule: 'Includes fair and reasonable value of board, lodging, or other facilities customarily furnished by employer. Wage is for manual/rank-and-file; Salary is for clerical/managerial.',
    worldId: 'world3',
    topicId: 'm3-wage-principles',
    topicTitle: 'Wage Definitions & Principles',
    worldBadge: 'World 3 · Wages & D.O. 174',
    verbatimProvision: `ART. 97. Definitions. — As used in this Title:
(f) "Wage" paid to any employee shall mean the remuneration or earnings, however designated, capable of being expressed in terms of money, whether fixed or ascertained on a time, task, piece, or commission basis, or other method of calculating the same, which is payable by an employer to an employee under a written or unwritten contract of employment for work done or to be done, or for services rendered or to be rendered; and includes the fair and reasonable value, as determined by the Secretary of Labor and Employment, of board, lodging, or other facilities customarily furnished by the employer to the employee. "Fair and reasonable value" shall not include any profit to the employer or to any person affiliated with the employer.`,
  },
  {
    id: 'cit-art100',
    citation: 'Labor Code Art. 100',
    title: 'Non-Diminution of Benefits Doctrine',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Prohibits unilateral withdrawal or diminution of established employee benefits.',
    keyRule: 'Benefits given voluntarily, consistently, and deliberately over a long period cannot be unilaterally revoked by the employer.',
    worldId: 'world3',
    topicId: 'm3-wage-principles',
    topicTitle: 'Non-Diminution of Benefits',
    worldBadge: 'World 3 · Wages & D.O. 174',
    verbatimProvision: `ART. 100. Prohibition against elimination or diminution of benefits. — Nothing in this Book shall be construed to eliminate or in any way diminish supplements, or other employee benefits being enjoyed at the time of promulgation of this Code.`,
  },
  {
    id: 'cit-art102',
    citation: 'Labor Code Art. 102',
    title: 'Forms of Wage Payment (Legal Tender Mandatory)',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Wages must be paid in legal tender; vouchers, chits, and promissory notes are void.',
    keyRule: 'No promissory notes, vouchers, tokens, or chits. Check or ATM/bank transfer permitted under DOLE regulations.',
    worldId: 'world3',
    topicId: 'm3-wage-principles',
    topicTitle: 'Forms of Payment',
    worldBadge: 'World 3 · Wages & D.O. 174',
    verbatimProvision: `ART. 102. Forms of payment. — No employer shall pay the wages of an employee by means of promissory notes, vouchers, coupons, tokens, tickets, chits, or any object other than legal tender, even when expressly requested by the employee.

Payment of wages by check or money order shall be allowed when such manner of payment is customary on the date of effectivity of this Code, or is necessary because of special circumstances as specified in appropriate regulations to be issued by the Secretary of Labor and Employment or as stipulated in a collective bargaining agreement.`,
  },
  {
    id: 'cit-art106',
    citation: 'Labor Code Arts. 106–109',
    title: 'Contractor vs Labor-Only Contracting',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Governs contracting and subcontracting arrangements and joint liabilities.',
    keyRule: 'Labor-Only Contracting is strictly prohibited: Principal is deemed direct employer. Legitimate contracting requires substantial capital (P5M under D.O. 174) and independent control.',
    worldId: 'world3',
    topicId: 'm3-payment-contracting-distortion',
    topicTitle: 'D.O. 174 Contracting Rules',
    worldBadge: 'World 3 · Wages & D.O. 174',
    verbatimProvision: `ART. 106. Contractor or subcontractor. — Whenever an employer enters into a contract with another person for the performance of the former's work, the employees of the contractor and of the latter's subcontractor, if any, shall be paid in accordance with the provisions of this Code.

In the event that the contractor or subcontractor fails to pay the wages of his employees in accordance with this Code, the employer shall be jointly and severally liable with his contractor or subcontractor to such employees to the extent of the work performed under the contract, in the same manner and extent that he is liable to employees directly employed by him.

There is "labor-only contracting" where the person supplying workers to an employer does not have substantial capital or investment in the form of tools, equipment, machineries, work premises, among others, and the workers recruited and placed by such person are performing activities which are directly related to the principal business of such employer. In such cases, the person or intermediary shall be considered merely as an agent of the employer who shall be responsible to the workers in the same manner and extent as if the latter were directly employed by him.`,
  },
  {
    id: 'cit-art113',
    citation: 'Labor Code Art. 113',
    title: 'Wage Deductions (3 Exclusive Statutory Exceptions)',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'General prohibition against deducting wages without employee consent.',
    keyRule: 'Only 3 legal exceptions: (1) Insurance premiums with written consent; (2) Union dues via check-off; (3) When authorized by law (tax, SSS, PhilHealth, Pag-IBIG).',
    worldId: 'world3',
    topicId: 'm3-payment-contracting-distortion',
    topicTitle: 'Deductions & Art. 113 Exceptions',
    worldBadge: 'World 3 · Wages & D.O. 174',
    verbatimProvision: `ART. 113. Wage deductions. — No employer, in his own behalf or in behalf of any person, shall make any deduction from the wages of his employees, except:
(a) In cases where the worker is insured with his consent by the employer, and the deduction is to recompense the employer for the amount paid by him as premium on the insurance;
(b) For union dues, in cases where the right of the worker or his union to check-off has been recognized by the employer or authorized in writing by the individual worker concerned; and
(c) In cases where the employer is authorized by law or regulations issued by the Secretary of Labor and Employment.`,
  },
  {
    id: 'cit-art124',
    citation: 'Labor Code Art. 124',
    title: 'Wage Distortion Doctrine & Rectification',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Disruption of wage hierarchy resulting from a statutory minimum wage order.',
    keyRule: 'Does NOT invalidate wage order. Resolved via CBA grievance machinery or NCMB voluntary arbitration. Formula: Minimum Wage Increase / Present Salary x Minimum Wage.',
    worldId: 'world3',
    topicId: 'm3-payment-contracting-distortion',
    topicTitle: 'Wage Distortion & Resolution',
    worldBadge: 'World 3 · Wages & D.O. 174',
    verbatimProvision: `ART. 124. Standards/Criteria for minimum wage fixing. — Where the application of any prescribed wage increase by a wage order issued by any Regional Board results in distortions of the wage structure within an establishment, the employer and the union shall negotiate to correct the distortions. Any dispute thereof shall be resolved through the grievance procedure under their collective bargaining agreement and, if it remains unresolved, through voluntary arbitration.

As used herein, a "wage distortion" shall mean a situation where an increase in prescribed wage rates results in the elimination or severe contraction of intentional quantitative differences in wage or salary rates between and among employee groups in an establishment as to effectively obliterate the distinctions embodied in such wage structure based on skills, length of service, or other logical bases of differentiation.`,
  },
  {
    id: 'cit-art133',
    citation: 'Labor Code Arts. 130–136',
    title: 'Employment of Women & Stipulation Against Marriage',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Statutory protections for women workers, seats, nursery facilities, and non-discrimination.',
    keyRule: 'Art. 133: Non-marriage clauses are strictly null and void (PT&T v. NLRC). Equal remuneration for work of equal value.',
    worldId: 'world4',
    topicId: 'm4-women-workers',
    topicTitle: 'Protections for Women Workers',
    worldBadge: 'World 4 · Special Groups',
    verbatimProvision: `ART. 133. Stipulation against marriage. — It shall be unlawful for an employer to require as a condition of employment or continuation of employment that a woman employee shall not get married, or to stipulate expressly or tacitly that upon getting married, a woman employee shall be deemed resigned or separated, or to actually dismiss, discharge, discriminate or otherwise prejudice a woman employee merely by reason of her marriage.

ART. 134. Prohibited acts. — It shall be unlawful for any employer:
(1) To deny any woman employee the benefits provided for in this Chapter or to discharge any woman employed by him for the purpose of preventing her from enjoying any of the benefits provided under this Code;
(2) To discharge such woman on account of her pregnancy, or while on leave or in confinement due to her pregnancy;
(3) To discharge or refuse the admission of such woman upon returning to her work for fear that she may again become pregnant.`,
  },
  {
    id: 'cit-art138',
    citation: 'Labor Code Arts. 137–138',
    title: 'Employment of Minors & Child Labor Rules',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Regulation of working minors and minimum employable age.',
    keyRule: 'Children below 15 generally cannot work unless under sole responsibility of parents or in public entertainment with DOLE Working Child Permit (max 4 hrs/day, 20 hrs/week; no work 8 PM–6 AM).',
    worldId: 'world4',
    topicId: 'm4-minors-kasambahay-homework',
    topicTitle: 'Child Labor & Working Minors',
    worldBadge: 'World 4 · Special Groups',
    verbatimProvision: `ART. 137. Minimum employable age. — (a) No child below fifteen (15) years of age shall be employed, except when he works directly under the sole responsibility of his parents or guardian, and his employment does not in any way interfere with his schooling.
(b) Any person between fifteen (15) and eighteen (18) years of age may be employed for such number of hours and in such periods of the day as determined by the Secretary of Labor and Employment in appropriate regulations.
(c) The foregoing provisions shall in no case allow the employment of a person below eighteen (18) years of age in an undertaking which is hazardous or deleterious in nature as determined by the Secretary of Labor and Employment.`,
  },
  {
    id: 'cit-art302',
    citation: 'Labor Code Art. 302 (formerly 287)',
    title: 'Retirement Pay Law (22.5-Day Half-Month Formula)',
    category: 'articles',
    categoryLabel: 'Labor Code Article',
    summary: 'Mandatory retirement compensation under R.A. 7641.',
    keyRule: 'One-half month salary = 22.5 days: 15 days basic salary + 5 days SIL + 2.5 days (1/12 of 13th month pay). Age 60 optional, age 65 compulsory, minimum 5 years service.',
    worldId: 'world5',
    topicId: 'm5-vawc-minors-telecommuting',
    topicTitle: 'Retirement Pay Formula',
    worldBadge: 'World 5 · Protective Laws',
    verbatimProvision: `ART. 302 [287]. Retirement. — Any employee may be retired upon reaching the retirement age established in the collective bargaining agreement or other applicable employment contract.

In the absence of a retirement plan or agreement providing for retirement benefits of employees in the establishment, an employee upon reaching the age of sixty (60) years or more, but not beyond sixty-five (65) years which is hereby declared the compulsory retirement age, who has served at least five (5) years in the said establishment, may retire and shall be entitled to retirement pay equivalent to at least one-half (1/2) month salary for every year of service, a fraction of at least six (6) months being considered as one whole year.

Unless the parties provide for broader inclusions, the term "one-half (1/2) month salary" shall mean fifteen (15) days plus one-twelfth (1/12) of the 13th month pay and the cash equivalent of not more than five (5) days of service incentive leaves [Total: 22.5 days per year of service under Capitol Wireless v. Sec. of Labor].`,
  },

  // ==================== REPUBLIC ACTS ====================
  {
    id: 'cit-ra11360',
    citation: 'Republic Act No. 11360',
    title: '100% Service Charge Distribution Act',
    category: 'republic_acts',
    categoryLabel: 'Republic Act',
    summary: 'Abolished the former 85/15 service charge sharing ratio.',
    keyRule: '100% of service charges must be distributed completely and equally among rank-and-file and supervisory employees in hotels, restaurants, and eateries.',
    worldId: 'world2',
    topicId: 'm2-service-charge',
    topicTitle: 'Service Charges (R.A. 11360)',
    worldBadge: 'World 2 · Rest & Holidays',
    verbatimProvision: `REPUBLIC ACT NO. 11360:
AN ACT PROVIDING THAT SERVICE CHARGES COLLECTED BY HOTELS, RESTAURANTS AND OTHER SIMILAR ESTABLISHMENTS BE DISTRIBUTED IN FULL TO ALL COVERED EMPLOYEES, AMENDING FOR THE PURPOSE PRESIDENTIAL DECREE NO. 442, AS AMENDED, OTHERWISE KNOWN AS THE "LABOR CODE OF THE PHILIPPINES"

SECTION 1. Article 96 of the Labor Code of the Philippines is hereby amended to read as follows:
"ART. 96. Service Charges. — All service charges collected by hotels, restaurants and similar establishments shall be distributed completely and equally among the covered workers, except managerial employees as defined herein."`,
  },
  {
    id: 'cit-ra10361',
    citation: 'Republic Act No. 10361',
    title: 'Batas Kasambahay (Domestic Workers Act)',
    category: 'republic_acts',
    categoryLabel: 'Republic Act',
    summary: 'Comprehensive Magna Carta for domestic workers in the Philippines.',
    keyRule: 'Guarantees: minimum wage, 13th month pay, 5 days SIL, SSS/PhilHealth/Pag-IBIG, 8 hours rest per day, 24 consecutive hours weekly rest, free board, lodging, and medical attendance.',
    worldId: 'world4',
    topicId: 'm4-minors-kasambahay-homework',
    topicTitle: 'Batas Kasambahay Rights',
    worldBadge: 'World 4 · Special Groups',
    verbatimProvision: `REPUBLIC ACT NO. 10361 (Domestic Workers Act / Batas Kasambahay):
SEC. 4. Rights and Privileges. — The domestic worker is entitled to:
(a) Minimum wage; (b) Other mandatory benefits, such as daily and weekly rest periods; (c) Free board, lodging and medical attendance; (d) Right to privacy; (e) Access to outside communication; (f) Access to education and training; (g) Appropriate rest and assistance in case of labor-related disputes; and (h) The right to form, join, or assist in labor organizations.

SEC. 24. Service Incentive Leave. — A domestic worker who has rendered at least one (1) year of service shall be entitled to an annual service incentive leave of five (5) days with pay: Provided, That any unused portion of said annual leave shall not be cumulative or carried over to the succeeding years. Such leave shall not be convertible to cash.

SEC. 30. Social and Other Benefits. — A domestic worker who has rendered at least one (1) month of service shall be covered by SSS, PhilHealth, and Pag-IBIG. Premium payments shall be shouldered entirely by the employer if the wage is below ₱5,000/month.`,
  },
  {
    id: 'cit-ra11210',
    citation: 'Republic Act No. 11210',
    title: '105-Day Expanded Maternity Leave Law',
    category: 'republic_acts',
    categoryLabel: 'Republic Act',
    summary: 'Extends paid maternity leave to 105 days with full pay for live births.',
    keyRule: '105 days for live birth with full pay, extendible by 30 days without pay. Solo mothers get +15 days (120 days total). Miscarriage or emergency termination of pregnancy gets 60 days. Up to 7 days can be allocated to father.',
    worldId: 'world6',
    topicId: 'm6-maternity-leave',
    topicTitle: 'Expanded Maternity Leave',
    worldBadge: 'World 6 · Statutory Leaves',
    verbatimProvision: `REPUBLIC ACT NO. 11210 (105-Day Expanded Maternity Leave Act):
SEC. 3. Grant of Maternity Leave. — All covered female workers in government and the private sector, including those in the informal economy, regardless of civil status or the legitimacy of her child, shall be granted one hundred five (105) days maternity leave with full pay and an option to extend for an additional thirty (30) days without pay: Provided, That in case the worker qualifies as a solo parent under Republic Act No. 8972, or the "Solo Parents' Welfare Act of 2000", the worker shall be granted an additional fifteen (15) days maternity leave with full pay.

In cases of miscarriage or emergency termination of pregnancy, maternity leave of sixty (60) days with full pay shall be granted.

SEC. 6. Allocation of Maternity Leave Credits. — Any female worker entitled to maternity leave benefits may, at her option, allocate up to seven (7) days of said benefits to the child's father, whether or not the same is married to the female worker.`,
  },
  {
    id: 'cit-ra8187',
    citation: 'Republic Act No. 8187',
    title: 'Paternity Leave Act of 1996',
    category: 'republic_acts',
    categoryLabel: 'Republic Act',
    summary: 'Grants paternity leave of 7 calendar days with full pay to married male employees.',
    keyRule: 'Applies to first 4 deliveries or miscarriages of the legitimate spouse with whom the husband cohabits. Must be availed of within 60 days of delivery.',
    worldId: 'world6',
    topicId: 'm6-paternity-leave',
    topicTitle: 'Paternity Leave (R.A. 8187)',
    worldBadge: 'World 6 · Statutory Leaves',
    verbatimProvision: `REPUBLIC ACT NO. 8187 (Paternity Leave Act of 1996):
SEC. 2. Paternity Leave. — Notwithstanding any law, rules and regulations to the contrary, every married male employee in the private and public sectors shall be entitled to a paternity leave of seven (7) days with full pay for the first four (4) deliveries of the legitimate spouse with whom he is cohabiting.

The male employee applying for paternity leave shall notify his employer of the pregnancy of his legitimate spouse and the expected date of such delivery.

For purposes of this Act, delivery shall include childbirth or any miscarriage.`,
  },
  {
    id: 'cit-ra11861',
    citation: 'Republic Act No. 11861',
    title: 'Expanded Solo Parents Welfare Act',
    category: 'republic_acts',
    categoryLabel: 'Republic Act',
    summary: 'Enhanced benefits and shortened tenure requirement for solo parent leave.',
    keyRule: '7 working days parental leave with full pay granted after only 6 months of continuous service (shortened from 1-year service rule under R.A. 8972).',
    worldId: 'world6',
    topicId: 'm6-solo-parents-leave',
    topicTitle: 'Solo Parent Leave',
    worldBadge: 'World 6 · Statutory Leaves',
    verbatimProvision: `REPUBLIC ACT NO. 11861 (Amending R.A. 8972):
SEC. 8. Parental Leave. — In addition to leave privileges under existing laws, a forfeitable parental leave of not more than seven (7) working days with pay every year shall be granted to any solo parent employee who has rendered service of at least six (6) months, regardless of employment status.

Such leave shall be noncumulative and nonconvertible to cash unless specifically agreed upon in the collective bargaining agreement or employment contract.

SEC. 3. Definition of Terms. — "Dependent" refers to a child living with and dependent upon the solo parent for support, unmarried, unemployed, and twenty-two (22) years of age or below, or eighteen (18) years of age or above but incapable of self-support due to mental, physical, or developmental disability.`,
  },
  {
    id: 'cit-ra9262',
    citation: 'Republic Act No. 9262',
    title: 'Anti-VAWC Act of 2004 (10 Days Paid Leave)',
    category: 'republic_acts',
    categoryLabel: 'Republic Act',
    summary: 'Special protection and leave benefit for female victims of violence.',
    keyRule: '10 days paid leave extendible when necessary, supported by BPO, TPO, or certification from punong barangay or clerk of court.',
    worldId: 'world6',
    topicId: 'm6-vawc-leave',
    topicTitle: 'Anti-VAWC Leave (10 Days)',
    worldBadge: 'World 6 · Statutory Leaves',
    verbatimProvision: `REPUBLIC ACT NO. 9262 (Anti-Violence Against Women and Their Children Act of 2004):
SEC. 43. Entitled to Leave. — Victims under this Act shall be entitled to take a paid leave of absence up to ten (10) days in addition to other paid leaves under the Labor Code and Civil Service Rules and regulations, extendible when the necessity arises as specified in the protection order.

Any employer who shall prejudice the right of the person under this section shall be penalized in accordance with the provisions of the Labor Code and Civil Service Rules and Regulations. Likewise, an employer who prejudices any person for assisting a co-employee who is a victim under this Act shall be liable for discrimination.`,
  },
  {
    id: 'cit-ra9710',
    citation: 'Republic Act No. 9710',
    title: 'Magna Carta of Women (Gynecological Surgery Leave)',
    category: 'republic_acts',
    categoryLabel: 'Republic Act',
    summary: '2 months leave with full pay following surgery caused by gynecological disorders.',
    keyRule: 'Requires 6 months aggregate continuous service in the last 12 months. Covers D&C and reproductive surgeries.',
    worldId: 'world6',
    topicId: 'm6-gynecological-leave',
    topicTitle: 'Gynecological Surgery Leave',
    worldBadge: 'World 6 · Statutory Leaves',
    verbatimProvision: `REPUBLIC ACT NO. 9710 (Magna Carta of Women):
SEC. 18. Special Leave Benefits for Women. — A woman employee having rendered continuous aggregate employment service of at least six (6) months for the last twelve (12) months shall be entitled to a special leave benefit of two (2) months with full pay based on her gross monthly compensation following surgery caused by gynecological disorders.

[DOLE D.O. 112-11]:
"Gynecological disorders" refer to disorders that require surgical procedures such as, but not limited to, dilatation and curettage (D&C) and those involving female reproductive organs such as the vagina, cervix, uterus, fallopian tubes, ovaries, breast, adnexa, and pelvic floor.`,
  },
  {
    id: 'cit-ra7877',
    citation: 'Republic Act No. 7877',
    title: 'Anti-Sexual Harassment Act of 1995',
    category: 'republic_acts',
    categoryLabel: 'Republic Act',
    summary: 'Defines work, education or training-related sexual harassment and mandates employer CODI.',
    keyRule: 'Committed by someone having authority, influence, or moral ascendancy. Demanding sexual favors is unlawful whether accepted or rejected. Employer is solidarily liable if no action taken.',
    worldId: 'world5',
    topicId: 'm5-harassment-safe-spaces',
    topicTitle: 'Anti-Sexual Harassment Act',
    worldBadge: 'World 5 · Protective Laws',
    verbatimProvision: `REPUBLIC ACT NO. 7877:
SEC. 3. Work, Education or Training-related Sexual Harassment Defined. — Work, education or training-related sexual harassment is committed by an employer, employee, manager, supervisor, agent of the employer, teacher, instructor, professor, coach, trainor, or any other person who, having authority, influence or moral ascendancy over another in a work or training or education environment, demands, requests or otherwise requires any sexual favor from the other, regardless of whether the demand, request or requirement for submission is accepted by the object of said Act.

SEC. 4. Duty of the Employer or Head of Office. — It shall be the duty of the employer or the head of the work-related, educational or training environment or institution, to create a Committee on Decorum and Investigation (CODI) of cases on sexual harassment.`,
  },
  {
    id: 'cit-ra11313',
    citation: 'Republic Act No. 11313',
    title: 'Safe Spaces Act (Bawal Bastos Law)',
    category: 'republic_acts',
    categoryLabel: 'Republic Act',
    summary: 'Expands gender-based sexual harassment coverage to streets, public spaces, online platforms, and workplaces.',
    keyRule: 'Penalizes peer-to-peer and subordinate-to-superior harassment (unlike RA 7877 which required moral ascendancy). Employers must create independent CODI.',
    worldId: 'world5',
    topicId: 'm5-harassment-safe-spaces',
    topicTitle: 'Safe Spaces Act (Bawal Bastos)',
    worldBadge: 'World 5 · Protective Laws',
    verbatimProvision: `REPUBLIC ACT NO. 11313:
SEC. 16. Workplace Sexual Harassment. — The crime of gender-based sexual harassment in the workplace includes:
(a) An act or series of acts involving any unwelcome sexual advances, requests or demand for sexual favors or any other act of sexual nature, whether done verbally, physically or through technology;
(b) A conduct of sexual nature and other conduct based on sex which affects the dignity of a person, which is unwelcome, unreasonable, and offensive to the recipient, whether between peers, by a superior to a subordinate, or by a subordinate to a superior;
(c) A conduct that creates an intimidating, hostile or humiliating environment for the recipient.`,
  },
  {
    id: 'cit-ra10028',
    citation: 'Republic Act No. 10028',
    title: 'Expanded Breastfeeding Promotion Act of 2009',
    category: 'republic_acts',
    categoryLabel: 'Republic Act',
    summary: 'Mandates workplace lactation stations and 40 minutes compensable lactation break.',
    keyRule: 'Nursing employees get not less than 40 minutes compensable lactation break for every 8 hours work shift, counted as hours worked.',
    worldId: 'world5',
    topicId: 'm5-women-special-laws',
    topicTitle: 'Workplace Breastfeeding Rights',
    worldBadge: 'World 5 · Protective Laws',
    verbatimProvision: `REPUBLIC ACT NO. 10028:
SEC. 6. Lactation Stations. — All health and non-health facilities, establishments or institutions shall establish lactation stations accessible to mothers, adequately provided with lavatory, refrigeration for breastmilk, electrical outlets, comfortable seats, and small table.

SEC. 7. Lactation Periods. — Nursing employees shall be granted break intervals in addition to the regular time-off for meals to breastfeed or express milk. These intervals, which shall be counted as compensable hours worked, shall not be less than a total of forty (40) minutes for every eight-hour working period.`,
  },
  {
    id: 'cit-ra11165',
    citation: 'Republic Act No. 11165',
    title: 'Telecommuting Act',
    category: 'republic_acts',
    categoryLabel: 'Republic Act',
    summary: 'Governs work from home and remote work arrangements in the private sector.',
    keyRule: 'Equal treatment rule: telecommuting workers must receive same pay, overtime, night differential, rest days, holidays, and promotional opportunities as on-site workers.',
    worldId: 'world5',
    topicId: 'm5-vawc-minors-telecommuting',
    topicTitle: 'Telecommuting & Remote Work',
    worldBadge: 'World 5 · Protective Laws',
    verbatimProvision: `REPUBLIC ACT NO. 11165 (Telecommuting Act):
SEC. 5. Fair Treatment. — The employer shall ensure that telecommuting employees are given the same treatment as that of comparable employees working at the employer's premises. All telecommuting employees shall:
(a) Receive a rate of pay, including overtime and night shift differential, and other similar monetary benefits not lower than those provided in applicable legal enactments;
(b) Have the right to rest periods, regular holidays, and special nonworking days;
(c) Have the same or equivalent workload and performance standards;
(d) Have the same access to training and career development opportunities.`,
  },

  // ==================== PRESIDENTIAL DECREES & EXECUTIVE ORDERS ====================
  {
    id: 'cit-pd851',
    citation: 'Presidential Decree No. 851',
    title: '13th Month Pay Law',
    category: 'presidential_decrees',
    categoryLabel: 'Presidential Decree',
    summary: 'Mandates payment of 13th month pay to all rank-and-file employees not later than Dec 24.',
    keyRule: '1/12 of total basic salary earned in the calendar year. Basic salary excludes OT, NSD, holiday pay, and allowances unless included by company practice.',
    worldId: 'world2',
    topicId: 'm2-13th-month',
    topicTitle: '13th Month Pay (P.D. 851)',
    worldBadge: 'World 2 · Rest & Holidays',
    verbatimProvision: `PRESIDENTIAL DECREE NO. 851:
REQUIRING ALL EMPLOYERS TO PAY THEIR EMPLOYEES A 13TH-MONTH PAY

SECTION 1. All employers are hereby required to pay all their rank-and-file employees receiving a basic salary, regardless of the nature of their employment, a 13th-month pay not later than December 24 of every year.

[Implementing Rules]:
The minimum 13th month pay shall not be less than one-twelfth (1/12) of the total basic salary earned by an employee within a calendar year. All rank-and-file employees who have worked for at least one (1) month during the calendar year are covered.`,
  },
  {
    id: 'cit-eo292',
    citation: 'Executive Order No. 292',
    title: 'Administrative Code Holiday Provisions (as amended by R.A. 9849)',
    category: 'presidential_decrees',
    categoryLabel: 'Executive Order / Statute',
    summary: 'Codifies the 12 Regular Holidays and statutory Special Non-Working Days.',
    keyRule: '12 Regular Holidays paid at 200% if worked (100% if unworked). Special Days paid at 130% if worked (0% if unworked under No Work-No Pay).',
    worldId: 'world2',
    topicId: 'm2-holiday-pay',
    topicTitle: 'Statutory Holiday Codification',
    worldBadge: 'World 2 · Rest & Holidays',
    verbatimProvision: `EXECUTIVE ORDER NO. 292, SEC. 26 (AS AMENDED BY R.A. 9849):
Regular Holidays:
New Year's Day (Jan 1), Maundy Thursday, Good Friday, Araw ng Kagitingan (Apr 9), Labor Day (May 1), Independence Day (Jun 12), National Heroes Day (Last Monday of Aug), Bonifacio Day (Nov 30), Christmas Day (Dec 25), Rizal Day (Dec 30), Eid'l Fitr, and Eid'l Adha.

Special Non-Working Days:
Ninoy Aquino Day (Aug 21), All Saints' Day (Nov 1), Feast of the Immaculate Conception (Dec 8), Last Day of the Year (Dec 31).`,
  },

  // ==================== DEPARTMENT ORDERS & ADVISORIES ====================
  {
    id: 'cit-do174',
    citation: 'DOLE Department Order No. 174, Series of 2017',
    title: 'Rules Implementing Articles 106 to 109 of the Labor Code',
    category: 'dept_orders',
    categoryLabel: 'DOLE Department Order',
    summary: 'Strict guidelines regulating contracting and subcontracting; absolute ban on Labor-Only Contracting.',
    keyRule: 'Substantial capital raised to P5,000,000 paid-up capital/net worth. Prohibits core-activity farming out to evade regular employment.',
    worldId: 'world3',
    topicId: 'm3-payment-contracting-distortion',
    topicTitle: 'DOLE D.O. 174-17 Rules',
    worldBadge: 'World 3 · Wages & D.O. 174',
    verbatimProvision: `DOLE DEPARTMENT ORDER NO. 174-17:
SECTION 5. Absolute Prohibition Against Labor-Only Contracting. — Labor-only contracting, which is prohibited, refers to an arrangement where the contractor or subcontractor merely recruits, supplies or places workers to perform a job or work for a principal, and any of the following elements are present:
(a) The contractor does not have substantial capital or investments in the form of tools, equipment, machineries, work premises, among others; and the workers recruited are performing activities directly related to the principal business; OR
(b) The contractor does not exercise the right of control over the performance of the work of the employee.

SECTION 3(l). "Substantial capital" refers to paid-up capital stock/shares of at least Five Million Pesos (P5,000,000.00).`,
  },
  {
    id: 'cit-cww-advisory',
    citation: 'DOLE Advisory No. 02, Series of 2004',
    title: 'Guidelines on Compressed Work Week (CWW) Schemes',
    category: 'dept_orders',
    categoryLabel: 'DOLE Advisory',
    summary: 'Allows 48 normal weekly hours to be compressed into fewer days without overtime pay.',
    keyRule: 'Normal hours can be compressed to 4 or 5 days, up to a maximum of 12 hours/day without overtime pay, provided total weekly hours do not exceed 48.',
    worldId: 'world1',
    topicId: 'm1-fwa-cww-meals-ot',
    topicTitle: 'Compressed Work Week (CWW)',
    worldBadge: 'World 1 · Hours of Work',
    verbatimProvision: `DOLE ADVISORY NO. 02, SERIES OF 2004:
A "Compressed Workweek" (CWW) scheme is an alternative arrangement whereby the normal workweek is reduced to less than six (6) days but the total number of work hours of 48 hours per week shall remain.

Conditions for Valid Adoption:
1. Reversion to the regular 8-hour workday remains available when business exigencies dictate;
2. Daily work hours shall not exceed twelve (12) hours per day;
3. Work beyond eight (8) hours up to twelve (12) hours under a valid CWW scheme shall NOT be entitled to overtime premium, provided weekly total does not exceed 48 hours;
4. Work performed beyond the agreed daily compressed hours (e.g., in excess of 10 or 12 hours) shall be paid at standard overtime rates.`,
  },

  // ==================== LANDMARK SUPREME COURT CASES ====================
  {
    id: 'cit-calamba',
    citation: 'Calamba Medical Center v. CIR (G.R. No. 148769)',
    title: 'The Four-Fold Test & Control Doctrine',
    category: 'landmark_cases',
    categoryLabel: 'Landmark Jurisprudence',
    summary: 'The definitive Supreme Court ruling establishing tests for Employer-Employee relationship.',
    keyRule: 'Four elements: (1) Selection/engagement, (2) Payment of wages, (3) Power of dismissal, (4) Control test. The Control Test is the most crucial determinant.',
    worldId: 'world1',
    topicId: 'm1-coverage',
    topicTitle: 'Four-Fold Test Doctrine',
    worldBadge: 'World 1 · Hours of Work',
    verbatimProvision: `CALAMBA MEDICAL CENTER V. NATIONAL LABOR RELATIONS COMMISSION (G.R. NO. 148769):
"Under the four-fold test, the essential elements of an employer-employee relationship are:
(1) The selection and engagement of the employee;
(2) The payment of wages;
(3) The power of dismissal; and
(4) The employer's power to control the employee's conduct.

It is the so-called 'control test' that is the most important element. The test is whether the employer controls or has reserved the right to control the employee not only as to the result of the work to be done but also as to the means and methods by which the same is to be accomplished."`,
  },
  {
    id: 'cit-autobus',
    citation: 'Auto Bus Transport Systems v. Bautista (G.R. No. 156367)',
    title: 'SIL Prescription & Conversion Doctrine',
    category: 'landmark_cases',
    categoryLabel: 'Landmark Jurisprudence',
    summary: 'Rules on the commutability of Service Incentive Leave and commencement of prescription.',
    keyRule: 'SIL is cumulative and convertible to cash. The 3-year prescriptive period under Art. 291 commences only upon termination or employer refusal upon demand.',
    worldId: 'world6',
    topicId: 'm6-service-incentive-leave',
    topicTitle: 'SIL Prescription Doctrine',
    worldBadge: 'World 6 · Statutory Leaves',
    verbatimProvision: `AUTO BUS TRANSPORT SYSTEMS, INC. V. BAUTISTA (G.R. NO. 156367):
"The cause of action of an entitled employee to claim his service incentive leave pay accrues from the moment the employer refuses to pay its monetary equivalent after demand of commutation or upon severance of the employer-employee relationship.

Correspondingly, the three-year prescriptive period provided under Article 291 [now 306] of the Labor Code commences to run only from such refusal to pay upon demand, or from the date of employment termination, not at the end of each calendar year."`,
  },
  {
    id: 'cit-capitol',
    citation: 'Capitol Wireless, Inc. v. Sec. of Labor (G.R. No. 117174)',
    title: 'Retirement Half-Month Salary Formula (22.5 Days)',
    category: 'landmark_cases',
    categoryLabel: 'Landmark Jurisprudence',
    summary: 'Interpreted "one-half month salary" under Article 302 of the Labor Code.',
    keyRule: 'One-half month salary consists of: 15 days basic salary + 5 days SIL + 2.5 days (1/12 of 13th month pay) = 22.5 days per year of service.',
    worldId: 'world5',
    topicId: 'm5-vawc-minors-telecommuting',
    topicTitle: '22.5-Day Retirement Pay',
    worldBadge: 'World 5 · Protective Laws',
    verbatimProvision: `CAPITOL WIRELESS, INC. V. CONFESOR (G.R. NO. 117174):
"For purposes of Article 287 [now 302] of the Labor Code, as amended by Republic Act No. 7641, the statutory retirement pay of 'one-half (1/2) month salary' means:
(a) Fifteen (15) days basic salary based on the latest salary rate;
(b) Five (5) days service incentive leave; and
(c) One-twelfth (1/12) of the 13th-month pay (equivalent to 2.5 days).
Thus, one-half month salary is legally equivalent to twenty-two and a half (22.5) days for each year of service."`,
  },
  {
    id: 'cit-asian',
    citation: 'Asian Transmission Corp. v. CA (G.R. No. 152308)',
    title: 'Double Regular Holiday Pay Doctrine (200% Unworked, 300% Worked)',
    category: 'landmark_cases',
    categoryLabel: 'Landmark Jurisprudence',
    summary: 'Addressed compensation when two regular holidays fall on the exact same day (e.g. Araw ng Kagitingan & Good Friday).',
    keyRule: 'Employees are entitled to 200% if unworked (100% per holiday), and 300% if worked (+100% regular holiday premium).',
    worldId: 'world2',
    topicId: 'm2-holiday-pay',
    topicTitle: 'Double Holiday Pay Doctrine',
    worldBadge: 'World 2 · Rest & Holidays',
    verbatimProvision: `ASIAN TRANSMISSION CORPORATION V. COURT OF APPEALS (G.R. NO. 152308):
"Where two regular holidays fall on the same day, covered employees are entitled to receive double holiday compensation:
1. If unworked: Two hundred percent (200%) of their basic daily wage (one hundred percent for each of the two regular holidays);
2. If worked: Three hundred percent (300%) of their basic daily wage (two hundred percent for working the first holiday plus an additional one hundred percent for the second regular holiday);
3. If worked on scheduled rest day: Three hundred ninety percent (390%) of basic wage."`,
  },
  {
    id: 'cit-starpaper',
    citation: 'Star Paper Corp. v. Simbol (G.R. No. 164774)',
    title: 'BFOQ Exception and Anti-Marriage Policies',
    category: 'landmark_cases',
    categoryLabel: 'Landmark Jurisprudence',
    summary: 'Invalidated blanket company policies compelling resignation upon marriage of coworkers.',
    keyRule: 'A blanket no-spouse policy violates Article 133 unless the employer proves a Bona Fide Occupational Qualification (BFOQ) and Reasonable Business Necessity.',
    worldId: 'world4',
    topicId: 'm4-women-workers',
    topicTitle: 'Anti-Marriage Policy Ban (BFOQ)',
    worldBadge: 'World 4 · Special Groups',
    verbatimProvision: `STAR PAPER CORPORATION V. SIMBOL (G.R. NO. 164774):
"A company policy prohibiting employees from marrying each other and requiring the resignation of one spouse upon marriage violates Article 136 [now 133] of the Labor Code, unless the employer proves that the restriction is a Bona Fide Occupational Qualification (BFOQ).

To justify a BFOQ, the employer must prove two factors: (1) that the employment qualification is reasonably related to the essential operation of the job involved; and (2) that there is a factual basis for believing that all or substantially all persons within the excluded class would be unable to perform the duties of the job safely and efficiently."`,
  },
];

interface CitationsViewProps {
  onSelectTopic: (worldId: string, topicId: string) => void;
  onOpenPrintGuide?: () => void;
}

export const CitationsView: React.FC<CitationsViewProps> = ({
  onSelectTopic,
  onOpenPrintGuide,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CitationCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedVerbatimIds, setExpandedVerbatimIds] = useState<string[]>([]);

  const categories: { id: CitationCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Provisions', icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'articles', label: 'Labor Code Arts.', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'republic_acts', label: 'Republic Acts', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'presidential_decrees', label: 'Pres. Decrees & EOs', icon: <Gavel className="w-3.5 h-3.5" /> },
    { id: 'dept_orders', label: 'DOLE Orders & CWW', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'landmark_cases', label: 'Landmark SC Cases', icon: <Award className="w-3.5 h-3.5" /> },
  ];

  const filteredCitations = useMemo(() => {
    return MASTER_LEGAL_CITATIONS.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.citation.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.keyRule.toLowerCase().includes(q) ||
        item.verbatimProvision.toLowerCase().includes(q) ||
        item.topicTitle.toLowerCase().includes(q) ||
        item.worldBadge.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  const toggleVerbatim = (id: string) => {
    setExpandedVerbatimIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    marioAudio.playClick();
  };

  const handleCopyCitation = (item: LegalCitationItem, fullVerbatim = false) => {
    const textToCopy = fullVerbatim
      ? `${item.citation} — ${item.title}\n\n[Exact Verbatim Provision]:\n${item.verbatimProvision}`
      : `${item.citation} — ${item.title}: ${item.keyRule}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedId(fullVerbatim ? `${item.id}-verbatim` : item.id);
    marioAudio.playCoin();
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div data-testid="citations-view-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border-4 border-slate-950 rounded-3xl p-5 sm:p-7 text-white shadow-[6px_6px_0_#000] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center font-black shadow-[0_2px_0_#000] shrink-0">
              <Scale className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase text-amber-400 font-mario tracking-wider">
                  STATUTORY CITATIONS REPERTORY
                </span>
                <span className="text-slate-400 text-xs font-bold">
                  · {MASTER_LEGAL_CITATIONS.length} Codified Provisions with Exact Verbatim Texts
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-display">
                Philippine Labor Standards Verbatim Provisions Index
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPrintGuide && (
              <button
                type="button"
                onClick={onOpenPrintGuide}
                className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs border border-black shadow-[0_2px_0_#000] cursor-pointer inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Export / Print</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="pt-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Article (e.g. Art. 83), Republic Act (e.g. RA 11210), case name, or verbatim keyword..."
              aria-label="Search Legal Citations"
              className="w-full min-h-[46px] bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-xl pl-10 pr-10 text-xs sm:text-sm text-white placeholder:text-slate-400 font-bold focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    marioAudio.playClick();
                  }}
                  className={`min-h-[40px] px-3.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-black border-2 border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Citations List Grid */}
      <div className="space-y-4">
        {filteredCitations.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border-2 border-slate-800 rounded-2xl text-slate-400 space-y-2">
            <Scale className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="font-bold text-sm">No legal citations found matching your criteria.</p>
            <p className="text-xs">Try searching for &quot;Art. 83&quot;, &quot;RA 11210&quot;, &quot;Kasambahay&quot;, or &quot;Four-fold&quot;.</p>
          </div>
        ) : (
          filteredCitations.map((item) => {
            const isExpanded = expandedVerbatimIds.includes(item.id);
            return (
              <div
                key={item.id}
                data-testid={`citation-card-${item.id}`}
                className="bg-slate-900/95 border-2 border-slate-800 hover:border-amber-400/80 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-[3px_3px_0_#000] transition-colors text-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 font-mono font-black text-xs border border-black shadow-[0_1px_0_#000]">
                      {item.citation}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                      {item.categoryLabel}
                    </span>
                    <span className="text-xs font-bold text-amber-300 shrink-0">
                      · {item.worldBadge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleCopyCitation(item, false)}
                      title="Copy legal rule to clipboard"
                      className="min-h-[36px] px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied Rule!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Rule</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleVerbatim(item.id)}
                      className="min-h-[36px] px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-600 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Hide Verbatim' : 'View Verbatim'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        marioAudio.playPipe();
                        onSelectTopic(item.worldId, item.topicId);
                      }}
                      className="min-h-[36px] px-3.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black border border-black shadow-[0_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer transition-transform active:translate-y-0.5 whitespace-nowrap"
                    >
                      <span>Study Module</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-white font-display">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Key Legal Rule Callout */}
                <div className="bg-slate-950/90 rounded-xl p-3 sm:p-4 border-l-4 border-amber-400 space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                    STATUTORY PRINCIPLE &amp; BAR RULE:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-100 font-semibold leading-relaxed">
                    {item.keyRule}
                  </p>
                </div>

                {/* Exact Verbatim Provision Drawer */}
                {isExpanded && (
                  <div
                    data-testid={`verbatim-box-${item.id}`}
                    className="mt-3 p-4 rounded-xl bg-slate-950 border-2 border-emerald-400/80 text-slate-100 space-y-3 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 font-mono">
                          EXACT VERBATIM STATUTORY PROVISION ({item.citation})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCitation(item, true)}
                        className="min-h-[32px] px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-slate-600 inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === `${item.id}-verbatim` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied Verbatim!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Verbatim Text</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="font-mono text-xs sm:text-[13px] leading-relaxed text-slate-200 whitespace-pre-wrap break-words bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 select-text">
                      {item.verbatimProvision}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

interface LegalCitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (worldId: string, topicId: string) => void;
}

export const LegalCitationsModal: React.FC<LegalCitationsModalProps> = ({
  isOpen,
  onClose,
  onSelectTopic,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-citations-title"
      data-testid="legal-citations-modal"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div className="bg-[#1e293b] border-4 border-amber-400 rounded-3xl max-w-4xl w-full text-white shadow-[8px_8px_0_#000] flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b-2 border-slate-700 bg-slate-900 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center font-black shadow-[0_2px_0_#000] shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2
                id="legal-citations-title"
                className="text-lg sm:text-xl md:text-2xl font-black text-white font-display"
              >
                Philippine Labor Standards Legal Citations Index
              </h2>
              <span className="text-slate-400 text-xs font-bold">
                Complete Verbatim Repertory
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              marioAudio.playClick();
              onClose();
            }}
            aria-label="Close Legal Citations Modal"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <CitationsView
            onSelectTopic={(worldId, topicId) => {
              onClose();
              onSelectTopic(worldId, topicId);
            }}
          />
        </div>
      </div>
    </div>
  );
};
