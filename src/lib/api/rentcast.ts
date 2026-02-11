// RentCast API Client
// Docs: https://developers.rentcast.io/

const RENTCAST_API_URL = "https://api.rentcast.io/v1";

export interface RentCastProperty {
  id: string;
  formattedAddress: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  latitude: number;
  longitude: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  lotSize: number;
  yearBuilt: number;
  assessedValue?: number;
  // Sale data - RentCast uses various field names
  lastSaleDate?: string;
  lastSalePrice?: number;
  saleDate?: string;
  salePrice?: number;
  lastSoldDate?: string;
  lastSoldPrice?: number;
  ownerOccupied?: boolean;
  owner?: {
    names: string[];
    mailingAddress?: {
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  features?: {
    architectureType?: string;
    cooling?: boolean;
    coolingType?: string;
    exteriorType?: string;
    fireplace?: boolean;
    fireplaceType?: string;
    floorCount?: number;
    foundationType?: string;
    garage?: boolean;
    garageSpaces?: number;
    garageType?: string;
    heating?: boolean;
    heatingType?: string;
    pool?: boolean;
    poolType?: string;
    roofType?: string;
    roomCount?: number;
    unitCount?: number;
    viewType?: string;
  };
  hoa?: {
    fee?: number;
  };
  // Tax assessments is an object keyed by year
  taxAssessments?: Record<string, {
    year: number;
    value: number;
    land: number;
    improvements: number;
  }>;
  propertyTaxes?: Record<string, {
    year: number;
    total: number;
  }>;
  // History is an object keyed by date string
  history?: Record<string, {
    event: string;
    date: string;
    price?: number;
  }>;
}

export interface RentCastValueEstimate {
  price: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  pricePerSquareFoot?: number;
  latitude: number;
  longitude: number;
  comparables?: RentCastProperty[];
}

export interface RentCastError {
  message: string;
  status?: number;
}

// Property lookup by address - uses /records endpoint for full data including sale history
export async function lookupProperty(
  address: string,
  city: string,
  state: string,
  zipCode?: string
): Promise<RentCastProperty | null> {
  const apiKey = process.env.RENTCAST_API_KEY;

  if (!apiKey) {
    throw new Error("RENTCAST_API_KEY is not configured");
  }

  // Build the address string
  const fullAddress = zipCode
    ? `${address}, ${city}, ${state} ${zipCode}`
    : `${address}, ${city}, ${state}`;

  const params = new URLSearchParams({
    address: fullAddress,
  });

  try {
    // Use /records endpoint which includes sale history, owner info, etc.
    const response = await fetch(`${RENTCAST_API_URL}/properties/records?${params.toString()}`, {
      headers: {
        "X-Api-Key": apiKey,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      // Fall back to basic /properties endpoint if /records fails
      if (response.status === 404 || response.status === 400) {
        console.log("Records endpoint failed, trying basic properties endpoint...");
        return await lookupPropertyBasic(address, city, state, zipCode);
      }
      const errorData = await response.json().catch(() => ({}));
      console.error("RentCast API error:", response.status, errorData);
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();

    // Log full response for debugging
    console.log("RentCast /records response keys:", Object.keys(data));
    console.log("RentCast /records response:", JSON.stringify(data, null, 2).slice(0, 3000));

    // API returns an array, get the first match
    if (Array.isArray(data) && data.length > 0) {
      return data[0] as RentCastProperty;
    }

    // Single property response
    if (data && data.formattedAddress) {
      return data as RentCastProperty;
    }

    // Some endpoints return data nested
    if (data && data.property) {
      return data.property as RentCastProperty;
    }

    return null;
  } catch (error) {
    console.error("RentCast lookup error:", error);
    throw error;
  }
}

// Basic property lookup without sale history
async function lookupPropertyBasic(
  address: string,
  city: string,
  state: string,
  zipCode?: string
): Promise<RentCastProperty | null> {
  const apiKey = process.env.RENTCAST_API_KEY;

  if (!apiKey) {
    throw new Error("RENTCAST_API_KEY is not configured");
  }

  const fullAddress = zipCode
    ? `${address}, ${city}, ${state} ${zipCode}`
    : `${address}, ${city}, ${state}`;

  const params = new URLSearchParams({
    address: fullAddress,
  });

  const response = await fetch(`${RENTCAST_API_URL}/properties?${params.toString()}`, {
    headers: {
      "X-Api-Key": apiKey,
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const errorData = await response.json().catch(() => ({}));
    console.error("RentCast basic API error:", response.status, errorData);
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  console.log("RentCast /properties response:", JSON.stringify(data, null, 2).slice(0, 2000));

  if (Array.isArray(data) && data.length > 0) {
    return data[0] as RentCastProperty;
  }

  if (data && data.formattedAddress) {
    return data as RentCastProperty;
  }

  return null;
}

// Get property value estimate
export async function getValueEstimate(
  address: string,
  city: string,
  state: string,
  zipCode?: string,
  propertyType?: string,
  bedrooms?: number,
  bathrooms?: number,
  squareFootage?: number
): Promise<RentCastValueEstimate | null> {
  const apiKey = process.env.RENTCAST_API_KEY;

  if (!apiKey) {
    throw new Error("RENTCAST_API_KEY is not configured");
  }

  const fullAddress = zipCode
    ? `${address}, ${city}, ${state} ${zipCode}`
    : `${address}, ${city}, ${state}`;

  const params = new URLSearchParams({
    address: fullAddress,
  });

  if (propertyType) params.set("propertyType", propertyType);
  if (bedrooms) params.set("bedrooms", bedrooms.toString());
  if (bathrooms) params.set("bathrooms", bathrooms.toString());
  if (squareFootage) params.set("squareFootage", squareFootage.toString());

  try {
    const response = await fetch(`${RENTCAST_API_URL}/avm/value?${params.toString()}`, {
      headers: {
        "X-Api-Key": apiKey,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json().catch(() => ({}));
      console.error("RentCast value estimate error:", response.status, errorData);
      return null;
    }

    return await response.json() as RentCastValueEstimate;
  } catch (error) {
    console.error("RentCast value estimate error:", error);
    return null;
  }
}

// Helper to get most recent sale from history
export function getMostRecentSale(property: RentCastProperty): {
  date: string;
  price: number;
} | null {
  // Check direct lastSaleDate/lastSalePrice fields first (most reliable)
  const saleDate = property.lastSaleDate || property.saleDate || property.lastSoldDate;
  const salePrice = property.lastSalePrice || property.salePrice || property.lastSoldPrice;

  console.log("getMostRecentSale - checking fields:", { saleDate, salePrice });

  if (saleDate && salePrice && salePrice > 0) {
    return {
      date: saleDate,
      price: salePrice,
    };
  }

  // Fall back to history object if available (RentCast returns history as object keyed by date)
  if (property.history && typeof property.history === 'object') {
    const historyEntries = Object.values(property.history);
    const sales = historyEntries
      .filter(h => (h.event === "Sold" || h.event === "Sale" || h.event === "Listing Sold") && h.price && h.price > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sales.length > 0) {
      console.log("getMostRecentSale - found in history:", sales[0]);
      return {
        date: sales[0].date,
        price: sales[0].price!,
      };
    }
  }

  console.log("getMostRecentSale - no sale data found");
  return null;
}

// Helper to get owner name
export function getOwnerName(property: RentCastProperty): string | null {
  if (property.owner?.names && property.owner.names.length > 0) {
    return property.owner.names.join(" & ");
  }
  return null;
}

// Helper to check if absentee owner
export function isAbsenteeOwner(property: RentCastProperty): boolean {
  if (property.ownerOccupied === false) {
    return true;
  }

  // Check if mailing address differs from property address
  if (property.owner?.mailingAddress) {
    const mailingCity = property.owner.mailingAddress.city?.toLowerCase();
    const mailingState = property.owner.mailingAddress.state?.toLowerCase();
    const propertyCity = property.city?.toLowerCase();
    const propertyState = property.state?.toLowerCase();

    if (mailingCity !== propertyCity || mailingState !== propertyState) {
      return true;
    }
  }

  return false;
}

// ============================================================
// Property Search by City - for finding refinancing candidates
// ============================================================

export interface PropertySearchParams {
  city: string;
  state: string;
  zipCode?: string;
  // Sale date range in days (e.g., 730 for last 2 years)
  saleDateRange?: number;
  propertyType?: "Single Family" | "Condo" | "Townhouse" | "Multi Family";
  limit?: number;
  offset?: number;
}

export interface PropertySearchResponse {
  properties: RentCastProperty[];
  total?: number;
}

/**
 * Search for properties in a city/state that were sold within a date range
 * Perfect for finding refinancing opportunities from high-rate periods
 */
export async function searchPropertiesByCity(
  params: PropertySearchParams
): Promise<PropertySearchResponse> {
  const apiKey = process.env.RENTCAST_API_KEY;

  if (!apiKey) {
    throw new Error("RENTCAST_API_KEY is not configured");
  }

  const searchParams = new URLSearchParams({
    city: params.city,
    state: params.state,
    limit: String(params.limit || 10),
  });

  if (params.zipCode) {
    searchParams.set("zipCode", params.zipCode);
  }

  // Sale date range - look back period in days
  // Default to ~2.5 years to capture 2022-2023 high rate period
  if (params.saleDateRange) {
    searchParams.set("saleDateRange", String(params.saleDateRange));
  }

  if (params.propertyType) {
    searchParams.set("propertyType", params.propertyType);
  }

  if (params.offset) {
    searchParams.set("offset", String(params.offset));
  }

  try {
    const response = await fetch(
      `${RENTCAST_API_URL}/properties?${searchParams.toString()}`,
      {
        headers: {
          "X-Api-Key": apiKey,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("RentCast search error:", response.status, errorData);
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();

    // API returns an array of properties
    if (Array.isArray(data)) {
      return { properties: data as RentCastProperty[], total: data.length };
    }

    // Or nested under a key
    if (data.properties) {
      return {
        properties: data.properties as RentCastProperty[],
        total: data.total || data.properties.length,
      };
    }

    return { properties: [], total: 0 };
  } catch (error) {
    console.error("RentCast search error:", error);
    throw error;
  }
}

/**
 * Get properties sold during high interest rate period (2022-2023)
 * These are prime candidates for refinancing
 */
export async function getHighRateProperties(
  city: string,
  state: string,
  limit: number = 10
): Promise<RentCastProperty[]> {
  try {
    // Search for properties sold in the last ~3 years (1095 days)
    // This captures the 2022-2023 high rate period
    const response = await searchPropertiesByCity({
      city,
      state,
      saleDateRange: 1095, // ~3 years back
      limit: limit * 2, // Get extra to filter
    });

    // Filter to properties with sale data in the high-rate window
    const highRatePeriodStart = new Date("2022-01-01");
    const highRatePeriodEnd = new Date("2023-12-31");

    const filtered = response.properties.filter((prop) => {
      const saleDate = prop.lastSaleDate || prop.saleDate || prop.lastSoldDate;
      if (!saleDate) return false;

      const date = new Date(saleDate);
      return date >= highRatePeriodStart && date <= highRatePeriodEnd;
    });

    // Return up to the requested limit
    return filtered.slice(0, limit);
  } catch (error) {
    console.error("Error fetching high rate properties:", error);
    throw error;
  }
}

/**
 * Transform RentCast property to our internal format
 */
export function transformToInternalFormat(prop: RentCastProperty) {
  const sale = getMostRecentSale(prop);
  const ownerName = getOwnerName(prop);
  const isAbsentee = isAbsenteeOwner(prop);

  // Parse owner name into first/last
  let firstName = "Unknown";
  let lastName = "";
  if (ownerName) {
    const parts = ownerName.split(" ");
    firstName = parts[0] || "Unknown";
    lastName = parts.slice(1).join(" ") || "";
  }

  // Estimate interest rate based on sale date
  // Average rates: 2022 ~5.5-7%, 2023 ~6.5-7.5%
  let estimatedRate = 6.5;
  if (sale?.date) {
    const saleYear = new Date(sale.date).getFullYear();
    const saleMonth = new Date(sale.date).getMonth();
    if (saleYear === 2022) {
      estimatedRate = saleMonth < 6 ? 5.5 : 6.5;
    } else if (saleYear === 2023) {
      estimatedRate = saleMonth < 6 ? 6.75 : 7.25;
    }
  }

  // Estimate loan amount (typically 80% LTV)
  const loanAmount = sale?.price ? Math.round(sale.price * 0.8) : null;
  const estimatedValue = prop.assessedValue || sale?.price || 0;
  const estimatedEquity = loanAmount ? estimatedValue - loanAmount : 0;

  return {
    property: {
      address: prop.addressLine1,
      city: prop.city,
      state: prop.state,
      zip: prop.zipCode,
      county: prop.county || "",
      property_type: mapPropertyType(prop.propertyType),
      bedrooms: prop.bedrooms || 0,
      bathrooms: prop.bathrooms || 0,
      sqft: prop.squareFootage || 0,
      lot_size: prop.lotSize || null,
      year_built: prop.yearBuilt || null,
      estimated_value: estimatedValue,
      last_sale_price: sale?.price || null,
      last_sale_date: sale?.date || null,
    },
    owner: {
      first_name: firstName,
      last_name: lastName,
      mailing_address: prop.owner?.mailingAddress?.addressLine1 || prop.addressLine1,
      mailing_city: prop.owner?.mailingAddress?.city || prop.city,
      mailing_state: prop.owner?.mailingAddress?.state || prop.state,
      mailing_zip: prop.owner?.mailingAddress?.zipCode || prop.zipCode,
      is_absentee: isAbsentee,
      ownership_length_years: sale?.date
        ? Math.floor(
            (Date.now() - new Date(sale.date).getTime()) /
              (365 * 24 * 60 * 60 * 1000)
          )
        : 1,
    },
    mortgage: loanAmount
      ? {
          lender_name: "Unknown",
          loan_amount: loanAmount,
          interest_rate: estimatedRate,
          loan_type: loanAmount > 726200 ? "jumbo" : "conventional",
          origination_date: sale?.date || null,
          maturity_date: null,
          is_arm: false,
          arm_reset_date: null,
          estimated_equity: estimatedEquity,
          ltv_ratio: estimatedValue > 0 ? (loanAmount / estimatedValue) * 100 : 80,
        }
      : null,
  };
}

function mapPropertyType(
  rentCastType: string
): "single_family" | "condo" | "townhouse" | "multi_family" {
  const type = rentCastType?.toLowerCase() || "";
  if (type.includes("condo")) return "condo";
  if (type.includes("townhouse") || type.includes("town")) return "townhouse";
  if (type.includes("multi") || type.includes("duplex") || type.includes("triplex"))
    return "multi_family";
  return "single_family";
}
