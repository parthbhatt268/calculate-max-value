import { formatINR } from '../lib/formatINR';

function SensSlider({ label, value, min, max, step, onChange, format, isOverride }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-0.5">
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-gray-600">{label}</span>
          {isOverride && (
            <span className="text-[9px] text-gray-400 border border-gray-300 px-1 py-px rounded-full leading-none">
              overrides
            </span>
          )}
        </div>
        <span className="text-[11px] font-semibold text-gray-800 tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 accent-gray-500 cursor-pointer"
      />
    </div>
  );
}

export default function SensitivitySliders({ state, onChange }) {
  function set(key) {
    return (val) => onChange({ ...state, [key]: val });
  }

  return (
    <div className="border border-gray-200 rounded-md p-2.5 space-y-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Sensitivity</span>

      <SensSlider
        label="Equity return"
        value={Math.round(state.equityReturn * 1000) / 10}
        min={4} max={20} step={0.5}
        onChange={(v) => set('equityReturn')(v / 100)}
        format={(v) => `${v.toFixed(1)}%`}
        isOverride={false}
      />
      <SensSlider
        label="Inflation"
        value={Math.round(state.inflation * 1000) / 10}
        min={2} max={12} step={0.5}
        onChange={(v) => set('inflation')(v / 100)}
        format={(v) => `${v.toFixed(1)}%`}
        isOverride={false}
      />
      <SensSlider
        label="Loan rate"
        value={Math.round(state.loanInterestRate * 100) / 100}
        min={6} max={14} step={0.05}
        onChange={(v) => set('loanInterestRate')(Math.round(v * 100) / 100)}
        format={(v) => `${v.toFixed(2)}%`}
        isOverride={true}
      />
      <SensSlider
        label="RE appreciation"
        value={Math.round(state.realEstateAppreciation * 1000) / 10}
        min={0} max={12} step={0.5}
        onChange={(v) => set('realEstateAppreciation')(v / 100)}
        format={(v) => `${v.toFixed(1)}%`}
        isOverride={false}
      />
      <SensSlider
        label="Monthly income"
        value={state.monthlyIncome}
        min={50000} max={1000000} step={10000}
        onChange={set('monthlyIncome')}
        format={(v) => formatINR(v)}
        isOverride={true}
      />
    </div>
  );
}
