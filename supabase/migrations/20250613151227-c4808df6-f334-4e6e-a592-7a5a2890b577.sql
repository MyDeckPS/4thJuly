
-- Create session_type enum
CREATE TYPE session_type AS ENUM ('playpath', 'consultation');

-- Create hosts table
CREATE TABLE hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  profile_image_id UUID REFERENCES media_library(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create availability_templates table for recurring weekly patterns
CREATE TABLE availability_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
  session_type session_type NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create time_slots table for actual bookable instances
CREATE TABLE time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
  session_type session_type NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  generated_from_template_id UUID REFERENCES availability_templates(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  host_id UUID NOT NULL REFERENCES hosts(id),
  time_slot_id UUID NOT NULL REFERENCES time_slots(id),
  session_type session_type NOT NULL,
  child_name TEXT,
  special_notes TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  amount_paid DECIMAL(10,2),
  booking_status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create session_configurations table
CREATE TABLE session_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_type session_type NOT NULL UNIQUE,
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_configurations ENABLE ROW LEVEL SECURITY;

-- RLS policies for hosts (admins can manage, users can view active)
CREATE POLICY "Admins can manage hosts" ON hosts
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view active hosts" ON hosts
  FOR SELECT USING (is_active = true);

-- RLS policies for availability_templates (admins only)
CREATE POLICY "Admins can manage availability templates" ON availability_templates
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS policies for time_slots (admins can manage, users can view available)
CREATE POLICY "Admins can manage time slots" ON time_slots
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view available time slots" ON time_slots
  FOR SELECT USING (is_available = true);

-- RLS policies for bookings (users see own, admins see all) - Fixed type casting
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bookings" ON bookings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS policies for session_configurations (everyone can read, admins can manage)
CREATE POLICY "Everyone can view session configurations" ON session_configurations
  FOR SELECT TO authenticated, anon USING (is_active = true);

CREATE POLICY "Admins can manage session configurations" ON session_configurations
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_hosts_updated_at
  BEFORE UPDATE ON hosts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_availability_templates_updated_at
  BEFORE UPDATE ON availability_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON time_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_session_configurations_updated_at
  BEFORE UPDATE ON session_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert default session configurations with ₹ pricing
INSERT INTO session_configurations (session_type, duration_minutes, price, description) VALUES
('playpath', 60, 4999.00, 'PlayPath Session - Guided play therapy session'),
('consultation', 30, 2499.00, 'Consultation - Expert guidance session');

-- Function to generate time slots from availability templates
CREATE OR REPLACE FUNCTION generate_time_slots_for_next_30_days()
RETURNS void AS $$
DECLARE
  template_record availability_templates%ROWTYPE;
  current_date DATE := CURRENT_DATE;
  end_date DATE := CURRENT_DATE + INTERVAL '30 days';
  slot_date DATE;
  slot_start_time TIMESTAMP WITH TIME ZONE;
  slot_end_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Clear existing generated slots for the next 30 days
  DELETE FROM time_slots 
  WHERE start_time >= current_date 
    AND start_time < end_date 
    AND generated_from_template_id IS NOT NULL;

  -- Generate slots for each active template
  FOR template_record IN 
    SELECT * FROM availability_templates 
    WHERE is_active = true
  LOOP
    slot_date := current_date;
    
    -- Find the first occurrence of the target day of week
    WHILE EXTRACT(DOW FROM slot_date) != template_record.day_of_week AND slot_date < end_date LOOP
      slot_date := slot_date + INTERVAL '1 day';
    END LOOP;
    
    -- Generate slots for this day of week for the next 30 days
    WHILE slot_date < end_date LOOP
      slot_start_time := slot_date + template_record.start_time;
      slot_end_time := slot_date + template_record.end_time;
      
      -- Insert the slot if it doesn't already exist
      INSERT INTO time_slots (
        host_id, 
        session_type, 
        start_time, 
        end_time, 
        generated_from_template_id
      ) VALUES (
        template_record.host_id,
        template_record.session_type,
        slot_start_time,
        slot_end_time,
        template_record.id
      )
      ON CONFLICT DO NOTHING;
      
      -- Move to next week
      slot_date := slot_date + INTERVAL '7 days';
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
