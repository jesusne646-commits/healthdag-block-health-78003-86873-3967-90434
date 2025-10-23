-- Create bdag_purchases table for tracking token purchases
CREATE TABLE public.bdag_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'bank_transfer', 'mobile_money', 'p2p', 'faucet')),
  fiat_amount NUMERIC,
  fiat_currency TEXT DEFAULT 'USD',
  bdag_amount NUMERIC NOT NULL,
  exchange_rate NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_provider TEXT,
  transaction_reference TEXT,
  wallet_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bdag_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view own purchases
CREATE POLICY "Users can view own purchases"
ON public.bdag_purchases
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create own purchases
CREATE POLICY "Users can create own purchases"
ON public.bdag_purchases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to log BDAG purchases
CREATE OR REPLACE FUNCTION public.log_bdag_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'completed') THEN
    INSERT INTO public.activity_logs (user_id, activity_type, title, description, metadata)
    VALUES (
      NEW.user_id,
      'purchase',
      'BDAG Purchase',
      'Purchased ' || NEW.bdag_amount || ' BDAG via ' || NEW.payment_method,
      jsonb_build_object('purchase_id', NEW.id, 'amount', NEW.bdag_amount, 'payment_method', NEW.payment_method)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for logging purchases
CREATE TRIGGER log_bdag_purchase_trigger
AFTER INSERT OR UPDATE ON public.bdag_purchases
FOR EACH ROW
EXECUTE FUNCTION public.log_bdag_purchase();

-- Create faucet_claims table to track daily limits
CREATE TABLE public.faucet_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  wallet_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faucet_claims ENABLE ROW LEVEL SECURITY;

-- Users can view own claims
CREATE POLICY "Users can view own claims"
ON public.faucet_claims
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create own claims
CREATE POLICY "Users can create own claims"
ON public.faucet_claims
FOR INSERT
WITH CHECK (auth.uid() = user_id);