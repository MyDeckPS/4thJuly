import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, GripVertical, Upload, Image, Package } from "lucide-react";
import { useCollections } from "@/hooks/useCollections";
import { ShopSection } from "@/hooks/useShopSections";
import MediaLibrarySelector from "./MediaLibrarySelector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminSectionEditDialogProps {
  section: ShopSection | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (sectionData: Partial<ShopSection>) => void;
}

const AdminSectionEditDialog = ({ section, isOpen, onClose, onSave }: AdminSectionEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<ShopSection>>({});
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number>(-1);
  const { collections } = useCollections();

  // Fetch media library data for image URLs
  const { data: mediaLibrary = [] } = useQuery({
    queryKey: ['media-library'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (section) {
      setFormData(section);
    } else {
      setFormData({
        section_type: 'hero_slideshow',
        title: '',
        is_active: true,
        sort_order: 0,
        config: {}
      });
    }
  }, [section]);

  const handleSave = () => {
    onSave(formData);
  };

  const updateConfig = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value
      }
    }));
  };

  const addSlide = () => {
    const slides = formData.config?.slides || [];
    updateConfig('slides', [...slides, { 
      media_id: '', 
      image_url: '', 
      link_url: '', 
      link_type: 'none',
      title: '',
      description: ''
    }]);
  };

  const updateSlide = (index: number, field: string, value: string) => {
    const slides = [...(formData.config?.slides || [])];
    slides[index] = { ...slides[index], [field]: value };
    updateConfig('slides', slides);
  };

  const removeSlide = (index: number) => {
    const slides = formData.config?.slides || [];
    updateConfig('slides', slides.filter((_, i) => i !== index));
  };

  const handleMediaSelect = (mediaId: string) => {
    if (editingSlideIndex >= 0) {
      const selectedMedia = mediaLibrary.find(media => media.id === mediaId);
      const slides = [...(formData.config?.slides || [])];
      slides[editingSlideIndex] = { 
        ...slides[editingSlideIndex], 
        media_id: mediaId,
        image_url: selectedMedia?.file_url || ''
      };
      updateConfig('slides', slides);
    }
    setShowMediaSelector(false);
    setEditingSlideIndex(-1);
  };

  const openMediaSelector = (slideIndex: number) => {
    setEditingSlideIndex(slideIndex);
    setShowMediaSelector(true);
  };

  const addCollection = () => {
    const selectedCollections = formData.config?.collections || [];
    updateConfig('collections', [...selectedCollections, '']);
  };

  const updateCollection = (index: number, collectionId: string) => {
    const selectedCollections = [...(formData.config?.collections || [])];
    selectedCollections[index] = collectionId;
    updateConfig('collections', selectedCollections);
  };

  const removeCollection = (index: number) => {
    const selectedCollections = formData.config?.collections || [];
    updateConfig('collections', selectedCollections.filter((_, i) => i !== index));
  };

  const renderHeroSlideshowConfig = () => (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Custom Slides</Label>
          <Button onClick={addSlide} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Slide
          </Button>
        </div>
        
        {(formData.config?.slides || []).map((slide: any, index: number) => (
          <Card key={index} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Slide {index + 1}</Label>
                <Button 
                  onClick={() => removeSlide(index)} 
                  variant="outline" 
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={slide.title || ''}
                    onChange={(e) => updateSlide(index, 'title', e.target.value)}
                    placeholder="Slide title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={slide.description || ''}
                    onChange={(e) => updateSlide(index, 'description', e.target.value)}
                    placeholder="Slide description"
                  />
                </div>
              </div>
              
              <div>
                <Label>Image</Label>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => openMediaSelector(index)}
                    variant="outline"
                    size="sm"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Select from Media Library
                  </Button>
                  {slide.image_url && (
                    <img 
                      src={slide.image_url} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover rounded border"
                    />
                  )}
                </div>
              </div>
              
              <div>
                <Label>Link Type</Label>
                <Select
                  value={slide.link_type || 'none'}
                  onValueChange={(value) => updateSlide(index, 'link_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Link</SelectItem>
                    <SelectItem value="internal">Internal Link</SelectItem>
                    <SelectItem value="external">External Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {slide.link_type !== 'none' && (
                <div>
                  <Label>{slide.link_type === 'internal' ? 'Internal Path' : 'External URL'}</Label>
                  <Input
                    value={slide.link_url || ''}
                    onChange={(e) => updateSlide(index, 'link_url', e.target.value)}
                    placeholder={slide.link_type === 'internal' ? '/path' : 'https://example.com'}
                  />
                </div>
              )}
            </div>
          </Card>
        ))}
        
        {(!formData.config?.slides || formData.config.slides.length === 0) && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No slides added yet</p>
            <Button onClick={addSlide} className="mt-2" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Slide
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderCollectionsConfig = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Collections Carousel Configuration</h4>
        <p className="text-sm text-blue-700">
          Select which collections to display in the carousel. Only published collections will be shown to users.
        </p>
      </div>

      {/* Show on Quiz Completion Option */}
      {formData.section_type === 'collections_carousel' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-green-800">Show on Quiz Completion Screen</Label>
              <p className="text-xs text-green-600 mt-1">
                Display this collections carousel on the quiz success/completion screen
              </p>
            </div>
            <Switch
              checked={formData.config?.show_on_quiz_completion || false}
              onCheckedChange={(checked) => updateConfig('show_on_quiz_completion', checked)}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Selected Collections</Label>
        <Button onClick={addCollection} size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Collection
        </Button>
      </div>
      
      {(formData.config?.collections || []).map((collectionId: string, index: number) => (
        <Card key={index} className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Collection {index + 1}
              </Label>
              <Select
                value={collectionId || ''}
                onValueChange={(value) => updateCollection(index, value)}
              >
                <SelectTrigger className="min-h-[2.5rem]">
                  <SelectValue placeholder="Select a collection to display" />
                </SelectTrigger>
                <SelectContent>
                  {collections.filter(c => c.published).map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      <div className="flex items-center gap-2">
                        {collection.icon && <span className="text-lg">{collection.icon}</span>}
                        <span className="font-medium">{collection.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {collectionId && (
                <p className="text-xs text-gray-500 mt-1">
                  Collection will appear in position {index + 1} in the carousel
                </p>
              )}
            </div>
            <Button 
              onClick={() => removeCollection(index)} 
              variant="outline" 
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
      
      {(!formData.config?.collections || formData.config.collections.length === 0) && (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No Collections Selected</h3>
          <p className="mb-4 text-sm">Add collections to display in the carousel section.</p>
          <Button onClick={addCollection} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Collection
          </Button>
        </div>
      )}

      {/* Collection Display Preview */}
      {formData.config?.collections && formData.config.collections.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <Label className="text-sm font-medium text-green-800 mb-3 block">
            Preview: Selected Collections ({formData.config.collections.length})
          </Label>
          <div className="flex flex-wrap gap-2">
            {formData.config.collections.map((collectionId: string, index: number) => {
              const collection = collections.find(c => c.id === collectionId);
              return collection ? (
                <Badge key={collectionId} variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-300">
                  <span className="text-xs font-medium">{index + 1}</span>
                  {collection.icon && <span>{collection.icon}</span>}
                  {collection.title}
                </Badge>
              ) : (
                <Badge key={collectionId} variant="destructive" className="flex items-center gap-1">
                  <span className="text-xs font-medium">{index + 1}</span>
                  Invalid Collection
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderProductCarouselConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Collection</Label>
        <Select
          value={formData.config?.collection_id || ''}
          onValueChange={(value) => updateConfig('collection_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a collection to display products from" />
          </SelectTrigger>
          <SelectContent>
            {collections.map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.icon && <span className="mr-2">{collection.icon}</span>}
                {collection.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500 mt-1">
          Products from this collection will be displayed in recently added order
        </p>
      </div>

      <div>
        <Label>Description (Optional)</Label>
        <Textarea
          value={formData.config?.description || ''}
          onChange={(e) => updateConfig('description', e.target.value)}
          placeholder="Enter carousel description"
        />
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {section ? 'Configure Section' : 'Create Section'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Section Type</Label>
                <Select
                  value={formData.section_type || 'hero_slideshow'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, section_type: value as any }))}
                  disabled={!!section}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero_slideshow">Hero Slideshow</SelectItem>
                    <SelectItem value="collections_tabs">Collections Tabs</SelectItem>
                    <SelectItem value="collections_carousel">Collections Carousel</SelectItem>
                    <SelectItem value="product_carousel">Product Carousel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Custom Title</Label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter custom section title"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use default title for section type
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label className="text-sm">Show this section on homepage</Label>
              </div>

              <div>
                <Label className="text-sm font-medium">Display Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-24"
                  min="0"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <Label className="text-lg font-semibold block mb-4">
                Section Configuration
              </Label>
              <div className="bg-gray-50 rounded-lg p-1 mb-4">
                <p className="text-sm text-gray-600 px-3 py-2">
                  {formData.section_type === 'hero_slideshow' && 'Configure custom slides with images and links'}
                  {(formData.section_type === 'collections_tabs' || formData.section_type === 'collections_carousel') && 'Select which collections to display to users'}
                  {formData.section_type === 'product_carousel' && 'Choose a collection to display its products'}
                </p>
              </div>
              
              {formData.section_type === 'hero_slideshow' && renderHeroSlideshowConfig()}
              {(formData.section_type === 'collections_tabs' || formData.section_type === 'collections_carousel') && renderCollectionsConfig()}
              {formData.section_type === 'product_carousel' && renderProductCarouselConfig()}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                {section ? 'Update Section' : 'Create Section'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showMediaSelector && (
        <MediaLibrarySelector
          onSelect={handleMediaSelect}
          onClose={() => {
            setShowMediaSelector(false);
            setEditingSlideIndex(-1);
          }}
        />
      )}
    </>
  );
};

export default AdminSectionEditDialog;
