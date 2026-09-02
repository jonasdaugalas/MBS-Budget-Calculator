import assert from 'node:assert';
import {
  calculateTmUnitFeeDetails,
  calculateTmUnitFeeEUR,
  calculateMemberEconomics,
  calculateRoomEconomics,
  calculateExpenseEconomics,
  calculateBreakEvenAnalysis,
  calculateBreakEvenFeeForMembers,
  calculateBreakEvenMembersForFee,
  calculateSimulationPoint,
  generateBreakEvenCurvePoints,
  calculateYearlyBudget,
  formatCurrency,
  formatPercent,
  DEFAULT_MONTHS,
  INITIAL_BUDGET_STATE,
} from './budgetCalculator';
import { ClubBudgetState, RoomTier, CustomExpense } from '../types';

let totalTests = 0;
let passedTests = 0;

function test(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    throw err;
  }
}

console.log('\n--- Running Toastmasters Budget Calculator Unit Tests ---\n');

// ==========================================
// 1. TM UNIT FEE TESTS
// ==========================================
console.log('1. Toastmasters Pass-through Fee Calculations:');

test('Standard parameters: $12 USD, 0.87 exchange rate, 19% VAT', () => {
  const result = calculateTmUnitFeeDetails(12, 0.87, 19);
  assert.strictEqual(result.baseDuesUSD, 12);
  assert.strictEqual(result.usdToEurRate, 0.87);
  assert.strictEqual(result.vatRatePercent, 19);
  
  // 12 * 0.87 = 10.44
  assert.strictEqual(Number(result.rawConvertedEUR.toFixed(4)), 10.44);
  // 10.44 * 0.19 = 1.9836
  assert.strictEqual(Number(result.vatAmountEUR.toFixed(4)), 1.9836);
  // 10.44 + 1.9836 = 12.4236
  assert.strictEqual(Number(result.totalTmFeePerMemberEUR.toFixed(4)), 12.4236);
});

test('Edge Case: Zero TM dues ($0)', () => {
  const result = calculateTmUnitFeeDetails(0, 0.87, 19);
  assert.strictEqual(result.totalTmFeePerMemberEUR, 0);
  assert.strictEqual(result.vatAmountEUR, 0);
});

test('Edge Case: 0% VAT rate', () => {
  const result = calculateTmUnitFeeDetails(10, 0.90, 0);
  assert.strictEqual(result.rawConvertedEUR, 9.0);
  assert.strictEqual(result.vatAmountEUR, 0);
  assert.strictEqual(result.totalTmFeePerMemberEUR, 9.0);
});

test('Edge Case: Negative or NaN inputs are sanitized safely to 0', () => {
  const result = calculateTmUnitFeeDetails(-10, -0.87, -19);
  assert.strictEqual(result.baseDuesUSD, 0);
  assert.strictEqual(result.usdToEurRate, 0);
  assert.strictEqual(result.vatRatePercent, 0);
  assert.strictEqual(result.totalTmFeePerMemberEUR, 0);
});

// ==========================================
// 2. MEMBER ECONOMICS TESTS
// ==========================================
console.log('\n2. Member Unit Contribution & Income Economics:');

test('Standard positive margin: 20 € fee, 12.4236 € TM fee, 22 members', () => {
  const econ = calculateMemberEconomics(20, 12.4236, 22);
  assert.strictEqual(econ.monthlyClubFeeEUR, 20);
  assert.strictEqual(econ.tmFeePerMemberEUR, 12.4236);
  assert.strictEqual(Number(econ.netMarginPerMemberEUR.toFixed(4)), 7.5764);
  assert.strictEqual(Number(econ.netMarginPerMemberYearlyEUR.toFixed(4)), 90.9168);
  assert.strictEqual(econ.isDeficitMargin, false);
  assert.strictEqual(econ.totalMonthlyIncome, 440);
  assert.strictEqual(econ.totalAnnualIncome, 5280);
  
  // Percentages: 12.4236 / 20 = 62.118%
  assert.strictEqual(Number(econ.tmPercentage.toFixed(2)), 62.12);
  assert.strictEqual(Number(econ.localPercentage.toFixed(2)), 37.88);
});

test('Edge Case: Deficit margin where club fee < TM pass-through', () => {
  const econ = calculateMemberEconomics(10, 12.4236, 20);
  assert.strictEqual(econ.isDeficitMargin, true);
  assert.strictEqual(Number(econ.netMarginPerMemberEUR.toFixed(4)), -2.4236);
  assert.strictEqual(econ.tmPercentage, 100);
  assert.strictEqual(econ.localPercentage, 0);
});

test('Edge Case: Zero paying members (0 members)', () => {
  const econ = calculateMemberEconomics(25, 12, 0);
  assert.strictEqual(econ.totalMonthlyIncome, 0);
  assert.strictEqual(econ.totalAnnualIncome, 0);
  assert.strictEqual(econ.netMarginPerMemberEUR, 13);
});

// ==========================================
// 3. ROOM RENT & VENUE LEASING TESTS
// ==========================================
console.log('\n3. Room Rent & Venue Leasing Economics:');

test('Standard allocation: 9 months @ 180 €, 2 months @ 165 €, 1 month @ 150 € (Total 12 months)', () => {
  const tiers: RoomTier[] = [
    { id: '1', name: 'Big', pricePerMonth: 180, monthsCount: 9 },
    { id: '2', name: 'Medium', pricePerMonth: 165, monthsCount: 2 },
    { id: '3', name: 'Small', pricePerMonth: 150, monthsCount: 1 },
  ];
  const roomEcon = calculateRoomEconomics(tiers, DEFAULT_MONTHS);
  
  assert.strictEqual(roomEcon.totalAllocatedMonths, 12);
  assert.strictEqual(roomEcon.isAllocationComplete, true);
  assert.strictEqual(roomEcon.unallocatedMonthsCount, 0);
  assert.strictEqual(roomEcon.overallocatedMonthsCount, 0);
  // (9 * 180) + (2 * 165) + (1 * 150) = 1620 + 330 + 150 = 2100
  assert.strictEqual(roomEcon.totalAnnualRoomExpense, 2100);
  assert.strictEqual(roomEcon.monthlyAverageRoomExpense, 175);
  
  // Verify tier summaries
  assert.strictEqual(roomEcon.tierSummaries[0].annualCost, 1620);
  assert.strictEqual(roomEcon.tierSummaries[1].annualCost, 330);
  assert.strictEqual(roomEcon.tierSummaries[2].annualCost, 150);
});

test('Edge Case: Under-allocated months (e.g. only 6 months allocated)', () => {
  const tiers: RoomTier[] = [
    { id: '1', name: 'Summer Venue', pricePerMonth: 200, monthsCount: 6 },
  ];
  const roomEcon = calculateRoomEconomics(tiers, DEFAULT_MONTHS);
  
  assert.strictEqual(roomEcon.totalAllocatedMonths, 6);
  assert.strictEqual(roomEcon.isAllocationComplete, false);
  assert.strictEqual(roomEcon.unallocatedMonthsCount, 6);
  assert.strictEqual(roomEcon.overallocatedMonthsCount, 0);
  assert.strictEqual(roomEcon.totalAnnualRoomExpense, 1200);
  
  // First 6 months should have 200, remaining 6 months should have 0
  assert.strictEqual(roomEcon.resolvedRoomPrices['2026-07'], 200);
  assert.strictEqual(roomEcon.resolvedRoomPrices['2026-12'], 200);
  assert.strictEqual(roomEcon.resolvedRoomPrices['2027-01'], 0);
  assert.strictEqual(roomEcon.resolvedRoomPrices['2027-06'], 0);
});

test('Edge Case: Over-allocated months (e.g. 15 months configured)', () => {
  const tiers: RoomTier[] = [
    { id: '1', name: 'Venue A', pricePerMonth: 100, monthsCount: 10 },
    { id: '2', name: 'Venue B', pricePerMonth: 200, monthsCount: 5 },
  ];
  const roomEcon = calculateRoomEconomics(tiers, DEFAULT_MONTHS);
  
  assert.strictEqual(roomEcon.totalAllocatedMonths, 15);
  assert.strictEqual(roomEcon.isAllocationComplete, false);
  assert.strictEqual(roomEcon.overallocatedMonthsCount, 3);
  // Calendar has only 12 months, so 10 * 100 + 2 * 200 = 1000 + 400 = 1400
  assert.strictEqual(roomEcon.totalAnnualRoomExpense, 1400);
});

// ==========================================
// 4. CUSTOM EXPENSE ECONOMICS TESTS
// ==========================================
console.log('\n4. Custom Expense Economics:');

test('Standard recurring and one-off items', () => {
  const expenses: CustomExpense[] = [
    { id: '1', name: 'Google Drive', amount: 10, category: 'recurring', frequency: 'monthly' },
    { id: '2', name: 'Bank Fee', amount: 5, category: 'recurring', frequency: 'monthly' },
    { id: '3', name: 'Contest Trophy', amount: 60, category: 'one-time', frequency: 'one-time' },
  ];
  const expEcon = calculateExpenseEconomics(expenses);
  
  assert.strictEqual(expEcon.totalMonthlyRecurring, 15);
  assert.strictEqual(expEcon.totalAnnualRecurring, 180);
  assert.strictEqual(expEcon.totalAnnualOneTime, 60);
  assert.strictEqual(expEcon.totalAnnualCustomExpenses, 240);
  assert.strictEqual(expEcon.recurringExpenses.length, 2);
  assert.strictEqual(expEcon.oneTimeExpenses.length, 1);
});

test('Edge Case: Empty expenses array', () => {
  const expEcon = calculateExpenseEconomics([]);
  assert.strictEqual(expEcon.totalMonthlyRecurring, 0);
  assert.strictEqual(expEcon.totalAnnualRecurring, 0);
  assert.strictEqual(expEcon.totalAnnualOneTime, 0);
  assert.strictEqual(expEcon.totalAnnualCustomExpenses, 0);
});

// ==========================================
// 5. BREAK-EVEN ANALYSIS TESTS
// ==========================================
console.log('\n5. Break-Even & Sensitivity Analysis:');

test('Standard solvable break-even', () => {
  // Fixed costs: 2445.88 €, monthly fee 20 €, TM unit fee 12.4236 € -> net annual margin per member = 90.9168 €
  const be = calculateBreakEvenAnalysis(2445.88, 20, 12.4236, 22);
  assert.strictEqual(be.isBreakEvenAchievable, true);
  // 2445.88 / 90.9168 = 26.902388...
  assert.strictEqual(Number(be.breakEvenFullMembersNeeded!.toFixed(2)), 26.90);
  assert.strictEqual(Number(be.currentMembersSurplus.toFixed(2)), Number((22 - 26.9023888).toFixed(2)));
  assert.ok(be.breakEvenClubFeeNeeded !== null);
  // Fee needed for 22 members: 12.4236 + 2445.88 / (22 * 12) = 12.4236 + 9.2647 = 21.6883 €
  assert.strictEqual(Number(be.breakEvenClubFeeNeeded!.toFixed(2)), 21.69);
});

test('Edge Case: Impossible break-even due to negative margin', () => {
  const be = calculateBreakEvenAnalysis(2000, 10, 12.50, 20);
  assert.strictEqual(be.isBreakEvenAchievable, false);
  assert.strictEqual(be.breakEvenFullMembersNeeded, null);
  assert.ok(be.statusMessage.includes('Negative unit margin'));
});

test('Edge Case: Zero fixed costs', () => {
  const be = calculateBreakEvenAnalysis(0, 20, 12, 15);
  assert.strictEqual(be.isBreakEvenAchievable, true);
  assert.strictEqual(be.breakEvenFullMembersNeeded, 0);
  assert.strictEqual(be.currentMembersSurplus, 15);
});

// ==========================================
// 6. COMPLETE INTEGRATED YEARLY BUDGET TESTS
// ==========================================
console.log('\n6. Integrated Budget Engine & Cash-Flow Projections:');

test('Calculate default state full consistency', () => {
  const summary = calculateYearlyBudget(INITIAL_BUDGET_STATE, DEFAULT_MONTHS);
  
  assert.strictEqual(summary.months.length, 12);
  assert.strictEqual(summary.totalIncome, 19 * 20 * 12); // 4560 €
  
  // Check that sub-domain models are attached and consistent
  assert.strictEqual(summary.roomEconomics.totalAnnualRoomExpense, 2100);
  assert.strictEqual(summary.expenseEconomics.totalAnnualRecurring, (9.99 + 12.00 + 8.00) * 12);
  assert.strictEqual(summary.expenseEconomics.totalAnnualOneTime, 60.00);
  
  // Total expenses = tm pass-through (19 * 12.4236 * 12) + 2100 + (29.99 * 12) + 60
  const expectedTmDues = 19 * calculateTmUnitFeeEUR(12, 0.87, 19) * 12;
  assert.strictEqual(Number(summary.totalTmDuesExpense.toFixed(2)), Number(expectedTmDues.toFixed(2)));
  assert.strictEqual(
    Number(summary.totalExpenses.toFixed(2)), 
    Number((summary.totalTmDuesExpense + summary.totalRoomRentExpense + summary.totalOtherExpenses).toFixed(2))
  );
  assert.strictEqual(
    Number(summary.netProfitLoss.toFixed(2)),
    Number((summary.totalIncome - summary.totalExpenses).toFixed(2))
  );
  
  // Check cumulative cash-flow on the final month matches netProfitLoss
  assert.strictEqual(
    Number(summary.months[11].cumulativeCashFlow.toFixed(2)),
    Number(summary.netProfitLoss.toFixed(2))
  );
});

// ==========================================
// 7. FORMATTERS
// ==========================================
console.log('\n7. Currency & Percentage Formatters:');

test('Format Currency positive, negative, zero', () => {
  assert.strictEqual(formatCurrency(1234.56, '€'), '1.234,56 €');
  assert.strictEqual(formatCurrency(-500, '€'), '-500,00 €');
  assert.strictEqual(formatCurrency(0, '$'), '0,00 $');
});

test('Format Percent', () => {
  assert.strictEqual(formatPercent(45.67, 1), '45,7%');
  assert.strictEqual(formatPercent(100, 0), '100%');
});

// ==========================================
// 8. BREAK-EVEN CURVE & SIMULATION TESTS
// ==========================================
console.log('\n8. Continuous Break-Even Curve & Point Simulation:');

test('Break-even fee calculation for given members: 2400 € fixed, 12 € TM fee, 20 members', () => {
  // F = 12 + 2400 / (20 * 12) = 12 + 10 = 22 €
  const fee = calculateBreakEvenFeeForMembers(20, 2400, 12);
  assert.strictEqual(fee, 22);
});

test('Break-even members needed for given fee: 2400 € fixed, 12 € TM fee, 22 € club fee', () => {
  // Margin = 22 - 12 = 10 €/mo -> 2400 / (10 * 12) = 20 members
  const members = calculateBreakEvenMembersForFee(22, 2400, 12);
  assert.strictEqual(members, 20);
});

test('Break-even members returns null when club fee <= TM pass-through floor', () => {
  assert.strictEqual(calculateBreakEvenMembersForFee(12, 2400, 12), null);
  assert.strictEqual(calculateBreakEvenMembersForFee(10, 2400, 12), null);
});

test('Simulation point calculation: 20 members @ 25 € fee with 2400 € fixed, 12 € TM fee', () => {
  const pt = calculateSimulationPoint(20, 25, 2400, 12);
  // Revenue: 20 * 25 * 12 = 6000 €
  assert.strictEqual(pt.annualRevenue, 6000);
  // TM expense: 20 * 12 * 12 = 2880 €
  // Total expenses: 2880 + 2400 = 5280 €
  assert.strictEqual(pt.annualExpenses, 5280);
  // Net profit: 6000 - 5280 = 720 €
  assert.strictEqual(pt.annualNetProfitLoss, 720);
  assert.strictEqual(pt.monthlyNetProfitLoss, 60);
  assert.strictEqual(pt.unitMarginEUR, 13);
  assert.strictEqual(pt.isSurplus, true);
  assert.strictEqual(pt.breakEvenFeeEUR, 22); // 12 + 2400/(20*12) = 22
});

test('Curve generation returns non-empty array with monotonically decreasing break-even fees', () => {
  const curve = generateBreakEvenCurvePoints(2400, 12.42, 5, 45, 40);
  assert.strictEqual(curve.length, 41);
  assert.ok(curve[0].breakEvenFeeEUR > curve[curve.length - 1].breakEvenFeeEUR);
  // As members -> infinity, fee approaches 12.42
  assert.ok(curve[curve.length - 1].breakEvenFeeEUR > 12.42);
});

// ==========================================
// 9. FORMULA STEP-BY-STEP & LIVE REACTIVITY TESTS
// ==========================================
console.log('\n9. Formula Modal Step-by-Step Live Calculations:');

test('Formula Step A, B, C, D live calculations match expected values for initial state', () => {
  const summary = calculateYearlyBudget(INITIAL_BUDGET_STATE, DEFAULT_MONTHS);

  // Step A: TM Dues
  const tmDues = summary.tmFeeDetails.totalTmFeePerMemberEUR;
  assert.ok(tmDues > 0, 'TM dues should be non-zero');
  assert.strictEqual(Number(tmDues.toFixed(4)), 12.4236);

  // Step B: Net Margin
  const netMargin = summary.memberEconomics.netMarginPerMemberEUR;
  assert.strictEqual(Number(netMargin.toFixed(4)), Number((INITIAL_BUDGET_STATE.monthlyClubFeeEUR - tmDues).toFixed(4)));
  assert.strictEqual(Number(netMargin.toFixed(4)), 7.5764);

  // Step C: Fixed Annual Costs
  const roomCost = summary.roomEconomics.totalAnnualRoomExpense;
  const recurringCost = summary.expenseEconomics.totalAnnualRecurring;
  const oneTimeCost = summary.expenseEconomics.totalAnnualOneTime;
  const fixedAnnualCosts = summary.breakEven.yearlyFixedCosts;
  assert.strictEqual(roomCost, 2100);
  assert.strictEqual(recurringCost, (9.99 + 12.00 + 8.00) * 12); // 359.88
  assert.strictEqual(oneTimeCost, 60);
  assert.strictEqual(fixedAnnualCosts, 2100 + 359.88 + 60); // 2519.88

  // Step D1: Members needed = Fixed Costs / (12 * netMargin)
  const expectedMembersNeeded = fixedAnnualCosts / (12 * netMargin);
  assert.strictEqual(summary.breakEven.isBreakEvenAchievable, true);
  assert.strictEqual(
    Number(summary.breakEven.breakEvenFullMembersNeeded!.toFixed(4)),
    Number(expectedMembersNeeded.toFixed(4))
  );

  // Step D2: Fee needed = TM Dues + [Fixed Costs / (12 * Members)]
  const expectedFeeNeeded = tmDues + (fixedAnnualCosts / (12 * INITIAL_BUDGET_STATE.defaultFullMembers));
  assert.strictEqual(
    Number(summary.breakEven.breakEvenClubFeeNeeded!.toFixed(4)),
    Number(expectedFeeNeeded.toFixed(4))
  );
});

test('Formula calculations reactively update when state inputs change', () => {
  const customState: ClubBudgetState = {
    ...INITIAL_BUDGET_STATE,
    monthlyClubFeeEUR: 28.00,
    defaultFullMembers: 18,
    monthlyTmDuesUSD: 10.00,
    usdToEurRate: 0.90,
    vatRatePercent: 20.0,
    expenses: [
      { id: '1', name: 'Software', category: 'recurring', amount: 20, frequency: 'monthly' },
      { id: '2', name: 'Event', category: 'one-time', amount: 100, frequency: 'one-time' },
    ],
  };

  const summary = calculateYearlyBudget(customState, DEFAULT_MONTHS);

  // TM Dues: 10 * 0.90 * 1.20 = 10.80 €
  assert.strictEqual(summary.tmFeeDetails.totalTmFeePerMemberEUR, 10.80);
  // Net margin: 28.00 - 10.80 = 17.20 €
  assert.strictEqual(summary.memberEconomics.netMarginPerMemberEUR, 17.20);
  // Fixed costs: 2100 + 240 + 100 = 2440 €
  assert.strictEqual(summary.breakEven.yearlyFixedCosts, 2440);
  // Members needed: 2440 / (12 * 17.20) = 2440 / 206.4 = 11.8217...
  assert.strictEqual(Number(summary.breakEven.breakEvenFullMembersNeeded!.toFixed(2)), 11.82);
  // Fee needed: 10.80 + 2440 / (18 * 12) = 10.80 + 11.2963 = 22.096...
  assert.strictEqual(Number(summary.breakEven.breakEvenClubFeeNeeded!.toFixed(2)), 22.10);
});

console.log(`\n🎉 All ${passedTests} / ${totalTests} unit tests passed successfully!\n`);

