-- 0015_add_user_id_to_scenes_and_storyboards.sql
-- Add user_id reference to scenes and deploy basic ownership policies

-- 1. Alter public.scenes to include user_id
alter table public.scenes add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- 2. Drop old policies
drop policy if exists "Allow select scenes for production members" on public.scenes;
drop policy if exists "Allow select call_sheets for members" on public.call_sheets;
drop policy if exists "Allow modify call_sheets for write_roles" on public.call_sheets;
drop policy if exists "Allow all actions on scenes for owner" on public.scenes;
drop policy if exists "Allow all actions on call_sheets for owner" on public.call_sheets;

-- 3. Deploy basic ownership policies
alter table public.scenes enable row level security;
create policy "Allow all actions on scenes for owner" on public.scenes
  for all using (auth.uid() = user_id);

alter table public.call_sheets enable row level security;
create policy "Allow all actions on call_sheets for owner" on public.call_sheets
  for all using (auth.uid() = user_id);
