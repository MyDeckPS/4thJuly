
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Host {
  id: string;
  name: string;
  bio: string | null;
  profile_image_url: string | null;
  email: string | null;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useHost = () => {
  return useQuery({
    queryKey: ['host'],
    queryFn: async () => {
      console.log('Fetching host...');
      
      const { data, error } = await supabase
        .from('host')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching host:', error);
        throw error;
      }

      console.log('Fetched host:', data);
      return data as Host;
    },
  });
};
