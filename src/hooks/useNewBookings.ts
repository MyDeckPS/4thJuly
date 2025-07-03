
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface NewBooking {
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
}

export interface CreateBookingData {
  user_id: string;
  session_type: 'playpath' | 'consultation';
  start_time: string;
  end_time: string;
  special_notes?: string | null;
  payment_status?: string;
  payment_id?: string | null;
  amount_paid?: number | null;
  booking_status?: string;
}

export const useUserNewBookings = () => {
  return useQuery({
    queryKey: ['user-new-bookings'],
    queryFn: async () => {
      console.log('Fetching user bookings...');
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user bookings:', error);
        throw error;
      }

      console.log('Fetched user bookings:', data);
      return data as NewBooking[];
    },
  });
};

export const useCreateNewBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bookingData: CreateBookingData) => {
      console.log('Creating booking:', bookingData);
      
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        throw error;
      }

      console.log('Created booking:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-new-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
      toast({
        title: "Success",
        description: "Booking created successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to create booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });
};
