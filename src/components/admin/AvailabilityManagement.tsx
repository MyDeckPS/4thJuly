
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, Trash2 } from "lucide-react";
import { useAvailabilityTemplates, useCreateAvailabilityTemplate, useDeleteAvailabilityTemplate } from "@/hooks/useTimeSlots";
import { useHosts } from "@/hooks/useHosts";

const AvailabilityManagement = () => {
  const [isCreating, setIsCreating] = useState(false);

  const { data: templates, isLoading } = useAvailabilityTemplates();
  const { data: hosts } = useHosts();
  const createTemplate = useCreateAvailabilityTemplate();
  const deleteTemplate = useDeleteAvailabilityTemplate();

  const [formData, setFormData] = useState({
    host_id: '',
    session_type: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
  });

  const daysOfWeek = [
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
  ];

  const resetForm = () => {
    setFormData({
      host_id: '',
      session_type: '',
      day_of_week: '',
      start_time: '',
      end_time: '',
    });
    setIsCreating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Note: This function returns void in the single-host system
      createTemplate.mutate();
      resetForm();
    } catch (error) {
      console.error('Error creating availability template:', error);
    }
  };

  const handleDelete = async (template: any) => {
    if (window.confirm('Are you sure you want to delete this availability template?')) {
      try {
        deleteTemplate.mutate();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const getDayName = (dayOfWeek: number) => {
    return daysOfWeek.find(day => day.value === dayOfWeek.toString())?.label || 'Unknown';
  };

  // Simplified host validation - only show hosts with valid id and name
  const validHosts = React.useMemo(() => {
    if (!hosts || !Array.isArray(hosts)) {
      return [];
    }
    
    return hosts.filter(host => 
      host && 
      host.id && 
      typeof host.id === 'string' && 
      host.id.trim().length > 0 &&
      host.name && 
      typeof host.name === 'string' && 
      host.name.trim().length > 0
    );
  }, [hosts]);

  if (isLoading) {
    return <div>Loading availability templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Availability Templates</h3>
        <div className="text-sm text-muted-foreground">
          Note: Availability templates are not used in the single-host system. Use Working Hours instead.
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium mb-2">Availability Templates Not Available</h4>
            <p className="text-sm">
              This system uses a single-host configuration. Please use the Working Hours section to manage availability.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityManagement;
