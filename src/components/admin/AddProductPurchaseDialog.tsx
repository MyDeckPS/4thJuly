import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, User, Package, Calendar, DollarSign } from "lucide-react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useCreateProductPurchase, CreateProductPurchaseData } from "@/hooks/useUserProductPurchases";
import { toast } from "sonner";

interface AddProductPurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedUserId?: string;
}

const AddProductPurchaseDialog = ({ isOpen, onClose, preselectedUserId }: AddProductPurchaseDialogProps) => {
  const [step, setStep] = useState(1); // 1: Select User, 2: Select Product, 3: Confirm Details
  const [selectedUserId, setSelectedUserId] = useState<string>(preselectedUserId || "");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [userSearchQuery, setUserSearchQuery] = useState<string>("");
  const [productSearchQuery, setProductSearchQuery] = useState<string>("");
  const [purchaseDetails, setPurchaseDetails] = useState<{
    purchase_price: string;
    admin_notes: string;
    verification_status: "pending" | "verified" | "disputed";
  }>({
    purchase_price: "",
    admin_notes: "",
    verification_status: "verified"
  });

  const { data: users } = useUserManagement("all", userSearchQuery);
  const { products } = useAdminProducts();
  const { mutate: createPurchase, isPending: isCreating } = useCreateProductPurchase();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (preselectedUserId) {
        setSelectedUserId(preselectedUserId);
        setStep(2); // Skip user selection if user is preselected
      } else {
        setStep(1);
        setSelectedUserId("");
      }
      setSelectedProductId("");
      setUserSearchQuery("");
      setProductSearchQuery("");
      setPurchaseDetails({
        purchase_price: "",
        admin_notes: "",
        verification_status: "verified"
      });
    }
  }, [isOpen, preselectedUserId]);

  const selectedUser = users?.find(user => user.id === selectedUserId);
  const selectedProduct = products?.find(product => product.id === selectedProductId);

  const filteredProducts = products?.filter(product => 
    product.title.toLowerCase().includes(productSearchQuery.toLowerCase())
  ) || [];

  const handleNext = () => {
    if (step === 1 && selectedUserId) {
      setStep(2);
    } else if (step === 2 && selectedProductId) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    if (!selectedUserId || !selectedProductId) {
      toast.error("Please select both a user and a product");
      return;
    }

    const purchaseData: CreateProductPurchaseData = {
      user_id: selectedUserId,
      product_id: selectedProductId,
      purchase_source: "manual_admin",
      purchase_price: purchaseDetails.purchase_price ? parseFloat(purchaseDetails.purchase_price) : undefined,
      admin_notes: purchaseDetails.admin_notes || undefined,
      verification_status: purchaseDetails.verification_status
    };

    createPurchase(purchaseData, {
      onSuccess: () => {
        onClose();
        toast.success(`Product purchase added to ${selectedUser?.name}'s dashboard`);
      }
    });
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Step 1: Select User</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userSearch">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="userSearch"
                  placeholder="Search by name or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {users?.map((user) => (
                <Card 
                  key={user.id} 
                  className={`cursor-pointer transition-all ${
                    selectedUserId === user.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">Standard</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Quiz: {user.quiz_completed ? '✓ Done' : '✗ Pending'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Step 2: Select Product</h3>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected User:</strong> {selectedUser?.name} ({selectedUser?.email})
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="productSearch">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="productSearch"
                  placeholder="Search products..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className={`cursor-pointer transition-all ${
                    selectedProductId === product.id ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedProductId(product.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{product.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Age: {product.age_group}</p>
                      </div>
                      <div className="text-right ml-4">
                        {product.price && (
                          <p className="font-semibold text-lg">₹{product.price}</p>
                        )}
                        {product.featured && (
                          <Badge variant="outline" className="mt-1">Featured</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Step 3: Purchase Details</h3>
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User:</span>
                <span className="text-sm">{selectedUser?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Product:</span>
                <span className="text-sm">{selectedProduct?.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">List Price:</span>
                <span className="text-sm">₹{selectedProduct?.price || 'Not set'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Actual Purchase Price (Optional)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="purchasePrice"
                    type="number"
                    placeholder={`Default: ₹${selectedProduct?.price || 0}`}
                    value={purchaseDetails.purchase_price}
                    onChange={(e) => setPurchaseDetails(prev => ({ ...prev, purchase_price: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationStatus">Verification Status</Label>
                <Select 
                  value={purchaseDetails.verification_status} 
                  onValueChange={(value: "pending" | "verified" | "disputed") => 
                    setPurchaseDetails(prev => ({ ...prev, verification_status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending Verification</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add any notes about this purchase..."
                  value={purchaseDetails.admin_notes}
                  onChange={(e) => setPurchaseDetails(prev => ({ ...prev, admin_notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Add Product Purchase to User Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-8 h-0.5 ${
                      step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {renderStepContent()}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {step > 1 && !preselectedUserId && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {step < 3 ? (
                <Button 
                  onClick={handleNext} 
                  disabled={(step === 1 && !selectedUserId) || (step === 2 && !selectedProductId)}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isCreating || !selectedUserId || !selectedProductId}
                >
                  {isCreating ? "Adding..." : "Add Purchase"}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductPurchaseDialog; 