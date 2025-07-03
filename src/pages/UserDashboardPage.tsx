import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProductPurchasesByUser } from '@/hooks/useUserProductPurchases';
import { useUserBookings } from '@/hooks/useBookings';
import { useUserProductChallenges, useUserChallengePoints } from '@/hooks/useChallenges';
import { useIsMobile } from '@/hooks/use-mobile';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  User, 
  Users, 
  BookOpen, 
  Settings as SettingsIcon, 
  Package, 
  Phone,
  Mail,
  MapPin,
  Edit2,
  ExternalLink,
  Star,
  Clock,
  DollarSign,
  Home,
  CreditCard,
  MessageSquare,
  Trophy,
  Timer,
  Target,
  Camera,
  CheckCircle,
  Play,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import BoringAvatar from '@/components/common/BoringAvatar';
import ProductChallenges from '@/components/challenges/ProductChallenges';

// Move ContactTab outside the main component to prevent recreation on every render
const ContactTab = ({ 
  userPhone, 
  handlePhoneChange, 
  savePhoneNumber, 
  isUpdatingPhone, 
  userEmail 
}: {
  userPhone: string;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  savePhoneNumber: () => void;
  isUpdatingPhone: boolean;
  userEmail: string;
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-orange-500" />
          Contact Information
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email"
              type="email" 
              value={userEmail} 
              disabled 
              className="bg-gray-50"
            />
            <p className="text-sm text-gray-500">Email address cannot be changed</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex gap-2">
              <Input 
                id="phone"
                type="tel" 
                placeholder="Enter your phone number"
                value={userPhone}
                onChange={handlePhoneChange}
                disabled={isUpdatingPhone}
                className="focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:border-orange-500"
              />
              <Button 
                onClick={savePhoneNumber} 
                variant="outline"
                disabled={isUpdatingPhone || !userPhone.trim()}
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                {isUpdatingPhone ? 'Saving...' : 'Save'}
              </Button>
            </div>
            <p className="text-sm text-gray-500">We'll use this for order updates and support</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const UserDashboardPage = () => {
  const { user, signOut } = useAuth();
  const { profile, quizResponses, calculateAge, getZodiacSign, isLoading, updateProfile } = useProfile();
  const { data: purchases = [] } = useUserProductPurchasesByUser(user?.id);
  const { data: bookings = [] } = useUserBookings();
  const { data: challengePoints = 0 } = useUserChallengePoints(user?.id);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('purchases');
  const [userPhone, setUserPhone] = useState('');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

  // Calculate user stats
  const totalPurchases = purchases.length;
  const totalSpent = purchases.reduce((sum, p) => sum + (p.purchase_price || p.products?.price || 0), 0);
  const totalPoints = challengePoints; // Only challenge points, no purchase points

  // Load phone number from profile (only when profile changes, not on every render)
  useEffect(() => {
    if (profile?.phone && profile.phone !== userPhone) {
      setUserPhone(profile.phone);
    }
  }, [profile?.phone]);

  const savePhoneNumber = useCallback(async () => {
    if (!userPhone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }
    
    setIsUpdatingPhone(true);
    try {
      await updateProfile.mutateAsync({ phone: userPhone.trim() });
    } catch (error) {
      console.error('Failed to save phone number:', error);
    } finally {
      setIsUpdatingPhone(false);
    }
  }, [userPhone, updateProfile]);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUserPhone(e.target.value);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const UserInfoCard = () => (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Profile Image */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
            <BoringAvatar name={profile?.name || user?.email || 'User'} size={96} variant="beam" />
          </div>
          
          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  {profile?.name || user?.email}
                </h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <div className="flex gap-2 mt-3 sm:mt-0">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Website
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{totalPurchases}</div>
                <div className="text-sm text-orange-700">Total Purchases</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">₹{totalSpent.toLocaleString()}</div>
                <div className="text-sm text-purple-700">Money Spent</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
                <div className="text-sm text-green-700">Reward Points</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const DesktopNavigation = () => (
    <div className="bg-white border-b mb-8">
      <div className="max-w-6xl mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start h-12 bg-transparent p-0">
            <TabsTrigger 
              value="purchases" 
              className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none"
            >
              <Package className="w-4 h-4 mr-2" />
              Purchases
            </TabsTrigger>
            <TabsTrigger 
              value="bookings"
              className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Expert Bookings
            </TabsTrigger>
            <TabsTrigger 
              value="children"
              className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none"
            >
              <Users className="w-4 h-4 mr-2" />
              Children
            </TabsTrigger>
            <TabsTrigger 
              value="addresses"
              className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Addresses
            </TabsTrigger>
            <TabsTrigger 
              value="contact"
              className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none"
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );

  const MobileBottomNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2 px-4">
        {[
          { id: 'purchases', label: 'Purchases', icon: Package },
          { id: 'bookings', label: 'Bookings', icon: BookOpen },
          { id: 'children', label: 'Children', icon: Users },
          { id: 'addresses', label: 'Addresses', icon: MapPin },
          { id: 'contact', label: 'Contact', icon: Phone }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'text-orange-600 bg-orange-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className={`text-xs font-medium ${
              activeTab === item.id ? 'text-orange-600' : 'text-gray-500'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const PurchasesTab = () => (
    <div className="space-y-4">
      {purchases.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
            <p className="text-gray-600 mb-4">
              Your Amazon affiliate purchases will appear here once verified.
            </p>
            <p className="text-sm text-gray-500">
              Purchased a product? Call us to add it to your dashboard!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {purchase.products?.product_images && purchase.products.product_images.length > 0 ? (
                      <img 
                        src={purchase.products.product_images.find(img => img.is_primary)?.image_url || purchase.products.product_images[0]?.image_url} 
                        alt={purchase.products?.title || 'Product image'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {purchase.products?.title}
                      </h3>
                      <Badge className={getStatusColor(purchase.verification_status)}>
                        {purchase.verification_status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Purchased {format(new Date(purchase.purchase_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="font-medium text-orange-600">
                        ₹{purchase.purchase_price || purchase.products?.price || 0}
                      </div>
                    </div>

                    {purchase.admin_notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <Star className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">Admin Note</p>
                            <p className="text-sm text-blue-700">{purchase.admin_notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {purchase.products?.amazon_affiliate_link && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          onClick={() => window.open(purchase.products?.amazon_affiliate_link, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View on Amazon
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Challenges Section */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <ProductChallenges 
                    userProductPurchaseId={purchase.id} 
                    productTitle={purchase.products?.title || 'Product'} 
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const BookingsTab = () => (
    <div className="space-y-4">
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-4">
              Your expert consultation bookings will appear here.
            </p>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Book a Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Expert Consultation</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={getBookingStatusColor(booking.booking_status)}>
                        {booking.booking_status}
                      </Badge>
                      <Badge variant="outline">
                        {booking.session_type}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-orange-600">
                      ₹{booking.amount_paid || 0}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.payment_status}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        {format(new Date(booking.start_time), 'PPP')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(booking.start_time), 'p')} - {format(new Date(booking.end_time), 'p')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium">Expert Session</p>
                      <p className="text-sm text-gray-500">Development Consultation</p>
                    </div>
                  </div>
                </div>

                {booking.special_notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Special Notes:</p>
                    <p className="text-sm text-gray-600">{booking.special_notes}</p>
                  </div>
                )}

                {booking.meeting_link && (
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Join Meeting
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const ChildrenTab = () => (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-500" />
          Child Information
        </h2>
        {quizResponses.childName ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{quizResponses.childGender === 'Boy' ? '👦' : quizResponses.childGender === 'Girl' ? '👧' : '🧒'}</span>
              <div>
                <p className="font-medium text-gray-900 text-lg">{quizResponses.childName}</p>
                <p className="text-sm text-gray-600">{quizResponses.childGender}</p>
              </div>
            </div>
            {quizResponses.childBirthday && (
              <>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Age</p>
                  <p className="text-lg font-medium text-gray-900">
                    {(() => {
                      const age = calculateAge(quizResponses.childBirthday);
                      return `${age.years} years ${age.months} months ${age.days} days old`;
                    })()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{(() => {
                    const zodiacIcons: { [key: string]: string } = {
                      "Aries": "♈", "Taurus": "♉", "Gemini": "♊", "Cancer": "♋", "Leo": "♌", "Virgo": "♍", "Libra": "♎", "Scorpio": "♏", "Sagittarius": "♐", "Capricorn": "♑", "Aquarius": "♒", "Pisces": "♓"
                    };
                    const sign = getZodiacSign(quizResponses.childBirthday);
                    return zodiacIcons[sign] || "⭐";
                  })()}</span>
                  <div>
                    <p className="text-sm text-gray-600">Zodiac Sign</p>
                    <p className="font-medium text-gray-900">{getZodiacSign(quizResponses.childBirthday)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Birthday</p>
                    <p className="font-medium text-gray-900">{format(new Date(quizResponses.childBirthday), 'MMMM dd, yyyy')}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No child information</h3>
            <p className="text-gray-600 mb-4">
              Complete the personalization quiz to add your child's information.
            </p>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Complete Quiz
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const AddressesTab = () => (
    <Card>
      <CardContent className="text-center py-12">
        <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Address Management</h3>
        <p className="text-gray-600 mb-4">
          Coming soon! You'll be able to manage your delivery addresses here.
        </p>
        <Badge variant="outline">Coming Soon</Badge>
      </CardContent>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'purchases': return <PurchasesTab />;
      case 'bookings': return <BookingsTab />;
      case 'children': return <ChildrenTab />;
      case 'addresses': return <AddressesTab />;
      case 'contact': return (
        <ContactTab 
          userPhone={userPhone}
          handlePhoneChange={handlePhoneChange}
          savePhoneNumber={savePhoneNumber}
          isUpdatingPhone={isUpdatingPhone}
          userEmail={user?.email || ''}
        />
      );
      default: return <PurchasesTab />;
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24">
        {/* Desktop Layout */}
        {!isMobile && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <UserInfoCard />
            <DesktopNavigation />
            {renderTabContent()}
          </div>
        )}

        {/* Mobile Layout */}
        {isMobile && (
          <div className="px-4 py-6 pb-20">
            <UserInfoCard />
            {renderTabContent()}
            <MobileBottomNavigation />
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default UserDashboardPage; 