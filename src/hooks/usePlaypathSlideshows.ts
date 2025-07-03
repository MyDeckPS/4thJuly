
import { useToast } from "@/hooks/use-toast";

export interface PlaypathSlideshow {
  id: string;
  media_id: string | null;
  is_active: boolean;
  sort_order: number;
  link_url: string | null;
  link_type: 'external' | 'internal' | 'none';
  internal_path: string | null;
  created_at: string;
  updated_at: string;
  media_library?: {
    id: string;
    file_url: string;
    alt_text: string | null;
  };
}

export const usePlaypathSlideshows = () => {
  const { toast } = useToast();

  // Since playpath_slideshows table was deleted, return empty data
  const slideshows: PlaypathSlideshow[] = [];
  const isLoading = false;

  const createSlideshow = {
    mutateAsync: async (slideshow: Omit<PlaypathSlideshow, 'id' | 'created_at' | 'updated_at'>) => {
      toast({ 
        title: "Error", 
        description: "PlayPath slideshows are no longer supported", 
        variant: "destructive" 
      });
      throw new Error("PlayPath slideshows table no longer exists");
    }
  };

  const updateSlideshow = {
    mutate: (data: Partial<PlaypathSlideshow> & { id: string }) => {
      toast({ 
        title: "Error", 
        description: "PlayPath slideshows are no longer supported", 
        variant: "destructive" 
      });
    }
  };

  const deleteSlideshow = {
    mutate: (id: string) => {
      toast({ 
        title: "Error", 
        description: "PlayPath slideshows are no longer supported", 
        variant: "destructive" 
      });
    }
  };

  return {
    slideshows,
    isLoading,
    createSlideshow,
    updateSlideshow,
    deleteSlideshow
  };
};
