/**
 * Seed Properties Script
 *
 * Generates 500 realistic Orange County properties with owners and mortgages.
 * Uses the OC config for realistic city/ZIP/value distributions.
 *
 * Usage:
 *   npx ts-node scripts/seed-properties.ts
 *
 * Environment variables:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_KEY - Supabase service role key (for bypassing RLS)
 */

import { createClient } from "@supabase/supabase-js";
import {
  OC_CITIES,
  STREET_SUFFIXES,
  LENDERS,
  FIRST_NAMES,
  LAST_NAMES,
  PROPERTY_TYPES,
  LOAN_TYPES,
  getRateRangeForDate,
  weightedRandom,
  randomInRange,
  randomIntInRange,
  randomDateInRange,
  randomElement,
} from "../src/lib/data/oc-config";

const PROPERTY_COUNT = 500;
const ABSENTEE_RATE = 0.25; // 25% absentee owners
const ARM_RATE = 0.15; // 15% ARMs

interface GeneratedProperty {
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lot_size: number | null;
  year_built: number;
  estimated_value: number;
  last_sale_price: number;
  last_sale_date: string;
}

interface GeneratedOwner {
  property_id?: string;
  first_name: string;
  last_name: string;
  mailing_address: string;
  mailing_city: string;
  mailing_state: string;
  mailing_zip: string;
  phone: string;
  email: string;
  is_absentee: boolean;
  ownership_length_years: number;
}

interface GeneratedMortgage {
  property_id?: string;
  lender_name: string;
  loan_amount: number;
  interest_rate: number;
  loan_type: string;
  origination_date: string;
  maturity_date: string;
  is_arm: boolean;
  arm_reset_date: string | null;
  ltv_ratio: number;
  estimated_equity: number;
  monthly_payment: number;
}

function generateStreetAddress(city: typeof OC_CITIES[0]): string {
  const streetNumber = randomIntInRange(100, 9999);
  const streetName = randomElement(city.streetPatterns);
  const suffix = randomElement(STREET_SUFFIXES);
  return `${streetNumber} ${streetName} ${suffix}`;
}

function generatePhone(): string {
  const areaCodes = ["949", "714", "657", "562"];
  const areaCode = randomElement(areaCodes);
  const exchange = randomIntInRange(200, 999);
  const subscriber = randomIntInRange(1000, 9999);
  return `(${areaCode}) ${exchange}-${subscriber}`;
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com", "email.com"];
  const variants = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()[0]}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${randomIntInRange(1, 99)}`,
  ];
  return `${randomElement(variants)}@${randomElement(domains)}`;
}

function generateProperty(city: typeof OC_CITIES[0]): GeneratedProperty {
  const propertyType = weightedRandom(PROPERTY_TYPES).type;

  // Property characteristics based on type
  let bedrooms: number, bathrooms: number, sqft: number, lotSize: number | null;

  switch (propertyType) {
    case "condo":
      bedrooms = randomIntInRange(1, 3);
      bathrooms = randomIntInRange(1, 2);
      sqft = randomIntInRange(800, 1800);
      lotSize = null;
      break;
    case "townhouse":
      bedrooms = randomIntInRange(2, 4);
      bathrooms = randomIntInRange(2, 3);
      sqft = randomIntInRange(1200, 2400);
      lotSize = randomIntInRange(1500, 3500);
      break;
    case "multi_family":
      bedrooms = randomIntInRange(4, 8);
      bathrooms = randomIntInRange(3, 6);
      sqft = randomIntInRange(2500, 5000);
      lotSize = randomIntInRange(5000, 12000);
      break;
    default: // single_family
      bedrooms = randomIntInRange(2, 5);
      bathrooms = randomIntInRange(2, 4);
      sqft = randomIntInRange(1200, 4500);
      lotSize = randomIntInRange(4000, 15000);
  }

  // Value based on city average with variance
  const baseValue = city.avgValue;
  const variance = city.valueVariance;
  const multiplier = randomInRange(1 - variance, 1 + variance);

  // Adjust value based on property type
  let typeMultiplier = 1;
  if (propertyType === "condo") typeMultiplier = 0.65;
  else if (propertyType === "townhouse") typeMultiplier = 0.8;
  else if (propertyType === "multi_family") typeMultiplier = 1.4;

  // Adjust value based on size
  const sizeMultiplier = 0.7 + (sqft / 3000) * 0.6;

  const estimatedValue = Math.round(baseValue * multiplier * typeMultiplier * sizeMultiplier / 1000) * 1000;

  // Last sale was 1-4 years ago
  const yearsAgo = randomInRange(1, 4);
  const lastSaleDate = new Date();
  lastSaleDate.setFullYear(lastSaleDate.getFullYear() - yearsAgo);
  lastSaleDate.setMonth(randomIntInRange(0, 11));
  lastSaleDate.setDate(randomIntInRange(1, 28));

  // Last sale price was lower (appreciation)
  const appreciationRate = randomInRange(0.05, 0.15) * yearsAgo;
  const lastSalePrice = Math.round(estimatedValue / (1 + appreciationRate) / 1000) * 1000;

  const yearBuilt = randomIntInRange(1960, 2023);

  return {
    address: generateStreetAddress(city),
    city: city.name,
    state: "CA",
    zip: randomElement(city.zips),
    county: "Orange",
    property_type: propertyType,
    bedrooms,
    bathrooms,
    sqft,
    lot_size: lotSize,
    year_built: yearBuilt,
    estimated_value: estimatedValue,
    last_sale_price: lastSalePrice,
    last_sale_date: lastSaleDate.toISOString().split("T")[0],
  };
}

function generateOwner(property: GeneratedProperty): GeneratedOwner {
  const firstName = randomElement(FIRST_NAMES);
  const lastName = randomElement(LAST_NAMES);
  const isAbsentee = Math.random() < ABSENTEE_RATE;

  let mailingAddress: string, mailingCity: string, mailingState: string, mailingZip: string;

  if (isAbsentee) {
    // Generate different mailing address
    const outOfCountyCities = [
      { city: "Los Angeles", state: "CA", zip: "90001" },
      { city: "San Francisco", state: "CA", zip: "94102" },
      { city: "San Diego", state: "CA", zip: "92101" },
      { city: "Beverly Hills", state: "CA", zip: "90210" },
      { city: "Pasadena", state: "CA", zip: "91101" },
      { city: "Las Vegas", state: "NV", zip: "89101" },
      { city: "Phoenix", state: "AZ", zip: "85001" },
      { city: "Seattle", state: "WA", zip: "98101" },
      { city: "New York", state: "NY", zip: "10001" },
    ];
    const outOfCounty = randomElement(outOfCountyCities);
    mailingAddress = `${randomIntInRange(100, 9999)} ${randomElement(["Main", "Oak", "Park", "Central", "Broadway"])} ${randomElement(STREET_SUFFIXES)}`;
    mailingCity = outOfCounty.city;
    mailingState = outOfCounty.state;
    mailingZip = outOfCounty.zip;
  } else {
    mailingAddress = property.address;
    mailingCity = property.city;
    mailingState = property.state;
    mailingZip = property.zip;
  }

  // Ownership length based on last sale date
  const lastSale = new Date(property.last_sale_date);
  const now = new Date();
  const ownershipYears = Math.max(1, Math.floor((now.getTime() - lastSale.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));

  return {
    first_name: firstName,
    last_name: lastName,
    mailing_address: mailingAddress,
    mailing_city: mailingCity,
    mailing_state: mailingState,
    mailing_zip: mailingZip,
    phone: generatePhone(),
    email: generateEmail(firstName, lastName),
    is_absentee: isAbsentee,
    ownership_length_years: ownershipYears,
  };
}

function generateMortgage(property: GeneratedProperty): GeneratedMortgage {
  const loanTypeInfo = weightedRandom(LOAN_TYPES);
  let loanType = loanTypeInfo.type;

  // Jumbo loans for high-value properties (over $766,550 conforming limit)
  if (property.estimated_value > 1_000_000 && loanType === "conventional") {
    loanType = "jumbo";
  }

  const isArm = Math.random() < ARM_RATE;

  // LTV ratio typically 60-80% for existing mortgages
  const ltv = randomInRange(55, 85);
  const loanAmount = Math.round(property.last_sale_price * (ltv / 100) / 1000) * 1000;

  // Origination date is same as last sale date
  const originationDate = new Date(property.last_sale_date);

  // Get rate based on origination date
  const rateRange = getRateRangeForDate(originationDate);
  let interestRate = randomInRange(rateRange.min, rateRange.max);

  // Adjust rate based on loan type
  if (loanType === "jumbo") interestRate += 0.25;
  else if (loanType === "fha") interestRate += 0.125;
  else if (isArm) interestRate -= 0.5; // ARMs typically start lower

  interestRate = Math.round(interestRate * 1000) / 1000;

  // Maturity date is 30 years from origination
  const maturityDate = new Date(originationDate);
  maturityDate.setFullYear(maturityDate.getFullYear() + 30);

  // ARM reset date is 5 years from origination
  let armResetDate: string | null = null;
  if (isArm) {
    const resetDate = new Date(originationDate);
    resetDate.setFullYear(resetDate.getFullYear() + 5);
    armResetDate = resetDate.toISOString().split("T")[0];
  }

  // Calculate estimated equity
  const estimatedEquity = property.estimated_value - loanAmount;

  // Calculate current LTV based on current value
  const currentLtv = Math.round((loanAmount / property.estimated_value) * 100 * 100) / 100;

  // Calculate monthly payment (P&I only)
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = 360; // 30 years
  const monthlyPayment = Math.round(
    loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );

  return {
    lender_name: randomElement(LENDERS),
    loan_amount: loanAmount,
    interest_rate: interestRate,
    loan_type: loanType,
    origination_date: originationDate.toISOString().split("T")[0],
    maturity_date: maturityDate.toISOString().split("T")[0],
    is_arm: isArm,
    arm_reset_date: armResetDate,
    ltv_ratio: currentLtv,
    estimated_equity: estimatedEquity,
    monthly_payment: monthlyPayment,
  };
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log(`Generating ${PROPERTY_COUNT} Orange County properties...\n`);

  const properties: GeneratedProperty[] = [];
  const owners: GeneratedOwner[] = [];
  const mortgages: GeneratedMortgage[] = [];

  // Generate data
  for (let i = 0; i < PROPERTY_COUNT; i++) {
    const city = randomElement(OC_CITIES);
    const property = generateProperty(city);
    const owner = generateOwner(property);
    const mortgage = generateMortgage(property);

    properties.push(property);
    owners.push(owner);
    mortgages.push(mortgage);

    if ((i + 1) % 100 === 0) {
      console.log(`  Generated ${i + 1}/${PROPERTY_COUNT} properties...`);
    }
  }

  // Show distribution stats
  const cityDistribution: Record<string, number> = {};
  const typeDistribution: Record<string, number> = {};
  let absenteeCount = 0;
  let armCount = 0;
  let totalValue = 0;
  let totalRate = 0;

  for (let i = 0; i < PROPERTY_COUNT; i++) {
    cityDistribution[properties[i].city] = (cityDistribution[properties[i].city] || 0) + 1;
    typeDistribution[properties[i].property_type] = (typeDistribution[properties[i].property_type] || 0) + 1;
    if (owners[i].is_absentee) absenteeCount++;
    if (mortgages[i].is_arm) armCount++;
    totalValue += properties[i].estimated_value;
    totalRate += mortgages[i].interest_rate;
  }

  console.log("\nDistribution summary:");
  console.log(`  Property types: ${JSON.stringify(typeDistribution)}`);
  console.log(`  Absentee owners: ${absenteeCount} (${(absenteeCount / PROPERTY_COUNT * 100).toFixed(1)}%)`);
  console.log(`  ARM mortgages: ${armCount} (${(armCount / PROPERTY_COUNT * 100).toFixed(1)}%)`);
  console.log(`  Avg property value: $${Math.round(totalValue / PROPERTY_COUNT).toLocaleString()}`);
  console.log(`  Avg interest rate: ${(totalRate / PROPERTY_COUNT).toFixed(3)}%`);

  // Insert properties
  console.log("\nInserting properties...");
  const { data: insertedProperties, error: propError } = await supabase
    .from("properties")
    .insert(properties)
    .select("id");

  if (propError) {
    console.error("Error inserting properties:", propError);
    process.exit(1);
  }

  console.log(`  Inserted ${insertedProperties.length} properties`);

  // Link owners and mortgages to property IDs
  const propertyIds = insertedProperties.map((p) => p.id);

  for (let i = 0; i < PROPERTY_COUNT; i++) {
    owners[i].property_id = propertyIds[i];
    mortgages[i].property_id = propertyIds[i];
  }

  // Insert owners
  console.log("Inserting owners...");
  const { data: insertedOwners, error: ownerError } = await supabase
    .from("owners")
    .insert(owners)
    .select("id");

  if (ownerError) {
    console.error("Error inserting owners:", ownerError);
    process.exit(1);
  }

  console.log(`  Inserted ${insertedOwners.length} owners`);

  // Insert mortgages
  console.log("Inserting mortgages...");
  const { error: mortgageError } = await supabase
    .from("mortgage_records")
    .insert(mortgages);

  if (mortgageError) {
    console.error("Error inserting mortgages:", mortgageError);
    process.exit(1);
  }

  console.log(`  Inserted ${PROPERTY_COUNT} mortgages`);

  // Show sample data
  console.log("\nSample properties:");
  const { data: sampleData } = await supabase
    .from("properties")
    .select(`
      address, city, zip, property_type, estimated_value,
      owners (first_name, last_name, is_absentee),
      mortgage_records (interest_rate, loan_type, is_arm)
    `)
    .limit(5);

  if (sampleData) {
    for (const p of sampleData) {
      const owner = (p.owners as any)?.[0];
      const mortgage = (p.mortgage_records as any)?.[0];
      console.log(`  ${p.address}, ${p.city}`);
      console.log(`    $${p.estimated_value?.toLocaleString()} | ${owner?.first_name} ${owner?.last_name}${owner?.is_absentee ? ' (absentee)' : ''}`);
      console.log(`    ${mortgage?.interest_rate}% ${mortgage?.loan_type}${mortgage?.is_arm ? ' ARM' : ''}`);
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
