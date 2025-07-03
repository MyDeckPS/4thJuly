
import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Package, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '@/hooks/useCollections';
import { useShopSections } from '@/hooks/useShopSections';
import { useProducts } from '@/hooks/useProducts';
import { usePersonalizedProducts } from '@/hooks/usePersonalizedProducts';
import { useAuth } from '@/contexts/AuthContext';

interface DynamicCollectionsSectionProps {
  title?: string;
  sectionType?: 'collections_carousel';
  className?: string;
}

const DynamicCollectionsSection = ({ 
  title = 'Shop by Collection',
  sectionType = 'collections_carousel',
  className = ''
}: DynamicCollectionsSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { collections, loading } = useCollections();
  const { sections } = useShopSections();
  const { products } = useProducts();
  const { data: personalizedProducts, isLoading: personalizedLoading } = usePersonalizedProducts();

  // Find the active collections carousel section
  const activeSection = sections.find(
    section => section.section_type === sectionType && section.is_active
  );

  // Get collections to display based on section configuration
  let displayCollections = collections.filter(collection => collection.published);
  
  if (activeSection?.config?.collections && activeSection.config.collections.length > 0) {
    displayCollections = collections.filter(collection => 
      collection.published && activeSection.config.collections.includes(collection.id)
    );
  }

  // Sort by sort_order
  displayCollections = displayCollections.sort((a, b) => a.sort_order - b.sort_order);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCollectionClick = (collectionId: string) => {
    navigate(`/collections/${collectionId}`);
  };

  const getCollectionProductCount = (collectionId: string) => {
    return products.filter(product => 
      product.product_collections?.some((pc: any) => pc.collection_id === collectionId)
    ).length;
  };

  const getRecommendedProductCount = (collectionId: string) => {
    if (!personalizedProducts || !user) return 0;

    // Get all personalized product IDs
    const personalizedProductIds = new Set(personalizedProducts.map(p => p.id));

    // Count products in this collection that are also in personalized products
    return products.filter(product => 
      product.product_collections?.some((pc: any) => pc.collection_id === collectionId) && 
      personalizedProductIds.has(product.id)
    ).length;
  };

  if (loading) {
    return (
      <div className={`mb-12 ${className}`}>
        <h2 className="text-2xl font-bold text-neutral-950 mb-6">
          {activeSection?.title || title}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3 mx-auto" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!displayCollections.length) return null;

  return (
    <div className={`mb-12 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-950">
          {activeSection?.title || title}
        </h2>
        {displayCollections.length > 4 && (
          <div className="hidden md:flex space-x-2">
            <Button variant="outline" size="icon" onClick={() => scroll('left')} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => scroll('right')} className="h-8 w-8">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div 
        ref={scrollRef} 
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory md:overflow-hidden"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {displayCollections.map(collection => {
          const totalProducts = getCollectionProductCount(collection.id);
          const recommendedProducts = getRecommendedProductCount(collection.id);
          
          return (
            <div key={collection.id} className="flex-none w-64 snap-start">
              <Card 
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 h-full relative"
                onClick={() => handleCollectionClick(collection.id)}
              >
                <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {collection.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-forest mb-2 group-hover:text-warm-sage transition-colors">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {collection.description}
                    </p>
                  )}
                  
                  {/* Product Count Information */}
                  <div className="flex items-center justify-center gap-4 mt-auto">
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-zinc-100">
                        <Package className="w-3 h-3 text-neutral-800" />
                      </div>
                      <span className="text-xs text-neutral-800">{totalProducts}</span>
                    </div>
                    
                    {user && !personalizedLoading && recommendedProducts > 0 && (
                      <div className="flex items-center gap-1 bg-emerald-50 rounded-full px-[8px]">
                        <div className="w-6 h-6 bg-emerald-50 flex items-center justify-center bg-transparent rounded-none">
                          <Star className="w-3 h-3 text-rose-600" />
                        </div>
                        <span className="text-xs text-rose-600 font-medium">{recommendedProducts}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DynamicCollectionsSection;
