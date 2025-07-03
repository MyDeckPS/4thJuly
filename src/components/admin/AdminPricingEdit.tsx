import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PricingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  pricing: any;
}

type SessionType = 'playpath' | 'consultation';
type UserType = 'standard' | 'premium';

const AdminPricingEdit = ({ isOpen, onClose, onUpdate, pricing }: PricingEditModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    session_type: SessionType;
    user_type: UserType;
    base_price: number;
    compare_at_price: number | null;
    is_active: boolean;
  }>({
    session_type: 'playpath',
    user_type: 'standard',
    base_price: 0,
    compare_at_price: null,
    is_active: true
  });

  // Reset form data when pricing prop changes
  useEffect(() => {
    if (pricing) {
      setFormData({
        session_type: pricing.session_type || 'playpath',
        user_type: pricing.user_type || 'standard',
        base_price: pricing.base_price || 0,
        compare_at_price: pricing.compare_at_price || null,
        is_active: pricing.is_active ?? true
      });
    } else {
      // Reset to defaults for new entries
      setFormData({
        session_type: 'playpath',
        user_type: 'standard',
        base_price: 0,
        compare_at_price: null,
        is_active: true
      });
    }
  }, [pricing, isOpen]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        session_type: formData.session_type,
        user_type: formData.user_type,
        base_price: Number(formData.base_price) || 0,
        compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
        is_active: formData.is_active
      };

      console.log('Saving pricing data:', updateData);

      if (pricing?.id) {
        // Update existing - only update the specific record by ID
        const { error } = await supabase
          .from('session_pricing_configurations')
          .update(updateData)
          .eq('id', pricing.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
      } else {
        // For new entries, check if combination already exists
        const { data: existing, error: checkError } = await supabase
          .from('session_pricing_configurations')
          .select('id')
          .eq('session_type', formData.session_type)
          .eq('user_type', formData.user_type)
          .maybeSingle();

        if (checkError) {
          console.error('Check error:', checkError);
          throw checkError;
        }

        if (existing) {
          toast({
            title: "Configuration Already Exists",
            description: `A pricing configuration for ${formData.session_type} sessions and ${formData.user_type} users already exists. Please edit the existing one instead.`,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Create new
        const { error } = await supabase
          .from('session_pricing_configurations')
          .insert(updateData);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
      }

      toast({
        title: "Success",
        description: "Pricing configuration updated successfully",
      });

      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update pricing configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {pricing?.id ? 'Edit Pricing Configuration' : 'Add Pricing Configuration'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Session Type</Label>
            <Select 
              value={formData.session_type} 
              onValueChange={(value: SessionType) => setFormData({...formData, session_type: value})}
              disabled={!!pricing?.id} // Disable editing session_type for existing records
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="playpath">PlayPath</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>User Type</Label>
            <Select 
              value={formData.user_type} 
              onValueChange={(value: UserType) => setFormData({...formData, user_type: value})}
              disabled={!!pricing?.id} // Disable editing user_type for existing records
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Base Price (₹)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.base_price}
              onChange={(e) => setFormData({...formData, base_price: Number(e.target.value) || 0})}
            />
          </div>

          <div>
            <Label>Compare At Price (₹) - Optional</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.compare_at_price || ''}
              onChange={(e) => setFormData({...formData, compare_at_price: e.target.value ? Number(e.target.value) : null})}
              placeholder="Original/crossed out price"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
            />
            <Label>Active</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPricingEdit;
