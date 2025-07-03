
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SalesTransaction {
  id: string;
  sales_id: string;
  user_id: string;
  booking_id: string | null;
  amount: number;
  source_type: 'playpath_session' | 'product_purchase';
  payment_status: string;
  payment_gateway_id: string | null;
  payment_gateway_data: any;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string | null;
  };
  bookings?: {
    session_type: string;
    start_time: string;
  };
}

export interface SalesNote {
  id: string;
  transaction_id: string;
  note: string;
  note_type: 'admin' | 'razorpay' | 'system';
  created_by: string | null;
  created_at: string;
}

export const useSalesTransactions = () => {
  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ['sales-transactions'],
    queryFn: async () => {
      console.log('Fetching sales transactions...');
      
      // Check if user is admin first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user authenticated, returning empty array');
        return [];
      }

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      const isAdmin = userRoles?.some(role => role.role === 'admin');
      console.log('User is admin:', isAdmin);

      const { data, error } = await supabase
        .from('sales_transactions')
        .select(`
          *,
          profiles!sales_transactions_user_id_fkey (name),
          bookings!sales_transactions_booking_id_fkey (session_type, start_time)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sales transactions:', error);
        throw error;
      }
      
      console.log('Raw sales transactions data:', data);
      
      // Transform the data to match our interface
      const transformedData: SalesTransaction[] = (data || []).map(item => ({
        id: item.id,
        sales_id: item.sales_id,
        user_id: item.user_id,
        booking_id: item.booking_id,
        amount: item.amount,
        source_type: item.source_type as 'playpath_session' | 'product_purchase',
        payment_status: item.payment_status,
        payment_gateway_id: item.payment_gateway_id,
        payment_gateway_data: item.payment_gateway_data,
        created_at: item.created_at,
        updated_at: item.updated_at,
        profiles: item.profiles ? { name: item.profiles.name } : undefined,
        bookings: item.bookings ? { 
          session_type: item.bookings.session_type,
          start_time: item.bookings.start_time 
        } : undefined
      }));

      console.log('Transformed sales transactions:', transformedData);
      return transformedData;
    },
    retry: 3,
    retryDelay: 1000
  });

  if (error) {
    console.error('Sales transactions query error:', error);
  }

  return {
    transactions,
    isLoading,
    error
  };
};

export const useSalesNotes = (transactionId: string) => {
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['sales-notes', transactionId],
    queryFn: async () => {
      console.log('Fetching sales notes for transaction:', transactionId);
      
      const { data, error } = await supabase
        .from('sales_notes')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching sales notes:', error);
        throw error;
      }
      
      console.log('Sales notes data:', data);
      return (data || []) as SalesNote[];
    },
    enabled: !!transactionId
  });

  const addNote = useMutation({
    mutationFn: async ({ note, noteType = 'admin' }: { note: string; noteType?: string }) => {
      console.log('Adding note:', { transactionId, note, noteType });
      
      const { data, error } = await supabase
        .from('sales_notes')
        .insert({
          transaction_id: transactionId,
          note,
          note_type: noteType
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding note:', error);
        throw error;
      }
      
      console.log('Note added successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-notes', transactionId] });
      toast.success("Note added successfully");
    },
    onError: (error: any) => {
      console.error('Add note mutation error:', error);
      toast.error(`Failed to add note: ${error.message}`);
    }
  });

  return {
    notes,
    isLoading,
    addNote
  };
};
