import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePremiumBenefits = () => {
  const { data: pricingConfig, isLoading } = useQuery({
    queryKey: ['session-pricing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_pricing_configurations')
        .select('*')
        .eq('session_type', 'playpath')
        .eq('user_type', 'standard')
        .eq('is_active', true)
        .single();
      if (error) {
        console.error('Error fetching session pricing:', error);
        throw error;
      }
      return data;
    }
  });

  // Only use base price, do not fallback to 250
  const sessionPrice = pricingConfig?.base_price ?? 0;

  return {
    sessionPrice,
    loading: isLoading
  };
};
