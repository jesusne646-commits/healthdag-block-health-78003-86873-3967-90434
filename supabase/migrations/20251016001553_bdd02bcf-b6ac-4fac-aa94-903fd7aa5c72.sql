-- Add category column to medical_bills table
ALTER TABLE public.medical_bills
ADD COLUMN category text CHECK (category IN ('lab', 'pharmacy', 'surgery', 'consultation', 'other')) DEFAULT 'other';

-- Create some sample bills for testing with different categories
INSERT INTO public.medical_bills (user_id, amount, description, status, category, hospital_id)
SELECT 
  id,
  CASE 
    WHEN random() < 0.33 THEN 250.00
    WHEN random() < 0.66 THEN 175.50
    ELSE 500.00
  END,
  CASE 
    WHEN random() < 0.2 THEN 'Blood Test - Complete Blood Count'
    WHEN random() < 0.4 THEN 'Prescription Medications'
    WHEN random() < 0.6 THEN 'Minor Surgery Procedure'
    WHEN random() < 0.8 THEN 'General Consultation'
    ELSE 'X-Ray Imaging'
  END,
  CASE 
    WHEN random() < 0.5 THEN 'unpaid'
    ELSE 'paid'
  END,
  CASE 
    WHEN random() < 0.25 THEN 'lab'
    WHEN random() < 0.5 THEN 'pharmacy'
    WHEN random() < 0.75 THEN 'surgery'
    ELSE 'consultation'
  END,
  (SELECT id FROM public.hospitals LIMIT 1)
FROM public.profiles
LIMIT 3;