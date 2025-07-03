
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, Download, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useSalesTransactions } from "@/hooks/useSalesTransactions";
import { usePremiumBenefits } from "@/hooks/usePremiumBenefits";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const ManageMembershipPage = () => {
  const { user } = useAuth();
  const { profile, quizResponses } = useProfile();
  const { transactions } = useSalesTransactions();
  const { sessionPrice, loading: benefitsLoading } = usePremiumBenefits();

  // Get actual session usage from the database
  const { data: playpathUsage } = useQuery({
    queryKey: ['playpath-usage', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.rpc('get_playpath_usage', { user_id: user.id });
      if (error) throw error;
      return data[0];
    },
    enabled: !!user
  });

  // Filter PlayPath session transactions
  const sessionTransactions = transactions.filter(t => t.source_type === 'playpath_session');
  const childName = quizResponses.childName || 'your child';

  // Get session counts
  const playPathUsed = playpathUsage?.used_sessions || 0;
  const sessionsLoading = !playpathUsage;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="w-8 h-8 text-warm-sage" />
              <h1 className="text-3xl font-bold text-forest">Session History</h1>
            </div>
            <p className="text-muted-foreground">
              View your PlayPath session history for {childName}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Session Status */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-warm-sage bg-gradient-to-r from-warm-sage/5 to-warm-peach/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-warm-sage" />
                    Session Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Session Type</span>
                      <span className="text-warm-sage font-semibold">PlayPath</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Sessions Completed</span>
                      <span className="text-green-600 font-semibold">{playPathUsed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Price per Session</span>
                      <span className="font-semibold">
                        {benefitsLoading ? 'Loading...' : `₹${sessionPrice.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessionTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {sessionTransactions.slice(0, 5).map(transaction => (
                        <div key={transaction.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <div>
                            <div className="font-medium">₹{transaction.amount}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.payment_status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {transaction.payment_status}
                            </span>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No payment history available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Book New Session</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ready to book your next PlayPath session?
                  </p>
                  <Button className="w-full bg-warm-sage hover:bg-forest" asChild>
                    <Link to="/booking/playpath">Book Session</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Have questions about your sessions? Our support team is here to help.
                  </p>
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ManageMembershipPage;
