import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Crown, Save } from "lucide-react";
import { usePricingConfigurations, useUpdatePricingConfiguration } from "@/hooks/usePricingConfigurations";
import { useToast } from "@/hooks/use-toast";

const PremiumMembershipPricing = () => {
  const { data: configurations = [], isLoading } = usePricingConfigurations();
  const updateConfiguration = useUpdatePricingConfiguration();
  const { toast } = useToast();
  
  const [sessionPrice, setSessionPrice] = useState("");

  const sessionConfig = configurations.find(c => c.session_type === 'playpath' && c.user_type === 'standard');

  // Update form fields when data loads
  useEffect(() => {
    if (sessionConfig) {
      setSessionPrice(sessionConfig.base_price?.toString() || "");
    }
  }, [sessionConfig]);

  const handleSave = async () => {
    if (!sessionConfig) {
      toast({
        title: "Error",
        description: "Session configuration not found",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateConfiguration.mutateAsync({
        id: sessionConfig.id,
        base_price: sessionPrice ? Number(sessionPrice) : undefined
      });
      
      toast({
        title: "Success",
        description: "Session pricing updated successfully",
      });
    } catch (error) {
      console.error('Failed to update session pricing:', error);
      toast({
        title: "Error",
        description: "Failed to update session pricing",
        variant: "destructive"
      });
    }
  };

  const hasChanges = sessionConfig && (
    sessionPrice !== (sessionConfig.base_price?.toString() || "")
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Session Pricing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-500" />
          Session Pricing Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sessionConfig && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-amber-800">Current Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-amber-700 font-medium">Base Price: </span>
                <Badge variant="outline" className="ml-2">
                  ₹{sessionConfig.base_price?.toLocaleString() || 'Not set'}
                </Badge>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="session-price">Session Price (₹)</Label>
            <Input
              id="session-price"
              type="number"
              placeholder="Enter price"
              value={sessionPrice}
              onChange={(e) => setSessionPrice(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Standard price for PlayPath sessions
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={updateConfiguration.isPending || !hasChanges}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {updateConfiguration.isPending ? 'Saving...' : 'Save Configuration'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PremiumMembershipPricing;
