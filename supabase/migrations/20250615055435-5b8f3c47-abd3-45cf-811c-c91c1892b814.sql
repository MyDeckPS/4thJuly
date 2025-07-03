
-- Add link fields to shop_slideshows table
ALTER TABLE public.shop_slideshows 
ADD COLUMN link_url TEXT,
ADD COLUMN link_type TEXT CHECK (link_type IN ('external', 'internal', 'none')) DEFAULT 'none',
ADD COLUMN internal_path TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.shop_slideshows.link_url IS 'External URL for external links';
COMMENT ON COLUMN public.shop_slideshows.link_type IS 'Type of link: external, internal, or none';
COMMENT ON COLUMN public.shop_slideshows.internal_path IS 'Internal route path for internal navigation';
