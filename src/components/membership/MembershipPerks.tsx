
import { Card, CardContent } from "@/components/ui/card";
import { 
  Phone, 
  Percent, 
  Brain, 
  TrendingUp, 
  Calendar, 
  BookOpen,
  Target,
  Headphones
} from "lucide-react";

const MembershipPerks = () => {
  const perks = [
    {
      icon: Phone,
      title: "Priority Expert Sessions",
      description: "Skip the wait and get instant access to child development experts for personalized guidance.",
      highlight: "Available 24/7"
    },
    {
      icon: Percent,
      title: "Exclusive Toy Discounts",
      description: "Save up to 30% on premium educational toys from our curated marketplace.",
      highlight: "Up to 30% off"
    },
    {
      icon: Brain,
      title: "Advanced Developmental Insights",
      description: "Get detailed analytics on your child's progress with AI-powered recommendations.",
      highlight: "AI-Powered"
    },
    {
      icon: TrendingUp,
      title: "Detailed Progress Tracking",
      description: "Monitor your child's growth with comprehensive reports and milestone tracking.",
      highlight: "Monthly Reports"
    },
    {
      icon: Target,
      title: "Personalized Learning Roadmaps",
      description: "Custom development plans tailored to your child's unique learning style and goals.",
      highlight: "100% Personalized"
    },
    {
      icon: BookOpen,
      title: "Premium Content Library",
      description: "Access exclusive articles, videos, and resources from top child development experts.",
      highlight: "500+ Resources"
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Book sessions at your convenience with our easy-to-use scheduling system.",
      highlight: "24/7 Booking"
    },
    {
      icon: Headphones,
      title: "Priority Support",
      description: "Get faster responses and dedicated support from our customer success team.",
      highlight: "< 2hr Response"
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-forest mb-4">
            Everything You Need for Your Child's Development
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            MyDeck Club gives you the tools, insights, and expert support to maximize your child's potential
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {perks.map((perk, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-warm rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <perk.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-warm-peach text-forest text-xs px-2 py-1 rounded-full font-medium">
                    {perk.highlight}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-forest mb-2">{perk.title}</h3>
                <p className="text-muted-foreground">{perk.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MembershipPerks;
