import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { usePremiumBenefits } from "@/hooks/usePremiumBenefits";

interface PlanComparisonProps {
  isHomePage?: boolean;
  currentUserType?: 'standard';
}

const PlanComparison = ({ isHomePage = false, currentUserType }: PlanComparisonProps) => {
  const { sessionPrice, loading } = usePremiumBenefits();

  if (loading) {
    return (
      <section className={`py-16 px-6 ${isHomePage ? 'bg-gray-50' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">Loading pricing information...</div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${isHomePage ? 'py-16' : 'py-20'} px-6 ${isHomePage ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-forest mb-4">PlayPath Sessions</h2>
          <p className="text-xl text-muted-foreground">
            Expert-guided developmental activities for your child
          </p>
        </div>

        <div className="grid md:grid-cols-1 gap-8 max-w-2xl mx-auto">
          {/* Standard Plan */}
          <Card className="relative border-warm-sage border-2">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-warm-sage text-white px-4 py-1">
                Available Now
              </Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-forest">PlayPath Sessions</CardTitle>
              <div className="text-3xl font-bold text-forest">
                ₹{sessionPrice.toLocaleString()}
                <span className="text-lg text-muted-foreground">/session</span>
              </div>
              <p className="text-muted-foreground">Personalized developmental activities for your child</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-warm-sage" />
                <span className="text-foreground">Expert-guided session activities</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-warm-sage" />
                <span className="text-foreground">Personalized for your child's development</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-warm-sage" />
                <span className="text-foreground">Flexible scheduling</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-warm-sage" />
                <span className="text-foreground">Post-session developmental insights</span>
              </div>
              {isHomePage ? (
                <Button className="w-full mt-6 bg-warm-sage hover:bg-forest text-white" asChild>
                  <Link to="/booking/playpath">Book Session</Link>
                </Button>
              ) : (
                <Button className="w-full mt-6 bg-warm-sage hover:bg-forest text-white" asChild>
                  <Link to="/booking/playpath">Book PlayPath Session</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Expert-guided sessions • Personalized for your child
          </p>
        </div>
      </div>
    </section>
  );
};

export default PlanComparison;
