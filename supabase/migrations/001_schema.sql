-- ============================================================
-- Mortgage Pro — Database Schema
-- ============================================================

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  company text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Properties
create table public.properties (
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
create table public.owners (
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
create table public.mortgage_records (
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
create table public.leads (
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
create table public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  color text not null default '#3b82f6',
  lead_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- List Items (many-to-many)
create table public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique (list_id, lead_id)
);

-- Pipeline Stages
create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  position int not null default 0,
  color text not null default '#3b82f6',
  created_at timestamptz not null default now()
);

-- Pipeline Cards
create table public.pipeline_cards (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.pipeline_stages(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Tasks
create table public.tasks (
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
create table public.activities (
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

-- Indexes
create index idx_properties_state on public.properties(state);
create index idx_properties_city on public.properties(city);
create index idx_properties_zip on public.properties(zip);
create index idx_properties_type on public.properties(property_type);
create index idx_owners_property on public.owners(property_id);
create index idx_mortgage_property on public.mortgage_records(property_id);
create index idx_leads_user on public.leads(user_id);
create index idx_leads_status on public.leads(status);
create index idx_leads_property on public.leads(property_id);
create index idx_lists_user on public.lists(user_id);
create index idx_list_items_list on public.list_items(list_id);
create index idx_list_items_lead on public.list_items(lead_id);
create index idx_pipeline_stages_user on public.pipeline_stages(user_id);
create index idx_pipeline_cards_stage on public.pipeline_cards(stage_id);
create index idx_tasks_user on public.tasks(user_id);
create index idx_tasks_lead on public.tasks(lead_id);
create index idx_tasks_status on public.tasks(status);
create index idx_activities_user on public.activities(user_id);
create index idx_activities_lead on public.activities(lead_id);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.pipeline_cards enable row level security;
alter table public.tasks enable row level security;
alter table public.activities enable row level security;

-- Profiles: users can read/update own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Leads: users can CRUD own leads
create policy "Users can view own leads" on public.leads
  for select using (auth.uid() = user_id);
create policy "Users can insert own leads" on public.leads
  for insert with check (auth.uid() = user_id);
create policy "Users can update own leads" on public.leads
  for update using (auth.uid() = user_id);
create policy "Users can delete own leads" on public.leads
  for delete using (auth.uid() = user_id);

-- Lists: users can CRUD own lists
create policy "Users can view own lists" on public.lists
  for select using (auth.uid() = user_id);
create policy "Users can insert own lists" on public.lists
  for insert with check (auth.uid() = user_id);
create policy "Users can update own lists" on public.lists
  for update using (auth.uid() = user_id);
create policy "Users can delete own lists" on public.lists
  for delete using (auth.uid() = user_id);

-- List items: via list ownership
create policy "Users can view list items" on public.list_items
  for select using (
    exists (select 1 from public.lists where lists.id = list_items.list_id and lists.user_id = auth.uid())
  );
create policy "Users can insert list items" on public.list_items
  for insert with check (
    exists (select 1 from public.lists where lists.id = list_items.list_id and lists.user_id = auth.uid())
  );
create policy "Users can delete list items" on public.list_items
  for delete using (
    exists (select 1 from public.lists where lists.id = list_items.list_id and lists.user_id = auth.uid())
  );

-- Pipeline stages: own
create policy "Users can view own stages" on public.pipeline_stages
  for select using (auth.uid() = user_id);
create policy "Users can insert own stages" on public.pipeline_stages
  for insert with check (auth.uid() = user_id);
create policy "Users can update own stages" on public.pipeline_stages
  for update using (auth.uid() = user_id);
create policy "Users can delete own stages" on public.pipeline_stages
  for delete using (auth.uid() = user_id);

-- Pipeline cards: via stage ownership
create policy "Users can view own cards" on public.pipeline_cards
  for select using (
    exists (select 1 from public.pipeline_stages where pipeline_stages.id = pipeline_cards.stage_id and pipeline_stages.user_id = auth.uid())
  );
create policy "Users can insert own cards" on public.pipeline_cards
  for insert with check (
    exists (select 1 from public.pipeline_stages where pipeline_stages.id = pipeline_cards.stage_id and pipeline_stages.user_id = auth.uid())
  );
create policy "Users can update own cards" on public.pipeline_cards
  for update using (
    exists (select 1 from public.pipeline_stages where pipeline_stages.id = pipeline_cards.stage_id and pipeline_stages.user_id = auth.uid())
  );
create policy "Users can delete own cards" on public.pipeline_cards
  for delete using (
    exists (select 1 from public.pipeline_stages where pipeline_stages.id = pipeline_cards.stage_id and pipeline_stages.user_id = auth.uid())
  );

-- Tasks: own
create policy "Users can view own tasks" on public.tasks
  for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks
  for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks
  for delete using (auth.uid() = user_id);

-- Activities: own
create policy "Users can view own activities" on public.activities
  for select using (auth.uid() = user_id);
create policy "Users can insert own activities" on public.activities
  for insert with check (auth.uid() = user_id);

-- Properties, owners, mortgages are public read (shared data)
-- No RLS needed for read-only shared data

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to update list lead count
create or replace function public.update_list_lead_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.lists set lead_count = lead_count + 1, updated_at = now()
    where id = NEW.list_id;
  elsif TG_OP = 'DELETE' then
    update public.lists set lead_count = lead_count - 1, updated_at = now()
    where id = OLD.list_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_list_item_change
  after insert or delete on public.list_items
  for each row execute function public.update_list_lead_count();
