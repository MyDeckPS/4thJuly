
-- Add RLS policies to collection_links table
ALTER TABLE public.collection_links ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing collection links (allow all authenticated users to view)
CREATE POLICY "Allow authenticated users to view collection links" 
  ON public.collection_links 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create policy for inserting collection links (only admins)
CREATE POLICY "Allow admins to create collection links" 
  ON public.collection_links 
  FOR INSERT 
  WITH CHECK (public.is_admin());

-- Create policy for updating collection links (only admins)
CREATE POLICY "Allow admins to update collection links" 
  ON public.collection_links 
  FOR UPDATE 
  USING (public.is_admin());

-- Create policy for deleting collection links (only admins)
CREATE POLICY "Allow admins to delete collection links" 
  ON public.collection_links 
  FOR DELETE 
  USING (public.is_admin());

-- Add RLS policies to product_collections table
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing product-collection relationships
CREATE POLICY "Allow authenticated users to view product collections" 
  ON public.product_collections 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create policy for inserting product-collection relationships (only admins)
CREATE POLICY "Allow admins to create product collections" 
  ON public.product_collections 
  FOR INSERT 
  WITH CHECK (public.is_admin());

-- Create policy for updating product-collection relationships (only admins)
CREATE POLICY "Allow admins to update product collections" 
  ON public.product_collections 
  FOR UPDATE 
  USING (public.is_admin());

-- Create policy for deleting product-collection relationships (only admins)
CREATE POLICY "Allow admins to delete product collections" 
  ON public.product_collections 
  FOR DELETE 
  USING (public.is_admin());

-- Create function to automatically link products to collections based on shared tags
CREATE OR REPLACE FUNCTION public.auto_link_products_by_tags()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  collection_record RECORD;
  product_record RECORD;
  shared_tags TEXT[];
BEGIN
  -- Loop through all published collections that have tags
  FOR collection_record IN 
    SELECT id, title, tags 
    FROM public.collections 
    WHERE published = true 
      AND tags IS NOT NULL 
      AND jsonb_array_length(tags) > 0
  LOOP
    -- Loop through all published products that have tags
    FOR product_record IN 
      SELECT id, title, tags 
      FROM public.products 
      WHERE published = true 
        AND tags IS NOT NULL 
        AND jsonb_array_length(tags) > 0
    LOOP
      -- Find shared tags between collection and product
      SELECT ARRAY(
        SELECT jsonb_array_elements_text(collection_record.tags)
        INTERSECT
        SELECT jsonb_array_elements_text(product_record.tags)
      ) INTO shared_tags;
      
      -- If there are shared tags, create the relationship
      IF array_length(shared_tags, 1) > 0 THEN
        INSERT INTO public.product_collections (product_id, collection_id)
        VALUES (product_record.id, collection_record.id)
        ON CONFLICT (product_id, collection_id) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

-- Create a unique constraint on product_collections to prevent duplicates
ALTER TABLE public.product_collections 
ADD CONSTRAINT unique_product_collection 
UNIQUE (product_id, collection_id);

-- Run the auto-linking function to populate existing relationships
SELECT public.auto_link_products_by_tags();
