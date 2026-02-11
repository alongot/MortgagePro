// Mortgage Estimator
// Estimates current mortgage balance and rate from sale data + Freddie Mac historical rates

import { createClient } from "@supabase/supabase-js";

interface MortgageEstimate {
  originalAmount: number;
  originalDate: string;
  originalRate: number;
  rateSource: "recorded" | "freddie_mac" | "estimated";
  currentBalance: number;
  monthlyPayment: number;
  termYears: number;
  paymentsRemaining: number;
  equityPercent: number;
  ltvPercent: number;
}

interface EstimateInput {
  loanAmount: number;
  originationDate: string;
  recordedRate?: number;
  propertyValue: number;
  termYears?: number;
}

// Get historical rate from Freddie Mac PMMS data in our database
async function getHistoricalRate(date: string): Promise<number | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Parse the date and find the closest rate
  const targetDate = new Date(date);

  // Get the rate closest to the origination date (within 30 days before)
  const { data, error } = await supabase
    .from("mortgage_rates")
    .select("rate_value, rate_date")
    .eq("rate_type", "30_fixed")
    .lte("rate_date", date)
    .order("rate_date", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    console.error("Error fetching historical rate:", error);
    return null;
  }

  return parseFloat(data[0].rate_value);
}

// Estimate rate based on date if no historical data available
function estimateRateByDate(date: string): number {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();

  // Historical rate approximations by period
  if (year <= 2019) return 4.5;
  if (year === 2020) return 3.2;
  if (year === 2021) return 3.0;
  if (year === 2022 && month < 6) return 4.5;
  if (year === 2022) return 6.5;
  if (year === 2023 && month < 6) return 6.5;
  if (year === 2023) return 7.2;
  if (year === 2024) return 7.0;
  return 6.8; // 2025+
}

// Calculate remaining balance using amortization formula
function calculateRemainingBalance(
  principal: number,
  annualRate: number,
  termYears: number,
  monthsPaid: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = termYears * 12;

  if (monthsPaid >= totalPayments) return 0;

  // Monthly payment
  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);

  // Remaining balance after monthsPaid payments
  const remainingBalance =
    principal * Math.pow(1 + monthlyRate, monthsPaid) -
    (monthlyPayment * (Math.pow(1 + monthlyRate, monthsPaid) - 1)) / monthlyRate;

  return Math.max(0, remainingBalance);
}

// Calculate monthly payment
function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = termYears * 12;

  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1)
  );
}

export async function estimateMortgage(
  input: EstimateInput
): Promise<MortgageEstimate> {
  const { loanAmount, originationDate, recordedRate, propertyValue, termYears = 30 } = input;

  // Determine the interest rate
  let rate: number;
  let rateSource: "recorded" | "freddie_mac" | "estimated";

  if (recordedRate && recordedRate > 0) {
    rate = recordedRate;
    rateSource = "recorded";
  } else {
    const historicalRate = await getHistoricalRate(originationDate);
    if (historicalRate) {
      rate = historicalRate;
      rateSource = "freddie_mac";
    } else {
      rate = estimateRateByDate(originationDate);
      rateSource = "estimated";
    }
  }

  // Calculate months since origination
  const originDate = new Date(originationDate);
  const now = new Date();
  const monthsPaid = Math.floor(
    (now.getTime() - originDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );

  // Calculate current balance
  const currentBalance = calculateRemainingBalance(
    loanAmount,
    rate,
    termYears,
    monthsPaid
  );

  // Calculate monthly payment
  const monthlyPayment = calculateMonthlyPayment(loanAmount, rate, termYears);

  // Calculate equity and LTV
  const equityPercent = ((propertyValue - currentBalance) / propertyValue) * 100;
  const ltvPercent = (currentBalance / propertyValue) * 100;

  return {
    originalAmount: loanAmount,
    originalDate: originationDate,
    originalRate: rate,
    rateSource,
    currentBalance: Math.round(currentBalance),
    monthlyPayment: Math.round(monthlyPayment),
    termYears,
    paymentsRemaining: Math.max(0, termYears * 12 - monthsPaid),
    equityPercent: Math.round(equityPercent * 10) / 10,
    ltvPercent: Math.round(ltvPercent * 10) / 10,
  };
}

// Estimate mortgage from sale price (assumes 80% LTV at purchase)
export async function estimateMortgageFromSale(
  salePrice: number,
  saleDate: string,
  currentValue: number,
  assumedLtv: number = 80
): Promise<MortgageEstimate> {
  const loanAmount = salePrice * (assumedLtv / 100);

  return estimateMortgage({
    loanAmount,
    originationDate: saleDate,
    propertyValue: currentValue,
  });
}

// Calculate potential refinance savings
export function calculateRefinanceSavings(
  currentBalance: number,
  currentRate: number,
  newRate: number,
  remainingYears: number
): {
  currentMonthlyPayment: number;
  newMonthlyPayment: number;
  monthlySavings: number;
  totalSavings: number;
  breakEvenMonths: number;
} {
  const currentPayment = calculateMonthlyPayment(
    currentBalance,
    currentRate,
    remainingYears
  );
  const newPayment = calculateMonthlyPayment(currentBalance, newRate, remainingYears);

  const monthlySavings = currentPayment - newPayment;
  const totalSavings = monthlySavings * remainingYears * 12;

  // Assume $3,000 closing costs for break-even calculation
  const closingCosts = 3000;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : Infinity;

  return {
    currentMonthlyPayment: Math.round(currentPayment),
    newMonthlyPayment: Math.round(newPayment),
    monthlySavings: Math.round(monthlySavings),
    totalSavings: Math.round(totalSavings),
    breakEvenMonths,
  };
}
