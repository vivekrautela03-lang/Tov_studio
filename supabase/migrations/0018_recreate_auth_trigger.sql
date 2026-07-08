-- 0018_recreate_auth_trigger.sql
-- Ensure the auth trigger is correctly registered on auth.users table

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
