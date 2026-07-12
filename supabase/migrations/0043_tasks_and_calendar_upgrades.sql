-- Upgrade public.tasks table to support project scope and checklist
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS production_id UUID REFERENCES public.productions(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assigned_members UUID[] DEFAULT '{}'::UUID[];

-- Create subtasks table
CREATE TABLE IF NOT EXISTS public.subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated actions for subtasks" ON public.subtasks FOR ALL USING (auth.role() = 'authenticated');

-- Upgrade public.calendar_events to support Google Calendar fields
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS end_time TEXT;
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#22d3ee';
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT DEFAULT 'none'; -- 'daily' | 'weekly' | 'monthly' | 'none'
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS reminders JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS assigned_members UUID[] DEFAULT '{}'::UUID[];
