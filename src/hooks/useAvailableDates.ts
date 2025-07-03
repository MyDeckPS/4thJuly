
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAvailableDates = (sessionType: 'playpath' | 'consultation', daysAhead: number = 30) => {
  return useQuery({
    queryKey: ['available-dates', sessionType, daysAhead],
    queryFn: async () => {
      console.log('Fetching available dates for:', sessionType);
      
      const { data, error } = await supabase
        .rpc('get_available_dates', {
          session_type_param: sessionType,
          days_ahead: daysAhead
        });

      if (error) {
        console.error('Error fetching available dates:', error);
        throw error;
      }

      console.log('Fetched available dates:', data);
      return data?.map((item: { available_date: string }) => new Date(item.available_date)) || [];
    },
    enabled: !!sessionType,
  });
};
