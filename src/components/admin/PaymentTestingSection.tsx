
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, CreditCard, TestTube } from "lucide-react";
import { useTestSalesTransaction } from "@/hooks/useTestSalesTransaction";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { usePremiumBenefits } from "@/hooks/usePremiumBenefits";
import { usePricingLogic } from "@/hooks/usePricingLogic";
import { formatCurrency } from "@/utils/currency";
import { toast } from "sonner";

const PaymentTestingSection = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { sessionPrice } = usePremiumBenefits();
  const { createTestTransaction, isCreating } = useTestSalesTransaction();
  
  const playpathPricing = usePricingLogic();

  const [testScenario, setTestScenario] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<number>(0);

  const testScenarios = [
    {
      id: 'playpath_paid',
      name: 'PlayPath Paid Session',
      description: 'Test paid PlayPath session',
      amount: playpathPricing.price,
      sourceType: 'playpath_session' as const
    },
    {
      id: 'custom',
      name: 'Custom Amount',
      description: 'Test with custom amount',
      amount: customAmount,
      sourceType: 'playpath_session' as const
    }
  ];

  const handleRunTest = async (scenario: typeof testScenarios[0]) => {
    if (!user) {
      toast.error('Please log in to run tests');
      return;
    }

    try {
      await createTestTransaction({
        amount: scenario.amount,
        sourceType: scenario.sourceType,
        paymentStatus: 'completed',
        paymentGatewayId: `test_${scenario.id}_${Date.now()}`
      });
      
      toast.success(`Test completed: ${scenario.name}`);
    } catch (error: any) {
      toast.error(`Test failed: ${error.message}`);
    }
  };

  const getUserStatus = () => {
    if (!profile) return { type: 'Loading...', color: 'gray' };
    
    return {
      type: 'Standard User',
      color: 'blue'
    };
  };

  const userStatus = getUserStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TestTube className="w-6 h-6" />
            Payment Testing Dashboard
          </h2>
          <p className="text-gray-600">Test end-to-end payment flows and transaction tracking</p>
        </div>
        <Badge variant="outline" className={`bg-${userStatus.color}-50 text-${userStatus.color}-700`}>
          {userStatus.type}
        </Badge>
      </div>

      {/* User Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Current User Status
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">User Type</Label>
            <p className="font-medium">Standard</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">PlayPath Pricing</Label>
            <p className="font-medium">
              {playpathPricing.isFree ? 'Free' : formatCurrency(playpathPricing.price)}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Session Price</Label>
            <p className="font-medium">{formatCurrency(sessionPrice)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Session Usage Status */}
      {playpathPricing.sessionUsage && (
        <Card>
          <CardHeader>
            <CardTitle>Session Usage Status</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">PlayPath Sessions</Label>
              <p className="font-medium">
                {playpathPricing.sessionUsage.used_sessions} sessions used
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Test Payment Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Custom Amount Input */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="customAmount">Custom Test Amount (₹)</Label>
              <Input
                id="customAmount"
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label>Test Scenario</Label>
              <Select value={testScenario} onValueChange={setTestScenario}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  {testScenarios.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => {
                  const scenario = testScenarios.find(s => s.id === testScenario);
                  if (scenario) handleRunTest(scenario);
                }}
                disabled={!testScenario || isCreating}
                className="w-full"
              >
                {isCreating ? 'Running...' : 'Run Test'}
              </Button>
            </div>
          </div>

          {/* Quick Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testScenarios.filter(s => s.id !== 'custom').map((scenario) => (
              <Card key={scenario.id} className="border-dashed">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">{scenario.name}</h4>
                    <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-green-600">
                        {scenario.amount === 0 ? 'Free' : formatCurrency(scenario.amount)}
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => handleRunTest(scenario)}
                        disabled={isCreating}
                      >
                        {isCreating ? 'Testing...' : 'Test'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Testing Guidelines */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="w-5 h-5" />
            Testing Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="text-orange-700 space-y-2">
          <p>• All test transactions will appear in the Sales Dashboard</p>
          <p>• Test transactions are marked with "test_" prefix in payment gateway ID</p>
          <p>• Only PlayPath sessions are supported in the simplified system</p>
          <p>• All users are standard users with standard pricing</p>
          <p>• Check the Sales Dashboard after running tests to verify transaction creation</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTestingSection;
