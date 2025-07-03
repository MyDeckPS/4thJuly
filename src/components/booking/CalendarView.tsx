
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, isToday, isPast, isSameMonth, addMonths, subMonths } from "date-fns";

interface CalendarViewProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  availableDates: Date[];
}

const CalendarView = ({ selectedDate, onDateSelect, availableDates }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToPrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => isSameDay(availableDate, date));
  };

  const getDaysInMonth = () => {
    const days = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      days.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }

    return days;
  };

  const days = getDaysInMonth();

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle className="flex items-center gap-2 text-lg text-center sm:text-left">
            <CalendarIcon className="w-5 h-5 flex-shrink-0" />
            <span>Select a Date</span>
          </CardTitle>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPrevMonth} className="h-8 w-8 p-0">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="sm" onClick={goToNextMonth} className="h-8 w-8 p-0">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm font-medium text-muted-foreground">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-1 sm:p-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid - fully responsive */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date) => {
              const isAvailable = isDateAvailable(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isPastDate = isPast(date) && !isToday(date);
              const isCurrentMonth = isSameMonth(date, currentMonth);
              
              return (
                <Button
                  key={date.toISOString()}
                  variant={isSelected ? "default" : "ghost"}
                  className={`
                    h-8 w-full p-0 text-xs sm:text-sm min-w-0
                    ${isSelected ? "bg-warm-sage text-white hover:bg-forest" : ""}
                    ${isAvailable && !isPastDate && isCurrentMonth
                      ? "hover:bg-warm-sage/20 border border-warm-sage/30"
                      : ""
                    }
                    ${!isCurrentMonth ? "text-muted-foreground/50" : ""}
                    ${isPastDate || !isAvailable ? "opacity-50 cursor-not-allowed" : ""}
                    ${isToday(date) && !isSelected ? "ring-1 ring-warm-sage/50" : ""}
                  `}
                  onClick={() => isAvailable && !isPastDate && isCurrentMonth && onDateSelect(date)}
                  disabled={!isAvailable || isPastDate || !isCurrentMonth}
                >
                  <div className="flex flex-col items-center justify-center w-full">
                    <span className={`${isSelected ? "text-white" : ""} leading-none`}>
                      {format(date, 'd')}
                    </span>
                    {isAvailable && !isPastDate && isCurrentMonth && (
                      <div className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-white" : "bg-warm-sage"}`}></div>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Legend - mobile optimized */}
          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs text-muted-foreground justify-center pt-2 border-t">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-warm-sage rounded-full flex-shrink-0"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-gray-300 rounded-full flex-shrink-0"></div>
              <span>Unavailable</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarView;
