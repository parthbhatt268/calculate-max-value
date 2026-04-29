import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatINR, formatINRAxis } from '../lib/formatINR';

const SAMPLE_RATE = 3; // every 3 months → ~120 points for 30 yr

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1.5">Year {Number(label).toFixed(1)}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex justify-between gap-4">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-medium text-gray-800 tabular-nums">{formatINR(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function NetWorthChart({ history, nominalMode }) {
  if (!history || history.length === 0) return null;

  const data = history
    .filter((h) => h.month % SAMPLE_RATE === 0)
    .map((h) => ({
      year:             parseFloat(h.year.toFixed(2)),
      netWorth:         Math.round(nominalMode ? h.netWorth : h.realNetWorth),
      investmentCorpus: Math.round(h.investmentCorpus),
      houseValue:       Math.round(h.houseValue),
      loanBalance:      Math.round(h.loanBalance),
    }));

  const modeLabel = nominalMode ? 'Actual' : 'Inflation-adjusted';

  return (
    <div className="border border-gray-200 rounded-md p-2.5 bg-white">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
        Net Worth Over Time — {modeLabel}
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            type="number"
            domain={[0, 'dataMax']}
            tickFormatter={(v) => `${Math.round(v)}`}
            label={{ value: 'Year', position: 'insideBottomRight', offset: -8, fontSize: 11 }}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            tickFormatter={formatINRAxis}
            tick={{ fontSize: 11 }}
            domain={[0, 'auto']}
            width={68}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Line
            type="monotone"
            dataKey="netWorth"
            name="Net worth"
            stroke="#1f2937"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="investmentCorpus"
            name="Investment corpus"
            stroke="#10b981"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="houseValue"
            name="House value"
            stroke="#3b82f6"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="loanBalance"
            name="Loan balance"
            stroke="#ef4444"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
