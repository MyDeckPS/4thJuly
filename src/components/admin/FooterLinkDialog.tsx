
import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface FooterLinkDialogProps {
  columnId?: string;
  link?: any;
  onClose: () => void;
  linkCategory?: 'header' | 'footer';
}

const FooterLinkDialog = ({ columnId, link, onClose, linkCategory = 'footer' }: FooterLinkDialogProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    sort_order: 1,
    is_active: true,
    link_category: linkCategory,
    link_type: "external"
  });

  useEffect(() => {
    if (link) {
      setFormData({
        title: link.title || "",
        url: link.external_url || "",
        sort_order: link.sort_order || 1,
        is_active: link.is_active ?? true,
        link_category: link.link_category || linkCategory,
        link_type: link.link_type || "external"
      });
    }
  }, [link, linkCategory]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload: any = {
        title: data.title,
        external_url: data.url,
        sort_order: data.sort_order,
        is_active: data.is_active,
        link_category: data.link_category,
        link_type: data.link_type
      };

      // Only add footer_column_id for footer links and when columnId is provided
      if (data.link_category === 'footer' && columnId) {
        payload.footer_column_id = columnId;
      } else if (data.link_category === 'header') {
        // For header links, we need to set footer_column_id to null or use a default
        // Let's use the first available footer column as a workaround for the NOT NULL constraint
        const { data: firstColumn } = await supabase
          .from("footer_configurations")
          .select("id")
          .limit(1)
          .single();
        
        if (firstColumn) {
          payload.footer_column_id = firstColumn.id;
        }
      }

      console.log("Saving link with payload:", payload);

      if (link) {
        const { error } = await supabase
          .from("footer_links")
          .update(payload)
          .eq("id", link.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("footer_links")
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["footer-management"] });
      queryClient.invalidateQueries({ queryKey: ["footer-links"] });
      queryClient.invalidateQueries({ queryKey: ["header-links"] });
      queryClient.invalidateQueries({ queryKey: ["footer-columns"] });
      toast({
        title: "Success",
        description: link ? "Link updated successfully" : "Link created successfully"
      });
      onClose();
    },
    onError: (error: any) => {
      console.error("Error saving link:", error);
      toast({
        title: "Error",
        description: "Failed to save link: " + error.message,
        variant: "destructive"
      });
    },
  });

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.url.trim()) {
      toast({
        title: "Error", 
        description: "URL is required",
        variant: "destructive"
      });
      return;
    }

    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {link ? "Edit Link" : `Add ${linkCategory === 'header' ? 'Header' : 'Footer'} Link`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Link title"
            />
          </div>

          {linkCategory === 'header' && (
            <div>
              <Label htmlFor="link_category">Link Category</Label>
              <Select
                value={formData.link_category}
                onValueChange={(value: 'header' | 'footer') =>
                  setFormData({ ...formData, link_category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header Navigation</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sort_order: parseInt(e.target.value) || 1,
                })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FooterLinkDialog;
