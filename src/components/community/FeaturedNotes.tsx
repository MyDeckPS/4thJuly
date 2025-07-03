import { User as AuthUser } from "@supabase/supabase-js";
import FeaturedNoteCard from "./FeaturedNoteCard";

interface Note {
  id: string;
  userId: string;
  userName: string;
  childAge: string;
  membershipType: string;
  dateJoined: string;
  content: string;
  images: string[];
  likes: number;
  createdAt: string;
  featured: boolean;
}

interface FeaturedNotesProps {
  notes: Note[];
  likedNotes: Set<string>;
  onLike: (noteId: string) => void;
  user: AuthUser | null;
}

const FeaturedNotes = ({ notes, likedNotes, onLike, user }: FeaturedNotesProps) => {
  if (notes.length === 0) return null;

  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {notes.map((note) => (
          <FeaturedNoteCard
            key={note.id}
            note={note}
            isLiked={likedNotes.has(note.id)}
            onLike={onLike}
            user={user}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedNotes;
