
-- Add the new column to the collections table
ALTER TABLE public.collections
ADD COLUMN linked_collections BOOLEAN DEFAULT FALSE;

-- Comment on the new column for clarity
COMMENT ON COLUMN public.collections.linked_collections IS 'Indicates if the collection should be featured in the sub-navigation on shop/collection pages as a linked collection.';
