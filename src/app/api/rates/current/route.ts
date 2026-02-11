import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/rates/current - Get latest mortgage rates
export async function GET() {
  const supabase = createClient();

  // Get latest rate for each type
  const rateTypes = ["30_fixed", "15_fixed", "5_1_arm"];
  const rates: Record<string, { rate: number; date: string }> = {};

  for (const rateType of rateTypes) {
    const { data, error } = await supabase
      .from("mortgage_rates")
      .select("rate_value, rate_date")
      .eq("rate_type", rateType)
      .order("rate_date", { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      rates[rateType] = {
        rate: parseFloat(data.rate_value),
        date: data.rate_date,
      };
    }
  }

  // If no rates in DB, return fallback current rates
  if (Object.keys(rates).length === 0) {
    return NextResponse.json({
      "30_fixed": { rate: 6.5, date: new Date().toISOString().split("T")[0] },
      "15_fixed": { rate: 5.75, date: new Date().toISOString().split("T")[0] },
      "5_1_arm": { rate: 6.0, date: new Date().toISOString().split("T")[0] },
      source: "fallback",
    });
  }

  return NextResponse.json({
    ...rates,
    source: "freddie_mac",
  });
}
