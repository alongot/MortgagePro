// BatchData API Client
// Docs: https://developer.batchdata.com/docs/batchdata/welcome-to-batchdata

const BATCHDATA_API_URL = "https://api.batchdata.com/api/v1";

export interface BatchDataProperty {
  id: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    county: string;
    formatted: string;
  };
  property: {
    type: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    lotSize: number;
    yearBuilt: number;
    pool: boolean;
  };
  valuation: {
    estimatedValue: number;
    assessedValue: number;
    taxAmount: number;
  };
  owner: {
    names: string[];
    mailingAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    ownerOccupied: boolean;
    ownershipLength: number;
  };
  lastSale: {
    date: string;
    price: number;
    lender: string;
    loanAmount: number;
    loanType: string;
    interestRate: number | null;
  } | null;
  mortgage: {
    lender: string;
    amount: number;
    date: string;
    type: string;
    interestRate: number | null;
    interestRateType: "fixed" | "arm" | null;
    maturityDate: string | null;
  } | null;
}

export interface PropertySearchParams {
  city: string;
  state: string;
  zip?: string;
  // Sale date filters
  saleDateMin?: string; // YYYY-MM-DD
  saleDateMax?: string;
  // Property filters
  propertyType?: "single_family" | "condo" | "townhouse" | "multi_family";
  minValue?: number;
  maxValue?: number;
  // Mortgage filters
  hasLoan?: boolean;
  loanType?: "conventional" | "fha" | "va" | "jumbo";
  // Results
  limit?: number;
  offset?: number;
}

export interface PropertySearchResponse {
  success: boolean;
  results: BatchDataProperty[];
  total: number;
  limit: number;
  offset: number;
}

async function batchDataRequest<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const apiKey = process.env.BATCHDATA_API_KEY;

  if (!apiKey) {
    throw new Error("BATCHDATA_API_KEY is not configured");
  }

  const response = await fetch(`${BATCHDATA_API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("BatchData API error:", response.status, errorText);
    throw new Error(`BatchData API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Search for properties in a given city that were sold during high interest rate periods
 * Perfect for finding refinancing opportunities
 */
export async function searchPropertiesForRefinancing(
  params: PropertySearchParams
): Promise<PropertySearchResponse> {
  const searchBody: Record<string, unknown> = {
    location: {
      city: params.city,
      state: params.state,
      ...(params.zip && { zip: params.zip }),
    },
    filters: {
      // Only properties with mortgages
      hasLoan: true,
      // Sale date range (high interest rate period: 2022-2023)
      ...(params.saleDateMin && { saleDateMin: params.saleDateMin }),
      ...(params.saleDateMax && { saleDateMax: params.saleDateMax }),
      // Property type filter
      ...(params.propertyType && { propertyType: params.propertyType }),
      // Value filters
      ...(params.minValue && { minValue: params.minValue }),
      ...(params.maxValue && { maxValue: params.maxValue }),
      // Loan type filter
      ...(params.loanType && { loanType: params.loanType }),
    },
    options: {
      limit: params.limit || 10,
      offset: params.offset || 0,
      // Include mortgage and owner data
      includeOwner: true,
      includeMortgage: true,
      includeValuation: true,
    },
  };

  return batchDataRequest<PropertySearchResponse>(
    "/property/search",
    searchBody
  );
}

/**
 * Get properties sold during high interest rate period (2022-2023)
 * These are prime candidates for refinancing
 */
export async function getHighRateProperties(
  city: string,
  state: string,
  limit: number = 10
): Promise<BatchDataProperty[]> {
  try {
    const response = await searchPropertiesForRefinancing({
      city,
      state,
      // Properties sold during peak rate period (rates were 6-7%+)
      saleDateMin: "2022-01-01",
      saleDateMax: "2023-12-31",
      hasLoan: true,
      limit,
    });

    // Filter to only include properties with identifiable high rates
    // or properties sold during the high rate window
    return response.results.filter((prop) => {
      // If we have the rate, check if it's above 6%
      if (prop.mortgage?.interestRate) {
        return prop.mortgage.interestRate >= 6.0;
      }
      // Otherwise include all from the high rate period
      return true;
    });
  } catch (error) {
    console.error("Error fetching high rate properties:", error);
    throw error;
  }
}

/**
 * Transform BatchData property to our internal format
 */
export function transformToProperty(batchProp: BatchDataProperty) {
  return {
    property: {
      address: batchProp.address.street,
      city: batchProp.address.city,
      state: batchProp.address.state,
      zip: batchProp.address.zip,
      county: batchProp.address.county,
      property_type: batchProp.property.type || "single_family",
      bedrooms: batchProp.property.bedrooms,
      bathrooms: batchProp.property.bathrooms,
      sqft: batchProp.property.sqft,
      lot_size: batchProp.property.lotSize,
      year_built: batchProp.property.yearBuilt,
      estimated_value: batchProp.valuation.estimatedValue,
      last_sale_price: batchProp.lastSale?.price || null,
      last_sale_date: batchProp.lastSale?.date || null,
    },
    owner: {
      first_name: batchProp.owner.names[0]?.split(" ")[0] || "Unknown",
      last_name: batchProp.owner.names[0]?.split(" ").slice(1).join(" ") || "",
      mailing_address: batchProp.owner.mailingAddress.street,
      mailing_city: batchProp.owner.mailingAddress.city,
      mailing_state: batchProp.owner.mailingAddress.state,
      mailing_zip: batchProp.owner.mailingAddress.zip,
      is_absentee: !batchProp.owner.ownerOccupied,
      ownership_length_years: batchProp.owner.ownershipLength || 1,
    },
    mortgage: batchProp.mortgage
      ? {
          lender_name: batchProp.mortgage.lender,
          loan_amount: batchProp.mortgage.amount,
          interest_rate: batchProp.mortgage.interestRate || 6.5, // Default to typical 2022-2023 rate
          loan_type:
            batchProp.mortgage.type === "jumbo"
              ? "jumbo"
              : batchProp.mortgage.type === "fha"
                ? "fha"
                : batchProp.mortgage.type === "va"
                  ? "va"
                  : "conventional",
          origination_date: batchProp.mortgage.date,
          maturity_date: batchProp.mortgage.maturityDate,
          is_arm: batchProp.mortgage.interestRateType === "arm",
          arm_reset_date: null,
          estimated_equity: Math.max(
            0,
            batchProp.valuation.estimatedValue - batchProp.mortgage.amount
          ),
          ltv_ratio:
            (batchProp.mortgage.amount / batchProp.valuation.estimatedValue) *
            100,
        }
      : null,
  };
}
