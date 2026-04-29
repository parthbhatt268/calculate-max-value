import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatINR, formatINRAxis } from '../lib/formatINR';

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function buildAnnual(history, horizonYears) {
  const annual = [];
  for (let y = 0; y < horizonYears; y++) {
    const slice = history.slice(y * 12, (y + 1) * 12);
    if (!slice.length) break;
    annual.push({
      year:         y + 1,
      emiInterest:  Math.round(avg(slice.map((m) => m.emiInterest))),
      emiPrincipal: Math.round(avg(slice.map((m) => m.emiPrincipal))),
      extraPrepay:  Math.round(avg(slice.map((m) => m.extraPrepay))),
      sip:          Math.round(avg(slice.map((m) => m.sip))),
    });
  }
  return annual;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  // Recharts stacked area reverses order — show top-to-bottom for readability
  const items = [...payload].reverse();
  return (
    <div className="bg-white border border-gray-200 rounded shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1.5">Year {label}</p>
      {items.map((entry) => (
        <div key={entry.dataKey} className="flex justify-between gap-4">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-medium text-gray-800 tabular-nums">{formatINR(entry.value)}/mo</span>
        </div>
      ))}
    </div>
  );
}

export default function CashFlowChart({ history, horizonYears }) {
  if (!history || history.length === 0) return null;

  const data = buildAnnual(history, horizonYears);

  return (
    <div className="border border-gray-200 rounded-md p-2.5 bg-white">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
        Monthly Cash Allocation (annual averages)
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            type="number"
            domain={[1, 'dataMax']}
            tickFormatter={(v) => `${v}`}
            label={{ value: 'Year', position: 'insideBottomRight', offset: -8, fontSize: 11 }}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            tickFormatter={formatINRAxis}
            tick={{ fontSize: 11 }}
            domain={[0, 'auto']}
            width={68}
            label={{ value: '₹/mo', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {/* Bottom to top: EMI interest → EMI principal → Extra prepay → SIP */}
          <Area
            type="monotone"
            dataKey="emiInterest"
            name="EMI interest"
            stackId="a"
            stroke="#f87171"
            fill="#fca5a5"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="emiPrincipal"
            name="EMI principal"
            stackId="a"
            stroke="#fb923c"
            fill="#fdba74"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="extraPrepay"
            name="Extra prepayment"
            stackId="a"
            stroke="#facc15"
            fill="#fde047"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="sip"
            name="SIP"
            stackId="a"
            stroke="#4ade80"
            fill="#86efac"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
