-- 0016_create_extended_profile_tables.sql
-- Create extended tables for user profile identity, portfolio, social links, stats and auto-seeding triggers

-- 1. Alter public.profiles table
alter table public.profiles add column if not exists username text unique;
alter table public.profiles add column if not exists cover_url text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists website text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists dob date;
alter table public.profiles add column if not exists languages text[];
alter table public.profiles add column if not exists interests text[];
alter table public.profiles add column if not exists favorite_genres text[];
alter table public.profiles add column if not exists experience_years integer;
alter table public.profiles add column if not exists company_name text;
alter table public.profiles add column if not exists completeness integer default 0;

-- 2. Create public.social_links table
create table if not exists public.social_links (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique,
  instagram text,
  linkedin text,
  behance text,
  dribbble text,
  youtube text,
  imdb text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create public.portfolio table
create table if not exists public.portfolio (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  asset_type text not null, -- 'video' | 'image' | 'document' | 'audio'
  url text not null,
  thumbnail_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create public.skills table
create table if not exists public.skills (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, name)
);

-- 5. Create public.user_tags table
create table if not exists public.user_tags (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  tag text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, tag)
);

-- 6. Create public.user_preferences table
create table if not exists public.user_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique,
  theme text default 'dark',
  notifications_enabled boolean default true,
  profile_visibility text default 'public',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create public.statistics table
create table if not exists public.statistics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique,
  projects_count integer default 0,
  scripts_count integer default 0,
  storyboards_count integer default 0,
  ai_generations_count integer default 0,
  files_uploaded_count integer default 0,
  storage_used_bytes bigint default 0,
  hours_worked integer default 0,
  production_days integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create public.activities table
create table if not exists public.activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Rebuild handle_new_user() function to auto-seed identity records
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
  v_display_name text;
begin
  -- Generate unique username from email
  v_username := split_part(new.email, '@', 1);
  if exists (select 1 from public.profiles where username = v_username) then
    v_username := v_username || '_' || substring(new.id::text from 1 for 4);
  end if;

  v_display_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  -- Insert profile
  insert into public.profiles (
    id, email, full_name, username, bio, avatar_url, cover_url, location, website, completeness
  )
  values (
    new.id,
    new.email,
    v_display_name,
    v_username,
    'Cinematographer & Filmmaker. Welcome to my creative studio.',
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'),
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    'Neo Tokyo Sets, Stage 4',
    'https://tov.studio/' || v_username,
    45
  );

  -- Seed default user tags
  insert into public.user_tags (user_id, tag)
  values 
    (new.id, '🎬 Director'),
    (new.id, '🎥 Cinematographer');

  -- Seed default skills
  insert into public.skills (user_id, name)
  values 
    (new.id, 'Direction'),
    (new.id, 'Lighting'),
    (new.id, 'Editing');

  -- Seed default social links
  insert into public.social_links (user_id, instagram, linkedin, youtube, website)
  values (
    new.id,
    'https://instagram.com/' || v_username,
    'https://linkedin.com/in/' || v_username,
    'https://youtube.com/@' || v_username,
    'https://tov.studio/' || v_username
  );

  -- Seed default preferences
  insert into public.user_preferences (user_id)
  values (new.id);

  -- Seed default statistics
  insert into public.statistics (user_id)
  values (new.id);

  -- Seed welcome activities
  insert into public.activities (user_id, title, description)
  values 
    (new.id, 'Joined TOV Studio', 'Successfully registered and initialized creative filmmaker profile.'),
    (new.id, 'Profile Seeding Completed', 'Automatic system setup completed for tags, skills, and portfolio workspaces.');

  return new;
end;
$$;

-- 10. Enable Row Level Security (RLS) on new tables and drop existing policies if any
alter table public.social_links enable row level security;
drop policy if exists "Allow all actions on social_links for owner" on public.social_links;
create policy "Allow all actions on social_links for owner" on public.social_links
  for all using (auth.uid() = user_id);

alter table public.portfolio enable row level security;
drop policy if exists "Allow all actions on portfolio for owner" on public.portfolio;
create policy "Allow all actions on portfolio for owner" on public.portfolio
  for all using (auth.uid() = user_id);

alter table public.skills enable row level security;
drop policy if exists "Allow all actions on skills for owner" on public.skills;
create policy "Allow all actions on skills for owner" on public.skills
  for all using (auth.uid() = user_id);

alter table public.user_tags enable row level security;
drop policy if exists "Allow all actions on user_tags for owner" on public.user_tags;
create policy "Allow all actions on user_tags for owner" on public.user_tags
  for all using (auth.uid() = user_id);

alter table public.user_preferences enable row level security;
drop policy if exists "Allow all actions on user_preferences for owner" on public.user_preferences;
create policy "Allow all actions on user_preferences for owner" on public.user_preferences
  for all using (auth.uid() = user_id);

alter table public.statistics enable row level security;
drop policy if exists "Allow all actions on statistics for owner" on public.statistics;
create policy "Allow all actions on statistics for owner" on public.statistics
  for all using (auth.uid() = user_id);

alter table public.activities enable row level security;
drop policy if exists "Allow all actions on activities for owner" on public.activities;
create policy "Allow all actions on activities for owner" on public.activities
  for all using (auth.uid() = user_id);
