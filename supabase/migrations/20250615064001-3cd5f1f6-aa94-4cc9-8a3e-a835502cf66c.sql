
-- Add foreign key relationships for sales_transactions table
ALTER TABLE public.sales_transactions 
ADD CONSTRAINT sales_transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.sales_transactions 
ADD CONSTRAINT sales_transactions_booking_id_fkey 
FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;
