
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/hooks/useProducts';

export const usePersonalizedProducts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personalized-products', user?.id],
    queryFn: async () => {
      console.log('🔧 Personalized: Starting fetch for user:', user?.id);
      
      if (!user) {
        console.log('🔧 Personalized: No user found, returning empty array');
        return [];
      }

      // Get user tags for personalization
      const { data: userTags } = await supabase
        .from('user_tags')
        .select('tag, confidence_score')
        .eq('user_id', user.id);

      console.log('🔧 Personalized: User tags fetched:', userTags?.length || 0);

      const queryString = `
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
      `;

      console.log('🔧 Personalized: Executing query:', queryString);

      // Get all published products with their images
      const { data: products, error } = await supabase
        .from('products')
        .select(queryString)
        .eq('published', true)
        .order('created_at', { ascending: false });

      console.log('🔧 Personalized: Query response:', {
        productsCount: products?.length || 0,
        error: error?.message || 'none'
      });

      if (error) {
        console.error('❌ Personalized: Query error:', error);
        throw error;
      }

      if (!userTags || userTags.length === 0) {
        console.log('🔧 Personalized: No user tags, returning featured products');
        // If no user tags, return featured products
        const featuredProducts = products?.filter(p => p.featured).slice(0, 12) || [];
        console.log('🔧 Personalized: Returning', featuredProducts.length, 'featured products');
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
      console.log('🔧 Personalized: User tag set:', Array.from(tagSet));
      
      const scoredProducts = products?.map(product => {
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
      const finalProducts = scoredProducts
        .sort((a, b) => b.personalizedScore - a.personalizedScore)
        .slice(0, 20) as Product[];
        
      console.log('✅ Personalized: Returning', finalProducts.length, 'personalized products');
      return finalProducts;
    },
    enabled: !!user
  });
};
