
-- First, let's ensure we have proper RLS policies for all the tables used in user management

-- Enable RLS on tables if not already enabled
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;

-- Create admin role check function if it doesn't exist
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

-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Users can view their own messages" ON public.user_messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON public.user_messages;
DROP POLICY IF EXISTS "Users can view their own expert notes" ON public.expert_notes;
DROP POLICY IF EXISTS "Admins can manage all expert notes" ON public.expert_notes;
DROP POLICY IF EXISTS "Users can view their own child insights" ON public.child_insights;
DROP POLICY IF EXISTS "Admins can manage all child insights" ON public.child_insights;
DROP POLICY IF EXISTS "Users can view their own recommendations" ON public.user_recommendations;
DROP POLICY IF EXISTS "Admins can manage all recommendations" ON public.user_recommendations;

-- Create proper RLS policies for user_messages
CREATE POLICY "Users can view their own messages" ON public.user_messages
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can manage all messages" ON public.user_messages
  FOR ALL USING (public.is_admin());

-- Create proper RLS policies for expert_notes
CREATE POLICY "Users can view their own expert notes" ON public.expert_notes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all expert notes" ON public.expert_notes
  FOR ALL USING (public.is_admin());

-- Create proper RLS policies for child_insights
CREATE POLICY "Users can view their own child insights" ON public.child_insights
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all child insights" ON public.child_insights
  FOR ALL USING (public.is_admin());

-- Create proper RLS policies for user_recommendations
CREATE POLICY "Users can view their own recommendations" ON public.user_recommendations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all recommendations" ON public.user_recommendations
  FOR ALL USING (public.is_admin());

-- Create edge function to get user email from auth
CREATE OR REPLACE FUNCTION public.get_user_email(user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
BEGIN
  -- Only admins can call this function
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_uuid;

  RETURN COALESCE(user_email, 'Email not available');
END;
$$;
