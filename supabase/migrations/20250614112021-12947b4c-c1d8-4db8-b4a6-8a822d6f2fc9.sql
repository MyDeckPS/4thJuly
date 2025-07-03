
-- Remove the old linked_collections boolean column
ALTER TABLE public.collections DROP COLUMN IF EXISTS linked_collections;

-- Create a new table for many-to-many collection relationships
CREATE TABLE public.collection_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  linked_collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_collection_id, linked_collection_id)
);

-- Add index for better query performance
CREATE INDEX idx_collection_links_parent ON public.collection_links(parent_collection_id);
CREATE INDEX idx_collection_links_linked ON public.collection_links(linked_collection_id);

-- Prevent self-linking
ALTER TABLE public.collection_links ADD CONSTRAINT no_self_link CHECK (parent_collection_id != linked_collection_id);

-- Comment on the table for clarity
COMMENT ON TABLE public.collection_links IS 'Many-to-many relationship table linking collections to their sub-navigation collections';
