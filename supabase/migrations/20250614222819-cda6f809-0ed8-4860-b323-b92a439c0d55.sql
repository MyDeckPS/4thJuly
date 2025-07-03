
-- Drop existing policies on child_insights table
DROP POLICY IF EXISTS "Users can view their own child insights" ON public.child_insights;
DROP POLICY IF EXISTS "Authenticated users can insert child insights" ON public.child_insights;
DROP POLICY IF EXISTS "Authenticated users can update child insights" ON public.child_insights;

-- Create new policies that allow admins full access while preserving user access to their own data
CREATE POLICY "Users can view their own child insights or admins can view all" 
  ON public.child_insights 
  FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin());

-- Policy for users to insert their own insights or admins to insert for any user
CREATE POLICY "Users can insert their own child insights or admins can insert for any user" 
  ON public.child_insights 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR public.is_admin()));

-- Policy for users to update their own insights or admins to update any user's insights
CREATE POLICY "Users can update their own child insights or admins can update any user's insights" 
  ON public.child_insights 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR public.is_admin()))
  WITH CHECK (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR public.is_admin()));

-- Policy for admins to delete child insights (optional - only if deletion is needed)
CREATE POLICY "Admins can delete child insights" 
  ON public.child_insights 
  FOR DELETE 
  USING (public.is_admin());
