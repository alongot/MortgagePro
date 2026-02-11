/**
 * Rate Estimation Logic
 *
 * Calculates adjusted mortgage rates based on:
 * - Current Freddie Mac base rate
 * - LTV adjustment
 * - Loan type (jumbo, FHA)
 * - Property type (condo)
 * - Occupancy (investment)
 * - Credit score
 */

export interface LoanScenario {
  loanAmount: number;
  propertyValue: number;
  loanType: "conventional" | "fha" | "va" | "jumbo" | "usda";
  propertyType: "single_family" | "condo" | "townhouse" | "multi_family";
  occupancy: "primary" | "secondary" | "investment";
  creditScore?: number; // Optional, defaults to 740
  loanTerm?: number; // In years, defaults to 30
  isArm?: boolean;
}

export interface RateEstimate {
  baseRate: number;
  adjustedRate: number;
  adjustments: RateAdjustment[];
  monthlyPayment: number;
  totalInterest: number;
  apr: number; // Includes estimated closing costs
  currentRate?: number; // The borrower's current rate, if provided
  monthlySavings?: number;
  lifetimeSavings?: number;
}

export interface RateAdjustment {
  factor: string;
  adjustment: number;
  reason: string;
}

// Rate adjustment constants
const ADJUSTMENTS = {
  // LTV adjustments
  LTV_BELOW_60: -0.125, // Reward for low LTV
  LTV_60_TO_80: 0,
  LTV_80_TO_90: 0.25,
  LTV_90_TO_95: 0.5,
  LTV_ABOVE_95: 0.75,

  // Loan type adjustments
  JUMBO: 0.25,
  FHA: 0.125,
  VA: 0, // VA typically has competitive rates
  USDA: 0,

  // Property type adjustments
  CONDO: 0.125,
  MULTI_FAMILY: 0.375,

  // Occupancy adjustments
  SECONDARY_HOME: 0.25,
  INVESTMENT: 0.5,

  // Credit score adjustments (base is 740+)
  CREDIT_760_PLUS: -0.125,
  CREDIT_720_TO_739: 0.125,
  CREDIT_700_TO_719: 0.25,
  CREDIT_680_TO_699: 0.5,
  CREDIT_660_TO_679: 0.75,
  CREDIT_BELOW_660: 1.0,

  // ARM discount
  ARM_5_1: -0.5,
};

/**
 * Calculate LTV ratio
 */
export function calculateLTV(loanAmount: number, propertyValue: number): number {
  return (loanAmount / propertyValue) * 100;
}

/**
 * Calculate monthly mortgage payment (P&I)
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;

  if (monthlyRate === 0) {
    return principal / numPayments;
  }

  return (
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}

/**
 * Calculate total interest over the life of the loan
 */
export function calculateTotalInterest(
  principal: number,
  monthlyPayment: number,
  termYears: number
): number {
  return monthlyPayment * termYears * 12 - principal;
}

/**
 * Estimate closing costs as percentage of loan amount
 */
export function estimateClosingCosts(loanAmount: number): number {
  // Typical closing costs are 2-5% of loan amount
  // Use 3% as middle estimate
  return loanAmount * 0.03;
}

/**
 * Calculate APR including estimated closing costs
 */
export function calculateAPR(
  principal: number,
  annualRate: number,
  termYears: number,
  closingCosts: number
): number {
  // APR calculation: effective rate when closing costs are added to loan
  const totalAmount = principal + closingCosts;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears);

  // Binary search for APR
  let low = annualRate;
  let high = annualRate + 2;
  let apr = annualRate;

  for (let i = 0; i < 50; i++) {
    apr = (low + high) / 2;
    const testPayment = calculateMonthlyPayment(totalAmount, apr, termYears);

    if (Math.abs(testPayment - monthlyPayment) < 0.01) {
      break;
    }

    if (testPayment > monthlyPayment) {
      high = apr;
    } else {
      low = apr;
    }
  }

  return Math.round(apr * 1000) / 1000;
}

/**
 * Estimate adjusted rate based on loan scenario
 */
export function estimateRate(
  baseRate: number,
  scenario: LoanScenario
): RateEstimate {
  const adjustments: RateAdjustment[] = [];
  let adjustedRate = baseRate;

  // Calculate LTV
  const ltv = calculateLTV(scenario.loanAmount, scenario.propertyValue);

  // LTV adjustment
  if (ltv < 60) {
    adjustments.push({
      factor: "LTV",
      adjustment: ADJUSTMENTS.LTV_BELOW_60,
      reason: `Low LTV (${ltv.toFixed(1)}%) - favorable`,
    });
    adjustedRate += ADJUSTMENTS.LTV_BELOW_60;
  } else if (ltv <= 80) {
    // No adjustment for 60-80%
  } else if (ltv <= 90) {
    adjustments.push({
      factor: "LTV",
      adjustment: ADJUSTMENTS.LTV_80_TO_90,
      reason: `LTV ${ltv.toFixed(1)}% (80-90%)`,
    });
    adjustedRate += ADJUSTMENTS.LTV_80_TO_90;
  } else if (ltv <= 95) {
    adjustments.push({
      factor: "LTV",
      adjustment: ADJUSTMENTS.LTV_90_TO_95,
      reason: `High LTV (${ltv.toFixed(1)}%)`,
    });
    adjustedRate += ADJUSTMENTS.LTV_90_TO_95;
  } else {
    adjustments.push({
      factor: "LTV",
      adjustment: ADJUSTMENTS.LTV_ABOVE_95,
      reason: `Very high LTV (${ltv.toFixed(1)}%)`,
    });
    adjustedRate += ADJUSTMENTS.LTV_ABOVE_95;
  }

  // Loan type adjustment
  if (scenario.loanType === "jumbo") {
    adjustments.push({
      factor: "Loan Type",
      adjustment: ADJUSTMENTS.JUMBO,
      reason: "Jumbo loan premium",
    });
    adjustedRate += ADJUSTMENTS.JUMBO;
  } else if (scenario.loanType === "fha") {
    adjustments.push({
      factor: "Loan Type",
      adjustment: ADJUSTMENTS.FHA,
      reason: "FHA loan adjustment",
    });
    adjustedRate += ADJUSTMENTS.FHA;
  }

  // Property type adjustment
  if (scenario.propertyType === "condo") {
    adjustments.push({
      factor: "Property Type",
      adjustment: ADJUSTMENTS.CONDO,
      reason: "Condo property adjustment",
    });
    adjustedRate += ADJUSTMENTS.CONDO;
  } else if (scenario.propertyType === "multi_family") {
    adjustments.push({
      factor: "Property Type",
      adjustment: ADJUSTMENTS.MULTI_FAMILY,
      reason: "Multi-family property adjustment",
    });
    adjustedRate += ADJUSTMENTS.MULTI_FAMILY;
  }

  // Occupancy adjustment
  if (scenario.occupancy === "secondary") {
    adjustments.push({
      factor: "Occupancy",
      adjustment: ADJUSTMENTS.SECONDARY_HOME,
      reason: "Second home adjustment",
    });
    adjustedRate += ADJUSTMENTS.SECONDARY_HOME;
  } else if (scenario.occupancy === "investment") {
    adjustments.push({
      factor: "Occupancy",
      adjustment: ADJUSTMENTS.INVESTMENT,
      reason: "Investment property adjustment",
    });
    adjustedRate += ADJUSTMENTS.INVESTMENT;
  }

  // Credit score adjustment
  const creditScore = scenario.creditScore ?? 740;
  if (creditScore >= 760) {
    adjustments.push({
      factor: "Credit Score",
      adjustment: ADJUSTMENTS.CREDIT_760_PLUS,
      reason: `Excellent credit (${creditScore}+)`,
    });
    adjustedRate += ADJUSTMENTS.CREDIT_760_PLUS;
  } else if (creditScore >= 740) {
    // Base rate, no adjustment
  } else if (creditScore >= 720) {
    adjustments.push({
      factor: "Credit Score",
      adjustment: ADJUSTMENTS.CREDIT_720_TO_739,
      reason: `Good credit (${creditScore})`,
    });
    adjustedRate += ADJUSTMENTS.CREDIT_720_TO_739;
  } else if (creditScore >= 700) {
    adjustments.push({
      factor: "Credit Score",
      adjustment: ADJUSTMENTS.CREDIT_700_TO_719,
      reason: `Credit score ${creditScore}`,
    });
    adjustedRate += ADJUSTMENTS.CREDIT_700_TO_719;
  } else if (creditScore >= 680) {
    adjustments.push({
      factor: "Credit Score",
      adjustment: ADJUSTMENTS.CREDIT_680_TO_699,
      reason: `Credit score ${creditScore}`,
    });
    adjustedRate += ADJUSTMENTS.CREDIT_680_TO_699;
  } else if (creditScore >= 660) {
    adjustments.push({
      factor: "Credit Score",
      adjustment: ADJUSTMENTS.CREDIT_660_TO_679,
      reason: `Fair credit (${creditScore})`,
    });
    adjustedRate += ADJUSTMENTS.CREDIT_660_TO_679;
  } else {
    adjustments.push({
      factor: "Credit Score",
      adjustment: ADJUSTMENTS.CREDIT_BELOW_660,
      reason: `Below average credit (${creditScore})`,
    });
    adjustedRate += ADJUSTMENTS.CREDIT_BELOW_660;
  }

  // ARM adjustment
  if (scenario.isArm) {
    adjustments.push({
      factor: "Product Type",
      adjustment: ADJUSTMENTS.ARM_5_1,
      reason: "5/1 ARM initial rate discount",
    });
    adjustedRate += ADJUSTMENTS.ARM_5_1;
  }

  // Round to 3 decimal places
  adjustedRate = Math.round(adjustedRate * 1000) / 1000;

  // Calculate payment details
  const termYears = scenario.loanTerm ?? 30;
  const monthlyPayment = calculateMonthlyPayment(
    scenario.loanAmount,
    adjustedRate,
    termYears
  );
  const totalInterest = calculateTotalInterest(
    scenario.loanAmount,
    monthlyPayment,
    termYears
  );
  const closingCosts = estimateClosingCosts(scenario.loanAmount);
  const apr = calculateAPR(
    scenario.loanAmount,
    adjustedRate,
    termYears,
    closingCosts
  );

  return {
    baseRate,
    adjustedRate,
    adjustments,
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(totalInterest),
    apr,
  };
}

/**
 * Calculate potential savings from refinancing
 */
export function calculateRefinanceSavings(
  currentRate: number,
  currentLoanBalance: number,
  newRate: number,
  remainingTermYears: number
): { monthlySavings: number; lifetimeSavings: number } {
  const currentMonthly = calculateMonthlyPayment(
    currentLoanBalance,
    currentRate,
    remainingTermYears
  );
  const newMonthly = calculateMonthlyPayment(
    currentLoanBalance,
    newRate,
    remainingTermYears
  );

  const monthlySavings = Math.round(currentMonthly - newMonthly);
  const lifetimeSavings = Math.round(monthlySavings * remainingTermYears * 12);

  return { monthlySavings, lifetimeSavings };
}
