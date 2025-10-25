-- Remove all INSERT policies on access_grants table
DROP POLICY IF EXISTS "Allow access grant creation" ON public.access_grants;

-- Temporarily disable RLS for INSERT (for development/testing)
-- Note: This allows anyone to insert pending grants
CREATE POLICY "allow_all_inserts" ON public.access_grants
FOR INSERT
WITH CHECK (true);