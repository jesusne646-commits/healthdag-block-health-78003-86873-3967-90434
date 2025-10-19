-- Add ratings column to hospitals table
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5);

-- Add more sample hospitals with realistic data
INSERT INTO public.hospitals (name, location, city, specialties, rating) VALUES
('City General Hospital', '123 Main St', 'New York', ARRAY['Emergency Care', 'General Surgery', 'Internal Medicine'], 4.8),
('St. Mary Medical Center', '456 Oak Ave', 'Los Angeles', ARRAY['Cardiology', 'Neurology', 'Pediatrics'], 4.6),
('Regional Health Institute', '789 Pine Rd', 'Chicago', ARRAY['Orthopedics', 'Oncology', 'Radiology'], 4.7),
('Metropolitan Hospital', '321 Elm St', 'Houston', ARRAY['Emergency Care', 'Cardiology', 'Orthopedics'], 4.5),
('University Medical Center', '654 Cedar Ln', 'Phoenix', ARRAY['Neurology', 'Oncology', 'Internal Medicine'], 4.9),
('Community Health Center', '987 Maple Dr', 'Philadelphia', ARRAY['Pediatrics', 'General Surgery', 'Emergency Care'], 4.4),
('Advanced Care Hospital', '147 Birch Blvd', 'San Antonio', ARRAY['Cardiology', 'Radiology', 'Oncology'], 4.6),
('Wellness Medical Plaza', '258 Spruce Way', 'San Diego', ARRAY['Internal Medicine', 'Pediatrics', 'Orthopedics'], 4.5)
ON CONFLICT (id) DO NOTHING;

-- Create insurance_policies table
CREATE TABLE IF NOT EXISTS public.insurance_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  policy_number text NOT NULL UNIQUE,
  provider text NOT NULL DEFAULT 'BlockDAG Health Insurance',
  plan_type text NOT NULL,
  coverage_amount numeric NOT NULL,
  premium_amount numeric NOT NULL,
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  coverage_details jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insurance policies"
  ON public.insurance_policies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own insurance policies"
  ON public.insurance_policies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insurance policies"
  ON public.insurance_policies FOR UPDATE
  USING (auth.uid() = user_id);

-- Create insurance_claims table
CREATE TABLE IF NOT EXISTS public.insurance_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  policy_id uuid REFERENCES public.insurance_policies(id) NOT NULL,
  claim_number text NOT NULL UNIQUE,
  claim_type text NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing')),
  description text,
  hospital_id uuid REFERENCES public.hospitals(id),
  submitted_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insurance claims"
  ON public.insurance_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own insurance claims"
  ON public.insurance_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insurance claims"
  ON public.insurance_claims FOR UPDATE
  USING (auth.uid() = user_id);

-- Add trigger for insurance policies updated_at
CREATE TRIGGER update_insurance_policies_updated_at
  BEFORE UPDATE ON public.insurance_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for insurance claims updated_at
CREATE TRIGGER update_insurance_claims_updated_at
  BEFORE UPDATE ON public.insurance_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();