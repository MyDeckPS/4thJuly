
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface MembershipStatusProps {
  childName?: string;
}

const MembershipStatus = ({ childName }: MembershipStatusProps) => {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-forest text-lg">Standard User</h3>
            <p className="text-sm text-muted-foreground">
              {childName ? `${childName}'s parent` : 'Welcome to PlayPath!'}
            </p>
          </div>
        </div>
        
        <div className="bg-white/50 rounded-lg p-4">
          <h4 className="font-medium text-forest mb-2">Your Access</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• PlayPath sessions available at affordable rates</li>
            <li>• Welcome offer for first-time bookings</li>
            <li>• Personalized AI recommendations</li>
            <li>• Community features and support</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MembershipStatus;
