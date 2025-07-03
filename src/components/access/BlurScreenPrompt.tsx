
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

interface BlurScreenPromptProps {
  message?: string;
}

const BlurScreenPrompt = ({ 
  message = "Please log in to access this content" 
}: BlurScreenPromptProps) => {
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-warm-sage shadow-lg">
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-warm-sage/10 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-warm-sage" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-forest">Login Required</h3>
            <p className="text-muted-foreground">{message}</p>
          </div>

          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Link>
            </Button>
            <Button asChild className="flex-1 bg-warm-sage hover:bg-forest">
              <Link to="/register">
                Sign Up
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlurScreenPrompt;
