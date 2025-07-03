
-- Drop multi-host tables and create single host system
DROP TABLE IF EXISTS availability_templates CASCADE;
DROP TABLE IF EXISTS hosts CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;

-- Create single host table
CREATE TABLE host (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  email TEXT,
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create working hours table for weekly schedule
CREATE TABLE working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create scheduling rules table
CREATE TABLE scheduling_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_notice_hours INTEGER NOT NULL DEFAULT 24,
  max_booking_days INTEGER NOT NULL DEFAULT 30,
  buffer_minutes INTEGER NOT NULL DEFAULT 15,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bookings table (simplified)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_type session_type NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  special_notes TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  amount_paid DECIMAL(10,2),
  booking_status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE host ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for host (everyone can view, admins can manage)
CREATE POLICY "Everyone can view host" ON host
  FOR SELECT TO authenticated, anon USING (is_active = true);

CREATE POLICY "Admins can manage host" ON host
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS policies for working_hours (everyone can view, admins can manage)
CREATE POLICY "Everyone can view working hours" ON working_hours
  FOR SELECT TO authenticated, anon USING (is_available = true);

CREATE POLICY "Admins can manage working hours" ON working_hours
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS policies for scheduling_rules (everyone can view, admins can manage)
CREATE POLICY "Everyone can view scheduling rules" ON scheduling_rules
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Admins can manage scheduling rules" ON scheduling_rules
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS policies for bookings (users see own, admins see all)
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bookings" ON bookings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_host_updated_at
  BEFORE UPDATE ON host
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_working_hours_updated_at
  BEFORE UPDATE ON working_hours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_scheduling_rules_updated_at
  BEFORE UPDATE ON scheduling_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert default host
INSERT INTO host (name, bio, email, profile_image_url) VALUES
('Dr. Sarah Johnson', 'Child development specialist with 10+ years of experience in play therapy and early childhood education.', 'sarah@example.com', '/placeholder.svg');

-- Insert default working hours (Monday to Friday, 9 AM to 5 PM)
INSERT INTO working_hours (day_of_week, start_time, end_time) VALUES
(1, '09:00', '17:00'), -- Monday
(2, '09:00', '17:00'), -- Tuesday
(3, '09:00', '17:00'), -- Wednesday
(4, '09:00', '17:00'), -- Thursday
(5, '09:00', '17:00'); -- Friday

-- Insert default scheduling rules
INSERT INTO scheduling_rules (min_notice_hours, max_booking_days, buffer_minutes, slot_duration_minutes) VALUES
(24, 30, 15, 60);

-- Function to get available time slots
CREATE OR REPLACE FUNCTION get_available_slots(
  target_date DATE,
  session_type_param session_type
)
RETURNS TABLE (
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  day_of_week_num INTEGER;
  work_start TIME;
  work_end TIME;
  slot_duration INTEGER;
  buffer_time INTEGER;
  min_notice INTEGER;
  now_timestamp TIMESTAMP WITH TIME ZONE;
  slot_start TIMESTAMP WITH TIME ZONE;
  slot_end TIMESTAMP WITH TIME ZONE;
  session_duration INTEGER;
BEGIN
  -- Get day of week (0 = Sunday, 6 = Saturday)
  day_of_week_num := EXTRACT(DOW FROM target_date);
  
  -- Get working hours for this day
  SELECT wh.start_time, wh.end_time 
  INTO work_start, work_end
  FROM working_hours wh
  WHERE wh.day_of_week = day_of_week_num AND wh.is_available = true;
  
  -- If no working hours found, return empty
  IF work_start IS NULL THEN
    RETURN;
  END IF;
  
  -- Get scheduling rules
  SELECT sr.min_notice_hours, sr.buffer_minutes, sr.slot_duration_minutes
  INTO min_notice, buffer_time, slot_duration
  FROM scheduling_rules sr
  LIMIT 1;
  
  -- Get session duration
  SELECT sc.duration_minutes
  INTO session_duration
  FROM session_configurations sc
  WHERE sc.session_type = session_type_param AND sc.is_active = true
  LIMIT 1;
  
  now_timestamp := now();
  slot_start := target_date + work_start;
  
  -- Generate slots for the day
  WHILE slot_start + INTERVAL '1 minute' * session_duration <= target_date + work_end LOOP
    slot_end := slot_start + INTERVAL '1 minute' * session_duration;
    
    -- Check if slot is in the future with minimum notice
    IF slot_start >= now_timestamp + INTERVAL '1 hour' * min_notice THEN
      -- Check if slot is not already booked
      IF NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.booking_status = 'confirmed'
        AND (
          (b.start_time <= slot_start AND b.end_time > slot_start) OR
          (b.start_time < slot_end AND b.end_time >= slot_end) OR
          (b.start_time >= slot_start AND b.end_time <= slot_end)
        )
      ) THEN
        RETURN QUERY SELECT slot_start, slot_end;
      END IF;
    END IF;
    
    -- Move to next slot
    slot_start := slot_start + INTERVAL '1 minute' * slot_duration;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
