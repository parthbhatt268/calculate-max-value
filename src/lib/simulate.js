export function simulate(state) {
  const {
    housePrice,
    loanInterestRate,
    loanTenureYears,
    monthlyIncome,
    monthlyExpenses,
    incomeStepUpRate,
    expensesStepUpRate,
    equityReturn,
    inflation,
    realEstateAppreciation,
    downPayment,
    extraEMIsPerYear,
    prepayFraction = 0,
    horizonYears,
  } = state;

  const loanAmount = housePrice - downPayment;
  const maxAvailableForDeployment = state.liquidSavings - state.miscCosts;
  const day0LumpSum = Math.max(0, maxAvailableForDeployment - downPayment);

  const monthlyRate = loanInterestRate / 100 / 12;
  const n           = loanTenureYears * 12;

  let emi = 0;
  if (loanAmount > 0 && monthlyRate > 0) {
    const factor = Math.pow(1 + monthlyRate, n);
    emi = (loanAmount * monthlyRate * factor) / (factor - 1);
  } else if (loanAmount > 0) {
    emi = loanAmount / n;
  }

  const monthlyEquityReturn   = Math.pow(1 + equityReturn, 1 / 12) - 1;
  const monthlyREAppreciation = Math.pow(1 + realEstateAppreciation, 1 / 12) - 1;
  const monthlyInflation      = Math.pow(1 + inflation, 1 / 12) - 1;

  let loanBalance       = loanAmount;
  let investmentCorpus  = day0LumpSum;
  let houseValue        = housePrice;
  let totalInterestPaid = 0;
  let loanCloseMonth    = null;
  const history         = [];

  const totalMonths = horizonYears * 12;

  for (let month = 1; month <= totalMonths; month++) {
    const yearIndex   = Math.floor((month - 1) / 12);
    const incomeNow   = monthlyIncome   * Math.pow(1 + incomeStepUpRate,   yearIndex);
    const expensesNow = monthlyExpenses * Math.pow(1 + expensesStepUpRate, yearIndex);

    let emiInterestThisMonth  = 0;
    let emiPrincipalThisMonth = 0;
    let emiPaidThisMonth      = 0;
    let extraPrepayThisMonth  = 0;

    if (loanBalance > 0.01) {
      const interest  = loanBalance * monthlyRate;
      const principal = Math.min(emi - interest, loanBalance);
      loanBalance          -= principal;
      totalInterestPaid    += interest;
      emiInterestThisMonth  = interest;
      emiPrincipalThisMonth = principal;
      emiPaidThisMonth      = interest + principal;

      if (month % 12 === 0 && extraEMIsPerYear > 0 && loanBalance > 0.01) {
        const extraPayment = Math.min(emi * extraEMIsPerYear, loanBalance);
        loanBalance          -= extraPayment;
        emiPaidThisMonth     += extraPayment;
        extraPrepayThisMonth += extraPayment;
      }

      if (loanBalance < 0.01 && loanCloseMonth === null) {
        loanBalance    = 0;
        loanCloseMonth = month;
      }
    }

    // Monthly surplus available after regular EMI
    const actualSurplus = Math.max(0, incomeNow - expensesNow - emiPaidThisMonth);

    // Optional: direct a fraction of surplus to extra loan prepayment each month
    let monthlyPrepay = 0;
    if (loanBalance > 0.01 && prepayFraction > 0) {
      monthlyPrepay = Math.min(actualSurplus * prepayFraction, loanBalance);
      loanBalance  -= monthlyPrepay;
      extraPrepayThisMonth += monthlyPrepay;
      if (loanBalance < 0.01 && loanCloseMonth === null) {
        loanBalance    = 0;
        loanCloseMonth = month;
      }
    }

    // Whatever remains after prepayment goes to SIP; after loan closes, all surplus goes to SIP
    const sip = actualSurplus - monthlyPrepay;

    investmentCorpus = investmentCorpus * (1 + monthlyEquityReturn) + sip;
    houseValue       = houseValue       * (1 + monthlyREAppreciation);

    const safeCorpus  = Math.max(0, investmentCorpus);
    const safeBalance = Math.max(0, loanBalance);
    const netWorth    = houseValue + safeCorpus - safeBalance;

    const inflationFactor  = Math.pow(1 + monthlyInflation, month);
    const realNetWorth     = netWorth   / inflationFactor;
    const realInvestCorpus = safeCorpus / inflationFactor;
    const realHouseValue   = houseValue / inflationFactor;

    history.push({
      month,
      year:             month / 12,
      loanBalance:      safeBalance,
      investmentCorpus: safeCorpus,
      houseValue,
      netWorth,
      realNetWorth,
      realInvestCorpus,
      realHouseValue,
      emiInterest:  emiInterestThisMonth,
      emiPrincipal: emiPrincipalThisMonth,
      extraPrepay:  extraPrepayThisMonth,
      sip,
    });
  }

  // SIP milestone schedule
  const milestoneYears = [1, 5, 10, 15, 25, 30].filter(y => y <= horizonYears);
  const sipSchedule = milestoneYears.map(y => ({
    year: y,
    monthlySIP: Math.round(history[y * 12 - 1]?.sip ?? 0),
  }));

  return {
    history,
    summary: {
      emi,
      day0LumpSum,
      loanCloseMonth,
      loanCloseYear:        loanCloseMonth ? loanCloseMonth / 12 : null,
      totalInterestPaid,
      terminalNetWorth:     history[history.length - 1].netWorth,
      terminalRealNetWorth: history[history.length - 1].realNetWorth,
      sipSchedule,
    },
  };
}
