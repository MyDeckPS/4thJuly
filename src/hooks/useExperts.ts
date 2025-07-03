
import { useQuery } from '@tanstack/react-query';

export interface Expert {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  bio: string | null;
  image_url: string | null;
  hourly_rate: number;
  available: boolean;
}

export const useExperts = () => {
  return useQuery({
    queryKey: ['experts'],
    queryFn: async () => {
      // Since the experts table doesn't exist in the current database state,
      // return empty array to prevent errors
      console.log('Experts table not available in current database state');
      return [] as Expert[];
    },
  });
};

export const useExpert = (id: string) => {
  return useQuery({
    queryKey: ['expert', id],
    queryFn: async () => {
      // Since the experts table doesn't exist in the current database state,
      // return null to prevent errors
      console.log('Expert table not available in current database state');
      return null as Expert | null;
    },
    enabled: !!id,
  });
};
