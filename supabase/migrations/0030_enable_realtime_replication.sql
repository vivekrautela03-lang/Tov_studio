-- 0030_enable_realtime_replication.sql
-- Enable Supabase Realtime replication on chat system tables

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Add public.chat_messages
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    
    -- Add public.chat_channels
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_channels;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;

    -- Add public.chat_channel_members
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_channel_members;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;
