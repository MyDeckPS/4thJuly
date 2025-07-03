
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFooterManagement } from "@/hooks/useFooterManagement";
import { toast } from "sonner";

interface FooterColumnManagerProps {
  columnId?: string | null;
  onClose: () => void;
}

const FooterColumnManager = ({ columnId, onClose }: FooterColumnManagerProps) => {
  const [title, setTitle] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { 
    footerColumns, 
    createColumn, 
    updateColumn, 
    isCreatingColumn, 
    isUpdatingColumn 
  } = useFooterManagement();

  const isEditing = !!columnId;
  const isLoading = isCreatingColumn || isUpdatingColumn;

  useEffect(() => {
    if (isEditing && footerColumns) {
      const column = footerColumns.find((col: any) => col.id === columnId);
      if (column) {
        setTitle(column.column_title || "");
        setSortOrder(column.sort_order || 0);
      }
    }
  }, [isEditing, columnId, footerColumns]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Column title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      const columnData = {
        column_title: title.trim(),
        sort_order: sortOrder
      };

      console.log("Submitting column data:", columnData);

      if (isEditing) {
        updateColumn({ id: columnId, ...columnData });
      } else {
        createColumn(columnData);
      }
      
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit form");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Footer Column" : "Add Footer Column"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Column Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) {
                  setErrors(prev => ({ ...prev, title: "" }));
                }
              }}
              placeholder="Enter column title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input
              id="sortOrder"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              placeholder="Enter sort order"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FooterColumnManager;
