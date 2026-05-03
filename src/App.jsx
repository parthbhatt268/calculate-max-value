import { useState, useMemo, useCallback, useEffect } from "react";
import InputsPanel from "./components/InputsPanel";
import LoanSliders from "./components/LoanSliders";
import CashFlowSliders from "./components/CashFlowSliders";
import SIPSection from "./components/SIPSection";
import SensitivitySliders from "./components/SensitivitySliders";
import OutputSummary from "./components/OutputSummary";
import LoanTimeline from "./components/LoanTimeline";
import NetWorthChart from "./components/NetWorthChart";
import CashFlowChart from "./components/CashFlowChart";
import SweetSpots from "./components/SweetSpots";
import { simulate } from "./lib/simulate";
import { findSweetSpots } from "./lib/sweetSpots";

const DEFAULTS = {
  housePrice: 15000000,
  miscCosts: 2000000,
  liquidSavings: 6500000,

  loanInterestRate: 7.5,
  loanTenureYears: 30,
  maxLTV: 0.9,

  monthlyIncome: 200000,
  monthlyExpenses: 50000,
  incomeStepUpRate: 0.08,
  expensesStepUpRate: 0.06,

  equityReturn: 0.12,
  inflation: 0.06,
  realEstateAppreciation: 0.04,

  extraEMIsPerYear: 0,
  prepayFraction: 0,

  horizonYears: 30,
};

function computeDownPaymentBounds(state) {
  const { housePrice, liquidSavings, miscCosts, maxLTV } = state;
  const minDown = housePrice * (1 - maxLTV);
  const maxAvail = liquidSavings - miscCosts;
  const maxDown = Math.min(Math.max(maxAvail, minDown), housePrice);
  return { minDown, maxDown };
}

function clampDownPayment(state) {
  const { minDown, maxDown } = computeDownPaymentBounds(state);
  const clamped = Math.min(
    Math.max(state.downPayment ?? minDown, minDown),
    maxDown,
  );
  return { ...state, downPayment: clamped };
}

function initState() {
  const { maxDown } = computeDownPaymentBounds(DEFAULTS);
  return clampDownPayment({ ...DEFAULTS, downPayment: maxDown });
}

export default function App() {
  const [state, setState] = useState(initState);
  const [nominalMode, setNominalMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(true);

  useEffect(() => {
    if (!summaryOpen) return;
    const t = setTimeout(() => setSummaryOpen(false), 30_000);
    return () => clearTimeout(t);
  }, [summaryOpen]);

  const handleStateChange = useCallback((nextState) => {
    setState(clampDownPayment(nextState));
  }, []);

  const { minDown, maxDown } = useMemo(
    () => computeDownPaymentBounds(state),
    [state.housePrice, state.liquidSavings, state.miscCosts, state.maxLTV],
  );

  const minLoan = Math.max(0, state.housePrice - maxDown);
  const maxLoan = state.housePrice - minDown;

  const result = useMemo(() => simulate(state), [state]);
  const { history, summary } = result;

  // Sweet spots: recompute only when "fixed" parameters change, not when strategy levers change
  const sweetSpotsResult = useMemo(
    () => findSweetSpots(state),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      state.housePrice,
      state.miscCosts,
      state.liquidSavings,
      state.maxLTV,
      state.loanInterestRate,
      state.monthlyIncome,
      state.monthlyExpenses,
      state.incomeStepUpRate,
      state.expensesStepUpRate,
      state.equityReturn,
      state.inflation,
      state.realEstateAppreciation,
      state.horizonYears,
    ],
  );

  // Apply a sweet-spot card's variable settings to the current state
  const handleApplySweetSpot = useCallback(
    (spot) => {
      handleStateChange({
        ...state,
        downPayment: state.housePrice - spot.loanAmount,
        loanTenureYears: spot.tenure,
        extraEMIsPerYear: spot.extraEMIsPerYear,
        prepayFraction: spot.prepayFraction,
      });
    },
    [state, handleStateChange],
  );

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden bg-white text-gray-900"
      style={{ fontFamily: "system-ui,-apple-system,sans-serif" }}
    >
      <header className="flex-shrink-0 flex items-center px-3 h-9 border-b border-gray-200 bg-white gap-2.5">
        {/* Sidebar toggle */}
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100
                     text-gray-500 hover:text-gray-800 transition-colors shrink-0"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <span className="text-[13px] leading-none">✕</span>
          ) : (
            <span className="text-[15px] leading-none">☰</span>
          )}
        </button>

        <h1 className="text-sm font-semibold text-gray-800 tracking-tight">
          Home Loan Strategy Explorer
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* ── Mobile backdrop ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* ── LEFT: controls ── */}
        <div
          className={[
            // Mobile: fixed overlay sliding from left, below the 36px header
            "fixed top-9 bottom-0 left-0 z-40 w-[300px]",
            "transition-transform duration-200 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            // Desktop (md+): static in the flex layout
            "md:static md:z-auto md:translate-x-0 md:w-[330px] md:flex-shrink-0",
            !sidebarOpen ? "md:hidden" : "",
            "border-r border-gray-200 overflow-y-auto",
            "flex flex-col gap-2 p-2.5 bg-white",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <InputsPanel state={state} onChange={handleStateChange} />

          <LoanSliders
            state={state}
            onChange={handleStateChange}
            minLoan={minLoan}
            maxLoan={maxLoan}
            emi={summary?.emi ?? 0}
          />

          <CashFlowSliders
            state={state}
            onChange={handleStateChange}
            emi={summary?.emi ?? 0}
          />

          <SIPSection
            state={state}
            onChange={handleStateChange}
            summary={summary}
          />

          <SensitivitySliders state={state} onChange={handleStateChange} />
        </div>

        {/* ── RIGHT: output + charts ── */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 p-2.5 bg-gray-50">
          {/* Sweet spots — top of the right panel */}
          <SweetSpots
            result={sweetSpotsResult}
            nominalMode={nominalMode}
            onApply={handleApplySweetSpot}
          />

          {summaryOpen ? (
            <OutputSummary
              summary={summary}
              nominalMode={nominalMode}
              onToggle={setNominalMode}
            />
          ) : (
            <button
              onClick={() => setSummaryOpen(true)}
              className="self-start text-[10px] text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full px-2.5 py-0.5 bg-white transition-colors"
            >
              Show output summary
            </button>
          )}

          <LoanTimeline
            loanCloseMonth={summary?.loanCloseMonth}
            loanCloseYear={summary?.loanCloseYear}
            horizonYears={state.horizonYears}
            totalInterestPaid={summary?.totalInterestPaid ?? 0}
          />

          <NetWorthChart history={history} nominalMode={nominalMode} />

          <CashFlowChart history={history} horizonYears={state.horizonYears} />
        </div>
      </div>
    </div>
  );
}
