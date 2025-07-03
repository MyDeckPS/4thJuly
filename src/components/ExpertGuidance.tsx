
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Calendar, Star } from "lucide-react";

const ExpertGuidance = () => {
  const guidanceTypes = [{
    icon: BookOpen,
    title: "Learn What Really Matters",
    description: "Quick, clear insights from experts to help you support your child's growth—without overwhelm.",
    features: ["Age-appropriate guidance", "Developmental milestones", "Expert insights"]
  }, {
    icon: Users,
    title: "Ask. Understand. Act.",
    description: "Get personal guidance through 1:1 sessions—tailored to your parenting style and your child's needs.",
    features: ["Personalized advice", "Development assessments", "Ongoing support"]
  }, {
    icon: Calendar,
    title: "You're Not Alone",
    description: "Join live, friendly workshops with real parents and experts. Ask questions, swap stories, and grow together.",
    features: ["Live Q&A sessions", "Small group settings", "Practical strategies"]
  }];

  return (
    <section className="py-20 bg-cream/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-warm-sage">Ask. Understand. Act.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">You care. So do we. Because confident parenting begins with clarity.  Get trusted advice from child development experts—no guesswork needed.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {guidanceTypes.map((type, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-soft-blue rounded-2xl flex items-center justify-center">
                  <type.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">{type.title}</CardTitle>
                <CardDescription className="text-base">{type.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {type.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-warm-sage" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExpertGuidance;
