-- supabase/migrations/0046_setup_storage_buckets.sql
-- Create storage buckets for profile pictures (avatars), posts (portfolio), stories, and chat attachments, and establish RLS access rules.

-- 1. Create buckets if they do not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/*']),
  ('portfolio', 'portfolio', true, 52428800, ARRAY['image/*', 'video/*']),
  ('stories', 'stories', true, 10485760, ARRAY['image/*', 'video/*']),
  ('chat_attachments', 'chat_attachments', true, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- 2. Configure SELECT (read) policies: Anyone can read files from public buckets
DROP POLICY IF EXISTS "Public access to avatars" ON storage.objects;
CREATE POLICY "Public access to avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Public access to portfolio" ON storage.objects;
CREATE POLICY "Public access to portfolio" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Public access to stories" ON storage.objects;
CREATE POLICY "Public access to stories" ON storage.objects
  FOR SELECT USING (bucket_id = 'stories');

DROP POLICY IF EXISTS "Public access to chat_attachments" ON storage.objects;
CREATE POLICY "Public access to chat_attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat_attachments');

-- 3. Configure INSERT (upload) policies: Authenticated users can only upload files to subfolders named after their user ID
DROP POLICY IF EXISTS "Allow authenticated uploads to own folder" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('avatars', 'portfolio', 'stories', 'chat_attachments')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Configure DELETE (remove) policies: Authenticated users can only delete their own files
DROP POLICY IF EXISTS "Allow authenticated deletes of own folder" ON storage.objects;
CREATE POLICY "Allow authenticated deletes of own folder" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('avatars', 'portfolio', 'stories', 'chat_attachments')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Configure UPDATE (edit) policies: Authenticated users can only replace their own files
DROP POLICY IF EXISTS "Allow authenticated updates of own folder" ON storage.objects;
CREATE POLICY "Allow authenticated updates of own folder" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('avatars', 'portfolio', 'stories', 'chat_attachments')
  )
  WITH CHECK (
    bucket_id IN ('avatars', 'portfolio', 'stories', 'chat_attachments')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
