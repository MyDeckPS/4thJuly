
-- First, let's clean up the child_insights table and restructure it with fixed insight types
DROP TABLE IF EXISTS public.child_insights CASCADE;

-- Create new child_insights table with fixed insight columns
CREATE TABLE public.child_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  cognitive_score INTEGER DEFAULT 0 CHECK (cognitive_score >= 0 AND cognitive_score <= 100),
  stem_robotics_score INTEGER DEFAULT 0 CHECK (stem_robotics_score >= 0 AND stem_robotics_score <= 100),
  creativity_imagination_score INTEGER DEFAULT 0 CHECK (creativity_imagination_score >= 0 AND creativity_imagination_score <= 100),
  motor_skill_score INTEGER DEFAULT 0 CHECK (motor_skill_score >= 0 AND motor_skill_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.child_insights ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own insights
CREATE POLICY "Users can view their own child insights" 
  ON public.child_insights 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for authenticated users to insert (will be used by admin)
CREATE POLICY "Authenticated users can insert child insights" 
  ON public.child_insights 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for authenticated users to update (will be used by admin)
CREATE POLICY "Authenticated users can update child insights" 
  ON public.child_insights 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Add trigger for updated_at
CREATE TRIGGER update_child_insights_updated_at
  BEFORE UPDATE ON public.child_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create index for performance
CREATE INDEX idx_child_insights_user_id ON public.child_insights(user_id);
