import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { usePricingConfigurations } from "@/hooks/usePricingConfigurations";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminPricingEdit from "./AdminPricingEdit";
import PremiumMembershipPricing from "./PremiumMembershipPricing";

const AdminPricingSection = () => {
  const { toast } = useToast();
  const { data: configurations, isLoading, refetch } = usePricingConfigurations();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<any>(null);

  const handleEdit = (pricing: any) => {
    setSelectedPricing(pricing);
    setEditModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedPricing(null);
    setEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing configuration?')) return;

    try {
      const { error } = await supabase
        .from('session_pricing_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pricing configuration deleted successfully",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete pricing configuration",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'N/A';
    return `₹${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pricing Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">Loading pricing configurations...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Pricing Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Session Pricing Management
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Configuration
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {configurations && configurations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session Type</TableHead>
                    <TableHead>User Type</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Compare Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configurations.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="capitalize">{config.session_type}</TableCell>
                      <TableCell className="capitalize">{config.user_type}</TableCell>
                      <TableCell>{formatPrice(config.base_price)}</TableCell>
                      <TableCell>{formatPrice(config.compare_at_price)}</TableCell>
                      <TableCell>
                        <Badge variant={config.is_active ? "default" : "secondary"}>
                          {config.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(config)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(config.id)}
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No pricing configurations found. Click "Add Configuration" to create one.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Premium Membership Pricing */}
      <PremiumMembershipPricing />

      <AdminPricingEdit
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdate={refetch}
        pricing={selectedPricing}
      />
    </div>
  );
};

export default AdminPricingSection;
