
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

interface QuizSetsManagerProps {
  onEdit: (set: any) => void;
}

const QuizSetsManager = ({ onEdit }: QuizSetsManagerProps) => {
  const queryClient = useQueryClient();

  const { data: quizSets, isLoading, error } = useQuery({
    queryKey: ["admin-quiz-sets"],
    queryFn: async () => {
      console.log('[QuizManagement] Fetching quiz sets...');
      const { data, error } = await supabase
        .from("quiz_sets")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        console.error('[QuizManagement] Error fetching quiz sets:', error);
        throw error;
      }
      
      console.log(`[QuizManagement] Successfully fetched ${data?.length || 0} quiz sets`);
      return data;
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      console.log(`[QuizManagement] Toggling quiz set ${id} to ${is_active ? 'active' : 'inactive'}`);
      const { error } = await supabase
        .from("quiz_sets")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-sets"] });
      toast.success("Quiz set status updated successfully");
      console.log('[QuizManagement] Quiz set status updated successfully');
    },
    onError: (error) => {
      console.error("[QuizManagement] Error updating quiz set:", error);
      toast.error("Failed to update quiz set status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log(`[QuizManagement] Deleting quiz set ${id}`);
      const { error } = await supabase
        .from("quiz_sets")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-sets"] });
      toast.success("Quiz set deleted successfully");
      console.log('[QuizManagement] Quiz set deleted successfully');
    },
    onError: (error) => {
      console.error("[QuizManagement] Error deleting quiz set:", error);
      toast.error("Failed to delete quiz set");
    },
  });

  const handleToggleActive = (quizSet: any) => {
    toggleActiveMutation.mutate({
      id: quizSet.id,
      is_active: !quizSet.is_active,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this quiz set? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 border-2 border-warm-sage border-t-transparent rounded-full animate-spin"></div>
            <span className="text-muted-foreground">Loading quiz sets...</span>
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
            <span>Error loading quiz sets. Please try again.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quizSets || quizSets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <div>
              <h3 className="font-medium text-lg">No quiz sets yet</h3>
              <p className="text-muted-foreground">
                Start by creating your first quiz set to organize questions into logical groups.
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
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Sort Order</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizSets.map((quizSet, index) => (
                <TableRow 
                  key={quizSet.id} 
                  className={`hover:bg-muted/30 transition-colors ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                  }`}
                >
                  <TableCell className="font-medium">
                    {quizSet.title}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {quizSet.description || "No description"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(quizSet)}
                      className="p-2 hover:bg-muted"
                    >
                      {quizSet.is_active ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50">
                      {quizSet.sort_order}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(quizSet)}
                        className="p-2 hover:bg-blue-50 hover:text-blue-600"
                        title="Edit quiz set"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(quizSet.id)}
                        className="p-2 hover:bg-red-50 hover:text-red-600"
                        title="Delete quiz set"
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

export default QuizSetsManager;
