
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BlogCard from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, User, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Blog {
  id: string;
  title: string;
  content: string;
  hero_image: string;
  read_time: string;
  category: string;
  author: string;
  publish_date: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) return;

      try {
        // Fetch the main blog
        const { data: blogData, error: blogError } = await supabase
          .from('blogs')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single();

        if (blogError) throw blogError;
        setBlog(blogData);

        // Update page title and meta description for SEO
        if (blogData.meta_title) {
          document.title = blogData.meta_title;
        } else {
          document.title = `${blogData.title} | MyDeck Blogs`;
        }

        if (blogData.meta_description) {
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute('content', blogData.meta_description);
          }
        }

        // Fetch related blogs
        const { data: relatedData, error: relatedError } = await supabase
          .from('blogs')
          .select('id, title, hero_image, read_time, category, excerpt, slug')
          .eq('published', true)
          .neq('slug', slug)
          .eq('category', blogData.category)
          .limit(3);

        if (relatedError) throw relatedError;
        setRelatedBlogs(relatedData || []);

      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-20 pb-20">
          <div className="container mx-auto px-6">
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">Loading blog...</div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-20 pb-20">
          <div className="container mx-auto px-6">
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">Blog not found.</div>
              <Link to="/blogs">
                <Button className="mt-4 bg-warm-sage hover:bg-forest">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blogs
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-20 pb-20">
        <article className="container mx-auto px-6">
          <Link to="/blogs">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blogs
            </Button>
          </Link>

          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Badge className="mb-4 bg-warm-sage/10 text-warm-sage">
                {blog.category}
              </Badge>
              <h1 className="text-4xl font-bold text-forest mb-4">{blog.title}</h1>
              
              <div className="flex items-center gap-6 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{blog.read_time}</span>
                </div>
                {blog.publish_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(blog.publish_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="aspect-video overflow-hidden rounded-lg mb-8">
              <img 
                src={blog.hero_image} 
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div 
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </article>

        {relatedBlogs.length > 0 && (
          <section className="container mx-auto px-6 mt-16">
            <h2 className="text-2xl font-bold text-forest mb-8 text-center">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {relatedBlogs.map((relatedBlog) => (
                <BlogCard
                  key={relatedBlog.id}
                  id={relatedBlog.slug}
                  title={relatedBlog.title}
                  heroImage={relatedBlog.hero_image}
                  readTime={relatedBlog.read_time}
                  category={relatedBlog.category}
                  excerpt={relatedBlog.excerpt}
                />
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BlogPostPage;
