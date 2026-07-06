-- 0009_add_call_sheet_write_policies.sql
-- Create database write-back permissions for production team to manage call sheets

drop policy if exists "Allow insert call_sheets for owners/producers" on public.call_sheets;
create policy "Allow insert call_sheets for owners/producers" on public.call_sheets
  for insert with check (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid() and pm.role in ('Owner', 'Producer', 'Director')
    )
  );

drop policy if exists "Allow update call_sheets for owners/producers" on public.call_sheets;
create policy "Allow update call_sheets for owners/producers" on public.call_sheets
  for update using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid() and pm.role in ('Owner', 'Producer', 'Director')
    )
  );

drop policy if exists "Allow delete call_sheets for owners/producers" on public.call_sheets;
create policy "Allow delete call_sheets for owners/producers" on public.call_sheets
  for delete using (
    exists (
      select 1 from public.production_members pm
      where pm.production_id = production_id and pm.user_id = auth.uid() and pm.role in ('Owner', 'Producer', 'Director')
    )
  );
