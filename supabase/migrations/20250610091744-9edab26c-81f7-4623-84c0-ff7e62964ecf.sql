
-- Create developmental_levels table
CREATE TABLE public.developmental_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create developmental_goals table
CREATE TABLE public.developmental_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collections table
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  age_group TEXT NOT NULL,
  days_to_complete INTEGER,
  amazon_affiliate_link TEXT NOT NULL,
  developmental_level_id UUID REFERENCES public.developmental_levels(id) NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_images table
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_accordions table
CREATE TABLE public.product_accordions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_developmental_goals junction table
CREATE TABLE public.product_developmental_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  developmental_goal_id UUID REFERENCES public.developmental_goals(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, developmental_goal_id)
);

-- Create product_collections junction table
CREATE TABLE public.product_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, collection_id)
);

-- Enable RLS on all tables
ALTER TABLE public.developmental_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developmental_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_accordions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_developmental_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access and admin write access
-- Developmental levels policies
CREATE POLICY "Public can view published developmental levels" 
  ON public.developmental_levels FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage developmental levels" 
  ON public.developmental_levels FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Developmental goals policies
CREATE POLICY "Public can view developmental goals" 
  ON public.developmental_goals FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage developmental goals" 
  ON public.developmental_goals FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Collections policies
CREATE POLICY "Public can view published collections" 
  ON public.collections FOR SELECT 
  USING (published = true);

CREATE POLICY "Admins can manage collections" 
  ON public.collections FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Products policies
CREATE POLICY "Public can view published products" 
  ON public.products FOR SELECT 
  USING (published = true);

CREATE POLICY "Admins can manage products" 
  ON public.products FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Product images policies
CREATE POLICY "Public can view product images" 
  ON public.product_images FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND published = true));

CREATE POLICY "Admins can manage product images" 
  ON public.product_images FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Product accordions policies
CREATE POLICY "Public can view product accordions" 
  ON public.product_accordions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND published = true));

CREATE POLICY "Admins can manage product accordions" 
  ON public.product_accordions FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Product developmental goals policies
CREATE POLICY "Public can view product developmental goals" 
  ON public.product_developmental_goals FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND published = true));

CREATE POLICY "Admins can manage product developmental goals" 
  ON public.product_developmental_goals FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Product collections policies
CREATE POLICY "Public can view product collections" 
  ON public.product_collections FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND published = true));

CREATE POLICY "Admins can manage product collections" 
  ON public.product_collections FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Add update triggers for updated_at columns
CREATE TRIGGER update_developmental_levels_updated_at 
  BEFORE UPDATE ON public.developmental_levels 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_developmental_goals_updated_at 
  BEFORE UPDATE ON public.developmental_goals 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_collections_updated_at 
  BEFORE UPDATE ON public.collections 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON public.products 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default developmental levels
INSERT INTO public.developmental_levels (name, icon, description, sort_order) VALUES
('Beginner', '🌱', 'Starting their developmental journey', 1),
('Rookie', '🌿', 'Building foundational skills', 2),
('Explorer', '🔍', 'Discovering new abilities', 3),
('Challenger', '🚀', 'Taking on complex challenges', 4),
('Master', '🏆', 'Advanced developmental achievements', 5);

-- Insert default developmental goals
INSERT INTO public.developmental_goals (name, color) VALUES
('Motor Skills', '#3B82F6'),
('Cognitive Development', '#8B5CF6'),
('Social Skills', '#10B981'),
('Language Development', '#F59E0B'),
('Creative Expression', '#EF4444'),
('Problem Solving', '#6366F1'),
('Emotional Intelligence', '#EC4899'),
('STEM Learning', '#059669');
