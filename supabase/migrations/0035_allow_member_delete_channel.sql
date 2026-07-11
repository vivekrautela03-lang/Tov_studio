-- 0035_allow_member_delete_channel.sql
-- Allow any participant of a channel to delete the chat channel (and cascade delete messages)

DROP POLICY IF EXISTS "Delete channels if owner" ON public.chat_channels;

CREATE POLICY "Delete channels if owner" ON public.chat_channels 
  FOR DELETE USING (created_by = auth.uid() OR public.is_channel_member(id, auth.uid()));
