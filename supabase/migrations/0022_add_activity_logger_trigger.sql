-- Create trigger function to automatically log public modifications
CREATE OR REPLACE FUNCTION public.log_activity_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  user_name TEXT;
  action_type TEXT;
  item_name TEXT;
  detail_desc TEXT;
BEGIN
  -- Get active user making changes
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Get full name or email of user from profiles
  SELECT COALESCE(full_name, username, email, 'Crew Member')
  INTO user_name
  FROM public.profiles
  WHERE id = current_user_id;

  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
    -- Get name/title of item
    IF TG_TABLE_NAME = 'productions' THEN
      item_name := NEW.title;
    ELSIF TG_TABLE_NAME = 'scripts' THEN
      item_name := NEW.title;
    ELSIF TG_TABLE_NAME = 'cast_members' THEN
      item_name := NEW.full_name;
    ELSIF TG_TABLE_NAME = 'crew_members' THEN
      item_name := NEW.full_name;
    ELSIF TG_TABLE_NAME = 'files' THEN
      item_name := NEW.name;
    ELSE
      item_name := 'new item';
    END IF;
    detail_desc := user_name || ' ' || action_type || ' ' || TG_TABLE_NAME || ' "' || item_name || '"';

  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'updated';
    IF TG_TABLE_NAME = 'productions' THEN
      item_name := NEW.title;
    ELSIF TG_TABLE_NAME = 'scripts' THEN
      item_name := NEW.title;
    ELSIF TG_TABLE_NAME = 'cast_members' THEN
      item_name := NEW.full_name;
    ELSIF TG_TABLE_NAME = 'crew_members' THEN
      item_name := NEW.full_name;
    ELSIF TG_TABLE_NAME = 'files' THEN
      item_name := NEW.name;
    ELSE
      item_name := 'item';
    END IF;
    detail_desc := user_name || ' ' || action_type || ' ' || TG_TABLE_NAME || ' "' || item_name || '"';

  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'deleted';
    IF TG_TABLE_NAME = 'productions' THEN
      item_name := OLD.title;
    ELSIF TG_TABLE_NAME = 'scripts' THEN
      item_name := OLD.title;
    ELSIF TG_TABLE_NAME = 'cast_members' THEN
      item_name := OLD.full_name;
    ELSIF TG_TABLE_NAME = 'crew_members' THEN
      item_name := OLD.full_name;
    ELSIF TG_TABLE_NAME = 'files' THEN
      item_name := OLD.name;
    ELSE
      item_name := 'item';
    END IF;
    detail_desc := user_name || ' ' || action_type || ' ' || TG_TABLE_NAME || ' "' || item_name || '"';
  END IF;

  -- Insert activity log
  INSERT INTO public.activities (user_id, title, description)
  VALUES (current_user_id, INITCAP(TG_TABLE_NAME) || ' ' || INITCAP(action_type), detail_desc);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop triggers if exist
DROP TRIGGER IF EXISTS tr_log_productions_changes ON public.productions;
DROP TRIGGER IF EXISTS tr_log_scripts_changes ON public.scripts;
DROP TRIGGER IF EXISTS tr_log_cast_changes ON public.cast_members;
DROP TRIGGER IF EXISTS tr_log_crew_changes ON public.crew_members;
DROP TRIGGER IF EXISTS tr_log_files_changes ON public.files;

-- Attach triggers
CREATE TRIGGER tr_log_productions_changes AFTER INSERT OR UPDATE OR DELETE ON public.productions FOR EACH ROW EXECUTE FUNCTION public.log_activity_changes();
CREATE TRIGGER tr_log_scripts_changes AFTER INSERT OR UPDATE OR DELETE ON public.scripts FOR EACH ROW EXECUTE FUNCTION public.log_activity_changes();
CREATE TRIGGER tr_log_cast_changes AFTER INSERT OR UPDATE OR DELETE ON public.cast_members FOR EACH ROW EXECUTE FUNCTION public.log_activity_changes();
CREATE TRIGGER tr_log_crew_changes AFTER INSERT OR UPDATE OR DELETE ON public.crew_members FOR EACH ROW EXECUTE FUNCTION public.log_activity_changes();
CREATE TRIGGER tr_log_files_changes AFTER INSERT OR UPDATE OR DELETE ON public.files FOR EACH ROW EXECUTE FUNCTION public.log_activity_changes();
