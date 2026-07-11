-- Add extra fields to productions table to allow complete custom updates
ALTER TABLE public.productions ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE public.productions ADD COLUMN IF NOT EXISTS director TEXT;
ALTER TABLE public.productions ADD COLUMN IF NOT EXISTS location TEXT;
