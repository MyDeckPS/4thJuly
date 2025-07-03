
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MembershipUpgradeSuccessProps {
  isVisible: boolean;
  onClose: () => void;
}

const MembershipUpgradeSuccess = ({ isVisible, onClose }: MembershipUpgradeSuccessProps) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleGoToPlaypath = () => {
    onClose();
    navigate('/booking');
  };

  if (!isVisible) return null;

  const content = (
    <Card className="border-warm-sage bg-gradient-to-r from-warm-sage/5 to-warm-peach/5">
      <CardContent className="p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-warm-sage rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-forest flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-warm-sage" />
            Premium Activated!
            <Sparkles className="w-5 h-5 text-warm-sage" />
          </h3>
          <p className="text-muted-foreground">
            Welcome to MyDeck Club Premium! Your premium perks are now active.
          </p>
        </div>

        <div className="bg-white/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-green-600" />
            <span>5 Free PlayPath Sessions per month</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-green-600" />
            <span>1 Free Consultation Session per month</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-green-600" />
            <span>Priority booking access</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            onClick={handleGoToPlaypath}
            className="flex-1 bg-warm-sage hover:bg-forest"
          >
            Go to Playpath
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
        <div className="w-full max-w-md animate-slide-in-right">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md animate-scale-in">
        {content}
      </div>
    </div>
  );
};

export default MembershipUpgradeSuccess;
