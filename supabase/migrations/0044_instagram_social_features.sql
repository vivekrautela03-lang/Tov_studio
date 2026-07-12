-- 0044_instagram_social_features.sql
-- Database schema for Instagram-style Notes, Stories, Pinned Messages, and Chat Themes

-- 1. Create public.notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content VARCHAR(60) NOT NULL,
  song_id TEXT,
  song_name TEXT,
  song_artist TEXT,
  song_artwork TEXT,
  song_preview_url TEXT,
  audience TEXT DEFAULT 'everyone' CHECK (audience IN ('everyone', 'followers', 'close_friends', 'team')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create public.stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video')) NOT NULL,
  song_id TEXT,
  song_name TEXT,
  song_artist TEXT,
  song_artwork TEXT,
  song_preview_url TEXT,
  caption TEXT,
  audience TEXT DEFAULT 'everyone' CHECK (audience IN ('everyone', 'close_friends')),
  views JSONB DEFAULT '[]' NOT NULL, -- JSON list of profiles who viewed
  likes UUID[] DEFAULT '{}' NOT NULL, -- list of profile IDs who liked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Upgrade chat_channels and chat_messages
ALTER TABLE public.chat_channels ADD COLUMN IF NOT EXISTS theme_name TEXT DEFAULT 'dark';
ALTER TABLE public.chat_channels ADD COLUMN IF NOT EXISTS wallpaper_url TEXT;

ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS pinned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. Enable RLS on new tables
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- 5. Policies for notes
DROP POLICY IF EXISTS "Access notes if logged in" ON public.notes;
CREATE POLICY "Access notes if logged in" ON public.notes
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Insert own notes" ON public.notes;
CREATE POLICY "Insert own notes" ON public.notes
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Delete own notes" ON public.notes;
CREATE POLICY "Delete own notes" ON public.notes
  FOR DELETE USING (user_id = auth.uid());

-- 6. Policies for stories
DROP POLICY IF EXISTS "Access stories if logged in" ON public.stories;
CREATE POLICY "Access stories if logged in" ON public.stories
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Insert own stories" ON public.stories;
CREATE POLICY "Insert own stories" ON public.stories
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Update own stories" ON public.stories;
CREATE POLICY "Update own stories" ON public.stories
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Delete own stories" ON public.stories;
CREATE POLICY "Delete own stories" ON public.stories
  FOR DELETE USING (user_id = auth.uid());

-- 7. Add new tables to Realtime replication publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
