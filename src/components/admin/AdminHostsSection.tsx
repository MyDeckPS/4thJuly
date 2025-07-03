
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, User, Image } from "lucide-react";
import { useHosts, useCreateHost, useUpdateHost, useDeleteHost } from "@/hooks/useHosts";
import MediaLibrarySelector from "./MediaLibrarySelector";
import DebugConsole from "./DebugConsole";

const AdminHostsSection = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingHost, setEditingHost] = useState<any>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const { data: hosts, isLoading } = useHosts();
  const createHost = useCreateHost();
  const updateHost = useUpdateHost();
  const deleteHost = useDeleteHost();

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    profile_image_url: '',
    email: '',
    timezone: 'UTC',
    is_active: false
  });

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      bio: '',
      profile_image_url: '',
      email: '',
      timezone: 'UTC',
      is_active: false
    });
    setIsCreating(false);
    setEditingHost(null);
  };

  const handleMediaSelect = (mediaId: string) => {
    // In a real implementation, you'd fetch the media URL by ID
    // For now, we'll use the mediaId as the URL since the MediaLibrarySelector
    // already provides the full URL
    setFormData(prev => ({ ...prev, profile_image_url: mediaId }));
    setShowMediaLibrary(false);
    addDebugLog(`Selected media for profile image: ${mediaId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    addDebugLog(`Attempting to ${editingHost ? 'update' : 'create'} host: ${formData.name}`);
    
    try {
      if (editingHost) {
        await updateHost.mutateAsync({
          id: editingHost.id,
          ...formData
        });
        addDebugLog(`Successfully updated host: ${formData.name}`);
      } else {
        await createHost.mutateAsync(formData);
        addDebugLog(`Successfully created host: ${formData.name}`);
      }
      resetForm();
    } catch (error) {
      addDebugLog(`Error ${editingHost ? 'updating' : 'creating'} host: ${error}`);
    }
  };

  const handleEdit = (host: any) => {
    setFormData({
      name: host.name,
      bio: host.bio || '',
      profile_image_url: host.profile_image_url || '',
      email: host.email || '',
      timezone: host.timezone || 'UTC',
      is_active: host.is_active
    });
    setEditingHost(host);
    setIsCreating(true);
    addDebugLog(`Started editing host: ${host.name}`);
  };

  const handleDelete = async (host: any) => {
    if (window.confirm(`Are you sure you want to delete ${host.name}?`)) {
      addDebugLog(`Attempting to delete host: ${host.name}`);
      try {
        await deleteHost.mutateAsync(host.id);
        addDebugLog(`Successfully deleted host: ${host.name}`);
      } catch (error) {
        addDebugLog(`Error deleting host: ${error}`);
      }
    }
  };

  if (isLoading) {
    return <div>Loading hosts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Hosts 👻</h2>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Add Host
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingHost ? 'Edit Host' : 'Create New Host'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label>Profile Image</Label>
                <div className="flex items-center gap-4 mt-2">
                  {formData.profile_image_url && (
                    <img
                      src={formData.profile_image_url}
                      alt="Profile preview"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMediaLibrary(true)}
                    className="flex items-center gap-2"
                  >
                    <Image className="w-4 h-4" />
                    {formData.profile_image_url ? 'Change Image' : 'Select Image'}
                  </Button>
                  {formData.profile_image_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setFormData({ ...formData, profile_image_url: '' })}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createHost.isPending || updateHost.isPending}>
                  {editingHost ? 'Update Host' : 'Create Host'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {hosts?.map((host) => (
          <Card key={host.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-warm-sage/10 rounded-full flex items-center justify-center overflow-hidden">
                    {host.profile_image_url ? (
                      <img
                        src={host.profile_image_url}
                        alt={host.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-warm-sage" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{host.name}</h3>
                    {host.email && <p className="text-sm text-muted-foreground">{host.email}</p>}
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {host.bio}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={host.is_active ? "default" : "secondary"}>
                        {host.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Created: {new Date(host.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(host)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(host)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showMediaLibrary && (
        <MediaLibrarySelector
          onSelect={handleMediaSelect}
          onClose={() => setShowMediaLibrary(false)}
        />
      )}

      <DebugConsole module="hosts" logs={debugLogs} onClear={() => setDebugLogs([])} />
    </div>
  );
};

export default AdminHostsSection;
