
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChildInsight {
  id: string;
  user_id: string;
  cognitive_score: number;
  stem_robotics_score: number;
  creativity_imagination_score: number;
  motor_skill_score: number;
  created_at: string;
  updated_at: string;
}

export interface ExpertNote {
  id: string;
  user_id: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRecommendation {
  id: string;
  user_id: string;
  product_id: string;
  admin_opinion: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  products: {
    id: string;
    title: string;
    description: string;
    price: number;
    featured: boolean;
    amazon_affiliate_link: string;
  };
}

export interface DevelopmentalLevel {
  id: string;
  name: string;
  icon: string;
  description: string;
  sort_order: number;
}

export interface DevelopmentalGoal {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

export const useChildInsights = () => {
  return useQuery({
    queryKey: ['child-insights'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('child_insights')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as ChildInsight | null;
    },
  });
};

export const useExpertNotes = () => {
  return useQuery({
    queryKey: ['expert-notes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('expert_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as ExpertNote[];
    },
  });
};

export const useUserRecommendations = () => {
  return useQuery({
    queryKey: ['user-recommendations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_recommendations')
        .select(`
          id,
          user_id,
          product_id,
          admin_opinion,
          sort_order,
          is_active,
          created_at,
          products (
            id,
            title,
            description,
            price,
            compare_at_price,
            featured,
            amazon_affiliate_link,
            age_group,
            days_to_complete,
            has_cognitive_development,
            has_creativity_imagination,
            has_motor_skills,
            has_stem_robotics,
            tags,
            developmental_level_id,
            published,
            created_at,
            developmental_level:developmental_levels(*),
            product_images (
              id,
              image_url,
              alt_text,
              is_primary,
              sort_order
            ),
            product_accordions (
              id,
              title,
              content,
              sort_order
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw error;
      }

      return data as UserRecommendation[];
    },
  });
};

export const useDevelopmentalData = () => {
  const [developmentalLevels, setDevelopmentalLevels] = useState<DevelopmentalLevel[]>([]);
  const [developmentalGoals, setDevelopmentalGoals] = useState<DevelopmentalGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch developmental levels
        const { data: levels, error: levelsError } = await supabase
          .from('developmental_levels')
          .select('*')
          .order('sort_order', { ascending: true });

        if (levelsError) throw levelsError;

        // Fetch developmental goals
        const { data: goals, error: goalsError } = await supabase
          .from('developmental_goals')
          .select('*');

        if (goalsError) throw goalsError;

        setDevelopmentalLevels(levels || []);
        setDevelopmentalGoals(goals || []);
      } catch (error) {
        console.error('Error fetching developmental data:', error);
        toast({
          title: "Error",
          description: "Failed to load developmental data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  return {
    developmentalLevels,
    developmentalGoals,
    loading,
  };
};
