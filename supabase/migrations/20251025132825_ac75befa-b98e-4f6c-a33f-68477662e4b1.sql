-- Create a security definer function to check if a user has an active grant for specific records
CREATE OR REPLACE FUNCTION public.has_active_grant_for_records(
  _requester_wallet text,
  _record_ids uuid[]
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.access_grants
    WHERE recipient_wallet_address = _requester_wallet
      AND revoked = false
      AND signature != 'pending_approval'
      AND expires_at > now()
      AND resource_ids && _record_ids  -- Array overlap operator
  )
$$;

-- Add policy to allow viewing medical records with an active grant
-- Note: This allows viewing records even without authentication if there's a valid grant
CREATE POLICY "Allow viewing records with active grant" ON public.medical_records
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.access_grants
    WHERE revoked = false
      AND signature != 'pending_approval'
      AND expires_at > now()
      AND id::text = ANY(string_to_array(current_setting('request.headers', true)::json->>'x-grant-id', ','))
      AND resource_ids @> ARRAY[medical_records.id]
  )
);