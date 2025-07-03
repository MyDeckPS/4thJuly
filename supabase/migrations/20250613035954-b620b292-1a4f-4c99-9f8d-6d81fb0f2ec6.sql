
-- Add welcome_offer_used field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN welcome_offer_used BOOLEAN NOT NULL DEFAULT false;

-- Create pricing_settings table for admin-configurable pricing
CREATE TABLE public.pricing_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  regular_price NUMERIC NOT NULL,
  discounted_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default pricing for PlayPath sessions
INSERT INTO public.pricing_settings (setting_key, regular_price, discounted_price)
VALUES ('playpath_session', 99.00, 49.00);

-- Add RLS policies for pricing_settings
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read pricing settings (needed for displaying prices)
CREATE POLICY "Anyone can view pricing settings" 
  ON public.pricing_settings 
  FOR SELECT 
  USING (true);

-- Only admins can modify pricing settings (we'll implement admin check later)
CREATE POLICY "Only admins can modify pricing settings" 
  ON public.pricing_settings 
  FOR ALL 
  USING (false);

-- Add trigger for updated_at
CREATE TRIGGER update_pricing_settings_updated_at
  BEFORE UPDATE ON public.pricing_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
