import React from 'react';
import { DollarSign } from 'lucide-react';
import { ClubBudgetState, YearlyBudgetSummary } from '../types';
import { formatCurrency, formatNumber } from '../utils/budgetCalculator';
import { NumericInput } from './NumericInput';

interface MembershipConfigProps {
  state: ClubBudgetState;
  summary: YearlyBudgetSummary;
  onChange: (updates: Partial<ClubBudgetState>) => void;
}

export const MembershipConfig: React.FC<MembershipConfigProps> = ({
  state,
  summary,
  onChange,
}) => {
  const { tmFeeDetails, memberEconomics } = summary;
  const isNegative = memberEconomics.isDeficitMargin;

  return (
    <div id="membership-config-card" className="bg-white rounded-lg sm:rounded-xl border border-neutral-300 shadow-3xs overflow-hidden">
      {/* Unified Section Header */}
      <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 border-b border-neutral-200 bg-neutral-50/90 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
          </div>
          <h2 className="text-xs sm:text-sm font-black text-neutral-950 uppercase tracking-wider font-display leading-none truncate">
            Toastmasters Pass-Through Dues
          </h2>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-3.5 sm:p-5 space-y-4 sm:space-y-5">
        {/* Full-Width Calculations Section */}
        <div className="space-y-3">
          <h3 className="text-xs sm:text-sm font-black text-neutral-900 uppercase tracking-wider font-display">
            Exchange Rate & Tax Parameters
          </h3>
        
        {/* 3 Parameter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
          {/* USD to EUR */}
          <div>
            <label htmlFor="input-usd-eur-rate" className="block text-[10px] sm:text-xs font-black text-neutral-500 uppercase tracking-wider mb-1 truncate whitespace-nowrap" title="USD → EUR Rate">
              USD → EUR Rate
            </label>
            <NumericInput
              id="input-usd-eur-rate"
              value={state.usdToEurRate}
              onValueChange={(val) => onChange({ usdToEurRate: Math.max(0.001, val) })}
              min={0.001}
              step={0.001}
              decimals={3}
              className="w-full bg-neutral-50 border border-neutral-300 hover:border-neutral-900 focus:bg-white focus:border-neutral-900 rounded-lg px-2.5 py-2 text-xs sm:text-sm font-bold text-neutral-950 font-mono-numbers focus:outline-none transition"
            />
          </div>

          {/* VAT Rate % */}
          <div>
            <label htmlFor="input-vat-rate" className="block text-[10px] sm:text-xs font-black text-neutral-500 uppercase tracking-wider mb-1 truncate whitespace-nowrap" title="VAT Rate (%)">
              VAT Rate (%)
            </label>
            <div className="relative">
              <NumericInput
                id="input-vat-rate"
                value={state.vatRatePercent}
                onValueChange={(val) => onChange({ vatRatePercent: Math.max(0, val) })}
                min={0}
                step={1}
                decimals={2}
                className="w-full bg-neutral-50 border border-neutral-300 hover:border-neutral-900 focus:bg-white focus:border-neutral-900 rounded-lg pl-2.5 pr-7 py-2 text-xs sm:text-sm font-bold text-neutral-950 font-mono-numbers focus:outline-none transition"
              />
              <span className="absolute right-2.5 top-2.5 text-[10px] sm:text-xs font-bold text-neutral-400 pointer-events-none">%</span>
            </div>
          </div>

          {/* TM Dues USD */}
          <div>
            <label htmlFor="input-tm-dues-usd" className="block text-[10px] sm:text-xs font-black text-neutral-500 uppercase tracking-wider mb-1 truncate whitespace-nowrap" title="TM Dues ($ / mo)">
              TM Dues ($ / mo)
            </label>
            <div className="relative">
              <NumericInput
                id="input-tm-dues-usd"
                value={state.monthlyTmDuesUSD}
                onValueChange={(val) => onChange({ monthlyTmDuesUSD: Math.max(0, val) })}
                min={0}
                step={0.5}
                decimals={2}
                className="w-full bg-neutral-50 border border-neutral-300 hover:border-neutral-900 focus:bg-white focus:border-neutral-900 rounded-lg pl-2.5 pr-7 py-2 text-xs sm:text-sm font-bold text-neutral-950 font-mono-numbers focus:outline-none transition"
              />
              <span className="absolute right-2.5 top-2.5 text-[10px] sm:text-xs font-bold text-neutral-400 pointer-events-none">$</span>
            </div>
          </div>
        </div>

        {/* Derived TM Cost Breakdown Table */}
        <div className="overflow-hidden border border-neutral-300 rounded-lg bg-white shadow-2xs font-mono-numbers">
          <div className="px-3 py-2 bg-neutral-100/80 border-b border-neutral-200 flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-black uppercase text-neutral-700 tracking-wider font-display truncate">
              Derived TM Dues Breakdown
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-neutral-500 whitespace-nowrap shrink-0">
              Per member / month
            </span>
          </div>

          <div className="divide-y divide-neutral-150 text-xs sm:text-sm">
            <div className="flex items-center justify-between px-3 py-2 hover:bg-neutral-50/50 transition gap-2">
              <span className="text-neutral-700 font-medium truncate">1. Base HQ Dues (USD)</span>
              <span className="font-bold text-neutral-900 whitespace-nowrap shrink-0">{formatCurrency(tmFeeDetails.baseDuesUSD, '$')}</span>
            </div>
            
            <div className="flex items-center justify-between px-3 py-2 hover:bg-neutral-50/50 transition gap-2">
              <span className="text-neutral-700 font-medium truncate">2. Converted in EUR</span>
              <span className="font-bold text-neutral-900 whitespace-nowrap shrink-0">{formatCurrency(tmFeeDetails.rawConvertedEUR, state.currency)}</span>
            </div>

            <div className="flex items-center justify-between px-3 py-2 hover:bg-neutral-50/50 transition gap-2">
              <span className="text-neutral-700 font-medium truncate">3. VAT ({formatNumber(tmFeeDetails.vatRatePercent, 0)}%)</span>
              <span className="font-bold text-neutral-900 whitespace-nowrap shrink-0">+{formatCurrency(tmFeeDetails.vatAmountEUR, state.currency)}</span>
            </div>

            <div className="flex items-center justify-between px-3 py-2.5 bg-rose-50/80 border-t border-rose-200 gap-2">
              <span className="font-black text-rose-950 font-display uppercase tracking-wide text-xs sm:text-sm truncate">
                4. Total Pass-Through Fee
              </span>
              <span className="text-rose-700 font-black text-sm sm:text-base whitespace-nowrap shrink-0">
                {formatCurrency(tmFeeDetails.totalTmFeePerMemberEUR, state.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Fee Contribution Split */}
      <div className="space-y-3 pt-3 border-t border-neutral-200">
        <div>
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider font-display text-neutral-900 truncate block">
            Monthly Fee Contribution Split
          </span>
        </div>

        {/* The Split Meter Visualizer (With Floating Overlay Numbers & Percentages) */}
        <div className="relative w-full h-16 sm:h-20 rounded-xl overflow-hidden border-2 border-neutral-900 bg-neutral-950 shadow-sm font-mono-numbers select-none">
          {/* Background Meter Bar (Pure mathematical proportions, decoupled from text width) */}
          <div className="absolute inset-0 flex w-full h-full">
            {isNegative ? (
              <div className="w-full h-full bg-rose-950 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#881337,#881337_12px,#4c0519_12px,#4c0519_24px)] opacity-90" />
              </div>
            ) : (
              <>
                <div 
                  className="bg-rose-600 h-full transition-all duration-300 relative border-r-2 border-neutral-900"
                  style={{ 
                    width: `${state.monthlyClubFeeEUR > 0 
                      ? Math.min(100, Math.max(0, (tmFeeDetails.totalTmFeePerMemberEUR / state.monthlyClubFeeEUR) * 100)) 
                      : 100}%` 
                  }}
                />
                <div 
                  className="bg-emerald-600 h-full transition-all duration-300 grow"
                />
              </>
            )}
          </div>

          {/* Floating Number Overlay (Floats cleanly on top of the meter) */}
          <div className="relative z-10 w-full h-full flex items-center justify-between px-3.5 sm:px-5 pointer-events-none">
            {/* Left: TM Pass-Through */}
            <div className="flex flex-col justify-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-white/90 leading-tight mb-0.5">
                TM Pass-Through
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                {formatCurrency(tmFeeDetails.totalTmFeePerMemberEUR, state.currency)}
              </span>
            </div>

            {/* Right: Local Club Fund (Allows Negative Numbers) */}
            <div className="flex flex-col justify-center items-end text-right drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider leading-tight mb-0.5 ${
                isNegative ? 'text-rose-200' : 'text-white/90'
              }`}>
                {isNegative ? 'Margin Deficit' : 'Local Club Fund'}
              </span>
              <span className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight ${
                isNegative ? 'text-rose-200' : 'text-white'
              }`}>
                {memberEconomics.netMarginPerMemberEUR >= 0 ? '+' : ''}
                {formatCurrency(memberEconomics.netMarginPerMemberEUR, state.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

