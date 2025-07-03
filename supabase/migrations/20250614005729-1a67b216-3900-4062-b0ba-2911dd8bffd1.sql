
-- Add new fields to the bookings table for enhanced functionality
ALTER TABLE public.bookings 
ADD COLUMN meeting_link text,
ADD COLUMN host_notes text,
ADD COLUMN rescheduled_from uuid REFERENCES public.bookings(id);

-- Add index for performance on rescheduled_from lookups
CREATE INDEX idx_bookings_rescheduled_from ON public.bookings(rescheduled_from);

-- Add comments for documentation
COMMENT ON COLUMN public.bookings.meeting_link IS 'Meeting link for confirmed/rescheduled sessions';
COMMENT ON COLUMN public.bookings.host_notes IS 'Optional notes from host to user';
COMMENT ON COLUMN public.bookings.rescheduled_from IS 'Reference to original booking if this is a rescheduled session';
