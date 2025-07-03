
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Star, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { usePremiumBenefits } from "@/hooks/usePremiumBenefits";
import PlanComparison from "@/components/membership/PlanComparison";

const MembershipPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { sessionPrice, loading: benefitsLoading } = usePremiumBenefits();

  if (benefitsLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center py-8">Loading session information...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="w-8 h-8 text-warm-sage" />
              <h1 className="text-4xl font-bold text-forest">PlayPath Sessions</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Expert-guided developmental activities personalized for your child's growth journey
            </p>
          </div>

          {/* Current Status for Logged-in Users */}
          {user && (
            <Card className="mb-8 border-warm-peach/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-warm-peach/20">
                      <Calendar className="w-6 h-6 text-warm-sage" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-forest">Ready to Book</h3>
                      <p className="text-sm text-muted-foreground">
                        PlayPath sessions available at ₹{sessionPrice} per session
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-warm-sage hover:bg-forest" asChild>
                      <Link to="/booking/playpath">
                        Book Session
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Use the unified PlanComparison component */}
          <div className="mb-12">
            <PlanComparison isHomePage={false} currentUserType="standard" />
          </div>

          {/* Benefits Details */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-forest mb-6 text-center">
                Why Choose PlayPath Sessions?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-warm-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-warm-sage" />
                  </div>
                  <h3 className="font-semibold mb-2">Expert Guidance</h3>
                  <p className="text-sm text-muted-foreground">
                    Access to certified child development experts for personalized activities
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-warm-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-warm-sage" />
                  </div>
                  <h3 className="font-semibold mb-2">Flexible Scheduling</h3>
                  <p className="text-sm text-muted-foreground">
                    Book sessions at your convenience with our easy booking system
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-warm-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-warm-sage" />
                  </div>
                  <h3 className="font-semibold mb-2">Personalized Activities</h3>
                  <p className="text-sm text-muted-foreground">
                    Each session is tailored to your child's unique developmental needs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MembershipPage;
