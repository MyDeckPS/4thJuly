import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Challenge Interfaces
export interface ProductChallenge {
  id: string;
  product_id: string;
  title: string;
  description: string;
  task_instructions: string;
  diary_prompt?: string;
  emoji: string;
  points_reward: number;
  time_limit_hours: number;
  completion_time_minutes?: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  products?: {
    title: string;
  };
}

export interface UserChallengeInstance {
  id: string;
  user_id: string;
  product_challenge_id: string;
  user_product_purchase_id: string;
  status: 'available' | 'active' | 'submitted' | 'completed' | 'expired';
  started_at?: string;
  expires_at?: string;
  submitted_at?: string;
  completed_at?: string;
  points_earned: number;
  created_at: string;
  updated_at: string;
  product_challenges: ProductChallenge;
  challenge_submissions?: ChallengeSubmission[];
}

export interface ChallengeSubmission {
  id: string;
  user_challenge_instance_id: string;
  user_notes?: string;
  completion_time_minutes?: number;
  image_urls: string[];
  admin_feedback?: string;
  approval_status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  reviewed_by?: string;
  reviewed_at?: string;
  auto_posted_to_diary: boolean;
  diary_entry_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChallengeData {
  product_id: string;
  title: string;
  description: string;
  task_instructions: string;
  diary_prompt?: string;
  emoji?: string;
  points_reward?: number;
  time_limit_hours?: number;
  completion_time_minutes?: number;
  difficulty_level?: 'easy' | 'medium' | 'hard';
}

// Hook to get all challenges for admin (with product info)
export const useAdminChallenges = () => {
  return useQuery({
    queryKey: ['admin-challenges'],
    queryFn: async () => {
      console.log('Fetching admin challenges...');
      
      const { data, error } = await supabase
        .from('product_challenges')
        .select(`
          *,
          products!product_challenges_product_id_fkey (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin challenges:', error);
        throw error;
      }

      console.log('Fetched admin challenges:', data);
      return data as ProductChallenge[];
    },
  });
};

// Hook to get challenges for a specific product
export const useProductChallenges = (productId?: string) => {
  return useQuery({
    queryKey: ['product-challenges', productId],
    queryFn: async () => {
      if (!productId) return [];
      
      console.log('Fetching challenges for product:', productId);
      
      const { data, error } = await supabase
        .from('product_challenges')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching product challenges:', error);
        throw error;
      }

      console.log('Fetched product challenges:', data);
      return data as ProductChallenge[];
    },
    enabled: !!productId,
  });
};

// Hook to get user's challenge instances for their purchased products
export const useUserChallenges = (userId?: string) => {
  return useQuery({
    queryKey: ['user-challenges', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('Fetching user challenges for:', userId);
      
      const { data, error } = await supabase
        .from('user_challenge_instances')
        .select(`
          *,
          product_challenges!user_challenge_instances_product_challenge_id_fkey (*),
          challenge_submissions!challenge_submissions_user_challenge_instance_id_fkey (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user challenges:', error);
        throw error;
      }

      console.log('Fetched user challenges:', data);
      return data as UserChallengeInstance[];
    },
    enabled: !!userId,
  });
};

// Hook to get user challenges for a specific product purchase
export const useUserProductChallenges = (userProductPurchaseId?: string) => {
  return useQuery({
    queryKey: ['user-product-challenges', userProductPurchaseId],
    queryFn: async () => {
      if (!userProductPurchaseId) return [];
      
      console.log('Fetching challenges for purchase:', userProductPurchaseId);
      
      const { data, error } = await supabase
        .from('user_challenge_instances')
        .select(`
          *,
          product_challenges!user_challenge_instances_product_challenge_id_fkey (*),
          challenge_submissions!challenge_submissions_user_challenge_instance_id_fkey (*)
        `)
        .eq('user_product_purchase_id', userProductPurchaseId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching user product challenges:', error);
        throw error;
      }

      console.log('Fetched user product challenges:', data);
      return data as UserChallengeInstance[];
    },
    enabled: !!userProductPurchaseId,
  });
};

// Hook to get pending challenge submissions for admin review
export const usePendingSubmissions = () => {
  return useQuery({
    queryKey: ['pending-submissions'],
    queryFn: async () => {
      console.log('Fetching pending submissions...');
      
      const { data, error } = await supabase
        .from('challenge_submissions')
        .select(`
          *,
          user_challenge_instances!challenge_submissions_user_challenge_instance_id_fkey (
            *,
            product_challenges!user_challenge_instances_product_challenge_id_fkey (*),
            profiles!user_challenge_instances_user_id_fkey (name)
          )
        `)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching pending submissions:', error);
        throw error;
      }

      console.log('Fetched pending submissions:', data);
      return data;
    },
  });
};

// Hook to create a new challenge (admin only)
export const useCreateChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (challengeData: CreateChallengeData) => {
      console.log('Creating challenge:', challengeData);
      
      const { data, error } = await supabase
        .from('product_challenges')
        .insert([challengeData])
        .select()
        .single();

      if (error) {
        console.error('Error creating challenge:', error);
        throw error;
      }

      console.log('Created challenge:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['product-challenges'] });
      toast.success('Challenge created successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to create challenge:', error);
      toast.error(`Failed to create challenge: ${error.message}`);
    },
  });
};

// Hook to update a challenge (admin only)
export const useUpdateChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<CreateChallengeData>) => {
      console.log('Updating challenge:', id, updateData);
      
      const { data, error } = await supabase
        .from('product_challenges')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating challenge:', error);
        throw error;
      }

      console.log('Updated challenge:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['product-challenges'] });
      toast.success('Challenge updated successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to update challenge:', error);
      toast.error(`Failed to update challenge: ${error.message}`);
    },
  });
};

// Hook to start a challenge (user)
export const useStartChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (challengeInstanceId: string) => {
      console.log('Starting challenge:', challengeInstanceId);
      
      const { data, error } = await supabase.rpc('start_challenge', {
        challenge_instance_id: challengeInstanceId
      });

      if (error) {
        console.error('Error starting challenge:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Failed to start challenge');
      }

      console.log('Started challenge successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['user-product-challenges'] });
      toast.success('Challenge started! Timer is now running.');
    },
    onError: (error: any) => {
      console.error('Failed to start challenge:', error);
      toast.error(`Failed to start challenge: ${error.message}`);
    },
  });
};

// Hook to submit challenge completion (user)
export const useSubmitChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      challengeInstanceId,
      userNotes,
      completionTimeMinutes,
      imageUrls
    }: {
      challengeInstanceId: string;
      userNotes?: string;
      completionTimeMinutes?: number;
      imageUrls?: string[];
    }) => {
      console.log('Submitting challenge:', challengeInstanceId);
      
      const { data, error } = await supabase.rpc('submit_challenge', {
        challenge_instance_id: challengeInstanceId,
        p_user_notes: userNotes,
        p_completion_time_minutes: completionTimeMinutes,
        p_image_urls: JSON.stringify(imageUrls || [])
      });

      if (error) {
        console.error('Error submitting challenge:', error);
        throw error;
      }

      console.log('Submitted challenge successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['user-product-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['pending-submissions'] });
      toast.success('Challenge submitted! Waiting for admin review.');
    },
    onError: (error: any) => {
      console.error('Failed to submit challenge:', error);
      toast.error(`Failed to submit challenge: ${error.message}`);
    },
  });
};

// Hook to review a challenge submission (admin)
export const useReviewSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      approvalStatus,
      adminFeedback,
      autoPostToDiary = false
    }: {
      submissionId: string;
      approvalStatus: 'approved' | 'rejected' | 'needs_revision';
      adminFeedback?: string;
      autoPostToDiary?: boolean;
    }) => {
      console.log('Reviewing submission:', submissionId, approvalStatus);
      
      const { data, error } = await supabase.rpc('review_challenge_submission', {
        submission_id: submissionId,
        p_approval_status: approvalStatus,
        p_admin_feedback: adminFeedback,
        p_auto_post_to_diary: autoPostToDiary
      });

      if (error) {
        console.error('Error reviewing submission:', error);
        throw error;
      }

      console.log('Reviewed submission successfully');
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-challenges'] });
      const action = variables.approvalStatus === 'approved' ? 'approved' : 'reviewed';
      toast.success(`Challenge submission ${action} successfully!`);
    },
    onError: (error: any) => {
      console.error('Failed to review submission:', error);
      toast.error(`Failed to review submission: ${error.message}`);
    },
  });
};

// Hook to delete a challenge (admin only)
export const useDeleteChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (challengeId: string) => {
      console.log('Deleting challenge:', challengeId);
      
      const { error } = await supabase
        .from('product_challenges')
        .delete()
        .eq('id', challengeId);

      if (error) {
        console.error('Error deleting challenge:', error);
        throw error;
      }

      console.log('Deleted challenge successfully');
      return challengeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['product-challenges'] });
      toast.success('Challenge deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to delete challenge:', error);
      toast.error(`Failed to delete challenge: ${error.message}`);
    },
  });
};

// Hook to get total challenge points earned by a user
export const useUserChallengePoints = (userId?: string) => {
  return useQuery({
    queryKey: ['user-challenge-points', userId],
    queryFn: async () => {
      if (!userId) return 0;
      
      console.log('Fetching challenge points for user:', userId);
      
      const { data, error } = await supabase
        .from('user_challenge_instances')
        .select('points_earned')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching challenge points:', error);
        throw error;
      }

      const totalChallengePoints = (data || []).reduce((sum, instance) => {
        return sum + (instance.points_earned || 0);
      }, 0);

      console.log('Total challenge points earned:', totalChallengePoints);
      return totalChallengePoints;
    },
    enabled: !!userId,
  });
}; 