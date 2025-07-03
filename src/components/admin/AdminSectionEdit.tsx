
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SectionEditProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  section: any;
}

const AdminSectionEdit = ({ isOpen, onClose, onUpdate, section }: SectionEditProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    if (section) {
      setFormData({
        title: section.title || '',
        sort_order: section.sort_order || 0,
        is_active: section.is_active ?? true
      });
    }
  }, [section]);

  const handleSave = async () => {
    if (!section) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('shop_sections')
        .update(formData)
        .eq('id', section.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Section updated successfully",
      });

      onUpdate();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update section",
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
          <DialogTitle>Edit Section: {section?.section_type}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Custom Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter custom title"
            />
          </div>

          <div>
            <Label>Sort Order</Label>
            <Input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
            />
            <Label>Show this section on the shop page</Label>
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

export default AdminSectionEdit;
