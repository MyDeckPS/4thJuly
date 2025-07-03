
-- Drop existing restrictive RLS policies
DROP POLICY IF EXISTS "Admin can view all sales transactions" ON public.sales_transactions;
DROP POLICY IF EXISTS "Admin can insert sales transactions" ON public.sales_transactions;
DROP POLICY IF EXISTS "Admin can update sales transactions" ON public.sales_transactions;

-- Create new RLS policies that allow users to create their own transactions
CREATE POLICY "Users can view their own sales transactions" 
  ON public.sales_transactions 
  FOR SELECT 
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can create their own sales transactions" 
  ON public.sales_transactions 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can view all sales transactions" 
  ON public.sales_transactions 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Admin can update sales transactions" 
  ON public.sales_transactions 
  FOR UPDATE 
  USING (public.is_admin());

-- Allow authenticated users to call the generate_sales_id function
GRANT EXECUTE ON FUNCTION public.generate_sales_id() TO authenticated;
