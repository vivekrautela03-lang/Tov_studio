-- 0028_extend_chat_messages_attachments.sql
-- Add support for media attachments and message likes to the team chat system

ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS likes TEXT[] DEFAULT '{}'::TEXT[];
