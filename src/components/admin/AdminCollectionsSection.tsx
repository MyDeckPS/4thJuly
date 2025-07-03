
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Edit2, Plus, X, Eye } from 'lucide-react';
import { useCollections, Collection } from '@/hooks/useCollections';
import DebugConsole from './DebugConsole';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CollectionEditDialog from './CollectionEditDialog';
import { supabase } from '@/integrations/supabase/client';

const AdminCollectionsSection = () => {
  const {
    collections,
    loading,
    createCollection,
    updateCollection,
    deleteCollection,
    addCollectionLink,
    removeCollectionLink
  } = useCollections();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState({
    title: '',
    icon: '',
    description: '',
    published: false,
    sort_order: 0,
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchProductCounts();
  }, [collections]);

  const fetchProductCounts = async () => {
    try {
      const counts: Record<string, number> = {};
      
      for (const collection of collections) {
        const { count, error } = await supabase
          .from('product_collections')
          .select('*', { count: 'exact', head: true })
          .eq('collection_id', collection.id);
        
        if (!error) {
          counts[collection.id] = count || 0;
        }
      }
      
      setProductCounts(counts);
    } catch (error) {
      console.error('Error fetching product counts:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      icon: '',
      description: '',
      published: false,
      sort_order: 0,
      tags: []
    });
    setNewTag('');
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await createCollection(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create collection:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateCollection = async (collectionId: string, updates: Partial<Collection>) => {
    await updateCollection(collectionId, updates);
    fetchProductCounts(); // Refresh counts after update
  };

  const handleLinkedCollectionChange = async (parentId: string, linkedId: string, action: 'add' | 'remove') => {
    if (action === 'add') {
      await addCollectionLink(parentId, linkedId);
    } else {
      await removeCollectionLink(parentId, linkedId);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    await deleteCollection(collectionId);
    fetchProductCounts(); // Refresh counts after deletion
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) return <div>Loading collections...</div>;

  return (
    <div className="space-y-6">
      <DebugConsole module="Collections" />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Collections Management 💎</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input 
                  placeholder="Collection Title" 
                  value={formData.title} 
                  onChange={e => handleInputChange('title', e.target.value)} 
                  required 
                />
                <Input 
                  placeholder="Icon (emoji or text)" 
                  value={formData.icon} 
                  onChange={e => handleInputChange('icon', e.target.value)} 
                  required 
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
                    <Button type="button" onClick={addTag}>
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
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => {
                    resetForm();
                    setIsCreateDialogOpen(false);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Creating...' : 'Create Collection'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map(collection => (
                <TableRow key={collection.id}>
                  <TableCell className="text-2xl">{collection.icon}</TableCell>
                  <TableCell className="font-medium">{collection.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{collection.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {collection.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={collection.published ? "default" : "secondary"}>
                      {collection.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>{productCounts[collection.id] || 0}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/shop/collection/${collection.id}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(collection)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {editingCollection && (
            <CollectionEditDialog
              collection={editingCollection}
              allCollections={collections}
              isOpen={!!editingCollection}
              onClose={() => setEditingCollection(null)}
              onUpdate={handleUpdateCollection}
              onLinkedCollectionChange={handleLinkedCollectionChange}
              onDelete={handleDeleteCollection}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCollectionsSection;
