
import { useEffect, useState } from 'react';
import BlogCard from "@/components/blog/BlogCard";
import { supabase } from '@/integrations/supabase/client';
import { BookOpen } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface Blog {
  id: string;
  title: string;
  hero_image: string;
  read_time: string;
  category: string;
  excerpt: string | null;
  slug: string;
}

const BlogsPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('id, title, hero_image, read_time, category, excerpt, slug')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBlogs(data || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24 pb-8">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 py-[24px]">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="w-8 h-8 text-warm-sage" />
              <h1 className="text-4xl font-bold text-forest">Blogs</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Expert insights and practical tips for your child's development journey
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">Loading blogs...</div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">No blogs available at the moment.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map(blog => (
                <BlogCard 
                  key={blog.id}
                  id={blog.slug}
                  title={blog.title}
                  heroImage={blog.hero_image}
                  readTime={blog.read_time}
                  category={blog.category}
                  excerpt={blog.excerpt}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BlogsPage;
