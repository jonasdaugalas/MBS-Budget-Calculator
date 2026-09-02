import React from 'react';
import { 
  FileSpreadsheet, 
  TrendingUp,
  TrendingDown,
  Coins
} from 'lucide-react';
import { ClubBudgetState, YearlyBudgetSummary } from '../types';
import { formatCurrency, formatMembersCount, formatNumber } from '../utils/budgetCalculator';
import { CommentPopover } from './CommentPopover';

interface BudgetTableProps {
  state: ClubBudgetState;
  summary: YearlyBudgetSummary;
}

export const BudgetTable: React.FC<BudgetTableProps> = ({
  state,
  summary,
}) => {
  const { tmFeeDetails, roomEconomics, expenseEconomics, breakEven } = summary;

  return (
    <div id="budget-spreadsheet-view" className="bg-white rounded-lg sm:rounded-xl border border-neutral-300 shadow-3xs overflow-hidden">
      {/* Unified Section Header */}
      <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 border-b border-neutral-200 bg-neutral-50/90 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
          </div>
          <h2 className="text-xs sm:text-sm font-black text-neutral-950 uppercase tracking-wider font-display leading-none truncate">
            Annual Budget Summary
          </h2>
        </div>

        <div className="flex items-center gap-1.5 font-mono-numbers shrink-0">
          <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider hidden sm:inline whitespace-nowrap">
            Net Result:
          </span>
          <span className={`text-xs sm:text-sm font-black px-2 py-0.5 rounded border whitespace-nowrap shrink-0 ${
            summary.netProfitLoss >= 0 
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
              : 'text-rose-700 bg-rose-50 border-rose-200'
          }`}>
            {summary.netProfitLoss >= 0 ? '+' : ''}{formatCurrency(summary.netProfitLoss, state.currency)}
          </span>
        </div>
      </div>

      {/* Flat Summary Table */}
      <div className="overflow-x-auto -mx-0">
        <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[620px] font-mono-numbers">
          <thead>
            <tr className="bg-neutral-900 text-white font-black uppercase tracking-wider border-b-2 border-neutral-950">
              <th className="p-2.5 sm:p-3 pl-3 font-display">Line Item / Category</th>
              <th className="p-2.5 sm:p-3 font-display text-right whitespace-nowrap">Basis & Multiplier</th>
              <th className="p-2.5 sm:p-3 font-display text-right bg-neutral-950 text-emerald-400 w-36 sm:w-48 font-black whitespace-nowrap">Annual Total</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-200">
            {/* ================= INCOME CATEGORY ================= */}
            <tr className="bg-emerald-50/70 font-bold border-t border-b border-emerald-200">
              <td className="p-2 sm:p-2.5 pl-3 font-black text-emerald-950 uppercase tracking-wider text-xs sm:text-sm font-display flex items-center gap-1.5" colSpan={3}>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                Income
              </td>
            </tr>

            {/* Membership Club Fee Row */}
            <tr className="hover:bg-neutral-50 transition">
              <td className="p-2.5 sm:p-3 pl-5 font-bold text-neutral-950 font-display">
                <div className="flex items-center gap-1.5">
                  <span>Club Membership Fees</span>
                  <CommentPopover
                    id="btn-comment-summary-club-fees"
                    itemName="Club Membership Fees"
                    comment={`Gross club fee of ${formatCurrency(state.monthlyClubFeeEUR, state.currency)}/month collected across ${formatMembersCount(state.defaultFullMembers)} active members.`}
                    mode="readonly"
                  />
                </div>
              </td>
              <td className="p-2.5 sm:p-3 text-right text-neutral-600 font-medium text-xs sm:text-sm whitespace-nowrap">
                {formatMembersCount(state.defaultFullMembers)} members × {formatCurrency(state.monthlyClubFeeEUR, state.currency)}/mo × 12m
              </td>
              <td className="p-2.5 sm:p-3 text-right font-black text-neutral-950 bg-neutral-50/50 whitespace-nowrap">
                {formatCurrency(summary.totalIncome, state.currency)}
              </td>
            </tr>

            {/* Total Income row */}
            <tr className="bg-emerald-100/40 font-black text-emerald-950 border-t-2 border-emerald-300">
              <td className="p-2.5 sm:p-3 pl-5 uppercase tracking-wide font-display text-xs sm:text-sm">Total Income</td>
              <td className="p-2.5 sm:p-3"></td>
              <td className="p-2.5 sm:p-3 text-right bg-emerald-100/80 font-black text-xs sm:text-base whitespace-nowrap">
                {formatCurrency(summary.totalIncome, state.currency)}
              </td>
            </tr>

            {/* ================= EXPENSES CATEGORY ================= */}
            <tr className="bg-rose-50/70 font-bold border-t border-b border-rose-200">
              <td className="p-2 sm:p-2.5 pl-3 font-black text-rose-950 uppercase tracking-wider text-xs sm:text-sm font-display flex items-center gap-1.5" colSpan={3}>
                <TrendingDown className="w-3.5 h-3.5 text-rose-700" />
                Expenses
              </td>
            </tr>

            {/* 1. TM Fees Row */}
            <tr className="hover:bg-neutral-50 transition border-b border-neutral-100">
              <td className="p-2.5 sm:p-3 pl-5 font-bold text-neutral-950 font-display">
                <div className="flex items-center gap-1.5">
                  <span>Toastmasters International Dues</span>
                  <CommentPopover
                    id="btn-comment-summary-tm"
                    itemName="Toastmasters International Dues"
                    comment={`Pass-through TM HQ dues (${formatCurrency(state.monthlyTmDuesUSD, '$')} converted at ${formatNumber(state.usdToEurRate, 4)} EUR/USD rate + ${formatNumber(state.vatRatePercent, 0)}% VAT = ${formatCurrency(tmFeeDetails.totalTmFeePerMemberEUR, state.currency)}/member/month)`}
                    mode="readonly"
                  />
                </div>
              </td>
              <td className="p-2.5 sm:p-3 text-right text-neutral-600 font-medium text-xs sm:text-sm whitespace-nowrap">
                {formatMembersCount(state.defaultFullMembers)} members × {formatCurrency(tmFeeDetails.totalTmFeePerMemberEUR, state.currency)}/mo × 12m
              </td>
              <td className="p-2.5 sm:p-3 text-right font-black text-neutral-950 bg-neutral-50/50 whitespace-nowrap">
                {formatCurrency(summary.totalTmDuesExpense, state.currency)}
              </td>
            </tr>

            {/* 2. Room Rent Tiers (Nested) */}
            <tr className="bg-neutral-50/40 font-bold">
              <td className="p-2 pl-5 font-black text-neutral-800 uppercase tracking-wider text-[11px] font-display" colSpan={3}>
                Venue & Room Leases
              </td>
            </tr>
            {roomEconomics.tierSummaries.map((tier, idx) => (
              <tr key={tier.id} className="hover:bg-neutral-50/70 transition bg-neutral-50/20">
                <td className="p-1.5 sm:p-2 pl-8 text-neutral-700 font-medium font-display text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <span>↳ Tier #{idx + 1}: {tier.name}</span>
                    {Boolean(tier.comment || tier.description) && (
                      <CommentPopover
                        id={`btn-comment-summary-tier-${tier.id}`}
                        itemName={tier.name}
                        comment={tier.comment || tier.description || ''}
                        mode="readonly"
                      />
                    )}
                  </div>
                </td>
                <td className="p-1.5 sm:p-2 text-right text-neutral-500 font-medium text-xs sm:text-sm whitespace-nowrap">
                  {tier.monthsCount}m × {formatCurrency(tier.pricePerMonth, state.currency)}/mo
                </td>
                <td className="p-1.5 sm:p-2 text-right font-semibold text-neutral-900 pr-3 whitespace-nowrap">
                  {formatCurrency(tier.annualCost, state.currency)}
                </td>
              </tr>
            ))}
            {/* Venue total summary row */}
            <tr className="bg-neutral-100/60 font-extrabold border-b border-neutral-200">
              <td className="p-2 pl-7 text-neutral-950 uppercase tracking-wide text-[11px] font-display">Total Venue Rent</td>
              <td className="p-2"></td>
              <td className="p-2 text-right font-black text-neutral-950 bg-neutral-100/30 whitespace-nowrap">
                {formatCurrency(summary.totalRoomRentExpense, state.currency)}
              </td>
            </tr>

            {/* 3. Monthly Recurring Custom Expenses (Nested) */}
            <tr className="bg-neutral-50/40 font-bold">
              <td className="p-2 pl-5 font-black text-neutral-800 uppercase tracking-wider text-[11px] font-display" colSpan={3}>
                Recurring Custom Expenses
              </td>
            </tr>
            {expenseEconomics.recurringExpenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-neutral-50/70 transition bg-neutral-50/20">
                <td className="p-1.5 sm:p-2 pl-8 text-neutral-700 font-medium font-display text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <span>↳ {exp.name}</span>
                    {Boolean(exp.comment || exp.description) && (
                      <CommentPopover
                        id={`btn-comment-summary-exp-${exp.id}`}
                        itemName={exp.name}
                        comment={exp.comment || exp.description || ''}
                        mode="readonly"
                      />
                    )}
                  </div>
                </td>
                <td className="p-1.5 sm:p-2 text-right text-neutral-500 font-medium text-xs sm:text-sm whitespace-nowrap">
                  12m × {formatCurrency(exp.amount, state.currency)}/mo
                </td>
                <td className="p-1.5 sm:p-2 text-right font-semibold text-neutral-900 pr-3 whitespace-nowrap">
                  {formatCurrency(exp.annualCost, state.currency)}
                </td>
              </tr>
            ))}
            {/* Recurring total summary row */}
            <tr className="bg-neutral-100/60 font-extrabold border-b border-neutral-200">
              <td className="p-2 pl-7 text-neutral-950 uppercase tracking-wide text-[11px] font-display">Total Recurring</td>
              <td className="p-2"></td>
              <td className="p-2 text-right font-black text-neutral-950 bg-neutral-100/30 whitespace-nowrap">
                {formatCurrency(expenseEconomics.totalAnnualRecurring, state.currency)}
              </td>
            </tr>

            {/* 4. One-Time Custom Expenses (Nested) */}
            <tr className="bg-neutral-50/40 font-bold">
              <td className="p-2 pl-5 font-black text-neutral-800 uppercase tracking-wider text-[11px] font-display" colSpan={3}>
                One-Time / Event Spending
              </td>
            </tr>
            {expenseEconomics.oneTimeExpenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-neutral-50/70 transition bg-neutral-50/20">
                <td className="p-1.5 sm:p-2 pl-8 text-neutral-700 font-medium font-display text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <span>↳ {exp.name}</span>
                    {Boolean(exp.comment || exp.description) && (
                      <CommentPopover
                        id={`btn-comment-summary-exp-${exp.id}`}
                        itemName={exp.name}
                        comment={exp.comment || exp.description || ''}
                        mode="readonly"
                      />
                    )}
                  </div>
                </td>
                <td className="p-1.5 sm:p-2 text-right text-neutral-500 font-medium text-xs sm:text-sm whitespace-nowrap">
                  Single Event
                </td>
                <td className="p-1.5 sm:p-2 text-right font-semibold text-neutral-900 pr-3 whitespace-nowrap">
                  {formatCurrency(exp.annualCost, state.currency)}
                </td>
              </tr>
            ))}
            {/* One-time total summary row */}
            <tr className="bg-neutral-100/60 font-extrabold border-b border-neutral-200">
              <td className="p-2 pl-7 text-neutral-950 uppercase tracking-wide text-[11px] font-display">Total One-Time</td>
              <td className="p-2"></td>
              <td className="p-2 text-right font-black text-neutral-950 bg-neutral-100/30 whitespace-nowrap">
                {formatCurrency(expenseEconomics.totalAnnualOneTime, state.currency)}
              </td>
            </tr>

            {/* Total Expenses Row */}
            <tr className="bg-rose-100/40 font-black text-rose-950 border-t-2 border-rose-300">
              <td className="p-2.5 sm:p-3 pl-5 uppercase tracking-wide font-display text-xs sm:text-sm">Total Expenses</td>
              <td className="p-2.5 sm:p-3"></td>
              <td className="p-2.5 sm:p-3 text-right bg-rose-100/80 font-black text-xs sm:text-base whitespace-nowrap">
                {formatCurrency(summary.totalExpenses, state.currency)}
              </td>
            </tr>

            {/* ================= ANNUAL SURPLUS/DEFICIT ================= */}
            <tr className="bg-neutral-900 text-white font-black border-t-4 border-neutral-950 text-xs sm:text-sm">
              <td className="p-3 sm:p-4 uppercase tracking-wider font-display flex items-center gap-1.5">
                Annual Net Surplus / Loss
              </td>
              <td className="p-3 sm:p-4"></td>
              <td className={`p-3 sm:p-4 text-right text-sm sm:text-base font-black whitespace-nowrap ${
                summary.netProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                <div>{formatCurrency(summary.netProfitLoss, state.currency)}</div>
                <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 mt-0.5 sm:mt-1 whitespace-nowrap">
                  ({formatCurrency(summary.averageMonthlyProfitLoss, state.currency)} / mo avg)
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Break Even Info Section */}
      <div className="p-3.5 sm:p-4 bg-neutral-100/80 border-t-2 border-neutral-300 text-xs sm:text-sm text-neutral-800 space-y-2">
        <div className="flex items-center gap-2 font-black uppercase tracking-wider text-xs sm:text-sm text-neutral-950 font-display">
          <Coins className="w-4 h-4 text-neutral-950 shrink-0" />
          <span>Annual Break-Even Point</span>
        </div>

        <div className="space-y-1.5 pl-6 font-mono-numbers text-xs sm:text-sm text-neutral-700">
          {/* Row 1: Fee to Members */}
          <div className="flex flex-wrap items-baseline gap-1.5">
            {breakEven?.isBreakEvenAchievable && breakEven.breakEvenFullMembersNeeded !== null ? (
              <span>
                At current fee of <strong className="text-neutral-950">{formatCurrency(state.monthlyClubFeeEUR, state.currency)}/mo</strong>:{' '}
                <strong className="text-neutral-950 underline decoration-2">
                  {formatNumber(breakEven.breakEvenFullMembersNeeded, 2)} members
                </strong>{' '}
                required to break even.
              </span>
            ) : (
              <span className="text-rose-700 font-bold">
                At {formatCurrency(state.monthlyClubFeeEUR, state.currency)}/mo, break-even is not achievable (club fee does not exceed pass-through dues).
              </span>
            )}
          </div>

          {/* Row 2: Members to Fee */}
          <div className="flex flex-wrap items-baseline gap-1.5">
            {state.defaultFullMembers > 0 && breakEven?.breakEvenClubFeeNeeded !== null && breakEven?.breakEvenClubFeeNeeded !== undefined ? (
              <span>
                With <strong className="text-neutral-950">{formatMembersCount(state.defaultFullMembers)} members</strong>:{' '}
                <strong className="text-neutral-950 underline decoration-2">
                  {formatCurrency(breakEven.breakEvenClubFeeNeeded, state.currency)}/mo
                </strong>{' '}
                per member required to break even.
              </span>
            ) : (
              <span className="text-neutral-500 italic">
                Requires at least 1 member to compute target fee.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
