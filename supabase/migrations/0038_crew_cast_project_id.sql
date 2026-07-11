-- Add project_id column to crew_members and cast_members
ALTER TABLE public.crew_members ADD COLUMN IF NOT EXISTS project_id TEXT;
ALTER TABLE public.cast_members ADD COLUMN IF NOT EXISTS project_id TEXT;
