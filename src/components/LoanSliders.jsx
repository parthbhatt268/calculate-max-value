import { useState } from 'react';
import { formatINR } from '../lib/formatINR';

function Slider({ label, value, display, min, max, step, onChange, lo, hi }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-0.5">
        <span className="text-[11px] text-blue-700">{label}</span>
        <span className="text-[11px] font-bold text-blue-900 tabular-nums">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-1.5 accent-blue-500 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-blue-300 mt-px">
        <span>{lo}</span><span>{hi}</span>
      </div>
    </div>
  );
}

export default function LoanSliders({ state, onChange, minLoan, maxLoan, emi }) {
  const [open, setOpen] = useState(true);
  const loanAmount = Math.max(minLoan, Math.min(maxLoan, state.housePrice - state.downPayment));

  const summary = [
    formatINR(loanAmount),
    `@ ${state.loanInterestRate.toFixed(2)}%`,
    `${state.loanTenureYears}yr`,
    `EMI ${formatINR(emi)}`,
  ].join(' · ');

  return (
    <div className="border border-blue-200 rounded-md">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between px-2.5 py-2 bg-blue-50
                   hover:bg-blue-100 rounded-md text-left"
      >
        <div className="flex-1 min-w-0 pr-2">
          <span className="text-[11px] font-semibold text-blue-700">Loan</span>
          {!open && (
            <p className="text-[10px] text-blue-400 truncate leading-tight mt-0.5">{summary}</p>
          )}
        </div>
        <span className="text-[10px] text-blue-400 pt-0.5 flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-2.5 pt-2 pb-3 space-y-3" style={{ background: 'oklch(97.7% 0.013 236)' }}>

          <Slider
            label="Loan amount"
            value={loanAmount}
            display={formatINR(loanAmount)}
            min={minLoan} max={maxLoan} step={50000}
            onChange={(v) => onChange({ ...state, downPayment: state.housePrice - parseInt(v) })}
            lo={formatINR(minLoan)} hi={formatINR(maxLoan)}
          />

          <Slider
            label="Rate of interest"
            value={state.loanInterestRate}
            display={`${state.loanInterestRate.toFixed(2)}% p.a.`}
            min={6} max={14} step={0.05}
            onChange={(v) => onChange({ ...state, loanInterestRate: Math.round(parseFloat(v) * 100) / 100 })}
            lo="6%" hi="14%"
          />

          <Slider
            label="Tenure"
            value={state.loanTenureYears}
            display={`${state.loanTenureYears} years`}
            min={5} max={30} step={1}
            onChange={(v) => onChange({ ...state, loanTenureYears: parseInt(v) })}
            lo="5 yr" hi="30 yr"
          />

          <Slider
            label="Extra EMIs / year"
            value={state.extraEMIsPerYear}
            display={state.extraEMIsPerYear === 0 ? 'None' : `${state.extraEMIsPerYear} / yr`}
            min={0} max={12} step={1}
            onChange={(v) => onChange({ ...state, extraEMIsPerYear: parseInt(v) })}
            lo="None" hi="12 / yr"
          />

          <div className="flex items-center justify-between rounded px-2.5 py-2 border border-blue-200 bg-blue-100">
            <span className="text-[10px] text-blue-600 leading-tight">Monthly EMI</span>
            <span className="text-sm font-bold text-blue-900 tabular-nums">{formatINR(emi)}</span>
          </div>

        </div>
      )}
    </div>
  );
}
