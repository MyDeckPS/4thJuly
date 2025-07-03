import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Star, BookOpen } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MembershipStatus from "@/components/profile/MembershipStatus";
import PremiumPerks from "@/components/profile/PremiumPerks";
import BoringAvatar from "@/components/common/BoringAvatar";

const ProfilePage = () => {
  const {
    user,
    signOut
  } = useAuth();
  const {
    profile,
    quizResponses,
    calculateAge,
    getZodiacSign,
    isLoading
  } = useProfile();

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4 pt-20 md:pt-24">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-warm-sage border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const age = quizResponses.childBirthday ? calculateAge(quizResponses.childBirthday) : null;
  const zodiacSign = quizResponses.childBirthday ? getZodiacSign(quizResponses.childBirthday) : null;

  const getGenderIcon = (gender: string) => {
    if (gender === 'Boy') return '👦';
    if (gender === 'Girl') return '👧';
    return '🧒';
  };

  const getZodiacIcon = (sign: string) => {
    const zodiacIcons: {
      [key: string]: string;
    } = {
      "Aries": "♈",
      "Taurus": "♉",
      "Gemini": "♊",
      "Cancer": "♋",
      "Leo": "♌",
      "Virgo": "♍",
      "Libra": "♎",
      "Scorpio": "♏",
      "Sagittarius": "♐",
      "Capricorn": "♑",
      "Aquarius": "♒",
      "Pisces": "♓"
    };
    return zodiacIcons[sign] || "⭐";
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24 pb-8">
        {/* Cover Image */}
        <div className="h-32 sm:h-48 bg-gradient-to-r from-warm-sage to-forest relative">
          <div className="absolute inset-0 bg-black/10"></div>
          
          {/* Navigation Header */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <Link to="/shop">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <span>← Shop</span>
              </Button>
            </Link>
            <Button variant="ghost" onClick={signOut} className="text-white hover:bg-white/20">
              Sign Out
            </Button>
          </div>
        </div>

        <div className="relative px-4 sm:px-6 -mt-16 sm:-mt-20 pb-24 sm:pb-8 py-[35px]">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Profile Section */}
            <Card className="border-0 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  {/* Profile Image - Updated to use BoringAvatar */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                    <BoringAvatar name={profile?.name || user?.email || 'User'} size={96} variant="beam" />
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-xl sm:text-2xl font-bold text-forest mb-1">
                      {profile?.name || user?.email}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mb-3">Super Parent</p>
                    
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-warm-peach/10 text-warm-sage rounded-full text-xs sm:text-sm">
                        <Calendar className="w-3 h-3" />
                        Member since {new Date(profile?.created_at || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Membership Status */}
            <MembershipStatus childName={quizResponses.childName} />

            {/* Welcome Offer for Standard Users */}

            {/* Premium Perks Section */}
            <PremiumPerks />

            {/* Child Information */}
            {quizResponses.childName && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 sm:p-6 rounded-xl bg-rose-50">
                  <h2 className="text-lg sm:text-xl font-semibold text-forest mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-warm-sage" />
                    Child Information
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Child Name */}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getGenderIcon(quizResponses.childGender || '')}</span>
                      <div>
                        <p className="font-medium text-forest text-base sm:text-lg">
                          {quizResponses.childName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {quizResponses.childGender}
                        </p>
                      </div>
                    </div>

                    {/* Age */}
                    {age && (
                      <div className="bg-warm-peach/5 rounded-lg p-3 sm:p-4">
                        <p className="text-sm text-muted-foreground mb-1">Age</p>
                        <p className="text-base sm:text-lg font-medium text-forest">
                          I am {age.years} years {age.months} months {age.days} days old
                        </p>
                      </div>
                    )}

                    {/* Zodiac Sign */}
                    {zodiacSign && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getZodiacIcon(zodiacSign)}</span>
                        <div>
                          <p className="text-sm text-muted-foreground">Zodiac Sign</p>
                          <p className="font-medium text-forest">{zodiacSign}</p>
                        </div>
                      </div>
                    )}

                    {/* Birthday */}
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-warm-sage" />
                      <div>
                        <p className="text-sm text-muted-foreground">Birthday</p>
                        <p className="font-medium text-forest">
                          {new Date(quizResponses.childBirthday || '').toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* My Bookings CTA */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-forest mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-warm-sage" />
                  My Bookings
                </h2>
                <p className="text-muted-foreground mb-4">
                  View and manage all your session bookings in one place.
                </p>
                <Link to="/all-bookings">
                  <Button className="w-full bg-warm-sage hover:bg-forest">
                    View All Bookings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Link to="/shop" className="block">
                
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
