
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useHeaderLinks = () => {
  const { data: headerLinks, isLoading } = useQuery({
    queryKey: ["header-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("footer_links")
        .select("*")
        .eq("link_category", "header")
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      return data;
    }
  });

  return { headerLinks: headerLinks || [], isLoading };
};
