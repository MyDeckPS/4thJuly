
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CollectionProductsManagerProps {
  collectionId: string;
  collectionTitle: string;
}

interface ProductInCollection {
  id: string;
  title: string;
  price: number | null;
  featured: boolean;
  tags: string[];
  primary_image?: string;
}

const CollectionProductsManager = ({ collectionId, collectionTitle }: CollectionProductsManagerProps) => {
  const [products, setProducts] = useState<ProductInCollection[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductInCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const productsPerPage = 5;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  useEffect(() => {
    fetchProductsInCollection();
  }, [collectionId]);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm]);

  const fetchProductsInCollection = async () => {
    try {
      setLoading(true);
      setError(null);
      const logger = (window as any).debugLogger_Collections;
      logger?.info('Fetching products for collection', { 
        collectionId, 
        collectionTitle 
      });

      // Fetch products with their primary images
      const { data, error } = await supabase
        .from('product_collections')
        .select(`
          product:products(
            id,
            title,
            price,
            featured,
            tags,
            product_images!inner(
              image_url,
              is_primary
            )
          )
        `)
        .eq('collection_id', collectionId);

      if (error) throw error;

      const productsData = (data || [])
        .filter(item => item.product)
        .map((item: any) => {
          const product = item.product;
          const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url || 
                              product.product_images?.[0]?.image_url;
          
          return {
            id: product.id,
            title: product.title,
            price: product.price,
            featured: product.featured,
            tags: Array.isArray(product.tags) ? product.tags : [],
            primary_image: primaryImage
          };
        });

      setProducts(productsData);
      logger?.info('Products fetched successfully', { 
        count: productsData.length,
        products: productsData.map(p => ({ id: p.id, title: p.title }))
      });

    } catch (error: any) {
      console.error('Error fetching products:', error);
      const logger = (window as any).debugLogger_Collections;
      logger?.error('Failed to fetch products', { 
        collectionId, 
        error: error.message || error 
      });
      
      setError(error.message || 'Failed to load products');
      toast({
        title: "Error",
        description: `Failed to load products for this collection: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = (productId: string) => {
    const logger = (window as any).debugLogger_Collections;
    logger?.info('Opening product in new tab', { productId });
    window.open(`/shop/product/${productId}`, '_blank');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRetry = () => {
    fetchProductsInCollection();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Products in "{collectionTitle}"</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading products...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Products in "{collectionTitle}"</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Error: {error}</span>
          </div>
          <Button onClick={handleRetry} variant="outline" size="sm">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Products in "{collectionTitle}" ({products.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? 'No products found matching your search.' : 'No products in this collection yet.'}
            </p>
            {!searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                Products can be added to collections from the Products management section.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {currentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {product.primary_image && (
                      <img 
                        src={product.primary_image} 
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{product.title}</h4>
                        {product.featured && (
                          <Badge variant="default" className="text-xs">Featured</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {product.price && (
                          <span className="text-sm text-muted-foreground">₹{product.price}</span>
                        )}
                        {product.tags.length > 0 && (
                          <div className="flex gap-1">
                            {product.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {product.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{product.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewProduct(product.id)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(startIndex + productsPerPage, filteredProducts.length)} of {filteredProducts.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">
                    {currentPage} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CollectionProductsManager;
