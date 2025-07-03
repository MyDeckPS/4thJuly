
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User, MapPin, CreditCard, Phone, Mail, FileText } from "lucide-react";
import { useBookingDetails } from "@/hooks/useBookingDetails";
import { format } from "date-fns";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const BookingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: booking, isLoading, error } = useBookingDetails(id || '');

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4 pt-20 md:pt-24">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-warm-sage border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading booking details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4 pt-20 md:pt-24">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold text-forest mb-2">Booking Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The booking you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link to="/booking">Back to Bookings</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24 pb-8">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" asChild className="flex items-center gap-2">
              <Link to="/booking">
                <ArrowLeft className="w-4 h-4" />
                Back to Bookings
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-forest">Booking Details</h1>
          </div>

          {/* Main Booking Info */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-forest mb-2">
                    {booking.session_type === 'playpath' ? 'PlayPath Session' : 'Consultation Session'}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getStatusColor(booking.booking_status)}>
                      {booking.booking_status}
                    </Badge>
                    <Badge className={getPaymentStatusColor(booking.payment_status)}>
                      Payment: {booking.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-warm-sage" />
                  <div>
                    <p className="text-sm text-muted-foreground">Session Date & Time</p>
                    <p className="font-medium">
                      {format(new Date(booking.start_time), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-warm-sage" />
                  <div>
                    <p className="text-sm text-muted-foreground">Booked On</p>
                    <p className="font-medium">
                      {format(new Date(booking.created_at), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>

                {booking.amount_paid && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-warm-sage" />
                    <div>
                      <p className="text-sm text-muted-foreground">Amount Paid</p>
                      <p className="font-medium">₹{booking.amount_paid.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>

              {booking.special_notes && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-warm-sage mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Special Notes</p>
                    <p className="font-medium">{booking.special_notes}</p>
                  </div>
                </div>
              )}

              {booking.meeting_link && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-warm-sage" />
                  <div>
                    <p className="text-sm text-muted-foreground">Meeting Link</p>
                    <a 
                      href={booking.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-warm-sage hover:underline"
                    >
                      Join Session
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Host Information */}
          {booking.host && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Your Host
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  {booking.host.profile_image_url ? (
                    <img
                      src={booking.host.profile_image_url}
                      alt={booking.host.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-warm-sage/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-warm-sage" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-forest">{booking.host.name}</h3>
                    {booking.host.bio && (
                      <p className="text-muted-foreground mt-1">{booking.host.bio}</p>
                    )}
                    {booking.host.email && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{booking.host.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking Reference */}
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
              <p className="font-mono text-warm-sage font-medium">{booking.id}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BookingDetailsPage;
