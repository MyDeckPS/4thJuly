import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface QuizQuestionManagerProps {
  onEdit: (question: any) => void;
}

const QuizQuestionManager = ({ onEdit }: QuizQuestionManagerProps) => {
  const queryClient = useQueryClient();

  const { data: questions, isLoading, error } = useQuery({
    queryKey: ["admin-quiz-questions"],
    queryFn: async () => {
      console.log('[QuizManagement] Fetching quiz questions with sets...');
      const { data, error } = await supabase
        .from("quiz_questions")
        .select(`
          *,
          quiz_sets!inner(
            id,
            title
          )
        `)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error('[QuizManagement] Error fetching questions:', error);
        throw error;
      }
      
      console.log(`[QuizManagement] Successfully fetched ${data?.length || 0} questions`);
      return data;
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      console.log(`[QuizManagement] Toggling question ${id} to ${active ? 'active' : 'inactive'}`);
      const { error } = await supabase
        .from("quiz_questions")
        .update({ active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions"] });
      toast.success("Question status updated successfully");
      console.log('[QuizManagement] Question status updated successfully');
    },
    onError: (error) => {
      console.error("[QuizManagement] Error updating question:", error);
      toast.error("Failed to update question status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log(`[QuizManagement] Deleting question ${id}`);
      const { error } = await supabase
        .from("quiz_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions"] });
      toast.success("Question deleted successfully");
      console.log('[QuizManagement] Question deleted successfully');
    },
    onError: (error) => {
      console.error("[QuizManagement] Error deleting question:", error);
      toast.error("Failed to delete question");
    },
  });

  const handleToggleActive = (question: any) => {
    toggleActiveMutation.mutate({
      id: question.id,
      active: !question.active,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 border-2 border-warm-sage border-t-transparent rounded-full animate-spin"></div>
            <span className="text-muted-foreground">Loading questions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <span>Error loading questions. Please try again.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <div>
              <h3 className="font-medium text-lg">No questions yet</h3>
              <p className="text-muted-foreground">
                Start by creating your first quiz question to build the enhanced quiz experience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Question</TableHead>
                <TableHead className="font-semibold">Quiz Set</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Required</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Sort Order</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question, index) => (
                <TableRow 
                  key={question.id} 
                  className={`hover:bg-muted/30 transition-colors ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                  }`}
                >
                  <TableCell className="max-w-md">
                    <div className="space-y-1">
                      <div 
                        className="font-medium line-clamp-2" 
                        title={question.question}
                      >
                        {question.question}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Key: {question.question_key}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className="bg-purple-50 text-purple-700 border-purple-200"
                    >
                      {question.quiz_sets?.title || 'No Set'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {question.question_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {question.is_required ? (
                      <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                        Required
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                        Optional
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(question)}
                      className="p-2 hover:bg-muted"
                    >
                      {question.active ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50">
                      {question.sort_order}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(question)}
                        className="p-2 hover:bg-blue-50 hover:text-blue-600"
                        title="Edit question"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(question.id)}
                        className="p-2 hover:bg-red-50 hover:text-red-600"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizQuestionManager;
