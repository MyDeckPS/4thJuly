import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Play, Image } from 'lucide-react';
import { useDevelopmentalData } from '@/hooks/useDevelopmentalData';
import { useCollections } from '@/hooks/useCollections';
import { useAllTags } from '@/hooks/useAllTags';
import { Product, DevelopmentalGoal } from '@/hooks/useProducts';
import TagInput from './TagInput';
import MatchingCollections from './MatchingCollections';
import { Checkbox } from '@/components/ui/checkbox';

interface ProductFormData {
  title: string;
  description: string;
  age_group: string;
  days_to_complete?: number | null;
  amazon_affiliate_link: string;
  developmental_level_id: string;
  published: boolean;
  featured: boolean;
  price?: number | null;
  compare_at_price?: number | null;
  tags: string[];
  has_cognitive_development: boolean;
  has_creativity_imagination: boolean;
  has_motor_skills: boolean;
  has_stem_robotics: boolean;
  images: Array<{
    image_url: string;
    alt_text?: string;
    is_primary: boolean;
  }>;
  accordions: Array<{
    title: string;
    content: string;
  }>;
}

interface AdminProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}

const AdminProductForm = ({ product, onSubmit, onCancel, onDelete }: AdminProductFormProps) => {
  const { developmentalLevels, developmentalGoals: allDevelopmentalGoals } = useDevelopmentalData();
  const { collections } = useCollections();
  const allTags = useAllTags();
  
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    age_group: '',
    days_to_complete: null,
    amazon_affiliate_link: '',
    developmental_level_id: '',
    published: false,
    featured: false,
    price: null,
    compare_at_price: null,
    tags: [],
    has_cognitive_development: false,
    has_creativity_imagination: false,
    has_motor_skills: false,
    has_stem_robotics: false,
    images: [],
    accordions: []
  });

  const [loading, setLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  // helper functions for video detection
  const isVideoUrl = (url: string) => {
    return url.includes('youtube.com') || 
           url.includes('youtu.be') || 
           url.includes('vimeo.com') || 
           url.toLowerCase().match(/\.(mp4|webm|ogg|mov|avi)$/);
  };

  const getVideoThumbnail = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return videoId ? `https://img.youtube.com/vi/${videoId[1]}/maxresdefault.jpg` : null;
    }
    return null;
  };

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        age_group: product.age_group || '',
        days_to_complete: product.days_to_complete,
        amazon_affiliate_link: product.amazon_affiliate_link || '',
        developmental_level_id: product.developmental_level_id || '',
        published: product.published || false,
        featured: product.featured || false,
        price: product.price,
        compare_at_price: product.compare_at_price,
        tags: product.tags || [],
        has_cognitive_development: product.has_cognitive_development || false,
        has_creativity_imagination: product.has_creativity_imagination || false,
        has_motor_skills: product.has_motor_skills || false,
        has_stem_robotics: product.has_stem_robotics || false,
        images: product.product_images?.map(img => ({
          image_url: img.image_url,
          alt_text: img.alt_text,
          is_primary: img.is_primary
        })) || [],
        accordions: product.product_accordions?.map(acc => ({
          title: acc.title,
          content: acc.content
        })) || []
      });
    }
  }, [product]);

  const updateFormData = useCallback((field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // image and accordion handlers
  const addImage = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { image_url: '', alt_text: '', is_primary: false }]
    }));
  }, []);

  const updateImage = useCallback((index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    }));
  }, []);

  const removeImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }, []);

  const addAccordion = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      accordions: [...prev.accordions, { title: '', content: '' }]
    }));
  }, []);

  const updateAccordion = useCallback((index: number, field: 'title' | 'content', value: string) => {
    setFormData(prev => ({
      ...prev,
      accordions: prev.accordions.map((acc, i) => 
        i === index ? { ...acc, [field]: value } : acc
      )
    }));
  }, []);

  const removeAccordion = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      accordions: prev.accordions.filter((_, i) => i !== index)
    }));
  }, []);

  const handleEditCollection = useCallback((collectionId: string) => {
    console.log('Edit collection:', collectionId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const processedData = {
        ...formData,
        price: formData.price === null || formData.price === undefined || formData.price === 0 ? null : Number(formData.price),
        compare_at_price: formData.compare_at_price === null || formData.compare_at_price === undefined || formData.compare_at_price === 0 ? null : Number(formData.compare_at_price),
        days_to_complete: formData.days_to_complete === null || formData.days_to_complete === undefined || formData.days_to_complete === 0 ? null : Number(formData.days_to_complete),
      };
      
      await onSubmit(processedData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmation) {
      setDeleteConfirmation(true);
      setTimeout(() => setDeleteConfirmation(false), 3000);
      return;
    }

    if (onDelete) {
      setLoading(true);
      try {
        await onDelete();
      } catch (error) {
        console.error('Error deleting product:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="age_group">Age Group *</Label>
              <Input
                id="age_group"
                value={formData.age_group}
                onChange={(e) => updateFormData('age_group', e.target.value)}
                placeholder="e.g., 2-4 years"
                required
              />
            </div>

            <div>
              <Label htmlFor="days_to_complete">Days to Complete</Label>
              <Input
                id="days_to_complete"
                type="number"
                value={formData.days_to_complete || ''}
                onChange={(e) => updateFormData('days_to_complete', e.target.value ? Number(e.target.value) : null)}
                placeholder="Optional"
              />
            </div>

            <div>
              <Label htmlFor="amazon_link">Amazon Affiliate Link *</Label>
              <Input
                id="amazon_link"
                value={formData.amazon_affiliate_link}
                onChange={(e) => updateFormData('amazon_affiliate_link', e.target.value)}
                placeholder="https://amazon.com/..."
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => updateFormData('price', e.target.value ? Number(e.target.value) : null)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="compare_at_price">Compare at Price (₹)</Label>
              <Input
                id="compare_at_price"
                type="number"
                step="0.01"
                value={formData.compare_at_price || ''}
                onChange={(e) => updateFormData('compare_at_price', e.target.value ? Number(e.target.value) : null)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="developmental_level">Developmental Level *</Label>
              <Select
                value={formData.developmental_level_id}
                onValueChange={(value) => updateFormData('developmental_level_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {developmentalLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.icon} {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => updateFormData('published', checked)}
                />
                <Label htmlFor="published">Published</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => updateFormData('featured', checked)}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <TagInput
            tags={formData.tags}
            onTagsChange={(tags) => updateFormData('tags', tags)}
            existingTags={allTags}
            caseInsensitive={true}
          />
        </CardContent>
      </Card>

      {/* Collections (Auto-matched) */}
      <MatchingCollections
        productTags={formData.tags}
        collections={collections}
        onEditCollection={handleEditCollection}
      />

      {/* Developmental Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Developmental Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Select which developmental goals this product supports:
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cognitive_development"
                checked={formData.has_cognitive_development}
                onCheckedChange={(checked) => updateFormData('has_cognitive_development', checked)}
              />
              <Label htmlFor="cognitive_development" className="flex items-center gap-2">
                🧠 Cognitive Development
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="creativity_imagination"
                checked={formData.has_creativity_imagination}
                onCheckedChange={(checked) => updateFormData('has_creativity_imagination', checked)}
              />
              <Label htmlFor="creativity_imagination" className="flex items-center gap-2">
                🎨 Creativity and Imagination
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="motor_skills"
                checked={formData.has_motor_skills}
                onCheckedChange={(checked) => updateFormData('has_motor_skills', checked)}
              />
              <Label htmlFor="motor_skills" className="flex items-center gap-2">
                🏃 Motor Skills
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="stem_robotics"
                checked={formData.has_stem_robotics}
                onCheckedChange={(checked) => updateFormData('has_stem_robotics', checked)}
              />
              <Label htmlFor="stem_robotics" className="flex items-center gap-2">
                🔬 STEM and Robotics
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Media */}
      <Card>
        <CardHeader>
          <CardTitle>Product Media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Supports both image and video URLs (YouTube, Vimeo, MP4, etc.)
            </p>
            
            {formData.images.map((image, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Media {index + 1}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* media preview and form fields */}
                {image.image_url && (
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border">
                      {isVideoUrl(image.image_url) ? (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                          {getVideoThumbnail(image.image_url) ? (
                            <img 
                              src={getVideoThumbnail(image.image_url)!} 
                              alt="Video thumbnail"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Play className="w-8 h-8 text-white" />
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={image.image_url} 
                          alt="Media preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      )}
                      <div className="w-full h-full bg-gray-200 items-center justify-center hidden">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium">
                        {isVideoUrl(image.image_url) ? 'Video URL' : 'Image URL'}
                      </p>
                      <p className="text-xs text-muted-foreground break-all">{image.image_url}</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Media URL *</Label>
                    <Input
                      value={image.image_url}
                      onChange={(e) => updateImage(index, 'image_url', e.target.value)}
                      placeholder="https://example.com/image.jpg or https://youtube.com/watch?v=..."
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Alt Text</Label>
                    <Input
                      value={image.alt_text || ''}
                      onChange={(e) => updateImage(index, 'alt_text', e.target.value)}
                      placeholder="Descriptive alt text"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`primary-${index}`}
                    checked={image.is_primary}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          images: prev.images.map((img, i) => ({
                            ...img,
                            is_primary: i === index
                          }))
                        }));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`primary-${index}`}>Primary Media</Label>
                </div>
              </div>
            ))}

            <Button type="button" onClick={addImage} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Media
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accordions */}
      <Card>
        <CardHeader>
          <CardTitle>Product Accordions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button type="button" onClick={addAccordion} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Accordion
            </Button>
            
            {formData.accordions.map((accordion, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Accordion {index + 1}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeAccordion(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={accordion.title}
                      onChange={(e) => updateAccordion(index, 'title', e.target.value)}
                      placeholder="Accordion title"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Content *</Label>
                    <Textarea
                      value={accordion.content}
                      onChange={(e) => updateAccordion(index, 'content', e.target.value)}
                      placeholder="Accordion content"
                      rows={4}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4 border-t border-gray-100">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {product && onDelete && (
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
            className="ml-auto"
          >
            {deleteConfirmation ? 'Really delete?' : 'Delete Product'}
          </Button>
        )}
      </div>
    </form>
  );
};

export default AdminProductForm;
