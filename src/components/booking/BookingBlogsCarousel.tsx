import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
interface Blog {
  id: string;
  title: string;
  hero_image: string;
  read_time: string;
  category: string;
  excerpt: string | null;
  slug: string;
}
const BookingBlogsCarousel = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('blogs').select('id, title, hero_image, read_time, category, excerpt, slug').eq('published', true).order('created_at', {
          ascending: false
        }).limit(6);
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
  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % Math.max(1, blogs.length - 2));
  };
  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + Math.max(1, blogs.length - 2)) % Math.max(1, blogs.length - 2));
  };
  if (loading) {
    return <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-warm-sage border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading blogs...</p>
      </div>;
  }
  if (blogs.length === 0) {
    return null;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          
          <h3 className="text-xl sm:text-2xl font-bold text-forest">Helpful Resources</h3>
        </div>
        <Link to="/blogs">
          
        </Link>
      </div>

      <div className="relative">
        <div className="overflow-hidden">
          <div className="flex transition-transform duration-300 ease-in-out gap-4" style={{
          transform: `translateX(-${currentIndex * (100 / 3)}%)`
        }}>
            {blogs.map(blog => <div key={blog.id} className="flex-shrink-0 w-full sm:w-1/3">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="aspect-video overflow-hidden">
                    <img src={blog.hero_image} alt={blog.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-warm-sage/10 text-warm-sage text-xs">
                        {blog.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{blog.read_time}</span>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-forest mb-2 line-clamp-2">
                      {blog.title}
                    </h4>
                    
                    {blog.excerpt && <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                        {blog.excerpt}
                      </p>}
                    
                    <Link to={`/blogs/${blog.slug}`}>
                      <Button size="sm" className="w-full bg-warm-sage hover:bg-forest text-white">
                        Read Article
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>)}
          </div>
        </div>

        {blogs.length > 3 && <>
            <Button variant="outline" size="icon" className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white" onClick={prevSlide}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white" onClick={nextSlide}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>}
      </div>
    </div>;
};
export default BookingBlogsCarousel;