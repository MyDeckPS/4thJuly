
import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, X } from 'lucide-react';
import { Collection } from '@/hooks/useCollections';
import CollectionLinksManager from './CollectionLinksManager';
import CollectionProductsManager from './CollectionProductsManager';

interface CollectionEditDialogProps {
  collection: Collection;
  allCollections: Collection[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (collectionId: string, updates: Partial<Collection>) => Promise<void>;
  onLinkedCollectionChange: (parentId: string, linkedId: string, action: 'add' | 'remove') => Promise<void>;
  onDelete: (collectionId: string) => Promise<void>;
}

const CollectionEditDialog = ({
  collection,
  allCollections,
  isOpen,
  onClose,
  onUpdate,
  onLinkedCollectionChange,
  onDelete
}: CollectionEditDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    icon: '',
    description: '',
    published: false,
    sort_order: 0,
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [pendingLinkedChanges, setPendingLinkedChanges] = useState<{
    toAdd: string[];
    toRemove: string[];
  }>({ toAdd: [], toRemove: [] });
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (collection) {
      setFormData({
        title: collection.title,
        icon: collection.icon,
        description: collection.description || '',
        published: collection.published,
        sort_order: collection.sort_order,
        tags: collection.tags || []
      });
      setPendingLinkedChanges({ toAdd: [], toRemove: [] });
      setDeleteConfirmation(false);
    }
  }, [collection]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const addTag = useCallback(() => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  }, [newTag, formData.tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleLinkedCollectionChanges = useCallback((changes: { toAdd: string[]; toRemove: string[] }) => {
    setPendingLinkedChanges(changes);
  }, []);

  const handleUpdate = async () => {
    if (!collection) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(collection.id, formData);

      for (const linkedId of pendingLinkedChanges.toRemove) {
        await onLinkedCollectionChange(collection.id, linkedId, 'remove');
      }
      
      for (const linkedId of pendingLinkedChanges.toAdd) {
        await onLinkedCollectionChange(collection.id, linkedId, 'add');
      }

      onClose();
    } catch (error) {
      console.error('Failed to update collection:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmation) {
      setDeleteConfirmation(true);
      setTimeout(() => setDeleteConfirmation(false), 3000); // Reset after 3 seconds
      return;
    }

    if (!collection) return;
    
    setIsUpdating(true);
    try {
      await onDelete(collection.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete collection:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setPendingLinkedChanges({ toAdd: [], toRemove: [] });
    setDeleteConfirmation(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Collection: {collection?.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Basic Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <Input 
              placeholder="Collection Title" 
              value={formData.title} 
              onChange={e => handleInputChange('title', e.target.value)} 
            />
            <Input 
              placeholder="Icon (emoji or text)" 
              value={formData.icon} 
              onChange={e => handleInputChange('icon', e.target.value)} 
            />
            <Textarea 
              placeholder="Description (optional)" 
              value={formData.description} 
              onChange={e => handleInputChange('description', e.target.value)} 
            />
            <Input 
              type="number" 
              placeholder="Sort Order" 
              value={formData.sort_order} 
              onChange={e => handleInputChange('sort_order', parseInt(e.target.value) || 0)} 
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Add tag" 
                  value={newTag} 
                  onChange={e => setNewTag(e.target.value)} 
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())} 
                />
                <Button type="button" size="sm" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X className="w-3 h-3 ml-1" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="published" 
                checked={formData.published} 
                onCheckedChange={checked => handleInputChange('published', checked)} 
              />
              <label htmlFor="published">Published</label>
            </div>
          </div>

          <Separator />

          {/* Linked Collections Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Linked Collections</h3>
            {collection && (
              <CollectionLinksManager 
                collection={collection}
                allCollections={allCollections}
                onLinkedCollectionChanges={handleLinkedCollectionChanges}
                onClose={() => {}}
              />
            )}
          </div>

          <Separator />

          {/* Products Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Products in Collection</h3>
            {collection && (
              <CollectionProductsManager
                collectionId={collection.id}
                collectionTitle={collection.title}
              />
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Collection'}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isUpdating}
            className="ml-auto"
          >
            {deleteConfirmation ? 'Really delete?' : 'Delete Collection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionEditDialog;
