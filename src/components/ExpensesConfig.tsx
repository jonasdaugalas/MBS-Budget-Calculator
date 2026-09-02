import React, { useState } from 'react';
import { 
  Receipt, 
  Trash2, 
  Check, 
  X,
  Repeat,
  Clock
} from 'lucide-react';
import { ClubBudgetState, CustomExpense, YearlyBudgetSummary } from '../types';
import { formatCurrency } from '../utils/budgetCalculator';
import { NumericInput } from './NumericInput';
import { CommentPopover } from './CommentPopover';

interface ExpensesConfigProps {
  state: ClubBudgetState;
  summary: YearlyBudgetSummary;
  onChange: (updates: Partial<ClubBudgetState>) => void;
}

export const ExpensesConfig: React.FC<ExpensesConfigProps> = ({
  state,
  summary,
  onChange,
}) => {
  const [recName, setRecName] = useState('');
  const [recAmount, setRecAmount] = useState<number>(10);
  const [recComment, setRecComment] = useState('');

  const [oneName, setOneName] = useState('');
  const [oneAmount, setOneAmount] = useState<number>(50);
  const [oneComment, setOneComment] = useState('');

  const { expenseEconomics } = summary;

  const handleUpdateExpense = (expenseId: string, updates: Partial<CustomExpense>) => {
    const updated = state.expenses.map((exp) => (exp.id === expenseId ? { ...exp, ...updates } : exp));
    onChange({ expenses: updated });
  };

  const handleDeleteExpense = (expenseId: string) => {
    onChange({ expenses: state.expenses.filter((exp) => exp.id !== expenseId) });
  };

  const handleAddRecurring = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!recName.trim()) return;

    const newExpense: CustomExpense = {
      id: `exp-rec-${Date.now()}`,
      name: recName.trim(),
      category: 'recurring',
      amount: Math.max(0, recAmount),
      frequency: 'monthly',
      comment: recComment.trim(),
      description: recComment.trim(),
    };

    onChange({ expenses: [...state.expenses, newExpense] });
    setRecName('');
    setRecAmount(10);
    setRecComment('');
  };

  const handleAddOneTime = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!oneName.trim()) return;

    const newExpense: CustomExpense = {
      id: `exp-one-${Date.now()}`,
      name: oneName.trim(),
      category: 'one-time',
      amount: Math.max(0, oneAmount),
      frequency: 'one-time',
      comment: oneComment.trim(),
      description: oneComment.trim(),
    };

    onChange({ expenses: [...state.expenses, newExpense] });
    setOneName('');
    setOneAmount(50);
    setOneComment('');
  };

  const recurringExpenses = state.expenses.filter((e) => e.frequency === 'monthly');
  const oneTimeExpenses = state.expenses.filter((e) => e.frequency === 'one-time');

  return (
    <div id="expenses-config-card" className="bg-white rounded-lg sm:rounded-xl border border-neutral-300 shadow-3xs overflow-hidden">
      {/* Unified Section Header */}
      <div className="flex items-center justify-between px-3.5 py-2 sm:px-4 sm:py-2.5 border-b border-neutral-200 bg-neutral-50/90">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <Receipt className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
          </div>
          <h2 className="text-xs sm:text-sm font-black text-neutral-950 uppercase tracking-wider font-display leading-none">
            Club Custom Expenditures
          </h2>
        </div>

        <div className="flex items-center gap-1.5 font-mono-numbers">
          <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider hidden sm:inline">
            Custom Total:
          </span>
          <span className="text-xs sm:text-sm font-black text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
            {formatCurrency(expenseEconomics.totalAnnualCustomExpenses, state.currency)}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-3.5 sm:p-5 space-y-4 sm:space-y-5">
        
        {/* ================= RECURRING TABLE ================= */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-neutral-950 uppercase tracking-wider font-display">
            <Repeat className="w-3.5 h-3.5 text-neutral-800" />
            <span>Monthly Recurring Expenses</span>
          </div>

          <div className="overflow-x-auto -mx-3.5 sm:mx-0 px-3.5 sm:px-0">
            <table className="w-full text-xs sm:text-sm text-left border-collapse font-mono-numbers min-w-[440px]">
              <thead>
                <tr className="bg-neutral-950 text-white font-black uppercase tracking-wider text-[11px] sm:text-xs">
                  <th className="p-2.5 pl-3 font-display">Item Name</th>
                  <th className="p-2.5 text-right font-display w-32 sm:w-36">Monthly Price</th>
                  <th className="p-2.5 text-right font-display w-32 sm:w-40 whitespace-nowrap">Annual Total</th>
                  <th className="p-2.5 text-center font-display w-12 sm:w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recurringExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-neutral-50 transition border-b border-neutral-100">
                    <td className="p-1.5 sm:p-2 pl-2">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={exp.name}
                          onChange={(e) => handleUpdateExpense(exp.id, { name: e.target.value })}
                          aria-label="Recurring expense name"
                          className="grow font-bold text-neutral-950 bg-transparent hover:bg-neutral-100 focus:bg-white focus:border-neutral-900 focus:outline-none rounded border border-transparent px-2.5 py-1 text-xs sm:text-sm transition min-w-0"
                        />
                        <CommentPopover
                          id={`btn-comment-exp-${exp.id}`}
                          itemName={exp.name || 'Expense'}
                          comment={exp.comment ?? exp.description ?? ''}
                          mode="edit"
                          onSaveComment={(val) => handleUpdateExpense(exp.id, { comment: val, description: val })}
                        />
                      </div>
                    </td>
                    <td className="p-1.5 sm:p-2 text-right">
                      <div className="relative inline-block w-24 sm:w-28">
                        <NumericInput
                          value={exp.amount}
                          onValueChange={(val) => handleUpdateExpense(exp.id, { amount: Math.max(0, val) })}
                          min={0}
                          decimals={2}
                          step={0.5}
                          aria-label="Recurring amount"
                          className="w-full text-right font-bold text-neutral-950 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 hover:border-neutral-900 focus:border-neutral-900 focus:outline-none rounded px-2 py-1 text-xs sm:text-sm pr-5 transition"
                        />
                        <span className="absolute right-1.5 top-1 font-bold text-neutral-400 text-xs sm:text-sm pointer-events-none">€</span>
                      </div>
                    </td>
                    <td className="p-1.5 sm:p-2 text-right font-black text-neutral-800 pr-3 whitespace-nowrap">
                      {formatCurrency(exp.amount * 12, state.currency)}
                    </td>
                    <td className="p-1.5 sm:p-2 text-center">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Inline Add Form */}
                <tr className="bg-neutral-50/70 border-t-2 border-neutral-200">
                  <td className="p-1.5 sm:p-2 pl-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Add recurring item..."
                        value={recName}
                        onChange={(e) => setRecName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddRecurring();
                        }}
                        className="grow font-medium text-neutral-950 bg-white border border-neutral-300 focus:border-neutral-900 rounded px-2.5 py-1 text-xs sm:text-sm focus:outline-none transition shadow-2xs min-w-0"
                      />
                      <CommentPopover
                        id="btn-comment-new-rec"
                        itemName={recName || 'New Recurring Item'}
                        comment={recComment}
                        mode="edit"
                        onSaveComment={(val) => setRecComment(val)}
                      />
                    </div>
                  </td>
                  <td className="p-1.5 sm:p-2 text-right">
                    <div className="relative inline-block w-24 sm:w-28">
                      <NumericInput
                        value={recAmount}
                        onValueChange={(val) => setRecAmount(Math.max(0, val))}
                        min={0}
                        step={1}
                        decimals={2}
                        aria-label="Add recurring amount"
                        className="w-full text-right font-medium text-neutral-950 bg-white border border-neutral-300 focus:border-neutral-900 rounded px-2.5 py-1 text-xs sm:text-sm pr-5 focus:outline-none transition shadow-2xs"
                      />
                      <span className="absolute right-1.5 top-1 text-xs font-bold text-neutral-400 pointer-events-none">€</span>
                    </div>
                  </td>
                  <td className="p-1.5 sm:p-2 text-right text-neutral-400 font-bold italic pr-3 text-xs sm:text-sm">
                    {formatCurrency(recAmount * 12, state.currency)}
                  </td>
                  <td className="p-1.5 sm:p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAddRecurring()}
                        disabled={!recName.trim()}
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition"
                        title="Save item"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRecName('');
                          setRecAmount(10);
                          setRecComment('');
                        }}
                        className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 rounded cursor-pointer transition"
                        title="Discard input"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= ONE-TIME TABLE ================= */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-neutral-950 uppercase tracking-wider font-display">
            <Clock className="w-3.5 h-3.5 text-neutral-800" />
            <span>One-Time Event Expenses</span>
          </div>

          <div className="overflow-x-auto -mx-3.5 sm:mx-0 px-3.5 sm:px-0">
            <table className="w-full text-xs sm:text-sm text-left border-collapse font-mono-numbers min-w-[440px]">
              <thead>
                <tr className="bg-neutral-950 text-white font-black uppercase tracking-wider text-[11px] sm:text-xs">
                  <th className="p-2.5 pl-3 font-display">Item Name</th>
                  <th className="p-2.5 text-right font-display w-32 sm:w-36">Event Amount</th>
                  <th className="p-2.5 text-right font-display w-32 sm:w-40 whitespace-nowrap">Annual Total</th>
                  <th className="p-2.5 text-center font-display w-12 sm:w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {oneTimeExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-neutral-50 transition border-b border-neutral-100">
                    <td className="p-1.5 sm:p-2 pl-2">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={exp.name}
                          onChange={(e) => handleUpdateExpense(exp.id, { name: e.target.value })}
                          aria-label="One-time expense name"
                          className="grow font-bold text-neutral-950 bg-transparent hover:bg-neutral-100 focus:bg-white focus:border-neutral-900 focus:outline-none rounded border border-transparent px-2.5 py-1 text-xs sm:text-sm transition min-w-0"
                        />
                        <CommentPopover
                          id={`btn-comment-exp-${exp.id}`}
                          itemName={exp.name || 'Event Expense'}
                          comment={exp.comment ?? exp.description ?? ''}
                          mode="edit"
                          onSaveComment={(val) => handleUpdateExpense(exp.id, { comment: val, description: val })}
                        />
                      </div>
                    </td>
                    <td className="p-1.5 sm:p-2 text-right">
                      <div className="relative inline-block w-24 sm:w-28">
                        <NumericInput
                          value={exp.amount}
                          onValueChange={(val) => handleUpdateExpense(exp.id, { amount: Math.max(0, val) })}
                          min={0}
                          decimals={2}
                          step={5}
                          aria-label="One-time amount"
                          className="w-full text-right font-bold text-neutral-950 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 hover:border-neutral-900 focus:border-neutral-900 focus:outline-none rounded px-2 py-1 text-xs sm:text-sm pr-5 transition"
                        />
                        <span className="absolute right-1.5 top-1 font-bold text-neutral-400 text-xs sm:text-sm pointer-events-none">€</span>
                      </div>
                    </td>
                    <td className="p-1.5 sm:p-2 text-right font-black text-neutral-800 pr-3 whitespace-nowrap">
                      {formatCurrency(exp.amount, state.currency)}
                    </td>
                    <td className="p-1.5 sm:p-2 text-center">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Inline Add Form */}
                <tr className="bg-neutral-50/70 border-t-2 border-neutral-200">
                  <td className="p-1.5 sm:p-2 pl-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Add one-off item..."
                        value={oneName}
                        onChange={(e) => setOneName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddOneTime();
                        }}
                        className="grow font-medium text-neutral-950 bg-white border border-neutral-300 focus:border-neutral-900 rounded px-2.5 py-1 text-xs sm:text-sm focus:outline-none transition shadow-2xs min-w-0"
                      />
                      <CommentPopover
                        id="btn-comment-new-one"
                        itemName={oneName || 'New One-Off Item'}
                        comment={oneComment}
                        mode="edit"
                        onSaveComment={(val) => setOneComment(val)}
                      />
                    </div>
                  </td>
                  <td className="p-1.5 sm:p-2 text-right">
                    <div className="relative inline-block w-24 sm:w-28">
                      <NumericInput
                        value={oneAmount}
                        onValueChange={(val) => setOneAmount(Math.max(0, val))}
                        min={0}
                        step={5}
                        decimals={2}
                        aria-label="Add one-off amount"
                        className="w-full text-right font-medium text-neutral-950 bg-white border border-neutral-300 focus:border-neutral-900 rounded px-2 py-1 text-xs sm:text-sm pr-5 focus:outline-none transition shadow-2xs"
                      />
                      <span className="absolute right-1.5 top-1 text-xs font-bold text-neutral-400 pointer-events-none">€</span>
                    </div>
                  </td>
                  <td className="p-1.5 sm:p-2 text-right text-neutral-400 font-bold italic pr-3 text-xs sm:text-sm">
                    {formatCurrency(oneAmount, state.currency)}
                  </td>
                  <td className="p-1.5 sm:p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAddOneTime()}
                        disabled={!oneName.trim()}
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition"
                        title="Save item"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOneName('');
                          setOneAmount(50);
                          setOneComment('');
                        }}
                        className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 rounded cursor-pointer transition"
                        title="Discard input"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
