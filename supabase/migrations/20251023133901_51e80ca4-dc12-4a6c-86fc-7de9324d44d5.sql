-- Create access_grants table for secure data sharing
CREATE TABLE public.access_grants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_wallet_address TEXT NOT NULL,
  recipient_name TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('medical_records', 'medical_bills', 'appointments', 'all')),
  resource_ids UUID[] NOT NULL,
  shared_encryption_key TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  signature TEXT NOT NULL,
  metadata JSONB
);

-- Enable RLS
ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;

-- Patients can create and manage their own grants
CREATE POLICY "Patients can create access grants"
ON public.access_grants FOR INSERT
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can view own grants"
ON public.access_grants FOR SELECT
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can update own grants"
ON public.access_grants FOR UPDATE
USING (auth.uid() = patient_id);

-- Create compliance metrics table
CREATE TABLE public.compliance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metrics"
ON public.compliance_metrics FOR SELECT
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_access_grants_patient ON public.access_grants(patient_id);
CREATE INDEX idx_access_grants_recipient ON public.access_grants(recipient_wallet_address);
CREATE INDEX idx_access_grants_expires ON public.access_grants(expires_at) WHERE NOT revoked;
CREATE INDEX idx_compliance_metrics_user ON public.compliance_metrics(user_id, recorded_at DESC);