
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Plus, DollarSign, TrendingUp, Users, RefreshCw } from "lucide-react";
import { useSalesTransactions } from "@/hooks/useSalesTransactions";
import { useTestSalesTransaction } from "@/hooks/useTestSalesTransaction";
import SalesTransactionModal from "./SalesTransactionModal";
import { format } from "date-fns";
import { toast } from "sonner";

const AdminSalesSection = () => {
  const { transactions, isLoading, error } = useSalesTransactions();
  const { createTestTransaction, isCreating } = useTestSalesTransaction();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  console.log('AdminSalesSection render - transactions:', transactions);
  console.log('AdminSalesSection render - isLoading:', isLoading);
  console.log('AdminSalesSection render - error:', error);

  const handleCreateTestTransaction = async () => {
    try {
      console.log('Creating test transaction...');
      await createTestTransaction({
        amount: 999,
        sourceType: 'playpath_session',
        paymentStatus: 'completed'
      });
      toast.success("Test transaction created successfully!");
    } catch (error: any) {
      console.error('Failed to create test transaction:', error);
      toast.error(`Failed to create test transaction: ${error.message}`);
    }
  };

  const getSourceTypeLabel = (sourceType: string) => {
    switch (sourceType) {
      case 'playpath_session':
        return 'PlayPath Session';
      default:
        return sourceType;
    }
  };

  const getSourceTypeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'playpath_session':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate summary metrics - all transactions are now PlayPath sessions
  const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const sessionRevenue = totalRevenue; // All revenue is from sessions now

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading sales data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error loading sales data</div>
        <p className="text-muted-foreground text-sm">{error.message || 'Unknown error occurred'}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Dashboard</h2>
          <p className="text-gray-600">Track revenue from PlayPath sessions</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleCreateTestTransaction}
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreating ? "Creating..." : "Test Session"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {transactions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{sessionRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              PlayPath Sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Debug Information */}
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Debug Information</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Total transactions found: {transactions.length}</p>
            <p>Loading state: {isLoading ? 'Loading...' : 'Loaded'}</p>
            <p>Error state: {error ? error.message : 'No errors'}</p>
            <p>Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No sales transactions found</p>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={handleCreateTestTransaction}
                  disabled={isCreating}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isCreating ? "Creating..." : "Test Session"}
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sales ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.sales_id}</TableCell>
                    <TableCell>
                      {transaction.profiles?.name || 'Unknown Customer'}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{Number(transaction.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getSourceTypeColor(transaction.source_type)}>
                        {getSourceTypeLabel(transaction.source_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.payment_status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View More
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Transaction Details - {transaction.sales_id}</DialogTitle>
                          </DialogHeader>
                          <SalesTransactionModal transaction={selectedTransaction} />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSalesSection;
