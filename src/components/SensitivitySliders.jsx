import { useState } from 'react';
import { formatINR } from '../lib/formatINR';

function Slider({ label, value, display, min, max, step, onChange, lo, hi }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-0.5">
        <span className="text-[11px] text-slate-600">{label}</span>
        <span className="text-[11px] font-bold text-slate-800 tabular-nums">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-1.5 accent-slate-500 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-slate-300 mt-px">
        <span>{lo}</span><span>{hi}</span>
      </div>
    </div>
  );
}

export default function SensitivitySliders({ state, onChange }) {
  const [open, setOpen] = useState(false);

  const inflPct = (Math.round(state.inflation * 1000) / 10).toFixed(1);
  const rePct   = (Math.round(state.realEstateAppreciation * 1000) / 10).toFixed(1);
  const summary = `Inflation ${inflPct}% · RE appreciation ${rePct}%`;

  return (
    <div className="border border-slate-200 rounded-md">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between px-2.5 py-2 bg-slate-50
                   hover:bg-slate-100 rounded-md text-left"
      >
        <div className="flex-1 min-w-0 pr-2">
          <span className="text-[11px] font-semibold text-slate-600">Sensitivity</span>
          {!open && (
            <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">{summary}</p>
          )}
        </div>
        <span className="text-[10px] text-slate-400 pt-0.5 flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-2.5 pt-2 pb-3 space-y-3 bg-slate-50">

          <Slider
            label="Inflation"
            value={Math.round(state.inflation * 1000) / 10}
            display={`${inflPct}% p.a.`}
            min={2} max={12} step={0.5}
            onChange={(v) => onChange({ ...state, inflation: parseFloat(v) / 100 })}
            lo="2%" hi="12%"
          />

          <Slider
            label="RE appreciation"
            value={Math.round(state.realEstateAppreciation * 1000) / 10}
            display={`${rePct}% p.a.`}
            min={0} max={12} step={0.5}
            onChange={(v) => onChange({ ...state, realEstateAppreciation: parseFloat(v) / 100 })}
            lo="0%" hi="12%"
          />

        </div>
      )}
    </div>
  );
}
