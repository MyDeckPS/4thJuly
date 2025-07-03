
-- Rename diaries table to blogs
ALTER TABLE public.diaries RENAME TO blogs;

-- Rename diary_images table to blog_images
ALTER TABLE public.diary_images RENAME TO blog_images;

-- Update the foreign key reference in blog_images
ALTER TABLE public.blog_images RENAME COLUMN diary_id TO blog_id;

-- Update RLS policies for blogs table
DROP POLICY IF EXISTS "Anyone can view published diaries" ON public.blogs;
DROP POLICY IF EXISTS "Admins can view all diaries" ON public.blogs;
DROP POLICY IF EXISTS "Admins can insert diaries" ON public.blogs;
DROP POLICY IF EXISTS "Admins can update diaries" ON public.blogs;
DROP POLICY IF EXISTS "Admins can delete diaries" ON public.blogs;

CREATE POLICY "Anyone can view published blogs" 
    ON public.blogs 
    FOR SELECT 
    USING (published = true);

CREATE POLICY "Admins can view all blogs" 
    ON public.blogs 
    FOR SELECT 
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert blogs" 
    ON public.blogs 
    FOR INSERT 
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blogs" 
    ON public.blogs 
    FOR UPDATE 
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blogs" 
    ON public.blogs 
    FOR DELETE 
    USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for blog_images table
DROP POLICY IF EXISTS "Anyone can view diary images" ON public.blog_images;
DROP POLICY IF EXISTS "Admins can view all diary images" ON public.blog_images;
DROP POLICY IF EXISTS "Admins can insert diary images" ON public.blog_images;
DROP POLICY IF EXISTS "Admins can update diary images" ON public.blog_images;
DROP POLICY IF EXISTS "Admins can delete diary images" ON public.blog_images;

CREATE POLICY "Anyone can view blog images" 
    ON public.blog_images 
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.blogs 
        WHERE blogs.id = blog_images.blog_id 
        AND blogs.published = true
    ));

CREATE POLICY "Admins can view all blog images" 
    ON public.blog_images 
    FOR SELECT 
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert blog images" 
    ON public.blog_images 
    FOR INSERT 
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog images" 
    ON public.blog_images 
    FOR UPDATE 
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog images" 
    ON public.blog_images 
    FOR DELETE 
    USING (public.has_role(auth.uid(), 'admin'));

-- Update the trigger name
DROP TRIGGER IF EXISTS update_diaries_updated_at ON public.blogs;
CREATE TRIGGER update_blogs_updated_at
    BEFORE UPDATE ON public.blogs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();
