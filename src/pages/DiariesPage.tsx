import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, ImagePlus, X } from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunityNotes, useCreateCommunityNote, useToggleNoteLike } from "@/hooks/useCommunityNotes";
import { toast } from "sonner";
import NoteCard from "@/components/community/NoteCard";
import { supabase } from "@/integrations/supabase/client";

const DiariesPage = () => {
  const { user } = useAuth();
  const { notes, isLoading } = useCommunityNotes('approved');
  const createNote = useCreateCommunityNote();
  const toggleLike = useToggleNoteLike();
  
  const [newNote, setNewNote] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    if (selectedFiles.length + newFiles.length > 3) {
      toast("Maximum 3 images allowed");
      return;
    }
    setSelectedFiles(prev => [...prev, ...newFiles]);
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

  const handleSubmitNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please write something before submitting!');
      return;
    }
    if (!user) {
      toast.error('Please log in to post a note');
      return;
    }
    setUploading(true);
    let imageUrls: string[] = [];
    try {
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const { data, error } = await supabase.storage.from('note_images').upload(fileName, file);
          if (error) throw error;
          const { data: { publicUrl } } = supabase.storage.from('note_images').getPublicUrl(fileName);
          imageUrls.push(publicUrl);
        }
      }
      await createNote.mutateAsync({ content: newNote.trim(), images: imageUrls });
      setNewNote('');
      setShowForm(false);
      setSelectedFiles([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to submit note');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleLike = async (noteId: string, isCurrentlyLiked: boolean) => {
    if (!user) {
      toast.error('Please log in to like notes');
      return;
    }

    try {
      await toggleLike.mutateAsync({ noteId, isCurrentlyLiked });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center py-8">Loading community notes...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="w-8 h-8 text-warm-sage" />
              <h1 className="text-4xl font-bold text-black">Community Diaries</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Share your parenting journey, milestones, and precious moments with our community
            </p>
          </div>

          {/* Add Note Section */}
          {user && (
            <Card className="mb-8 border-[#FFF3E6]">
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#FB5607] bg-[#FFF3E6] rounded-full p-1" />
                  Share Your Story
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showForm ? (
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="w-full bg-[#FB5607] hover:bg-[#e04e06] text-white font-semibold rounded-full"
                  >
                    Write a New Diary Entry
                  </Button>
                ) : (
                  <>
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Share a milestone, a funny moment, a challenge, or anything about your parenting journey..."
                      rows={4}
                      className="resize-none"
                    />
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        ref={fileInputRef}
                        disabled={selectedFiles.length >= 3}
                      />
                      {selectedFiles.length < 3 && (
                        <label
                          htmlFor="image-upload"
                          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#FB5607] rounded-lg cursor-pointer hover:border-[#e04e06] transition-colors"
                        >
                          <ImagePlus className="w-5 h-5 text-[#FB5607]" />
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
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowForm(false);
                          setNewNote('');
                        }}
                        className="border-[#FB5607] text-[#FB5607] hover:bg-[#FFF3E6]"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmitNote}
                        disabled={createNote.isPending || !newNote.trim() || uploading}
                        className="bg-[#FB5607] hover:bg-[#e04e06] text-white font-semibold rounded-full"
                      >
                        {uploading ? 'Uploading...' : createNote.isPending ? 'Sharing...' : 'Share Story'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your story will be reviewed before appearing in the community
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Community Notes */}
          <div className="space-y-6">
            {notes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-[#FB5607] bg-[#FFF3E6] rounded-full mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No stories yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to share your parenting journey with the community!
                  </p>
                </CardContent>
              </Card>
            ) : (
              notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onToggleLike={handleToggleLike}
                  currentUser={user}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DiariesPage;
