import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateCommunityNote } from "@/hooks/useCommunityNotes";
import NoteSubmissionSuccess from "@/components/community/NoteSubmissionSuccess";

const PostNotePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createNote = useCreateCommunityNote();
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    
    if (selectedFiles.length + newFiles.length > 3) {
      toast("Maximum 3 images allowed");
      return;
    }

    // Update selected files
    setSelectedFiles(prev => [...prev, ...newFiles]);

    // Create previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreviews(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast("Please write something to share");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createNote.mutateAsync({ content, images: [] }); // Simplified for now
      
      // Reset form
      setContent("");
      setSelectedFiles([]);
      setImagePreviews([]);
      
      // Show success overlay instead of navigating immediately
      setShowSuccessOverlay(true);
    } catch (error) {
      console.error('Error submitting note:', error);
      toast.error('Failed to submit note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessOverlay(false);
    // Navigate back to diaries page after closing overlay
    navigate("/diaries");
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50" style={{ marginTop: '80px' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-forest mb-2">Share Your Story</h1>
              <p className="text-muted-foreground">Share a special moment with our community</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Create a Note</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="content">What's on your mind?</Label>
                    <Textarea
                      id="content"
                      placeholder="Share your parenting moment, milestone, or experience..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-32 mt-2"
                      maxLength={1000}
                    />
                    <div className="text-sm text-muted-foreground mt-1 text-right">
                      {content.length}/1000
                    </div>
                  </div>

                  <div>
                    <Label>Images (Optional - Max 3)</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={selectedFiles.length >= 3}
                      />
                      
                      {selectedFiles.length < 3 && (
                        <label
                          htmlFor="image-upload"
                          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-warm-sage transition-colors"
                        >
                          <ImagePlus className="w-5 h-5" />
                          Add Images
                        </label>
                      )}
                      
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                              <img
                                src={preview}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 w-6 h-6"
                                onClick={() => removeImage(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-warm-sage hover:bg-forest"
                    >
                      {isSubmitting ? "Sharing..." : "Share Note"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/diaries")}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <NoteSubmissionSuccess 
        isOpen={showSuccessOverlay} 
        onClose={handleSuccessClose} 
      />
      
      <Footer />
    </>
  );
};

export default PostNotePage;
