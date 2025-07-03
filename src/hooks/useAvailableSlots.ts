
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AvailableSlot {
  start_time: string;
  end_time: string;
}

export const useAvailableSlots = (date: string, sessionType: 'playpath' | 'consultation') => {
  return useQuery({
    queryKey: ['available-slots', date, sessionType],
    queryFn: async () => {
      console.log('Fetching available slots for:', date, sessionType);
      
      const { data, error } = await supabase
        .rpc('get_available_slots', {
          target_date: date,
          session_type_param: sessionType
        });

      if (error) {
        console.error('Error fetching available slots:', error);
        throw error;
      }

      console.log('Fetched available slots:', data);
      return data as AvailableSlot[];
    },
    enabled: !!date && !!sessionType,
  });
};
