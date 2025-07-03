import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useProducts } from '@/hooks/useProducts';
import { useCollections } from '@/hooks/useCollections';
import { useShopSections } from '@/hooks/useShopSections';
import { useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import HeroBanner from '@/components/shop/HeroBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Grid, List, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCarousel, { CarouselArrows } from '@/components/shop/ProductCarousel';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useDevelopmentalData } from '@/hooks/useDevelopmentalData';

const categories = [
  {
    name: 'Building & Construction',
    count: 87,
    subcategories: ['Blocks', 'Magnetic Tiles', 'Engineering Sets', 'Architecture Kits'],
  },
  {
    name: 'Arts & Crafts',
    count: 65,
    subcategories: ['Drawing Supplies', 'Clay & Modeling', 'Painting Sets', 'Jewelry Making'],
  },
  {
    name: 'Musical Instruments',
    count: 43,
    subcategories: ['Keyboards', 'Percussion', 'String Instruments', 'Music Learning'],
  },
  {
    name: 'Puzzles & Games',
    count: 78,
    subcategories: ['Jigsaw Puzzles', 'Brain Teasers', 'Board Games', 'Memory Games'],
  },
  {
    name: 'Outdoor & Active',
    count: 56,
    subcategories: ['Sports Equipment', 'Ride-On Toys', 'Sand & Water', 'Garden Tools'],
  },
  {
    name: 'Pretend Play',
    count: 92,
    subcategories: ['Dress Up', 'Play Kitchen', 'Doctor Kits', 'Tool Sets'],
  },
];

const quickStats = [
  { label: 'Total Products', value: '500+' },
  { label: 'Age Categories', value: '12' },
  { label: 'Product Categories', value: '25' },
  { label: 'Parent Satisfaction', value: '98%' },
];

const ShopPage = () => {
  const { products, loading } = useProducts();
  const { collections } = useCollections();
  const { sections } = useShopSections();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [devCurrent, setDevCurrent] = useState(0);
  const [devCarouselApi, setDevCarouselApi] = useState<CarouselApi | null>(null);
  const { developmentalLevels, loading: levelsLoading } = useDevelopmentalData();

  // Get hero slideshow configuration from admin
  const heroSection = sections.find(s => s.section_type === 'hero_slideshow' && s.is_active);

  // Age-based collections (published only)
  const ageCollections = collections.filter(c => c.published);

  // Featured products
  const featuredProducts = products.filter(p => p.featured).slice(0, 6);

  // Only show published collections
  const displayCollections = collections.filter(c => c.published);
  // Responsive settings for carousel
  const devSlidesPerView = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 4;
  const devTotalPages = Math.ceil(displayCollections.length / devSlidesPerView);
  // Count products per collection
  const getProductCount = (collectionId: string) =>
    products.filter(product =>
      product.product_collections &&
      product.product_collections.some((pc: any) => pc.collection_id === collectionId)
    ).length;

  // Find STEM & Robotics and Math Busters collections
  const stemCollection = collections.find(c => c.title.toLowerCase().includes('stem'));
  const mathBustersCollection = collections.find(c => c.title.toLowerCase().includes('math busters'));

  // Filter products for each collection
  const getProductsForCollection = (collectionId: string) =>
    products.filter(product =>
      product.product_collections &&
      product.product_collections.some(pc => pc.collection_id === collectionId)
    );

  const stemProducts = stemCollection ? getProductsForCollection(stemCollection.id).slice(0, 8) : [];
  const mathBustersProducts = mathBustersCollection ? getProductsForCollection(mathBustersCollection.id).slice(0, 8) : [];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-accent/5 to-warm/10 pt-32 md:pt-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4" style={{ backgroundColor: '#FFE5B4', color: '#FB5607' }}>Complete Collection</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Explore All Our Toys & Collections
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover our entire range of developmental toys organized by age, category, and learning objectives. Find the perfect toy for every stage of your child's development.
            </p>
            <Button
              asChild
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full text-base font-semibold shadow-sm mb-2"
            >
              <Link to="/quiz">
                Personalize Your Experience
              </Link>
            </Button>
          </div>
          {/* Hero Carousel - using admin-configured slides, now inside hero section */}
          {heroSection && (
            <HeroBanner sectionConfig={heroSection.config} />
          )}
        </div>
      </section>

      {/* Developmental Collections Carousel */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 mb-4 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm">Shop by Collection</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Developmental Collections</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Carefully curated toys organized by collection to support your child's growth journey.
            </p>
          </div>
          <Carousel
            opts={{ loop: false }}
            className="w-full"
            setApi={api => {
              setDevCarouselApi(api);
              if (api) {
                api.on('select', () => setDevCurrent(api.selectedScrollSnap()));
              }
            }}
          >
            <CarouselContent>
              {displayCollections.map((collection, idx) => (
                <CarouselItem
                  key={collection.id}
                  className="md:basis-1/4 basis-full"
                >
                  <Link
                    to={`/collections/${collection.id}`}
                    className="block rounded-2xl shadow bg-white hover:shadow-lg transition p-6 text-center border border-gray-100 hover:border-purple-200 h-full"
                  >
                    <div className="text-4xl mb-4">{collection.icon}</div>
                    <h3 className="font-semibold text-lg mb-2">{collection.title}</h3>
                    {collection.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{collection.description}</p>
                    )}
                    <div className="mt-2 text-xs font-medium text-purple-700 bg-purple-100 rounded-full inline-block px-3 py-1">
                      {getProductCount(collection.id)} toys
                    </div>
                    <div className="mt-4 text-sm text-purple-600 font-semibold flex items-center justify-center gap-1">
                      Explore <span aria-hidden>→</span>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Pagination dots */}
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: devTotalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all duration-200 ${devCurrent === i ? 'bg-purple-600 w-6' : 'bg-purple-200'}`}
                  onClick={() => {
                    if (devCarouselApi) devCarouselApi.scrollTo(i * devSlidesPerView);
                  }}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          </Carousel>
        </div>
      </section>

      {/* STEM & Robotics Carousel */}
      {stemCollection && stemProducts.length > 0 && (
        <section className="py-16 bg-[#F8F7FD]">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <span className="inline-block rounded-full bg-purple-100 text-purple-700 font-extrabold text-3xl px-10 py-3 tracking-tight">{stemCollection.title}</span>
            </div>
            <ProductCarousel
              title={stemCollection.title}
              products={stemProducts}
              loading={loading}
              showTitle={false}
              renderArrows={() => <CarouselArrows />}
            />
          </div>
        </section>
      )}

      {/* Math Busters Carousel */}
      {mathBustersCollection && mathBustersProducts.length > 0 && (
        <section className="py-16 bg-[#F8F7FD]">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <span className="inline-block rounded-full bg-purple-100 text-purple-700 font-extrabold text-3xl px-10 py-3 tracking-tight">{mathBustersCollection.title}</span>
            </div>
                <ProductCarousel 
              title={mathBustersCollection.title}
              products={mathBustersProducts}
                  loading={loading}
              showTitle={false}
              renderArrows={() => <CarouselArrows />}
            />
          </div>
        </section>
      )}

      {/* Featured Products Section - match homepage design */}
      <section className="py-20 bg-[#FFF8F3]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 mb-4 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm">Bestsellers</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Top-rated toys loved by families worldwide
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl h-80" />
                ))
              : featuredProducts.slice(0, 4).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </div>
      </section>

      {/* Age Group Section (replaces Browse by Category) */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Age Group</h2>
            <p className="text-muted-foreground">Find toys curated for every developmental stage</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {collections.filter(c => /\d{1,2}\s*-\s*\d{1,2}/.test(c.title)).map(collection => (
              <Link
                key={collection.id}
                to={`/collections/${collection.id}`}
                className="block rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition p-8 text-center group h-full"
              >
                <div className="text-4xl mb-4 flex items-center justify-center">{collection.icon}</div>
                <div className="text-2xl font-bold mb-2 text-gray-900 transition-colors group-hover:text-[#FB5607]">{collection.title}</div>
                <div className="text-sm text-gray-500 mb-2 line-clamp-2 min-h-[2.5em]">{collection.description}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ShopPage;
