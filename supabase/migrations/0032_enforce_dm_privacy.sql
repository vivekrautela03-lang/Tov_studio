-- 0032_enforce_dm_privacy.sql
-- Database-level check to restrict direct message members to exactly 2 users

CREATE OR REPLACE FUNCTION public.check_dm_member_limit()
RETURNS TRIGGER AS $$
DECLARE
  channel_is_group BOOLEAN;
  current_member_count INT;
BEGIN
  -- Get whether the target channel is a group
  SELECT is_group INTO channel_is_group FROM public.chat_channels WHERE id = NEW.channel_id;

  -- If it's a direct message (is_group = false)
  IF channel_is_group = false THEN
    -- Check how many members already exist in this channel
    SELECT COUNT(*) INTO current_member_count FROM public.chat_channel_members WHERE channel_id = NEW.channel_id;
    
    -- If there are already 2 members, block adding a third person!
    IF current_member_count >= 2 THEN
      RAISE EXCEPTION 'A direct message conversation cannot have more than 2 members.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_dm_member_limit ON public.chat_channel_members;

CREATE TRIGGER enforce_dm_member_limit
BEFORE INSERT ON public.chat_channel_members
FOR EACH ROW
EXECUTE FUNCTION public.check_dm_member_limit();
