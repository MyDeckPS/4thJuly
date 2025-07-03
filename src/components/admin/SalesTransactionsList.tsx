
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, MessageSquare, DollarSign, Users, TrendingUp, Calendar } from "lucide-react";
import { useSalesTransactions } from "@/hooks/useSalesTransactions";
import SalesTransactionDetail from "./SalesTransactionDetail";
import { formatCurrency } from "@/utils/currency";

const SalesTransactionsList = () => {
  const { transactions, isLoading, error } = useSalesTransactions();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

  // Calculate summary statistics
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const completedTransactions = transactions.filter(t => t.payment_status === 'completed');
  const monthlyRevenue = transactions
    .filter(t => {
      const transactionDate = new Date(t.created_at);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Sales Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Unable to load sales transactions. Please check your permissions and try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading sales data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground">This Month</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(monthlyRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-muted-foreground">Transactions</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {transactions.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-muted-foreground">Completed</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {completedTransactions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sales ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {transaction.sales_id}
                        </TableCell>
                        <TableCell>
                          {transaction.profiles?.name || 'Unknown Customer'}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {transaction.source_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={transaction.payment_status === 'completed' ? 'default' : 'secondary'}
                          >
                            {transaction.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(transaction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No sales transactions found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SalesTransactionDetail
        transaction={selectedTransaction}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
    </>
  );
};

export default SalesTransactionsList;
