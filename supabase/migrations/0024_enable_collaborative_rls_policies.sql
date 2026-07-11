-- 0024_enable_collaborative_rls_policies.sql
-- Enable collaborative authenticated access on all shared production assets

-- 1. Productions
DROP POLICY IF EXISTS "Allow all actions on productions for owner" ON public.productions;
DROP POLICY IF EXISTS "Allow authenticated actions for productions" ON public.productions;
CREATE POLICY "Allow authenticated actions for productions" ON public.productions
  FOR ALL USING (auth.role() = 'authenticated');

-- 2. Storyboard Shots
DROP POLICY IF EXISTS "Allow all actions on storyboard_shots for owner" ON public.storyboard_shots;
DROP POLICY IF EXISTS "Allow authenticated actions for storyboard_shots" ON public.storyboard_shots;
CREATE POLICY "Allow authenticated actions for storyboard_shots" ON public.storyboard_shots
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. Scenes
DROP POLICY IF EXISTS "Allow all actions on scenes for owner" ON public.scenes;
DROP POLICY IF EXISTS "Allow authenticated actions for scenes" ON public.scenes;
CREATE POLICY "Allow authenticated actions for scenes" ON public.scenes
  FOR ALL USING (auth.role() = 'authenticated');

-- 4. Call Sheets
DROP POLICY IF EXISTS "Allow all actions on call_sheets for owner" ON public.call_sheets;
DROP POLICY IF EXISTS "Allow authenticated actions for call_sheets" ON public.call_sheets;
CREATE POLICY "Allow authenticated actions for call_sheets" ON public.call_sheets
  FOR ALL USING (auth.role() = 'authenticated');

-- 5. Shot Plans
DROP POLICY IF EXISTS "Allow all actions on shot_plans for owner" ON public.shot_plans;
DROP POLICY IF EXISTS "Allow authenticated actions for shot_plans" ON public.shot_plans;
CREATE POLICY "Allow authenticated actions for shot_plans" ON public.shot_plans
  FOR ALL USING (auth.role() = 'authenticated');

-- 6. Calendar Events
DROP POLICY IF EXISTS "Allow all actions on calendar_events for owner" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow authenticated actions for calendar_events" ON public.calendar_events;
CREATE POLICY "Allow authenticated actions for calendar_events" ON public.calendar_events
  FOR ALL USING (auth.role() = 'authenticated');

-- 7. Files
DROP POLICY IF EXISTS "Allow all actions on files for owner" ON public.files;
DROP POLICY IF EXISTS "Allow authenticated actions for files" ON public.files;
CREATE POLICY "Allow authenticated actions for files" ON public.files
  FOR ALL USING (auth.role() = 'authenticated');
