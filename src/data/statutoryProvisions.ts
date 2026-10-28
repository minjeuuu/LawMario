import { TopicDifficulty } from '../types/laborLaw';

export const TOPIC_DIFFICULTY_MAP: Record<string, TopicDifficulty> = {
  // World 1: Hours of Work
  'm1-coverage': 'Bar Master',
  'm1-hours-worked': 'Intermediate',
  'm1-fwa-cww-meals-ot': 'Intermediate',

  // World 2: Rest & Holidays
  'm2-rest-days': 'Intermediate',
  'm2-weekly-rest': 'Foundation',
  'm2-holiday-pay': 'Bar Master',
  'm2-service-charge': 'Foundation',
  'm2-13th-month': 'Foundation',

  // World 3: Wages & D.O. 174
  'm3-wage-principles': 'Bar Master',
  'm3-payment-contracting-distortion': 'Bar Master',

  // World 4: Special Groups
  'm4-women-workers': 'Intermediate',
  'm4-minors-kasambahay-homework': 'Intermediate',

  // World 5: Protective Laws
  'm5-women-special-laws': 'Intermediate',
  'm5-harassment-safe-spaces': 'Intermediate',
  'm5-vawc-minors-telecommuting': 'Intermediate',
  'm5-special-protective-laws': 'Intermediate',

  // World 6: Statutory Leaves
  'm6-service-incentive-leave': 'Foundation',
  'm6-maternity-leave': 'Bar Master',
  'm6-paternity-leave': 'Foundation',
  'm6-solo-parents-leave': 'Intermediate',
  'm6-gynecological-leave': 'Intermediate',
  'm6-vawc-leave': 'Intermediate',
  'm6-statutory-leave-matrix-special': 'Bar Master',
};

export interface VerbatimProvisionItem {
  id: string;
  title: string;
  citation: string;
  category: 'articles' | 'republic_acts' | 'presidential_decrees' | 'dept_orders' | 'landmark_cases';
  categoryLabel: string;
  worldId: string;
  topicId: string;
  topicTitle: string;
  worldBadge: string;
  summary: string;
  keyRule: string;
  verbatim: string;
}

export const STATUTORY_VERBATIM_PROVISIONS: Record<string, { title: string; citation: string; verbatim: string }> = {
  'm1-coverage': {
    title: 'Coverage and Exclusions of Title I (Working Conditions and Rest Periods)',
    citation: 'Article 82, Presidential Decree No. 442 (Labor Code of the Philippines)',
    verbatim: `ART. 82. Coverage. — The provisions of this Title shall apply to employees in all establishments and undertakings whether for profit or not, but not to government employees, managerial employees, field personnel, members of the family of the employer who are dependent on him for support, domestic helpers, persons in the personal service of another, and workers who are paid by results as determined by the Secretary of Labor in appropriate regulations.

As used herein, "managerial employees" refer to those whose primary duty consists of the management of the establishment in which they are employed or of a department or subdivision thereof, and to other officers or members of the managerial staff.

"Field personnel" shall refer to non-agricultural employees who regularly perform their duties away from the principal place of business or branch office of the employer and whose actual hours of work in the field cannot be determined with reasonable certainty.`,
  },
  'm1-hours-worked': {
    title: 'Compensable Hours Worked & Principles of Working Time',
    citation: 'Article 84, Labor Code of the Philippines & Omnibus Rules Book III, Rule I',
    verbatim: `ART. 84. Hours worked. — Hours worked shall include:
(a) All time during which an employee is required to be on duty or to be at a prescribed workplace; and
(b) All time during which an employee is suffered or permitted to work.

Rest periods of short duration during working hours shall be counted as hours worked.

[Implementing Rules Book III, Rule I, Sec. 4]:
(a) All hours which the employee is required to give to his employer, regardless of whether or not such hours are spent in productive labor or involve physical or mental exertion;
(b) An employee need not leave the premises of the work place in order that his rest period may not be counted, it being sufficient that he stops working, may rest completely and may leave his work place, to go elsewhere, whether within or outside the premises of his work place;
(c) If the work interruption is caused by an unscheduled brownout or power failure not exceeding twenty (20) minutes, the same shall be treated as hours worked whether the employees perform work or not.`,
  },
  'm1-fwa-cww-meals-ot': {
    title: 'Normal Hours of Work, Meal Periods, Overtime & Undertime Prohibition',
    citation: 'Articles 83, 85, 87 & 88, Labor Code of the Philippines',
    verbatim: `ART. 83. Normal hours of work. — The normal hours of work of any employee shall not exceed eight (8) hours a day. Health personnel in cities and municipalities with a population of at least one million (1,000,000) or in hospitals and clinics with a bed capacity of at least one hundred (100) shall hold regular office hours for eight (8) hours a day, for five (5) days a week, or a total of forty (40) hours a week, exclusive of time for meals, except where the exigencies of the service require that such personnel work for six (6) days or forty-eight (48) hours, in which case, they shall be entitled to an additional compensation of at least thirty percent (30%) of their regular wage for work on the sixth day.

ART. 85. Meal periods. — Subject to such regulations as the Secretary of Labor may prescribe, it shall be the duty of every employer to give his employees not less than sixty (60) minutes time-off for their regular meals.

ART. 86. Night shift differential. — Every employee shall be paid a night shift differential of not less than ten percent (10%) of his regular wage for each hour of work performed between ten o'clock in the evening and six o'clock in the morning.

ART. 87. Overtime work. — Work may be performed beyond eight (8) hours a day provided that the employee is paid for the overtime work, an additional compensation equivalent to his regular wage plus at least twenty-five percent (25%) thereof. Work performed beyond eight hours on a holiday or rest day shall be paid an additional compensation equivalent to the rate of the first eight hours on a holiday or rest day plus at least thirty percent (30%) thereof.

ART. 88. Undertime not offset by overtime. — Undertime work on any particular day shall not be offset by overtime work on any other day. Permission given to the employee to go on leave on some other day of the week shall not exempt the employer from paying the additional compensation required under this Chapter.`,
  },
  'm2-rest-days': {
    title: 'Weekly Rest Periods and Compensation for Rest Day Work',
    citation: 'Articles 91, 92 & 93, Labor Code of the Philippines',
    verbatim: `ART. 91. Right to weekly rest day. — (a) It shall be the duty of every employer, whether operating for profit or not, to provide each of his employees a rest period of not less than twenty-four (24) consecutive hours after every six (6) consecutive normal work days.
(b) The employer shall determine and schedule the weekly rest day of his employees subject to collective bargaining agreement and to such rules and regulations as the Secretary of Labor and Employment may provide. However, the employer shall respect the preference of employees as to their weekly rest day when such preference is based on religious grounds.

ART. 92. When employer may require work on a rest day. — The employer may require his employees to work on any day:
(a) In case of actual or impending emergencies caused by serious accident, fire, flood, typhoon, earthquake, epidemic or other disaster or calamity;
(b) In cases of urgent work to be performed on the machinery, equipment, or installation;
(c) In the event of abnormal pressure of work due to special circumstances;
(d) In order to prevent serious loss of perishable goods;
(e) Where the nature of the work requires continuous operations.

ART. 93. Compensation for rest day, Sunday or holiday work. — (a) Where an employee is made or permitted to work on his scheduled rest day, he shall be paid an additional compensation of at least thirty percent (30%) of his regular wage. An employee shall be entitled to such additional compensation for work performed on Sunday only when it is his established rest day.
(b) When the nature of the work of the employee is such that he has no normal workdays and no certain weekly rest days can be scheduled, he shall be paid an additional compensation of at least thirty percent (30%) of his regular wage for work performed on Sundays and holidays.
(c) Work performed on any special holiday shall be paid an additional compensation of at least thirty percent (30%) of the regular wage of the employee. Where such holiday work falls on the employee's scheduled rest day, he shall be entitled to an additional compensation of at least fifty per cent (50%) of his regular wage.`,
  },
  'm2-holiday-pay': {
    title: 'Right to Holiday Pay & Regular vs Special Non-Working Days',
    citation: 'Article 94, Labor Code of the Philippines & Executive Order No. 292',
    verbatim: `ART. 94. Right to holiday pay. — (a) Every worker shall be paid his regular daily wage during regular holidays, except in retail and service establishments regularly employing less than ten (10) workers;
(b) The employer may require an employee to work on any holiday but such employee shall be paid a compensation equivalent to twice his regular rate; and
(c) As used in this Article, "holiday" includes: New Year's Day, Maundy Thursday, Good Friday, the ninth of April, the first of May, the twelfth of June, the fourth of July, the thirtieth of November, the twenty-fifth and thirtieth of December, and the day designated by law for holding a general election.

[Rule IV, Book III, Sec. 6 - Absence Preceding Holiday]:
(a) All covered employees shall be entitled to the benefit provided herein when they are on leave of absence with pay. Employees who are on leave of absence without pay on the day immediately preceding a regular holiday may not be paid the required holiday pay if they have not worked on such regular holiday.
(b) Where there are two (2) successive regular holidays, like Holy Thursday and Good Friday, an employee may not be paid for both holidays if he absents himself from work without pay on the day immediately preceding the first holiday, unless he works on the first holiday, in which case he is entitled to his holiday pay on the second holiday.`,
  },
  'm2-service-charge': {
    title: '100% Equal Distribution of Service Charges in Establishments',
    citation: 'Article 96, Labor Code as amended by Republic Act No. 11360',
    verbatim: `ART. 96. Service Charges. — All service charges collected by hotels, restaurants and similar establishments shall be distributed completely and equally among the covered employees, except managerial employees as defined herein.

In the event that the minimum wage is increased by law or wage order, service charges paid to the covered employees shall not be considered in determining the employer's compliance with the minimum wage law.

To facilitate resolution of any dispute between the management and the employees relating to service charges, the grievance machinery established in the collective bargaining agreement shall be utilized. In case no grievance mechanism is established or if the grievance machinery fails to resolve the dispute, the same shall be settled through conciliation or arbitration by the Department of Labor and Employment.`,
  },
  'm2-13th-month': {
    title: 'Mandatory 13th-Month Pay Law',
    citation: 'Presidential Decree No. 851 & Revised Implementing Guidelines',
    verbatim: `SECTION 1. All employers are hereby required to pay all their rank-and-file employees receiving a basic salary, regardless of the nature of their employment, a 13th-month pay not later than December 24 of every year.

[Revised Guidelines on the Implementation of the 13th Month Pay Law]:
1. Covered Employees: All rank-and-file employees are entitled to a 13th month pay regardless of the amount of basic salary, their designation or employment status, and irrespective of the method by which their wages are paid, provided that they have worked for at least one (1) month during a calendar year.
2. Amount of 13th Month Pay: The minimum 13th month pay required by law shall not be less than one-twelfth (1/12) of the total basic salary earned by an employee within a calendar year. Basic salary shall include all remunerations or earnings paid by an employer for services rendered but does not include allowances and monetary benefits which are not considered or integrated as part of the regular or basic salary, such as overtime, night shift differential, and holiday pay.
3. Resigned or Separated Employees: An employee who has resigned or whose services were terminated at any time before the time for payment of the 13th month pay is entitled to this monetary benefit in proportion to the length of time he worked during the year, reckoned from the time he started working during the calendar year up to the time of his resignation or termination from the service.`,
  },
  'm3-wage-principles': {
    title: 'Statutory Definition of Wage, Facilities vs Supplements & Non-Diminution',
    citation: 'Articles 97, 100, 102 & 103, Labor Code of the Philippines',
    verbatim: `ART. 97. Definitions. — (f) "Wage" paid to any employee shall mean the remuneration or earnings, however designated, capable of being expressed in terms of money, whether fixed or ascertained on a time, task, piece, or commission basis, or other method of calculating the same, which is payable by an employer to an employee under a written or unwritten contract of employment for work done or to be done, or for services rendered or to be rendered, and includes the fair and reasonable value, as determined by the Secretary of Labor and Employment, of board, lodging, or other facilities customarily furnished by the employer to the employee.

ART. 100. Prohibition against elimination or diminution of benefits. — Nothing in this Book shall be construed to eliminate or in any way diminish supplements, or other employee benefits being enjoyed at the time of promulgation of this Code.

ART. 102. Forms of payment. — No employer shall pay the wages of an employee by means of promissory notes, vouchers, coupons, tokens, tickets, chits, or any object other than legal tender, even when expressly requested by the employee. Payment of wages by check or money order shall be allowed when such manner of payment is customary on the date of effectivity of this Code, or is necessary because of special circumstances.

[Mabeza v. National Labor Relations Commission (G.R. No. 118506)]:
"Facilities" include articles or services for the benefit of the employee or his family, such as food, housing, electricity, water, and clothing, and are deductible from wages upon voluntary written authorization. In contrast, "supplements" constitute extra remuneration or special privileges given to or received by the laborers over and above their ordinary earnings, granted for the convenience or interest of the employer, and are non-deductible.`,
  },
  'm3-payment-contracting-distortion': {
    title: 'Legitimate Contracting vs Labor-Only Contracting & Wage Deductions',
    citation: 'Articles 106, 113, 124, Labor Code & DOLE Department Order No. 174-17',
    verbatim: `ART. 106. Contractor or subcontractor. — Whenever an employer enters into a contract with another person for the performance of the former's work, the employees of the contractor and of the latter's subcontractor, if any, shall be paid in accordance with the provisions of this Code.

There is "labor-only contracting" where the person supplying workers to an employer does not have substantial capital or investment in the form of tools, equipment, machineries, work premises, among others, and the workers recruited and placed by such person are performing activities which are directly related to the principal business of such employer. In such cases, the person or intermediary shall be considered merely as an agent of the employer who shall be responsible to the workers in the same manner and extent as if the latter were directly employed by him.

[DOLE D.O. 174-17, Sec. 3(l)]:
"Substantial capital" refers to paid-up capital stock/shares of at least Five Million Pesos (P5,000,000.00) in the case of corporations, partnerships and single proprietorships.

ART. 113. Wage deductions. — No employer, in his own behalf or in behalf of any person, shall make any deduction from the wages of his employees, except:
(a) In cases where the worker is insured with his consent by the employer, and the deduction is to recompense the employer for the amount paid by him as premium on the insurance;
(b) For union dues, in cases where the right of the worker or his union to check-off has been recognized by the employer or authorized in writing by the individual worker concerned; and
(c) In cases where the employer is authorized by law or regulations issued by the Secretary of Labor and Employment.

ART. 124. Wage distortion. — Where the application of any prescribed wage increase by a Wage Order results in distortions of the wage structure within an establishment, the employer and the union shall negotiate to correct the distortions. Any dispute thereof shall be resolved through the grievance procedure under their collective bargaining agreement, and if unresolved, through voluntary arbitration.`,
  },
  'm4-women-workers': {
    title: 'Protections for Women Workers, Seats, Facilities & Equal Remuneration',
    citation: 'Articles 130, 131, 133 & 134 (formerly Arts. 132-136), Labor Code',
    verbatim: `ART. 130. Facilities for women. — The Secretary of Labor and Employment shall establish standards that will ensure the safety and health of women employees. In appropriate cases, he may, by regulations, require any employer to:
(a) Provide seats proper for women and permit them to use such seats when they are free from work and during working hours, provided they can perform their duties in this position without detriment to efficiency;
(b) To establish separate toilet rooms and lavatories for men and women and provide at least a dressing room for women;
(c) To post in a conspicuous place a printed notice stating the maximum number of hours of work which women may be permitted to work in each day; and
(d) To establish and maintain a nursery in an establishment for the benefit of women employees.

ART. 133. Stipulation against marriage. — It shall be unlawful for an employer to require as a condition of employment or continuation of employment that a woman employee shall not get married, or to stipulate expressly or tacitly that upon getting married, a woman employee shall be deemed resigned or separated, or to actually dismiss, discharge, discriminate or otherwise prejudice a woman employee merely by reason of her marriage.

ART. 134. Prohibited acts. — It shall be unlawful for any employer:
(1) To deny any woman employee the benefits provided for in this Chapter or to discharge any woman employed by him for the purpose of preventing her from enjoying any of the benefits provided under this Code;
(2) To discharge such woman on account of her pregnancy, or while on leave or in confinement due to her pregnancy;
(3) To discharge or refuse the admission of such woman upon returning to her work for fear that she may again become pregnant.`,
  },
  'm4-minors-kasambahay-homework': {
    title: 'Special Protections for Minors & Magna Carta for Domestic Workers (Kasambahay)',
    citation: 'Articles 137-138 Labor Code, R.A. 7610 / 9231 & Republic Act No. 10361',
    verbatim: `REPUBLIC ACT NO. 10361 (Batas Kasambahay):
SEC. 4. Rights and Privileges. — The domestic worker is entitled to:
(a) Minimum wage; (b) Other mandatory benefits, such as daily and weekly rest periods; (c) Free board, lodging and medical attendance; (d) Right to privacy; (e) Access to outside communication; (f) Access to education and training; (g) Appropriate rest and assistance in case of labor-related disputes; and (h) The right to form, join, or assist in labor organizations.

SEC. 24. Service Incentive Leave. — A domestic worker who has rendered at least one (1) year of service shall be entitled to an annual service incentive leave of five (5) days with pay: Provided, That any unused portion of said annual leave shall not be cumulative or carried over to the succeeding years. Such leave shall not be convertible to cash.

SEC. 30. Social and Other Benefits. — A domestic worker who has rendered at least one (1) month of service shall be covered by the Social Security System (SSS), the Philippine Health Insurance Corporation (PhilHealth), and the Home Development Mutual Fund or Pag-IBIG, and shall be entitled to all the benefits in accordance with the pertinent provisions provided by law. Premium payments or contributions shall be shouldered by the employer. However, if the domestic worker is receiving a wage of Five thousand pesos (P5,000.00) and above per month, the domestic worker shall pay the proportionate share in the premium payments.

[R.A. 9231 - Working Hours of Children]:
Under 15 years: Not more than four (4) hours in any given day and not more than twenty (20) hours a week. No work between 8:00 PM and 6:00 AM.
15 to below 18 years: Not more than eight (8) hours a day and forty (40) hours a week. No work between 10:00 PM and 6:00 AM.`,
  },
  'm5-women-special-laws': {
    title: 'Breastfeeding Act (R.A. 10028), R.A. 7192 & Magna Carta of Women (R.A. 9710)',
    citation: 'Republic Act No. 10028, Republic Act No. 7192 & Republic Act No. 9710',
    verbatim: `REPUBLIC ACT NO. 10028 (Expanded Breastfeeding Promotion Act):
SEC. 6. Lactation Stations. — Mandates all health and non-health facilities, establishments or institutions to establish lactation stations accessible to mothers, equipped with lavatory, refrigeration for breastmilk, electrical outlets for breast pumps, comfortable seats, and small table.
SEC. 7. Lactation Periods. — Nursing employees shall be granted break intervals in addition to regular meal periods to breastfeed or express milk. Counted as compensable hours worked: not less than forty (40) minutes for every eight-hour shift.

REPUBLIC ACT NO. 7192 (Women in Development and Nation Building Act):
SEC. 5. Equality in Capacity to Act. — Women of legal age, regardless of civil status, shall enjoy capacity to enter into contracts which shall in every respect be equal to that of men under similar circumstances.

REPUBLIC ACT NO. 9710 (Magna Carta of Women):
SEC. 14. Women in the Formal Economy. — Ensures women's right to work, non-discrimination in terms, conditions, wages, promotions, and maternity benefits.`,
  },
  'm5-harassment-safe-spaces': {
    title: 'Anti-Sexual Harassment Act & Safe Spaces Act in the Workplace',
    citation: 'Republic Act No. 7877 & Republic Act No. 11313',
    verbatim: `REPUBLIC ACT NO. 7877 (Anti-Sexual Harassment Act of 1995):
SEC. 3. Work, Education or Training-related Sexual Harassment Defined. — Work, education or training-related sexual harassment is committed by an employer, employee, manager, supervisor, agent of the employer, teacher, instructor, professor, coach, trainor, or any other person who, having authority, influence or moral ascendancy over another in a work or training or education environment, demands, requests or otherwise requires any sexual favor from the other, regardless of whether the demand, request or requirement for submission is accepted by the object of said Act.

SEC. 4. Duty of the Employer. — The employer or head of office is mandated to create a Committee on Decorum and Investigation (CODI) and prevent or deter the commission of acts of sexual harassment.

REPUBLIC ACT NO. 11313 (Safe Spaces Act):
SEC. 16. Workplace Sexual Harassment. — The crime of gender-based sexual harassment in the workplace includes the following:
(a) An act or series of acts involving any unwelcome sexual advances, requests or demand for sexual favors or any other act of sexual nature, whether done verbally, physically or through the use of technology such as text messaging or electronic mail, that has or could have a detrimental effect on the employee's employment, job performance, or opportunities;
(b) A conduct of sexual nature and other conduct based on sex which affects the dignity of a person, which is unwelcome, unreasonable, and offensive to the recipient, whether between peers, by a superior to a subordinate, or by a subordinate to a superior;
(c) A conduct that creates an intimidating, hostile or humiliating environment for the recipient.`,
  },
  'm5-vawc-minors-telecommuting': {
    title: 'Anti-VAWC Leave, SPES Protections & Telecommuting Act',
    citation: 'Republic Act No. 9262, Republic Act No. 10917 & Republic Act No. 11165',
    verbatim: `REPUBLIC ACT NO. 11165 (Telecommuting Act):
SEC. 5. Fair Treatment. — The employer shall ensure that telecommuting employees are given the same treatment as that of comparable employees working at the employer's premises. All telecommuting employees shall:
(a) Receive a rate of pay, including overtime and night shift differential, and other similar monetary benefits not lower than those provided in applicable legal enactments;
(b) Have the right to rest periods, regular holidays, and special nonworking days;
(c) Have the same or equivalent workload and performance standards as those of comparable workers at the employer's premises;
(d) Have the same access to training and career development opportunities as those of comparable workers at the employer's premises.

REPUBLIC ACT NO. 10911 (Anti-Age Discrimination in Employment Act):
SEC. 5. Prohibition of Discrimination in Employment on Account of Age. — It shall be unlawful for an employer to:
(a) Print or publish, in any form, any notice of advertisement relating to employment suggesting preferences, limitations, specifications, and discrimination based on age;
(b) Require the declaration of age or birth date during the application process;
(c) Decline any employment application because of an individual's age.`,
  },
  'm6-service-incentive-leave': {
    title: 'Service Incentive Leave (5 Days With Pay)',
    citation: 'Article 95, Labor Code of the Philippines & Auto Bus Transport Doctrine',
    verbatim: `ART. 95. Right to service incentive leave. — (a) Every employee who has rendered at least one year of service shall be entitled to a yearly service incentive leave of five days with pay.
(b) This provision shall not apply to those who are already enjoying the benefit herein provided, those enjoying vacation leave with pay of at least five days and those employed in establishments regularly employing less than ten employees, or in establishments exempted from granting this benefit by the Secretary of Labor and Employment after considering the viability or financial condition of such establishment.
(c) The grant of benefit in excess of that provided herein shall not be made a subject of arbitration or any court of action.

[Auto Bus Transport Systems, Inc. v. Bautista (G.R. No. 156367)]:
The cause of action of an employee for accrued service incentive leave does not accrue at the end of each year when it is not commuted, but rather commences only from the time the employer refuses to pay the same upon demand of the employee, or upon separation from the service. The 3-year prescriptive period under Art. 291 begins to run only from the date of separation or unequivocal refusal of the employer.`,
  },
  'm6-maternity-leave': {
    title: '105-Day Expanded Maternity Leave Law',
    citation: 'Republic Act No. 11210 & SSS/CSC/DOLE Joint Rules',
    verbatim: `REPUBLIC ACT NO. 11210:
SEC. 3. Grant of Maternity Leave. — All covered female workers in government and the private sector, including those in the informal economy, regardless of civil status or the legitimacy of her child, shall be granted one hundred five (105) days maternity leave with full pay and an option to extend for an additional thirty (30) days without pay: Provided, That in case the worker qualifies as a solo parent under Republic Act No. 8972, or the "Solo Parents' Welfare Act of 2000", the worker shall be granted an additional fifteen (15) days maternity leave with full pay.

In cases of miscarriage or emergency termination of pregnancy, maternity leave of sixty (60) days with full pay shall be granted.

SEC. 5. Maternity Leave for Female Workers in the Private Sector. — A female worker in the private sector shall be entitled to maternity leave benefits with full pay, provided she has paid at least three (3) monthly contributions to the Social Security System (SSS) in the twelve-month period immediately preceding the semester of her childbirth or miscarriage.

SEC. 6. Allocation of Maternity Leave Credits. — Any female worker entitled to maternity leave benefits may, at her option, allocate up to seven (7) days of said benefits to the child's father, whether or not the same is married to the female worker: Provided, That in the death, absence, or incapacity of the former, the benefit may be allocated to an alternate caregiver who may be a relative within the fourth degree of consanguinity or the current partner.`,
  },
  'm6-paternity-leave': {
    title: 'Paternity Leave Act of 1996 (7 Calendar Days Full Pay)',
    citation: 'Republic Act No. 8187 & Implementing Rules and Regulations',
    verbatim: `REPUBLIC ACT NO. 8187:
SEC. 2. Paternity Leave. — Notwithstanding any law, rules and regulations to the contrary, every married male employee in the private and public sectors shall be entitled to a paternity leave of seven (7) days with full pay for the first four (4) deliveries of the legitimate spouse with whom he is cohabiting.

The male employee applying for paternity leave shall notify his employer of the pregnancy of his legitimate spouse and the expected date of such delivery.

For purposes of this Act, delivery shall include childbirth or any miscarriage.

[IRR Sec. 3 - Conditions for Entitlement]:
1. He is an employee at the time of delivery;
2. He is cohabiting with his spouse at the time she gives birth or suffers a miscarriage;
3. He has applied for paternity leave with his employer within a reasonable period; and
4. His wife has given birth or suffered a miscarriage.`,
  },
  'm6-solo-parents-leave': {
    title: 'Expanded Solo Parents Welfare Act (7 Working Days Parental Leave)',
    citation: 'Republic Act No. 8972 as amended by Republic Act No. 11861',
    verbatim: `REPUBLIC ACT NO. 11861 (Amending R.A. 8972):
SEC. 8. Parental Leave. — In addition to leave privileges under existing laws, a forfeiture parental leave of not more than seven (7) working days with pay every year shall be granted to any solo parent employee who has rendered service of at least six (6) months, regardless of employment status.

Such leave shall be noncumulative and nonconvertible to cash unless specifically agreed upon in the collective bargaining agreement or employment contract.

SEC. 3. Definition of Terms. — "Dependent" refers to a child or children living with and dependent upon the solo parent for support, unmarried, unemployed, and twenty-two (22) years of age or below, or eighteen (18) years of age or above but incapable of self-support due to mental, physical, or developmental disability.`,
  },
  'm6-gynecological-leave': {
    title: 'Special Leave Benefits for Women (Gynecological Surgery)',
    citation: 'Republic Act No. 9710 (Magna Carta of Women, Section 18)',
    verbatim: `REPUBLIC ACT NO. 9710 (Magna Carta of Women):
SEC. 18. Special Leave Benefits for Women. — A woman employee having rendered continuous aggregate employment service of at least six (6) months for the last twelve (12) months shall be entitled to a special leave benefit of two (2) months with full pay based on her gross monthly compensation following surgery caused by gynecological disorders.

[DOLE Department Order No. 112-11]:
"Gynecological disorders" refer to disorders that would require surgical procedures such as, but not limited to, dilatation and curettage and those involving female reproductive organs such as the vagina, cervix, uterus, fallopian tubes, ovaries, breast, adnexa and pelvic floor, as certified by a competent physician.

The special leave shall be granted to the qualified employee after she has undergone surgery. It is non-cumulative and non-convertible to cash unless otherwise provided by a CBA.`,
  },
  'm6-vawc-leave': {
    title: '10-Day Paid Leave for Victims of Violence Against Women and Children',
    citation: 'Republic Act No. 9262 (Anti-VAWC Act of 2004, Section 43)',
    verbatim: `REPUBLIC ACT NO. 9262:
SEC. 43. Entitled to Leave. — Victims under this Act shall be entitled to take a paid leave of absence up to ten (10) days in addition to other paid leaves under the Labor Code and Civil Service Rules and regulations, extendible when the necessity arises as specified in the protection order.

Any employer who shall prejudice the right of the person under this section shall be penalized in accordance with the provisions of the Labor Code and Civil Service Rules and Regulations. Likewise, an employer who prejudices any person for assisting a co-employee who is a victim under this Act shall be liable for discrimination.

[DOLE Circular No. 01-06]:
The 10-day leave is with full pay, consisting of basic pay and all allowances. It covers the days that the woman employee has to attend to medical, legal, and other related proceedings. The presentation of a certification issued by the Punong Barangay, Kagawad, Prosecutor, or Clerk of Court that an action relative to the matter is pending shall be sufficient basis for the grant of leave.`,
  },
  'm6-statutory-leave-matrix-special': {
    title: 'Master Statutory Leaves Matrix, Adoptive Leaves & Prescription',
    citation: 'Republic Act No. 8552, Article 291 [306], Labor Code & DOLE Manual',
    verbatim: `REPUBLIC ACT NO. 8552 (Domestic Adoption Act of 1998):
SEC. 34. Maternity and Paternity Benefits. — The adoptive parents shall, with respect to the adopted child, enjoy all the benefits to which biological parents are entitled. Maternity and paternity benefits consisting of paid leaves under existing laws shall be given to the adoptive parents from the date the child is placed with them under pre-adoptive placement.

ART. 291 [306]. Money claims. — All money claims arising from employer-employee relations accruing during the effectivity of this Code shall be filed within three (3) years from the time the cause of action accrued; otherwise, they shall be forever barred.

[Comprehensive Prescription Summary]:
1. Service Incentive Leave (SIL): Accrues upon demand or termination, prescribes in 3 years (Auto Bus v. Bautista).
2. Pure Money Claims (Overtime, Holiday, 13th Month, NSD): Prescribe in 3 years from due date.
3. Illegal Dismissal with Reinstatement / Backwages: 4-year prescriptive period under Civil Code injury to rights.
4. Unfair Labor Practice (ULP): 1-year prescriptive period from commission of act.`,
  },
};
