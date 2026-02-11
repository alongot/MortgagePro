import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/rates/history - Get historical mortgage rates
export async function GET(request: NextRequest) {
  const supabase = createClient();

  const searchParams = request.nextUrl.searchParams;
  const rateType = searchParams.get("rate_type") || "30_fixed";
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");
  const limit = parseInt(searchParams.get("limit") || "52"); // Default 1 year of weekly data

  let query = supabase
    .from("mortgage_rates")
    .select("rate_date, rate_value")
    .eq("rate_type", rateType)
    .order("rate_date", { ascending: false });

  if (startDate) {
    query = query.gte("rate_date", startDate);
  }

  if (endDate) {
    query = query.lte("rate_date", endDate);
  }

  query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error("Rates history error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform for charting
  const history = (data || []).reverse().map((r) => ({
    date: r.rate_date,
    rate: parseFloat(r.rate_value),
  }));

  return NextResponse.json({
    rate_type: rateType,
    history,
    count: history.length,
  });
}
