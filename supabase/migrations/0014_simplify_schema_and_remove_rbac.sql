-- 0014_simplify_schema_and_remove_rbac.sql
-- Remove custom RBAC schemas and simplify Row-Level Security to direct user ownership

-- 1. Drop legacy RBAC mapping tables
drop table if exists public.role_permissions cascade;
drop table if exists public.permissions cascade;
drop table if exists public.roles cascade;

-- 2. Ensure all campaign tables have a direct user_id owner reference
alter table public.productions add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.scripts add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.files add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.calendar_events add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.shot_plans add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.storyboard_shots add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.tasks add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.crew add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.cast_members add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.equipment add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.call_sheets add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.notifications add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- 3. Simplify handle_new_user() trigger function to ignore custom roles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    null,
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$;

-- 4. Clean up legacy or conflicting RLS policies
drop policy if exists "Allow select productions for members only" on public.productions;
drop policy if exists "Allow modify productions for owners/producers" on public.productions;
drop policy if exists "Allow insert productions for authenticated users" on public.productions;
drop policy if exists "Allow update productions for owners/producers" on public.productions;
drop policy if exists "Allow delete productions for owners/producers" on public.productions;
drop policy if exists "Allow all actions on productions for owner" on public.productions;

drop policy if exists "Allow select scripts for members" on public.scripts;
drop policy if exists "Allow modify scripts for creatives" on public.scripts;
drop policy if exists "Allow all actions on scripts for owner" on public.scripts;

drop policy if exists "Allow select files for members" on public.files;
drop policy if exists "Allow modify files for members" on public.files;
drop policy if exists "Allow insert files for authenticated users" on public.files;
drop policy if exists "Allow update/delete files for members" on public.files;
drop policy if exists "Allow all actions on files for owner" on public.files;

drop policy if exists "Allow authenticated actions for calendar_events" on public.calendar_events;
drop policy if exists "Allow all actions on calendar_events for owner" on public.calendar_events;

drop policy if exists "Allow authenticated actions for shot_plans" on public.shot_plans;
drop policy if exists "Allow all actions on shot_plans for owner" on public.shot_plans;

drop policy if exists "Allow all actions on storyboard_shots for owner" on public.storyboard_shots;

drop policy if exists "Allow all actions on tasks for owner" on public.tasks;
drop policy if exists "Allow all actions on crew for owner" on public.crew;
drop policy if exists "Allow all actions on cast_members for owner" on public.cast_members;
drop policy if exists "Allow all actions on equipment for owner" on public.equipment;

drop policy if exists "Allow modify call_sheets for write_roles" on public.call_sheets;
drop policy if exists "Allow select call_sheets for members" on public.call_sheets;
drop policy if exists "Allow all actions on call_sheets for owner" on public.call_sheets;

drop policy if exists "Allow all actions on notifications for owner" on public.notifications;

-- 5. Deploy simple and robust RLS policies matching auth.uid() = user_id
alter table public.productions enable row level security;
create policy "Allow all actions on productions for owner" on public.productions
  for all using (auth.uid() = user_id);

alter table public.scripts enable row level security;
create policy "Allow all actions on scripts for owner" on public.scripts
  for all using (auth.uid() = user_id);

alter table public.files enable row level security;
create policy "Allow all actions on files for owner" on public.files
  for all using (auth.uid() = user_id);

alter table public.calendar_events enable row level security;
create policy "Allow all actions on calendar_events for owner" on public.calendar_events
  for all using (auth.uid() = user_id);

alter table public.shot_plans enable row level security;
create policy "Allow all actions on shot_plans for owner" on public.shot_plans
  for all using (auth.uid() = user_id);

alter table public.storyboard_shots enable row level security;
create policy "Allow all actions on storyboard_shots for owner" on public.storyboard_shots
  for all using (auth.uid() = user_id);

alter table public.tasks enable row level security;
create policy "Allow all actions on tasks for owner" on public.tasks
  for all using (auth.uid() = user_id);

alter table public.crew enable row level security;
create policy "Allow all actions on crew for owner" on public.crew
  for all using (auth.uid() = user_id);

alter table public.cast_members enable row level security;
create policy "Allow all actions on cast_members for owner" on public.cast_members
  for all using (auth.uid() = user_id);

alter table public.equipment enable row level security;
create policy "Allow all actions on equipment for owner" on public.equipment
  for all using (auth.uid() = user_id);

alter table public.call_sheets enable row level security;
create policy "Allow all actions on call_sheets for owner" on public.call_sheets
  for all using (auth.uid() = user_id);

alter table public.notifications enable row level security;
create policy "Allow all actions on notifications for owner" on public.notifications
  for all using (auth.uid() = user_id);
