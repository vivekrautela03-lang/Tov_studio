-- 0012_update_files_rls_for_everyone.sql
-- Update Row Level Security on files table to allow uploads by any authenticated user

-- 1. Drop existing modify policy
drop policy if exists "Allow modify files for members" on public.files;
drop policy if exists "Allow insert files for authenticated users" on public.files;
drop policy if exists "Allow update/delete files for members" on public.files;

-- 2. Create policy to allow any authenticated user to upload (insert) files
create policy "Allow insert files for authenticated users" on public.files
  for insert with check (auth.role() = 'authenticated');

-- 3. Create policy to allow members to update/delete files
create policy "Allow update/delete files for members" on public.files
  for all using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid()
    )
  );
