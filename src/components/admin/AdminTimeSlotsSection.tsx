import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, Clock, Trash2, Edit } from "lucide-react";
import { useWorkingHours, useCreateWorkingHours, useDeleteTimeSlot, useUpdateWorkingHours } from "@/hooks/useTimeSlots";
import DebugConsole from "./DebugConsole";
const AdminTimeSlotsSection = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingWorkingHour, setEditingWorkingHour] = useState<any>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const {
    data: workingHours,
    isLoading
  } = useWorkingHours();
  const createWorkingHours = useCreateWorkingHours();
  const updateWorkingHours = useUpdateWorkingHours();
  const deleteTimeSlot = useDeleteTimeSlot();
  const [formData, setFormData] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    is_available: true
  });
  const daysOfWeek = [{
    value: '0',
    label: 'Sunday'
  }, {
    value: '1',
    label: 'Monday'
  }, {
    value: '2',
    label: 'Tuesday'
  }, {
    value: '3',
    label: 'Wednesday'
  }, {
    value: '4',
    label: 'Thursday'
  }, {
    value: '5',
    label: 'Friday'
  }, {
    value: '6',
    label: 'Saturday'
  }];
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };
  const resetForm = () => {
    setFormData({
      day_of_week: '',
      start_time: '',
      end_time: '',
      is_available: true
    });
    setIsCreating(false);
    setEditingWorkingHour(null);
  };
  const handleEdit = (workingHour: any) => {
    setFormData({
      day_of_week: workingHour.day_of_week.toString(),
      start_time: workingHour.start_time,
      end_time: workingHour.end_time,
      is_available: workingHour.is_available
    });
    setEditingWorkingHour(workingHour);
    setIsCreating(true);
    addDebugLog(`Started editing working hours: ${getDayName(workingHour.day_of_week)}`);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = editingWorkingHour ? 'update' : 'create';
    addDebugLog(`Attempting to ${action} working hours for day: ${formData.day_of_week}`);
    try {
      const submitData = {
        day_of_week: parseInt(formData.day_of_week),
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_available: formData.is_available
      };
      if (editingWorkingHour) {
        await updateWorkingHours.mutateAsync({
          id: editingWorkingHour.id,
          ...submitData
        });
        addDebugLog(`Successfully updated working hours`);
      } else {
        await createWorkingHours.mutateAsync(submitData);
        addDebugLog(`Successfully created working hours`);
      }
      resetForm();
    } catch (error) {
      addDebugLog(`Error ${action}ing working hours: ${error}`);
    }
  };
  const handleDelete = async (workingHour: any) => {
    if (window.confirm('Are you sure you want to delete this working hour?')) {
      addDebugLog(`Attempting to delete working hour: ${workingHour.id}`);
      try {
        await deleteTimeSlot.mutateAsync(workingHour.id);
        addDebugLog(`Successfully deleted working hour: ${workingHour.id}`);
      } catch (error) {
        addDebugLog(`Error deleting working hour: ${error}`);
      }
    }
  };
  const getDayName = (dayOfWeek: number) => {
    return daysOfWeek.find(day => day.value === dayOfWeek.toString())?.label || 'Unknown';
  };
  const formatTime = (timeString: string) => {
    return timeString;
  };
  if (isLoading) {
    return <div>Loading working hours...</div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Time Slots management ⏰</h2>
      </div>

      <Tabs defaultValue="working-hours" className="w-full">
        

        <TabsContent value="working-hours" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Edit your working hours</h3>
            <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
              <Plus className="w-4 h-4 mr-2" />
              Add Working Hours
            </Button>
          </div>

          {isCreating && <Card>
              <CardHeader>
                <CardTitle>
                  {editingWorkingHour ? 'Edit Working Hours' : 'Create Working Hours'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="day_of_week">Day of Week *</Label>
                    <Select value={formData.day_of_week} onValueChange={value => setFormData({
                  ...formData,
                  day_of_week: value
                })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map(day => <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_time">Start Time *</Label>
                      <Input id="start_time" type="time" value={formData.start_time} onChange={e => setFormData({
                    ...formData,
                    start_time: e.target.value
                  })} required />
                    </div>

                    <div>
                      <Label htmlFor="end_time">End Time *</Label>
                      <Input id="end_time" type="time" value={formData.end_time} onChange={e => setFormData({
                    ...formData,
                    end_time: e.target.value
                  })} required />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={createWorkingHours.isPending || updateWorkingHours.isPending}>
                      {editingWorkingHour ? 'Update Working Hours' : 'Create Working Hours'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>}

          <div className="grid gap-4">
            {workingHours?.map(workingHour => <Card key={workingHour.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-warm-peach/10 rounded-full flex items-center justify-center bg-teal-700">
                        <Clock className="w-6 h-6 text-warm-peach" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {getDayName(workingHour.day_of_week)}
                          </Badge>
                          <Badge variant={workingHour.is_available ? "default" : "destructive"}>
                            {workingHour.is_available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(workingHour.start_time)} - {formatTime(workingHour.end_time)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(workingHour)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(workingHour)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </TabsContent>
      </Tabs>

      <DebugConsole module="working-hours" logs={debugLogs} onClear={() => setDebugLogs([])} />
    </div>;
};
export default AdminTimeSlotsSection;