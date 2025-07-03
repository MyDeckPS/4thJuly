
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export interface CreateHostData {
  name: string;
  bio?: string;
  profile_image_url?: string;
  email?: string;
  timezone?: string;
}

export interface UpdateHostData {
  name?: string;
  bio?: string;
  profile_image_url?: string;
  email?: string;
  timezone?: string;
  is_active?: boolean;
}

export const useHosts = () => {
  return useQuery({
    queryKey: ['hosts'],
    queryFn: async () => {
      console.log('Fetching hosts...');
      
      const { data, error } = await supabase
        .from('host')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching hosts:', error);
        throw error;
      }

      console.log('Fetched hosts:', data);
      return data as Host[];
    },
  });
};

// Alias for backwards compatibility
export const useAllHosts = useHosts;

export const useCreateHost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (hostData: CreateHostData) => {
      console.log('Creating host:', hostData);
      
      const { data, error } = await supabase
        .from('host')
        .insert([hostData])
        .select()
        .single();

      if (error) {
        console.error('Error creating host:', error);
        throw error;
      }

      console.log('Created host:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosts'] });
      toast({
        title: "Success",
        description: "Host created successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to create host:', error);
      toast({
        title: "Error",
        description: "Failed to create host. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateHost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateHostData & { id: string }) => {
      console.log('Updating host:', id, updateData);
      
      const { data, error } = await supabase
        .from('host')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating host:', error);
        throw error;
      }

      console.log('Updated host:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosts'] });
      toast({
        title: "Success",
        description: "Host updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to update host:', error);
      toast({
        title: "Error",
        description: "Failed to update host. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteHost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deactivating host:', id);
      
      const { data, error } = await supabase
        .from('host')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error deactivating host:', error);
        throw error;
      }

      console.log('Deactivated host:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosts'] });
      toast({
        title: "Success",
        description: "Host deactivated successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to deactivate host:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate host. Please try again.",
        variant: "destructive",
      });
    },
  });
};
