
import { useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface QuizCompletionModalProps {
  open: boolean;
  onClose: () => void;
  childName: string;
}

const QuizCompletionModal = ({
  open,
  onClose,
  childName
}: QuizCompletionModalProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleViewPlans = () => {
    onClose();
    navigate("/membership");
  };

  const handleExplorePlatform = () => {
    onClose();
    navigate("/shop");
  };

  // Ensures focus trap disables scroll on mobile when open
  useEffect(() => {
    if (!open) return;
    if (isMobile) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open, isMobile]);

  const modalContent = (
    <div className="w-full">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <DialogTitle className="text-2xl text-forest text-center">Welcome to Mydeck</DialogTitle>
      <DialogDescription className="text-base text-center mb-6">
        Your answers will help us better understand {childName} and to curate personalised toys unique to their individuality. Because no two kids are the same. So why should their toys be?
      </DialogDescription>
      <div className="flex flex-col gap-3">
        <Button 
          onClick={handleViewPlans}
          className="bg-warm-sage hover:bg-forest w-full"
          size="lg"
        >
          View Plans
        </Button>
        <Button 
          onClick={handleExplorePlatform}
          variant="outline"
          className="w-full"
          size="lg"
        >
          Explore Platform
        </Button>
      </div>
    </div>
  );

  // Mobile: Sheet (Bottom)
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="bottom" className="rounded-t-2xl py-8 px-4 max-w-lg mx-auto">
          {modalContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Centered Dialog
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md px-8 py-8">
        <DialogHeader />
        {modalContent}
      </DialogContent>
    </Dialog>
  );
};

export default QuizCompletionModal;
