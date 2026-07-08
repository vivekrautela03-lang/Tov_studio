-- 0017_clear_database_and_enable_cross_user_select.sql
-- Clear all user/mock data and establish open SELECT RLS policies for crew profiles and activities discovery

-- 1. Truncate all transaction tables in public schema to start fresh
truncate table public.activities cascade;
truncate table public.activity_logs cascade;
truncate table public.ai_conversations cascade;
truncate table public.approvals cascade;
truncate table public.budgets cascade;
truncate table public.calendar_events cascade;
truncate table public.call_sheets cascade;
truncate table public.cast_members cascade;
truncate table public.crew cascade;
truncate table public.device_login_history cascade;
truncate table public.equipment cascade;
truncate table public.files cascade;
truncate table public.invitations cascade;
truncate table public.locations cascade;
truncate table public.messages cascade;
truncate table public.notifications cascade;
truncate table public.organizations cascade;
truncate table public.portfolio cascade;
truncate table public.production_members cascade;
truncate table public.productions cascade;
truncate table public.projects cascade;
truncate table public.scenes cascade;
truncate table public.schedules cascade;
truncate table public.script_versions cascade;
truncate table public.scripts cascade;
truncate table public.shot_plans cascade;
truncate table public.skills cascade;
truncate table public.social_links cascade;
truncate table public.statistics cascade;
truncate table public.storyboard_shots cascade;
truncate table public.tasks cascade;
truncate table public.user_preferences cascade;
truncate table public.user_tags cascade;
truncate table public.profiles cascade;

-- 2. Drop and establish new SELECT RLS policies for public schemas to allow discovery/networking among crew
-- profiles
drop policy if exists "Allow public profiles read access" on public.profiles;
drop policy if exists "Allow users to modify their own profile" on public.profiles;
drop policy if exists "Allow users to insert their own profile" on public.profiles;
drop policy if exists "Allow users to update their own profile" on public.profiles;
drop policy if exists "Allow select profiles for authenticated" on public.profiles;
drop policy if exists "Allow insert profile for self" on public.profiles;
drop policy if exists "Allow update profile for self" on public.profiles;
drop policy if exists "Allow delete profile for self" on public.profiles;

create policy "Allow select profiles for authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "Allow insert profile for self" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Allow update profile for self" on public.profiles
  for update using (auth.uid() = id);
create policy "Allow delete profile for self" on public.profiles
  for delete using (auth.uid() = id);

-- social_links
drop policy if exists "Allow all actions on social_links for owner" on public.social_links;
drop policy if exists "Allow select social_links for authenticated" on public.social_links;
drop policy if exists "Allow modify social_links for owner" on public.social_links;

create policy "Allow select social_links for authenticated" on public.social_links
  for select using (auth.role() = 'authenticated');
create policy "Allow modify social_links for owner" on public.social_links
  for all using (auth.uid() = user_id);

-- portfolio
drop policy if exists "Allow all actions on portfolio for owner" on public.portfolio;
drop policy if exists "Allow select portfolio for authenticated" on public.portfolio;
drop policy if exists "Allow modify portfolio for owner" on public.portfolio;

create policy "Allow select portfolio for authenticated" on public.portfolio
  for select using (auth.role() = 'authenticated');
create policy "Allow modify portfolio for owner" on public.portfolio
  for all using (auth.uid() = user_id);

-- skills
drop policy if exists "Allow all actions on skills for owner" on public.skills;
drop policy if exists "Allow select skills for authenticated" on public.skills;
drop policy if exists "Allow modify skills for owner" on public.skills;

create policy "Allow select skills for authenticated" on public.skills
  for select using (auth.role() = 'authenticated');
create policy "Allow modify skills for owner" on public.skills
  for all using (auth.uid() = user_id);

-- user_tags
drop policy if exists "Allow all actions on user_tags for owner" on public.user_tags;
drop policy if exists "Allow select user_tags for authenticated" on public.user_tags;
drop policy if exists "Allow modify user_tags for owner" on public.user_tags;

create policy "Allow select user_tags for authenticated" on public.user_tags
  for select using (auth.role() = 'authenticated');
create policy "Allow modify user_tags for owner" on public.user_tags
  for all using (auth.uid() = user_id);

-- activities
drop policy if exists "Allow all actions on activities for owner" on public.activities;
drop policy if exists "Allow select activities for authenticated" on public.activities;
drop policy if exists "Allow modify activities for owner" on public.activities;

create policy "Allow select activities for authenticated" on public.activities
  for select using (auth.role() = 'authenticated');
create policy "Allow modify activities for owner" on public.activities
  for all using (auth.uid() = user_id);
