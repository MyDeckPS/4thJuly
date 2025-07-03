import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Product as PublicProduct, DevelopmentalGoal } from './useProducts';

export type Product = PublicProduct;

interface CreateProductData {
  title: string;
  description: string;
  age_group: string;
  days_to_complete?: number | null;
  amazon_affiliate_link: string;
  developmental_level_id: string;
  published: boolean;
  featured: boolean;
  price?: number | null;
  compare_at_price?: number | null;
  tags: string[];
  has_cognitive_development?: boolean;
  has_creativity_imagination?: boolean;
  has_motor_skills?: boolean;
  has_stem_robotics?: boolean;
  images: Array<{
    image_url: string;
    alt_text?: string;
    is_primary: boolean;
  }>;
  accordions: Array<{
    title: string;
    content: string;
  }>;
}

const formatAdminProductData = (product: any, allDevGoals: DevelopmentalGoal[]): Product => {
  const selectedGoals: DevelopmentalGoal[] = [];
  
  console.log('🔧 Admin: Formatting product:', product.title);
  console.log('🔧 Admin: Available developmental goals:', allDevGoals.map(g => g.name));
  
  // Check each boolean field and add corresponding goal
  if (product.has_cognitive_development) {
    const goal = allDevGoals.find(g => g.name === 'Cognitive Development');
    if (goal) selectedGoals.push(goal);
  }
  
  if (product.has_creativity_imagination) {
    const goal = allDevGoals.find(g => g.name === 'Creativity and Imagination');
    if (goal) selectedGoals.push(goal);
  }
  
  if (product.has_motor_skills) {
    const goal = allDevGoals.find(g => g.name === 'Motor Skills');
    if (goal) selectedGoals.push(goal);
  }
  
  if (product.has_stem_robotics) {
    const goal = allDevGoals.find(g => g.name === 'STEM and Robotics');
    if (goal) selectedGoals.push(goal);
  }

  console.log('🔧 Admin: Selected goals for product:', selectedGoals);

  return {
    ...product,
    tags: product.tags || [],
    developmental_goals: selectedGoals,
    product_images: product.product_images?.sort(
      (a: any, b: any) => a.sort_order - b.sort_order
    ) || [],
    product_accordions: product.product_accordions?.sort(
      (a: any, b: any) => a.sort_order - b.sort_order
    ) || [],
    product_collections: product.product_collections || []
  } as Product;
};

export const useAdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [allDevelopmentalGoals, setAllDevelopmentalGoals] = useState<DevelopmentalGoal[]>([]);
  const { toast } = useToast();

  const fetchBaseDevelopmentalGoalsAdmin = async () => {
    console.log('🔧 Admin: Fetching developmental goals...');
    const { data, error } = await supabase.from('developmental_goals').select('id, name, color, emoji');
    if (error) {
      console.error("❌ Admin: Error fetching developmental goals:", error);
      toast({ title: "Error", description: "Failed to load admin developmental goal metadata.", variant: "destructive" });
      return [];
    }
    console.log('✅ Admin: Fetched developmental goals:', data);
    return data || [];
  };

  const fetchProducts = async (devGoals: DevelopmentalGoal[]) => {
    try {
      setLoading(true);
      console.log('🔧 Admin: Starting product fetch with goals:', devGoals.map(g => g.name));
      
      const queryString = `
        id, title, description, age_group, days_to_complete, amazon_affiliate_link,
        developmental_level_id, published, featured, price, compare_at_price, tags,
        has_cognitive_development, has_creativity_imagination, has_motor_skills, has_stem_robotics,
        created_at,
        developmental_level:developmental_levels(*),
        product_images(*),
        product_accordions(*),
        product_collections(*)
      `;
      
      console.log('🔧 Admin: Executing query with string:', queryString);
      
      const { data, error } = await supabase
        .from('products')
        .select(queryString)
        .order('created_at', { ascending: false });

      console.log('🔧 Admin: Raw query response:', { 
        dataCount: data?.length || 0, 
        error: error?.message || 'none',
        firstProduct: data?.[0] || 'none'
      });

      if (error) {
        console.error('❌ Admin: Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (data) {
        console.log('🔧 Admin: Processing', data.length, 'products');
        const formattedProducts = data.map((product: any) => {
          const formatted = formatAdminProductData(product, devGoals);
          console.log('🔧 Admin: Formatted product:', formatted.title, 'with goals:', formatted.developmental_goals.length);
          return formatted;
        });
        
        console.log('✅ Admin: Successfully formatted', formattedProducts.length, 'products');
        setProducts(formattedProducts);
        
        if (formattedProducts.length === 0) {
          console.warn('⚠️ Admin: No products found - this could indicate an issue');
        }
      } else {
        console.warn('⚠️ Admin: Query returned null data');
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Admin: Critical error fetching products:', error);
      const logger = (window as any).debugLogger_Products;
      logger?.error('Failed to fetch admin products', error);
      
      toast({
        title: "Error",
        description: `Failed to load admin products: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setProducts([]);
    } finally {
      console.log('🔧 Admin: Fetch operation completed, setting loading to false');
      setLoading(false);
    }
  };

  const createProduct = async (productData: CreateProductData) => {
    try {
      const logger = (window as any).debugLogger_Products;
      logger?.info('Creating product with developmental goals', { productData });

      const { images, accordions, ...coreProductData } = productData;

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          title: coreProductData.title,
          description: coreProductData.description,
          age_group: coreProductData.age_group,
          days_to_complete: coreProductData.days_to_complete,
          amazon_affiliate_link: coreProductData.amazon_affiliate_link,
          developmental_level_id: coreProductData.developmental_level_id,
          published: coreProductData.published,
          featured: coreProductData.featured,
          price: coreProductData.price,
          compare_at_price: coreProductData.compare_at_price,
          tags: coreProductData.tags,
          has_cognitive_development: coreProductData.has_cognitive_development || false,
          has_creativity_imagination: coreProductData.has_creativity_imagination || false,
          has_motor_skills: coreProductData.has_motor_skills || false,
          has_stem_robotics: coreProductData.has_stem_robotics || false,
        })
        .select()
        .single();

      if (productError) throw productError;
      const productId = product.id;
      logger?.info('Product created successfully with developmental goals', { productId });

      if (images && images.length > 0) {
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(
            images.map((image, index) => ({
              product_id: productId,
              image_url: image.image_url,
              alt_text: image.alt_text,
              is_primary: image.is_primary,
              sort_order: index
            }))
          );

        if (imagesError) throw imagesError;
        logger?.info('Images added', { count: images.length });
      }

      if (accordions && accordions.length > 0) {
        const validAccordions = accordions.filter(acc => 
          acc.title && acc.title.trim() && acc.content && acc.content.trim()
        );
        
        logger?.info('Processing accordions', { 
          total: accordions.length, 
          valid: validAccordions.length,
          accordions: validAccordions
        });

        if (validAccordions.length > 0) {
          const { error: accordionsError } = await supabase
            .from('product_accordions')
            .insert(
              validAccordions.map((accordion, index) => ({
                product_id: productId,
                title: accordion.title,
                content: accordion.content,
                sort_order: index
              }))
            );

          if (accordionsError) {
            logger?.error('Failed to add accordions', accordionsError);
            throw accordionsError;
          }
          
          logger?.info('Accordions added successfully', { count: validAccordions.length });
        }
      }

      toast({
        title: "Success",
        description: "Product created successfully",
      });
      
      if (allDevelopmentalGoals.length > 0) {
        fetchProducts(allDevelopmentalGoals);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      const logger = (window as any).debugLogger_Products;
      logger?.error('Failed to create product', error);
      
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async (id: string, updates: Partial<CreateProductData>) => {
    try {
      const logger = (window as any).debugLogger_Products;
      logger?.info('Updating product with developmental goals', { productId: id, updates });
      
      const { images, accordions, ...productCoreUpdates } = updates;

      const processedCoreUpdates: any = { ...productCoreUpdates };
      (Object.keys(productCoreUpdates) as Array<keyof typeof productCoreUpdates>).forEach(key => {
        if (['price', 'compare_at_price', 'days_to_complete'].includes(key as string)) {
          processedCoreUpdates[key] = productCoreUpdates[key] === undefined ? null : productCoreUpdates[key];
        }
      });
      
      const { error } = await supabase
        .from('products')
        .update(processedCoreUpdates)
        .eq('id', id);

      if (error) throw error;
      logger?.info('Product core details updated successfully with developmental goals', { productId: id });

      if (images) {
        // Filter out invalid images (must have image_url and is_primary is boolean)
        const validImages = images.filter(img => img && typeof img.image_url === 'string' && img.image_url.trim() !== '');
        console.log('🖼️ Inserting product images:', validImages);
        await supabase.from('product_images').delete().eq('product_id', id);
        if (validImages.length > 0) {
          const { error: imagesError } = await supabase.from('product_images').insert(
            validImages.map((image, index) => ({
              product_id: id,
              image_url: image.image_url,
              alt_text: image.alt_text,
              is_primary: image.is_primary,
              sort_order: index
            }))
          );
          if (imagesError) throw imagesError;
        }
        logger?.info('Product images updated', { productId: id });
      }

      if (accordions) {
        // Filter out invalid accordions (must have title and content)
        const validAccordions = accordions.filter(acc => acc && acc.title && acc.title.trim() && acc.content && acc.content.trim());
        console.log('📑 Inserting product accordions:', validAccordions);
        await supabase.from('product_accordions').delete().eq('product_id', id);
        if (validAccordions.length > 0) {
          const { error: accordionsError } = await supabase.from('product_accordions').insert(
            validAccordions.map((accordion, index) => ({
              product_id: id,
              title: accordion.title,
              content: accordion.content,
              sort_order: index
            }))
          );
          if (accordionsError) throw accordionsError;
        }
        logger?.info('Product accordions updated', { productId: id });
      }

      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      
      if (allDevelopmentalGoals.length > 0) {
        fetchProducts(allDevelopmentalGoals);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      const logger = (window as any).debugLogger_Products;
      logger?.error('Failed to update product', { productId: id, error });
      
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const logger = (window as any).debugLogger_Products;
      logger?.info('Deleting product', { productId: id });

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      logger?.info('Product deleted successfully', { productId: id });

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      if (allDevelopmentalGoals.length > 0) {
        fetchProducts(allDevelopmentalGoals);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      const logger = (window as any).debugLogger_Products;
      logger?.error('Failed to delete product', { productId: id, error });
      
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log('🔧 Admin: useEffect triggered - initializing data fetch');
    fetchBaseDevelopmentalGoalsAdmin().then(devGoals => {
      console.log('🔧 Admin: Developmental goals fetched, count:', devGoals.length);
      setAllDevelopmentalGoals(devGoals);
      if (devGoals.length > 0) {
        console.log('🔧 Admin: Proceeding to fetch products');
        fetchProducts(devGoals);
      } else {
        console.warn('⚠️ Admin: No developmental goals found, skipping product fetch');
        setLoading(false);
        setProducts([]);
      }
    });
  }, []);

  const refetchAdminProducts = () => {
    console.log('🔧 Admin: Manual refetch triggered');
    if (allDevelopmentalGoals.length > 0) {
      fetchProducts(allDevelopmentalGoals);
    } else {
      fetchBaseDevelopmentalGoalsAdmin().then(devGoals => {
        setAllDevelopmentalGoals(devGoals);
        fetchProducts(devGoals);
      });
    }
  }

  console.log('🔧 Admin: Hook returning - products:', products.length, 'loading:', loading);

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: refetchAdminProducts,
  };
};
