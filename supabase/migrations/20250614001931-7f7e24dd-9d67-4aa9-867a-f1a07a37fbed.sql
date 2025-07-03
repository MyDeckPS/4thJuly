
-- Create a new database function to get available dates for a session type
CREATE OR REPLACE FUNCTION public.get_available_dates(session_type_param session_type, days_ahead integer DEFAULT 30)
RETURNS TABLE(available_date date)
LANGUAGE plpgsql
AS $function$
DECLARE
  current_date_local DATE := CURRENT_DATE;
  end_date DATE := CURRENT_DATE + INTERVAL '1 day' * days_ahead;
  check_date DATE;
BEGIN
  check_date := current_date_local;
  
  -- Loop through each date in the range
  WHILE check_date <= end_date LOOP
    -- Check if this date has any available slots
    IF EXISTS (
      SELECT 1 
      FROM public.get_available_slots(check_date, session_type_param)
    ) THEN
      RETURN QUERY SELECT check_date;
    END IF;
    
    -- Move to next day
    check_date := check_date + INTERVAL '1 day';
  END LOOP;
END;
$function$
