-- 0031_upgrade_chat_system.sql
-- Database schema upgrades for professional messaging system

-- 1. Upgrade chat_channels
ALTER TABLE public.chat_channels ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.chat_channels ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.chat_channels ADD COLUMN IF NOT EXISTS pinned_by UUID[] DEFAULT '{}';
ALTER TABLE public.chat_channels ADD COLUMN IF NOT EXISTS archived_by UUID[] DEFAULT '{}';
ALTER TABLE public.chat_channels ADD COLUMN IF NOT EXISTS muted_by UUID[] DEFAULT '{}';

-- 2. Upgrade chat_channel_members
ALTER TABLE public.chat_channel_members ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Member' CHECK (role IN ('Owner', 'Admin', 'Moderator', 'Member'));

-- 3. Upgrade chat_messages
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS forwarded_from_sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS is_announcement BOOLEAN DEFAULT false;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS likes UUID[] DEFAULT '{}';

-- 4. Create message_reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(message_id, user_id, emoji)
);

-- 5. Create blocked_users table
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- the blocker
  blocked_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- the blocked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, blocked_user_id)
);

-- 6. Create reported_users table
CREATE TABLE IF NOT EXISTS public.reported_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Add privacy columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS message_privacy TEXT DEFAULT 'everyone' CHECK (message_privacy IN ('everyone', 'connections', 'none'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS online_privacy TEXT DEFAULT 'everyone' CHECK (online_privacy IN ('everyone', 'none'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pfp_privacy TEXT DEFAULT 'everyone' CHECK (pfp_privacy IN ('everyone', 'none'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS add_to_groups_privacy TEXT DEFAULT 'everyone' CHECK (add_to_groups_privacy IN ('everyone', 'none'));

-- 8. Enable RLS on new tables
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reported_users ENABLE ROW LEVEL SECURITY;

-- 9. Drop previous loose RLS policies
DROP POLICY IF EXISTS "Allow authenticated actions for chat_channels" ON public.chat_channels;
DROP POLICY IF EXISTS "Allow authenticated actions for chat_channel_members" ON public.chat_channel_members;
DROP POLICY IF EXISTS "Allow authenticated actions for chat_messages" ON public.chat_messages;

-- 10. Implement strict RLS policies on chat_channels
CREATE POLICY "Insert channels if creator" ON public.chat_channels 
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Access channels if participant" ON public.chat_channels 
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.chat_channel_members WHERE channel_id = id AND user_id = auth.uid()));

CREATE POLICY "Update channels if participant" ON public.chat_channels 
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.chat_channel_members WHERE channel_id = id AND user_id = auth.uid()));

CREATE POLICY "Delete channels if owner" ON public.chat_channels 
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.chat_channel_members WHERE channel_id = id AND user_id = auth.uid() AND role = 'Owner'));

-- 11. Implement strict RLS policies on chat_channel_members
CREATE POLICY "Access channel members if member" ON public.chat_channel_members 
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.chat_channel_members WHERE channel_id = chat_channel_members.channel_id AND user_id = auth.uid()));

CREATE POLICY "Insert channel members if admin or self" ON public.chat_channel_members 
  FOR INSERT WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.chat_channel_members WHERE channel_id = chat_channel_members.channel_id AND user_id = auth.uid() AND role IN ('Owner', 'Admin')));

CREATE POLICY "Update channel members if admin" ON public.chat_channel_members 
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.chat_channel_members WHERE channel_id = chat_channel_members.channel_id AND user_id = auth.uid() AND role IN ('Owner', 'Admin')));

CREATE POLICY "Delete channel members if admin or self" ON public.chat_channel_members 
  FOR DELETE USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.chat_channel_members WHERE channel_id = chat_channel_members.channel_id AND user_id = auth.uid() AND role IN ('Owner', 'Admin')));

-- 12. Implement strict RLS policies on chat_messages
CREATE POLICY "Access messages if member" ON public.chat_messages 
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.chat_channel_members WHERE channel_id = chat_messages.channel_id AND user_id = auth.uid()));

CREATE POLICY "Insert messages if member" ON public.chat_messages 
  FOR INSERT WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.chat_channel_members WHERE channel_id = chat_messages.channel_id AND user_id = auth.uid()));

CREATE POLICY "Update messages if sender" ON public.chat_messages 
  FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Delete messages if sender or moderator" ON public.chat_messages 
  FOR DELETE USING (sender_id = auth.uid() OR EXISTS (SELECT 1 FROM public.chat_channel_members WHERE channel_id = chat_messages.channel_id AND user_id = auth.uid() AND role IN ('Owner', 'Admin', 'Moderator')));

-- 13. Implement strict RLS policies on message_reactions
CREATE POLICY "Access reactions if channel member" ON public.message_reactions 
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.chat_channel_members AS m JOIN public.chat_messages AS msg ON msg.channel_id = m.channel_id WHERE msg.id = message_id AND m.user_id = auth.uid()));

CREATE POLICY "Insert reactions if channel member" ON public.message_reactions 
  FOR INSERT WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.chat_channel_members AS m JOIN public.chat_messages AS msg ON msg.channel_id = m.channel_id WHERE msg.id = message_id AND m.user_id = auth.uid()));

CREATE POLICY "Delete own reactions" ON public.message_reactions 
  FOR DELETE USING (user_id = auth.uid());

-- 14. Implement strict RLS policies on blocked_users
CREATE POLICY "Access own blocks" ON public.blocked_users 
  FOR SELECT USING (user_id = auth.uid() OR blocked_user_id = auth.uid());

CREATE POLICY "Manage own blocks" ON public.blocked_users 
  FOR ALL USING (user_id = auth.uid());

-- 15. Implement strict RLS policies on reported_users
CREATE POLICY "Access own reports" ON public.reported_users 
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Insert reports" ON public.reported_users 
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- 16. Enable realtime replication for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blocked_users;
