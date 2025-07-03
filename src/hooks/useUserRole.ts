
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('No user found, returning null role');
        return null;
      }

      console.log('Fetching user role for:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
          return 'customer';
        }

        const role = data?.role || 'customer';
        console.log('User role fetched:', role);
        return role;
      } catch (error) {
        console.error('Error fetching user role:', error);
        return 'customer';
      }
    },
    enabled: !!user,
  });
};
