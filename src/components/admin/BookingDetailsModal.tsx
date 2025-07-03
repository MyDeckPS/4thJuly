
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, MessageSquare, DollarSign, Save, RefreshCw } from "lucide-react";
import { useUpdateBooking } from "@/hooks/useBookings";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BookingDetailsModalProps {
  booking: any;
  onClose: () => void;
  onUpdate: () => void;
}

const BookingDetailsModal = ({ booking, onClose, onUpdate }: BookingDetailsModalProps) => {
  const [hostNotes, setHostNotes] = useState(booking?.host_notes || "");
  const [meetingLink, setMeetingLink] = useState(booking?.meeting_link || "");
  const [bookingStatus, setBookingStatus] = useState(booking?.booking_status || "confirmed");
  const [paymentStatus, setPaymentStatus] = useState(booking?.payment_status || "pending");
  const [isSaving, setIsSaving] = useState(false);

  const updateBookingMutation = useUpdateBooking();
  const { toast } = useToast();

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "EEEE, do MMMM yyyy 'at' HH:mm");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBookingMutation.mutateAsync({
        id: booking.id,
        host_notes: hostNotes,
        meeting_link: meetingLink,
        booking_status: bookingStatus,
        payment_status: paymentStatus,
      });

      toast({
        title: "Success",
        description: "Booking updated successfully",
      });

      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReschedule = () => {
    // This would typically open a date/time picker
    toast({
      title: "Reschedule Feature",
      description: "Reschedule functionality would be implemented here",
    });
  };

  if (!booking) return null;

  return (
    <div className="space-y-6">
      {/* Booking Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Booking Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Booking ID</label>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">{booking.id}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">User ID</label>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">{booking.user_id}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Session Type</label>
              <Badge variant={booking.session_type === 'playpath' ? "default" : "secondary"}>
                {booking.session_type === 'playpath' ? 'PlayPath' : 'Consultation'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Amount Paid</label>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium">₹{booking.amount_paid || '0'}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Session Date & Time</label>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>{formatDateTime(booking.start_time)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Special Notes */}
      {booking.special_notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              User Special Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm">{booking.special_notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Management Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Booking Status</label>
              <Select value={bookingStatus} onValueChange={setBookingStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Status</label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Meeting Link</label>
            <Input
              placeholder="Enter meeting link for the session"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Message to User</label>
            <Textarea
              placeholder="Enter a message for the user (optional)"
              value={hostNotes}
              onChange={(e) => setHostNotes(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button 
          variant="outline" 
          onClick={handleReschedule}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reschedule Session
        </Button>
        
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
