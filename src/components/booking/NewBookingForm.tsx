import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User, Crown, CreditCard } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useCreateBooking } from "@/hooks/useBookings";
import { useAuth } from "@/contexts/AuthContext";
import { usePricingLogic } from "@/hooks/usePricingLogic";
import { usePayment } from "@/hooks/usePayment";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/currency";
import PaymentModal from "@/components/payment/PaymentModal";
import BookingSuccessModal from "./BookingSuccessModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface NewBookingFormProps {
  selectedSlot: any;
  selectedDate: Date;
  sessionConfig: any;
  host: any;
  onBack: () => void;
  onSuccess: (bookingId: string) => void;
}

const NewBookingForm = ({ selectedSlot, selectedDate, sessionConfig, host, onBack, onSuccess }: NewBookingFormProps) => {
  const { user } = useAuth();
  const { profile, quizResponses } = useProfile();
  const pricingLogic = usePricingLogic();
  const createBooking = useCreateBooking();
  const { processPayment, processing } = usePayment();

  const [specialNotes, setSpecialNotes] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string>('');

  const childName = quizResponses.childName || '';
  const sessionPrice = pricingLogic.price;

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const handleBookingSubmit = async () => {
    if (!user) {
      toast.error('Please log in to book a session');
      return;
    }

    try {
      console.log('Creating booking...');
      
      const bookingData = {
        user_id: user.id,
        session_type: 'consultation' as const,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        special_notes: specialNotes,
        amount_paid: sessionPrice,
        payment_status: 'pending',
        booking_status: 'confirmed' as const,
      };

      const booking = await createBooking.mutateAsync(bookingData);
      setCurrentBookingId(booking.id);

      // Paid session - show payment modal
      setShowPaymentModal(true);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(`Failed to create booking: ${error.message}`);
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
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error updating booking after payment:', error);
      toast.error(`Payment successful but booking update failed: ${error.message}`);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    toast.error(`Payment failed: ${error}`);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onSuccess(currentBookingId);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-soft">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Button variant="ghost" onClick={onBack} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Time Slots
              </Button>
              <h1 className="text-3xl font-bold text-forest mb-2">Complete Your Booking</h1>
              <p className="text-muted-foreground">
                Please provide the required information to complete your PlayPath session booking.
              </p>
            </div>

            {/* Session Summary */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-forest">Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Consultation</Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-warm-sage" />
                    <div>
                      <p className="font-medium">{formatDate(selectedDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-warm-sage" />
                    <div>
                      <p className="font-medium">
                        {formatTime(new Date(selectedSlot.start_time))} - {formatTime(new Date(selectedSlot.end_time))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-warm-sage" />
                    <div>
                      <p className="font-medium">
                        {formatCurrency(sessionPrice)}
                      </p>
                    </div>
                  </div>

                  {host && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-warm-sage" />
                      <div>
                        <p className="font-medium">{host.name}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">{sessionConfig?.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-forest">Booking Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="childName">Child's Name</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="font-medium">{childName || 'Not provided'}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This helps our host personalize the session for your child.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialNotes">Special Notes (Optional)</Label>
                    <Textarea
                      id="specialNotes"
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="Any special requirements, preferences, or information about your child that would help the host..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Share any relevant information that will help us provide the best experience for your child.
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-xl font-bold text-forest">
                        {formatCurrency(sessionPrice)}
                      </span>
                    </div>
                    
                    <Button 
                      onClick={handleBookingSubmit}
                      className="w-full bg-warm-sage hover:bg-forest"
                      disabled={createBooking.isPending || processing}
                    >
                      {createBooking.isPending ? 'Booking...' : 'Book & Pay'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={sessionPrice}
        description="Consultation Session"
        orderType="booking"
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />

      {/* Success Modal - Fixed props */}
      <BookingSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        bookingDetails={{
          id: currentBookingId,
          sessionType: 'consultation',
          startTime: selectedSlot.start_time,
          endTime: selectedSlot.end_time,
          amount: sessionPrice
        }}
        onManageBooking={() => {
          handleSuccessClose();
          // Navigate to manage booking or similar action
        }}
      />
    </>
  );
};

export default NewBookingForm;
