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
          <span style={{ color: entry.stroke || entry.color }}>{entry.name}</span>
          <span className="font-medium text-gray-800 tabular-nums">{formatINR(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Renders nothing for every point except the last, where it draws a dot + value label
function makeEndDot(color, key) {
  return function EndDot({ cx, cy, index, payload, isLast }) {
    if (!isLast) return <g />;
    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={1.5} />
        <text
          x={cx + 7}
          y={cy}
          fontSize={9}
          fontWeight="700"
          fill={color}
          textAnchor="start"
          dominantBaseline="middle"
        >
          {formatINR(payload[key])}
        </text>
      </g>
    );
  };
}

export default function NetWorthChart({ history, nominalMode }) {
  if (!history || history.length === 0) return null;

  const data = history
    .filter((h) => h.month % SAMPLE_RATE === 0)
    .map((h) => ({
      year:         parseFloat(h.year.toFixed(2)),
      netWorth:     Math.round(nominalMode ? h.netWorth         : h.realNetWorth),
      investCorpus: Math.round(nominalMode ? h.investmentCorpus : h.realInvestCorpus),
      houseValue:   Math.round(nominalMode ? h.houseValue       : h.realHouseValue),
    }));

  const lastIdx = data.length - 1;

  // Wrap each EndDot so it knows whether the current index is the last
  function wrapDot(color, key) {
    const Inner = makeEndDot(color, key);
    return (props) => <Inner {...props} isLast={props.index === lastIdx} />;
  }

  return (
    <div className="border border-gray-200 rounded-md p-2.5 bg-white">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
        Net Worth Over Time — {nominalMode ? 'Actual ₹' : 'Inflation-adjusted ₹'}
        {!nominalMode && (
          <span className="ml-1 text-gray-400 normal-case font-normal">
            (in today's purchasing power)
          </span>
        )}
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 80, left: 8, bottom: 8 }}>
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
            width={64}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />

          <Line
            type="monotone"
            dataKey="netWorth"
            name="Net worth"
            stroke="#1f2937"
            strokeWidth={2.5}
            dot={wrapDot('#1f2937', 'netWorth')}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="investCorpus"
            name="Investment corpus"
            stroke="#10b981"
            strokeWidth={1.5}
            dot={wrapDot('#10b981', 'investCorpus')}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="houseValue"
            name="House value"
            stroke="#3b82f6"
            strokeWidth={1.5}
            dot={wrapDot('#3b82f6', 'houseValue')}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
