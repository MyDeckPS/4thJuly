
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { useCreateDynamicPage, useUpdateDynamicPage, DynamicPage } from "@/hooks/useDynamicPages";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface DynamicPageFormProps {
  page?: DynamicPage | null;
  onClose: () => void;
}

const DynamicPageForm = ({ page, onClose }: DynamicPageFormProps) => {
  const [title, setTitle] = useState(page?.title || '');
  const [body, setBody] = useState(page?.body || '');
  const [slug, setSlug] = useState(page?.slug || '');
  const [published, setPublished] = useState(page?.published || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPage = useCreateDynamicPage();
  const updatePage = useUpdateDynamicPage();

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  useEffect(() => {
    if (!page && title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title, page, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !slug.trim()) return;

    setIsSubmitting(true);
    try {
      if (page) {
        await updatePage.mutateAsync({
          id: page.id,
          title: title.trim(),
          body: body.trim(),
          slug: slug.trim(),
          published
        });
      } else {
        await createPage.mutateAsync({
          title: title.trim(),
          body: body.trim(),
          slug: slug.trim(),
          published
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/20 -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <FileText className="h-6 w-6" />
            {page ? 'Edit Page' : 'Create New Page'}
          </CardTitle>
          <p className="text-pink-100 mt-1">
            {page ? 'Update your page content and settings' : 'Create a new dynamic page for your platform'}
          </p>
        </CardHeader>
      </Card>

      {/* Form */}
      <Card className="border-gray-100 shadow-sm bg-white">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700 font-medium">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Page title..."
                  required
                  className="border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-gray-700 font-medium">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-2 rounded-md">/</span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    placeholder="page-url-slug"
                    required
                    className="border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  URL-friendly version of the title. Will be auto-generated if left empty.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body" className="text-gray-700 font-medium">Content</Label>
              <div className="min-h-[300px] border border-gray-200 rounded-lg overflow-hidden">
                <ReactQuill
                  value={body}
                  onChange={setBody}
                  modules={quillModules}
                  placeholder="Write your page content..."
                  className="h-64"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <div>
                <Label htmlFor="published" className="text-gray-700 font-medium">
                  Published (visible to public)
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Toggle to make this page visible to all users
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : page ? 'Update Page' : 'Create Page'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicPageForm;
