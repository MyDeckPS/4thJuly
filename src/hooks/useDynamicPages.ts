
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DynamicPage {
  id: string;
  title: string;
  body: string;
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export const useDynamicPages = () => {
  return useQuery({
    queryKey: ['dynamic-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dynamic_pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as DynamicPage[];
    },
  });
};

export const useDynamicPage = (slug: string) => {
  return useQuery({
    queryKey: ['dynamic-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dynamic_pages')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;
      return data as DynamicPage;
    },
    enabled: !!slug,
  });
};

export const useCreateDynamicPage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pageData: Omit<DynamicPage, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('dynamic_pages')
        .insert([pageData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-pages'] });
    },
  });
};

export const useUpdateDynamicPage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...pageData }: Partial<DynamicPage> & { id: string }) => {
      const { data, error } = await supabase
        .from('dynamic_pages')
        .update(pageData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-pages'] });
    },
  });
};

export const useDeleteDynamicPage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dynamic_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-pages'] });
    },
  });
};
