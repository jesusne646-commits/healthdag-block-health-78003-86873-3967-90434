-- Drop the existing policy
DROP POLICY IF EXISTS "Allow access grant creation" ON public.access_grants;

-- Create a simpler policy that works for both authenticated and unauthenticated users
CREATE POLICY "Allow access grant creation"
ON public.access_grants
FOR INSERT
TO public
WITH CHECK (
  -- Allow if it's a pending grant (doctor request)
  (revoked = true AND signature = 'pending_approval' AND shared_encryption_key = 'pending_approval')
  OR
  -- OR if authenticated user is the patient
  (auth.uid() IS NOT NULL AND auth.uid() = patient_id)
);