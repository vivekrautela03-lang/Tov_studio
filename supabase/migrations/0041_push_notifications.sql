-- Create user_push_tokens table
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    platform TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Allow select for self" ON public.user_push_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow insert for self" ON public.user_push_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow delete for self" ON public.user_push_tokens FOR DELETE USING (auth.uid() = user_id);

-- Alter chat_messages to support delivery ticks
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS delivered_to TEXT[] DEFAULT '{}'::TEXT[];

-- Add E2EE encryption key storage and privacy settings to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_key TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"lastSeen":"Everyone", "onlineStatus":"Everyone", "typingIndicator":"Everyone", "readReceipts":"Everyone"}'::JSONB;
