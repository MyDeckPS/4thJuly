
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Info, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import DebugConsole from "./DebugConsole";

interface QuizQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: any;
  onClose: () => void;
}

const QuizQuestionDialog = ({
  open,
  onOpenChange,
  question,
  onClose,
}: QuizQuestionDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    question: "",
    question_type: "single_choice",
    question_key: "",
    options: [],
    required: true,
    is_required: true,
    sort_order: 0,
    active: true,
    max_selections: null,
    set_id: "",
  });

  const [newOption, setNewOption] = useState("");

  // Fetch quiz sets for the dropdown
  const { data: quizSets } = useQuery({
    queryKey: ["admin-quiz-sets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_sets")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    console.log('[QuizQuestionDialog] Dialog opened with question:', question);
    if (question) {
      console.log('[QuizQuestionDialog] Editing existing question:', question.id);
      setFormData({
        question: question.question || "",
        question_type: question.question_type || "single_choice",
        question_key: question.question_key || "",
        options: question.options || [],
        required: question.required || true,
        is_required: question.is_required || true,
        sort_order: question.sort_order || 0,
        active: question.active !== undefined ? question.active : true,
        max_selections: question.max_selections || null,
        set_id: question.set_id || "",
      });
    } else {
      console.log('[QuizQuestionDialog] Creating new question');
      setFormData({
        question: "",
        question_type: "single_choice",
        question_key: "",
        options: [],
        required: true,
        is_required: true,
        sort_order: 0,
        active: true,
        max_selections: null,
        set_id: "",
      });
    }
  }, [question]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('[QuizQuestionDialog] Starting save operation with data:', data);
      
      // Remove max_selections from the data since it doesn't exist in the database
      const { max_selections, ...dbData } = data;
      console.log('[QuizQuestionDialog] Data after removing max_selections:', dbData);
      
      try {
        if (question) {
          console.log(`[QuizQuestionDialog] Updating existing question ${question.id}`);
          const { data: result, error } = await supabase
            .from("quiz_questions")
            .update(dbData)
            .eq("id", question.id)
            .select();
          
          if (error) {
            console.error('[QuizQuestionDialog] Update error details:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
            throw error;
          }
          console.log('[QuizQuestionDialog] Question updated successfully:', result);
          return result;
        } else {
          console.log('[QuizQuestionDialog] Creating new question');
          const { data: result, error } = await supabase
            .from("quiz_questions")
            .insert([dbData])
            .select();
          
          if (error) {
            console.error('[QuizQuestionDialog] Insert error details:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
            throw error;
          }
          console.log('[QuizQuestionDialog] Question created successfully:', result);
          return result;
        }
      } catch (error) {
        console.error('[QuizQuestionDialog] Database operation failed:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      console.log('[QuizQuestionDialog] Save mutation successful with result:', result);
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions"] });
      toast.success(question ? "Question updated successfully" : "Question created successfully");
      onClose();
    },
    onError: (error: any) => {
      console.error("[QuizQuestionDialog] Save mutation failed:", error);
      
      // More detailed error handling
      let errorMessage = "Failed to save question";
      if (error?.message) {
        if (error.message.includes("row-level security policy")) {
          errorMessage = "Permission denied: Unable to save question. Please check your admin permissions.";
        } else if (error.message.includes("duplicate key")) {
          errorMessage = "A question with this key already exists. Please use a different question key.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    },
  });

  const handleSave = () => {
    console.log('[QuizQuestionDialog] Save button clicked');
    console.log('[QuizQuestionDialog] Current form data:', formData);
    
    if (!formData.question || !formData.question_key) {
      console.error('[QuizQuestionDialog] Validation failed: missing required fields');
      toast.error("Please fill in all required fields (Question and Question Key)");
      return;
    }

    if ((formData.question_type === "multiple_choice" || formData.question_type === "single_choice") && formData.options.length === 0) {
      console.error('[QuizQuestionDialog] Validation failed: no options provided for choice question');
      toast.error("Please add at least one option for choice questions");
      return;
    }

    console.log('[QuizQuestionDialog] Validation passed, proceeding with save');
    saveMutation.mutate(formData);
  };

  const addOption = () => {
    console.log('[QuizQuestionDialog] Adding option:', newOption);
    if (newOption.trim()) {
      const updatedOptions = [...formData.options, newOption.trim()];
      setFormData({
        ...formData,
        options: updatedOptions,
      });
      console.log('[QuizQuestionDialog] Options updated:', updatedOptions);
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    console.log('[QuizQuestionDialog] Removing option at index:', index);
    const updatedOptions = formData.options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      options: updatedOptions,
    });
    console.log('[QuizQuestionDialog] Options after removal:', updatedOptions);
  };

  const moveOption = (index: number, direction: 'up' | 'down') => {
    const newOptions = [...formData.options];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newOptions.length) {
      [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
      setFormData({
        ...formData,
        options: newOptions,
      });
      console.log('[QuizQuestionDialog] Options reordered:', newOptions);
    }
  };

  const generateKeyFromQuestion = () => {
    console.log('[QuizQuestionDialog] Generating key from question:', formData.question);
    const key = formData.question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 50);
    console.log('[QuizQuestionDialog] Generated key:', key);
    setFormData({ ...formData, question_key: key });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {question ? "Edit Question" : "Create New Question"}
            <Info className="w-4 h-4 text-muted-foreground" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Debug Console at the top */}
          <DebugConsole 
            module="QuizQuestionDialog" 
            className="border border-dashed border-warm-sage/30 rounded-lg"
          />

          {/* Main Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question *</Label>
              <Textarea
                id="question"
                value={formData.question}
                onChange={(e) => {
                  console.log('[QuizQuestionDialog] Question text changed:', e.target.value);
                  setFormData({ ...formData, question: e.target.value });
                }}
                placeholder="Enter your question"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="question_key">
                  Question Key * 
                  <span className="text-xs text-muted-foreground ml-1">
                    (Unique identifier for data processing)
                  </span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="question_key"
                    value={formData.question_key}
                    onChange={(e) => {
                      console.log('[QuizQuestionDialog] Question key changed:', e.target.value);
                      setFormData({ ...formData, question_key: e.target.value });
                    }}
                    placeholder="question_key"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateKeyFromQuestion}
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used to identify this question in responses and tagging rules
                </p>
              </div>

              <div>
                <Label htmlFor="question_type">Question Type</Label>
                <Select
                  value={formData.question_type}
                  onValueChange={(value) => {
                    console.log('[QuizQuestionDialog] Question type changed:', value);
                    setFormData({ ...formData, question_type: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_choice">Single Choice (Radio)</SelectItem>
                    <SelectItem value="multiple_choice">Multiple Choice (Checkbox)</SelectItem>
                    <SelectItem value="text">Text Input</SelectItem>
                    <SelectItem value="date">Date Input</SelectItem>
                    <SelectItem value="select">Dropdown Select</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose how users will answer this question
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quiz_set">Quiz Set</Label>
                <Select
                  value={formData.set_id}
                  onValueChange={(value) => {
                    console.log('[QuizQuestionDialog] Quiz set changed:', value);
                    setFormData({ ...formData, set_id: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a quiz set" />
                  </SelectTrigger>
                  <SelectContent>
                    {quizSets?.map((set) => (
                      <SelectItem key={set.id} value={set.id}>
                        {set.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Group this question under a quiz set
                </p>
              </div>

              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    console.log('[QuizQuestionDialog] Sort order changed:', value);
                    setFormData({
                      ...formData,
                      sort_order: value,
                    });
                  }}
                />
              </div>

              {formData.question_type === "multiple_choice" && (
                <div>
                  <Label htmlFor="max_selections">Max Selections</Label>
                  <Input
                    id="max_selections"
                    type="number"
                    value={formData.max_selections || ""}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : null;
                      console.log('[QuizQuestionDialog] Max selections changed:', value);
                      setFormData({
                        ...formData,
                        max_selections: value,
                      });
                    }}
                    placeholder="No limit"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum number of options user can select
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="required"
                  checked={formData.is_required}
                  onCheckedChange={(checked) => {
                    console.log('[QuizQuestionDialog] Required status changed:', checked);
                    setFormData({
                      ...formData,
                      is_required: !!checked,
                      required: !!checked,
                    });
                  }}
                />
                <Label htmlFor="required">Required</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => {
                    console.log('[QuizQuestionDialog] Active status changed:', checked);
                    setFormData({ ...formData, active: !!checked });
                  }}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>

            {(formData.question_type === "single_choice" ||
              formData.question_type === "multiple_choice" ||
              formData.question_type === "select") && (
              <div>
                <Label>Options</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="Add new option"
                      onKeyPress={(e) => e.key === "Enter" && addOption()}
                    />
                    <Button type="button" onClick={addOption}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {formData.options.length > 0 && (
                    <div className="space-y-2">
                      {formData.options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 rounded border bg-background"
                        >
                          <div className="flex flex-col gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveOption(index, 'up')}
                              disabled={index === 0}
                              className="h-6 w-6 p-0"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveOption(index, 'down')}
                              disabled={index === formData.options.length - 1}
                              className="h-6 w-6 p-0"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                          </div>
                          <Badge variant="secondary" className="flex-1 justify-between">
                            <span className="flex-1">{option}</span>
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="ml-2 hover:bg-red-100 rounded-full p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizQuestionDialog;
