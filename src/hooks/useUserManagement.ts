
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserManagementData {
  id: string;
  name: string;
  email: string;
  created_at: string;
  quiz_completed: boolean;
  child_name?: string;
  child_gender?: string;
  child_birthday?: string;
  quiz_responses?: any;
  booking_count: number;
}

interface QuizResponseData {
  childName?: string;
  childGender?: string;
  childBirthday?: string;
  [key: string]: any;
}

export const useUserManagement = (userTypeFilter?: string, searchQuery?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-management', userTypeFilter, searchQuery],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('Starting user management data fetch...');

      // Step 1: Fetch profiles
      let profilesQuery = supabase
        .from('profiles')
        .select('id, name, created_at, quiz_completed');

      // Apply search filter
      if (searchQuery) {
        profilesQuery = profilesQuery.ilike('name', `%${searchQuery}%`);
      }

      profilesQuery = profilesQuery.order('created_at', { ascending: false });

      const { data: profiles, error: profilesError } = await profilesQuery;

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles fetched:', profiles?.length || 0);

      if (!profiles || profiles.length === 0) {
        return [];
      }

      const userIds = profiles.map(p => p.id);

      // Step 2: Fetch quiz responses separately
      const { data: quizResponses, error: quizError } = await supabase
        .from('quiz_responses')
        .select('user_id, responses')
        .in('user_id', userIds)
        .order('completed_at', { ascending: false });

      if (quizError) {
        console.error('Error fetching quiz responses:', quizError);
      }

      console.log('Quiz responses fetched:', quizResponses?.length || 0);

      // Step 3: Get booking counts for each user
      const { data: bookingCounts, error: bookingsError } = await supabase
        .from('bookings')
        .select('user_id')
        .in('user_id', userIds);

      if (bookingsError) {
        console.error('Error fetching booking counts:', bookingsError);
      }

      console.log('Bookings fetched:', bookingCounts?.length || 0);

      // Step 4: Fetch emails using the database function
      const emailPromises = userIds.map(async (userId) => {
        try {
          const { data: emailData, error: emailError } = await supabase
            .rpc('get_user_email', { user_uuid: userId });
          
          if (emailError) {
            console.error(`Error fetching email for user ${userId}:`, emailError);
            return { userId, email: 'Email not available' };
          }
          
          return { userId, email: emailData || 'Email not available' };
        } catch (error) {
          console.error(`Error in email fetch for user ${userId}:`, error);
          return { userId, email: 'Email not available' };
        }
      });

      const emailResults = await Promise.all(emailPromises);
      const emailMap = emailResults.reduce((acc, { userId, email }) => {
        acc[userId] = email;
        return acc;
      }, {} as Record<string, string>);

      // Create lookup maps
      const quizResponseMap = new Map();
      quizResponses?.forEach(qr => {
        if (!quizResponseMap.has(qr.user_id)) {
          quizResponseMap.set(qr.user_id, qr.responses);
        }
      });

      // Count bookings per user
      const bookingCountMap = bookingCounts?.reduce((acc, booking) => {
        acc[booking.user_id] = (acc[booking.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Step 5: Format the data
      const formattedData: UserManagementData[] = profiles.map(profile => {
        const quizResponse: QuizResponseData = quizResponseMap.get(profile.id) || {};
        
        return {
          id: profile.id,
          name: profile.name || 'N/A',
          email: emailMap[profile.id] || 'Email not available',
          created_at: profile.created_at,
          quiz_completed: profile.quiz_completed,
          child_name: quizResponse.childName || 'N/A',
          child_gender: quizResponse.childGender || 'N/A',
          child_birthday: quizResponse.childBirthday || 'N/A',
          quiz_responses: quizResponse,
          booking_count: bookingCountMap[profile.id] || 0
        };
      });

      console.log('Formatted user management data:', formattedData.length);
      return formattedData;
    },
    enabled: !!user,
  });
};
