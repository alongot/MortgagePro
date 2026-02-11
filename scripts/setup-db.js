// Setup database tables
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nvksevlmgkmnkglrjqus.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52a3NldmxtZ2ttbmtnbHJqcXVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5NjIzOCwiZXhwIjoyMDg2MjcyMjM4fQ.3NGHx5Zaa7FFffsDKHSLjb31A3srRd-14Ip_LaPTsHA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('Setting up database...\n');

  const sql = `
-- ============================================================
-- Mortgage Pro — Full Database Schema + Free Leads
-- ============================================================

-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  company text,
  role text not null default 'user' check (role in ('admin', 'user')),
  free_leads_remaining integer not null default 10,
  free_leads_city text,
  free_leads_state text,
  free_leads_claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Properties
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  city text not null,
  state text not null,
  zip text not null,
  county text not null default '',
  property_type text not null default 'single_family'
    check (property_type in ('single_family','multi_family','condo','townhouse','commercial','land')),
  bedrooms int,
  bathrooms int,
  sqft int,
  lot_size int,
  year_built int,
  estimated_value numeric(12,2),
  last_sale_price numeric(12,2),
  last_sale_date date,
  created_at timestamptz not null default now()
);

-- Owners
create table if not exists public.owners (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  mailing_address text,
  mailing_city text,
  mailing_state text,
  mailing_zip text,
  phone text,
  email text,
  is_absentee boolean not null default false,
  ownership_length_years int,
  created_at timestamptz not null default now()
);

-- Mortgage Records
create table if not exists public.mortgage_records (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  lender_name text,
  loan_amount numeric(12,2),
  interest_rate numeric(5,3),
  loan_type text not null default 'conventional'
    check (loan_type in ('conventional','fha','va','jumbo','usda','other')),
  origination_date date,
  maturity_date date,
  is_arm boolean not null default false,
  arm_reset_date date,
  ltv_ratio numeric(5,2),
  estimated_equity numeric(12,2),
  monthly_payment numeric(10,2),
  created_at timestamptz not null default now()
);

-- Leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  owner_id uuid not null references public.owners(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'new'
    check (status in ('new','contacted','qualified','proposal','negotiation','won','lost')),
  score int not null default 0,
  tags text[] not null default '{}',
  notes text,
  contact_revealed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lists
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  color text not null default '#3b82f6',
  lead_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- List Items
create table if not exists public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique (list_id, lead_id)
);

-- Pipeline Stages
create table if not exists public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  position int not null default 0,
  color text not null default '#3b82f6',
  created_at timestamptz not null default now()
);

-- Pipeline Cards
create table if not exists public.pipeline_cards (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.pipeline_stages(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  title text not null,
  description text,
  due_date timestamptz,
  priority text not null default 'medium'
    check (priority in ('low','medium','high','urgent')),
  status text not null default 'pending'
    check (status in ('pending','in_progress','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Activities
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  type text not null
    check (type in ('call','email','sms','note','meeting','status_change','contact_reveal','list_add','task_created')),
  title text not null,
  description text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
  `;

  // Execute via REST API
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    // Try direct postgres connection approach - use individual table checks
    console.log('Using individual table creation approach...\n');

    // Check if profiles table exists by trying to select from it
    const { data, error } = await supabase.from('profiles').select('id').limit(1);

    if (error && error.code === '42P01') {
      console.log('Tables do not exist. Please run the SQL manually in Supabase Dashboard.');
      console.log('\nGo to: https://supabase.com/dashboard/project/nvksevlmgkmnkglrjqus/sql');
      console.log('\nThe SQL has been saved to: scripts/schema.sql');

      // Save SQL to file for manual execution
      const fs = require('fs');
      fs.writeFileSync('scripts/schema.sql', sql);

      return;
    }

    console.log('Tables already exist or check completed.');
    console.log('Data:', data);
    console.log('Error:', error);
  } else {
    console.log('Database setup complete!');
  }
}

setupDatabase().catch(console.error);
