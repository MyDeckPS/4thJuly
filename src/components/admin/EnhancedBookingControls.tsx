
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Link, MessageSquare } from "lucide-react";
import { useUpdateBooking } from "@/hooks/useBookings";
import type { Booking } from "@/hooks/useBookings";

interface EnhancedBookingControlsProps {
  booking: Booking;
  onDebugLog: (message: string) => void;
}

const EnhancedBookingControls = ({ booking, onDebugLog }: EnhancedBookingControlsProps) => {
  const [meetingLink, setMeetingLink] = useState(booking.meeting_link || '');
  const [hostNotes, setHostNotes] = useState(booking.host_notes || '');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const updateBooking = useUpdateBooking();

  const handleStatusUpdate = async (newStatus: string) => {
    onDebugLog(`Attempting to update booking ${booking.id} status to ${newStatus}`);
    
    try {
      const updateData: any = { booking_status: newStatus };
      
      // If status is not confirmed or rescheduled, remove meeting link
      if (newStatus !== 'confirmed' && newStatus !== 'rescheduled') {
        updateData.meeting_link = null;
        setMeetingLink('');
        onDebugLog(`Removing meeting link for status: ${newStatus}`);
      }

      await updateBooking.mutateAsync({
        id: booking.id,
        ...updateData
      });
      
      onDebugLog(`Successfully updated booking ${booking.id} status to ${newStatus}`);
    } catch (error) {
      onDebugLog(`Error updating booking status: ${error}`);
    }
  };

  const handlePaymentStatusUpdate = async (newStatus: string) => {
    onDebugLog(`Attempting to update booking ${booking.id} payment status to ${newStatus}`);
    
    try {
      await updateBooking.mutateAsync({
        id: booking.id,
        payment_status: newStatus
      });
      
      onDebugLog(`Successfully updated booking ${booking.id} payment status to ${newStatus}`);
    } catch (error) {
      onDebugLog(`Error updating payment status: ${error}`);
    }
  };

  const handleMeetingLinkUpdate = async () => {
    if (booking.booking_status !== 'confirmed' && booking.booking_status !== 'rescheduled') {
      onDebugLog(`Cannot add meeting link - booking status is ${booking.booking_status}`);
      return;
    }

    onDebugLog(`Attempting to update meeting link for booking ${booking.id}`);
    
    try {
      await updateBooking.mutateAsync({
        id: booking.id,
        meeting_link: meetingLink || null
      });
      
      onDebugLog(`Successfully updated meeting link for booking ${booking.id}`);
    } catch (error) {
      onDebugLog(`Error updating meeting link: ${error}`);
    }
  };

  const handleHostNotesUpdate = async () => {
    onDebugLog(`Attempting to update host notes for booking ${booking.id}`);
    
    try {
      await updateBooking.mutateAsync({
        id: booking.id,
        host_notes: hostNotes || null
      });
      
      onDebugLog(`Successfully updated host notes for booking ${booking.id}`);
    } catch (error) {
      onDebugLog(`Error updating host notes: ${error}`);
    }
  };

  const handleReschedule = async () => {
    if (!newStartTime || !newEndTime) {
      onDebugLog('Cannot reschedule - start time and end time are required');
      return;
    }

    onDebugLog(`Attempting to reschedule booking ${booking.id} to ${newStartTime} - ${newEndTime}`);
    
    try {
      await updateBooking.mutateAsync({
        id: booking.id,
        start_time: newStartTime,
        end_time: newEndTime,
        booking_status: 'rescheduled',
        rescheduled_from: booking.id
      });
      
      onDebugLog(`Successfully rescheduled booking ${booking.id}`);
      setNewStartTime('');
      setNewEndTime('');
    } catch (error) {
      onDebugLog(`Error rescheduling booking: ${error}`);
    }
  };

  const canShowMeetingLink = booking.booking_status === 'confirmed' || booking.booking_status === 'rescheduled';

  return (
    <div className="space-y-6">
      {/* Status Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Booking Status</Label>
          <Select value={booking.booking_status} onValueChange={handleStatusUpdate}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
              <SelectItem value="rescheduled">Rescheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Payment Status</Label>
          <Select value={booking.payment_status} onValueChange={handlePaymentStatusUpdate}>
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

      {/* Meeting Link */}
      {canShowMeetingLink && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Link className="w-4 h-4" />
            Meeting Link
          </Label>
          <div className="flex gap-2">
            <Input
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="Enter meeting link for the session"
              className="flex-1"
            />
            <Button onClick={handleMeetingLinkUpdate} disabled={updateBooking.isPending}>
              {meetingLink && booking.meeting_link !== meetingLink ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {/* Host Notes */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Message to User
        </Label>
        <Textarea
          value={hostNotes}
          onChange={(e) => setHostNotes(e.target.value)}
          placeholder="Optional message that will be visible to the user"
          rows={3}
        />
        <Button onClick={handleHostNotesUpdate} disabled={updateBooking.isPending} size="sm">
          {hostNotes && booking.host_notes !== hostNotes ? 'Update Message' : 'Save Message'}
        </Button>
      </div>

      {/* Reschedule */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Reschedule Session
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">New Start Time</Label>
            <Input
              type="datetime-local"
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">New End Time</Label>
            <Input
              type="datetime-local"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
            />
          </div>
        </div>
        <Button 
          onClick={handleReschedule} 
          disabled={updateBooking.isPending || !newStartTime || !newEndTime}
          size="sm"
          variant="outline"
        >
          Reschedule Session
        </Button>
      </div>
    </div>
  );
};

export default EnhancedBookingControls;
