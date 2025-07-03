
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Calendar, User, RefreshCw, Edit2 } from "lucide-react";
import { useUserManagement } from "@/hooks/useUserManagement";
import DebugConsole from "@/components/admin/DebugConsole";
import UserDetailModal from "@/components/admin/UserDetailModal";

const AdminUserManagement = () => {
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: users,
    isLoading,
    error,
    refetch
  } = useUserManagement(userTypeFilter, searchQuery);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [logEntry, ...prev].slice(0, 50));
    console.log(logEntry);
  };

  const clearDebugLogs = () => {
    setDebugLogs([]);
  };

  useEffect(() => {
    if (users) {
      addDebugLog(`User data loaded: ${users.length} users found`);
    }
  }, [users]);

  useEffect(() => {
    if (error) {
      addDebugLog(`Error loading users: ${error.message}`);
    }
  }, [error]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewBookings = (userId: string, userName: string) => {
    addDebugLog(`View bookings requested for user: ${userName} (${userId})`);
    console.log('View bookings for user:', userId);
  };

  const handleManageUser = (user: any) => {
    addDebugLog(`Manage user requested for: ${user.name} (${user.id})`);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    addDebugLog('Manual refresh triggered');
    refetch();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    addDebugLog(`Search query changed: "${value}"`);
  };

  const handleFilterChange = (value: string) => {
    setUserTypeFilter(value);
    addDebugLog(`Filter changed to: ${value}`);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    addDebugLog('User detail modal closed');
    refetch(); // Refresh data when modal closes
  };

  if (error) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <User className="h-5 w-5" />
              User Management - Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-red-600">
              <p className="mb-4">Error loading users: {error.message}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <DebugConsole module="UserManagement" logs={debugLogs} onClear={clearDebugLogs} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Management
            <Button onClick={handleRefresh} variant="outline" size="sm" className="ml-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Search users by name..." 
                value={searchQuery} 
                onChange={(e) => handleSearchChange(e.target.value)} 
              />
            </div>
            <Select value={userTypeFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="standard">Standard Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>User Details</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Child Information</TableHead>
                    <TableHead>Account Info</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users && users.length > 0 ? (
                    users.map((user, index) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                            <div className="text-sm">
                              Quiz: {user.quiz_completed ? '✓ Completed' : '✗ Pending'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{user.email}</div>
                            <div className="text-xs text-muted-foreground">
                              <Badge variant="secondary">Standard</Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.child_name}</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {user.child_gender} {user.child_birthday && `• ${user.child_birthday}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4" />
                            {formatDate(user.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.booking_count}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewBookings(user.id, user.name)}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleManageUser(user)}
                            >
                              <Edit2 className="h-4 w-4" />
                              Manage
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary */}
          {users && users.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Total users: {users.length}
              </div>
              <div className="flex gap-4">
                <span>Quiz Completed: {users.filter(u => u.quiz_completed).length}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Console */}
      <DebugConsole module="UserManagement" logs={debugLogs} onClear={clearDebugLogs} />

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUpdate={refetch}
      />
    </div>
  );
};

export default AdminUserManagement;
