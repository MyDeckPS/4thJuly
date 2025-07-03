
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BookingDetailsWithHost {
  id: string;
  user_id: string;
  session_type: 'playpath' | 'consultation';
  start_time: string;
  end_time: string;
  special_notes: string | null;
  payment_status: string;
  payment_id: string | null;
  amount_paid: number | null;
  booking_status: string;
  meeting_link: string | null;
  host_notes: string | null;
  rescheduled_from: string | null;
  created_at: string;
  updated_at: string;
  host?: {
    id: string;
    name: string;
    bio: string | null;
    profile_image_url: string | null;
    email: string | null;
  } | null;
}

export const useBookingDetails = (bookingId: string) => {
  return useQuery({
    queryKey: ['booking-details', bookingId],
    queryFn: async () => {
      console.log(`Fetching booking details for: ${bookingId}`);
      
      // Get current user to ensure they can access this booking
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First, get the booking details
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingError) {
        console.error('Error fetching booking details:', bookingError);
        throw bookingError;
      }

      // Check if user owns this booking or is admin
      if (booking.user_id !== user.id) {
        // Check if user is admin
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        const isAdmin = userRoles?.some(role => role.role === 'admin');
        if (!isAdmin) {
          throw new Error('You do not have permission to view this booking');
        }
      }

      // Then, try to get the host details if there's a host relationship
      let hostData = null;
      try {
        const { data: host, error: hostError } = await supabase
          .from('host')
          .select('id, name, bio, profile_image_url, email')
          .eq('is_active', true)
          .single();

        if (!hostError && host) {
          hostData = host;
        }
      } catch (hostError) {
        console.log('No host found or error fetching host:', hostError);
        // Continue without host data
      }

      const result: BookingDetailsWithHost = {
        ...booking,
        host: hostData
      };

      console.log('Fetched booking details:', result);
      return result;
    },
    enabled: !!bookingId,
  });
};
