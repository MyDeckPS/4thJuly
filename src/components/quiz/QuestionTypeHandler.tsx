
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import RangeSliderComponent from "./RangeSliderComponent";

interface QuestionTypeHandlerProps {
  question: {
    question_type: string;
    options: string[];
    max_selections?: number;
    enable_range_selector?: boolean;
    range_min?: number;
    range_max?: number;
    range_step?: number;
  };
  value: any;
  onChange: (value: any) => void;
  childName?: string;
}

const QuestionTypeHandler = ({ question, value, onChange, childName = 'your child' }: QuestionTypeHandlerProps) => {
  console.log('=== QUESTION TYPE HANDLER RENDER ===');
  console.log('Question received:', question);
  console.log('Question type:', question.question_type);
  console.log('Options received:', question.options);
  console.log('Options length:', question.options?.length);
  console.log('Current value:', value);

  // Validate we have options for choice-based questions
  const needsOptions = ['single_choice', 'multiple_choice', 'select'].includes(question.question_type);
  const hasValidOptions = question.options && Array.isArray(question.options) && question.options.length > 0;

  if (needsOptions && !hasValidOptions) {
    console.error('ERROR: Choice question missing valid options!', {
      type: question.question_type,
      options: question.options,
      hasValidOptions
    });
    
    return (
      <div className="text-center text-red-600 p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="font-semibold">No options available for this question</p>
        <p className="text-sm mt-1">Question type: {question.question_type}</p>
        <p className="text-xs mt-2">Debug: Options = {JSON.stringify(question.options)}</p>
      </div>
    );
  }

  const handleCheckboxChange = (option: string, checked: boolean) => {
    const currentValue = Array.isArray(value) ? value : [];
    const maxSelections = question.max_selections || 3;
    
    if (checked) {
      if (currentValue.length >= maxSelections) return;
      
      if (question.enable_range_selector) {
        const newValue = [...currentValue, { category: option, rating: question.range_min || 1 }];
        onChange(newValue);
      } else {
        onChange([...currentValue, option]);
      }
    } else {
      const filteredValue = currentValue.filter((v: any) => 
        question.enable_range_selector ? v.category !== option : v !== option
      );
      onChange(filteredValue);
    }
  };

  const handleRangeChange = (option: string, rating: number) => {
    const currentValue = Array.isArray(value) ? value : [];
    const updatedValue = currentValue.map((v: any) => 
      v.category === option ? { ...v, rating } : v
    );
    onChange(updatedValue);
  };

  const isOptionSelected = (option: string) => {
    if (!Array.isArray(value)) return false;
    return question.enable_range_selector 
      ? value.some((v: any) => v.category === option)
      : value.includes(option);
  };

  const getOptionRating = (option: string) => {
    if (!Array.isArray(value) || !question.enable_range_selector) return question.range_min || 1;
    const item = value.find((v: any) => v.category === option);
    return item?.rating || question.range_min || 1;
  };

  // Direct type matching without complex normalization
  switch (question.question_type) {
    case 'text':
      console.log('Rendering text input');
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your answer"
          className="text-lg p-4 h-12"
        />
      );

    case 'date':
      console.log('Rendering date input');
      return (
        <Input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="text-lg p-4 h-12"
        />
      );

    case 'single_choice':
      console.log('Rendering single choice with', question.options.length, 'options');
      return (
        <RadioGroup value={value || ''} onValueChange={onChange}>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <div key={`radio-${index}`} className="flex items-center space-x-3">
                <RadioGroupItem value={option} id={`radio-${index}`} />
                <Label htmlFor={`radio-${index}`} className="text-base cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      );

    case 'select':
      console.log('Rendering select with', question.options.length, 'options');
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className="text-lg p-4 h-12">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {question.options.map((option, index) => (
              <SelectItem key={`select-${index}`} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'multiple_choice':
      console.log('Rendering multiple choice with', question.options.length, 'options');
      return (
        <div className="space-y-4">
          {question.options.map((option, index) => (
            <div key={`checkbox-${index}`} className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={`checkbox-${index}`}
                  checked={isOptionSelected(option)}
                  onCheckedChange={(checked) => handleCheckboxChange(option, !!checked)}
                  disabled={!isOptionSelected(option) && Array.isArray(value) && value.length >= (question.max_selections || 3)}
                />
                <Label htmlFor={`checkbox-${index}`} className="text-base cursor-pointer">
                  {option}
                </Label>
              </div>
              
              {question.enable_range_selector && isOptionSelected(option) && (
                <div className="ml-6 mt-3">
                  <RangeSliderComponent
                    label={`Rate ${childName}'s proficiency in ${option}`}
                    value={getOptionRating(option)}
                    onChange={(rating) => handleRangeChange(option, rating)}
                    min={question.range_min || 1}
                    max={question.range_max || 5}
                    step={question.range_step || 1}
                  />
                </div>
              )}
            </div>
          ))}
          
          {question.max_selections && (
            <p className="text-sm text-muted-foreground">
              Select up to {question.max_selections} options
              {Array.isArray(value) && ` (${value.length}/${question.max_selections} selected)`}
            </p>
          )}
        </div>
      );

    default:
      console.error('Unsupported question type:', question.question_type);
      return (
        <div className="text-center text-red-600 p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="font-semibold">Unsupported question type: {question.question_type}</p>
          <p className="text-sm mt-1">Available types: text, date, single_choice, select, multiple_choice</p>
        </div>
      );
  }
};

export default QuestionTypeHandler;
