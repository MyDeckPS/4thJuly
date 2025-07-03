
import { useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCollections } from '@/hooks/useCollections';

export const useAllTags = () => {
  const { products } = useProducts();
  const { collections } = useCollections();

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    
    // Add product tags
    products.forEach(product => {
      if (Array.isArray(product.tags)) {
        product.tags.forEach(tag => {
          if (typeof tag === 'string') {
            tagSet.add(tag);
          }
        });
      }
    });
    
    // Add collection tags
    collections.forEach(collection => {
      if (Array.isArray(collection.tags)) {
        collection.tags.forEach(tag => {
          if (typeof tag === 'string') {
            tagSet.add(tag);
          }
        });
      }
    });
    
    return Array.from(tagSet).sort();
  }, [products, collections]);

  return allTags;
};
