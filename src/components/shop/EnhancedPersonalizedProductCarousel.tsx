import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PersonalizedProductCard from './PersonalizedProductCard';
import { Product } from '@/hooks/useProducts';
interface EnhancedPersonalizedProductCarouselProps {
  title: string;
  products: Product[];
  isLoading: boolean;
  isPremiumUser: boolean;
  isHomePage?: boolean;
}
const EnhancedPersonalizedProductCarousel = ({
  title,
  products,
  isLoading,
  isPremiumUser,
  isHomePage = false
}: EnhancedPersonalizedProductCarouselProps) => {
  // For standard users, limit to 6 products
  const displayProducts = isPremiumUser ? products : products.slice(0, 6);
  const hasMoreProducts = !isPremiumUser && products.length > 6;
  if (isLoading) {
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        </CardContent>
      </Card>;
  }
  if (products.length === 0) {
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No personalized recommendations available yet.</p>
            <p className="text-sm">Coming Soon</p>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card>
      
      
    </Card>;
};
export default EnhancedPersonalizedProductCarousel;