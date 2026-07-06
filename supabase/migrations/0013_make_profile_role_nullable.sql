-- 0013_make_profile_role_nullable.sql
-- Remove database default for profiles.role and update handle_new_user trigger to save NULL if role metadata is absent

-- 1. Drop default from profiles.role column
alter table public.profiles alter column role drop default;

-- 2. Update trigger function to register NULL if no role is supplied
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
    (new.raw_user_meta_data->>'role')::user_role,
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$;
