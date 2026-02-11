/**
 * Seed Mortgage Rates Script
 *
 * Fetches historical mortgage rates from FRED API (Freddie Mac PMMS)
 * and inserts them into the mortgage_rates table.
 *
 * Usage:
 *   npx ts-node scripts/seed-rates.ts
 *
 * Environment variables:
 *   FRED_API_KEY - Your FRED API key (get free at https://fred.stlouisfed.org/docs/api/api_key.html)
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_KEY - Supabase service role key (for bypassing RLS)
 */

import { createClient } from "@supabase/supabase-js";

// FRED API series IDs for Freddie Mac PMMS
const FRED_SERIES = {
  "30_fixed": "MORTGAGE30US", // 30-Year Fixed Rate Mortgage Average
  "15_fixed": "MORTGAGE15US", // 15-Year Fixed Rate Mortgage Average
  "5_1_arm": "MORTGAGE5US",   // 5/1-Year ARM Average (discontinued, use alternative)
};

interface FredObservation {
  date: string;
  value: string;
}

interface FredResponse {
  observations: FredObservation[];
}

interface MortgageRate {
  rate_type: string;
  rate_date: string;
  rate_value: number;
  source: string;
}

async function fetchFredSeries(seriesId: string, apiKey: string): Promise<FredObservation[]> {
  // Fetch last 5 years of data
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 5);
  const startDateStr = startDate.toISOString().split("T")[0];

  const url = new URL("https://api.stlouisfed.org/fred/series/observations");
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("observation_start", startDateStr);
  url.searchParams.set("sort_order", "desc");

  console.log(`Fetching ${seriesId} from FRED API...`);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`FRED API error: ${response.status} ${response.statusText}`);
  }

  const data: FredResponse = await response.json();
  return data.observations.filter((obs) => obs.value !== ".");
}

async function main() {
  // Check environment variables
  const fredApiKey = process.env.FRED_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!fredApiKey) {
    console.error("Error: FRED_API_KEY environment variable is required");
    console.error("Get a free API key at: https://fred.stlouisfed.org/docs/api/api_key.html");
    process.exit(1);
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required");
    process.exit(1);
  }

  // Create Supabase client with service key
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const rates: MortgageRate[] = [];

  // Fetch each series
  for (const [rateType, seriesId] of Object.entries(FRED_SERIES)) {
    try {
      const observations = await fetchFredSeries(seriesId, fredApiKey);
      console.log(`  Found ${observations.length} observations for ${rateType}`);

      for (const obs of observations) {
        const rateValue = parseFloat(obs.value);
        if (!isNaN(rateValue)) {
          rates.push({
            rate_type: rateType,
            rate_date: obs.date,
            rate_value: rateValue,
            source: "freddie_mac",
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching ${seriesId}:`, error);
      // Continue with other series
    }
  }

  if (rates.length === 0) {
    console.error("No rates fetched. Check your FRED API key.");
    process.exit(1);
  }

  console.log(`\nInserting ${rates.length} rate records...`);

  // Insert in batches
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < rates.length; i += BATCH_SIZE) {
    const batch = rates.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from("mortgage_rates")
      .upsert(batch, {
        onConflict: "rate_type,rate_date",
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
    } else {
      inserted += batch.length;
      console.log(`  Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${inserted}/${rates.length})`);
    }
  }

  console.log(`\nDone! Inserted ${inserted} mortgage rates.`);

  // Show sample of latest rates
  const { data: latestRates } = await supabase
    .from("mortgage_rates")
    .select("rate_type, rate_date, rate_value")
    .order("rate_date", { ascending: false })
    .limit(6);

  if (latestRates) {
    console.log("\nLatest rates:");
    for (const rate of latestRates) {
      console.log(`  ${rate.rate_date} | ${rate.rate_type.padEnd(10)} | ${rate.rate_value}%`);
    }
  }
}

main().catch(console.error);
