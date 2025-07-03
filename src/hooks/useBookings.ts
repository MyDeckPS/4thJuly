import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Booking {
  id: string;
  user_id: string;
  session_type: 'consultation';
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
  session_type: 'consultation';
  start_time: string;
  end_time: string;
  special_notes?: string;
  amount_paid?: number;
  payment_status?: string;
  booking_status?: string;
}

export interface UpdateBookingData {
  booking_status?: string;
  payment_status?: string;
  meeting_link?: string | null;
  host_notes?: string | null;
  start_time?: string;
  end_time?: string;
  rescheduled_from?: string | null;
}

export const useAllBookings = () => {
  return useQuery({
    queryKey: ['all-bookings'],
    queryFn: async () => {
      console.log('Fetching all bookings...');
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }

      console.log('Fetched all bookings:', data);
      return data as Booking[];
    },
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: CreateBookingData) => {
      console.log('Creating booking with data:', bookingData);
      
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        throw error;
      }

      console.log('Created booking:', data);

      // Automatically create sales transaction if payment is completed
      if (data.payment_status === 'completed' && data.amount_paid) {
        try {
          console.log('Creating sales transaction for completed booking...');
          
          // Generate sales ID
          const { data: salesId, error: salesIdError } = await supabase.rpc('generate_sales_id');
          if (salesIdError) {
            console.error('Error generating sales ID:', salesIdError);
          } else {
            // Create sales transaction
            const transactionData = {
              sales_id: salesId,
              user_id: data.user_id,
              booking_id: data.id,
              amount: data.amount_paid,
              source_type: data.session_type === 'playpath' ? 'playpath_session' : 'consultation_session',
              payment_status: 'completed',
              payment_gateway_id: data.payment_id || `booking_${data.id}`
            };

            const { error: transactionError } = await supabase
              .from('sales_transactions')
              .insert([transactionData]);

            if (transactionError) {
              console.error('Error creating sales transaction:', transactionError);
            } else {
              console.log('Sales transaction created successfully for booking:', data.id);
            }
          }
        } catch (transactionErr) {
          console.error('Failed to create sales transaction:', transactionErr);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['sales-transactions'] });
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateBookingData & { id: string }) => {
      console.log(`Updating booking ${id} with data:`, updateData);
      
      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating booking:', error);
        throw error;
      }

      console.log('Updated booking:', data);

      // Create sales transaction if payment status changed to completed
      if (updateData.payment_status === 'completed' && data.amount_paid) {
        try {
          // Check if transaction already exists
          const { data: existingTransaction } = await supabase
            .from('sales_transactions')
            .select('id')
            .eq('booking_id', id)
            .single();

          if (!existingTransaction) {
            console.log('Creating sales transaction for updated booking...');
            
            // Generate sales ID
            const { data: salesId, error: salesIdError } = await supabase.rpc('generate_sales_id');
            if (salesIdError) {
              console.error('Error generating sales ID:', salesIdError);
            } else {
              // Create sales transaction
              const transactionData = {
                sales_id: salesId,
                user_id: data.user_id,
                booking_id: data.id,
                amount: data.amount_paid,
                source_type: data.session_type === 'playpath' ? 'playpath_session' : 'consultation_session',
                payment_status: 'completed',
                payment_gateway_id: data.payment_id || `booking_${data.id}`
              };

              const { error: transactionError } = await supabase
                .from('sales_transactions')
                .insert([transactionData]);

              if (transactionError) {
                console.error('Error creating sales transaction:', transactionError);
              } else {
                console.log('Sales transaction created successfully for updated booking:', data.id);
              }
            }
          }
        } catch (transactionErr) {
          console.error('Failed to create sales transaction:', transactionErr);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-details'] });
      queryClient.invalidateQueries({ queryKey: ['sales-transactions'] });
    },
  });
};

export const useUserBookings = () => {
  return useQuery({
    queryKey: ['user-bookings'],
    queryFn: async () => {
      console.log('Fetching current user bookings...');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user bookings:', error);
        throw error;
      }

      console.log('Fetched user bookings:', data);
      return data as Booking[];
    },
  });
};
