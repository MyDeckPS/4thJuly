
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface QuizQuestion {
  id: string;
  question: string;
  question_key: string;
  options: string[] | null;
}

interface TaggingRule {
  id: string;
  question_id: string;
  option_value: string;
  tag_to_assign: string;
  confidence_score: number;
}

interface TaggingRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: TaggingRule;
  onClose: () => void;
}

const TaggingRuleDialog = ({
  open,
  onOpenChange,
  rule,
  onClose,
}: TaggingRuleDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    question_id: "",
    option_value: "",
    tag_to_assign: "",
    confidence_score: 100,
  });

  const { data: questions } = useQuery({
    queryKey: ["admin-quiz-questions-for-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("id, question, question_key, options")
        .eq("active", true)
        .order("sort_order");

      if (error) throw error;
      return data as QuizQuestion[];
    },
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        question_id: rule.question_id || "",
        option_value: rule.option_value || "",
        tag_to_assign: rule.tag_to_assign || "",
        confidence_score: rule.confidence_score || 100,
      });
    } else {
      setFormData({
        question_id: "",
        option_value: "",
        tag_to_assign: "",
        confidence_score: 100,
      });
    }
  }, [rule]);

  const selectedQuestion = questions?.find(q => q.id === formData.question_id);

  // Validate and filter questions to ensure they have valid IDs
  const validQuestions = questions?.filter(question => {
    const isValid = question && 
      question.id && 
      typeof question.id === 'string' && 
      question.id.trim() !== '' && 
      question.id.length > 0 &&
      question.question &&
      typeof question.question === 'string' &&
      question.question.trim() !== '';
    
    if (!isValid) {
      console.warn("TaggingRuleDialog: Invalid question filtered out:", question);
    }
    
    return isValid;
  }) || [];

  // Validate and filter options to ensure they are valid strings
  const validOptions = selectedQuestion?.options?.filter(option => {
    const isValid = option !== null &&
      option !== undefined &&
      typeof option === 'string' && 
      option.trim() !== '' &&
      option.length > 0;
    
    if (!isValid) {
      console.warn("TaggingRuleDialog: Invalid option filtered out:", option);
    }
    
    return isValid;
  }) || [];

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (rule) {
        const { error } = await supabase
          .from("question_tagging_rules")
          .update(data)
          .eq("id", rule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("question_tagging_rules")
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tagging-rules"] });
      toast.success(rule ? "Tagging rule updated" : "Tagging rule created");
      onClose();
    },
    onError: (error) => {
      console.error("Error saving tagging rule:", error);
      toast.error("Failed to save tagging rule");
    },
  });

  const handleSave = () => {
    if (!formData.question_id || !formData.option_value || !formData.tag_to_assign) {
      toast.error("Please fill in all required fields");
      return;
    }

    saveMutation.mutate(formData);
  };

  console.log("TaggingRuleDialog: Rendering with validQuestions:", validQuestions?.length);
  console.log("TaggingRuleDialog: Rendering with validOptions:", validOptions?.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {rule ? "Edit Tagging Rule" : "Create New Tagging Rule"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="question_id">Question *</Label>
            <Select
              value={formData.question_id}
              onValueChange={(value) =>
                setFormData({ ...formData, question_id: value, option_value: "" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a question" />
              </SelectTrigger>
              <SelectContent>
                {validQuestions.map((question) => {
                  // Final validation before rendering SelectItem
                  if (!question.id || question.id.trim() === '') {
                    console.error("TaggingRuleDialog: CRITICAL - About to render SelectItem with invalid ID:", question);
                    return null;
                  }
                  
                  return (
                    <SelectItem key={`question-${question.id}`} value={question.id}>
                      {question.question}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="option_value">Option Value *</Label>
            {validOptions.length > 0 ? (
              <Select
                value={formData.option_value}
                onValueChange={(value) =>
                  setFormData({ ...formData, option_value: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {validOptions.map((option, index) => {
                    // Final validation before rendering SelectItem
                    if (!option || option.trim() === '') {
                      console.error("TaggingRuleDialog: CRITICAL - About to render SelectItem with invalid option:", option);
                      return null;
                    }
                    
                    return (
                      <SelectItem 
                        key={`option-${selectedQuestion?.id || 'unknown'}-${index}-${option.substring(0, 10)}`} 
                        value={option}
                      >
                        {option}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="option_value"
                value={formData.option_value}
                onChange={(e) =>
                  setFormData({ ...formData, option_value: e.target.value })
                }
                placeholder="Enter option value"
              />
            )}
          </div>

          <div>
            <Label htmlFor="tag_to_assign">Tag to Assign *</Label>
            <Input
              id="tag_to_assign"
              value={formData.tag_to_assign}
              onChange={(e) =>
                setFormData({ ...formData, tag_to_assign: e.target.value })
              }
              placeholder="e.g., creative, analytical, social"
            />
          </div>

          <div>
            <Label htmlFor="confidence_score">Confidence Score (1-100)</Label>
            <Input
              id="confidence_score"
              type="number"
              min="1"
              max="100"
              value={formData.confidence_score}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  confidence_score: parseInt(e.target.value) || 100,
                })
              }
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaggingRuleDialog;
