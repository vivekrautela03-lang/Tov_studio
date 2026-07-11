-- Add facebook column to social_links
ALTER TABLE public.social_links ADD COLUMN IF NOT EXISTS facebook TEXT;
