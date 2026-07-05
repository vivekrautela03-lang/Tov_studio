-- 0002_profiles_and_rbac.sql
-- Upgrade authentication schemas to profiles, member directories, and logs with RLS policies

-- 1. Rename public.users to public.profiles
alter table public.users rename to profiles;

-- Add bio column
alter table public.profiles add column bio text;

-- 2. Drop old auth triggers and sync functions
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 3. Create updated handle_new_user trigger function to populate profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'Crew'::user_role
  );
  return new;
end;
$$ language plpgsql security definer;

-- Bind trigger back
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 4. Create production_members mapping table
create table public.production_members (
  id uuid primary key default uuid_generate_v4(),
  production_id uuid references public.productions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null, -- Owner, Producer, Director, Writer, Editor, Crew, Client
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (production_id, user_id)
);

-- Enable RLS
alter table public.production_members enable row level security;

-- Policies for production_members
create policy "Allow select access to production_members for authenticated" on public.production_members
  for select using (auth.role() = 'authenticated');

create policy "Allow write access to production_members for authenticated" on public.production_members
  for all using (auth.role() = 'authenticated');


-- 5. Create invitations table
create table public.invitations (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  role text not null,
  production_id uuid references public.productions(id) on delete cascade,
  invited_by uuid references public.profiles(id) on delete set null,
  status text default 'Pending' not null, -- Pending, Accepted, Declined
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.invitations enable row level security;

-- Policies for invitations
create policy "Allow select access to invitations for authenticated or matching email" on public.invitations
  for select using (auth.role() = 'authenticated' or auth.jwt()->>'email' = email);

create policy "Allow write access to invitations for authenticated" on public.invitations
  for all using (auth.role() = 'authenticated');


-- 6. Create activity_logs table
create table public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  action text not null,
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.activity_logs enable row level security;

-- Policies for activity_logs
create policy "Allow select access to activity_logs for authenticated" on public.activity_logs
  for select using (auth.role() = 'authenticated');

create policy "Allow insert access to activity_logs for authenticated" on public.activity_logs
  for insert with check (auth.role() = 'authenticated');
