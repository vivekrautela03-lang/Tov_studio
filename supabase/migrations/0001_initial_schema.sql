-- 0001_initial_schema.sql
-- Complete production database schema for TOV Studio

-- Enable uuid-ossp extension
create extension if not exists "uuid-ossp";

-- --- CREATE CUSTOM ENUMS ---
create type user_role as enum ('Producer', 'Director', 'Director of Photography', 'Gaffer', 'Key Grip', 'DIT', 'Actor', 'Crew');
create type project_status as enum ('Pre-Production', 'Production', 'Post-Production', 'Completed');
create type equipment_status as enum ('Available', 'In Use', 'Maintenance', 'Reserved');
create type task_status as enum ('Todo', 'In Progress', 'Completed', 'Delayed');
create type contract_status as enum ('Signed', 'In Negotiation', 'Pending Review');
create type audition_status as enum ('Passed', 'Scheduled', 'Callback');

-- --- AUTOMATIC TIMESTAMPS HANDLER TRIGGER FUNCTION ---
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- --- 1. USERS PROFILE TABLE ---
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role user_role default 'Crew'::user_role,
  avatar_url text,
  phone text,
  department text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- RLS Policies for Users
create policy "Allow public profiles read access" on public.users 
  for select using (true);
create policy "Allow users to modify their own profile" on public.users 
  for update using (auth.uid() = id);

-- Trigger for auto-syncing auth.users to public.users upon signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'Crew'::user_role
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger for updated_at
create trigger update_users_updated_at before update on public.users
  for each row execute procedure update_updated_at_column();


-- --- 2. PRODUCTIONS TABLE ---
create table public.productions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  start_date date,
  end_date date,
  status text default 'Pre-Production',
  budget numeric(12, 2) default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.productions enable row level security;

create policy "Allow authenticated actions for productions" on public.productions 
  for all using (auth.role() = 'authenticated');

create trigger update_productions_updated_at before update on public.productions
  for each row execute procedure update_updated_at_column();


-- --- 3. PROJECTS TABLE ---
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  production_id uuid references public.productions(id) on delete cascade,
  title text not null,
  description text,
  progress integer default 0 check (progress >= 0 and progress <= 100),
  deadline date,
  status project_status default 'Pre-Production'::project_status,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.projects enable row level security;

create policy "Allow authenticated actions for projects" on public.projects 
  for all using (auth.role() = 'authenticated');

create index idx_projects_production on public.projects(production_id);

create trigger update_projects_updated_at before update on public.projects
  for each row execute procedure update_updated_at_column();


-- --- 4. CREW DIRECTORY TABLE ---
create table public.crew (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  production_id uuid references public.productions(id) on delete cascade,
  position text,
  availability text default 'Available',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.crew enable row level security;

create policy "Allow authenticated actions for crew" on public.crew 
  for all using (auth.role() = 'authenticated');

create index idx_crew_user on public.crew(user_id);
create index idx_crew_production on public.crew(production_id);

create trigger update_crew_updated_at before update on public.crew
  for each row execute procedure update_updated_at_column();


-- --- 5. CAST DIRECTORY TABLE ---
create table public.cast_members (
  id uuid primary key default uuid_generate_v4(),
  production_id uuid references public.productions(id) on delete cascade,
  name text not null,
  character_name text not null,
  payment text,
  contract_status contract_status default 'Pending Review'::contract_status,
  audition_status audition_status default 'Scheduled'::audition_status,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.cast_members enable row level security;

create policy "Allow authenticated actions for cast_members" on public.cast_members 
  for all using (auth.role() = 'authenticated');

create index idx_cast_production on public.cast_members(production_id);

create trigger update_cast_updated_at before update on public.cast_members
  for each row execute procedure update_updated_at_column();


-- --- 6. SCRIPTS WORKSPACE TABLE ---
create table public.scripts (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  version integer default 1,
  screenplay_content text,
  ai_analysis_complexity text,
  ai_analysis_duration text,
  ai_analysis_warnings text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.scripts enable row level security;

create policy "Allow authenticated actions for scripts" on public.scripts 
  for all using (auth.role() = 'authenticated');

create index idx_scripts_project on public.scripts(project_id);

create trigger update_scripts_updated_at before update on public.scripts
  for each row execute procedure update_updated_at_column();


-- --- 7. STORYBOARD SHOTS TABLE ---
create table public.storyboard_shots (
  id uuid primary key default uuid_generate_v4(),
  script_id uuid references public.scripts(id) on delete cascade,
  shot_number text not null,
  camera text,
  lens text,
  lighting text,
  location text,
  notes text,
  status text default 'Draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.storyboard_shots enable row level security;

create policy "Allow authenticated actions for storyboard_shots" on public.storyboard_shots 
  for all using (auth.role() = 'authenticated');

create index idx_shots_script on public.storyboard_shots(script_id);

create trigger update_storyboard_shots_updated_at before update on public.storyboard_shots
  for each row execute procedure update_updated_at_column();


-- --- 8. EQUIPMENT INVENTORY TABLE ---
create table public.equipment (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  serial_number text unique,
  qr_code text unique,
  status equipment_status default 'Available'::equipment_status,
  maintenance_date date,
  battery_level integer check (battery_level >= 0 and battery_level <= 100),
  assigned_user_id uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.equipment enable row level security;

create policy "Allow authenticated actions for equipment" on public.equipment 
  for all using (auth.role() = 'authenticated');

create index idx_equip_assigned on public.equipment(assigned_user_id);

create trigger update_equipment_updated_at before update on public.equipment
  for each row execute procedure update_updated_at_column();


-- --- 9. LOCATIONS TABLE ---
create table public.locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  coordinates text,
  permits text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.locations enable row level security;

create policy "Allow authenticated actions for locations" on public.locations 
  for all using (auth.role() = 'authenticated');

create trigger update_locations_updated_at before update on public.locations
  for each row execute procedure update_updated_at_column();


-- --- 10. SCHEDULES TIMELINE TABLE ---
create table public.schedules (
  id uuid primary key default uuid_generate_v4(),
  production_id uuid references public.productions(id) on delete cascade,
  scene_id text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.schedules enable row level security;

create policy "Allow authenticated actions for schedules" on public.schedules 
  for all using (auth.role() = 'authenticated');

create index idx_schedules_production on public.schedules(production_id);

create trigger update_schedules_updated_at before update on public.schedules
  for each row execute procedure update_updated_at_column();


-- --- 11. TASKS CHECKLIST TABLE ---
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  assignee_id uuid references public.users(id) on delete set null,
  due_date date,
  priority text default 'Medium',
  status task_status default 'Todo'::task_status,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tasks enable row level security;

create policy "Allow authenticated actions for tasks" on public.tasks 
  for all using (auth.role() = 'authenticated');

create index idx_tasks_assignee on public.tasks(assignee_id);

create trigger update_tasks_updated_at before update on public.tasks
  for each row execute procedure update_updated_at_column();


-- --- 12. BUDGETS ALLOCATION TABLE ---
create table public.budgets (
  id uuid primary key default uuid_generate_v4(),
  production_id uuid references public.productions(id) on delete cascade,
  category text not null,
  amount numeric(12, 2) default 0.00 not null,
  spent numeric(12, 2) default 0.00 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.budgets enable row level security;

create policy "Allow authenticated actions for budgets" on public.budgets 
  for all using (auth.role() = 'authenticated');

create index idx_budgets_production on public.budgets(production_id);

create trigger update_budgets_updated_at before update on public.budgets
  for each row execute procedure update_updated_at_column();


-- --- 13. FILES STORAGE TABLE ---
create table public.files (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  storage_path text not null,
  uploaded_by uuid references public.users(id) on delete set null,
  file_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.files enable row level security;

create policy "Allow authenticated actions for files" on public.files 
  for all using (auth.role() = 'authenticated');

create index idx_files_project on public.files(project_id);
create index idx_files_uploader on public.files(uploaded_by);

create trigger update_files_updated_at before update on public.files
  for each row execute procedure update_updated_at_column();


-- --- 14. NOTIFICATIONS INBOX TABLE ---
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  recipient_id uuid references public.users(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

create policy "Allow users to manage their own notifications" on public.notifications 
  for all using (auth.uid() = recipient_id);

create index idx_notifications_recipient on public.notifications(recipient_id);

create trigger update_notifications_updated_at before update on public.notifications
  for each row execute procedure update_updated_at_column();


-- --- 15. AI CONVERSATIONS LOG TABLE ---
create table public.ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  prompt text not null,
  response text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ai_conversations enable row level security;

create policy "Allow users to view their own AI chat logs" on public.ai_conversations 
  for all using (auth.uid() = user_id);

create index idx_ai_chat_user on public.ai_conversations(user_id);
