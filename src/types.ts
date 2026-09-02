export interface MonthDef {
  id: string; // e.g. '2026-07'
  name: string; // e.g. 'July'
  shortName: string; // 'Jul'
  year: number; // 2026
  termSemester: 1 | 2; // Semester 1 (Jul-Dec) or 2 (Jan-Jun)
}

export interface RoomTier {
  id: string;
  name: string;
  pricePerMonth: number;
  monthsCount: number; // e.g., 9
  comment?: string;
  description?: string;
}

export interface CustomExpense {
  id: string;
  name: string;
  category: 'recurring' | 'one-time';
  amount: number; // in EUR
  frequency: 'monthly' | 'one-time';
  comment?: string;
  description?: string;
}

export interface ClubBudgetState {
  clubName: string;
  fiscalYear: string;
  currency: string;
  
  // Membership & TM parameters
  monthlyClubFeeEUR: number; // e.g., 20.00 €
  monthlyTmDuesUSD: number; // e.g., 12.00 $
  usdToEurRate: number; // e.g., 0.87
  vatRatePercent: number; // e.g., 19 (%)
  
  defaultFullMembers: number; // e.g., 22
  
  // Room rent configuration
  roomTiers: RoomTier[];
  
  // Expenses
  expenses: CustomExpense[];
}

export interface TmFeeDetails {
  baseDuesUSD: number;
  usdToEurRate: number;
  rawConvertedEUR: number;
  vatRatePercent: number;
  vatAmountEUR: number;
  totalTmFeePerMemberEUR: number;
}

export interface MemberEconomics {
  monthlyClubFeeEUR: number;
  tmFeePerMemberEUR: number;
  netMarginPerMemberEUR: number;
  netMarginPerMemberYearlyEUR: number;
  isDeficitMargin: boolean;
  tmPercentage: number;
  localPercentage: number;
  totalMonthlyIncome: number;
  totalAnnualIncome: number;
}

export interface RoomTierSummary extends RoomTier {
  annualCost: number;
}

export interface RoomEconomics {
  totalAllocatedMonths: number;
  isAllocationComplete: boolean;
  unallocatedMonthsCount: number;
  overallocatedMonthsCount: number;
  totalAnnualRoomExpense: number;
  monthlyAverageRoomExpense: number;
  resolvedRoomPrices: Record<string, number>;
  tierSummaries: RoomTierSummary[];
}

export interface ExpenseEconomics {
  recurringExpenses: (CustomExpense & { annualCost: number })[];
  oneTimeExpenses: (CustomExpense & { annualCost: number })[];
  totalMonthlyRecurring: number;
  totalAnnualRecurring: number;
  totalAnnualOneTime: number;
  totalAnnualCustomExpenses: number;
}

export interface BreakEvenCurvePoint {
  members: number;
  breakEvenFeeEUR: number;
}

export interface BreakEvenSimulationPoint {
  members: number;
  monthlyFeeEUR: number;
  annualRevenue: number;
  annualExpenses: number;
  annualNetProfitLoss: number;
  monthlyNetProfitLoss: number;
  unitMarginEUR: number;
  breakEvenFeeEUR: number;
  breakEvenMembersNeeded: number | null;
  isSurplus: boolean;
}

export interface BreakEvenAnalysis {
  yearlyFixedCosts: number;
  netMarginPerMemberYearly: number;
  isBreakEvenAchievable: boolean;
  breakEvenFullMembersNeeded: number | null;
  breakEvenClubFeeNeeded: number | null;
  currentMembersSurplus: number;
  statusMessage: string;
}

export interface MonthSummary {
  month: MonthDef;
  fullMembers: number;
  totalMembers: number;
  
  // Calculated unit TM dues in EUR
  tmFeePerMemberEUR: number;
  
  // Income
  membershipIncome: number;
  totalIncome: number;
  
  // Expenses
  tmDuesExpense: number;
  roomRentExpense: number;
  itemizedExpenses: Record<string, number>; // expenseId -> amount
  totalExpenses: number;
  
  // Bottom line
  netProfitLoss: number;
  cumulativeCashFlow: number;
}

export interface YearlyBudgetSummary {
  months: MonthSummary[];
  totalIncome: number;
  totalExpenses: number;
  netProfitLoss: number;
  averageMonthlyProfitLoss: number;
  profitMarginPercent: number;
  totalTmDuesExpense: number;
  totalRoomRentExpense: number;
  totalOtherExpenses: number;
  
  // Structured sub-domain calculation models for reuse
  tmFeeDetails: TmFeeDetails;
  memberEconomics: MemberEconomics;
  roomEconomics: RoomEconomics;
  expenseEconomics: ExpenseEconomics;
  breakEven: BreakEvenAnalysis;
  breakEvenAnalysis: BreakEvenAnalysis;
  
  // Backward compatibility convenience fields
  breakEvenFullMembersNeeded: number;
  breakEvenClubFeeNeeded: number;
}
