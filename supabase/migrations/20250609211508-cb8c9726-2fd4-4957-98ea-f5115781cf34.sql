
-- Create an enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create diaries table for blog posts
CREATE TABLE public.diaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    hero_image TEXT NOT NULL,
    category TEXT NOT NULL,
    read_time TEXT NOT NULL,
    author TEXT NOT NULL,
    publish_date DATE DEFAULT CURRENT_DATE,
    published BOOLEAN DEFAULT false,
    meta_title TEXT,
    meta_description TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create images table for carousel images
CREATE TABLE public.diary_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diary_id UUID REFERENCES public.diaries(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_images ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
    ON public.user_roles 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
    ON public.user_roles 
    FOR SELECT 
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" 
    ON public.user_roles 
    FOR INSERT 
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" 
    ON public.user_roles 
    FOR UPDATE 
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for diaries
CREATE POLICY "Anyone can view published diaries" 
    ON public.diaries 
    FOR SELECT 
    USING (published = true);

CREATE POLICY "Admins can view all diaries" 
    ON public.diaries 
    FOR SELECT 
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert diaries" 
    ON public.diaries 
    FOR INSERT 
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update diaries" 
    ON public.diaries 
    FOR UPDATE 
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete diaries" 
    ON public.diaries 
    FOR DELETE 
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for diary_images
CREATE POLICY "Anyone can view diary images" 
    ON public.diary_images 
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.diaries 
        WHERE diaries.id = diary_images.diary_id 
        AND diaries.published = true
    ));

CREATE POLICY "Admins can view all diary images" 
    ON public.diary_images 
    FOR SELECT 
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert diary images" 
    ON public.diary_images 
    FOR INSERT 
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update diary images" 
    ON public.diary_images 
    FOR UPDATE 
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete diary images" 
    ON public.diary_images 
    FOR DELETE 
    USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_diaries_updated_at
    BEFORE UPDATE ON public.diaries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Insert some sample data
INSERT INTO public.diaries (title, content, excerpt, hero_image, category, read_time, author, slug, published, meta_title, meta_description) VALUES
('Understanding Your Child''s Developmental Milestones', 
'<p>Understanding your child''s developmental milestones is crucial for supporting their growth and identifying when they might need additional support. Every child develops at their own pace, but there are general timeframes that can help guide expectations.</p><h2>Physical Development</h2><p>Physical milestones include gross motor skills like sitting, crawling, and walking, as well as fine motor skills like grasping objects and using utensils. Most children begin sitting independently around 6 months and take their first steps between 9-15 months.</p><h2>Cognitive Development</h2><p>Cognitive milestones involve thinking, learning, and problem-solving skills. This includes language development, memory, and the ability to understand cause and effect relationships.</p>', 
'Learn about the key developmental milestones in your child''s early years and how to support their growth.',
'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=600&fit=crop',
'Development', 
'5 min read', 
'Dr. Sarah Johnson',
'understanding-child-developmental-milestones',
true,
'Child Development Milestones Guide | MyDeck',
'Complete guide to understanding your child''s developmental milestones. Learn about physical, cognitive, and social development stages.');
