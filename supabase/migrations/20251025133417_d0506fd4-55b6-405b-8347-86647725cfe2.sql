-- For DEMO ONLY: Disable RLS on access_grants to allow all operations
ALTER TABLE public.access_grants DISABLE ROW LEVEL SECURITY;

-- For DEMO ONLY: Add open policy to medical_records to allow viewing any record
DROP POLICY IF EXISTS "Allow viewing records with active access grant" ON public.medical_records;

CREATE POLICY "Demo: Allow viewing all medical records" ON public.medical_records
FOR SELECT
USING (true);

-- For DEMO ONLY: Allow anyone to view access_requests
ALTER TABLE public.access_requests DISABLE ROW LEVEL SECURITY;