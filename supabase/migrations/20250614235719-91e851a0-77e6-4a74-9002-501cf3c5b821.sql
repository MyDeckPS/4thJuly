
-- Create session pricing configurations table
CREATE TABLE public.session_pricing_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_type session_type NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('standard', 'premium')),
  base_price NUMERIC NOT NULL DEFAULT 0,
  compare_at_price NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_type, user_type, is_active) -- Only one active config per session_type + user_type
);

-- Create premium benefits configuration table
CREATE TABLE public.premium_benefits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  benefit_type TEXT NOT NULL,
  limit_value INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(benefit_type, is_active) -- Only one active config per benefit type
);

-- Enable Row Level Security
ALTER TABLE public.session_pricing_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_benefits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for session_pricing_configurations (admin only)
CREATE POLICY "Admins can manage session pricing configurations" 
  ON public.session_pricing_configurations 
  FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Create RLS policies for premium_benefits (admin only)
CREATE POLICY "Admins can manage premium benefits" 
  ON public.premium_benefits 
  FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Insert default pricing configurations
INSERT INTO public.session_pricing_configurations (session_type, user_type, base_price, compare_at_price) VALUES
  ('playpath', 'standard', 50.00, 75.00),
  ('playpath', 'premium', 0.00, 50.00),
  ('consultation', 'standard', 0.00, 100.00), -- Standard users get denied access (handled in function)
  ('consultation', 'premium', 0.00, 100.00);

-- Insert default premium benefits
INSERT INTO public.premium_benefits (benefit_type, limit_value) VALUES
  ('free_playpath_sessions', 5),
  ('free_consultation_sessions', 1);

-- Update the calculate_session_price function to use new pricing configurations
CREATE OR REPLACE FUNCTION public.calculate_session_price(
  p_user_id UUID,
  p_session_type session_type
)
RETURNS NUMERIC AS $$
DECLARE
  is_premium BOOLEAN;
  used_playpath_sessions INTEGER;
  used_consultancy_sessions INTEGER;
  user_type_text TEXT;
  session_config_price NUMERIC;
  free_playpath_limit INTEGER;
  free_consultation_limit INTEGER;
BEGIN
  -- Check if user is premium
  SELECT public.is_premium_user(p_user_id) INTO is_premium;
  
  -- Determine user type
  user_type_text := CASE WHEN is_premium THEN 'premium' ELSE 'standard' END;
  
  -- Get base price from new session pricing configurations
  SELECT base_price INTO session_config_price
  FROM public.session_pricing_configurations 
  WHERE session_type = p_session_type 
    AND user_type = user_type_text 
    AND is_active = true
  LIMIT 1;
  
  -- Get premium benefit limits
  SELECT limit_value INTO free_playpath_limit
  FROM public.premium_benefits 
  WHERE benefit_type = 'free_playpath_sessions' AND is_active = true
  LIMIT 1;
  
  SELECT limit_value INTO free_consultation_limit
  FROM public.premium_benefits 
  WHERE benefit_type = 'free_consultation_sessions' AND is_active = true
  LIMIT 1;
  
  -- For consultation sessions
  IF p_session_type = 'consultation' THEN
    IF NOT is_premium THEN
      -- Return -1 to indicate access denied for standard users
      RETURN -1;
    END IF;
    
    -- Check if premium user has already used their free consultations
    SELECT COUNT(*)::INTEGER INTO used_consultancy_sessions
    FROM public.consultancy_sessions 
    WHERE user_id = p_user_id;
    
    -- If premium user hasn't exceeded their free consultation limit
    IF used_consultancy_sessions < COALESCE(free_consultation_limit, 1) THEN
      RETURN 0;
    END IF;
    
    -- If they've exceeded it, return -2 to indicate quota exhausted
    RETURN -2;
  END IF;
  
  -- For PlayPath sessions, premium users get configurable free sessions
  IF p_session_type = 'playpath' AND is_premium THEN
    SELECT used_sessions FROM public.get_playpath_usage(p_user_id) INTO used_playpath_sessions;
    
    -- If under the configured limit, it's free
    IF used_playpath_sessions < COALESCE(free_playpath_limit, 5) THEN
      RETURN 0;
    END IF;
  END IF;
  
  -- Return configured price or fallback to 0
  RETURN COALESCE(session_config_price, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger for session_pricing_configurations
CREATE TRIGGER update_session_pricing_configurations_updated_at
  BEFORE UPDATE ON public.session_pricing_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Add updated_at trigger for premium_benefits
CREATE TRIGGER update_premium_benefits_updated_at
  BEFORE UPDATE ON public.premium_benefits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
