import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, DollarSign, User, CreditCard, FileText, MessageSquare } from "lucide-react";
import { useSalesNotes } from "@/hooks/useSalesTransactions";
import { formatCurrency } from "@/utils/currency";

interface SalesTransactionDetailProps {
  transaction: any;
  isOpen: boolean;
  onClose: () => void;
}

const SalesTransactionDetail = ({ transaction, isOpen, onClose }: SalesTransactionDetailProps) => {
  const [newNote, setNewNote] = useState("");
  const { notes, addNote } = useSalesNotes(transaction?.id || "");

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await addNote.mutateAsync({ note: newNote.trim() });
      setNewNote("");
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sales Transaction Details - {transaction.sales_id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Transaction Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Sales ID</Label>
                <p className="font-medium">{transaction.sales_id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                <p className="font-medium text-green-600 text-lg">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Source</Label>
                <Badge variant="outline" className="capitalize">
                  {transaction.source_type.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Payment Status</Label>
                <Badge variant={transaction.payment_status === 'completed' ? 'default' : 'secondary'}>
                  {transaction.payment_status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Transaction Date</Label>
                <p className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(transaction.created_at).toLocaleString()}
                </p>
              </div>
              {transaction.payment_gateway_id && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Payment Gateway ID</Label>
                  <p className="font-mono text-sm">{transaction.payment_gateway_id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Customer Name</Label>
                  <p className="font-medium">{transaction.profiles?.name || 'Unknown Customer'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Customer ID</Label>
                  <p className="font-mono text-sm">{transaction.user_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Information (if applicable) */}
          {transaction.bookings && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Booking Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Session Type</Label>
                    <p className="font-medium capitalize">{transaction.bookings.session_type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Session Date</Label>
                    <p>{new Date(transaction.bookings.start_time).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Gateway Data (if available) */}
          {transaction.payment_gateway_data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Gateway Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(transaction.payment_gateway_data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Transaction Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Note */}
              <div className="space-y-2">
                <Label>Add Note</Label>
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter a note about this transaction..."
                  rows={3}
                />
                <Button 
                  onClick={handleAddNote} 
                  disabled={!newNote.trim() || addNote.isPending}
                  size="sm"
                >
                  {addNote.isPending ? 'Adding...' : 'Add Note'}
                </Button>
              </div>

              {/* Existing Notes */}
              {notes.length > 0 ? (
                <div className="space-y-3">
                  <Label>Transaction History</Label>
                  {notes.map((note) => (
                    <div key={note.id} className="border rounded p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">
                          {note.note_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{note.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No notes available for this transaction.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalesTransactionDetail;
