-- Create production_timeline_updates table
CREATE TABLE IF NOT EXISTS public.production_timeline_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    time_label TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    meta JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.production_timeline_updates ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Allow select for authenticated users" 
ON public.production_timeline_updates 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow insert for authenticated users" 
ON public.production_timeline_updates 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Insert Seed Data
INSERT INTO public.production_timeline_updates (title, time_label, description, type, meta) VALUES
('Today''s Shoot & Call Time', '07:30 AM', 'Scene 4 - Neon Alley (Steadicam sequence). Weather forecast indicates clear sky conditions. Golden hour estimated at 05:45 PM.', 'shoot', '{"callTime": "07:30 AM", "location": "Stage A, Alleyway set"}'),
('Producer Announcement', '10:00 AM', 'A24 international sales agent agreement finalized. International theatrical distribution confirmed.', 'announcement', '{}'),
('Director Notes', 'Yesterday', 'Steadicam sequence needs a slow panning transition to highlight the reflection of neon signage.', 'notes', '{}'),
('Storyboard & Script Updated', '2 days ago', 'Storyboard boards revised and updated for sequence 5 in high resolution.', 'update', '{}'),
('Equipment Reminder & Weather Update', '3 days ago', 'Arri Alexa camera sensor calibration due today. Weather updates show slight wind limits.', 'reminder', '{}');
