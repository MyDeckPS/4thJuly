import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Plus, Eye } from 'lucide-react';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { Product } from '@/hooks/useProducts';
import DebugConsole from './DebugConsole';
import DatabaseDiagnostics from './DatabaseDiagnostics';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AdminProductForm from './AdminProductForm';
import { formatCurrency } from '@/utils/currency';

const AdminProductsSection = () => {
  const {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct
  } = useAdminProducts();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Add comprehensive logging
  console.log('🔍 AdminProductsSection - Products data:', {
    productsCount: products?.length || 0,
    loading,
    products: products?.slice(0, 2) // Log first 2 products for inspection
  });

  const togglePublished = async (product: Product) => {
    try {
      console.log('🔄 Toggling published status for product:', product.id);
      await updateProduct(product.id, {
        published: !product.published
      });
    } catch (error) {
      console.error('❌ Failed to toggle product status:', error);
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return '-';
    return formatCurrency(price);
  };

  if (loading) {
    console.log('⏳ AdminProductsSection - Still loading...');
    return <div>Loading products...</div>;
  }

  console.log('✅ AdminProductsSection - Rendering with products:', products.length);

  return (
    <div className="space-y-6">
      <DebugConsole module="Products" />
      <DatabaseDiagnostics />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Products Management 📦 ({products.length} products)</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
              </DialogHeader>
              <AdminProductForm
                onSubmit={async (data) => {
                  await createProduct(data);
                  setIsCreateDialogOpen(false);
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found. This could indicate a database query issue.</p>
              <p className="text-sm text-gray-400 mt-2">Check the diagnostics above for more details.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Age Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        {primaryImage && (
                          <img
                            src={primaryImage.image_url}
                            alt={primaryImage.alt_text || product.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{formatPrice(product.price)}</div>
                          {product.compare_at_price && product.compare_at_price !== product.price && (
                            <div className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.compare_at_price)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{product.developmental_level?.icon}</span>
                          <span className="text-sm">{product.developmental_level?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.age_group}</TableCell>
                      <TableCell>
                        <Badge variant={product.published ? "default" : "secondary"}>
                          {product.published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.featured && <Badge variant="outline">Featured</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={`/shop/product/${product.id}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingProduct(product)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant={product.published ? "secondary" : "default"} onClick={() => togglePublished(product)}>
                            {product.published ? "Unpublish" : "Publish"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {editingProduct && (
            <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Product: {editingProduct.title}</DialogTitle>
                </DialogHeader>
                
                <AdminProductForm
                  product={editingProduct}
                  onSubmit={async (data) => {
                    // Guard: check if editingProduct.id is a valid UUID
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                    if (!editingProduct.id || !uuidRegex.test(editingProduct.id)) {
                      console.error('❌ Invalid product id for update:', editingProduct.id);
                      alert('Error: Product ID is invalid. Please refresh the page and try again.');
                      return;
                    }
                    console.log('📝 Updating product with id:', editingProduct.id);
                    await updateProduct(editingProduct.id, data);
                    setEditingProduct(null);
                  }}
                  onCancel={() => setEditingProduct(null)}
                  onDelete={async () => {
                    await deleteProduct(editingProduct.id);
                    setEditingProduct(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProductsSection;
