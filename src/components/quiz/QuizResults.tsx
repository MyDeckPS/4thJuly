import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { RefreshCw, TrendingUp, Award, Target } from "lucide-react";

interface UserTag {
  id: string;
  tag: string;
  confidence_score: number;
  metadata?: any;
}

const QuizResults = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState<UserTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserTags();
    }
  }, [user]);

  const fetchUserTags = async () => {
    try {
      const { data, error } = await supabase
        .from('user_tags')
        .select('*')
        .eq('user_id', user?.id)
        .order('confidence_score', { ascending: false });

      if (error) {
        console.error('Error fetching user tags:', error);
      } else {
        setTags(data || []);
      }
    } catch (error) {
      console.error('Error fetching user tags:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserTags();
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getConfidenceIcon = (score: number) => {
    if (score >= 80) return <Award className="w-3 h-3" />;
    if (score >= 60) return <TrendingUp className="w-3 h-3" />;
    return <Target className="w-3 h-3" />;
  };

  const topTags = tags.slice(0, 3);
  const otherTags = tags.slice(3);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-warm-sage border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Loading your personalized insights...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-forest">Your Child's Profile</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {tags.length > 0 ? (
          <>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Based on your quiz responses, here are the key traits we've identified:
              </p>
              
              {/* Top Traits */}
              {topTags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-forest flex items-center space-x-2">
                    <Award className="w-4 h-4" />
                    <span>Strongest Traits</span>
                  </h4>
                  <div className="grid gap-2">
                    {topTags.map((tag) => (
                      <div 
                        key={tag.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${getConfidenceColor(tag.confidence_score)}`}
                      >
                        <div className="flex items-center space-x-2">
                          {getConfidenceIcon(tag.confidence_score)}
                          <span className="font-medium capitalize">{tag.tag}</span>
                        </div>
                        <Badge variant="secondary" className="bg-white/50">
                          {tag.confidence_score}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Traits */}
              {otherTags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-forest">Additional Traits</h4>
                  <div className="flex flex-wrap gap-2">
                    {otherTags.map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="secondary"
                        className={`${getConfidenceColor(tag.confidence_score)} capitalize`}
                      >
                        {tag.tag} ({tag.confidence_score}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-warm-sage/10 rounded-lg border border-warm-sage/20">
              <h4 className="font-medium text-forest mb-2 flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>What this means:</span>
              </h4>
              <p className="text-sm text-muted-foreground">
                These traits help us recommend the most suitable toys and activities for your child's development. 
                The percentages indicate how strongly each trait was identified based on your responses.
                Higher scores suggest stronger alignment with that developmental area.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No traits identified yet</p>
            <p className="text-sm">Complete the enhanced quiz to see your child's personalized profile!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizResults;
