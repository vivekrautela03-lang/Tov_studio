-- Create bts_highlights table
CREATE TABLE IF NOT EXISTS public.bts_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    photo_url TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.bts_highlights ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Allow select for everyone" 
ON public.bts_highlights 
FOR SELECT 
USING (true);

CREATE POLICY "Allow insert for authenticated users" 
ON public.bts_highlights 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow delete for authenticated owner" 
ON public.bts_highlights 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
