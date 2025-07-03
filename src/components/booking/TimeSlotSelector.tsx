
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { AvailableSlot } from "@/hooks/useAvailableSlots";

interface TimeSlotSelectorProps {
  slots: AvailableSlot[];
  selectedSlot: AvailableSlot | null;
  onSlotSelect: (slot: AvailableSlot) => void;
  selectedDate: Date;
}

const TimeSlotSelector = ({ slots, selectedSlot, onSlotSelect, selectedDate }: TimeSlotSelectorProps) => {
  const formatTime = (timeString: string) => {
    return format(new Date(timeString), 'h:mm a');
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-start gap-2 text-lg">
          <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-base sm:text-lg">Available Times</span>
            <span className="text-xs sm:text-sm font-normal text-muted-foreground leading-tight">
              {format(selectedDate, 'EEEE, MMMM d')}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {slots.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <p className="text-muted-foreground text-base sm:text-lg mb-2">No available time slots</p>
            <p className="text-xs sm:text-sm text-muted-foreground px-2">
              Please try selecting a different date or check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {slots.length} slot{slots.length !== 1 ? 's' : ''} available
              </p>
              <Badge variant="outline" className="text-xs">
                Select a time
              </Badge>
            </div>
            
            {/* Mobile-optimized grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {slots.map((slot, index) => {
                const isSelected = selectedSlot && 
                  selectedSlot.start_time === slot.start_time && 
                  selectedSlot.end_time === slot.end_time;
                
                return (
                  <Button
                    key={index}
                    variant={isSelected ? "default" : "outline"}
                    className={`
                      h-auto py-2 sm:py-3 px-2 sm:px-4 flex-col gap-0.5 sm:gap-1 text-xs sm:text-sm
                      ${isSelected ? "bg-warm-sage hover:bg-forest text-white" : "hover:bg-warm-sage/10 hover:border-warm-sage"}
                      transition-all duration-200
                    `}
                    onClick={() => onSlotSelect(slot)}
                  >
                    <span className="font-semibold leading-tight">
                      {formatTime(slot.start_time)}
                    </span>
                    <span className={`text-xs leading-tight ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                      {format(new Date(slot.end_time), 'h:mm a')}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeSlotSelector;
