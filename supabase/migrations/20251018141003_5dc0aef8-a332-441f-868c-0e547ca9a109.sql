-- Clear existing hospitals and add Northern Nigeria hospitals
DELETE FROM public.hospitals;

-- Insert Northern Nigeria hospitals
INSERT INTO public.hospitals (name, location, city, specialties, rating) VALUES
  ('Aminu Kano Teaching Hospital', 'Kano Road, Nassarawa', 'Kano', ARRAY['General Medicine', 'Surgery', 'Pediatrics', 'Obstetrics', 'Emergency'], 4.5),
  ('Ahmadu Bello University Teaching Hospital', 'Shika Road, Zaria', 'Kaduna', ARRAY['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'General Medicine'], 4.7),
  ('National Hospital Abuja', 'Central District', 'Abuja', ARRAY['Emergency', 'Surgery', 'Internal Medicine', 'Radiology', 'Pathology'], 4.6),
  ('Sir Ahmadu Bello Memorial Hospital', 'Hospital Road', 'Katsina', ARRAY['General Medicine', 'Pediatrics', 'Gynecology', 'Surgery'], 4.3),
  ('Specialist Hospital Sokoto', 'Sultan Abubakar Road', 'Sokoto', ARRAY['Cardiology', 'Endocrinology', 'Nephrology', 'General Medicine'], 4.4),
  ('Federal Medical Centre', 'Along Airport Road', 'Katsina', ARRAY['Surgery', 'Obstetrics', 'Emergency', 'General Medicine'], 4.2),
  ('Barau Dikko Teaching Hospital', 'Kaduna-Zaria Road', 'Kaduna', ARRAY['Neurosurgery', 'Cardiology', 'Pediatrics', 'Oncology'], 4.5),
  ('Murtala Muhammad Specialist Hospital', 'Ibrahim Taiwo Road', 'Kano', ARRAY['Orthopedics', 'Ophthalmology', 'ENT', 'General Surgery'], 4.4),
  ('Usmanu Danfodiyo University Teaching Hospital', 'Sultan Abubakar Road', 'Sokoto', ARRAY['General Medicine', 'Surgery', 'Pediatrics', 'Obstetrics'], 4.6),
  ('Federal Medical Centre Birnin Kebbi', 'Kalgo Road', 'Kebbi', ARRAY['Emergency', 'General Medicine', 'Surgery', 'Pediatrics'], 4.1);