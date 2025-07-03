
-- Create dedicated session tracking tables for PlayPath and Consultation sessions
CREATE TABLE public.playpath_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.consultancy_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.playpath_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultancy_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for playpath_sessions
CREATE POLICY "Users can view their own playpath sessions" 
  ON public.playpath_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playpath sessions" 
  ON public.playpath_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playpath sessions" 
  ON public.playpath_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for consultancy_sessions  
CREATE POLICY "Users can view their own consultancy sessions" 
  ON public.consultancy_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own consultancy sessions" 
  ON public.consultancy_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consultancy sessions" 
  ON public.consultancy_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to automatically track session usage when bookings are created
CREATE OR REPLACE FUNCTION public.track_session_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Track PlayPath sessions
  IF NEW.session_type = 'playpath' AND NEW.booking_status = 'confirmed' THEN
    INSERT INTO public.playpath_sessions (user_id, booking_id, session_date)
    VALUES (NEW.user_id, NEW.id, NEW.start_time);
  END IF;
  
  -- Track Consultation sessions
  IF NEW.session_type = 'consultation' AND NEW.booking_status = 'confirmed' THEN
    INSERT INTO public.consultancy_sessions (user_id, booking_id, session_date)
    VALUES (NEW.user_id, NEW.id, NEW.start_time);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically track sessions
CREATE TRIGGER track_session_usage_trigger
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.track_session_usage();

-- Create function to check if user has premium membership
CREATE OR REPLACE FUNCTION public.is_premium_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND membership_type = 'premium'
    AND (membership_expires_at IS NULL OR membership_expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get PlayPath session usage for a user
CREATE OR REPLACE FUNCTION public.get_playpath_usage(user_id UUID)
RETURNS TABLE(used_sessions INTEGER, total_free_sessions INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(ps.id)::INTEGER, 0) as used_sessions,
    5 as total_free_sessions
  FROM public.playpath_sessions ps
  WHERE ps.user_id = get_playpath_usage.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate session price based on membership and usage
CREATE OR REPLACE FUNCTION public.calculate_session_price(
  p_user_id UUID,
  p_session_type session_type
)
RETURNS NUMERIC AS $$
DECLARE
  is_premium BOOLEAN;
  used_sessions INTEGER;
  session_config_price NUMERIC;
BEGIN
  -- Check if user is premium
  SELECT public.is_premium_user(p_user_id) INTO is_premium;
  
  -- Get base price from session configuration
  SELECT price INTO session_config_price
  FROM public.session_configurations 
  WHERE session_type = p_session_type AND is_active = true
  LIMIT 1;
  
  -- For consultation sessions, only premium users can book
  IF p_session_type = 'consultation' THEN
    IF NOT is_premium THEN
      -- Return -1 to indicate access denied
      RETURN -1;
    END IF;
    RETURN session_config_price;
  END IF;
  
  -- For PlayPath sessions, premium users get 5 free sessions
  IF p_session_type = 'playpath' AND is_premium THEN
    SELECT used_sessions FROM public.get_playpath_usage(p_user_id) INTO used_sessions;
    
    -- If under 5 sessions, it's free
    IF used_sessions < 5 THEN
      RETURN 0;
    END IF;
  END IF;
  
  -- Return standard price
  RETURN session_config_price;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
