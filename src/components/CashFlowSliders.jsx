import { useState } from 'react';
import { formatINR } from '../lib/formatINR';

function Slider({ label, value, display, min, max, step, onChange, lo, hi }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-0.5">
        <span className="text-[11px] text-emerald-700">{label}</span>
        <span className="text-[11px] font-bold text-emerald-900 tabular-nums">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-1.5 accent-emerald-500 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-emerald-300 mt-px">
        <span>{lo}</span><span>{hi}</span>
      </div>
    </div>
  );
}

export default function CashFlowSliders({ state, onChange, emi }) {
  const [open, setOpen] = useState(true);
  const surplus = Math.max(0, state.monthlyIncome - state.monthlyExpenses - emi);

  const summary = [
    `${formatINR(state.monthlyIncome)} income`,
    `${formatINR(state.monthlyExpenses)} exp`,
    `${formatINR(surplus)} SIP`,
  ].join(' · ');

  return (
    <div className="border border-emerald-200 rounded-md">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between px-2.5 py-2 bg-emerald-50
                   hover:bg-emerald-100 rounded-md text-left"
      >
        <div className="flex-1 min-w-0 pr-2">
          <span className="text-[11px] font-semibold text-emerald-700">Cash Flow</span>
          {!open && (
            <p className="text-[10px] text-emerald-400 truncate leading-tight mt-0.5">{summary}</p>
          )}
        </div>
        <span className="text-[10px] text-emerald-400 pt-0.5 flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-2.5 pt-2 pb-3 space-y-3" style={{ background: 'oklch(97.3% 0.021 155)' }}>

          <Slider
            label="Monthly income"
            value={state.monthlyIncome}
            display={formatINR(state.monthlyIncome)}
            min={50000} max={1000000} step={10000}
            onChange={(v) => onChange({ ...state, monthlyIncome: parseInt(v) })}
            lo="₹50 K" hi="₹10 L"
          />

          <Slider
            label="Income step-up"
            value={Math.round(state.incomeStepUpRate * 100)}
            display={`${Math.round(state.incomeStepUpRate * 100)}% / yr`}
            min={0} max={20} step={1}
            onChange={(v) => onChange({ ...state, incomeStepUpRate: parseInt(v) / 100 })}
            lo="0%" hi="20%"
          />

          <Slider
            label="Monthly expenses"
            value={state.monthlyExpenses}
            display={formatINR(state.monthlyExpenses)}
            min={0} max={500000} step={5000}
            onChange={(v) => onChange({ ...state, monthlyExpenses: parseInt(v) })}
            lo="₹0" hi="₹5 L"
          />

          <Slider
            label="Expense step-up"
            value={Math.round(state.expensesStepUpRate * 100)}
            display={`${Math.round(state.expensesStepUpRate * 100)}% / yr`}
            min={0} max={15} step={1}
            onChange={(v) => onChange({ ...state, expensesStepUpRate: parseInt(v) / 100 })}
            lo="0%" hi="15%"
          />

          <div className="rounded px-2.5 py-2 border border-emerald-200 bg-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-600 block leading-tight">
                  Surplus → SIP (yr 1)
                </span>
                <span className="text-[9px] text-emerald-400">income − expenses − EMI</span>
              </div>
              <span className="text-sm font-bold text-emerald-900 tabular-nums">
                {formatINR(surplus)}/mo
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
