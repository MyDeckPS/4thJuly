import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface CalendarStepProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  onNext: () => void;
}

export const CalendarStep = ({ selectedDate, onDateSelect, onNext }: CalendarStepProps) => {
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(date);
    }
  };

  const isNextDisabled = !selectedDate;

  return (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <p className="text-muted-foreground mb-6">
          Choose your preferred date for the consultation
        </p>
      </div>

      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
          className="rounded-md border pointer-events-auto"
        />
      </div>

      {selectedDate && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Selected date: <span className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={onNext} 
          disabled={isNextDisabled}
          className="min-w-[120px] bg-orange-500 hover:bg-orange-600"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}; 