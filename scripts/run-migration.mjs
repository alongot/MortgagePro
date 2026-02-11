// Run migration via Supabase pg endpoint
const PROJECT_REF = 'nvksevlmgkmnkglrjqus';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52a3NldmxtZ2ttbmtnbHJqcXVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5NjIzOCwiZXhwIjoyMDg2MjcyMjM4fQ.3NGHx5Zaa7FFffsDKHSLjb31A3srRd-14Ip_LaPTsHA';

const sql = `
-- Profiles
create table if not exists public.profiles (
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
);

-- Properties
create table if not exists public.properties (
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
  loan_type text not null default 'conventional',
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
  status text not null default 'new',
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
  lead_id uuid,
  title text not null,
  description text,
  due_date timestamptz,
  priority text not null default 'medium',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Activities
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lead_id uuid not null,
  type text not null,
  title text not null,
  description text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- List Items
create table if not exists public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique (list_id, lead_id)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.pipeline_cards enable row level security;
alter table public.tasks enable row level security;
alter table public.activities enable row level security;

-- Profile policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Leads policies
drop policy if exists "Users can view own leads" on public.leads;
create policy "Users can view own leads" on public.leads for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own leads" on public.leads;
create policy "Users can insert own leads" on public.leads for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own leads" on public.leads;
create policy "Users can update own leads" on public.leads for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own leads" on public.leads;
create policy "Users can delete own leads" on public.leads for delete using (auth.uid() = user_id);

-- Lists policies
drop policy if exists "Users can view own lists" on public.lists;
create policy "Users can view own lists" on public.lists for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own lists" on public.lists;
create policy "Users can insert own lists" on public.lists for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own lists" on public.lists;
create policy "Users can update own lists" on public.lists for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own lists" on public.lists;
create policy "Users can delete own lists" on public.lists for delete using (auth.uid() = user_id);

-- Tasks policies
drop policy if exists "Users can view own tasks" on public.tasks;
create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own tasks" on public.tasks;
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own tasks" on public.tasks;
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id);

-- Stages policies
drop policy if exists "Users can view own stages" on public.pipeline_stages;
create policy "Users can view own stages" on public.pipeline_stages for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own stages" on public.pipeline_stages;
create policy "Users can insert own stages" on public.pipeline_stages for insert with check (auth.uid() = user_id);

-- Activities policies
drop policy if exists "Users can view own activities" on public.activities;
create policy "Users can view own activities" on public.activities for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own activities" on public.activities;
create policy "Users can insert own activities" on public.activities for insert with check (auth.uid() = user_id);

-- Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
`;

async function run() {
  console.log('Running migration via Supabase API...\n');

  // Try the query endpoint
  const response = await fetch(`https://${PROJECT_REF}.supabase.co/rest/v1/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
  });

  // Check if we can connect
  const testResponse = await fetch(`https://${PROJECT_REF}.supabase.co/rest/v1/profiles?select=id&limit=1`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
  });

  const testResult = await testResponse.json();
  console.log('Test connection result:', testResponse.status, JSON.stringify(testResult).slice(0, 200));

  if (testResponse.status === 404 || (testResult.code === '42P01')) {
    console.log('\nTables do not exist yet. Outputting SQL for manual execution...\n');
    console.log('='.repeat(70));
    console.log('PASTE THIS SQL IN: https://supabase.com/dashboard/project/nvksevlmgkmnkglrjqus/sql');
    console.log('='.repeat(70));
    console.log(sql);

    // Save to file
    const fs = await import('fs');
    fs.writeFileSync('scripts/schema.sql', sql);
    console.log('\n\nAlso saved to scripts/schema.sql');
  } else {
    console.log('\nConnection successful! Tables may already exist.');
  }
}

run().catch(console.error);
