
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Sparkles, Target, CheckCircle, Star } from "lucide-react";
import { useUserRecommendations } from "@/hooks/useDevelopmentalData";
import { useProfile } from "@/hooks/useProfile";
import { usePremiumBenefits } from "@/hooks/usePremiumBenefits";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const PremiumPerks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { sessionPrice } = usePremiumBenefits();
  const {
    data: recommendations,
    isLoading: recommendationsLoading
  } = useUserRecommendations();

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

  const hasRecommendations = recommendations && recommendations.length > 0;

  // Get session counts
  const playPathUsed = playpathUsage?.used_sessions || 0;

  // Determine the curated toys card content based on recommendations
  const getCuratedToysCard = () => {
    if (recommendationsLoading) {
      return {
        description: 'Loading recommendations...',
        action: 'Loading...',
        route: '#',
        hasShine: false
      };
    }
    if (hasRecommendations) {
      const recommendationCount = Math.min(recommendations.length, 4);
      return {
        description: `${recommendationCount} handpicked recommendation${recommendationCount > 1 ? 's' : ''}`,
        action: 'View Recommendations',
        route: '/child-insights',
        hasShine: true
      };
    }
    return {
      description: 'Our team is curating products',
      action: 'Coming Soon',
      route: '#',
      hasShine: false
    };
  };

  const curatedToysData = getCuratedToysCard();

  const perks = [
    {
      id: 'playpath',
      icon: Calendar,
      title: 'PlayPath Sessions',
      description: `${playPathUsed} sessions completed`,
      status: 'available',
      action: 'Book Session',
      route: '/booking/playpath',
      hasShine: false
    },
    {
      id: 'personalized',
      icon: Sparkles,
      title: 'Personalized Recommendations',
      description: 'AI-powered suggestions available',
      status: 'available',
      action: 'Get Recommendations',
      route: '/recommendations/personalized',
      hasShine: false
    },
    {
      id: 'curated',
      icon: Target,
      title: 'Expert-Curated Toys',
      description: curatedToysData.description,
      status: hasRecommendations ? 'available' : 'pending',
      action: curatedToysData.action,
      route: curatedToysData.route,
      hasShine: curatedToysData.hasShine
    }
  ];

  const handlePerkClick = (perk: typeof perks[0]) => {
    if (perk.route !== '#') {
      navigate(perk.route);
    }
  };

  if (!playpathUsage) {
    return (
      <Card className="bg-gradient-to-r from-warm-sage/5 to-warm-peach/5 border-0">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-warm-sage border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading perks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-warm-sage/5 to-warm-peach/5 border-0">
      <CardContent className="p-4 sm:p-6 bg-emerald-50 rounded-3xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎯</span>
          <h3 className="text-lg font-semibold text-forest">Available Features</h3>
        </div>
        
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {perks.map(perk => (
            <div
              key={perk.id}
              className={`relative flex-shrink-0 w-64 sm:w-72 bg-white rounded-lg p-4 shadow-sm border border-warm-peach/20 cursor-pointer hover:shadow-md transition-shadow ${perk.hasShine ? 'animate-pulse' : ''}`}
              onClick={() => handlePerkClick(perk)}
            >
              {/* Shine effect for recommendations */}
              {perk.hasShine && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent animate-shimmer pointer-events-none"></div>
              )}
              
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-warm rounded-lg flex items-center justify-center flex-shrink-0 bg-rose-600">
                  <perk.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-forest text-sm truncate">
                    {perk.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {perk.description}
                  </p>
                </div>
                {perk.hasShine && <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  perk.status === 'available' ? 'bg-warm-sage/10 text-warm-sage' : 
                  perk.status === 'pending' ? 'bg-gray-100 text-gray-600' : 
                  'bg-gray-100 text-gray-600'
                } ${perk.hasShine ? 'bg-yellow-100 text-yellow-700 font-medium' : ''}`}>
                  {perk.action}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-white/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            PlayPath sessions available at ₹{sessionPrice} per session • Welcome offer for new users
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumPerks;
