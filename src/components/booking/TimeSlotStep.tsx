import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TimeSlotStepProps {
  selectedDate: Date;
  selectedSlot?: any;
  onSlotSelect: (slot: any) => void;
  onNext: () => void;
  onBack: () => void;
  onConfigLoad: (config: any, host: any) => void;
}

export const TimeSlotStep = ({ 
  selectedDate, 
  selectedSlot, 
  onSlotSelect, 
  onNext, 
  onBack,
  onConfigLoad 
}: TimeSlotStepProps) => {
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionConfig, setSessionConfig] = useState<any>(null);
  const [host, setHost] = useState<any>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate) return;
      
      setLoading(true);
      try {
        // Fix timezone issue - use local date instead of UTC
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        // Fetch available slots
        const { data: slots, error: slotsError } = await supabase.rpc('get_available_slots', {
          target_date: dateStr,
          session_type_param: 'consultation',
        });
        
        if (slotsError) throw slotsError;
        
        // Fetch session config for consultation
        const { data: configs, error: configError } = await supabase
          .from('session_configurations')
          .select('*')
          .eq('is_active', true)
          .eq('session_type', 'consultation')
          .single();
        
        if (configError) throw configError;
        
        // Fetch host
        const { data: hosts, error: hostError } = await supabase
          .from('host')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (hostError) throw hostError;
        setTimeSlots(slots || []);
        setSessionConfig(configs);
        setHost(hosts);
        onConfigLoad(configs, hosts);
        
      } catch (error: any) {
        console.error('Error fetching time slots:', error);
        toast.error(`Failed to load available time slots: ${error.message}`);
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate]); // Remove onConfigLoad dependency to avoid infinite loop

  const isNextDisabled = !selectedSlot;

  const formatSlotTime = (slot: any) => {
    const startTime = new Date(slot.start_time);
    const endTime = new Date(slot.end_time);
    return `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
  };

  return (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <p className="text-muted-foreground mb-2">
          Available time slots for
        </p>
        <p className="font-semibold text-lg">
          {format(selectedDate, "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading available slots...</p>
        </div>
      ) : timeSlots.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No available slots for this date.</p>
          <p className="text-sm text-muted-foreground mt-2">Please select a different date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {timeSlots.map((slot, index) => (
            <Button
              key={index}
              variant={selectedSlot === slot ? "default" : "outline"}
              onClick={() => onSlotSelect(slot)}
              className={`flex items-center gap-2 py-3 ${
                selectedSlot === slot 
                  ? "bg-orange-500 hover:bg-orange-600 text-white" 
                  : "hover:bg-orange-50 hover:border-orange-200"
              }`}
            >
              <Clock className="w-4 h-4" />
              {formatSlotTime(slot)}
            </Button>
          ))}
        </div>
      )}

      {selectedSlot && (
        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-sm text-muted-foreground">
            Selected time: <span className="font-medium text-foreground">{formatSlotTime(selectedSlot)}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Duration: {sessionConfig?.duration_minutes || 30} minutes
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="hover:bg-gray-50">
          Back
        </Button>
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