-- Fix search_path for the trigger function
CREATE OR REPLACE FUNCTION update_access_request_responded_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.status != OLD.status AND NEW.status IN ('approved', 'denied')) THEN
    NEW.responded_at = now();
  END IF;
  RETURN NEW;
END;
$$;