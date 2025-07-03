
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface NoteSubmissionSuccessProps {
  isOpen: boolean;
  onClose: () => void;
}

const NoteSubmissionSuccess = ({ isOpen, onClose }: NoteSubmissionSuccessProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-forest">Hurray!</h2>
            <p className="text-gray-600 leading-relaxed">
              Your note is sent to our team for approval and will be posted soon.
            </p>
          </div>
          
          <Button 
            onClick={onClose}
            className="w-full bg-warm-sage hover:bg-forest text-white py-3 text-lg"
          >
            Got it
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteSubmissionSuccess;
