-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  wallet_address TEXT UNIQUE,
  bdag_balance DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create hospitals table
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  specialties TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for hospitals
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hospitals"
  ON public.hospitals FOR SELECT
  USING (true);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE NOT NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = user_id);

-- Create medical bills table
CREATE TABLE IF NOT EXISTS public.medical_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  amount DECIMAL(20, 8) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'unpaid',
  paid_at TIMESTAMPTZ,
  transaction_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for medical bills
ALTER TABLE public.medical_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bills"
  ON public.medical_bills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own bills"
  ON public.medical_bills FOR UPDATE
  USING (auth.uid() = user_id);

-- Create medical records table
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  record_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for medical records
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medical records"
  ON public.medical_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own medical records"
  ON public.medical_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical records"
  ON public.medical_records FOR UPDATE
  USING (auth.uid() = user_id);

-- Create emergency access table
CREATE TABLE IF NOT EXISTS public.emergency_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blood_type TEXT,
  allergies TEXT[],
  emergency_contacts JSONB,
  medical_conditions TEXT[],
  qr_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for emergency access
ALTER TABLE public.emergency_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emergency access"
  ON public.emergency_access FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own emergency access"
  ON public.emergency_access FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency access"
  ON public.emergency_access FOR UPDATE
  USING (auth.uid() = user_id);

-- Create wallet transactions table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  recipient_address TEXT,
  transaction_hash TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for wallet transactions
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.wallet_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON public.wallet_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert sample hospitals
INSERT INTO public.hospitals (name, location, city, specialties) VALUES
  ('Aminu Kano Teaching Hospital', 'Kano', 'Kano', ARRAY['General Medicine', 'Surgery', 'Pediatrics', 'Cardiology']),
  ('Murtala Muhammad Specialist Hospital', 'Kano', 'Kano', ARRAY['Orthopedics', 'Neurology', 'Oncology']),
  ('Rasheed Shekoni Teaching Hospital', 'Dutse', 'Jigawa', ARRAY['General Medicine', 'Surgery', 'Obstetrics', 'Gynecology']),
  ('Abubakar Tafawa Balewa Teaching Hospital', 'Bauchi', 'Bauchi', ARRAY['General Medicine', 'Surgery', 'Pediatrics', 'Internal Medicine']);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_access_updated_at
  BEFORE UPDATE ON public.emergency_access
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, wallet_address, bdag_balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'BDAG_' || substr(md5(random()::text), 1, 34),
    1000.00
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();