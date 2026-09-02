import React, { useState } from 'react';
import { 
  DoorOpen, 
  Trash2, 
  Check, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { ClubBudgetState, RoomTier, YearlyBudgetSummary } from '../types';
import { formatCurrency } from '../utils/budgetCalculator';
import { NumericInput } from './NumericInput';
import { CommentPopover } from './CommentPopover';

interface RoomRentConfigProps {
  state: ClubBudgetState;
  summary: YearlyBudgetSummary;
  onChange: (updates: Partial<ClubBudgetState>) => void;
}

export const RoomRentConfig: React.FC<RoomRentConfigProps> = ({
  state,
  summary,
  onChange,
}) => {
  // Add state for adding a new tier
  const [newTierName, setNewTierName] = useState('');
  const [newTierPrice, setNewTierPrice] = useState<number>(180);
  const [newTierMonths, setNewTierMonths] = useState<number>(1);
  const [newTierComment, setNewTierComment] = useState('');

  const { roomEconomics } = summary;

  const handleUpdateTier = (tierId: string, updates: Partial<RoomTier>) => {
    const updated = state.roomTiers.map((t) => (t.id === tierId ? { ...t, ...updates } : t));
    onChange({ roomTiers: updated });
  };

  const handleDeleteTier = (tierId: string) => {
    const updated = state.roomTiers.filter((t) => t.id !== tierId);
    onChange({ roomTiers: updated });
  };

  const handleAddTier = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTierName.trim()) return;

    const newTier: RoomTier = {
      id: `tier-${Date.now()}`,
      name: newTierName.trim(),
      pricePerMonth: Math.max(0, newTierPrice),
      monthsCount: Math.max(0, newTierMonths),
      comment: newTierComment.trim(),
      description: newTierComment.trim(),
    };

    onChange({
      roomTiers: [...state.roomTiers, newTier],
    });

    setNewTierName('');
    setNewTierPrice(180);
    setNewTierMonths(1);
    setNewTierComment('');
  };

  return (
    <div id="room-rent-config-card" className="bg-white rounded-lg sm:rounded-xl border border-neutral-300 shadow-3xs overflow-hidden">
      {/* Unified Section Header */}
      <div className="flex items-center justify-between px-3.5 py-2 sm:px-4 sm:py-2.5 border-b border-neutral-200 bg-neutral-50/90">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <DoorOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
          </div>
          <h2 className="text-xs sm:text-sm font-black text-neutral-950 uppercase tracking-wider font-display leading-none">
            Venue Expenses
          </h2>
        </div>

        <div className="flex items-center gap-1.5 font-mono-numbers">
          <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider hidden sm:inline">
            Venue Total:
          </span>
          <span className="text-xs sm:text-sm font-black text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
            {formatCurrency(roomEconomics.totalAnnualRoomExpense, state.currency)}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
        {/* Main simple table */}
        <div className="overflow-x-auto -mx-3.5 sm:mx-0 px-3.5 sm:px-0">
          <table className="w-full text-xs sm:text-sm text-left border-collapse font-mono-numbers min-w-[520px]">
            <thead>
              <tr className="bg-neutral-950 text-white font-black uppercase tracking-wider text-[11px] sm:text-xs">
                <th className="p-2.5 pl-3 font-display">Venue / Tier Name</th>
                <th className="p-2.5 text-right font-display w-28 sm:w-32">Monthly Price</th>
                <th className="p-2.5 text-center font-display w-20 sm:w-24">Months</th>
                <th className="p-2.5 text-right font-display w-32 sm:w-40 whitespace-nowrap">Annual Total</th>
                <th className="p-2.5 text-center font-display w-12 sm:w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {state.roomTiers.map((tier) => (
                <tr key={tier.id} className="hover:bg-neutral-50 transition border-b border-neutral-100">
                  <td className="p-1.5 sm:p-2 pl-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => handleUpdateTier(tier.id, { name: e.target.value })}
                        aria-label="Room tier name"
                        className="grow font-bold text-neutral-950 bg-transparent hover:bg-neutral-100 focus:bg-white focus:border-neutral-900 focus:outline-none rounded border border-transparent px-2.5 py-1 text-xs sm:text-sm transition min-w-0"
                      />
                      <CommentPopover
                        id={`btn-comment-tier-${tier.id}`}
                        itemName={tier.name || 'Venue Tier'}
                        comment={tier.comment ?? tier.description ?? ''}
                        mode="edit"
                        onSaveComment={(val) => handleUpdateTier(tier.id, { comment: val, description: val })}
                      />
                    </div>
                  </td>
                  <td className="p-1.5 sm:p-2 text-right">
                    <div className="relative inline-block w-24 sm:w-28">
                      <NumericInput
                        value={tier.pricePerMonth}
                        onValueChange={(val) => handleUpdateTier(tier.id, { pricePerMonth: Math.max(0, val) })}
                        min={0}
                        decimals={2}
                        step={5}
                        aria-label="Tier monthly price"
                        className="w-full text-right font-bold text-neutral-950 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 hover:border-neutral-900 focus:border-neutral-900 focus:outline-none rounded px-2 py-1 text-xs sm:text-sm pr-5 transition"
                      />
                      <span className="absolute right-1.5 top-1 font-bold text-neutral-400 text-xs sm:text-sm pointer-events-none">€</span>
                    </div>
                  </td>
                  <td className="p-1.5 sm:p-2 text-center">
                    <NumericInput
                      value={tier.monthsCount}
                      onValueChange={(val) => handleUpdateTier(tier.id, { monthsCount: Math.min(12, Math.max(0, Math.round(val))) })}
                      min={0}
                      max={12}
                      step={1}
                      decimals={0}
                      aria-label="Months Count"
                      className="w-14 sm:w-16 text-center font-bold text-neutral-950 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 hover:border-neutral-900 focus:border-neutral-900 focus:outline-none rounded px-1.5 py-1 text-xs sm:text-sm transition"
                    />
                  </td>
                  <td className="p-1.5 sm:p-2 text-right font-black text-neutral-800 pr-3 whitespace-nowrap">
                    {formatCurrency(tier.pricePerMonth * (tier.monthsCount || 0), state.currency)}
                  </td>
                  <td className="p-1.5 sm:p-2 text-center">
                    <button
                      onClick={() => handleDeleteTier(tier.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                      title="Delete venue entry"
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
                      placeholder="Add new venue tier..."
                      value={newTierName}
                      onChange={(e) => setNewTierName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTier();
                      }}
                      className="grow font-medium text-neutral-950 bg-white border border-neutral-300 focus:border-neutral-900 rounded px-2.5 py-1 text-xs sm:text-sm focus:outline-none transition shadow-2xs min-w-0"
                    />
                    <CommentPopover
                      id="btn-comment-new-tier"
                      itemName={newTierName || 'New Venue Tier'}
                      comment={newTierComment}
                      mode="edit"
                      onSaveComment={(val) => setNewTierComment(val)}
                    />
                  </div>
                </td>
                <td className="p-1.5 sm:p-2 text-right">
                  <div className="relative inline-block w-24 sm:w-28">
                    <NumericInput
                      value={newTierPrice}
                      onValueChange={(val) => setNewTierPrice(Math.max(0, val))}
                      min={0}
                      step={5}
                      decimals={2}
                      aria-label="Add price"
                      className="w-full text-right font-medium text-neutral-950 bg-white border border-neutral-300 focus:border-neutral-900 rounded px-2 py-1 text-xs sm:text-sm pr-5 focus:outline-none transition shadow-2xs"
                    />
                    <span className="absolute right-1.5 top-1 text-xs font-bold text-neutral-400 pointer-events-none">€</span>
                  </div>
                </td>
                <td className="p-1.5 sm:p-2 text-center">
                  <NumericInput
                    value={newTierMonths}
                    onValueChange={(val) => setNewTierMonths(Math.min(12, Math.max(0, Math.round(val))))}
                    min={1}
                    max={12}
                    step={1}
                    decimals={0}
                    aria-label="Add months count"
                    className="w-14 sm:w-16 text-center font-medium text-neutral-950 bg-white border border-neutral-300 focus:border-neutral-900 rounded px-1.5 py-1 text-xs sm:text-sm focus:outline-none transition shadow-2xs"
                  />
                </td>
                <td className="p-1.5 sm:p-2 text-right text-neutral-400 font-bold italic pr-3 text-xs sm:text-sm">
                  {formatCurrency(newTierPrice * newTierMonths, state.currency)}
                </td>
                <td className="p-1.5 sm:p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAddTier()}
                      disabled={!newTierName.trim()}
                      className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition"
                      title="Save venue"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewTierName('');
                        setNewTierPrice(180);
                        setNewTierMonths(1);
                        setNewTierComment('');
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

        {/* Allocation Warning/Info */}
        {!roomEconomics.isAllocationComplete && (
          <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-amber-50 border border-amber-300 text-amber-950 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wide">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span>
              Notice: Allocated months sum to {roomEconomics.totalAllocatedMonths} instead of 12 months.
              {roomEconomics.unallocatedMonthsCount > 0 && ` (${roomEconomics.unallocatedMonthsCount} unallocated)`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
