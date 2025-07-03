
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useMarkWelcomeOfferAsUsed = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Marking welcome offer as used for user:', user.id);
      
      const { error } = await supabase
        .from('profiles')
        .update({ welcome_offer_used: true })
        .eq('id', user.id);

      if (error) {
        console.error('Error marking welcome offer as used:', error);
        throw error;
      }

      console.log('Welcome offer marked as used successfully');
    },
  });
};
