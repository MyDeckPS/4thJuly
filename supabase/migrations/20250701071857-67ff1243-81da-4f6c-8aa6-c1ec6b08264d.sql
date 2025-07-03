
-- Phase 1: Database Schema Updates (Corrected)

-- Step 1.1: Update Profiles Table - Remove membership columns
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS membership_type,
DROP COLUMN IF EXISTS membership_expires_at;

-- Step 1.2: First check what session types exist and update data
-- Update any existing consultation bookings to playpath
UPDATE public.bookings 
SET session_type = 'playpath' 
WHERE session_type = 'consultation';

-- Update session configurations - remove consultation configs
DELETE FROM public.session_configurations 
WHERE session_type = 'consultation';

-- Remove premium user pricing configurations, keep only standard user configs
DELETE FROM public.session_pricing_configurations 
WHERE user_type = 'premium';

-- Update remaining configurations to ensure they're for playpath + standard users
UPDATE public.session_pricing_configurations 
SET session_type = 'playpath',
    user_type = 'standard'
WHERE user_type != 'standard';

-- Step 1.3: Clean Up Related Tables
-- Remove membership-related tables
DROP TABLE IF EXISTS public.membership_purchases CASCADE;
DROP TABLE IF EXISTS public.premium_benefits CASCADE;
DROP TABLE IF EXISTS public.consultancy_sessions CASCADE;

-- Step 1.4: Update Database Functions
-- Simplify calculate_session_price function to only handle playpath sessions for standard users
CREATE OR REPLACE FUNCTION public.calculate_session_price(p_user_id uuid, p_session_type text)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_config_price NUMERIC;
  welcome_price_config NUMERIC;
  welcome_offer_used BOOLEAN;
BEGIN
  -- Get pricing configuration for standard users and playpath sessions
  SELECT base_price, welcome_price INTO session_config_price, welcome_price_config
  FROM public.session_pricing_configurations 
  WHERE session_type = 'playpath' 
    AND user_type = 'standard' 
    AND is_active = true
  LIMIT 1;
  
  -- Check if user has used welcome offer
  SELECT COALESCE(profiles.welcome_offer_used, false) INTO welcome_offer_used
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- If user hasn't used welcome offer and welcome price is configured
  IF NOT welcome_offer_used AND welcome_price_config IS NOT NULL THEN
    RETURN welcome_price_config;
  END IF;
  
  -- Return configured price or fallback to 0
  RETURN COALESCE(session_config_price, 0);
END;
$$;

-- Simplify get_playpath_usage function (remove premium limits, keep for analytics)
CREATE OR REPLACE FUNCTION public.get_playpath_usage(user_id uuid)
RETURNS TABLE(used_sessions integer, total_free_sessions integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(ps.id)::INTEGER, 0) as used_sessions,
    0 as total_free_sessions  -- No free session limits anymore
  FROM public.playpath_sessions ps
  WHERE ps.user_id = get_playpath_usage.user_id;
END;
$$;

-- Remove consultation usage function
DROP FUNCTION IF EXISTS public.get_consultation_usage(uuid);

-- Remove premium user check function
DROP FUNCTION IF EXISTS public.is_premium_user(uuid);

-- Update track_session_usage function to only handle playpath
CREATE OR REPLACE FUNCTION public.track_session_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only track PlayPath sessions
  IF NEW.session_type = 'playpath' AND NEW.booking_status = 'confirmed' THEN
    INSERT INTO public.playpath_sessions (user_id, booking_id, session_date)
    VALUES (NEW.user_id, NEW.id, NEW.start_time);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update track_sales_transaction function to only handle playpath
CREATE OR REPLACE FUNCTION public.track_sales_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_source text;
  transaction_amount numeric;
BEGIN
  -- Only process when payment status changes to 'completed' or 'paid'
  IF NEW.payment_status IN ('completed', 'paid') AND 
     (OLD.payment_status IS NULL OR OLD.payment_status NOT IN ('completed', 'paid')) THEN
    
    -- All sessions are now playpath sessions
    transaction_source := 'playpath_session';
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
$$;

-- Clean up any remaining consultation or premium references in sales_transactions
UPDATE public.sales_transactions 
SET source_type = 'playpath_session'
WHERE source_type = 'consultation_session';

-- Update any existing premium membership sales to playpath_session for consistency
UPDATE public.sales_transactions 
SET source_type = 'playpath_session'
WHERE source_type = 'premium_membership';
