import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  searchProperties as searchDatafiniti,
  transformToInternalFormat,
  DatafinitiProperty,
} from "@/lib/api/datafiniti";
import {
  estimateMortgageFromSale,
  calculateRefinanceSavings,
} from "@/lib/rates/mortgage-estimator";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Lookup a property by address
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");
  const city = searchParams.get("city");
  const state = searchParams.get("state") || "TX";
  const zipCode = searchParams.get("zip");
  const saveToDb = searchParams.get("save") === "true";

  if (!address || !city) {
    return NextResponse.json(
      { error: "Address and city are required" },
      { status: 400 }
    );
  }

  try {
    // Check if we already have this property in our database
    const { data: existingProperty } = await supabase
      .from("properties")
      .select("*, owners(*), mortgage_records(*)")
      .ilike("address", `%${address}%`)
      .ilike("city", city)
      .limit(1)
      .single();

    if (existingProperty) {
      return NextResponse.json({
        source: "database",
        property: formatExistingProperty(existingProperty),
      });
    }

    // Lookup via Datafiniti API
    const datafinitResult = await lookupPropertyDatafiniti(address, city, state);

    if (!datafinitResult) {
      return NextResponse.json(
        { error: "Property not found. Check the address and try again." },
        { status: 404 }
      );
    }

    // Transform to our internal format
    const transformed = transformToInternalFormat(datafinitResult);

    // Add mortgage estimate and refinance savings
    const processedProperty = await addMortgageCalculations(transformed);

    // Optionally save to database
    if (saveToDb) {
      const savedProperty = await savePropertyToDatabase(processedProperty);
      return NextResponse.json({
        source: "datafiniti",
        saved: true,
        property: savedProperty,
      });
    }

    return NextResponse.json({
      source: "datafiniti",
      saved: false,
      property: processedProperty,
    });
  } catch (error) {
    console.error("Property lookup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lookup failed" },
      { status: 500 }
    );
  }
}

// Search Datafiniti for a specific address
async function lookupPropertyDatafiniti(
  address: string,
  city: string,
  state: string
): Promise<DatafinitiProperty | null> {
  const apiToken = process.env.DATAFINITI_API_KEY;

  if (!apiToken) {
    throw new Error("DATAFINITI_API_KEY is not configured");
  }

  // Build query for specific address
  const query = `address:"${address}" AND city:"${city}" AND province:${state} AND country:US`;

  console.log("Datafiniti lookup query:", query);

  const response = await fetch("https://api.datafiniti.co/v4/properties/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      query,
      num_records: 1,
      format: "JSON",
      download: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Datafiniti API error:", response.status, errorText);
    throw new Error(`Datafiniti API error: ${response.status}`);
  }

  const data = await response.json();
  console.log("Datafiniti response:", JSON.stringify(data).slice(0, 500));

  if (data.records && data.records.length > 0) {
    return data.records[0];
  }

  return null;
}

// Add mortgage calculations to transformed property
async function addMortgageCalculations(transformed: ReturnType<typeof transformToInternalFormat>) {
  const { property, owner, mortgage } = transformed;

  let mortgageEstimate = null;
  let refinanceSavings = null;

  if (property.last_sale_date && property.last_sale_price) {
    // Estimate mortgage from sale
    mortgageEstimate = await estimateMortgageFromSale(
      property.last_sale_price,
      property.last_sale_date,
      property.estimated_value || property.last_sale_price,
      80
    );

    // Get current rate for refinance calculation
    const { data: currentRateData } = await supabase
      .from("mortgage_rates")
      .select("rate_value")
      .eq("rate_type", "30_fixed")
      .order("rate_date", { ascending: false })
      .limit(1)
      .single();

    if (currentRateData && mortgageEstimate.originalRate > parseFloat(currentRateData.rate_value) + 0.5) {
      refinanceSavings = calculateRefinanceSavings(
        mortgageEstimate.currentBalance,
        mortgageEstimate.originalRate,
        parseFloat(currentRateData.rate_value),
        Math.ceil(mortgageEstimate.paymentsRemaining / 12)
      );
    }
  }

  return {
    address: property.address,
    city: property.city,
    state: property.state,
    zip_code: property.zip,
    county: property.county,
    property_type: property.property_type,
    year_built: property.year_built,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sqft: property.sqft,
    lot_size_sqft: property.lot_size,
    estimated_value: property.estimated_value,
    last_sale_date: property.last_sale_date,
    last_sale_price: property.last_sale_price,
    owner_name: `${owner.first_name} ${owner.last_name}`.trim(),
    owner_mailing_address: owner.mailing_address,
    owner_mailing_city: owner.mailing_city,
    owner_mailing_state: owner.mailing_state,
    owner_mailing_zip: owner.mailing_zip,
    owner_occupied: !owner.is_absentee,
    absentee_owner: owner.is_absentee,
    phone: owner.phone,
    email: owner.email,
    mortgage_estimate: mortgageEstimate,
    refinance_savings: refinanceSavings,
    original_mortgage: mortgage,
    data_source: "datafiniti",
    fetched_at: new Date().toISOString(),
  };
}

// Format existing property from database
function formatExistingProperty(existing: Record<string, unknown>) {
  return {
    address: existing.address,
    city: existing.city,
    state: existing.state,
    zip_code: existing.zip,
    county: existing.county,
    property_type: existing.property_type,
    year_built: existing.year_built,
    bedrooms: existing.bedrooms,
    bathrooms: existing.bathrooms,
    sqft: existing.sqft,
    estimated_value: existing.estimated_value,
    last_sale_date: existing.last_sale_date,
    last_sale_price: existing.last_sale_price,
    owner_name: (existing.owners as Record<string, unknown>[])?.[0]?.first_name
      ? `${(existing.owners as Record<string, unknown>[])[0].first_name} ${(existing.owners as Record<string, unknown>[])[0].last_name}`
      : null,
    owner_occupied: (existing.owners as Record<string, unknown>[])?.[0]?.is_absentee === false,
    absentee_owner: (existing.owners as Record<string, unknown>[])?.[0]?.is_absentee === true,
    mortgage_estimate: (existing.mortgage_records as Record<string, unknown>[])?.[0]
      ? {
          originalAmount: (existing.mortgage_records as Record<string, unknown>[])[0].original_amount,
          originalRate: (existing.mortgage_records as Record<string, unknown>[])[0].interest_rate,
          currentBalance: (existing.mortgage_records as Record<string, unknown>[])[0].estimated_balance,
          monthlyPayment: (existing.mortgage_records as Record<string, unknown>[])[0].monthly_payment,
        }
      : null,
    data_source: "database",
  };
}

// Save processed property to our database
async function savePropertyToDatabase(property: Awaited<ReturnType<typeof addMortgageCalculations>>) {
  // Insert property
  const { data: savedProperty, error: propertyError } = await supabase
    .from("properties")
    .insert({
      address: property.address,
      city: property.city,
      state: property.state,
      zip: property.zip_code,
      county: property.county,
      property_type: property.property_type || "single_family",
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      sqft: property.sqft,
      lot_size: property.lot_size_sqft,
      year_built: property.year_built,
      estimated_value: property.estimated_value,
      last_sale_date: property.last_sale_date,
      last_sale_price: property.last_sale_price,
    })
    .select()
    .single();

  if (propertyError) {
    console.error("Error saving property:", propertyError);
    throw new Error("Failed to save property");
  }

  // Insert owner if we have one
  if (property.owner_name && property.owner_name !== "Unknown") {
    const nameParts = property.owner_name.split(" ");
    const firstName = nameParts[0] || "Unknown";
    const lastName = nameParts.slice(1).join(" ") || "";

    const { error: ownerError } = await supabase.from("owners").insert({
      property_id: savedProperty.id,
      first_name: firstName,
      last_name: lastName,
      mailing_address: property.owner_mailing_address,
      mailing_city: property.owner_mailing_city,
      mailing_state: property.owner_mailing_state,
      mailing_zip: property.owner_mailing_zip,
      is_absentee: property.absentee_owner,
      phone: property.phone,
      email: property.email,
    });

    if (ownerError) {
      console.error("Error saving owner:", ownerError);
    }
  }

  // Insert mortgage record if we have estimate data
  if (property.mortgage_estimate) {
    const { error: mortgageError } = await supabase.from("mortgage_records").insert({
      property_id: savedProperty.id,
      loan_amount: property.mortgage_estimate.originalAmount,
      origination_date: property.last_sale_date,
      interest_rate: property.mortgage_estimate.originalRate,
      loan_type: "conventional",
      estimated_equity: property.estimated_value - property.mortgage_estimate.currentBalance,
      monthly_payment: property.mortgage_estimate.monthlyPayment,
    });

    if (mortgageError) {
      console.error("Error saving mortgage:", mortgageError);
    }
  }

  return {
    ...property,
    id: savedProperty.id,
    saved: true,
  };
}

// POST - Search for properties in a city (for bulk leads)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city, state, limit = 10, saveToDb = false } = body as {
      city: string;
      state: string;
      limit?: number;
      saveToDb?: boolean;
    };

    if (!city || !state) {
      return NextResponse.json(
        { error: "City and state are required" },
        { status: 400 }
      );
    }

    // Search via Datafiniti
    const results = await searchDatafiniti({
      city,
      state,
      soldAfter: "2022-01-01",
      soldBefore: "2023-12-31",
      limit,
    });

    const properties = await Promise.all(
      results.records.map(async (record) => {
        const transformed = transformToInternalFormat(record);
        const processed = await addMortgageCalculations(transformed);

        if (saveToDb) {
          try {
            return await savePropertyToDatabase(processed);
          } catch {
            return { ...processed, saved: false, error: "Failed to save" };
          }
        }

        return processed;
      })
    );

    return NextResponse.json({
      source: "datafiniti",
      total: results.num_found,
      returned: properties.length,
      properties,
    });
  } catch (error) {
    console.error("Property search error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}
