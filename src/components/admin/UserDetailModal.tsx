import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit2, Eye, Save, AlertCircle, CheckCircle2, Search, X } from "lucide-react";
import { UserManagementData } from "@/hooks/useUserManagement";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DebugConsole from "@/components/admin/DebugConsole";
import AddProductPurchaseDialog from "@/components/admin/AddProductPurchaseDialog";
import { useUserProductPurchasesByUser } from "@/hooks/useUserProductPurchases";

interface UserDetailModalProps {
  user: UserManagementData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface FixedChildInsight {
  name: string;
  key: string;
  score: number;
}

interface MonthlyScore {
  month: number;
  score: number;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  featured: boolean;
}

interface UserRecommendation {
  id: string;
  product_id: string;
  admin_opinion: string;
  sort_order: number;
  products: Product;
}

const UserDetailModal = ({ user, isOpen, onClose, onUpdate }: UserDetailModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  // Fetch user product purchases
  const { data: userPurchases = [], refetch: refetchPurchases } = useUserProductPurchasesByUser(user?.id);
  
  // Form states with fixed insight types
  const [childInsights, setChildInsights] = useState<FixedChildInsight[]>([
    { name: 'Cognitive', key: 'cognitive_score', score: 0 },
    { name: 'STEM & Robotics', key: 'stem_robotics_score', score: 0 },
    { name: 'Creativity & Imagination', key: 'creativity_imagination_score', score: 0 },
    { name: 'Motor Skill', key: 'motor_skill_score', score: 0 }
  ]);
  const [monthlyScores, setMonthlyScores] = useState<MonthlyScore[]>(
    Array.from({ length: 12 }, (_, i) => ({ month: i + 1, score: 0 }))
  );
  const [expertNotes, setExpertNotes] = useState<string>("");
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [userRecommendations, setUserRecommendations] = useState<UserRecommendation[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showAddPurchaseDialog, setShowAddPurchaseDialog] = useState(false);

  // Original states for change detection
  const [originalChildInsights, setOriginalChildInsights] = useState<FixedChildInsight[]>([
    { name: 'Cognitive', key: 'cognitive_score', score: 0 },
    { name: 'STEM & Robotics', key: 'stem_robotics_score', score: 0 },
    { name: 'Creativity & Imagination', key: 'creativity_imagination_score', score: 0 },
    { name: 'Motor Skill', key: 'motor_skill_score', score: 0 }
  ]);
  const [originalMonthlyScores, setOriginalMonthlyScores] = useState<MonthlyScore[]>(
    Array.from({ length: 12 }, (_, i) => ({ month: i + 1, score: 0 }))
  );
  const [originalExpertNotes, setOriginalExpertNotes] = useState<string>("");
  const [originalRecommendations, setOriginalRecommendations] = useState<UserRecommendation[]>([]);

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
    if (user && isOpen) {
      addDebugLog(`Opening user detail modal for user: ${user.name} (${user.id})`);
      fetchUserDetails();
    }
  }, [user, isOpen]);

  // Check for changes
  useEffect(() => {
    const insightsChanged = JSON.stringify(childInsights) !== JSON.stringify(originalChildInsights);
    const monthlyChanged = JSON.stringify(monthlyScores) !== JSON.stringify(originalMonthlyScores);
    const notesChanged = expertNotes !== originalExpertNotes;
    const recommendationsChanged = JSON.stringify(userRecommendations) !== JSON.stringify(originalRecommendations);
    
    setHasChanges(insightsChanged || monthlyChanged || notesChanged || recommendationsChanged);
  }, [childInsights, monthlyScores, expertNotes, userRecommendations, originalChildInsights, originalMonthlyScores, originalExpertNotes, originalRecommendations]);

  const fetchUserDetails = async () => {
    if (!user) return;
    
    setLoading(true);
    addDebugLog(`Starting fetch of user details for ${user.id}`);
    
    try {
      // Fetch child insights - now with fixed structure and monthly data
      addDebugLog('Fetching child insights...');
      const { data: insights, error: insightsError } = await supabase
        .from('child_insights')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (insightsError && insightsError.code !== 'PGRST116') {
        addDebugLog(`Error fetching child insights: ${insightsError.message}`);
      } else if (insights) {
        const insightsArray: FixedChildInsight[] = [
          { name: 'Cognitive', key: 'cognitive_score', score: insights.cognitive_score || 0 },
          { name: 'STEM & Robotics', key: 'stem_robotics_score', score: insights.stem_robotics_score || 0 },
          { name: 'Creativity & Imagination', key: 'creativity_imagination_score', score: insights.creativity_imagination_score || 0 },
          { name: 'Motor Skill', key: 'motor_skill_score', score: insights.motor_skill_score || 0 }
        ];
        setChildInsights(insightsArray);
        setOriginalChildInsights(JSON.parse(JSON.stringify(insightsArray)));

        // Load monthly scores
        const monthlyData: MonthlyScore[] = Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          score: insights[`month_${i + 1}_score`] || 0
        }));
        setMonthlyScores(monthlyData);
        setOriginalMonthlyScores(JSON.parse(JSON.stringify(monthlyData)));
        
        addDebugLog(`Child insights loaded: ${insightsArray.length} insights and 12 monthly scores`);
      } else {
        addDebugLog('No child insights found, using default values');
        const defaultInsights: FixedChildInsight[] = [
          { name: 'Cognitive', key: 'cognitive_score', score: 0 },
          { name: 'STEM & Robotics', key: 'stem_robotics_score', score: 0 },
          { name: 'Creativity & Imagination', key: 'creativity_imagination_score', score: 0 },
          { name: 'Motor Skill', key: 'motor_skill_score', score: 0 }
        ];
        setChildInsights(defaultInsights);
        setOriginalChildInsights(JSON.parse(JSON.stringify(defaultInsights)));

        const defaultMonthly: MonthlyScore[] = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, score: 0 }));
        setMonthlyScores(defaultMonthly);
        setOriginalMonthlyScores(JSON.parse(JSON.stringify(defaultMonthly)));
      }

      // Fetch expert notes - only active one per user
      addDebugLog('Fetching expert notes...');
      const { data: notes, error: notesError } = await supabase
        .from('expert_notes')
        .select('content')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (notesError && notesError.code !== 'PGRST116') {
        addDebugLog(`Error fetching expert notes: ${notesError.message}`);
      } else if (notes) {
        setExpertNotes(notes.content);
        setOriginalExpertNotes(notes.content);
        addDebugLog('Expert notes loaded');
      } else {
        addDebugLog('No expert notes found');
        setExpertNotes("");
        setOriginalExpertNotes("");
      }

      // Fetch user bookings
      addDebugLog('Fetching user bookings...');
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        addDebugLog(`Error fetching bookings: ${bookingsError.message}`);
      } else {
        setUserBookings(bookings || []);
        addDebugLog(`Bookings loaded: ${bookings?.length || 0} bookings`);
      }

      // Fetch user recommendations
      addDebugLog('Fetching user recommendations...');
      const { data: recommendations, error: recommendationsError } = await supabase
        .from('user_recommendations')
        .select(`
          id,
          product_id,
          admin_opinion,
          sort_order,
          products (
            id,
            title,
            description,
            price,
            featured
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (recommendationsError) {
        addDebugLog(`Error fetching recommendations: ${recommendationsError.message}`);
      } else {
        setUserRecommendations(recommendations || []);
        setOriginalRecommendations(JSON.parse(JSON.stringify(recommendations || [])));
        addDebugLog(`Recommendations loaded: ${recommendations?.length || 0} recommendations`);
      }

      // Fetch available products for recommendations
      addDebugLog('Fetching available products...');
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, title, description, price, featured')
        .eq('published', true)
        .order('title', { ascending: true });

      if (productsError) {
        addDebugLog(`Error fetching products: ${productsError.message}`);
      } else {
        setAvailableProducts(products || []);
        addDebugLog(`Products loaded: ${products?.length || 0} products`);
      }

    } catch (error) {
      addDebugLog(`Unexpected error in fetchUserDetails: ${error}`);
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAllData = async () => {
    if (!user) return;

    setLoading(true);
    addDebugLog('Starting batch update of all user data');

    try {
      let hasErrors = false;

      // Update child insights - UPSERT with fixed structure and monthly data
      if (JSON.stringify(childInsights) !== JSON.stringify(originalChildInsights) ||
          JSON.stringify(monthlyScores) !== JSON.stringify(originalMonthlyScores)) {
        addDebugLog('Updating child insights and monthly scores...');
        const insightData = {
          user_id: user.id,
          cognitive_score: childInsights.find(i => i.key === 'cognitive_score')?.score || 0,
          stem_robotics_score: childInsights.find(i => i.key === 'stem_robotics_score')?.score || 0,
          creativity_imagination_score: childInsights.find(i => i.key === 'creativity_imagination_score')?.score || 0,
          motor_skill_score: childInsights.find(i => i.key === 'motor_skill_score')?.score || 0,
          // Add monthly scores
          ...monthlyScores.reduce((acc, { month, score }) => {
            acc[`month_${month}_score`] = score;
            return acc;
          }, {} as Record<string, number>)
        };

        const { error: insightsError } = await supabase
          .from('child_insights')
          .upsert(insightData, {
            onConflict: 'user_id'
          });

        if (insightsError) {
          addDebugLog(`Error updating child insights: ${insightsError.message}`);
          hasErrors = true;
        } else {
          addDebugLog('Child insights and monthly scores updated successfully');
        }
      }

      // Update expert notes - Deactivate existing and create new
      if (expertNotes !== originalExpertNotes) {
        addDebugLog('Updating expert notes...');
        if (expertNotes.trim()) {
          // First, deactivate any existing active notes
          const { error: deactivateError } = await supabase
            .from('expert_notes')
            .update({ is_active: false })
            .eq('user_id', user.id)
            .eq('is_active', true);

          if (deactivateError) {
            addDebugLog(`Error deactivating old expert notes: ${deactivateError.message}`);
            hasErrors = true;
          } else {
            // Then insert new note
            const { error: insertError } = await supabase
              .from('expert_notes')
              .insert({
                user_id: user.id,
                content: expertNotes,
                is_active: true
              });

            if (insertError) {
              addDebugLog(`Error inserting new expert notes: ${insertError.message}`);
              hasErrors = true;
            } else {
              addDebugLog('Expert notes updated successfully');
            }
          }
        }
      }

      if (!hasErrors) {
        toast({
          title: "Success",
          description: "All user data updated successfully",
        });
        addDebugLog('All updates completed successfully');
        
        // Update original states
        setOriginalChildInsights(JSON.parse(JSON.stringify(childInsights)));
        setOriginalMonthlyScores(JSON.parse(JSON.stringify(monthlyScores)));
        setOriginalExpertNotes(expertNotes);
        setOriginalRecommendations(JSON.parse(JSON.stringify(userRecommendations)));
        
        onUpdate();
      } else {
        toast({
          title: "Partial Success",
          description: "Some updates failed. Check debug logs for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      addDebugLog(`Unexpected error in updateAllData: ${error}`);
      toast({
        title: "Error",
        description: "Failed to update user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateInsight = (index: number, value: number) => {
    const updated = [...childInsights];
    updated[index] = { ...updated[index], score: value };
    setChildInsights(updated);
    addDebugLog(`Updated insight ${updated[index].name}: score = ${value}`);
  };

  const updateMonthlyScore = (month: number, score: number) => {
    const updated = monthlyScores.map(item => 
      item.month === month ? { ...item, score } : item
    );
    setMonthlyScores(updated);
    addDebugLog(`Updated Month ${month}: score = ${score}`);
  };

  const addProductRecommendation = async (product: Product) => {
    if (!user) return;

    addDebugLog(`Adding product recommendation: ${product.title}`);
    
    try {
      const { error } = await supabase
        .from('user_recommendations')
        .insert({
          user_id: user.id,
          product_id: product.id,
          admin_opinion: "",
          sort_order: userRecommendations.length,
          is_active: true
        });

      if (error) {
        addDebugLog(`Error adding recommendation: ${error.message}`);
        toast({
          title: "Error",
          description: "Failed to add product recommendation",
          variant: "destructive",
        });
      } else {
        addDebugLog('Product recommendation added successfully');
        fetchUserDetails(); // Refresh data
        setShowProductSearch(false);
        setProductSearchQuery("");
      }
    } catch (error) {
      addDebugLog(`Unexpected error adding recommendation: ${error}`);
    }
  };

  const removeProductRecommendation = async (recommendationId: string) => {
    addDebugLog(`Removing product recommendation: ${recommendationId}`);
    
    try {
      const { error } = await supabase
        .from('user_recommendations')
        .delete()
        .eq('id', recommendationId);

      if (error) {
        addDebugLog(`Error removing recommendation: ${error.message}`);
        toast({
          title: "Error",
          description: "Failed to remove product recommendation",
          variant: "destructive",
        });
      } else {
        addDebugLog('Product recommendation removed successfully');
        fetchUserDetails(); // Refresh data
      }
    } catch (error) {
      addDebugLog(`Unexpected error removing recommendation: ${error}`);
    }
  };

  const updateRecommendationOpinion = async (recommendationId: string, opinion: string) => {
    addDebugLog(`Updating recommendation opinion: ${recommendationId}`);
    
    try {
      const { error } = await supabase
        .from('user_recommendations')
        .update({ admin_opinion: opinion })
        .eq('id', recommendationId);

      if (error) {
        addDebugLog(`Error updating recommendation opinion: ${error.message}`);
        toast({
          title: "Error",
          description: "Failed to update recommendation opinion",
          variant: "destructive",
        });
      } else {
        addDebugLog('Recommendation opinion updated successfully');
        // Update local state
        setUserRecommendations(prev => 
          prev.map(rec => 
            rec.id === recommendationId 
              ? { ...rec, admin_opinion: opinion }
              : rec
          )
        );
      }
    } catch (error) {
      addDebugLog(`Unexpected error updating recommendation opinion: ${error}`);
    }
  };

  const filteredProducts = availableProducts.filter(product => 
    product.title.toLowerCase().includes(productSearchQuery.toLowerCase()) &&
    !userRecommendations.some(rec => rec.product_id === product.id)
  );

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Manage User: {user?.name}</span>
            <Button 
              onClick={updateAllData} 
              disabled={!hasChanges || loading}
              className={`${hasChanges ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {loading ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : hasChanges ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Customer
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  No Changes
                </>
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Child Insights</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Progress</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>User ID</Label>
                    <Input value={user?.id || ''} readOnly />
                  </div>
                  <div>
                    <Label>Name</Label>
                    <Input value={user?.name || ''} readOnly />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email || ''} readOnly />
                  </div>
                  <div>
                    <Label>Membership Type</Label>
                    <Badge variant="secondary">Standard</Badge>
                  </div>
                  <div>
                    <Label>Created Date</Label>
                    <Input value={user ? new Date(user.created_at).toLocaleString() : ''} readOnly />
                  </div>
                  <div>
                    <Label>Quiz Status</Label>
                    <Badge variant={user?.quiz_completed ? 'default' : 'destructive'}>
                      {user?.quiz_completed ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Child Information</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Input placeholder="Child Name" value={user?.child_name || ''} readOnly />
                    <Input placeholder="Gender" value={user?.child_gender || ''} readOnly />
                    <Input placeholder="Birthday" value={user?.child_birthday || ''} readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Child Insights (Fixed Categories)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {childInsights.map((insight, index) => (
                  <div key={insight.key} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="flex-1 font-medium">{insight.name}</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={insight.score}
                        onChange={(e) => updateInsight(index, parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground w-8">%</span>
                    </div>
                    <div className="space-y-1">
                      <Badge variant="outline" className="rounded-full">{insight.name}</Badge>
                      <Progress value={insight.score} className="h-3 rounded-full" />
                      <span className="text-sm text-muted-foreground">{insight.score}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expert Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={expertNotes}
                  onChange={(e) => setExpertNotes(e.target.value)}
                  placeholder="Enter expert notes..."
                  rows={6}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {monthlyScores.map(({ month, score }) => (
                    <div key={month} className="space-y-2">
                      <Label className="text-sm font-medium">Month {month}</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(e) => updateMonthlyScore(month, parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                      <div className="text-xs text-muted-foreground text-center">{score}%</div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Monthly progress scores help track the child's development over time.</p>
                  <p>Month 1 starts from the user's signup date.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Super Recommendations
                  <Button onClick={() => setShowProductSearch(!showProductSearch)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {showProductSearch && (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Search className="h-4 w-4" />
                      <Input
                        placeholder="Search products..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowProductSearch(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {filteredProducts.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{product.title}</p>
                            <p className="text-sm text-muted-foreground">${product.price}</p>
                          </div>
                          <Button size="sm" onClick={() => addProductRecommendation(product)}>
                            Add
                          </Button>
                        </div>
                      ))}
                      {filteredProducts.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No products found</p>
                      )}
                    </div>
                  </div>
                )}

                {userRecommendations.length > 0 ? (
                  <div className="space-y-4">
                    {userRecommendations.map((recommendation) => (
                      <div key={recommendation.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{recommendation.products.title}</h4>
                            <p className="text-sm text-muted-foreground">${recommendation.products.price}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeProductRecommendation(recommendation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label>Admin Opinion</Label>
                          <Textarea
                            value={recommendation.admin_opinion || ''}
                            onChange={(e) => updateRecommendationOpinion(recommendation.id, e.target.value)}
                            placeholder="Enter your opinion about this product for this user..."
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No recommendations added yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Product Purchases ({userPurchases.length})
                  <Button onClick={() => setShowAddPurchaseDialog(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Purchase
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userPurchases.length > 0 ? (
                  <div className="space-y-3">
                    {userPurchases.map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{purchase.products?.title}</p>
                            <Badge className={
                              purchase.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                              purchase.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {purchase.verification_status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>₹{purchase.purchase_price || purchase.products?.price || 0}</span>
                            <span>•</span>
                            <span>{new Date(purchase.purchase_date).toLocaleDateString()}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {purchase.purchase_source === 'amazon_affiliate' ? 'Amazon' : 'Manual'}
                            </Badge>
                          </div>
                          {purchase.admin_notes && (
                            <p className="text-sm text-gray-500 mt-1 italic">"{purchase.admin_notes}"</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">
                            ₹{purchase.products?.price}
                          </Badge>
                          <p className="text-xs text-gray-500">List Price</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No product purchases found for this user</p>
                    <Button onClick={() => setShowAddPurchaseDialog(true)} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Purchase
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Bookings ({userBookings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {userBookings.length > 0 ? (
                  <div className="space-y-2">
                    {userBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{booking.session_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.start_time).toLocaleString()}
                          </p>
                          <Badge variant="outline">{booking.booking_status}</Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Session
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No bookings found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Debug Console */}
        <DebugConsole 
          module={`UserDetail-${user.name}`} 
          logs={debugLogs} 
          onClear={clearDebugLogs} 
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>

      {/* Add Product Purchase Dialog */}
      <AddProductPurchaseDialog
        isOpen={showAddPurchaseDialog}
        onClose={() => {
          setShowAddPurchaseDialog(false);
          refetchPurchases(); // Refresh purchases when dialog closes
        }}
        preselectedUserId={user?.id}
      />
    </Dialog>
  );
};

export default UserDetailModal;
