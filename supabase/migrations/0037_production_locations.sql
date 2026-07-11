-- Create production_locations table
CREATE TABLE IF NOT EXISTS public.production_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'Active' NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.production_locations ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Allow select for authenticated users" 
ON public.production_locations 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow insert for authenticated users" 
ON public.production_locations 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" 
ON public.production_locations 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow delete for authenticated users" 
ON public.production_locations 
FOR DELETE 
TO authenticated 
USING (true);

-- Insert Seed Data for projects
INSERT INTO public.production_locations (project_id, name, type, address, notes, photo_url, status) VALUES
('proj-1', 'Neo-Tokyo Alleyways Set', 'Studio Stage 4', 'Tokyo, Koto City, Aomi 2-chome', 'Cyberpunk neon setting, ideal for steadicam sequences.', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80', 'Active'),
('proj-1', 'Shibuya Crossing Cyber Overlay', 'On-Location Permits', 'Tokyo, Shibuya Crossing', 'Stealth drone shooting permits obtained.', 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=800&q=80', 'Permit Approved'),
('proj-2', 'Rainforest Soundstage B', 'Indoor Soundstage', 'London, Pinewood Studios', 'Pre-rigged with artificial water sprays and tropical plants.', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'Booked');
