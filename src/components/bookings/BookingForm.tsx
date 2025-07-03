import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User, DollarSign } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useCreateBooking } from "@/hooks/useBookings";
import { useAuth } from "@/contexts/AuthContext";

interface BookingFormProps {
  timeSlot: any;
  sessionConfig: any;
  onBack: () => void;
  onSuccess: () => void;
}

const BookingForm = ({ timeSlot, sessionConfig, onBack, onSuccess }: BookingFormProps) => {
  const { user } = useAuth();
  const { quizResponses } = useProfile();
  const createBooking = useCreateBooking();

  const [formData, setFormData] = useState({
    childName: quizResponses.childName || '',
    specialNotes: '',
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    console.log('Submitting booking with data:', {
      user_id: user.id,
      session_type: 'consultation',
      start_time: timeSlot.start_time,
      end_time: timeSlot.end_time,
      special_notes: formData.specialNotes,
      amount_paid: sessionConfig?.price,
      payment_status: 'pending',
      booking_status: 'confirmed',
    });

    try {
      await createBooking.mutateAsync({
        user_id: user.id,
        session_type: 'consultation',
        start_time: timeSlot.start_time,
        end_time: timeSlot.end_time,
        special_notes: formData.specialNotes,
        amount_paid: sessionConfig?.price,
        payment_status: 'pending',
        booking_status: 'confirmed',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  return (
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
              Please provide the required information to complete your session booking.
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
                    <p className="font-medium">{formatDate(timeSlot.start_time)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warm-sage" />
                  <div>
                    <p className="font-medium">
                      {formatTime(timeSlot.start_time)} - {formatTime(timeSlot.end_time)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-warm-sage" />
                  <div>
                    <p className="font-medium">{formatPrice(sessionConfig?.price)}</p>
                  </div>
                </div>
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="childName">Child's Name *</Label>
                  <Input
                    id="childName"
                    value={formData.childName}
                    onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                    placeholder="Enter your child's name"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps our host personalize the session for your child.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialNotes">Special Notes (Optional)</Label>
                  <Textarea
                    id="specialNotes"
                    value={formData.specialNotes}
                    onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
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
                    <span className="text-xl font-bold text-forest">{formatPrice(sessionConfig?.price)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Payment will be processed separately. You'll receive booking confirmation immediately.
                  </p>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-warm-sage hover:bg-forest"
                    disabled={createBooking.isPending}
                  >
                    {createBooking.isPending ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
