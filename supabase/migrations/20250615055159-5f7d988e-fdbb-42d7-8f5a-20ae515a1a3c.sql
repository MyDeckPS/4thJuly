
-- Drop the existing shop_slideshows table and recreate it with only essential fields
DROP TABLE IF EXISTS public.shop_slideshows CASCADE;

-- Create simplified shop_slideshows table with only image and basic controls
CREATE TABLE public.shop_slideshows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_id UUID REFERENCES public.media_library(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.shop_slideshows ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage all data
CREATE POLICY "Admins can manage shop slideshows" ON public.shop_slideshows FOR ALL USING (public.is_admin());

-- Allow public read access to active content
CREATE POLICY "Public can view active slideshows" ON public.shop_slideshows FOR SELECT USING (is_active = true);
