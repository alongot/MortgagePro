// Setup database tables via Supabase Management API
const SUPABASE_URL = 'https://nvksevlmgkmnkglrjqus.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52a3NldmxtZ2ttbmtnbHJqcXVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5NjIzOCwiZXhwIjoyMDg2MjcyMjM4fQ.3NGHx5Zaa7FFffsDKHSLjb31A3srRd-14Ip_LaPTsHA';

const statements = [
  // Profiles
  `create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    full_name text,
    avatar_url text,
    company text,
    role text not null default 'user',
    free_leads_remaining integer not null default 10,
    free_leads_city text,
    free_leads_state text,
    free_leads_claimed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,

  // Properties
  `create table if not exists public.properties (
    id uuid primary key default gen_random_uuid(),
    address text not null,
    city text not null,
    state text not null,
    zip text not null,
    county text not null default '',
    property_type text not null default 'single_family',
    bedrooms int,
    bathrooms int,
    sqft int,
    lot_size int,
    year_built int,
    estimated_value numeric(12,2),
    last_sale_price numeric(12,2),
    last_sale_date date,
    created_at timestamptz not null default now()
  )`,

  // Owners
  `create table if not exists public.owners (
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
  )`,

  // Mortgage Records
  `create table if not exists public.mortgage_records (
    id uuid primary key default gen_random_uuid(),
    property_id uuid not null references public.properties(id) on delete cascade,
    lender_name text,
    loan_amount numeric(12,2),
    interest_rate numeric(5,3),
    loan_type text not null default 'conventional',
    origination_date date,
    maturity_date date,
    is_arm boolean not null default false,
    arm_reset_date date,
    ltv_ratio numeric(5,2),
    estimated_equity numeric(12,2),
    monthly_payment numeric(10,2),
    created_at timestamptz not null default now()
  )`,

  // Leads
  `create table if not exists public.leads (
    id uuid primary key default gen_random_uuid(),
    property_id uuid not null references public.properties(id) on delete cascade,
    owner_id uuid not null references public.owners(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    status text not null default 'new',
    score int not null default 0,
    tags text[] not null default '{}',
    notes text,
    contact_revealed boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,

  // Lists
  `create table if not exists public.lists (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    name text not null,
    description text,
    color text not null default '#3b82f6',
    lead_count int not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,

  // Pipeline Stages
  `create table if not exists public.pipeline_stages (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    name text not null,
    position int not null default 0,
    color text not null default '#3b82f6',
    created_at timestamptz not null default now()
  )`,

  // Tasks
  `create table if not exists public.tasks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    lead_id uuid,
    title text not null,
    description text,
    due_date timestamptz,
    priority text not null default 'medium',
    status text not null default 'pending',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,

  // Activities
  `create table if not exists public.activities (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    lead_id uuid not null,
    type text not null,
    title text not null,
    description text,
    metadata jsonb,
    created_at timestamptz not null default now()
  )`,

  // RLS
  `alter table public.profiles enable row level security`,
  `alter table public.leads enable row level security`,
  `alter table public.lists enable row level security`,
  `alter table public.pipeline_stages enable row level security`,
  `alter table public.tasks enable row level security`,
  `alter table public.activities enable row level security`,

  // Profile policies
  `create policy if not exists "Users can view own profile" on public.profiles for select using (auth.uid() = id)`,
  `create policy if not exists "Users can update own profile" on public.profiles for update using (auth.uid() = id)`,

  // Leads policies
  `create policy if not exists "Users can view own leads" on public.leads for select using (auth.uid() = user_id)`,
  `create policy if not exists "Users can insert own leads" on public.leads for insert with check (auth.uid() = user_id)`,
  `create policy if not exists "Users can update own leads" on public.leads for update using (auth.uid() = user_id)`,
  `create policy if not exists "Users can delete own leads" on public.leads for delete using (auth.uid() = user_id)`,

  // Auto-create profile trigger
  `create or replace function public.handle_new_user()
   returns trigger as $$
   begin
     insert into public.profiles (id, email, full_name)
     values (new.id, new.email, new.raw_user_meta_data->>'full_name');
     return new;
   end;
   $$ language plpgsql security definer`,

  `drop trigger if exists on_auth_user_created on auth.users`,
  `create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user()`,
];

async function runSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ query: sql }),
  });
  return response;
}

async function setup() {
  console.log('Setting up database tables...\n');

  // Use pg directly via the PostgREST query endpoint isn't possible
  // We need to use a workaround - create via Supabase client insert/upsert approach
  // Or output SQL for manual execution

  console.log('='.repeat(60));
  console.log('COPY THE SQL BELOW AND PASTE IN SUPABASE SQL EDITOR:');
  console.log('https://supabase.com/dashboard/project/nvksevlmgkmnkglrjqus/sql');
  console.log('='.repeat(60));
  console.log('\n');

  const fullSQL = statements.join(';\n\n') + ';';
  console.log(fullSQL);

  // Also save to file
  const fs = await import('fs');
  fs.writeFileSync('scripts/schema.sql', fullSQL);
  console.log('\n\nSQL also saved to: scripts/schema.sql');
}

setup();
