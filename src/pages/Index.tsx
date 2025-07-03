import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import PersonalizedDiscovery from "@/components/PersonalizedDiscovery";
import PlanComparison from "@/components/membership/PlanComparison";
import PremiumToyShop from "@/components/PremiumToyShop";
import ExpertGuidance from "@/components/ExpertGuidance";
import BlogsSection from "@/components/BlogsSection";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { usePersonalizedProducts } from "@/hooks/usePersonalizedProducts";
import EnhancedPersonalizedProductCarousel from "@/components/shop/EnhancedPersonalizedProductCarousel";
import FeaturesSection from "@/components/FeaturesSection";
import DevelopmentalCollectionsSection from "@/components/DevelopmentalCollectionsSection";
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, Star, Heart } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { data: personalizedProducts, isLoading: productsLoading } = usePersonalizedProducts();
  
  // All users are now standard users
  const isPremiumUser = false;

  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <FeaturesSection />
      <PersonalizedDiscovery />
      <DevelopmentalCollectionsSection />
      
      {/* Featured Products Section - placed immediately after DevelopmentalCollectionsSection */}
      <section className="py-20 bg-[#FFF8F3]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 mb-4 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm">Bestsellers</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Top-rated toys loved by families worldwide
            </p>
          </div>
          <FeaturedProductsGrid />
        </div>
      </section>

      {/* Help Choosing Toys Section - immediately after Featured Products */}
      <section className="py-20 bg-[#FFF8F3]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Need Help Choosing the Right Toys?</h2>
            <p className="text-lg text-gray-500 mb-10">
              Our child development experts are here to provide personalized recommendations based on your child's unique needs and interests.
            </p>

            {/* Feature Cards Row */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
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

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
              <Button 
                className="text-lg px-12 py-5 rounded-lg font-semibold bg-gradient-to-r from-[#FA611B] to-[#FD7B2A] text-white border-0 shadow-none w-full sm:w-auto h-[64px] hover:from-[#e65100] hover:to-[#e65100]"
                asChild
              >
                <Link to="/expert">
                  Talk to an Expert
                </Link>
              </Button>
              <Link to="/enhanced-quiz" className="w-full sm:w-auto">
                <button 
                  className="px-12 py-5 rounded-lg bg-white text-gray-800 font-semibold text-lg border border-gray-300 shadow-none w-full sm:w-auto h-[64px] transition-colors hover:bg-[#8338EC] hover:text-white hover:border-[#8338EC]"
                  type="button"
                >
                  Take Our Quiz
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Personalized Product Recommendations - Homepage Version */}
      {user && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <EnhancedPersonalizedProductCarousel
              title="Recommended Just for Your Child"
              products={personalizedProducts || []}
              isLoading={productsLoading}
              isPremiumUser={isPremiumUser}
              isHomePage={true}
            />
          </div>
        </section>
      )}
      
      {/* <PremiumToyShop /> removed as requested */}
      <BlogsSection />
      <Footer />
    </div>
  );
};

const FeaturedProductsGrid = () => {
  const { products, loading } = useProducts();
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-xl h-80" />
        ))}
      </div>
    );
  }

  if (!featuredProducts.length) {
    return <div className="text-center text-gray-400">No featured products found.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {featuredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default Index;
