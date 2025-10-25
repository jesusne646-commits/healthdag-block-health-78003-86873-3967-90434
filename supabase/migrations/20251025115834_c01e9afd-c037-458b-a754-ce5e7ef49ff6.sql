-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Patients can create access grants" ON public.access_grants;

-- Allow patients to create their own access grants
CREATE POLICY "Patients can create own access grants"
ON public.access_grants
FOR INSERT
WITH CHECK (auth.uid() = patient_id);

-- Allow anyone to create pending access grants (doctors/providers)
CREATE POLICY "Anyone can create pending grants"
ON public.access_grants
FOR INSERT
WITH CHECK (
  revoked = true 
  AND signature = 'pending_approval'
  AND shared_encryption_key = 'pending_approval'
);