-- Add free leads tracking to profiles
-- Each new user gets 10 free leads

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS free_leads_remaining INTEGER NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS free_leads_city TEXT,
ADD COLUMN IF NOT EXISTS free_leads_state TEXT,
ADD COLUMN IF NOT EXISTS free_leads_claimed_at TIMESTAMPTZ;

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_free_leads
ON public.profiles (free_leads_remaining)
WHERE free_leads_remaining > 0;

-- Comment explaining the columns
COMMENT ON COLUMN public.profiles.free_leads_remaining IS 'Number of free refinancing leads remaining (starts at 10)';
COMMENT ON COLUMN public.profiles.free_leads_city IS 'City selected for free leads';
COMMENT ON COLUMN public.profiles.free_leads_state IS 'State selected for free leads';
COMMENT ON COLUMN public.profiles.free_leads_claimed_at IS 'When free leads were claimed';
