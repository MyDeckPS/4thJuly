
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, User, AlertCircle, Plus, Eye } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { usePricingLogic } from "@/hooks/usePricingLogic";
import { formatCurrency } from "@/utils/currency";

const BookingsPage = () => {
  const { user } = useAuth();
  const pricingLogic = usePricingLogic();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please log in to view your bookings.
              </AlertDescription>
            </Alert>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center py-8">Loading your bookings...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading bookings. Please try again later.
              </AlertDescription>
            </Alert>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const now = new Date();
  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.start_time);
    switch (filter) {
      case 'upcoming':
        return bookingDate > now;
      case 'past':
        return bookingDate <= now;
      default:
        return true;
    }
  });

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

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-forest mb-4">My Bookings</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Manage your PlayPath session bookings
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button className="bg-warm-sage hover:bg-forest" asChild>
                <Link to="/booking/playpath">
                  <Plus className="w-4 h-4 mr-2" />
                  Book New Session
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/all-bookings">
                  <Eye className="w-4 h-4 mr-2" />
                  View All Bookings
                </Link>
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-warm-sage text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'upcoming'
                    ? 'bg-warm-sage text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'past'
                    ? 'bg-warm-sage text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Past
              </button>
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground mb-4">
                  {filter === 'all' 
                    ? "You haven't made any bookings yet." 
                    : `You have no ${filter} bookings.`}
                </p>
                <Button className="bg-warm-sage hover:bg-forest" asChild>
                  <Link to="/booking/playpath">Book Your First Session</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <p className="font-medium">PlayPath Session</p>
                          <p className="text-sm text-muted-foreground">Interactive Development</p>
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
                        Booked {format(new Date(booking.created_at), 'PPp')}
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

export default BookingsPage;
