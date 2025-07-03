
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { Collection } from '@/hooks/useCollections';

interface MatchingCollectionsProps {
  productTags: string[];
  collections: Collection[];
  onEditCollection: (collectionId: string) => void;
}

const MatchingCollections = ({ productTags, collections, onEditCollection }: MatchingCollectionsProps) => {
  const matchingCollections = useMemo(() => {
    return collections.filter(collection => {
      if (!collection.published) return false;
      
      const collectionTags = Array.isArray(collection.tags) 
        ? collection.tags.filter(tag => typeof tag === 'string')
        : [];
      
      return collectionTags.some(tag => productTags.includes(tag));
    });
  }, [productTags, collections]);

  const handleViewCollection = (e: React.MouseEvent, collectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`/shop/collection/${collectionId}`, '_blank');
  };

  if (matchingCollections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This product is not currently part of any collections. Add tags that match collection tags to automatically include it.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collections ({matchingCollections.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {matchingCollections.map((collection) => {
            const collectionTags = Array.isArray(collection.tags) 
              ? collection.tags.filter(tag => typeof tag === 'string')
              : [];
            
            const matchingTags = collectionTags.filter(tag => productTags.includes(tag));
            
            return (
              <div key={collection.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{collection.icon}</span>
                    <h4 className="font-medium">{collection.title}</h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {matchingTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleViewCollection(e, collection.id)}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Collection
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchingCollections;
