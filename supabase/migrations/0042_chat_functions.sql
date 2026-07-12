-- Database function to mark messages as delivered atomically
CREATE OR REPLACE FUNCTION public.mark_messages_delivered(p_channel_id UUID, p_user_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.chat_messages
    SET delivered_to = array_append(delivered_to, p_user_id)
    WHERE channel_id = p_channel_id 
      AND NOT (delivered_to @> ARRAY[p_user_id])
      AND sender_id::TEXT != p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Database function to mark messages as read atomically
CREATE OR REPLACE FUNCTION public.mark_messages_read(p_channel_id UUID, p_user_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.chat_messages
    SET read_by = array_append(read_by, p_user_id)
    WHERE channel_id = p_channel_id 
      AND NOT (read_by @> ARRAY[p_user_id])
      AND sender_id::TEXT != p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
