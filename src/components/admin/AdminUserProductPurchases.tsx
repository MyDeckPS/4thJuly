import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Package, User, Calendar, ShoppingCart, Search, Filter, Eye, Edit2, Trash2 } from "lucide-react";
import { useUserProductPurchases, useDeleteProductPurchase } from "@/hooks/useUserProductPurchases";
import AddProductPurchaseDialog from "./AddProductPurchaseDialog";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";
import { toast } from "sonner";

const AdminUserProductPurchases = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

  const { data: purchases = [], isLoading, error } = useUserProductPurchases();
  const { mutate: deletePurchase } = useDeleteProductPurchase();

  // Filter purchases based on search and status
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = searchQuery === "" || 
      purchase.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.products?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || purchase.verification_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddPurchase = (userId?: string) => {
    setSelectedUserId(userId);
    setShowAddDialog(true);
  };

  const handleDeletePurchase = (id: string, userName: string, productTitle: string) => {
    if (window.confirm(`Are you sure you want to remove ${productTitle} from ${userName}'s purchase history?`)) {
      deletePurchase(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Package className="w-5 h-5" />
            Error Loading Product Purchases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to load product purchases: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <CardTitle>User Product Purchases</CardTitle>
            </div>
            <Button onClick={() => handleAddPurchase()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Purchase
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            Manage Amazon affiliate link purchases that users have made. Add purchases manually 
            when users call to confirm their Amazon purchases.
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by user name or product title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Total Purchases</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {purchases.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Verified</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {purchases.filter(p => p.verification_status === 'verified').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-600">Pending</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {purchases.filter(p => p.verification_status === 'pending').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Total Value</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  ₹{purchases.reduce((sum, p) => sum + (p.purchase_price || p.products?.price || 0), 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading purchases...</p>
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== "all" 
                  ? "No purchases match your current filters." 
                  : "No product purchases have been added yet."}
              </p>
              <Button onClick={() => handleAddPurchase()}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Purchase
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{purchase.profiles?.name || 'Unknown User'}</p>
                          <p className="text-sm text-gray-500">{purchase.user_id.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{purchase.products?.title}</p>
                          <p className="text-sm text-gray-500">
                            List: ₹{purchase.products?.price || 'Not set'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          ₹{purchase.purchase_price || purchase.products?.price || 0}
                        </p>
                        {purchase.purchase_price && purchase.products?.price && 
                         purchase.purchase_price !== purchase.products.price && (
                          <p className="text-xs text-orange-600">Custom price</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p>{format(new Date(purchase.purchase_date), 'MMM dd, yyyy')}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(purchase.purchase_date), 'HH:mm')}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(purchase.verification_status)}>
                          {purchase.verification_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {purchase.purchase_source === 'amazon_affiliate' ? 'Amazon' : 'Manual'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddPurchase(purchase.user_id)}
                            title="Add another purchase for this user"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePurchase(
                              purchase.id, 
                              purchase.profiles?.name || 'Unknown User', 
                              purchase.products?.title || 'Unknown Product'
                            )}
                            title="Remove purchase"
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Purchase Dialog */}
      <AddProductPurchaseDialog
        isOpen={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setSelectedUserId(undefined);
        }}
        preselectedUserId={selectedUserId}
      />
    </div>
  );
};

export default AdminUserProductPurchases; 