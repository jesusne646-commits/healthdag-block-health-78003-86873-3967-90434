-- Create access_requests table for pending permission requests
CREATE TABLE public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_wallet_address TEXT NOT NULL,
  requester_name TEXT,
  resource_type TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Enable RLS
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Patients can view requests made to them
CREATE POLICY "Patients can view own requests"
ON public.access_requests
FOR SELECT
USING (auth.uid() = patient_id);

-- Anyone can create access requests (doctors requesting access)
CREATE POLICY "Anyone can create access requests"
ON public.access_requests
FOR INSERT
WITH CHECK (true);

-- Patients can update requests (approve/deny)
CREATE POLICY "Patients can update own requests"
ON public.access_requests
FOR UPDATE
USING (auth.uid() = patient_id);

-- Create index for performance
CREATE INDEX idx_access_requests_patient_status ON public.access_requests(patient_id, status);

-- Add trigger to update responded_at timestamp
CREATE OR REPLACE FUNCTION update_access_request_responded_at()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status != OLD.status AND NEW.status IN ('approved', 'denied')) THEN
    NEW.responded_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_access_request_responded_at
BEFORE UPDATE ON public.access_requests
FOR EACH ROW
EXECUTE FUNCTION update_access_request_responded_at();