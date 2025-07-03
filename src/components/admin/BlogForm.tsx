
import { useState, useEffect } from 'react';
import { useBlogs } from '@/hooks/useBlogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogFormProps {
  blog?: any;
  onClose: () => void;
  onSubmit?: (data: any) => Promise<void>;
}

const BlogForm = ({ blog, onClose, onSubmit }: BlogFormProps) => {
  const { createBlog, updateBlog } = useBlogs();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    hero_image: '',
    category: '',
    read_time: '',
    author: '',
    published: false,
    meta_title: '',
    meta_description: '',
    slug: '',
    publish_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        hero_image: blog.hero_image || '',
        category: blog.category || '',
        read_time: blog.read_time || '',
        author: blog.author || '',
        published: blog.published || false,
        meta_title: blog.meta_title || '',
        meta_description: blog.meta_description || '',
        slug: blog.slug || '',
        publish_date: blog.publish_date || new Date().toISOString().split('T')[0]
      });
    }
  }, [blog]);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      meta_title: prev.meta_title || title
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        if (blog) {
          await updateBlog(blog.id, formData);
        } else {
          await createBlog(formData);
        }
      }
      onClose();
    } catch (error) {
      console.error('Error saving blog:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <CardTitle>
            {blog ? 'Edit Blog' : 'Create New Blog'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Enter blog title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-friendly-slug"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Development, Education"
                  required
                />
              </div>

              <div>
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Author name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="read_time">Read Time *</Label>
                <Input
                  id="read_time"
                  value={formData.read_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, read_time: e.target.value }))}
                  placeholder="e.g., 5 min read"
                  required
                />
              </div>

              <div>
                <Label htmlFor="publish_date">Publish Date</Label>
                <Input
                  id="publish_date"
                  type="date"
                  value={formData.publish_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, publish_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="hero_image">Hero Image URL *</Label>
                <Input
                  id="hero_image"
                  value={formData.hero_image}
                  onChange={(e) => setFormData(prev => ({ ...prev, hero_image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description for the blog card"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="meta_title">SEO Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="SEO optimized title"
                />
              </div>

              <div>
                <Label htmlFor="meta_description">SEO Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO meta description"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                />
                <Label htmlFor="published">Published</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your blog content here... (HTML supported)"
              rows={12}
              required
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can use HTML tags for formatting (e.g., &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, etc.)
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-warm-sage hover:bg-forest"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : (blog ? 'Update Blog' : 'Create Blog')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BlogForm;
