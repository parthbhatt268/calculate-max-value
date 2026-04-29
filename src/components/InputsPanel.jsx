import { useState, useCallback } from 'react';
import { formatINR } from '../lib/formatINR';

function Field({ label, value, onChange, isPercent = false, min, max, suffix = '' }) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw]         = useState('');

  const handleFocus = useCallback((e) => {
    setRaw(String(value));
    setEditing(true);
    requestAnimationFrame(() => e.target.select());
  }, [value]);

  const handleBlur = useCallback(() => {
    setEditing(false);
    const cleaned = raw.replace(/[₹,\s]/g, '').replace(/Cr$/i, '').replace(/L$/i, '').trim();
    const parsed  = parseFloat(cleaned);
    if (!isNaN(parsed) && parsed !== value) {
      const v = (min !== undefined && max !== undefined)
        ? Math.min(Math.max(parsed, min), max)
        : parsed;
      onChange(v);
    }
  }, [raw, value, min, max, onChange]);

  const display = isPercent ? `${value}${suffix || '%'}` : formatINR(value);

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] leading-none text-gray-400 truncate">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={editing ? raw : display}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(e) => setRaw(e.target.value)}
        className="h-7 px-2 text-[11px] border border-gray-300 rounded bg-white text-gray-800
                   focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                   w-full tabular-nums"
      />
    </div>
  );
}

export default function InputsPanel({ state, onChange }) {
  const [open, setOpen] = useState(false);

  function set(key) {
    return (val) => onChange({ ...state, [key]: val });
  }

  const summary = [
    formatINR(state.housePrice),
    `misc ${formatINR(state.miscCosts)}`,
    `savings ${formatINR(state.liquidSavings)}`,
    `LTV ${Math.round(state.maxLTV * 100)}%`,
    `${state.horizonYears} yr horizon`,
  ].join(' · ');

  return (
    <div className="border border-gray-200 rounded-md">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between px-2.5 py-2 bg-gray-50
                   hover:bg-gray-100 rounded-md text-left"
      >
        <div className="flex-1 min-w-0 pr-2">
          <span className="text-[11px] font-semibold text-gray-700">Property inputs</span>
          {!open && (
            <p className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">{summary}</p>
          )}
        </div>
        <span className="text-[10px] text-gray-400 pt-0.5 flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-2.5 pt-2 pb-3 grid grid-cols-2 gap-x-2 gap-y-2">

          <Field label="House price"    value={state.housePrice}    onChange={set('housePrice')}    min={500000} />
          <Field label="Misc costs"     value={state.miscCosts}     onChange={set('miscCosts')}     min={0} />
          <Field label="Liquid savings" value={state.liquidSavings} onChange={set('liquidSavings')} min={0} />
          <Field label="Max LTV %"      value={Math.round(state.maxLTV * 100)}
                 onChange={(v) => set('maxLTV')(v / 100)} isPercent min={50} max={90} />

          {/* Horizon slider spans full width */}
          <div className="col-span-2 flex items-center gap-2 pt-1">
            <span className="text-[10px] text-gray-400 shrink-0">Horizon</span>
            <input
              type="range" min={5} max={40} step={1}
              value={state.horizonYears}
              onChange={(e) => set('horizonYears')(parseInt(e.target.value))}
              className="flex-1 accent-indigo-500 h-1 cursor-pointer"
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
