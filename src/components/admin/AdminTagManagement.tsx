
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Edit2, Trash2, Search, Users, Package, Folder } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TagData {
  tag: string;
  productCount: number;
  collectionCount: number;
  userCount: number;
  products: Array<{ id: string; title: string }>;
  collections: Array<{ id: string; title: string }>;
  users: Array<{ id: string; name: string }>;
}

const AdminTagManagement = () => {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTags = async () => {
    try {
      setLoading(true);
      
      // Get all unique tags from products, collections, and user_tags
      const [productsRes, collectionsRes, userTagsRes] = await Promise.all([
        supabase.from('products').select('id, title, tags').eq('published', true),
        supabase.from('collections').select('id, title, tags').eq('published', true),
        supabase.from('user_tags').select('tag, user_id'),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (collectionsRes.error) throw collectionsRes.error;
      if (userTagsRes.error) throw userTagsRes.error;

      // Get user profiles separately
      const userIds = userTagsRes.data?.map(ut => ut.user_id) || [];
      const profilesRes = userIds.length > 0 ? await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds) : { data: [], error: null };

      if (profilesRes.error) throw profilesRes.error;

      const allTags = new Set<string>();
      const tagData: Record<string, TagData> = {};

      // Process products
      productsRes.data?.forEach(product => {
        if (product.tags && Array.isArray(product.tags)) {
          (product.tags as string[]).forEach((tag: string) => {
            const normalizedTag = tag.toLowerCase().trim();
            allTags.add(normalizedTag);
            
            if (!tagData[normalizedTag]) {
              tagData[normalizedTag] = {
                tag: tag, // Keep original casing for display
                productCount: 0,
                collectionCount: 0,
                userCount: 0,
                products: [],
                collections: [],
                users: []
              };
            }
            
            tagData[normalizedTag].productCount++;
            tagData[normalizedTag].products.push({
              id: product.id,
              title: product.title
            });
          });
        }
      });

      // Process collections
      collectionsRes.data?.forEach(collection => {
        if (collection.tags && Array.isArray(collection.tags)) {
          (collection.tags as string[]).forEach((tag: string) => {
            const normalizedTag = tag.toLowerCase().trim();
            allTags.add(normalizedTag);
            
            if (!tagData[normalizedTag]) {
              tagData[normalizedTag] = {
                tag: tag,
                productCount: 0,
                collectionCount: 0,
                userCount: 0,
                products: [],
                collections: [],
                users: []
              };
            }
            
            tagData[normalizedTag].collectionCount++;
            tagData[normalizedTag].collections.push({
              id: collection.id,
              title: collection.title
            });
          });
        }
      });

      // Process user tags
      userTagsRes.data?.forEach(userTag => {
        const normalizedTag = userTag.tag.toLowerCase().trim();
        allTags.add(normalizedTag);
        
        if (!tagData[normalizedTag]) {
          tagData[normalizedTag] = {
            tag: userTag.tag,
            productCount: 0,
            collectionCount: 0,
            userCount: 0,
            products: [],
            collections: [],
            users: []
          };
        }
        
        tagData[normalizedTag].userCount++;
        const userProfile = profilesRes.data?.find(p => p.id === userTag.user_id);
        tagData[normalizedTag].users.push({
          id: userTag.user_id,
          name: userProfile?.name || 'Unknown User'
        });
      });

      setTags(Object.values(tagData).sort((a, b) => a.tag.localeCompare(b.tag)));
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast({
        title: "Error",
        description: "Failed to load tags",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const filteredTags = tags.filter(tag =>
    tag.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditTag = async (oldTag: string, newTag: string) => {
    if (oldTag === newTag || !newTag.trim()) return;

    try {
      // Update in products
      const { data: products } = await supabase
        .from('products')
        .select('id, tags')
        .contains('tags', [oldTag]);

      if (products) {
        for (const product of products) {
          if (Array.isArray(product.tags)) {
            const updatedTags = (product.tags as string[]).map((tag: string) =>
              tag.toLowerCase() === oldTag.toLowerCase() ? newTag : tag
            );
            await supabase
              .from('products')
              .update({ tags: updatedTags })
              .eq('id', product.id);
          }
        }
      }

      // Update in collections
      const { data: collections } = await supabase
        .from('collections')
        .select('id, tags')
        .contains('tags', [oldTag]);

      if (collections) {
        for (const collection of collections) {
          if (Array.isArray(collection.tags)) {
            const updatedTags = (collection.tags as string[]).map((tag: string) =>
              tag.toLowerCase() === oldTag.toLowerCase() ? newTag : tag
            );
            await supabase
              .from('collections')
              .update({ tags: updatedTags })
              .eq('id', collection.id);
          }
        }
      }

      // Update in user_tags
      await supabase
        .from('user_tags')
        .update({ tag: newTag })
        .ilike('tag', oldTag);

      toast({
        title: "Success",
        description: `Tag "${oldTag}" updated to "${newTag}"`,
      });

      fetchTags();
      setEditingTag(null);
      setNewTagName('');
    } catch (error) {
      console.error('Error updating tag:', error);
      toast({
        title: "Error",
        description: "Failed to update tag",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTag = async (tagToDelete: string) => {
    try {
      // Remove from products
      const { data: products } = await supabase
        .from('products')
        .select('id, tags')
        .contains('tags', [tagToDelete]);

      if (products) {
        for (const product of products) {
          if (Array.isArray(product.tags)) {
            const updatedTags = (product.tags as string[]).filter((tag: string) =>
              tag.toLowerCase() !== tagToDelete.toLowerCase()
            );
            await supabase
              .from('products')
              .update({ tags: updatedTags })
              .eq('id', product.id);
          }
        }
      }

      // Remove from collections
      const { data: collections } = await supabase
        .from('collections')
        .select('id, tags')
        .contains('tags', [tagToDelete]);

      if (collections) {
        for (const collection of collections) {
          if (Array.isArray(collection.tags)) {
            const updatedTags = (collection.tags as string[]).filter((tag: string) =>
              tag.toLowerCase() !== tagToDelete.toLowerCase()
            );
            await supabase
              .from('collections')
              .update({ tags: updatedTags })
              .eq('id', collection.id);
          }
        }
      }

      // Remove from user_tags
      await supabase
        .from('user_tags')
        .delete()
        .ilike('tag', tagToDelete);

      toast({
        title: "Success",
        description: `Tag "${tagToDelete}" deleted from all entities`,
      });

      fetchTags();
      setDeleteConfirmTag(null);
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading tags...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Tag Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead className="text-center">Collections</TableHead>
                <TableHead className="text-center">Users</TableHead>
                <TableHead className="text-center">Total Usage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.map((tagData) => (
                <TableRow key={tagData.tag}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">{tagData.tag}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Package className="w-4 h-4" />
                      <span>{tagData.productCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Folder className="w-4 h-4" />
                      <span>{tagData.collectionCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{tagData.userCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {tagData.productCount + tagData.collectionCount + tagData.userCount}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingTag(tagData.tag);
                          setNewTagName(tagData.tag);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteConfirmTag(tagData.tag)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTags.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tags found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Tag Dialog */}
      <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Tag Name</label>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter new tag name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTag(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => editingTag && handleEditTag(editingTag, newTagName)}
              disabled={!newTagName.trim() || newTagName === editingTag}
            >
              Update Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmTag} onOpenChange={() => setDeleteConfirmTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete the tag "{deleteConfirmTag}" everywhere?</p>
            <p className="text-sm text-muted-foreground">
              This will remove the tag from all products, collections, and users. This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmTag(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmTag && handleDeleteTag(deleteConfirmTag)}
            >
              Delete Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTagManagement;
