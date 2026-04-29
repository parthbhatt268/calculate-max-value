import { formatINR } from '../lib/formatINR';

export default function LoanTimeline({ loanCloseMonth, loanCloseYear, horizonYears, totalInterestPaid }) {
  const loanFraction   = loanCloseYear
    ? Math.min(loanCloseYear / horizonYears, 1)
    : 1;
  const investFraction = Math.max(0, 1 - loanFraction);

  const loanYears   = loanCloseYear ? Math.min(loanCloseYear, horizonYears) : horizonYears;
  const investYears = Math.max(0, horizonYears - loanYears);

  // Break loanCloseMonth into year + month-within-year
  let closeYearInt  = null;
  let closeMonthInt = null;
  if (loanCloseMonth && loanCloseYear && loanCloseYear <= horizonYears) {
    closeYearInt  = Math.floor(loanCloseYear);
    closeMonthInt = loanCloseMonth % 12 || 12; // 0 → 12 (closed exactly at year-end)
  }

  const markerVisible = closeYearInt !== null && loanFraction > 0 && loanFraction < 1;

  return (
    <div className="border border-gray-200 rounded-md p-2.5 bg-white">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
        Loan Timeline
      </p>

      {/* Year labels */}
      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
        <span>Year 0</span>
        <span>Year {horizonYears}</span>
      </div>

      {/* Bar + marker */}
      <div className="relative mb-1">
        <div className="flex rounded overflow-hidden h-6">
          <div
            style={{ width: `${loanFraction * 100}%`, background: '#fee2e2' }}
            className="flex items-center justify-center"
          >
            {loanYears >= 2 && (
              <span className="text-xs text-red-700 font-medium px-1 truncate">
                {loanYears.toFixed(1)} yr
              </span>
            )}
          </div>
          {investFraction > 0 && (
            <div
              style={{ width: `${investFraction * 100}%`, background: '#d1fae5' }}
              className="flex items-center justify-center"
            >
              {investYears >= 2 && (
                <span className="text-xs text-green-700 font-medium px-1 truncate">
                  {investYears.toFixed(1)} yr
                </span>
              )}
            </div>
          )}
        </div>

        {/* Vertical marker at loan close */}
        {markerVisible && (
          <div
            style={{ left: `${loanFraction * 100}%` }}
            className="absolute top-0 bottom-0 w-px bg-gray-500 pointer-events-none"
          />
        )}
      </div>

      {/* Below-bar annotations */}
      <div className="relative h-5">
        {markerVisible && (
          <div
            style={{ left: `${loanFraction * 100}%` }}
            className="absolute top-0 -translate-x-1/2 text-center"
          >
            <div className="text-[10px] text-gray-600 whitespace-nowrap">
              ↑ closes yr {closeYearInt}, mo {closeMonthInt}
            </div>
          </div>
        )}
      </div>

      {/* Segment captions + total interest */}
      <div className="flex items-center justify-between text-[10px] text-gray-500">
        <div className="flex gap-2">
          <span className="text-red-600">Loan: {loanYears.toFixed(1)} yr</span>
          {investYears > 0 && (
            <span className="text-green-700">Invest-only: {investYears.toFixed(1)} yr</span>
          )}
        </div>
        <span className="tabular-nums">Total interest: {formatINR(totalInterestPaid)}</span>
      </div>
    </div>
  );
}
