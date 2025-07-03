
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, Image, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DebugConsole from "./DebugConsole";

interface MediaFile {
  id: string;
  filename: string;
  original_filename: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  alt_text: string | null;
  created_at: string;
}

const AdminMediaSection = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mediaFiles = [], isLoading } = useQuery({
    queryKey: ['media-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      setSelectedFile(null);
      setAltText("");
      toast({
        title: "Success",
        description: "Media file uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to upload file: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (mediaFile: MediaFile) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([mediaFile.filename]);

      if (storageError) {
        console.log(`Storage deletion error: ${storageError.message}`);
      }

      // Delete from database
      const { error } = await supabase
        .from('media_library')
        .delete()
        .eq('id', mediaFile.id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      toast({
        title: "Success",
        description: "Media file deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete file: ${error.message}`,
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

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Media Library Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                accept="image/*,.lottie,.json"
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
                    placeholder="Describe the file content..."
                    className="mt-1"
                  />
                </div>
                
                <Button 
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="w-full"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload File"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Media ({mediaFiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading media files...</div>
          ) : mediaFiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No media files uploaded yet
            </div>
          ) : (
            <div className="space-y-4">
              {mediaFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getFileIcon(file.file_type)}
                    <div>
                      <p className="font-medium">{file.original_filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.file_type} • {formatFileSize(file.file_size)}
                      </p>
                      {file.alt_text && (
                        <p className="text-sm text-muted-foreground">{file.alt_text}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.file_url, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(file)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DebugConsole module="media-library" />
    </div>
  );
};

export default AdminMediaSection;
