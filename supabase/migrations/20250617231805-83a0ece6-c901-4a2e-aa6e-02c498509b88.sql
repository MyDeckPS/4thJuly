
-- Create quiz_sets table to group questions
CREATE TABLE public.quiz_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add set_id column to quiz_questions table
ALTER TABLE public.quiz_questions 
ADD COLUMN set_id UUID REFERENCES public.quiz_sets(id);

-- Create a default set for existing questions
INSERT INTO public.quiz_sets (title, description, sort_order, is_active)
VALUES ('General Questions', 'Basic quiz questions', 0, true);

-- Update existing questions to belong to the default set
UPDATE public.quiz_questions 
SET set_id = (SELECT id FROM public.quiz_sets WHERE title = 'General Questions' LIMIT 1)
WHERE set_id IS NULL;

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_quiz_sets_updated_at
    BEFORE UPDATE ON public.quiz_sets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();
