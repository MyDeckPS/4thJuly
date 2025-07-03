
-- Create sales_transactions table for unified transaction tracking
CREATE TABLE public.sales_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sales_id text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  booking_id uuid NULL,
  amount numeric NOT NULL,
  source_type text NOT NULL, -- 'playpath_session', 'consultation_session', 'premium_membership'
  payment_status text NOT NULL DEFAULT 'pending',
  payment_gateway_id text NULL,
  payment_gateway_data jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create sales_notes table for transaction notes and Razorpay integration
CREATE TABLE public.sales_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id uuid NOT NULL REFERENCES public.sales_transactions(id) ON DELETE CASCADE,
  note text NOT NULL,
  note_type text NOT NULL DEFAULT 'admin', -- 'admin', 'razorpay', 'system'
  created_by uuid NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create membership_purchases table for premium membership tracking
CREATE TABLE public.membership_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  transaction_id uuid NOT NULL REFERENCES public.sales_transactions(id) ON DELETE CASCADE,
  membership_type text NOT NULL DEFAULT 'premium',
  duration_days integer NOT NULL,
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add premium membership pricing fields to premium_benefits table
ALTER TABLE public.premium_benefits 
ADD COLUMN IF NOT EXISTS premium_membership_price numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS membership_duration_days integer DEFAULT NULL;

-- Enable RLS on new tables
ALTER TABLE public.sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Admin only access)
CREATE POLICY "Admin can view all sales transactions" ON public.sales_transactions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin can insert sales transactions" ON public.sales_transactions
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update sales transactions" ON public.sales_transactions
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin can view all sales notes" ON public.sales_notes
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin can insert sales notes" ON public.sales_notes
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin can view all membership purchases" ON public.membership_purchases
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin can insert membership purchases" ON public.membership_purchases
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update membership purchases" ON public.membership_purchases
  FOR UPDATE USING (public.is_admin());

-- Add triggers for updated_at
CREATE TRIGGER update_sales_transactions_updated_at
  BEFORE UPDATE ON public.sales_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_membership_purchases_updated_at
  BEFORE UPDATE ON public.membership_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Function to generate sales ID
CREATE OR REPLACE FUNCTION public.generate_sales_id()
RETURNS text AS $$
DECLARE
  next_id integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(sales_id FROM 2) AS integer)), 0) + 1
  INTO next_id
  FROM public.sales_transactions;
  
  RETURN '#' || LPAD(next_id::text, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically create sales transaction on booking payment
CREATE OR REPLACE FUNCTION public.track_sales_transaction()
RETURNS trigger AS $$
DECLARE
  transaction_source text;
  transaction_amount numeric;
BEGIN
  -- Only process when payment status changes to 'completed' or 'paid'
  IF NEW.payment_status IN ('completed', 'paid') AND 
     (OLD.payment_status IS NULL OR OLD.payment_status NOT IN ('completed', 'paid')) THEN
    
    -- Determine source type and amount
    IF NEW.session_type = 'playpath' THEN
      transaction_source := 'playpath_session';
    ELSIF NEW.session_type = 'consultation' THEN
      transaction_source := 'consultation_session';
    END IF;
    
    transaction_amount := COALESCE(NEW.amount_paid, 0);
    
    -- Insert sales transaction
    INSERT INTO public.sales_transactions (
      sales_id,
      user_id,
      booking_id,
      amount,
      source_type,
      payment_status,
      payment_gateway_id
    ) VALUES (
      public.generate_sales_id(),
      NEW.user_id,
      NEW.id,
      transaction_amount,
      transaction_source,
      'completed',
      NEW.payment_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking payments
CREATE TRIGGER track_booking_sales
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.track_sales_transaction();

-- Insert default premium membership pricing configuration
INSERT INTO public.premium_benefits (benefit_type, limit_value, premium_membership_price, membership_duration_days, is_active)
VALUES ('premium_membership', 1, 999.00, 365, true)
ON CONFLICT DO NOTHING;
