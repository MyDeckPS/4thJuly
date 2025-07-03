
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Mother of 4-year-old Emma",
      content: "MyDeck Plus transformed how I understand my daughter's development. The expert consultations gave me confidence in choosing the right activities and toys.",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Father of 6-year-old Alex",
      content: "The personalized learning roadmap helped Alex excel in areas we never thought possible. The progress tracking is incredible!",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Lisa Rodriguez",
      role: "Mother of twins, age 3",
      content: "Having access to expert guidance 24/7 is a game-changer. The insights help me support both my children's unique development needs.",
      rating: 5,
      avatar: "LR"
    },
    {
      name: "David Thompson",
      role: "Father of 5-year-old Maya",
      content: "The toy recommendations are spot-on, and the discounts make premium educational toys affordable. Maya loves her new STEM kits!",
      rating: 5,
      avatar: "DT"
    }
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-forest mb-4">
            Trusted by Thousands of Parents
          </h2>
          <p className="text-xl text-muted-foreground">
            See how MyDeck Plus is helping families unlock their children's potential
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-warm-sage mb-4 opacity-50" />
                
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warm-sage text-warm-sage" />
                  ))}
                </div>
                
                <p className="text-foreground mb-6 italic">"{testimonial.content}"</p>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-warm rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-forest">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
