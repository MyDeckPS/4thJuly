
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFooterManagement = () => {
  const queryClient = useQueryClient();

  // Fetch footer columns
  const { data: footerColumns, isLoading: columnsLoading } = useQuery({
    queryKey: ["footer-columns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("footer_configurations")
        .select("*")
        .order("sort_order");
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch footer links
  const { data: footerLinks, isLoading: linksLoading } = useQuery({
    queryKey: ["footer-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("footer_links")
        .select("*")
        .order("sort_order");
      
      if (error) throw error;
      return data;
    }
  });

  // Create column mutation
  const createColumnMutation = useMutation({
    mutationFn: async (column: { column_title: string; sort_order: number }) => {
      if (!column.column_title?.trim()) {
        throw new Error("Column title is required");
      }

      const { data, error } = await supabase
        .from("footer_configurations")
        .insert([column])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["footer-columns"] });
      toast.success("Column created successfully");
    },
    onError: (error: any) => {
      console.error("Create column error:", error);
      toast.error(error.message || "Failed to create column");
    }
  });

  // Update column mutation
  const updateColumnMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; column_title: string; sort_order: number }) => {
      if (!updates.column_title?.trim()) {
        throw new Error("Column title is required");
      }

      const { data, error } = await supabase
        .from("footer_configurations")
        .update(updates)
        .eq("id", id)
        .select();
      
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Column not found or could not be updated");
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["footer-columns"] });
      toast.success("Column updated successfully");
    },
    onError: (error: any) => {
      console.error("Update column error:", error);
      toast.error(error.message || "Failed to update column");
    }
  });

  // Delete column mutation
  const deleteColumnMutation = useMutation({
    mutationFn: async (id: string) => {
      // First delete all links in this column
      const { error: linksError } = await supabase
        .from("footer_links")
        .delete()
        .eq("footer_column_id", id);

      if (linksError) {
        throw new Error(`Failed to delete column links: ${linksError.message}`);
      }

      // Then delete the column
      const { error: columnError } = await supabase
        .from("footer_configurations")
        .delete()
        .eq("id", id);
      
      if (columnError) {
        throw new Error(`Failed to delete column: ${columnError.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["footer-columns"] });
      queryClient.invalidateQueries({ queryKey: ["footer-links"] });
      toast.success("Column deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete column error:", error);
      toast.error(error.message || "Failed to delete column");
    }
  });

  // Create link mutation
  const createLinkMutation = useMutation({
    mutationFn: async (link: any) => {
      if (!link.title?.trim()) {
        throw new Error("Link title is required");
      }
      if (!link.url?.trim()) {
        throw new Error("URL is required");
      }
      if (link.link_category === 'footer' && !link.footer_column_id) {
        throw new Error("Footer column is required for footer links");
      }

      const { data, error } = await supabase
        .from("footer_links")
        .insert([link])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["footer-links"] });
      toast.success("Link created successfully");
    },
    onError: (error: any) => {
      console.error("Create link error:", error);
      toast.error(error.message || "Failed to create link");
    }
  });

  // Update link mutation
  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, ...linkData }: any) => {
      if (!id) {
        throw new Error("Link ID is required");
      }

      if (!linkData.title?.trim()) {
        throw new Error("Link title is required");
      }

      if (!linkData.url?.trim()) {
        throw new Error("URL is required");
      }

      const { data, error } = await supabase
        .from("footer_links")
        .update(linkData)
        .eq("id", id)
        .select("*");

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Link not found or could not be updated");
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["footer-links"] });
      queryClient.invalidateQueries({ queryKey: ["footer-columns"] });
      toast.success("Link updated successfully");
    },
    onError: (error: any) => {
      console.error("Update link error:", error);
      toast.error(error.message || "Failed to update link");
    }
  });

  // Delete link mutation
  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("footer_links")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["footer-links"] });
      toast.success("Link deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete link error:", error);
      toast.error(error.message || "Failed to delete link");
    }
  });

  return {
    footerColumns,
    footerLinks,
    isLoading: columnsLoading || linksLoading,
    createColumn: createColumnMutation.mutate,
    updateColumn: updateColumnMutation.mutate,
    deleteColumn: deleteColumnMutation.mutate,
    createLink: createLinkMutation.mutate,
    updateLink: updateLinkMutation.mutate,
    deleteLink: deleteLinkMutation.mutate,
    isCreatingColumn: createColumnMutation.isPending,
    isUpdatingColumn: updateColumnMutation.isPending,
    isDeletingColumn: deleteColumnMutation.isPending,
    isCreatingLink: createLinkMutation.isPending,
    isUpdatingLink: updateLinkMutation.isPending,
    isDeletingLink: deleteLinkMutation.isPending
  };
};
