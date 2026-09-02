import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Scale,
  Euro,
  Users
} from 'lucide-react';
import { ClubBudgetState, YearlyBudgetSummary } from '../types';
import { 
  formatCurrency, 
  formatNumber,
  formatMembersCount,
  calculateBreakEvenFeeForMembers, 
  calculateBreakEvenMembersForFee 
} from '../utils/budgetCalculator';

interface MetricCardsProps {
  state: ClubBudgetState;
  summary: YearlyBudgetSummary;
  currency: string;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  state,
  summary,
  currency,
}) => {
  const isProfit = summary.netProfitLoss >= 0;

  // Fixed costs & TM pass-through for exact break-even calculations
  const { tmFeeDetails, roomEconomics, expenseEconomics } = summary;
  const yearlyFixedCosts = roomEconomics.totalAnnualRoomExpense + expenseEconomics.totalAnnualCustomExpenses;
  const tmPassThroughFee = tmFeeDetails.totalTmFeePerMemberEUR;

  // Exact break-even points rounded to 2 decimal digits
  const beFeeAtCurrentMembers = calculateBreakEvenFeeForMembers(
    state.defaultFullMembers, 
    yearlyFixedCosts, 
    tmPassThroughFee
  );
  const beMembersAtCurrentFee = calculateBreakEvenMembersForFee(
    state.monthlyClubFeeEUR, 
    yearlyFixedCosts, 
    tmPassThroughFee
  );

  const formattedMembers = formatMembersCount(state.defaultFullMembers);

  return (
    <div id="metric-cards-container" className="space-y-2 sm:space-y-3">
      {/* Row 1: 3 Financial Metrics */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
        {/* Card 1: Total Income */}
        <div 
          id="card-total-income" 
          className="bg-white rounded-lg sm:rounded-xl border border-neutral-300 p-2 sm:p-3.5 shadow-3xs flex flex-col justify-between transition hover:border-neutral-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider text-neutral-500 truncate">
              Income
            </span>
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
          </div>
          <div className="mt-1 sm:mt-2">
            <div className="text-xs sm:text-lg md:text-xl font-black text-neutral-950 font-mono-numbers tracking-tight truncate">
              {formatCurrency(summary.totalIncome, currency)}
            </div>
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5 truncate">
              Annual
            </div>
          </div>
        </div>

        {/* Card 2: Total Expenses */}
        <div 
          id="card-total-expenses" 
          className="bg-white rounded-lg sm:rounded-xl border border-neutral-300 p-2 sm:p-3.5 shadow-3xs flex flex-col justify-between transition hover:border-neutral-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider text-neutral-500 truncate">
              Expenses
            </span>
            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-rose-600 shrink-0" />
          </div>
          <div className="mt-1 sm:mt-2">
            <div className="text-xs sm:text-lg md:text-xl font-black text-neutral-950 font-mono-numbers tracking-tight truncate">
              {formatCurrency(summary.totalExpenses, currency)}
            </div>
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5 truncate">
              Annual
            </div>
          </div>
        </div>

        {/* Card 3: Annual Net Profit & Loss */}
        <div 
          id="card-annual-pl" 
          className="bg-white rounded-lg sm:rounded-xl border border-neutral-300 p-2 sm:p-3.5 shadow-3xs flex flex-col justify-between transition hover:border-neutral-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider text-neutral-500 truncate">
              Net P / L
            </span>
            <Scale className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-700 shrink-0" />
          </div>
          <div className="mt-1 sm:mt-2">
            <div className={`text-xs sm:text-lg md:text-xl font-black font-mono-numbers tracking-tight truncate ${
              isProfit ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {formatCurrency(summary.netProfitLoss, currency)}
            </div>
            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-0.5 truncate ${
              isProfit ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {isProfit ? 'Surplus' : 'Deficit'}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: 2 Break-Even Metrics */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
        {/* Break-Even Fee Card */}
        <div 
          id="card-breakeven-fee" 
          className="bg-white rounded-lg sm:rounded-xl border border-blue-200 p-2 sm:p-3.5 shadow-3xs flex flex-col justify-between transition hover:border-blue-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider text-blue-900 truncate">
              Break-Even Fee
            </span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-600 border border-blue-800 rounded-[2px] shrink-0"></span>
              <Euro className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
            </div>
          </div>
          <div className="mt-1 sm:mt-2">
            <div className="text-xs sm:text-lg md:text-xl font-black text-neutral-950 font-mono-numbers tracking-tight truncate">
              {formatCurrency(beFeeAtCurrentMembers, currency)} / mo
            </div>
            <div className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-700 mt-0.5 truncate">
              @ {formattedMembers} members
            </div>
          </div>
        </div>

        {/* Break-Even Members Card */}
        <div 
          id="card-breakeven-members" 
          className="bg-white rounded-lg sm:rounded-xl border border-purple-200 p-2 sm:p-3.5 shadow-3xs flex flex-col justify-between transition hover:border-purple-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider text-purple-900 truncate">
              Break-Even Members
            </span>
            <div className="flex items-center gap-1">
              <span className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-purple-600 inline-block shrink-0"></span>
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600 shrink-0" />
            </div>
          </div>
          <div className="mt-1 sm:mt-2">
            <div className="text-xs sm:text-lg md:text-xl font-black text-neutral-950 font-mono-numbers tracking-tight truncate">
              {beMembersAtCurrentFee !== null 
                ? `${formatNumber(beMembersAtCurrentFee, 2)} members` 
                : 'Unattainable'}
            </div>
            <div className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-purple-700 mt-0.5 truncate">
              @ {formatCurrency(state.monthlyClubFeeEUR, currency)}/mo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

