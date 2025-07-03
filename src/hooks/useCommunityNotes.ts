
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CommunityNote {
  id: string;
  content: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  images?: string[];
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  profiles: {
    name: string;
    created_at: string;
  };
  likes: number;
  isLiked: boolean;
}

export const useCommunityNotes = (status?: 'pending' | 'approved' | 'rejected') => {
  const { user } = useAuth();

  const { data: notes = [], isLoading, error } = useQuery({
    queryKey: ['community-notes', status],
    queryFn: async () => {
      let query = supabase
        .from('community_notes')
        .select(`
          *,
          profiles!community_notes_user_id_fkey (
            name,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching community notes:', error);
        throw error;
      }

      if (!data) return [];

      // Get likes for each note
      const noteIds = data.map(note => note.id);
      const { data: likesData } = await supabase
        .from('note_likes')
        .select('note_id, user_id')
        .in('note_id', noteIds);

      // Process notes with like counts and user like status
      const processedNotes = data.map(note => {
        const noteLikes = likesData?.filter(like => like.note_id === note.id) || [];
        const isLiked = user ? noteLikes.some(like => like.user_id === user.id) : false;
        
        // Handle profile data safely - check if profiles exists and is not null
        const profiles = note.profiles && typeof note.profiles === 'object' && !Array.isArray(note.profiles) && 'name' in note.profiles
          ? note.profiles as { name: string; created_at: string }
          : { name: 'Unknown User', created_at: note.created_at };
        
        return {
          ...note,
          profiles,
          likes: noteLikes.length,
          isLiked,
          images: note.images || [],
          rejection_reason: note.rejection_reason || undefined
        };
      });

      return processedNotes as CommunityNote[];
    },
  });

  return { notes, isLoading, error };
};

export const useCreateCommunityNote = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, images }: { content: string; images?: string[] }) => {
      if (!user) throw new Error('User must be logged in');

      const { data, error } = await supabase
        .from('community_notes')
        .insert({
          content: content.trim(),
          user_id: user.id,
          images: images || [],
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-notes'] });
      toast.success('Your story has been submitted for review!');
    },
    onError: (error: any) => {
      toast.error(`Failed to submit story: ${error.message}`);
    }
  });
};

export const useToggleNoteLike = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, isCurrentlyLiked }: { noteId: string; isCurrentlyLiked: boolean }) => {
      if (!user) throw new Error('User must be logged in');

      if (isCurrentlyLiked) {
        // Remove like
        const { error } = await supabase
          .from('note_likes')
          .delete()
          .eq('note_id', noteId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('note_likes')
          .insert({
            note_id: noteId,
            user_id: user.id
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-notes'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update like: ${error.message}`);
    }
  });
};
