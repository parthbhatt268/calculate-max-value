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
    prepaySplitPercent,
    horizonYears,
  } = state;

  const loanAmount = housePrice - downPayment;
  const maxAvailableForDeployment = state.liquidSavings - state.miscCosts - state.emergencyFund;
  const day0LumpSum = Math.max(0, maxAvailableForDeployment - downPayment);

  // EMI: P × r × (1+r)^n / ((1+r)^n − 1)
  // r = annual_rate / 100 / 12  (simple division — how Indian banks compute EMIs)
  const monthlyRate = loanInterestRate / 100 / 12;
  const n = loanTenureYears * 12;

  let emi = 0;
  if (loanAmount > 0 && monthlyRate > 0) {
    const factor = Math.pow(1 + monthlyRate, n);
    emi = (loanAmount * monthlyRate * factor) / (factor - 1);
  } else if (loanAmount > 0) {
    emi = loanAmount / n;
  }

  // Compound monthly conversions for equity / RE / inflation
  const monthlyEquityReturn   = Math.pow(1 + equityReturn, 1 / 12) - 1;
  const monthlyREAppreciation = Math.pow(1 + realEstateAppreciation, 1 / 12) - 1;
  const monthlyInflation      = Math.pow(1 + inflation, 1 / 12) - 1;

  let loanBalance      = loanAmount;
  let investmentCorpus = day0LumpSum;
  let houseValue       = housePrice;
  let totalInterestPaid = 0;
  let loanCloseMonth   = null;
  const history        = [];

  const totalMonths = horizonYears * 12;

  for (let month = 1; month <= totalMonths; month++) {
    const yearIndex    = Math.floor((month - 1) / 12);
    const incomeNow    = monthlyIncome   * Math.pow(1 + incomeStepUpRate,   yearIndex);
    const expensesNow  = monthlyExpenses * Math.pow(1 + expensesStepUpRate, yearIndex);

    let emiInterestThisMonth  = 0;
    let emiPrincipalThisMonth = 0;
    let emiPaidThisMonth      = 0;
    let extraPrepayThisMonth  = 0;

    if (loanBalance > 0.01) {
      // 2.2 Monthly amortisation
      const interest  = loanBalance * monthlyRate;
      const principal = Math.min(emi - interest, loanBalance);
      loanBalance          -= principal;
      totalInterestPaid    += interest;
      emiInterestThisMonth  = interest;
      emiPrincipalThisMonth = principal;
      emiPaidThisMonth      = interest + principal;

      // 2.3 Annual extra EMIs — last month of each year
      if (month % 12 === 0 && extraEMIsPerYear > 0 && loanBalance > 0.01) {
        const extraPayment = Math.min(emi * extraEMIsPerYear, loanBalance);
        loanBalance           -= extraPayment;
        emiPaidThisMonth      += extraPayment;
        extraPrepayThisMonth  += extraPayment;
      }

      if (loanBalance < 0.01 && loanCloseMonth === null) {
        loanBalance    = 0;
        loanCloseMonth = month;
      }
    }

    // 2.4 Surplus → prepay / SIP split
    const surplus = Math.max(0, incomeNow - expensesNow - emiPaidThisMonth);

    let sip = 0;
    if (loanBalance > 0.01) {
      const desiredPrepay = surplus * (prepaySplitPercent / 100);
      const desiredSip    = surplus - desiredPrepay;
      const actualPrepay  = Math.min(desiredPrepay, loanBalance);
      loanBalance        -= actualPrepay;
      sip                 = desiredSip + (desiredPrepay - actualPrepay); // overflow → SIP
      extraPrepayThisMonth += actualPrepay;
      if (loanBalance < 0.01 && loanCloseMonth === null) {
        loanBalance    = 0;
        loanCloseMonth = month;
      }
    } else {
      sip = surplus; // post-closure: freed EMI implicitly absorbed here
    }

    // 2.6 Investment corpus growth (compound monthly return)
    investmentCorpus = investmentCorpus * (1 + monthlyEquityReturn) + sip;

    // 2.7 House value growth (compound monthly)
    houseValue = houseValue * (1 + monthlyREAppreciation);

    // 2.8 Net worth
    const netWorth = houseValue + Math.max(0, investmentCorpus) - Math.max(0, loanBalance);

    // 2.9 Inflation adjustment
    const realNetWorth = netWorth / Math.pow(1 + monthlyInflation, month);

    history.push({
      month,
      year:             month / 12,
      loanBalance:      Math.max(0, loanBalance),
      investmentCorpus: Math.max(0, investmentCorpus),
      houseValue,
      netWorth,
      realNetWorth,
      // Cash flow breakdown (for CashFlowChart)
      emiInterest:  emiInterestThisMonth,
      emiPrincipal: emiPrincipalThisMonth,
      extraPrepay:  extraPrepayThisMonth,
      sip,
    });
  }

  return {
    history,
    summary: {
      emi,
      day0LumpSum,
      loanCloseMonth,
      loanCloseYear: loanCloseMonth ? loanCloseMonth / 12 : null,
      totalInterestPaid,
      terminalNetWorth:     history[history.length - 1].netWorth,
      terminalRealNetWorth: history[history.length - 1].realNetWorth,
    },
  };
}
