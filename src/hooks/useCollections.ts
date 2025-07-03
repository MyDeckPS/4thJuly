
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Collection {
  id: string;
  title: string;
  icon: string;
  description: string | null;
  published: boolean;
  sort_order: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CollectionLink {
  id: string;
  parent_collection_id: string;
  linked_collection_id: string;
  created_at: string;
}

export const useCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      const formattedCollections: Collection[] = (data || []).map(collection => ({
        ...collection,
        tags: Array.isArray(collection.tags) 
          ? collection.tags.filter((tag: any) => typeof tag === 'string') 
          : []
      }));
      
      setCollections(formattedCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast({
        title: "Error",
        description: "Failed to load collections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createCollection = async (collection: Omit<Collection, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('collections')
        .insert(collection);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Collection created successfully",
      });
      
      fetchCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      });
    }
  };

  const updateCollection = async (id: string, updates: Partial<Collection>) => {
    try {
      const { error } = await supabase
        .from('collections')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Collection updated successfully",
      });
      
      fetchCollections();
    } catch (error) {
      console.error('Error updating collection:', error);
      toast({
        title: "Error",
        description: "Failed to update collection",
        variant: "destructive",
      });
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Collection deleted successfully",
      });
      
      fetchCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive",
      });
    }
  };

  const getLinkedCollections = async (parentCollectionId: string): Promise<Collection[]> => {
    try {
      const { data, error } = await supabase
        .from('collection_links')
        .select(`
          linked_collection:collections!collection_links_linked_collection_id_fkey(*)
        `)
        .eq('parent_collection_id', parentCollectionId);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        ...item.linked_collection,
        tags: Array.isArray(item.linked_collection.tags) 
          ? item.linked_collection.tags.filter((tag: any) => typeof tag === 'string') 
          : []
      }));
    } catch (error) {
      console.error('Error fetching linked collections:', error);
      return [];
    }
  };

  const addCollectionLink = async (parentCollectionId: string, linkedCollectionId: string) => {
    try {
      const { error } = await supabase
        .from('collection_links')
        .insert({
          parent_collection_id: parentCollectionId,
          linked_collection_id: linkedCollectionId
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Collection link added successfully",
      });
    } catch (error) {
      console.error('Error adding collection link:', error);
      toast({
        title: "Error",
        description: "Failed to add collection link",
        variant: "destructive",
      });
    }
  };

  const removeCollectionLink = async (parentCollectionId: string, linkedCollectionId: string) => {
    try {
      const { error } = await supabase
        .from('collection_links')
        .delete()
        .eq('parent_collection_id', parentCollectionId)
        .eq('linked_collection_id', linkedCollectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Collection link removed successfully",
      });
    } catch (error) {
      console.error('Error removing collection link:', error);
      toast({
        title: "Error",
        description: "Failed to remove collection link",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return {
    collections,
    loading,
    createCollection,
    updateCollection,
    deleteCollection,
    getLinkedCollections,
    addCollectionLink,
    removeCollectionLink,
    refetch: fetchCollections
  };
};
