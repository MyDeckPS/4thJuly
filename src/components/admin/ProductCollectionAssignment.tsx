
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useCollections } from '@/hooks/useCollections';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductCollectionAssignmentProps {
  productId: string;
  productTitle: string;
  productTags: string[];
  onAssignmentChange?: () => void;
}

const ProductCollectionAssignment = ({ 
  productId, 
  productTitle, 
  productTags,
  onAssignmentChange 
}: ProductCollectionAssignmentProps) => {
  const { collections } = useCollections();
  const { toast } = useToast();
  const [assignedCollections, setAssignedCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const publishedCollections = collections.filter(c => c.published);

  useEffect(() => {
    fetchAssignedCollections();
  }, [productId]);

  const fetchAssignedCollections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_collections')
        .select('collection_id')
        .eq('product_id', productId);

      if (error) throw error;
      
      setAssignedCollections((data || []).map(item => item.collection_id));
    } catch (error) {
      console.error('Error fetching assigned collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAssignment = async (collectionId: string, isAssigned: boolean) => {
    try {
      setUpdating(true);
      
      if (isAssigned) {
        // Remove assignment
        const { error } = await supabase
          .from('product_collections')
          .delete()
          .eq('product_id', productId)
          .eq('collection_id', collectionId);

        if (error) throw error;
        
        setAssignedCollections(prev => prev.filter(id => id !== collectionId));
        toast({
          title: "Success",
          description: "Product removed from collection",
        });
      } else {
        // Add assignment
        const { error } = await supabase
          .from('product_collections')
          .insert({
            product_id: productId,
            collection_id: collectionId
          });

        if (error) throw error;
        
        setAssignedCollections(prev => [...prev, collectionId]);
        toast({
          title: "Success",
          description: "Product added to collection",
        });
      }
      
      onAssignmentChange?.();
    } catch (error: any) {
      console.error('Error toggling assignment:', error);
      toast({
        title: "Error",
        description: `Failed to update assignment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getMatchingTags = (collectionTags: string[]) => {
    return productTags.filter(tag => collectionTags.includes(tag));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Collection Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Collection Assignment for "{productTitle}"</CardTitle>
        <p className="text-xs text-muted-foreground">
          Collections are automatically linked based on matching tags. You can manually override assignments below.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {productTags.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Product Tags:</p>
            <div className="flex flex-wrap gap-1">
              {productTags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {publishedCollections.map(collection => {
            const isAssigned = assignedCollections.includes(collection.id);
            const matchingTags = getMatchingTags(collection.tags || []);
            const isAutoLinked = matchingTags.length > 0;
            
            return (
              <div key={collection.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <Checkbox
                    id={`collection-${collection.id}`}
                    checked={isAssigned}
                    disabled={updating}
                    onCheckedChange={() => handleToggleAssignment(collection.id, isAssigned)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{collection.icon}</span>
                      <label 
                        htmlFor={`collection-${collection.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {collection.title}
                      </label>
                      {isAutoLinked && (
                        <Badge variant="secondary" className="text-xs">
                          Auto-linked
                        </Badge>
                      )}
                    </div>
                    {matchingTags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">Matching tags:</span>
                        {matchingTags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {publishedCollections.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            No published collections available
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCollectionAssignment;
