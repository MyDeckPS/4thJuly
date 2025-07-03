
-- Add score column to product_developmental_goals table
ALTER TABLE public.product_developmental_goals
ADD COLUMN score INTEGER NOT NULL DEFAULT 0;

-- Add a check constraint to ensure score is between 0 and 100
ALTER TABLE public.product_developmental_goals
ADD CONSTRAINT score_check CHECK (score >= 0 AND score <= 100);

-- Update existing rows to have a default score of 0 if any exist (optional, but good practice)
-- This step might not be necessary if the table is new or empty, but it's safe to include.
UPDATE public.product_developmental_goals
SET score = 0
WHERE score IS NULL;

