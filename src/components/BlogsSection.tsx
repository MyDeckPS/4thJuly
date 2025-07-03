import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import BlogCard from "@/components/blog/BlogCard";
import { supabase } from '@/integrations/supabase/client';

interface Blog {
  id: string;
  title: string;
  hero_image: string;
  read_time: string;
  category: string;
  excerpt: string | null;
  slug: string;
}

const BlogsSection = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('id, title, hero_image, read_time, category, excerpt, slug')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setFeaturedBlogs(data || []);
      } catch (error) {
        console.error('Error fetching featured blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBlogs();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="text-lg text-muted-foreground">Loading blogs...</div>
          </div>
        </div>
      </section>
    );
  }

  if (featuredBlogs.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-[#FB5607]" />
            <h2 className="text-4xl font-bold text-black">MyDeck Blogs</h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expert insights and practical tips for your child's development journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {featuredBlogs.map((blog) => (
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

        <div className="text-center">
          <Link to="/blogs">
            <Button size="lg" className="bg-[#FB5607] hover:bg-[#e65100] text-white">
              Explore All Blogs
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogsSection;
