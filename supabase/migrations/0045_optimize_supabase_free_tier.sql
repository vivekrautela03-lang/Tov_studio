-- supabase/migrations/0045_optimize_supabase_free_tier.sql
-- Optimizations for Supabase Free Tier: stories expiration, indexes, and automatic storage cleanup.

-- 0. Create post_comments table if not exists (with RLS policies)
CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.portfolio(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.post_comments;
CREATE POLICY "Allow select for authenticated" ON public.post_comments
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow insert for owner" ON public.post_comments;
CREATE POLICY "Allow insert for owner" ON public.post_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow delete for owner" ON public.post_comments;
CREATE POLICY "Allow delete for owner" ON public.post_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- 1. Add expires_at and thumbnail_url columns to stories table if not exist
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- 2. Populate expires_at for existing stories
UPDATE public.stories SET expires_at = created_at + INTERVAL '24 hours' WHERE expires_at IS NULL;

-- 3. Create trigger function to automatically set expires_at = created_at + 24 hours on insert
CREATE OR REPLACE FUNCTION public.set_story_expires_at()
RETURNS trigger AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := COALESCE(NEW.created_at, now()) + INTERVAL '24 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_story_expires_at ON public.stories;
CREATE TRIGGER trigger_set_story_expires_at
BEFORE INSERT ON public.stories
FOR EACH ROW
EXECUTE FUNCTION public.set_story_expires_at();

-- 4. Create automatic storage and row cleanup function for expired stories
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS void AS $$
DECLARE
  expired_story RECORD;
  extracted_path text;
  bucket_name text;
BEGIN
  FOR expired_story IN 
    SELECT id, media_url, media_type FROM public.stories WHERE expires_at <= now()
  LOOP
    -- Extract bucket name from public URL structure
    IF expired_story.media_url LIKE '%/public/images/%' THEN
      bucket_name := 'images';
    ELSIF expired_story.media_url LIKE '%/public/videos/%' THEN
      bucket_name := 'videos';
    ELSE
      -- Fallback to chat attachments or standard buckets
      IF expired_story.media_url LIKE '%/public/chat_attachments/%' THEN
        bucket_name := 'chat_attachments';
      ELSE
        bucket_name := 'images';
      END IF;
    END IF;

    -- Extract relative file name path
    extracted_path := substring(expired_story.media_url from '/public/' || bucket_name || '/(.*)');

    -- Delete files from storage.objects
    IF extracted_path IS NOT NULL AND extracted_path <> '' THEN
      DELETE FROM storage.objects WHERE bucket_id = bucket_name AND name = extracted_path;
    END IF;

    -- Delete metadata row
    DELETE FROM public.stories WHERE id = expired_story.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add Database Indexes to speed up queries and save CPU/RAM cycles
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories (user_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories (created_at);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories (expires_at);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments (post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments (user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON public.chat_messages (channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages (created_at);

CREATE INDEX IF NOT EXISTS idx_messages_production_id ON public.messages (production_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at);

CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON public.portfolio (user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_created_at ON public.portfolio (created_at);
