import { useState, useMemo, useCallback } from 'react';
import InputsPanel       from './components/InputsPanel';
import LoanSliders       from './components/LoanSliders';
import CashFlowSliders   from './components/CashFlowSliders';
import SIPSection        from './components/SIPSection';
import SensitivitySliders from './components/SensitivitySliders';
import OutputSummary     from './components/OutputSummary';
import LoanTimeline      from './components/LoanTimeline';
import NetWorthChart     from './components/NetWorthChart';
import CashFlowChart     from './components/CashFlowChart';
import { simulate }      from './lib/simulate';

const DEFAULTS = {
  housePrice:             13000000,
  miscCosts:               2000000,
  liquidSavings:           6500000,

  loanInterestRate:            9.0,
  loanTenureYears:              30,
  maxLTV:                     0.90,

  monthlyIncome:           200000,
  monthlyExpenses:          50000,
  incomeStepUpRate:          0.08,
  expensesStepUpRate:        0.06,

  equityReturn:              0.12,
  inflation:                 0.06,
  realEstateAppreciation:    0.04,

  extraEMIsPerYear:             0,

  horizonYears:                30,
};

function computeDownPaymentBounds(state) {
  const { housePrice, liquidSavings, miscCosts, maxLTV } = state;
  const minDown  = housePrice * (1 - maxLTV);
  const maxAvail = liquidSavings - miscCosts;
  const maxDown  = Math.min(Math.max(maxAvail, minDown), housePrice);
  return { minDown, maxDown };
}

function clampDownPayment(state) {
  const { minDown, maxDown } = computeDownPaymentBounds(state);
  const clamped = Math.min(Math.max(state.downPayment ?? minDown, minDown), maxDown);
  return { ...state, downPayment: clamped };
}

function initState() {
  const { maxDown } = computeDownPaymentBounds(DEFAULTS);
  return clampDownPayment({ ...DEFAULTS, downPayment: maxDown });
}

export default function App() {
  const [state, setState]             = useState(initState);
  const [nominalMode, setNominalMode] = useState(true);

  const handleStateChange = useCallback((nextState) => {
    setState(clampDownPayment(nextState));
  }, []);

  const { minDown, maxDown } = useMemo(
    () => computeDownPaymentBounds(state),
    [state.housePrice, state.liquidSavings, state.miscCosts, state.maxLTV],
  );

  // Loan amount slider bounds
  const minLoan = Math.max(0, state.housePrice - maxDown);
  const maxLoan = state.housePrice - minDown;

  const result = useMemo(() => simulate(state), [state]);
  const { history, summary } = result;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white text-gray-900"
         style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      <header className="flex-shrink-0 flex items-center px-4 h-9 border-b border-gray-200 bg-white">
        <h1 className="text-sm font-semibold text-gray-800 tracking-tight">
          Home Loan Strategy Explorer
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: controls ── */}
        <div className="w-[330px] flex-shrink-0 border-r border-gray-200 overflow-y-auto
                        flex flex-col gap-2 p-2.5 bg-white">

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

          <OutputSummary
            summary={summary}
            nominalMode={nominalMode}
            onToggle={setNominalMode}
          />

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
