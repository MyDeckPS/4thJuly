
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFooterLinks = () => {
  return useQuery({
    queryKey: ["footer-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("footer_links")
        .select("*")
        .eq("is_active", true)
        .eq("link_category", "footer")
        .order("sort_order");
      
      if (error) throw error;
      return data || [];
    }
  });
};
