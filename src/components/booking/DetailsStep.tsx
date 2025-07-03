import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookingData } from "../BookingDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useEffect } from "react";

interface DetailsStepProps {
  bookingData: BookingData;
  onDataUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DetailsStep = ({ bookingData, onDataUpdate, onNext, onBack }: DetailsStepProps) => {
  const { user } = useAuth();
  const { profile, quizResponses } = useProfile();

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user && profile) {
      onDataUpdate({
        name: bookingData.name || profile.name || '',
        email: bookingData.email || user.email || '',
        childName: bookingData.childName || quizResponses?.childName || '',
      });
    }
  }, [user, profile, quizResponses]);

  const isFormValid = bookingData.name && bookingData.email && bookingData.childName && bookingData.childAge && bookingData.concerns;

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={bookingData.name || ""}
              onChange={(e) => onDataUpdate({ name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={bookingData.email || ""}
              onChange={(e) => onDataUpdate({ email: e.target.value })}
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={bookingData.phone || ""}
              onChange={(e) => onDataUpdate({ phone: e.target.value })}
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <Label htmlFor="childName">Child's Name *</Label>
            <Input
              id="childName"
              value={bookingData.childName || ""}
              onChange={(e) => onDataUpdate({ childName: e.target.value })}
              placeholder="Enter your child's name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="childAge">Child's Age *</Label>
          <Select value={bookingData.childAge} onValueChange={(value) => onDataUpdate({ childAge: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select age" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-6months">0-6 months</SelectItem>
              <SelectItem value="6-12months">6-12 months</SelectItem>
              <SelectItem value="1-2years">1-2 years</SelectItem>
              <SelectItem value="2-3years">2-3 years</SelectItem>
              <SelectItem value="3-4years">3-4 years</SelectItem>
              <SelectItem value="4-5years">4-5 years</SelectItem>
              <SelectItem value="5+years">5+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="concerns">What would you like to discuss? *</Label>
          <Textarea
            id="concerns"
            value={bookingData.concerns || ""}
            onChange={(e) => onDataUpdate({ concerns: e.target.value })}
            placeholder="Tell us about your child's interests, challenges, or specific questions you have..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="specialNotes">Special Notes (Optional)</Label>
          <Textarea
            id="specialNotes"
            value={bookingData.specialNotes || ""}
            onChange={(e) => onDataUpdate({ specialNotes: e.target.value })}
            placeholder="Any additional information that might be helpful for your consultation..."
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="hover:bg-gray-50">
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!isFormValid}
          className="min-w-[120px] bg-orange-500 hover:bg-orange-600"
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}; 