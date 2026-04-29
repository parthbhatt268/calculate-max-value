import { formatINR } from '../lib/formatINR';

function KV({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] text-gray-500 leading-tight truncate">{label}</span>
      <span className="text-xs font-semibold text-gray-800 tabular-nums">{value}</span>
    </div>
  );
}

export default function OutputSummary({ summary, nominalMode, onToggle }) {
  if (!summary) return null;
  const { emi, day0LumpSum, loanCloseYear, totalInterestPaid, terminalNetWorth, terminalRealNetWorth } = summary;

  const loanCloseText   = loanCloseYear ? `Yr ${loanCloseYear.toFixed(1)}` : 'Not closed';
  const terminalValue   = nominalMode ? terminalNetWorth : terminalRealNetWorth;
  const terminalLabel   = nominalMode ? 'Terminal net worth' : 'Terminal (today\'s ₹)';

  return (
    <div className="border border-gray-200 rounded-md p-2.5 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Output</span>
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-full p-0.5">
          <button
            onClick={() => onToggle(true)}
            title="The actual rupee amount you'd see in your account."
            className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
              nominalMode ? 'bg-white shadow text-gray-800 font-medium' : 'text-gray-500'
            }`}
          >
            Actual
          </button>
          <button
            onClick={() => onToggle(false)}
            title="What that money would buy in today's purchasing power."
            className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
              !nominalMode ? 'bg-white shadow text-gray-800 font-medium' : 'text-gray-500'
            }`}
          >
            Inflation-adjusted
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <KV label="Monthly EMI"             value={formatINR(emi)} />
        <KV label="Day-0 lump sum"          value={formatINR(day0LumpSum)} />
        <KV label="Loan closes"             value={loanCloseText} />
        <KV label="Total interest"          value={formatINR(totalInterestPaid)} />
        <KV label={terminalLabel}           value={formatINR(terminalValue)} />
      </div>
    </div>
  );
}
