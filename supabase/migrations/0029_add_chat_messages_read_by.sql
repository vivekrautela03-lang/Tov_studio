-- 0029_add_chat_messages_read_by.sql
-- Add read_by array column to chat_messages to support WhatsApp/Instagram style read ticks

ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS read_by TEXT[] DEFAULT '{}'::TEXT[];
