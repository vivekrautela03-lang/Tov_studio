-- 0007_standardize_schema_columns.sql

-- 1. Alter equipment table to match category, photo, and assigned_to properties
alter table public.equipment add column if not exists category text;
alter table public.equipment add column if not exists photo text;
alter table public.equipment add column if not exists assigned_to_name text;

-- 2. Alter files table to add production_id, name, type, size columns
alter table public.files add column if not exists production_id uuid references public.productions(id) on delete cascade;
alter table public.files add column if not exists name text;
alter table public.files add column if not exists type text;
alter table public.files add column if not exists size text;

-- 3. Create a dedicated shot_plans table for the Shot Planner View
create table if not exists public.shot_plans (
  id uuid primary key default uuid_generate_v4(),
  production_id uuid references public.productions(id) on delete cascade,
  scene text not null,
  setup text not null,
  props text[],
  crew text[],
  duration text,
  location text,
  weather text,
  status text default 'Todo',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.shot_plans enable row level security;
drop policy if exists "Allow authenticated actions for shot_plans" on public.shot_plans;
create policy "Allow authenticated actions for shot_plans" on public.shot_plans
  for all using (auth.role() = 'authenticated');

-- 4. Create a dedicated calendar_events table
create table if not exists public.calendar_events (
  id uuid primary key default uuid_generate_v4(),
  production_id uuid references public.productions(id) on delete cascade,
  title text not null,
  date date not null,
  type text default 'shoot',
  time text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.calendar_events enable row level security;
drop policy if exists "Allow authenticated actions for calendar_events" on public.calendar_events;
create policy "Allow authenticated actions for calendar_events" on public.calendar_events
  for all using (auth.role() = 'authenticated');
