
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface FooterLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: any) => void;
  editingLink?: any;
}

const FooterLinkDialog = ({ isOpen, onClose, onSave, editingLink }: FooterLinkDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: '',
    sort_order: 0,
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingLink) {
      setFormData({
        title: editingLink.title || '',
        url: editingLink.url || '',
        category: editingLink.category || '',
        sort_order: editingLink.sort_order || 0,
        is_active: editingLink.is_active ?? true
      });
    } else {
      setFormData({
        title: '',
        url: '',
        category: '',
        sort_order: 0,
        is_active: true
      });
    }
    setErrors({});
  }, [editingLink, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      // Basic URL validation
      try {
        new URL(formData.url.startsWith('http') ? formData.url : `https://${formData.url}`);
      } catch {
        newErrors.url = 'Please enter a valid URL';
      }
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    console.log('FooterLinkDialog: Starting save process');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('FooterLinkDialog: Validation failed', errors);
      toast.error('Please fix the validation errors');
      return;
    }

    setLoading(true);

    try {
      // Ensure URL has protocol
      let processedUrl = formData.url.trim();
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = `https://${processedUrl}`;
      }

      const linkData = {
        ...formData,
        url: processedUrl,
        title: formData.title.trim(),
        category: formData.category.trim()
      };

      console.log('FooterLinkDialog: Processed link data:', linkData);

      await onSave(linkData);
      
      console.log('FooterLinkDialog: Save successful');
      toast.success(editingLink ? 'Link updated successfully' : 'Link created successfully');
      onClose();
    } catch (error: any) {
      console.error('FooterLinkDialog: Save failed:', error);
      toast.error(error.message || 'Failed to save link');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Company',
    'Product',
    'Support',
    'Legal',
    'Social'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingLink ? 'Edit Footer Link' : 'Add Footer Link'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Link title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
              className={errors.url ? 'border-red-500' : ''}
            />
            {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
            <p className="text-xs text-gray-500">
              Include https:// or it will be added automatically
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
            <p className="text-xs text-gray-500">
              Lower numbers appear first in the footer
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_active">Active (show in footer)</Label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : editingLink ? 'Update Link' : 'Add Link'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FooterLinkDialog;
