
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useCollections, Collection } from '@/hooks/useCollections';
import { Badge } from '@/components/ui/badge';

interface CollectionLinksManagerProps {
  collection: Collection;
  allCollections: Collection[];
  onLinkedCollectionChanges: (changes: { toAdd: string[]; toRemove: string[] }) => void;
  onClose: () => void;
}

const CollectionLinksManager = ({ 
  collection, 
  allCollections, 
  onLinkedCollectionChanges, 
  onClose 
}: CollectionLinksManagerProps) => {
  const { getLinkedCollections } = useCollections();
  const [linkedCollections, setLinkedCollections] = useState<Collection[]>([]);
  const [pendingChanges, setPendingChanges] = useState<{ toAdd: string[]; toRemove: string[] }>({ 
    toAdd: [], 
    toRemove: [] 
  });
  const [loading, setLoading] = useState(true);

  const availableCollections = allCollections.filter(c => 
    c.id !== collection.id && c.published
  );

  useEffect(() => {
    const fetchLinkedCollections = async () => {
      setLoading(true);
      try {
        const logger = (window as any).debugLogger_Collections;
        logger?.info('Fetching linked collections', {
          parentCollectionId: collection.id,
          parentCollectionTitle: collection.title
        });

        const linked = await getLinkedCollections(collection.id);
        setLinkedCollections(linked);
        
        logger?.info('Linked collections fetched successfully', {
          count: linked.length,
          linkedCollections: linked.map(c => ({ id: c.id, title: c.title }))
        });
      } catch (error) {
        console.error('Error fetching linked collections:', error);
        const logger = (window as any).debugLogger_Collections;
        logger?.error('Failed to fetch linked collections', {
          parentCollectionId: collection.id,
          error: error
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLinkedCollections();
  }, [collection.id, getLinkedCollections]);

  useEffect(() => {
    onLinkedCollectionChanges(pendingChanges);
  }, [pendingChanges, onLinkedCollectionChanges]);

  const handleToggleLink = (targetCollection: Collection, currentlyLinked: boolean) => {
    const logger = (window as any).debugLogger_Collections;
    logger?.info('Staging collection link change', {
      parentCollection: { id: collection.id, title: collection.title },
      targetCollection: { id: targetCollection.id, title: targetCollection.title },
      action: currentlyLinked ? 'remove' : 'add'
    });

    setPendingChanges(prev => {
      if (currentlyLinked) {
        // If currently linked, stage for removal
        return {
          toAdd: prev.toAdd.filter(id => id !== targetCollection.id),
          toRemove: [...prev.toRemove.filter(id => id !== targetCollection.id), targetCollection.id]
        };
      } else {
        // If not linked, stage for addition
        return {
          toAdd: [...prev.toAdd.filter(id => id !== targetCollection.id), targetCollection.id],
          toRemove: prev.toRemove.filter(id => id !== targetCollection.id)
        };
      }
    });
  };

  const isLinked = (targetCollectionId: string) => {
    const originallyLinked = linkedCollections.some(c => c.id === targetCollectionId);
    const pendingAdd = pendingChanges.toAdd.includes(targetCollectionId);
    const pendingRemove = pendingChanges.toRemove.includes(targetCollectionId);
    
    if (pendingAdd) return true;
    if (pendingRemove) return false;
    return originallyLinked;
  };

  const getDisplayLinkedCollections = () => {
    const originalLinked = linkedCollections.filter(c => !pendingChanges.toRemove.includes(c.id));
    const newLinked = allCollections.filter(c => pendingChanges.toAdd.includes(c.id));
    return [...originalLinked, ...newLinked];
  };

  const hasPendingChanges = pendingChanges.toAdd.length > 0 || pendingChanges.toRemove.length > 0;

  return (
    <div className="space-y-4">
      {hasPendingChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800 font-medium">
            ⚠️ You have unsaved changes. Click "Update Collection" to save.
          </p>
          {pendingChanges.toAdd.length > 0 && (
            <p className="text-xs text-yellow-700 mt-1">
              To add: {pendingChanges.toAdd.length} collection(s)
            </p>
          )}
          {pendingChanges.toRemove.length > 0 && (
            <p className="text-xs text-yellow-700 mt-1">
              To remove: {pendingChanges.toRemove.length} collection(s)
            </p>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Currently Linked Collections</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <>
              {getDisplayLinkedCollections().length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {getDisplayLinkedCollections().map(linkedCollection => (
                    <Badge 
                      key={linkedCollection.id} 
                      variant={pendingChanges.toAdd.includes(linkedCollection.id) ? "secondary" : "default"}
                      className={pendingChanges.toAdd.includes(linkedCollection.id) ? "border-green-500" : ""}
                    >
                      {linkedCollection.icon} {linkedCollection.title}
                      {pendingChanges.toAdd.includes(linkedCollection.id) && " (new)"}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No linked collections</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Available Collections to Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableCollections.map(availableCollection => {
              const linked = isLinked(availableCollection.id);
              const isPending = pendingChanges.toAdd.includes(availableCollection.id) || 
                              pendingChanges.toRemove.includes(availableCollection.id);
              
              return (
                <div key={availableCollection.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`collection-${availableCollection.id}`}
                    checked={linked}
                    onCheckedChange={() => handleToggleLink(availableCollection, linked)}
                  />
                  <label 
                    htmlFor={`collection-${availableCollection.id}`}
                    className={`flex items-center space-x-2 cursor-pointer flex-1 ${
                      isPending ? 'text-blue-600 font-medium' : ''
                    }`}
                  >
                    <span className="text-lg">{availableCollection.icon}</span>
                    <span className="font-medium">{availableCollection.title}</span>
                    {availableCollection.description && (
                      <span className="text-muted-foreground text-sm truncate">
                        - {availableCollection.description}
                      </span>
                    )}
                    {isPending && (
                      <span className="text-xs text-blue-600">
                        {pendingChanges.toAdd.includes(availableCollection.id) ? '(will add)' : '(will remove)'}
                      </span>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
          {availableCollections.length === 0 && (
            <p className="text-muted-foreground">No other published collections available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectionLinksManager;
