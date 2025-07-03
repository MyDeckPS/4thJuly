import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  quiz_completed: boolean;
  welcome_offer_used: boolean;
}

export interface QuizResponses {
  childName?: string;
  childGender?: string;
  childBirthday?: string;
  [key: string]: any;
}

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      console.log('Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      console.log('Profile data:', data);
      return data as UserProfile;
    },
    enabled: !!user,
  });

  // Get quiz responses separately
  const { data: quizData } = useQuery({
    queryKey: ['quiz-responses', user?.id],
    queryFn: async () => {
      if (!user) return {};
      
      const { data, error } = await supabase
        .from('quiz_responses')
        .select('responses')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log('No quiz responses found or error:', error);
        return {};
      }

      return (data?.responses || {}) as QuizResponses;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to update profile: ${error.message}`);
    }
  });

  // Utility functions
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    
    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return { years, months, days };
  };

  const getZodiacSign = (birthDate: string) => {
    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const signs = [
      'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
      'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'
    ];
    
    const dates = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
    
    return signs[month - (day < dates[month - 1] ? 1 : 0)];
  };

  return {
    profile,
    quizResponses: quizData || {},
    isLoading,
    error,
    updateProfile,
    calculateAge,
    getZodiacSign,
    loading: isLoading,
    refetch
  };
};
