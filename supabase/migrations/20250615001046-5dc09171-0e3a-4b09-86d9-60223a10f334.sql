
-- Add purchase limits to premium benefits for paid sessions
INSERT INTO public.premium_benefits (benefit_type, limit_value, is_active) 
VALUES ('max_paid_sessions_per_month', 10, true)
ON CONFLICT DO NOTHING;

-- Update calculate_session_price function to allow premium users to buy sessions after quota
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
  welcome_price_config NUMERIC;
  welcome_offer_used BOOLEAN;
  free_playpath_limit INTEGER;
  free_consultation_limit INTEGER;
BEGIN
  -- Check if user is premium
  SELECT public.is_premium_user(p_user_id) INTO is_premium;
  
  -- Determine user type
  user_type_text := CASE WHEN is_premium THEN 'premium' ELSE 'standard' END;
  
  -- Get pricing configuration
  SELECT base_price, welcome_price INTO session_config_price, welcome_price_config
  FROM public.session_pricing_configurations 
  WHERE session_type = p_session_type 
    AND user_type = user_type_text 
    AND is_active = true
  LIMIT 1;
  
  -- Check if user has used welcome offer
  SELECT profiles.welcome_offer_used INTO welcome_offer_used
  FROM public.profiles 
  WHERE id = p_user_id;
  
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
    
    -- Premium users can buy additional consultations at base price
    RETURN COALESCE(session_config_price, 0);
  END IF;
  
  -- For PlayPath sessions, premium users get configurable free sessions
  IF p_session_type = 'playpath' AND is_premium THEN
    SELECT used_sessions FROM public.get_playpath_usage(p_user_id) INTO used_playpath_sessions;
    
    -- If under the configured limit, it's free
    IF used_playpath_sessions < COALESCE(free_playpath_limit, 5) THEN
      RETURN 0;
    END IF;
    
    -- Premium users can buy additional sessions at base price
    RETURN COALESCE(session_config_price, 0);
  END IF;
  
  -- For PlayPath sessions and standard users, check welcome offer
  IF p_session_type = 'playpath' AND NOT is_premium THEN
    -- If user hasn't used welcome offer and welcome price is configured
    IF NOT COALESCE(welcome_offer_used, false) AND welcome_price_config IS NOT NULL THEN
      RETURN welcome_price_config;
    END IF;
  END IF;
  
  -- Return configured price or fallback to 0
  RETURN COALESCE(session_config_price, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the redundant pricing_settings table (schema optimization)
DROP TABLE IF EXISTS public.pricing_settings;
