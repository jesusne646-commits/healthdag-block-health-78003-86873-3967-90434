-- Fix security warning: Set search_path for the function
-- Drop trigger first, then function, then recreate both
DROP TRIGGER IF EXISTS on_donation_confirmed ON public.donations;
DROP FUNCTION IF EXISTS update_campaign_raised_amount();

CREATE OR REPLACE FUNCTION update_campaign_raised_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'confirmed') OR 
     (TG_OP = 'UPDATE' AND NEW.status = 'confirmed' AND OLD.status != 'confirmed') THEN
    UPDATE public.donation_campaigns
    SET raised_amount = raised_amount + NEW.amount,
        status = CASE 
          WHEN raised_amount + NEW.amount >= target_amount THEN 'completed'
          ELSE status
        END,
        updated_at = now()
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_donation_confirmed
  AFTER INSERT OR UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_raised_amount();