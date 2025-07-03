import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SessionConfiguration {
  id: string;
  session_type: 'consultation';
  duration_minutes: number;
  price: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSessionConfigurations = () => {
  return useQuery({
    queryKey: ['session-configurations'],
    queryFn: async () => {
      console.log('Fetching session configurations...');
      
      const { data, error } = await supabase
        .from('session_configurations')
        .select('*')
        .eq('is_active', true)
        .order('session_type');

      if (error) {
        console.error('Error fetching session configurations:', error);
        throw error;
      }
      
      console.log('Session configurations:', data);
      return data as SessionConfiguration[];
    },
  });
};
