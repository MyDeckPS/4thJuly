import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Calendar, ExternalLink, Star } from "lucide-react";
import { useUserProductPurchasesByUser } from "@/hooks/useUserProductPurchases";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const UserProductPurchases = () => {
  const { user } = useAuth();
  const { data: purchases = [], isLoading } = useUserProductPurchasesByUser(user?.id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            My Product Purchases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your purchases...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (purchases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            My Product Purchases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
            <p className="text-gray-600 mb-4">
              Your Amazon affiliate purchases will appear here once verified.
            </p>
            <p className="text-sm text-gray-500">
              Purchased a product? Call us to add it to your dashboard!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'verified': return 'Purchase confirmed';
      case 'pending': return 'Verification pending';
      case 'disputed': return 'Under review';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          My Product Purchases ({purchases.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {purchases.map((purchase) => {
            const primaryImage = purchase.products?.product_images?.find(img => img.is_primary)?.image_url;
            
            return (
              <div key={purchase.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  {primaryImage && (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={primaryImage} 
                        alt={purchase.products?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {purchase.products?.title}
                      </h3>
                      <Badge className={getStatusColor(purchase.verification_status)}>
                        {getStatusMessage(purchase.verification_status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Purchased {format(new Date(purchase.purchase_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="font-medium text-orange-600">
                        ₹{purchase.purchase_price || purchase.products?.price || 0}
                      </div>
                    </div>

                    {purchase.admin_notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <Star className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">Admin Note</p>
                            <p className="text-sm text-blue-700">{purchase.admin_notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {purchase.products?.amazon_affiliate_link && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          onClick={() => window.open(purchase.products?.amazon_affiliate_link, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View on Amazon
                        </Button>
                      )}
                      
                      <Badge variant="outline" className="text-xs">
                        {purchase.purchase_source === 'amazon_affiliate' ? 'Amazon Purchase' : 'Manual Entry'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Total Purchases: <span className="font-medium">{purchases.length}</span>
            </span>
            <span className="text-gray-600">
              Total Value: <span className="font-medium text-orange-600">
                ₹{purchases.reduce((sum, p) => sum + (p.purchase_price || p.products?.price || 0), 0).toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProductPurchases; 