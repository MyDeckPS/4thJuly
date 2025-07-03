import React from 'react';
import { Collection } from '@/hooks/useCollections';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CollectionSubNavigationProps {
  linkedCollections: Collection[];
  activeFilterId: string | null; // null means "All" (the main collection of the page)
  mainCollectionId: string; // ID of the collection this page is for (represents "All")
  mainCollectionTitle?: string; // Title for the "All" pill
  onSelectFilter: (collectionId: string | null) => void;
  className?: string;
}

const CollectionSubNavigation: React.FC<CollectionSubNavigationProps> = ({
  linkedCollections,
  activeFilterId,
  mainCollectionId,
  mainCollectionTitle = "All",
  onSelectFilter,
  className,
}) => {
  if (!linkedCollections || linkedCollections.length === 0) {
    return null; // Don't render if no linked collections are provided
  }

  return (
    <div className={cn("w-full bg-white border-b", className)}>
      <div className="container mx-auto px-4">
        <ScrollArea className="w-full">
          <div className="flex space-x-2 py-3 min-w-max">
            <Button
              variant="outline"
              onClick={() => onSelectFilter(null)}
              className={cn(
                "shrink-0 whitespace-nowrap border-2",
                activeFilterId === null
                  ? "bg-[#8338EC] text-white border-[#8338EC] hover:bg-[#8338EC]/90 hover:text-white"
                  : "bg-[#FFF3E6] text-[#FB5607] border-[#FB5607] hover:bg-[#8338EC] hover:text-white hover:border-[#8338EC]"
              )}
              size="sm"
            >
              {mainCollectionTitle}
            </Button>
            {linkedCollections.map((collection) => (
              <Button
                key={collection.id}
                variant="outline"
                onClick={() => onSelectFilter(collection.id)}
                className={cn(
                  "shrink-0 whitespace-nowrap border-2",
                  activeFilterId === collection.id 
                    ? "bg-[#8338EC] text-white border-[#8338EC] hover:bg-[#8338EC]/90 hover:text-white"
                    : "bg-[#FFF3E6] text-[#FB5607] border-[#FB5607] hover:bg-[#8338EC] hover:text-white hover:border-[#8338EC]"
                )}
                size="sm"
              >
                {collection.icon && <span className="mr-1 text-sm">{collection.icon}</span>}
                {collection.title}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default CollectionSubNavigation;
