-- 0026_create_contact_messages.sql
-- Create table for storing contact submissions and enable collaborative RLS policies

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Unread' CHECK (status IN ('Unread', 'Read', 'Replied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (Owner/Admin crew members) to read/write/delete contact logs
CREATE POLICY "Allow authenticated actions for contact_messages" ON public.contact_messages
  FOR ALL USING (auth.role() = 'authenticated');
