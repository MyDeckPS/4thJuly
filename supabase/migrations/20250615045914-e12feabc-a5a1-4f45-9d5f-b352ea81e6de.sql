
-- Add RLS policies for footer_configurations table
CREATE POLICY "Admins can manage footer configurations" 
  ON public.footer_configurations 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view footer configurations" 
  ON public.footer_configurations 
  FOR SELECT 
  TO authenticated, anon 
  USING (is_active = true);

-- Add RLS policies for footer_links table
CREATE POLICY "Admins can manage footer links" 
  ON public.footer_links 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view footer links" 
  ON public.footer_links 
  FOR SELECT 
  TO authenticated, anon 
  USING (is_active = true);
