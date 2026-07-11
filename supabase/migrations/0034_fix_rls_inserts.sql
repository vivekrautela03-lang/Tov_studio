-- 0034_fix_rls_inserts.sql
-- Fix RLS policy violations during channel creation and member inserts

-- 1. Create helper to check if a user is the creator of a channel
CREATE OR REPLACE FUNCTION public.is_channel_creator(p_channel_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.chat_channels 
    WHERE id = p_channel_id AND created_by = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Drop previous policies to avoid conflicts
DROP POLICY IF EXISTS "Insert channels if creator" ON public.chat_channels;
DROP POLICY IF EXISTS "Access channels if participant" ON public.chat_channels;
DROP POLICY IF EXISTS "Update channels if participant" ON public.chat_channels;
DROP POLICY IF EXISTS "Delete channels if owner" ON public.chat_channels;

DROP POLICY IF EXISTS "Access channel members if member" ON public.chat_channel_members;
DROP POLICY IF EXISTS "Insert channel members if admin or self" ON public.chat_channel_members;
DROP POLICY IF EXISTS "Update channel members if admin" ON public.chat_channel_members;
DROP POLICY IF EXISTS "Delete channel members if admin or self" ON public.chat_channel_members;

DROP POLICY IF EXISTS "Access messages if member" ON public.chat_messages;
DROP POLICY IF EXISTS "Insert messages if member" ON public.chat_messages;
DROP POLICY IF EXISTS "Update messages if sender" ON public.chat_messages;
DROP POLICY IF EXISTS "Delete messages if sender or moderator" ON public.chat_messages;

-- 3. Re-implement chat_channels policies (adding creator bypass to SELECT)
CREATE POLICY "Insert channels if creator" ON public.chat_channels 
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Access channels if participant" ON public.chat_channels 
  FOR SELECT USING (created_by = auth.uid() OR public.is_channel_member(id, auth.uid()));

CREATE POLICY "Update channels if participant" ON public.chat_channels 
  FOR UPDATE USING (created_by = auth.uid() OR public.is_channel_member(id, auth.uid()));

CREATE POLICY "Delete channels if owner" ON public.chat_channels 
  FOR DELETE USING (created_by = auth.uid());

-- 4. Re-implement chat_channel_members policies (adding creator bypass to SELECT & INSERT)
CREATE POLICY "Access channel members if member" ON public.chat_channel_members 
  FOR SELECT USING (public.is_channel_creator(channel_id, auth.uid()) OR public.is_channel_member(channel_id, auth.uid()));

CREATE POLICY "Insert channel members if admin or self" ON public.chat_channel_members 
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_channel_creator(channel_id, auth.uid()) OR public.is_channel_member(channel_id, auth.uid()));

CREATE POLICY "Update channel members if admin" ON public.chat_channel_members 
  FOR UPDATE USING (public.is_channel_creator(channel_id, auth.uid()) OR public.is_channel_member(channel_id, auth.uid()));

CREATE POLICY "Delete channel members if admin or self" ON public.chat_channel_members 
  FOR DELETE USING (user_id = auth.uid() OR public.is_channel_creator(channel_id, auth.uid()) OR public.is_channel_member(channel_id, auth.uid()));

-- 5. Re-implement chat_messages policies (adding creator bypass)
CREATE POLICY "Access messages if member" ON public.chat_messages 
  FOR SELECT USING (public.is_channel_creator(channel_id, auth.uid()) OR public.is_channel_member(channel_id, auth.uid()));

CREATE POLICY "Insert messages if member" ON public.chat_messages 
  FOR INSERT WITH CHECK (sender_id = auth.uid() AND (public.is_channel_creator(channel_id, auth.uid()) OR public.is_channel_member(channel_id, auth.uid())));

CREATE POLICY "Update messages if sender" ON public.chat_messages 
  FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Delete messages if sender or moderator" ON public.chat_messages 
  FOR DELETE USING (sender_id = auth.uid() OR public.is_channel_creator(channel_id, auth.uid()) OR public.is_channel_member(channel_id, auth.uid()));
