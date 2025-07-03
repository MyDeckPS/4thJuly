
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ShopSlideshow {
  id: string;
  media_id: string | null;
  is_active: boolean;
  sort_order: number;
  link_url: string | null;
  link_type: 'external' | 'internal' | 'none';
  internal_path: string | null;
  created_at: string;
  updated_at: string;
  media_library?: {
    id: string;
    file_url: string;
    alt_text: string | null;
  };
}

export const useShopSlideshows = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: slideshows = [], isLoading } = useQuery({
    queryKey: ['shop-slideshows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_slideshows')
        .select(`
          *,
          media_library (
            id,
            file_url,
            alt_text
          )
        `)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as ShopSlideshow[];
    }
  });

  const createSlideshow = useMutation({
    mutationFn: async (slideshow: Omit<ShopSlideshow, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('shop_slideshows')
        .insert(slideshow)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-slideshows'] });
      toast({ title: "Success", description: "Slideshow created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to create slideshow: ${error.message}`, variant: "destructive" });
    }
  });

  const updateSlideshow = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ShopSlideshow> & { id: string }) => {
      const { data, error } = await supabase
        .from('shop_slideshows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-slideshows'] });
      toast({ title: "Success", description: "Slideshow updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to update slideshow: ${error.message}`, variant: "destructive" });
    }
  });

  const deleteSlideshow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shop_slideshows')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-slideshows'] });
      toast({ title: "Success", description: "Slideshow deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to delete slideshow: ${error.message}`, variant: "destructive" });
    }
  });

  return {
    slideshows,
    isLoading,
    createSlideshow,
    updateSlideshow,
    deleteSlideshow
  };
};
