import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '@/hooks/useCollections';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
interface CollectionsTabNavigationProps {
  sectionConfig?: {
    collections?: string[];
  };
}
const CollectionsTabNavigation = ({
  sectionConfig
}: CollectionsTabNavigationProps) => {
  const navigate = useNavigate();
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const {
    collections,
    loading
  } = useCollections();

  // Filter collections based on section configuration or fallback to all published
  let displayCollections = collections.filter(collection => collection.published);
  if (sectionConfig?.collections && sectionConfig.collections.length > 0) {
    displayCollections = collections.filter(collection => collection.published && sectionConfig.collections!.includes(collection.id));
  }

  // Sort by sort_order
  displayCollections = displayCollections.sort((a, b) => a.sort_order - b.sort_order);
  if (loading || displayCollections.length === 0) {
    return null;
  }
  const handleCollectionClick = (collectionId: string) => {
    setSelectedCollection(collectionId);
    navigate(`/collections/${collectionId}`);
  };
  return <div className="w-full bg-gradient-soft border-b shadow-sm">
      <div className="max-w-6xl mx-auto sm:px-6 px-0">
        <ScrollArea className="w-full">
          <div className="flex space-x-2 min-w-max py-0 mb-6">
            {displayCollections.map(collection => <button key={collection.id} onClick={() => handleCollectionClick(collection.id)} className={cn("shrink-0 whitespace-nowrap px-6 py-3 rounded-full transition-all duration-200 font-medium", "border border-black text-black bg-white hover:bg-gray-50", selectedCollection === collection.id && "bg-black text-white border-black hover:bg-gray-900")}>
                {collection.icon && <span className="mr-2 text-sm">{collection.icon}</span>}
                {collection.title}
              </button>)}
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      </div>
    </div>;
};
export default CollectionsTabNavigation;