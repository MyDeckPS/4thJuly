
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Calendar, CreditCard, FileText, Plus } from "lucide-react";
import { useSalesNotes } from "@/hooks/useSalesTransactions";
import { format } from "date-fns";

interface SalesTransactionModalProps {
  transaction: any;
}

const SalesTransactionModal = ({ transaction }: SalesTransactionModalProps) => {
  const [newNote, setNewNote] = useState("");
  const { notes, isLoading: notesLoading, addNote } = useSalesNotes(transaction?.id || "");

  console.log("SalesTransactionModal - Transaction data:", transaction);

  if (!transaction) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No transaction data available</p>
      </div>
    );
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await addNote.mutateAsync({ note: newNote.trim() });
      setNewNote("");
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const getSourceTypeDetails = () => {
    const sourceType = transaction.source_type || 'unknown';
    
    switch (sourceType) {
      case 'playpath_session':
        return {
          title: 'PlayPath Session',
          description: transaction.bookings ? 
            `Session on ${format(new Date(transaction.bookings.start_time), 'PPp')}` : 
            'Session booking',
          color: 'bg-blue-100 text-blue-800'
        };
      case 'consultation_session':
        return {
          title: 'Consultation Session',
          description: transaction.bookings ? 
            `Consultation on ${format(new Date(transaction.bookings.start_time), 'PPp')}` : 
            'Consultation booking',
          color: 'bg-purple-100 text-purple-800'
        };
      case 'premium_membership':
        return {
          title: 'Premium Membership',
          description: 'Premium membership subscription',
          color: 'bg-amber-100 text-amber-800'
        };
      default:
        return {
          title: sourceType,
          description: 'Transaction',
          color: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const sourceDetails = getSourceTypeDetails();
  const amount = transaction.amount || 0;
  const salesId = transaction.sales_id || 'N/A';
  const paymentStatus = transaction.payment_status || 'unknown';
  const gatewayId = transaction.payment_gateway_id || 'N/A';
  const customerName = transaction.profiles?.name || 'Unknown Customer';
  const userId = transaction.user_id || 'N/A';
  const bookingId = transaction.booking_id || null;
  const createdAt = transaction.created_at || new Date().toISOString();

  return (
    <div className="space-y-6">
      {/* Transaction Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sales ID:</span>
              <span className="font-medium">{salesId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-bold text-lg">₹{Number(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={paymentStatus === 'completed' ? 'default' : 'secondary'}>
                {paymentStatus}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gateway ID:</span>
              <span className="font-mono text-sm">{gatewayId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{format(new Date(createdAt), 'PPp')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono text-sm">{userId}</span>
            </div>
            {bookingId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="font-mono text-sm">{bookingId}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Purchase Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Purchase Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Badge className={sourceDetails.color}>
              {sourceDetails.title}
            </Badge>
            <span className="text-muted-foreground">{sourceDetails.description}</span>
          </div>
          
          {transaction.payment_gateway_data && Object.keys(transaction.payment_gateway_data).length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Gateway Data:</h4>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(transaction.payment_gateway_data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Transaction Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Transaction Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Note */}
          <div className="space-y-3">
            <Textarea
              placeholder="Add a note about this transaction..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px]"
            />
            <Button 
              onClick={handleAddNote} 
              disabled={!newNote.trim() || addNote.isPending}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {addNote.isPending ? 'Adding...' : 'Add Note'}
            </Button>
          </div>

          <Separator />

          {/* Existing Notes */}
          <div className="space-y-3">
            {notesLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading notes...</div>
            ) : notes.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No notes yet</div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={
                      note.note_type === 'razorpay' ? 'default' :
                      note.note_type === 'system' ? 'secondary' : 'outline'
                    }>
                      {note.note_type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm">{note.note}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesTransactionModal;
