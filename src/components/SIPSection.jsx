import { useState } from 'react';
import { formatINR } from '../lib/formatINR';

function Slider({ label, value, display, min, max, step, onChange, lo, hi }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-0.5">
        <span className="text-[11px] text-violet-700">{label}</span>
        <span className="text-[11px] font-bold text-violet-900 tabular-nums">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-1.5 accent-violet-500 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-violet-300 mt-px">
        <span>{lo}</span><span>{hi}</span>
      </div>
    </div>
  );
}

export default function SIPSection({ state, onChange, summary }) {
  const [open, setOpen] = useState(true);
  const sipSchedule = summary?.sipSchedule ?? [];
  const yr1SIP = sipSchedule[0]?.monthlySIP ?? 0;
  const equityPct = (Math.round(state.equityReturn * 1000) / 10).toFixed(1);

  const collapsedSummary = `Equity ${equityPct}% · Yr 1 SIP ${formatINR(yr1SIP)}/mo`;

  return (
    <div className="border border-violet-200 rounded-md">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between px-2.5 py-2 bg-violet-50
                   hover:bg-violet-100 rounded-md text-left"
      >
        <div className="flex-1 min-w-0 pr-2">
          <span className="text-[11px] font-semibold text-violet-700">Equity / SIP</span>
          {!open && (
            <p className="text-[10px] text-violet-400 truncate leading-tight mt-0.5">{collapsedSummary}</p>
          )}
        </div>
        <span className="text-[10px] text-violet-400 pt-0.5 flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-2.5 pt-2 pb-3 space-y-3" style={{ background: 'oklch(97.4% 0.014 300)' }}>

          <Slider
            label="Expected equity return"
            value={Math.round(state.equityReturn * 1000) / 10}
            display={`${equityPct}% p.a.`}
            min={4} max={20} step={0.5}
            onChange={(v) => onChange({ ...state, equityReturn: parseFloat(v) / 100 })}
            lo="4%" hi="20%"
          />

          {/* Monthly SIP milestone table */}
          {sipSchedule.length > 0 && (
            <div className="rounded border border-violet-200 bg-violet-100 px-2.5 py-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-violet-400 mb-2">
                Monthly SIP by year
              </p>
              <p className="text-[9px] text-violet-400 mb-2 leading-snug">
                All surplus (income − expenses − EMI) goes to SIP each month.
                After loan closes, freed EMI is also invested.
              </p>
              <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                {sipSchedule.map(({ year, monthlySIP }) => (
                  <div key={year}>
                    <div className="text-[9px] text-violet-400 leading-none">Yr {year}</div>
                    <div className="text-[11px] font-bold text-violet-900 tabular-nums leading-snug">
                      {formatINR(monthlySIP)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
