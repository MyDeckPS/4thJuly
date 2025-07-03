
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CreateTestTransactionData {
  amount: number;
  sourceType: 'playpath_session' | 'consultation_session' | 'premium_membership';
  paymentStatus: string;
  paymentGatewayId?: string;
}

export const useTestSalesTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createTestTransaction = useMutation({
    mutationFn: async (data: CreateTestTransactionData) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Creating test transaction:', data);

      // Generate sales ID
      const { data: salesId, error: salesIdError } = await supabase.rpc('generate_sales_id');
      if (salesIdError) {
        console.error('Error generating sales ID:', salesIdError);
        throw salesIdError;
      }

      // Create test transaction
      const transactionData = {
        sales_id: salesId,
        user_id: user.id,
        amount: data.amount,
        source_type: data.sourceType,
        payment_status: data.paymentStatus,
        payment_gateway_id: data.paymentGatewayId || `test_${Date.now()}`,
        payment_gateway_data: {
          test_transaction: true,
          created_at: new Date().toISOString(),
          amount: data.amount,
          currency: 'INR'
        }
      };

      const { data: transaction, error } = await supabase
        .from('sales_transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) {
        console.error('Error creating test transaction:', error);
        throw error;
      }

      console.log('Test transaction created successfully:', transaction);
      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-transactions'] });
    }
  });

  return {
    createTestTransaction: createTestTransaction.mutateAsync,
    isCreating: createTestTransaction.isPending
  };
};
