import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({
  product
}: ProductCardProps) => {
  const primaryImage = product.product_images.find(img => img.is_primary) || product.product_images[0];

  const formatPrice = (price: number | null) => {
    if (!price) return null;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      currencyDisplay: 'symbol'
    }).format(price).replace('₹', '₹');
  };

  const hasDiscount = product.compare_at_price && product.price && product.compare_at_price > product.price;

  return (
    <Link to={`/shop/product/${product.id}`} className="h-full">
      <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="aspect-square overflow-hidden rounded-t-lg flex-shrink-0">
            <img 
              src={primaryImage?.image_url || '/placeholder.svg'} 
              alt={primaryImage?.alt_text || product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex flex-col flex-1 p-4">
            <div className="flex flex-col h-full">
              <h3 className="line-clamp-2 group-hover:text-neutral-800 transition-colors font-normal text-lg mb-1 min-h-[48px]">
              {product.title}
            </h3>
              <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{product.developmental_level.icon}</span>
              <span className="font-medium text-sm">{product.developmental_level.name}</span>
            </div>
              <div className="text-sm text-muted-foreground mb-2">
              Age: {product.age_group}
            </div>
            {/* Developmental Goals Pills */}
            {product.developmental_goals && product.developmental_goals.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3 min-h-[32px]">
                {product.developmental_goals.slice(0, 3).map((goal) => (
                  <Badge 
                    key={goal.id} 
                    variant="secondary" 
                      className="text-xs" 
                      style={{ backgroundColor: '#FB5607', color: '#fff', border: 'none' }}
                  >
                    {goal.emoji} {goal.name}
                  </Badge>
                ))}
                {product.developmental_goals.length > 3 && (
                    <Badge variant="secondary" className="text-xs" style={{ backgroundColor: '#FB5607', color: '#fff', border: 'none' }}>
                    +{product.developmental_goals.length - 3} more
                  </Badge>
                )}
              </div>
            )}
              <div className="flex-1" />
            {/* Price Display with ₹ */}
            {product.price && (
                <div className="flex items-center justify-start gap-2 px-0 mt-auto">
                <span className="text-neutral-950 font-medium text-base">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-muted-foreground line-through text-sm font-normal">
                      {formatPrice(product.compare_at_price)}
                    </span>
                      <Badge variant="secondary" className="text-xs" style={{ backgroundColor: '#FB5607', color: '#fff', border: 'none' }}>
                      SALE
                    </Badge>
                  </>
                )}
              </div>
            )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
