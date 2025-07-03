import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarStep } from "./booking/CalendarStep";
import { TimeSlotStep } from "./booking/TimeSlotStep";
import { DetailsStep } from "./booking/DetailsStep";
import { PaymentStep } from "./booking/PaymentStep";
import { ConfirmationStep } from "./booking/ConfirmationStep";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type BookingData = {
  date?: Date;
  timeSlot?: any; // Will contain the slot object from your system
  name?: string;
  email?: string;
  phone?: string;
  childName?: string;
  childAge?: string;
  concerns?: string;
  consultationType?: "video" | "phone" | "written";
  expert?: string;
  sessionConfig?: any;
  host?: any;
  specialNotes?: string;
};

const BookingDialog = ({ open, onOpenChange }: BookingDialogProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({});

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const resetBooking = () => {
    setCurrentStep(1);
    setBookingData({});
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      resetBooking();
    }
    onOpenChange(open);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CalendarStep
            selectedDate={bookingData.date}
            onDateSelect={(date) => updateBookingData({ date })}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <TimeSlotStep
            selectedDate={bookingData.date!}
            selectedSlot={bookingData.timeSlot}
            onSlotSelect={(timeSlot) => updateBookingData({ timeSlot })}
            onNext={nextStep}
            onBack={prevStep}
            onConfigLoad={(config, host) => updateBookingData({ sessionConfig: config, host })}
          />
        );
      case 3:
        return (
          <DetailsStep
            bookingData={bookingData}
            onDataUpdate={updateBookingData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <PaymentStep
            bookingData={bookingData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <ConfirmationStep
            bookingData={bookingData}
            onClose={() => handleDialogChange(false)}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Select Date";
      case 2: return "Choose Time Slot";
      case 3: return "Your Details";
      case 4: return "Payment";
      case 5: return "Booking Confirmed";
      default: return "Book Session";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {getStepTitle()}
          </DialogTitle>
          {currentStep < 5 && (
            <div className="flex items-center justify-center mt-4">
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full ${
                      step <= currentStep
                        ? "bg-orange-500"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog; 