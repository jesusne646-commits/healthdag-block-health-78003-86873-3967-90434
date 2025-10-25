-- Step 1: Drop all existing INSERT policies on access_grants
DROP POLICY IF EXISTS "Patients can create access grants" ON public.access_grants;
DROP POLICY IF EXISTS "Patients can create own access grants" ON public.access_grants;
DROP POLICY IF EXISTS "Anyone can create pending access grants" ON public.access_grants;
DROP POLICY IF EXISTS "Anyone can create pending grants" ON public.access_grants;