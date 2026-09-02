import React, { useEffect, useMemo } from 'react';
import { X, Calculator } from 'lucide-react';
import katex from 'katex';
import { ClubBudgetState, YearlyBudgetSummary } from '../types';
import { formatCurrency, formatNumber, formatMembersCount } from '../utils/budgetCalculator';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ClubBudgetState;
  summary: YearlyBudgetSummary;
}

// KaTeX LaTeX renderer component
const Latex: React.FC<{ math: string; display?: boolean; className?: string }> = ({
  math,
  display = false,
  className = '',
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  }, [math, display]);

  return (
    <span
      className={`${display ? 'block' : 'inline-block'} overflow-visible ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const FormulaModal: React.FC<FormulaModalProps> = ({
  isOpen,
  onClose,
  state,
  summary,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tmDuesEUR = summary.tmFeeDetails.totalTmFeePerMemberEUR;
  const netMargin = summary.memberEconomics.netMarginPerMemberEUR;
  const roomCost = summary.roomEconomics.totalAnnualRoomExpense;
  const recurringCost = summary.expenseEconomics.totalAnnualRecurring;
  const oneTimeCost = summary.expenseEconomics.totalAnnualOneTime;
  const fixedAnnualCosts = summary.breakEven.yearlyFixedCosts;
  const breakEven = summary.breakEven;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="formula-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-xl border-2 border-neutral-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 bg-neutral-50/90">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <Calculator className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
            </div>
            <h2 id="formula-modal-title" className="text-xs sm:text-sm font-black text-neutral-950 uppercase tracking-wider font-display leading-none">
              Break-Even Formulas &amp; Economics
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-white border border-neutral-300 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 hover:text-neutral-950 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto px-4 py-3.5 sm:px-5 sm:py-4 space-y-4 text-xs sm:text-sm text-neutral-800">
          
          {/* Core Equilibrium Section */}
          <div className="bg-neutral-950 text-white rounded-lg p-3 space-y-2 shadow-3xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 font-display">
              Core Equilibrium
            </div>
            <div className="py-0.5 text-center sm:text-left">
              <Latex math="\text{Annual Net} = 12 \cdot N_{\text{mem}} \cdot R_{\text{club}} - C_{\text{fixed}}" display className="text-white text-xs sm:text-sm" />
            </div>
            <div className="pt-1.5 border-t border-neutral-800 text-center sm:text-left">
              <Latex math="\text{Break-even: Annual Net} = 0" display className="text-emerald-400 text-xs sm:text-sm" />
            </div>
          </div>

          {/* Symbol Legend */}
          <div className="space-y-1.5 pb-3 border-b border-neutral-200">
            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-500 font-display">
              Symbols &amp; Variables
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              {/* Base inputs first */}
              <div className="flex items-baseline gap-1.5">
                <Latex math="N_{\text{mem}}" className="font-bold text-neutral-950 shrink-0" />
                <span className="text-neutral-600">: Paying club members</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <Latex math="\text{Fee}" className="font-bold text-neutral-950 shrink-0" />
                <span className="text-neutral-600">: Monthly club membership fee</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <Latex math="D_{\text{TM\_USD}}" className="font-bold text-neutral-950 shrink-0" />
                <span className="text-neutral-600">: TM dues in USD ($/mo)</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <Latex math="\text{FX}" className="font-bold text-neutral-950 shrink-0" />
                <span className="text-neutral-600">: Exchange rate (EUR / USD)</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <Latex math="\text{VAT}" className="font-bold text-neutral-950 shrink-0" />
                <span className="text-neutral-600">: Value-added tax rate (%)</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <Latex math="C_{\text{fixed}}" className="font-bold text-neutral-950 shrink-0" />
                <span className="text-neutral-600">: Total annual fixed costs</span>
              </div>
              {/* Derived symbols after their dependencies */}
              <div className="flex items-baseline gap-1.5">
                <Latex math="D_{\text{TM}}" className="font-bold text-neutral-950 shrink-0" />
                <span className="text-neutral-600">: TM pass-through dues (EUR)</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <Latex math="R_{\text{club}}" className="font-bold text-neutral-950 shrink-0" />
                <span className="text-neutral-600">: Retained club funds (<Latex math="\text{Fee} - D_{\text{TM}}" />)</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Breakdown */}
          <div className="space-y-3.5">
            
            {/* Step 1: D_TM */}
            <div className="space-y-1.5 pb-3 border-b border-neutral-200">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold text-neutral-950 text-xs sm:text-sm font-display flex items-center gap-1.5">
                  1. Pass-Through Dues (<Latex math="D_{\text{TM}}" />)
                </span>
                <span className="font-mono-numbers font-black text-rose-700 text-xs">
                  {formatCurrency(tmDuesEUR, state.currency)} / mo
                </span>
              </div>
              <div className="text-neutral-600 py-0.5">
                <Latex math="D_{\text{TM}} = D_{\text{TM\_USD}} \cdot \text{FX} \cdot (1 + \text{VAT})" />
              </div>
              <div className="font-mono-numbers text-xs text-neutral-900 font-medium bg-neutral-50">
                {formatCurrency(state.monthlyTmDuesUSD, '$')} · {formatNumber(state.usdToEurRate, 3)} · (1 + {formatNumber(state.vatRatePercent, 0)}%) = <strong className="text-neutral-950 font-bold">{formatCurrency(tmDuesEUR, state.currency)} / mo</strong>
              </div>
            </div>

            {/* Step 2: R_club */}
            <div className="space-y-1.5 pb-3 border-b border-neutral-200">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold text-neutral-950 text-xs sm:text-sm font-display flex items-center gap-1.5">
                  2. Retained Club Funds (<Latex math="R_{\text{club}}" />)
                </span>
                <span className={`font-mono-numbers font-black text-xs ${
                  netMargin >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {formatCurrency(netMargin, state.currency)} / mo
                </span>
              </div>
              <div className="text-neutral-600 py-0.5">
                <Latex math="R_{\text{club}} = \text{Fee} - D_{\text{TM}}" />
              </div>
              <div className="font-mono-numbers text-xs text-neutral-900 font-medium bg-neutral-50">
                {formatCurrency(state.monthlyClubFeeEUR, state.currency)} − {formatCurrency(tmDuesEUR, state.currency)} = <strong className="text-neutral-950 font-bold">{formatCurrency(netMargin, state.currency)} / mo</strong>
              </div>
            </div>

            {/* Step 3: C_fixed */}
            <div className="space-y-1.5 pb-3 border-b border-neutral-200">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold text-neutral-950 text-xs sm:text-sm font-display flex items-center gap-1.5">
                  3. Annual Fixed Costs (<Latex math="C_{\text{fixed}}" />)
                </span>
                <span className="font-mono-numbers font-black text-neutral-900 text-xs">
                  {formatCurrency(fixedAnnualCosts, state.currency)} / yr
                </span>
              </div>
              <div className="text-neutral-600 py-0.5">
                <Latex math="C_{\text{fixed}} = C_{\text{venue}} + C_{\text{recurring}} + C_{\text{one-time}}" />
              </div>
              <div className="font-mono-numbers text-xs text-neutral-900 font-medium bg-neutral-50">
                {formatCurrency(roomCost, state.currency)} + {formatCurrency(recurringCost, state.currency)} + {formatCurrency(oneTimeCost, state.currency)} = <strong className="text-neutral-950 font-bold">{formatCurrency(fixedAnnualCosts, state.currency)} / yr</strong>
              </div>
            </div>

            {/* Step 4: Break-Even Solutions */}
            <div className="space-y-3.5 pt-0.5">
              <div className="font-black text-neutral-950 text-xs uppercase tracking-wider font-display">
                4. Break-Even Target Solutions
              </div>

              {/* Required Members N_mem */}
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-bold text-neutral-900 text-xs flex items-center gap-1">
                    Required Members (<Latex math="N_{\text{mem}}" />)
                  </span>
                  <span className="text-[10px] font-bold text-neutral-500 font-mono-numbers">
                    @ Fee = {formatCurrency(state.monthlyClubFeeEUR, state.currency)}/mo
                  </span>
                </div>
                
                {/* Conceptual Formula Line — larger for fractions on mobile */}
                <div className="text-neutral-700 py-1 text-[15px] sm:text-base">
                  <Latex math="N_{\text{mem}} = \frac{C_{\text{fixed}}}{12 \cdot R_{\text{club}}}" display />
                </div>

                {/* Substituted Numbers Line */}
                <div className="flex flex-wrap items-center gap-2 font-mono-numbers text-sm sm:text-base text-neutral-900 bg-neutral-50">
                  {netMargin > 0 && breakEven?.breakEvenFullMembersNeeded !== null && breakEven?.breakEvenFullMembersNeeded !== undefined ? (
                    <>
                      <Latex math={`N_{\\text{mem}} = \\frac{\\text{${formatCurrency(fixedAnnualCosts, state.currency)}}}{12 \\cdot \\text{${formatCurrency(netMargin, state.currency)}}}`} display className="text-[15px] sm:text-base" />
                      <span className="text-sm sm:text-base">=</span>
                      <strong className="text-neutral-950 font-black text-sm sm:text-base px-1.5 py-0.5 rounded bg-amber-100/80 border border-amber-300 whitespace-nowrap">
                        {formatNumber(breakEven.breakEvenFullMembersNeeded, 2)} members
                      </strong>
                    </>
                  ) : (
                    <span className="text-rose-600 font-bold text-sm">Unachievable (<Latex math="R_{\text{club}} \le 0" />)</span>
                  )}
                </div>
              </div>

              {/* Required Monthly Fee */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-bold text-neutral-900 text-xs flex items-center gap-1">
                    Required Monthly Fee (<Latex math="\text{Fee}" />)
                  </span>
                  <span className="text-[10px] font-bold text-neutral-500 font-mono-numbers">
                    @ <Latex math="N_{\text{mem}}" /> = {formatMembersCount(state.defaultFullMembers)}
                  </span>
                </div>

                {/* Conceptual Formula Line — larger for fractions on mobile */}
                <div className="text-neutral-700 py-1 text-[15px] sm:text-base">
                  <Latex math="\text{Fee} = \frac{C_{\text{fixed}}}{12 \cdot N_{\text{mem}}} + D_{\text{TM}}" display />
                </div>

                {/* Substituted Numbers Line */}
                <div className="flex flex-wrap items-center gap-2 font-mono-numbers text-sm sm:text-base text-neutral-900 bg-neutral-50">
                  {state.defaultFullMembers > 0 && breakEven?.breakEvenClubFeeNeeded !== null && breakEven?.breakEvenClubFeeNeeded !== undefined ? (
                    <>
                      <Latex math={`\\text{Fee} = \\frac{\\text{${formatCurrency(fixedAnnualCosts, state.currency)}}}{12 \\cdot ${formatMembersCount(state.defaultFullMembers)}} + \\text{${formatCurrency(tmDuesEUR, state.currency)}}`} display className="text-[15px] sm:text-base" />
                      <span className="text-sm sm:text-base">=</span>
                      <strong className="text-neutral-950 font-black text-sm sm:text-base px-1.5 py-0.5 rounded bg-blue-100/80 border border-blue-300 whitespace-nowrap">
                        {formatCurrency(breakEven.breakEvenClubFeeNeeded, state.currency)} / mo
                      </strong>
                    </>
                  ) : (
                    <span className="text-neutral-500 italic text-sm">Requires <Latex math="N_{\text{mem}} > 0" /></span>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-md font-bold text-xs sm:text-sm transition cursor-pointer shadow-3xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
