-- Drop the problematic policy
DROP POLICY IF EXISTS "Allow viewing records with active grant" ON public.medical_records;

-- Create a simpler policy that allows viewing records if there's ANY active grant for them
-- This allows doctors (or anyone) to view records that have been granted access to
CREATE POLICY "Allow viewing records with active access grant" ON public.medical_records
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.access_grants
    WHERE revoked = false
      AND signature != 'pending_approval'
      AND expires_at > now()
      AND resource_ids @> ARRAY[medical_records.id]
  )
);