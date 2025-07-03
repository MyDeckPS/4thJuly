import React from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const ChildInsightsPage = () => {
  const { user } = useAuth();
  const { profile, quizResponses, calculateAge, isLoading: profileLoading } = useProfile();
  
  if (!user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-4">
                You must be logged in to view this page.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (profileLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Loading...</h2>
              <p className="text-muted-foreground mb-4">
                Fetching your profile data.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  // All users are now standard users
  const isPremium = false;
  const canViewInsights = true; // All users can view insights

  const childName = quizResponses?.childName || 'Your Child';
  const childBirthday = quizResponses?.childBirthday;
  const childAge = childBirthday ? calculateAge(childBirthday) : null;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24 pb-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-forest mb-4">
                {childName}'s Insights
              </h1>
              <p className="text-xl text-muted-foreground">
                Unlock personalized insights to support {childName}'s unique development journey.
              </p>
            </div>

            {/* Lottie Animation */}
            <div className="w-full max-w-xs mx-auto mb-6">
              <DotLottieReact
                src="https://lottie.host/87748159-1635-4937-9058-33b307d03f71/lPzwAFZ74Z.lottie"
                loop
                autoplay
              />
            </div>

            {/* Age and Membership Info */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-forest">Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {childName}
                    </h3>
                    {childAge && (
                      <p className="text-sm text-muted-foreground">
                        {childAge.years} years, {childAge.months} months old
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-700">
                      Account Status: Standard User
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Enjoy access to basic insights and personalized recommendations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights Section */}
            {canViewInsights ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-forest">Key Development Areas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Cognitive Development
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Focuses on problem-solving, memory, and critical thinking skills.
                      </p>
                      <Progress value={75} />
                      <p className="text-sm text-gray-600">75%</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Motor Skills
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Involves both gross and fine motor skills, essential for physical coordination.
                      </p>
                      <Progress value={60} />
                      <p className="text-sm text-gray-600">60%</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Creativity and Imagination
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Encourages innovative thinking, artistic expression, and imaginative play.
                      </p>
                      <Progress value={85} />
                      <p className="text-sm text-gray-600">85%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <h2 className="text-xl font-semibold mb-4">
                    Unlock Full Insights with Premium
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Upgrade to Premium to access detailed insights and personalized
                    recommendations for your child's development.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ChildInsightsPage;
