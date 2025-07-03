
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProductCarousel {
  id: string;
  title: string;
  description: string | null;
  filter_type: 'featured' | 'new_arrivals' | 'collection' | 'manual';
  collection_id: string | null;
  product_ids: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  collections?: {
    id: string;
    title: string;
  };
}

export const useProductCarousels = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: carousels = [], isLoading } = useQuery({
    queryKey: ['product-carousels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_carousels')
        .select(`
          *,
          collections (
            id,
            title
          )
        `)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as ProductCarousel[];
    }
  });

  const createCarousel = useMutation({
    mutationFn: async (carousel: Omit<ProductCarousel, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('product_carousels')
        .insert(carousel)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-carousels'] });
      toast({ title: "Success", description: "Carousel created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to create carousel: ${error.message}`, variant: "destructive" });
    }
  });

  const updateCarousel = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductCarousel> & { id: string }) => {
      const { data, error } = await supabase
        .from('product_carousels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-carousels'] });
      toast({ title: "Success", description: "Carousel updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to update carousel: ${error.message}`, variant: "destructive" });
    }
  });

  const deleteCarousel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_carousels')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-carousels'] });
      toast({ title: "Success", description: "Carousel deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to delete carousel: ${error.message}`, variant: "destructive" });
    }
  });

  return {
    carousels,
    isLoading,
    createCarousel,
    updateCarousel,
    deleteCarousel
  };
};
