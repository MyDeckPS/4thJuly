
-- Add automatic product-collection linking trigger
-- This will automatically link products to collections when they share tags

CREATE OR REPLACE FUNCTION auto_link_product_to_collections()
RETURNS TRIGGER AS $$
DECLARE
  collection_record RECORD;
  shared_tags TEXT[];
BEGIN
  -- Only process if this is an INSERT or if tags were updated
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.tags IS DISTINCT FROM NEW.tags) THEN
    
    -- Loop through all published collections that have tags
    FOR collection_record IN 
      SELECT id, tags 
      FROM public.collections 
      WHERE published = true 
        AND tags IS NOT NULL 
        AND jsonb_array_length(tags) > 0
    LOOP
      -- Find shared tags between collection and product
      SELECT ARRAY(
        SELECT jsonb_array_elements_text(collection_record.tags)
        INTERSECT
        SELECT jsonb_array_elements_text(NEW.tags)
      ) INTO shared_tags;
      
      -- If there are shared tags, create the relationship (if it doesn't exist)
      IF array_length(shared_tags, 1) > 0 THEN
        INSERT INTO public.product_collections (product_id, collection_id)
        VALUES (NEW.id, collection_record.id)
        ON CONFLICT (product_id, collection_id) DO NOTHING;
      ELSE
        -- If no shared tags, remove the relationship (if it exists)
        DELETE FROM public.product_collections 
        WHERE product_id = NEW.id AND collection_id = collection_record.id;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for products table
DROP TRIGGER IF EXISTS trigger_auto_link_product_collections ON public.products;
CREATE TRIGGER trigger_auto_link_product_collections
  AFTER INSERT OR UPDATE OF tags ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION auto_link_product_to_collections();

-- Also create a trigger for collections table to handle collection tag updates
CREATE OR REPLACE FUNCTION auto_link_collection_to_products()
RETURNS TRIGGER AS $$
DECLARE
  product_record RECORD;
  shared_tags TEXT[];
BEGIN
  -- Only process if this is an INSERT or if tags were updated, and collection is published
  IF NEW.published = true AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.tags IS DISTINCT FROM NEW.tags)) THEN
    
    -- Loop through all published products that have tags
    FOR product_record IN 
      SELECT id, tags 
      FROM public.products 
      WHERE published = true 
        AND tags IS NOT NULL 
        AND jsonb_array_length(tags) > 0
    LOOP
      -- Find shared tags between collection and product
      SELECT ARRAY(
        SELECT jsonb_array_elements_text(NEW.tags)
        INTERSECT
        SELECT jsonb_array_elements_text(product_record.tags)
      ) INTO shared_tags;
      
      -- If there are shared tags, create the relationship (if it doesn't exist)
      IF array_length(shared_tags, 1) > 0 THEN
        INSERT INTO public.product_collections (product_id, collection_id)
        VALUES (product_record.id, NEW.id)
        ON CONFLICT (product_id, collection_id) DO NOTHING;
      ELSE
        -- If no shared tags, remove the relationship (if it exists)
        DELETE FROM public.product_collections 
        WHERE product_id = product_record.id AND collection_id = NEW.id;
      END IF;
    END LOOP;
  END IF;
  
  -- If collection is unpublished, remove all its product associations
  IF NEW.published = false AND (OLD.published IS NULL OR OLD.published = true) THEN
    DELETE FROM public.product_collections WHERE collection_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for collections table
DROP TRIGGER IF EXISTS trigger_auto_link_collection_products ON public.collections;
CREATE TRIGGER trigger_auto_link_collection_products
  AFTER INSERT OR UPDATE OF tags, published ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION auto_link_collection_to_products();

-- Add a field to footer_links table to support header navigation
ALTER TABLE public.footer_links 
ADD COLUMN IF NOT EXISTS link_category text DEFAULT 'footer';

-- Update existing footer_links to have 'footer' category
UPDATE public.footer_links 
SET link_category = 'footer' 
WHERE link_category IS NULL;
