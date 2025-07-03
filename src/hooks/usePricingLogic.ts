import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePricingLogic = () => {
  const { user } = useAuth();
  const { profile } = useProfile();

  // Get playpath session usage (can be kept for analytics, not for pricing)
  const { data: playpathUsage } = useQuery({
    queryKey: ['playpath-usage', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.rpc('get_playpath_usage', { user_id: user.id });
      if (error) throw error;
      return data[0];
    },
    enabled: !!user
  });

  // Get pricing configuration for standard users and playpath sessions
  const { data: pricingConfig } = useQuery({
    queryKey: ['session-pricing', 'playpath', 'standard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_pricing_configurations')
        .select('*')
        .eq('session_type', 'playpath')
        .eq('user_type', 'standard')
        .eq('is_active', true)
        .single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching pricing config:', error);
      }
      return data;
    }
  });

  return useMemo(() => {
    if (!pricingConfig) {
      return { 
        price: 0, 
        isFree: false, 
        sessionUsage: playpathUsage, 
        configurationError: true,
        errorMessage: 'Session pricing not configured, please contact admin'
      };
    }
    return { 
      price: pricingConfig.base_price || 0, 
      isFree: pricingConfig.base_price === 0, 
      sessionUsage: playpathUsage 
    };
  }, [playpathUsage, pricingConfig]);
};
