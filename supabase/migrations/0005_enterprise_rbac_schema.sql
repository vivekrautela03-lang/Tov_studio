-- 0005_enterprise_rbac_schema.sql
-- Create normalized tables, audit logs, and seed roles/permissions

-- 1. Add extra columns to public.profiles
alter table public.profiles add column if not exists skills text[];
alter table public.profiles add column if not exists experience text;
alter table public.profiles add column if not exists emergency_contact text;
alter table public.profiles add column if not exists last_login timestamp with time zone;
alter table public.profiles add column if not exists department text;

-- 2. Create organizations table
create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.organizations enable row level security;

drop policy if exists "Allow select access to organizations for authenticated" on public.organizations;
create policy "Allow select access to organizations for authenticated" on public.organizations
  for select using (auth.role() = 'authenticated');

-- 3. Create roles & permissions schema
create table if not exists public.roles (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  description text
);
alter table public.roles enable row level security;

drop policy if exists "Allow select access to roles for authenticated" on public.roles;
create policy "Allow select access to roles for authenticated" on public.roles
  for select using (auth.role() = 'authenticated');

create table if not exists public.permissions (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  description text
);
alter table public.permissions enable row level security;

drop policy if exists "Allow select access to permissions for authenticated" on public.permissions;
create policy "Allow select access to permissions for authenticated" on public.permissions
  for select using (auth.role() = 'authenticated');

create table if not exists public.role_permissions (
  role_id uuid references public.roles(id) on delete cascade,
  permission_id uuid references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);
alter table public.role_permissions enable row level security;

drop policy if exists "Allow select access to role_permissions for authenticated" on public.role_permissions;
create policy "Allow select access to role_permissions for authenticated" on public.role_permissions
  for select using (auth.role() = 'authenticated');

-- 4. Create script_versions table
create table if not exists public.script_versions (
  id uuid primary key default uuid_generate_v4(),
  script_id uuid references public.scripts(id) on delete cascade,
  version_number integer not null,
  version_title text,
  content text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.script_versions enable row level security;

drop policy if exists "Allow select scripts_versions for production members" on public.script_versions;
create policy "Allow select scripts_versions for production members" on public.script_versions
  for select using (
    exists (
      select 1 from public.scripts s
      join public.projects p on p.id = s.project_id
      join public.production_members pm on pm.production_id = p.production_id
      where s.id = script_id and pm.user_id = auth.uid()
    )
  );

-- 5. Create scenes table
create table if not exists public.scenes (
  id uuid primary key default uuid_generate_v4(),
  production_id uuid references public.productions(id) on delete cascade,
  scene_number integer not null,
  title text not null,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.scenes enable row level security;

drop policy if exists "Allow select scenes for production members" on public.scenes;
create policy "Allow select scenes for production members" on public.scenes
  for select using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
    )
  );

-- 6. Create call_sheets table
create table if not exists public.call_sheets (
  id uuid primary key default uuid_generate_v4(),
  production_id uuid references public.productions(id) on delete cascade,
  date date not null,
  call_time text not null,
  weather_notes text,
  instructions text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.call_sheets enable row level security;

drop policy if exists "Allow select call_sheets for production members" on public.call_sheets;
create policy "Allow select call_sheets for production members" on public.call_sheets
  for select using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
    )
  );

-- 7. Create approvals table
create table if not exists public.approvals (
  id uuid primary key default uuid_generate_v4(),
  production_id uuid references public.productions(id) on delete cascade,
  requested_by uuid references public.profiles(id) on delete cascade,
  title text not null,
  details text,
  amount numeric,
  status text default 'Pending' not null, -- Pending, Approved, Rejected
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.approvals enable row level security;

drop policy if exists "Allow select approvals for production members" on public.approvals;
create policy "Allow select approvals for production members" on public.approvals
  for select using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
    )
  );

-- 8. Create messages table
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  production_id uuid references public.productions(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.messages enable row level security;

drop policy if exists "Allow select messages for production members" on public.messages;
create policy "Allow select messages for production members" on public.messages
  for select using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
    )
  );

-- 9. Create device_login_history table
create table if not exists public.device_login_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  ip_address text,
  user_agent text,
  logged_in_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.device_login_history enable row level security;

drop policy if exists "Allow select device history for profile owner" on public.device_login_history;
create policy "Allow select device history for profile owner" on public.device_login_history
  for select using (auth.uid() = user_id);

-- 10. Seed Enterprise Roles & Permissions data
insert into public.roles (name, description) values
  ('Owner', 'Highest administrative clearance. Full read/write over settings, finances, and assets.'),
  ('Production Manager', 'Handles day-to-day scheduling, logistics, and crew coordination.'),
  ('Director', 'Manages creative direction, shot logs, and updates scene screenplay cuts.'),
  ('Assistant Director', 'Coordinates timelines, tracks scene wrap stats, and marks items complete.'),
  ('Writer', 'Author of screenplays, edits dialog cuts, and views project schedules.'),
  ('Actor', 'Reviews assigned call times, costume details, scene sheets, and locations.'),
  ('Camera Department', 'Updates camera checklists, lenses lists, and lens setups.'),
  ('Cinematographer (DOP)', 'Configures LUT references, camera setups, and lighting diagrams.'),
  ('Editor', 'Maintains timelines, syncs video files, logs export tasks.'),
  ('Sound Department', 'Manages microphone checklists, sound logs, foley tasks.'),
  ('Art Department', 'Logs prop locations, set design specifications, and moodboards.'),
  ('Makeup Department', 'Manages makeup checklists and calls schedules for actors.'),
  ('Costume Department', 'Tracks outfit measurements, laundry, and costume refs.'),
  ('VFX Team', 'Maintains CGI plate assets and CGI model deadlines.'),
  ('Photographer', 'Uploads marketing photos and coordinates BTS catalogs.'),
  ('Social Media / Marketing', 'Schedules trailers, creates captions, checks release schedules.'),
  ('Client', 'Views approved video packages, review boards, and contract deliverables.')
on conflict (name) do nothing;

insert into public.permissions (name, description) values
  ('manage_finances', 'Review budgets, commit invoices, and authorize expenditures.'),
  ('edit_scripts', 'Write drafts, revise scene scripts, lock screenplay pages.'),
  ('view_storyboards', 'View campaign storyboard reference plates.'),
  ('edit_storyboards', 'Modify storyboard layouts and lens designs.'),
  ('modify_schedule', 'Set shot planner setups and allocate calendars.'),
  ('view_schedule', 'Review daily calls and agendas.'),
  ('upload_files', 'Upload production dailies, audio logs, and contract files.'),
  ('delete_productions', 'Delete entire campaign production workspaces.'),
  ('invite_members', 'Dispatch team invitations and authorize user roles.'),
  ('audit_logs', 'Review system-wide action logs and session histories.'),
  ('create_productions', 'Initialize new movie campaigns and projects.')
on conflict (name) do nothing;

-- Map Owner permissions (All Permissions)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r, public.permissions p
where r.name = 'Owner'
on conflict do nothing;

-- Map Production Manager permissions (Manage schedule, crew, upload files, select finances)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r, public.permissions p
where r.name = 'Production Manager'
and p.name in ('view_storyboards', 'modify_schedule', 'view_schedule', 'upload_files', 'invite_members')
on conflict do nothing;

-- Map Director permissions (Scripts, Storyboards, Schedules)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r, public.permissions p
where r.name = 'Director'
and p.name in ('edit_scripts', 'view_storyboards', 'edit_storyboards', 'modify_schedule', 'view_schedule', 'upload_files')
on conflict do nothing;

-- Map Writer permissions (Scripts, view schedule)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r, public.permissions p
where r.name = 'Writer'
and p.name in ('edit_scripts', 'view_schedule')
on conflict do nothing;

-- Map Client permissions (View storyboards)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r, public.permissions p
where r.name = 'Client'
and p.name in ('view_storyboards')
on conflict do nothing;
