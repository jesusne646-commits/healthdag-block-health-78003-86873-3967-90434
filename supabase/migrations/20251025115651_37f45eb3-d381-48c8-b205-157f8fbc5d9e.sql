-- Allow anyone to create pending access grants (that need patient approval)
DROP POLICY IF EXISTS "Anyone can create pending access grants" ON public.access_grants;

CREATE POLICY "Anyone can create pending access grants"
ON public.access_grants
FOR INSERT
WITH CHECK (
  revoked = true 
  AND signature = 'pending_approval'
  AND shared_encryption_key = 'pending_approval'
);