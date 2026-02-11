import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const searchParams = request.nextUrl.searchParams;

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extract filter parameters
  const query = searchParams.get("query") || "";
  const city = searchParams.get("city") || "";
  const zip = searchParams.get("zip") || "";
  const propertyType = searchParams.get("property_type") || "";
  const loanType = searchParams.get("loan_type") || "";
  const minValue = searchParams.get("min_value");
  const maxValue = searchParams.get("max_value");
  const minEquity = searchParams.get("min_equity");
  const maxEquity = searchParams.get("max_equity");
  const minRate = searchParams.get("min_rate");
  const maxRate = searchParams.get("max_rate");
  const isAbsentee = searchParams.get("is_absentee");
  const isArm = searchParams.get("is_arm");
  const sortBy = searchParams.get("sort_by") || "estimated_value";
  const sortDir = searchParams.get("sort_dir") || "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("per_page") || "25");

  // Build query - only get properties that have leads belonging to this user
  let dbQuery = supabase
    .from("properties")
    .select(
      `
      *,
      owners(*),
      mortgage_records(*),
      leads!inner(*)
    `,
      { count: "exact" }
    )
    .eq("leads.user_id", user.id);

  // Apply filters
  if (query) {
    dbQuery = dbQuery.or(
      `address.ilike.%${query}%,city.ilike.%${query}%`
    );
  }

  if (city) {
    dbQuery = dbQuery.ilike("city", `%${city}%`);
  }

  if (zip) {
    dbQuery = dbQuery.eq("zip", zip);
  }

  if (propertyType) {
    dbQuery = dbQuery.eq("property_type", propertyType);
  }

  if (minValue) {
    dbQuery = dbQuery.gte("estimated_value", parseInt(minValue));
  }

  if (maxValue) {
    dbQuery = dbQuery.lte("estimated_value", parseInt(maxValue));
  }

  // Filter by absentee owner
  if (isAbsentee === "true") {
    dbQuery = dbQuery.eq("owners.is_absentee", true);
  }

  // Sort
  const ascending = sortDir === "asc";
  dbQuery = dbQuery.order(sortBy, { ascending });

  // Paginate
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  dbQuery = dbQuery.range(from, to);

  const { data, error, count } = await dbQuery;

  if (error) {
    console.error("Properties query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Post-process to filter by mortgage fields (since Supabase doesn't support filtering on related tables easily)
  let results = data || [];

  if (loanType) {
    results = results.filter(
      (p) => p.mortgage_records?.[0]?.loan_type === loanType
    );
  }

  if (minEquity) {
    results = results.filter(
      (p) =>
        (p.mortgage_records?.[0]?.estimated_equity ?? 0) >= parseInt(minEquity)
    );
  }

  if (maxEquity) {
    results = results.filter(
      (p) =>
        (p.mortgage_records?.[0]?.estimated_equity ?? 0) <= parseInt(maxEquity)
    );
  }

  if (minRate) {
    results = results.filter(
      (p) =>
        (p.mortgage_records?.[0]?.interest_rate ?? 0) >= parseFloat(minRate)
    );
  }

  if (maxRate) {
    results = results.filter(
      (p) =>
        (p.mortgage_records?.[0]?.interest_rate ?? 0) <= parseFloat(maxRate)
    );
  }

  if (isArm === "true") {
    results = results.filter((p) => p.mortgage_records?.[0]?.is_arm === true);
  }

  // Handle sorting by mortgage fields (not supported in Supabase query)
  if (sortBy === "interest_rate") {
    results = results.sort((a, b) => {
      const rateA = a.mortgage_records?.[0]?.interest_rate ?? 0;
      const rateB = b.mortgage_records?.[0]?.interest_rate ?? 0;
      return ascending ? rateA - rateB : rateB - rateA;
    });
  } else if (sortBy === "estimated_equity") {
    results = results.sort((a, b) => {
      const eqA = a.mortgage_records?.[0]?.estimated_equity ?? 0;
      const eqB = b.mortgage_records?.[0]?.estimated_equity ?? 0;
      return ascending ? eqA - eqB : eqB - eqA;
    });
  }

  // Transform results to match SearchResult type
  const searchResults = results.map((p) => ({
    property: {
      id: p.id,
      address: p.address,
      city: p.city,
      state: p.state,
      zip: p.zip,
      county: p.county,
      property_type: p.property_type,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      sqft: p.sqft,
      lot_size: p.lot_size,
      year_built: p.year_built,
      estimated_value: p.estimated_value,
      last_sale_price: p.last_sale_price,
      last_sale_date: p.last_sale_date,
      created_at: p.created_at,
    },
    owner: p.owners?.[0] || null,
    mortgage: p.mortgage_records?.[0] || null,
    lead: p.leads?.[0] || null,
  }));

  return NextResponse.json({
    data: searchResults,
    total: count || 0,
    page,
    per_page: perPage,
    total_pages: Math.ceil((count || 0) / perPage),
  });
}
