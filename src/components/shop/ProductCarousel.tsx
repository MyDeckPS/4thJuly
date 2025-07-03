import { useRef, useContext, createContext, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/hooks/useProducts';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  loading?: boolean;
  showTitle?: boolean;
  renderArrows?: (() => ReactNode) | null;
}

const CarouselContext = createContext<{ scroll: (dir: 'left' | 'right') => void } | null>(null);

const ProductCarousel = ({
  title,
  products,
  loading,
  showTitle = true,
  renderArrows = null
}: ProductCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of one card plus gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  if (loading) {
    return <div className="mb-12">
      {/* Title row: pill left, arrows right */}
      {!showTitle ? (
        <div className="flex items-center justify-between mb-6">
          <div /> {/* pill will be rendered by parent */}
          {renderArrows && <div className="flex space-x-2">{renderArrows()}</div>}
        </div>
      ) : (
        showTitle && <h2 className="text-2xl font-bold text-forest mb-6">{title}</h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-square bg-muted rounded-t-lg" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        </div>)}
      </div>
    </div>;
  }
  if (!products.length) return null;
  return (
    <CarouselContext.Provider value={{ scroll }}>
      <div className="mb-12">
        {/* Title row: pill left, arrows right */}
        {!showTitle ? (
          <div className="flex items-center justify-between mb-6">
            <div /> {/* pill will be rendered by parent */}
            {renderArrows && <div className="flex space-x-2">{renderArrows()}</div>}
          </div>
        ) : (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-950">{title}</h2>
            <div className="hidden md:flex space-x-2">
              <Button variant="outline" size="icon" onClick={() => scroll('left')} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => scroll('right')} className="h-8 w-8">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory md:overflow-hidden touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map(product => <div key={product.id} className="flex-none w-72 snap-start">
            <ProductCard product={product} />
          </div>)}
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export function CarouselArrows() {
  const ctx = useContext(CarouselContext);
  if (!ctx) return null;
  return (
    <>
      <Button variant="outline" size="icon" onClick={() => ctx.scroll('left')} className="h-8 w-8">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => ctx.scroll('right')} className="h-8 w-8">
        <ArrowRight className="h-4 w-4" />
      </Button>
    </>
  );
}

export default ProductCarousel;