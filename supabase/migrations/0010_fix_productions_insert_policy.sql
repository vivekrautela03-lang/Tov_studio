-- 0010_fix_productions_insert_policy.sql
-- Fix chicken-and-egg RLS policy on productions to allow project creation by authenticated users

-- 1. Drop the legacy modify policy and any existing custom insert/update/delete policies to ensure idempotency
drop policy if exists "Allow modify productions for owners/producers" on public.productions;
drop policy if exists "Allow insert productions for authenticated users" on public.productions;
drop policy if exists "Allow update productions for owners/producers" on public.productions;
drop policy if exists "Allow delete productions for owners/producers" on public.productions;

-- 2. Create distinct policy for INSERT (creation)
create policy "Allow insert productions for authenticated users" on public.productions
  for insert with check (auth.role() = 'authenticated');

-- 3. Create distinct policy for UPDATE (modification)
create policy "Allow update productions for owners/producers" on public.productions
  for update using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = id and pm.user_id = auth.uid() and pm.role in ('Owner', 'Producer')
    )
  );

-- 4. Create distinct policy for DELETE (removal)
create policy "Allow delete productions for owners/producers" on public.productions
  for delete using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = id and pm.user_id = auth.uid() and pm.role in ('Owner', 'Producer')
    )
  );
