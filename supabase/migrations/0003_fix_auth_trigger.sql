-- 0003_fix_auth_trigger.sql
-- Fix handle_new_user search path and user insert policies

-- 1. Recreate handle_new_user trigger function with SET search_path = public
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'Crew'::user_role
  );
  return new;
end;
$$;

-- 2. Repair policies on public.profiles to allow users to create and update their own profiles
drop policy if exists "Allow users to insert their own profile" on public.profiles;
drop policy if exists "Allow users to update their own profile" on public.profiles;
drop policy if exists "Allow users to modify their own profile" on public.profiles;

create policy "Allow users to insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);
