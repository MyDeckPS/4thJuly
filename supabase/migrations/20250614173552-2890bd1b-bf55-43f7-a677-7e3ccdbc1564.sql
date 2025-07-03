
-- Create dynamic_pages table
CREATE TABLE public.dynamic_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.dynamic_pages ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to published pages
CREATE POLICY "Anyone can view published pages" 
  ON public.dynamic_pages 
  FOR SELECT 
  USING (published = true);

-- Create policy for admin full access
CREATE POLICY "Admins can manage all pages" 
  ON public.dynamic_pages 
  FOR ALL 
  USING (public.is_admin());

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_dynamic_pages_updated_at
  BEFORE UPDATE ON public.dynamic_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Insert initial Terms page content (simplified to avoid quote issues)
INSERT INTO public.dynamic_pages (title, body, slug, published) VALUES (
  'Terms and Conditions',
  '<p>Welcome to MyDeck.club. These Terms and Conditions govern your use of our website and services, including expert consultations, premium toy collections, and educational content.</p><p>By accessing or using our services, you agree to be bound by these Terms.</p>',
  'terms',
  true
);
