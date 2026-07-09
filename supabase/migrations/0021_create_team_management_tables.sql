DROP TABLE IF EXISTS public.team_images CASCADE;
DROP TABLE IF EXISTS public.cast_members CASCADE;
DROP TABLE IF EXISTS public.crew_members CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;

-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create cast members table
CREATE TABLE IF NOT EXISTS public.cast_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  phone TEXT,
  email TEXT,
  college TEXT,
  status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Busy', 'Shooting')),
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  age INTEGER,
  experience TEXT,
  instagram TEXT,
  portfolio TEXT,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create crew members table
CREATE TABLE IF NOT EXISTS public.crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  position TEXT, -- e.g. "Director", "Founder"
  phone TEXT,
  email TEXT,
  college TEXT,
  availability TEXT DEFAULT 'Available' CHECK (availability IN ('Available', 'Busy', 'Shooting')),
  experience TEXT,
  skills TEXT[] DEFAULT '{}',
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create team images table
CREATE TABLE IF NOT EXISTS public.team_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  member_type TEXT NOT NULL CHECK (member_type IN ('Cast', 'Crew')),
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_images ENABLE ROW LEVEL SECURITY;

-- Select policies
CREATE POLICY "Allow select for everyone on departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Allow select for everyone on roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Allow select for everyone on cast_members" ON public.cast_members FOR SELECT USING (true);
CREATE POLICY "Allow select for everyone on crew_members" ON public.crew_members FOR SELECT USING (true);
CREATE POLICY "Allow select for everyone on team_images" ON public.team_images FOR SELECT USING (true);

-- Admin modification policies
CREATE POLICY "Allow all for authenticated on departments" ON public.departments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated on roles" ON public.roles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated on cast_members" ON public.cast_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated on crew_members" ON public.crew_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated on team_images" ON public.team_images FOR ALL USING (auth.role() = 'authenticated');
