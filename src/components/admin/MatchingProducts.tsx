
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/hooks/useProducts';

interface MatchingProductsProps {
  collectionTags: string[];
  products: Product[];
}

const MatchingProducts = ({ collectionTags, products }: MatchingProductsProps) => {
  const matchingProducts = useMemo(() => {
    return products.filter(product => {
      const productTags = Array.isArray(product.tags) ? product.tags : [];
      return collectionTags.some(tag => productTags.includes(tag));
    });
  }, [collectionTags, products]);

  if (matchingProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matching Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No products currently match this collection's tags.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matching Products ({matchingProducts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {matchingProducts.map((product) => {
            const productTags = Array.isArray(product.tags) ? product.tags : [];
            const matchingTags = productTags.filter(tag => collectionTags.includes(tag));
            const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
            
            return (
              <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                {primaryImage && (
                  <img
                    src={primaryImage.image_url}
                    alt={primaryImage.alt_text || product.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{product.title}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {matchingTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={product.published ? "default" : "secondary"}>
                    {product.published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchingProducts;
