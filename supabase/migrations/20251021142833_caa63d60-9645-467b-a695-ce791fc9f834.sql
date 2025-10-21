-- Create donation_campaigns table
CREATE TABLE public.donation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hospital_id UUID REFERENCES public.hospitals(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  illness_category TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  raised_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending_verification' CHECK (status IN ('active', 'completed', 'cancelled', 'pending_verification')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  medical_documents JSONB,
  patient_story TEXT,
  patient_age INTEGER,
  urgency_level TEXT CHECK (urgency_level IN ('critical', 'urgent', 'moderate', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donation_campaigns ENABLE ROW LEVEL SECURITY;

-- Patients can view their own campaigns
CREATE POLICY "Patients can view own campaigns"
  ON public.donation_campaigns FOR SELECT
  USING (auth.uid() = patient_id);

-- Everyone can view active verified campaigns
CREATE POLICY "Anyone can view active campaigns"
  ON public.donation_campaigns FOR SELECT
  USING (status = 'active' AND verified_at IS NOT NULL);

-- Patients can create campaigns
CREATE POLICY "Patients can create campaigns"
  ON public.donation_campaigns FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Patients can update their own campaigns
CREATE POLICY "Patients can update own campaigns"
  ON public.donation_campaigns FOR UPDATE
  USING (auth.uid() = patient_id);

-- Create donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.donation_campaigns(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES auth.users(id),
  donor_wallet_address TEXT NOT NULL,
  recipient_wallet_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_hash TEXT UNIQUE NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Donors can view their own donations
CREATE POLICY "Donors can view own donations"
  ON public.donations FOR SELECT
  USING (auth.uid() = donor_id);

-- Campaign owners can view donations to their campaigns
CREATE POLICY "Patients can view campaign donations"
  ON public.donations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.donation_campaigns
      WHERE donation_campaigns.id = donations.campaign_id
      AND donation_campaigns.patient_id = auth.uid()
    )
  );

-- Anyone can view non-anonymous donations for active campaigns
CREATE POLICY "Anyone can view public donations"
  ON public.donations FOR SELECT
  USING (
    NOT is_anonymous AND
    EXISTS (
      SELECT 1 FROM public.donation_campaigns
      WHERE donation_campaigns.id = donations.campaign_id
      AND donation_campaigns.status = 'active'
    )
  );

-- Anyone can insert donations
CREATE POLICY "Anyone can create donations"
  ON public.donations FOR INSERT
  WITH CHECK (true);

-- Update donations status
CREATE POLICY "Donors can update own donations"
  ON public.donations FOR UPDATE
  USING (auth.uid() = donor_id);

-- Create trigger to update raised_amount
CREATE OR REPLACE FUNCTION update_campaign_raised_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
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

CREATE TRIGGER on_donation_confirmed
  AFTER INSERT OR UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_raised_amount();

-- Create trigger for updated_at on campaigns
CREATE TRIGGER update_donation_campaigns_updated_at
  BEFORE UPDATE ON public.donation_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();