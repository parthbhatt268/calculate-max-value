import { formatINR } from '../lib/formatINR';

function Slider({ label, value, display, min, max, step, onChange, endLabels }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-0.5">
        <span className="text-[11px] text-gray-600">{label}</span>
        <span className="text-[11px] font-semibold text-gray-800 tabular-nums">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-1 accent-indigo-600 cursor-pointer"
      />
      {endLabels && (
        <div className="flex justify-between text-[10px] text-gray-400 mt-px">
          <span>{endLabels[0]}</span>
          <span>{endLabels[1]}</span>
        </div>
      )}
    </div>
  );
}

export default function StrategySliders({ state, onChange, minDownPayment, maxDownPayment }) {
  function set(key, parse = parseFloat) {
    return (val) => onChange({ ...state, [key]: parse(val) });
  }

  const prepayPct = state.prepaySplitPercent;
  const sipPct    = 100 - prepayPct;

  return (
    <div className="border border-gray-200 rounded-md p-2.5 space-y-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Strategy</span>

      <Slider
        label="Down payment"
        value={Math.min(Math.max(state.downPayment, minDownPayment), maxDownPayment)}
        display={formatINR(state.downPayment)}
        min={minDownPayment}
        max={maxDownPayment}
        step={50000}
        onChange={set('downPayment', parseInt)}
        endLabels={[formatINR(minDownPayment), formatINR(maxDownPayment)]}
      />

      <Slider
        label="Extra EMIs / year"
        value={state.extraEMIsPerYear}
        display={`${state.extraEMIsPerYear}`}
        min={0}
        max={6}
        step={1}
        onChange={set('extraEMIsPerYear', parseInt)}
        endLabels={['0', '6']}
      />

      <Slider
        label="Surplus split"
        value={prepayPct}
        display={`${prepayPct}% prepay · ${sipPct}% SIP`}
        min={0}
        max={100}
        step={5}
        onChange={set('prepaySplitPercent', parseInt)}
        endLabels={['100% SIP', '100% prepay']}
      />
    </div>
  );
}
