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

export default function StrategySliders({
  state, onChange,
  minDownPayment, maxDownPayment,
  emi, baseSIP,
}) {
  function set(key, parse = parseFloat) {
    return (val) => onChange({ ...state, [key]: parse(val) });
  }

  // Show how the SIP target grows: year 1 vs final year
  const sipStepUp = state.sipStepUpRate ?? 0;
  const sipYr1    = baseSIP;
  const sipYrN    = baseSIP * Math.pow(1 + sipStepUp, state.horizonYears - 1);

  const stepUpLabel = sipStepUp === 0
    ? 'flat (no increase)'
    : `+${(sipStepUp * 100).toFixed(0)}% / yr`;

  return (
    <div className="border border-gray-200 rounded-md p-2.5 space-y-3">

      {/* ── Prepayment ── */}
      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        Prepayment strategy
      </span>

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

      {/* ── Equity Investment ── */}
      <div className="border-t border-gray-100 pt-2.5 space-y-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Equity investment
        </span>

        <Slider
          label="Expected equity return"
          value={Math.round(state.equityReturn * 1000) / 10}
          display={`${(Math.round(state.equityReturn * 1000) / 10).toFixed(1)}% p.a.`}
          min={4}
          max={20}
          step={0.5}
          onChange={(v) => onChange({ ...state, equityReturn: parseFloat(v) / 100 })}
          endLabels={['4%', '20%']}
        />

        <Slider
          label="SIP step-up"
          value={Math.round((sipStepUp) * 100)}
          display={stepUpLabel}
          min={0}
          max={15}
          step={1}
          onChange={(v) => onChange({ ...state, sipStepUpRate: parseFloat(v) / 100 })}
          endLabels={['0% (flat)', '15%/yr']}
        />

        {/* Live SIP display */}
        <div className="bg-indigo-50 border border-indigo-100 rounded px-2 py-1.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-indigo-500">Monthly SIP — yr 1</span>
            <span className="text-xs font-bold text-indigo-700 tabular-nums">
              {formatINR(sipYr1)}/mo
            </span>
          </div>
          {sipStepUp > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-indigo-400">
                Monthly SIP — yr {state.horizonYears}
              </span>
              <span className="text-xs font-semibold text-indigo-600 tabular-nums">
                {formatINR(sipYrN)}/mo
              </span>
            </div>
          )}
          <p className="text-[9px] text-indigo-400 leading-tight">
            income − expenses − EMI; capped at actual monthly surplus
          </p>
        </div>
      </div>

    </div>
  );
}
