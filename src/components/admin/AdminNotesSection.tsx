import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Eye, Check, X, Star, StarOff, RefreshCw, Trash2, User, Calendar, Shield } from "lucide-react";
import BoringAvatar from "../common/BoringAvatar";
import ImageCarousel from "../community/ImageCarousel";

interface CommunityNote {
  id: string;
  user_id: string;
  content: string;
  images: string[] | null;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
  profiles?: {
    name: string;
    created_at: string;
    membership_type: string;
  } | null;
}

const AdminNotesSection = () => {
  const [selectedNote, setSelectedNote] = useState<CommunityNote | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-notes'],
    queryFn: async () => {
      console.log('🔍 [AdminNotes] Starting admin notes fetch...');
      
      try {
        // Admin users should have full access to all notes with profiles
        const { data, error } = await supabase
          .from('community_notes')
          .select(`
            id,
            user_id,
            content,
            images,
            status,
            featured,
            created_at,
            updated_at,
            rejection_reason,
            profiles(
              name,
              created_at,
              membership_type
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ [AdminNotes] Primary query failed:', error);
          
          // Fallback: fetch notes without profiles and get profiles separately
          console.log('🔄 [AdminNotes] Trying fallback approach...');
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('community_notes')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (fallbackError) {
            console.error('❌ [AdminNotes] Fallback failed:', fallbackError);
            throw new Error(`Query failed: ${fallbackError.message}`);
          }
          
          // Fetch profiles separately for each note
          const enrichedNotes = await Promise.all(
            (fallbackData || []).map(async (note) => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('name, created_at, membership_type')
                .eq('id', note.user_id)
                .single();
              
              return {
                ...note,
                profiles: profileData
              };
            })
          );
          
          console.log(`✅ [AdminNotes] Fallback successful with ${enrichedNotes.length} notes`);
          return enrichedNotes;
        }

        console.log(`✅ [AdminNotes] Successfully fetched ${data?.length || 0} notes with profiles`);
        
        // Fix the profiles type by ensuring it's properly typed
        const typedNotes: CommunityNote[] = (data || []).map(note => ({
          ...note,
          profiles: Array.isArray(note.profiles) 
            ? (note.profiles[0] || null) 
            : note.profiles
        }));

        console.log('📊 [AdminNotes] Notes summary:', {
          total: typedNotes.length,
          pending: typedNotes.filter(n => n.status === 'pending').length,
          approved: typedNotes.filter(n => n.status === 'approved').length,
          rejected: typedNotes.filter(n => n.status === 'rejected').length,
          featured: typedNotes.filter(n => n.featured).length,
          withProfiles: typedNotes.filter(n => n.profiles).length
        });

        return typedNotes;
      } catch (error) {
        console.error('💥 [AdminNotes] Comprehensive error details:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error type'
        });
        throw error;
      }
    },
    retry: 1,
    retryDelay: 2000,
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, updates }: { noteId: string; updates: any }) => {
      console.log(`🔄 [AdminNotes] Updating note ${noteId} with:`, updates);
      
      const { error } = await supabase
        .from('community_notes')
        .update(updates)
        .eq('id', noteId);

      if (error) {
        console.error('❌ [AdminNotes] Update failed:', error);
        throw error;
      }
      
      console.log(`✅ [AdminNotes] Note ${noteId} updated successfully`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notes'] });
      queryClient.invalidateQueries({ queryKey: ['community-notes'] });
      toast.success('Note updated successfully');
      setSelectedNote(null);
      setRejectionReason("");
      console.log('🔄 [AdminNotes] Note update completed, cache invalidated');
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('💥 [AdminNotes] Mutation error:', errorMsg);
      toast.error('Failed to update note');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      console.log(`🗑️ [AdminNotes] Deleting note ${noteId}`);
      
      const { error } = await supabase
        .from('community_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error('❌ [AdminNotes] Delete failed:', error);
        throw error;
      }
      
      console.log(`✅ [AdminNotes] Note ${noteId} deleted successfully`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notes'] });
      queryClient.invalidateQueries({ queryKey: ['community-notes'] });
      toast.success('Note deleted successfully');
      setSelectedNote(null);
      console.log('🔄 [AdminNotes] Note deletion completed, cache invalidated');
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('💥 [AdminNotes] Delete error:', errorMsg);
      toast.error('Failed to delete note');
    },
  });

  const handleApprove = (noteId: string) => {
    console.log(`✅ [AdminNotes] Approving note: ${noteId}`);
    updateNoteMutation.mutate({ 
      noteId, 
      updates: { status: 'approved', rejection_reason: null }
    });
  };

  const handleReject = (noteId: string) => {
    if (!rejectionReason.trim()) {
      console.log('⚠️ [AdminNotes] Rejection attempted without reason');
      toast.error('Please provide a rejection reason');
      return;
    }
    
    console.log(`❌ [AdminNotes] Rejecting note: ${noteId} with reason: ${rejectionReason}`);
    updateNoteMutation.mutate({ 
      noteId, 
      updates: { status: 'rejected', rejection_reason: rejectionReason }
    });
  };

  const handleDelete = (noteId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this note? This action cannot be undone.')) {
      deleteNoteMutation.mutate(noteId);
    }
  };

  const handleToggleFeatured = (noteId: string, currentFeatured: boolean) => {
    console.log(`⭐ [AdminNotes] Toggling featured status for note: ${noteId} from ${currentFeatured} to ${!currentFeatured}`);
    updateNoteMutation.mutate({ 
      noteId, 
      updates: { featured: !currentFeatured }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMembershipBadge = (membershipType: string) => {
    return (
      <Badge 
        variant="outline" 
        className={`text-xs ${
          membershipType === 'premium' 
            ? 'text-purple-600 border-purple-600 bg-purple-50' 
            : 'text-gray-600 border-gray-600 bg-gray-50'
        }`}
      >
        <Shield className="w-3 h-3 mr-1" />
        {membershipType === 'premium' ? 'Premium' : 'Standard'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    console.error('💥 [AdminNotes] Component error state:', error);
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-red-600">Community Notes Moderation - Error</CardTitle>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to load community notes</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm font-semibold text-red-800 mb-2">Error Details:</p>
              <p className="text-sm text-red-700 font-mono">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
              {error instanceof Error && error.stack && (
                <details className="mt-2">
                  <summary className="text-sm font-semibold text-red-800 cursor-pointer">Stack Trace</summary>
                  <pre className="text-xs text-red-600 mt-1 overflow-auto max-h-32 bg-red-100 p-2 rounded">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Check the browser console for more detailed error information.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Community Notes Moderation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-4" />
            <p>Loading notes...</p>
            <p className="text-sm text-muted-foreground mt-2">
              This may take a moment while we fetch the data...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingNotes = notes.filter(note => note.status === 'pending');
  const approvedNotes = notes.filter(note => note.status === 'approved');
  const rejectedNotes = notes.filter(note => note.status === 'rejected');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Community Notes Moderation</CardTitle>
          <div className="flex gap-4 mt-2">
            <Badge variant="outline" className="text-yellow-600">
              {pendingNotes.length} Pending
            </Badge>
            <Badge variant="outline" className="text-green-600">
              {approvedNotes.length} Approved
            </Badge>
            <Badge variant="outline" className="text-red-600">
              {rejectedNotes.length} Rejected
            </Badge>
          </div>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No community notes found</p>
            <p className="text-sm mt-2">Notes will appear here once users start submitting them.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Content Preview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          <BoringAvatar 
                            name={note.profiles?.name || 'Anonymous'} 
                            size={32} 
                            variant="beam" 
                          />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {note.profiles?.name || 'Anonymous'}
                        </div>
                        {getMembershipBadge(note.profiles?.membership_type || 'standard')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">
                      {note.content.substring(0, 100)}
                      {note.content.length > 100 && '...'}
                    </div>
                    {note.images && note.images.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        📸 {note.images.length} image(s)
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(note.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFeatured(note.id, note.featured)}
                      disabled={note.status !== 'approved'}
                    >
                      {note.featured ? (
                        <Star className="w-4 h-4 fill-current text-yellow-500" />
                      ) : (
                        <StarOff className="w-4 h-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(note.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedNote(note)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                              <User className="w-5 h-5" />
                              Review Note
                            </DialogTitle>
                          </DialogHeader>
                          {selectedNote && (
                            <div className="space-y-6">
                              {/* Author Section */}
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-4 mb-3">
                                  <Avatar className="w-12 h-12">
                                    <AvatarFallback>
                                      <BoringAvatar 
                                        name={selectedNote.profiles?.name || 'Anonymous'} 
                                        size={48} 
                                        variant="beam" 
                                      />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-semibold text-lg">
                                      {selectedNote.profiles?.name || 'Anonymous'}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      {getMembershipBadge(selectedNote.profiles?.membership_type || 'standard')}
                                      <Badge variant="outline" className="text-xs">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        Joined {selectedNote.profiles?.created_at ? 
                                          new Date(selectedNote.profiles.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
                                          : 'Unknown'
                                        }
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium text-gray-600">Posted:</span>
                                    <p>{formatDate(selectedNote.created_at)}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-600">Status:</span>
                                    <div className="mt-1">{getStatusBadge(selectedNote.status)}</div>
                                  </div>
                                  {selectedNote.updated_at !== selectedNote.created_at && (
                                    <div>
                                      <span className="font-medium text-gray-600">Last Updated:</span>
                                      <p>{formatDate(selectedNote.updated_at)}</p>
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-medium text-gray-600">Featured:</span>
                                    <div className="mt-1">
                                      <Badge variant={selectedNote.featured ? "default" : "outline"}>
                                        {selectedNote.featured ? "Yes" : "No"}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Content Section */}
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  Content
                                </h4>
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                  <p className="whitespace-pre-wrap leading-relaxed">{selectedNote.content}</p>
                                </div>
                              </div>
                              
                              {/* Images Section */}
                              {selectedNote.images && selectedNote.images.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Images ({selectedNote.images.length})
                                  </h4>
                                  <div className="grid grid-cols-4 gap-3">
                                    {selectedNote.images.map((imageUrl, index) => (
                                      <div 
                                        key={index} 
                                        className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                        onClick={() => setLightboxImage(imageUrl)}
                                      >
                                        <img 
                                          src={imageUrl} 
                                          alt={`Note image ${index + 1}`}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Rejection Reason */}
                              {selectedNote.status === 'rejected' && selectedNote.rejection_reason && (
                                <div>
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    Rejection Reason
                                  </h4>
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800">{selectedNote.rejection_reason}</p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Actions Section */}
                              <div className="border-t pt-6 bg-gray-50 -mx-6 -mb-6 px-6 pb-6">
                                <h4 className="font-semibold mb-4">Admin Actions</h4>
                                
                                {selectedNote.status === 'pending' && (
                                  <div className="space-y-4">
                                    <div className="flex gap-3">
                                      <Button
                                        onClick={() => handleApprove(selectedNote.id)}
                                        className="bg-green-600 hover:bg-green-700 flex-1"
                                        size="lg"
                                      >
                                        <Check className="w-4 h-4 mr-2" />
                                        Approve & Publish
                                      </Button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      <Textarea
                                        placeholder="Enter rejection reason (required to reject)"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={3}
                                        className="resize-none"
                                      />
                                      <div className="flex gap-3">
                                        <Button
                                          onClick={() => handleReject(selectedNote.id)}
                                          variant="destructive"
                                          className="flex-1"
                                          size="lg"
                                          disabled={!rejectionReason.trim()}
                                        >
                                          <X className="w-4 h-4 mr-2" />
                                          Reject
                                        </Button>
                                        <Button
                                          onClick={() => handleDelete(selectedNote.id)}
                                          variant="outline"
                                          className="border-red-300 text-red-600 hover:bg-red-50"
                                          size="lg"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {selectedNote.status === 'approved' && (
                                  <div className="flex gap-3">
                                    <Button
                                      onClick={() => handleToggleFeatured(selectedNote.id, selectedNote.featured)}
                                      variant="outline"
                                      size="lg"
                                      className="flex-1"
                                    >
                                      {selectedNote.featured ? (
                                        <>
                                          <StarOff className="w-4 h-4 mr-2" />
                                          Remove Featured
                                        </>
                                      ) : (
                                        <>
                                          <Star className="w-4 h-4 mr-2" />
                                          Make Featured
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      onClick={() => handleDelete(selectedNote.id)}
                                      variant="outline"
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                      size="lg"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </Button>
                                  </div>
                                )}
                                
                                {selectedNote.status === 'rejected' && (
                                  <div className="flex gap-3">
                                    <Button
                                      onClick={() => handleApprove(selectedNote.id)}
                                      className="bg-green-600 hover:bg-green-700 flex-1"
                                      size="lg"
                                    >
                                      <Check className="w-4 h-4 mr-2" />
                                      Approve & Publish
                                    </Button>
                                    <Button
                                      onClick={() => handleDelete(selectedNote.id)}
                                      variant="outline"
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                      size="lg"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(note.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminNotesSection;
