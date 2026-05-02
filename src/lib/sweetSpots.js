import { simulate } from './simulate';

function computeBounds(state) {
  const { housePrice, liquidSavings, miscCosts, maxLTV } = state;
  const minDown = housePrice * (1 - maxLTV);
  const maxAvail = liquidSavings - miscCosts;
  const maxDown = Math.min(Math.max(maxAvail, minDown), housePrice);
  return {
    minLoan: Math.max(0, housePrice - maxDown),
    maxLoan: housePrice - minDown,
  };
}

function calcEMI(loan, annualRate, tenureYears) {
  if (loan <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = tenureYears * 12;
  if (r === 0) return loan / n;
  const factor = Math.pow(1 + r, n);
  return (loan * r * factor) / (factor - 1);
}

// Two candidates are "diverse enough" if they differ on at least 2 of 3 main levers
function isDiverse(candidate, selected) {
  for (const s of selected) {
    const sameLoan   = Math.abs(candidate.loanAmount  - s.loanAmount)   < 5000;
    const sameTenure = candidate.tenure === s.tenure;
    const samePrepay = Math.abs(candidate.prepayFraction - s.prepayFraction) < 0.13;
    if ([sameLoan, sameTenure, samePrepay].filter(Boolean).length >= 2) return false;
  }
  return true;
}

function makeLabel(spot, minLoan, maxLoan) {
  const loanTag =
    Math.abs(spot.loanAmount - maxLoan) < 5000 ? 'Max loan' :
    Math.abs(spot.loanAmount - minLoan) < 5000 ? 'Min loan' : 'Mid loan';
  const prepayTag =
    spot.prepayFraction < 0.01 ? 'All → SIP' :
    spot.prepayFraction > 0.99 ? 'All → prepay' :
    `${Math.round(spot.prepayFraction * 100)}% prepay`;
  return `${loanTag} · ${spot.tenure}yr · ${prepayTag}`;
}

function makePitch(spot, minLoan, maxLoan) {
  const isMax     = Math.abs(spot.loanAmount - maxLoan) < 5000;
  const isMin     = Math.abs(spot.loanAmount - minLoan) < 5000;
  const noPrepay  = spot.prepayFraction < 0.01;
  const allPrepay = spot.prepayFraction > 0.99;
  const closeYr   = Math.round(spot.loanCloseYear ?? 30);

  if (isMax && noPrepay && spot.tenure >= 25)
    return 'Max leverage + full equity — highest compounding time. Equity return beats loan rate.';
  if (isMax && allPrepay)
    return `Hammer the loan (closes ~yr ${closeYr}), then all surplus floods into SIP.`;
  if (isMin && noPrepay)
    return `Least debt, day-0 freed savings in equity. Lower EMI frees more monthly SIP.`;
  if (spot.tenure <= 15 && noPrepay)
    return `Short tenure means higher EMI, but loan closes ~yr ${closeYr} — then full surplus invests.`;
  if (!noPrepay && !allPrepay)
    return `Split surplus: ${Math.round(spot.prepayFraction * 100)}% to prepay, rest to SIP. Loan done ~yr ${closeYr}.`;
  return 'Balanced between early debt freedom and equity growth.';
}

export function findSweetSpots(baseState) {
  const { minLoan, maxLoan } = computeBounds(baseState);
  const midLoan = Math.round(((minLoan + maxLoan) / 2) / 50000) * 50000;

  const loanGrid   = [...new Set([minLoan, midLoan, maxLoan])];
  const tenureGrid = [5, 10, 15, 20, 25, 30];
  const prepayGrid = [0, 0.25, 0.5, 0.75, 1.0];

  // Monthly income - expenses: EMI must fit within this to be a feasible plan
  const maxAffordableEMI = baseState.monthlyIncome - baseState.monthlyExpenses;

  const candidates = [];

  for (const loan of loanGrid) {
    for (const tenure of tenureGrid) {
      const emi = calcEMI(loan, baseState.loanInterestRate, tenure);
      // Skip configs where the EMI alone exceeds what income can cover
      if (emi > maxAffordableEMI) continue;

      for (const prepay of prepayGrid) {
        const testState = {
          ...baseState,
          downPayment:      baseState.housePrice - loan,
          loanTenureYears:  tenure,
          extraEMIsPerYear: 0,   // excluded from search: equity > loan rate means 0 is always best
          prepayFraction:   prepay,
        };
        const { summary } = simulate(testState);
        candidates.push({
          loanAmount:        loan,
          tenure,
          extraEMIsPerYear:  0,
          prepayFraction:    prepay,
          netWorth:          summary.terminalNetWorth,
          realNetWorth:      summary.terminalRealNetWorth,
          loanCloseYear:     summary.loanCloseYear ?? baseState.horizonYears,
          totalInterestPaid: summary.totalInterestPaid,
          emi,
        });
      }
    }
  }

  candidates.sort((a, b) => b.netWorth - a.netWorth);

  const top5 = [];
  for (const c of candidates) {
    if (top5.length >= 5) break;
    if (isDiverse(c, top5)) top5.push(c);
  }

  // Sensible strategy: max down payment (minLoan), 20-year tenure, 25% prepay
  const sensibleCandidate = candidates.find(
    c => Math.abs(c.loanAmount - minLoan) < 5000 && c.tenure === 20 && Math.abs(c.prepayFraction - 0.25) < 0.01
  ) ?? null;

  return {
    spots: top5.map((spot, i) => ({
      ...spot,
      rank:  i + 1,
      label: makeLabel(spot, minLoan, maxLoan),
      pitch: makePitch(spot, minLoan, maxLoan),
    })),
    sensibleSpot: sensibleCandidate,
    minLoan,
    maxLoan,
    horizonYears: baseState.horizonYears,
  };
}
