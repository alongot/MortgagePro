import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  estimateRate,
  calculateRefinanceSavings,
  type LoanScenario,
} from "@/lib/rates/estimate";

// POST /api/rates/estimate - Estimate rate for a loan scenario
export async function POST(request: NextRequest) {
  const supabase = createClient();

  try {
    const body = await request.json();
    const {
      loan_amount,
      property_value,
      loan_type,
      property_type,
      occupancy,
      credit_score,
      loan_term,
      is_arm,
      current_rate, // For refinance savings calculation
    } = body;

    // Validate required fields
    if (!loan_amount || !property_value) {
      return NextResponse.json(
        { error: "loan_amount and property_value are required" },
        { status: 400 }
      );
    }

    // Get current base rate from database
    const { data: currentRateData } = await supabase
      .from("mortgage_rates")
      .select("rate_value")
      .eq("rate_type", is_arm ? "5_1_arm" : "30_fixed")
      .order("rate_date", { ascending: false })
      .limit(1)
      .single();

    // Fallback base rate if no data
    const baseRate = currentRateData
      ? parseFloat(currentRateData.rate_value)
      : is_arm
        ? 6.0
        : 6.5;

    // Build scenario
    const scenario: LoanScenario = {
      loanAmount: loan_amount,
      propertyValue: property_value,
      loanType: loan_type || "conventional",
      propertyType: property_type || "single_family",
      occupancy: occupancy || "primary",
      creditScore: credit_score,
      loanTerm: loan_term || 30,
      isArm: is_arm || false,
    };

    // Calculate estimate
    const estimate = estimateRate(baseRate, scenario);

    // Calculate refinance savings if current rate provided
    if (current_rate && current_rate > estimate.adjustedRate) {
      const savings = calculateRefinanceSavings(
        current_rate,
        loan_amount,
        estimate.adjustedRate,
        loan_term || 30
      );
      estimate.currentRate = current_rate;
      estimate.monthlySavings = savings.monthlySavings;
      estimate.lifetimeSavings = savings.lifetimeSavings;
    }

    return NextResponse.json(estimate);
  } catch (e) {
    console.error("Rate estimate error:", e);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
