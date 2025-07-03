
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface QuizSetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizSet?: any;
  onClose: () => void;
}

const QuizSetDialog = ({ open, onOpenChange, quizSet, onClose }: QuizSetDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sort_order: 0,
    is_active: true,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (quizSet) {
      setFormData({
        title: quizSet.title || "",
        description: quizSet.description || "",
        sort_order: quizSet.sort_order || 0,
        is_active: quizSet.is_active ?? true,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        sort_order: 0,
        is_active: true,
      });
    }
  }, [quizSet, open]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (quizSet) {
        const { error } = await supabase
          .from("quiz_sets")
          .update(data)
          .eq("id", quizSet.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("quiz_sets")
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-sets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions"] });
      toast.success(quizSet ? "Quiz set updated successfully" : "Quiz set created successfully");
      onClose();
    },
    onError: (error) => {
      console.error("Error saving quiz set:", error);
      toast.error("Failed to save quiz set");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    saveMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {quizSet ? "Edit Quiz Set" : "Create Quiz Set"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Basic Information, Interests, Development Goals"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Optional description for this quiz set"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => handleInputChange("sort_order", parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange("is_active", checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : (quizSet ? "Update" : "Create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuizSetDialog;
