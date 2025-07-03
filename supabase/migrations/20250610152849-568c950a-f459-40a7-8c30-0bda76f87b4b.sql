
-- Add price fields to products table
ALTER TABLE public.products 
ADD COLUMN price DECIMAL(10,2),
ADD COLUMN compare_at_price DECIMAL(10,2);

-- Add tags to products table (stored as JSON array)
ALTER TABLE public.products 
ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;

-- Add tags to collections table (stored as JSON array)
ALTER TABLE public.collections 
ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;

-- Create indexes for better performance on tag queries
CREATE INDEX idx_products_tags ON public.products USING GIN (tags);
CREATE INDEX idx_collections_tags ON public.collections USING GIN (tags);

-- Add comments to document the new fields
COMMENT ON COLUMN public.products.price IS 'Current selling price of the product';
COMMENT ON COLUMN public.products.compare_at_price IS 'Original/compare-at price for showing discounts';
COMMENT ON COLUMN public.products.tags IS 'Array of tags for matching with collections';
COMMENT ON COLUMN public.collections.tags IS 'Array of tags for matching with products';
