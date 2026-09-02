import React, { useState, useEffect } from 'react';
import { ClubBudgetState } from './types';
import { 
  DEFAULT_MONTHS, 
  INITIAL_BUDGET_STATE, 
  calculateYearlyBudget 
} from './utils/budgetCalculator';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { BreakEvenChartWidget } from './components/BreakEvenChartWidget';
import { MembershipConfig } from './components/MembershipConfig';
import { RoomRentConfig } from './components/RoomRentConfig';
import { ExpensesConfig } from './components/ExpensesConfig';
import { BudgetTable } from './components/BudgetTable';

const STORAGE_KEY = 'tm_club_budget_state_v5';

export default function App() {
  // Load initial state from localStorage or defaults
  const [state, setState] = useState<ClubBudgetState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Quick verification of the structure
        if (parsed.roomTiers && parsed.roomTiers.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved state from localStorage', e);
    }
    return INITIAL_BUDGET_STATE;
  });

  // Save state to localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [state]);

  const updateState = (updates: Partial<ClubBudgetState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleResetDefaults = () => {
    setState(INITIAL_BUDGET_STATE);
  };

  // Run calculation
  const summary = calculateYearlyBudget(state, DEFAULT_MONTHS);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      {/* App Header */}
      <Header />

      {/* Main Container - Compact on mobile */}
      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-6 flex-1 w-full space-y-3 sm:space-y-6">
        {/* Metric Cards Overview & Break-Even Points (6 cards, 3 per row) */}
        <MetricCards state={state} summary={summary} currency={state.currency} />

        {/* Primary Interactive Break-Even Chart Widget */}
        <BreakEvenChartWidget
          state={state}
          summary={summary}
          onChange={updateState}
        />

        {/* Configurations View */}
        <div className="space-y-3 sm:space-y-6">
          <MembershipConfig
            state={state}
            summary={summary}
            onChange={updateState}
          />

          <RoomRentConfig
            state={state}
            summary={summary}
            onChange={updateState}
          />

          <ExpensesConfig
            state={state}
            summary={summary}
            onChange={updateState}
          />

          {/* Consolidated spreadsheet report */}
          <BudgetTable
            state={state}
            summary={summary}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-3 sm:py-4 text-[11px] sm:text-xs font-medium text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center text-center">
          <span className="font-bold text-neutral-800 tracking-tight">Toastmasters Club Budget Calculator • {state.clubName}</span>
        </div>
      </footer>
    </div>
  );
}
