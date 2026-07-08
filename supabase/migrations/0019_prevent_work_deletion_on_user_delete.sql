-- 0019_prevent_work_deletion_on_user_delete.sql
-- Alter foreign keys to ON DELETE SET NULL to preserve uploaded productions/files when profiles are deleted

-- 1. productions
alter table public.productions drop constraint if exists productions_user_id_fkey;
alter table public.productions add constraint productions_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;

-- 2. scripts
alter table public.scripts drop constraint if exists scripts_user_id_fkey;
alter table public.scripts add constraint scripts_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;

-- 3. files
alter table public.files drop constraint if exists files_user_id_fkey;
alter table public.files add constraint files_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;

-- 4. calendar_events
alter table public.calendar_events drop constraint if exists calendar_events_user_id_fkey;
alter table public.calendar_events add constraint calendar_events_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;

-- 5. shot_plans
alter table public.shot_plans drop constraint if exists shot_plans_user_id_fkey;
alter table public.shot_plans add constraint shot_plans_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;

-- 6. storyboard_shots
alter table public.storyboard_shots drop constraint if exists storyboard_shots_user_id_fkey;
alter table public.storyboard_shots add constraint storyboard_shots_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;

-- 7. tasks
alter table public.tasks drop constraint if exists tasks_user_id_fkey;
alter table public.tasks add constraint tasks_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;

-- 8. crew
alter table public.crew drop constraint if exists crew_user_id_fkey;
alter table public.crew add constraint crew_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;

-- 9. cast_members
alter table public.cast_members drop constraint if exists cast_members_user_id_fkey;
alter table public.cast_members add constraint cast_members_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;

-- 10. equipment
alter table public.equipment drop constraint if exists equipment_user_id_fkey;
alter table public.equipment add constraint equipment_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;

-- 11. call_sheets
alter table public.call_sheets drop constraint if exists call_sheets_user_id_fkey;
alter table public.call_sheets add constraint call_sheets_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;

-- 12. notifications
alter table public.notifications drop constraint if exists notifications_recipient_id_fkey;
alter table public.notifications add constraint notifications_recipient_id_fkey foreign key (recipient_id) references auth.users(id) on delete set null;

-- 13. scenes
alter table public.scenes drop constraint if exists scenes_user_id_fkey;
alter table public.scenes add constraint scenes_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;
