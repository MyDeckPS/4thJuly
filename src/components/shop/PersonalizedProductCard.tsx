
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Product } from '@/hooks/useProducts';

interface PersonalizedProductCardProps {
  product: Product;
}

const PersonalizedProductCard = ({ product }: PersonalizedProductCardProps) => {
  // Safely handle product_images that might be undefined
  const productImages = product.product_images || [];
  const primaryImage = productImages.find(img => img.is_primary) || productImages[0];

  return (
    <Link to={`/shop/product/${product.id}`}>
      <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
        <CardContent className="p-0">
          <div className="aspect-square overflow-hidden rounded-t-lg">
            <img 
              src={primaryImage?.image_url || '/placeholder.svg'} 
              alt={primaryImage?.alt_text || product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-warm-sage transition-colors text-center">
              {product.title}
            </h3>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PersonalizedProductCard;
