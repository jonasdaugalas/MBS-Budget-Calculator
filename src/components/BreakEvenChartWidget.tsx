import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Target, Users, Euro, Minus, Plus, HelpCircle, TrendingUp } from 'lucide-react';
import { ClubBudgetState, YearlyBudgetSummary } from '../types';
import { 
  calculateBreakEvenFeeForMembers, 
  calculateBreakEvenMembersForFee
} from '../utils/budgetCalculator';
import { NumericInput } from './NumericInput';
import { FormulaModal } from './FormulaModal';

interface BreakEvenChartWidgetProps {
  state: ClubBudgetState;
  summary: YearlyBudgetSummary;
  onChange: (updates: Partial<ClubBudgetState>) => void;
}

export const BreakEvenChartWidget: React.FC<BreakEvenChartWidgetProps> = ({
  state,
  summary,
  onChange,
}) => {
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Core economics parameters
  const { tmFeeDetails, roomEconomics, expenseEconomics } = summary;
  const yearlyFixedCosts = roomEconomics.totalAnnualRoomExpense + expenseEconomics.totalAnnualCustomExpenses;
  const tmPassThroughFee = tmFeeDetails.totalTmFeePerMemberEUR;

  // Chart visualization domain: standard [10, 30] range for chart display
  const domain = useMemo(() => ({
    minMembers: 10,
    maxMembers: 30,
    minFee: 10,
    maxFee: 30,
    memberTicks: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
    memberMajorLabels: [10, 15, 20, 25, 30],
    feeTicks: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
    feeMajorLabels: [10, 15, 20, 25, 30],
  }), []);

  // SVG Dimensions & Margins - Generous room for axis titles & numbers without overlap
  const svgWidth = 840;
  const svgHeight = 450;
  const padding = { top: 24, right: 28, bottom: 68, left: 105 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Coordinate conversion helpers for visualization
  const getX = useCallback((members: number) => {
    const clamped = Math.max(domain.minMembers, Math.min(domain.maxMembers, members));
    const ratio = (clamped - domain.minMembers) / (domain.maxMembers - domain.minMembers);
    return padding.left + ratio * plotWidth;
  }, [domain, padding.left, plotWidth]);

  const getY = useCallback((fee: number) => {
    const clamped = Math.max(domain.minFee, Math.min(domain.maxFee, fee));
    const ratio = (clamped - domain.minFee) / (domain.maxFee - domain.minFee);
    return padding.top + plotHeight - ratio * plotHeight; // SVG Y is inverted
  }, [domain, padding.top, plotHeight]);

  // Current uncapped inputs from state
  const currentMembers = state.defaultFullMembers;
  const currentFee = state.monthlyClubFeeEUR;

  // 1. Break-even fee at selected members (derived dynamically)
  const beFeeAtCurrentMembers = calculateBreakEvenFeeForMembers(currentMembers, yearlyFixedCosts, tmPassThroughFee);

  // 2. Break-even members at selected fee (derived dynamically)
  const beMembersAtCurrentFee = calculateBreakEvenMembersForFee(currentFee, yearlyFixedCosts, tmPassThroughFee);

  // Visibility checks within [10, 30] visualization limits
  const isActualPointVisible = 
    currentMembers >= domain.minMembers && 
    currentMembers <= domain.maxMembers && 
    currentFee >= domain.minFee && 
    currentFee <= domain.maxFee;

  const isFeeOnCurveVisible = beFeeAtCurrentMembers >= domain.minFee && beFeeAtCurrentMembers <= domain.maxFee && currentMembers >= domain.minMembers && currentMembers <= domain.maxMembers;
  const isMembersOnCurveVisible = beMembersAtCurrentFee !== null && beMembersAtCurrentFee >= domain.minMembers && beMembersAtCurrentFee <= domain.maxMembers && currentFee >= domain.minFee && currentFee <= domain.maxFee;

  // Generate continuous curve points for the visualization domain
  const curvePoints = useMemo(() => {
    const points: { x: number; y: number; members: number; breakEvenFee: number }[] = [];
    const steps = 100;
    const stepSize = (domain.maxMembers - domain.minMembers) / steps;

    for (let i = 0; i <= steps; i++) {
      const m = domain.minMembers + i * stepSize;
      const beFee = calculateBreakEvenFeeForMembers(m, yearlyFixedCosts, tmPassThroughFee);
      const clampedFee = Math.max(domain.minFee, Math.min(domain.maxFee, beFee));
      points.push({
        x: getX(m),
        y: getY(clampedFee),
        members: m,
        breakEvenFee: beFee,
      });
    }
    return points;
  }, [domain, tmPassThroughFee, yearlyFixedCosts, getX, getY]);

  // Construct SVG Area paths
  const { curvePathD, lossAreaPathD, gainAreaPathD } = useMemo(() => {
    if (curvePoints.length === 0) return { curvePathD: '', lossAreaPathD: '', gainAreaPathD: '' };

    const first = curvePoints[0];
    const last = curvePoints[curvePoints.length - 1];

    const curveD = curvePoints.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }, '');

    const bottomY = padding.top + plotHeight;
    const lossD = `${curveD} L ${last.x.toFixed(1)} ${bottomY.toFixed(1)} L ${first.x.toFixed(1)} ${bottomY.toFixed(1)} Z`;

    const topY = padding.top;
    const gainD = `${curveD} L ${last.x.toFixed(1)} ${topY.toFixed(1)} L ${first.x.toFixed(1)} ${topY.toFixed(1)} Z`;

    return {
      curvePathD: curveD,
      lossAreaPathD: lossD,
      gainAreaPathD: gainD,
    };
  }, [curvePoints, padding.top, plotHeight]);

  // Coordinates for visualization
  const actualX = getX(currentMembers);
  const actualY = getY(currentFee);

  const ptFeeOnCurveX = actualX;
  const ptFeeOnCurveY = getY(beFeeAtCurrentMembers);

  const ptMembersOnCurveX = beMembersAtCurrentFee !== null ? getX(beMembersAtCurrentFee) : actualX;
  const ptMembersOnCurveY = actualY;

  const isSurplus = summary.netProfitLoss >= 0;

  return (
    <div id="widget-break-even-chart" className="space-y-2 sm:space-y-3">
      {/* ================= HERO INTERACTIVE SVG CHART (STANDALONE) ================= */}
      <div className="w-full bg-white border border-neutral-300 rounded-lg sm:rounded-xl overflow-hidden shadow-3xs select-none">
        {/* Dedicated Header Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 sm:px-4 sm:py-2.5 border-b border-neutral-200 bg-neutral-50/90">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
            </div>
            <h2 className="text-xs sm:text-sm font-black text-neutral-950 uppercase tracking-wider font-display leading-none">
              Break-even chart
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsFormulaModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-800 hover:text-neutral-950 border border-neutral-300 hover:border-neutral-900 rounded-md text-[11px] sm:text-xs font-black uppercase tracking-wider font-display shadow-2xs transition cursor-pointer active:scale-95 shrink-0"
            title="View break-even formulas"
          >
            <HelpCircle className="w-3.5 h-3.5 text-neutral-700" />
            <span>Formulas</span>
          </button>
        </div>

        <div className="w-full p-1 sm:p-2">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto block select-none font-mono-numbers"
            role="img"
            aria-label="Interactive Break-Even Chart"
          >
              <defs>
                {/* Growth Gradient */}
                <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.06" />
                </linearGradient>

                {/* Loss Gradient */}
                <linearGradient id="lossFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.25" />
                </linearGradient>

                {/* Unrounded Clip Path */}
                <clipPath id="chartClip">
                  <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} />
                </clipPath>
              </defs>

              {/* ================= CLIPPED PLOT AREA ================= */}
              <g clipPath="url(#chartClip)">
                {/* Gain Area */}
                <path d={gainAreaPathD} fill="url(#growthFill)" />

                {/* Loss Area */}
                <path d={lossAreaPathD} fill="url(#lossFill)" />

                {/* THE CONTINUOUS BREAK-EVEN LINE */}
                <path
                  d={curvePathD}
                  fill="none"
                  stroke="#09090b"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Zone Labels */}
                <text
                  x={padding.left + plotWidth - 18}
                  y={padding.top + 32}
                  textAnchor="end"
                  fontSize="22"
                  fontWeight="900"
                  fill="#065f46"
                  className="uppercase font-display opacity-90 select-none tracking-wider"
                >
                  ▲ Net Surplus
                </text>
                <text
                  x={padding.left + 18}
                  y={padding.top + plotHeight - 18}
                  textAnchor="start"
                  fontSize="22"
                  fontWeight="900"
                  fill="#9f1239"
                  className="uppercase font-display opacity-90 select-none tracking-wider"
                >
                  ▼ Net Deficit
                </text>

                {/* ================= PROJECTION LINES ================= */}
                {/* 1. Blue dashed vertical line */}
                <line
                  x1={actualX}
                  y1={padding.top + plotHeight}
                  x2={actualX}
                  y2={isFeeOnCurveVisible ? Math.min(actualY, ptFeeOnCurveY) : actualY}
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  strokeDasharray="6 5"
                />

                {/* 2. Purple dashed horizontal line */}
                <line
                  x1={padding.left}
                  y1={actualY}
                  x2={isMembersOnCurveVisible ? Math.max(actualX, ptMembersOnCurveX) : actualX}
                  y2={actualY}
                  stroke="#7c3aed"
                  strokeWidth="3.5"
                  strokeDasharray="6 5"
                />

                {/* ================= POINT 2: BREAK-EVEN FEE AT SELECTED MEMBERS (SQUARE) ================= */}
                {isFeeOnCurveVisible && (
                  <g>
                    {/* Outer glow square */}
                    <rect
                      x={ptFeeOnCurveX - 14}
                      y={ptFeeOnCurveY - 14}
                      width="28"
                      height="28"
                      fill="#2563eb"
                      fillOpacity="0.25"
                    />
                    {/* Main Square Marker */}
                    <rect
                      x={ptFeeOnCurveX - 9}
                      y={ptFeeOnCurveY - 9}
                      width="18"
                      height="18"
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth="3"
                    />
                  </g>
                )}

                {/* ================= POINT 3: BREAK-EVEN MEMBERS AT SELECTED FEE (TRIANGLE) ================= */}
                {isMembersOnCurveVisible && beMembersAtCurrentFee !== null && (
                  <g>
                    {/* Outer glow triangle */}
                    <polygon
                      points={`${ptMembersOnCurveX},${ptMembersOnCurveY - 17} ${ptMembersOnCurveX + 15},${ptMembersOnCurveY + 12} ${ptMembersOnCurveX - 15},${ptMembersOnCurveY + 12}`}
                      fill="#7c3aed"
                      fillOpacity="0.3"
                    />
                    {/* Main Triangle Marker */}
                    <polygon
                      points={`${ptMembersOnCurveX},${ptMembersOnCurveY - 12} ${ptMembersOnCurveX + 10},${ptMembersOnCurveY + 8} ${ptMembersOnCurveX - 10},${ptMembersOnCurveY + 8}`}
                      fill="#7c3aed"
                      stroke="#ffffff"
                      strokeWidth="3"
                    />
                  </g>
                )}

                {/* ================= POINT 1: ACTUAL SELECTED POINT (DIAMOND) ================= */}
                <g>
                  {/* Outer glow diamond */}
                  <polygon
                    points={`${actualX},${actualY - 20} ${actualX + 20},${actualY} ${actualX},${actualY + 20} ${actualX - 20},${actualY}`}
                    fill={isSurplus ? '#10b981' : '#f43f5e'}
                    fillOpacity="0.35"
                  />
                  {/* Main Diamond Marker */}
                  <polygon
                    points={`${actualX},${actualY - 13} ${actualX + 13},${actualY} ${actualX},${actualY + 13} ${actualX - 13},${actualY}`}
                    fill={isSurplus ? '#059669' : '#e11d48'}
                    stroke="#ffffff"
                    strokeWidth="3.5"
                  />
                  {/* Center Dot */}
                  <circle
                    cx={actualX}
                    cy={actualY}
                    r="3.5"
                    fill="#ffffff"
                  />
                </g>

              </g>

              {/* Plot Border (Unrounded) */}
              <rect
                x={padding.left}
                y={padding.top}
                width={plotWidth}
                height={plotHeight}
                fill="none"
                stroke="#18181b"
                strokeWidth="2.5"
              />

              {/* ================= AXIS LABELS & TICKS ================= */}
              {/* Y Ticks */}
              {domain.feeTicks.map((f) => {
                const y = getY(f);
                const isMajor = f % 5 === 0;
                return (
                  <g key={`y-tick-${f}`} className="select-none">
                    <line
                      x1={padding.left - (isMajor ? 8 : 5)}
                      y1={y}
                      x2={padding.left}
                      y2={y}
                      stroke="#09090b"
                      strokeWidth={isMajor ? 2.5 : 1.5}
                    />
                    {isMajor && (
                      <text 
                        x={padding.left - 12} 
                        y={y + 6} 
                        textAnchor="end" 
                        fontSize="18" 
                        fontWeight="900" 
                        fill="#09090b"
                      >
                        {f} €
                      </text>
                    )}
                  </g>
                );
              })}

              {/* X Ticks */}
              {domain.memberTicks.map((m) => {
                const x = getX(m);
                const isMajor = m % 5 === 0;
                return (
                  <g key={`x-tick-${m}`} className="select-none">
                    <line
                      x1={x}
                      y1={padding.top + plotHeight}
                      x2={x}
                      y2={padding.top + plotHeight + (isMajor ? 8 : 5)}
                      stroke="#09090b"
                      strokeWidth={isMajor ? 2.5 : 1.5}
                    />
                    {isMajor && (
                      <text 
                        x={x} 
                        y={padding.top + plotHeight + 24} 
                        textAnchor="middle" 
                        fontSize="18" 
                        fontWeight="900" 
                        fill="#09090b"
                      >
                        {m}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Y Axis Title - Non-overlapping with numbers */}
              <text
                x={-padding.top - plotHeight / 2}
                y={26}
                transform="rotate(-90)"
                textAnchor="middle"
                fontSize="15"
                fontWeight="900"
                fill="#09090b"
                letterSpacing="0.08em"
                className="uppercase font-display select-none"
              >
                Monthly Fee (€ / mo)
              </text>

              {/* X Axis Title - Non-overlapping with ticks */}
              <text
                x={padding.left + plotWidth / 2}
                y={svgHeight - 12}
                textAnchor="middle"
                fontSize="15"
                fontWeight="900"
                fill="#09090b"
                letterSpacing="0.08em"
                className="uppercase font-display select-none"
              >
                Paying Members Count
              </text>

            </svg>
          </div>
        </div>

      {/* ================= DIRECT INPUT CONTROLS (PROMINENT, BIGGER, NEUTRAL HIGH-CONTRAST, OWN ROWS ON TABLET & MOBILE) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-4">
        
        {/* Members Input Widget */}
        <div className="bg-white hover:bg-neutral-50/80 px-3 py-2.5 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl border-2 border-neutral-900 hover:border-black shadow-sm flex items-center justify-between gap-2 min-h-[64px] sm:min-h-[72px] transition">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-black shrink-0 shadow-3xs">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <label htmlFor="direct-input-members" className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-neutral-950 font-display cursor-pointer block truncate whitespace-nowrap">
                Members
              </label>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onChange({ defaultFullMembers: Math.max(0, currentMembers - 1) })}
              disabled={currentMembers <= 0}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-neutral-300 rounded-lg sm:rounded-xl font-black text-neutral-950 cursor-pointer transition shadow-3xs active:scale-95 shrink-0"
              title="Decrease members by 1"
            >
              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>

            <div className="relative shrink-0">
              <NumericInput
                id="direct-input-members"
                value={currentMembers}
                onValueChange={(val) => onChange({ defaultFullMembers: Math.max(0, val) })}
                min={0}
                fallbackValue={0}
                className="w-16 sm:w-24 md:w-28 bg-white border-2 border-neutral-900 hover:border-black focus:border-black rounded-lg sm:rounded-xl px-1 py-1 sm:py-1.5 text-center font-black font-mono-numbers text-base sm:text-xl md:text-2xl text-neutral-950 focus:outline-none transition shadow-inner"
              />
            </div>

            <button
              type="button"
              onClick={() => onChange({ defaultFullMembers: currentMembers + 1 })}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 border-2 border-neutral-300 rounded-lg sm:rounded-xl font-black text-neutral-950 cursor-pointer transition shadow-3xs active:scale-95 shrink-0"
              title="Increase members by 1"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Monthly Fee Input Widget */}
        <div className="bg-white hover:bg-neutral-50/80 px-3 py-2.5 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl border-2 border-neutral-900 hover:border-black shadow-sm flex items-center justify-between gap-2 min-h-[64px] sm:min-h-[72px] transition">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-black shrink-0 shadow-3xs">
              <Euro className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <label htmlFor="direct-input-fee" className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-neutral-950 font-display cursor-pointer block truncate whitespace-nowrap">
                Monthly Fee
              </label>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onChange({ monthlyClubFeeEUR: Math.max(0, Number((currentFee - 0.5).toFixed(2))) })}
              disabled={currentFee <= 0}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-neutral-300 rounded-lg sm:rounded-xl font-black text-neutral-950 cursor-pointer transition shadow-3xs active:scale-95 shrink-0"
              title="Decrease fee by 0.50 €"
            >
              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>

            <div className="relative shrink-0">
              <NumericInput
                id="direct-input-fee"
                value={currentFee}
                onValueChange={(val) => onChange({ monthlyClubFeeEUR: Math.max(0, val) })}
                min={0}
                decimals={2}
                fallbackValue={0}
                className="w-16 sm:w-24 md:w-28 bg-white border-2 border-neutral-900 hover:border-black focus:border-black rounded-lg sm:rounded-xl px-1 py-1 sm:py-1.5 text-center font-black font-mono-numbers text-base sm:text-xl md:text-2xl text-neutral-950 focus:outline-none transition shadow-inner"
              />
            </div>

            <button
              type="button"
              onClick={() => onChange({ monthlyClubFeeEUR: Number((currentFee + 0.5).toFixed(2)) })}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 border-2 border-neutral-300 rounded-lg sm:rounded-xl font-black text-neutral-950 cursor-pointer transition shadow-3xs active:scale-95 shrink-0"
              title="Increase fee by 0.50 €"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

      </div>

      {/* Formula Explainer Modal Pop-Up */}
      <FormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        state={state}
        summary={summary}
      />
    </div>
  );
};

