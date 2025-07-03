import { Button } from "@/components/ui/button";
import { BookingData } from "../BookingDialog";
import { format } from "date-fns";
import { CheckCircle, Calendar, Clock, User } from "lucide-react";

interface ConfirmationStepProps {
  bookingData: BookingData;
  onClose: () => void;
}

export const ConfirmationStep = ({ bookingData, onClose }: ConfirmationStepProps) => {
  const formatSlotTime = (slot: any) => {
    if (!slot) return '';
    const startTime = new Date(slot.start_time);
    const endTime = new Date(slot.end_time);
    return `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
  };

  return (
    <div className="space-y-6 p-4 text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground">
          Your consultation has been successfully booked. You'll receive a confirmation email shortly.
        </p>
      </div>

      <div className="bg-green-50 rounded-lg p-6 text-left max-w-md mx-auto border border-green-200">
        <h3 className="font-semibold mb-4 text-center">Your Appointment Details</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium">
                {bookingData.date ? format(bookingData.date, "EEEE, MMMM d, yyyy") : ""}
              </p>
              <p className="text-sm text-muted-foreground">Date</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium">{formatSlotTime(bookingData.timeSlot)}</p>
              <p className="text-sm text-muted-foreground">Time ({bookingData.sessionConfig?.duration_minutes || 30} minutes)</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium">{bookingData.host?.name || 'Expert Consultant'}</p>
              <p className="text-sm text-muted-foreground">Your Expert</p>
            </div>
          </div>

          {bookingData.childName && (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">
                C
              </div>
              <div>
                <p className="font-medium">{bookingData.childName}</p>
                <p className="text-sm text-muted-foreground">Child ({bookingData.childAge})</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>📧 Check your email for meeting details and preparation tips</p>
        <p>📱 You'll receive a reminder 24 hours before your session</p>
        <p>❓ Questions? Contact our support team</p>
      </div>

      <Button onClick={onClose} className="w-full max-w-xs bg-orange-500 hover:bg-orange-600">
        Close
      </Button>
    </div>
  );
}; 