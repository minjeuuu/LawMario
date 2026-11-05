export interface LegalFormulaSummaryItem {
  id: string;
  title: string;
  citation: string;
  rateBadge: string;
  formula: string;
  note: string;
}

export interface LegalDeadlineSummaryItem {
  id: string;
  claimOrAction: string;
  deadline: string;
  reckoningRule: string;
  citation: string;
}

export interface LeaveCapQuickItem {
  leaveName: string;
  cap: string;
  rule: string;
  citation: string;
}

export const ONE_PAGE_LEGAL_FORMULAS: readonly LegalFormulaSummaryItem[] = [
  {
    id: 'ord_ot',
    title: 'Ordinary Day Overtime',
    citation: 'Art. 87, Labor Code',
    rateBadge: '125%',
    formula: 'Hourly Rate x 1.25 x OT Hours',
    note: 'Work beyond 8 hours on an ordinary working day (+25% OT premium).',
  },
  {
    id: 'nsd',
    title: 'Night Shift Differential (NSD)',
    citation: 'Art. 86, Labor Code',
    rateBadge: '+10%',
    formula: 'Applicable Hourly Rate x 1.10 x NSD Hours',
    note: 'Mandatory for work performed between 10:00 PM and 6:00 AM.',
  },
  {
    id: 'rest_special',
    title: 'Rest Day OR Special Non-Working Day',
    citation: 'Art. 93, Labor Code',
    rateBadge: '130%',
    formula: 'Daily Rate x 1.30 (OT: Hourly x 1.30 x 1.30 = 169%)',
    note: 'No work, no pay on Special Days unless favorable company policy/CBA exists.',
  },
  {
    id: 'special_on_rest',
    title: 'Special Day Falling on Rest Day',
    citation: 'Art. 93(c), Labor Code',
    rateBadge: '150%',
    formula: 'Daily Rate x 1.50 (OT: Hourly x 1.50 x 1.30 = 195%)',
    note: 'First 8 hours paid at 150%; excess hours earn +30% on the 150% rate.',
  },
  {
    id: 'reg_holiday',
    title: 'Regular Holiday Pay',
    citation: 'Art. 94, Labor Code',
    rateBadge: '200%',
    formula: 'Worked: Daily x 2.00 | Unworked: 100% | OT: 260%',
    note: 'Must be present or on paid leave on workday immediately preceding holiday.',
  },
  {
    id: 'reg_holiday_rest',
    title: 'Regular Holiday on Scheduled Rest Day',
    citation: 'Art. 94, Labor Code',
    rateBadge: '260%',
    formula: 'Daily Rate x 2.60 (OT: Hourly x 2.60 x 1.30 = 338%)',
    note: '200% Regular Holiday rate x 1.30 Rest Day premium = 260%.',
  },
  {
    id: 'double_holiday',
    title: 'Double Regular Holiday',
    citation: 'DOLE BWC Handbook',
    rateBadge: '300%',
    formula: 'Worked: 300% | On Rest Day: 390% | Unworked: 200%',
    note: 'OT on Double Regular Holiday = 390%; on Rest Day OT = 507%.',
  },
  {
    id: 'thirteenth_month',
    title: 'Mandatory 13th Month Pay',
    citation: 'P.D. No. 851',
    rateBadge: '1/12 Basic',
    formula: 'Total Basic Salary Earned in Year / 12',
    note: 'Rank-and-file with >= 1 month service; excludes OT, NSD & allowances.',
  },
  {
    id: 'sil_commutation',
    title: 'Service Incentive Leave (SIL) Cash Conversion',
    citation: 'Art. 95, Labor Code',
    rateBadge: '5 Days/Yr',
    formula: 'Unused SIL Days (max 5) x Current Daily Rate',
    note: 'Granted after 1 year of service; commutable to cash at year-end.',
  },
  {
    id: 'service_charges',
    title: 'Service Charges Distribution',
    citation: 'R.A. No. 11360 (Art. 96)',
    rateBadge: '100% Staff',
    formula: 'Total Pool / Covered Employees (Equal Share)',
    note: '100% to rank-and-file & supervisory; managerial employees excluded.',
  },
  {
    id: 'separation_pay',
    title: 'Authorized Cause Separation Pay',
    citation: 'Arts. 298-299, Labor Code',
    rateBadge: '1m or 0.5m',
    formula: '1 Mo/Yr (Redundancy/Labor-Saving) | 0.5 Mo/Yr (Retrench/Closure/Disease)',
    note: 'Whichever is higher vs. 1 month pay; >= 6 mos fraction = 1 whole year.',
  },
  {
    id: 'retirement_pay',
    title: 'Statutory Retirement Pay (22.5-Day Rule)',
    citation: 'Art. 302 (R.A. 7641)',
    rateBadge: '22.5d / Yr',
    formula: 'Daily Rate x 22.5 Days x Years of Service',
    note: '22.5d = 15d basic + 5d SIL + 2.5d (1/12 of 13th mo); age 60-65, >= 5 yrs.',
  },
  {
    id: 'wage_distortion',
    title: 'Wage Distortion Adjustment Formula',
    citation: 'Art. 124 (Pineda Formula)',
    rateBadge: 'Ratio x Inc',
    formula: '(Prev. Min. Wage / Actual Salary) x Mandated Increase',
    note: 'Restores intentional quantitative wage gap severely contracted by Wage Order.',
  },
];

export const ONE_PAGE_LEGAL_DEADLINES: readonly LegalDeadlineSummaryItem[] = [
  {
    id: 'money_claims',
    claimOrAction: 'Pure Money Claims (Unpaid Wages, OT, SIL, 13th Mo.)',
    deadline: '3 Years',
    reckoningRule: 'From time cause of action accrued (SIL: from refusal or separation).',
    citation: 'Art. 306 [291]',
  },
  {
    id: 'illegal_dismissal',
    claimOrAction: 'Illegal Dismissal & Reinstatement (Injury to Rights)',
    deadline: '4 Years',
    reckoningRule: 'Counted from effective date of unlawful termination.',
    citation: 'Civil Code Art. 1146',
  },
  {
    id: 'ulp_claims',
    claimOrAction: 'Unfair Labor Practice (Civil & Criminal Aspects)',
    deadline: '1 Year',
    reckoningRule: 'From accrual of ULP; criminal suspended during administrative case.',
    citation: 'Art. 305 [290]',
  },
  {
    id: 'criminal_offenses',
    claimOrAction: 'Penal / Criminal Offenses under the Labor Code',
    deadline: '3 Years',
    reckoningRule: 'Counted from time of commission of the Labor Code offense.',
    citation: 'Art. 305 [290]',
  },
  {
    id: 'sss_remittance',
    claimOrAction: 'Unremitted SSS Employer Contributions',
    deadline: '20 Years',
    reckoningRule: 'From date of delinquency or assessment (R.A. No. 11199).',
    citation: 'Sec. 22(b), R.A. 11199',
  },
  {
    id: 'twin_notice_nte',
    claimOrAction: 'First Written Notice (Notice to Explain / NTE)',
    deadline: '>= 5 Cal. Days',
    reckoningRule: 'Minimum reasonable opportunity to submit written explanation.',
    citation: 'King of Kings Doctrine',
  },
  {
    id: 'preventive_susp',
    claimOrAction: 'Preventive Suspension Maximum Duration',
    deadline: 'Max 30 Days',
    reckoningRule: 'Only if presence poses serious/imminent threat; pay wages if extended.',
    citation: 'Omnibus Rules Bk. V',
  },
  {
    id: 'authorized_notice',
    claimOrAction: 'Authorized Cause / Disease Dismissal Notice',
    deadline: '>= 30 Days Prior',
    reckoningRule: 'Separate written notices served to BOTH employee AND DOLE Regional Office.',
    citation: 'Art. 298 [283]',
  },
  {
    id: 'floating_status',
    claimOrAction: 'Bona Fide Suspension of Operations / Floating Status',
    deadline: 'Max 6 Months',
    reckoningRule: 'Exceeding 6 months without recall ripens into constructive dismissal.',
    citation: 'Art. 301 [286]',
  },
  {
    id: 'probationary_cap',
    claimOrAction: 'Probationary Employment Period',
    deadline: 'Max 6 Months',
    reckoningRule: '180 calendar days (Mitsubishi Motors); standards made known at hiring.',
    citation: 'Art. 296 [281]',
  },
  {
    id: 'thirteenth_payout',
    claimOrAction: '13th Month Pay Mandatory Payout Deadline',
    deadline: 'On/Before Dec 24',
    reckoningRule: 'May pay 1/2 before school opening and 1/2 on or before Dec. 24.',
    citation: 'P.D. No. 851',
  },
  {
    id: 'wage_interval',
    claimOrAction: 'Regular Wage & Service Charge Payout Interval',
    deadline: '<= 16 Days',
    reckoningRule: 'Paid at least once every 2 weeks or twice a month (Arts. 96 & 103).',
    citation: 'Arts. 96 & 103',
  },
  {
    id: 'nlrc_appeal',
    claimOrAction: 'Appeal from Labor Arbiter Decision to NLRC',
    deadline: '10 Cal. Days',
    reckoningRule: 'Non-extendible from receipt (5 days for Wage Order; 10d Motion for Recon).',
    citation: 'Art. 229 [223]',
  },
  {
    id: 'wage_distortion_time',
    claimOrAction: 'Wage Distortion Grievance / NCMB Conciliation',
    deadline: '10d / 7d Window',
    reckoningRule: 'Organized: 10d grievance -> VA | Unorganized: 7d NCMB -> NLRC (10d).',
    citation: 'Art. 124, Labor Code',
  },
];

export const ONE_PAGE_STATUTORY_LEAVE_CAPS: readonly LeaveCapQuickItem[] = [
  {
    leaveName: 'Expanded Maternity Leave',
    cap: '105d (+15d Solo) / 60d Miscarriage',
    rule: 'Full pay; notify employer >= 30d prior when practicable; up to 7d transferable.',
    citation: 'R.A. 11210',
  },
  {
    leaveName: 'Paternity Leave',
    cap: '7 Calendar Days',
    rule: 'Married male cohabiting with legitimate spouse; first 4 deliveries; non-convertible.',
    citation: 'R.A. 8187',
  },
  {
    leaveName: 'Solo Parent Parental Leave',
    cap: '7 Working Days / Yr',
    rule: 'Valid Solo Parent ID + >= 6 mos service (reduced by R.A. 11861); non-cumulative.',
    citation: 'R.A. 11861',
  },
  {
    leaveName: 'VAWC Victim Leave',
    cap: 'Up to 10 Paid Days',
    rule: 'Extendible per BPO/TPO/PPO; requires Barangay/Prosecutor/Clerk certification.',
    citation: 'R.A. 9262',
  },
  {
    leaveName: 'Special Gynecological Leave',
    cap: 'Up to 2 Months',
    rule: 'Full pay post-gynecological surgery; >= 6 mos continuous aggregate service in 12m.',
    citation: 'R.A. 9710',
  },
  {
    leaveName: 'Kasambahay Annual Leave',
    cap: '5 Paid Days / Yr',
    rule: 'After 1 year of service; non-cumulative and non-convertible to cash (unlike Art. 95 SIL).',
    citation: 'R.A. 10361',
  },
];
