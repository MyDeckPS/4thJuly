
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Heart } from "lucide-react";
import { User as AuthUser } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ImageCarousel from "./ImageCarousel";
import BoringAvatar from "../common/BoringAvatar";
import { supabase } from "@/integrations/supabase/client";

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

interface FeaturedNoteCardProps {
  note: Note;
  isLiked: boolean;
  onLike: (noteId: string) => void;
  user: AuthUser | null;
}

const FeaturedNoteCard = ({ note, isLiked, onLike, user }: FeaturedNoteCardProps) => {
  const [currentLikes, setCurrentLikes] = useState(note.likes);
  const [authorProfile, setAuthorProfile] = useState<any>(null);

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      try {
        const { data: quizData } = await supabase
          .from('quiz_responses')
          .select('responses')
          .eq('user_id', note.userId)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();

        if (quizData?.responses) {
          setAuthorProfile(quizData.responses);
        }
      } catch (error) {
        console.error('Error fetching author profile:', error);
      }
    };

    fetchAuthorProfile();
  }, [note.userId]);

  const handleLike = () => {
    if (!user) {
      toast("Please sign in to like posts", {
        description: "Join our community to interact with other parents",
        action: {
          label: "Sign In",
          onClick: () => window.location.href = "/login"
        }
      });
      return;
    }

    onLike(note.id);
    setCurrentLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    const today = new Date();
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  };

  // Helper function to get age display from actual profile data
  const getChildAgeDisplay = () => {
    // Try to get from author's actual profile first
    if (authorProfile?.childBirthday) {
      const age = calculateAge(authorProfile.childBirthday);
      if (age) {
        if (age.years === 0) {
          return "< 1 year";
        } else if (age.months === 0) {
          return `${age.years} year${age.years > 1 ? 's' : ''}`;
        } else {
          return `${age.years} year${age.years > 1 ? 's' : ''} ${age.months} month${age.months > 1 ? 's' : ''}`;
        }
      }
    }

    // Fallback to parsing the existing childAge field
    const match = note.childAge.match(/(\d+)\s+(years?|months?)/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      
      if (unit.startsWith('month')) {
        if (value < 12) {
          return `< 1 year`;
        } else {
          const years = Math.floor(value / 12);
          const remainingMonths = value % 12;
          if (remainingMonths === 0) {
            return `${years} year${years > 1 ? 's' : ''}`;
          } else {
            return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
          }
        }
      } else {
        return `${value} year${value > 1 ? 's' : ''}`;
      }
    }
    return note.childAge;
  };

  const getGenderIcon = (userId: string) => {
    // Try to get from author's actual profile first
    if (authorProfile?.childGender) {
      return authorProfile.childGender === 'boy' ? "👦" : "👧";
    }
    
    // Fallback to userId-based determination
    const isEven = userId.length % 2 === 0;
    return isEven ? "👧" : "👦";
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <Card className="flex-shrink-0 w-80 relative overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="absolute top-3 left-3 z-10">
        <Badge className="bg-gradient-warm text-white border-0">
          <Star className="w-3 h-3 mr-1 fill-current" />
          Featured
        </Badge>
      </div>

      <ImageCarousel images={note.images} />

      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <BoringAvatar name={note.userName} size={32} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-forest truncate">{note.userName}</span>
              {note.membershipType === 'premium' && (
                <Crown className="w-3 h-3 text-warm-sage" />
              )}
            </div>
             <Badge variant="outline" className="text-xs px-2 py-0.5 flex items-center gap-1 mt-1">
              <span>{getGenderIcon(note.userId)}</span>
              <span>{getChildAgeDisplay()}</span>
            </Badge>
          </div>
        </div>

        <p className="text-sm text-gray-700 line-clamp-3 mb-2">
          {note.content}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={!user}
            className={`flex items-center gap-1 p-1 -ml-2 transition-colors ${
              isLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-500 hover:text-red-500'
            } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart 
              className={`w-4 h-4 transition-all ${
                isLiked ? 'fill-current' : ''
              }`} 
            />
            <span>{currentLikes}</span>
          </Button>
          <span>Joined {formatJoinDate(note.dateJoined)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedNoteCard;
