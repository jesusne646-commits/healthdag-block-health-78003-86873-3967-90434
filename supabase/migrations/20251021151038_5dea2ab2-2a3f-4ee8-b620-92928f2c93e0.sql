-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view own activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Enable realtime for activity_logs
ALTER TABLE public.activity_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;

-- Create function to log bill payment activity
CREATE OR REPLACE FUNCTION public.log_bill_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.status = 'paid' AND OLD.status != 'paid') THEN
    INSERT INTO public.activity_logs (user_id, activity_type, title, description, metadata)
    VALUES (
      NEW.user_id,
      'payment',
      'Bill Payment',
      'Paid medical bill of ' || NEW.amount || ' BDAG',
      jsonb_build_object('bill_id', NEW.id, 'amount', NEW.amount, 'transaction_hash', NEW.transaction_hash)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for bill payments
CREATE TRIGGER on_bill_payment
  AFTER UPDATE ON public.medical_bills
  FOR EACH ROW
  EXECUTE FUNCTION public.log_bill_payment();

-- Create function to log donation activity
CREATE OR REPLACE FUNCTION public.log_donation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.activity_logs (user_id, activity_type, title, description, metadata)
    VALUES (
      COALESCE(NEW.donor_id, NEW.donor_id),
      'donation',
      'Donation Made',
      'Donated ' || NEW.amount || ' BDAG to campaign',
      jsonb_build_object('donation_id', NEW.id, 'campaign_id', NEW.campaign_id, 'amount', NEW.amount, 'transaction_hash', NEW.transaction_hash)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for donations
CREATE TRIGGER on_donation_created
  AFTER INSERT ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.log_donation();

-- Create function to log medical record activity
CREATE OR REPLACE FUNCTION public.log_medical_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.activity_logs (user_id, activity_type, title, description, metadata)
    VALUES (
      NEW.user_id,
      'record',
      'New Medical Record',
      'Added ' || NEW.record_type || ': ' || NEW.title,
      jsonb_build_object('record_id', NEW.id, 'record_type', NEW.record_type)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for medical records
CREATE TRIGGER on_medical_record_created
  AFTER INSERT ON public.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.log_medical_record();

-- Create function to log appointment activity
CREATE OR REPLACE FUNCTION public.log_appointment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.activity_logs (user_id, activity_type, title, description, metadata)
    VALUES (
      NEW.user_id,
      'appointment',
      'New Appointment',
      'Scheduled appointment: ' || NEW.reason,
      jsonb_build_object('appointment_id', NEW.id, 'appointment_date', NEW.appointment_date)
    );
  ELSIF (TG_OP = 'UPDATE' AND NEW.status != OLD.status) THEN
    INSERT INTO public.activity_logs (user_id, activity_type, title, description, metadata)
    VALUES (
      NEW.user_id,
      'appointment',
      'Appointment ' || NEW.status,
      'Appointment status changed to ' || NEW.status,
      jsonb_build_object('appointment_id', NEW.id, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for appointments
CREATE TRIGGER on_appointment_activity
  AFTER INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.log_appointment();