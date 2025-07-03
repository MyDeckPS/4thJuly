
-- Create playpath_slideshows table with the same structure as shop_slideshows
CREATE TABLE public.playpath_slideshows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_id uuid REFERENCES public.media_library(id),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  link_type text DEFAULT 'none'::text,
  link_url text,
  internal_path text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playpath_slideshows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (only admins can manage slideshows)
CREATE POLICY "Admin can view playpath slideshows" ON public.playpath_slideshows
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin can insert playpath slideshows" ON public.playpath_slideshows
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update playpath slideshows" ON public.playpath_slideshows
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin can delete playpath slideshows" ON public.playpath_slideshows
  FOR DELETE USING (public.is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_playpath_slideshows_updated_at
  BEFORE UPDATE ON public.playpath_slideshows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
