-- Create user_product_purchases table for tracking Amazon affiliate purchases
CREATE TABLE public.user_product_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  purchase_source TEXT NOT NULL DEFAULT 'amazon_affiliate', -- 'amazon_affiliate', 'manual_admin'
  purchase_price NUMERIC,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  admin_notes TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'disputed'
  added_by_admin UUID REFERENCES public.profiles(id), -- which admin added this
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id, purchase_date) -- Prevent duplicate purchases on same day
);

-- Enable RLS on user_product_purchases
ALTER TABLE public.user_product_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own product purchases" 
  ON public.user_product_purchases 
  FOR SELECT 
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin can manage all product purchases" 
  ON public.user_product_purchases 
  FOR ALL 
  USING (public.is_admin());

CREATE POLICY "Admin can insert product purchases" 
  ON public.user_product_purchases 
  FOR INSERT 
  WITH CHECK (public.is_admin());

-- Add triggers for updated_at
CREATE TRIGGER update_user_product_purchases_updated_at
  BEFORE UPDATE ON public.user_product_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_user_product_purchases_user_id ON public.user_product_purchases(user_id);
CREATE INDEX idx_user_product_purchases_product_id ON public.user_product_purchases(product_id);
CREATE INDEX idx_user_product_purchases_date ON public.user_product_purchases(purchase_date);

-- Add this new source type to sales_transactions if needed
-- (This allows us to track affiliate purchases in the main sales system too)
ALTER TABLE public.sales_transactions 
DROP CONSTRAINT IF EXISTS sales_transactions_source_type_check;

ALTER TABLE public.sales_transactions 
ADD CONSTRAINT sales_transactions_source_type_check 
CHECK (source_type IN ('playpath_session', 'consultation_session', 'premium_membership', 'product_purchase'));

-- Function to automatically create sales transaction when admin adds product purchase
CREATE OR REPLACE FUNCTION public.track_product_purchase_transaction()
RETURNS trigger AS $$
DECLARE
  sales_id_generated text;
  product_price numeric;
BEGIN
  -- Get product price
  SELECT price INTO product_price 
  FROM public.products 
  WHERE id = NEW.product_id;
  
  -- Generate sales ID
  SELECT public.generate_sales_id() INTO sales_id_generated;
  
  -- Create corresponding sales transaction
  INSERT INTO public.sales_transactions (
    sales_id,
    user_id,
    booking_id,
    amount,
    source_type,
    payment_status,
    payment_gateway_id,
    payment_gateway_data
  ) VALUES (
    sales_id_generated,
    NEW.user_id,
    NULL, -- No booking for product purchases
    COALESCE(NEW.purchase_price, product_price, 0),
    'product_purchase',
    'completed',
    'admin_manual_' || NEW.id::text,
    jsonb_build_object(
      'product_id', NEW.product_id,
      'purchase_source', NEW.purchase_source,
      'added_by_admin', NEW.added_by_admin,
      'admin_notes', NEW.admin_notes
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for product purchase tracking
CREATE TRIGGER track_product_purchase_sales
  AFTER INSERT ON public.user_product_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.track_product_purchase_transaction(); 