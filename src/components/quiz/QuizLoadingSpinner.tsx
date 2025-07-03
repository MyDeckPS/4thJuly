
import { Card, CardContent } from "@/components/ui/card";

interface QuizLoadingSpinnerProps {
  message?: string;
}

const QuizLoadingSpinner = ({ message = "Loading..." }: QuizLoadingSpinnerProps) => {
  return (
    <Card className="w-full max-w-2xl mx-auto border-0 shadow-lg">
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-warm-sage/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-warm-sage border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizLoadingSpinner;
