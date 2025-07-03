
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { formatCurrency } from "@/utils/currency";

const AllBookingsPage = () => {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles!inner(name)
        `)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center py-8">Loading bookings...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'cancelled': return 'destructive';
      case 'completed': return 'secondary';
      default: return 'outline';
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getProfileName = (profiles: any) => {
    if (Array.isArray(profiles) && profiles.length > 0) {
      return profiles[0]?.name || 'N/A';
    }
    if (profiles && typeof profiles === 'object' && 'name' in profiles) {
      return profiles.name || 'N/A';
    }
    return 'N/A';
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/bookings">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Bookings
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-forest">All Bookings</h1>
              <p className="text-muted-foreground">Complete booking history</p>
            </div>
          </div>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground">There are no bookings in the system yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-forest flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          PlayPath Session
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={getStatusBadgeVariant(booking.booking_status)}>
                            {booking.booking_status}
                          </Badge>
                          <Badge variant={getPaymentStatusBadgeVariant(booking.payment_status)}>
                            {booking.payment_status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-forest">
                          {formatCurrency(Number(booking.amount_paid) || 0)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-warm-sage" />
                        <div>
                          <p className="font-medium">
                            {format(new Date(booking.start_time), 'PPP')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.start_time), 'p')} - {format(new Date(booking.end_time), 'p')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-warm-sage" />
                        <div>
                          <p className="font-medium">
                            {getProfileName(booking.profiles)}
                          </p>
                          <p className="text-sm text-muted-foreground">Participant</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-warm-sage rounded-full" />
                        <div>
                          <p className="font-medium">Booking ID</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {booking.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </div>

                    {booking.special_notes && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Special Notes:</p>
                        <p className="text-sm text-gray-600">{booking.special_notes}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-sm text-muted-foreground">
                        Created {format(new Date(booking.created_at), 'PPp')}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/booking-details/${booking.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AllBookingsPage;
