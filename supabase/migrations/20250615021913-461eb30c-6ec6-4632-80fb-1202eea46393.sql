
-- Add RLS policies for quiz_questions table to allow admin CRUD operations
CREATE POLICY "Admin can manage quiz questions" ON public.quiz_questions
  FOR ALL USING (public.is_admin());

-- Add RLS policies for question_tagging_rules table to allow admin CRUD operations  
CREATE POLICY "Admin can manage question tagging rules" ON public.question_tagging_rules
  FOR ALL USING (public.is_admin());

-- Ensure the is_admin function exists and works properly
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;
