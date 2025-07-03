
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DevelopmentalLevel {
  id: string;
  name: string;
  icon: string;
  description: string;
  sort_order: number;
}

export interface DevelopmentalGoal {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductAccordion {
  id: string;
  title: string;
  content: string;
  sort_order: number;
}

export interface ProductCollection {
  id: string;
  product_id: string;
  collection_id: string;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  age_group: string;
  days_to_complete: number;
  amazon_affiliate_link: string;
  developmental_level_id: string;
  published: boolean;
  featured: boolean;
  price: number | null;
  compare_at_price: number | null;
  tags: string[];
  created_at: string;
  
  has_cognitive_development?: boolean;
  has_creativity_imagination?: boolean;
  has_motor_skills?: boolean;
  has_stem_robotics?: boolean;

  developmental_level: DevelopmentalLevel;
  developmental_goals: DevelopmentalGoal[];
  product_images: ProductImage[];
  product_accordions: ProductAccordion[];
  product_collections?: ProductCollection[];
}

const formatProductData = (product: any, allDevGoals: DevelopmentalGoal[]): Product => {
  const selectedGoals: DevelopmentalGoal[] = [];
  
  console.log('🔧 Public: Formatting product:', product.title);
  console.log('🔧 Public: Available developmental goals:', allDevGoals.map(g => g.name));
  
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

  console.log('🔧 Public: Selected goals for product:', selectedGoals);

  return {
    ...product,
    tags: product.tags || [],
    developmental_goals: selectedGoals,
    product_images: product.product_images?.sort(
      (a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order
    ) || [],
    product_accordions: product.product_accordions?.sort(
      (a: ProductAccordion, b: ProductAccordion) => a.sort_order - b.sort_order
    ) || [],
    product_collections: product.product_collections || [],
  } as Product;
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [allDevelopmentalGoals, setAllDevelopmentalGoals] = useState<DevelopmentalGoal[]>([]);
  const { toast } = useToast();

  const fetchBaseDevelopmentalGoals = async () => {
    console.log('🔧 Public: Fetching developmental goals...');
    const { data, error } = await supabase.from('developmental_goals').select('id, name, color, emoji');
    if (error) {
      console.error("❌ Public: Error fetching developmental goals:", error);
      toast({ title: "Error", description: "Failed to load developmental goal metadata.", variant: "destructive" });
      return [];
    }
    console.log('✅ Public: Fetched developmental goals:', data);
    return data || [];
  };
  
  const fetchProducts = async (devGoals: DevelopmentalGoal[]) => {
    try {
      setLoading(true);
      console.log('🔧 Public: Starting product fetch with goals:', devGoals.map(g => g.name));
      
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
      
      console.log('🔧 Public: Executing query with string:', queryString);
      
      const { data, error } = await supabase
        .from('products')
        .select(queryString)
        .eq('published', true)
        .order('created_at', { ascending: false });

      console.log('🔧 Public: Raw query response:', { 
        dataCount: data?.length || 0, 
        error: error?.message || 'none',
        firstProduct: data?.[0] || 'none'
      });

      if (error) {
        console.error('❌ Public: Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (data) {
        console.log('🔧 Public: Processing', data.length, 'products');
        const formattedProducts = data.map((product: any) => {
          const formatted = formatProductData(product, devGoals);
          console.log('🔧 Public: Formatted product:', formatted.title, 'with goals:', formatted.developmental_goals.length);
          return formatted;
        });
        
        console.log('✅ Public: Successfully formatted', formattedProducts.length, 'products');
        setProducts(formattedProducts);
        
        if (formattedProducts.length === 0) {
          console.warn('⚠️ Public: No published products found');
        }
      } else {
        console.warn('⚠️ Public: Query returned null data');
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Public: Critical error fetching products:', error);
      toast({
        title: "Error",
        description: `Failed to load products: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setProducts([]);
    } finally {
      console.log('🔧 Public: Fetch operation completed, setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔧 Public: useEffect triggered - initializing data fetch');
    fetchBaseDevelopmentalGoals().then(devGoals => {
      console.log('🔧 Public: Developmental goals fetched, count:', devGoals.length);
      setAllDevelopmentalGoals(devGoals);
      if (devGoals.length > 0) {
        console.log('🔧 Public: Proceeding to fetch products');
        fetchProducts(devGoals);
      } else {
        console.warn('⚠️ Public: No developmental goals found, skipping product fetch');
        setLoading(false);
        setProducts([]);
      }
    });
  }, []);

  const refetch = () => {
    console.log('🔧 Public: Manual refetch triggered');
    if (allDevelopmentalGoals.length > 0) {
      fetchProducts(allDevelopmentalGoals);
    } else {
      fetchBaseDevelopmentalGoals().then(devGoals => {
        setAllDevelopmentalGoals(devGoals);
        fetchProducts(devGoals);
      });
    }
  }

  console.log('🔧 Public: Hook returning - products:', products.length, 'loading:', loading);

  return {
    products,
    loading,
    refetch
  };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [allDevelopmentalGoals, setAllDevelopmentalGoals] = useState<DevelopmentalGoal[]>([]);
  const { toast } = useToast();
  
  const fetchBaseDevelopmentalGoals = async () => {
    const { data, error } = await supabase.from('developmental_goals').select('id, name, color, emoji');
    if (error) {
      console.error("Error fetching developmental goals for product:", error);
      toast({ title: "Error", description: "Failed to load developmental goal metadata for product.", variant: "destructive" });
      return [];
    }
    return data || [];
  };

  useEffect(() => {
    const fetchProductData = async (devGoals: DevelopmentalGoal[]) => {
      if (!id) {
        setLoading(false);
        setProduct(null);
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select(`
            id, title, description, age_group, days_to_complete, amazon_affiliate_link,
            developmental_level_id, published, featured, price, compare_at_price, tags,
            has_cognitive_development, has_creativity_imagination, has_motor_skills, has_stem_robotics,
            created_at,
            developmental_level:developmental_levels(*),
            product_images(*),
            product_accordions(*)
          `)
          .eq('id', id)
          .eq('published', true)
          .single();

        if (error) throw error;

        if (data) {
          const formattedProduct = formatProductData(data, devGoals);
          setProduct(formattedProduct);
        } else {
          setProduct(null);
        }
      } catch (error: any) {
        console.error('Error fetching product:', error);
        if (error.code !== 'PGRST116') {
          toast({
            title: "Error",
            description: "Failed to load product details.",
            variant: "destructive",
          });
        }
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBaseDevelopmentalGoals().then(devGoals => {
      setAllDevelopmentalGoals(devGoals);
      if (devGoals.length > 0 || !id) {
         fetchProductData(devGoals);
      } else if (!loading && id) {
         setLoading(false);
         setProduct(null);
      }
    });

  }, [id, toast]);

  return { product, loading };
};

export const useProductsByLevel = (levelId: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [allDevelopmentalGoals, setAllDevelopmentalGoals] = useState<DevelopmentalGoal[]>([]);
  const { toast } = useToast();

  const fetchBaseDevelopmentalGoals = async () => {
    const { data, error } = await supabase.from('developmental_goals').select('id, name, color, emoji');
    if (error) {
      console.error("Error fetching developmental goals for level products:", error);
      return [];
    }
    return data || [];
  };

  useEffect(() => {
    const fetchProducts = async (devGoals: DevelopmentalGoal[]) => {
      if (!levelId) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select(`
            id, title, description, age_group, days_to_complete, amazon_affiliate_link,
            developmental_level_id, published, featured, price, compare_at_price, tags,
            has_cognitive_development, has_creativity_imagination, has_motor_skills, has_stem_robotics,
            created_at,
            developmental_level:developmental_levels(*),
            product_images(*)
          `)
          .eq('developmental_level_id', levelId)
          .eq('published', true)
          .limit(4);

        if (error) throw error;

        if (data) {
          const formattedProducts = data.map((product: any) => formatProductData(product, devGoals))
                                        .map(p => ({...p, product_accordions: [] }));
          setProducts(formattedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products by level:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBaseDevelopmentalGoals().then(devGoals => {
      setAllDevelopmentalGoals(devGoals);
      if (devGoals.length > 0 || !levelId) {
        fetchProducts(devGoals);
      } else if(!loading && levelId) {
        setLoading(false);
        setProducts([]);
      }
    });
  }, [levelId, toast]);

  return { products, loading };
};
