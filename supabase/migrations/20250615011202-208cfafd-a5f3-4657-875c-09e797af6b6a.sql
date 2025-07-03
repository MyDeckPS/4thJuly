
-- Add missing columns to existing user_tags table
ALTER TABLE public.user_tags 
ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS source_question_id UUID REFERENCES public.quiz_questions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create question_tagging_rules table (this one is missing)
CREATE TABLE public.question_tagging_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_value TEXT NOT NULL,
  tag_to_assign TEXT NOT NULL,
  confidence_score INTEGER NOT NULL DEFAULT 100 CHECK (confidence_score >= 1 AND confidence_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_question_tagging_rules_question_id ON public.question_tagging_rules(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tagging_rules_option_value ON public.question_tagging_rules(option_value);
CREATE INDEX IF NOT EXISTS idx_user_tags_user_id ON public.user_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_tag ON public.user_tags(tag);

-- Add RLS policies
ALTER TABLE public.question_tagging_rules ENABLE ROW LEVEL SECURITY;

-- Admin-only access to tagging rules
CREATE POLICY "Admin can manage tagging rules" ON public.question_tagging_rules
  FOR ALL USING (public.is_admin());

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_question_tagging_rules_updated_at
  BEFORE UPDATE ON public.question_tagging_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Add trigger for user_tags updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_tags_updated_at'
  ) THEN
    CREATE TRIGGER update_user_tags_updated_at
      BEFORE UPDATE ON public.user_tags
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at();
  END IF;
END
$$;
