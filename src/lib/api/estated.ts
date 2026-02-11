// Estated API Client
// Docs: https://estated.com/developers/docs

const ESTATED_API_URL = "https://apis.estated.com/v4/property";

export interface EstatedOwner {
  name: string;
  second_name?: string;
  unit_type?: string;
  unit_number?: string;
  formatted_street_address: string;
  city: string;
  state: string;
  zip_code: string;
  zip_plus_four_code?: string;
  owner_occupied: "YES" | "NO" | "UNKNOWN";
}

export interface EstatedStructure {
  year_built?: number;
  effective_year_built?: number;
  stories?: number;
  rooms_count?: number;
  beds_count?: number;
  baths?: number;
  partial_baths_count?: number;
  units_count?: number;
  parking_type?: string;
  parking_spaces_count?: number;
  pool_type?: string;
  architecture_type?: string;
  construction_type?: string;
  roof_style?: string;
  roof_material?: string;
  heating_type?: string;
  heating_fuel_type?: string;
  air_conditioning_type?: string;
  fireplace?: string;
  basement_type?: string;
  quality?: string;
  condition?: string;
  flooring_types?: string[];
  plumbing_fixtures_count?: number;
  interior_wall_type?: string;
  total_area_sq_ft?: number;
  other_areas?: {
    type: string;
    sq_ft: number;
  }[];
}

export interface EstatedParcel {
  apn_original: string;
  apn_unformatted: string;
  apn_previous?: string;
  fips_code: string;
  depth_ft?: number;
  frontage_ft?: number;
  area_sq_ft?: number;
  area_acres?: number;
  county_name: string;
  county_land_use_code?: string;
  county_land_use_description?: string;
  standardized_land_use_category?: string;
  standardized_land_use_type?: string;
  location_descriptions?: string[];
  zoning?: string;
  building_count?: number;
  tax_account_number?: string;
  legal_description?: string;
  lot_code?: string;
  lot_number?: string;
  subdivision?: string;
  municipality?: string;
  section_township_range?: string;
}

export interface EstatedAssessment {
  year?: number;
  land_value?: number;
  improvement_value?: number;
  total_value?: number;
}

export interface EstatedTax {
  year?: number;
  amount?: number;
  exemptions?: string[];
  rate_code_area?: string;
}

export interface EstatedValuation {
  value?: number;
  high?: number;
  low?: number;
  forecast_standard_deviation?: number;
  date?: string;
}

export interface EstatedDeed {
  document_type?: string;
  recording_date?: string;
  original_contract_date?: string;
  deed_book?: string;
  deed_page?: string;
  document_id?: string;
  sale_price?: number;
  sale_price_description?: string;
  transfer_tax?: number;
  distressed_sale?: boolean;
  real_estate_owned?: string;
  seller_first_name?: string;
  seller_last_name?: string;
  seller2_first_name?: string;
  seller2_last_name?: string;
  seller_address?: string;
  seller_city?: string;
  seller_state?: string;
  seller_zip_code?: string;
  seller_unit_number?: string;
  seller_unit_type?: string;
  buyer_first_name?: string;
  buyer_last_name?: string;
  buyer2_first_name?: string;
  buyer2_last_name?: string;
  buyer_address?: string;
  buyer_city?: string;
  buyer_state?: string;
  buyer_zip_code?: string;
  buyer_unit_number?: string;
  buyer_unit_type?: string;
  lender_name?: string;
  lender_type?: string;
  loan_amount?: number;
  loan_type?: string;
  loan_due_date?: string;
  loan_finance_type?: string;
  loan_interest_rate?: number;
}

export interface EstatedPropertyResponse {
  data: {
    address: {
      street_address: string;
      city: string;
      state: string;
      zip_code: string;
      formatted_street_address: string;
      latitude?: number;
      longitude?: number;
    };
    parcel: EstatedParcel;
    structure: EstatedStructure;
    owner: EstatedOwner;
    assessments: EstatedAssessment[];
    taxes: EstatedTax[];
    valuation: EstatedValuation;
    deeds: EstatedDeed[];
    market_assessments?: EstatedAssessment[];
  };
  metadata: {
    publishing_date: string;
  };
  warnings?: string[];
}

export interface EstatedError {
  error: string;
  message: string;
}

export async function lookupProperty(
  address: string,
  city: string,
  state: string,
  zipCode?: string
): Promise<EstatedPropertyResponse | null> {
  const apiKey = process.env.ESTATED_API_KEY;

  if (!apiKey) {
    throw new Error("ESTATED_API_KEY is not configured");
  }

  const params = new URLSearchParams({
    token: apiKey,
    combined_address: `${address}, ${city}, ${state}${zipCode ? ` ${zipCode}` : ""}`,
  });

  const response = await fetch(`${ESTATED_API_URL}?${params.toString()}`);

  if (!response.ok) {
    const errorData = await response.json() as EstatedError;
    console.error("Estated API error:", errorData);
    return null;
  }

  const data = await response.json() as EstatedPropertyResponse;

  if (!data.data) {
    return null;
  }

  return data;
}

export async function lookupPropertyByFips(
  fipsCode: string,
  apn: string
): Promise<EstatedPropertyResponse | null> {
  const apiKey = process.env.ESTATED_API_KEY;

  if (!apiKey) {
    throw new Error("ESTATED_API_KEY is not configured");
  }

  const params = new URLSearchParams({
    token: apiKey,
    fips_code: fipsCode,
    apn: apn,
  });

  const response = await fetch(`${ESTATED_API_URL}?${params.toString()}`);

  if (!response.ok) {
    const errorData = await response.json() as EstatedError;
    console.error("Estated API error:", errorData);
    return null;
  }

  const data = await response.json() as EstatedPropertyResponse;

  if (!data.data) {
    return null;
  }

  return data;
}

// Helper to extract the most recent sale from deeds
export function getMostRecentSale(deeds: EstatedDeed[]): EstatedDeed | null {
  if (!deeds || deeds.length === 0) return null;

  // Filter to actual sales (with sale price) and sort by date
  const sales = deeds
    .filter(d => d.sale_price && d.sale_price > 0 && d.recording_date)
    .sort((a, b) => {
      const dateA = new Date(a.recording_date!);
      const dateB = new Date(b.recording_date!);
      return dateB.getTime() - dateA.getTime();
    });

  return sales[0] || null;
}

// Helper to get original loan from most recent sale
export function getOriginalLoan(deeds: EstatedDeed[]): {
  amount: number;
  date: string;
  rate?: number;
  lender?: string;
  type?: string;
} | null {
  const recentSale = getMostRecentSale(deeds);

  if (!recentSale || !recentSale.loan_amount) return null;

  return {
    amount: recentSale.loan_amount,
    date: recentSale.recording_date!,
    rate: recentSale.loan_interest_rate,
    lender: recentSale.lender_name,
    type: recentSale.loan_type,
  };
}
