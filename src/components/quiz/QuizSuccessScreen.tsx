import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import BoringAvatar from "@/components/common/BoringAvatar";
import PersonalizedProductCarousel from "@/components/shop/PersonalizedProductCarousel";
import { useProducts } from "@/hooks/useProducts";
import { usePersonalizedProducts } from "@/hooks/usePersonalizedProducts";
import { useDevelopmentalData } from "@/hooks/useDevelopmentalData";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import FloatingBubbles from "@/components/FloatingBubbles";
import DynamicCollectionsSection from "@/components/shop/DynamicCollectionsSection";
import { useShopSections } from "@/hooks/useShopSections";
interface QuizSuccessScreenProps {
  userName?: string;
  childName?: string;
}
const CountingNumber = ({
  target,
  duration = 2000
}: {
  target: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [target, duration]);
  return <span>{count}</span>;
};
const QuizSuccessScreen = ({
  userName,
  childName
}: QuizSuccessScreenProps) => {
  const {
    products
  } = useProducts();
  const {
    data: personalizedProducts
  } = usePersonalizedProducts();
  const {
    developmentalLevels,
    loading: levelsLoading
  } = useDevelopmentalData();
  const scrollRef = useRef<HTMLDivElement>(null);
  const totalProducts = products.length;
  const recommendedProducts = personalizedProducts?.length || 0;
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const { sections } = useShopSections();

  // Find collections carousel section that should show on quiz completion
  const quizCollectionsSection = sections.find(
    section => 
      section.section_type === 'collections_carousel' && 
      section.is_active && 
      section.config?.show_on_quiz_completion === true
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-sage/10 via-white to-forest/5 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Profile Avatar */}
          <div className="flex justify-center">
            <BoringAvatar name={userName || "User"} size={120} variant="beam" />
          </div>

          {/* Welcome Message */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-forest to-warm-sage bg-clip-text text-transparent">
              Welcome to Mydeck, {userName || "Friend"}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Let us take {childName || "your child"} to the limitless potential.
            </p>
          </div>

          {/* Lottie Animation */}
          <div className="w-full max-w-md mx-auto">
            <DotLottieReact src="https://lottie.host/5201fa7c-735b-4934-9431-0a9a30696ecf/k9xu59AZ6v.lottie" loop autoplay />
          </div>

          {/* Product Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Available Toys */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-warm-sage/20">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-muted-foreground">Total Available Toys</h3>
                <div className="text-6xl md:text-7xl font-bold text-forest">
                  <CountingNumber target={totalProducts} />
                </div>
              </div>
            </div>

            {/* Curated Toys with Bubbles */}
            <div className="relative bg-gradient-to-br from-warm-sage/20 to-forest/10 rounded-2xl p-8 shadow-lg border border-warm-sage/30 overflow-hidden">
              <FloatingBubbles />
              <div className="relative z-10 space-y-4">
                <h3 className="text-lg font-medium text-muted-foreground">Curated for {childName || "Your Child"}</h3>
                <div className="text-6xl md:text-7xl font-bold text-warm-sage">
                  <CountingNumber target={recommendedProducts} />
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Collections Section - Only show if admin has enabled it */}
          {quizCollectionsSection && (
            <DynamicCollectionsSection 
              title={quizCollectionsSection.title || "Shop by Age Goals"}
              className="text-left"
            />
          )}

          {/* Personalized Products */}
          <div className="w-full">
            <PersonalizedProductCarousel title="Products based on first impressions" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button asChild size="lg" className="bg-gradient-to-r from-warm-sage to-forest hover:from-forest hover:to-warm-sage text-white px-8 py-3 text-lg w-full sm:w-auto">
              <Link to="/booking">PlayPath</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-forest text-forest hover:bg-forest hover:text-white px-8 py-3 text-lg w-full sm:w-auto">
              <Link to="/shop">Explore Toys</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default QuizSuccessScreen;
