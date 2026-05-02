import { useState } from "react";
import { formatINR } from "../lib/formatINR";

const SENSIBLE_PROS = [
  "Max down payment removes Day-0 leverage risk. Under real market volatility the median outcome is similar to min-down — but the bad-outcome tail is much wider with leverage.",
  "As an NRI you have no Section 24 tax deduction on home loan interest. The leverage arbitrage is weaker than it looks in a deterministic 12%-equity model.",
  "25% prepayment closes the loan around year 11, giving ~9 extra years completely debt-free before the horizon ends.",
  "75% surplus still flows to SIP — you capture most of the equity compounding benefit with only ~1.5% expected corpus cost vs pure SIP.",
  "Structural resilience: if income is disrupted or rates rise, you carry less debt and have no Day-0 corpus exposed to an early market drawdown.",
];

const SENSIBLE_CONS = [
  "All liquid savings committed to down payment — virtually zero Day-0 investable corpus (ring-fence a separate ₹10 L emergency fund first).",
  "Not the highest expected-value choice in this model — 0% prepay + max loan produces a marginally higher terminal corpus under the deterministic 12% assumption.",
  "20-year tenure means a higher EMI than a 30-year loan — less monthly breathing room in the early years.",
];

const RANK_META = [
  {
    label: "1st — Best",
    border: "border-amber-400",
    bg: "bg-amber-50",
    badge: "bg-amber-400 text-white",
    text: "text-amber-900",
  },
  {
    label: "2nd",
    border: "border-slate-400",
    bg: "bg-slate-50",
    badge: "bg-slate-400 text-white",
    text: "text-slate-900",
  },
  {
    label: "3rd",
    border: "border-orange-300",
    bg: "bg-orange-50",
    badge: "bg-orange-400 text-white",
    text: "text-orange-900",
  },
  {
    label: "4th",
    border: "border-blue-200",
    bg: "bg-blue-50",
    badge: "bg-blue-400 text-white",
    text: "text-blue-900",
  },
  {
    label: "5th",
    border: "border-gray-200",
    bg: "bg-gray-50",
    badge: "bg-gray-400 text-white",
    text: "text-gray-800",
  },
];

function SensibleCard({ spot, topValue, nominalMode, onApply }) {
  const [showMore, setShowMore] = useState(false);
  const displayed = nominalMode ? spot.netWorth : spot.realNetWorth;
  const diff = topValue - displayed;
  const closeYr =
    spot.loanCloseYear != null
      ? Math.round(spot.loanCloseYear * 10) / 10
      : null;

  return (
    <div
      className="flex flex-col gap-1.5 border-2 border-blue-900 rounded-lg p-2.5 w-[210px] flex-shrink-0"
      style={{ backgroundColor: "#eef2ff" }}
    >
      {/* Badge */}
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-900 text-white shrink-0">
          Sensible Strategy
        </span>
      </div>

      {/* Net worth */}
      <div>
        <div className="text-base font-extrabold tabular-nums leading-tight text-blue-900">
          {formatINR(displayed)}
        </div>
        {diff > 0 && (
          <div className="text-[9px] text-gray-500 tabular-nums leading-none mt-0.5">
            −{formatINR(diff)} vs #1
          </div>
        )}
      </div>

      {/* Label */}
      <div className="text-[9px] text-blue-800 leading-snug font-medium">
        Max down · 20yr · 25% prepay
      </div>

      {/* Stats */}
      <div className="flex gap-2 text-[9px] text-gray-500 flex-wrap">
        {closeYr != null && <span>Loan closes yr {closeYr}</span>}
        <span>Interest {formatINR(spot.totalInterestPaid)}</span>
      </div>

      {/* Pitch */}
      <p className="text-[9px] text-blue-700 leading-snug border-t border-blue-200 pt-1.5 mt-0.5">
        Debt-free by yr ~{closeYr ?? "—"}, then 100% surplus to SIP. Trades
        ~1.5% expected corpus for 9 extra debt-free years and real resilience
        against market downturns and income shocks.
      </p>

      {/* Show more */}
      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className="text-[9px] text-gray-400 hover:text-gray-600 text-left transition-colors"
      >
        {showMore ? "Show less ▲" : "Show more ▼"}
      </button>

      {showMore && (
        <div className="border-t border-blue-200 pt-1.5 mt-0.5 flex flex-col gap-1.5">
          <div>
            <div className="text-[9px] font-bold text-green-700 mb-0.5">
              Pros
            </div>
            <ul className="flex flex-col gap-1">
              {SENSIBLE_PROS.map((p, i) => (
                <li
                  key={i}
                  className="flex gap-1 text-[9px] text-green-800 leading-snug"
                >
                  <span className="shrink-0 font-bold">✓</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[9px] font-bold text-red-700 mb-0.5">Cons</div>
            <ul className="flex flex-col gap-1">
              {SENSIBLE_CONS.map((c, i) => (
                <li
                  key={i}
                  className="flex gap-1 text-[9px] text-red-800 leading-snug"
                >
                  <span className="shrink-0 font-bold">✗</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Apply */}
      <button
        type="button"
        onClick={() => onApply(spot)}
        className="mt-auto text-[9px] font-semibold px-2 py-1 rounded border border-blue-300
                   bg-white hover:bg-blue-50 text-blue-800 transition-colors"
      >
        Apply settings
      </button>
    </div>
  );
}

function generateProsCons(spot, minLoan, maxLoan, horizonYears) {
  const pros = [];
  const cons = [];

  const isMaxLoan = Math.abs(spot.loanAmount - maxLoan) < 5000;
  const isMinLoan = Math.abs(spot.loanAmount - minLoan) < 5000;
  const noPrepay = spot.prepayFraction < 0.01;
  const allPrepay = spot.prepayFraction > 0.99;
  const highPrepay = spot.prepayFraction >= 0.5;
  const shortTenure = spot.tenure <= 15;
  const longTenure = spot.tenure >= 25;
  const closeYr = Math.round((spot.loanCloseYear ?? horizonYears) * 10) / 10;
  const debtFreeYrs = Math.max(0, horizonYears - closeYr);

  // --- SIP flexibility ---
  if (noPrepay) {
    pros.push(
      "SIP is voluntary — you can pause or reduce it in a tight month (child's education, travel, emergency) without bank penalty.",
    );
  } else if (highPrepay) {
    cons.push(
      `${Math.round(spot.prepayFraction * 100)}% of monthly surplus is locked into loan prepayment — harder to skip for a child\'s school fee or a world trip.`,
    );
  }

  // --- Leverage / arbitrage ---
  if (isMaxLoan && noPrepay) {
    pros.push(
      "Maximum leverage: bank funds most of the purchase, freeing your capital to compound at ~12% equity return vs ~7.5% loan cost — ~4.5%/yr arbitrage.",
    );
    cons.push(
      "You carry the full loan balance for the entire tenure — higher total interest paid.",
    );
  }
  if (isMinLoan) {
    pros.push(
      "Least debt from day 1 — lower emotional stress and interest burden.",
    );
    cons.push(
      "Less capital deployed into equity early, so less compounding time at the higher equity rate.",
    );
  }

  // --- Prepayment benefits ---
  if (allPrepay) {
    pros.push(
      `Aggressive prepayment closes the loan around yr ${closeYr} — you become completely debt-free, then the full freed surplus floods into SIP.`,
    );
    cons.push(
      "Until the loan closes, very little goes into equity — you miss years of compounding at the higher equity rate.",
    );
  } else if (highPrepay && !allPrepay) {
    pros.push(
      `Loan closes early (~yr ${closeYr}), giving ${debtFreeYrs > 0 ? debtFreeYrs + " debt-free years" : "earlier freedom"} to invest the full surplus.`,
    );
    cons.push(
      "Prepayment locks cash into a low-liquidity asset (home equity) — can't easily withdraw in an emergency.",
    );
  }

  // --- Tenure effects ---
  if (shortTenure) {
    pros.push(
      `Short ${spot.tenure}-year tenure means the loan is gone by yr ${closeYr} — full surplus goes to SIP for the remainder of the horizon.`,
    );
    cons.push(
      `High monthly EMI for a ${spot.tenure}-year loan — leaves less room for SIP or discretionary spending early on.`,
    );
  }
  if (longTenure) {
    pros.push(
      `Long ${spot.tenure}-year tenure keeps the monthly EMI low — more breathing room for SIP and lifestyle expenses each month.`,
    );
    if (noPrepay) {
      cons.push(
        `Debt persists for ${spot.tenure} years — you\'re paying interest for the full horizon and psychologically carrying a loan the whole time.`,
      );
    }
  }

  // --- Debt-free window ---
  if (debtFreeYrs >= 5) {
    pros.push(
      `${debtFreeYrs} years of debt-free compounding at the end of the horizon — significant equity snowball effect.`,
    );
  }

  // --- Interest cost ---
  if (spot.totalInterestPaid > 5000000) {
    cons.push(
      `Total interest outflow of ${formatINR(spot.totalInterestPaid)} — real cost of the loan over time.`,
    );
  }

  // --- Market risk ---
  if (isMaxLoan && noPrepay) {
    cons.push(
      "This strategy wins only if equity returns stay near 12% — a prolonged market downturn narrows or eliminates the arbitrage.",
    );
  }

  return { pros, cons };
}

function SweetSpotCard({
  spot,
  topValue,
  nominalMode,
  onApply,
  minLoan,
  maxLoan,
  horizonYears,
}) {
  const [showMore, setShowMore] = useState(false);

  const meta = RANK_META[spot.rank - 1];
  const displayed = nominalMode ? spot.netWorth : spot.realNetWorth;

  const diff = spot.rank > 1 ? topValue - displayed : 0;
  const closeYr =
    spot.loanCloseYear != null
      ? Math.round(spot.loanCloseYear * 10) / 10
      : null;

  const { pros, cons } = generateProsCons(spot, minLoan, maxLoan, horizonYears);

  return (
    <div
      className={`flex flex-col gap-1.5 border-2 ${meta.border} ${meta.bg} rounded-lg p-2.5 w-[210px] flex-shrink-0`}
    >
      {/* Rank badge */}
      <div className="flex items-center gap-1.5">
        <span
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${meta.badge} shrink-0`}
        >
          {meta.label}
        </span>
      </div>

      {/* Net worth */}
      <div>
        <div
          className={`text-base font-extrabold tabular-nums leading-tight ${meta.text}`}
        >
          {formatINR(displayed)}
        </div>
        {diff > 0 && (
          <div className="text-[9px] text-red-500 tabular-nums leading-none mt-0.5">
            −{formatINR(diff)} vs #1
          </div>
        )}
      </div>

      {/* Strategy label */}
      <div className="text-[9px] text-gray-600 leading-snug font-medium">
        {spot.label}
      </div>

      {/* Stats row */}
      <div className="flex gap-2 text-[9px] text-gray-500 flex-wrap">
        {closeYr != null && <span>Loan closes yr {closeYr}</span>}
        <span>Interest {formatINR(spot.totalInterestPaid)}</span>
      </div>

      {/* Pitch */}
      <p className="text-[9px] text-gray-500 leading-snug border-t border-gray-200 pt-1.5 mt-0.5">
        {spot.pitch}
      </p>

      {/* Show more toggle */}
      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className="text-[9px] text-gray-400 hover:text-gray-600 text-left transition-colors"
      >
        {showMore ? "Show less ▲" : "Show more ▼"}
      </button>

      {/* Pros / cons expand */}
      {showMore && (
        <div className="border-t border-gray-200 pt-1.5 mt-0.5 flex flex-col gap-1.5">
          {pros.length > 0 && (
            <div>
              <div className="text-[9px] font-bold text-green-700 mb-0.5">
                Pros
              </div>
              <ul className="flex flex-col gap-1">
                {pros.map((p, i) => (
                  <li
                    key={i}
                    className="flex gap-1 text-[9px] text-green-800 leading-snug"
                  >
                    <span className="shrink-0 font-bold">✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cons.length > 0 && (
            <div>
              <div className="text-[9px] font-bold text-red-700 mb-0.5">
                Cons
              </div>
              <ul className="flex flex-col gap-1">
                {cons.map((c, i) => (
                  <li
                    key={i}
                    className="flex gap-1 text-[9px] text-red-800 leading-snug"
                  >
                    <span className="shrink-0 font-bold">✗</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Apply button */}
      <button
        type="button"
        onClick={() => onApply(spot)}
        className="mt-auto text-[9px] font-semibold px-2 py-1 rounded border border-gray-300
                   bg-white hover:bg-gray-100 text-gray-600 transition-colors"
      >
        Apply settings
      </button>
    </div>
  );
}

export default function SweetSpots({ result, nominalMode, onApply }) {
  const [open, setOpen] = useState(false);

  if (!result || result.spots.length === 0) return null;

  const { spots, sensibleSpot, minLoan, maxLoan, horizonYears } = result;
  const topNominal = spots[0].netWorth;
  const topReal = spots[0].realNetWorth;
  const topValue = nominalMode ? topNominal : topReal;
  const modeLabel = nominalMode ? "" : " (inflation-adj)";

  return (
    <div className="border border-gray-200 rounded-md bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50
                   hover:bg-gray-100 rounded-md text-left"
      >
        <div className="min-w-0 flex items-baseline gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-gray-700">
            Sweet Spots — Top 5 strategies by net worth{modeLabel}
          </span>
          {!open && (
            <span className="text-[10px] text-amber-600 font-semibold">
              Best: {formatINR(topValue)}
              {modeLabel} ·{" "}
              {spots[0].label.split(" · ").slice(0, 2).join(" · ")}
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-400 ml-2 shrink-0">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="p-2.5">
          <p className="text-[9px] text-gray-400 mb-2.5 leading-snug">
            Grid search over loan amount, tenure, and prepayment fraction —
            fixed inputs (income, rates, house price) held constant. Ranked by{" "}
            {nominalMode ? "nominal" : "inflation-adjusted"} terminal net worth.
            Click <strong>Apply settings</strong> on any card to load those
            inputs.
          </p>
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "thin" }}
          >
            {sensibleSpot && (
              <SensibleCard
                spot={sensibleSpot}
                topValue={topValue}
                nominalMode={nominalMode}
                onApply={onApply}
              />
            )}
            {spots.map((spot) => (
              <SweetSpotCard
                key={spot.rank}
                spot={spot}
                topValue={topValue}
                nominalMode={nominalMode}
                onApply={onApply}
                minLoan={minLoan}
                maxLoan={maxLoan}
                horizonYears={horizonYears}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
