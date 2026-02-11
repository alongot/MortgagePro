-- ============================================================
-- Mortgage Pro — Mortgage Rates Table
-- ============================================================

-- Mortgage rates table for storing historical Freddie Mac PMMS data
CREATE TABLE public.mortgage_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_type text NOT NULL CHECK (rate_type IN ('30_fixed', '15_fixed', '5_1_arm')),
  rate_date date NOT NULL,
  rate_value numeric(5,3) NOT NULL,
  source text DEFAULT 'freddie_mac',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(rate_type, rate_date)
);

-- Index for fast lookups by date and type
CREATE INDEX idx_mortgage_rates_date ON public.mortgage_rates(rate_date DESC);
CREATE INDEX idx_mortgage_rates_type_date ON public.mortgage_rates(rate_type, rate_date DESC);

-- No RLS needed - rates are public data
COMMENT ON TABLE public.mortgage_rates IS 'Historical mortgage rates from Freddie Mac PMMS';
COMMENT ON COLUMN public.mortgage_rates.rate_type IS '30_fixed = 30-year fixed, 15_fixed = 15-year fixed, 5_1_arm = 5/1 ARM';
COMMENT ON COLUMN public.mortgage_rates.rate_value IS 'Interest rate as percentage (e.g., 6.875)';
COMMENT ON COLUMN public.mortgage_rates.source IS 'Data source, typically freddie_mac';
