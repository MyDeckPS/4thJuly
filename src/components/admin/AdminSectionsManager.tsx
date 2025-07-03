
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, GripVertical, Settings } from 'lucide-react';
import { useShopSections } from '@/hooks/useShopSections';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import AdminSectionEditDialog from './AdminSectionEditDialog';

interface SectionConfig {
  collections?: string[];
  [key: string]: any;
}

const AdminSectionsManager = () => {
  const { sections, isLoading, updateSection, createSection, deleteSection } = useShopSections();
  const [editingSection, setEditingSection] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    section_type: 'hero_slideshow',
    sort_order: 0,
    is_active: true,
    config: {} as SectionConfig
  });

  const sectionTypes = [
    { value: 'hero_slideshow', label: 'Hero Slideshow' },
    { value: 'collections_tabs', label: 'Collections Tab Navigation' },
    { value: 'collections_carousel', label: 'Collections Carousel' },
    { value: 'product_carousel', label: 'Product Carousel' },
  ];

  const handleCreate = () => {
    setEditingSection(null);
    setFormData({
      title: '',
      section_type: 'hero_slideshow',
      sort_order: sections.length,
      is_active: true,
      config: {}
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (section: any) => {
    console.log('Editing section:', section); // Debug log
    setEditingSection(section);
    setIsEditDialogOpen(true);
  };

  const handleSectionSave = async (sectionData: any) => {
    try {
      if (editingSection) {
        await updateSection.mutateAsync({ id: editingSection.id, ...sectionData });
        toast.success('Section updated successfully');
      } else {
        await createSection.mutateAsync(sectionData);
        toast.success('Section created successfully');
      }
      setIsEditDialogOpen(false);
      setEditingSection(null);
    } catch (error: any) {
      console.error('Error saving section:', error);
      toast.error('Failed to save section');
    }
  };

  const handleSave = async () => {
    try {
      if (editingSection) {
        const { error } = await supabase
          .from('shop_sections')
          .update(formData)
          .eq('id', editingSection.id);
        if (error) throw error;
        toast.success('Section updated successfully');
      } else {
        const { error } = await supabase
          .from('shop_sections')
          .insert([formData]);
        if (error) throw error;
        toast.success('Section created successfully');
      }
      setIsDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      console.error('Error saving section:', error);
      toast.error('Failed to save section');
    }
  };

  const handleDelete = async (sectionId: string) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await deleteSection.mutateAsync(sectionId);
        toast.success('Section deleted successfully');
      } catch (error: any) {
        console.error('Error deleting section:', error);
        toast.error('Failed to delete section');
      }
    }
  };

  const handleToggleActive = async (section: any) => {
    try {
      await updateSection.mutateAsync({ 
        id: section.id, 
        is_active: !section.is_active 
      });
    } catch (error: any) {
      console.error('Error toggling section:', error);
      toast.error('Failed to update section');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Homepage Sections Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading sections...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Homepage Sections Manager</CardTitle>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sections.map((section: any) => (
              <div key={section.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                <div className="flex items-center gap-4">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-lg">
                        {section.title || `${sectionTypes.find(t => t.value === section.section_type)?.label} Section`}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        section.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {section.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Type: {sectionTypes.find(t => t.value === section.section_type)?.label}
                    </p>
                    <p className="text-sm text-gray-500">Order: {section.sort_order}</p>
                    {section.section_type === 'collections_carousel' && section.config?.collections && (
                      <p className="text-xs text-blue-600 mt-1">
                        ✓ {section.config.collections.length} collection(s) configured
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={section.is_active} 
                    onCheckedChange={() => handleToggleActive(section)}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(section)}
                    className="flex items-center gap-1"
                  >
                    <Settings className="w-4 h-4" />
                    Configure
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(section.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {sections.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No Sections Configured</h3>
                <p className="mb-4">Create your first section to get started with homepage customization.</p>
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Section
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Section Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Section title (optional)"
              />
            </div>
            
            <div>
              <Label htmlFor="section_type">Section Type</Label>
              <Select
                value={formData.section_type}
                onValueChange={(value) => setFormData({ ...formData, section_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sectionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      {editingSection && (
        <AdminSectionEditDialog
          section={editingSection}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingSection(null);
          }}
          onSave={handleSectionSave}
        />
      )}
    </div>
  );
};

export default AdminSectionsManager;
