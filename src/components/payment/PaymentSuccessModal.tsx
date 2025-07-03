
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Crown, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  paymentId: string;
  orderType: 'booking' | 'membership';
  onViewDetails?: () => void;
}

const PaymentSuccessModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  paymentId, 
  orderType,
  onViewDetails 
}: PaymentSuccessModalProps) => {
  const getSuccessMessage = () => {
    if (orderType === 'membership') {
      return {
        title: "Welcome to MyDeck Club Premium!",
        description: "Your premium membership has been activated successfully.",
        icon: <Crown className="w-12 h-12 text-amber-500" />
      };
    } else {
      return {
        title: "Booking Confirmed!",
        description: "Your session has been booked successfully.",
        icon: <Calendar className="w-12 h-12 text-green-500" />
      };
    }
  };

  const { title, description, icon } = getSuccessMessage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center">
        <div className="space-y-6 py-4">
          {/* Success Icon */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            {icon}
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-forest">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-semibold">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment ID</span>
              <span className="font-mono text-xs">{paymentId}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {onViewDetails && (
              <Button 
                onClick={onViewDetails}
                className="w-full bg-warm-sage hover:bg-forest"
              >
                {orderType === 'membership' ? 'Manage Membership' : 'View Booking Details'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Continue Exploring
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccessModal;
