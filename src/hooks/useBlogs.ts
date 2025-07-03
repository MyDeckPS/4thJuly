
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  hero_image: string;
  category: string;
  read_time: string;
  author: string;
  publish_date: string | null;
  published: boolean | null;
  meta_title: string | null;
  meta_description: string | null;
  slug: string;
  created_at: string | null;
  updated_at: string | null;
}

export const useBlogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blogs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBlog = async (blogData: Omit<Blog, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .insert([blogData])
        .select()
        .single();

      if (error) throw error;
      
      setBlogs(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Blog created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating blog:', error);
      toast({
        title: "Error",
        description: "Failed to create blog",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateBlog = async (id: string, blogData: Partial<Blog>) => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .update(blogData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setBlogs(prev => prev.map(blog => blog.id === id ? data : blog));
      toast({
        title: "Success",
        description: "Blog updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating blog:', error);
      toast({
        title: "Error",
        description: "Failed to update blog",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteBlog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBlogs(prev => prev.filter(blog => blog.id !== id));
      toast({
        title: "Success",
        description: "Blog deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getBlogBySlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching blog by slug:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return {
    blogs,
    loading,
    createBlog,
    updateBlog,
    deleteBlog,
    getBlogBySlug,
    refetch: fetchBlogs
  };
};
