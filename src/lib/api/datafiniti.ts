// Datafiniti API Client
// Docs: https://docs.datafiniti.co/docs/api-property-data

const DATAFINITI_API_URL = "https://api.datafiniti.co/v4/properties/search";

export interface DatafinitiTransaction {
  saleDate?: string;
  firstDateSeen?: string;
  lastDateSeen?: string;
  documentNumber?: string;
  documentType?: string;
  price?: number;
  sellerFirstName?: string;
  sellerLastName?: string;
  buyerFirstName?: string;
  buyerMiddleName?: string;
  buyerLastName?: string;
  lenderName?: string;
  loanType?: string;
  loanAmount?: number;
  mortgageTerm?: number;
  interestType?: string;
  parcelNumber?: string;
  ownerType?: string;
  contactOwnerMailAddressFull?: string;
}

export interface DatafinitiOwner {
  firstName?: string;
  lastName?: string;
  peopleKey?: string;
  transactionDate?: string;
  firstDateSeen?: string;
  lastDateSeen?: string;
}

export interface DatafinitiPerson {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  equity?: number;
  equityPercent?: number;
  landline?: boolean;
  title?: string;
  dateSeen?: string;
  people_key?: string;
}

export interface DatafinitiProperty {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  county?: string;
  country: string;
  latitude?: string;
  longitude?: string;
  propertyType?: string;
  numBedroom?: number;
  numBathroom?: number;
  floorSizeValue?: number;
  floorSizeUnit?: string;
  lotSizeValue?: number;
  yearBuilt?: number;
  // Sale and price data
  mostRecentSoldPriceAmount?: number;
  mostRecentSoldPriceDate?: string;
  mostRecentPriceAmount?: number;
  mostRecentPriceDate?: string;
  mostRecentEstimatedPriceAmount?: number;
  // Owner data
  owners?: DatafinitiOwner[];
  mostRecentOwnerFirstName?: string;
  mostRecentOwnerLastName?: string;
  mostRecentOwnerPeopleKey?: string;
  people?: DatafinitiPerson[];
  // Absentee owner
  mostRecentAbsenteeOwner?: boolean;
  ownerOccupied?: boolean;
  // Transaction/mortgage data
  transactions?: DatafinitiTransaction[];
  // Dates
  dateAdded?: string;
  dateUpdated?: string;
}

export interface DatafinitiSearchResponse {
  num_found: number;
  total_cost: number;
  records: DatafinitiProperty[];
}

/**
 * Search for properties in a city/state with optional filters
 */
export async function searchProperties(params: {
  city: string;
  state: string;
  // Date range for when property was sold (format: YYYY-MM-DD)
  soldAfter?: string;
  soldBefore?: string;
  limit?: number;
}): Promise<DatafinitiSearchResponse> {
  const apiToken = process.env.DATAFINITI_API_KEY;

  if (!apiToken) {
    throw new Error("DATAFINITI_API_KEY is not configured");
  }

  // Build query string
  // Docs: https://docs.datafiniti.co/docs/constructing-property-queries
  let query = `city:"${params.city}" AND province:${params.state} AND country:US`;

  // Filter by sale date range
  if (params.soldAfter || params.soldBefore) {
    const after = params.soldAfter || "2022-01-01";
    const before = params.soldBefore || "2023-12-31";
    query += ` AND mostRecentSoldPriceDate:[${after} TO ${before}]`;
  }

  const requestBody = {
    query,
    num_records: params.limit || 10,
    format: "JSON",
    download: false, // Preview mode - returns results directly
  };

  console.log("Datafiniti query:", query);

  const response = await fetch(DATAFINITI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Datafiniti API error:", response.status, errorText);
    throw new Error(`Datafiniti API error: ${response.status}`);
  }

  const data = await response.json();
  console.log("Datafiniti response:", JSON.stringify(data).slice(0, 1000));

  return data as DatafinitiSearchResponse;
}

/**
 * Get properties sold during high interest rate period (Oct 2022 - Dec 2023)
 * These are prime candidates for refinancing - focus on peak rate period
 * Rates were: Oct-Dec 2022: 6.75%, 2023: 6.5-7.5%
 */
export async function getHighRateProperties(
  city: string,
  state: string,
  limit: number = 10
): Promise<DatafinitiProperty[]> {
  try {
    // Focus on peak rate period: Oct 2022 through Dec 2023
    const response = await searchProperties({
      city,
      state,
      soldAfter: "2022-10-01", // Start from Oct 2022 when rates hit 6.75%+
      soldBefore: "2023-12-31",
      limit: limit * 3, // Get extra to filter and sort
    });

    // Filter to properties with sale data
    const filtered = response.records.filter((prop) => {
      return prop.mostRecentSoldPriceDate || prop.mostRecentSoldPriceAmount;
    });

    // Sort by sale date (most recent first = highest rates)
    // Late 2023 purchases have 7%+ rates, best refinance candidates
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.mostRecentSoldPriceDate || "2022-10-01");
      const dateB = new Date(b.mostRecentSoldPriceDate || "2022-10-01");
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });

    return sorted.slice(0, limit);
  } catch (error) {
    console.error("Error fetching high rate properties:", error);
    throw error;
  }
}

/**
 * Get the most recent transaction with loan details
 */
export function getMostRecentTransaction(
  prop: DatafinitiProperty
): DatafinitiTransaction | null {
  if (!prop.transactions || prop.transactions.length === 0) {
    return null;
  }

  // Sort by sale date descending
  const sorted = [...prop.transactions].sort((a, b) => {
    const dateA = new Date(a.saleDate || a.firstDateSeen || 0);
    const dateB = new Date(b.saleDate || b.firstDateSeen || 0);
    return dateB.getTime() - dateA.getTime();
  });

  return sorted[0];
}

/**
 * Estimate interest rate based on sale date if not available in transaction
 */
export function estimateInterestRate(saleDate: string): number {
  const date = new Date(saleDate);
  const year = date.getFullYear();
  const month = date.getMonth();

  // Historical average rates
  if (year === 2022) {
    if (month < 3) return 3.75; // Jan-Mar 2022
    if (month < 6) return 5.25; // Apr-Jun 2022
    if (month < 9) return 5.75; // Jul-Sep 2022
    return 6.75; // Oct-Dec 2022
  } else if (year === 2023) {
    if (month < 3) return 6.5; // Jan-Mar 2023
    if (month < 6) return 6.75; // Apr-Jun 2023
    if (month < 9) return 7.0; // Jul-Sep 2023
    return 7.5; // Oct-Dec 2023
  }
  return 6.5; // Default
}

/**
 * Transform Datafiniti property to our internal format
 */
export function transformToInternalFormat(prop: DatafinitiProperty) {
  const transaction = getMostRecentTransaction(prop);
  const saleDate = prop.mostRecentSoldPriceDate || transaction?.saleDate;
  const salePrice = prop.mostRecentSoldPriceAmount || transaction?.price;

  // Get owner info
  const firstName = prop.mostRecentOwnerFirstName ||
    prop.owners?.[0]?.firstName ||
    transaction?.buyerFirstName ||
    "Unknown";
  const lastName = prop.mostRecentOwnerLastName ||
    prop.owners?.[0]?.lastName ||
    transaction?.buyerLastName ||
    "";

  // Get contact info from people array
  const personWithContact = prop.people?.find((p) => p.phone || p.email);

  // Determine if absentee owner
  const isAbsentee = prop.mostRecentAbsenteeOwner === true ||
    prop.ownerOccupied === false;

  // Get loan details from transaction
  const loanAmount = transaction?.loanAmount ||
    (salePrice ? Math.round(salePrice * 0.8) : null);

  // Get interest rate - from transaction or estimate
  let interestRate = 6.5;
  if (transaction?.interestType) {
    // If we have interest type, estimate based on type and date
    interestRate = estimateInterestRate(saleDate || "2022-06-01");
    if (transaction.interestType.toLowerCase().includes("adjust")) {
      interestRate -= 0.5; // ARMs were typically lower initially
    }
  } else if (saleDate) {
    interestRate = estimateInterestRate(saleDate);
  }

  const estimatedValue = prop.mostRecentEstimatedPriceAmount ||
    prop.mostRecentPriceAmount ||
    salePrice ||
    0;

  const estimatedEquity = loanAmount ? Math.max(0, estimatedValue - loanAmount) : 0;

  // Parse mailing address from transaction
  let mailingAddress = prop.address;
  let mailingCity = prop.city;
  let mailingState = prop.province;
  let mailingZip = prop.postalCode;

  if (transaction?.contactOwnerMailAddressFull && isAbsentee) {
    // Use mailing address if absentee
    mailingAddress = transaction.contactOwnerMailAddressFull;
  }

  return {
    property: {
      address: prop.address,
      city: prop.city,
      state: prop.province,
      zip: prop.postalCode,
      county: prop.county || "",
      property_type: mapPropertyType(prop.propertyType),
      bedrooms: Math.floor(prop.numBedroom || 0),
      bathrooms: Math.floor(prop.numBathroom || 0), // Convert 2.5 -> 2 (DB expects integer)
      sqft: Math.floor(prop.floorSizeValue || 0),
      lot_size: prop.lotSizeValue ? Math.floor(prop.lotSizeValue) : null,
      year_built: prop.yearBuilt || null,
      estimated_value: Math.floor(estimatedValue),
      last_sale_price: salePrice ? Math.floor(salePrice) : null,
      last_sale_date: saleDate || null,
    },
    owner: {
      first_name: firstName,
      last_name: lastName,
      mailing_address: mailingAddress,
      mailing_city: mailingCity,
      mailing_state: mailingState,
      mailing_zip: mailingZip,
      phone: personWithContact?.phone || null,
      email: personWithContact?.email || null,
      is_absentee: isAbsentee,
      ownership_length_years: saleDate
        ? Math.floor(
            (Date.now() - new Date(saleDate).getTime()) /
              (365 * 24 * 60 * 60 * 1000)
          )
        : 1,
    },
    mortgage: loanAmount
      ? {
          lender_name: transaction?.lenderName || "Unknown",
          loan_amount: loanAmount,
          interest_rate: interestRate,
          loan_type: mapLoanType(transaction?.loanType, loanAmount),
          origination_date: saleDate || null,
          maturity_date: null,
          is_arm: transaction?.interestType?.toLowerCase().includes("adjust") || false,
          arm_reset_date: null,
          estimated_equity: estimatedEquity,
          ltv_ratio: estimatedValue > 0 ? (loanAmount / estimatedValue) * 100 : 80,
          monthly_payment: calculateMonthlyPayment(loanAmount, interestRate, transaction?.mortgageTerm || 360),
        }
      : null,
    // Include raw contact data if available
    contacts: {
      phone: personWithContact?.phone,
      email: personWithContact?.email,
      equity: personWithContact?.equity,
      equityPercent: personWithContact?.equityPercent,
    },
  };
}

function mapPropertyType(
  datafinitType?: string
): "single_family" | "condo" | "townhouse" | "multi_family" {
  const type = datafinitType?.toLowerCase() || "";
  if (type.includes("condo")) return "condo";
  if (type.includes("townhouse") || type.includes("town")) return "townhouse";
  if (type.includes("multi") || type.includes("duplex") || type.includes("triplex"))
    return "multi_family";
  return "single_family";
}

function mapLoanType(
  loanType?: string,
  loanAmount?: number | null
): "conventional" | "fha" | "va" | "jumbo" {
  const type = loanType?.toLowerCase() || "";
  if (type.includes("fha")) return "fha";
  if (type.includes("va")) return "va";
  if (loanAmount && loanAmount > 726200) return "jumbo"; // 2023 conforming limit
  return "conventional";
}

function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  return Math.round(payment);
}
