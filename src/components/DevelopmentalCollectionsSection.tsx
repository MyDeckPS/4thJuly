import { useCollections } from '@/hooks/useCollections';
import { useProducts } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useState, useRef } from 'react';

const DevelopmentalCollectionsSection = () => {
  const { collections, loading } = useCollections();
  const { products } = useProducts();
  const [current, setCurrent] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  // Only show published collections
  const displayCollections = collections.filter(c => c.published);

  // Responsive settings
  const slidesPerView = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 4;
  const totalPages = Math.ceil(displayCollections.length / slidesPerView);

  // Count products per collection
  const getProductCount = (collectionId: string) =>
    products.filter(product =>
      product.product_collections &&
      product.product_collections.some((pc: any) => pc.collection_id === collectionId)
    ).length;

  if (loading) {
    return null;
  }

  // Group collections into pages
  const pages = [];
  for (let i = 0; i < displayCollections.length; i += slidesPerView) {
    pages.push(displayCollections.slice(i, i + slidesPerView));
  }

  return (
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
            setCarouselApi(api);
            if (api) {
              api.on('select', () => setCurrent(api.selectedScrollSnap()));
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
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-200 ${current === i ? 'bg-purple-600 w-6' : 'bg-purple-200'}`}
                onClick={() => {
                  if (carouselApi) carouselApi.scrollTo(i * slidesPerView);
                }}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default DevelopmentalCollectionsSection; 