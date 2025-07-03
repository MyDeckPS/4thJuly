
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalBlogs: number;
  totalProducts: number;
  totalCollections: number;
  loading: boolean;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalBlogs: 0,
    totalProducts: 0,
    totalCollections: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total blogs (published + drafts)
        const { count: blogsCount, error: blogsError } = await supabase
          .from('blogs')
          .select('*', { count: 'exact', head: true });

        if (blogsError) throw blogsError;

        // Fetch total products (published + drafts)
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (productsError) throw productsError;

        // Fetch total collections (published + drafts)
        const { count: collectionsCount, error: collectionsError } = await supabase
          .from('collections')
          .select('*', { count: 'exact', head: true });

        if (collectionsError) throw collectionsError;

        setStats({
          totalBlogs: blogsCount || 0,
          totalProducts: productsCount || 0,
          totalCollections: collectionsCount || 0,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};
