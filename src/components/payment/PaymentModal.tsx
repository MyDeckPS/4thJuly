
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Shield, CheckCircle } from "lucide-react";
import { loadRazorpayScript, RAZORPAY_CONFIG, RazorpayOptions, RazorpayResponse } from "@/lib/razorpay";
import { formatCurrency } from "@/utils/currency";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  onSuccess: (paymentId: string) => void;
  onError?: (error: string) => void;
  orderType: 'booking' | 'membership';
}

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  description, 
  onSuccess, 
  onError,
  orderType 
}: PaymentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile();

  const handlePayment = async () => {
    if (!user) {
      onError?.("Please log in to continue with payment");
      return;
    }

    setLoading(true);
    
    try {
      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }
      setScriptLoaded(true);

      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: RAZORPAY_CONFIG.keyId,
        amount: Math.round(amount * 100), // Convert to paisa
        currency: 'INR',
        name: 'MyDeck Club',
        description: description,
        prefill: {
          name: profile?.name || '',
          email: user.email || '',
        },
        theme: {
          color: '#16a085' // warm-sage color
        },
        handler: (response: RazorpayResponse) => {
          console.log('Payment successful:', response);
          onSuccess(response.razorpay_payment_id);
          onClose();
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            console.log('Payment modal dismissed');
          }
        }
      };

      // Create Razorpay instance and open checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error: any) {
      console.error('Payment error:', error);
      onError?.(error.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Complete Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-900">Order Summary</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{description}</span>
              <span className="font-semibold text-lg">{formatCurrency(amount)}</span>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Secured by Razorpay - Your payment information is encrypted and secure</span>
          </div>

          {/* Payment Features */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>UPI, Cards, Net Banking & Wallets supported</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Instant payment confirmation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>No hidden charges</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePayment}
              className="flex-1 bg-warm-sage hover:bg-forest"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay {formatCurrency(amount)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
