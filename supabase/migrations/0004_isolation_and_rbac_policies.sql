-- 0004_isolation_and_rbac_policies.sql
-- Implement dynamic data isolation, workspace seeding trigger, and Role-Based Access Control policies

-- 1. Create trigger function to automatically seed workspace memberships on signup
create or replace function public.handle_new_user_production_seeding()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Seed Owner memberships for the three default production workspaces
  insert into public.production_members (production_id, user_id, role)
  values 
    ('d3b07384-d113-4ec6-a558-7e289bf449f1', new.id, 'Owner'),
    ('44b6c33c-35cd-43ff-90a6-c956b7cdb10d', new.id, 'Owner'),
    ('5c84a861-26be-45a2-9ad6-2ea8fb60a5ad', new.id, 'Owner')
  on conflict (production_id, user_id) do nothing;
  return new;
end;
$$;

-- Drop trigger if exists and bind it
drop trigger if exists on_profile_created_seed_members on public.profiles;
create trigger on_profile_created_seed_members
  after insert on public.profiles
  for each row execute procedure public.handle_new_user_production_seeding();


-- 2. Drop legacy flat RLS policies
drop policy if exists "Allow authenticated actions for productions" on public.productions;
drop policy if exists "Allow authenticated actions for projects" on public.projects;
drop policy if exists "Allow authenticated actions for crew" on public.crew;
drop policy if exists "Allow authenticated actions for cast_members" on public.cast_members;
drop policy if exists "Allow authenticated actions for scripts" on public.scripts;
drop policy if exists "Allow authenticated actions for storyboard_shots" on public.storyboard_shots;
drop policy if exists "Allow authenticated actions for equipment" on public.equipment;
drop policy if exists "Allow authenticated actions for locations" on public.locations;
drop policy if exists "Allow authenticated actions for schedules" on public.schedules;
drop policy if exists "Allow authenticated actions for tasks" on public.tasks;
drop policy if exists "Allow authenticated actions for budgets" on public.budgets;
drop policy if exists "Allow authenticated actions for files" on public.files;

-- Drop new policies to guarantee idempotency on retry
drop policy if exists "Allow select productions for members only" on public.productions;
drop policy if exists "Allow modify productions for owners/producers" on public.productions;
drop policy if exists "Allow select projects for members only" on public.projects;
drop policy if exists "Allow modify projects for creatives" on public.projects;
drop policy if exists "Allow select crew for members" on public.crew;
drop policy if exists "Allow modify crew for producers" on public.crew;
drop policy if exists "Allow select cast for members" on public.cast_members;
drop policy if exists "Allow modify cast for producers" on public.cast_members;
drop policy if exists "Allow select scripts for members" on public.scripts;
drop policy if exists "Allow modify scripts for creatives" on public.scripts;
drop policy if exists "Allow select storyboard for members" on public.storyboard_shots;
drop policy if exists "Allow modify storyboard for editors/creatives" on public.storyboard_shots;
drop policy if exists "Allow access to budgets for producers only" on public.budgets;
drop policy if exists "Allow select files for members" on public.files;
drop policy if exists "Allow modify files for members" on public.files;
drop policy if exists "Allow select schedules for members" on public.schedules;
drop policy if exists "Allow modify schedules for creatives" on public.schedules;
drop policy if exists "Allow select tasks for members" on public.tasks;
drop policy if exists "Allow modify tasks for members" on public.tasks;


-- 3. Create Isolation & Role-Based Access Control Policies

-- productions
create policy "Allow select productions for members only" on public.productions
  for select using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = id and pm.user_id = auth.uid()
    )
  );

create policy "Allow modify productions for owners/producers" on public.productions
  for all using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = id and pm.user_id = auth.uid()
      and pm.role in ('Owner', 'Producer')
    )
  );

-- projects
create policy "Allow select projects for members only" on public.projects
  for select using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
    )
  );

create policy "Allow modify projects for creatives" on public.projects
  for all using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
      and pm.role in ('Owner', 'Producer', 'Director', 'Writer')
    )
  );

-- crew
create policy "Allow select crew for members" on public.crew
  for select using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
    )
  );

create policy "Allow modify crew for producers" on public.crew
  for all using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
      and pm.role in ('Owner', 'Producer')
    )
  );

-- cast_members
create policy "Allow select cast for members" on public.cast_members
  for select using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
    )
  );

create policy "Allow modify cast for producers" on public.cast_members
  for all using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
      and pm.role in ('Owner', 'Producer')
    )
  );

-- scripts
create policy "Allow select scripts for members" on public.scripts
  for select using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
    )
  );

create policy "Allow modify scripts for creatives" on public.scripts
  for all using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
      and pm.role in ('Owner', 'Producer', 'Director', 'Writer')
    )
  );

-- storyboard_shots
create policy "Allow select storyboard for members" on public.storyboard_shots
  for select using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
    )
  );

create policy "Allow modify storyboard for editors/creatives" on public.storyboard_shots
  for all using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
      and pm.role in ('Owner', 'Producer', 'Director', 'Writer', 'Editor')
    )
  );

-- budgets (Strict RBAC: Only Owner/Producer can select or modify)
create policy "Allow access to budgets for producers only" on public.budgets
  for all using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
      and pm.role in ('Owner', 'Producer')
    )
  );

-- files
create policy "Allow select files for members" on public.files
  for select using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
    )
  );

create policy "Allow modify files for members" on public.files
  for all using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
    )
  );

-- schedules
create policy "Allow select schedules for members" on public.schedules
  for select using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
    )
  );

create policy "Allow modify schedules for creatives" on public.schedules
  for all using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
      and pm.role in ('Owner', 'Producer', 'Director')
    )
  );

-- tasks
create policy "Allow select tasks for members" on public.tasks
  for select using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
    )
  );

create policy "Allow modify tasks for members" on public.tasks
  for all using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
    )
  );
