
-- Update the calculate_session_price function to handle free consultation for premium users
CREATE OR REPLACE FUNCTION public.calculate_session_price(
  p_user_id UUID,
  p_session_type session_type
)
RETURNS NUMERIC AS $$
DECLARE
  is_premium BOOLEAN;
  used_playpath_sessions INTEGER;
  used_consultancy_sessions INTEGER;
  session_config_price NUMERIC;
BEGIN
  -- Check if user is premium
  SELECT public.is_premium_user(p_user_id) INTO is_premium;
  
  -- Get base price from session configuration
  SELECT price INTO session_config_price
  FROM public.session_configurations 
  WHERE session_type = p_session_type AND is_active = true
  LIMIT 1;
  
  -- For consultation sessions
  IF p_session_type = 'consultation' THEN
    IF NOT is_premium THEN
      -- Return -1 to indicate access denied for standard users
      RETURN -1;
    END IF;
    
    -- Check if premium user has already used their free consultation
    SELECT COUNT(*)::INTEGER INTO used_consultancy_sessions
    FROM public.consultancy_sessions 
    WHERE user_id = p_user_id;
    
    -- If premium user hasn't used their free consultation yet
    IF used_consultancy_sessions = 0 THEN
      RETURN 0;
    END IF;
    
    -- If they've already used it, return -2 to indicate quota exhausted
    RETURN -2;
  END IF;
  
  -- For PlayPath sessions, premium users get 5 free sessions
  IF p_session_type = 'playpath' AND is_premium THEN
    SELECT used_sessions FROM public.get_playpath_usage(p_user_id) INTO used_playpath_sessions;
    
    -- If under 5 sessions, it's free
    IF used_playpath_sessions < 5 THEN
      RETURN 0;
    END IF;
  END IF;
  
  -- Return standard price
  RETURN session_config_price;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get consultation usage for a user
CREATE OR REPLACE FUNCTION public.get_consultation_usage(user_id UUID)
RETURNS TABLE(used_sessions INTEGER, total_free_sessions INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(cs.id)::INTEGER, 0) as used_sessions,
    1 as total_free_sessions
  FROM public.consultancy_sessions cs
  WHERE cs.user_id = get_consultation_usage.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
