import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { CommunityNote } from "@/hooks/useCommunityNotes";

interface NoteCardProps {
  note: CommunityNote;
  onToggleLike: (noteId: string, isCurrentlyLiked: boolean) => void;
  currentUser: any;
}

const NoteCard = ({ note, onToggleLike, currentUser }: NoteCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#FFF3E6] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[#FB5607] font-semibold">
              {note.profiles.name?.charAt(0) || 'U'}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-forest">{note.profiles.name || 'Anonymous'}</h3>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {format(new Date(note.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            
            <div className="prose prose-sm max-w-none mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
            </div>
            
            {note.images && note.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {note.images.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Note image ${index + 1}`}
                    className="rounded-lg object-cover h-32 w-full"
                  />
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleLike(note.id, note.isLiked)}
                className={`flex items-center gap-2 ${
                  note.isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'
                }`}
                disabled={!currentUser}
              >
                <Heart className={`w-4 h-4 ${note.isLiked ? 'fill-current' : ''}`} />
                <span>{note.likes}</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span>Reply</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;
