
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Clock, User, Crown } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currency";

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    id: string;
    sessionType: 'playpath' | 'consultation';
    startTime: string;
    endTime: string;
    amount: number;
    paymentId?: string;
  };
  onManageBooking: () => void;
}

const BookingSuccessModal = ({ 
  isOpen, 
  onClose, 
  bookingDetails, 
  onManageBooking 
}: BookingSuccessModalProps) => {
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Booking Confirmed!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-center">
          <div className="bg-green-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Badge variant={bookingDetails.sessionType === 'playpath' ? 'default' : 'secondary'}>
                {bookingDetails.sessionType === 'playpath' ? 'PlayPath Session' : 'Consultation'}
              </Badge>
              {bookingDetails.sessionType === 'consultation' && <Crown className="w-4 h-4 text-amber-500" />}
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2 justify-center">
                <Calendar className="w-4 h-4" />
                <span>{formatDateTime(bookingDetails.startTime)}</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Clock className="w-4 h-4" />
                <span>
                  {format(new Date(bookingDetails.startTime), 'h:mm a')} - 
                  {format(new Date(bookingDetails.endTime), 'h:mm a')}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-green-200">
              <div className="text-lg font-semibold text-green-800">
                {bookingDetails.amount === 0 ? 'Free Session' : formatCurrency(bookingDetails.amount)}
              </div>
              {bookingDetails.paymentId && (
                <div className="text-xs text-green-600">
                  Payment ID: {bookingDetails.paymentId}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your session has been confirmed. You'll receive further details about session preparation and meeting links.
            </p>
            
            <div className="flex gap-3">
              <Button 
                onClick={onManageBooking}
                className="flex-1 bg-warm-sage hover:bg-forest"
              >
                Manage Booking
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingSuccessModal;
