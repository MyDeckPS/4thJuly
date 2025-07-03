
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, Minus } from "lucide-react";

interface MediaFile {
  id: string;
  filename: string;
  original_filename: string;
  file_url: string;
  file_type: string;
  alt_text: string | null;
}

interface MediaLibrarySelectorProps {
  onSelect: (mediaId: string) => void;
  onClose: () => void;
}

const MediaLibrarySelector = ({ onSelect, onClose }: MediaLibrarySelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mediaFiles = [], isLoading } = useQuery({
    queryKey: ['media-library-selector'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .ilike('file_type', 'image%')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MediaFile[];
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, altText }: { file: File; altText: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      // Save to media library table
      const { data, error } = await supabase
        .from('media_library')
        .insert({
          filename: fileName,
          original_filename: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          alt_text: altText || null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['media-library-selector'] });
      setSelectedFile(null);
      setAltText("");
      setShowUpload(false);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
      // Optionally auto-select the newly uploaded image
      onSelect(data.id);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to upload image: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate({ file: selectedFile, altText });
    }
  };

  const filteredFiles = mediaFiles.filter(file =>
    file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.alt_text && file.alt_text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Image from Media Library</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Upload Section */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload New Image
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUpload(!showUpload)}
              >
                {showUpload ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>
            
            {showUpload && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="file-upload">Select Image</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                </div>
                
                {selectedFile && (
                  <>
                    <div>
                      <Label htmlFor="alt-text">Alt Text (Optional)</Label>
                      <Input
                        id="alt-text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="Describe the image..."
                        className="mt-1"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      className="w-full"
                    >
                      {uploadMutation.isPending ? "Uploading..." : "Upload & Select"}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Search Section */}
          <Input
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {/* Images Grid */}
          {isLoading ? (
            <div className="text-center py-8">Loading images...</div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="border rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onSelect(file.id)}
                >
                  <img
                    src={file.file_url}
                    alt={file.alt_text || file.original_filename}
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                  <p className="text-xs text-center truncate">{file.original_filename}</p>
                </div>
              ))}
            </div>
          )}
          
          {!isLoading && filteredFiles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No images found matching your search." : "No images found. Upload some images above or in the Media section."}
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaLibrarySelector;
