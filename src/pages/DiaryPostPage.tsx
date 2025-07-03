
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DiaryCard from "@/components/diary/DiaryCard";
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

const DiaryPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [diary, setDiary] = useState<Blog | null>(null);
  const [relatedDiaries, setRelatedDiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiary = async () => {
      if (!slug) return;

      try {
        // Fetch the main diary
        const { data: diaryData, error: diaryError } = await supabase
          .from('blogs')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single();

        if (diaryError) throw diaryError;
        setDiary(diaryData);

        // Update page title and meta description for SEO
        if (diaryData.meta_title) {
          document.title = diaryData.meta_title;
        } else {
          document.title = `${diaryData.title} | MyDeck Diaries`;
        }

        if (diaryData.meta_description) {
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute('content', diaryData.meta_description);
          }
        }

        // Fetch related diaries
        const { data: relatedData, error: relatedError } = await supabase
          .from('blogs')
          .select('id, title, hero_image, read_time, category, excerpt, slug')
          .eq('published', true)
          .neq('slug', slug)
          .eq('category', diaryData.category)
          .limit(3);

        if (relatedError) throw relatedError;
        setRelatedDiaries(relatedData || []);

      } catch (error) {
        console.error('Error fetching diary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiary();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-20 pb-20">
          <div className="container mx-auto px-6">
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">Loading diary...</div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!diary) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-20 pb-20">
          <div className="container mx-auto px-6">
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">Diary not found.</div>
              <Link to="/diaries">
                <Button className="mt-4 bg-warm-sage hover:bg-forest">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Diaries
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
          <Link to="/diaries">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Diaries
            </Button>
          </Link>

          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Badge className="mb-4 bg-warm-sage/10 text-warm-sage">
                {diary.category}
              </Badge>
              <h1 className="text-4xl font-bold text-forest mb-4">{diary.title}</h1>
              
              <div className="flex items-center gap-6 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{diary.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{diary.read_time}</span>
                </div>
                {diary.publish_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(diary.publish_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="aspect-video overflow-hidden rounded-lg mb-8">
              <img 
                src={diary.hero_image} 
                alt={diary.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div 
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: diary.content }}
            />
          </div>
        </article>

        {relatedDiaries.length > 0 && (
          <section className="container mx-auto px-6 mt-16">
            <h2 className="text-2xl font-bold text-forest mb-8 text-center">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {relatedDiaries.map((relatedDiary) => (
                <DiaryCard
                  key={relatedDiary.id}
                  id={relatedDiary.slug}
                  title={relatedDiary.title}
                  heroImage={relatedDiary.hero_image}
                  readTime={relatedDiary.read_time}
                  category={relatedDiary.category}
                  excerpt={relatedDiary.excerpt}
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

export default DiaryPostPage;
