
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
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TaggingRule {
  id: string;
  question_id: string;
  option_value: string;
  tag_to_assign: string;
  confidence_score: number;
  created_at: string;
  updated_at: string;
  quiz_questions?: {
    question: string;
    question_key: string;
  };
}

interface TaggingRulesManagerProps {
  onEdit: (rule: TaggingRule) => void;
}

const TaggingRulesManager = ({ onEdit }: TaggingRulesManagerProps) => {
  const queryClient = useQueryClient();

  const { data: rules, isLoading } = useQuery({
    queryKey: ["admin-tagging-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("question_tagging_rules")
        .select(`
          *,
          quiz_questions!inner(question, question_key)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tagging rules:", error);
        throw error;
      }
      return data as TaggingRule[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("question_tagging_rules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tagging-rules"] });
      toast.success("Tagging rule deleted");
    },
    onError: (error) => {
      console.error("Error deleting tagging rule:", error);
      toast.error("Failed to delete tagging rule");
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this tagging rule?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading tagging rules...</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question</TableHead>
            <TableHead>Option Value</TableHead>
            <TableHead>Tag to Assign</TableHead>
            <TableHead>Confidence Score</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules?.map((rule) => (
            <TableRow key={rule.id}>
              <TableCell className="max-w-md">
                <div className="truncate" title={rule.quiz_questions?.question}>
                  {rule.quiz_questions?.question}
                </div>
                <div className="text-sm text-gray-500">
                  {rule.quiz_questions?.question_key}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{rule.option_value}</Badge>
              </TableCell>
              <TableCell>
                <Badge>{rule.tag_to_assign}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{rule.confidence_score}%</Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(rule)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rule.id)}
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
  );
};

export default TaggingRulesManager;
