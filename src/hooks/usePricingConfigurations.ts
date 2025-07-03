import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SessionPricingConfiguration {
  id: string;
  session_type: 'consultation';
  user_type: 'standard';
  base_price: number;
  compare_at_price: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePricingConfigData {
  session_type: 'playpath';
  user_type: 'standard';
  base_price: number;
  compare_at_price?: number;
  is_active?: boolean;
}

export interface UpdatePricingConfigData {
  base_price?: number;
  compare_at_price?: number;
  is_active?: boolean;
}

export const usePricingConfigurations = () => {
  return useQuery({
    queryKey: ['pricing-configurations'],
    queryFn: async () => {
      console.log('Fetching pricing configurations...');
      
      const { data, error } = await supabase
        .from('session_pricing_configurations')
        .select('*')
        .order('session_type', { ascending: true })
        .order('user_type', { ascending: true });

      if (error) {
        console.error('Error fetching pricing configurations:', error);
        throw error;
      }

      console.log('Fetched pricing configurations:', data);
      return data as SessionPricingConfiguration[];
    },
  });
};

export const useUpdatePricingConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdatePricingConfigData & { id: string }) => {
      console.log(`Updating pricing configuration ${id} with data:`, updateData);
      
      const { data, error } = await supabase
        .from('session_pricing_configurations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating pricing configuration:', error);
        throw error;
      }

      console.log('Updated pricing configuration:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-configurations'] });
    },
  });
};
