import { useState } from 'react';
import { formatINR } from '../lib/formatINR';

/* ── compact numeric field ── */
function Field({ label, value, onChange, isPercent = false, step = 1, min, max, suffix = '' }) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw]         = useState('');

  function displayValue() {
    if (isPercent) return `${value}${suffix || '%'}`;
    return formatINR(value);
  }

  function handleFocus() {
    setEditing(true);
    setRaw(String(value));
  }

  function handleBlur() {
    setEditing(false);
    const parsed = parseFloat(raw.replace(/,/g, ''));
    if (!isNaN(parsed)) {
      const v = (min !== undefined && max !== undefined)
        ? Math.min(Math.max(parsed, min), max)
        : parsed;
      onChange(v);
    }
  }

  return (
    <div className="flex flex-col gap-px">
      <span className="text-[10px] text-gray-400 leading-tight truncate">{label}</span>
      <input
        type={editing ? 'number' : 'text'}
        value={editing ? raw : displayValue()}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(e) => setRaw(e.target.value)}
        step={step}
        min={min}
        max={max}
        className="h-6 px-1.5 text-xs border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-400 w-full tabular-nums"
      />
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="col-span-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 pt-1">
      {children}
    </div>
  );
}

export default function InputsPanel({ state, onChange }) {
  const [open, setOpen] = useState(false);

  function set(key) {
    return (val) => onChange({ ...state, [key]: val });
  }

  const loanAmount = Math.max(0, state.housePrice - state.downPayment);

  const summary = [
    formatINR(state.housePrice),
    `${formatINR(loanAmount)} loan`,
    `${state.loanInterestRate.toFixed(1)}%`,
    `${state.loanTenureYears} yr`,
    `${formatINR(state.monthlyIncome)}/mo`,
  ].join(' · ');

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {/* Collapsed header / toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-left"
      >
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-gray-700">Inputs</span>
          {!open && (
            <p className="text-[10px] text-gray-400 truncate leading-tight mt-px">{summary}</p>
          )}
        </div>
        <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {/* Expanded grid */}
      {open && (
        <div className="px-2.5 pb-2.5 pt-1.5 grid grid-cols-3 gap-x-2 gap-y-1.5">

          <SectionLabel>Property &amp; savings</SectionLabel>
          <Field label="House price" value={state.housePrice} onChange={set('housePrice')} step={100000} min={1000000} />
          <Field label="Misc costs" value={state.miscCosts} onChange={set('miscCosts')} step={100000} min={0} />
          <Field label="Liquid savings" value={state.liquidSavings} onChange={set('liquidSavings')} step={100000} min={0} />
          <Field label="Emergency fund" value={state.emergencyFund} onChange={set('emergencyFund')} step={50000} min={0} />

          <SectionLabel>Loan</SectionLabel>
          <Field label="Interest rate %" value={state.loanInterestRate} onChange={set('loanInterestRate')}
                 isPercent step={0.05} min={1} max={20} />
          <Field label="Tenure (yr)" value={state.loanTenureYears}
                 onChange={(v) => set('loanTenureYears')(Math.round(v))}
                 isPercent suffix=" yr" step={1} min={1} max={30} />
          <Field label="Max LTV %" value={Math.round(state.maxLTV * 100)}
                 onChange={(v) => set('maxLTV')(v / 100)}
                 isPercent step={1} min={50} max={90} />

          <SectionLabel>Cash flow</SectionLabel>
          <Field label="Income/mo" value={state.monthlyIncome} onChange={set('monthlyIncome')} step={10000} min={0} />
          <Field label="Expenses/mo" value={state.monthlyExpenses} onChange={set('monthlyExpenses')} step={5000} min={0} />
          <Field label="Income step-up %" value={+(state.incomeStepUpRate * 100).toFixed(1)}
                 onChange={(v) => set('incomeStepUpRate')(v / 100)}
                 isPercent step={0.5} min={0} max={30} />
          <Field label="Expense step-up %" value={+(state.expensesStepUpRate * 100).toFixed(1)}
                 onChange={(v) => set('expensesStepUpRate')(v / 100)}
                 isPercent step={0.5} min={0} max={30} />

          <SectionLabel>Market &amp; horizon</SectionLabel>
          <Field label="Equity return %" value={+(state.equityReturn * 100).toFixed(1)}
                 onChange={(v) => set('equityReturn')(v / 100)}
                 isPercent step={0.5} min={0} max={30} />
          <Field label="Inflation %" value={+(state.inflation * 100).toFixed(1)}
                 onChange={(v) => set('inflation')(v / 100)}
                 isPercent step={0.5} min={0} max={20} />
          <Field label="RE apprec. %" value={+(state.realEstateAppreciation * 100).toFixed(1)}
                 onChange={(v) => set('realEstateAppreciation')(v / 100)}
                 isPercent step={0.5} min={0} max={20} />
          {/* Horizon as inline number field, spanning full row */}
          <div className="col-span-3 flex items-center gap-2 pt-0.5">
            <span className="text-[10px] text-gray-400 shrink-0">Horizon</span>
            <input
              type="range"
              min={5} max={40} step={1}
              value={state.horizonYears}
              onChange={(e) => set('horizonYears')(parseInt(e.target.value))}
              className="flex-1 accent-indigo-600 h-1"
            />
            <span className="text-[11px] font-medium text-gray-700 tabular-nums w-10 text-right shrink-0">
              {state.horizonYears} yr
            </span>
          </div>

        </div>
      )}
    </div>
  );
}
