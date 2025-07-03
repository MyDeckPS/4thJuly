
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Award, Heart, ShoppingCart, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const PremiumToyShop = () => {
  const { user } = useAuth();

  const featuredToys = [
    {
      title: "Wooden Rainbow Stacker",
      age: "12-36 months", 
      skills: "Fine motor, Color recognition",
      price: "$28",
      rating: 4.9
    },
    {
      title: "STEM Building Kit",
      age: "4-7 years",
      skills: "Problem solving, Engineering", 
      price: "$45",
      rating: 4.8
    },
    {
      title: "Montessori Counting Bears",
      age: "3-6 years",
      skills: "Math concepts, Sorting",
      price: "$22", 
      rating: 4.9
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-4">Discover Toys for Your Child</h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Only the best make it to your deck. We say no to noisy, flashy, throwaway toys—and yes to meaningful play.
          </p>
        </div>

        {/* Curation Promise */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-warm-peach/10">
            <CardHeader>
              <Award className="w-12 h-12 mx-auto text-warm-sage mb-4" />
              <CardTitle className="text-xl">Handpicked by experts</CardTitle>
              <CardDescription>Selected by child development specialists</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-soft-blue/10">
            <CardHeader>
              <Star className="w-12 h-12 mx-auto text-soft-blue mb-4" />
              <CardTitle className="text-xl">Safe, high-quality, and lasting</CardTitle>
              <CardDescription>Premium materials and safety tested</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-forest/10">
            <CardHeader>
              <Heart className="w-12 h-12 mx-auto text-forest mb-4" />
              <CardTitle className="text-xl">Matched to real skills and milestones</CardTitle>
              <CardDescription>Every toy supports specific development goals</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Call to Action for Non-Authenticated Users */}
        {!user && (
          <Card className="bg-gradient-to-r from-warm-sage to-forest text-white mb-16">
            <CardContent className="p-8 text-center">
              <h4 className="text-2xl font-bold mb-4">Get Personalized Recommendations</h4>
              <p className="text-lg mb-6 opacity-90">
                Sign up to get expert-curated toy recommendations based on your child's unique development needs.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/signup">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Start Shopping
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-forest" asChild>
                  <Link to="/booking/playpath">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book PlayPath Session
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default PremiumToyShop;
