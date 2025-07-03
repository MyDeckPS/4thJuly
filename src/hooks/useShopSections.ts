
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ShopSection {
  id: string;
  section_type: 'hero_slideshow' | 'collections_tabs' | 'collections_carousel' | 'product_carousel';
  title: string | null;
  is_active: boolean;
  sort_order: number;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useShopSections = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['shop-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_sections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as ShopSection[];
    }
  });

  const updateSection = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ShopSection> & { id: string }) => {
      const { data, error } = await supabase
        .from('shop_sections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-sections'] });
      toast({ title: "Success", description: "Section updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to update section: ${error.message}`, variant: "destructive" });
    }
  });

  const createSection = useMutation({
    mutationFn: async (newSection: Omit<ShopSection, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('shop_sections')
        .insert([newSection])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-sections'] });
      toast({ title: "Success", description: "Section created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to create section: ${error.message}`, variant: "destructive" });
    }
  });

  const deleteSection = useMutation({
    mutationFn: async (sectionId: string) => {
      const { error } = await supabase
        .from('shop_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-sections'] });
      toast({ title: "Success", description: "Section deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to delete section: ${error.message}`, variant: "destructive" });
    }
  });

  return {
    sections,
    isLoading,
    updateSection,
    createSection,
    deleteSection
  };
};
