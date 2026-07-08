-- 0020_drop_obsolete_workspace_seeding_trigger.sql
-- Drop the obsolete workspace seeding trigger that causes foreign key constraint violations on user registration

drop trigger if exists on_profile_created_seed_members on public.profiles;
drop function if exists public.handle_new_user_production_seeding();
