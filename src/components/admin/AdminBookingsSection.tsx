import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Clock, User, MessageSquare, DollarSign, Edit, Search, Filter, CalendarDays, TrendingUp, Users } from "lucide-react";
import { useAllBookings } from "@/hooks/useBookings";
import BookingDetailsModal from "./BookingDetailsModal";
import DebugConsole from "./DebugConsole";
import { format, isThisWeek, isThisMonth, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay } from "date-fns";

const AdminBookingsSection = () => {
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionTypeFilter, setSessionTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const {
    data: bookings,
    isLoading
  } = useAllBookings();

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const formatSessionDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE do MMMM, h:mm a");
  };

  const formatSessionTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'rescheduled': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getSessionTypeBadge = () => 'Consultation';

  const getUserNameFromId = (userId: string) => {
    return `User ${userId.slice(0, 8)}`;
  };

  // Calculate weekly/monthly stats
  const getBookingStats = () => {
    if (!bookings) return { thisWeek: 0, thisMonth: 0, nextBooking: null };
    
    const now = new Date();
    const thisWeekBookings = bookings.filter(booking => 
      isThisWeek(new Date(booking.start_time)) && booking.booking_status === 'confirmed'
    );
    
    const thisMonthBookings = bookings.filter(booking => 
      isThisMonth(new Date(booking.start_time)) && booking.booking_status === 'confirmed'
    );

    const upcomingBookings = bookings
      .filter(booking => new Date(booking.start_time) > now && booking.booking_status === 'confirmed')
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    return {
      thisWeek: thisWeekBookings.length,
      thisMonth: thisMonthBookings.length,
      nextBooking: upcomingBookings[0] || null
    };
  };

  // Get bookings for selected date
  const getBookingsForDate = (date: Date) => {
    if (!bookings) return [];
    return bookings.filter(booking => 
      isSameDay(new Date(booking.start_time), date)
    );
  };

  // Filter bookings based on search and filters
  const filteredBookings = bookings?.filter(booking => {
    const userName = getUserNameFromId(booking.user_id);
    const matchesSearch = !searchQuery || 
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSessionType = sessionTypeFilter === 'all' || 
      booking.session_type === sessionTypeFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      booking.booking_status === statusFilter;

    return matchesSearch && matchesSessionType && matchesStatus;
  }) || [];

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
    addDebugLog(`Opened details for booking ${booking.id}`);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    addDebugLog('Closed booking details modal');
  };

  const stats = getBookingStats();
  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-none shadow-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <CalendarDays className="h-6 w-6" />
              Bookings Management
            </CardTitle>
          </CardHeader>
        </Card>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <CalendarDays className="h-6 w-6" />
                Bookings Management
              </CardTitle>
              <p className="text-pink-100 mt-1">Manage and track all session bookings</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{filteredBookings.length}</div>
              <div className="text-pink-100 text-sm">
                {filteredBookings.length !== bookings?.length ? 'Filtered' : 'Total'} Bookings
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                {viewMode === 'week' ? 'This Week' : 'This Month'}
              </CardTitle>
              <Select value={viewMode} onValueChange={(value: "week" | "month") => setViewMode(value)}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">
                {viewMode === 'week' ? stats.thisWeek : stats.thisMonth}
              </span>
              <span className="text-sm text-gray-500">bookings</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Next Booking</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.nextBooking ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">
                    {format(new Date(stats.nextBooking.start_time), "MMM d, h:mm a")}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {getUserNameFromId(stats.nextBooking.user_id)} - {getSessionTypeBadge()}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No upcoming bookings</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold">
                {new Set(bookings?.map(b => b.user_id) || []).size}
              </span>
              <span className="text-sm text-gray-500">unique users</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar and Booking Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              30-Day Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasBookings: (date) => getBookingsForDate(date).length > 0
              }}
              modifiersStyles={{
                hasBookings: { 
                  backgroundColor: '#fecaca', 
                  color: '#dc2626',
                  fontWeight: 'bold'
                }
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bookings for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Selected Date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateBookings.length > 0 ? (
              <div className="space-y-3">
                {selectedDateBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{getUserNameFromId(booking.user_id)}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Badge variant="default" className="text-xs">
                          Consultation
                        </Badge>
                        <span>{formatSessionTime(booking.start_time)}</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetails(booking)}
                    >
                      Manage
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No bookings for this date
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by user name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={sessionTypeFilter} onValueChange={setSessionTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Session Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Session Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Session Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{getUserNameFromId(booking.user_id)}</div>
                          <div className="text-xs text-gray-500">ID: {booking.user_id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="default" className="text-xs">
                        Consultation
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(booking.booking_status)}>
                        {booking.booking_status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{formatSessionDateTime(booking.start_time)}</div>
                          <div className="text-xs text-gray-500">Session Time</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">₹{booking.amount_paid || '0'}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Dialog open={isModalOpen && selectedBooking?.id === booking.id} onOpenChange={(open) => {
                        if (!open) handleModalClose();
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(booking)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Booking Management</DialogTitle>
                          </DialogHeader>
                          <BookingDetailsModal 
                            booking={selectedBooking} 
                            onClose={handleModalClose}
                            onUpdate={() => {
                              window.location.reload();
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <CalendarDays className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || sessionTypeFilter !== 'all' || statusFilter !== 'all' 
                  ? 'No bookings match your filters' 
                  : 'No bookings found'
                }
              </h3>
              <p className="text-gray-500">
                {searchQuery || sessionTypeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'Bookings will appear here once users start making reservations'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <DebugConsole module="enhanced-bookings" logs={debugLogs} onClear={() => setDebugLogs([])} />
    </div>
  );
};

export default AdminBookingsSection;
