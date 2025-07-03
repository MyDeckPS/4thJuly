import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookingData } from "../BookingDialog";
import { format } from "date-fns";
import { CreditCard, Lock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateBooking } from "@/hooks/useBookings";
import { usePricingLogic } from "@/hooks/usePricingLogic";
import { usePayment } from "@/hooks/usePayment";
import { formatCurrency } from "@/utils/currency";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PaymentModal from "@/components/payment/PaymentModal";

interface PaymentStepProps {
  bookingData: BookingData;
  onNext: () => void;
  onBack: () => void;
}

export const PaymentStep = ({ bookingData, onNext, onBack }: PaymentStepProps) => {
  const { user } = useAuth();
  const createBooking = useCreateBooking();
  const pricingLogic = usePricingLogic();
  const { processPayment, processing } = usePayment();
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string>('');
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  const sessionPrice = bookingData.sessionConfig?.price_per_session || pricingLogic.price || 499;

  const formatSlotTime = (slot: any) => {
    if (!slot) return '';
    const startTime = new Date(slot.start_time);
    const endTime = new Date(slot.end_time);
    return `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
  };

  const handleCreateBooking = async () => {
    if (!user) {
      toast.error('Please log in to book a session');
      return;
    }

    if (!bookingData.timeSlot) {
      toast.error('Please select a time slot');
      return;
    }

    setIsCreatingBooking(true);
    try {
      const bookingPayload = {
        user_id: user.id,
        session_type: 'consultation' as const,
        start_time: bookingData.timeSlot.start_time,
        end_time: bookingData.timeSlot.end_time,
        special_notes: [
          `Child: ${bookingData.childName}`,
          `Age: ${bookingData.childAge}`,
          `Concerns: ${bookingData.concerns}`,
          bookingData.specialNotes ? `Special Notes: ${bookingData.specialNotes}` : ''
        ].filter(Boolean).join('\n'),
        amount_paid: sessionPrice,
        payment_status: 'pending',
        booking_status: 'confirmed' as const,
      };

      const booking = await createBooking.mutateAsync(bookingPayload);
      setCurrentBookingId(booking.id);
      
      // Show payment modal
      setShowPaymentModal(true);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(`Failed to create booking: ${error.message}`);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      // Update booking with payment info
      await supabase
        .from('bookings')
        .update({
          payment_id: paymentId,
          payment_status: 'completed'
        })
        .eq('id', currentBookingId);

      setShowPaymentModal(false);
      onNext(); // Move to confirmation step
    } catch (error: any) {
      console.error('Error updating booking after payment:', error);
      toast.error(`Payment successful but booking update failed: ${error.message}`);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    toast.error(`Payment failed: ${error}`);
  };

  return (
    <>
      <div className="space-y-6 p-4">
        {/* Booking Summary */}
        <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
          <h3 className="font-semibold mb-4">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-medium">
                {bookingData.date ? format(bookingData.date, "EEEE, MMMM d, yyyy") : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="font-medium">{formatSlotTime(bookingData.timeSlot)}</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-medium">Consultation Session</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">{bookingData.sessionConfig?.duration_minutes || 30} minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Expert:</span>
              <span className="font-medium">{bookingData.host?.name || 'Expert Consultant'}</span>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(sessionPrice)}</span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5" />
            <h3 className="font-semibold">Payment Information</h3>
            <Lock className="w-4 h-4 text-muted-foreground ml-auto" />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Secure Payment Processing</span>
            </div>
            <p className="text-sm text-blue-600 mt-2">
              Your payment will be processed securely through Razorpay. Click "Proceed to Payment" to complete your booking.
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} className="hover:bg-gray-50">
            Back
          </Button>
          <Button 
            onClick={handleCreateBooking} 
            disabled={isCreatingBooking}
            className="min-w-[160px] bg-orange-500 hover:bg-orange-600"
          >
            {isCreatingBooking ? "Creating Booking..." : `Proceed to Payment (${formatCurrency(sessionPrice)})`}
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={sessionPrice}
          description={`Consultation Session - ${formatSlotTime(bookingData.timeSlot)}`}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          orderType="booking"
        />
      )}
    </>
  );
}; 