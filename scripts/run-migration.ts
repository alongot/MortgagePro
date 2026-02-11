/**
 * Run database migration
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log("Running mortgage_rates migration...\n");

  // Check if table already exists
  const { data: existing } = await supabase
    .from("mortgage_rates")
    .select("id")
    .limit(1);

  if (existing !== null) {
    console.log("Table mortgage_rates already exists. Skipping migration.");
    return;
  }

  // Table doesn't exist, need to create via SQL
  // Since supabase-js doesn't support raw SQL, we'll use the REST API
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseServiceKey,
      "Authorization": `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({
      query: `
        CREATE TABLE IF NOT EXISTS public.mortgage_rates (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          rate_type text NOT NULL CHECK (rate_type IN ('30_fixed', '15_fixed', '5_1_arm')),
          rate_date date NOT NULL,
          rate_value numeric(5,3) NOT NULL,
          source text DEFAULT 'freddie_mac',
          created_at timestamptz NOT NULL DEFAULT now(),
          UNIQUE(rate_type, rate_date)
        );
        CREATE INDEX IF NOT EXISTS idx_mortgage_rates_date ON public.mortgage_rates(rate_date DESC);
        CREATE INDEX IF NOT EXISTS idx_mortgage_rates_type_date ON public.mortgage_rates(rate_type, rate_date DESC);
      `
    }),
  });

  if (!response.ok) {
    console.log("Note: Direct SQL execution not available via API.");
    console.log("Please run the migration manually in Supabase Dashboard > SQL Editor:");
    console.log(`
CREATE TABLE public.mortgage_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_type text NOT NULL CHECK (rate_type IN ('30_fixed', '15_fixed', '5_1_arm')),
  rate_date date NOT NULL,
  rate_value numeric(5,3) NOT NULL,
  source text DEFAULT 'freddie_mac',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(rate_type, rate_date)
);

CREATE INDEX idx_mortgage_rates_date ON public.mortgage_rates(rate_date DESC);
CREATE INDEX idx_mortgage_rates_type_date ON public.mortgage_rates(rate_type, rate_date DESC);
    `);
  } else {
    console.log("Migration completed successfully!");
  }
}

runMigration().catch(console.error);
