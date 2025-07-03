import { useParams } from 'react-router-dom';
import { useCollections } from '@/hooks/useCollections';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import ProductCard from '@/components/product/ProductCard';
import CollectionSubNavigation from '@/components/shop/CollectionSubNavigation';
import PersonalizedProductCarousel from '@/components/shop/PersonalizedProductCarousel';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePersonalizedProducts } from '@/hooks/usePersonalizedProducts';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Package, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const CollectionPage = () => {
  const { id } = useParams<{ id: string }>();
  const { collections, getLinkedCollections, loading: collectionsLoading } = useCollections();
  const [linkedCollections, setLinkedCollections] = useState<any[]>([]);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [collectionProducts, setCollectionProducts] = useState<any[]>([]);
  const [linkedCollectionProducts, setLinkedCollectionProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showCurated, setShowCurated] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { data: personalizedProducts } = usePersonalizedProducts();

  const collection = collections.find(c => c.id === id);

  const fetchCollectionProducts = useCallback(async () => {
    if (!collection?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setFetchError(null);
      
      console.log('Fetching products for main collection:', collection.id);
      
      const { data, error } = await supabase
        .from('product_collections')
        .select(`
          product:products(
            id,
            title,
            description,
            age_group,
            days_to_complete,
            amazon_affiliate_link,
            developmental_level_id,
            published,
            featured,
            price,
            compare_at_price,
            tags,
            has_cognitive_development,
            has_creativity_imagination,
            has_motor_skills,
            has_stem_robotics,
            developmental_level:developmental_levels(*),
            product_images(*),
            product_accordions(*)
          )
        `)
        .eq('collection_id', collection.id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const products = (data || [])
        .filter(item => item.product && item.product.published)
        .map(item => ({
          ...item.product,
          product_collections: [{ collection_id: collection.id }]
        }));

      console.log('Main collection products:', products);
      setCollectionProducts(products);
    } catch (error: any) {
      console.error('Error fetching collection products:', error);
      setFetchError(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [collection?.id]);

  const fetchLinkedCollectionProducts = useCallback(async (linkedCollectionId: string) => {
    try {
      console.log('Fetching products for linked collection:', linkedCollectionId);
      
      const { data, error } = await supabase
        .from('product_collections')
        .select(`
          product:products(
            id,
            title,
            description,
            age_group,
            days_to_complete,
            amazon_affiliate_link,
            developmental_level_id,
            published,
            featured,
            price,
            compare_at_price,
            tags,
            has_cognitive_development,
            has_creativity_imagination,
            has_motor_skills,
            has_stem_robotics,
            developmental_level:developmental_levels(*),
            product_images(*),
            product_accordions(*)
          )
        `)
        .eq('collection_id', linkedCollectionId);

      if (error) throw error;

      const products = (data || [])
        .filter(item => item.product && item.product.published)
        .map(item => ({
          ...item.product,
          product_collections: [{ collection_id: linkedCollectionId }]
        }));

      console.log('Linked collection products:', products);
      setLinkedCollectionProducts(products);
    } catch (error) {
      console.error('Error fetching linked collection products:', error);
      setLinkedCollectionProducts([]);
    }
  }, []);

  const fetchLinkedCollections = useCallback(async () => {
    if (!collection?.id) return;
    
    try {
      const linked = await getLinkedCollections(collection.id);
      setLinkedCollections(linked);
    } catch (error) {
      console.error('Error fetching linked collections:', error);
    }
  }, [collection?.id, getLinkedCollections]);

  useEffect(() => {
    fetchCollectionProducts();
  }, [fetchCollectionProducts]);

  useEffect(() => {
    fetchLinkedCollections();
  }, [fetchLinkedCollections]);

  useEffect(() => {
    if (activeFilterId && activeFilterId !== collection?.id) {
      fetchLinkedCollectionProducts(activeFilterId);
    }
  }, [activeFilterId, collection?.id, fetchLinkedCollectionProducts]);

  const baseProducts = useMemo(() => {
    if (activeFilterId === null) {
      return collectionProducts;
    } else if (activeFilterId === collection?.id) {
      return collectionProducts;
    } else {
      return linkedCollectionProducts;
    }
  }, [collectionProducts, linkedCollectionProducts, activeFilterId, collection?.id]);

  const filteredProducts = useMemo(() => {
    if (!showCurated || !personalizedProducts) {
      return baseProducts;
    }
    
    // Filter to show only personalized products
    const personalizedProductIds = new Set(personalizedProducts.map(p => p.id));
    return baseProducts.filter(product => personalizedProductIds.has(product.id));
  }, [baseProducts, showCurated, personalizedProducts]);

  // Get product counts for the current collection
  const getCollectionProductCount = () => {
    return collectionProducts.length;
  };

  const getRecommendedProductCount = () => {
    if (!personalizedProducts || !user) return 0;
    const personalizedProductIds = new Set(personalizedProducts.map(p => p.id));
    return collectionProducts.filter(product => personalizedProductIds.has(product.id)).length;
  };

  // Show loading spinner or skeleton while collections are loading
  if (collectionsLoading) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-20 md:pt-24">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
            <p className="text-gray-500">Loading collection...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!collection) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-20 md:pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Collection Not Found</h1>
            <p className="text-gray-600">The collection you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="pb-10">
        {/* Hero Section with Card and Shine Animation */}
        <div className="container mx-auto px-4 pt-20 md:pt-24">
          <Card className="relative overflow-hidden bg-gradient-to-br from-white via-warm-peach/20 to-cream border-warm-sage/20 shadow-lg mb-8">
            {/* Shine Animation Background */}
            <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_3s_ease-in-out_infinite] -skew-x-12 opacity-50"></div>
            
            <CardContent className="relative z-10 text-center py-12 px-6 md:py-16 md:px-12">
              {/* Icon */}
              <div className="mb-6">
                <span className="text-6xl md:text-8xl drop-shadow-sm">{collection.icon}</span>
              </div>
              
              {/* Title and Description */}
              <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight" style={{ color: '#FB5607' }}>
                  {collection.title}
                </h1>
                {collection.description && (
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
                    {collection.description}
                  </p>
                )}
                
                {/* Product Count Information */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-zinc-100">
                      <Package className="w-3 h-3 text-neutral-800" />
                    </div>
                    <span className="text-sm text-neutral-800">{getCollectionProductCount()}</span>
                  </div>
                  
                  {user && getRecommendedProductCount() > 0 && (
                    <div className="flex items-center gap-1 bg-[#FFF3E6] rounded-full px-[12px] py-[2px]">
                      <div className="w-6 h-6 bg-[#FFF3E6] flex items-center justify-center bg-transparent rounded-none">
                        <Star className="w-3 h-3 text-[#FB5607]" />
                      </div>
                      <span className="text-sm text-[#FB5607] font-semibold">{getRecommendedProductCount()}</span>
                    </div>
                  )}
                </div>

                {/* Toggle Switch for All/Curated */}
                <div className="flex items-center justify-center gap-4 bg-white/50 rounded-2xl p-4 backdrop-blur-sm border border-warm-sage/10 mb-6">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-lg font-semibold transition-colors",
                      !showCurated
                        ? "text-[#FB5607]"
                        : "text-[#FB560799]"
                    )}>
                      All
                    </span>
                    <Switch
                      checked={showCurated}
                      onCheckedChange={setShowCurated}
                      className={cn(
                        "transition-colors",
                        !showCurated
                          ? "bg-[#FFF3E6] border-[#FB5607]"
                          : "bg-[#8338EC] border-[#8338EC]"
                      )}
                    />
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-lg font-semibold transition-colors",
                        showCurated
                          ? "text-[#8338EC]"
                          : "text-[#FB560799]"
                      )}>
                        Curated
                      </span>
                      <Crown className={cn(
                        "w-5 h-5 transition-colors",
                        showCurated ? "text-[#8338EC]" : "text-[#FB560799]"
                      )} />
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                {collection.tags && collection.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {collection.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" style={{ backgroundColor: '#FFF3E6', color: '#FB5607', border: '1px solid #FB560733' }}>
                        {String(tag)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Personalized Product Carousel - Premium Feature */}
          <PersonalizedProductCarousel collectionId={collection.id} />
        </div>

        {/* Mobile Fixed Toggle Switch */}
        {isMobile && (
          <div className="fixed bottom-20 right-4 z-50">
            <div className="bg-white rounded-full p-4 shadow-lg border-2 border-warm-sage/20">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-semibold transition-colors",
                  !showCurated
                    ? "text-[#FB5607]"
                    : "text-[#FB560799]"
                )}>
                  All
                </span>
                <Switch
                  checked={showCurated}
                  onCheckedChange={setShowCurated}
                  className={cn(
                    "transition-colors",
                    !showCurated
                      ? "bg-[#FFF3E6] border-[#FB5607]"
                      : "bg-[#8338EC] border-[#8338EC]"
                  )}
                />
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "text-sm font-semibold transition-colors",
                    showCurated
                      ? "text-[#8338EC]"
                      : "text-[#FB560799]"
                  )}>
                    Curated
                  </span>
                  <Crown className={cn(
                    "w-4 h-4 transition-colors",
                    showCurated ? "text-[#8338EC]" : "text-[#FB560799]"
                  )} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Collection Sub Navigation - properly positioned for mobile */}
        {linkedCollections.length > 0 && (
          <div className={cn(
            "sticky bg-white z-40 shadow-sm",
            isMobile ? "top-16" : "top-20"
          )}>
            <CollectionSubNavigation
              linkedCollections={linkedCollections}
              activeFilterId={activeFilterId}
              mainCollectionId={collection.id}
              mainCollectionTitle="All"
              onSelectFilter={setActiveFilterId}
            />
          </div>
        )}

        {/* Products section */}
        <div className="container mx-auto px-4 mt-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : fetchError ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error: {fetchError}</p>
              <button 
                onClick={fetchCollectionProducts}
                className="bg-warm-sage text-white px-4 py-2 rounded hover:bg-forest transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    {showCurated ? 
                      'No curated products found for this collection.' :
                      (activeFilterId && activeFilterId !== collection.id ? 
                        'No products found in this linked collection.' : 
                        'No products found in this collection.')
                    }
                  </p>
                  {(!activeFilterId || activeFilterId === collection.id) && !showCurated && (
                    <p className="text-sm text-gray-500 mt-2">
                      Products can be added to this collection from the Admin dashboard.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CollectionPage;
