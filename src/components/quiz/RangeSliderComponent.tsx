
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface RangeSliderComponentProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const RangeSliderComponent = ({ 
  label, 
  value, 
  onChange, 
  min = 1, 
  max = 5, 
  step = 1,
  className = ""
}: RangeSliderComponentProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">
          {label}
        </Label>
        <span className="text-sm font-semibold text-warm-sage">
          {value}
        </span>
      </div>
      
      <Slider
        value={[value]}
        onValueChange={(newValue) => onChange(newValue[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min} - Beginner</span>
        <span>{max} - Expert</span>
      </div>
    </div>
  );
};

export default RangeSliderComponent;
