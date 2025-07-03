import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WorkingHours {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface SchedulingRules {
  id: string;
  min_notice_hours: number;
  max_booking_days: number;
  buffer_minutes: number;
  slot_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkingHoursData {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available?: boolean;
}

export interface UpdateWorkingHoursData {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
}

export const useWorkingHours = () => {
  return useQuery({
    queryKey: ['working-hours'],
    queryFn: async () => {
      console.log('Fetching working hours...');
      
      const { data, error } = await supabase
        .from('working_hours')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (error) {
        console.error('Error fetching working hours:', error);
        throw error;
      }

      console.log('Fetched working hours:', data);
      return data as WorkingHours[];
    },
  });
};

// For backwards compatibility with admin components
export const useAllTimeSlots = () => {
  return useQuery({
    queryKey: ['all-time-slots'],
    queryFn: async () => {
      console.log('Fetching all time slots (working hours)...');
      
      const { data, error } = await supabase
        .from('working_hours')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (error) {
        console.error('Error fetching working hours:', error);
        throw error;
      }

      console.log('Fetched working hours:', data);
      return data as WorkingHours[];
    },
  });
};

export const useSchedulingRules = () => {
  return useQuery({
    queryKey: ['scheduling-rules'],
    queryFn: async () => {
      console.log('Fetching scheduling rules...');
      
      const { data, error } = await supabase
        .from('scheduling_rules')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching scheduling rules:', error);
        throw error;
      }

      console.log('Fetched scheduling rules:', data);
      return data as SchedulingRules;
    },
  });
};

export const useCreateWorkingHours = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workingHoursData: CreateWorkingHoursData) => {
      console.log('Creating working hours:', workingHoursData);
      const { data, error } = await supabase
        .from('working_hours')
        .insert([workingHoursData])
        .select()
        .single();

      if (error) {
        console.error('Error creating working hours:', error);
        throw error;
      }

      console.log('Created working hours:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['working-hours'] });
      queryClient.invalidateQueries({ queryKey: ['all-time-slots'] });
      toast({
        title: "Success",
        description: "Working hours created successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to create working hours:', error);
      toast({
        title: "Error",
        description: "Failed to create working hours. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Alias for backwards compatibility
export const useCreateTimeSlot = useCreateWorkingHours;

export const useUpdateWorkingHours = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateWorkingHoursData & { id: string }) => {
      console.log('Updating working hours:', id, updateData);
      
      const { data, error } = await supabase
        .from('working_hours')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating working hours:', error);
        throw error;
      }

      console.log('Updated working hours:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['working-hours'] });
      queryClient.invalidateQueries({ queryKey: ['all-time-slots'] });
      toast({
        title: "Success",
        description: "Working hours updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to update working hours:', error);
      toast({
        title: "Error",
        description: "Failed to update working hours. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTimeSlot = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting working hours:', id);
      
      const { data, error } = await supabase
        .from('working_hours')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error deleting working hours:', error);
        throw error;
      }

      console.log('Deleted working hours:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['working-hours'] });
      queryClient.invalidateQueries({ queryKey: ['all-time-slots'] });
      toast({
        title: "Success",
        description: "Working hours deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to delete working hours:', error);
      toast({
        title: "Error",
        description: "Failed to delete working hours. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSchedulingRules = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<SchedulingRules> & { id: string }) => {
      console.log('Updating scheduling rules:', id, updateData);
      
      const { data, error } = await supabase
        .from('scheduling_rules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating scheduling rules:', error);
        throw error;
      }

      console.log('Updated scheduling rules:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling-rules'] });
      toast({
        title: "Success",
        description: "Scheduling rules updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to update scheduling rules:', error);
      toast({
        title: "Error",
        description: "Failed to update scheduling rules. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Stub functions for availability templates (not used in single-host system)
export const useAvailabilityTemplates = () => {
  return useQuery({
    queryKey: ['availability-templates'],
    queryFn: async () => {
      return [];
    },
  });
};

export const useCreateAvailabilityTemplate = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      throw new Error('Availability templates not supported in single-host system');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Availability templates not supported in single-host system.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAvailabilityTemplate = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      throw new Error('Availability templates not supported in single-host system');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Availability templates not supported in single-host system.",
        variant: "destructive",
      });
    },
  });
};
