
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import EnhancedPersonalizedProductCarousel from './EnhancedPersonalizedProductCarousel';
import { Product } from '@/hooks/useProducts';

interface PersonalizedProductCarouselProps {
  collectionId?: string;
  title?: string;
}

const PersonalizedProductCarousel = ({ 
  collectionId, 
  title = "Recommended for Your Child" 
}: PersonalizedProductCarouselProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  
  // All users are now standard users
  const isPremiumUser = false;

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['personalized-products', user?.id, collectionId],
    queryFn: async () => {
      if (!user) return [];

      // Get user tags for personalization
      const { data: userTags } = await supabase
        .from('user_tags')
        .select('tag, confidence_score')
        .eq('user_id', user.id);

      let query = supabase
        .from('products')
        .select(`
          id,
          title,
          description,
          price,
          compare_at_price,
          amazon_affiliate_link,
          featured,
          age_group,
          days_to_complete,
          has_cognitive_development,
          has_creativity_imagination,
          has_motor_skills,
          has_stem_robotics,
          tags,
          developmental_level_id,
          published,
          created_at,
          developmental_level:developmental_levels(*),
          product_images (
            id,
            image_url,
            alt_text,
            is_primary,
            sort_order
          ),
          product_accordions (
            id,
            title,
            content,
            sort_order
          )
        `)
        .eq('published', true);

      // If collectionId is provided, filter by collection
      if (collectionId) {
        // First get product IDs for this collection
        const { data: collectionProducts } = await supabase
          .from('product_collections')
          .select('product_id')
          .eq('collection_id', collectionId);

        if (collectionProducts && collectionProducts.length > 0) {
          const productIds = collectionProducts.map(cp => cp.product_id);
          query = query.in('id', productIds);
        } else {
          return []; // No products in this collection
        }
      }

      const { data: allProducts, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      if (!userTags || userTags.length === 0) {
        // If no user tags, return featured products
        const featuredProducts = allProducts?.filter(p => p.featured).slice(0, 12) || [];
        return featuredProducts.map(product => ({
          ...product,
          tags: product.tags || [],
          developmental_goals: [], // Empty for now, will be populated by formatProductData if needed
          product_images: product.product_images?.sort(
            (a: any, b: any) => a.sort_order - b.sort_order
          ) || [],
          product_accordions: product.product_accordions?.sort(
            (a: any, b: any) => a.sort_order - b.sort_order
          ) || [],
        })) as Product[];
      }

      // Score products based on tag matching
      const tagSet = new Set(userTags.map(t => t.tag.toLowerCase()));
      const scoredProducts = allProducts?.map(product => {
        let score = 0;
        
        // Check if product tags match user tags
        if (product.tags && Array.isArray(product.tags)) {
          const productTags = product.tags as string[];
          productTags.forEach(tag => {
            if (tagSet.has(tag.toLowerCase())) {
              score += 10;
            }
          });
        }

        // Boost featured products
        if (product.featured) {
          score += 5;
        }

        return { 
          ...product, 
          personalizedScore: score,
          tags: product.tags || [],
          developmental_goals: [], // Empty for now, will be populated by formatProductData if needed
          product_images: product.product_images?.sort(
            (a: any, b: any) => a.sort_order - b.sort_order
          ) || [],
          product_accordions: product.product_accordions?.sort(
            (a: any, b: any) => a.sort_order - b.sort_order
          ) || [],
        };
      }) || [];

      // Sort by personalized score and return top results
      const limit = collectionId ? 12 : 20;
      return scoredProducts
        .sort((a, b) => b.personalizedScore - a.personalizedScore)
        .slice(0, limit) as Product[];
    },
    enabled: !!user
  });

  if (!user) return null;

  return (
    <EnhancedPersonalizedProductCarousel
      title={title}
      products={products}
      isLoading={isLoading}
      isPremiumUser={isPremiumUser}
      isHomePage={!collectionId}
    />
  );
};

export default PersonalizedProductCarousel;
