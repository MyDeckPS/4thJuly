
-- Create shop_slideshows table for managing hero banner slides
CREATE TABLE public.shop_slideshows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cta_text TEXT,
  media_id UUID REFERENCES public.media_library(id),
  link_type TEXT NOT NULL CHECK (link_type IN ('internal', 'external')),
  internal_path TEXT,
  external_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shop_sections table for configuring which sections appear on shop page
CREATE TABLE public.shop_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_type TEXT NOT NULL CHECK (section_type IN ('hero_slideshow', 'collections_tabs', 'collections_carousel', 'product_carousel')),
  title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_carousels table for managing dynamic product carousels
CREATE TABLE public.product_carousels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  filter_type TEXT NOT NULL CHECK (filter_type IN ('featured', 'new_arrivals', 'collection', 'manual')),
  collection_id UUID REFERENCES public.collections(id),
  product_ids JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collections_display table for managing which collections show in various sections
CREATE TABLE public.collections_display (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.collections(id),
  display_type TEXT NOT NULL CHECK (display_type IN ('tab_navigation', 'carousel', 'grid')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.shop_slideshows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_carousels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections_display ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage all data
CREATE POLICY "Admins can manage shop slideshows" ON public.shop_slideshows FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage shop sections" ON public.shop_sections FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage product carousels" ON public.product_carousels FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage collections display" ON public.collections_display FOR ALL USING (public.is_admin());

-- Allow public read access to active content
CREATE POLICY "Public can view active slideshows" ON public.shop_slideshows FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active sections" ON public.shop_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active carousels" ON public.product_carousels FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active collections display" ON public.collections_display FOR SELECT USING (is_active = true);

-- Insert default sections
INSERT INTO public.shop_sections (section_type, title, sort_order, config) VALUES
('hero_slideshow', 'Hero Slideshow', 1, '{"autoplay": true, "delay": 5000}'),
('collections_tabs', 'Collections Navigation', 2, '{}'),
('collections_carousel', 'Shop by Collection', 3, '{}'),
('product_carousel', 'Featured Products', 4, '{"carousel_id": null}'),
('product_carousel', 'New Arrivals', 5, '{"carousel_id": null}'),
('product_carousel', 'Popular This Week', 6, '{"carousel_id": null}');

-- Insert default product carousels
INSERT INTO public.product_carousels (title, filter_type, sort_order) VALUES
('Featured Products', 'featured', 1),
('New Arrivals', 'new_arrivals', 2),
('Popular This Week', 'new_arrivals', 3);
