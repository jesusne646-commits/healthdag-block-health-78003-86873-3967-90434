-- Step 2: Create a single INSERT policy that handles both cases
CREATE POLICY "Allow access grant creation"
ON public.access_grants
FOR INSERT
WITH CHECK (
  -- Case 1: Patient creating their own grant (authenticated)
  (auth.uid() = patient_id)
  OR
  -- Case 2: Doctor creating pending grant (unauthenticated or any user)
  (
    revoked = true 
    AND signature = 'pending_approval'
    AND shared_encryption_key = 'pending_approval'
  )
);