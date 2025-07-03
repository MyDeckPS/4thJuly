
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentData {
  amount: number;
  paymentId: string;
  orderType: 'booking';
  bookingId?: string;
  sessionType?: 'playpath';
}

export const usePayment = () => {
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();

  const processPayment = async (data: PaymentData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setProcessing(true);
    
    try {
      console.log('Processing payment:', data);

      if (data.orderType === 'booking') {
        // For booking payments, the transaction will be created by the booking hook
        // We just need to ensure the booking gets the payment information
        console.log('Booking payment processed successfully');
      }

      toast.success('Payment processed successfully!');
      return { success: true };

    } catch (error: any) {
      console.error('Payment processing error:', error);
      toast.error(error.message || 'Payment processing failed');
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  return {
    processPayment,
    processing
  };
};
