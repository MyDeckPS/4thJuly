
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown } from "lucide-react";
import { Link } from "react-router-dom";

const HomePlanComparison = () => {
  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-forest mb-4">Choose Your Plan</h2>
          <p className="text-xl text-muted-foreground">
            Start free and upgrade when you're ready for premium features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Standard Plan */}
          <Card className="relative">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-forest">Standard</CardTitle>
              <div className="text-3xl font-bold text-forest">₹0</div>
              <p className="text-muted-foreground">Perfect for getting started</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-foreground">Shop curated educational toys</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-foreground">Personalized toy journey (limited)</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-foreground">Access PlayPath at ₹250 per session</span>
              </div>
              <Button variant="outline" className="w-full mt-6" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-warm-sage border-2">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-warm-sage text-white px-4 py-1">
                <Crown className="w-4 h-4 mr-1" />
                Most Popular
              </Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-forest flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-warm-sage" />
                Premium
              </CardTitle>
              <div className="text-3xl font-bold text-forest">
                ₹2,249
                <span className="text-lg text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground">Everything you need for deeper learning through play</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-warm-sage" />
                <span className="text-foreground">Shop curated educational toys</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-warm-sage" />
                <span className="text-foreground">Unlimited personalized toy journey</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-warm-sage" />
                <span className="text-foreground">1 "Talk to the Expert" consultation session</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-warm-sage" />
                <span className="text-foreground">2 PlayPath sessions included</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-warm-sage" />
                <span className="text-foreground">2x challenge points</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-warm-sage" />
                <span className="text-foreground">Child insights and developmental tracking</span>
              </div>
              <Button className="w-full mt-6 bg-warm-sage hover:bg-forest text-white" asChild>
                <Link to="/membership">Upgrade Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HomePlanComparison;
